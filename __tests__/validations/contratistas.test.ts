import { describe, expect, it } from "vitest"
import { createContratistaSchema } from "@/lib/validations/contratistas"

describe("createContratistaSchema", () => {
	it("validates valid contratista data", () => {
		const result = createContratistaSchema.safeParse({
			nombre: "TechServ S.A.S.",
			contacto: "Juan Pérez",
			email: "juan@techserv.com",
			telefono: "+57 300 123 4567",
			especialidad: "Mantenimiento Eléctrico",
		})
		expect(result.success).toBe(true)
	})

	it("rejects invalid email", () => {
		const result = createContratistaSchema.safeParse({
			nombre: "Test",
			contacto: "Test",
			email: "not-an-email",
			telefono: "123",
			especialidad: "Test",
		})
		expect(result.success).toBe(false)
	})

	it("rejects missing required fields", () => {
		const result = createContratistaSchema.safeParse({
			nombre: "Test",
		})
		expect(result.success).toBe(false)
	})

	it("accepts optional fields as null", () => {
		const result = createContratistaSchema.safeParse({
			nombre: "Test",
			contacto: "Test",
			email: "test@test.com",
			telefono: "123",
			especialidad: "Test",
			nit: null,
			direccion: null,
			contrato_vigente: null,
		})
		expect(result.success).toBe(true)
	})
})
