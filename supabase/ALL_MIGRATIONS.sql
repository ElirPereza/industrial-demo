-- ============================================================
-- INDUSTRIAL PORTAL - COMPLETE DATABASE SETUP
-- Paste this ENTIRE file into the Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/spfhqgdaqohqnkvwllhf/sql/new
-- ============================================================

-- ============================================================
-- 001_create_enums.sql
-- ============================================================
-- Migration 001: Create all PostgreSQL enums
-- Run this FIRST before any table creation

-- User roles
CREATE TYPE app_role AS ENUM ('admin', 'supervisor', 'tecnico');

-- Equipment status
CREATE TYPE estado_equipo AS ENUM ('operativo', 'mantenimiento', 'fuera_servicio');

-- Equipment type
CREATE TYPE tipo_equipo AS ENUM ('maquinaria_pesada', 'linea_produccion', 'electricos', 'hvac');

-- Form type
CREATE TYPE tipo_formulario AS ENUM ('inspeccion', 'reporte_fallas', 'preventivo', 'correctivo');

-- Form field type
CREATE TYPE tipo_campo AS ENUM (
  'texto_corto',
  'texto_largo',
  'numerico',
  'fecha',
  'seleccion_unica',
  'seleccion_multiple',
  'firma',
  'foto'
);

-- Form submission status
CREATE TYPE estado_envio AS ENUM ('completado', 'pendiente', 'rechazado');

-- Maintenance record status
CREATE TYPE estado_mantenimiento AS ENUM ('completado', 'en_progreso', 'pendiente');

-- Form-to-equipment association type
CREATE TYPE tipo_asociacion AS ENUM ('equipo', 'tipo_equipo', 'area', 'general');

-- Form frequency
CREATE TYPE frecuencia_form AS ENUM ('diario', 'semanal', 'mensual', 'trimestral', 'eventual');

-- Equipment activity type
CREATE TYPE tipo_actividad AS ENUM ('mantenimiento', 'inspeccion', 'falla', 'documento', 'modificacion');

-- Document type
CREATE TYPE tipo_documento AS ENUM ('pdf', 'doc', 'img');


-- ============================================================
-- 002_create_tables.sql
-- ============================================================
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


-- ============================================================
-- 003_create_indexes.sql
-- ============================================================
-- Migration 003: Create indexes for performance

-- envios_formularios indexes
CREATE INDEX idx_envios_formulario_id ON envios_formularios(formulario_id);
CREATE INDEX idx_envios_equipo_id ON envios_formularios(equipo_id);
CREATE INDEX idx_envios_usuario_id ON envios_formularios(usuario_id);
CREATE INDEX idx_envios_created_at ON envios_formularios(created_at DESC);

-- campos_formulario indexes
CREATE INDEX idx_campos_formulario_id ON campos_formulario(formulario_id);
CREATE INDEX idx_campos_orden ON campos_formulario(formulario_id, orden);

-- registros_mantenimiento indexes
CREATE INDEX idx_registros_equipo_id ON registros_mantenimiento(equipo_id);
CREATE INDEX idx_registros_tecnico_id ON registros_mantenimiento(tecnico_id);
CREATE INDEX idx_registros_fecha ON registros_mantenimiento(fecha_inicio DESC);

-- actividades_equipo indexes
CREATE INDEX idx_actividades_equipo_id ON actividades_equipo(equipo_id);
CREATE INDEX idx_actividades_created_at ON actividades_equipo(created_at DESC);

-- documentos indexes
CREATE INDEX idx_documentos_equipo_id ON documentos(equipo_id);

-- imagenes indexes
CREATE INDEX idx_imagenes_equipo_id ON imagenes(equipo_id);

-- formularios_template indexes
CREATE INDEX idx_formularios_activo ON formularios_template(activo);
CREATE INDEX idx_formularios_tipo ON formularios_template(tipo);
CREATE INDEX idx_formularios_asociacion ON formularios_template(asociacion_tipo, asociacion_valor);

-- perfiles indexes
CREATE INDEX idx_perfiles_user_id ON perfiles(user_id);
CREATE INDEX idx_perfiles_rol ON perfiles(rol);


-- ============================================================
-- 004_create_triggers.sql
-- ============================================================
-- Migration 004: Create triggers

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_perfiles_updated_at
  BEFORE UPDATE ON perfiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipos_updated_at
  BEFORE UPDATE ON equipos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_formularios_updated_at
  BEFORE UPDATE ON formularios_template
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contratistas_updated_at
  BEFORE UPDATE ON contratistas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Prevent updates to signed form submissions (RF-14 immutability)
CREATE OR REPLACE FUNCTION prevent_signed_submission_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.firmado = TRUE THEN
    RAISE EXCEPTION 'Signed submissions cannot be modified';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_signed_update
  BEFORE UPDATE ON envios_formularios
  FOR EACH ROW EXECUTE FUNCTION prevent_signed_submission_update();

-- Auto-create perfil when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO perfiles (user_id, nombre, email, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_app_meta_data->>'role')::app_role, 'tecnico')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- 005_create_functions.sql
-- ============================================================
-- Migration 005: Create helper functions for RLS

-- Get current user's role from perfiles table
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS app_role AS $$
  SELECT rol FROM perfiles WHERE user_id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '';

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT (SELECT user_role()) = 'admin'::app_role
$$ LANGUAGE sql STABLE;

-- Check if current user is admin or supervisor
CREATE OR REPLACE FUNCTION public.is_admin_or_supervisor()
RETURNS BOOLEAN AS $$
  SELECT (SELECT user_role()) IN ('admin'::app_role, 'supervisor'::app_role)
$$ LANGUAGE sql STABLE;


-- ============================================================
-- 006_enable_rls.sql
-- ============================================================
-- Migration 006: Enable RLS and create policies for all tables

-- Enable RLS on all tables
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE formularios_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE campos_formulario ENABLE ROW LEVEL SECURITY;
ALTER TABLE envios_formularios ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_mantenimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE imagenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades_equipo ENABLE ROW LEVEL SECURITY;
ALTER TABLE formularios_version ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PERFILES policies
-- ============================================================
CREATE POLICY "Users can view own profile"
  ON perfiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can update own profile"
  ON perfiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert profiles"
  ON perfiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- EQUIPOS policies
-- ============================================================
CREATE POLICY "All authenticated can view equipos"
  ON equipos FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "Admin and supervisor can insert equipos"
  ON equipos FOR INSERT TO authenticated
  WITH CHECK (is_admin_or_supervisor());

CREATE POLICY "Admin and supervisor can update equipos"
  ON equipos FOR UPDATE TO authenticated
  USING (is_admin_or_supervisor());

CREATE POLICY "Admin can delete equipos"
  ON equipos FOR DELETE TO authenticated
  USING (is_admin());

-- ============================================================
-- FORMULARIOS_TEMPLATE policies
-- ============================================================
CREATE POLICY "All authenticated can view active formularios"
  ON formularios_template FOR SELECT TO authenticated
  USING (activo = TRUE OR is_admin_or_supervisor());

CREATE POLICY "Admin can full CRUD formularios"
  ON formularios_template FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- CAMPOS_FORMULARIO policies (follows parent)
-- ============================================================
CREATE POLICY "All authenticated can view campos"
  ON campos_formulario FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM formularios_template ft
      WHERE ft.id = formulario_id
      AND (ft.activo = TRUE OR is_admin_or_supervisor())
    )
  );

CREATE POLICY "Admin can manage campos"
  ON campos_formulario FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- ENVIOS_FORMULARIOS policies
-- ============================================================
CREATE POLICY "Users can view own envios, admins/supervisors see all"
  ON envios_formularios FOR SELECT TO authenticated
  USING (
    auth.uid() = usuario_id
    OR is_admin_or_supervisor()
  );

CREATE POLICY "Authenticated users can submit forms"
  ON envios_formularios FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = usuario_id
    AND EXISTS (
      SELECT 1 FROM formularios_template ft
      WHERE ft.id = formulario_id AND ft.activo = TRUE
    )
  );

-- No UPDATE policy — signed submissions are immutable (enforced by trigger)
-- No DELETE policy — submissions are permanent audit records

-- ============================================================
-- REGISTROS_MANTENIMIENTO policies
-- ============================================================
CREATE POLICY "All authenticated can view registros"
  ON registros_mantenimiento FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "Authenticated users can create registros"
  ON registros_mantenimiento FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = tecnico_id);

CREATE POLICY "Admin and supervisor can update registros"
  ON registros_mantenimiento FOR UPDATE TO authenticated
  USING (is_admin_or_supervisor());

-- ============================================================
-- DOCUMENTOS policies
-- ============================================================
CREATE POLICY "All authenticated can view documentos"
  ON documentos FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "Admin can manage documentos"
  ON documentos FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- IMAGENES policies
-- ============================================================
CREATE POLICY "All authenticated can view imagenes"
  ON imagenes FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "Admin can manage imagenes"
  ON imagenes FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- CONTRATISTAS policies
-- ============================================================
CREATE POLICY "Admin can full CRUD contratistas"
  ON contratistas FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Supervisor can view contratistas"
  ON contratistas FOR SELECT TO authenticated
  USING (is_admin_or_supervisor());

-- ============================================================
-- ACTIVIDADES_EQUIPO policies
-- ============================================================
CREATE POLICY "All authenticated can view actividades"
  ON actividades_equipo FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "Authenticated users can create actividades"
  ON actividades_equipo FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = usuario_id);

-- ============================================================
-- FORMULARIOS_VERSION policies
-- ============================================================
CREATE POLICY "All authenticated can view versions"
  ON formularios_version FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "Admin can create versions"
  ON formularios_version FOR INSERT TO authenticated
  WITH CHECK (is_admin());


-- ============================================================
-- 007_create_storage.sql
-- ============================================================
-- Migration 007: Create storage buckets and policies

-- Create buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('equipment-images', 'equipment-images', TRUE),
  ('equipment-documents', 'equipment-documents', FALSE),
  ('form-signatures', 'form-signatures', FALSE),
  ('form-photos', 'form-photos', FALSE);

-- ============================================================
-- equipment-images (public bucket)
-- ============================================================
CREATE POLICY "Public can view equipment images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'equipment-images');

CREATE POLICY "Admin can upload equipment images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'equipment-images'
    AND is_admin()
  );

CREATE POLICY "Admin can delete equipment images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'equipment-images'
    AND is_admin()
  );

-- ============================================================
-- equipment-documents (private bucket)
-- ============================================================
CREATE POLICY "Authenticated can view equipment documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'equipment-documents');

CREATE POLICY "Admin can upload equipment documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'equipment-documents'
    AND is_admin()
  );

-- ============================================================
-- form-signatures (private bucket)
-- ============================================================
CREATE POLICY "Users can upload own signatures"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'form-signatures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admin and supervisor can view all signatures"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'form-signatures'
    AND is_admin_or_supervisor()
  );

CREATE POLICY "Users can view own signatures"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'form-signatures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- form-photos (private bucket)
-- ============================================================
CREATE POLICY "Users can upload own form photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'form-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admin and supervisor can view all form photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'form-photos'
    AND is_admin_or_supervisor()
  );

CREATE POLICY "Users can view own form photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'form-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


-- ============================================================
-- 008_enable_realtime.sql
-- ============================================================
-- Migration 008: Enable Realtime for dashboard subscriptions

-- Enable Realtime on tables used by the dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE envios_formularios;
ALTER PUBLICATION supabase_realtime ADD TABLE registros_mantenimiento;


