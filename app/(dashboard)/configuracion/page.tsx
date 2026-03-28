"use client"

import {
	Bell,
	Camera,
	Globe,
	Moon,
	Palette,
	Shield,
	Sun,
	User,
} from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { changePassword, globalSignOut } from "@/app/(dashboard)/auth/actions"
import {
	getCurrentUser,
	getPreferences,
	type Perfil,
	savePreferences,
	type UserPreferences,
	updatePerfil,
} from "@/app/(dashboard)/usuarios/actions"
import { uploadAvatar } from "@/app/(dashboard)/usuarios/upload-actions"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export default function ConfiguracionPage() {
	const router = useRouter()

	// Profile settings
	const [perfil, setPerfil] = useState<Perfil | null>(null)
	const [nombre, setNombre] = useState("")
	const [email, setEmail] = useState("")
	const [cargo, setCargo] = useState("")
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)

	// Notification settings
	const [notifEmail, setNotifEmail] = useState(true)
	const [notifPush, setNotifPush] = useState(true)
	const [notifFormularios, setNotifFormularios] = useState(true)
	const [notifEquipos, setNotifEquipos] = useState(false)
	const [notifReportes, setNotifReportes] = useState(true)

	// Appearance settings
	const [tema, setTema] = useState<"light" | "dark" | "system">("system")
	const [idioma, setIdioma] = useState("es")
	const [formatoFecha, setFormatoFecha] = useState("DD/MM/YYYY")

	// Avatar
	const avatarInputRef = useRef<HTMLInputElement>(null)
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

	async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0]
		if (!file) return
		const formData = new FormData()
		formData.append("file", file)
		const result = await uploadAvatar(formData)
		if (result.success) {
			setAvatarUrl(result.data.url)
			toast.success("Foto de perfil actualizada")
		} else {
			toast.error(result.error)
		}
	}

	// Security settings
	const [autenticacion2FA, setAutenticacion2FA] = useState(false)
	const [sesionActiva, setSesionActiva] = useState(true)

	// Password dialog
	const [showPasswordDialog, setShowPasswordDialog] = useState(false)
	const [currentPwd, setCurrentPwd] = useState("")
	const [newPwd, setNewPwd] = useState("")
	const [confirmPwd, setConfirmPwd] = useState("")
	const [pwdError, setPwdError] = useState("")
	const [changingPwd, setChangingPwd] = useState(false)

	// Close sessions
	const [closingSessions, setClosingSessions] = useState(false)

	// 2FA dialog
	const [show2FADialog, setShow2FADialog] = useState(false)
	const [mfaQrCode, setMfaQrCode] = useState("")
	const [mfaSecret, setMfaSecret] = useState("")
	const [mfaFactorId, setMfaFactorId] = useState("")
	const [mfaCode, setMfaCode] = useState("")
	const [mfaError, setMfaError] = useState("")
	const [enrolling2FA, setEnrolling2FA] = useState(false)

	// 2FA disable dialog
	const [show2FADisableDialog, setShow2FADisableDialog] = useState(false)
	const [disableMfaCode, setDisableMfaCode] = useState("")
	const [disableMfaError, setDisableMfaError] = useState("")
	const [disabling2FA, setDisabling2FA] = useState(false)

	const fetchUser = useCallback(async () => {
		setLoading(true)
		const { createClient: createBrowserClient } = await import(
			"@/lib/supabase/client"
		)
		const supabase = createBrowserClient()
		const [userResult, prefsResult, factorsResult] = await Promise.all([
			getCurrentUser(),
			getPreferences(),
			supabase.auth.mfa.listFactors(),
		])
		if (userResult.success) {
			setPerfil(userResult.data)
			setNombre(userResult.data.nombre)
			setEmail(userResult.data.email)
			setCargo(userResult.data.departamento ?? "")
		}
		if (prefsResult.success) {
			const p = prefsResult.data
			setNotifEmail(p.notifEmail)
			setNotifPush(p.notifPush)
			setNotifFormularios(p.notifFormularios)
			setNotifEquipos(p.notifEquipos)
			setNotifReportes(p.notifReportes)
			setTema(p.tema)
			setIdioma(p.idioma)
			setFormatoFecha(p.formatoFecha)
			setSesionActiva(p.keepSessionActive ?? true)
		}
		if (!factorsResult.error) {
			setAutenticacion2FA(factorsResult.data.totp.length > 0)
		}
		setLoading(false)
	}, [])

	useEffect(() => {
		fetchUser()
	}, [fetchUser])

	useEffect(() => {
		if (tema === "dark") {
			document.documentElement.classList.add("dark")
		} else if (tema === "light") {
			document.documentElement.classList.remove("dark")
		} else {
			const prefersDark = window.matchMedia(
				"(prefers-color-scheme: dark)",
			).matches
			if (prefersDark) {
				document.documentElement.classList.add("dark")
			} else {
				document.documentElement.classList.remove("dark")
			}
		}
	}, [tema])

	const handleSave = async () => {
		if (!perfil) return
		setSaving(true)

		const [profileResult, prefsResult] = await Promise.all([
			updatePerfil(perfil.id, {
				nombre,
				departamento: cargo || undefined,
			}),
			savePreferences({
				notifEmail,
				notifPush,
				notifFormularios,
				notifEquipos,
				notifReportes,
				tema,
				idioma,
				formatoFecha,
				keepSessionActive: sesionActiva,
			}),
		])

		setSaving(false)

		if (profileResult.success && prefsResult.success) {
			toast.success("Configuración guardada exitosamente")
			setPerfil(profileResult.data)
		} else if (!profileResult.success) {
			toast.error(profileResult.error)
		} else if (!prefsResult.success) {
			toast.error(prefsResult.error)
		}
	}

	// --- Password change handler ---
	async function handleChangePassword() {
		if (newPwd !== confirmPwd) {
			setPwdError("Las contraseñas no coinciden")
			return
		}
		if (newPwd.length < 6) {
			setPwdError("Mínimo 6 caracteres")
			return
		}
		setChangingPwd(true)
		setPwdError("")
		const result = await changePassword(currentPwd, newPwd)
		setChangingPwd(false)
		if (result.success) {
			toast.success("Contraseña cambiada exitosamente")
			setShowPasswordDialog(false)
			setCurrentPwd("")
			setNewPwd("")
			setConfirmPwd("")
		} else {
			setPwdError(result.error)
		}
	}

	// --- Global sign out handler ---
	async function handleGlobalSignOut() {
		setClosingSessions(true)
		const result = await globalSignOut()
		if (result.success) {
			router.push("/login")
		} else {
			toast.error(result.error)
			setClosingSessions(false)
		}
	}

	// --- 2FA toggle handler ---
	async function handle2FAToggle(checked: boolean) {
		const { createClient: createBrowserClient } = await import(
			"@/lib/supabase/client"
		)
		const supabase = createBrowserClient()
		if (checked) {
			// Enroll: clean stale unverified factors first
			setEnrolling2FA(true)
			const { data: factors } = await supabase.auth.mfa.listFactors()
			for (const f of factors?.all ?? []) {
				if (f.factor_type === "totp" && f.status === "unverified") {
					await supabase.auth.mfa.unenroll({ factorId: f.id })
				}
			}
			const { data, error } = await supabase.auth.mfa.enroll({
				factorType: "totp",
				friendlyName: "Portal Industrial",
			})
			setEnrolling2FA(false)
			if (error || !data) {
				toast.error("No se pudo iniciar el proceso 2FA")
				return
			}
			setMfaQrCode(data.totp.qr_code)
			setMfaSecret(data.totp.secret)
			setMfaFactorId(data.id)
			setMfaCode("")
			setMfaError("")
			setShow2FADialog(true)
		} else {
			// Disable: show confirmation dialog
			setDisableMfaCode("")
			setDisableMfaError("")
			setShow2FADisableDialog(true)
		}
	}

	// --- 2FA enrollment verify ---
	async function handle2FAVerify() {
		const code = mfaCode.replace(/\D/g, "")
		if (code.length !== 6) {
			setMfaError("Ingresa el código de 6 dígitos")
			return
		}
		setEnrolling2FA(true)
		setMfaError("")
		const { createClient: createBrowserClient } = await import(
			"@/lib/supabase/client"
		)
		const supabase = createBrowserClient()
		const { data: challenge, error: challengeErr } =
			await supabase.auth.mfa.challenge({ factorId: mfaFactorId })
		if (challengeErr || !challenge) {
			setMfaError("Error al crear desafío. Intenta de nuevo.")
			setEnrolling2FA(false)
			return
		}
		const { error: verifyErr } = await supabase.auth.mfa.verify({
			factorId: mfaFactorId,
			challengeId: challenge.id,
			code,
		})
		setEnrolling2FA(false)
		if (verifyErr) {
			setMfaError("Código incorrecto. Intenta de nuevo.")
			return
		}
		setAutenticacion2FA(true)
		setShow2FADialog(false)
		toast.success("Autenticación en dos pasos habilitada")
	}

	// --- 2FA disable ---
	async function handle2FADisable() {
		const code = disableMfaCode.replace(/\D/g, "")
		if (code.length !== 6) {
			setDisableMfaError("Ingresa el código de 6 dígitos")
			return
		}
		setDisabling2FA(true)
		setDisableMfaError("")
		const { createClient: createBrowserClient } = await import(
			"@/lib/supabase/client"
		)
		const supabase = createBrowserClient()
		const { data: factors } = await supabase.auth.mfa.listFactors()
		const factor = factors?.totp?.[0]
		if (!factor) {
			setDisableMfaError("No se encontró factor 2FA")
			setDisabling2FA(false)
			return
		}
		const { data: challenge, error: challengeErr } =
			await supabase.auth.mfa.challenge({ factorId: factor.id })
		if (challengeErr || !challenge) {
			setDisableMfaError("Error al crear desafío. Intenta de nuevo.")
			setDisabling2FA(false)
			return
		}
		const { error: verifyErr } = await supabase.auth.mfa.verify({
			factorId: factor.id,
			challengeId: challenge.id,
			code,
		})
		if (verifyErr) {
			setDisableMfaError("Código incorrecto. Intenta de nuevo.")
			setDisabling2FA(false)
			return
		}
		const { error: unenrollErr } = await supabase.auth.mfa.unenroll({
			factorId: factor.id,
		})
		setDisabling2FA(false)
		if (unenrollErr) {
			setDisableMfaError(unenrollErr.message)
			return
		}
		setAutenticacion2FA(false)
		setShow2FADisableDialog(false)
		toast.success("Autenticación en dos pasos deshabilitada")
	}

	// --- 2FA dialog cancel (cleanup unverified factor) ---
	async function handle2FADialogClose() {
		if (mfaFactorId) {
			const { createClient: createBrowserClient } = await import(
				"@/lib/supabase/client"
			)
			const supabase = createBrowserClient()
			await supabase.auth.mfa.unenroll({ factorId: mfaFactorId })
		}
		setShow2FADialog(false)
		setMfaFactorId("")
		setMfaQrCode("")
		setMfaSecret("")
		setMfaCode("")
		setMfaError("")
	}

	return (
		<SidebarInset>
			<header className="flex h-16 shrink-0 items-center gap-2">
				<div className="flex items-center gap-2 px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator
						orientation="vertical"
						className="mr-2 data-vertical:h-4"
					/>
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem className="hidden md:block">
								<BreadcrumbLink href="/dashboard">
									Portal Industrial
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator className="hidden md:block" />
							<BreadcrumbItem>
								<BreadcrumbPage>Configuración</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>

			<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-semibold">Configuración</h1>
						<p className="text-sm text-muted-foreground">
							Personaliza tu experiencia en el portal
						</p>
					</div>
					<Button onClick={handleSave} disabled={saving || loading}>
						{saving ? "Guardando..." : "Guardar Cambios"}
					</Button>
				</div>

				{loading && (
					<div className="flex items-center justify-center py-12">
						<p className="text-muted-foreground">Cargando configuración...</p>
					</div>
				)}

				{!loading && (
					<div className="grid gap-6 lg:grid-cols-2">
						{/* Perfil */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-3">
									<div
										className="relative cursor-pointer"
										onClick={() => avatarInputRef.current?.click()}
									>
										<div className="flex size-14 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-blue-600">
											{avatarUrl ? (
												<img
													src={avatarUrl}
													alt="Avatar"
													className="size-full object-cover"
												/>
											) : (
												<User className="size-7" weight="duotone" />
											)}
										</div>
										<div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
											<Camera className="size-3" />
										</div>
										<input
											ref={avatarInputRef}
											type="file"
											accept="image/*"
											className="hidden"
											onChange={handleAvatarUpload}
										/>
									</div>
									<div>
										<CardTitle>Perfil</CardTitle>
										<CardDescription>
											Haz clic en la foto para cambiarla
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<label
										htmlFor="nombre"
										className="mb-1.5 block text-sm font-medium"
									>
										Nombre Completo
									</label>
									<Input
										id="nombre"
										value={nombre}
										onChange={(e) => setNombre(e.target.value)}
									/>
								</div>
								<div>
									<label
										htmlFor="email"
										className="mb-1.5 block text-sm font-medium"
									>
										Correo Electrónico
									</label>
									<Input id="email" type="email" value={email} disabled />
								</div>
								<div>
									<label
										htmlFor="cargo"
										className="mb-1.5 block text-sm font-medium"
									>
										Departamento
									</label>
									<Input
										id="cargo"
										value={cargo}
										onChange={(e) => setCargo(e.target.value)}
									/>
								</div>
								{perfil && (
									<div>
										<label
											htmlFor="rol"
											className="mb-1.5 block text-sm font-medium"
										>
											Rol
										</label>
										<Input
											id="rol"
											value={
												perfil.rol === "admin"
													? "Administrador"
													: perfil.rol === "supervisor"
														? "Supervisor"
														: "Técnico"
											}
											disabled
										/>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Notificaciones */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-3">
									<div className="flex size-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
										<Bell className="size-5" weight="duotone" />
									</div>
									<div>
										<CardTitle>Notificaciones</CardTitle>
										<CardDescription>
											Configura cómo recibir alertas
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">
											Notificaciones por Email
										</p>
										<p className="text-xs text-muted-foreground">
											Recibe alertas en tu correo
										</p>
									</div>
									<Switch
										checked={notifEmail}
										onCheckedChange={setNotifEmail}
									/>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">Notificaciones Push</p>
										<p className="text-xs text-muted-foreground">
											Alertas en el navegador
										</p>
									</div>
									<Switch checked={notifPush} onCheckedChange={setNotifPush} />
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">Nuevos Formularios</p>
										<p className="text-xs text-muted-foreground">
											Cuando se envía un formulario
										</p>
									</div>
									<Switch
										checked={notifFormularios}
										onCheckedChange={setNotifFormularios}
									/>
								</div>
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">Alertas de Equipos</p>
										<p className="text-xs text-muted-foreground">
											Cuando un equipo cambia de estado
										</p>
									</div>
									<Switch
										checked={notifEquipos}
										onCheckedChange={setNotifEquipos}
									/>
								</div>
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">Reportes Semanales</p>
										<p className="text-xs text-muted-foreground">
											Resumen de actividad semanal
										</p>
									</div>
									<Switch
										checked={notifReportes}
										onCheckedChange={setNotifReportes}
									/>
								</div>
							</CardContent>
						</Card>

						{/* Apariencia */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-3">
									<div className="flex size-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
										<Palette className="size-5" weight="duotone" />
									</div>
									<div>
										<CardTitle>Apariencia</CardTitle>
										<CardDescription>Personaliza la interfaz</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<p className="mb-2 block text-sm font-medium">Tema</p>
									<div className="flex gap-2">
										{[
											{ value: "light", label: "Claro", icon: Sun },
											{ value: "dark", label: "Oscuro", icon: Moon },
											{ value: "system", label: "Sistema", icon: Globe },
										].map((option) => (
											<button
												key={option.value}
												type="button"
												onClick={() =>
													setTema(option.value as "light" | "dark" | "system")
												}
												className={cn(
													"flex flex-1 flex-col items-center gap-2 rounded-lg border p-3 transition-all",
													tema === option.value
														? "border-primary bg-primary/5"
														: "hover:bg-muted",
												)}
											>
												<option.icon
													className={cn(
														"size-5",
														tema === option.value
															? "text-primary"
															: "text-muted-foreground",
													)}
													weight="duotone"
												/>
												<span className="text-xs font-medium">
													{option.label}
												</span>
											</button>
										))}
									</div>
								</div>
								<Separator />
								<div>
									<label
										htmlFor="idioma"
										className="mb-1.5 block text-sm font-medium"
									>
										Idioma
									</label>
									<select
										id="idioma"
										value={idioma}
										onChange={(e) => setIdioma(e.target.value)}
										className="w-full rounded-md border bg-background p-2 text-sm"
									>
										<option value="es">Español</option>
										<option value="en">English</option>
										<option value="pt">Português</option>
									</select>
								</div>
								<div>
									<label
										htmlFor="formatoFecha"
										className="mb-1.5 block text-sm font-medium"
									>
										Formato de Fecha
									</label>
									<select
										id="formatoFecha"
										value={formatoFecha}
										onChange={(e) => setFormatoFecha(e.target.value)}
										className="w-full rounded-md border bg-background p-2 text-sm"
									>
										<option value="DD/MM/YYYY">DD/MM/YYYY</option>
										<option value="MM/DD/YYYY">MM/DD/YYYY</option>
										<option value="YYYY-MM-DD">YYYY-MM-DD</option>
									</select>
								</div>
							</CardContent>
						</Card>

						{/* Seguridad */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-3">
									<div className="flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
										<Shield className="size-5" weight="duotone" />
									</div>
									<div>
										<CardTitle>Seguridad</CardTitle>
										<CardDescription>Protege tu cuenta</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">
											Autenticación en Dos Pasos
										</p>
										<p className="text-xs text-muted-foreground">
											{autenticacion2FA
												? "Habilitada — app autenticadora activa"
												: "Añade una capa extra de seguridad"}
										</p>
									</div>
									<Switch
										checked={autenticacion2FA}
										onCheckedChange={handle2FAToggle}
										disabled={enrolling2FA}
									/>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">
											Mantener Sesión Activa
										</p>
										<p className="text-xs text-muted-foreground">
											No cerrar sesión automáticamente
										</p>
									</div>
									<Switch
										checked={sesionActiva}
										onCheckedChange={setSesionActiva}
									/>
								</div>
								<Separator />
								<div>
									<Button
										variant="outline"
										className="w-full"
										onClick={() => {
											setCurrentPwd("")
											setNewPwd("")
											setConfirmPwd("")
											setPwdError("")
											setShowPasswordDialog(true)
										}}
									>
										Cambiar Contraseña
									</Button>
								</div>
								<div>
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												variant="destructive"
												className="w-full"
												disabled={closingSessions}
											>
												{closingSessions
													? "Cerrando sesiones..."
													: "Cerrar Todas las Sesiones"}
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>
													¿Cerrar todas las sesiones?
												</AlertDialogTitle>
												<AlertDialogDescription>
													Se cerrará sesión en todos los dispositivos. Tendrás
													que volver a iniciar sesión.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancelar</AlertDialogCancel>
												<AlertDialogAction onClick={handleGlobalSignOut}>
													Cerrar Sesiones
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							</CardContent>
						</Card>

						{/* Dialog: Cambiar Contraseña */}
						<Dialog
							open={showPasswordDialog}
							onOpenChange={setShowPasswordDialog}
						>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Cambiar Contraseña</DialogTitle>
									<DialogDescription>
										Ingresa tu contraseña actual y la nueva contraseña.
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4 py-2">
									<div className="space-y-1.5">
										<label
											htmlFor="current-pwd"
											className="text-sm font-medium"
										>
											Contraseña actual
										</label>
										<Input
											id="current-pwd"
											type="password"
											placeholder="••••••••"
											value={currentPwd}
											onChange={(e) => setCurrentPwd(e.target.value)}
										/>
									</div>
									<div className="space-y-1.5">
										<label htmlFor="new-pwd" className="text-sm font-medium">
											Nueva contraseña
										</label>
										<Input
											id="new-pwd"
											type="password"
											placeholder="••••••••"
											value={newPwd}
											onChange={(e) => setNewPwd(e.target.value)}
										/>
									</div>
									<div className="space-y-1.5">
										<label
											htmlFor="confirm-pwd"
											className="text-sm font-medium"
										>
											Confirmar nueva contraseña
										</label>
										<Input
											id="confirm-pwd"
											type="password"
											placeholder="••••••••"
											value={confirmPwd}
											onChange={(e) => setConfirmPwd(e.target.value)}
										/>
									</div>
									{pwdError && (
										<p className="text-sm text-red-600">{pwdError}</p>
									)}
								</div>
								<DialogFooter>
									<Button
										variant="outline"
										onClick={() => setShowPasswordDialog(false)}
									>
										Cancelar
									</Button>
									<Button
										onClick={handleChangePassword}
										disabled={
											changingPwd || !currentPwd || !newPwd || !confirmPwd
										}
									>
										{changingPwd ? "Guardando..." : "Cambiar Contraseña"}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>

						{/* Dialog: 2FA Enrollment */}
						<Dialog
							open={show2FADialog}
							onOpenChange={(open) => {
								if (!open) handle2FADialogClose()
							}}
						>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>
										Configurar Autenticación en Dos Pasos
									</DialogTitle>
									<DialogDescription>
										Escanea el código QR con tu app autenticadora y verifica con
										el código de 6 dígitos.
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4 py-2">
									<p className="text-sm text-muted-foreground">
										Escanea este código QR con Google Authenticator, Authy u
										otra app autenticadora.
									</p>
									{mfaQrCode && (
										<div className="flex justify-center">
											<img
												src={mfaQrCode}
												alt="QR Code 2FA"
												className="size-48 rounded border"
											/>
										</div>
									)}
									{mfaSecret && (
										<div className="space-y-1">
											<p className="text-xs text-muted-foreground">
												O ingresa el código manualmente:
											</p>
											<code className="block break-all rounded bg-muted px-3 py-2 text-xs font-mono">
												{mfaSecret}
											</code>
										</div>
									)}
									<div className="space-y-1.5">
										<label
											htmlFor="mfa-enroll-code"
											className="text-sm font-medium"
										>
											Código de verificación (6 dígitos)
										</label>
										<Input
											id="mfa-enroll-code"
											placeholder="123456"
											maxLength={6}
											value={mfaCode}
											onChange={(e) =>
												setMfaCode(e.target.value.replace(/\D/g, ""))
											}
										/>
									</div>
									{mfaError && (
										<p className="text-sm text-red-600">{mfaError}</p>
									)}
								</div>
								<DialogFooter>
									<Button variant="outline" onClick={handle2FADialogClose}>
										Cancelar
									</Button>
									<Button
										onClick={handle2FAVerify}
										disabled={enrolling2FA || mfaCode.length < 6}
									>
										{enrolling2FA ? "Verificando..." : "Activar 2FA"}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>

						{/* Dialog: 2FA Disable */}
						<Dialog
							open={show2FADisableDialog}
							onOpenChange={(open) => {
								if (!open) {
									setShow2FADisableDialog(false)
									setAutenticacion2FA(true)
								}
							}}
						>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>
										Deshabilitar Autenticación en Dos Pasos
									</DialogTitle>
									<DialogDescription>
										Confirma con un código de tu app autenticadora para
										deshabilitar 2FA.
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4 py-2">
									<p className="text-sm text-muted-foreground">
										Para confirmar, ingresa el código de tu app autenticadora.
									</p>
									<div className="space-y-1.5">
										<label
											htmlFor="mfa-disable-code"
											className="text-sm font-medium"
										>
											Código de verificación (6 dígitos)
										</label>
										<Input
											id="mfa-disable-code"
											placeholder="123456"
											maxLength={6}
											value={disableMfaCode}
											onChange={(e) =>
												setDisableMfaCode(e.target.value.replace(/\D/g, ""))
											}
										/>
									</div>
									{disableMfaError && (
										<p className="text-sm text-red-600">{disableMfaError}</p>
									)}
								</div>
								<DialogFooter>
									<Button
										variant="outline"
										onClick={() => {
											setShow2FADisableDialog(false)
											setAutenticacion2FA(true)
										}}
									>
										Cancelar
									</Button>
									<Button
										variant="destructive"
										onClick={handle2FADisable}
										disabled={disabling2FA || disableMfaCode.length < 6}
									>
										{disabling2FA ? "Deshabilitando..." : "Deshabilitar 2FA"}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				)}
			</div>
		</SidebarInset>
	)
}
