"use client"

import {
	ArrowLeft,
	CalendarBlank,
	CheckCircle,
	Circle,
	Clock,
	ListChecks,
	MapPin,
	NoteBlank,
	Package,
	ShieldCheck,
	User,
	Warning,
	Wrench,
} from "@phosphor-icons/react"
import { use, useEffect, useState } from "react"
import { MobileShell } from "@/components/mobile-shell"
import { mapEquipoRow, mapOrdenRow } from "@/lib/data-mappers"
import { useSupabaseQuery } from "@/lib/hooks/use-supabase-query"
import type { EstadoOrdenTrabajo, PrioridadOT, TipoOT } from "@/lib/types"
import type { Tables } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

const PRIORIDAD_CONFIG: Record<
	PrioridadOT,
	{ label: string; bg: string; text: string }
> = {
	critica: {
		label: "Critica",
		bg: "bg-red-100 dark:bg-red-900/30",
		text: "text-red-800 dark:text-red-400",
	},
	alta: {
		label: "Alta",
		bg: "bg-orange-100 dark:bg-orange-900/30",
		text: "text-orange-800 dark:text-orange-400",
	},
	media: {
		label: "Media",
		bg: "bg-yellow-100 dark:bg-yellow-900/30",
		text: "text-yellow-800 dark:text-yellow-400",
	},
	baja: {
		label: "Baja",
		bg: "bg-blue-100 dark:bg-blue-900/30",
		text: "text-blue-800 dark:text-blue-400",
	},
}

const ESTADO_CONFIG: Record<
	EstadoOrdenTrabajo,
	{ label: string; bg: string; text: string }
> = {
	creada: {
		label: "Creada",
		bg: "bg-gray-100 dark:bg-gray-900/30",
		text: "text-gray-800 dark:text-gray-400",
	},
	asignada: {
		label: "Asignada",
		bg: "bg-blue-100 dark:bg-blue-900/30",
		text: "text-blue-800 dark:text-blue-400",
	},
	"en-progreso": {
		label: "En Progreso",
		bg: "bg-yellow-100 dark:bg-yellow-900/30",
		text: "text-yellow-800 dark:text-yellow-400",
	},
	completada: {
		label: "Completada",
		bg: "bg-green-100 dark:bg-green-900/30",
		text: "text-green-800 dark:text-green-400",
	},
	verificada: {
		label: "Verificada",
		bg: "bg-purple-100 dark:bg-purple-900/30",
		text: "text-purple-800 dark:text-purple-400",
	},
	cancelada: {
		label: "Cancelada",
		bg: "bg-red-100 dark:bg-red-900/30",
		text: "text-red-800 dark:text-red-400",
	},
}

const TIPO_CONFIG: Record<TipoOT, { label: string; bg: string; text: string }> =
	{
		correctiva: {
			label: "Correctiva",
			bg: "bg-orange-100 dark:bg-orange-900/30",
			text: "text-orange-800 dark:text-orange-400",
		},
		preventiva: {
			label: "Preventiva",
			bg: "bg-blue-100 dark:bg-blue-900/30",
			text: "text-blue-800 dark:text-blue-400",
		},
		predictiva: {
			label: "Predictiva",
			bg: "bg-cyan-100 dark:bg-cyan-900/30",
			text: "text-cyan-800 dark:text-cyan-400",
		},
		mejora: {
			label: "Mejora",
			bg: "bg-emerald-100 dark:bg-emerald-900/30",
			text: "text-emerald-800 dark:text-emerald-400",
		},
	}

const CATEGORIA_CONFIG: Record<
	string,
	{
		label: string
		icon: typeof Wrench
		bg: string
		text: string
	}
> = {
	epp: {
		label: "EPP",
		icon: ShieldCheck,
		bg: "bg-green-100 dark:bg-green-900/30",
		text: "text-green-700 dark:text-green-400",
	},
	herramienta: {
		label: "Herramientas",
		icon: Wrench,
		bg: "bg-blue-100 dark:bg-blue-900/30",
		text: "text-blue-700 dark:text-blue-400",
	},
	repuesto: {
		label: "Repuestos",
		icon: Package,
		bg: "bg-orange-100 dark:bg-orange-900/30",
		text: "text-orange-700 dark:text-orange-400",
	},
	procedimiento: {
		label: "Procedimientos",
		icon: ListChecks,
		bg: "bg-purple-100 dark:bg-purple-900/30",
		text: "text-purple-700 dark:text-purple-400",
	},
}

const ESTADO_EQUIPO_CONFIG: Record<
	string,
	{ label: string; bg: string; text: string }
> = {
	operativo: {
		label: "Operativo",
		bg: "bg-green-100 dark:bg-green-900/30",
		text: "text-green-800 dark:text-green-400",
	},
	mantenimiento: {
		label: "En mantenimiento",
		bg: "bg-yellow-100 dark:bg-yellow-900/30",
		text: "text-yellow-800 dark:text-yellow-400",
	},
	"fuera-servicio": {
		label: "Fuera de servicio",
		bg: "bg-red-100 dark:bg-red-900/30",
		text: "text-red-800 dark:text-red-400",
	},
}

export default function MobileOrdenDetallePage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = use(params)
	const {
		data: ordenesData,
		isLoading: loadingOrdenes,
		error: errorOrdenes,
	} = useSupabaseQuery("ordenes_trabajo", (row) =>
		mapOrdenRow(row as unknown as Tables<"ordenes_trabajo">),
	)
	const {
		data: equiposData,
		isLoading: loadingEquipos,
		error: errorEquipos,
	} = useSupabaseQuery("equipos", (row) =>
		mapEquipoRow(row as unknown as Tables<"equipos">),
	)

	const isLoading = loadingOrdenes || loadingEquipos
	const error = errorOrdenes ?? errorEquipos
	const ordenesTrabajo = ordenesData ?? []
	const equipos = equiposData ?? []
	const ot = ordenesTrabajo.find((orden) => orden.id === id)
	const equipo = ot ? equipos.find((item) => item.id === ot.idEquipo) : null

	const [checklistState, setChecklistState] = useState<Record<string, boolean>>(
		{},
	)

	useEffect(() => {
		if (!ot) {
			setChecklistState({})
			return
		}

		const initial: Record<string, boolean> = {}
		for (const item of ot.checklist) {
			initial[item.id] = item.completado
		}
		setChecklistState(initial)
	}, [ot])

	if (isLoading) {
		return (
			<MobileShell activeTab="/mobile/ordenes">
				<div className="flex min-h-[60vh] items-center justify-center px-5 py-6">
					<div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
				</div>
			</MobileShell>
		)
	}

	if (error) {
		return (
			<MobileShell activeTab="/mobile/ordenes">
				<div className="flex min-h-[60vh] items-center justify-center px-5 py-6 text-center">
					<p className="text-sm text-muted-foreground">{error}</p>
				</div>
			</MobileShell>
		)
	}

	if (!ot) {
		return (
			<MobileShell activeTab="/mobile/ordenes">
				<div className="flex flex-col items-center gap-3 px-5 pb-4 pt-16 text-center">
					<Warning
						className="size-12 text-muted-foreground/40"
						weight="duotone"
					/>
					<p className="text-sm font-medium text-foreground">
						Orden no encontrada
					</p>
					<p className="text-xs text-muted-foreground">
						La orden de trabajo solicitada no existe
					</p>
					<a
						href="/mobile/ordenes"
						className="mt-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
					>
						Volver a ordenes
					</a>
				</div>
			</MobileShell>
		)
	}

	const prio = PRIORIDAD_CONFIG[ot.prioridad]
	const estado = ESTADO_CONFIG[ot.estado]
	const tipo = TIPO_CONFIG[ot.tipo]
	const estadoEquipo = equipo ? ESTADO_EQUIPO_CONFIG[equipo.estado] : null

	const checkDone = Object.values(checklistState).filter(Boolean).length
	const checkTotal = ot.checklist.length
	const checkPercent =
		checkTotal > 0 ? Math.round((checkDone / checkTotal) * 100) : 0

	function toggleCheck(itemId: string) {
		setChecklistState((prev) => ({
			...prev,
			[itemId]: !prev[itemId],
		}))
	}

	const categorias = Array.from(new Set(ot.checklist.map((c) => c.categoria)))

	return (
		<MobileShell activeTab="/mobile/ordenes">
			<div className="flex flex-col gap-4 px-5 pb-4 pt-4">
				<a
					href="/mobile/ordenes"
					className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
				>
					<ArrowLeft className="size-4" weight="bold" />
					Ordenes
				</a>

				<div className="flex flex-col gap-3">
					<h1 className="text-base font-bold leading-snug text-foreground">
						{ot.titulo}
					</h1>
					<div className="flex flex-wrap items-center gap-1.5">
						<span
							className={cn(
								"rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
								prio.bg,
								prio.text,
							)}
						>
							{prio.label}
						</span>
						<span
							className={cn(
								"rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
								estado.bg,
								estado.text,
							)}
						>
							{estado.label}
						</span>
					</div>
				</div>

				<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
					<div
						className={cn(
							"h-full rounded-full transition-all duration-500",
							checkPercent === 100 ? "bg-green-500" : "bg-primary",
						)}
						style={{ width: `${checkPercent}%` }}
					/>
				</div>
				<p className="text-center text-xs tabular-nums text-muted-foreground">
					{checkDone} de {checkTotal} completados ({checkPercent}%)
				</p>

				<div className="rounded-xl border border-border bg-card p-3.5">
					<p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Informacion
					</p>
					<div className="flex flex-col gap-2.5">
						<div className="flex items-center gap-2.5">
							<span
								className={cn(
									"rounded-full px-2 py-0.5 text-[10px] font-semibold",
									tipo.bg,
									tipo.text,
								)}
							>
								{tipo.label}
							</span>
						</div>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<User className="size-3.5 shrink-0" weight="duotone" />
							<span>Solicitante: {ot.solicitante}</span>
						</div>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<CalendarBlank className="size-3.5 shrink-0" weight="duotone" />
							<span>
								Creada:{" "}
								{ot.fechaCreacion.toLocaleDateString("es-ES", {
									day: "2-digit",
									month: "short",
									year: "numeric",
								})}
							</span>
						</div>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<Clock className="size-3.5 shrink-0" weight="duotone" />
							<span>Estimado: {ot.tiempoEstimadoHoras}h</span>
						</div>
					</div>
				</div>

				{equipo && (
					<div className="rounded-xl border border-border bg-card p-3.5">
						<p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Equipo
						</p>
						<div className="flex flex-col gap-2">
							<p className="text-sm font-semibold text-foreground">
								{equipo.nombre}
							</p>
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<MapPin className="size-3.5 shrink-0" weight="duotone" />
								<span>{equipo.ubicacion}</span>
							</div>
							{estadoEquipo && (
								<span
									className={cn(
										"w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold",
										estadoEquipo.bg,
										estadoEquipo.text,
									)}
								>
									{estadoEquipo.label}
								</span>
							)}
						</div>
					</div>
				)}

				<div className="flex flex-col gap-3">
					<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Checklist
					</p>
					{categorias.map((cat) => {
						const config = CATEGORIA_CONFIG[cat]
						if (!config) return null
						const items = ot.checklist.filter((c) => c.categoria === cat)
						const CatIcon = config.icon
						return (
							<div
								key={cat}
								className="rounded-xl border border-border bg-card p-3.5"
							>
								<div className="mb-2.5 flex items-center gap-2">
									<div
										className={cn(
											"flex size-6 items-center justify-center rounded-lg",
											config.bg,
										)}
									>
										<CatIcon
											className={cn("size-3.5", config.text)}
											weight="duotone"
										/>
									</div>
									<span className="text-xs font-semibold text-foreground">
										{config.label}
									</span>
								</div>
								<div className="flex flex-col gap-1.5">
									{items.map((item) => {
										const checked = checklistState[item.id] ?? false
										return (
											<button
												key={item.id}
												type="button"
												onClick={() => toggleCheck(item.id)}
												className="flex items-start gap-2.5 rounded-lg p-1.5 text-left transition-colors active:bg-muted/50"
											>
												{checked ? (
													<CheckCircle
														className="mt-0.5 size-4 shrink-0 text-green-500"
														weight="fill"
													/>
												) : (
													<Circle
														className="mt-0.5 size-4 shrink-0 text-muted-foreground/50"
														weight="regular"
													/>
												)}
												<span
													className={cn(
														"text-xs leading-relaxed",
														checked
															? "text-muted-foreground line-through"
															: "text-foreground",
													)}
												>
													{item.descripcion}
												</span>
											</button>
										)
									})}
								</div>
							</div>
						)
					})}
				</div>

				{ot.notas && (
					<div className="rounded-xl border border-border bg-card p-3.5">
						<div className="mb-2 flex items-center gap-2">
							<NoteBlank
								className="size-4 text-muted-foreground"
								weight="duotone"
							/>
							<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								Notas
							</p>
						</div>
						<p className="text-xs leading-relaxed text-muted-foreground">
							{ot.notas}
						</p>
					</div>
				)}
			</div>
		</MobileShell>
	)
}
