"use client"

import {
	ArrowLeft,
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
import { use, useEffect, useMemo, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import {
	getEquipoById,
	getEquipoStats,
	type Equipo,
} from "../actions"
import {
	getActividadesPorEquipo,
	type ActividadEquipo,
} from "../maintenance-actions"
import {
	getFormulariosParaEquipo,
	type FormularioTemplate,
} from "../../formularios/actions"
import {
	getEnviosPorEquipo,
	type EnvioFormulario,
} from "../../formularios/envios-actions"
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "../../../../components/ui/breadcrumb"
import { Button } from "../../../../components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../../../components/ui/card"
import { Separator } from "../../../../components/ui/separator"
import { SidebarInset, SidebarTrigger } from "../../../../components/ui/sidebar"
import { cn } from "../../../../lib/utils"

type TabType = "info" | "formularios" | "documentos" | "galeria" | "historial"

type EquipoDocumento = {
	id: string
	nombre?: string | null
	tipo?: string | null
	tamano?: string | null
	created_at?: string | null
	fecha?: string | null
	url?: string | null
}

type EquipoImagen = {
	id: string
	url?: string | null
	titulo?: string | null
	created_at?: string | null
	fecha?: string | null
}

type EquipoDetail = Equipo & {
	documentos?: EquipoDocumento[]
	imagenes?: EquipoImagen[]
}

type EquipoStats = {
	totalIntervenciones: number
	ultimaFalla: string | null
	horasMantenimiento: number
	costoTotal: number
}

const formatDate = (value?: string | null, includeTime = false) => {
	if (!value) return "—"
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return "—"

	return includeTime
		? date.toLocaleDateString("es-ES", {
				day: "2-digit",
				month: "long",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			})
		: date.toLocaleDateString("es-ES", {
				day: "2-digit",
				month: "long",
				year: "numeric",
			})
}

const formatDateShort = (value?: string | null) => {
	if (!value) return "—"
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return "—"
	return date.toLocaleDateString("es-ES", {
		day: "2-digit",
		month: "short",
	})
}

const formatCurrency = (value: number) =>
	new Intl.NumberFormat("es-CO", {
		style: "currency",
		currency: "COP",
		maximumFractionDigits: 0,
	}).format(value)

const parseNumber = (value: unknown) => {
	if (typeof value === "number") return value
	if (typeof value === "string") {
		const parsed = Number(value)
		return Number.isFinite(parsed) ? parsed : 0
	}
	return 0
}

const getFileIcon = (tipo?: string | null) => {
	const normalized = (tipo ?? "").toLowerCase()
	if (normalized.includes("pdf")) return FilePdf
	return FileDoc
}

const getFileColor = (tipo?: string | null) => {
	const normalized = (tipo ?? "").toLowerCase()
	if (normalized.includes("pdf")) return "bg-red-100 text-red-700"
	return "bg-blue-100 text-blue-700"
}

const normalizeEstadoEquipo = (estado?: string) => {
	if (estado === "operativo") return "operativo"
	if (estado === "mantenimiento") return "mantenimiento"
	return "fuera_servicio"
}

const normalizeActividadTipo = (
	tipo?: string,
): "mantenimiento" | "inspeccion" | "falla" | "documento" | "modificacion" => {
	if (tipo === "mantenimiento") return "mantenimiento"
	if (tipo === "inspeccion") return "inspeccion"
	if (tipo === "falla") return "falla"
	if (tipo === "documento") return "documento"
	return "modificacion"
}

export default function EquipoDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id: equipoId } = use(params)
	const router = useRouter()
	const [activeTab, setActiveTab] = useState<TabType>("info")
	const [equipo, setEquipo] = useState<EquipoDetail | null>(null)
	const [stats, setStats] = useState<EquipoStats | null>(null)
	const [formularios, setFormularios] = useState<FormularioTemplate[]>([])
	const [envios, setEnvios] = useState<EnvioFormulario[]>([])
	const [actividades, setActividades] = useState<ActividadEquipo[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let mounted = true

		async function loadData() {
			setLoading(true)
			const [equipoResult, statsResult, formulariosResult, enviosResult, actividadesResult] =
				await Promise.all([
					getEquipoById(equipoId),
					getEquipoStats(equipoId),
					getFormulariosParaEquipo(equipoId),
					getEnviosPorEquipo(equipoId),
					getActividadesPorEquipo(equipoId),
				])

			if (!mounted) return

			if (equipoResult.success) {
				setEquipo(equipoResult.data as EquipoDetail)
			} else {
				setEquipo(null)
			}

			if (statsResult.success) setStats(statsResult.data)
			else setStats(null)

			if (formulariosResult.success) setFormularios(formulariosResult.data)
			else setFormularios([])

			if (enviosResult.success) setEnvios(enviosResult.data)
			else setEnvios([])

			if (actividadesResult.success) setActividades(actividadesResult.data)
			else setActividades([])

			setLoading(false)
		}

		loadData()

		return () => {
			mounted = false
		}
	}, [equipoId])

	const documentos = useMemo(() => equipo?.documentos ?? [], [equipo])
	const imagenes = useMemo(() => equipo?.imagenes ?? [], [equipo])

	const timelineCompleto = useMemo(
		() =>
			[...actividades].sort(
				(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
			),
		[actividades],
	)

	const tabs = [
		{ id: "info" as TabType, label: "Información", icon: Info },
		{
			id: "formularios" as TabType,
			label: "Formularios",
			icon: ClipboardText,
			count: formularios.length,
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

	const qrUrl =
		typeof window !== "undefined"
			? `${window.location.origin}/equipos/${equipoId}`
			: `https://industrial-portal.com/equipos/${equipoId}`

	const getActividadIcon = (tipo: string) => {
		switch (normalizeActividadTipo(tipo)) {
			case "mantenimiento":
				return Wrench
			case "inspeccion":
				return CheckCircle
			case "falla":
				return Clock
			case "documento":
				return FileText
			case "modificacion":
			default:
				return Wrench
		}
	}

	const getActividadColor = (tipo: string) => {
		switch (normalizeActividadTipo(tipo)) {
			case "mantenimiento":
				return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
			case "inspeccion":
				return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
			case "falla":
				return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
			case "documento":
				return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
			case "modificacion":
			default:
				return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
		}
	}

	if (loading) {
		return (
			<SidebarInset>
				<div className="flex min-h-screen items-center justify-center">
					<div className="text-center">
						<h1 className="text-2xl font-semibold">Cargando equipo...</h1>
					</div>
				</div>
			</SidebarInset>
		)
	}

	if (!equipo) {
		return (
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
		)
	}

	const estadoEquipo = normalizeEstadoEquipo(equipo.estado)

	return (
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
				<Button
					variant="ghost"
					className="w-fit"
					onClick={() => router.push("/equipos")}
				>
					<ArrowLeft className="mr-2 size-4" weight="bold" />
					Volver a Equipos
				</Button>

				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<div className="flex items-center gap-3">
							<h1 className="text-3xl font-semibold">{equipo.nombre}</h1>
							<span
								className={cn(
									"rounded-full px-3 py-1 text-sm font-medium",
									estadoEquipo === "operativo" &&
										"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
									estadoEquipo === "mantenimiento" &&
										"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
									estadoEquipo === "fuera_servicio" &&
										"bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
								)}
							>
								{estadoEquipo === "operativo"
									? "Operativo"
									: estadoEquipo === "mantenimiento"
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

				{activeTab === "info" && (
					<div className="grid gap-6 lg:grid-cols-3">
						<div className="space-y-4 lg:col-span-2">
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
								<Card>
									<CardContent className="p-4">
										<p className="text-sm text-muted-foreground">Intervenciones</p>
										<p className="text-2xl font-semibold">
											{stats?.totalIntervenciones ?? 0}
										</p>
									</CardContent>
								</Card>
								<Card>
									<CardContent className="p-4">
										<p className="text-sm text-muted-foreground">Última Falla</p>
										<p className="text-lg font-semibold">
											{stats?.ultimaFalla ? formatDateShort(stats.ultimaFalla) : "Sin fallas"}
										</p>
									</CardContent>
								</Card>
								<Card>
									<CardContent className="p-4">
										<p className="text-sm text-muted-foreground">Horas Mant.</p>
										<p className="text-2xl font-semibold">
											{stats?.horasMantenimiento ?? 0}h
										</p>
									</CardContent>
								</Card>
								<Card>
									<CardContent className="p-4">
										<p className="text-sm text-muted-foreground">Costo Total</p>
										<p className="text-2xl font-semibold">
											{formatCurrency(stats?.costoTotal ?? 0)}
										</p>
									</CardContent>
								</Card>
							</div>

							<Card>
								<CardHeader>
									<CardTitle>Detalles del Equipo</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid gap-4 sm:grid-cols-2">
										<div>
											<p className="text-sm text-muted-foreground">Tipo</p>
											<p className="font-medium capitalize">
												{equipo.tipo.replaceAll("_", " ")}
											</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">Ubicación</p>
											<p className="font-medium">{equipo.ubicacion}</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">Estado</p>
											<p className="font-medium">
												{estadoEquipo === "operativo"
													? "Operativo"
													: estadoEquipo === "mantenimiento"
														? "En Mantenimiento"
														: "Fuera de Servicio"}
											</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">Último Mantenimiento</p>
											<p className="font-medium">
												{formatDate(equipo.ultimo_mantenimiento)}
											</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">Próximo Mantenimiento</p>
											<p className="font-medium">
												{formatDate(equipo.proximo_mantenimiento)}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

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
										<QRCodeSVG value={qrUrl} size={150} level="M" />
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
								{formularios.length === 0 ? (
									<div className="flex flex-col items-center justify-center py-8 text-center">
										<ClipboardText className="mb-4 size-12 text-muted-foreground" />
										<p className="text-muted-foreground">
											No hay formularios configurados para este equipo
										</p>
									</div>
								) : (
									<div className="space-y-3">
										{formularios.map((form) => (
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
															form.tipo === "reporte_fallas" &&
																"bg-red-100 text-red-700",
														)}
													>
														<ClipboardText className="size-5" weight="duotone" />
													</div>
													<div>
														<p className="font-medium">{form.nombre}</p>
														<div className="flex items-center gap-2 text-sm text-muted-foreground">
															<span className="capitalize">
																{form.tipo.replaceAll("_", " ")}
															</span>
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
								{envios.length === 0 ? (
									<div className="flex flex-col items-center justify-center py-8 text-center">
										<ClipboardText className="mb-4 size-12 text-muted-foreground" />
										<p className="text-muted-foreground">
											No hay envíos registrados para este equipo
										</p>
									</div>
								) : (
									<div className="space-y-3">
										{envios.slice(0, 10).map((envio) => {
											const nombreFormulario =
												envio.formulario_nombre ??
												(envio as unknown as { formularios_template?: { nombre?: string } })
													.formularios_template?.nombre ??
												"Formulario"

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
															<CheckCircle className="size-5" weight="duotone" />
														</div>
														<div>
															<p className="font-medium">{nombreFormulario}</p>
															<div className="flex items-center gap-2 text-sm text-muted-foreground">
																<span>{envio.usuario_nombre ?? "Usuario"}</span>
																<span>•</span>
																<span>{formatDate(envio.created_at, true)}</span>
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
									{documentos.map((doc) => {
										const FileIcon = getFileIcon(doc.tipo)
										const fileDate = doc.fecha ?? doc.created_at

										return (
											<div
												key={doc.id}
												className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
											>
												<div className="flex items-center gap-4">
													<div
														className={cn(
															"flex size-10 items-center justify-center rounded-lg",
															getFileColor(doc.tipo),
														)}
													>
														<FileIcon className="size-5" weight="duotone" />
													</div>
													<div>
														<p className="font-medium">{doc.nombre ?? "Documento"}</p>
														<p className="text-sm text-muted-foreground">
															{doc.tamano ?? "Tamaño no disponible"} • {formatDate(fileDate)}
														</p>
													</div>
												</div>
												<div className="flex gap-2">
													<Button
														variant="ghost"
														size="icon-sm"
														onClick={() => {
															if (doc.url) window.open(doc.url, "_blank", "noopener,noreferrer")
														}}
													>
														<Eye className="size-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon-sm"
														onClick={() => {
															if (doc.url) window.open(doc.url, "_blank", "noopener,noreferrer")
														}}
													>
														<Download className="size-4" />
													</Button>
												</div>
											</div>
										)
									})}
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
											{img.url ? (
												<img
													src={img.url}
													alt={img.titulo ?? "Imagen de equipo"}
													className="size-full object-cover"
												/>
											) : (
												<div className="flex size-full items-center justify-center text-muted-foreground">
													<Images className="size-12" />
												</div>
											)}
											<div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
												<p className="text-sm font-medium text-white">
													{img.titulo ?? "Imagen"}
												</p>
												<p className="text-xs text-white/80">
													{formatDate(img.fecha ?? img.created_at)}
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
										const detalles = actividad.detalles ?? {}
										const horas = parseNumber(detalles.horas ?? detalles.horasEmpleadas)
										const costo = parseNumber(detalles.costo)
										const estado =
											typeof detalles.estado === "string" ? detalles.estado : null

										return (
											<div key={actividad.id} className="relative flex gap-4">
												{index < timelineCompleto.length - 1 && (
													<div className="absolute left-5 top-12 h-full w-px bg-border" />
												)}

												<div
													className={cn(
														"flex size-10 shrink-0 items-center justify-center rounded-full",
														getActividadColor(actividad.tipo),
													)}
												>
													<IconComponent className="size-5" weight="duotone" />
												</div>

												<div className="flex-1 space-y-2 pb-6">
													<div className="flex items-start justify-between">
														<div>
															<h3 className="font-semibold">{actividad.titulo}</h3>
															<p className="text-sm text-muted-foreground">
																{formatDate(actividad.created_at, true)}
															</p>
														</div>
														<span
															className={cn(
																"rounded-full px-2 py-0.5 text-xs font-medium capitalize",
																getActividadColor(actividad.tipo),
															)}
														>
															{actividad.tipo.replaceAll("_", " ")}
														</span>
													</div>
													<p className="text-sm">{actividad.descripcion}</p>
													<div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
														{horas > 0 && <span>{horas}h empleadas</span>}
														{costo > 0 && <span>{formatCurrency(costo)}</span>}
														{estado && (
															<span
																className={cn(
																	"rounded-full px-2 py-0.5 font-medium capitalize",
																	estado === "completado" &&
																		"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
																	estado === "en_progreso" &&
																		"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
																	estado === "pendiente" &&
																		"bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
																)}
															>
																{estado.replaceAll("_", " ")}
															</span>
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
	)
}
