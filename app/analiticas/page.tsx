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
import { cn } from "@/lib/utils"

// Mock data for charts
const formulariosporMes = [
	{ mes: "Ene", completados: 45, pendientes: 12 },
	{ mes: "Feb", completados: 52, pendientes: 8 },
	{ mes: "Mar", completados: 61, pendientes: 15 },
	{ mes: "Abr", completados: 48, pendientes: 10 },
	{ mes: "May", completados: 72, pendientes: 5 },
	{ mes: "Jun", completados: 68, pendientes: 9 },
]

const tendenciaFallas = [
	{ semana: "Sem 1", fallas: 8 },
	{ semana: "Sem 2", fallas: 12 },
	{ semana: "Sem 3", fallas: 6 },
	{ semana: "Sem 4", fallas: 9 },
	{ semana: "Sem 5", fallas: 4 },
	{ semana: "Sem 6", fallas: 7 },
	{ semana: "Sem 7", fallas: 3 },
	{ semana: "Sem 8", fallas: 5 },
]

const equiposMasIntervenidos = [
	{ equipo: "Compresor A-01", intervenciones: 18 },
	{ equipo: "Bomba B-03", intervenciones: 15 },
	{ equipo: "Motor M-02", intervenciones: 12 },
	{ equipo: "Generador G-01", intervenciones: 10 },
	{ equipo: "Caldera C-01", intervenciones: 8 },
]

const tecnicosMasActivos = [
	{ nombre: "Carlos Méndez", formularios: 45 },
	{ nombre: "Ana García", formularios: 38 },
	{ nombre: "Luis Rodríguez", formularios: 32 },
	{ nombre: "María López", formularios: 28 },
	{ nombre: "Pedro Sánchez", formularios: 22 },
]

const tiposMantenimiento = [
	{ tipo: "Preventivo", valor: 45, color: "#3b82f6" },
	{ tipo: "Correctivo", valor: 30, color: "#f97316" },
	{ tipo: "Inspección", valor: 25, color: "#22c55e" },
]

const kpis = [
	{
		titulo: "Formularios Este Mes",
		valor: "156",
		cambio: "+12%",
		tipo: "positivo",
		icon: TrendUp,
	},
	{
		titulo: "Tiempo Promedio",
		valor: "24 min",
		cambio: "-8%",
		tipo: "positivo",
		icon: Clock,
	},
	{
		titulo: "Técnicos Activos",
		valor: "12",
		cambio: "+2",
		tipo: "positivo",
		icon: Users,
	},
	{
		titulo: "Equipos Críticos",
		valor: "3",
		cambio: "-1",
		tipo: "positivo",
		icon: Wrench,
	},
]

export default function AnaliticasPage() {
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
									<BarChart data={formulariosporMes}>
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
									<LineChart data={tendenciaFallas}>
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
										data={equiposMasIntervenidos}
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
											data={tiposMantenimiento}
											dataKey="valor"
											nameKey="tipo"
											cx="50%"
											cy="50%"
											innerRadius={50}
											outerRadius={80}
											paddingAngle={2}
										>
											{tiposMantenimiento.map((entry) => (
												<Cell key={entry.tipo} fill={entry.color} />
											))}
										</Pie>
										<Tooltip />
									</PieChart>
								</ResponsiveContainer>
								<div className="mt-4 flex justify-center gap-4">
									{tiposMantenimiento.map((item) => (
										<div key={item.tipo} className="flex items-center gap-2">
											<div
												className="size-3 rounded-full"
												style={{ backgroundColor: item.color }}
											/>
											<span className="text-xs">{item.tipo}</span>
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
								{tecnicosMasActivos.map((tecnico, index) => (
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
														width: `${(tecnico.formularios / 45) * 100}%`,
													}}
												/>
											</div>
										</div>
										<span className="text-sm font-medium">
											{tecnico.formularios}
										</span>
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
