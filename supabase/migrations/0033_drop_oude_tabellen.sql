-- De site leest sinds de overstap alleen nog de tabellen met _new.
-- De oude tabellen (onderwerpen, opgaven en voortgang van vóór die
-- overstap) blijven anders naast de nieuwe staan. Integraaloefenen heeft
-- een eigen database en leunt hier niet meer op.
--
-- topic_clusters_new.source_cluster_id wees naar de oude clusters. Die
-- kolom is overal leeg en geen code leest hem. Hij gaat mee weg, anders
-- kan de oude clustertabel niet weg.
--
-- Twee keer draaien haalt niets extra weg.

ALTER TABLE public.topic_clusters_new
  DROP CONSTRAINT IF EXISTS topic_clusters_new_source_cluster_id_fkey;

DROP INDEX IF EXISTS public.topic_clusters_new_source_cluster_idx;

ALTER TABLE public.topic_clusters_new
  DROP COLUMN IF EXISTS source_cluster_id;

-- Eerst de tabellen die naar een andere oude tabel wijzen.
DROP TABLE IF EXISTS public.step_mistakes;
DROP TABLE IF EXISTS public.session_answers;
DROP TABLE IF EXISTS public.question_flags;
DROP TABLE IF EXISTS public.known_wrong_answers;
DROP TABLE IF EXISTS public.question_steps;
DROP TABLE IF EXISTS public.user_progress;
DROP TABLE IF EXISTS public.user_sessions;
DROP TABLE IF EXISTS public.questions;
DROP TABLE IF EXISTS public.root_causes;
DROP TABLE IF EXISTS public.topic_clusters;
DROP TABLE IF EXISTS public.topics;
