-- Opgeslagen uitleg noemde functies nog u en v.
-- De buitenste functie (kettingregel) en de eerste factor (productregel)
-- heten g. De binnenste functie en de tweede factor heten h.
-- Alleen die losse letters veranderen. Een uitgerekende afgeleide,
-- een woord en een LaTeX-commando blijven staan.
--
-- Herhaalbaar: twee keer draaien laat dezelfde tekst staan.

BEGIN;

DO $mig$
DECLARE
  tekst1 text;
  tekst2 text;
  tekst3 text;
  wortel text;
  verwacht1 text := $v1$Herken: $g(h) = h^3$ en $h(x) = x^2 - 2x + 3$.$v1$;
  verwacht2 text := $v2$Bepaal de afgeleiden: $g'(h) = 3h^2$ en $h'(x) = 2x - 2$.$v2$;
  verwacht3 text := $v3$Pas de kettingregel toe: $h'(x) = 3(x^2-2x+3)^2 \cdot (2x-2) = 3(2x-2)(x^2-2x+3)^2$.$v3$;
  verwacht_wortel text := $vw$Herken de productregel: $g(x) = x$ en $h(x) = \sqrt{2x+1} = (2x+1)^{\frac{1}{2}}$.$vw$;
BEGIN
  UPDATE public.question_steps_new
  SET step_description = regexp_replace(
    regexp_replace(
      step_description,
      $re$(^|[^A-Za-z\\])u([^A-Za-z]|$)$re$,
      $r$\1g\2$r$,
      'g'
    ),
    $re$(^|[^A-Za-z\\])v([^A-Za-z]|$)$re$,
    $r$\1h\2$r$,
    'g'
  )
  WHERE step_description ~ $re$(^|[^A-Za-z\\])[uv]([^A-Za-z]|$)$re$;

  IF EXISTS (
    SELECT 1
    FROM public.question_steps_new
    WHERE step_description LIKE '%u(v)%'
       OR step_description LIKE '%v(x)%'
       OR step_description ~ $re$(^|[^A-Za-z\\])[uv]([^A-Za-z]|$)$re$
  ) THEN
    RAISE EXCEPTION 'Er staat nog een stap met functienaam u of v';
  END IF;

  SELECT s.step_description INTO tekst1
  FROM public.question_steps_new AS s
  JOIN public.questions_new AS q ON q.id = s.question_id
  JOIN public.topics_new AS t ON t.id = q.topic_id AND t.slug = 'h6_kettingregel'
  JOIN public.topic_clusters_new AS c
    ON c.id = q.cluster_id AND c.topic_id = t.id AND c.slug = 'macht_polynoom'
  WHERE q.order_index = 4
    AND q.latex_body = $body$h(x) = (x^{2} - 2x + 3)^{3}$body$
    AND s.step_order = 1;

  SELECT s.step_description INTO tekst2
  FROM public.question_steps_new AS s
  JOIN public.questions_new AS q ON q.id = s.question_id
  JOIN public.topics_new AS t ON t.id = q.topic_id AND t.slug = 'h6_kettingregel'
  JOIN public.topic_clusters_new AS c
    ON c.id = q.cluster_id AND c.topic_id = t.id AND c.slug = 'macht_polynoom'
  WHERE q.order_index = 4
    AND q.latex_body = $body$h(x) = (x^{2} - 2x + 3)^{3}$body$
    AND s.step_order = 2;

  SELECT s.step_description INTO tekst3
  FROM public.question_steps_new AS s
  JOIN public.questions_new AS q ON q.id = s.question_id
  JOIN public.topics_new AS t ON t.id = q.topic_id AND t.slug = 'h6_kettingregel'
  JOIN public.topic_clusters_new AS c
    ON c.id = q.cluster_id AND c.topic_id = t.id AND c.slug = 'macht_polynoom'
  WHERE q.order_index = 4
    AND q.latex_body = $body$h(x) = (x^{2} - 2x + 3)^{3}$body$
    AND s.step_order = 3;

  IF tekst1 IS NULL OR tekst2 IS NULL OR tekst3 IS NULL THEN
    RAISE EXCEPTION 'De stappen van h(x) = (x^2-2x+3)^3 zijn niet gevonden';
  END IF;

  IF tekst1 IS DISTINCT FROM verwacht1
     OR tekst2 IS DISTINCT FROM verwacht2
     OR tekst3 IS DISTINCT FROM verwacht3 THEN
    RAISE EXCEPTION 'De voorbeeldstappen noemen g en h niet, of de afgeleide is mee veranderd';
  END IF;

  SELECT s.step_description INTO wortel
  FROM public.question_steps_new AS s
  WHERE s.step_description = verwacht_wortel;

  IF wortel IS NULL THEN
    RAISE EXCEPTION 'De wortel in de productregelstap is mee veranderd';
  END IF;
END $mig$;

COMMIT;
