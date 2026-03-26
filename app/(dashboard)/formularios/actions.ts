"use server"

import { revalidateTag } from "next/cache"
import { createClient, getUser } from "@/lib/supabase/server"
import type { ActionResult } from "@/lib/types"
import {
	createFormularioSchema,
	updateFormularioSchema,
} from "@/lib/validations/formularios"

export type CampoFormulario = {
	id: string
	formulario_id: string
	tipo:
		| "texto_corto"
		| "texto_largo"
		| "numerico"
		| "fecha"
		| "seleccion_unica"
		| "seleccion_multiple"
		| "firma"
		| "foto"
	label: string
	placeholder: string
	requerido: boolean
	opciones: string[] | null
	orden: number
	created_at: string
}

export type FormularioTemplate = {
	id: string
	nombre: string
	descripcion: string | null
	tipo: "inspeccion" | "reporte_fallas" | "preventivo" | "correctivo"
	version: number
	activo: boolean
	frecuencia:
		| "diario"
		| "semanal"
		| "mensual"
		| "trimestral"
		| "eventual"
		| null
	asociacion_tipo: "equipo" | "tipo_equipo" | "area" | "general"
	asociacion_valor: string | null
	created_by: string
	created_at: string
	updated_at: string
	campos?: CampoFormulario[]
}

type FormularioConConteos = FormularioTemplate & {
	_count: {
		campos: number
		envios: number
	}
}

type CampoInput = {
	tipo:
		| "texto_corto"
		| "texto_largo"
		| "numerico"
		| "fecha"
		| "seleccion_unica"
		| "seleccion_multiple"
		| "firma"
		| "foto"
	label: string
	placeholder?: string
	requerido: boolean
	opciones?: string[]
	orden: number
}

type CreateFormularioInput = {
	nombre: string
	descripcion?: string
	tipo: "inspeccion" | "reporte_fallas" | "preventivo" | "correctivo"
	frecuencia?: "diario" | "semanal" | "mensual" | "trimestral" | "eventual"
	asociacion_tipo: "equipo" | "tipo_equipo" | "area" | "general"
	asociacion_valor?: string
	campos: CampoInput[]
}

type UpdateFormularioInput = {
	nombre?: string
	descripcion?: string
	tipo?: "inspeccion" | "reporte_fallas" | "preventivo" | "correctivo"
	frecuencia?: "diario" | "semanal" | "mensual" | "trimestral" | "eventual"
	asociacion_tipo?: "equipo" | "tipo_equipo" | "area" | "general"
	asociacion_valor?: string
	campos?: CampoInput[]
}

type FormularioRowWithRelations = Omit<FormularioTemplate, "campos"> & {
	campos_formulario?: unknown
	envios_formularios?: unknown
}

const getCountValue = (countNode: unknown): number => {
	if (!Array.isArray(countNode) || countNode.length === 0) return 0
	const first = countNode[0] as { count?: number }
	return first.count ?? 0
}

const mapFormularioWithCampos = (
	row: FormularioRowWithRelations,
): FormularioTemplate => ({
	...row,
	campos: Array.isArray(row.campos_formulario) ? row.campos_formulario : [],
})

const toEscapedFilterValue = (value: string) =>
	`"${value.replaceAll('"', '\\"')}"`

export async function getFormularios(): Promise<
	ActionResult<FormularioConConteos[]>
> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { data, error } = await supabase
		.from("formularios_template")
		.select(
			`
				*,
				campos_formulario(count),
				envios_formularios(count)
			`,
		)
		.order("nombre")

	if (error) return { success: false, error: error.message }

	const mapped: FormularioConConteos[] = (data ?? []).map((row) => {
		const formulario = row as FormularioRowWithRelations

		return {
			...formulario,
			_count: {
				campos: getCountValue(formulario.campos_formulario),
				envios: getCountValue(formulario.envios_formularios),
			},
		}
	})

	return { success: true, data: mapped }
}

export async function getFormularioById(
	id: string,
): Promise<ActionResult<FormularioTemplate>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { data, error } = await supabase
		.from("formularios_template")
		.select(`*, campos_formulario(*)`)
		.eq("id", id)
		.order("orden", { foreignTable: "campos_formulario" })
		.single()

	if (error) return { success: false, error: error.message }
	if (!data) return { success: false, error: "Formulario no encontrado" }

	return { success: true, data: mapFormularioWithCampos(data) }
}

export async function createFormulario(
	input: CreateFormularioInput,
): Promise<ActionResult<FormularioTemplate>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const parsed = createFormularioSchema.safeParse(input)
	if (!parsed.success) {
		return {
			success: false,
			error: parsed.error.issues[0]?.message ?? "Datos inválidos",
		}
	}

	const supabase = await createClient()

	const { data: template, error: templateError } = await supabase
		.from("formularios_template")
		.insert({
			nombre: parsed.data.nombre,
			descripcion: parsed.data.descripcion ?? null,
			tipo: parsed.data.tipo,
			frecuencia: parsed.data.frecuencia ?? null,
			asociacion_tipo: parsed.data.asociacion_tipo,
			asociacion_valor: parsed.data.asociacion_valor ?? null,
			version: 1,
			activo: true,
			created_by: user.id,
		})
		.select()
		.single()

	if (templateError) return { success: false, error: templateError.message }

	const normalizedCampos = parsed.data.campos.map((campo, index) => ({
		formulario_id: template.id,
		tipo: campo.tipo,
		label: campo.label,
		placeholder: campo.placeholder ?? "",
		requerido: campo.requerido,
		opciones: campo.opciones ?? null,
		orden: campo.orden ?? index,
	}))

	if (normalizedCampos.length > 0) {
		const { error: camposError } = await supabase
			.from("campos_formulario")
			.insert(normalizedCampos)

		if (camposError) return { success: false, error: camposError.message }
	}

	const { error: snapshotError } = await supabase
		.from("formularios_version")
		.insert({
			formulario_id: template.id,
			schema_snapshot: { campos: parsed.data.campos },
			version: 1,
			created_by: user.id,
		})

	if (snapshotError) return { success: false, error: snapshotError.message }

	revalidateTag("formularios", "max")
	return { success: true, data: template }
}

export async function updateFormulario(
	id: string,
	input: UpdateFormularioInput,
): Promise<ActionResult<FormularioTemplate>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const parsed = updateFormularioSchema.safeParse(input)
	if (!parsed.success) {
		return {
			success: false,
			error: parsed.error.issues[0]?.message ?? "Datos inválidos",
		}
	}

	const supabase = await createClient()

	const { data: current, error: fetchError } = await supabase
		.from("formularios_template")
		.select("version")
		.eq("id", id)
		.single()

	if (fetchError) return { success: false, error: fetchError.message }

	const newVersion = (current.version ?? 1) + 1

	const payload = {
		...(parsed.data.nombre !== undefined && { nombre: parsed.data.nombre }),
		...(parsed.data.descripcion !== undefined && {
			descripcion: parsed.data.descripcion,
		}),
		...(parsed.data.tipo !== undefined && { tipo: parsed.data.tipo }),
		...(parsed.data.frecuencia !== undefined && {
			frecuencia: parsed.data.frecuencia,
		}),
		...(parsed.data.asociacion_tipo !== undefined && {
			asociacion_tipo: parsed.data.asociacion_tipo,
		}),
		...(parsed.data.asociacion_valor !== undefined && {
			asociacion_valor: parsed.data.asociacion_valor,
		}),
		version: newVersion,
	}

	const { data: updated, error: updateError } = await supabase
		.from("formularios_template")
		.update(payload)
		.eq("id", id)
		.select()
		.single()

	if (updateError) return { success: false, error: updateError.message }

	let snapshotCampos = parsed.data.campos

	if (parsed.data.campos !== undefined) {
		const { error: deleteCamposError } = await supabase
			.from("campos_formulario")
			.delete()
			.eq("formulario_id", id)

		if (deleteCamposError) {
			return { success: false, error: deleteCamposError.message }
		}

		if (parsed.data.campos.length > 0) {
			const { error: insertCamposError } = await supabase
				.from("campos_formulario")
				.insert(
					parsed.data.campos.map((campo, index) => ({
						formulario_id: id,
						tipo: campo.tipo,
						label: campo.label,
						placeholder: campo.placeholder ?? "",
						requerido: campo.requerido,
						opciones: campo.opciones ?? null,
						orden: campo.orden ?? index,
					})),
				)

			if (insertCamposError) {
				return { success: false, error: insertCamposError.message }
			}
		}
	} else {
		const { data: existingCampos, error: camposError } = await supabase
			.from("campos_formulario")
			.select("tipo, label, placeholder, requerido, opciones, orden")
			.eq("formulario_id", id)
			.order("orden")

		if (camposError) return { success: false, error: camposError.message }

		snapshotCampos = (existingCampos ?? []) as CampoInput[]
	}

	const { error: snapshotError } = await supabase
		.from("formularios_version")
		.insert({
			formulario_id: id,
			schema_snapshot: { campos: snapshotCampos ?? [] },
			version: newVersion,
			created_by: user.id,
		})

	if (snapshotError) return { success: false, error: snapshotError.message }

	revalidateTag("formularios", "max")
	revalidateTag(`formulario-${id}`, "max")
	return { success: true, data: updated }
}

export async function toggleFormularioActivo(
	id: string,
): Promise<ActionResult<{ activo: boolean }>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()

	const { data: current, error: currentError } = await supabase
		.from("formularios_template")
		.select("activo")
		.eq("id", id)
		.single()

	if (currentError) return { success: false, error: currentError.message }

	const { data, error } = await supabase
		.from("formularios_template")
		.update({ activo: !current?.activo })
		.eq("id", id)
		.select("activo")
		.single()

	if (error) return { success: false, error: error.message }

	revalidateTag("formularios", "max")
	revalidateTag(`formulario-${id}`, "max")

	return { success: true, data: { activo: data.activo } }
}

export async function deleteFormulario(
	id: string,
): Promise<ActionResult<void>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { error } = await supabase
		.from("formularios_template")
		.update({ activo: false })
		.eq("id", id)

	if (error) return { success: false, error: error.message }

	revalidateTag("formularios", "max")
	revalidateTag(`formulario-${id}`, "max")
	return { success: true, data: undefined }
}

export async function getFormulariosParaEquipo(
	equipoId: string,
): Promise<ActionResult<FormularioTemplate[]>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()

	const { data: equipo, error: equipoError } = await supabase
		.from("equipos")
		.select("tipo, ubicacion")
		.eq("id", equipoId)
		.single()

	if (equipoError) return { success: false, error: equipoError.message }

	const eqId = toEscapedFilterValue(equipoId)
	const tipoEquipo = toEscapedFilterValue(equipo.tipo)
	const area = toEscapedFilterValue(equipo.ubicacion)

	const { data, error } = await supabase
		.from("formularios_template")
		.select("*, campos_formulario(*)")
		.eq("activo", true)
		.or(
			`asociacion_tipo.eq.general,` +
				`and(asociacion_tipo.eq.equipo,asociacion_valor.eq.${eqId}),` +
				`and(asociacion_tipo.eq.tipo_equipo,asociacion_valor.eq.${tipoEquipo}),` +
				`and(asociacion_tipo.eq.area,asociacion_valor.eq.${area})`,
		)
		.order("nombre")

	if (error) return { success: false, error: error.message }

	return {
		success: true,
		data: (data ?? []).map((row) =>
			mapFormularioWithCampos(row as FormularioRowWithRelations),
		),
	}
}
