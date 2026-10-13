-- Hoofdstuk 7 aanvullen tot minstens 8 vragen per soort.
-- Eigen varianten, andere getallen dan de vragen die er al stonden.
-- Elke afgeleide is met de computer nageteld.
-- Herhaalbaar: een tweede keer draaien voegt niets dubbel toe.

BEGIN;

INSERT INTO public.questions_new (
  topic_id, cluster_id, latex_body, answer, latex_answer,
  difficulty, is_ai_generated, order_index, answer_alternatives, answer_prefix
)
SELECT
  t.id, c.id, v.latex_body, v.answer, v.latex_answer,
  v.difficulty, false, v.order_index, v.alternatives, NULL
FROM (VALUES
  (
    $t$h7_goniometrie_diff$t$, $c$basis_sin_cos$c$, 7, 2,
    $vraag$f(x) = 4\cos(x) - \sin(x)$vraag$,
    $ant$-4sin(x) - cos(x)$ant$,
    $latex$-4\sin(x) - \cos(x)$latex$,
    ARRAY[$alt$-(4sin(x) + cos(x))$alt$, $alt$-4sin(x)-cos(x)$alt$]::text[]
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$basis_sin_cos$c$, 8, 3,
    $vraag$f(x) = 2x^{2} + 3\sin(x) - \cos(x)$vraag$,
    $ant$4x + 3cos(x) + sin(x)$ant$,
    $latex$4x + 3\cos(x) + \sin(x)$latex$,
    ARRAY[$alt$4x+3cos(x)+sin(x)$alt$, $alt$sin(x) + 3cos(x) + 4x$alt$]::text[]
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$basis_tan$c$, 7, 2,
    $vraag$f(x) = 4\tan(x) - x$vraag$,
    $ant$4/cos^2(x) - 1$ant$,
    $latex$\dfrac{4}{\cos^{2}(x)} - 1$latex$,
    ARRAY[$alt$4/cos^2(x)-1$alt$, $alt$(4 - cos^2(x))/cos^2(x)$alt$, $alt$4/(cos^2(x)) - 1$alt$]::text[]
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$basis_tan$c$, 8, 3,
    $vraag$f(x) = \tan(2x + 1)$vraag$,
    $ant$2/cos^2(2x + 1)$ant$,
    $latex$\dfrac{2}{\cos^{2}(2x + 1)}$latex$,
    ARRAY[$alt$2/cos^2(2x+1)$alt$, $alt$2/(cos^2(2x+1))$alt$]::text[]
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$gonio_plus_product$c$, 7, 2,
    $vraag$f(x) = x\sin(4x)$vraag$,
    $ant$sin(4x) + 4x cos(4x)$ant$,
    $latex$\sin(4x) + 4x\cos(4x)$latex$,
    ARRAY[$alt$4xcos(4x) + sin(4x)$alt$, $alt$sin(4x)+4x*cos(4x)$alt$]::text[]
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$gonio_plus_product$c$, 8, 3,
    $vraag$f(x) = (x + 1)\cos(2x)$vraag$,
    $ant$cos(2x) - 2(x + 1)sin(2x)$ant$,
    $latex$\cos(2x) - 2(x + 1)\sin(2x)$latex$,
    ARRAY[$alt$cos(2x) - 2x sin(2x) - 2sin(2x)$alt$, $alt$cos(2x)-2(x+1)sin(2x)$alt$]::text[]
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$gonio_plus_quotient$c$, 7, 2,
    $vraag$f(x) = \dfrac{\sin(x)}{x + 1}$vraag$,
    $ant$((x + 1)cos(x) - sin(x))/(x + 1)^2$ant$,
    $latex$\dfrac{(x + 1)\cos(x) - \sin(x)}{(x + 1)^{2}}$latex$,
    ARRAY[$alt$((x+1)cos(x)-sin(x))/(x+1)^2$alt$, $alt$(cos(x)(x+1) - sin(x))/(x+1)^2$alt$]::text[]
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$gonio_plus_quotient$c$, 8, 3,
    $vraag$f(x) = \dfrac{x + \sin(x)}{\cos(x)}$vraag$,
    $ant$(1 + cos(x) + x sin(x))/cos^2(x)$ant$,
    $latex$\dfrac{1 + \cos(x) + x\sin(x)}{\cos^{2}(x)}$latex$,
    ARRAY[$alt$((1+cos(x))cos(x) + (x+sin(x))sin(x))/cos^2(x)$alt$, $alt$(1+cos(x)+x*sin(x))/cos^2(x)$alt$]::text[]
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$ketting_lineair$c$, 7, 2,
    $vraag$f(x) = \cos(5x - 2)$vraag$,
    $ant$-5sin(5x - 2)$ant$,
    $latex$-5\sin(5x - 2)$latex$,
    ARRAY[$alt$-5sin(5x-2)$alt$, $alt$-5*sin(5x-2)$alt$]::text[]
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$ketting_lineair$c$, 8, 3,
    $vraag$f(x) = 3\sin(4x + 1)$vraag$,
    $ant$12cos(4x + 1)$ant$,
    $latex$12\cos(4x + 1)$latex$,
    ARRAY[$alt$12cos(4x+1)$alt$, $alt$3*4*cos(4x+1)$alt$]::text[]
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$ketting_polynoom$c$, 7, 2,
    $vraag$f(x) = \sin(x^{2} - 3)$vraag$,
    $ant$2x cos(x^2 - 3)$ant$,
    $latex$2x\cos(x^{2} - 3)$latex$,
    ARRAY[$alt$2xcos(x^2-3)$alt$, $alt$cos(x^2-3)*2x$alt$]::text[]
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$ketting_polynoom$c$, 8, 3,
    $vraag$f(x) = \cos(x^{3} + x)$vraag$,
    $ant$-(3x^2 + 1)sin(x^3 + x)$ant$,
    $latex$-(3x^{2} + 1)\sin(x^{3} + x)$latex$,
    ARRAY[$alt$(-3x^2 - 1)sin(x^3 + x)$alt$, $alt$-(3x^2+1)sin(x^3+x)$alt$]::text[]
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$macht_van_gonio$c$, 7, 2,
    $vraag$f(x) = \sin^{2}(3x)$vraag$,
    $ant$6 sin(3x) cos(3x)$ant$,
    $latex$6\sin(3x)\cos(3x)$latex$,
    ARRAY[$alt$6sin(3x)cos(3x)$alt$, $alt$6cos(3x)sin(3x)$alt$, $alt$3sin(6x)$alt$]::text[]
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$macht_van_gonio$c$, 8, 3,
    $vraag$f(x) = 2\cos^{3}(x)$vraag$,
    $ant$-6 cos^2(x) sin(x)$ant$,
    $latex$-6\cos^{2}(x)\sin(x)$latex$,
    ARRAY[$alt$-6cos^2(x)sin(x)$alt$, $alt$-6sin(x)cos^2(x)$alt$]::text[]
  )
) AS v(topic_slug, cluster_slug, order_index, difficulty, latex_body, answer, latex_answer, alternatives)
JOIN public.topics_new t
  ON t.slug = v.topic_slug
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id
 AND c.slug = v.cluster_slug
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
    $t$h7_goniometrie_diff$t$, $c$basis_sin_cos$c$, 7, 0,
    $stap$Er staan een cosinus en een sinus naast elkaar. Differentieer ze apart en tel de afgeleiden op.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$basis_sin_cos$c$, 7, 1,
    $stap$De afgeleide van $\cos(x)$ is $-\sin(x)$, dus de afgeleide van $4\cos(x)$ is $-4\sin(x)$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$basis_sin_cos$c$, 7, 2,
    $stap$De afgeleide van $-\sin(x)$ is $-\cos(x)$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$basis_sin_cos$c$, 7, 3,
    $stap$Samen: $f'(x) = -4\sin(x) - \cos(x)$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$basis_sin_cos$c$, 8, 0,
    $stap$Drie termen. Differentieer elke term apart.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$basis_sin_cos$c$, 8, 1,
    $stap$De afgeleide van $2x^{2}$ is $4x$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$basis_sin_cos$c$, 8, 2,
    $stap$De afgeleide van $3\sin(x)$ is $3\cos(x)$. De afgeleide van $-\cos(x)$ is $\sin(x)$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$basis_sin_cos$c$, 8, 3,
    $stap$Samen: $f'(x) = 4x + 3\cos(x) + \sin(x)$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$basis_tan$c$, 7, 0,
    $stap$Een tangens en een gewone $x$. De tangens bestaat alleen als $\cos(x) \neq 0$. Differentieer de termen apart.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$basis_tan$c$, 7, 1,
    $stap$De afgeleide van $\tan(x)$ is $\dfrac{1}{\cos^{2}(x)}$, dus de afgeleide van $4\tan(x)$ is $\dfrac{4}{\cos^{2}(x)}$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$basis_tan$c$, 7, 2,
    $stap$De afgeleide van $-x$ is $-1$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$basis_tan$c$, 7, 3,
    $stap$Samen: $f'(x) = \dfrac{4}{\cos^{2}(x)} - 1$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$basis_tan$c$, 8, 0,
    $stap$Buiten de tangens staat $2x + 1$. Dat is de kettingregel. De tangens bestaat alleen als $\cos(2x + 1) \neq 0$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$basis_tan$c$, 8, 1,
    $stap$Noem $h(x) = 2x + 1$. Dan is $h'(x) = 2$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$basis_tan$c$, 8, 2,
    $stap$De afgeleide van de buitenkant, met de binnenkant erin, is $\dfrac{1}{\cos^{2}(2x + 1)}$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$basis_tan$c$, 8, 3,
    $stap$Keer de afgeleide van de binnenkant: $f'(x) = \dfrac{2}{\cos^{2}(2x + 1)}$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$gonio_plus_product$c$, 7, 0,
    $stap$Er staat $x$ keer $\sin(4x)$. Dat is de productregel, en in de sinus zit de kettingregel.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$gonio_plus_product$c$, 7, 1,
    $stap$Noem $g(x) = x$ en $h(x) = \sin(4x)$. Dan is $g'(x) = 1$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$gonio_plus_product$c$, 7, 2,
    $stap$Voor $h$: binnenkant $4x$, dus $h'(x) = \cos(4x) \cdot 4 = 4\cos(4x)$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$gonio_plus_product$c$, 7, 3,
    $stap$$f'(x) = \sin(4x) + x \cdot 4\cos(4x) = \sin(4x) + 4x\cos(4x)$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$gonio_plus_product$c$, 8, 0,
    $stap$Er staat $(x + 1)$ keer $\cos(2x)$. Dat is de productregel, en in de cosinus zit de kettingregel.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$gonio_plus_product$c$, 8, 1,
    $stap$Noem $g(x) = x + 1$ en $h(x) = \cos(2x)$. Dan is $g'(x) = 1$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$gonio_plus_product$c$, 8, 2,
    $stap$Voor $h$: binnenkant $2x$, dus $h'(x) = -\sin(2x) \cdot 2 = -2\sin(2x)$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$gonio_plus_product$c$, 8, 3,
    $stap$$f'(x) = \cos(2x) + (x + 1) \cdot (-2\sin(2x)) = \cos(2x) - 2(x + 1)\sin(2x)$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$gonio_plus_quotient$c$, 7, 0,
    $stap$Er staat een breuk. Dat is de quotiëntregel. De noemer mag niet nul zijn, dus $x \neq -1$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$gonio_plus_quotient$c$, 7, 1,
    $stap$Noem $g(x) = \sin(x)$ en $h(x) = x + 1$. Dan is $g'(x) = \cos(x)$ en $h'(x) = 1$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$gonio_plus_quotient$c$, 7, 2,
    $stap$Teller van de afgeleide: $\cos(x) \cdot (x + 1) - \sin(x) \cdot 1$. Noemer: $(x + 1)^{2}$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$gonio_plus_quotient$c$, 7, 3,
    $stap$Dus $f'(x) = \dfrac{(x + 1)\cos(x) - \sin(x)}{(x + 1)^{2}}$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$gonio_plus_quotient$c$, 8, 0,
    $stap$Er staat een breuk met een cosinus in de noemer. Dat is de quotiëntregel. De noemer mag niet nul zijn, dus $\cos(x) \neq 0$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$gonio_plus_quotient$c$, 8, 1,
    $stap$Noem $g(x) = x + \sin(x)$ en $h(x) = \cos(x)$. Dan is $g'(x) = 1 + \cos(x)$ en $h'(x) = -\sin(x)$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$gonio_plus_quotient$c$, 8, 2,
    $stap$Teller van de afgeleide: $(1 + \cos(x))\cos(x) - (x + \sin(x)) \cdot (-\sin(x))$. Noemer: $\cos^{2}(x)$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$gonio_plus_quotient$c$, 8, 3,
    $stap$De teller wordt $\cos(x) + \cos^{2}(x) + x\sin(x) + \sin^{2}(x) = 1 + \cos(x) + x\sin(x)$. Dus $f'(x) = \dfrac{1 + \cos(x) + x\sin(x)}{\cos^{2}(x)}$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$ketting_lineair$c$, 7, 0,
    $stap$Buiten de cosinus staat $5x - 2$. Dat is de kettingregel.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$ketting_lineair$c$, 7, 1,
    $stap$Noem $h(x) = 5x - 2$. Dan is $h'(x) = 5$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$ketting_lineair$c$, 7, 2,
    $stap$De afgeleide van de buitenkant is $-\sin(5x - 2)$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$ketting_lineair$c$, 7, 3,
    $stap$Keer de afgeleide van de binnenkant: $f'(x) = -5\sin(5x - 2)$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$ketting_lineair$c$, 8, 0,
    $stap$Er staat $3$ keer een sinus met $4x + 1$ erin. Eerst de kettingregel, daarna keer $3$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$ketting_lineair$c$, 8, 1,
    $stap$Noem $h(x) = 4x + 1$. Dan is $h'(x) = 4$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$ketting_lineair$c$, 8, 2,
    $stap$De afgeleide van $\sin(4x + 1)$ is $\cos(4x + 1) \cdot 4 = 4\cos(4x + 1)$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$ketting_lineair$c$, 8, 3,
    $stap$Keer $3$: $f'(x) = 12\cos(4x + 1)$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$ketting_polynoom$c$, 7, 0,
    $stap$Buiten de sinus staat $x^{2} - 3$. Dat is de kettingregel.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$ketting_polynoom$c$, 7, 1,
    $stap$Noem $h(x) = x^{2} - 3$. Dan is $h'(x) = 2x$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$ketting_polynoom$c$, 7, 2,
    $stap$De afgeleide van de buitenkant, met de binnenkant erin, is $\cos(x^{2} - 3)$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$ketting_polynoom$c$, 7, 3,
    $stap$Keer de afgeleide van de binnenkant: $f'(x) = 2x\cos(x^{2} - 3)$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$ketting_polynoom$c$, 8, 0,
    $stap$Buiten de cosinus staat $x^{3} + x$. Dat is de kettingregel.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$ketting_polynoom$c$, 8, 1,
    $stap$Noem $h(x) = x^{3} + x$. Dan is $h'(x) = 3x^{2} + 1$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$ketting_polynoom$c$, 8, 2,
    $stap$De afgeleide van de buitenkant is $-\sin(x^{3} + x)$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$ketting_polynoom$c$, 8, 3,
    $stap$Keer de afgeleide van de binnenkant: $f'(x) = -(3x^{2} + 1)\sin(x^{3} + x)$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$macht_van_gonio$c$, 7, 0,
    $stap$Er staat een kwadraat om de sinus, en in de sinus staat $3x$. Eerst de macht, daarna de kettingregel.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$macht_van_gonio$c$, 7, 1,
    $stap$Noem $h(x) = \sin(3x)$. Dan is $f(x) = h(x)^{2}$ en $h'(x) = \cos(3x) \cdot 3 = 3\cos(3x)$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$macht_van_gonio$c$, 7, 2,
    $stap$De afgeleide van de buitenkant is $2\sin(3x)$. Keer $h'(x)$: $2\sin(3x) \cdot 3\cos(3x)$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$macht_van_gonio$c$, 7, 3,
    $stap$Dus $f'(x) = 6\sin(3x)\cos(3x)$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$macht_van_gonio$c$, 8, 0,
    $stap$Er staat $2$ keer een derdemacht van een cosinus. Eerst de macht, daarna de afgeleide van de cosinus.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$macht_van_gonio$c$, 8, 1,
    $stap$Noem $h(x) = \cos(x)$. Dan is $f(x) = 2\,h(x)^{3}$ en $h'(x) = -\sin(x)$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$macht_van_gonio$c$, 8, 2,
    $stap$De afgeleide van $2\,h^{3}$ is $2 \cdot 3 h^{2} \cdot h' = 6\cos^{2}(x) \cdot (-\sin(x))$.$stap$
  ),
  (
    $t$h7_goniometrie_diff$t$, $c$macht_van_gonio$c$, 8, 3,
    $stap$Dus $f'(x) = -6\cos^{2}(x)\sin(x)$.$stap$
  )
) AS v(topic_slug, cluster_slug, q_order, step_order, step_description)
JOIN public.topics_new t
  ON t.slug = v.topic_slug
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id
 AND c.slug = v.cluster_slug
JOIN public.questions_new q
  ON q.topic_id = t.id
 AND q.cluster_id = c.id
 AND q.order_index = v.q_order
ON CONFLICT (question_id, step_order) DO NOTHING;

DO $$
DECLARE
  soort text;
  n int;
  n_zonder int;
BEGIN
  FOREACH soort IN ARRAY ARRAY['basis_sin_cos', 'basis_tan', 'gonio_plus_product', 'gonio_plus_quotient', 'ketting_lineair', 'ketting_polynoom', 'macht_van_gonio']::text[]
  LOOP
    SELECT count(*) INTO n
    FROM public.questions_new q
    JOIN public.topic_clusters_new c ON c.id = q.cluster_id
    JOIN public.topics_new t ON t.id = c.topic_id
    JOIN public.chapters h ON h.id = t.chapter_id
    WHERE h.slug = 'h7'
      AND c.slug = soort;

    SELECT count(*) INTO n_zonder
    FROM public.questions_new q
    JOIN public.topic_clusters_new c ON c.id = q.cluster_id
    JOIN public.topics_new t ON t.id = c.topic_id
    JOIN public.chapters h ON h.id = t.chapter_id
    WHERE h.slug = 'h7'
      AND c.slug = soort
      AND q.order_index >= 7
      AND (
        SELECT count(*)
        FROM public.question_steps_new s
        WHERE s.question_id = q.id
          AND s.step_order IN (0, 1, 2, 3)
      ) < 4;

    IF n < 8 OR n_zonder <> 0 THEN
      RAISE EXCEPTION 'soort % in h7 klopt niet: aantal %, zonder stappen 0-3 %', soort, n, n_zonder;
    END IF;
  END LOOP;

  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new c ON c.id = q.cluster_id
  JOIN public.topics_new t ON t.id = c.topic_id
  JOIN public.chapters h ON h.id = t.chapter_id
  WHERE h.slug = 'h7'
    AND c.slug = 'sinus_in_een_verhaal';

  IF n < 8 THEN
    RAISE EXCEPTION 'sinus_in_een_verhaal in h7 heeft minder dan 8 vragen: %', n;
  END IF;
END $$;

COMMIT;
