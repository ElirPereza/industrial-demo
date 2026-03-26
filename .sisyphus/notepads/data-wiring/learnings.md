## [T18+T21+T22 Complete] Dashboard + Formularios Pages
- dashboard/page.tsx: real KPIs via getDashboardKPIs(), critical equipos via getEquipos(), recent activity via new getRecentActivity()
- formularios/page.tsx: real envios via getEnvios(filters) with filter tabs (todos/completados/pendientes), date-fns formatting
- formularios/admin/page.tsx: real templates via getFormularios(), toggle via toggleFormularioActivo(), delete via deleteFormulario(), edit navigates to constructor
- Added getRecentActivity() to analiticas/actions.ts for dashboard recent maintenance records
- Expanded envios-actions.ts select to include formulario tipo/descripcion and equipo nombre
- DB uses underscores (fuera_servicio, en_progreso, tipo_equipo) not hyphens (fuera-servicio, en-progreso, tipo-equipo)
- All pages use useEffect+useState pattern with loading states
- toast from "sonner" for mutation feedback in admin page
- Build: PASS

## [T25+T26+T27+T28 Complete] QR, Contratistas, Analytics, Config Pages
- qr-codes: real equipos via getEquipos() + formularios via getFormularios(), QR URLs use window.location.origin, client-side filtering
- contratistas: real CRUD with getContratistas(filters) server-side + deleteContratista() soft delete, calificacion avg computed client-side
- contratistas/nuevo: wired to createContratista(formData) with FormData, maps especialidad value to label before sending
- analiticas: real chart data from all 6 analytics actions (getDashboardKPIs, getFormulariosPorMes, getTendenciaFallas, getEquiposMasIntervenidos, getTiposMantenimiento, getTecnicosActivos)
- configuracion: real user profile via getCurrentUser(), save via updatePerfil(id, data), email field disabled (read-only from auth)
- usuarios: real user list via getUsuarios(), role filters + search client-side
- Fixed pre-existing build error: formularios/constructor needed `export const dynamic = "force-dynamic"` for useSearchParams during prerender
- DB field names: trabajos_completados (not trabajosCompletados), contrato_vigente (not contratoVigente), ultimo_mantenimiento (not ultimoMantenimiento)
- Build: PASS

## [T30 Complete] Realtime Dashboard
- hooks/use-realtime-kpis.ts: subscribes to envios_formularios (INSERT) + registros_mantenimiento (*)
- dashboard/page.tsx: wired to auto-refresh KPIs via useRealtimeKPIs(loadData)
- loadData extracted to useCallback for stable reference
- Cleanup on unmount: YES (removeChannel on both channels)
- Realtime ONLY on dashboard — no other pages affected
- Build: PASS

## [T29 Complete] Loading/Error/Empty States
- Created: (dashboard)/loading.tsx — shared skeleton (title + 4 stat cards + content area)
- Created: (dashboard)/error.tsx — "use client" error boundary with retry button, Spanish copy
- Created: (dashboard)/equipos/loading.tsx — header + 6-card grid skeleton
- Created: (dashboard)/formularios/loading.tsx — title + filter pills + 5-row list skeleton
- Empty states: equipos already had one, added to formularios (empty table row) and contratistas (centered message + clear filters)
- All new files use Skeleton from @/components/ui/skeleton, tabs/double quotes/no semicolons
- Build: PASS

## [T31+T32 Complete] Vitest Tests
- vitest.config.ts: configured with @/* alias, node environment, globals true
- Test files: 4 files, 24 tests total
- __tests__/validations/equipos.test.ts: 10 tests (create + update schema, tipos, estados, defaults, maintenance dates)
- __tests__/validations/formularios.test.ts: 7 tests (create schema, campos validation, all field types, defaults)
- __tests__/validations/contratistas.test.ts: 4 tests (create schema, email validation, required fields, nullable optionals)
- __tests__/actions/equipos.test.ts: 3 tests (validation layer: empty nombre/ubicacion messages, all estados)
- Zod 4 safeParse API: same as v3 — { success, data/error }, error.issues[0].message works
- __dirname works in vitest.config.ts (vitest processes via esbuild)
- pnpm test: PASS (24/24)
