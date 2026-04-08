"use client"

import {
	ArrowLeft,
	CheckCircle,
	ClipboardText,
	Clock,
	Cpu,
	Download,
	Eye,
	FileDoc,
	FilePdf,
	FileText,
	Images,
	Info,
	MapPin,
	PencilSimple,
	PlugsConnected,
	QrCode,
	Timer,
	Upload,
	WifiHigh,
	Wrench,
} from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import {
	use,
	useCallback,
	useEffect,
	useRef,
	useState,
	type ChangeEvent,
} from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageError } from "@/components/page-error"
import { PageLoading } from "@/components/page-loading"
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar"
import {
	mapAlertaRow,
	mapEnvioRow,
	mapEquipoRow,
	mapFormTemplateRow,
	mapMantenimientoRow,
	mapProfileRow,
} from "@/lib/data-mappers"
import type {
	AlertaEquipo,
	EnvioFormulario,
	Equipo,
	FormTemplate,
	RegistroMantenimiento,
	Usuario,
} from "@/lib/types"
import { useRole } from "@/lib/role-provider"
import { createClient } from "@/lib/supabase/client"
import type { Tables, TablesInsert } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

interface ArchivoEquipo {
	id: string
	tipo: string
	nombre: string
	nombre_archivo: string
	storage_path: string
	mime_type: string
	tamano_bytes: number | null
	created_at: string
}

// Extended activity types for timeline
type ActividadTipo =
	| "mantenimiento"
	| "inspeccion"
	| "falla"
	| "documento"
	| "modificacion"

interface ActividadEquipo {
	id: string
	tipo: ActividadTipo
	titulo: string
	descripcion: string
	usuario: string
	rol: string
	fecha: Date
	detalles?: {
		horasEmpleadas?: number
		costo?: number
		estado?: string
		[key: string]: string | number | undefined
	}
}

// Mock extended activity for equipment
const actividadesMock: Record<string, ActividadEquipo[]> = {
	"eq-001": [
		{
			id: "act-001",
			tipo: "mantenimiento",
			titulo: "Mantenimiento Preventivo",
			descripcion: "Cambio de aceite y filtros completado",
			usuario: "María García",
			rol: "Técnico",
			fecha: new Date("2026-01-28T11:30:00"),
			detalles: { horasEmpleadas: 3.5, costo: 280 },
		},
		{
			id: "act-002",
			tipo: "inspeccion",
			titulo: "Inspección Pre-Operacional",
			descripcion: "Verificación diaria - Sin anomalías",
			usuario: "Ana López",
			rol: "Operador",
			fecha: new Date("2026-02-10T08:15:00"),
		},
		{
			id: "act-003",
			tipo: "documento",
			titulo: "Certificado Actualizado",
			descripcion: "Se cargó nuevo certificado de calibración",
			usuario: "Carlos Mendoza",
			rol: "Administrador",
			fecha: new Date("2025-12-01T10:00:00"),
		},
		{
			id: "act-004",
			tipo: "modificacion",
			titulo: "Actualización de Firmware",
			descripcion: "Control numérico actualizado a versión 3.2.1",
			usuario: "Contratista: TechMaint Solutions",
			rol: "Contratista",
			fecha: new Date("2025-11-15T14:00:00"),
		},
	],
	"eq-003": [
		{
			id: "act-005",
			tipo: "falla",
			titulo: "Falla Reportada",
			descripcion: "Ruido anormal detectado en el husillo",
			usuario: "María García",
			rol: "Técnico",
			fecha: new Date("2026-02-05T08:00:00"),
		},
		{
			id: "act-006",
			tipo: "mantenimiento",
			titulo: "Reparación Correctiva",
			descripcion: "Reparación de husillo dañado - En progreso",
			usuario: "María García",
			rol: "Técnico",
			fecha: new Date("2026-02-05T09:00:00"),
			detalles: { horasEmpleadas: 16, costo: 1200 },
		},
	],
}

type TabType = "info" | "formularios" | "documentos" | "galeria" | "historial"

export default function EquipoDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id: equipoId } = use(params)
	const router = useRouter()
	const { user } = useRole()
	const [activeTab, setActiveTab] = useState<TabType>("info")
	const [equipo, setEquipo] = useState<Equipo | null>(null)
	const [registrosMantenimiento, setRegistrosMantenimiento] = useState<
		RegistroMantenimiento[]
	>([])
	const [archivosEquipo, setArchivosEquipo] = useState<ArchivoEquipo[]>([])
	const [alertasEquipos, setAlertasEquipos] = useState<AlertaEquipo[]>([])
	const [enviosFormularios, setEnviosFormularios] = useState<EnvioFormulario[]>(
		[],
	)
	const [formulariosTemplate, setFormulariosTemplate] = useState<
		FormTemplate[]
	>([])
	const [usuarios, setUsuarios] = useState<Usuario[]>([])
	const [uploadError, setUploadError] = useState<string | null>(null)
	const [uploadingTipo, setUploadingTipo] = useState<
		"imagen" | "documento" | "manual" | null
	>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const imageInputRef = useRef<HTMLInputElement>(null)
	const documentInputRef = useRef<HTMLInputElement>(null)

	const loadEquipoDetalle = useCallback(async () => {
		setIsLoading(true)
		setError(null)

		try {
			const supabase = createClient()
			const [
				equipoResult,
				mantenimientoResult,
				archivosResult,
				alertasResult,
				enviosResult,
				formulariosResult,
				profilesResult,
			] = await Promise.all([
				supabase.from("equipos").select("*").eq("id", equipoId).single(),
				supabase
					.from("registros_mantenimiento")
					.select("*")
					.eq("id_equipo", equipoId),
				supabase
					.from("equipo_archivos")
					.select("*")
					.eq("id_equipo", equipoId)
					.order("created_at", { ascending: false }),
				supabase.from("alertas_equipos").select("*").eq("id_equipo", equipoId),
				supabase
					.from("envios_formularios")
					.select("*")
					.eq("id_equipo", equipoId),
				supabase.from("form_templates").select("*"),
				supabase.from("profiles").select("*"),
			])

			if (equipoResult.error && equipoResult.error.code !== "PGRST116") {
				throw equipoResult.error
			}

			if (mantenimientoResult.error) {
				throw mantenimientoResult.error
			}

			if (alertasResult.error) {
				throw alertasResult.error
			}

			if (archivosResult.error) {
				throw archivosResult.error
			}

			if (enviosResult.error) {
				throw enviosResult.error
			}

			if (formulariosResult.error) {
				throw formulariosResult.error
			}

			if (profilesResult.error) {
				throw profilesResult.error
			}

			const equipoRow: Tables<"equipos"> | null = equipoResult.data
			const mantenimientoRows = mantenimientoResult.data ?? []
			const archivosRows = archivosResult.data ?? []
			const alertasRows = alertasResult.data ?? []
			const enviosRows = enviosResult.data ?? []
			const formulariosRows = formulariosResult.data ?? []
			const profileRows = profilesResult.data ?? []

			setEquipo(equipoRow ? mapEquipoRow(equipoRow) : null)
			setRegistrosMantenimiento(
				mantenimientoRows.map((row: Tables<"registros_mantenimiento">) =>
					mapMantenimientoRow(row),
				),
			)
			setArchivosEquipo(archivosRows)
			setAlertasEquipos(
				alertasRows.map((row: Tables<"alertas_equipos">) => mapAlertaRow(row)),
			)
			setEnviosFormularios(
				enviosRows.map((row: Tables<"envios_formularios">) => mapEnvioRow(row)),
			)
			setFormulariosTemplate(
				formulariosRows.map((row: Tables<"form_templates">) =>
					mapFormTemplateRow(row),
				),
			)
			setUsuarios(
				profileRows.map((row: Tables<"profiles">) => mapProfileRow(row)),
			)
		} catch (fetchError) {
			setError(
				fetchError instanceof Error
					? fetchError.message
					: "Ocurrió un error al cargar el equipo",
			)
		} finally {
			setIsLoading(false)
		}
	}, [equipoId])

	useEffect(() => {
		void loadEquipoDetalle()
	}, [loadEquipoDetalle])

	const handleFileUpload = useCallback(
		async (file: File, tipo: "imagen" | "documento" | "manual") => {
			const supabase = createClient()
			const ext = file.name.split(".").pop()
			const path = `equipos/${equipoId}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext ? `.${ext}` : ""}`

			const { error: storageError } = await supabase.storage
				.from("equipos-media")
				.upload(path, file, {
					contentType: file.type || undefined,
				})

			if (storageError) {
				throw storageError
			}

			const {
				data: { publicUrl },
			} = supabase.storage.from("equipos-media").getPublicUrl(path)

			const payload: TablesInsert<"equipo_archivos"> = {
				id_equipo: equipoId,
				tipo,
				nombre: file.name,
				nombre_archivo: file.name,
				storage_path: publicUrl,
				mime_type: file.type || "application/octet-stream",
				tamano_bytes: file.size,
				subido_por: user?.id ?? null,
			}

			const { error: insertError } = await supabase
				.from("equipo_archivos")
				.insert(payload)

			if (insertError) {
				throw insertError
			}
		},
		[equipoId, user?.id],
	)

	const handleFilesSelected = useCallback(
		async (
			event: ChangeEvent<HTMLInputElement>,
			tipo: "imagen" | "documento" | "manual",
		) => {
			const files = event.target.files

			if (!files?.length) {
				return
			}

			setUploadError(null)
			setUploadingTipo(tipo)

			try {
				for (const file of Array.from(files)) {
					await handleFileUpload(file, tipo)
				}

				await loadEquipoDetalle()
			} catch (uploadFileError) {
				setUploadError(
					uploadFileError instanceof Error
						? uploadFileError.message
						: "No se pudo subir el archivo",
				)
			} finally {
				setUploadingTipo(null)
				event.target.value = ""
			}
		},
		[handleFileUpload, loadEquipoDetalle],
	)

	const historial = registrosMantenimiento
		.filter((r) => r.idEquipo === equipoId)
		.sort((a, b) => b.fechaInicio.getTime() - a.fechaInicio.getTime())

	if (isLoading) {
		return <PageLoading message="Cargando detalles del equipo..." />
	}

	if (error) {
		return (
			<PageError
				message="No se pudo cargar el equipo"
				description={error}
				onRetry={() => void loadEquipoDetalle()}
			/>
		)
	}

	const documentos = archivosEquipo.filter(
		(archivo) => archivo.tipo !== "imagen",
	)
	const imagenes = archivosEquipo.filter((archivo) => archivo.tipo === "imagen")
	const actividades = actividadesMock[equipoId] || []

	const formatFileSize = (bytes: number | null) => {
		if (!bytes) {
			return "Tamaño no disponible"
		}

		if (bytes < 1024) {
			return `${bytes} B`
		}

		const units = ["KB", "MB", "GB"]
		let value = bytes / 1024
		let unitIndex = 0

		while (value >= 1024 && unitIndex < units.length - 1) {
			value /= 1024
			unitIndex += 1
		}

		return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`
	}

	const getDocumentIcon = (archivo: ArchivoEquipo) => {
		if (
			archivo.mime_type === "application/pdf" ||
			archivo.nombre_archivo.toLowerCase().endsWith(".pdf")
		) {
			return FilePdf
		}

		if (
			archivo.mime_type.includes("word") ||
			archivo.nombre_archivo.toLowerCase().endsWith(".doc") ||
			archivo.nombre_archivo.toLowerCase().endsWith(".docx")
		) {
			return FileDoc
		}

		return FileText
	}

	// Get applicable forms for this equipment
	const formulariosAplicables = formulariosTemplate.filter((f) => {
		if (!f.activo) return false
		if (f.asociacion.tipo === "general") return true
		if (f.asociacion.tipo === "equipo" && f.asociacion.valor === equipoId)
			return true
		if (
			f.asociacion.tipo === "tipo-equipo" &&
			f.asociacion.valor === equipo?.tipo
		)
			return true
		if (
			f.asociacion.tipo === "area" &&
			equipo?.ubicacion.includes(f.asociacion.valor || "")
		)
			return true
		return false
	})

	// Get recent form submissions for this equipment
	const enviosRecientes = enviosFormularios
		.filter((e) => e.idEquipo === equipoId)
		.sort((a, b) => b.fechaEnvio.getTime() - a.fechaEnvio.getTime())
		.slice(0, 10)

	// Combine maintenance records with other activities for full timeline
	const timelineCompleto: ActividadEquipo[] = [
		...historial.map((r) => ({
			id: r.id,
			tipo:
				r.tipo === "inspección"
					? "inspeccion"
					: ("mantenimiento" as ActividadTipo),
			titulo: `${r.tipo.charAt(0).toUpperCase() + r.tipo.slice(1)}`,
			descripcion: r.descripcion,
			usuario: r.tecnico,
			rol: "Técnico",
			fecha: r.fechaInicio,
			detalles: {
				horasEmpleadas: r.horasEmpleadas,
				costo: r.costo,
				estado: r.estado,
			},
		})),
		...alertasEquipos.map((alerta) => ({
			id: alerta.id,
			tipo: "falla" as ActividadTipo,
			titulo: `Alerta ${alerta.codigoFalla}`,
			descripcion: alerta.descripcionFalla,
			usuario: "Sistema IoT",
			rol: "Sistema",
			fecha: alerta.fechaDeteccion,
			detalles: {
				estado: alerta.estado,
			},
		})),
		...actividades,
	].sort((a, b) => b.fecha.getTime() - a.fecha.getTime())

	if (!equipo) {
		return (
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<div className="flex min-h-screen items-center justify-center">
						<div className="text-center">
							<h1 className="text-2xl font-semibold">Equipo no encontrado</h1>
							<Button className="mt-4" onClick={() => router.push("/activos")}>
								Volver a Activos
							</Button>
						</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
		)
	}

	// Calculate stats
	const totalIntervenciones = historial.length
	const ultimaFalla = historial.find((r) => r.tipo === "correctivo")
	const horasTotales = historial.reduce((sum, r) => sum + r.horasEmpleadas, 0)
	const costoTotal = historial.reduce((sum, r) => sum + r.costo, 0)

	const tabs = [
		{ id: "info" as TabType, label: "Información", icon: Info },
		{
			id: "formularios" as TabType,
			label: "Formularios",
			icon: ClipboardText,
			count: formulariosAplicables.length,
		},
		{
			id: "documentos" as TabType,
			label: "Documentos",
			icon: FileText,
			count: documentos.length,
		},
		{
			id: "galeria" as TabType,
			label: "Galería",
			icon: Images,
			count: imagenes.length,
		},
		{
			id: "historial" as TabType,
			label: "Historial",
			icon: Timer,
			count: timelineCompleto.length,
		},
	]

	const getActividadIcon = (tipo: ActividadTipo) => {
		switch (tipo) {
			case "mantenimiento":
				return Wrench
			case "inspeccion":
				return CheckCircle
			case "falla":
				return Clock
			case "documento":
				return FileText
			case "modificacion":
				return Wrench
			default:
				return Info
		}
	}

	const getActividadColor = (tipo: ActividadTipo) => {
		switch (tipo) {
			case "mantenimiento":
				return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
			case "inspeccion":
				return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
			case "falla":
				return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
			case "documento":
				return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
			case "modificacion":
				return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
			default:
				return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
		}
	}

	const isUploadingImage = uploadingTipo === "imagen"
	const isUploadingDocument =
		uploadingTipo === "documento" || uploadingTipo === "manual"

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator
							orientation="vertical"
							className="mr-2 data-vertical:h-4 data-vertical:self-auto"
						/>
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem className="hidden md:block">
									<BreadcrumbLink href="/dashboard">
										Portal Industrial
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbLink href="/activos">Activos</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>{equipo.nombre}</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>

				<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
					{/* Back button */}
					<Button
						variant="ghost"
						className="w-fit"
						onClick={() => router.push("/activos")}
					>
						<ArrowLeft className="mr-2 size-4" weight="bold" />
						Volver a Activos
					</Button>

					{/* Equipment header */}
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<div className="flex items-center gap-3">
								<h1 className="text-3xl font-semibold">{equipo.nombre}</h1>
								<span
									className={cn(
										"rounded-full px-3 py-1 text-sm font-medium",
										equipo.estado === "operativo" &&
											"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
										equipo.estado === "mantenimiento" &&
											"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
										equipo.estado === "fuera-servicio" &&
											"bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
									)}
								>
									{equipo.estado === "operativo"
										? "Operativo"
										: equipo.estado === "mantenimiento"
											? "En Mantenimiento"
											: "Fuera de Servicio"}
								</span>
							</div>
							<div className="mt-2 flex items-center gap-2 text-muted-foreground">
								<MapPin className="size-4" />
								<span>{equipo.ubicacion}</span>
							</div>
						</div>
						<Button variant="outline" onClick={() => router.push("/qr-codes")}>
							<QrCode className="mr-2 size-4" />
							Ver Código QR
						</Button>
					</div>

					{/* Tabs */}
					<div className="flex gap-1 rounded-lg bg-muted p-1">
						{tabs.map((tab) => (
							<button
								key={tab.id}
								type="button"
								onClick={() => setActiveTab(tab.id)}
								className={cn(
									"flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
									activeTab === tab.id
										? "bg-background text-foreground shadow-sm"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								<tab.icon className="size-4" />
								<span className="hidden sm:inline">{tab.label}</span>
								{tab.count !== undefined && (
									<span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
										{tab.count}
									</span>
								)}
							</button>
						))}
					</div>

					{/* Tab Content */}
					{activeTab === "info" && (
						<div className="grid gap-6 lg:grid-cols-3">
							{/* Stats cards */}
							<div className="space-y-4 lg:col-span-2">
								<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
									<Card>
										<CardContent className="p-4">
											<p className="text-sm text-muted-foreground">
												Intervenciones
											</p>
											<p className="text-2xl font-semibold">
												{totalIntervenciones}
											</p>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<p className="text-sm text-muted-foreground">
												Última Falla
											</p>
											<p className="text-lg font-semibold">
												{ultimaFalla
													? ultimaFalla.fechaInicio.toLocaleDateString(
															"es-ES",
															{
																day: "2-digit",
																month: "short",
															},
														)
													: "Sin fallas"}
											</p>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<p className="text-sm text-muted-foreground">
												Horas Mant.
											</p>
											<p className="text-2xl font-semibold">{horasTotales}h</p>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<p className="text-sm text-muted-foreground">
												Costo Total
											</p>
											<p className="text-2xl font-semibold">
												${costoTotal.toLocaleString()}
											</p>
										</CardContent>
									</Card>
								</div>

								{/* Equipment Details */}
								<Card>
									<CardHeader>
										<CardTitle>Detalles del Equipo</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid gap-4 sm:grid-cols-2">
											<div>
												<p className="text-sm text-muted-foreground">Tipo</p>
												<p className="font-medium capitalize">
													{equipo.tipo.replace("-", " ")}
												</p>
											</div>
											<div>
												<p className="text-sm text-muted-foreground">
													Ubicación
												</p>
												<p className="font-medium">{equipo.ubicacion}</p>
											</div>
											<div>
												<p className="text-sm text-muted-foreground">
													Último Mantenimiento
												</p>
												<p className="font-medium">
													{equipo.ultimoMantenimiento.toLocaleDateString(
														"es-ES",
														{
															day: "2-digit",
															month: "long",
															year: "numeric",
														},
													)}
												</p>
											</div>
											<div>
												<p className="text-sm text-muted-foreground">
													Próximo Mantenimiento
												</p>
												<p className="font-medium">
													{equipo.proximoMantenimiento.toLocaleDateString(
														"es-ES",
														{
															day: "2-digit",
															month: "long",
															year: "numeric",
														},
													)}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>

								{equipo.tieneIoT && equipo.dispositivoIoT && (
									<Card>
										<CardHeader>
											<CardTitle className="flex items-center gap-2">
												<WifiHigh
													className="size-5 text-cyan-600 dark:text-cyan-400"
													weight="duotone"
												/>
												Conexión IoT
											</CardTitle>
											<CardDescription>
												Dispositivo conectado para monitoreo en tiempo real
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="grid gap-4 sm:grid-cols-2">
												<div className="flex items-center gap-3">
													<div className="flex size-10 items-center justify-center rounded-lg bg-muted">
														<Cpu
															className="size-5 text-muted-foreground"
															weight="duotone"
														/>
													</div>
													<div>
														<p className="text-sm text-muted-foreground">
															Dispositivo
														</p>
														<p className="font-medium">
															{equipo.dispositivoIoT.nombre}
														</p>
													</div>
												</div>
												<div className="flex items-center gap-3">
													<div className="flex size-10 items-center justify-center rounded-lg bg-muted">
														<PlugsConnected
															className="size-5 text-muted-foreground"
															weight="duotone"
														/>
													</div>
													<div>
														<p className="text-sm text-muted-foreground">
															Protocolo
														</p>
														<span
															className={cn(
																"inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
																equipo.dispositivoIoT.protocolo ===
																	"modbus-tcp" &&
																	"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
																equipo.dispositivoIoT.protocolo === "opc-ua" &&
																	"bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
																equipo.dispositivoIoT.protocolo === "mqtt" &&
																	"bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
																equipo.dispositivoIoT.protocolo === "bacnet" &&
																	"bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
															)}
														>
															{equipo.dispositivoIoT.protocolo.toUpperCase()}
														</span>
													</div>
												</div>
												<div>
													<p className="text-sm text-muted-foreground">Tipo</p>
													<span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">
														{equipo.dispositivoIoT.tipo}
													</span>
												</div>
												<div>
													<p className="text-sm text-muted-foreground">
														Dirección
													</p>
													<p className="truncate font-mono text-sm font-medium">
														{equipo.dispositivoIoT.direccion}
													</p>
												</div>
											</div>
											<Separator className="my-4" />
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<div
														className={cn(
															"size-2.5 rounded-full",
															equipo.dispositivoIoT.estado === "online" &&
																"bg-green-500",
															equipo.dispositivoIoT.estado === "warning" &&
																"bg-yellow-500",
															equipo.dispositivoIoT.estado === "offline" &&
																"bg-red-500",
														)}
													/>
													<span
														className={cn(
															"text-sm font-medium",
															equipo.dispositivoIoT.estado === "online" &&
																"text-green-700 dark:text-green-400",
															equipo.dispositivoIoT.estado === "warning" &&
																"text-yellow-700 dark:text-yellow-400",
															equipo.dispositivoIoT.estado === "offline" &&
																"text-red-700 dark:text-red-400",
														)}
													>
														{equipo.dispositivoIoT.estado === "online"
															? "Conectado"
															: equipo.dispositivoIoT.estado === "warning"
																? "Intermitente"
																: "Desconectado"}
													</span>
												</div>
												{equipo.dispositivoIoT.ultimoDato && (
													<span className="text-xs text-muted-foreground">
														{equipo.dispositivoIoT.ultimoDato}
													</span>
												)}
											</div>
										</CardContent>
									</Card>
								)}
							</div>

							{/* QR Code Card */}
							<div>
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<QrCode className="size-5" />
											Código QR
										</CardTitle>
										<CardDescription>
											Escanear para acceso rápido
										</CardDescription>
									</CardHeader>
									<CardContent className="flex flex-col items-center gap-4">
										<div className="rounded-lg bg-white p-4">
											<QRCodeSVG
												value={`https://industrial-portal.com/activos/${equipoId}`}
												size={150}
												level="M"
											/>
										</div>
										<Button variant="outline" size="sm" className="w-full">
											<Download className="mr-2 size-4" />
											Descargar QR
										</Button>
									</CardContent>
								</Card>
							</div>
						</div>
					)}

					{activeTab === "formularios" && (
						<div className="grid gap-6 lg:grid-cols-2">
							{/* Available Forms */}
							<Card>
								<CardHeader>
									<div className="flex items-center justify-between">
										<div>
											<CardTitle>Formularios Disponibles</CardTitle>
											<CardDescription>
												Formularios aplicables a este equipo
											</CardDescription>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									{formulariosAplicables.length === 0 ? (
										<div className="flex flex-col items-center justify-center py-8 text-center">
											<ClipboardText className="mb-4 size-12 text-muted-foreground" />
											<p className="text-muted-foreground">
												No hay formularios configurados para este equipo
											</p>
										</div>
									) : (
										<div className="space-y-3">
											{formulariosAplicables.map((form) => (
												<div
													key={form.id}
													className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
												>
													<div className="flex items-center gap-4">
														<div
															className={cn(
																"flex size-10 items-center justify-center rounded-lg",
																form.tipo === "inspeccion" &&
																	"bg-blue-100 text-blue-700",
																form.tipo === "preventivo" &&
																	"bg-green-100 text-green-700",
																form.tipo === "correctivo" &&
																	"bg-orange-100 text-orange-700",
																form.tipo === "reporte-fallas" &&
																	"bg-red-100 text-red-700",
															)}
														>
															<ClipboardText
																className="size-5"
																weight="duotone"
															/>
														</div>
														<div>
															<p className="font-medium">{form.nombre}</p>
															<div className="flex items-center gap-2 text-sm text-muted-foreground">
																<span className="capitalize">
																	{form.tipo.replace("-", " ")}
																</span>
																{form.frecuencia && (
																	<>
																		<span>•</span>
																		<span className="capitalize">
																			{form.frecuencia}
																		</span>
																	</>
																)}
															</div>
														</div>
													</div>
													<Button
														size="sm"
														onClick={() =>
															router.push(
																`/formularios/llenar/${form.id}?equipo=${equipoId}`,
															)
														}
													>
														<PencilSimple className="mr-2 size-4" />
														Llenar
													</Button>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>

							{/* Recent Submissions */}
							<Card>
								<CardHeader>
									<div className="flex items-center justify-between">
										<div>
											<CardTitle>Envíos Recientes</CardTitle>
											<CardDescription>
												Últimos formularios diligenciados
											</CardDescription>
										</div>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setActiveTab("historial")}
										>
											Ver todo
										</Button>
									</div>
								</CardHeader>
								<CardContent>
									{enviosRecientes.length === 0 ? (
										<div className="flex flex-col items-center justify-center py-8 text-center">
											<ClipboardText className="mb-4 size-12 text-muted-foreground" />
											<p className="text-muted-foreground">
												No hay envíos registrados para este equipo
											</p>
										</div>
									) : (
										<div className="space-y-3">
											{enviosRecientes.map((envio) => {
												const formulario = formulariosTemplate.find(
													(f) => f.id === envio.idFormulario,
												)
												const usuario = usuarios.find(
													(u) => u.id === envio.idUsuario,
												)
												return (
													<div
														key={envio.id}
														className="flex items-center justify-between rounded-lg border p-4"
													>
														<div className="flex items-center gap-4">
															<div
																className={cn(
																	"flex size-10 items-center justify-center rounded-lg",
																	envio.estado === "completado" &&
																		"bg-green-100 text-green-700",
																	envio.estado === "pendiente" &&
																		"bg-yellow-100 text-yellow-700",
																	envio.estado === "rechazado" &&
																		"bg-red-100 text-red-700",
																)}
															>
																<CheckCircle
																	className="size-5"
																	weight="duotone"
																/>
															</div>
															<div>
																<p className="font-medium">
																	{formulario?.nombre || "Formulario"}
																</p>
																<div className="flex items-center gap-2 text-sm text-muted-foreground">
																	<span>{usuario?.nombre || "Usuario"}</span>
																	<span>•</span>
																	<span>
																		{envio.fechaEnvio.toLocaleDateString(
																			"es-ES",
																			{
																				day: "2-digit",
																				month: "short",
																				hour: "2-digit",
																				minute: "2-digit",
																			},
																		)}
																	</span>
																</div>
															</div>
														</div>
														<span
															className={cn(
																"rounded-full px-2 py-0.5 text-xs font-medium",
																envio.estado === "completado" &&
																	"bg-green-100 text-green-800",
																envio.estado === "pendiente" &&
																	"bg-yellow-100 text-yellow-800",
																envio.estado === "rechazado" &&
																	"bg-red-100 text-red-800",
															)}
														>
															{envio.estado === "completado"
																? "Completado"
																: envio.estado === "pendiente"
																	? "Pendiente"
																	: "Rechazado"}
														</span>
													</div>
												)
											})}
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					)}

					{activeTab === "documentos" && (
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle>Documentos del Equipo</CardTitle>
										<CardDescription>
											Manuales, certificados y documentación técnica
										</CardDescription>
									</div>
									<Button
										onClick={() => documentInputRef.current?.click()}
										disabled={isUploadingDocument}
									>
										<Upload className="mr-2 size-4" />
										{isUploadingDocument ? "Subiendo..." : "Subir Documento"}
									</Button>
									<input
										ref={documentInputRef}
										type="file"
										className="hidden"
										multiple
										accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.dwg"
										onChange={(event) => {
											void handleFilesSelected(event, "documento")
										}}
									/>
								</div>
							</CardHeader>
							<CardContent>
								{uploadError && (
									<p className="mb-4 text-sm text-red-500">{uploadError}</p>
								)}
								{documentos.length === 0 ? (
									<div className="flex flex-col items-center justify-center py-12 text-center">
										<FileText className="mb-4 size-12 text-muted-foreground" />
										<p className="text-muted-foreground">
											No hay documentos disponibles para este equipo
										</p>
										<Button
											variant="outline"
											className="mt-4"
											onClick={() => documentInputRef.current?.click()}
											disabled={isUploadingDocument}
										>
											Subir primer documento
										</Button>
									</div>
								) : (
									<div className="space-y-2">
										{documentos.map((doc) =>
											(() => {
												const DocumentIcon = getDocumentIcon(doc)
												const isPdf = DocumentIcon === FilePdf

												return (
													<div
														key={doc.id}
														className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
													>
														<div className="flex items-center gap-4">
															<div
																className={cn(
																	"flex size-10 items-center justify-center rounded-lg",
																	isPdf
																		? "bg-red-100 text-red-700"
																		: "bg-blue-100 text-blue-700",
																)}
															>
																<DocumentIcon
																	className="size-5"
																	weight="duotone"
																/>
															</div>
															<div>
																<p className="font-medium">{doc.nombre}</p>
																<p className="text-sm text-muted-foreground">
																	{formatFileSize(doc.tamano_bytes)} •{" "}
																	{new Date(doc.created_at).toLocaleDateString(
																		"es-ES",
																	)}
																</p>
															</div>
														</div>
														<div className="flex gap-2">
															<Button variant="ghost" size="icon-sm" asChild>
																<a
																	href={doc.storage_path}
																	target="_blank"
																	rel="noreferrer"
																>
																	<Eye className="size-4" />
																</a>
															</Button>
															<Button variant="ghost" size="icon-sm" asChild>
																<a
																	href={`${doc.storage_path}?download=${encodeURIComponent(doc.nombre_archivo)}`}
																>
																	<Download className="size-4" />
																</a>
															</Button>
														</div>
													</div>
												)
											})(),
										)}
									</div>
								)}
							</CardContent>
						</Card>
					)}

					{activeTab === "galeria" && (
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle>Galería de Imágenes</CardTitle>
										<CardDescription>
											Fotos del equipo, inspecciones y reparaciones
										</CardDescription>
									</div>
									<Button
										onClick={() => imageInputRef.current?.click()}
										disabled={isUploadingImage}
									>
										<Upload className="mr-2 size-4" />
										{isUploadingImage ? "Subiendo..." : "Subir Imagen"}
									</Button>
									<input
										ref={imageInputRef}
										type="file"
										className="hidden"
										multiple
										accept="image/*"
										onChange={(event) => {
											void handleFilesSelected(event, "imagen")
										}}
									/>
								</div>
							</CardHeader>
							<CardContent>
								{uploadError && (
									<p className="mb-4 text-sm text-red-500">{uploadError}</p>
								)}
								{imagenes.length === 0 ? (
									<div className="flex flex-col items-center justify-center py-12 text-center">
										<Images className="mb-4 size-12 text-muted-foreground" />
										<p className="text-muted-foreground">
											No hay imágenes disponibles para este equipo
										</p>
										<Button
											variant="outline"
											className="mt-4"
											onClick={() => imageInputRef.current?.click()}
											disabled={isUploadingImage}
										>
											Subir primera imagen
										</Button>
									</div>
								) : (
									<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
										{imagenes.map((img) => (
											<div
												key={img.id}
												className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
											>
												<img
													src={img.storage_path}
													alt={img.nombre}
													className="size-full object-cover"
												/>
												<div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
													<p className="text-sm font-medium text-white">
														{img.nombre}
													</p>
													<p className="text-xs text-white/80">
														{new Date(img.created_at).toLocaleDateString(
															"es-ES",
														)}
													</p>
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					)}

					{activeTab === "historial" && (
						<Card>
							<CardHeader>
								<CardTitle>Historial Completo</CardTitle>
								<CardDescription>
									Todas las actividades realizadas en este equipo
								</CardDescription>
							</CardHeader>
							<CardContent>
								{timelineCompleto.length === 0 ? (
									<p className="py-8 text-center text-muted-foreground">
										No hay registros de actividad
									</p>
								) : (
									<div className="space-y-6">
										{timelineCompleto.map((actividad, index) => {
											const IconComponent = getActividadIcon(actividad.tipo)
											return (
												<div key={actividad.id} className="relative flex gap-4">
													{/* Timeline line */}
													{index < timelineCompleto.length - 1 && (
														<div className="absolute left-5 top-12 h-full w-px bg-border" />
													)}

													{/* Icon */}
													<div
														className={cn(
															"flex size-10 shrink-0 items-center justify-center rounded-full",
															getActividadColor(actividad.tipo),
														)}
													>
														<IconComponent
															className="size-5"
															weight="duotone"
														/>
													</div>

													{/* Content */}
													<div className="flex-1 space-y-2 pb-6">
														<div className="flex items-start justify-between">
															<div>
																<h3 className="font-semibold">
																	{actividad.titulo}
																</h3>
																<p className="text-sm text-muted-foreground">
																	{actividad.fecha.toLocaleDateString("es-ES", {
																		day: "2-digit",
																		month: "long",
																		year: "numeric",
																		hour: "2-digit",
																		minute: "2-digit",
																	})}
																</p>
															</div>
															<span
																className={cn(
																	"rounded-full px-2 py-0.5 text-xs font-medium capitalize",
																	getActividadColor(actividad.tipo),
																)}
															>
																{actividad.tipo}
															</span>
														</div>
														<p className="text-sm">{actividad.descripcion}</p>
														<div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
															<span className="flex items-center gap-1">
																<span className="font-medium">
																	{actividad.usuario}
																</span>
																<span>({actividad.rol})</span>
															</span>
															{actividad.detalles && (
																<>
																	{actividad.detalles.horasEmpleadas && (
																		<span>
																			{actividad.detalles.horasEmpleadas}h
																			empleadas
																		</span>
																	)}
																	{actividad.detalles.costo && (
																		<span>
																			$
																			{(
																				actividad.detalles.costo as number
																			).toLocaleString()}
																		</span>
																	)}
																	{actividad.detalles.estado && (
																		<span
																			className={cn(
																				"rounded-full px-2 py-0.5 font-medium capitalize",
																				actividad.detalles.estado ===
																					"completado" &&
																					"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
																				actividad.detalles.estado ===
																					"en-progreso" &&
																					"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
																				actividad.detalles.estado ===
																					"pendiente" &&
																					"bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
																			)}
																		>
																			{actividad.detalles.estado}
																		</span>
																	)}
																</>
															)}
														</div>
													</div>
												</div>
											)
										})}
									</div>
								)}
							</CardContent>
						</Card>
					)}
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
