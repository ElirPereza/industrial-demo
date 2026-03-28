# Seguridad Funcional en Configuración

## TL;DR

> **Quick Summary**: Hacer funcionales los 4 elementos de la sección Seguridad en /configuracion: 2FA real con TOTP (QR code + Google Authenticator), cambiar contraseña con verificación, cerrar todas las sesiones, y persistir toggle de sesión activa. También actualizar el login para soportar MFA challenge.
>
> **Deliverables**:
> - Cambiar contraseña con verificación de contraseña actual
> - Cerrar todas las sesiones con confirmación
> - 2FA real con TOTP enrollment (QR code) y disable
> - Login page con paso MFA para usuarios con 2FA
> - Toggle "Mantener Sesión Activa" persistido
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES — 3 waves

---

## Context

### Current State
- `app/(dashboard)/configuracion/page.tsx` (531 líneas) — sección Seguridad tiene 2 toggles (2FA, sesión activa) y 2 botones (cambiar contraseña, cerrar sesiones) — todos decorativos
- `app/(dashboard)/auth/actions.ts` — tiene `signOut()` que usa scope default (global)
- `app/login/page.tsx` — login con email/password, sin soporte MFA
- Supabase Auth MFA TOTP habilitado por defecto en el proyecto
- UI components disponibles: Dialog, AlertDialog, Switch, Input, Button, toast (sonner)

### Metis Review — Gaps Addressed
- `signOut()` existente usa scope global → cambiar a `local` para logout normal del sidebar
- MFA operations MUST be client-side (browser Supabase client) — no server actions
- `updateUser({ password })` NO verifica contraseña actual → re-auth con `signInWithPassword` primero
- Stale unverified factors: limpiar antes de enrollar nuevos
- "Mantener Sesión Activa": persistir como preferencia, comportamiento real diferido

---

## Work Objectives

### Must Have
- Dialog "Cambiar Contraseña": 3 campos (actual + nueva + confirmar), valida current via re-auth
- AlertDialog "Cerrar Todas las Sesiones": confirmación → `signOut({ scope: 'global' })` → redirect /login
- 2FA Toggle ON: Dialog con QR code + secret text + input 6 dígitos → verificar → factor activado
- 2FA Toggle OFF: Dialog confirmación con código TOTP → unenroll factor
- Login page: después de login exitoso, si user tiene MFA → mostrar paso TOTP inline
- Toggle sesión activa: persistir en `user_metadata.preferences`
- Fix: `signOut` del sidebar usar `scope: 'local'` (no cerrar todas las sesiones)

### Must NOT Have
- NO nuevas rutas o páginas — todo en dialogs dentro de páginas existentes
- NO nuevas dependencias npm — Supabase provee todo (QR, TOTP)
- NO cambios a database schema — MFA es 100% Supabase Auth
- NO recovery codes — Supabase TOTP no los soporta nativamente
- NO listado de sesiones activas — solo "cerrar todas"
- NO password strength meter — validación básica (min 6 chars, match)
- NO middleware.ts changes
- NO refactoring de estructura de página existente

---

## Verification Strategy

- **Server Actions**: `pnpm build` + LSP diagnostics
- **UI**: Playwright — abrir dialogs, llenar campos, verificar toasts
- **MFA**: `supabase.auth.mfa.listFactors()` para verificar enrollment/unenroll
- **Login MFA**: Playwright — login con cuenta MFA → paso TOTP → dashboard

---

## Execution Strategy

```
Wave 1 (Server Actions + Simple):
├── Task 1: changePassword server action [quick]
├── Task 2: Fix signOut scope + globalSignOut action [quick]
├── Task 3: Persist sesionActiva + autenticacion2FA preferences [quick]

Wave 2 (Dialogs en Configuración):
├── Task 4: Password change dialog UI [quick]
├── Task 5: Close all sessions AlertDialog UI [quick]
├── Task 6: 2FA TOTP enrollment dialog (toggle ON) [unspecified-high]
├── Task 7: 2FA disable dialog (toggle OFF) [quick]

Wave 3 (Login MFA):
├── Task 8: Login page MFA challenge step [unspecified-high]
```

---

## TODOs

- [x] 1. Create changePassword server action

  **What to do**:
  - Edit `app/(dashboard)/auth/actions.ts`
  - Add `changePassword(currentPassword: string, newPassword: string)` server action:
    1. Get user via `getUser()`, return error if not authenticated
    2. Get user email from user object
    3. Re-authenticate: call `supabase.auth.signInWithPassword({ email, password: currentPassword })`
    4. If sign-in fails → return `{ success: false, error: "Contraseña actual incorrecta" }`
    5. If sign-in succeeds → call `supabase.auth.updateUser({ password: newPassword })`
    6. If update fails → return error
    7. Return `{ success: true, data: undefined }`
  - Import pattern from existing actions: `ActionResult<void>`

  **References**:
  - `app/(dashboard)/auth/actions.ts` — existing signOut action pattern
  - `lib/supabase/server.ts` — `createClient()`, `getUser()`
  - `lib/types.ts` — `ActionResult<T>`

  **Acceptance Criteria**:
  - [ ] `changePassword` exported from auth/actions.ts
  - [ ] Returns error on wrong current password
  - [ ] Returns success on correct password change
  - [ ] `pnpm build` passes

---

- [x] 2. Fix signOut scope + add globalSignOut action

  **What to do**:
  - Edit `app/(dashboard)/auth/actions.ts`
  - Change existing `signOut()` to use `scope: 'local'`:
    ```typescript
    await supabase.auth.signOut({ scope: 'local' })
    ```
  - Add new `globalSignOut()` action:
    ```typescript
    export async function globalSignOut(): Promise<ActionResult<void>> {
      const supabase = await createClient()
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      if (error) return { success: false, error: error.message }
      return { success: true, data: undefined }
    }
    ```
  - IMPORTANT: Check all call sites of `signOut` with lsp_find_references before changing

  **References**:
  - `app/(dashboard)/auth/actions.ts` — current signOut implementation
  - Find all usages of signOut across codebase

  **Acceptance Criteria**:
  - [ ] Existing `signOut()` uses `scope: 'local'`
  - [ ] New `globalSignOut()` uses `scope: 'global'`
  - [ ] No breakage in sidebar logout
  - [ ] `pnpm build` passes

---

- [x] 3. Persist security preferences (sesionActiva + 2FA initial state)

  **What to do**:
  - Edit `app/(dashboard)/usuarios/actions.ts`:
    - Add `keepSessionActive: boolean` to `UserPreferences` type
    - Add `keepSessionActive: true` to `DEFAULT_PREFERENCES`
  - Edit `app/(dashboard)/configuracion/page.tsx`:
    - In `fetchUser` callback, after loading prefs, also:
      1. Set `setSesionActiva(p.keepSessionActive ?? true)` from preferences
      2. Call `supabase.auth.mfa.listFactors()` (browser client) to check if user has verified TOTP factors → set `setAutenticacion2FA(hasVerifiedFactor)`
    - In `handleSave`, add `keepSessionActive: sesionActiva` to the `savePreferences()` call
    - Import `createClient` from `@/lib/supabase/client` for MFA check

  **References**:
  - `app/(dashboard)/usuarios/actions.ts` lines 87-127 — UserPreferences type + save/get
  - `app/(dashboard)/configuracion/page.tsx` lines 86-113 — fetchUser + handleSave

  **Acceptance Criteria**:
  - [ ] `keepSessionActive` in UserPreferences type
  - [ ] Toggle persists across page reloads
  - [ ] 2FA toggle reflects actual MFA enrollment status on load
  - [ ] `pnpm build` passes

---

- [x] 4. Password change dialog UI

  **What to do**:
  - Edit `app/(dashboard)/configuracion/page.tsx`
  - Add state: `const [showPasswordDialog, setShowPasswordDialog] = useState(false)`
  - Add states for form fields: `currentPwd`, `newPwd`, `confirmPwd`, `pwdError`, `changingPwd`
  - Import `changePassword` from `@/app/(dashboard)/auth/actions`
  - Import `Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter` from `@/components/ui/dialog`
  - Add handler:
    ```typescript
    async function handleChangePassword() {
      if (newPwd !== confirmPwd) { setPwdError("Las contraseñas no coinciden"); return }
      if (newPwd.length < 6) { setPwdError("Mínimo 6 caracteres"); return }
      setChangingPwd(true); setPwdError("")
      const result = await changePassword(currentPwd, newPwd)
      setChangingPwd(false)
      if (result.success) {
        toast.success("Contraseña cambiada exitosamente")
        setShowPasswordDialog(false); setCurrentPwd(""); setNewPwd(""); setConfirmPwd("")
      } else { setPwdError(result.error) }
    }
    ```
  - Replace the "Cambiar Contraseña" button to open dialog: `onClick={() => setShowPasswordDialog(true)}`
  - Add Dialog component with 3 password inputs + error display + submit button
  - Strip spaces from password fields

  **References**:
  - `app/(dashboard)/configuracion/page.tsx` line 515 — "Cambiar Contraseña" button
  - `components/ui/dialog.tsx` — Dialog component API

  **Acceptance Criteria**:
  - [ ] Dialog opens with 3 fields
  - [ ] Validation: match check, min length
  - [ ] Wrong current password shows error
  - [ ] Correct change shows toast success
  - [ ] `pnpm build` passes

---

- [x] 5. Close all sessions AlertDialog UI

  **What to do**:
  - Edit `app/(dashboard)/configuracion/page.tsx`
  - Import `globalSignOut` from `@/app/(dashboard)/auth/actions`
  - Import `AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger` from `@/components/ui/alert-dialog`
  - Import `useRouter` from `next/navigation`
  - Add state: `const [closingSessions, setClosingSessions] = useState(false)`
  - Add handler:
    ```typescript
    async function handleGlobalSignOut() {
      setClosingSessions(true)
      const result = await globalSignOut()
      if (result.success) {
        router.push("/login")
      } else {
        toast.error(result.error)
        setClosingSessions(false)
      }
    }
    ```
  - Replace the "Cerrar Todas las Sesiones" button with AlertDialog wrapping it:
    - Trigger: the existing destructive button
    - Title: "¿Cerrar todas las sesiones?"
    - Description: "Se cerrará sesión en todos los dispositivos. Tendrás que volver a iniciar sesión."
    - Cancel: "Cancelar"
    - Action: "Cerrar Sesiones" (calls handler)

  **References**:
  - `app/(dashboard)/configuracion/page.tsx` line 520 — "Cerrar Todas las Sesiones" button
  - `components/ui/alert-dialog.tsx` — AlertDialog component API

  **Acceptance Criteria**:
  - [ ] Click button → confirmation dialog appears
  - [ ] Confirm → global signout + redirect to /login
  - [ ] Cancel → nothing happens
  - [ ] `pnpm build` passes

---

- [x] 6. 2FA TOTP enrollment dialog (toggle ON)

  **What to do**:
  - Edit `app/(dashboard)/configuracion/page.tsx`
  - This is the most complex task — the 2FA toggle ON flow:
    1. User clicks toggle ON → open enrollment Dialog
    2. Call `supabase.auth.mfa.listFactors()` → check for stale unverified TOTP factors → unenroll them
    3. Call `supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Portal Industrial' })`
    4. Display the QR code image (`data.totp.qr_code` is SVG data URL → `<img src={qrCode}>`)
    5. Display the secret text below QR for manual entry (copyable)
    6. Show 6-digit input field
    7. On submit: call `supabase.auth.mfa.challenge({ factorId })` → get challengeId
    8. Call `supabase.auth.mfa.verify({ factorId, challengeId, code: strippedCode })`
    9. If verify succeeds → close dialog, toggle stays ON, toast "2FA habilitado"
    10. If verify fails → show error "Código incorrecto", let user retry
    11. If dialog closed without verifying → unenroll the unverified factor, toggle reverts to OFF
  - Strip non-digit characters from TOTP input before verify
  - All MFA calls use BROWSER client (`createClient` from `@/lib/supabase/client`)
  - Disable toggle during operation (loading state)

  **References**:
  - Supabase MFA docs: `auth.mfa.enroll()`, `auth.mfa.challenge()`, `auth.mfa.verify()`
  - `lib/supabase/client.ts` — browser client for MFA operations
  - `components/ui/dialog.tsx` — Dialog component

  **Acceptance Criteria**:
  - [ ] Toggle ON → Dialog shows QR code + secret + input
  - [ ] Valid 6-digit code → factor verified, toast success
  - [ ] Invalid code → error message, can retry
  - [ ] Close without verifying → factor cleaned up, toggle OFF
  - [ ] `supabase.auth.mfa.listFactors()` shows verified factor after enrollment
  - [ ] `pnpm build` passes

---

- [x] 7. 2FA disable dialog (toggle OFF)

  **What to do**:
  - Edit `app/(dashboard)/configuracion/page.tsx`
  - When toggle goes from ON to OFF:
    1. Open Dialog asking for TOTP code to confirm disable
    2. User enters 6-digit code
    3. Get factorId from `listFactors().data.totp[0].id`
    4. Call `supabase.auth.mfa.challenge({ factorId })` → get challengeId
    5. Call `supabase.auth.mfa.verify({ factorId, challengeId, code })` → reach AAL2
    6. Call `supabase.auth.mfa.unenroll({ factorId })`
    7. If success → close dialog, toggle OFF, toast "2FA deshabilitado"
    8. If code wrong → show error, can retry
    9. If cancel → toggle reverts to ON
  - Unenroll requires AAL2, so must challenge+verify first

  **References**:
  - Same Supabase MFA APIs as Task 6
  - `supabase.auth.mfa.unenroll({ factorId })`

  **Acceptance Criteria**:
  - [ ] Toggle OFF → Dialog asks for TOTP code
  - [ ] Valid code → factor unenrolled, toast success
  - [ ] Invalid code → error, can retry
  - [ ] Cancel → toggle reverts to ON
  - [ ] `pnpm build` passes

---

- [x] 8. Login page MFA challenge step

  **What to do**:
  - Edit `app/login/page.tsx`
  - After successful `signInWithPassword()`, check MFA status:
    ```typescript
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aal.currentLevel === 'aal1' && aal.nextLevel === 'aal2') {
      // User has MFA — show TOTP input step
      setShowMfaStep(true)
    } else {
      // No MFA — redirect to dashboard
      router.push('/dashboard')
    }
    ```
  - Add MFA step UI: 6-digit input + verify button
  - On verify:
    ```typescript
    const factors = await supabase.auth.mfa.listFactors()
    const totpFactor = factors.data.totp[0]
    const { data: challenge } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id })
    const { error } = await supabase.auth.mfa.verify({ factorId: totpFactor.id, challengeId: challenge.id, code })
    if (!error) router.push('/dashboard')
    else setMfaError('Código incorrecto')
    ```
  - Add "Volver" button to go back to email/password form
  - This is all client-side (browser client)

  **References**:
  - `app/login/page.tsx` — current login implementation
  - Supabase MFA docs: `getAuthenticatorAssuranceLevel()`, `challenge()`, `verify()`
  - `lib/supabase/client.ts` — browser client

  **Acceptance Criteria**:
  - [ ] Login with MFA account → shows TOTP step after password
  - [ ] Valid TOTP → redirect to dashboard
  - [ ] Invalid TOTP → error, can retry
  - [ ] Login without MFA → direct redirect (no TOTP step)
  - [ ] "Volver" button returns to credentials form
  - [ ] `pnpm build` passes

---

## Final Verification Wave

- Verify `pnpm build` passes
- Verify all dialogs open/close correctly
- Verify password change works (correct + wrong current password)
- Verify 2FA enrollment with real authenticator app
- Verify login with MFA-enabled account shows TOTP step

---

## Commit Strategy

- Commit 1: `feat(auth): add changePassword + globalSignOut server actions`
- Commit 2: `feat(settings): add password change + close sessions dialogs`
- Commit 3: `feat(settings): add 2FA TOTP enrollment and disable flows`
- Commit 4: `feat(login): add MFA challenge step to login flow`

---

## Success Criteria

```bash
pnpm build    # Must pass
pnpm lint     # Must pass
```
