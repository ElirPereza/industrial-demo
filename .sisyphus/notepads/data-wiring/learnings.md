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
