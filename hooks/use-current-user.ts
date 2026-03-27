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

export function useCurrentUser() {
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

	return { user, loading }
}
