-- Stap 2 bij k(x) = 5√(3x-2)+7 noemde f'(x). De functie heet k.
-- De afgeleide 7,5/√(3x-2) klopte al. Alleen die letter verandert.
-- Stap 1 en stap 3 blijven staan zoals ze waren.
--
-- Migratie 0015 is op de echte database al gedraaid. Die zet de stap
-- bij een verse database nu meteen goed. Deze update verbetert een
-- database waar de oude letter nog staat.
--
-- Herhaalbaar: twee keer draaien laat dezelfde tekst staan.

BEGIN;

DO $mig$
DECLARE
  n int;
  tekst text;
  verwacht text := $verwacht$Pas de kettingregel toe: $k'(x) = 5 \cdot \tfrac{1}{2}(3x-2)^{-\frac{1}{2}} \cdot 3 = \tfrac{15}{2}(3x-2)^{-\frac{1}{2}}$.$verwacht$;
BEGIN
  UPDATE public.question_steps_new AS s
  SET step_description = replace(
    s.step_description,
    $oud$$f'(x)$oud$,
    $nieuw$$k'(x)$nieuw$
  )
  FROM public.questions_new AS q
  JOIN public.topics_new AS t
    ON t.id = q.topic_id
  JOIN public.topic_clusters_new AS c
    ON c.id = q.cluster_id
   AND c.topic_id = t.id
  WHERE t.slug = 'h6_kettingregel'
    AND c.slug = 'wortel_lineair'
    AND q.order_index = 6
    AND q.latex_body = $body$k(x) = 5\sqrt{3x - 2} + 7$body$
    AND s.question_id = q.id
    AND s.step_order = 2
    AND s.step_description LIKE $pat$%$f'(x) =%$pat$;

  GET DIAGNOSTICS n = ROW_COUNT;
  IF n > 1 THEN
    RAISE EXCEPTION 'Meer dan één stap bijgewerkt (%)', n;
  END IF;

  SELECT s.step_description INTO tekst
  FROM public.question_steps_new AS s
  JOIN public.questions_new AS q
    ON q.id = s.question_id
  JOIN public.topics_new AS t
    ON t.id = q.topic_id
   AND t.slug = 'h6_kettingregel'
  JOIN public.topic_clusters_new AS c
    ON c.id = q.cluster_id
   AND c.topic_id = t.id
   AND c.slug = 'wortel_lineair'
  WHERE q.order_index = 6
    AND q.latex_body = $body$k(x) = 5\sqrt{3x - 2} + 7$body$
    AND s.step_order = 2;

  IF tekst IS NULL THEN
    RAISE EXCEPTION 'Stap 2 van k(x) = 5√(3x-2)+7 is niet gevonden';
  END IF;

  IF tekst IS DISTINCT FROM verwacht THEN
    RAISE EXCEPTION 'Stap 2 noemt k niet, of de rest van de uitleg is mee veranderd';
  END IF;
END $mig$;

COMMIT;
