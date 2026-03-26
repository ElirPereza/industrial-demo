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

	// Auto-create actividad_equipo entry
	await supabase.from("actividades_equipo").insert({
		equipo_id: input.equipo_id,
		tipo: "mantenimiento",
		titulo: `Registro de ${input.tipo}`,
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
		.select("tipo, equipo_id, tecnico_id, fecha_inicio, equipos(nombre), perfiles(nombre)")

	if (error) return { success: false, error: error.message }

	// Aggregate in JS (will be moved to SQL views in T8)
	const porTipo = Object.entries(
		(registros ?? []).reduce(
			(acc: Record<string, number>, r) => {
				acc[r.tipo] = (acc[r.tipo] ?? 0) + 1
				return acc
			},
			{},
		),
	).map(([tipo, count]) => ({ tipo, count }))

	return {
		success: true,
		data: { porTipo, porMes: [], topEquipos: [], topTecnicos: [] },
	}
}
