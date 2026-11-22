/*
# Restrict public quote request grants

1. Changes
- Removes browser SELECT, UPDATE, and DELETE privileges from `quote_requests`.
- Keeps INSERT available to anonymous and authenticated visitors so the public forms can submit requests.
- Keeps the service role INSERT and UPDATE privileges required by the submission function to attach private photo paths.

2. Security
- Aligns table privileges with the existing deny-by-default RLS policies.
- Prevents the public browser roles from modifying or reading personal contact and property data even if a future policy is accidentally broadened.

3. Important notes
- This migration changes permissions only and does not remove or alter stored requests.
*/

REVOKE SELECT, UPDATE, DELETE ON public.quote_requests FROM anon, authenticated;
GRANT INSERT ON public.quote_requests TO anon, authenticated;
GRANT INSERT, UPDATE ON public.quote_requests TO service_role;
