import {
	Buildings,
	CheckCircle,
	Clock,
	FileText,
	Star,
	Warning,
	Wrench,
} from "@phosphor-icons/react"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import type { Equipo, OrdenTrabajo } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const CONTRATISTA = {
	empresa: "Mecánica Industrial Precisa",
	nombre: "Andrés Martínez",
	calificacion: 4.9,
	horasEsteMes: 24.5,
}

const documentosRequeridos = [
	{
		nombre: "Póliza de Seguro",
		estado: "vigente" as const,
		detalle: "Vigente hasta 30/06/2025",
	},
	{
		nombre: "Certificado ARL",
		estado: "vigente" as const,
		detalle: "Vigente hasta 31/12/2025",
	},
	{
		nombre: "Certificado Alturas",
		estado: "advertencia" as const,
		detalle: "Vence en 15 días",
	},
	{
		nombre: "Hoja de Vida Actualizada",
		estado: "vigente" as const,
		detalle: "Al día",
	},
]

const horasRegistradas = [
	{
		fecha: "07/02/2026",
		equipo: "Compresor Eléctrico-03",
		horas: 3.5,
		descripcion: "Análisis de vibraciones predictivo",
	},
	{
		fecha: "06/02/2026",
		equipo: "Prensa Hidráulica-02",
		horas: 6,
		descripcion: "Cambio de aceite hidráulico y filtros",
	},
	{
		fecha: "05/02/2026",
		equipo: "Compresor Eléctrico-03",
		horas: 4,
		descripcion: "Reemplazo de rodamientos",
	},
	{
		fecha: "03/02/2026",
		equipo: "Línea Pintura-03",
		horas: 8,
		descripcion: "Reparación sistema de aspersión",
	},
	{
		fecha: "01/02/2026",
		equipo: "Taladro Radial-04",
		horas: 3,
		descripcion: "Inspección y calibración de mesa",
	},
]

interface ContratistaViewProps {
	equipos: Equipo[]
	ordenesTrabajo: OrdenTrabajo[]
}

export function ContratistaView({
	equipos,
	ordenesTrabajo,
}: ContratistaViewProps) {
	const otContratista = [
		ordenesTrabajo.find((ot) => ot.id === "ot-003"),
		ordenesTrabajo.find((ot) => ot.id === "ot-005"),
		ordenesTrabajo.find((ot) => ot.id === "ot-008"),
	].filter(Boolean)
	const totalHoras = horasRegistradas.reduce((sum, h) => sum + h.horas, 0)

	return (
		<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
			<div className="flex items-center gap-4">
				<div className="flex size-12 items-center justify-center rounded-xl bg-muted">
					<Buildings
						className="size-6 text-muted-foreground"
						weight="duotone"
					/>
				</div>
				<div>
					<div className="flex items-center gap-2">
						<h2 className="text-xl font-semibold tracking-tight">
							Portal de Contratista
						</h2>
					</div>
					<p className="text-sm text-muted-foreground">
						{CONTRATISTA.empresa} &bull; Bienvenido, {CONTRATISTA.nombre}
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-px rounded-xl bg-border sm:grid-cols-3">
				{[
					{
						id: "ots-asignadas",
						name: "OTs Asignadas",
						value: String(otContratista.length),
						icon: <Wrench className="size-4 text-blue-600" weight="duotone" />,
						accent: "text-blue-600 dark:text-blue-400",
					},
					{
						id: "horas-mes",
						name: "Horas Este Mes",
						value: `${CONTRATISTA.horasEsteMes}h`,
						icon: <Clock className="size-4 text-violet-600" weight="duotone" />,
						accent: "text-violet-600 dark:text-violet-400",
					},
					{
						id: "calificacion",
						name: "Calificación",
						value: String(CONTRATISTA.calificacion),
						icon: <Star className="size-4 text-amber-500" weight="fill" />,
						accent: "text-amber-500 dark:text-amber-400",
						suffix: (
							<div className="flex items-center gap-0.5">
								{Array.from({ length: 5 }).map((_, i) => (
									<Star
										key={`star-${i}`}
										className={cn(
											"size-3.5",
											i < Math.floor(CONTRATISTA.calificacion)
												? "text-amber-500"
												: "text-gray-300 dark:text-gray-600",
										)}
										weight={
											i < Math.floor(CONTRATISTA.calificacion)
												? "fill"
												: "regular"
										}
									/>
								))}
							</div>
						),
					},
				].map((stat) => (
					<Card
						key={stat.id}
						className={cn(
							"rounded-none border-0 shadow-none py-0",
							stat.id === "ots-asignadas" && "rounded-l-xl",
							stat.id === "calificacion" && "rounded-r-xl",
						)}
					>
						<CardContent className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 p-4 sm:p-6">
							<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
								{stat.icon}
								{stat.name}
							</div>
							<div
								className={cn(
									"tabular-nums w-full flex-none text-3xl font-medium tracking-tight",
									stat.accent,
								)}
							>
								{stat.value}
							</div>
							{stat.suffix && <div className="w-full">{stat.suffix}</div>}
						</CardContent>
					</Card>
				))}
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Wrench className="size-5 text-blue-600" weight="duotone" />
						Mis Órdenes de Trabajo
					</CardTitle>
					<CardDescription>Órdenes asignadas a tu empresa</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b text-left text-muted-foreground">
									<th className="pb-3 font-medium">ID</th>
									<th className="pb-3 font-medium">Título</th>
									<th className="pb-3 font-medium">Equipo</th>
									<th className="pb-3 font-medium">Prioridad</th>
									<th className="pb-3 font-medium">Estado</th>
									<th className="pb-3 font-medium">Fecha Límite</th>
								</tr>
							</thead>
							<tbody className="divide-y">
								{otContratista.map((ot) => {
									if (!ot) return null
									const equipo = equipos.find((e) => e.id === ot.idEquipo)
									return (
										<tr key={ot.id}>
											<td className="py-3 font-mono text-xs text-muted-foreground">
												{ot.id.toUpperCase()}
											</td>
											<td className="py-3 font-medium">{ot.titulo}</td>
											<td className="py-3 text-muted-foreground">
												{equipo?.nombre}
											</td>
											<td className="py-3">
												<span
													className={cn(
														"rounded-full px-2 py-0.5 text-xs font-medium",
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
													{ot.prioridad === "critica"
														? "Crítica"
														: ot.prioridad === "alta"
															? "Alta"
															: ot.prioridad === "media"
																? "Media"
																: "Baja"}
												</span>
											</td>
											<td className="py-3">
												<span
													className={cn(
														"rounded-full px-2 py-0.5 text-xs font-medium",
														ot.estado === "en-progreso" &&
															"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
														ot.estado === "completada" &&
															"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
														ot.estado === "creada" &&
															"bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
														ot.estado === "asignada" &&
															"bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
														ot.estado === "verificada" &&
															"bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
													)}
												>
													{ot.estado === "en-progreso"
														? "En Progreso"
														: ot.estado === "completada"
															? "Completada"
															: ot.estado === "creada"
																? "Creada"
																: ot.estado === "asignada"
																	? "Asignada"
																	: "Verificada"}
												</span>
											</td>
											<td className="py-3 text-muted-foreground tabular-nums">
												{ot.fechaInicioProgramada?.toLocaleDateString("es-ES", {
													day: "2-digit",
													month: "short",
													year: "numeric",
												}) ?? "—"}
											</td>
										</tr>
									)
								})}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FileText className="size-5 text-violet-600" weight="duotone" />
							Documentos Requeridos
						</CardTitle>
						<CardDescription>
							Estado de documentación obligatoria
						</CardDescription>
					</CardHeader>
					<CardContent className="p-0">
						<div className="divide-y">
							{documentosRequeridos.map((doc) => (
								<div
									key={doc.nombre}
									className="flex items-center gap-4 px-6 py-4"
								>
									{doc.estado === "vigente" ? (
										<CheckCircle
											className="size-5 shrink-0 text-green-600"
											weight="fill"
										/>
									) : (
										<Warning
											className="size-5 shrink-0 text-amber-500"
											weight="fill"
										/>
									)}
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium">{doc.nombre}</p>
										<p
											className={cn(
												"text-xs",
												doc.estado === "vigente"
													? "text-muted-foreground"
													: "text-amber-600 dark:text-amber-400",
											)}
										>
											{doc.detalle}
										</p>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Clock className="size-5 text-blue-600" weight="duotone" />
							Horas Registradas
						</CardTitle>
						<CardDescription>Registro de horas del mes actual</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b text-left text-muted-foreground">
										<th className="pb-3 font-medium">Fecha</th>
										<th className="pb-3 font-medium">Equipo</th>
										<th className="pb-3 font-medium text-right">Horas</th>
										<th className="pb-3 font-medium">Descripción</th>
									</tr>
								</thead>
								<tbody className="divide-y">
									{horasRegistradas.map((entrada) => (
										<tr key={`${entrada.fecha}-${entrada.equipo}`}>
											<td className="py-3 tabular-nums text-muted-foreground">
												{entrada.fecha}
											</td>
											<td className="py-3 font-medium">{entrada.equipo}</td>
											<td className="py-3 text-right tabular-nums">
												{entrada.horas}h
											</td>
											<td className="py-3 text-muted-foreground">
												{entrada.descripcion}
											</td>
										</tr>
									))}
								</tbody>
								<tfoot>
									<tr className="border-t-2">
										<td colSpan={2} className="py-3 text-sm font-semibold">
											Total
										</td>
										<td className="py-3 text-right text-sm font-semibold tabular-nums">
											{totalHoras}h
										</td>
										<td />
									</tr>
								</tfoot>
							</table>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
