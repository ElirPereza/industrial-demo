"use client"

import { useCallback, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function useRealtimeKPIs(onUpdate: () => void) {
	const refresh = useCallback(onUpdate, [onUpdate])

	useEffect(() => {
		const supabase = createClient()

		// Subscribe to new form submissions
		const enviosChannel = supabase
			.channel("realtime-envios")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "envios_formularios",
				},
				() => {
					refresh()
				},
			)
			.subscribe()

		// Subscribe to maintenance record changes
		const registrosChannel = supabase
			.channel("realtime-registros")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "registros_mantenimiento",
				},
				() => {
					refresh()
				},
			)
			.subscribe()

		// Cleanup on unmount
		return () => {
			supabase.removeChannel(enviosChannel)
			supabase.removeChannel(registrosChannel)
		}
	}, [refresh])
}
