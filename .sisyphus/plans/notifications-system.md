# Sistema de Notificaciones en Tiempo Real

## TL;DR

> **Quick Summary**: Implementar notificaciones reales en el portal — tabla en BD, server actions para CRUD, notificaciones automáticas al enviar formularios y cambiar estado de equipos, componente campana con badge en el sidebar, panel dropdown con lista en tiempo real via Supabase Realtime.
>
> **Deliverables**:
> - Tabla `notificaciones` en Supabase con RLS
> - Server actions: crear, leer, marcar leídas
> - Hook en `submitFormulario` → notifica admins/supervisores
> - Hook en `updateEquipo` → notifica al cambiar estado
> - Componente campana con badge + panel dropdown en sidebar
> - Todo en tiempo real (Supabase Realtime, sin polling)
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES — 3 waves
> **Critical Path**: Task 1 → Task 2 → Tasks 3,4,5 (parallel) → Task 6

---

## Context

### Original Request
Hacer funcionales las notificaciones del portal. Los toggles de preferencias ya se guardan en `user_metadata` (notifFormularios, notifEquipos, etc.), pero no se dispara ninguna notificación real cuando ocurren eventos en el sistema.

### Current State
- Preferencias de notificaciones ya persisten en Supabase `user_metadata` via `UserPreferences`
- No existe tabla `notificaciones` en la BD
- No hay componente de campana ni panel de notificaciones
- `submitFormulario` y `updateEquipo` no generan notificaciones
- Componentes UI disponibles: Dialog, AlertDialog, Switch, Button, Tooltip, Sheet, DropdownMenu
- **NO existen**: Popover, ScrollArea — hay que instalarlos con shadcn CLI

### 3 usuarios en BD
- admin (Carlos Mendoza) — recibe notificaciones de formularios Y equipos
- supervisor (Ana García) — recibe notificaciones de formularios Y equipos
- tecnico (Luis Rodríguez) — solo ejecuta acciones, no recibe

---

## Work Objectives

### Core Objective
Cuando un técnico envía un formulario o se cambia el estado de un equipo, los administradores y supervisores reciben una notificación instantánea visible en la campana del sidebar.

### Concrete Deliverables
- Tabla `notificaciones` con RLS en Supabase
- `app/(dashboard)/notificaciones/actions.ts` con 5 server actions
- `components/notificaciones-bell.tsx` con campana + panel dropdown
- `submitFormulario` notifica al insertar envío exitoso
- `updateEquipo` notifica al cambiar estado

### Definition of Done
- [ ] `pnpm build` pasa sin errores
- [ ] Enviar formulario → notificación aparece en campana instantáneamente
- [ ] Cambiar estado de equipo → notificación aparece en campana
- [ ] Panel muestra lista con icono, título, mensaje, tiempo relativo
- [ ] "Marcar todas como leídas" → badge desaparece
- [ ] Recargar página → notificaciones persisten (vienen de BD)

### Must Have
- Notificaciones persistidas en BD (no efímeras)
- Tiempo real via Supabase Realtime (no polling)
- Badge con contador de no leídas
- Notificaciones fire-and-forget (si falla la notificación, la acción principal NO falla)

### Must NOT Have (Guardrails)
- NO enviar emails reales (solo notificaciones in-app por ahora)
- NO instalar dependencias npm adicionales (Supabase + shadcn tienen todo)
- NO modificar estructura de tablas existentes
- NO romper `submitFormulario` ni `updateEquipo` si la notificación falla
- NO usar `setTimeout`/polling — solo Realtime
- NO usar iconos Lucide — solo Phosphor
- NO usar `any` type
- NO añadir semicolons (Biome: asNeeded)

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: YES (vitest)
- **Automated tests**: NO — verificación via QA scenarios manuales del agente
- **Framework**: vitest existe pero las notificaciones son mejor verificadas via Playwright/browser

### QA Policy
Cada task tiene QA scenarios. Evidence en `.sisyphus/evidence/`.
- **BD**: SQL queries directas via Supabase MCP
- **Server Actions**: Llamadas directas desde código
- **Frontend**: Playwright — navegar, enviar formulario, verificar campana

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — must go first):
├── Task 1: DB migration + install shadcn components [quick]
├── Task 2: Server actions CRUD [quick]

Wave 2 (Parallel — independent of each other):
├── Task 3: Hook submitFormulario → notificación [quick]
├── Task 4: Hook updateEquipo → notificación [quick]
├── Task 5: NotificacionesBell component + sidebar integration [unspecified-high]

Wave 3 (Verification):
├── Task 6: Build + QA end-to-end [quick]
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|------------|--------|
| 1 | — | 2, 3, 4, 5 |
| 2 | 1 | 3, 4, 5 |
| 3 | 2 | 6 |
| 4 | 2 | 6 |
| 5 | 1, 2 | 6 |
| 6 | 3, 4, 5 | — |

### Agent Dispatch Summary

- **Wave 1**: Task 1 → `quick`, Task 2 → `quick`
- **Wave 2**: Task 3 → `quick`, Task 4 → `quick`, Task 5 → `unspecified-high`
- **Wave 3**: Task 6 → `quick`

---

## TODOs

- [x] 1. DB migration + install missing shadcn components

  **What to do**:
  - Run `pnpm dlx shadcn@latest add popover scroll-area` to install Popover and ScrollArea
  - Apply Supabase migration using the Supabase MCP `apply_migration` tool:
    ```sql
    CREATE TABLE notificaciones (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      tipo text NOT NULL CHECK (tipo IN ('nuevo_formulario', 'alerta_equipo', 'reporte_semanal', 'sistema')),
      titulo text NOT NULL,
      mensaje text NOT NULL DEFAULT '',
      leida boolean NOT NULL DEFAULT false,
      metadata jsonb,
      created_at timestamptz DEFAULT now()
    );

    CREATE INDEX notificaciones_user_id_idx ON notificaciones(user_id);
    CREATE INDEX notificaciones_user_leida_idx ON notificaciones(user_id, leida) WHERE NOT leida;

    ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users see own notifications"
      ON notificaciones FOR SELECT TO authenticated
      USING (user_id = auth.uid());

    CREATE POLICY "Authenticated can insert notifications"
      ON notificaciones FOR INSERT TO authenticated
      WITH CHECK (true);

    CREATE POLICY "Users mark own as read"
      ON notificaciones FOR UPDATE TO authenticated
      USING (user_id = auth.uid());

    CREATE POLICY "Users delete own"
      ON notificaciones FOR DELETE TO authenticated
      USING (user_id = auth.uid());

    -- Enable Realtime for this table
    ALTER PUBLICATION supabase_realtime ADD TABLE notificaciones;
    ```
  - Verify: `SELECT * FROM notificaciones LIMIT 1;` returns empty (no error)
  - Verify: `components/ui/popover.tsx` and `components/ui/scroll-area.tsx` exist

  **Must NOT do**:
  - Do NOT modify existing tables
  - Do NOT use ENUM type (use CHECK constraint instead — simpler for PostgREST)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (sequential before Task 2)
  - **Blocks**: Tasks 2, 3, 4, 5
  - **Blocked By**: None

  **References**:
  - `lib/supabase/server.ts` — server client pattern
  - `components/ui/` — existing shadcn components directory (28 files)
  - Existing table `imagenes` uses similar RLS pattern (see `pg_policies` for reference)

  **Acceptance Criteria**:
  - [ ] `SELECT * FROM notificaciones LIMIT 1` returns no error
  - [ ] `components/ui/popover.tsx` exists
  - [ ] `components/ui/scroll-area.tsx` exists
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: Table exists with correct schema
    Tool: Supabase MCP (execute_sql)
    Steps:
      1. Run: SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'notificaciones' ORDER BY ordinal_position
      2. Assert: columns id (uuid), user_id (uuid), tipo (text), titulo (text), mensaje (text), leida (boolean), metadata (jsonb), created_at (timestamptz)
    Expected Result: 8 columns with correct types
    Evidence: .sisyphus/evidence/task-1-table-schema.txt

  Scenario: RLS is enabled
    Tool: Supabase MCP (execute_sql)
    Steps:
      1. Run: SELECT policyname FROM pg_policies WHERE tablename = 'notificaciones'
      2. Assert: 4 policies exist (SELECT, INSERT, UPDATE, DELETE)
    Expected Result: 4 rows returned
    Evidence: .sisyphus/evidence/task-1-rls-policies.txt
  ```

  **Commit**: YES
  - Message: `feat(db): add notificaciones table with RLS and Realtime`
  - Files: `components/ui/popover.tsx`, `components/ui/scroll-area.tsx`
  - Pre-commit: `pnpm build`

---

- [ ] 2. Create notification server actions

  **What to do**:
  - Create new file `app/(dashboard)/notificaciones/actions.ts` with `"use server"` directive
  - Import `createClient, getUser` from `@/lib/supabase/server`
  - Import `ActionResult` from `@/lib/types`
  - Define `Notificacion` type:
    ```typescript
    export type Notificacion = {
      id: string
      user_id: string
      tipo: "nuevo_formulario" | "alerta_equipo" | "reporte_semanal" | "sistema"
      titulo: string
      mensaje: string
      leida: boolean
      metadata: Record<string, unknown> | null
      created_at: string
    }
    ```
  - Implement 5 actions:
    1. `getNotificaciones()`: SELECT last 50 ordered by created_at DESC
    2. `getUnreadCount()`: SELECT count where leida = false
    3. `markAsRead(id: string)`: UPDATE leida = true WHERE id AND user_id = auth user
    4. `markAllAsRead()`: UPDATE leida = true WHERE user_id = auth user AND leida = false
    5. `createNotificacion(input: { userIds: string[], tipo, titulo, mensaje, metadata? })`: INSERT one row per userId. This is called from other server actions internally.
  - Implement helper:
    6. `getPerfilesConRol(roles: string[])`: SELECT user_id FROM perfiles WHERE rol IN (roles). Returns `string[]` of user_ids.

  **Must NOT do**:
  - Do NOT add RPC or Edge Functions — plain server actions
  - Do NOT filter by user preferences here (caller decides)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (needs Task 1 table)
  - **Parallel Group**: Wave 1 (after Task 1)
  - **Blocks**: Tasks 3, 4, 5
  - **Blocked By**: Task 1

  **References**:
  - `app/(dashboard)/equipos/actions.ts` — pattern for server actions with `getUser()`, `createClient()`, `ActionResult`
  - `app/(dashboard)/usuarios/actions.ts` — pattern for querying `perfiles` table
  - `lib/types.ts` — `ActionResult<T>` type (line 5-7)
  - `lib/supabase/server.ts` — `createClient()`, `getUser()` imports

  **Acceptance Criteria**:
  - [ ] File `app/(dashboard)/notificaciones/actions.ts` exists with "use server"
  - [ ] All 6 functions exported
  - [ ] `Notificacion` type exported
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: Insert and read notification
    Tool: Supabase MCP (execute_sql)
    Steps:
      1. INSERT INTO notificaciones (user_id, tipo, titulo, mensaje) VALUES ('9950ec77-e503-468a-9bd4-dde6f4e1579a', 'sistema', 'Test', 'Test message')
      2. SELECT * FROM notificaciones WHERE titulo = 'Test'
      3. Assert: 1 row returned with correct fields
      4. DELETE FROM notificaciones WHERE titulo = 'Test'
    Expected Result: Insert succeeds, select returns the row
    Evidence: .sisyphus/evidence/task-2-crud-test.txt
  ```

  **Commit**: YES
  - Message: `feat(notifications): add server actions for CRUD and dispatch`
  - Files: `app/(dashboard)/notificaciones/actions.ts`
  - Pre-commit: `pnpm build`

---

- [ ] 3. Hook submitFormulario to create notifications

  **What to do**:
  - Edit `app/(dashboard)/formularios/envios-actions.ts`
  - After the successful INSERT of `envios_formularios` (line 162, after `if (envioError)` check)
    and BEFORE the `revalidateTag` calls (line 173), add notification dispatch:
    ```typescript
    // Notify admins and supervisors about new form submission
    try {
      const { getPerfilesConRol, createNotificacion } = await import(
        "@/app/(dashboard)/notificaciones/actions"
      )
      const userIds = await getPerfilesConRol(["admin", "supervisor"])
      // Filter out the current user (don't notify yourself)
      const targetIds = userIds.filter((uid) => uid !== user.id)
      if (targetIds.length > 0) {
        await createNotificacion({
          userIds: targetIds,
          tipo: "nuevo_formulario",
          titulo: "Nuevo formulario enviado",
          mensaje: `Formulario completado con ${input.respuestas.length} campos`,
          metadata: {
            formulario_id: input.formulario_id,
            equipo_id: input.equipo_id,
            envio_id: envio.id,
          },
        })
      }
    } catch {
      // Fire-and-forget: notification failure must NOT break form submission
    }
    ```
  - Use dynamic `import()` to avoid circular deps and keep it fire-and-forget

  **Must NOT do**:
  - Do NOT change existing behavior of `submitFormulario`
  - Do NOT make the function fail if notification creation fails (try/catch)
  - Do NOT add notification BEFORE the envío insert succeeds

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Task 6
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `app/(dashboard)/formularios/envios-actions.ts:107-176` — full `submitFormulario` function
  - `app/(dashboard)/notificaciones/actions.ts` — `createNotificacion` and `getPerfilesConRol` (from Task 2)
  - Line 148-162: the INSERT block — add notification AFTER this succeeds

  **Acceptance Criteria**:
  - [ ] Notification code added after successful envío insert
  - [ ] Wrapped in try/catch (fire-and-forget)
  - [ ] Filters out current user from recipients
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: Form submit creates notification
    Tool: Supabase MCP (execute_sql)
    Preconditions: Submit a form via the UI (or verify the code path)
    Steps:
      1. Check code: read envios-actions.ts and verify notification block exists after line 162
      2. Run: SELECT count(*) FROM notificaciones WHERE tipo = 'nuevo_formulario'
      3. Assert: code path exists and is wrapped in try/catch
    Expected Result: Notification insert code present, wrapped safely
    Evidence: .sisyphus/evidence/task-3-form-hook.txt
  ```

  **Commit**: NO (groups with Task 4)

---

- [ ] 4. Hook updateEquipo to create notifications on status change

  **What to do**:
  - Edit `app/(dashboard)/equipos/actions.ts`
  - In `updateEquipo` (line 119), BEFORE the update query (line 146), fetch the current estado:
    ```typescript
    // Get current estado before update to detect change
    const { data: currentEquipo } = await supabase
      .from("equipos")
      .select("estado, nombre")
      .eq("id", id)
      .single()
    ```
  - After the successful update (line 153, after `if (error)` check), if estado changed:
    ```typescript
    // Notify if estado changed
    if (currentEquipo && currentEquipo.estado !== parsed.data.estado) {
      try {
        const { getPerfilesConRol, createNotificacion } = await import(
          "@/app/(dashboard)/notificaciones/actions"
        )
        const estadoLabels: Record<string, string> = {
          operativo: "Operativo",
          mantenimiento: "En Mantenimiento",
          fuera_servicio: "Fuera de Servicio",
        }
        const userIds = await getPerfilesConRol(["admin", "supervisor"])
        const targetIds = userIds.filter((uid) => uid !== user.id)
        if (targetIds.length > 0) {
          await createNotificacion({
            userIds: targetIds,
            tipo: "alerta_equipo",
            titulo: "Cambio de estado de equipo",
            mensaje: `${data.nombre} → ${estadoLabels[parsed.data.estado] ?? parsed.data.estado}`,
            metadata: {
              equipo_id: id,
              estado_anterior: currentEquipo.estado,
              estado_nuevo: parsed.data.estado,
            },
          })
        }
      } catch {
        // Fire-and-forget
      }
    }
    ```

  **Must NOT do**:
  - Do NOT notify if estado did NOT change (only on actual change)
  - Do NOT break `updateEquipo` if notification fails
  - Do NOT add extra DB queries beyond the one pre-fetch of current estado

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 5)
  - **Blocks**: Task 6
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `app/(dashboard)/equipos/actions.ts:119-158` — full `updateEquipo` function
  - Line 145-151: the UPDATE block — fetch estado BEFORE this, add notification AFTER
  - `app/(dashboard)/notificaciones/actions.ts` — `createNotificacion` and `getPerfilesConRol`

  **Acceptance Criteria**:
  - [ ] Pre-fetches current estado before update
  - [ ] Only notifies when estado actually changed
  - [ ] Wrapped in try/catch
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: Equipment status change creates notification
    Tool: Bash (read code)
    Steps:
      1. Read equipos/actions.ts and verify:
         a. Pre-fetch of current estado exists before update
         b. Notification block exists after successful update
         c. Condition checks estado actually changed
         d. Wrapped in try/catch
    Expected Result: All 4 checks pass
    Evidence: .sisyphus/evidence/task-4-equipo-hook.txt
  ```

  **Commit**: YES
  - Message: `feat(notifications): trigger on form submit and equipment status change`
  - Files: `app/(dashboard)/formularios/envios-actions.ts`, `app/(dashboard)/equipos/actions.ts`
  - Pre-commit: `pnpm build`

---

- [ ] 5. NotificacionesBell component + sidebar integration

  **What to do**:

  **A) Create `components/notificaciones-bell.tsx`** ("use client"):

  Imports needed:
  - `Bell, BellRinging, ClipboardText, Warning, CheckCircle` from `@phosphor-icons/react`
  - `Popover, PopoverContent, PopoverTrigger` from `@/components/ui/popover`
  - `ScrollArea` from `@/components/ui/scroll-area`
  - `Button` from `@/components/ui/button`
  - `createClient` from `@/lib/supabase/client` (for Realtime)
  - Server actions: `getNotificaciones, getUnreadCount, markAsRead, markAllAsRead, type Notificacion` from `@/app/(dashboard)/notificaciones/actions`
  - `useEffect, useState, useCallback` from react

  State:
  - `notificaciones: Notificacion[]`
  - `unreadCount: number`
  - `open: boolean` (popover state)

  **Mount logic**:
  1. Call `getNotificaciones()` → set state
  2. Call `getUnreadCount()` → set state
  3. Get current user ID: `const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser()`
  4. Subscribe to Realtime:
     ```typescript
     const channel = supabase
       .channel("notificaciones-realtime")
       .on("postgres_changes", {
         event: "INSERT",
         schema: "public",
         table: "notificaciones",
         filter: `user_id=eq.${user.id}`,
       }, (payload) => {
         const newNotif = payload.new as Notificacion
         setNotificaciones((prev) => [newNotif, ...prev])
         setUnreadCount((prev) => prev + 1)
       })
       .subscribe()
     ```
  5. Cleanup: `supabase.removeChannel(channel)`

  **Handlers**:
  - `handleMarkAsRead(id)`: call `markAsRead(id)`, update local state
  - `handleMarkAllAsRead()`: call `markAllAsRead()`, update local state

  **Time formatting helper**:
  ```typescript
  function timeAgo(dateStr: string): string {
    const now = Date.now()
    const then = new Date(dateStr).getTime()
    const diff = now - then
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "ahora"
    if (mins < 60) return `hace ${mins} min`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `hace ${hours}h`
    const days = Math.floor(hours / 24)
    if (days === 1) return "ayer"
    return `hace ${days} días`
  }
  ```

  **Icon per type**:
  - `nuevo_formulario` → `ClipboardText` con bg-blue-100 text-blue-600
  - `alerta_equipo` → `Warning` con bg-amber-100 text-amber-600
  - `sistema` / `reporte_semanal` → `Bell` con bg-gray-100 text-gray-600

  **UI structure**:
  ```
  <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <Button variant="ghost" size="icon" className="relative size-8">
        {unreadCount > 0 ? <BellRinging weight="fill" /> : <Bell />}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>
    </PopoverTrigger>
    <PopoverContent align="end" className="w-96 p-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">Notificaciones</h3>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
            <CheckCircle className="mr-1 size-4" />
            Marcar todas
          </Button>
        )}
      </div>
      {/* List */}
      <ScrollArea className="max-h-96">
        {notificaciones.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <Bell className="size-8" />
            <p className="text-sm">Sin notificaciones</p>
          </div>
        ) : (
          notificaciones.map((n) => (
            <button key={n.id} onClick={() => handleMarkAsRead(n.id)}
              className="flex w-full gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted/50">
              {/* Icon */}
              {/* Content: titulo, mensaje, timeAgo */}
              {/* Blue dot if unread */}
            </button>
          ))
        )}
      </ScrollArea>
    </PopoverContent>
  </Popover>
  ```

  **B) Modify `components/app-sidebar.tsx`**:

  - Import `NotificacionesBell` from `@/components/notificaciones-bell`
  - In the `SidebarHeader` section (line 146-164), modify the `<a href="/dashboard">` block
    to include the bell:
    ```tsx
    <SidebarMenuButton size="lg" asChild>
      <a href="/dashboard">
        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
          <FactoryIcon className="size-4" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">Industrial Portal</span>
          <span className="truncate text-xs">Gestión Industrial</span>
        </div>
      </a>
    </SidebarMenuButton>
    ```
    Change to add bell OUTSIDE the MenuButton but inside the MenuItem:
    ```tsx
    <SidebarMenuItem>
      <div className="flex items-center">
        <SidebarMenuButton size="lg" asChild className="flex-1">
          <a href="/dashboard">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <FactoryIcon className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Industrial Portal</span>
              <span className="truncate text-xs">Gestión Industrial</span>
            </div>
          </a>
        </SidebarMenuButton>
        <NotificacionesBell />
      </div>
    </SidebarMenuItem>
    ```

  **Must NOT do**:
  - Do NOT use Lucide icons (use Phosphor: Bell, BellRinging, ClipboardText, Warning, CheckCircle)
  - Do NOT use polling or setInterval — only Supabase Realtime
  - Do NOT create a new page — it's a popover in the sidebar
  - Do NOT break the existing sidebar layout

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4)
  - **Blocks**: Task 6
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `components/app-sidebar.tsx:144-176` — sidebar structure, where to add bell
  - `components/ui/popover.tsx` — Popover component (installed in Task 1)
  - `components/ui/scroll-area.tsx` — ScrollArea component (installed in Task 1)
  - `lib/supabase/client.ts` — browser client for Realtime subscription
  - `hooks/use-current-user.ts` — pattern for getting auth user on client
  - `app/(dashboard)/notificaciones/actions.ts` — server actions (from Task 2)
  - `@phosphor-icons/react` — icon imports (Bell, BellRinging, ClipboardText, Warning, CheckCircle)

  **Acceptance Criteria**:
  - [ ] `components/notificaciones-bell.tsx` exists as "use client"
  - [ ] Bell icon visible in sidebar header
  - [ ] Badge shows unread count
  - [ ] Popover opens with notification list
  - [ ] "Marcar todas" button works
  - [ ] Realtime subscription connected
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: Bell renders in sidebar
    Tool: Playwright (browser)
    Steps:
      1. Navigate to http://localhost:3000/dashboard
      2. Look for bell icon in sidebar header area
      3. Assert: bell button exists
    Expected Result: Bell icon visible next to "Industrial Portal"
    Evidence: .sisyphus/evidence/task-5-bell-visible.png

  Scenario: Popover opens with empty state
    Tool: Playwright (browser)
    Steps:
      1. Navigate to http://localhost:3000/dashboard
      2. Click the bell button
      3. Assert: popover opens with "Sin notificaciones" text
    Expected Result: Popover visible with empty state
    Evidence: .sisyphus/evidence/task-5-popover-empty.png
  ```

  **Commit**: YES
  - Message: `feat(notifications): add bell component with realtime badge and dropdown panel`
  - Files: `components/notificaciones-bell.tsx`, `components/app-sidebar.tsx`
  - Pre-commit: `pnpm build`

---

- [ ] 6. Final build verification and end-to-end QA

  **What to do**:
  - Run `pnpm build` — must pass with zero errors
  - Run `pnpm lint` — check for new warnings
  - Verify Supabase Realtime is enabled for `notificaciones` table
  - Insert a test notification via SQL to verify bell updates

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (final)
  - **Blocks**: None
  - **Blocked By**: Tasks 3, 4, 5

  **References**:
  - All files modified in Tasks 1-5

  **Acceptance Criteria**:
  - [ ] `pnpm build` exit 0
  - [ ] No new lint errors
  - [ ] Bell visible in sidebar
  - [ ] Notification inserted via SQL appears in bell

  **QA Scenarios**:
  ```
  Scenario: Insert test notification and verify bell
    Tool: Supabase MCP + Playwright
    Steps:
      1. Get admin user_id: SELECT user_id FROM perfiles WHERE rol = 'admin'
      2. INSERT INTO notificaciones (user_id, tipo, titulo, mensaje) VALUES ('{admin_user_id}', 'sistema', 'Test QA', 'Verificación final')
      3. Navigate to http://localhost:3000/dashboard
      4. Assert: bell shows badge with count >= 1
      5. Click bell → assert "Test QA" visible in list
      6. Click "Marcar todas" → badge disappears
      7. DELETE FROM notificaciones WHERE titulo = 'Test QA'
    Expected Result: Full cycle works
    Evidence: .sisyphus/evidence/task-6-e2e.png
  ```

  **Commit**: NO (no new code, just verification)

---

## Final Verification Wave

- [ ] F1. `pnpm build` passes with zero errors
- [ ] F2. Enviar formulario desde /formularios/llenar/[id] → campana muestra badge
- [ ] F3. Cambiar estado de equipo → campana actualiza
- [ ] F4. Abrir panel → notificaciones visibles con icono, título, tiempo
- [ ] F5. "Marcar todas como leídas" → badge desaparece
- [ ] F6. Recargar → notificaciones persisten

---

## Commit Strategy

- Commit 1: `feat(db): add notificaciones table with RLS policies`
- Commit 2: `feat(notifications): add server actions for CRUD + notification dispatch`
- Commit 3: `feat(notifications): trigger on form submit and equipment status change`
- Commit 4: `feat(notifications): add bell component with realtime badge and dropdown panel`

---

## Success Criteria

### Verification Commands
```bash
pnpm build    # Expected: exit 0, no errors
pnpm lint     # Expected: no new errors
```

### Final Checklist
- [ ] Table `notificaciones` exists with RLS
- [ ] Campana visible en sidebar con badge
- [ ] Notificaciones en tiempo real (Supabase Realtime)
- [ ] Fire-and-forget (no rompe acciones principales)
- [ ] Persisten entre sesiones (BD)
