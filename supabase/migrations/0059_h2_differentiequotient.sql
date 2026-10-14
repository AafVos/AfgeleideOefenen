-- Differentiequotiënt en gemiddelde snelheid (paragraaf 2.1).
-- Eén soort som in hoofdstuk 2, acht eigen opgaven.
-- Het antwoord is een getal. Elke uitkomst is met de computer nageteld.
-- Het onderwerp hangt aan blok 2.1 D: rekenen met een functievoorschrift.
-- Twee keer draaien voegt niets dubbel toe.

BEGIN;

INSERT INTO public.topics_new (
  slug, title, chapter_id, order_index, is_unlocked_by_default, theory_block_id
)
SELECT
  'h2_differentiequotient',
  'Differentiequotiënt en gemiddelde snelheid',
  c.id,
  0,
  true,
  b.id
FROM public.chapters c
JOIN public.theory_blocks b ON b.slug = 'h2-1d'
WHERE c.slug = 'h2'
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  chapter_id = EXCLUDED.chapter_id,
  order_index = EXCLUDED.order_index,
  is_unlocked_by_default = EXCLUDED.is_unlocked_by_default,
  theory_block_id = EXCLUDED.theory_block_id;

INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index)
SELECT
  t.id,
  'differentiequotient',
  'Differentiequotiënt en gemiddelde snelheid',
  1
FROM public.topics_new t
WHERE t.slug = 'h2_differentiequotient'
ON CONFLICT (topic_id, slug) DO UPDATE
SET
  title = EXCLUDED.title,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions_new (
  topic_id, cluster_id, latex_body, answer, latex_answer,
  difficulty, is_ai_generated, order_index, answer_alternatives, answer_prefix
)
SELECT
  t.id, c.id, v.latex_body, v.answer, v.answer,
  v.difficulty, false, v.order_index, '{}'::text[], NULL
FROM (VALUES
  (
    1, 1,
    $vraag$Bereken het differentiequotiënt van $f$ van $x = 2$ tot $x = 6$. Hierbij is $f(x) = 4x + 1$.$vraag$,
    $ant$4$ant$
  ),
  (
    2, 1,
    $vraag$Bereken het differentiequotiënt van $g$ van $x = 1$ tot $x = 5$. Hierbij is $g(x) = x^{2}$.$vraag$,
    $ant$6$ant$
  ),
  (
    3, 1,
    $vraag$Een auto rijdt. De afgelegde weg in meter na $t$ seconden is $f(t) = 5t + 2$. Hoe groot is de gemiddelde snelheid van $t = 2$ tot $t = 6$, in meter per seconde?$vraag$,
    $ant$5$ant$
  ),
  (
    4, 2,
    $vraag$Bereken het differentiequotiënt van $h$ van $x = 1$ tot $x = 5$. Hierbij is $h(x) = x^{2} - 4x$.$vraag$,
    $ant$2$ant$
  ),
  (
    5, 2,
    $vraag$Een bal wordt omhoog gegooid. De hoogte in meter na $t$ seconden is $g(t) = -4t^{2} + 24t$. Hoe groot is de gemiddelde snelheid van $t = 1$ tot $t = 5$, in meter per seconde?$vraag$,
    $ant$0$ant$
  ),
  (
    6, 2,
    $vraag$Bereken het differentiequotiënt van $f$ van $x = 0$ tot $x = 2$. Hierbij is $f(x) = x^{3} - 3x$.$vraag$,
    $ant$1$ant$
  ),
  (
    7, 3,
    $vraag$Bereken het differentiequotiënt van $g$ van $x = 1$ tot $x = 4$. Hierbij is $g(x) = 2x^{2} - 6x + 4$.$vraag$,
    $ant$4$ant$
  ),
  (
    8, 3,
    $vraag$Een drone vliegt. De hoogte in meter na $t$ seconden is $h(t) = t^{2} - 10t + 30$. Hoe groot is de gemiddelde snelheid van $t = 2$ tot $t = 6$, in meter per seconde? Reken een daling negatief.$vraag$,
    $ant$-2$ant$
  )
) AS v(order_index, difficulty, latex_body, answer)
JOIN public.topics_new t
  ON t.slug = 'h2_differentiequotient'
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id
 AND c.slug = 'differentiequotient'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.questions_new q
  WHERE q.cluster_id = c.id
    AND q.order_index = v.order_index
);

INSERT INTO public.question_steps_new (question_id, step_order, step_description)
SELECT q.id, v.step_order, v.step_description
FROM (VALUES
  (
    1, 0,
    $stap$Het differentiequotiënt van $f$ van $x = 2$ tot $x = 6$ is $\dfrac{f(6) - f(2)}{6 - 2}$.$stap$
  ),
  (
    1, 1,
    $stap$$f(6) = 4 \cdot 6 + 1 = 25$ en $f(2) = 4 \cdot 2 + 1 = 9$.$stap$
  ),
  (
    1, 2,
    $stap$Trek af en deel: $\dfrac{25 - 9}{4} = \dfrac{16}{4} = 4$.$stap$
  ),
  (
    1, 3,
    $stap$Het differentiequotiënt is $4$.$stap$
  ),
  (
    2, 0,
    $stap$Het differentiequotiënt van $g$ van $x = 1$ tot $x = 5$ is $\dfrac{g(5) - g(1)}{5 - 1}$.$stap$
  ),
  (
    2, 1,
    $stap$$g(5) = 5^{2} = 25$ en $g(1) = 1^{2} = 1$.$stap$
  ),
  (
    2, 2,
    $stap$Trek af en deel: $\dfrac{25 - 1}{4} = \dfrac{24}{4} = 6$.$stap$
  ),
  (
    2, 3,
    $stap$Het differentiequotiënt is $6$.$stap$
  ),
  (
    3, 0,
    $stap$De gemiddelde snelheid is de verandering van de afgelegde weg gedeeld door de verandering van de tijd: $\dfrac{f(6) - f(2)}{6 - 2}$.$stap$
  ),
  (
    3, 1,
    $stap$$f(6) = 5 \cdot 6 + 2 = 32$ en $f(2) = 5 \cdot 2 + 2 = 12$.$stap$
  ),
  (
    3, 2,
    $stap$Trek af en deel: $\dfrac{32 - 12}{4} = \dfrac{20}{4} = 5$.$stap$
  ),
  (
    3, 3,
    $stap$De gemiddelde snelheid is $5$ meter per seconde.$stap$
  ),
  (
    4, 0,
    $stap$Het differentiequotiënt van $h$ van $x = 1$ tot $x = 5$ is $\dfrac{h(5) - h(1)}{5 - 1}$.$stap$
  ),
  (
    4, 1,
    $stap$$h(5) = 5^{2} - 4 \cdot 5 = 25 - 20 = 5$ en $h(1) = 1^{2} - 4 \cdot 1 = -3$.$stap$
  ),
  (
    4, 2,
    $stap$Trek af en deel: $\dfrac{5 - (-3)}{4} = \dfrac{8}{4} = 2$.$stap$
  ),
  (
    4, 3,
    $stap$Het differentiequotiënt is $2$.$stap$
  ),
  (
    5, 0,
    $stap$De gemiddelde snelheid is de verandering van de hoogte gedeeld door de verandering van de tijd: $\dfrac{g(5) - g(1)}{5 - 1}$.$stap$
  ),
  (
    5, 1,
    $stap$$g(1) = -4 \cdot 1^{2} + 24 \cdot 1 = 20$ en $g(5) = -4 \cdot 5^{2} + 24 \cdot 5 = -100 + 120 = 20$.$stap$
  ),
  (
    5, 2,
    $stap$Trek af en deel: $\dfrac{20 - 20}{4} = 0$.$stap$
  ),
  (
    5, 3,
    $stap$De hoogte is op beide tijdstippen gelijk. De gemiddelde snelheid is $0$ meter per seconde.$stap$
  ),
  (
    6, 0,
    $stap$Het differentiequotiënt van $f$ van $x = 0$ tot $x = 2$ is $\dfrac{f(2) - f(0)}{2 - 0}$.$stap$
  ),
  (
    6, 1,
    $stap$$f(2) = 2^{3} - 3 \cdot 2 = 8 - 6 = 2$ en $f(0) = 0$.$stap$
  ),
  (
    6, 2,
    $stap$Trek af en deel: $\dfrac{2 - 0}{2} = 1$.$stap$
  ),
  (
    6, 3,
    $stap$Het differentiequotiënt is $1$.$stap$
  ),
  (
    7, 0,
    $stap$Het differentiequotiënt van $g$ van $x = 1$ tot $x = 4$ is $\dfrac{g(4) - g(1)}{4 - 1}$.$stap$
  ),
  (
    7, 1,
    $stap$$g(4) = 2 \cdot 4^{2} - 6 \cdot 4 + 4 = 32 - 24 + 4 = 12$ en $g(1) = 2 \cdot 1^{2} - 6 \cdot 1 + 4 = 0$.$stap$
  ),
  (
    7, 2,
    $stap$Trek af en deel: $\dfrac{12 - 0}{3} = 4$.$stap$
  ),
  (
    7, 3,
    $stap$Het differentiequotiënt is $4$.$stap$
  ),
  (
    8, 0,
    $stap$De gemiddelde snelheid is de verandering van de hoogte gedeeld door de verandering van de tijd: $\dfrac{h(6) - h(2)}{6 - 2}$. Een daling geeft een negatief getal.$stap$
  ),
  (
    8, 1,
    $stap$$h(2) = 2^{2} - 10 \cdot 2 + 30 = 4 - 20 + 30 = 14$ en $h(6) = 6^{2} - 10 \cdot 6 + 30 = 36 - 60 + 30 = 6$.$stap$
  ),
  (
    8, 2,
    $stap$Trek af en deel: $\dfrac{6 - 14}{4} = \dfrac{-8}{4} = -2$.$stap$
  ),
  (
    8, 3,
    $stap$De drone daalt. De gemiddelde snelheid is $-2$ meter per seconde.$stap$
  )
) AS v(q_order, step_order, step_description)
JOIN public.topics_new t
  ON t.slug = 'h2_differentiequotient'
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id
 AND c.slug = 'differentiequotient'
JOIN public.questions_new q
  ON q.topic_id = t.id
 AND q.cluster_id = c.id
 AND q.order_index = v.q_order
ON CONFLICT (question_id, step_order) DO NOTHING;

DO $$
DECLARE
  n int;
  n_zonder int;
  n_fout int;
  blok text;
BEGIN
  SELECT b.slug INTO blok
  FROM public.topics_new t
  JOIN public.theory_blocks b ON b.id = t.theory_block_id
  JOIN public.chapters h ON h.id = t.chapter_id
  WHERE t.slug = 'h2_differentiequotient'
    AND h.slug = 'h2';

  IF blok IS DISTINCT FROM 'h2-1d' THEN
    RAISE EXCEPTION 'onderwerp hangt niet aan 2.1 D, maar aan %', blok;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new c ON c.id = q.cluster_id
  JOIN public.topics_new t ON t.id = c.topic_id
  WHERE t.slug = 'h2_differentiequotient'
    AND c.slug = 'differentiequotient';

  SELECT count(*) INTO n_zonder
  FROM public.questions_new q
  JOIN public.topic_clusters_new c ON c.id = q.cluster_id
  JOIN public.topics_new t ON t.id = c.topic_id
  WHERE t.slug = 'h2_differentiequotient'
    AND c.slug = 'differentiequotient'
    AND (
      SELECT count(*)
      FROM public.question_steps_new s
      WHERE s.question_id = q.id
        AND s.step_order IN (0, 1, 2, 3)
    ) < 4;

  SELECT count(*) INTO n_fout
  FROM (VALUES
    (1, 1, '4'),
    (2, 1, '6'),
    (3, 1, '5'),
    (4, 2, '2'),
    (5, 2, '0'),
    (6, 2, '1'),
    (7, 3, '4'),
    (8, 3, '-2')
  ) AS v(nr, moeilijkheid, antwoord)
  JOIN public.topics_new t ON t.slug = 'h2_differentiequotient'
  JOIN public.topic_clusters_new c
    ON c.topic_id = t.id AND c.slug = 'differentiequotient'
  LEFT JOIN public.questions_new q
    ON q.cluster_id = c.id AND q.order_index = v.nr
  WHERE q.id IS NULL
     OR q.answer IS DISTINCT FROM v.antwoord
     OR q.latex_answer IS DISTINCT FROM v.antwoord
     OR q.difficulty IS DISTINCT FROM v.moeilijkheid
     OR q.answer_prefix IS NOT NULL;

  IF n <> 8 OR n_zonder <> 0 OR n_fout <> 0 THEN
    RAISE EXCEPTION 'differentiequotiënt klopt niet: aantal %, zonder stappen %, foute antwoorden %',
      n, n_zonder, n_fout;
  END IF;
END $$;

COMMIT;
