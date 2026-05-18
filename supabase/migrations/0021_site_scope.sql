-- =============================================================================
-- Migration 0021: Multi-site scoping
-- =============================================================================
-- Adds a `site` column to every content table that is queried directly, so a
-- single Supabase project can serve both afgeleideoefenen.nl ('afgeleiden')
-- and integraaloefenen.nl ('integralen') from one shared schema and shared
-- user accounts.
--
-- Defaults all existing rows to 'afgeleiden' — that's the existing content
-- bank. New rows for integralen explicitly set site = 'integralen'.
--
-- Smaller dependent tables (root_causes, question_flags, user_progress_new,
-- session_answers_new, custom_test_questions) inherit `site` through their
-- foreign keys and don't need their own column.
--
-- NOTE: slug-uniqueness is currently global per table. Once integralen
-- content lands you'll likely want unique (site, slug) instead — handle that
-- in a follow-up migration when you actually hit a conflict, so we don't
-- guess at the existing constraint names here.
-- =============================================================================

BEGIN;

ALTER TABLE public.chapters
  ADD COLUMN IF NOT EXISTS site text NOT NULL DEFAULT 'afgeleiden'
    CHECK (site IN ('afgeleiden', 'integralen'));

ALTER TABLE public.topics_new
  ADD COLUMN IF NOT EXISTS site text NOT NULL DEFAULT 'afgeleiden'
    CHECK (site IN ('afgeleiden', 'integralen'));

ALTER TABLE public.topic_clusters_new
  ADD COLUMN IF NOT EXISTS site text NOT NULL DEFAULT 'afgeleiden'
    CHECK (site IN ('afgeleiden', 'integralen'));

ALTER TABLE public.questions_new
  ADD COLUMN IF NOT EXISTS site text NOT NULL DEFAULT 'afgeleiden'
    CHECK (site IN ('afgeleiden', 'integralen'));

CREATE INDEX IF NOT EXISTS chapters_site_order_idx
  ON public.chapters (site, order_index);

CREATE INDEX IF NOT EXISTS topics_new_site_order_idx
  ON public.topics_new (site, order_index);

CREATE INDEX IF NOT EXISTS clusters_new_site_topic_idx
  ON public.topic_clusters_new (site, topic_id, order_index);

CREATE INDEX IF NOT EXISTS questions_new_site_cluster_idx
  ON public.questions_new (site, cluster_id, order_index);

COMMIT;
