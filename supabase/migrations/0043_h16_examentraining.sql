-- Hoofdstuk 16: Examentraining.
-- Eigen opgaven uit AFG-201, geen examen- of boekopgaven. Geen plaatjes.
-- Zeven soorten, elk acht opgaven. Antwoord is het kale getal of de
-- kale uitdrukking. De tekst voor het vak staat in answer_prefix.
-- Een lijn is y = plus de uitdrukking, zoals de opgaven die voorschrijven.
-- Geen nieuwe nakijkregel. Herhaalbaar: een tweede keer voegt niets dubbel toe.

BEGIN;

INSERT INTO public.chapters (slug, title, book_part, order_index)
VALUES ('h16', 'Examentraining', 4, 16)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.topics_new (slug, title, chapter_id, order_index, is_unlocked_by_default)
SELECT 'h16_examentraining', 'Examenvragen', c.id, 1, false
FROM public.chapters c
WHERE c.slug = 'h16'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index)
SELECT t.id, v.slug, v.title, v.order_index
FROM public.topics_new t
JOIN (VALUES
  ('helling_in_een_punt', 'Helling in een punt', 1::smallint),
  ('raaklijn', 'Raaklijn', 2::smallint),
  ('helling_zoek_x', 'Helling gegeven, zoek de x', 3::smallint),
  ('top', 'Top', 4::smallint),
  ('kleinste_of_grootste', 'Kleinste of grootste waarde', 5::smallint),
  ('loodrechte_lijn', 'Loodrechte lijn', 6::smallint),
  ('buigpunt_en_buigraaklijn', 'Buigpunt en buigraaklijn', 7::smallint)
) AS v(slug, title, order_index)
  ON true
WHERE t.slug = 'h16_examentraining'
ON CONFLICT (topic_id, slug) DO NOTHING;

INSERT INTO public.questions_new (
  topic_id, cluster_id, latex_body, answer, latex_answer,
  difficulty, is_ai_generated, order_index, answer_alternatives, answer_prefix
)
SELECT
  t.id, c.id, v.latex_body, v.answer, v.latex_answer,
  v.difficulty, false, v.order_index, v.alternatives, v.answer_prefix
FROM (VALUES
  (
    'helling_in_een_punt', 1, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = x^{3} - 6x + 1$. Wat is de helling van de grafiek bij $x = 2$?$vraag$,
    '6', '6', NULL::text,
    '{}'::text[]
  ),
  (
    'helling_in_een_punt', 2, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = (3x - 1)(x + 2)$. Wat is de helling van de grafiek bij $x = 1$?$vraag$,
    '11', '11', NULL::text,
    '{}'::text[]
  ),
  (
    'helling_in_een_punt', 3, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = \dfrac{x^{2}}{x + 1}$. Wat is de helling van de grafiek bij $x = 1$?$vraag$,
    '3/4', '\dfrac{3}{4}', NULL::text,
    ARRAY['0,75', '0.75', '(3)/4', '(3)/(4)']::text[]
  ),
  (
    'helling_in_een_punt', 4, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = \ln(2x + 3)$. Wat is de helling van de grafiek bij $x = 1$?$vraag$,
    '2/5', '\dfrac{2}{5}', NULL::text,
    ARRAY['0,4', '0.4', '(2)/5', '(2)/(5)']::text[]
  ),
  (
    'helling_in_een_punt', 5, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = x^{2}e^{x}$. Wat is de helling van de grafiek bij $x = 1$?$vraag$,
    '3e', '3e', NULL::text,
    ARRAY['3e^{1}', 'e*3', '3e^(1)', '3*e']::text[]
  ),
  (
    'helling_in_een_punt', 6, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = \sin(2x)$. Wat is de helling van de grafiek bij $x = \dfrac{\pi}{6}$? De hoek staat in radialen.$vraag$,
    '1', '1', NULL::text,
    '{}'::text[]
  ),
  (
    'helling_in_een_punt', 7, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = \sqrt{x}$. Wat is de helling van de grafiek bij $x = 5$? Rond af op één decimaal.$vraag$,
    '0,2', '0{,}2', NULL::text,
    ARRAY['0.2']::text[]
  ),
  (
    'helling_in_een_punt', 8, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = e^{x/2}$. Wat is de helling van de grafiek bij $x = 1$? Rond af op één decimaal.$vraag$,
    '0,8', '0{,}8', NULL::text,
    ARRAY['0.8']::text[]
  ),
  (
    'raaklijn', 1, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = x^{2} - 5x$. Wat is de helling van de raaklijn aan de grafiek in het punt met $x = 3$?$vraag$,
    '1', '1', NULL::text,
    '{}'::text[]
  ),
  (
    'raaklijn', 2, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = (x - 2)^{3}$. Wat is de helling van de raaklijn aan de grafiek in het punt met $x = 3$?$vraag$,
    '3', '3', NULL::text,
    '{}'::text[]
  ),
  (
    'raaklijn', 3, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = \ln(x)$. Wat is de helling van de raaklijn aan de grafiek in het punt met $x = 3$? Rond af op één decimaal.$vraag$,
    '0,3', '0{,}3', NULL::text,
    ARRAY['0.3']::text[]
  ),
  (
    'raaklijn', 4, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = \cos(x)$. Wat is de helling van de raaklijn aan de grafiek in het punt met $x = 1$? De hoek staat in radialen. Rond af op één decimaal.$vraag$,
    '-0,8', '-0{,}8', NULL::text,
    ARRAY['-0.8']::text[]
  ),
  (
    'raaklijn', 5, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = x^{2}$. Stel de vergelijking op van de raaklijn aan de grafiek in het punt met $x = 1$.$vraag$,
    '2x - 1', '2x - 1', 'y =',
    ARRAY['-1 + 2x', 'y = 2x - 1', 'y=-1+2x']::text[]
  ),
  (
    'raaklijn', 6, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = x^{3} - x$. Stel de vergelijking op van de raaklijn aan de grafiek in het punt met $x = 1$.$vraag$,
    '2x - 2', '2x - 2', 'y =',
    ARRAY['-2 + 2x', 'y = 2x - 2', 'y=-2+2x']::text[]
  ),
  (
    'raaklijn', 7, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = \ln(x)$. Stel de vergelijking op van de raaklijn aan de grafiek in het punt met $x = e$.$vraag$,
    'x/e', '\dfrac{x}{e}', 'y =',
    ARRAY['(1/e)x', 'x*e^{-1}', 'y = x/e', '(x)/(e)', '(x)/e', 'y=(1/e)x', 'y=x*e^{-1}', 'y=(x)/(e)', 'y=(x)/e']::text[]
  ),
  (
    'raaklijn', 8, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = e^{x}$. Stel de vergelijking op van de raaklijn aan de grafiek in het punt met $x = 0$.$vraag$,
    'x + 1', 'x + 1', 'y =',
    ARRAY['1 + x', 'y = x + 1', 'y=1+x']::text[]
  ),
  (
    'helling_zoek_x', 1, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = x^{2} + 3x$. De helling van de grafiek is $4$. Bereken $x$.$vraag$,
    '1/2', '\dfrac{1}{2}', 'x =',
    ARRAY['0,5', '0.5', '(1)/2', '(1)/(2)']::text[]
  ),
  (
    'helling_zoek_x', 2, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = x^{3} - 3x$. De helling van de grafiek is $0$. Bereken de positieve $x$.$vraag$,
    '1', '1', 'x =',
    '{}'::text[]
  ),
  (
    'helling_zoek_x', 3, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = (x - 1)e^{x}$. De helling van de grafiek is $0$. Bereken $x$.$vraag$,
    '0', '0', 'x =',
    '{}'::text[]
  ),
  (
    'helling_zoek_x', 4, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = x^{2} - 6x + 1$. De helling van de grafiek is $-2$. Bereken $x$.$vraag$,
    '2', '2', 'x =',
    '{}'::text[]
  ),
  (
    'helling_zoek_x', 5, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = \dfrac{x}{x + 2}$. De helling van de grafiek is $\dfrac{1}{8}$. Bereken de positieve $x$.$vraag$,
    '2', '2', 'x =',
    '{}'::text[]
  ),
  (
    'helling_zoek_x', 6, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = (2x + 1)^{2}$. De helling van de grafiek is $12$. Bereken $x$.$vraag$,
    '1', '1', 'x =',
    '{}'::text[]
  ),
  (
    'helling_zoek_x', 7, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = x^{3}$. De helling van de grafiek is $5$. Bereken de positieve $x$. Rond af op één decimaal.$vraag$,
    '1,3', '1{,}3', 'x =',
    ARRAY['1.3']::text[]
  ),
  (
    'helling_zoek_x', 8, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = e^{2x}$. De helling van de grafiek is $5$. Bereken $x$. Rond af op één decimaal.$vraag$,
    '0,5', '0{,}5', 'x =',
    ARRAY['0.5']::text[]
  ),
  (
    'top', 1, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = \dfrac{x}{x^{2} + 4}$. Bereken de $x$ van de top. De top is het hoogste punt.$vraag$,
    '2', '2', 'x =',
    '{}'::text[]
  ),
  (
    'top', 2, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = 4\sqrt{x} - x$, met $x \geq 0$. Bereken de $x$ van de top.$vraag$,
    '4', '4', 'x =',
    '{}'::text[]
  ),
  (
    'top', 3, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = 2\ln(x) - x$, met $x > 0$. Bereken de $x$ van de top.$vraag$,
    '2', '2', 'x =',
    '{}'::text[]
  ),
  (
    'top', 4, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = \sin(x) + \sqrt{3}\cos(x)$, op het interval $0 \leq x \leq \pi$. De hoek staat in radialen. Bereken de $x$ van de top.$vraag$,
    'pi/6', '\dfrac{\pi}{6}', 'x =',
    ARRAY['\pi/6', '(1/6)pi', '(pi)/(6)', '(pi)/6', '(1)/(6)pi']::text[]
  ),
  (
    'top', 5, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = \dfrac{x}{x^{2} + 1}$. Bereken de $y$-coördinaat van de top. De top is het hoogste punt.$vraag$,
    '1/2', '\dfrac{1}{2}', NULL::text,
    ARRAY['0,5', '0.5', '(1)/2', '(1)/(2)']::text[]
  ),
  (
    'top', 6, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = 6\sqrt{x} - x$, met $x \geq 0$. Bereken de $y$-coördinaat van de top.$vraag$,
    '9', '9', NULL::text,
    '{}'::text[]
  ),
  (
    'top', 7, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = \ln(x) - x$, met $x > 0$. Bereken de $y$-coördinaat van de top.$vraag$,
    '-1', '-1', NULL::text,
    ARRAY['(-1)']::text[]
  ),
  (
    'top', 8, 2,
    $vraag$De functie $f$ is gegeven door $f(x) = \sin(x) - \cos(x)$, op het interval $0 \leq x \leq \pi$. De hoek staat in radialen. Bereken de $y$-coördinaat van de top.$vraag$,
    'sqrt(2)', '\sqrt{2}', NULL::text,
    ARRAY['√2', '2^{1/2}', '2^(1/2)']::text[]
  ),
  (
    'kleinste_of_grootste', 1, 2,
    $vraag$Een plant neemt meststof op. De opname in gram per dag is $M = xe^{-x/2}$, met $x$ de tijd in dagen en $x \geq 0$. Op welke dag is de opname het grootst?$vraag$,
    '2', '2', 'x =',
    '{}'::text[]
  ),
  (
    'kleinste_of_grootste', 2, 2,
    $vraag$De kosten in euro per stuk bij een productie van $x$ stuks zijn $K = \dfrac{x^{2} + 9}{x}$, met $x > 0$. Bij welke $x$ zijn de kosten per stuk het kleinst?$vraag$,
    '3', '3', 'x =',
    '{}'::text[]
  ),
  (
    'kleinste_of_grootste', 3, 2,
    $vraag$De temperatuur in graden Celsius op plek $x$ (in meter) is $T = 20 + 8e^{-(x - 4)^{2}}$. Bij welke $x$ is de temperatuur het hoogst?$vraag$,
    '4', '4', 'x =',
    '{}'::text[]
  ),
  (
    'kleinste_of_grootste', 4, 2,
    $vraag$De hoeveelheid van een stof, in gram, na $x$ uur is $A = x^{2}e^{-x}$, met $x \geq 0$. Op welk tijdstip is de hoeveelheid het grootst?$vraag$,
    '2', '2', 'x =',
    '{}'::text[]
  ),
  (
    'kleinste_of_grootste', 5, 2,
    $vraag$Een plant neemt meststof op. De opname in gram per dag is $M = xe^{-x/3}$, met $x$ de tijd in dagen en $x \geq 0$. Hoe groot is de grootste opname, in gram per dag?$vraag$,
    '3/e', '\dfrac{3}{e}', NULL::text,
    ARRAY['3e^{-1}', '3e^(-1)', '(3)/e', '(3)/(e)']::text[]
  ),
  (
    'kleinste_of_grootste', 6, 2,
    $vraag$De kosten in euro per stuk bij een productie van $x$ stuks zijn $K = \dfrac{x^{2} + 4}{x}$, met $x > 0$. Hoe groot zijn de kleinste kosten per stuk, in euro?$vraag$,
    '4', '4', NULL::text,
    '{}'::text[]
  ),
  (
    'kleinste_of_grootste', 7, 2,
    $vraag$De temperatuur in graden Celsius op plek $x$ (in meter) is $T = 15 + 6e^{-(x - 1)^{2}}$. Hoe hoog is de hoogste temperatuur, in graden Celsius?$vraag$,
    '21', '21', NULL::text,
    '{}'::text[]
  ),
  (
    'kleinste_of_grootste', 8, 2,
    $vraag$De hoeveelheid van een stof, in gram, na $x$ uur is $A = x^{2}e^{-2x}$, met $x \geq 0$. Hoe groot is de grootste hoeveelheid, in gram?$vraag$,
    '1/e^2', '\dfrac{1}{e^{2}}', NULL::text,
    ARRAY['e^{-2}', 'e^(-2)', '1/e^{2}', '(1)/(e^2)', '(1)/(e^{2})']::text[]
  ),
  (
    'loodrechte_lijn', 1, 3,
    $vraag$De grafiek van $f(x) = x^{2}$ heeft in het punt met $x = 1$ een raaklijn. De lijn door dat punt die loodrecht op de raaklijn staat, snijdt de grafiek nog een keer. Bereken de $x$ van dat andere snijpunt.$vraag$,
    '-3/2', '-\dfrac{3}{2}', 'x =',
    ARRAY['-1,5', '-1.5', '(-3)/2', '-(3)/(2)', '-(3)/2', '(-3)/(2)']::text[]
  ),
  (
    'loodrechte_lijn', 2, 3,
    $vraag$De grafiek van $f(x) = x^{2}$ heeft in het punt met $x = 2$ een raaklijn. De lijn door dat punt die loodrecht op de raaklijn staat, snijdt de grafiek nog een keer. Bereken de $x$ van dat andere snijpunt.$vraag$,
    '-9/4', '-\dfrac{9}{4}', 'x =',
    ARRAY['-2,25', '-2.25', '(-9)/4', '-(9)/(4)', '-(9)/4', '(-9)/(4)']::text[]
  ),
  (
    'loodrechte_lijn', 3, 3,
    $vraag$De grafiek van $f(x) = x^{2} + x$ heeft in het punt met $x = 1$ een raaklijn. De lijn door dat punt die loodrecht op de raaklijn staat, snijdt de grafiek nog een keer. Bereken de $x$ van dat andere snijpunt.$vraag$,
    '-7/3', '-\dfrac{7}{3}', 'x =',
    ARRAY['(-7)/3', '-(7)/(3)', '-(7)/3', '(-7)/(3)']::text[]
  ),
  (
    'loodrechte_lijn', 4, 3,
    $vraag$De grafiek van $f(x) = x^{2}$ heeft in het punt met $x = -1$ een raaklijn. De lijn door dat punt die loodrecht op de raaklijn staat, snijdt de grafiek nog een keer. Bereken de $x$ van dat andere snijpunt.$vraag$,
    '3/2', '\dfrac{3}{2}', 'x =',
    ARRAY['1,5', '1.5', '(3)/2', '(3)/(2)']::text[]
  ),
  (
    'loodrechte_lijn', 5, 3,
    $vraag$De grafiek van $f(x) = 4x - x^{2}$ heeft in het punt met $x = 1$ een raaklijn. De lijn door dat punt die loodrecht op de raaklijn staat, snijdt de grafiek nog een keer. Bereken de $x$ van dat andere snijpunt.$vraag$,
    '7/2', '\dfrac{7}{2}', 'x =',
    ARRAY['3,5', '3.5', '(7)/2', '(7)/(2)']::text[]
  ),
  (
    'loodrechte_lijn', 6, 3,
    $vraag$De grafiek van $f(x) = x^{2} - 2x$ heeft in het punt met $x = 3$ een raaklijn. De lijn door dat punt die loodrecht op de raaklijn staat, snijdt de grafiek nog een keer. Bereken de $x$ van dat andere snijpunt.$vraag$,
    '-5/4', '-\dfrac{5}{4}', 'x =',
    ARRAY['-1,25', '-1.25', '(-5)/4', '-(5)/(4)', '-(5)/4', '(-5)/(4)']::text[]
  ),
  (
    'loodrechte_lijn', 7, 3,
    $vraag$De grafiek van $f(x) = x^{2} + 4x$ heeft in het punt met $x = -1$ een raaklijn. De lijn door dat punt die loodrecht op de raaklijn staat, snijdt de grafiek nog een keer. Bereken de $x$ van dat andere snijpunt.$vraag$,
    '-7/2', '-\dfrac{7}{2}', 'x =',
    ARRAY['-3,5', '-3.5', '(-7)/2', '-(7)/(2)', '-(7)/2', '(-7)/(2)']::text[]
  ),
  (
    'loodrechte_lijn', 8, 3,
    $vraag$De grafiek van $f(x) = 2x^{2}$ heeft in het punt met $x = 1$ een raaklijn. De lijn door dat punt die loodrecht op de raaklijn staat, snijdt de grafiek nog een keer. Bereken de $x$ van dat andere snijpunt.$vraag$,
    '-9/8', '-\dfrac{9}{8}', 'x =',
    ARRAY['-1,125', '-1.125', '(-9)/8', '-(9)/(8)', '-(9)/8', '(-9)/(8)']::text[]
  ),
  (
    'buigpunt_en_buigraaklijn', 1, 3,
    $vraag$De functie $f$ is gegeven door $f(x) = x^{3} - 12x^{2} + 1$. Bereken de $x$ van het buigpunt.$vraag$,
    '4', '4', 'x =',
    '{}'::text[]
  ),
  (
    'buigpunt_en_buigraaklijn', 2, 3,
    $vraag$De functie $f$ is gegeven door $f(x) = x^{3} + 3x^{2} - x$. Bereken de $x$ van het buigpunt.$vraag$,
    '-1', '-1', 'x =',
    ARRAY['(-1)']::text[]
  ),
  (
    'buigpunt_en_buigraaklijn', 3, 3,
    $vraag$De functie $f$ is gegeven door $f(x) = 2x^{3} - 9x^{2} + x$. Bereken de $x$ van het buigpunt.$vraag$,
    '3/2', '\dfrac{3}{2}', 'x =',
    ARRAY['1,5', '1.5', '(3)/2', '(3)/(2)']::text[]
  ),
  (
    'buigpunt_en_buigraaklijn', 4, 3,
    $vraag$De functie $f$ is gegeven door $f(x) = xe^{-x}$. Bereken de $x$ van het buigpunt.$vraag$,
    '2', '2', 'x =',
    '{}'::text[]
  ),
  (
    'buigpunt_en_buigraaklijn', 5, 3,
    $vraag$De functie $f$ is gegeven door $f(x) = x^{3} - 3x^{2} + 2$. Stel de vergelijking op van de buigraaklijn.$vraag$,
    '-3x + 3', '-3x + 3', 'y =',
    ARRAY['3 - 3x', 'y = -3x + 3', 'y=3-3x']::text[]
  ),
  (
    'buigpunt_en_buigraaklijn', 6, 3,
    $vraag$De functie $f$ is gegeven door $f(x) = x^{3} - 6x^{2} + 5$. Stel de vergelijking op van de buigraaklijn.$vraag$,
    '-12x + 13', '-12x + 13', 'y =',
    ARRAY['13 - 12x', 'y = -12x + 13', 'y=13-12x']::text[]
  ),
  (
    'buigpunt_en_buigraaklijn', 7, 3,
    $vraag$De functie $f$ is gegeven door $f(x) = x^{3} + 3x^{2}$. Stel de vergelijking op van de buigraaklijn.$vraag$,
    '-3x - 1', '-3x - 1', 'y =',
    ARRAY['-1 - 3x', 'y = -3x - 1', 'y=-1-3x']::text[]
  ),
  (
    'buigpunt_en_buigraaklijn', 8, 3,
    $vraag$De functie $f$ is gegeven door $f(x) = \sin(x)$, met $0 < x < 2\pi$. De hoek staat in radialen. Stel de vergelijking op van de buigraaklijn.$vraag$,
    '-x + pi', '-x + \pi', 'y =',
    ARRAY['pi - x', '\pi - x', 'y = -x + pi', 'y=-x+\pi', 'y=pi-x', 'y=\pi-x']::text[]
  )
) AS v(cluster_slug, order_index, difficulty, latex_body, answer, latex_answer, answer_prefix, alternatives)
JOIN public.topics_new t
  ON t.slug = 'h16_examentraining'
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id AND c.slug = v.cluster_slug
WHERE NOT EXISTS (
  SELECT 1
  FROM public.questions_new q
  WHERE q.cluster_id = c.id
    AND q.order_index = v.order_index
);

INSERT INTO public.question_steps_new (question_id, step_order, step_description)
SELECT q.id, v.step_order, v.step_description
FROM (VALUES
  ('helling_in_een_punt', 1, 0, $stap$$f'(x) = 3x^{2} - 6$.$stap$),
  ('helling_in_een_punt', 1, 1, $stap$Dus $f'(2) = 3 \cdot 4 - 6 = 12 - 6 = 6$.$stap$),
  ('helling_in_een_punt', 2, 0, $stap$Productregel.$stap$),
  ('helling_in_een_punt', 2, 1, $stap$Afgeleide van $3x - 1$ is $3$, afgeleide van $x + 2$ is $1$.$stap$),
  ('helling_in_een_punt', 2, 2, $stap$Dus $f'(x) = 3(x + 2) + (3x - 1) \cdot 1 = 3x + 6 + 3x - 1 = 6x + 5$.$stap$),
  ('helling_in_een_punt', 2, 3, $stap$Dus $f'(1) = 6 + 5 = 11$.$stap$),
  ('helling_in_een_punt', 3, 0, $stap$Quotiëntregel.$stap$),
  ('helling_in_een_punt', 3, 1, $stap$Teller $x^{2}$, noemer $x + 1$.$stap$),
  ('helling_in_een_punt', 3, 2, $stap$$f'(x) = \dfrac{2x(x + 1) - x^{2} \cdot 1}{(x + 1)^{2}} = \dfrac{2x^{2} + 2x - x^{2}}{(x + 1)^{2}} = \dfrac{x^{2} + 2x}{(x + 1)^{2}}$.$stap$),
  ('helling_in_een_punt', 3, 3, $stap$Dus $f'(1) = \dfrac{1 + 2}{4} = \dfrac{3}{4}$.$stap$),
  ('helling_in_een_punt', 3, 4, $stap$Dat is precies $0{,}75$.$stap$),
  ('helling_in_een_punt', 4, 0, $stap$Kettingregel.$stap$),
  ('helling_in_een_punt', 4, 1, $stap$Afgeleide van $\ln(u)$ is $u'/u$, met $u = 2x + 3$ en $u' = 2$.$stap$),
  ('helling_in_een_punt', 4, 2, $stap$Dus $f'(x) = \dfrac{2}{2x + 3}$.$stap$),
  ('helling_in_een_punt', 4, 3, $stap$Bij $x = 1$ is $2x + 3 = 5 > 0$, dus het punt ligt op het domein.$stap$),
  ('helling_in_een_punt', 4, 4, $stap$$f'(1) = \dfrac{2}{5}$.$stap$),
  ('helling_in_een_punt', 4, 5, $stap$Dat is precies $0{,}4$.$stap$),
  ('helling_in_een_punt', 5, 0, $stap$Productregel.$stap$),
  ('helling_in_een_punt', 5, 1, $stap$Afgeleide van $x^{2}$ is $2x$, afgeleide van $e^{x}$ is $e^{x}$.$stap$),
  ('helling_in_een_punt', 5, 2, $stap$Dus $f'(x) = 2x \cdot e^{x} + x^{2} \cdot e^{x} = e^{x}(x^{2} + 2x)$.$stap$),
  ('helling_in_een_punt', 5, 3, $stap$Dus $f'(1) = e(1 + 2) = 3e$.$stap$),
  ('helling_in_een_punt', 6, 0, $stap$Kettingregel.$stap$),
  ('helling_in_een_punt', 6, 1, $stap$$f'(x) = 2\cos(2x)$.$stap$),
  ('helling_in_een_punt', 6, 2, $stap$Dus $f'\left(\dfrac{\pi}{6}\right) = 2\cos\left(\dfrac{\pi}{3}\right) = 2 \cdot \dfrac{1}{2} = 1$.$stap$),
  ('helling_in_een_punt', 7, 0, $stap$$f'(x) = \dfrac{1}{2\sqrt{x}}$.$stap$),
  ('helling_in_een_punt', 7, 1, $stap$Dus $f'(5) = \dfrac{1}{2\sqrt{5}}$.$stap$),
  ('helling_in_een_punt', 7, 2, $stap$$\sqrt{5} = 2{,}23607\ldots$, dus $2\sqrt{5} = 4{,}47214\ldots$ en $f'(5) = 0{,}22361\ldots$.$stap$),
  ('helling_in_een_punt', 7, 3, $stap$Afgerond op één decimaal: $0{,}2$.$stap$),
  ('helling_in_een_punt', 8, 0, $stap$Kettingregel.$stap$),
  ('helling_in_een_punt', 8, 1, $stap$Afgeleide van $e^{u}$ is $e^{u} \cdot u'$, met $u = x/2$ en $u' = 1/2$.$stap$),
  ('helling_in_een_punt', 8, 2, $stap$Dus $f'(x) = \dfrac{1}{2}e^{x/2}$.$stap$),
  ('helling_in_een_punt', 8, 3, $stap$Dus $f'(1) = \dfrac{1}{2}e^{1/2}$.$stap$),
  ('helling_in_een_punt', 8, 4, $stap$$e^{1/2} = 1{,}64872\ldots$, dus $f'(1) = 0{,}82436\ldots$.$stap$),
  ('helling_in_een_punt', 8, 5, $stap$Afgerond op één decimaal: $0{,}8$.$stap$),
  ('raaklijn', 1, 0, $stap$$f'(x) = 2x - 5$.$stap$),
  ('raaklijn', 1, 1, $stap$Dus $f'(3) = 6 - 5 = 1$.$stap$),
  ('raaklijn', 1, 2, $stap$De helling van de raaklijn is $1$.$stap$),
  ('raaklijn', 2, 0, $stap$Kettingregel.$stap$),
  ('raaklijn', 2, 1, $stap$$f'(x) = 3(x - 2)^{2}$.$stap$),
  ('raaklijn', 2, 2, $stap$Dus $f'(3) = 3 \cdot 1^{2} = 3$.$stap$),
  ('raaklijn', 3, 0, $stap$$f'(x) = \dfrac{1}{x}$.$stap$),
  ('raaklijn', 3, 1, $stap$Dus $f'(3) = \dfrac{1}{3} = 0{,}33333\ldots$.$stap$),
  ('raaklijn', 3, 2, $stap$Afgerond op één decimaal: $0{,}3$.$stap$),
  ('raaklijn', 4, 0, $stap$$f'(x) = -\sin(x)$.$stap$),
  ('raaklijn', 4, 1, $stap$Dus $f'(1) = -\sin(1)$.$stap$),
  ('raaklijn', 4, 2, $stap$$\sin(1) = 0{,}84147\ldots$, dus $f'(1) = -0{,}84147\ldots$.$stap$),
  ('raaklijn', 4, 3, $stap$Afgerond op één decimaal: $-0{,}8$.$stap$),
  ('raaklijn', 5, 0, $stap$$f'(x) = 2x$, dus de helling is $f'(1) = 2$.$stap$),
  ('raaklijn', 5, 1, $stap$Het raakpunt is $(1, f(1)) = (1, 1)$.$stap$),
  ('raaklijn', 5, 2, $stap$De lijn: $y - 1 = 2(x - 1)$, dus $y = 2x - 2 + 1 = 2x - 1$.$stap$),
  ('raaklijn', 6, 0, $stap$$f'(x) = 3x^{2} - 1$, dus de helling is $f'(1) = 3 - 1 = 2$.$stap$),
  ('raaklijn', 6, 1, $stap$Het raakpunt is $(1, 1 - 1) = (1, 0)$.$stap$),
  ('raaklijn', 6, 2, $stap$De lijn: $y - 0 = 2(x - 1)$, dus $y = 2x - 2$.$stap$),
  ('raaklijn', 7, 0, $stap$$f'(x) = \dfrac{1}{x}$, dus de helling is $f'(e) = \dfrac{1}{e}$.$stap$),
  ('raaklijn', 7, 1, $stap$Het raakpunt is $(e, \ln(e)) = (e, 1)$.$stap$),
  ('raaklijn', 7, 2, $stap$De lijn: $y - 1 = \dfrac{1}{e}(x - e) = \dfrac{x}{e} - 1$.$stap$),
  ('raaklijn', 7, 3, $stap$Dus $y = \dfrac{x}{e}$.$stap$),
  ('raaklijn', 8, 0, $stap$$f'(x) = e^{x}$, dus de helling is $f'(0) = 1$.$stap$),
  ('raaklijn', 8, 1, $stap$Het raakpunt is $(0, e^{0}) = (0, 1)$.$stap$),
  ('raaklijn', 8, 2, $stap$De lijn: $y - 1 = 1 \cdot (x - 0)$, dus $y = x + 1$.$stap$),
  ('helling_zoek_x', 1, 0, $stap$$f'(x) = 2x + 3$.$stap$),
  ('helling_zoek_x', 1, 1, $stap$Stel $2x + 3 = 4$.$stap$),
  ('helling_zoek_x', 1, 2, $stap$Dan $2x = 1$, dus $x = \dfrac{1}{2}$.$stap$),
  ('helling_zoek_x', 2, 0, $stap$$f'(x) = 3x^{2} - 3 = 3(x^{2} - 1) = 3(x - 1)(x + 1)$.$stap$),
  ('helling_zoek_x', 2, 1, $stap$Stel $f'(x) = 0$.$stap$),
  ('helling_zoek_x', 2, 2, $stap$Dan $x = 1$ of $x = -1$.$stap$),
  ('helling_zoek_x', 2, 3, $stap$De positieve oplossing is $x = 1$.$stap$),
  ('helling_zoek_x', 3, 0, $stap$Productregel.$stap$),
  ('helling_zoek_x', 3, 1, $stap$$f'(x) = 1 \cdot e^{x} + (x - 1)e^{x} = e^{x}\bigl(1 + x - 1\bigr) = x e^{x}$.$stap$),
  ('helling_zoek_x', 3, 2, $stap$Stel $f'(x) = 0$.$stap$),
  ('helling_zoek_x', 3, 3, $stap$De factor $e^{x}$ is nooit $0$, dus $x = 0$.$stap$),
  ('helling_zoek_x', 4, 0, $stap$$f'(x) = 2x - 6$.$stap$),
  ('helling_zoek_x', 4, 1, $stap$Stel $2x - 6 = -2$.$stap$),
  ('helling_zoek_x', 4, 2, $stap$Dan $2x = 4$, dus $x = 2$.$stap$),
  ('helling_zoek_x', 5, 0, $stap$Quotiëntregel.$stap$),
  ('helling_zoek_x', 5, 1, $stap$$f'(x) = \dfrac{1 \cdot (x + 2) - x \cdot 1}{(x + 2)^{2}} = \dfrac{2}{(x + 2)^{2}}$.$stap$),
  ('helling_zoek_x', 5, 2, $stap$Stel $\dfrac{2}{(x + 2)^{2}} = \dfrac{1}{8}$.$stap$),
  ('helling_zoek_x', 5, 3, $stap$Dan $(x + 2)^{2} = 16$, dus $x + 2 = 4$ of $x + 2 = -4$.$stap$),
  ('helling_zoek_x', 5, 4, $stap$Daaruit $x = 2$ of $x = -6$.$stap$),
  ('helling_zoek_x', 5, 5, $stap$Beide liggen niet op de verticale asymptoot $x = -2$.$stap$),
  ('helling_zoek_x', 5, 6, $stap$De positieve oplossing is $x = 2$.$stap$),
  ('helling_zoek_x', 5, 7, $stap$Controle: $f'(2) = \dfrac{2}{16} = \dfrac{1}{8}$.$stap$),
  ('helling_zoek_x', 6, 0, $stap$Kettingregel.$stap$),
  ('helling_zoek_x', 6, 1, $stap$$f'(x) = 2(2x + 1) \cdot 2 = 4(2x + 1)$.$stap$),
  ('helling_zoek_x', 6, 2, $stap$Stel $4(2x + 1) = 12$.$stap$),
  ('helling_zoek_x', 6, 3, $stap$Dan $2x + 1 = 3$, dus $2x = 2$ en $x = 1$.$stap$),
  ('helling_zoek_x', 7, 0, $stap$$f'(x) = 3x^{2}$.$stap$),
  ('helling_zoek_x', 7, 1, $stap$Stel $3x^{2} = 5$.$stap$),
  ('helling_zoek_x', 7, 2, $stap$Dan $x^{2} = \dfrac{5}{3}$, dus $x = \sqrt{\dfrac{5}{3}}$ of de negatieve wortel.$stap$),
  ('helling_zoek_x', 7, 3, $stap$De positieve is $\sqrt{5/3} = 1{,}29099\ldots$.$stap$),
  ('helling_zoek_x', 7, 4, $stap$Afgerond op één decimaal: $1{,}3$.$stap$),
  ('helling_zoek_x', 8, 0, $stap$Kettingregel.$stap$),
  ('helling_zoek_x', 8, 1, $stap$$f'(x) = 2e^{2x}$.$stap$),
  ('helling_zoek_x', 8, 2, $stap$Stel $2e^{2x} = 5$.$stap$),
  ('helling_zoek_x', 8, 3, $stap$Dan $e^{2x} = 2{,}5$, dus $2x = \ln(2{,}5)$ en $x = \dfrac{\ln(2{,}5)}{2}$.$stap$),
  ('helling_zoek_x', 8, 4, $stap$$\ln(2{,}5) = 0{,}91629\ldots$, dus $x = 0{,}45815\ldots$.$stap$),
  ('helling_zoek_x', 8, 5, $stap$Afgerond op één decimaal: $0{,}5$.$stap$),
  ('top', 1, 0, $stap$Quotiëntregel.$stap$),
  ('top', 1, 1, $stap$$f'(x) = \dfrac{1 \cdot (x^{2} + 4) - x \cdot 2x}{(x^{2} + 4)^{2}} = \dfrac{4 - x^{2}}{(x^{2} + 4)^{2}}$.$stap$),
  ('top', 1, 2, $stap$De noemer is altijd positief.$stap$),
  ('top', 1, 3, $stap$$f'(x) = 0$ als $x^{2} = 4$, dus $x = 2$ of $x = -2$.$stap$),
  ('top', 1, 4, $stap$Tussen $-2$ en $2$ is $f'(x)$ positief, daarbuiten negatief.$stap$),
  ('top', 1, 5, $stap$De grafiek stijgt tot $x = 2$ en daalt daarna: de top ligt bij $x = 2$.$stap$),
  ('top', 1, 6, $stap$Bij $x = -2$ ligt een dal.$stap$),
  ('top', 2, 0, $stap$$f'(x) = 4 \cdot \dfrac{1}{2\sqrt{x}} - 1 = \dfrac{2}{\sqrt{x}} - 1$, voor $x > 0$.$stap$),
  ('top', 2, 1, $stap$Stel $f'(x) = 0$.$stap$),
  ('top', 2, 2, $stap$Dan $\sqrt{x} = 2$, dus $x = 4$.$stap$),
  ('top', 2, 3, $stap$Voor $0 < x < 4$ is $f'(x) > 0$, voor $x > 4$ is $f'(x) < 0$.$stap$),
  ('top', 2, 4, $stap$De top ligt bij $x = 4$.$stap$),
  ('top', 3, 0, $stap$$f'(x) = \dfrac{2}{x} - 1$.$stap$),
  ('top', 3, 1, $stap$Stel $f'(x) = 0$.$stap$),
  ('top', 3, 2, $stap$Dan $\dfrac{2}{x} = 1$, dus $x = 2$.$stap$),
  ('top', 3, 3, $stap$Voor $0 < x < 2$ is $f'(x) > 0$, voor $x > 2$ is $f'(x) < 0$.$stap$),
  ('top', 3, 4, $stap$De top ligt bij $x = 2$.$stap$),
  ('top', 4, 0, $stap$$f'(x) = \cos(x) - \sqrt{3}\sin(x)$.$stap$),
  ('top', 4, 1, $stap$Stel $f'(x) = 0$.$stap$),
  ('top', 4, 2, $stap$Dan $\cos(x) = \sqrt{3}\sin(x)$, dus $\tan(x) = \dfrac{1}{\sqrt{3}} = \dfrac{\sqrt{3}}{3}$.$stap$),
  ('top', 4, 3, $stap$Op $[0, \pi]$ is dat $x = \dfrac{\pi}{6}$.$stap$),
  ('top', 4, 4, $stap$Controle met de tweede afgeleide is hier niet nodig: $f(0) = \sqrt{3} \approx 1{,}73$, $f\left(\dfrac{\pi}{6}\right) = \dfrac{1}{2} + \sqrt{3} \cdot \dfrac{\sqrt{3}}{2} = \dfrac{1}{2} + \dfrac{3}{2} = 2$, en $f(\pi) = -\sqrt{3}$.$stap$),
  ('top', 4, 5, $stap$Het hoogste punt op het interval ligt bij $x = \dfrac{\pi}{6}$.$stap$),
  ('top', 5, 0, $stap$Quotiëntregel.$stap$),
  ('top', 5, 1, $stap$$f'(x) = \dfrac{(x^{2} + 1) - x \cdot 2x}{(x^{2} + 1)^{2}} = \dfrac{1 - x^{2}}{(x^{2} + 1)^{2}}$.$stap$),
  ('top', 5, 2, $stap$Nul als $x = 1$ of $x = -1$.$stap$),
  ('top', 5, 3, $stap$De grafiek stijgt tot $x = 1$ en daalt daarna, dus de top ligt bij $x = 1$.$stap$),
  ('top', 5, 4, $stap$Dan $f(1) = \dfrac{1}{1 + 1} = \dfrac{1}{2}$.$stap$),
  ('top', 6, 0, $stap$$f'(x) = \dfrac{3}{\sqrt{x}} - 1$ voor $x > 0$.$stap$),
  ('top', 6, 1, $stap$Stel $f'(x) = 0$.$stap$),
  ('top', 6, 2, $stap$Dan $\sqrt{x} = 3$, dus $x = 9$.$stap$),
  ('top', 6, 3, $stap$Links daarvan stijgt de grafiek, rechts daalt ze.$stap$),
  ('top', 6, 4, $stap$$f(9) = 6 \cdot 3 - 9 = 9$.$stap$),
  ('top', 7, 0, $stap$$f'(x) = \dfrac{1}{x} - 1$.$stap$),
  ('top', 7, 1, $stap$Stel $f'(x) = 0$.$stap$),
  ('top', 7, 2, $stap$Dan $x = 1$.$stap$),
  ('top', 7, 3, $stap$Voor $0 < x < 1$ stijgt de grafiek, voor $x > 1$ daalt ze.$stap$),
  ('top', 7, 4, $stap$$f(1) = \ln(1) - 1 = -1$.$stap$),
  ('top', 8, 0, $stap$$f'(x) = \cos(x) + \sin(x)$.$stap$),
  ('top', 8, 1, $stap$Stel $f'(x) = 0$.$stap$),
  ('top', 8, 2, $stap$Dan $\tan(x) = -1$.$stap$),
  ('top', 8, 3, $stap$Op $[0, \pi]$ is dat $x = \dfrac{3\pi}{4}$.$stap$),
  ('top', 8, 4, $stap$$f\left(\dfrac{3\pi}{4}\right) = \sin\dfrac{3\pi}{4} - \cos\dfrac{3\pi}{4} = \dfrac{\sqrt{2}}{2} - \left(-\dfrac{\sqrt{2}}{2}\right) = \sqrt{2}$.$stap$),
  ('top', 8, 5, $stap$Ter controle: $f(0) = -1$ en $f(\pi) = 1$, allebei kleiner dan $\sqrt{2} \approx 1{,}41$.$stap$),
  ('kleinste_of_grootste', 1, 0, $stap$Product- en kettingregel.$stap$),
  ('kleinste_of_grootste', 1, 1, $stap$$M'(x) = e^{-x/2} + x \cdot e^{-x/2} \cdot \left(-\dfrac{1}{2}\right) = e^{-x/2}\left(1 - \dfrac{x}{2}\right)$.$stap$),
  ('kleinste_of_grootste', 1, 2, $stap$De e-macht is nooit $0$, dus $M'(x) = 0$ als $x = 2$.$stap$),
  ('kleinste_of_grootste', 1, 3, $stap$Voor $0 \leq x < 2$ is $M'(x) > 0$, daarna $M'(x) < 0$.$stap$),
  ('kleinste_of_grootste', 1, 4, $stap$De opname is het grootst op dag $x = 2$.$stap$),
  ('kleinste_of_grootste', 2, 0, $stap$Quotiëntregel.$stap$),
  ('kleinste_of_grootste', 2, 1, $stap$$K'(x) = \dfrac{2x \cdot x - (x^{2} + 9) \cdot 1}{x^{2}} = \dfrac{x^{2} - 9}{x^{2}}$.$stap$),
  ('kleinste_of_grootste', 2, 2, $stap$Voor $x > 0$ is de noemer positief.$stap$),
  ('kleinste_of_grootste', 2, 3, $stap$$K'(x) = 0$ als $x = 3$ (de negatieve wortel valt af).$stap$),
  ('kleinste_of_grootste', 2, 4, $stap$Voor $0 < x < 3$ daalt $K$, daarna stijgt $K$.$stap$),
  ('kleinste_of_grootste', 2, 5, $stap$Het minimum ligt bij $x = 3$.$stap$),
  ('kleinste_of_grootste', 3, 0, $stap$Kettingregel.$stap$),
  ('kleinste_of_grootste', 3, 1, $stap$De afgeleide van de exponent $-(x - 4)^{2}$ is $-2(x - 4)$.$stap$),
  ('kleinste_of_grootste', 3, 2, $stap$Dus $T'(x) = 8e^{-(x - 4)^{2}} \cdot \bigl(-2(x - 4)\bigr) = -16(x - 4)e^{-(x - 4)^{2}}$.$stap$),
  ('kleinste_of_grootste', 3, 3, $stap$De e-macht is nooit $0$, dus $T'(x) = 0$ als $x = 4$.$stap$),
  ('kleinste_of_grootste', 3, 4, $stap$Links van $4$ is $T'(x) > 0$, rechts $T'(x) < 0$.$stap$),
  ('kleinste_of_grootste', 3, 5, $stap$De temperatuur is het hoogst bij $x = 4$.$stap$),
  ('kleinste_of_grootste', 4, 0, $stap$Productregel.$stap$),
  ('kleinste_of_grootste', 4, 1, $stap$$A'(x) = 2x e^{-x} + x^{2} e^{-x} \cdot (-1) = e^{-x}(2x - x^{2}) = xe^{-x}(2 - x)$.$stap$),
  ('kleinste_of_grootste', 4, 2, $stap$Nul als $x = 0$ of $x = 2$.$stap$),
  ('kleinste_of_grootste', 4, 3, $stap$Op $[0, 2]$ is $A'(x) \geq 0$, daarna $A'(x) < 0$.$stap$),
  ('kleinste_of_grootste', 4, 4, $stap$De hoeveelheid is het grootst op $x = 2$.$stap$),
  ('kleinste_of_grootste', 4, 5, $stap$Op $x = 0$ is de hoeveelheid $0$, het begin.$stap$),
  ('kleinste_of_grootste', 5, 0, $stap$$M'(x) = e^{-x/3}\left(1 - \dfrac{x}{3}\right)$.$stap$),
  ('kleinste_of_grootste', 5, 1, $stap$Nul als $x = 3$.$stap$),
  ('kleinste_of_grootste', 5, 2, $stap$Daarvoor stijgt $M$, daarna daalt $M$.$stap$),
  ('kleinste_of_grootste', 5, 3, $stap$$M(3) = 3e^{-1} = \dfrac{3}{e}$.$stap$),
  ('kleinste_of_grootste', 6, 0, $stap$$K'(x) = \dfrac{2x \cdot x - (x^{2} + 4)}{x^{2}} = \dfrac{x^{2} - 4}{x^{2}}$.$stap$),
  ('kleinste_of_grootste', 6, 1, $stap$Voor $x > 0$ is $K'(x) = 0$ als $x = 2$.$stap$),
  ('kleinste_of_grootste', 6, 2, $stap$Links daarvan daalt $K$, rechts stijgt $K$.$stap$),
  ('kleinste_of_grootste', 6, 3, $stap$$K(2) = \dfrac{4 + 4}{2} = 4$.$stap$),
  ('kleinste_of_grootste', 7, 0, $stap$$T'(x) = 6e^{-(x - 1)^{2}} \cdot \bigl(-2(x - 1)\bigr) = -12(x - 1)e^{-(x - 1)^{2}}$.$stap$),
  ('kleinste_of_grootste', 7, 1, $stap$Nul als $x = 1$.$stap$),
  ('kleinste_of_grootste', 7, 2, $stap$Links stijgt $T$, rechts daalt $T$.$stap$),
  ('kleinste_of_grootste', 7, 3, $stap$De e-macht is daar $e^{0} = 1$, dus $T(1) = 15 + 6 = 21$.$stap$),
  ('kleinste_of_grootste', 8, 0, $stap$Product- en kettingregel.$stap$),
  ('kleinste_of_grootste', 8, 1, $stap$$A'(x) = 2x e^{-2x} + x^{2} e^{-2x} \cdot (-2) = 2xe^{-2x}(1 - x)$.$stap$),
  ('kleinste_of_grootste', 8, 2, $stap$Nul als $x = 0$ of $x = 1$.$stap$),
  ('kleinste_of_grootste', 8, 3, $stap$Op $[0, 1]$ stijgt $A$, daarna daalt $A$.$stap$),
  ('kleinste_of_grootste', 8, 4, $stap$$A(1) = 1 \cdot e^{-2} = \dfrac{1}{e^{2}}$.$stap$),
  ('loodrechte_lijn', 1, 0, $stap$$f'(x) = 2x$, dus de raaklijn in $x = 1$ heeft helling $2$.$stap$),
  ('loodrechte_lijn', 1, 1, $stap$De loodrechte lijn heeft helling $-\dfrac{1}{2}$.$stap$),
  ('loodrechte_lijn', 1, 2, $stap$Het punt is $(1, 1)$.$stap$),
  ('loodrechte_lijn', 1, 3, $stap$De lijn: $y - 1 = -\dfrac{1}{2}(x - 1)$, dus $y = -\dfrac{1}{2}x + \dfrac{3}{2}$.$stap$),
  ('loodrechte_lijn', 1, 4, $stap$Snijden met $y = x^{2}$: $x^{2} + \dfrac{1}{2}x - \dfrac{3}{2} = 0$.$stap$),
  ('loodrechte_lijn', 1, 5, $stap$Keer $2$: $2x^{2} + x - 3 = 0$, of $(2x + 3)(x - 1) = 0$.$stap$),
  ('loodrechte_lijn', 1, 6, $stap$Dus $x = 1$ of $x = -\dfrac{3}{2}$.$stap$),
  ('loodrechte_lijn', 1, 7, $stap$Het andere snijpunt heeft $x = -\dfrac{3}{2}$.$stap$),
  ('loodrechte_lijn', 2, 0, $stap$Helling van de raaklijn: $f'(2) = 4$.$stap$),
  ('loodrechte_lijn', 2, 1, $stap$Loodrecht: helling $-\dfrac{1}{4}$.$stap$),
  ('loodrechte_lijn', 2, 2, $stap$Punt $(2, 4)$.$stap$),
  ('loodrechte_lijn', 2, 3, $stap$Lijn: $y - 4 = -\dfrac{1}{4}(x - 2)$, dus $y = -\dfrac{1}{4}x + \dfrac{9}{2}$.$stap$),
  ('loodrechte_lijn', 2, 4, $stap$Snijden: $x^{2} + \dfrac{1}{4}x - \dfrac{9}{2} = 0$.$stap$),
  ('loodrechte_lijn', 2, 5, $stap$Keer $4$: $4x^{2} + x - 18 = 0$.$stap$),
  ('loodrechte_lijn', 2, 6, $stap$Discriminant $1 + 288 = 289 = 17^{2}$.$stap$),
  ('loodrechte_lijn', 2, 7, $stap$Dus $x = \dfrac{-1 \pm 17}{8}$.$stap$),
  ('loodrechte_lijn', 2, 8, $stap$Dat geeft $x = 2$ of $x = -\dfrac{18}{8} = -\dfrac{9}{4}$.$stap$),
  ('loodrechte_lijn', 3, 0, $stap$$f'(x) = 2x + 1$, dus $f'(1) = 3$.$stap$),
  ('loodrechte_lijn', 3, 1, $stap$Loodrecht: helling $-\dfrac{1}{3}$.$stap$),
  ('loodrechte_lijn', 3, 2, $stap$Punt $(1, 2)$.$stap$),
  ('loodrechte_lijn', 3, 3, $stap$Lijn: $y - 2 = -\dfrac{1}{3}(x - 1)$, dus $y = -\dfrac{1}{3}x + \dfrac{7}{3}$.$stap$),
  ('loodrechte_lijn', 3, 4, $stap$Snijden met $y = x^{2} + x$: $x^{2} + \dfrac{4}{3}x - \dfrac{7}{3} = 0$.$stap$),
  ('loodrechte_lijn', 3, 5, $stap$Keer $3$: $3x^{2} + 4x - 7 = 0$.$stap$),
  ('loodrechte_lijn', 3, 6, $stap$Discriminant $16 + 84 = 100$.$stap$),
  ('loodrechte_lijn', 3, 7, $stap$Dus $x = \dfrac{-4 \pm 10}{6}$.$stap$),
  ('loodrechte_lijn', 3, 8, $stap$Dat geeft $x = 1$ of $x = -\dfrac{14}{6} = -\dfrac{7}{3}$.$stap$),
  ('loodrechte_lijn', 4, 0, $stap$$f'(-1) = -2$.$stap$),
  ('loodrechte_lijn', 4, 1, $stap$Loodrecht: helling $\dfrac{1}{2}$.$stap$),
  ('loodrechte_lijn', 4, 2, $stap$Punt $(-1, 1)$.$stap$),
  ('loodrechte_lijn', 4, 3, $stap$Lijn: $y - 1 = \dfrac{1}{2}(x + 1)$, dus $y = \dfrac{1}{2}x + \dfrac{3}{2}$.$stap$),
  ('loodrechte_lijn', 4, 4, $stap$Snijden: $x^{2} - \dfrac{1}{2}x - \dfrac{3}{2} = 0$.$stap$),
  ('loodrechte_lijn', 4, 5, $stap$Keer $2$: $2x^{2} - x - 3 = 0$, of $(2x - 3)(x + 1) = 0$.$stap$),
  ('loodrechte_lijn', 4, 6, $stap$Dus $x = -1$ of $x = \dfrac{3}{2}$.$stap$),
  ('loodrechte_lijn', 5, 0, $stap$$f'(x) = 4 - 2x$, dus $f'(1) = 2$.$stap$),
  ('loodrechte_lijn', 5, 1, $stap$Loodrecht: helling $-\dfrac{1}{2}$.$stap$),
  ('loodrechte_lijn', 5, 2, $stap$Punt $(1, 3)$.$stap$),
  ('loodrechte_lijn', 5, 3, $stap$Lijn: $y - 3 = -\dfrac{1}{2}(x - 1)$, dus $y = -\dfrac{1}{2}x + \dfrac{7}{2}$.$stap$),
  ('loodrechte_lijn', 5, 4, $stap$Snijden met $y = 4x - x^{2}$: $-x^{2} + \dfrac{9}{2}x - \dfrac{7}{2} = 0$.$stap$),
  ('loodrechte_lijn', 5, 5, $stap$Keer $-2$: $2x^{2} - 9x + 7 = 0$.$stap$),
  ('loodrechte_lijn', 5, 6, $stap$Discriminant $81 - 56 = 25$.$stap$),
  ('loodrechte_lijn', 5, 7, $stap$Dus $x = \dfrac{9 \pm 5}{4}$.$stap$),
  ('loodrechte_lijn', 5, 8, $stap$Dat geeft $x = 1$ of $x = \dfrac{14}{4} = \dfrac{7}{2}$.$stap$),
  ('loodrechte_lijn', 6, 0, $stap$$f'(x) = 2x - 2$, dus $f'(3) = 4$.$stap$),
  ('loodrechte_lijn', 6, 1, $stap$Loodrecht: helling $-\dfrac{1}{4}$.$stap$),
  ('loodrechte_lijn', 6, 2, $stap$Punt $(3, 3)$.$stap$),
  ('loodrechte_lijn', 6, 3, $stap$Lijn: $y - 3 = -\dfrac{1}{4}(x - 3)$, dus $y = -\dfrac{1}{4}x + \dfrac{15}{4}$.$stap$),
  ('loodrechte_lijn', 6, 4, $stap$Snijden: $x^{2} - \dfrac{7}{4}x - \dfrac{15}{4} = 0$.$stap$),
  ('loodrechte_lijn', 6, 5, $stap$Keer $4$: $4x^{2} - 7x - 15 = 0$.$stap$),
  ('loodrechte_lijn', 6, 6, $stap$Discriminant $49 + 240 = 289 = 17^{2}$.$stap$),
  ('loodrechte_lijn', 6, 7, $stap$Dus $x = \dfrac{7 \pm 17}{8}$.$stap$),
  ('loodrechte_lijn', 6, 8, $stap$Dat geeft $x = 3$ of $x = -\dfrac{10}{8} = -\dfrac{5}{4}$.$stap$),
  ('loodrechte_lijn', 7, 0, $stap$$f'(x) = 2x + 4$, dus $f'(-1) = 2$.$stap$),
  ('loodrechte_lijn', 7, 1, $stap$Loodrecht: helling $-\dfrac{1}{2}$.$stap$),
  ('loodrechte_lijn', 7, 2, $stap$Punt $(-1, -3)$.$stap$),
  ('loodrechte_lijn', 7, 3, $stap$Lijn: $y + 3 = -\dfrac{1}{2}(x + 1)$, dus $y = -\dfrac{1}{2}x - \dfrac{7}{2}$.$stap$),
  ('loodrechte_lijn', 7, 4, $stap$Snijden: $x^{2} + \dfrac{9}{2}x + \dfrac{7}{2} = 0$.$stap$),
  ('loodrechte_lijn', 7, 5, $stap$Keer $2$: $2x^{2} + 9x + 7 = 0$.$stap$),
  ('loodrechte_lijn', 7, 6, $stap$Discriminant $81 - 56 = 25$.$stap$),
  ('loodrechte_lijn', 7, 7, $stap$Dus $x = \dfrac{-9 \pm 5}{4}$.$stap$),
  ('loodrechte_lijn', 7, 8, $stap$Dat geeft $x = -1$ of $x = -\dfrac{14}{4} = -\dfrac{7}{2}$.$stap$),
  ('loodrechte_lijn', 8, 0, $stap$$f'(x) = 4x$, dus $f'(1) = 4$.$stap$),
  ('loodrechte_lijn', 8, 1, $stap$Loodrecht: helling $-\dfrac{1}{4}$.$stap$),
  ('loodrechte_lijn', 8, 2, $stap$Punt $(1, 2)$.$stap$),
  ('loodrechte_lijn', 8, 3, $stap$Lijn: $y - 2 = -\dfrac{1}{4}(x - 1)$, dus $y = -\dfrac{1}{4}x + \dfrac{9}{4}$.$stap$),
  ('loodrechte_lijn', 8, 4, $stap$Snijden met $y = 2x^{2}$: $2x^{2} + \dfrac{1}{4}x - \dfrac{9}{4} = 0$.$stap$),
  ('loodrechte_lijn', 8, 5, $stap$Keer $4$: $8x^{2} + x - 9 = 0$.$stap$),
  ('loodrechte_lijn', 8, 6, $stap$Discriminant $1 + 288 = 289 = 17^{2}$.$stap$),
  ('loodrechte_lijn', 8, 7, $stap$Dus $x = \dfrac{-1 \pm 17}{16}$.$stap$),
  ('loodrechte_lijn', 8, 8, $stap$Dat geeft $x = 1$ of $x = -\dfrac{18}{16} = -\dfrac{9}{8}$.$stap$),
  ('buigpunt_en_buigraaklijn', 1, 0, $stap$$f'(x) = 3x^{2} - 24x$ en $f''(x) = 6x - 24$.$stap$),
  ('buigpunt_en_buigraaklijn', 1, 1, $stap$Stel $f''(x) = 0$.$stap$),
  ('buigpunt_en_buigraaklijn', 1, 2, $stap$Dan $6x = 24$, dus $x = 4$.$stap$),
  ('buigpunt_en_buigraaklijn', 1, 3, $stap$Links van $x = 4$ is $f''$ negatief, rechts positief.$stap$),
  ('buigpunt_en_buigraaklijn', 1, 4, $stap$$f''$ wisselt van teken, dus het buigpunt ligt bij $x = 4$.$stap$),
  ('buigpunt_en_buigraaklijn', 2, 0, $stap$$f'(x) = 3x^{2} + 6x - 1$ en $f''(x) = 6x + 6$.$stap$),
  ('buigpunt_en_buigraaklijn', 2, 1, $stap$Stel $f''(x) = 0$.$stap$),
  ('buigpunt_en_buigraaklijn', 2, 2, $stap$Dan $6(x + 1) = 0$, dus $x = -1$.$stap$),
  ('buigpunt_en_buigraaklijn', 2, 3, $stap$Links van $x = -1$ is $f''$ negatief, rechts positief.$stap$),
  ('buigpunt_en_buigraaklijn', 2, 4, $stap$Het buigpunt ligt bij $x = -1$.$stap$),
  ('buigpunt_en_buigraaklijn', 3, 0, $stap$$f'(x) = 6x^{2} - 18x + 1$ en $f''(x) = 12x - 18$.$stap$),
  ('buigpunt_en_buigraaklijn', 3, 1, $stap$Stel $f''(x) = 0$.$stap$),
  ('buigpunt_en_buigraaklijn', 3, 2, $stap$Dan $12x = 18$, dus $x = \dfrac{3}{2}$.$stap$),
  ('buigpunt_en_buigraaklijn', 3, 3, $stap$Links daarvan is $f''$ negatief, rechts positief.$stap$),
  ('buigpunt_en_buigraaklijn', 3, 4, $stap$Het buigpunt ligt bij $x = \dfrac{3}{2}$.$stap$),
  ('buigpunt_en_buigraaklijn', 3, 5, $stap$Dat is precies $1{,}5$.$stap$),
  ('buigpunt_en_buigraaklijn', 4, 0, $stap$Productregel.$stap$),
  ('buigpunt_en_buigraaklijn', 4, 1, $stap$$f'(x) = e^{-x} + x \cdot (-e^{-x}) = e^{-x}(1 - x)$.$stap$),
  ('buigpunt_en_buigraaklijn', 4, 2, $stap$Nog een keer: $f''(x) = -e^{-x}(1 - x) + e^{-x} \cdot (-1) = e^{-x}(x - 2)$.$stap$),
  ('buigpunt_en_buigraaklijn', 4, 3, $stap$De e-macht is nooit $0$, dus $f''(x) = 0$ als $x = 2$.$stap$),
  ('buigpunt_en_buigraaklijn', 4, 4, $stap$Links van $x = 2$ is $f''$ negatief, rechts positief.$stap$),
  ('buigpunt_en_buigraaklijn', 4, 5, $stap$Het buigpunt ligt bij $x = 2$.$stap$),
  ('buigpunt_en_buigraaklijn', 5, 0, $stap$$f'(x) = 3x^{2} - 6x$ en $f''(x) = 6x - 6$.$stap$),
  ('buigpunt_en_buigraaklijn', 5, 1, $stap$Stel $f''(x) = 0$.$stap$),
  ('buigpunt_en_buigraaklijn', 5, 2, $stap$Dan $x = 1$.$stap$),
  ('buigpunt_en_buigraaklijn', 5, 3, $stap$Links is $f''$ negatief, rechts positief, dus dit is het buigpunt.$stap$),
  ('buigpunt_en_buigraaklijn', 5, 4, $stap$$f(1) = 1 - 3 + 2 = 0$ en $f'(1) = 3 - 6 = -3$.$stap$),
  ('buigpunt_en_buigraaklijn', 5, 5, $stap$De buigraaklijn: $y - 0 = -3(x - 1)$, dus $y = -3x + 3$.$stap$),
  ('buigpunt_en_buigraaklijn', 6, 0, $stap$$f'(x) = 3x^{2} - 12x$ en $f''(x) = 6x - 12$.$stap$),
  ('buigpunt_en_buigraaklijn', 6, 1, $stap$Stel $f''(x) = 0$.$stap$),
  ('buigpunt_en_buigraaklijn', 6, 2, $stap$Dan $x = 2$.$stap$),
  ('buigpunt_en_buigraaklijn', 6, 3, $stap$$f''$ wisselt daar van negatief naar positief.$stap$),
  ('buigpunt_en_buigraaklijn', 6, 4, $stap$$f(2) = 8 - 24 + 5 = -11$ en $f'(2) = 12 - 24 = -12$.$stap$),
  ('buigpunt_en_buigraaklijn', 6, 5, $stap$De buigraaklijn: $y + 11 = -12(x - 2)$, dus $y = -12x + 24 - 11 = -12x + 13$.$stap$),
  ('buigpunt_en_buigraaklijn', 7, 0, $stap$$f'(x) = 3x^{2} + 6x$ en $f''(x) = 6x + 6$.$stap$),
  ('buigpunt_en_buigraaklijn', 7, 1, $stap$Stel $f''(x) = 0$.$stap$),
  ('buigpunt_en_buigraaklijn', 7, 2, $stap$Dan $x = -1$.$stap$),
  ('buigpunt_en_buigraaklijn', 7, 3, $stap$$f''$ wisselt daar van negatief naar positief.$stap$),
  ('buigpunt_en_buigraaklijn', 7, 4, $stap$$f(-1) = -1 + 3 = 2$ en $f'(-1) = 3 - 6 = -3$.$stap$),
  ('buigpunt_en_buigraaklijn', 7, 5, $stap$De buigraaklijn: $y - 2 = -3(x + 1) = -3x - 3$, dus $y = -3x - 1$.$stap$),
  ('buigpunt_en_buigraaklijn', 8, 0, $stap$$f'(x) = \cos(x)$ en $f''(x) = -\sin(x)$.$stap$),
  ('buigpunt_en_buigraaklijn', 8, 1, $stap$Op $0 < x < 2\pi$ is $f''(x) = 0$ alleen bij $x = \pi$.$stap$),
  ('buigpunt_en_buigraaklijn', 8, 2, $stap$Links daarvan is $f''$ negatief, rechts positief.$stap$),
  ('buigpunt_en_buigraaklijn', 8, 3, $stap$$f(\pi) = 0$ en $f'(\pi) = -1$.$stap$),
  ('buigpunt_en_buigraaklijn', 8, 4, $stap$De buigraaklijn: $y - 0 = -1(x - \pi)$, dus $y = -x + \pi$.$stap$)
) AS v(cluster_slug, q_order_index, step_order, step_description)
JOIN public.topics_new t
  ON t.slug = 'h16_examentraining'
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id AND c.slug = v.cluster_slug
JOIN public.questions_new q
  ON q.topic_id = t.id
 AND q.cluster_id = c.id
 AND q.order_index = v.q_order_index
ON CONFLICT (question_id, step_order) DO NOTHING;

DO $$
DECLARE
  n_vragen int;
  n_stappen int;
  n_soorten int;
BEGIN
  SELECT count(*) INTO n_soorten
  FROM public.topic_clusters_new c
  JOIN public.topics_new t ON t.id = c.topic_id
  WHERE t.slug = 'h16_examentraining';

  SELECT count(*) INTO n_vragen
  FROM public.questions_new q
  JOIN public.topics_new t ON t.id = q.topic_id
  WHERE t.slug = 'h16_examentraining';

  SELECT count(*) INTO n_stappen
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  JOIN public.topics_new t ON t.id = q.topic_id
  WHERE t.slug = 'h16_examentraining';

  IF n_soorten <> 7 OR n_vragen <> 56 OR n_stappen <> 295 THEN
    RAISE EXCEPTION 'Examentraining klopt niet: % soorten, % opgaven, % stappen', n_soorten, n_vragen, n_stappen;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM (VALUES
      ('helling_in_een_punt', 1, '6', NULL::text),
      ('helling_in_een_punt', 2, '11', NULL::text),
      ('helling_in_een_punt', 3, '3/4', NULL::text),
      ('helling_in_een_punt', 4, '2/5', NULL::text),
      ('helling_in_een_punt', 5, '3e', NULL::text),
      ('helling_in_een_punt', 6, '1', NULL::text),
      ('helling_in_een_punt', 7, '0,2', NULL::text),
      ('helling_in_een_punt', 8, '0,8', NULL::text),
      ('raaklijn', 1, '1', NULL::text),
      ('raaklijn', 2, '3', NULL::text),
      ('raaklijn', 3, '0,3', NULL::text),
      ('raaklijn', 4, '-0,8', NULL::text),
      ('raaklijn', 5, '2x - 1', 'y ='::text),
      ('raaklijn', 6, '2x - 2', 'y ='::text),
      ('raaklijn', 7, 'x/e', 'y ='::text),
      ('raaklijn', 8, 'x + 1', 'y ='::text),
      ('helling_zoek_x', 1, '1/2', 'x ='::text),
      ('helling_zoek_x', 2, '1', 'x ='::text),
      ('helling_zoek_x', 3, '0', 'x ='::text),
      ('helling_zoek_x', 4, '2', 'x ='::text),
      ('helling_zoek_x', 5, '2', 'x ='::text),
      ('helling_zoek_x', 6, '1', 'x ='::text),
      ('helling_zoek_x', 7, '1,3', 'x ='::text),
      ('helling_zoek_x', 8, '0,5', 'x ='::text),
      ('top', 1, '2', 'x ='::text),
      ('top', 2, '4', 'x ='::text),
      ('top', 3, '2', 'x ='::text),
      ('top', 4, 'pi/6', 'x ='::text),
      ('top', 5, '1/2', NULL::text),
      ('top', 6, '9', NULL::text),
      ('top', 7, '-1', NULL::text),
      ('top', 8, 'sqrt(2)', NULL::text),
      ('kleinste_of_grootste', 1, '2', 'x ='::text),
      ('kleinste_of_grootste', 2, '3', 'x ='::text),
      ('kleinste_of_grootste', 3, '4', 'x ='::text),
      ('kleinste_of_grootste', 4, '2', 'x ='::text),
      ('kleinste_of_grootste', 5, '3/e', NULL::text),
      ('kleinste_of_grootste', 6, '4', NULL::text),
      ('kleinste_of_grootste', 7, '21', NULL::text),
      ('kleinste_of_grootste', 8, '1/e^2', NULL::text),
      ('loodrechte_lijn', 1, '-3/2', 'x ='::text),
      ('loodrechte_lijn', 2, '-9/4', 'x ='::text),
      ('loodrechte_lijn', 3, '-7/3', 'x ='::text),
      ('loodrechte_lijn', 4, '3/2', 'x ='::text),
      ('loodrechte_lijn', 5, '7/2', 'x ='::text),
      ('loodrechte_lijn', 6, '-5/4', 'x ='::text),
      ('loodrechte_lijn', 7, '-7/2', 'x ='::text),
      ('loodrechte_lijn', 8, '-9/8', 'x ='::text),
      ('buigpunt_en_buigraaklijn', 1, '4', 'x ='::text),
      ('buigpunt_en_buigraaklijn', 2, '-1', 'x ='::text),
      ('buigpunt_en_buigraaklijn', 3, '3/2', 'x ='::text),
      ('buigpunt_en_buigraaklijn', 4, '2', 'x ='::text),
      ('buigpunt_en_buigraaklijn', 5, '-3x + 3', 'y ='::text),
      ('buigpunt_en_buigraaklijn', 6, '-12x + 13', 'y ='::text),
      ('buigpunt_en_buigraaklijn', 7, '-3x - 1', 'y ='::text),
      ('buigpunt_en_buigraaklijn', 8, '-x + pi', 'y ='::text)
    ) AS verwacht(slug, volg, antwoord, voorvoegsel)
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.questions_new q
      JOIN public.topic_clusters_new c ON c.id = q.cluster_id
      JOIN public.topics_new t ON t.id = q.topic_id
      WHERE t.slug = 'h16_examentraining'
        AND c.slug = verwacht.slug
        AND q.order_index = verwacht.volg
        AND q.answer = verwacht.antwoord
        AND q.answer_prefix IS NOT DISTINCT FROM verwacht.voorvoegsel
    )
  ) THEN
    RAISE EXCEPTION 'Niet elke opgave van de examentraining heeft het verwachte antwoord';
  END IF;
END $$;

COMMIT;
