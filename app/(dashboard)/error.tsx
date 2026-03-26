"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function DashboardError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		console.error(error)
	}, [error])

	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
			<div className="text-center">
				<h2 className="text-xl font-semibold">Algo salió mal</h2>
				<p className="mt-2 text-sm text-muted-foreground">
					{error.message || "Ocurrió un error inesperado"}
				</p>
			</div>
			<Button onClick={reset}>Intentar de nuevo</Button>
		</div>
	)
}
