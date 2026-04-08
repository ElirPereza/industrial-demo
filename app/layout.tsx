import type { Metadata } from "next"
import { JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { DesktopOnly } from "@/components/desktop-only"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { RoleProvider } from "@/lib/role-provider"

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-mono",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: "Industrial Portal",
	description:
		"Portal de Gestión Industrial - Formularios, Activos y Mantenimiento",
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
					<RoleProvider>
						<TooltipProvider>
							<DesktopOnly>{children}</DesktopOnly>
						</TooltipProvider>
					</RoleProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
