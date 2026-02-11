import type { Metadata } from "next"
import { JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-mono",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: "Industrial Portal",
	description:
		"Portal de Gestión Industrial - Formularios, Equipos y Mantenimiento",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="es" className={jetbrainsMono.variable}>
			<body className={`${jetbrainsMono.className} antialiased`}>
				<TooltipProvider>{children}</TooltipProvider>
			</body>
		</html>
	)
}
