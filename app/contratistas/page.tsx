"use client"

import {
	Buildings,
	CalendarCheck,
	EnvelopeSimple,
	MagnifyingGlass,
	PencilSimple,
	Phone,
	Plus,
	Star,
	Trash,
	UserCircle,
} from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

// Mock data for contractors
const contratistasMock = [
	{
		id: "con-001",
		nombre: "Servicios Industriales del Norte",
		contacto: "Roberto Gómez",
		email: "contacto@sinorte.com",
		telefono: "+57 310 555 1234",
		especialidad: "Mantenimiento Eléctrico",
		estado: "activo",
		calificacion: 4.8,
		trabajosCompletados: 45,
		contratoVigente: new Date("2024-12-31"),
	},
	{
		id: "con-002",
		nombre: "TechMaint Solutions",
		contacto: "Carolina Ruiz",
		email: "info@techmaint.co",
		telefono: "+57 320 555 5678",
		especialidad: "HVAC y Refrigeración",
		estado: "activo",
		calificacion: 4.5,
		trabajosCompletados: 32,
		contratoVigente: new Date("2024-09-30"),
	},
	{
		id: "con-003",
		nombre: "Mecánica Industrial Precisa",
		contacto: "Andrés Martínez",
		email: "amartinez@miprecisa.com",
		telefono: "+57 315 555 9012",
		especialidad: "Maquinaria Pesada",
		estado: "activo",
		calificacion: 4.9,
		trabajosCompletados: 67,
		contratoVigente: new Date("2025-06-30"),
	},
	{
		id: "con-004",
		nombre: "Automatización y Control SA",
		contacto: "Laura Sánchez",
		email: "lsanchez@autocontrol.com",
		telefono: "+57 318 555 3456",
		especialidad: "Sistemas de Control",
		estado: "inactivo",
		calificacion: 4.2,
		trabajosCompletados: 18,
		contratoVigente: new Date("2023-12-31"),
	},
	{
		id: "con-005",
		nombre: "Soldadura Especializada JR",
		contacto: "Jorge Reyes",
		email: "jorge@soldadurajr.com",
		telefono: "+57 312 555 7890",
		especialidad: "Soldadura Industrial",
		estado: "activo",
		calificacion: 4.7,
		trabajosCompletados: 28,
		contratoVigente: new Date("2024-08-15"),
	},
]

export default function ContratistasPage() {
	const router = useRouter()
	const [busqueda, setBusqueda] = useState("")
	const [filtroEstado, setFiltroEstado] = useState<string | null>(null)

	const contratistasFiltrados = contratistasMock.filter((c) => {
		const matchBusqueda =
			c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
			c.especialidad.toLowerCase().includes(busqueda.toLowerCase())
		const matchEstado = !filtroEstado || c.estado === filtroEstado
		return matchBusqueda && matchEstado
	})

	const conteoEstado = {
		activo: contratistasMock.filter((c) => c.estado === "activo").length,
		inactivo: contratistasMock.filter((c) => c.estado === "inactivo").length,
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
									<BreadcrumbPage>Contratistas</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>

				<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-semibold">
								Gestión de Contratistas
							</h1>
							<p className="text-sm text-muted-foreground">
								Administra los contratistas externos del sistema
							</p>
						</div>
						<Button onClick={() => router.push("/contratistas/nuevo")}>
							<Plus className="mr-2 size-4" weight="bold" />
							Nuevo Contratista
						</Button>
					</div>

					{/* Stats */}
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardContent className="flex items-center gap-4 p-4">
								<div className="rounded-lg bg-blue-100 p-3 text-blue-700">
									<Buildings className="size-5" weight="duotone" />
								</div>
								<div>
									<p className="text-2xl font-semibold">
										{contratistasMock.length}
									</p>
									<p className="text-sm text-muted-foreground">
										Total Contratistas
									</p>
								</div>
							</CardContent>
						</Card>
						<Card
							className={cn(
								"cursor-pointer transition-all hover:shadow-md",
								filtroEstado === "activo" && "ring-2 ring-primary",
							)}
							onClick={() =>
								setFiltroEstado(filtroEstado === "activo" ? null : "activo")
							}
						>
							<CardContent className="flex items-center gap-4 p-4">
								<div className="rounded-lg bg-green-100 p-3 text-green-700">
									<CalendarCheck className="size-5" weight="duotone" />
								</div>
								<div>
									<p className="text-2xl font-semibold">{conteoEstado.activo}</p>
									<p className="text-sm text-muted-foreground">Activos</p>
								</div>
							</CardContent>
						</Card>
						<Card
							className={cn(
								"cursor-pointer transition-all hover:shadow-md",
								filtroEstado === "inactivo" && "ring-2 ring-primary",
							)}
							onClick={() =>
								setFiltroEstado(filtroEstado === "inactivo" ? null : "inactivo")
							}
						>
							<CardContent className="flex items-center gap-4 p-4">
								<div className="rounded-lg bg-gray-100 p-3 text-gray-700">
									<Buildings className="size-5" weight="duotone" />
								</div>
								<div>
									<p className="text-2xl font-semibold">
										{conteoEstado.inactivo}
									</p>
									<p className="text-sm text-muted-foreground">Inactivos</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="flex items-center gap-4 p-4">
								<div className="rounded-lg bg-yellow-100 p-3 text-yellow-700">
									<Star className="size-5" weight="duotone" />
								</div>
								<div>
									<p className="text-2xl font-semibold">4.6</p>
									<p className="text-sm text-muted-foreground">
										Calificación Prom.
									</p>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Search */}
					<div className="relative">
						<MagnifyingGlass className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Buscar por nombre o especialidad..."
							value={busqueda}
							onChange={(e) => setBusqueda(e.target.value)}
							className="pl-9"
						/>
					</div>

					{/* Contractors Grid */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{contratistasFiltrados.map((contratista) => (
							<Card
								key={contratista.id}
								className="transition-all hover:shadow-md"
							>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="flex items-center gap-3">
											<div className="flex size-12 items-center justify-center rounded-full bg-muted">
												<UserCircle
													className="size-8 text-muted-foreground"
													weight="duotone"
												/>
											</div>
											<div>
												<CardTitle className="text-base">
													{contratista.nombre}
												</CardTitle>
												<CardDescription>
													{contratista.especialidad}
												</CardDescription>
											</div>
										</div>
										<span
											className={cn(
												"rounded-full px-2 py-0.5 text-xs font-medium",
												contratista.estado === "activo"
													? "bg-green-100 text-green-700"
													: "bg-gray-100 text-gray-600",
											)}
										>
											{contratista.estado === "activo" ? "Activo" : "Inactivo"}
										</span>
									</div>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="space-y-2 text-sm">
										<div className="flex items-center gap-2 text-muted-foreground">
											<UserCircle className="size-4" />
											<span>{contratista.contacto}</span>
										</div>
										<div className="flex items-center gap-2 text-muted-foreground">
											<EnvelopeSimple className="size-4" />
											<span className="truncate">{contratista.email}</span>
										</div>
										<div className="flex items-center gap-2 text-muted-foreground">
											<Phone className="size-4" />
											<span>{contratista.telefono}</span>
										</div>
									</div>

									<Separator />

									<div className="flex items-center justify-between text-sm">
										<div className="flex items-center gap-1">
											<Star
												className="size-4 text-yellow-500"
												weight="fill"
											/>
											<span className="font-medium">
												{contratista.calificacion}
											</span>
										</div>
										<span className="text-muted-foreground">
											{contratista.trabajosCompletados} trabajos
										</span>
									</div>

									<div className="flex items-center justify-between text-xs">
										<span className="text-muted-foreground">
											Contrato vigente hasta:
										</span>
										<span
											className={cn(
												"font-medium",
												contratista.contratoVigente < new Date()
													? "text-red-600"
													: "text-green-600",
											)}
										>
											{contratista.contratoVigente.toLocaleDateString("es-ES", {
												day: "2-digit",
												month: "short",
												year: "numeric",
											})}
										</span>
									</div>

									<div className="flex gap-2 pt-2">
										<Button variant="outline" size="sm" className="flex-1">
											<PencilSimple className="mr-1 size-3" />
											Editar
										</Button>
										<Button variant="ghost" size="icon-sm">
											<Trash className="size-4" />
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
