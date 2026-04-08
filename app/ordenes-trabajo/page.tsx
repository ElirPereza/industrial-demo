"use client"

import { useState, useMemo } from "react"
import {
	ClockCountdown,
	Eye,
	FunnelSimple,
	Hourglass,
	MagnifyingGlass,
	Plus,
	CheckCircle,
	Spinner,
	Warning,
} from "@phosphor-icons/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
	CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import {
	ordenesTrabajo,
	equipos,
	type PrioridadOT,
	type EstadoOrdenTrabajo,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const PRIORIDAD_CONFIG: Record<
	PrioridadOT,
	{ label: string; bg: string; text: string; dot: string }
> = {
	critica: {
		label: "Critica",
		bg: "bg-red-100 dark:bg-red-900/30",
		text: "text-red-800 dark:text-red-400",
		dot: "bg-red-500",
	},
	alta: {
		label: "Alta",
		bg: "bg-orange-100 dark:bg-orange-900/30",
		text: "text-orange-800 dark:text-orange-400",
		dot: "bg-orange-500",
	},
	media: {
		label: "Media",
		bg: "bg-yellow-100 dark:bg-yellow-900/30",
		text: "text-yellow-800 dark:text-yellow-400",
		dot: "bg-yellow-500",
	},
	baja: {
		label: "Baja",
		bg: "bg-blue-100 dark:bg-blue-900/30",
		text: "text-blue-800 dark:text-blue-400",
		dot: "bg-blue-500",
	},
}

const ESTADO_CONFIG: Record<
	EstadoOrdenTrabajo,
	{ label: string; bg: string; text: string }
> = {
	creada: {
		label: "Creada",
		bg: "bg-gray-100 dark:bg-gray-900/30",
		text: "text-gray-800 dark:text-gray-400",
	},
	asignada: {
		label: "Asignada",
		bg: "bg-blue-100 dark:bg-blue-900/30",
		text: "text-blue-800 dark:text-blue-400",
	},
	"en-progreso": {
		label: "En Progreso",
		bg: "bg-yellow-100 dark:bg-yellow-900/30",
		text: "text-yellow-800 dark:text-yellow-400",
	},
	completada: {
		label: "Completada",
		bg: "bg-green-100 dark:bg-green-900/30",
		text: "text-green-800 dark:text-green-400",
	},
	verificada: {
		label: "Verificada",
		bg: "bg-purple-100 dark:bg-purple-900/30",
		text: "text-purple-800 dark:text-purple-400",
	},
	cancelada: {
		label: "Cancelada",
		bg: "bg-red-100 dark:bg-red-900/30",
		text: "text-red-800 dark:text-red-400",
	},
}

const TIPO_CONFIG: Record<string, { label: string; bg: string; text: string }> =
	{
		correctiva: {
			label: "Correctiva",
			bg: "bg-orange-100 dark:bg-orange-900/30",
			text: "text-orange-800 dark:text-orange-400",
		},
		preventiva: {
			label: "Preventiva",
			bg: "bg-blue-100 dark:bg-blue-900/30",
			text: "text-blue-800 dark:text-blue-400",
		},
		predictiva: {
			label: "Predictiva",
			bg: "bg-cyan-100 dark:bg-cyan-900/30",
			text: "text-cyan-800 dark:text-cyan-400",
		},
		mejora: {
			label: "Mejora",
			bg: "bg-emerald-100 dark:bg-emerald-900/30",
			text: "text-emerald-800 dark:text-emerald-400",
		},
	}

type FiltroPrioridad = PrioridadOT | "todas"
type FiltroEstado = EstadoOrdenTrabajo | "todos"

export default function OrdenesTrabajoPage() {
	const router = useRouter()
	const [filtroPrioridad, setFiltroPrioridad] =
		useState<FiltroPrioridad>("todas")
	const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos")
	const [busqueda, setBusqueda] = useState("")

	// Stats
	const abiertas = ordenesTrabajo.filter(
		(ot) => ot.estado === "creada" || ot.estado === "asignada",
	).length
	const enProgreso = ordenesTrabajo.filter(
		(ot) => ot.estado === "en-progreso",
	).length
	const completadas = ordenesTrabajo.filter(
		(ot) => ot.estado === "completada" || ot.estado === "verificada",
	).length
	const otsConTiempoReal = ordenesTrabajo.filter(
		(ot) =>
			(ot.estado === "completada" || ot.estado === "verificada") &&
			ot.tiempoRealHoras,
	)
	const tiempoPromedio =
		otsConTiempoReal.length > 0
			? (
					otsConTiempoReal.reduce(
						(sum, ot) => sum + (ot.tiempoRealHoras ?? 0),
						0,
					) / otsConTiempoReal.length
				).toFixed(1)
			: "—"

	// Filtered list
	const ordenesFiltradas = useMemo(() => {
		return [...ordenesTrabajo]
			.sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime())
			.filter((ot) => {
				if (filtroPrioridad !== "todas" && ot.prioridad !== filtroPrioridad)
					return false
				if (filtroEstado !== "todos" && ot.estado !== filtroEstado) return false
				if (busqueda.trim()) {
					const equipo = equipos.find((e) => e.id === ot.idEquipo)
					const textos = [ot.titulo, equipo?.nombre, ot.tecnicoAsignado]
						.filter(Boolean)
						.join(" ")
						.toLowerCase()
					if (!textos.includes(busqueda.trim().toLowerCase())) return false
				}
				return true
			})
	}, [filtroPrioridad, filtroEstado, busqueda])

	const filtrosPrioridad: { valor: FiltroPrioridad; label: string }[] = [
		{ valor: "todas", label: "Todas" },
		{ valor: "critica", label: "Critica" },
		{ valor: "alta", label: "Alta" },
		{ valor: "media", label: "Media" },
		{ valor: "baja", label: "Baja" },
	]

	const filtrosEstado: { valor: FiltroEstado; label: string }[] = [
		{ valor: "todos", label: "Todos" },
		{ valor: "creada", label: "Creada" },
		{ valor: "asignada", label: "Asignada" },
		{ valor: "en-progreso", label: "En Progreso" },
		{ valor: "completada", label: "Completada" },
		{ valor: "verificada", label: "Verificada" },
		{ valor: "cancelada", label: "Cancelada" },
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
									<BreadcrumbPage>Ordenes de Trabajo</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>

				<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
					{/* Header */}
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-semibold">Ordenes de Trabajo</h1>
							<p className="text-sm text-muted-foreground">
								Gestiona y da seguimiento a las intervenciones de mantenimiento
							</p>
						</div>
						<Button asChild>
							<Link href="/ordenes-trabajo/nueva">
								<Plus className="mr-2 size-4" weight="bold" />
								Nueva OT
							</Link>
						</Button>
					</div>

					{/* Stats Cards */}
					<div className="grid grid-cols-1 gap-px rounded-xl bg-border sm:grid-cols-2 lg:grid-cols-4">
						<Card className="rounded-none rounded-l-xl border-0 py-0 shadow-none">
							<CardContent className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 p-4 sm:p-6">
								<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
									<Warning
										className="size-4 text-orange-500"
										weight="duotone"
									/>
									Abiertas
								</div>
								<div className="w-full flex-none text-3xl font-medium tabular-nums tracking-tight text-foreground">
									{abiertas}
								</div>
							</CardContent>
						</Card>
						<Card className="rounded-none border-0 py-0 shadow-none">
							<CardContent className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 p-4 sm:p-6">
								<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
									<Spinner
										className="size-4 text-yellow-500"
										weight="duotone"
									/>
									En Progreso
								</div>
								<div className="w-full flex-none text-3xl font-medium tabular-nums tracking-tight text-foreground">
									{enProgreso}
								</div>
							</CardContent>
						</Card>
						<Card className="rounded-none border-0 py-0 shadow-none">
							<CardContent className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 p-4 sm:p-6">
								<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
									<CheckCircle
										className="size-4 text-green-500"
										weight="duotone"
									/>
									Completadas
								</div>
								<div className="w-full flex-none text-3xl font-medium tabular-nums tracking-tight text-foreground">
									{completadas}
								</div>
							</CardContent>
						</Card>
						<Card className="rounded-none rounded-r-xl border-0 py-0 shadow-none">
							<CardContent className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 p-4 sm:p-6">
								<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
									<Hourglass
										className="size-4 text-blue-500"
										weight="duotone"
									/>
									Tiempo Prom.
								</div>
								<div className="w-full flex-none text-3xl font-medium tabular-nums tracking-tight text-foreground">
									{tiempoPromedio}h
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Filters */}
					<div className="flex flex-col gap-3">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex flex-wrap items-center gap-1.5">
								<FunnelSimple
									className="mr-1 size-4 text-muted-foreground"
									weight="bold"
								/>
								{filtrosPrioridad.map((filtro) => (
									<Button
										key={filtro.valor}
										variant={
											filtroPrioridad === filtro.valor ? "default" : "outline"
										}
										size="sm"
										onClick={() => setFiltroPrioridad(filtro.valor)}
										className="h-7 text-xs"
									>
										{filtro.valor !== "todas" && (
											<span
												className={cn(
													"mr-1.5 inline-block size-2 rounded-full",
													PRIORIDAD_CONFIG[filtro.valor as PrioridadOT]?.dot,
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
									placeholder="Buscar por titulo, equipo..."
									value={busqueda}
									onChange={(e) => setBusqueda(e.target.value)}
									className="pl-8"
								/>
							</div>
						</div>
						<div className="flex flex-wrap items-center gap-1.5">
							<ClockCountdown
								className="mr-1 size-4 text-muted-foreground"
								weight="bold"
							/>
							{filtrosEstado.map((filtro) => (
								<Button
									key={filtro.valor}
									variant={
										filtroEstado === filtro.valor ? "default" : "outline"
									}
									size="sm"
									onClick={() => setFiltroEstado(filtro.valor)}
									className="h-7 text-xs"
								>
									{filtro.label}
								</Button>
							))}
						</div>
					</div>

					{/* Table */}
					{ordenesFiltradas.length > 0 ? (
						<Card>
							<CardContent className="p-0">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>ID</TableHead>
											<TableHead>Titulo</TableHead>
											<TableHead className="hidden md:table-cell">
												Equipo
											</TableHead>
											<TableHead>Prioridad</TableHead>
											<TableHead className="hidden lg:table-cell">
												Tipo
											</TableHead>
											<TableHead className="hidden md:table-cell">
												Tecnico
											</TableHead>
											<TableHead>Estado</TableHead>
											<TableHead className="hidden lg:table-cell">
												Fecha
											</TableHead>
											<TableHead className="w-10" />
										</TableRow>
									</TableHeader>
									<TableBody>
										{ordenesFiltradas.map((ot) => {
											const equipo = equipos.find((e) => e.id === ot.idEquipo)
											const prioridadConf = PRIORIDAD_CONFIG[ot.prioridad]
											const estadoConf = ESTADO_CONFIG[ot.estado]
											const tipoConf = TIPO_CONFIG[ot.tipo]

											return (
												<TableRow
													key={ot.id}
													className="cursor-pointer"
													onClick={() =>
														router.push(`/ordenes-trabajo/${ot.id}`)
													}
												>
													<TableCell className="font-mono text-xs text-muted-foreground">
														{ot.id.toUpperCase()}
													</TableCell>
													<TableCell className="max-w-[200px] truncate font-medium">
														{ot.titulo}
													</TableCell>
													<TableCell className="hidden text-muted-foreground md:table-cell">
														{equipo?.nombre ?? "—"}
													</TableCell>
													<TableCell>
														<span
															className={cn(
																"rounded-full px-2 py-0.5 text-xs font-medium",
																prioridadConf.bg,
																prioridadConf.text,
															)}
														>
															{prioridadConf.label}
														</span>
													</TableCell>
													<TableCell className="hidden lg:table-cell">
														<span
															className={cn(
																"rounded-full px-2 py-0.5 text-xs font-medium",
																tipoConf.bg,
																tipoConf.text,
															)}
														>
															{tipoConf.label}
														</span>
													</TableCell>
													<TableCell className="hidden text-muted-foreground md:table-cell">
														{ot.tecnicoAsignado}
													</TableCell>
													<TableCell>
														<span
															className={cn(
																"rounded-full px-2 py-0.5 text-xs font-medium",
																estadoConf.bg,
																estadoConf.text,
															)}
														>
															{estadoConf.label}
														</span>
													</TableCell>
													<TableCell className="hidden text-muted-foreground lg:table-cell">
														{ot.fechaCreacion.toLocaleDateString("es-ES", {
															day: "2-digit",
															month: "short",
														})}
													</TableCell>
													<TableCell>
														<Button
															variant="ghost"
															size="sm"
															className="h-7"
															onClick={(e) => {
																e.stopPropagation()
																router.push(`/ordenes-trabajo/${ot.id}`)
															}}
														>
															<Eye className="size-4" />
														</Button>
													</TableCell>
												</TableRow>
											)
										})}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					) : (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-16">
								<ClockCountdown
									className="size-12 text-muted-foreground/40"
									weight="duotone"
								/>
								<CardTitle className="mt-4 text-base">
									Sin ordenes de trabajo
								</CardTitle>
								<CardDescription className="mt-1 text-center">
									No se encontraron ordenes con los filtros seleccionados.
									<br />
									Intenta ajustar los criterios de busqueda.
								</CardDescription>
							</CardContent>
						</Card>
					)}
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
