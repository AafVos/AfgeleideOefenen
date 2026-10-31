-- Drie factoren: niet langer de uitgebreide productregel als los te
-- onthouden 3-term-formule, maar twee keer de gewone productregel na
-- elkaar (AFG-335). Groepeer de eerste twee factoren tot één geheel
-- P, differentieer P met de productregel, en differentieer f dan als het
-- product van P en de derde factor — weer de productregel.
--
-- Migratie 0083 had de formule-tekst al vervangen door woorden ("vermenigvuldig
-- de afgeleide van één factor met de andere twee"), zonder de letter w. Deze
-- migratie verandert niet de letters (die klopten al), maar de manier van
-- uitleggen: niet één 3-term-stap, maar twee keer de productregel.
--
-- Het eindantwoord (de laatste stap per vraag, met de ingevulde formule en —
-- bij vraag 4 t/m 8 — de uitgewerkte veelterm) verandert niet: dat is
-- rechtstreeks nagerekend tegen de bestaande `answer`-kolom en blijft gelijk
-- aan "P'(x) · derde factor + P(x) · (derde factor)'" uitgewerkt, wat
-- algebraïsch hetzelfde is als de oude 3-term-som. Zie
-- src/lib/practice/drie-factoren-twee-keer-productregel.test.ts voor het
-- bewijs per vraag.
--
-- Herhaalbaar: twee keer draaien laat dezelfde tekst staan.

BEGIN;

CREATE OR REPLACE FUNCTION pg_temp.stap(p_order int, p_step int)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT s.step_description
  FROM public.question_steps_new AS s
  JOIN public.questions_new AS q ON q.id = s.question_id
  JOIN public.topics_new AS t ON t.id = q.topic_id AND t.slug = 'h2_productregel'
  JOIN public.topic_clusters_new AS c
    ON c.id = q.cluster_id AND c.topic_id = t.id AND c.slug = 'drie_factoren'
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
      $o$Herken het product van drie factoren: $f(x) = x \cdot (x-1) \cdot (x+2)$.$o$,
      $n$Groepeer de eerste twee factoren: $P(x) = x(x - 1)$. Dan is $f(x) = P(x) \cdot (x + 2)$, het product van twee delen.$n$
    ),
    (
      1, 2,
      $o$Bepaal de afgeleiden van de losse factoren: $x$ heeft afgeleide $1$, $x-1$ heeft afgeleide $1$ en $x+2$ heeft afgeleide $1$.$o$,
      $n$Differentieer $P$ met de productregel: $P'(x) = 1 \cdot (x - 1) + x \cdot 1 = (x - 1) + x$.$n$
    ),
    (
      1, 3,
      $o$Pas de uitgebreide productregel toe: vermenigvuldig steeds de afgeleide van één factor met de andere twee, en tel de drie uitkomsten op.$o$,
      $n$Differentieer $f$ nu als product van $P$ en $(x + 2)$, weer met de productregel: $f'(x) = P'(x)(x + 2) + P(x) \cdot 1 = [(x - 1) + x](x + 2) + x(x - 1)$.$n$
    ),
    (
      2, 1,
      $o$De variabele is $t$. Herken het product van drie factoren: $F(t) = t \cdot (t-1) \cdot (t+2)$.$o$,
      $n$De variabele is $t$. Groepeer de eerste twee factoren: $P(t) = t(t - 1)$. Dan is $F(t) = P(t) \cdot (t + 2)$.$n$
    ),
    (
      2, 2,
      $o$Bepaal de afgeleiden van de losse factoren: $t$, $t-1$ en $t+2$ hebben alle drie afgeleide $1$.$o$,
      $n$Differentieer $P$ met de productregel: $P'(t) = 1 \cdot (t - 1) + t \cdot 1 = (t - 1) + t$.$n$
    ),
    (
      2, 3,
      $o$Pas de uitgebreide productregel toe: vermenigvuldig steeds de afgeleide van één factor met de andere twee, en tel de drie uitkomsten op.$o$,
      $n$Differentieer $F$ nu als product van $P$ en $(t + 2)$, weer met de productregel: $F'(t) = P'(t)(t + 2) + P(t) \cdot 1 = [(t - 1) + t](t + 2) + t(t - 1)$.$n$
    ),
    (
      3, 1,
      $o$Herken het product van drie factoren: $f(x) = (x+1) \cdot (x-2) \cdot (2x+3)$.$o$,
      $n$Groepeer de eerste twee factoren: $P(x) = (x + 1)(x - 2)$. Dan is $f(x) = P(x) \cdot (2x + 3)$.$n$
    ),
    (
      3, 2,
      $o$Bepaal de afgeleiden van de losse factoren: $x+1$ heeft afgeleide $1$, $x-2$ heeft afgeleide $1$ en $2x+3$ heeft afgeleide $2$.$o$,
      $n$Differentieer $P$ met de productregel: $P'(x) = 1 \cdot (x - 2) + (x + 1) \cdot 1 = (x - 2) + (x + 1)$.$n$
    ),
    (
      3, 3,
      $o$Pas de uitgebreide productregel toe: vermenigvuldig steeds de afgeleide van één factor met de andere twee, en tel de drie uitkomsten op.$o$,
      $n$Differentieer $f$ nu als product van $P$ en $(2x + 3)$: de afgeleide van $(2x + 3)$ is $2$, dus $f'(x) = P'(x)(2x + 3) + P(x) \cdot 2 = [(x - 2) + (x + 1)](2x + 3) + 2(x + 1)(x - 2)$.$n$
    ),
    (
      4, 0,
      $o$Er staan drie factoren in een product. Differentieer steeds één factor en laat de andere twee staan. Tel die drie stukken op.$o$,
      $n$Groepeer de eerste twee factoren tot $P$, en differentieer dan twee keer met de productregel: eerst $P$ zelf, daarna $f$ als product van $P$ en de derde factor.$n$
    ),
    (
      4, 1,
      $o$De factoren zijn $x$, $x + 1$ en $x - 3$. Hun afgeleiden zijn alle drie $1$.$o$,
      $n$Groepeer: $P(x) = x(x + 1)$. Met de productregel is $P'(x) = 1 \cdot (x + 1) + x \cdot 1 = (x + 1) + x$.$n$
    ),
    (
      4, 2,
      $o$Eerste stuk: $(x + 1)(x - 3)$. Tweede stuk: $x(x - 3)$. Derde stuk: $x(x + 1)$.$o$,
      $n$Differentieer $f$ als product van $P$ en $(x - 3)$: $f'(x) = P'(x)(x - 3) + P(x) \cdot 1 = [(x + 1) + x](x - 3) + x(x + 1)$.$n$
    ),
    (
      5, 0,
      $o$Er staan drie factoren in een product. Differentieer steeds één factor en laat de andere twee staan.$o$,
      $n$Groepeer de eerste twee factoren tot $P$, en differentieer dan twee keer met de productregel: eerst $P$ zelf, daarna $f$ als product van $P$ en de derde factor.$n$
    ),
    (
      5, 1,
      $o$De factoren zijn $x - 1$, $x + 1$ en $x + 4$. Hun afgeleiden zijn alle drie $1$.$o$,
      $n$Groepeer: $P(x) = (x - 1)(x + 1)$. Met de productregel is $P'(x) = 1 \cdot (x + 1) + (x - 1) \cdot 1 = (x + 1) + (x - 1)$.$n$
    ),
    (
      5, 2,
      $o$De drie stukken zijn $(x + 1)(x + 4)$, $(x - 1)(x + 4)$ en $(x - 1)(x + 1)$.$o$,
      $n$Differentieer $f$ als product van $P$ en $(x + 4)$: $f'(x) = P'(x)(x + 4) + P(x) \cdot 1 = [(x + 1) + (x - 1)](x + 4) + (x - 1)(x + 1)$.$n$
    ),
    (
      6, 0,
      $o$Er staan drie factoren: $2x$, $x + 3$ en $x - 1$. De afgeleide van $2x$ is $2$, niet $1$.$o$,
      $n$Groepeer de eerste twee factoren tot $P$, en differentieer dan twee keer met de productregel. Let op: de afgeleide van $2x$ is $2$, niet $1$.$n$
    ),
    (
      6, 1,
      $o$Afgeleiden: $[2x]' = 2$, $[x + 3]' = 1$ en $[x - 1]' = 1$.$o$,
      $n$Groepeer: $P(x) = 2x(x + 3)$. Met de productregel is $P'(x) = 2 \cdot (x + 3) + 2x \cdot 1 = 2(x + 3) + 2x$.$n$
    ),
    (
      6, 2,
      $o$Eerste stuk: $2(x + 3)(x - 1)$. Tweede: $2x(x - 1)$. Derde: $2x(x + 3)$.$o$,
      $n$Differentieer $f$ als product van $P$ en $(x - 1)$: $f'(x) = P'(x)(x - 1) + P(x) \cdot 1 = [2(x + 3) + 2x](x - 1) + 2x(x + 3)$.$n$
    ),
    (
      7, 0,
      $o$Er staan drie factoren in een product. Differentieer steeds één factor en laat de andere twee staan.$o$,
      $n$Groepeer de eerste twee factoren tot $P$, en differentieer dan twee keer met de productregel: eerst $P$ zelf, daarna $f$ als product van $P$ en de derde factor.$n$
    ),
    (
      7, 1,
      $o$De factoren zijn $x + 2$, $x - 4$ en $x + 5$. Hun afgeleiden zijn alle drie $1$.$o$,
      $n$Groepeer: $P(x) = (x + 2)(x - 4)$. Met de productregel is $P'(x) = 1 \cdot (x - 4) + (x + 2) \cdot 1 = (x - 4) + (x + 2)$.$n$
    ),
    (
      7, 2,
      $o$De drie stukken zijn $(x - 4)(x + 5)$, $(x + 2)(x + 5)$ en $(x + 2)(x - 4)$.$o$,
      $n$Differentieer $f$ als product van $P$ en $(x + 5)$: $f'(x) = P'(x)(x + 5) + P(x) \cdot 1 = [(x - 4) + (x + 2)](x + 5) + (x + 2)(x - 4)$.$n$
    ),
    (
      8, 0,
      $o$Er staan drie factoren: $x^{2}$, $x - 1$ en $x + 3$. De eerste is geen lineaire factor.$o$,
      $n$Groepeer de eerste twee factoren tot $P$, en differentieer dan twee keer met de productregel. De eerste factor is geen lineaire factor: $[x^{2}]' = 2x$.$n$
    ),
    (
      8, 1,
      $o$Afgeleiden: $[x^{2}]' = 2x$, $[x - 1]' = 1$ en $[x + 3]' = 1$.$o$,
      $n$Groepeer: $P(x) = x^{2}(x - 1)$. Met de productregel is $P'(x) = 2x \cdot (x - 1) + x^{2} \cdot 1 = 2x(x - 1) + x^{2}$.$n$
    ),
    (
      8, 2,
      $o$Eerste stuk: $2x(x - 1)(x + 3)$. Tweede: $x^{2}(x + 3)$. Derde: $x^{2}(x - 1)$.$o$,
      $n$Differentieer $f$ als product van $P$ en $(x + 3)$: $f'(x) = P'(x)(x + 3) + P(x) \cdot 1 = [2x(x - 1) + x^{2}](x + 3) + x^{2}(x - 1)$.$n$
    );

  FOR r IN SELECT * FROM _stappen LOOP
    IF pg_temp.stap(r.q_order, r.step_order) = r.oud THEN
      UPDATE public.question_steps_new AS s
      SET step_description = r.nieuw
      FROM public.questions_new AS q
      JOIN public.topics_new AS t ON t.id = q.topic_id AND t.slug = 'h2_productregel'
      JOIN public.topic_clusters_new AS c
        ON c.id = q.cluster_id AND c.topic_id = t.id AND c.slug = 'drie_factoren'
      WHERE s.question_id = q.id
        AND q.order_index = r.q_order
        AND s.step_order = r.step_order
        AND s.step_description = r.oud;
    ELSIF pg_temp.stap(r.q_order, r.step_order) IS DISTINCT FROM r.nieuw THEN
      RAISE EXCEPTION 'Onverwachte staptekst bij drie_factoren vraag % stap %: %',
        r.q_order, r.step_order, left(pg_temp.stap(r.q_order, r.step_order), 240);
    END IF;
  END LOOP;

  -- Geen enkele stap mag een losse u, v of w als functienaam krijgen.
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

  -- Het eindantwoord (de laatste stap per vraag) mag niet meeveranderd zijn.
  IF pg_temp.stap(1, 4)
       IS DISTINCT FROM $v$Invullen: $f'(x) = (x-1)(x+2) + x(x+2) + x(x-1)$.$v$
     OR pg_temp.stap(2, 4)
       IS DISTINCT FROM $v$Invullen: $F'(t) = (t-1)(t+2) + t(t+2) + t(t-1)$.$v$
     OR pg_temp.stap(3, 4)
       IS DISTINCT FROM $v$Invullen: $f'(x) = (x-2)(2x+3) + (x+1)(2x+3) + 2(x+1)(x-2)$.$v$
     OR pg_temp.stap(4, 3)
       IS DISTINCT FROM $v$$f'(x) = (x + 1)(x - 3) + x(x - 3) + x(x + 1)$. Uitgewerkt is dat $3x^{2} - 4x - 3$.$v$
     OR pg_temp.stap(5, 3)
       IS DISTINCT FROM $v$$f'(x) = (x + 1)(x + 4) + (x - 1)(x + 4) + (x - 1)(x + 1)$. Uitgewerkt is dat $3x^{2} + 8x - 1$.$v$
     OR pg_temp.stap(6, 3)
       IS DISTINCT FROM $v$$f'(x) = 2(x + 3)(x - 1) + 2x(x - 1) + 2x(x + 3)$. Uitgewerkt is dat $6x^{2} + 8x - 6$.$v$
     OR pg_temp.stap(7, 3)
       IS DISTINCT FROM $v$$f'(x) = (x - 4)(x + 5) + (x + 2)(x + 5) + (x + 2)(x - 4)$. Uitgewerkt is dat $3x^{2} + 6x - 18$.$v$
     OR pg_temp.stap(8, 3)
       IS DISTINCT FROM $v$$f'(x) = 2x(x - 1)(x + 3) + x^{2}(x + 3) + x^{2}(x - 1)$. Uitgewerkt is dat $4x^{3} + 6x^{2} - 6x$.$v$
  THEN
    RAISE EXCEPTION 'Het eindantwoord van drie_factoren is mee veranderd';
  END IF;
END $mig$;

COMMIT;
