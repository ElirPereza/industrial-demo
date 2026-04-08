"use client"

import {
	Buildings,
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
import type { RolUsuario } from "@/lib/mock-data"
import { useRole } from "@/lib/role-provider"

export default function LoginPage() {
	const router = useRouter()
	const { setRole } = useRole()
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [errors, setErrors] = useState({ email: false, password: false })

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		// Visual validation
		const newErrors = {
			email: email.trim() === "",
			password: password.trim() === "",
		}

		setErrors(newErrors)

		// If no errors, redirect to dashboard
		if (!newErrors.email && !newErrors.password) {
			router.push("/dashboard")
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
			<Card className="w-full max-w-md">
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
									if (errors.password) setErrors({ ...errors, password: false })
								}}
								className={
									errors.password ? "border-red-500 ring-1 ring-red-500/20" : ""
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
								onClick={() => {
									// Non-functional, just visual
								}}
							>
								¿Olvidaste tu contraseña?
							</button>
						</div>
					</form>

					<div className="mt-6 border-t pt-6">
						<p className="mb-3 text-center text-xs font-medium text-muted-foreground">
							Acceso rápido por rol (demo)
						</p>
						<div className="grid grid-cols-2 gap-2">
							{(
								[
									{
										rol: "admin" as RolUsuario,
										label: "Admin",
										icon: ShieldCheck,
										color: "text-primary",
									},
									{
										rol: "supervisor" as RolUsuario,
										label: "Supervisor",
										icon: UserCircleGear,
										color: "text-blue-600 dark:text-blue-400",
									},
									{
										rol: "tecnico" as RolUsuario,
										label: "Técnico",
										icon: Wrench,
										color: "text-green-600 dark:text-green-400",
									},
									{
										rol: "contratista" as RolUsuario,
										label: "Contratista",
										icon: Buildings,
										color: "text-orange-600 dark:text-orange-400",
									},
								] as const
							).map((item) => (
								<Button
									key={item.rol}
									variant="outline"
									size="sm"
									className="h-auto flex-col gap-1 py-3"
									onClick={() => {
										setRole(item.rol)
										router.push("/dashboard")
									}}
								>
									<item.icon
										className={`size-5 ${item.color}`}
										weight="duotone"
									/>
									<span className="text-xs">{item.label}</span>
								</Button>
							))}
						</div>
						<Button
							variant="ghost"
							size="sm"
							className="mt-2 w-full gap-2"
							onClick={() => router.push("/onboarding")}
						>
							<Eye className="size-4" />
							<span className="text-xs">Ver Onboarding</span>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
