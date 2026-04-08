"use client"

import {
	CalendarBlank,
	Check,
	ClipboardText,
	Eraser,
	MapPin,
	Upload,
	User,
	Warning,
	ArrowRight,
} from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { use, useEffect, useRef, useState } from "react"
import SignatureCanvas from "react-signature-canvas"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/lib/supabase/types"
import { mapFormTemplateRow, mapEquipoRow } from "@/lib/data-mappers"
import type { CampoRespuesta, Equipo, FormTemplate } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function PublicFormPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id: formularioId } = use(params)
	const router = useRouter()
	const signatureRef = useRef<SignatureCanvas>(null)
	const supabase = createClient()

	const [formulario, setFormulario] = useState<FormTemplate | null>(null)
	const [equipos, setEquipos] = useState<Equipo[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [user, setUser] = useState<{ id: string; email: string } | null>(null)
	const [profileName, setProfileName] = useState<string | null>(null)
	const [orgId, setOrgId] = useState<string | null>(null)

	const [formData, setFormData] = useState<Record<string, string>>({})
	const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({})
	const [signatureEmpty, setSignatureEmpty] = useState(true)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [submitError, setSubmitError] = useState<string | null>(null)
	const [submitSuccess, setSubmitSuccess] = useState(false)

	useEffect(() => {
		const load = async () => {
			const { data: templateRow } = await supabase
				.from("form_templates")
				.select("*")
				.eq("id", formularioId)
				.single()

			if (!templateRow) {
				setError("Formulario no encontrado")
				setIsLoading(false)
				return
			}

			setFormulario(
				mapFormTemplateRow(templateRow as unknown as Tables<"form_templates">),
			)

			const { data: equipoRows } = await supabase.from("equipos").select("*")

			setEquipos(
				(equipoRows ?? []).map((r) =>
					mapEquipoRow(r as unknown as Tables<"equipos">),
				),
			)

			const {
				data: { user: authUser },
			} = await supabase.auth.getUser()

			if (authUser) {
				setUser({ id: authUser.id, email: authUser.email ?? "" })
				const { data: profile } = await supabase
					.from("profiles")
					.select("nombre, id_organizacion")
					.eq("id", authUser.id)
					.single()
				if (profile) {
					setProfileName(profile.nombre)
					setOrgId(profile.id_organizacion)
				}
			}

			setIsLoading(false)
		}
		void load()
	}, [formularioId])

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-muted/30">
				<div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
			</div>
		)
	}

	if (error || !formulario) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30 p-4">
				<Warning className="size-12 text-muted-foreground" weight="duotone" />
				<p className="text-lg font-medium">
					{error ?? "Formulario no encontrado"}
				</p>
				<p className="text-sm text-muted-foreground">
					Verifica que el código QR sea correcto
				</p>
			</div>
		)
	}

	const TIPO_LABELS: Record<string, string> = {
		inspeccion: "Inspección",
		"reporte-fallas": "Reporte de Fallas",
		preventivo: "Preventivo",
		correctivo: "Correctivo",
	}

	const selectedEquipoId =
		formulario.asociacion.tipo === "equipo" ? formulario.asociacion.valor : null
	const selectedEquipo = selectedEquipoId
		? equipos.find((e) => e.id === selectedEquipoId)
		: null
	const currentDate = new Date()

	const handleClearSignature = () => {
		signatureRef.current?.clear()
		setSignatureEmpty(true)
	}

	const handleSubmit = async () => {
		if (!user) {
			setSubmitError("Debes iniciar sesión para enviar el formulario")
			return
		}

		setSubmitError(null)
		setSubmitSuccess(false)

		const newErrors: Record<string, boolean> = {}
		for (const campo of formulario.campos) {
			if (campo.requerido) {
				if (campo.tipo === "firma") {
					if (signatureEmpty) newErrors[campo.id] = true
				} else if (!formData[campo.id] || formData[campo.id].trim() === "") {
					newErrors[campo.id] = true
				}
			}
		}

		setFieldErrors(newErrors)
		if (Object.keys(newErrors).length > 0) return

		const respuestas: CampoRespuesta[] = formulario.campos.map((campo) => ({
			idCampo: campo.id,
			valor:
				campo.tipo === "firma"
					? (signatureRef.current?.toDataURL() ?? "")
					: (formData[campo.id] ?? ""),
		}))

		setIsSubmitting(true)

		const { error: insertError } = await supabase
			.from("envios_formularios")
			.insert({
				id_formulario: formularioId,
				id_equipo: selectedEquipoId || null,
				id_usuario: user.id,
				version_formulario: formulario.version,
				respuestas:
					respuestas as unknown as Tables<"envios_formularios">["respuestas"],
				estado: "completado",
				id_organizacion: orgId,
			})

		setIsSubmitting(false)

		if (insertError) {
			setSubmitError(
				insertError.message?.includes("row-level security")
					? "No tienes permisos para enviar este formulario."
					: `Error al enviar: ${insertError.message}`,
			)
			return
		}

		setSubmitSuccess(true)
	}

	return (
		<div className="min-h-screen bg-muted/30">
			<div className="border-b bg-background px-4 py-6">
				<div className="mx-auto max-w-lg">
					<div className="flex items-center gap-3">
						<div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
							<ClipboardText className="size-6 text-primary" weight="duotone" />
						</div>
						<div className="flex-1">
							<p className="text-xs font-medium text-muted-foreground">
								{TIPO_LABELS[formulario.tipo] ?? formulario.tipo}
							</p>
							<h1 className="text-lg font-bold leading-tight">
								{formulario.nombre}
							</h1>
						</div>
						<Badge variant="outline" className="shrink-0">
							v{formulario.version}
						</Badge>
					</div>
					{formulario.descripcion && (
						<p className="mt-2 text-sm text-muted-foreground">
							{formulario.descripcion}
						</p>
					)}
				</div>
			</div>

			<div className="mx-auto max-w-lg space-y-4 p-4">
				<Card>
					<CardContent className="grid grid-cols-2 gap-3 pt-4">
						<div className="flex items-center gap-2">
							<User className="size-4 text-muted-foreground" weight="duotone" />
							<div>
								<p className="text-[10px] text-muted-foreground">Usuario</p>
								<p className="text-xs font-medium">
									{profileName ?? user?.email ?? "Sin sesión"}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<CalendarBlank
								className="size-4 text-muted-foreground"
								weight="duotone"
							/>
							<div>
								<p className="text-[10px] text-muted-foreground">Fecha</p>
								<p className="text-xs font-medium">
									{currentDate.toLocaleDateString("es-CO", {
										day: "2-digit",
										month: "short",
										year: "numeric",
									})}
								</p>
							</div>
						</div>
						{selectedEquipo && (
							<div className="col-span-2 flex items-center gap-2">
								<MapPin
									className="size-4 text-muted-foreground"
									weight="duotone"
								/>
								<div>
									<p className="text-[10px] text-muted-foreground">Equipo</p>
									<p className="text-xs font-medium">
										{selectedEquipo.nombre} — {selectedEquipo.ubicacion}
									</p>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{!user && (
					<Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
						<CardContent className="flex flex-col items-center gap-3 pt-4 text-center">
							<Warning className="size-8 text-amber-600" weight="duotone" />
							<p className="text-sm font-medium">
								Necesitas iniciar sesión para enviar este formulario
							</p>
							<Link href={`/login`}>
								<Button size="sm">
									Iniciar sesión
									<ArrowRight className="ml-1 size-3" />
								</Button>
							</Link>
						</CardContent>
					</Card>
				)}

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm">Campos del Formulario</CardTitle>
						<p className="text-xs text-muted-foreground">
							Los campos con <span className="text-red-600">*</span> son
							obligatorios
						</p>
					</CardHeader>
					<CardContent className="space-y-5">
						{formulario.campos.map((campo) => (
							<div key={campo.id}>
								<div className="mb-1.5 text-sm font-medium">
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
											if (fieldErrors[campo.id])
												setFieldErrors({ ...fieldErrors, [campo.id]: false })
										}}
										className={cn(
											"text-base",
											fieldErrors[campo.id] && "border-red-500",
										)}
										placeholder="Ingrese el texto"
									/>
								)}

								{campo.tipo === "texto-largo" && (
									<textarea
										value={formData[campo.id] || ""}
										onChange={(e) => {
											setFormData({ ...formData, [campo.id]: e.target.value })
											if (fieldErrors[campo.id])
												setFieldErrors({ ...fieldErrors, [campo.id]: false })
										}}
										className={cn(
											"w-full rounded-md border p-3 text-base",
											fieldErrors[campo.id] && "border-red-500",
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
											if (fieldErrors[campo.id])
												setFieldErrors({ ...fieldErrors, [campo.id]: false })
										}}
										className={cn(
											"text-base",
											fieldErrors[campo.id] && "border-red-500",
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
											if (fieldErrors[campo.id])
												setFieldErrors({ ...fieldErrors, [campo.id]: false })
										}}
										className={cn(
											"text-base",
											fieldErrors[campo.id] && "border-red-500",
										)}
									/>
								)}

								{campo.tipo === "seleccion-unica" && (
									<select
										value={formData[campo.id] || ""}
										onChange={(e) => {
											setFormData({ ...formData, [campo.id]: e.target.value })
											if (fieldErrors[campo.id])
												setFieldErrors({ ...fieldErrors, [campo.id]: false })
										}}
										className={cn(
											"w-full rounded-md border p-3 text-base",
											fieldErrors[campo.id] && "border-red-500",
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
												fieldErrors[campo.id] && "border-red-500",
											)}
										>
											<SignatureCanvas
												ref={signatureRef}
												canvasProps={{
													className: "w-full h-32 rounded-lg",
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
												<Eraser className="mr-1 size-3" weight="duotone" />
												Limpiar
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													if (!signatureRef.current?.isEmpty()) {
														setSignatureEmpty(false)
														if (fieldErrors[campo.id])
															setFieldErrors({
																...fieldErrors,
																[campo.id]: false,
															})
													}
												}}
											>
												<Check className="mr-1 size-3" weight="duotone" />
												Confirmar
											</Button>
										</div>
									</div>
								)}

								{campo.tipo === "foto" && (
									<label className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30">
										<Upload
											className="size-6 text-muted-foreground"
											weight="duotone"
										/>
										<p className="mt-1 text-xs text-muted-foreground">
											Toca para subir foto
										</p>
										<input
											type="file"
											accept="image/*"
											capture="environment"
											className="hidden"
											onChange={(e) => {
												if (e.target.files?.[0]) {
													setFormData({
														...formData,
														[campo.id]: e.target.files[0].name,
													})
													if (fieldErrors[campo.id])
														setFieldErrors({
															...fieldErrors,
															[campo.id]: false,
														})
												}
											}}
										/>
										{formData[campo.id] && (
											<p className="mt-1 text-xs font-medium text-green-600">
												{formData[campo.id]}
											</p>
										)}
									</label>
								)}

								{fieldErrors[campo.id] && (
									<p className="mt-1 text-xs text-red-600">
										Este campo es obligatorio
									</p>
								)}
							</div>
						))}
					</CardContent>
				</Card>

				{(submitError || submitSuccess) && (
					<p
						className={cn(
							"text-center text-sm font-medium",
							submitSuccess ? "text-green-600" : "text-destructive",
						)}
					>
						{submitSuccess ? "Formulario enviado exitosamente" : submitError}
					</p>
				)}

				{user ? (
					<Button
						className="w-full"
						size="lg"
						disabled={isSubmitting || submitSuccess}
						onClick={() => void handleSubmit()}
					>
						<Check className="mr-2 size-4" weight="bold" />
						{isSubmitting
							? "Enviando..."
							: submitSuccess
								? "Enviado"
								: "Enviar Formulario"}
					</Button>
				) : (
					<Link href="/login" className="block">
						<Button className="w-full" size="lg" variant="outline">
							Iniciar sesión para enviar
							<ArrowRight className="ml-2 size-4" />
						</Button>
					</Link>
				)}

				<p className="pb-4 text-center text-xs text-muted-foreground">
					Industrial Portal — Gestión Industrial Digital
				</p>
			</div>
		</div>
	)
}
