-- SECURITY DEFINER function bypasses orders SELECT RLS when checking ownership.
-- Safe: function itself enforces the correct ownership logic.
CREATE OR REPLACE FUNCTION public.check_order_ownership(p_order_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = p_order_id
      AND (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
        (auth.uid() IS NULL   AND user_id IS NULL)
      )
  );
$$;

DROP POLICY IF EXISTS "Creare articole comenzi proprii" ON public.order_items;
CREATE POLICY "Creare articole comenzi"
  ON public.order_items FOR INSERT
  WITH CHECK (check_order_ownership(order_id));
