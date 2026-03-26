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
