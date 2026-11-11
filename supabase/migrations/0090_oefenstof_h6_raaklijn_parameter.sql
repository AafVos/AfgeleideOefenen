-- Raaklijnproblemen met een parameter (paragraaf 6.4, blok C:
-- "Raaklijnproblemen bij functies met een parameter"). Dit blok had nog
-- helemaal geen oefenstof gekoppeld (AFG-723).
--
-- Eén soort som: een functiefamilie f_a/g_a/h_a (parameter a) en een vaste
-- lijn. De lijn raakt de grafiek precies als f_a(x) = lijn maar één
-- oplossing voor x heeft, dus als de discriminant van die (kwadratische)
-- vergelijking in x nul is. Vraag 1 t/m 6 hebben één waarde van a als
-- antwoord; vraag 7 en 8 hebben er twee (de discriminant-vergelijking in a
-- zelf is dan ook kwadratisch).
--
-- Elke uitkomst is onafhankelijk nagerekend (discriminant van de
-- kwadratische vergelijking op nul gezet) in
-- src/lib/practice/raaklijn-parameter.test.ts.
--
-- Twee keer draaien voegt niets dubbel toe.

BEGIN;

INSERT INTO public.topics_new (
  slug, title, chapter_id, order_index, is_unlocked_by_default, theory_block_id
)
SELECT
  'h6_raaklijn_parameter',
  'Raaklijnproblemen met een parameter',
  c.id,
  1,
  true,
  b.id
FROM public.chapters c
JOIN public.theory_blocks b ON b.slug = 'h6-4c'
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
  'raaklijn_parameter',
  'Raaklijnproblemen met een parameter',
  1
FROM public.topics_new t
WHERE t.slug = 'h6_raaklijn_parameter'
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
    $vraag$De lijn $y = 2x$ raakt de grafiek van $f_a$. Hierbij is $f_a(x) = x^{2} + a$. Voor welke waarde van $a$ is dat?$vraag$,
    $ant$1$ant$,
    $latex$1$latex$,
    $pre$a =$pre$,
    ARRAY[]::text[]
  ),
  (
    2, 1,
    $vraag$De lijn $y = -2x + 1$ raakt de grafiek van $g_a$. Hierbij is $g_a(x) = x^{2} - 6x + a$. Voor welke waarde van $a$ is dat?$vraag$,
    $ant$5$ant$,
    $latex$5$latex$,
    $pre$a =$pre$,
    ARRAY[]::text[]
  ),
  (
    3, 1,
    $vraag$De lijn $y = 4x - 2$ raakt de grafiek van $h_a$. Hierbij is $h_a(x) = 2x^{2} + a$. Voor welke waarde van $a$ is dat?$vraag$,
    $ant$0$ant$,
    $latex$0$latex$,
    $pre$a =$pre$,
    ARRAY[]::text[]
  ),
  (
    4, 2,
    $vraag$De lijn $y = 2x + 3$ raakt de grafiek van $f_a$. Hierbij is $f_a(x) = x^{2} + 4x + a$. Voor welke waarde van $a$ is dat?$vraag$,
    $ant$4$ant$,
    $latex$4$latex$,
    $pre$a =$pre$,
    ARRAY[]::text[]
  ),
  (
    5, 2,
    $vraag$De lijn $y = 2x - 4$ raakt de grafiek van $g_a$. Hierbij is $g_a(x) = -x^{2} + 6x + a$. Voor welke waarde van $a$ is dat?$vraag$,
    $ant$-8$ant$,
    $latex$-8$latex$,
    $pre$a =$pre$,
    ARRAY[]::text[]
  ),
  (
    6, 2,
    $vraag$De lijn $y = 12x - 9$ raakt de grafiek van $h_a$. Hierbij is $h_a(x) = 3x^{2} + a$. Voor welke waarde van $a$ is dat?$vraag$,
    $ant$3$ant$,
    $latex$3$latex$,
    $pre$a =$pre$,
    ARRAY[]::text[]
  ),
  (
    7, 3,
    $vraag$De lijn $y = 2x - 1$ raakt de grafiek van $f_a$. Hierbij is $f_a(x) = x^{2} + ax$. Voor welke waarden van $a$ is dat?$vraag$,
    $ant$a = 0 of a = 4$ant$,
    $latex$a = 0 \vee a = 4$latex$,
    NULL,
    ARRAY[$alt$a = 4 of a = 0$alt$]::text[]
  ),
  (
    8, 3,
    $vraag$De lijn $y = 6x - 9$ raakt de grafiek van $g_a$. Hierbij is $g_a(x) = x^{2} + 2ax$. Voor welke waarden van $a$ is dat?$vraag$,
    $ant$a = 0 of a = 6$ant$,
    $latex$a = 0 \vee a = 6$latex$,
    NULL,
    ARRAY[$alt$a = 6 of a = 0$alt$]::text[]
  )
) AS v(order_index, difficulty, latex_body, answer, latex_answer, answer_prefix, alternatives)
JOIN public.topics_new t
  ON t.slug = 'h6_raaklijn_parameter'
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id
 AND c.slug = 'raaklijn_parameter'
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
    $stap$De lijn raakt de grafiek als $f_a(x) = 2x$ precies één oplossing heeft.$stap$
  ),
  (
    1, 1,
    $stap$$x^{2} + a = 2x$, dus $x^{2} - 2x + a = 0$.$stap$
  ),
  (
    1, 2,
    $stap$Eén oplossing betekent dat de discriminant nul is: $D = (-2)^{2} - 4 \cdot 1 \cdot a = 4 - 4a$.$stap$
  ),
  (
    1, 3,
    $stap$$4 - 4a = 0$, dus $a = 1$.$stap$
  ),
  (
    2, 0,
    $stap$De lijn raakt de grafiek als $g_a(x) = -2x + 1$ precies één oplossing heeft.$stap$
  ),
  (
    2, 1,
    $stap$$x^{2} - 6x + a = -2x + 1$, dus $x^{2} - 4x + (a - 1) = 0$.$stap$
  ),
  (
    2, 2,
    $stap$Eén oplossing betekent dat de discriminant nul is: $D = (-4)^{2} - 4 \cdot 1 \cdot (a - 1) = 16 - 4(a-1) = 20 - 4a$.$stap$
  ),
  (
    2, 3,
    $stap$$20 - 4a = 0$, dus $a = 5$.$stap$
  ),
  (
    3, 0,
    $stap$De lijn raakt de grafiek als $h_a(x) = 4x - 2$ precies één oplossing heeft.$stap$
  ),
  (
    3, 1,
    $stap$$2x^{2} + a = 4x - 2$, dus $2x^{2} - 4x + (a + 2) = 0$.$stap$
  ),
  (
    3, 2,
    $stap$Eén oplossing betekent dat de discriminant nul is: $D = (-4)^{2} - 4 \cdot 2 \cdot (a + 2) = 16 - 8(a+2) = -8a$.$stap$
  ),
  (
    3, 3,
    $stap$$-8a = 0$, dus $a = 0$.$stap$
  ),
  (
    4, 0,
    $stap$De lijn raakt de grafiek als $f_a(x) = 2x + 3$ precies één oplossing heeft.$stap$
  ),
  (
    4, 1,
    $stap$$x^{2} + 4x + a = 2x + 3$, dus $x^{2} + 2x + (a - 3) = 0$.$stap$
  ),
  (
    4, 2,
    $stap$Eén oplossing betekent dat de discriminant nul is: $D = 2^{2} - 4 \cdot 1 \cdot (a - 3) = 4 - 4(a-3) = 16 - 4a$.$stap$
  ),
  (
    4, 3,
    $stap$$16 - 4a = 0$, dus $a = 4$.$stap$
  ),
  (
    5, 0,
    $stap$De lijn raakt de grafiek als $g_a(x) = 2x - 4$ precies één oplossing heeft.$stap$
  ),
  (
    5, 1,
    $stap$$-x^{2} + 6x + a = 2x - 4$, dus $-x^{2} + 4x + (a + 4) = 0$.$stap$
  ),
  (
    5, 2,
    $stap$Eén oplossing betekent dat de discriminant nul is: $D = 4^{2} - 4 \cdot (-1) \cdot (a + 4) = 16 + 4(a+4) = 4a + 32$.$stap$
  ),
  (
    5, 3,
    $stap$$4a + 32 = 0$, dus $a = -8$.$stap$
  ),
  (
    6, 0,
    $stap$De lijn raakt de grafiek als $h_a(x) = 12x - 9$ precies één oplossing heeft.$stap$
  ),
  (
    6, 1,
    $stap$$3x^{2} + a = 12x - 9$, dus $3x^{2} - 12x + (a + 9) = 0$.$stap$
  ),
  (
    6, 2,
    $stap$Eén oplossing betekent dat de discriminant nul is: $D = (-12)^{2} - 4 \cdot 3 \cdot (a + 9) = 144 - 12(a+9) = 36 - 12a$.$stap$
  ),
  (
    6, 3,
    $stap$$36 - 12a = 0$, dus $a = 3$.$stap$
  ),
  (
    7, 0,
    $stap$De lijn raakt de grafiek als $f_a(x) = 2x - 1$ precies één oplossing heeft.$stap$
  ),
  (
    7, 1,
    $stap$$x^{2} + ax = 2x - 1$, dus $x^{2} + (a - 2)x + 1 = 0$.$stap$
  ),
  (
    7, 2,
    $stap$Eén oplossing betekent dat de discriminant nul is: $D = (a-2)^{2} - 4 \cdot 1 \cdot 1 = (a-2)^{2} - 4$.$stap$
  ),
  (
    7, 3,
    $stap$$(a-2)^{2} - 4 = 0$, dus $(a-2)^{2} = 4$, dus $a - 2 = 2$ of $a - 2 = -2$, dus $a = 4$ of $a = 0$.$stap$
  ),
  (
    8, 0,
    $stap$De lijn raakt de grafiek als $g_a(x) = 6x - 9$ precies één oplossing heeft.$stap$
  ),
  (
    8, 1,
    $stap$$x^{2} + 2ax = 6x - 9$, dus $x^{2} + (2a - 6)x + 9 = 0$.$stap$
  ),
  (
    8, 2,
    $stap$Eén oplossing betekent dat de discriminant nul is: $D = (2a-6)^{2} - 4 \cdot 1 \cdot 9 = (2a-6)^{2} - 36$.$stap$
  ),
  (
    8, 3,
    $stap$$(2a-6)^{2} - 36 = 0$, dus $(2a-6)^{2} = 36$, dus $2a - 6 = 6$ of $2a - 6 = -6$, dus $a = 6$ of $a = 0$.$stap$
  )
) AS v(q_order, step_order, step_description)
JOIN public.topics_new t
  ON t.slug = 'h6_raaklijn_parameter'
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id
 AND c.slug = 'raaklijn_parameter'
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
  WHERE t.slug = 'h6_raaklijn_parameter'
    AND h.slug = 'h6';

  IF blok IS DISTINCT FROM 'h6-4c' THEN
    RAISE EXCEPTION 'onderwerp hangt niet aan 6.4 C, maar aan %', blok;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new c ON c.id = q.cluster_id
  JOIN public.topics_new t ON t.id = c.topic_id
  WHERE t.slug = 'h6_raaklijn_parameter'
    AND c.slug = 'raaklijn_parameter';

  IF n <> 8 THEN
    RAISE EXCEPTION 'raaklijn_parameter klopt niet: aantal vragen is %, verwacht 8', n;
  END IF;
END $$;

COMMIT;
