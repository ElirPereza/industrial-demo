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
