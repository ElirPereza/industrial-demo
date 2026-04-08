"use client"

import type React from "react"

import { cn } from "@/lib/utils"

interface PageEmptyProps {
	icon?: React.ElementType
	title: string
	description?: string
	className?: string
}

export function PageEmpty({
	icon: Icon,
	title,
	description,
	className,
}: PageEmptyProps): React.ReactElement {
	return (
		<div
			className={cn(
				"flex min-h-screen flex-col items-center justify-center gap-4 p-4",
				className,
			)}
		>
			{Icon && (
				<Icon className="size-12 text-muted-foreground/50" weight="thin" />
			)}
			<div className="text-center">
				<h2 className="text-lg font-medium text-foreground">{title}</h2>
				{description && (
					<p className="mt-2 text-sm text-muted-foreground">{description}</p>
				)}
			</div>
		</div>
	)
}
