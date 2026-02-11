"use client"

import {
	ArrowLeft,
	Buildings,
	CalendarBlank,
	Check,
	EnvelopeSimple,
	FileText,
	Phone,
	User,
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

const especialidades = [
	{
		value: "electrico",
		label: "Mantenimiento Eléctrico",
		icon: "⚡",
	},
	{
		value: "hvac",
		label: "HVAC y Refrigeración",
		icon: "❄️",
	},
	{
		value: "maquinaria",
		label: "Maquinaria Pesada",
		icon: "🏗️",
	},
	{
		value: "control",
		label: "Sistemas de Control",
		icon: "🖥️",
	},
	{
		value: "soldadura",
		label: "Soldadura Industrial",
		icon: "🔥",
	},
	{
		value: "hidraulica",
		label: "Hidráulica y Neumática",
		icon: "💧",
	},
	{
		value: "instrumentacion",
		label: "Instrumentación",
		icon: "📊",
	},
	{
		value: "civil",
		label: "Obra Civil",
		icon: "🧱",
	},
]

export default function NuevoContratistaPage() {
	const router = useRouter()

	// Company info
	const [nombreEmpresa, setNombreEmpresa] = useState("")
	const [nit, setNit] = useState("")
	const [direccion, setDireccion] = useState("")

	// Contact info
	const [contacto, setContacto] = useState("")
	const [email, setEmail] = useState("")
	const [telefono, setTelefono] = useState("")

	// Specialty
	const [especialidad, setEspecialidad] = useState("")

	// Contract
	const [fechaInicio, setFechaInicio] = useState("")
	const [fechaFin, setFechaFin] = useState("")
	const [activo, setActivo] = useState(true)

	// Documents
	const [documentos, setDocumentos] = useState<string[]>([])

	const [errors, setErrors] = useState<Record<string, boolean>>({})

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files
		if (files) {
			const newDocs = Array.from(files).map((f) => f.name)
			setDocumentos([...documentos, ...newDocs])
		}
	}

	const removeDocument = (index: number) => {
		setDocumentos(documentos.filter((_, i) => i !== index))
	}

	const handleSubmit = () => {
		const newErrors: Record<string, boolean> = {}

		if (!nombreEmpresa.trim()) newErrors.nombreEmpresa = true
		if (!contacto.trim()) newErrors.contacto = true
		if (!email.trim() || !email.includes("@")) newErrors.email = true
		if (!especialidad) newErrors.especialidad = true
		if (!fechaInicio) newErrors.fechaInicio = true
		if (!fechaFin) newErrors.fechaFin = true

		setErrors(newErrors)

		if (Object.keys(newErrors).length === 0) {
			alert("Contratista registrado exitosamente (simulado)")
			router.push("/contratistas")
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
									<BreadcrumbLink href="/contratistas">
										Contratistas
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>Nuevo Contratista</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>

				<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
					<Button
						variant="ghost"
						className="w-fit"
						onClick={() => router.push("/contratistas")}
					>
						<ArrowLeft className="mr-2 size-4" weight="bold" />
						Volver a Contratistas
					</Button>

					<div>
						<h1 className="text-2xl font-semibold">Nuevo Contratista</h1>
						<p className="text-sm text-muted-foreground">
							Registra un nuevo contratista externo en el sistema
						</p>
					</div>

					<div className="grid gap-6 lg:grid-cols-3">
						<div className="space-y-6 lg:col-span-2">
							{/* Company Info */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Buildings className="size-5" weight="duotone" />
										Información de la Empresa
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<label htmlFor="nombreEmpresa" className="mb-1.5 block text-sm font-medium">
											Nombre de la Empresa <span className="text-red-500">*</span>
										</label>
										<Input
											id="nombreEmpresa"
											value={nombreEmpresa}
											onChange={(e) => {
												setNombreEmpresa(e.target.value)
												if (errors.nombreEmpresa)
													setErrors({ ...errors, nombreEmpresa: false })
											}}
											placeholder="Ej: Servicios Industriales del Norte"
											className={cn(
												errors.nombreEmpresa &&
													"border-red-500 ring-1 ring-red-500/20",
											)}
										/>
									</div>
									<div className="grid gap-4 sm:grid-cols-2">
										<div>
											<label htmlFor="nit" className="mb-1.5 block text-sm font-medium">
												NIT / Identificación Fiscal
											</label>
											<Input
												id="nit"
												value={nit}
												onChange={(e) => setNit(e.target.value)}
												placeholder="Ej: 900.123.456-7"
											/>
										</div>
										<div>
											<label htmlFor="direccion" className="mb-1.5 block text-sm font-medium">
												Dirección
											</label>
											<Input
												id="direccion"
												value={direccion}
												onChange={(e) => setDireccion(e.target.value)}
												placeholder="Ej: Calle 123 #45-67, Bogotá"
											/>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Contact Info */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<User className="size-5" weight="duotone" />
										Información de Contacto
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<label htmlFor="contacto" className="mb-1.5 block text-sm font-medium">
											Persona de Contacto <span className="text-red-500">*</span>
										</label>
										<Input
											id="contacto"
											value={contacto}
											onChange={(e) => {
												setContacto(e.target.value)
												if (errors.contacto)
													setErrors({ ...errors, contacto: false })
											}}
											placeholder="Ej: Roberto Gómez"
											className={cn(
												errors.contacto &&
													"border-red-500 ring-1 ring-red-500/20",
											)}
										/>
									</div>
									<div className="grid gap-4 sm:grid-cols-2">
										<div>
											<label htmlFor="email" className="mb-1.5 block text-sm font-medium">
												Email <span className="text-red-500">*</span>
											</label>
											<div className="relative">
												<EnvelopeSimple className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
												<Input
													id="email"
													type="email"
													value={email}
													onChange={(e) => {
														setEmail(e.target.value)
														if (errors.email)
															setErrors({ ...errors, email: false })
													}}
													placeholder="contacto@empresa.com"
													className={cn(
														"pl-9",
														errors.email &&
															"border-red-500 ring-1 ring-red-500/20",
													)}
												/>
											</div>
										</div>
										<div>
											<label htmlFor="telefono" className="mb-1.5 block text-sm font-medium">
												Teléfono
											</label>
											<div className="relative">
												<Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
												<Input
													id="telefono"
													value={telefono}
													onChange={(e) => setTelefono(e.target.value)}
													placeholder="+57 310 555 1234"
													className="pl-9"
												/>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Specialty */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Wrench className="size-5" weight="duotone" />
										Especialidad
									</CardTitle>
									<CardDescription>
										Selecciona el área de especialización del contratista
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
										{especialidades.map((e) => (
											<button
												key={e.value}
												type="button"
												onClick={() => {
													setEspecialidad(e.value)
													if (errors.especialidad)
														setErrors({ ...errors, especialidad: false })
												}}
												className={cn(
													"flex items-center gap-3 rounded-lg border p-3 text-left transition-all",
													especialidad === e.value
														? "border-primary bg-primary/5 ring-2 ring-primary"
														: "hover:bg-muted",
													errors.especialidad && "border-red-500",
												)}
											>
												<span className="text-xl">{e.icon}</span>
												<span className="text-sm font-medium">{e.label}</span>
											</button>
										))}
									</div>
									{errors.especialidad && (
										<p className="mt-2 text-xs text-red-500">
											Selecciona una especialidad
										</p>
									)}
								</CardContent>
							</Card>

							{/* Contract Dates */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<CalendarBlank className="size-5" weight="duotone" />
										Vigencia del Contrato
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid gap-4 sm:grid-cols-2">
										<div>
											<label htmlFor="fechaInicio" className="mb-1.5 block text-sm font-medium">
												Fecha de Inicio <span className="text-red-500">*</span>
											</label>
											<Input
												id="fechaInicio"
												type="date"
												value={fechaInicio}
												onChange={(e) => {
													setFechaInicio(e.target.value)
													if (errors.fechaInicio)
														setErrors({ ...errors, fechaInicio: false })
												}}
												className={cn(
													errors.fechaInicio &&
														"border-red-500 ring-1 ring-red-500/20",
												)}
											/>
										</div>
										<div>
											<label htmlFor="fechaFin" className="mb-1.5 block text-sm font-medium">
												Fecha de Fin <span className="text-red-500">*</span>
											</label>
											<Input
												id="fechaFin"
												type="date"
												value={fechaFin}
												onChange={(e) => {
													setFechaFin(e.target.value)
													if (errors.fechaFin)
														setErrors({ ...errors, fechaFin: false })
												}}
												className={cn(
													errors.fechaFin &&
														"border-red-500 ring-1 ring-red-500/20",
												)}
											/>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Sidebar */}
						<div className="space-y-6">
							{/* Documents */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<FileText className="size-5" weight="duotone" />
										Documentos
									</CardTitle>
									<CardDescription>
										Certificaciones, pólizas, permisos
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<label
											htmlFor="file-upload"
											className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary hover:bg-muted/50"
										>
											<FileText className="mb-2 size-8 text-muted-foreground" />
											<span className="text-sm font-medium">Subir archivos</span>
											<span className="text-xs text-muted-foreground">
												PDF, JPG, PNG (máx. 10MB)
											</span>
										</label>
										<input
											id="file-upload"
											type="file"
											multiple
											accept=".pdf,.jpg,.jpeg,.png"
											className="hidden"
											onChange={handleFileUpload}
										/>
									</div>
									{documentos.length > 0 && (
										<div className="space-y-2">
											{documentos.map((doc) => (
												<div
													key={doc}
													className="flex items-center justify-between rounded-md bg-muted p-2 text-sm"
												>
													<div className="flex items-center gap-2 truncate">
														<FileText className="size-4 shrink-0" />
														<span className="truncate">{doc}</span>
													</div>
													<Button
														variant="ghost"
														size="icon-sm"
														onClick={() => setDocumentos(documentos.filter((d) => d !== doc))}
													>
														×
													</Button>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>

							{/* Status */}
							<Card>
								<CardHeader>
									<CardTitle>Estado</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium">Contratista Activo</p>
											<p className="text-xs text-muted-foreground">
												Disponible para asignaciones
											</p>
										</div>
										<Switch checked={activo} onCheckedChange={setActivo} />
									</div>
								</CardContent>
							</Card>

							{/* Actions */}
							<Card>
								<CardContent className="space-y-3 p-4">
									<Button className="w-full" onClick={handleSubmit}>
										<Check className="mr-2 size-4" weight="bold" />
										Registrar Contratista
									</Button>
									<Button
										variant="outline"
										className="w-full"
										onClick={() => router.push("/contratistas")}
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
