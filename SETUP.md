# PeptideResearch.ro – Ghid Configurare & Deployment

## 1. Supabase – configurare bază de date

1. Creează un proiect nou pe [supabase.com](https://supabase.com)
2. Din meniul stâng → **SQL Editor** → **New query**
3. Copiază tot conținutul din `supabase/schema.sql` și apasă **Run**
4. Schema creează automat: tabele, RLS policies, seed-ul cu produse și triggerul pentru profiluri

## 2. Variabile de mediu

Creează fișierul `.env.local` în rădăcina proiectului:

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROIECTUL_TAU.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

Găsești aceste valori în Supabase: **Settings → API**

## 3. Activare Email Auth în Supabase

1. Supabase Dashboard → **Authentication → Providers**
2. Asigură-te că **Email** este activat
3. Opțional: dezactivează "Confirm email" pentru testare rapidă

## 4. Rulare locală

```bash
npm install
npm run dev
# → http://localhost:3000
```

## 5. Deployment pe Vercel

### Rapid (recomandat):
```bash
npm install -g vercel
vercel --prod
```

### Sau prin GitHub:
1. Push repo pe GitHub
2. Importă proiectul pe [vercel.com](https://vercel.com)
3. La **Environment Variables** adaugă:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**

## 6. DNS pentru peptideresearch.ro

1. Cumpără domeniul `peptideresearch.ro` de la orice registrar român (ex: RoTLD, GoDaddy)
2. În Vercel → proiect → **Domains** → adaugă `peptideresearch.ro`
3. Setează în registrar DNS:
   - `A record: 76.76.21.21` sau
   - `CNAME: cname.vercel-dns.com`

## 7. Structura baza de date

```
auth.users (Supabase managed)
    └── profiles (1:1) — date personale client
         └── orders (1:N) — comenzi
              └── order_items (1:N) — produse per comandă → products
products — catalog peptide (admin managed)
```

## 8. Adăugare produse noi

Prin Supabase Dashboard → **Table Editor → products** sau SQL:
```sql
INSERT INTO products (name, slug, short_desc, description, purity, price, stock, category)
VALUES ('Nume Peptidă 5mg', 'nume-peptida-5mg', 'Descriere scurtă', 'Descriere completă', '≥99.0%', 99.00, 50, 'Peptide');
```
