"use client"

import {
	ArrowDown,
	ArrowUp,
	Clock,
	TrendUp,
	Users,
	Wrench,
} from "@phosphor-icons/react"
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts"
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
	mapEquipoRow,
	mapMantenimientoRow,
	mapOrdenRow,
} from "@/lib/data-mappers"
import { useSupabaseQuery } from "@/lib/hooks/use-supabase-query"
import type { AlertaEquipo,
	Equipo,
	OrdenTrabajo,
	RegistroMantenimiento, } from "@/lib/types"
import type { Tables } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

const CustomTooltip = ({
	active,
	payload,
	label,
}: {
	active?: boolean
	payload?: { color: string; name: string; value: number }[]
	label?: string
}) => {
	if (!active || !payload || !payload.length) {
		return null
	}

	const labelDate = label?.split(" ")[0] || label

	return (
		<div className="overflow-hidden rounded-lg border bg-background p-3 shadow-lg">
			<p className="text-sm font-semibold mb-2">{labelDate}</p>
			{payload.map((entry) => (
				<div
					key={entry.name}
					className="flex items-center justify-between gap-4 text-sm"
				>
					<div className="flex items-center gap-2">
						<div
							className="size-2.5 rounded-full"
							style={{ backgroundColor: entry.color }}
						/>
						<span className="text-muted-foreground">{entry.name}</span>
					</div>
					<span className="font-semibold">{entry.value}</span>
				</div>
			))}
		</div>
	)
}

const CustomLegend = ({
	data,
}: {
	data: { color: string; name: string }[]
}) => {
	return (
		<div className="flex flex-wrap items-center justify-center gap-3">
			{data.map((item) => (
				<div key={item.name} className="flex items-center gap-2">
					<div
						className="size-2.5 rounded-full"
						style={{ backgroundColor: item.color }}
					/>
					<span className="text-xs text-muted-foreground">{item.name}</span>
				</div>
			))}
		</div>
	)
}

const BAR_GRADIENT = "url(#barGradient)"
const MONTHS = [
	"Ene",
	"Feb",
	"Mar",
	"Abr",
	"May",
	"Jun",
	"Jul",
	"Ago",
	"Sep",
	"Oct",
	"Nov",
	"Dic",
]

export default function AnaliticasPage() {
	const {
		data: alertasData,
		isLoading: isLoadingAlertas,
		error: errorAlertas,
		refetch: refetchAlertas,
	} = useSupabaseQuery("alertas_equipos", (row) =>
		mapAlertaRow(row as unknown as Tables<"alertas_equipos">),
	)

	const {
		data: registrosData,
		isLoading: isLoadingRegistros,
		error: errorRegistros,
		refetch: refetchRegistros,
	} = useSupabaseQuery("registros_mantenimiento", (row) =>
		mapMantenimientoRow(row as unknown as Tables<"registros_mantenimiento">),
	)

	const {
		data: equiposData,
		isLoading: isLoadingEquipos,
		error: errorEquipos,
		refetch: refetchEquipos,
	} = useSupabaseQuery("equipos", (row) =>
		mapEquipoRow(row as unknown as Tables<"equipos">),
	)

	const {
		data: ordenesData,
		isLoading: isLoadingOrdenes,
		error: errorOrdenes,
		refetch: refetchOrdenes,
	} = useSupabaseQuery("ordenes_trabajo", (row) =>
		mapOrdenRow(row as unknown as Tables<"ordenes_trabajo">),
	)

	const isLoading =
		isLoadingAlertas ||
		isLoadingRegistros ||
		isLoadingEquipos ||
		isLoadingOrdenes
	const error = errorAlertas ?? errorRegistros ?? errorEquipos ?? errorOrdenes

	if (isLoading) return <PageLoading message="Cargando analíticas..." />
	if (error) {
		return (
			<PageError
				message="Error al cargar analíticas"
				description={error}
				onRetry={() => {
					refetchAlertas()
					refetchRegistros()
					refetchEquipos()
					refetchOrdenes()
				}}
			/>
		)
	}

	const alertas = alertasData ?? []
	const registros = registrosData ?? []
	const equipos = equiposData ?? []
	const ordenes = ordenesData ?? []

	const now = new Date()

	const formulariosporMes = Array.from({ length: 6 }, (_, i) => {
		const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
		const nextD = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1)
		const monthOrdenes = ordenes.filter(
			(o) => o.fechaCreacion >= d && o.fechaCreacion < nextD,
		)
		return {
			mes: MONTHS[d.getMonth()],
			completados: monthOrdenes.filter((o) => o.estado === "completada").length,
			pendientes: monthOrdenes.filter((o) => o.estado !== "completada").length,
		}
	})

	const tendenciaFallas = Array.from({ length: 8 }, (_, i) => {
		const weekEnd = new Date(now.getTime() - (7 - i) * 7 * 24 * 60 * 60 * 1000)
		const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000)
		return {
			semana: `Sem ${i + 1}`,
			fallas: alertas.filter(
				(a) => a.fechaDeteccion >= weekStart && a.fechaDeteccion < weekEnd,
			).length,
		}
	})

	const equipoConteo = new Map<string, number>()
	for (const reg of registros) {
		equipoConteo.set(reg.idEquipo, (equipoConteo.get(reg.idEquipo) ?? 0) + 1)
	}
	const equiposMasIntervenidos = [...equipoConteo.entries()]
		.map(([idEquipo, intervenciones]) => ({
			equipo: equipos.find((e) => e.id === idEquipo)?.nombre ?? idEquipo,
			intervenciones,
		}))
		.sort((a, b) => b.intervenciones - a.intervenciones)
		.slice(0, 5)

	const preventivo = registros.filter((r) => r.tipo === "preventivo").length
	const correctivo = registros.filter((r) => r.tipo === "correctivo").length
	const inspeccion = registros.filter((r) => r.tipo === "inspección").length
	const totalReg = preventivo + correctivo + inspeccion || 1
	const tiposMantenimiento = [
		{
			name: "Preventivo",
			valor: Math.round((preventivo * 100) / totalReg),
			color: "var(--color-chart-1)",
		},
		{
			name: "Correctivo",
			valor: Math.round((correctivo * 100) / totalReg),
			color: "var(--color-chart-3)",
		},
		{
			name: "Inspección",
			valor: Math.round((inspeccion * 100) / totalReg),
			color: "var(--color-chart-2)",
		},
	]

	const tecnicoConteo = new Map<string, number>()
	for (const reg of registros) {
		tecnicoConteo.set(reg.tecnico, (tecnicoConteo.get(reg.tecnico) ?? 0) + 1)
	}
	const tecnicosMasActivos = [...tecnicoConteo.entries()]
		.map(([nombre, formularios]) => ({ nombre, formularios }))
		.sort((a, b) => b.formularios - a.formularios)
		.slice(0, 5)
	const maxFormularios =
		tecnicosMasActivos.length > 0
			? Math.max(...tecnicosMasActivos.map((t) => t.formularios))
			: 1

	const thisMonth = now.getMonth()
	const thisYear = now.getFullYear()
	const formulariosEsteMes = ordenes.filter(
		(o) =>
			o.fechaCreacion.getMonth() === thisMonth &&
			o.fechaCreacion.getFullYear() === thisYear,
	).length
	const tiempoPromedioMin =
		registros.length > 0
			? Math.round(
					(registros.reduce((s, r) => s + r.horasEmpleadas, 0) /
						registros.length) *
						60,
				)
			: 0
	const tecnicosActivos = new Set(registros.map((r) => r.tecnico)).size
	const equiposCriticos = equipos.filter((e) => e.estado !== "operativo").length

	const kpis = [
		{
			titulo: "Formularios Este Mes",
			valor: String(formulariosEsteMes),
			cambio: "+",
			tipo: "positivo",
			icon: TrendUp,
		},
		{
			titulo: "Tiempo Promedio",
			valor: `${tiempoPromedioMin} min`,
			cambio: "-",
			tipo: "positivo",
			icon: Clock,
		},
		{
			titulo: "Técnicos Activos",
			valor: String(tecnicosActivos),
			cambio: "+",
			tipo: "positivo",
			icon: Users,
		},
		{
			titulo: "Equipos Críticos",
			valor: String(equiposCriticos),
			cambio: equiposCriticos > 0 ? "-" : "+",
			tipo: equiposCriticos > 0 ? "negativo" : "positivo",
			icon: Wrench,
		},
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
							className="mr-2 data-vertical:h-4"
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
									<BreadcrumbPage>Analíticas</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>

				<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
					<div>
						<h1 className="text-2xl font-semibold">Analíticas y Reportes</h1>
						<p className="text-sm text-muted-foreground">
							Visualiza tendencias, métricas y estadísticas del sistema
						</p>
					</div>

					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{kpis.map((kpi) => (
							<Card key={kpi.titulo} className="overflow-hidden">
								<CardContent className="p-5">
									<div className="flex items-center justify-between">
										<div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
											<kpi.icon
												className="size-6 text-primary"
												weight="duotone"
											/>
										</div>
										<span
											className={cn(
												"flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium",
												kpi.tipo === "positivo"
													? "text-green-600"
													: "text-red-600",
											)}
										>
											{kpi.tipo === "positivo" ? (
												<ArrowUp className="size-3" weight="bold" />
											) : (
												<ArrowDown className="size-3" weight="bold" />
											)}
											{kpi.cambio}
										</span>
									</div>
									<div className="mt-4">
										<p className="text-3xl font-semibold tracking-tight">
											{kpi.valor}
										</p>
										<p className="text-xs text-muted-foreground">
											{kpi.titulo}
										</p>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					<div className="grid gap-6 lg:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Formularios por Mes</CardTitle>
								<CardDescription>
									Completados vs pendientes en los últimos 6 meses
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ResponsiveContainer width="100%" height={280}>
									<BarChart data={formulariosporMes}>
										<defs>
											<linearGradient
												id="barGradient"
												x1="0"
												y1="0"
												x2="0"
												y2="1"
											>
												<stop
													offset="5%"
													stopColor="var(--color-chart-1)"
													stopOpacity={0.8}
												/>
												<stop
													offset="95%"
													stopColor="var(--color-chart-1)"
													stopOpacity={0.2}
												/>
											</linearGradient>
											<linearGradient
												id="barGradientOrange"
												x1="0"
												y1="0"
												x2="0"
												y2="1"
											>
												<stop
													offset="5%"
													stopColor="var(--color-chart-3)"
													stopOpacity={0.8}
												/>
												<stop
													offset="95%"
													stopColor="var(--color-chart-3)"
													stopOpacity={0.2}
												/>
											</linearGradient>
										</defs>
										<CartesianGrid
											strokeDasharray="2 2"
											stroke="hsl(var(--border))"
											vertical={false}
										/>
										<XAxis
											dataKey="mes"
											fontSize={12}
											stroke="hsl(var(--muted-foreground))"
										/>
										<YAxis
											fontSize={12}
											stroke="hsl(var(--muted-foreground))"
										/>
										<Tooltip content={<CustomTooltip />} />
										<Bar
											dataKey="completados"
											fill={BAR_GRADIENT}
											radius={[6, 6, 0, 0]}
											name="Completados"
										/>
										<Bar
											dataKey="pendientes"
											fill="url(#barGradientOrange)"
											radius={[6, 6, 0, 0]}
											name="Pendientes"
										/>
									</BarChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Tendencia de Fallas</CardTitle>
								<CardDescription>
									Número de fallas reportadas por semana
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ResponsiveContainer width="100%" height={280}>
									<LineChart data={tendenciaFallas}>
										<defs>
											<linearGradient
												id="lineGradient"
												x1="0"
												y1="0"
												x2="0"
												y2="1"
											>
												<stop
													offset="0%"
													stopColor="var(--color-chart-4)"
													stopOpacity={0.3}
												/>
												<stop
													offset="100%"
													stopColor="var(--color-chart-4)"
													stopOpacity={0}
												/>
											</linearGradient>
										</defs>
										<CartesianGrid
											strokeDasharray="2 2"
											stroke="hsl(var(--border))"
											vertical={false}
										/>
										<XAxis
											dataKey="semana"
											fontSize={12}
											stroke="hsl(var(--muted-foreground))"
										/>
										<YAxis
											fontSize={12}
											stroke="hsl(var(--muted-foreground))"
										/>
										<Tooltip content={<CustomTooltip />} />
										<Line
											type="monotone"
											dataKey="fallas"
											stroke="var(--color-chart-4)"
											strokeWidth={3}
											dot={{
												fill: "var(--color-chart-4)",
												stroke: "white",
												strokeWidth: 2,
												r: 6,
											}}
											activeDot={{ r: 8, strokeWidth: 3 }}
											name="Fallas"
											animationDuration={1500}
										/>
									</LineChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>
					</div>

					<div className="grid gap-6 lg:grid-cols-3">
						<Card className="lg:col-span-2">
							<CardHeader>
								<CardTitle>Equipos Más Intervenidos</CardTitle>
								<CardDescription>
									Top 5 equipos con mayor número de intervenciones
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ResponsiveContainer width="100%" height={280}>
									<BarChart
										data={equiposMasIntervenidos}
										layout="vertical"
										margin={{ left: 60, right: 10, top: 10, bottom: 10 }}
									>
										<defs>
											<linearGradient
												id="barGradientPurple"
												x1="0"
												y1="0"
												x2="1"
												y2="0"
											>
												<stop
													offset="0%"
													stopColor="var(--color-chart-5)"
													stopOpacity={0.8}
												/>
												<stop
													offset="100%"
													stopColor="var(--color-chart-5)"
													stopOpacity={0.2}
												/>
											</linearGradient>
										</defs>
										<CartesianGrid
											strokeDasharray="2 2"
											stroke="hsl(var(--border))"
											horizontal={false}
										/>
										<XAxis
											type="number"
											fontSize={12}
											stroke="hsl(var(--muted-foreground))"
										/>
										<YAxis
											type="category"
											dataKey="equipo"
											fontSize={12}
											stroke="hsl(var(--muted-foreground))"
											width={80}
											tick={{ dx: 8 }}
										/>
										<Tooltip content={<CustomTooltip />} />
										<Bar
											dataKey="intervenciones"
											fill="url(#barGradientPurple)"
											radius={[0, 6, 6, 0]}
											name="Intervenciones"
										/>
									</BarChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Tipos de Mantenimiento</CardTitle>
								<CardDescription>Distribución porcentual</CardDescription>
							</CardHeader>
							<CardContent>
								<ResponsiveContainer width="100%" height={200}>
									<PieChart>
										<Pie
											data={tiposMantenimiento}
											dataKey="valor"
											nameKey="name"
											cx="50%"
											cy="50%"
											innerRadius={70}
											outerRadius={100}
											paddingAngle={2}
											startAngle={-90}
										>
											{tiposMantenimiento.map((entry) => (
												<Cell key={entry.name} fill={entry.color} />
											))}
										</Pie>
										<Tooltip content={<CustomTooltip />} />
									</PieChart>
								</ResponsiveContainer>
								<div className="mt-6">
									<CustomLegend data={tiposMantenimiento} />
								</div>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Técnicos Más Activos</CardTitle>
							<CardDescription>
								Ranking de técnicos por formularios completados este mes
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-5">
								{tecnicosMasActivos.map((tecnico, index) => (
									<div
										key={tecnico.nombre}
										className="group flex items-center gap-4"
									>
										<div
											className={cn(
												"flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all group-hover:scale-110",
												index === 0
													? "bg-yellow-100 text-yellow-700 shadow-lg shadow-yellow-100/50 dark:bg-yellow-900/20 dark:text-yellow-600 dark:shadow-yellow-900/30"
													: index === 1
														? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
														: index === 2
															? "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-600"
															: "bg-muted text-muted-foreground",
											)}
										>
											{index + 1}
										</div>

										<div className="flex-1 min-w-0">
											<p className="text-sm font-semibold text-foreground">
												{tecnico.nombre}
											</p>
											<div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-muted">
												<div
													className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-1000"
													style={{
														width: `${(tecnico.formularios / maxFormularios) * 100}%`,
													}}
												/>
											</div>
										</div>

										<div className="flex shrink-0 flex-col items-end">
											<p className="text-lg font-bold text-foreground">
												{tecnico.formularios}
											</p>
											<p className="text-xs text-muted-foreground">form.</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
