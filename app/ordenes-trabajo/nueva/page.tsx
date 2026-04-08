"use client"

import {
	ArrowClockwise,
	ArrowLeft,
	ChartLine,
	Check,
	Lightning,
	ListChecks,
	Package,
	Plus,
	ShieldCheck,
	Star,
	Trash,
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar"
import {
	alertasEquipos,
	equipos,
	type PrioridadOT,
	type TipoOT,
	usuarios,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface ChecklistItem {
	id: string
	categoria: "herramienta" | "repuesto" | "epp" | "procedimiento"
	descripcion: string
}

const TIPOS_OT: {
	value: TipoOT
	label: string
	icon: typeof Lightning
}[] = [
	{ value: "correctiva", label: "Correctiva", icon: Lightning },
	{ value: "preventiva", label: "Preventiva", icon: ArrowClockwise },
	{ value: "predictiva", label: "Predictiva", icon: ChartLine },
	{ value: "mejora", label: "Mejora", icon: Star },
]

const PRIORIDADES: {
	value: PrioridadOT
	label: string
	color: string
}[] = [
	{ value: "critica", label: "Critica", color: "bg-red-500" },
	{ value: "alta", label: "Alta", color: "bg-orange-500" },
	{ value: "media", label: "Media", color: "bg-yellow-500" },
	{ value: "baja", label: "Baja", color: "bg-blue-500" },
]

const CATEGORIA_CONFIG: Record<string, { label: string; icon: typeof Wrench }> =
	{
		herramienta: { label: "Herramienta", icon: Wrench },
		repuesto: { label: "Repuesto", icon: Package },
		epp: { label: "EPP", icon: ShieldCheck },
		procedimiento: { label: "Procedimiento", icon: ListChecks },
	}

const CHECKLIST_PRESETS: Record<TipoOT, ChecklistItem[]> = {
	correctiva: [
		{
			id: "pre-1",
			categoria: "epp",
			descripcion: "Equipo de proteccion personal",
		},
		{
			id: "pre-2",
			categoria: "procedimiento",
			descripcion: "Bloqueo/Etiquetado (LOTO)",
		},
		{
			id: "pre-3",
			categoria: "herramienta",
			descripcion: "Herramienta de diagnostico",
		},
		{
			id: "pre-4",
			categoria: "procedimiento",
			descripcion: "Prueba de funcionamiento post-reparacion",
		},
	],
	preventiva: [
		{
			id: "pre-1",
			categoria: "epp",
			descripcion: "Equipo de proteccion personal",
		},
		{
			id: "pre-2",
			categoria: "repuesto",
			descripcion: "Consumibles de mantenimiento",
		},
		{
			id: "pre-3",
			categoria: "procedimiento",
			descripcion: "Inspeccion visual general",
		},
		{
			id: "pre-4",
			categoria: "procedimiento",
			descripcion: "Verificacion de parametros",
		},
	],
	predictiva: [
		{
			id: "pre-1",
			categoria: "epp",
			descripcion: "Proteccion auditiva",
		},
		{
			id: "pre-2",
			categoria: "herramienta",
			descripcion: "Equipo de medicion",
		},
		{
			id: "pre-3",
			categoria: "procedimiento",
			descripcion: "Captura de datos de referencia",
		},
		{
			id: "pre-4",
			categoria: "procedimiento",
			descripcion: "Analisis y documentacion de resultados",
		},
	],
	mejora: [
		{
			id: "pre-1",
			categoria: "repuesto",
			descripcion: "Componentes nuevos",
		},
		{
			id: "pre-2",
			categoria: "herramienta",
			descripcion: "Herramienta de instalacion",
		},
		{
			id: "pre-3",
			categoria: "procedimiento",
			descripcion: "Backup de configuracion actual",
		},
		{
			id: "pre-4",
			categoria: "procedimiento",
			descripcion: "Prueba de validacion",
		},
	],
}

let nextChecklistId = 100

export default function NuevaOrdenTrabajoPage() {
	const router = useRouter()

	const [titulo, setTitulo] = useState("")
	const [descripcion, setDescripcion] = useState("")
	const [tipo, setTipo] = useState<TipoOT | "">("")
	const [prioridad, setPrioridad] = useState<PrioridadOT | "">("")
	const [idEquipo, setIdEquipo] = useState("")
	const [idAlerta, setIdAlerta] = useState("")
	const [tecnico, setTecnico] = useState("")
	const [fechaProgramada, setFechaProgramada] = useState("")
	const [tiempoEstimado, setTiempoEstimado] = useState("")
	const [checklist, setChecklist] = useState<ChecklistItem[]>([])
	const [errors, setErrors] = useState<Record<string, boolean>>({})

	const tecnicos = usuarios.filter((u) => u.rol === "tecnico")
	const alertasActivas = alertasEquipos.filter(
		(a) => a.estado === "activa" || a.estado === "reconocida",
	)

	const handleTipoChange = (newTipo: TipoOT) => {
		setTipo(newTipo)
		const presets = CHECKLIST_PRESETS[newTipo].map((item, i) => ({
			...item,
			id: `preset-${newTipo}-${i}`,
		}))
		setChecklist(presets)
		if (errors.tipo) setErrors((prev) => ({ ...prev, tipo: false }))
	}

	const addChecklistItem = () => {
		nextChecklistId++
		setChecklist((prev) => [
			...prev,
			{
				id: `custom-${nextChecklistId}`,
				categoria: "procedimiento",
				descripcion: "",
			},
		])
	}

	const removeChecklistItem = (itemId: string) => {
		setChecklist((prev) => prev.filter((item) => item.id !== itemId))
	}

	const updateChecklistItem = (
		itemId: string,
		field: "categoria" | "descripcion",
		value: string,
	) => {
		setChecklist((prev) =>
			prev.map((item) =>
				item.id === itemId ? { ...item, [field]: value } : item,
			),
		)
	}

	const handleSubmit = () => {
		const newErrors: Record<string, boolean> = {}

		if (!titulo.trim()) newErrors.titulo = true
		if (!descripcion.trim()) newErrors.descripcion = true
		if (!tipo) newErrors.tipo = true
		if (!prioridad) newErrors.prioridad = true
		if (!idEquipo) newErrors.idEquipo = true
		if (!tecnico) newErrors.tecnico = true

		setErrors(newErrors)

		if (Object.keys(newErrors).length === 0) {
			alert("Orden de trabajo creada exitosamente (simulado)")
			router.push("/ordenes-trabajo")
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
									<BreadcrumbLink href="/ordenes-trabajo">
										Ordenes de Trabajo
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>Nueva</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>

				<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
					<Button
						variant="ghost"
						className="w-fit"
						onClick={() => router.push("/ordenes-trabajo")}
					>
						<ArrowLeft className="mr-2 size-4" weight="bold" />
						Volver a Ordenes de Trabajo
					</Button>

					<div>
						<h1 className="text-2xl font-semibold">Nueva Orden de Trabajo</h1>
						<p className="text-sm text-muted-foreground">
							Completa la informacion para crear una nueva orden de trabajo
						</p>
					</div>

					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Informacion Basica</CardTitle>
								<CardDescription>
									Datos principales de la orden de trabajo
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<label
										htmlFor="titulo"
										className="mb-1.5 block text-sm font-medium"
									>
										Titulo <span className="text-red-500">*</span>
									</label>
									<Input
										id="titulo"
										value={titulo}
										onChange={(e) => {
											setTitulo(e.target.value)
											if (errors.titulo)
												setErrors((prev) => ({ ...prev, titulo: false }))
										}}
										placeholder="Ej: Reparacion variador — Torno CNC-01"
										className={cn(
											errors.titulo && "border-red-500 ring-1 ring-red-500/20",
										)}
									/>
									{errors.titulo && (
										<p className="mt-1 text-xs text-red-500">
											El titulo es obligatorio
										</p>
									)}
								</div>

								<div>
									<label
										htmlFor="descripcion"
										className="mb-1.5 block text-sm font-medium"
									>
										Descripcion <span className="text-red-500">*</span>
									</label>
									<textarea
										id="descripcion"
										value={descripcion}
										onChange={(e) => {
											setDescripcion(e.target.value)
											if (errors.descripcion)
												setErrors((prev) => ({
													...prev,
													descripcion: false,
												}))
										}}
										className={cn(
											"w-full rounded-md border bg-background p-3 text-sm",
											errors.descripcion &&
												"border-red-500 ring-1 ring-red-500/20",
										)}
										rows={4}
										placeholder="Describe la intervencion a realizar..."
									/>
									{errors.descripcion && (
										<p className="mt-1 text-xs text-red-500">
											La descripcion es obligatoria
										</p>
									)}
								</div>

								<div>
									<span className="mb-1.5 block text-sm font-medium">
										Tipo <span className="text-red-500">*</span>
									</span>
									<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
										{TIPOS_OT.map((t) => (
											<button
												key={t.value}
												type="button"
												onClick={() => handleTipoChange(t.value)}
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
											Selecciona un tipo
										</p>
									)}
								</div>

								<div>
									<span className="mb-1.5 block text-sm font-medium">
										Prioridad <span className="text-red-500">*</span>
									</span>
									<div className="flex flex-wrap gap-2">
										{PRIORIDADES.map((p) => (
											<button
												key={p.value}
												type="button"
												onClick={() => {
													setPrioridad(p.value)
													if (errors.prioridad)
														setErrors((prev) => ({
															...prev,
															prioridad: false,
														}))
												}}
												className={cn(
													"flex items-center gap-2 rounded-lg border px-4 py-2 transition-all",
													prioridad === p.value
														? "border-primary bg-primary/5"
														: "hover:bg-muted",
													errors.prioridad && "border-red-500",
												)}
											>
												<div className={cn("size-2 rounded-full", p.color)} />
												<span className="text-sm">{p.label}</span>
											</button>
										))}
									</div>
									{errors.prioridad && (
										<p className="mt-1 text-xs text-red-500">
											Selecciona una prioridad
										</p>
									)}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Asignacion</CardTitle>
								<CardDescription>
									Equipo, tecnico y programacion
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid gap-4 sm:grid-cols-2">
									<div>
										<label className="mb-1.5 block text-sm font-medium">
											Equipo <span className="text-red-500">*</span>
										</label>
										<Select
											value={idEquipo}
											onValueChange={(val) => {
												setIdEquipo(val)
												if (errors.idEquipo)
													setErrors((prev) => ({
														...prev,
														idEquipo: false,
													}))
											}}
										>
											<SelectTrigger
												className={cn(
													"w-full",
													errors.idEquipo &&
														"border-red-500 ring-1 ring-red-500/20",
												)}
											>
												<SelectValue placeholder="Seleccionar equipo" />
											</SelectTrigger>
											<SelectContent>
												{equipos.map((eq) => (
													<SelectItem key={eq.id} value={eq.id}>
														{eq.nombre} — {eq.ubicacion}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{errors.idEquipo && (
											<p className="mt-1 text-xs text-red-500">
												Selecciona un equipo
											</p>
										)}
									</div>

									<div>
										<label className="mb-1.5 block text-sm font-medium">
											Alerta relacionada
										</label>
										<Select value={idAlerta} onValueChange={setIdAlerta}>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Ninguna (opcional)" />
											</SelectTrigger>
											<SelectContent>
												{alertasActivas.map((al) => {
													const eq = equipos.find((e) => e.id === al.idEquipo)
													return (
														<SelectItem key={al.id} value={al.id}>
															[{al.codigoFalla}] {eq?.nombre}
														</SelectItem>
													)
												})}
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="grid gap-4 sm:grid-cols-3">
									<div>
										<label className="mb-1.5 block text-sm font-medium">
											Tecnico <span className="text-red-500">*</span>
										</label>
										<Select
											value={tecnico}
											onValueChange={(val) => {
												setTecnico(val)
												if (errors.tecnico)
													setErrors((prev) => ({
														...prev,
														tecnico: false,
													}))
											}}
										>
											<SelectTrigger
												className={cn(
													"w-full",
													errors.tecnico &&
														"border-red-500 ring-1 ring-red-500/20",
												)}
											>
												<SelectValue placeholder="Seleccionar tecnico" />
											</SelectTrigger>
											<SelectContent>
												{tecnicos.map((tec) => (
													<SelectItem key={tec.id} value={tec.nombre}>
														{tec.nombre}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{errors.tecnico && (
											<p className="mt-1 text-xs text-red-500">
												Selecciona un tecnico
											</p>
										)}
									</div>

									<div>
										<label
											htmlFor="fechaProgramada"
											className="mb-1.5 block text-sm font-medium"
										>
											Fecha programada
										</label>
										<Input
											id="fechaProgramada"
											type="date"
											value={fechaProgramada}
											onChange={(e) => setFechaProgramada(e.target.value)}
										/>
									</div>

									<div>
										<label
											htmlFor="tiempoEstimado"
											className="mb-1.5 block text-sm font-medium"
										>
											Tiempo estimado (horas)
										</label>
										<Input
											id="tiempoEstimado"
											type="number"
											min="0"
											step="0.5"
											value={tiempoEstimado}
											onChange={(e) => setTiempoEstimado(e.target.value)}
											placeholder="Ej: 4"
										/>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle>Checklist Inicial</CardTitle>
										<CardDescription>
											{tipo
												? "Items pre-cargados segun el tipo seleccionado"
												: "Selecciona un tipo para cargar items sugeridos"}
										</CardDescription>
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={addChecklistItem}
									>
										<Plus className="mr-2 size-4" weight="bold" />
										Agregar Item
									</Button>
								</div>
							</CardHeader>
							<CardContent>
								{checklist.length === 0 ? (
									<div className="flex flex-col items-center justify-center py-8 text-center">
										<ListChecks className="mb-4 size-12 text-muted-foreground/40" />
										<p className="text-sm text-muted-foreground">
											{tipo
												? "No hay items en el checklist"
												: "Selecciona un tipo de OT para cargar items sugeridos"}
										</p>
										<Button
											variant="outline"
											size="sm"
											className="mt-3"
											onClick={addChecklistItem}
										>
											<Plus className="mr-2 size-4" />
											Agregar manualmente
										</Button>
									</div>
								) : (
									<div className="space-y-3">
										{checklist.map((item) => {
											const catConfig = CATEGORIA_CONFIG[item.categoria]
											const CatIcon = catConfig.icon

											return (
												<div
													key={item.id}
													className="flex items-center gap-3 rounded-lg border p-3"
												>
													<div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
														<CatIcon
															className="size-4 text-muted-foreground"
															weight="duotone"
														/>
													</div>
													<Select
														value={item.categoria}
														onValueChange={(val) =>
															updateChecklistItem(item.id, "categoria", val)
														}
													>
														<SelectTrigger className="w-36 shrink-0">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															{Object.entries(CATEGORIA_CONFIG).map(
																([key, conf]) => (
																	<SelectItem key={key} value={key}>
																		{conf.label}
																	</SelectItem>
																),
															)}
														</SelectContent>
													</Select>
													<Input
														value={item.descripcion}
														onChange={(e) =>
															updateChecklistItem(
																item.id,
																"descripcion",
																e.target.value,
															)
														}
														placeholder="Descripcion del item..."
														className="flex-1"
													/>
													<Button
														variant="ghost"
														size="sm"
														className="h-8 shrink-0 text-muted-foreground hover:text-red-500"
														onClick={() => removeChecklistItem(item.id)}
													>
														<Trash className="size-4" />
													</Button>
												</div>
											)
										})}
									</div>
								)}
							</CardContent>
						</Card>

						<div className="flex items-center justify-end gap-3 pb-6">
							<Button
								variant="outline"
								onClick={() => router.push("/ordenes-trabajo")}
							>
								Cancelar
							</Button>
							<Button onClick={handleSubmit}>
								<Check className="mr-2 size-4" weight="bold" />
								Crear Orden de Trabajo
							</Button>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
