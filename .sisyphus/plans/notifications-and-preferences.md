# Notificaciones y Preferencias de Usuario

## TL;DR

> **Quick Summary**: Hacer funcionales los toggles de notificaciones y preferencias de apariencia en la página de Configuración. Guardar las preferencias en `user_metadata` de Supabase Auth para que persistan entre sesiones.
>
> **Deliverables**:
> - Preferencias de notificaciones se guardan y cargan desde Supabase
> - Preferencias de apariencia (tema, idioma, formato fecha) se guardan y cargan
> - Tema dark/light funcional con clase CSS
> - Todo persiste al recargar la página
>
> **Estimated Effort**: Quick
> **Parallel Execution**: YES — 2 waves

---

## Context

### Current State
- `app/(dashboard)/configuracion/page.tsx` (483 líneas) tiene toggles de notificaciones y apariencia
- Los toggles son solo UI — se resetean al recargar la página
- `app/(dashboard)/usuarios/actions.ts` tiene `getCurrentUser()` y `updatePerfil()`
- Supabase Auth permite guardar datos arbitrarios en `user_metadata` via `supabase.auth.updateUser({ data: {...} })`

### Problem
Los usuarios configuran notificaciones y tema, pero al recargar la página todo vuelve a los valores por defecto. No hay persistencia.

---

## TODOs

- [x] 1. Add preference actions to usuarios/actions.ts

  **What to do**:
  - Edit `app/(dashboard)/usuarios/actions.ts`
  - Add a `UserPreferences` type at the end of the file:
    ```typescript
    export type UserPreferences = {
      notifEmail: boolean
      notifPush: boolean
      notifFormularios: boolean
      notifEquipos: boolean
      notifReportes: boolean
      tema: "light" | "dark" | "system"
      idioma: string
      formatoFecha: string
    }
    ```
  - Add default preferences constant:
    ```typescript
    const DEFAULT_PREFERENCES: UserPreferences = {
      notifEmail: true,
      notifPush: true,
      notifFormularios: true,
      notifEquipos: false,
      notifReportes: true,
      tema: "system",
      idioma: "es",
      formatoFecha: "DD/MM/YYYY",
    }
    ```
  - Add `getPreferences()` action:
    ```typescript
    export async function getPreferences(): Promise<ActionResult<UserPreferences>> {
      const user = await getUser()
      if (!user) return { success: false, error: "No autorizado" }
      const prefs = user.user_metadata?.preferences as UserPreferences | undefined
      return { success: true, data: { ...DEFAULT_PREFERENCES, ...prefs } }
    }
    ```
  - Add `savePreferences()` action:
    ```typescript
    export async function savePreferences(
      prefs: UserPreferences,
    ): Promise<ActionResult<UserPreferences>> {
      const user = await getUser()
      if (!user) return { success: false, error: "No autorizado" }
      const supabase = await createClient()
      const { error } = await supabase.auth.updateUser({
        data: { preferences: prefs },
      })
      if (error) return { success: false, error: error.message }
      return { success: true, data: prefs }
    }
    ```

  **References**:
  - `app/(dashboard)/usuarios/actions.ts` — add after `updatePerfil` function (line 85)
  - `lib/types.ts` — `ActionResult<T>` type
  - Biome: tabs, double quotes, no semicolons

  **Acceptance Criteria**:
  - [ ] `UserPreferences` type exported
  - [ ] `getPreferences()` reads from user_metadata
  - [ ] `savePreferences()` writes to user_metadata
  - [ ] `pnpm build` passes

---

- [x] 2. Connect configuración page to load/save preferences

  **What to do**:
  - Edit `app/(dashboard)/configuracion/page.tsx`
  - Import the new actions:
    ```typescript
    import {
      getCurrentUser,
      type Perfil,
      updatePerfil,
      getPreferences,
      savePreferences,
      type UserPreferences,
    } from "@/app/(dashboard)/usuarios/actions"
    ```
  - In `fetchUser` callback (around line 86-96), also load preferences:
    ```typescript
    const fetchUser = useCallback(async () => {
      setLoading(true)
      const [userResult, prefsResult] = await Promise.all([
        getCurrentUser(),
        getPreferences(),
      ])
      if (userResult.success) {
        setPerfil(userResult.data)
        setNombre(userResult.data.nombre)
        setEmail(userResult.data.email)
        setCargo(userResult.data.departamento ?? "")
      }
      if (prefsResult.success) {
        const p = prefsResult.data
        setNotifEmail(p.notifEmail)
        setNotifPush(p.notifPush)
        setNotifFormularios(p.notifFormularios)
        setNotifEquipos(p.notifEquipos)
        setNotifReportes(p.notifReportes)
        setTema(p.tema)
        setIdioma(p.idioma)
        setFormatoFecha(p.formatoFecha)
      }
      setLoading(false)
    }, [])
    ```
  - In `handleSave` function (around line 100-115), also save preferences:
    ```typescript
    const handleSave = async () => {
      if (!perfil) return
      setSaving(true)

      const [profileResult, prefsResult] = await Promise.all([
        updatePerfil(perfil.id, {
          nombre,
          departamento: cargo || undefined,
        }),
        savePreferences({
          notifEmail,
          notifPush,
          notifFormularios,
          notifEquipos,
          notifReportes,
          tema,
          idioma,
          formatoFecha,
        }),
      ])

      setSaving(false)

      if (profileResult.success && prefsResult.success) {
        toast.success("Configuración guardada exitosamente")
        setPerfil(profileResult.data)
      } else {
        toast.error(profileResult.error ?? prefsResult.error ?? "Error al guardar")
      }
    }
    ```
  - Add dark mode toggle effect — when `tema` changes AND is saved, apply class:
    After the existing useEffect for fetchUser, add:
    ```typescript
    useEffect(() => {
      if (tema === "dark") {
        document.documentElement.classList.add("dark")
      } else if (tema === "light") {
        document.documentElement.classList.remove("dark")
      } else {
        // system preference
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        if (prefersDark) {
          document.documentElement.classList.add("dark")
        } else {
          document.documentElement.classList.remove("dark")
        }
      }
    }, [tema])
    ```

  **References**:
  - `app/(dashboard)/configuracion/page.tsx` — lines 86-115 (fetchUser + handleSave)
  - The page already has all the toggle state variables (lines 52-62)
  - The "Guardar Cambios" button already calls `handleSave` (line 149)
  - Biome: tabs, double quotes, no semicolons

  **Acceptance Criteria**:
  - [ ] Preferences load from Supabase on page load
  - [ ] "Guardar Cambios" saves both profile AND preferences
  - [ ] Reloading page shows saved preferences (not defaults)
  - [ ] Dark mode toggle applies `.dark` class to `<html>`
  - [ ] `pnpm build` passes

---

## Execution Strategy

```
Wave 1:
├── Task 1: Add preference actions [quick]

Wave 2:
├── Task 2: Connect configuración page [quick]
```

---

## Success Criteria

```bash
pnpm build    # Must pass
```

### Verification
1. Go to /configuracion
2. Toggle "Notificaciones por Email" OFF
3. Change tema to "Oscuro"
4. Click "Guardar Cambios" → toast success
5. Reload page → toggles should show saved values (email OFF, tema oscuro)
6. Page should be in dark mode
