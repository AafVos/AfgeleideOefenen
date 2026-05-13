-- =============================================================================
-- Migration 0019: Custom self-tests ("zelf-toets")
-- =============================================================================
-- Lets a student build their own test by selecting any combination of
-- chapters/topics/clusters, choosing how many questions, and whether to draw
-- from new questions only or include previously-answered ones.
--
-- Schema changes:
--   • user_sessions_new.topic_id / cluster_id become nullable — a custom test
--     spans multiple clusters and isn't tied to one.
--   • user_sessions_new.kind: 'practice' (existing behaviour) | 'custom_test'.
--   • custom_test_questions: ordered list of pre-picked question IDs per test
--     session, so the runner knows what to ask in what order and we can
--     compute per-test results afterwards.
--
-- Mastery semantics: a 'custom_test' session writes to session_answers_new
-- like a practice session, but the application code skips the
-- user_progress_new bumps. The test is a self-assessment, not a learning
-- path action.
-- =============================================================================

BEGIN;

ALTER TABLE public.user_sessions_new
  ALTER COLUMN topic_id   DROP NOT NULL,
  ALTER COLUMN cluster_id DROP NOT NULL;

ALTER TABLE public.user_sessions_new
  ADD COLUMN kind text NOT NULL DEFAULT 'practice'
    CHECK (kind IN ('practice', 'custom_test'));

CREATE INDEX user_sessions_new_user_kind_idx
  ON public.user_sessions_new (user_id, kind);

CREATE TABLE public.custom_test_questions (
  session_id   uuid NOT NULL REFERENCES public.user_sessions_new(id) ON DELETE CASCADE,
  question_id  uuid NOT NULL REFERENCES public.questions_new(id)     ON DELETE CASCADE,
  order_index  int  NOT NULL,
  PRIMARY KEY (session_id, order_index),
  UNIQUE (session_id, question_id)
);

CREATE INDEX custom_test_questions_session_idx
  ON public.custom_test_questions (session_id, order_index);

ALTER TABLE public.custom_test_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "custom_test_questions_owner" ON public.custom_test_questions;
CREATE POLICY "custom_test_questions_owner" ON public.custom_test_questions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_sessions_new us
      WHERE us.id = custom_test_questions.session_id
        AND (us.user_id = auth.uid() OR public.is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_sessions_new us
      WHERE us.id = custom_test_questions.session_id
        AND us.user_id = auth.uid()
    )
  );

COMMIT;
