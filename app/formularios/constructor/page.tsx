"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	DndContext,
	DragEndEvent,
	DragOverlay,
	DragStartEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
	TextT,
	TextAlignLeft,
	Hash,
	CalendarBlank,
	ListBullets,
	CheckSquare,
	PencilLine,
	Camera,
	Trash,
	Eye,
	FloppyDisk,
	DotsSixVertical,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

type FieldType = "texto-corto" | "texto-largo" | "numerico" | "fecha" | "seleccion-unica" | "seleccion-multiple" | "firma" | "foto"

interface FormField {
	id: string
	tipo: FieldType
	label: string
	placeholder: string
	requerido: boolean
}

const fieldTypes: { tipo: FieldType; label: string; icon: React.ReactNode }[] = [
	{ tipo: "texto-corto", label: "Texto Corto", icon: <TextT className="size-5" weight="duotone" /> },
	{ tipo: "texto-largo", label: "Texto Largo", icon: <TextAlignLeft className="size-5" weight="duotone" /> },
	{ tipo: "numerico", label: "Numérico", icon: <Hash className="size-5" weight="duotone" /> },
	{ tipo: "fecha", label: "Fecha", icon: <CalendarBlank className="size-5" weight="duotone" /> },
	{ tipo: "seleccion-unica", label: "Selección Única", icon: <ListBullets className="size-5" weight="duotone" /> },
	{ tipo: "seleccion-multiple", label: "Selección Múltiple", icon: <CheckSquare className="size-5" weight="duotone" /> },
	{ tipo: "firma", label: "Firma Digital", icon: <PencilLine className="size-5" weight="duotone" /> },
	{ tipo: "foto", label: "Evidencia Fotográfica", icon: <Camera className="size-5" weight="duotone" /> },
]

function SortableField({ field, onSelect, onDelete }: { field: FormField; onSelect: () => void; onDelete: () => void }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id })

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	}

	const fieldType = fieldTypes.find((f) => f.tipo === field.tipo)

	return (
		<div ref={setNodeRef} style={style} className="group relative">
			<Card className="cursor-pointer transition-all hover:shadow-md" onClick={onSelect}>
				<CardContent className="flex items-center gap-3 p-3">
					<div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
						<DotsSixVertical className="size-5 text-muted-foreground" />
					</div>
					<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
						{fieldType?.icon}
					</div>
					<div className="flex-1">
						<p className="text-sm font-medium">{field.label || fieldType?.label}</p>
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

export default function FormBuilderPage() {
	const router = useRouter()
	const [formName, setFormName] = useState("Nuevo Formulario")
	const [fields, setFields] = useState<FormField[]>([])
	const [selectedField, setSelectedField] = useState<FormField | null>(null)
	const [previewOpen, setPreviewOpen] = useState(false)
	const [activeId, setActiveId] = useState<string | null>(null)

	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as string)
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event

		if (over && active.id !== over.id) {
			setFields((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id)
				const newIndex = items.findIndex((item) => item.id === over.id)
				return arrayMove(items, oldIndex, newIndex)
			})
		}

		setActiveId(null)
	}

	const handleAddField = (tipo: FieldType) => {
		const newField: FormField = {
			id: `field-${Date.now()}`,
			tipo,
			label: fieldTypes.find((f) => f.tipo === tipo)?.label || "",
			placeholder: "",
			requerido: false,
		}
		setFields([...fields, newField])
	}

	const handleDeleteField = (id: string) => {
		setFields(fields.filter((f) => f.id !== id))
		if (selectedField?.id === id) {
			setSelectedField(null)
		}
	}

	const handleUpdateField = (updates: Partial<FormField>) => {
		if (!selectedField) return
		setFields(fields.map((f) => (f.id === selectedField.id ? { ...f, ...updates } : f)))
		setSelectedField({ ...selectedField, ...updates })
	}

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b">
					<div className="flex w-full items-center justify-between px-4">
						<div className="flex items-center gap-2">
							<SidebarTrigger className="-ml-1" />
							<Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
							<Breadcrumb>
								<BreadcrumbList>
									<BreadcrumbItem className="hidden md:block">
										<BreadcrumbLink href="/dashboard">Portal Industrial</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator className="hidden md:block" />
									<BreadcrumbItem>
										<BreadcrumbLink href="/formularios">Formularios</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator className="hidden md:block" />
									<BreadcrumbItem>
										<BreadcrumbPage>Constructor</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" onClick={() => setPreviewOpen(true)}>
								<Eye className="mr-2 size-4" weight="duotone" />
								Vista Previa
							</Button>
							<Button onClick={() => alert("Formulario guardado (simulado)")}>
								<FloppyDisk className="mr-2 size-4" weight="duotone" />
								Guardar
							</Button>
						</div>
					</div>
				</header>

				<div className="flex flex-1">
					{/* Left Panel - Field Palette */}
					<div className="w-64 border-r p-4">
						<h3 className="mb-4 text-sm font-semibold">Campos Disponibles</h3>
						<div className="space-y-2">
							{fieldTypes.map((fieldType) => (
								<Card
									key={fieldType.tipo}
									className="cursor-pointer transition-all hover:shadow-md"
									onClick={() => handleAddField(fieldType.tipo)}
								>
									<CardContent className="flex items-center gap-3 p-3">
										<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
											{fieldType.icon}
										</div>
										<span className="text-sm font-medium">{fieldType.label}</span>
									</CardContent>
								</Card>
							))}
						</div>
					</div>

					{/* Center Panel - Canvas */}
					<div className="flex-1 p-6">
						<div className="mb-6">
							<Input
								value={formName}
								onChange={(e) => setFormName(e.target.value)}
								className="text-2xl font-semibold"
								placeholder="Nombre del formulario"
							/>
						</div>

						<DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
							<SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
								<div className="space-y-3">
									{fields.length === 0 ? (
										<Card className="border-dashed">
											<CardContent className="flex min-h-[200px] items-center justify-center p-6">
												<p className="text-center text-muted-foreground">
													Arrastra campos desde el panel izquierdo para comenzar a construir tu formulario
												</p>
											</CardContent>
										</Card>
									) : (
										fields.map((field) => (
											<SortableField
												key={field.id}
												field={field}
												onSelect={() => setSelectedField(field)}
												onDelete={() => handleDeleteField(field.id)}
											/>
										))
									)}
								</div>
							</SortableContext>
							<DragOverlay>
								{activeId ? (
									<Card className="w-full opacity-50">
										<CardContent className="p-3">
											<p className="text-sm font-medium">Arrastrando...</p>
										</CardContent>
									</Card>
								) : null}
							</DragOverlay>
						</DndContext>
					</div>

					{/* Right Panel - Properties */}
					<div className="w-80 border-l p-4">
						<h3 className="mb-4 text-sm font-semibold">Propiedades del Campo</h3>
						{selectedField ? (
							<div className="space-y-4">
								<div>
									<label className="mb-2 block text-sm font-medium">Etiqueta</label>
									<Input
										value={selectedField.label}
										onChange={(e) => handleUpdateField({ label: e.target.value })}
										placeholder="Etiqueta del campo"
									/>
								</div>
								<div>
									<label className="mb-2 block text-sm font-medium">Placeholder</label>
									<Input
										value={selectedField.placeholder}
										onChange={(e) => handleUpdateField({ placeholder: e.target.value })}
										placeholder="Texto de ayuda"
									/>
								</div>
								<div className="flex items-center justify-between">
									<label className="text-sm font-medium">Campo requerido</label>
									<Switch
										checked={selectedField.requerido}
										onCheckedChange={(checked) => handleUpdateField({ requerido: checked })}
									/>
								</div>
							</div>
						) : (
							<p className="text-sm text-muted-foreground">Selecciona un campo para editar sus propiedades</p>
						)}
					</div>
				</div>
			</SidebarInset>

			{/* Preview Dialog */}
			<Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>{formName}</DialogTitle>
						<DialogDescription>Vista previa del formulario</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						{fields.map((field) => {
							const fieldType = fieldTypes.find((f) => f.tipo === field.tipo)
							return (
								<div key={field.id}>
									<div className="mb-2 text-sm font-medium">
										{field.label}
										{field.requerido && <span className="ml-1 text-red-600">*</span>}
									</div>
									{field.tipo === "texto-corto" && <Input placeholder={field.placeholder} disabled />}
									{field.tipo === "texto-largo" && (
										<textarea
											className="w-full rounded-none border p-2 text-xs"
											rows={3}
											placeholder={field.placeholder}
											disabled
										/>
									)}
									{field.tipo === "numerico" && <Input type="number" placeholder={field.placeholder} disabled />}
									{field.tipo === "fecha" && <Input type="date" disabled />}
									{field.tipo === "firma" && (
										<div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed bg-muted/30">
											<p className="text-sm text-muted-foreground">Área de firma</p>
										</div>
									)}
									{field.tipo === "foto" && (
										<div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed bg-muted/30">
											<p className="text-sm text-muted-foreground">Cargar foto</p>
										</div>
									)}
								</div>
							)
						})}
					</div>
				</DialogContent>
			</Dialog>
		</SidebarProvider>
	)
}
