import { describe, expect, it } from "vitest"
import { createFormularioSchema } from "@/lib/validations/formularios"

describe("createFormularioSchema", () => {
	it("validates valid formulario data", () => {
		const result = createFormularioSchema.safeParse({
			nombre: "Inspección Pre-Operacional",
			tipo: "inspeccion",
			asociacion_tipo: "general",
			campos: [],
		})
		expect(result.success).toBe(true)
	})

	it("rejects missing nombre", () => {
		const result = createFormularioSchema.safeParse({
			tipo: "inspeccion",
			asociacion_tipo: "general",
		})
		expect(result.success).toBe(false)
	})

	it("rejects invalid tipo", () => {
		const result = createFormularioSchema.safeParse({
			nombre: "Test",
			tipo: "invalid",
			asociacion_tipo: "general",
		})
		expect(result.success).toBe(false)
	})

	it("validates campo types", () => {
		const result = createFormularioSchema.safeParse({
			nombre: "Test Form",
			tipo: "inspeccion",
			asociacion_tipo: "general",
			campos: [
				{
					tipo: "texto_corto",
					label: "Nombre del equipo",
					requerido: true,
					orden: 0,
				},
			],
		})
		expect(result.success).toBe(true)
	})

	it("rejects invalid campo tipo", () => {
		const result = createFormularioSchema.safeParse({
			nombre: "Test Form",
			tipo: "inspeccion",
			asociacion_tipo: "general",
			campos: [
				{
					tipo: "invalid_field_type",
					label: "Test",
					requerido: false,
					orden: 0,
				},
			],
		})
		expect(result.success).toBe(false)
	})

	it("defaults campos to empty array when omitted", () => {
		const result = createFormularioSchema.safeParse({
			nombre: "Test",
			tipo: "inspeccion",
			asociacion_tipo: "general",
		})
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.campos).toEqual([])
		}
	})

	it("validates all campo field types", () => {
		const fieldTypes = [
			"texto_corto",
			"texto_largo",
			"numerico",
			"fecha",
			"seleccion_unica",
			"seleccion_multiple",
			"firma",
			"foto",
		]
		for (const tipo of fieldTypes) {
			const result = createFormularioSchema.safeParse({
				nombre: "Test",
				tipo: "inspeccion",
				asociacion_tipo: "general",
				campos: [{ tipo, label: "Test", requerido: false, orden: 0 }],
			})
			expect(result.success).toBe(true)
		}
	})
})
