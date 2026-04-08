"use client"

import { Desktop } from "@phosphor-icons/react"
import { usePathname } from "next/navigation"

export function DesktopOnly({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()
	const isMobilePreview = pathname.startsWith("/mobile")

	if (isMobilePreview) return <>{children}</>

	return (
		<>
			<div className="hidden md:contents">{children}</div>
			<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-8 text-center md:hidden">
				<Desktop className="size-12 text-muted-foreground" weight="duotone" />
				<h1 className="text-xl font-semibold text-foreground">
					Solo disponible en escritorio
				</h1>
				<p className="max-w-[300px] text-sm leading-relaxed text-muted-foreground">
					Este portal está optimizado para pantallas de escritorio. Abre esta
					página desde una computadora para ver la maqueta completa.
				</p>
				<p className="text-xs text-muted-foreground/60">
					Las vistas móviles están disponibles en /mobile
				</p>
			</div>
		</>
	)
}
