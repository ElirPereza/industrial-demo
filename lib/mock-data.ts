// Mock data para portal industrial - Todos los módulos
// Datos estructurados para desarrollo y demostración

// ============================================================================
// TIPOS
// ============================================================================

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

// Tipo de asociación de formulario
export type TipoAsociacion = "equipo" | "tipo-equipo" | "area" | "general"

export interface FormAsociacion {
	tipo: TipoAsociacion
	// Si tipo = "equipo" → id del equipo específico
	// Si tipo = "tipo-equipo" → tipo de equipo (maquinaria-pesada, hvac, etc.)
	// Si tipo = "area" → nombre del área (Nave A, Nave B, etc.)
	// Si tipo = "general" → null (aplica a todos)
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
	// Nueva asociación
	asociacion: FormAsociacion
	// Frecuencia sugerida
	frecuencia?: "diario" | "semanal" | "mensual" | "trimestral" | "eventual"
}

export interface Usuario {
	id: string
	nombre: string
	email: string
	rol: "admin" | "tecnico" | "operador"
	departamento: string
}

export interface Equipo {
	id: string
	nombre: string
	tipo: "maquinaria-pesada" | "linea-produccion" | "electricos" | "hvac"
	ubicacion: string
	estado: "operativo" | "mantenimiento" | "fuera-servicio"
	ultimoMantenimiento: Date
	proximoMantenimiento: Date
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

// ============================================================================
// USUARIOS
// ============================================================================

export const usuarios: Usuario[] = [
	{
		id: "usr-001",
		nombre: "Carlos Mendoza",
		email: "carlos.mendoza@industrial.com",
		rol: "admin",
		departamento: "Administración",
	},
	{
		id: "usr-002",
		nombre: "María García",
		email: "maria.garcia@industrial.com",
		rol: "tecnico",
		departamento: "Mantenimiento",
	},
	{
		id: "usr-003",
		nombre: "Juan Rodríguez",
		email: "juan.rodriguez@industrial.com",
		rol: "tecnico",
		departamento: "Mantenimiento",
	},
	{
		id: "usr-004",
		nombre: "Ana López",
		email: "ana.lopez@industrial.com",
		rol: "operador",
		departamento: "Producción",
	},
	{
		id: "usr-005",
		nombre: "Pedro Sánchez",
		email: "pedro.sanchez@industrial.com",
		rol: "operador",
		departamento: "Producción",
	},
]

// ============================================================================
// PLANTILLAS DE FORMULARIOS
// ============================================================================

export const formulariosTemplate: FormTemplate[] = [
	{
		id: "form-001",
		nombre: "Inspección Pre-Operacional",
		descripcion: "Verificación diaria antes de iniciar operaciones",
		tipo: "inspeccion",
		version: 1,
		activo: true,
		fechaCreacion: new Date("2025-12-01"),
		asociacion: { tipo: "tipo-equipo", valor: "maquinaria-pesada" },
		frecuencia: "diario",
		campos: [
			{
				id: "campo-001",
				nombre: "Equipo inspeccionado",
				tipo: "seleccion-unica",
				requerido: true,
				opciones: ["Torno CNC-01", "Prensa Hidráulica-02", "Fresadora-03"],
			},
			{
				id: "campo-002",
				nombre: "Fecha de inspección",
				tipo: "fecha",
				requerido: true,
			},
			{
				id: "campo-003",
				nombre: "Observaciones generales",
				tipo: "texto-largo",
				requerido: false,
			},
			{
				id: "campo-004",
				nombre: "Nivel de aceite",
				tipo: "seleccion-unica",
				requerido: true,
				opciones: ["Óptimo", "Bajo", "Crítico"],
			},
			{
				id: "campo-005",
				nombre: "Temperatura de operación (°C)",
				tipo: "numerico",
				requerido: true,
			},
			{
				id: "campo-006",
				nombre: "Firma del inspector",
				tipo: "firma",
				requerido: true,
			},
		],
	},
	{
		id: "form-002",
		nombre: "Reporte de Fallas",
		descripcion: "Registro de problemas encontrados durante operación",
		tipo: "reporte-fallas",
		version: 1,
		activo: true,
		fechaCreacion: new Date("2025-12-01"),
		asociacion: { tipo: "general", valor: null },
		frecuencia: "eventual",
		campos: [
			{
				id: "campo-101",
				nombre: "Equipo afectado",
				tipo: "seleccion-unica",
				requerido: true,
				opciones: [
					"Torno CNC-01",
					"Prensa Hidráulica-02",
					"Fresadora-03",
					"Compresor-04",
				],
			},
			{
				id: "campo-102",
				nombre: "Descripción de la falla",
				tipo: "texto-largo",
				requerido: true,
			},
			{
				id: "campo-103",
				nombre: "Severidad",
				tipo: "seleccion-unica",
				requerido: true,
				opciones: ["Baja", "Media", "Alta", "Crítica"],
			},
			{
				id: "campo-104",
				nombre: "Componentes afectados",
				tipo: "seleccion-multiple",
				requerido: true,
				opciones: [
					"Motor",
					"Transmisión",
					"Hidráulica",
					"Eléctrica",
					"Estructura",
				],
			},
			{
				id: "campo-105",
				nombre: "Foto de la falla",
				tipo: "foto",
				requerido: false,
			},
			{
				id: "campo-106",
				nombre: "Firma del reportante",
				tipo: "firma",
				requerido: true,
			},
		],
	},
	{
		id: "form-003",
		nombre: "Mantenimiento Preventivo",
		descripcion: "Tareas de mantenimiento programado",
		tipo: "preventivo",
		version: 1,
		activo: true,
		fechaCreacion: new Date("2025-12-01"),
		asociacion: { tipo: "general", valor: null },
		frecuencia: "mensual",
		campos: [
			{
				id: "campo-201",
				nombre: "Equipo a mantener",
				tipo: "seleccion-unica",
				requerido: true,
				opciones: [
					"Torno CNC-01",
					"Prensa Hidráulica-02",
					"Fresadora-03",
					"Compresor-04",
				],
			},
			{
				id: "campo-202",
				nombre: "Tareas realizadas",
				tipo: "texto-largo",
				requerido: true,
			},
			{
				id: "campo-203",
				nombre: "Horas empleadas",
				tipo: "numerico",
				requerido: true,
			},
			{
				id: "campo-204",
				nombre: "Materiales utilizados",
				tipo: "texto-largo",
				requerido: false,
			},
			{
				id: "campo-205",
				nombre: "Próxima fecha de mantenimiento",
				tipo: "fecha",
				requerido: true,
			},
			{
				id: "campo-206",
				nombre: "Firma del técnico",
				tipo: "firma",
				requerido: true,
			},
		],
	},
	{
		id: "form-004",
		nombre: "Mantenimiento Correctivo",
		descripcion: "Reparación de equipos con fallas",
		tipo: "correctivo",
		version: 1,
		activo: true,
		fechaCreacion: new Date("2025-12-01"),
		asociacion: { tipo: "general", valor: null },
		frecuencia: "eventual",
		campos: [
			{
				id: "campo-301",
				nombre: "Equipo reparado",
				tipo: "seleccion-unica",
				requerido: true,
				opciones: [
					"Torno CNC-01",
					"Prensa Hidráulica-02",
					"Fresadora-03",
					"Compresor-04",
				],
			},
			{
				id: "campo-302",
				nombre: "Problema identificado",
				tipo: "texto-largo",
				requerido: true,
			},
			{
				id: "campo-303",
				nombre: "Solución aplicada",
				tipo: "texto-largo",
				requerido: true,
			},
			{
				id: "campo-304",
				nombre: "Costo de reparación",
				tipo: "numerico",
				requerido: true,
			},
			{
				id: "campo-305",
				nombre: "Tiempo de parada (minutos)",
				tipo: "numerico",
				requerido: true,
			},
			{
				id: "campo-306",
				nombre: "Foto de la reparación",
				tipo: "foto",
				requerido: false,
			},
			{
				id: "campo-307",
				nombre: "Firma del técnico",
				tipo: "firma",
				requerido: true,
			},
		],
	},
]

// ============================================================================
// EQUIPOS
// ============================================================================

export const equipos: Equipo[] = [
	// Maquinaria Pesada
	{
		id: "eq-001",
		nombre: "Torno CNC-01",
		tipo: "maquinaria-pesada",
		ubicacion: "Nave A - Sector 1",
		estado: "operativo",
		ultimoMantenimiento: new Date("2026-01-28"),
		proximoMantenimiento: new Date("2026-02-28"),
	},
	{
		id: "eq-002",
		nombre: "Prensa Hidráulica-02",
		tipo: "maquinaria-pesada",
		ubicacion: "Nave A - Sector 2",
		estado: "operativo",
		ultimoMantenimiento: new Date("2026-01-15"),
		proximoMantenimiento: new Date("2026-02-15"),
	},
	{
		id: "eq-003",
		nombre: "Fresadora-03",
		tipo: "maquinaria-pesada",
		ubicacion: "Nave B - Sector 1",
		estado: "mantenimiento",
		ultimoMantenimiento: new Date("2026-02-05"),
		proximoMantenimiento: new Date("2026-03-05"),
	},
	{
		id: "eq-004",
		nombre: "Taladro Radial-04",
		tipo: "maquinaria-pesada",
		ubicacion: "Nave B - Sector 2",
		estado: "operativo",
		ultimoMantenimiento: new Date("2026-01-20"),
		proximoMantenimiento: new Date("2026-02-20"),
	},
	// Líneas de Producción
	{
		id: "eq-005",
		nombre: "Línea Ensamble-01",
		tipo: "linea-produccion",
		ubicacion: "Nave C - Línea 1",
		estado: "operativo",
		ultimoMantenimiento: new Date("2026-01-25"),
		proximoMantenimiento: new Date("2026-02-25"),
	},
	{
		id: "eq-006",
		nombre: "Línea Empaque-02",
		tipo: "linea-produccion",
		ubicacion: "Nave C - Línea 2",
		estado: "operativo",
		ultimoMantenimiento: new Date("2026-02-01"),
		proximoMantenimiento: new Date("2026-03-01"),
	},
	{
		id: "eq-007",
		nombre: "Línea Pintura-03",
		tipo: "linea-produccion",
		ubicacion: "Nave D - Línea 3",
		estado: "fuera-servicio",
		ultimoMantenimiento: new Date("2026-01-10"),
		proximoMantenimiento: new Date("2026-02-10"),
	},
	{
		id: "eq-008",
		nombre: "Línea Soldadura-04",
		tipo: "linea-produccion",
		ubicacion: "Nave D - Línea 4",
		estado: "operativo",
		ultimoMantenimiento: new Date("2026-01-30"),
		proximoMantenimiento: new Date("2026-02-28"),
	},
	// Equipos Eléctricos
	{
		id: "eq-009",
		nombre: "Transformador Principal-01",
		tipo: "electricos",
		ubicacion: "Subestación A",
		estado: "operativo",
		ultimoMantenimiento: new Date("2025-12-15"),
		proximoMantenimiento: new Date("2026-03-15"),
	},
	{
		id: "eq-010",
		nombre: "Panel de Control-02",
		tipo: "electricos",
		ubicacion: "Nave A - Oficina",
		estado: "operativo",
		ultimoMantenimiento: new Date("2026-01-22"),
		proximoMantenimiento: new Date("2026-04-22"),
	},
	{
		id: "eq-011",
		nombre: "Compresor Eléctrico-03",
		tipo: "electricos",
		ubicacion: "Nave B - Almacén",
		estado: "operativo",
		ultimoMantenimiento: new Date("2026-02-03"),
		proximoMantenimiento: new Date("2026-03-03"),
	},
	{
		id: "eq-012",
		nombre: "Generador de Emergencia-04",
		tipo: "electricos",
		ubicacion: "Exterior - Zona Segura",
		estado: "operativo",
		ultimoMantenimiento: new Date("2026-01-05"),
		proximoMantenimiento: new Date("2026-04-05"),
	},
	// HVAC
	{
		id: "eq-013",
		nombre: "Aire Acondicionado Central-01",
		tipo: "hvac",
		ubicacion: "Nave A - Techo",
		estado: "operativo",
		ultimoMantenimiento: new Date("2026-01-18"),
		proximoMantenimiento: new Date("2026-02-18"),
	},
	{
		id: "eq-014",
		nombre: "Ventilación Nave B-02",
		tipo: "hvac",
		ubicacion: "Nave B - Techo",
		estado: "operativo",
		ultimoMantenimiento: new Date("2026-02-02"),
		proximoMantenimiento: new Date("2026-03-02"),
	},
	{
		id: "eq-015",
		nombre: "Calefacción Oficinas-03",
		tipo: "hvac",
		ubicacion: "Edificio Administrativo",
		estado: "operativo",
		ultimoMantenimiento: new Date("2026-01-12"),
		proximoMantenimiento: new Date("2026-04-12"),
	},
	{
		id: "eq-016",
		nombre: "Extractor Humos-04",
		tipo: "hvac",
		ubicacion: "Nave D - Soldadura",
		estado: "mantenimiento",
		ultimoMantenimiento: new Date("2026-02-08"),
		proximoMantenimiento: new Date("2026-03-08"),
	},
]

// ============================================================================
// ENVÍOS DE FORMULARIOS (Histórico)
// ============================================================================

export const enviosFormularios: EnvioFormulario[] = [
	{
		id: "env-001",
		idFormulario: "form-001",
		idEquipo: "eq-001",
		idUsuario: "usr-004",
		versionFormulario: 1,
		fechaEnvio: new Date("2026-02-10T08:15:00"),
		estado: "completado",
		respuestas: [
			{ idCampo: "campo-001", valor: "Torno CNC-01" },
			{ idCampo: "campo-002", valor: new Date("2026-02-10") },
			{ idCampo: "campo-003", valor: "Equipo en condiciones normales" },
			{ idCampo: "campo-004", valor: "Óptimo" },
			{ idCampo: "campo-005", valor: 72 },
			{ idCampo: "campo-006", valor: "firma_digital_001" },
		],
	},
	{
		id: "env-002",
		idFormulario: "form-001",
		idEquipo: "eq-002",
		idUsuario: "usr-005",
		versionFormulario: 1,
		fechaEnvio: new Date("2026-02-10T09:30:00"),
		estado: "completado",
		respuestas: [
			{ idCampo: "campo-001", valor: "Prensa Hidráulica-02" },
			{ idCampo: "campo-002", valor: new Date("2026-02-10") },
			{ idCampo: "campo-003", valor: "Presión normal" },
			{ idCampo: "campo-004", valor: "Óptimo" },
			{ idCampo: "campo-005", valor: 68 },
			{ idCampo: "campo-006", valor: "firma_digital_002" },
		],
	},
	{
		id: "env-003",
		idFormulario: "form-002",
		idEquipo: "eq-003",
		idUsuario: "usr-002",
		versionFormulario: 1,
		fechaEnvio: new Date("2026-02-09T14:20:00"),
		estado: "completado",
		respuestas: [
			{ idCampo: "campo-101", valor: "Fresadora-03" },
			{ idCampo: "campo-102", valor: "Ruido anormal en el husillo" },
			{ idCampo: "campo-103", valor: "Media" },
			{ idCampo: "campo-104", valor: ["Motor", "Transmisión"] },
			{ idCampo: "campo-105", valor: "foto_falla_001.jpg" },
			{ idCampo: "campo-106", valor: "firma_digital_003" },
		],
	},
	{
		id: "env-004",
		idFormulario: "form-003",
		idEquipo: "eq-001",
		idUsuario: "usr-002",
		versionFormulario: 1,
		fechaEnvio: new Date("2026-02-08T10:45:00"),
		estado: "completado",
		respuestas: [
			{ idCampo: "campo-201", valor: "Torno CNC-01" },
			{
				idCampo: "campo-202",
				valor: "Cambio de aceite, limpieza de filtros, calibración de ejes",
			},
			{ idCampo: "campo-203", valor: 3.5 },
			{
				idCampo: "campo-204",
				valor: "Aceite ISO 46, filtros de aire, grasa NLGI 2",
			},
			{ idCampo: "campo-205", valor: new Date("2026-03-08") },
			{ idCampo: "campo-206", valor: "firma_digital_004" },
		],
	},
	{
		id: "env-005",
		idFormulario: "form-002",
		idEquipo: "eq-005",
		idUsuario: "usr-004",
		versionFormulario: 1,
		fechaEnvio: new Date("2026-02-07T16:10:00"),
		estado: "completado",
		respuestas: [
			{ idCampo: "campo-101", valor: "Línea Ensamble-01" },
			{ idCampo: "campo-102", valor: "Sensor de posición defectuoso" },
			{ idCampo: "campo-103", valor: "Alta" },
			{ idCampo: "campo-104", valor: ["Eléctrica"] },
			{ idCampo: "campo-105", valor: "foto_falla_002.jpg" },
			{ idCampo: "campo-106", valor: "firma_digital_005" },
		],
	},
	{
		id: "env-006",
		idFormulario: "form-004",
		idEquipo: "eq-005",
		idUsuario: "usr-003",
		versionFormulario: 1,
		fechaEnvio: new Date("2026-02-06T11:25:00"),
		estado: "completado",
		respuestas: [
			{ idCampo: "campo-301", valor: "Línea Ensamble-01" },
			{ idCampo: "campo-302", valor: "Sensor de posición defectuoso" },
			{
				idCampo: "campo-303",
				valor: "Reemplazo de sensor y recalibración del sistema",
			},
			{ idCampo: "campo-304", valor: 450 },
			{ idCampo: "campo-305", valor: 120 },
			{ idCampo: "campo-306", valor: "foto_reparacion_001.jpg" },
			{ idCampo: "campo-307", valor: "firma_digital_006" },
		],
	},
	{
		id: "env-007",
		idFormulario: "form-001",
		idEquipo: "eq-006",
		idUsuario: "usr-005",
		versionFormulario: 1,
		fechaEnvio: new Date("2026-02-05T07:50:00"),
		estado: "completado",
		respuestas: [
			{ idCampo: "campo-001", valor: "Línea Empaque-02" },
			{ idCampo: "campo-002", valor: new Date("2026-02-05") },
			{ idCampo: "campo-003", valor: "Funcionamiento normal" },
			{ idCampo: "campo-004", valor: "Óptimo" },
			{ idCampo: "campo-005", valor: 65 },
			{ idCampo: "campo-006", valor: "firma_digital_007" },
		],
	},
	{
		id: "env-008",
		idFormulario: "form-003",
		idEquipo: "eq-009",
		idUsuario: "usr-002",
		versionFormulario: 1,
		fechaEnvio: new Date("2026-02-04T13:15:00"),
		estado: "completado",
		respuestas: [
			{ idCampo: "campo-201", valor: "Transformador Principal-01" },
			{
				idCampo: "campo-202",
				valor: "Inspección de bobinados, prueba de aislamiento, limpieza",
			},
			{ idCampo: "campo-203", valor: 2 },
			{ idCampo: "campo-204", valor: "Solvente dieléctrico, papel aislante" },
			{ idCampo: "campo-205", valor: new Date("2026-05-04") },
			{ idCampo: "campo-206", valor: "firma_digital_008" },
		],
	},
	{
		id: "env-009",
		idFormulario: "form-002",
		idEquipo: "eq-013",
		idUsuario: "usr-004",
		versionFormulario: 1,
		fechaEnvio: new Date("2026-02-03T15:40:00"),
		estado: "completado",
		respuestas: [
			{ idCampo: "campo-101", valor: "Aire Acondicionado Central-01" },
			{ idCampo: "campo-102", valor: "Fuga de refrigerante" },
			{ idCampo: "campo-103", valor: "Media" },
			{ idCampo: "campo-104", valor: ["Hidráulica"] },
			{ idCampo: "campo-105", valor: "foto_falla_003.jpg" },
			{ idCampo: "campo-106", valor: "firma_digital_009" },
		],
	},
	{
		id: "env-010",
		idFormulario: "form-004",
		idEquipo: "eq-013",
		idUsuario: "usr-003",
		versionFormulario: 1,
		fechaEnvio: new Date("2026-02-02T09:20:00"),
		estado: "completado",
		respuestas: [
			{ idCampo: "campo-301", valor: "Aire Acondicionado Central-01" },
			{ idCampo: "campo-302", valor: "Fuga de refrigerante en conexión" },
			{
				idCampo: "campo-303",
				valor: "Reemplazo de tuberías y recarga de refrigerante",
			},
			{ idCampo: "campo-304", valor: 320 },
			{ idCampo: "campo-305", valor: 180 },
			{ idCampo: "campo-306", valor: "foto_reparacion_002.jpg" },
			{ idCampo: "campo-307", valor: "firma_digital_010" },
		],
	},
	{
		id: "env-011",
		idFormulario: "form-001",
		idEquipo: "eq-008",
		idUsuario: "usr-004",
		versionFormulario: 1,
		fechaEnvio: new Date("2026-02-01T08:00:00"),
		estado: "completado",
		respuestas: [
			{ idCampo: "campo-001", valor: "Línea Soldadura-04" },
			{ idCampo: "campo-002", valor: new Date("2026-02-01") },
			{ idCampo: "campo-003", valor: "Inspección completada sin anomalías" },
			{ idCampo: "campo-004", valor: "Óptimo" },
			{ idCampo: "campo-005", valor: 85 },
			{ idCampo: "campo-006", valor: "firma_digital_011" },
		],
	},
	{
		id: "env-012",
		idFormulario: "form-002",
		idEquipo: "eq-011",
		idUsuario: "usr-005",
		versionFormulario: 1,
		fechaEnvio: new Date("2026-01-31T14:35:00"),
		estado: "completado",
		respuestas: [
			{ idCampo: "campo-101", valor: "Compresor Eléctrico-03" },
			{ idCampo: "campo-102", valor: "Vibración excesiva" },
			{ idCampo: "campo-103", valor: "Alta" },
			{ idCampo: "campo-104", valor: ["Motor", "Estructura"] },
			{ idCampo: "campo-105", valor: "foto_falla_004.jpg" },
			{ idCampo: "campo-106", valor: "firma_digital_012" },
		],
	},
	{
		id: "env-013",
		idFormulario: "form-003",
		idEquipo: "eq-011",
		idUsuario: "usr-002",
		versionFormulario: 1,
		fechaEnvio: new Date("2026-01-30T10:10:00"),
		estado: "completado",
		respuestas: [
			{ idCampo: "campo-201", valor: "Compresor Eléctrico-03" },
			{
				idCampo: "campo-202",
				valor: "Reemplazo de rodamientos, alineación de ejes",
			},
			{ idCampo: "campo-203", valor: 4 },
			{
				idCampo: "campo-204",
				valor: "Rodamientos SKF, grasa de alta temperatura",
			},
			{ idCampo: "campo-205", valor: new Date("2026-03-30") },
			{ idCampo: "campo-206", valor: "firma_digital_013" },
		],
	},
	{
		id: "env-014",
		idFormulario: "form-001",
		idEquipo: "eq-004",
		idUsuario: "usr-004",
		versionFormulario: 1,
		fechaEnvio: new Date("2026-01-29T08:45:00"),
		estado: "completado",
		respuestas: [
			{ idCampo: "campo-001", valor: "Taladro Radial-04" },
			{ idCampo: "campo-002", valor: new Date("2026-01-29") },
			{ idCampo: "campo-003", valor: "Equipo operativo, sin problemas" },
			{ idCampo: "campo-004", valor: "Bajo" },
			{ idCampo: "campo-005", valor: 62 },
			{ idCampo: "campo-006", valor: "firma_digital_014" },
		],
	},
	{
		id: "env-015",
		idFormulario: "form-003",
		idEquipo: "eq-004",
		idUsuario: "usr-003",
		versionFormulario: 1,
		fechaEnvio: new Date("2026-01-28T11:30:00"),
		estado: "completado",
		respuestas: [
			{ idCampo: "campo-201", valor: "Taladro Radial-04" },
			{
				idCampo: "campo-202",
				valor: "Cambio de aceite, inspección de brocas, ajuste de mesa",
			},
			{ idCampo: "campo-203", valor: 2.5 },
			{ idCampo: "campo-204", valor: "Aceite ISO 32, brocas de repuesto" },
			{ idCampo: "campo-205", valor: new Date("2026-02-28") },
			{ idCampo: "campo-206", valor: "firma_digital_015" },
		],
	},
]

// ============================================================================
// HISTORIAL DE MANTENIMIENTOS
// ============================================================================

export const registrosMantenimiento: RegistroMantenimiento[] = [
	{
		id: "mant-001",
		idEquipo: "eq-001",
		tipo: "preventivo",
		descripcion: "Cambio de aceite y filtros",
		tecnico: "María García",
		fechaInicio: new Date("2026-01-28T08:00:00"),
		fechaFin: new Date("2026-01-28T11:30:00"),
		horasEmpleadas: 3.5,
		costo: 280,
		estado: "completado",
	},
	{
		id: "mant-002",
		idEquipo: "eq-002",
		tipo: "preventivo",
		descripcion: "Inspección de sistema hidráulico",
		tecnico: "Juan Rodríguez",
		fechaInicio: new Date("2026-01-15T09:00:00"),
		fechaFin: new Date("2026-01-15T13:00:00"),
		horasEmpleadas: 4,
		costo: 350,
		estado: "completado",
	},
	{
		id: "mant-003",
		idEquipo: "eq-003",
		tipo: "correctivo",
		descripcion: "Reparación de husillo dañado",
		tecnico: "María García",
		fechaInicio: new Date("2026-02-05T08:00:00"),
		fechaFin: new Date("2026-02-07T16:00:00"),
		horasEmpleadas: 16,
		costo: 1200,
		estado: "en-progreso",
	},
	{
		id: "mant-004",
		idEquipo: "eq-005",
		tipo: "correctivo",
		descripcion: "Reemplazo de sensor de posición",
		tecnico: "Juan Rodríguez",
		fechaInicio: new Date("2026-02-06T10:00:00"),
		fechaFin: new Date("2026-02-06T14:00:00"),
		horasEmpleadas: 4,
		costo: 450,
		estado: "completado",
	},
	{
		id: "mant-005",
		idEquipo: "eq-009",
		tipo: "preventivo",
		descripcion: "Prueba de aislamiento y limpieza",
		tecnico: "María García",
		fechaInicio: new Date("2026-02-04T08:00:00"),
		fechaFin: new Date("2026-02-04T10:00:00"),
		horasEmpleadas: 2,
		costo: 180,
		estado: "completado",
	},
	{
		id: "mant-006",
		idEquipo: "eq-013",
		tipo: "correctivo",
		descripcion: "Reparación de fuga de refrigerante",
		tecnico: "Juan Rodríguez",
		fechaInicio: new Date("2026-02-02T09:00:00"),
		fechaFin: new Date("2026-02-02T13:00:00"),
		horasEmpleadas: 4,
		costo: 320,
		estado: "completado",
	},
	{
		id: "mant-007",
		idEquipo: "eq-011",
		tipo: "preventivo",
		descripcion: "Reemplazo de rodamientos",
		tecnico: "María García",
		fechaInicio: new Date("2026-01-30T08:00:00"),
		fechaFin: new Date("2026-01-30T12:00:00"),
		horasEmpleadas: 4,
		costo: 380,
		estado: "completado",
	},
	{
		id: "mant-008",
		idEquipo: "eq-004",
		tipo: "preventivo",
		descripcion: "Mantenimiento rutinario",
		tecnico: "Juan Rodríguez",
		fechaInicio: new Date("2026-01-28T10:00:00"),
		fechaFin: new Date("2026-01-28T12:30:00"),
		horasEmpleadas: 2.5,
		costo: 200,
		estado: "completado",
	},
	{
		id: "mant-009",
		idEquipo: "eq-006",
		tipo: "inspección",
		descripcion: "Inspección general de línea",
		tecnico: "María García",
		fechaInicio: new Date("2026-02-01T08:00:00"),
		fechaFin: new Date("2026-02-01T10:00:00"),
		horasEmpleadas: 2,
		costo: 150,
		estado: "completado",
	},
	{
		id: "mant-010",
		idEquipo: "eq-014",
		tipo: "preventivo",
		descripcion: "Limpieza de filtros y revisión",
		tecnico: "Juan Rodríguez",
		fechaInicio: new Date("2026-02-02T09:00:00"),
		fechaFin: new Date("2026-02-02T11:00:00"),
		horasEmpleadas: 2,
		costo: 140,
		estado: "completado",
	},
]

// ============================================================================
// KPIs PARA DASHBOARD
// ============================================================================

export const kpis: KPI[] = [
	{
		id: "kpi-001",
		nombre: "Disponibilidad de Equipos",
		valor: 94.5,
		unidad: "%",
		tendencia: "arriba",
		periodo: "Febrero 2026",
	},
	{
		id: "kpi-002",
		nombre: "Tiempo Medio de Reparación",
		valor: 4.2,
		unidad: "horas",
		tendencia: "abajo",
		periodo: "Febrero 2026",
	},
	{
		id: "kpi-003",
		nombre: "Costo de Mantenimiento",
		valor: 4280,
		unidad: "USD",
		tendencia: "estable",
		periodo: "Febrero 2026",
	},
	{
		id: "kpi-004",
		nombre: "Mantenimientos Completados",
		valor: 10,
		unidad: "tareas",
		tendencia: "arriba",
		periodo: "Febrero 2026",
	},
	{
		id: "kpi-005",
		nombre: "Equipos en Mantenimiento",
		valor: 2,
		unidad: "equipos",
		tendencia: "abajo",
		periodo: "Febrero 2026",
	},
	{
		id: "kpi-006",
		nombre: "Eficiencia de Inspecciones",
		valor: 98.3,
		unidad: "%",
		tendencia: "arriba",
		periodo: "Febrero 2026",
	},
]
