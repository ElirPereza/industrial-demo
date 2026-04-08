"use client"

import {
	ArrowLeft,
	ArrowsClockwise,
	CalendarBlank,
	CheckCircle,
	Circle,
	Clock,
	LinkSimple,
	ListChecks,
	MapPin,
	NoteBlank,
	Package,
	Printer,
	ShieldCheck,
	User,
	Warning,
	Wrench,
} from "@phosphor-icons/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { use, useEffect, useState } from "react"
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
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar"
import { mapAlertaRow, mapEquipoRow, mapOrdenRow } from "@/lib/data-mappers"
import type { EstadoOrdenTrabajo, PrioridadOT } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

const PRIORIDAD_CONFIG: Record<
	PrioridadOT,
	{ label: string; bg: string; text: string }
> = {
	critica: {
		label: "Critica",
		bg: "bg-red-100 dark:bg-red-900/30",
		text: "text-red-800 dark:text-red-400",
	},
	alta: {
		label: "Alta",
		bg: "bg-orange-100 dark:bg-orange-900/30",
		text: "text-orange-800 dark:text-orange-400",
	},
	media: {
		label: "Media",
		bg: "bg-yellow-100 dark:bg-yellow-900/30",
		text: "text-yellow-800 dark:text-yellow-400",
	},
	baja: {
		label: "Baja",
		bg: "bg-blue-100 dark:bg-blue-900/30",
		text: "text-blue-800 dark:text-blue-400",
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

const CATEGORIA_CONFIG: Record<
	string,
	{
		label: string
		icon: typeof Wrench
		bg: string
		text: string
	}
> = {
	herramienta: {
		label: "Herramientas",
		icon: Wrench,
		bg: "bg-blue-100 dark:bg-blue-900/30",
		text: "text-blue-700 dark:text-blue-400",
	},
	repuesto: {
		label: "Repuestos",
		icon: Package,
		bg: "bg-orange-100 dark:bg-orange-900/30",
		text: "text-orange-700 dark:text-orange-400",
	},
	epp: {
		label: "EPP",
		icon: ShieldCheck,
		bg: "bg-green-100 dark:bg-green-900/30",
		text: "text-green-700 dark:text-green-400",
	},
	procedimiento: {
		label: "Procedimientos",
		icon: ListChecks,
		bg: "bg-purple-100 dark:bg-purple-900/30",
		text: "text-purple-700 dark:text-purple-400",
	},
}

const TIMELINE_ESTADOS: EstadoOrdenTrabajo[] = [
	"creada",
	"asignada",
	"en-progreso",
	"completada",
	"verificada",
]

function getEstadoIndex(estado: EstadoOrdenTrabajo): number {
	if (estado === "cancelada") return -1
	return TIMELINE_ESTADOS.indexOf(estado)
}

type OrdenDetalle = ReturnType<typeof mapOrdenRow>
type EquipoDetalle = ReturnType<typeof mapEquipoRow>
type AlertaDetalle = ReturnType<typeof mapAlertaRow>

function buildChecklistState(
	checklist: OrdenDetalle["checklist"],
): Record<string, boolean> {
	const initial: Record<string, boolean> = {}

	for (const item of checklist) {
		initial[item.id] = item.completado
	}

	return initial
}

function getNextEstado(estado: EstadoOrdenTrabajo): EstadoOrdenTrabajo | null {
	if (estado === "cancelada") return null

	const currentIndex = getEstadoIndex(estado)
	return TIMELINE_ESTADOS[currentIndex + 1] ?? null
}

export default function OrdenTrabajoDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id: otId } = use(params)
	const router = useRouter()
	const [orden, setOrden] = useState<OrdenDetalle | null>(null)
	const [equiposData, setEquiposData] = useState<EquipoDetalle[]>([])
	const [alertasData, setAlertasData] = useState<AlertaDetalle[]>([])
	const [checklistState, setChecklistState] = useState<Record<string, boolean>>(
		{},
	)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [reloadKey, setReloadKey] = useState(0)

	useEffect(() => {
		let isActive = true

		const fetchOrdenDetail = async () => {
			setIsLoading(true)
			setError(null)

			const supabase = createClient()
			const [ordenResult, equiposResult, alertasResult] = await Promise.all([
				supabase.from("ordenes_trabajo").select("*").eq("id", otId).single(),
				supabase.from("equipos").select("*"),
				supabase.from("alertas_equipos").select("*"),
			])

			if (!isActive) return

			const fetchError =
				ordenResult.error ?? equiposResult.error ?? alertasResult.error

			if (fetchError) {
				setError(fetchError.message)
				setOrden(null)
				setChecklistState({})
				setIsLoading(false)
				return
			}

			const ordenRow = ordenResult.data as Tables<"ordenes_trabajo">
			const equiposRows = (equiposResult.data ?? []) as Tables<"equipos">[]
			const alertasRows = (alertasResult.data ??
				[]) as Tables<"alertas_equipos">[]

			const mappedOrden = mapOrdenRow(ordenRow)
			setOrden(mappedOrden)
			setEquiposData(equiposRows.map((row) => mapEquipoRow(row)))
			setAlertasData(alertasRows.map((row) => mapAlertaRow(row)))
			setChecklistState(buildChecklistState(mappedOrden.checklist))
			setIsLoading(false)
		}

		void fetchOrdenDetail()

		return () => {
			isActive = false
		}
	}, [otId, reloadKey])

	const handleStatusUpdate = async (newEstado: EstadoOrdenTrabajo) => {
		if (!orden || orden.estado === newEstado) return

		const supabase = createClient()
		const { error: updateError } = await supabase
			.from("ordenes_trabajo")
			.update({ estado: newEstado })
			.eq("id", otId)

		if (updateError) {
			setError(updateError.message)
			return
		}

		setOrden((prev) => (prev ? { ...prev, estado: newEstado } : prev))
	}

	const handleChecklistToggle = async (checkIndex: number) => {
		if (!orden || checkIndex < 0 || checkIndex >= orden.checklist.length) return

		const updatedChecklist = [...orden.checklist]
		updatedChecklist[checkIndex] = {
			...updatedChecklist[checkIndex],
			completado: !updatedChecklist[checkIndex].completado,
		}

		const supabase = createClient()
		const { error: updateError } = await supabase
			.from("ordenes_trabajo")
			.update({
				checklist:
					updatedChecklist as unknown as Tables<"ordenes_trabajo">["checklist"],
			})
			.eq("id", otId)

		if (updateError) {
			setError(updateError.message)
			return
		}

		setOrden((prev) => (prev ? { ...prev, checklist: updatedChecklist } : prev))
		setChecklistState(buildChecklistState(updatedChecklist))
	}

	const toggleCheckItem = (itemId: string) => {
		if (!orden) return

		const checkIndex = orden.checklist.findIndex((item) => item.id === itemId)
		if (checkIndex === -1) return

		void handleChecklistToggle(checkIndex)
	}

	if (isLoading) {
		return <PageLoading message="Cargando orden de trabajo..." />
	}

	if (error) {
		return (
			<PageError
				message="Error al cargar la orden de trabajo"
				description={error}
				onRetry={() => setReloadKey((prev) => prev + 1)}
			/>
		)
	}

	const ot = orden

	if (!ot) {
		return (
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<div className="flex min-h-screen items-center justify-center">
						<div className="text-center">
							<h1 className="text-2xl font-semibold">
								Orden de trabajo no encontrada
							</h1>
							<p className="mt-2 text-muted-foreground">
								La orden que buscas no existe o fue eliminada.
							</p>
							<Button
								className="mt-4"
								onClick={() => router.push("/ordenes-trabajo")}
							>
								Volver a Ordenes de Trabajo
							</Button>
						</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
		)
	}

	const equipo = equiposData.find((e) => e.id === ot.idEquipo)
	const alerta = ot.idAlerta
		? alertasData.find((a) => a.id === ot.idAlerta)
		: null
	const prioridadConf = PRIORIDAD_CONFIG[ot.prioridad]
	const estadoConf = ESTADO_CONFIG[ot.estado]
	const tipoConf = TIPO_CONFIG[ot.tipo]
	const nextEstado = getNextEstado(ot.estado)

	const categorias = ["epp", "herramienta", "repuesto", "procedimiento"]
	const checklistPorCategoria = categorias.map((cat) => ({
		categoria: cat,
		items: ot.checklist.filter((item) => item.categoria === cat),
	}))

	const totalItems = ot.checklist.length
	const completedItems = Object.values(checklistState).filter(Boolean).length
	const progressPercent =
		totalItems > 0 ? (completedItems / totalItems) * 100 : 0

	const estadoActualIndex = getEstadoIndex(ot.estado)

	const formatFecha = (fecha: Date) =>
		fecha.toLocaleDateString("es-ES", {
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		})

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
									<BreadcrumbLink href="/ordenes-trabajo">
										Ordenes de Trabajo
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>{ot.id.toUpperCase()}</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>

				<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
					<Button
						variant="ghost"
						className="w-fit"
						onClick={() => router.push("/ordenes-trabajo")}
					>
						<ArrowLeft className="mr-2 size-4" weight="bold" />
						Volver a Ordenes de Trabajo
					</Button>

					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<div className="flex flex-wrap items-center gap-3">
								<h1 className="text-2xl font-semibold">{ot.titulo}</h1>
								<span
									className={cn(
										"rounded-full px-2 py-0.5 text-xs font-medium",
										prioridadConf.bg,
										prioridadConf.text,
									)}
								>
									{prioridadConf.label}
								</span>
								<span
									className={cn(
										"rounded-full px-2 py-0.5 text-xs font-medium",
										estadoConf.bg,
										estadoConf.text,
									)}
								>
									{estadoConf.label}
								</span>
							</div>
							<p className="mt-1 font-mono text-xs text-muted-foreground">
								{ot.id.toUpperCase()}
							</p>
						</div>
						<div className="flex gap-2">
							<Button
								variant="outline"
								disabled={!nextEstado}
								onClick={() => {
									if (nextEstado) {
										void handleStatusUpdate(nextEstado)
									}
								}}
							>
								<ArrowsClockwise className="mr-2 size-4" weight="bold" />
								Cambiar Estado
							</Button>
							<Button variant="outline">
								<Printer className="mr-2 size-4" weight="bold" />
								Imprimir
							</Button>
						</div>
					</div>

					<div className="grid gap-6 lg:grid-cols-3">
						{/* Left Column */}
						<div className="space-y-6 lg:col-span-2">
							<Card>
								<CardHeader>
									<CardTitle>Informacion General</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<p className="text-sm text-muted-foreground">Descripcion</p>
										<p className="mt-1 text-sm">{ot.descripcion}</p>
									</div>

									<div className="grid gap-4 sm:grid-cols-2">
										<div>
											<p className="text-sm text-muted-foreground">Tipo</p>
											<span
												className={cn(
													"mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
													tipoConf.bg,
													tipoConf.text,
												)}
											>
												{tipoConf.label}
											</span>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">
												Solicitante
											</p>
											<p className="mt-1 text-sm font-medium">
												{ot.solicitante}
											</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">
												Fecha de creacion
											</p>
											<p className="mt-1 text-sm font-medium">
												{formatFecha(ot.fechaCreacion)}
											</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">
												Tiempo estimado vs real
											</p>
											<p className="mt-1 text-sm font-medium">
												{ot.tiempoEstimadoHoras}h estimadas
												{ot.tiempoRealHoras !== undefined && (
													<> / {ot.tiempoRealHoras}h reales</>
												)}
											</p>
										</div>
									</div>

									{alerta && (
										<div className="rounded-lg border border-dashed p-4">
											<div className="flex items-center gap-2 text-sm font-medium">
												<Warning
													className="size-4 text-orange-500"
													weight="duotone"
												/>
												Alerta relacionada
											</div>
											<p className="mt-1 text-sm text-muted-foreground">
												<span className="font-mono text-xs">
													[{alerta.codigoFalla}]
												</span>{" "}
												{alerta.descripcionFalla}
											</p>
											<p className="mt-0.5 text-xs text-muted-foreground">
												{equipo?.nombre} — {alerta.marca} {alerta.modelo}
											</p>
										</div>
									)}
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<div className="flex items-center justify-between">
										<div>
											<CardTitle>Checklist de Intervencion</CardTitle>
											<CardDescription>
												{completedItems} de {totalItems} completados
											</CardDescription>
										</div>
										<span className="text-sm font-medium tabular-nums">
											{Math.round(progressPercent)}%
										</span>
									</div>
									<Progress value={progressPercent} className="mt-2" />
								</CardHeader>
								<CardContent className="space-y-6">
									{checklistPorCategoria.map(({ categoria, items }) => {
										if (items.length === 0) return null
										const config = CATEGORIA_CONFIG[categoria]
										const Icon = config.icon

										return (
											<div key={categoria}>
												<div className="mb-3 flex items-center gap-2">
													<div
														className={cn(
															"flex size-7 items-center justify-center rounded-md",
															config.bg,
														)}
													>
														<Icon
															className={cn("size-4", config.text)}
															weight="duotone"
														/>
													</div>
													<span className="text-sm font-medium">
														{config.label}
													</span>
												</div>
												<div className="space-y-2 pl-9">
													{items.map((item) => (
														<button
															key={item.id}
															type="button"
															onClick={() => toggleCheckItem(item.id)}
															className={cn(
																"flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all",
																checklistState[item.id]
																	? "border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-950/20"
																	: "hover:bg-muted/50",
															)}
														>
															<div
																className={cn(
																	"flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
																	checklistState[item.id]
																		? "border-green-500 bg-green-500"
																		: "border-muted-foreground/30",
																)}
															>
																{checklistState[item.id] && (
																	<CheckCircle
																		className="size-3 text-white"
																		weight="bold"
																	/>
																)}
															</div>
															<span
																className={cn(
																	"text-sm",
																	checklistState[item.id] &&
																		"text-muted-foreground line-through",
																)}
															>
																{item.descripcion}
															</span>
														</button>
													))}
												</div>
											</div>
										)
									})}
								</CardContent>
							</Card>

							{ot.notas && (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<NoteBlank className="size-5" weight="duotone" />
											Notas
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-sm leading-relaxed">{ot.notas}</p>
									</CardContent>
								</Card>
							)}
						</div>

						{/* Right Column */}
						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<MapPin className="size-5" weight="duotone" />
										Equipo
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									{equipo ? (
										<>
											<p className="font-medium">{equipo.nombre}</p>
											<p className="text-sm text-muted-foreground">
												{equipo.ubicacion}
											</p>
											<span
												className={cn(
													"inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
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
											<div>
												<Button
													variant="outline"
													size="sm"
													className="mt-2 w-full"
													asChild
												>
													<Link href={`/activos/${equipo.id}`}>
														<LinkSimple className="mr-2 size-4" />
														Ver equipo
													</Link>
												</Button>
											</div>
										</>
									) : (
										<p className="text-sm text-muted-foreground">
											Equipo no encontrado
										</p>
									)}
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<User className="size-5" weight="duotone" />
										Tecnico Asignado
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<p className="font-medium">{ot.tecnicoAsignado}</p>
									{ot.fechaInicioProgramada && (
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<CalendarBlank className="size-4 shrink-0" />
											<span>
												Programada:{" "}
												{ot.fechaInicioProgramada.toLocaleDateString("es-ES", {
													day: "2-digit",
													month: "short",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</span>
										</div>
									)}
									{ot.fechaInicioReal && (
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<Clock className="size-4 shrink-0" />
											<span>
												Inicio real:{" "}
												{ot.fechaInicioReal.toLocaleDateString("es-ES", {
													day: "2-digit",
													month: "short",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</span>
										</div>
									)}
									{ot.fechaFinReal && (
										<div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
											<CheckCircle className="size-4 shrink-0" />
											<span>
												Fin:{" "}
												{ot.fechaFinReal.toLocaleDateString("es-ES", {
													day: "2-digit",
													month: "short",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</span>
										</div>
									)}
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Linea de Tiempo</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-0">
										{TIMELINE_ESTADOS.map((estado, index) => {
											const config = ESTADO_CONFIG[estado]
											const isPast = index <= estadoActualIndex
											const isCurrent = index === estadoActualIndex
											const isLast = index === TIMELINE_ESTADOS.length - 1

											return (
												<div key={estado} className="relative flex gap-3">
													{!isLast && (
														<div
															className={cn(
																"absolute left-[11px] top-6 h-full w-px",
																isPast ? "bg-primary" : "bg-border",
															)}
														/>
													)}
													<div className="relative z-10 flex size-6 shrink-0 items-center justify-center">
														{isPast ? (
															<div
																className={cn(
																	"flex size-6 items-center justify-center rounded-full",
																	isCurrent ? "bg-primary" : "bg-primary/80",
																)}
															>
																<CheckCircle
																	className="size-4 text-primary-foreground"
																	weight="bold"
																/>
															</div>
														) : (
															<Circle className="size-5 text-muted-foreground/30" />
														)}
													</div>
													<div
														className={cn(
															"flex-1 pb-6",
															!isPast && "opacity-40",
														)}
													>
														<p
															className={cn(
																"text-sm font-medium",
																isCurrent && "text-primary",
															)}
														>
															{config.label}
														</p>
													</div>
												</div>
											)
										})}
										{ot.estado === "cancelada" && (
											<div className="flex items-center gap-3 rounded-lg bg-red-50 p-2 dark:bg-red-950/20">
												<div className="flex size-6 items-center justify-center rounded-full bg-red-500">
													<Warning
														className="size-4 text-white"
														weight="bold"
													/>
												</div>
												<p className="text-sm font-medium text-red-700 dark:text-red-400">
													Cancelada
												</p>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
