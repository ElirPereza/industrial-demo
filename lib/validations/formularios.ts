import { z } from "zod"

const campoSchema = z.object({
	tipo: z.enum([
		"texto_corto",
		"texto_largo",
		"numerico",
		"fecha",
		"seleccion_unica",
		"seleccion_multiple",
		"firma",
		"foto",
	]),
	label: z.string().min(1, "El label es requerido"),
	placeholder: z.string().optional(),
	requerido: z.boolean().default(false),
	opciones: z.array(z.string()).optional(),
	orden: z.number().int().min(0),
})

export const createFormularioSchema = z.object({
	nombre: z.string().min(1, "El nombre es requerido"),
	descripcion: z.string().optional(),
	tipo: z.enum(["inspeccion", "reporte_fallas", "preventivo", "correctivo"]),
	frecuencia: z
		.enum(["diario", "semanal", "mensual", "trimestral", "eventual"])
		.optional(),
	asociacion_tipo: z
		.enum(["equipo", "tipo_equipo", "area", "general"])
		.default("general"),
	asociacion_valor: z.string().optional(),
	campos: z.array(campoSchema).default([]),
})

export const updateFormularioSchema = createFormularioSchema.partial()
