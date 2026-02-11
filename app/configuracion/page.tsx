"use client"

import {
	Bell,
	Globe,
	Moon,
	Palette,
	Shield,
	Sun,
	User,
} from "@phosphor-icons/react"
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

export default function ConfiguracionPage() {
	// Profile settings
	const [nombre, setNombre] = useState("Carlos Méndez")
	const [email, setEmail] = useState("carlos.mendez@empresa.com")
	const [cargo, setCargo] = useState("Supervisor de Mantenimiento")

	// Notification settings
	const [notifEmail, setNotifEmail] = useState(true)
	const [notifPush, setNotifPush] = useState(true)
	const [notifFormularios, setNotifFormularios] = useState(true)
	const [notifEquipos, setNotifEquipos] = useState(false)
	const [notifReportes, setNotifReportes] = useState(true)

	// Appearance settings
	const [tema, setTema] = useState<"light" | "dark" | "system">("system")
	const [idioma, setIdioma] = useState("es")
	const [formatoFecha, setFormatoFecha] = useState("DD/MM/YYYY")

	// Security settings
	const [autenticacion2FA, setAutenticacion2FA] = useState(false)
	const [sesionActiva, setSesionActiva] = useState(true)

	const handleSave = () => {
		alert("Configuración guardada (simulado)")
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
									<BreadcrumbPage>Configuración</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>

				<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-semibold">Configuración</h1>
							<p className="text-sm text-muted-foreground">
								Personaliza tu experiencia en el portal
							</p>
						</div>
						<Button onClick={handleSave}>Guardar Cambios</Button>
					</div>

					<div className="grid gap-6 lg:grid-cols-2">
						{/* Perfil */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-3">
									<div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
										<User className="size-5" weight="duotone" />
									</div>
									<div>
										<CardTitle>Perfil</CardTitle>
										<CardDescription>
											Información de tu cuenta
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<label className="mb-1.5 block text-sm font-medium">
										Nombre Completo
									</label>
									<Input
										value={nombre}
										onChange={(e) => setNombre(e.target.value)}
									/>
								</div>
								<div>
									<label className="mb-1.5 block text-sm font-medium">
										Correo Electrónico
									</label>
									<Input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
									/>
								</div>
								<div>
									<label className="mb-1.5 block text-sm font-medium">
										Cargo
									</label>
									<Input
										value={cargo}
										onChange={(e) => setCargo(e.target.value)}
									/>
								</div>
							</CardContent>
						</Card>

						{/* Notificaciones */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-3">
									<div className="flex size-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
										<Bell className="size-5" weight="duotone" />
									</div>
									<div>
										<CardTitle>Notificaciones</CardTitle>
										<CardDescription>
											Configura cómo recibir alertas
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">
											Notificaciones por Email
										</p>
										<p className="text-xs text-muted-foreground">
											Recibe alertas en tu correo
										</p>
									</div>
									<Switch
										checked={notifEmail}
										onCheckedChange={setNotifEmail}
									/>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">Notificaciones Push</p>
										<p className="text-xs text-muted-foreground">
											Alertas en el navegador
										</p>
									</div>
									<Switch checked={notifPush} onCheckedChange={setNotifPush} />
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">Nuevos Formularios</p>
										<p className="text-xs text-muted-foreground">
											Cuando se envía un formulario
										</p>
									</div>
									<Switch
										checked={notifFormularios}
										onCheckedChange={setNotifFormularios}
									/>
								</div>
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">Alertas de Equipos</p>
										<p className="text-xs text-muted-foreground">
											Cuando un equipo cambia de estado
										</p>
									</div>
									<Switch
										checked={notifEquipos}
										onCheckedChange={setNotifEquipos}
									/>
								</div>
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">Reportes Semanales</p>
										<p className="text-xs text-muted-foreground">
											Resumen de actividad semanal
										</p>
									</div>
									<Switch
										checked={notifReportes}
										onCheckedChange={setNotifReportes}
									/>
								</div>
							</CardContent>
						</Card>

						{/* Apariencia */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-3">
									<div className="flex size-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
										<Palette className="size-5" weight="duotone" />
									</div>
									<div>
										<CardTitle>Apariencia</CardTitle>
										<CardDescription>
											Personaliza la interfaz
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<label className="mb-2 block text-sm font-medium">Tema</label>
									<div className="flex gap-2">
										{[
											{ value: "light", label: "Claro", icon: Sun },
											{ value: "dark", label: "Oscuro", icon: Moon },
											{ value: "system", label: "Sistema", icon: Globe },
										].map((option) => (
											<button
												key={option.value}
												type="button"
												onClick={() =>
													setTema(option.value as "light" | "dark" | "system")
												}
												className={cn(
													"flex flex-1 flex-col items-center gap-2 rounded-lg border p-3 transition-all",
													tema === option.value
														? "border-primary bg-primary/5"
														: "hover:bg-muted",
												)}
											>
												<option.icon
													className={cn(
														"size-5",
														tema === option.value
															? "text-primary"
															: "text-muted-foreground",
													)}
													weight="duotone"
												/>
												<span className="text-xs font-medium">
													{option.label}
												</span>
											</button>
										))}
									</div>
								</div>
								<Separator />
								<div>
									<label className="mb-1.5 block text-sm font-medium">
										Idioma
									</label>
									<select
										value={idioma}
										onChange={(e) => setIdioma(e.target.value)}
										className="w-full rounded-md border bg-background p-2 text-sm"
									>
										<option value="es">Español</option>
										<option value="en">English</option>
										<option value="pt">Português</option>
									</select>
								</div>
								<div>
									<label className="mb-1.5 block text-sm font-medium">
										Formato de Fecha
									</label>
									<select
										value={formatoFecha}
										onChange={(e) => setFormatoFecha(e.target.value)}
										className="w-full rounded-md border bg-background p-2 text-sm"
									>
										<option value="DD/MM/YYYY">DD/MM/YYYY</option>
										<option value="MM/DD/YYYY">MM/DD/YYYY</option>
										<option value="YYYY-MM-DD">YYYY-MM-DD</option>
									</select>
								</div>
							</CardContent>
						</Card>

						{/* Seguridad */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-3">
									<div className="flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
										<Shield className="size-5" weight="duotone" />
									</div>
									<div>
										<CardTitle>Seguridad</CardTitle>
										<CardDescription>
											Protege tu cuenta
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">
											Autenticación en Dos Pasos
										</p>
										<p className="text-xs text-muted-foreground">
											Añade una capa extra de seguridad
										</p>
									</div>
									<Switch
										checked={autenticacion2FA}
										onCheckedChange={setAutenticacion2FA}
									/>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">Mantener Sesión Activa</p>
										<p className="text-xs text-muted-foreground">
											No cerrar sesión automáticamente
										</p>
									</div>
									<Switch
										checked={sesionActiva}
										onCheckedChange={setSesionActiva}
									/>
								</div>
								<Separator />
								<div>
									<Button variant="outline" className="w-full">
										Cambiar Contraseña
									</Button>
								</div>
								<div>
									<Button variant="destructive" className="w-full">
										Cerrar Todas las Sesiones
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
