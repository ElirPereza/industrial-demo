"use client"

import { Factory } from "@phosphor-icons/react"
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

export default function LoginPage() {
	const router = useRouter()
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
								className="text-xs text-muted-foreground hover:text-foreground transition-colors"
								onClick={() => {
									// Non-functional, just visual
								}}
							>
								¿Olvidaste tu contraseña?
							</button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
