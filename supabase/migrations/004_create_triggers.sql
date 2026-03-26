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
