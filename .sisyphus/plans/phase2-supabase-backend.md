# Phase 2: Supabase Backend — Industrial Portal

## TL;DR

> **Quick Summary**: Add a complete Supabase backend (PostgreSQL, Auth, Storage, Realtime) to the existing 15-page Industrial Portal, transforming it from a UI-only demo into a fully functional application with 3-role RBAC, dynamic form management, digital signatures, QR codes, and real-time analytics.
>
> **Deliverables**:
> - 11 database tables with RLS policies per role
> - Supabase Auth (email/password) with Admin/Supervisor/Técnico roles
> - Server Actions for all CRUD operations across 7 modules
> - 15 pages refactored from mock data to live Supabase data
> - File storage (signatures, photos, documents) via Supabase Storage
> - Real-time dashboard via Supabase Realtime
> - Vitest test suite for Server Actions and RLS policies
>
> **Estimated Effort**: XL
> **Parallel Execution**: YES — 8 waves
> **Critical Path**: T1 → T2 → T7/T8 → T11-T16 → T17-T22 → T29-T32 → FINAL

---

## Context

### Original Request
"Necesito que hagamos real el proyecto" — Make the existing Industrial Portal functional with Supabase as the database backend. All 7 modules (RF-01 to RF-19), 3 user roles, tests after implementation.

### Interview Summary
**Key Discussions**:
- **Database**: Supabase (PostgreSQL) — confirmed
- **Roles**: Admin + Supervisor + Técnico (3 levels) — confirmed
- **Scope**: All 7 modules complete — confirmed
- **Testing**: Tests after implementation, not TDD — confirmed
- **Deployment**: Not decided, excluded from plan — confirmed

**Research Findings**:
- 11 database tables identified from mock data analysis (`lib/mock-data.ts`, 1011 lines)
- 8 field types in form builder (texto-corto, texto-largo, numerico, fecha, seleccion-unica, seleccion-multiple, firma, foto)
- Polymorphic form-to-equipment association (tipo + valor pattern)
- ALL 15 pages are `"use client"` — will keep as client components with Server Actions
- SidebarProvider is duplicated in every page — must extract to shared layout
- Next.js 16 uses `proxy.ts` (NOT `middleware.ts`) for middleware
- `cookies()` is async in Next.js 16 — must use `await cookies()`
- Mock data role names (`admin|tecnico|operador`) differ from user's request (`Admin|Supervisor|Técnico`)

### Metis Review
**Identified Gaps** (all addressed):
- Role mismatch resolved: Use `admin|supervisor|tecnico` in DB, map `operador` → `supervisor`
- proxy.ts naming enforced (Next.js 16 breaking change)
- SidebarProvider extraction to layout planned as foundation task
- Server Actions must return errors as data (never throw)
- RLS must be enabled on every table immediately upon creation
- Form immutability (RF-14) needs DB-level trigger enforcement
- Date serialization: mock `Date` objects → Supabase ISO strings
- Storage: signatures stored as PNG files (not base64 DataURL in DB)
- Zod must be added as dependency for Server Action validation
- Toast component needed to replace all `alert()` calls

---

## Work Objectives

### Core Objective
Transform the Industrial Portal from a static UI demo into a fully functional application by integrating Supabase (database, auth, storage, realtime) across all 7 modules and 15 pages while preserving the existing visual design.

### Concrete Deliverables
- 11 Supabase tables with complete RLS policies
- Auth flow (login/logout/session refresh) with 3 roles
- Server Actions for all CRUD operations (equipos, formularios, envios, contratistas, registros, usuarios)
- 15 pages fetching/mutating real data instead of mock data
- 4 storage buckets (equipment-images, equipment-documents, form-signatures, form-photos)
- Real-time dashboard KPIs via Supabase Realtime
- Vitest test suite covering Server Actions and RLS policies
- Seed data migration from existing mock data

### Definition of Done
- [ ] `pnpm build` passes with zero errors
- [ ] `pnpm lint` passes with zero errors
- [ ] All 15 pages render with real Supabase data
- [ ] Login → navigate → CRUD → logout flow works end-to-end
- [ ] Form submission with signature + photo persists to DB + Storage
- [ ] RLS blocks cross-role data access (verified by tests)
- [ ] Dashboard updates in real-time when new data is submitted
- [ ] All tests pass (`pnpm test`)

### Must Have
- Supabase Auth with email/password
- 3 roles: admin (full access), supervisor (analytics + management), tecnico (fill forms + view equipment)
- RLS on every table — no unprotected tables
- Form builder persists form templates with fields to database
- Form submission stores responses as JSONB with version tracking
- Digital signatures saved as PNG to Supabase Storage
- Equipment CRUD with documents and image gallery
- QR codes generated from real equipment/form data
- Analytics dashboard with real calculated KPIs (SQL views/functions)
- Seed data from existing mock data for demo purposes

### Must NOT Have (Guardrails)
- **G1**: NO OAuth, magic links, MFA, or social login — email/password only
- **G2**: NO email/push/SMS notifications — use shadcn toast for in-app feedback only
- **G3**: NO Realtime on any page except dashboard — all others use fetch + revalidation
- **G4**: NO full-text search — use simple `ILIKE` filtering (matches current UI)
- **G5**: NO new UI pages — refactor existing 15 pages only, no additions
- **G6**: NO visual changes — preserve Phase 1 UI appearance exactly
- **G7**: NO Prisma/Drizzle/ORM — Supabase JS client directly
- **G8**: NO i18n — everything stays Spanish as-is
- **G9**: NO `SUPABASE_SERVICE_ROLE_KEY` in any client-accessible code or `NEXT_PUBLIC_*` vars
- **G10**: NO `revalidatePath()` — always use `revalidateTag()` for cache invalidation
- **G11**: NO form builder enhancements (conditional logic, field dependencies) — persist what exists
- **G12**: NO image optimization pipeline — store as-is, use Next.js Image for display
- **G13**: NO `middleware.ts` — Next.js 16 uses `proxy.ts`
- **G14**: NO thrown errors from Server Actions — always return `ActionResult<T>` objects
- **G15**: NO pagination in this phase — note as follow-up

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (will be set up in Wave 7)
- **Automated tests**: YES (tests after implementation)
- **Framework**: Vitest
- **Strategy**: Tests written per-wave after implementation, dedicated testing wave at end

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Database/RLS**: Use `mcp_supabase_execute_sql` — run queries, assert results
- **Server Actions**: Use Bash (node/bun REPL) — import, call, assert returns
- **Frontend Pages**: Use Playwright — navigate, interact, assert DOM, screenshot
- **Auth Flows**: Use Playwright — login, verify session, access protected pages
- **Storage**: Use `mcp_supabase_execute_sql` + curl — upload, verify bucket contents
- **Build**: Use Bash — `pnpm build && pnpm lint` after every task

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — bootstrap):
├── Task 1: Install deps + env config + verify Supabase [quick]
  
Wave 2 (After Wave 1 — infrastructure, MAX PARALLEL):
├── Task 2: Database schema migration (all 11 tables) [deep]
├── Task 3: Supabase client utilities (server + browser) [quick]
├── Task 4: Auth proxy (proxy.ts) + route protection [unspecified-high]
├── Task 5: Dashboard layout refactor (SidebarProvider → layout) [quick]
├── Task 6: Shared infrastructure (ActionResult, Toast, Zod) [quick]

Wave 3 (After Wave 2 — security + types + storage):
├── Task 7: RLS policies for all tables (depends: T2) [deep]
├── Task 8: TypeScript types + domain Zod schemas (depends: T2) [unspecified-high]
├── Task 9: Storage buckets + upload utilities (depends: T2) [unspecified-high]
├── Task 10: Seed data migration (depends: T2, T7) [unspecified-high]

Wave 4 (After Wave 3 — Server Actions, MAX PARALLEL):
├── Task 11: Server Actions: equipos CRUD (depends: T3, T8) [unspecified-high]
├── Task 12: Server Actions: formularios templates + fields (depends: T3, T8) [deep]
├── Task 13: Server Actions: envios + respuestas (depends: T3, T8, T9) [deep]
├── Task 14: Server Actions: registros_mantenimiento + actividades (depends: T3, T8) [unspecified-high]
├── Task 15: Server Actions: contratistas CRUD (depends: T3, T8) [unspecified-high]
├── Task 16: Server Actions: usuarios + analytics queries (depends: T3, T8) [unspecified-high]

Wave 5 (After Wave 4 — Pages Part 1, MAX PARALLEL):
├── Task 17: Login page → Supabase Auth (depends: T3, T4) [unspecified-high]
├── Task 18: Dashboard → real KPIs + activity (depends: T5, T16) [visual-engineering]
├── Task 19: Equipos list + nuevo pages (depends: T5, T11) [visual-engineering]
├── Task 20: Equipo detail page (5 tabs) (depends: T11, T13, T9) [deep]
├── Task 21: Formularios list page (depends: T5, T13) [visual-engineering]
├── Task 22: Formularios admin page (depends: T5, T12) [visual-engineering]

Wave 6 (After Wave 5 — Pages Part 2, MAX PARALLEL):
├── Task 23: Constructor → real form builder (depends: T12) [deep]
├── Task 24: Llenar → real submission + signature + photo (depends: T12, T13, T9) [deep]
├── Task 25: QR codes page → real data (depends: T11, T12) [visual-engineering]
├── Task 26: Contratistas (list + nuevo) (depends: T5, T15) [visual-engineering]
├── Task 27: Analytics → real calculated KPIs (depends: T16) [visual-engineering]
├── Task 28: Configuración + Usuarios pages (depends: T16, T17) [visual-engineering]

Wave 7 (After Wave 6 — Polish + Realtime + Testing):
├── Task 29: Loading/error/empty states across all pages [visual-engineering]
├── Task 30: Realtime subscriptions (dashboard only) [unspecified-high]
├── Task 31: Test infrastructure (Vitest) + Auth/RLS tests [unspecified-high]
├── Task 32: Server Actions tests + Integration tests [unspecified-high]

Wave 8 (After Wave 7 — Cleanup):
├── Task 33: Remove mock-data.ts + lucide-react + final build verification [quick]

Wave FINAL (After ALL tasks — 4 parallel reviews, then user okay):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
├── Task F4: Scope fidelity check (deep)
→ Present results → Get explicit user okay

Critical Path: T1 → T2 → T7/T8 → T11-T16 → T17-T22 → T23-T28 → T29-T32 → T33 → FINAL
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 6 (Waves 2, 4, 5, 6)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| T1 | — | T2-T6 | 1 |
| T2 | T1 | T7, T8, T9, T10 | 2 |
| T3 | T1 | T11-T16 | 2 |
| T4 | T1 | T17 | 2 |
| T5 | T1 | T18-T22, T26 | 2 |
| T6 | T1 | T11-T16 | 2 |
| T7 | T2 | T10 | 3 |
| T8 | T2 | T11-T16 | 3 |
| T9 | T2 | T13, T20, T24 | 3 |
| T10 | T2, T7 | T17-T28 | 3 |
| T11 | T3, T8 | T19, T20, T25 | 4 |
| T12 | T3, T8 | T21-T25 | 4 |
| T13 | T3, T8, T9 | T20, T21, T24 | 4 |
| T14 | T3, T8 | T20 | 4 |
| T15 | T3, T8 | T26 | 4 |
| T16 | T3, T8 | T18, T27, T28 | 4 |
| T17 | T3, T4 | T28 | 5 |
| T18 | T5, T16 | T30 | 5 |
| T19 | T5, T11 | — | 5 |
| T20 | T11, T13, T9 | — | 5 |
| T21 | T5, T13 | — | 5 |
| T22 | T5, T12 | — | 5 |
| T23 | T12 | — | 6 |
| T24 | T12, T13, T9 | — | 6 |
| T25 | T11, T12 | — | 6 |
| T26 | T5, T15 | — | 6 |
| T27 | T16 | — | 6 |
| T28 | T16, T17 | — | 6 |
| T29 | T17-T28 | — | 7 |
| T30 | T18 | — | 7 |
| T31 | T17-T28 | — | 7 |
| T32 | T11-T16 | — | 7 |
| T33 | T29-T32 | FINAL | 8 |

### Agent Dispatch Summary

| Wave | Tasks | Categories |
|------|-------|------------|
| 1 | 1 | T1 → `quick` |
| 2 | 5 | T2 → `deep`, T3 → `quick`, T4 → `unspecified-high`, T5 → `quick`, T6 → `quick` |
| 3 | 4 | T7 → `deep`, T8 → `unspecified-high`, T9 → `unspecified-high`, T10 → `unspecified-high` |
| 4 | 6 | T11 → `unspecified-high`, T12 → `deep`, T13 → `deep`, T14-T16 → `unspecified-high` |
| 5 | 6 | T17 → `unspecified-high`, T18-T19 → `visual-engineering`, T20 → `deep`, T21-T22 → `visual-engineering` |
| 6 | 6 | T23-T24 → `deep`, T25-T28 → `visual-engineering` |
| 7 | 4 | T29 → `visual-engineering`, T30-T32 → `unspecified-high` |
| 8 | 1 | T33 → `quick` |
| FINAL | 4 | F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep` |

---

## TODOs

### Wave 1 — Bootstrap

- [x] 1. Install dependencies + environment config + verify Supabase

  **What to do**:
  - Install packages: `@supabase/supabase-js`, `@supabase/ssr`, `zod`
  - Remove `lucide-react` from dependencies (project uses Phosphor Icons)
  - Create `.env.local.example` with required vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - Create `.env.local` with actual Supabase project credentials
  - Verify Supabase project is active (unpause if needed via dashboard)
  - Run `mcp_supabase_execute_sql` with `SELECT 1` to confirm connectivity
  - Run `mcp_supabase_get_advisors(type="security")` for baseline security status
  - Add `.env.local` to `.gitignore` if not already present

  **Must NOT do**:
  - Do NOT install Prisma, Drizzle, or any ORM
  - Do NOT install NextAuth — we use Supabase Auth
  - Do NOT commit `.env.local` (only `.env.local.example`)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (must complete first)
  - **Parallel Group**: Wave 1 (solo)
  - **Blocks**: T2, T3, T4, T5, T6
  - **Blocked By**: None

  **References**:
  - `package.json:13-44` — Current dependencies list (note `lucide-react` on line 23 to remove)
  - `.gitignore` — Verify `.env.local` is listed
  - Supabase project URL: Check via `mcp_supabase_get_project_url`
  - Supabase anon key: Check via `mcp_supabase_get_publishable_keys`

  **Acceptance Criteria**:
  - [ ] `@supabase/supabase-js`, `@supabase/ssr`, `zod` in package.json dependencies
  - [ ] `lucide-react` NOT in package.json
  - [ ] `.env.local` exists with valid Supabase credentials
  - [ ] `.env.local.example` exists (template without real values)
  - [ ] `mcp_supabase_execute_sql` with `SELECT 1` returns successfully

  **QA Scenarios**:
  ```
  Scenario: Supabase connectivity verified
    Tool: mcp_supabase_execute_sql
    Preconditions: .env.local configured with project credentials
    Steps:
      1. Run mcp_supabase_execute_sql with query "SELECT 1 as test"
      2. Verify response contains { test: 1 }
      3. Run mcp_supabase_get_advisors(type="security") — should return results
    Expected Result: Query returns successfully, advisors endpoint responds
    Failure Indicators: Timeout, connection refused, 401 unauthorized
    Evidence: .sisyphus/evidence/task-1-supabase-connectivity.md

  Scenario: Dependencies correctly installed
    Tool: Bash
    Preconditions: pnpm install completed
    Steps:
      1. Run pnpm list @supabase/supabase-js @supabase/ssr zod
      2. Verify all 3 packages listed with versions
      3. Run pnpm list lucide-react — should NOT be found
      4. Run pnpm build — should compile without errors
    Expected Result: 3 packages installed, lucide-react removed, build passes
    Failure Indicators: Missing packages, lucide-react still present, build fails
    Evidence: .sisyphus/evidence/task-1-deps-verified.md
  ```

  **Commit**: YES
  - Message: `chore(infra): install supabase deps and configure env`
  - Files: `package.json`, `pnpm-lock.yaml`, `.env.local.example`, `.gitignore`
  - Pre-commit: `pnpm build`

---

### Wave 2 — Infrastructure (parallel after Wave 1)

- [ ] 2. Database schema migration — all 11 tables with enums, indexes, triggers

  **What to do**:
  - Create PostgreSQL enums: `app_role` (admin, supervisor, tecnico), `estado_equipo` (operativo, mantenimiento, fuera_servicio), `tipo_equipo` (maquinaria_pesada, linea_produccion, electricos, hvac), `tipo_formulario` (inspeccion, reporte_fallas, preventivo, correctivo), `tipo_campo` (texto_corto, texto_largo, numerico, fecha, seleccion_unica, seleccion_multiple, firma, foto), `estado_envio` (completado, pendiente, rechazado), `estado_mantenimiento` (completado, en_progreso, pendiente), `tipo_asociacion` (equipo, tipo_equipo, area, general), `frecuencia_form` (diario, semanal, mensual, trimestral, eventual), `tipo_actividad` (mantenimiento, inspeccion, falla, documento, modificacion), `tipo_documento` (pdf, doc, img)
  - Create tables (ALL with `id uuid primary key default gen_random_uuid()`):
    1. `perfiles` — user_id (FK auth.users), nombre, email, rol (app_role), departamento, created_at, updated_at
    2. `equipos` — nombre, tipo (tipo_equipo), ubicacion, estado (estado_equipo), ultimo_mantenimiento (timestamptz), proximo_mantenimiento (timestamptz), created_at, updated_at
    3. `formularios_template` — nombre, descripcion, tipo (tipo_formulario), version (int default 1), activo (bool default true), frecuencia (frecuencia_form), asociacion_tipo (tipo_asociacion), asociacion_valor (text nullable), created_by (FK auth.users), created_at, updated_at
    4. `campos_formulario` — formulario_id (FK formularios_template ON DELETE CASCADE), tipo (tipo_campo), label (text), placeholder (text), requerido (bool default false), opciones (jsonb nullable), orden (int), created_at
    5. `envios_formularios` — formulario_id (FK), equipo_id (FK), usuario_id (FK auth.users), version_formulario (int), respuestas (jsonb), estado (estado_envio default 'completado'), firmado (bool default false), created_at
    6. `registros_mantenimiento` — equipo_id (FK), tipo (tipo_formulario), descripcion, tecnico_id (FK auth.users), fecha_inicio (timestamptz), fecha_fin (timestamptz nullable), horas_empleadas (numeric(6,2)), costo (numeric(10,2)), estado (estado_mantenimiento), created_at
    7. `documentos` — equipo_id (FK), nombre, tipo (tipo_documento), tamano (text), url (text), created_at
    8. `imagenes` — equipo_id (FK), url (text), titulo, created_at
    9. `contratistas` — nombre, contacto, email, telefono, especialidad, estado (text default 'activo'), calificacion (numeric(2,1) default 0), trabajos_completados (int default 0), contrato_vigente (date), nit (text), direccion (text), created_at, updated_at
    10. `actividades_equipo` — equipo_id (FK), tipo (tipo_actividad), titulo, descripcion, usuario_id (FK auth.users), detalles (jsonb nullable), created_at
    11. `formularios_version` — formulario_id (FK), schema_snapshot (jsonb), version (int), created_by (FK auth.users), created_at, UNIQUE(formulario_id, version)
  - Add indexes: `idx_envios_formulario_id`, `idx_envios_equipo_id`, `idx_envios_usuario_id`, `idx_campos_formulario_id`, `idx_registros_equipo_id`, `idx_actividades_equipo_id`, `idx_documentos_equipo_id`, `idx_imagenes_equipo_id`
  - Add trigger: `prevent_signed_submission_update` — blocks UPDATE on `envios_formularios` where `firmado = true` (RF-14 immutability)
  - Add trigger: `update_updated_at` — auto-update `updated_at` on perfiles, equipos, formularios_template, contratistas
  - Add `user_role()` function: extracts role from `perfiles` table for RLS policies
  - Use `mcp_supabase_apply_migration` for all DDL operations

  **Must NOT do**:
  - Do NOT use English column names — keep Spanish to match existing types
  - Do NOT use JSONB for structured data — only for `opciones`, `respuestas`, `detalles`, `schema_snapshot`
  - Do NOT add any application code — schema only

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T3, T4, T5, T6)
  - **Parallel Group**: Wave 2
  - **Blocks**: T7, T8, T9, T10
  - **Blocked By**: T1

  **References**:
  - `lib/mock-data.ts:8-107` — All TypeScript interfaces defining entity shapes
  - `lib/mock-data.ts:109-1011` — Mock data instances showing field values and relationships
  - `docs/project.md:29-36` — RF-02 submission storage fields
  - `docs/project.md:67-78` — RF-04 field types for form builder
  - `docs/project.md:160-172` — RF-13 metadata capture requirements
  - `docs/project.md:174-175` — RF-14 immutability requirement

  **Acceptance Criteria**:
  - [ ] All 11 tables created via `mcp_supabase_apply_migration`
  - [ ] All enums created and used in table columns
  - [ ] All foreign keys with proper CASCADE rules
  - [ ] All indexes created on FK columns
  - [ ] `prevent_signed_submission_update` trigger blocks signed record updates
  - [ ] `user_role()` function returns current user's role
  - [ ] `mcp_supabase_list_tables(schemas=["public"], verbose=true)` shows all tables with columns

  **QA Scenarios**:
  ```
  Scenario: All tables exist with correct structure
    Tool: mcp_supabase_list_tables
    Steps:
      1. Run mcp_supabase_list_tables(schemas=["public"], verbose=true)
      2. Verify 11 tables present: perfiles, equipos, formularios_template, campos_formulario, envios_formularios, registros_mantenimiento, documentos, imagenes, contratistas, actividades_equipo, formularios_version
      3. Verify each table has expected columns with correct types
    Expected Result: All 11 tables with correct schema
    Evidence: .sisyphus/evidence/task-2-tables-verified.md

  Scenario: Immutability trigger prevents signed submission update
    Tool: mcp_supabase_execute_sql
    Steps:
      1. Insert a test envio with firmado=true
      2. Attempt UPDATE on that record
      3. Verify UPDATE is rejected with error message
      4. Clean up test data
    Expected Result: UPDATE blocked with "Signed submissions cannot be modified" error
    Failure Indicators: UPDATE succeeds, no error raised
    Evidence: .sisyphus/evidence/task-2-immutability-trigger.md

  Scenario: user_role() function works
    Tool: mcp_supabase_execute_sql
    Steps:
      1. Query: SELECT user_role() — should return null when no auth context
      2. Verify function exists and is callable
    Expected Result: Function exists and returns expected type
    Evidence: .sisyphus/evidence/task-2-user-role-function.md
  ```

  **Commit**: YES
  - Message: `feat(db): create complete database schema with 11 tables and triggers`
  - Files: (migration files created via mcp_supabase_apply_migration)
  - Pre-commit: `mcp_supabase_list_tables` verification

- [x] 3. Supabase client utilities — server and browser factories

  **What to do**:
  - Create `lib/supabase/server.ts` — async function `createClient()` using `createServerClient` from `@supabase/ssr`. Must use `await cookies()` (Next.js 16 async cookies). Returns typed `SupabaseClient<Database>`.
  - Create `lib/supabase/client.ts` — function `createClient()` using `createBrowserClient` from `@supabase/ssr`. Returns typed `SupabaseClient<Database>`.
  - Create placeholder `types/supabase.ts` — export `Database` type (will be populated after T8 generates real types). For now, use `type Database = any` as temporary placeholder.
  - Both clients MUST use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars
  - Server client handles cookie get/set with try/catch for middleware compatibility
  - Export a `getUser()` helper in server.ts that calls `supabase.auth.getUser()` and returns typed user or null

  **Must NOT do**:
  - Do NOT use `SUPABASE_SERVICE_ROLE_KEY` in either client
  - Do NOT use sync `cookies()` — must be `await cookies()`
  - Do NOT create a singleton pattern — each call creates a fresh client

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T2, T4, T5, T6)
  - **Parallel Group**: Wave 2
  - **Blocks**: T11-T16
  - **Blocked By**: T1

  **References**:
  - `lib/utils.ts` — Existing utility file pattern (cn helper)
  - `tsconfig.json:21-23` — Path alias `@/*` configuration
  - Librarian research: Supabase SSR setup patterns for Next.js 16 with async cookies

  **Acceptance Criteria**:
  - [ ] `lib/supabase/server.ts` exports async `createClient()` function
  - [ ] `lib/supabase/client.ts` exports `createClient()` function
  - [ ] `types/supabase.ts` exports `Database` type
  - [ ] Server client uses `await cookies()` (not sync)
  - [ ] `pnpm build` passes with new files

  **QA Scenarios**:
  ```
  Scenario: Server client compiles correctly
    Tool: Bash
    Steps:
      1. Run pnpm build
      2. Verify no TypeScript errors in lib/supabase/server.ts
      3. Verify no TypeScript errors in lib/supabase/client.ts
    Expected Result: Build passes, no type errors
    Evidence: .sisyphus/evidence/task-3-build-pass.md

  Scenario: Client files use correct imports
    Tool: Grep
    Steps:
      1. Search lib/supabase/server.ts for "await cookies()" — must exist
      2. Search lib/supabase/server.ts for "createServerClient" — must exist
      3. Search lib/supabase/client.ts for "createBrowserClient" — must exist
      4. Search both files for "SERVICE_ROLE" — must NOT exist
    Expected Result: Correct patterns found, no forbidden patterns
    Evidence: .sisyphus/evidence/task-3-patterns-verified.md
  ```

  **Commit**: YES (groups with T4, T5, T6)
  - Message: `feat(infra): add supabase client utils, proxy, layout, toast`
  - Files: `lib/supabase/server.ts`, `lib/supabase/client.ts`, `types/supabase.ts`
  - Pre-commit: `pnpm build`

- [x] 4. Auth proxy (proxy.ts) + route protection

  **What to do**:
  - Create `proxy.ts` at project root (NOT `middleware.ts` — Next.js 16 convention)
  - Create a Supabase server client in proxy using request/response cookie handlers
  - Call `supabase.auth.getUser()` on every request to refresh session tokens
  - Define protected routes: ALL routes except `/`, `/login` require authentication
  - If unauthenticated user accesses protected route → redirect to `/login`
  - If authenticated user accesses `/login` → redirect to `/dashboard`
  - Set `Cache-Control: private, no-store` for authenticated responses
  - Export `config.matcher` to exclude static assets (`_next/static`, `_next/image`, `favicon.ico`)

  **Must NOT do**:
  - Do NOT name the file `middleware.ts` — Next.js 16 uses `proxy.ts`
  - Do NOT use `getSession()` for authorization — use `getUser()` (verifies JWT)
  - Do NOT add role-based route guards here — handle in individual pages/actions

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T2, T3, T5, T6)
  - **Parallel Group**: Wave 2
  - **Blocks**: T17
  - **Blocked By**: T1

  **References**:
  - Librarian research: Next.js 16 proxy.ts pattern with Supabase session refresh
  - `app/layout.tsx` — Current root layout structure
  - `app/login/page.tsx` — Current login page (will be refactored in T17)

  **Acceptance Criteria**:
  - [ ] `proxy.ts` exists at project root
  - [ ] NO `middleware.ts` file exists
  - [ ] Unauthenticated requests to `/dashboard` redirect to `/login`
  - [ ] Session tokens are refreshed on each request
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: proxy.ts file exists and compiles
    Tool: Bash
    Steps:
      1. Verify proxy.ts exists at project root
      2. Verify middleware.ts does NOT exist
      3. Run pnpm build — should pass
    Expected Result: proxy.ts present, no middleware.ts, build passes
    Evidence: .sisyphus/evidence/task-4-proxy-verified.md

  Scenario: Route protection works
    Tool: Playwright
    Steps:
      1. Navigate to /dashboard without being logged in
      2. Assert redirect to /login page
      3. Verify URL is /login
    Expected Result: Unauthenticated user redirected to /login
    Failure Indicators: Dashboard page loads without auth, no redirect
    Evidence: .sisyphus/evidence/task-4-route-protection.png
  ```

  **Commit**: YES (groups with T3, T5, T6)
  - Message: `feat(infra): add supabase client utils, proxy, layout, toast`
  - Files: `proxy.ts`
  - Pre-commit: `pnpm build`

- [x] 5. Dashboard layout refactor — extract SidebarProvider to shared layout

  **What to do**:
  - Create route group `app/(dashboard)/` with `layout.tsx`
  - Move `SidebarProvider` + `AppSidebar` wrapping from individual pages into this layout
  - Move ALL pages that use the sidebar into `app/(dashboard)/`: dashboard, formularios (all), equipos (all), qr-codes, analiticas, usuarios, contratistas, configuracion
  - Keep `/` (landing) and `/login` outside the route group (no sidebar)
  - The layout must wrap children with: `<SidebarProvider>` → `<AppSidebar>` → `<SidebarInset>` → `{children}`
  - Remove SidebarProvider/AppSidebar wrapping from each individual page that was moved
  - Verify all pages still render correctly after move

  **Must NOT do**:
  - Do NOT change any page content or styling — layout only
  - Do NOT modify the AppSidebar component itself
  - Do NOT add auth checks here (that's proxy.ts job)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T2, T3, T4, T6)
  - **Parallel Group**: Wave 2
  - **Blocks**: T18, T19, T21, T22, T26
  - **Blocked By**: T1

  **References**:
  - `app/dashboard/page.tsx:58-62` — Current SidebarProvider wrapping pattern
  - `components/app-sidebar.tsx` — AppSidebar component used in every page
  - `app/layout.tsx` — Root layout (does NOT contain sidebar — it's per-page)

  **Acceptance Criteria**:
  - [ ] `app/(dashboard)/layout.tsx` exists with SidebarProvider + AppSidebar
  - [ ] All sidebar-using pages moved to `app/(dashboard)/` directory
  - [ ] No individual page contains SidebarProvider wrapping anymore
  - [ ] Landing page `/` renders without sidebar (stays at `app/page.tsx`)
  - [ ] Login page `/login` renders without sidebar (stays at `app/login/page.tsx`)
  - [ ] `pnpm build` passes
  - [ ] All pages render at their original URLs

  **QA Scenarios**:
  ```
  Scenario: Layout correctly wraps dashboard pages
    Tool: Playwright
    Steps:
      1. Navigate to /dashboard
      2. Assert sidebar is visible (data-slot="sidebar" or similar selector)
      3. Navigate to /equipos — sidebar still visible
      4. Navigate to /formularios — sidebar still visible
      5. Navigate to / (landing) — sidebar NOT visible
      6. Navigate to /login — sidebar NOT visible
    Expected Result: Sidebar on dashboard pages, absent on landing/login
    Evidence: .sisyphus/evidence/task-5-layout-verified.png

  Scenario: Build passes after restructure
    Tool: Bash
    Steps:
      1. Run pnpm build
      2. Run pnpm lint
    Expected Result: Zero errors
    Evidence: .sisyphus/evidence/task-5-build-pass.md
  ```

  **Commit**: YES (groups with T3, T4, T6)
  - Message: `feat(infra): add supabase client utils, proxy, layout, toast`
  - Files: `app/(dashboard)/layout.tsx`, all moved page files
  - Pre-commit: `pnpm build`

- [x] 6. Shared infrastructure — ActionResult type, Toast component, Zod base schemas

  **What to do**:
  - Create `lib/types.ts` with shared `ActionResult<T>` type: `{ success: true, data: T } | { success: false, error: string }`. ALL Server Actions will return this type.
  - Install shadcn toast component: Use `Sonner` toast (shadcn's recommended toast). Add `<Toaster />` to root layout.
  - Create `lib/validations/index.ts` with base Zod schemas shared across modules:
    - `uuidSchema` — `z.string().uuid()`
    - `emailSchema` — `z.string().email()`
    - `paginationSchema` — `z.object({ page: z.number().min(1), limit: z.number().min(1).max(100) })`
  - Replace ALL existing `alert()` calls across the codebase with `toast.success()` or `toast.error()` from Sonner
  - Search for all `alert(` calls and replace them

  **Must NOT do**:
  - Do NOT create complex validation schemas here — module-specific schemas go in T8
  - Do NOT add business logic to this task
  - Do NOT change any functionality — just swap alert → toast

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T2, T3, T4, T5)
  - **Parallel Group**: Wave 2
  - **Blocks**: T11-T16
  - **Blocked By**: T1

  **References**:
  - `app/layout.tsx:17-29` — Root layout where `<Toaster />` will be added
  - `app/formularios/llenar/[id]/page.tsx` — Contains `alert()` calls for form submission
  - `app/equipos/nuevo/page.tsx` — Contains `alert()` calls for equipment creation
  - `components.json` — shadcn/ui configuration for component installation

  **Acceptance Criteria**:
  - [ ] `lib/types.ts` exports `ActionResult<T>` type
  - [ ] `lib/validations/index.ts` exports base Zod schemas
  - [ ] Sonner toast component installed and `<Toaster />` in root layout
  - [ ] Zero `alert(` calls remain in the codebase
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: No alert() calls remain
    Tool: Grep
    Steps:
      1. Search entire codebase for "alert(" in .tsx files
      2. Verify zero matches (all replaced with toast)
    Expected Result: Zero alert() calls found
    Failure Indicators: Any remaining alert() calls
    Evidence: .sisyphus/evidence/task-6-no-alerts.md

  Scenario: Toast renders in layout
    Tool: Playwright
    Steps:
      1. Navigate to /dashboard
      2. Check DOM for Sonner/Toaster component presence
    Expected Result: Toaster component present in DOM
    Evidence: .sisyphus/evidence/task-6-toast-present.png
  ```

  **Commit**: YES (groups with T3, T4, T5)
  - Message: `feat(infra): add supabase client utils, proxy, layout, toast`
  - Files: `lib/types.ts`, `lib/validations/index.ts`, `components/ui/sonner.tsx`, `app/layout.tsx`, all files with alert() replaced
  - Pre-commit: `pnpm build`

---

### Wave 3 — Security + Types + Storage (parallel after Wave 2)

- [ ] 7. RLS policies for ALL 11 tables

  **What to do**:
  - Enable RLS on EVERY table: `ALTER TABLE {table} ENABLE ROW LEVEL SECURITY`
  - Create the `user_role()` SQL function that reads role from `perfiles` table for the authenticated user
  - Define policies per table per role:
    - **perfiles**: Users see own profile. Admins see all. Users update own profile only.
    - **equipos**: All authenticated can SELECT. Admin/supervisor can INSERT/UPDATE/DELETE.
    - **formularios_template**: All authenticated can SELECT active. Admin can full CRUD. Supervisor can SELECT all (including inactive).
    - **campos_formulario**: Same as formularios_template (follows parent).
    - **envios_formularios**: Técnicos INSERT own submissions. All roles SELECT (admins all, supervisors all, técnicos own). NO UPDATE on firmado=true records.
    - **registros_mantenimiento**: Técnicos INSERT. Admin/supervisor SELECT all. Técnicos SELECT own.
    - **documentos**: All authenticated can SELECT. Admin can INSERT/DELETE.
    - **imagenes**: All authenticated can SELECT. Admin can INSERT/DELETE.
    - **contratistas**: Admin full CRUD. Supervisor SELECT. Técnico no access.
    - **actividades_equipo**: All authenticated SELECT. System INSERT (via triggers/service role).
    - **formularios_version**: All authenticated SELECT. Admin INSERT (auto-created on form update).
  - Run `mcp_supabase_get_advisors(type="security")` after ALL policies to verify no gaps
  - Use `mcp_supabase_apply_migration` for all policy DDL

  **Must NOT do**:
  - Do NOT leave any table without RLS enabled
  - Do NOT use `SUPABASE_SERVICE_ROLE_KEY` in policies — use `auth.uid()` and `user_role()`
  - Do NOT create overly permissive policies (e.g., `USING (true)` for authenticated)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T8, T9)
  - **Parallel Group**: Wave 3
  - **Blocks**: T10
  - **Blocked By**: T2

  **References**:
  - Task 2 output — All table definitions and column names
  - `docs/project.md:174-175` — RF-14 signed record immutability
  - `docs/project.md:100-123` — RF-07 to RF-09 form admin permissions
  - Librarian research: RLS policy patterns with `user_role()` function

  **Acceptance Criteria**:
  - [ ] All 11 tables have RLS enabled
  - [ ] `mcp_supabase_get_advisors(type="security")` returns no critical warnings
  - [ ] Admin can access all tables
  - [ ] Técnico cannot access contratistas table
  - [ ] Signed submissions cannot be updated even by admin

  **QA Scenarios**:
  ```
  Scenario: RLS enabled on all tables
    Tool: mcp_supabase_execute_sql
    Steps:
      1. Query: SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'
      2. Verify ALL tables show rowsecurity = true
    Expected Result: 11 tables, all with rowsecurity = true
    Evidence: .sisyphus/evidence/task-7-rls-enabled.md

  Scenario: Security advisors pass
    Tool: mcp_supabase_get_advisors
    Steps:
      1. Run mcp_supabase_get_advisors(type="security")
      2. Review results — no critical findings about unprotected tables
    Expected Result: No critical security advisories
    Evidence: .sisyphus/evidence/task-7-security-advisors.md
  ```

  **Commit**: YES
  - Message: `feat(security): add RLS policies for all tables`
  - Pre-commit: `mcp_supabase_get_advisors(type="security")`

- [ ] 8. TypeScript types generation + domain Zod validation schemas

  **What to do**:
  - Run `mcp_supabase_generate_typescript_types` to generate Database type from Supabase schema
  - Save output to `types/supabase.ts` replacing the placeholder from T3
  - Create convenience type aliases in `types/database.ts`:
    - `Equipo = Database["public"]["Tables"]["equipos"]["Row"]`
    - `EquipoInsert = Database["public"]["Tables"]["equipos"]["Insert"]`
    - Same pattern for all 11 tables
  - Create domain Zod schemas in `lib/validations/`:
    - `equipos.ts` — `createEquipoSchema`, `updateEquipoSchema`
    - `formularios.ts` — `createFormularioSchema`, `createCampoSchema`, `submitFormularioSchema`
    - `contratistas.ts` — `createContratistaSchema`, `updateContratistaSchema`
    - `usuarios.ts` — `loginSchema`, `updatePerfilSchema`
  - Schemas must match the database column types exactly

  **Must NOT do**:
  - Do NOT manually write Database types — always generate from Supabase
  - Do NOT add validation logic beyond Zod schemas

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T7, T9)
  - **Parallel Group**: Wave 3
  - **Blocks**: T11-T16
  - **Blocked By**: T2

  **References**:
  - `lib/mock-data.ts:8-107` — Existing TypeScript interfaces to replicate as type aliases
  - Task 2 output — Complete table schemas for type generation
  - `types/supabase.ts` — Placeholder file from T3 to replace

  **Acceptance Criteria**:
  - [ ] `types/supabase.ts` contains auto-generated Database type from Supabase
  - [ ] `types/database.ts` exports Row/Insert/Update aliases for all 11 tables
  - [ ] Zod schemas in `lib/validations/` match database column types
  - [ ] `pnpm build` passes with new types

  **QA Scenarios**:
  ```
  Scenario: Types match database schema
    Tool: Bash
    Steps:
      1. Run pnpm build
      2. Verify zero TypeScript errors
      3. Check types/supabase.ts contains "Tables" with all 11 table names
    Expected Result: Build passes, all tables represented in types
    Evidence: .sisyphus/evidence/task-8-types-verified.md
  ```

  **Commit**: YES
  - Message: `feat(types): generate typescript types and zod validation schemas`
  - Files: `types/supabase.ts`, `types/database.ts`, `lib/validations/*.ts`
  - Pre-commit: `pnpm build`

- [ ] 9. Storage buckets + upload utility functions

  **What to do**:
  - Create 4 storage buckets via SQL: `equipment-images` (public), `equipment-documents` (private), `form-signatures` (private), `form-photos` (private)
  - Set bucket policies:
    - `equipment-images`: All authenticated can SELECT. Admin can INSERT/DELETE.
    - `equipment-documents`: All authenticated can SELECT. Admin can INSERT/DELETE.
    - `form-signatures`: Authenticated users can INSERT to own path (`{user_id}/`). Admin/supervisor can SELECT all. Técnico can SELECT own.
    - `form-photos`: Same as form-signatures.
  - Create `lib/supabase/storage.ts` with utility functions:
    - `uploadFile(bucket, path, file)` → returns public URL or signed URL
    - `getSignedUrl(bucket, path, expiresIn)` → returns signed download URL
    - `deleteFile(bucket, path)` → removes file
    - `getPublicUrl(bucket, path)` → returns public URL (for equipment-images)
  - File path convention: `{entity_id}/{timestamp}-{filename}`

  **Must NOT do**:
  - Do NOT add image optimization/resizing — store as-is
  - Do NOT make private buckets public

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T7, T8)
  - **Parallel Group**: Wave 3
  - **Blocks**: T13, T20, T24
  - **Blocked By**: T2

  **References**:
  - Librarian research: Supabase Storage bucket policies and signed URL patterns
  - `app/equipos/[id]/page.tsx` — Equipment gallery and document tabs showing file display pattern
  - `app/formularios/llenar/[id]/page.tsx` — Signature canvas and photo upload UI

  **Acceptance Criteria**:
  - [ ] 4 storage buckets created in Supabase
  - [ ] Bucket policies enforce role-based access
  - [ ] `lib/supabase/storage.ts` exports upload/download/delete utilities
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: Storage buckets exist
    Tool: mcp_supabase_execute_sql
    Steps:
      1. Query: SELECT id, name, public FROM storage.buckets
      2. Verify 4 buckets: equipment-images (public), equipment-documents (private), form-signatures (private), form-photos (private)
    Expected Result: 4 buckets with correct visibility
    Evidence: .sisyphus/evidence/task-9-buckets-verified.md
  ```

  **Commit**: YES (groups with T7)
  - Message: `feat(security): add RLS policies and storage buckets`
  - Files: `lib/supabase/storage.ts`, migration files
  - Pre-commit: `pnpm build`

- [ ] 10. Seed data migration — demo data from mock-data.ts

  **What to do**:
  - Create seed script that inserts demo data matching existing mock data:
    - 3 users in auth.users via admin API (admin, supervisor, tecnico) with email/password
    - 3 perfiles records (matching auth users)
    - 16 equipos (from mock data)
    - 4 formularios_template with their campos_formulario
    - 15 envios_formularios with respuestas
    - 10 registros_mantenimiento
    - 5 contratistas
    - Sample documentos and imagenes per equipment
    - Sample actividades_equipo timeline entries
  - Use `mcp_supabase_execute_sql` for data insertion
  - Create demo user credentials:
    - Admin: `admin@industrial-portal.com` / `admin123456`
    - Supervisor: `supervisor@industrial-portal.com` / `supervisor123456`
    - Técnico: `tecnico@industrial-portal.com` / `tecnico123456`
  - Ensure seed data respects all FK constraints and RLS policies

  **Must NOT do**:
  - Do NOT insert real/sensitive data
  - Do NOT use weak passwords for production — these are DEMO ONLY
  - Do NOT skip FK relationships — all data must be relationally consistent

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T7 for RLS)
  - **Parallel Group**: Wave 3 (after T7)
  - **Blocks**: T17-T28 (pages need data to display)
  - **Blocked By**: T2, T7

  **References**:
  - `lib/mock-data.ts:109-1011` — All mock data instances to replicate
  - `app/contratistas/page.tsx` — Inline mock contratistas data
  - `app/usuarios/page.tsx` — Inline mock usuarios data
  - `app/analiticas/page.tsx` — Inline mock analytics data

  **Acceptance Criteria**:
  - [ ] 3 auth users created with correct roles
  - [ ] All 11 tables populated with demo data
  - [ ] FK relationships are consistent (no orphaned records)
  - [ ] Can login with each demo credential

  **QA Scenarios**:
  ```
  Scenario: Seed data fully populated
    Tool: mcp_supabase_execute_sql
    Steps:
      1. SELECT count(*) FROM perfiles — expect 3
      2. SELECT count(*) FROM equipos — expect 16
      3. SELECT count(*) FROM formularios_template — expect 4
      4. SELECT count(*) FROM envios_formularios — expect 15
      5. SELECT count(*) FROM contratistas — expect 5
    Expected Result: All counts match expected values
    Evidence: .sisyphus/evidence/task-10-seed-verified.md

  Scenario: Demo login works
    Tool: mcp_supabase_execute_sql
    Steps:
      1. Verify auth.users contains 3 users
      2. Verify perfiles contains matching records with correct roles
    Expected Result: 3 users with admin, supervisor, tecnico roles
    Evidence: .sisyphus/evidence/task-10-users-verified.md
  ```

  **Commit**: YES
  - Message: `feat(seed): migrate demo data from mock to supabase`
  - Pre-commit: Data verification queries

---

### Wave 4 — Server Actions (MAX PARALLEL after Wave 3)

- [x] 11. Server Actions: equipos CRUD

  **What to do**:
  - Create `app/(dashboard)/equipos/actions.ts` with `"use server"` directive
  - Implement actions (ALL return `ActionResult<T>`):
    - `getEquipos(filters?)` — SELECT with optional filters (tipo, estado, ubicacion). Use `revalidateTag("equipos")`.
    - `getEquipoById(id)` — SELECT single with joins to documentos, imagenes, registros, actividades
    - `createEquipo(data)` — Validate with Zod `createEquipoSchema`, INSERT, revalidate
    - `updateEquipo(id, data)` — Validate, UPDATE, log activity, revalidate
    - `deleteEquipo(id)` — DELETE (cascade to docs/images), revalidate
    - `getEquipoStats(id)` — Aggregate: total interventions, last failure, maintenance hours, total cost
  - Add auth check in each action: `const user = await getUser(); if (!user) return { success: false, error: "No autorizado" }`
  - Tag all queries with `unstable_cache` tags: `"equipos"`, `"equipo-{id}"`

  **Must NOT do**:
  - Do NOT throw errors — always return `ActionResult`
  - Do NOT use `revalidatePath` — use `revalidateTag`
  - Do NOT bypass RLS — let Supabase policies handle authorization

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T12-T16)
  - **Parallel Group**: Wave 4
  - **Blocks**: T19, T20, T25
  - **Blocked By**: T3, T8

  **References**:
  - `lib/mock-data.ts:25-38` — `Equipo` interface definition
  - `lib/mock-data.ts:270-490` — Mock equipos data
  - `app/equipos/page.tsx:8-60` — Current hardcoded equipos data and filter patterns
  - `app/equipos/[id]/page.tsx:50-180` — Equipment detail data shapes
  - `lib/types.ts` — ActionResult type from T6

  **Acceptance Criteria**:
  - [ ] All 6 CRUD actions implemented and exported
  - [ ] All actions validate input with Zod
  - [ ] All actions return ActionResult<T>
  - [ ] All actions check auth via getUser()
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: getEquipos returns seeded data
    Tool: Bash (node REPL)
    Steps:
      1. Import and call getEquipos() from server context
      2. Verify returns { success: true, data: [...] } with 16 items
    Expected Result: 16 equipos returned
    Evidence: .sisyphus/evidence/task-11-get-equipos.md

  Scenario: createEquipo validates input
    Tool: Bash (node REPL)
    Steps:
      1. Call createEquipo with invalid data (missing nombre)
      2. Verify returns { success: false, error: "..." }
    Expected Result: Validation error returned, not thrown
    Evidence: .sisyphus/evidence/task-11-validation.md
  ```

  **Commit**: YES (groups with T12-T16)
  - Message: `feat(actions): implement server actions for all modules`
  - Files: `app/(dashboard)/equipos/actions.ts`
  - Pre-commit: `pnpm build`

- [x] 12. Server Actions: formularios_template + campos_formulario

  **What to do**:
  - Create `app/(dashboard)/formularios/actions.ts` with `"use server"` directive
  - Implement actions:
    - `getFormularios(filters?)` — SELECT templates with campo count and envio count
    - `getFormularioById(id)` — SELECT template with all campos ordered by `orden`
    - `createFormulario(data)` — Validate, INSERT template + INSERT campos in transaction, set version=1, create version snapshot
    - `updateFormulario(id, data)` — Validate, increment version, UPDATE template, REPLACE campos, create version snapshot. Must NOT affect historical envios.
    - `toggleFormularioActivo(id)` — Toggle `activo` boolean, revalidate
    - `deleteFormulario(id)` — Soft delete: set `activo=false` (preserve historical data). Do NOT hard delete.
    - `getFormulariosParaEquipo(equipoId)` — Filter templates by asociacion logic: return forms where `asociacion_tipo='general'` OR `asociacion_tipo='equipo' AND asociacion_valor=equipoId` OR `asociacion_tipo='tipo_equipo' AND asociacion_valor=equipo.tipo` OR `asociacion_tipo='area' AND asociacion_valor=equipo.ubicacion`
  - The `getFormulariosParaEquipo` action is CRITICAL — it implements the polymorphic association filter (RF-09)

  **Must NOT do**:
  - Do NOT hard-delete formularios — use soft delete (activo=false)
  - Do NOT modify historical envios when updating a template
  - Do NOT skip version increments on update

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T11, T13-T16)
  - **Parallel Group**: Wave 4
  - **Blocks**: T21, T22, T23, T24, T25
  - **Blocked By**: T3, T8

  **References**:
  - `lib/mock-data.ts:40-70` — FormTemplate and CampoFormulario interfaces
  - `lib/mock-data.ts:108-269` — Mock formularios and campos data
  - `app/formularios/admin/page.tsx:25-90` — Form admin data and toggle logic
  - `app/formularios/constructor/page.tsx:30-120` — Form builder field structure
  - `docs/project.md:80-92` — RF-05, RF-06 versioning requirements
  - `docs/project.md:109-118` — RF-08, RF-09 association requirements

  **Acceptance Criteria**:
  - [ ] All 7 actions implemented
  - [ ] `getFormulariosParaEquipo` correctly implements polymorphic filter
  - [ ] `updateFormulario` increments version and creates snapshot
  - [ ] `deleteFormulario` sets activo=false (not hard delete)
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: Polymorphic form-equipment filter works
    Tool: mcp_supabase_execute_sql
    Steps:
      1. Get an equipo with tipo='maquinaria_pesada'
      2. Call getFormulariosParaEquipo with that equipo's ID
      3. Verify returns forms with asociacion_tipo='general' AND asociacion_tipo='tipo_equipo' where valor='maquinaria_pesada'
    Expected Result: Correct forms filtered by association type
    Evidence: .sisyphus/evidence/task-12-association-filter.md

  Scenario: Version increments on update
    Tool: mcp_supabase_execute_sql
    Steps:
      1. Get a formulario with version=1
      2. Call updateFormulario
      3. Verify version is now 2
      4. Verify formularios_version has a snapshot for version 2
    Expected Result: Version incremented, snapshot created
    Evidence: .sisyphus/evidence/task-12-versioning.md
  ```

  **Commit**: YES (groups with T11, T13-T16)
  - Message: `feat(actions): implement server actions for all modules`
  - Files: `app/(dashboard)/formularios/actions.ts`

- [x] 13. Server Actions: envios_formularios + respuestas

  **What to do**:
  - Create `app/(dashboard)/formularios/envios-actions.ts` with `"use server"` directive
  - Implement actions:
    - `getEnvios(filters?)` — SELECT with joins to formulario nombre, equipo ubicacion, usuario nombre. Filters: estado, equipo_id, usuario_id, formulario_id, date range.
    - `getEnvioById(id)` — SELECT single with full respuestas + template campos for display
    - `submitFormulario(data)` — Complex action:
      1. Validate all respuestas against campo requirements (requerido fields filled)
      2. Get current template version
      3. INSERT envio with version_formulario = current version
      4. If signature campo exists, upload signature to Storage (form-signatures bucket) and store URL in respuesta
      5. If photo campo exists, upload to Storage (form-photos bucket) and store URL
      6. Set firmado=true if signature campo is present and filled
      7. Create actividad_equipo record ("Formulario diligenciado")
      8. Revalidate tags
    - `getEnviosPorEquipo(equipoId)` — For equipment detail "formularios" tab
    - `getEnvioStats()` — Aggregate: total, completados, pendientes, by month (for analytics)

  **Must NOT do**:
  - Do NOT allow updating a firmado envio
  - Do NOT store signature as base64 in DB — upload to Storage, store URL
  - Do NOT skip campo validation (requerido fields)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T11, T12, T14-T16)
  - **Parallel Group**: Wave 4
  - **Blocks**: T20, T21, T24
  - **Blocked By**: T3, T8, T9

  **References**:
  - `lib/mock-data.ts:72-95` — EnvioFormulario and CampoRespuesta interfaces
  - `lib/mock-data.ts:510-750` — Mock envios data
  - `app/formularios/llenar/[id]/page.tsx:100-200` — Form submission flow with signature canvas
  - `app/formularios/page.tsx:20-70` — Envios list with filter UI
  - `docs/project.md:29-55` — RF-01 to RF-03 submission requirements
  - `docs/project.md:160-175` — RF-12 to RF-14 signature and immutability

  **Acceptance Criteria**:
  - [ ] All 5 actions implemented
  - [ ] `submitFormulario` validates required fields, uploads files to Storage, sets firmado
  - [ ] Signature stored as Storage URL, not base64
  - [ ] Envio stats aggregation works for analytics
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: Form submission with signature uploads to storage
    Tool: mcp_supabase_execute_sql
    Steps:
      1. Verify envios_formularios has records with firmado=true
      2. Check respuestas JSONB for firma field — should contain Storage URL not base64
    Expected Result: Firma respuesta contains storage URL pattern
    Evidence: .sisyphus/evidence/task-13-signature-storage.md
  ```

  **Commit**: YES (groups with T11, T12, T14-T16)
  - Message: `feat(actions): implement server actions for all modules`

- [x] 14. Server Actions: registros_mantenimiento + actividades_equipo

  **What to do**:
  - Create `app/(dashboard)/equipos/maintenance-actions.ts`
  - Implement actions:
    - `getRegistrosPorEquipo(equipoId)` — SELECT ordered by fecha_inicio DESC
    - `createRegistro(data)` — Validate, INSERT, create actividad_equipo, update equipo.ultimo_mantenimiento
    - `updateRegistroEstado(id, estado)` — UPDATE estado, if completado → set fecha_fin
    - `getActividadesPorEquipo(equipoId)` — SELECT all activities (timeline) ordered by created_at DESC
    - `getMaintenanceStats()` — Aggregates for analytics: by type, by month, top equipment, technician rankings

  **Must NOT do**:
  - Do NOT create maintenance records without associated actividad_equipo entry

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T11-T13, T15, T16)
  - **Parallel Group**: Wave 4
  - **Blocks**: T20
  - **Blocked By**: T3, T8

  **References**:
  - `lib/mock-data.ts:80-107` — RegistroMantenimiento and ActividadEquipo interfaces
  - `lib/mock-data.ts:750-900` — Mock registros and actividades data
  - `app/equipos/[id]/page.tsx:200-320` — Equipment history tab and timeline

  **Acceptance Criteria**:
  - [ ] All 5 actions implemented returning ActionResult
  - [ ] Creating a registro auto-creates an actividad
  - [ ] Stats aggregation supports analytics page needs

  **QA Scenarios**:
  ```
  Scenario: Maintenance stats aggregate correctly
    Tool: mcp_supabase_execute_sql
    Steps:
      1. Query registros_mantenimiento grouped by tipo
      2. Compare with getMaintenanceStats() output
    Expected Result: Aggregated stats match raw query
    Evidence: .sisyphus/evidence/task-14-maintenance-stats.md
  ```

  **Commit**: YES (groups with T11-T13, T15, T16)

- [x] 15. Server Actions: contratistas CRUD

  **What to do**:
  - Create `app/(dashboard)/contratistas/actions.ts`
  - Implement actions:
    - `getContratistas(filters?)` — SELECT with optional filters (estado, especialidad, search)
    - `getContratistaById(id)` — SELECT single
    - `createContratista(data)` — Validate with Zod, INSERT
    - `updateContratista(id, data)` — Validate, UPDATE
    - `deleteContratista(id)` — Set estado='inactivo' (soft delete)

  **Must NOT do**:
  - Do NOT hard-delete — use soft delete (estado='inactivo')

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T11-T14, T16)
  - **Parallel Group**: Wave 4
  - **Blocks**: T26
  - **Blocked By**: T3, T8

  **References**:
  - `app/contratistas/page.tsx:10-65` — Inline mock contratistas data structure
  - `app/contratistas/nuevo/page.tsx` — Contractor creation form fields

  **Acceptance Criteria**:
  - [ ] All 5 actions implemented returning ActionResult
  - [ ] Delete is soft (estado change, not row removal)
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: Contratistas CRUD works
    Tool: mcp_supabase_execute_sql
    Steps:
      1. SELECT count(*) FROM contratistas — expect 5 from seed
      2. Verify soft delete sets estado='inactivo'
    Expected Result: Seed data present, soft delete works
    Evidence: .sisyphus/evidence/task-15-contratistas.md
  ```

  **Commit**: YES (groups with T11-T14, T16)

- [x] 16. Server Actions: usuarios + analytics queries

  **What to do**:
  - Create `app/(dashboard)/usuarios/actions.ts`:
    - `getUsuarios()` — SELECT all perfiles (admin only)
    - `getUsuarioById(id)` — SELECT single perfil
    - `updatePerfil(id, data)` — UPDATE perfil (own profile)
    - `getCurrentUser()` — Get auth user + perfil data combined
  - Create `app/(dashboard)/analiticas/actions.ts`:
    - `getDashboardKPIs()` — Calculate: equipment availability %, average MTTR, total maintenance cost, active maintenance count, equipment in maintenance count, inspection efficiency %
    - `getFormulariosPorMes()` — Aggregate envios by month (completados vs pendientes)
    - `getTendenciaFallas()` — Aggregate registros tipo='correctivo' by week
    - `getEquiposMasIntervenidos()` — Top 5 equipos by registros count
    - `getTiposMantenimiento()` — Pie chart: preventivo vs correctivo vs inspeccion
    - `getTecnicosActivos()` — Top 5 tecnicos by envios count
  - KPI calculations done in PostgreSQL (SQL views or functions, not application code)

  **Must NOT do**:
  - Do NOT calculate KPIs in JavaScript — use SQL aggregations
  - Do NOT expose user management to non-admin roles

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T11-T15)
  - **Parallel Group**: Wave 4
  - **Blocks**: T18, T27, T28
  - **Blocked By**: T3, T8

  **References**:
  - `app/usuarios/page.tsx:8-50` — Mock usuarios data
  - `app/analiticas/page.tsx:10-100` — All chart data structures and KPIs
  - `app/dashboard/page.tsx:10-55` — Dashboard KPI cards data
  - `docs/project.md:230-258` — RF-17 to RF-19 analytics requirements

  **Acceptance Criteria**:
  - [ ] User CRUD actions work for admin role
  - [ ] All 6 analytics queries return data matching chart shapes
  - [ ] KPIs calculated via SQL (not JS)
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: Analytics queries return chart-compatible data
    Tool: mcp_supabase_execute_sql
    Steps:
      1. Run each analytics aggregation query
      2. Verify response shape matches what Recharts expects
    Expected Result: All 6 queries return valid data shapes
    Evidence: .sisyphus/evidence/task-16-analytics-queries.md
  ```

  **Commit**: YES (groups with T11-T15)
  - Message: `feat(actions): implement server actions for all modules`

---

### Wave 5 — Pages Refactor Part 1 (MAX PARALLEL after Wave 4)

- [x] 17. Login page → Supabase Auth (email/password)

  **What to do**:
  - Refactor `app/login/page.tsx` to use Supabase Auth:
    - Replace mock login handler with `supabase.auth.signInWithPassword({ email, password })`
    - On success: redirect to `/dashboard`
    - On error: show toast with error message
    - Add "Remember me" functionality (already in UI)
  - Add logout functionality:
    - Create `app/(dashboard)/auth/actions.ts` with `signOut()` action
    - Wire to the user menu in `AppSidebar` (nav-user component)
  - Ensure proxy.ts redirects authenticated users away from `/login`

  **Must NOT do**:
  - Do NOT add registration page — users are created by admin
  - Do NOT add OAuth/magic link buttons
  - Do NOT change the visual design of login page

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T18-T22)
  - **Parallel Group**: Wave 5
  - **Blocks**: T28
  - **Blocked By**: T3, T4

  **References**:
  - `app/login/page.tsx` — Current login page with mock handler
  - `components/nav-user.tsx` — User menu with logout button placeholder
  - `proxy.ts` — Auth guard from T4

  **Acceptance Criteria**:
  - [ ] Login with `admin@industrial-portal.com` / `admin123456` succeeds
  - [ ] Login with wrong password shows toast error
  - [ ] Logout redirects to `/login`
  - [ ] Login page visual appearance unchanged

  **QA Scenarios**:
  ```
  Scenario: Successful login flow
    Tool: Playwright
    Steps:
      1. Navigate to /login
      2. Fill email input with "admin@industrial-portal.com"
      3. Fill password input with "admin123456"
      4. Click "Iniciar Sesión" button
      5. Wait for navigation to /dashboard
      6. Assert URL is /dashboard
      7. Assert sidebar shows user name "Carlos Mendoza" (or admin name)
    Expected Result: User logged in and redirected to dashboard
    Failure Indicators: Stays on login, error toast, 401 error
    Evidence: .sisyphus/evidence/task-17-login-success.png

  Scenario: Failed login shows error
    Tool: Playwright
    Steps:
      1. Navigate to /login
      2. Fill email with "admin@industrial-portal.com"
      3. Fill password with "wrongpassword"
      4. Click submit
      5. Assert toast error message appears
      6. Assert URL is still /login
    Expected Result: Error toast shown, stays on login page
    Evidence: .sisyphus/evidence/task-17-login-fail.png
  ```

  **Commit**: YES
  - Message: `feat(auth): implement login with supabase auth`
  - Files: `app/login/page.tsx`, `app/(dashboard)/auth/actions.ts`, `components/nav-user.tsx`
  - Pre-commit: `pnpm build`

- [x] 18. Dashboard page → real KPIs + activity feed

  **What to do**:
  - Refactor `app/(dashboard)/dashboard/page.tsx` to fetch real data:
    - Call `getDashboardKPIs()` for the 6 KPI cards
    - Call recent envios + registros for the "recent activity" feed
    - Call equipos with `estado != 'operativo'` for "critical equipment" section
  - Keep page as `"use client"` — fetch data via Server Actions called in `useEffect` or use SWR/React Query pattern
  - Wire KPI values to the existing card components
  - Wire recent activity to the existing activity list
  - Wire critical equipment to the existing equipment status list

  **Must NOT do**:
  - Do NOT change dashboard layout or card designs
  - Do NOT add new KPI cards not in the original design
  - Do NOT add Realtime here (that's T30)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T17, T19-T22)
  - **Parallel Group**: Wave 5
  - **Blocks**: T30
  - **Blocked By**: T5, T16

  **References**:
  - `app/dashboard/page.tsx` — Current dashboard with hardcoded KPIs
  - `app/(dashboard)/analiticas/actions.ts` — getDashboardKPIs from T16

  **Acceptance Criteria**:
  - [ ] Dashboard displays real KPIs from Supabase
  - [ ] Recent activity shows real envios and registros
  - [ ] Critical equipment shows real non-operativo equipos
  - [ ] Visual appearance matches original design
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: Dashboard shows real data
    Tool: Playwright
    Steps:
      1. Login as admin
      2. Navigate to /dashboard
      3. Assert KPI cards contain numeric values (not "N/A" or empty)
      4. Assert recent activity section has entries
      5. Take screenshot
    Expected Result: Dashboard populated with real data
    Evidence: .sisyphus/evidence/task-18-dashboard-real.png
  ```

  **Commit**: YES
  - Message: `feat(pages): refactor dashboard to use real supabase data`
  - Files: `app/(dashboard)/dashboard/page.tsx`
  - Pre-commit: `pnpm build`

- [x] 19. Equipos list + nuevo pages → real CRUD

  **What to do**:
  - Refactor `app/(dashboard)/equipos/page.tsx`:
    - Replace hardcoded array with `getEquipos()` call
    - Wire filter UI to action params (filter by tipo, estado)
    - Wire search to `ILIKE` query
    - Keep equipment grouped by type as currently displayed
  - Refactor `app/(dashboard)/equipos/nuevo/page.tsx`:
    - Wire form submission to `createEquipo()` action
    - On success: toast + redirect to equipment list
    - On error: toast with error message
    - Image upload: wire to Storage upload utility from T9

  **Must NOT do**:
  - Do NOT change card layout or grid design
  - Do NOT add pagination (follow-up)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T17, T18, T20-T22)
  - **Parallel Group**: Wave 5
  - **Blocks**: —
  - **Blocked By**: T5, T11

  **References**:
  - `app/equipos/page.tsx` — Current equipment list with inline data
  - `app/equipos/nuevo/page.tsx` — Equipment creation form
  - `app/(dashboard)/equipos/actions.ts` — CRUD actions from T11

  **Acceptance Criteria**:
  - [ ] Equipment list shows real data from Supabase
  - [ ] Creating new equipment persists to database
  - [ ] Filters work (tipo, estado)
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: Equipment list shows real data
    Tool: Playwright
    Steps:
      1. Login as admin, navigate to /equipos
      2. Assert at least 1 equipment card is visible
      3. Click a filter (e.g., "Maquinaria Pesada")
      4. Assert only matching equipment shown
    Expected Result: Real equipment data displayed with working filters
    Evidence: .sisyphus/evidence/task-19-equipos-list.png
  ```

  **Commit**: YES
  - Message: `feat(pages): refactor equipos pages to use real data`
  - Files: `app/(dashboard)/equipos/page.tsx`, `app/(dashboard)/equipos/nuevo/page.tsx`

- [x] 20. Equipo detail page — 5 tabs with real data

  **What to do**:
  - Refactor `app/(dashboard)/equipos/[id]/page.tsx`:
    - **Tab Info**: Call `getEquipoById(id)` + `getEquipoStats(id)` for header stats and details
    - **Tab Formularios**: Call `getFormulariosParaEquipo(equipoId)` for available forms + `getEnviosPorEquipo(equipoId)` for recent submissions. Link "Llenar" button to `/formularios/llenar/{formId}?equipo={equipoId}`
    - **Tab Documentos**: Fetch from `documentos` table, display with download links (signed URLs)
    - **Tab Galería**: Fetch from `imagenes` table, display with public URLs
    - **Tab Historial**: Call `getActividadesPorEquipo(equipoId)` for timeline visualization
  - Wire QR code card to real equipment URL
  - Handle all loading/error states for each tab

  **Must NOT do**:
  - Do NOT change tab structure or visual design
  - Do NOT add new tabs

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T17-T19, T21, T22)
  - **Parallel Group**: Wave 5
  - **Blocks**: —
  - **Blocked By**: T11, T13, T9

  **References**:
  - `app/equipos/[id]/page.tsx` — Current detail page with 5 tabs and extensive mock data
  - `app/(dashboard)/equipos/actions.ts` — Equipment actions from T11
  - `app/(dashboard)/formularios/actions.ts` — Form association filter from T12
  - `app/(dashboard)/formularios/envios-actions.ts` — Envios per equipment from T13
  - `app/(dashboard)/equipos/maintenance-actions.ts` — Activities from T14
  - `lib/supabase/storage.ts` — File download utilities from T9

  **Acceptance Criteria**:
  - [ ] All 5 tabs load real data from Supabase
  - [ ] Documents downloadable via signed URLs
  - [ ] Gallery shows real images from Storage
  - [ ] Timeline shows real activities chronologically
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: Equipment detail loads all tabs
    Tool: Playwright
    Steps:
      1. Login as admin, navigate to /equipos/{seeded-id}
      2. Assert info tab shows equipment name, status, stats
      3. Click "Formularios" tab — assert form list appears
      4. Click "Documentos" tab — assert document list appears
      5. Click "Galería" tab — assert images appear
      6. Click "Historial" tab — assert timeline entries appear
    Expected Result: All 5 tabs render with real data
    Evidence: .sisyphus/evidence/task-20-equipo-detail.png
  ```

  **Commit**: YES
  - Message: `feat(pages): refactor equipment detail page with real data`

- [x] 21. Formularios list page → real submissions data

  **What to do**:
  - Refactor `app/(dashboard)/formularios/page.tsx`:
    - Replace inline mock data with `getEnvios()` action call
    - Wire filter tabs (todos, completados, pendientes) to action filters
    - Display real joins: formulario name, equipo location, usuario name
    - Format dates from ISO strings using `date-fns`

  **Must NOT do**:
  - Do NOT change the submission list table/card design

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T17-T20, T22)
  - **Parallel Group**: Wave 5
  - **Blocks**: —
  - **Blocked By**: T5, T13

  **References**:
  - `app/formularios/page.tsx` — Current list with inline envios data
  - `app/(dashboard)/formularios/envios-actions.ts` — Envios actions from T13

  **Acceptance Criteria**:
  - [ ] Submissions list shows real data with joins
  - [ ] Filter tabs work (todos, completados, pendientes)
  - [ ] Dates formatted correctly
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: Submissions list with filters
    Tool: Playwright
    Steps:
      1. Login, navigate to /formularios
      2. Assert submissions are visible
      3. Click "Completados" filter tab
      4. Assert only completed submissions shown
    Expected Result: Real submissions with working filters
    Evidence: .sisyphus/evidence/task-21-formularios-list.png
  ```

  **Commit**: YES
  - Message: `feat(pages): refactor formularios list with real data`

- [x] 22. Formularios admin page → real management

  **What to do**:
  - Refactor `app/(dashboard)/formularios/admin/page.tsx`:
    - Fetch templates with `getFormularios()` action
    - Wire active/inactive toggle to `toggleFormularioActivo()` action
    - Wire delete to `deleteFormulario()` action (soft delete)
    - Wire edit button to navigate to `/formularios/constructor?id={formId}`
    - Display real association info (tipo + valor with icons)
    - Show real version numbers and envio counts

  **Must NOT do**:
  - Do NOT change admin table design
  - Do NOT add new admin features

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T17-T21)
  - **Parallel Group**: Wave 5
  - **Blocks**: —
  - **Blocked By**: T5, T12

  **References**:
  - `app/formularios/admin/page.tsx` — Current admin page with toggle and delete UI
  - `app/(dashboard)/formularios/actions.ts` — Form template actions from T12

  **Acceptance Criteria**:
  - [ ] Admin table shows real formularios
  - [ ] Toggle activo/inactivo persists to database
  - [ ] Delete performs soft delete
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: Toggle form active status
    Tool: Playwright
    Steps:
      1. Login as admin, navigate to /formularios/admin
      2. Find a form with status "Activo"
      3. Click toggle switch
      4. Assert status changes to "Inactivo"
      5. Reload page — assert status persisted
    Expected Result: Toggle persists to database
    Evidence: .sisyphus/evidence/task-22-admin-toggle.png
  ```

  **Commit**: YES
  - Message: `feat(pages): refactor form admin page with real data`

---

### Wave 6 — Pages Refactor Part 2 (MAX PARALLEL after Wave 5)

- [x] 23. Formularios constructor → real form builder with persistence

  **What to do**:
  - Refactor `app/(dashboard)/formularios/constructor/page.tsx`:
    - Support two modes: CREATE (new form) and EDIT (load existing from `?id=` param)
    - In EDIT mode: fetch template + campos with `getFormularioById(id)`
    - Wire "Guardar" button to `createFormulario()` or `updateFormulario()` action
    - Add missing fields to constructor UI that exist in data model but not in current UI: `descripcion`, `tipo` (inspeccion/reporte-fallas/preventivo/correctivo), `frecuencia` (diario/semanal/mensual/trimestral/eventual), `asociacion_tipo` + `asociacion_valor`
    - Preserve existing drag-and-drop functionality (@dnd-kit)
    - On save: toast success + redirect to admin page

  **Must NOT do**:
  - Do NOT add conditional logic or field dependencies (G11)
  - Do NOT change the drag-and-drop mechanics
  - Do NOT break the existing field palette (8 field types)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T24-T28)
  - **Parallel Group**: Wave 6
  - **Blocks**: —
  - **Blocked By**: T12

  **References**:
  - `app/formularios/constructor/page.tsx` — Current constructor with field palette and canvas
  - `app/(dashboard)/formularios/actions.ts` — Form CRUD actions from T12
  - `docs/project.md:59-92` — RF-04 to RF-06 constructor requirements
  - `lib/mock-data.ts:40-55` — FormTemplate interface with fields missing from UI

  **Acceptance Criteria**:
  - [ ] Can create new form template and save to database
  - [ ] Can load existing template for editing
  - [ ] All 8 field types work in drag-and-drop
  - [ ] Added: descripcion, tipo, frecuencia, asociacion fields in UI
  - [ ] Save increments version on edit
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: Create and save a new form template
    Tool: Playwright
    Steps:
      1. Login as admin, navigate to /formularios/constructor
      2. Fill form name "Test Form QA"
      3. Select tipo "inspeccion"
      4. Drag "Texto corto" field to canvas
      5. Set field label to "Nombre del equipo"
      6. Mark as required
      7. Click "Guardar" button
      8. Assert toast success
      9. Navigate to /formularios/admin
      10. Assert "Test Form QA" appears in list
    Expected Result: Form template created and visible in admin
    Evidence: .sisyphus/evidence/task-23-constructor-create.png
  ```

  **Commit**: YES
  - Message: `feat(pages): implement real form builder with persistence`

- [x] 24. Formularios llenar → real submission with signature + photo

  **What to do**:
  - Refactor `app/(dashboard)/formularios/llenar/[id]/page.tsx`:
    - Fetch form template + campos with `getFormularioById(formId)`
    - Get equipment context from `?equipo=` query param
    - Render fields dynamically based on campo.tipo:
      - `texto_corto` → Input
      - `texto_largo` → Textarea
      - `numerico` → Input type=number
      - `fecha` → Calendar/DatePicker
      - `seleccion_unica` → Select from campo.opciones
      - `seleccion_multiple` → Checkboxes from campo.opciones
      - `firma` → react-signature-canvas (existing integration)
      - `foto` → File input with preview
    - On submit: call `submitFormulario()` action with all respuestas
    - Signature: convert canvas to PNG blob, upload to form-signatures bucket
    - Photo: upload to form-photos bucket
    - Display real user info and equipment info in header
    - Validate required fields before submission
    - After success: toast + redirect to equipment detail or form list

  **Must NOT do**:
  - Do NOT change the form rendering design
  - Do NOT allow submitting without required fields filled
  - Do NOT store signature as base64 in database

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T23, T25-T28)
  - **Parallel Group**: Wave 6
  - **Blocks**: —
  - **Blocked By**: T12, T13, T9

  **References**:
  - `app/formularios/llenar/[id]/page.tsx` — Current form filling page with signature canvas
  - `app/(dashboard)/formularios/envios-actions.ts` — Submit action from T13
  - `lib/supabase/storage.ts` — Upload utility from T9
  - `docs/project.md:160-175` — RF-12 to RF-14 signature and metadata

  **Acceptance Criteria**:
  - [ ] All 8 field types render and collect data correctly
  - [ ] Signature canvas works and uploads PNG to Storage
  - [ ] Photo upload works and stores URL in respuesta
  - [ ] Required field validation prevents incomplete submission
  - [ ] Submission creates envio record in database
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: Full form submission with signature
    Tool: Playwright
    Steps:
      1. Login as tecnico, navigate to /formularios/llenar/{formId}?equipo={equipoId}
      2. Fill all required text fields
      3. Draw signature on canvas
      4. Click "Enviar" button
      5. Assert toast success
      6. Navigate to /formularios — assert new submission in list
    Expected Result: Form submitted with signature, visible in submissions list
    Evidence: .sisyphus/evidence/task-24-form-submit.png

  Scenario: Required field validation
    Tool: Playwright
    Steps:
      1. Navigate to form fill page
      2. Leave required fields empty
      3. Click "Enviar"
      4. Assert validation error messages appear
      5. Assert form NOT submitted
    Expected Result: Validation prevents submission, error messages shown
    Evidence: .sisyphus/evidence/task-24-validation-error.png
  ```

  **Commit**: YES
  - Message: `feat(pages): implement real form submission with signatures`

- [x] 25. QR codes page → real data

  **What to do**:
  - Refactor `app/(dashboard)/qr-codes/page.tsx`:
    - Fetch real equipos and formularios_template from Supabase
    - Generate QR codes pointing to real URLs:
      - Equipment: `/equipos/{id}`
      - Forms: `/formularios/llenar/{id}`
    - Wire search/filter to real queries (ILIKE on nombre, ubicacion)
    - Keep existing PNG download functionality (SVG → Canvas → PNG)

  **Must NOT do**:
  - Do NOT change QR code design or layout

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T23, T24, T26-T28)
  - **Parallel Group**: Wave 6
  - **Blocks**: —
  - **Blocked By**: T11, T12

  **References**:
  - `app/qr-codes/page.tsx` — Current QR page with mock data
  - `app/(dashboard)/equipos/actions.ts` — Equipment queries from T11

  **Acceptance Criteria**:
  - [ ] QR codes display for real equipment and forms
  - [ ] Search/filter works
  - [ ] Download PNG works
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: QR codes show real equipment
    Tool: Playwright
    Steps:
      1. Login, navigate to /qr-codes
      2. Assert QR code cards are visible
      3. Assert equipment names match seeded data
    Expected Result: Real equipment QR codes displayed
    Evidence: .sisyphus/evidence/task-25-qr-codes.png
  ```

  **Commit**: YES
  - Message: `feat(pages): refactor QR, contratistas, analytics, config pages`

- [x] 26. Contratistas pages (list + nuevo) → real CRUD

  **What to do**:
  - Refactor `app/(dashboard)/contratistas/page.tsx`:
    - Fetch real contratistas with `getContratistas()` action
    - Wire filter (estado, especialidad) and search to action params
    - Wire delete to soft delete action
  - Refactor `app/(dashboard)/contratistas/nuevo/page.tsx`:
    - Wire form to `createContratista()` action
    - On success: toast + redirect to contratistas list
  - Handle role restriction: only admin can access (show unauthorized message for others)

  **Must NOT do**:
  - Do NOT change contractor card/list design

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T23-T25, T27, T28)
  - **Parallel Group**: Wave 6
  - **Blocks**: —
  - **Blocked By**: T5, T15

  **References**:
  - `app/contratistas/page.tsx` — Current contractor list
  - `app/contratistas/nuevo/page.tsx` — Contractor creation form
  - `app/(dashboard)/contratistas/actions.ts` — CRUD actions from T15

  **Acceptance Criteria**:
  - [ ] Contractor list shows real data
  - [ ] Create contractor persists to database
  - [ ] Filters work
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: Create new contractor
    Tool: Playwright
    Steps:
      1. Login as admin, navigate to /contratistas/nuevo
      2. Fill all required fields
      3. Click submit
      4. Assert redirect to /contratistas with new contractor visible
    Expected Result: New contractor created and listed
    Evidence: .sisyphus/evidence/task-26-contratista-create.png
  ```

  **Commit**: YES (groups with T25, T27, T28)

- [x] 27. Analytics page → real calculated KPIs

  **What to do**:
  - Refactor `app/(dashboard)/analiticas/page.tsx`:
    - Replace all hardcoded chart data with real analytics actions:
      - `getFormulariosPorMes()` → Bar chart (completados vs pendientes)
      - `getTendenciaFallas()` → Line chart (fallas por semana)
      - `getEquiposMasIntervenidos()` → Horizontal bar chart (top 5)
      - `getTiposMantenimiento()` → Pie chart (preventivo vs correctivo vs inspeccion)
      - `getTecnicosActivos()` → Ranking list (top 5)
    - Wire KPI summary cards to `getDashboardKPIs()`
    - Keep existing Recharts components — only swap data source

  **Must NOT do**:
  - Do NOT change chart types or layouts
  - Do NOT add new charts not in original design

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T23-T26, T28)
  - **Parallel Group**: Wave 6
  - **Blocks**: —
  - **Blocked By**: T16

  **References**:
  - `app/analiticas/page.tsx` — Current analytics with all chart implementations
  - `app/(dashboard)/analiticas/actions.ts` — Analytics queries from T16

  **Acceptance Criteria**:
  - [ ] All 5 charts display real data
  - [ ] KPI cards show real calculated values
  - [ ] Chart data shapes match Recharts expectations
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: Analytics shows real charts
    Tool: Playwright
    Steps:
      1. Login as admin, navigate to /analiticas
      2. Assert KPI cards have numeric values
      3. Assert charts render (Recharts SVG elements present)
      4. Take full page screenshot
    Expected Result: All charts rendered with real data
    Evidence: .sisyphus/evidence/task-27-analytics.png
  ```

  **Commit**: YES (groups with T25, T26, T28)

- [x] 28. Configuración + Usuarios pages → real data

  **What to do**:
  - Refactor `app/(dashboard)/configuracion/page.tsx`:
    - Fetch current user profile with `getCurrentUser()` action
    - Wire profile update form to `updatePerfil()` action
    - Theme toggle: persist to Supabase user_metadata
    - Notification preferences: persist to user_metadata
  - Refactor `app/(dashboard)/usuarios/page.tsx`:
    - Fetch all users with `getUsuarios()` action (admin only)
    - Display real user data (name, email, role, department)
    - Role-restrict: only admin can view this page
  - Refactor `app/(dashboard)/usuarios/nuevo/page.tsx` (if exists):
    - Wire to admin user creation

  **Must NOT do**:
  - Do NOT add user deletion (dangerous, out of scope)
  - Do NOT change settings page design

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T23-T27)
  - **Parallel Group**: Wave 6
  - **Blocks**: —
  - **Blocked By**: T16, T17

  **References**:
  - `app/configuracion/page.tsx` — Settings page with profile, theme, notifications
  - `app/usuarios/page.tsx` — User management page
  - `app/(dashboard)/usuarios/actions.ts` — User actions from T16

  **Acceptance Criteria**:
  - [ ] Settings shows real user profile
  - [ ] Profile update persists
  - [ ] Users page shows real user list (admin only)
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: Update user profile
    Tool: Playwright
    Steps:
      1. Login as admin, navigate to /configuracion
      2. Assert current profile data displayed
      3. Change department value
      4. Click save
      5. Reload page — assert change persisted
    Expected Result: Profile update persists across page reloads
    Evidence: .sisyphus/evidence/task-28-profile-update.png
  ```

  **Commit**: YES (groups with T25, T26, T27)
  - Message: `feat(pages): refactor QR, contratistas, analytics, config pages`

---

### Wave 7 — Polish + Realtime + Testing (after Wave 6)

- [x] 29. Loading states + error boundaries + empty states across all pages

  **What to do**:
  - Add `loading.tsx` files in key route groups: `app/(dashboard)/loading.tsx`, `app/(dashboard)/equipos/loading.tsx`, `app/(dashboard)/formularios/loading.tsx`
  - Add `error.tsx` files with user-friendly error messages and retry buttons
  - Add empty states to list pages (when no data): equipos, formularios, contratistas, envios
    - Use a consistent pattern: icon + message + CTA button
  - Add Skeleton loading components where appropriate (cards, tables)

  **Must NOT do**:
  - Do NOT add complex loading animations
  - Do NOT add error reporting to external services

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T30, T31, T32)
  - **Parallel Group**: Wave 7
  - **Blocks**: —
  - **Blocked By**: T17-T28

  **References**:
  - `components/ui/skeleton.tsx` — Existing skeleton component from shadcn
  - All page files — to understand what loading/error states are needed

  **Acceptance Criteria**:
  - [ ] loading.tsx files created for key routes
  - [ ] error.tsx files created with retry buttons
  - [ ] Empty states on list pages show helpful messages
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: Loading state appears
    Tool: Playwright
    Steps:
      1. Navigate to /equipos with network throttling
      2. Assert loading skeleton is visible before data loads
    Expected Result: Skeleton loading UI appears during data fetch
    Evidence: .sisyphus/evidence/task-29-loading-state.png
  ```

  **Commit**: YES
  - Message: `feat(ux): add loading, error, and empty states`

- [x] 30. Realtime subscriptions — dashboard only

  **What to do**:
  - Create `hooks/use-realtime-kpis.ts` custom hook:
    - Subscribe to `envios_formularios` INSERT events
    - Subscribe to `registros_mantenimiento` INSERT/UPDATE events
    - On change: refetch dashboard KPIs
  - Wire hook to dashboard page
  - Enable Supabase Realtime on `envios_formularios` and `registros_mantenimiento` tables (via SQL publication)
  - Clean up subscription on unmount

  **Must NOT do**:
  - Do NOT add Realtime to any page other than dashboard (G3)
  - Do NOT subscribe to all tables — only envios and registros

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T29, T31, T32)
  - **Parallel Group**: Wave 7
  - **Blocks**: —
  - **Blocked By**: T18

  **References**:
  - `app/(dashboard)/dashboard/page.tsx` — Dashboard from T18
  - Librarian research: Supabase Realtime subscription patterns

  **Acceptance Criteria**:
  - [ ] Dashboard KPIs auto-update when new submissions arrive
  - [ ] Subscription cleaned up on unmount (no memory leaks)
  - [ ] Realtime only on dashboard, nowhere else

  **QA Scenarios**:
  ```
  Scenario: Dashboard updates in real-time
    Tool: Playwright + mcp_supabase_execute_sql
    Steps:
      1. Open dashboard in browser
      2. Note current KPI values
      3. Insert a new envio via mcp_supabase_execute_sql
      4. Assert dashboard KPI updates without page reload (within 5 seconds)
    Expected Result: KPI value changes without manual refresh
    Evidence: .sisyphus/evidence/task-30-realtime.png
  ```

  **Commit**: YES
  - Message: `feat(realtime): add real-time dashboard updates`

- [x] 31. Test infrastructure (Vitest) + Auth/RLS tests

  **What to do**:
  - Install Vitest: `pnpm add -D vitest @vitejs/plugin-react`
  - Create `vitest.config.ts` with path aliases matching tsconfig
  - Add `test` script to package.json: `"test": "vitest run"`
  - Create `__tests__/setup.ts` with Supabase test client setup
  - Write auth tests:
    - Login with valid credentials → returns user
    - Login with invalid credentials → returns error
    - getUser with expired token → returns null
  - Write RLS policy tests:
    - Admin can read all tables
    - Técnico cannot read contratistas
    - Técnico can insert envios_formularios
    - Signed submissions cannot be updated
    - Supervisor can read all equipos

  **Must NOT do**:
  - Do NOT install Jest — use Vitest
  - Do NOT mock Supabase for RLS tests — test against real Supabase

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T29, T30, T32)
  - **Parallel Group**: Wave 7
  - **Blocks**: —
  - **Blocked By**: T17-T28

  **References**:
  - `package.json` — Current scripts
  - `tsconfig.json` — Path aliases for vitest config

  **Acceptance Criteria**:
  - [ ] `pnpm test` runs and passes
  - [ ] Auth tests verify login/logout flows
  - [ ] RLS tests verify role-based access
  - [ ] At least 10 tests written

  **QA Scenarios**:
  ```
  Scenario: Test suite passes
    Tool: Bash
    Steps:
      1. Run pnpm test
      2. Assert all tests pass
      3. Assert ≥10 tests ran
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-31-tests-pass.md
  ```

  **Commit**: YES
  - Message: `test(auth): add vitest infrastructure and auth/RLS tests`

- [x] 32. Server Actions tests + integration tests

  **What to do**:
  - Write Server Action unit tests (test validation, error handling):
    - `equipos/actions.test.ts` — test getEquipos, createEquipo validation
    - `formularios/actions.test.ts` — test polymorphic filter, version increment
    - `contratistas/actions.test.ts` — test soft delete
  - Write integration tests (end-to-end flows):
    - Create equipment → create form template → fill form → verify submission → check equipment history
    - Login → access restricted page → verify role restrictions
  - All integration tests run against real Supabase (with seed data)

  **Must NOT do**:
  - Do NOT write snapshot tests
  - Do NOT add e2e browser tests (Playwright) — keep as unit/integration

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T29, T30, T31)
  - **Parallel Group**: Wave 7
  - **Blocks**: —
  - **Blocked By**: T11-T16

  **References**:
  - All actions.ts files from T11-T16
  - `vitest.config.ts` from T31

  **Acceptance Criteria**:
  - [ ] Action validation tests pass
  - [ ] Integration flow tests pass
  - [ ] `pnpm test` runs all tests successfully

  **QA Scenarios**:
  ```
  Scenario: Full test suite passes
    Tool: Bash
    Steps:
      1. Run pnpm test
      2. Assert all tests pass (unit + integration)
    Expected Result: All tests green
    Evidence: .sisyphus/evidence/task-32-full-tests.md
  ```

  **Commit**: YES
  - Message: `test(actions): add server action and integration tests`

---

### Wave 8 — Cleanup

- [x] 33. Remove mock-data.ts + unused deps + final build verification

  **What to do**:
  - Delete `lib/mock-data.ts` — all data now comes from Supabase
  - Remove any remaining imports of mock-data.ts across the codebase
  - Remove `lucide-react` from package.json if still present (should be gone from T1)
  - Run `pnpm lint:fix` to auto-fix any Biome warnings
  - Run `pnpm build` — must pass with zero errors
  - Run `pnpm test` — must pass
  - Verify no `alert()` calls remain
  - Verify no `middleware.ts` exists (only `proxy.ts`)
  - Verify no `SUPABASE_SERVICE_ROLE_KEY` in client code

  **Must NOT do**:
  - Do NOT remove any other files
  - Do NOT change functionality

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (final cleanup)
  - **Parallel Group**: Wave 8 (solo)
  - **Blocks**: FINAL
  - **Blocked By**: T29-T32

  **References**:
  - `lib/mock-data.ts` — File to delete
  - All page files — verify no remaining mock imports

  **Acceptance Criteria**:
  - [ ] `lib/mock-data.ts` deleted
  - [ ] Zero imports of mock-data.ts remain
  - [ ] `pnpm build` passes with zero errors
  - [ ] `pnpm lint` passes
  - [ ] `pnpm test` passes
  - [ ] No `alert()`, no `middleware.ts`, no service key exposure

  **QA Scenarios**:
  ```
  Scenario: Clean build with no mock data
    Tool: Bash
    Steps:
      1. Verify lib/mock-data.ts does NOT exist
      2. Grep for "mock-data" in all .tsx/.ts files — zero matches
      3. Run pnpm build — passes
      4. Run pnpm lint — passes
      5. Run pnpm test — passes
    Expected Result: Clean codebase, all checks pass
    Evidence: .sisyphus/evidence/task-33-clean-build.md

  Scenario: No forbidden patterns remain
    Tool: Grep
    Steps:
      1. Search for "alert(" in .tsx files — zero matches
      2. Search for "middleware.ts" in project — zero matches
      3. Search for "SERVICE_ROLE" in app/ or lib/ or components/ — zero matches
      4. Search for "revalidatePath" — zero matches
    Expected Result: Zero forbidden patterns found
    Evidence: .sisyphus/evidence/task-33-no-forbidden.md
  ```

  **Commit**: YES
  - Message: `chore(cleanup): remove mock data and unused dependencies`
  - Files: deleted `lib/mock-data.ts`, updated imports
  - Pre-commit: `pnpm build && pnpm lint && pnpm test`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists via `mcp_supabase_execute_sql` (tables, RLS), file reads (server actions, pages), and `pnpm build`. For each "Must NOT Have": search codebase for forbidden patterns (OAuth, middleware.ts, revalidatePath, service role key exposure, thrown errors in server actions). Check evidence files exist in `.sisyphus/evidence/`. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `pnpm build && pnpm lint`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, `console.log` in prod, commented-out code, unused imports, `alert()` calls remaining, `middleware.ts` instead of `proxy.ts`, `revalidatePath` usage. Check AI slop: excessive comments, over-abstraction, generic variable names. Verify all Supabase queries use proper error handling (`ActionResult<T>` pattern).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Full end-to-end flow: Login as admin → Dashboard loads with real KPIs → Navigate to Equipos → Create new equipment → View detail (all 5 tabs) → Navigate to Formularios → Create form template in constructor → Activate form in admin → Fill form with signature + photo → Verify submission appears in list → Check QR code page → View Analytics → Manage Contratistas → Update Configuración → Logout → Verify redirect. Test as Técnico: verify restricted access. Save evidence screenshots.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (`git log`/`git diff`). Verify 1:1 — everything in spec was built, nothing beyond spec was built. Check "Must NOT do" compliance per task. Verify no visual changes to existing pages (compare screenshots). Detect cross-task contamination. Verify `mock-data.ts` and `lucide-react` removed. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| Wave | Commit | Files |
|------|--------|-------|
| 1 | `chore(infra): install supabase deps and configure env` | package.json, .env.local.example |
| 2 | `feat(db): create database schema with all tables` | supabase/migrations/ |
| 2 | `feat(infra): add supabase client utils, proxy, layout, toast` | lib/supabase/, proxy.ts, app/(dashboard)/, components/ |
| 3 | `feat(security): add RLS policies and storage buckets` | supabase/migrations/ |
| 3 | `feat(types): generate typescript types and zod schemas` | types/, lib/validations/ |
| 3 | `feat(seed): migrate demo data from mock to supabase` | supabase/seed.sql |
| 4 | `feat(actions): implement server actions for all modules` | app/actions/ |
| 5 | `feat(pages): refactor auth + core pages to live data` | app/login/, app/dashboard/, app/equipos/, app/formularios/ |
| 6 | `feat(pages): refactor forms, QR, contractors, analytics` | app/formularios/, app/qr-codes/, app/contratistas/, app/analiticas/ |
| 7 | `feat(polish): add loading states, realtime, tests` | components/, hooks/, __tests__/ |
| 8 | `chore(cleanup): remove mock data and unused dependencies` | lib/mock-data.ts, package.json |

---

## Success Criteria

### Verification Commands
```bash
pnpm build          # Expected: Build successful, no errors
pnpm lint           # Expected: No errors, warnings acceptable
pnpm test           # Expected: All tests pass
```

### Final Checklist
- [ ] All 11 tables exist in Supabase with RLS enabled
- [ ] All "Must Have" features present and functional
- [ ] All "Must NOT Have" patterns absent from codebase
- [ ] All 15 pages render with real data
- [ ] All tests pass
- [ ] `mock-data.ts` removed
- [ ] `lucide-react` dependency removed
- [ ] No `alert()` calls remain
- [ ] No `middleware.ts` file exists (only `proxy.ts`)
- [ ] No `SUPABASE_SERVICE_ROLE_KEY` in client code
