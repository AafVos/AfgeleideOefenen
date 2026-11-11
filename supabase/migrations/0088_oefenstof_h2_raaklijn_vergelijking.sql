-- De vergelijking van de raaklijn (paragraaf 2.4, blok C: "Raaklijn en
-- afgeleide"). Dit blok had nog helemaal geen oefenstof (AFG-723).
--
-- Eén soort som: gegeven een functie f/g/h en een x-waarde, bepaal de
-- vergelijking van de raaklijn aan de grafiek in dat punt. Het antwoord is
-- steeds het rechterlid van y = ...; answer_prefix is daarom letterlijk
-- "y =" en de leerling typt alleen de rechte lijn zelf.
--
-- Elke uitkomst is onafhankelijk nagerekend (numeriek, op meerdere
-- x-waarden) in src/lib/practice/raaklijn-vergelijking.test.ts.
--
-- Twee keer draaien voegt niets dubbel toe.

BEGIN;

INSERT INTO public.topics_new (
  slug, title, chapter_id, order_index, is_unlocked_by_default, theory_block_id
)
SELECT
  'h2_raaklijn_vergelijking',
  'Vergelijking van de raaklijn',
  c.id,
  1,
  true,
  b.id
FROM public.chapters c
JOIN public.theory_blocks b ON b.slug = 'h2-4c'
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
  'raaklijn_vergelijking',
  'Vergelijking van de raaklijn',
  1
FROM public.topics_new t
WHERE t.slug = 'h2_raaklijn_vergelijking'
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
    $vraag$Bepaal de vergelijking van de raaklijn aan de grafiek van $f$ in het punt met $x = 2$. Hierbij is $f(x) = x^{2}$.$vraag$,
    $ant$4x - 4$ant$,
    $latex$4x - 4$latex$,
    $pre$y =$pre$,
    ARRAY[]::text[]
  ),
  (
    2, 1,
    $vraag$Bepaal de vergelijking van de raaklijn aan de grafiek van $g$ in het punt met $x = 1$. Hierbij is $g(x) = x^{2} - 3x$.$vraag$,
    $ant$-x - 1$ant$,
    $latex$-x - 1$latex$,
    $pre$y =$pre$,
    ARRAY[]::text[]
  ),
  (
    3, 1,
    $vraag$Bepaal de vergelijking van de raaklijn aan de grafiek van $h$ in het punt met $x = 0$. Hierbij is $h(x) = 2x^{2} + 1$.$vraag$,
    $ant$1$ant$,
    $latex$1$latex$,
    $pre$y =$pre$,
    ARRAY[]::text[]
  ),
  (
    4, 2,
    $vraag$Bepaal de vergelijking van de raaklijn aan de grafiek van $f$ in het punt met $x = 1$. Hierbij is $f(x) = x^{3}$.$vraag$,
    $ant$3x - 2$ant$,
    $latex$3x - 2$latex$,
    $pre$y =$pre$,
    ARRAY[]::text[]
  ),
  (
    5, 2,
    $vraag$Bepaal de vergelijking van de raaklijn aan de grafiek van $g$ in het punt met $x = -1$. Hierbij is $g(x) = x^{2} + 2x - 3$.$vraag$,
    $ant$-4$ant$,
    $latex$-4$latex$,
    $pre$y =$pre$,
    ARRAY[]::text[]
  ),
  (
    6, 2,
    $vraag$Bepaal de vergelijking van de raaklijn aan de grafiek van $h$ in het punt met $x = 3$. Hierbij is $h(x) = -x^{2} + 4x$.$vraag$,
    $ant$-2x + 9$ant$,
    $latex$-2x + 9$latex$,
    $pre$y =$pre$,
    ARRAY[]::text[]
  ),
  (
    7, 3,
    $vraag$Bepaal de vergelijking van de raaklijn aan de grafiek van $f$ in het punt met $x = 2$. Hierbij is $f(x) = x^{3} - 3x$.$vraag$,
    $ant$9x - 16$ant$,
    $latex$9x - 16$latex$,
    $pre$y =$pre$,
    ARRAY[]::text[]
  ),
  (
    8, 3,
    $vraag$Bepaal de vergelijking van de raaklijn aan de grafiek van $g$ in het punt met $x = -1$. Hierbij is $g(x) = 2x^{3} - x^{2}$.$vraag$,
    $ant$8x + 5$ant$,
    $latex$8x + 5$latex$,
    $pre$y =$pre$,
    ARRAY[]::text[]
  )
) AS v(order_index, difficulty, latex_body, answer, latex_answer, answer_prefix, alternatives)
JOIN public.topics_new t
  ON t.slug = 'h2_raaklijn_vergelijking'
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id
 AND c.slug = 'raaklijn_vergelijking'
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
    $stap$De raaklijn in het punt met $x = 2$ is $y = f(2) + f'(2)(x - 2)$.$stap$
  ),
  (
    1, 1,
    $stap$$f(2) = 2^{2} = 4$.$stap$
  ),
  (
    1, 2,
    $stap$$f'(x) = 2x$, dus $f'(2) = 4$.$stap$
  ),
  (
    1, 3,
    $stap$Invullen: $y = 4 + 4(x - 2) = 4x - 4$.$stap$
  ),
  (
    2, 0,
    $stap$De raaklijn in het punt met $x = 1$ is $y = g(1) + g'(1)(x - 1)$.$stap$
  ),
  (
    2, 1,
    $stap$$g(1) = 1^{2} - 3 \cdot 1 = -2$.$stap$
  ),
  (
    2, 2,
    $stap$$g'(x) = 2x - 3$, dus $g'(1) = -1$.$stap$
  ),
  (
    2, 3,
    $stap$Invullen: $y = -2 + (-1)(x - 1) = -2 - x + 1 = -x - 1$.$stap$
  ),
  (
    3, 0,
    $stap$De raaklijn in het punt met $x = 0$ is $y = h(0) + h'(0)(x - 0)$.$stap$
  ),
  (
    3, 1,
    $stap$$h(0) = 2 \cdot 0^{2} + 1 = 1$.$stap$
  ),
  (
    3, 2,
    $stap$$h'(x) = 4x$, dus $h'(0) = 0$.$stap$
  ),
  (
    3, 3,
    $stap$Invullen: $y = 1 + 0 \cdot (x - 0) = 1$: een horizontale lijn.$stap$
  ),
  (
    4, 0,
    $stap$De raaklijn in het punt met $x = 1$ is $y = f(1) + f'(1)(x - 1)$.$stap$
  ),
  (
    4, 1,
    $stap$$f(1) = 1^{3} = 1$.$stap$
  ),
  (
    4, 2,
    $stap$$f'(x) = 3x^{2}$, dus $f'(1) = 3$.$stap$
  ),
  (
    4, 3,
    $stap$Invullen: $y = 1 + 3(x - 1) = 3x - 2$.$stap$
  ),
  (
    5, 0,
    $stap$De raaklijn in het punt met $x = -1$ is $y = g(-1) + g'(-1)(x - (-1))$.$stap$
  ),
  (
    5, 1,
    $stap$$g(-1) = (-1)^{2} + 2 \cdot (-1) - 3 = -4$.$stap$
  ),
  (
    5, 2,
    $stap$$g'(x) = 2x + 2$, dus $g'(-1) = 0$.$stap$
  ),
  (
    5, 3,
    $stap$Invullen: $y = -4 + 0 \cdot (x + 1) = -4$: een horizontale lijn.$stap$
  ),
  (
    6, 0,
    $stap$De raaklijn in het punt met $x = 3$ is $y = h(3) + h'(3)(x - 3)$.$stap$
  ),
  (
    6, 1,
    $stap$$h(3) = -3^{2} + 4 \cdot 3 = -9 + 12 = 3$.$stap$
  ),
  (
    6, 2,
    $stap$$h'(x) = -2x + 4$, dus $h'(3) = -2$.$stap$
  ),
  (
    6, 3,
    $stap$Invullen: $y = 3 + (-2)(x - 3) = 3 - 2x + 6 = -2x + 9$.$stap$
  ),
  (
    7, 0,
    $stap$De raaklijn in het punt met $x = 2$ is $y = f(2) + f'(2)(x - 2)$.$stap$
  ),
  (
    7, 1,
    $stap$$f(2) = 2^{3} - 3 \cdot 2 = 8 - 6 = 2$.$stap$
  ),
  (
    7, 2,
    $stap$$f'(x) = 3x^{2} - 3$, dus $f'(2) = 9$.$stap$
  ),
  (
    7, 3,
    $stap$Invullen: $y = 2 + 9(x - 2) = 9x - 16$.$stap$
  ),
  (
    8, 0,
    $stap$De raaklijn in het punt met $x = -1$ is $y = g(-1) + g'(-1)(x - (-1))$.$stap$
  ),
  (
    8, 1,
    $stap$$g(-1) = 2 \cdot (-1)^{3} - (-1)^{2} = -2 - 1 = -3$.$stap$
  ),
  (
    8, 2,
    $stap$$g'(x) = 6x^{2} - 2x$, dus $g'(-1) = 6 + 2 = 8$.$stap$
  ),
  (
    8, 3,
    $stap$Invullen: $y = -3 + 8(x + 1) = -3 + 8x + 8 = 8x + 5$.$stap$
  )
) AS v(q_order, step_order, step_description)
JOIN public.topics_new t
  ON t.slug = 'h2_raaklijn_vergelijking'
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id
 AND c.slug = 'raaklijn_vergelijking'
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
  WHERE t.slug = 'h2_raaklijn_vergelijking'
    AND h.slug = 'h2';

  IF blok IS DISTINCT FROM 'h2-4c' THEN
    RAISE EXCEPTION 'onderwerp hangt niet aan 2.4 C, maar aan %', blok;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new c ON c.id = q.cluster_id
  JOIN public.topics_new t ON t.id = c.topic_id
  WHERE t.slug = 'h2_raaklijn_vergelijking'
    AND c.slug = 'raaklijn_vergelijking';

  IF n <> 8 THEN
    RAISE EXCEPTION 'raaklijn_vergelijking klopt niet: aantal vragen is %, verwacht 8', n;
  END IF;
END $$;

COMMIT;
