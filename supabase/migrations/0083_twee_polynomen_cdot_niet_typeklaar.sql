-- H2 "De productregel", cluster "twee_polynomen" (h2_productregel /
-- twee_polynomen), vraag 2 en 5: het veld `answer` (waarmee een getypt
-- antwoord vergeleken wordt) bevatte een \cdot vlak na een sluithaakje:
--   vraag 2: -6x(2 + 7x) + (2 - 3x^2) \cdot 7
--   vraag 5: 25x^4(3x - 2) + (5x^5 - 3) \cdot 3
--
-- normalizeAnswer (src/lib/practice/engine.ts) zet \cdot alleen om naar ×
-- als er een cijfer vlak vóór èn vlak ná staat. Hier staat een sluithaakje
-- vóór de \cdot, dus die regel vuurt niet en de letterlijke tekenreeks
-- "\cdot" blijft in de vergelijkingstekst staan. Geen leerling typt dat,
-- dus een inhoudelijk goed antwoord werd nooit geaccepteerd, en er stonden
-- geen answer_alternatives om dat op te vangen.
--
-- Nageteld (f(x) eerst volledig uitschrijven, dan term voor term
-- differentiëren):
--   vraag 2: f(x) = (2 - 3x^2)(2 + 7x) = -21x^3 - 6x^2 + 14x + 4
--            f'(x) = -63x^2 - 12x + 14
--   vraag 5: f(x) = (5x^5 - 3)(3x - 2) = 15x^6 - 10x^5 - 9x + 6
--            f'(x) = 90x^5 - 50x^4 - 9
--
-- Oplossing: `answer` typeklaar maken door de constante vóór het haakje te
-- zetten in plaats van erachter met \cdot -- dezelfde schrijfwijze als de
-- andere vragen in dit cluster (vraag 7/8, zie 0047_h2_aanvullen_tot_8.sql,
-- bv. "2x(x + 4)"). `latex_answer` (het scherm) blijft ongewijzigd; \cdot
-- rendert daar gewoon prima. Als vangnet staan de letterlijke
-- productregel-vorm met een gewone * en de volledig uitgewerkte vorm in
-- answer_alternatives.
--
-- Update via topic-slug + cluster-slug + order_index, niet via een
-- productie-UUID, zodat dit lokaal, in CI en op productie hetzelfde
-- resultaat geeft.
--
-- Herhaalbaar: de UPDATE matcht op het oude `answer`, dus een tweede keer
-- draaien raakt geen rijen meer en zet niets dubbel in de alternatieven.

BEGIN;

UPDATE public.questions_new AS q
SET
  answer = v.nieuw_antwoord,
  answer_alternatives = (
    SELECT COALESCE(array_agg(vorm ORDER BY volgorde), '{}'::text[])
    FROM (
      SELECT vorm, min(volgorde) AS volgorde
      FROM unnest(COALESCE(q.answer_alternatives, '{}'::text[]) || v.extra)
        WITH ORDINALITY AS u(vorm, volgorde)
      WHERE vorm <> ''
      GROUP BY vorm
    ) AS uniek
  )
FROM (
  VALUES
    (
      2,
      $o$-6x(2 + 7x) + (2 - 3x^2) \cdot 7$o$,
      $n$-6x(2 + 7x) + 7(2 - 3x^2)$n$,
      ARRAY[
        $a1$-6x(2 + 7x) + (2 - 3x^2) * 7$a1$,
        $a2$-63x^2 - 12x + 14$a2$
      ]::text[]
    ),
    (
      5,
      $o$25x^4(3x - 2) + (5x^5 - 3) \cdot 3$o$,
      $n$25x^4(3x - 2) + 3(5x^5 - 3)$n$,
      ARRAY[
        $a1$25x^4(3x - 2) + (5x^5 - 3) * 3$a1$,
        $a2$90x^5 - 50x^4 - 9$a2$
      ]::text[]
    )
) AS v(volgorde, oud_antwoord, nieuw_antwoord, extra)
WHERE q.topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel')
  AND q.cluster_id = (
    SELECT tc.id
    FROM public.topic_clusters_new AS tc
    JOIN public.topics_new AS t ON t.id = tc.topic_id
    WHERE t.slug = 'h2_productregel' AND tc.slug = 'twee_polynomen'
  )
  AND q.order_index = v.volgorde
  AND q.answer = v.oud_antwoord;

DO $mig$
DECLARE
  n int;
BEGIN
  SELECT count(*) INTO n
  FROM public.questions_new AS q
  JOIN public.topics_new AS t
    ON t.id = q.topic_id AND t.slug = 'h2_productregel'
  JOIN public.topic_clusters_new AS c
    ON c.id = q.cluster_id AND c.topic_id = t.id AND c.slug = 'twee_polynomen'
  WHERE q.order_index = 2
    AND q.answer = '-6x(2 + 7x) + 7(2 - 3x^2)'
    AND q.answer_alternatives @> ARRAY[
      '-6x(2 + 7x) + (2 - 3x^2) * 7',
      '-63x^2 - 12x + 14'
    ]::text[];

  IF n <> 1 THEN
    RAISE EXCEPTION 'Vraag 2 van h2_productregel/twee_polynomen is niet (goed) bijgewerkt (n=%)', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new AS q
  JOIN public.topics_new AS t
    ON t.id = q.topic_id AND t.slug = 'h2_productregel'
  JOIN public.topic_clusters_new AS c
    ON c.id = q.cluster_id AND c.topic_id = t.id AND c.slug = 'twee_polynomen'
  WHERE q.order_index = 5
    AND q.answer = '25x^4(3x - 2) + 3(5x^5 - 3)'
    AND q.answer_alternatives @> ARRAY[
      '25x^4(3x - 2) + (5x^5 - 3) * 3',
      '90x^5 - 50x^4 - 9'
    ]::text[];

  IF n <> 1 THEN
    RAISE EXCEPTION 'Vraag 5 van h2_productregel/twee_polynomen is niet (goed) bijgewerkt (n=%)', n;
  END IF;
END $mig$;

COMMIT;
