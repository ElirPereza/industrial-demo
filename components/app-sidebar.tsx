"use client"

import {
	BellRinging,
	Buildings,
	ChartBarIcon,
	ChartLineIcon,
	CubeIcon,
	FactoryIcon,
	FileTextIcon,
	QrCodeIcon,
	SlidersIcon,
	Users,
	Wrench,
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
import type { RolUsuario } from "@/lib/mock-data"
import { usuarios } from "@/lib/mock-data"
import { useRole } from "@/lib/role-provider"

const ROLE_LABELS: Record<RolUsuario, string> = {
	admin: "Administrador",
	supervisor: "Supervisor",
	tecnico: "Técnico",
	contratista: "Contratista",
}

function getNavMain(role: RolUsuario) {
	const items: {
		title: string
		url: string
		icon: React.ReactElement
		isActive?: boolean
		items?: { title: string; url: string }[]
	}[] = [
		{
			title: "Dashboard",
			url: "/dashboard",
			icon: <ChartLineIcon />,
			isActive: true,
		},
	]

	if (role === "admin") {
		items.push({
			title: "Formularios",
			url: "/formularios",
			icon: <FileTextIcon />,
			items: [
				{ title: "Envíos", url: "/formularios" },
				{ title: "Constructor", url: "/formularios/constructor" },
				{ title: "Administración", url: "/formularios/admin" },
			],
		})
	}

	if (role === "supervisor" || role === "tecnico" || role === "contratista") {
		items.push({
			title: "Formularios",
			url: "/formularios",
			icon: <FileTextIcon />,
		})
	}

	if (role === "admin" || role === "supervisor") {
		items.push({
			title: "Activos",
			url: "/activos",
			icon: <CubeIcon />,
		})
	}

	if (role === "admin" || role === "supervisor" || role === "tecnico") {
		items.push({
			title: "Alertas",
			url: "/alertas",
			icon: <BellRinging />,
		})
	}

	items.push({
		title: "Órdenes de Trabajo",
		url: "/ordenes-trabajo",
		icon: <Wrench />,
		items:
			role === "admin" || role === "supervisor"
				? [
						{ title: "Listado", url: "/ordenes-trabajo" },
						{ title: "Nueva OT", url: "/ordenes-trabajo/nueva" },
					]
				: undefined,
	})

	if (role === "admin" || role === "supervisor") {
		items.push({
			title: "Analíticas",
			url: "/analiticas",
			icon: <ChartBarIcon />,
		})
	}

	return items
}

function getNavAdmin(role: RolUsuario) {
	if (role !== "admin") return []
	return [
		{ title: "Usuarios", url: "/usuarios", icon: <Users /> },
		{ title: "Contratistas", url: "/contratistas", icon: <Buildings /> },
	]
}

function getHerramientas(role: RolUsuario) {
	if (role === "contratista") return []
	return [{ name: "Códigos QR", url: "/qr-codes", icon: <QrCodeIcon /> }]
}

function getNavSecondary(role: RolUsuario) {
	if (role !== "admin") return []
	return [
		{ title: "Configuración", url: "/configuracion", icon: <SlidersIcon /> },
	]
}

const userData = {
	name: usuarios[0].nombre,
	email: usuarios[0].email,
	avatar: "",
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { role } = useRole()

	const navMain = getNavMain(role)
	const administracion = getNavAdmin(role)
	const herramientas = getHerramientas(role)
	const navSecondary = getNavSecondary(role)

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
									<span className="truncate text-xs">{ROLE_LABELS[role]}</span>
								</div>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={navMain} />
				{administracion.length > 0 && <NavAdmin items={administracion} />}
				{herramientas.length > 0 && <NavProjects projects={herramientas} />}
				{navSecondary.length > 0 && (
					<NavSecondary items={navSecondary} className="mt-auto" />
				)}
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={userData} />
			</SidebarFooter>
		</Sidebar>
	)
}
