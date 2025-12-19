/*
  # Create Storage Bucket for Banner Images

  1. New Storage Bucket
    - `banner-images` bucket for storing banner image files
    - Public access enabled for direct URL access
    - File size limit: 5MB
    - Allowed file types: image/jpeg, image/png, image/gif, image/webp

  2. Security
    - Public bucket (no authentication required for reading)
    - Authenticated users can upload/update/delete images
    - RLS policies for secure file operations
*/

-- Create the storage bucket for banner images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banner-images',
  'banner-images',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to view banner images (no auth required)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'banner-images');

-- Allow authenticated users to upload banner images
CREATE POLICY "Authenticated users can upload banner images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'banner-images');

-- Allow authenticated users to update banner images
CREATE POLICY "Authenticated users can update banner images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'banner-images');

-- Allow authenticated users to delete banner images
CREATE POLICY "Authenticated users can delete banner images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'banner-images');