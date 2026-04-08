import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url)
	const code = searchParams.get("code")

	if (code) {
		const supabase = await createClient()
		const { error } = await supabase.auth.exchangeCodeForSession(code)
		if (!error) {
			await supabase.auth.signOut()
			return NextResponse.redirect(`${origin}/login?confirmed=true`)
		}
	}

	return NextResponse.redirect(`${origin}/login?error=auth`)
}
