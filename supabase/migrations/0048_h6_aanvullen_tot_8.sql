-- Hoofdstuk 6 aanvullen tot minstens 8 vragen per soort.
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
    $t$h6_kettingregel$t$, $c$macht_lineair$c$, 7, 2,
    $vraag$f(x) = (5x - 2)^{3}$vraag$,
    $ant$15(5x - 2)^2$ant$,
    $latex$15(5x - 2)^{2}$latex$,
    ARRAY[$alt$15(5x - 2)²$alt$]::text[]
  ),
  (
    $t$h6_kettingregel$t$, $c$macht_lineair$c$, 8, 3,
    $vraag$f(x) = 2(3x + 1)^{4}$vraag$,
    $ant$24(3x + 1)^3$ant$,
    $latex$24(3x + 1)^{3}$latex$,
    ARRAY[$alt$24(3x + 1)³$alt$]::text[]
  ),
  (
    $t$h6_kettingregel$t$, $c$macht_polynoom$c$, 7, 2,
    $vraag$f(x) = (x^{2} + 3)^{2}$vraag$,
    $ant$4x(x^2 + 3)$ant$,
    $latex$4x(x^{2} + 3)$latex$,
    ARRAY[$alt$4x^3 + 12x$alt$, $alt$4x(x² + 3)$alt$]::text[]
  ),
  (
    $t$h6_kettingregel$t$, $c$macht_polynoom$c$, 8, 3,
    $vraag$f(x) = (x^{3} - 2x)^{2}$vraag$,
    $ant$2(3x^2 - 2)(x^3 - 2x)$ant$,
    $latex$2(3x^{2} - 2)(x^{3} - 2x)$latex$,
    ARRAY[$alt$6x^5 - 16x^3 + 8x$alt$, $alt$2(3x² - 2)(x³ - 2x)$alt$]::text[]
  ),
  (
    $t$h6_machten$t$, $c$negatieve_macht$c$, 7, 2,
    $vraag$f(x) = \dfrac{4}{x^{2}}$vraag$,
    $ant$-8/x^3$ant$,
    $latex$-\dfrac{8}{x^{3}}$latex$,
    ARRAY[$alt$-8x^-3$alt$, $alt$-8x^(-3)$alt$, $alt$-8/x³$alt$]::text[]
  ),
  (
    $t$h6_machten$t$, $c$negatieve_macht$c$, 8, 3,
    $vraag$f(x) = 3x^{3} + \dfrac{2}{x^{3}}$vraag$,
    $ant$9x^2 - 6/x^4$ant$,
    $latex$9x^{2} - \dfrac{6}{x^{4}}$latex$,
    ARRAY[$alt$9x^2 - 6x^-4$alt$, $alt$9x² - 6/x⁴$alt$]::text[]
  ),
  (
    $t$h6_machten$t$, $c$uitdelen$c$, 7, 2,
    $vraag$f(x) = \dfrac{x^{2} + 3}{x}$vraag$,
    $ant$1 - 3/x^2$ant$,
    $latex$1 - \dfrac{3}{x^{2}}$latex$,
    ARRAY[$alt$1 - 3x^-2$alt$, $alt$1 - 3/x²$alt$]::text[]
  ),
  (
    $t$h6_machten$t$, $c$uitdelen$c$, 8, 3,
    $vraag$f(x) = \dfrac{2x^{4} - 6x}{x^{2}}$vraag$,
    $ant$4x + 6/x^2$ant$,
    $latex$4x + \dfrac{6}{x^{2}}$latex$,
    ARRAY[$alt$4x + 6x^-2$alt$, $alt$4x + 6/x²$alt$]::text[]
  ),
  (
    $t$h6_machten$t$, $c$wortelvorm$c$, 7, 2,
    $vraag$f(x) = 4\sqrt{x}$vraag$,
    $ant$2/sqrt(x)$ant$,
    $latex$\dfrac{2}{\sqrt{x}}$latex$,
    ARRAY[$alt$2x^(-1/2)$alt$, $alt$2x^-0,5$alt$, $alt$2/√(x)$alt$]::text[]
  ),
  (
    $t$h6_machten$t$, $c$wortelvorm$c$, 8, 3,
    $vraag$f(x) = x\sqrt{x} + \dfrac{1}{\sqrt{x}}$vraag$,
    $ant$1,5*sqrt(x) - 1/(2*x*sqrt(x))$ant$,
    $latex$1{,}5\sqrt{x} - \dfrac{1}{2x\sqrt{x}}$latex$,
    ARRAY[$alt$3/2*sqrt(x) - 1/(2*x^(3/2))$alt$, $alt$1.5*sqrt(x) - 1/(2*x*sqrt(x))$alt$]::text[]
  ),
  (
    $t$h6_machten$t$, $c$gemengd_macht_wortel$c$, 7, 2,
    $vraag$f(x) = 4x^{2}\sqrt{x}$vraag$,
    $ant$10*x*sqrt(x)$ant$,
    $latex$10x\sqrt{x}$latex$,
    ARRAY[$alt$10x^(3/2)$alt$, $alt$10x^1,5$alt$]::text[]
  ),
  (
    $t$h6_machten$t$, $c$gemengd_macht_wortel$c$, 8, 3,
    $vraag$f(x) = x\sqrt{x} - \dfrac{2}{\sqrt{x}}$vraag$,
    $ant$1,5*sqrt(x) + 1/(x*sqrt(x))$ant$,
    $latex$1{,}5\sqrt{x} + \dfrac{1}{x\sqrt{x}}$latex$,
    ARRAY[$alt$3/2*sqrt(x) + x^(-3/2)$alt$, $alt$1.5*sqrt(x) + 1/(x*sqrt(x))$alt$]::text[]
  ),
  (
    $t$h6_kettingregel$t$, $c$wortel_lineair$c$, 7, 2,
    $vraag$f(x) = \sqrt{5x + 2}$vraag$,
    $ant$5/(2*sqrt(5x + 2))$ant$,
    $latex$\dfrac{5}{2\sqrt{5x + 2}}$latex$,
    ARRAY[$alt$5/2*(5x+2)^(-1/2)$alt$]::text[]
  ),
  (
    $t$h6_kettingregel$t$, $c$wortel_lineair$c$, 8, 3,
    $vraag$f(x) = 4\sqrt{2x - 3}$vraag$,
    $ant$4/sqrt(2x - 3)$ant$,
    $latex$\dfrac{4}{\sqrt{2x - 3}}$latex$,
    ARRAY[$alt$4*(2x-3)^(-1/2)$alt$]::text[]
  ),
  (
    $t$h6_kettingregel$t$, $c$wortel_polynoom$c$, 7, 2,
    $vraag$f(x) = \sqrt{x^{2} + 4}$vraag$,
    $ant$x/sqrt(x^2 + 4)$ant$,
    $latex$\dfrac{x}{\sqrt{x^{2} + 4}}$latex$,
    ARRAY[$alt$(2x)/(2*sqrt(x^2+4))$alt$, $alt$x/sqrt(x² + 4)$alt$]::text[]
  ),
  (
    $t$h6_kettingregel$t$, $c$wortel_polynoom$c$, 8, 3,
    $vraag$f(x) = \sqrt{x^{2} - 6x}$vraag$,
    $ant$(x - 3)/sqrt(x^2 - 6x)$ant$,
    $latex$\dfrac{x - 3}{\sqrt{x^{2} - 6x}}$latex$,
    ARRAY[$alt$(2x - 6)/(2*sqrt(x^2 - 6x))$alt$, $alt$(x - 3)/sqrt(x² - 6x)$alt$]::text[]
  ),
  (
    $t$h6_kettingregel$t$, $c$negatieve_macht_expressie$c$, 7, 2,
    $vraag$f(x) = \dfrac{1}{(4x - 1)^{2}}$vraag$,
    $ant$-8/(4x - 1)^3$ant$,
    $latex$-\dfrac{8}{(4x - 1)^{3}}$latex$,
    ARRAY[$alt$-8(4x-1)^-3$alt$, $alt$-8/(4x - 1)³$alt$]::text[]
  ),
  (
    $t$h6_kettingregel$t$, $c$negatieve_macht_expressie$c$, 8, 3,
    $vraag$f(x) = \dfrac{4}{(x^{2} + 1)^{2}}$vraag$,
    $ant$-16x/(x^2 + 1)^3$ant$,
    $latex$-\dfrac{16x}{(x^{2} + 1)^{3}}$latex$,
    ARRAY[$alt$-16x(x^2+1)^-3$alt$, $alt$-16x/(x² + 1)³$alt$]::text[]
  ),
  (
    $t$h6_combinaties$t$, $c$ketting_plus_product$c$, 7, 2,
    $vraag$f(x) = x\sqrt{5x + 2}$vraag$,
    $ant$(15x + 4)/(2*sqrt(5x + 2))$ant$,
    $latex$\dfrac{15x + 4}{2\sqrt{5x + 2}}$latex$,
    ARRAY[$alt$sqrt(5x+2) + 5x/(2*sqrt(5x+2))$alt$]::text[]
  ),
  (
    $t$h6_combinaties$t$, $c$ketting_plus_product$c$, 8, 3,
    $vraag$f(x) = (x - 1)(3x + 2)^{2}$vraag$,
    $ant$(3x + 2)^2 + 6(x - 1)(3x + 2)$ant$,
    $latex$(3x + 2)^{2} + 6(x - 1)(3x + 2)$latex$,
    ARRAY[$alt$27x^2 + 6x - 8$alt$, $alt$(3x + 2)(9x - 4)$alt$, $alt$(3x + 2)² + 6(x - 1)(3x + 2)$alt$]::text[]
  ),
  (
    $t$h6_combinaties$t$, $c$ketting_plus_quotient$c$, 7, 2,
    $vraag$f(x) = \dfrac{x + 1}{\sqrt{2x + 3}}$vraag$,
    $ant$(x + 2)/((2x + 3)*sqrt(2x + 3))$ant$,
    $latex$\dfrac{x + 2}{(2x + 3)\sqrt{2x + 3}}$latex$,
    ARRAY[$alt$(sqrt(2x+3) - (x+1)/sqrt(2x+3))/(2x+3)$alt$]::text[]
  ),
  (
    $t$h6_combinaties$t$, $c$ketting_plus_quotient$c$, 8, 3,
    $vraag$f(x) = \dfrac{\sqrt{x^{2} + 3}}{x + 1}$vraag$,
    $ant$(x - 3)/((x + 1)^2*sqrt(x^2 + 3))$ant$,
    $latex$\dfrac{x - 3}{(x + 1)^{2}\sqrt{x^{2} + 3}}$latex$,
    ARRAY[$alt$(x(x+1)/sqrt(x^2+3) - sqrt(x^2+3))/(x+1)^2$alt$, $alt$(x - 3)/((x + 1)²*sqrt(x² + 3))$alt$]::text[]
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
    $t$h6_kettingregel$t$, $c$macht_lineair$c$, 7, 0,
    $stap$De buitenste schil is een derde macht. Daarin staat $5x - 2$. Dat is de kettingregel.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$macht_lineair$c$, 7, 1,
    $stap$Schrijf $f(x) = g(h(x))$ met $h(x) = 5x - 2$ en $g$ de derdemachtsfunctie.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$macht_lineair$c$, 7, 2,
    $stap$Afgeleide van de buitenkant, met de binnenkant erin: $3(5x - 2)^{2}$. Afgeleide van de binnenkant: $5$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$macht_lineair$c$, 7, 3,
    $stap$Vermenigvuldig: $f'(x) = 15(5x - 2)^{2}$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$macht_lineair$c$, 8, 0,
    $stap$Er staat een constante $2$ maal een vierde macht. De macht is de kettingregel, de $2$ blijft staan als factor.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$macht_lineair$c$, 8, 1,
    $stap$De binnenkant is $h(x) = 3x + 1$, dus $h'(x) = 3$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$macht_lineair$c$, 8, 2,
    $stap$Afgeleide van de buitenkant: $4(3x + 1)^{3}$. Die vermenigvuldig je met $2$ en met $3$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$macht_lineair$c$, 8, 3,
    $stap$$f'(x) = 2 \cdot 4 \cdot 3(3x + 1)^{3} = 24(3x + 1)^{3}$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$macht_polynoom$c$, 7, 0,
    $stap$De buitenste schil is een kwadraat. Daarin staat $x^{2} + 3$. Dat is de kettingregel.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$macht_polynoom$c$, 7, 1,
    $stap$De binnenkant is $h(x) = x^{2} + 3$, dus $h'(x) = 2x$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$macht_polynoom$c$, 7, 2,
    $stap$Afgeleide van de buitenkant, met de binnenkant erin: $2(x^{2} + 3)$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$macht_polynoom$c$, 7, 3,
    $stap$Vermenigvuldig: $f'(x) = 2 \cdot 2x(x^{2} + 3) = 4x(x^{2} + 3)$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$macht_polynoom$c$, 8, 0,
    $stap$De buitenste schil is een kwadraat. Daarin staat $x^{3} - 2x$. Dat is de kettingregel.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$macht_polynoom$c$, 8, 1,
    $stap$De binnenkant is $h(x) = x^{3} - 2x$, dus $h'(x) = 3x^{2} - 2$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$macht_polynoom$c$, 8, 2,
    $stap$Afgeleide van de buitenkant, met de binnenkant erin: $2(x^{3} - 2x)$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$macht_polynoom$c$, 8, 3,
    $stap$$f'(x) = 2(3x^{2} - 2)(x^{3} - 2x)$. Uitgewerkt is dat $6x^{5} - 16x^{3} + 8x$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$negatieve_macht$c$, 7, 0,
    $stap$Schrijf de breuk als een macht: $\dfrac{4}{x^{2}} = 4x^{-2}$. Dan geldt de machtsregel.$stap$
  ),
  (
    $t$h6_machten$t$, $c$negatieve_macht$c$, 7, 1,
    $stap$De macht $-2$ gaat naar voren en wordt één lager: $-2 - 1 = -3$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$negatieve_macht$c$, 7, 2,
    $stap$$[4x^{-2}]' = 4 \cdot (-2) x^{-3} = -8x^{-3}$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$negatieve_macht$c$, 7, 3,
    $stap$Dus $f'(x) = -\dfrac{8}{x^{3}}$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$negatieve_macht$c$, 8, 0,
    $stap$Schrijf de breuk als een macht: $\dfrac{2}{x^{3}} = 2x^{-3}$. Differentieer daarna termsgewijs.$stap$
  ),
  (
    $t$h6_machten$t$, $c$negatieve_macht$c$, 8, 1,
    $stap$$[3x^{3}]' = 9x^{2}$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$negatieve_macht$c$, 8, 2,
    $stap$$[2x^{-3}]' = 2 \cdot (-3) x^{-4} = -6x^{-4}$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$negatieve_macht$c$, 8, 3,
    $stap$Dus $f'(x) = 9x^{2} - \dfrac{6}{x^{4}}$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$uitdelen$c$, 7, 0,
    $stap$Deel eerst de teller door de noemer, term voor term. Daarna differentieer je termsgewijs.$stap$
  ),
  (
    $t$h6_machten$t$, $c$uitdelen$c$, 7, 1,
    $stap$$\dfrac{x^{2} + 3}{x} = x + \dfrac{3}{x}$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$uitdelen$c$, 7, 2,
    $stap$$[x]' = 1$ en $\left[\dfrac{3}{x}\right]' = - \dfrac{3}{x^{2}}$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$uitdelen$c$, 7, 3,
    $stap$Dus $f'(x) = 1 - \dfrac{3}{x^{2}}$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$uitdelen$c$, 8, 0,
    $stap$Deel eerst elke term van de teller door $x^{2}$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$uitdelen$c$, 8, 1,
    $stap$$\dfrac{2x^{4}}{x^{2}} = 2x^{2}$ en $\dfrac{-6x}{x^{2}} = -6x^{-1}$. Dus $f(x) = 2x^{2} - \dfrac{6}{x}$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$uitdelen$c$, 8, 2,
    $stap$$[2x^{2}]' = 4x$ en $\left[-\dfrac{6}{x}\right]' = 6x^{-2} = \dfrac{6}{x^{2}}$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$uitdelen$c$, 8, 3,
    $stap$Dus $f'(x) = 4x + \dfrac{6}{x^{2}}$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$wortelvorm$c$, 7, 0,
    $stap$Schrijf de wortel als een macht: $\sqrt{x} = x^{1/2}$, dus $f(x) = 4x^{1/2}$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$wortelvorm$c$, 7, 1,
    $stap$De machtsregel: de macht $\dfrac{1}{2}$ gaat naar voren en wordt $\dfrac{1}{2} - 1 = -\dfrac{1}{2}$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$wortelvorm$c$, 7, 2,
    $stap$$[4x^{1/2}]' = 4 \cdot \dfrac{1}{2} x^{-1/2} = 2x^{-1/2}$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$wortelvorm$c$, 7, 3,
    $stap$Dus $f'(x) = \dfrac{2}{\sqrt{x}}$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$wortelvorm$c$, 8, 0,
    $stap$Schrijf beide wortels als machten: $x\sqrt{x} = x^{3/2}$ en $\dfrac{1}{\sqrt{x}} = x^{-1/2}$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$wortelvorm$c$, 8, 1,
    $stap$Differentieer termsgewijs met de machtsregel.$stap$
  ),
  (
    $t$h6_machten$t$, $c$wortelvorm$c$, 8, 2,
    $stap$$[x^{3/2}]' = \dfrac{3}{2}x^{1/2} = 1{,}5\sqrt{x}$ en $[x^{-1/2}]' = -\dfrac{1}{2}x^{-3/2} = -\dfrac{1}{2x\sqrt{x}}$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$wortelvorm$c$, 8, 3,
    $stap$Dus $f'(x) = 1{,}5\sqrt{x} - \dfrac{1}{2x\sqrt{x}}$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$gemengd_macht_wortel$c$, 7, 0,
    $stap$Schrijf alles als één macht: $x^{2}\sqrt{x} = x^{2} \cdot x^{1/2} = x^{5/2}$. Dus $f(x) = 4x^{5/2}$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$gemengd_macht_wortel$c$, 7, 1,
    $stap$De machtsregel: de macht $\dfrac{5}{2}$ gaat naar voren.$stap$
  ),
  (
    $t$h6_machten$t$, $c$gemengd_macht_wortel$c$, 7, 2,
    $stap$$[4x^{5/2}]' = 4 \cdot \dfrac{5}{2} x^{3/2} = 10x^{3/2}$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$gemengd_macht_wortel$c$, 7, 3,
    $stap$$x^{3/2} = x\sqrt{x}$, dus $f'(x) = 10x\sqrt{x}$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$gemengd_macht_wortel$c$, 8, 0,
    $stap$Schrijf als machten: $x\sqrt{x} = x^{3/2}$ en $\dfrac{2}{\sqrt{x}} = 2x^{-1/2}$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$gemengd_macht_wortel$c$, 8, 1,
    $stap$$f(x) = x^{3/2} - 2x^{-1/2}$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$gemengd_macht_wortel$c$, 8, 2,
    $stap$$[x^{3/2}]' = \dfrac{3}{2}\sqrt{x}$ en $[-2x^{-1/2}]' = -2 \cdot \left(-\dfrac{1}{2}\right) x^{-3/2} = x^{-3/2}$.$stap$
  ),
  (
    $t$h6_machten$t$, $c$gemengd_macht_wortel$c$, 8, 3,
    $stap$$x^{-3/2} = \dfrac{1}{x\sqrt{x}}$, dus $f'(x) = 1{,}5\sqrt{x} + \dfrac{1}{x\sqrt{x}}$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$wortel_lineair$c$, 7, 0,
    $stap$De buitenste schil is een wortel. Daarin staat $5x + 2$. Dat is de kettingregel. De wortel bestaat als $5x + 2 \ge 0$, de afgeleide als $5x + 2 > 0$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$wortel_lineair$c$, 7, 1,
    $stap$Schrijf $f(x) = (5x + 2)^{1/2}$. De binnenkant is $h(x) = 5x + 2$, dus $h'(x) = 5$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$wortel_lineair$c$, 7, 2,
    $stap$Afgeleide van de buitenkant: $\dfrac{1}{2}(5x + 2)^{-1/2} = \dfrac{1}{2\sqrt{5x + 2}}$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$wortel_lineair$c$, 7, 3,
    $stap$Vermenigvuldig met $5$: $f'(x) = \dfrac{5}{2\sqrt{5x + 2}}$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$wortel_lineair$c$, 8, 0,
    $stap$Er staat $4$ maal een wortel. De wortel is de kettingregel. De wortel bestaat als $2x - 3 \ge 0$, de afgeleide als $2x - 3 > 0$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$wortel_lineair$c$, 8, 1,
    $stap$De binnenkant is $h(x) = 2x - 3$, dus $h'(x) = 2$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$wortel_lineair$c$, 8, 2,
    $stap$Afgeleide van $\sqrt{2x - 3}$ is $\dfrac{1}{2\sqrt{2x - 3}} \cdot 2 = \dfrac{1}{\sqrt{2x - 3}}$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$wortel_lineair$c$, 8, 3,
    $stap$De factor $4$ blijft staan: $f'(x) = \dfrac{4}{\sqrt{2x - 3}}$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$wortel_polynoom$c$, 7, 0,
    $stap$De buitenste schil is een wortel. Daarin staat $x^{2} + 4$. Dat is de kettingregel. Binnen de wortel staat altijd minstens $4$, dus de wortel bestaat voor elke $x$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$wortel_polynoom$c$, 7, 1,
    $stap$De binnenkant is $h(x) = x^{2} + 4$, dus $h'(x) = 2x$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$wortel_polynoom$c$, 7, 2,
    $stap$Afgeleide van de buitenkant: $\dfrac{1}{2\sqrt{x^{2} + 4}}$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$wortel_polynoom$c$, 7, 3,
    $stap$Vermenigvuldig: $f'(x) = \dfrac{2x}{2\sqrt{x^{2} + 4}} = \dfrac{x}{\sqrt{x^{2} + 4}}$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$wortel_polynoom$c$, 8, 0,
    $stap$De buitenste schil is een wortel. Daarin staat $x^{2} - 6x$. Dat is de kettingregel. De wortel bestaat als $x^{2} - 6x > 0$ voor de afgeleide.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$wortel_polynoom$c$, 8, 1,
    $stap$De binnenkant is $h(x) = x^{2} - 6x$, dus $h'(x) = 2x - 6$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$wortel_polynoom$c$, 8, 2,
    $stap$Afgeleide van de buitenkant: $\dfrac{1}{2\sqrt{x^{2} - 6x}}$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$wortel_polynoom$c$, 8, 3,
    $stap$Vermenigvuldig: $f'(x) = \dfrac{2x - 6}{2\sqrt{x^{2} - 6x}} = \dfrac{x - 3}{\sqrt{x^{2} - 6x}}$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$negatieve_macht_expressie$c$, 7, 0,
    $stap$Schrijf de breuk als een macht: $\dfrac{1}{(4x - 1)^{2}} = (4x - 1)^{-2}$. Dat is de kettingregel. De noemer mag niet nul zijn, dus $x \neq \dfrac{1}{4}$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$negatieve_macht_expressie$c$, 7, 1,
    $stap$De binnenkant is $h(x) = 4x - 1$, dus $h'(x) = 4$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$negatieve_macht_expressie$c$, 7, 2,
    $stap$Afgeleide van de buitenkant: $-2(4x - 1)^{-3}$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$negatieve_macht_expressie$c$, 7, 3,
    $stap$Vermenigvuldig met $4$: $f'(x) = -\dfrac{8}{(4x - 1)^{3}}$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$negatieve_macht_expressie$c$, 8, 0,
    $stap$Schrijf als een macht: $\dfrac{4}{(x^{2} + 1)^{2}} = 4(x^{2} + 1)^{-2}$. Dat is de kettingregel. $x^{2} + 1$ is nooit nul.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$negatieve_macht_expressie$c$, 8, 1,
    $stap$De binnenkant is $h(x) = x^{2} + 1$, dus $h'(x) = 2x$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$negatieve_macht_expressie$c$, 8, 2,
    $stap$Afgeleide van de buitenkant: $4 \cdot (-2)(x^{2} + 1)^{-3} = -8(x^{2} + 1)^{-3}$.$stap$
  ),
  (
    $t$h6_kettingregel$t$, $c$negatieve_macht_expressie$c$, 8, 3,
    $stap$Vermenigvuldig met $2x$: $f'(x) = -\dfrac{16x}{(x^{2} + 1)^{3}}$.$stap$
  ),
  (
    $t$h6_combinaties$t$, $c$ketting_plus_product$c$, 7, 0,
    $stap$Er staan twee factoren: $x$ en een wortel. Dat is de productregel. In de wortel zit ook de kettingregel. De wortel bestaat als $5x + 2 > 0$.$stap$
  ),
  (
    $t$h6_combinaties$t$, $c$ketting_plus_product$c$, 7, 1,
    $stap$Noem $g(x) = x$ en $h(x) = \sqrt{5x + 2}$. Dan is $g'(x) = 1$ en $h'(x) = \dfrac{5}{2\sqrt{5x + 2}}$.$stap$
  ),
  (
    $t$h6_combinaties$t$, $c$ketting_plus_product$c$, 7, 2,
    $stap$$f'(x) = \sqrt{5x + 2} + x \cdot \dfrac{5}{2\sqrt{5x + 2}}$.$stap$
  ),
  (
    $t$h6_combinaties$t$, $c$ketting_plus_product$c$, 7, 3,
    $stap$Eén breuk: teller $2(5x + 2) + 5x = 15x + 4$, noemer $2\sqrt{5x + 2}$. Dus $f'(x) = \dfrac{15x + 4}{2\sqrt{5x + 2}}$.$stap$
  ),
  (
    $t$h6_combinaties$t$, $c$ketting_plus_product$c$, 8, 0,
    $stap$Er staan twee factoren. De tweede is een kwadraat, dus daar zit de kettingregel in. Dat is de productregel samen met de kettingregel.$stap$
  ),
  (
    $t$h6_combinaties$t$, $c$ketting_plus_product$c$, 8, 1,
    $stap$Noem $g(x) = x - 1$ en $h(x) = (3x + 2)^{2}$. Dan is $g'(x) = 1$.$stap$
  ),
  (
    $t$h6_combinaties$t$, $c$ketting_plus_product$c$, 8, 2,
    $stap$Voor $h$: buitenkant kwadraat, binnenkant $3x + 2$, dus $h'(x) = 2(3x + 2) \cdot 3 = 6(3x + 2)$.$stap$
  ),
  (
    $t$h6_combinaties$t$, $c$ketting_plus_product$c$, 8, 3,
    $stap$$f'(x) = (3x + 2)^{2} + (x - 1) \cdot 6(3x + 2) = (3x + 2)^{2} + 6(x - 1)(3x + 2)$.$stap$
  ),
  (
    $t$h6_combinaties$t$, $c$ketting_plus_quotient$c$, 7, 0,
    $stap$Er staat een breuk met een wortel in de noemer. Dat is de quotiëntregel, en in de wortel zit de kettingregel. De wortel bestaat als $2x + 3 > 0$.$stap$
  ),
  (
    $t$h6_combinaties$t$, $c$ketting_plus_quotient$c$, 7, 1,
    $stap$Noem $g(x) = x + 1$ en $h(x) = \sqrt{2x + 3}$. Dan is $g'(x) = 1$ en $h'(x) = \dfrac{1}{\sqrt{2x + 3}}$.$stap$
  ),
  (
    $t$h6_combinaties$t$, $c$ketting_plus_quotient$c$, 7, 2,
    $stap$Teller van de afgeleide: $\sqrt{2x + 3} - (x + 1) \cdot \dfrac{1}{\sqrt{2x + 3}}$. Noemer: $2x + 3$.$stap$
  ),
  (
    $t$h6_combinaties$t$, $c$ketting_plus_quotient$c$, 7, 3,
    $stap$De teller op één noemer is $\dfrac{(2x + 3) - (x + 1)}{\sqrt{2x + 3}} = \dfrac{x + 2}{\sqrt{2x + 3}}$. Deel door $2x + 3$: $f'(x) = \dfrac{x + 2}{(2x + 3)\sqrt{2x + 3}}$.$stap$
  ),
  (
    $t$h6_combinaties$t$, $c$ketting_plus_quotient$c$, 8, 0,
    $stap$Er staat een breuk met een wortel in de teller. Dat is de quotiëntregel, en in de wortel zit de kettingregel. De noemer mag niet nul zijn, dus $x \neq -1$.$stap$
  ),
  (
    $t$h6_combinaties$t$, $c$ketting_plus_quotient$c$, 8, 1,
    $stap$Noem $g(x) = \sqrt{x^{2} + 3}$ en $h(x) = x + 1$. Dan is $h'(x) = 1$ en $g'(x) = \dfrac{x}{\sqrt{x^{2} + 3}}$.$stap$
  ),
  (
    $t$h6_combinaties$t$, $c$ketting_plus_quotient$c$, 8, 2,
    $stap$Teller van de afgeleide: $\dfrac{x}{\sqrt{x^{2} + 3}} \cdot (x + 1) - \sqrt{x^{2} + 3}$. Noemer: $(x + 1)^{2}$.$stap$
  ),
  (
    $t$h6_combinaties$t$, $c$ketting_plus_quotient$c$, 8, 3,
    $stap$De teller wordt $\dfrac{x(x + 1) - (x^{2} + 3)}{\sqrt{x^{2} + 3}} = \dfrac{x - 3}{\sqrt{x^{2} + 3}}$. Dus $f'(x) = \dfrac{x - 3}{(x + 1)^{2}\sqrt{x^{2} + 3}}$.$stap$
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
  FOREACH soort IN ARRAY ARRAY['gemengd_macht_wortel', 'ketting_plus_product', 'ketting_plus_quotient', 'macht_lineair', 'macht_polynoom', 'negatieve_macht', 'negatieve_macht_expressie', 'uitdelen', 'wortel_lineair', 'wortel_polynoom', 'wortelvorm']::text[]
  LOOP
    SELECT count(*) INTO n
    FROM public.questions_new q
    JOIN public.topic_clusters_new c ON c.id = q.cluster_id
    JOIN public.topics_new t ON t.id = c.topic_id
    JOIN public.chapters h ON h.id = t.chapter_id
    WHERE h.slug = 'h6'
      AND c.slug = soort;

    SELECT count(*) INTO n_zonder
    FROM public.questions_new q
    JOIN public.topic_clusters_new c ON c.id = q.cluster_id
    JOIN public.topics_new t ON t.id = c.topic_id
    JOIN public.chapters h ON h.id = t.chapter_id
    WHERE h.slug = 'h6'
      AND c.slug = soort
      AND q.order_index >= 7
      AND (
        SELECT count(*)
        FROM public.question_steps_new s
        WHERE s.question_id = q.id
          AND s.step_order IN (0, 1, 2, 3)
      ) < 4;

    IF n < 8 OR n_zonder <> 0 THEN
      RAISE EXCEPTION 'soort % in h6 klopt niet: aantal %, zonder stappen 0-3 %', soort, n, n_zonder;
    END IF;
  END LOOP;

  IF 'h6' = 'h2' THEN
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
