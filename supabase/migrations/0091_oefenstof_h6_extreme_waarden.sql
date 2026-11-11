-- Extreme waarden algebraïsch berekenen (paragraaf 6.1, blok A). Dit blok had
-- nog helemaal geen oefenstof (AFG-723).
--
-- Eén soort som: via $f'(x) = 0$ het stationaire punt vinden en daarmee ofwel
-- de x-coördinaat van de extreme waarde, ofwel de extreme waarde (de
-- y-waarde) zelf bepalen. Bij de laatste drie vragen (een derdegraads
-- functie met twee stationaire punten) wordt steeds specifiek naar het
-- minimum of het maximum gevraagd, nooit naar "een extreme waarde" in het
-- algemeen.
--
-- Elke uitkomst is onafhankelijk nagerekend (numerieke helling op het
-- gevonden punt, en het teken van de helling ervoor en erna bij de
-- derdegraads functies) in src/lib/practice/extreme-waarden.test.ts.
--
-- Twee keer draaien voegt niets dubbel toe.

BEGIN;

INSERT INTO public.topics_new (
  slug, title, chapter_id, order_index, is_unlocked_by_default, theory_block_id
)
SELECT
  'h6_extreme_waarden',
  'Extreme waarden algebraïsch berekenen',
  c.id,
  1,
  true,
  b.id
FROM public.chapters c
JOIN public.theory_blocks b ON b.slug = 'h6-1a'
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
  'extreme_waarden',
  'Extreme waarden algebraïsch berekenen',
  1
FROM public.topics_new t
WHERE t.slug = 'h6_extreme_waarden'
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
    $vraag$Bereken algebraïsch de x-coördinaat van het minimum van de grafiek van $f$. Hierbij is $f(x) = x^{2} - 4x + 1$.$vraag$,
    $ant$2$ant$,
    $latex$2$latex$,
    $pre$x =$pre$,
    ARRAY[]::text[]
  ),
  (
    2, 1,
    $vraag$Bereken algebraïsch de maximale waarde van $g$. Hierbij is $g(x) = -x^{2} + 6x$.$vraag$,
    $ant$9$ant$,
    $latex$9$latex$,
    NULL,
    ARRAY[]::text[]
  ),
  (
    3, 1,
    $vraag$Bereken algebraïsch de x-coördinaat van het minimum van de grafiek van $h$. Hierbij is $h(x) = x^{2} + 2x - 3$.$vraag$,
    $ant$-1$ant$,
    $latex$-1$latex$,
    $pre$x =$pre$,
    ARRAY[]::text[]
  ),
  (
    4, 2,
    $vraag$Bereken algebraïsch de minimale waarde van $f$. Hierbij is $f(x) = 2x^{2} - 8x + 5$.$vraag$,
    $ant$-3$ant$,
    $latex$-3$latex$,
    NULL,
    ARRAY[]::text[]
  ),
  (
    5, 2,
    $vraag$Bereken algebraïsch de x-coördinaat van het maximum van de grafiek van $g$. Hierbij is $g(x) = -3x^{2} + 12x - 7$.$vraag$,
    $ant$2$ant$,
    $latex$2$latex$,
    $pre$x =$pre$,
    ARRAY[]::text[]
  ),
  (
    6, 2,
    $vraag$Bereken algebraïsch de x-coördinaat van het lokale minimum van de grafiek van $f$. Hierbij is $f(x) = x^{3} - 3x$.$vraag$,
    $ant$1$ant$,
    $latex$1$latex$,
    $pre$x =$pre$,
    ARRAY[]::text[]
  ),
  (
    7, 3,
    $vraag$Bereken algebraïsch de lokale maximale waarde van $g$. Hierbij is $g(x) = x^{3} - 6x^{2} + 9x$.$vraag$,
    $ant$4$ant$,
    $latex$4$latex$,
    NULL,
    ARRAY[]::text[]
  ),
  (
    8, 3,
    $vraag$Bereken algebraïsch de x-coördinaat van het lokale maximum van de grafiek van $h$. Hierbij is $h(x) = -x^{3} + 3x^{2}$.$vraag$,
    $ant$2$ant$,
    $latex$2$latex$,
    $pre$x =$pre$,
    ARRAY[]::text[]
  )
) AS v(order_index, difficulty, latex_body, answer, latex_answer, answer_prefix, alternatives)
JOIN public.topics_new t
  ON t.slug = 'h6_extreme_waarden'
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id
 AND c.slug = 'extreme_waarden'
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
    $stap$Een extreme waarde ligt waar $f'(x) = 0$.$stap$
  ),
  (
    1, 1,
    $stap$$f'(x) = 2x - 4$.$stap$
  ),
  (
    1, 2,
    $stap$$2x - 4 = 0$, dus $x = 2$.$stap$
  ),
  (
    1, 3,
    $stap$Dit is een minimum (de grafiek is een dalparabool). De x-coördinaat van het minimum is $x = 2$.$stap$
  ),
  (
    2, 0,
    $stap$Een extreme waarde ligt waar $g'(x) = 0$.$stap$
  ),
  (
    2, 1,
    $stap$$g'(x) = -2x + 6$.$stap$
  ),
  (
    2, 2,
    $stap$$-2x + 6 = 0$, dus $x = 3$.$stap$
  ),
  (
    2, 3,
    $stap$Dit is een maximum (de grafiek is een bergparabool). De maximale waarde is $g(3) = -3^{2} + 6 \cdot 3 = -9 + 18 = 9$.$stap$
  ),
  (
    3, 0,
    $stap$Een extreme waarde ligt waar $h'(x) = 0$.$stap$
  ),
  (
    3, 1,
    $stap$$h'(x) = 2x + 2$.$stap$
  ),
  (
    3, 2,
    $stap$$2x + 2 = 0$, dus $x = -1$.$stap$
  ),
  (
    3, 3,
    $stap$Dit is een minimum (de grafiek is een dalparabool). De x-coördinaat van het minimum is $x = -1$.$stap$
  ),
  (
    4, 0,
    $stap$Een extreme waarde ligt waar $f'(x) = 0$.$stap$
  ),
  (
    4, 1,
    $stap$$f'(x) = 4x - 8$.$stap$
  ),
  (
    4, 2,
    $stap$$4x - 8 = 0$, dus $x = 2$.$stap$
  ),
  (
    4, 3,
    $stap$Dit is een minimum (de grafiek is een dalparabool). De minimale waarde is $f(2) = 2 \cdot 2^{2} - 8 \cdot 2 + 5 = 8 - 16 + 5 = -3$.$stap$
  ),
  (
    5, 0,
    $stap$Een extreme waarde ligt waar $g'(x) = 0$.$stap$
  ),
  (
    5, 1,
    $stap$$g'(x) = -6x + 12$.$stap$
  ),
  (
    5, 2,
    $stap$$-6x + 12 = 0$, dus $x = 2$.$stap$
  ),
  (
    5, 3,
    $stap$Dit is een maximum (de grafiek is een bergparabool). De x-coördinaat van het maximum is $x = 2$.$stap$
  ),
  (
    6, 0,
    $stap$Een extreme waarde ligt waar $f'(x) = 0$.$stap$
  ),
  (
    6, 1,
    $stap$$f'(x) = 3x^{2} - 3$.$stap$
  ),
  (
    6, 2,
    $stap$$3x^{2} - 3 = 0$, dus $x^{2} = 1$, dus $x = 1$ of $x = -1$: er zijn twee stationaire punten.$stap$
  ),
  (
    6, 3,
    $stap$Bij $x = -1$ gaat de grafiek van stijgen naar dalen: dat is een maximum. Bij $x = 1$ gaat de grafiek van dalen naar stijgen: dat is een minimum.$stap$
  ),
  (
    6, 4,
    $stap$De gevraagde x-coördinaat van het lokale minimum is dus $x = 1$.$stap$
  ),
  (
    7, 0,
    $stap$Een extreme waarde ligt waar $g'(x) = 0$.$stap$
  ),
  (
    7, 1,
    $stap$$g'(x) = 3x^{2} - 12x + 9$.$stap$
  ),
  (
    7, 2,
    $stap$$3x^{2} - 12x + 9 = 0$, dus $x^{2} - 4x + 3 = 0$, dus $(x - 1)(x - 3) = 0$, dus $x = 1$ of $x = 3$: er zijn twee stationaire punten.$stap$
  ),
  (
    7, 3,
    $stap$Bij $x = 1$ gaat de grafiek van stijgen naar dalen: dat is een maximum. Bij $x = 3$ gaat de grafiek van dalen naar stijgen: dat is een minimum.$stap$
  ),
  (
    7, 4,
    $stap$De gevraagde lokale maximale waarde is dus $g(1) = 1^{3} - 6 \cdot 1^{2} + 9 \cdot 1 = 1 - 6 + 9 = 4$.$stap$
  ),
  (
    8, 0,
    $stap$Een extreme waarde ligt waar $h'(x) = 0$.$stap$
  ),
  (
    8, 1,
    $stap$$h'(x) = -3x^{2} + 6x$.$stap$
  ),
  (
    8, 2,
    $stap$$-3x^{2} + 6x = 0$, dus $-3x(x - 2) = 0$, dus $x = 0$ of $x = 2$: er zijn twee stationaire punten.$stap$
  ),
  (
    8, 3,
    $stap$Bij $x = 0$ gaat de grafiek van dalen naar stijgen: dat is een minimum. Bij $x = 2$ gaat de grafiek van stijgen naar dalen: dat is een maximum.$stap$
  ),
  (
    8, 4,
    $stap$De gevraagde x-coördinaat van het lokale maximum is dus $x = 2$.$stap$
  )
) AS v(q_order, step_order, step_description)
JOIN public.topics_new t
  ON t.slug = 'h6_extreme_waarden'
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id
 AND c.slug = 'extreme_waarden'
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
  WHERE t.slug = 'h6_extreme_waarden'
    AND h.slug = 'h6';

  IF blok IS DISTINCT FROM 'h6-1a' THEN
    RAISE EXCEPTION 'onderwerp hangt niet aan 6.1 A, maar aan %', blok;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new c ON c.id = q.cluster_id
  JOIN public.topics_new t ON t.id = c.topic_id
  WHERE t.slug = 'h6_extreme_waarden'
    AND c.slug = 'extreme_waarden';

  IF n <> 8 THEN
    RAISE EXCEPTION 'extreme_waarden klopt niet: aantal vragen is %, verwacht 8', n;
  END IF;
END $$;

COMMIT;
