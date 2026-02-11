"use client"

import {
	ArrowRight,
	ChartLineUp,
	CheckCircle,
	ClipboardText,
	Factory,
	Gear,
	Lightning,
	QrCode,
	ShieldCheck,
	Wrench,
} from "@phosphor-icons/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Navbar */}
			<nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
				<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
					<div className="flex items-center gap-2">
						<div className="flex size-9 items-center justify-center rounded-lg bg-primary">
							<Factory className="size-5 text-primary-foreground" weight="fill" />
						</div>
						<span className="text-xl font-semibold">Industrial Portal</span>
					</div>
					<Link href="/dashboard">
						<Button>
							Ver Demo
							<ArrowRight className="ml-2 size-4" />
						</Button>
					</Link>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="relative overflow-hidden pt-16">
				{/* Background gradient */}
				<div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
				
				<div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
					<div className="text-center">
						<div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
							<Lightning className="size-4 text-primary" weight="fill" />
							<span>Plataforma de Gestión Industrial</span>
						</div>
						
						<h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
							Digitaliza tu{" "}
							<span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
								mantenimiento industrial
							</span>
						</h1>
						
						<p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
							Gestiona formularios, equipos, firmas digitales y códigos QR en una sola plataforma. 
							Aumenta la eficiencia operativa y reduce tiempos de respuesta.
						</p>
						
						<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
							<Link href="/dashboard">
								<Button size="lg" className="h-12 px-8 text-base">
									Ver Demo Completa
									<ArrowRight className="ml-2 size-5" />
								</Button>
							</Link>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<CheckCircle className="size-4 text-green-500" weight="fill" />
								<span>Sin registro requerido</span>
							</div>
						</div>
					</div>

					{/* Dashboard Preview */}
					<div className="relative mx-auto mt-16 max-w-6xl">
						{/* Glow effect */}
						<div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-2xl" />
						
						{/* Browser mockup */}
						<div className="relative overflow-hidden rounded-xl border bg-background shadow-2xl">
							{/* Browser header */}
							<div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
								<div className="flex gap-1.5">
									<div className="size-3 rounded-full bg-red-500" />
									<div className="size-3 rounded-full bg-yellow-500" />
									<div className="size-3 rounded-full bg-green-500" />
								</div>
								<div className="ml-4 flex-1">
									<div className="mx-auto max-w-md rounded-md bg-background px-4 py-1.5 text-center text-xs text-muted-foreground">
										industrial-portal.com/dashboard
									</div>
								</div>
							</div>
							
							{/* Dashboard content mockup */}
							<div className="bg-muted/30 p-6">
								<div className="grid gap-4 md:grid-cols-4">
									{/* KPI Cards */}
									{[
										{ label: "Disponibilidad", value: "94.5%", trend: "+2.3%", color: "text-green-500" },
										{ label: "MTTR", value: "4.2h", trend: "-15%", color: "text-green-500" },
										{ label: "Equipos Activos", value: "14/16", trend: "", color: "text-blue-500" },
										{ label: "Mantenimientos", value: "10", trend: "+3", color: "text-primary" },
									].map((kpi) => (
										<div key={kpi.label} className="rounded-lg border bg-background p-4 shadow-sm">
											<p className="text-xs text-muted-foreground">{kpi.label}</p>
											<div className="mt-1 flex items-end gap-2">
												<span className="text-2xl font-bold">{kpi.value}</span>
												{kpi.trend && (
													<span className={`text-xs ${kpi.color}`}>{kpi.trend}</span>
												)}
											</div>
										</div>
									))}
								</div>
								
								<div className="mt-4 grid gap-4 md:grid-cols-3">
									{/* Chart placeholder */}
									<div className="col-span-2 rounded-lg border bg-background p-4 shadow-sm">
										<div className="mb-4 flex items-center justify-between">
											<span className="font-medium">Tendencia de Mantenimientos</span>
											<ChartLineUp className="size-5 text-muted-foreground" />
										</div>
										<div className="flex h-32 items-end gap-2">
											{[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h) => (
												<div
													key={`bar-${h}`}
													className="flex-1 rounded-t bg-primary/80"
													style={{ height: `${h}%` }}
												/>
											))}
										</div>
									</div>
									
									{/* Equipment status */}
									<div className="rounded-lg border bg-background p-4 shadow-sm">
										<div className="mb-4 flex items-center justify-between">
											<span className="font-medium">Estado de Equipos</span>
											<Gear className="size-5 text-muted-foreground" />
										</div>
										<div className="space-y-3">
											{[
												{ name: "Torno CNC-01", status: "Operativo", color: "bg-green-500" },
												{ name: "Prensa Hidráulica", status: "Operativo", color: "bg-green-500" },
												{ name: "Fresadora-03", status: "Mantenimiento", color: "bg-yellow-500" },
												{ name: "Línea Pintura", status: "Fuera Servicio", color: "bg-red-500" },
											].map((eq) => (
												<div key={eq.name} className="flex items-center justify-between text-sm">
													<span className="truncate">{eq.name}</span>
													<div className={`size-2 rounded-full ${eq.color}`} />
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="border-t bg-muted/30 py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h2 className="text-3xl font-bold sm:text-4xl">
							Todo lo que necesitas para gestionar tu planta
						</h2>
						<p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
							Una suite completa de herramientas diseñadas para optimizar las operaciones de mantenimiento industrial
						</p>
					</div>

					<div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
						{[
							{
								icon: ClipboardText,
								title: "Formularios Digitales",
								description: "Constructor visual de formularios con firmas digitales y validación automática",
							},
							{
								icon: Wrench,
								title: "Gestión de Equipos",
								description: "Historial completo de mantenimientos, documentos y galería de imágenes por equipo",
							},
							{
								icon: QrCode,
								title: "Códigos QR",
								description: "Genera QR únicos para cada equipo y formulario para acceso rápido desde móvil",
							},
							{
								icon: ChartLineUp,
								title: "Analíticas en Tiempo Real",
								description: "Dashboards con KPIs, MTBF, MTTR y métricas de disponibilidad operativa",
							},
							{
								icon: ShieldCheck,
								title: "Firmas Digitales",
								description: "Trazabilidad legal con captura de firmas y timestamps en cada formulario",
							},
							{
								icon: Gear,
								title: "Gestión de Contratistas",
								description: "Control de proveedores externos con evaluaciones y seguimiento de trabajos",
							},
						].map((feature) => (
							<div
								key={feature.title}
								className="group rounded-xl border bg-background p-6 transition-all hover:shadow-lg"
							>
								<div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
									<feature.icon className="size-6" weight="duotone" />
								</div>
								<h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
								<p className="text-sm text-muted-foreground">{feature.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-16 text-center sm:px-16">
						{/* Background pattern */}
						<div className="absolute inset-0 -z-10 opacity-10" aria-hidden="true">
							<svg className="size-full" xmlns="http://www.w3.org/2000/svg" role="presentation">
								<defs>
									<pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
										<path d="M0 32V0h32" fill="none" stroke="currentColor" strokeWidth="1"/>
									</pattern>
								</defs>
								<rect width="100%" height="100%" fill="url(#grid)" />
							</svg>
						</div>
						
						<h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
							Explora todas las funcionalidades
						</h2>
						<p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
							Navega por el dashboard interactivo y descubre cómo Industrial Portal puede transformar tu gestión de mantenimiento
						</p>
						<Link href="/dashboard">
							<Button
								size="lg"
								variant="secondary"
								className="mt-8 h-12 px-8 text-base"
							>
								Explorar Demo
								<ArrowRight className="ml-2 size-5" />
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t py-12">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
						<div className="flex items-center gap-2">
							<div className="flex size-8 items-center justify-center rounded-lg bg-primary">
								<Factory className="size-4 text-primary-foreground" weight="fill" />
							</div>
							<span className="font-semibold">Industrial Portal</span>
						</div>
						<p className="text-sm text-muted-foreground">
							Demo de gestión industrial. Todos los datos son ficticios.
						</p>
					</div>
				</div>
			</footer>
		</div>
	)
}
