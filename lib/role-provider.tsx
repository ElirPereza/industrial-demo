"use client"

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react"
import type { RolUsuario } from "@/lib/mock-data"

interface RoleContextValue {
	role: RolUsuario
	setRole: (role: RolUsuario) => void
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({
	children,
	defaultRole = "admin",
}: {
	children: ReactNode
	defaultRole?: RolUsuario
}) {
	const [role, setRoleState] = useState<RolUsuario>(defaultRole)

	const setRole = useCallback((r: RolUsuario) => {
		setRoleState(r)
	}, [])

	const value = useMemo(() => ({ role, setRole }), [role, setRole])

	return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole(): RoleContextValue {
	const ctx = useContext(RoleContext)
	if (!ctx) {
		throw new Error("useRole must be used within a RoleProvider")
	}
	return ctx
}
