"use client"

import {
	Buildings,
	DeviceMobile,
	Eye,
	Factory,
	ShieldCheck,
	UserCircleGear,
	Wrench,
} from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import type { RolUsuario } from "@/lib/mock-data"
import { useRole } from "@/lib/role-provider"
import { cn } from "@/lib/utils"

const ROLES = [
	{
		rol: "admin" as RolUsuario,
		label: "Admin",
		icon: ShieldCheck,
		color: "text-primary",
		bg: "bg-primary/10",
	},
	{
		rol: "supervisor" as RolUsuario,
		label: "Supervisor",
		icon: UserCircleGear,
		color: "text-blue-600 dark:text-blue-400",
		bg: "bg-blue-50 dark:bg-blue-900/20",
	},
	{
		rol: "tecnico" as RolUsuario,
		label: "Técnico",
		icon: Wrench,
		color: "text-green-600 dark:text-green-400",
		bg: "bg-green-50 dark:bg-green-900/20",
	},
	{
		rol: "contratista" as RolUsuario,
		label: "Contratista",
		icon: Buildings,
		color: "text-orange-600 dark:text-orange-400",
		bg: "bg-orange-50 dark:bg-orange-900/20",
	},
] as const

const MOBILE_VIEWS = [
	{
		label: "Técnico",
		href: "/mobile/tecnico",
		color: "text-green-600 dark:text-green-400",
	},
	{
		label: "Contratista",
		href: "/mobile/contratista",
		color: "text-orange-600 dark:text-orange-400",
	},
	{
		label: "Alertas",
		href: "/mobile/alertas",
		color: "text-red-600 dark:text-red-400",
	},
	{
		label: "Órdenes",
		href: "/mobile/ordenes",
		color: "text-blue-600 dark:text-blue-400",
	},
] as const

export default function LoginPage() {
	const router = useRouter()
	const { setRole } = useRole()
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [errors, setErrors] = useState({ email: false, password: false })

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const newErrors = {
			email: email.trim() === "",
			password: password.trim() === "",
		}
		setErrors(newErrors)
		if (!newErrors.email && !newErrors.password) {
			router.push("/dashboard")
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
			<div className="flex w-full max-w-[820px] flex-col gap-6 lg:flex-row lg:items-start">
				<Card className="w-full lg:w-[400px]">
					<CardHeader className="space-y-4 text-center">
						<div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-primary/10">
							<Factory className="size-6 text-primary" weight="duotone" />
						</div>
						<div>
							<CardTitle className="text-2xl">Industrial Portal</CardTitle>
							<CardDescription className="mt-2">
								Ingresa tus credenciales para acceder al sistema
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<label htmlFor="email" className="text-sm font-medium">
									Correo electrónico
								</label>
								<Input
									id="email"
									type="email"
									placeholder="usuario@industrial.com"
									value={email}
									onChange={(e) => {
										setEmail(e.target.value)
										if (errors.email) setErrors({ ...errors, email: false })
									}}
									className={
										errors.email ? "border-red-500 ring-1 ring-red-500/20" : ""
									}
									aria-invalid={errors.email}
								/>
								{errors.email && (
									<p className="text-xs text-red-600">
										El correo electrónico es requerido
									</p>
								)}
							</div>

							<div className="space-y-2">
								<label htmlFor="password" className="text-sm font-medium">
									Contraseña
								</label>
								<Input
									id="password"
									type="password"
									placeholder="••••••••"
									value={password}
									onChange={(e) => {
										setPassword(e.target.value)
										if (errors.password)
											setErrors({ ...errors, password: false })
									}}
									className={
										errors.password
											? "border-red-500 ring-1 ring-red-500/20"
											: ""
									}
									aria-invalid={errors.password}
								/>
								{errors.password && (
									<p className="text-xs text-red-600">
										La contraseña es requerida
									</p>
								)}
							</div>

							<Button type="submit" className="w-full">
								Iniciar Sesión
							</Button>

							<div className="text-center">
								<button
									type="button"
									className="text-xs text-muted-foreground transition-colors hover:text-foreground"
									onClick={() => {}}
								>
									¿Olvidaste tu contraseña?
								</button>
							</div>
						</form>
					</CardContent>
				</Card>

				<div className="flex w-full flex-col gap-4 lg:w-[400px]">
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Acceso rápido por rol (demo)
							</CardTitle>
						</CardHeader>
						<CardContent className="grid grid-cols-2 gap-2">
							{ROLES.map((item) => (
								<Button
									key={item.rol}
									variant="outline"
									size="sm"
									className="h-auto flex-col gap-1.5 py-3"
									onClick={() => {
										setRole(item.rol)
										router.push("/dashboard")
									}}
								>
									<div
										className={cn(
											"flex size-8 items-center justify-center rounded-lg",
											item.bg,
										)}
									>
										<item.icon
											className={cn("size-4", item.color)}
											weight="duotone"
										/>
									</div>
									<span className="text-xs font-medium">{item.label}</span>
								</Button>
							))}
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<div className="flex items-center gap-2">
								<DeviceMobile
									className="size-4 text-muted-foreground"
									weight="duotone"
								/>
								<CardTitle className="text-sm font-medium text-muted-foreground">
									Vistas Mobile (demo)
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="grid grid-cols-2 gap-2">
							{MOBILE_VIEWS.map((view) => (
								<Button
									key={view.href}
									variant="outline"
									size="sm"
									className="h-auto gap-2 py-2.5"
									onClick={() => router.push(view.href)}
								>
									<span className={cn("text-xs font-medium", view.color)}>
										{view.label}
									</span>
								</Button>
							))}
						</CardContent>
					</Card>

					<Button
						variant="ghost"
						size="sm"
						className="w-full gap-2"
						onClick={() => router.push("/onboarding")}
					>
						<Eye className="size-4" />
						<span className="text-xs">Ver Onboarding</span>
					</Button>
				</div>
			</div>
		</div>
	)
}
