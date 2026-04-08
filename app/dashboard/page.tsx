"use client"

import {
	ArrowRight,
	BellRinging,
	CalendarBlank,
	ChartLineUp,
	CheckCircle,
	ClipboardText,
	ClockCounterClockwise,
	CurrencyDollar,
	FileText,
	Gauge,
	GearSix,
	MapPin,
	Timer,
	TrendDown,
	TrendUp,
	Wrench,
} from "@phosphor-icons/react"
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
import {
	Card,
	CardContent,
	CardFooter,
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
	mapKpiRow,
	mapMantenimientoRow,
	mapOrdenRow,
	mapProfileRow,
} from "@/lib/data-mappers"
import type {
	AlertaEquipo,
	EnvioFormulario,
	Equipo,
	FormTemplate,
	KPI,
	OrdenTrabajo,
	RegistroMantenimiento,
	Usuario,
} from "@/lib/mock-data"
import { useSupabaseQuery } from "@/lib/hooks/use-supabase-query"
import { useRole } from "@/lib/role-provider"
import type { Tables } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"
import { ContratistaView } from "./_views/contratista-view"
import { SupervisorView } from "./_views/supervisor-view"
import { TecnicoView } from "./_views/tecnico-view"

const FECHA_REF = new Date("2026-02-10T12:00:00")

function tiempoRelativo(fecha: Date): string {
	const diffMs = FECHA_REF.getTime() - fecha.getTime()
	const diffMin = Math.floor(diffMs / 60000)
	const diffHoras = Math.floor(diffMs / 3600000)
	const diffDias = Math.floor(diffMs / 86400000)

	if (diffMin < 0) return "Próximamente"
	if (diffMin < 1) return "Justo ahora"
	if (diffMin < 60) return `Hace ${diffMin} min`
	if (diffHoras < 24) return `Hace ${diffHoras}h`
	if (diffDias < 7) return `Hace ${diffDias}d`
	return fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
}

const KPI_CONFIG = [
	{
		icon: ChartLineUp,
		color: "text-emerald-600 dark:text-emerald-400",
		bg: "bg-emerald-100 dark:bg-emerald-900/30",
		spark: "bg-emerald-500/25 dark:bg-emerald-400/20",
		invertido: false,
		bars: [3, 4, 3, 5, 4, 5],
	},
	{
		icon: Timer,
		color: "text-blue-600 dark:text-blue-400",
		bg: "bg-blue-100 dark:bg-blue-900/30",
		spark: "bg-blue-500/25 dark:bg-blue-400/20",
		invertido: true,
		bars: [5, 4, 5, 4, 3, 2],
	},
	{
		icon: CurrencyDollar,
		color: "text-amber-600 dark:text-amber-400",
		bg: "bg-amber-100 dark:bg-amber-900/30",
		spark: "bg-amber-500/25 dark:bg-amber-400/20",
		invertido: true,
		bars: [3, 3, 4, 3, 4, 3],
	},
	{
		icon: CheckCircle,
		color: "text-violet-600 dark:text-violet-400",
		bg: "bg-violet-100 dark:bg-violet-900/30",
		spark: "bg-violet-500/25 dark:bg-violet-400/20",
		invertido: false,
		bars: [2, 3, 4, 3, 5, 5],
	},
	{
		icon: GearSix,
		color: "text-orange-600 dark:text-orange-400",
		bg: "bg-orange-100 dark:bg-orange-900/30",
		spark: "bg-orange-500/25 dark:bg-orange-400/20",
		invertido: true,
		bars: [4, 3, 3, 2, 3, 2],
	},
	{
		icon: Gauge,
		color: "text-cyan-600 dark:text-cyan-400",
		bg: "bg-cyan-100 dark:bg-cyan-900/30",
		spark: "bg-cyan-500/25 dark:bg-cyan-400/20",
		invertido: false,
		bars: [3, 4, 4, 5, 4, 5],
	},
]

const BAR_H: Record<number, string> = {
	1: "h-1",
	2: "h-2",
	3: "h-3",
	4: "h-4",
	5: "h-5",
}

const PRIO: Record<string, { dot: string; label: string }> = {
	critica: { dot: "bg-red-500", label: "Crítica" },
	alta: { dot: "bg-orange-500", label: "Alta" },
	media: { dot: "bg-yellow-500", label: "Media" },
	baja: { dot: "bg-blue-500", label: "Baja" },
}

const ESTADO_OT: Record<string, { cls: string; label: string }> = {
	creada: {
		cls: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
		label: "Creada",
	},
	asignada: {
		cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		label: "Asignada",
	},
	"en-progreso": {
		cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		label: "En Progreso",
	},
	completada: {
		cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		label: "Completada",
	},
	verificada: {
		cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
		label: "Verificada",
	},
	cancelada: {
		cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
		label: "Cancelada",
	},
}

interface AdminContentProps {
	alertasEquipos: AlertaEquipo[]
	enviosFormularios: EnvioFormulario[]
	equipos: Equipo[]
	formulariosTemplate: FormTemplate[]
	kpis: KPI[]
	ordenesTrabajo: OrdenTrabajo[]
	registrosMantenimiento: RegistroMantenimiento[]
	usuarios: Usuario[]
}

function AdminContent({
	alertasEquipos,
	enviosFormularios,
	equipos,
	formulariosTemplate,
	kpis,
	ordenesTrabajo,
	registrosMantenimiento,
	usuarios,
}: AdminContentProps) {
	const operativos = equipos.filter((e) => e.estado === "operativo").length
	const enMant = equipos.filter((e) => e.estado === "mantenimiento").length
	const fueraServ = equipos.filter((e) => e.estado === "fuera-servicio").length

	const alertasActivas = alertasEquipos.filter((a) => a.estado === "activa")
	const eqConAlerta = new Set(alertasActivas.map((a) => a.idEquipo))

	const otRecientes = [...ordenesTrabajo]
		.sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime())
		.slice(0, 6)

	const actividadReciente = [
		...enviosFormularios.map((e) => {
			const form = formulariosTemplate.find((f) => f.id === e.idFormulario)
			const usr = usuarios.find((u) => u.id === e.idUsuario)
			return {
				id: e.id,
				tipo: "formulario" as const,
				desc: `Envío: ${form?.nombre ?? "Formulario"}`,
				usuario: usr?.nombre ?? "Usuario",
				fecha: e.fechaEnvio,
				subtipo: form?.tipo ?? "inspeccion",
			}
		}),
		...registrosMantenimiento.map((r) => ({
			id: r.id,
			tipo: "mantenimiento" as const,
			desc: r.descripcion,
			usuario: r.tecnico,
			fecha: r.fechaInicio,
			subtipo: r.tipo,
		})),
	]
		.sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
		.slice(0, 8)

	const proxMant = equipos
		.map((e) => {
			const dias = Math.ceil(
				(e.proximoMantenimiento.getTime() - FECHA_REF.getTime()) / 86400000,
			)
			return { ...e, diasRestantes: dias }
		})
		.filter((e) => e.diasRestantes >= 0 && e.diasRestantes <= 45)
		.sort((a, b) => a.diasRestantes - b.diasRestantes)

	return (
		<div className="flex min-w-0 flex-1 flex-col gap-6 p-4 pt-0">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="min-w-0">
					<h1 className="text-2xl font-semibold tracking-tight">
						Panel de Control
					</h1>
					<p className="text-sm text-muted-foreground">
						Febrero 2026 — Planta Industrial
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
				{kpis.map((kpi, idx) => {
					const cfg = KPI_CONFIG[idx]
					const Icon = cfg.icon
					const pos = cfg.invertido
						? kpi.tendencia === "abajo"
						: kpi.tendencia === "arriba"
					const neg = cfg.invertido
						? kpi.tendencia === "arriba"
						: kpi.tendencia === "abajo"

					return (
						<Card key={kpi.id}>
							<CardContent className="p-4">
								<div className="flex items-start justify-between">
									<div
										className={cn(
											"flex size-9 items-center justify-center rounded-lg",
											cfg.bg,
										)}
									>
										<Icon
											className={cn("size-5", cfg.color)}
											weight="duotone"
										/>
									</div>
									<div
										className={cn(
											"flex items-center gap-1 text-xs font-medium",
											pos && "text-green-600 dark:text-green-400",
											neg && "text-red-600 dark:text-red-400",
											kpi.tendencia === "estable" && "text-muted-foreground",
										)}
									>
										{kpi.tendencia === "arriba" && (
											<TrendUp className="size-3.5" weight="bold" />
										)}
										{kpi.tendencia === "abajo" && (
											<TrendDown className="size-3.5" weight="bold" />
										)}
										{kpi.tendencia === "arriba" && " +12%"}
										{kpi.tendencia === "abajo" && " -8%"}
										{kpi.tendencia === "estable" && "— 0%"}
									</div>
								</div>
								<div className="mt-3">
									<div className="text-2xl font-semibold tabular-nums tracking-tight">
										{kpi.valor.toLocaleString()}
										<span className="ml-1 text-sm font-normal text-muted-foreground">
											{kpi.unidad}
										</span>
									</div>
									<p className="mt-0.5 text-xs text-muted-foreground">
										{kpi.nombre}
									</p>
								</div>
								<div className="mt-3 flex items-end gap-1">
									{cfg.bars.map((h, i) => (
										<div
											key={`${kpi.id}-${i}`}
											className={cn("w-full rounded-sm", BAR_H[h], cfg.spark)}
										/>
									))}
								</div>
							</CardContent>
						</Card>
					)
				})}
			</div>

			<div className="grid gap-4 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle className="flex items-center gap-2">
									<GearSix
										className="size-4 text-muted-foreground"
										weight="duotone"
									/>
									Estado de Equipos en Tiempo Real
								</CardTitle>
							</div>
							<p className="text-xs text-muted-foreground">
								<span className="font-medium text-green-600 dark:text-green-400">
									{operativos} Operativos
								</span>
								{" • "}
								<span className="font-medium text-yellow-600 dark:text-yellow-400">
									{enMant} En Mantenimiento
								</span>
								{" • "}
								<span className="font-medium text-red-600 dark:text-red-400">
									{fueraServ} Fuera de Servicio
								</span>
							</p>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 gap-2 md:grid-cols-4">
								{equipos.map((eq) => {
									const alerta = eqConAlerta.has(eq.id)
									return (
										<div
											key={eq.id}
											className={cn(
												"relative flex flex-col gap-1 border-l-2 bg-muted/40 p-2.5 transition-colors hover:bg-muted/70 dark:bg-muted/20 dark:hover:bg-muted/40",
												eq.estado === "operativo" && "border-l-green-500",
												eq.estado === "mantenimiento" && "border-l-yellow-500",
												eq.estado === "fuera-servicio" && "border-l-red-500",
											)}
										>
											{alerta && (
												<span className="absolute right-2 top-2 flex size-2.5">
													<span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
													<span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
												</span>
											)}
											<div className="flex items-center gap-1.5">
												<span
													className={cn(
														"size-1.5 shrink-0 rounded-full",
														eq.estado === "operativo" && "bg-green-500",
														eq.estado === "mantenimiento" && "bg-yellow-500",
														eq.estado === "fuera-servicio" && "bg-red-500",
													)}
												/>
												<span className="truncate text-xs font-medium">
													{eq.nombre}
												</span>
											</div>
											<div className="flex items-center gap-1 pl-3">
												<MapPin className="size-3 shrink-0 text-muted-foreground" />
												<span className="truncate text-[10px] text-muted-foreground">
													{eq.ubicacion}
												</span>
											</div>
										</div>
									)
								})}
							</div>
						</CardContent>
					</Card>
				</div>

				<div>
					<Card className="flex h-full flex-col">
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle className="flex items-center gap-2">
									<BellRinging
										className="size-4 text-red-500"
										weight="duotone"
									/>
									Alertas Activas
								</CardTitle>
								<span className="flex size-5 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
									{alertasActivas.length}
								</span>
							</div>
						</CardHeader>
						<CardContent className="flex-1 p-0">
							<div className="divide-y">
								{alertasActivas.slice(0, 6).map((al) => {
									const eq = equipos.find((e) => e.id === al.idEquipo)
									return (
										<div
											key={al.id}
											className="flex items-start gap-3 px-4 py-3"
										>
											<span
												className={cn(
													"mt-1 size-2 shrink-0 rounded-full",
													al.severidad === "critica" && "bg-red-500",
													al.severidad === "alta" && "bg-orange-500",
													al.severidad === "media" && "bg-yellow-500",
													al.severidad === "baja" && "bg-blue-500",
													al.severidad === "info" && "bg-gray-400",
												)}
											/>
											<div className="min-w-0 flex-1">
												<p className="truncate text-xs font-medium">
													{eq?.nombre}
												</p>
												<p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
													[{al.codigoFalla}]
												</p>
											</div>
											<span className="shrink-0 text-[10px] text-muted-foreground">
												{tiempoRelativo(al.fechaDeteccion)}
											</span>
										</div>
									)
								})}
							</div>
						</CardContent>
						<CardFooter>
							<a
								href="/alertas"
								className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
							>
								Ver centro de alertas
								<ArrowRight className="size-3" />
							</a>
						</CardFooter>
					</Card>
				</div>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<ClipboardText
									className="size-4 text-muted-foreground"
									weight="duotone"
								/>
								Órdenes de Trabajo
							</CardTitle>
							<span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
								{ordenesTrabajo.length}
							</span>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="overflow-x-auto">
							<table className="w-full text-xs">
								<thead>
									<tr className="border-b text-left text-muted-foreground">
										<th className="px-4 py-2 font-medium">Título</th>
										<th className="hidden px-4 py-2 font-medium sm:table-cell">
											Equipo
										</th>
										<th className="px-4 py-2 font-medium">Prio.</th>
										<th className="px-4 py-2 font-medium">Estado</th>
										<th className="hidden px-4 py-2 font-medium md:table-cell">
											Técnico
										</th>
									</tr>
								</thead>
								<tbody className="divide-y">
									{otRecientes.map((ot) => {
										const pr = PRIO[ot.prioridad]
										const est = ESTADO_OT[ot.estado]
										return (
											<tr
												key={ot.id}
												className="transition-colors hover:bg-muted/50"
											>
												<td className="px-4 py-2.5">
													<div className="flex items-center gap-1.5">
														<span
															className={cn("size-2 rounded-full", pr.dot)}
														/>
														<span className="hidden sm:inline">{pr.label}</span>
													</div>
												</td>
												<td className="px-4 py-2.5">
													<span
														className={cn(
															"inline-flex rounded-sm px-1.5 py-0.5 text-[10px] font-medium",
															est.cls,
														)}
													>
														{est.label}
													</span>
												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
						</div>
					</CardContent>
					<CardFooter>
						<a
							href="/ordenes-trabajo"
							className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
						>
							Ver todas
							<ArrowRight className="size-3" />
						</a>
					</CardFooter>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ClockCounterClockwise
								className="size-4 text-muted-foreground"
								weight="duotone"
							/>
							Actividad Reciente
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						<div className="divide-y">
							{actividadReciente.map((item) => {
								const correc =
									item.subtipo === "correctivo" ||
									item.subtipo === "reporte-fallas"
								const inspec =
									item.subtipo === "inspección" || item.subtipo === "inspeccion"
								return (
									<div
										key={`${item.tipo}-${item.id}`}
										className="flex items-start gap-3 px-4 py-3"
									>
										<div
											className={cn(
												"mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
												item.tipo === "formulario"
													? "bg-blue-100 dark:bg-blue-900/30"
													: correc
														? "bg-orange-100 dark:bg-orange-900/30"
														: inspec
															? "bg-green-100 dark:bg-green-900/30"
															: "bg-violet-100 dark:bg-violet-900/30",
											)}
										>
											{item.tipo === "formulario" ? (
												<FileText
													className="size-3.5 text-blue-600 dark:text-blue-400"
													weight="duotone"
												/>
											) : (
												<Wrench
													className={cn(
														"size-3.5",
														correc
															? "text-orange-600 dark:text-orange-400"
															: inspec
																? "text-green-600 dark:text-green-400"
																: "text-violet-600 dark:text-violet-400",
													)}
													weight="duotone"
												/>
											)}
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate text-xs font-medium">
												{item.desc}
											</p>
											<p className="mt-0.5 text-[10px] text-muted-foreground">
												{item.usuario}
											</p>
										</div>
										<span className="shrink-0 text-[10px] text-muted-foreground">
											{tiempoRelativo(item.fecha)}
										</span>
									</div>
								)
							})}
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CalendarBlank
							className="size-4 text-muted-foreground"
							weight="duotone"
						/>
						Próximos Mantenimientos Programados
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex gap-3 overflow-x-auto pb-2">
						{proxMant.map((eq) => (
							<div
								key={eq.id}
								className={cn(
									"flex min-w-[200px] shrink-0 flex-col gap-2 border-l-2 bg-muted/40 p-3 dark:bg-muted/20",
									eq.diasRestantes > 15 && "border-l-green-500",
									eq.diasRestantes >= 7 &&
										eq.diasRestantes <= 15 &&
										"border-l-yellow-500",
									eq.diasRestantes < 7 && "border-l-red-500",
								)}
							>
								<p className="text-xs font-medium">{eq.nombre}</p>
								<p className="text-[10px] text-muted-foreground">
									{eq.proximoMantenimiento.toLocaleDateString("es-ES", {
										day: "2-digit",
										month: "short",
										year: "numeric",
									})}
								</p>
								<div className="flex items-center justify-between">
									<span
										className={cn(
											"text-xs font-semibold tabular-nums",
											eq.diasRestantes > 15 &&
												"text-green-600 dark:text-green-400",
											eq.diasRestantes >= 7 &&
												eq.diasRestantes <= 15 &&
												"text-yellow-600 dark:text-yellow-400",
											eq.diasRestantes < 7 && "text-red-600 dark:text-red-400",
										)}
									>
										{eq.diasRestantes <= 0
											? "Vencido"
											: `${eq.diasRestantes}d restantes`}
									</span>
									<span
										className={cn(
											"rounded-sm px-1.5 py-0.5 text-[10px] font-medium",
											eq.tipo === "maquinaria-pesada" &&
												"bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
											eq.tipo === "linea-produccion" &&
												"bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
											eq.tipo === "electricos" &&
												"bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
											eq.tipo === "hvac" &&
												"bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
										)}
									>
										{eq.tipo === "maquinaria-pesada" && "Maquinaria"}
										{eq.tipo === "linea-produccion" && "Producción"}
										{eq.tipo === "electricos" && "Eléctrico"}
										{eq.tipo === "hvac" && "HVAC"}
									</span>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default function DashboardPage() {
	const { role } = useRole()
	const equiposQuery = useSupabaseQuery(
		"equipos",
		(row: Record<string, unknown>) => mapEquipoRow(row as Tables<"equipos">),
	)
	const formulariosQuery = useSupabaseQuery(
		"form_templates",
		(row: Record<string, unknown>) =>
			mapFormTemplateRow(row as Tables<"form_templates">),
	)
	const enviosQuery = useSupabaseQuery(
		"envios_formularios",
		(row: Record<string, unknown>) =>
			mapEnvioRow(row as Tables<"envios_formularios">),
	)
	const ordenesQuery = useSupabaseQuery(
		"ordenes_trabajo",
		(row: Record<string, unknown>) =>
			mapOrdenRow(row as Tables<"ordenes_trabajo">),
	)
	const alertasQuery = useSupabaseQuery(
		"alertas_equipos",
		(row: Record<string, unknown>) =>
			mapAlertaRow(row as Tables<"alertas_equipos">),
	)
	const mantenimientosQuery = useSupabaseQuery(
		"registros_mantenimiento",
		(row: Record<string, unknown>) =>
			mapMantenimientoRow(row as Tables<"registros_mantenimiento">),
	)
	const kpisQuery = useSupabaseQuery("kpis", (row: Record<string, unknown>) =>
		mapKpiRow(row as Tables<"kpis">),
	)
	const usuariosQuery = useSupabaseQuery(
		"profiles",
		(row: Record<string, unknown>) => mapProfileRow(row as Tables<"profiles">),
	)

	const dashboardQueries = [
		equiposQuery,
		formulariosQuery,
		enviosQuery,
		ordenesQuery,
		alertasQuery,
		mantenimientosQuery,
		kpisQuery,
		usuariosQuery,
	]

	const isLoading = dashboardQueries.some((query) => query.isLoading)
	const error = dashboardQueries.find((query) => query.error)?.error ?? null

	const refetchAll = () => {
		for (const query of dashboardQueries) {
			query.refetch()
		}
	}

	const equipos = equiposQuery.data ?? []
	const formulariosTemplate = formulariosQuery.data ?? []
	const enviosFormularios = enviosQuery.data ?? []
	const ordenesTrabajo = ordenesQuery.data ?? []
	const alertasEquipos = alertasQuery.data ?? []
	const registrosMantenimiento = mantenimientosQuery.data ?? []
	const kpis = kpisQuery.data ?? []
	const usuarios = usuariosQuery.data ?? []

	const breadcrumbTitles: Record<string, string> = {
		admin: "Panel de Control",
		supervisor: "Panel Supervisor",
		tecnico: "Mi Panel",
		contratista: "Portal Contratista",
	}

	const breadcrumbTitle = breadcrumbTitles[role] || "Panel de Control"

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="min-w-0">
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
									<BreadcrumbPage>{breadcrumbTitle}</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>

				{isLoading ? (
					<PageLoading
						message="Cargando dashboard..."
						className="min-h-[calc(100vh-4rem)]"
					/>
				) : error ? (
					<PageError
						message="No se pudo cargar el dashboard"
						description={error}
						onRetry={refetchAll}
						className="min-h-[calc(100vh-4rem)]"
					/>
				) : (
					<>
						{role === "admin" && (
							<AdminContent
								alertasEquipos={alertasEquipos}
								enviosFormularios={enviosFormularios}
								equipos={equipos}
								formulariosTemplate={formulariosTemplate}
								kpis={kpis}
								ordenesTrabajo={ordenesTrabajo}
								registrosMantenimiento={registrosMantenimiento}
								usuarios={usuarios}
							/>
						)}
						{role === "supervisor" && (
							<SupervisorView
								alertasEquipos={alertasEquipos}
								equipos={equipos}
								kpis={kpis}
								ordenesTrabajo={ordenesTrabajo}
								registrosMantenimiento={registrosMantenimiento}
								usuarios={usuarios}
							/>
						)}
						{role === "tecnico" && (
							<TecnicoView
								equipos={equipos}
								formulariosTemplate={formulariosTemplate}
								ordenesTrabajo={ordenesTrabajo}
								registrosMantenimiento={registrosMantenimiento}
							/>
						)}
						{role === "contratista" && (
							<ContratistaView
								equipos={equipos}
								ordenesTrabajo={ordenesTrabajo}
							/>
						)}
					</>
				)}
			</SidebarInset>
		</SidebarProvider>
	)
}
