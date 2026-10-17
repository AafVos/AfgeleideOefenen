-- Vier kettingregelvragen in H6 hebben zelf al een functie die h heet.
-- Migratie 0067 maakte overal van de binnenste functie ook h, dus stond
-- er in dezelfde uitleg twee keer h(x) en h'(x) voor iets anders.
-- De binnenste functie heet nu "binnenste" of "de binnenste functie",
-- net als in H7 en H9. h(x) en h'(x) slaan weer alleen op de functie
-- uit de opgave. Stap 3 blijft overal woord voor woord hetzelfde.
--
-- Nageteld:
--   macht_polynoom 4   h(x) = (x^2-2x+3)^3
--     buiten (.)^3 -> 3(.)^2, binnen 2x-2
--     h'(x) = 3(x^2-2x+3)^2 * (2x-2)
--   macht_lineair 4    h(x) = -2(2x+1)^4
--     buiten -2(.)^4 -> -8(.)^3, binnen 2
--     h'(x) = -8(2x+1)^3 * 2 = -16(2x+1)^3
--   wortel_polynoom 4  h(x) = sqrt(x^3+3x)
--     binnen 3x^2+3, h'(x) = 1/2 (x^3+3x)^(-1/2) * (3x^2+3)
--             = (3x^2+3) / (2 sqrt(x^3+3x))
--   negatieve_macht_expressie 4  h(x) = 6/(x^2+3x)^3
--     binnen 2x+3, h'(x) = 6 * (-3)(x^2+3x)^(-4) * (2x+3)
--             = -18(2x+3) / (x^2+3x)^4
--
-- Herhaalbaar: twee keer draaien laat dezelfde tekst staan.

BEGIN;

CREATE OR REPLACE FUNCTION pg_temp.stap(p_cluster text, p_order int, p_step int)
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
   AND t.slug = 'h6_kettingregel'
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
  CREATE TEMP TABLE _binnenste (
    cluster text,
    q_order int,
    step_order int,
    oud text,
    nieuw text
  ) ON COMMIT DROP;

  INSERT INTO _binnenste (cluster, q_order, step_order, oud, nieuw)
  VALUES
    (
      'macht_polynoom', 4, 1,
      $o$Herken: $g(h) = h^3$ en $h(x) = x^2 - 2x + 3$.$o$,
      $n$Herken: buitenste is $(\cdot)^3$, binnenste is $x^2 - 2x + 3$.$n$
    ),
    (
      'macht_polynoom', 4, 2,
      $o$Bepaal de afgeleiden: $g'(h) = 3h^2$ en $h'(x) = 2x - 2$.$o$,
      $n$Bepaal de afgeleiden: de buitenste geeft $3(\cdot)^2$, de binnenste geeft $2x - 2$.$n$
    ),
    (
      'macht_lineair', 4, 1,
      $o$Herken: $g(h) = -2h^4$ en $h(x) = 2x + 1$.$o$,
      $n$Herken: buitenste is $-2(\cdot)^4$, binnenste is $2x + 1$.$n$
    ),
    (
      'macht_lineair', 4, 2,
      $o$Bepaal de afgeleiden: $g'(h) = -8h^3$ en $h'(x) = 2$.$o$,
      $n$Bepaal de afgeleiden: de buitenste geeft $-8(\cdot)^3$, de binnenste geeft $2$.$n$
    ),
    (
      'wortel_polynoom', 4, 1,
      $o$Schrijf om: $\sqrt{x^3+3x} = (x^3+3x)^{\frac{1}{2}}$. Herken $h(x) = x^3 + 3x$.$o$,
      $n$Schrijf om: $\sqrt{x^3+3x} = (x^3+3x)^{\frac{1}{2}}$. De binnenste functie is $x^3 + 3x$.$n$
    ),
    (
      'wortel_polynoom', 4, 2,
      $o$Bepaal $h'(x) = 3x^2 + 3$. Pas de kettingregel toe: $h'(x) = \tfrac{1}{2}(x^3+3x)^{-\frac{1}{2}} \cdot (3x^2+3)$.$o$,
      $n$De binnenste functie heeft afgeleide $3x^2 + 3$. Pas de kettingregel toe: $h'(x) = \tfrac{1}{2}(x^3+3x)^{-\frac{1}{2}} \cdot (3x^2+3)$.$n$
    ),
    (
      'negatieve_macht_expressie', 4, 1,
      $o$Schrijf om: $\dfrac{6}{(x^2+3x)^3} = 6(x^2+3x)^{-3}$. Herken $h(x) = x^2+3x$.$o$,
      $n$Schrijf om: $\dfrac{6}{(x^2+3x)^3} = 6(x^2+3x)^{-3}$. De binnenste functie is $x^2+3x$.$n$
    ),
    (
      'negatieve_macht_expressie', 4, 2,
      $o$Bepaal $h'(x) = 2x+3$. Pas de kettingregel toe: $h'(x) = 6 \cdot (-3)(x^2+3x)^{-4} \cdot (2x+3)$.$o$,
      $n$De binnenste functie heeft afgeleide $2x+3$. Pas de kettingregel toe: $h'(x) = 6 \cdot (-3)(x^2+3x)^{-4} \cdot (2x+3)$.$n$
    );

  FOR r IN SELECT * FROM _binnenste ORDER BY cluster, step_order LOOP
    SELECT count(*) INTO n
    FROM public.question_steps_new AS s
    JOIN public.questions_new AS q
      ON q.id = s.question_id
    JOIN public.topics_new AS t
      ON t.id = q.topic_id
     AND t.slug = 'h6_kettingregel'
    JOIN public.topic_clusters_new AS c
      ON c.id = q.cluster_id
     AND c.topic_id = t.id
     AND c.slug = r.cluster
    WHERE q.order_index = r.q_order
      AND s.step_order = r.step_order;

    IF n <> 1 THEN
      RAISE EXCEPTION 'Verwachtte één stap, vond % bij % vraag % stap %',
        n, r.cluster, r.q_order, r.step_order;
    END IF;

    tekst := pg_temp.stap(r.cluster, r.q_order, r.step_order);

    IF tekst = r.oud THEN
      UPDATE public.question_steps_new AS s
      SET step_description = r.nieuw
      FROM public.questions_new AS q
      JOIN public.topics_new AS t
        ON t.id = q.topic_id
       AND t.slug = 'h6_kettingregel'
      JOIN public.topic_clusters_new AS c
        ON c.id = q.cluster_id
       AND c.topic_id = t.id
       AND c.slug = r.cluster
      WHERE s.question_id = q.id
        AND q.order_index = r.q_order
        AND s.step_order = r.step_order
        AND s.step_description = r.oud;

      GET DIAGNOSTICS n = ROW_COUNT;
      IF n <> 1 THEN
        RAISE EXCEPTION 'Stap % van % vraag % is niet bijgewerkt (rijen: %)',
          r.step_order, r.cluster, r.q_order, n;
      END IF;
    ELSIF tekst IS DISTINCT FROM r.nieuw THEN
      RAISE EXCEPTION 'Onverwachte staptekst bij % vraag % stap %: %',
        r.cluster, r.q_order, r.step_order, left(tekst, 240);
    END IF;
  END LOOP;

  -- Stap 1 en 2 noemen de binnenste functie nergens meer h(x).
  FOR r IN SELECT * FROM _binnenste ORDER BY cluster, step_order LOOP
    tekst := pg_temp.stap(r.cluster, r.q_order, r.step_order);

    IF tekst IS DISTINCT FROM r.nieuw THEN
      RAISE EXCEPTION 'Stap % van % vraag % staat niet in de nieuwe vorm: %',
        r.step_order, r.cluster, r.q_order, left(tekst, 240);
    END IF;

    IF strpos(tekst, $h$h(x)$h$) > 0 THEN
      RAISE EXCEPTION 'Stap % van % vraag % noemt de binnenste functie nog h(x): %',
        r.step_order, r.cluster, r.q_order, left(tekst, 240);
    END IF;

    -- h'(x) mag hooguit één keer staan, en dan voor de hele afgeleide.
    keer := (length(tekst) - length(replace(tekst, $d$h'(x)$d$, ''))) / length($d$h'(x)$d$);
    IF keer > 1 THEN
      RAISE EXCEPTION 'Stap % van % vraag % gebruikt h''(x) % keer: %',
        r.step_order, r.cluster, r.q_order, keer, left(tekst, 240);
    END IF;
  END LOOP;

  -- Stap 3 rekent de afgeleide uit en blijft woord voor woord gelijk.
  IF pg_temp.stap('macht_polynoom', 4, 3)
       IS DISTINCT FROM $v$Pas de kettingregel toe: $h'(x) = 3(x^2-2x+3)^2 \cdot (2x-2) = 3(2x-2)(x^2-2x+3)^2$.$v$
     OR pg_temp.stap('macht_lineair', 4, 3)
       IS DISTINCT FROM $v$Pas de kettingregel toe: $h'(x) = -8(2x+1)^3 \cdot 2 = -16(2x+1)^3$.$v$
     OR pg_temp.stap('wortel_polynoom', 4, 3)
       IS DISTINCT FROM $v$Schrijf terug: $h'(x) = \dfrac{3x^2+3}{2\sqrt{x^3+3x}}$.$v$
     OR pg_temp.stap('negatieve_macht_expressie', 4, 3)
       IS DISTINCT FROM $v$Schrijf terug: $h'(x) = -\dfrac{18(2x+3)}{(x^2+3x)^4}$.$v$
  THEN
    RAISE EXCEPTION 'Stap 3 van een van de vier vragen is veranderd';
  END IF;
END $mig$;

COMMIT;
