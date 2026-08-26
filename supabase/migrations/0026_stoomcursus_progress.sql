-- =============================================================================
-- Migration 0026: Stoomcursus-voortgang per account
-- =============================================================================
-- Houdt per gebruiker (en per site) bij hoe ver die is in het stoomcursus-
-- verhaal: welk scherm, hoeveel uitlegblokken geplaatst zijn en welk
-- onderdeel er gekozen is om mee te oefenen.
-- =============================================================================

BEGIN;

CREATE TABLE public.stoomcursus_progress (
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  site       text NOT NULL DEFAULT 'afgeleiden'
             CHECK (site IN ('afgeleiden', 'integralen')),
  step       text NOT NULL DEFAULT 'welkom'
             CHECK (step IN ('welkom', 'onderdelen', 'uitleg', 'vervolg', 'oefenen')),
  placed     int  NOT NULL DEFAULT 0 CHECK (placed BETWEEN 0 AND 3),
  part       int  CHECK (part BETWEEN 0 AND 2),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, site)
);

ALTER TABLE public.stoomcursus_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stoomcursus_progress_owner" ON public.stoomcursus_progress;
CREATE POLICY "stoomcursus_progress_owner" ON public.stoomcursus_progress
  FOR ALL
  USING  (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id);

COMMIT;
