-- Allow guest checkout by modifying RLS policies for orders and order_items

-- Drop old insert policies
drop policy if exists "Comenzi proprii – creare" on public.orders;
drop policy if exists "Creare articole comenzi proprii" on public.order_items;

-- Recreate orders insert policy to allow authenticated users to insert their own orders, and anonymous users to insert orders without a user_id
create policy "Creare comanda (inclusiv guest)"
  on public.orders for insert
  with check (auth.uid() = user_id or user_id is null);

-- Recreate order_items insert policy to allow inserting items into orders that belong to the user, or orders that have no user_id (guest orders)
create policy "Creare articole comanda (inclusiv guest)"
  on public.order_items for insert
  with check (exists (
    select 1 from public.orders o
    where o.id = order_id and (o.user_id = auth.uid() or o.user_id is null)
  ));
