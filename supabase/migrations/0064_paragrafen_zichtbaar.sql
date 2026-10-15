-- Paragrafen die niet over differentiëren gaan, horen niet op deze site.
-- Welke dat zijn staat in de data, niet als lijstje in de code.
-- Twee keer draaien voegt de kolom niet opnieuw toe en zet dezelfde rijen.

BEGIN;

ALTER TABLE public.paragraphs
  ADD COLUMN IF NOT EXISTS zichtbaar boolean NOT NULL DEFAULT true;

UPDATE public.paragraphs
SET zichtbaar = false
WHERE slug IN (
  'h2-5',
  'h7-1',
  'h7-2',
  'h7-3',
  'h7-4',
  'h9-1',
  'h9-2'
)
AND zichtbaar IS DISTINCT FROM false;

DO $$
DECLARE
  verborgen int;
BEGIN
  SELECT count(*) INTO verborgen
  FROM public.paragraphs
  WHERE slug IN (
    'h2-5',
    'h7-1',
    'h7-2',
    'h7-3',
    'h7-4',
    'h9-1',
    'h9-2'
  )
  AND zichtbaar = false;

  IF verborgen <> 7 THEN
    RAISE EXCEPTION 'Er horen 7 verborgen paragrafen te zijn, niet %', verborgen;
  END IF;
END $$;

COMMIT;

NOTIFY pgrst, 'reload schema';
