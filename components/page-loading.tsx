"use client"

import type React from "react"

import { cn } from "@/lib/utils"

interface PageLoadingProps {
	message?: string
	className?: string
}

export function PageLoading({
	message = "Carregando...",
	className,
}: PageLoadingProps): React.ReactElement {
	return (
		<div
			className={cn(
				"flex min-h-screen flex-col items-center justify-center gap-4",
				className,
			)}
		>
			<div className="relative size-12">
				<div className="absolute inset-0 animate-spin rounded-full border-4 border-muted border-t-primary" />
			</div>
			{message && <p className="text-sm text-muted-foreground">{message}</p>}
		</div>
	)
}
