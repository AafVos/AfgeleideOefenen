-- Opgeslagen uitleg bij h2_productregel / drie_factoren noemde de drie
-- factoren nog u, v en w. Met drie factoren is er geen derde toegestane
-- letter naast f, g en h over, dus deze stappen beschrijven de factoren
-- voortaan zonder ze een naam te geven. Het eindantwoord (stap 4)
-- verandert niet.
--
-- 0067's blanket zoek-vervang (losse u naar g, losse v naar h) liep al
-- over deze teksten heen vóór dit ticket er was: een losse $u(x)$ werd
-- toen al $g(x)$ en een losse $v(x)$ al $h(x)$, maar $w(x)$ bleef staan,
-- en de samengeplakte formule $u'vw + uv'w + uvw'$ werd maar voor één
-- letter aangepast omdat de losse-lettergrens daar niet overal klopte.
-- De "oud"-teksten hieronder zijn dus de huidige (deels al gewijzigde)
-- tekst, niet de allereerste tekst uit migratie 0014.
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
   AND t.slug = 'h2_productregel'
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
BEGIN
  CREATE TEMP TABLE _stappen (
    q_order int,
    step_order int,
    oud text,
    nieuw text
  ) ON COMMIT DROP;

  INSERT INTO _stappen (q_order, step_order, oud, nieuw)
  VALUES
    (
      1, 1,
      $o$Herken het product van drie factoren: $f(x) = g(x) \cdot h(x) \cdot w(x)$ met $g(x) = x$, $h(x) = x-1$, $w(x) = x+2$.$o$,
      $n$Herken het product van drie factoren: $f(x) = x \cdot (x-1) \cdot (x+2)$.$n$
    ),
    (
      1, 2,
      $o$Bepaal de afgeleiden: $g'(x) = 1$, $h'(x) = 1$, $w'(x) = 1$.$o$,
      $n$Bepaal de afgeleiden van de losse factoren: $x$ heeft afgeleide $1$, $x-1$ heeft afgeleide $1$ en $x+2$ heeft afgeleide $1$.$n$
    ),
    (
      1, 3,
      $o$Pas de uitgebreide productregel toe: $f'(x) = g'vw + uv'w + uvw'$.$o$,
      $n$Pas de uitgebreide productregel toe: vermenigvuldig steeds de afgeleide van één factor met de andere twee, en tel de drie uitkomsten op.$n$
    ),
    (
      2, 1,
      $o$De variabele is $t$. Herken drie factoren: $g(t) = t$, $h(t) = t-1$, $w(t) = t+2$.$o$,
      $n$De variabele is $t$. Herken het product van drie factoren: $F(t) = t \cdot (t-1) \cdot (t+2)$.$n$
    ),
    (
      2, 2,
      $o$Bepaal de afgeleiden: $g'(t) = h'(t) = w'(t) = 1$.$o$,
      $n$Bepaal de afgeleiden van de losse factoren: $t$, $t-1$ en $t+2$ hebben alle drie afgeleide $1$.$n$
    ),
    (
      2, 3,
      $o$Pas de uitgebreide productregel toe: $F'(t) = g'vw + uv'w + uvw'$.$o$,
      $n$Pas de uitgebreide productregel toe: vermenigvuldig steeds de afgeleide van één factor met de andere twee, en tel de drie uitkomsten op.$n$
    ),
    (
      3, 1,
      $o$Drie factoren: $g(x) = x+1$, $h(x) = x-2$, $w(x) = 2x+3$.$o$,
      $n$Herken het product van drie factoren: $f(x) = (x+1) \cdot (x-2) \cdot (2x+3)$.$n$
    ),
    (
      3, 2,
      $o$Bepaal de afgeleiden: $g'(x) = 1$, $h'(x) = 1$, $w'(x) = 2$.$o$,
      $n$Bepaal de afgeleiden van de losse factoren: $x+1$ heeft afgeleide $1$, $x-2$ heeft afgeleide $1$ en $2x+3$ heeft afgeleide $2$.$n$
    ),
    (
      3, 3,
      $o$Pas de uitgebreide productregel toe: $f'(x) = g'vw + uv'w + uvw'$.$o$,
      $n$Pas de uitgebreide productregel toe: vermenigvuldig steeds de afgeleide van één factor met de andere twee, en tel de drie uitkomsten op.$n$
    );

  FOR r IN SELECT * FROM _stappen LOOP
    IF pg_temp.stap('drie_factoren', r.q_order, r.step_order) = r.oud THEN
      UPDATE public.question_steps_new AS s
      SET step_description = r.nieuw
      FROM public.questions_new AS q
      JOIN public.topics_new AS t
        ON t.id = q.topic_id
       AND t.slug = 'h2_productregel'
      JOIN public.topic_clusters_new AS c
        ON c.id = q.cluster_id
       AND c.topic_id = t.id
       AND c.slug = 'drie_factoren'
      WHERE s.question_id = q.id
        AND q.order_index = r.q_order
        AND s.step_order = r.step_order
        AND s.step_description = r.oud;
    ELSIF pg_temp.stap('drie_factoren', r.q_order, r.step_order) IS DISTINCT FROM r.nieuw THEN
      RAISE EXCEPTION 'Onverwachte staptekst bij drie_factoren vraag % stap %: %',
        r.q_order, r.step_order, left(pg_temp.stap('drie_factoren', r.q_order, r.step_order), 240);
    END IF;
  END LOOP;

  IF EXISTS (
    SELECT 1
    FROM public.question_steps_new AS s
    JOIN public.questions_new AS q ON q.id = s.question_id
    JOIN public.topics_new AS t ON t.id = q.topic_id AND t.slug = 'h2_productregel'
    JOIN public.topic_clusters_new AS c
      ON c.id = q.cluster_id AND c.topic_id = t.id AND c.slug = 'drie_factoren'
    WHERE s.step_description ~ $re$(^|[^A-Za-z\\])[uvw]'?(\([xt]\))?([^A-Za-z]|$)$re$
  ) THEN
    RAISE EXCEPTION 'Er staat bij drie_factoren nog een stap met functienaam u, v of w';
  END IF;

  -- Het eindantwoord (stap 4) van elke vraag moet ongewijzigd blijven.
  IF pg_temp.stap('drie_factoren', 1, 4)
       IS DISTINCT FROM $v$Invullen: $f'(x) = (x-1)(x+2) + x(x+2) + x(x-1)$.$v$
     OR pg_temp.stap('drie_factoren', 2, 4)
       IS DISTINCT FROM $v$Invullen: $F'(t) = (t-1)(t+2) + t(t+2) + t(t-1)$.$v$
     OR pg_temp.stap('drie_factoren', 3, 4)
       IS DISTINCT FROM $v$Invullen: $f'(x) = (x-2)(2x+3) + (x+1)(2x+3) + 2(x+1)(x-2)$.$v$
  THEN
    RAISE EXCEPTION 'Het eindantwoord van drie_factoren is mee veranderd';
  END IF;
END $mig$;

COMMIT;
