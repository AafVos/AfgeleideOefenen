-- Kromme door de toppen (paragraaf 6.4, blok D).
-- Eén soort som in hoofdstuk 6, acht eigen opgaven.
-- Het antwoord is de formule achter y =. Elke uitkomst is met de computer nageteld.
-- Het onderwerp hangt aan blok 6.4 D: kromme door toppen.
-- Twee keer draaien voegt niets dubbel toe.

BEGIN;

INSERT INTO public.topics_new (
  slug, title, chapter_id, order_index, is_unlocked_by_default, theory_block_id
)
SELECT
  'h6_kromme_toppen',
  'Kromme door de toppen',
  c.id,
  4,
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
  'kromme_toppen',
  'Kromme door de toppen',
  1
FROM public.topics_new t
WHERE t.slug = 'h6_kromme_toppen'
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
  v.difficulty, false, v.order_index, v.alternatives, 'y ='
FROM (VALUES
  (
    1, 1,
    $vraag$De functie $f_a$ is gegeven door $f_a(x) = x^{2} - 2ax$. Elke grafiek heeft een top. Die toppen liggen op een kromme. Stel een formule op van die kromme.$vraag$,
    $ant$-x^2$ant$,
    $latex$-x^{2}$latex$,
    '{}'::text[]
  ),
  (
    2, 1,
    $vraag$De functie $g_a$ is gegeven door $g_a(x) = -x^{2} + 6ax$. Elke grafiek heeft een top. Die toppen liggen op een kromme. Stel een formule op van die kromme.$vraag$,
    $ant$x^2$ant$,
    $latex$x^{2}$latex$,
    '{}'::text[]
  ),
  (
    3, 2,
    $vraag$De functie $h_p$ is gegeven door $h_p(x) = x^{2} - 4px + 8$. Elke grafiek heeft een top. Die toppen liggen op een kromme. Stel een formule op van die kromme.$vraag$,
    $ant$-x^2 + 8$ant$,
    $latex$-x^{2} + 8$latex$,
    '{}'::text[]
  ),
  (
    4, 2,
    $vraag$De functie $f_a$ is gegeven door $f_a(x) = x^{2} + ax + a$. Elke grafiek heeft een top. Die toppen liggen op een kromme. Stel een formule op van die kromme.$vraag$,
    $ant$-x^2 - 2x$ant$,
    $latex$-x^{2} - 2x$latex$,
    ARRAY['-x(x+2)', '-(x^2+2x)', '-x(2+x)']::text[]
  ),
  (
    5, 2,
    $vraag$Voor $a > 0$ heeft de grafiek van $g_a(x) = x^{3} - 3ax$ twee toppen. Die toppen liggen op een kromme. Stel een formule op van die kromme.$vraag$,
    $ant$-2x^3$ant$,
    $latex$-2x^{3}$latex$,
    '{}'::text[]
  ),
  (
    6, 2,
    $vraag$Voor $p \neq 0$ heeft de grafiek van $h_p(x) = x^{3} - 6px^{2}$ twee toppen. Die toppen liggen op een kromme. Stel een formule op van die kromme.$vraag$,
    $ant$-(1/2)x^3$ant$,
    $latex$-\dfrac{1}{2}x^{3}$latex$,
    '{}'::text[]
  ),
  (
    7, 3,
    $vraag$De functie $f_a$ is gegeven door $f_a(x) = x^{3} - 3ax^{2} + 3x$. De toppen van de grafieken liggen op een kromme. Stel een formule op van die kromme.$vraag$,
    $ant$-(1/2)x^3 + (3/2)x$ant$,
    $latex$-\dfrac{1}{2}x^{3} + \dfrac{3}{2}x$latex$,
    '{}'::text[]
  ),
  (
    8, 3,
    $vraag$De functie $g_a$ is gegeven door $g_a(x) = x^{4} - 2ax^{2}$. De toppen van de grafieken liggen op een kromme. Stel een formule op van die kromme.$vraag$,
    $ant$-x^4$ant$,
    $latex$-x^{4}$latex$,
    '{}'::text[]
  )
) AS v(order_index, difficulty, latex_body, answer, latex_answer, alternatives)
JOIN public.topics_new t
  ON t.slug = 'h6_kromme_toppen'
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id
 AND c.slug = 'kromme_toppen'
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
    $stap$De afgeleide is $f_a'(x) = 2x - 2a$.$stap$
  ),
  (
    1, 1,
    $stap$Een top heeft $f_a'(x) = 0$, dus $2x - 2a = 0$. Daaruit volgt $a = x$.$stap$
  ),
  (
    1, 2,
    $stap$Vul $a = x$ in: $y = x^{2} - 2x \cdot x = x^{2} - 2x^{2} = -x^{2}$.$stap$
  ),
  (
    1, 3,
    $stap$De kromme door de toppen heeft formule $y = -x^{2}$.$stap$
  ),
  (
    2, 0,
    $stap$De afgeleide is $g_a'(x) = -2x + 6a$.$stap$
  ),
  (
    2, 1,
    $stap$Een top heeft $g_a'(x) = 0$, dus $-2x + 6a = 0$. Daaruit volgt $a = \dfrac{x}{3}$.$stap$
  ),
  (
    2, 2,
    $stap$Vul $a = \dfrac{x}{3}$ in: $y = -x^{2} + 6 \cdot \dfrac{x}{3} \cdot x = -x^{2} + 2x^{2} = x^{2}$.$stap$
  ),
  (
    2, 3,
    $stap$De kromme door de toppen heeft formule $y = x^{2}$.$stap$
  ),
  (
    3, 0,
    $stap$De afgeleide is $h_p'(x) = 2x - 4p$.$stap$
  ),
  (
    3, 1,
    $stap$Een top heeft $h_p'(x) = 0$, dus $2x - 4p = 0$. Daaruit volgt $p = \dfrac{x}{2}$.$stap$
  ),
  (
    3, 2,
    $stap$Vul $p = \dfrac{x}{2}$ in: $y = x^{2} - 4 \cdot \dfrac{x}{2} \cdot x + 8 = x^{2} - 2x^{2} + 8 = -x^{2} + 8$.$stap$
  ),
  (
    3, 3,
    $stap$De kromme door de toppen heeft formule $y = -x^{2} + 8$.$stap$
  ),
  (
    4, 0,
    $stap$De afgeleide is $f_a'(x) = 2x + a$.$stap$
  ),
  (
    4, 1,
    $stap$Een top heeft $f_a'(x) = 0$, dus $2x + a = 0$. Daaruit volgt $a = -2x$.$stap$
  ),
  (
    4, 2,
    $stap$Vul $a = -2x$ in: $y = x^{2} + (-2x) \cdot x + (-2x) = x^{2} - 2x^{2} - 2x = -x^{2} - 2x$.$stap$
  ),
  (
    4, 3,
    $stap$De kromme door de toppen heeft formule $y = -x^{2} - 2x$.$stap$
  ),
  (
    5, 0,
    $stap$De afgeleide is $g_a'(x) = 3x^{2} - 3a$.$stap$
  ),
  (
    5, 1,
    $stap$$g_a'(x) = 0$ geeft $3x^{2} - 3a = 0$, dus $a = x^{2}$.$stap$
  ),
  (
    5, 2,
    $stap$Vul $a = x^{2}$ in: $y = x^{3} - 3 \cdot x^{2} \cdot x = x^{3} - 3x^{3} = -2x^{3}$. Beide toppen liggen op deze kromme.$stap$
  ),
  (
    5, 3,
    $stap$De kromme door de toppen heeft formule $y = -2x^{3}$.$stap$
  ),
  (
    6, 0,
    $stap$De afgeleide is $h_p'(x) = 3x^{2} - 12px = 3x(x - 4p)$.$stap$
  ),
  (
    6, 1,
    $stap$$h_p'(x) = 0$ geeft $x = 0$ of $x = 4p$. Voor de top die niet op de y-as ligt, geldt $p = \dfrac{x}{4}$.$stap$
  ),
  (
    6, 2,
    $stap$Vul $p = \dfrac{x}{4}$ in: $y = x^{3} - 6 \cdot \dfrac{x}{4} \cdot x^{2} = x^{3} - \dfrac{3}{2}x^{3} = -\dfrac{1}{2}x^{3}$. De top $(0, 0)$ ligt ook op deze kromme.$stap$
  ),
  (
    6, 3,
    $stap$De kromme door de toppen heeft formule $y = -\dfrac{1}{2}x^{3}$.$stap$
  ),
  (
    7, 0,
    $stap$De afgeleide is $f_a'(x) = 3x^{2} - 6ax + 3$.$stap$
  ),
  (
    7, 1,
    $stap$Zet de afgeleide op nul en deel door 3: $x^{2} - 2ax + 1 = 0$. Dus $a = \dfrac{x^{2} + 1}{2x}$. Een top ligt nooit bij $x = 0$, want daar is de afgeleide $3$.$stap$
  ),
  (
    7, 2,
    $stap$Vul $a$ in. Dan is $3 \cdot \dfrac{x^{2} + 1}{2x} \cdot x^{2} = \dfrac{3}{2}x^{3} + \dfrac{3}{2}x$, en $y = x^{3} - \dfrac{3}{2}x^{3} - \dfrac{3}{2}x + 3x = -\dfrac{1}{2}x^{3} + \dfrac{3}{2}x$.$stap$
  ),
  (
    7, 3,
    $stap$De kromme door de toppen heeft formule $y = -\dfrac{1}{2}x^{3} + \dfrac{3}{2}x$.$stap$
  ),
  (
    8, 0,
    $stap$De afgeleide is $g_a'(x) = 4x^{3} - 4ax = 4x(x^{2} - a)$.$stap$
  ),
  (
    8, 1,
    $stap$$g_a'(x) = 0$ geeft $x = 0$ of $a = x^{2}$.$stap$
  ),
  (
    8, 2,
    $stap$Vul $a = x^{2}$ in: $y = x^{4} - 2 \cdot x^{2} \cdot x^{2} = x^{4} - 2x^{4} = -x^{4}$. De top bij $x = 0$ heeft $y = 0$ en ligt ook op deze kromme.$stap$
  ),
  (
    8, 3,
    $stap$De kromme door de toppen heeft formule $y = -x^{4}$.$stap$
  )
) AS v(q_order, step_order, step_description)
JOIN public.topics_new t
  ON t.slug = 'h6_kromme_toppen'
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id
 AND c.slug = 'kromme_toppen'
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
  WHERE t.slug = 'h6_kromme_toppen'
    AND h.slug = 'h6';

  IF blok IS DISTINCT FROM 'h6-4d' THEN
    RAISE EXCEPTION 'onderwerp hangt niet aan 6.4 D, maar aan %', blok;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new c ON c.id = q.cluster_id
  JOIN public.topics_new t ON t.id = c.topic_id
  WHERE t.slug = 'h6_kromme_toppen'
    AND c.slug = 'kromme_toppen';

  SELECT count(*) INTO n_zonder
  FROM public.questions_new q
  JOIN public.topic_clusters_new c ON c.id = q.cluster_id
  JOIN public.topics_new t ON t.id = c.topic_id
  WHERE t.slug = 'h6_kromme_toppen'
    AND c.slug = 'kromme_toppen'
    AND (
      SELECT count(*)
      FROM public.question_steps_new s
      WHERE s.question_id = q.id
        AND s.step_order IN (0, 1, 2, 3)
    ) < 4;

  SELECT count(*) INTO n_fout
  FROM (VALUES
    (1, 1, '-x^2', '-x^{2}', 'y =', '{}'::text[]),
    (2, 1, 'x^2', 'x^{2}', 'y =', '{}'::text[]),
    (3, 2, '-x^2 + 8', '-x^{2} + 8', 'y =', '{}'::text[]),
    (4, 2, '-x^2 - 2x', '-x^{2} - 2x', 'y =', ARRAY['-x(x+2)', '-(x^2+2x)', '-x(2+x)']::text[]),
    (5, 2, '-2x^3', '-2x^{3}', 'y =', '{}'::text[]),
    (6, 2, '-(1/2)x^3', '-\dfrac{1}{2}x^{3}', 'y =', '{}'::text[]),
    (7, 3, '-(1/2)x^3 + (3/2)x', '-\dfrac{1}{2}x^{3} + \dfrac{3}{2}x', 'y =', '{}'::text[]),
    (8, 3, '-x^4', '-x^{4}', 'y =', '{}'::text[])
  ) AS v(nr, moeilijkheid, antwoord, latex, voorvoegsel, alternatieven)
  JOIN public.topics_new t ON t.slug = 'h6_kromme_toppen'
  JOIN public.topic_clusters_new c
    ON c.topic_id = t.id AND c.slug = 'kromme_toppen'
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
