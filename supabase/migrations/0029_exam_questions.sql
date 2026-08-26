-- =============================================================================
-- Migration 0029: Examenvragen (centraal examen wiskunde B VWO)
-- =============================================================================
-- Losse tabel voor examenvragen waarin een afgeleide wordt gebruikt, met de
-- drie stoomcursus-tagdimensies:
--   • verhaaltjes   (geel,  1-17)  — wat er gevraagd wordt
--   • afgeleides    (groen, 1-13)  — welke rekenregels nodig zijn
--   • oplosmethoden (rood,  1-13)  — hoe de vergelijking wordt opgelost
-- Bron: content-bron/examens/*.json (import via scripts/import-examens.ts).
-- =============================================================================

BEGIN;

CREATE TABLE public.exam_questions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site          text NOT NULL DEFAULT 'afgeleiden'
                CHECK (site IN ('afgeleiden', 'integralen')),
  jaar          int  NOT NULL CHECK (jaar BETWEEN 2000 AND 2100),
  tijdvak       int  NOT NULL CHECK (tijdvak IN (1, 2)),
  nummer        int  NOT NULL CHECK (nummer > 0),
  onderwerp     text NOT NULL,
  context       text NOT NULL,
  vraag         text NOT NULL,
  verhaaltjes   int[] NOT NULL DEFAULT '{}',
  afgeleides    int[] NOT NULL DEFAULT '{}',
  oplosmethoden int[] NOT NULL DEFAULT '{}',
  toelichting   text,
  bron          text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (site, jaar, tijdvak, nummer)
);

CREATE INDEX exam_questions_jaar_tijdvak_idx
  ON public.exam_questions (site, jaar, tijdvak);

ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_exam_questions"  ON public.exam_questions;
DROP POLICY IF EXISTS "write_exam_questions" ON public.exam_questions;

CREATE POLICY "read_exam_questions" ON public.exam_questions
  FOR SELECT USING (true);

CREATE POLICY "write_exam_questions" ON public.exam_questions
  FOR ALL
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

COMMIT;
