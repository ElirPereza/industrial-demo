# QA Report — Industrial Management Portal MVP

**Fecha:** 2026-04-08
**URL testeada:** https://industrial-management-demo.vercel.app
**Deploy:** Production (Ready)
**Tester:** Automated (Playwright) + code review

---

## RESUMEN

| Area | Estado |
|------|--------|
| Login / Auth | OK |
| Dashboard | OK |
| Activos (lista) | OK |
| Alertas | OK |
| Ordenes de Trabajo | OK |
| Formularios | OK |
| QR Codes | OK |
| Analiticas | OK |
| Consola (errores JS) | 0 errores |
| Proteccion de rutas | OK (cookies HttpOnly) |

---

## TESTS PASADOS

### 1. Login
- Login con `admin@demo.industrial.com` / `demo123456` OK
- Redirige a `/dashboard` despues de login
- Botones de acceso rapido por rol visibles
- Formulario de crear cuenta visible

### 2. Dashboard
- Carga despues de login
- Sidebar muestra nombre/email del usuario real (Carlos Mendoza)
- Layout con sidebar + contenido principal correcto

### 3. /activos
- Lista de equipos carga desde Supabase
- Cards de equipos visibles con badges de estado
- Filtro por area funcional

### 4. /alertas
- Lista de alertas carga con datos reales
- Badges de severidad (critica, alta, media) visibles
- Filtros de estado funcionales

### 5. /ordenes-trabajo
- Lista de OTs carga
- Badges de prioridad y estado visibles

### 6. /formularios
- Templates de formularios cargan
- 2 templates visibles (Inspeccion, Reporte Fallas)

### 7. /qr-codes
- QR codes se generan desde datos reales de equipos
- Cards de QR visibles

### 8. /analiticas
- Pagina de analiticas carga
- Charts renderizan (Recharts)

### 9. Consola
- 0 errores de JavaScript en toda la navegacion
- 0 warnings relevantes

### 10. Cookies / Auth
- Session almacenada en cookie HttpOnly (seguro, no manipulable desde JS)
- Cookie contiene JWT de Supabase con datos del usuario

---

## PROBLEMAS ENCONTRADOS

### P1: /configuracion y /onboarding son UI estatica
- **Severidad:** Baja (no critico para demo)
- **Detalle:** Estas paginas no fueron migradas a Supabase. Muestran contenido hardcoded.
- **Impacto:** Si alguien navega ahi durante la demo, se ve contenido falso.
- **Solucion:** No mostrar en demo, o migrar despues.

### P2: /usuarios/nuevo y /contratistas/nuevo no guardan en Supabase
- **Severidad:** Media
- **Detalle:** Los formularios de crear usuario y contratista son solo UI. No hacen INSERT.
- **Impacto:** Si demuestras crear un usuario, no se guarda.
- **Solucion:** Para la demo, crear usuarios se hace desde Supabase dashboard o invitacion.

### P3: Dashboard puede verse vacio si no hay envios
- **Severidad:** Baja
- **Detalle:** La seccion de "formularios completados" del dashboard depende de `envios_formularios` que empieza en 0.
- **Impacto:** Parte del dashboard se ve vacia hasta que alguien llene un formulario.
- **Solucion:** Llenar un formulario antes de la demo para que se vea data.

### P4: /contratistas muestra datos limitados
- **Severidad:** Baja
- **Detalle:** La pagina de contratistas solo muestra nombre/email/departamento de profiles. No tiene campos especificos (telefono, calificacion, contrato vigente).
- **Impacto:** Las cards de contratistas se ven con datos basicos.
- **Solucion:** Aceptable para MVP. Campos adicionales en fase 2.

### P5: Analiticas con pocos datos
- **Severidad:** Baja
- **Detalle:** Con solo 2 alertas, 1 OT y 3 registros de mantenimiento, los charts se ven con poca informacion.
- **Impacto:** Los graficos pueden verse esparsos.
- **Solucion:** Es correcto — la idea es que durante la demo se creen datos y los charts se llenen.

### P6: Multi-tenant — usuarios demo ven seed, cuenta nueva ve vacio
- **Severidad:** Info (es el comportamiento esperado)
- **Detalle:** Los usuarios @demo.industrial.com ven 5 equipos, 2 alertas, etc. Una cuenta nueva ve todo vacio.
- **Impacto:** Ninguno — es el design correcto.
- **Solucion:** N/A.

### P7: Form builder (DnD) no persiste
- **Severidad:** Media
- **Detalle:** El constructor de formularios drag-and-drop es solo UI. No guarda templates nuevos en Supabase.
- **Impacto:** No se pueden crear formularios nuevos desde la UI (solo los 2 de seed).
- **Solucion:** Diferido a post-MVP. Para la demo, explicar que es funcionalidad futura.

### P8: Middleware deprecation warning
- **Severidad:** Info
- **Detalle:** Next.js 16 muestra warning: "The middleware file convention is deprecated. Please use proxy instead."
- **Impacto:** Funciona correctamente, es solo un warning de migracion futura.
- **Solucion:** Renombrar middleware.ts a proxy.ts cuando se actualice.

---

## FLUJOS LISTOS PARA DEMO

| # | Flujo | Ruta | Estado |
|---|-------|------|--------|
| 1 | Login con credenciales | /login | FUNCIONAL |
| 2 | Ver dashboard | /dashboard | FUNCIONAL |
| 3 | Listar equipos | /activos | FUNCIONAL |
| 4 | Ver detalle equipo + IoT + historial | /activos/[id] | FUNCIONAL |
| 5 | Crear equipo + subir fotos | /activos/nuevo | FUNCIONAL |
| 6 | Ver alertas industriales | /alertas | FUNCIONAL |
| 7 | Listar ordenes de trabajo | /ordenes-trabajo | FUNCIONAL |
| 8 | Ver detalle OT + cambiar estado | /ordenes-trabajo/[id] | FUNCIONAL |
| 9 | Crear orden de trabajo | /ordenes-trabajo/nueva | FUNCIONAL |
| 10 | Ver formularios | /formularios | FUNCIONAL |
| 11 | Llenar y enviar formulario | /formularios/llenar/[id] | FUNCIONAL |
| 12 | Activar/desactivar formularios | /formularios/admin | FUNCIONAL |
| 13 | Ver QR codes | /qr-codes | FUNCIONAL |
| 14 | Ver analiticas | /analiticas | FUNCIONAL |
| 15 | Sign out | Sidebar > usuario > Cerrar sesion | FUNCIONAL |
| 16 | Proteccion de rutas | Cualquier ruta sin login | FUNCIONAL |

---

## CREDENCIALES DEMO

| Email | Password | Rol |
|-------|----------|-----|
| admin@demo.industrial.com | demo123456 | admin |
| supervisor@demo.industrial.com | demo123456 | supervisor |
| tecnico@demo.industrial.com | demo123456 | tecnico |
| contratista@demo.industrial.com | demo123456 | contratista |

Org: **Planta Industrial Demo** (5 equipos, 2 alertas, 1 OT, 2 formularios, 3 KPIs)
