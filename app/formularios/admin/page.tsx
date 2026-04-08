"use client"

import {
	Cube,
	Globe,
	MapPin,
	PencilSimple,
	Target,
	Trash,
} from "@phosphor-icons/react"
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
import { Card, CardContent } from "@/components/ui/card"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { PageError } from "@/components/page-error"
import { PageLoading } from "@/components/page-loading"
import { mapEquipoRow, mapFormTemplateRow } from "@/lib/data-mappers"
import { useSupabaseQuery } from "@/lib/hooks/use-supabase-query"
import type { Equipo, FormTemplate } from "@/lib/mock-data"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

export default function FormAdminPage() {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [, setSelectedFormulario] = useState<string | null>(null)
	const [updatingFormId, setUpdatingFormId] = useState<string | null>(null)

	const {
		data: formulariosData,
		isLoading: loadingFormularios,
		error: errorFormularios,
		refetch: refetchFormularios,
	} = useSupabaseQuery("form_templates", (row) =>
		mapFormTemplateRow(row as unknown as Tables<"form_templates">),
	)
	const {
		data: equiposData,
		isLoading: loadingEquipos,
		error: errorEquipos,
		refetch: refetchEquipos,
	} = useSupabaseQuery("equipos", (row) =>
		mapEquipoRow(row as unknown as Tables<"equipos">),
	)

	const isLoading = loadingFormularios || loadingEquipos
	const error = errorFormularios ?? errorEquipos
	const formularios: FormTemplate[] = formulariosData ?? []
	const equipos: Equipo[] = equiposData ?? []

	const handleToggleActivo = async (formulario: FormTemplate) => {
		setUpdatingFormId(formulario.id)

		const supabase = createClient()
		const { error: updateError } = await supabase
			.from("form_templates")
			.update({ activo: !formulario.activo })
			.eq("id", formulario.id)

		setUpdatingFormId(null)

		if (updateError) {
			alert(`No se pudo actualizar el formulario: ${updateError.message}`)
			return
		}

		refetchFormularios()
		alert(
			`Formulario ${!formulario.activo ? "activado" : "desactivado"} exitosamente`,
		)
	}

	const handleDelete = () => {
		setDeleteDialogOpen(false)
		setSelectedFormulario(null)
	}

	if (isLoading) {
		return <PageLoading />
	}

	if (error) {
		return (
			<PageError
				message={error}
				onRetry={() => {
					refetchFormularios()
					refetchEquipos()
				}}
			/>
		)
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
									<BreadcrumbLink href="/formularios">
										Formularios
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>Administración</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>

				<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
					<div>
						<h1 className="text-2xl font-semibold">
							Administración de Formularios
						</h1>
						<p className="text-sm text-muted-foreground">
							Activa, desactiva y gestiona los formularios del sistema
						</p>
					</div>

					<Card>
						<CardContent className="p-0">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Nombre</TableHead>
										<TableHead>Tipo</TableHead>
										<TableHead>Asociación</TableHead>
										<TableHead>Frecuencia</TableHead>
										<TableHead>Estado</TableHead>
										<TableHead>Versión</TableHead>
										<TableHead className="text-right">Acciones</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{formularios.map((formulario) => {
										const getAsociacionInfo = () => {
											switch (formulario.asociacion.tipo) {
												case "equipo": {
													const eq = equipos.find(
														(e) => e.id === formulario.asociacion.valor,
													)
													return {
														icon: Target,
														label: eq?.nombre || "Equipo",
														color:
															"bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
													}
												}
												case "tipo-equipo": {
													return {
														icon: Cube,
														label:
															formulario.asociacion.valor?.replace("-", " ") ||
															"Tipo",
														color:
															"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
													}
												}
												case "area": {
													return {
														icon: MapPin,
														label: formulario.asociacion.valor || "Área",
														color:
															"bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
													}
												}
												default: {
													return {
														icon: Globe,
														label: "Todos los equipos",
														color:
															"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
													}
												}
											}
										}
										const asociacion = getAsociacionInfo()
										const AsociacionIcon = asociacion.icon

										return (
											<TableRow key={formulario.id}>
												<TableCell className="font-medium">
													{formulario.nombre}
												</TableCell>
												<TableCell>
													<span className="capitalize">
														{formulario.tipo.replace("-", " ")}
													</span>
												</TableCell>
												<TableCell>
													<div
														className={cn(
															"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
															asociacion.color,
														)}
													>
														<AsociacionIcon
															className="size-3.5"
															weight="duotone"
														/>
														<span className="capitalize">
															{asociacion.label}
														</span>
													</div>
												</TableCell>
												<TableCell>
													{formulario.frecuencia ? (
														<span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">
															{formulario.frecuencia}
														</span>
													) : (
														<span className="text-xs text-muted-foreground">
															—
														</span>
													)}
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<Switch
															checked={formulario.activo}
															disabled={updatingFormId === formulario.id}
															onCheckedChange={() =>
																void handleToggleActivo(formulario)
															}
														/>
														<span
															className={cn(
																"text-xs font-medium",
																formulario.activo
																	? "text-green-600"
																	: "text-gray-500",
															)}
														>
															{formulario.activo ? "Activo" : "Inactivo"}
														</span>
													</div>
												</TableCell>
												<TableCell>
													<span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
														v{formulario.version}
													</span>
												</TableCell>
												<TableCell className="text-right">
													<div className="flex justify-end gap-2">
														<Button
															variant="ghost"
															size="icon-sm"
															onClick={() => {
																// Visual only
															}}
														>
															<PencilSimple
																className="size-4"
																weight="duotone"
															/>
														</Button>
														<Button
															variant="ghost"
															size="icon-sm"
															onClick={() => {
																setSelectedFormulario(formulario.id)
																setDeleteDialogOpen(true)
															}}
														>
															<Trash className="size-4" weight="duotone" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										)
									})}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</div>
			</SidebarInset>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>¿Eliminar formulario?</DialogTitle>
						<DialogDescription>
							Esta acción no se puede deshacer. El formulario será eliminado
							permanentemente del sistema.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDeleteDialogOpen(false)}
						>
							Cancelar
						</Button>
						<Button variant="destructive" onClick={handleDelete}>
							Eliminar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</SidebarProvider>
	)
}
