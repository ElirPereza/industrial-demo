"use client"

import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react"
import { createClient } from "@/lib/supabase/client"

export type UserProfile = {
	id: string
	user_id: string
	nombre: string
	email: string
	rol: "admin" | "supervisor" | "tecnico"
	departamento: string | null
}

type UserContextType = {
	user: UserProfile | null
	loading: boolean
}

const UserContext = createContext<UserContextType>({
	user: null,
	loading: true,
})

export function UserProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<UserProfile | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function fetchUser() {
			const supabase = createClient()
			const {
				data: { user: authUser },
			} = await supabase.auth.getUser()
			if (!authUser) {
				setLoading(false)
				return
			}

			const { data } = await supabase
				.from("perfiles")
				.select("*")
				.eq("user_id", authUser.id)
				.single()

			if (data) setUser(data as UserProfile)
			setLoading(false)
		}
		fetchUser()
	}, [])

	return (
		<UserContext.Provider value={{ user, loading }}>
			{children}
		</UserContext.Provider>
	)
}

export function useUser() {
	return useContext(UserContext)
}

export function clearCachedUser() {
	// No-op — kept for nav-user import compatibility
}
