"use client"

import {
	Cube,
	Download,
	FileText,
	MagnifyingGlass,
	MapPin,
	Printer,
	QrCode,
} from "@phosphor-icons/react"
import { QRCodeSVG } from "qrcode.react"
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar"
import { equipos, formulariosTemplate } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

type TabType = "equipos" | "formularios"

export default function QRCodesPage() {
	const [activeTab, setActiveTab] = useState<TabType>("equipos")
	const [selectedEquipo, setSelectedEquipo] = useState<string | null>(null)
	const [selectedFormulario, setSelectedFormulario] = useState<string | null>(null)
	const [searchEquipo, setSearchEquipo] = useState("")
	const [searchFormulario, setSearchFormulario] = useState("")
	const [filterTipo, setFilterTipo] = useState<string | null>(null)

	const selectedEquipoData = equipos.find((e) => e.id === selectedEquipo)
	const selectedFormularioData = formulariosTemplate.find((f) => f.id === selectedFormulario)

	// Filter equipment
	const equiposFiltrados = equipos.filter((e) => {
		const matchSearch = e.nombre.toLowerCase().includes(searchEquipo.toLowerCase()) ||
			e.ubicacion.toLowerCase().includes(searchEquipo.toLowerCase())
		const matchTipo = !filterTipo || e.tipo === filterTipo
		return matchSearch && matchTipo
	})

	// Filter forms
	const formulariosFiltrados = formulariosTemplate.filter((f) =>
		f.nombre.toLowerCase().includes(searchFormulario.toLowerCase())
	)

	// Get unique equipment types
	const tiposEquipo = [...new Set(equipos.map((e) => e.tipo))]

	const handleDownloadEquipo = (equipoId: string, nombre: string) => {
		const svg = document.getElementById(`qr-equipo-${equipoId}`)
		if (svg) {
			const svgData = new XMLSerializer().serializeToString(svg)
			const canvas = document.createElement("canvas")
			const ctx = canvas.getContext("2d")
			const img = new Image()
			img.onload = () => {
				canvas.width = img.width
				canvas.height = img.height
				ctx?.drawImage(img, 0, 0)
				const url = canvas.toDataURL("image/png")
				const link = document.createElement("a")
				link.href = url
				link.download = `qr-${nombre.toLowerCase().replace(/\s+/g, "-")}.png`
				link.click()
			}
			img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
		}
	}

	const handleDownloadFormulario = (formularioId: string, nombre: string) => {
		const svg = document.getElementById(`qr-form-${formularioId}`)
		if (svg) {
			const svgData = new XMLSerializer().serializeToString(svg)
			const canvas = document.createElement("canvas")
			const ctx = canvas.getContext("2d")
			const img = new Image()
			img.onload = () => {
				canvas.width = img.width
				canvas.height = img.height
				ctx?.drawImage(img, 0, 0)
				const url = canvas.toDataURL("image/png")
				const link = document.createElement("a")
				link.href = url
				link.download = `qr-${nombre.toLowerCase().replace(/\s+/g, "-")}.png`
				link.click()
			}
			img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
		}
	}

	const tabs = [
		{ id: "equipos" as TabType, label: "Equipos", icon: Cube, count: equipos.length },
		{ id: "formularios" as TabType, label: "Formularios", icon: FileText, count: formulariosTemplate.length },
	]

	const getEquipoTipoLabel = (tipo: string) => {
		switch (tipo) {
			case "maquinaria-pesada":
				return "Maquinaria Pesada"
			case "linea-produccion":
				return "Línea de Producción"
			case "electricos":
				return "Eléctricos"
			case "hvac":
				return "HVAC"
			default:
				return tipo
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
									<BreadcrumbPage>Códigos QR</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>

				<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
					<div className="flex items-start justify-between">
						<div>
							<h1 className="text-2xl font-semibold">Códigos QR</h1>
							<p className="text-sm text-muted-foreground">
								Genera y descarga códigos QR para equipos y formularios
							</p>
						</div>
						<Button variant="outline">
							<Printer className="mr-2 size-4" />
							Imprimir Selección
						</Button>
					</div>

					{/* Tabs */}
					<div className="flex gap-1 rounded-lg bg-muted p-1">
						{tabs.map((tab) => (
							<button
								key={tab.id}
								type="button"
								onClick={() => setActiveTab(tab.id)}
								className={cn(
									"flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
									activeTab === tab.id
										? "bg-background text-foreground shadow-sm"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								<tab.icon className="size-4" />
								<span>{tab.label}</span>
								<span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
									{tab.count}
								</span>
							</button>
						))}
					</div>

					{/* Equipos Tab */}
					{activeTab === "equipos" && (
						<>
							{/* Filters */}
							<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
								<div className="relative flex-1">
									<MagnifyingGlass className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										placeholder="Buscar por nombre o ubicación..."
										value={searchEquipo}
										onChange={(e) => setSearchEquipo(e.target.value)}
										className="pl-9"
									/>
								</div>
								<div className="flex gap-2">
									<Button
										variant={filterTipo === null ? "default" : "outline"}
										size="sm"
										onClick={() => setFilterTipo(null)}
									>
										Todos
									</Button>
									{tiposEquipo.map((tipo) => (
										<Button
											key={tipo}
											variant={filterTipo === tipo ? "default" : "outline"}
											size="sm"
											onClick={() => setFilterTipo(filterTipo === tipo ? null : tipo)}
										>
											{getEquipoTipoLabel(tipo)}
										</Button>
									))}
								</div>
							</div>

							{/* Equipment Grid */}
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
								{equiposFiltrados.map((equipo) => {
									const qrUrl = `https://industrial-portal.com/equipos/${equipo.id}`

									return (
										<Card
											key={equipo.id}
											className="cursor-pointer transition-all hover:shadow-md"
											onClick={() => setSelectedEquipo(equipo.id)}
										>
											<CardHeader className="pb-2">
												<div className="flex items-start justify-between">
													<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
														<Cube className="size-5 text-primary" weight="duotone" />
													</div>
													<span
														className={cn(
															"rounded-full px-2 py-0.5 text-xs font-medium",
															equipo.estado === "operativo" &&
																"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
															equipo.estado === "mantenimiento" &&
																"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
															equipo.estado === "fuera-servicio" &&
																"bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
														)}
													>
														{equipo.estado === "operativo"
															? "Operativo"
															: equipo.estado === "mantenimiento"
																? "Mantenimiento"
																: "Fuera de Servicio"}
													</span>
												</div>
												<CardTitle className="mt-3 text-base">{equipo.nombre}</CardTitle>
												<div className="flex items-center gap-1 text-sm text-muted-foreground">
													<MapPin className="size-3" />
													<span>{equipo.ubicacion}</span>
												</div>
											</CardHeader>
											<CardContent>
												<div className="flex items-center justify-center rounded-lg bg-white p-3">
													<QRCodeSVG
														id={`qr-equipo-${equipo.id}`}
														value={qrUrl}
														size={100}
														level="M"
													/>
												</div>
												<Button
													variant="outline"
													size="sm"
													className="mt-3 w-full"
													onClick={(e: React.MouseEvent) => {
														e.stopPropagation()
														handleDownloadEquipo(equipo.id, equipo.nombre)
													}}
												>
													<Download className="mr-2 size-4" weight="bold" />
													Descargar
												</Button>
											</CardContent>
										</Card>
									)
								})}
							</div>

							{equiposFiltrados.length === 0 && (
								<div className="flex flex-col items-center justify-center py-12 text-center">
									<Cube className="mb-4 size-12 text-muted-foreground" />
									<p className="text-muted-foreground">
										No se encontraron equipos con los filtros aplicados
									</p>
								</div>
							)}
						</>
					)}

					{/* Formularios Tab */}
					{activeTab === "formularios" && (
						<>
							{/* Search */}
							<div className="relative max-w-md">
								<MagnifyingGlass className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder="Buscar formularios..."
									value={searchFormulario}
									onChange={(e) => setSearchFormulario(e.target.value)}
									className="pl-9"
								/>
							</div>

							{/* Forms Grid */}
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								{formulariosFiltrados.map((formulario) => {
									const qrUrl = `https://industrial-portal.com/formularios/llenar/${formulario.id}`

									return (
										<Card
											key={formulario.id}
											className="cursor-pointer transition-all hover:shadow-md"
											onClick={() => setSelectedFormulario(formulario.id)}
										>
											<CardHeader>
												<div className="flex items-start justify-between">
													<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
														<QrCode
															className="size-6 text-primary"
															weight="duotone"
														/>
													</div>
													<span
														className={cn(
															"rounded-full px-2 py-0.5 text-xs font-medium",
															formulario.activo
																? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
																: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
														)}
													>
														{formulario.activo ? "Activo" : "Inactivo"}
													</span>
												</div>
												<CardTitle className="mt-4">{formulario.nombre}</CardTitle>
												<CardDescription>{formulario.descripcion}</CardDescription>
											</CardHeader>
											<CardContent>
												<div className="flex items-center justify-center rounded-lg bg-white p-4">
													<QRCodeSVG
														id={`qr-form-${formulario.id}`}
														value={qrUrl}
														size={120}
														level="M"
														includeMargin
													/>
												</div>
												<Button
													variant="outline"
													className="mt-4 w-full"
													onClick={(e: React.MouseEvent) => {
														e.stopPropagation()
														handleDownloadFormulario(formulario.id, formulario.nombre)
													}}
												>
													<Download className="mr-2 size-4" weight="bold" />
													Descargar QR
												</Button>
											</CardContent>
										</Card>
									)
								})}
							</div>

							{formulariosFiltrados.length === 0 && (
								<div className="flex flex-col items-center justify-center py-12 text-center">
									<FileText className="mb-4 size-12 text-muted-foreground" />
									<p className="text-muted-foreground">
										No se encontraron formularios
									</p>
								</div>
							)}
						</>
					)}
				</div>
			</SidebarInset>

			{/* Equipment Detail Dialog */}
			<Dialog
				open={selectedEquipo !== null}
				onOpenChange={() => setSelectedEquipo(null)}
			>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>{selectedEquipoData?.nombre}</DialogTitle>
						<DialogDescription>
							<span className="flex items-center gap-1">
								<MapPin className="size-3" />
								{selectedEquipoData?.ubicacion}
							</span>
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="flex items-center justify-center rounded-lg bg-white p-8">
							{selectedEquipoData && (
								<QRCodeSVG
									value={`https://industrial-portal.com/equipos/${selectedEquipoData.id}`}
									size={256}
									level="H"
									includeMargin
								/>
							)}
						</div>
						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Tipo:</span>
								<span className="font-medium">
									{selectedEquipoData && getEquipoTipoLabel(selectedEquipoData.tipo)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Estado:</span>
								<span
									className={cn(
										"rounded-full px-2 py-0.5 text-xs font-medium",
										selectedEquipoData?.estado === "operativo" &&
											"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
										selectedEquipoData?.estado === "mantenimiento" &&
											"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
										selectedEquipoData?.estado === "fuera-servicio" &&
											"bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
									)}
								>
									{selectedEquipoData?.estado === "operativo"
										? "Operativo"
										: selectedEquipoData?.estado === "mantenimiento"
											? "En Mantenimiento"
											: "Fuera de Servicio"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Último Mant.:</span>
								<span className="font-medium">
									{selectedEquipoData?.ultimoMantenimiento.toLocaleDateString("es-ES")}
								</span>
							</div>
						</div>
						<div className="flex gap-2">
							<Button
								className="flex-1"
								onClick={() => {
									if (selectedEquipoData) {
										handleDownloadEquipo(selectedEquipoData.id, selectedEquipoData.nombre)
									}
								}}
							>
								<Download className="mr-2 size-4" weight="bold" />
								Descargar QR
							</Button>
							<Button variant="outline">
								<Printer className="size-4" />
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Formulario Detail Dialog */}
			<Dialog
				open={selectedFormulario !== null}
				onOpenChange={() => setSelectedFormulario(null)}
			>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>{selectedFormularioData?.nombre}</DialogTitle>
						<DialogDescription>{selectedFormularioData?.descripcion}</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="flex items-center justify-center rounded-lg bg-white p-8">
							{selectedFormularioData && (
								<QRCodeSVG
									value={`https://industrial-portal.com/formularios/llenar/${selectedFormularioData.id}`}
									size={256}
									level="H"
									includeMargin
								/>
							)}
						</div>
						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Tipo:</span>
								<span className="font-medium capitalize">
									{selectedFormularioData?.tipo.replace("-", " ")}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Versión:</span>
								<span className="font-medium">v{selectedFormularioData?.version}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Estado:</span>
								<span
									className={cn(
										"rounded-full px-2 py-0.5 text-xs font-medium",
										selectedFormularioData?.activo
											? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
											: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
									)}
								>
									{selectedFormularioData?.activo ? "Activo" : "Inactivo"}
								</span>
							</div>
						</div>
						<Button
							className="w-full"
							onClick={() => {
								if (selectedFormularioData) {
									handleDownloadFormulario(selectedFormularioData.id, selectedFormularioData.nombre)
								}
							}}
						>
							<Download className="mr-2 size-4" weight="bold" />
							Descargar QR
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</SidebarProvider>
	)
}
