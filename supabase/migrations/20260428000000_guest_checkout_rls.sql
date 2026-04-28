-- Allow guest (unauthenticated) order creation with null user_id
DROP POLICY IF EXISTS "Comenzi proprii – creare" ON public.orders;

CREATE POLICY "Comenzi – creare"
  ON public.orders FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND user_id IS NULL)
  );
