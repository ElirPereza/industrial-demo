"use client"

import {
	ChartLineIcon,
	CubeIcon,
	FactoryIcon,
	FileTextIcon,
	GearIcon,
	LifebuoyIcon,
	QrCodeIcon,
	WrenchIcon,
} from "@phosphor-icons/react"
import type * as React from "react"
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usuarios } from "@/lib/mock-data"

const data = {
	user: {
		name: usuarios[0].nombre,
		email: usuarios[0].email,
		avatar: "/avatars/admin.jpg",
	},
	navMain: [
		{
			title: "Dashboard",
			url: "/dashboard",
			icon: <ChartLineIcon />,
			isActive: true,
		},
		{
			title: "Formularios",
			url: "/formularios",
			icon: <FileTextIcon />,
		},
		{
			title: "Equipos",
			url: "/equipos",
			icon: <CubeIcon />,
		},
	],
	navSecondary: [
		{
			title: "Soporte",
			url: "/soporte",
			icon: <LifebuoyIcon />,
		},
		{
			title: "Configuración",
			url: "/configuracion",
			icon: <GearIcon />,
		},
	],
	projects: [
		{
			name: "Constructor",
			url: "/formularios/constructor",
			icon: <WrenchIcon />,
		},
		{
			name: "Administración",
			url: "/formularios/admin",
			icon: <GearIcon />,
		},
		{
			name: "Códigos QR",
			url: "/qr-codes",
			icon: <QrCodeIcon />,
		},
	],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar variant="inset" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<a href="/dashboard">
								<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
									<FactoryIcon className="size-4" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">
										Industrial Portal
									</span>
									<span className="truncate text-xs">Gestión Industrial</span>
								</div>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavProjects projects={data.projects} />
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	)
}
