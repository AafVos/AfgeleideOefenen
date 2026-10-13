-- Hoofdstuk 15, paragraaf 15.2: raakproblemen.
-- Eigen varianten, geen boekopgaven. Elk antwoord is exact nageteld.
-- Drie soorten, elk 8 opgaven, van makkelijk naar moeilijk.
-- Antwoord is het kale getal. De tekst vóór het vak staat in answer_prefix.
-- Herhaalbaar: een tweede keer draaien voegt niets dubbel toe.

BEGIN;

INSERT INTO public.chapters (slug, title, book_part, order_index)
VALUES ('h15', 'Afgeleiden en primitieven', 4, 15)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.topics_new (slug, title, chapter_id, order_index, is_unlocked_by_default)
SELECT 'h15_raakproblemen', 'Hoeken en rakende grafieken', c.id, 2, false
FROM public.chapters c
WHERE c.slug = 'h15'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index)
SELECT t.id, v.slug, v.title, v.order_index
FROM public.topics_new t
JOIN (VALUES
  ('hoek_tussen_grafieken', 'Hoek tussen twee grafieken', 1::smallint),
  ('grafieken_raken', 'Grafieken die elkaar raken', 2::smallint),
  ('loodrecht_snijden', 'Loodrecht snijdende grafieken', 3::smallint)
) AS v(slug, title, order_index)
  ON true
WHERE t.slug = 'h15_raakproblemen'
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
    'hoek_tussen_grafieken', 1, 1,
    $vraag$Gegeven zijn $f(x) = \dfrac{1}{2}x^{2}$ en $g(x) = \dfrac{1}{2}$. De grafieken snijden elkaar in $A\left(1, \dfrac{1}{2}\right)$. Bereken de hoek in graden waaronder ze elkaar in $A$ snijden.$vraag$,
    '45', '45', '\text{hoek} =',
    ARRAY['45.0', '45,0', '45°', '45.0°', '45,0°', 'hoek=45', 'hoek=45.0', 'hoek=45,0', 'hoek=45°']::text[]
  ),
  (
    'hoek_tussen_grafieken', 2, 1,
    $vraag$Gegeven zijn $f(x) = \dfrac{\sqrt{3}}{2}x^{2}$ en $g(x) = \dfrac{\sqrt{3}}{2}$. De grafieken snijden elkaar in $A\left(1, \dfrac{\sqrt{3}}{2}\right)$. Bereken de hoek in graden waaronder ze elkaar in $A$ snijden.$vraag$,
    '60', '60', '\text{hoek} =',
    ARRAY['60.0', '60,0', '60°', '60.0°', '60,0°', 'hoek=60', 'hoek=60.0', 'hoek=60,0', 'hoek=60°']::text[]
  ),
  (
    'hoek_tussen_grafieken', 3, 1,
    $vraag$Gegeven zijn $f(x) = \dfrac{\sqrt{3}}{6}x^{2}$ en $g(x) = \dfrac{\sqrt{3}}{6}$. De grafieken snijden elkaar in $A\left(1, \dfrac{\sqrt{3}}{6}\right)$. Bereken de hoek in graden waaronder ze elkaar in $A$ snijden.$vraag$,
    '30', '30', '\text{hoek} =',
    ARRAY['30.0', '30,0', '30°', '30.0°', '30,0°', 'hoek=30', 'hoek=30.0', 'hoek=30,0', 'hoek=30°']::text[]
  ),
  (
    'hoek_tussen_grafieken', 4, 2,
    $vraag$Gegeven zijn $f(x) = \dfrac{1}{2}x^{2}$ en $g(x) = -x + \dfrac{3}{2}$. De grafieken snijden elkaar in $A\left(1, \dfrac{1}{2}\right)$. Bereken de hoek in graden waaronder ze elkaar in $A$ snijden.$vraag$,
    '90', '90', '\text{hoek} =',
    ARRAY['90.0', '90,0', '90°', '90.0°', '90,0°', 'hoek=90', 'hoek=90.0', 'hoek=90,0', 'hoek=90°']::text[]
  ),
  (
    'hoek_tussen_grafieken', 5, 2,
    $vraag$Gegeven zijn $f(x) = \dfrac{\sqrt{3}}{2}x^{2}$ en $g(x) = x - 1 + \dfrac{\sqrt{3}}{2}$. De grafieken snijden elkaar in $A\left(1, \dfrac{\sqrt{3}}{2}\right)$. Bereken de hoek in graden waaronder ze elkaar in $A$ snijden.$vraag$,
    '15', '15', '\text{hoek} =',
    ARRAY['15.0', '15,0', '15°', '15.0°', '15,0°', 'hoek=15', 'hoek=15.0', 'hoek=15,0', 'hoek=15°']::text[]
  ),
  (
    'hoek_tussen_grafieken', 6, 2,
    $vraag$Gegeven zijn $f(x) = x^{2}$ en $g(x) = x + 2$. De grafieken snijden elkaar in $A(2, 4)$. Bereken in graden, afgerond op één decimaal, de hoek waaronder ze elkaar in $A$ snijden.$vraag$,
    '31,0', '31{,}0', '\text{hoek} =',
    ARRAY['31.0', '31', '31,00', '31.00', '31°', '31,0°', '31.0°', 'hoek=31,0', 'hoek=31.0', 'hoek=31', 'hoek=31,0°', 'hoek=31.0°']::text[]
  ),
  (
    'hoek_tussen_grafieken', 7, 3,
    $vraag$Gegeven zijn $f(x) = \dfrac{1}{2}x^{2}$ en $g(x) = -2x + \dfrac{5}{2}$. De grafieken snijden elkaar in $A\left(1, \dfrac{1}{2}\right)$. Bereken in graden, afgerond op één decimaal, de hoek waaronder ze elkaar in $A$ snijden.$vraag$,
    '71,6', '71{,}6', '\text{hoek} =',
    ARRAY['71.6', '71,60', '71.60', '71,6°', '71.6°', 'hoek=71,6', 'hoek=71.6', 'hoek=71,6°', 'hoek=71.6°']::text[]
  ),
  (
    'hoek_tussen_grafieken', 8, 3,
    $vraag$Gegeven zijn $f(x) = e^{x}$ en $g(x) = 2x + 1$. De grafieken snijden elkaar in $A(0, 1)$. Bereken in graden, afgerond op één decimaal, de hoek waaronder ze elkaar in $A$ snijden.$vraag$,
    '18,4', '18{,}4', '\text{hoek} =',
    ARRAY['18.4', '18,40', '18.40', '18,4°', '18.4°', 'hoek=18,4', 'hoek=18.4', 'hoek=18,4°', 'hoek=18.4°']::text[]
  ),
  (
    'grafieken_raken', 1, 1,
    $vraag$De grafieken van $f(x) = x^{2}$ en $g(x) = 6x - 9$ raken elkaar. Bereken de $x$ van het raakpunt.$vraag$,
    '3', '3', 'x =',
    ARRAY['x=3']::text[]
  ),
  (
    'grafieken_raken', 2, 1,
    $vraag$De grafieken van $f(x) = x^{2}$ en $g(x) = -4x - 4$ raken elkaar. Bereken de $x$ van het raakpunt.$vraag$,
    '-2', '-2', 'x =',
    ARRAY['(-2)', 'x=-2', 'x=(-2)']::text[]
  ),
  (
    'grafieken_raken', 3, 1,
    $vraag$Bereken $p$ exact zodat de grafieken van $f(x) = x^{2}$ en $g(x) = 8x + p$ elkaar raken.$vraag$,
    '-16', '-16', 'p =',
    ARRAY['(-16)', 'p=-16', 'p=(-16)']::text[]
  ),
  (
    'grafieken_raken', 4, 2,
    $vraag$Bereken $p$ exact zodat de grafieken van $f(x) = x^{2} + p$ en $g(x) = 10x$ elkaar raken.$vraag$,
    '25', '25', 'p =',
    ARRAY['p=25']::text[]
  ),
  (
    'grafieken_raken', 5, 2,
    $vraag$Bereken $p$ exact zodat de grafieken van $f(x) = e^{x}$ en $g(x) = x + p$ elkaar raken.$vraag$,
    '1', '1', 'p =',
    ARRAY['p=1']::text[]
  ),
  (
    'grafieken_raken', 6, 2,
    $vraag$Bereken $p$ exact zodat de grafieken van $f(x) = \ln(x)$ en $g(x) = x + p$ elkaar raken.$vraag$,
    '-1', '-1', 'p =',
    ARRAY['(-1)', 'p=-1', 'p=(-1)']::text[]
  ),
  (
    'grafieken_raken', 7, 3,
    $vraag$Bereken $p$ exact zodat de grafieken van $f(x) = \ln(x)$ en $g(x) = 2x + p$ elkaar raken.$vraag$,
    '-1-ln(2)', '-1 - \ln(2)', 'p =',
    ARRAY['-1-ln2', '-(1+ln(2))', '-(1+ln2)', '-(ln(2)+1)', '-(ln2+1)', 'p=-1-ln(2)', 'p=-1-ln2', 'p=-(1+ln(2))', 'p=-(1+ln2)', 'p=-(ln(2)+1)', 'p=-(ln2+1)']::text[]
  ),
  (
    'grafieken_raken', 8, 3,
    $vraag$Bereken $p$ exact zodat de grafieken van $f(x) = x^{3} - 3x$ en $g(x) = 6x + p$ elkaar raken in een punt met positieve $x$.$vraag$,
    '-6sqrt(3)', '-6\sqrt{3}', 'p =',
    ARRAY['-6sqrt3', '-6√3', '-(6sqrt(3))', '-(6√3)', 'p=-6sqrt(3)', 'p=-6sqrt3', 'p=-6√3', 'p=-(6sqrt(3))']::text[]
  ),
  (
    'loodrecht_snijden', 1, 1,
    $vraag$Bereken $p$ exact zodat de grafieken van $f(x) = x^{2}$ en $g(x) = -\dfrac{1}{2}x + p$ elkaar loodrecht snijden.$vraag$,
    '3/2', '\dfrac{3}{2}', 'p =',
    ARRAY['(3)/(2)', '(3)/2', '1.5', '1,5', 'p=3/2', 'p=(3)/(2)', 'p=(3)/2', 'p=1.5', 'p=1,5']::text[]
  ),
  (
    'loodrecht_snijden', 2, 1,
    $vraag$Bereken $p$ exact zodat de grafieken van $f(x) = \dfrac{1}{2}x^{2}$ en $g(x) = -2x + p$ elkaar loodrecht snijden.$vraag$,
    '9/8', '\dfrac{9}{8}', 'p =',
    ARRAY['(9)/(8)', '(9)/8', '1.125', '1,125', 'p=9/8', 'p=(9)/(8)', 'p=(9)/8', 'p=1.125', 'p=1,125']::text[]
  ),
  (
    'loodrecht_snijden', 3, 2,
    $vraag$Bereken $p$ exact zodat de grafieken van $f(x) = e^{x}$ en $g(x) = -x + p$ elkaar loodrecht snijden.$vraag$,
    '1', '1', 'p =',
    ARRAY['p=1']::text[]
  ),
  (
    'loodrecht_snijden', 4, 2,
    $vraag$Bereken $p$ exact zodat de grafieken van $f(x) = \sqrt{x}$ en $g(x) = -2x + p$ elkaar loodrecht snijden. Neem $x > 0$.$vraag$,
    '3', '3', 'p =',
    ARRAY['p=3']::text[]
  ),
  (
    'loodrecht_snijden', 5, 2,
    $vraag$Bereken $p$ exact zodat de grafieken van $f(x) = x^{2} + x$ en $g(x) = -\dfrac{1}{3}x + p$ elkaar loodrecht snijden.$vraag$,
    '7/3', '\dfrac{7}{3}', 'p =',
    ARRAY['(7)/(3)', '(7)/3', 'p=7/3', 'p=(7)/(3)', 'p=(7)/3']::text[]
  ),
  (
    'loodrecht_snijden', 6, 3,
    $vraag$Bereken $p$ exact zodat de grafieken van $f(x) = \ln(x)$ en $g(x) = -2x + p$ elkaar loodrecht snijden.$vraag$,
    '4+ln(2)', '4 + \ln(2)', 'p =',
    ARRAY['4+ln2', 'ln(2)+4', 'ln2+4', 'p=4+ln(2)', 'p=4+ln2', 'p=ln(2)+4', 'p=ln2+4']::text[]
  ),
  (
    'loodrecht_snijden', 7, 3,
    $vraag$Bereken $p$ exact zodat de grafieken van $f(x) = \ln(2x)$ en $g(x) = -x + p$ elkaar loodrecht snijden.$vraag$,
    '1+ln(2)', '1 + \ln(2)', 'p =',
    ARRAY['1+ln2', 'ln(2)+1', 'ln2+1', 'p=1+ln(2)', 'p=1+ln2', 'p=ln(2)+1', 'p=ln2+1']::text[]
  ),
  (
    'loodrecht_snijden', 8, 3,
    $vraag$Bereken $p$ exact zodat de grafieken van $f(x) = e^{x}$ en $g(x) = -2x + p$ elkaar loodrecht snijden.$vraag$,
    '1/2-2ln(2)', '\dfrac{1}{2} - 2\ln(2)', 'p =',
    ARRAY['1/2-2ln2', '(1)/2-2ln(2)', '(1)/(2)-2ln(2)', '(1)/2-2ln2', '(1)/(2)-2ln2', '0.5-2ln(2)', '0,5-2ln(2)', '0.5-2ln2', '0,5-2ln2', '-2ln(2)+1/2', '-2ln2+1/2', '-2ln(2)+0.5', '-2ln(2)+0,5', '-2ln2+(1)/2', '-2ln(2)+(1)/2', '-2ln(2)+(1)/(2)', 'p=1/2-2ln(2)', 'p=1/2-2ln2', 'p=(1)/(2)-2ln(2)', 'p=(1)/2-2ln(2)', 'p=0.5-2ln(2)', 'p=0,5-2ln(2)', 'p=-2ln(2)+1/2', 'p=-2ln(2)+0,5', 'p=-2ln(2)+0.5']::text[]
  )
) AS v(cluster_slug, order_index, difficulty, latex_body, answer, latex_answer, answer_prefix, alternatives)
JOIN public.topics_new t
  ON t.slug = 'h15_raakproblemen'
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
  ('hoek_tussen_grafieken', 1, 0, $stap$De hoek tussen de grafieken in $A$ is de hoek tussen de raaklijnen. Bereken beide hellingen en de richtingshoeken, en neem het verschil. Is dat groter dan $90^{\circ}$, dan is de hoek $180^{\circ}$ min dat verschil.$stap$),
  ('hoek_tussen_grafieken', 1, 1, $stap$$f'(x) = x$, dus in $A$ is de helling $f'(1) = 1$. De grafiek van $g$ is horizontaal, dus die helling is $0$.$stap$),
  ('hoek_tussen_grafieken', 1, 2, $stap$$\tan(\alpha) = 1$ geeft $\alpha = 45^{\circ}$. $\tan(\beta) = 0$ geeft $\beta = 0^{\circ}$. Zet je rekenmachine op graden.$stap$),
  ('hoek_tussen_grafieken', 1, 3, $stap$Het verschil is $45^{\circ} - 0^{\circ} = 45^{\circ}$. Dat is niet groter dan $90^{\circ}$, dus de hoek is $45^{\circ}$.$stap$),
  ('hoek_tussen_grafieken', 2, 0, $stap$De hoek tussen de grafieken in $A$ is de hoek tussen de raaklijnen. Bereken beide hellingen en de richtingshoeken, en neem het verschil. Is dat groter dan $90^{\circ}$, dan is de hoek $180^{\circ}$ min dat verschil.$stap$),
  ('hoek_tussen_grafieken', 2, 1, $stap$$f'(x) = \sqrt{3}\, x$, dus in $A$ is de helling $f'(1) = \sqrt{3}$. De grafiek van $g$ is horizontaal, dus die helling is $0$.$stap$),
  ('hoek_tussen_grafieken', 2, 2, $stap$$\tan(\alpha) = \sqrt{3}$ geeft $\alpha = 60^{\circ}$. $\tan(\beta) = 0$ geeft $\beta = 0^{\circ}$.$stap$),
  ('hoek_tussen_grafieken', 2, 3, $stap$Het verschil is $60^{\circ}$. Dat is niet groter dan $90^{\circ}$, dus de hoek is $60^{\circ}$.$stap$),
  ('hoek_tussen_grafieken', 3, 0, $stap$De hoek tussen de grafieken in $A$ is de hoek tussen de raaklijnen. Bereken beide hellingen en de richtingshoeken, en neem het verschil. Is dat groter dan $90^{\circ}$, dan is de hoek $180^{\circ}$ min dat verschil.$stap$),
  ('hoek_tussen_grafieken', 3, 1, $stap$$f'(x) = \dfrac{\sqrt{3}}{3}x$, dus in $A$ is de helling $\dfrac{\sqrt{3}}{3} = \dfrac{1}{\sqrt{3}}$. De grafiek van $g$ is horizontaal, dus die helling is $0$.$stap$),
  ('hoek_tussen_grafieken', 3, 2, $stap$$\tan(\alpha) = \dfrac{1}{\sqrt{3}}$ geeft $\alpha = 30^{\circ}$. $\tan(\beta) = 0$ geeft $\beta = 0^{\circ}$.$stap$),
  ('hoek_tussen_grafieken', 3, 3, $stap$Het verschil is $30^{\circ}$. Dat is niet groter dan $90^{\circ}$, dus de hoek is $30^{\circ}$.$stap$),
  ('hoek_tussen_grafieken', 4, 0, $stap$De hoek tussen de grafieken in $A$ is de hoek tussen de raaklijnen. Bereken beide hellingen en de richtingshoeken, en neem het verschil. Is dat groter dan $90^{\circ}$, dan is de hoek $180^{\circ}$ min dat verschil.$stap$),
  ('hoek_tussen_grafieken', 4, 1, $stap$$f'(x) = x$, dus in $A$ is de helling $1$. $g'(x) = -1$.$stap$),
  ('hoek_tussen_grafieken', 4, 2, $stap$$\tan(\alpha) = 1$ geeft $\alpha = 45^{\circ}$. $\tan(\beta) = -1$ geeft $\beta = -45^{\circ}$.$stap$),
  ('hoek_tussen_grafieken', 4, 3, $stap$Het verschil is $45^{\circ} - (-45^{\circ}) = 90^{\circ}$. Dat is niet groter dan $90^{\circ}$, dus de hoek is $90^{\circ}$.$stap$),
  ('hoek_tussen_grafieken', 5, 0, $stap$De hoek tussen de grafieken in $A$ is de hoek tussen de raaklijnen. Bereken beide hellingen en de richtingshoeken, en neem het verschil. Is dat groter dan $90^{\circ}$, dan is de hoek $180^{\circ}$ min dat verschil.$stap$),
  ('hoek_tussen_grafieken', 5, 1, $stap$$f'(x) = \sqrt{3}\, x$, dus in $A$ is de helling $\sqrt{3}$. $g'(x) = 1$.$stap$),
  ('hoek_tussen_grafieken', 5, 2, $stap$$\tan(\alpha) = \sqrt{3}$ geeft $\alpha = 60^{\circ}$. $\tan(\beta) = 1$ geeft $\beta = 45^{\circ}$.$stap$),
  ('hoek_tussen_grafieken', 5, 3, $stap$Het verschil is $60^{\circ} - 45^{\circ} = 15^{\circ}$. Dat is niet groter dan $90^{\circ}$, dus de hoek is $15^{\circ}$.$stap$),
  ('hoek_tussen_grafieken', 6, 0, $stap$De hoek tussen de grafieken in $A$ is de hoek tussen de raaklijnen. Bereken beide hellingen en de richtingshoeken, en neem het verschil. Is dat groter dan $90^{\circ}$, dan is de hoek $180^{\circ}$ min dat verschil. Rond af op één decimaal.$stap$),
  ('hoek_tussen_grafieken', 6, 1, $stap$$f'(x) = 2x$, dus in $A$ is de helling $f'(2) = 4$. $g'(x) = 1$.$stap$),
  ('hoek_tussen_grafieken', 6, 2, $stap$$\tan(\alpha) = 4$ geeft $\alpha \approx 75{,}96^{\circ}$. $\tan(\beta) = 1$ geeft $\beta = 45^{\circ}$.$stap$),
  ('hoek_tussen_grafieken', 6, 3, $stap$Het verschil is $75{,}96^{\circ} - 45^{\circ} = 30{,}96^{\circ}$. Dat is niet groter dan $90^{\circ}$. Afgerond op één decimaal is de hoek $31{,}0^{\circ}$.$stap$),
  ('hoek_tussen_grafieken', 7, 0, $stap$De hoek tussen de grafieken in $A$ is de hoek tussen de raaklijnen. Bereken beide hellingen en de richtingshoeken, en neem het verschil. Is dat groter dan $90^{\circ}$, dan is de hoek $180^{\circ}$ min dat verschil. Rond af op één decimaal.$stap$),
  ('hoek_tussen_grafieken', 7, 1, $stap$$f'(x) = x$, dus in $A$ is de helling $1$. $g'(x) = -2$.$stap$),
  ('hoek_tussen_grafieken', 7, 2, $stap$$\tan(\alpha) = 1$ geeft $\alpha = 45^{\circ}$. $\tan(\beta) = -2$ geeft $\beta \approx -63{,}43^{\circ}$.$stap$),
  ('hoek_tussen_grafieken', 7, 3, $stap$Het verschil is $45^{\circ} - (-63{,}43^{\circ}) = 108{,}43^{\circ}$. Dat is groter dan $90^{\circ}$, dus de hoek is $180^{\circ} - 108{,}43^{\circ} = 71{,}57^{\circ}$. Afgerond op één decimaal: $71{,}6^{\circ}$.$stap$),
  ('hoek_tussen_grafieken', 8, 0, $stap$De hoek tussen de grafieken in $A$ is de hoek tussen de raaklijnen. Bereken beide hellingen en de richtingshoeken, en neem het verschil. Is dat groter dan $90^{\circ}$, dan is de hoek $180^{\circ}$ min dat verschil. Rond af op één decimaal.$stap$),
  ('hoek_tussen_grafieken', 8, 1, $stap$$f'(x) = e^{x}$, dus in $A$ is de helling $f'(0) = 1$. $g'(x) = 2$.$stap$),
  ('hoek_tussen_grafieken', 8, 2, $stap$$\tan(\alpha) = 1$ geeft $\alpha = 45^{\circ}$. $\tan(\beta) = 2$ geeft $\beta \approx 63{,}43^{\circ}$.$stap$),
  ('hoek_tussen_grafieken', 8, 3, $stap$Het verschil is $63{,}43^{\circ} - 45^{\circ} = 18{,}43^{\circ}$. Dat is niet groter dan $90^{\circ}$. Afgerond op één decimaal is de hoek $18{,}4^{\circ}$.$stap$),
  ('grafieken_raken', 1, 0, $stap$De grafieken raken elkaar als ze elkaar snijden en daar dezelfde helling hebben: $f(x) = g(x)$ en $f'(x) = g'(x)$.$stap$),
  ('grafieken_raken', 1, 1, $stap$$f'(x) = 2x$ en $g'(x) = 6$. Stel $2x = 6$, dus $x = 3$.$stap$),
  ('grafieken_raken', 1, 2, $stap$$f(3) = 9$ en $g(3) = 18 - 9 = 9$. De grafieken komen daar samen.$stap$),
  ('grafieken_raken', 1, 3, $stap$De hellingen zijn allebei $6$ en de $y$-waarden allebei $9$. Het raakpunt heeft $x = 3$.$stap$),
  ('grafieken_raken', 2, 0, $stap$De grafieken raken elkaar als ze elkaar snijden en daar dezelfde helling hebben: $f(x) = g(x)$ en $f'(x) = g'(x)$.$stap$),
  ('grafieken_raken', 2, 1, $stap$$f'(x) = 2x$ en $g'(x) = -4$. Stel $2x = -4$, dus $x = -2$.$stap$),
  ('grafieken_raken', 2, 2, $stap$$f(-2) = 4$ en $g(-2) = 8 - 4 = 4$. De grafieken komen daar samen.$stap$),
  ('grafieken_raken', 2, 3, $stap$De hellingen zijn allebei $-4$ en de $y$-waarden allebei $4$. Het raakpunt heeft $x = -2$.$stap$),
  ('grafieken_raken', 3, 0, $stap$De grafieken raken elkaar als $f(x) = g(x)$ en $f'(x) = g'(x)$. Eerst de hellingen gelijkstellen, dan $p$ uitrekenen.$stap$),
  ('grafieken_raken', 3, 1, $stap$$f'(x) = 2x$ en $g'(x) = 8$. Stel $2x = 8$, dus $x = 4$.$stap$),
  ('grafieken_raken', 3, 2, $stap$$f(4) = 16$ en $g(4) = 32 + p$. Stel $16 = 32 + p$.$stap$),
  ('grafieken_raken', 3, 3, $stap$Dan is $p = -16$. Controle: beide hellingen zijn $8$ en beide $y$-waarden zijn $16$.$stap$),
  ('grafieken_raken', 4, 0, $stap$De grafieken raken elkaar als $f(x) = g(x)$ en $f'(x) = g'(x)$. Eerst de hellingen gelijkstellen, dan $p$ uitrekenen.$stap$),
  ('grafieken_raken', 4, 1, $stap$$f'(x) = 2x$ en $g'(x) = 10$. Stel $2x = 10$, dus $x = 5$.$stap$),
  ('grafieken_raken', 4, 2, $stap$$f(5) = 25 + p$ en $g(5) = 50$. Stel $25 + p = 50$.$stap$),
  ('grafieken_raken', 4, 3, $stap$Dan is $p = 25$. Controle: beide hellingen zijn $10$ en beide $y$-waarden zijn $50$.$stap$),
  ('grafieken_raken', 5, 0, $stap$De grafieken raken elkaar als $f(x) = g(x)$ en $f'(x) = g'(x)$. Eerst de hellingen gelijkstellen, dan $p$ uitrekenen.$stap$),
  ('grafieken_raken', 5, 1, $stap$$f'(x) = e^{x}$ en $g'(x) = 1$. Stel $e^{x} = 1$, dus $x = 0$.$stap$),
  ('grafieken_raken', 5, 2, $stap$$f(0) = 1$ en $g(0) = p$. Stel $1 = p$.$stap$),
  ('grafieken_raken', 5, 3, $stap$Dan is $p = 1$. Controle: in $(0, 1)$ zijn beide hellingen $1$.$stap$),
  ('grafieken_raken', 6, 0, $stap$De grafieken raken elkaar als $f(x) = g(x)$ en $f'(x) = g'(x)$. Eerst de hellingen gelijkstellen, dan $p$ uitrekenen.$stap$),
  ('grafieken_raken', 6, 1, $stap$$f'(x) = \dfrac{1}{x}$ en $g'(x) = 1$. Stel $\dfrac{1}{x} = 1$, dus $x = 1$.$stap$),
  ('grafieken_raken', 6, 2, $stap$$f(1) = \ln(1) = 0$ en $g(1) = 1 + p$. Stel $0 = 1 + p$.$stap$),
  ('grafieken_raken', 6, 3, $stap$Dan is $p = -1$. Controle: in $(1, 0)$ zijn beide hellingen $1$.$stap$),
  ('grafieken_raken', 7, 0, $stap$De grafieken raken elkaar als $f(x) = g(x)$ en $f'(x) = g'(x)$. Eerst de hellingen gelijkstellen, dan $p$ uitrekenen.$stap$),
  ('grafieken_raken', 7, 1, $stap$$f'(x) = \dfrac{1}{x}$ en $g'(x) = 2$. Stel $\dfrac{1}{x} = 2$, dus $x = \dfrac{1}{2}$.$stap$),
  ('grafieken_raken', 7, 2, $stap$$f\left(\dfrac{1}{2}\right) = \ln\left(\dfrac{1}{2}\right) = -\ln(2)$ en $g\left(\dfrac{1}{2}\right) = 1 + p$. Stel $-\ln(2) = 1 + p$.$stap$),
  ('grafieken_raken', 7, 3, $stap$Dan is $p = -1 - \ln(2)$. Controle: beide hellingen zijn $2$ en beide $y$-waarden zijn $-\ln(2)$.$stap$),
  ('grafieken_raken', 8, 0, $stap$De grafieken raken elkaar als $f(x) = g(x)$ en $f'(x) = g'(x)$. De hellingen gelijkstellen geeft twee $x$-waarden. Je neemt de positieve.$stap$),
  ('grafieken_raken', 8, 1, $stap$$f'(x) = 3x^{2} - 3$ en $g'(x) = 6$. Stel $3x^{2} - 3 = 6$, dus $x^{2} = 3$. De positieve oplossing is $x = \sqrt{3}$.$stap$),
  ('grafieken_raken', 8, 2, $stap$$f(\sqrt{3}) = (\sqrt{3})^{3} - 3\sqrt{3} = 3\sqrt{3} - 3\sqrt{3} = 0$. En $g(\sqrt{3}) = 6\sqrt{3} + p$.$stap$),
  ('grafieken_raken', 8, 3, $stap$Stel $0 = 6\sqrt{3} + p$, dus $p = -6\sqrt{3}$. Controle: beide hellingen zijn $6$ en beide $y$-waarden zijn $0$.$stap$),
  ('loodrecht_snijden', 1, 0, $stap$De grafieken snijden elkaar loodrecht als $f(x) = g(x)$ en $f'(x) \cdot g'(x) = -1$. Eerst de hellingen, dan $p$.$stap$),
  ('loodrecht_snijden', 1, 1, $stap$$f'(x) = 2x$ en $g'(x) = -\dfrac{1}{2}$. Stel $2x \cdot \left(-\dfrac{1}{2}\right) = -1$, dus $-x = -1$ en $x = 1$.$stap$),
  ('loodrecht_snijden', 1, 2, $stap$$f(1) = 1$ en $g(1) = -\dfrac{1}{2} + p$. Stel $1 = -\dfrac{1}{2} + p$.$stap$),
  ('loodrecht_snijden', 1, 3, $stap$Dan is $p = \dfrac{3}{2}$. Controle: de hellingen zijn $2$ en $-\dfrac{1}{2}$, en $2 \cdot \left(-\dfrac{1}{2}\right) = -1$.$stap$),
  ('loodrecht_snijden', 2, 0, $stap$De grafieken snijden elkaar loodrecht als $f(x) = g(x)$ en $f'(x) \cdot g'(x) = -1$. Eerst de hellingen, dan $p$.$stap$),
  ('loodrecht_snijden', 2, 1, $stap$$f'(x) = x$ en $g'(x) = -2$. Stel $x \cdot (-2) = -1$, dus $x = \dfrac{1}{2}$.$stap$),
  ('loodrecht_snijden', 2, 2, $stap$$f\left(\dfrac{1}{2}\right) = \dfrac{1}{8}$ en $g\left(\dfrac{1}{2}\right) = -1 + p$. Stel $\dfrac{1}{8} = -1 + p$.$stap$),
  ('loodrecht_snijden', 2, 3, $stap$Dan is $p = \dfrac{9}{8}$. Controle: de hellingen zijn $\dfrac{1}{2}$ en $-2$, en hun product is $-1$.$stap$),
  ('loodrecht_snijden', 3, 0, $stap$De grafieken snijden elkaar loodrecht als $f(x) = g(x)$ en $f'(x) \cdot g'(x) = -1$. Eerst de hellingen, dan $p$.$stap$),
  ('loodrecht_snijden', 3, 1, $stap$$f'(x) = e^{x}$ en $g'(x) = -1$. Stel $e^{x} \cdot (-1) = -1$, dus $e^{x} = 1$ en $x = 0$.$stap$),
  ('loodrecht_snijden', 3, 2, $stap$$f(0) = 1$ en $g(0) = p$. Stel $1 = p$.$stap$),
  ('loodrecht_snijden', 3, 3, $stap$Dan is $p = 1$. Controle: in $(0, 1)$ zijn de hellingen $1$ en $-1$, en hun product is $-1$.$stap$),
  ('loodrecht_snijden', 4, 0, $stap$De grafieken snijden elkaar loodrecht als $f(x) = g(x)$ en $f'(x) \cdot g'(x) = -1$. Eerst de hellingen, dan $p$. Neem $x > 0$.$stap$),
  ('loodrecht_snijden', 4, 1, $stap$$f'(x) = \dfrac{1}{2\sqrt{x}}$ en $g'(x) = -2$. Het product is $-\dfrac{1}{\sqrt{x}}$. Stel dat gelijk aan $-1$, dus $\sqrt{x} = 1$ en $x = 1$.$stap$),
  ('loodrecht_snijden', 4, 2, $stap$$f(1) = 1$ en $g(1) = -2 + p$. Stel $1 = -2 + p$.$stap$),
  ('loodrecht_snijden', 4, 3, $stap$Dan is $p = 3$. Controle: de hellingen zijn $\dfrac{1}{2}$ en $-2$, en hun product is $-1$.$stap$),
  ('loodrecht_snijden', 5, 0, $stap$De grafieken snijden elkaar loodrecht als $f(x) = g(x)$ en $f'(x) \cdot g'(x) = -1$. Eerst de hellingen, dan $p$.$stap$),
  ('loodrecht_snijden', 5, 1, $stap$$f'(x) = 2x + 1$ en $g'(x) = -\dfrac{1}{3}$. Stel $(2x + 1) \cdot \left(-\dfrac{1}{3}\right) = -1$, dus $2x + 1 = 3$ en $x = 1$.$stap$),
  ('loodrecht_snijden', 5, 2, $stap$$f(1) = 2$ en $g(1) = -\dfrac{1}{3} + p$. Stel $2 = -\dfrac{1}{3} + p$.$stap$),
  ('loodrecht_snijden', 5, 3, $stap$Dan is $p = \dfrac{7}{3}$. Controle: de hellingen zijn $3$ en $-\dfrac{1}{3}$, en hun product is $-1$.$stap$),
  ('loodrecht_snijden', 6, 0, $stap$De grafieken snijden elkaar loodrecht als $f(x) = g(x)$ en $f'(x) \cdot g'(x) = -1$. Eerst de hellingen, dan $p$.$stap$),
  ('loodrecht_snijden', 6, 1, $stap$$f'(x) = \dfrac{1}{x}$ en $g'(x) = -2$. Stel $-\dfrac{2}{x} = -1$, dus $x = 2$.$stap$),
  ('loodrecht_snijden', 6, 2, $stap$$f(2) = \ln(2)$ en $g(2) = -4 + p$. Stel $\ln(2) = -4 + p$.$stap$),
  ('loodrecht_snijden', 6, 3, $stap$Dan is $p = 4 + \ln(2)$. Controle: de hellingen zijn $\dfrac{1}{2}$ en $-2$, en hun product is $-1$.$stap$),
  ('loodrecht_snijden', 7, 0, $stap$De grafieken snijden elkaar loodrecht als $f(x) = g(x)$ en $f'(x) \cdot g'(x) = -1$. Eerst de hellingen, dan $p$.$stap$),
  ('loodrecht_snijden', 7, 1, $stap$Met de kettingregel is $f'(x) = \dfrac{1}{2x} \cdot 2 = \dfrac{1}{x}$. En $g'(x) = -1$. Stel $-\dfrac{1}{x} = -1$, dus $x = 1$.$stap$),
  ('loodrecht_snijden', 7, 2, $stap$$f(1) = \ln(2)$ en $g(1) = -1 + p$. Stel $\ln(2) = -1 + p$.$stap$),
  ('loodrecht_snijden', 7, 3, $stap$Dan is $p = 1 + \ln(2)$. Controle: de hellingen zijn $1$ en $-1$, en hun product is $-1$.$stap$),
  ('loodrecht_snijden', 8, 0, $stap$De grafieken snijden elkaar loodrecht als $f(x) = g(x)$ en $f'(x) \cdot g'(x) = -1$. Eerst de hellingen, dan $p$.$stap$),
  ('loodrecht_snijden', 8, 1, $stap$$f'(x) = e^{x}$ en $g'(x) = -2$. Stel $e^{x} \cdot (-2) = -1$, dus $e^{x} = \dfrac{1}{2}$ en $x = -\ln(2)$.$stap$),
  ('loodrecht_snijden', 8, 2, $stap$$f(-\ln(2)) = \dfrac{1}{2}$ en $g(-\ln(2)) = 2\ln(2) + p$. Stel $\dfrac{1}{2} = 2\ln(2) + p$.$stap$),
  ('loodrecht_snijden', 8, 3, $stap$Dan is $p = \dfrac{1}{2} - 2\ln(2)$. Controle: de hellingen zijn $\dfrac{1}{2}$ en $-2$, en hun product is $-1$.$stap$)
) AS v(cluster_slug, q_order_index, step_order, step_description)
JOIN public.topics_new t
  ON t.slug = 'h15_raakproblemen'
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
  WHERE t.slug = 'h15_raakproblemen';

  SELECT count(*) INTO n_vragen
  FROM public.questions_new q
  JOIN public.topics_new t ON t.id = q.topic_id
  WHERE t.slug = 'h15_raakproblemen';

  SELECT count(*) INTO n_stappen
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  JOIN public.topics_new t ON t.id = q.topic_id
  WHERE t.slug = 'h15_raakproblemen';

  IF n_soorten <> 3 OR n_vragen <> 24 OR n_stappen <> 96 THEN
    RAISE EXCEPTION 'Hoofdstuk 15.2 klopt niet: % soorten, % opgaven, % stappen', n_soorten, n_vragen, n_stappen;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM (VALUES
      ('hoek_tussen_grafieken', 1, '45'),
      ('hoek_tussen_grafieken', 2, '60'),
      ('hoek_tussen_grafieken', 3, '30'),
      ('hoek_tussen_grafieken', 4, '90'),
      ('hoek_tussen_grafieken', 5, '15'),
      ('hoek_tussen_grafieken', 6, '31,0'),
      ('hoek_tussen_grafieken', 7, '71,6'),
      ('hoek_tussen_grafieken', 8, '18,4'),
      ('grafieken_raken', 1, '3'),
      ('grafieken_raken', 2, '-2'),
      ('grafieken_raken', 3, '-16'),
      ('grafieken_raken', 4, '25'),
      ('grafieken_raken', 5, '1'),
      ('grafieken_raken', 6, '-1'),
      ('grafieken_raken', 7, '-1-ln(2)'),
      ('grafieken_raken', 8, '-6sqrt(3)'),
      ('loodrecht_snijden', 1, '3/2'),
      ('loodrecht_snijden', 2, '9/8'),
      ('loodrecht_snijden', 3, '1'),
      ('loodrecht_snijden', 4, '3'),
      ('loodrecht_snijden', 5, '7/3'),
      ('loodrecht_snijden', 6, '4+ln(2)'),
      ('loodrecht_snijden', 7, '1+ln(2)'),
      ('loodrecht_snijden', 8, '1/2-2ln(2)')
    ) AS verwacht(slug, volg, antwoord)
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.questions_new q
      JOIN public.topic_clusters_new c ON c.id = q.cluster_id
      JOIN public.topics_new t ON t.id = q.topic_id
      WHERE t.slug = 'h15_raakproblemen'
        AND c.slug = verwacht.slug
        AND q.order_index = verwacht.volg
        AND q.answer = verwacht.antwoord
        AND q.answer_prefix IS NOT NULL
    )
  ) THEN
    RAISE EXCEPTION 'Niet elke opgave van hoofdstuk 15.2 heeft het verwachte antwoord';
  END IF;
END $$;

COMMIT;
