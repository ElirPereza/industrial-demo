"use server"

import { redirect } from "next/navigation"
import { createClient, getUser } from "@/lib/supabase/server"
import type { ActionResult } from "@/lib/types"

export async function signOut() {
	const supabase = await createClient()
	await supabase.auth.signOut({ scope: "local" })
	redirect("/login")
}

export async function globalSignOut(): Promise<ActionResult<void>> {
	const supabase = await createClient()
	const { error } = await supabase.auth.signOut({ scope: "global" })
	if (error) return { success: false, error: error.message }
	return { success: true, data: undefined }
}

export async function changePassword(
	currentPassword: string,
	newPassword: string,
): Promise<ActionResult<void>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()

	// Verify current password by re-authenticating
	const { error: signInError } = await supabase.auth.signInWithPassword({
		email: user.email ?? "",
		password: currentPassword,
	})
	if (signInError)
		return { success: false, error: "Contraseña actual incorrecta" }

	// Update to new password
	const { error: updateError } = await supabase.auth.updateUser({
		password: newPassword,
	})
	if (updateError) return { success: false, error: updateError.message }

	return { success: true, data: undefined }
}
