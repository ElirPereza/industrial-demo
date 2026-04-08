"use client"

import {
	Factory,
	FunnelSimple,
	Gear,
	Lightning,
	Plus,
	Wind,
} from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
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
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

type AreaProduccion = Database["public"]["Tables"]["areas_produccion"]["Row"]
type EquipoRow = Database["public"]["Tables"]["equipos"]["Row"]
type Equipo = {
	id: string
	nombre: string
	idArea: string | null
	tipo: EquipoRow["tipo"]
	ubicacion: string
	estado: EquipoRow["estado"]
	ultimoMantenimiento: Date | null
	proximoMantenimiento: Date | null
	tieneIoT: boolean
	dispositivoIoT: EquipoRow["dispositivo_iot"]
}

const formatMaintenanceDate = (date: Date | null) => {
	if (!date) {
		return "Sin registro"
	}

	return date.toLocaleDateString("es-ES", {
		day: "2-digit",
		month: "short",
	})
}

const mapEquipo = (equipo: EquipoRow): Equipo => ({
	id: equipo.id,
	nombre: equipo.nombre,
	idArea: equipo.id_area,
	tipo: equipo.tipo,
	ubicacion: equipo.ubicacion,
	estado: equipo.estado,
	ultimoMantenimiento: equipo.ultimo_mantenimiento
		? new Date(equipo.ultimo_mantenimiento)
		: null,
	proximoMantenimiento: equipo.proximo_mantenimiento
		? new Date(equipo.proximo_mantenimiento)
		: null,
	tieneIoT: equipo.tiene_iot,
	dispositivoIoT: equipo.dispositivo_iot,
})

export default function EquiposPage() {
	const router = useRouter()
	const [areasProduccion, setAreasProduccion] = useState<AreaProduccion[]>([])
	const [equipos, setEquipos] = useState<Equipo[]>([])
	const [filtroArea, setFiltroArea] = useState<string>("todas")
	const [cargando, setCargando] = useState(true)
	const [requiereAutenticacion, setRequiereAutenticacion] = useState(false)
	const [errorCarga, setErrorCarga] = useState<string | null>(null)

	useEffect(() => {
		const supabase = createClient()
		let activo = true

		const cargarDatos = async () => {
			setCargando(true)
			setErrorCarga(null)
			setRequiereAutenticacion(false)

			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser()

			if (!activo) {
				return
			}

			if (userError) {
				setEquipos([])
				setAreasProduccion([])
				setErrorCarga("No se pudo validar la sesión actual")
				setCargando(false)
				return
			}

			if (!user) {
				setEquipos([])
				setAreasProduccion([])
				setRequiereAutenticacion(true)
				setCargando(false)
				return
			}

			const [{ data, error }, { data: areas, error: areasError }] =
				await Promise.all([
					supabase.from("equipos").select("*"),
					supabase.from("areas_produccion").select("*"),
				])

			if (!activo) {
				return
			}

			if (error || areasError) {
				setEquipos([])
				setAreasProduccion([])
				setErrorCarga(
					error?.message ??
						areasError?.message ??
						"No se pudieron cargar los activos",
				)
				setCargando(false)
				return
			}

			setEquipos((data ?? []).map(mapEquipo))
			setAreasProduccion(areas ?? [])
			setCargando(false)
		}

		void cargarDatos()

		return () => {
			activo = false
		}
	}, [])

	// Filter equipment by area
	const equiposFiltrados =
		filtroArea === "todas"
			? equipos
			: equipos.filter((e) => e.idArea === filtroArea)

	// Group filtered equipment by type
	const equiposPorTipo = {
		"maquinaria-pesada": equiposFiltrados.filter(
			(e) => e.tipo === "maquinaria-pesada",
		),
		"linea-produccion": equiposFiltrados.filter(
			(e) => e.tipo === "linea-produccion",
		),
		electricos: equiposFiltrados.filter((e) => e.tipo === "electricos"),
		hvac: equiposFiltrados.filter((e) => e.tipo === "hvac"),
	}

	const getIcon = (tipo: string) => {
		switch (tipo) {
			case "maquinaria-pesada":
				return <Gear className="size-6" weight="duotone" />
			case "linea-produccion":
				return <Factory className="size-6" weight="duotone" />
			case "electricos":
				return <Lightning className="size-6" weight="duotone" />
			case "hvac":
				return <Wind className="size-6" weight="duotone" />
			default:
				return <Gear className="size-6" weight="duotone" />
		}
	}

	const getTipoLabel = (tipo: string) => {
		switch (tipo) {
			case "maquinaria-pesada":
				return "Maquinaria Pesada"
			case "linea-produccion":
				return "Líneas de Producción"
			case "electricos":
				return "Equipos Eléctricos"
			case "hvac":
				return "Sistemas HVAC"
			default:
				return tipo
		}
	}

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
									<BreadcrumbPage>Activos</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>

				<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h1 className="text-2xl font-semibold">Gestión de Activos</h1>
							<p className="text-sm text-muted-foreground">
								Visualiza el estado y el historial de mantenimiento de todos los
								equipos
							</p>
						</div>
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
								<FunnelSimple
									className="size-4 text-muted-foreground"
									weight="bold"
								/>
								<select
									value={filtroArea}
									onChange={(e) => setFiltroArea(e.target.value)}
									className="bg-transparent text-sm font-medium outline-none"
								>
									<option value="todas">Todas las áreas</option>
									{areasProduccion.map((area) => (
										<option key={area.id} value={area.id}>
											{area.nombre}
										</option>
									))}
								</select>
							</div>
							<Button onClick={() => router.push("/activos/nuevo")}>
								<Plus className="mr-2 size-4" weight="bold" />
								Nuevo Equipo
							</Button>
						</div>
					</div>

					{cargando ? (
						<Card>
							<CardHeader>
								<CardTitle>Cargando activos</CardTitle>
								<CardDescription>
									Consultando equipos y áreas de producción...
								</CardDescription>
							</CardHeader>
						</Card>
					) : requiereAutenticacion ? (
						<Card>
							<CardHeader>
								<CardTitle>Inicia sesión para continuar</CardTitle>
								<CardDescription>
									No hay una sesión activa para consultar los activos en
									Supabase.
								</CardDescription>
							</CardHeader>
						</Card>
					) : errorCarga ? (
						<Card>
							<CardHeader>
								<CardTitle>No se pudieron cargar los activos</CardTitle>
								<CardDescription>{errorCarga}</CardDescription>
							</CardHeader>
						</Card>
					) : (
						Object.entries(equiposPorTipo)
							.filter(([, equiposGrupo]) => equiposGrupo.length > 0)
							.map(([tipo, equiposGrupo]) => (
								<div key={tipo}>
									<h2 className="mb-4 text-lg font-semibold">
										{getTipoLabel(tipo)}
									</h2>
									<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
										{equiposGrupo.map((equipo) => (
											<Card
												key={equipo.id}
												className="cursor-pointer transition-all hover:shadow-md"
												onClick={() => router.push(`/activos/${equipo.id}`)}
											>
												<CardHeader>
													<div className="flex items-start justify-between">
														<div
															className={cn(
																"flex size-10 items-center justify-center rounded-lg",
																equipo.estado === "operativo" &&
																	"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
																equipo.estado === "mantenimiento" &&
																	"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
																equipo.estado === "fuera-servicio" &&
																	"bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
															)}
														>
															{getIcon(tipo)}
														</div>
														<span
															className={cn(
																"rounded-full px-2 py-0.5 text-xs font-medium",
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
																	? "Mantenimiento"
																	: "Fuera de Servicio"}
														</span>
													</div>
													<CardTitle className="mt-4">
														<span className="flex items-center gap-2">
															{equipo.nombre}
															{equipo.tieneIoT && (
																<span className="inline-flex items-center gap-0.5 rounded-full bg-cyan-100 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400">
																	⚡ IoT
																</span>
															)}
														</span>
													</CardTitle>
													<CardDescription>
														<span className="flex flex-wrap items-center gap-2">
															<span>{equipo.ubicacion}</span>
															{(() => {
																const area = areasProduccion.find(
																	(a) => a.id === equipo.idArea,
																)
																return area ? (
																	<span className="inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
																		{area.nombre}
																	</span>
																) : null
															})()}
														</span>
													</CardDescription>
												</CardHeader>
												<CardContent>
													<div className="space-y-2 text-xs">
														<div className="flex justify-between">
															<span className="text-muted-foreground">
																Último mantenimiento:
															</span>
															<span className="font-medium">
																{formatMaintenanceDate(
																	equipo.ultimoMantenimiento,
																)}
															</span>
														</div>
														<div className="flex justify-between">
															<span className="text-muted-foreground">
																Próximo mantenimiento:
															</span>
															<span className="font-medium">
																{formatMaintenanceDate(
																	equipo.proximoMantenimiento,
																)}
															</span>
														</div>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</div>
							))
					)}
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
