-- Twee sommen uit "som met breuk" (hoofdstuk 2, quotiëntregel) hadden een
-- antwoord met een plus en een min achter elkaar: "+ (-7)/..." en
-- "- (-3)/...". De rest van dezelfde soort som staat wél in de korte vorm
-- (vraag 1: 2x + 3/(x + 1)^2, vraag 3: 3 - 1/(x - 1)^2).
--
-- De nakijkcode rekent breuken met een letter in de noemer niet uit: die
-- vergelijkt de tekst. Een leerling die 3x^2 - 7/(x - 3)^2 typte, kreeg dus
-- fout, terwijl dat hetzelfde antwoord is. Het hoofdantwoord wordt nu de
-- korte vorm; de oude vorm blijft als extra schrijfwijze staan, zodat wie
-- hem zo typt nog steeds goed krijgt.
--
-- Nageteld:
--   f(x) = x^3 + (2x+1)/(x-3)
--     teller quotiëntregel: 2(x-3) - (2x+1) = 2x - 6 - 2x - 1 = -7
--     f'(x) = 3x^2 + (-7)/(x-3)^2 = 3x^2 - 7/(x-3)^2
--   h(q) = q^2 - (q+1)/(2q-1)
--     teller quotiëntregel: 1(2q-1) - (q+1)·2 = 2q - 1 - 2q - 2 = -3
--     de breuk heeft een minteken ervoor: -(-3)/(2q-1)^2 = 3/(2q-1)^2
--     h'(q) = 2q + 3/(2q-1)^2
-- Migratie 0069 zette dit al in de uitlegstappen van vraag 6, maar liet het
-- antwoord zelf staan. Stap 4 van vraag 5 laat de vereenvoudiging nu zien.
--
-- Herhaalbaar: twee keer draaien verandert niets extra en zet de oude vorm
-- niet twee keer in de lijst. Bestaat de vraag niet (lege database), dan
-- gebeurt er niets.

BEGIN;

CREATE OR REPLACE FUNCTION pg_temp.vraag_id(p_order int)
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT q.id
  FROM public.questions_new AS q
  JOIN public.topics_new AS t
    ON t.id = q.topic_id
   AND t.slug = 'h2_quotientregel'
  JOIN public.topic_clusters_new AS c
    ON c.id = q.cluster_id
   AND c.topic_id = t.id
   AND c.slug = 'som_met_breuk'
  WHERE q.order_index = p_order;
$$;

-- 1. Het antwoord zelf: korte vorm voorop, dubbele-min-vorm erbij.
UPDATE public.questions_new AS q
SET answer = v.nieuw,
    latex_answer = v.nieuw_latex,
    answer_alternatives = CASE
      WHEN q.answer_alternatives @> ARRAY[v.oud] THEN q.answer_alternatives
      ELSE q.answer_alternatives || v.oud
    END
FROM (
  VALUES
    (
      5,
      $o5$3x^2 + (-7)/(x - 3)^2$o5$,
      $n5$3x^2 - 7/(x - 3)^2$n5$,
      $l5$3x^{2} - \dfrac{7}{(x - 3)^{2}}$l5$
    ),
    (
      6,
      $o6$2q - (-3)/(2q - 1)^2$o6$,
      $n6$2q + 3/(2q - 1)^2$n6$,
      $l6$2q + \dfrac{3}{(2q - 1)^{2}}$l6$
    )
) AS v(q_order, oud, nieuw, nieuw_latex)
WHERE q.id = pg_temp.vraag_id(v.q_order)
  AND q.answer = v.oud;

-- 2. De laatste uitlegstap van vraag 5 eindigde op de dubbele-min-vorm.
UPDATE public.question_steps_new AS s
SET step_description = $n$Combineer: $f'(x) = 3x^2 + \dfrac{-7}{(x-3)^2} = 3x^2 - \dfrac{7}{(x-3)^2}$.$n$
WHERE s.question_id = pg_temp.vraag_id(5)
  AND s.step_order = 4
  AND s.step_description = $o$Combineer: $f'(x) = 3x^2 + \dfrac{-7}{(x-3)^2}$.$o$;

DO $mig$
DECLARE
  r record;
  n int;
  tekst text;
BEGIN
  FOR r IN
    SELECT *
    FROM (
      VALUES
        (
          5,
          $o5$3x^2 + (-7)/(x - 3)^2$o5$,
          $n5$3x^2 - 7/(x - 3)^2$n5$,
          $l5$3x^{2} - \dfrac{7}{(x - 3)^{2}}$l5$
        ),
        (
          6,
          $o6$2q - (-3)/(2q - 1)^2$o6$,
          $n6$2q + 3/(2q - 1)^2$n6$,
          $l6$2q + \dfrac{3}{(2q - 1)^{2}}$l6$
        )
    ) AS v(q_order, oud, nieuw, nieuw_latex)
  LOOP
    IF pg_temp.vraag_id(r.q_order) IS NULL THEN
      CONTINUE;
    END IF;

    SELECT count(*) INTO n
    FROM public.questions_new AS q
    WHERE q.id = pg_temp.vraag_id(r.q_order)
      AND q.answer = r.nieuw
      AND q.latex_answer = r.nieuw_latex
      AND q.answer_alternatives @> ARRAY[r.oud];

    IF n <> 1 THEN
      RAISE EXCEPTION
        'Vraag % heeft niet de korte vorm met de oude vorm erbij', r.q_order;
    END IF;

    SELECT count(*) INTO n
    FROM public.questions_new AS q,
         unnest(q.answer_alternatives) AS vorm
    WHERE q.id = pg_temp.vraag_id(r.q_order)
      AND vorm = r.oud;

    IF n <> 1 THEN
      RAISE EXCEPTION
        'De oude vorm staat % keer bij vraag %', n, r.q_order;
    END IF;
  END LOOP;

  IF pg_temp.vraag_id(5) IS NOT NULL THEN
    SELECT s.step_description INTO tekst
    FROM public.question_steps_new AS s
    WHERE s.question_id = pg_temp.vraag_id(5)
      AND s.step_order = 4;

    IF tekst IS DISTINCT FROM $v$Combineer: $f'(x) = 3x^2 + \dfrac{-7}{(x-3)^2} = 3x^2 - \dfrac{7}{(x-3)^2}$.$v$ THEN
      RAISE EXCEPTION 'Stap 4 van vraag 5 eindigt niet op de korte vorm: %',
        left(COALESCE(tekst, '(geen stap)'), 240);
    END IF;
  END IF;
END $mig$;

COMMIT;
