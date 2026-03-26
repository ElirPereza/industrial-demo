import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request,
	})

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll()
				},
				setAll(cookiesToSet) {
					for (const { name, value } of cookiesToSet) {
						request.cookies.set(name, value)
					}
					supabaseResponse = NextResponse.next({
						request,
					})
					for (const { name, value, options } of cookiesToSet) {
						supabaseResponse.cookies.set(name, value, options)
					}
				},
			},
		},
	)

	// IMPORTANT: Do NOT write additional code between createServerClient and
	// supabase.auth.getUser(). This refreshes the session token.
	const {
		data: { user },
	} = await supabase.auth.getUser()

	const { pathname } = request.nextUrl

	// Public routes — no auth required
	const publicRoutes = ["/", "/login"]
	const isPublicRoute = publicRoutes.includes(pathname)

	// Redirect unauthenticated users from protected routes
	if (!user && !isPublicRoute) {
		const redirectUrl = request.nextUrl.clone()
		redirectUrl.pathname = "/login"
		return NextResponse.redirect(redirectUrl)
	}

	// Redirect authenticated users away from login
	if (user && pathname === "/login") {
		const redirectUrl = request.nextUrl.clone()
		redirectUrl.pathname = "/dashboard"
		return NextResponse.redirect(redirectUrl)
	}

	// Set cache control for authenticated responses
	if (user) {
		supabaseResponse.headers.set("Cache-Control", "private, no-store")
	}

	return supabaseResponse
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization)
		 * - favicon.ico
		 * - public folder files
		 */
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
}
