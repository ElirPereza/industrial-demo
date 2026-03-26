-- Migration 002: Create all 11 tables
-- Requires: 001_create_enums.sql

-- 1. User profiles (extends auth.users)
CREATE TABLE perfiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  rol app_role NOT NULL DEFAULT 'tecnico',
  departamento TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Equipment
CREATE TABLE equipos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  tipo tipo_equipo NOT NULL,
  ubicacion TEXT NOT NULL,
  estado estado_equipo NOT NULL DEFAULT 'operativo',
  ultimo_mantenimiento TIMESTAMPTZ,
  proximo_mantenimiento TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Form templates
CREATE TABLE formularios_template (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  tipo tipo_formulario NOT NULL,
  version INT NOT NULL DEFAULT 1,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  frecuencia frecuencia_form,
  asociacion_tipo tipo_asociacion NOT NULL DEFAULT 'general',
  asociacion_valor TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Form fields
CREATE TABLE campos_formulario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formulario_id UUID NOT NULL REFERENCES formularios_template(id) ON DELETE CASCADE,
  tipo tipo_campo NOT NULL,
  label TEXT NOT NULL,
  placeholder TEXT NOT NULL DEFAULT '',
  requerido BOOLEAN NOT NULL DEFAULT FALSE,
  opciones JSONB,
  orden INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Form submissions
CREATE TABLE envios_formularios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formulario_id UUID NOT NULL REFERENCES formularios_template(id),
  equipo_id UUID NOT NULL REFERENCES equipos(id),
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  version_formulario INT NOT NULL,
  respuestas JSONB NOT NULL DEFAULT '[]',
  estado estado_envio NOT NULL DEFAULT 'completado',
  firmado BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Maintenance records
CREATE TABLE registros_mantenimiento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipo_id UUID NOT NULL REFERENCES equipos(id),
  tipo tipo_formulario NOT NULL,
  descripcion TEXT NOT NULL,
  tecnico_id UUID NOT NULL REFERENCES auth.users(id),
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ,
  horas_empleadas NUMERIC(6,2) NOT NULL DEFAULT 0,
  costo NUMERIC(10,2) NOT NULL DEFAULT 0,
  estado estado_mantenimiento NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Equipment documents
CREATE TABLE documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipo_id UUID NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  tipo tipo_documento NOT NULL,
  tamano TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Equipment images
CREATE TABLE imagenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipo_id UUID NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  titulo TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Contractors
CREATE TABLE contratistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  contacto TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  especialidad TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'activo',
  calificacion NUMERIC(2,1) NOT NULL DEFAULT 0,
  trabajos_completados INT NOT NULL DEFAULT 0,
  contrato_vigente DATE,
  nit TEXT,
  direccion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Equipment activity timeline
CREATE TABLE actividades_equipo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipo_id UUID NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  tipo tipo_actividad NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  detalles JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Form version snapshots
CREATE TABLE formularios_version (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formulario_id UUID NOT NULL REFERENCES formularios_template(id) ON DELETE CASCADE,
  schema_snapshot JSONB NOT NULL,
  version INT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(formulario_id, version)
);
