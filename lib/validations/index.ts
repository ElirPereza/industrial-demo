import { z } from "zod"

export const uuidSchema = z.string().uuid("ID inválido")

export const emailSchema = z.string().email("Email inválido")

export const paginationSchema = z.object({
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(20),
})
