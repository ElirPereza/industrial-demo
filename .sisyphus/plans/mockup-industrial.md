# Maqueta Industrial Portal - Frontend Mockup

## TL;DR

> **Quick Summary**: Desarrollar una maqueta frontend de alta calidad para un portal de gestión industrial con 7 módulos funcionales, usando shadcn/ui sobre el template sidebar-08, con datos mock y navegación completa.
> 
> **Deliverables**:
> - Login simulado con redirección
> - Dashboard con KPIs y gráficos
> - Gestión de formularios con tabla y filtros
> - Constructor de formularios drag-and-drop
> - Administración de formularios (activar/desactivar)
> - Generación y visualización de códigos QR
> - Histórico por equipo con timeline
> - Diligenciamiento de formularios con firma digital
> 
> **Estimated Effort**: Large (40-60 horas)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Infraestructura → Dashboard → Form Management → Form Builder

---

## Context

### Original Request
Crear una maqueta de alta calidad, solo frontend, simulando la funcionalidad de la plataforma con datos mockups. Usar shadcn/ui ya instalado, construir sobre sidebar-08.

### Interview Summary
**Key Discussions**:
- **Módulos**: Los 7 módulos del documento de requerimientos (docs/project.md)
- **Interactividad**: Navegación completa, formularios con validación visual, datos mock dinámicos
- **Idioma UI**: Español
- **Form Builder**: Drag-and-drop completo (alta complejidad)
- **Firma Digital**: Canvas interactivo (react-signature-canvas)
- **Responsive**: Desktop-first (optimizado desktop, funcional móvil)
- **Estilo**: Mantener tema existente (OKLCH, esquinas rectas)

**Research Findings**:
- sidebar-08 ya instalado con estructura base
- 78 variantes de charts disponibles en shadcn
- **15 componentes stats en blocks.so** (https://blocks.so/stats) - usar para KPIs
- Faltan componentes: chart, data-table, tabs, dialog, calendar, switch, progress
- Necesita librerías externas: qrcode.react, react-signature-canvas, @dnd-kit
- Necesita configurar registry blocks.so en components.json

### Metis Review
**Identified Gaps** (addressed):
- Idioma UI → Confirmado: Español
- Form Builder scope → Confirmado: Drag-and-drop completo
- Firma digital → Confirmado: Canvas interactivo
- Responsive → Confirmado: Desktop-first
- Componentes faltantes → Incluido en infraestructura

---

## Work Objectives

### Core Objective
Crear una maqueta frontend navegable y visualmente pulida que demuestre todas las funcionalidades del portal de gestión industrial usando datos mock.

### Concrete Deliverables
- 8 páginas navegables (login + 7 módulos)
- Sidebar con navegación completa en español
- 4 tipos de equipos mock con datos realistas
- 4 tipos de formularios mock
- Dashboard con 4+ KPIs y 3+ gráficos
- Form builder funcional con drag-and-drop
- Firma digital canvas interactiva
- Códigos QR generados dinámicamente

### Definition of Done
- [x] Todas las rutas navegables desde sidebar
- [x] `pnpm build` completa sin errores
- [x] `pnpm lint` pasa sin errores (warnings solo en componentes UI base)
- [x] Cada módulo muestra datos mock relevantes

### Must Have
- Navegación entre todos los módulos
- UI completamente en español
- Datos mock realistas del dominio industrial
- Formularios con validación visual
- Gráficos interactivos en dashboard
- Tabla de datos con filtros visuales
- Form builder drag-and-drop funcional
- Firma digital dibujable
- Códigos QR escaneables

### Must NOT Have (Guardrails)
- NO API routes ni backend
- NO localStorage ni persistencia de datos
- NO autenticación real (solo mock redirect)
- NO tests en esta fase
- NO iconos Lucide (usar Phosphor)
- NO lógica de validación compleja (solo visual)
- NO formularios multi-página
- NO lógica condicional entre campos
- NO exportación a PDF/Excel
- NO actualizaciones en tiempo real

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO
- **User wants tests**: NO (mockup phase)
- **Framework**: N/A
- **QA approach**: Manual verification via Playwright skill

### Automated Verification (Agent-Executable)

Cada módulo se verifica con navegación automatizada:

**Por tipo de entregable:**
| Tipo | Herramienta | Procedimiento |
|------|-------------|---------------|
| Páginas/Rutas | Playwright skill | Navegar a URL, verificar elementos visibles |
| Formularios | Playwright skill | Llenar campos, verificar feedback visual |
| Tablas | Playwright skill | Verificar filas, interactuar con filtros |
| Charts | Playwright skill | Verificar renderizado, tooltips |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately) - Infraestructura:
├── Task 1: Instalar componentes shadcn faltantes
├── Task 2: Instalar librerías externas (QR, signature, dnd)
├── Task 3: Crear archivo de datos mock compartido
└── Task 4: Actualizar layout con TooltipProvider + metadata

Wave 2 (After Wave 1) - Navegación + Módulos Base:
├── Task 5: Actualizar sidebar con navegación en español
├── Task 6: Crear página de Login
├── Task 7: Crear Dashboard con KPIs y gráficos
└── Task 8: Crear Gestión de Formularios (tabla + filtros)

Wave 3 (After Wave 2) - Módulos Core:
├── Task 9: Crear Histórico por Equipo
├── Task 10: Crear módulo Códigos QR
└── Task 11: Crear Administración de Formularios

Wave 4 (After Wave 3) - Módulos Complejos:
├── Task 12: Crear Form Builder drag-and-drop
└── Task 13: Crear Diligenciamiento de Formularios + Firma

Wave 5 (Final):
└── Task 14: Revisión final, limpieza y verificación
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 7, 8, 10, 11 | 2, 3, 4 |
| 2 | None | 10, 12, 13 | 1, 3, 4 |
| 3 | None | 5-13 | 1, 2, 4 |
| 4 | None | 5-13 | 1, 2, 3 |
| 5 | 3, 4 | 6-13 | None |
| 6 | 5 | None | 7, 8 |
| 7 | 1, 3, 5 | None | 6, 8 |
| 8 | 1, 3, 5 | 9, 10, 11 | 6, 7 |
| 9 | 3, 8 | None | 10, 11 |
| 10 | 2, 8 | None | 9, 11 |
| 11 | 8 | None | 9, 10 |
| 12 | 2, 8 | 13 | None |
| 13 | 2, 12 | None | None |
| 14 | All | None | None |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Dispatch |
|------|-------|---------------------|
| 1 | 1, 2, 3, 4 | 4 agents parallel: category="quick" |
| 2 | 5, 6, 7, 8 | 4 agents parallel: category="visual-engineering" |
| 3 | 9, 10, 11 | 3 agents parallel: category="visual-engineering" |
| 4 | 12, 13 | Sequential: category="visual-engineering" (complex) |
| 5 | 14 | 1 agent: category="quick" |

---

## TODOs

### Wave 1: Infraestructura

- [x] 1. Instalar componentes shadcn y configurar registry blocks.so

  **What to do**:
  - Agregar registry de blocks.so a `components.json`:
    ```json
    "registries": {
      "blocks": "https://blocks.so/r"
    }
    ```
  - Instalar componentes base shadcn:
    `pnpm dlx shadcn@latest add chart table tabs dialog calendar switch progress toast --overwrite --yes`
  - Instalar stats components de blocks.so para KPIs del Dashboard:
    `pnpm dlx shadcn@latest add https://blocks.so/r/stats-01.json https://blocks.so/r/stats-03.json https://blocks.so/r/stats-07.json https://blocks.so/r/stats-10.json --overwrite --yes`
  - Verificar instalación exitosa

  **Stats Components a usar:**
  - `stats-01`: Stats with Trending (para KPIs con variación)
  - `stats-03`: Stats with Card Layout (para layout general)
  - `stats-07`: Stats with Circular Progress (para métricas de cumplimiento)
  - `stats-10`: Stats with Area Chart (para tendencias inline)

  **Must NOT do**:
  - NO modificar componentes existentes innecesariamente
  - NO instalar todos los 15 stats (solo los necesarios)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Conocimiento de shadcn/ui para instalación correcta

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Tasks 7, 8, 10, 11
  - **Blocked By**: None

  **References**:
  - `components.json` - Configuración shadcn existente
  - `package.json` - Dependencias actuales
  - blocks.so registry: https://blocks.so/stats (15 componentes de stats)
  - Repo: https://github.com/ephraimduncan/blocks

  **Acceptance Criteria**:
  ```bash
  # Verificar que los componentes existen
  ls components/ui/chart.tsx && echo "chart OK"
  ls components/ui/table.tsx && echo "table OK"
  ls components/ui/tabs.tsx && echo "tabs OK"
  ls components/ui/dialog.tsx && echo "dialog OK"
  ls components/ui/calendar.tsx && echo "calendar OK"
  ls components/ui/switch.tsx && echo "switch OK"
  ls components/ui/progress.tsx && echo "progress OK"
  ls components/ui/toast.tsx && echo "toast OK"
  # Verificar stats de blocks.so
  ls components/stats-*.tsx 2>/dev/null || ls components/ui/stats-*.tsx 2>/dev/null && echo "stats OK"
  # Verificar registry configurado
  grep -l "blocks.so" components.json && echo "registry OK"
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(ui): add shadcn components and blocks.so stats registry`
  - Files: `components/ui/*.tsx`, `components/stats-*.tsx`, `components.json`

---

- [x] 2. Instalar librerías externas

  **What to do**:
  - Instalar qrcode.react: `pnpm add qrcode.react`
  - Instalar react-signature-canvas: `pnpm add react-signature-canvas @types/react-signature-canvas`
  - Instalar @dnd-kit para drag-and-drop: `pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
  - Verificar que no hay conflictos de dependencias

  **Must NOT do**:
  - NO instalar librerías alternativas
  - NO modificar configuración de pnpm

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Tasks 10, 12, 13
  - **Blocked By**: None

  **References**:
  - `package.json` - Para verificar instalación

  **Acceptance Criteria**:
  ```bash
  # Verificar dependencias instaladas
  pnpm list qrcode.react && echo "qrcode OK"
  pnpm list react-signature-canvas && echo "signature OK"
  pnpm list @dnd-kit/core && echo "dnd-kit OK"
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(deps): add QR, signature and drag-drop libraries`
  - Files: `package.json`, `pnpm-lock.yaml`

---

- [x] 3. Crear archivo de datos mock compartido

  **What to do**:
  - Crear `lib/mock-data.ts` con datos estructurados
  - Incluir: usuarios mock (admin, técnico, operador)
  - Incluir: equipos (4 tipos con 3-5 items cada uno)
  - Incluir: formularios (4 tipos con campos definidos)
  - Incluir: envíos de formularios (10-15 registros)
  - Incluir: historial de mantenimientos
  - Incluir: datos para KPIs del dashboard
  - Todos los textos en español

  **Must NOT do**:
  - NO usar datos en inglés
  - NO crear datos excesivamente complejos
  - NO más de 50 registros totales

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Estructuración de datos para UI

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Tasks 5-13
  - **Blocked By**: None

  **References**:
  - `docs/project.md` - Tipos de formularios y campos requeridos (RF-04)
  - `app/dashboard/page.tsx` - Estructura actual para referencia

  **Acceptance Criteria**:
  ```bash
  # Verificar que el archivo existe y exporta datos
  grep -l "export const" lib/mock-data.ts && echo "exports OK"
  grep -l "equipos" lib/mock-data.ts && echo "equipos OK"
  grep -l "formularios" lib/mock-data.ts && echo "formularios OK"
  grep -l "usuarios" lib/mock-data.ts && echo "usuarios OK"
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(data): add shared mock data for all modules`
  - Files: `lib/mock-data.ts`

---

- [x] 4. Actualizar layout con TooltipProvider y metadata

  **What to do**:
  - Agregar TooltipProvider en `app/layout.tsx` (requerido por sidebar)
  - Actualizar metadata: title="Industrial Portal", description apropiada
  - Mantener fonts y clases existentes
  - Agregar lang="es" al html

  **Must NOT do**:
  - NO cambiar el sistema de fonts
  - NO modificar globals.css
  - NO agregar providers innecesarios

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: Tasks 5-13
  - **Blocked By**: None

  **References**:
  - `app/layout.tsx:1-37` - Layout actual
  - `components/ui/tooltip.tsx` - TooltipProvider a importar

  **Acceptance Criteria**:
  ```bash
  grep -l "TooltipProvider" app/layout.tsx && echo "provider OK"
  grep -l "Industrial Portal" app/layout.tsx && echo "title OK"
  grep -l 'lang="es"' app/layout.tsx && echo "lang OK"
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(layout): add TooltipProvider and Spanish metadata`
  - Files: `app/layout.tsx`

---

### Wave 2: Navegación + Módulos Base

- [x] 5. Actualizar sidebar con navegación en español

  **What to do**:
  - Modificar `components/app-sidebar.tsx` con navegación del portal industrial
  - Cambiar branding: "Industrial Portal" + icono apropiado
  - Secciones de navegación:
    - Principal: Dashboard, Formularios, Equipos
    - Gestión: Constructor, Administración, Códigos QR
    - Secundario: Soporte, Configuración
  - Usar iconos Phosphor apropiados para cada sección
  - Actualizar NavUser con usuario mock en español
  - Todos los textos en español

  **Must NOT do**:
  - NO usar iconos Lucide
  - NO mantener textos en inglés
  - NO cambiar la estructura del componente Sidebar

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Diseño de navegación y UX

  **Parallelization**:
  - **Can Run In Parallel**: NO (depende de Wave 1)
  - **Parallel Group**: Wave 2 start
  - **Blocks**: Tasks 6-13
  - **Blocked By**: Tasks 3, 4

  **References**:
  - `components/app-sidebar.tsx:1-202` - Sidebar actual con estructura
  - `components/nav-main.tsx` - Componente de navegación principal
  - `lib/mock-data.ts` - Datos de usuario mock
  - `docs/project.md` - Módulos del sistema

  **Acceptance Criteria**:
  ```
  # Playwright verification:
  1. Navigate to: http://localhost:3000/dashboard
  2. Assert: sidebar visible with "Industrial Portal" branding
  3. Assert: nav items include "Dashboard", "Formularios", "Equipos"
  4. Assert: nav items include "Constructor", "Administración", "Códigos QR"
  5. Assert: user section shows Spanish name
  6. Screenshot: .sisyphus/evidence/task-5-sidebar.png
  ```

  **Commit**: YES
  - Message: `feat(nav): update sidebar with Spanish industrial navigation`
  - Files: `components/app-sidebar.tsx`, `components/nav-*.tsx`

---

- [x] 6. Crear página de Login

  **What to do**:
  - Crear `app/login/page.tsx` con formulario de login
  - Usar shadcn MCP para buscar ejemplos de login (login-01 o login-04)
  - Campos: email, contraseña
  - Botón "Iniciar Sesión" que redirige a /dashboard
  - Validación visual (borde rojo si vacío)
  - Branding "Industrial Portal" con logo genérico
  - Link "¿Olvidaste tu contraseña?" (no funcional)
  - Textos en español

  **Must NOT do**:
  - NO implementar autenticación real
  - NO usar localStorage para sesión
  - NO crear página de registro

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Diseño de formularios y UX de login

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8)
  - **Blocks**: None
  - **Blocked By**: Task 5

  **References**:
  - Usar shadcn MCP: `search_items_in_registries(query="login")`
  - `components/ui/input.tsx` - Input component
  - `components/ui/button.tsx` - Button component
  - `lib/mock-data.ts` - Usuario para mostrar después de login

  **Acceptance Criteria**:
  ```
  # Playwright verification:
  1. Navigate to: http://localhost:3000/login
  2. Assert: form with email and password fields visible
  3. Fill: email field with "admin@industrial.com"
  4. Fill: password field with "password123"
  5. Click: "Iniciar Sesión" button
  6. Wait for: URL to be /dashboard
  7. Assert: dashboard page loads
  8. Screenshot: .sisyphus/evidence/task-6-login.png
  ```

  **Commit**: YES
  - Message: `feat(auth): add mock login page with redirect`
  - Files: `app/login/page.tsx`

---

- [x] 7. Crear Dashboard con KPIs y gráficos (usando blocks.so stats)

  **What to do**:
  - Modificar `app/dashboard/page.tsx` con contenido real
  - **Usar componentes stats de blocks.so** para KPIs:
    - `stats-01` (trending): Formularios Hoy (+12% vs ayer)
    - `stats-03` (card layout): Layout general de métricas
    - `stats-07` (circular progress): % Cumplimiento de mantenimientos
    - `stats-10` (area chart): Tendencia semanal inline
  - Adaptar componentes stats al contexto industrial (textos en español)
  - Gráficos adicionales con shadcn charts:
    - Tendencia de fallas (line chart - últimos 7 días)
    - Formularios por tipo (pie/donut chart)
    - Equipos más intervenidos (bar chart horizontal)
  - Sección "Equipos Críticos" con lista/cards
  - Sección "Actividad Reciente" con timeline simple
  - Usar datos de `lib/mock-data.ts`
  - Textos en español

  **Must NOT do**:
  - NO más de 5 tipos de gráficos
  - NO drill-down en gráficos
  - NO filtros de fecha funcionales (solo visual)
  - NO usar todos los 15 stats (solo los 4 seleccionados)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Diseño de dashboards y visualización de datos

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 8)
  - **Blocks**: None
  - **Blocked By**: Tasks 1, 3, 5

  **References**:
  - **blocks.so stats**: https://blocks.so/stats (ver previews de stats-01, stats-03, stats-07, stats-10)
  - `components/stats-01.tsx` o similar - Componente instalado de blocks.so
  - Usar shadcn MCP: `view_items_in_registries(items=["@shadcn/chart-line-default", "@shadcn/chart-pie-donut", "@shadcn/chart-bar-horizontal"])`
  - `app/dashboard/page.tsx:1-56` - Estructura actual
  - `lib/mock-data.ts` - Datos para gráficos
  - `docs/project.md:139-160` - RF-17 a RF-19 (requisitos dashboard)

  **Acceptance Criteria**:
  ```
  # Playwright verification:
  1. Navigate to: http://localhost:3000/dashboard
  2. Assert: 4+ KPI cards visible with numbers (usando stats components)
  3. Assert: at least one stat shows trending indicator (+/-%)
  4. Assert: at least one circular progress visible
  5. Assert: at least 2 charts rendered (svg elements present)
  6. Assert: "Equipos Críticos" section visible
  7. Assert: "Actividad Reciente" section visible
  8. Hover: over chart element, tooltip appears
  9. Screenshot: .sisyphus/evidence/task-7-dashboard.png
  ```

  **Commit**: YES
  - Message: `feat(dashboard): add KPIs with blocks.so stats and charts`
  - Files: `app/dashboard/page.tsx`, `components/dashboard/*.tsx`

---

- [x] 8. Crear Gestión de Formularios (tabla + filtros)

  **What to do**:
  - Crear `app/formularios/page.tsx` con DataTable
  - Usar shadcn MCP para obtener ejemplo de data-table
  - Tabla con columnas: Título, Tipo, Área, Fecha, Estado, Acciones
  - Filtros visuales: Fecha (date picker), Tipo (select), Área (select), Estado (select)
  - Botón "Nuevo Formulario" → navega a /formularios/constructor
  - Click en fila → abre modal con detalle o navega a detalle
  - Paginación visual (aunque datos estáticos)
  - Usar datos de `lib/mock-data.ts`
  - Textos en español

  **Must NOT do**:
  - NO filtrado real del lado servidor
  - NO ordenamiento complejo
  - NO exportación de datos

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Diseño de tablas de datos y filtros

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7)
  - **Blocks**: Tasks 9, 10, 11
  - **Blocked By**: Tasks 1, 3, 5

  **References**:
  - Usar shadcn MCP: `search_items_in_registries(query="data-table")`
  - `components/ui/table.tsx` - Table component
  - `components/ui/select.tsx` - Select para filtros
  - `components/ui/calendar.tsx` - Date picker
  - `lib/mock-data.ts` - Datos de formularios
  - `docs/project.md:18-31` - RF-01 a RF-03 (requisitos)

  **Acceptance Criteria**:
  ```
  # Playwright verification:
  1. Navigate to: http://localhost:3000/formularios
  2. Assert: table with at least 5 rows visible
  3. Assert: filter dropdowns for Tipo, Área, Estado visible
  4. Assert: date picker visible
  5. Click: "Nuevo Formulario" button
  6. Wait for: URL to contain /constructor
  7. Navigate back to: /formularios
  8. Click: first table row
  9. Assert: modal or detail view appears
  10. Screenshot: .sisyphus/evidence/task-8-forms.png
  ```

  **Commit**: YES
  - Message: `feat(forms): add form management with data table and filters`
  - Files: `app/formularios/page.tsx`, `components/forms/*.tsx`

---

### Wave 3: Módulos Core

- [x] 9. Crear Histórico por Equipo

  **What to do**:
  - Crear `app/equipos/page.tsx` con grid/lista de equipos
  - Crear `app/equipos/[id]/page.tsx` con ficha de equipo
  - Grid de equipos: imagen/icono, nombre, tipo, estado, última intervención
  - Ficha de equipo:
    - Header con datos básicos (nombre, tipo, ubicación, responsable)
    - Timeline de mantenimientos (fecha, tipo, técnico, descripción)
    - Cards con estadísticas (total intervenciones, última falla, próximo mantenimiento)
  - Navegación desde grid a ficha
  - Usar datos de `lib/mock-data.ts`
  - Textos en español

  **Must NOT do**:
  - NO más de 10 registros de historial por equipo
  - NO filtrado dentro del historial
  - NO edición de datos

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Diseño de fichas y timelines

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10, 11)
  - **Blocks**: None
  - **Blocked By**: Tasks 3, 8

  **References**:
  - `components/ui/card.tsx` - Para ficha de equipo
  - `lib/mock-data.ts` - Datos de equipos e historial
  - `docs/project.md:121-138` - RF-15 a RF-16 (requisitos)

  **Acceptance Criteria**:
  ```
  # Playwright verification:
  1. Navigate to: http://localhost:3000/equipos
  2. Assert: grid with at least 4 equipment cards visible
  3. Click: first equipment card
  4. Wait for: URL to match /equipos/[id]
  5. Assert: equipment header with name and type visible
  6. Assert: timeline with at least 3 maintenance entries
  7. Assert: statistics cards visible
  8. Screenshot: .sisyphus/evidence/task-9-equipment.png
  ```

  **Commit**: YES
  - Message: `feat(equipment): add equipment grid and history timeline`
  - Files: `app/equipos/page.tsx`, `app/equipos/[id]/page.tsx`, `components/equipment/*.tsx`

---

- [x] 10. Crear módulo Códigos QR

  **What to do**:
  - Crear `app/qr-codes/page.tsx` con lista de formularios y sus QR
  - Usar qrcode.react para generar QR dinámicos
  - Grid/lista: nombre formulario, estado (activo/inactivo), QR preview
  - Click en item → modal con QR grande + botón descargar
  - QR apunta a URL ficticia: `/formularios/llenar/{id}`
  - Badge visual para formularios inactivos
  - Botón "Descargar QR" (simula descarga o abre en nueva pestaña)
  - Usar datos de `lib/mock-data.ts`
  - Textos en español

  **Must NOT do**:
  - NO escaneo de QR (solo generación)
  - NO edición de URLs
  - NO generación masiva

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Integración de librería QR con UI

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 9, 11)
  - **Blocks**: None
  - **Blocked By**: Tasks 2, 8

  **References**:
  - qrcode.react docs: https://www.npmjs.com/package/qrcode.react
  - `components/ui/dialog.tsx` - Modal para QR grande
  - `lib/mock-data.ts` - Datos de formularios
  - `docs/project.md:83-99` - RF-10 a RF-11 (requisitos)

  **Acceptance Criteria**:
  ```
  # Playwright verification:
  1. Navigate to: http://localhost:3000/qr-codes
  2. Assert: grid with at least 4 items, each with QR preview
  3. Assert: QR images are valid (svg or canvas elements)
  4. Click: first item
  5. Assert: modal opens with larger QR
  6. Assert: "Descargar" button visible
  7. Click: close modal
  8. Screenshot: .sisyphus/evidence/task-10-qr.png
  ```

  **Commit**: YES
  - Message: `feat(qr): add QR code generation and display module`
  - Files: `app/qr-codes/page.tsx`, `components/qr/*.tsx`

---

- [x] 11. Crear Administración de Formularios

  **What to do**:
  - Crear `app/formularios/admin/page.tsx`
  - Tabla/lista de formularios con controles de administración
  - Columnas: Nombre, Tipo, Estado (switch), Áreas asignadas, Acciones
  - Switch para activar/desactivar (cambia estado visual)
  - Dropdown para asignar áreas/equipos
  - Botón "Eliminar" con confirmación (dialog)
  - Badge con versión del formulario
  - Usar datos de `lib/mock-data.ts`
  - Textos en español

  **Must NOT do**:
  - NO eliminación real (solo visual/toast)
  - NO persistencia de cambios
  - NO historial de versiones detallado

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Diseño de interfaces de administración

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 9, 10)
  - **Blocks**: None
  - **Blocked By**: Task 8

  **References**:
  - `components/ui/switch.tsx` - Toggle de estado
  - `components/ui/dialog.tsx` - Confirmación de eliminación
  - `lib/mock-data.ts` - Datos de formularios
  - `docs/project.md:61-82` - RF-07 a RF-09 (requisitos)

  **Acceptance Criteria**:
  ```
  # Playwright verification:
  1. Navigate to: http://localhost:3000/formularios/admin
  2. Assert: table with at least 4 forms visible
  3. Assert: each row has a switch toggle
  4. Click: switch on first row
  5. Assert: switch visual state changes
  6. Click: "Eliminar" button on first row
  7. Assert: confirmation dialog appears
  8. Click: cancel button
  9. Assert: dialog closes
  10. Screenshot: .sisyphus/evidence/task-11-admin.png
  ```

  **Commit**: YES
  - Message: `feat(admin): add form administration with toggles and actions`
  - Files: `app/formularios/admin/page.tsx`, `components/admin/*.tsx`

---

### Wave 4: Módulos Complejos

- [x] 12. Crear Form Builder drag-and-drop

  **What to do**:
  - Crear `app/formularios/constructor/page.tsx`
  - Layout: Panel izquierdo (paleta de campos) + Centro (canvas) + Derecho (propiedades)
  - Usar @dnd-kit para drag-and-drop
  - Paleta de campos (arrastrables):
    - Texto corto, Texto largo, Numérico, Fecha
    - Selección única, Selección múltiple
    - Firma digital, Evidencia fotográfica
  - Canvas: zona donde se sueltan los campos, reordenables
  - Panel propiedades: editar label, placeholder, requerido (cuando se selecciona campo)
  - Header con: nombre formulario (editable), botón Guardar, botón Vista Previa
  - Botón Guardar → toast "Formulario guardado"
  - Vista Previa → modal con formulario renderizado
  - Textos en español

  **Must NOT do**:
  - NO campos personalizados (solo los 8 tipos)
  - NO layouts multi-columna
  - NO lógica condicional entre campos
  - NO validación de reglas configurable
  - NO guardado real

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Diseño de builders e interfaces complejas

  **Parallelization**:
  - **Can Run In Parallel**: NO (complejo, requiere foco)
  - **Parallel Group**: Sequential
  - **Blocks**: Task 13
  - **Blocked By**: Tasks 2, 8

  **References**:
  - @dnd-kit docs: https://dndkit.com/
  - @dnd-kit/sortable para reordenamiento
  - `components/ui/input.tsx`, `components/ui/textarea.tsx` - Para campos
  - `components/ui/select.tsx` - Para selección
  - `components/ui/dialog.tsx` - Para vista previa
  - `docs/project.md:33-60` - RF-04 a RF-06 (requisitos)

  **Acceptance Criteria**:
  ```
  # Playwright verification:
  1. Navigate to: http://localhost:3000/formularios/constructor
  2. Assert: left panel with 8 field types visible
  3. Assert: center canvas area visible
  4. Assert: right properties panel visible
  5. Drag: "Texto corto" from palette to canvas
  6. Assert: field appears in canvas
  7. Drag: "Fecha" to canvas
  8. Assert: second field appears in canvas
  9. Click: first field in canvas
  10. Assert: properties panel shows field options
  11. Click: "Vista Previa" button
  12. Assert: modal opens with form preview
  13. Click: "Guardar" button
  14. Assert: toast notification appears
  15. Screenshot: .sisyphus/evidence/task-12-builder.png
  ```

  **Commit**: YES
  - Message: `feat(builder): add drag-and-drop form builder with preview`
  - Files: `app/formularios/constructor/page.tsx`, `components/builder/*.tsx`

---

- [x] 13. Crear Diligenciamiento de Formularios + Firma

  **What to do**:
  - Crear `app/formularios/llenar/[id]/page.tsx`
  - Renderizar formulario basado en configuración mock
  - Campos funcionales: texto, número, fecha, selects
  - Área de firma digital con react-signature-canvas
  - Botones en firma: Limpiar, Confirmar
  - Campo de evidencia fotográfica: file picker visual (sin upload real)
  - Sección de metadatos: usuario actual, fecha/hora, ubicación (mock)
  - Botón "Enviar Formulario" → toast éxito + redirect a /formularios
  - Validación visual: campos requeridos con borde rojo si vacíos
  - Textos en español

  **Must NOT do**:
  - NO envío real de datos
  - NO upload real de archivos
  - NO geolocalización real (usar datos mock)
  - NO guardado de firma

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Diseño de formularios y firma digital

  **Parallelization**:
  - **Can Run In Parallel**: NO (depende de Task 12)
  - **Parallel Group**: Sequential after Task 12
  - **Blocks**: None
  - **Blocked By**: Tasks 2, 12

  **References**:
  - react-signature-canvas docs: https://www.npmjs.com/package/react-signature-canvas
  - `components/ui/input.tsx`, `components/ui/textarea.tsx`
  - `components/ui/calendar.tsx` - Para fecha
  - `lib/mock-data.ts` - Configuración de formulario mock
  - `docs/project.md:100-120` - RF-12 a RF-14 (requisitos)

  **Acceptance Criteria**:
  ```
  # Playwright verification:
  1. Navigate to: http://localhost:3000/formularios/llenar/1
  2. Assert: form fields visible based on form type
  3. Fill: text field with "Prueba de campo"
  4. Assert: field accepts input
  5. Assert: signature canvas visible
  6. Assert: "Limpiar" and "Confirmar" buttons near canvas
  7. Assert: photo evidence section visible with file input
  8. Assert: metadata section shows user, date, location
  9. Click: "Enviar Formulario" without filling required fields
  10. Assert: validation errors appear (red borders)
  11. Fill: all required fields
  12. Click: "Enviar Formulario"
  13. Assert: success toast appears
  14. Wait for: URL to be /formularios
  15. Screenshot: .sisyphus/evidence/task-13-fill.png
  ```

  **Commit**: YES
  - Message: `feat(fill): add form filling with signature and photo capture`
  - Files: `app/formularios/llenar/[id]/page.tsx`, `components/fill/*.tsx`

---

### Wave 5: Finalización

- [x] 14. Revisión final, limpieza y verificación

  **What to do**:
  - Ejecutar `pnpm lint` y corregir errores
  - Ejecutar `pnpm build` y verificar que compila
  - Verificar navegación completa entre todos los módulos
  - Revisar consistencia de textos en español
  - Eliminar código muerto o comentarios innecesarios
  - Verificar que todos los iconos son Phosphor
  - Tomar screenshots de cada módulo para documentación
  - Actualizar AGENTS.md con nuevas rutas y componentes

  **Must NOT do**:
  - NO agregar funcionalidad nueva
  - NO cambiar estilos significativamente
  - NO crear tests

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: NO (final)
  - **Parallel Group**: None
  - **Blocks**: None
  - **Blocked By**: All previous tasks

  **References**:
  - `biome.json` - Reglas de linting
  - `AGENTS.md` - Documentación a actualizar
  - Todas las rutas creadas

  **Acceptance Criteria**:
  ```bash
  # Build verification
  pnpm lint && echo "Lint OK"
  pnpm build && echo "Build OK"
  
  # All routes accessible
  # (verify with Playwright)
  - /login
  - /dashboard
  - /formularios
  - /formularios/constructor
  - /formularios/admin
  - /formularios/llenar/1
  - /equipos
  - /equipos/1
  - /qr-codes
  ```

  **Commit**: YES
  - Message: `chore: cleanup, lint fixes and documentation update`
  - Files: Various

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| Wave 1 | `feat: add infrastructure (components, libs, data, layout)` | Multiple | `pnpm lint` |
| 5 | `feat(nav): update sidebar with Spanish industrial navigation` | components/*.tsx | Visual |
| 6 | `feat(auth): add mock login page with redirect` | app/login/*.tsx | Navigate |
| 7 | `feat(dashboard): add KPIs, charts and activity sections` | app/dashboard/*.tsx | Visual |
| 8 | `feat(forms): add form management with data table and filters` | app/formularios/*.tsx | Visual |
| 9 | `feat(equipment): add equipment grid and history timeline` | app/equipos/*.tsx | Navigate |
| 10 | `feat(qr): add QR code generation and display module` | app/qr-codes/*.tsx | Visual |
| 11 | `feat(admin): add form administration with toggles and actions` | app/formularios/admin/*.tsx | Visual |
| 12 | `feat(builder): add drag-and-drop form builder with preview` | app/formularios/constructor/*.tsx | Interact |
| 13 | `feat(fill): add form filling with signature and photo capture` | app/formularios/llenar/*.tsx | Interact |
| 14 | `chore: cleanup, lint fixes and documentation update` | Various | `pnpm build` |

---

## Success Criteria

### Verification Commands
```bash
pnpm lint      # Expected: 0 errors
pnpm build     # Expected: Build successful
```

### Navigation Test (Playwright)
```
All routes accessible:
- /login → shows login form
- /dashboard → shows KPIs and charts
- /formularios → shows data table
- /formularios/constructor → shows form builder
- /formularios/admin → shows admin panel
- /formularios/llenar/1 → shows form to fill
- /equipos → shows equipment grid
- /equipos/1 → shows equipment detail
- /qr-codes → shows QR codes
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] UI completely in Spanish
- [ ] All navigation works
- [ ] Build passes without errors
- [ ] Lint passes without errors
