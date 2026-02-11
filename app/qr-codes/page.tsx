"use client"

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
import { Separator } from "@/components/ui/separator"
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { formulariosTemplate } from "@/lib/mock-data"
import { QRCodeSVG } from "qrcode.react"
import { Download, QrCode } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export default function QRCodesPage() {
	const [selectedFormulario, setSelectedFormulario] = useState<string | null>(null)

	const selectedForm = formulariosTemplate.find((f) => f.id === selectedFormulario)

	const handleDownload = (formularioId: string, nombre: string) => {
		// Simulate download by opening QR in new tab
		const canvas = document.getElementById(`qr-${formularioId}`) as HTMLCanvasElement
		if (canvas) {
			const url = canvas.toDataURL("image/png")
			const link = document.createElement("a")
			link.href = url
			link.download = `qr-${nombre.toLowerCase().replace(/\s+/g, "-")}.png`
			link.click()
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
									<BreadcrumbLink href="/dashboard">Portal Industrial</BreadcrumbLink>
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
					<div>
						<h1 className="text-2xl font-semibold">Códigos QR de Formularios</h1>
						<p className="text-sm text-muted-foreground">
							Genera y descarga códigos QR para acceso rápido a formularios
						</p>
					</div>

					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{formulariosTemplate.map((formulario) => {
							const qrUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/formularios/llenar/${formulario.id}`

							return (
								<Card
									key={formulario.id}
									className="cursor-pointer transition-all hover:shadow-md"
									onClick={() => setSelectedFormulario(formulario.id)}
								>
									<CardHeader>
										<div className="flex items-start justify-between">
											<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
												<QrCode className="size-6 text-primary" weight="duotone" />
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
												id={`qr-${formulario.id}`}
												value={qrUrl}
												size={120}
												level="M"
												includeMargin
											/>
										</div>
										<Button
											variant="outline"
											className="mt-4 w-full"
											onClick={(e) => {
												e.stopPropagation()
												handleDownload(formulario.id, formulario.nombre)
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
				</div>
			</SidebarInset>

			{/* Detail Dialog */}
			<Dialog open={selectedFormulario !== null} onOpenChange={() => setSelectedFormulario(null)}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>{selectedForm?.nombre}</DialogTitle>
						<DialogDescription>{selectedForm?.descripcion}</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="flex items-center justify-center rounded-lg bg-white p-8">
							{selectedForm && (
								<QRCodeSVG
									value={`${typeof window !== "undefined" ? window.location.origin : ""}/formularios/llenar/${selectedForm.id}`}
									size={256}
									level="H"
									includeMargin
								/>
							)}
						</div>
						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Tipo:</span>
								<span className="font-medium capitalize">{selectedForm?.tipo.replace("-", " ")}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Versión:</span>
								<span className="font-medium">v{selectedForm?.version}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Estado:</span>
								<span
									className={cn(
										"rounded-full px-2 py-0.5 text-xs font-medium",
										selectedForm?.activo
											? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
											: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
									)}
								>
									{selectedForm?.activo ? "Activo" : "Inactivo"}
								</span>
							</div>
						</div>
						<Button
							className="w-full"
							onClick={() => {
								if (selectedForm) {
									handleDownload(selectedForm.id, selectedForm.nombre)
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
