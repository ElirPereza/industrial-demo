"use client"

import {
	EnvelopeSimple,
	MagnifyingGlass,
	PencilSimple,
	Plus,
	Shield,
	Trash,
	User,
	UserCircle,
	Users,
	Wrench,
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

// Mock data for users
const usuariosMock = [
	{
		id: "usr-001",
		nombre: "Carlos Mendoza",
		email: "carlos.mendoza@empresa.com",
		rol: "admin",
		departamento: "TI",
		estado: "activo",
		ultimoAcceso: new Date("2024-01-15"),
	},
	{
		id: "usr-002",
		nombre: "Ana García",
		email: "ana.garcia@empresa.com",
		rol: "supervisor",
		departamento: "Mantenimiento",
		estado: "activo",
		ultimoAcceso: new Date("2024-01-14"),
	},
	{
		id: "usr-003",
		nombre: "Luis Rodríguez",
		email: "luis.rodriguez@empresa.com",
		rol: "tecnico",
		departamento: "Mantenimiento",
		estado: "activo",
		ultimoAcceso: new Date("2024-01-15"),
	},
	{
		id: "usr-004",
		nombre: "María López",
		email: "maria.lopez@empresa.com",
		rol: "tecnico",
		departamento: "Producción",
		estado: "activo",
		ultimoAcceso: new Date("2024-01-13"),
	},
	{
		id: "usr-005",
		nombre: "Pedro Sánchez",
		email: "pedro.sanchez@empresa.com",
		rol: "supervisor",
		departamento: "Calidad",
		estado: "inactivo",
		ultimoAcceso: new Date("2024-01-10"),
	},
	{
		id: "usr-006",
		nombre: "Laura Martínez",
		email: "laura.martinez@empresa.com",
		rol: "tecnico",
		departamento: "Mantenimiento",
		estado: "activo",
		ultimoAcceso: new Date("2024-01-15"),
	},
]

const getRolIcon = (rol: string) => {
	switch (rol) {
		case "admin":
			return <Shield className="size-4" weight="duotone" />
		case "supervisor":
			return <Users className="size-4" weight="duotone" />
		case "tecnico":
			return <Wrench className="size-4" weight="duotone" />
		default:
			return <User className="size-4" weight="duotone" />
	}
}

const getRolLabel = (rol: string) => {
	switch (rol) {
		case "admin":
			return "Administrador"
		case "supervisor":
			return "Supervisor"
		case "tecnico":
			return "Técnico"
		default:
			return rol
	}
}

const getRolColor = (rol: string) => {
	switch (rol) {
		case "admin":
			return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
		case "supervisor":
			return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
		case "tecnico":
			return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
		default:
			return "bg-gray-100 text-gray-700"
	}
}

export default function UsuariosPage() {
	const router = useRouter()
	const [busqueda, setBusqueda] = useState("")
	const [filtroRol, setFiltroRol] = useState<string | null>(null)

	const usuariosFiltrados = usuariosMock.filter((u) => {
		const matchBusqueda =
			u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
			u.email.toLowerCase().includes(busqueda.toLowerCase())
		const matchRol = !filtroRol || u.rol === filtroRol
		return matchBusqueda && matchRol
	})

	const conteoRoles = {
		admin: usuariosMock.filter((u) => u.rol === "admin").length,
		supervisor: usuariosMock.filter((u) => u.rol === "supervisor").length,
		tecnico: usuariosMock.filter((u) => u.rol === "tecnico").length,
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
									<BreadcrumbPage>Usuarios</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>

				<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-semibold">Gestión de Usuarios</h1>
							<p className="text-sm text-muted-foreground">
								Administra los usuarios internos del sistema
							</p>
						</div>
						<Button onClick={() => router.push("/usuarios/nuevo")}>
							<Plus className="mr-2 size-4" weight="bold" />
							Nuevo Usuario
						</Button>
					</div>

					{/* Stats Cards */}
					<div className="grid gap-4 sm:grid-cols-3">
						{[
							{
								rol: "admin",
								label: "Administradores",
								count: conteoRoles.admin,
							},
							{
								rol: "supervisor",
								label: "Supervisores",
								count: conteoRoles.supervisor,
							},
							{ rol: "tecnico", label: "Técnicos", count: conteoRoles.tecnico },
						].map((item) => (
							<Card
								key={item.rol}
								className={cn(
									"cursor-pointer transition-all hover:shadow-md",
									filtroRol === item.rol && "ring-2 ring-primary",
								)}
								onClick={() =>
									setFiltroRol(filtroRol === item.rol ? null : item.rol)
								}
							>
								<CardContent className="flex items-center gap-4 p-4">
									<div className={cn("rounded-lg p-3", getRolColor(item.rol))}>
										{getRolIcon(item.rol)}
									</div>
									<div>
										<p className="text-2xl font-semibold">{item.count}</p>
										<p className="text-sm text-muted-foreground">
											{item.label}
										</p>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Search */}
					<div className="relative">
						<MagnifyingGlass className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Buscar por nombre o email..."
							value={busqueda}
							onChange={(e) => setBusqueda(e.target.value)}
							className="pl-9"
						/>
					</div>

					{/* Users Table */}
					<Card>
						<CardHeader>
							<CardTitle>Usuarios ({usuariosFiltrados.length})</CardTitle>
							<CardDescription>
								{filtroRol
									? `Mostrando ${getRolLabel(filtroRol).toLowerCase()}s`
									: "Todos los usuarios del sistema"}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="divide-y">
								{usuariosFiltrados.map((usuario) => (
									<div
										key={usuario.id}
										className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
									>
										<div className="flex size-12 items-center justify-center rounded-full bg-muted">
											<UserCircle
												className="size-8 text-muted-foreground"
												weight="duotone"
											/>
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<p className="font-medium">{usuario.nombre}</p>
												<span
													className={cn(
														"rounded-full px-2 py-0.5 text-xs font-medium",
														getRolColor(usuario.rol),
													)}
												>
													{getRolLabel(usuario.rol)}
												</span>
												{usuario.estado === "inactivo" && (
													<span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
														Inactivo
													</span>
												)}
											</div>
											<div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
												<span className="flex items-center gap-1">
													<EnvelopeSimple className="size-3" />
													{usuario.email}
												</span>
												<span>•</span>
												<span>{usuario.departamento}</span>
											</div>
										</div>
										<div className="text-right text-xs text-muted-foreground">
											<p>Último acceso</p>
											<p className="font-medium">
												{usuario.ultimoAcceso.toLocaleDateString("es-ES", {
													day: "2-digit",
													month: "short",
												})}
											</p>
										</div>
										<div className="flex gap-1">
											<Button variant="ghost" size="icon-sm">
												<PencilSimple className="size-4" weight="duotone" />
											</Button>
											<Button variant="ghost" size="icon-sm">
												<Trash className="size-4" weight="duotone" />
											</Button>
										</div>
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
