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

## [T11 Complete] Equipos Server Actions
- app/(dashboard)/equipos/actions.ts: 6 actions (getEquipos, getEquipoById, createEquipo, updateEquipo, deleteEquipo, getEquipoStats)
- lib/validations/equipos.ts: createEquipoSchema, updateEquipoSchema
- CRITICAL: Next.js 16 revalidateTag requires 2nd arg — use revalidateTag(tag, "max") for stale-while-revalidate
- Zod 4.3.6 uses `.issues` not `.errors` on parse error objects
- Used `unknown[]` instead of `any[]` for Biome compliance (documentos, imagenes)
- DB types use underscores (maquinaria_pesada) vs UI mock-data uses hyphens (maquinaria-pesada)
- Build: PASS

## [T12 Complete] Formularios Server Actions
- app/(dashboard)/formularios/actions.ts: 7 actions including polymorphic filter
- lib/validations/formularios.ts: createFormularioSchema, updateFormularioSchema
- Build: PASS

## [T14+T15+T16 Complete] Maintenance, Contratistas, Usuarios, Analytics Actions
- maintenance-actions.ts: 5 actions (getRegistrosPorEquipo, createRegistro, updateRegistroEstado, getActividadesPorEquipo, getMaintenanceStats)
- contratistas/actions.ts: 5 actions (getContratistas, getContratistaById, createContratista, updateContratista, deleteContratista)
- usuarios/actions.ts: 4 actions (getUsuarios, getCurrentUser, getUsuarioById, updatePerfil)
- analiticas/actions.ts: 6 analytics queries (getDashboardKPIs, getFormulariosPorMes, getTendenciaFallas, getEquiposMasIntervenidos, getTiposMantenimiento, getTecnicosActivos)
- lib/validations/contratistas.ts: createContratistaSchema, updateContratistaSchema
- Supabase joins (equipos(nombre), perfiles(nombre)) need cast through unknown for TS compliance
- Soft delete pattern: contratistas uses estado='inactivo' not actual DELETE
- JS aggregation OK for now; SQL views planned for T8
- Build: PASS

## [T13 Complete] Envios Server Actions
- lib/supabase/storage.ts: upload/download/delete utilities
- app/(dashboard)/formularios/envios-actions.ts: 5 actions
- submitFormulario: validates required fields, creates envio + actividad
- Build: PASS

## [T17 Complete] Login + Auth
- Login page: uses supabase.auth.signInWithPassword via dynamic import
- auth/actions.ts: signOut() server action at app/(dashboard)/auth/actions.ts
- nav-user.tsx: wired to signOut via onClick on logout DropdownMenuItem
- Added isLoading state + disabled button + loading text for UX
- Visual appearance unchanged (same Card/Input/Button structure)
- Build: PASS

## [T20 Complete] Equipo Detail Page
- All 5 tabs wired to real Supabase data
- Data loaded in parallel with Promise.all
- Build: PASS

## [T23+T24 Complete] Constructor + Llenar Pages
- constructor: CREATE/EDIT modes, added metadata fields, wired to actions
- llenar: dynamic field rendering, required validation, wired to submitFormulario
- Build: PASS
