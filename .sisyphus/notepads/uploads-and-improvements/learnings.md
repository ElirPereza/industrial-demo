## [2026-03-27] Session ses_2cf1d0247ffezJ1E0hdyoA6Byt — Initial Analysis

### Task Status
- Task 1 (Equipment upload server actions): DONE — `app/(dashboard)/equipos/upload-actions.ts` created with 4 functions
- Task 2 (Galería UI): DONE — imageInputRef, handleImageUpload, handleDeleteImage connected in equipment page
- Task 3 (Documentos UI): DONE — docInputRef, handleDocUpload, handleDeleteDocument connected in equipment page  
- Task 4 (Avatar upload): DONE — `app/(dashboard)/usuarios/upload-actions.ts` created; configuracion page has full avatar upload UI
- Task 5 (Firma digital → Storage): PENDING — handleSubmit sends base64 as-is, not uploading to form-signatures bucket
- Task 6 (Foto field upload): PENDING — foto field only stores filename, not uploading to form-photos bucket

### Key Patterns
- Server actions: `"use server"` + `createClient, getUser` from `@/lib/supabase/server` + return `ActionResult<T>`
- `revalidateTag("equipos", "max")` — 2 args in Next.js 16
- Photo/storage client-side: use `createClient` from `@/lib/supabase/client`
- Biome: tabs, double quotes, no semicolons

### Formulario Llenar Page Structure
- File: `app/(dashboard)/formularios/llenar/[id]/page.tsx`
- `handleSubmit` at line 302 — builds `respuestas` array then calls `submitFormulario`
- Signature: stored as base64 data URL in `formData[campoId]`
- Photo: currently just stores filename (NOT uploading)
- `signatureRefs.current[campoId]` has the SignatureCanvas ref
- `updateFieldValue(campoId, value)` to update state

### Supabase client import for client-side uploads
- `import { createClient } from "@/lib/supabase/client"` (NOT server)
- createClient() returns sync client (no await needed)
