import type {
	AlertaEquipo,
	AreaProduccion,
	CampoRespuesta,
	DispositivoIoT,
	EnvioFormulario,
	Equipo,
	FormAsociacion,
	FormField,
	FormTemplate,
	ItemChecklist,
	KPI,
	OrdenTrabajo,
	RegistroMantenimiento,
	Usuario,
} from "@/lib/mock-data"
import type { Tables } from "@/lib/supabase/types"

export function mapEquipoRow(row: Tables<"equipos">): Equipo {
	return {
		id: row.id,
		nombre: row.nombre,
		idArea: row.id_area ?? "",
		tipo: row.tipo as Equipo["tipo"],
		ubicacion: row.ubicacion,
		estado: row.estado as Equipo["estado"],
		ultimoMantenimiento: row.ultimo_mantenimiento
			? new Date(row.ultimo_mantenimiento)
			: new Date(),
		proximoMantenimiento: row.proximo_mantenimiento
			? new Date(row.proximo_mantenimiento)
			: new Date(),
		tieneIoT: row.tiene_iot,
		dispositivoIoT: row.dispositivo_iot
			? (row.dispositivo_iot as unknown as DispositivoIoT)
			: undefined,
	}
}

export function mapAreaRow(row: Tables<"areas_produccion">): AreaProduccion {
	return {
		id: row.id,
		nombre: row.nombre,
		ubicacion: row.ubicacion,
		tipo: row.tipo as AreaProduccion["tipo"],
		descripcion: row.descripcion ?? undefined,
	}
}

export function mapFormTemplateRow(
	row: Tables<"form_templates">,
): FormTemplate {
	return {
		id: row.id,
		nombre: row.nombre,
		descripcion: row.descripcion,
		tipo: row.tipo as FormTemplate["tipo"],
		version: row.version,
		campos: (row.campos ?? []) as unknown as FormField[],
		fechaCreacion: new Date(row.created_at),
		activo: row.activo,
		asociacion: (row.asociacion ?? {
			tipo: "general",
			valor: null,
		}) as unknown as FormAsociacion,
		frecuencia: (row.frecuencia ?? undefined) as FormTemplate["frecuencia"],
	}
}

export function mapEnvioRow(
	row: Tables<"envios_formularios">,
): EnvioFormulario {
	return {
		id: row.id,
		idFormulario: row.id_formulario,
		idEquipo: row.id_equipo ?? "",
		idUsuario: row.id_usuario,
		versionFormulario: row.version_formulario,
		respuestas: (row.respuestas ?? []) as unknown as CampoRespuesta[],
		fechaEnvio: new Date(row.fecha_envio),
		estado: row.estado as EnvioFormulario["estado"],
	}
}

export function mapOrdenRow(row: Tables<"ordenes_trabajo">): OrdenTrabajo {
	return {
		id: row.id,
		titulo: row.titulo,
		descripcion: row.descripcion,
		tipo: row.tipo as OrdenTrabajo["tipo"],
		prioridad: row.prioridad as OrdenTrabajo["prioridad"],
		estado: row.estado as OrdenTrabajo["estado"],
		idEquipo: row.id_equipo,
		idAlerta: row.id_alerta ?? undefined,
		tecnicoAsignado: row.tecnico_asignado,
		solicitante: row.solicitante,
		fechaCreacion: new Date(row.fecha_creacion),
		fechaInicioProgramada: row.fecha_inicio_programada
			? new Date(row.fecha_inicio_programada)
			: undefined,
		fechaInicioReal: row.fecha_inicio_real
			? new Date(row.fecha_inicio_real)
			: undefined,
		fechaFinReal: row.fecha_fin_real ? new Date(row.fecha_fin_real) : undefined,
		tiempoEstimadoHoras: row.tiempo_estimado_horas ?? 0,
		tiempoRealHoras: row.tiempo_real_horas ?? undefined,
		checklist: (row.checklist ?? []) as unknown as ItemChecklist[],
		notas: row.notas ?? undefined,
	}
}

export function mapAlertaRow(row: Tables<"alertas_equipos">): AlertaEquipo {
	return {
		id: row.id,
		idEquipo: row.id_equipo,
		marca: row.marca,
		modelo: row.modelo,
		codigoFalla: row.codigo_falla,
		descripcionFalla: row.descripcion_falla,
		severidad: row.severidad as AlertaEquipo["severidad"],
		estado: row.estado as AlertaEquipo["estado"],
		parametros: row.parametros
			? (row.parametros as unknown as {
					nombre: string
					valor: string
					unidad: string
				}[])
			: undefined,
		fechaDeteccion: new Date(row.fecha_deteccion),
		fechaReconocimiento: row.fecha_reconocimiento
			? new Date(row.fecha_reconocimiento)
			: undefined,
		fechaResolucion: row.fecha_resolucion
			? new Date(row.fecha_resolucion)
			: undefined,
	}
}

export function mapMantenimientoRow(
	row: Tables<"registros_mantenimiento">,
): RegistroMantenimiento {
	return {
		id: row.id,
		idEquipo: row.id_equipo,
		tipo: row.tipo as RegistroMantenimiento["tipo"],
		descripcion: row.descripcion,
		tecnico: row.tecnico,
		fechaInicio: new Date(row.fecha_inicio),
		fechaFin: row.fecha_fin ? new Date(row.fecha_fin) : new Date(),
		horasEmpleadas: row.horas_empleadas ?? 0,
		costo: row.costo ?? 0,
		estado: row.estado as RegistroMantenimiento["estado"],
	}
}

export function mapKpiRow(row: Tables<"kpis">): KPI {
	return {
		id: row.id,
		nombre: row.nombre,
		valor: row.valor,
		unidad: row.unidad,
		tendencia: row.tendencia as KPI["tendencia"],
		periodo: row.periodo,
	}
}

export function mapProfileRow(row: Tables<"profiles">): Usuario {
	return {
		id: row.id,
		nombre: row.nombre,
		email: row.email,
		rol: row.rol as Usuario["rol"],
		departamento: row.departamento,
	}
}
