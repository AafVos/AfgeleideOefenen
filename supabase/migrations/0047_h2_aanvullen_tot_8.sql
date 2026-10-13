-- Hoofdstuk 2 aanvullen tot minstens 8 vragen per soort.
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
    $t$h2_termsgewijs$t$, $c$polynoom_differentieren$c$, 7, 2,
    $vraag$f(x) = 4x^{5} - 3x^{4} + 6x^{2} - 9$vraag$,
    $ant$20x^4 - 12x^3 + 12x$ant$,
    $latex$20x^{4} - 12x^{3} + 12x$latex$,
    ARRAY[$alt$4x(5x^3 - 3x^2 + 3)$alt$, $alt$20x⁴ - 12x³ + 12x$alt$]::text[]
  ),
  (
    $t$h2_termsgewijs$t$, $c$polynoom_differentieren$c$, 8, 3,
    $vraag$f(x) = -3x^{6} + 5x^{3} - 8x + 11$vraag$,
    $ant$-18x^5 + 15x^2 - 8$ant$,
    $latex$-18x^{5} + 15x^{2} - 8$latex$,
    ARRAY[$alt$-18x⁵ + 15x² - 8$alt$]::text[]
  ),
  (
    $t$h2_haakjes_eerst$t$, $c$merkwaardige_producten$c$, 7, 2,
    $vraag$f(x) = (4x - 1)^{2}$vraag$,
    $ant$32x - 8$ant$,
    $latex$32x - 8$latex$,
    ARRAY[$alt$8(4x - 1)$alt$]::text[]
  ),
  (
    $t$h2_haakjes_eerst$t$, $c$merkwaardige_producten$c$, 8, 3,
    $vraag$f(x) = 3(2x + 1)^{2} - (x + 5)^{2}$vraag$,
    $ant$22x + 2$ant$,
    $latex$22x + 2$latex$,
    ARRAY[$alt$2(11x + 1)$alt$]::text[]
  ),
  (
    $t$h2_haakjes_eerst$t$, $c$product_uitwerken$c$, 7, 2,
    $vraag$f(x) = (2x + 1)(x - 4)$vraag$,
    $ant$4x - 7$ant$,
    $latex$4x - 7$latex$,
    ARRAY[$alt$2(x - 4) + (2x + 1)$alt$]::text[]
  ),
  (
    $t$h2_haakjes_eerst$t$, $c$product_uitwerken$c$, 8, 3,
    $vraag$f(x) = (x + 2)(x^{2} - 3x + 1)$vraag$,
    $ant$3x^2 - 2x - 5$ant$,
    $latex$3x^{2} - 2x - 5$latex$,
    ARRAY[$alt$(x^2 - 3x + 1) + (x + 2)(2x - 3)$alt$, $alt$3x² - 2x - 5$alt$]::text[]
  ),
  (
    $t$h2_productregel$t$, $c$drie_factoren$c$, 4, 1,
    $vraag$f(x) = x(x + 1)(x - 3)$vraag$,
    $ant$(x + 1)(x - 3) + x(x - 3) + x(x + 1)$ant$,
    $latex$(x + 1)(x - 3) + x(x - 3) + x(x + 1)$latex$,
    ARRAY[$alt$3x^2 - 4x - 3$alt$]::text[]
  ),
  (
    $t$h2_productregel$t$, $c$drie_factoren$c$, 5, 1,
    $vraag$f(x) = (x - 1)(x + 1)(x + 4)$vraag$,
    $ant$(x + 1)(x + 4) + (x - 1)(x + 4) + (x - 1)(x + 1)$ant$,
    $latex$(x + 1)(x + 4) + (x - 1)(x + 4) + (x - 1)(x + 1)$latex$,
    ARRAY[$alt$3x^2 + 8x - 1$alt$]::text[]
  ),
  (
    $t$h2_productregel$t$, $c$drie_factoren$c$, 6, 2,
    $vraag$f(x) = 2x(x + 3)(x - 1)$vraag$,
    $ant$2(x + 3)(x - 1) + 2x(x - 1) + 2x(x + 3)$ant$,
    $latex$2(x + 3)(x - 1) + 2x(x - 1) + 2x(x + 3)$latex$,
    ARRAY[$alt$6x^2 + 8x - 6$alt$]::text[]
  ),
  (
    $t$h2_productregel$t$, $c$drie_factoren$c$, 7, 2,
    $vraag$f(x) = (x + 2)(x - 4)(x + 5)$vraag$,
    $ant$(x - 4)(x + 5) + (x + 2)(x + 5) + (x + 2)(x - 4)$ant$,
    $latex$(x - 4)(x + 5) + (x + 2)(x + 5) + (x + 2)(x - 4)$latex$,
    ARRAY[$alt$3x^2 + 6x - 18$alt$]::text[]
  ),
  (
    $t$h2_productregel$t$, $c$drie_factoren$c$, 8, 3,
    $vraag$f(x) = x^{2}(x - 1)(x + 3)$vraag$,
    $ant$2x(x - 1)(x + 3) + x^2(x + 3) + x^2(x - 1)$ant$,
    $latex$2x(x - 1)(x + 3) + x^{2}(x + 3) + x^{2}(x - 1)$latex$,
    ARRAY[$alt$4x^3 + 6x^2 - 6x$alt$, $alt$2x(x - 1)(x + 3) + x²(x + 3) + x²(x - 1)$alt$]::text[]
  ),
  (
    $t$h2_productregel$t$, $c$kwadraat_van_polynoom$c$, 7, 2,
    $vraag$f(x) = (4x - 3)^{2}$vraag$,
    $ant$2 \cdot 4(4x - 3)$ant$,
    $latex$2 \cdot 4(4x - 3)$latex$,
    ARRAY[$alt$8(4x - 3)$alt$, $alt$32x - 24$alt$]::text[]
  ),
  (
    $t$h2_productregel$t$, $c$kwadraat_van_polynoom$c$, 8, 3,
    $vraag$f(x) = (2x^{2} + x)^{2}$vraag$,
    $ant$2 \cdot (4x + 1)(2x^{2} + x)$ant$,
    $latex$2 \cdot (4x + 1)(2x^{2} + x)$latex$,
    ARRAY[$alt$16x^3 + 12x^2 + 2x$alt$]::text[]
  ),
  (
    $t$h2_productregel$t$, $c$twee_polynomen$c$, 7, 2,
    $vraag$f(x) = (x + 4)(x^{2} - 2)$vraag$,
    $ant$(x^2 - 2) + 2x(x + 4)$ant$,
    $latex$(x^{2} - 2) + 2x(x + 4)$latex$,
    ARRAY[$alt$3x^2 + 8x - 2$alt$, $alt$(x² - 2) + 2x(x + 4)$alt$]::text[]
  ),
  (
    $t$h2_productregel$t$, $c$twee_polynomen$c$, 8, 3,
    $vraag$f(x) = (2x^{2} + 1)(x^{3} - 5x)$vraag$,
    $ant$4x(x^3 - 5x) + (2x^2 + 1)(3x^2 - 5)$ant$,
    $latex$4x(x^{3} - 5x) + (2x^{2} + 1)(3x^{2} - 5)$latex$,
    ARRAY[$alt$10x^4 - 27x^2 - 5$alt$, $alt$4x(x³ - 5x) + (2x² + 1)(3x² - 5)$alt$]::text[]
  ),
  (
    $t$h2_quotientregel$t$, $c$eenvoudige_breuk$c$, 7, 2,
    $vraag$f(x) = \dfrac{3x - 2}{x + 4}$vraag$,
    $ant$14/(x + 4)^2$ant$,
    $latex$\dfrac{14}{(x + 4)^{2}}$latex$,
    ARRAY[$alt$14/(x+4)²$alt$, $alt$((x+4)*3-(3x-2))/(x+4)^2$alt$, $alt$14/(x^2+8x+16)$alt$, $alt$14/(x + 4)²$alt$]::text[]
  ),
  (
    $t$h2_quotientregel$t$, $c$eenvoudige_breuk$c$, 8, 3,
    $vraag$f(x) = \dfrac{1 - 2x}{4x + 3}$vraag$,
    $ant$-10/(4x + 3)^2$ant$,
    $latex$\dfrac{-10}{(4x + 3)^{2}}$latex$,
    ARRAY[$alt$-10/(4x+3)²$alt$, $alt$((4x+3)*(-2)-(1-2x)*4)/(4x+3)^2$alt$, $alt$-10/(16x^2+24x+9)$alt$, $alt$-10/(4x + 3)²$alt$]::text[]
  ),
  (
    $t$h2_quotientregel$t$, $c$polynoom_breuk$c$, 7, 2,
    $vraag$f(x) = \dfrac{x^{2}}{x - 3}$vraag$,
    $ant$(2x(x - 3) - x^2)/(x - 3)^2$ant$,
    $latex$\dfrac{2x(x - 3) - x^{2}}{(x - 3)^{2}}$latex$,
    ARRAY[$alt$(x^2 - 6x)/(x - 3)^2$alt$, $alt$x(x - 6)/(x - 3)^2$alt$, $alt$(2x(x - 3) - x²)/(x - 3)²$alt$]::text[]
  ),
  (
    $t$h2_quotientregel$t$, $c$polynoom_breuk$c$, 8, 3,
    $vraag$f(x) = \dfrac{x^{2} + 1}{x^{2} - 2}$vraag$,
    $ant$(2x(x^2 - 2) - (x^2 + 1) \cdot 2x)/(x^2 - 2)^2$ant$,
    $latex$\dfrac{2x(x^{2} - 2) - (x^{2} + 1) \cdot 2x}{(x^{2} - 2)^{2}}$latex$,
    ARRAY[$alt$-6x/(x^2 - 2)^2$alt$, $alt$(2x(x² - 2) - (x² + 1) \cdot 2x)/(x² - 2)²$alt$]::text[]
  ),
  (
    $t$h2_quotientregel$t$, $c$som_met_breuk$c$, 7, 2,
    $vraag$f(x) = 2x^{2} + \dfrac{5}{x + 2}$vraag$,
    $ant$4x - 5/(x + 2)^2$ant$,
    $latex$4x - \dfrac{5}{(x + 2)^{2}}$latex$,
    ARRAY[$alt$4x + (-5)/(x + 2)^2$alt$, $alt$4x - 5/(x + 2)²$alt$]::text[]
  ),
  (
    $t$h2_quotientregel$t$, $c$som_met_breuk$c$, 8, 3,
    $vraag$f(x) = 4x - \dfrac{x^{2}}{x - 2}$vraag$,
    $ant$4 - (2x(x - 2) - x^2)/(x - 2)^2$ant$,
    $latex$4 - \dfrac{2x(x - 2) - x^{2}}{(x - 2)^{2}}$latex$,
    ARRAY[$alt$4 - (x^2 - 4x)/(x - 2)^2$alt$, $alt$4 - (2x(x - 2) - x²)/(x - 2)²$alt$]::text[]
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
    $t$h2_termsgewijs$t$, $c$polynoom_differentieren$c$, 7, 0,
    $stap$Je differentieert termsgewijs. Elke term apart, met de machtsregel: de macht gaat naar voren en wordt één lager.$stap$
  ),
  (
    $t$h2_termsgewijs$t$, $c$polynoom_differentieren$c$, 7, 1,
    $stap$De termen zijn $4x^{5}$, $-3x^{4}$, $6x^{2}$ en $-9$.$stap$
  ),
  (
    $t$h2_termsgewijs$t$, $c$polynoom_differentieren$c$, 7, 2,
    $stap$Term voor term: $[4x^{5}]' = 20x^{4}$, $[-3x^{4}]' = -12x^{3}$, $[6x^{2}]' = 12x$ en $[-9]' = 0$.$stap$
  ),
  (
    $t$h2_termsgewijs$t$, $c$polynoom_differentieren$c$, 7, 3,
    $stap$Tel op: $f'(x) = 20x^{4} - 12x^{3} + 12x$.$stap$
  ),
  (
    $t$h2_termsgewijs$t$, $c$polynoom_differentieren$c$, 8, 0,
    $stap$Je differentieert termsgewijs. Let op het minteken voor $3x^{6}$.$stap$
  ),
  (
    $t$h2_termsgewijs$t$, $c$polynoom_differentieren$c$, 8, 1,
    $stap$De termen zijn $-3x^{6}$, $5x^{3}$, $-8x$ en $11$.$stap$
  ),
  (
    $t$h2_termsgewijs$t$, $c$polynoom_differentieren$c$, 8, 2,
    $stap$Term voor term: $[-3x^{6}]' = -18x^{5}$, $[5x^{3}]' = 15x^{2}$, $[-8x]' = -8$ en $[11]' = 0$.$stap$
  ),
  (
    $t$h2_termsgewijs$t$, $c$polynoom_differentieren$c$, 8, 3,
    $stap$Tel op: $f'(x) = -18x^{5} + 15x^{2} - 8$.$stap$
  ),
  (
    $t$h2_haakjes_eerst$t$, $c$merkwaardige_producten$c$, 7, 0,
    $stap$Werk eerst het kwadraat uit. $(A - B)^{2} = A^{2} - 2AB + B^{2}$, met $A = 4x$ en $B = 1$.$stap$
  ),
  (
    $t$h2_haakjes_eerst$t$, $c$merkwaardige_producten$c$, 7, 1,
    $stap$$(4x - 1)^{2} = 16x^{2} - 8x + 1$.$stap$
  ),
  (
    $t$h2_haakjes_eerst$t$, $c$merkwaardige_producten$c$, 7, 2,
    $stap$Differentieer termsgewijs: $[16x^{2}]' = 32x$, $[-8x]' = -8$ en $[1]' = 0$.$stap$
  ),
  (
    $t$h2_haakjes_eerst$t$, $c$merkwaardige_producten$c$, 7, 3,
    $stap$Dus $f'(x) = 32x - 8$. Hetzelfde krijg je met de kettingregel: $2 \cdot 4(4x - 1)$.$stap$
  ),
  (
    $t$h2_haakjes_eerst$t$, $c$merkwaardige_producten$c$, 8, 0,
    $stap$Werk beide kwadraten eerst uit, en trek daarna af.$stap$
  ),
  (
    $t$h2_haakjes_eerst$t$, $c$merkwaardige_producten$c$, 8, 1,
    $stap$$(2x + 1)^{2} = 4x^{2} + 4x + 1$, dus $3(2x + 1)^{2} = 12x^{2} + 12x + 3$. En $(x + 5)^{2} = x^{2} + 10x + 25$.$stap$
  ),
  (
    $t$h2_haakjes_eerst$t$, $c$merkwaardige_producten$c$, 8, 2,
    $stap$$f(x) = 12x^{2} + 12x + 3 - x^{2} - 10x - 25 = 11x^{2} + 2x - 22$.$stap$
  ),
  (
    $t$h2_haakjes_eerst$t$, $c$merkwaardige_producten$c$, 8, 3,
    $stap$Differentieer termsgewijs: $f'(x) = 22x + 2$.$stap$
  ),
  (
    $t$h2_haakjes_eerst$t$, $c$product_uitwerken$c$, 7, 0,
    $stap$Werk eerst de haakjes uit. Daarna differentieer je termsgewijs.$stap$
  ),
  (
    $t$h2_haakjes_eerst$t$, $c$product_uitwerken$c$, 7, 1,
    $stap$$(2x + 1)(x - 4) = 2x^{2} - 8x + x - 4 = 2x^{2} - 7x - 4$.$stap$
  ),
  (
    $t$h2_haakjes_eerst$t$, $c$product_uitwerken$c$, 7, 2,
    $stap$Differentieer: $[2x^{2}]' = 4x$ en $[-7x]' = -7$.$stap$
  ),
  (
    $t$h2_haakjes_eerst$t$, $c$product_uitwerken$c$, 7, 3,
    $stap$Dus $f'(x) = 4x - 7$.$stap$
  ),
  (
    $t$h2_haakjes_eerst$t$, $c$product_uitwerken$c$, 8, 0,
    $stap$Werk eerst de haakjes uit. Vermenigvuldig $x + 2$ met elke term van $x^{2} - 3x + 1$.$stap$
  ),
  (
    $t$h2_haakjes_eerst$t$, $c$product_uitwerken$c$, 8, 1,
    $stap$$x(x^{2} - 3x + 1) = x^{3} - 3x^{2} + x$ en $2(x^{2} - 3x + 1) = 2x^{2} - 6x + 2$.$stap$
  ),
  (
    $t$h2_haakjes_eerst$t$, $c$product_uitwerken$c$, 8, 2,
    $stap$Samen: $f(x) = x^{3} - x^{2} - 5x + 2$.$stap$
  ),
  (
    $t$h2_haakjes_eerst$t$, $c$product_uitwerken$c$, 8, 3,
    $stap$Differentieer termsgewijs: $f'(x) = 3x^{2} - 2x - 5$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$drie_factoren$c$, 4, 0,
    $stap$Er staan drie factoren in een product. Differentieer steeds één factor en laat de andere twee staan. Tel die drie stukken op.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$drie_factoren$c$, 4, 1,
    $stap$De factoren zijn $x$, $x + 1$ en $x - 3$. Hun afgeleiden zijn alle drie $1$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$drie_factoren$c$, 4, 2,
    $stap$Eerste stuk: $(x + 1)(x - 3)$. Tweede stuk: $x(x - 3)$. Derde stuk: $x(x + 1)$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$drie_factoren$c$, 4, 3,
    $stap$$f'(x) = (x + 1)(x - 3) + x(x - 3) + x(x + 1)$. Uitgewerkt is dat $3x^{2} - 4x - 3$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$drie_factoren$c$, 5, 0,
    $stap$Er staan drie factoren in een product. Differentieer steeds één factor en laat de andere twee staan.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$drie_factoren$c$, 5, 1,
    $stap$De factoren zijn $x - 1$, $x + 1$ en $x + 4$. Hun afgeleiden zijn alle drie $1$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$drie_factoren$c$, 5, 2,
    $stap$De drie stukken zijn $(x + 1)(x + 4)$, $(x - 1)(x + 4)$ en $(x - 1)(x + 1)$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$drie_factoren$c$, 5, 3,
    $stap$$f'(x) = (x + 1)(x + 4) + (x - 1)(x + 4) + (x - 1)(x + 1)$. Uitgewerkt is dat $3x^{2} + 8x - 1$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$drie_factoren$c$, 6, 0,
    $stap$Er staan drie factoren: $2x$, $x + 3$ en $x - 1$. De afgeleide van $2x$ is $2$, niet $1$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$drie_factoren$c$, 6, 1,
    $stap$Afgeleiden: $[2x]' = 2$, $[x + 3]' = 1$ en $[x - 1]' = 1$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$drie_factoren$c$, 6, 2,
    $stap$Eerste stuk: $2(x + 3)(x - 1)$. Tweede: $2x(x - 1)$. Derde: $2x(x + 3)$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$drie_factoren$c$, 6, 3,
    $stap$$f'(x) = 2(x + 3)(x - 1) + 2x(x - 1) + 2x(x + 3)$. Uitgewerkt is dat $6x^{2} + 8x - 6$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$drie_factoren$c$, 7, 0,
    $stap$Er staan drie factoren in een product. Differentieer steeds één factor en laat de andere twee staan.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$drie_factoren$c$, 7, 1,
    $stap$De factoren zijn $x + 2$, $x - 4$ en $x + 5$. Hun afgeleiden zijn alle drie $1$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$drie_factoren$c$, 7, 2,
    $stap$De drie stukken zijn $(x - 4)(x + 5)$, $(x + 2)(x + 5)$ en $(x + 2)(x - 4)$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$drie_factoren$c$, 7, 3,
    $stap$$f'(x) = (x - 4)(x + 5) + (x + 2)(x + 5) + (x + 2)(x - 4)$. Uitgewerkt is dat $3x^{2} + 6x - 18$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$drie_factoren$c$, 8, 0,
    $stap$Er staan drie factoren: $x^{2}$, $x - 1$ en $x + 3$. De eerste is geen lineaire factor.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$drie_factoren$c$, 8, 1,
    $stap$Afgeleiden: $[x^{2}]' = 2x$, $[x - 1]' = 1$ en $[x + 3]' = 1$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$drie_factoren$c$, 8, 2,
    $stap$Eerste stuk: $2x(x - 1)(x + 3)$. Tweede: $x^{2}(x + 3)$. Derde: $x^{2}(x - 1)$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$drie_factoren$c$, 8, 3,
    $stap$$f'(x) = 2x(x - 1)(x + 3) + x^{2}(x + 3) + x^{2}(x - 1)$. Uitgewerkt is dat $4x^{3} + 6x^{2} - 6x$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$kwadraat_van_polynoom$c$, 7, 0,
    $stap$Er staat een kwadraat. Dat is de kettingregel: de buitenkant is kwadrateren, de binnenkant is $4x - 3$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$kwadraat_van_polynoom$c$, 7, 1,
    $stap$Schrijf $f(x) = g(h(x))$ met $h(x) = 4x - 3$ en $g$ de kwadraatfunctie.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$kwadraat_van_polynoom$c$, 7, 2,
    $stap$Afgeleide van de buitenkant, met de binnenkant erin: $2(4x - 3)$. Afgeleide van de binnenkant: $4$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$kwadraat_van_polynoom$c$, 7, 3,
    $stap$Vermenigvuldig: $f'(x) = 2 \cdot 4(4x - 3)$. Uitgewerkt is dat $32x - 24$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$kwadraat_van_polynoom$c$, 8, 0,
    $stap$Er staat een kwadraat van een veelterm. Dat is de kettingregel.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$kwadraat_van_polynoom$c$, 8, 1,
    $stap$De binnenkant is $h(x) = 2x^{2} + x$, dus $h'(x) = 4x + 1$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$kwadraat_van_polynoom$c$, 8, 2,
    $stap$Afgeleide van de buitenkant, met de binnenkant erin: $2(2x^{2} + x)$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$kwadraat_van_polynoom$c$, 8, 3,
    $stap$Vermenigvuldig: $f'(x) = 2 \cdot (4x + 1)(2x^{2} + x)$. Uitgewerkt is dat $16x^{3} + 12x^{2} + 2x$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$twee_polynomen$c$, 7, 0,
    $stap$Er staan twee factoren naast elkaar: $x + 4$ en $x^{2} - 2$. Dat is de productregel.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$twee_polynomen$c$, 7, 1,
    $stap$Noem $g(x) = x + 4$ en $h(x) = x^{2} - 2$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$twee_polynomen$c$, 7, 2,
    $stap$$g'(x) = 1$ en $h'(x) = 2x$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$twee_polynomen$c$, 7, 3,
    $stap$$f'(x) = (x^{2} - 2) + (x + 4) \cdot 2x = (x^{2} - 2) + 2x(x + 4)$. Uitgewerkt is dat $3x^{2} + 8x - 2$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$twee_polynomen$c$, 8, 0,
    $stap$Er staan twee factoren naast elkaar. Dat is de productregel.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$twee_polynomen$c$, 8, 1,
    $stap$Noem $g(x) = 2x^{2} + 1$ en $h(x) = x^{3} - 5x$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$twee_polynomen$c$, 8, 2,
    $stap$$g'(x) = 4x$ en $h'(x) = 3x^{2} - 5$.$stap$
  ),
  (
    $t$h2_productregel$t$, $c$twee_polynomen$c$, 8, 3,
    $stap$$f'(x) = 4x(x^{3} - 5x) + (2x^{2} + 1)(3x^{2} - 5)$. Uitgewerkt is dat $10x^{4} - 27x^{2} - 5$.$stap$
  ),
  (
    $t$h2_quotientregel$t$, $c$eenvoudige_breuk$c$, 7, 0,
    $stap$Er staat een breuk: teller $3x - 2$, noemer $x + 4$. Dat is de quotiëntregel. De noemer mag niet nul zijn, dus $x \neq -4$.$stap$
  ),
  (
    $t$h2_quotientregel$t$, $c$eenvoudige_breuk$c$, 7, 1,
    $stap$Noem $g(x) = 3x - 2$ en $h(x) = x + 4$. Dan is $g'(x) = 3$ en $h'(x) = 1$.$stap$
  ),
  (
    $t$h2_quotientregel$t$, $c$eenvoudige_breuk$c$, 7, 2,
    $stap$Teller van de afgeleide: $g' h - g h' = 3(x + 4) - (3x - 2) = 3x + 12 - 3x + 2 = 14$.$stap$
  ),
  (
    $t$h2_quotientregel$t$, $c$eenvoudige_breuk$c$, 7, 3,
    $stap$De noemer is $(x + 4)^{2}$. Dus $f'(x) = \dfrac{14}{(x + 4)^{2}}$.$stap$
  ),
  (
    $t$h2_quotientregel$t$, $c$eenvoudige_breuk$c$, 8, 0,
    $stap$Er staat een breuk: teller $1 - 2x$, noemer $4x + 3$. Dat is de quotiëntregel. De noemer mag niet nul zijn, dus $x \neq -\dfrac{3}{4}$.$stap$
  ),
  (
    $t$h2_quotientregel$t$, $c$eenvoudige_breuk$c$, 8, 1,
    $stap$Noem $g(x) = 1 - 2x$ en $h(x) = 4x + 3$. Dan is $g'(x) = -2$ en $h'(x) = 4$.$stap$
  ),
  (
    $t$h2_quotientregel$t$, $c$eenvoudige_breuk$c$, 8, 2,
    $stap$Teller van de afgeleide: $-2(4x + 3) - (1 - 2x) \cdot 4 = -8x - 6 - 4 + 8x = -10$.$stap$
  ),
  (
    $t$h2_quotientregel$t$, $c$eenvoudige_breuk$c$, 8, 3,
    $stap$Dus $f'(x) = \dfrac{-10}{(4x + 3)^{2}}$.$stap$
  ),
  (
    $t$h2_quotientregel$t$, $c$polynoom_breuk$c$, 7, 0,
    $stap$Er staat een breuk: teller $x^{2}$, noemer $x - 3$. Dat is de quotiëntregel. De noemer mag niet nul zijn, dus $x \neq 3$.$stap$
  ),
  (
    $t$h2_quotientregel$t$, $c$polynoom_breuk$c$, 7, 1,
    $stap$Noem $g(x) = x^{2}$ en $h(x) = x - 3$. Dan is $g'(x) = 2x$ en $h'(x) = 1$.$stap$
  ),
  (
    $t$h2_quotientregel$t$, $c$polynoom_breuk$c$, 7, 2,
    $stap$Teller van de afgeleide: $2x(x - 3) - x^{2} \cdot 1$. De noemer is $(x - 3)^{2}$.$stap$
  ),
  (
    $t$h2_quotientregel$t$, $c$polynoom_breuk$c$, 7, 3,
    $stap$$f'(x) = \dfrac{2x(x - 3) - x^{2}}{(x - 3)^{2}}$. De teller kun je nog schrijven als $x^{2} - 6x$.$stap$
  ),
  (
    $t$h2_quotientregel$t$, $c$polynoom_breuk$c$, 8, 0,
    $stap$Er staat een breuk met $x^{2}$ in de teller en in de noemer. Dat is de quotiëntregel. De noemer mag niet nul zijn, dus $x^{2} \neq 2$.$stap$
  ),
  (
    $t$h2_quotientregel$t$, $c$polynoom_breuk$c$, 8, 1,
    $stap$Noem $g(x) = x^{2} + 1$ en $h(x) = x^{2} - 2$. Dan is $g'(x) = 2x$ en $h'(x) = 2x$.$stap$
  ),
  (
    $t$h2_quotientregel$t$, $c$polynoom_breuk$c$, 8, 2,
    $stap$Teller van de afgeleide: $2x(x^{2} - 2) - (x^{2} + 1) \cdot 2x$. De noemer is $(x^{2} - 2)^{2}$.$stap$
  ),
  (
    $t$h2_quotientregel$t$, $c$polynoom_breuk$c$, 8, 3,
    $stap$$f'(x) = \dfrac{2x(x^{2} - 2) - (x^{2} + 1) \cdot 2x}{(x^{2} - 2)^{2}}$. Die teller is $-6x$.$stap$
  ),
  (
    $t$h2_quotientregel$t$, $c$som_met_breuk$c$, 7, 0,
    $stap$Er staat een som: een veelterm en een breuk. Differentieer ze apart. De breuk is een negatieve macht van $x + 2$.$stap$
  ),
  (
    $t$h2_quotientregel$t$, $c$som_met_breuk$c$, 7, 1,
    $stap$$[2x^{2}]' = 4x$. Schrijf $\dfrac{5}{x + 2} = 5(x + 2)^{-1}$.$stap$
  ),
  (
    $t$h2_quotientregel$t$, $c$som_met_breuk$c$, 7, 2,
    $stap$Kettingregel: $-5(x + 2)^{-2} \cdot 1 = -\dfrac{5}{(x + 2)^{2}}$.$stap$
  ),
  (
    $t$h2_quotientregel$t$, $c$som_met_breuk$c$, 7, 3,
    $stap$Dus $f'(x) = 4x - \dfrac{5}{(x + 2)^{2}}$.$stap$
  ),
  (
    $t$h2_quotientregel$t$, $c$som_met_breuk$c$, 8, 0,
    $stap$Er staat een verschil: $4x$ min een breuk. Differentieer ze apart. Voor de breuk gebruik je de quotiëntregel. De noemer mag niet nul zijn, dus $x \neq 2$.$stap$
  ),
  (
    $t$h2_quotientregel$t$, $c$som_met_breuk$c$, 8, 1,
    $stap$$[4x]' = 4$. Noem bij de breuk $g(x) = x^{2}$ en $h(x) = x - 2$, dus $g'(x) = 2x$ en $h'(x) = 1$.$stap$
  ),
  (
    $t$h2_quotientregel$t$, $c$som_met_breuk$c$, 8, 2,
    $stap$Afgeleide van de breuk: $\dfrac{2x(x - 2) - x^{2}}{(x - 2)^{2}}$. Die haal je af, want er staat een min voor de breuk.$stap$
  ),
  (
    $t$h2_quotientregel$t$, $c$som_met_breuk$c$, 8, 3,
    $stap$$f'(x) = 4 - \dfrac{2x(x - 2) - x^{2}}{(x - 2)^{2}}$.$stap$
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
  FOREACH soort IN ARRAY ARRAY['drie_factoren', 'eenvoudige_breuk', 'kwadraat_van_polynoom', 'merkwaardige_producten', 'polynoom_breuk', 'polynoom_differentieren', 'product_uitwerken', 'som_met_breuk', 'twee_polynomen']::text[]
  LOOP
    SELECT count(*) INTO n
    FROM public.questions_new q
    JOIN public.topic_clusters_new c ON c.id = q.cluster_id
    JOIN public.topics_new t ON t.id = c.topic_id
    JOIN public.chapters h ON h.id = t.chapter_id
    WHERE h.slug = 'h2'
      AND c.slug = soort;

    SELECT count(*) INTO n_zonder
    FROM public.questions_new q
    JOIN public.topic_clusters_new c ON c.id = q.cluster_id
    JOIN public.topics_new t ON t.id = c.topic_id
    JOIN public.chapters h ON h.id = t.chapter_id
    WHERE h.slug = 'h2'
      AND c.slug = soort
      AND q.order_index >= 7
      AND (
        SELECT count(*)
        FROM public.question_steps_new s
        WHERE s.question_id = q.id
          AND s.step_order IN (0, 1, 2, 3)
      ) < 4;

    IF n < 8 OR n_zonder <> 0 THEN
      RAISE EXCEPTION 'soort % in h2 klopt niet: aantal %, zonder stappen 0-3 %', soort, n, n_zonder;
    END IF;
  END LOOP;

  IF 'h2' = 'h2' THEN
    SELECT count(*) INTO n
    FROM public.questions_new q
    JOIN public.topic_clusters_new c ON c.id = q.cluster_id
    WHERE c.slug = 'drie_factoren';

    SELECT count(*) INTO n_zonder
    FROM public.questions_new q
    JOIN public.topic_clusters_new c ON c.id = q.cluster_id
    WHERE c.slug = 'drie_factoren'
      AND q.order_index >= 4
      AND (
        SELECT count(*)
        FROM public.question_steps_new s
        WHERE s.question_id = q.id
          AND s.step_order IN (0, 1, 2, 3)
      ) < 4;

    IF n < 8 OR n_zonder <> 0 THEN
      RAISE EXCEPTION 'drie_factoren klopt niet: aantal %, zonder stappen %', n, n_zonder;
    END IF;
  END IF;
END $$;

COMMIT;
