-- Bij h(q) = q^2 - (q+1)/(2q-1) heet de hele functie h.
-- Stap 1 noemde de tweede term ook h(q). Stap 4 gebruikte h'(q)
-- eerst voor die term en daarna voor het hele antwoord.
-- De tweede term heet nu "de breuk". h blijft de hele functie.
-- Het eindantwoord 2q + 3/(2q-1)^2 blijft gelijk.
--
-- Nageteld: de afgeleide van (q+1)/(2q-1) is -3/(2q-1)^2.
-- Met het minteken ervoor wordt dat 3/(2q-1)^2.
-- Samen met de afgeleide van q^2: h'(q) = 2q + 3/(2q-1)^2.
--
-- Herhaalbaar: twee keer draaien laat dezelfde tekst staan.

BEGIN;

CREATE OR REPLACE FUNCTION pg_temp.stap(p_topic text, p_cluster text, p_order int, p_step int)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT s.step_description
  FROM public.question_steps_new AS s
  JOIN public.questions_new AS q
    ON q.id = s.question_id
  JOIN public.topics_new AS t
    ON t.id = q.topic_id
   AND t.slug = p_topic
  JOIN public.topic_clusters_new AS c
    ON c.id = q.cluster_id
   AND c.topic_id = t.id
   AND c.slug = p_cluster
  WHERE q.order_index = p_order
    AND s.step_order = p_step;
$$;

DO $mig$
DECLARE
  r record;
  n int;
  tekst text;
  keer int;
BEGIN
  CREATE TEMP TABLE _letters (
    q_order int,
    step_order int,
    oud text,
    nieuw text
  ) ON COMMIT DROP;

  INSERT INTO _letters (q_order, step_order, oud, nieuw)
  VALUES
    (
      6, 1,
      $o$De variabele is $q$. Splits: $g(q) = q^2$ en $h(q) = -\dfrac{q+1}{2q-1}$.$o$,
      $n$De variabele is $q$. Splits: $g(q) = q^2$ en de breuk $-\dfrac{q+1}{2q-1}$.$n$
    ),
    (
      6, 4,
      $o$Met het minteken voor $h$ wordt het: $h'(q) = -\dfrac{-3}{(2q-1)^2} = \dfrac{3}{(2q-1)^2}$. Combineer: $h'(q) = 2q + \dfrac{3}{(2q-1)^2}$.$o$,
      $n$Met het minteken voor de breuk wordt het $-\dfrac{-3}{(2q-1)^2} = \dfrac{3}{(2q-1)^2}$. Combineer: $h'(q) = 2q + \dfrac{3}{(2q-1)^2}$.$n$
    );

  FOR r IN SELECT * FROM _letters LOOP
    SELECT count(*) INTO n
    FROM public.question_steps_new AS s
    JOIN public.questions_new AS q
      ON q.id = s.question_id
    JOIN public.topics_new AS t
      ON t.id = q.topic_id
     AND t.slug = 'h2_quotientregel'
    JOIN public.topic_clusters_new AS c
      ON c.id = q.cluster_id
     AND c.topic_id = t.id
     AND c.slug = 'som_met_breuk'
    WHERE q.order_index = r.q_order
      AND s.step_order = r.step_order;

    IF n <> 1 THEN
      RAISE EXCEPTION 'Verwachtte één stap, vond % bij som met breuk vraag % stap %',
        n, r.q_order, r.step_order;
    END IF;

    tekst := pg_temp.stap('h2_quotientregel', 'som_met_breuk', r.q_order, r.step_order);

    IF tekst = r.oud THEN
      UPDATE public.question_steps_new AS s
      SET step_description = r.nieuw
      FROM public.questions_new AS q
      JOIN public.topics_new AS t
        ON t.id = q.topic_id
       AND t.slug = 'h2_quotientregel'
      JOIN public.topic_clusters_new AS c
        ON c.id = q.cluster_id
       AND c.topic_id = t.id
       AND c.slug = 'som_met_breuk'
      WHERE s.question_id = q.id
        AND q.order_index = r.q_order
        AND s.step_order = r.step_order
        AND s.step_description = r.oud;

      GET DIAGNOSTICS n = ROW_COUNT;
      IF n <> 1 THEN
        RAISE EXCEPTION 'Stap % van vraag 6 is niet bijgewerkt (rijen: %)', r.step_order, n;
      END IF;
    ELSIF tekst IS DISTINCT FROM r.nieuw THEN
      RAISE EXCEPTION 'Onverwachte staptekst bij som met breuk vraag % stap %: %',
        r.q_order, r.step_order, left(tekst, 240);
    END IF;
  END LOOP;

  tekst := pg_temp.stap('h2_quotientregel', 'som_met_breuk', 6, 1);
  IF tekst IS DISTINCT FROM $v$De variabele is $q$. Splits: $g(q) = q^2$ en de breuk $-\dfrac{q+1}{2q-1}$.$v$
     OR strpos(tekst, $h$$h(q)$$h$) > 0
  THEN
    RAISE EXCEPTION 'Stap 1 noemt de breuk nog h: %', left(tekst, 240);
  END IF;

  tekst := pg_temp.stap('h2_quotientregel', 'som_met_breuk', 6, 4);
  -- De dollar sluit pas aan het eind van de formule, dus niet $h'(q)$.
  keer := (length(tekst) - length(replace(tekst, $n$h'(q)$n$, ''))) / length($n$h'(q)$n$);
  IF tekst IS DISTINCT FROM $v$Met het minteken voor de breuk wordt het $-\dfrac{-3}{(2q-1)^2} = \dfrac{3}{(2q-1)^2}$. Combineer: $h'(q) = 2q + \dfrac{3}{(2q-1)^2}$.$v$
     OR keer <> 1
     OR strpos(tekst, $a$2q + \dfrac{3}{(2q-1)^2}$a$) = 0
  THEN
    RAISE EXCEPTION 'Stap 4 gebruikt h''(q) niet alleen voor het hele antwoord: %', left(tekst, 240);
  END IF;

  IF pg_temp.stap('h2_quotientregel', 'som_met_breuk', 6, 2)
       IS DISTINCT FROM $v$$g'(q) = 2q$. Voor de breuk is de teller $q+1$ en de noemer $2q-1$. Hun afgeleiden zijn $1$ en $2$.$v$
     OR pg_temp.stap('h2_quotientregel', 'som_met_breuk', 6, 3)
       IS DISTINCT FROM $v$Pas de quotiëntregel toe: $\left[\dfrac{q+1}{2q-1}\right]' = \dfrac{1(2q-1) - (q+1) \cdot 2}{(2q-1)^2} = \dfrac{2q-1-2q-2}{(2q-1)^2} = \dfrac{-3}{(2q-1)^2}$.$v$
  THEN
    RAISE EXCEPTION 'Stap 2 of 3 van h(q) is mee veranderd';
  END IF;
END $mig$;

COMMIT;
