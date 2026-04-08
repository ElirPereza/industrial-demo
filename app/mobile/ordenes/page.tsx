"use client"

import { CheckCircle, ClipboardText, User } from "@phosphor-icons/react"
import { useMemo } from "react"
import { MobileShell } from "@/components/mobile-shell"
import { mapEquipoRow, mapOrdenRow } from "@/lib/data-mappers"
import { useSupabaseQuery } from "@/lib/hooks/use-supabase-query"
import type { EstadoOrdenTrabajo, PrioridadOT, TipoOT } from "@/lib/types"
import type { Tables } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

const PRIORIDAD_CONFIG: Record<PrioridadOT, { label: string; bar: string }> = {
	critica: { label: "Critica", bar: "bg-red-500" },
	alta: { label: "Alta", bar: "bg-orange-500" },
	media: { label: "Media", bar: "bg-yellow-500" },
	baja: { label: "Baja", bar: "bg-blue-500" },
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

export default function MobileOrdenesPage() {
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

	const ordenesOrdenadas = useMemo(() => {
		return [...ordenesTrabajo].sort(
			(a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime(),
		)
	}, [ordenesTrabajo])

	const abiertas = ordenesTrabajo.filter((ot) =>
		["creada", "asignada"].includes(ot.estado),
	).length
	const enProgreso = ordenesTrabajo.filter(
		(ot) => ot.estado === "en-progreso",
	).length
	const completadas = ordenesTrabajo.filter((ot) =>
		["completada", "verificada"].includes(ot.estado),
	).length

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

	return (
		<MobileShell activeTab="/mobile/ordenes">
			<div className="flex flex-col gap-4 px-5 pb-4 pt-6">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
						<ClipboardText
							className="size-5 text-blue-600 dark:text-blue-400"
							weight="duotone"
						/>
					</div>
					<div>
						<h1 className="text-lg font-bold tracking-tight text-foreground">
							Ordenes de Trabajo
						</h1>
						<p className="text-xs text-muted-foreground">
							{ordenesTrabajo.length} ordenes registradas
						</p>
					</div>
				</div>

				<div className="grid grid-cols-3 gap-2">
					<div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-2.5">
						<span className="text-xl font-bold tabular-nums text-yellow-600 dark:text-yellow-400">
							{abiertas}
						</span>
						<span className="text-[10px] font-medium text-muted-foreground">
							Abiertas
						</span>
					</div>
					<div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-2.5">
						<span className="text-xl font-bold tabular-nums text-blue-600 dark:text-blue-400">
							{enProgreso}
						</span>
						<span className="text-[10px] font-medium text-muted-foreground">
							En Progreso
						</span>
					</div>
					<div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-2.5">
						<span className="text-xl font-bold tabular-nums text-green-600 dark:text-green-400">
							{completadas}
						</span>
						<span className="text-[10px] font-medium text-muted-foreground">
							Completadas
						</span>
					</div>
				</div>

				<div className="flex flex-col gap-2.5">
					{ordenesOrdenadas.map((ot) => {
						const equipo = equipos.find((e) => e.id === ot.idEquipo)
						const prio = PRIORIDAD_CONFIG[ot.prioridad]
						const estado = ESTADO_CONFIG[ot.estado]
						const tipo = TIPO_CONFIG[ot.tipo]
						const checkDone = ot.checklist.filter((c) => c.completado).length
						const checkTotal = ot.checklist.length
						const checkPercent =
							checkTotal > 0 ? Math.round((checkDone / checkTotal) * 100) : 0
						return (
							<a
								key={ot.id}
								href={`/mobile/ordenes/${ot.id}`}
								className="flex overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-colors active:bg-muted/50"
							>
								<div className={cn("w-1 shrink-0", prio.bar)} />
								<div className="flex min-w-0 flex-1 flex-col gap-2 p-3.5">
									<p className="text-sm font-semibold leading-tight text-foreground">
										{ot.titulo}
									</p>
									<p className="text-xs text-muted-foreground">
										{equipo?.nombre ?? "Equipo desconocido"}
									</p>
									<div className="flex flex-wrap items-center gap-1.5">
										<span
											className={cn(
												"rounded-full px-2 py-0.5 text-[10px] font-semibold",
												tipo.bg,
												tipo.text,
											)}
										>
											{tipo.label}
										</span>
										<span
											className={cn(
												"rounded-full px-2 py-0.5 text-[10px] font-semibold",
												estado.bg,
												estado.text,
											)}
										>
											{estado.label}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-1.5 text-muted-foreground">
											<User className="size-3.5" weight="duotone" />
											<span className="text-[11px]">{ot.tecnicoAsignado}</span>
										</div>
										<div className="flex items-center gap-1.5">
											<CheckCircle
												className="size-3.5 text-muted-foreground"
												weight="duotone"
											/>
											<span className="text-[11px] tabular-nums text-muted-foreground">
												{checkDone}/{checkTotal}
											</span>
										</div>
									</div>
									{checkTotal > 0 && (
										<div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
											<div
												className={cn(
													"h-full rounded-full transition-all",
													checkPercent === 100 ? "bg-green-500" : "bg-primary",
												)}
												style={{
													width: `${checkPercent}%`,
												}}
											/>
										</div>
									)}
								</div>
							</a>
						)
					})}
				</div>
			</div>
		</MobileShell>
	)
}
