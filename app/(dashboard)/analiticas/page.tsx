"use client"

import {
	ArrowDown,
	ArrowUp,
	Clock,
	TrendUp,
	Users,
	Wrench,
} from "@phosphor-icons/react"
import { useCallback, useEffect, useState } from "react"
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
	SidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import {
	getDashboardKPIs,
	getFormulariosPorMes,
	getTendenciaFallas,
	getEquiposMasIntervenidos,
	getTiposMantenimiento,
	getTecnicosActivos,
} from "@/app/(dashboard)/analiticas/actions"

const TIPO_COLORS: Record<string, string> = {
	preventivo: "#3b82f6",
	correctivo: "#f97316",
	inspeccion: "#22c55e",
	emergencia: "#ef4444",
}

type KPIData = {
	disponibilidad: number
	mttr: number
	costoTotal: number
	mantenimientosActivos: number
	equiposEnMantenimiento: number
	eficienciaInspeccion: number
}

export default function AnaliticasPage() {
	const [loading, setLoading] = useState(true)
	const [kpiData, setKpiData] = useState<KPIData | null>(null)
	const [formPorMes, setFormPorMes] = useState<Array<{ mes: string; completados: number; pendientes: number }>>([])
	const [tendencia, setTendencia] = useState<Array<{ semana: string; fallas: number }>>([])
	const [equiposTop, setEquiposTop] = useState<Array<{ equipo: string; intervenciones: number }>>([])
	const [tiposMant, setTiposMant] = useState<Array<{ tipo: string; valor: number }>>([])
	const [tecnicos, setTecnicos] = useState<Array<{ nombre: string; formularios: number }>>([])

	const fetchData = useCallback(async () => {
		setLoading(true)
		const [kpiRes, formRes, tendRes, eqRes, tipoRes, tecRes] = await Promise.all([
			getDashboardKPIs(),
			getFormulariosPorMes(),
			getTendenciaFallas(),
			getEquiposMasIntervenidos(),
			getTiposMantenimiento(),
			getTecnicosActivos(),
		])

		if (kpiRes.success) setKpiData(kpiRes.data)
		if (formRes.success) setFormPorMes(formRes.data)
		if (tendRes.success) setTendencia(tendRes.data)
		if (eqRes.success) setEquiposTop(eqRes.data)
		if (tipoRes.success) setTiposMant(tipoRes.data)
		if (tecRes.success) setTecnicos(tecRes.data)
		setLoading(false)
	}, [])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	const maxFormularios = tecnicos.length > 0 ? Math.max(...tecnicos.map((t) => t.formularios)) : 1

	const kpis = kpiData
		? [
			{
				titulo: "Disponibilidad",
				valor: `${kpiData.disponibilidad}%`,
				cambio: `${kpiData.equiposEnMantenimiento} en mant.`,
				tipo: kpiData.disponibilidad >= 80 ? "positivo" : "negativo",
				icon: TrendUp,
			},
			{
				titulo: "MTTR Promedio",
				valor: `${kpiData.mttr}h`,
				cambio: `${kpiData.mantenimientosActivos} activos`,
				tipo: kpiData.mttr <= 4 ? "positivo" : "negativo",
				icon: Clock,
			},
			{
				titulo: "Efic. Inspección",
				valor: `${kpiData.eficienciaInspeccion}%`,
				cambio: "",
				tipo: kpiData.eficienciaInspeccion >= 70 ? "positivo" : "negativo",
				icon: Users,
			},
			{
				titulo: "Costo Total",
				valor: `$${kpiData.costoTotal.toLocaleString()}`,
				cambio: "",
				tipo: "positivo" as const,
				icon: Wrench,
			},
		]
		: []

	return (
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

					{loading && (
						<div className="flex items-center justify-center py-12">
							<p className="text-muted-foreground">Cargando analíticas...</p>
						</div>
					)}

					{!loading && (
						<>
							{/* KPIs */}
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
								{kpis.map((kpi) => (
									<Card key={kpi.titulo}>
										<CardContent className="p-4">
											<div className="flex items-center justify-between">
												<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
													<kpi.icon
														className="size-5 text-primary"
														weight="duotone"
													/>
												</div>
												{kpi.cambio && (
													<span
														className={cn(
															"flex items-center gap-1 text-xs font-medium",
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
												)}
											</div>
											<div className="mt-3">
												<p className="text-2xl font-semibold">{kpi.valor}</p>
												<p className="text-xs text-muted-foreground">{kpi.titulo}</p>
											</div>
										</CardContent>
									</Card>
								))}
							</div>

							{/* Charts Row 1 */}
							<div className="grid gap-6 lg:grid-cols-2">
								{/* Formularios por Mes */}
								<Card>
									<CardHeader>
										<CardTitle>Formularios por Mes</CardTitle>
										<CardDescription>
											Completados vs pendientes en los últimos 6 meses
										</CardDescription>
									</CardHeader>
									<CardContent>
										<ResponsiveContainer width="100%" height={250}>
											<BarChart data={formPorMes}>
												<CartesianGrid strokeDasharray="3 3" vertical={false} />
												<XAxis dataKey="mes" fontSize={12} />
												<YAxis fontSize={12} />
												<Tooltip />
												<Bar
													dataKey="completados"
													fill="#3b82f6"
													radius={[4, 4, 0, 0]}
													name="Completados"
												/>
												<Bar
													dataKey="pendientes"
													fill="#f97316"
													radius={[4, 4, 0, 0]}
													name="Pendientes"
												/>
											</BarChart>
										</ResponsiveContainer>
									</CardContent>
								</Card>

								{/* Tendencia de Fallas */}
								<Card>
									<CardHeader>
										<CardTitle>Tendencia de Fallas</CardTitle>
										<CardDescription>
											Número de fallas reportadas por semana
										</CardDescription>
									</CardHeader>
									<CardContent>
										<ResponsiveContainer width="100%" height={250}>
											<LineChart data={tendencia}>
												<CartesianGrid strokeDasharray="3 3" vertical={false} />
												<XAxis dataKey="semana" fontSize={12} />
												<YAxis fontSize={12} />
												<Tooltip />
												<Line
													type="monotone"
													dataKey="fallas"
													stroke="#ef4444"
													strokeWidth={2}
													dot={{ fill: "#ef4444", strokeWidth: 2 }}
													name="Fallas"
												/>
											</LineChart>
										</ResponsiveContainer>
									</CardContent>
								</Card>
							</div>

							{/* Charts Row 2 */}
							<div className="grid gap-6 lg:grid-cols-3">
								{/* Equipos Más Intervenidos */}
								<Card className="lg:col-span-2">
									<CardHeader>
										<CardTitle>Equipos Más Intervenidos</CardTitle>
										<CardDescription>
											Top 5 equipos con mayor número de intervenciones
										</CardDescription>
									</CardHeader>
									<CardContent>
										<ResponsiveContainer width="100%" height={250}>
											<BarChart
												data={equiposTop}
												layout="vertical"
												margin={{ left: 20 }}
											>
												<CartesianGrid
													strokeDasharray="3 3"
													horizontal={false}
												/>
												<XAxis type="number" fontSize={12} />
												<YAxis
													type="category"
													dataKey="equipo"
													fontSize={12}
													width={100}
												/>
												<Tooltip />
												<Bar
													dataKey="intervenciones"
													fill="#8b5cf6"
													radius={[0, 4, 4, 0]}
													name="Intervenciones"
												/>
											</BarChart>
										</ResponsiveContainer>
									</CardContent>
								</Card>

								{/* Tipos de Mantenimiento */}
								<Card>
									<CardHeader>
										<CardTitle>Tipos de Mantenimiento</CardTitle>
										<CardDescription>Distribución porcentual</CardDescription>
									</CardHeader>
									<CardContent>
										<ResponsiveContainer width="100%" height={200}>
											<PieChart>
												<Pie
													data={tiposMant}
													dataKey="valor"
													nameKey="tipo"
													cx="50%"
													cy="50%"
													innerRadius={50}
													outerRadius={80}
													paddingAngle={2}
												>
													{tiposMant.map((entry) => (
														<Cell
															key={entry.tipo}
															fill={TIPO_COLORS[entry.tipo] ?? "#94a3b8"}
														/>
													))}
												</Pie>
												<Tooltip />
											</PieChart>
										</ResponsiveContainer>
										<div className="mt-4 flex justify-center gap-4">
											{tiposMant.map((item) => (
												<div key={item.tipo} className="flex items-center gap-2">
													<div
														className="size-3 rounded-full"
														style={{ backgroundColor: TIPO_COLORS[item.tipo] ?? "#94a3b8" }}
													/>
													<span className="text-xs capitalize">{item.tipo}</span>
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							</div>

							{/* Técnicos Más Activos */}
							<Card>
								<CardHeader>
									<CardTitle>Técnicos Más Activos</CardTitle>
									<CardDescription>
										Ranking de técnicos por formularios completados este mes
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{tecnicos.map((tecnico, index) => (
											<div
												key={tecnico.nombre}
												className="flex items-center gap-4"
											>
												<div
													className={cn(
														"flex size-8 items-center justify-center rounded-full text-sm font-medium",
														index === 0
															? "bg-yellow-100 text-yellow-700"
															: index === 1
																? "bg-gray-100 text-gray-700"
																: index === 2
																	? "bg-orange-100 text-orange-700"
																	: "bg-muted text-muted-foreground",
													)}
												>
													{index + 1}
												</div>
												<div className="flex-1">
													<p className="text-sm font-medium">{tecnico.nombre}</p>
													<div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
														<div
															className="h-full rounded-full bg-primary"
															style={{
																width: `${(tecnico.formularios / maxFormularios) * 100}%`,
															}}
														/>
													</div>
												</div>
												<span className="text-sm font-medium">
													{tecnico.formularios}
												</span>
											</div>
										))}
										{tecnicos.length === 0 && (
											<p className="text-center text-sm text-muted-foreground">
												No hay datos de técnicos disponibles
											</p>
										)}
									</div>
								</CardContent>
							</Card>
						</>
					)}
				</div>
			</SidebarInset>
	)
}
