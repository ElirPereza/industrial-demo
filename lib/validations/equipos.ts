import { z } from "zod"

export const createEquipoSchema = z.object({
	nombre: z.string().min(1, "El nombre es requerido"),
	tipo: z.enum(["maquinaria_pesada", "linea_produccion", "electricos", "hvac"]),
	ubicacion: z.string().min(1, "La ubicación es requerida"),
	estado: z
		.enum(["operativo", "mantenimiento", "fuera_servicio"])
		.default("operativo"),
	ultimo_mantenimiento: z.string().nullable().optional(),
	proximo_mantenimiento: z.string().nullable().optional(),
})

export const updateEquipoSchema = createEquipoSchema.partial()
