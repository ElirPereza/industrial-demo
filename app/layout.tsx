import type { Metadata } from "next"
import { JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
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
		<html lang="es" className={jetbrainsMono.variable} suppressHydrationWarning>
			<body className="antialiased">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<TooltipProvider>{children}</TooltipProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
