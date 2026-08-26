-- =============================================================================
-- Migration 0027: Stoomcursus — flexibele voortgangsdata
-- =============================================================================
-- Voegt een jsonb-kolom toe aan stoomcursus_progress voor de voortgang per
-- onderdeel (geel/groen/rood/finale): klaar-vlag, quizpositie, score en
-- fout gegane verhaaltje-types. Jsonb zodat we tijdens het bouwen van de
-- stoomcursus niet voor elk veld een nieuwe migratie nodig hebben.
-- =============================================================================

BEGIN;

ALTER TABLE public.stoomcursus_progress
  ADD COLUMN IF NOT EXISTS data jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMIT;
