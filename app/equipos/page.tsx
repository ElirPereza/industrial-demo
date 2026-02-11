"use client"

import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { equipos } from "@/lib/mock-data"
import { Gear, Factory, Lightning, Wind } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export default function EquiposPage() {
	const router = useRouter()

	// Group equipment by type
	const equiposPorTipo = {
		"maquinaria-pesada": equipos.filter((e) => e.tipo === "maquinaria-pesada"),
		"linea-produccion": equipos.filter((e) => e.tipo === "linea-produccion"),
		electricos: equipos.filter((e) => e.tipo === "electricos"),
		hvac: equipos.filter((e) => e.tipo === "hvac"),
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
									<BreadcrumbLink href="/dashboard">Portal Industrial</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>Equipos</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>

				<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
					<div>
						<h1 className="text-2xl font-semibold">Gestión de Equipos</h1>
						<p className="text-sm text-muted-foreground">
							Visualiza el estado y el historial de mantenimiento de todos los equipos
						</p>
					</div>

					{Object.entries(equiposPorTipo).map(([tipo, equiposGrupo]) => (
						<div key={tipo}>
							<h2 className="mb-4 text-lg font-semibold">{getTipoLabel(tipo)}</h2>
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
								{equiposGrupo.map((equipo) => (
									<Card
										key={equipo.id}
										className="cursor-pointer transition-all hover:shadow-md"
										onClick={() => router.push(`/equipos/${equipo.id}`)}
									>
										<CardHeader>
											<div className="flex items-start justify-between">
												<div
													className={cn(
														"flex size-10 items-center justify-center rounded-lg",
														equipo.estado === "operativo" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
														equipo.estado === "mantenimiento" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
														equipo.estado === "fuera-servicio" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
													)}
												>
													{getIcon(tipo)}
												</div>
												<span
													className={cn(
														"rounded-full px-2 py-0.5 text-xs font-medium",
														equipo.estado === "operativo" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
														equipo.estado === "mantenimiento" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
														equipo.estado === "fuera-servicio" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
													)}
												>
													{equipo.estado === "operativo" ? "Operativo" : equipo.estado === "mantenimiento" ? "Mantenimiento" : "Fuera de Servicio"}
												</span>
											</div>
											<CardTitle className="mt-4">{equipo.nombre}</CardTitle>
											<CardDescription>{equipo.ubicacion}</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="space-y-2 text-xs">
												<div className="flex justify-between">
													<span className="text-muted-foreground">Último mantenimiento:</span>
													<span className="font-medium">
														{equipo.ultimoMantenimiento.toLocaleDateString("es-ES", {
															day: "2-digit",
															month: "short",
														})}
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">Próximo mantenimiento:</span>
													<span className="font-medium">
														{equipo.proximoMantenimiento.toLocaleDateString("es-ES", {
															day: "2-digit",
															month: "short",
														})}
													</span>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</div>
					))}
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
