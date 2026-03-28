"use server"

import { revalidateTag } from "next/cache"
import { createClient, getUser } from "@/lib/supabase/server"
import type { ActionResult } from "@/lib/types"

export type Perfil = {
	id: string
	user_id: string
	nombre: string
	email: string
	rol: "admin" | "supervisor" | "tecnico"
	departamento: string | null
	created_at: string
	updated_at: string
}

export async function getUsuarios(): Promise<ActionResult<Perfil[]>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { data, error } = await supabase
		.from("perfiles")
		.select("*")
		.order("nombre")

	if (error) return { success: false, error: error.message }
	return { success: true, data: (data ?? []) as Perfil[] }
}

export async function getCurrentUser(): Promise<ActionResult<Perfil>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { data, error } = await supabase
		.from("perfiles")
		.select("*")
		.eq("user_id", user.id)
		.single()

	if (error) return { success: false, error: error.message }
	return { success: true, data: data as Perfil }
}

export async function getUsuarioById(
	id: string,
): Promise<ActionResult<Perfil>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { data, error } = await supabase
		.from("perfiles")
		.select("*")
		.eq("id", id)
		.single()

	if (error) return { success: false, error: error.message }
	return { success: true, data: data as Perfil }
}

export async function updatePerfil(
	id: string,
	input: {
		nombre?: string
		departamento?: string
	},
): Promise<ActionResult<Perfil>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { data, error } = await supabase
		.from("perfiles")
		.update(input)
		.eq("id", id)
		.select()
		.single()

	if (error) return { success: false, error: error.message }
	revalidateTag("perfil", "max")
	return { success: true, data: data as Perfil }
}

export type UserPreferences = {
	notifEmail: boolean
	notifPush: boolean
	notifFormularios: boolean
	notifEquipos: boolean
	notifReportes: boolean
	tema: "light" | "dark" | "system"
	idioma: string
	formatoFecha: string
	keepSessionActive: boolean
}

const DEFAULT_PREFERENCES: UserPreferences = {
	notifEmail: true,
	notifPush: true,
	notifFormularios: true,
	notifEquipos: false,
	notifReportes: true,
	tema: "system",
	idioma: "es",
	formatoFecha: "DD/MM/YYYY",
	keepSessionActive: true,
}

export async function getPreferences(): Promise<ActionResult<UserPreferences>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }
	const prefs = user.user_metadata?.preferences as UserPreferences | undefined
	return { success: true, data: { ...DEFAULT_PREFERENCES, ...prefs } }
}

export async function savePreferences(
	prefs: UserPreferences,
): Promise<ActionResult<UserPreferences>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }
	const supabase = await createClient()
	const { error } = await supabase.auth.updateUser({
		data: { preferences: prefs },
	})
	if (error) return { success: false, error: error.message }
	return { success: true, data: prefs }
}
