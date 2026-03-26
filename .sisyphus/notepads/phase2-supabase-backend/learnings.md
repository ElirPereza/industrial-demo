## [T3 Complete] Supabase Client Utilities
- lib/supabase/server.ts: async createClient() + getUser() helper
- lib/supabase/client.ts: createBrowserClient
- types/supabase.ts: placeholder Database type (replace after DB setup)
- Build: PASS

## [T4 Complete] Auth Middleware
- middleware.ts created at project root (NOT proxy.ts)
- Route protection: /login and / are public, everything else requires auth
- Session refresh on every request via supabase.auth.getUser()
- Note: Next.js 16 shows deprecation warning preferring "proxy" convention — middleware still works correctly
- Build: PASS

## [T5 Complete] Dashboard Layout Refactor
- Created: app/(dashboard)/layout.tsx with SidebarProvider
- Moved: 15 pages into (dashboard) route group
- Pages still removed SidebarProvider from: /dashboard, /formularios, /formularios/constructor, /formularios/admin, /formularios/llenar/[id], /equipos, /equipos/[id], /equipos/nuevo, /qr-codes, /analiticas, /usuarios, /usuarios/nuevo, /contratistas, /contratistas/nuevo, /configuracion
- Build: PASS
- Issue: qr-codes/page.tsx needed fragment wrapping and optional-chaining fixes after removing the shared layout wrapper

## [T6 Complete] Shared Infrastructure
- lib/types.ts: ActionResult<T> type created
- lib/validations/index.ts: base Zod schemas (uuid, email, pagination)
- Sonner toast: installed and added to layout
- alert() replaced in 6 files: app/(dashboard)/usuarios/nuevo/page.tsx, app/(dashboard)/formularios/llenar/[id]/page.tsx, app/(dashboard)/equipos/nuevo/page.tsx, app/(dashboard)/formularios/constructor/page.tsx, app/(dashboard)/configuracion/page.tsx, app/(dashboard)/contratistas/nuevo/page.tsx
- Build: PASS
