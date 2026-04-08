"use client"

import { useState, useMemo } from "react"
import {
	BellRinging,
	Export,
	Gear,
	MagnifyingGlass,
	SealWarning,
	ShieldCheck,
	WifiHigh,
	Eye,
	Wrench,
	FunnelSimple,
} from "@phosphor-icons/react"
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
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar"
import { alertasEquipos, equipos, type SeveridadAlerta } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function tiempoRelativo(fecha: Date): string {
	const ahora = new Date()
	const diffMs = ahora.getTime() - fecha.getTime()
	const diffMin = Math.floor(diffMs / 60000)
	const diffHoras = Math.floor(diffMs / 3600000)
	const diffDias = Math.floor(diffMs / 86400000)

	if (diffMin < 1) return "Justo ahora"
	if (diffMin < 60) return `Hace ${diffMin} min`
	if (diffHoras < 24) return `Hace ${diffHoras}h`
	if (diffDias < 7) return `Hace ${diffDias}d`
	return fecha.toLocaleDateString("es-ES", {
		day: "2-digit",
		month: "short",
	})
}

const SEVERIDAD_CONFIG: Record<
	SeveridadAlerta,
	{ label: string; dot: string; bg: string; text: string; bar: string }
> = {
	critica: {
		label: "Crítica",
		dot: "bg-red-500",
		bg: "bg-red-50 dark:bg-red-950/30",
		text: "text-red-700 dark:text-red-400",
		bar: "bg-red-500",
	},
	alta: {
		label: "Alta",
		dot: "bg-orange-500",
		bg: "bg-orange-50 dark:bg-orange-950/30",
		text: "text-orange-700 dark:text-orange-400",
		bar: "bg-orange-500",
	},
	media: {
		label: "Media",
		dot: "bg-yellow-500",
		bg: "bg-yellow-50 dark:bg-yellow-950/30",
		text: "text-yellow-700 dark:text-yellow-400",
		bar: "bg-yellow-500",
	},
	baja: {
		label: "Baja",
		dot: "bg-blue-500",
		bg: "bg-blue-50 dark:bg-blue-950/30",
		text: "text-blue-700 dark:text-blue-400",
		bar: "bg-blue-500",
	},
	info: {
		label: "Info",
		dot: "bg-gray-400",
		bg: "bg-gray-50 dark:bg-gray-900/30",
		text: "text-gray-600 dark:text-gray-400",
		bar: "bg-gray-400",
	},
}

const ESTADO_CONFIG: Record<string, { label: string; classes: string }> = {
	activa: {
		label: "Activa",
		classes: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
	},
	reconocida: {
		label: "Reconocida",
		classes:
			"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
	},
	resuelta: {
		label: "Resuelta",
		classes:
			"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
	},
}

type FiltroSeveridad = SeveridadAlerta | "todas"

export default function AlertasPage() {
	const [filtroSeveridad, setFiltroSeveridad] =
		useState<FiltroSeveridad>("todas")
	const [busqueda, setBusqueda] = useState("")

	const alertasOrdenadas = useMemo(() => {
		return [...alertasEquipos]
			.sort((a, b) => b.fechaDeteccion.getTime() - a.fechaDeteccion.getTime())
			.filter((alerta) => {
				if (filtroSeveridad !== "todas" && alerta.severidad !== filtroSeveridad)
					return false
				if (busqueda.trim()) {
					const equipo = equipos.find((e) => e.id === alerta.idEquipo)
					const textosBusqueda = [
						equipo?.nombre,
						alerta.marca,
						alerta.modelo,
						alerta.codigoFalla,
						alerta.descripcionFalla,
					]
						.filter(Boolean)
						.join(" ")
						.toLowerCase()
					if (!textosBusqueda.includes(busqueda.trim().toLowerCase()))
						return false
				}
				return true
			})
	}, [filtroSeveridad, busqueda])

	const conteoActivas = alertasEquipos.filter(
		(a) => a.estado === "activa",
	).length
	const conteoReconocidas = alertasEquipos.filter(
		(a) => a.estado === "reconocida",
	).length
	const conteoResueltas = alertasEquipos.filter(
		(a) => a.estado === "resuelta",
	).length
	const equiposConectados = new Set(alertasEquipos.map((a) => a.idEquipo)).size

	const filtrosBotones: { valor: FiltroSeveridad; label: string }[] = [
		{ valor: "todas", label: "Todas" },
		{ valor: "critica", label: "Crítica" },
		{ valor: "alta", label: "Alta" },
		{ valor: "media", label: "Media" },
		{ valor: "baja", label: "Baja" },
		{ valor: "info", label: "Info" },
	]

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
									<BreadcrumbPage>Centro de Alertas</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>

				<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
					{/* Header */}
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-semibold">Centro de Alertas</h1>
							<p className="text-sm text-muted-foreground">
								Monitoreo en tiempo real de equipos industriales
							</p>
						</div>
						<Button variant="outline">
							<Export className="mr-2 size-4" weight="bold" />
							Exportar
						</Button>
					</div>

					{/* Stats Cards */}
					<div className="grid grid-cols-1 gap-px rounded-xl bg-border sm:grid-cols-2 lg:grid-cols-4">
						<Card className="rounded-none rounded-l-xl border-0 py-0 shadow-none">
							<CardContent className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 p-4 sm:p-6">
								<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
									<SealWarning
										className="size-4 text-red-500"
										weight="duotone"
									/>
									Alertas Activas
								</div>
								<div className="w-full flex-none text-3xl font-medium tabular-nums tracking-tight text-foreground">
									{conteoActivas}
								</div>
							</CardContent>
						</Card>
						<Card className="rounded-none border-0 py-0 shadow-none">
							<CardContent className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 p-4 sm:p-6">
								<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
									<BellRinging
										className="size-4 text-yellow-500"
										weight="duotone"
									/>
									Reconocidas
								</div>
								<div className="w-full flex-none text-3xl font-medium tabular-nums tracking-tight text-foreground">
									{conteoReconocidas}
								</div>
							</CardContent>
						</Card>
						<Card className="rounded-none border-0 py-0 shadow-none">
							<CardContent className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 p-4 sm:p-6">
								<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
									<ShieldCheck
										className="size-4 text-green-500"
										weight="duotone"
									/>
									Resueltas Hoy
								</div>
								<div className="w-full flex-none text-3xl font-medium tabular-nums tracking-tight text-foreground">
									{conteoResueltas}
								</div>
							</CardContent>
						</Card>
						<Card className="rounded-none rounded-r-xl border-0 py-0 shadow-none">
							<CardContent className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 p-4 sm:p-6">
								<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
									<WifiHigh className="size-4 text-blue-500" weight="duotone" />
									Equipos Conectados
								</div>
								<div className="w-full flex-none text-3xl font-medium tabular-nums tracking-tight text-foreground">
									{equiposConectados}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Filter Bar */}
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex flex-wrap items-center gap-1.5">
							<FunnelSimple
								className="mr-1 size-4 text-muted-foreground"
								weight="bold"
							/>
							{filtrosBotones.map((filtro) => (
								<Button
									key={filtro.valor}
									variant={
										filtroSeveridad === filtro.valor ? "default" : "outline"
									}
									size="sm"
									onClick={() => setFiltroSeveridad(filtro.valor)}
									className="h-7 text-xs"
								>
									{filtro.valor !== "todas" && (
										<span
											className={cn(
												"mr-1.5 inline-block size-2 rounded-full",
												SEVERIDAD_CONFIG[filtro.valor as SeveridadAlerta]?.dot,
											)}
										/>
									)}
									{filtro.label}
								</Button>
							))}
						</div>
						<div className="relative w-full sm:w-64">
							<MagnifyingGlass className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Buscar equipo, marca..."
								value={busqueda}
								onChange={(e) => setBusqueda(e.target.value)}
								className="pl-8"
							/>
						</div>
					</div>

					{/* Alerts Feed */}
					{alertasOrdenadas.length > 0 ? (
						<div className="space-y-3">
							{alertasOrdenadas.map((alerta) => {
								const equipo = equipos.find((e) => e.id === alerta.idEquipo)
								const sevConfig = SEVERIDAD_CONFIG[alerta.severidad]
								const estConfig = ESTADO_CONFIG[alerta.estado]

								return (
									<Card
										key={alerta.id}
										className="overflow-hidden transition-all hover:shadow-md"
									>
										<div className="flex">
											<div className={cn("w-1.5 shrink-0", sevConfig.bar)} />
											<div className="flex flex-1 flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
												<div className="flex gap-3">
													<div
														className={cn(
															"flex size-10 shrink-0 items-center justify-center rounded-lg",
															sevConfig.bg,
														)}
													>
														<Gear
															className={cn("size-5", sevConfig.text)}
															weight="duotone"
														/>
													</div>
													<div className="min-w-0 flex-1 space-y-1.5">
														<div className="flex flex-wrap items-center gap-2">
															<span className="text-sm font-semibold">
																{equipo?.nombre ?? "Equipo desconocido"}
															</span>
															<span className="text-xs text-muted-foreground">
																{equipo?.ubicacion}
															</span>
														</div>
														<p className="text-xs text-muted-foreground">
															{alerta.marca} {alerta.modelo}
														</p>
														<p className="text-sm font-medium">
															<span className="font-mono text-xs">
																[{alerta.codigoFalla}]
															</span>{" "}
															{alerta.descripcionFalla}
														</p>
														{alerta.parametros &&
															alerta.parametros.length > 0 && (
																<div className="flex flex-wrap gap-1.5 pt-1">
																	{alerta.parametros.map((param) => (
																		<span
																			key={param.nombre}
																			className="inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 text-xs tabular-nums"
																		>
																			<span className="text-muted-foreground">
																				{param.nombre}:
																			</span>
																			<span className="font-medium">
																				{param.valor}
																				{param.unidad}
																			</span>
																		</span>
																	))}
																</div>
															)}
													</div>
												</div>
												<div className="flex shrink-0 flex-row items-center gap-2 sm:flex-col sm:items-end">
													<span
														className={cn(
															"rounded-full px-2 py-0.5 text-xs font-medium",
															estConfig.classes,
														)}
													>
														{estConfig.label}
													</span>
													<span className="text-xs text-muted-foreground">
														{tiempoRelativo(alerta.fechaDeteccion)}
													</span>
													<div className="flex gap-1.5 pt-1">
														{alerta.estado === "activa" && (
															<Button
																variant="outline"
																size="sm"
																className="h-7 text-xs"
															>
																<Wrench className="mr-1 size-3" />
																Crear OT
															</Button>
														)}
														<Button
															variant="ghost"
															size="sm"
															className="h-7 text-xs"
														>
															<Eye className="mr-1 size-3" />
															Ver Detalles
														</Button>
													</div>
												</div>
											</div>
										</div>
									</Card>
								)
							})}
						</div>
					) : (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-16">
								<BellRinging
									className="size-12 text-muted-foreground/40"
									weight="duotone"
								/>
								<CardTitle className="mt-4 text-base">Sin alertas</CardTitle>
								<CardDescription className="mt-1 text-center">
									No se encontraron alertas con los filtros seleccionados.
									<br />
									Intenta ajustar los criterios de búsqueda.
								</CardDescription>
							</CardContent>
						</Card>
					)}
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
