-- De afgeleide met de limietdefinitie (paragraaf 2.3, blok B: "De afgeleide
-- functie"). Dit blok had nog geen oefenstof (AFG-341).
--
-- Eén soort som: geen rekenregels (productregel, kettingregel, ...), maar het
-- differentiequotiënt zelf laten uitlopen naar de afgeleide formule. Het
-- antwoord is de formule van f' (of g'/h'), niet een los getal.
--
-- Elke uitkomst is onafhankelijk nagerekend (limiet van het
-- differentiequotiënt voor h naar 0) in
-- src/lib/practice/afgeleide-limietdefinitie.test.ts.
--
-- Twee keer draaien voegt niets dubbel toe.

BEGIN;

INSERT INTO public.topics_new (
  slug, title, chapter_id, order_index, is_unlocked_by_default, theory_block_id
)
SELECT
  'h2_afgeleide_limietdefinitie',
  'De afgeleide met de limietdefinitie',
  c.id,
  1,
  true,
  b.id
FROM public.chapters c
JOIN public.theory_blocks b ON b.slug = 'h2-3b'
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
  'limietdefinitie',
  'De afgeleide met de limietdefinitie',
  1
FROM public.topics_new t
WHERE t.slug = 'h2_afgeleide_limietdefinitie'
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
    $vraag$Bepaal met de limietdefinitie de afgeleide van $f$. Hierbij is $f(x) = x^{2} + 3x$.$vraag$,
    $ant$2x + 3$ant$,
    $latex$2x + 3$latex$,
    $pre$f'(x) =$pre$,
    ARRAY[]::text[]
  ),
  (
    2, 1,
    $vraag$Bepaal met de limietdefinitie de afgeleide van $g$. Hierbij is $g(x) = 2x^{2} - x$.$vraag$,
    $ant$4x - 1$ant$,
    $latex$4x - 1$latex$,
    $pre$g'(x) =$pre$,
    ARRAY[]::text[]
  ),
  (
    3, 1,
    $vraag$Bepaal met de limietdefinitie de afgeleide van $h$. Hierbij is $h(x) = x^{2} - 5$.$vraag$,
    $ant$2x$ant$,
    $latex$2x$latex$,
    $pre$h'(x) =$pre$,
    ARRAY[]::text[]
  ),
  (
    4, 2,
    $vraag$Bepaal met de limietdefinitie de afgeleide van $f$. Hierbij is $f(x) = x^{3}$.$vraag$,
    $ant$3x^2$ant$,
    $latex$3x^{2}$latex$,
    $pre$f'(x) =$pre$,
    ARRAY[]::text[]
  ),
  (
    5, 2,
    $vraag$Bepaal met de limietdefinitie de afgeleide van $g$. Hierbij is $g(x) = x^{2} + 4x + 1$.$vraag$,
    $ant$2x + 4$ant$,
    $latex$2x + 4$latex$,
    $pre$g'(x) =$pre$,
    ARRAY[]::text[]
  ),
  (
    6, 2,
    $vraag$Bepaal met de limietdefinitie de afgeleide van $h$. Hierbij is $h(x) = -x^{2} + 2x$.$vraag$,
    $ant$-2x + 2$ant$,
    $latex$-2x + 2$latex$,
    $pre$h'(x) =$pre$,
    ARRAY[]::text[]
  ),
  (
    7, 3,
    $vraag$Bepaal met de limietdefinitie de afgeleide van $f$. Hierbij is $f(x) = x^{3} - 2x$.$vraag$,
    $ant$3x^2 - 2$ant$,
    $latex$3x^{2} - 2$latex$,
    $pre$f'(x) =$pre$,
    ARRAY[]::text[]
  ),
  (
    8, 3,
    $vraag$Bepaal met de limietdefinitie de afgeleide van $g$. Hierbij is $g(x) = 2x^{3} + x^{2}$.$vraag$,
    $ant$6x^2 + 2x$ant$,
    $latex$6x^{2} + 2x$latex$,
    $pre$g'(x) =$pre$,
    ARRAY[]::text[]
  )
) AS v(order_index, difficulty, latex_body, answer, latex_answer, answer_prefix, alternatives)
JOIN public.topics_new t
  ON t.slug = 'h2_afgeleide_limietdefinitie'
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id
 AND c.slug = 'limietdefinitie'
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
    $stap$De limietdefinitie is $f'(x) = \lim\limits_{h \to 0} \dfrac{f(x+h) - f(x)}{h}$.$stap$
  ),
  (
    1, 1,
    $stap$$f(x+h) = (x+h)^{2} + 3(x+h) = x^{2} + 2xh + h^{2} + 3x + 3h$.$stap$
  ),
  (
    1, 2,
    $stap$$f(x+h) - f(x) = 2xh + h^{2} + 3h = h(2x + h + 3)$.$stap$
  ),
  (
    1, 3,
    $stap$Deel door $h$: $\dfrac{f(x+h) - f(x)}{h} = 2x + h + 3$. Laat $h$ naar $0$ gaan: $f'(x) = 2x + 3$.$stap$
  ),
  (
    2, 0,
    $stap$De limietdefinitie is $g'(x) = \lim\limits_{h \to 0} \dfrac{g(x+h) - g(x)}{h}$.$stap$
  ),
  (
    2, 1,
    $stap$$g(x+h) = 2(x+h)^{2} - (x+h) = 2x^{2} + 4xh + 2h^{2} - x - h$.$stap$
  ),
  (
    2, 2,
    $stap$$g(x+h) - g(x) = 4xh + 2h^{2} - h = h(4x + 2h - 1)$.$stap$
  ),
  (
    2, 3,
    $stap$Deel door $h$: $\dfrac{g(x+h) - g(x)}{h} = 4x + 2h - 1$. Laat $h$ naar $0$ gaan: $g'(x) = 4x - 1$.$stap$
  ),
  (
    3, 0,
    $stap$De limietdefinitie is $h'(x) = \lim\limits_{k \to 0} \dfrac{h(x+k) - h(x)}{k}$. (We noemen de kleine toename hier $k$, want $h$ is al de naam van de functie.)$stap$
  ),
  (
    3, 1,
    $stap$$h(x+k) = (x+k)^{2} - 5 = x^{2} + 2xk + k^{2} - 5$.$stap$
  ),
  (
    3, 2,
    $stap$$h(x+k) - h(x) = 2xk + k^{2} = k(2x + k)$.$stap$
  ),
  (
    3, 3,
    $stap$Deel door $k$: $\dfrac{h(x+k) - h(x)}{k} = 2x + k$. Laat $k$ naar $0$ gaan: $h'(x) = 2x$.$stap$
  ),
  (
    4, 0,
    $stap$De limietdefinitie is $f'(x) = \lim\limits_{h \to 0} \dfrac{f(x+h) - f(x)}{h}$.$stap$
  ),
  (
    4, 1,
    $stap$$f(x+h) = (x+h)^{3} = x^{3} + 3x^{2}h + 3xh^{2} + h^{3}$.$stap$
  ),
  (
    4, 2,
    $stap$$f(x+h) - f(x) = 3x^{2}h + 3xh^{2} + h^{3} = h(3x^{2} + 3xh + h^{2})$.$stap$
  ),
  (
    4, 3,
    $stap$Deel door $h$: $\dfrac{f(x+h) - f(x)}{h} = 3x^{2} + 3xh + h^{2}$. Laat $h$ naar $0$ gaan: $f'(x) = 3x^{2}$.$stap$
  ),
  (
    5, 0,
    $stap$De limietdefinitie is $g'(x) = \lim\limits_{h \to 0} \dfrac{g(x+h) - g(x)}{h}$.$stap$
  ),
  (
    5, 1,
    $stap$$g(x+h) = (x+h)^{2} + 4(x+h) + 1 = x^{2} + 2xh + h^{2} + 4x + 4h + 1$.$stap$
  ),
  (
    5, 2,
    $stap$$g(x+h) - g(x) = 2xh + h^{2} + 4h = h(2x + h + 4)$.$stap$
  ),
  (
    5, 3,
    $stap$Deel door $h$: $\dfrac{g(x+h) - g(x)}{h} = 2x + h + 4$. Laat $h$ naar $0$ gaan: $g'(x) = 2x + 4$.$stap$
  ),
  (
    6, 0,
    $stap$De limietdefinitie is $h'(x) = \lim\limits_{k \to 0} \dfrac{h(x+k) - h(x)}{k}$. (We noemen de kleine toename hier $k$, want $h$ is al de naam van de functie.)$stap$
  ),
  (
    6, 1,
    $stap$$h(x+k) = -(x+k)^{2} + 2(x+k) = -x^{2} - 2xk - k^{2} + 2x + 2k$.$stap$
  ),
  (
    6, 2,
    $stap$$h(x+k) - h(x) = -2xk - k^{2} + 2k = k(-2x - k + 2)$.$stap$
  ),
  (
    6, 3,
    $stap$Deel door $k$: $\dfrac{h(x+k) - h(x)}{k} = -2x - k + 2$. Laat $k$ naar $0$ gaan: $h'(x) = -2x + 2$.$stap$
  ),
  (
    7, 0,
    $stap$De limietdefinitie is $f'(x) = \lim\limits_{h \to 0} \dfrac{f(x+h) - f(x)}{h}$.$stap$
  ),
  (
    7, 1,
    $stap$$f(x+h) = (x+h)^{3} - 2(x+h) = x^{3} + 3x^{2}h + 3xh^{2} + h^{3} - 2x - 2h$.$stap$
  ),
  (
    7, 2,
    $stap$$f(x+h) - f(x) = 3x^{2}h + 3xh^{2} + h^{3} - 2h = h(3x^{2} + 3xh + h^{2} - 2)$.$stap$
  ),
  (
    7, 3,
    $stap$Deel door $h$: $\dfrac{f(x+h) - f(x)}{h} = 3x^{2} + 3xh + h^{2} - 2$. Laat $h$ naar $0$ gaan: $f'(x) = 3x^{2} - 2$.$stap$
  ),
  (
    8, 0,
    $stap$De limietdefinitie is $g'(x) = \lim\limits_{h \to 0} \dfrac{g(x+h) - g(x)}{h}$.$stap$
  ),
  (
    8, 1,
    $stap$$g(x+h) = 2(x+h)^{3} + (x+h)^{2} = 2x^{3} + 6x^{2}h + 6xh^{2} + 2h^{3} + x^{2} + 2xh + h^{2}$.$stap$
  ),
  (
    8, 2,
    $stap$$g(x+h) - g(x) = 6x^{2}h + 6xh^{2} + 2h^{3} + 2xh + h^{2} = h(6x^{2} + 6xh + 2h^{2} + 2x + h)$.$stap$
  ),
  (
    8, 3,
    $stap$Deel door $h$: $\dfrac{g(x+h) - g(x)}{h} = 6x^{2} + 6xh + 2h^{2} + 2x + h$. Laat $h$ naar $0$ gaan: $g'(x) = 6x^{2} + 2x$.$stap$
  )
) AS v(q_order, step_order, step_description)
JOIN public.topics_new t
  ON t.slug = 'h2_afgeleide_limietdefinitie'
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id
 AND c.slug = 'limietdefinitie'
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
  WHERE t.slug = 'h2_afgeleide_limietdefinitie'
    AND h.slug = 'h2';

  IF blok IS DISTINCT FROM 'h2-3b' THEN
    RAISE EXCEPTION 'onderwerp hangt niet aan 2.3 B, maar aan %', blok;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new c ON c.id = q.cluster_id
  JOIN public.topics_new t ON t.id = c.topic_id
  WHERE t.slug = 'h2_afgeleide_limietdefinitie'
    AND c.slug = 'limietdefinitie';

  IF n <> 8 THEN
    RAISE EXCEPTION 'afgeleide_limietdefinitie klopt niet: aantal vragen is %, verwacht 8', n;
  END IF;
END $$;

COMMIT;
