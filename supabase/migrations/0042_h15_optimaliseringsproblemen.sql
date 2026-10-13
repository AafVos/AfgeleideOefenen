-- Hoofdstuk 15, paragraaf 15.3: optimaliseringsproblemen.
-- Eigen verhaaltjes, geen boekopgaven. Elk antwoord is exact nageteld.
-- Vier soorten, elk 8 opgaven, van makkelijk naar moeilijk.
-- Antwoord is het kale getal. De tekst vóór het vak staat in answer_prefix.
-- Stappenplan: stap 0 t/m 3.
-- Herhaalbaar: een tweede keer draaien voegt niets dubbel toe.

BEGIN;

INSERT INTO public.chapters (slug, title, book_part, order_index)
VALUES ('h15', 'Afgeleiden en primitieven', 4, 15)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.topics_new (slug, title, chapter_id, order_index, is_unlocked_by_default)
SELECT 'h15_optimaliseren', 'Optimaliseringsproblemen', c.id, 3, false
FROM public.chapters c
WHERE c.slug = 'h15'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index)
SELECT t.id, v.slug, v.title, v.order_index
FROM public.topics_new t
JOIN (VALUES
  ('oppervlakte', 'Oppervlakte', 1::smallint),
  ('afstand', 'Afstand', 2::smallint),
  ('kosten', 'Kosten', 3::smallint),
  ('voorraad', 'Voorraad', 4::smallint)
) AS v(slug, title, order_index)
  ON true
WHERE t.slug = 'h15_optimaliseren'
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
    'oppervlakte', 1, 1,
    $vraag$Je legt een rechthoekig moestuinbed. De oppervlakte in m$^{2}$ is $f(x) = 20x - x^{2}$, met $0 < x < 20$. Voor welke $x$ is de oppervlakte het grootst?$vraag$,
    '10', '10', 'x =',
    ARRAY['x=10']::text[]
  ),
  (
    'oppervlakte', 2, 1,
    $vraag$Je maakt een rechthoekige poster. De oppervlakte in cm$^{2}$ is $f(x) = 24x - 2x^{2}$, met $0 < x < 12$. Voor welke $x$ is de oppervlakte het grootst?$vraag$,
    '6', '6', 'x =',
    ARRAY['x=6']::text[]
  ),
  (
    'oppervlakte', 3, 1,
    $vraag$Je bestraat een rechthoekig terras. De oppervlakte in m$^{2}$ is $f(x) = 18x - 2x^{2}$, met $0 < x < 9$. Bereken exact de grootste oppervlakte.$vraag$,
    '81/2', '\dfrac{81}{2}', 'A =',
    ARRAY['(81)/2', '(81)/(2)', '40.5', '40,5', 'A=81/2', 'A=(81)/2', 'A=(81)/(2)', 'A=40.5', 'A=40,5']::text[]
  ),
  (
    'oppervlakte', 4, 2,
    $vraag$Je spant een driehoekig zeil. De oppervlakte in m$^{2}$ is $f(x) = 30x - 5x^{2}$, met $0 < x < 6$. Hoe groot is de grootste oppervlakte?$vraag$,
    '45', '45', 'A =',
    ARRAY['A=45']::text[]
  ),
  (
    'oppervlakte', 5, 2,
    $vraag$Je maakt een rechthoekig bloemenperk langs een schutting. De oppervlakte in m$^{2}$ is $f(x) = 15x - 3x^{2}$, met $0 < x < 5$. Bereken exact de $x$ waarvoor de oppervlakte het grootst is.$vraag$,
    '5/2', '\dfrac{5}{2}', 'x =',
    ARRAY['(5)/2', '(5)/(2)', '2.5', '2,5', 'x=5/2', 'x=(5)/2', 'x=(5)/(2)', 'x=2.5', 'x=2,5']::text[]
  ),
  (
    'oppervlakte', 6, 2,
    $vraag$Je ontwerpt een raam. De oppervlakte in cm$^{2}$ is $f(x) = 6x^{2} - x^{3}$, met $0 < x < 6$. Hoe groot is de grootste oppervlakte?$vraag$,
    '32', '32', 'A =',
    ARRAY['A=32']::text[]
  ),
  (
    'oppervlakte', 7, 3,
    $vraag$Je tekent een rechthoek onder een boog. De oppervlakte in cm$^{2}$ is $f(x) = x\sqrt{8 - x}$, met $0 < x < 8$. Bereken exact de $x$ waarvoor de oppervlakte het grootst is.$vraag$,
    '16/3', '\dfrac{16}{3}', 'x =',
    ARRAY['(16)/3', '(16)/(3)', 'x=16/3', 'x=(16)/3', 'x=(16)/(3)']::text[]
  ),
  (
    'oppervlakte', 8, 3,
    $vraag$Je ontwerpt een vlieger. De oppervlakte in cm$^{2}$ is $f(x) = 9x^{2} - x^{3}$, met $0 < x < 9$. Hoe groot is de grootste oppervlakte?$vraag$,
    '108', '108', 'A =',
    ARRAY['A=108']::text[]
  ),
  (
    'afstand', 1, 1,
    $vraag$Je fietst langs een rechte weg. De afstand tot je huis in kilometer is $f(t) = t^{2} - 8t + 25$, met $t \geq 0$ de tijd in uren. Op welk tijdstip is de afstand het kleinst?$vraag$,
    '4', '4', 't =',
    ARRAY['t=4']::text[]
  ),
  (
    'afstand', 2, 1,
    $vraag$Je vaart met een boot. De afstand tot de haven in kilometer is $f(t) = t^{2} - 6t + 18$, met $t \geq 0$ de tijd in uren. Hoe groot is de kleinste afstand?$vraag$,
    '9', '9', 's =',
    ARRAY['s=9']::text[]
  ),
  (
    'afstand', 3, 1,
    $vraag$Een drone vliegt weg en komt terug. De afstand tot het startpunt in meter is $f(t) = 3t^{2} - 12t + 16$, met $t \geq 0$ de tijd in seconden. Op welk tijdstip is de afstand het kleinst?$vraag$,
    '2', '2', 't =',
    ARRAY['t=2']::text[]
  ),
  (
    'afstand', 4, 2,
    $vraag$Je loopt door een weiland. De afstand tot de schuur in meter is $f(t) = \sqrt{t^{2} - 10t + 34}$, met $t \geq 0$ de tijd in minuten. Op welk tijdstip is de afstand het kleinst?$vraag$,
    '5', '5', 't =',
    ARRAY['t=5']::text[]
  ),
  (
    'afstand', 5, 2,
    $vraag$Een auto rijdt over een rechte weg. De afstand tot een benzinepomp in kilometer is $f(t) = \sqrt{(t - 2)^{2} + 16}$, met $t \geq 0$ de tijd in uren. Hoe groot is de kleinste afstand?$vraag$,
    '4', '4', 's =',
    ARRAY['s=4']::text[]
  ),
  (
    'afstand', 6, 2,
    $vraag$De grafiek van $g(x) = 12 - x^{2}$ ligt boven de grafiek van $f(x) = 2x$, voor $-4 < x < 2$. De verticale afstand in centimeter is $h(x) = g(x) - f(x)$. Voor welke $x$ is die afstand het grootst?$vraag$,
    '-1', '-1', 'x =',
    ARRAY['(-1)', 'x=-1', 'x=(-1)']::text[]
  ),
  (
    'afstand', 7, 3,
    $vraag$De grafiek van $g(x) = 9 - x^{2}$ ligt boven de grafiek van $f(x) = x$, voor $-3 < x < 2$. De verticale afstand in centimeter is $h(x) = g(x) - f(x)$. Bereken exact de grootste afstand.$vraag$,
    '37/4', '\dfrac{37}{4}', 's =',
    ARRAY['(37)/4', '(37)/(4)', '9.25', '9,25', 's=37/4', 's=(37)/4', 's=(37)/(4)', 's=9.25', 's=9,25']::text[]
  ),
  (
    'afstand', 8, 3,
    $vraag$Je loopt van een schuur naar een rechte sloot en daarna naar de stal. De totale afstand in meter is $f(x) = \sqrt{x^{2} + 16} + \sqrt{(x - 6)^{2} + 16}$, met $0 \leq x \leq 6$. Hoe groot is de kleinste afstand?$vraag$,
    '10', '10', 's =',
    ARRAY['s=10']::text[]
  ),
  (
    'kosten', 1, 1,
    $vraag$Je laat een folder drukken. De kosten in euro zijn $f(x) = 2x + \dfrac{8}{x}$, met $x > 0$. Voor welke $x$ zijn de kosten het kleinst?$vraag$,
    '2', '2', 'x =',
    ARRAY['x=2']::text[]
  ),
  (
    'kosten', 2, 1,
    $vraag$Je huurt een bestelbus. De kosten in euro zijn $f(x) = x + \dfrac{16}{x}$, met $x > 0$. Voor welke $x$ zijn de kosten het kleinst?$vraag$,
    '4', '4', 'x =',
    ARRAY['x=4']::text[]
  ),
  (
    'kosten', 3, 1,
    $vraag$Je legt een kabel. De kosten in euro zijn $f(x) = 3x + \dfrac{12}{x}$, met $x > 0$. Hoe groot zijn de kleinste kosten?$vraag$,
    '12', '12', 'K =',
    ARRAY['K=12']::text[]
  ),
  (
    'kosten', 4, 2,
    $vraag$Je laat shirts bedrukken. De kosten in euro zijn $f(x) = 5x + \dfrac{45}{x}$, met $x > 0$. Voor welke $x$ zijn de kosten het kleinst?$vraag$,
    '3', '3', 'x =',
    ARRAY['x=3']::text[]
  ),
  (
    'kosten', 5, 2,
    $vraag$Je verstuurt pakketten. De kosten in euro zijn $f(x) = 4x + \dfrac{36}{x}$, met $x > 0$. Hoe groot zijn de kleinste kosten?$vraag$,
    '24', '24', 'K =',
    ARRAY['K=24']::text[]
  ),
  (
    'kosten', 6, 2,
    $vraag$Je stelt een koelkast in. De kosten per dag in euro zijn $f(t) = 8t + \dfrac{2}{t}$, met $t > 0$ de stand van de thermostaat. Bereken exact de $t$ waarvoor de kosten het kleinst zijn.$vraag$,
    '1/2', '\dfrac{1}{2}', 't =',
    ARRAY['(1)/2', '(1)/(2)', '0.5', '0,5', 't=1/2', 't=(1)/2', 't=(1)/(2)', 't=0.5', 't=0,5']::text[]
  ),
  (
    'kosten', 7, 3,
    $vraag$Je verft een muur in banen. De kosten in euro zijn $f(x) = 2x + \dfrac{8}{x + 1}$, met $x > 0$. Voor welke $x$ zijn de kosten het kleinst?$vraag$,
    '1', '1', 'x =',
    ARRAY['x=1']::text[]
  ),
  (
    'kosten', 8, 3,
    $vraag$Je draait een productierun. De kosten in euro zijn $f(x) = x^{2} + \dfrac{54}{x}$, met $x > 0$. Hoe groot zijn de kleinste kosten?$vraag$,
    '27', '27', 'K =',
    ARRAY['K=27']::text[]
  ),
  (
    'voorraad', 1, 1,
    $vraag$Je vult een schuur met appels en verkoopt ze daarna. De voorraad in kilo is $f(t) = 12t - t^{2}$, met $0 \leq t \leq 12$ de tijd in dagen. Op welk tijdstip is de voorraad het grootst?$vraag$,
    '6', '6', 't =',
    ARRAY['t=6']::text[]
  ),
  (
    'voorraad', 2, 1,
    $vraag$Je slaat bloem op. De voorraad in kilo is $f(t) = 20t - 2t^{2}$, met $0 \leq t \leq 10$ de tijd in weken. Hoe groot is de grootste voorraad?$vraag$,
    '50', '50', 'V =',
    ARRAY['V=50']::text[]
  ),
  (
    'voorraad', 3, 1,
    $vraag$Eerst verkoop je koffie, daarna komt een nieuwe levering. De voorraad in kilo is $f(t) = t^{2} - 10t + 30$, met $t \geq 0$ de tijd in dagen. Op welk tijdstip is de voorraad het kleinst?$vraag$,
    '5', '5', 't =',
    ARRAY['t=5']::text[]
  ),
  (
    'voorraad', 4, 2,
    $vraag$Je brouwt sap. De voorraad in liter is $f(t) = 3t^{2} - t^{3}$, met $0 \leq t \leq 3$ de tijd in uren. Op welk tijdstip is de voorraad het grootst?$vraag$,
    '2', '2', 't =',
    ARRAY['t=2']::text[]
  ),
  (
    'voorraad', 5, 2,
    $vraag$Je kweekt gist. De voorraad in gram is $f(t) = 6t^{2} - t^{3}$, met $0 \leq t \leq 6$ de tijd in uren. Hoe groot is de grootste voorraad?$vraag$,
    '32', '32', 'V =',
    ARRAY['V=32']::text[]
  ),
  (
    'voorraad', 6, 2,
    $vraag$Je volgt de voorraad van een medicijn in een kast. De voorraad in dozen is $f(t) = 8t\,e^{-t}$, met $t \geq 0$ de tijd in dagen. Op welk tijdstip is de voorraad het grootst?$vraag$,
    '1', '1', 't =',
    ARRAY['t=1']::text[]
  ),
  (
    'voorraad', 7, 3,
    $vraag$Je volgt verf in een magazijn. De voorraad in liter is $f(t) = 10t\,e^{-t/2}$, met $t \geq 0$ de tijd in weken. Bereken exact de grootste voorraad.$vraag$,
    '20/e', '\dfrac{20}{e}', 'V =',
    ARRAY['20e^{-1}', '20e^(-1)', '(20)/e', '(20)/(e)', 'V=20/e', 'V=20e^{-1}', 'V=20e^(-1)', 'V=(20)/e', 'V=(20)/(e)']::text[]
  ),
  (
    'voorraad', 8, 3,
    $vraag$Je volgt batterijen in een winkel. De voorraad in stuks is $f(t) = 6t^{2}\,e^{-t}$, met $t \geq 0$ de tijd in maanden. Bereken exact de grootste voorraad.$vraag$,
    '24/e^2', '\dfrac{24}{e^{2}}', 'V =',
    ARRAY['24/e^{2}', '24e^{-2}', '24e^(-2)', '(24)/e^2', '(24)/(e^2)', 'V=24/e^2', 'V=24/e^{2}', 'V=24e^{-2}', 'V=24e^(-2)', 'V=(24)/e^2']::text[]
  )
) AS v(cluster_slug, order_index, difficulty, latex_body, answer, latex_answer, answer_prefix, alternatives)
JOIN public.topics_new t
  ON t.slug = 'h15_optimaliseren'
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
  ('oppervlakte', 1, 0, $stap$De oppervlakte is $f(x) = 20x - x^{2}$, met $0 < x < 20$. Je zoekt de $x$ waar die het grootst is. Dat is waar $f'(x) = 0$.$stap$),
  ('oppervlakte', 1, 1, $stap$$f'(x) = 20 - 2x$.$stap$),
  ('oppervlakte', 1, 2, $stap$Stel $20 - 2x = 0$. Dan is $x = 10$. Dat ligt in het domein. $f''(x) = -2 < 0$, dus dit is een grootste waarde.$stap$),
  ('oppervlakte', 1, 3, $stap$De oppervlakte is het grootst bij $x = 10$. Controle: $f(10) = 100$, en aan de randen van het domein gaat de oppervlakte naar $0$.$stap$),
  ('oppervlakte', 2, 0, $stap$De oppervlakte is $f(x) = 24x - 2x^{2}$, met $0 < x < 12$. Je zoekt de $x$ waar die het grootst is.$stap$),
  ('oppervlakte', 2, 1, $stap$$f'(x) = 24 - 4x$.$stap$),
  ('oppervlakte', 2, 2, $stap$Stel $24 - 4x = 0$. Dan is $x = 6$. $f''(x) = -4 < 0$, dus een grootste waarde.$stap$),
  ('oppervlakte', 2, 3, $stap$De oppervlakte is het grootst bij $x = 6$. Controle: $f(6) = 72$.$stap$),
  ('oppervlakte', 3, 0, $stap$De oppervlakte is $f(x) = 18x - 2x^{2}$, met $0 < x < 9$. Je zoekt hoe groot die op zijn grootst is. Eerst de $x$ waar $f'(x) = 0$.$stap$),
  ('oppervlakte', 3, 1, $stap$$f'(x) = 18 - 4x$.$stap$),
  ('oppervlakte', 3, 2, $stap$Stel $18 - 4x = 0$. Dan is $x = \dfrac{9}{2}$. $f''(x) = -4 < 0$, dus een grootste waarde.$stap$),
  ('oppervlakte', 3, 3, $stap$Vul in: $f\left(\dfrac{9}{2}\right) = 18 \cdot \dfrac{9}{2} - 2 \cdot \dfrac{81}{4} = \dfrac{81}{2}$. De grootste oppervlakte is $\dfrac{81}{2}$ m$^{2}$.$stap$),
  ('oppervlakte', 4, 0, $stap$De oppervlakte is $f(x) = 30x - 5x^{2}$, met $0 < x < 6$. Je zoekt hoe groot die op zijn grootst is.$stap$),
  ('oppervlakte', 4, 1, $stap$$f'(x) = 30 - 10x$.$stap$),
  ('oppervlakte', 4, 2, $stap$Stel $30 - 10x = 0$. Dan is $x = 3$. $f''(x) = -10 < 0$, dus een grootste waarde.$stap$),
  ('oppervlakte', 4, 3, $stap$Vul in: $f(3) = 90 - 45 = 45$. De grootste oppervlakte is $45$ m$^{2}$.$stap$),
  ('oppervlakte', 5, 0, $stap$De oppervlakte is $f(x) = 15x - 3x^{2}$, met $0 < x < 5$. Je zoekt de $x$ waar die het grootst is.$stap$),
  ('oppervlakte', 5, 1, $stap$$f'(x) = 15 - 6x$.$stap$),
  ('oppervlakte', 5, 2, $stap$Stel $15 - 6x = 0$. Dan is $x = \dfrac{5}{2}$. Dat ligt in het domein. $f''(x) = -6 < 0$, dus een grootste waarde.$stap$),
  ('oppervlakte', 5, 3, $stap$De oppervlakte is het grootst bij $x = \dfrac{5}{2}$.$stap$),
  ('oppervlakte', 6, 0, $stap$De oppervlakte is $f(x) = 6x^{2} - x^{3}$, met $0 < x < 6$. Je zoekt hoe groot die op zijn grootst is.$stap$),
  ('oppervlakte', 6, 1, $stap$$f'(x) = 12x - 3x^{2} = 3x(4 - x)$.$stap$),
  ('oppervlakte', 6, 2, $stap$Stel $f'(x) = 0$. Dan is $x = 0$ of $x = 4$. Alleen $x = 4$ ligt in het domein. Voor $0 < x < 4$ is $f'(x) > 0$, daarna $f'(x) < 0$. Dus een grootste waarde.$stap$),
  ('oppervlakte', 6, 3, $stap$Vul in: $f(4) = 6 \cdot 16 - 64 = 32$. De grootste oppervlakte is $32$ cm$^{2}$.$stap$),
  ('oppervlakte', 7, 0, $stap$De oppervlakte is $f(x) = x\sqrt{8 - x}$, met $0 < x < 8$. Noem $g(x) = \sqrt{8 - x}$. Je zoekt de $x$ waar $f$ het grootst is.$stap$),
  ('oppervlakte', 7, 1, $stap$Productregel. $g'(x) = -\dfrac{1}{2\sqrt{8 - x}}$. Dus $f'(x) = \sqrt{8 - x} - \dfrac{x}{2\sqrt{8 - x}} = \dfrac{16 - 3x}{2\sqrt{8 - x}}$.$stap$),
  ('oppervlakte', 7, 2, $stap$De noemer is niet $0$ op het domein. Stel $16 - 3x = 0$, dus $x = \dfrac{16}{3}$. Voor kleinere $x$ is $f'(x) > 0$, daarna $f'(x) < 0$. Dus een grootste waarde.$stap$),
  ('oppervlakte', 7, 3, $stap$De oppervlakte is het grootst bij $x = \dfrac{16}{3}$.$stap$),
  ('oppervlakte', 8, 0, $stap$De oppervlakte is $f(x) = 9x^{2} - x^{3}$, met $0 < x < 9$. Je zoekt hoe groot die op zijn grootst is.$stap$),
  ('oppervlakte', 8, 1, $stap$$f'(x) = 18x - 3x^{2} = 3x(6 - x)$.$stap$),
  ('oppervlakte', 8, 2, $stap$Stel $f'(x) = 0$. Dan is $x = 0$ of $x = 6$. Alleen $x = 6$ ligt in het domein. Voor $0 < x < 6$ stijgt $f$, daarna daalt $f$. Dus een grootste waarde.$stap$),
  ('oppervlakte', 8, 3, $stap$Vul in: $f(6) = 9 \cdot 36 - 216 = 108$. De grootste oppervlakte is $108$ cm$^{2}$.$stap$),
  ('afstand', 1, 0, $stap$De afstand is $f(t) = t^{2} - 8t + 25$, met $t \geq 0$. Je zoekt het tijdstip waar die het kleinst is.$stap$),
  ('afstand', 1, 1, $stap$$f'(t) = 2t - 8$.$stap$),
  ('afstand', 1, 2, $stap$Stel $2t - 8 = 0$. Dan is $t = 4$. $f''(t) = 2 > 0$, dus een kleinste waarde.$stap$),
  ('afstand', 1, 3, $stap$De afstand is het kleinst op $t = 4$. Controle: $f(4) = 9$, en $f(0) = 25$ is groter.$stap$),
  ('afstand', 2, 0, $stap$De afstand is $f(t) = t^{2} - 6t + 18$, met $t \geq 0$. Je zoekt hoe groot die op zijn kleinst is.$stap$),
  ('afstand', 2, 1, $stap$$f'(t) = 2t - 6$.$stap$),
  ('afstand', 2, 2, $stap$Stel $2t - 6 = 0$. Dan is $t = 3$. $f''(t) = 2 > 0$, dus een kleinste waarde.$stap$),
  ('afstand', 2, 3, $stap$Vul in: $f(3) = 9 - 18 + 18 = 9$. De kleinste afstand is $9$ km.$stap$),
  ('afstand', 3, 0, $stap$De afstand is $f(t) = 3t^{2} - 12t + 16$, met $t \geq 0$. Je zoekt het tijdstip waar die het kleinst is.$stap$),
  ('afstand', 3, 1, $stap$$f'(t) = 6t - 12$.$stap$),
  ('afstand', 3, 2, $stap$Stel $6t - 12 = 0$. Dan is $t = 2$. $f''(t) = 6 > 0$, dus een kleinste waarde.$stap$),
  ('afstand', 3, 3, $stap$De afstand is het kleinst op $t = 2$. Controle: $f(2) = 4$, en $f(0) = 16$ is groter.$stap$),
  ('afstand', 4, 0, $stap$De afstand is $f(t) = \sqrt{t^{2} - 10t + 34}$, met $t \geq 0$. Noem $g(t) = t^{2} - 10t + 34$. Je zoekt het tijdstip waar $f$ het kleinst is.$stap$),
  ('afstand', 4, 1, $stap$Kettingregel. $g'(t) = 2t - 10$, dus $f'(t) = \dfrac{2t - 10}{2\sqrt{g(t)}} = \dfrac{t - 5}{\sqrt{t^{2} - 10t + 34}}$.$stap$),
  ('afstand', 4, 2, $stap$De wortel is nooit $0$, want $g(t) = (t - 5)^{2} + 9 \geq 9$. Stel $t - 5 = 0$, dus $t = 5$. Links daarvan daalt $f$, rechts stijgt $f$. Dus een kleinste waarde.$stap$),
  ('afstand', 4, 3, $stap$De afstand is het kleinst op $t = 5$.$stap$),
  ('afstand', 5, 0, $stap$De afstand is $f(t) = \sqrt{(t - 2)^{2} + 16}$, met $t \geq 0$. Noem $g(t) = (t - 2)^{2} + 16$. Je zoekt hoe groot $f$ op zijn kleinst is.$stap$),
  ('afstand', 5, 1, $stap$Kettingregel. $g'(t) = 2(t - 2)$, dus $f'(t) = \dfrac{t - 2}{\sqrt{(t - 2)^{2} + 16}}$.$stap$),
  ('afstand', 5, 2, $stap$Stel $t - 2 = 0$, dus $t = 2$. Links daarvan is $f'(t) < 0$, rechts $f'(t) > 0$. Dus een kleinste waarde.$stap$),
  ('afstand', 5, 3, $stap$Vul in: $f(2) = \sqrt{16} = 4$. De kleinste afstand is $4$ km.$stap$),
  ('afstand', 6, 0, $stap$De verticale afstand is $h(x) = g(x) - f(x) = (12 - x^{2}) - 2x = 12 - x^{2} - 2x$, met $-4 < x < 2$. Je zoekt de $x$ waar die het grootst is.$stap$),
  ('afstand', 6, 1, $stap$$h'(x) = -2x - 2$.$stap$),
  ('afstand', 6, 2, $stap$Stel $-2x - 2 = 0$. Dan is $x = -1$. $h''(x) = -2 < 0$, dus een grootste waarde.$stap$),
  ('afstand', 6, 3, $stap$De afstand is het grootst bij $x = -1$. Controle: $h(-1) = 13$.$stap$),
  ('afstand', 7, 0, $stap$De verticale afstand is $h(x) = g(x) - f(x) = (9 - x^{2}) - x = 9 - x^{2} - x$, met $-3 < x < 2$. Je zoekt hoe groot die op zijn grootst is.$stap$),
  ('afstand', 7, 1, $stap$$h'(x) = -2x - 1$.$stap$),
  ('afstand', 7, 2, $stap$Stel $-2x - 1 = 0$. Dan is $x = -\dfrac{1}{2}$. $h''(x) = -2 < 0$, dus een grootste waarde.$stap$),
  ('afstand', 7, 3, $stap$Vul in: $h\left(-\dfrac{1}{2}\right) = 9 - \dfrac{1}{4} + \dfrac{1}{2} = \dfrac{37}{4}$. De grootste afstand is $\dfrac{37}{4}$ cm.$stap$),
  ('afstand', 8, 0, $stap$De afstand is $f(x) = \sqrt{x^{2} + 16} + \sqrt{(x - 6)^{2} + 16}$, met $0 \leq x \leq 6$. Noem $g(x) = \sqrt{x^{2} + 16}$ en $h(x) = \sqrt{(x - 6)^{2} + 16}$. Je zoekt hoe groot $f$ op zijn kleinst is.$stap$),
  ('afstand', 8, 1, $stap$Kettingregel op beide wortels. $f'(x) = \dfrac{x}{\sqrt{x^{2} + 16}} + \dfrac{x - 6}{\sqrt{(x - 6)^{2} + 16}}$.$stap$),
  ('afstand', 8, 2, $stap$Stel $f'(x) = 0$. Dan is $\dfrac{x}{\sqrt{x^{2} + 16}} = \dfrac{6 - x}{\sqrt{(x - 6)^{2} + 16}}$. Op $0 < x < 6$ zijn beide kanten positief. Kwadrateren geeft $x^{2} = (6 - x)^{2}$, dus $x = 3$. Buiten $(0, 6)$ hebben de twee kanten een verschillend teken, dus daar is $f'(x)$ niet $0$.$stap$),
  ('afstand', 8, 3, $stap$Vul in: $f(3) = \sqrt{9 + 16} + \sqrt{9 + 16} = 5 + 5 = 10$. Links van $x = 3$ daalt $f$, rechts stijgt $f$. De kleinste afstand is $10$ meter.$stap$),
  ('kosten', 1, 0, $stap$De kosten zijn $f(x) = 2x + \dfrac{8}{x}$, met $x > 0$. Je zoekt de $x$ waar die het kleinst zijn.$stap$),
  ('kosten', 1, 1, $stap$$f'(x) = 2 - \dfrac{8}{x^{2}}$.$stap$),
  ('kosten', 1, 2, $stap$Stel $2 - \dfrac{8}{x^{2}} = 0$. Dan is $x^{2} = 4$. Omdat $x > 0$ neem je $x = 2$. $f''(x) = \dfrac{16}{x^{3}} > 0$ voor $x > 0$, dus een kleinste waarde.$stap$),
  ('kosten', 1, 3, $stap$De kosten zijn het kleinst bij $x = 2$. Controle: $f(2) = 8$.$stap$),
  ('kosten', 2, 0, $stap$De kosten zijn $f(x) = x + \dfrac{16}{x}$, met $x > 0$. Je zoekt de $x$ waar die het kleinst zijn.$stap$),
  ('kosten', 2, 1, $stap$$f'(x) = 1 - \dfrac{16}{x^{2}}$.$stap$),
  ('kosten', 2, 2, $stap$Stel $1 - \dfrac{16}{x^{2}} = 0$. Dan is $x^{2} = 16$, dus $x = 4$ (want $x > 0$). Dat is een kleinste waarde, want $f''(x) = \dfrac{32}{x^{3}} > 0$.$stap$),
  ('kosten', 2, 3, $stap$De kosten zijn het kleinst bij $x = 4$. Controle: $f(4) = 8$.$stap$),
  ('kosten', 3, 0, $stap$De kosten zijn $f(x) = 3x + \dfrac{12}{x}$, met $x > 0$. Je zoekt hoe groot die op hun kleinst zijn.$stap$),
  ('kosten', 3, 1, $stap$$f'(x) = 3 - \dfrac{12}{x^{2}}$.$stap$),
  ('kosten', 3, 2, $stap$Stel $3 - \dfrac{12}{x^{2}} = 0$. Dan is $x^{2} = 4$, dus $x = 2$. $f''(x) = \dfrac{24}{x^{3}} > 0$, dus een kleinste waarde.$stap$),
  ('kosten', 3, 3, $stap$Vul in: $f(2) = 6 + 6 = 12$. De kleinste kosten zijn $12$ euro.$stap$),
  ('kosten', 4, 0, $stap$De kosten zijn $f(x) = 5x + \dfrac{45}{x}$, met $x > 0$. Je zoekt de $x$ waar die het kleinst zijn.$stap$),
  ('kosten', 4, 1, $stap$$f'(x) = 5 - \dfrac{45}{x^{2}}$.$stap$),
  ('kosten', 4, 2, $stap$Stel $5 - \dfrac{45}{x^{2}} = 0$. Dan is $x^{2} = 9$, dus $x = 3$. Dat is een kleinste waarde, want de tweede afgeleide $\dfrac{90}{x^{3}}$ is positief voor $x > 0$.$stap$),
  ('kosten', 4, 3, $stap$De kosten zijn het kleinst bij $x = 3$.$stap$),
  ('kosten', 5, 0, $stap$De kosten zijn $f(x) = 4x + \dfrac{36}{x}$, met $x > 0$. Je zoekt hoe groot die op hun kleinst zijn.$stap$),
  ('kosten', 5, 1, $stap$$f'(x) = 4 - \dfrac{36}{x^{2}}$.$stap$),
  ('kosten', 5, 2, $stap$Stel $4 - \dfrac{36}{x^{2}} = 0$. Dan is $x^{2} = 9$, dus $x = 3$. Dat is een kleinste waarde.$stap$),
  ('kosten', 5, 3, $stap$Vul in: $f(3) = 12 + 12 = 24$. De kleinste kosten zijn $24$ euro.$stap$),
  ('kosten', 6, 0, $stap$De kosten zijn $f(t) = 8t + \dfrac{2}{t}$, met $t > 0$. Je zoekt de $t$ waar die het kleinst zijn.$stap$),
  ('kosten', 6, 1, $stap$$f'(t) = 8 - \dfrac{2}{t^{2}}$.$stap$),
  ('kosten', 6, 2, $stap$Stel $8 - \dfrac{2}{t^{2}} = 0$. Dan is $t^{2} = \dfrac{1}{4}$. Omdat $t > 0$ neem je $t = \dfrac{1}{2}$. $f''(t) = \dfrac{4}{t^{3}} > 0$, dus een kleinste waarde.$stap$),
  ('kosten', 6, 3, $stap$De kosten zijn het kleinst bij $t = \dfrac{1}{2}$.$stap$),
  ('kosten', 7, 0, $stap$De kosten zijn $f(x) = 2x + \dfrac{8}{x + 1}$, met $x > 0$. Noem $g(x) = x + 1$. Je zoekt de $x$ waar de kosten het kleinst zijn.$stap$),
  ('kosten', 7, 1, $stap$Kettingregel op de breuk: de afgeleide van $\dfrac{8}{g(x)}$ is $-\dfrac{8}{(x + 1)^{2}}$. Dus $f'(x) = 2 - \dfrac{8}{(x + 1)^{2}}$.$stap$),
  ('kosten', 7, 2, $stap$Stel $2 = \dfrac{8}{(x + 1)^{2}}$. Dan is $(x + 1)^{2} = 4$. Omdat $x > 0$ is $x + 1 > 0$, dus $x + 1 = 2$ en $x = 1$. Links van $x = 1$ is $f'(x) < 0$, rechts $f'(x) > 0$. Dus een kleinste waarde.$stap$),
  ('kosten', 7, 3, $stap$De kosten zijn het kleinst bij $x = 1$. Controle: $f(1) = 6$.$stap$),
  ('kosten', 8, 0, $stap$De kosten zijn $f(x) = x^{2} + \dfrac{54}{x}$, met $x > 0$. Je zoekt hoe groot die op hun kleinst zijn.$stap$),
  ('kosten', 8, 1, $stap$$f'(x) = 2x - \dfrac{54}{x^{2}}$.$stap$),
  ('kosten', 8, 2, $stap$Stel $2x = \dfrac{54}{x^{2}}$. Dan is $2x^{3} = 54$, dus $x^{3} = 27$ en $x = 3$. $f''(x) = 2 + \dfrac{108}{x^{3}} > 0$ voor $x > 0$, dus een kleinste waarde.$stap$),
  ('kosten', 8, 3, $stap$Vul in: $f(3) = 9 + 18 = 27$. De kleinste kosten zijn $27$ euro.$stap$),
  ('voorraad', 1, 0, $stap$De voorraad is $f(t) = 12t - t^{2}$, met $0 \leq t \leq 12$. Je zoekt het tijdstip waar die het grootst is.$stap$),
  ('voorraad', 1, 1, $stap$$f'(t) = 12 - 2t$.$stap$),
  ('voorraad', 1, 2, $stap$Stel $12 - 2t = 0$. Dan is $t = 6$. $f''(t) = -2 < 0$, dus een grootste waarde.$stap$),
  ('voorraad', 1, 3, $stap$De voorraad is het grootst op $t = 6$. Controle: $f(6) = 36$, en $f(0) = f(12) = 0$.$stap$),
  ('voorraad', 2, 0, $stap$De voorraad is $f(t) = 20t - 2t^{2}$, met $0 \leq t \leq 10$. Je zoekt hoe groot die op zijn grootst is.$stap$),
  ('voorraad', 2, 1, $stap$$f'(t) = 20 - 4t$.$stap$),
  ('voorraad', 2, 2, $stap$Stel $20 - 4t = 0$. Dan is $t = 5$. $f''(t) = -4 < 0$, dus een grootste waarde.$stap$),
  ('voorraad', 2, 3, $stap$Vul in: $f(5) = 100 - 50 = 50$. De grootste voorraad is $50$ kilo.$stap$),
  ('voorraad', 3, 0, $stap$De voorraad is $f(t) = t^{2} - 10t + 30$, met $t \geq 0$. Je zoekt het tijdstip waar die het kleinst is.$stap$),
  ('voorraad', 3, 1, $stap$$f'(t) = 2t - 10$.$stap$),
  ('voorraad', 3, 2, $stap$Stel $2t - 10 = 0$. Dan is $t = 5$. $f''(t) = 2 > 0$, dus een kleinste waarde.$stap$),
  ('voorraad', 3, 3, $stap$De voorraad is het kleinst op $t = 5$. Controle: $f(5) = 5$, en $f(0) = 30$ is groter.$stap$),
  ('voorraad', 4, 0, $stap$De voorraad is $f(t) = 3t^{2} - t^{3}$, met $0 \leq t \leq 3$. Je zoekt het tijdstip waar die het grootst is.$stap$),
  ('voorraad', 4, 1, $stap$$f'(t) = 6t - 3t^{2} = 3t(2 - t)$.$stap$),
  ('voorraad', 4, 2, $stap$Stel $f'(t) = 0$. Dan is $t = 0$ of $t = 2$. Op $0 < t < 2$ stijgt de voorraad, daarna daalt die tot $t = 3$. Dus de grootste waarde zit bij $t = 2$.$stap$),
  ('voorraad', 4, 3, $stap$De voorraad is het grootst op $t = 2$. Controle: $f(2) = 4$, en $f(0) = f(3) = 0$.$stap$),
  ('voorraad', 5, 0, $stap$De voorraad is $f(t) = 6t^{2} - t^{3}$, met $0 \leq t \leq 6$. Je zoekt hoe groot die op zijn grootst is.$stap$),
  ('voorraad', 5, 1, $stap$$f'(t) = 12t - 3t^{2} = 3t(4 - t)$.$stap$),
  ('voorraad', 5, 2, $stap$Stel $f'(t) = 0$. Dan is $t = 0$ of $t = 4$. Op $0 < t < 4$ stijgt de voorraad, daarna daalt die. Dus een grootste waarde bij $t = 4$.$stap$),
  ('voorraad', 5, 3, $stap$Vul in: $f(4) = 6 \cdot 16 - 64 = 32$. De grootste voorraad is $32$ gram.$stap$),
  ('voorraad', 6, 0, $stap$De voorraad is $f(t) = 8t\,e^{-t}$, met $t \geq 0$. Je zoekt het tijdstip waar die het grootst is.$stap$),
  ('voorraad', 6, 1, $stap$Productregel. De afgeleide van $8t$ is $8$, de afgeleide van $e^{-t}$ is $-e^{-t}$. Dus $f'(t) = 8e^{-t} + 8t \cdot (-e^{-t}) = 8e^{-t}(1 - t)$.$stap$),
  ('voorraad', 6, 2, $stap$Stel $f'(t) = 0$. De factor $8e^{-t}$ is nooit $0$. Dus $t = 1$. Voor $t < 1$ stijgt de voorraad, daarna daalt die.$stap$),
  ('voorraad', 6, 3, $stap$De voorraad is het grootst op $t = 1$. Controle: $f(0) = 0$ en $f(2) = \dfrac{16}{e^{2}}$. Dat is kleiner dan $f(1) = \dfrac{8}{e}$, omdat $e > 2$.$stap$),
  ('voorraad', 7, 0, $stap$De voorraad is $f(t) = 10t\,e^{-t/2}$, met $t \geq 0$. Noem $g(t) = e^{-t/2}$. Je zoekt hoe groot $f$ op zijn grootst is.$stap$),
  ('voorraad', 7, 1, $stap$Productregel en kettingregel. $g'(t) = -\dfrac{1}{2}e^{-t/2}$. Dus $f'(t) = 10e^{-t/2} + 10t \cdot \left(-\dfrac{1}{2}e^{-t/2}\right) = 10e^{-t/2}\left(1 - \dfrac{t}{2}\right)$.$stap$),
  ('voorraad', 7, 2, $stap$Stel $f'(t) = 0$. Dan is $1 - \dfrac{t}{2} = 0$, dus $t = 2$. Voor $t < 2$ stijgt de voorraad, daarna daalt die.$stap$),
  ('voorraad', 7, 3, $stap$Vul in: $f(2) = 10 \cdot 2 \cdot e^{-1} = \dfrac{20}{e}$. De grootste voorraad is $\dfrac{20}{e}$ liter.$stap$),
  ('voorraad', 8, 0, $stap$De voorraad is $f(t) = 6t^{2}\,e^{-t}$, met $t \geq 0$. Je zoekt hoe groot die op zijn grootst is.$stap$),
  ('voorraad', 8, 1, $stap$Productregel. De afgeleide van $6t^{2}$ is $12t$, de afgeleide van $e^{-t}$ is $-e^{-t}$. Dus $f'(t) = 12t\,e^{-t} + 6t^{2} \cdot (-e^{-t}) = 6t\,e^{-t}(2 - t)$.$stap$),
  ('voorraad', 8, 2, $stap$Stel $f'(t) = 0$. Dan is $t = 0$ of $t = 2$. Op $0 < t < 2$ stijgt de voorraad, daarna daalt die. Dus de grootste waarde zit bij $t = 2$.$stap$),
  ('voorraad', 8, 3, $stap$Vul in: $f(2) = 6 \cdot 4 \cdot e^{-2} = \dfrac{24}{e^{2}}$. De grootste voorraad is $\dfrac{24}{e^{2}}$ stuks.$stap$)
) AS v(cluster_slug, q_order_index, step_order, step_description)
JOIN public.topics_new t
  ON t.slug = 'h15_optimaliseren'
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
  WHERE t.slug = 'h15_optimaliseren';

  SELECT count(*) INTO n_vragen
  FROM public.questions_new q
  JOIN public.topics_new t ON t.id = q.topic_id
  WHERE t.slug = 'h15_optimaliseren';

  SELECT count(*) INTO n_stappen
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  JOIN public.topics_new t ON t.id = q.topic_id
  WHERE t.slug = 'h15_optimaliseren';

  IF n_soorten <> 4 OR n_vragen <> 32 OR n_stappen <> 128 THEN
    RAISE EXCEPTION 'Hoofdstuk 15.3 klopt niet: % soorten, % opgaven, % stappen', n_soorten, n_vragen, n_stappen;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.questions_new q
    JOIN public.topics_new t ON t.id = q.topic_id
    WHERE t.slug = 'h15_optimaliseren'
      AND (
        q.answer_prefix IS NULL
        OR btrim(q.answer_prefix) = ''
        OR (
          SELECT count(*) FROM public.question_steps_new s WHERE s.question_id = q.id
        ) <> 4
      )
  ) THEN
    RAISE EXCEPTION 'Niet elke opgave van hoofdstuk 15.3 heeft een voorvoegsel en stap 0 t/m 3';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM (VALUES
      ('oppervlakte', 1, '10'),
      ('oppervlakte', 2, '6'),
      ('oppervlakte', 3, '81/2'),
      ('oppervlakte', 4, '45'),
      ('oppervlakte', 5, '5/2'),
      ('oppervlakte', 6, '32'),
      ('oppervlakte', 7, '16/3'),
      ('oppervlakte', 8, '108'),
      ('afstand', 1, '4'),
      ('afstand', 2, '9'),
      ('afstand', 3, '2'),
      ('afstand', 4, '5'),
      ('afstand', 5, '4'),
      ('afstand', 6, '-1'),
      ('afstand', 7, '37/4'),
      ('afstand', 8, '10'),
      ('kosten', 1, '2'),
      ('kosten', 2, '4'),
      ('kosten', 3, '12'),
      ('kosten', 4, '3'),
      ('kosten', 5, '24'),
      ('kosten', 6, '1/2'),
      ('kosten', 7, '1'),
      ('kosten', 8, '27'),
      ('voorraad', 1, '6'),
      ('voorraad', 2, '50'),
      ('voorraad', 3, '5'),
      ('voorraad', 4, '2'),
      ('voorraad', 5, '32'),
      ('voorraad', 6, '1'),
      ('voorraad', 7, '20/e'),
      ('voorraad', 8, '24/e^2')
    ) AS verwacht(slug, volg, antwoord)
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.questions_new q
      JOIN public.topic_clusters_new c ON c.id = q.cluster_id
      JOIN public.topics_new t ON t.id = q.topic_id
      WHERE t.slug = 'h15_optimaliseren'
        AND c.slug = verwacht.slug
        AND q.order_index = verwacht.volg
        AND q.answer = verwacht.antwoord
        AND q.answer_prefix IS NOT NULL
    )
  ) THEN
    RAISE EXCEPTION 'Niet elke opgave van hoofdstuk 15.3 heeft het verwachte antwoord';
  END IF;
END $$;

COMMIT;
