"use server"

import { revalidateTag } from "next/cache"
import { createClient, getUser } from "@/lib/supabase/server"
import type { ActionResult } from "@/lib/types"

// Types based on DB schema (will be replaced by generated types after T8)
export type RegistroMantenimiento = {
	id: string
	equipo_id: string
	tipo: "inspeccion" | "reporte_fallas" | "preventivo" | "correctivo"
	descripcion: string
	tecnico_id: string
	fecha_inicio: string
	fecha_fin: string | null
	horas_empleadas: number
	costo: number
	estado: "completado" | "en_progreso" | "pendiente"
	created_at: string
}

export type ActividadEquipo = {
	id: string
	equipo_id: string
	tipo: "mantenimiento" | "inspeccion" | "falla" | "documento" | "modificacion"
	titulo: string
	descripcion: string
	usuario_id: string
	detalles: Record<string, unknown> | null
	created_at: string
}

export async function getRegistrosPorEquipo(
	equipoId: string,
): Promise<ActionResult<RegistroMantenimiento[]>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { data, error } = await supabase
		.from("registros_mantenimiento")
		.select("*")
		.eq("equipo_id", equipoId)
		.order("fecha_inicio", { ascending: false })

	if (error) return { success: false, error: error.message }
	return { success: true, data: (data ?? []) as RegistroMantenimiento[] }
}

export async function createRegistro(input: {
	equipo_id: string
	tipo: string
	descripcion: string
	fecha_inicio: string
	horas_empleadas: number
	costo: number
	estado: string
}): Promise<ActionResult<RegistroMantenimiento>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { data, error } = await supabase
		.from("registros_mantenimiento")
		.insert({ ...input, tecnico_id: user.id })
		.select()
		.single()

	if (error) return { success: false, error: error.message }

	const TIPO_LABEL_MANT: Record<string, string> = {
		inspeccion: "Inspección",
		preventivo: "Preventivo",
		correctivo: "Correctivo",
		reporte_fallas: "Reporte de Fallas",
	}

	// Auto-create actividad_equipo entry
	await supabase.from("actividades_equipo").insert({
		equipo_id: input.equipo_id,
		tipo: "mantenimiento",
		titulo: `Registro de ${TIPO_LABEL_MANT[input.tipo] ?? input.tipo}`,
		descripcion: input.descripcion,
		usuario_id: user.id,
		detalles: {
			registro_id: data.id,
			horas: input.horas_empleadas,
			costo: input.costo,
		},
	})

	// Update equipo.ultimo_mantenimiento
	await supabase
		.from("equipos")
		.update({ ultimo_mantenimiento: input.fecha_inicio })
		.eq("id", input.equipo_id)

	// Notificar a admins y supervisores ANTES de revalidateTag (fire-and-forget)
	const esFalla = input.tipo === "reporte_fallas"
	const { data: equipoInfo } = await supabase
		.from("equipos")
		.select("nombre")
		.eq("id", input.equipo_id)
		.single()
	const equipoNombre = equipoInfo?.nombre ?? "Equipo"
	const tipoLabel: Record<string, string> = {
		inspeccion: "Inspección",
		preventivo: "Preventivo",
		correctivo: "Correctivo",
		reporte_fallas: "Falla reportada",
	}
	const { data: perfilesTarget } = await supabase
		.from("perfiles")
		.select("user_id")
		.in("rol", ["admin", "supervisor"])
		.neq("user_id", user.id)
	const targetIds = (perfilesTarget ?? []).map(
		(p: { user_id: string }) => p.user_id,
	)
	if (targetIds.length > 0) {
		await supabase.from("notificaciones").insert(
			targetIds.map((userId) => ({
				user_id: userId,
				tipo: esFalla ? "alerta_equipo" : "nuevo_formulario",
				titulo: esFalla
					? "⚠️ Falla reportada en equipo"
					: "Nuevo registro de mantenimiento",
				mensaje: `${equipoNombre} — ${tipoLabel[input.tipo] ?? input.tipo}: ${input.descripcion.slice(0, 80)}`,
				metadata: {
					equipo_id: input.equipo_id,
					registro_id: data.id,
					tipo: input.tipo,
				},
			})),
		)
	}

	revalidateTag(`equipo-${input.equipo_id}`, "max")
	return { success: true, data: data as RegistroMantenimiento }
}

export async function updateRegistroEstado(
	id: string,
	estado: string,
): Promise<ActionResult<void>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const updateData: Record<string, unknown> = { estado }
	if (estado === "completado") updateData.fecha_fin = new Date().toISOString()

	const { error } = await supabase
		.from("registros_mantenimiento")
		.update(updateData)
		.eq("id", id)

	if (error) return { success: false, error: error.message }
	revalidateTag("registros", "max")

	// Notificar cuando se completa un mantenimiento (fire-and-forget)
	if (estado === "completado") {
		try {
			const { data: registro } = await supabase
				.from("registros_mantenimiento")
				.select("equipo_id, equipos(nombre)")
				.eq("id", id)
				.single()
			const equipoNombre =
				(registro as { equipo_id?: string; equipos?: { nombre?: string } | null } | null)
					?.equipos?.nombre ?? "Equipo"
			const { data: perfilesTarget } = await supabase
				.from("perfiles")
				.select("user_id")
				.in("rol", ["admin", "supervisor"])
				.neq("user_id", user.id)
			const targetIds = (perfilesTarget ?? []).map(
				(p: { user_id: string }) => p.user_id,
			)
			if (targetIds.length > 0) {
				await supabase.from("notificaciones").insert(
					targetIds.map((userId) => ({
						user_id: userId,
						tipo: "nuevo_formulario",
						titulo: "Mantenimiento completado",
						mensaje: `${equipoNombre} — trabajo finalizado y cerrado`,
						metadata: {
							equipo_id: (registro as { equipo_id?: string } | null)?.equipo_id,
							registro_id: id,
						},
					})),
				)
			}
		} catch {
			// fire-and-forget
		}
	}

	return { success: true, data: undefined }
}

export async function getActividadesPorEquipo(
	equipoId: string,
): Promise<ActionResult<ActividadEquipo[]>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { data, error } = await supabase
		.from("actividades_equipo")
		.select("*")
		.eq("equipo_id", equipoId)
		.order("created_at", { ascending: false })

	if (error) return { success: false, error: error.message }
	return { success: true, data: (data ?? []) as ActividadEquipo[] }
}

export async function getMaintenanceStats(): Promise<
	ActionResult<{
		porTipo: Array<{ tipo: string; count: number }>
		porMes: Array<{ mes: string; count: number }>
		topEquipos: Array<{ equipo_id: string; nombre: string; count: number }>
		topTecnicos: Array<{ tecnico_id: string; nombre: string; count: number }>
	}>
> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()

	const { data: registros, error } = await supabase
		.from("registros_mantenimiento")
		.select(
			"tipo, equipo_id, tecnico_id, fecha_inicio, equipos(nombre), perfiles(nombre)",
		)

	if (error) return { success: false, error: error.message }

	// Aggregate in JS (will be moved to SQL views in T8)
	const porTipo = Object.entries(
		(registros ?? []).reduce((acc: Record<string, number>, r) => {
			acc[r.tipo] = (acc[r.tipo] ?? 0) + 1
			return acc
		}, {}),
	).map(([tipo, count]) => ({ tipo, count }))

	return {
		success: true,
		data: { porTipo, porMes: [], topEquipos: [], topTecnicos: [] },
	}
}
