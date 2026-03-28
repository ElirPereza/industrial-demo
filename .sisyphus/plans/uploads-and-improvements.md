# Uploads, Notificaciones y Mejoras Frontend

## TL;DR

> **Quick Summary**: Implementar file uploads funcionales (fotos equipos, documentos, avatar, fotos formularios, firma digital) y conectar las notificaciones en configuración.
>
> **Deliverables**:
> - Upload de imágenes en galería de equipos
> - Upload de documentos en equipos (PDF, DOC)
> - Upload de avatar en configuración
> - Upload de fotos al llenar formularios
> - Firma digital guardada en Storage
> - Delete de imágenes y documentos
> - Notificaciones toast funcionales
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES — 3 waves

---

## Context

### Current State
- Storage buckets ya existen: `equipment-images` (public), `equipment-documents` (private), `form-signatures` (private), `form-photos` (private), `avatars` (public)
- Storage policies ya creadas para todos los buckets
- `lib/supabase/storage.ts` tiene utilities de upload/download/delete
- La página de detalle de equipo (`app/(dashboard)/equipos/[id]/page.tsx`, 974 líneas) ya tiene botones "Subir Imagen" y "Subir Documento" pero NO están conectados (no hacen nada)
- La página de configuración tiene sección de perfil pero sin avatar upload
- El formulario llenar ya tiene react-signature-canvas pero no guarda en Storage

### Files to Modify
- `app/(dashboard)/equipos/[id]/page.tsx` — conectar uploads en tabs Galería y Documentos
- `app/(dashboard)/configuracion/page.tsx` — agregar avatar upload
- `app/(dashboard)/formularios/llenar/[id]/page.tsx` — guardar firma y fotos en Storage

### Files to Create
- `app/(dashboard)/equipos/upload-actions.ts` — server actions para upload de equipos
- `app/(dashboard)/usuarios/upload-actions.ts` — server action para avatar

---

## Work Objectives

### Must Have
- Botón "Subir Imagen" en galería de equipo → sube a `equipment-images` bucket → guarda registro en tabla `imagenes` → muestra en galería
- Botón "Subir Documento" en documentos de equipo → sube a `equipment-documents` bucket → guarda en tabla `documentos` → muestra en lista
- Botón delete en imágenes y documentos
- Avatar upload en configuración → sube a `avatars` bucket
- Firma digital del formulario llenar → convierte canvas a PNG → sube a `form-signatures` bucket → guarda URL en respuestas

### Must NOT Have
- No drag & drop complejo — solo file input con botón
- No image cropping/resizing — subir como viene
- No cambiar diseño existente — solo conectar funcionalidad

---

## TODOs

- [x] 1. Create equipment upload server actions

  **What to do**:
  - Create `app/(dashboard)/equipos/upload-actions.ts` with `"use server"` directive
  - Implement `uploadEquipoImage(equipoId: string, formData: FormData)`:
    1. Get user via `getUser()`, return error if not authenticated
    2. Get file from `formData.get("file") as File`
    3. Generate path: `${equipoId}/${Date.now()}.${ext}`
    4. Upload to `equipment-images` bucket via `supabase.storage.from("equipment-images").upload(path, file)`
    5. Get public URL via `.getPublicUrl(path)`
    6. Insert record into `imagenes` table: `{ equipo_id, url, titulo: file.name }`
    7. `revalidateTag("equipos", "max")`
    8. Return `{ success: true, data: { url } }`
  - Implement `uploadEquipoDocument(equipoId: string, formData: FormData)`:
    1. Same auth check
    2. Generate path: `${equipoId}/${Date.now()}-${file.name}`
    3. Upload to `equipment-documents` bucket
    4. Create signed URL (1 year expiry) for private bucket
    5. Determine `tipo` from extension: pdf/doc/img
    6. Insert into `documentos` table: `{ equipo_id, nombre: file.name, tipo, tamano, url }`
    7. Revalidate and return
  - Implement `deleteEquipoImage(imageId: string)`:
    1. Auth check
    2. Delete from `imagenes` table
    3. Revalidate
  - Implement `deleteEquipoDocument(docId: string)`:
    1. Auth check
    2. Delete from `documentos` table
    3. Revalidate

  **References**:
  - `lib/supabase/storage.ts` — existing upload utilities pattern
  - `app/(dashboard)/equipos/actions.ts` — existing action pattern with ActionResult
  - `lib/types.ts` — ActionResult type
  - Biome: tabs, double quotes, no semicolons
  - `revalidateTag` requires 2 args in Next.js 16: `revalidateTag("tag", "max")`

  **Acceptance Criteria**:
  - [ ] File created with 4 exported functions
  - [ ] All return ActionResult<T>
  - [ ] All check auth
  - [ ] `pnpm build` passes

---

- [x] 2. Connect upload buttons in equipment detail page — Galería tab

  **What to do**:
  - Edit `app/(dashboard)/equipos/[id]/page.tsx`
  - Add imports at top:
    ```
    import { uploadEquipoImage, deleteEquipoImage } from "../upload-actions"
    import { Upload, Trash } from "@phosphor-icons/react"
    ```
  - Add state and ref inside the component (after existing state declarations around line 130):
    ```
    const imageInputRef = useRef<HTMLInputElement>(null)
    const [uploadingImage, setUploadingImage] = useState(false)
    ```
  - Add import for `useRef` (add to existing react import)
  - Add upload handler function:
    ```
    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0]
      if (!file) return
      setUploadingImage(true)
      const formData = new FormData()
      formData.append("file", file)
      const result = await uploadEquipoImage(equipoId, formData)
      if (result.success) {
        toast.success("Imagen subida exitosamente")
        // Re-fetch equipo data to show new image
        const equipoResult = await getEquipoById(equipoId)
        if (equipoResult.success) {
          setEquipo(equipoResult.data)
          // Update imagenes from refreshed data
        }
      } else {
        toast.error(result.error)
      }
      setUploadingImage(false)
      if (imageInputRef.current) imageInputRef.current.value = ""
    }
    ```
  - Add delete handler:
    ```
    async function handleDeleteImage(imageId: string) {
      const result = await deleteEquipoImage(imageId)
      if (result.success) {
        toast.success("Imagen eliminada")
        // Re-fetch data
      } else {
        toast.error(result.error)
      }
    }
    ```
  - In the Galería tab (around line 818-878), find the "Subir Imagen" button (line 828-831) and replace:
    ```
    <Button>
      <Images className="mr-2 size-4" />
      Subir Imagen
    </Button>
    ```
    With:
    ```
    <>
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      <Button onClick={() => imageInputRef.current?.click()} disabled={uploadingImage}>
        <Upload className="mr-2 size-4" />
        {uploadingImage ? "Subiendo..." : "Subir Imagen"}
      </Button>
    </>
    ```
  - Also replace the empty state "Subir primera imagen" button (line 841-843) with same pattern
  - Add delete button overlay on each image (inside the hover overlay div, line 865-872):
    After the existing date paragraph, add:
    ```
    <Button size="icon-sm" variant="destructive" className="absolute right-2 top-2 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteImage(img.id)}>
      <Trash className="size-4" />
    </Button>
    ```
  - Add `toast` import from `"sonner"` if not already imported

  **References**:
  - `app/(dashboard)/equipos/[id]/page.tsx` lines 818-878 — Galería tab
  - Import `Upload, Trash` from `@phosphor-icons/react` (add to existing import block line 3-20)
  - Add `useRef` to the react import on line 24
  - Add `toast` from `"sonner"`

  **Acceptance Criteria**:
  - [ ] "Subir Imagen" button opens file picker
  - [ ] Selecting image uploads to Supabase Storage
  - [ ] Image appears in gallery after upload
  - [ ] Delete button removes image
  - [ ] `pnpm build` passes

---

- [x] 3. Connect upload buttons in equipment detail page — Documentos tab

  **What to do**:
  - Same file: `app/(dashboard)/equipos/[id]/page.tsx`
  - Add imports:
    ```
    import { uploadEquipoDocument, deleteEquipoDocument } from "../upload-actions"
    ```
  - Add state and ref:
    ```
    const docInputRef = useRef<HTMLInputElement>(null)
    const [uploadingDoc, setUploadingDoc] = useState(false)
    ```
  - Add document upload handler (similar pattern to image)
  - Add document delete handler
  - In the Documentos tab (lines 722-815), find "Subir Documento" button (line 732-735) and replace with file input + button:
    ```
    <>
      <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" className="hidden" onChange={handleDocUpload} />
      <Button onClick={() => docInputRef.current?.click()} disabled={uploadingDoc}>
        <Upload className="mr-2 size-4" />
        {uploadingDoc ? "Subiendo..." : "Subir Documento"}
      </Button>
    </>
    ```
  - Add delete button to each document row (after the Download button, around line 794-807):
    ```
    <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteDocument(doc.id)}>
      <Trash className="size-4" />
    </Button>
    ```
  - Replace empty state button too (line 745-747)

  **References**:
  - Lines 722-815 — Documentos tab
  - Same file, same patterns as task 2

  **Acceptance Criteria**:
  - [ ] "Subir Documento" opens file picker (PDF, DOC, XLS)
  - [ ] Document appears in list after upload
  - [ ] Delete button removes document
  - [ ] `pnpm build` passes

---

- [x] 4. Create avatar upload action and connect to configuración page

  **What to do**:
  - Create `app/(dashboard)/usuarios/upload-actions.ts`:
    ```typescript
    "use server"
    import { createClient, getUser } from "@/lib/supabase/server"
    import type { ActionResult } from "@/lib/types"

    export async function uploadAvatar(formData: FormData): Promise<ActionResult<{ url: string }>> {
      const user = await getUser()
      if (!user) return { success: false, error: "No autorizado" }
      const file = formData.get("file") as File
      if (!file) return { success: false, error: "No se seleccionó archivo" }
      const supabase = await createClient()
      const ext = file.name.split(".").pop()
      const fileName = `${user.id}/avatar.${ext}`
      const { error } = await supabase.storage.from("avatars").upload(fileName, file, { upsert: true })
      if (error) return { success: false, error: error.message }
      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName)
      return { success: true, data: { url: data.publicUrl } }
    }
    ```
  - Edit `app/(dashboard)/configuracion/page.tsx`:
    - Import `uploadAvatar` from `@/app/(dashboard)/usuarios/upload-actions`
    - Import `Camera` from `@phosphor-icons/react`
    - Add `useRef` to react imports
    - Add state: `const avatarInputRef = useRef<HTMLInputElement>(null)` and `const [avatarUrl, setAvatarUrl] = useState<string | null>(null)`
    - In the profile Card (around line 146-159), replace the User icon div with a clickable avatar:
      ```tsx
      <div className="relative cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
        <div className="flex size-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="size-full object-cover" />
          ) : (
            <User className="size-8" weight="duotone" />
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Camera className="size-3" />
        </div>
        <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
      </div>
      ```
    - Add handler:
      ```typescript
      async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        const formData = new FormData()
        formData.append("file", file)
        const result = await uploadAvatar(formData)
        if (result.success) {
          setAvatarUrl(result.data.url)
          toast.success("Foto de perfil actualizada")
        } else {
          toast.error(result.error)
        }
      }
      ```

  **References**:
  - `app/(dashboard)/configuracion/page.tsx` lines 146-159 — profile card header
  - Biome: tabs, double quotes, no semicolons

  **Acceptance Criteria**:
  - [ ] Clicking avatar icon opens file picker
  - [ ] Image uploads to `avatars` bucket
  - [ ] Avatar displays after upload
  - [ ] `pnpm build` passes

---

- [x] 5. Connect firma digital in formulario llenar to Storage

  **What to do**:
  - Edit `app/(dashboard)/formularios/llenar/[id]/page.tsx`
  - Find where the signature canvas is submitted — currently the signature is stored as base64 data URL in the respuestas
  - Before submitting, convert the signature to a PNG Blob and upload to `form-signatures` bucket:
    ```typescript
    // When submitting, check each respuesta for signature (base64 data URL)
    for (const resp of respuestas) {
      if (typeof resp.valor === "string" && resp.valor.startsWith("data:image/")) {
        // Convert base64 to Blob
        const res = await fetch(resp.valor)
        const blob = await res.blob()
        const fileName = `${user.id}/${Date.now()}-signature.png`
        const { error } = await supabase.storage.from("form-signatures").upload(fileName, blob)
        if (!error) {
          const { data } = supabase.storage.from("form-signatures").getPublicUrl(fileName)
          resp.valor = data.publicUrl // Replace base64 with URL
        }
      }
    }
    ```
  - This should happen client-side BEFORE calling `submitFormulario` action
  - Import `createClient` from `@/lib/supabase/client` for the upload

  **References**:
  - `app/(dashboard)/formularios/llenar/[id]/page.tsx` — find the submit handler
  - `lib/supabase/client.ts` — browser client for uploads

  **Acceptance Criteria**:
  - [ ] Signing and submitting stores PNG URL (not base64) in respuestas
  - [ ] Signature image accessible via URL
  - [ ] `pnpm build` passes

---

- [x] 6. Add photo upload field in formulario llenar

  **What to do**:
  - In `app/(dashboard)/formularios/llenar/[id]/page.tsx`, find where field types are rendered
  - For `tipo === "foto"`, add a file input that:
    1. Shows a camera icon button
    2. On file select, uploads to `form-photos` bucket
    3. Stores the URL in the respuesta value
    4. Shows preview of uploaded photo
  - Pattern:
    ```tsx
    case "foto":
      return (
        <div>
          <input type="file" accept="image/*" onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const supabase = createClient()
            const path = `${Date.now()}-${file.name}`
            const { error } = await supabase.storage.from("form-photos").upload(path, file)
            if (!error) {
              const { data } = supabase.storage.from("form-photos").getPublicUrl(path)
              updateRespuesta(campo.id, data.publicUrl)
            }
          }} />
          {valor && <img src={valor as string} alt="Foto" className="mt-2 max-h-40 rounded" />}
        </div>
      )
    ```

  **Acceptance Criteria**:
  - [ ] Photo field shows file input
  - [ ] Photo uploads to Storage
  - [ ] Preview shown after upload
  - [ ] URL stored in respuesta
  - [ ] `pnpm build` passes

---

## Execution Strategy

```
Wave 1 (Server Actions — create first):
├── Task 1: Equipment upload actions [quick]
├── Task 4: Avatar upload action [quick]

Wave 2 (Frontend — connect to pages):
├── Task 2: Equipment gallery upload UI [unspecified-high]
├── Task 3: Equipment documents upload UI [unspecified-high]
├── Task 4 frontend: Avatar in configuración [quick]

Wave 3 (Formularios):
├── Task 5: Firma digital → Storage [unspecified-high]
├── Task 6: Photo field upload [unspecified-high]
```

---

## Success Criteria

```bash
pnpm build    # Must pass
pnpm test     # Must pass
```

### Verification
- Upload image in equipo galería → appears in grid
- Upload PDF in equipo documentos → appears in list with download link
- Upload avatar in configuración → shows in profile
- Sign and submit formulario → signature stored as URL not base64
- Add photo in formulario → uploads and shows preview
