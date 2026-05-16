-- =============================================================================
--  PeptideResearch.ro — BASELINE SETUP
--  =====================================
--  Run this ONCE in Supabase SQL Editor to bring your database up to date.
--  It is fully idempotent: safe to re-run any time.
--
--  What this guarantees:
--   ✓ All tables exist (products, profiles, orders, order_items)
--   ✓ shipping_email column on orders
--   ✓ Auto-create profile trigger on new auth.users
--   ✓ Product-images storage bucket + public read
--   ✓ Row-Level Security enabled on every public table
--   ✓ All policies (user-own, guest checkout, admin)
--   ✓ All CHECK constraints (server-side validation)
--   ✓ Time-windowed guest order_items insert (10-minute window)
--   ✓ check_order_ownership() function
--
--  When to run:
--   - First time setting up the database.
--   - When `npx supabase db push` fails or you can't use the CLI.
--   - When you suspect a migration didn't apply.
--   - After cloning the repo to a fresh Supabase project.
--
--  After running, the bottom of this file SELECTs a verification row
--  so you can confirm every constraint/policy/column is present.
-- =============================================================================


-- ─── PRODUCTS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  slug         text NOT NULL UNIQUE,
  description  text,
  short_desc   text,
  purity       text,
  price        numeric(10,2) NOT NULL DEFAULT 0,
  stock        integer NOT NULL DEFAULT 0,
  category     text,
  image_url    text,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ─── PROFILES (extends auth.users) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  phone       text,
  address     text,
  city        text,
  county      text,
  postal_code text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─── ORDERS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status           text NOT NULL DEFAULT 'in_asteptare'
                     CHECK (status IN ('in_asteptare','confirmata','expediata','livrata','anulata')),
  total_amount     numeric(10,2) NOT NULL DEFAULT 0,
  shipping_name    text,
  shipping_address text,
  shipping_city    text,
  shipping_county  text,
  shipping_postal  text,
  shipping_phone   text,
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Added later — guarantee shipping_email exists
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_email text;

-- ─── ORDER ITEMS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id   uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity     integer NOT NULL CHECK (quantity > 0),
  unit_price   numeric(10,2) NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ─── ROW LEVEL SECURITY: enable on every public table ────────────────────────
ALTER TABLE public.products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ─── SECURITY DEFINER helper for guest/auth order ownership ──────────────────
--  Used by the order_items INSERT policy. Adds a 10-minute window so an
--  attacker can't attach items to an old/hijacked guest order.
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

-- =============================================================================
--  POLICIES (drop-and-recreate so this script is idempotent)
-- =============================================================================

-- ─── PRODUCTS ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Produse vizibile public"  ON public.products;
DROP POLICY IF EXISTS "Admin vede toate produsele" ON public.products;
DROP POLICY IF EXISTS "Admin modifica produse"   ON public.products;

CREATE POLICY "Produse vizibile public"
  ON public.products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin vede toate produsele"
  ON public.products FOR SELECT
  USING ((auth.jwt() ->> 'email') = 'infopeptideresearch@gmail.com');

CREATE POLICY "Admin modifica produse"
  ON public.products FOR ALL
  USING ((auth.jwt() ->> 'email') = 'infopeptideresearch@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'infopeptideresearch@gmail.com');

-- ─── PROFILES ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Profil propriu" ON public.profiles;

CREATE POLICY "Profil propriu"
  ON public.profiles FOR ALL
  USING (auth.uid() = id);

-- ─── ORDERS ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Comenzi proprii – citire"  ON public.orders;
DROP POLICY IF EXISTS "Comenzi proprii – creare"  ON public.orders;
DROP POLICY IF EXISTS "Comenzi – creare"          ON public.orders;
DROP POLICY IF EXISTS "Creare comanda (inclusiv guest)" ON public.orders;
DROP POLICY IF EXISTS "Admin vede toate comenzile" ON public.orders;
DROP POLICY IF EXISTS "Admin actualizeaza comenzi" ON public.orders;

CREATE POLICY "Comenzi proprii – citire"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Creare comanda (inclusiv guest)"
  ON public.orders FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND user_id IS NULL)
  );

CREATE POLICY "Admin vede toate comenzile"
  ON public.orders FOR SELECT
  USING ((auth.jwt() ->> 'email') = 'infopeptideresearch@gmail.com');

CREATE POLICY "Admin actualizeaza comenzi"
  ON public.orders FOR UPDATE
  USING ((auth.jwt() ->> 'email') = 'infopeptideresearch@gmail.com');

-- ─── ORDER ITEMS ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Articole comenzi proprii"        ON public.order_items;
DROP POLICY IF EXISTS "Creare articole comenzi proprii" ON public.order_items;
DROP POLICY IF EXISTS "Creare articole comenzi"         ON public.order_items;
DROP POLICY IF EXISTS "Creare articole comanda (inclusiv guest)" ON public.order_items;
DROP POLICY IF EXISTS "Admin vede toate articolele"     ON public.order_items;

CREATE POLICY "Articole comenzi proprii"
  ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id AND o.user_id = auth.uid()
  ));

CREATE POLICY "Creare articole comenzi"
  ON public.order_items FOR INSERT
  WITH CHECK (public.check_order_ownership(order_id));

CREATE POLICY "Admin vede toate articolele"
  ON public.order_items FOR SELECT
  USING ((auth.jwt() ->> 'email') = 'infopeptideresearch@gmail.com');

-- =============================================================================
--  STORAGE: product images bucket (public read, admin upload)
-- =============================================================================
INSERT INTO storage.buckets (id, name, public)
  VALUES ('product-images', 'product-images', true)
  ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read product images"   ON storage.objects;
DROP POLICY IF EXISTS "Admin upload product images"  ON storage.objects;

CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admin upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND (auth.jwt() ->> 'email') = 'infopeptideresearch@gmail.com'
  );

-- =============================================================================
--  CHECK CONSTRAINTS — server-side validation (idempotent via DO blocks)
-- =============================================================================
DO $$
BEGIN
  -- orders
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

  -- order_items
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


-- =============================================================================
--  VERIFICATION — should return all GREEN (✓) rows.
--  If anything is missing, the corresponding row will say MISSING (✗).
-- =============================================================================
SELECT
  'tables'        AS area,
  COUNT(*) FILTER (WHERE table_name = 'products')    AS products,
  COUNT(*) FILTER (WHERE table_name = 'profiles')    AS profiles,
  COUNT(*) FILTER (WHERE table_name = 'orders')      AS orders,
  COUNT(*) FILTER (WHERE table_name = 'order_items') AS order_items
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('products','profiles','orders','order_items');

SELECT
  'orders.shipping_email column' AS check,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='orders' AND column_name='shipping_email'
  ) THEN '✓' ELSE '✗ MISSING' END AS status;

SELECT
  conname AS constraint_name,
  '✓ present' AS status
FROM pg_constraint
WHERE conname IN (
  'orders_total_nonneg','orders_total_max','orders_name_len','orders_email_shape',
  'orders_email_len','orders_phone_len','orders_address_len','orders_city_len',
  'orders_county_len','orders_postal_shape','orders_notes_len',
  'order_items_qty_max','order_items_unit_price_nonneg','order_items_unit_price_max',
  'order_items_name_len'
)
ORDER BY conname;

SELECT
  pol.polname AS policy,
  cls.relname AS table_name,
  '✓ present' AS status
FROM pg_policy pol
JOIN pg_class cls ON cls.oid = pol.polrelid
WHERE cls.relname IN ('products','profiles','orders','order_items')
  AND cls.relnamespace = 'public'::regnamespace
ORDER BY cls.relname, pol.polname;

SELECT
  'check_order_ownership() function' AS check,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'check_order_ownership'
  ) THEN '✓' ELSE '✗ MISSING' END AS status;

SELECT
  'product-images storage bucket' AS check,
  CASE WHEN EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'product-images'
  ) THEN '✓' ELSE '✗ MISSING' END AS status;
