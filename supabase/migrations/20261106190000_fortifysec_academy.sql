INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'academy-videos',
  'academy-videos',
  false,
  52428800,
  ARRAY['video/mp4', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;
