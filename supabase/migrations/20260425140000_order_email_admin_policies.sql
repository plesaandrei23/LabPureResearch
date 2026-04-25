-- Add shipping_email to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_email text;

-- Admin policies (read + update all orders)
CREATE POLICY "Admin vede toate comenzile"
  ON public.orders FOR SELECT
  USING ((auth.jwt() ->> 'email') = 'infopeptideresearch@gmail.com');

CREATE POLICY "Admin actualizeaza comenzi"
  ON public.orders FOR UPDATE
  USING ((auth.jwt() ->> 'email') = 'infopeptideresearch@gmail.com');

CREATE POLICY "Admin vede toate articolele"
  ON public.order_items FOR SELECT
  USING ((auth.jwt() ->> 'email') = 'infopeptideresearch@gmail.com');
