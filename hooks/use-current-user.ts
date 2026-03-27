"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export type UserProfile = {
	id: string
	user_id: string
	nombre: string
	email: string
	rol: "admin" | "supervisor" | "tecnico"
	departamento: string | null
}

// Cache in memory so sidebar doesn't flicker between navigations
let cachedUser: UserProfile | null = null

export function useCurrentUser() {
	const [user, setUser] = useState<UserProfile | null>(cachedUser)
	const [loading, setLoading] = useState(!cachedUser)

	useEffect(() => {
		if (cachedUser) {
			setUser(cachedUser)
			setLoading(false)
			return
		}

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

			if (data) {
				cachedUser = data as UserProfile
				setUser(cachedUser)
			}
			setLoading(false)
		}
		fetchUser()
	}, [])

	return { user, loading }
}

export function clearUserCache() {
	cachedUser = null
}
