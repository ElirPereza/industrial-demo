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
