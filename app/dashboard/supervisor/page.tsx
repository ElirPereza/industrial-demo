"use client"

import {
	ArrowRight,
	CheckCircle,
	ClipboardText,
	MapPin,
	ShieldCheck,
	Users,
	WarningCircle,
	WarningDiamond,
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
	alertasEquipos,
	equipos,
	kpis,
	ordenesTrabajo,
	registrosMantenimiento,
	usuarios,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function timeAgo(date: Date): string {
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffMins = Math.floor(diffMs / 60000)
	if (diffMins < 60) return `hace ${diffMins}min`
	const diffHours = Math.floor(diffMins / 60)
	if (diffHours < 24) return `hace ${diffHours}h`
	const diffDays = Math.floor(diffHours / 24)
	return `hace ${diffDays}d`
}

export default function SupervisorDashboardPage() {
	// KPI calculations
	const otsPendientesAprobacion = ordenesTrabajo.filter(
		(ot) => ot.estado === "completada",
	)
	const alertasActivas = alertasEquipos.filter((a) => a.estado === "activa")
	const disponibilidadPlanta = kpis.find((k) => k.id === "kpi-001")
	const tecnicos = usuarios.filter((u) => u.rol === "tecnico")
	const tecnicosActivos = tecnicos.filter((t) => {
		return ordenesTrabajo.some(
			(ot) =>
				ot.tecnicoAsignado === t.nombre &&
				(ot.estado === "en-progreso" || ot.estado === "asignada"),
		)
	})

	// Technician performance data
	const rendimientoTecnicos = tecnicos.map((tecnico) => {
		const registros = registrosMantenimiento.filter(
			(r) => r.tecnico === tecnico.nombre,
		)
		const otsCompletadas = registros.filter(
			(r) => r.estado === "completado",
		).length
		const horasTrabajadas = registros.reduce(
			(sum, r) => sum + r.horasEmpleadas,
			0,
		)
		const otsActivasCount = ordenesTrabajo.filter(
			(ot) =>
				ot.tecnicoAsignado === tecnico.nombre &&
				(ot.estado === "en-progreso" || ot.estado === "asignada"),
		).length
		return {
			nombre: tecnico.nombre,
			otsCompletadas,
			horasTrabajadas,
			otsActivas: otsActivasCount,
		}
	})

	// Recent alerts sorted by date
	const alertasRecientes = [...alertasEquipos]
		.sort((a, b) => b.fechaDeteccion.getTime() - a.fechaDeteccion.getTime())
		.slice(0, 5)

	// Equipment in critical state
	const equiposCriticos = equipos.filter((e) => e.estado !== "operativo")
	const equiposConAlertaCritica = alertasEquipos
		.filter(
			(a) =>
				(a.severidad === "critica" || a.severidad === "alta") &&
				a.estado === "activa",
		)
		.map((a) => {
			const equipo = equipos.find((e) => e.id === a.idEquipo)
			return { equipo, alerta: a }
		})
		.filter((item) => item.equipo)

	// Merge critical equipment lists (no duplicates)
	const equiposCriticosIds = new Set(equiposCriticos.map((e) => e.id))
	for (const item of equiposConAlertaCritica) {
		if (item.equipo && !equiposCriticosIds.has(item.equipo.id)) {
			equiposCriticos.push(item.equipo)
			equiposCriticosIds.add(item.equipo.id)
		}
	}

	const maxCompletadas = Math.max(
		...rendimientoTecnicos.map((t) => t.otsCompletadas),
		1,
	)

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
								<BreadcrumbItem className="hidden md:block">
									<BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>Supervisor</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>

				<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
					{/* KPIs Row */}
					<div>
						<h2 className="mb-4 text-lg font-semibold">Panel de Supervisión</h2>
						<div className="grid grid-cols-1 gap-px rounded-xl bg-border sm:grid-cols-2 lg:grid-cols-4">
							{[
								{
									name: "OTs Pendientes de Aprobación",
									value: String(otsPendientesAprobacion.length),
									icon: (
										<ClipboardText
											className="size-4 text-amber-600"
											weight="duotone"
										/>
									),
									accent: "text-amber-600 dark:text-amber-400",
								},
								{
									name: "Alertas Activas",
									value: String(alertasActivas.length),
									icon: (
										<WarningCircle
											className="size-4 text-red-600"
											weight="duotone"
										/>
									),
									accent: "text-red-600 dark:text-red-400",
								},
								{
									name: "Disponibilidad de Planta",
									value: `${disponibilidadPlanta?.valor ?? 94.5}%`,
									icon: (
										<CheckCircle
											className="size-4 text-green-600"
											weight="duotone"
										/>
									),
									accent: "text-green-600 dark:text-green-400",
								},
								{
									name: "Técnicos en Campo",
									value: `${tecnicosActivos.length}/${tecnicos.length} activos`,
									icon: (
										<Users className="size-4 text-blue-600" weight="duotone" />
									),
									accent: "text-blue-600 dark:text-blue-400",
								},
							].map((stat, index) => (
								<Card
									key={stat.name}
									className={cn(
										"rounded-none border-0 shadow-none py-0",
										index === 0 && "rounded-l-xl",
										index === 3 && "rounded-r-xl",
									)}
								>
									<CardContent className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 p-4 sm:p-6">
										<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
											{stat.icon}
											{stat.name}
										</div>
										<div
											className={cn(
												"tabular-nums w-full flex-none text-3xl font-medium tracking-tight",
												stat.accent,
											)}
										>
											{stat.value}
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>

					{/* Second Row: Performance + Alerts */}
					<div className="grid gap-6 lg:grid-cols-3">
						{/* Left 2/3: Technician Performance */}
						<Card className="lg:col-span-2">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Users className="size-5 text-blue-600" weight="duotone" />
									Rendimiento del Equipo Técnico
								</CardTitle>
								<CardDescription>
									Métricas de desempeño por técnico
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="overflow-x-auto">
									<table className="w-full text-sm">
										<thead>
											<tr className="border-b text-left text-muted-foreground">
												<th className="pb-3 font-medium">Nombre</th>
												<th className="pb-3 font-medium text-center">
													OTs Completadas
												</th>
												<th className="pb-3 font-medium text-center">
													Horas Trabajadas
												</th>
												<th className="pb-3 font-medium text-center">
													OTs Activas
												</th>
												<th className="pb-3 font-medium">Rating</th>
											</tr>
										</thead>
										<tbody className="divide-y">
											{rendimientoTecnicos.map((tecnico) => (
												<tr key={tecnico.nombre}>
													<td className="py-3 font-medium">{tecnico.nombre}</td>
													<td className="py-3 text-center tabular-nums">
														{tecnico.otsCompletadas}
													</td>
													<td className="py-3 text-center tabular-nums">
														{tecnico.horasTrabajadas}h
													</td>
													<td className="py-3 text-center">
														<span
															className={cn(
																"inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium",
																tecnico.otsActivas > 0
																	? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
																	: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
															)}
														>
															{tecnico.otsActivas}
														</span>
													</td>
													<td className="py-3">
														<div className="flex items-center gap-2">
															<div className="h-2 flex-1 rounded-full bg-muted">
																<div
																	className="h-full rounded-full bg-blue-600 dark:bg-blue-500"
																	style={{
																		width: `${(tecnico.otsCompletadas / maxCompletadas) * 100}%`,
																	}}
																/>
															</div>
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</CardContent>
						</Card>

						{/* Right 1/3: Recent Alerts */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<WarningCircle
										className="size-5 text-red-600"
										weight="duotone"
									/>
									Alertas Recientes
								</CardTitle>
								<CardDescription>Últimas alertas detectadas</CardDescription>
							</CardHeader>
							<CardContent className="p-0">
								<div className="divide-y">
									{alertasRecientes.map((alerta) => {
										const equipo = equipos.find((e) => e.id === alerta.idEquipo)
										return (
											<div
												key={alerta.id}
												className="flex items-start gap-3 px-6 py-3"
											>
												<div
													className={cn(
														"mt-1 size-2.5 shrink-0 rounded-full",
														alerta.severidad === "critica" && "bg-red-500",
														alerta.severidad === "alta" && "bg-orange-500",
														alerta.severidad === "media" && "bg-yellow-500",
														alerta.severidad === "baja" && "bg-blue-500",
														alerta.severidad === "info" && "bg-gray-400",
													)}
												/>
												<div className="min-w-0 flex-1">
													<p className="truncate text-sm font-medium">
														{equipo?.nombre}
													</p>
													<p className="text-xs text-muted-foreground">
														{alerta.codigoFalla}
													</p>
												</div>
												<span className="shrink-0 text-xs text-muted-foreground">
													{timeAgo(alerta.fechaDeteccion)}
												</span>
											</div>
										)
									})}
								</div>
								<div className="border-t px-6 py-3">
									<a
										href="/alertas"
										className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
									>
										Ver todas
										<ArrowRight className="size-4" />
									</a>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Third Row: Pending Verification + Critical Equipment */}
					<div className="grid gap-6 lg:grid-cols-2">
						{/* Left: OTs Pending Verification */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<ShieldCheck
										className="size-5 text-amber-600"
										weight="duotone"
									/>
									OTs Pendientes de Verificación
								</CardTitle>
								<CardDescription>
									Órdenes completadas esperando aprobación
								</CardDescription>
							</CardHeader>
							<CardContent className="p-0">
								{otsPendientesAprobacion.length === 0 ? (
									<div className="px-6 py-8 text-center text-sm text-muted-foreground">
										No hay OTs pendientes de verificación
									</div>
								) : (
									<div className="divide-y">
										{otsPendientesAprobacion.map((ot) => {
											const equipo = equipos.find((e) => e.id === ot.idEquipo)
											return (
												<div
													key={ot.id}
													className="flex items-center gap-4 px-6 py-4"
												>
													<div className="min-w-0 flex-1">
														<p className="text-sm font-medium">{ot.titulo}</p>
														<p className="text-xs text-muted-foreground">
															{equipo?.nombre} &bull; {ot.tecnicoAsignado}{" "}
															&bull;{" "}
															{ot.fechaFinReal?.toLocaleDateString("es-ES", {
																day: "2-digit",
																month: "short",
															})}
														</p>
													</div>
													<button
														type="button"
														className="shrink-0 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-700"
													>
														Verificar
													</button>
												</div>
											)
										})}
									</div>
								)}
							</CardContent>
						</Card>

						{/* Right: Critical Equipment */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<WarningDiamond
										className="size-5 text-red-600"
										weight="duotone"
									/>
									Equipos en Estado Crítico
								</CardTitle>
								<CardDescription>
									Equipos fuera de servicio o con alertas activas
								</CardDescription>
							</CardHeader>
							<CardContent className="p-0">
								<div className="divide-y">
									{equiposCriticos.map((equipo) => {
										const alertaActiva = alertasEquipos.find(
											(a) =>
												a.idEquipo === equipo.id &&
												a.estado === "activa" &&
												(a.severidad === "critica" || a.severidad === "alta"),
										)
										return (
											<div
												key={equipo.id}
												className="flex items-center gap-4 px-6 py-4"
											>
												<div className="min-w-0 flex-1">
													<p className="text-sm font-medium">{equipo.nombre}</p>
													<div className="flex items-center gap-2 text-xs text-muted-foreground">
														<MapPin className="size-3" />
														{equipo.ubicacion}
													</div>
													{alertaActiva && (
														<p className="mt-1 text-xs text-red-600 dark:text-red-400">
															{alertaActiva.codigoFalla}:{" "}
															{alertaActiva.descripcionFalla}
														</p>
													)}
												</div>
												<span
													className={cn(
														"shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
														equipo.estado === "mantenimiento" &&
															"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
														equipo.estado === "fuera-servicio" &&
															"bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
														equipo.estado === "operativo" &&
															"bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
													)}
												>
													{equipo.estado === "mantenimiento"
														? "Mantenimiento"
														: equipo.estado === "fuera-servicio"
															? "Fuera de Servicio"
															: "Con Alerta"}
												</span>
											</div>
										)
									})}
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
