-- Verhaaltjes achteraan termsgewijs differentiëren (hoofdstuk 2).
-- Drie eigen soorten, elk 8 opgaven, half om half.
-- Antwoord is het kale getal. Bij een tijdstip of een x staat t = of x =
-- in answer_prefix. Bij een waarde blijft dat veld leeg.
-- Herhaalbaar: een tweede keer draaien voegt niets dubbel toe.

BEGIN;

INSERT INTO public.topic_clusters_new (site, topic_id, slug, title, order_index)
SELECT 'afgeleiden', t.id, v.slug, v.title, v.order_index
FROM public.topics_new t
CROSS JOIN (VALUES
  ('hoogste_of_laagste_punt', 'Hoogste of laagste punt', 2::smallint),
  ('snelheid', 'Snelheid', 3::smallint),
  ('grootste_oppervlakte', 'Grootste oppervlakte', 4::smallint)
) AS v(slug, title, order_index)
WHERE t.site = 'afgeleiden'
  AND t.slug = 'h2_termsgewijs'
ON CONFLICT (topic_id, slug) DO NOTHING;

-- Kernniveau: difficulty 1. De functie staat in de zin, behalve bij de rechthoek.
INSERT INTO public.questions_new (
  site, topic_id, cluster_id, latex_body, answer, latex_answer,
  difficulty, is_ai_generated, order_index, answer_alternatives, answer_prefix
)
SELECT
  'afgeleiden', t.id, c.id, v.latex_body, v.answer, v.answer,
  1, false, v.order_index, '{}'::text[], v.answer_prefix
FROM (VALUES
  -- Hoogste of laagste punt: oneven = wanneer, even = hoe groot.
  (
    'hoogste_of_laagste_punt', 1,
    $vraag$Een bal wordt omhoog gegooid. De hoogte in meter na $t$ seconden is $h(t) = -5t^{2} + 20t$. Na hoeveel seconden is de bal het hoogst?$vraag$,
    '2', 't ='
  ),
  (
    'hoogste_of_laagste_punt', 2,
    $vraag$Een bal wordt omhoog gegooid. De hoogte in meter na $t$ seconden is $h(t) = -5t^{2} + 30t$. Hoe groot is de grootste hoogte, in meter?$vraag$,
    '45', NULL
  ),
  (
    'hoogste_of_laagste_punt', 3,
    $vraag$Een vuurpijl gaat omhoog. De hoogte in meter na $t$ seconden is $h(t) = -4t^{2} + 32t$. Na hoeveel seconden is de pijl het hoogst?$vraag$,
    '4', 't ='
  ),
  (
    'hoogste_of_laagste_punt', 4,
    $vraag$Een fontein spuit water omhoog. De hoogte in meter na $t$ seconden is $h(t) = -2t^{2} + 12t + 3$. Hoe groot is de grootste hoogte, in meter?$vraag$,
    '21', NULL
  ),
  (
    'hoogste_of_laagste_punt', 5,
    $vraag$Een kabel hangt tussen twee palen. De hoogte in meter is $h(x) = x^{2} - 8x + 20$, met $x$ de afstand in meter vanaf de linkerpaal. Bij welke $x$ hangt de kabel het laagst?$vraag$,
    '4', 'x ='
  ),
  (
    'hoogste_of_laagste_punt', 6,
    $vraag$Een dal heeft hoogte $h(x) = 2x^{2} - 8x + 9$ meter, met $x$ de afstand in meter. Hoe groot is de kleinste hoogte, in meter?$vraag$,
    '1', NULL
  ),
  (
    'hoogste_of_laagste_punt', 7,
    $vraag$Een kogel wordt afgeschoten. De hoogte in meter na $t$ seconden is $h(t) = -3t^{2} + 18t + 2$. Na hoeveel seconden is de kogel het hoogst?$vraag$,
    '3', 't ='
  ),
  (
    'hoogste_of_laagste_punt', 8,
    $vraag$De temperatuur in een kas, in graden Celsius, is $f(t) = t^{2} - 10t + 40$. Hierbij is $t$ het aantal uren na middernacht. Hoe groot is de laagste temperatuur, in graden Celsius?$vraag$,
    '15', NULL
  ),
  -- Snelheid: oneven = hoe groot op een tijdstip, even = op welk tijdstip.
  (
    'snelheid', 1,
    $vraag$Een auto rijdt. De afgelegde weg in meter na $t$ seconden is $s(t) = 3t^{2} + 2t$. Hoe groot is de snelheid na $2$ seconden, in meter per seconde?$vraag$,
    '14', NULL
  ),
  (
    'snelheid', 2,
    $vraag$Een scooter rijdt. De afgelegde weg in meter na $t$ seconden is $s(t) = 2t^{2} + 3t$. Na hoeveel seconden is de snelheid $11$ meter per seconde?$vraag$,
    '2', 't ='
  ),
  (
    'snelheid', 3,
    $vraag$Een fietser rijdt. De afgelegde weg in meter na $t$ seconden is $s(t) = 4t^{2} - t$. Hoe groot is de snelheid na $3$ seconden, in meter per seconde?$vraag$,
    '23', NULL
  ),
  (
    'snelheid', 4,
    $vraag$Een hardloper rent. De afgelegde weg in meter na $t$ seconden is $s(t) = t^{2} + 4t$. Na hoeveel seconden is de snelheid $10$ meter per seconde?$vraag$,
    '3', 't ='
  ),
  (
    'snelheid', 5,
    $vraag$Een bal rolt weg. De afgelegde weg in meter na $t$ seconden is $s(t) = -2t^{2} + 20t$. Hoe groot is de snelheid na $1$ seconde, in meter per seconde?$vraag$,
    '16', NULL
  ),
  (
    'snelheid', 6,
    $vraag$Een kar remt af. De afgelegde weg in meter na $t$ seconden is $s(t) = -t^{2} + 16t$. Na hoeveel seconden is de snelheid $6$ meter per seconde?$vraag$,
    '5', 't ='
  ),
  (
    'snelheid', 7,
    $vraag$Een wandelaar loopt. De afgelegde weg in meter na $t$ seconden is $s(t) = t^{2} + 5t$. Hoe groot is de snelheid na $4$ seconden, in meter per seconde?$vraag$,
    '13', NULL
  ),
  (
    'snelheid', 8,
    $vraag$Een drone vliegt. De afgelegde weg in meter na $t$ seconden is $s(t) = 2t^{2} - 6t$. Na hoeveel seconden is de snelheid $10$ meter per seconde?$vraag$,
    '4', 't ='
  ),
  -- Grootste oppervlakte: de leerling haalt de functie zelf uit het verhaal.
  -- Oneven = welke breedte, even = hoe groot is de oppervlakte.
  (
    'grootste_oppervlakte', 1,
    $vraag$Je hebt $20$ meter hek. Daarmee maak je een rechthoekige ren tegen een muur. De muur is de vierde kant, daar komt geen hek. De breedte $x$ staat loodrecht op de muur. Welke breedte, in meter, geeft de grootste oppervlakte?$vraag$,
    '5', 'x ='
  ),
  (
    'grootste_oppervlakte', 2,
    $vraag$Je hebt $24$ meter hek. Daarmee maak je een rechthoekige moestuin tegen een schutting. De schutting is één kant, daar komt geen hek. Noem de breedte loodrecht op de schutting $x$ meter. Hoe groot is de grootste oppervlakte, in vierkante meter?$vraag$,
    '72', NULL
  ),
  (
    'grootste_oppervlakte', 3,
    $vraag$Je hebt $28$ meter gaas. Daarmee zet je een rechthoekig hok tegen een schuur. De schuur is één kant, daar komt geen gaas. De breedte $x$ staat loodrecht op de schuur. Welke breedte, in meter, geeft de grootste oppervlakte?$vraag$,
    '7', 'x ='
  ),
  (
    'grootste_oppervlakte', 4,
    $vraag$Je hebt $32$ meter hek. Daarmee maak je een rechthoekige speelplaats tegen een gebouw. Het gebouw is één kant, daar komt geen hek. Noem de breedte loodrecht op het gebouw $x$ meter. Hoe groot is de grootste oppervlakte, in vierkante meter?$vraag$,
    '128', NULL
  ),
  (
    'grootste_oppervlakte', 5,
    $vraag$Je hebt $40$ meter afrastering. Daarmee maak je een rechthoekige wei tegen een sloot. Langs de sloot komt geen hek. De breedte $x$ staat loodrecht op de sloot. Welke breedte, in meter, geeft de grootste oppervlakte?$vraag$,
    '10', 'x ='
  ),
  (
    'grootste_oppervlakte', 6,
    $vraag$Je hebt $48$ meter gaas. Daarmee maak je een rechthoekig weitje tegen een dijk. Langs de dijk komt geen gaas. Noem de breedte loodrecht op de dijk $x$ meter. Hoe groot is de grootste oppervlakte, in vierkante meter?$vraag$,
    '288', NULL
  ),
  (
    'grootste_oppervlakte', 7,
    $vraag$Je hebt $16$ meter lint. Daarmee baken je een rechthoekig terras af tegen een huis. Het huis is één kant, daar komt geen lint. De breedte $x$ staat loodrecht op het huis. Welke breedte, in meter, geeft de grootste oppervlakte?$vraag$,
    '4', 'x ='
  ),
  (
    'grootste_oppervlakte', 8,
    $vraag$Je hebt $12$ meter hek. Daarmee maak je een rechthoekig perk tegen een muur. De muur is één kant, daar komt geen hek. Noem de breedte loodrecht op de muur $x$ meter. Hoe groot is de grootste oppervlakte, in vierkante meter?$vraag$,
    '18', NULL
  )
) AS v(cluster_slug, order_index, latex_body, answer, answer_prefix)
JOIN public.topics_new t
  ON t.site = 'afgeleiden' AND t.slug = 'h2_termsgewijs'
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
  -- Hoogste punt, t = 2. h = -5t^2 + 20t, h' = -10t + 20.
  ('hoogste_of_laagste_punt', 1, 0, $stap$De hoogte is $h(t) = -5t^{2} + 20t$. Je zoekt het tijdstip waarop de hoogte het grootst is. Dat is waar $h'(t) = 0$.$stap$),
  ('hoogste_of_laagste_punt', 1, 1, $stap$Differentieer termsgewijs: $h'(t) = -10t + 20$.$stap$),
  ('hoogste_of_laagste_punt', 1, 2, $stap$Stel de afgeleide nul: $-10t + 20 = 0$, dus $t = 2$.$stap$),
  ('hoogste_of_laagste_punt', 1, 3, $stap$Controle: $h(1) = 15$ en $h(3) = 15$. Allebei lager dan $h(2) = 20$. De bal is het hoogst na $2$ seconden.$stap$),
  -- Grootste hoogte 45. Top bij t = 3.
  ('hoogste_of_laagste_punt', 2, 0, $stap$De hoogte is $h(t) = -5t^{2} + 30t$. Je zoekt de grootste hoogte. Eerst het tijdstip waar $h'(t) = 0$, daarna de hoogte daar.$stap$),
  ('hoogste_of_laagste_punt', 2, 1, $stap$Differentieer termsgewijs: $h'(t) = -10t + 30$.$stap$),
  ('hoogste_of_laagste_punt', 2, 2, $stap$Stel de afgeleide nul: $-10t + 30 = 0$, dus $t = 3$.$stap$),
  ('hoogste_of_laagste_punt', 2, 3, $stap$Vul in: $h(3) = -5 \cdot 9 + 30 \cdot 3 = -45 + 90 = 45$.$stap$),
  ('hoogste_of_laagste_punt', 2, 4, $stap$Controle: $h(2) = 40$ en $h(4) = 40$. Allebei lager dan $45$. De grootste hoogte is $45$ meter.$stap$),
  -- Hoogste punt, t = 4. h' = -8t + 32.
  ('hoogste_of_laagste_punt', 3, 0, $stap$De hoogte is $h(t) = -4t^{2} + 32t$. Je zoekt het tijdstip waarop de pijl het hoogst is, dus waar $h'(t) = 0$.$stap$),
  ('hoogste_of_laagste_punt', 3, 1, $stap$Differentieer termsgewijs: $h'(t) = -8t + 32$.$stap$),
  ('hoogste_of_laagste_punt', 3, 2, $stap$Stel de afgeleide nul: $-8t + 32 = 0$, dus $t = 4$.$stap$),
  ('hoogste_of_laagste_punt', 3, 3, $stap$Controle: $h(3) = 60$ en $h(5) = 60$. Allebei lager dan $h(4) = 64$. De pijl is het hoogst na $4$ seconden.$stap$),
  -- Grootste hoogte 21. Top bij t = 3.
  ('hoogste_of_laagste_punt', 4, 0, $stap$De hoogte is $h(t) = -2t^{2} + 12t + 3$. Je zoekt de grootste hoogte. Eerst waar $h'(t) = 0$.$stap$),
  ('hoogste_of_laagste_punt', 4, 1, $stap$Differentieer termsgewijs: $h'(t) = -4t + 12$.$stap$),
  ('hoogste_of_laagste_punt', 4, 2, $stap$Stel de afgeleide nul: $-4t + 12 = 0$, dus $t = 3$.$stap$),
  ('hoogste_of_laagste_punt', 4, 3, $stap$Vul in: $h(3) = -2 \cdot 9 + 12 \cdot 3 + 3 = -18 + 36 + 3 = 21$.$stap$),
  ('hoogste_of_laagste_punt', 4, 4, $stap$Controle: $h(2) = 19$ en $h(4) = 19$. Allebei lager dan $21$. De grootste hoogte is $21$ meter.$stap$),
  -- Laagste punt, x = 4. h' = 2x - 8, h(4) = 4.
  ('hoogste_of_laagste_punt', 5, 0, $stap$De hoogte is $h(x) = x^{2} - 8x + 20$. Je zoekt de $x$ waar de kabel het laagst hangt, dus waar $h'(x) = 0$.$stap$),
  ('hoogste_of_laagste_punt', 5, 1, $stap$Differentieer termsgewijs: $h'(x) = 2x - 8$.$stap$),
  ('hoogste_of_laagste_punt', 5, 2, $stap$Stel de afgeleide nul: $2x - 8 = 0$, dus $x = 4$.$stap$),
  ('hoogste_of_laagste_punt', 5, 3, $stap$Controle: $h(3) = 5$ en $h(5) = 5$. Allebei hoger dan $h(4) = 4$. De kabel hangt het laagst bij $x = 4$.$stap$),
  -- Kleinste hoogte 1. Top bij x = 2.
  ('hoogste_of_laagste_punt', 6, 0, $stap$De hoogte is $h(x) = 2x^{2} - 8x + 9$. Je zoekt de kleinste hoogte. Eerst waar $h'(x) = 0$.$stap$),
  ('hoogste_of_laagste_punt', 6, 1, $stap$Differentieer termsgewijs: $h'(x) = 4x - 8$.$stap$),
  ('hoogste_of_laagste_punt', 6, 2, $stap$Stel de afgeleide nul: $4x - 8 = 0$, dus $x = 2$.$stap$),
  ('hoogste_of_laagste_punt', 6, 3, $stap$Vul in: $h(2) = 2 \cdot 4 - 8 \cdot 2 + 9 = 8 - 16 + 9 = 1$.$stap$),
  ('hoogste_of_laagste_punt', 6, 4, $stap$Controle: $h(1) = 3$ en $h(3) = 3$. Allebei hoger dan $1$. De kleinste hoogte is $1$ meter.$stap$),
  -- Hoogste punt, t = 3. h' = -6t + 18, h(3) = 29.
  ('hoogste_of_laagste_punt', 7, 0, $stap$De hoogte is $h(t) = -3t^{2} + 18t + 2$. Je zoekt het tijdstip van de grootste hoogte, dus waar $h'(t) = 0$.$stap$),
  ('hoogste_of_laagste_punt', 7, 1, $stap$Differentieer termsgewijs: $h'(t) = -6t + 18$.$stap$),
  ('hoogste_of_laagste_punt', 7, 2, $stap$Stel de afgeleide nul: $-6t + 18 = 0$, dus $t = 3$.$stap$),
  ('hoogste_of_laagste_punt', 7, 3, $stap$Controle: $h(2) = 26$ en $h(4) = 26$. Allebei lager dan $h(3) = 29$. De kogel is het hoogst na $3$ seconden.$stap$),
  -- Laagste temperatuur 15. Top bij t = 5.
  ('hoogste_of_laagste_punt', 8, 0, $stap$De temperatuur is $f(t) = t^{2} - 10t + 40$. Je zoekt de laagste temperatuur. Eerst waar $f'(t) = 0$.$stap$),
  ('hoogste_of_laagste_punt', 8, 1, $stap$Differentieer termsgewijs: $f'(t) = 2t - 10$.$stap$),
  ('hoogste_of_laagste_punt', 8, 2, $stap$Stel de afgeleide nul: $2t - 10 = 0$, dus $t = 5$.$stap$),
  ('hoogste_of_laagste_punt', 8, 3, $stap$Vul in: $f(5) = 25 - 50 + 40 = 15$.$stap$),
  ('hoogste_of_laagste_punt', 8, 4, $stap$Controle: $f(4) = 16$ en $f(6) = 16$. Allebei hoger dan $15$. De laagste temperatuur is $15$ graden Celsius.$stap$),

  -- Snelheid 14 op t = 2. s' = 6t + 2.
  ('snelheid', 1, 0, $stap$De plaats is $s(t) = 3t^{2} + 2t$. De snelheid is de afgeleide $s'(t)$. Je zoekt de snelheid op $t = 2$.$stap$),
  ('snelheid', 1, 1, $stap$Differentieer termsgewijs: $s'(t) = 6t + 2$.$stap$),
  ('snelheid', 1, 2, $stap$Vul het tijdstip in: $s'(2) = 6 \cdot 2 + 2 = 14$.$stap$),
  ('snelheid', 1, 3, $stap$De snelheid na $2$ seconden is $14$ meter per seconde.$stap$),
  -- Snelheid 11 geeft t = 2. s' = 4t + 3.
  ('snelheid', 2, 0, $stap$De plaats is $s(t) = 2t^{2} + 3t$. De snelheid is $s'(t)$. Je zoekt het tijdstip waarop die snelheid $11$ meter per seconde is.$stap$),
  ('snelheid', 2, 1, $stap$Differentieer termsgewijs: $s'(t) = 4t + 3$.$stap$),
  ('snelheid', 2, 2, $stap$Stel gelijk aan $11$: $4t + 3 = 11$, dus $4t = 8$ en $t = 2$.$stap$),
  ('snelheid', 2, 3, $stap$Controle: $s'(2) = 4 \cdot 2 + 3 = 11$. Na $2$ seconden is de snelheid $11$ meter per seconde.$stap$),
  -- Snelheid 23 op t = 3. s' = 8t - 1.
  ('snelheid', 3, 0, $stap$De plaats is $s(t) = 4t^{2} - t$. De snelheid is $s'(t)$. Je zoekt de snelheid op $t = 3$.$stap$),
  ('snelheid', 3, 1, $stap$Differentieer termsgewijs: $s'(t) = 8t - 1$.$stap$),
  ('snelheid', 3, 2, $stap$Vul het tijdstip in: $s'(3) = 8 \cdot 3 - 1 = 23$.$stap$),
  ('snelheid', 3, 3, $stap$De snelheid na $3$ seconden is $23$ meter per seconde.$stap$),
  -- Snelheid 10 geeft t = 3. s' = 2t + 4.
  ('snelheid', 4, 0, $stap$De plaats is $s(t) = t^{2} + 4t$. De snelheid is $s'(t)$. Je zoekt het tijdstip waarop die snelheid $10$ meter per seconde is.$stap$),
  ('snelheid', 4, 1, $stap$Differentieer termsgewijs: $s'(t) = 2t + 4$.$stap$),
  ('snelheid', 4, 2, $stap$Stel gelijk aan $10$: $2t + 4 = 10$, dus $2t = 6$ en $t = 3$.$stap$),
  ('snelheid', 4, 3, $stap$Controle: $s'(3) = 2 \cdot 3 + 4 = 10$. Na $3$ seconden is de snelheid $10$ meter per seconde.$stap$),
  -- Snelheid 16 op t = 1. s' = -4t + 20.
  ('snelheid', 5, 0, $stap$De plaats is $s(t) = -2t^{2} + 20t$. De snelheid is $s'(t)$. Je zoekt de snelheid op $t = 1$.$stap$),
  ('snelheid', 5, 1, $stap$Differentieer termsgewijs: $s'(t) = -4t + 20$.$stap$),
  ('snelheid', 5, 2, $stap$Vul het tijdstip in: $s'(1) = -4 \cdot 1 + 20 = 16$.$stap$),
  ('snelheid', 5, 3, $stap$De snelheid na $1$ seconde is $16$ meter per seconde.$stap$),
  -- Snelheid 6 geeft t = 5. s' = -2t + 16.
  ('snelheid', 6, 0, $stap$De plaats is $s(t) = -t^{2} + 16t$. De snelheid is $s'(t)$. Je zoekt het tijdstip waarop die snelheid $6$ meter per seconde is.$stap$),
  ('snelheid', 6, 1, $stap$Differentieer termsgewijs: $s'(t) = -2t + 16$.$stap$),
  ('snelheid', 6, 2, $stap$Stel gelijk aan $6$: $-2t + 16 = 6$, dus $-2t = -10$ en $t = 5$.$stap$),
  ('snelheid', 6, 3, $stap$Controle: $s'(5) = -2 \cdot 5 + 16 = 6$. Na $5$ seconden is de snelheid $6$ meter per seconde.$stap$),
  -- Snelheid 13 op t = 4. s' = 2t + 5.
  ('snelheid', 7, 0, $stap$De plaats is $s(t) = t^{2} + 5t$. De snelheid is $s'(t)$. Je zoekt de snelheid op $t = 4$.$stap$),
  ('snelheid', 7, 1, $stap$Differentieer termsgewijs: $s'(t) = 2t + 5$.$stap$),
  ('snelheid', 7, 2, $stap$Vul het tijdstip in: $s'(4) = 2 \cdot 4 + 5 = 13$.$stap$),
  ('snelheid', 7, 3, $stap$De snelheid na $4$ seconden is $13$ meter per seconde.$stap$),
  -- Snelheid 10 geeft t = 4. s' = 4t - 6.
  ('snelheid', 8, 0, $stap$De plaats is $s(t) = 2t^{2} - 6t$. De snelheid is $s'(t)$. Je zoekt het tijdstip waarop die snelheid $10$ meter per seconde is.$stap$),
  ('snelheid', 8, 1, $stap$Differentieer termsgewijs: $s'(t) = 4t - 6$.$stap$),
  ('snelheid', 8, 2, $stap$Stel gelijk aan $10$: $4t - 6 = 10$, dus $4t = 16$ en $t = 4$.$stap$),
  ('snelheid', 8, 3, $stap$Controle: $s'(4) = 4 \cdot 4 - 6 = 10$. Na $4$ seconden is de snelheid $10$ meter per seconde.$stap$),

  -- 20 m hek, x = 5, A(5) = 50. Buren 48.
  ('grootste_oppervlakte', 1, 0, $stap$Er is $20$ meter hek, drie kanten, de muur is de vierde. De breedte $x$ staat loodrecht op de muur. De lengte langs de muur is $20 - 2x$. De oppervlakte is $A(x) = x(20 - 2x) = 20x - 2x^{2}$. Je zoekt de breedte waar $A$ het grootst is, dus waar $A'(x) = 0$.$stap$),
  ('grootste_oppervlakte', 1, 1, $stap$Differentieer termsgewijs: $A'(x) = 20 - 4x$.$stap$),
  ('grootste_oppervlakte', 1, 2, $stap$Stel de afgeleide nul: $20 - 4x = 0$, dus $x = 5$.$stap$),
  ('grootste_oppervlakte', 1, 3, $stap$Controle: bij breedte $4$ is de oppervlakte $48$, bij breedte $6$ ook $48$. Allebei lager dan $A(5) = 50$. De grootste oppervlakte hoort bij breedte $5$ meter.$stap$),
  -- 24 m hek, x = 6, A = 72. Buren 70.
  ('grootste_oppervlakte', 2, 0, $stap$Er is $24$ meter hek, drie kanten, de schutting is de vierde. De breedte $x$ staat loodrecht op de schutting. De lengte langs de schutting is $24 - 2x$. De oppervlakte is $A(x) = 24x - 2x^{2}$. Je zoekt de grootste oppervlakte. Eerst waar $A'(x) = 0$.$stap$),
  ('grootste_oppervlakte', 2, 1, $stap$Differentieer termsgewijs: $A'(x) = 24 - 4x$.$stap$),
  ('grootste_oppervlakte', 2, 2, $stap$Stel de afgeleide nul: $24 - 4x = 0$, dus $x = 6$. De lengte langs de schutting is dan $24 - 12 = 12$.$stap$),
  ('grootste_oppervlakte', 2, 3, $stap$De oppervlakte is $A(6) = 6 \cdot 12 = 72$.$stap$),
  ('grootste_oppervlakte', 2, 4, $stap$Controle: bij breedte $5$ is de oppervlakte $70$, bij breedte $7$ ook $70$. Allebei lager dan $72$. De grootste oppervlakte is $72$ vierkante meter.$stap$),
  -- 28 m gaas, x = 7, A = 98. Buren 96.
  ('grootste_oppervlakte', 3, 0, $stap$Er is $28$ meter gaas, drie kanten, de schuur is de vierde. De breedte $x$ staat loodrecht op de schuur. De lengte langs de schuur is $28 - 2x$. De oppervlakte is $A(x) = 28x - 2x^{2}$. Je zoekt de breedte waar $A'(x) = 0$.$stap$),
  ('grootste_oppervlakte', 3, 1, $stap$Differentieer termsgewijs: $A'(x) = 28 - 4x$.$stap$),
  ('grootste_oppervlakte', 3, 2, $stap$Stel de afgeleide nul: $28 - 4x = 0$, dus $x = 7$.$stap$),
  ('grootste_oppervlakte', 3, 3, $stap$Controle: bij breedte $6$ is de oppervlakte $96$, bij breedte $8$ ook $96$. Allebei lager dan $A(7) = 98$. De grootste oppervlakte hoort bij breedte $7$ meter.$stap$),
  -- 32 m hek, x = 8, A = 128. Buren 126.
  ('grootste_oppervlakte', 4, 0, $stap$Er is $32$ meter hek, drie kanten, het gebouw is de vierde. De breedte $x$ staat loodrecht op het gebouw. De lengte langs het gebouw is $32 - 2x$. De oppervlakte is $A(x) = 32x - 2x^{2}$. Je zoekt de grootste oppervlakte. Eerst waar $A'(x) = 0$.$stap$),
  ('grootste_oppervlakte', 4, 1, $stap$Differentieer termsgewijs: $A'(x) = 32 - 4x$.$stap$),
  ('grootste_oppervlakte', 4, 2, $stap$Stel de afgeleide nul: $32 - 4x = 0$, dus $x = 8$. De lengte langs het gebouw is dan $32 - 16 = 16$.$stap$),
  ('grootste_oppervlakte', 4, 3, $stap$De oppervlakte is $A(8) = 8 \cdot 16 = 128$.$stap$),
  ('grootste_oppervlakte', 4, 4, $stap$Controle: bij breedte $7$ is de oppervlakte $126$, bij breedte $9$ ook $126$. Allebei lager dan $128$. De grootste oppervlakte is $128$ vierkante meter.$stap$),
  -- 40 m afrastering, x = 10, A = 200. Buren 198.
  ('grootste_oppervlakte', 5, 0, $stap$Er is $40$ meter afrastering, drie kanten, de sloot is de vierde. De breedte $x$ staat loodrecht op de sloot. De lengte langs de sloot is $40 - 2x$. De oppervlakte is $A(x) = 40x - 2x^{2}$. Je zoekt de breedte waar $A'(x) = 0$.$stap$),
  ('grootste_oppervlakte', 5, 1, $stap$Differentieer termsgewijs: $A'(x) = 40 - 4x$.$stap$),
  ('grootste_oppervlakte', 5, 2, $stap$Stel de afgeleide nul: $40 - 4x = 0$, dus $x = 10$.$stap$),
  ('grootste_oppervlakte', 5, 3, $stap$Controle: bij breedte $9$ is de oppervlakte $198$, bij breedte $11$ ook $198$. Allebei lager dan $A(10) = 200$. De grootste oppervlakte hoort bij breedte $10$ meter.$stap$),
  -- 48 m gaas, x = 12, A = 288. Buren 286.
  ('grootste_oppervlakte', 6, 0, $stap$Er is $48$ meter gaas, drie kanten, de dijk is de vierde. De breedte $x$ staat loodrecht op de dijk. De lengte langs de dijk is $48 - 2x$. De oppervlakte is $A(x) = 48x - 2x^{2}$. Je zoekt de grootste oppervlakte. Eerst waar $A'(x) = 0$.$stap$),
  ('grootste_oppervlakte', 6, 1, $stap$Differentieer termsgewijs: $A'(x) = 48 - 4x$.$stap$),
  ('grootste_oppervlakte', 6, 2, $stap$Stel de afgeleide nul: $48 - 4x = 0$, dus $x = 12$. De lengte langs de dijk is dan $48 - 24 = 24$.$stap$),
  ('grootste_oppervlakte', 6, 3, $stap$De oppervlakte is $A(12) = 12 \cdot 24 = 288$.$stap$),
  ('grootste_oppervlakte', 6, 4, $stap$Controle: bij breedte $11$ is de oppervlakte $286$, bij breedte $13$ ook $286$. Allebei lager dan $288$. De grootste oppervlakte is $288$ vierkante meter.$stap$),
  -- 16 m lint, x = 4, A = 32. Buren 30.
  ('grootste_oppervlakte', 7, 0, $stap$Er is $16$ meter lint, drie kanten, het huis is de vierde. De breedte $x$ staat loodrecht op het huis. De lengte langs het huis is $16 - 2x$. De oppervlakte is $A(x) = 16x - 2x^{2}$. Je zoekt de breedte waar $A'(x) = 0$.$stap$),
  ('grootste_oppervlakte', 7, 1, $stap$Differentieer termsgewijs: $A'(x) = 16 - 4x$.$stap$),
  ('grootste_oppervlakte', 7, 2, $stap$Stel de afgeleide nul: $16 - 4x = 0$, dus $x = 4$.$stap$),
  ('grootste_oppervlakte', 7, 3, $stap$Controle: bij breedte $3$ is de oppervlakte $30$, bij breedte $5$ ook $30$. Allebei lager dan $A(4) = 32$. De grootste oppervlakte hoort bij breedte $4$ meter.$stap$),
  -- 12 m hek, x = 3, A = 18. Buren 16.
  ('grootste_oppervlakte', 8, 0, $stap$Er is $12$ meter hek, drie kanten, de muur is de vierde. De breedte $x$ staat loodrecht op de muur. De lengte langs de muur is $12 - 2x$. De oppervlakte is $A(x) = 12x - 2x^{2}$. Je zoekt de grootste oppervlakte. Eerst waar $A'(x) = 0$.$stap$),
  ('grootste_oppervlakte', 8, 1, $stap$Differentieer termsgewijs: $A'(x) = 12 - 4x$.$stap$),
  ('grootste_oppervlakte', 8, 2, $stap$Stel de afgeleide nul: $12 - 4x = 0$, dus $x = 3$. De lengte langs de muur is dan $12 - 6 = 6$.$stap$),
  ('grootste_oppervlakte', 8, 3, $stap$De oppervlakte is $A(3) = 3 \cdot 6 = 18$.$stap$),
  ('grootste_oppervlakte', 8, 4, $stap$Controle: bij breedte $2$ is de oppervlakte $16$, bij breedte $4$ ook $16$. Allebei lager dan $18$. De grootste oppervlakte is $18$ vierkante meter.$stap$)
) AS v(cluster_slug, q_order_index, step_order, step_description)
JOIN public.topics_new t
  ON t.site = 'afgeleiden' AND t.slug = 'h2_termsgewijs'
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
  n_opgaven int;
  n_voorvoegsel int;
  n_leeg int;
  n_zonder_stap0 int;
  polynoom_volgorde smallint;
  min_nieuw smallint;
BEGIN
  SELECT c.order_index INTO polynoom_volgorde
  FROM public.topic_clusters_new c
  JOIN public.topics_new t ON t.id = c.topic_id
  WHERE t.site = 'afgeleiden'
    AND t.slug = 'h2_termsgewijs'
    AND c.slug = 'polynoom_differentieren';

  SELECT min(c.order_index) INTO min_nieuw
  FROM public.topic_clusters_new c
  JOIN public.topics_new t ON t.id = c.topic_id
  WHERE t.site = 'afgeleiden'
    AND t.slug = 'h2_termsgewijs'
    AND c.slug IN ('hoogste_of_laagste_punt', 'snelheid', 'grootste_oppervlakte');

  IF polynoom_volgorde IS NULL OR min_nieuw IS NULL OR min_nieuw <= polynoom_volgorde THEN
    RAISE EXCEPTION 'nieuwe soorten staan niet achter polynoom differentiëren';
  END IF;

  FOREACH soort IN ARRAY ARRAY['hoogste_of_laagste_punt', 'snelheid', 'grootste_oppervlakte']::text[]
  LOOP
    SELECT count(*),
           count(*) FILTER (WHERE q.answer_prefix IN ('t =', 'x =')),
           count(*) FILTER (WHERE q.answer_prefix IS NULL)
      INTO n_opgaven, n_voorvoegsel, n_leeg
    FROM public.questions_new q
    JOIN public.topic_clusters_new c ON c.id = q.cluster_id
    JOIN public.topics_new t ON t.id = q.topic_id
    WHERE t.site = 'afgeleiden'
      AND t.slug = 'h2_termsgewijs'
      AND c.slug = soort;

    SELECT count(*) INTO n_zonder_stap0
    FROM public.questions_new q
    JOIN public.topic_clusters_new c ON c.id = q.cluster_id
    JOIN public.topics_new t ON t.id = q.topic_id
    WHERE t.site = 'afgeleiden'
      AND t.slug = 'h2_termsgewijs'
      AND c.slug = soort
      AND NOT EXISTS (
        SELECT 1 FROM public.question_steps_new s
        WHERE s.question_id = q.id AND s.step_order = 0
      );

    IF n_opgaven < 8 OR n_voorvoegsel <> 4 OR n_leeg <> 4 OR n_zonder_stap0 <> 0 THEN
      RAISE EXCEPTION
        'soort % klopt niet: opgaven %, met voorvoegsel %, leeg %, zonder stap 0 %',
        soort, n_opgaven, n_voorvoegsel, n_leeg, n_zonder_stap0;
    END IF;
  END LOOP;
END $$;

COMMIT;
