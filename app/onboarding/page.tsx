"use client"

import {
	Buildings,
	Camera,
	Check,
	CloudArrowUp,
	Eye,
	Factory,
	PlugsConnected,
	Plus,
	Shield,
	TreeStructure,
	UserCircleGear,
	Wrench,
	X,
} from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface EquipmentItem {
	name: string
	type: string
	area: string
}

interface InvitedUser {
	email: string
	role: string
	status: string
}

const STEPS = [
	"Información de la Planta",
	"Áreas y Líneas",
	"Equipos Principales",
	"Integraciones",
	"Usuarios y Roles",
]

export default function OnboardingPage() {
	const router = useRouter()
	const [currentStep, setCurrentStep] = useState(1)

	// Step 1
	const [plantName, setPlantName] = useState("")
	const [industry, setIndustry] = useState("")
	const [location, setLocation] = useState("")
	const [employees, setEmployees] = useState("")

	// Step 2
	const [areas, setAreas] = useState([
		"Nave A",
		"Nave B",
		"Nave C",
		"Nave D",
		"Subestación",
		"Exterior",
	])
	const [newArea, setNewArea] = useState("")

	// Step 3
	const [equipment, setEquipment] = useState<EquipmentItem[]>([
		{ name: "Torno CNC-01", type: "Maquinaria Pesada", area: "Nave A" },
		{
			name: "Compresor Principal",
			type: "Eléctricos",
			area: "Subestación",
		},
		{
			name: "Aire Acondicionado Central",
			type: "HVAC",
			area: "Nave B",
		},
	])
	const [newEquipName, setNewEquipName] = useState("")
	const [newEquipType, setNewEquipType] = useState("")
	const [newEquipArea, setNewEquipArea] = useState("")

	// Step 4
	const [protocols, setProtocols] = useState({
		modbus: true,
		opcua: false,
		mqtt: false,
		bacnet: false,
	})

	// Step 5
	const [inviteEmail, setInviteEmail] = useState("")
	const [inviteRole, setInviteRole] = useState("")
	const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>([
		{
			email: "maria.garcia@empresa.com",
			role: "Supervisor",
			status: "Invitación enviada",
		},
		{
			email: "juan.rodriguez@empresa.com",
			role: "Técnico",
			status: "Invitación enviada",
		},
	])

	const handleNext = () => {
		if (currentStep < 5) {
			setCurrentStep(currentStep + 1)
		} else {
			router.push("/dashboard")
		}
	}

	const handlePrev = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1)
		}
	}

	const addArea = () => {
		if (newArea.trim()) {
			setAreas([...areas, newArea.trim()])
			setNewArea("")
		}
	}

	const removeArea = (index: number) => {
		setAreas(areas.filter((_, i) => i !== index))
	}

	const addEquipment = () => {
		if (newEquipName.trim() && newEquipType && newEquipArea) {
			setEquipment([
				...equipment,
				{
					name: newEquipName.trim(),
					type: newEquipType,
					area: newEquipArea,
				},
			])
			setNewEquipName("")
			setNewEquipType("")
			setNewEquipArea("")
		}
	}

	const removeEquipment = (index: number) => {
		setEquipment(equipment.filter((_, i) => i !== index))
	}

	const sendInvite = () => {
		if (inviteEmail.trim() && inviteRole) {
			setInvitedUsers([
				...invitedUsers,
				{
					email: inviteEmail.trim(),
					role: inviteRole,
					status: "Invitación enviada",
				},
			])
			setInviteEmail("")
			setInviteRole("")
		}
	}

	return (
		<div className="relative min-h-screen bg-background">
			{/* Progress bar */}
			<div className="fixed top-0 right-0 left-0 z-50 h-1 bg-muted">
				<div
					className="h-full bg-primary transition-all duration-500 ease-out"
					style={{ width: `${(currentStep / 5) * 100}%` }}
				/>
			</div>

			{/* Brand header */}
			<div className="flex items-center justify-center gap-2.5 pt-10 pb-2">
				<div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
					<Factory className="size-5" weight="bold" />
				</div>
				<span className="text-xl font-semibold tracking-tight">
					Industrial Portal
				</span>
			</div>

			{/* Step indicator */}
			<div className="mx-auto max-w-3xl px-4 py-6">
				<div className="flex items-center justify-center">
					{STEPS.map((step, index) => (
						<div key={step} className="flex items-center">
							<div className="flex flex-col items-center gap-1.5">
								<div
									className={cn(
										"flex size-9 items-center justify-center rounded-full text-sm font-medium transition-all duration-300",
										index + 1 === currentStep &&
											"bg-primary text-primary-foreground shadow-sm",
										index + 1 < currentStep &&
											"bg-primary/15 text-primary dark:bg-primary/25",
										index + 1 > currentStep && "bg-muted text-muted-foreground",
									)}
								>
									{index + 1 < currentStep ? (
										<Check className="size-4" weight="bold" />
									) : (
										index + 1
									)}
								</div>
								<span
									className={cn(
										"hidden text-xs font-medium sm:block",
										index + 1 === currentStep
											? "text-foreground"
											: "text-muted-foreground",
									)}
								>
									{step}
								</span>
							</div>
							{index < STEPS.length - 1 && (
								<div
									className={cn(
										"mx-2 mb-5 h-0.5 w-8 transition-colors duration-300 sm:w-12",
										index + 1 < currentStep ? "bg-primary/30" : "bg-muted",
									)}
								/>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Step content */}
			<div className="mx-auto max-w-3xl px-4 pb-28">
				{/* Step 1: Información de la Planta */}
				{currentStep === 1 && (
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">
								Información de la Planta
							</CardTitle>
							<CardDescription>
								Configura los datos básicos de tu instalación industrial
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-5">
							<div>
								<label
									htmlFor="plant-name"
									className="mb-1.5 block text-sm font-medium"
								>
									Nombre de la Planta <span className="text-red-500">*</span>
								</label>
								<Input
									id="plant-name"
									placeholder="Ej: Planta Industrial Norte"
									value={plantName}
									onChange={(e) => setPlantName(e.target.value)}
								/>
							</div>
							<div>
								<label
									htmlFor="industry"
									className="mb-1.5 block text-sm font-medium"
								>
									Tipo de Industria
								</label>
								<select
									id="industry"
									value={industry}
									onChange={(e) => setIndustry(e.target.value)}
									className="w-full rounded-md border bg-background p-2 text-sm"
								>
									<option value="">Selecciona una opción</option>
									<option value="manufactura">Manufactura</option>
									<option value="alimentos">Alimentos y Bebidas</option>
									<option value="petroquimica">Petroquímica</option>
									<option value="hoteleria">Hotelería</option>
									<option value="papel">Papel y Cartón</option>
									<option value="otra">Otra</option>
								</select>
							</div>
							<div>
								<label
									htmlFor="location"
									className="mb-1.5 block text-sm font-medium"
								>
									Ubicación
								</label>
								<Input
									id="location"
									placeholder="Ej: Monterrey, Nuevo León"
									value={location}
									onChange={(e) => setLocation(e.target.value)}
								/>
							</div>
							<div>
								<label
									htmlFor="employees"
									className="mb-1.5 block text-sm font-medium"
								>
									Número de Empleados
								</label>
								<select
									id="employees"
									value={employees}
									onChange={(e) => setEmployees(e.target.value)}
									className="w-full rounded-md border bg-background p-2 text-sm"
								>
									<option value="">Selecciona un rango</option>
									<option value="1-50">1–50</option>
									<option value="51-200">51–200</option>
									<option value="201-500">201–500</option>
									<option value="500+">500+</option>
								</select>
							</div>
							<div>
								<label className="mb-1.5 block text-sm font-medium">
									Logo de la Planta
								</label>
								<div className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/40 hover:bg-muted/50">
									<div className="flex flex-col items-center gap-2 text-muted-foreground">
										<Camera className="size-8" weight="duotone" />
										<span className="text-xs font-medium">
											Arrastra o haz clic para subir
										</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Step 2: Áreas y Líneas */}
				{currentStep === 2 && (
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">Áreas y Líneas</CardTitle>
							<CardDescription>Define las áreas de tu planta</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								{areas.map((area, index) => (
									<div
										key={`area-${area}-${index}`}
										className="flex items-center gap-2"
									>
										<Input value={area} readOnly className="flex-1" />
										<Button
											variant="ghost"
											size="sm"
											onClick={() => removeArea(index)}
											className="shrink-0 text-muted-foreground hover:text-destructive"
										>
											<X className="size-4" />
										</Button>
									</div>
								))}
							</div>
							<div className="flex items-center gap-2">
								<Input
									placeholder="Nueva área..."
									value={newArea}
									onChange={(e) => setNewArea(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") addArea()
									}}
									className="flex-1"
								/>
								<Button variant="outline" size="sm" onClick={addArea}>
									<Plus className="size-4" />
									Agregar Área
								</Button>
							</div>
							{areas.length > 0 && (
								<div className="pt-2">
									<p className="mb-2 text-xs font-medium text-muted-foreground">
										Áreas configuradas:
									</p>
									<div className="flex flex-wrap gap-2">
										{areas.map((area, index) => (
											<span
												key={`tag-${area}-${index}`}
												className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
											>
												{area}
											</span>
										))}
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				)}

				{/* Step 3: Equipos Principales */}
				{currentStep === 3 && (
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">Equipos Principales</CardTitle>
							<CardDescription>
								Registra tus equipos principales. Podrás agregar más equipos
								después.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-5">
							<div className="grid gap-3 sm:grid-cols-3">
								<div>
									<label
										htmlFor="equip-name"
										className="mb-1.5 block text-sm font-medium"
									>
										Nombre
									</label>
									<Input
										id="equip-name"
										placeholder="Ej: Prensa Hidráulica"
										value={newEquipName}
										onChange={(e) => setNewEquipName(e.target.value)}
									/>
								</div>
								<div>
									<label
										htmlFor="equip-type"
										className="mb-1.5 block text-sm font-medium"
									>
										Tipo
									</label>
									<select
										id="equip-type"
										value={newEquipType}
										onChange={(e) => setNewEquipType(e.target.value)}
										className="w-full rounded-md border bg-background p-2 text-sm"
									>
										<option value="">Seleccionar...</option>
										<option value="Maquinaria Pesada">Maquinaria Pesada</option>
										<option value="Línea de Producción">
											Línea de Producción
										</option>
										<option value="Eléctricos">Eléctricos</option>
										<option value="HVAC">HVAC</option>
									</select>
								</div>
								<div>
									<label
										htmlFor="equip-area"
										className="mb-1.5 block text-sm font-medium"
									>
										Área
									</label>
									<select
										id="equip-area"
										value={newEquipArea}
										onChange={(e) => setNewEquipArea(e.target.value)}
										className="w-full rounded-md border bg-background p-2 text-sm"
									>
										<option value="">Seleccionar...</option>
										{areas.map((area) => (
											<option key={area} value={area}>
												{area}
											</option>
										))}
									</select>
								</div>
							</div>
							<Button variant="outline" size="sm" onClick={addEquipment}>
								<Plus className="size-4" />
								Agregar Equipo
							</Button>

							{equipment.length > 0 && (
								<div className="divide-y rounded-lg border">
									{equipment.map((item, index) => (
										<div
											key={`equip-${item.name}-${index}`}
											className="flex items-center justify-between gap-3 p-3"
										>
											<div className="flex items-center gap-3">
												<p className="text-sm font-medium">{item.name}</p>
												<span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
													{item.type}
												</span>
												<span className="text-xs text-muted-foreground">
													{item.area}
												</span>
											</div>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => removeEquipment(index)}
												className="shrink-0 text-muted-foreground hover:text-destructive"
											>
												<X className="size-4" />
											</Button>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				)}

				{/* Step 4: Integraciones */}
				{currentStep === 4 && (
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">Conecta tus equipos</CardTitle>
							<CardDescription>
								Configura la comunicación con tus dispositivos industriales
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-5">
							<div className="grid gap-4 sm:grid-cols-2">
								{[
									{
										key: "modbus" as const,
										name: "Modbus TCP",
										icon: PlugsConnected,
										description: "Protocolo estándar para equipos industriales",
										color: "text-blue-600 dark:text-blue-400",
										bg: "bg-blue-100 dark:bg-blue-900/30",
									},
									{
										key: "opcua" as const,
										name: "OPC-UA",
										icon: TreeStructure,
										description: "Comunicación unificada para automatización",
										color: "text-purple-600 dark:text-purple-400",
										bg: "bg-purple-100 dark:bg-purple-900/30",
									},
									{
										key: "mqtt" as const,
										name: "MQTT",
										icon: CloudArrowUp,
										description: "Mensajería ligera para IoT",
										color: "text-emerald-600 dark:text-emerald-400",
										bg: "bg-emerald-100 dark:bg-emerald-900/30",
									},
									{
										key: "bacnet" as const,
										name: "BACnet",
										icon: Buildings,
										description: "Automatización de edificios y HVAC",
										color: "text-orange-600 dark:text-orange-400",
										bg: "bg-orange-100 dark:bg-orange-900/30",
									},
								].map((proto) => (
									<div
										key={proto.key}
										className="flex items-center justify-between rounded-lg border p-4"
									>
										<div className="flex items-center gap-3">
											<div
												className={cn(
													"flex size-10 items-center justify-center rounded-lg",
													proto.bg,
												)}
											>
												<proto.icon
													className={cn("size-5", proto.color)}
													weight="duotone"
												/>
											</div>
											<div>
												<p className="text-sm font-medium">{proto.name}</p>
												<p className="text-xs text-muted-foreground">
													{proto.description}
												</p>
											</div>
										</div>
										<Switch
											checked={protocols[proto.key]}
											onCheckedChange={(checked) =>
												setProtocols({
													...protocols,
													[proto.key]: checked,
												})
											}
										/>
									</div>
								))}
							</div>
							<p className="text-xs text-muted-foreground">
								Soportamos equipos Danfoss, Siemens, ABB, Schneider y más
							</p>
							<div className="flex justify-center">
								<button
									type="button"
									onClick={handleNext}
									className="text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
								>
									Configurar después
								</button>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Step 5: Usuarios y Roles */}
				{currentStep === 5 && (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="text-xl">Invita a tu equipo</CardTitle>
								<CardDescription>
									Asigna roles según las responsabilidades
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
									{[
										{
											name: "Admin",
											description: "Control total del sistema",
											icon: Shield,
											color: "text-red-600 dark:text-red-400",
											bg: "bg-red-100 dark:bg-red-900/30",
										},
										{
											name: "Supervisor",
											description: "Gestión de equipo y aprobaciones",
											icon: UserCircleGear,
											color: "text-blue-600 dark:text-blue-400",
											bg: "bg-blue-100 dark:bg-blue-900/30",
										},
										{
											name: "Técnico",
											description: "Ejecución de mantenimiento",
											icon: Wrench,
											color: "text-amber-600 dark:text-amber-400",
											bg: "bg-amber-100 dark:bg-amber-900/30",
										},
										{
											name: "Operador",
											description: "Inspecciones y reportes",
											icon: Eye,
											color: "text-green-600 dark:text-green-400",
											bg: "bg-green-100 dark:bg-green-900/30",
										},
										{
											name: "Contratista",
											description: "Acceso limitado externo",
											icon: Buildings,
											color: "text-gray-600 dark:text-gray-400",
											bg: "bg-gray-100 dark:bg-gray-800/30",
										},
									].map((role) => (
										<div
											key={role.name}
											className="flex items-start gap-3 rounded-lg border p-3"
										>
											<div
												className={cn(
													"flex size-9 shrink-0 items-center justify-center rounded-lg",
													role.bg,
												)}
											>
												<role.icon
													className={cn("size-4", role.color)}
													weight="duotone"
												/>
											</div>
											<div>
												<p className="text-sm font-medium">{role.name}</p>
												<p className="text-xs text-muted-foreground">
													{role.description}
												</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Invitar usuario</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid gap-3 sm:grid-cols-2">
									<div>
										<label
											htmlFor="invite-email"
											className="mb-1.5 block text-sm font-medium"
										>
											Email
										</label>
										<Input
											id="invite-email"
											type="email"
											placeholder="correo@empresa.com"
											value={inviteEmail}
											onChange={(e) => setInviteEmail(e.target.value)}
										/>
									</div>
									<div>
										<label
											htmlFor="invite-role"
											className="mb-1.5 block text-sm font-medium"
										>
											Rol
										</label>
										<select
											id="invite-role"
											value={inviteRole}
											onChange={(e) => setInviteRole(e.target.value)}
											className="w-full rounded-md border bg-background p-2 text-sm"
										>
											<option value="">Seleccionar rol...</option>
											<option value="Admin">Admin</option>
											<option value="Supervisor">Supervisor</option>
											<option value="Técnico">Técnico</option>
											<option value="Operador">Operador</option>
											<option value="Contratista">Contratista</option>
										</select>
									</div>
								</div>
								<Button variant="outline" size="sm" onClick={sendInvite}>
									Enviar Invitación
								</Button>

								{invitedUsers.length > 0 && (
									<div className="divide-y rounded-lg border">
										{invitedUsers.map((user, index) => (
											<div
												key={`invited-${user.email}-${index}`}
												className="flex items-center justify-between gap-3 p-3"
											>
												<div>
													<p className="text-sm font-medium">{user.email}</p>
													<p className="text-xs text-muted-foreground">
														{user.role}
													</p>
												</div>
												<span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
													{user.status}
												</span>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				)}
			</div>

			{/* Bottom navigation bar */}
			<div className="fixed right-0 bottom-0 left-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
					<Button
						variant="outline"
						onClick={handlePrev}
						disabled={currentStep === 1}
					>
						Anterior
					</Button>
					<span className="text-sm text-muted-foreground">
						Paso {currentStep} de 5
					</span>
					<Button onClick={handleNext}>
						{currentStep === 5 ? "Comenzar" : "Siguiente"}
					</Button>
				</div>
			</div>
		</div>
	)
}
