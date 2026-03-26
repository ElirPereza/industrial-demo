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
