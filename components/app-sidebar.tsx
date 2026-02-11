"use client"

import {
	Buildings,
	ChartBarIcon,
	ChartLineIcon,
	CubeIcon,
	FactoryIcon,
	FileTextIcon,
	GearIcon,
	QrCodeIcon,
	SlidersIcon,
	Users,
	WrenchIcon,
} from "@phosphor-icons/react"
import type * as React from "react"
import { NavAdmin } from "@/components/nav-admin"
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
			items: [
				{ title: "Envíos", url: "/formularios" },
				{ title: "Constructor", url: "/formularios/constructor" },
				{ title: "Administración", url: "/formularios/admin" },
			],
		},
		{
			title: "Equipos",
			url: "/equipos",
			icon: <CubeIcon />,
		},
		{
			title: "Analíticas",
			url: "/analiticas",
			icon: <ChartBarIcon />,
		},
	],
	administracion: [
		{
			title: "Usuarios",
			url: "/usuarios",
			icon: <Users />,
		},
		{
			title: "Contratistas",
			url: "/contratistas",
			icon: <Buildings />,
		},
	],
	herramientas: [
		{
			name: "Códigos QR",
			url: "/qr-codes",
			icon: <QrCodeIcon />,
		},
	],
	navSecondary: [
		{
			title: "Configuración",
			url: "/configuracion",
			icon: <SlidersIcon />,
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
				<NavAdmin items={data.administracion} />
				<NavProjects projects={data.herramientas} />
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	)
}
