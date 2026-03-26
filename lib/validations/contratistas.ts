import { z } from "zod"

export const createContratistaSchema = z.object({
	nombre: z.string().min(1, "El nombre es requerido"),
	contacto: z.string().min(1, "El contacto es requerido"),
	email: z.string().email("Email inválido"),
	telefono: z.string().min(1, "El teléfono es requerido"),
	especialidad: z.string().min(1, "La especialidad es requerida"),
	nit: z.string().nullable().optional(),
	direccion: z.string().nullable().optional(),
	contrato_vigente: z.string().nullable().optional(),
})

export const updateContratistaSchema = createContratistaSchema.partial()
