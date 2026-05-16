-- ============================================================
--  Security hardening (May 2026)
--  - Server-side CHECK constraints on orders so client-side
--    validation cannot be bypassed via the anon API key.
--  - Tightened order_items INSERT policy: anonymous (guest)
--    inserts must reference an order created within the last
--    10 minutes — prevents attaching items to old / hijacked
--    guest orders even though UUIDs are unguessable.
-- ============================================================

-- ─── ORDERS: defensive CHECKs ───────────────────────────────
ALTER TABLE public.orders
  ADD CONSTRAINT IF NOT EXISTS orders_total_nonneg
    CHECK (total_amount >= 0);

ALTER TABLE public.orders
  ADD CONSTRAINT IF NOT EXISTS orders_total_max
    CHECK (total_amount <= 1000000);

ALTER TABLE public.orders
  ADD CONSTRAINT IF NOT EXISTS orders_name_len
    CHECK (shipping_name IS NULL OR char_length(shipping_name) BETWEEN 1 AND 200);

ALTER TABLE public.orders
  ADD CONSTRAINT IF NOT EXISTS orders_email_shape
    CHECK (shipping_email IS NULL OR shipping_email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$');

ALTER TABLE public.orders
  ADD CONSTRAINT IF NOT EXISTS orders_email_len
    CHECK (shipping_email IS NULL OR char_length(shipping_email) <= 254);

ALTER TABLE public.orders
  ADD CONSTRAINT IF NOT EXISTS orders_phone_len
    CHECK (shipping_phone IS NULL OR char_length(shipping_phone) BETWEEN 5 AND 30);

ALTER TABLE public.orders
  ADD CONSTRAINT IF NOT EXISTS orders_address_len
    CHECK (shipping_address IS NULL OR char_length(shipping_address) BETWEEN 1 AND 300);

ALTER TABLE public.orders
  ADD CONSTRAINT IF NOT EXISTS orders_city_len
    CHECK (shipping_city IS NULL OR char_length(shipping_city) BETWEEN 1 AND 100);

ALTER TABLE public.orders
  ADD CONSTRAINT IF NOT EXISTS orders_county_len
    CHECK (shipping_county IS NULL OR char_length(shipping_county) BETWEEN 1 AND 100);

ALTER TABLE public.orders
  ADD CONSTRAINT IF NOT EXISTS orders_postal_shape
    CHECK (shipping_postal IS NULL OR shipping_postal ~ '^[0-9A-Za-z\- ]{3,16}$');

ALTER TABLE public.orders
  ADD CONSTRAINT IF NOT EXISTS orders_notes_len
    CHECK (notes IS NULL OR char_length(notes) <= 2000);

-- ─── ORDER ITEMS: defensive CHECKs ──────────────────────────
ALTER TABLE public.order_items
  ADD CONSTRAINT IF NOT EXISTS order_items_qty_max
    CHECK (quantity <= 1000);

ALTER TABLE public.order_items
  ADD CONSTRAINT IF NOT EXISTS order_items_unit_price_nonneg
    CHECK (unit_price >= 0);

ALTER TABLE public.order_items
  ADD CONSTRAINT IF NOT EXISTS order_items_unit_price_max
    CHECK (unit_price <= 1000000);

ALTER TABLE public.order_items
  ADD CONSTRAINT IF NOT EXISTS order_items_name_len
    CHECK (char_length(product_name) BETWEEN 1 AND 200);

-- ─── ORDER ITEMS: time-windowed INSERT policy ───────────────
-- Replace the existing ownership check with one that ALSO requires
-- the parent order to have been created in the last 10 minutes.
-- This narrows the window for attaching items to other orders.
CREATE OR REPLACE FUNCTION public.check_order_ownership(p_order_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = p_order_id
      AND created_at > now() - interval '10 minutes'
      AND (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
        (auth.uid() IS NULL   AND user_id IS NULL)
      )
  );
$$;
