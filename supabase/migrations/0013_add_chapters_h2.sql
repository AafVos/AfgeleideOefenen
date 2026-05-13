-- =============================================================================
-- Migration 0013: Parallelle chapter-structuur — H2
-- =============================================================================
-- Strategie: shadow-tabellen naast de bestaande.
--   • De huidige UI gebruikt topics / topic_clusters / questions ongewijzigd.
--   • De nieuwe UI (nog te bouwen) gebruikt chapters / topics_new /
--     topic_clusters_new en haalt vragen op via source_cluster_id.
--   • Bestaande tabellen, vragen, user_progress en sessies worden
--     NIET aangepast.
--
-- Na deze migratie bestaan naast elkaar:
--   topics            (oud, ongewijzigd)
--   topic_clusters    (oud, ongewijzigd)
--   questions         (oud, ongewijzigd)
--   chapters          (nieuw)
--   topics_new        (nieuw)
--   topic_clusters_new (nieuw, source_cluster_id → topic_clusters)
--
-- H6/H7/H9 volgen in aparte migraties.
-- =============================================================================

BEGIN;

-- ============================================================
-- 1. CHAPTERS
-- ============================================================
CREATE TABLE public.chapters (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text        UNIQUE NOT NULL,
  title       text        NOT NULL,
  book_part   smallint    NOT NULL,
  order_index smallint    NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_chapters"  ON public.chapters;
DROP POLICY IF EXISTS "write_chapters" ON public.chapters;

CREATE POLICY "read_chapters" ON public.chapters
  FOR SELECT USING (true);

CREATE POLICY "write_chapters" ON public.chapters
  FOR ALL
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- 2. TOPICS_NEW
-- ============================================================
CREATE TABLE public.topics_new (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                   text        UNIQUE NOT NULL,
  title                  text        NOT NULL,
  chapter_id             uuid        NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  order_index            smallint    NOT NULL,
  is_unlocked_by_default boolean     NOT NULL DEFAULT false,
  created_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX topics_new_chapter_id_idx ON public.topics_new (chapter_id);

ALTER TABLE public.topics_new ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_topics_new"  ON public.topics_new;
DROP POLICY IF EXISTS "write_topics_new" ON public.topics_new;

CREATE POLICY "read_topics_new" ON public.topics_new
  FOR SELECT USING (true);

CREATE POLICY "write_topics_new" ON public.topics_new
  FOR ALL
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- 3. TOPIC_CLUSTERS_NEW
--    source_cluster_id → public.topic_clusters(id)
--    Hiermee kan de nieuwe UI vragen ophalen uit de oude structuur:
--    SELECT * FROM questions WHERE cluster_id = source_cluster_id
-- ============================================================
CREATE TABLE public.topic_clusters_new (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id          uuid        NOT NULL REFERENCES public.topics_new(id) ON DELETE CASCADE,
  slug              text        NOT NULL,
  title             text        NOT NULL,
  order_index       smallint    NOT NULL,
  source_cluster_id uuid        REFERENCES public.topic_clusters(id) ON DELETE SET NULL,
  UNIQUE (topic_id, slug)
);

CREATE INDEX topic_clusters_new_topic_id_idx        ON public.topic_clusters_new (topic_id);
CREATE INDEX topic_clusters_new_source_cluster_idx  ON public.topic_clusters_new (source_cluster_id);

ALTER TABLE public.topic_clusters_new ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_topic_clusters_new"  ON public.topic_clusters_new;
DROP POLICY IF EXISTS "write_topic_clusters_new" ON public.topic_clusters_new;

CREATE POLICY "read_topic_clusters_new" ON public.topic_clusters_new
  FOR SELECT USING (true);

CREATE POLICY "write_topic_clusters_new" ON public.topic_clusters_new
  FOR ALL
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- 4. INSERT H2 CHAPTER
-- ============================================================
INSERT INTO public.chapters (slug, title, book_part, order_index)
VALUES ('h2', 'De afgeleide functie', 1, 2);

-- ============================================================
-- 5. INSERT H2 TOPICS_NEW
-- ============================================================
INSERT INTO public.topics_new (slug, title, chapter_id, order_index, is_unlocked_by_default)
VALUES
  ('h2_termsgewijs',   'Termsgewijs differentiëren',
   (SELECT id FROM public.chapters WHERE slug = 'h2'), 1, true),

  ('h2_haakjes_eerst', 'Haakjes uitwerken vóór differentiëren',
   (SELECT id FROM public.chapters WHERE slug = 'h2'), 2, false),

  ('h2_productregel',  'De productregel',
   (SELECT id FROM public.chapters WHERE slug = 'h2'), 3, false),

  ('h2_quotientregel', 'De quotiëntregel',
   (SELECT id FROM public.chapters WHERE slug = 'h2'), 4, false);

-- ============================================================
-- 6. INSERT H2 TOPIC_CLUSTERS_NEW
-- ============================================================

-- ── h2_termsgewijs ──────────────────────────────────────────
-- Bron 1: som_termen (somregel)
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, source_cluster_id)
SELECT
  (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'),
  'termsgewijs_basis',
  tc.title,
  1,
  tc.id
FROM public.topic_clusters tc
JOIN public.topics t ON t.id = tc.topic_id
WHERE t.slug = 'somregel' AND tc.slug = 'som_termen';

-- Bron 2: standaard_ax_n (basis)
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, source_cluster_id)
SELECT
  (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'),
  'standaard_ax_n',
  tc.title,
  2,
  tc.id
FROM public.topic_clusters tc
JOIN public.topics t ON t.id = tc.topic_id
WHERE t.slug = 'basis' AND tc.slug = 'standaard_ax_n';

-- ── h2_haakjes_eerst ────────────────────────────────────────
-- Bron: haakjes (somregel)
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, source_cluster_id)
SELECT
  (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'),
  tc.slug,
  tc.title,
  1,
  tc.id
FROM public.topic_clusters tc
JOIN public.topics t ON t.id = tc.topic_id
WHERE t.slug = 'somregel' AND tc.slug = 'haakjes';

-- ── h2_productregel ─────────────────────────────────────────
-- Alle 5 clusters (incl. veelterm_wortel — wacht op H6)
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, source_cluster_id)
SELECT
  (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'),
  tc.slug,
  tc.title,
  tc.order_index,
  tc.id
FROM public.topic_clusters tc
JOIN public.topics t ON t.id = tc.topic_id
WHERE t.slug = 'productregel';

-- ── h2_quotientregel ────────────────────────────────────────
-- Alle 3 clusters
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, source_cluster_id)
SELECT
  (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'),
  tc.slug,
  tc.title,
  tc.order_index,
  tc.id
FROM public.topic_clusters tc
JOIN public.topics t ON t.id = tc.topic_id
WHERE t.slug = 'quotientregel';

-- ============================================================
-- 7. VALIDATIE — controleer vóór commit
-- ============================================================

-- Nieuwe H2-structuur met cluster- en vraagaantallen
SELECT
  c.slug                    AS chapter,
  tn.slug                   AS topic,
  COUNT(DISTINCT tcn.id)    AS clusters,
  COUNT(DISTINCT q.id)      AS questions
FROM  public.chapters c
JOIN  public.topics_new tn         ON tn.chapter_id       = c.id
JOIN  public.topic_clusters_new tcn ON tcn.topic_id       = tn.id
LEFT JOIN public.questions q        ON q.cluster_id       = tcn.source_cluster_id
GROUP BY c.slug, tn.slug, tn.order_index
ORDER BY c.slug, tn.order_index;

-- Verwacht (clusters deterministisch, vraagtelling afhankelijk van DB):
-- h2 | h2_termsgewijs   | 2 | ?
-- h2 | h2_haakjes_eerst | 1 | ?
-- h2 | h2_productregel  | 5 | ?  (incl. veelterm_wortel)
-- h2 | h2_quotientregel | 3 | ?

-- Bestaande topics ongewijzigd (dezelfde slugs als vóór migratie)
SELECT slug, title FROM public.topics ORDER BY order_index;

-- Bestaande vragen intact
SELECT COUNT(*) AS total_questions FROM public.questions;

COMMIT;
