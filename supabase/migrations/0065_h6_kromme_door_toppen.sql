-- Kromme door de toppen (paragraaf 6.4, blok D).
-- Eén soort som in hoofdstuk 6, acht eigen opgaven.
-- Het antwoord is de formule van de kromme, zonder de y = ervoor.
-- Een andere termvolgorde, de breukknop en een precies kommagetal staan erbij.
-- Elke kromme is nageteld in src/lib/practice/kromme-door-toppen.test.ts.
-- Twee keer draaien voegt niets dubbel toe.

BEGIN;

INSERT INTO public.topics_new (
  slug, title, chapter_id, order_index, is_unlocked_by_default, theory_block_id
)
SELECT
  'h6_kromme_door_toppen',
  'Kromme door de toppen',
  c.id,
  5,
  true,
  b.id
FROM public.chapters c
JOIN public.theory_blocks b ON b.slug = 'h6-4d'
WHERE c.slug = 'h6'
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
  'kromme_door_toppen',
  'Kromme door de toppen',
  1
FROM public.topics_new t
WHERE t.slug = 'h6_kromme_door_toppen'
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
    $vraag$De functie $f_a$ is gegeven door $f_a(x) = -x^{2} + 4ax$. Voor elke waarde van $a$ heeft de grafiek één top. Die toppen liggen op een kromme. Stel een formule op van die kromme.$vraag$,
    $ant$x^2$ant$,
    $latex$x^{2}$latex$,
    'y =',
    ARRAY['1x^2', '(x^2)']::text[]
  ),
  (
    2, 1,
    $vraag$De functie $g_p$ is gegeven door $g_p(x) = x^{2} - 2px$. Voor elke waarde van $p$ heeft de grafiek één top. Die toppen liggen op een kromme. Stel een formule op van die kromme.$vraag$,
    $ant$-x^2$ant$,
    $latex$-x^{2}$latex$,
    'y =',
    ARRAY['-1x^2', '(-1)x^2', '(-x^2)']::text[]
  ),
  (
    3, 2,
    $vraag$De functie $h_a$ is gegeven door $h_a(x) = x^{2} - 2ax + a$. Voor elke waarde van $a$ heeft de grafiek één top. Die toppen liggen op een kromme. Stel een formule op van die kromme.$vraag$,
    $ant$-x^2+x$ant$,
    $latex$-x^{2}+x$latex$,
    'y =',
    ARRAY['x-x^2', '-x^2+1x', '1x-x^2', 'x+(-x^2)', '(-x^2)+x']::text[]
  ),
  (
    4, 2,
    $vraag$De functie $f_p$ is gegeven door $f_p(x) = x^{2} - 4px + p^{2}$. Voor elke waarde van $p$ heeft de grafiek één top. Die toppen liggen op een kromme. Stel een formule op van die kromme.$vraag$,
    $ant$-(3)/(4)x^2$ant$,
    $latex$-\dfrac{3}{4}x^{2}$latex$,
    'y =',
    ARRAY['-(3/4)x^2', '(-3)/(4)x^2', '(-3/4)x^2', '-3/4x^2', '(-3)/4x^2', '-3/(4)x^2', '-(3x^2)/(4)', '-(3x^2)/4', '-3x^2/4', '-3x^2/(4)', '-0.75x^2', '-0,75x^2', '-(0.75)x^2', '-(0,75)x^2', '(-0.75)x^2', '(-0,75)x^2']::text[]
  ),
  (
    5, 2,
    $vraag$De functie $g_a$ is gegeven door $g_a(x) = x^{3} - 3ax$. De toppen van de grafieken van $g_a$ liggen op een kromme. Stel een formule op van die kromme.$vraag$,
    $ant$-2x^3$ant$,
    $latex$-2x^{3}$latex$,
    'y =',
    ARRAY['(-2)x^3', '(-2x^3)']::text[]
  ),
  (
    6, 3,
    $vraag$De functie $h_b$ is gegeven door $h_b(x) = x^{3} - 3bx + 5$. De toppen van de grafieken van $h_b$ liggen op een kromme. Stel een formule op van die kromme.$vraag$,
    $ant$-2x^3+5$ant$,
    $latex$-2x^{3}+5$latex$,
    'y =',
    ARRAY['5-2x^3', '5+(-2)x^3', '5+(-2x^3)', '(-2)x^3+5', '(-2x^3)+5']::text[]
  ),
  (
    7, 3,
    $vraag$De functie $f_a$ is gegeven door $f_a(x) = x^{3} - 3ax^{2}$. De toppen van de grafieken van $f_a$ liggen op een kromme. Stel een formule op van die kromme.$vraag$,
    $ant$-(1)/(2)x^3$ant$,
    $latex$-\dfrac{1}{2}x^{3}$latex$,
    'y =',
    ARRAY['-(1/2)x^3', '(-1)/(2)x^3', '(-1/2)x^3', '-1/2x^3', '(-1)/2x^3', '-1/(2)x^3', '-x^3/2', '-(x^3)/2', '-(x^3)/(2)', '-x^3/(2)', '-0.5x^3', '-0,5x^3', '-(0.5)x^3', '-(0,5)x^3', '(-0.5)x^3', '(-0,5)x^3']::text[]
  ),
  (
    8, 3,
    $vraag$De functie $g_k$ is gegeven door $g_k(x) = x^{2} + 6kx + 4k$. Voor elke waarde van $k$ heeft de grafiek één top. Die toppen liggen op een kromme. Stel een formule op van die kromme.$vraag$,
    $ant$-x^2-(4)/(3)x$ant$,
    $latex$-x^{2}-\dfrac{4}{3}x$latex$,
    'y =',
    ARRAY['-x^2-(4/3)x', '-x^2-4/3x', '-x^2-(4)/3x', '-x^2-4/(3)x', '-(4)/(3)x-x^2', '-(4/3)x-x^2', '-4/3x-x^2', '-(4)/3x-x^2', '-4/(3)x-x^2', '-x^2-(4x)/(3)', '-x^2-(4x)/3', '-(4x)/(3)-x^2', '-(4x)/3-x^2', '(-4)/(3)x-x^2', '(-4/3)x-x^2', '-x^2+(-4)/(3)x', '-x^2+(-4/3)x']::text[]
  )
) AS v(order_index, difficulty, latex_body, answer, latex_answer, answer_prefix, alternatives)
JOIN public.topics_new t
  ON t.slug = 'h6_kromme_door_toppen'
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id
 AND c.slug = 'kromme_door_toppen'
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
    $stap$Een top heeft afgeleide nul. Druk $a$ uit in $x$ en vul dat in in $y = f_a(x)$. Dan valt $a$ weg.$stap$
  ),
  (
    1, 1,
    $stap$De afgeleide is $f_a'(x) = -2x + 4a$.$stap$
  ),
  (
    1, 2,
    $stap$Stel $-2x + 4a = 0$. Dan is $4a = 2x$, dus $a = \dfrac{1}{2}x$.$stap$
  ),
  (
    1, 3,
    $stap$Vul in: $y = -x^{2} + 4 \cdot \dfrac{1}{2}x \cdot x = -x^{2} + 2x^{2} = x^{2}$. De formule is $y = x^{2}$.$stap$
  ),
  (
    2, 0,
    $stap$Een top heeft afgeleide nul. Druk $p$ uit in $x$ en vul dat in in $y = g_p(x)$. Dan valt $p$ weg.$stap$
  ),
  (
    2, 1,
    $stap$De afgeleide is $g_p'(x) = 2x - 2p$.$stap$
  ),
  (
    2, 2,
    $stap$Stel $2x - 2p = 0$. Dan is $p = x$.$stap$
  ),
  (
    2, 3,
    $stap$Vul in: $y = x^{2} - 2 \cdot x \cdot x = x^{2} - 2x^{2} = -x^{2}$. De formule is $y = -x^{2}$.$stap$
  ),
  (
    3, 0,
    $stap$Een top heeft afgeleide nul. Druk $a$ uit in $x$ en vul dat in in $y = h_a(x)$. Dan valt $a$ weg.$stap$
  ),
  (
    3, 1,
    $stap$De afgeleide is $h_a'(x) = 2x - 2a$.$stap$
  ),
  (
    3, 2,
    $stap$Stel $2x - 2a = 0$. Dan is $a = x$.$stap$
  ),
  (
    3, 3,
    $stap$Vul in: $y = x^{2} - 2 \cdot x \cdot x + x = x^{2} - 2x^{2} + x = -x^{2} + x$. De formule is $y = -x^{2} + x$.$stap$
  ),
  (
    4, 0,
    $stap$Een top heeft afgeleide nul. Druk $p$ uit in $x$ en vul dat in in $y = f_p(x)$. Dan valt $p$ weg.$stap$
  ),
  (
    4, 1,
    $stap$De afgeleide is $f_p'(x) = 2x - 4p$.$stap$
  ),
  (
    4, 2,
    $stap$Stel $2x - 4p = 0$. Dan is $p = \dfrac{1}{2}x$.$stap$
  ),
  (
    4, 3,
    $stap$Vul in: $y = x^{2} - 4 \cdot \dfrac{1}{2}x \cdot x + \left(\dfrac{1}{2}x\right)^{2} = x^{2} - 2x^{2} + \dfrac{1}{4}x^{2} = -\dfrac{3}{4}x^{2}$. De formule is $y = -\dfrac{3}{4}x^{2}$.$stap$
  ),
  (
    5, 0,
    $stap$Een top heeft afgeleide nul. Druk $a$ uit in $x$ en vul dat in in $y = g_a(x)$. Dan valt $a$ weg. Beide toppen voldoen aan dezelfde vergelijking.$stap$
  ),
  (
    5, 1,
    $stap$De afgeleide is $g_a'(x) = 3x^{2} - 3a$.$stap$
  ),
  (
    5, 2,
    $stap$Stel $3x^{2} - 3a = 0$. Dan is $a = x^{2}$.$stap$
  ),
  (
    5, 3,
    $stap$Vul in: $y = x^{3} - 3 \cdot x^{2} \cdot x = x^{3} - 3x^{3} = -2x^{3}$. De formule is $y = -2x^{3}$.$stap$
  ),
  (
    6, 0,
    $stap$Een top heeft afgeleide nul. Druk $b$ uit in $x$ en vul dat in in $y = h_b(x)$. Dan valt $b$ weg. Beide toppen voldoen aan dezelfde vergelijking.$stap$
  ),
  (
    6, 1,
    $stap$De afgeleide is $h_b'(x) = 3x^{2} - 3b$.$stap$
  ),
  (
    6, 2,
    $stap$Stel $3x^{2} - 3b = 0$. Dan is $b = x^{2}$.$stap$
  ),
  (
    6, 3,
    $stap$Vul in: $y = x^{3} - 3 \cdot x^{2} \cdot x + 5 = x^{3} - 3x^{3} + 5 = -2x^{3} + 5$. De formule is $y = -2x^{3} + 5$.$stap$
  ),
  (
    7, 0,
    $stap$De afgeleide heeft twee nulpunten. Druk bij de top die van $a$ afhangt de letter $a$ uit in $x$, en vul die in in $y = f_a(x)$.$stap$
  ),
  (
    7, 1,
    $stap$De afgeleide is $f_a'(x) = 3x^{2} - 6ax = 3x(x - 2a)$.$stap$
  ),
  (
    7, 2,
    $stap$Die is nul als $x = 0$ of als $x = 2a$. Bij $x = 2a$ is $a = \dfrac{1}{2}x$. De top bij $x = 0$ is het punt $(0,\,0)$.$stap$
  ),
  (
    7, 3,
    $stap$Vul $a = \dfrac{1}{2}x$ in: $y = x^{3} - 3 \cdot \dfrac{1}{2}x \cdot x^{2} = x^{3} - \dfrac{3}{2}x^{3} = -\dfrac{1}{2}x^{3}$. Het punt $(0,\,0)$ ligt ook op deze kromme. De formule is $y = -\dfrac{1}{2}x^{3}$.$stap$
  ),
  (
    8, 0,
    $stap$Een top heeft afgeleide nul. Druk $k$ uit in $x$ en vul dat in in $y = g_k(x)$. Dan valt $k$ weg.$stap$
  ),
  (
    8, 1,
    $stap$De afgeleide is $g_k'(x) = 2x + 6k$.$stap$
  ),
  (
    8, 2,
    $stap$Stel $2x + 6k = 0$. Dan is $k = -\dfrac{1}{3}x$.$stap$
  ),
  (
    8, 3,
    $stap$Vul in: $y = x^{2} + 6 \cdot \left(-\dfrac{1}{3}x\right) \cdot x + 4 \cdot \left(-\dfrac{1}{3}x\right) = x^{2} - 2x^{2} - \dfrac{4}{3}x = -x^{2} - \dfrac{4}{3}x$. De formule is $y = -x^{2} - \dfrac{4}{3}x$.$stap$
  )
) AS v(q_order, step_order, step_description)
JOIN public.topics_new t
  ON t.slug = 'h6_kromme_door_toppen'
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id
 AND c.slug = 'kromme_door_toppen'
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
  WHERE t.slug = 'h6_kromme_door_toppen'
    AND h.slug = 'h6';

  IF blok IS DISTINCT FROM 'h6-4d' THEN
    RAISE EXCEPTION 'onderwerp hangt niet aan 6.4 D, maar aan %', blok;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new c ON c.id = q.cluster_id
  JOIN public.topics_new t ON t.id = c.topic_id
  WHERE t.slug = 'h6_kromme_door_toppen'
    AND c.slug = 'kromme_door_toppen';

  SELECT count(*) INTO n_zonder
  FROM public.questions_new q
  JOIN public.topic_clusters_new c ON c.id = q.cluster_id
  JOIN public.topics_new t ON t.id = c.topic_id
  WHERE t.slug = 'h6_kromme_door_toppen'
    AND c.slug = 'kromme_door_toppen'
    AND (
      SELECT count(*)
      FROM public.question_steps_new s
      WHERE s.question_id = q.id
        AND s.step_order IN (0, 1, 2, 3)
    ) < 4;

  SELECT count(*) INTO n_fout
  FROM (VALUES
    (1, 1, $ant$x^2$ant$, $latex$x^{2}$latex$, 'y =', ARRAY['1x^2', '(x^2)']::text[]),
    (2, 1, $ant$-x^2$ant$, $latex$-x^{2}$latex$, 'y =', ARRAY['-1x^2', '(-1)x^2', '(-x^2)']::text[]),
    (3, 2, $ant$-x^2+x$ant$, $latex$-x^{2}+x$latex$, 'y =', ARRAY['x-x^2', '-x^2+1x', '1x-x^2', 'x+(-x^2)', '(-x^2)+x']::text[]),
    (4, 2, $ant$-(3)/(4)x^2$ant$, $latex$-\dfrac{3}{4}x^{2}$latex$, 'y =', ARRAY['-(3/4)x^2', '(-3)/(4)x^2', '(-3/4)x^2', '-3/4x^2', '(-3)/4x^2', '-3/(4)x^2', '-(3x^2)/(4)', '-(3x^2)/4', '-3x^2/4', '-3x^2/(4)', '-0.75x^2', '-0,75x^2', '-(0.75)x^2', '-(0,75)x^2', '(-0.75)x^2', '(-0,75)x^2']::text[]),
    (5, 2, $ant$-2x^3$ant$, $latex$-2x^{3}$latex$, 'y =', ARRAY['(-2)x^3', '(-2x^3)']::text[]),
    (6, 3, $ant$-2x^3+5$ant$, $latex$-2x^{3}+5$latex$, 'y =', ARRAY['5-2x^3', '5+(-2)x^3', '5+(-2x^3)', '(-2)x^3+5', '(-2x^3)+5']::text[]),
    (7, 3, $ant$-(1)/(2)x^3$ant$, $latex$-\dfrac{1}{2}x^{3}$latex$, 'y =', ARRAY['-(1/2)x^3', '(-1)/(2)x^3', '(-1/2)x^3', '-1/2x^3', '(-1)/2x^3', '-1/(2)x^3', '-x^3/2', '-(x^3)/2', '-(x^3)/(2)', '-x^3/(2)', '-0.5x^3', '-0,5x^3', '-(0.5)x^3', '-(0,5)x^3', '(-0.5)x^3', '(-0,5)x^3']::text[]),
    (8, 3, $ant$-x^2-(4)/(3)x$ant$, $latex$-x^{2}-\dfrac{4}{3}x$latex$, 'y =', ARRAY['-x^2-(4/3)x', '-x^2-4/3x', '-x^2-(4)/3x', '-x^2-4/(3)x', '-(4)/(3)x-x^2', '-(4/3)x-x^2', '-4/3x-x^2', '-(4)/3x-x^2', '-4/(3)x-x^2', '-x^2-(4x)/(3)', '-x^2-(4x)/3', '-(4x)/(3)-x^2', '-(4x)/3-x^2', '(-4)/(3)x-x^2', '(-4/3)x-x^2', '-x^2+(-4)/(3)x', '-x^2+(-4/3)x']::text[])
  ) AS v(nr, moeilijkheid, antwoord, latex, voorvoegsel, alternatieven)
  JOIN public.topics_new t ON t.slug = 'h6_kromme_door_toppen'
  JOIN public.topic_clusters_new c
    ON c.topic_id = t.id AND c.slug = 'kromme_door_toppen'
  LEFT JOIN public.questions_new q
    ON q.cluster_id = c.id AND q.order_index = v.nr
  WHERE q.id IS NULL
     OR q.answer IS DISTINCT FROM v.antwoord
     OR q.latex_answer IS DISTINCT FROM v.latex
     OR q.difficulty IS DISTINCT FROM v.moeilijkheid
     OR q.answer_prefix IS DISTINCT FROM v.voorvoegsel
     OR q.answer_alternatives IS DISTINCT FROM v.alternatieven;

  IF n <> 8 OR n_zonder <> 0 OR n_fout <> 0 THEN
    RAISE EXCEPTION 'kromme door de toppen klopt niet: aantal %, zonder stappen %, foute antwoorden %',
      n, n_zonder, n_fout;
  END IF;
END $$;

COMMIT;
