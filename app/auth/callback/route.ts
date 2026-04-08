import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url)
	const code = searchParams.get("code")
	const rawNext = searchParams.get("next")
	const safeNext =
		rawNext?.startsWith("/") && !rawNext.startsWith("//") ? rawNext : null

	if (code) {
		const supabase = await createClient()
		const { error } = await supabase.auth.exchangeCodeForSession(code)
		if (!error) {
			if (safeNext) {
				return NextResponse.redirect(`${origin}${safeNext}`)
			}
			const {
				data: { user },
			} = await supabase.auth.getUser()
			if (user) {
				const { data: profile } = await supabase
					.from("profiles")
					.select("id_organizacion")
					.eq("id", user.id)
					.single()
				const { data: org } = profile?.id_organizacion
					? await supabase
							.from("organizaciones")
							.select("nombre")
							.eq("id", profile.id_organizacion)
							.single()
					: { data: null }
				const isNewOrg = org?.nombre?.startsWith("Organización de ")
				return NextResponse.redirect(
					`${origin}${isNewOrg ? "/onboarding" : "/dashboard"}`,
				)
			}
			return NextResponse.redirect(`${origin}/dashboard`)
		}
	}

	return NextResponse.redirect(`${origin}/login?error=auth`)
}
