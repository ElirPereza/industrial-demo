"use client"

import { Factory } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
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
	const [isLoading, setIsLoading] = useState(false)
	const [errors, setErrors] = useState({ email: false, password: false })

	// MFA step
	const [showMfaStep, setShowMfaStep] = useState(false)
	const [mfaCode, setMfaCode] = useState("")
	const [mfaError, setMfaError] = useState("")
	const [mfaLoading, setMfaLoading] = useState(false)
	const [mfaFactorId, setMfaFactorId] = useState("")

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		const newErrors = {
			email: email.trim() === "",
			password: password.trim() === "",
		}
		setErrors(newErrors)
		if (newErrors.email || newErrors.password) return

		setIsLoading(true)

		const { createClient } = await import("@/lib/supabase/client")
		const supabase = createClient()
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		})

		if (error) {
			toast.error(error.message || "Credenciales incorrectas")
			setIsLoading(false)
			return
		}

		// Check if MFA is required
		const { data: aal } =
			await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
		if (aal?.currentLevel === "aal1" && aal?.nextLevel === "aal2") {
			// Has MFA — get factor id and show TOTP step
			const { data: factors } = await supabase.auth.mfa.listFactors()
			const totp = factors?.totp?.[0]
			if (totp) {
				setMfaFactorId(totp.id)
				setMfaCode("")
				setMfaError("")
				setShowMfaStep(true)
				setIsLoading(false)
				return
			}
		}

		router.push("/dashboard")
		router.refresh()
	}

	const handleMfaVerify = async () => {
		const code = mfaCode.replace(/\D/g, "")
		if (code.length !== 6) {
			setMfaError("Ingresa el código de 6 dígitos")
			return
		}
		setMfaLoading(true)
		setMfaError("")
		const { createClient } = await import("@/lib/supabase/client")
		const supabase = createClient()
		const { data: challenge, error: challengeErr } =
			await supabase.auth.mfa.challenge({ factorId: mfaFactorId })
		if (challengeErr || !challenge) {
			setMfaError("Error al crear desafío. Intenta de nuevo.")
			setMfaLoading(false)
			return
		}
		const { error: verifyErr } = await supabase.auth.mfa.verify({
			factorId: mfaFactorId,
			challengeId: challenge.id,
			code,
		})
		setMfaLoading(false)
		if (verifyErr) {
			setMfaError("Código incorrecto. Intenta de nuevo.")
			return
		}
		router.push("/dashboard")
		router.refresh()
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
					{showMfaStep ? (
						<div className="space-y-4">
							<div className="space-y-2">
								<p className="text-sm text-muted-foreground text-center">
									Ingresa el código de 6 dígitos de tu app autenticadora
								</p>
								<label htmlFor="mfa-code" className="text-sm font-medium">
									Código de verificación
								</label>
								<Input
									id="mfa-code"
									placeholder="123456"
									maxLength={6}
									value={mfaCode}
									onChange={(e) => {
										setMfaCode(e.target.value.replace(/\D/g, ""))
										if (mfaError) setMfaError("")
									}}
									className={
										mfaError ? "border-red-500 ring-1 ring-red-500/20" : ""
									}
								/>
								{mfaError && <p className="text-xs text-red-600">{mfaError}</p>}
							</div>
							<Button
								type="button"
								className="w-full"
								onClick={handleMfaVerify}
								disabled={mfaLoading || mfaCode.length < 6}
							>
								{mfaLoading ? "Verificando..." : "Verificar"}
							</Button>
							<div className="text-center">
								<button
									type="button"
									className="text-xs text-muted-foreground hover:text-foreground transition-colors"
									onClick={() => {
										setShowMfaStep(false)
										setMfaCode("")
										setMfaError("")
									}}
								>
									← Volver al inicio de sesión
								</button>
							</div>
						</div>
					) : (
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

							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
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
					)}
				</CardContent>
			</Card>
		</div>
	)
}
