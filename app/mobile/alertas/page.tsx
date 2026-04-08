"use client"

import { BellRinging } from "@phosphor-icons/react"
import { useMemo, useState } from "react"
import { MobileShell } from "@/components/mobile-shell"
import { mapAlertaRow, mapEquipoRow } from "@/lib/data-mappers"
import { useSupabaseQuery } from "@/lib/hooks/use-supabase-query"
import type { EstadoAlerta, SeveridadAlerta } from "@/lib/types"
import type { Tables } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

function tiempoRelativo(fecha: Date): string {
	const ahora = new Date()
	const diffMs = ahora.getTime() - fecha.getTime()
	const diffMin = Math.floor(diffMs / 60000)
	const diffHoras = Math.floor(diffMs / 3600000)
	const diffDias = Math.floor(diffMs / 86400000)

	if (diffMin < 1) return "Justo ahora"
	if (diffMin < 60) return `Hace ${diffMin} min`
	if (diffHoras < 24) return `Hace ${diffHoras}h`
	return `Hace ${diffDias}d`
}

const SEVERIDAD_CONFIG: Record<
	SeveridadAlerta,
	{ label: string; dot: string; bg: string; text: string; bar: string }
> = {
	critica: {
		label: "Critica",
		dot: "bg-red-500",
		bg: "bg-red-50 dark:bg-red-950/30",
		text: "text-red-700 dark:text-red-400",
		bar: "bg-red-500",
	},
	alta: {
		label: "Alta",
		dot: "bg-orange-500",
		bg: "bg-orange-50 dark:bg-orange-950/30",
		text: "text-orange-700 dark:text-orange-400",
		bar: "bg-orange-500",
	},
	media: {
		label: "Media",
		dot: "bg-yellow-500",
		bg: "bg-yellow-50 dark:bg-yellow-950/30",
		text: "text-yellow-700 dark:text-yellow-400",
		bar: "bg-yellow-500",
	},
	baja: {
		label: "Baja",
		dot: "bg-blue-500",
		bg: "bg-blue-50 dark:bg-blue-950/30",
		text: "text-blue-700 dark:text-blue-400",
		bar: "bg-blue-500",
	},
	info: {
		label: "Info",
		dot: "bg-gray-400",
		bg: "bg-gray-50 dark:bg-gray-900/30",
		text: "text-gray-600 dark:text-gray-400",
		bar: "bg-gray-400",
	},
}

const ESTADO_ALERTA_CONFIG: Record<
	EstadoAlerta,
	{ label: string; classes: string }
> = {
	activa: {
		label: "Activa",
		classes: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
	},
	reconocida: {
		label: "Reconocida",
		classes:
			"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
	},
	resuelta: {
		label: "Resuelta",
		classes:
			"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
	},
}

type FiltroSeveridad = SeveridadAlerta | "todas"

const FILTROS: { valor: FiltroSeveridad; label: string }[] = [
	{ valor: "todas", label: "Todas" },
	{ valor: "critica", label: "Critica" },
	{ valor: "alta", label: "Alta" },
	{ valor: "media", label: "Media" },
	{ valor: "baja", label: "Baja" },
	{ valor: "info", label: "Info" },
]

export default function MobileAlertasPage() {
	const [filtro, setFiltro] = useState<FiltroSeveridad>("todas")
	const {
		data: alertasData,
		isLoading: loadingAlertas,
		error: errorAlertas,
	} = useSupabaseQuery("alertas_equipos", (row) =>
		mapAlertaRow(row as unknown as Tables<"alertas_equipos">),
	)
	const {
		data: equiposData,
		isLoading: loadingEquipos,
		error: errorEquipos,
	} = useSupabaseQuery("equipos", (row) =>
		mapEquipoRow(row as unknown as Tables<"equipos">),
	)

	const isLoading = loadingAlertas || loadingEquipos
	const error = errorAlertas ?? errorEquipos
	const alertasEquipos = alertasData ?? []
	const equipos = equiposData ?? []

	const alertasFiltradas = useMemo(() => {
		return [...alertasEquipos]
			.sort((a, b) => b.fechaDeteccion.getTime() - a.fechaDeteccion.getTime())
			.filter((alerta) => filtro === "todas" || alerta.severidad === filtro)
	}, [filtro])

	if (isLoading) {
		return (
			<MobileShell activeTab="/mobile/alertas">
				<div className="flex min-h-[60vh] items-center justify-center px-5 py-6">
					<div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
				</div>
			</MobileShell>
		)
	}

	if (error) {
		return (
			<MobileShell activeTab="/mobile/alertas">
				<div className="flex min-h-[60vh] items-center justify-center px-5 py-6 text-center">
					<p className="text-sm text-muted-foreground">{error}</p>
				</div>
			</MobileShell>
		)
	}

	return (
		<MobileShell activeTab="/mobile/alertas">
			<div className="flex flex-col gap-4 px-5 pb-4 pt-6">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
						<BellRinging
							className="size-5 text-red-600 dark:text-red-400"
							weight="duotone"
						/>
					</div>
					<div>
						<h1 className="text-lg font-bold tracking-tight text-foreground">
							Centro de Alertas
						</h1>
						<p className="text-xs text-muted-foreground">
							{alertasEquipos.filter((a) => a.estado === "activa").length}{" "}
							activas de {alertasEquipos.length} totales
						</p>
					</div>
				</div>

				<div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-none">
					{FILTROS.map((f) => {
						const isActive = filtro === f.valor
						const dotClass =
							f.valor !== "todas" ? SEVERIDAD_CONFIG[f.valor].dot : null
						return (
							<button
								key={f.valor}
								type="button"
								onClick={() => setFiltro(f.valor)}
								className={cn(
									"flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
									isActive
										? "bg-foreground text-background shadow-sm"
										: "bg-muted text-muted-foreground",
								)}
							>
								{dotClass && (
									<span className={cn("size-2 rounded-full", dotClass)} />
								)}
								{f.label}
							</button>
						)
					})}
				</div>

				<div className="flex flex-col gap-2.5">
					{alertasFiltradas.map((alerta) => {
						const equipo = equipos.find((e) => e.id === alerta.idEquipo)
						const sev = SEVERIDAD_CONFIG[alerta.severidad]
						const est = ESTADO_ALERTA_CONFIG[alerta.estado]
						return (
							<div
								key={alerta.id}
								className="flex overflow-hidden rounded-xl border border-border bg-card shadow-sm"
							>
								<div className={cn("w-1 shrink-0", sev.bar)} />
								<div className="flex min-w-0 flex-1 flex-col gap-2 p-3.5">
									<div className="flex items-start justify-between gap-2">
										<p className="text-sm font-semibold leading-tight text-foreground">
											{equipo?.nombre ?? "Equipo desconocido"}
										</p>
										<span
											className={cn(
												"shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
												est.classes,
											)}
										>
											{est.label}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground">
											{alerta.codigoFalla}
										</code>
										<span
											className={cn(
												"rounded-full px-2 py-0.5 text-[10px] font-medium",
												sev.bg,
												sev.text,
											)}
										>
											{sev.label}
										</span>
									</div>
									<p className="text-xs leading-relaxed text-muted-foreground">
										{alerta.descripcionFalla}
									</p>
									<div className="flex items-center justify-between">
										<span className="text-[11px] text-muted-foreground">
											{alerta.marca} {alerta.modelo}
										</span>
										<span className="text-[11px] tabular-nums text-muted-foreground">
											{tiempoRelativo(alerta.fechaDeteccion)}
										</span>
									</div>
								</div>
							</div>
						)
					})}

					{alertasFiltradas.length === 0 && (
						<div className="flex flex-col items-center gap-2 py-12 text-center">
							<BellRinging
								className="size-10 text-muted-foreground/40"
								weight="duotone"
							/>
							<p className="text-sm text-muted-foreground">
								Sin alertas para este filtro
							</p>
						</div>
					)}
				</div>
			</div>
		</MobileShell>
	)
}
