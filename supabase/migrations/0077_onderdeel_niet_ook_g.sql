-- Zes vragen heten zelf g(x), en noemden in de uitleg ook een onderdeel
-- van die functie g(x) of g(h). Zelfde patroon als 0069, 0075 en 0076,
-- maar dan voor de letter g in plaats van h.
--
-- Twee kettingregelvragen noemden de buitenste functie g(h) en g'(h).
-- Die heten nu "buitenste", net als in 0075.
-- Vier productregelvragen noemden de eerste factor g(x) en de tweede
-- factor h(x). Die heten nu "de eerste factor" en "de tweede factor",
-- net als in 0076.
-- g(x) en g'(x) slaan weer alleen op de functie uit de opgave.
-- De laatste stap rekent overal het eindantwoord uit en blijft woord voor
-- woord gelijk.
--
-- Nageteld:
--   h6_kettingregel / macht_lineair 3   g(x) = 6(1/2 x - 4)^5
--     buiten 6(.)^5 -> 30(.)^4, binnen 1/2
--     g'(x) = 30(1/2 x - 4)^4 * 1/2 = 15(1/2 x - 4)^4
--   h6_kettingregel / macht_polynoom 3   g(x) = 4(x^3+7x-2)^2
--     buiten 4(.)^2 -> 8(.), binnen 3x^2+7
--     g'(x) = 8(x^3+7x-2) * (3x^2+7)
--   h7_goniometrie_diff / gonio_plus_product 3   g(x) = x cos(2x)
--     eerste factor x -> 1; tweede factor cos(2x) -> -2sin(2x)
--     g'(x) = cos(2x) + x * (-2sin(2x)) = cos(2x) - 2x sin(2x)
--   h9_e_machten / e_plus_product 3   g(x) = (x^2+2)e^x
--     eerste factor x^2+2 -> 2x; tweede factor e^x -> e^x
--     g'(x) = 2x e^x + (x^2+2)e^x = (x^2+2x+2)e^x
--   h9_logaritmes / ln_plus_product 3   g(x) = x^2 ln(x)
--     eerste factor x^2 -> 2x; tweede factor ln(x) -> 1/x
--     g'(x) = 2x ln(x) + x^2 * 1/x = 2x ln(x) + x
--   h6_combinaties / ketting_plus_product 3   g(x) = x sqrt(3x+1)
--     eerste factor x -> 1; tweede factor sqrt(3x+1) -> 3 / (2 sqrt(3x+1))
--     g'(x) = sqrt(3x+1) + 3x / (2 sqrt(3x+1)) = (9x+2) / (2 sqrt(3x+1))
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
BEGIN
  CREATE TEMP TABLE _onderdeel_g (
    topic text,
    cluster text,
    q_order int,
    step_order int,
    oud text,
    nieuw text
  ) ON COMMIT DROP;

  INSERT INTO _onderdeel_g (topic, cluster, q_order, step_order, oud, nieuw)
  VALUES
    -- Kettingregel: de buitenste functie heette ook g.
    (
      'h6_kettingregel', 'macht_lineair', 3, 1,
      $o$Herken: $g(h) = 6h^5$ en $h(x) = \tfrac{1}{2}x - 4$. Let op de constante factor $6$.$o$,
      $n$Herken: buitenste is $6(\cdot)^5$, binnenste is $\tfrac{1}{2}x - 4$. Let op de constante factor $6$.$n$
    ),
    (
      'h6_kettingregel', 'macht_lineair', 3, 2,
      $o$Bepaal de afgeleiden: $g'(h) = 30h^4$ en $h'(x) = \tfrac{1}{2}$.$o$,
      $n$Bepaal de afgeleiden: de buitenste geeft $30(\cdot)^4$, de binnenste geeft $\tfrac{1}{2}$.$n$
    ),
    (
      'h6_kettingregel', 'macht_polynoom', 3, 1,
      $o$Herken: $g(h) = 4h^2$ en $h(x) = x^3 + 7x - 2$.$o$,
      $n$Herken: buitenste is $4(\cdot)^2$, binnenste is $x^3 + 7x - 2$.$n$
    ),
    (
      'h6_kettingregel', 'macht_polynoom', 3, 2,
      $o$Bepaal de afgeleiden: $g'(h) = 8h$ en $h'(x) = 3x^2 + 7$.$o$,
      $n$Bepaal de afgeleiden: de buitenste geeft $8(\cdot)$, de binnenste geeft $3x^2 + 7$.$n$
    ),
    -- Productregel: de eerste factor heette ook g(x).
    (
      'h7_goniometrie_diff', 'gonio_plus_product', 3, 1,
      $o$Herken de productregel: $g(x) = x$ en $h(x) = \cos(2x)$.$o$,
      $n$Herken de productregel: de eerste factor is $x$ en de tweede factor is $\cos(2x)$.$n$
    ),
    (
      'h7_goniometrie_diff', 'gonio_plus_product', 3, 2,
      $o$Bepaal $g'(x) = 1$ en $h'(x) = -2\sin(2x)$ (kettingregel).$o$,
      $n$Bepaal de afgeleiden: de eerste factor geeft $1$ en de tweede factor geeft $-2\sin(2x)$ (kettingregel).$n$
    ),
    (
      'h9_e_machten', 'e_plus_product', 3, 1,
      $o$Herken de productregel: $g(x) = x^2+2$ en $h(x) = e^x$.$o$,
      $n$Herken de productregel: de eerste factor is $x^2+2$ en de tweede factor is $e^x$.$n$
    ),
    (
      'h9_e_machten', 'e_plus_product', 3, 2,
      $o$Bepaal $g'(x) = 2x$ en $h'(x) = e^x$.$o$,
      $n$Bepaal de afgeleiden: de eerste factor geeft $2x$ en de tweede factor geeft $e^x$.$n$
    ),
    (
      'h9_logaritmes', 'ln_plus_product', 3, 1,
      $o$Herken de productregel: $g(x) = x^2$ en $h(x) = \ln(x)$.$o$,
      $n$Herken de productregel: de eerste factor is $x^2$ en de tweede factor is $\ln(x)$.$n$
    ),
    (
      'h9_logaritmes', 'ln_plus_product', 3, 2,
      $o$Bepaal $g'(x) = 2x$ en $h'(x) = \dfrac{1}{x}$.$o$,
      $n$Bepaal de afgeleiden: de eerste factor geeft $2x$ en de tweede factor geeft $\dfrac{1}{x}$.$n$
    ),
    (
      'h6_combinaties', 'ketting_plus_product', 3, 1,
      $o$Herken de productregel: $g(x) = x$ en $h(x) = \sqrt{3x+1}$.$o$,
      $n$Herken de productregel: de eerste factor is $x$ en de tweede factor is $\sqrt{3x+1}$.$n$
    ),
    (
      'h6_combinaties', 'ketting_plus_product', 3, 2,
      $o$Bepaal $g'(x) = 1$ en $h'(x) = \dfrac{3}{2\sqrt{3x+1}}$ (kettingregel).$o$,
      $n$Bepaal de afgeleiden: de eerste factor geeft $1$ en de tweede factor geeft $\dfrac{3}{2\sqrt{3x+1}}$ (kettingregel).$n$
    );

  FOR r IN SELECT * FROM _onderdeel_g ORDER BY topic, cluster, step_order LOOP
    SELECT count(*) INTO n
    FROM public.question_steps_new AS s
    JOIN public.questions_new AS q
      ON q.id = s.question_id
    JOIN public.topics_new AS t
      ON t.id = q.topic_id
     AND t.slug = r.topic
    JOIN public.topic_clusters_new AS c
      ON c.id = q.cluster_id
     AND c.topic_id = t.id
     AND c.slug = r.cluster
    WHERE q.order_index = r.q_order
      AND s.step_order = r.step_order;

    IF n <> 1 THEN
      RAISE EXCEPTION 'Verwachtte één stap, vond % bij %/% vraag % stap %',
        n, r.topic, r.cluster, r.q_order, r.step_order;
    END IF;

    tekst := pg_temp.stap(r.topic, r.cluster, r.q_order, r.step_order);

    IF tekst = r.oud THEN
      UPDATE public.question_steps_new AS s
      SET step_description = r.nieuw
      FROM public.questions_new AS q
      JOIN public.topics_new AS t
        ON t.id = q.topic_id
       AND t.slug = r.topic
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
        RAISE EXCEPTION 'Stap % van %/% vraag % is niet bijgewerkt (rijen: %)',
          r.step_order, r.topic, r.cluster, r.q_order, n;
      END IF;
    ELSIF tekst IS DISTINCT FROM r.nieuw THEN
      RAISE EXCEPTION 'Onverwachte staptekst bij %/% vraag % stap %: %',
        r.topic, r.cluster, r.q_order, r.step_order, left(tekst, 240);
    END IF;
  END LOOP;

  -- Stap 1 en 2 noemen een onderdeel nergens meer g(x), g(h) of g'(h).
  FOR r IN SELECT * FROM _onderdeel_g ORDER BY topic, cluster, step_order LOOP
    tekst := pg_temp.stap(r.topic, r.cluster, r.q_order, r.step_order);

    IF tekst IS DISTINCT FROM r.nieuw THEN
      RAISE EXCEPTION 'Stap % van %/% vraag % staat niet in de nieuwe vorm: %',
        r.step_order, r.topic, r.cluster, r.q_order, left(tekst, 240);
    END IF;

    IF strpos(tekst, $g$g(x)$g$) > 0
       OR strpos(tekst, $g$g(h)$g$) > 0
       OR strpos(tekst, $d$g'(h)$d$) > 0
    THEN
      RAISE EXCEPTION 'Stap % van %/% vraag % noemt een onderdeel nog g: %',
        r.step_order, r.topic, r.cluster, r.q_order, left(tekst, 240);
    END IF;
  END LOOP;

  -- De laatste stap rekent de afgeleide uit en blijft woord voor woord gelijk.
  IF pg_temp.stap('h6_kettingregel', 'macht_lineair', 3, 3)
       IS DISTINCT FROM $v$Pas de kettingregel toe: $g'(x) = 30(\tfrac{1}{2}x-4)^4 \cdot \tfrac{1}{2} = 15(\tfrac{1}{2}x - 4)^4$.$v$
     OR pg_temp.stap('h6_kettingregel', 'macht_polynoom', 3, 3)
       IS DISTINCT FROM $v$Pas de kettingregel toe: $g'(x) = 8(x^3+7x-2) \cdot (3x^2+7) = 8(3x^2+7)(x^3+7x-2)$.$v$
     OR pg_temp.stap('h7_goniometrie_diff', 'gonio_plus_product', 3, 3)
       IS DISTINCT FROM $v$Pas de productregel toe: $g'(x) = \cos(2x) - 2x\sin(2x)$.$v$
     OR pg_temp.stap('h9_e_machten', 'e_plus_product', 3, 3)
       IS DISTINCT FROM $v$Pas de productregel toe: $g'(x) = 2x \cdot e^x + (x^2+2)e^x = (x^2+2x+2)e^x$.$v$
     OR pg_temp.stap('h9_logaritmes', 'ln_plus_product', 3, 3)
       IS DISTINCT FROM $v$Pas de productregel toe: $g'(x) = 2x\ln(x) + x^2 \cdot \dfrac{1}{x} = 2x\ln(x) + x$.$v$
     OR pg_temp.stap('h6_combinaties', 'ketting_plus_product', 3, 3)
       IS DISTINCT FROM $v$Pas de productregel toe en vereenvoudig: $g'(x) = \sqrt{3x+1} + x \cdot \dfrac{3}{2\sqrt{3x+1}} = \dfrac{2(3x+1) + 3x}{2\sqrt{3x+1}} = \dfrac{9x+2}{2\sqrt{3x+1}}$.$v$
  THEN
    RAISE EXCEPTION 'De laatste stap van een van de zes vragen is veranderd';
  END IF;

  -- Geen enkele vraag die zelf g heet, noemt nog een onderdeel g.
  SELECT count(*) INTO n
  FROM public.question_steps_new AS s
  JOIN public.questions_new AS q
    ON q.id = s.question_id
  WHERE q.latex_body ~ $r$^\s*g\s*\($r$
    AND (s.step_description LIKE $p$%g(x) =%$p$
      OR s.step_description LIKE $p$%g(h)%$p$
      OR s.step_description LIKE $p$%g(g)%$p$);

  IF n <> 0 THEN
    RAISE EXCEPTION 'Er zijn nog % stappen die een onderdeel g noemen', n;
  END IF;

  -- Vangnet: en geen enkele vraag die zelf h heet, noemt nog een onderdeel h.
  SELECT count(*) INTO n
  FROM public.question_steps_new AS s
  JOIN public.questions_new AS q
    ON q.id = s.question_id
  WHERE q.latex_body ~ $r$^\s*h\s*\($r$
    AND (s.step_description LIKE $p$%h(x) =%$p$
      OR s.step_description LIKE $p$%h(h)%$p$
      OR s.step_description LIKE $p$%g(h)%$p$);

  IF n <> 0 THEN
    RAISE EXCEPTION 'Er zijn nog % stappen die een onderdeel h noemen', n;
  END IF;
END $mig$;

COMMIT;
