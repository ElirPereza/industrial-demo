"use client"

import { ClockCounterClockwise, WarningCircle } from "@phosphor-icons/react"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import {
	getDashboardKPIs,
	getRecentActivity,
} from "@/app/(dashboard)/analiticas/actions"
import { getEquipos } from "@/app/(dashboard)/equipos/actions"
import type { Equipo } from "@/app/(dashboard)/equipos/actions"
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

type KPIData = {
	disponibilidad: number
	mttr: number
	costoTotal: number
	mantenimientosActivos: number
	equiposEnMantenimiento: number
	eficienciaInspeccion: number
}

type RecentActivity = {
	id: string
	tipo: string
	descripcion: string
	estado: string
	fecha_inicio: string
	equipo_nombre: string
	tecnico_nombre: string
}

export default function DashboardPage() {
	const [kpis, setKpis] = useState<KPIData | null>(null)
	const [equiposCriticos, setEquiposCriticos] = useState<Equipo[]>([])
	const [actividadReciente, setActividadReciente] = useState<RecentActivity[]>(
		[],
	)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function loadData() {
			const [kpiResult, equiposResult, activityResult] = await Promise.all([
				getDashboardKPIs(),
				getEquipos(),
				getRecentActivity(),
			])
			if (kpiResult.success) setKpis(kpiResult.data)
			if (equiposResult.success) {
				setEquiposCriticos(
					equiposResult.data
						.filter((e) => e.estado !== "operativo")
						.slice(0, 5),
				)
			}
			if (activityResult.success)
				setActividadReciente(activityResult.data)
			setLoading(false)
		}
		loadData()
	}, [])

	type ChangeType = "positive" | "negative" | "neutral"

	const kpiData: Array<{
		name: string
		value: string
		change: string
		changeType: ChangeType
	}> = kpis
		? [
				{
					name: "Disponibilidad",
					value: `${kpis.disponibilidad}%`,
					change: "—",
					changeType: "neutral",
				},
				{
					name: "MTTR",
					value: `${kpis.mttr}h`,
					change: "—",
					changeType: "neutral",
				},
				{
					name: "Costo Total",
					value: `$${kpis.costoTotal.toLocaleString()}`,
					change: "—",
					changeType: "neutral",
				},
				{
					name: "Mtto. Activos",
					value: `${kpis.mantenimientosActivos}`,
					change: "—",
					changeType: "neutral",
				},
			]
		: []

	if (loading) {
		return (
			<SidebarInset>
				<div className="flex h-full items-center justify-center p-8">
					<p className="animate-pulse text-sm text-muted-foreground">
						Cargando dashboard...
					</p>
				</div>
			</SidebarInset>
		)
	}

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
								<BreadcrumbPage>Dashboard</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>

			<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
				{/* KPIs Section */}
				<div>
					<h2 className="mb-4 text-lg font-semibold">Indicadores Clave</h2>
					<div className="grid grid-cols-1 gap-px rounded-xl bg-border sm:grid-cols-2 lg:grid-cols-4">
						{kpiData.map((stat, index) => (
							<Card
								key={stat.name}
								className={cn(
									"rounded-none border-0 py-0 shadow-none",
									index === 0 && "rounded-l-xl",
									index === kpiData.length - 1 && "rounded-r-xl",
								)}
							>
								<CardContent className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 p-4 sm:p-6">
									<div className="text-sm font-medium text-muted-foreground">
										{stat.name}
									</div>
									<div
										className={cn(
											"text-xs font-medium tabular-nums",
											stat.changeType === "positive"
												? "text-green-800 dark:text-green-400"
												: stat.changeType === "negative"
													? "text-red-800 dark:text-red-400"
													: "text-muted-foreground",
										)}
									>
										{stat.change}
									</div>
									<div className="w-full flex-none text-3xl font-medium tracking-tight text-foreground tabular-nums">
										{stat.value}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>

				{/* Equipos Críticos Section */}
				<div>
					<div className="mb-4 flex items-center gap-2">
						<WarningCircle
							className="size-5 text-orange-600"
							weight="duotone"
						/>
						<h2 className="text-lg font-semibold">Equipos Críticos</h2>
					</div>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{equiposCriticos.map((equipo) => (
							<Card key={equipo.id}>
								<CardHeader>
									<CardTitle>{equipo.nombre}</CardTitle>
									<CardDescription>{equipo.ubicacion}</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex items-center justify-between">
										<span className="text-xs text-muted-foreground">
											Estado:
										</span>
										<span
											className={cn(
												"rounded-full px-2 py-0.5 text-xs font-medium",
												equipo.estado === "mantenimiento" &&
													"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
												equipo.estado === "fuera_servicio" &&
													"bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
											)}
										>
											{equipo.estado === "mantenimiento"
												? "Mantenimiento"
												: "Fuera de Servicio"}
										</span>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>

				{/* Actividad Reciente Section */}
				<div>
					<div className="mb-4 flex items-center gap-2">
						<ClockCounterClockwise
							className="size-5 text-blue-600"
							weight="duotone"
						/>
						<h2 className="text-lg font-semibold">Actividad Reciente</h2>
					</div>
					<Card>
						<CardContent className="p-0">
							<div className="divide-y">
								{actividadReciente.map((registro) => (
									<div
										key={registro.id}
										className="flex items-start gap-4 p-4"
									>
										<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
											<div
												className={cn(
													"size-2 rounded-full",
													registro.tipo === "preventivo" && "bg-blue-500",
													registro.tipo === "correctivo" && "bg-orange-500",
													registro.tipo === "inspeccion" && "bg-green-500",
												)}
											/>
										</div>
										<div className="flex-1 space-y-1">
											<p className="text-sm font-medium">
												{registro.descripcion}
											</p>
											<p className="text-xs text-muted-foreground">
												{registro.equipo_nombre} • {registro.tecnico_nombre}
											</p>
											<p className="text-xs text-muted-foreground">
												{format(
													new Date(registro.fecha_inicio),
													"dd/MM/yyyy HH:mm",
												)}
											</p>
										</div>
										<span
											className={cn(
												"rounded-full px-2 py-0.5 text-xs font-medium",
												registro.estado === "completado" &&
													"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
												registro.estado === "en_progreso" &&
													"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
												registro.estado === "pendiente" &&
													"bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
											)}
										>
											{registro.estado === "completado"
												? "Completado"
												: registro.estado === "en_progreso"
													? "En Progreso"
													: "Pendiente"}
										</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</SidebarInset>
	)
}
