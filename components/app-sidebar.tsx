"use client"

import {
	Buildings,
	ChartBarIcon,
	ChartLineIcon,
	CubeIcon,
	FactoryIcon,
	FileTextIcon,
	QrCodeIcon,
	SlidersIcon,
	Users,
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
import type { UserProfile } from "@/hooks/use-current-user"

type Role = UserProfile["rol"]

function getNavMainForRole(rol: Role) {
	const allNav = [
		{
			title: "Dashboard",
			url: "/dashboard",
			icon: <ChartLineIcon />,
			isActive: true,
			roles: ["admin", "supervisor", "tecnico"] as Role[],
		},
		{
			title: "Formularios",
			url: "/formularios",
			icon: <FileTextIcon />,
			roles: ["admin", "supervisor", "tecnico"] as Role[],
			items: [
				{
					title: "Envíos",
					url: "/formularios",
					roles: ["admin", "supervisor", "tecnico"] as Role[],
				},
				{
					title: "Constructor",
					url: "/formularios/constructor",
					roles: ["admin"] as Role[],
				},
				{
					title: "Administración",
					url: "/formularios/admin",
					roles: ["admin"] as Role[],
				},
			].filter((item) => item.roles.includes(rol)),
		},
		{
			title: "Equipos",
			url: "/equipos",
			icon: <CubeIcon />,
			roles: ["admin", "supervisor", "tecnico"] as Role[],
		},
		{
			title: "Analíticas",
			url: "/analiticas",
			icon: <ChartBarIcon />,
			roles: ["admin", "supervisor"] as Role[],
		},
	]

	return allNav
		.filter((item) => item.roles.includes(rol))
		.map(({ roles: _roles, items, ...rest }) => ({
			...rest,
			...(items
				? {
						items: items.map(({ roles: _itemRoles, ...subRest }) => subRest),
					}
				: {}),
		}))
}

function getAdminNavForRole(rol: Role) {
	if (rol !== "admin") return []
	return [
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
	]
}

function getHerramientasForRole(rol: Role) {
	const all = [
		{
			name: "Códigos QR",
			url: "/qr-codes",
			icon: <QrCodeIcon />,
			roles: ["admin", "supervisor"] as Role[],
		},
	]
	return all
		.filter((item) => item.roles.includes(rol))
		.map(({ roles: _roles, ...rest }) => rest)
}

const navSecondary = [
	{
		title: "Configuración",
		url: "/configuracion",
		icon: <SlidersIcon />,
	},
]

export function AppSidebar({
	user,
	...props
}: React.ComponentProps<typeof Sidebar> & { user: UserProfile | null }) {
	const rol: Role = user?.rol ?? "tecnico"
	const navMain = getNavMainForRole(rol)
	const adminNav = getAdminNavForRole(rol)
	const herramientas = getHerramientasForRole(rol)

	const userData = {
		name: user?.nombre ?? "Usuario",
		email: user?.email ?? "",
		avatar: "",
	}

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
				<NavMain items={navMain} />
				{adminNav.length > 0 && <NavAdmin items={adminNav} />}
				{herramientas.length > 0 && <NavProjects projects={herramientas} />}
				<NavSecondary items={navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={userData} />
			</SidebarFooter>
		</Sidebar>
	)
}
