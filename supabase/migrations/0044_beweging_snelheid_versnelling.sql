-- Hoofdstuk Beweging: snelheid en versnelling.
-- Eigen varianten bij de differentieer-kant van beweging in het vlak,
-- eenparige cirkelbeweging, harmonische trilling en beweging met sinus
-- en cosinus. Geen boekopgaven. Elk antwoord is nageteld.
-- Tien soorten, elk 8 opgaven, van makkelijk naar moeilijk.
-- Antwoord is het kale getal. Bij een tijdstip staat t = in answer_prefix.
-- Herhaalbaar: een tweede keer draaien voegt niets dubbel toe.

BEGIN;

INSERT INTO public.chapters (slug, title, book_part, order_index)
VALUES ('beweging', 'Beweging', 3, 10)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO public.topics_new (slug, title, chapter_id, order_index, is_unlocked_by_default)
SELECT v.slug, v.title, c.id, v.order_index, false
FROM public.chapters c
JOIN (VALUES

  ('snelheid_versnelling', 'Snelheid en versnelling', 1::smallint),
  ('cirkel_en_trilling', 'Cirkelbeweging en trilling', 2::smallint),
  ('beweging_gonio', 'Beweging met sinus en cosinus', 3::smallint)

) AS v(slug, title, order_index) ON true
WHERE c.slug = 'beweging'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index)
SELECT t.id, v.slug, v.title, v.order_index
FROM public.topics_new t
JOIN (VALUES

  ('snelheid_versnelling', 'snelheid_op_tijdstip', 'Snelheid op een tijdstip', 1::smallint),
  ('snelheid_versnelling', 'grootte_versnelling', 'Grootte van de versnelling', 2::smallint),
  ('snelheid_versnelling', 'tijdstip_kleinste_snelheid', 'Tijdstip van de kleinste snelheid', 3::smallint),
  ('snelheid_versnelling', 'kleinste_snelheid', 'Kleinste snelheid', 4::smallint),
  ('cirkel_en_trilling', 'snelheid_cirkel', 'Snelheid op een cirkel', 1::smallint),
  ('cirkel_en_trilling', 'versnelling_cirkel', 'Versnelling op een cirkel', 2::smallint),
  ('cirkel_en_trilling', 'grootste_snelheid_trilling', 'Grootste snelheid van een trilling', 3::smallint),
  ('beweging_gonio', 'snelheid_op_tijdstip_gonio', 'Snelheid op een tijdstip', 1::smallint),
  ('beweging_gonio', 'grootste_snelheid_lijn', 'Grootste snelheid op een lijn', 2::smallint),
  ('beweging_gonio', 'grootste_snelheid_vlak', 'Grootste snelheid in het vlak', 3::smallint)

) AS v(topic_slug, slug, title, order_index)
  ON t.slug = v.topic_slug
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
    'snelheid_op_tijdstip', 1, 1,
    $vraag$Je volgt een drone. De plaats in meter na $t$ seconden is $x(t) = 3t$ en $y(t) = 4t$, met $t \geq 0$. Hoe groot is de snelheid op $t = 2$, in meter per seconde?$vraag$,
    '5', '5', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'snelheid_op_tijdstip', 2, 1,
    $vraag$Je volgt een robot over de vloer. De plaats in meter na $t$ seconden is $x(t) = 6t$ en $y(t) = 8t$, met $t \geq 0$. Hoe groot is de snelheid op $t = 1$, in meter per seconde?$vraag$,
    '10', '10', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'snelheid_op_tijdstip', 3, 1,
    $vraag$Je volgt een boot op een meer. De plaats in meter na $t$ seconden is $x(t) = 5t$ en $y(t) = 12t$, met $t \geq 0$. Hoe groot is de snelheid op $t = 3$, in meter per seconde?$vraag$,
    '13', '13', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'snelheid_op_tijdstip', 4, 2,
    $vraag$Je volgt een schaatser op de ijsbaan. De plaats in meter na $t$ seconden is $x(t) = \dfrac{5}{2}t^{2}$ en $y(t) = 24t$, met $t \geq 0$. Hoe groot is de snelheid op $t = 2$, in meter per seconde?$vraag$,
    '26', '26', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'snelheid_op_tijdstip', 5, 2,
    $vraag$Je volgt een karretje in een hal. De plaats in meter na $t$ seconden is $x(t) = \dfrac{9}{2}t^{2}$ en $y(t) = 12t$, met $t \geq 0$. Hoe groot is de snelheid op $t = 1$, in meter per seconde?$vraag$,
    '15', '15', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'snelheid_op_tijdstip', 6, 2,
    $vraag$Je volgt een vogel. De plaats in meter na $t$ seconden is $x(t) = 4t^{2}$ en $y(t) = 15t$, met $t \geq 0$. Hoe groot is de snelheid op $t = 1$, in meter per seconde?$vraag$,
    '17', '17', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'snelheid_op_tijdstip', 7, 3,
    $vraag$Je volgt een bal over het plein. De plaats in meter na $t$ seconden is $x(t) = \dfrac{7}{2}t^{2}$ en $y(t) = 24t$, met $t \geq 0$. Hoe groot is de snelheid op $t = 1$, in meter per seconde?$vraag$,
    '25', '25', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'snelheid_op_tijdstip', 8, 3,
    $vraag$Je volgt een auto op een groot plein. De plaats in meter na $t$ seconden is $x(t) = 10t^{2}$ en $y(t) = 21t$, met $t \geq 0$. Hoe groot is de snelheid op $t = 1$, in meter per seconde?$vraag$,
    '29', '29', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootte_versnelling', 1, 1,
    $vraag$Je volgt een drone. De plaats in meter na $t$ seconden is $x(t) = \dfrac{3}{2}t^{2}$ en $y(t) = 2t^{2}$, met $t \geq 0$. Hoe groot is de versnelling op $t = 1$, in meter per seconde per seconde?$vraag$,
    '5', '5', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootte_versnelling', 2, 1,
    $vraag$Je volgt een robot over de vloer. De plaats in meter na $t$ seconden is $x(t) = \dfrac{5}{2}t^{2}$ en $y(t) = 6t^{2}$, met $t \geq 0$. Hoe groot is de versnelling op $t = 2$, in meter per seconde per seconde?$vraag$,
    '13', '13', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootte_versnelling', 3, 2,
    $vraag$Je volgt een boot op een meer. De plaats in meter na $t$ seconden is $x(t) = 4t^{2}$ en $y(t) = \dfrac{15}{2}t^{2}$, met $t \geq 0$. Hoe groot is de versnelling op $t = 1$, in meter per seconde per seconde?$vraag$,
    '17', '17', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootte_versnelling', 4, 2,
    $vraag$Je volgt een schaatser op de ijsbaan. De plaats in meter na $t$ seconden is $x(t) = \dfrac{7}{2}t^{2}$ en $y(t) = 12t^{2}$, met $t \geq 0$. Hoe groot is de versnelling op $t = 2$, in meter per seconde per seconde?$vraag$,
    '25', '25', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootte_versnelling', 5, 2,
    $vraag$Je volgt een karretje in een hal. De plaats in meter na $t$ seconden is $x(t) = 10t^{2}$ en $y(t) = \dfrac{21}{2}t^{2}$, met $t \geq 0$. Hoe groot is de versnelling op $t = 1$, in meter per seconde per seconde?$vraag$,
    '29', '29', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootte_versnelling', 6, 3,
    $vraag$Je volgt een vogel. De plaats in meter na $t$ seconden is $x(t) = \dfrac{1}{12}t^{4}$ en $y(t) = \dfrac{2}{3}t^{3}$, met $t \geq 0$. Hoe groot is de versnelling op $t = 3$, in meter per seconde per seconde?$vraag$,
    '15', '15', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootte_versnelling', 7, 3,
    $vraag$Je volgt een bal over het plein. De plaats in meter na $t$ seconden is $x(t) = \dfrac{1}{3}t^{3}$ en $y(t) = 4t^{2}$, met $t \geq 0$. Hoe groot is de versnelling op $t = 3$, in meter per seconde per seconde?$vraag$,
    '10', '10', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootte_versnelling', 8, 3,
    $vraag$Je volgt een auto op een groot plein. De plaats in meter na $t$ seconden is $x(t) = \dfrac{1}{12}t^{4}$ en $y(t) = \dfrac{1}{2}t^{3}$, met $t \geq 0$. Hoe groot is de versnelling op $t = 4$, in meter per seconde per seconde?$vraag$,
    '20', '20', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'tijdstip_kleinste_snelheid', 1, 1,
    $vraag$Je volgt een drone. De plaats in meter na $t$ seconden is $x(t) = 2t$ en $y(t) = t^{3} - 3t$, met $t \geq 0$. Op welk tijdstip is de snelheid het kleinst?$vraag$,
    '1', '1', 't =',
    ARRAY[]::text[]
  ),
  (
    'tijdstip_kleinste_snelheid', 2, 1,
    $vraag$Je volgt een robot over de vloer. De plaats in meter na $t$ seconden is $x(t) = 3t$ en $y(t) = t^{3} - 12t$, met $t \geq 0$. Op welk tijdstip is de snelheid het kleinst?$vraag$,
    '2', '2', 't =',
    ARRAY[]::text[]
  ),
  (
    'tijdstip_kleinste_snelheid', 3, 1,
    $vraag$Je volgt een boot op een meer. De plaats in meter na $t$ seconden is $x(t) = t$ en $y(t) = t^{3} - 27t$, met $t \geq 0$. Op welk tijdstip is de snelheid het kleinst?$vraag$,
    '3', '3', 't =',
    ARRAY[]::text[]
  ),
  (
    'tijdstip_kleinste_snelheid', 4, 2,
    $vraag$Je volgt een schaatser op de ijsbaan. De plaats in meter na $t$ seconden is $x(t) = 5t$ en $y(t) = t^{3} - 48t$, met $t \geq 0$. Op welk tijdstip is de snelheid het kleinst?$vraag$,
    '4', '4', 't =',
    ARRAY[]::text[]
  ),
  (
    'tijdstip_kleinste_snelheid', 5, 2,
    $vraag$Je volgt een karretje in een hal. De plaats in meter na $t$ seconden is $x(t) = t$ en $y(t) = t^{3} - 75t$, met $t \geq 0$. Op welk tijdstip is de snelheid het kleinst?$vraag$,
    '5', '5', 't =',
    ARRAY[]::text[]
  ),
  (
    'tijdstip_kleinste_snelheid', 6, 2,
    $vraag$Je volgt een vogel. De plaats in meter na $t$ seconden is $x(t) = 2t$ en $y(t) = t^{3} - 108t$, met $t \geq 0$. Op welk tijdstip is de snelheid het kleinst?$vraag$,
    '6', '6', 't =',
    ARRAY[]::text[]
  ),
  (
    'tijdstip_kleinste_snelheid', 7, 3,
    $vraag$Je volgt een bal over het plein. De plaats in meter na $t$ seconden is $x(t) = 4t$ en $y(t) = 2t^{3} - 24t$, met $t \geq 0$. Op welk tijdstip is de snelheid het kleinst?$vraag$,
    '2', '2', 't =',
    ARRAY[]::text[]
  ),
  (
    'tijdstip_kleinste_snelheid', 8, 3,
    $vraag$Je volgt een auto op een groot plein. De plaats in meter na $t$ seconden is $x(t) = \dfrac{1}{3}t^{3} - 51t$ en $y(t) = t^{2}$, met $t \geq 0$. Op welk tijdstip is de snelheid het kleinst?$vraag$,
    '7', '7', 't =',
    ARRAY[]::text[]
  ),
  (
    'kleinste_snelheid', 1, 1,
    $vraag$Je volgt een drone. De plaats in meter na $t$ seconden is $x(t) = 4t$ en $y(t) = t^{3} - 3t$, met $t \geq 0$. Hoe groot is de kleinste snelheid, in meter per seconde?$vraag$,
    '4', '4', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'kleinste_snelheid', 2, 1,
    $vraag$Je volgt een robot over de vloer. De plaats in meter na $t$ seconden is $x(t) = 5t$ en $y(t) = t^{3} - 12t$, met $t \geq 0$. Hoe groot is de kleinste snelheid, in meter per seconde?$vraag$,
    '5', '5', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'kleinste_snelheid', 3, 1,
    $vraag$Je volgt een boot op een meer. De plaats in meter na $t$ seconden is $x(t) = 6t$ en $y(t) = t^{3} - 27t$, met $t \geq 0$. Hoe groot is de kleinste snelheid, in meter per seconde?$vraag$,
    '6', '6', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'kleinste_snelheid', 4, 2,
    $vraag$Je volgt een schaatser op de ijsbaan. De plaats in meter na $t$ seconden is $x(t) = 8t$ en $y(t) = t^{3} - 48t$, met $t \geq 0$. Hoe groot is de kleinste snelheid, in meter per seconde?$vraag$,
    '8', '8', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'kleinste_snelheid', 5, 2,
    $vraag$Je volgt een karretje in een hal. De plaats in meter na $t$ seconden is $x(t) = 10t$ en $y(t) = t^{3} - 3t$, met $t \geq 0$. Hoe groot is de kleinste snelheid, in meter per seconde?$vraag$,
    '10', '10', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'kleinste_snelheid', 6, 2,
    $vraag$Je volgt een vogel. De plaats in meter na $t$ seconden is $x(t) = 7t$ en $y(t) = t^{3} - 12t$, met $t \geq 0$. Hoe groot is de kleinste snelheid, in meter per seconde?$vraag$,
    '7', '7', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'kleinste_snelheid', 7, 3,
    $vraag$Je volgt een bal over het plein. De plaats in meter na $t$ seconden is $x(t) = \dfrac{1}{3}t^{3} - 34t$ en $y(t) = 3t^{2}$, met $t \geq 0$. Hoe groot is de kleinste snelheid, in meter per seconde?$vraag$,
    '30', '30', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'kleinste_snelheid', 8, 3,
    $vraag$Je volgt een auto op een groot plein. De plaats in meter na $t$ seconden is $x(t) = \dfrac{1}{3}t^{3} - 41t$ en $y(t) = 4t^{2}$, met $t \geq 0$. Hoe groot is de kleinste snelheid, in meter per seconde?$vraag$,
    '40', '40', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'snelheid_cirkel', 1, 1,
    $vraag$Je volgt een drone. Het punt doorloopt een cirkel. De plaats in meter na $t$ seconden is $x(t) = 2\cos(2t)$ en $y(t) = 2\sin(2t)$. Hoe groot is de snelheid, in meter per seconde?$vraag$,
    '4', '4', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'snelheid_cirkel', 2, 1,
    $vraag$Je volgt een robot over de vloer. Het punt doorloopt een cirkel. De plaats in meter na $t$ seconden is $x(t) = 3\cos(2t)$ en $y(t) = 3\sin(2t)$. Hoe groot is de snelheid, in meter per seconde?$vraag$,
    '6', '6', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'snelheid_cirkel', 3, 1,
    $vraag$Je volgt een boot op een meer. Het punt doorloopt een cirkel. De plaats in meter na $t$ seconden is $x(t) = 5\cos(2t)$ en $y(t) = 5\sin(2t)$. Hoe groot is de snelheid, in meter per seconde?$vraag$,
    '10', '10', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'snelheid_cirkel', 4, 2,
    $vraag$Je volgt een schaatser op de ijsbaan. Het punt doorloopt een cirkel. De plaats in meter na $t$ seconden is $x(t) = 4\cos(3t)$ en $y(t) = 4\sin(3t)$. Hoe groot is de snelheid, in meter per seconde?$vraag$,
    '12', '12', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'snelheid_cirkel', 5, 2,
    $vraag$Je volgt een karretje in een hal. Het punt doorloopt een cirkel. De plaats in meter na $t$ seconden is $x(t) = 3\cos(5t)$ en $y(t) = 3\sin(5t)$. Hoe groot is de snelheid, in meter per seconde?$vraag$,
    '15', '15', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'snelheid_cirkel', 6, 2,
    $vraag$Je volgt een vogel. Het punt doorloopt een cirkel. De plaats in meter na $t$ seconden is $x(t) = 6\cos(3t)$ en $y(t) = 6\sin(3t)$. Hoe groot is de snelheid, in meter per seconde?$vraag$,
    '18', '18', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'snelheid_cirkel', 7, 3,
    $vraag$Je volgt een bal over het plein. Het punt doorloopt een cirkel. De plaats in meter na $t$ seconden is $x(t) = 4\cos(2t + 1)$ en $y(t) = 4\sin(2t + 1)$. Hoe groot is de snelheid, in meter per seconde?$vraag$,
    '8', '8', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'snelheid_cirkel', 8, 3,
    $vraag$Je volgt een auto op een groot plein. Het punt doorloopt een cirkel. De plaats in meter na $t$ seconden is $x(t) = 5\cos(4t)$ en $y(t) = 5\sin(4t)$. Hoe groot is de snelheid, in meter per seconde?$vraag$,
    '20', '20', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'versnelling_cirkel', 1, 1,
    $vraag$Je volgt een drone. Het punt doorloopt een cirkel. De plaats in meter na $t$ seconden is $x(t) = \cos(2t)$ en $y(t) = \sin(2t)$. Hoe groot is de versnelling, in meter per seconde per seconde?$vraag$,
    '4', '4', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'versnelling_cirkel', 2, 1,
    $vraag$Je volgt een robot over de vloer. Het punt doorloopt een cirkel. De plaats in meter na $t$ seconden is $x(t) = 2\cos(3t)$ en $y(t) = 2\sin(3t)$. Hoe groot is de versnelling, in meter per seconde per seconde?$vraag$,
    '18', '18', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'versnelling_cirkel', 3, 2,
    $vraag$Je volgt een boot op een meer. Het punt doorloopt een cirkel. De plaats in meter na $t$ seconden is $x(t) = \cos(3t)$ en $y(t) = \sin(3t)$. Hoe groot is de versnelling, in meter per seconde per seconde?$vraag$,
    '9', '9', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'versnelling_cirkel', 4, 2,
    $vraag$Je volgt een schaatser op de ijsbaan. Het punt doorloopt een cirkel. De plaats in meter na $t$ seconden is $x(t) = 3\cos(3t)$ en $y(t) = 3\sin(3t)$. Hoe groot is de versnelling, in meter per seconde per seconde?$vraag$,
    '27', '27', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'versnelling_cirkel', 5, 2,
    $vraag$Je volgt een karretje in een hal. Het punt doorloopt een cirkel. De plaats in meter na $t$ seconden is $x(t) = 6\cos(2t)$ en $y(t) = 6\sin(2t)$. Hoe groot is de versnelling, in meter per seconde per seconde?$vraag$,
    '24', '24', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'versnelling_cirkel', 6, 3,
    $vraag$Je volgt een vogel. Het punt doorloopt een cirkel. De plaats in meter na $t$ seconden is $x(t) = 5\cos(3t)$ en $y(t) = 5\sin(3t)$. Hoe groot is de versnelling, in meter per seconde per seconde?$vraag$,
    '45', '45', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'versnelling_cirkel', 7, 3,
    $vraag$Je volgt een bal over het plein. Het punt doorloopt een cirkel. De plaats in meter na $t$ seconden is $x(t) = 2\cos(4t)$ en $y(t) = 2\sin(4t)$. Hoe groot is de versnelling, in meter per seconde per seconde?$vraag$,
    '32', '32', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'versnelling_cirkel', 8, 3,
    $vraag$Je volgt een auto op een groot plein. Het punt doorloopt een cirkel. De plaats in meter na $t$ seconden is $x(t) = 7\cos(2t + 1)$ en $y(t) = 7\sin(2t + 1)$. Hoe groot is de versnelling, in meter per seconde per seconde?$vraag$,
    '28', '28', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootste_snelheid_trilling', 1, 1,
    $vraag$Je volgt een drone. Het punt beweegt over een rechte lijn. De plaats in meter na $t$ seconden is $f(t) = 3\sin(2t)$. Hoe groot is de grootste snelheid, in meter per seconde?$vraag$,
    '6', '6', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootste_snelheid_trilling', 2, 1,
    $vraag$Je volgt een robot over de vloer. Het punt beweegt over een rechte lijn. De plaats in meter na $t$ seconden is $f(t) = 4\cos(2t)$. Hoe groot is de grootste snelheid, in meter per seconde?$vraag$,
    '8', '8', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootste_snelheid_trilling', 3, 1,
    $vraag$Je volgt een boot op een meer. Het punt beweegt over een rechte lijn. De plaats in meter na $t$ seconden is $f(t) = 5\sin(3t) + 1$. Hoe groot is de grootste snelheid, in meter per seconde?$vraag$,
    '15', '15', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootste_snelheid_trilling', 4, 2,
    $vraag$Je volgt een schaatser op de ijsbaan. Het punt beweegt over een rechte lijn. De plaats in meter na $t$ seconden is $f(t) = 2\cos(5t) + 3$. Hoe groot is de grootste snelheid, in meter per seconde?$vraag$,
    '10', '10', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootste_snelheid_trilling', 5, 2,
    $vraag$Je volgt een karretje in een hal. Het punt beweegt over een rechte lijn. De plaats in meter na $t$ seconden is $f(t) = 6\sin(2t) + 4$. Hoe groot is de grootste snelheid, in meter per seconde?$vraag$,
    '12', '12', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootste_snelheid_trilling', 6, 2,
    $vraag$Je volgt een vogel. Het punt beweegt over een rechte lijn. De plaats in meter na $t$ seconden is $f(t) = 7\cos(3t)$. Hoe groot is de grootste snelheid, in meter per seconde?$vraag$,
    '21', '21', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootste_snelheid_trilling', 7, 3,
    $vraag$Je volgt een bal over het plein. Het punt beweegt over een rechte lijn. De plaats in meter na $t$ seconden is $f(t) = 4\sin(4t) + 2$. Hoe groot is de grootste snelheid, in meter per seconde?$vraag$,
    '16', '16', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootste_snelheid_trilling', 8, 3,
    $vraag$Je volgt een auto op een groot plein. Het punt beweegt over een rechte lijn. De plaats in meter na $t$ seconden is $f(t) = 9\cos(2t) + 1$. Hoe groot is de grootste snelheid, in meter per seconde?$vraag$,
    '18', '18', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'snelheid_op_tijdstip_gonio', 1, 1,
    $vraag$Je volgt een drone. De plaats in meter na $t$ seconden is $x(t) = 3\cos(t)$ en $y(t) = 4\sin(t)$, met $t \geq 0$. Hoe groot is de snelheid op $t = 0$, in meter per seconde?$vraag$,
    '4', '4', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'snelheid_op_tijdstip_gonio', 2, 1,
    $vraag$Je volgt een robot over de vloer. De plaats in meter na $t$ seconden is $x(t) = 5\cos(t)$ en $y(t) = 12\sin(t)$, met $t \geq 0$. Hoe groot is de snelheid op $t = 0$, in meter per seconde?$vraag$,
    '12', '12', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'snelheid_op_tijdstip_gonio', 3, 1,
    $vraag$Je volgt een boot op een meer. De plaats in meter na $t$ seconden is $x(t) = 9\cos(t)$ en $y(t) = 12\sin(t)$, met $t \geq 0$. Hoe groot is de snelheid op $t = \dfrac{\pi}{2}$, in meter per seconde?$vraag$,
    '9', '9', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'snelheid_op_tijdstip_gonio', 4, 2,
    $vraag$Je volgt een schaatser op de ijsbaan. De plaats in meter na $t$ seconden is $x(t) = 8\cos(t)$ en $y(t) = 15\sin(t)$, met $t \geq 0$. Hoe groot is de snelheid op $t = 0$, in meter per seconde?$vraag$,
    '15', '15', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'snelheid_op_tijdstip_gonio', 5, 2,
    $vraag$Je volgt een karretje in een hal. De plaats in meter na $t$ seconden is $x(t) = 8\cos(2t)$ en $y(t) = 15\sin(2t)$, met $t \geq 0$. Hoe groot is de snelheid op $t = 0$, in meter per seconde?$vraag$,
    '30', '30', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'snelheid_op_tijdstip_gonio', 6, 2,
    $vraag$Je volgt een vogel. De plaats in meter na $t$ seconden is $x(t) = 8\cos(2t)$ en $y(t) = 15\sin(2t)$, met $t \geq 0$. Hoe groot is de snelheid op $t = \dfrac{\pi}{4}$, in meter per seconde?$vraag$,
    '16', '16', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'snelheid_op_tijdstip_gonio', 7, 3,
    $vraag$Je volgt een bal over het plein. De plaats in meter na $t$ seconden is $x(t) = 20\cos(t)$ en $y(t) = 21\sin(t)$, met $t \geq 0$. Hoe groot is de snelheid op $t = \dfrac{\pi}{2}$, in meter per seconde?$vraag$,
    '20', '20', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'snelheid_op_tijdstip_gonio', 8, 3,
    $vraag$Je volgt een auto op een groot plein. De plaats in meter na $t$ seconden is $x(t) = 7\cos(t)$ en $y(t) = 24\sin(t)$, met $t \geq 0$. Hoe groot is de snelheid op $t = 0$, in meter per seconde?$vraag$,
    '24', '24', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootste_snelheid_lijn', 1, 1,
    $vraag$Je volgt een drone. Het punt beweegt over een rechte lijn. De plaats in meter na $t$ seconden is $f(t) = 3\cos(t) + 4\sin(t)$. Hoe groot is de grootste snelheid, in meter per seconde?$vraag$,
    '5', '5', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootste_snelheid_lijn', 2, 1,
    $vraag$Je volgt een robot over de vloer. Het punt beweegt over een rechte lijn. De plaats in meter na $t$ seconden is $f(t) = 5\cos(t) + 12\sin(t)$. Hoe groot is de grootste snelheid, in meter per seconde?$vraag$,
    '13', '13', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootste_snelheid_lijn', 3, 2,
    $vraag$Je volgt een boot op een meer. Het punt beweegt over een rechte lijn. De plaats in meter na $t$ seconden is $f(t) = 8\cos(t) + 15\sin(t)$. Hoe groot is de grootste snelheid, in meter per seconde?$vraag$,
    '17', '17', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootste_snelheid_lijn', 4, 2,
    $vraag$Je volgt een schaatser op de ijsbaan. Het punt beweegt over een rechte lijn. De plaats in meter na $t$ seconden is $f(t) = 7\cos(t) + 24\sin(t)$. Hoe groot is de grootste snelheid, in meter per seconde?$vraag$,
    '25', '25', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootste_snelheid_lijn', 5, 2,
    $vraag$Je volgt een karretje in een hal. Het punt beweegt over een rechte lijn. De plaats in meter na $t$ seconden is $f(t) = 20\cos(t) + 21\sin(t)$. Hoe groot is de grootste snelheid, in meter per seconde?$vraag$,
    '29', '29', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootste_snelheid_lijn', 6, 3,
    $vraag$Je volgt een vogel. Het punt beweegt over een rechte lijn. De plaats in meter na $t$ seconden is $f(t) = 6\cos(2t) + 8\sin(2t)$. Hoe groot is de grootste snelheid, in meter per seconde?$vraag$,
    '20', '20', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootste_snelheid_lijn', 7, 3,
    $vraag$Je volgt een bal over het plein. Het punt beweegt over een rechte lijn. De plaats in meter na $t$ seconden is $f(t) = 9\cos(2t) + 12\sin(2t)$. Hoe groot is de grootste snelheid, in meter per seconde?$vraag$,
    '30', '30', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootste_snelheid_lijn', 8, 3,
    $vraag$Je volgt een auto op een groot plein. Het punt beweegt over een rechte lijn. De plaats in meter na $t$ seconden is $f(t) = 5\cos(3t) + 12\sin(3t)$. Hoe groot is de grootste snelheid, in meter per seconde?$vraag$,
    '39', '39', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootste_snelheid_vlak', 1, 1,
    $vraag$Je volgt een drone. De plaats in meter na $t$ seconden is $x(t) = 3\cos(t)$ en $y(t) = 4\sin(t)$, met $t \geq 0$. Hoe groot is de grootste snelheid, in meter per seconde?$vraag$,
    '4', '4', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootste_snelheid_vlak', 2, 1,
    $vraag$Je volgt een robot over de vloer. De plaats in meter na $t$ seconden is $x(t) = 5\cos(t)$ en $y(t) = 12\sin(t)$, met $t \geq 0$. Hoe groot is de grootste snelheid, in meter per seconde?$vraag$,
    '12', '12', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootste_snelheid_vlak', 3, 2,
    $vraag$Je volgt een boot op een meer. De plaats in meter na $t$ seconden is $x(t) = 8\cos(t)$ en $y(t) = 15\sin(t)$, met $t \geq 0$. Hoe groot is de grootste snelheid, in meter per seconde?$vraag$,
    '15', '15', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootste_snelheid_vlak', 4, 2,
    $vraag$Je volgt een schaatser op de ijsbaan. De plaats in meter na $t$ seconden is $x(t) = 7\cos(t)$ en $y(t) = 24\sin(t)$, met $t \geq 0$. Hoe groot is de grootste snelheid, in meter per seconde?$vraag$,
    '24', '24', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootste_snelheid_vlak', 5, 2,
    $vraag$Je volgt een karretje in een hal. De plaats in meter na $t$ seconden is $x(t) = 21\cos(t)$ en $y(t) = 20\sin(t)$, met $t \geq 0$. Hoe groot is de grootste snelheid, in meter per seconde?$vraag$,
    '21', '21', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootste_snelheid_vlak', 6, 3,
    $vraag$Je volgt een vogel. De plaats in meter na $t$ seconden is $x(t) = 6\cos(2t)$ en $y(t) = 8\sin(2t)$, met $t \geq 0$. Hoe groot is de grootste snelheid, in meter per seconde?$vraag$,
    '16', '16', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootste_snelheid_vlak', 7, 3,
    $vraag$Je volgt een bal over het plein. De plaats in meter na $t$ seconden is $x(t) = 8\cos(3t)$ en $y(t) = 15\sin(3t)$, met $t \geq 0$. Hoe groot is de grootste snelheid, in meter per seconde?$vraag$,
    '45', '45', NULL::text,
    ARRAY[]::text[]
  ),
  (
    'grootste_snelheid_vlak', 8, 3,
    $vraag$Je volgt een auto op een groot plein. De plaats in meter na $t$ seconden is $x(t) = 12\cos(3t)$ en $y(t) = 5\sin(3t)$, met $t \geq 0$. Hoe groot is de grootste snelheid, in meter per seconde?$vraag$,
    '36', '36', NULL::text,
    ARRAY[]::text[]
  )

) AS v(cluster_slug, order_index, difficulty, latex_body, answer, latex_answer, answer_prefix, alternatives)
JOIN public.topic_clusters_new c
  ON c.slug = v.cluster_slug
JOIN public.topics_new t
  ON t.id = c.topic_id
 AND t.slug IN ('snelheid_versnelling', 'cirkel_en_trilling', 'beweging_gonio')
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
    'snelheid_op_tijdstip', 1, 0,
    $stap$Je zoekt de snelheid op $t = 2$. Dat is de lengte van de snelheidsvector, met componenten $x'(t)$ en $y'(t)$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 1, 1,
    $stap$$x'(t) = 3$ en $y'(t) = 4$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 1, 2,
    $stap$Op $t = 2$ is de snelheidsvector $(3,\ 4)$. De snelheid is $\sqrt{9 + 16} = \sqrt{25} = 5$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 1, 3,
    $stap$Controle: $3^{2} + 4^{2} = 9 + 16 = 25$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 2, 0,
    $stap$Je zoekt de snelheid op $t = 1$. Dat is de lengte van de snelheidsvector, met componenten $x'(t)$ en $y'(t)$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 2, 1,
    $stap$$x'(t) = 6$ en $y'(t) = 8$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 2, 2,
    $stap$Op $t = 1$ is de snelheidsvector $(6,\ 8)$. De snelheid is $\sqrt{36 + 64} = \sqrt{100} = 10$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 2, 3,
    $stap$Controle: $6^{2} + 8^{2} = 36 + 64 = 100$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 3, 0,
    $stap$Je zoekt de snelheid op $t = 3$. Dat is de lengte van de snelheidsvector, met componenten $x'(t)$ en $y'(t)$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 3, 1,
    $stap$$x'(t) = 5$ en $y'(t) = 12$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 3, 2,
    $stap$Op $t = 3$ is de snelheidsvector $(5,\ 12)$. De snelheid is $\sqrt{25 + 144} = \sqrt{169} = 13$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 3, 3,
    $stap$Controle: $5^{2} + 12^{2} = 25 + 144 = 169$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 4, 0,
    $stap$Je zoekt de snelheid op $t = 2$. Dat is de lengte van de snelheidsvector, met componenten $x'(t)$ en $y'(t)$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 4, 1,
    $stap$$x'(t) = 5t$ en $y'(t) = 24$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 4, 2,
    $stap$Op $t = 2$ is de snelheidsvector $(10,\ 24)$. De snelheid is $\sqrt{100 + 576} = \sqrt{676} = 26$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 4, 3,
    $stap$Controle: $10^{2} + 24^{2} = 100 + 576 = 676$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 5, 0,
    $stap$Je zoekt de snelheid op $t = 1$. Dat is de lengte van de snelheidsvector, met componenten $x'(t)$ en $y'(t)$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 5, 1,
    $stap$$x'(t) = 9t$ en $y'(t) = 12$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 5, 2,
    $stap$Op $t = 1$ is de snelheidsvector $(9,\ 12)$. De snelheid is $\sqrt{81 + 144} = \sqrt{225} = 15$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 5, 3,
    $stap$Controle: $9^{2} + 12^{2} = 81 + 144 = 225$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 6, 0,
    $stap$Je zoekt de snelheid op $t = 1$. Dat is de lengte van de snelheidsvector, met componenten $x'(t)$ en $y'(t)$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 6, 1,
    $stap$$x'(t) = 8t$ en $y'(t) = 15$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 6, 2,
    $stap$Op $t = 1$ is de snelheidsvector $(8,\ 15)$. De snelheid is $\sqrt{64 + 225} = \sqrt{289} = 17$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 6, 3,
    $stap$Controle: $8^{2} + 15^{2} = 64 + 225 = 289$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 7, 0,
    $stap$Je zoekt de snelheid op $t = 1$. Dat is de lengte van de snelheidsvector, met componenten $x'(t)$ en $y'(t)$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 7, 1,
    $stap$$x'(t) = 7t$ en $y'(t) = 24$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 7, 2,
    $stap$Op $t = 1$ is de snelheidsvector $(7,\ 24)$. De snelheid is $\sqrt{49 + 576} = \sqrt{625} = 25$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 7, 3,
    $stap$Controle: $7^{2} + 24^{2} = 49 + 576 = 625$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 8, 0,
    $stap$Je zoekt de snelheid op $t = 1$. Dat is de lengte van de snelheidsvector, met componenten $x'(t)$ en $y'(t)$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 8, 1,
    $stap$$x'(t) = 20t$ en $y'(t) = 21$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 8, 2,
    $stap$Op $t = 1$ is de snelheidsvector $(20,\ 21)$. De snelheid is $\sqrt{400 + 441} = \sqrt{841} = 29$.$stap$
  ),
  (
    'snelheid_op_tijdstip', 8, 3,
    $stap$Controle: $20^{2} + 21^{2} = 400 + 441 = 841$.$stap$
  ),
  (
    'grootte_versnelling', 1, 0,
    $stap$Je zoekt de grootte van de versnelling op $t = 1$. Differentieer de plaats twee keer.$stap$
  ),
  (
    'grootte_versnelling', 1, 1,
    $stap$$x'(t) = 3t$ en $y'(t) = 4t$. Dus $x''(t) = 3$ en $y''(t) = 4$.$stap$
  ),
  (
    'grootte_versnelling', 1, 2,
    $stap$Op $t = 1$ is de versnellingsvector $(3,\ 4)$. De grootte is $\sqrt{9 + 16} = 5$.$stap$
  ),
  (
    'grootte_versnelling', 1, 3,
    $stap$Controle: $3^{2} + 4^{2} = 25$.$stap$
  ),
  (
    'grootte_versnelling', 2, 0,
    $stap$Je zoekt de grootte van de versnelling op $t = 2$. Differentieer de plaats twee keer.$stap$
  ),
  (
    'grootte_versnelling', 2, 1,
    $stap$$x'(t) = 5t$ en $y'(t) = 12t$. Dus $x''(t) = 5$ en $y''(t) = 12$.$stap$
  ),
  (
    'grootte_versnelling', 2, 2,
    $stap$Op $t = 2$ is de versnellingsvector $(5,\ 12)$. De grootte is $\sqrt{25 + 144} = 13$.$stap$
  ),
  (
    'grootte_versnelling', 2, 3,
    $stap$Controle: $5^{2} + 12^{2} = 169$.$stap$
  ),
  (
    'grootte_versnelling', 3, 0,
    $stap$Je zoekt de grootte van de versnelling op $t = 1$. Differentieer de plaats twee keer.$stap$
  ),
  (
    'grootte_versnelling', 3, 1,
    $stap$$x'(t) = 8t$ en $y'(t) = 15t$. Dus $x''(t) = 8$ en $y''(t) = 15$.$stap$
  ),
  (
    'grootte_versnelling', 3, 2,
    $stap$Op $t = 1$ is de versnellingsvector $(8,\ 15)$. De grootte is $\sqrt{64 + 225} = 17$.$stap$
  ),
  (
    'grootte_versnelling', 3, 3,
    $stap$Controle: $8^{2} + 15^{2} = 289$.$stap$
  ),
  (
    'grootte_versnelling', 4, 0,
    $stap$Je zoekt de grootte van de versnelling op $t = 2$. Differentieer de plaats twee keer.$stap$
  ),
  (
    'grootte_versnelling', 4, 1,
    $stap$$x'(t) = 7t$ en $y'(t) = 24t$. Dus $x''(t) = 7$ en $y''(t) = 24$.$stap$
  ),
  (
    'grootte_versnelling', 4, 2,
    $stap$Op $t = 2$ is de versnellingsvector $(7,\ 24)$. De grootte is $\sqrt{49 + 576} = 25$.$stap$
  ),
  (
    'grootte_versnelling', 4, 3,
    $stap$Controle: $7^{2} + 24^{2} = 625$.$stap$
  ),
  (
    'grootte_versnelling', 5, 0,
    $stap$Je zoekt de grootte van de versnelling op $t = 1$. Differentieer de plaats twee keer.$stap$
  ),
  (
    'grootte_versnelling', 5, 1,
    $stap$$x'(t) = 20t$ en $y'(t) = 21t$. Dus $x''(t) = 20$ en $y''(t) = 21$.$stap$
  ),
  (
    'grootte_versnelling', 5, 2,
    $stap$Op $t = 1$ is de versnellingsvector $(20,\ 21)$. De grootte is $\sqrt{400 + 441} = 29$.$stap$
  ),
  (
    'grootte_versnelling', 5, 3,
    $stap$Controle: $20^{2} + 21^{2} = 841$.$stap$
  ),
  (
    'grootte_versnelling', 6, 0,
    $stap$Je zoekt de grootte van de versnelling op $t = 3$. Differentieer de plaats twee keer.$stap$
  ),
  (
    'grootte_versnelling', 6, 1,
    $stap$$x'(t) = \dfrac{1}{3}t^{3}$ en $y'(t) = 2t^{2}$. Dus $x''(t) = t^{2}$ en $y''(t) = 4t$.$stap$
  ),
  (
    'grootte_versnelling', 6, 2,
    $stap$Op $t = 3$ is de versnellingsvector $(9,\ 12)$. De grootte is $\sqrt{81 + 144} = 15$.$stap$
  ),
  (
    'grootte_versnelling', 6, 3,
    $stap$Controle: $9^{2} + 12^{2} = 225$.$stap$
  ),
  (
    'grootte_versnelling', 7, 0,
    $stap$Je zoekt de grootte van de versnelling op $t = 3$. Differentieer de plaats twee keer.$stap$
  ),
  (
    'grootte_versnelling', 7, 1,
    $stap$$x'(t) = t^{2}$ en $y'(t) = 8t$. Dus $x''(t) = 2t$ en $y''(t) = 8$.$stap$
  ),
  (
    'grootte_versnelling', 7, 2,
    $stap$Op $t = 3$ is de versnellingsvector $(6,\ 8)$. De grootte is $\sqrt{36 + 64} = 10$.$stap$
  ),
  (
    'grootte_versnelling', 7, 3,
    $stap$Controle: $6^{2} + 8^{2} = 100$.$stap$
  ),
  (
    'grootte_versnelling', 8, 0,
    $stap$Je zoekt de grootte van de versnelling op $t = 4$. Differentieer de plaats twee keer.$stap$
  ),
  (
    'grootte_versnelling', 8, 1,
    $stap$$x'(t) = \dfrac{1}{3}t^{3}$ en $y'(t) = \dfrac{3}{2}t^{2}$. Dus $x''(t) = t^{2}$ en $y''(t) = 3t$.$stap$
  ),
  (
    'grootte_versnelling', 8, 2,
    $stap$Op $t = 4$ is de versnellingsvector $(16,\ 12)$. De grootte is $\sqrt{256 + 144} = 20$.$stap$
  ),
  (
    'grootte_versnelling', 8, 3,
    $stap$Controle: $16^{2} + 12^{2} = 400$.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 1, 0,
    $stap$De snelheid is het kleinst als $x'(t)\,x''(t) + y'(t)\,y''(t) = 0$, met $t \geq 0$. Daarna vergelijk je de kandidaten.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 1, 1,
    $stap$$x'(t) = 2$ en $x''(t) = 0$. $y'(t) = 3t^{2} - 3$ en $y''(t) = 6t$.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 1, 2,
    $stap$$x'$ hangt niet van $t$ af en $x'' = 0$, dus het inproduct is alleen $y' \cdot y''$. Dat wordt $18t(t^{2} - 1) = 0$. Dus $t = 0$ of $t = 1$.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 1, 3,
    $stap$Op $t = 0$ is het kwadraat van de snelheid $2^{2} + 3^{2} = 13$. Op $t = 1$ is de snelheidsvector $(2,\ 0)$, dus het kwadraat is $4$. Dat is kleiner. De kleinste snelheid zit bij $t = 1$.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 2, 0,
    $stap$De snelheid is het kleinst als $x'(t)\,x''(t) + y'(t)\,y''(t) = 0$, met $t \geq 0$. Daarna vergelijk je de kandidaten.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 2, 1,
    $stap$$x'(t) = 3$ en $x''(t) = 0$. $y'(t) = 3t^{2} - 12$ en $y''(t) = 6t$.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 2, 2,
    $stap$$x'$ hangt niet van $t$ af en $x'' = 0$, dus het inproduct is alleen $y' \cdot y''$. Dat wordt $18t(t^{2} - 4) = 0$. Dus $t = 0$ of $t = 2$.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 2, 3,
    $stap$Op $t = 0$ is het kwadraat van de snelheid $3^{2} + 12^{2} = 153$. Op $t = 2$ is de snelheidsvector $(3,\ 0)$, dus het kwadraat is $9$. Dat is kleiner. De kleinste snelheid zit bij $t = 2$.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 3, 0,
    $stap$De snelheid is het kleinst als $x'(t)\,x''(t) + y'(t)\,y''(t) = 0$, met $t \geq 0$. Daarna vergelijk je de kandidaten.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 3, 1,
    $stap$$x'(t) = 1$ en $x''(t) = 0$. $y'(t) = 3t^{2} - 27$ en $y''(t) = 6t$.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 3, 2,
    $stap$$x'$ hangt niet van $t$ af en $x'' = 0$, dus het inproduct is alleen $y' \cdot y''$. Dat wordt $18t(t^{2} - 9) = 0$. Dus $t = 0$ of $t = 3$.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 3, 3,
    $stap$Op $t = 0$ is het kwadraat van de snelheid $1^{2} + 27^{2} = 730$. Op $t = 3$ is de snelheidsvector $(1,\ 0)$, dus het kwadraat is $1$. Dat is kleiner. De kleinste snelheid zit bij $t = 3$.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 4, 0,
    $stap$De snelheid is het kleinst als $x'(t)\,x''(t) + y'(t)\,y''(t) = 0$, met $t \geq 0$. Daarna vergelijk je de kandidaten.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 4, 1,
    $stap$$x'(t) = 5$ en $x''(t) = 0$. $y'(t) = 3t^{2} - 48$ en $y''(t) = 6t$.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 4, 2,
    $stap$$x'$ hangt niet van $t$ af en $x'' = 0$, dus het inproduct is alleen $y' \cdot y''$. Dat wordt $18t(t^{2} - 16) = 0$. Dus $t = 0$ of $t = 4$.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 4, 3,
    $stap$Op $t = 0$ is het kwadraat van de snelheid $5^{2} + 48^{2} = 2329$. Op $t = 4$ is de snelheidsvector $(5,\ 0)$, dus het kwadraat is $25$. Dat is kleiner. De kleinste snelheid zit bij $t = 4$.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 5, 0,
    $stap$De snelheid is het kleinst als $x'(t)\,x''(t) + y'(t)\,y''(t) = 0$, met $t \geq 0$. Daarna vergelijk je de kandidaten.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 5, 1,
    $stap$$x'(t) = 1$ en $x''(t) = 0$. $y'(t) = 3t^{2} - 75$ en $y''(t) = 6t$.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 5, 2,
    $stap$$x'$ hangt niet van $t$ af en $x'' = 0$, dus het inproduct is alleen $y' \cdot y''$. Dat wordt $18t(t^{2} - 25) = 0$. Dus $t = 0$ of $t = 5$.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 5, 3,
    $stap$Op $t = 0$ is het kwadraat van de snelheid $1^{2} + 75^{2} = 5626$. Op $t = 5$ is de snelheidsvector $(1,\ 0)$, dus het kwadraat is $1$. Dat is kleiner. De kleinste snelheid zit bij $t = 5$.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 6, 0,
    $stap$De snelheid is het kleinst als $x'(t)\,x''(t) + y'(t)\,y''(t) = 0$, met $t \geq 0$. Daarna vergelijk je de kandidaten.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 6, 1,
    $stap$$x'(t) = 2$ en $x''(t) = 0$. $y'(t) = 3t^{2} - 108$ en $y''(t) = 6t$.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 6, 2,
    $stap$$x'$ hangt niet van $t$ af en $x'' = 0$, dus het inproduct is alleen $y' \cdot y''$. Dat wordt $18t(t^{2} - 36) = 0$. Dus $t = 0$ of $t = 6$.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 6, 3,
    $stap$Op $t = 0$ is het kwadraat van de snelheid $2^{2} + 108^{2} = 11668$. Op $t = 6$ is de snelheidsvector $(2,\ 0)$, dus het kwadraat is $4$. Dat is kleiner. De kleinste snelheid zit bij $t = 6$.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 7, 0,
    $stap$De snelheid is het kleinst als $x'(t)\,x''(t) + y'(t)\,y''(t) = 0$, met $t \geq 0$. Daarna vergelijk je de kandidaten.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 7, 1,
    $stap$$x'(t) = 4$ en $x''(t) = 0$. $y'(t) = 6t^{2} - 24$ en $y''(t) = 12t$.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 7, 2,
    $stap$$x'$ hangt niet van $t$ af en $x'' = 0$, dus het inproduct is alleen $y' \cdot y''$. Dat wordt $72t(t^{2} - 4) = 0$. Dus $t = 0$ of $t = 2$.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 7, 3,
    $stap$Op $t = 0$ is het kwadraat van de snelheid $4^{2} + 24^{2} = 592$. Op $t = 2$ is de snelheidsvector $(4,\ 0)$, dus het kwadraat is $16$. Dat is kleiner. De kleinste snelheid zit bij $t = 2$.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 8, 0,
    $stap$De snelheid is het kleinst als $x'(t)\,x''(t) + y'(t)\,y''(t) = 0$, met $t \geq 0$. Daarna vergelijk je de kandidaten.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 8, 1,
    $stap$$x'(t) = t^{2} - 51$ en $x''(t) = 2t$. $y'(t) = 2t$ en $y''(t) = 2$.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 8, 2,
    $stap$Het inproduct uitwerken geeft $2t(t^{2} - 49) = 0$. Dus $t = 0$ of $t = 7$.$stap$
  ),
  (
    'tijdstip_kleinste_snelheid', 8, 3,
    $stap$Op $t = 0$ is het kwadraat van de snelheid $2601$. Op $t = 7$ is de snelheidsvector $(-2,\ 14)$ en het kwadraat $200$. Dat is kleiner. De kleinste snelheid zit bij $t = 7$.$stap$
  ),
  (
    'kleinste_snelheid', 1, 0,
    $stap$De snelheid is het kleinst als $x'(t)\,x''(t) + y'(t)\,y''(t) = 0$, met $t \geq 0$. Daarna vergelijk je de kandidaten.$stap$
  ),
  (
    'kleinste_snelheid', 1, 1,
    $stap$$x'(t) = 4$ en $x''(t) = 0$. $y'(t) = 3t^{2} - 3$ en $y''(t) = 6t$.$stap$
  ),
  (
    'kleinste_snelheid', 1, 2,
    $stap$$x'$ hangt niet van $t$ af en $x'' = 0$, dus het inproduct is alleen $y' \cdot y''$. Dat wordt $18t(t^{2} - 1) = 0$. Dus $t = 0$ of $t = 1$.$stap$
  ),
  (
    'kleinste_snelheid', 1, 3,
    $stap$Op $t = 0$ is het kwadraat van de snelheid $25$. Op $t = 1$ is de snelheidsvector $(4,\ 0)$, dus de snelheid is $4$. Dat is kleiner, want $16 < 25$.$stap$
  ),
  (
    'kleinste_snelheid', 2, 0,
    $stap$De snelheid is het kleinst als $x'(t)\,x''(t) + y'(t)\,y''(t) = 0$, met $t \geq 0$. Daarna vergelijk je de kandidaten.$stap$
  ),
  (
    'kleinste_snelheid', 2, 1,
    $stap$$x'(t) = 5$ en $x''(t) = 0$. $y'(t) = 3t^{2} - 12$ en $y''(t) = 6t$.$stap$
  ),
  (
    'kleinste_snelheid', 2, 2,
    $stap$$x'$ hangt niet van $t$ af en $x'' = 0$, dus het inproduct is alleen $y' \cdot y''$. Dat wordt $18t(t^{2} - 4) = 0$. Dus $t = 0$ of $t = 2$.$stap$
  ),
  (
    'kleinste_snelheid', 2, 3,
    $stap$Op $t = 0$ is het kwadraat van de snelheid $169$. Op $t = 2$ is de snelheidsvector $(5,\ 0)$, dus de snelheid is $5$. Dat is kleiner, want $25 < 169$.$stap$
  ),
  (
    'kleinste_snelheid', 3, 0,
    $stap$De snelheid is het kleinst als $x'(t)\,x''(t) + y'(t)\,y''(t) = 0$, met $t \geq 0$. Daarna vergelijk je de kandidaten.$stap$
  ),
  (
    'kleinste_snelheid', 3, 1,
    $stap$$x'(t) = 6$ en $x''(t) = 0$. $y'(t) = 3t^{2} - 27$ en $y''(t) = 6t$.$stap$
  ),
  (
    'kleinste_snelheid', 3, 2,
    $stap$$x'$ hangt niet van $t$ af en $x'' = 0$, dus het inproduct is alleen $y' \cdot y''$. Dat wordt $18t(t^{2} - 9) = 0$. Dus $t = 0$ of $t = 3$.$stap$
  ),
  (
    'kleinste_snelheid', 3, 3,
    $stap$Op $t = 0$ is het kwadraat van de snelheid $765$. Op $t = 3$ is de snelheidsvector $(6,\ 0)$, dus de snelheid is $6$. Dat is kleiner, want $36 < 765$.$stap$
  ),
  (
    'kleinste_snelheid', 4, 0,
    $stap$De snelheid is het kleinst als $x'(t)\,x''(t) + y'(t)\,y''(t) = 0$, met $t \geq 0$. Daarna vergelijk je de kandidaten.$stap$
  ),
  (
    'kleinste_snelheid', 4, 1,
    $stap$$x'(t) = 8$ en $x''(t) = 0$. $y'(t) = 3t^{2} - 48$ en $y''(t) = 6t$.$stap$
  ),
  (
    'kleinste_snelheid', 4, 2,
    $stap$$x'$ hangt niet van $t$ af en $x'' = 0$, dus het inproduct is alleen $y' \cdot y''$. Dat wordt $18t(t^{2} - 16) = 0$. Dus $t = 0$ of $t = 4$.$stap$
  ),
  (
    'kleinste_snelheid', 4, 3,
    $stap$Op $t = 0$ is het kwadraat van de snelheid $2368$. Op $t = 4$ is de snelheidsvector $(8,\ 0)$, dus de snelheid is $8$. Dat is kleiner, want $64 < 2368$.$stap$
  ),
  (
    'kleinste_snelheid', 5, 0,
    $stap$De snelheid is het kleinst als $x'(t)\,x''(t) + y'(t)\,y''(t) = 0$, met $t \geq 0$. Daarna vergelijk je de kandidaten.$stap$
  ),
  (
    'kleinste_snelheid', 5, 1,
    $stap$$x'(t) = 10$ en $x''(t) = 0$. $y'(t) = 3t^{2} - 3$ en $y''(t) = 6t$.$stap$
  ),
  (
    'kleinste_snelheid', 5, 2,
    $stap$$x'$ hangt niet van $t$ af en $x'' = 0$, dus het inproduct is alleen $y' \cdot y''$. Dat wordt $18t(t^{2} - 1) = 0$. Dus $t = 0$ of $t = 1$.$stap$
  ),
  (
    'kleinste_snelheid', 5, 3,
    $stap$Op $t = 0$ is het kwadraat van de snelheid $109$. Op $t = 1$ is de snelheidsvector $(10,\ 0)$, dus de snelheid is $10$. Dat is kleiner, want $100 < 109$.$stap$
  ),
  (
    'kleinste_snelheid', 6, 0,
    $stap$De snelheid is het kleinst als $x'(t)\,x''(t) + y'(t)\,y''(t) = 0$, met $t \geq 0$. Daarna vergelijk je de kandidaten.$stap$
  ),
  (
    'kleinste_snelheid', 6, 1,
    $stap$$x'(t) = 7$ en $x''(t) = 0$. $y'(t) = 3t^{2} - 12$ en $y''(t) = 6t$.$stap$
  ),
  (
    'kleinste_snelheid', 6, 2,
    $stap$$x'$ hangt niet van $t$ af en $x'' = 0$, dus het inproduct is alleen $y' \cdot y''$. Dat wordt $18t(t^{2} - 4) = 0$. Dus $t = 0$ of $t = 2$.$stap$
  ),
  (
    'kleinste_snelheid', 6, 3,
    $stap$Op $t = 0$ is het kwadraat van de snelheid $193$. Op $t = 2$ is de snelheidsvector $(7,\ 0)$, dus de snelheid is $7$. Dat is kleiner, want $49 < 193$.$stap$
  ),
  (
    'kleinste_snelheid', 7, 0,
    $stap$De snelheid is het kleinst als $x'(t)\,x''(t) + y'(t)\,y''(t) = 0$, met $t \geq 0$. Daarna vergelijk je de kandidaten.$stap$
  ),
  (
    'kleinste_snelheid', 7, 1,
    $stap$$x'(t) = t^{2} - 34$ en $x''(t) = 2t$. $y'(t) = 6t$ en $y''(t) = 6$.$stap$
  ),
  (
    'kleinste_snelheid', 7, 2,
    $stap$Het inproduct uitwerken geeft $2t(t^{2} - 16) = 0$. Dus $t = 0$ of $t = 4$.$stap$
  ),
  (
    'kleinste_snelheid', 7, 3,
    $stap$Op $t = 0$ is de snelheid $34$. Op $t = 4$ is de snelheidsvector $(-18,\ 24)$, dus de snelheid is $\sqrt{900} = 30$. Dat is kleiner.$stap$
  ),
  (
    'kleinste_snelheid', 8, 0,
    $stap$De snelheid is het kleinst als $x'(t)\,x''(t) + y'(t)\,y''(t) = 0$, met $t \geq 0$. Daarna vergelijk je de kandidaten.$stap$
  ),
  (
    'kleinste_snelheid', 8, 1,
    $stap$$x'(t) = t^{2} - 41$ en $x''(t) = 2t$. $y'(t) = 8t$ en $y''(t) = 8$.$stap$
  ),
  (
    'kleinste_snelheid', 8, 2,
    $stap$Het inproduct uitwerken geeft $2t(t^{2} - 9) = 0$. Dus $t = 0$ of $t = 3$.$stap$
  ),
  (
    'kleinste_snelheid', 8, 3,
    $stap$Op $t = 0$ is de snelheid $41$. Op $t = 3$ is de snelheidsvector $(-32,\ 24)$, dus de snelheid is $\sqrt{1600} = 40$. Dat is kleiner.$stap$
  ),
  (
    'snelheid_cirkel', 1, 0,
    $stap$De snelheid is de lengte van de snelheidsvector. Bij deze cirkel is die lengte constant.$stap$
  ),
  (
    'snelheid_cirkel', 1, 1,
    $stap$$x'(t) = -4\sin(2t)$ en $y'(t) = 4\cos(2t)$.$stap$
  ),
  (
    'snelheid_cirkel', 1, 2,
    $stap$Het kwadraat van de lengte is $(4)^{2}\left(\sin^{2}(2t) + \cos^{2}(2t)\right) = 16$. De snelheid is dus $4$.$stap$
  ),
  (
    'snelheid_cirkel', 1, 3,
    $stap$Controle op $t = 0$: de snelheidsvector is $(0,\ 4)$, lengte $4$.$stap$
  ),
  (
    'snelheid_cirkel', 2, 0,
    $stap$De snelheid is de lengte van de snelheidsvector. Bij deze cirkel is die lengte constant.$stap$
  ),
  (
    'snelheid_cirkel', 2, 1,
    $stap$$x'(t) = -6\sin(2t)$ en $y'(t) = 6\cos(2t)$.$stap$
  ),
  (
    'snelheid_cirkel', 2, 2,
    $stap$Het kwadraat van de lengte is $(6)^{2}\left(\sin^{2}(2t) + \cos^{2}(2t)\right) = 36$. De snelheid is dus $6$.$stap$
  ),
  (
    'snelheid_cirkel', 2, 3,
    $stap$Controle op $t = 0$: de snelheidsvector is $(0,\ 6)$, lengte $6$.$stap$
  ),
  (
    'snelheid_cirkel', 3, 0,
    $stap$De snelheid is de lengte van de snelheidsvector. Bij deze cirkel is die lengte constant.$stap$
  ),
  (
    'snelheid_cirkel', 3, 1,
    $stap$$x'(t) = -10\sin(2t)$ en $y'(t) = 10\cos(2t)$.$stap$
  ),
  (
    'snelheid_cirkel', 3, 2,
    $stap$Het kwadraat van de lengte is $(10)^{2}\left(\sin^{2}(2t) + \cos^{2}(2t)\right) = 100$. De snelheid is dus $10$.$stap$
  ),
  (
    'snelheid_cirkel', 3, 3,
    $stap$Controle op $t = 0$: de snelheidsvector is $(0,\ 10)$, lengte $10$.$stap$
  ),
  (
    'snelheid_cirkel', 4, 0,
    $stap$De snelheid is de lengte van de snelheidsvector. Bij deze cirkel is die lengte constant.$stap$
  ),
  (
    'snelheid_cirkel', 4, 1,
    $stap$$x'(t) = -12\sin(3t)$ en $y'(t) = 12\cos(3t)$.$stap$
  ),
  (
    'snelheid_cirkel', 4, 2,
    $stap$Het kwadraat van de lengte is $(12)^{2}\left(\sin^{2}(3t) + \cos^{2}(3t)\right) = 144$. De snelheid is dus $12$.$stap$
  ),
  (
    'snelheid_cirkel', 4, 3,
    $stap$Controle op $t = 0$: de snelheidsvector is $(0,\ 12)$, lengte $12$.$stap$
  ),
  (
    'snelheid_cirkel', 5, 0,
    $stap$De snelheid is de lengte van de snelheidsvector. Bij deze cirkel is die lengte constant.$stap$
  ),
  (
    'snelheid_cirkel', 5, 1,
    $stap$$x'(t) = -15\sin(5t)$ en $y'(t) = 15\cos(5t)$.$stap$
  ),
  (
    'snelheid_cirkel', 5, 2,
    $stap$Het kwadraat van de lengte is $(15)^{2}\left(\sin^{2}(5t) + \cos^{2}(5t)\right) = 225$. De snelheid is dus $15$.$stap$
  ),
  (
    'snelheid_cirkel', 5, 3,
    $stap$Controle op $t = 0$: de snelheidsvector is $(0,\ 15)$, lengte $15$.$stap$
  ),
  (
    'snelheid_cirkel', 6, 0,
    $stap$De snelheid is de lengte van de snelheidsvector. Bij deze cirkel is die lengte constant.$stap$
  ),
  (
    'snelheid_cirkel', 6, 1,
    $stap$$x'(t) = -18\sin(3t)$ en $y'(t) = 18\cos(3t)$.$stap$
  ),
  (
    'snelheid_cirkel', 6, 2,
    $stap$Het kwadraat van de lengte is $(18)^{2}\left(\sin^{2}(3t) + \cos^{2}(3t)\right) = 324$. De snelheid is dus $18$.$stap$
  ),
  (
    'snelheid_cirkel', 6, 3,
    $stap$Controle op $t = 0$: de snelheidsvector is $(0,\ 18)$, lengte $18$.$stap$
  ),
  (
    'snelheid_cirkel', 7, 0,
    $stap$De snelheid is de lengte van de snelheidsvector. Bij deze cirkel is die lengte constant.$stap$
  ),
  (
    'snelheid_cirkel', 7, 1,
    $stap$$x'(t) = -8\sin(2t + 1)$ en $y'(t) = 8\cos(2t + 1)$.$stap$
  ),
  (
    'snelheid_cirkel', 7, 2,
    $stap$Het kwadraat van de lengte is $(8)^{2}\left(\sin^{2}(2t + 1) + \cos^{2}(2t + 1)\right) = 64$. De snelheid is dus $8$.$stap$
  ),
  (
    'snelheid_cirkel', 7, 3,
    $stap$Controle: $\sin^{2}(2t + 1) + \cos^{2}(2t + 1) = 1$ voor elke $t$. De lengte blijft $8$, ook met de fase erbij.$stap$
  ),
  (
    'snelheid_cirkel', 8, 0,
    $stap$De snelheid is de lengte van de snelheidsvector. Bij deze cirkel is die lengte constant.$stap$
  ),
  (
    'snelheid_cirkel', 8, 1,
    $stap$$x'(t) = -20\sin(4t)$ en $y'(t) = 20\cos(4t)$.$stap$
  ),
  (
    'snelheid_cirkel', 8, 2,
    $stap$Het kwadraat van de lengte is $(20)^{2}\left(\sin^{2}(4t) + \cos^{2}(4t)\right) = 400$. De snelheid is dus $20$.$stap$
  ),
  (
    'snelheid_cirkel', 8, 3,
    $stap$Controle op $t = 0$: de snelheidsvector is $(0,\ 20)$, lengte $20$.$stap$
  ),
  (
    'versnelling_cirkel', 1, 0,
    $stap$De versnelling krijg je door de plaats twee keer te differentiëren. Je zoekt de lengte van die vector.$stap$
  ),
  (
    'versnelling_cirkel', 1, 1,
    $stap$$x'(t) = -2\sin(2t)$ en $y'(t) = 2\cos(2t)$. Nog een keer: $x''(t) = -4\cos(2t)$ en $y''(t) = -4\sin(2t)$.$stap$
  ),
  (
    'versnelling_cirkel', 1, 2,
    $stap$Het kwadraat van de lengte is $4^{2} = 16$. De grootte van de versnelling is $4$.$stap$
  ),
  (
    'versnelling_cirkel', 1, 3,
    $stap$Controle: $1 \cdot 2^{2} = 4$. De snelheid zou $2$ zijn. Dat is een ander getal, en de vraag vraagt de versnelling.$stap$
  ),
  (
    'versnelling_cirkel', 2, 0,
    $stap$De versnelling krijg je door de plaats twee keer te differentiëren. Je zoekt de lengte van die vector.$stap$
  ),
  (
    'versnelling_cirkel', 2, 1,
    $stap$$x'(t) = -6\sin(3t)$ en $y'(t) = 6\cos(3t)$. Nog een keer: $x''(t) = -18\cos(3t)$ en $y''(t) = -18\sin(3t)$.$stap$
  ),
  (
    'versnelling_cirkel', 2, 2,
    $stap$Het kwadraat van de lengte is $18^{2} = 324$. De grootte van de versnelling is $18$.$stap$
  ),
  (
    'versnelling_cirkel', 2, 3,
    $stap$Controle: $2 \cdot 3^{2} = 18$. De snelheid zou $6$ zijn. Dat is een ander getal, en de vraag vraagt de versnelling.$stap$
  ),
  (
    'versnelling_cirkel', 3, 0,
    $stap$De versnelling krijg je door de plaats twee keer te differentiëren. Je zoekt de lengte van die vector.$stap$
  ),
  (
    'versnelling_cirkel', 3, 1,
    $stap$$x'(t) = -3\sin(3t)$ en $y'(t) = 3\cos(3t)$. Nog een keer: $x''(t) = -9\cos(3t)$ en $y''(t) = -9\sin(3t)$.$stap$
  ),
  (
    'versnelling_cirkel', 3, 2,
    $stap$Het kwadraat van de lengte is $9^{2} = 81$. De grootte van de versnelling is $9$.$stap$
  ),
  (
    'versnelling_cirkel', 3, 3,
    $stap$Controle: $1 \cdot 3^{2} = 9$. De snelheid zou $3$ zijn. Dat is een ander getal, en de vraag vraagt de versnelling.$stap$
  ),
  (
    'versnelling_cirkel', 4, 0,
    $stap$De versnelling krijg je door de plaats twee keer te differentiëren. Je zoekt de lengte van die vector.$stap$
  ),
  (
    'versnelling_cirkel', 4, 1,
    $stap$$x'(t) = -9\sin(3t)$ en $y'(t) = 9\cos(3t)$. Nog een keer: $x''(t) = -27\cos(3t)$ en $y''(t) = -27\sin(3t)$.$stap$
  ),
  (
    'versnelling_cirkel', 4, 2,
    $stap$Het kwadraat van de lengte is $27^{2} = 729$. De grootte van de versnelling is $27$.$stap$
  ),
  (
    'versnelling_cirkel', 4, 3,
    $stap$Controle: $3 \cdot 3^{2} = 27$. De snelheid zou $9$ zijn. Dat is een ander getal, en de vraag vraagt de versnelling.$stap$
  ),
  (
    'versnelling_cirkel', 5, 0,
    $stap$De versnelling krijg je door de plaats twee keer te differentiëren. Je zoekt de lengte van die vector.$stap$
  ),
  (
    'versnelling_cirkel', 5, 1,
    $stap$$x'(t) = -12\sin(2t)$ en $y'(t) = 12\cos(2t)$. Nog een keer: $x''(t) = -24\cos(2t)$ en $y''(t) = -24\sin(2t)$.$stap$
  ),
  (
    'versnelling_cirkel', 5, 2,
    $stap$Het kwadraat van de lengte is $24^{2} = 576$. De grootte van de versnelling is $24$.$stap$
  ),
  (
    'versnelling_cirkel', 5, 3,
    $stap$Controle: $6 \cdot 2^{2} = 24$. De snelheid zou $12$ zijn. Dat is een ander getal, en de vraag vraagt de versnelling.$stap$
  ),
  (
    'versnelling_cirkel', 6, 0,
    $stap$De versnelling krijg je door de plaats twee keer te differentiëren. Je zoekt de lengte van die vector.$stap$
  ),
  (
    'versnelling_cirkel', 6, 1,
    $stap$$x'(t) = -15\sin(3t)$ en $y'(t) = 15\cos(3t)$. Nog een keer: $x''(t) = -45\cos(3t)$ en $y''(t) = -45\sin(3t)$.$stap$
  ),
  (
    'versnelling_cirkel', 6, 2,
    $stap$Het kwadraat van de lengte is $45^{2} = 2025$. De grootte van de versnelling is $45$.$stap$
  ),
  (
    'versnelling_cirkel', 6, 3,
    $stap$Controle: $5 \cdot 3^{2} = 45$. De snelheid zou $15$ zijn. Dat is een ander getal, en de vraag vraagt de versnelling.$stap$
  ),
  (
    'versnelling_cirkel', 7, 0,
    $stap$De versnelling krijg je door de plaats twee keer te differentiëren. Je zoekt de lengte van die vector.$stap$
  ),
  (
    'versnelling_cirkel', 7, 1,
    $stap$$x'(t) = -8\sin(4t)$ en $y'(t) = 8\cos(4t)$. Nog een keer: $x''(t) = -32\cos(4t)$ en $y''(t) = -32\sin(4t)$.$stap$
  ),
  (
    'versnelling_cirkel', 7, 2,
    $stap$Het kwadraat van de lengte is $32^{2} = 1024$. De grootte van de versnelling is $32$.$stap$
  ),
  (
    'versnelling_cirkel', 7, 3,
    $stap$Controle: $2 \cdot 4^{2} = 32$. De snelheid zou $8$ zijn. Dat is een ander getal, en de vraag vraagt de versnelling.$stap$
  ),
  (
    'versnelling_cirkel', 8, 0,
    $stap$De versnelling krijg je door de plaats twee keer te differentiëren. Je zoekt de lengte van die vector.$stap$
  ),
  (
    'versnelling_cirkel', 8, 1,
    $stap$$x'(t) = -14\sin(2t + 1)$ en $y'(t) = 14\cos(2t + 1)$. Nog een keer: $x''(t) = -28\cos(2t + 1)$ en $y''(t) = -28\sin(2t + 1)$.$stap$
  ),
  (
    'versnelling_cirkel', 8, 2,
    $stap$Het kwadraat van de lengte is $28^{2} = 784$. De grootte van de versnelling is $28$.$stap$
  ),
  (
    'versnelling_cirkel', 8, 3,
    $stap$Controle: $7 \cdot 2^{2} = 28$. De snelheid zou $14$ zijn. Dat is een ander getal, en de vraag vraagt de versnelling.$stap$
  ),
  (
    'grootste_snelheid_trilling', 1, 0,
    $stap$Je zoekt de grootste waarde van $|f'(t)|$.$stap$
  ),
  (
    'grootste_snelheid_trilling', 1, 1,
    $stap$$f'(t) = 6\cos(2t)$.$stap$
  ),
  (
    'grootste_snelheid_trilling', 1, 2,
    $stap$Een sinus of cosinus zit tussen $-1$ en $1$. De grootste $|f'(t)|$ is dus $6$.$stap$
  ),
  (
    'grootste_snelheid_trilling', 1, 3,
    $stap$Die waarde wordt gehaald, bijvoorbeeld op $t = 0$, want dan is $\cos(0) = 1$. De constante in $f$ valt weg bij het differentiëren.$stap$
  ),
  (
    'grootste_snelheid_trilling', 2, 0,
    $stap$Je zoekt de grootste waarde van $|f'(t)|$.$stap$
  ),
  (
    'grootste_snelheid_trilling', 2, 1,
    $stap$$f'(t) = -8\sin(2t)$.$stap$
  ),
  (
    'grootste_snelheid_trilling', 2, 2,
    $stap$Een sinus of cosinus zit tussen $-1$ en $1$. De grootste $|f'(t)|$ is dus $8$.$stap$
  ),
  (
    'grootste_snelheid_trilling', 2, 3,
    $stap$Die waarde wordt gehaald, bijvoorbeeld op $t = \dfrac{\pi}{4}$. De constante in $f$ valt weg bij het differentiëren.$stap$
  ),
  (
    'grootste_snelheid_trilling', 3, 0,
    $stap$Je zoekt de grootste waarde van $|f'(t)|$.$stap$
  ),
  (
    'grootste_snelheid_trilling', 3, 1,
    $stap$$f'(t) = 15\cos(3t)$.$stap$
  ),
  (
    'grootste_snelheid_trilling', 3, 2,
    $stap$Een sinus of cosinus zit tussen $-1$ en $1$. De grootste $|f'(t)|$ is dus $15$.$stap$
  ),
  (
    'grootste_snelheid_trilling', 3, 3,
    $stap$Die waarde wordt gehaald, bijvoorbeeld op $t = 0$, want dan is $\cos(0) = 1$. De constante in $f$ valt weg bij het differentiëren.$stap$
  ),
  (
    'grootste_snelheid_trilling', 4, 0,
    $stap$Je zoekt de grootste waarde van $|f'(t)|$.$stap$
  ),
  (
    'grootste_snelheid_trilling', 4, 1,
    $stap$$f'(t) = -10\sin(5t)$.$stap$
  ),
  (
    'grootste_snelheid_trilling', 4, 2,
    $stap$Een sinus of cosinus zit tussen $-1$ en $1$. De grootste $|f'(t)|$ is dus $10$.$stap$
  ),
  (
    'grootste_snelheid_trilling', 4, 3,
    $stap$Die waarde wordt gehaald, bijvoorbeeld op $t = \dfrac{\pi}{10}$. De constante in $f$ valt weg bij het differentiëren.$stap$
  ),
  (
    'grootste_snelheid_trilling', 5, 0,
    $stap$Je zoekt de grootste waarde van $|f'(t)|$.$stap$
  ),
  (
    'grootste_snelheid_trilling', 5, 1,
    $stap$$f'(t) = 12\cos(2t)$.$stap$
  ),
  (
    'grootste_snelheid_trilling', 5, 2,
    $stap$Een sinus of cosinus zit tussen $-1$ en $1$. De grootste $|f'(t)|$ is dus $12$.$stap$
  ),
  (
    'grootste_snelheid_trilling', 5, 3,
    $stap$Die waarde wordt gehaald, bijvoorbeeld op $t = 0$, want dan is $\cos(0) = 1$. De constante in $f$ valt weg bij het differentiëren.$stap$
  ),
  (
    'grootste_snelheid_trilling', 6, 0,
    $stap$Je zoekt de grootste waarde van $|f'(t)|$.$stap$
  ),
  (
    'grootste_snelheid_trilling', 6, 1,
    $stap$$f'(t) = -21\sin(3t)$.$stap$
  ),
  (
    'grootste_snelheid_trilling', 6, 2,
    $stap$Een sinus of cosinus zit tussen $-1$ en $1$. De grootste $|f'(t)|$ is dus $21$.$stap$
  ),
  (
    'grootste_snelheid_trilling', 6, 3,
    $stap$Die waarde wordt gehaald, bijvoorbeeld op $t = \dfrac{\pi}{6}$. De constante in $f$ valt weg bij het differentiëren.$stap$
  ),
  (
    'grootste_snelheid_trilling', 7, 0,
    $stap$Je zoekt de grootste waarde van $|f'(t)|$.$stap$
  ),
  (
    'grootste_snelheid_trilling', 7, 1,
    $stap$$f'(t) = 16\cos(4t)$.$stap$
  ),
  (
    'grootste_snelheid_trilling', 7, 2,
    $stap$Een sinus of cosinus zit tussen $-1$ en $1$. De grootste $|f'(t)|$ is dus $16$.$stap$
  ),
  (
    'grootste_snelheid_trilling', 7, 3,
    $stap$Die waarde wordt gehaald, bijvoorbeeld op $t = 0$, want dan is $\cos(0) = 1$. De constante in $f$ valt weg bij het differentiëren.$stap$
  ),
  (
    'grootste_snelheid_trilling', 8, 0,
    $stap$Je zoekt de grootste waarde van $|f'(t)|$.$stap$
  ),
  (
    'grootste_snelheid_trilling', 8, 1,
    $stap$$f'(t) = -18\sin(2t)$.$stap$
  ),
  (
    'grootste_snelheid_trilling', 8, 2,
    $stap$Een sinus of cosinus zit tussen $-1$ en $1$. De grootste $|f'(t)|$ is dus $18$.$stap$
  ),
  (
    'grootste_snelheid_trilling', 8, 3,
    $stap$Die waarde wordt gehaald, bijvoorbeeld op $t = \dfrac{\pi}{4}$. De constante in $f$ valt weg bij het differentiëren.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 1, 0,
    $stap$Je zoekt de lengte van de snelheidsvector op $t = 0$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 1, 1,
    $stap$$x'(t) = -3\sin(t)$ en $y'(t) = 4\cos(t)$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 1, 2,
    $stap$Op $t = 0$ is de snelheidsvector $(0,\ 4)$. De snelheid is $4$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 1, 3,
    $stap$Controle: $0^{2} + 4^{2} = 16$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 2, 0,
    $stap$Je zoekt de lengte van de snelheidsvector op $t = 0$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 2, 1,
    $stap$$x'(t) = -5\sin(t)$ en $y'(t) = 12\cos(t)$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 2, 2,
    $stap$Op $t = 0$ is de snelheidsvector $(0,\ 12)$. De snelheid is $12$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 2, 3,
    $stap$Controle: $0^{2} + 12^{2} = 144$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 3, 0,
    $stap$Je zoekt de lengte van de snelheidsvector op $t = \dfrac{\pi}{2}$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 3, 1,
    $stap$$x'(t) = -9\sin(t)$ en $y'(t) = 12\cos(t)$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 3, 2,
    $stap$Op $t = \dfrac{\pi}{2}$ is de snelheidsvector $(-9,\ 0)$. De snelheid is $9$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 3, 3,
    $stap$Controle: $-9^{2} + 0^{2} = 81$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 4, 0,
    $stap$Je zoekt de lengte van de snelheidsvector op $t = 0$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 4, 1,
    $stap$$x'(t) = -8\sin(t)$ en $y'(t) = 15\cos(t)$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 4, 2,
    $stap$Op $t = 0$ is de snelheidsvector $(0,\ 15)$. De snelheid is $15$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 4, 3,
    $stap$Controle: $0^{2} + 15^{2} = 225$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 5, 0,
    $stap$Je zoekt de lengte van de snelheidsvector op $t = 0$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 5, 1,
    $stap$$x'(t) = -16\sin(2t)$ en $y'(t) = 30\cos(2t)$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 5, 2,
    $stap$Op $t = 0$ is de snelheidsvector $(0,\ 30)$. De snelheid is $30$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 5, 3,
    $stap$Controle: $0^{2} + 30^{2} = 900$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 6, 0,
    $stap$Je zoekt de lengte van de snelheidsvector op $t = \dfrac{\pi}{4}$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 6, 1,
    $stap$$x'(t) = -16\sin(2t)$ en $y'(t) = 30\cos(2t)$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 6, 2,
    $stap$Op $t = \dfrac{\pi}{4}$ is de snelheidsvector $(-16,\ 0)$. De snelheid is $16$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 6, 3,
    $stap$Controle: $-16^{2} + 0^{2} = 256$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 7, 0,
    $stap$Je zoekt de lengte van de snelheidsvector op $t = \dfrac{\pi}{2}$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 7, 1,
    $stap$$x'(t) = -20\sin(t)$ en $y'(t) = 21\cos(t)$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 7, 2,
    $stap$Op $t = \dfrac{\pi}{2}$ is de snelheidsvector $(-20,\ 0)$. De snelheid is $20$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 7, 3,
    $stap$Controle: $-20^{2} + 0^{2} = 400$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 8, 0,
    $stap$Je zoekt de lengte van de snelheidsvector op $t = 0$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 8, 1,
    $stap$$x'(t) = -7\sin(t)$ en $y'(t) = 24\cos(t)$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 8, 2,
    $stap$Op $t = 0$ is de snelheidsvector $(0,\ 24)$. De snelheid is $24$.$stap$
  ),
  (
    'snelheid_op_tijdstip_gonio', 8, 3,
    $stap$Controle: $0^{2} + 24^{2} = 576$.$stap$
  ),
  (
    'grootste_snelheid_lijn', 1, 0,
    $stap$Schrijf $f$ als één cosinus. De grootste snelheid is dan de straal keer de hoeksnelheid.$stap$
  ),
  (
    'grootste_snelheid_lijn', 1, 1,
    $stap$$A = 3$ en $B = 4$, dus $R = \sqrt{9 + 16} = \sqrt{25} = 5$. Er is een hoek $\varphi$ zodat $f(t) = 5\cos(t - \varphi)$.$stap$
  ),
  (
    'grootste_snelheid_lijn', 1, 2,
    $stap$Dan is $f'(t) = -5\sin(t - \varphi)$. De sinus zit tussen $-1$ en $1$, dus de grootste $|f'(t)|$ is $5$.$stap$
  ),
  (
    'grootste_snelheid_lijn', 1, 3,
    $stap$Controle: de afgeleide $-3\sin(t) + 4\cos(t)$ heeft als grootste waarde $\sqrt{(3)^{2} + (4)^{2}} = \sqrt{25} = 5$.$stap$
  ),
  (
    'grootste_snelheid_lijn', 2, 0,
    $stap$Schrijf $f$ als één cosinus. De grootste snelheid is dan de straal keer de hoeksnelheid.$stap$
  ),
  (
    'grootste_snelheid_lijn', 2, 1,
    $stap$$A = 5$ en $B = 12$, dus $R = \sqrt{25 + 144} = \sqrt{169} = 13$. Er is een hoek $\varphi$ zodat $f(t) = 13\cos(t - \varphi)$.$stap$
  ),
  (
    'grootste_snelheid_lijn', 2, 2,
    $stap$Dan is $f'(t) = -13\sin(t - \varphi)$. De sinus zit tussen $-1$ en $1$, dus de grootste $|f'(t)|$ is $13$.$stap$
  ),
  (
    'grootste_snelheid_lijn', 2, 3,
    $stap$Controle: de afgeleide $-5\sin(t) + 12\cos(t)$ heeft als grootste waarde $\sqrt{(5)^{2} + (12)^{2}} = \sqrt{169} = 13$.$stap$
  ),
  (
    'grootste_snelheid_lijn', 3, 0,
    $stap$Schrijf $f$ als één cosinus. De grootste snelheid is dan de straal keer de hoeksnelheid.$stap$
  ),
  (
    'grootste_snelheid_lijn', 3, 1,
    $stap$$A = 8$ en $B = 15$, dus $R = \sqrt{64 + 225} = \sqrt{289} = 17$. Er is een hoek $\varphi$ zodat $f(t) = 17\cos(t - \varphi)$.$stap$
  ),
  (
    'grootste_snelheid_lijn', 3, 2,
    $stap$Dan is $f'(t) = -17\sin(t - \varphi)$. De sinus zit tussen $-1$ en $1$, dus de grootste $|f'(t)|$ is $17$.$stap$
  ),
  (
    'grootste_snelheid_lijn', 3, 3,
    $stap$Controle: de afgeleide $-8\sin(t) + 15\cos(t)$ heeft als grootste waarde $\sqrt{(8)^{2} + (15)^{2}} = \sqrt{289} = 17$.$stap$
  ),
  (
    'grootste_snelheid_lijn', 4, 0,
    $stap$Schrijf $f$ als één cosinus. De grootste snelheid is dan de straal keer de hoeksnelheid.$stap$
  ),
  (
    'grootste_snelheid_lijn', 4, 1,
    $stap$$A = 7$ en $B = 24$, dus $R = \sqrt{49 + 576} = \sqrt{625} = 25$. Er is een hoek $\varphi$ zodat $f(t) = 25\cos(t - \varphi)$.$stap$
  ),
  (
    'grootste_snelheid_lijn', 4, 2,
    $stap$Dan is $f'(t) = -25\sin(t - \varphi)$. De sinus zit tussen $-1$ en $1$, dus de grootste $|f'(t)|$ is $25$.$stap$
  ),
  (
    'grootste_snelheid_lijn', 4, 3,
    $stap$Controle: de afgeleide $-7\sin(t) + 24\cos(t)$ heeft als grootste waarde $\sqrt{(7)^{2} + (24)^{2}} = \sqrt{625} = 25$.$stap$
  ),
  (
    'grootste_snelheid_lijn', 5, 0,
    $stap$Schrijf $f$ als één cosinus. De grootste snelheid is dan de straal keer de hoeksnelheid.$stap$
  ),
  (
    'grootste_snelheid_lijn', 5, 1,
    $stap$$A = 20$ en $B = 21$, dus $R = \sqrt{400 + 441} = \sqrt{841} = 29$. Er is een hoek $\varphi$ zodat $f(t) = 29\cos(t - \varphi)$.$stap$
  ),
  (
    'grootste_snelheid_lijn', 5, 2,
    $stap$Dan is $f'(t) = -29\sin(t - \varphi)$. De sinus zit tussen $-1$ en $1$, dus de grootste $|f'(t)|$ is $29$.$stap$
  ),
  (
    'grootste_snelheid_lijn', 5, 3,
    $stap$Controle: de afgeleide $-20\sin(t) + 21\cos(t)$ heeft als grootste waarde $\sqrt{(20)^{2} + (21)^{2}} = \sqrt{841} = 29$.$stap$
  ),
  (
    'grootste_snelheid_lijn', 6, 0,
    $stap$Schrijf $f$ als één cosinus. De grootste snelheid is dan de straal keer de hoeksnelheid.$stap$
  ),
  (
    'grootste_snelheid_lijn', 6, 1,
    $stap$$A = 6$ en $B = 8$, dus $R = \sqrt{36 + 64} = \sqrt{100} = 10$. Er is een hoek $\varphi$ zodat $f(t) = 10\cos(2t - \varphi)$.$stap$
  ),
  (
    'grootste_snelheid_lijn', 6, 2,
    $stap$Dan is $f'(t) = -20\sin(2t - \varphi)$. De sinus zit tussen $-1$ en $1$, dus de grootste $|f'(t)|$ is $20$.$stap$
  ),
  (
    'grootste_snelheid_lijn', 6, 3,
    $stap$Controle: de afgeleide $-12\sin(2t) + 16\cos(2t)$ heeft als grootste waarde $\sqrt{(12)^{2} + (16)^{2}} = \sqrt{400} = 20$.$stap$
  ),
  (
    'grootste_snelheid_lijn', 7, 0,
    $stap$Schrijf $f$ als één cosinus. De grootste snelheid is dan de straal keer de hoeksnelheid.$stap$
  ),
  (
    'grootste_snelheid_lijn', 7, 1,
    $stap$$A = 9$ en $B = 12$, dus $R = \sqrt{81 + 144} = \sqrt{225} = 15$. Er is een hoek $\varphi$ zodat $f(t) = 15\cos(2t - \varphi)$.$stap$
  ),
  (
    'grootste_snelheid_lijn', 7, 2,
    $stap$Dan is $f'(t) = -30\sin(2t - \varphi)$. De sinus zit tussen $-1$ en $1$, dus de grootste $|f'(t)|$ is $30$.$stap$
  ),
  (
    'grootste_snelheid_lijn', 7, 3,
    $stap$Controle: de afgeleide $-18\sin(2t) + 24\cos(2t)$ heeft als grootste waarde $\sqrt{(18)^{2} + (24)^{2}} = \sqrt{900} = 30$.$stap$
  ),
  (
    'grootste_snelheid_lijn', 8, 0,
    $stap$Schrijf $f$ als één cosinus. De grootste snelheid is dan de straal keer de hoeksnelheid.$stap$
  ),
  (
    'grootste_snelheid_lijn', 8, 1,
    $stap$$A = 5$ en $B = 12$, dus $R = \sqrt{25 + 144} = \sqrt{169} = 13$. Er is een hoek $\varphi$ zodat $f(t) = 13\cos(3t - \varphi)$.$stap$
  ),
  (
    'grootste_snelheid_lijn', 8, 2,
    $stap$Dan is $f'(t) = -39\sin(3t - \varphi)$. De sinus zit tussen $-1$ en $1$, dus de grootste $|f'(t)|$ is $39$.$stap$
  ),
  (
    'grootste_snelheid_lijn', 8, 3,
    $stap$Controle: de afgeleide $-15\sin(3t) + 36\cos(3t)$ heeft als grootste waarde $\sqrt{(15)^{2} + (36)^{2}} = \sqrt{1521} = 39$.$stap$
  ),
  (
    'grootste_snelheid_vlak', 1, 0,
    $stap$Je zoekt de grootste lengte van de snelheidsvector.$stap$
  ),
  (
    'grootste_snelheid_vlak', 1, 1,
    $stap$$x'(t) = -3\sin(t)$ en $y'(t) = 4\cos(t)$.$stap$
  ),
  (
    'grootste_snelheid_vlak', 1, 2,
    $stap$$(x')^{2} + (y')^{2} = 16 + (9 - 16)\sin^{2}(t)$. Het tweede stuk is negatief of nul, dus het kwadraat is het grootst als $\sin(t) = 0$. De grootste snelheid is dan $4$.$stap$
  ),
  (
    'grootste_snelheid_vlak', 1, 3,
    $stap$Controle: op zo'n tijdstip is de snelheidsvector $(0,\ 4)$ of met een minteken. De lengte is $4$. De kleinste snelheid op deze baan is $3$.$stap$
  ),
  (
    'grootste_snelheid_vlak', 2, 0,
    $stap$Je zoekt de grootste lengte van de snelheidsvector.$stap$
  ),
  (
    'grootste_snelheid_vlak', 2, 1,
    $stap$$x'(t) = -5\sin(t)$ en $y'(t) = 12\cos(t)$.$stap$
  ),
  (
    'grootste_snelheid_vlak', 2, 2,
    $stap$$(x')^{2} + (y')^{2} = 144 + (25 - 144)\sin^{2}(t)$. Het tweede stuk is negatief of nul, dus het kwadraat is het grootst als $\sin(t) = 0$. De grootste snelheid is dan $12$.$stap$
  ),
  (
    'grootste_snelheid_vlak', 2, 3,
    $stap$Controle: op zo'n tijdstip is de snelheidsvector $(0,\ 12)$ of met een minteken. De lengte is $12$. De kleinste snelheid op deze baan is $5$.$stap$
  ),
  (
    'grootste_snelheid_vlak', 3, 0,
    $stap$Je zoekt de grootste lengte van de snelheidsvector.$stap$
  ),
  (
    'grootste_snelheid_vlak', 3, 1,
    $stap$$x'(t) = -8\sin(t)$ en $y'(t) = 15\cos(t)$.$stap$
  ),
  (
    'grootste_snelheid_vlak', 3, 2,
    $stap$$(x')^{2} + (y')^{2} = 225 + (64 - 225)\sin^{2}(t)$. Het tweede stuk is negatief of nul, dus het kwadraat is het grootst als $\sin(t) = 0$. De grootste snelheid is dan $15$.$stap$
  ),
  (
    'grootste_snelheid_vlak', 3, 3,
    $stap$Controle: op zo'n tijdstip is de snelheidsvector $(0,\ 15)$ of met een minteken. De lengte is $15$. De kleinste snelheid op deze baan is $8$.$stap$
  ),
  (
    'grootste_snelheid_vlak', 4, 0,
    $stap$Je zoekt de grootste lengte van de snelheidsvector.$stap$
  ),
  (
    'grootste_snelheid_vlak', 4, 1,
    $stap$$x'(t) = -7\sin(t)$ en $y'(t) = 24\cos(t)$.$stap$
  ),
  (
    'grootste_snelheid_vlak', 4, 2,
    $stap$$(x')^{2} + (y')^{2} = 576 + (49 - 576)\sin^{2}(t)$. Het tweede stuk is negatief of nul, dus het kwadraat is het grootst als $\sin(t) = 0$. De grootste snelheid is dan $24$.$stap$
  ),
  (
    'grootste_snelheid_vlak', 4, 3,
    $stap$Controle: op zo'n tijdstip is de snelheidsvector $(0,\ 24)$ of met een minteken. De lengte is $24$. De kleinste snelheid op deze baan is $7$.$stap$
  ),
  (
    'grootste_snelheid_vlak', 5, 0,
    $stap$Je zoekt de grootste lengte van de snelheidsvector.$stap$
  ),
  (
    'grootste_snelheid_vlak', 5, 1,
    $stap$$x'(t) = -21\sin(t)$ en $y'(t) = 20\cos(t)$.$stap$
  ),
  (
    'grootste_snelheid_vlak', 5, 2,
    $stap$$(x')^{2} + (y')^{2} = 441 + (400 - 441)\cos^{2}(t)$. Het tweede stuk is negatief of nul, dus het kwadraat is het grootst als $\cos(t) = 0$. De grootste snelheid is dan $21$.$stap$
  ),
  (
    'grootste_snelheid_vlak', 5, 3,
    $stap$Controle: op zo'n tijdstip is de snelheidsvector $(21,\ 0)$ of met een minteken. De lengte is $21$. De kleinste snelheid op deze baan is $20$.$stap$
  ),
  (
    'grootste_snelheid_vlak', 6, 0,
    $stap$Je zoekt de grootste lengte van de snelheidsvector.$stap$
  ),
  (
    'grootste_snelheid_vlak', 6, 1,
    $stap$$x'(t) = -12\sin(2t)$ en $y'(t) = 16\cos(2t)$.$stap$
  ),
  (
    'grootste_snelheid_vlak', 6, 2,
    $stap$$(x')^{2} + (y')^{2} = 256 + (144 - 256)\sin^{2}(2t)$. Het tweede stuk is negatief of nul, dus het kwadraat is het grootst als $\sin(2t) = 0$. De grootste snelheid is dan $16$.$stap$
  ),
  (
    'grootste_snelheid_vlak', 6, 3,
    $stap$Controle: op zo'n tijdstip is de snelheidsvector $(0,\ 16)$ of met een minteken. De lengte is $16$. De kleinste snelheid op deze baan is $12$.$stap$
  ),
  (
    'grootste_snelheid_vlak', 7, 0,
    $stap$Je zoekt de grootste lengte van de snelheidsvector.$stap$
  ),
  (
    'grootste_snelheid_vlak', 7, 1,
    $stap$$x'(t) = -24\sin(3t)$ en $y'(t) = 45\cos(3t)$.$stap$
  ),
  (
    'grootste_snelheid_vlak', 7, 2,
    $stap$$(x')^{2} + (y')^{2} = 2025 + (576 - 2025)\sin^{2}(3t)$. Het tweede stuk is negatief of nul, dus het kwadraat is het grootst als $\sin(3t) = 0$. De grootste snelheid is dan $45$.$stap$
  ),
  (
    'grootste_snelheid_vlak', 7, 3,
    $stap$Controle: op zo'n tijdstip is de snelheidsvector $(0,\ 45)$ of met een minteken. De lengte is $45$. De kleinste snelheid op deze baan is $24$.$stap$
  ),
  (
    'grootste_snelheid_vlak', 8, 0,
    $stap$Je zoekt de grootste lengte van de snelheidsvector.$stap$
  ),
  (
    'grootste_snelheid_vlak', 8, 1,
    $stap$$x'(t) = -36\sin(3t)$ en $y'(t) = 15\cos(3t)$.$stap$
  ),
  (
    'grootste_snelheid_vlak', 8, 2,
    $stap$$(x')^{2} + (y')^{2} = 1296 + (225 - 1296)\cos^{2}(3t)$. Het tweede stuk is negatief of nul, dus het kwadraat is het grootst als $\cos(3t) = 0$. De grootste snelheid is dan $36$.$stap$
  ),
  (
    'grootste_snelheid_vlak', 8, 3,
    $stap$Controle: op zo'n tijdstip is de snelheidsvector $(36,\ 0)$ of met een minteken. De lengte is $36$. De kleinste snelheid op deze baan is $15$.$stap$
  )

) AS v(cluster_slug, q_order_index, step_order, step_description)
JOIN public.topics_new t
  ON t.slug IN ('snelheid_versnelling', 'cirkel_en_trilling', 'beweging_gonio')
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id AND c.slug = v.cluster_slug
JOIN public.questions_new q
  ON q.topic_id = t.id
 AND q.cluster_id = c.id
 AND q.order_index = v.q_order_index
ON CONFLICT (question_id, step_order) DO NOTHING;

DO $$
DECLARE
  n_onderwerpen int;
  n_soorten int;
  n_vragen int;
  n_stappen int;
BEGIN
  SELECT count(*) INTO n_onderwerpen
  FROM public.topics_new t
  JOIN public.chapters h ON h.id = t.chapter_id
  WHERE h.slug = 'beweging';

  SELECT count(*) INTO n_soorten
  FROM public.topic_clusters_new c
  JOIN public.topics_new t ON t.id = c.topic_id
  JOIN public.chapters h ON h.id = t.chapter_id
  WHERE h.slug = 'beweging';

  SELECT count(*) INTO n_vragen
  FROM public.questions_new q
  JOIN public.topics_new t ON t.id = q.topic_id
  JOIN public.chapters h ON h.id = t.chapter_id
  WHERE h.slug = 'beweging';

  SELECT count(*) INTO n_stappen
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  JOIN public.topics_new t ON t.id = q.topic_id
  JOIN public.chapters h ON h.id = t.chapter_id
  WHERE h.slug = 'beweging';

  IF n_onderwerpen <> 3 OR n_soorten <> 10 OR n_vragen <> 80 OR n_stappen <> 320 THEN
    RAISE EXCEPTION 'Hoofdstuk Beweging klopt niet: % onderwerpen, % soorten, % opgaven, % stappen',
      n_onderwerpen, n_soorten, n_vragen, n_stappen;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM (VALUES

      ('snelheid_op_tijdstip', 1, '5', ''),
      ('snelheid_op_tijdstip', 2, '10', ''),
      ('snelheid_op_tijdstip', 3, '13', ''),
      ('snelheid_op_tijdstip', 4, '26', ''),
      ('snelheid_op_tijdstip', 5, '15', ''),
      ('snelheid_op_tijdstip', 6, '17', ''),
      ('snelheid_op_tijdstip', 7, '25', ''),
      ('snelheid_op_tijdstip', 8, '29', ''),
      ('grootte_versnelling', 1, '5', ''),
      ('grootte_versnelling', 2, '13', ''),
      ('grootte_versnelling', 3, '17', ''),
      ('grootte_versnelling', 4, '25', ''),
      ('grootte_versnelling', 5, '29', ''),
      ('grootte_versnelling', 6, '15', ''),
      ('grootte_versnelling', 7, '10', ''),
      ('grootte_versnelling', 8, '20', ''),
      ('tijdstip_kleinste_snelheid', 1, '1', 't ='),
      ('tijdstip_kleinste_snelheid', 2, '2', 't ='),
      ('tijdstip_kleinste_snelheid', 3, '3', 't ='),
      ('tijdstip_kleinste_snelheid', 4, '4', 't ='),
      ('tijdstip_kleinste_snelheid', 5, '5', 't ='),
      ('tijdstip_kleinste_snelheid', 6, '6', 't ='),
      ('tijdstip_kleinste_snelheid', 7, '2', 't ='),
      ('tijdstip_kleinste_snelheid', 8, '7', 't ='),
      ('kleinste_snelheid', 1, '4', ''),
      ('kleinste_snelheid', 2, '5', ''),
      ('kleinste_snelheid', 3, '6', ''),
      ('kleinste_snelheid', 4, '8', ''),
      ('kleinste_snelheid', 5, '10', ''),
      ('kleinste_snelheid', 6, '7', ''),
      ('kleinste_snelheid', 7, '30', ''),
      ('kleinste_snelheid', 8, '40', ''),
      ('snelheid_cirkel', 1, '4', ''),
      ('snelheid_cirkel', 2, '6', ''),
      ('snelheid_cirkel', 3, '10', ''),
      ('snelheid_cirkel', 4, '12', ''),
      ('snelheid_cirkel', 5, '15', ''),
      ('snelheid_cirkel', 6, '18', ''),
      ('snelheid_cirkel', 7, '8', ''),
      ('snelheid_cirkel', 8, '20', ''),
      ('versnelling_cirkel', 1, '4', ''),
      ('versnelling_cirkel', 2, '18', ''),
      ('versnelling_cirkel', 3, '9', ''),
      ('versnelling_cirkel', 4, '27', ''),
      ('versnelling_cirkel', 5, '24', ''),
      ('versnelling_cirkel', 6, '45', ''),
      ('versnelling_cirkel', 7, '32', ''),
      ('versnelling_cirkel', 8, '28', ''),
      ('grootste_snelheid_trilling', 1, '6', ''),
      ('grootste_snelheid_trilling', 2, '8', ''),
      ('grootste_snelheid_trilling', 3, '15', ''),
      ('grootste_snelheid_trilling', 4, '10', ''),
      ('grootste_snelheid_trilling', 5, '12', ''),
      ('grootste_snelheid_trilling', 6, '21', ''),
      ('grootste_snelheid_trilling', 7, '16', ''),
      ('grootste_snelheid_trilling', 8, '18', ''),
      ('snelheid_op_tijdstip_gonio', 1, '4', ''),
      ('snelheid_op_tijdstip_gonio', 2, '12', ''),
      ('snelheid_op_tijdstip_gonio', 3, '9', ''),
      ('snelheid_op_tijdstip_gonio', 4, '15', ''),
      ('snelheid_op_tijdstip_gonio', 5, '30', ''),
      ('snelheid_op_tijdstip_gonio', 6, '16', ''),
      ('snelheid_op_tijdstip_gonio', 7, '20', ''),
      ('snelheid_op_tijdstip_gonio', 8, '24', ''),
      ('grootste_snelheid_lijn', 1, '5', ''),
      ('grootste_snelheid_lijn', 2, '13', ''),
      ('grootste_snelheid_lijn', 3, '17', ''),
      ('grootste_snelheid_lijn', 4, '25', ''),
      ('grootste_snelheid_lijn', 5, '29', ''),
      ('grootste_snelheid_lijn', 6, '20', ''),
      ('grootste_snelheid_lijn', 7, '30', ''),
      ('grootste_snelheid_lijn', 8, '39', ''),
      ('grootste_snelheid_vlak', 1, '4', ''),
      ('grootste_snelheid_vlak', 2, '12', ''),
      ('grootste_snelheid_vlak', 3, '15', ''),
      ('grootste_snelheid_vlak', 4, '24', ''),
      ('grootste_snelheid_vlak', 5, '21', ''),
      ('grootste_snelheid_vlak', 6, '16', ''),
      ('grootste_snelheid_vlak', 7, '45', ''),
      ('grootste_snelheid_vlak', 8, '36', '')

    ) AS verwacht(slug, volg, antwoord, voorvoegsel)
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.questions_new q
      JOIN public.topic_clusters_new c ON c.id = q.cluster_id
      JOIN public.topics_new t ON t.id = q.topic_id
      JOIN public.chapters h ON h.id = t.chapter_id
      WHERE h.slug = 'beweging'
        AND c.slug = verwacht.slug
        AND q.order_index = verwacht.volg
        AND q.answer = verwacht.antwoord
        AND coalesce(q.answer_prefix, '') = verwacht.voorvoegsel
    )
  ) THEN
    RAISE EXCEPTION 'Niet elke opgave van hoofdstuk Beweging heeft het verwachte antwoord';
  END IF;

END $$;

COMMIT;
