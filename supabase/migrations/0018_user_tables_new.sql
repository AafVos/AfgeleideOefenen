-- =============================================================================
-- Migration 0018: Shadow user tables + known_wrong_answers_new
-- =============================================================================
-- Creates the *_new* versions of every table that holds user data or AI cache,
-- pointing at the new content tables (topics_new / topic_clusters_new /
-- questions_new / question_steps_new).
--
-- Strategy: shadow tables. Production stays on the old tables until the
-- application code switches over. No data is migrated — existing users keep
-- their accounts (profiles row) but start fresh on the new flow.
--
-- New tables created:
--   • user_progress_new        (FK → topics_new, topic_clusters_new, profiles)
--   • user_sessions_new        (FK → topics_new, topic_clusters_new, profiles)
--   • session_answers_new      (FK → user_sessions_new, questions_new)
--   • step_mistakes_new        (FK → session_answers_new, question_steps_new)
--   • question_flags_new       (FK → questions_new, auth.users)
--   • known_wrong_answers_new  (FK → questions_new; root_cause_slug replaced
--                               by free-text 'category')
--
-- Bestaande tabellen (user_progress, user_sessions, session_answers,
-- step_mistakes, question_flags, known_wrong_answers, root_causes) blijven
-- ongewijzigd; de live productie-UI gebruikt die nog.
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. user_progress_new
-- =============================================================================
CREATE TABLE public.user_progress_new (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES public.profiles(id)          ON DELETE CASCADE,
  topic_id        uuid        NOT NULL REFERENCES public.topics_new(id)        ON DELETE CASCADE,
  cluster_id      uuid        NOT NULL REFERENCES public.topic_clusters_new(id) ON DELETE CASCADE,
  status          text        NOT NULL CHECK (status IN ('locked', 'in_progress', 'mastered')),
  correct_streak  int         NOT NULL DEFAULT 0,
  total_answered  int         NOT NULL DEFAULT 0,
  total_correct   int         NOT NULL DEFAULT 0,
  mastered_at     timestamptz,
  is_skipped      boolean     NOT NULL DEFAULT false,
  UNIQUE (user_id, cluster_id)
);

CREATE INDEX user_progress_new_user_id_idx ON public.user_progress_new (user_id);

ALTER TABLE public.user_progress_new ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_progress_new_owner" ON public.user_progress_new;
CREATE POLICY "user_progress_new_owner" ON public.user_progress_new
  FOR ALL
  USING  (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id);


-- =============================================================================
-- 2. user_sessions_new
-- =============================================================================
CREATE TABLE public.user_sessions_new (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES public.profiles(id)          ON DELETE CASCADE,
  topic_id   uuid        NOT NULL REFERENCES public.topics_new(id)        ON DELETE CASCADE,
  cluster_id uuid        NOT NULL REFERENCES public.topic_clusters_new(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at   timestamptz
);

CREATE INDEX user_sessions_new_user_id_idx ON public.user_sessions_new (user_id);

ALTER TABLE public.user_sessions_new ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_sessions_new_owner" ON public.user_sessions_new;
CREATE POLICY "user_sessions_new_owner" ON public.user_sessions_new
  FOR ALL
  USING  (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id);


-- =============================================================================
-- 3. session_answers_new
-- =============================================================================
CREATE TABLE public.session_answers_new (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      uuid        NOT NULL REFERENCES public.user_sessions_new(id) ON DELETE CASCADE,
  question_id     uuid        NOT NULL REFERENCES public.questions_new(id)     ON DELETE CASCADE,
  user_answer     text,
  is_correct      boolean,
  hints_used      int         NOT NULL DEFAULT 0,
  is_careless     boolean     NOT NULL DEFAULT false,
  time_spent_sec  int,
  answered_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX session_answers_new_session_id_idx  ON public.session_answers_new (session_id);
CREATE INDEX session_answers_new_question_id_idx ON public.session_answers_new (question_id);

ALTER TABLE public.session_answers_new ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "session_answers_new_owner" ON public.session_answers_new;
CREATE POLICY "session_answers_new_owner" ON public.session_answers_new
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_sessions_new us
      WHERE us.id = session_answers_new.session_id
        AND (us.user_id = auth.uid() OR public.is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_sessions_new us
      WHERE us.id = session_answers_new.session_id
        AND us.user_id = auth.uid()
    )
  );


-- =============================================================================
-- 4. step_mistakes_new
-- =============================================================================
CREATE TABLE public.step_mistakes_new (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id   uuid        NOT NULL REFERENCES public.session_answers_new(id) ON DELETE CASCADE,
  step_id     uuid        NOT NULL REFERENCES public.question_steps_new(id)  ON DELETE CASCADE,
  is_careless boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX step_mistakes_new_answer_id_idx ON public.step_mistakes_new (answer_id);

ALTER TABLE public.step_mistakes_new ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "step_mistakes_new_owner" ON public.step_mistakes_new;
CREATE POLICY "step_mistakes_new_owner" ON public.step_mistakes_new
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.session_answers_new sa
      JOIN public.user_sessions_new us ON us.id = sa.session_id
      WHERE sa.id = step_mistakes_new.answer_id
        AND (us.user_id = auth.uid() OR public.is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.session_answers_new sa
      JOIN public.user_sessions_new us ON us.id = sa.session_id
      WHERE sa.id = step_mistakes_new.answer_id
        AND us.user_id = auth.uid()
    )
  );


-- =============================================================================
-- 5. question_flags_new
-- =============================================================================
CREATE TABLE public.question_flags_new (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid        NOT NULL REFERENCES public.questions_new(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES auth.users(id)           ON DELETE CASCADE,
  reason      text,
  status      text        NOT NULL DEFAULT 'open'
              CHECK (status IN ('open', 'resolved', 'dismissed')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (question_id, user_id, status)
);

CREATE INDEX question_flags_new_question_id_idx ON public.question_flags_new (question_id);
CREATE INDEX question_flags_new_status_idx      ON public.question_flags_new (status);

ALTER TABLE public.question_flags_new ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "question_flags_new_select"     ON public.question_flags_new;
DROP POLICY IF EXISTS "question_flags_new_insert_own" ON public.question_flags_new;
DROP POLICY IF EXISTS "question_flags_new_admin_all"  ON public.question_flags_new;

CREATE POLICY "question_flags_new_select" ON public.question_flags_new
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "question_flags_new_insert_own" ON public.question_flags_new
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "question_flags_new_admin_all" ON public.question_flags_new
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- =============================================================================
-- 6. known_wrong_answers_new
--    Replaces `root_cause_slug` with a free-form `category` text field
--    (no FK; AI returns plain Dutch).
-- =============================================================================
CREATE TABLE public.known_wrong_answers_new (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id       uuid        NOT NULL REFERENCES public.questions_new(id) ON DELETE CASCADE,
  wrong_answer      text        NOT NULL,
  error_explanation text        NOT NULL,
  category          text,
  seen_count        int         NOT NULL DEFAULT 1,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (question_id, wrong_answer)
);

CREATE INDEX known_wrong_answers_new_question_id_idx
  ON public.known_wrong_answers_new (question_id);

ALTER TABLE public.known_wrong_answers_new ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_known_wrong_answers_new"  ON public.known_wrong_answers_new;
DROP POLICY IF EXISTS "write_known_wrong_answers_new" ON public.known_wrong_answers_new;

CREATE POLICY "read_known_wrong_answers_new" ON public.known_wrong_answers_new
  FOR SELECT USING (true);

CREATE POLICY "write_known_wrong_answers_new" ON public.known_wrong_answers_new
  FOR ALL
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());


-- =============================================================================
-- 7. Cleanup — drop unused root_cause_tags from questions_new
--    (was always empty; root_causes go away in the new system)
-- =============================================================================
ALTER TABLE public.questions_new DROP COLUMN IF EXISTS root_cause_tags;


-- =============================================================================
-- 8. Validatie
-- =============================================================================
SELECT 'user_progress_new'        AS tbl, COUNT(*)::text AS n FROM public.user_progress_new
UNION ALL
SELECT 'user_sessions_new',         COUNT(*)::text FROM public.user_sessions_new
UNION ALL
SELECT 'session_answers_new',       COUNT(*)::text FROM public.session_answers_new
UNION ALL
SELECT 'step_mistakes_new',         COUNT(*)::text FROM public.step_mistakes_new
UNION ALL
SELECT 'question_flags_new',        COUNT(*)::text FROM public.question_flags_new
UNION ALL
SELECT 'known_wrong_answers_new',   COUNT(*)::text FROM public.known_wrong_answers_new;
-- Verwacht: allen 0 (lege tabellen).

COMMIT;
