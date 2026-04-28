-- Admin can see all products (including inactive)
CREATE POLICY "Admin vede toate produsele"
  ON public.products FOR SELECT
  USING ((auth.jwt() ->> 'email') = 'infopeptideresearch@gmail.com');

-- Admin can create, update, delete products
CREATE POLICY "Admin modifica produse"
  ON public.products FOR ALL
  USING ((auth.jwt() ->> 'email') = 'infopeptideresearch@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'infopeptideresearch@gmail.com');

-- Storage bucket for product images (public read)
INSERT INTO storage.buckets (id, name, public)
  VALUES ('product-images', 'product-images', true)
  ON CONFLICT DO NOTHING;

CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admin upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND (auth.jwt() ->> 'email') = 'infopeptideresearch@gmail.com'
  );

CREATE POLICY "Admin update product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND (auth.jwt() ->> 'email') = 'infopeptideresearch@gmail.com'
  );

CREATE POLICY "Admin delete product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND (auth.jwt() ->> 'email') = 'infopeptideresearch@gmail.com'
  );
