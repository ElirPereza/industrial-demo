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
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import {
	getUsuarios,
	type Perfil,
	updatePerfil,
} from "@/app/(dashboard)/usuarios/actions"
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

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
	const [usuarios, setUsuarios] = useState<Perfil[]>([])
	const [loading, setLoading] = useState(true)

	// Edit modal
	const [editingUsuario, setEditingUsuario] = useState<Perfil | null>(null)
	const [saving, setSaving] = useState(false)
	const [editNombre, setEditNombre] = useState("")
	const [editDepartamento, setEditDepartamento] = useState("")

	const fetchUsuarios = useCallback(async () => {
		setLoading(true)
		const result = await getUsuarios()
		if (result.success) {
			setUsuarios(result.data)
		}
		setLoading(false)
	}, [])

	useEffect(() => {
		fetchUsuarios()
	}, [fetchUsuarios])

	const openEdit = (u: Perfil) => {
		setEditNombre(u.nombre)
		setEditDepartamento(u.departamento ?? "")
		setEditingUsuario(u)
	}

	const handleSaveEdit = async () => {
		if (!editingUsuario) return
		setSaving(true)
		const result = await updatePerfil(editingUsuario.id, {
			nombre: editNombre,
			departamento: editDepartamento || undefined,
		})
		setSaving(false)
		if (result.success) {
			toast.success("Usuario actualizado")
			setEditingUsuario(null)
			fetchUsuarios()
		} else {
			toast.error(result.error ?? "Error al actualizar")
		}
	}

	const usuariosFiltrados = usuarios.filter((u) => {
		const matchBusqueda =
			u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
			u.email.toLowerCase().includes(busqueda.toLowerCase())
		const matchRol = !filtroRol || u.rol === filtroRol
		return matchBusqueda && matchRol
	})

	const conteoRoles = {
		admin: usuarios.filter((u) => u.rol === "admin").length,
		supervisor: usuarios.filter((u) => u.rol === "supervisor").length,
		tecnico: usuarios.filter((u) => u.rol === "tecnico").length,
	}

	return (
		<>
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
									<p className="text-sm text-muted-foreground">{item.label}</p>
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

				{loading && (
					<div className="flex items-center justify-center py-12">
						<p className="text-muted-foreground">Cargando usuarios...</p>
					</div>
				)}

				{/* Users Table */}
				{!loading && (
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
											</div>
											<div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
												<span className="flex items-center gap-1">
													<EnvelopeSimple className="size-3" />
													{usuario.email}
												</span>
												<span>•</span>
												<span>
													{usuario.departamento ?? "Sin departamento"}
												</span>
											</div>
										</div>
										<div className="text-right text-xs text-muted-foreground">
											<p>Registrado</p>
											<p className="font-medium">
												{new Date(usuario.created_at).toLocaleDateString(
													"es-ES",
													{
														day: "2-digit",
														month: "short",
													},
												)}
											</p>
										</div>
										<div className="flex gap-1">
											<Button
												variant="ghost"
												size="icon-sm"
												onClick={() => openEdit(usuario)}
											>
												<PencilSimple className="size-4" weight="duotone" />
											</Button>
											<Button variant="ghost" size="icon-sm">
												<Trash className="size-4" weight="duotone" />
											</Button>
										</div>
									</div>
								))}
								{usuariosFiltrados.length === 0 && (
									<div className="flex items-center justify-center py-8">
										<p className="text-sm text-muted-foreground">
											No se encontraron usuarios
										</p>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</SidebarInset>

		{/* Edit Usuario Dialog */}
		<Dialog
			open={!!editingUsuario}
			onOpenChange={(open) => !open && setEditingUsuario(null)}
		>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>Editar Usuario</DialogTitle>
					<DialogDescription>
						Actualiza el nombre y departamento del usuario
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="u-nombre">Nombre completo</Label>
						<Input
							id="u-nombre"
							value={editNombre}
							onChange={(e) => setEditNombre(e.target.value)}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="u-dpto">Departamento</Label>
						<Input
							id="u-dpto"
							value={editDepartamento}
							onChange={(e) => setEditDepartamento(e.target.value)}
							placeholder="Ej: Producción, Mantenimiento..."
						/>
					</div>
					{editingUsuario && (
						<div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
							<span className="font-medium">Rol: </span>
							{getRolLabel(editingUsuario.rol)} — no se puede cambiar desde aquí
						</div>
					)}
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setEditingUsuario(null)}
					>
						Cancelar
					</Button>
					<Button onClick={handleSaveEdit} disabled={saving || !editNombre}>
						{saving ? "Guardando..." : "Guardar Cambios"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
		</>
	)
}
