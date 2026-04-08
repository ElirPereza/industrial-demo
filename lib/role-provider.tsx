"use client"

import type { User } from "@supabase/supabase-js"
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react"
import type { RolUsuario } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

type ProfileSummary = {
	nombre: string
	email: string
	rol: RolUsuario
	departamento: string
}

interface RoleContextValue {
	role: RolUsuario
	setRole: (role: RolUsuario) => void
	user: User | null
	profile: ProfileSummary | null
	signOut: () => Promise<void>
	isLoading: boolean
}

const RoleContext = createContext<RoleContextValue | null>(null)

const VALID_ROLES: RolUsuario[] = [
	"admin",
	"supervisor",
	"tecnico",
	"contratista",
]

function normalizeRole(
	role: string | null | undefined,
	fallback: RolUsuario,
): RolUsuario {
	if (role && VALID_ROLES.includes(role as RolUsuario)) {
		return role as RolUsuario
	}

	return fallback
}

function buildFallbackProfile(
	user: User,
	fallbackRole: RolUsuario,
): ProfileSummary {
	return {
		nombre: user.email?.split("@")[0] ?? "Usuario",
		email: user.email ?? "",
		rol: fallbackRole,
		departamento: "Sin departamento",
	}
}

export function RoleProvider({
	children,
	defaultRole = "tecnico",
}: {
	children: ReactNode
	defaultRole?: RolUsuario
}) {
	const supabase = useMemo(() => createClient(), [])
	const [role, setRoleState] = useState<RolUsuario>(defaultRole)
	const [user, setUser] = useState<User | null>(null)
	const [profile, setProfile] = useState<ProfileSummary | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	const syncSessionState = useCallback(
		async (currentUser: User | null) => {
			if (!currentUser) {
				setUser(null)
				setProfile(null)
				setRoleState(defaultRole)
				setIsLoading(false)
				return
			}

			setUser(currentUser)

			const { data, error } = await supabase
				.from("profiles")
				.select("nombre, email, rol, departamento")
				.eq("id", currentUser.id)
				.maybeSingle()

			if (error || !data) {
				const fallbackProfile = buildFallbackProfile(currentUser, defaultRole)
				setProfile(fallbackProfile)
				setRoleState(fallbackProfile.rol)
				setIsLoading(false)
				return
			}

			const nextRole = normalizeRole(data.rol, defaultRole)
			setProfile({
				nombre: data.nombre,
				email: data.email,
				rol: nextRole,
				departamento: data.departamento,
			})
			setRoleState(nextRole)
			setIsLoading(false)
		},
		[defaultRole, supabase],
	)

	useEffect(() => {
		let isActive = true

		const loadSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession()

			if (!isActive) {
				return
			}

			await syncSessionState(session?.user ?? null)
		}

		void loadSession()

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			void syncSessionState(session?.user ?? null)
		})

		return () => {
			isActive = false
			subscription.unsubscribe()
		}
	}, [supabase, syncSessionState])

	const setRole = useCallback((r: RolUsuario) => {
		setRoleState(r)
		setProfile((currentProfile) =>
			currentProfile
				? {
						...currentProfile,
						rol: r,
					}
				: currentProfile,
		)
	}, [])

	const signOut = useCallback(async () => {
		await supabase.auth.signOut()
		setUser(null)
		setProfile(null)
		setRoleState(defaultRole)
	}, [defaultRole, supabase])

	const value = useMemo(
		() => ({ role, setRole, user, profile, signOut, isLoading }),
		[profile, role, setRole, signOut, user, isLoading],
	)

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
			</div>
		)
	}

	return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole(): RoleContextValue {
	const ctx = useContext(RoleContext)
	if (!ctx) {
		throw new Error("useRole must be used within a RoleProvider")
	}
	return ctx
}
