-- Grens waarbij een derdegraadsfunctie twee toppen krijgt (paragraaf 6.4, blok B).
-- Eén soort som in hoofdstuk 6, acht eigen opgaven.
-- Het antwoord is het grensgetal. Bij een tweezijdige grens is dat het positieve getal.
-- In de vraag staat of de grafiek daarboven of daaronder twee toppen heeft.
-- Elke discriminant is met de computer nageteld: op de grens nul, aan de andere kant het verkeerde teken.
-- Het onderwerp hangt aan blok 6.4 B: derdegraadsfuncties met een parameter.
-- Twee keer draaien voegt niets dubbel toe.

BEGIN;

INSERT INTO public.topics_new (
  slug, title, chapter_id, order_index, is_unlocked_by_default, theory_block_id
)
SELECT
  'h6_grens_twee_toppen',
  'Grens voor twee toppen',
  c.id,
  4,
  true,
  b.id
FROM public.chapters c
JOIN public.theory_blocks b ON b.slug = 'h6-4b'
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
  'grens_twee_toppen',
  'Grens voor twee toppen',
  1
FROM public.topics_new t
WHERE t.slug = 'h6_grens_twee_toppen'
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
    $vraag$De functie $f_a$ is gegeven door $f_a(x) = x^{3} - 6ax$. Vanaf welke grens van $a$ heeft de grafiek twee toppen? Daarboven heeft de grafiek twee toppen.$vraag$,
    $ant$0$ant$,
    $latex$0$latex$,
    'a =',
    ARRAY['a=0']::text[]
  ),
  (
    2, 1,
    $vraag$De functie $g_p$ is gegeven door $g_p(x) = x^{3} + 6x^{2} + px$. Vanaf welke grens van $p$ heeft de grafiek twee toppen? Daaronder heeft de grafiek twee toppen.$vraag$,
    $ant$12$ant$,
    $latex$12$latex$,
    'p =',
    ARRAY['p=12']::text[]
  ),
  (
    3, 2,
    $vraag$De functie $h_a$ is gegeven door $h_a(x) = x^{3} - ax^{2} + 3x$. Geef de positieve grens van $a$. Daarboven heeft de grafiek twee toppen, en ook onder het tegengestelde van die grens.$vraag$,
    $ant$3$ant$,
    $latex$3$latex$,
    'a =',
    ARRAY['a=3']::text[]
  ),
  (
    4, 2,
    $vraag$De functie $f_a$ is gegeven door $f_a(x) = x^{3} + 2x^{2} + ax$. Vanaf welke grens van $a$ heeft de grafiek twee toppen? Daaronder heeft de grafiek twee toppen.$vraag$,
    $ant$4/3$ant$,
    $latex$\dfrac{4}{3}$latex$,
    'a =',
    ARRAY['(4)/(3)', '(4)/3', '4/(3)', '(4/3)', 'a=4/3', 'a=(4)/(3)', 'a=(4)/3', 'a=4/(3)', 'a=(4/3)']::text[]
  ),
  (
    5, 2,
    $vraag$De functie $g_a$ is gegeven door $g_a(x) = x^{3} + 2ax^{2} + 3x$. Geef de positieve grens van $a$. Daarboven heeft de grafiek twee toppen, en ook onder het tegengestelde van die grens.$vraag$,
    $ant$3/2$ant$,
    $latex$\dfrac{3}{2}$latex$,
    'a =',
    ARRAY['(3)/(2)', '(3)/2', '3/(2)', '(3/2)', '1.5', '1,5', 'a=3/2', 'a=(3)/(2)', 'a=(3)/2', 'a=3/(2)', 'a=(3/2)', 'a=1.5', 'a=1,5']::text[]
  ),
  (
    6, 3,
    $vraag$De functie $h_b$ is gegeven door $h_b(x) = x^{3} + 5x^{2} + bx$. Vanaf welke grens van $b$ heeft de grafiek twee toppen? Daaronder heeft de grafiek twee toppen.$vraag$,
    $ant$25/3$ant$,
    $latex$\dfrac{25}{3}$latex$,
    'b =',
    ARRAY['(25)/(3)', '(25)/3', '25/(3)', '(25/3)', 'b=25/3', 'b=(25)/(3)', 'b=(25)/3', 'b=25/(3)', 'b=(25/3)']::text[]
  ),
  (
    7, 3,
    $vraag$De functie $f_a$ is gegeven door $f_a(x) = -x^{3} + 3x^{2} + ax$. Vanaf welke grens van $a$ heeft de grafiek twee toppen? Daarboven heeft de grafiek twee toppen.$vraag$,
    $ant$-3$ant$,
    $latex$-3$latex$,
    'a =',
    ARRAY['(-3)', 'a=-3', 'a=(-3)']::text[]
  ),
  (
    8, 3,
    $vraag$De functie $g_k$ is gegeven door $g_k(x) = \dfrac{1}{3}x^{3} - kx^{2} + 4x$. Geef de positieve grens van $k$. Daarboven heeft de grafiek twee toppen, en ook onder het tegengestelde van die grens.$vraag$,
    $ant$2$ant$,
    $latex$2$latex$,
    'k =',
    ARRAY['k=2']::text[]
  )
) AS v(order_index, difficulty, latex_body, answer, latex_answer, answer_prefix, alternatives)
JOIN public.topics_new t
  ON t.slug = 'h6_grens_twee_toppen'
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id
 AND c.slug = 'grens_twee_toppen'
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
    $stap$De grafiek heeft twee toppen als de afgeleide twee verschillende nulpunten heeft. Dat is zo als de discriminant van de afgeleide positief is. Op de grens is die discriminant nul.$stap$
  ),
  (
    1, 1,
    $stap$De afgeleide is $f_a'(x) = 3x^{2} - 6a$.$stap$
  ),
  (
    1, 2,
    $stap$De discriminant is $0^{2} - 4 \cdot 3 \cdot (-6a) = 72a$. Stel $72a = 0$. Dan is $a = 0$.$stap$
  ),
  (
    1, 3,
    $stap$Bij $a = 1$ is de discriminant $72 > 0$: twee toppen. Bij $a = -1$ is de discriminant $-72 < 0$: geen toppen. Daarboven, dus bij $a > 0$, heeft de grafiek twee toppen. De grens is $0$.$stap$
  ),
  (
    2, 0,
    $stap$De grafiek heeft twee toppen als de afgeleide twee verschillende nulpunten heeft. Dat is zo als de discriminant van de afgeleide positief is. Op de grens is die discriminant nul.$stap$
  ),
  (
    2, 1,
    $stap$De afgeleide is $g_p'(x) = 3x^{2} + 12x + p$.$stap$
  ),
  (
    2, 2,
    $stap$De discriminant is $12^{2} - 4 \cdot 3 \cdot p = 144 - 12p$. Stel $144 - 12p = 0$. Dan is $12p = 144$, dus $p = 12$.$stap$
  ),
  (
    2, 3,
    $stap$Bij $p = 11$ is de discriminant $12 > 0$: twee toppen. Bij $p = 13$ is de discriminant $-12 < 0$: geen toppen. Daaronder, dus bij $p < 12$, heeft de grafiek twee toppen. De grens is $12$.$stap$
  ),
  (
    3, 0,
    $stap$De grafiek heeft twee toppen als de discriminant van de afgeleide positief is. Die discriminant is nul bij twee grenzen. Je zoekt de positieve.$stap$
  ),
  (
    3, 1,
    $stap$De afgeleide is $h_a'(x) = 3x^{2} - 2ax + 3$.$stap$
  ),
  (
    3, 2,
    $stap$De discriminant is $(-2a)^{2} - 4 \cdot 3 \cdot 3 = 4a^{2} - 36$. Stel $4a^{2} - 36 = 0$. Dan is $a^{2} = 9$, dus $a = 3$ of $a = -3$. De positieve grens is $3$.$stap$
  ),
  (
    3, 3,
    $stap$Bij $a = 4$ is de discriminant $28 > 0$: twee toppen. Bij $a = 2$ is de discriminant $-20 < 0$: geen toppen. Bij $a = -4$ zijn er ook twee toppen. Daarboven, en onder het tegengestelde, heeft de grafiek twee toppen. De positieve grens is $3$.$stap$
  ),
  (
    4, 0,
    $stap$De grafiek heeft twee toppen als de discriminant van de afgeleide positief is. Op de grens is die discriminant nul.$stap$
  ),
  (
    4, 1,
    $stap$De afgeleide is $f_a'(x) = 3x^{2} + 4x + a$.$stap$
  ),
  (
    4, 2,
    $stap$De discriminant is $4^{2} - 4 \cdot 3 \cdot a = 16 - 12a$. Stel $16 - 12a = 0$. Dan is $12a = 16$, dus $a = \dfrac{4}{3}$.$stap$
  ),
  (
    4, 3,
    $stap$Bij $a = 1$ is de discriminant $4 > 0$: twee toppen. Bij $a = 2$ is de discriminant $-8 < 0$: geen toppen. Daaronder, dus bij $a < \dfrac{4}{3}$, heeft de grafiek twee toppen. De grens is $\dfrac{4}{3}$.$stap$
  ),
  (
    5, 0,
    $stap$De grafiek heeft twee toppen als de discriminant van de afgeleide positief is. Die discriminant is nul bij twee grenzen. Je zoekt de positieve.$stap$
  ),
  (
    5, 1,
    $stap$De afgeleide is $g_a'(x) = 3x^{2} + 4ax + 3$.$stap$
  ),
  (
    5, 2,
    $stap$De discriminant is $(4a)^{2} - 4 \cdot 3 \cdot 3 = 16a^{2} - 36$. Stel $16a^{2} - 36 = 0$. Dan is $a^{2} = \dfrac{9}{4}$, dus $a = \dfrac{3}{2}$ of $a = -\dfrac{3}{2}$. De positieve grens is $\dfrac{3}{2}$.$stap$
  ),
  (
    5, 3,
    $stap$Bij $a = 2$ is de discriminant $28 > 0$: twee toppen. Bij $a = 1$ is de discriminant $-20 < 0$: geen toppen. Onder $-\dfrac{3}{2}$ zijn er ook twee toppen. De positieve grens is $\dfrac{3}{2}$.$stap$
  ),
  (
    6, 0,
    $stap$De grafiek heeft twee toppen als de discriminant van de afgeleide positief is. Op de grens is die discriminant nul.$stap$
  ),
  (
    6, 1,
    $stap$De afgeleide is $h_b'(x) = 3x^{2} + 10x + b$.$stap$
  ),
  (
    6, 2,
    $stap$De discriminant is $10^{2} - 4 \cdot 3 \cdot b = 100 - 12b$. Stel $100 - 12b = 0$. Dan is $12b = 100$, dus $b = \dfrac{100}{12} = \dfrac{25}{3}$.$stap$
  ),
  (
    6, 3,
    $stap$Bij $b = 8$ is de discriminant $4 > 0$: twee toppen. Bij $b = 9$ is de discriminant $-8 < 0$: geen toppen. Daaronder, dus bij $b < \dfrac{25}{3}$, heeft de grafiek twee toppen. De grens is $\dfrac{25}{3}$.$stap$
  ),
  (
    7, 0,
    $stap$De grafiek heeft twee toppen als de discriminant van de afgeleide positief is. Op de grens is die discriminant nul.$stap$
  ),
  (
    7, 1,
    $stap$De afgeleide is $f_a'(x) = -3x^{2} + 6x + a$.$stap$
  ),
  (
    7, 2,
    $stap$De discriminant is $6^{2} - 4 \cdot (-3) \cdot a = 36 + 12a$. Stel $36 + 12a = 0$. Dan is $12a = -36$, dus $a = -3$.$stap$
  ),
  (
    7, 3,
    $stap$Bij $a = -2$ is de discriminant $12 > 0$: twee toppen. Bij $a = -4$ is de discriminant $-12 < 0$: geen toppen. Daarboven, dus bij $a > -3$, heeft de grafiek twee toppen. De grens is $-3$.$stap$
  ),
  (
    8, 0,
    $stap$De grafiek heeft twee toppen als de discriminant van de afgeleide positief is. Die discriminant is nul bij twee grenzen. Je zoekt de positieve.$stap$
  ),
  (
    8, 1,
    $stap$De afgeleide is $g_k'(x) = x^{2} - 2kx + 4$.$stap$
  ),
  (
    8, 2,
    $stap$De discriminant is $(-2k)^{2} - 4 \cdot 1 \cdot 4 = 4k^{2} - 16$. Stel $4k^{2} - 16 = 0$. Dan is $k^{2} = 4$, dus $k = 2$ of $k = -2$. De positieve grens is $2$.$stap$
  ),
  (
    8, 3,
    $stap$Bij $k = 3$ is de discriminant $20 > 0$: twee toppen. Bij $k = 1$ is de discriminant $-12 < 0$: geen toppen. Onder $-2$ zijn er ook twee toppen. De positieve grens is $2$.$stap$
  )
) AS v(q_order, step_order, step_description)
JOIN public.topics_new t
  ON t.slug = 'h6_grens_twee_toppen'
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id
 AND c.slug = 'grens_twee_toppen'
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
  WHERE t.slug = 'h6_grens_twee_toppen'
    AND h.slug = 'h6';

  IF blok IS DISTINCT FROM 'h6-4b' THEN
    RAISE EXCEPTION 'onderwerp hangt niet aan 6.4 B, maar aan %', blok;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new c ON c.id = q.cluster_id
  JOIN public.topics_new t ON t.id = c.topic_id
  WHERE t.slug = 'h6_grens_twee_toppen'
    AND c.slug = 'grens_twee_toppen';

  SELECT count(*) INTO n_zonder
  FROM public.questions_new q
  JOIN public.topic_clusters_new c ON c.id = q.cluster_id
  JOIN public.topics_new t ON t.id = c.topic_id
  WHERE t.slug = 'h6_grens_twee_toppen'
    AND c.slug = 'grens_twee_toppen'
    AND (
      SELECT count(*)
      FROM public.question_steps_new s
      WHERE s.question_id = q.id
        AND s.step_order IN (0, 1, 2, 3)
    ) < 4;

  SELECT count(*) INTO n_fout
  FROM (VALUES
    (1, 1, '0', '0', 'a =', ARRAY['a=0']::text[]),
    (2, 1, '12', '12', 'p =', ARRAY['p=12']::text[]),
    (3, 2, '3', '3', 'a =', ARRAY['a=3']::text[]),
    (4, 2, '4/3', '\dfrac{4}{3}', 'a =', ARRAY['(4)/(3)', '(4)/3', '4/(3)', '(4/3)', 'a=4/3', 'a=(4)/(3)', 'a=(4)/3', 'a=4/(3)', 'a=(4/3)']::text[]),
    (5, 2, '3/2', '\dfrac{3}{2}', 'a =', ARRAY['(3)/(2)', '(3)/2', '3/(2)', '(3/2)', '1.5', '1,5', 'a=3/2', 'a=(3)/(2)', 'a=(3)/2', 'a=3/(2)', 'a=(3/2)', 'a=1.5', 'a=1,5']::text[]),
    (6, 3, '25/3', '\dfrac{25}{3}', 'b =', ARRAY['(25)/(3)', '(25)/3', '25/(3)', '(25/3)', 'b=25/3', 'b=(25)/(3)', 'b=(25)/3', 'b=25/(3)', 'b=(25/3)']::text[]),
    (7, 3, '-3', '-3', 'a =', ARRAY['(-3)', 'a=-3', 'a=(-3)']::text[]),
    (8, 3, '2', '2', 'k =', ARRAY['k=2']::text[])
  ) AS v(nr, moeilijkheid, antwoord, latex, voorvoegsel, alternatieven)
  JOIN public.topics_new t ON t.slug = 'h6_grens_twee_toppen'
  JOIN public.topic_clusters_new c
    ON c.topic_id = t.id AND c.slug = 'grens_twee_toppen'
  LEFT JOIN public.questions_new q
    ON q.cluster_id = c.id AND q.order_index = v.nr
  WHERE q.id IS NULL
     OR q.answer IS DISTINCT FROM v.antwoord
     OR q.latex_answer IS DISTINCT FROM v.latex
     OR q.difficulty IS DISTINCT FROM v.moeilijkheid
     OR q.answer_prefix IS DISTINCT FROM v.voorvoegsel
     OR q.answer_alternatives IS DISTINCT FROM v.alternatieven;

  IF n <> 8 OR n_zonder <> 0 OR n_fout <> 0 THEN
    RAISE EXCEPTION 'grens voor twee toppen klopt niet: aantal %, zonder stappen %, foute antwoorden %',
      n, n_zonder, n_fout;
  END IF;
END $$;

COMMIT;
