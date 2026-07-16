-- =============================================================================
-- Migration 0023: Add category column to topics_new
-- Supports integraaloefenen.nl tab navigation:
--   primitiveren | integralen | vergelijkingen | toepassingen
-- =============================================================================
BEGIN;

ALTER TABLE public.topics_new
  ADD COLUMN IF NOT EXISTS category text
  CHECK (category IN ('primitiveren', 'integralen', 'vergelijkingen', 'toepassingen'));

CREATE INDEX IF NOT EXISTS topics_new_site_category_idx
  ON public.topics_new (site, category);

-- Set all h11 integralen topics (just imported) to 'primitiveren'
UPDATE public.topics_new
SET category = 'primitiveren'
WHERE site = 'integralen'
  AND slug LIKE 'h11_%';

COMMIT;
