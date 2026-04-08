"use client"

import {
	Bell,
	Buildings,
	ChartBar,
	CloudArrowUp,
	Copy,
	Cpu,
	Globe,
	Key,
	Moon,
	Palette,
	PlugsConnected,
	Plus,
	Shield,
	Sun,
	TreeStructure,
	User,
	Wrench,
} from "@phosphor-icons/react"
import { useTheme } from "next-themes"
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
	const { theme, setTheme } = useTheme()
	const [idioma, setIdioma] = useState("es")
	const [formatoFecha, setFormatoFecha] = useState("DD/MM/YYYY")

	// Security settings
	const [autenticacion2FA, setAutenticacion2FA] = useState(false)
	const [sesionActiva, setSesionActiva] = useState(true)
	const [saveMessage, setSaveMessage] = useState<string | null>(null)

	const handleSave = () => {
		setSaveMessage("Configuración guardada")
		setTimeout(() => setSaveMessage(null), 3000)
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
						<div className="flex flex-col items-end gap-2">
							<Button onClick={handleSave}>Guardar Cambios</Button>
							{saveMessage && (
								<p className="text-sm text-green-600">{saveMessage}</p>
							)}
						</div>
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
										<CardDescription>Información de tu cuenta</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<label
										htmlFor="nombre"
										className="mb-1.5 block text-sm font-medium"
									>
										Nombre Completo
									</label>
									<Input
										id="nombre"
										value={nombre}
										onChange={(e) => setNombre(e.target.value)}
									/>
								</div>
								<div>
									<label
										htmlFor="email"
										className="mb-1.5 block text-sm font-medium"
									>
										Correo Electrónico
									</label>
									<Input
										id="email"
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
									/>
								</div>
								<div>
									<label
										htmlFor="cargo"
										className="mb-1.5 block text-sm font-medium"
									>
										Cargo
									</label>
									<Input
										id="cargo"
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
										<CardDescription>Personaliza la interfaz</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<label
										htmlFor="tema"
										className="mb-2 block text-sm font-medium"
									>
										Tema
									</label>
									<div id="tema" className="flex gap-2">
										{[
											{ value: "light", label: "Claro", icon: Sun },
											{ value: "dark", label: "Oscuro", icon: Moon },
											{ value: "system", label: "Sistema", icon: Globe },
										].map((option) => (
											<button
												key={option.value}
												type="button"
												onClick={() => setTheme(option.value)}
												className={cn(
													"flex flex-1 flex-col items-center gap-2 rounded-lg border p-3 transition-all",
													theme === option.value
														? "border-primary bg-primary/5"
														: "hover:bg-muted",
												)}
											>
												<option.icon
													className={cn(
														"size-5",
														theme === option.value
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
									<label
										htmlFor="idioma"
										className="mb-1.5 block text-sm font-medium"
									>
										Idioma
									</label>
									<select
										id="idioma"
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
									<label
										htmlFor="formatoFecha"
										className="mb-1.5 block text-sm font-medium"
									>
										Formato de Fecha
									</label>
									<select
										id="formatoFecha"
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
										<CardDescription>Protege tu cuenta</CardDescription>
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
										<p className="text-sm font-medium">
											Mantener Sesión Activa
										</p>
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

					{/* Roles y Permisos */}
					<Separator />
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<div className="flex items-center gap-3">
									<div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
										<Shield className="size-5" weight="duotone" />
									</div>
									<div>
										<CardTitle>Roles y Permisos</CardTitle>
										<CardDescription>
											Gestiona el acceso y los permisos de los usuarios del
											sistema
										</CardDescription>
									</div>
								</div>
							</CardHeader>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Roles del Sistema</CardTitle>
								<CardDescription>
									Configura los permisos de cada rol
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid gap-4 sm:grid-cols-2">
									{[
										{
											nombre: "Admin",
											descripcion:
												"Acceso total al sistema. Gestiona usuarios, configuración y datos.",
											usuarios: 1,
											icon: Shield,
											iconColor: "text-red-600 dark:text-red-400",
											iconBg: "bg-red-100 dark:bg-red-900/30",
										},
										{
											nombre: "Supervisor",
											descripcion:
												"Supervisa operaciones, aprueba formularios y ve reportes.",
											usuarios: 1,
											icon: ChartBar,
											iconColor: "text-blue-600 dark:text-blue-400",
											iconBg: "bg-blue-100 dark:bg-blue-900/30",
										},
										{
											nombre: "Técnico",
											descripcion:
												"Ejecuta mantenimientos, llena formularios y reporta fallas.",
											usuarios: 2,
											icon: Wrench,
											iconColor: "text-green-600 dark:text-green-400",
											iconBg: "bg-green-100 dark:bg-green-900/30",
										},
										{
											nombre: "Contratista",
											descripcion:
												"Acceso limitado a equipos y formularios asignados.",
											usuarios: 1,
											icon: Buildings,
											iconColor: "text-orange-600 dark:text-orange-400",
											iconBg: "bg-orange-100 dark:bg-orange-900/30",
										},
									].map((rol) => (
										<div
											key={rol.nombre}
											className="flex flex-col gap-3 rounded-lg border p-4"
										>
											<div className="flex items-start justify-between">
												<div
													className={cn(
														"flex size-10 items-center justify-center rounded-lg",
														rol.iconBg,
													)}
												>
													<rol.icon
														className={cn("size-5", rol.iconColor)}
														weight="duotone"
													/>
												</div>
												<span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
													{rol.usuarios}{" "}
													{rol.usuarios === 1 ? "usuario" : "usuarios"}
												</span>
											</div>
											<div>
												<p className="font-medium">{rol.nombre}</p>
												<p className="text-xs text-muted-foreground">
													{rol.descripcion}
												</p>
											</div>
											<Button
												variant="outline"
												size="sm"
												className="w-full"
												disabled
											>
												Editar Permisos
											</Button>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Integraciones IoT */}
					<Separator />
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<div className="flex items-center gap-3">
									<div className="flex size-10 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400">
										<Cpu className="size-5" weight="duotone" />
									</div>
									<div>
										<CardTitle>Integraciones IoT</CardTitle>
										<CardDescription>
											Conecta equipos industriales para monitoreo en tiempo real
										</CardDescription>
									</div>
								</div>
							</CardHeader>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Protocolos Soportados</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid gap-4 sm:grid-cols-2">
									{[
										{
											name: "Modbus TCP",
											icon: PlugsConnected,
											status: "Configurado",
											statusColor:
												"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
											description: "Puerto 502, 3 dispositivos",
											iconColor: "text-blue-600 dark:text-blue-400",
											iconBg: "bg-blue-100 dark:bg-blue-900/30",
										},
										{
											name: "OPC-UA",
											icon: TreeStructure,
											status: "Disponible",
											statusColor:
												"bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
											description: "Servidor OPC-UA compatible",
											iconColor: "text-purple-600 dark:text-purple-400",
											iconBg: "bg-purple-100 dark:bg-purple-900/30",
										},
										{
											name: "MQTT",
											icon: CloudArrowUp,
											status: "Configurado",
											statusColor:
												"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
											description: "Broker: mqtt.planta.local:1883",
											iconColor: "text-emerald-600 dark:text-emerald-400",
											iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
										},
										{
											name: "BACnet",
											icon: Buildings,
											status: "No configurado",
											statusColor:
												"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
											description: "Para sistemas HVAC",
											iconColor: "text-orange-600 dark:text-orange-400",
											iconBg: "bg-orange-100 dark:bg-orange-900/30",
										},
									].map((protocol) => (
										<div
											key={protocol.name}
											className="flex flex-col gap-3 rounded-lg border p-4"
										>
											<div className="flex items-start justify-between">
												<div
													className={cn(
														"flex size-10 items-center justify-center rounded-lg",
														protocol.iconBg,
													)}
												>
													<protocol.icon
														className={cn("size-5", protocol.iconColor)}
														weight="duotone"
													/>
												</div>
												<span
													className={cn(
														"rounded-full px-2 py-0.5 text-xs font-medium",
														protocol.statusColor,
													)}
												>
													{protocol.status}
												</span>
											</div>
											<div>
												<p className="font-medium">{protocol.name}</p>
												<p className="text-xs text-muted-foreground">
													{protocol.description}
												</p>
											</div>
											<Button variant="outline" size="sm" className="w-full">
												Configurar
											</Button>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<div className="flex items-center gap-3">
									<div className="flex size-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
										<Globe className="size-5" weight="duotone" />
									</div>
									<div>
										<CardTitle>Webhooks y APIs</CardTitle>
										<CardDescription>
											Integra con sistemas externos (SCADA, MES, ERP)
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="divide-y rounded-lg border">
									{[
										{
											name: "Notificación de alertas críticas",
											method: "POST",
											url: "https://scada.planta.local/api/alerts",
										},
										{
											name: "Reporte diario de mantenimiento",
											method: "POST",
											url: "https://erp.empresa.com/api/maintenance",
										},
									].map((webhook) => (
										<div
											key={webhook.name}
											className="flex items-center justify-between gap-4 p-3"
										>
											<div className="min-w-0 flex-1">
												<p className="text-sm font-medium">{webhook.name}</p>
												<p className="truncate text-xs text-muted-foreground">
													{webhook.method} → {webhook.url}
												</p>
											</div>
											<span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
												Activo
											</span>
										</div>
									))}
								</div>
								<Button variant="outline" size="sm">
									<Plus className="size-4" />
									Agregar Webhook
								</Button>
								<Separator />
								<div className="flex items-center justify-between gap-4 rounded-lg border p-3">
									<div className="flex items-center gap-3">
										<Key
											className="size-5 text-muted-foreground"
											weight="duotone"
										/>
										<div>
											<p className="text-sm font-medium">Tu API Key</p>
											<p className="font-mono text-xs text-muted-foreground">
												●●●●●●●●●●●●sk-prod-xxxx
											</p>
										</div>
									</div>
									<Button variant="outline" size="sm">
										<Copy className="size-4" />
										Copiar
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
