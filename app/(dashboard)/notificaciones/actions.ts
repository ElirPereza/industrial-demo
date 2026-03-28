"use server"

import { createClient, getUser } from "@/lib/supabase/server"
import type { ActionResult } from "@/lib/types"

export type Notificacion = {
	id: string
	user_id: string
	tipo: "nuevo_formulario" | "alerta_equipo" | "reporte_semanal" | "sistema"
	titulo: string
	mensaje: string
	leida: boolean
	metadata: Record<string, unknown> | null
	created_at: string
}

export async function getNotificaciones(): Promise<ActionResult<Notificacion[]>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { data, error } = await supabase
		.from("notificaciones")
		.select("*")
		.eq("user_id", user.id)
		.order("created_at", { ascending: false })
		.limit(50)

	if (error) return { success: false, error: error.message }
	return { success: true, data: (data ?? []) as Notificacion[] }
}

export async function getUnreadCount(): Promise<ActionResult<number>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { count, error } = await supabase
		.from("notificaciones")
		.select("*", { count: "exact", head: true })
		.eq("user_id", user.id)
		.eq("leida", false)

	if (error) return { success: false, error: error.message }
	return { success: true, data: count ?? 0 }
}

export async function markAsRead(id: string): Promise<ActionResult<void>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { error } = await supabase
		.from("notificaciones")
		.update({ leida: true })
		.eq("id", id)
		.eq("user_id", user.id)

	if (error) return { success: false, error: error.message }
	return { success: true, data: undefined }
}

export async function markAllAsRead(): Promise<ActionResult<void>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { error } = await supabase
		.from("notificaciones")
		.update({ leida: true })
		.eq("user_id", user.id)
		.eq("leida", false)

	if (error) return { success: false, error: error.message }
	return { success: true, data: undefined }
}

export async function createNotificacion(input: {
	userIds: string[]
	tipo: "nuevo_formulario" | "alerta_equipo" | "reporte_semanal" | "sistema"
	titulo: string
	mensaje: string
	metadata?: Record<string, unknown>
}): Promise<void> {
	if (input.userIds.length === 0) return

	const supabase = await createClient()
	const rows = input.userIds.map((userId) => ({
		user_id: userId,
		tipo: input.tipo,
		titulo: input.titulo,
		mensaje: input.mensaje,
		metadata: input.metadata ?? null,
	}))

	await supabase.from("notificaciones").insert(rows)
}

export async function getPerfilesConRol(roles: string[]): Promise<string[]> {
	const supabase = await createClient()
	const { data } = await supabase
		.from("perfiles")
		.select("user_id")
		.in("rol", roles)

	return (data ?? []).map((p: { user_id: string }) => p.user_id)
}
