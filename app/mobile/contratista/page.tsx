"use client"

import {
	Buildings,
	CheckCircle,
	ClipboardText,
	Clock,
	Star,
	Warning,
} from "@phosphor-icons/react"
import { MobileShell } from "@/components/mobile-shell"
import {
	mapEquipoRow,
	mapFormTemplateRow,
	mapMantenimientoRow,
	mapOrdenRow,
} from "@/lib/data-mappers"
import { useSupabaseQuery } from "@/lib/hooks/use-supabase-query"
import type { Tables } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

const CONTRATISTA_OT_IDS = ["ot-003", "ot-005", "ot-008"]

const documentos = [
	{
		id: "doc-001",
		nombre: "P\u00f3liza de Seguro",
		estado: "vigente" as const,
		vencimiento: "15 Jun 2026",
	},
	{
		id: "doc-002",
		nombre: "Certificado ISO 9001",
		estado: "vigente" as const,
		vencimiento: "30 Dic 2026",
	},
	{
		id: "doc-003",
		nombre: "Licencia Ocupacional",
		estado: "advertencia" as const,
		vencimiento: "20 Mar 2026",
	},
	{
		id: "doc-004",
		nombre: "Capacitaci\u00f3n LOTO",
		estado: "vigente" as const,
		vencimiento: "10 Sep 2026",
	},
]

export default function MobileContratistaPage() {
	const {
		data: equiposData,
		isLoading: loadingEquipos,
		error: errorEquipos,
	} = useSupabaseQuery("equipos", (row) =>
		mapEquipoRow(row as unknown as Tables<"equipos">),
	)
	const {
		data: formulariosData,
		isLoading: loadingFormularios,
		error: errorFormularios,
	} = useSupabaseQuery("form_templates", (row) =>
		mapFormTemplateRow(row as unknown as Tables<"form_templates">),
	)
	const {
		data: ordenesData,
		isLoading: loadingOrdenes,
		error: errorOrdenes,
	} = useSupabaseQuery("ordenes_trabajo", (row) =>
		mapOrdenRow(row as unknown as Tables<"ordenes_trabajo">),
	)
	const {
		data: registrosData,
		isLoading: loadingRegistros,
		error: errorRegistros,
	} = useSupabaseQuery("registros_mantenimiento", (row) =>
		mapMantenimientoRow(row as unknown as Tables<"registros_mantenimiento">),
	)

	const isLoading =
		loadingEquipos || loadingFormularios || loadingOrdenes || loadingRegistros
	const error =
		errorEquipos ?? errorFormularios ?? errorOrdenes ?? errorRegistros
	const equipos = equiposData ?? []
	const formulariosTemplate = formulariosData ?? []
	const ordenesTrabajo = ordenesData ?? []
	const registrosMantenimiento = registrosData ?? []

	const misOTs = ordenesTrabajo.filter((ot) =>
		CONTRATISTA_OT_IDS.includes(ot.id),
	)
	const formulariosActivos = formulariosTemplate.filter((f) => f.activo)
	const registrosRelacionados = registrosMantenimiento.filter((r) =>
		misOTs.some((ot) => ot.idEquipo === r.idEquipo),
	)
	const horasEsteMes = registrosRelacionados
		.filter((registro) => {
			const ahora = new Date()
			return (
				registro.fechaInicio.getMonth() === ahora.getMonth() &&
				registro.fechaInicio.getFullYear() === ahora.getFullYear()
			)
		})
		.reduce((total, registro) => total + registro.horasEmpleadas, 0)

	if (isLoading) {
		return (
			<MobileShell activeTab="/mobile/contratista">
				<div className="flex min-h-[60vh] items-center justify-center px-5 py-6">
					<div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
				</div>
			</MobileShell>
		)
	}

	if (error) {
		return (
			<MobileShell activeTab="/mobile/contratista">
				<div className="flex min-h-[60vh] items-center justify-center px-5 py-6 text-center">
					<p className="text-sm text-muted-foreground">{error}</p>
				</div>
			</MobileShell>
		)
	}

	return (
		<MobileShell activeTab="/mobile/contratista">
			<div className="flex flex-col gap-5 px-5 pb-6 pt-10">
				<div>
					<div className="flex items-center gap-3">
						<div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
							<Buildings className="size-6 text-primary" weight="duotone" />
						</div>
						<div>
							<h1 className="text-lg font-bold tracking-tight text-foreground">
								Mec&aacute;nica Industrial Precisa
							</h1>
							<p className="text-[13px] text-muted-foreground">
								Andr&eacute;s Mart&iacute;nez
							</p>
						</div>
					</div>
					<p className="mt-2 pl-14 text-[11px] text-muted-foreground">
						{formulariosActivos.length} formularios activos &middot;{" "}
						{registrosRelacionados.length} intervenciones
					</p>
				</div>

				<div className="flex flex-col gap-3">
					<div className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm">
						<div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40">
							<ClipboardText
								className="size-5 text-blue-600 dark:text-blue-400"
								weight="duotone"
							/>
						</div>
						<div className="flex-1">
							<p className="text-xs text-muted-foreground">OTs Asignadas</p>
							<p className="text-xl font-bold text-foreground">
								{misOTs.length}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm">
						<div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40">
							<Clock
								className="size-5 text-amber-600 dark:text-amber-400"
								weight="duotone"
							/>
						</div>
						<div className="flex-1">
							<p className="text-xs text-muted-foreground">Horas Este Mes</p>
							<p className="text-xl font-bold text-foreground">
								{horasEsteMes.toFixed(1)}h
							</p>
						</div>
					</div>

					<div className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm">
						<div className="flex size-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/40">
							<Star
								className="size-5 text-green-600 dark:text-green-400"
								weight="fill"
							/>
						</div>
						<div className="flex-1">
							<p className="text-xs text-muted-foreground">
								Calificaci&oacute;n
							</p>
							<div className="flex items-center gap-2">
								<p className="text-xl font-bold text-foreground">4.9</p>
								<div className="flex gap-0.5">
									{[1, 2, 3, 4, 5].map((s) => (
										<Star
											key={`star-${s}`}
											className={cn(
												"size-3.5",
												s <= 4 ? "text-amber-400" : "text-amber-400/40",
											)}
											weight="fill"
										/>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>

				<div>
					<h2 className="mb-3 text-sm font-semibold text-foreground">
						&Oacute;rdenes de Trabajo
					</h2>
					<div className="flex flex-col gap-3">
						{misOTs.map((ot) => {
							const equipo = equipos.find((e) => e.id === ot.idEquipo)
							return (
								<div
									key={ot.id}
									className="rounded-xl border border-border bg-card p-4 shadow-sm"
								>
									<div className="flex items-start justify-between gap-2">
										<p className="text-sm font-medium leading-tight text-foreground">
											{ot.titulo}
										</p>
										<span
											className={cn(
												"shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
												ot.prioridad === "critica" &&
													"bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
												ot.prioridad === "alta" &&
													"bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
												ot.prioridad === "media" &&
													"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
												ot.prioridad === "baja" &&
													"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
											)}
										>
											{ot.prioridad.charAt(0).toUpperCase() +
												ot.prioridad.slice(1)}
										</span>
									</div>
									<p className="mt-1 text-xs text-muted-foreground">
										{equipo?.nombre}
									</p>
									<div className="mt-2">
										<span
											className={cn(
												"rounded-full px-2 py-0.5 text-[10px] font-semibold",
												ot.estado === "en-progreso" &&
													"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
												ot.estado === "completada" &&
													"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
												ot.estado === "creada" &&
													"bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-400",
												ot.estado === "asignada" &&
													"bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
											)}
										>
											{ot.estado === "en-progreso"
												? "En Progreso"
												: ot.estado === "completada"
													? "Completada"
													: ot.estado === "creada"
														? "Creada"
														: "Asignada"}
										</span>
									</div>
								</div>
							)
						})}
					</div>
				</div>

				<div>
					<h2 className="mb-3 text-sm font-semibold text-foreground">
						Documentos
					</h2>
					<div className="flex flex-col gap-2">
						{documentos.map((doc) => (
							<div
								key={doc.id}
								className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm"
							>
								{doc.estado === "vigente" ? (
									<CheckCircle
										className="size-5 shrink-0 text-green-500"
										weight="fill"
									/>
								) : (
									<Warning
										className="size-5 shrink-0 text-amber-500"
										weight="fill"
									/>
								)}
								<div className="min-w-0 flex-1">
									<p className="text-sm font-medium text-foreground">
										{doc.nombre}
									</p>
									<p className="text-xs text-muted-foreground">
										Vence: {doc.vencimiento}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</MobileShell>
	)
}
