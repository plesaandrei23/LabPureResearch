-- ============================================================
-- PeptideResearch.ro – Schema Supabase
-- ============================================================

-- ── PRODUCTS ─────────────────────────────────────────────────
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  name         text        not null,
  slug         text        not null unique,
  description  text,
  short_desc   text,
  purity       text,
  price        numeric(10,2) not null default 0,
  stock        integer     not null default 0,
  category     text,
  image_url    text,
  is_active    boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- seed products
insert into public.products (name, slug, short_desc, description, purity, price, stock, category) values
(
  'Klow 80mg',
  'klow-80mg',
  'Peptidă liofilizată de înaltă puritate, 80mg.',
  'Klow 80mg este o peptidă sintetică livrată sub formă de pulbere liofilizată. Puritate verificată prin HPLC. Depozitați la -20°C în ambalaj original sigilat. Exclusiv pentru cercetare în laborator.',
  '≥99.0%',
  180.00, 50, 'Peptide'
),
(
  'Retatrutida 10mg',
  'retatrutida-10mg',
  'Agonist triplu GIP/GLP-1/Glucagon, 10mg.',
  'Retatrutida este un agonist triplu al receptorilor GIP, GLP-1 și Glucagon. Disponibil în flacon de 10mg, pulbere liofilizată. Puritate verificată prin HPLC. Exclusiv pentru cercetare în laborator.',
  '≥99%',
  220.00, 40, 'Peptide'
),
(
  'Retatrutida 20mg',
  'retatrutida-20mg',
  'Agonist triplu GIP/GLP-1/Glucagon, 20mg.',
  'Retatrutida este un agonist triplu al receptorilor GIP, GLP-1 și Glucagon. Disponibil în flacon de 20mg, pulbere liofilizată. Puritate verificată prin HPLC. Exclusiv pentru cercetare în laborator.',
  '≥99%',
  390.00, 30, 'Peptide'
),
(
  'GHK-Cu 50mg',
  'ghk-cu-50mg',
  'Tripeptidă cu cupru, 50mg – puritate analitică.',
  'GHK-Cu (Gly-His-Lys cupru) este un tripeptid de origine umană asociat cu proprietăți reparatoare tisulare. flacon de 50mg, liofilizat. Puritate verificată HPLC. Exclusiv pentru cercetare în laborator.',
  '≥99.0%',
  150.00, 60, 'Peptide'
),
(
  'Semax 10mg',
  'semax-10mg',
  'Peptidă neuroprotectivă ACTH(4-7)PGP, 10mg.',
  'Semax este un analog sintetic al fragmentului ACTH(4-7) cu extensie Pro-Gly-Pro. flacon de 10mg, pulbere liofilizată. Puritate verificată prin HPLC. Exclusiv pentru cercetare în laborator.',
  '≥99%',
  130.00, 45, 'Peptide'
),
(
  'Selank 10mg',
  'selank-10mg',
  'Peptidă anxiolitică sintetică Thr-Lys-Pro-Arg-Pro-Gly-Pro, 10mg.',
  'Selank este un heptapeptid sintetic derivat din tuftsin. flacon de 10mg, pulbere liofilizată. Puritate verificată prin HPLC. Exclusiv pentru cercetare în laborator.',
  '≥99%',
  130.00, 45, 'Peptide'
),
(
  'BPC-157 10mg',
  'bpc-157-10mg',
  'Pentadecapeptidă stabilă, 10mg – standard HPLC.',
  'BPC-157 (Body Protection Compound-157) este un pentadecapeptid sintetic. flacon de 10mg, pulbere liofilizată. Puritate verificată prin HPLC ≥99%. Exclusiv pentru cercetare în laborator.',
  '≥99.0%',
  120.00, 80, 'Peptide'
);

-- ── PROFILES (extends auth.users) ────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  address     text,
  city        text,
  county      text,
  postal_code text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── ORDERS ───────────────────────────────────────────────────
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references public.profiles(id) on delete set null,
  status           text not null default 'in_asteptare'
                     check (status in ('in_asteptare','confirmata','expediata','livrata','anulata')),
  total_amount     numeric(10,2) not null default 0,
  shipping_name    text,
  shipping_address text,
  shipping_city    text,
  shipping_county  text,
  shipping_postal  text,
  shipping_phone   text,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── ORDER ITEMS ───────────────────────────────────────────────
create table if not exists public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity    integer not null check (quantity > 0),
  unit_price  numeric(10,2) not null,
  created_at  timestamptz not null default now()
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────
alter table public.products   enable row level security;
alter table public.profiles   enable row level security;
alter table public.orders     enable row level security;
alter table public.order_items enable row level security;

-- products: public read
create policy "Produse vizibile public"
  on public.products for select using (is_active = true);

-- profiles: only own
create policy "Profil propriu"
  on public.profiles for all using (auth.uid() = id);

-- orders: only own
create policy "Comenzi proprii – citire"
  on public.orders for select using (auth.uid() = user_id);
create policy "Comenzi proprii – creare"
  on public.orders for insert with check (auth.uid() = user_id);

-- order_items: via orders
create policy "Articole comenzi proprii"
  on public.order_items for select
  using (exists (
    select 1 from public.orders o
    where o.id = order_id and o.user_id = auth.uid()
  ));
create policy "Creare articole comenzi proprii"
  on public.order_items for insert
  with check (exists (
    select 1 from public.orders o
    where o.id = order_id and o.user_id = auth.uid()
  ));
