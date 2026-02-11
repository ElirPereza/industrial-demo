"use client"

import {
	ArrowLeft,
	Camera,
	Check,
	Cube,
	Factory,
	Hash,
	MapPin,
	Trash,
	Upload,
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

const tiposEquipo = [
	{ value: "maquinaria-pesada", label: "Maquinaria Pesada", icon: Factory },
	{ value: "linea-produccion", label: "Línea de Producción", icon: Cube },
	{ value: "electricos", label: "Equipos Eléctricos", icon: Hash },
	{ value: "hvac", label: "HVAC / Climatización", icon: MapPin },
]

const estadosEquipo = [
	{ value: "operativo", label: "Operativo", color: "bg-green-500" },
	{ value: "mantenimiento", label: "En Mantenimiento", color: "bg-yellow-500" },
	{ value: "fuera-servicio", label: "Fuera de Servicio", color: "bg-red-500" },
]

export default function NuevoEquipoPage() {
	const router = useRouter()

	// Form state
	const [nombre, setNombre] = useState("")
	const [tipo, setTipo] = useState("")
	const [ubicacion, setUbicacion] = useState("")
	const [estado, setEstado] = useState("operativo")
	const [modelo, setModelo] = useState("")
	const [numeroSerie, setNumeroSerie] = useState("")
	const [fabricante, setFabricante] = useState("")
	const [descripcion, setDescripcion] = useState("")
	const [imagenes, setImagenes] = useState<string[]>([])

	// Validation
	const [errors, setErrors] = useState<Record<string, boolean>>({})

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files
		if (files) {
			Array.from(files).forEach((file) => {
				const reader = new FileReader()
				reader.onload = (ev) => {
					setImagenes((prev) => [...prev, ev.target?.result as string])
				}
				reader.readAsDataURL(file)
			})
		}
	}

	const handleRemoveImage = (index: number) => {
		setImagenes((prev) => prev.filter((_, i) => i !== index))
	}

	const handleSubmit = () => {
		const newErrors: Record<string, boolean> = {}

		if (!nombre.trim()) newErrors.nombre = true
		if (!tipo) newErrors.tipo = true
		if (!ubicacion.trim()) newErrors.ubicacion = true

		setErrors(newErrors)

		if (Object.keys(newErrors).length === 0) {
			// Success - would save to database in real app
			alert("Equipo creado exitosamente (simulado)")
			router.push("/equipos")
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
									<BreadcrumbLink href="/equipos">Equipos</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>Nuevo Equipo</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>

				<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
					{/* Back button */}
					<Button
						variant="ghost"
						className="w-fit"
						onClick={() => router.push("/equipos")}
					>
						<ArrowLeft className="mr-2 size-4" weight="bold" />
						Volver a Equipos
					</Button>

					<div>
						<h1 className="text-2xl font-semibold">Nuevo Equipo</h1>
						<p className="text-sm text-muted-foreground">
							Completa la información para registrar un nuevo equipo
						</p>
					</div>

					<div className="grid gap-6 lg:grid-cols-3">
						{/* Main Form */}
						<div className="space-y-6 lg:col-span-2">
							{/* Basic Info */}
							<Card>
								<CardHeader>
									<CardTitle>Información Básica</CardTitle>
									<CardDescription>
										Datos principales del equipo
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<label className="mb-1.5 block text-sm font-medium">
											Nombre del Equipo <span className="text-red-500">*</span>
										</label>
										<Input
											value={nombre}
											onChange={(e) => {
												setNombre(e.target.value)
												if (errors.nombre) {
													setErrors({ ...errors, nombre: false })
												}
											}}
											placeholder="Ej: Compresor Principal A-01"
											className={cn(
												errors.nombre && "border-red-500 ring-1 ring-red-500/20",
											)}
										/>
										{errors.nombre && (
											<p className="mt-1 text-xs text-red-500">
												El nombre es obligatorio
											</p>
										)}
									</div>

									<div>
										<label className="mb-1.5 block text-sm font-medium">
											Tipo de Equipo <span className="text-red-500">*</span>
										</label>
										<div className="grid grid-cols-2 gap-3">
											{tiposEquipo.map((t) => (
												<button
													key={t.value}
													type="button"
													onClick={() => {
														setTipo(t.value)
														if (errors.tipo) {
															setErrors({ ...errors, tipo: false })
														}
													}}
													className={cn(
														"flex items-center gap-3 rounded-lg border p-3 text-left transition-all",
														tipo === t.value
															? "border-primary bg-primary/5"
															: "hover:bg-muted",
														errors.tipo && "border-red-500",
													)}
												>
													<div
														className={cn(
															"flex size-10 items-center justify-center rounded-lg",
															tipo === t.value
																? "bg-primary text-primary-foreground"
																: "bg-muted",
														)}
													>
														<t.icon className="size-5" weight="duotone" />
													</div>
													<span className="text-sm font-medium">{t.label}</span>
												</button>
											))}
										</div>
										{errors.tipo && (
											<p className="mt-1 text-xs text-red-500">
												Selecciona un tipo de equipo
											</p>
										)}
									</div>

									<div>
										<label className="mb-1.5 block text-sm font-medium">
											Ubicación <span className="text-red-500">*</span>
										</label>
										<Input
											value={ubicacion}
											onChange={(e) => {
												setUbicacion(e.target.value)
												if (errors.ubicacion) {
													setErrors({ ...errors, ubicacion: false })
												}
											}}
											placeholder="Ej: Planta A - Sector 3"
											className={cn(
												errors.ubicacion &&
													"border-red-500 ring-1 ring-red-500/20",
											)}
										/>
										{errors.ubicacion && (
											<p className="mt-1 text-xs text-red-500">
												La ubicación es obligatoria
											</p>
										)}
									</div>

									<div>
										<label className="mb-1.5 block text-sm font-medium">
											Estado Inicial
										</label>
										<div className="flex gap-2">
											{estadosEquipo.map((e) => (
												<button
													key={e.value}
													type="button"
													onClick={() => setEstado(e.value)}
													className={cn(
														"flex items-center gap-2 rounded-lg border px-4 py-2 transition-all",
														estado === e.value
															? "border-primary bg-primary/5"
															: "hover:bg-muted",
													)}
												>
													<div className={cn("size-2 rounded-full", e.color)} />
													<span className="text-sm">{e.label}</span>
												</button>
											))}
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Technical Info */}
							<Card>
								<CardHeader>
									<CardTitle>Información Técnica</CardTitle>
									<CardDescription>
										Datos adicionales del equipo (opcional)
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid gap-4 sm:grid-cols-2">
										<div>
											<label className="mb-1.5 block text-sm font-medium">
												Fabricante
											</label>
											<Input
												value={fabricante}
												onChange={(e) => setFabricante(e.target.value)}
												placeholder="Ej: Caterpillar"
											/>
										</div>
										<div>
											<label className="mb-1.5 block text-sm font-medium">
												Modelo
											</label>
											<Input
												value={modelo}
												onChange={(e) => setModelo(e.target.value)}
												placeholder="Ej: CAT-3500"
											/>
										</div>
									</div>
									<div>
										<label className="mb-1.5 block text-sm font-medium">
											Número de Serie
										</label>
										<Input
											value={numeroSerie}
											onChange={(e) => setNumeroSerie(e.target.value)}
											placeholder="Ej: SN-2024-001234"
										/>
									</div>
									<div>
										<label className="mb-1.5 block text-sm font-medium">
											Descripción / Notas
										</label>
										<textarea
											value={descripcion}
											onChange={(e) => setDescripcion(e.target.value)}
											className="w-full rounded-md border bg-background p-3 text-sm"
											rows={4}
											placeholder="Información adicional sobre el equipo..."
										/>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Images Panel */}
						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Camera className="size-5" weight="duotone" />
										Imágenes del Equipo
									</CardTitle>
									<CardDescription>
										Sube fotos para identificar el equipo
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									{/* Upload Zone */}
									<label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 transition-colors hover:bg-muted/50">
										<div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
											<Upload
												className="size-6 text-primary"
												weight="duotone"
											/>
										</div>
										<div className="text-center">
											<p className="text-sm font-medium">
												Arrastra imágenes aquí
											</p>
											<p className="text-xs text-muted-foreground">
												o haz clic para seleccionar
											</p>
										</div>
										<input
											type="file"
											accept="image/*"
											multiple
											className="hidden"
											onChange={handleImageUpload}
										/>
									</label>

									{/* Image Preview */}
									{imagenes.length > 0 && (
										<div className="space-y-3">
											<p className="text-sm font-medium">
												{imagenes.length} imagen(es) seleccionada(s)
											</p>
											<div className="grid grid-cols-2 gap-2">
												{imagenes.map((img, index) => (
													<div key={index} className="group relative">
														<img
															src={img}
															alt={`Equipo ${index + 1}`}
															className="aspect-square w-full rounded-lg object-cover"
														/>
														<button
															type="button"
															onClick={() => handleRemoveImage(index)}
															className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
														>
															<Trash className="size-3" weight="bold" />
														</button>
													</div>
												))}
											</div>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Actions */}
							<Card>
								<CardContent className="p-4">
									<div className="space-y-3">
										<Button className="w-full" onClick={handleSubmit}>
											<Check className="mr-2 size-4" weight="bold" />
											Crear Equipo
										</Button>
										<Button
											variant="outline"
											className="w-full"
											onClick={() => router.push("/equipos")}
										>
											Cancelar
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
