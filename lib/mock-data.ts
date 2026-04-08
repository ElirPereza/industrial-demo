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

// ============================================================================
// TIPOS — ALERTAS Y ÓRDENES DE TRABAJO
// ============================================================================

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

// ============================================================================
// ALERTAS DE EQUIPOS
// ============================================================================

export const alertasEquipos: AlertaEquipo[] = [
	{
		id: "alrt-001",
		idEquipo: "eq-001",
		marca: "Danfoss",
		modelo: "VLT FC-302",
		codigoFalla: "Alarm 14",
		descripcionFalla: "Sobrecorriente en variador de frecuencia",
		severidad: "critica",
		estado: "activa",
		parametros: [
			{ nombre: "Corriente", valor: "28.5", unidad: "A" },
			{ nombre: "Frecuencia", valor: "45.2", unidad: "Hz" },
			{ nombre: "Voltaje DC bus", valor: "540", unidad: "V" },
		],
		fechaDeteccion: new Date("2026-02-10T07:23:00"),
	},
	{
		id: "alrt-002",
		idEquipo: "eq-005",
		marca: "Siemens",
		modelo: "Sinamics G120",
		codigoFalla: "F7901",
		descripcionFalla: "Motor bloqueado — par de arranque insuficiente",
		severidad: "critica",
		estado: "activa",
		parametros: [
			{ nombre: "Par motor", valor: "0.3", unidad: "Nm" },
			{ nombre: "Corriente", valor: "34.1", unidad: "A" },
		],
		fechaDeteccion: new Date("2026-02-10T06:48:00"),
	},
	{
		id: "alrt-003",
		idEquipo: "eq-009",
		marca: "Siemens",
		modelo: "S7-1200 CPU 1214C",
		codigoFalla: "WARN-CPU",
		descripcionFalla: "Carga de CPU por encima del 85% — riesgo de watchdog",
		severidad: "alta",
		estado: "activa",
		parametros: [
			{ nombre: "CPU Load", valor: "87", unidad: "%" },
			{ nombre: "Ciclo scan", valor: "48", unidad: "ms" },
		],
		fechaDeteccion: new Date("2026-02-10T05:12:00"),
	},
	{
		id: "alrt-004",
		idEquipo: "eq-002",
		marca: "ABB",
		modelo: "ACS580-01",
		codigoFalla: "Alarm 2310",
		descripcionFalla: "Sobrecarga detectada en accionamiento",
		severidad: "alta",
		estado: "reconocida",
		parametros: [
			{ nombre: "Carga", valor: "112", unidad: "%" },
			{ nombre: "Temperatura", valor: "78", unidad: "°C" },
		],
		fechaDeteccion: new Date("2026-02-09T22:15:00"),
		fechaReconocimiento: new Date("2026-02-09T22:40:00"),
	},
	{
		id: "alrt-005",
		idEquipo: "eq-003",
		marca: "Danfoss",
		modelo: "VLT FC-302",
		codigoFalla: "Warning 8",
		descripcionFalla: "Bajo voltaje en bus DC — verificar alimentación",
		severidad: "alta",
		estado: "activa",
		parametros: [
			{ nombre: "Voltaje DC", valor: "385", unidad: "V" },
			{ nombre: "Umbral mín.", valor: "400", unidad: "V" },
		],
		fechaDeteccion: new Date("2026-02-09T18:30:00"),
	},
	{
		id: "alrt-006",
		idEquipo: "eq-013",
		marca: "Danfoss",
		modelo: "MCB 101",
		codigoFalla: "ERR-TEMP",
		descripcionFalla: "Fallo en sensor de temperatura — lectura fuera de rango",
		severidad: "media",
		estado: "activa",
		parametros: [
			{ nombre: "Lectura sensor", valor: "-40", unidad: "°C" },
			{ nombre: "Rango válido", valor: "0–120", unidad: "°C" },
		],
		fechaDeteccion: new Date("2026-02-09T14:05:00"),
	},
	{
		id: "alrt-007",
		idEquipo: "eq-008",
		marca: "Siemens",
		modelo: "Sinamics G120",
		codigoFalla: "A0503",
		descripcionFalla:
			"Temperatura del motor por encima del umbral de advertencia",
		severidad: "media",
		estado: "reconocida",
		parametros: [
			{ nombre: "Temperatura", valor: "142", unidad: "°C" },
			{ nombre: "Umbral warn", valor: "140", unidad: "°C" },
		],
		fechaDeteccion: new Date("2026-02-09T11:20:00"),
		fechaReconocimiento: new Date("2026-02-09T11:45:00"),
	},
	{
		id: "alrt-008",
		idEquipo: "eq-011",
		marca: "ABB",
		modelo: "ACS580-01",
		codigoFalla: "Warning 3220",
		descripcionFalla: "Temperatura del disipador elevada",
		severidad: "media",
		estado: "resuelta",
		parametros: [
			{ nombre: "Temp. disipador", valor: "89", unidad: "°C" },
			{ nombre: "Umbral", valor: "85", unidad: "°C" },
		],
		fechaDeteccion: new Date("2026-02-08T16:40:00"),
		fechaReconocimiento: new Date("2026-02-08T17:00:00"),
		fechaResolucion: new Date("2026-02-08T19:30:00"),
	},
	{
		id: "alrt-009",
		idEquipo: "eq-010",
		marca: "Siemens",
		modelo: "S7-1200 CPU 1214C",
		codigoFalla: "ERR-COM",
		descripcionFalla: "Fallo de comunicación con módulo de expansión SM 1231",
		severidad: "media",
		estado: "resuelta",
		fechaDeteccion: new Date("2026-02-08T09:15:00"),
		fechaReconocimiento: new Date("2026-02-08T09:30:00"),
		fechaResolucion: new Date("2026-02-08T11:00:00"),
	},
	{
		id: "alrt-010",
		idEquipo: "eq-014",
		marca: "Danfoss",
		modelo: "MCB 101",
		codigoFalla: "WARN-FILT",
		descripcionFalla: "Filtro de aire obstruido — presión diferencial alta",
		severidad: "info",
		estado: "reconocida",
		fechaDeteccion: new Date("2026-02-07T13:50:00"),
		fechaReconocimiento: new Date("2026-02-07T14:20:00"),
	},
	{
		id: "alrt-011",
		idEquipo: "eq-006",
		marca: "Siemens",
		modelo: "Sinamics G120",
		codigoFalla: "A0501",
		descripcionFalla: "Límite de corriente alcanzado momentáneamente",
		severidad: "info",
		estado: "resuelta",
		fechaDeteccion: new Date("2026-02-06T20:10:00"),
		fechaResolucion: new Date("2026-02-06T20:15:00"),
	},
	{
		id: "alrt-012",
		idEquipo: "eq-016",
		marca: "ABB",
		modelo: "ACS580-01",
		codigoFalla: "INFO-MAINT",
		descripcionFalla: "Intervalo de mantenimiento programado próximo a vencer",
		severidad: "info",
		estado: "resuelta",
		fechaDeteccion: new Date("2026-02-05T08:00:00"),
		fechaResolucion: new Date("2026-02-08T10:00:00"),
	},
]

// ============================================================================
// ÓRDENES DE TRABAJO
// ============================================================================

export const ordenesTrabajo: OrdenTrabajo[] = [
	{
		id: "ot-001",
		titulo: "Reparación variador Danfoss — Torno CNC-01",
		descripcion:
			"Diagnosticar y reparar alarma de sobrecorriente en variador VLT FC-302. Verificar cableado del motor, medir resistencia de aislamiento y comprobar parámetros del variador.",
		tipo: "correctiva",
		prioridad: "critica",
		estado: "en-progreso",
		idEquipo: "eq-001",
		idAlerta: "alrt-001",
		tecnicoAsignado: "María García",
		solicitante: "Carlos Mendoza",
		fechaCreacion: new Date("2026-02-10T07:30:00"),
		fechaInicioProgramada: new Date("2026-02-10T08:00:00"),
		fechaInicioReal: new Date("2026-02-10T08:15:00"),
		tiempoEstimadoHoras: 4,
		checklist: [
			{
				id: "ck-001",
				categoria: "epp",
				descripcion: "Guantes dieléctricos clase 0",
				completado: true,
			},
			{
				id: "ck-002",
				categoria: "epp",
				descripcion: "Gafas de seguridad",
				completado: true,
			},
			{
				id: "ck-003",
				categoria: "herramienta",
				descripcion: "Megóhmetro Fluke 1587",
				completado: true,
			},
			{
				id: "ck-004",
				categoria: "herramienta",
				descripcion: "Pinza amperimétrica",
				completado: true,
			},
			{
				id: "ck-005",
				categoria: "procedimiento",
				descripcion: "Bloqueo/Etiquetado (LOTO) completado",
				completado: true,
			},
			{
				id: "ck-006",
				categoria: "procedimiento",
				descripcion: "Medir aislamiento del motor (>1MΩ)",
				completado: false,
			},
			{
				id: "ck-007",
				categoria: "repuesto",
				descripcion: "Módulo IGBT de repuesto FC-302",
				completado: false,
			},
			{
				id: "ck-008",
				categoria: "procedimiento",
				descripcion: "Prueba de funcionamiento post-reparación",
				completado: false,
			},
		],
		notas:
			"Se detectó olor a quemado en el gabinete del variador. Posible fallo de módulo de potencia.",
	},
	{
		id: "ot-002",
		titulo: "Desbloqueo motor Sinamics — Línea Ensamble-01",
		descripcion:
			"Motor principal bloqueado en arranque. Verificar acoplamiento mecánico, revisar encoder y ajustar parámetros de par de arranque en el Sinamics G120.",
		tipo: "correctiva",
		prioridad: "critica",
		estado: "asignada",
		idEquipo: "eq-005",
		idAlerta: "alrt-002",
		tecnicoAsignado: "Juan Rodríguez",
		solicitante: "Carlos Mendoza",
		fechaCreacion: new Date("2026-02-10T07:00:00"),
		fechaInicioProgramada: new Date("2026-02-10T09:00:00"),
		tiempoEstimadoHoras: 3,
		checklist: [
			{
				id: "ck-009",
				categoria: "epp",
				descripcion: "Casco de seguridad",
				completado: false,
			},
			{
				id: "ck-010",
				categoria: "epp",
				descripcion: "Guantes mecánicos",
				completado: false,
			},
			{
				id: "ck-011",
				categoria: "herramienta",
				descripcion: "Alineador láser SKF TKSA 41",
				completado: false,
			},
			{
				id: "ck-012",
				categoria: "herramienta",
				descripcion: "Juego de llaves Allen métricas",
				completado: false,
			},
			{
				id: "ck-013",
				categoria: "procedimiento",
				descripcion: "Inspeccionar acoplamiento flexible",
				completado: false,
			},
			{
				id: "ck-014",
				categoria: "procedimiento",
				descripcion: "Verificar señal encoder",
				completado: false,
			},
		],
	},
	{
		id: "ot-003",
		titulo: "Mantenimiento preventivo — Prensa Hidráulica-02",
		descripcion:
			"Mantenimiento programado: cambio de aceite hidráulico, reemplazo de filtros, inspección de cilindros y verificación de presiones del sistema.",
		tipo: "preventiva",
		prioridad: "media",
		estado: "creada",
		idEquipo: "eq-002",
		tecnicoAsignado: "María García",
		solicitante: "Ana López",
		fechaCreacion: new Date("2026-02-09T10:00:00"),
		fechaInicioProgramada: new Date("2026-02-12T08:00:00"),
		tiempoEstimadoHoras: 6,
		checklist: [
			{
				id: "ck-015",
				categoria: "epp",
				descripcion: "Overol anti-salpicaduras",
				completado: false,
			},
			{
				id: "ck-016",
				categoria: "repuesto",
				descripcion: "Aceite hidráulico ISO VG 46 (20L)",
				completado: false,
			},
			{
				id: "ck-017",
				categoria: "repuesto",
				descripcion: "Filtro de presión HF-3520",
				completado: false,
			},
			{
				id: "ck-018",
				categoria: "repuesto",
				descripcion: "Filtro de retorno RF-1240",
				completado: false,
			},
			{
				id: "ck-019",
				categoria: "herramienta",
				descripcion: "Bomba de vaciado portátil",
				completado: false,
			},
			{
				id: "ck-020",
				categoria: "procedimiento",
				descripcion: "Drenar sistema hidráulico completo",
				completado: false,
			},
			{
				id: "ck-021",
				categoria: "procedimiento",
				descripcion: "Verificar presiones: 200±5 bar",
				completado: false,
			},
		],
	},
	{
		id: "ot-004",
		titulo: "Reemplazo sensor temperatura — A/C Central",
		descripcion:
			"Reemplazar sensor de temperatura defectuoso en unidad de aire acondicionado central. Calibrar nuevo sensor y verificar lecturas contra referencia.",
		tipo: "correctiva",
		prioridad: "alta",
		estado: "en-progreso",
		idEquipo: "eq-013",
		idAlerta: "alrt-006",
		tecnicoAsignado: "Juan Rodríguez",
		solicitante: "Pedro Sánchez",
		fechaCreacion: new Date("2026-02-09T14:30:00"),
		fechaInicioProgramada: new Date("2026-02-10T07:00:00"),
		fechaInicioReal: new Date("2026-02-10T07:10:00"),
		tiempoEstimadoHoras: 2,
		checklist: [
			{
				id: "ck-022",
				categoria: "epp",
				descripcion: "Arnés de seguridad (trabajo en altura)",
				completado: true,
			},
			{
				id: "ck-023",
				categoria: "repuesto",
				descripcion: "Sensor PT100 clase A",
				completado: true,
			},
			{
				id: "ck-024",
				categoria: "herramienta",
				descripcion: "Multímetro con medición Ω",
				completado: true,
			},
			{
				id: "ck-025",
				categoria: "procedimiento",
				descripcion: "Desconectar alimentación del módulo",
				completado: true,
			},
			{
				id: "ck-026",
				categoria: "procedimiento",
				descripcion: "Calibrar sensor con referencia 0°C/100°C",
				completado: false,
			},
		],
	},
	{
		id: "ot-005",
		titulo: "Análisis vibraciones — Compresor Eléctrico-03",
		descripcion:
			"Realizar análisis de vibraciones predictivo en compresor. Monitorear rodamientos, desbalanceo y desalineación usando colector de datos.",
		tipo: "predictiva",
		prioridad: "media",
		estado: "completada",
		idEquipo: "eq-011",
		tecnicoAsignado: "María García",
		solicitante: "Carlos Mendoza",
		fechaCreacion: new Date("2026-02-07T09:00:00"),
		fechaInicioProgramada: new Date("2026-02-08T08:00:00"),
		fechaInicioReal: new Date("2026-02-08T08:30:00"),
		fechaFinReal: new Date("2026-02-08T12:00:00"),
		tiempoEstimadoHoras: 4,
		tiempoRealHoras: 3.5,
		checklist: [
			{
				id: "ck-027",
				categoria: "epp",
				descripcion: "Protección auditiva",
				completado: true,
			},
			{
				id: "ck-028",
				categoria: "herramienta",
				descripcion: "Colector de vibraciones SKF Microlog",
				completado: true,
			},
			{
				id: "ck-029",
				categoria: "herramienta",
				descripcion: "Acelerómetro triaxial",
				completado: true,
			},
			{
				id: "ck-030",
				categoria: "procedimiento",
				descripcion: "Medir en puntos V, H, A (4 rodamientos)",
				completado: true,
			},
			{
				id: "ck-031",
				categoria: "procedimiento",
				descripcion: "Analizar espectro y tendencia",
				completado: true,
			},
			{
				id: "ck-032",
				categoria: "procedimiento",
				descripcion: "Documentar resultados en sistema",
				completado: true,
			},
		],
		notas:
			"Vibraciones dentro de norma ISO 10816. Próxima medición en 90 días.",
	},
	{
		id: "ot-006",
		titulo: "Limpieza filtros — Ventilación Nave B",
		descripcion:
			"Limpieza y reemplazo de filtros de aire en sistema de ventilación. Inspeccionar dampers y verificar caudal de aire.",
		tipo: "preventiva",
		prioridad: "baja",
		estado: "completada",
		idEquipo: "eq-014",
		idAlerta: "alrt-010",
		tecnicoAsignado: "Juan Rodríguez",
		solicitante: "Ana López",
		fechaCreacion: new Date("2026-02-07T14:30:00"),
		fechaInicioProgramada: new Date("2026-02-08T14:00:00"),
		fechaInicioReal: new Date("2026-02-08T14:15:00"),
		fechaFinReal: new Date("2026-02-08T16:30:00"),
		tiempoEstimadoHoras: 3,
		tiempoRealHoras: 2.25,
		checklist: [
			{
				id: "ck-033",
				categoria: "epp",
				descripcion: "Mascarilla P100 para partículas",
				completado: true,
			},
			{
				id: "ck-034",
				categoria: "repuesto",
				descripcion: "Filtros HEPA 24x24x4 (x6)",
				completado: true,
			},
			{
				id: "ck-035",
				categoria: "herramienta",
				descripcion: "Anemómetro digital",
				completado: true,
			},
			{
				id: "ck-036",
				categoria: "procedimiento",
				descripcion: "Medir caudal antes/después",
				completado: true,
			},
			{
				id: "ck-037",
				categoria: "procedimiento",
				descripcion: "Registrar presión diferencial",
				completado: true,
			},
		],
	},
	{
		id: "ot-007",
		titulo: "Mejora sistema de monitoreo — Panel de Control",
		descripcion:
			"Instalar módulo adicional de comunicación Profinet en panel de control para integración con sistema SCADA. Configurar direcciones IP y mapeo de variables.",
		tipo: "mejora",
		prioridad: "media",
		estado: "creada",
		idEquipo: "eq-010",
		tecnicoAsignado: "María García",
		solicitante: "Carlos Mendoza",
		fechaCreacion: new Date("2026-02-08T11:00:00"),
		fechaInicioProgramada: new Date("2026-02-14T08:00:00"),
		tiempoEstimadoHoras: 8,
		checklist: [
			{
				id: "ck-038",
				categoria: "repuesto",
				descripcion: "Módulo CM 1241 RS422/485",
				completado: false,
			},
			{
				id: "ck-039",
				categoria: "repuesto",
				descripcion: "Cable Profinet Cat 6A (10m)",
				completado: false,
			},
			{
				id: "ck-040",
				categoria: "herramienta",
				descripcion: "Laptop con TIA Portal V18",
				completado: false,
			},
			{
				id: "ck-041",
				categoria: "procedimiento",
				descripcion: "Backup del programa PLC actual",
				completado: false,
			},
			{
				id: "ck-042",
				categoria: "procedimiento",
				descripcion: "Configurar dirección IP módulo",
				completado: false,
			},
			{
				id: "ck-043",
				categoria: "procedimiento",
				descripcion: "Mapear variables E/S en SCADA",
				completado: false,
			},
			{
				id: "ck-044",
				categoria: "procedimiento",
				descripcion: "Prueba de comunicación end-to-end",
				completado: false,
			},
		],
	},
	{
		id: "ot-008",
		titulo: "Reparación disipador — Compresor Eléctrico-03",
		descripcion:
			"Limpiar disipador de calor del variador ABB ACS580 y reemplazar pasta térmica. Verificar funcionamiento de ventiladores de refrigeración.",
		tipo: "correctiva",
		prioridad: "media",
		estado: "completada",
		idEquipo: "eq-011",
		idAlerta: "alrt-008",
		tecnicoAsignado: "Juan Rodríguez",
		solicitante: "María García",
		fechaCreacion: new Date("2026-02-08T17:00:00"),
		fechaInicioProgramada: new Date("2026-02-09T08:00:00"),
		fechaInicioReal: new Date("2026-02-09T08:00:00"),
		fechaFinReal: new Date("2026-02-09T10:30:00"),
		tiempoEstimadoHoras: 3,
		tiempoRealHoras: 2.5,
		checklist: [
			{
				id: "ck-045",
				categoria: "epp",
				descripcion: "Guantes antiestáticos ESD",
				completado: true,
			},
			{
				id: "ck-046",
				categoria: "repuesto",
				descripcion: "Pasta térmica Dow Corning TC-5022",
				completado: true,
			},
			{
				id: "ck-047",
				categoria: "herramienta",
				descripcion: "Pistola de aire comprimido",
				completado: true,
			},
			{
				id: "ck-048",
				categoria: "herramienta",
				descripcion: "Termómetro infrarrojo",
				completado: true,
			},
			{
				id: "ck-049",
				categoria: "procedimiento",
				descripcion: "Limpiar aletas del disipador",
				completado: true,
			},
			{
				id: "ck-050",
				categoria: "procedimiento",
				descripcion: "Aplicar pasta térmica y rearmar",
				completado: true,
			},
		],
		notas: "Ventilador derecho con rodamiento ruidoso. Programar reemplazo.",
	},
	{
		id: "ot-009",
		titulo: "Inspección termográfica — Transformador Principal",
		descripcion:
			"Inspección termográfica programada de conexiones y bobinados del transformador principal. Buscar puntos calientes y conexiones flojas.",
		tipo: "predictiva",
		prioridad: "alta",
		estado: "asignada",
		idEquipo: "eq-009",
		tecnicoAsignado: "María García",
		solicitante: "Carlos Mendoza",
		fechaCreacion: new Date("2026-02-09T08:00:00"),
		fechaInicioProgramada: new Date("2026-02-11T06:00:00"),
		tiempoEstimadoHoras: 3,
		checklist: [
			{
				id: "ck-051",
				categoria: "epp",
				descripcion: "Guantes dieléctricos clase 2",
				completado: false,
			},
			{
				id: "ck-052",
				categoria: "epp",
				descripcion: "Careta con protección UV",
				completado: false,
			},
			{
				id: "ck-053",
				categoria: "herramienta",
				descripcion: "Cámara termográfica FLIR T540",
				completado: false,
			},
			{
				id: "ck-054",
				categoria: "procedimiento",
				descripcion: "Capturar imágenes en carga >70%",
				completado: false,
			},
			{
				id: "ck-055",
				categoria: "procedimiento",
				descripcion: "Comparar con baseline anterior",
				completado: false,
			},
			{
				id: "ck-056",
				categoria: "procedimiento",
				descripcion: "Generar reporte con análisis",
				completado: false,
			},
		],
	},
	{
		id: "ot-010",
		titulo: "Mantenimiento extractor de humos — Nave D",
		descripcion:
			"Mantenimiento completo del sistema extractor de humos en zona de soldadura. Limpieza de ductos, reemplazo de motor y balanceo del ventilador.",
		tipo: "preventiva",
		prioridad: "alta",
		estado: "verificada",
		idEquipo: "eq-016",
		tecnicoAsignado: "Juan Rodríguez",
		solicitante: "Pedro Sánchez",
		fechaCreacion: new Date("2026-02-05T09:00:00"),
		fechaInicioProgramada: new Date("2026-02-06T08:00:00"),
		fechaInicioReal: new Date("2026-02-06T08:00:00"),
		fechaFinReal: new Date("2026-02-07T14:00:00"),
		tiempoEstimadoHoras: 12,
		tiempoRealHoras: 14,
		checklist: [
			{
				id: "ck-057",
				categoria: "epp",
				descripcion: "Respirador de cara completa",
				completado: true,
			},
			{
				id: "ck-058",
				categoria: "epp",
				descripcion: "Arnés anticaída",
				completado: true,
			},
			{
				id: "ck-059",
				categoria: "repuesto",
				descripcion: "Motor WEG W22 5HP",
				completado: true,
			},
			{
				id: "ck-060",
				categoria: "repuesto",
				descripcion: "Correas trapezoidales B-68 (x3)",
				completado: true,
			},
			{
				id: "ck-061",
				categoria: "herramienta",
				descripcion: "Balanceador dinámico portátil",
				completado: true,
			},
			{
				id: "ck-062",
				categoria: "procedimiento",
				descripcion: "Limpiar ductos con aspiradora industrial",
				completado: true,
			},
			{
				id: "ck-063",
				categoria: "procedimiento",
				descripcion: "Instalar y alinear motor nuevo",
				completado: true,
			},
			{
				id: "ck-064",
				categoria: "procedimiento",
				descripcion: "Balancear ventilador in situ",
				completado: true,
			},
		],
		notas:
			"Motor anterior presentaba fallo de rodamiento. Se verificó el funcionamiento post-instalación. Caudal medido: 4,200 CFM (nominal: 4,000 CFM).",
	},
]
