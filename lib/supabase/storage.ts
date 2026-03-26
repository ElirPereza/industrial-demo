import { createClient } from "@/lib/supabase/client"

export async function uploadFile(
	bucket: string,
	path: string,
	file: File | Blob,
): Promise<{ url: string; error: null } | { url: null; error: string }> {
	const supabase = createClient()
	const { data, error } = await supabase.storage
		.from(bucket)
		.upload(path, file, { upsert: false })

	if (error) return { url: null, error: error.message }

	const { data: urlData } = supabase.storage
		.from(bucket)
		.getPublicUrl(data.path)
	return { url: urlData.publicUrl, error: null }
}

export async function getSignedUrl(
	bucket: string,
	path: string,
	expiresIn = 3600,
): Promise<string | null> {
	const supabase = createClient()
	const { data, error } = await supabase.storage
		.from(bucket)
		.createSignedUrl(path, expiresIn)

	if (error) return null
	return data.signedUrl
}

export async function deleteFile(
	bucket: string,
	path: string,
): Promise<boolean> {
	const supabase = createClient()
	const { error } = await supabase.storage.from(bucket).remove([path])
	return !error
}

export function getPublicUrl(bucket: string, path: string): string {
	const supabase = createClient()
	const { data } = supabase.storage.from(bucket).getPublicUrl(path)
	return data.publicUrl
}
