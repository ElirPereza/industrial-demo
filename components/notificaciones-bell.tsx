"use client"

import {
	Bell,
	BellRinging,
	CheckCircle,
	ClipboardText,
	Warning,
} from "@phosphor-icons/react"
import { useCallback, useEffect, useState } from "react"
import {
	getNotificaciones,
	getUnreadCount,
	markAllAsRead,
	markAsRead,
	type Notificacion,
} from "@/app/(dashboard)/notificaciones/actions"
import { Button } from "@/components/ui/button"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

function timeAgo(dateStr: string): string {
	const now = Date.now()
	const then = new Date(dateStr).getTime()
	const diff = now - then
	const mins = Math.floor(diff / 60000)
	if (mins < 1) return "ahora"
	if (mins < 60) return `hace ${mins} min`
	const hours = Math.floor(mins / 60)
	if (hours < 24) return `hace ${hours}h`
	const days = Math.floor(hours / 24)
	if (days === 1) return "ayer"
	return `hace ${days} días`
}

function NotifIcon({ tipo }: { tipo: Notificacion["tipo"] }) {
	if (tipo === "nuevo_formulario") {
		return (
			<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
				<ClipboardText className="size-4" weight="fill" />
			</div>
		)
	}
	if (tipo === "alerta_equipo") {
		return (
			<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
				<Warning className="size-4" weight="fill" />
			</div>
		)
	}
	return (
		<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
			<Bell className="size-4" weight="fill" />
		</div>
	)
}

export function NotificacionesBell() {
	const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
	const [unreadCount, setUnreadCount] = useState(0)
	const [open, setOpen] = useState(false)
	const [markingAll, setMarkingAll] = useState(false)

	const loadData = useCallback(async () => {
		const [notifsResult, countResult] = await Promise.all([
			getNotificaciones(),
			getUnreadCount(),
		])
		if (notifsResult.success) setNotificaciones(notifsResult.data)
		if (countResult.success) setUnreadCount(countResult.data)
	}, [])

	useEffect(() => {
		loadData()

		// Suscripción Realtime
		const supabase = createClient()
		let userId: string | null = null

		supabase.auth.getUser().then(({ data }) => {
			userId = data.user?.id ?? null
			if (!userId) return

			const channel = supabase
				.channel("notificaciones-realtime")
				.on(
					"postgres_changes",
					{
						event: "INSERT",
						schema: "public",
						table: "notificaciones",
						filter: `user_id=eq.${userId}`,
					},
					(payload) => {
						const newNotif = payload.new as Notificacion
						setNotificaciones((prev) => [newNotif, ...prev])
						setUnreadCount((prev) => prev + 1)
					},
				)
				.subscribe()

			return () => {
				supabase.removeChannel(channel)
			}
		})
	}, [loadData])

	const handleMarkAsRead = async (id: string) => {
		await markAsRead(id)
		setNotificaciones((prev) =>
			prev.map((n) => (n.id === id ? { ...n, leida: true } : n)),
		)
		setUnreadCount((prev) => Math.max(0, prev - 1))
	}

	const handleMarkAllAsRead = async () => {
		setMarkingAll(true)
		await markAllAsRead()
		setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })))
		setUnreadCount(0)
		setMarkingAll(false)
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative size-8 shrink-0"
					aria-label="Notificaciones"
				>
					{unreadCount > 0 ? (
						<BellRinging className="size-4" weight="fill" />
					) : (
						<Bell className="size-4" />
					)}
					{unreadCount > 0 && (
						<span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold leading-none text-white">
							{unreadCount > 9 ? "9+" : unreadCount}
						</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-96 p-0">
				{/* Header */}
				<div className="flex items-center justify-between border-b px-4 py-3">
					<h3 className="text-sm font-semibold">Notificaciones</h3>
					{unreadCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							className="h-7 text-xs"
							onClick={handleMarkAllAsRead}
							disabled={markingAll}
						>
							<CheckCircle className="mr-1 size-3.5" />
							Marcar todas
						</Button>
					)}
				</div>

				{/* Lista */}
				<ScrollArea className="max-h-96">
					{notificaciones.length === 0 ? (
						<div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
							<Bell className="size-8" />
							<p className="text-sm">Sin notificaciones</p>
						</div>
					) : (
						<div>
							{notificaciones.map((n) => (
								<button
									key={n.id}
									type="button"
									onClick={() => !n.leida && handleMarkAsRead(n.id)}
									className={cn(
										"flex w-full gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted/50",
										!n.leida && "bg-blue-50/50",
									)}
								>
									<NotifIcon tipo={n.tipo} />
									<div className="min-w-0 flex-1">
										<p
											className={cn(
												"truncate text-sm",
												n.leida
													? "font-normal text-muted-foreground"
													: "font-medium",
											)}
										>
											{n.titulo}
										</p>
										<p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
											{n.mensaje}
										</p>
										<p className="mt-1 text-[11px] text-muted-foreground/70">
											{timeAgo(n.created_at)}
										</p>
									</div>
									{!n.leida && (
										<div className="mt-1 size-2 shrink-0 rounded-full bg-blue-500" />
									)}
								</button>
							))}
						</div>
					)}
				</ScrollArea>
			</PopoverContent>
		</Popover>
	)
}
