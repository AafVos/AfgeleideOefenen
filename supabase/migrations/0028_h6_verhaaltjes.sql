-- Verhaaltjes achteraan hoofdstuk 6.
-- Twee eigen soorten, elk 8 opgaven, half om half.
-- Antwoord is het kale getal. Bij een x staat x = in answer_prefix.
-- Bij een waarde (kosten, snelheid, temperatuur) blijft dat veld leeg.
-- Herhaalbaar: een tweede keer draaien voegt niets dubbel toe.

BEGIN;

INSERT INTO public.topic_clusters_new (site, topic_id, slug, title, order_index)
SELECT 'afgeleiden', t.id, v.slug, v.title, v.order_index
FROM public.topics_new t
JOIN (VALUES
  ('h6_machten', 'laagste_of_hoogste_waarde', 'Laagste of hoogste waarde', 5::smallint),
  ('h6_kettingregel', 'wortel_in_een_verhaal', 'Wortel in een verhaal', 6::smallint)
) AS v(topic_slug, slug, title, order_index)
  ON t.slug = v.topic_slug
WHERE t.site = 'afgeleiden'
ON CONFLICT (topic_id, slug) DO NOTHING;

-- Kernniveau: difficulty 1. De functie staat in de zin.
INSERT INTO public.questions_new (
  site, topic_id, cluster_id, latex_body, answer, latex_answer,
  difficulty, is_ai_generated, order_index, answer_alternatives, answer_prefix
)
SELECT
  'afgeleiden', t.id, c.id, v.latex_body, v.answer, v.answer,
  1, false, v.order_index, '{}'::text[], v.answer_prefix
FROM (VALUES
  -- Laagste of hoogste waarde, vorm ax + b/x met x > 0.
  -- Oneven = bij welke x, even = hoe groot is die waarde.
  (
    'h6_machten', 'laagste_of_hoogste_waarde', 1,
    $vraag$Je berekent de kosten van een bakkerij. Het aantal partijen is $x$, met $x > 0$. De kosten in euro zijn $K = 2x + \dfrac{8}{x}$. Bij welke $x$ zijn de kosten het laagst?$vraag$,
    '2', 'x ='
  ),
  (
    'h6_machten', 'laagste_of_hoogste_waarde', 2,
    $vraag$Je berekent de kosten van een werkplaats. Het aantal kasten is $x$, met $x > 0$. De kosten in euro zijn $K = x + \dfrac{4}{x}$. Hoe groot zijn de laagste kosten, in euro?$vraag$,
    '4', NULL
  ),
  (
    'h6_machten', 'laagste_of_hoogste_waarde', 3,
    $vraag$Je berekent de kosten van een drukkerij. Het aantal duizend folders is $x$, met $x > 0$. De kosten in euro zijn $K = 3x + \dfrac{12}{x}$. Bij welke $x$ zijn de kosten het laagst?$vraag$,
    '2', 'x ='
  ),
  (
    'h6_machten', 'laagste_of_hoogste_waarde', 4,
    $vraag$Je berekent de kosten van een tuinderij. Het aantal kratten is $x$, met $x > 0$. De kosten in euro zijn $K = x + \dfrac{9}{x}$. Hoe groot zijn de laagste kosten, in euro?$vraag$,
    '6', NULL
  ),
  (
    'h6_machten', 'laagste_of_hoogste_waarde', 5,
    $vraag$Je plant een bezorgroute. Je kiest een getal $x$, met $x > 0$. De tijd in minuten is $T = 4x + \dfrac{36}{x}$. Bij welke $x$ is de tijd het kleinst?$vraag$,
    '3', 'x ='
  ),
  (
    'h6_machten', 'laagste_of_hoogste_waarde', 6,
    $vraag$Je stelt een ketel in. De stand is $x$, met $x > 0$. Het verbruik in kilowattuur is $f(x) = 2x + \dfrac{32}{x}$. Hoe groot is het laagste verbruik, in kilowattuur?$vraag$,
    '16', NULL
  ),
  (
    'h6_machten', 'laagste_of_hoogste_waarde', 7,
    $vraag$Je stelt een vriezer in. De stand is $x$, met $x > 0$. De temperatuur in graden Celsius is $T = -2x - \dfrac{18}{x}$. Bij welke $x$ is de temperatuur het hoogst?$vraag$,
    '3', 'x ='
  ),
  (
    'h6_machten', 'laagste_of_hoogste_waarde', 8,
    $vraag$Je stelt een koelcel in. De stand is $x$, met $x > 0$. De temperatuur in graden Celsius is $T = -3x - \dfrac{12}{x}$. Hoe groot is de hoogste temperatuur, in graden Celsius?$vraag$,
    '-12', NULL
  ),
  -- Wortel in een verhaal. Eén wortel, geen letter als parameter.
  -- 1 t/m 4: snelheid of stijging op een tijdstip (hoe groot).
  -- 5 t/m 8: wanneer de waarde het grootst of kleinst is.
  (
    'h6_kettingregel', 'wortel_in_een_verhaal', 1,
    $vraag$Je volgt een auto. De afgelegde weg in meter na $t$ seconden is $s(t) = 6\sqrt{t}$, met $t > 0$. Hoe groot is de snelheid na $4$ seconden, in meter per seconde?$vraag$,
    '3/2', NULL
  ),
  (
    'h6_kettingregel', 'wortel_in_een_verhaal', 2,
    $vraag$Je volgt een ballon. De hoogte in meter na $t$ seconden is $h(t) = \sqrt{4t + 5}$, met $t \geq 0$. Hoe groot is de stijgsnelheid na $1$ seconde, in meter per seconde?$vraag$,
    '2/3', NULL
  ),
  (
    'h6_kettingregel', 'wortel_in_een_verhaal', 3,
    $vraag$Je volgt een boot. De afgelegde weg in meter na $t$ seconden is $s(t) = 8\sqrt{t + 1}$, met $t \geq 0$. Hoe groot is de snelheid na $3$ seconden, in meter per seconde?$vraag$,
    '2', NULL
  ),
  (
    'h6_kettingregel', 'wortel_in_een_verhaal', 4,
    $vraag$Je volgt een lift. De hoogte in meter na $t$ seconden is $h(t) = 10\sqrt{t + 3}$, met $t \geq 0$. Hoe groot is de stijgsnelheid na $1$ seconde, in meter per seconde?$vraag$,
    '5/2', NULL
  ),
  (
    'h6_kettingregel', 'wortel_in_een_verhaal', 5,
    $vraag$Je bekijkt een oogst. Het aantal dagen is $x$, met $x > 0$. De opbrengst in kilogram is $f(x) = 4\sqrt{x} - x$. Bij welke $x$ is de opbrengst het grootst?$vraag$,
    '4', 'x ='
  ),
  (
    'h6_kettingregel', 'wortel_in_een_verhaal', 6,
    $vraag$Je bekijkt een markt. Het aantal uur is $x$, met $x > 0$. De winst in euro is $f(x) = 6\sqrt{x} - x$. Bij welke $x$ is de winst het grootst?$vraag$,
    '9', 'x ='
  ),
  (
    'h6_kettingregel', 'wortel_in_een_verhaal', 7,
    $vraag$Je bekijkt een spel. Het aantal beurten is $x$, met $x > 0$. De score in punten is $f(x) = 10\sqrt{x} - x$. Bij welke $x$ is de score het grootst?$vraag$,
    '25', 'x ='
  ),
  (
    'h6_kettingregel', 'wortel_in_een_verhaal', 8,
    $vraag$Je bekijkt een voorraad. Het aantal dagen is $x$, met $x > 0$. De voorraad in kilogram is $f(x) = x - 8\sqrt{x}$. Een negatieve voorraad is een tekort. Bij welke $x$ is de voorraad het kleinst?$vraag$,
    '16', 'x ='
  )
) AS v(topic_slug, cluster_slug, order_index, latex_body, answer, answer_prefix)
JOIN public.topics_new t
  ON t.site = 'afgeleiden' AND t.slug = v.topic_slug
JOIN public.topic_clusters_new c
  ON c.site = 'afgeleiden' AND c.topic_id = t.id AND c.slug = v.cluster_slug
WHERE NOT EXISTS (
  SELECT 1
  FROM public.questions_new q
  WHERE q.cluster_id = c.id
    AND q.order_index = v.order_index
);

INSERT INTO public.question_steps_new (question_id, step_order, step_description)
SELECT q.id, v.step_order, v.step_description
FROM (VALUES
  -- Kosten 2x + 8/x. Laagst bij x = 2. K(2) = 8, buren 10.
  ('h6_machten', 'laagste_of_hoogste_waarde', 1, 0, $stap$De kosten zijn $K(x) = 2x + \dfrac{8}{x} = 2x + 8x^{-1}$. Je zoekt de $x$ waar de kosten het laagst zijn. Dat is waar $K'(x) = 0$, met $x > 0$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 1, 1, $stap$Differentieer: $K'(x) = 2 - 8x^{-2} = 2 - \dfrac{8}{x^{2}}$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 1, 2, $stap$Stel de afgeleide nul: $2 - \dfrac{8}{x^{2}} = 0$, dus $\dfrac{8}{x^{2}} = 2$, dus $x^{2} = 4$. Omdat $x > 0$ is $x = 2$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 1, 3, $stap$Controle: $K(1) = 10$ en $K(4) = 10$. Allebei hoger dan $K(2) = 8$. De kosten zijn het laagst bij $x = 2$.$stap$),
  -- Laagste kosten 4. Top bij x = 2.
  ('h6_machten', 'laagste_of_hoogste_waarde', 2, 0, $stap$De kosten zijn $K(x) = x + \dfrac{4}{x} = x + 4x^{-1}$. Je zoekt de laagste kosten. Eerst de $x$ waar $K'(x) = 0$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 2, 1, $stap$Differentieer: $K'(x) = 1 - \dfrac{4}{x^{2}}$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 2, 2, $stap$Stel de afgeleide nul: $1 - \dfrac{4}{x^{2}} = 0$, dus $x^{2} = 4$. Omdat $x > 0$ is $x = 2$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 2, 3, $stap$Vul in: $K(2) = 2 + \dfrac{4}{2} = 2 + 2 = 4$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 2, 4, $stap$Controle: $K(1) = 5$ en $K(4) = 5$. Allebei hoger dan $4$. De laagste kosten zijn $4$ euro.$stap$),
  -- Kosten 3x + 12/x. Laagst bij x = 2. K(2) = 12, buren 15.
  ('h6_machten', 'laagste_of_hoogste_waarde', 3, 0, $stap$De kosten zijn $K(x) = 3x + \dfrac{12}{x} = 3x + 12x^{-1}$. Je zoekt de $x$ waar de kosten het laagst zijn, dus waar $K'(x) = 0$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 3, 1, $stap$Differentieer: $K'(x) = 3 - \dfrac{12}{x^{2}}$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 3, 2, $stap$Stel de afgeleide nul: $3 - \dfrac{12}{x^{2}} = 0$, dus $x^{2} = 4$. Omdat $x > 0$ is $x = 2$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 3, 3, $stap$Controle: $K(1) = 15$ en $K(4) = 15$. Allebei hoger dan $K(2) = 12$. De kosten zijn het laagst bij $x = 2$.$stap$),
  -- Laagste kosten 6. Top bij x = 3.
  ('h6_machten', 'laagste_of_hoogste_waarde', 4, 0, $stap$De kosten zijn $K(x) = x + \dfrac{9}{x}$. Je zoekt de laagste kosten. Eerst waar $K'(x) = 0$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 4, 1, $stap$Differentieer: $K'(x) = 1 - \dfrac{9}{x^{2}}$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 4, 2, $stap$Stel de afgeleide nul: $1 - \dfrac{9}{x^{2}} = 0$, dus $x^{2} = 9$. Omdat $x > 0$ is $x = 3$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 4, 3, $stap$Vul in: $K(3) = 3 + \dfrac{9}{3} = 3 + 3 = 6$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 4, 4, $stap$Controle: $K(1) = 10$ en $K(9) = 10$. Allebei hoger dan $6$. De laagste kosten zijn $6$ euro.$stap$),
  -- Tijd 4x + 36/x. Kleinst bij x = 3. T(3) = 24, buren 40.
  ('h6_machten', 'laagste_of_hoogste_waarde', 5, 0, $stap$De tijd is $T(x) = 4x + \dfrac{36}{x}$. Je zoekt de $x$ waar de tijd het kleinst is, dus waar $T'(x) = 0$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 5, 1, $stap$Differentieer: $T'(x) = 4 - \dfrac{36}{x^{2}}$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 5, 2, $stap$Stel de afgeleide nul: $4 - \dfrac{36}{x^{2}} = 0$, dus $x^{2} = 9$. Omdat $x > 0$ is $x = 3$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 5, 3, $stap$Controle: $T(1) = 40$ en $T(9) = 40$. Allebei hoger dan $T(3) = 24$. De tijd is het kleinst bij $x = 3$.$stap$),
  -- Laagste verbruik 16. Top bij x = 4.
  ('h6_machten', 'laagste_of_hoogste_waarde', 6, 0, $stap$Het verbruik is $f(x) = 2x + \dfrac{32}{x}$. Je zoekt het laagste verbruik. Eerst waar $f'(x) = 0$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 6, 1, $stap$Differentieer: $f'(x) = 2 - \dfrac{32}{x^{2}}$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 6, 2, $stap$Stel de afgeleide nul: $2 - \dfrac{32}{x^{2}} = 0$, dus $x^{2} = 16$. Omdat $x > 0$ is $x = 4$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 6, 3, $stap$Vul in: $f(4) = 2 \cdot 4 + \dfrac{32}{4} = 8 + 8 = 16$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 6, 4, $stap$Controle: $f(2) = 20$ en $f(8) = 20$. Allebei hoger dan $16$. Het laagste verbruik is $16$ kilowattuur.$stap$),
  -- Hoogste temperatuur, x = 3. T(3) = -12, buren -20.
  ('h6_machten', 'laagste_of_hoogste_waarde', 7, 0, $stap$De temperatuur is $T(x) = -2x - \dfrac{18}{x} = -2x - 18x^{-1}$. Je zoekt de $x$ waar de temperatuur het hoogst is, dus waar $T'(x) = 0$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 7, 1, $stap$Differentieer: $T'(x) = -2 + \dfrac{18}{x^{2}}$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 7, 2, $stap$Stel de afgeleide nul: $-2 + \dfrac{18}{x^{2}} = 0$, dus $x^{2} = 9$. Omdat $x > 0$ is $x = 3$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 7, 3, $stap$Controle: $T(1) = -20$ en $T(9) = -20$. Allebei lager dan $T(3) = -12$. De temperatuur is het hoogst bij $x = 3$.$stap$),
  -- Hoogste temperatuur -12. Top bij x = 2.
  ('h6_machten', 'laagste_of_hoogste_waarde', 8, 0, $stap$De temperatuur is $T(x) = -3x - \dfrac{12}{x}$. Je zoekt de hoogste temperatuur. Eerst waar $T'(x) = 0$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 8, 1, $stap$Differentieer: $T'(x) = -3 + \dfrac{12}{x^{2}}$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 8, 2, $stap$Stel de afgeleide nul: $-3 + \dfrac{12}{x^{2}} = 0$, dus $x^{2} = 4$. Omdat $x > 0$ is $x = 2$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 8, 3, $stap$Vul in: $T(2) = -3 \cdot 2 - \dfrac{12}{2} = -6 - 6 = -12$.$stap$),
  ('h6_machten', 'laagste_of_hoogste_waarde', 8, 4, $stap$Controle: $T(1) = -15$ en $T(4) = -15$. Allebei lager dan $-12$. De hoogste temperatuur is $-12$ graden Celsius.$stap$),

  -- Snelheid 3/2 op t = 4. s' = 3/sqrt(t).
  ('h6_kettingregel', 'wortel_in_een_verhaal', 1, 0, $stap$De weg is $s(t) = 6\sqrt{t} = 6t^{1/2}$. De snelheid is de afgeleide $s'(t)$. Je zoekt die op $t = 4$.$stap$),
  ('h6_kettingregel', 'wortel_in_een_verhaal', 1, 1, $stap$Differentieer met de machtsregel: $s'(t) = 6 \cdot \dfrac{1}{2} \cdot t^{-1/2} = \dfrac{3}{\sqrt{t}}$.$stap$),
  ('h6_kettingregel', 'wortel_in_een_verhaal', 1, 2, $stap$Vul het tijdstip in: $s'(4) = \dfrac{3}{\sqrt{4}} = \dfrac{3}{2}$.$stap$),
  ('h6_kettingregel', 'wortel_in_een_verhaal', 1, 3, $stap$De snelheid na $4$ seconden is $\dfrac{3}{2}$ meter per seconde.$stap$),
  -- Stijgsnelheid 2/3 op t = 1. h' = 2/sqrt(4t+5).
  ('h6_kettingregel', 'wortel_in_een_verhaal', 2, 0, $stap$De hoogte is $h(t) = \sqrt{4t + 5} = (4t + 5)^{1/2}$. De stijgsnelheid is $h'(t)$. Je zoekt die op $t = 1$.$stap$),
  ('h6_kettingregel', 'wortel_in_een_verhaal', 2, 1, $stap$Kettingregel: de buitenste afgeleide is $\dfrac{1}{2}(4t + 5)^{-1/2}$, de binnenste afgeleide is $4$. Dus $h'(t) = \dfrac{2}{\sqrt{4t + 5}}$.$stap$),
  ('h6_kettingregel', 'wortel_in_een_verhaal', 2, 2, $stap$Vul het tijdstip in: $h'(1) = \dfrac{2}{\sqrt{9}} = \dfrac{2}{3}$.$stap$),
  ('h6_kettingregel', 'wortel_in_een_verhaal', 2, 3, $stap$De stijgsnelheid na $1$ seconde is $\dfrac{2}{3}$ meter per seconde.$stap$),
  -- Snelheid 2 op t = 3. s' = 4/sqrt(t+1).
  ('h6_kettingregel', 'wortel_in_een_verhaal', 3, 0, $stap$De weg is $s(t) = 8\sqrt{t + 1} = 8(t + 1)^{1/2}$. De snelheid is $s'(t)$. Je zoekt die op $t = 3$.$stap$),
  ('h6_kettingregel', 'wortel_in_een_verhaal', 3, 1, $stap$Kettingregel: $s'(t) = 8 \cdot \dfrac{1}{2} \cdot (t + 1)^{-1/2} = \dfrac{4}{\sqrt{t + 1}}$.$stap$),
  ('h6_kettingregel', 'wortel_in_een_verhaal', 3, 2, $stap$Vul het tijdstip in: $s'(3) = \dfrac{4}{\sqrt{4}} = \dfrac{4}{2} = 2$.$stap$),
  ('h6_kettingregel', 'wortel_in_een_verhaal', 3, 3, $stap$De snelheid na $3$ seconden is $2$ meter per seconde.$stap$),
  -- Stijgsnelheid 5/2 op t = 1. h' = 5/sqrt(t+3).
  ('h6_kettingregel', 'wortel_in_een_verhaal', 4, 0, $stap$De hoogte is $h(t) = 10\sqrt{t + 3} = 10(t + 3)^{1/2}$. De stijgsnelheid is $h'(t)$. Je zoekt die op $t = 1$.$stap$),
  ('h6_kettingregel', 'wortel_in_een_verhaal', 4, 1, $stap$Kettingregel: $h'(t) = 10 \cdot \dfrac{1}{2} \cdot (t + 3)^{-1/2} = \dfrac{5}{\sqrt{t + 3}}$.$stap$),
  ('h6_kettingregel', 'wortel_in_een_verhaal', 4, 2, $stap$Vul het tijdstip in: $h'(1) = \dfrac{5}{\sqrt{4}} = \dfrac{5}{2}$.$stap$),
  ('h6_kettingregel', 'wortel_in_een_verhaal', 4, 3, $stap$De stijgsnelheid na $1$ seconde is $\dfrac{5}{2}$ meter per seconde.$stap$),
  -- Grootste opbrengst bij x = 4. f(4) = 4, buren 3.
  ('h6_kettingregel', 'wortel_in_een_verhaal', 5, 0, $stap$De opbrengst is $f(x) = 4\sqrt{x} - x = 4x^{1/2} - x$. Je zoekt de $x$ waar die het grootst is, dus waar $f'(x) = 0$, met $x > 0$.$stap$),
  ('h6_kettingregel', 'wortel_in_een_verhaal', 5, 1, $stap$Differentieer: $f'(x) = 4 \cdot \dfrac{1}{2} \cdot x^{-1/2} - 1 = \dfrac{2}{\sqrt{x}} - 1$.$stap$),
  ('h6_kettingregel', 'wortel_in_een_verhaal', 5, 2, $stap$Stel de afgeleide nul: $\dfrac{2}{\sqrt{x}} - 1 = 0$, dus $\sqrt{x} = 2$, dus $x = 4$.$stap$),
  ('h6_kettingregel', 'wortel_in_een_verhaal', 5, 3, $stap$Controle: $f(1) = 3$ en $f(9) = 3$. Allebei lager dan $f(4) = 4$. De opbrengst is het grootst bij $x = 4$.$stap$),
  -- Grootste winst bij x = 9. f(9) = 9, buren 8.
  ('h6_kettingregel', 'wortel_in_een_verhaal', 6, 0, $stap$De winst is $f(x) = 6\sqrt{x} - x$. Je zoekt de $x$ waar die het grootst is, dus waar $f'(x) = 0$.$stap$),
  ('h6_kettingregel', 'wortel_in_een_verhaal', 6, 1, $stap$Differentieer: $f'(x) = \dfrac{3}{\sqrt{x}} - 1$.$stap$),
  ('h6_kettingregel', 'wortel_in_een_verhaal', 6, 2, $stap$Stel de afgeleide nul: $\dfrac{3}{\sqrt{x}} - 1 = 0$, dus $\sqrt{x} = 3$, dus $x = 9$.$stap$),
  ('h6_kettingregel', 'wortel_in_een_verhaal', 6, 3, $stap$Controle: $f(4) = 8$ en $f(16) = 8$. Allebei lager dan $f(9) = 9$. De winst is het grootst bij $x = 9$.$stap$),
  -- Grootste score bij x = 25. f(25) = 25, buren 24.
  ('h6_kettingregel', 'wortel_in_een_verhaal', 7, 0, $stap$De score is $f(x) = 10\sqrt{x} - x$. Je zoekt de $x$ waar die het grootst is, dus waar $f'(x) = 0$.$stap$),
  ('h6_kettingregel', 'wortel_in_een_verhaal', 7, 1, $stap$Differentieer: $f'(x) = \dfrac{5}{\sqrt{x}} - 1$.$stap$),
  ('h6_kettingregel', 'wortel_in_een_verhaal', 7, 2, $stap$Stel de afgeleide nul: $\dfrac{5}{\sqrt{x}} - 1 = 0$, dus $\sqrt{x} = 5$, dus $x = 25$.$stap$),
  ('h6_kettingregel', 'wortel_in_een_verhaal', 7, 3, $stap$Controle: $f(16) = 24$ en $f(36) = 24$. Allebei lager dan $f(25) = 25$. De score is het grootst bij $x = 25$.$stap$),
  -- Kleinste voorraad bij x = 16. f(16) = -16, buren -15.
  ('h6_kettingregel', 'wortel_in_een_verhaal', 8, 0, $stap$De voorraad is $f(x) = x - 8\sqrt{x}$. Je zoekt de $x$ waar die het kleinst is, dus waar $f'(x) = 0$.$stap$),
  ('h6_kettingregel', 'wortel_in_een_verhaal', 8, 1, $stap$Differentieer: $f'(x) = 1 - 8 \cdot \dfrac{1}{2} \cdot x^{-1/2} = 1 - \dfrac{4}{\sqrt{x}}$.$stap$),
  ('h6_kettingregel', 'wortel_in_een_verhaal', 8, 2, $stap$Stel de afgeleide nul: $1 - \dfrac{4}{\sqrt{x}} = 0$, dus $\sqrt{x} = 4$, dus $x = 16$.$stap$),
  ('h6_kettingregel', 'wortel_in_een_verhaal', 8, 3, $stap$Controle: $f(9) = -15$ en $f(25) = -15$. Allebei hoger dan $f(16) = -16$. De voorraad is het kleinst bij $x = 16$.$stap$)
) AS v(topic_slug, cluster_slug, q_order_index, step_order, step_description)
JOIN public.topics_new t
  ON t.site = 'afgeleiden' AND t.slug = v.topic_slug
JOIN public.topic_clusters_new c
  ON c.site = 'afgeleiden' AND c.topic_id = t.id AND c.slug = v.cluster_slug
JOIN public.questions_new q
  ON q.site = 'afgeleiden'
 AND q.topic_id = t.id
 AND q.cluster_id = c.id
 AND q.order_index = v.q_order_index
ON CONFLICT (question_id, step_order) DO NOTHING;

DO $$
DECLARE
  soort text;
  onderwerp text;
  n_opgaven int;
  n_voorvoegsel int;
  n_leeg int;
  n_zonder_stap0 int;
  n_toon_aan int;
  laatste_oud smallint;
  nieuw smallint;
  rij record;
BEGIN
  FOR rij IN
    SELECT *
    FROM (VALUES
      ('h6_machten', 'laagste_of_hoogste_waarde'),
      ('h6_kettingregel', 'wortel_in_een_verhaal')
    ) AS v(onderwerp, soort)
  LOOP
    onderwerp := rij.onderwerp;
    soort := rij.soort;

    SELECT max(c.order_index) INTO laatste_oud
    FROM public.topic_clusters_new c
    JOIN public.topics_new t ON t.id = c.topic_id
    WHERE t.site = 'afgeleiden'
      AND t.slug = onderwerp
      AND c.slug <> soort;

    SELECT c.order_index INTO nieuw
    FROM public.topic_clusters_new c
    JOIN public.topics_new t ON t.id = c.topic_id
    WHERE t.site = 'afgeleiden'
      AND t.slug = onderwerp
      AND c.slug = soort;

    IF laatste_oud IS NULL OR nieuw IS NULL OR nieuw <= laatste_oud THEN
      RAISE EXCEPTION 'soort % staat niet achteraan onderwerp %', soort, onderwerp;
    END IF;

    SELECT count(*),
           count(*) FILTER (WHERE q.answer_prefix IN ('t =', 'x =')),
           count(*) FILTER (WHERE q.answer_prefix IS NULL)
      INTO n_opgaven, n_voorvoegsel, n_leeg
    FROM public.questions_new q
    JOIN public.topic_clusters_new c ON c.id = q.cluster_id
    JOIN public.topics_new t ON t.id = q.topic_id
    WHERE t.site = 'afgeleiden'
      AND t.slug = onderwerp
      AND c.slug = soort;

    SELECT count(*) INTO n_zonder_stap0
    FROM public.questions_new q
    JOIN public.topic_clusters_new c ON c.id = q.cluster_id
    JOIN public.topics_new t ON t.id = q.topic_id
    WHERE t.site = 'afgeleiden'
      AND t.slug = onderwerp
      AND c.slug = soort
      AND NOT EXISTS (
        SELECT 1 FROM public.question_steps_new s
        WHERE s.question_id = q.id AND s.step_order = 0
      );

    SELECT count(*) INTO n_toon_aan
    FROM public.questions_new q
    JOIN public.topic_clusters_new c ON c.id = q.cluster_id
    JOIN public.topics_new t ON t.id = q.topic_id
    WHERE t.site = 'afgeleiden'
      AND t.slug = onderwerp
      AND c.slug = soort
      AND q.latex_body ILIKE '%toon aan%';

    IF n_opgaven < 8 OR n_voorvoegsel <> 4 OR n_leeg <> 4
       OR n_zonder_stap0 <> 0 OR n_toon_aan <> 0 THEN
      RAISE EXCEPTION
        'soort % klopt niet: opgaven %, met voorvoegsel %, leeg %, zonder stap 0 %, toon aan %',
        soort, n_opgaven, n_voorvoegsel, n_leeg, n_zonder_stap0, n_toon_aan;
    END IF;
  END LOOP;
END $$;

COMMIT;
