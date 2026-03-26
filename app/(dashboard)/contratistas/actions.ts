"use server"

import { revalidateTag } from "next/cache"
import { createClient, getUser } from "@/lib/supabase/server"
import type { ActionResult } from "@/lib/types"
import { createContratistaSchema } from "@/lib/validations/contratistas"

export type Contratista = {
	id: string
	nombre: string
	contacto: string
	email: string
	telefono: string
	especialidad: string
	estado: string
	calificacion: number
	trabajos_completados: number
	contrato_vigente: string | null
	nit: string | null
	direccion: string | null
	created_at: string
	updated_at: string
}

export async function getContratistas(filters?: {
	estado?: string
	especialidad?: string
	search?: string
}): Promise<ActionResult<Contratista[]>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	let query = supabase.from("contratistas").select("*").order("nombre")

	if (filters?.estado) query = query.eq("estado", filters.estado)
	if (filters?.especialidad)
		query = query.ilike("especialidad", `%${filters.especialidad}%`)
	if (filters?.search) query = query.ilike("nombre", `%${filters.search}%`)

	const { data, error } = await query
	if (error) return { success: false, error: error.message }
	return { success: true, data: (data ?? []) as Contratista[] }
}

export async function getContratistaById(
	id: string,
): Promise<ActionResult<Contratista>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { data, error } = await supabase
		.from("contratistas")
		.select("*")
		.eq("id", id)
		.single()

	if (error) return { success: false, error: error.message }
	return { success: true, data: data as Contratista }
}

export async function createContratista(
	formData: FormData,
): Promise<ActionResult<Contratista>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const raw = {
		nombre: formData.get("nombre") as string,
		contacto: formData.get("contacto") as string,
		email: formData.get("email") as string,
		telefono: formData.get("telefono") as string,
		especialidad: formData.get("especialidad") as string,
		nit: (formData.get("nit") as string) || null,
		direccion: (formData.get("direccion") as string) || null,
		contrato_vigente: (formData.get("contrato_vigente") as string) || null,
	}

	const parsed = createContratistaSchema.safeParse(raw)
	if (!parsed.success) {
		return {
			success: false,
			error: parsed.error.issues[0]?.message ?? "Datos inválidos",
		}
	}

	const supabase = await createClient()
	const { data, error } = await supabase
		.from("contratistas")
		.insert(parsed.data)
		.select()
		.single()

	if (error) return { success: false, error: error.message }
	revalidateTag("contratistas", "max")
	return { success: true, data: data as Contratista }
}

export async function updateContratista(
	id: string,
	formData: FormData,
): Promise<ActionResult<Contratista>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const raw = {
		nombre: formData.get("nombre") as string,
		contacto: formData.get("contacto") as string,
		email: formData.get("email") as string,
		telefono: formData.get("telefono") as string,
		especialidad: formData.get("especialidad") as string,
	}

	const supabase = await createClient()
	const { data, error } = await supabase
		.from("contratistas")
		.update(raw)
		.eq("id", id)
		.select()
		.single()

	if (error) return { success: false, error: error.message }
	revalidateTag("contratistas", "max")
	return { success: true, data: data as Contratista }
}

export async function deleteContratista(
	id: string,
): Promise<ActionResult<void>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	// Soft delete — set estado to inactivo
	const supabase = await createClient()
	const { error } = await supabase
		.from("contratistas")
		.update({ estado: "inactivo" })
		.eq("id", id)

	if (error) return { success: false, error: error.message }
	revalidateTag("contratistas", "max")
	return { success: true, data: undefined }
}
