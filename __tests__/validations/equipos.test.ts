import { describe, expect, it } from "vitest"
import {
	createEquipoSchema,
	updateEquipoSchema,
} from "@/lib/validations/equipos"

describe("createEquipoSchema", () => {
	it("validates valid equipo data", () => {
		const result = createEquipoSchema.safeParse({
			nombre: "Torno CNC-01",
			tipo: "maquinaria_pesada",
			ubicacion: "Nave A - Sector 1",
			estado: "operativo",
		})
		expect(result.success).toBe(true)
	})

	it("rejects missing nombre", () => {
		const result = createEquipoSchema.safeParse({
			tipo: "maquinaria_pesada",
			ubicacion: "Nave A",
			estado: "operativo",
		})
		expect(result.success).toBe(false)
	})

	it("rejects invalid tipo", () => {
		const result = createEquipoSchema.safeParse({
			nombre: "Test",
			tipo: "invalid_type",
			ubicacion: "Nave A",
			estado: "operativo",
		})
		expect(result.success).toBe(false)
	})

	it("rejects invalid estado", () => {
		const result = createEquipoSchema.safeParse({
			nombre: "Test",
			tipo: "maquinaria_pesada",
			ubicacion: "Nave A",
			estado: "broken",
		})
		expect(result.success).toBe(false)
	})

	it("accepts all valid tipo values", () => {
		const tipos = [
			"maquinaria_pesada",
			"linea_produccion",
			"electricos",
			"hvac",
		]
		for (const tipo of tipos) {
			const result = createEquipoSchema.safeParse({
				nombre: "Test",
				tipo,
				ubicacion: "Nave A",
				estado: "operativo",
			})
			expect(result.success).toBe(true)
		}
	})

	it("accepts all valid estado values", () => {
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

	it("uses default estado when omitted", () => {
		const result = createEquipoSchema.safeParse({
			nombre: "Test",
			tipo: "maquinaria_pesada",
			ubicacion: "Nave A",
		})
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.estado).toBe("operativo")
		}
	})

	it("accepts nullable optional maintenance dates", () => {
		const result = createEquipoSchema.safeParse({
			nombre: "Test",
			tipo: "maquinaria_pesada",
			ubicacion: "Nave A",
			estado: "operativo",
			ultimo_mantenimiento: null,
			proximo_mantenimiento: "2026-04-01",
		})
		expect(result.success).toBe(true)
	})
})

describe("updateEquipoSchema", () => {
	it("allows partial updates", () => {
		const result = updateEquipoSchema.safeParse({ nombre: "Updated Name" })
		expect(result.success).toBe(true)
	})

	it("allows empty object", () => {
		const result = updateEquipoSchema.safeParse({})
		expect(result.success).toBe(true)
	})
})
