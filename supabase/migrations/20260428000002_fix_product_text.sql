-- Fix Romanian spelling: flakon → flacon, flakoane → flacoane
UPDATE public.products SET
  description = REPLACE(REPLACE(REPLACE(REPLACE(
    description,
    'flakoane', 'flacoane'),
    'Flakoane', 'Flacoane'),
    'flakon', 'flacon'),
    'Flakon', 'Flacon'),
  short_desc = REPLACE(REPLACE(REPLACE(REPLACE(
    short_desc,
    'flakoane', 'flacoane'),
    'Flakoane', 'Flacoane'),
    'flakon', 'flacon'),
    'Flakon', 'Flacon');

-- Remove "gel de răcire" sentences from descriptions
UPDATE public.products
  SET description = REGEXP_REPLACE(
    description,
    '[^.]*[Gg]el de r[ăa]cire[^.]*\.?\s*',
    '',
    'g'
  )
  WHERE description ~* 'gel de r[ăa]cire';
