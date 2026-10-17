-- Acht vragen heten zelf h(x), en noemden in de uitleg ook een onderdeel
-- van die functie h(x). Zelfde patroon als 0069 (de breuk) en 0075 (de
-- binnenste functie), nu in H6, H7 en H9.
--
-- Vier productregelvragen noemden de tweede factor h(x) en de eerste g(x).
-- Die heten nu "de eerste factor" en "de tweede factor".
-- Vier kettingregelvragen noemden de binnenste functie h(x). Die heet nu
-- "binnenste" of "de binnenste functie", net als in 0075.
-- h(x) en h'(x) slaan weer alleen op de functie uit de opgave.
-- De laatste stap rekent overal het eindantwoord uit en blijft woord voor
-- woord gelijk.
--
-- Nageteld:
--   h6_combinaties / ketting_plus_product 4   h(x) = x(3x+1)^3
--     eerste factor x -> 1; tweede factor (3x+1)^3 -> 3(3x+1)^2 * 3 = 9(3x+1)^2
--     h'(x) = (3x+1)^3 + x * 9(3x+1)^2
--   h7_goniometrie_diff / gonio_plus_product 4   h(x) = x^2 sin(3x)
--     eerste factor x^2 -> 2x; tweede factor sin(3x) -> 3cos(3x)
--     h'(x) = 2x sin(3x) + x^2 * 3cos(3x) = 2x sin(3x) + 3x^2 cos(3x)
--   h9_e_machten / e_plus_product 5   h(x) = x e^(2x+3)
--     eerste factor x -> 1; tweede factor e^(2x+3) -> 2e^(2x+3)
--     h'(x) = e^(2x+3) + x * 2e^(2x+3) = (1+2x)e^(2x+3)
--   h9_logaritmes / ln_plus_product 4   h(x) = (x+1)ln(x)
--     eerste factor x+1 -> 1; tweede factor ln(x) -> 1/x
--     h'(x) = ln(x) + (x+1)/x
--   h7_goniometrie_diff / ketting_polynoom 6   h(x) = 3cos(x^2-5x+1)
--     binnenste x^2-5x+1 -> 2x-5; buiten 3cos(.) -> -3sin(.)
--     h'(x) = -3(2x-5) sin(x^2-5x+1)
--   h7_goniometrie_diff / macht_van_gonio 4   h(x) = cos^3(x)
--     binnenste cos(x) -> -sin(x); buiten (.)^3 -> 3(.)^2
--     h'(x) = 3cos^2(x) * (-sin(x)) = -3cos^2(x) sin(x)
--   h9_e_machten / ketting_polynoom 5   h(x) = 3e^(x^2+2x)
--     binnenste x^2+2x -> 2x+2
--     h'(x) = 3e^(x^2+2x) * (2x+2) = 3(2x+2)e^(x^2+2x)
--   h9_logaritmes / basis_gx_glog 6   h(x) = 3log(x^2+1)
--     binnenste x^2+1 -> 2x; afgeleide van 3log(u) is u' / (u ln(3))
--     h'(x) = 2x / ((x^2+1) ln(3))
--     Stap 2 zei eerder h'(x) = 2x; dat is de afgeleide van de binnenste,
--     niet van de functie uit de opgave.
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
  CREATE TEMP TABLE _onderdeel (
    topic text,
    cluster text,
    q_order int,
    step_order int,
    oud text,
    nieuw text
  ) ON COMMIT DROP;

  INSERT INTO _onderdeel (topic, cluster, q_order, step_order, oud, nieuw)
  VALUES
    -- Productregel: de tweede factor heette ook h(x).
    (
      'h6_combinaties', 'ketting_plus_product', 4, 1,
      $o$Herken de productregel: $g(x) = x$ en $h(x) = (3x+1)^3$.$o$,
      $n$Herken de productregel: de eerste factor is $x$ en de tweede factor is $(3x+1)^3$.$n$
    ),
    (
      'h6_combinaties', 'ketting_plus_product', 4, 2,
      $o$Bepaal $g'(x) = 1$ en $h'(x) = 3(3x+1)^2 \cdot 3 = 9(3x+1)^2$ (kettingregel).$o$,
      $n$Bepaal de afgeleiden: de eerste factor geeft $1$ en de tweede factor geeft $3(3x+1)^2 \cdot 3 = 9(3x+1)^2$ (kettingregel).$n$
    ),
    (
      'h7_goniometrie_diff', 'gonio_plus_product', 4, 1,
      $o$Herken de productregel: $g(x) = x^2$ en $h(x) = \sin(3x)$.$o$,
      $n$Herken de productregel: de eerste factor is $x^2$ en de tweede factor is $\sin(3x)$.$n$
    ),
    (
      'h7_goniometrie_diff', 'gonio_plus_product', 4, 2,
      $o$Bepaal $g'(x) = 2x$ en $h'(x) = 3\cos(3x)$ (kettingregel).$o$,
      $n$Bepaal de afgeleiden: de eerste factor geeft $2x$ en de tweede factor geeft $3\cos(3x)$ (kettingregel).$n$
    ),
    (
      'h9_e_machten', 'e_plus_product', 5, 1,
      $o$Herken de productregel: $g(x) = x$ en $h(x) = e^{2x+3}$.$o$,
      $n$Herken de productregel: de eerste factor is $x$ en de tweede factor is $e^{2x+3}$.$n$
    ),
    (
      'h9_e_machten', 'e_plus_product', 5, 2,
      $o$Bepaal $g'(x) = 1$ en $h'(x) = 2e^{2x+3}$ (kettingregel).$o$,
      $n$Bepaal de afgeleiden: de eerste factor geeft $1$ en de tweede factor geeft $2e^{2x+3}$ (kettingregel).$n$
    ),
    (
      'h9_logaritmes', 'ln_plus_product', 4, 1,
      $o$Herken de productregel: $g(x) = x+1$ en $h(x) = \ln(x)$.$o$,
      $n$Herken de productregel: de eerste factor is $x+1$ en de tweede factor is $\ln(x)$.$n$
    ),
    (
      'h9_logaritmes', 'ln_plus_product', 4, 2,
      $o$Bepaal $g'(x) = 1$ en $h'(x) = \dfrac{1}{x}$.$o$,
      $n$Bepaal de afgeleiden: de eerste factor geeft $1$ en de tweede factor geeft $\dfrac{1}{x}$.$n$
    ),
    -- Kettingregel: de binnenste functie heette ook h(x).
    (
      'h7_goniometrie_diff', 'ketting_polynoom', 6, 1,
      $o$Herken: buitenste is $3\cos$, binnenste $h(x) = x^2-5x+1$.$o$,
      $n$Herken: buitenste is $3\cos$, binnenste is $x^2-5x+1$.$n$
    ),
    (
      'h7_goniometrie_diff', 'ketting_polynoom', 6, 2,
      $o$Bepaal $h'(x) = 2x-5$. Pas de kettingregel toe: $[3\cos(x^2-5x+1)]' = -3\sin(x^2-5x+1) \cdot (2x-5)$.$o$,
      $n$De binnenste functie heeft afgeleide $2x-5$. Pas de kettingregel toe: $[3\cos(x^2-5x+1)]' = -3\sin(x^2-5x+1) \cdot (2x-5)$.$n$
    ),
    (
      'h7_goniometrie_diff', 'macht_van_gonio', 4, 1,
      $o$Herken: buitenste is $(\cdot)^3$, binnenste $h(x) = \cos(x)$.$o$,
      $n$Herken: buitenste is $(\cdot)^3$, binnenste is $\cos(x)$.$n$
    ),
    (
      'h7_goniometrie_diff', 'macht_van_gonio', 4, 2,
      $o$Bepaal $h'(x) = -\sin(x)$. Pas de kettingregel toe: $[\cos^3(x)]' = 3\cos^2(x) \cdot (-\sin(x))$.$o$,
      $n$De binnenste functie heeft afgeleide $-\sin(x)$. Pas de kettingregel toe: $[\cos^3(x)]' = 3\cos^2(x) \cdot (-\sin(x))$.$n$
    ),
    (
      'h9_e_machten', 'ketting_polynoom', 5, 1,
      $o$Herken: buitenste is $3e^{(\cdot)}$, binnenste $h(x) = x^2+2x$.$o$,
      $n$Herken: buitenste is $3e^{(\cdot)}$, binnenste is $x^2+2x$.$n$
    ),
    (
      'h9_e_machten', 'ketting_polynoom', 5, 2,
      $o$Bepaal $h'(x) = 2x+2$. Pas de kettingregel toe: $[3e^{x^2+2x}]' = 3e^{x^2+2x} \cdot (2x+2)$.$o$,
      $n$De binnenste functie heeft afgeleide $2x+2$. Pas de kettingregel toe: $[3e^{x^2+2x}]' = 3e^{x^2+2x} \cdot (2x+2)$.$n$
    ),
    (
      'h9_logaritmes', 'basis_gx_glog', 6, 1,
      $o$Herken: ${}^3\!\log(x^2+1)$ — de logaritme heeft een samengesteld argument $h(x) = x^2+1$.$o$,
      $n$Herken: ${}^3\!\log(x^2+1)$ — de logaritme heeft een samengesteld argument: de binnenste is $x^2+1$.$n$
    ),
    (
      'h9_logaritmes', 'basis_gx_glog', 6, 2,
      $o$Gebruik de kettingregel: $[{}^3\!\log(h)]' = \dfrac{h'}{h \cdot \ln(3)}$ met $h'(x) = 2x$.$o$,
      $n$De binnenste functie heeft afgeleide $2x$. Pas de kettingregel toe: $[{}^3\!\log(x^2+1)]' = \dfrac{2x}{(x^2+1) \cdot \ln(3)}$.$n$
    );

  FOR r IN SELECT * FROM _onderdeel ORDER BY topic, cluster, step_order LOOP
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

  -- Stap 1 en 2 noemen een onderdeel nergens meer h(x) of h'(x).
  FOR r IN SELECT * FROM _onderdeel ORDER BY topic, cluster, step_order LOOP
    tekst := pg_temp.stap(r.topic, r.cluster, r.q_order, r.step_order);

    IF tekst IS DISTINCT FROM r.nieuw THEN
      RAISE EXCEPTION 'Stap % van %/% vraag % staat niet in de nieuwe vorm: %',
        r.step_order, r.topic, r.cluster, r.q_order, left(tekst, 240);
    END IF;

    IF strpos(tekst, $h$h(x)$h$) > 0 OR strpos(tekst, $d$h'(x)$d$) > 0 THEN
      RAISE EXCEPTION 'Stap % van %/% vraag % noemt een onderdeel nog h: %',
        r.step_order, r.topic, r.cluster, r.q_order, left(tekst, 240);
    END IF;
  END LOOP;

  -- De laatste stap rekent de afgeleide uit en blijft woord voor woord gelijk.
  IF pg_temp.stap('h6_combinaties', 'ketting_plus_product', 4, 3)
       IS DISTINCT FROM $v$Pas de productregel toe: $h'(x) = (3x+1)^3 + x \cdot 9(3x+1)^2 = (3x+1)^3 + 9x(3x+1)^2$.$v$
     OR pg_temp.stap('h7_goniometrie_diff', 'gonio_plus_product', 4, 3)
       IS DISTINCT FROM $v$Pas de productregel toe: $h'(x) = 2x\sin(3x) + 3x^2\cos(3x)$.$v$
     OR pg_temp.stap('h9_e_machten', 'e_plus_product', 5, 3)
       IS DISTINCT FROM $v$Pas de productregel toe: $h'(x) = e^{2x+3} + x \cdot 2e^{2x+3} = (1+2x)e^{2x+3}$.$v$
     OR pg_temp.stap('h9_logaritmes', 'ln_plus_product', 4, 3)
       IS DISTINCT FROM $v$Pas de productregel toe: $h'(x) = \ln(x) + (x+1) \cdot \dfrac{1}{x} = \ln(x) + \dfrac{x+1}{x}$.$v$
     OR pg_temp.stap('h7_goniometrie_diff', 'ketting_polynoom', 6, 3)
       IS DISTINCT FROM $v$Antwoord: $h'(x) = -3(2x-5)\sin(x^2-5x+1)$.$v$
     OR pg_temp.stap('h7_goniometrie_diff', 'macht_van_gonio', 4, 3)
       IS DISTINCT FROM $v$Antwoord: $h'(x) = -3\cos^2(x)\sin(x)$.$v$
     OR pg_temp.stap('h9_e_machten', 'ketting_polynoom', 5, 3)
       IS DISTINCT FROM $v$Antwoord: $h'(x) = 3(2x+2)e^{x^2+2x}$.$v$
     OR pg_temp.stap('h9_logaritmes', 'basis_gx_glog', 6, 3)
       IS DISTINCT FROM $v$Antwoord: $h'(x) = \dfrac{2x}{(x^2+1)\ln(3)}$.$v$
  THEN
    RAISE EXCEPTION 'De laatste stap van een van de acht vragen is veranderd';
  END IF;

  -- Geen enkele vraag die zelf h heet, noemt nog een onderdeel h.
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
