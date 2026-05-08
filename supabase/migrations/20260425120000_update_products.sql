-- Actualizare produse: prețuri, imagini, descrieri Kit Complet

UPDATE public.products SET
  price      = 500.00,
  image_url  = '/images/klow.png',
  short_desc = 'Kit Complet Klow 80mg – include peptidă liofilizată, apă bacteriostatică și seringă.',
  description = 'Kit Complet Klow 80mg conține: 1 flacon peptidă liofilizată Klow 80mg (puritate ≥99.0%), 1 flacon apă bacteriostatică 3ml și 1 seringă de reconstituire. Puritate verificată prin HPLC. Depozitați peptida la -20°C în ambalaj original sigilat. Exclusiv pentru cercetare în laborator.'
WHERE slug = 'klow-80mg';

UPDATE public.products SET
  price      = 400.00,
  image_url  = '/images/retatrutida-10mg.png',
  short_desc = 'Kit Complet Retatrutida 10mg – agonist triplu GIP/GLP-1/Glucagon, include apă bacteriostatică și seringă.',
  description = 'Kit Complet Retatrutida 10mg conține: 1 flacon peptidă liofilizată Retatrutida 10mg (puritate ≥98.5%), 1 flacon apă bacteriostatică 3ml și 1 seringă de reconstituire. Retatrutida este un agonist triplu al receptorilor GIP, GLP-1 și Glucagon. Puritate verificată prin HPLC. Exclusiv pentru cercetare în laborator.'
WHERE slug = 'retatrutida-10mg';

UPDATE public.products SET
  price      = 600.00,
  image_url  = '/images/retatrutida-20mg.png',
  short_desc = 'Kit Complet Retatrutida 20mg – agonist triplu GIP/GLP-1/Glucagon, include apă bacteriostatică și seringă.',
  description = 'Kit Complet Retatrutida 20mg conține: 1 flacon peptidă liofilizată Retatrutida 20mg (puritate ≥98.5%), 1 flacon apă bacteriostatică 3ml și 1 seringă de reconstituire. Retatrutida este un agonist triplu al receptorilor GIP, GLP-1 și Glucagon. Puritate verificată prin HPLC. Exclusiv pentru cercetare în laborator.'
WHERE slug = 'retatrutida-20mg';

UPDATE public.products SET
  price      = 200.00,
  image_url  = '/images/ghk-cu.png',
  short_desc = 'Kit Complet GHK-Cu 50mg – tripeptidă cu cupru, include apă bacteriostatică și seringă.',
  description = 'Kit Complet GHK-Cu 50mg conține: 1 flacon peptidă liofilizată GHK-Cu 50mg (puritate ≥99.0%), 1 flacon apă bacteriostatică 3ml și 1 seringă de reconstituire. GHK-Cu (Gly-His-Lys cupru) este un tripeptid de origine umană. Puritate verificată HPLC. Exclusiv pentru cercetare în laborator.'
WHERE slug = 'ghk-cu-50mg';

UPDATE public.products SET
  price      = 150.00,
  image_url  = '/images/semax.png',
  short_desc = 'Kit Complet Semax 10mg – peptidă neuroprotectivă ACTH(4-7)PGP, include apă bacteriostatică și seringă.',
  description = 'Kit Complet Semax 10mg conține: 1 flacon peptidă liofilizată Semax 10mg (puritate ≥98.0%), 1 flacon apă bacteriostatică 3ml și 1 seringă de reconstituire. Semax este un analog sintetic al fragmentului ACTH(4-7) cu extensie Pro-Gly-Pro. Puritate verificată prin HPLC. Exclusiv pentru cercetare în laborator.'
WHERE slug = 'semax-10mg';

UPDATE public.products SET
  price      = 150.00,
  image_url  = '/images/selank.png',
  short_desc = 'Kit Complet Selank 10mg – peptidă anxiolitică sintetică, include apă bacteriostatică și seringă.',
  description = 'Kit Complet Selank 10mg conține: 1 flacon peptidă liofilizată Selank 10mg (puritate ≥98.0%), 1 flacon apă bacteriostatică 3ml și 1 seringă de reconstituire. Selank este un heptapeptid sintetic derivat din tuftsin. Puritate verificată prin HPLC. Exclusiv pentru cercetare în laborator.'
WHERE slug = 'selank-10mg';

UPDATE public.products SET
  price      = 200.00,
  image_url  = '/images/bpc-157.png',
  short_desc = 'Kit Complet BPC-157 10mg – pentadecapeptidă stabilă, include apă bacteriostatică și seringă.',
  description = 'Kit Complet BPC-157 10mg conține: 1 flacon peptidă liofilizată BPC-157 10mg (puritate ≥99.0%), 1 flacon apă bacteriostatică 3ml și 1 seringă de reconstituire. BPC-157 (Body Protection Compound-157) este un pentadecapeptid sintetic. Puritate verificată prin HPLC. Exclusiv pentru cercetare în laborator.'
WHERE slug = 'bpc-157-10mg';

-- Actualizare și denumiri cu "Kit" prefix
UPDATE public.products SET name = 'Kit Klow 80mg'          WHERE slug = 'klow-80mg';
UPDATE public.products SET name = 'Kit Retatrutida 10mg'   WHERE slug = 'retatrutida-10mg';
UPDATE public.products SET name = 'Kit Retatrutida 20mg'   WHERE slug = 'retatrutida-20mg';
UPDATE public.products SET name = 'Kit GHK-Cu 50mg'        WHERE slug = 'ghk-cu-50mg';
UPDATE public.products SET name = 'Kit Semax 10mg'         WHERE slug = 'semax-10mg';
UPDATE public.products SET name = 'Kit Selank 10mg'        WHERE slug = 'selank-10mg';
UPDATE public.products SET name = 'Kit BPC-157 10mg'       WHERE slug = 'bpc-157-10mg';
