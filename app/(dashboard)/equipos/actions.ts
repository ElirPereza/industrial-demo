"use server"

import { revalidateTag } from "next/cache"
import { createClient, getUser } from "@/lib/supabase/server"
import type { ActionResult } from "@/lib/types"
import {
	createEquipoSchema,
	updateEquipoSchema,
} from "@/lib/validations/equipos"

// Types based on DB schema (will be replaced by generated types after T8)
export type Equipo = {
	id: string
	nombre: string
	tipo: "maquinaria_pesada" | "linea_produccion" | "electricos" | "hvac"
	ubicacion: string
	estado: "operativo" | "mantenimiento" | "fuera_servicio"
	ultimo_mantenimiento: string | null
	proximo_mantenimiento: string | null
	created_at: string
	updated_at: string
}

export type EquipoFilters = {
	tipo?: string
	estado?: string
	search?: string
}

export async function getEquipos(
	filters?: EquipoFilters,
): Promise<ActionResult<Equipo[]>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	let query = supabase.from("equipos").select("*").order("nombre")

	if (filters?.tipo) query = query.eq("tipo", filters.tipo)
	if (filters?.estado) query = query.eq("estado", filters.estado)
	if (filters?.search) query = query.ilike("nombre", `%${filters.search}%`)

	const { data, error } = await query

	if (error) return { success: false, error: error.message }
	return { success: true, data: (data ?? []) as Equipo[] }
}

export async function getEquipoById(id: string): Promise<
	ActionResult<
		Equipo & {
			documentos: unknown[]
			imagenes: unknown[]
		}
	>
> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { data, error } = await supabase
		.from("equipos")
		.select(
			`
			*,
			documentos(*),
			imagenes(*)
		`,
		)
		.eq("id", id)
		.single()

	if (error) return { success: false, error: error.message }
	if (!data) return { success: false, error: "Equipo no encontrado" }
	return {
		success: true,
		data: data as Equipo & { documentos: unknown[]; imagenes: unknown[] },
	}
}

export async function createEquipo(
	formData: FormData,
): Promise<ActionResult<Equipo>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const raw = {
		nombre: formData.get("nombre") as string,
		tipo: formData.get("tipo") as string,
		ubicacion: formData.get("ubicacion") as string,
		estado: (formData.get("estado") as string) || undefined,
		ultimo_mantenimiento:
			(formData.get("ultimo_mantenimiento") as string) || null,
		proximo_mantenimiento:
			(formData.get("proximo_mantenimiento") as string) || null,
	}

	const parsed = createEquipoSchema.safeParse(raw)
	if (!parsed.success) {
		return {
			success: false,
			error: parsed.error.issues[0]?.message ?? "Datos inválidos",
		}
	}

	const supabase = await createClient()
	const { data, error } = await supabase
		.from("equipos")
		.insert(parsed.data)
		.select()
		.single()

	if (error) return { success: false, error: error.message }

	revalidateTag("equipos", "max")
	return { success: true, data: data as Equipo }
}

export async function updateEquipo(
	id: string,
	formData: FormData,
): Promise<ActionResult<Equipo>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const raw = {
		nombre: formData.get("nombre") as string,
		tipo: formData.get("tipo") as string,
		ubicacion: formData.get("ubicacion") as string,
		estado: formData.get("estado") as string,
		ultimo_mantenimiento:
			(formData.get("ultimo_mantenimiento") as string) || null,
		proximo_mantenimiento:
			(formData.get("proximo_mantenimiento") as string) || null,
	}

	const parsed = updateEquipoSchema.safeParse(raw)
	if (!parsed.success) {
		return {
			success: false,
			error: parsed.error.issues[0]?.message ?? "Datos inválidos",
		}
	}

	const supabase = await createClient()
	const { data, error } = await supabase
		.from("equipos")
		.update(parsed.data)
		.eq("id", id)
		.select()
		.single()

	if (error) return { success: false, error: error.message }

	revalidateTag("equipos", "max")
	revalidateTag(`equipo-${id}`, "max")
	return { success: true, data: data as Equipo }
}

export async function deleteEquipo(id: string): Promise<ActionResult<void>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { error } = await supabase.from("equipos").delete().eq("id", id)

	if (error) return { success: false, error: error.message }

	revalidateTag("equipos", "max")
	return { success: true, data: undefined }
}

export async function getEquipoStats(id: string): Promise<
	ActionResult<{
		totalIntervenciones: number
		ultimaFalla: string | null
		horasMantenimiento: number
		costoTotal: number
	}>
> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()

	const { data: registros, error } = await supabase
		.from("registros_mantenimiento")
		.select("tipo, fecha_inicio, horas_empleadas, costo, estado")
		.eq("equipo_id", id)

	if (error) return { success: false, error: error.message }

	const totalIntervenciones = registros?.length ?? 0
	const horasMantenimiento =
		registros?.reduce((sum, r) => sum + (Number(r.horas_empleadas) || 0), 0) ??
		0
	const costoTotal =
		registros?.reduce((sum, r) => sum + (Number(r.costo) || 0), 0) ?? 0
	const fallas = registros
		?.filter((r) => r.tipo === "correctivo")
		.sort(
			(a, b) =>
				new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime(),
		)
	const ultimaFalla = fallas?.[0]?.fecha_inicio ?? null

	return {
		success: true,
		data: { totalIntervenciones, ultimaFalla, horasMantenimiento, costoTotal },
	}
}
