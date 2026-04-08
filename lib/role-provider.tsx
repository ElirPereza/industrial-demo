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
import type { RolUsuario } from "@/lib/mock-data"
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
	defaultRole = "admin",
}: {
	children: ReactNode
	defaultRole?: RolUsuario
}) {
	const supabase = useMemo(() => createClient(), [])
	const [role, setRoleState] = useState<RolUsuario>(defaultRole)
	const [user, setUser] = useState<User | null>(null)
	const [profile, setProfile] = useState<ProfileSummary | null>(null)

	const syncSessionState = useCallback(
		async (currentUser: User | null) => {
			if (!currentUser) {
				setUser(null)
				setProfile(null)
				setRoleState(defaultRole)
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
		() => ({ role, setRole, user, profile, signOut }),
		[profile, role, setRole, signOut, user],
	)

	return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole(): RoleContextValue {
	const ctx = useContext(RoleContext)
	if (!ctx) {
		throw new Error("useRole must be used within a RoleProvider")
	}
	return ctx
}
