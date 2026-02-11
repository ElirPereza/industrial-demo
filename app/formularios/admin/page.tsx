"use client"

import { PencilSimple, Trash } from "@phosphor-icons/react"
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
import { equipos, formulariosTemplate } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export default function FormAdminPage() {
	const [formularios, setFormularios] = useState(formulariosTemplate)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [selectedFormulario, setSelectedFormulario] = useState<string | null>(
		null,
	)

	const handleToggleActivo = (id: string) => {
		setFormularios((prev) =>
			prev.map((f) => (f.id === id ? { ...f, activo: !f.activo } : f)),
		)
	}

	const handleDelete = () => {
		setFormularios((prev) => prev.filter((f) => f.id !== selectedFormulario))
		setDeleteDialogOpen(false)
		setSelectedFormulario(null)
	}

	// Get unique areas from equipos
	const areas = Array.from(new Set(equipos.map((e) => e.ubicacion)))

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
										<TableHead>Estado</TableHead>
										<TableHead>Versión</TableHead>
										<TableHead>Áreas Asignadas</TableHead>
										<TableHead className="text-right">Acciones</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{formularios.map((formulario) => (
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
												<div className="flex items-center gap-2">
													<Switch
														checked={formulario.activo}
														onCheckedChange={() =>
															handleToggleActivo(formulario.id)
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
											<TableCell>
												<div className="flex flex-wrap gap-1">
													{areas.slice(0, 2).map((area) => (
														<span
															key={area}
															className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
														>
															{area}
														</span>
													))}
													{areas.length > 2 && (
														<span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
															+{areas.length - 2}
														</span>
													)}
												</div>
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
														<PencilSimple className="size-4" weight="duotone" />
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
									))}
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
