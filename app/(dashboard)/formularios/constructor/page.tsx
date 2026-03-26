"use client"

export const dynamic = "force-dynamic"

import {
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	PointerSensor,
	useDraggable,
	useDroppable,
	useSensor,
	useSensors,
} from "@dnd-kit/core"
import {
	arrayMove,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
	CalendarBlank,
	Camera,
	CheckSquare,
	DotsSixVertical,
	FloppyDisk,
	Hash,
	ListBullets,
	PencilLine,
	Plus,
	TextAlignLeft,
	TextT,
	Trash,
	Upload,
} from "@phosphor-icons/react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useRef, useState } from "react"
import SignatureCanvas from "react-signature-canvas"
import { toast } from "sonner"
import {
	createFormulario,
	getFormularioById,
	updateFormulario,
} from "@/app/(dashboard)/formularios/actions"
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type FieldType =
	| "texto_corto"
	| "texto_largo"
	| "numerico"
	| "fecha"
	| "seleccion_unica"
	| "seleccion_multiple"
	| "firma"
	| "foto"

interface FormField {
	id: string
	tipo: FieldType
	label: string
	placeholder: string
	requerido: boolean
	opciones?: string[]
}

const fieldTypes: { tipo: FieldType; label: string; icon: React.ReactNode }[] =
	[
		{
			tipo: "texto_corto",
			label: "Texto Corto",
			icon: <TextT className="size-5" weight="duotone" />,
		},
		{
			tipo: "texto_largo",
			label: "Texto Largo",
			icon: <TextAlignLeft className="size-5" weight="duotone" />,
		},
		{
			tipo: "numerico",
			label: "Numérico",
			icon: <Hash className="size-5" weight="duotone" />,
		},
		{
			tipo: "fecha",
			label: "Fecha",
			icon: <CalendarBlank className="size-5" weight="duotone" />,
		},
		{
			tipo: "seleccion_unica",
			label: "Selección Única",
			icon: <ListBullets className="size-5" weight="duotone" />,
		},
		{
			tipo: "seleccion_multiple",
			label: "Selección Múltiple",
			icon: <CheckSquare className="size-5" weight="duotone" />,
		},
		{
			tipo: "firma",
			label: "Firma Digital",
			icon: <PencilLine className="size-5" weight="duotone" />,
		},
		{
			tipo: "foto",
			label: "Evidencia Fotográfica",
			icon: <Camera className="size-5" weight="duotone" />,
		},
	]

// Draggable palette item
function DraggablePaletteItem({
	tipo,
	label,
	icon,
}: {
	tipo: FieldType
	label: string
	icon: React.ReactNode
}) {
	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
		id: `palette-${tipo}`,
		data: { tipo, fromPalette: true },
	})

	return (
		<Card
			ref={setNodeRef}
			{...listeners}
			{...attributes}
			className={cn(
				"cursor-grab transition-all hover:shadow-md active:cursor-grabbing",
				isDragging && "opacity-50 ring-2 ring-primary",
			)}
		>
			<CardContent className="flex items-center gap-3 p-3">
				<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
					{icon}
				</div>
				<span className="text-sm font-medium">{label}</span>
				<Plus className="ml-auto size-4 text-muted-foreground" weight="bold" />
			</CardContent>
		</Card>
	)
}

// Sortable field in canvas
function SortableField({
	field,
	isSelected,
	onSelect,
	onDelete,
}: {
	field: FormField
	isSelected: boolean
	onSelect: () => void
	onDelete: () => void
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: field.id })

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	}

	const fieldType = fieldTypes.find((f) => f.tipo === field.tipo)

	return (
		<div ref={setNodeRef} style={style} className="group relative">
			<Card
				className={cn(
					"cursor-pointer transition-all hover:shadow-md",
					isSelected && "ring-2 ring-primary",
				)}
				onClick={onSelect}
			>
				<CardContent className="flex items-center gap-3 p-3">
					<div
						{...attributes}
						{...listeners}
						className="cursor-grab active:cursor-grabbing"
					>
						<DotsSixVertical className="size-5 text-muted-foreground" />
					</div>
					<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
						{fieldType?.icon}
					</div>
					<div className="flex-1">
						<p className="text-sm font-medium">
							{field.label || fieldType?.label}
						</p>
						<p className="text-xs text-muted-foreground">{fieldType?.label}</p>
					</div>
					{field.requerido && (
						<span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
							Requerido
						</span>
					)}
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={(e) => {
							e.stopPropagation()
							onDelete()
						}}
					>
						<Trash className="size-4" weight="duotone" />
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}

// Drop zone canvas
function CanvasDropZone({
	children,
	isEmpty,
	isOver,
}: {
	children: React.ReactNode
	isEmpty: boolean
	isOver: boolean
}) {
	const { setNodeRef } = useDroppable({ id: "canvas" })

	return (
		<div
			ref={setNodeRef}
			className={cn(
				"min-h-[300px] rounded-lg border-2 border-dashed p-4 transition-all",
				isOver
					? "border-primary bg-primary/5"
					: isEmpty
						? "border-muted-foreground/25"
						: "border-transparent",
			)}
		>
			{isEmpty ? (
				<div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-2 text-muted-foreground">
					<Plus className="size-12" weight="thin" />
					<p className="text-center text-sm">
						Arrastra campos aquí para construir tu formulario
					</p>
				</div>
			) : (
				<div className="space-y-3">{children}</div>
			)}
		</div>
	)
}

// Live preview component
function LivePreview({
	formName,
	fields,
	previewData,
	onPreviewDataChange,
}: {
	formName: string
	fields: FormField[]
	previewData: Record<string, string>
	onPreviewDataChange: (id: string, value: string) => void
}) {
	const signatureRefs = useRef<Record<string, SignatureCanvas | null>>({})

	if (fields.length === 0) {
		return (
			<div className="flex h-full items-center justify-center text-muted-foreground">
				<p className="text-center text-sm">
					Agrega campos para ver la vista previa
				</p>
			</div>
		)
	}

	return (
		<div className="space-y-4">
			<h4 className="text-lg font-semibold">{formName}</h4>
			{fields.map((field) => (
				<div key={field.id}>
					<p className="mb-2 block text-sm font-medium">
						{field.label}
						{field.requerido && <span className="ml-1 text-red-600">*</span>}
					</p>

					{field.tipo === "texto_corto" && (
						<Input
							value={previewData[field.id] || ""}
							onChange={(e) => onPreviewDataChange(field.id, e.target.value)}
							placeholder={field.placeholder || "Escribe aquí..."}
						/>
					)}

					{field.tipo === "texto_largo" && (
						<textarea
							value={previewData[field.id] || ""}
							onChange={(e) => onPreviewDataChange(field.id, e.target.value)}
							className="w-full rounded-md border bg-background p-2 text-sm"
							rows={3}
							placeholder={field.placeholder || "Escribe aquí..."}
						/>
					)}

					{field.tipo === "numerico" && (
						<Input
							type="number"
							value={previewData[field.id] || ""}
							onChange={(e) => onPreviewDataChange(field.id, e.target.value)}
							placeholder={field.placeholder || "0"}
						/>
					)}

					{field.tipo === "fecha" && (
						<Input
							type="date"
							value={previewData[field.id] || ""}
							onChange={(e) => onPreviewDataChange(field.id, e.target.value)}
						/>
					)}

					{field.tipo === "seleccion_unica" && (
						<select
							value={previewData[field.id] || ""}
							onChange={(e) => onPreviewDataChange(field.id, e.target.value)}
							className="w-full rounded-md border bg-background p-2 text-sm"
						>
							<option value="">Selecciona una opción</option>
							{(field.opciones || ["Opción 1", "Opción 2", "Opción 3"]).map(
								(opt) => (
									<option key={opt} value={opt}>
										{opt}
									</option>
								),
							)}
						</select>
					)}

					{field.tipo === "seleccion_multiple" && (
						<div className="space-y-2">
							{(field.opciones || ["Opción 1", "Opción 2", "Opción 3"]).map(
								(opt) => (
									<label key={opt} className="flex items-center gap-2 text-sm">
										<input
											type="checkbox"
											checked={(previewData[field.id] || "")
												.split(",")
												.includes(opt)}
											onChange={(e) => {
												const current = (previewData[field.id] || "")
													.split(",")
													.filter(Boolean)
												if (e.target.checked) {
													onPreviewDataChange(
														field.id,
														[...current, opt].join(","),
													)
												} else {
													onPreviewDataChange(
														field.id,
														current.filter((o) => o !== opt).join(","),
													)
												}
											}}
											className="size-4 rounded border"
										/>
										{opt}
									</label>
								),
							)}
						</div>
					)}

					{field.tipo === "firma" && (
						<div className="space-y-2">
							<div className="rounded-lg border-2 bg-white">
								<SignatureCanvas
									ref={(ref) => {
										signatureRefs.current[field.id] = ref
									}}
									canvasProps={{
										className: "w-full h-24 rounded-lg",
									}}
									onEnd={() => {
										const data =
											signatureRefs.current[field.id]?.toDataURL() || ""
										onPreviewDataChange(field.id, data)
									}}
								/>
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									signatureRefs.current[field.id]?.clear()
									onPreviewDataChange(field.id, "")
								}}
							>
								Limpiar firma
							</Button>
						</div>
					)}

					{field.tipo === "foto" && (
						<div className="space-y-2">
							{previewData[field.id] ? (
								<div className="relative h-32 overflow-hidden rounded-lg">
									<Image
										src={previewData[field.id]}
										alt="Preview"
										fill
										unoptimized
										className="object-cover"
									/>
									<Button
										variant="destructive"
										size="sm"
										className="absolute right-2 top-2"
										onClick={() => onPreviewDataChange(field.id, "")}
									>
										<Trash className="size-4" />
									</Button>
								</div>
							) : (
								<label className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 transition-colors hover:bg-muted/50">
									<Upload className="size-8 text-muted-foreground" />
									<span className="mt-1 text-xs text-muted-foreground">
										Haz clic para subir
									</span>
									<input
										type="file"
										accept="image/*"
										className="hidden"
										onChange={(e) => {
											const file = e.target.files?.[0]
											if (file) {
												const reader = new FileReader()
												reader.onload = (ev) => {
													onPreviewDataChange(
														field.id,
														ev.target?.result as string,
													)
												}
												reader.readAsDataURL(file)
											}
										}}
									/>
								</label>
							)}
						</div>
					)}
				</div>
			))}
		</div>
	)
}

function FormBuilderPageContent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const formId = searchParams.get("id")
	const isEditMode = Boolean(formId)

	const [formName, setFormName] = useState("")
	const [descripcion, setDescripcion] = useState("")
	const [tipo, setTipo] = useState<
		"inspeccion" | "reporte_fallas" | "preventivo" | "correctivo"
	>("inspeccion")
	const [frecuencia, setFrecuencia] = useState<
		"" | "diario" | "semanal" | "mensual" | "trimestral" | "eventual"
	>("")
	const [asociacionTipo, setAsociacionTipo] = useState<
		"general" | "equipo" | "tipo_equipo" | "area"
	>("general")
	const [asociacionValor, setAsociacionValor] = useState("")
	const [fields, setFields] = useState<FormField[]>([])
	const [selectedField, setSelectedField] = useState<FormField | null>(null)
	const [activeId, setActiveId] = useState<string | null>(null)
	const [activeTipo, setActiveTipo] = useState<FieldType | null>(null)
	const [isOverCanvas, setIsOverCanvas] = useState(false)
	const [previewData, setPreviewData] = useState<Record<string, string>>({})
	const [isLoadingForm, setIsLoadingForm] = useState(isEditMode)
	const [isSaving, setIsSaving] = useState(false)

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
	)

	useEffect(() => {
		if (!formId) {
			setIsLoadingForm(false)
			return
		}

		const currentFormId = formId

		async function loadFormulario() {
			setIsLoadingForm(true)
			const result = await getFormularioById(currentFormId)
			if (!result.success) {
				toast.error(result.error)
				router.push("/formularios/admin")
				setIsLoadingForm(false)
				return
			}

			const template = result.data
			setFormName(template.nombre)
			setDescripcion(template.descripcion ?? "")
			setTipo(template.tipo)
			setFrecuencia(template.frecuencia ?? "")
			setAsociacionTipo(template.asociacion_tipo)
			setAsociacionValor(template.asociacion_valor ?? "")
			setFields(
				(template.campos ?? []).map((campo) => ({
					id: campo.id,
					tipo: campo.tipo,
					label: campo.label,
					placeholder: campo.placeholder,
					requerido: campo.requerido,
					opciones: campo.opciones ?? undefined,
				})),
			)
			setSelectedField(null)
			setPreviewData({})
			setIsLoadingForm(false)
		}

		loadFormulario()
	}, [formId, router])

	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event
		setActiveId(active.id as string)

		// Check if dragging from palette
		if (active.data.current?.fromPalette) {
			setActiveTipo(active.data.current.tipo)
		}
	}

	const handleDragOver = (event: DragEndEvent) => {
		const { over } = event
		setIsOverCanvas(over?.id === "canvas")
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event

		setActiveId(null)
		setActiveTipo(null)
		setIsOverCanvas(false)

		if (!over) return

		// Dropping from palette to canvas
		if (active.data.current?.fromPalette && over.id === "canvas") {
			const tipo = active.data.current.tipo as FieldType
			const newField: FormField = {
				id: `field-${Date.now()}`,
				tipo,
				label: fieldTypes.find((f) => f.tipo === tipo)?.label || "",
				placeholder: "",
				requerido: false,
				opciones:
					tipo === "seleccion_unica" || tipo === "seleccion_multiple"
						? ["Opción 1", "Opción 2", "Opción 3"]
						: undefined,
			}
			setFields([...fields, newField])
			setSelectedField(newField)
			return
		}

		// Reordering within canvas
		if (active.id !== over.id && !active.data.current?.fromPalette) {
			setFields((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id)
				const newIndex = items.findIndex((item) => item.id === over.id)
				if (oldIndex !== -1 && newIndex !== -1) {
					return arrayMove(items, oldIndex, newIndex)
				}
				return items
			})
		}
	}

	const handleDeleteField = (id: string) => {
		setFields(fields.filter((f) => f.id !== id))
		if (selectedField?.id === id) {
			setSelectedField(null)
		}
		// Clean preview data
		const newPreviewData = { ...previewData }
		delete newPreviewData[id]
		setPreviewData(newPreviewData)
	}

	const handleUpdateField = (updates: Partial<FormField>) => {
		if (!selectedField) return
		const updated = { ...selectedField, ...updates }
		setFields((prev) =>
			prev.map((field) => (field.id === selectedField.id ? updated : field)),
		)
		setSelectedField(updated)
	}

	const handlePreviewDataChange = (id: string, value: string) => {
		setPreviewData({ ...previewData, [id]: value })
	}

	const handleSave = async () => {
		if (isSaving) return

		setIsSaving(true)

		const payload = {
			nombre: formName,
			descripcion: descripcion || undefined,
			tipo,
			frecuencia: frecuencia || undefined,
			asociacion_tipo: asociacionTipo,
			asociacion_valor:
				asociacionTipo === "general" ? undefined : asociacionValor || undefined,
			campos: fields.map((field, index) => ({
				tipo: field.tipo,
				label: field.label,
				placeholder: field.placeholder,
				requerido: field.requerido,
				opciones:
					field.tipo === "seleccion_unica" ||
					field.tipo === "seleccion_multiple"
						? field.opciones
						: undefined,
				orden: index,
			})),
		}

		const result = formId
			? await updateFormulario(formId, payload)
			: await createFormulario(payload)

		if (!result.success) {
			toast.error(result.error)
			setIsSaving(false)
			return
		}

		toast.success("Formulario guardado")
		router.push("/formularios/admin")
		setIsSaving(false)
	}

	return (
		<SidebarInset>
			<header className="flex h-16 shrink-0 items-center gap-2 border-b">
				<div className="flex w-full items-center justify-between px-4">
					<div className="flex items-center gap-2">
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
									<BreadcrumbLink href="/formularios">
										Formularios
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>Constructor</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
					<Button onClick={handleSave} disabled={isSaving || isLoadingForm}>
						<FloppyDisk className="mr-2 size-4" weight="duotone" />
						{isSaving ? "Guardando..." : "Guardar"}
					</Button>
				</div>
			</header>

			<DndContext
				sensors={sensors}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
			>
				<div className="flex flex-1 overflow-hidden">
					{/* Left Panel - Field Palette */}
					<div className="w-56 shrink-0 overflow-y-auto border-r p-4">
						<h3 className="mb-4 text-sm font-semibold text-muted-foreground">
							Arrastra los campos
						</h3>
						<div className="space-y-2">
							{fieldTypes.map((fieldType) => (
								<DraggablePaletteItem
									key={fieldType.tipo}
									tipo={fieldType.tipo}
									label={fieldType.label}
									icon={fieldType.icon}
								/>
							))}
						</div>
					</div>

					{/* Center Panel - Canvas */}
					<div className="flex-1 overflow-y-auto p-6">
						<div className="mb-6 space-y-4">
							<Input
								value={formName}
								onChange={(e) => setFormName(e.target.value)}
								className="text-xl font-semibold"
								placeholder="Nombre del formulario"
							/>

							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-1.5 md:col-span-2">
									<p className="text-xs font-medium">Descripción</p>
									<Textarea
										value={descripcion}
										onChange={(e) => setDescripcion(e.target.value)}
										placeholder="Describe el propósito del formulario"
									/>
								</div>

								<div className="space-y-1.5">
									<p className="text-xs font-medium">Tipo</p>
									<Select
										value={tipo}
										onValueChange={(value) => setTipo(value as typeof tipo)}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Selecciona tipo" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="inspeccion">Inspección</SelectItem>
											<SelectItem value="reporte_fallas">
												Reporte de fallas
											</SelectItem>
											<SelectItem value="preventivo">Preventivo</SelectItem>
											<SelectItem value="correctivo">Correctivo</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-1.5">
									<p className="text-xs font-medium">Frecuencia</p>
									<Select
										value={frecuencia || "none"}
										onValueChange={(value) =>
											setFrecuencia(
												value === "none" ? "" : (value as typeof frecuencia),
											)
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Selecciona frecuencia" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">Sin frecuencia</SelectItem>
											<SelectItem value="diario">Diario</SelectItem>
											<SelectItem value="semanal">Semanal</SelectItem>
											<SelectItem value="mensual">Mensual</SelectItem>
											<SelectItem value="trimestral">Trimestral</SelectItem>
											<SelectItem value="eventual">Eventual</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-1.5">
									<p className="text-xs font-medium">Tipo de asociación</p>
									<Select
										value={asociacionTipo}
										onValueChange={(value) =>
											setAsociacionTipo(value as typeof asociacionTipo)
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Selecciona asociación" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="general">General</SelectItem>
											<SelectItem value="equipo">Equipo</SelectItem>
											<SelectItem value="tipo_equipo">
												Tipo de equipo
											</SelectItem>
											<SelectItem value="area">Área</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{asociacionTipo !== "general" && (
									<div className="space-y-1.5">
										<p className="text-xs font-medium">Valor de asociación</p>
										<Input
											value={asociacionValor}
											onChange={(e) => setAsociacionValor(e.target.value)}
											placeholder="ID o valor de asociación"
										/>
									</div>
								)}
							</div>

							{isLoadingForm && isEditMode && (
								<p className="text-sm text-muted-foreground">
									Cargando formulario...
								</p>
							)}
						</div>

						<SortableContext
							items={fields.map((f) => f.id)}
							strategy={verticalListSortingStrategy}
						>
							<CanvasDropZone
								isEmpty={fields.length === 0}
								isOver={isOverCanvas}
							>
								{fields.map((field) => (
									<SortableField
										key={field.id}
										field={field}
										isSelected={selectedField?.id === field.id}
										onSelect={() => setSelectedField(field)}
										onDelete={() => handleDeleteField(field.id)}
									/>
								))}
							</CanvasDropZone>
						</SortableContext>
					</div>

					{/* Right Panel - Properties + Live Preview */}
					<div className="flex w-80 shrink-0 flex-col border-l">
						{/* Properties Section */}
						<div className="border-b p-4">
							<h3 className="mb-4 text-sm font-semibold text-muted-foreground">
								Propiedades
							</h3>
							{selectedField ? (
								<div className="space-y-4">
									<div>
										<p className="mb-1.5 block text-xs font-medium">Etiqueta</p>
										<Input
											value={selectedField.label}
											onChange={(e) =>
												handleUpdateField({ label: e.target.value })
											}
											placeholder="Etiqueta del campo"
										/>
									</div>
									<div>
										<p className="mb-1.5 block text-xs font-medium">
											Placeholder
										</p>
										<Input
											value={selectedField.placeholder}
											onChange={(e) =>
												handleUpdateField({ placeholder: e.target.value })
											}
											placeholder="Texto de ayuda"
										/>
									</div>
									<div className="flex items-center justify-between">
										<p className="text-xs font-medium">Campo requerido</p>
										<Switch
											checked={selectedField.requerido}
											onCheckedChange={(checked) =>
												handleUpdateField({ requerido: checked })
											}
										/>
									</div>
								</div>
							) : (
								<p className="text-xs text-muted-foreground">
									Selecciona un campo para editar
								</p>
							)}
						</div>

						{/* Live Preview Section */}
						<div className="flex-1 overflow-y-auto p-4">
							<h3 className="mb-4 text-sm font-semibold text-muted-foreground">
								Vista Previa en Vivo
							</h3>
							<div className="rounded-lg border bg-card p-4">
								<LivePreview
									formName={formName}
									fields={fields}
									previewData={previewData}
									onPreviewDataChange={handlePreviewDataChange}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Drag Overlay */}
				<DragOverlay>
					{activeId && activeTipo ? (
						<Card className="w-52 shadow-lg ring-2 ring-primary">
							<CardContent className="flex items-center gap-3 p-3">
								<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
									{fieldTypes.find((f) => f.tipo === activeTipo)?.icon}
								</div>
								<span className="text-sm font-medium">
									{fieldTypes.find((f) => f.tipo === activeTipo)?.label}
								</span>
							</CardContent>
						</Card>
					) : null}
				</DragOverlay>
			</DndContext>
		</SidebarInset>
	)
}

export default function FormBuilderPage() {
	return (
		<Suspense
			fallback={
				<SidebarInset>
					<div className="flex h-full items-center justify-center p-8">
						<p className="animate-pulse text-sm text-muted-foreground">
							Cargando constructor...
						</p>
					</div>
				</SidebarInset>
			}
		>
			<FormBuilderPageContent />
		</Suspense>
	)
}
