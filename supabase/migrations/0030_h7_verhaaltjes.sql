-- Verhaaltjes achteraan goniometrie differentiëren (hoofdstuk 7).
-- Eén soort, 8 opgaven. De helft: snelheid op een tijdstip.
-- De andere helft: wanneer de eerste top is, of hoe groot die top is.
-- Alleen sinus of cosinus, eventueel met een lineaire kern. Geen tangens.
-- Antwoord is het kale getal. Bij een tijdstip staat t = in answer_prefix.
-- Bij een snelheid of een hoogte blijft dat veld leeg.
-- Herhaalbaar: een tweede keer draaien voegt niets dubbel toe.

BEGIN;

INSERT INTO public.topic_clusters_new (site, topic_id, slug, title, order_index)
SELECT 'afgeleiden', t.id, 'sinus_in_een_verhaal', 'Sinus in een verhaal', 8::smallint
FROM public.topics_new t
WHERE t.site = 'afgeleiden'
  AND t.slug = 'h7_goniometrie_diff'
ON CONFLICT (topic_id, slug) DO NOTHING;

-- Kernniveau: difficulty 1. De functie staat in de zin.
INSERT INTO public.questions_new (
  site, topic_id, cluster_id, latex_body, answer, latex_answer,
  difficulty, is_ai_generated, order_index, answer_alternatives, answer_prefix
)
SELECT
  'afgeleiden', t.id, c.id, v.latex_body, v.answer, v.latex_answer,
  1, false, v.order_index, v.alternatives, v.answer_prefix
FROM (VALUES
  -- 1 t/m 4: snelheid op een tijdstip. Voorvoegsel leeg.
  (
    1,
    $vraag$Je volgt het water in een haven. De hoogte in meter na $t$ uur is $h = 3 + \sin(2t)$, met $t \geq 0$. Hoe groot is de snelheid op $t = 0$, in meter per uur?$vraag$,
    '2', '2', NULL::text, ARRAY[]::text[]
  ),
  (
    2,
    $vraag$Je volgt een boei. De hoogte in meter na $t$ seconden is $h = 4 + 3\cos(t)$, met $t \geq 0$. Hoe groot is de snelheid op $t = \dfrac{\pi}{2}$, in meter per seconde? Daalt de boei, dan is je antwoord negatief.$vraag$,
    '-3', '-3', NULL::text, ARRAY[]::text[]
  ),
  (
    3,
    $vraag$Je meet het water in een bak. De temperatuur in graden Celsius na $t$ minuten is $T = 20 + 6\sin(t)$, met $t \geq 0$. Hoe groot is de stijgsnelheid op $t = \dfrac{\pi}{3}$, in graden per minuut?$vraag$,
    '3', '3', NULL::text, ARRAY[]::text[]
  ),
  (
    4,
    $vraag$Je volgt een ponton. De hoogte in meter na $t$ minuten is $h = 5 + 2\cos(2t)$, met $t \geq 0$. Hoe groot is de snelheid op $t = \dfrac{\pi}{4}$, in meter per minuut? Daalt het ponton, dan is je antwoord negatief.$vraag$,
    '-4', '-4', NULL::text, ARRAY[]::text[]
  ),
  -- 5 en 7: wanneer de eerste top is. Voorvoegsel t =.
  (
    5,
    $vraag$Je volgt het getij. De hoogte in meter na $t$ uur is $h = 4 + \sin(4t)$, met $t \geq 0$. Op welk tijdstip is het water voor het eerst het hoogst?$vraag$,
    'pi/8', '\dfrac{\pi}{8}', 't =',
    ARRAY['(pi)/(8)', '(1/8)pi', '1/8pi']::text[]
  ),
  -- 6 en 8: hoe groot is die hoogste waarde. Voorvoegsel leeg.
  (
    6,
    $vraag$Je volgt een golftank. De hoogte in meter na $t$ seconden is $h = 5 + 2\sin(t)$, met $t \geq 0$. Hoe groot is de grootste hoogte, in meter?$vraag$,
    '7', '7', NULL::text, ARRAY[]::text[]
  ),
  (
    7,
    $vraag$Je volgt het water in een sluis. De hoogte in meter na $t$ minuten is $h = 3 + \sin(t)$, met $t \geq 0$. Op welk tijdstip staat het water voor het eerst het hoogst?$vraag$,
    'pi/2', '\dfrac{\pi}{2}', 't =',
    ARRAY['(pi)/(2)', '(1/2)pi', '1/2pi']::text[]
  ),
  (
    8,
    $vraag$Je stapt in een reuzenrad. De hoogte in meter na $t$ minuten is $h = 10 + 3\cos(2t)$, met $t \geq 0$. Hoe groot is de grootste hoogte, in meter?$vraag$,
    '13', '13', NULL::text, ARRAY[]::text[]
  )
) AS v(order_index, latex_body, answer, latex_answer, answer_prefix, alternatives)
JOIN public.topics_new t
  ON t.site = 'afgeleiden' AND t.slug = 'h7_goniometrie_diff'
JOIN public.topic_clusters_new c
  ON c.site = 'afgeleiden' AND c.topic_id = t.id AND c.slug = 'sinus_in_een_verhaal'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.questions_new q
  WHERE q.cluster_id = c.id
    AND q.order_index = v.order_index
);

INSERT INTO public.question_steps_new (question_id, step_order, step_description)
SELECT q.id, v.step_order, v.step_description
FROM (VALUES
  -- Snelheid 2 op t = 0. h' = 2 cos(2t).
  ('sinus_in_een_verhaal', 1, 0, $stap$De hoogte is $h(t) = 3 + \sin(2t)$. De snelheid is de afgeleide $h'(t)$. Je zoekt die op $t = 0$.$stap$),
  ('sinus_in_een_verhaal', 1, 1, $stap$Kettingregel: de afgeleide van $\sin(2t)$ is $\cos(2t) \cdot 2$. De $3$ valt weg. Dus $h'(t) = 2\cos(2t)$.$stap$),
  ('sinus_in_een_verhaal', 1, 2, $stap$Vul het tijdstip in: $h'(0) = 2\cos(0) = 2 \cdot 1 = 2$.$stap$),
  ('sinus_in_een_verhaal', 1, 3, $stap$De snelheid op $t = 0$ is $2$ meter per uur. Het getal is positief, dus het water stijgt.$stap$),
  -- Snelheid -3 op t = pi/2. h' = -3 sin(t).
  ('sinus_in_een_verhaal', 2, 0, $stap$De hoogte is $h(t) = 4 + 3\cos(t)$. De snelheid is $h'(t)$. Je zoekt die op $t = \dfrac{\pi}{2}$.$stap$),
  ('sinus_in_een_verhaal', 2, 1, $stap$De afgeleide van $\cos(t)$ is $-\sin(t)$. Dus $h'(t) = -3\sin(t)$.$stap$),
  ('sinus_in_een_verhaal', 2, 2, $stap$Vul het tijdstip in: $h'\!\left(\dfrac{\pi}{2}\right) = -3\sin\!\left(\dfrac{\pi}{2}\right) = -3 \cdot 1 = -3$.$stap$),
  ('sinus_in_een_verhaal', 2, 3, $stap$De snelheid is $-3$ meter per seconde. Een negatief getal betekent dat de boei daalt.$stap$),
  -- Stijgsnelheid 3 op t = pi/3. T' = 6 cos(t), cos(pi/3) = 1/2.
  ('sinus_in_een_verhaal', 3, 0, $stap$De temperatuur is $T(t) = 20 + 6\sin(t)$. De stijgsnelheid is $T'(t)$. Je zoekt die op $t = \dfrac{\pi}{3}$.$stap$),
  ('sinus_in_een_verhaal', 3, 1, $stap$De afgeleide van $\sin(t)$ is $\cos(t)$. De $20$ valt weg. Dus $T'(t) = 6\cos(t)$.$stap$),
  ('sinus_in_een_verhaal', 3, 2, $stap$Vul het tijdstip in. $\cos\!\left(\dfrac{\pi}{3}\right) = \dfrac{1}{2}$, dus $T'\!\left(\dfrac{\pi}{3}\right) = 6 \cdot \dfrac{1}{2} = 3$.$stap$),
  ('sinus_in_een_verhaal', 3, 3, $stap$De stijgsnelheid is $3$ graden per minuut.$stap$),
  -- Snelheid -4 op t = pi/4. h' = -4 sin(2t).
  ('sinus_in_een_verhaal', 4, 0, $stap$De hoogte is $h(t) = 5 + 2\cos(2t)$. De snelheid is $h'(t)$. Je zoekt die op $t = \dfrac{\pi}{4}$.$stap$),
  ('sinus_in_een_verhaal', 4, 1, $stap$Kettingregel: de afgeleide van $\cos(2t)$ is $-\sin(2t) \cdot 2$. Dus $h'(t) = 2 \cdot (-2\sin(2t)) = -4\sin(2t)$.$stap$),
  ('sinus_in_een_verhaal', 4, 2, $stap$Vul het tijdstip in: $2t = \dfrac{\pi}{2}$, en $\sin\!\left(\dfrac{\pi}{2}\right) = 1$. Dus $h'\!\left(\dfrac{\pi}{4}\right) = -4 \cdot 1 = -4$.$stap$),
  ('sinus_in_een_verhaal', 4, 3, $stap$De snelheid is $-4$ meter per minuut. Een negatief getal betekent dat het ponton daalt.$stap$),
  -- Eerste top bij t = pi/8. h = 4 + sin(4t), h' = 4 cos(4t).
  ('sinus_in_een_verhaal', 5, 0, $stap$De hoogte is $h(t) = 4 + \sin(4t)$, met $t \geq 0$. Je zoekt het eerste tijdstip waar het water het hoogst staat. Dat is de eerste top, waar $h'(t) = 0$ en de hoogte daarna daalt.$stap$),
  ('sinus_in_een_verhaal', 5, 1, $stap$Kettingregel: $h'(t) = 4\cos(4t)$.$stap$),
  ('sinus_in_een_verhaal', 5, 2, $stap$Stel de afgeleide nul: $4\cos(4t) = 0$, dus $\cos(4t) = 0$. De sinus is het grootst als de hoek $\dfrac{\pi}{2}$ is, dus $4t = \dfrac{\pi}{2}$. Dan is $t = \dfrac{\pi}{8}$.$stap$),
  ('sinus_in_een_verhaal', 5, 3, $stap$Controle: $h(0) = 4$ en $h\!\left(\dfrac{\pi}{4}\right) = 4$. Allebei lager dan $h\!\left(\dfrac{\pi}{8}\right) = 5$. Net voor $t = \dfrac{\pi}{8}$ stijgt het water, net erna daalt het. Het water is voor het eerst het hoogst bij $t = \dfrac{\pi}{8}$.$stap$),
  -- Grootste hoogte 7. Top bij t = pi/2.
  ('sinus_in_een_verhaal', 6, 0, $stap$De hoogte is $h(t) = 5 + 2\sin(t)$, met $t \geq 0$. Je zoekt de grootste hoogte. Eerst de eerste top, waar $h'(t) = 0$.$stap$),
  ('sinus_in_een_verhaal', 6, 1, $stap$Differentieer: $h'(t) = 2\cos(t)$.$stap$),
  ('sinus_in_een_verhaal', 6, 2, $stap$Stel de afgeleide nul: $2\cos(t) = 0$, dus $\cos(t) = 0$. De eerste top voor $t \geq 0$ is $t = \dfrac{\pi}{2}$, want daar gaat de cosinus van positief naar negatief.$stap$),
  ('sinus_in_een_verhaal', 6, 3, $stap$Vul in: $h\!\left(\dfrac{\pi}{2}\right) = 5 + 2\sin\!\left(\dfrac{\pi}{2}\right) = 5 + 2 \cdot 1 = 7$.$stap$),
  ('sinus_in_een_verhaal', 6, 4, $stap$Controle: $h(0) = 5$ en $h(\pi) = 5$. Allebei lager dan $7$. De grootste hoogte is $7$ meter.$stap$),
  -- Eerste top bij t = pi/2. h = 3 + sin(t).
  ('sinus_in_een_verhaal', 7, 0, $stap$De hoogte is $h(t) = 3 + \sin(t)$, met $t \geq 0$. Je zoekt het eerste tijdstip waar het water het hoogst staat, dus de eerste top.$stap$),
  ('sinus_in_een_verhaal', 7, 1, $stap$Differentieer: $h'(t) = \cos(t)$.$stap$),
  ('sinus_in_een_verhaal', 7, 2, $stap$Stel de afgeleide nul: $\cos(t) = 0$. De eerste oplossing met $t \geq 0$ waar de hoogte daarna daalt is $t = \dfrac{\pi}{2}$. Op $t = \dfrac{3\pi}{2}$ staat het water juist het laagst.$stap$),
  ('sinus_in_een_verhaal', 7, 3, $stap$Controle: $h(0) = 3$ en $h(\pi) = 3$. Allebei lager dan $h\!\left(\dfrac{\pi}{2}\right) = 4$. Het water staat voor het eerst het hoogst bij $t = \dfrac{\pi}{2}$.$stap$),
  -- Grootste hoogte 13. Top bij t = 0. h = 10 + 3 cos(2t).
  ('sinus_in_een_verhaal', 8, 0, $stap$De hoogte is $h(t) = 10 + 3\cos(2t)$, met $t \geq 0$. Je zoekt de grootste hoogte. Eerst waar $h'(t) = 0$.$stap$),
  ('sinus_in_een_verhaal', 8, 1, $stap$Kettingregel: de afgeleide van $\cos(2t)$ is $-\sin(2t) \cdot 2$. Dus $h'(t) = -6\sin(2t)$.$stap$),
  ('sinus_in_een_verhaal', 8, 2, $stap$Stel de afgeleide nul: $-6\sin(2t) = 0$, dus $\sin(2t) = 0$. De eerste oplossing met $t \geq 0$ is $t = 0$. Dan is $\cos(0) = 1$, de grootste waarde van de cosinus.$stap$),
  ('sinus_in_een_verhaal', 8, 3, $stap$Vul in: $h(0) = 10 + 3 \cdot 1 = 13$.$stap$),
  ('sinus_in_een_verhaal', 8, 4, $stap$Controle: $h\!\left(\dfrac{\pi}{4}\right) = 10$ en $h\!\left(\dfrac{\pi}{2}\right) = 7$. Allebei lager dan $13$. Later komt de hoogte weer op $13$, maar niet hoger. De grootste hoogte is $13$ meter.$stap$)
) AS v(cluster_slug, q_order_index, step_order, step_description)
JOIN public.topics_new t
  ON t.site = 'afgeleiden' AND t.slug = 'h7_goniometrie_diff'
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
  n_opgaven int;
  n_voorvoegsel int;
  n_leeg int;
  n_zonder_stap0 int;
  n_toon_aan int;
  n_tangens int;
  n_snelheid int;
  n_hoogst int;
  n_grootste int;
  laatste_oud smallint;
  nieuw smallint;
BEGIN
  SELECT max(c.order_index) INTO laatste_oud
  FROM public.topic_clusters_new c
  JOIN public.topics_new t ON t.id = c.topic_id
  WHERE t.site = 'afgeleiden'
    AND t.slug = 'h7_goniometrie_diff'
    AND c.slug <> 'sinus_in_een_verhaal';

  SELECT c.order_index INTO nieuw
  FROM public.topic_clusters_new c
  JOIN public.topics_new t ON t.id = c.topic_id
  WHERE t.site = 'afgeleiden'
    AND t.slug = 'h7_goniometrie_diff'
    AND c.slug = 'sinus_in_een_verhaal';

  IF laatste_oud IS NULL OR nieuw IS NULL OR nieuw <= laatste_oud THEN
    RAISE EXCEPTION 'soort staat niet achteraan goniometrie differentiëren';
  END IF;

  SELECT count(*),
         count(*) FILTER (WHERE q.answer_prefix = 't ='),
         count(*) FILTER (WHERE q.answer_prefix IS NULL),
         count(*) FILTER (WHERE q.latex_body ILIKE '%snelheid%'),
         count(*) FILTER (WHERE q.latex_body ILIKE '%hoogst%'),
         count(*) FILTER (WHERE q.latex_body ILIKE '%grootste%')
    INTO n_opgaven, n_voorvoegsel, n_leeg, n_snelheid, n_hoogst, n_grootste
  FROM public.questions_new q
  JOIN public.topic_clusters_new c ON c.id = q.cluster_id
  JOIN public.topics_new t ON t.id = q.topic_id
  WHERE t.site = 'afgeleiden'
    AND t.slug = 'h7_goniometrie_diff'
    AND c.slug = 'sinus_in_een_verhaal';

  SELECT count(*) INTO n_zonder_stap0
  FROM public.questions_new q
  JOIN public.topic_clusters_new c ON c.id = q.cluster_id
  JOIN public.topics_new t ON t.id = q.topic_id
  WHERE t.site = 'afgeleiden'
    AND t.slug = 'h7_goniometrie_diff'
    AND c.slug = 'sinus_in_een_verhaal'
    AND NOT EXISTS (
      SELECT 1 FROM public.question_steps_new s
      WHERE s.question_id = q.id AND s.step_order = 0
    );

  SELECT count(*) INTO n_toon_aan
  FROM public.questions_new q
  JOIN public.topic_clusters_new c ON c.id = q.cluster_id
  JOIN public.topics_new t ON t.id = q.topic_id
  WHERE t.site = 'afgeleiden'
    AND t.slug = 'h7_goniometrie_diff'
    AND c.slug = 'sinus_in_een_verhaal'
    AND (q.latex_body ILIKE '%toon aan%' OR q.latex_body ILIKE '%tangens%'
         OR strpos(q.latex_body, '\tan') > 0);

  n_tangens := n_toon_aan;

  IF n_opgaven <> 8 OR n_voorvoegsel <> 2 OR n_leeg <> 6
     OR n_snelheid <> 4 OR n_hoogst <> 2 OR n_grootste <> 2
     OR n_zonder_stap0 <> 0 OR n_tangens <> 0 THEN
    RAISE EXCEPTION
      'soort klopt niet: opgaven %, met t = %, leeg %, snelheid %, hoogst %, grootste %, zonder stap 0 %, tangens of toon aan %',
      n_opgaven, n_voorvoegsel, n_leeg, n_snelheid, n_hoogst, n_grootste, n_zonder_stap0, n_tangens;
  END IF;
END $$;

COMMIT;
