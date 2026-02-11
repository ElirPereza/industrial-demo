"use client"

import { ArrowLeft, CheckCircle, Clock, Wrench } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { use } from "react"
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
import { Separator } from "@/components/ui/separator"
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar"
import { equipos, registrosMantenimiento, usuarios } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export default function EquipoDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id: equipoId } = use(params)
	const router = useRouter()

	const equipo = equipos.find((e) => e.id === equipoId)
	const historial = registrosMantenimiento
		.filter((r) => r.idEquipo === equipoId)
		.sort((a, b) => b.fechaInicio.getTime() - a.fechaInicio.getTime())

	if (!equipo) {
		return (
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<div className="flex min-h-screen items-center justify-center">
						<div className="text-center">
							<h1 className="text-2xl font-semibold">Equipo no encontrado</h1>
							<Button className="mt-4" onClick={() => router.push("/equipos")}>
								Volver a Equipos
							</Button>
						</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
		)
	}

	// Calculate stats
	const totalIntervenciones = historial.length
	const ultimaFalla = historial.find((r) => r.tipo === "correctivo")
	const horasTotales = historial.reduce((sum, r) => sum + r.horasEmpleadas, 0)

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
									<BreadcrumbLink href="/equipos">Equipos</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>{equipo.nombre}</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>

				<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
					{/* Back button */}
					<Button
						variant="ghost"
						className="w-fit"
						onClick={() => router.push("/equipos")}
					>
						<ArrowLeft className="mr-2 size-4" weight="bold" />
						Volver a Equipos
					</Button>

					{/* Equipment header */}
					<div className="flex items-start justify-between">
						<div>
							<h1 className="text-3xl font-semibold">{equipo.nombre}</h1>
							<p className="mt-1 text-muted-foreground">{equipo.ubicacion}</p>
						</div>
						<span
							className={cn(
								"rounded-full px-3 py-1 text-sm font-medium",
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
					</div>

					{/* Stats cards */}
					<div className="grid gap-4 md:grid-cols-3">
						<Card>
							<CardHeader>
								<CardDescription>Total Intervenciones</CardDescription>
								<CardTitle className="text-3xl">
									{totalIntervenciones}
								</CardTitle>
							</CardHeader>
						</Card>
						<Card>
							<CardHeader>
								<CardDescription>Última Falla</CardDescription>
								<CardTitle className="text-lg">
									{ultimaFalla
										? ultimaFalla.fechaInicio.toLocaleDateString("es-ES", {
												day: "2-digit",
												month: "short",
												year: "numeric",
											})
										: "Sin fallas"}
								</CardTitle>
							</CardHeader>
						</Card>
						<Card>
							<CardHeader>
								<CardDescription>Horas de Mantenimiento</CardDescription>
								<CardTitle className="text-3xl">{horasTotales}h</CardTitle>
							</CardHeader>
						</Card>
					</div>

					{/* Timeline */}
					<div>
						<h2 className="mb-4 text-xl font-semibold">
							Historial de Mantenimiento
						</h2>
						<Card>
							<CardContent className="p-6">
								{historial.length === 0 ? (
									<p className="text-center text-muted-foreground">
										No hay registros de mantenimiento
									</p>
								) : (
									<div className="space-y-6">
										{historial.map((registro, index) => {
											const tecnico = usuarios.find(
												(u) => u.nombre === registro.tecnico,
											)
											return (
												<div key={registro.id} className="relative flex gap-4">
													{/* Timeline line */}
													{index < historial.length - 1 && (
														<div className="absolute left-5 top-12 h-full w-px bg-border" />
													)}

													{/* Icon */}
													<div
														className={cn(
															"flex size-10 shrink-0 items-center justify-center rounded-full",
															registro.tipo === "preventivo" &&
																"bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
															registro.tipo === "correctivo" &&
																"bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
															registro.tipo === "inspección" &&
																"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
														)}
													>
														{registro.estado === "completado" ? (
															<CheckCircle className="size-5" weight="fill" />
														) : registro.estado === "en-progreso" ? (
															<Wrench className="size-5" weight="duotone" />
														) : (
															<Clock className="size-5" weight="duotone" />
														)}
													</div>

													{/* Content */}
													<div className="flex-1 space-y-2 pb-6">
														<div className="flex items-start justify-between">
															<div>
																<h3 className="font-semibold capitalize">
																	{registro.tipo}
																</h3>
																<p className="text-sm text-muted-foreground">
																	{registro.fechaInicio.toLocaleDateString(
																		"es-ES",
																		{
																			day: "2-digit",
																			month: "long",
																			year: "numeric",
																		},
																	)}
																</p>
															</div>
															<span
																className={cn(
																	"rounded-full px-2 py-0.5 text-xs font-medium",
																	registro.estado === "completado" &&
																		"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
																	registro.estado === "en-progreso" &&
																		"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
																	registro.estado === "pendiente" &&
																		"bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
																)}
															>
																{registro.estado === "completado"
																	? "Completado"
																	: registro.estado === "en-progreso"
																		? "En Progreso"
																		: "Pendiente"}
															</span>
														</div>
														<p className="text-sm">{registro.descripcion}</p>
														<div className="flex gap-4 text-xs text-muted-foreground">
															<span>Técnico: {registro.tecnico}</span>
															<span>•</span>
															<span>{registro.horasEmpleadas}h empleadas</span>
															<span>•</span>
															<span>
																${registro.costo.toLocaleString("es-ES")}
															</span>
														</div>
													</div>
												</div>
											)
										})}
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
