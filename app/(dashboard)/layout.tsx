"use client"

import type { ReactNode } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function DashboardLayout({ children }: { children: ReactNode }) {
	const { user } = useCurrentUser()

	return (
		<SidebarProvider>
			<AppSidebar user={user} />
			{children}
		</SidebarProvider>
	)
}
