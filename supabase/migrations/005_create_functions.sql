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
