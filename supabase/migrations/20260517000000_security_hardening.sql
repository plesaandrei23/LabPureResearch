-- ============================================================
--  Security hardening (May 2026)
--  - Server-side CHECK constraints on orders so client-side
--    validation cannot be bypassed via the anon API key.
--  - Tightened order_items INSERT policy: anonymous (guest)
--    inserts must reference an order created within the last
--    10 minutes — prevents attaching items to old / hijacked
--    guest orders even though UUIDs are unguessable.
--
--  Wrapped in DO blocks because PostgreSQL does NOT support
--  `ADD CONSTRAINT IF NOT EXISTS` — only `ADD COLUMN IF NOT EXISTS`.
--  This way the migration is idempotent and safe to re-run.
-- ============================================================

DO $$
BEGIN
  -- ─── ORDERS: defensive CHECKs ───────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_total_nonneg') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_total_nonneg CHECK (total_amount >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_total_max') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_total_max CHECK (total_amount <= 1000000);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_name_len') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_name_len
      CHECK (shipping_name IS NULL OR char_length(shipping_name) BETWEEN 1 AND 200);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_email_shape') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_email_shape
      CHECK (shipping_email IS NULL OR shipping_email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_email_len') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_email_len
      CHECK (shipping_email IS NULL OR char_length(shipping_email) <= 254);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_phone_len') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_phone_len
      CHECK (shipping_phone IS NULL OR char_length(shipping_phone) BETWEEN 5 AND 30);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_address_len') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_address_len
      CHECK (shipping_address IS NULL OR char_length(shipping_address) BETWEEN 1 AND 300);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_city_len') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_city_len
      CHECK (shipping_city IS NULL OR char_length(shipping_city) BETWEEN 1 AND 100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_county_len') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_county_len
      CHECK (shipping_county IS NULL OR char_length(shipping_county) BETWEEN 1 AND 100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_postal_shape') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_postal_shape
      CHECK (shipping_postal IS NULL OR shipping_postal ~ '^[0-9A-Za-z\- ]{3,16}$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_notes_len') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_notes_len
      CHECK (notes IS NULL OR char_length(notes) <= 2000);
  END IF;

  -- ─── ORDER ITEMS: defensive CHECKs ──────────────────────────
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_qty_max') THEN
    ALTER TABLE public.order_items ADD CONSTRAINT order_items_qty_max CHECK (quantity <= 1000);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_unit_price_nonneg') THEN
    ALTER TABLE public.order_items ADD CONSTRAINT order_items_unit_price_nonneg CHECK (unit_price >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_unit_price_max') THEN
    ALTER TABLE public.order_items ADD CONSTRAINT order_items_unit_price_max CHECK (unit_price <= 1000000);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_name_len') THEN
    ALTER TABLE public.order_items ADD CONSTRAINT order_items_name_len
      CHECK (char_length(product_name) BETWEEN 1 AND 200);
  END IF;
END $$;

-- ─── ORDER ITEMS: time-windowed INSERT policy (always replace) ───────────
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
