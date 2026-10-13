-- De som f(x) = (x^2 - 1)/(6 - x^2) in "Uitdelen vóór differentiëren"
-- vroeg op het scherm om f'(x), maar het antwoord was een zin.
-- Een leerling die de afgeleide goed uitrekent, kreeg die dus fout.
--
-- Quotiëntregel, nageteld:
--   g(x) = x^2 - 1,  g'(x) = 2x
--   h(x) = 6 - x^2,  h'(x) = -2x
--   teller = 2x(6 - x^2) - (x^2 - 1)(-2x)
--         = 12x - 2x^3 - (-2x^3 + 2x)
--         = 10x
--   f'(x) = 10x / (6 - x^2)^2
--
-- (x^2 - 6)^2 is hetzelfde kwadraat als (6 - x^2)^2.
-- De breukknop zet haakjes neer; die vorm telt ook goed.
-- Een eerder als fout opgeslagen goede vorm wordt weer vrijgegeven,
-- anders blijft die vorm fout staan.
--
-- Herhaalbaar: twee keer draaien zet hetzelfde antwoord en dezelfde stappen.

BEGIN;

CREATE FUNCTION pg_temp.norm_antwoord(raw text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT replace(
    replace(
      replace(
        replace(lower(coalesce(raw, '')), ' ', ''),
        '*', ''
      ),
      '·', ''
    ),
    '−', '-'
  );
$$;

UPDATE public.questions_new AS q
SET
  answer = $ant$10x/(6 - x^2)^2$ant$,
  latex_answer = $latex$\dfrac{10x}{(6 - x^{2})^{2}}$latex$,
  answer_alternatives = ARRAY[
    $a$(10x)/((6 - x^2)^2)$a$,
    $a$(10x)/(6 - x^2)^2$a$,
    $a$10x/((6 - x^2)^2)$a$,
    $a$10x/(x^2 - 6)^2$a$,
    $a$(10x)/((x^2 - 6)^2)$a$,
    $a$(2x(6 - x^2) - (x^2 - 1)(-2x))/(6 - x^2)^2$a$,
    $a$((2x)(6 - x^2) - (x^2 - 1)(-2x))/((6 - x^2)^2)$a$,
    $a$(2x(6 - x^2) - (x^2 - 1)(-2x))/((6 - x^2)^2)$a$,
    $a$10x/(6-x²)²$a$
  ]::text[]
FROM public.topics_new AS t
JOIN public.topic_clusters_new AS c
  ON c.topic_id = t.id
WHERE t.slug = 'h6_machten'
  AND c.slug = 'uitdelen'
  AND q.topic_id = t.id
  AND q.cluster_id = c.id
  AND q.order_index = 5
  AND q.latex_body = $body$f(x) = \dfrac{x^{2} - 1}{6 - x^{2}}$body$;

UPDATE public.question_steps_new AS s
SET step_description = v.tekst
FROM public.questions_new AS q
JOIN public.topics_new AS t
  ON t.id = q.topic_id
JOIN public.topic_clusters_new AS c
  ON c.id = q.cluster_id
 AND c.topic_id = t.id
JOIN (
  VALUES
    (
      1,
      $s1$Uitdelen lukt hier niet: de noemer $6 - x^{2}$ is geen macht van $x$ alleen. Gebruik de quotiëntregel. Noem $g(x) = x^{2} - 1$ en $h(x) = 6 - x^{2}$. De noemer mag niet $0$ zijn, dus $x^{2} \neq 6$.$s1$
    ),
    (
      2,
      $s2$Dan is $g'(x) = 2x$ en $h'(x) = -2x$. Vul in: $f'(x) = \dfrac{2x(6 - x^{2}) - (x^{2} - 1)(-2x)}{(6 - x^{2})^{2}}$.$s2$
    ),
    (
      3,
      $s3$Werk de teller uit: $2x(6 - x^{2}) = 12x - 2x^{3}$ en $(x^{2} - 1)(-2x) = -2x^{3} + 2x$. Trek af: $12x - 2x^{3} - (-2x^{3} + 2x) = 10x$. Dus $f'(x) = \dfrac{10x}{(6 - x^{2})^{2}}$.$s3$
    )
) AS v(volgorde, tekst)
  ON true
WHERE t.slug = 'h6_machten'
  AND c.slug = 'uitdelen'
  AND q.order_index = 5
  AND q.latex_body = $body$f(x) = \dfrac{x^{2} - 1}{6 - x^{2}}$body$
  AND s.question_id = q.id
  AND s.step_order = v.volgorde;

DELETE FROM public.known_wrong_answers_new AS w
USING public.questions_new AS q
JOIN public.topics_new AS t
  ON t.id = q.topic_id
JOIN public.topic_clusters_new AS c
  ON c.id = q.cluster_id
 AND c.topic_id = t.id
WHERE w.question_id = q.id
  AND t.slug = 'h6_machten'
  AND c.slug = 'uitdelen'
  AND q.order_index = 5
  AND q.latex_body = $body$f(x) = \dfrac{x^{2} - 1}{6 - x^{2}}$body$
  AND pg_temp.norm_antwoord(w.wrong_answer) IN (
    SELECT pg_temp.norm_antwoord(vorm)
    FROM unnest(ARRAY[q.answer] || q.answer_alternatives) AS vorm
  );

DO $$
DECLARE
  n int;
  stappen int;
  zin int;
BEGIN
  SELECT count(*) INTO n
  FROM public.questions_new AS q
  JOIN public.topics_new AS t
    ON t.id = q.topic_id
   AND t.slug = 'h6_machten'
  JOIN public.topic_clusters_new AS c
    ON c.id = q.cluster_id
   AND c.topic_id = t.id
   AND c.slug = 'uitdelen'
  WHERE q.order_index = 5
    AND q.latex_body = $body$f(x) = \dfrac{x^{2} - 1}{6 - x^{2}}$body$
    AND q.answer = $ant$10x/(6 - x^2)^2$ant$
    AND q.latex_answer = $latex$\dfrac{10x}{(6 - x^{2})^{2}}$latex$
    AND q.answer_alternatives @> ARRAY[$a$(10x)/((6 - x^2)^2)$a$]::text[]
    AND NOT (q.answer ILIKE '%uitgedeeld%')
    AND NOT (q.latex_answer ILIKE '%quotiëntregel%')
    AND NOT ('Kan niet uitgedeeld worden - quotiëntregel nodig' = ANY (q.answer_alternatives));

  IF n <> 1 THEN
    RAISE EXCEPTION
      'De breuk-opgave heeft niet precies één afgeleide als antwoord (aantal %)',
      n;
  END IF;

  SELECT count(*) INTO stappen
  FROM public.question_steps_new AS s
  JOIN public.questions_new AS q
    ON q.id = s.question_id
  JOIN public.topics_new AS t
    ON t.id = q.topic_id
   AND t.slug = 'h6_machten'
  JOIN public.topic_clusters_new AS c
    ON c.id = q.cluster_id
   AND c.topic_id = t.id
   AND c.slug = 'uitdelen'
  WHERE q.order_index = 5
    AND q.latex_body = $body$f(x) = \dfrac{x^{2} - 1}{6 - x^{2}}$body$
    AND s.step_order IN (1, 2, 3)
    AND s.step_description NOT ILIKE '%herkenvraag%'
    AND s.step_description NOT ILIKE '%h2%';

  IF stappen <> 3 THEN
    RAISE EXCEPTION
      'De uitwerking van de breuk-opgave klopt niet (goede stappen: %)',
      stappen;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.question_steps_new AS s
    JOIN public.questions_new AS q
      ON q.id = s.question_id
    JOIN public.topics_new AS t
      ON t.id = q.topic_id
     AND t.slug = 'h6_machten'
    JOIN public.topic_clusters_new AS c
      ON c.id = q.cluster_id
     AND c.topic_id = t.id
     AND c.slug = 'uitdelen'
    WHERE q.order_index = 5
      AND s.step_order = 3
      AND s.step_description ILIKE '%10x%'
  ) THEN
    RAISE EXCEPTION 'De laatste stap noemt de afgeleide 10x niet';
  END IF;

  SELECT count(*) INTO zin
  FROM public.questions_new AS q
  JOIN public.topics_new AS t
    ON t.id = q.topic_id
   AND t.slug = 'h6_machten'
  JOIN public.topic_clusters_new AS c
    ON c.id = q.cluster_id
   AND c.topic_id = t.id
   AND c.slug = 'uitdelen'
  WHERE q.answer ILIKE '%uitgedeeld%'
     OR q.latex_answer ILIKE '%quotiëntregel%';

  IF zin <> 0 THEN
    RAISE EXCEPTION
      'Er staat nog een zin als antwoord in dit cluster (aantal %)',
      zin;
  END IF;
END $$;

COMMIT;
