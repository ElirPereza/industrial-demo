"use client"

import {
	ArrowRight,
	ClipboardText,
	Clock,
	Play,
	QrCode,
	Sun,
	WarningCircle,
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
	equipos,
	formulariosTemplate,
	ordenesTrabajo,
	registrosMantenimiento,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const TECNICO_NOMBRE = "María García"

export default function TecnicoDashboardPage() {
	// OTs assigned to this technician
	const misOrdenes = ordenesTrabajo.filter(
		(ot) => ot.tecnicoAsignado === TECNICO_NOMBRE,
	)
	const otsPendientes = misOrdenes.filter(
		(ot) =>
			ot.estado === "en-progreso" ||
			ot.estado === "asignada" ||
			ot.estado === "creada",
	)

	// Daily forms
	const formulariosDiarios = formulariosTemplate.filter(
		(f) => f.activo && f.frecuencia === "diario",
	)

	// Recent activity for this technician
	const actividadReciente = registrosMantenimiento
		.filter((r) => r.tecnico === TECNICO_NOMBRE)
		.sort((a, b) => b.fechaInicio.getTime() - a.fechaInicio.getTime())
		.slice(0, 5)

	const actionCards = [
		{
			title: "Mis Órdenes",
			href: "/ordenes-trabajo",
			icon: <ClipboardText className="size-6" weight="duotone" />,
			count: otsPendientes.length,
			color: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
			iconColor: "text-blue-600 dark:text-blue-400",
		},
		{
			title: "Escanear QR",
			href: "/qr-codes",
			icon: <QrCode className="size-6" weight="duotone" />,
			color:
				"bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
			iconColor: "text-violet-600 dark:text-violet-400",
		},
		{
			title: "Reportar Falla",
			href: "/formularios/llenar/form-002",
			icon: <WarningCircle className="size-6" weight="duotone" />,
			color:
				"bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
			iconColor: "text-orange-600 dark:text-orange-400",
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
									<BreadcrumbPage>Mi Panel</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>

				<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
					{/* Welcome Header */}
					<div>
						<div className="flex items-center gap-2">
							<Sun className="size-6 text-amber-500" weight="duotone" />
							<h2 className="text-2xl font-semibold tracking-tight">
								Buenos días, {TECNICO_NOMBRE.split(" ")[0]}
							</h2>
						</div>
						<p className="mt-1 text-sm text-muted-foreground">
							Tienes {otsPendientes.length} tareas pendientes hoy
						</p>
					</div>

					{/* Action Cards */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
						{actionCards.map((card) => (
							<a
								key={card.title}
								href={card.href}
								className={cn(
									"group relative flex items-center gap-4 rounded-xl p-4 transition-all hover:scale-[1.02] hover:shadow-md",
									card.color,
								)}
							>
								<div className={cn("shrink-0", card.iconColor)}>
									{card.icon}
								</div>
								<div className="flex-1">
									<p className="text-sm font-semibold">{card.title}</p>
								</div>
								{card.count !== undefined && (
									<span className="flex size-7 items-center justify-center rounded-full bg-white/80 text-sm font-bold text-gray-900 dark:bg-white/20 dark:text-white">
										{card.count}
									</span>
								)}
								<ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
							</a>
						))}
					</div>

					{/* Main Content: OTs + Side Panel */}
					<div className="grid gap-6 lg:grid-cols-3">
						{/* Left 2/3: My Work Orders */}
						<Card className="lg:col-span-2">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<ClipboardText
										className="size-5 text-blue-600"
										weight="duotone"
									/>
									Mis Órdenes de Trabajo
								</CardTitle>
								<CardDescription>
									{otsPendientes.length} órdenes activas asignadas
								</CardDescription>
							</CardHeader>
							<CardContent className="p-0">
								<div className="divide-y">
									{misOrdenes
										.filter(
											(ot) =>
												ot.estado !== "verificada" && ot.estado !== "cancelada",
										)
										.sort((a, b) => {
											const prioridadOrden = {
												critica: 0,
												alta: 1,
												media: 2,
												baja: 3,
											}
											return (
												prioridadOrden[a.prioridad] -
												prioridadOrden[b.prioridad]
											)
										})
										.map((ot) => {
											const equipo = equipos.find((e) => e.id === ot.idEquipo)
											const checklistCompletados = ot.checklist.filter(
												(c) => c.completado,
											).length
											const checklistTotal = ot.checklist.length
											return (
												<div
													key={ot.id}
													className={cn(
														"flex items-start gap-4 border-l-4 px-6 py-4",
														ot.prioridad === "critica" && "border-l-red-500",
														ot.prioridad === "alta" && "border-l-orange-500",
														ot.prioridad === "media" && "border-l-yellow-500",
														ot.prioridad === "baja" && "border-l-blue-500",
													)}
												>
													<div className="min-w-0 flex-1">
														<div className="flex items-start justify-between gap-2">
															<p className="text-sm font-medium">{ot.titulo}</p>
															<span
																className={cn(
																	"shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
																	ot.estado === "en-progreso" &&
																		"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
																	ot.estado === "asignada" &&
																		"bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
																	ot.estado === "creada" &&
																		"bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
																	ot.estado === "completada" &&
																		"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
																)}
															>
																{ot.estado === "en-progreso"
																	? "En Progreso"
																	: ot.estado === "asignada"
																		? "Asignada"
																		: ot.estado === "creada"
																			? "Creada"
																			: "Completada"}
															</span>
														</div>
														<p className="mt-0.5 text-xs text-muted-foreground">
															{equipo?.nombre}
														</p>
														<div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
															<span className="flex items-center gap-1">
																Checklist: {checklistCompletados}/
																{checklistTotal} completados
															</span>
															<span className="flex items-center gap-1">
																<Clock className="size-3" />
																{ot.tiempoEstimadoHoras}h estimadas
															</span>
														</div>
														{/* Checklist progress bar */}
														<div className="mt-2 h-1.5 w-full rounded-full bg-muted">
															<div
																className="h-full rounded-full bg-green-500"
																style={{
																	width: `${checklistTotal > 0 ? (checklistCompletados / checklistTotal) * 100 : 0}%`,
																}}
															/>
														</div>
													</div>
													<button
														type="button"
														className={cn(
															"mt-1 flex shrink-0 items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-white transition-colors",
															ot.estado === "en-progreso"
																? "bg-blue-600 hover:bg-blue-700"
																: "bg-green-600 hover:bg-green-700",
														)}
													>
														<Play className="size-3" weight="fill" />
														{ot.estado === "en-progreso"
															? "Continuar"
															: "Iniciar"}
													</button>
												</div>
											)
										})}
								</div>
							</CardContent>
						</Card>

						{/* Right 1/3: Side panels */}
						<div className="flex flex-col gap-6">
							{/* Pending Forms */}
							<Card>
								<CardHeader>
									<CardTitle className="text-base">
										Formularios Pendientes
									</CardTitle>
									<CardDescription>
										Formularios diarios por completar
									</CardDescription>
								</CardHeader>
								<CardContent className="p-0">
									<div className="divide-y">
										{formulariosDiarios.map((form) => (
											<div
												key={form.id}
												className="flex items-center justify-between px-6 py-3"
											>
												<p className="text-sm font-medium">{form.nombre}</p>
												<a
													href={`/formularios/llenar/${form.id}`}
													className="rounded-md bg-foreground px-3 py-1 text-xs font-medium text-background transition-opacity hover:opacity-80"
												>
													Llenar
												</a>
											</div>
										))}
										{formulariosDiarios.length === 0 && (
											<div className="px-6 py-4 text-center text-sm text-muted-foreground">
												No hay formularios pendientes
											</div>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Recent Activity */}
							<Card>
								<CardHeader>
									<CardTitle className="text-base">
										Actividad Reciente
									</CardTitle>
									<CardDescription>Últimos trabajos realizados</CardDescription>
								</CardHeader>
								<CardContent className="p-0">
									<div className="divide-y">
										{actividadReciente.map((registro) => {
											const equipo = equipos.find(
												(e) => e.id === registro.idEquipo,
											)
											return (
												<div
													key={registro.id}
													className="flex items-start gap-3 px-6 py-3"
												>
													<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
														<div
															className={cn(
																"size-2 rounded-full",
																registro.tipo === "preventivo" && "bg-blue-500",
																registro.tipo === "correctivo" &&
																	"bg-orange-500",
																registro.tipo === "inspección" &&
																	"bg-green-500",
															)}
														/>
													</div>
													<div className="min-w-0 flex-1">
														<p className="truncate text-sm font-medium">
															{registro.descripcion}
														</p>
														<p className="text-xs text-muted-foreground">
															{equipo?.nombre} &bull;{" "}
															{registro.fechaInicio.toLocaleDateString(
																"es-ES",
																{
																	day: "2-digit",
																	month: "short",
																},
															)}
														</p>
													</div>
													<span
														className={cn(
															"shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
															registro.estado === "completado" &&
																"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
															registro.estado === "en-progreso" &&
																"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
															registro.estado === "pendiente" &&
																"bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
														)}
													>
														{registro.estado === "completado"
															? "Listo"
															: registro.estado === "en-progreso"
																? "En curso"
																: "Pendiente"}
													</span>
												</div>
											)
										})}
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
