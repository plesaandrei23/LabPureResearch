-- ============================================================
--  Kit content update (May 2026)
--  - Standardise Kit copy: bacteriostatic water is always 3ml,
--    syringes are described in plural "seringi" with no count.
--  - Reassert every product's image_url so any drift from a
--    missed migration is repaired (fixes Selank 10mg not loading
--    its picture in production).
--
--  Fully idempotent: safe to re-run.
-- ============================================================

-- ─── IMAGE URLs (defensive reassert) ─────────────────────────
UPDATE public.products SET image_url = '/images/klow.png'             WHERE slug = 'klow-80mg';
UPDATE public.products SET image_url = '/images/retatrutida-10mg.png' WHERE slug = 'retatrutida-10mg';
UPDATE public.products SET image_url = '/images/retatrutida-20mg.png' WHERE slug = 'retatrutida-20mg';
UPDATE public.products SET image_url = '/images/ghk-cu.png'           WHERE slug = 'ghk-cu-50mg';
UPDATE public.products SET image_url = '/images/semax.png'            WHERE slug = 'semax-10mg';
UPDATE public.products SET image_url = '/images/selank.png'           WHERE slug = 'selank-10mg';
UPDATE public.products SET image_url = '/images/bpc-157.png'          WHERE slug = 'bpc-157-10mg';

-- ─── SHORT DESCRIPTIONS ──────────────────────────────────────
--   Old: "include peptidă liofilizată, apă bacteriostatică și seringă."
--   New: "include peptidă liofilizată, apă bacteriostatică 3ml și seringi."
UPDATE public.products SET short_desc =
  'Kit Complet Klow 80mg — include peptidă liofilizată, apă bacteriostatică 3ml și seringi.'
  WHERE slug = 'klow-80mg';

UPDATE public.products SET short_desc =
  'Kit Complet Retatrutida 10mg — agonist triplu GIP/GLP-1/Glucagon, include apă bacteriostatică 3ml și seringi.'
  WHERE slug = 'retatrutida-10mg';

UPDATE public.products SET short_desc =
  'Kit Complet Retatrutida 20mg — agonist triplu GIP/GLP-1/Glucagon, include apă bacteriostatică 3ml și seringi.'
  WHERE slug = 'retatrutida-20mg';

UPDATE public.products SET short_desc =
  'Kit Complet GHK-Cu 50mg — tripeptidă cu cupru, include apă bacteriostatică 3ml și seringi.'
  WHERE slug = 'ghk-cu-50mg';

UPDATE public.products SET short_desc =
  'Kit Complet Semax 10mg — peptidă neuroprotectivă ACTH(4-7)PGP, include apă bacteriostatică 3ml și seringi.'
  WHERE slug = 'semax-10mg';

UPDATE public.products SET short_desc =
  'Kit Complet Selank 10mg — peptidă anxiolitică sintetică, include apă bacteriostatică 3ml și seringi.'
  WHERE slug = 'selank-10mg';

UPDATE public.products SET short_desc =
  'Kit Complet BPC-157 10mg — pentadecapeptidă stabilă, include apă bacteriostatică 3ml și seringi.'
  WHERE slug = 'bpc-157-10mg';

-- ─── LONG DESCRIPTIONS ───────────────────────────────────────
--   Old contents referenced "1 seringă de reconstituire" — change to
--   "seringi de reconstituire" (plural, no count) and ensure "3ml"
--   for the bacteriostatic water everywhere.
UPDATE public.products SET description =
  'Kit Complet Klow 80mg conține: 1 flacon peptidă liofilizată Klow 80mg (puritate ≥99.0%), 1 flacon apă bacteriostatică 3ml și seringi de reconstituire. Puritate verificată prin HPLC. Depozitați peptida la -20°C în ambalaj original sigilat. Exclusiv pentru cercetare în laborator.'
  WHERE slug = 'klow-80mg';

UPDATE public.products SET description =
  'Kit Complet Retatrutida 10mg conține: 1 flacon peptidă liofilizată Retatrutida 10mg (puritate ≥98.5%), 1 flacon apă bacteriostatică 3ml și seringi de reconstituire. Retatrutida este un agonist triplu al receptorilor GIP, GLP-1 și Glucagon. Puritate verificată prin HPLC. Exclusiv pentru cercetare în laborator.'
  WHERE slug = 'retatrutida-10mg';

UPDATE public.products SET description =
  'Kit Complet Retatrutida 20mg conține: 1 flacon peptidă liofilizată Retatrutida 20mg (puritate ≥98.5%), 1 flacon apă bacteriostatică 3ml și seringi de reconstituire. Retatrutida este un agonist triplu al receptorilor GIP, GLP-1 și Glucagon. Puritate verificată prin HPLC. Exclusiv pentru cercetare în laborator.'
  WHERE slug = 'retatrutida-20mg';

UPDATE public.products SET description =
  'Kit Complet GHK-Cu 50mg conține: 1 flacon peptidă liofilizată GHK-Cu 50mg (puritate ≥99.0%), 1 flacon apă bacteriostatică 3ml și seringi de reconstituire. GHK-Cu (Gly-His-Lys cupru) este un tripeptid de origine umană. Puritate verificată HPLC. Exclusiv pentru cercetare în laborator.'
  WHERE slug = 'ghk-cu-50mg';

UPDATE public.products SET description =
  'Kit Complet Semax 10mg conține: 1 flacon peptidă liofilizată Semax 10mg (puritate ≥98.0%), 1 flacon apă bacteriostatică 3ml și seringi de reconstituire. Semax este un analog sintetic al fragmentului ACTH(4-7) cu extensie Pro-Gly-Pro. Puritate verificată prin HPLC. Exclusiv pentru cercetare în laborator.'
  WHERE slug = 'semax-10mg';

UPDATE public.products SET description =
  'Kit Complet Selank 10mg conține: 1 flacon peptidă liofilizată Selank 10mg (puritate ≥98.0%), 1 flacon apă bacteriostatică 3ml și seringi de reconstituire. Selank este un heptapeptid sintetic derivat din tuftsin. Puritate verificată prin HPLC. Exclusiv pentru cercetare în laborator.'
  WHERE slug = 'selank-10mg';

UPDATE public.products SET description =
  'Kit Complet BPC-157 10mg conține: 1 flacon peptidă liofilizată BPC-157 10mg (puritate ≥99.0%), 1 flacon apă bacteriostatică 3ml și seringi de reconstituire. BPC-157 (Body Protection Compound-157) este un pentadecapeptid sintetic. Puritate verificată prin HPLC. Exclusiv pentru cercetare în laborator.'
  WHERE slug = 'bpc-157-10mg';

-- ─── VERIFICATION ────────────────────────────────────────────
-- After running, this select should show all 7 products with the
-- updated short_desc and image_url. The "seringi"/3ml flag is true
-- when both substrings are present in the new description.
SELECT
  slug,
  image_url,
  (description LIKE '%apă bacteriostatică 3ml%' AND description LIKE '%seringi de reconstituire%') AS content_ok
FROM public.products
ORDER BY slug;
