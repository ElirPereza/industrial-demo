"use client"

import {
	ArrowLeft,
	Check,
	EnvelopeSimple,
	Key,
	Shield,
	User,
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
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

const roles = [
	{
		value: "admin",
		label: "Administrador",
		description: "Acceso completo al sistema",
		icon: Shield,
		color: "bg-purple-100 text-purple-700",
	},
	{
		value: "supervisor",
		label: "Supervisor",
		description: "Gestión de equipos y personal",
		icon: Users,
		color: "bg-blue-100 text-blue-700",
	},
	{
		value: "tecnico",
		label: "Técnico",
		description: "Ejecución de mantenimientos",
		icon: Wrench,
		color: "bg-green-100 text-green-700",
	},
]

const departamentos = [
	"Mantenimiento",
	"Producción",
	"Calidad",
	"TI",
	"Operaciones",
	"Seguridad",
]

export default function NuevoUsuarioPage() {
	const router = useRouter()

	const [nombre, setNombre] = useState("")
	const [email, setEmail] = useState("")
	const [telefono, setTelefono] = useState("")
	const [rol, setRol] = useState("")
	const [departamento, setDepartamento] = useState("")
	const [enviarCredenciales, setEnviarCredenciales] = useState(true)
	const [activo, setActivo] = useState(true)

	const [errors, setErrors] = useState<Record<string, boolean>>({})

	const handleSubmit = () => {
		const newErrors: Record<string, boolean> = {}

		if (!nombre.trim()) newErrors.nombre = true
		if (!email.trim() || !email.includes("@")) newErrors.email = true
		if (!rol) newErrors.rol = true
		if (!departamento) newErrors.departamento = true

		setErrors(newErrors)

		if (Object.keys(newErrors).length === 0) {
			alert("Usuario creado exitosamente (simulado)")
			router.push("/usuarios")
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
									<BreadcrumbLink href="/usuarios">Usuarios</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>Nuevo Usuario</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>

				<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
					<Button
						variant="ghost"
						className="w-fit"
						onClick={() => router.push("/usuarios")}
					>
						<ArrowLeft className="mr-2 size-4" weight="bold" />
						Volver a Usuarios
					</Button>

					<div>
						<h1 className="text-2xl font-semibold">Nuevo Usuario</h1>
						<p className="text-sm text-muted-foreground">
							Registra un nuevo usuario en el sistema
						</p>
					</div>

					<div className="grid gap-6 lg:grid-cols-3">
						<div className="space-y-6 lg:col-span-2">
							{/* Información Personal */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<User className="size-5" weight="duotone" />
										Información Personal
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<label className="mb-1.5 block text-sm font-medium">
											Nombre Completo <span className="text-red-500">*</span>
										</label>
										<Input
											value={nombre}
											onChange={(e) => {
												setNombre(e.target.value)
												if (errors.nombre)
													setErrors({ ...errors, nombre: false })
											}}
											placeholder="Ej: Juan Pérez"
											className={cn(
												errors.nombre && "border-red-500 ring-1 ring-red-500/20",
											)}
										/>
									</div>
									<div className="grid gap-4 sm:grid-cols-2">
										<div>
											<label className="mb-1.5 block text-sm font-medium">
												Email <span className="text-red-500">*</span>
											</label>
											<div className="relative">
												<EnvelopeSimple className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
												<Input
													type="email"
													value={email}
													onChange={(e) => {
														setEmail(e.target.value)
														if (errors.email)
															setErrors({ ...errors, email: false })
													}}
													placeholder="email@empresa.com"
													className={cn(
														"pl-9",
														errors.email &&
															"border-red-500 ring-1 ring-red-500/20",
													)}
												/>
											</div>
										</div>
										<div>
											<label className="mb-1.5 block text-sm font-medium">
												Teléfono
											</label>
											<Input
												value={telefono}
												onChange={(e) => setTelefono(e.target.value)}
												placeholder="+57 300 123 4567"
											/>
										</div>
									</div>
									<div>
										<label className="mb-1.5 block text-sm font-medium">
											Departamento <span className="text-red-500">*</span>
										</label>
										<select
											value={departamento}
											onChange={(e) => {
												setDepartamento(e.target.value)
												if (errors.departamento)
													setErrors({ ...errors, departamento: false })
											}}
											className={cn(
												"w-full rounded-md border bg-background p-2 text-sm",
												errors.departamento &&
													"border-red-500 ring-1 ring-red-500/20",
											)}
										>
											<option value="">Selecciona un departamento</option>
											{departamentos.map((d) => (
												<option key={d} value={d}>
													{d}
												</option>
											))}
										</select>
									</div>
								</CardContent>
							</Card>

							{/* Rol */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Shield className="size-5" weight="duotone" />
										Rol y Permisos
									</CardTitle>
									<CardDescription>
										Define el nivel de acceso del usuario
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid gap-3 sm:grid-cols-3">
										{roles.map((r) => (
											<button
												key={r.value}
												type="button"
												onClick={() => {
													setRol(r.value)
													if (errors.rol) setErrors({ ...errors, rol: false })
												}}
												className={cn(
													"flex flex-col items-center gap-3 rounded-lg border p-4 text-center transition-all",
													rol === r.value
														? "border-primary bg-primary/5 ring-2 ring-primary"
														: "hover:bg-muted",
													errors.rol && "border-red-500",
												)}
											>
												<div className={cn("rounded-lg p-3", r.color)}>
													<r.icon className="size-6" weight="duotone" />
												</div>
												<div>
													<p className="font-medium">{r.label}</p>
													<p className="text-xs text-muted-foreground">
														{r.description}
													</p>
												</div>
											</button>
										))}
									</div>
									{errors.rol && (
										<p className="mt-2 text-xs text-red-500">
											Selecciona un rol
										</p>
									)}
								</CardContent>
							</Card>
						</div>

						{/* Sidebar */}
						<div className="space-y-6">
							{/* Configuración */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Key className="size-5" weight="duotone" />
										Configuración
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium">Usuario Activo</p>
											<p className="text-xs text-muted-foreground">
												Puede acceder al sistema
											</p>
										</div>
										<Switch checked={activo} onCheckedChange={setActivo} />
									</div>
									<Separator />
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium">
												Enviar Credenciales
											</p>
											<p className="text-xs text-muted-foreground">
												Enviar email con acceso
											</p>
										</div>
										<Switch
											checked={enviarCredenciales}
											onCheckedChange={setEnviarCredenciales}
										/>
									</div>
								</CardContent>
							</Card>

							{/* Actions */}
							<Card>
								<CardContent className="p-4 space-y-3">
									<Button className="w-full" onClick={handleSubmit}>
										<Check className="mr-2 size-4" weight="bold" />
										Crear Usuario
									</Button>
									<Button
										variant="outline"
										className="w-full"
										onClick={() => router.push("/usuarios")}
									>
										Cancelar
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
