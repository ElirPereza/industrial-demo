"use client"

import { Factory, Gear, Lightning, Plus, Wind } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import {
	type Equipo,
	type EquipoFilters,
	getEquipos,
} from "@/app/(dashboard)/equipos/actions"
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
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const TIPOS = [
	{ value: "maquinaria_pesada", label: "Maquinaria Pesada" },
	{ value: "linea_produccion", label: "Lineas de Produccion" },
	{ value: "electricos", label: "Equipos Electricos" },
	{ value: "hvac", label: "Sistemas HVAC" },
] as const

type TipoEquipo = (typeof TIPOS)[number]["value"]

export default function EquiposPage() {
	const router = useRouter()
	const [equipos, setEquipos] = useState<Equipo[]>([])
	const [loading, setLoading] = useState(true)
	const [filtroTipo, setFiltroTipo] = useState<string | null>(null)

	const fetchEquipos = useCallback(async () => {
		setLoading(true)
		const filters: EquipoFilters = {}
		if (filtroTipo) filters.tipo = filtroTipo

		const result = await getEquipos(filters)
		if (result.success) {
			setEquipos(result.data)
		}
		setLoading(false)
	}, [filtroTipo])

	useEffect(() => {
		fetchEquipos()
	}, [fetchEquipos])

	// Group equipment by type
	const equiposPorTipo: Record<TipoEquipo, Equipo[]> = {
		maquinaria_pesada: equipos.filter((e) => e.tipo === "maquinaria_pesada"),
		linea_produccion: equipos.filter((e) => e.tipo === "linea_produccion"),
		electricos: equipos.filter((e) => e.tipo === "electricos"),
		hvac: equipos.filter((e) => e.tipo === "hvac"),
	}

	const getIcon = (tipo: string) => {
		switch (tipo) {
			case "maquinaria_pesada":
				return <Gear className="size-6" weight="duotone" />
			case "linea_produccion":
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
		const found = TIPOS.find((t) => t.value === tipo)
		return found?.label ?? tipo
	}

	const formatDate = (dateStr: string | null) => {
		if (!dateStr) return "N/A"
		return new Date(dateStr).toLocaleDateString("es-ES", {
			day: "2-digit",
			month: "short",
		})
	}

	// Filter out empty groups when a tipo filter is active
	const visibleGroups = Object.entries(equiposPorTipo).filter(
		([, items]) => items.length > 0,
	)

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
								<BreadcrumbPage>Equipos</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>

			<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-semibold">Gestion de Equipos</h1>
						<p className="text-sm text-muted-foreground">
							Visualiza el estado y el historial de mantenimiento de todos los
							equipos
						</p>
					</div>
					<Button onClick={() => router.push("/equipos/nuevo")}>
						<Plus className="mr-2 size-4" weight="bold" />
						Nuevo Equipo
					</Button>
				</div>

				{/* Filter buttons */}
				<div className="flex flex-wrap gap-2">
					<Button
						variant={filtroTipo === null ? "default" : "outline"}
						size="sm"
						onClick={() => setFiltroTipo(null)}
					>
						Todos
					</Button>
					{TIPOS.map((t) => (
						<Button
							key={t.value}
							variant={filtroTipo === t.value ? "default" : "outline"}
							size="sm"
							onClick={() =>
								setFiltroTipo(filtroTipo === t.value ? null : t.value)
							}
						>
							{t.label}
						</Button>
					))}
				</div>

				{loading ? (
					<div className="flex items-center justify-center py-20">
						<div className="text-sm text-muted-foreground">
							Cargando equipos...
						</div>
					</div>
				) : visibleGroups.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-2 py-20">
						<p className="text-sm text-muted-foreground">
							No se encontraron equipos
						</p>
						{filtroTipo && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => setFiltroTipo(null)}
							>
								Limpiar filtros
							</Button>
						)}
					</div>
				) : (
					visibleGroups.map(([tipo, equiposGrupo]) => (
						<div key={tipo}>
							<h2 className="mb-4 text-lg font-semibold">
								{getTipoLabel(tipo)}
							</h2>
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
								{(equiposGrupo as Equipo[]).map((equipo) => (
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
														equipo.estado === "operativo" &&
															"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
														equipo.estado === "mantenimiento" &&
															"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
														equipo.estado === "fuera_servicio" &&
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
														equipo.estado === "fuera_servicio" &&
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
											<CardTitle className="mt-4">{equipo.nombre}</CardTitle>
											<CardDescription>{equipo.ubicacion}</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="space-y-2 text-xs">
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														Ultimo mantenimiento:
													</span>
													<span className="font-medium">
														{formatDate(equipo.ultimo_mantenimiento)}
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														Proximo mantenimiento:
													</span>
													<span className="font-medium">
														{formatDate(equipo.proximo_mantenimiento)}
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
	)
}
