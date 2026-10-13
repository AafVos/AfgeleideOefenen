-- Hoofdstuk 15, paragraaf 15.1: hellingen, buigpunten en toppen.
-- Eigen varianten, geen boekopgaven. Elk antwoord is exact nageteld.
-- Vijf soorten, elk 8 opgaven, van makkelijk naar moeilijk.
-- Antwoord is het kale getal. De tekst vóór het vak staat in answer_prefix.
-- Herhaalbaar: een tweede keer draaien voegt niets dubbel toe.

BEGIN;

INSERT INTO public.chapters (slug, title, book_part, order_index)
VALUES ('h15', 'Afgeleiden en primitieven', 4, 15)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.topics_new (slug, title, chapter_id, order_index, is_unlocked_by_default)
SELECT 'h15_hellingen', 'Hellingen, buigpunten en toppen', c.id, 1, false
FROM public.chapters c
WHERE c.slug = 'h15'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index)
SELECT t.id, v.slug, v.title, v.order_index
FROM public.topics_new t
JOIN (VALUES
  ('x_buigpunt', 'x van het buigpunt', 1::smallint),
  ('x_van_de_top', 'x van de top', 2::smallint),
  ('waarde_van_de_top', 'waarde van de top', 3::smallint),
  ('parameter_bij_buigpunt', 'parameter bij een buigpunt', 4::smallint),
  ('afstand_tussen_toppen', 'toppen even ver van O', 5::smallint)
) AS v(slug, title, order_index)
  ON true
WHERE t.slug = 'h15_hellingen'
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
    'x_buigpunt', 1, 1,
    $vraag$Gegeven is $f(x) = x^{3} - 3x^{2} + x$. Bereken de $x$ van het buigpunt.$vraag$,
    '1', '1', 'x =',
    '{}'::text[]
  ),
  (
    'x_buigpunt', 2, 1,
    $vraag$Gegeven is $f(x) = x^{3} + 6x^{2} + 2x$. Bereken de $x$ van het buigpunt.$vraag$,
    '-2', '-2', 'x =',
    ARRAY['(-2)']::text[]
  ),
  (
    'x_buigpunt', 3, 1,
    $vraag$Gegeven is $f(x) = x^{3} - 9x^{2} + 4$. Bereken de $x$ van het buigpunt.$vraag$,
    '3', '3', 'x =',
    '{}'::text[]
  ),
  (
    'x_buigpunt', 4, 2,
    $vraag$Gegeven is $f(x) = 2x^{3} + 3x^{2} - x$. Bereken de $x$ van het buigpunt.$vraag$,
    '-1/2', '-\dfrac{1}{2}', 'x =',
    ARRAY['-(1)/(2)', '-(1)/2', '(-1)/(2)', '(-1)/2', '-0.5', '-0,5']::text[]
  ),
  (
    'x_buigpunt', 5, 2,
    $vraag$Gegeven is $f(x) = x^{3} + x^{2} - 5x$. Bereken de $x$ van het buigpunt.$vraag$,
    '-1/3', '-\dfrac{1}{3}', 'x =',
    ARRAY['-(1)/(3)', '-(1)/3', '(-1)/(3)', '(-1)/3']::text[]
  ),
  (
    'x_buigpunt', 6, 2,
    $vraag$Gegeven is $f(x) = x^{3} - 2x^{2} + 7x$. Bereken de $x$ van het buigpunt.$vraag$,
    '2/3', '\dfrac{2}{3}', 'x =',
    ARRAY['(2)/(3)', '(2)/3']::text[]
  ),
  (
    'x_buigpunt', 7, 3,
    $vraag$Je volgt een auto. De plaats in meter na $t$ seconden is $s(t) = t^{3} - 6t^{2} + 5t$. Op welk tijdstip gaat de grafiek over van toenemend dalend naar afnemend dalend?$vraag$,
    '2', '2', 't =',
    '{}'::text[]
  ),
  (
    'x_buigpunt', 8, 3,
    $vraag$Gegeven is $f(x) = x^{3} - 4x^{2} + 5x + 1$. Bereken de $x$ van het buigpunt.$vraag$,
    '4/3', '\dfrac{4}{3}', 'x =',
    ARRAY['(4)/(3)', '(4)/3']::text[]
  ),
  (
    'x_van_de_top', 1, 1,
    $vraag$Gegeven is $f(x) = x^{3} - 3x$. Bereken de $x$ van het maximum.$vraag$,
    '-1', '-1', 'x =',
    ARRAY['(-1)']::text[]
  ),
  (
    'x_van_de_top', 2, 1,
    $vraag$Gegeven is $f(x) = -x^{3} + 3x$. Bereken de $x$ van het maximum.$vraag$,
    '1', '1', 'x =',
    '{}'::text[]
  ),
  (
    'x_van_de_top', 3, 1,
    $vraag$Gegeven is $f(x) = x^{3} - 3x^{2}$. Bereken de $x$ van het minimum.$vraag$,
    '2', '2', 'x =',
    '{}'::text[]
  ),
  (
    'x_van_de_top', 4, 2,
    $vraag$Gegeven is $f(x) = 2x^{3} + 3x^{2} - 12x$. Bereken de $x$ van het maximum.$vraag$,
    '-2', '-2', 'x =',
    ARRAY['(-2)']::text[]
  ),
  (
    'x_van_de_top', 5, 2,
    $vraag$Gegeven is $f(x) = x^{3} + x^{2} - x$. Bereken de $x$ van het minimum.$vraag$,
    '1/3', '\dfrac{1}{3}', 'x =',
    ARRAY['(1)/(3)', '(1)/3']::text[]
  ),
  (
    'x_van_de_top', 6, 2,
    $vraag$Gegeven is $f(x) = -x^{3} + 6x^{2} - 9x$. Bereken de $x$ van het maximum.$vraag$,
    '3', '3', 'x =',
    '{}'::text[]
  ),
  (
    'x_van_de_top', 7, 3,
    $vraag$Gegeven is $f(x) = x\,e^{-2x}$, met $x > 0$. Bereken de $x$ van het maximum.$vraag$,
    '1/2', '\dfrac{1}{2}', 'x =',
    ARRAY['(1)/(2)', '(1)/2', '0.5', '0,5']::text[]
  ),
  (
    'x_van_de_top', 8, 3,
    $vraag$De concentratie na $t$ uur is $C(t) = t^{2}\,e^{-t}$, met $t \geq 0$. Op welk tijdstip is de concentratie het grootst?$vraag$,
    '2', '2', 't =',
    '{}'::text[]
  ),
  (
    'waarde_van_de_top', 1, 1,
    $vraag$Gegeven is $f(x) = x^{3} - 3x$. Bereken de $y$ van het maximum.$vraag$,
    '2', '2', 'y =',
    ARRAY['y=2']::text[]
  ),
  (
    'waarde_van_de_top', 2, 1,
    $vraag$Gegeven is $f(x) = -x^{3} + 12x$. Bereken de $y$ van het maximum.$vraag$,
    '16', '16', 'y =',
    ARRAY['y=16']::text[]
  ),
  (
    'waarde_van_de_top', 3, 1,
    $vraag$Gegeven is $f(x) = x^{3} - 6x^{2} + 9x$. Bereken de $y$ van het maximum.$vraag$,
    '4', '4', 'y =',
    ARRAY['y=4']::text[]
  ),
  (
    'waarde_van_de_top', 4, 2,
    $vraag$Gegeven is $f(x) = x^{3} - 3x^{2}$. Bereken de $y$ van het minimum.$vraag$,
    '-4', '-4', 'y =',
    ARRAY['(-4)', 'y=-4', 'y=(-4)']::text[]
  ),
  (
    'waarde_van_de_top', 5, 2,
    $vraag$Gegeven is $f(x) = x^{3} - 6x^{2} + 9x + 5$. Bereken de $y$ van het maximum.$vraag$,
    '9', '9', 'y =',
    ARRAY['y=9']::text[]
  ),
  (
    'waarde_van_de_top', 6, 2,
    $vraag$De winst in euro bij $x$ honderd producten is $W(x) = 2x\,e^{-x}$, met $x > 0$. Hoe groot is de grootste winst, in euro?$vraag$,
    '2/e', '\dfrac{2}{e}', 'W =',
    ARRAY['2e^{-1}', '2e^(-1)', '(2)/e', '(2)/(e)', 'W=2/e', 'W=(2)/(e)', 'W=2e^{-1}']::text[]
  ),
  (
    'waarde_van_de_top', 7, 3,
    $vraag$Gegeven is $f(x) = x^{3} + x^{2} - x$. Bereken de $y$ van het minimum.$vraag$,
    '-5/27', '-\dfrac{5}{27}', 'y =',
    ARRAY['-(5)/(27)', '-(5)/27', '(-5)/(27)', '(-5)/27', 'y=-5/27', 'y=-(5)/(27)', 'y=-(5)/27', 'y=(-5)/(27)', 'y=(-5)/27']::text[]
  ),
  (
    'waarde_van_de_top', 8, 3,
    $vraag$Je volgt een heuvel. De hoogte in meter is $h(x) = -x^{3} + 3x + 4$. Hoe hoog is de top die een maximum is, in meter?$vraag$,
    '6', '6', 'h =',
    '{}'::text[]
  ),
  (
    'parameter_bij_buigpunt', 1, 1,
    $vraag$Gegeven is $f(x) = ax^{3} + 3x^{2} + 5x + 1$. Bereken $a$ exact zodat de grafiek bij $x = 1$ overgaat van toenemend stijgend naar afnemend stijgend.$vraag$,
    '-1', '-1', 'a =',
    ARRAY['(-1)', 'a=-1', 'a=(-1)']::text[]
  ),
  (
    'parameter_bij_buigpunt', 2, 1,
    $vraag$Gegeven is $f(x) = ax^{3} + 3x^{2} + x$. Bereken $a$ exact zodat de grafiek bij $x = 2$ overgaat van toenemend stijgend naar afnemend stijgend.$vraag$,
    '-1/2', '-\dfrac{1}{2}', 'a =',
    ARRAY['-(1)/(2)', '-(1)/2', '(-1)/(2)', '(-1)/2', '-0.5', '-0,5', 'a=-1/2', 'a=-(1)/(2)', 'a=-(1)/2', 'a=(-1)/(2)', 'a=(-1)/2', 'a=-0.5', 'a=-0,5']::text[]
  ),
  (
    'parameter_bij_buigpunt', 3, 1,
    $vraag$Gegeven is $f(x) = ax^{3} + 3x^{2} + 2x + 4$. Bereken $a$ exact zodat de grafiek bij $x = -1$ overgaat van toenemend dalend naar afnemend dalend.$vraag$,
    '1', '1', 'a =',
    ARRAY['a=1']::text[]
  ),
  (
    'parameter_bij_buigpunt', 4, 2,
    $vraag$Gegeven is $f(x) = ax^{3} + 9x^{2} + 2$. Bereken $a$ exact zodat de grafiek bij $x = 2$ overgaat van toenemend stijgend naar afnemend stijgend.$vraag$,
    '-3/2', '-\dfrac{3}{2}', 'a =',
    ARRAY['-(3)/(2)', '-(3)/2', '(-3)/(2)', '(-3)/2', '-1.5', '-1,5', 'a=-3/2', 'a=-(3)/(2)', 'a=-(3)/2', 'a=(-3)/(2)', 'a=(-3)/2', 'a=-1.5', 'a=-1,5']::text[]
  ),
  (
    'parameter_bij_buigpunt', 5, 2,
    $vraag$Gegeven is $f(x) = ax^{3} + 3x^{2} + x$. Bereken $a$ exact zodat de grafiek bij $x = 3$ overgaat van toenemend stijgend naar afnemend stijgend.$vraag$,
    '-1/3', '-\dfrac{1}{3}', 'a =',
    ARRAY['-(1)/(3)', '-(1)/3', '(-1)/(3)', '(-1)/3', 'a=-1/3', 'a=-(1)/(3)', 'a=-(1)/3', 'a=(-1)/(3)', 'a=(-1)/3']::text[]
  ),
  (
    'parameter_bij_buigpunt', 6, 2,
    $vraag$Gegeven is $f(x) = ax^{3} + 9x^{2} + 2x$. Bereken $a$ exact zodat de grafiek bij $x = 4$ overgaat van toenemend stijgend naar afnemend stijgend.$vraag$,
    '-3/4', '-\dfrac{3}{4}', 'a =',
    ARRAY['-(3)/(4)', '-(3)/4', '(-3)/(4)', '(-3)/4', '-0.75', '-0,75', 'a=-3/4', 'a=-(3)/(4)', 'a=-(3)/4', 'a=(-3)/(4)', 'a=(-3)/4', 'a=-0.75', 'a=-0,75']::text[]
  ),
  (
    'parameter_bij_buigpunt', 7, 3,
    $vraag$Gegeven is $f(x) = ax^{3} - 6x^{2} + x$. Bereken $a$ exact zodat de grafiek bij $x = -3$ overgaat van toenemend stijgend naar afnemend stijgend.$vraag$,
    '-2/3', '-\dfrac{2}{3}', 'a =',
    ARRAY['-(2)/(3)', '-(2)/3', '(-2)/(3)', '(-2)/3', 'a=-2/3', 'a=-(2)/(3)', 'a=-(2)/3', 'a=(-2)/(3)', 'a=(-2)/3']::text[]
  ),
  (
    'parameter_bij_buigpunt', 8, 3,
    $vraag$Gegeven is $f(x) = ax^{3} + (6 - 2a)x^{2} + x$. Bereken $a$ exact zodat de grafiek bij $x = 1$ overgaat van toenemend stijgend naar afnemend stijgend.$vraag$,
    '-6', '-6', 'a =',
    ARRAY['(-6)', 'a=-6', 'a=(-6)']::text[]
  ),
  (
    'afstand_tussen_toppen', 1, 1,
    $vraag$De grafiek van $f(x) = x^{3} - 3x + p$ heeft twee toppen, $A$ en $B$. Bereken $p$ exact zodat $A$ en $B$ even ver van de oorsprong liggen.$vraag$,
    '0', '0', 'p =',
    ARRAY['p=0']::text[]
  ),
  (
    'afstand_tussen_toppen', 2, 1,
    $vraag$De grafiek van $f(x) = x^{3} - 6x^{2} + 9x + p$ heeft twee toppen, $A$ en $B$. Bereken $p$ exact zodat $A$ en $B$ even ver van de oorsprong liggen.$vraag$,
    '-1', '-1', 'p =',
    ARRAY['(-1)', 'p=-1', 'p=(-1)']::text[]
  ),
  (
    'afstand_tussen_toppen', 3, 1,
    $vraag$De grafiek van $f(x) = x^{3} + 6x^{2} + 9x + p$ heeft twee toppen, $A$ en $B$. Bereken $p$ exact zodat $A$ en $B$ even ver van de oorsprong liggen.$vraag$,
    '1', '1', 'p =',
    ARRAY['p=1']::text[]
  ),
  (
    'afstand_tussen_toppen', 4, 2,
    $vraag$De grafiek van $f(x) = x^{3} - 3x^{2} + p$ heeft twee toppen, $A$ en $B$. Bereken $p$ exact zodat $A$ en $B$ even ver van de oorsprong liggen.$vraag$,
    '5/2', '\dfrac{5}{2}', 'p =',
    ARRAY['(5)/(2)', '(5)/2', '2.5', '2,5', 'p=5/2', 'p=(5)/(2)', 'p=(5)/2', 'p=2.5', 'p=2,5']::text[]
  ),
  (
    'afstand_tussen_toppen', 5, 2,
    $vraag$De grafiek van $f(x) = x^{3} + 3x^{2} + p$ heeft twee toppen, $A$ en $B$. Bereken $p$ exact zodat $A$ en $B$ even ver van de oorsprong liggen.$vraag$,
    '-5/2', '-\dfrac{5}{2}', 'p =',
    ARRAY['-(5)/(2)', '-(5)/2', '(-5)/(2)', '(-5)/2', '-2.5', '-2,5', 'p=-5/2', 'p=-(5)/(2)', 'p=-(5)/2', 'p=(-5)/(2)', 'p=(-5)/2', 'p=-2.5', 'p=-2,5']::text[]
  ),
  (
    'afstand_tussen_toppen', 6, 2,
    $vraag$De grafiek van $f(x) = x^{3} + 9x^{2} + 24x + p$ heeft twee toppen, $A$ en $B$. Bereken $p$ exact zodat $A$ en $B$ even ver van de oorsprong liggen.$vraag$,
    '33/2', '\dfrac{33}{2}', 'p =',
    ARRAY['(33)/(2)', '(33)/2', '16.5', '16,5', 'p=33/2', 'p=(33)/(2)', 'p=(33)/2', 'p=16.5', 'p=16,5']::text[]
  ),
  (
    'afstand_tussen_toppen', 7, 3,
    $vraag$De grafiek van $f(x) = x^{3} - 9x^{2} + 24x + p$ heeft twee toppen, $A$ en $B$. Bereken $p$ exact zodat $A$ en $B$ even ver van de oorsprong liggen.$vraag$,
    '-33/2', '-\dfrac{33}{2}', 'p =',
    ARRAY['-(33)/(2)', '-(33)/2', '(-33)/(2)', '(-33)/2', '-16.5', '-16,5', 'p=-33/2', 'p=-(33)/(2)', 'p=-(33)/2', 'p=(-33)/(2)', 'p=(-33)/2', 'p=-16.5', 'p=-16,5']::text[]
  ),
  (
    'afstand_tussen_toppen', 8, 3,
    $vraag$De grafiek van $f(x) = x^{3} - 6x^{2} + p$ heeft twee toppen, $A$ en $B$. Bereken $p$ exact zodat $A$ en $B$ even ver van de oorsprong liggen.$vraag$,
    '65/4', '\dfrac{65}{4}', 'p =',
    ARRAY['(65)/(4)', '(65)/4', '16.25', '16,25', 'p=65/4', 'p=(65)/(4)', 'p=(65)/4', 'p=16.25', 'p=16,25']::text[]
  )
) AS v(cluster_slug, order_index, difficulty, latex_body, answer, latex_answer, answer_prefix, alternatives)
JOIN public.topics_new t
  ON t.slug = 'h15_hellingen'
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
  ('x_buigpunt', 1, 0, $stap$Je zoekt de $x$ van het buigpunt van $f$. Daar is $f''(x) = 0$ en wisselt $f''$ van teken.$stap$),
  ('x_buigpunt', 1, 1, $stap$$f'(x) = 3x^{2} - 6x + 1$ en $f''(x) = 6x - 6$.$stap$),
  ('x_buigpunt', 1, 2, $stap$Stel $f''(x) = 0$. Dan is $6x - 6 = 0$, dus $x = 1$.$stap$),
  ('x_buigpunt', 1, 3, $stap$Links van $x = 1$ is $f''$ negatief, rechts positief. $f'(1) = -2 < 0$. De grafiek gaat over van toenemend dalend naar afnemend dalend.$stap$),
  ('x_buigpunt', 2, 0, $stap$Je zoekt de $x$ van het buigpunt van $f$. Daar is $f''(x) = 0$ en wisselt $f''$ van teken.$stap$),
  ('x_buigpunt', 2, 1, $stap$$f'(x) = 3x^{2} + 12x + 2$ en $f''(x) = 6x + 12$.$stap$),
  ('x_buigpunt', 2, 2, $stap$Stel $f''(x) = 0$. Dan is $6x + 12 = 0$, dus $x = -2$.$stap$),
  ('x_buigpunt', 2, 3, $stap$Links van $x = -2$ is $f''$ negatief, rechts positief. $f'(-2) = -10 < 0$. De grafiek gaat over van toenemend dalend naar afnemend dalend.$stap$),
  ('x_buigpunt', 3, 0, $stap$Je zoekt de $x$ van het buigpunt van $f$. Daar is $f''(x) = 0$ en wisselt $f''$ van teken.$stap$),
  ('x_buigpunt', 3, 1, $stap$$f'(x) = 3x^{2} - 18x$ en $f''(x) = 6x - 18$.$stap$),
  ('x_buigpunt', 3, 2, $stap$Stel $f''(x) = 0$. Dan is $6x - 18 = 0$, dus $x = 3$.$stap$),
  ('x_buigpunt', 3, 3, $stap$Links van $x = 3$ is $f''$ negatief, rechts positief. $f'(3) = -27 < 0$. De grafiek gaat over van toenemend dalend naar afnemend dalend.$stap$),
  ('x_buigpunt', 4, 0, $stap$Je zoekt de $x$ van het buigpunt van $f$. Daar is $f''(x) = 0$ en wisselt $f''$ van teken.$stap$),
  ('x_buigpunt', 4, 1, $stap$$f'(x) = 6x^{2} + 6x - 1$ en $f''(x) = 12x + 6$.$stap$),
  ('x_buigpunt', 4, 2, $stap$Stel $f''(x) = 0$. Dan is $12x + 6 = 0$, dus $x = -\dfrac{1}{2}$.$stap$),
  ('x_buigpunt', 4, 3, $stap$Links van $x = -\dfrac{1}{2}$ is $f''$ negatief, rechts positief. $f'(-\dfrac{1}{2}) = -\dfrac{5}{2} < 0$. De grafiek gaat over van toenemend dalend naar afnemend dalend.$stap$),
  ('x_buigpunt', 5, 0, $stap$Je zoekt de $x$ van het buigpunt van $f$. Daar is $f''(x) = 0$ en wisselt $f''$ van teken.$stap$),
  ('x_buigpunt', 5, 1, $stap$$f'(x) = 3x^{2} + 2x - 5$ en $f''(x) = 6x + 2$.$stap$),
  ('x_buigpunt', 5, 2, $stap$Stel $f''(x) = 0$. Dan is $6x + 2 = 0$, dus $x = -\dfrac{1}{3}$.$stap$),
  ('x_buigpunt', 5, 3, $stap$Links van $x = -\dfrac{1}{3}$ is $f''$ negatief, rechts positief. $f'(-\dfrac{1}{3}) = -\dfrac{16}{3} < 0$. De grafiek gaat over van toenemend dalend naar afnemend dalend.$stap$),
  ('x_buigpunt', 6, 0, $stap$Je zoekt de $x$ van het buigpunt van $f$. Daar is $f''(x) = 0$ en wisselt $f''$ van teken.$stap$),
  ('x_buigpunt', 6, 1, $stap$$f'(x) = 3x^{2} - 4x + 7$ en $f''(x) = 6x - 4$.$stap$),
  ('x_buigpunt', 6, 2, $stap$Stel $f''(x) = 0$. Dan is $6x - 4 = 0$, dus $x = \dfrac{2}{3}$.$stap$),
  ('x_buigpunt', 6, 3, $stap$Links van $x = \dfrac{2}{3}$ is $f''$ negatief, rechts positief. $f'(\dfrac{2}{3}) = \dfrac{17}{3} > 0$. De grafiek gaat over van afnemend stijgend naar toenemend stijgend.$stap$),
  ('x_buigpunt', 7, 0, $stap$De plaats is $s(t) = t^{3} - 6t^{2} + 5t$. Je zoekt het tijdstip waar de grafiek overgaat van toenemend dalend naar afnemend dalend. Dat is het buigpunt: daar is $s''(t) = 0$ en wisselt $s''$ van teken.$stap$),
  ('x_buigpunt', 7, 1, $stap$$s'(t) = 3t^{2} - 12t + 5$ en $s''(t) = 6t - 12$.$stap$),
  ('x_buigpunt', 7, 2, $stap$Stel $s''(t) = 0$. Dan is $6t - 12 = 0$, dus $t = 2$.$stap$),
  ('x_buigpunt', 7, 3, $stap$Links van $t = 2$ is $s''$ negatief, rechts positief. $s'(2) = -7 < 0$. De grafiek gaat over van toenemend dalend naar afnemend dalend.$stap$),
  ('x_buigpunt', 8, 0, $stap$Je zoekt de $x$ van het buigpunt van $f$. Daar is $f''(x) = 0$ en wisselt $f''$ van teken.$stap$),
  ('x_buigpunt', 8, 1, $stap$$f'(x) = 3x^{2} - 8x + 5$ en $f''(x) = 6x - 8$.$stap$),
  ('x_buigpunt', 8, 2, $stap$Stel $f''(x) = 0$. Dan is $6x - 8 = 0$, dus $x = \dfrac{4}{3}$.$stap$),
  ('x_buigpunt', 8, 3, $stap$Links van $x = \dfrac{4}{3}$ is $f''$ negatief, rechts positief. $f'(\dfrac{4}{3}) = -\dfrac{1}{3} < 0$. De grafiek gaat over van toenemend dalend naar afnemend dalend.$stap$),
  ('x_van_de_top', 1, 0, $stap$Je zoekt de $x$ van het maximum. Stel $f'(x) = 0$ en kijk met $f''$ welke top een maximum is.$stap$),
  ('x_van_de_top', 1, 1, $stap$$f'(x) = 3x^{2} - 3 = 3(x + 1)(x - 1)$. En $f''(x) = 6x$.$stap$),
  ('x_van_de_top', 1, 2, $stap$$f'(x) = 0$ geeft $x = -1$ of $x = 1$. $f''(-1) = -6$ dus een maximum. $f''(1) = 6$ dus een minimum.$stap$),
  ('x_van_de_top', 1, 3, $stap$Het maximum zit bij $x = -1$. Controle: $f(-2) = -2$ en $f(0) = 0$, allebei kleiner dan $f(-1) = 2$.$stap$),
  ('x_van_de_top', 2, 0, $stap$Je zoekt de $x$ van het maximum. Stel $f'(x) = 0$ en kijk met $f''$ welke top een maximum is.$stap$),
  ('x_van_de_top', 2, 1, $stap$$f'(x) = -3x^{2} + 3 = -3(x + 1)(x - 1)$. En $f''(x) = -6x$.$stap$),
  ('x_van_de_top', 2, 2, $stap$$f'(x) = 0$ geeft $x = -1$ of $x = 1$. $f''(-1) = 6$ dus een minimum. $f''(1) = -6$ dus een maximum.$stap$),
  ('x_van_de_top', 2, 3, $stap$Het maximum zit bij $x = 1$. Controle: $f(0) = 0$ en $f(2) = -2$, allebei kleiner dan $f(1) = 2$.$stap$),
  ('x_van_de_top', 3, 0, $stap$Je zoekt de $x$ van het minimum. Stel $f'(x) = 0$ en kijk met $f''$ welke top een minimum is.$stap$),
  ('x_van_de_top', 3, 1, $stap$$f'(x) = 3x^{2} - 6x = 3x(x - 2)$. En $f''(x) = 6x - 6$.$stap$),
  ('x_van_de_top', 3, 2, $stap$$f'(x) = 0$ geeft $x = 0$ of $x = 2$. $f''(0) = -6$ dus een maximum. $f''(2) = 6$ dus een minimum.$stap$),
  ('x_van_de_top', 3, 3, $stap$Het minimum zit bij $x = 2$. Controle: $f(1) = -2$ en $f(3) = 0$, allebei groter dan $f(2) = -4$.$stap$),
  ('x_van_de_top', 4, 0, $stap$Je zoekt de $x$ van het maximum. Stel $f'(x) = 0$ en kijk met $f''$ welke top een maximum is.$stap$),
  ('x_van_de_top', 4, 1, $stap$$f'(x) = 6x^{2} + 6x - 12 = 6(x + 2)(x - 1)$. En $f''(x) = 12x + 6$.$stap$),
  ('x_van_de_top', 4, 2, $stap$$f'(x) = 0$ geeft $x = -2$ of $x = 1$. $f''(-2) = -18$ dus een maximum. $f''(1) = 18$ dus een minimum.$stap$),
  ('x_van_de_top', 4, 3, $stap$Het maximum zit bij $x = -2$. Controle: $f(-3) = 9$ en $f(-1) = 13$, allebei kleiner dan $f(-2) = 20$.$stap$),
  ('x_van_de_top', 5, 0, $stap$Je zoekt de $x$ van het minimum. Stel $f'(x) = 0$ en kijk met $f''$ welke top een minimum is.$stap$),
  ('x_van_de_top', 5, 1, $stap$$f'(x) = 3x^{2} + 2x - 1$. En $f''(x) = 6x + 2$.$stap$),
  ('x_van_de_top', 5, 2, $stap$$f'(x) = 0$ geeft $x = -1$ of $x = \dfrac{1}{3}$. $f''(-1) = -4$ dus een maximum. $f''(\dfrac{1}{3}) = 4$ dus een minimum.$stap$),
  ('x_van_de_top', 5, 3, $stap$Het minimum zit bij $x = \dfrac{1}{3}$. Controle: $f(-\dfrac{2}{3}) = \dfrac{22}{27}$ en $f(\dfrac{4}{3}) = \dfrac{76}{27}$, allebei groter dan $f(\dfrac{1}{3}) = -\dfrac{5}{27}$.$stap$),
  ('x_van_de_top', 6, 0, $stap$Je zoekt de $x$ van het maximum. Stel $f'(x) = 0$ en kijk met $f''$ welke top een maximum is.$stap$),
  ('x_van_de_top', 6, 1, $stap$$f'(x) = -3x^{2} + 12x - 9 = -3(x - 1)(x - 3)$. En $f''(x) = -6x + 12$.$stap$),
  ('x_van_de_top', 6, 2, $stap$$f'(x) = 0$ geeft $x = 1$ of $x = 3$. $f''(1) = 6$ dus een minimum. $f''(3) = -6$ dus een maximum.$stap$),
  ('x_van_de_top', 6, 3, $stap$Het maximum zit bij $x = 3$. Controle: $f(2) = -2$ en $f(4) = -4$, allebei kleiner dan $f(3) = 0$.$stap$),
  ('x_van_de_top', 7, 0, $stap$Je zoekt de $x$ van het maximum, met $x > 0$. Stel $f'(x) = 0$ en controleer met $f''$ dat het een maximum is.$stap$),
  ('x_van_de_top', 7, 1, $stap$Productregel. De afgeleide van $x$ is $1$. De afgeleide van $e^{-2x}$ is $-2e^{-2x}$. Dus $f'(x) = e^{-2x} + x \cdot (-2e^{-2x}) = e^{-2x}(1 - 2x)$.$stap$),
  ('x_van_de_top', 7, 2, $stap$$e^{-2x}$ is nooit $0$. Dus $1 - 2x = 0$ en $x = \dfrac{1}{2}$. De tweede afgeleide is $f''(x) = e^{-2x}(4x - 4)$. Dan is $f''\!\left(\dfrac{1}{2}\right) = e^{-1} \cdot (-2) < 0$, dus een maximum.$stap$),
  ('x_van_de_top', 7, 3, $stap$Controle: $f\!\left(\dfrac{1}{4}\right) = \dfrac{1}{4}e^{-1/2}$ is kleiner dan $f\!\left(\dfrac{1}{2}\right) = \dfrac{1}{2}e^{-1}$, want hun quotiënt is $\dfrac{\sqrt{e}}{2} < 1$. En $f(1) = e^{-2}$ is ook kleiner, want $2 < e$.$stap$),
  ('x_van_de_top', 8, 0, $stap$Je zoekt het tijdstip waarop de concentratie het grootst is. Stel $C'(t) = 0$ en kijk of de concentratie daar een maximum heeft.$stap$),
  ('x_van_de_top', 8, 1, $stap$Productregel. De afgeleide van $t^{2}$ is $2t$. De afgeleide van $e^{-t}$ is $-e^{-t}$. Dus $C'(t) = 2t\,e^{-t} + t^{2} \cdot (-e^{-t}) = t\,e^{-t}(2 - t)$.$stap$),
  ('x_van_de_top', 8, 2, $stap$$e^{-t}$ is nooit $0$. Op $t \geq 0$ geeft $t(2 - t) = 0$ de tijdstippen $t = 0$ en $t = 2$. Bij $t = 0$ is de concentratie $0$. Verder is $C''(t) = e^{-t}(t^{2} - 4t + 2)$, dus $C''(2) = -2e^{-2} < 0$. Het is een maximum.$stap$),
  ('x_van_de_top', 8, 3, $stap$Controle: $C(1) = e^{-1}$ en $C(3) = 9e^{-3}$. Allebei kleiner dan $C(2) = 4e^{-2}$, want $e < 4$ en $9 < 4e$.$stap$),
  ('waarde_van_de_top', 1, 0, $stap$Je zoekt de $y$ van het maximum. Eerst de $x$ waar $f'(x) = 0$.$stap$),
  ('waarde_van_de_top', 1, 1, $stap$$f'(x) = 3x^{2} - 3 = 3(x + 1)(x - 1)$. $f'(x) = 0$ geeft $x = -1$ of $x = 1$. $f''(-1) = -6$ dus een maximum. $f''(1) = 6$ dus een minimum.$stap$),
  ('waarde_van_de_top', 1, 2, $stap$Vul de $x$ van het maximum in: $f(-1) = -1 + 3 = 2$.$stap$),
  ('waarde_van_de_top', 1, 3, $stap$Controle: $f(-2) = -2$ en $f(0) = 0$, allebei kleiner dan $f(-1) = 2$.$stap$),
  ('waarde_van_de_top', 2, 0, $stap$Je zoekt de $y$ van het maximum. Eerst de $x$ waar $f'(x) = 0$.$stap$),
  ('waarde_van_de_top', 2, 1, $stap$$f'(x) = -3x^{2} + 12 = -3(x + 2)(x - 2)$. $f'(x) = 0$ geeft $x = -2$ of $x = 2$. $f''(-2) = 12$ dus een minimum. $f''(2) = -12$ dus een maximum.$stap$),
  ('waarde_van_de_top', 2, 2, $stap$Vul de $x$ van het maximum in: $f(2) = -8 + 24 = 16$.$stap$),
  ('waarde_van_de_top', 2, 3, $stap$Controle: $f(1) = 11$ en $f(3) = 9$, allebei kleiner dan $f(2) = 16$.$stap$),
  ('waarde_van_de_top', 3, 0, $stap$Je zoekt de $y$ van het maximum. Eerst de $x$ waar $f'(x) = 0$.$stap$),
  ('waarde_van_de_top', 3, 1, $stap$$f'(x) = 3x^{2} - 12x + 9 = 3(x - 1)(x - 3)$. $f'(x) = 0$ geeft $x = 1$ of $x = 3$. $f''(1) = -6$ dus een maximum. $f''(3) = 6$ dus een minimum.$stap$),
  ('waarde_van_de_top', 3, 2, $stap$Vul de $x$ van het maximum in: $f(1) = 1 - 6 + 9 = 4$.$stap$),
  ('waarde_van_de_top', 3, 3, $stap$Controle: $f(0) = 0$ en $f(2) = 2$, allebei kleiner dan $f(1) = 4$.$stap$),
  ('waarde_van_de_top', 4, 0, $stap$Je zoekt de $y$ van het minimum. Eerst de $x$ waar $f'(x) = 0$.$stap$),
  ('waarde_van_de_top', 4, 1, $stap$$f'(x) = 3x^{2} - 6x = 3x(x - 2)$. $f'(x) = 0$ geeft $x = 0$ of $x = 2$. $f''(0) = -6$ dus een maximum. $f''(2) = 6$ dus een minimum.$stap$),
  ('waarde_van_de_top', 4, 2, $stap$Vul de $x$ van het minimum in: $f(2) = 8 - 12 = -4$.$stap$),
  ('waarde_van_de_top', 4, 3, $stap$Controle: $f(1) = -2$ en $f(3) = 0$, allebei groter dan $f(2) = -4$.$stap$),
  ('waarde_van_de_top', 5, 0, $stap$Je zoekt de $y$ van het maximum. Eerst de $x$ waar $f'(x) = 0$.$stap$),
  ('waarde_van_de_top', 5, 1, $stap$$f'(x) = 3x^{2} - 12x + 9 = 3(x - 1)(x - 3)$. $f'(x) = 0$ geeft $x = 1$ of $x = 3$. $f''(1) = -6$ dus een maximum. $f''(3) = 6$ dus een minimum.$stap$),
  ('waarde_van_de_top', 5, 2, $stap$Vul de $x$ van het maximum in: $f(1) = 1 - 6 + 9 + 5 = 9$.$stap$),
  ('waarde_van_de_top', 5, 3, $stap$Controle: $f(0) = 5$ en $f(2) = 7$, allebei kleiner dan $f(1) = 9$.$stap$),
  ('waarde_van_de_top', 6, 0, $stap$Je zoekt de grootste winst. Eerst de $x$ waar $W'(x) = 0$, daarna de winst daar.$stap$),
  ('waarde_van_de_top', 6, 1, $stap$Productregel. De afgeleide van $2x$ is $2$. De afgeleide van $e^{-x}$ is $-e^{-x}$. Dus $W'(x) = 2e^{-x} + 2x \cdot (-e^{-x}) = 2e^{-x}(1 - x)$.$stap$),
  ('waarde_van_de_top', 6, 2, $stap$$2e^{-x}$ is nooit $0$. Dus $x = 1$. Voor $x < 1$ is $W'(x)$ positief en voor $x > 1$ negatief, dus een maximum.$stap$),
  ('waarde_van_de_top', 6, 3, $stap$Vul in: $W(1) = 2 \cdot 1 \cdot e^{-1} = \dfrac{2}{e}$. Controle: $W(2) = 4e^{-2}$. Dat is kleiner, want $4 < 2e$.$stap$),
  ('waarde_van_de_top', 7, 0, $stap$Je zoekt de $y$ van het minimum. Eerst de $x$ waar $f'(x) = 0$.$stap$),
  ('waarde_van_de_top', 7, 1, $stap$$f'(x) = 3x^{2} + 2x - 1$. $f'(x) = 0$ geeft $x = -1$ of $x = \dfrac{1}{3}$. $f''(-1) = -4$ dus een maximum. $f''(\dfrac{1}{3}) = 4$ dus een minimum.$stap$),
  ('waarde_van_de_top', 7, 2, $stap$Vul de $x$ van het minimum in: $f(\dfrac{1}{3}) = \dfrac{1}{27} + \dfrac{1}{9} - \dfrac{1}{3} = -\dfrac{5}{27}$.$stap$),
  ('waarde_van_de_top', 7, 3, $stap$Controle: $f(-\dfrac{2}{3}) = \dfrac{22}{27}$ en $f(\dfrac{4}{3}) = \dfrac{76}{27}$, allebei groter dan $f(\dfrac{1}{3}) = -\dfrac{5}{27}$.$stap$),
  ('waarde_van_de_top', 8, 0, $stap$De hoogte is $h(x) = -x^{3} + 3x + 4$. Je zoekt hoe hoog de hoogste top is, in meter. Eerst de $x$ van die top.$stap$),
  ('waarde_van_de_top', 8, 1, $stap$$h'(x) = -3x^{2} + 3 = -3(x + 1)(x - 1)$. $h'(x) = 0$ geeft $x = -1$ of $x = 1$. $h''(-1) = 6$ dus een minimum. $h''(1) = -6$ dus een maximum.$stap$),
  ('waarde_van_de_top', 8, 2, $stap$Vul de $x$ van het maximum in: $h(1) = -1 + 3 + 4 = 6$.$stap$),
  ('waarde_van_de_top', 8, 3, $stap$Controle: $h(0) = 4$ en $h(2) = 2$, allebei kleiner dan $h(1) = 6$.$stap$),
  ('parameter_bij_buigpunt', 1, 0, $stap$De grafiek gaat bij $x = 1$ over van toenemend stijgend naar afnemend stijgend. Dan is $f''(1) = 0$ en wisselt $f''$ daar van teken.$stap$),
  ('parameter_bij_buigpunt', 1, 1, $stap$$f'(x) = 3ax^{2} + 6x + 5$ en $f''(x) = 6ax + 6$.$stap$),
  ('parameter_bij_buigpunt', 1, 2, $stap$Stel $f''(1) = 0$. Dan is $6a + 6 = 0$, dus $6a = -6$ en $a = -1$.$stap$),
  ('parameter_bij_buigpunt', 1, 3, $stap$Met $a = -1$ is $f''(x) = -6x + 6$. Links van $x = 1$ is $f''$ positief, rechts negatief. En $f'(1) = 8 > 0$. De overgang klopt.$stap$),
  ('parameter_bij_buigpunt', 2, 0, $stap$De grafiek gaat bij $x = 2$ over van toenemend stijgend naar afnemend stijgend. Dan is $f''(2) = 0$ en wisselt $f''$ daar van teken.$stap$),
  ('parameter_bij_buigpunt', 2, 1, $stap$$f'(x) = 3ax^{2} + 6x + 1$ en $f''(x) = 6ax + 6$.$stap$),
  ('parameter_bij_buigpunt', 2, 2, $stap$Stel $f''(2) = 0$. Dan is $12a + 6 = 0$, dus $12a = -6$ en $a = -\dfrac{1}{2}$.$stap$),
  ('parameter_bij_buigpunt', 2, 3, $stap$Met $a = -\dfrac{1}{2}$ is $f''(x) = -3x + 6$. Links van $x = 2$ is $f''$ positief, rechts negatief. En $f'(2) = 7 > 0$. De overgang klopt.$stap$),
  ('parameter_bij_buigpunt', 3, 0, $stap$De grafiek gaat bij $x = -1$ over van toenemend dalend naar afnemend dalend. Dan is $f''(-1) = 0$ en wisselt $f''$ daar van teken.$stap$),
  ('parameter_bij_buigpunt', 3, 1, $stap$$f'(x) = 3ax^{2} + 6x + 2$ en $f''(x) = 6ax + 6$.$stap$),
  ('parameter_bij_buigpunt', 3, 2, $stap$Stel $f''(-1) = 0$. Dan is $-6a + 6 = 0$, dus $-6a = -6$ en $a = 1$.$stap$),
  ('parameter_bij_buigpunt', 3, 3, $stap$Met $a = 1$ is $f''(x) = 6x + 6$. Links van $x = -1$ is $f''$ negatief, rechts positief. En $f'(-1) = -1 < 0$. De overgang klopt.$stap$),
  ('parameter_bij_buigpunt', 4, 0, $stap$De grafiek gaat bij $x = 2$ over van toenemend stijgend naar afnemend stijgend. Dan is $f''(2) = 0$ en wisselt $f''$ daar van teken.$stap$),
  ('parameter_bij_buigpunt', 4, 1, $stap$$f'(x) = 3ax^{2} + 18x$ en $f''(x) = 6ax + 18$.$stap$),
  ('parameter_bij_buigpunt', 4, 2, $stap$Stel $f''(2) = 0$. Dan is $12a + 18 = 0$, dus $12a = -18$ en $a = -\dfrac{3}{2}$.$stap$),
  ('parameter_bij_buigpunt', 4, 3, $stap$Met $a = -\dfrac{3}{2}$ is $f''(x) = -9x + 18$. Links van $x = 2$ is $f''$ positief, rechts negatief. En $f'(2) = 18 > 0$. De overgang klopt.$stap$),
  ('parameter_bij_buigpunt', 5, 0, $stap$De grafiek gaat bij $x = 3$ over van toenemend stijgend naar afnemend stijgend. Dan is $f''(3) = 0$ en wisselt $f''$ daar van teken.$stap$),
  ('parameter_bij_buigpunt', 5, 1, $stap$$f'(x) = 3ax^{2} + 6x + 1$ en $f''(x) = 6ax + 6$.$stap$),
  ('parameter_bij_buigpunt', 5, 2, $stap$Stel $f''(3) = 0$. Dan is $18a + 6 = 0$, dus $18a = -6$ en $a = -\dfrac{1}{3}$.$stap$),
  ('parameter_bij_buigpunt', 5, 3, $stap$Met $a = -\dfrac{1}{3}$ is $f''(x) = -2x + 6$. Links van $x = 3$ is $f''$ positief, rechts negatief. En $f'(3) = 10 > 0$. De overgang klopt.$stap$),
  ('parameter_bij_buigpunt', 6, 0, $stap$De grafiek gaat bij $x = 4$ over van toenemend stijgend naar afnemend stijgend. Dan is $f''(4) = 0$ en wisselt $f''$ daar van teken.$stap$),
  ('parameter_bij_buigpunt', 6, 1, $stap$$f'(x) = 3ax^{2} + 18x + 2$ en $f''(x) = 6ax + 18$.$stap$),
  ('parameter_bij_buigpunt', 6, 2, $stap$Stel $f''(4) = 0$. Dan is $24a + 18 = 0$, dus $24a = -18$ en $a = -\dfrac{3}{4}$.$stap$),
  ('parameter_bij_buigpunt', 6, 3, $stap$Met $a = -\dfrac{3}{4}$ is $f''(x) = -\dfrac{9}{2}x + 18$. Links van $x = 4$ is $f''$ positief, rechts negatief. En $f'(4) = 38 > 0$. De overgang klopt.$stap$),
  ('parameter_bij_buigpunt', 7, 0, $stap$De grafiek gaat bij $x = -3$ over van toenemend stijgend naar afnemend stijgend. Dan is $f''(-3) = 0$ en wisselt $f''$ daar van teken.$stap$),
  ('parameter_bij_buigpunt', 7, 1, $stap$$f'(x) = 3ax^{2} - 12x + 1$ en $f''(x) = 6ax - 12$.$stap$),
  ('parameter_bij_buigpunt', 7, 2, $stap$Stel $f''(-3) = 0$. Dan is $-18a - 12 = 0$, dus $-18a = 12$ en $a = -\dfrac{2}{3}$.$stap$),
  ('parameter_bij_buigpunt', 7, 3, $stap$Met $a = -\dfrac{2}{3}$ is $f''(x) = -4x - 12$. Links van $x = -3$ is $f''$ positief, rechts negatief. En $f'(-3) = 19 > 0$. De overgang klopt.$stap$),
  ('parameter_bij_buigpunt', 8, 0, $stap$De grafiek gaat bij $x = 1$ over van toenemend stijgend naar afnemend stijgend. Dan is $f''(1) = 0$ en wisselt $f''$ daar van teken, terwijl $f'(1) > 0$.$stap$),
  ('parameter_bij_buigpunt', 8, 1, $stap$De afgeleide van $ax^{3}$ is $3ax^{2}$. De afgeleide van $(6 - 2a)x^{2}$ is $2(6 - 2a)x = (12 - 4a)x$. Dus $f'(x) = 3ax^{2} + (12 - 4a)x + 1$ en $f''(x) = 6ax + 12 - 4a$.$stap$),
  ('parameter_bij_buigpunt', 8, 2, $stap$Stel $f''(1) = 0$. Dan is $6a + 12 - 4a = 0$, dus $2a + 12 = 0$ en $a = -6$.$stap$),
  ('parameter_bij_buigpunt', 8, 3, $stap$Met $a = -6$ is $f''(x) = -36x + 36 = 36(1 - x)$. Links van $x = 1$ is $f''$ positief, rechts negatief. En $f'(1) = 19 > 0$. De grafiek gaat over van toenemend stijgend naar afnemend stijgend.$stap$),
  ('afstand_tussen_toppen', 1, 0, $stap$De toppen vind je met $f'(x) = 0$. Daarna druk je $OA^{2}$ en $OB^{2}$ uit in $p$ en stel je die gelijk.$stap$),
  ('afstand_tussen_toppen', 1, 1, $stap$$f'(x) = 3x^{2} - 3 = 3(x + 1)(x - 1)$. Dus de toppen zitten bij $x = -1$ en $x = 1$. Noem $A$ het punt met $x = -1$ en $B$ het punt met $x = 1$.$stap$),
  ('afstand_tussen_toppen', 1, 2, $stap$$y_A = -1 + 3 + p = 2 + p$ en $y_B = 1 - 3 + p = -2 + p$. Dan is $OA^{2} = (-1)^{2} + (2 + p)^{2}$ en $OB^{2} = 1^{2} + (-2 + p)^{2}$.$stap$),
  ('afstand_tussen_toppen', 1, 3, $stap$$OA^{2} = p^{2} + 4p + 5$ en $OB^{2} = p^{2} - 4p + 5$. Gelijkstellen geeft $8p = 0$, dus $p = 0$. Controle: $y_A = 2$ en $y_B = -2$, en $OA^{2} = OB^{2} = 5$.$stap$),
  ('afstand_tussen_toppen', 2, 0, $stap$De toppen vind je met $f'(x) = 0$. Daarna druk je $OA^{2}$ en $OB^{2}$ uit in $p$ en stel je die gelijk.$stap$),
  ('afstand_tussen_toppen', 2, 1, $stap$$f'(x) = 3x^{2} - 12x + 9 = 3(x - 1)(x - 3)$. Dus de toppen zitten bij $x = 1$ en $x = 3$. Noem $A$ het punt met $x = 1$ en $B$ het punt met $x = 3$.$stap$),
  ('afstand_tussen_toppen', 2, 2, $stap$$y_A = 1 - 6 + 9 + p = 4 + p$ en $y_B = p$. Dan is $OA^{2} = 1^{2} + (4 + p)^{2}$ en $OB^{2} = 3^{2} + p^{2}$.$stap$),
  ('afstand_tussen_toppen', 2, 3, $stap$$OA^{2} = p^{2} + 8p + 17$ en $OB^{2} = p^{2} + 9$. Gelijkstellen geeft $8p = -8$, dus $p = -1$. Controle: $y_A = 3$ en $y_B = -1$, en $OA^{2} = OB^{2} = 10$.$stap$),
  ('afstand_tussen_toppen', 3, 0, $stap$De toppen vind je met $f'(x) = 0$. Daarna druk je $OA^{2}$ en $OB^{2}$ uit in $p$ en stel je die gelijk.$stap$),
  ('afstand_tussen_toppen', 3, 1, $stap$$f'(x) = 3x^{2} + 12x + 9 = 3(x + 3)(x + 1)$. Dus de toppen zitten bij $x = -3$ en $x = -1$. Noem $A$ het punt met $x = -3$ en $B$ het punt met $x = -1$.$stap$),
  ('afstand_tussen_toppen', 3, 2, $stap$$y_A = p$ en $y_B = -1 + 6 - 9 + p = -4 + p$. Dan is $OA^{2} = (-3)^{2} + p^{2}$ en $OB^{2} = (-1)^{2} + (-4 + p)^{2}$.$stap$),
  ('afstand_tussen_toppen', 3, 3, $stap$$OA^{2} = p^{2} + 9$ en $OB^{2} = p^{2} - 8p + 17$. Gelijkstellen geeft $8p = 8$, dus $p = 1$. Controle: $y_A = 1$ en $y_B = -3$, en $OA^{2} = OB^{2} = 10$.$stap$),
  ('afstand_tussen_toppen', 4, 0, $stap$De toppen vind je met $f'(x) = 0$. Daarna druk je $OA^{2}$ en $OB^{2}$ uit in $p$ en stel je die gelijk.$stap$),
  ('afstand_tussen_toppen', 4, 1, $stap$$f'(x) = 3x^{2} - 6x = 3x(x - 2)$. Dus de toppen zitten bij $x = 0$ en $x = 2$. Noem $A$ het punt met $x = 0$ en $B$ het punt met $x = 2$.$stap$),
  ('afstand_tussen_toppen', 4, 2, $stap$$y_A = p$ en $y_B = 8 - 12 + p = -4 + p$. Dan is $OA^{2} = p^{2}$ en $OB^{2} = 2^{2} + (-4 + p)^{2}$.$stap$),
  ('afstand_tussen_toppen', 4, 3, $stap$$OA^{2} = p^{2}$ en $OB^{2} = p^{2} - 8p + 20$. Gelijkstellen geeft $8p = 20$, dus $p = \dfrac{5}{2}$. Controle: $y_A = \dfrac{5}{2}$ en $y_B = -\dfrac{3}{2}$, en $OA^{2} = OB^{2} = \dfrac{25}{4}$.$stap$),
  ('afstand_tussen_toppen', 5, 0, $stap$De toppen vind je met $f'(x) = 0$. Daarna druk je $OA^{2}$ en $OB^{2}$ uit in $p$ en stel je die gelijk.$stap$),
  ('afstand_tussen_toppen', 5, 1, $stap$$f'(x) = 3x^{2} + 6x = 3(x + 2)x$. Dus de toppen zitten bij $x = -2$ en $x = 0$. Noem $A$ het punt met $x = -2$ en $B$ het punt met $x = 0$.$stap$),
  ('afstand_tussen_toppen', 5, 2, $stap$$y_A = -8 + 12 + p = 4 + p$ en $y_B = p$. Dan is $OA^{2} = (-2)^{2} + (4 + p)^{2}$ en $OB^{2} = p^{2}$.$stap$),
  ('afstand_tussen_toppen', 5, 3, $stap$$OA^{2} = p^{2} + 8p + 20$ en $OB^{2} = p^{2}$. Gelijkstellen geeft $8p = -20$, dus $p = -\dfrac{5}{2}$. Controle: $y_A = \dfrac{3}{2}$ en $y_B = -\dfrac{5}{2}$, en $OA^{2} = OB^{2} = \dfrac{25}{4}$.$stap$),
  ('afstand_tussen_toppen', 6, 0, $stap$De toppen vind je met $f'(x) = 0$. Daarna druk je $OA^{2}$ en $OB^{2}$ uit in $p$ en stel je die gelijk.$stap$),
  ('afstand_tussen_toppen', 6, 1, $stap$$f'(x) = 3x^{2} + 18x + 24 = 3(x + 4)(x + 2)$. Dus de toppen zitten bij $x = -4$ en $x = -2$. Noem $A$ het punt met $x = -4$ en $B$ het punt met $x = -2$.$stap$),
  ('afstand_tussen_toppen', 6, 2, $stap$$y_A = -64 + 144 - 96 + p = -16 + p$ en $y_B = -8 + 36 - 48 + p = -20 + p$. Dan is $OA^{2} = (-4)^{2} + (-16 + p)^{2}$ en $OB^{2} = (-2)^{2} + (-20 + p)^{2}$.$stap$),
  ('afstand_tussen_toppen', 6, 3, $stap$$OA^{2} = p^{2} - 32p + 272$ en $OB^{2} = p^{2} - 40p + 404$. Gelijkstellen geeft $8p = 132$, dus $p = \dfrac{33}{2}$. Controle: $y_A = \dfrac{1}{2}$ en $y_B = -\dfrac{7}{2}$, en $OA^{2} = OB^{2} = \dfrac{65}{4}$.$stap$),
  ('afstand_tussen_toppen', 7, 0, $stap$De toppen vind je met $f'(x) = 0$. Daarna druk je $OA^{2}$ en $OB^{2}$ uit in $p$ en stel je die gelijk.$stap$),
  ('afstand_tussen_toppen', 7, 1, $stap$$f'(x) = 3x^{2} - 18x + 24 = 3(x - 2)(x - 4)$. Dus de toppen zitten bij $x = 2$ en $x = 4$. Noem $A$ het punt met $x = 2$ en $B$ het punt met $x = 4$.$stap$),
  ('afstand_tussen_toppen', 7, 2, $stap$$y_A = 8 - 36 + 48 + p = 20 + p$ en $y_B = 64 - 144 + 96 + p = 16 + p$. Dan is $OA^{2} = 2^{2} + (20 + p)^{2}$ en $OB^{2} = 4^{2} + (16 + p)^{2}$.$stap$),
  ('afstand_tussen_toppen', 7, 3, $stap$$OA^{2} = p^{2} + 40p + 404$ en $OB^{2} = p^{2} + 32p + 272$. Gelijkstellen geeft $8p = -132$, dus $p = -\dfrac{33}{2}$. Controle: $y_A = \dfrac{7}{2}$ en $y_B = -\dfrac{1}{2}$, en $OA^{2} = OB^{2} = \dfrac{65}{4}$.$stap$),
  ('afstand_tussen_toppen', 8, 0, $stap$De toppen vind je met $f'(x) = 0$. Daarna druk je $OA^{2}$ en $OB^{2}$ uit in $p$ en stel je die gelijk.$stap$),
  ('afstand_tussen_toppen', 8, 1, $stap$$f'(x) = 3x^{2} - 12x = 3x(x - 4)$. Dus de toppen zitten bij $x = 0$ en $x = 4$. Noem $A$ het punt met $x = 0$ en $B$ het punt met $x = 4$.$stap$),
  ('afstand_tussen_toppen', 8, 2, $stap$$y_A = p$ en $y_B = 64 - 96 + p = -32 + p$. Dan is $OA^{2} = p^{2}$ en $OB^{2} = 4^{2} + (-32 + p)^{2}$.$stap$),
  ('afstand_tussen_toppen', 8, 3, $stap$$OA^{2} = p^{2}$ en $OB^{2} = p^{2} - 64p + 1040$. Gelijkstellen geeft $64p = 1040$, dus $p = \dfrac{65}{4}$. Controle: $y_A = \dfrac{65}{4}$ en $y_B = -\dfrac{63}{4}$, en $OA^{2} = OB^{2} = \dfrac{4225}{16}$.$stap$)
) AS v(cluster_slug, q_order_index, step_order, step_description)
JOIN public.topics_new t
  ON t.slug = 'h15_hellingen'
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
  WHERE t.slug = 'h15_hellingen';

  SELECT count(*) INTO n_vragen
  FROM public.questions_new q
  JOIN public.topics_new t ON t.id = q.topic_id
  WHERE t.slug = 'h15_hellingen';

  SELECT count(*) INTO n_stappen
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  JOIN public.topics_new t ON t.id = q.topic_id
  WHERE t.slug = 'h15_hellingen';

  IF n_soorten <> 5 OR n_vragen <> 40 OR n_stappen <> 160 THEN
    RAISE EXCEPTION 'Hoofdstuk 15.1 klopt niet: % soorten, % opgaven, % stappen', n_soorten, n_vragen, n_stappen;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM (VALUES
      ('x_buigpunt', 1, '1'),
      ('x_buigpunt', 2, '-2'),
      ('x_buigpunt', 3, '3'),
      ('x_buigpunt', 4, '-1/2'),
      ('x_buigpunt', 5, '-1/3'),
      ('x_buigpunt', 6, '2/3'),
      ('x_buigpunt', 7, '2'),
      ('x_buigpunt', 8, '4/3'),
      ('x_van_de_top', 1, '-1'),
      ('x_van_de_top', 2, '1'),
      ('x_van_de_top', 3, '2'),
      ('x_van_de_top', 4, '-2'),
      ('x_van_de_top', 5, '1/3'),
      ('x_van_de_top', 6, '3'),
      ('x_van_de_top', 7, '1/2'),
      ('x_van_de_top', 8, '2'),
      ('waarde_van_de_top', 1, '2'),
      ('waarde_van_de_top', 2, '16'),
      ('waarde_van_de_top', 3, '4'),
      ('waarde_van_de_top', 4, '-4'),
      ('waarde_van_de_top', 5, '9'),
      ('waarde_van_de_top', 6, '2/e'),
      ('waarde_van_de_top', 7, '-5/27'),
      ('waarde_van_de_top', 8, '6'),
      ('parameter_bij_buigpunt', 1, '-1'),
      ('parameter_bij_buigpunt', 2, '-1/2'),
      ('parameter_bij_buigpunt', 3, '1'),
      ('parameter_bij_buigpunt', 4, '-3/2'),
      ('parameter_bij_buigpunt', 5, '-1/3'),
      ('parameter_bij_buigpunt', 6, '-3/4'),
      ('parameter_bij_buigpunt', 7, '-2/3'),
      ('parameter_bij_buigpunt', 8, '-6'),
      ('afstand_tussen_toppen', 1, '0'),
      ('afstand_tussen_toppen', 2, '-1'),
      ('afstand_tussen_toppen', 3, '1'),
      ('afstand_tussen_toppen', 4, '5/2'),
      ('afstand_tussen_toppen', 5, '-5/2'),
      ('afstand_tussen_toppen', 6, '33/2'),
      ('afstand_tussen_toppen', 7, '-33/2'),
      ('afstand_tussen_toppen', 8, '65/4')
    ) AS verwacht(slug, volg, antwoord)
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.questions_new q
      JOIN public.topic_clusters_new c ON c.id = q.cluster_id
      JOIN public.topics_new t ON t.id = q.topic_id
      WHERE t.slug = 'h15_hellingen'
        AND c.slug = verwacht.slug
        AND q.order_index = verwacht.volg
        AND q.answer = verwacht.antwoord
        AND q.answer_prefix IS NOT NULL
    )
  ) THEN
    RAISE EXCEPTION 'Niet elke opgave van hoofdstuk 15.1 heeft het verwachte antwoord';
  END IF;
END $$;

COMMIT;
