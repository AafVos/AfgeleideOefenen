-- =============================================================================
-- Migration 0031: Boekvragen in exam_questions
-- =============================================================================
-- Maakt van exam_questions een algemene vragenbank: naast examenvragen ook
-- boekopgaven (Getal & Ruimte, content-bron/boek/*.json). Boekvragen zijn
-- auteursrechtelijk beschermd (Noordhoff) en mogen alleen intern (admin)
-- zichtbaar zijn — het leesbeleid wordt daarop aangescherpt.
--   • bron_type      'examen' | 'boek'
--   • paragraaf      bv. '2.1' of '2.dt' (diagnostische toets), alleen boek
--   • onderdeel      letter van het onderdeel ('a', 'b', … of '' zonder letter)
--   • boek_categorie 'verhaaltje' | 'afgeleide' | 'geen' — de splitsing tussen
--                    verhaaltjesvragen en puur de afgeleide berekenen
--   • niveau         boekcodering (null=kern, 'O','R','A','D','T','W','G')
-- Import: scripts/import-boek.ts
-- =============================================================================

BEGIN;

ALTER TABLE public.exam_questions
  ALTER COLUMN jaar    DROP NOT NULL,
  ALTER COLUMN tijdvak DROP NOT NULL;

ALTER TABLE public.exam_questions
  ADD COLUMN IF NOT EXISTS bron_type text NOT NULL DEFAULT 'examen'
    CHECK (bron_type IN ('examen', 'boek')),
  ADD COLUMN IF NOT EXISTS paragraaf text,
  ADD COLUMN IF NOT EXISTS onderdeel text,
  ADD COLUMN IF NOT EXISTS boek_categorie text
    CHECK (boek_categorie IN ('verhaaltje', 'afgeleide', 'geen')),
  ADD COLUMN IF NOT EXISTS niveau text;

-- Examenvragen houden jaar/tijdvak verplicht; boekvragen paragraaf/onderdeel.
ALTER TABLE public.exam_questions
  DROP CONSTRAINT IF EXISTS exam_questions_bron_type_velden;
ALTER TABLE public.exam_questions
  ADD CONSTRAINT exam_questions_bron_type_velden CHECK (
    (bron_type = 'examen' AND jaar IS NOT NULL AND tijdvak IS NOT NULL)
    OR
    (bron_type = 'boek' AND paragraaf IS NOT NULL AND onderdeel IS NOT NULL
       AND boek_categorie IS NOT NULL)
  );

-- Upsert-sleutel voor boekvragen; examenrijen (paragraaf NULL) vallen erbuiten
-- doordat NULLs in een unique constraint nooit botsen.
ALTER TABLE public.exam_questions
  DROP CONSTRAINT IF EXISTS exam_questions_boek_key;
ALTER TABLE public.exam_questions
  ADD CONSTRAINT exam_questions_boek_key
  UNIQUE (site, bron_type, paragraaf, nummer, onderdeel);

-- Boekvragen alleen intern zichtbaar (auteursrecht Noordhoff).
DROP POLICY IF EXISTS "read_exam_questions" ON public.exam_questions;
CREATE POLICY "read_exam_questions" ON public.exam_questions
  FOR SELECT USING (bron_type = 'examen' OR public.is_admin());

COMMIT;
