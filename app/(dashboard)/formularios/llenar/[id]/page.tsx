"use client"

import {
	CalendarBlank,
	Check,
	Eraser,
	MapPin,
	User,
} from "@phosphor-icons/react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useRef, useState } from "react"
import SignatureCanvas from "react-signature-canvas"
import { toast } from "sonner"
import {
	type FormularioTemplate,
	getFormularioById,
} from "@/app/(dashboard)/formularios/actions"
import {
	type CampoRespuesta,
	submitFormulario,
} from "@/app/(dashboard)/formularios/envios-actions"
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type CampoTemplate = NonNullable<FormularioTemplate["campos"]>[number]
type CampoValor = string | string[] | number | boolean | null

const isEmptyValue = (value: CampoValor) => {
	if (value === null) return true
	if (value === "") return true
	if (Array.isArray(value)) return value.length === 0
	return false
}

function FormFillPageContent() {
	const params = useParams<{ id: string }>()
	const searchParams = useSearchParams()
	const router = useRouter()
	const signatureRefs = useRef<Record<string, SignatureCanvas | null>>({})

	const formularioId = params.id
	const equipoId = searchParams.get("equipo") ?? ""

	const [formulario, setFormulario] = useState<FormularioTemplate | null>(null)
	const [formData, setFormData] = useState<Record<string, CampoValor>>({})
	const [errors, setErrors] = useState<Record<string, boolean>>({})
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)

	useEffect(() => {
		async function loadFormulario() {
			setLoading(true)
			const result = await getFormularioById(formularioId)
			if (!result.success) {
				toast.error(result.error)
				setLoading(false)
				return
			}
			setFormulario(result.data)
			setLoading(false)
		}

		loadFormulario()
	}, [formularioId])

	const updateFieldValue = (campoId: string, value: CampoValor) => {
		setFormData((prev) => ({ ...prev, [campoId]: value }))
		if (errors[campoId]) {
			setErrors((prev) => ({ ...prev, [campoId]: false }))
		}
	}

	const handleClearSignature = (campoId: string) => {
		signatureRefs.current[campoId]?.clear()
		updateFieldValue(campoId, null)
	}

	const renderField = (campo: CampoTemplate) => {
		const value = formData[campo.id]

		if (campo.tipo === "texto_corto") {
			return (
				<Input
					value={typeof value === "string" ? value : ""}
					onChange={(e) => updateFieldValue(campo.id, e.target.value)}
					className={cn(
						errors[campo.id] && "border-red-500 ring-1 ring-red-500/20",
					)}
					placeholder={campo.placeholder || "Ingrese el texto"}
				/>
			)
		}

		if (campo.tipo === "texto_largo") {
			return (
				<Textarea
					value={typeof value === "string" ? value : ""}
					onChange={(e) => updateFieldValue(campo.id, e.target.value)}
					className={cn(
						errors[campo.id] && "border-red-500 ring-1 ring-red-500/20",
					)}
					rows={4}
					placeholder={campo.placeholder || "Ingrese el texto"}
				/>
			)
		}

		if (campo.tipo === "numerico") {
			const numericValue =
				typeof value === "number"
					? String(value)
					: typeof value === "string"
						? value
						: ""
			return (
				<Input
					type="number"
					value={numericValue}
					onChange={(e) => updateFieldValue(campo.id, e.target.value)}
					className={cn(
						errors[campo.id] && "border-red-500 ring-1 ring-red-500/20",
					)}
					placeholder={campo.placeholder || "Ingrese el número"}
				/>
			)
		}

		if (campo.tipo === "fecha") {
			return (
				<Input
					type="date"
					value={typeof value === "string" ? value : ""}
					onChange={(e) => updateFieldValue(campo.id, e.target.value)}
					className={cn(
						errors[campo.id] && "border-red-500 ring-1 ring-red-500/20",
					)}
				/>
			)
		}

		if (campo.tipo === "seleccion_unica") {
			return (
				<Select
					value={typeof value === "string" ? value : ""}
					onValueChange={(selected) => updateFieldValue(campo.id, selected)}
				>
					<SelectTrigger
						className={cn(
							"w-full",
							errors[campo.id] && "border-red-500 ring-1 ring-red-500/20",
						)}
					>
						<SelectValue placeholder="Seleccione una opción" />
					</SelectTrigger>
					<SelectContent>
						{(campo.opciones ?? []).map((opcion) => (
							<SelectItem key={opcion} value={opcion}>
								{opcion}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)
		}

		if (campo.tipo === "seleccion_multiple") {
			const selectedValues = Array.isArray(value) ? value : []
			return (
				<div
					className={cn(
						"space-y-2 rounded-md border p-3",
						errors[campo.id] && "border-red-500 ring-1 ring-red-500/20",
					)}
				>
					{(campo.opciones ?? []).map((opcion) => (
						<label key={opcion} className="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								checked={selectedValues.includes(opcion)}
								onChange={(e) => {
									if (e.target.checked) {
										updateFieldValue(campo.id, [...selectedValues, opcion])
									} else {
										updateFieldValue(
											campo.id,
											selectedValues.filter((entry) => entry !== opcion),
										)
									}
								}}
								className="size-4 rounded border"
							/>
							{opcion}
						</label>
					))}
				</div>
			)
		}

		if (campo.tipo === "firma") {
			return (
				<div>
					<div
						className={cn(
							"rounded-lg border-2 bg-white",
							errors[campo.id] && "border-red-500 ring-1 ring-red-500/20",
						)}
					>
						<SignatureCanvas
							ref={(ref) => {
								signatureRefs.current[campo.id] = ref
							}}
							canvasProps={{
								className: "w-full h-40 rounded-lg",
							}}
							onEnd={() => {
								const signatureData =
									signatureRefs.current[campo.id]?.toDataURL() ?? null
								updateFieldValue(campo.id, signatureData)
							}}
						/>
					</div>
					<div className="mt-2 flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleClearSignature(campo.id)}
						>
							<Eraser className="mr-2 size-4" weight="duotone" />
							Limpiar
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								if (!signatureRefs.current[campo.id]?.isEmpty()) {
									const signatureData =
										signatureRefs.current[campo.id]?.toDataURL() ?? null
									updateFieldValue(campo.id, signatureData)
								}
							}}
						>
							<Check className="mr-2 size-4" weight="duotone" />
							Confirmar
						</Button>
					</div>
				</div>
			)
		}

		if (campo.tipo === "foto") {
			return (
				<div>
					<Input
						type="file"
						accept="image/*"
						onChange={(e) => {
							const file = e.target.files?.[0]
							updateFieldValue(campo.id, file ? file.name : null)
						}}
						className={cn(
							errors[campo.id] && "border-red-500 ring-1 ring-red-500/20",
						)}
					/>
					{typeof value === "string" && value.length > 0 && (
						<p className="mt-2 text-xs text-muted-foreground">
							Archivo: {value}
						</p>
					)}
				</div>
			)
		}

		return null
	}

	const handleSubmit = async () => {
		if (!formulario || submitting) return
		if (!equipoId) {
			toast.error("Falta el contexto del equipo")
			return
		}

		const requiredIds = (formulario.campos ?? [])
			.filter((campo) => campo.requerido)
			.map((campo) => campo.id)

		const newErrors: Record<string, boolean> = {}
		for (const campoId of requiredIds) {
			if (isEmptyValue(formData[campoId] ?? null)) {
				newErrors[campoId] = true
			}
		}

		setErrors(newErrors)
		if (Object.keys(newErrors).length > 0) {
			toast.error("Completa los campos requeridos")
			return
		}

		setSubmitting(true)

		const respuestas: CampoRespuesta[] = (formulario.campos ?? []).map(
			(campo) => {
				const rawValue = formData[campo.id] ?? null

				if (campo.tipo === "numerico") {
					if (rawValue === null || rawValue === "") {
						return { idCampo: campo.id, valor: null }
					}
					const parsed = Number(rawValue)
					return {
						idCampo: campo.id,
						valor: Number.isNaN(parsed) ? null : parsed,
					}
				}

				return { idCampo: campo.id, valor: rawValue }
			},
		)

		const result = await submitFormulario({
			formulario_id: formulario.id,
			equipo_id: equipoId,
			respuestas,
			campos_requeridos: requiredIds,
		})

		if (!result.success) {
			toast.error(result.error)
			setSubmitting(false)
			return
		}

		toast.success("Formulario enviado")
		router.push(`/equipos/${equipoId}`)
		setSubmitting(false)
	}

	if (loading) {
		return (
			<SidebarInset>
				<div className="flex h-full items-center justify-center p-8">
					<p className="animate-pulse text-sm text-muted-foreground">
						Cargando formulario...
					</p>
				</div>
			</SidebarInset>
		)
	}

	if (!formulario) {
		return (
			<SidebarInset>
				<div className="flex min-h-screen items-center justify-center">
					<div className="text-center">
						<h1 className="text-2xl font-semibold">Formulario no encontrado</h1>
						<Button
							className="mt-4"
							onClick={() => router.push("/formularios")}
						>
							Volver a Formularios
						</Button>
					</div>
				</div>
			</SidebarInset>
		)
	}

	const currentDate = new Date()

	return (
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
								<BreadcrumbLink href="/formularios">Formularios</BreadcrumbLink>
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
									<p className="text-sm font-medium">Usuario autenticado</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
									<CalendarBlank className="size-5" weight="duotone" />
								</div>
								<div>
									<p className="text-xs text-muted-foreground">Fecha y Hora</p>
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
									<p className="text-xs text-muted-foreground">Equipo</p>
									<p className="text-sm font-medium">
										{equipoId || "Sin equipo"}
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-base">Campos del Formulario</CardTitle>
						<CardDescription>
							Los campos marcados con <span className="text-red-600">*</span>{" "}
							son obligatorios
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{(formulario.campos ?? []).map((campo) => (
							<div key={campo.id}>
								<div className="mb-2 text-sm font-medium">
									{campo.label}
									{campo.requerido && (
										<span className="ml-1 text-red-600">*</span>
									)}
								</div>

								{renderField(campo)}

								{errors[campo.id] && (
									<p className="mt-1 text-xs text-red-600">
										Este campo es obligatorio
									</p>
								)}
							</div>
						))}
					</CardContent>
				</Card>

				<div className="flex justify-end gap-2">
					<Button variant="outline" onClick={() => router.push("/formularios")}>
						Cancelar
					</Button>
					<Button onClick={handleSubmit} disabled={submitting}>
						<Check className="mr-2 size-4" weight="bold" />
						{submitting ? "Enviando..." : "Enviar Formulario"}
					</Button>
				</div>
			</div>
		</SidebarInset>
	)
}

export default function FormFillPage() {
	return (
		<Suspense
			fallback={
				<SidebarInset>
					<div className="flex h-full items-center justify-center p-8">
						<p className="animate-pulse text-sm text-muted-foreground">
							Cargando formulario...
						</p>
					</div>
				</SidebarInset>
			}
		>
			<FormFillPageContent />
		</Suspense>
	)
}
