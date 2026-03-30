"use server"

import { revalidateTag } from "next/cache"
import { createClient, getUser } from "@/lib/supabase/server"
import type { ActionResult } from "@/lib/types"

export type CampoRespuesta = {
	idCampo: string
	valor: string | string[] | number | boolean | null
}

export type EnvioFormulario = {
	id: string
	formulario_id: string
	equipo_id: string
	usuario_id: string
	version_formulario: number
	respuestas: CampoRespuesta[]
	estado: "completado" | "pendiente" | "rechazado"
	firmado: boolean
	created_at: string
	formulario_nombre?: string
	formulario_tipo?: string
	formulario_descripcion?: string | null
	equipo_nombre?: string
	equipo_ubicacion?: string
	usuario_nombre?: string
}

type EnvioRow = EnvioFormulario & {
	formularios_template?: {
		nombre?: string
		tipo?: string
		descripcion?: string | null
	} | null
	equipos?: {
		nombre?: string
		ubicacion?: string
	} | null
	perfiles?: {
		nombre?: string
	} | null
}

export async function getEnvios(filters?: {
	estado?: string
	equipo_id?: string
	usuario_id?: string
	formulario_id?: string
}): Promise<ActionResult<EnvioFormulario[]>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	let query = supabase
		.from("envios_formularios")
		.select(
			`*, formularios_template(nombre, tipo, descripcion), equipos(nombre, ubicacion), perfiles(nombre)`,
		)
		.order("created_at", { ascending: false })

	if (filters?.estado) query = query.eq("estado", filters.estado)
	if (filters?.equipo_id) query = query.eq("equipo_id", filters.equipo_id)
	if (filters?.usuario_id) query = query.eq("usuario_id", filters.usuario_id)
	if (filters?.formulario_id)
		query = query.eq("formulario_id", filters.formulario_id)

	const { data, error } = await query
	if (error) return { success: false, error: error.message }

	const mapped = (data ?? []).map((envio) => {
		const row = envio as EnvioRow

		return {
			...row,
			formulario_nombre: row.formularios_template?.nombre,
			formulario_tipo: row.formularios_template?.tipo,
			formulario_descripcion: row.formularios_template?.descripcion,
			equipo_nombre: row.equipos?.nombre,
			equipo_ubicacion: row.equipos?.ubicacion,
			usuario_nombre: row.perfiles?.nombre,
		}
	})

	return { success: true, data: mapped }
}

export async function getEnvioById(
	id: string,
): Promise<ActionResult<EnvioFormulario>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { data, error } = await supabase
		.from("envios_formularios")
		.select(
			`*, formularios_template(nombre, campos_formulario(*)), equipos(nombre, ubicacion), perfiles(nombre)`,
		)
		.eq("id", id)
		.single()

	if (error) return { success: false, error: error.message }
	return { success: true, data: data as EnvioFormulario }
}

export async function submitFormulario(input: {
	formulario_id: string
	equipo_id: string
	respuestas: CampoRespuesta[]
	campos_requeridos: string[]
}): Promise<ActionResult<EnvioFormulario>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	for (const campoId of input.campos_requeridos) {
		const respuesta = input.respuestas.find((r) => r.idCampo === campoId)
		if (
			!respuesta ||
			respuesta.valor === null ||
			respuesta.valor === "" ||
			(Array.isArray(respuesta.valor) && respuesta.valor.length === 0)
		) {
			return {
				success: false,
				error: `Campo requerido sin completar: ${campoId}`,
			}
		}
	}

	const supabase = await createClient()

	const { data: template, error: templateError } = await supabase
		.from("formularios_template")
		.select("version, activo, nombre")
		.eq("id", input.formulario_id)
		.single()

	if (templateError) return { success: false, error: templateError.message }
	if (!template.activo) {
		return { success: false, error: "Este formulario no está activo" }
	}

	const { data: equipoData } = await supabase
		.from("equipos")
		.select("nombre")
		.eq("id", input.equipo_id)
		.single()

	const hasFirma = input.respuestas.some(
		(r) => typeof r.valor === "string" && r.valor.startsWith("data:image/"),
	)

	const { data: envio, error: envioError } = await supabase
		.from("envios_formularios")
		.insert({
			formulario_id: input.formulario_id,
			equipo_id: input.equipo_id,
			usuario_id: user.id,
			version_formulario: template.version,
			respuestas: input.respuestas,
			estado: "completado",
			firmado: hasFirma,
		})
		.select()
		.single()

	if (envioError) return { success: false, error: envioError.message }

	await supabase.from("actividades_equipo").insert({
		equipo_id: input.equipo_id,
		tipo: "inspeccion",
		titulo: "Formulario diligenciado",
		descripcion: "Formulario completado por el técnico",
		usuario_id: user.id,
		detalles: { envio_id: envio.id, formulario_id: input.formulario_id },
	})

	// Notificar a admins y supervisores (fire-and-forget)
	try {
		const { getPerfilesConRol, createNotificacion } = await import(
			"@/app/(dashboard)/notificaciones/actions"
		)
		const userIds = await getPerfilesConRol(["admin", "supervisor"])
		const targetIds = userIds.filter((uid) => uid !== user.id)
		if (targetIds.length > 0) {
			await createNotificacion({
				userIds: targetIds,
				tipo: "nuevo_formulario",
				titulo: "Nuevo formulario enviado",
				mensaje: `${(template as { version: number; activo: boolean; nombre?: string }).nombre ?? "Formulario"} — ${equipoData?.nombre ?? "equipo desconocido"}`,
				metadata: {
					formulario_id: input.formulario_id,
					equipo_id: input.equipo_id,
					envio_id: envio.id,
				},
			})
		}
	} catch {
		// No fallar el submit si la notificación falla
	}

	revalidateTag("envios", "max")
	revalidateTag(`equipo-${input.equipo_id}`, "max")
	return { success: true, data: envio as EnvioFormulario }
}

export async function getEnviosPorEquipo(
	equipoId: string,
): Promise<ActionResult<EnvioFormulario[]>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { data, error } = await supabase
		.from("envios_formularios")
		.select(`*, formularios_template(nombre), perfiles(nombre)`)
		.eq("equipo_id", equipoId)
		.order("created_at", { ascending: false })

	if (error) return { success: false, error: error.message }
	return { success: true, data: (data ?? []) as EnvioFormulario[] }
}

export async function getEnvioStats(): Promise<
	ActionResult<{
		total: number
		completados: number
		pendientes: number
		porMes: Array<{ mes: string; completados: number; pendientes: number }>
	}>
> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { data, error } = await supabase
		.from("envios_formularios")
		.select("estado, created_at")

	if (error) return { success: false, error: error.message }

	const envios = data ?? []
	const total = envios.length
	const completados = envios.filter((e) => e.estado === "completado").length
	const pendientes = envios.filter((e) => e.estado === "pendiente").length

	const meses = [
		"Ene",
		"Feb",
		"Mar",
		"Abr",
		"May",
		"Jun",
		"Jul",
		"Ago",
		"Sep",
		"Oct",
		"Nov",
		"Dic",
	]
	const grouped: Record<string, { completados: number; pendientes: number }> =
		{}
	for (const envio of envios) {
		const date = new Date(envio.created_at)
		const key = meses[date.getMonth()]
		if (!grouped[key]) grouped[key] = { completados: 0, pendientes: 0 }
		if (envio.estado === "completado") grouped[key].completados += 1
		else grouped[key].pendientes += 1
	}

	return {
		success: true,
		data: {
			total,
			completados,
			pendientes,
			porMes: Object.entries(grouped).map(([mes, value]) => ({
				mes,
				...value,
			})),
		},
	}
}
