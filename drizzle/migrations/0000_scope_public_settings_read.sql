DROP POLICY IF EXISTS "Public can view settings" ON public.settings;
CREATE POLICY "Public can view settings" ON public.settings
  FOR SELECT TO anon, authenticated
  USING (id = 'default');