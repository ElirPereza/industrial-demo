import { describe, it, expect } from "vitest"
import { createEquipoSchema } from "@/lib/validations/equipos"

// Note: Full Server Action tests require a live Supabase connection.
// These tests verify the validation layer independently.

describe("Equipos validation layer", () => {
	it("createEquipoSchema rejects empty nombre", () => {
		const result = createEquipoSchema.safeParse({
			nombre: "",
			tipo: "maquinaria_pesada",
			ubicacion: "Nave A",
			estado: "operativo",
		})
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.issues[0].message).toContain("requerido")
		}
	})

	it("createEquipoSchema rejects empty ubicacion", () => {
		const result = createEquipoSchema.safeParse({
			nombre: "Test",
			tipo: "maquinaria_pesada",
			ubicacion: "",
			estado: "operativo",
		})
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.issues[0].message).toContain("requerida")
		}
	})

	it("createEquipoSchema accepts all estado values", () => {
		const estados = ["operativo", "mantenimiento", "fuera_servicio"]
		for (const estado of estados) {
			const result = createEquipoSchema.safeParse({
				nombre: "Test",
				tipo: "maquinaria_pesada",
				ubicacion: "Nave A",
				estado,
			})
			expect(result.success).toBe(true)
		}
	})
})
