export type FieldType =
	| "texto-corto"
	| "texto-largo"
	| "numerico"
	| "fecha"
	| "seleccion-unica"
	| "seleccion-multiple"
	| "firma"
	| "foto"

export interface FormField {
	id: string
	nombre: string
	tipo: FieldType
	requerido: boolean
	opciones?: string[]
}

export type TipoAsociacion = "equipo" | "tipo-equipo" | "area" | "general"

export interface FormAsociacion {
	tipo: TipoAsociacion
	valor: string | null
}

export interface FormTemplate {
	id: string
	nombre: string
	descripcion: string
	tipo: "inspeccion" | "reporte-fallas" | "preventivo" | "correctivo"
	version: number
	campos: FormField[]
	fechaCreacion: Date
	activo: boolean
	asociacion: FormAsociacion
	frecuencia?: "diario" | "semanal" | "mensual" | "trimestral" | "eventual"
}

export type RolUsuario = "admin" | "supervisor" | "tecnico" | "contratista"

export interface Usuario {
	id: string
	nombre: string
	email: string
	rol: RolUsuario
	departamento: string
}

export interface AreaProduccion {
	id: string
	nombre: string
	ubicacion: string
	tipo: "linea" | "area" | "zona"
	descripcion?: string
}

export interface DispositivoIoT {
	nombre: string
	tipo: "variador" | "plc" | "controlador" | "sensor"
	protocolo: "modbus-tcp" | "opc-ua" | "mqtt" | "bacnet" | "profinet"
	direccion: string
	estado: "online" | "warning" | "offline"
	ultimoDato?: string
}

export interface Equipo {
	id: string
	nombre: string
	idArea: string
	tipo: "maquinaria-pesada" | "linea-produccion" | "electricos" | "hvac"
	ubicacion: string
	estado: "operativo" | "mantenimiento" | "fuera-servicio"
	ultimoMantenimiento: Date
	proximoMantenimiento: Date
	tieneIoT: boolean
	dispositivoIoT?: DispositivoIoT
}

export interface CampoRespuesta {
	idCampo: string
	valor: string | string[] | number | boolean | Date
}

export interface EnvioFormulario {
	id: string
	idFormulario: string
	idEquipo: string
	idUsuario: string
	versionFormulario: number
	respuestas: CampoRespuesta[]
	fechaEnvio: Date
	estado: "completado" | "pendiente" | "rechazado"
}

export interface RegistroMantenimiento {
	id: string
	idEquipo: string
	tipo: "preventivo" | "correctivo" | "inspección"
	descripcion: string
	tecnico: string
	fechaInicio: Date
	fechaFin: Date
	horasEmpleadas: number
	costo: number
	estado: "completado" | "en-progreso" | "pendiente"
}

export interface KPI {
	id: string
	nombre: string
	valor: number
	unidad: string
	tendencia: "arriba" | "abajo" | "estable"
	periodo: string
}

export type SeveridadAlerta = "critica" | "alta" | "media" | "baja" | "info"
export type EstadoAlerta = "activa" | "reconocida" | "resuelta"
export type ProtocoloComunicacion =
	| "modbus-tcp"
	| "opc-ua"
	| "mqtt"
	| "bacnet"
	| "profinet"

export interface AlertaEquipo {
	id: string
	idEquipo: string
	marca: string
	modelo: string
	codigoFalla: string
	descripcionFalla: string
	severidad: SeveridadAlerta
	estado: EstadoAlerta
	parametros?: { nombre: string; valor: string; unidad: string }[]
	fechaDeteccion: Date
	fechaReconocimiento?: Date
	fechaResolucion?: Date
}

export type EstadoOrdenTrabajo =
	| "creada"
	| "asignada"
	| "en-progreso"
	| "completada"
	| "verificada"
	| "cancelada"
export type PrioridadOT = "critica" | "alta" | "media" | "baja"
export type TipoOT = "correctiva" | "preventiva" | "predictiva" | "mejora"

export interface ItemChecklist {
	id: string
	categoria: "herramienta" | "repuesto" | "epp" | "procedimiento"
	descripcion: string
	completado: boolean
}

export interface OrdenTrabajo {
	id: string
	titulo: string
	descripcion: string
	tipo: TipoOT
	prioridad: PrioridadOT
	estado: EstadoOrdenTrabajo
	idEquipo: string
	idAlerta?: string
	tecnicoAsignado: string
	solicitante: string
	fechaCreacion: Date
	fechaInicioProgramada?: Date
	fechaInicioReal?: Date
	fechaFinReal?: Date
	tiempoEstimadoHoras: number
	tiempoRealHoras?: number
	checklist: ItemChecklist[]
	notas?: string
}
