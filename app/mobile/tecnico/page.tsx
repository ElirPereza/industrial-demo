"use client"

import {
	ArrowRight,
	ClipboardText,
	QrCode,
	Sun,
	WarningCircle,
} from "@phosphor-icons/react"
import { MobileShell } from "@/components/mobile-shell"
import {
	equipos,
	formulariosTemplate,
	ordenesTrabajo,
	registrosMantenimiento,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const TECNICO_NOMBRE = "María García"

export default function MobileTecnicoPage() {
	const misOrdenes = ordenesTrabajo.filter(
		(ot) => ot.tecnicoAsignado === TECNICO_NOMBRE,
	)
	const otsPendientes = misOrdenes.filter(
		(ot) =>
			ot.estado === "en-progreso" ||
			ot.estado === "asignada" ||
			ot.estado === "creada",
	)

	const formulariosDiarios = formulariosTemplate.filter(
		(f) => f.activo && f.frecuencia === "diario",
	)

	const tareasCompletadas = registrosMantenimiento.filter(
		(r) => r.tecnico === TECNICO_NOMBRE && r.estado === "completado",
	).length

	return (
		<MobileShell activeTab="/mobile/tecnico">
			<div className="flex flex-col gap-5 px-5 pb-6 pt-10">
				<div>
					<div className="flex items-center gap-2.5">
						<Sun className="size-7 text-amber-500" weight="fill" />
						<h1 className="text-xl font-bold tracking-tight text-foreground">
							Buenos d&iacute;as, Mar&iacute;a
						</h1>
					</div>
					<p className="mt-1 pl-[38px] text-[13px] text-muted-foreground">
						{otsPendientes.length} pendientes &middot; {tareasCompletadas}{" "}
						completadas
					</p>
				</div>

				<div className="grid grid-cols-3 gap-3">
					<div className="relative flex flex-col items-center gap-2 rounded-xl bg-blue-50 px-3 py-4 shadow-sm dark:bg-blue-950/40">
						<ClipboardText
							className="size-7 text-blue-600 dark:text-blue-400"
							weight="duotone"
						/>
						<span className="text-center text-[11px] font-semibold leading-tight text-blue-700 dark:text-blue-300">
							Mis &Oacute;rdenes
						</span>
						<span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
							{otsPendientes.length}
						</span>
					</div>

					<div className="flex flex-col items-center gap-2 rounded-xl bg-violet-50 px-3 py-4 shadow-sm dark:bg-violet-950/40">
						<QrCode
							className="size-7 text-violet-600 dark:text-violet-400"
							weight="duotone"
						/>
						<span className="text-center text-[11px] font-semibold leading-tight text-violet-700 dark:text-violet-300">
							Escanear QR
						</span>
					</div>

					<div className="flex flex-col items-center gap-2 rounded-xl bg-orange-50 px-3 py-4 shadow-sm dark:bg-orange-950/40">
						<WarningCircle
							className="size-7 text-orange-600 dark:text-orange-400"
							weight="duotone"
						/>
						<span className="text-center text-[11px] font-semibold leading-tight text-orange-700 dark:text-orange-300">
							Reportar Falla
						</span>
					</div>
				</div>

				<div>
					<h2 className="mb-3 text-sm font-semibold text-foreground">
						&Oacute;rdenes Asignadas
					</h2>
					<div className="flex flex-col gap-3">
						{misOrdenes
							.filter(
								(ot) => ot.estado !== "verificada" && ot.estado !== "cancelada",
							)
							.sort((a, b) => {
								const p = { critica: 0, alta: 1, media: 2, baja: 3 }
								return p[a.prioridad] - p[b.prioridad]
							})
							.map((ot) => {
								const equipo = equipos.find((e) => e.id === ot.idEquipo)
								const completados = ot.checklist.filter(
									(c) => c.completado,
								).length
								const total = ot.checklist.length
								return (
									<div
										key={ot.id}
										className={cn(
											"rounded-xl border border-border bg-card p-4 shadow-sm",
											"border-l-[4px]",
											ot.prioridad === "critica" && "border-l-red-500",
											ot.prioridad === "alta" && "border-l-orange-500",
											ot.prioridad === "media" && "border-l-yellow-500",
											ot.prioridad === "baja" && "border-l-blue-500",
										)}
									>
										<div className="flex items-start justify-between gap-2">
											<p className="text-sm font-medium leading-tight text-foreground">
												{ot.titulo}
											</p>
											<span
												className={cn(
													"shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
													ot.estado === "en-progreso" &&
														"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
													ot.estado === "asignada" &&
														"bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
													ot.estado === "creada" &&
														"bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-400",
													ot.estado === "completada" &&
														"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
												)}
											>
												{ot.estado === "en-progreso"
													? "En Progreso"
													: ot.estado === "asignada"
														? "Asignada"
														: ot.estado === "creada"
															? "Creada"
															: "Completada"}
											</span>
										</div>
										<p className="mt-1 text-xs text-muted-foreground">
											{equipo?.nombre}
										</p>
										<div className="mt-2.5 flex items-center gap-2">
											<div className="h-1.5 flex-1 rounded-full bg-muted">
												<div
													className="h-full rounded-full bg-green-500 transition-all"
													style={{
														width: `${total > 0 ? (completados / total) * 100 : 0}%`,
													}}
												/>
											</div>
											<span className="text-[10px] tabular-nums text-muted-foreground">
												{completados}/{total}
											</span>
										</div>
									</div>
								)
							})}
					</div>
				</div>

				<div>
					<h2 className="mb-3 text-sm font-semibold text-foreground">
						Formularios Diarios
					</h2>
					<div className="flex flex-col gap-2">
						{formulariosDiarios.map((form) => (
							<div
								key={form.id}
								className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-sm"
							>
								<div className="min-w-0 flex-1">
									<p className="text-sm font-medium text-foreground">
										{form.nombre}
									</p>
									<p className="text-xs text-muted-foreground">
										{form.descripcion}
									</p>
								</div>
								<div className="ml-3 flex shrink-0 items-center gap-1 rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background">
									Llenar
									<ArrowRight className="size-3" weight="fill" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</MobileShell>
	)
}
