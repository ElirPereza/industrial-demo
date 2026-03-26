-- Seed data for Industrial Portal demo
-- Run AFTER all migrations (001-008)
-- Creates 3 demo users + sample data

-- NOTE: Users must be created via Supabase Auth Admin API, not SQL directly.
-- Use the Supabase Dashboard or the following curl commands:

-- Admin user: admin@industrial-portal.com / admin123456
-- Supervisor user: supervisor@industrial-portal.com / supervisor123456
-- Tecnico user: tecnico@industrial-portal.com / tecnico123456

-- After creating users via Auth, their perfiles will be auto-created by the trigger.
-- Then update their roles:
-- UPDATE perfiles SET rol = 'admin' WHERE email = 'admin@industrial-portal.com';
-- UPDATE perfiles SET rol = 'supervisor' WHERE email = 'supervisor@industrial-portal.com';
-- UPDATE perfiles SET rol = 'tecnico' WHERE email = 'tecnico@industrial-portal.com';

-- ============================================================
-- EQUIPOS (16 pieces of equipment)
-- ============================================================
INSERT INTO equipos (nombre, tipo, ubicacion, estado, ultimo_mantenimiento, proximo_mantenimiento) VALUES
  ('Torno CNC-01', 'maquinaria_pesada', 'Nave A - Sector 1', 'operativo', NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days'),
  ('Torno CNC-02', 'maquinaria_pesada', 'Nave A - Sector 1', 'operativo', NOW() - INTERVAL '30 days', NOW() + INTERVAL '30 days'),
  ('Fresadora-01', 'maquinaria_pesada', 'Nave A - Sector 2', 'operativo', NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days'),
  ('Fresadora-02', 'maquinaria_pesada', 'Nave A - Sector 2', 'mantenimiento', NOW() - INTERVAL '5 days', NOW() + INTERVAL '5 days'),
  ('Prensa Hidráulica-01', 'maquinaria_pesada', 'Nave B - Sector 1', 'operativo', NOW() - INTERVAL '20 days', NOW() + INTERVAL '10 days'),
  ('Prensa Hidráulica-02', 'maquinaria_pesada', 'Nave B - Sector 1', 'operativo', NOW() - INTERVAL '25 days', NOW() + INTERVAL '5 days'),
  ('Línea Ensamblaje-01', 'linea_produccion', 'Nave B - Sector 2', 'operativo', NOW() - INTERVAL '7 days', NOW() + INTERVAL '23 days'),
  ('Línea Ensamblaje-02', 'linea_produccion', 'Nave B - Sector 2', 'operativo', NOW() - INTERVAL '14 days', NOW() + INTERVAL '16 days'),
  ('Línea Pintura', 'linea_produccion', 'Nave C - Sector 1', 'fuera_servicio', NOW() - INTERVAL '60 days', NOW() + INTERVAL '7 days'),
  ('Banda Transportadora-01', 'linea_produccion', 'Nave C - Sector 1', 'operativo', NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days'),
  ('Panel Eléctrico Principal', 'electricos', 'Sala Eléctrica A', 'operativo', NOW() - INTERVAL '45 days', NOW() + INTERVAL '45 days'),
  ('Transformador-01', 'electricos', 'Sala Eléctrica A', 'operativo', NOW() - INTERVAL '90 days', NOW() + INTERVAL '90 days'),
  ('UPS Industrial', 'electricos', 'Sala Eléctrica B', 'operativo', NOW() - INTERVAL '30 days', NOW() + INTERVAL '60 days'),
  ('Compresor HVAC-01', 'hvac', 'Techo Nave A', 'operativo', NOW() - INTERVAL '20 days', NOW() + INTERVAL '40 days'),
  ('Compresor HVAC-02', 'hvac', 'Techo Nave B', 'mantenimiento', NOW() - INTERVAL '2 days', NOW() + INTERVAL '3 days'),
  ('Sistema Ventilación Central', 'hvac', 'Sala Técnica', 'operativo', NOW() - INTERVAL '15 days', NOW() + INTERVAL '45 days');

-- ============================================================
-- FORMULARIOS_TEMPLATE (4 form templates)
-- Note: created_by will need to be updated with real user UUIDs after seeding users
-- ============================================================
-- These will be inserted after users are created via a separate script
-- See supabase/seed-forms.sql for form templates

-- ============================================================
-- CONTRATISTAS (5 contractors)
-- ============================================================
INSERT INTO contratistas (nombre, contacto, email, telefono, especialidad, estado, calificacion, trabajos_completados, contrato_vigente, nit) VALUES
  ('TechServ S.A.S.', 'Juan Pérez', 'juan@techserv.com', '+57 300 123 4567', 'Mantenimiento Eléctrico', 'activo', 4.5, 23, NOW() + INTERVAL '180 days', '900123456-1'),
  ('MecaIndustrial Ltda.', 'María García', 'maria@mecaindustrial.com', '+57 310 234 5678', 'Mecánica Industrial', 'activo', 4.8, 45, NOW() + INTERVAL '90 days', '800234567-2'),
  ('HydroTech Colombia', 'Carlos López', 'carlos@hydrotech.co', '+57 320 345 6789', 'Sistemas Hidráulicos', 'activo', 4.2, 12, NOW() + INTERVAL '60 days', '700345678-3'),
  ('HVAC Solutions', 'Ana Martínez', 'ana@hvacsolutions.com', '+57 315 456 7890', 'Climatización y HVAC', 'activo', 4.7, 31, NOW() - INTERVAL '30 days', '600456789-4'),
  ('AutoControl S.A.', 'Pedro Rodríguez', 'pedro@autocontrol.com', '+57 318 567 8901', 'Automatización Industrial', 'inactivo', 3.9, 8, NOW() - INTERVAL '60 days', '500567890-5');
