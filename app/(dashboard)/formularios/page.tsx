"use client"

import { Eye, PencilSimple, Plus, Trash } from "@phosphor-icons/react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
	getEnvios,
	type EnvioFormulario,
} from "@/app/(dashboard)/formularios/envios-actions"
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
	SidebarInset,
	SidebarTrigger,
} from "@/components/ui/sidebar"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export default function FormulariosPage() {
	const router = useRouter()
	const [envios, setEnvios] = useState<EnvioFormulario[]>([])
	const [selectedEnvio, setSelectedEnvio] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)
	const [filtroEstado, setFiltroEstado] = useState<string | undefined>(
		undefined,
	)

	useEffect(() => {
		async function loadData() {
			setLoading(true)
			const result = await getEnvios(
				filtroEstado ? { estado: filtroEstado } : undefined,
			)
			if (result.success) {
				setEnvios(result.data)
			} else {
				toast.error(result.error)
			}
			setLoading(false)
		}
		loadData()
	}, [filtroEstado])

	const selectedData = envios.find((d) => d.id === selectedEnvio)

	return (
		<>
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
									<BreadcrumbPage>Formularios</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>

				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
					{/* Header with actions */}
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-semibold">
								Gestión de Formularios
							</h1>
							<p className="text-sm text-muted-foreground">
								Administra y revisa los formularios enviados
							</p>
						</div>
						<Button onClick={() => router.push("/formularios/constructor")}>
							<Plus className="mr-2 size-4" weight="bold" />
							Nuevo Formulario
						</Button>
					</div>

					{/* Filter tabs */}
					<div className="flex gap-2">
						{[
							{ label: "Todos", value: undefined },
							{ label: "Completados", value: "completado" },
							{ label: "Pendientes", value: "pendiente" },
						].map((tab) => (
							<Button
								key={tab.label}
								variant={filtroEstado === tab.value ? "default" : "outline"}
								size="sm"
								onClick={() => setFiltroEstado(tab.value)}
							>
								{tab.label}
							</Button>
						))}
					</div>

					{/* Table */}
					{loading ? (
						<div className="flex items-center justify-center p-8">
							<p className="animate-pulse text-sm text-muted-foreground">
								Cargando envíos...
							</p>
						</div>
					) : (
						<div className="rounded-lg border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Título</TableHead>
										<TableHead>Tipo</TableHead>
										<TableHead>Área</TableHead>
										<TableHead>Fecha</TableHead>
										<TableHead>Estado</TableHead>
										<TableHead className="text-right">Acciones</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{envios.map((row) => (
										<TableRow
											key={row.id}
											className="cursor-pointer hover:bg-muted/50"
											onClick={() => setSelectedEnvio(row.id)}
										>
											<TableCell className="font-medium">
												{row.formulario_nombre ?? "N/A"}
											</TableCell>
											<TableCell>
												<span className="capitalize">
													{(row.formulario_tipo ?? "N/A").replace(/_/g, " ")}
												</span>
											</TableCell>
											<TableCell>{row.equipo_ubicacion ?? "N/A"}</TableCell>
											<TableCell>
												{format(
													new Date(row.created_at),
													"dd/MM/yyyy HH:mm",
												)}
											</TableCell>
											<TableCell>
												<span
													className={cn(
														"inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
														row.estado === "completado" &&
															"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
														row.estado === "pendiente" &&
															"bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
														row.estado === "rechazado" &&
															"bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
													)}
												>
													{row.estado === "completado"
														? "Completado"
														: row.estado === "pendiente"
															? "Pendiente"
															: "Rechazado"}
												</span>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Button
														variant="ghost"
														size="icon-sm"
														onClick={(e) => {
															e.stopPropagation()
															setSelectedEnvio(row.id)
														}}
													>
														<Eye className="size-4" weight="duotone" />
													</Button>
													<Button
														variant="ghost"
														size="icon-sm"
														onClick={(e) => {
															e.stopPropagation()
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
														onClick={(e) => {
															e.stopPropagation()
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
						</div>
					)}
				</div>
			</SidebarInset>

			{/* Detail Dialog */}
			<Dialog
				open={selectedEnvio !== null}
				onOpenChange={() => setSelectedEnvio(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{selectedData?.formulario_nombre ?? "N/A"}
						</DialogTitle>
						<DialogDescription>
							Enviado por {selectedData?.usuario_nombre ?? "N/A"} el{" "}
							{selectedData
								? format(new Date(selectedData.created_at), "dd/MM/yyyy")
								: ""}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span className="font-medium">Tipo:</span>
								<p className="capitalize text-muted-foreground">
									{(selectedData?.formulario_tipo ?? "N/A").replace(/_/g, " ")}
								</p>
							</div>
							<div>
								<span className="font-medium">Área:</span>
								<p className="text-muted-foreground">
									{selectedData?.equipo_ubicacion ?? "N/A"}
								</p>
							</div>
							<div>
								<span className="font-medium">Equipo:</span>
								<p className="text-muted-foreground">
									{selectedData?.equipo_nombre ?? "N/A"}
								</p>
							</div>
							<div>
								<span className="font-medium">Estado:</span>
								<p className="capitalize text-muted-foreground">
									{selectedData?.estado}
								</p>
							</div>
						</div>
						<div>
							<span className="text-sm font-medium">Descripción:</span>
							<p className="mt-1 text-sm text-muted-foreground">
								{selectedData?.formulario_descripcion ?? "Sin descripción"}
							</p>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
