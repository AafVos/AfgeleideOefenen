-- Hoofdstuk 9 aanvullen tot minstens 8 vragen per soort.
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
    $t$h9_e_machten$t$, $c$basis_ex$c$, 7, 2,
    $vraag$f(x) = 5e^{x} - 2x$vraag$,
    $ant$5e^x - 2$ant$,
    $latex$5e^{x} - 2$latex$,
    ARRAY[$alt$5*e^x - 2$alt$, $alt$-2 + 5e^x$alt$]::text[]
  ),
  (
    $t$h9_e_machten$t$, $c$basis_ex$c$, 8, 3,
    $vraag$f(x) = e^{x} + x^{2} - \dfrac{3}{x}$vraag$,
    $ant$e^x + 2x + 3/x^2$ant$,
    $latex$e^{x} + 2x + \dfrac{3}{x^{2}}$latex$,
    ARRAY[$alt$e^x + 2x + 3x^-2$alt$, $alt$e^x+2x+3/x^2$alt$]::text[]
  ),
  (
    $t$h9_e_machten$t$, $c$e_plus_product$c$, 7, 2,
    $vraag$f(x) = (x - 2)e^{x}$vraag$,
    $ant$(x - 1)e^x$ant$,
    $latex$(x - 1)e^{x}$latex$,
    ARRAY[$alt$(x-2)e^x + e^x$alt$, $alt$e^x(x-1)$alt$, $alt$(x-1)*e^x$alt$]::text[]
  ),
  (
    $t$h9_e_machten$t$, $c$e_plus_product$c$, 8, 3,
    $vraag$f(x) = x^{2}e^{3x}$vraag$,
    $ant$(2x + 3x^2)e^(3x)$ant$,
    $latex$(2x + 3x^{2})e^{3x}$latex$,
    ARRAY[$alt$(3x^2 + 2x)e^(3x)$alt$, $alt$2x e^(3x) + 3x^2 e^(3x)$alt$, $alt$x(2 + 3x)e^(3x)$alt$]::text[]
  ),
  (
    $t$h9_e_machten$t$, $c$e_plus_quotient$c$, 7, 2,
    $vraag$f(x) = \dfrac{e^{x}}{x + 1}$vraag$,
    $ant$x e^x / (x + 1)^2$ant$,
    $latex$\dfrac{x e^{x}}{(x + 1)^{2}}$latex$,
    ARRAY[$alt$(e^x (x + 1) - e^x)/(x + 1)^2$alt$, $alt$xe^x/(x+1)^2$alt$, $alt$x*e^x/(x+1)^2$alt$]::text[]
  ),
  (
    $t$h9_e_machten$t$, $c$e_plus_quotient$c$, 8, 3,
    $vraag$f(x) = \dfrac{x + 2}{e^{x}}$vraag$,
    $ant$-(x + 1)/e^x$ant$,
    $latex$-\dfrac{x + 1}{e^{x}}$latex$,
    ARRAY[$alt$(-x - 1)/e^x$alt$, $alt$-(x+1)e^(-x)$alt$, $alt$(-x-1)e^(-x)$alt$, $alt$(1 - x - 2)/e^x$alt$]::text[]
  ),
  (
    $t$h9_e_machten$t$, $c$ketting_lineair$c$, 7, 2,
    $vraag$f(x) = e^{4x - 1}$vraag$,
    $ant$4e^(4x - 1)$ant$,
    $latex$4e^{4x - 1}$latex$,
    ARRAY[$alt$4*e^(4x-1)$alt$, $alt$4e^(4x-1)$alt$]::text[]
  ),
  (
    $t$h9_e_machten$t$, $c$ketting_lineair$c$, 8, 3,
    $vraag$f(x) = 3e^{-x + 2}$vraag$,
    $ant$-3e^(-x + 2)$ant$,
    $latex$-3e^{-x + 2}$latex$,
    ARRAY[$alt$-3e^(2 - x)$alt$, $alt$-3*e^(-x+2)$alt$, $alt$-3e^(2-x)$alt$]::text[]
  ),
  (
    $t$h9_e_machten$t$, $c$ketting_polynoom$c$, 7, 2,
    $vraag$f(x) = e^{x^{2} - 4x}$vraag$,
    $ant$(2x - 4)e^(x^2 - 4x)$ant$,
    $latex$(2x - 4)e^{x^{2} - 4x}$latex$,
    ARRAY[$alt$2(x - 2)e^(x^2 - 4x)$alt$, $alt$(2x-4)e^(x^2-4x)$alt$, $alt$2(x-2)e^(x^2-4x)$alt$]::text[]
  ),
  (
    $t$h9_e_machten$t$, $c$ketting_polynoom$c$, 8, 3,
    $vraag$f(x) = e^{x^{3} - x}$vraag$,
    $ant$(3x^2 - 1)e^(x^3 - x)$ant$,
    $latex$(3x^{2} - 1)e^{x^{3} - x}$latex$,
    ARRAY[$alt$(3x^2-1)e^(x^3-x)$alt$, $alt$3x^2 e^(x^3 - x) - e^(x^3 - x)$alt$]::text[]
  ),
  (
    $t$h9_logaritmes$t$, $c$basis_gx_glog$c$, 7, 2,
    $vraag$f(x) = 5^{x}$vraag$,
    $ant$5^x ln(5)$ant$,
    $latex$5^{x}\ln(5)$latex$,
    ARRAY[$alt$ln(5)*5^x$alt$, $alt$5^x*ln(5)$alt$, $alt$ln(5)5^x$alt$]::text[]
  ),
  (
    $t$h9_logaritmes$t$, $c$basis_gx_glog$c$, 8, 3,
    $vraag$f(x) = {}^{2}\!\log(3x + 1)$vraag$,
    $ant$3/((3x + 1) ln(2))$ant$,
    $latex$\dfrac{3}{(3x + 1)\ln(2)}$latex$,
    ARRAY[$alt$3/((3x+1)*ln(2))$alt$, $alt$3/(ln(2)*(3x+1))$alt$, $alt$3/((3x+1)ln(2))$alt$]::text[]
  ),
  (
    $t$h9_logaritmes$t$, $c$basis_ln$c$, 7, 2,
    $vraag$f(x) = 4\ln(x) - x$vraag$,
    $ant$4/x - 1$ant$,
    $latex$\dfrac{4}{x} - 1$latex$,
    ARRAY[$alt$(4 - x)/x$alt$, $alt$4/x-1$alt$, $alt$4*x^(-1) - 1$alt$]::text[]
  ),
  (
    $t$h9_logaritmes$t$, $c$basis_ln$c$, 8, 3,
    $vraag$f(x) = \ln(3x) + x^{2}$vraag$,
    $ant$1/x + 2x$ant$,
    $latex$\dfrac{1}{x} + 2x$latex$,
    ARRAY[$alt$2x + 1/x$alt$, $alt$2x+1/x$alt$, $alt$x^(-1) + 2x$alt$]::text[]
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_ketting$c$, 7, 2,
    $vraag$f(x) = \ln(4x - 1)$vraag$,
    $ant$4/(4x - 1)$ant$,
    $latex$\dfrac{4}{4x - 1}$latex$,
    ARRAY[$alt$4/(4x-1)$alt$, $alt$4*(4x-1)^(-1)$alt$]::text[]
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_ketting$c$, 8, 3,
    $vraag$f(x) = \ln(x^{2} + 4)$vraag$,
    $ant$2x/(x^2 + 4)$ant$,
    $latex$\dfrac{2x}{x^{2} + 4}$latex$,
    ARRAY[$alt$2x/(x^2+4)$alt$, $alt$(2x)/(x^2+4)$alt$]::text[]
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_plus_product$c$, 7, 2,
    $vraag$f(x) = (x - 1)\ln(x)$vraag$,
    $ant$ln(x) + (x - 1)/x$ant$,
    $latex$\ln(x) + \dfrac{x - 1}{x}$latex$,
    ARRAY[$alt$ln(x) + 1 - 1/x$alt$, $alt$ln(x)+(x-1)/x$alt$, $alt$ln(x)+1-1/x$alt$]::text[]
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_plus_product$c$, 8, 3,
    $vraag$f(x) = x^{2}\ln(x + 1)$vraag$,
    $ant$2x ln(x + 1) + x^2/(x + 1)$ant$,
    $latex$2x\ln(x + 1) + \dfrac{x^{2}}{x + 1}$latex$,
    ARRAY[$alt$2x*ln(x+1) + x^2/(x+1)$alt$, $alt$x^2/(x+1) + 2x ln(x+1)$alt$]::text[]
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_plus_quotient$c$, 7, 2,
    $vraag$f(x) = \dfrac{\ln(x)}{x + 1}$vraag$,
    $ant$(x + 1 - x ln(x))/(x (x + 1)^2)$ant$,
    $latex$\dfrac{x + 1 - x\ln(x)}{x(x + 1)^{2}}$latex$,
    ARRAY[$alt$((x+1)/x - ln(x))/(x+1)^2$alt$, $alt$(1/x*(x+1) - ln(x))/(x+1)^2$alt$, $alt$(x+1-x*ln(x))/(x*(x+1)^2)$alt$]::text[]
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_plus_quotient$c$, 8, 3,
    $vraag$f(x) = \dfrac{x - 1}{\ln(x)}$vraag$,
    $ant$(ln(x) - (x - 1)/x)/ln^2(x)$ant$,
    $latex$\dfrac{\ln(x) - \dfrac{x - 1}{x}}{\ln^{2}(x)}$latex$,
    ARRAY[$alt$(ln(x) - 1 + 1/x)/ln^2(x)$alt$, $alt$(x ln(x) - x + 1)/(x ln^2(x))$alt$, $alt$(ln(x)-(x-1)/x)/(ln(x))^2$alt$]::text[]
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
    $t$h9_e_machten$t$, $c$basis_ex$c$, 7, 0,
    $stap$Een e-macht en een gewone term. De afgeleide van $e^{x}$ is weer $e^{x}$. Differentieer de termen apart.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$basis_ex$c$, 7, 1,
    $stap$De afgeleide van $5e^{x}$ is $5e^{x}$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$basis_ex$c$, 7, 2,
    $stap$De afgeleide van $-2x$ is $-2$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$basis_ex$c$, 7, 3,
    $stap$Samen: $f'(x) = 5e^{x} - 2$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$basis_ex$c$, 8, 0,
    $stap$Drie termen. De breuk $\dfrac{3}{x}$ schrijf je als $3x^{-1}$. De noemer mag niet nul zijn, dus $x \neq 0$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$basis_ex$c$, 8, 1,
    $stap$De afgeleide van $e^{x}$ is $e^{x}$ en de afgeleide van $x^{2}$ is $2x$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$basis_ex$c$, 8, 2,
    $stap$De afgeleide van $-3x^{-1}$ is $-3 \cdot (-1) x^{-2} = 3x^{-2} = \dfrac{3}{x^{2}}$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$basis_ex$c$, 8, 3,
    $stap$Samen: $f'(x) = e^{x} + 2x + \dfrac{3}{x^{2}}$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$e_plus_product$c$, 7, 0,
    $stap$Er staat $(x - 2)$ keer $e^{x}$. Dat is de productregel.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$e_plus_product$c$, 7, 1,
    $stap$Noem $g(x) = x - 2$ en $h(x) = e^{x}$. Dan is $g'(x) = 1$ en $h'(x) = e^{x}$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$e_plus_product$c$, 7, 2,
    $stap$$f'(x) = e^{x} + (x - 2)e^{x}$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$e_plus_product$c$, 7, 3,
    $stap$Haal $e^{x}$ buiten haakjes: $f'(x) = (1 + x - 2)e^{x} = (x - 1)e^{x}$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$e_plus_product$c$, 8, 0,
    $stap$Er staat $x^{2}$ keer $e^{3x}$. Dat is de productregel, en in de exponent zit de kettingregel.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$e_plus_product$c$, 8, 1,
    $stap$Noem $g(x) = x^{2}$ en $h(x) = e^{3x}$. Dan is $g'(x) = 2x$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$e_plus_product$c$, 8, 2,
    $stap$Voor $h$: de exponent $3x$ heeft afgeleide $3$, dus $h'(x) = 3e^{3x}$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$e_plus_product$c$, 8, 3,
    $stap$$f'(x) = 2x \cdot e^{3x} + x^{2} \cdot 3e^{3x} = (2x + 3x^{2})e^{3x}$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$e_plus_quotient$c$, 7, 0,
    $stap$Er staat een breuk met een e-macht in de teller. Dat is de quotiëntregel. De noemer mag niet nul zijn, dus $x \neq -1$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$e_plus_quotient$c$, 7, 1,
    $stap$Noem $g(x) = e^{x}$ en $h(x) = x + 1$. Dan is $g'(x) = e^{x}$ en $h'(x) = 1$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$e_plus_quotient$c$, 7, 2,
    $stap$Teller van de afgeleide: $e^{x}(x + 1) - e^{x} \cdot 1 = e^{x}\bigl((x + 1) - 1\bigr) = x e^{x}$. Noemer: $(x + 1)^{2}$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$e_plus_quotient$c$, 7, 3,
    $stap$Dus $f'(x) = \dfrac{x e^{x}}{(x + 1)^{2}}$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$e_plus_quotient$c$, 8, 0,
    $stap$Er staat een breuk met $e^{x}$ in de noemer. Dat is de quotiëntregel. Je mag de breuk ook zien als $(x + 2)e^{-x}$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$e_plus_quotient$c$, 8, 1,
    $stap$Noem $g(x) = x + 2$ en $h(x) = e^{x}$. Dan is $g'(x) = 1$ en $h'(x) = e^{x}$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$e_plus_quotient$c$, 8, 2,
    $stap$Teller van de afgeleide: $1 \cdot e^{x} - (x + 2)e^{x} = e^{x}\bigl(1 - (x + 2)\bigr) = -(x + 1)e^{x}$. Noemer: $e^{2x}$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$e_plus_quotient$c$, 8, 3,
    $stap$Deel teller en noemer door $e^{x}$: $f'(x) = -\dfrac{x + 1}{e^{x}}$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$ketting_lineair$c$, 7, 0,
    $stap$In de exponent staat $4x - 1$. Dat is de kettingregel. De e-macht zelf blijft staan.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$ketting_lineair$c$, 7, 1,
    $stap$Noem $h(x) = 4x - 1$. Dan is $h'(x) = 4$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$ketting_lineair$c$, 7, 2,
    $stap$De afgeleide is de e-macht keer de afgeleide van de exponent.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$ketting_lineair$c$, 7, 3,
    $stap$$f'(x) = 4e^{4x - 1}$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$ketting_lineair$c$, 8, 0,
    $stap$Er staat $3$ keer een e-macht met exponent $-x + 2$. Eerst de kettingregel, daarna keer $3$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$ketting_lineair$c$, 8, 1,
    $stap$Noem $h(x) = -x + 2$. Dan is $h'(x) = -1$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$ketting_lineair$c$, 8, 2,
    $stap$De afgeleide van $e^{-x + 2}$ is $e^{-x + 2} \cdot (-1) = -e^{-x + 2}$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$ketting_lineair$c$, 8, 3,
    $stap$Keer $3$: $f'(x) = -3e^{-x + 2}$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$ketting_polynoom$c$, 7, 0,
    $stap$In de exponent staat $x^{2} - 4x$. Dat is de kettingregel. De e-macht zelf blijft staan.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$ketting_polynoom$c$, 7, 1,
    $stap$Noem $h(x) = x^{2} - 4x$. Dan is $h'(x) = 2x - 4$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$ketting_polynoom$c$, 7, 2,
    $stap$De afgeleide is de e-macht keer de afgeleide van de exponent.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$ketting_polynoom$c$, 7, 3,
    $stap$$f'(x) = (2x - 4)e^{x^{2} - 4x}$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$ketting_polynoom$c$, 8, 0,
    $stap$In de exponent staat $x^{3} - x$. Dat is de kettingregel. De e-macht zelf blijft staan.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$ketting_polynoom$c$, 8, 1,
    $stap$Noem $h(x) = x^{3} - x$. Dan is $h'(x) = 3x^{2} - 1$.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$ketting_polynoom$c$, 8, 2,
    $stap$De afgeleide is de e-macht keer de afgeleide van de exponent.$stap$
  ),
  (
    $t$h9_e_machten$t$, $c$ketting_polynoom$c$, 8, 3,
    $stap$$f'(x) = (3x^{2} - 1)e^{x^{3} - x}$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$basis_gx_glog$c$, 7, 0,
    $stap$Een exponentiële functie met grondtal $5$. De afgeleide is de functie zelf keer $\ln(5)$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$basis_gx_glog$c$, 7, 1,
    $stap$Schrijf $5^{x} = e^{x\ln(5)}$ als je de kettingregel wilt zien.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$basis_gx_glog$c$, 7, 2,
    $stap$De afgeleide van de exponent $x\ln(5)$ is $\ln(5)$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$basis_gx_glog$c$, 7, 3,
    $stap$Dus $f'(x) = 5^{x}\ln(5)$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$basis_gx_glog$c$, 8, 0,
    $stap$Een tweetallige logaritme van $3x + 1$. Die bestaat alleen als $3x + 1 > 0$, dus $x > -\dfrac{1}{3}$. In de logaritme zit de kettingregel.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$basis_gx_glog$c$, 8, 1,
    $stap$De afgeleide van ${}^{2}\!\log\bigl(h(x)\bigr)$ is $\dfrac{h'(x)}{h(x)\ln(2)}$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$basis_gx_glog$c$, 8, 2,
    $stap$Hier is $h(x) = 3x + 1$ en $h'(x) = 3$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$basis_gx_glog$c$, 8, 3,
    $stap$Dus $f'(x) = \dfrac{3}{(3x + 1)\ln(2)}$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$basis_ln$c$, 7, 0,
    $stap$Een logaritme en een gewone $x$. De logaritme bestaat alleen voor $x > 0$. Differentieer de termen apart.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$basis_ln$c$, 7, 1,
    $stap$De afgeleide van $\ln(x)$ is $\dfrac{1}{x}$, dus de afgeleide van $4\ln(x)$ is $\dfrac{4}{x}$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$basis_ln$c$, 7, 2,
    $stap$De afgeleide van $-x$ is $-1$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$basis_ln$c$, 7, 3,
    $stap$Samen: $f'(x) = \dfrac{4}{x} - 1$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$basis_ln$c$, 8, 0,
    $stap$$\ln(3x)$ bestaat alleen voor $x > 0$. Gebruik eerst de rekenregel $\ln(3x) = \ln(3) + \ln(x)$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$basis_ln$c$, 8, 1,
    $stap$$\ln(3)$ is een constante, dus die valt weg bij differentiëren.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$basis_ln$c$, 8, 2,
    $stap$De afgeleide van $\ln(x)$ is $\dfrac{1}{x}$ en de afgeleide van $x^{2}$ is $2x$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$basis_ln$c$, 8, 3,
    $stap$Dus $f'(x) = \dfrac{1}{x} + 2x$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_ketting$c$, 7, 0,
    $stap$Buiten de logaritme staat $4x - 1$. Dat is de kettingregel. De logaritme bestaat alleen als $4x - 1 > 0$, dus $x > \dfrac{1}{4}$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_ketting$c$, 7, 1,
    $stap$Noem $h(x) = 4x - 1$. Dan is $h'(x) = 4$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_ketting$c$, 7, 2,
    $stap$De afgeleide van $\ln\bigl(h(x)\bigr)$ is $\dfrac{h'(x)}{h(x)}$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_ketting$c$, 7, 3,
    $stap$Dus $f'(x) = \dfrac{4}{4x - 1}$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_ketting$c$, 8, 0,
    $stap$Buiten de logaritme staat $x^{2} + 4$. Dat is altijd positief, dus de logaritme bestaat voor elke $x$. Gebruik de kettingregel.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_ketting$c$, 8, 1,
    $stap$Noem $h(x) = x^{2} + 4$. Dan is $h'(x) = 2x$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_ketting$c$, 8, 2,
    $stap$De afgeleide van $\ln\bigl(h(x)\bigr)$ is $\dfrac{h'(x)}{h(x)}$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_ketting$c$, 8, 3,
    $stap$Dus $f'(x) = \dfrac{2x}{x^{2} + 4}$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_plus_product$c$, 7, 0,
    $stap$Er staat $(x - 1)$ keer $\ln(x)$. Dat is de productregel. De logaritme bestaat alleen voor $x > 0$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_plus_product$c$, 7, 1,
    $stap$Noem $g(x) = x - 1$ en $h(x) = \ln(x)$. Dan is $g'(x) = 1$ en $h'(x) = \dfrac{1}{x}$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_plus_product$c$, 7, 2,
    $stap$$f'(x) = \ln(x) + (x - 1) \cdot \dfrac{1}{x}$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_plus_product$c$, 7, 3,
    $stap$Dus $f'(x) = \ln(x) + \dfrac{x - 1}{x}$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_plus_product$c$, 8, 0,
    $stap$Er staat $x^{2}$ keer $\ln(x + 1)$. Dat is de productregel, en in de logaritme zit de kettingregel. De logaritme bestaat alleen voor $x > -1$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_plus_product$c$, 8, 1,
    $stap$Noem $g(x) = x^{2}$ en $h(x) = \ln(x + 1)$. Dan is $g'(x) = 2x$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_plus_product$c$, 8, 2,
    $stap$Voor $h$: binnenkant $x + 1$, dus $h'(x) = \dfrac{1}{x + 1}$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_plus_product$c$, 8, 3,
    $stap$$f'(x) = 2x\ln(x + 1) + x^{2} \cdot \dfrac{1}{x + 1} = 2x\ln(x + 1) + \dfrac{x^{2}}{x + 1}$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_plus_quotient$c$, 7, 0,
    $stap$Er staat een breuk met een logaritme in de teller. Dat is de quotiëntregel. De logaritme bestaat voor $x > 0$, en de noemer mag niet nul zijn.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_plus_quotient$c$, 7, 1,
    $stap$Noem $g(x) = \ln(x)$ en $h(x) = x + 1$. Dan is $g'(x) = \dfrac{1}{x}$ en $h'(x) = 1$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_plus_quotient$c$, 7, 2,
    $stap$Teller van de afgeleide: $\dfrac{1}{x}(x + 1) - \ln(x)$. Noemer: $(x + 1)^{2}$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_plus_quotient$c$, 7, 3,
    $stap$De teller op één noemer is $\dfrac{x + 1 - x\ln(x)}{x}$. Deel door $(x + 1)^{2}$: $f'(x) = \dfrac{x + 1 - x\ln(x)}{x(x + 1)^{2}}$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_plus_quotient$c$, 8, 0,
    $stap$Er staat een breuk met $\ln(x)$ in de noemer. Dat is de quotiëntregel. De logaritme bestaat voor $x > 0$ en mag niet nul zijn, dus $x \neq 1$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_plus_quotient$c$, 8, 1,
    $stap$Noem $g(x) = x - 1$ en $h(x) = \ln(x)$. Dan is $g'(x) = 1$ en $h'(x) = \dfrac{1}{x}$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_plus_quotient$c$, 8, 2,
    $stap$Teller van de afgeleide: $\ln(x) - (x - 1) \cdot \dfrac{1}{x}$. Noemer: $\ln^{2}(x)$.$stap$
  ),
  (
    $t$h9_logaritmes$t$, $c$ln_plus_quotient$c$, 8, 3,
    $stap$Dus $f'(x) = \dfrac{\ln(x) - \dfrac{x - 1}{x}}{\ln^{2}(x)}$.$stap$
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
  FOREACH soort IN ARRAY ARRAY['basis_ex', 'e_plus_product', 'e_plus_quotient', 'ketting_lineair', 'ketting_polynoom', 'basis_gx_glog', 'basis_ln', 'ln_ketting', 'ln_plus_product', 'ln_plus_quotient']::text[]
  LOOP
    SELECT count(*) INTO n
    FROM public.questions_new q
    JOIN public.topic_clusters_new c ON c.id = q.cluster_id
    JOIN public.topics_new t ON t.id = c.topic_id
    JOIN public.chapters h ON h.id = t.chapter_id
    WHERE h.slug = 'h9'
      AND c.slug = soort;

    SELECT count(*) INTO n_zonder
    FROM public.questions_new q
    JOIN public.topic_clusters_new c ON c.id = q.cluster_id
    JOIN public.topics_new t ON t.id = c.topic_id
    JOIN public.chapters h ON h.id = t.chapter_id
    WHERE h.slug = 'h9'
      AND c.slug = soort
      AND q.order_index >= 7
      AND (
        SELECT count(*)
        FROM public.question_steps_new s
        WHERE s.question_id = q.id
          AND s.step_order IN (0, 1, 2, 3)
      ) < 4;

    IF n < 8 OR n_zonder <> 0 THEN
      RAISE EXCEPTION 'soort % in h9 klopt niet: aantal %, zonder stappen 0-3 %', soort, n, n_zonder;
    END IF;
  END LOOP;

  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new c ON c.id = q.cluster_id
  JOIN public.topics_new t ON t.id = c.topic_id
  JOIN public.chapters h ON h.id = t.chapter_id
  WHERE h.slug = 'h9'
    AND c.slug = 'emacht_in_een_verhaal';

  IF n < 8 THEN
    RAISE EXCEPTION 'emacht_in_een_verhaal in h9 heeft minder dan 8 vragen: %', n;
  END IF;
END $$;

COMMIT;
