-- Raaklijn met gegeven richtingscoëfficiënt (paragraaf 2.4, blok D). Dit
-- blok had nog geen oefenstof.
--
-- Eén soort som: gegeven een functie en een gevraagde richtingscoëfficiënt,
-- eerst het punt bepalen waar de grafiek die helling heeft (f'(x) = rc
-- oplossen, telkens met precies één oplossing) en dan de raaklijn in dat
-- punt opstellen. Het antwoord is het rechterlid van de raaklijn, met
-- answer_prefix 'y ='.
--
-- Elke uitkomst is onafhankelijk nagerekend in
-- src/lib/practice/raaklijn-richtingscoefficient.test.ts.
--
-- Twee keer draaien voegt niets dubbel toe.

BEGIN;

INSERT INTO public.topics_new (
  slug, title, chapter_id, order_index, is_unlocked_by_default, theory_block_id
)
SELECT
  'h2_raaklijn_richtingscoefficient',
  'Raaklijn met gegeven richtingscoëfficiënt',
  c.id,
  1,
  true,
  b.id
FROM public.chapters c
JOIN public.theory_blocks b ON b.slug = 'h2-4d'
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
  'raaklijn_richtingscoefficient',
  'Raaklijn met gegeven richtingscoëfficiënt',
  1
FROM public.topics_new t
WHERE t.slug = 'h2_raaklijn_richtingscoefficient'
ON CONFLICT (topic_id, slug) DO UPDATE
SET
  title = EXCLUDED.title,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions_new (
  topic_id, cluster_id, latex_body, answer, latex_answer,
  difficulty, is_ai_generated, order_index, answer_alternatives, answer_prefix
)
SELECT
  t.id, c.id, v.latex_body, v.answer, v.latex_answer,
  v.difficulty, false, v.order_index, v.alternatives, v.answer_prefix
FROM (VALUES
  (
    1, 1,
    $vraag$Voor welke raaklijn aan de grafiek van $f$ is de richtingscoëfficiënt $6$? Hierbij is $f(x) = x^{2}$. Bepaal de vergelijking van die raaklijn.$vraag$,
    $ant$6x - 9$ant$,
    $latex$6x - 9$latex$,
    'y =',
    ARRAY[]::text[]
  ),
  (
    2, 1,
    $vraag$Voor welke raaklijn aan de grafiek van $g$ is de richtingscoëfficiënt $2$? Hierbij is $g(x) = x^{2} - 4x$. Bepaal de vergelijking van die raaklijn.$vraag$,
    $ant$2x - 9$ant$,
    $latex$2x - 9$latex$,
    'y =',
    ARRAY[]::text[]
  ),
  (
    3, 1,
    $vraag$Voor welke raaklijn aan de grafiek van $h$ is de richtingscoëfficiënt $-2$? Hierbij is $h(x) = -x^{2} + 2x$. Bepaal de vergelijking van die raaklijn.$vraag$,
    $ant$-2x + 4$ant$,
    $latex$-2x + 4$latex$,
    'y =',
    ARRAY[]::text[]
  ),
  (
    4, 2,
    $vraag$Voor welke raaklijn aan de grafiek van $f$ is de richtingscoëfficiënt $5$? Hierbij is $f(x) = 2x^{2} - 3x$. Bepaal de vergelijking van die raaklijn.$vraag$,
    $ant$5x - 8$ant$,
    $latex$5x - 8$latex$,
    'y =',
    ARRAY[]::text[]
  ),
  (
    5, 2,
    $vraag$Voor welke raaklijn aan de grafiek van $g$ is de richtingscoëfficiënt $-3$? Hierbij is $g(x) = x^{2} + x - 6$. Bepaal de vergelijking van die raaklijn.$vraag$,
    $ant$-3x - 10$ant$,
    $latex$-3x - 10$latex$,
    'y =',
    ARRAY[]::text[]
  ),
  (
    6, 2,
    $vraag$Voor welke raaklijn aan de grafiek van $h$ is de richtingscoëfficiënt $10$? Hierbij is $h(x) = 3x^{2} - 2x$. Bepaal de vergelijking van die raaklijn.$vraag$,
    $ant$10x - 12$ant$,
    $latex$10x - 12$latex$,
    'y =',
    ARRAY[]::text[]
  ),
  (
    7, 3,
    $vraag$Voor welke raaklijn aan de grafiek van $f$ is de richtingscoëfficiënt $1$? Hierbij is $f(x) = -2x^{2} + 5x$. Bepaal de vergelijking van die raaklijn.$vraag$,
    $ant$x + 2$ant$,
    $latex$x + 2$latex$,
    'y =',
    ARRAY[]::text[]
  ),
  (
    8, 3,
    $vraag$Voor welke raaklijn aan de grafiek van $g$ is de richtingscoëfficiënt $-8$? Hierbij is $g(x) = x^{2} - 6x + 2$. Bepaal de vergelijking van die raaklijn.$vraag$,
    $ant$-8x + 1$ant$,
    $latex$-8x + 1$latex$,
    'y =',
    ARRAY[]::text[]
  )
) AS v(order_index, difficulty, latex_body, answer, latex_answer, answer_prefix, alternatives)
JOIN public.topics_new t
  ON t.slug = 'h2_raaklijn_richtingscoefficient'
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id
 AND c.slug = 'raaklijn_richtingscoefficient'
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
    $stap$De richtingscoëfficiënt van de raaklijn is $f'(x)$. Los op: $f'(x) = 6$.$stap$
  ),
  (
    1, 1,
    $stap$$f'(x) = 2x$, dus $2x = 6$, dus $x = 3$.$stap$
  ),
  (
    1, 2,
    $stap$$f(3) = 3^{2} = 9$.$stap$
  ),
  (
    1, 3,
    $stap$De raaklijn is $y = 9 + 6(x - 3) = 6x - 9$.$stap$
  ),
  (
    2, 0,
    $stap$De richtingscoëfficiënt van de raaklijn is $g'(x)$. Los op: $g'(x) = 2$.$stap$
  ),
  (
    2, 1,
    $stap$$g'(x) = 2x - 4$, dus $2x - 4 = 2$, dus $x = 3$.$stap$
  ),
  (
    2, 2,
    $stap$$g(3) = 3^{2} - 4 \cdot 3 = 9 - 12 = -3$.$stap$
  ),
  (
    2, 3,
    $stap$De raaklijn is $y = -3 + 2(x - 3) = 2x - 9$.$stap$
  ),
  (
    3, 0,
    $stap$De richtingscoëfficiënt van de raaklijn is $h'(x)$. Los op: $h'(x) = -2$.$stap$
  ),
  (
    3, 1,
    $stap$$h'(x) = -2x + 2$, dus $-2x + 2 = -2$, dus $x = 2$.$stap$
  ),
  (
    3, 2,
    $stap$$h(2) = -(2)^{2} + 2 \cdot 2 = -4 + 4 = 0$.$stap$
  ),
  (
    3, 3,
    $stap$De raaklijn is $y = 0 + (-2)(x - 2) = -2x + 4$.$stap$
  ),
  (
    4, 0,
    $stap$De richtingscoëfficiënt van de raaklijn is $f'(x)$. Los op: $f'(x) = 5$.$stap$
  ),
  (
    4, 1,
    $stap$$f'(x) = 4x - 3$, dus $4x - 3 = 5$, dus $x = 2$.$stap$
  ),
  (
    4, 2,
    $stap$$f(2) = 2 \cdot 2^{2} - 3 \cdot 2 = 8 - 6 = 2$.$stap$
  ),
  (
    4, 3,
    $stap$De raaklijn is $y = 2 + 5(x - 2) = 5x - 8$.$stap$
  ),
  (
    5, 0,
    $stap$De richtingscoëfficiënt van de raaklijn is $g'(x)$. Los op: $g'(x) = -3$.$stap$
  ),
  (
    5, 1,
    $stap$$g'(x) = 2x + 1$, dus $2x + 1 = -3$, dus $x = -2$.$stap$
  ),
  (
    5, 2,
    $stap$$g(-2) = (-2)^{2} + (-2) - 6 = 4 - 2 - 6 = -4$.$stap$
  ),
  (
    5, 3,
    $stap$De raaklijn is $y = -4 + (-3)(x - (-2)) = -4 - 3(x + 2) = -3x - 10$.$stap$
  ),
  (
    6, 0,
    $stap$De richtingscoëfficiënt van de raaklijn is $h'(x)$. Los op: $h'(x) = 10$.$stap$
  ),
  (
    6, 1,
    $stap$$h'(x) = 6x - 2$, dus $6x - 2 = 10$, dus $x = 2$.$stap$
  ),
  (
    6, 2,
    $stap$$h(2) = 3 \cdot 2^{2} - 2 \cdot 2 = 12 - 4 = 8$.$stap$
  ),
  (
    6, 3,
    $stap$De raaklijn is $y = 8 + 10(x - 2) = 10x - 12$.$stap$
  ),
  (
    7, 0,
    $stap$De richtingscoëfficiënt van de raaklijn is $f'(x)$. Los op: $f'(x) = 1$.$stap$
  ),
  (
    7, 1,
    $stap$$f'(x) = -4x + 5$, dus $-4x + 5 = 1$, dus $x = 1$.$stap$
  ),
  (
    7, 2,
    $stap$$f(1) = -2 \cdot 1^{2} + 5 \cdot 1 = -2 + 5 = 3$.$stap$
  ),
  (
    7, 3,
    $stap$De raaklijn is $y = 3 + 1(x - 1) = x + 2$.$stap$
  ),
  (
    8, 0,
    $stap$De richtingscoëfficiënt van de raaklijn is $g'(x)$. Los op: $g'(x) = -8$.$stap$
  ),
  (
    8, 1,
    $stap$$g'(x) = 2x - 6$, dus $2x - 6 = -8$, dus $x = -1$.$stap$
  ),
  (
    8, 2,
    $stap$$g(-1) = (-1)^{2} - 6 \cdot (-1) + 2 = 1 + 6 + 2 = 9$.$stap$
  ),
  (
    8, 3,
    $stap$De raaklijn is $y = 9 + (-8)(x - (-1)) = 9 - 8(x + 1) = -8x + 1$.$stap$
  )
) AS v(q_order, step_order, step_description)
JOIN public.topics_new t
  ON t.slug = 'h2_raaklijn_richtingscoefficient'
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id
 AND c.slug = 'raaklijn_richtingscoefficient'
JOIN public.questions_new q
  ON q.topic_id = t.id
 AND q.cluster_id = c.id
 AND q.order_index = v.q_order
ON CONFLICT (question_id, step_order) DO NOTHING;

DO $$
DECLARE
  n int;
  blok text;
BEGIN
  SELECT b.slug INTO blok
  FROM public.topics_new t
  JOIN public.theory_blocks b ON b.id = t.theory_block_id
  JOIN public.chapters h ON h.id = t.chapter_id
  WHERE t.slug = 'h2_raaklijn_richtingscoefficient'
    AND h.slug = 'h2';

  IF blok IS DISTINCT FROM 'h2-4d' THEN
    RAISE EXCEPTION 'onderwerp hangt niet aan 2.4 D, maar aan %', blok;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new c ON c.id = q.cluster_id
  JOIN public.topics_new t ON t.id = c.topic_id
  WHERE t.slug = 'h2_raaklijn_richtingscoefficient'
    AND c.slug = 'raaklijn_richtingscoefficient';

  IF n <> 8 THEN
    RAISE EXCEPTION 'raaklijn_richtingscoefficient klopt niet: aantal vragen is %, verwacht 8', n;
  END IF;
END $$;

COMMIT;
