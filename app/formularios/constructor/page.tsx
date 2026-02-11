"use client"

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
import { useRef, useState } from "react"
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
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type FieldType =
	| "texto-corto"
	| "texto-largo"
	| "numerico"
	| "fecha"
	| "seleccion-unica"
	| "seleccion-multiple"
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
			tipo: "texto-corto",
			label: "Texto Corto",
			icon: <TextT className="size-5" weight="duotone" />,
		},
		{
			tipo: "texto-largo",
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
			tipo: "seleccion-unica",
			label: "Selección Única",
			icon: <ListBullets className="size-5" weight="duotone" />,
		},
		{
			tipo: "seleccion-multiple",
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
					<label className="mb-2 block text-sm font-medium">
						{field.label}
						{field.requerido && <span className="ml-1 text-red-600">*</span>}
					</label>

					{field.tipo === "texto-corto" && (
						<Input
							value={previewData[field.id] || ""}
							onChange={(e) => onPreviewDataChange(field.id, e.target.value)}
							placeholder={field.placeholder || "Escribe aquí..."}
						/>
					)}

					{field.tipo === "texto-largo" && (
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

					{field.tipo === "seleccion-unica" && (
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

					{field.tipo === "seleccion-multiple" && (
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
								<div className="relative">
									<img
										src={previewData[field.id]}
										alt="Preview"
										className="h-32 w-full rounded-lg object-cover"
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

export default function FormBuilderPage() {
	const [formName, setFormName] = useState("Nuevo Formulario")
	const [fields, setFields] = useState<FormField[]>([])
	const [selectedField, setSelectedField] = useState<FormField | null>(null)
	const [activeId, setActiveId] = useState<string | null>(null)
	const [activeTipo, setActiveTipo] = useState<FieldType | null>(null)
	const [isOverCanvas, setIsOverCanvas] = useState(false)
	const [previewData, setPreviewData] = useState<Record<string, string>>({})

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
	)

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
					tipo === "seleccion-unica" || tipo === "seleccion-multiple"
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
		setFields(fields.map((f) => (f.id === selectedField.id ? updated : f)))
		setSelectedField(updated)
	}

	const handlePreviewDataChange = (id: string, value: string) => {
		setPreviewData({ ...previewData, [id]: value })
	}

	return (
		<SidebarProvider>
			<AppSidebar />
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
						<Button onClick={() => alert("Formulario guardado (simulado)")}>
							<FloppyDisk className="mr-2 size-4" weight="duotone" />
							Guardar
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
							<div className="mb-6">
								<Input
									value={formName}
									onChange={(e) => setFormName(e.target.value)}
									className="text-xl font-semibold"
									placeholder="Nombre del formulario"
								/>
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
											<label className="mb-1.5 block text-xs font-medium">
												Etiqueta
											</label>
											<Input
												value={selectedField.label}
												onChange={(e) =>
													handleUpdateField({ label: e.target.value })
												}
												placeholder="Etiqueta del campo"
											/>
										</div>
										<div>
											<label className="mb-1.5 block text-xs font-medium">
												Placeholder
											</label>
											<Input
												value={selectedField.placeholder}
												onChange={(e) =>
													handleUpdateField({ placeholder: e.target.value })
												}
												placeholder="Texto de ayuda"
											/>
										</div>
										<div className="flex items-center justify-between">
											<label className="text-xs font-medium">
												Campo requerido
											</label>
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
		</SidebarProvider>
	)
}
