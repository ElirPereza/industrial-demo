"use server"

import { createClient, getUser } from "@/lib/supabase/server"
import type { ActionResult } from "@/lib/types"

export async function getDashboardKPIs(): Promise<
	ActionResult<{
		disponibilidad: number
		mttr: number
		costoTotal: number
		mantenimientosActivos: number
		equiposEnMantenimiento: number
		eficienciaInspeccion: number
	}>
> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()

	const [equiposResult, registrosResult] = await Promise.all([
		supabase.from("equipos").select("estado"),
		supabase
			.from("registros_mantenimiento")
			.select("estado, horas_empleadas, costo, tipo"),
	])

	const equipos = equiposResult.data ?? []
	const registros = registrosResult.data ?? []

	const totalEquipos = equipos.length
	const operativos = equipos.filter((e) => e.estado === "operativo").length
	const enMantenimiento = equipos.filter(
		(e) => e.estado === "mantenimiento",
	).length
	const disponibilidad =
		totalEquipos > 0
			? Math.round((operativos / totalEquipos) * 100 * 10) / 10
			: 0

	const completados = registros.filter((r) => r.estado === "completado")
	const horasTotal = completados.reduce(
		(sum, r) => sum + (Number(r.horas_empleadas) || 0),
		0,
	)
	const mttr =
		completados.length > 0
			? Math.round((horasTotal / completados.length) * 10) / 10
			: 0
	const costoTotal = registros.reduce(
		(sum, r) => sum + (Number(r.costo) || 0),
		0,
	)
	const mantenimientosActivos = registros.filter(
		(r) => r.estado === "en_progreso",
	).length
	const inspecciones = registros.filter((r) => r.tipo === "inspeccion")
	const eficienciaInspeccion =
		inspecciones.length > 0
			? Math.round(
					(inspecciones.filter((r) => r.estado === "completado").length /
						inspecciones.length) *
						100,
				)
			: 0

	return {
		success: true,
		data: {
			disponibilidad,
			mttr,
			costoTotal,
			mantenimientosActivos,
			equiposEnMantenimiento: enMantenimiento,
			eficienciaInspeccion,
		},
	}
}

export async function getFormulariosPorMes(): Promise<
	ActionResult<Array<{ mes: string; completados: number; pendientes: number }>>
> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { data, error } = await supabase
		.from("envios_formularios")
		.select("estado, created_at")
		.gte(
			"created_at",
			new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
		)

	if (error) return { success: false, error: error.message }

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

	for (const envio of data ?? []) {
		const date = new Date(envio.created_at)
		const key = meses[date.getMonth()]
		if (key === undefined) continue
		if (!grouped[key]) grouped[key] = { completados: 0, pendientes: 0 }
		if (envio.estado === "completado") grouped[key].completados++
		else grouped[key].pendientes++
	}

	return {
		success: true,
		data: Object.entries(grouped).map(([mes, v]) => ({ mes, ...v })),
	}
}

export async function getTendenciaFallas(): Promise<
	ActionResult<Array<{ semana: string; fallas: number }>>
> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { data, error } = await supabase
		.from("registros_mantenimiento")
		.select("tipo, fecha_inicio")
		.eq("tipo", "correctivo")
		.gte(
			"fecha_inicio",
			new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000).toISOString(),
		)

	if (error) return { success: false, error: error.message }

	const grouped: Record<string, number> = {}
	for (const r of data ?? []) {
		const date = new Date(r.fecha_inicio)
		const weekNum = Math.ceil(date.getDate() / 7)
		const key = `Sem ${weekNum}`
		grouped[key] = (grouped[key] ?? 0) + 1
	}

	return {
		success: true,
		data: Object.entries(grouped).map(([semana, fallas]) => ({
			semana,
			fallas,
		})),
	}
}

export async function getEquiposMasIntervenidos(): Promise<
	ActionResult<Array<{ equipo: string; intervenciones: number }>>
> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { data, error } = await supabase
		.from("registros_mantenimiento")
		.select("equipo_id, equipos(nombre)")

	if (error) return { success: false, error: error.message }

	const grouped: Record<string, { nombre: string; count: number }> = {}
	for (const r of data ?? []) {
		const id = r.equipo_id
		const nombre =
			((
				(r as Record<string, unknown>).equipos as Record<string, unknown> | null
			)?.nombre as string) ?? id
		if (!grouped[id]) grouped[id] = { nombre, count: 0 }
		grouped[id].count++
	}

	return {
		success: true,
		data: Object.values(grouped)
			.sort((a, b) => b.count - a.count)
			.slice(0, 5)
			.map((v) => ({ equipo: v.nombre, intervenciones: v.count })),
	}
}

export async function getTiposMantenimiento(): Promise<
	ActionResult<Array<{ tipo: string; valor: number }>>
> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { data, error } = await supabase
		.from("registros_mantenimiento")
		.select("tipo")

	if (error) return { success: false, error: error.message }

	const grouped: Record<string, number> = {}
	for (const r of data ?? []) {
		grouped[r.tipo] = (grouped[r.tipo] ?? 0) + 1
	}

	return {
		success: true,
		data: Object.entries(grouped).map(([tipo, valor]) => ({ tipo, valor })),
	}
}

export async function getRecentActivity(): Promise<
	ActionResult<
		Array<{
			id: string
			tipo: string
			descripcion: string
			estado: string
			fecha_inicio: string
			equipo_nombre: string
			tecnico_nombre: string
		}>
	>
> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { data, error } = await supabase
		.from("registros_mantenimiento")
		.select(
			"id, tipo, descripcion, estado, fecha_inicio, equipos(nombre), perfiles!registros_mantenimiento_tecnico_id_fkey(nombre)",
		)
		.order("fecha_inicio", { ascending: false })
		.limit(5)

	if (error) return { success: false, error: error.message }

	const mapped = (data ?? []).map((r: Record<string, unknown>) => ({
		id: r.id as string,
		tipo: r.tipo as string,
		descripcion: r.descripcion as string,
		estado: r.estado as string,
		fecha_inicio: r.fecha_inicio as string,
		equipo_nombre:
			((r.equipos as Record<string, unknown> | null)?.nombre as string) ??
			"Equipo",
		tecnico_nombre:
			((r.perfiles as Record<string, unknown> | null)?.nombre as string) ??
			"Técnico",
	}))

	return { success: true, data: mapped }
}

export async function getTecnicosActivos(): Promise<
	ActionResult<Array<{ nombre: string; formularios: number }>>
> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { data, error } = await supabase
		.from("envios_formularios")
		.select("usuario_id, perfiles(nombre)")

	if (error) return { success: false, error: error.message }

	const grouped: Record<string, { nombre: string; count: number }> = {}
	for (const e of data ?? []) {
		const id = e.usuario_id
		const nombre =
			((
				(e as Record<string, unknown>).perfiles as Record<
					string,
					unknown
				> | null
			)?.nombre as string) ?? id
		if (!grouped[id]) grouped[id] = { nombre, count: 0 }
		grouped[id].count++
	}

	return {
		success: true,
		data: Object.values(grouped)
			.sort((a, b) => b.count - a.count)
			.slice(0, 5)
			.map((v) => ({ nombre: v.nombre, formularios: v.count })),
	}
}
