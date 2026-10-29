-- Een makkelijkere soort vóór "kettingregel + quotiëntregel" (AFG-298):
-- een breuk waarbij de kettingregel maar aan één kant zit (de teller, met
-- een wortel of een macht) en de noemer een kale lineaire term is (geen
-- kettingregel nodig voor de noemer zelf). Dat ontbrak nog tussen de pure
-- kettingregel-opgaven en de volle combinatie van twee kettingregels plus de
-- quotiëntregel.
--
-- Komt in het bestaande onderwerp h6_combinaties, vóór de soort
-- "Kettingregel + quotiëntregel": die schuift van volgorde 2 naar 3.
--
-- Net als de bestaande "Kettingregel + quotiëntregel"-opgaven staat het
-- (nog niet samengevoegde) resultaat van de quotiëntregel als alternatief,
-- en de samengevoegde breuk als hoofdantwoord (zie migratie 0048).
--
-- Elke afgeleide is onafhankelijk nagerekend (met sympy, en numeriek in
-- src/lib/practice/ketting-eenvoudige-breuk.test.ts).
--
-- Twee keer draaien voegt niets dubbel toe.

BEGIN;

INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index)
SELECT
  t.id,
  'ketting_eenvoudige_breuk',
  'Kettingregel met een eenvoudige breuk',
  2
FROM public.topics_new t
WHERE t.slug = 'h6_combinaties'
ON CONFLICT (topic_id, slug) DO UPDATE
SET
  title = EXCLUDED.title,
  order_index = EXCLUDED.order_index;

-- Schuif de bestaande combinatie-soort één plek op, zodat de nieuwe,
-- makkelijkere soort ervoor staat.
UPDATE public.topic_clusters_new c
SET order_index = 3
FROM public.topics_new t
WHERE c.topic_id = t.id
  AND t.slug = 'h6_combinaties'
  AND c.slug = 'ketting_plus_quotient'
  AND c.order_index <> 3;

INSERT INTO public.questions_new (
  topic_id, cluster_id, latex_body, answer, latex_answer,
  difficulty, is_ai_generated, order_index, answer_alternatives, answer_prefix
)
SELECT
  t.id, c.id, v.latex_body, v.answer, v.latex_answer,
  v.difficulty, false, v.order_index, v.alternatives, NULL
FROM (VALUES
  (
    1, 1,
    $vraag$f(x) = \dfrac{\sqrt{2x + 1}}{x}$vraag$,
    $ant$(-x - 1)/(x^2*sqrt(2x + 1))$ant$,
    $latex$\dfrac{-x - 1}{x^{2}\sqrt{2x + 1}}$latex$,
    ARRAY[$alt$(x/sqrt(2x + 1) - sqrt(2x + 1))/x^2$alt$]::text[]
  ),
  (
    2, 1,
    $vraag$f(x) = \dfrac{\sqrt{4x - 3}}{x}$vraag$,
    $ant$(3 - 2x)/(x^2*sqrt(4x - 3))$ant$,
    $latex$\dfrac{3 - 2x}{x^{2}\sqrt{4x - 3}}$latex$,
    ARRAY[$alt$(2x/sqrt(4x - 3) - sqrt(4x - 3))/x^2$alt$]::text[]
  ),
  (
    3, 1,
    $vraag$f(x) = \dfrac{(3x + 2)^{2}}{x}$vraag$,
    $ant$(9x^2 - 4)/x^2$ant$,
    $latex$\dfrac{9x^{2} - 4}{x^{2}}$latex$,
    ARRAY[$alt$(6(3x + 2)*x - (3x + 2)^2)/x^2$alt$]::text[]
  ),
  (
    4, 2,
    $vraag$f(x) = \dfrac{\sqrt{2x + 5}}{x + 1}$vraag$,
    $ant$(-x - 4)/((x + 1)^2*sqrt(2x + 5))$ant$,
    $latex$\dfrac{-x - 4}{(x + 1)^{2}\sqrt{2x + 5}}$latex$,
    ARRAY[$alt$((x + 1)/sqrt(2x + 5) - sqrt(2x + 5))/(x + 1)^2$alt$]::text[]
  ),
  (
    5, 2,
    $vraag$f(x) = \dfrac{(2x - 1)^{2}}{x + 3}$vraag$,
    $ant$(4x^2 + 24x - 13)/(x + 3)^2$ant$,
    $latex$\dfrac{4x^{2} + 24x - 13}{(x + 3)^{2}}$latex$,
    ARRAY[$alt$(4(2x - 1)*(x + 3) - (2x - 1)^2)/(x + 3)^2$alt$]::text[]
  ),
  (
    6, 2,
    $vraag$f(x) = \dfrac{\sqrt{5x - 4}}{x - 2}$vraag$,
    $ant$(-5x - 2)/(2(x - 2)^2*sqrt(5x - 4))$ant$,
    $latex$\dfrac{-5x - 2}{2(x - 2)^{2}\sqrt{5x - 4}}$latex$,
    ARRAY[$alt$(5(x - 2)/(2*sqrt(5x - 4)) - sqrt(5x - 4))/(x - 2)^2$alt$]::text[]
  ),
  (
    7, 3,
    $vraag$f(x) = \dfrac{(3x + 1)^{2}}{2x + 1}$vraag$,
    $ant$(18x^2 + 18x + 4)/(2x + 1)^2$ant$,
    $latex$\dfrac{18x^{2} + 18x + 4}{(2x + 1)^{2}}$latex$,
    ARRAY[$alt$(6(3x + 1)*(2x + 1) - 2(3x + 1)^2)/(2x + 1)^2$alt$]::text[]
  ),
  (
    8, 3,
    $vraag$f(x) = \dfrac{\sqrt{3x + 4}}{2x - 3}$vraag$,
    $ant$(-6x - 25)/(2(2x - 3)^2*sqrt(3x + 4))$ant$,
    $latex$\dfrac{-6x - 25}{2(2x - 3)^{2}\sqrt{3x + 4}}$latex$,
    ARRAY[$alt$(3(2x - 3)/(2*sqrt(3x + 4)) - 2*sqrt(3x + 4))/(2x - 3)^2$alt$]::text[]
  )
) AS v(order_index, difficulty, latex_body, answer, latex_answer, alternatives)
JOIN public.topics_new t
  ON t.slug = 'h6_combinaties'
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id
 AND c.slug = 'ketting_eenvoudige_breuk'
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
    $stap$Er staat een breuk met een wortel in de teller. Dat is de quotiëntregel, en in de wortel zit de kettingregel. De wortel bestaat als $2x + 1 > 0$, en de noemer mag niet nul zijn, dus $x \neq 0$.$stap$
  ),
  (
    1, 1,
    $stap$Noem $g(x) = \sqrt{2x + 1}$ en $h(x) = x$. Dan is $g'(x) = \dfrac{1}{\sqrt{2x + 1}}$ en $h'(x) = 1$.$stap$
  ),
  (
    1, 2,
    $stap$Teller van de afgeleide: $\dfrac{x}{\sqrt{2x + 1}} - \sqrt{2x + 1}$. Noemer: $x^{2}$.$stap$
  ),
  (
    1, 3,
    $stap$De teller op één noemer is $\dfrac{x - (2x + 1)}{\sqrt{2x + 1}} = \dfrac{-x - 1}{\sqrt{2x + 1}}$. Deel door $x^{2}$: $f'(x) = \dfrac{-x - 1}{x^{2}\sqrt{2x + 1}}$.$stap$
  ),
  (
    2, 0,
    $stap$Er staat een breuk met een wortel in de teller. Dat is de quotiëntregel, en in de wortel zit de kettingregel. De wortel bestaat als $4x - 3 > 0$, en de noemer mag niet nul zijn, dus $x \neq 0$.$stap$
  ),
  (
    2, 1,
    $stap$Noem $g(x) = \sqrt{4x - 3}$ en $h(x) = x$. Dan is $g'(x) = \dfrac{2}{\sqrt{4x - 3}}$ en $h'(x) = 1$.$stap$
  ),
  (
    2, 2,
    $stap$Teller van de afgeleide: $\dfrac{2x}{\sqrt{4x - 3}} - \sqrt{4x - 3}$. Noemer: $x^{2}$.$stap$
  ),
  (
    2, 3,
    $stap$De teller op één noemer is $\dfrac{2x - (4x - 3)}{\sqrt{4x - 3}} = \dfrac{3 - 2x}{\sqrt{4x - 3}}$. Deel door $x^{2}$: $f'(x) = \dfrac{3 - 2x}{x^{2}\sqrt{4x - 3}}$.$stap$
  ),
  (
    3, 0,
    $stap$Er staat een breuk met een macht in de teller. Dat is de quotiëntregel, en in de macht zit de kettingregel. De noemer mag niet nul zijn, dus $x \neq 0$.$stap$
  ),
  (
    3, 1,
    $stap$Noem $g(x) = (3x + 2)^{2}$ en $h(x) = x$. Dan is $g'(x) = 2(3x + 2) \cdot 3 = 6(3x + 2)$ en $h'(x) = 1$.$stap$
  ),
  (
    3, 2,
    $stap$Teller van de afgeleide: $6(3x + 2) \cdot x - (3x + 2)^{2}$. Noemer: $x^{2}$.$stap$
  ),
  (
    3, 3,
    $stap$Uitwerken: $6(3x + 2)x = 18x^{2} + 12x$ en $(3x + 2)^{2} = 9x^{2} + 12x + 4$. De teller is $9x^{2} - 4$. Deel door $x^{2}$: $f'(x) = \dfrac{9x^{2} - 4}{x^{2}}$.$stap$
  ),
  (
    4, 0,
    $stap$Er staat een breuk met een wortel in de teller. Dat is de quotiëntregel, en in de wortel zit de kettingregel. De wortel bestaat als $2x + 5 > 0$, en de noemer mag niet nul zijn, dus $x \neq -1$.$stap$
  ),
  (
    4, 1,
    $stap$Noem $g(x) = \sqrt{2x + 5}$ en $h(x) = x + 1$. Dan is $g'(x) = \dfrac{1}{\sqrt{2x + 5}}$ en $h'(x) = 1$.$stap$
  ),
  (
    4, 2,
    $stap$Teller van de afgeleide: $\dfrac{x + 1}{\sqrt{2x + 5}} - \sqrt{2x + 5}$. Noemer: $(x + 1)^{2}$.$stap$
  ),
  (
    4, 3,
    $stap$De teller op één noemer is $\dfrac{(x + 1) - (2x + 5)}{\sqrt{2x + 5}} = \dfrac{-x - 4}{\sqrt{2x + 5}}$. Deel door $(x + 1)^{2}$: $f'(x) = \dfrac{-x - 4}{(x + 1)^{2}\sqrt{2x + 5}}$.$stap$
  ),
  (
    5, 0,
    $stap$Er staat een breuk met een macht in de teller. Dat is de quotiëntregel, en in de macht zit de kettingregel. De noemer mag niet nul zijn, dus $x \neq -3$.$stap$
  ),
  (
    5, 1,
    $stap$Noem $g(x) = (2x - 1)^{2}$ en $h(x) = x + 3$. Dan is $g'(x) = 2(2x - 1) \cdot 2 = 4(2x - 1)$ en $h'(x) = 1$.$stap$
  ),
  (
    5, 2,
    $stap$Teller van de afgeleide: $4(2x - 1)(x + 3) - (2x - 1)^{2}$. Noemer: $(x + 3)^{2}$.$stap$
  ),
  (
    5, 3,
    $stap$Uitwerken: $4(2x - 1)(x + 3) = 8x^{2} + 20x - 12$ en $(2x - 1)^{2} = 4x^{2} - 4x + 1$. De teller is $4x^{2} + 24x - 13$. Deel door $(x + 3)^{2}$: $f'(x) = \dfrac{4x^{2} + 24x - 13}{(x + 3)^{2}}$.$stap$
  ),
  (
    6, 0,
    $stap$Er staat een breuk met een wortel in de teller. Dat is de quotiëntregel, en in de wortel zit de kettingregel. De wortel bestaat als $5x - 4 > 0$, en de noemer mag niet nul zijn, dus $x \neq 2$.$stap$
  ),
  (
    6, 1,
    $stap$Noem $g(x) = \sqrt{5x - 4}$ en $h(x) = x - 2$. Dan is $g'(x) = \dfrac{5}{2\sqrt{5x - 4}}$ en $h'(x) = 1$.$stap$
  ),
  (
    6, 2,
    $stap$Teller van de afgeleide: $\dfrac{5(x - 2)}{2\sqrt{5x - 4}} - \sqrt{5x - 4}$. Noemer: $(x - 2)^{2}$.$stap$
  ),
  (
    6, 3,
    $stap$De teller op één noemer is $\dfrac{5(x - 2) - 2(5x - 4)}{2\sqrt{5x - 4}} = \dfrac{-5x - 2}{2\sqrt{5x - 4}}$. Deel door $(x - 2)^{2}$: $f'(x) = \dfrac{-5x - 2}{2(x - 2)^{2}\sqrt{5x - 4}}$.$stap$
  ),
  (
    7, 0,
    $stap$Er staat een breuk met een macht in de teller. Dat is de quotiëntregel, en in de macht zit de kettingregel. De noemer mag niet nul zijn, dus $x \neq -\tfrac{1}{2}$.$stap$
  ),
  (
    7, 1,
    $stap$Noem $g(x) = (3x + 1)^{2}$ en $h(x) = 2x + 1$. Dan is $g'(x) = 2(3x + 1) \cdot 3 = 6(3x + 1)$ en $h'(x) = 2$.$stap$
  ),
  (
    7, 2,
    $stap$Teller van de afgeleide: $6(3x + 1)(2x + 1) - 2(3x + 1)^{2}$. Noemer: $(2x + 1)^{2}$.$stap$
  ),
  (
    7, 3,
    $stap$Uitwerken: $6(3x + 1)(2x + 1) = 36x^{2} + 30x + 6$ en $2(3x + 1)^{2} = 18x^{2} + 12x + 2$. De teller is $18x^{2} + 18x + 4$. Deel door $(2x + 1)^{2}$: $f'(x) = \dfrac{18x^{2} + 18x + 4}{(2x + 1)^{2}}$.$stap$
  ),
  (
    8, 0,
    $stap$Er staat een breuk met een wortel in de teller. Dat is de quotiëntregel, en in de wortel zit de kettingregel. De wortel bestaat als $3x + 4 > 0$, en de noemer mag niet nul zijn, dus $x \neq \tfrac{3}{2}$.$stap$
  ),
  (
    8, 1,
    $stap$Noem $g(x) = \sqrt{3x + 4}$ en $h(x) = 2x - 3$. Dan is $g'(x) = \dfrac{3}{2\sqrt{3x + 4}}$ en $h'(x) = 2$.$stap$
  ),
  (
    8, 2,
    $stap$Teller van de afgeleide: $\dfrac{3(2x - 3)}{2\sqrt{3x + 4}} - 2\sqrt{3x + 4}$. Noemer: $(2x - 3)^{2}$.$stap$
  ),
  (
    8, 3,
    $stap$De teller op één noemer is $\dfrac{3(2x - 3) - 4(3x + 4)}{2\sqrt{3x + 4}} = \dfrac{-6x - 25}{2\sqrt{3x + 4}}$. Deel door $(2x - 3)^{2}$: $f'(x) = \dfrac{-6x - 25}{2(2x - 3)^{2}\sqrt{3x + 4}}$.$stap$
  )
) AS v(q_order, step_order, step_description)
JOIN public.topics_new t
  ON t.slug = 'h6_combinaties'
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id
 AND c.slug = 'ketting_eenvoudige_breuk'
JOIN public.questions_new q
  ON q.topic_id = t.id
 AND q.cluster_id = c.id
 AND q.order_index = v.q_order
ON CONFLICT (question_id, step_order) DO NOTHING;

DO $$
DECLARE
  n int;
  volgorde_nieuw int;
  volgorde_quotient int;
BEGIN
  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new c ON c.id = q.cluster_id
  JOIN public.topics_new t ON t.id = c.topic_id
  WHERE t.slug = 'h6_combinaties'
    AND c.slug = 'ketting_eenvoudige_breuk';

  IF n <> 8 THEN
    RAISE EXCEPTION 'ketting_eenvoudige_breuk klopt niet: aantal vragen is %, verwacht 8', n;
  END IF;

  SELECT c.order_index INTO volgorde_nieuw
  FROM public.topic_clusters_new c
  JOIN public.topics_new t ON t.id = c.topic_id
  WHERE t.slug = 'h6_combinaties' AND c.slug = 'ketting_eenvoudige_breuk';

  SELECT c.order_index INTO volgorde_quotient
  FROM public.topic_clusters_new c
  JOIN public.topics_new t ON t.id = c.topic_id
  WHERE t.slug = 'h6_combinaties' AND c.slug = 'ketting_plus_quotient';

  IF volgorde_nieuw >= volgorde_quotient THEN
    RAISE EXCEPTION 'ketting_eenvoudige_breuk (volgorde %) staat niet vóór ketting_plus_quotient (volgorde %)',
      volgorde_nieuw, volgorde_quotient;
  END IF;
END $$;

COMMIT;
