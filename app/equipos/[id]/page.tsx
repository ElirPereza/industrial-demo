"use client"

import {
	ArrowLeft,
	CalendarBlank,
	CheckCircle,
	Clock,
	ClipboardText,
	Download,
	Eye,
	FileDoc,
	FilePdf,
	FileText,
	Images,
	Info,
	MapPin,
	PencilSimple,
	QrCode,
	Timer,
	Wrench,
} from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { use, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { AppSidebar } from "@/components/app-sidebar"
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
import { equipos, registrosMantenimiento, formulariosTemplate, enviosFormularios, usuarios } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

// Mock documents for equipment
const documentosMock: Record<
	string,
	{ id: string; nombre: string; tipo: "pdf" | "doc" | "img"; tamano: string; fecha: Date }[]
> = {
	"eq-001": [
		{ id: "doc-001", nombre: "Manual de Usuario Torno CNC", tipo: "pdf", tamano: "2.4 MB", fecha: new Date("2025-06-15") },
		{ id: "doc-002", nombre: "Ficha Técnica", tipo: "pdf", tamano: "845 KB", fecha: new Date("2025-06-15") },
		{ id: "doc-003", nombre: "Certificado de Calibración 2025", tipo: "pdf", tamano: "320 KB", fecha: new Date("2025-12-01") },
		{ id: "doc-004", nombre: "Plan de Mantenimiento Preventivo", tipo: "doc", tamano: "156 KB", fecha: new Date("2025-01-10") },
	],
	"eq-002": [
		{ id: "doc-005", nombre: "Manual Prensa Hidráulica", tipo: "pdf", tamano: "3.1 MB", fecha: new Date("2024-08-20") },
		{ id: "doc-006", nombre: "Diagrama Hidráulico", tipo: "pdf", tamano: "1.2 MB", fecha: new Date("2024-08-20") },
		{ id: "doc-007", nombre: "Certificado de Seguridad", tipo: "pdf", tamano: "280 KB", fecha: new Date("2025-11-15") },
	],
	"eq-003": [
		{ id: "doc-008", nombre: "Manual Fresadora CNC", tipo: "pdf", tamano: "4.5 MB", fecha: new Date("2023-03-10") },
		{ id: "doc-009", nombre: "Guía de Programación", tipo: "pdf", tamano: "1.8 MB", fecha: new Date("2023-03-10") },
	],
}

// Mock images for equipment
const imagenesMock: Record<
	string,
	{ id: string; url: string; titulo: string; fecha: Date }[]
> = {
	"eq-001": [
		{ id: "img-001", url: "/placeholder.svg", titulo: "Vista frontal", fecha: new Date("2025-12-01") },
		{ id: "img-002", url: "/placeholder.svg", titulo: "Panel de control", fecha: new Date("2025-12-01") },
		{ id: "img-003", url: "/placeholder.svg", titulo: "Área de trabajo", fecha: new Date("2026-01-15") },
		{ id: "img-004", url: "/placeholder.svg", titulo: "Sistema de refrigeración", fecha: new Date("2026-01-28") },
	],
	"eq-002": [
		{ id: "img-005", url: "/placeholder.svg", titulo: "Vista general", fecha: new Date("2025-10-20") },
		{ id: "img-006", url: "/placeholder.svg", titulo: "Sistema hidráulico", fecha: new Date("2025-10-20") },
	],
	"eq-003": [
		{ id: "img-007", url: "/placeholder.svg", titulo: "Husillo dañado", fecha: new Date("2026-02-05") },
		{ id: "img-008", url: "/placeholder.svg", titulo: "Reparación en progreso", fecha: new Date("2026-02-06") },
	],
}

// Extended activity types for timeline
type ActividadTipo = "mantenimiento" | "inspeccion" | "falla" | "documento" | "modificacion"

interface ActividadEquipo {
	id: string
	tipo: ActividadTipo
	titulo: string
	descripcion: string
	usuario: string
	rol: string
	fecha: Date
	detalles?: Record<string, string | number>
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
	const [activeTab, setActiveTab] = useState<TabType>("info")

	const equipo = equipos.find((e) => e.id === equipoId)
	const historial = registrosMantenimiento
		.filter((r) => r.idEquipo === equipoId)
		.sort((a, b) => b.fechaInicio.getTime() - a.fechaInicio.getTime())

	const documentos = documentosMock[equipoId] || []
	const imagenes = imagenesMock[equipoId] || []
	const actividades = actividadesMock[equipoId] || []

	// Get applicable forms for this equipment
	const formulariosAplicables = formulariosTemplate.filter((f) => {
		if (!f.activo) return false
		if (f.asociacion.tipo === "general") return true
		if (f.asociacion.tipo === "equipo" && f.asociacion.valor === equipoId) return true
		if (f.asociacion.tipo === "tipo-equipo" && f.asociacion.valor === equipo?.tipo) return true
		if (f.asociacion.tipo === "area" && equipo?.ubicacion.includes(f.asociacion.valor || "")) return true
		return false
	})

	// Get recent form submissions for this equipment
	const enviosRecientes = enviosFormularios
		.filter((e) => e.idEquipo === equipoId)
		.sort((a, b) => b.fechaEnvio.getTime() - a.fechaEnvio.getTime())
		.slice(0, 10)

	// Combine maintenance records with other activities for full timeline
	const timelineCompleto = [
		...historial.map((r) => ({
			id: r.id,
			tipo: r.tipo === "inspección" ? "inspeccion" : "mantenimiento" as ActividadTipo,
			titulo: `${r.tipo.charAt(0).toUpperCase() + r.tipo.slice(1)}`,
			descripcion: r.descripcion,
			usuario: r.tecnico,
			rol: "Técnico",
			fecha: r.fechaInicio,
			detalles: { horasEmpleadas: r.horasEmpleadas, costo: r.costo, estado: r.estado },
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
							<Button className="mt-4" onClick={() => router.push("/equipos")}>
								Volver a Equipos
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
		{ id: "formularios" as TabType, label: "Formularios", icon: ClipboardText, count: formulariosAplicables.length },
		{ id: "documentos" as TabType, label: "Documentos", icon: FileText, count: documentos.length },
		{ id: "galeria" as TabType, label: "Galería", icon: Images, count: imagenes.length },
		{ id: "historial" as TabType, label: "Historial", icon: Timer, count: timelineCompleto.length },
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
									<BreadcrumbLink href="/equipos">Equipos</BreadcrumbLink>
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
						onClick={() => router.push("/equipos")}
					>
						<ArrowLeft className="mr-2 size-4" weight="bold" />
						Volver a Equipos
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
											<p className="text-sm text-muted-foreground">Intervenciones</p>
											<p className="text-2xl font-semibold">{totalIntervenciones}</p>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<p className="text-sm text-muted-foreground">Última Falla</p>
											<p className="text-lg font-semibold">
												{ultimaFalla
													? ultimaFalla.fechaInicio.toLocaleDateString("es-ES", {
															day: "2-digit",
															month: "short",
														})
													: "Sin fallas"}
											</p>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<p className="text-sm text-muted-foreground">Horas Mant.</p>
											<p className="text-2xl font-semibold">{horasTotales}h</p>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<p className="text-sm text-muted-foreground">Costo Total</p>
											<p className="text-2xl font-semibold">${costoTotal.toLocaleString()}</p>
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
												<p className="text-sm text-muted-foreground">Ubicación</p>
												<p className="font-medium">{equipo.ubicacion}</p>
											</div>
											<div>
												<p className="text-sm text-muted-foreground">Último Mantenimiento</p>
												<p className="font-medium">
													{equipo.ultimoMantenimiento.toLocaleDateString("es-ES", {
														day: "2-digit",
														month: "long",
														year: "numeric",
													})}
												</p>
											</div>
											<div>
												<p className="text-sm text-muted-foreground">Próximo Mantenimiento</p>
												<p className="font-medium">
													{equipo.proximoMantenimiento.toLocaleDateString("es-ES", {
														day: "2-digit",
														month: "long",
														year: "numeric",
													})}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
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
												value={`https://industrial-portal.com/equipos/${equipoId}`}
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
																form.tipo === "inspeccion" && "bg-blue-100 text-blue-700",
																form.tipo === "preventivo" && "bg-green-100 text-green-700",
																form.tipo === "correctivo" && "bg-orange-100 text-orange-700",
																form.tipo === "reporte-fallas" && "bg-red-100 text-red-700",
															)}
														>
															<ClipboardText className="size-5" weight="duotone" />
														</div>
														<div>
															<p className="font-medium">{form.nombre}</p>
															<div className="flex items-center gap-2 text-sm text-muted-foreground">
																<span className="capitalize">{form.tipo.replace("-", " ")}</span>
																{form.frecuencia && (
																	<>
																		<span>•</span>
																		<span className="capitalize">{form.frecuencia}</span>
																	</>
																)}
															</div>
														</div>
													</div>
													<Button
														size="sm"
														onClick={() => router.push(`/formularios/llenar/${form.id}?equipo=${equipoId}`)}
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
										<Button variant="outline" size="sm" onClick={() => setActiveTab("historial")}>
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
												const formulario = formulariosTemplate.find((f) => f.id === envio.idFormulario)
												const usuario = usuarios.find((u) => u.id === envio.idUsuario)
												return (
													<div
														key={envio.id}
														className="flex items-center justify-between rounded-lg border p-4"
													>
														<div className="flex items-center gap-4">
															<div
																className={cn(
																	"flex size-10 items-center justify-center rounded-lg",
																	envio.estado === "completado" && "bg-green-100 text-green-700",
																	envio.estado === "pendiente" && "bg-yellow-100 text-yellow-700",
																	envio.estado === "rechazado" && "bg-red-100 text-red-700",
																)}
															>
																<CheckCircle className="size-5" weight="duotone" />
															</div>
															<div>
																<p className="font-medium">{formulario?.nombre || "Formulario"}</p>
																<div className="flex items-center gap-2 text-sm text-muted-foreground">
																	<span>{usuario?.nombre || "Usuario"}</span>
																	<span>•</span>
																	<span>
																		{envio.fechaEnvio.toLocaleDateString("es-ES", {
																			day: "2-digit",
																			month: "short",
																			hour: "2-digit",
																			minute: "2-digit",
																		})}
																	</span>
																</div>
															</div>
														</div>
														<span
															className={cn(
																"rounded-full px-2 py-0.5 text-xs font-medium",
																envio.estado === "completado" && "bg-green-100 text-green-800",
																envio.estado === "pendiente" && "bg-yellow-100 text-yellow-800",
																envio.estado === "rechazado" && "bg-red-100 text-red-800",
															)}
														>
															{envio.estado === "completado" ? "Completado" : envio.estado === "pendiente" ? "Pendiente" : "Rechazado"}
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
									<Button>
										<FileText className="mr-2 size-4" />
										Subir Documento
									</Button>
								</div>
							</CardHeader>
							<CardContent>
								{documentos.length === 0 ? (
									<div className="flex flex-col items-center justify-center py-12 text-center">
										<FileText className="mb-4 size-12 text-muted-foreground" />
										<p className="text-muted-foreground">
											No hay documentos disponibles para este equipo
										</p>
										<Button variant="outline" className="mt-4">
											Subir primer documento
										</Button>
									</div>
								) : (
									<div className="space-y-2">
										{documentos.map((doc) => (
											<div
												key={doc.id}
												className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
											>
												<div className="flex items-center gap-4">
													<div
														className={cn(
															"flex size-10 items-center justify-center rounded-lg",
															doc.tipo === "pdf"
																? "bg-red-100 text-red-700"
																: "bg-blue-100 text-blue-700",
														)}
													>
														{doc.tipo === "pdf" ? (
															<FilePdf className="size-5" weight="duotone" />
														) : (
															<FileDoc className="size-5" weight="duotone" />
														)}
													</div>
													<div>
														<p className="font-medium">{doc.nombre}</p>
														<p className="text-sm text-muted-foreground">
															{doc.tamano} • {doc.fecha.toLocaleDateString("es-ES")}
														</p>
													</div>
												</div>
												<div className="flex gap-2">
													<Button variant="ghost" size="icon-sm">
														<Eye className="size-4" />
													</Button>
													<Button variant="ghost" size="icon-sm">
														<Download className="size-4" />
													</Button>
												</div>
											</div>
										))}
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
									<Button>
										<Images className="mr-2 size-4" />
										Subir Imagen
									</Button>
								</div>
							</CardHeader>
							<CardContent>
								{imagenes.length === 0 ? (
									<div className="flex flex-col items-center justify-center py-12 text-center">
										<Images className="mb-4 size-12 text-muted-foreground" />
										<p className="text-muted-foreground">
											No hay imágenes disponibles para este equipo
										</p>
										<Button variant="outline" className="mt-4">
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
												<div className="flex size-full items-center justify-center text-muted-foreground">
													<Images className="size-12" />
												</div>
												<div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
													<p className="text-sm font-medium text-white">
														{img.titulo}
													</p>
													<p className="text-xs text-white/80">
														{img.fecha.toLocaleDateString("es-ES")}
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
														<IconComponent className="size-5" weight="duotone" />
													</div>

													{/* Content */}
													<div className="flex-1 space-y-2 pb-6">
														<div className="flex items-start justify-between">
															<div>
																<h3 className="font-semibold">{actividad.titulo}</h3>
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
																<span className="font-medium">{actividad.usuario}</span>
																<span>({actividad.rol})</span>
															</span>
															{actividad.detalles && (
																<>
																	{actividad.detalles.horasEmpleadas && (
																		<span>{actividad.detalles.horasEmpleadas}h empleadas</span>
																	)}
																	{actividad.detalles.costo && (
																		<span>${(actividad.detalles.costo as number).toLocaleString()}</span>
																	)}
																	{actividad.detalles.estado && (
																		<span
																			className={cn(
																				"rounded-full px-2 py-0.5 font-medium capitalize",
																				actividad.detalles.estado === "completado" &&
																					"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
																				actividad.detalles.estado === "en-progreso" &&
																					"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
																				actividad.detalles.estado === "pendiente" &&
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
