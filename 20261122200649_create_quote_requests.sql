/*
# Create quote requests and private quote photo storage

1. New Tables
- `quote_requests` stores public contact and quote requests submitted through the GLANVIA website.
- `id` is a generated request identifier used to group optional uploaded photos.
- `request_type` distinguishes a quote request from a general contact message.
- `customer_type`, `services`, `property_details`, and `description` store the requested cleaning scope.
- `contact_name`, `email`, `phone`, and `preferred_contact` store the requested contact details.
- `consent` records the required privacy consent and `created_at` records submission time.
- `photo_paths` stores private Storage object paths, never public URLs.

2. Storage
- Creates the private `quote-photos` bucket.
- Restricts stored objects to JPG, PNG, and WEBP files with a maximum size of 5 MB per file.
- The public browser role cannot read or upload objects directly; the submission function stores validated files server-side.

3. Security
- Enables RLS on `quote_requests`.
- Allows anonymous and authenticated visitors to insert only consented requests.
- Adds explicit deny policies for browser reads, updates, and deletes.
- Grants the browser only INSERT access; the submission function receives the additional privileges needed to store and attach private photo paths.

4. Important notes
- No pricing, offer, or customer account data is created by this migration.
- Requests are intentionally not readable from the public website.
- The Edge Function validates the contact data, file types, file count, and file sizes before storage.
*/

CREATE TABLE IF NOT EXISTS public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type text NOT NULL DEFAULT 'quote' CHECK (request_type IN ('quote', 'contact')),
  customer_type text,
  services text[] NOT NULL DEFAULT '{}',
  property_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text NOT NULL DEFAULT '',
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text,
  preferred_contact text,
  consent boolean NOT NULL DEFAULT false,
  photo_paths text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON public.quote_requests TO anon, authenticated;
GRANT INSERT, UPDATE ON public.quote_requests TO service_role;

DROP POLICY IF EXISTS "Public can submit consented requests" ON public.quote_requests;
CREATE POLICY "Public can submit consented requests"
ON public.quote_requests FOR INSERT
TO anon, authenticated
WITH CHECK (consent = true);

DROP POLICY IF EXISTS "Public cannot read requests" ON public.quote_requests;
CREATE POLICY "Public cannot read requests"
ON public.quote_requests FOR SELECT
TO anon, authenticated
USING (false);

DROP POLICY IF EXISTS "Public cannot update requests" ON public.quote_requests;
CREATE POLICY "Public cannot update requests"
ON public.quote_requests FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "Public cannot delete requests" ON public.quote_requests;
CREATE POLICY "Public cannot delete requests"
ON public.quote_requests FOR DELETE
TO anon, authenticated
USING (false);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'quote-photos',
  'quote-photos',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::text[];
