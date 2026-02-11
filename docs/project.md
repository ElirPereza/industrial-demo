# Industrial Portal - Fase 2
## Documento de Requerimientos Funcionales

> **Objetivo**: Digitalizar la gestión de mantenimiento industrial mediante formularios dinámicos, códigos QR, firmas digitales y analíticas en tiempo real.

---

## Resumen de Módulos

| # | Módulo | Descripción | RFs |
|---|--------|-------------|-----|
| 1 | [Gestión de Formularios](#1-gestión-centralizada-de-formularios) | Diligenciamiento, envío y consulta de formularios | RF-01 a RF-03 |
| 2 | [Constructor de Formularios](#2-constructor-dinámico-de-formularios) | Creación visual de formularios sin código | RF-04 a RF-06 |
| 3 | [Administración de Formularios](#3-administración-de-formularios) | Activación/desactivación en tiempo real | RF-07 a RF-09 |
| 4 | [Códigos QR](#4-generación-y-gestión-de-códigos-qr) | Generación automática de QR por formulario/equipo | RF-10 a RF-11 |
| 5 | [Firma Digital](#5-firma-digital-y-trazabilidad) | Trazabilidad legal con firmas y timestamps | RF-12 a RF-14 |
| 6 | [Histórico por Equipo](#6-histórico-por-equipo) | Auditoría completa de intervenciones | RF-15 a RF-16 |
| 7 | [Analíticas](#7-analítica-y-estadísticas) | Dashboard de supervisor con KPIs | RF-17 a RF-19 |

---

## 1. Gestión Centralizada de Formularios

### Descripción
Centralizar el diligenciamiento, envío, almacenamiento y consulta de formularios directamente dentro del portal web, eliminando la dependencia de servicios externos.

### Requerimientos Funcionales

#### RF-01: Diligenciamiento de formularios desde el portal
- Los usuarios pueden diligenciar formularios directamente desde el portal web
- Acceso vía login o código QR según configuración

#### RF-02: Almacenamiento de envíos
Cada formulario enviado debe almacenarse con:

| Campo | Descripción |
|-------|-------------|
| Contenido | Respuestas del formulario |
| Usuario | Quién diligenció |
| Fecha/Hora | Timestamp exacto |
| Área/Equipo | Asociación contextual |

#### RF-03: Panel de consulta de formularios enviados
Panel administrativo con filtros por:
- Rango de fechas
- Área
- Equipo
- Autor/Técnico
- Tipo de formulario

### Criterios de Aceptación
- [x] Usuario puede diligenciar y enviar sin salir del portal
- [x] Envíos visibles en panel administrativo
- [x] Filtros funcionales para búsqueda
- [x] Sin dependencia de servicios externos

---

## 2. Constructor Dinámico de Formularios

### Descripción
Permitir la creación, edición y configuración de formularios mediante interfaz gráfica, sin modificar código.

### Requerimientos Funcionales

#### RF-04: Constructor visual de formularios
Tipos de campos soportados:

| Tipo | Icono | Uso |
|------|-------|-----|
| Texto corto | `Aa` | Nombres, códigos |
| Texto largo | `¶` | Descripciones, observaciones |
| Numérico | `#` | Mediciones, cantidades |
| Fecha | `📅` | Fechas de intervención |
| Selección única | `○` | Estados, opciones excluyentes |
| Selección múltiple | `☑` | Componentes afectados |
| Firma digital | `✍` | Validación del técnico |
| Evidencia fotográfica | `📷` | Documentación visual |

#### RF-05: Edición de formularios existentes
- Ediciones no afectan registros históricos
- Cambios aplican solo a nuevos diligenciamientos

#### RF-06: Versionamiento de formularios
- El sistema mantiene versiones de cada formulario
- Cada envío queda asociado a su versión específica

### Criterios de Aceptación
- [x] Administrador crea formularios sin código
- [x] Edición no altera históricos
- [x] Versión identificable en cada registro

---

## 3. Administración de Formularios

### Descripción
Gestionar formularios activos sin reiniciar el sistema ni afectar la operación.

### Requerimientos Funcionales

#### RF-07: Activación y desactivación en tiempo real
```
Estado: ACTIVO ↔ INACTIVO
```
- Cambio inmediato sin reinicio
- Formulario inactivo = no disponible para diligenciar

#### RF-08: Eliminación lógica
- No borra registros históricos
- Solo impide nuevos usos

#### RF-09: Asociación de formularios
Los formularios pueden asignarse a:
- **Áreas** (Producción, Mantenimiento, etc.)
- **Tipos de equipo** (CNC, HVAC, Eléctricos)
- **Procesos específicos** (Inspección, Correctivo, Preventivo)

### Criterios de Aceptación
- [x] Gestión sin reinicio del sistema
- [x] Desactivación tiene efecto inmediato
- [x] Históricos permanecen intactos

---

## 4. Generación y Gestión de Códigos QR

### Descripción
Automatizar la generación y gestión de códigos QR para acceso rápido a formularios y equipos.

### Requerimientos Funcionales

#### RF-10: Generación automática de QR
```
Formulario creado → QR generado automáticamente
Equipo registrado → QR único asignado
```
- QR apunta al recurso correcto y activo
- Actualización automática si cambia el estado

#### RF-11: Consulta y descarga de QR
- Visualización desde panel administrativo
- Descarga en formato imagen (PNG)
- QR estable mientras el recurso esté activo

### Criterios de Aceptación
- [x] Cada formulario/equipo tiene QR único
- [x] Redirección correcta al recurso
- [x] Generación interna (sin herramientas externas)

---

## 5. Firma Digital y Trazabilidad

### Descripción
Garantizar la trazabilidad legal y operativa de las acciones realizadas por técnicos.

### Requerimientos Funcionales

#### RF-12: Firma digital del técnico
- Captura de firma en canvas táctil
- Almacenamiento junto al registro

#### RF-13: Captura de metadatos
Registro automático de:

| Metadato | Fuente |
|----------|--------|
| Fecha/Hora | Servidor (UTC) |
| Ubicación | GPS del dispositivo (opcional) |
| Usuario | Sesión autenticada |
| Dispositivo | User-Agent |

#### RF-14: Inmutabilidad del registro
> ⚠️ Una vez firmado, el registro NO puede ser modificado

### Criterios de Aceptación
- [x] Registro muestra firma + fecha + hora + ubicación
- [x] Imposible alterar formulario firmado
- [x] Registro auditable

---

## 6. Histórico por Equipo

### Descripción
Vista completa del historial de intervenciones por equipo (auditoría).

### Requerimientos Funcionales

#### RF-15: Histórico por equipo
- Todos los formularios asociados al equipo
- Orden cronológico (más reciente primero)
- Timeline visual de intervenciones

#### RF-16: Ficha del equipo
Información consolidada:

```
┌─────────────────────────────────────────┐
│ EQUIPO: Torno CNC-01                    │
├─────────────────────────────────────────┤
│ 📍 Ubicación: Nave A - Sector 1         │
│ 🔧 Estado: Operativo                    │
│ 📅 Último Mant.: 28/01/2026             │
├─────────────────────────────────────────┤
│ HISTORIAL                               │
│ • 15 intervenciones totales             │
│ • 2 fallas reportadas                   │
│ • 3 técnicos involucrados               │
├─────────────────────────────────────────┤
│ DOCUMENTOS                              │
│ • Manual de usuario (PDF)               │
│ • Certificado de calibración            │
│ • Ficha técnica                         │
└─────────────────────────────────────────┘
```

### Criterios de Aceptación
- [x] Supervisor ve historial completo del equipo
- [x] Información clara, ordenada y trazable

---

## 7. Analítica y Estadísticas

### Descripción
Información estratégica para supervisores mediante indicadores y tendencias.

### Requerimientos Funcionales

#### RF-17: Tendencias de fallas
Identificación de:
- Tipos de fallas más frecuentes
- Periodos con mayor incidencia
- Patrones estacionales

#### RF-18: Equipos más intervenidos
Ranking de equipos por:
- Número de intervenciones
- Horas de mantenimiento
- Costos acumulados

#### RF-19: Dashboard de supervisor
KPIs principales:

| Indicador | Descripción |
|-----------|-------------|
| **Disponibilidad** | % de tiempo operativo |
| **MTBF** | Tiempo medio entre fallas |
| **MTTR** | Tiempo medio de reparación |
| **Formularios/Periodo** | Actividad de diligenciamiento |
| **Técnicos Activos** | Productividad del equipo |
| **Equipos Críticos** | Requieren atención prioritaria |

### Criterios de Aceptación
- [x] Métricas visibles sin exportar datos
- [x] Actualización automática
- [x] Información clara y accionable

---

## Estado de Implementación

### Fase 1 (Completada) - UI Mockup

| Página | Ruta | Estado |
|--------|------|--------|
| Landing | `/` | ✅ |
| Login | `/login` | ✅ |
| Dashboard | `/dashboard` | ✅ |
| Formularios | `/formularios` | ✅ |
| Constructor | `/formularios/constructor` | ✅ |
| Admin Forms | `/formularios/admin` | ✅ |
| Llenar Form | `/formularios/llenar/[id]` | ✅ |
| Equipos | `/equipos` | ✅ |
| Detalle Equipo | `/equipos/[id]` | ✅ |
| Nuevo Equipo | `/equipos/nuevo` | ✅ |
| Códigos QR | `/qr-codes` | ✅ |
| Analíticas | `/analiticas` | ✅ |
| Usuarios | `/usuarios` | ✅ |
| Contratistas | `/contratistas` | ✅ |
| Configuración | `/configuracion` | ✅ |

### Fase 2 (Pendiente) - Backend

| Componente | Tecnología Sugerida | Estado |
|------------|---------------------|--------|
| Base de datos | PostgreSQL / Supabase | ⏳ |
| Autenticación | NextAuth / Clerk | ⏳ |
| API Routes | Next.js API | ⏳ |
| ORM | Prisma / Drizzle | ⏳ |
| Storage | S3 / Cloudinary | ⏳ |
| Testing | Vitest + Playwright | ⏳ |

---

## Notas Técnicas

### Stack Actual
- **Framework**: Next.js 16 + React 19
- **Styling**: Tailwind CSS 4 (OKLCH)
- **Components**: shadcn/ui
- **Icons**: Phosphor Icons
- **Charts**: Recharts
- **QR**: qrcode.react
- **Signatures**: react-signature-canvas
- **DnD**: @dnd-kit

### Convenciones
- UI en español
- Formato: Biome (tabs, double quotes, no semicolons)
- Path alias: `@/*`
