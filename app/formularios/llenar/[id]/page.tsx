"use client"

import {
	CalendarBlank,
	Check,
	Eraser,
	MapPin,
	Upload,
	User,
} from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { use, useRef, useState } from "react"
import SignatureCanvas from "react-signature-canvas"
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
import { formulariosTemplate, usuarios } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export default function FormFillPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id: formularioId } = use(params)
	const router = useRouter()
	const signatureRef = useRef<SignatureCanvas>(null)

	const formulario = formulariosTemplate.find((f) => f.id === formularioId)
	const [formData, setFormData] = useState<Record<string, string>>({})
	const [errors, setErrors] = useState<Record<string, boolean>>({})
	const [signatureEmpty, setSignatureEmpty] = useState(true)

	if (!formulario) {
		return (
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<div className="flex min-h-screen items-center justify-center">
						<div className="text-center">
							<h1 className="text-2xl font-semibold">
								Formulario no encontrado
							</h1>
							<Button
								className="mt-4"
								onClick={() => router.push("/formularios")}
							>
								Volver a Formularios
							</Button>
						</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
		)
	}

	const handleClearSignature = () => {
		signatureRef.current?.clear()
		setSignatureEmpty(true)
	}

	const handleSubmit = () => {
		const newErrors: Record<string, boolean> = {}

		// Validate required fields
		formulario.campos.forEach((campo) => {
			if (campo.requerido) {
				if (campo.tipo === "firma") {
					if (signatureEmpty) {
						newErrors[campo.id] = true
					}
				} else if (!formData[campo.id] || formData[campo.id].trim() === "") {
					newErrors[campo.id] = true
				}
			}
		})

		setErrors(newErrors)

		if (Object.keys(newErrors).length === 0) {
			// Success
			alert("Formulario enviado exitosamente (simulado)")
			router.push("/formularios")
		}
	}

	const currentUser = usuarios[0] // Mock current user
	const currentDate = new Date()

	return (
		<SidebarProvider>
			<AppSidebar />
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
									<BreadcrumbLink href="/formularios">
										Formularios
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>Diligenciar</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>

				<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
					<div>
						<h1 className="text-2xl font-semibold">{formulario.nombre}</h1>
						<p className="text-sm text-muted-foreground">
							{formulario.descripcion}
						</p>
					</div>

					{/* Metadata Section */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Información del Envío</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 md:grid-cols-3">
								<div className="flex items-center gap-3">
									<div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
										<User className="size-5" weight="duotone" />
									</div>
									<div>
										<p className="text-xs text-muted-foreground">Usuario</p>
										<p className="text-sm font-medium">{currentUser.nombre}</p>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<div className="flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
										<CalendarBlank className="size-5" weight="duotone" />
									</div>
									<div>
										<p className="text-xs text-muted-foreground">
											Fecha y Hora
										</p>
										<p className="text-sm font-medium">
											{currentDate.toLocaleDateString("es-ES", {
												day: "2-digit",
												month: "short",
												year: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<div className="flex size-10 items-center justify-center rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
										<MapPin className="size-5" weight="duotone" />
									</div>
									<div>
										<p className="text-xs text-muted-foreground">Ubicación</p>
										<p className="text-sm font-medium">
											Planta Principal (mock)
										</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Form Fields */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Campos del Formulario</CardTitle>
							<CardDescription>
								Los campos marcados con <span className="text-red-600">*</span>{" "}
								son obligatorios
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{formulario.campos.map((campo) => (
								<div key={campo.id}>
									<div className="mb-2 text-sm font-medium">
										{campo.nombre}
										{campo.requerido && (
											<span className="ml-1 text-red-600">*</span>
										)}
									</div>

									{campo.tipo === "texto-corto" && (
										<Input
											value={formData[campo.id] || ""}
											onChange={(e) => {
												setFormData({ ...formData, [campo.id]: e.target.value })
												if (errors[campo.id]) {
													setErrors({ ...errors, [campo.id]: false })
												}
											}}
											className={cn(
												errors[campo.id] &&
													"border-red-500 ring-1 ring-red-500/20",
											)}
											placeholder="Ingrese el texto"
										/>
									)}

									{campo.tipo === "texto-largo" && (
										<textarea
											value={formData[campo.id] || ""}
											onChange={(e) => {
												setFormData({ ...formData, [campo.id]: e.target.value })
												if (errors[campo.id]) {
													setErrors({ ...errors, [campo.id]: false })
												}
											}}
											className={cn(
												"w-full rounded-none border p-2 text-xs",
												errors[campo.id] &&
													"border-red-500 ring-1 ring-red-500/20",
											)}
											rows={4}
											placeholder="Ingrese el texto"
										/>
									)}

									{campo.tipo === "numerico" && (
										<Input
											type="number"
											value={formData[campo.id] || ""}
											onChange={(e) => {
												setFormData({ ...formData, [campo.id]: e.target.value })
												if (errors[campo.id]) {
													setErrors({ ...errors, [campo.id]: false })
												}
											}}
											className={cn(
												errors[campo.id] &&
													"border-red-500 ring-1 ring-red-500/20",
											)}
											placeholder="Ingrese el número"
										/>
									)}

									{campo.tipo === "fecha" && (
										<Input
											type="date"
											value={formData[campo.id] || ""}
											onChange={(e) => {
												setFormData({ ...formData, [campo.id]: e.target.value })
												if (errors[campo.id]) {
													setErrors({ ...errors, [campo.id]: false })
												}
											}}
											className={cn(
												errors[campo.id] &&
													"border-red-500 ring-1 ring-red-500/20",
											)}
										/>
									)}

									{campo.tipo === "seleccion-unica" && (
										<select
											value={formData[campo.id] || ""}
											onChange={(e) => {
												setFormData({ ...formData, [campo.id]: e.target.value })
												if (errors[campo.id]) {
													setErrors({ ...errors, [campo.id]: false })
												}
											}}
											className={cn(
												"w-full rounded-none border p-2 text-xs",
												errors[campo.id] &&
													"border-red-500 ring-1 ring-red-500/20",
											)}
										>
											<option value="">Seleccione una opción</option>
											{campo.opciones?.map((opcion) => (
												<option key={opcion} value={opcion}>
													{opcion}
												</option>
											))}
										</select>
									)}

									{campo.tipo === "firma" && (
										<div>
											<div
												className={cn(
													"rounded-lg border-2 bg-white",
													errors[campo.id] &&
														"border-red-500 ring-1 ring-red-500/20",
												)}
											>
												<SignatureCanvas
													ref={signatureRef}
													canvasProps={{
														className: "w-full h-40 rounded-lg",
													}}
													onBegin={() => setSignatureEmpty(false)}
												/>
											</div>
											<div className="mt-2 flex gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={handleClearSignature}
												>
													<Eraser className="mr-2 size-4" weight="duotone" />
													Limpiar
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														if (!signatureRef.current?.isEmpty()) {
															setSignatureEmpty(false)
															if (errors[campo.id]) {
																setErrors({ ...errors, [campo.id]: false })
															}
														}
													}}
												>
													<Check className="mr-2 size-4" weight="duotone" />
													Confirmar
												</Button>
											</div>
										</div>
									)}

									{campo.tipo === "foto" && (
										<div>
											<div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed bg-muted/30">
												<div className="text-center">
													<Upload
														className="mx-auto size-8 text-muted-foreground"
														weight="duotone"
													/>
													<p className="mt-2 text-sm text-muted-foreground">
														Haga clic para cargar una foto
													</p>
													<input
														type="file"
														accept="image/*"
														className="hidden"
														onChange={(e) => {
															if (e.target.files?.[0]) {
																setFormData({
																	...formData,
																	[campo.id]: e.target.files[0].name,
																})
																if (errors[campo.id]) {
																	setErrors({ ...errors, [campo.id]: false })
																}
															}
														}}
													/>
												</div>
											</div>
											{formData[campo.id] && (
												<p className="mt-2 text-xs text-muted-foreground">
													Archivo: {formData[campo.id]}
												</p>
											)}
										</div>
									)}

									{errors[campo.id] && (
										<p className="mt-1 text-xs text-red-600">
											Este campo es obligatorio
										</p>
									)}
								</div>
							))}
						</CardContent>
					</Card>

					{/* Submit Button */}
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => router.push("/formularios")}
						>
							Cancelar
						</Button>
						<Button onClick={handleSubmit}>
							<Check className="mr-2 size-4" weight="bold" />
							Enviar Formulario
						</Button>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
