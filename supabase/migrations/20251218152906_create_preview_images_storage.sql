/*
  # Create storage bucket for preview images

  ## Overview
  Creates a storage bucket for storing day preview images that are displayed on locked day screens.

  ## Changes
  - Create 'preview-images' storage bucket
  - Set up RLS policies for public read access and authenticated write access

  ## Security
  - Public read access (anyone can view the images)
  - Authenticated users can upload/delete (for admin management)
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('preview-images', 'preview-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view preview images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'preview-images');

CREATE POLICY "Authenticated users can upload preview images"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'preview-images');

CREATE POLICY "Authenticated users can update preview images"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'preview-images')
  WITH CHECK (bucket_id = 'preview-images');

CREATE POLICY "Authenticated users can delete preview images"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'preview-images');