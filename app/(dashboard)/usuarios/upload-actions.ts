"use server"

import { createClient, getUser } from "@/lib/supabase/server"
import type { ActionResult } from "@/lib/types"

export async function uploadAvatar(
	formData: FormData,
): Promise<ActionResult<{ url: string }>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const file = formData.get("file") as File
	if (!file) return { success: false, error: "No se seleccionó archivo" }

	const supabase = await createClient()
	const ext = file.name.split(".").pop()
	const fileName = `${user.id}/avatar.${ext}`

	const { error } = await supabase.storage
		.from("avatars")
		.upload(fileName, file, { upsert: true })

	if (error) return { success: false, error: error.message }

	const { data } = supabase.storage.from("avatars").getPublicUrl(fileName)
	return { success: true, data: { url: data.publicUrl } }
}
