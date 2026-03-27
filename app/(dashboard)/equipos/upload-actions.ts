"use server"

import { revalidateTag } from "next/cache"
import { createClient, getUser } from "@/lib/supabase/server"
import type { ActionResult } from "@/lib/types"

export async function uploadEquipoImage(
	equipoId: string,
	formData: FormData,
): Promise<ActionResult<{ url: string }>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const file = formData.get("file") as File
	if (!file) return { success: false, error: "No se seleccionó archivo" }

	const supabase = await createClient()
	const ext = file.name.split(".").pop()
	const fileName = `${equipoId}/${Date.now()}.${ext}`

	const { error: uploadError } = await supabase.storage
		.from("equipment-images")
		.upload(fileName, file)

	if (uploadError) return { success: false, error: uploadError.message }

	const { data: urlData } = supabase.storage
		.from("equipment-images")
		.getPublicUrl(fileName)

	const { error: dbError } = await supabase.from("imagenes").insert({
		equipo_id: equipoId,
		url: urlData.publicUrl,
		titulo: file.name,
	})

	if (dbError) return { success: false, error: dbError.message }

	revalidateTag("equipos", "max")
	return { success: true, data: { url: urlData.publicUrl } }
}

export async function uploadEquipoDocument(
	equipoId: string,
	formData: FormData,
): Promise<ActionResult<{ url: string }>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const file = formData.get("file") as File
	if (!file) return { success: false, error: "No se seleccionó archivo" }

	const supabase = await createClient()
	const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf"
	const fileName = `${equipoId}/${Date.now()}-${file.name}`

	const { error: uploadError } = await supabase.storage
		.from("equipment-documents")
		.upload(fileName, file)

	if (uploadError) return { success: false, error: uploadError.message }

	const { data: signedData } = await supabase.storage
		.from("equipment-documents")
		.createSignedUrl(fileName, 60 * 60 * 24 * 365)

	const url = signedData?.signedUrl ?? fileName

	let tipo: "pdf" | "doc" | "img" = "pdf"
	if (["doc", "docx", "xls", "xlsx"].includes(ext)) tipo = "doc"
	if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) tipo = "img"

	const { error: dbError } = await supabase.from("documentos").insert({
		equipo_id: equipoId,
		nombre: file.name,
		tipo,
		tamano: `${(file.size / 1024).toFixed(0)} KB`,
		url,
	})

	if (dbError) return { success: false, error: dbError.message }

	revalidateTag("equipos", "max")
	return { success: true, data: { url } }
}

export async function deleteEquipoImage(
	imageId: string,
): Promise<ActionResult<void>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { error } = await supabase.from("imagenes").delete().eq("id", imageId)
	if (error) return { success: false, error: error.message }

	revalidateTag("equipos", "max")
	return { success: true, data: undefined }
}

export async function deleteEquipoDocument(
	docId: string,
): Promise<ActionResult<void>> {
	const user = await getUser()
	if (!user) return { success: false, error: "No autorizado" }

	const supabase = await createClient()
	const { error } = await supabase.from("documentos").delete().eq("id", docId)
	if (error) return { success: false, error: error.message }

	revalidateTag("equipos", "max")
	return { success: true, data: undefined }
}
