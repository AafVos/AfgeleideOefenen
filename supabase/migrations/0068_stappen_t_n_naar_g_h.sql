-- Opgeslagen uitleg noemde de teller t en de noemer n.
-- Op de uitlegpagina heet de teller g en de noemer h.
-- Alleen die letters veranderen. Een uitgerekende breuk blijft staan.
--
-- Waar de functie zelf al g of h heet, of waar g en h al de twee
-- termen van een som zijn, zou g' daarna twee verschillende
-- afgeleiden betekenen. Daar verdwijnen t en n, en de tekst zegt
-- "teller" en "noemer". De breuk blijft gelijk.
--
-- t(2 - t) is een product, geen functienaam. N(t) in een verhaal is
-- een hoeveelheid, T(t) een temperatuur of een tijd. Die blijven staan.
-- sin, ln en tan bevatten de letters n(x); die blijven ook staan.
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
  patroon text := $re$(^|[^A-Za-z\\])[tn]'?\(x\)$re$;
BEGIN
  CREATE TEMP TABLE _letters (
    topic_slug text,
    cluster_slug text,
    q_order int,
    step_order int,
    oud text,
    nieuw text
  ) ON COMMIT DROP;

  INSERT INTO _letters (topic_slug, cluster_slug, q_order, step_order, oud, nieuw)
  VALUES
    (
      'h6_combinaties', 'ketting_plus_quotient', 3, 1,
      $o$Benoem: $t(x) = \sqrt{x^2+1}$ en $n(x) = 2x+1$. Bepaal $t'(x) = \dfrac{x}{\sqrt{x^2+1}}$ (kettingregel) en $n'(x) = 2$.$o$,
      $n$De teller is $\sqrt{x^2+1}$ en de noemer is $2x+1$. De afgeleide van de teller is $\dfrac{x}{\sqrt{x^2+1}}$ (kettingregel) en de afgeleide van de noemer is $2$.$n$
    ),
    (
      'h6_combinaties', 'ketting_plus_quotient', 4, 1,
      $o$Benoem: $t(x) = x^2-1$ en $n(x) = \sqrt{4x+1}$. Bepaal $t'(x) = 2x$ en $n'(x) = \dfrac{2}{\sqrt{4x+1}}$ (kettingregel).$o$,
      $n$De teller is $x^2-1$ en de noemer is $\sqrt{4x+1}$. De afgeleide van de teller is $2x$ en de afgeleide van de noemer is $\dfrac{2}{\sqrt{4x+1}}$ (kettingregel).$n$
    ),
    (
      'h7_goniometrie_diff', 'gonio_plus_quotient', 3, 1,
      $o$Benoem: $t(x) = x + \cos(x)$ en $n(x) = \sin(x)$.$o$,
      $n$De teller is $x + \cos(x)$ en de noemer is $\sin(x)$.$n$
    ),
    (
      'h7_goniometrie_diff', 'gonio_plus_quotient', 3, 2,
      $o$Bepaal $t'(x) = 1 - \sin(x)$ en $n'(x) = \cos(x)$. Pas de quotiëntregel toe.$o$,
      $n$De afgeleide van de teller is $1 - \sin(x)$ en de afgeleide van de noemer is $\cos(x)$. Pas de quotiëntregel toe.$n$
    ),
    (
      'h7_goniometrie_diff', 'gonio_plus_quotient', 4, 1,
      $o$Benoem: $t(x) = x^2 + \sin(x)$ en $n(x) = \cos(x)$.$o$,
      $n$De teller is $x^2 + \sin(x)$ en de noemer is $\cos(x)$.$n$
    ),
    (
      'h7_goniometrie_diff', 'gonio_plus_quotient', 4, 2,
      $o$Bepaal $t'(x) = 2x + \cos(x)$ en $n'(x) = -\sin(x)$. Pas de quotiëntregel toe.$o$,
      $n$De afgeleide van de teller is $2x + \cos(x)$ en de afgeleide van de noemer is $-\sin(x)$. Pas de quotiëntregel toe.$n$
    ),
    (
      'h9_e_machten', 'e_plus_quotient', 3, 1,
      $o$Benoem: $t(x) = 2e^x$ en $n(x) = x-1$.$o$,
      $n$De teller is $2e^x$ en de noemer is $x-1$.$n$
    ),
    (
      'h9_e_machten', 'e_plus_quotient', 3, 2,
      $o$Bepaal $t'(x) = 2e^x$ en $n'(x) = 1$. Pas de quotiëntregel toe.$o$,
      $n$De afgeleide van de teller is $2e^x$ en de afgeleide van de noemer is $1$. Pas de quotiëntregel toe.$n$
    ),
    (
      'h9_e_machten', 'e_plus_quotient', 5, 1,
      $o$Benoem: $t(x) = 2e^{-x-1}$ en $n(x) = x^2$.$o$,
      $n$De teller is $2e^{-x-1}$ en de noemer is $x^2$.$n$
    ),
    (
      'h9_e_machten', 'e_plus_quotient', 5, 2,
      $o$Bepaal $t'(x) = -2e^{-x-1}$ (kettingregel) en $n'(x) = 2x$. Pas de quotiëntregel toe.$o$,
      $n$De afgeleide van de teller is $-2e^{-x-1}$ (kettingregel) en de afgeleide van de noemer is $2x$. Pas de quotiëntregel toe.$n$
    ),
    (
      'h9_logaritmes', 'ln_plus_quotient', 3, 1,
      $o$Benoem: $t(x) = x$ en $n(x) = \ln(x)$.$o$,
      $n$De teller is $x$ en de noemer is $\ln(x)$.$n$
    ),
    (
      'h9_logaritmes', 'ln_plus_quotient', 3, 2,
      $o$Bepaal $t'(x) = 1$ en $n'(x) = \dfrac{1}{x}$. Pas de quotiëntregel toe.$o$,
      $n$De afgeleide van de teller is $1$ en de afgeleide van de noemer is $\dfrac{1}{x}$. Pas de quotiëntregel toe.$n$
    ),
    (
      'h9_logaritmes', 'ln_plus_quotient', 4, 1,
      $o$Benoem: $t(x) = \ln(x)$ en $n(x) = x^2$.$o$,
      $n$De teller is $\ln(x)$ en de noemer is $x^2$.$n$
    ),
    (
      'h9_logaritmes', 'ln_plus_quotient', 4, 2,
      $o$Bepaal $t'(x) = \dfrac{1}{x}$ en $n'(x) = 2x$. Pas de quotiëntregel toe.$o$,
      $n$De afgeleide van de teller is $\dfrac{1}{x}$ en de afgeleide van de noemer is $2x$. Pas de quotiëntregel toe.$n$
    ),
    (
      'h2_quotientregel', 'som_met_breuk', 1, 2,
      $o$$g'(x) = 2x$. Voor $h(x)$ pas je de quotiëntregel toe met $t(x) = -3$, $n(x) = x+1$, dus $t'(x) = 0$ en $n'(x) = 1$.$o$,
      $n$$g'(x) = 2x$. Voor de breuk is de teller $-3$ en de noemer $x+1$, dus hun afgeleiden zijn $0$ en $1$.$n$
    ),
    (
      'h2_quotientregel', 'som_met_breuk', 2, 2,
      $o$$g'(x) = 2x$. Voor $h(x)$: $t(x) = -2$, $n(x) = x+4$, $t'(x) = 0$, $n'(x) = 1$.$o$,
      $n$$g'(x) = 2x$. Voor de breuk is de teller $-2$ en de noemer $x+4$, dus hun afgeleiden zijn $0$ en $1$.$n$
    ),
    (
      'h2_quotientregel', 'som_met_breuk', 3, 2,
      $o$$g'(x) = 3$. Voor $h(x)$: $t(x) = 1$, $n(x) = x-1$, $t'(x) = 0$, $n'(x) = 1$.$o$,
      $n$$g'(x) = 3$. Voor de breuk is de teller $1$ en de noemer $x-1$, dus hun afgeleiden zijn $0$ en $1$.$n$
    ),
    (
      'h2_quotientregel', 'som_met_breuk', 4, 2,
      $o$Voor $g(x)$: $t(x) = 3-x^2$, $n(x) = x-2$, $t'(x) = -2x$, $n'(x) = 1$.$o$,
      $n$Voor de breuk $g(x)$ is de teller $3-x^2$ en de noemer $x-2$. Hun afgeleiden zijn $-2x$ en $1$.$n$
    ),
    (
      'h2_quotientregel', 'som_met_breuk', 5, 2,
      $o$$g'(x) = 3x^2$. Voor $h(x)$: $t(x) = 2x+1$, $n(x) = x-3$, $t'(x) = 2$, $n'(x) = 1$.$o$,
      $n$$g'(x) = 3x^2$. Voor de breuk is de teller $2x+1$ en de noemer $x-3$. Hun afgeleiden zijn $2$ en $1$.$n$
    ),
    (
      'h2_quotientregel', 'som_met_breuk', 6, 2,
      $o$$g'(q) = 2q$. Voor $h(q)$: $t(q) = q+1$, $n(q) = 2q-1$, $t'(q) = 1$, $n'(q) = 2$.$o$,
      $n$$g'(q) = 2q$. Voor de breuk is de teller $q+1$ en de noemer $2q-1$. Hun afgeleiden zijn $1$ en $2$.$n$
    ),
    (
      'h2_quotientregel', 'polynoom_breuk', 6, 1,
      $o$De variabele heet $t$. Benoem: $T(t) = t^2 + 1$ en $N(t) = t^3 - t$.$o$,
      $n$De variabele heet $t$. De teller is $t^2 + 1$ en de noemer is $t^3 - t$.$n$
    ),
    (
      'h2_quotientregel', 'polynoom_breuk', 6, 2,
      $o$Bepaal de afgeleiden: $T'(t) = 2t$ en $N'(t) = 3t^2 - 1$.$o$,
      $n$De afgeleide van de teller is $2t$ en de afgeleide van de noemer is $3t^2 - 1$.$n$
    ),
    (
      'h2_quotientregel', 'eenvoudige_breuk', 6, 1,
      $o$De variabele heet $t$. Benoem teller en noemer: $T(t) = 5t + 2$ en $N(t) = 1 - 3t$.$o$,
      $n$De variabele heet $t$. Benoem teller en noemer: $g(t) = 5t + 2$ en $h(t) = 1 - 3t$.$n$
    ),
    (
      'h2_quotientregel', 'eenvoudige_breuk', 6, 2,
      $o$Bepaal de afgeleiden: $T'(t) = 5$ en $N'(t) = -3$.$o$,
      $n$Bepaal de afgeleiden: $g'(t) = 5$ en $h'(t) = -3$.$n$
    );

  FOR r IN SELECT * FROM _letters LOOP
    SELECT count(*) INTO n
    FROM public.question_steps_new AS s
    JOIN public.questions_new AS q
      ON q.id = s.question_id
    JOIN public.topics_new AS t
      ON t.id = q.topic_id
     AND t.slug = r.topic_slug
    JOIN public.topic_clusters_new AS c
      ON c.id = q.cluster_id
     AND c.topic_id = t.id
     AND c.slug = r.cluster_slug
    WHERE q.order_index = r.q_order
      AND s.step_order = r.step_order;

    IF n <> 1 THEN
      RAISE EXCEPTION 'Verwachtte één stap, vond % bij % / % vraag % stap %',
        n, r.topic_slug, r.cluster_slug, r.q_order, r.step_order;
    END IF;

    tekst := pg_temp.stap(r.topic_slug, r.cluster_slug, r.q_order, r.step_order);

    IF tekst = r.oud THEN
      UPDATE public.question_steps_new AS s
      SET step_description = r.nieuw
      FROM public.questions_new AS q
      JOIN public.topics_new AS t
        ON t.id = q.topic_id
       AND t.slug = r.topic_slug
      JOIN public.topic_clusters_new AS c
        ON c.id = q.cluster_id
       AND c.topic_id = t.id
       AND c.slug = r.cluster_slug
      WHERE s.question_id = q.id
        AND q.order_index = r.q_order
        AND s.step_order = r.step_order
        AND s.step_description = r.oud;
    ELSIF tekst IS DISTINCT FROM r.nieuw THEN
      RAISE EXCEPTION 'Onverwachte staptekst bij % / % vraag % stap %: %',
        r.topic_slug, r.cluster_slug, r.q_order, r.step_order, left(tekst, 240);
    END IF;
  END LOOP;

  UPDATE public.question_steps_new
  SET step_description = regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          step_description,
          $re$(^|[^A-Za-z\\])t'\(x\)$re$,
          $r$\1g'(x)$r$,
          'g'
        ),
        $re$(^|[^A-Za-z\\])n'\(x\)$re$,
        $r$\1h'(x)$r$,
        'g'
      ),
      $re$(^|[^A-Za-z\\])t\(x\)$re$,
      $r$\1g(x)$r$,
      'g'
    ),
    $re$(^|[^A-Za-z\\])n\(x\)$re$,
    $r$\1h(x)$r$,
    'g'
  )
  WHERE step_description ~ patroon;

  IF EXISTS (
    SELECT 1
    FROM public.question_steps_new
    WHERE step_description LIKE '%$t(x)$%'
       OR step_description LIKE '%$n(x)$%'
       OR step_description ~ patroon
       OR step_description ~ $re$(^|[^A-Za-z\\])[tn]'?\(q\)$re$
  ) THEN
    SELECT left(step_description, 240) INTO tekst
    FROM public.question_steps_new
    WHERE step_description LIKE '%$t(x)$%'
       OR step_description LIKE '%$n(x)$%'
       OR step_description ~ patroon
       OR step_description ~ $re$(^|[^A-Za-z\\])[tn]'?\(q\)$re$
    LIMIT 1;
    RAISE EXCEPTION 'Er staat nog een stap met teller t of noemer n: %', tekst;
  END IF;

  tekst := pg_temp.stap('h6_combinaties', 'ketting_plus_quotient', 1, 1);
  IF tekst IS DISTINCT FROM $v$Benoem teller en noemer: $g(x) = x+6$ en $h(x) = \sqrt{8x+9} = (8x+9)^{\frac{1}{2}}$.$v$ THEN
    RAISE EXCEPTION 'Stap 1 van (x+6)/sqrt(8x+9) wijkt af: %', left(tekst, 240);
  END IF;
  tekst := pg_temp.stap('h6_combinaties', 'ketting_plus_quotient', 1, 2);
  IF tekst IS DISTINCT FROM $v$Bepaal $g'(x) = 1$ en $h'(x) = \dfrac{8}{2\sqrt{8x+9}} = \dfrac{4}{\sqrt{8x+9}}$ (kettingregel). Pas de quotiëntregel toe.$v$ THEN
    RAISE EXCEPTION 'Stap 2 van (x+6)/sqrt(8x+9) wijkt af: %', left(tekst, 240);
  END IF;
  tekst := pg_temp.stap('h6_combinaties', 'ketting_plus_quotient', 1, 3);
  IF tekst IS DISTINCT FROM $v$Vereenvoudig de teller: $\dfrac{\sqrt{8x+9} - (x+6) \cdot \frac{4}{\sqrt{8x+9}}}{8x+9} = \dfrac{(8x+9) - 4(x+6)}{(8x+9)\sqrt{8x+9}} = \dfrac{4x-15}{(8x+9)\sqrt{8x+9}}$.$v$ THEN
    RAISE EXCEPTION 'De breuk van (x+6)/sqrt(8x+9) is mee veranderd: %', left(tekst, 240);
  END IF;

  IF pg_temp.stap('h2_quotientregel', 'eenvoudige_breuk', 1, 1)
       IS DISTINCT FROM $v$Benoem teller en noemer: $g(x) = x - 2$ en $h(x) = x + 5$.$v$
     OR pg_temp.stap('h2_quotientregel', 'eenvoudige_breuk', 1, 3)
       IS DISTINCT FROM $v$Pas de quotiëntregel toe: $f'(x) = \dfrac{g'(x) h(x) - g(x) h'(x)}{(h(x))^2} = \dfrac{1 \cdot (x+5) - (x-2) \cdot 1}{(x+5)^2}$.$v$
     OR pg_temp.stap('h2_quotientregel', 'eenvoudige_breuk', 1, 4)
       IS DISTINCT FROM $v$Vereenvoudig de teller: $\dfrac{x + 5 - x + 2}{(x+5)^2} = \dfrac{7}{(x+5)^2}$.$v$
  THEN
    RAISE EXCEPTION 'De stappen van (x-2)/(x+5) noemen g en h niet, of de breuk 7/(x+5)^2 is mee veranderd';
  END IF;

  IF pg_temp.stap('h7_goniometrie_diff', 'gonio_plus_quotient', 1, 1)
       IS DISTINCT FROM $v$Benoem: $g(x) = \sin(x)$ en $h(x) = x$.$v$
     OR pg_temp.stap('h7_goniometrie_diff', 'gonio_plus_quotient', 1, 3)
       IS DISTINCT FROM $v$$f'(x) = \dfrac{x\cos(x) - \sin(x)}{x^2}$.$v$
  THEN
    RAISE EXCEPTION 'De sinus in de quotiëntstap is mee veranderd, of de breuk niet';
  END IF;

  IF pg_temp.stap('h9_logaritmes', 'ln_plus_quotient', 1, 1)
       IS DISTINCT FROM $v$Benoem: $g(x) = \ln(x)$ en $h(x) = x$.$v$
     OR pg_temp.stap('h9_logaritmes', 'ln_plus_quotient', 1, 3)
       IS DISTINCT FROM $v$$f'(x) = \dfrac{\frac{1}{x} \cdot x - \ln(x) \cdot 1}{x^2} = \dfrac{1 - \ln(x)}{x^2}$.$v$
  THEN
    RAISE EXCEPTION 'De logaritme in de quotiëntstap is mee veranderd, of de breuk niet';
  END IF;

  IF pg_temp.stap('h6_combinaties', 'ketting_plus_quotient', 3, 1)
       IS DISTINCT FROM $v$De teller is $\sqrt{x^2+1}$ en de noemer is $2x+1$. De afgeleide van de teller is $\dfrac{x}{\sqrt{x^2+1}}$ (kettingregel) en de afgeleide van de noemer is $2$.$v$
     OR pg_temp.stap('h6_combinaties', 'ketting_plus_quotient', 3, 2)
       IS DISTINCT FROM $v$Pas de quotiëntregel toe: $g'(x) = \dfrac{\frac{x}{\sqrt{x^2+1}} \cdot (2x+1) - \sqrt{x^2+1} \cdot 2}{(2x+1)^2}$.$v$
  THEN
    RAISE EXCEPTION 'Bij g(x) = sqrt(x^2+1)/(2x+1) is de breuk mee veranderd';
  END IF;

  IF pg_temp.stap('h2_quotientregel', 'eenvoudige_breuk', 6, 3)
       IS DISTINCT FROM $v$Pas de quotiëntregel toe: $f'(t) = \dfrac{5(1-3t) - (5t+2)(-3)}{(1-3t)^2}$.$v$
     OR pg_temp.stap('h2_quotientregel', 'polynoom_breuk', 6, 3)
       IS DISTINCT FROM $v$Pas de quotiëntregel toe: $g'(t) = \dfrac{2t(t^3-t) - (t^2+1)(3t^2-1)}{(t^3-t)^2}$.$v$
  THEN
    RAISE EXCEPTION 'De breuk met variabele t is mee veranderd';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.question_steps_new
    WHERE strpos(step_description, $v$$t(2 - t) = 0$$v$) > 0
  ) THEN
    RAISE EXCEPTION 'Het product t(2-t) is mee veranderd';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.question_steps_new
    WHERE strpos(step_description, $v$$N(t) = 20t\,e^{-t}$$v$) > 0
  ) THEN
    RAISE EXCEPTION 'De hoeveelheid N(t) in het verhaal is mee veranderd';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.question_steps_new
    WHERE strpos(step_description, $v$$T(t) = 20 + 6\sin(t)$$v$) > 0
  ) THEN
    RAISE EXCEPTION 'De temperatuur T(t) in het verhaal is mee veranderd';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.question_steps_new
    WHERE step_description = $v$Herken: $g(h) = h^3$ en $h(x) = x^2 - 2x + 3$.$v$
  ) THEN
    RAISE EXCEPTION 'Een eerdere stap met g en h is mee veranderd';
  END IF;
END $mig$;

COMMIT;
