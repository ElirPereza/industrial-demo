"use client"

import type React from "react"

import { WarningCircle } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PageErrorProps {
	message?: string
	description?: string
	onRetry?: () => void
	className?: string
}

export function PageError({
	message = "Erro ao carregar",
	description,
	onRetry,
	className,
}: PageErrorProps): React.ReactElement {
	return (
		<div
			className={cn(
				"flex min-h-screen flex-col items-center justify-center p-4",
				className,
			)}
		>
			<Card className="w-full max-w-md">
				<CardHeader>
					<div className="flex items-start gap-3">
						<WarningCircle
							weight="fill"
							className="mt-0.5 size-5 text-destructive"
						/>
						<div className="flex-1">
							<CardTitle>{message}</CardTitle>
							{description && <CardDescription>{description}</CardDescription>}
						</div>
					</div>
				</CardHeader>
				{onRetry && (
					<CardFooter>
						<Button onClick={onRetry} variant="default" className="w-full">
							Reintentar
						</Button>
					</CardFooter>
				)}
			</Card>
		</div>
	)
}
