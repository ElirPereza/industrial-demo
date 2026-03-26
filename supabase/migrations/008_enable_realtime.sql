-- Migration 008: Enable Realtime for dashboard subscriptions

-- Enable Realtime on tables used by the dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE envios_formularios;
ALTER PUBLICATION supabase_realtime ADD TABLE registros_mantenimiento;
