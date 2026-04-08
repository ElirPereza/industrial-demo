"use client"

import { use, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
	Factory,
	MapPin,
	GearSix,
	WifiHigh,
	WifiSlash,
	Warning,
	ArrowRight,
} from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface EquipoPublic {
	id: string
	nombre: string
	tipo: string
	ubicacion: string
	estado: string
	tiene_iot: boolean
	dispositivo_iot: {
		nombre?: string
		tipo?: string
		protocolo?: string
		estado?: string
		ultimoDato?: string
	} | null
	ultimo_mantenimiento: string | null
	proximo_mantenimiento: string | null
	area_nombre?: string
}

const TIPO_LABELS: Record<string, string> = {
	"maquinaria-pesada": "Maquinaria Pesada",
	"linea-produccion": "Línea de Producción",
	electricos: "Eléctricos",
	hvac: "HVAC / Climatización",
}

const ESTADO_CONFIG: Record<string, { label: string; color: string }> = {
	operativo: {
		label: "Operativo",
		color:
			"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
	},
	mantenimiento: {
		label: "En Mantenimiento",
		color:
			"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
	},
	"fuera-servicio": {
		label: "Fuera de Servicio",
		color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
	},
}

export default function EquipoPublicPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = use(params)
	const [equipo, setEquipo] = useState<EquipoPublic | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchEquipo = async () => {
			const supabase = createClient()
			const { data, error: queryError } = await supabase
				.from("equipos")
				.select("*")
				.eq("id", id)
				.single()

			if (queryError || !data) {
				setError("Equipo no encontrado")
				setIsLoading(false)
				return
			}

			let areaNombre: string | undefined
			if (data.id_area) {
				const { data: area } = await supabase
					.from("areas_produccion")
					.select("nombre")
					.eq("id", data.id_area)
					.single()
				areaNombre = area?.nombre ?? undefined
			}

			setEquipo({
				...data,
				dispositivo_iot:
					data.dispositivo_iot as EquipoPublic["dispositivo_iot"],
				area_nombre: areaNombre,
			})
			setIsLoading(false)
		}
		void fetchEquipo()
	}, [id])

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-muted/30">
				<div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
			</div>
		)
	}

	if (error || !equipo) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30 p-4">
				<Warning className="size-12 text-muted-foreground" weight="duotone" />
				<p className="text-lg font-medium">{error ?? "Equipo no encontrado"}</p>
				<p className="text-sm text-muted-foreground">
					Verifica que el código QR sea correcto
				</p>
			</div>
		)
	}

	const estadoConfig = ESTADO_CONFIG[equipo.estado] ?? ESTADO_CONFIG.operativo
	const iot = equipo.dispositivo_iot

	return (
		<div className="min-h-screen bg-muted/30">
			<div className="border-b bg-background px-4 py-6">
				<div className="mx-auto max-w-lg">
					<div className="flex items-center gap-3">
						<div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
							<Factory className="size-6 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="text-xs font-medium text-muted-foreground">
								Ficha de Equipo
							</p>
							<h1 className="text-xl font-bold">{equipo.nombre}</h1>
						</div>
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-lg space-y-4 p-4">
				<div className="flex items-center justify-between">
					<Badge className={cn("text-sm", estadoConfig.color)}>
						{estadoConfig.label}
					</Badge>
					{equipo.tiene_iot && iot && (
						<div className="flex items-center gap-1.5 text-sm">
							{iot.estado === "online" ? (
								<WifiHigh className="size-4 text-green-600" weight="bold" />
							) : (
								<WifiSlash className="size-4 text-red-500" weight="bold" />
							)}
							<span
								className={
									iot.estado === "online" ? "text-green-600" : "text-red-500"
								}
							>
								{iot.estado === "online" ? "Conectado" : "Desconectado"}
							</span>
						</div>
					)}
				</div>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Información General
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex items-center gap-3">
							<GearSix
								className="size-4 text-muted-foreground"
								weight="duotone"
							/>
							<div>
								<p className="text-xs text-muted-foreground">Tipo</p>
								<p className="text-sm font-medium">
									{TIPO_LABELS[equipo.tipo] ?? equipo.tipo}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<MapPin
								className="size-4 text-muted-foreground"
								weight="duotone"
							/>
							<div>
								<p className="text-xs text-muted-foreground">Ubicación</p>
								<p className="text-sm font-medium">{equipo.ubicacion}</p>
							</div>
						</div>
						{equipo.area_nombre && (
							<div className="flex items-center gap-3">
								<Factory
									className="size-4 text-muted-foreground"
									weight="duotone"
								/>
								<div>
									<p className="text-xs text-muted-foreground">Área</p>
									<p className="text-sm font-medium">{equipo.area_nombre}</p>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{equipo.tiene_iot && iot && (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Dispositivo IoT
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">
									Dispositivo
								</span>
								<span className="text-sm font-medium">{iot.nombre}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">Protocolo</span>
								<span className="text-sm font-medium uppercase">
									{iot.protocolo}
								</span>
							</div>
							{iot.ultimoDato && (
								<div className="flex justify-between">
									<span className="text-sm text-muted-foreground">
										Último dato
									</span>
									<span className="text-sm font-medium">{iot.ultimoDato}</span>
								</div>
							)}
						</CardContent>
					</Card>
				)}

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Mantenimiento
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						<div className="flex justify-between">
							<span className="text-sm text-muted-foreground">Último</span>
							<span className="text-sm font-medium">
								{equipo.ultimo_mantenimiento
									? new Date(equipo.ultimo_mantenimiento).toLocaleDateString(
											"es-CO",
										)
									: "Sin registro"}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-sm text-muted-foreground">Próximo</span>
							<span className="text-sm font-medium">
								{equipo.proximo_mantenimiento
									? new Date(equipo.proximo_mantenimiento).toLocaleDateString(
											"es-CO",
										)
									: "No programado"}
							</span>
						</div>
					</CardContent>
				</Card>

				<div className="pt-2">
					<Link href="/login">
						<Button className="w-full" size="lg">
							Iniciar sesión para ver más
							<ArrowRight className="ml-2 size-4" />
						</Button>
					</Link>
				</div>

				<p className="pb-4 text-center text-xs text-muted-foreground">
					Industrial Portal — Gestión Industrial Digital
				</p>
			</div>
		</div>
	)
}
