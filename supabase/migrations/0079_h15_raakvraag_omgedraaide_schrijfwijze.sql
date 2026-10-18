-- Hoofdstuk 15, "Hoeken en rakende grafieken", soort som "Grafieken die
-- elkaar raken", vraag 7:
--
--   Bereken p exact zodat de grafieken van f(x) = ln(x) en g(x) = 2x + p
--   elkaar raken.
--
-- Nageteld: f'(x) = 1/x en g'(x) = 2, dus 1/x = 2 geeft x = 1/2.
-- f(1/2) = ln(1/2) = -ln(2) en g(1/2) = 1 + p. Uit -ln(2) = 1 + p volgt
-- p = -1 - ln(2). Dat is wat er als antwoord staat.
--
-- De extra schrijfwijzen dekten wel de vorm met haakjes (-(1+ln(2)) en
-- -(ln(2)+1)), maar niet de omgedraaide volgorde zonder haakjes: -ln(2)-1.
-- Dat is precies hetzelfde getal, en het is de vorm die je overhoudt als je
-- -ln(2) = 1 + p herleidt. De nakijkcode rekent een antwoord met ln er niet
-- uit maar vergelijkt de tekst, dus een leerling die -ln(2)-1 typte kreeg
-- onterecht fout.
--
-- Bij de vergelijkbare sommen in dezelfde soort staat die omdraaiing er wel
-- bij: "loodrecht snijden" vraag 6 heeft naast 4+ln(2) ook ln(2)+4, en
-- vraag 7 naast 1+ln(2) ook ln(2)+1. Deze migratie trekt vraag 7 van
-- "grafieken raken" daarmee gelijk.
--
-- Alleen toevoegen: er gaat geen schrijfwijze weg en het antwoord zelf
-- blijft -1-ln(2). Herhaalbaar: een tweede keer draaien zet niets dubbel in
-- de lijst. Bestaat de vraag niet (lege testdatabase), dan gebeurt er niets.

BEGIN;

CREATE OR REPLACE FUNCTION pg_temp.raakvraag_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT q.id
  FROM public.questions_new AS q
  JOIN public.topics_new AS t
    ON t.id = q.topic_id
   AND t.slug = 'h15_raakproblemen'
  JOIN public.topic_clusters_new AS c
    ON c.id = q.cluster_id
   AND c.topic_id = t.id
   AND c.slug = 'grafieken_raken'
  WHERE q.order_index = 7;
$$;

CREATE OR REPLACE FUNCTION pg_temp.omgedraaide_vormen()
RETURNS text[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT ARRAY[
    $v1$-ln(2)-1$v1$,
    $v2$-ln2-1$v2$,
    $v3$p=-ln(2)-1$v3$,
    $v4$p=-ln2-1$v4$
  ]::text[];
$$;

UPDATE public.questions_new AS q
SET answer_alternatives = COALESCE(q.answer_alternatives, '{}'::text[]) || (
  SELECT COALESCE(array_agg(vorm ORDER BY volgorde), '{}'::text[])
  FROM unnest(pg_temp.omgedraaide_vormen()) WITH ORDINALITY AS u(vorm, volgorde)
  WHERE NOT (COALESCE(q.answer_alternatives, '{}'::text[]) @> ARRAY[vorm])
)
WHERE q.id = pg_temp.raakvraag_id()
  AND q.answer = '-1-ln(2)';

DO $mig$
DECLARE
  n int;
  antwoord text;
BEGIN
  IF pg_temp.raakvraag_id() IS NULL THEN
    RETURN;
  END IF;

  SELECT q.answer INTO antwoord
  FROM public.questions_new AS q
  WHERE q.id = pg_temp.raakvraag_id();

  IF antwoord IS DISTINCT FROM '-1-ln(2)' THEN
    RAISE EXCEPTION
      'Vraag 7 van "grafieken raken" heeft een ander antwoord dan -1-ln(2): %',
      left(COALESCE(antwoord, '(leeg)'), 120);
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new AS q
  WHERE q.id = pg_temp.raakvraag_id()
    AND q.answer_alternatives @> pg_temp.omgedraaide_vormen();

  IF n <> 1 THEN
    RAISE EXCEPTION 'De omgedraaide schrijfwijzen staan niet allemaal bij vraag 7';
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new AS q,
       unnest(q.answer_alternatives) AS vorm
  WHERE q.id = pg_temp.raakvraag_id()
    AND vorm = ANY (pg_temp.omgedraaide_vormen());

  IF n <> array_length(pg_temp.omgedraaide_vormen(), 1) THEN
    RAISE EXCEPTION
      'Een omgedraaide schrijfwijze staat dubbel bij vraag 7 (% rijen)', n;
  END IF;

  -- De vormen met haakjes die er al stonden, moeten blijven.
  SELECT count(*) INTO n
  FROM public.questions_new AS q
  WHERE q.id = pg_temp.raakvraag_id()
    AND q.answer_alternatives @> ARRAY['-1-ln2', '-(1+ln(2))', '-(ln(2)+1)']::text[];

  IF n <> 1 THEN
    RAISE EXCEPTION 'Er is een bestaande schrijfwijze van vraag 7 verdwenen';
  END IF;
END $mig$;

COMMIT;
