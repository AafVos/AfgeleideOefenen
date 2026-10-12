-- Restanten van de tijd dat deze database ook integraaloefenen.nl bediende.
-- Die site heeft sinds 9 oktober 2026 een eigen database. De oefenstof
-- staat daar (migraties 0022 en 0024, plus hun eigen stof daarna).
-- Afgeleideoefenen toont die rijen niet.
--
-- Eerst de status 'locked' uit het oude leerpad, dan de integralen-rijen,
-- dan de kolommen site en category. Twee keer draaien haalt niets extra
-- weg en laat de afgeleiden-rijen staan.
--
-- category op known_wrong_answers_new hoort bij de uitleg van een fout
-- antwoord en blijft.

-- 'locked' zet deze site nergens meer. Een rij die hem nog heeft, telt
-- voortaan als bezig. De reeks goed-achter-elkaar blijft staan.
UPDATE public.user_progress_new
SET status = 'in_progress'
WHERE status = 'locked';

ALTER TABLE public.user_progress_new
  DROP CONSTRAINT IF EXISTS user_progress_new_status_check;

ALTER TABLE public.user_progress_new
  ADD CONSTRAINT user_progress_new_status_check
  CHECK (status IN ('in_progress', 'mastered'));

-- Integralen-rijen weg. Het hoofdstuk trekt onderwerpen, clusters,
-- opgaven en stappen mee, en de voortgang en sessies die daaraan hangen.
-- Na de eerste keer bestaat de kolom site niet meer; de tweede keer
-- slaan we het verwijderen over.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'chapters'
      AND column_name = 'site'
  ) THEN
    DELETE FROM public.chapters WHERE site = 'integralen';
    DELETE FROM public.questions_new WHERE site = 'integralen';
    DELETE FROM public.topic_clusters_new WHERE site = 'integralen';
    DELETE FROM public.topics_new WHERE site = 'integralen';
  END IF;
END $$;

DROP INDEX IF EXISTS public.topics_new_site_category_idx;
DROP INDEX IF EXISTS public.chapters_site_order_idx;
DROP INDEX IF EXISTS public.topics_new_site_order_idx;
DROP INDEX IF EXISTS public.clusters_new_site_topic_idx;
DROP INDEX IF EXISTS public.questions_new_site_cluster_idx;

ALTER TABLE public.chapters
  DROP CONSTRAINT IF EXISTS chapters_site_check;
ALTER TABLE public.topics_new
  DROP CONSTRAINT IF EXISTS topics_new_site_check;
ALTER TABLE public.topics_new
  DROP CONSTRAINT IF EXISTS topics_new_category_check;
ALTER TABLE public.topic_clusters_new
  DROP CONSTRAINT IF EXISTS topic_clusters_new_site_check;
ALTER TABLE public.questions_new
  DROP CONSTRAINT IF EXISTS questions_new_site_check;

ALTER TABLE public.chapters
  DROP COLUMN IF EXISTS site;
ALTER TABLE public.topics_new
  DROP COLUMN IF EXISTS site;
ALTER TABLE public.topics_new
  DROP COLUMN IF EXISTS category;
ALTER TABLE public.topic_clusters_new
  DROP COLUMN IF EXISTS site;
ALTER TABLE public.questions_new
  DROP COLUMN IF EXISTS site;
