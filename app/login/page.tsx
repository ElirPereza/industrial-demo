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
import { type FormEvent, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { RolUsuario } from "@/lib/types"
import { useRole } from "@/lib/role-provider"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

type AuthMode = "signin" | "signup"

type FormErrors = {
	nombre: boolean
	email: boolean
	password: boolean
}

const ROLES = [
	{
		rol: "admin" as RolUsuario,
		label: "Admin",
		email: "admin@demo.industrial.com",
		nombre: "Administrador Demo",
		icon: ShieldCheck,
		color: "text-primary",
		bg: "bg-primary/10",
	},
	{
		rol: "supervisor" as RolUsuario,
		label: "Supervisor",
		email: "supervisor@demo.industrial.com",
		nombre: "Supervisor Demo",
		icon: UserCircleGear,
		color: "text-blue-600 dark:text-blue-400",
		bg: "bg-blue-50 dark:bg-blue-900/20",
	},
	{
		rol: "tecnico" as RolUsuario,
		label: "Técnico",
		email: "tecnico@demo.industrial.com",
		nombre: "Técnico Demo",
		icon: Wrench,
		color: "text-green-600 dark:text-green-400",
		bg: "bg-green-50 dark:bg-green-900/20",
	},
	{
		rol: "contratista" as RolUsuario,
		label: "Contratista",
		email: "contratista@demo.industrial.com",
		nombre: "Contratista Demo",
		icon: Buildings,
		color: "text-orange-600 dark:text-orange-400",
		bg: "bg-orange-50 dark:bg-orange-900/20",
	},
] as const

const DEMO_PASSWORD = "demo123456"

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
	const supabase = useMemo(() => createClient(), [])
	const { setRole } = useRole()
	const [mode, setMode] = useState<AuthMode>("signin")
	const [nombre, setNombre] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [errors, setErrors] = useState<FormErrors>({
		nombre: false,
		email: false,
		password: false,
	})
	const [authError, setAuthError] = useState<string | null>(null)
	const [authSuccess, setAuthSuccess] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [quickAccessLoading, setQuickAccessLoading] =
		useState<RolUsuario | null>(null)

	const clearFeedback = () => {
		setAuthError(null)
		setAuthSuccess(null)
	}

	const navigateToDashboard = () => {
		router.push("/dashboard")
		router.refresh()
	}

	const getAuthErrorMessage = (message: string) => {
		const msg = message.toLowerCase()
		if (msg.includes("invalid login credentials")) {
			return "Credenciales inválidas. Verifica tu correo y contraseña."
		}
		if (msg.includes("email not confirmed")) {
			return "Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada."
		}
		if (msg.includes("user already registered")) {
			return "Este correo ya está registrado. Usa Iniciar Sesión."
		}
		if (msg.includes("password") && msg.includes("6")) {
			return "La contraseña debe tener al menos 6 caracteres."
		}
		if (msg.includes("valid email") || msg.includes("invalid email")) {
			return "Ingresa un correo electrónico válido."
		}
		if (msg.includes("rate limit") || msg.includes("too many")) {
			return "Demasiados intentos. Espera un momento antes de reintentar."
		}
		if (msg.includes("network") || msg.includes("fetch")) {
			return "Error de conexión. Verifica tu internet e intenta de nuevo."
		}
		return message
	}

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		clearFeedback()

		const newErrors = {
			nombre: mode === "signup" && nombre.trim() === "",
			email: email.trim() === "",
			password: password.trim() === "",
		}

		setErrors(newErrors)

		if (newErrors.nombre || newErrors.email || newErrors.password) {
			return
		}

		setIsSubmitting(true)

		try {
			if (mode === "signin") {
				const { error } = await supabase.auth.signInWithPassword({
					email: email.trim(),
					password,
				})

				if (error) {
					setAuthError(getAuthErrorMessage(error.message))
					return
				}

				navigateToDashboard()
				return
			}

			const { data, error } = await supabase.auth.signUp({
				email: email.trim(),
				password,
				options: {
					data: {
						nombre: nombre.trim(),
						rol: "admin",
					},
				},
			})

			if (error) {
				setAuthError(getAuthErrorMessage(error.message))
				return
			}

			if (data.user && !data.session) {
				if (data.user.identities?.length === 0) {
					setAuthError("Este correo ya está registrado. Usa Iniciar Sesión.")
					return
				}
				setAuthSuccess(
					"Cuenta creada. Revisa tu correo para confirmar tu acceso antes de iniciar sesión.",
				)
				return
			}

			if (data.session) {
				setRole("admin")
				navigateToDashboard()
				return
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleQuickAccess = async (demoRole: (typeof ROLES)[number]) => {
		clearFeedback()
		setQuickAccessLoading(demoRole.rol)

		try {
			const { error: signInError } = await supabase.auth.signInWithPassword({
				email: demoRole.email,
				password: DEMO_PASSWORD,
			})

			if (signInError) {
				setAuthError(
					`No se pudo acceder como ${demoRole.nombre}. Verifica que los usuarios demo estén creados.`,
				)
				return
			}

			setRole(demoRole.rol)
			navigateToDashboard()
		} finally {
			setQuickAccessLoading(null)
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
						<div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
							<Button
								type="button"
								variant={mode === "signin" ? "default" : "ghost"}
								size="sm"
								onClick={() => {
									setMode("signin")
									clearFeedback()
									setErrors({ nombre: false, email: false, password: false })
								}}
								disabled={isSubmitting || quickAccessLoading !== null}
							>
								Iniciar sesión
							</Button>
							<Button
								type="button"
								variant={mode === "signup" ? "default" : "ghost"}
								size="sm"
								onClick={() => {
									setMode("signup")
									clearFeedback()
									setErrors({ nombre: false, email: false, password: false })
								}}
								disabled={isSubmitting || quickAccessLoading !== null}
							>
								Crear cuenta
							</Button>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4">
							{mode === "signup" && (
								<div className="space-y-2">
									<label htmlFor="nombre" className="text-sm font-medium">
										Nombre completo
									</label>
									<Input
										id="nombre"
										type="text"
										placeholder="Tu nombre"
										value={nombre}
										onChange={(e) => {
											setNombre(e.target.value)
											if (errors.nombre) {
												setErrors((currentErrors) => ({
													...currentErrors,
													nombre: false,
												}))
											}
										}}
										className={
											errors.nombre
												? "border-red-500 ring-1 ring-red-500/20"
												: ""
										}
										aria-invalid={errors.nombre}
										disabled={isSubmitting || quickAccessLoading !== null}
									/>
									{errors.nombre && (
										<p className="text-xs text-red-600">
											El nombre es requerido
										</p>
									)}
								</div>
							)}

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
									disabled={isSubmitting || quickAccessLoading !== null}
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
									disabled={isSubmitting || quickAccessLoading !== null}
								/>
								{errors.password && (
									<p className="text-xs text-red-600">
										La contraseña es requerida
									</p>
								)}
							</div>

							{authError && <p className="text-sm text-red-600">{authError}</p>}

							{authSuccess && (
								<p className="text-sm text-green-600">{authSuccess}</p>
							)}

							<Button
								type="submit"
								className="w-full"
								disabled={isSubmitting || quickAccessLoading !== null}
							>
								{isSubmitting
									? mode === "signin"
										? "Ingresando..."
										: "Creando cuenta..."
									: mode === "signin"
										? "Iniciar Sesión"
										: "Crear cuenta"}
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
									onClick={() => void handleQuickAccess(item)}
									disabled={isSubmitting || quickAccessLoading !== null}
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
									<span className="text-xs font-medium">
										{quickAccessLoading === item.rol
											? "Accediendo..."
											: item.label}
									</span>
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
