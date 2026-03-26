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
