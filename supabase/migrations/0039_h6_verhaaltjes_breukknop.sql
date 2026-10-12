-- Drie verhaaltjes in hoofdstuk 6 rekenen een goede breuk fout.
--
-- De breukknop zet haakjes neer, bijvoorbeeld (3)/(2). Die vorm stond
-- niet bij de toegestane antwoorden. 3/2 zelf telt al goed.
-- Het opgeslagen antwoord blijft staan. Alleen de extra vormen komen erbij.
-- Bij 2/3 komt geen kommagetal: 0,67 is niet hetzelfde getal.
--
-- De kolom site is in 0034 weggehaald. Deze database bevat alleen nog
-- afgeleiden. Zoek de rijen op onderwerp, soort, volgnummer en antwoord.
-- Ze hebben geen vast id.
-- Twee keer draaien voegt niets dubbel toe en laat het antwoord staan.

UPDATE public.questions_new AS q
SET answer_alternatives = (
  SELECT COALESCE(array_agg(vorm ORDER BY volgorde), '{}'::text[])
  FROM (
    SELECT vorm, min(volgorde) AS volgorde
    FROM unnest(q.answer_alternatives || v.extra)
      WITH ORDINALITY AS u(vorm, volgorde)
    GROUP BY vorm
  ) AS uniek
)
FROM public.topics_new AS t
JOIN public.topic_clusters_new AS c
  ON c.topic_id = t.id
JOIN (
  VALUES
    (1, '3/2', ARRAY['(3)/(2)', '(3)/2', '1,5', '1.5']::text[]),
    (2, '2/3', ARRAY['(2)/(3)', '(2)/3']::text[]),
    (4, '5/2', ARRAY['(5)/(2)', '(5)/2', '2,5', '2.5']::text[])
) AS v(volgnummer, antwoord, extra)
  ON true
WHERE t.slug = 'h6_kettingregel'
  AND c.slug = 'wortel_in_een_verhaal'
  AND q.topic_id = t.id
  AND q.cluster_id = c.id
  AND q.order_index = v.volgnummer
  AND q.answer = v.antwoord
  AND q.is_ai_generated = false;

-- Blijft het antwoord het kale getal, en zitten de extra vormen erin?
DO $$
DECLARE
  ontbreekt int;
BEGIN
  SELECT count(*) INTO ontbreekt
  FROM (
    VALUES
      (1, '3/2', ARRAY['(3)/(2)', '(3)/2', '1,5', '1.5']::text[]),
      (2, '2/3', ARRAY['(2)/(3)', '(2)/3']::text[]),
      (4, '5/2', ARRAY['(5)/(2)', '(5)/2', '2,5', '2.5']::text[])
  ) AS v(volgnummer, antwoord, extra)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.questions_new AS q
    JOIN public.topics_new AS t
      ON t.id = q.topic_id
     AND t.slug = 'h6_kettingregel'
    JOIN public.topic_clusters_new AS c
      ON c.id = q.cluster_id
     AND c.topic_id = t.id
     AND c.slug = 'wortel_in_een_verhaal'
    WHERE q.order_index = v.volgnummer
      AND q.answer = v.antwoord
      AND q.is_ai_generated = false
      AND q.answer_alternatives @> v.extra
      AND NOT ('0,67' = ANY (q.answer_alternatives))
      AND NOT ('0.67' = ANY (q.answer_alternatives))
  );

  IF ontbreekt <> 0 THEN
    RAISE EXCEPTION
      'Niet alle drie de verhaaltjes in hoofdstuk 6 hebben de extra antwoorden';
  END IF;
END $$;
