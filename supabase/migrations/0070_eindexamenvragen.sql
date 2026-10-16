-- Nieuw hoofdstuk na H16: echte vragen uit het centraal examen vwo wiskunde B.
-- De bron (jaar, tijdvak, vraagnummer en link) staat in eigen kolommen,
-- niet in de vraagtekst. Het onderwerp in H16 heet Examenstijl, zodat
-- het niet hetzelfde heet als dit hoofdstuk.
--
-- Eerste serie: vragen met een berekenbaar eindantwoord, zonder plaatje
-- dat je nodig hebt om de vraag te begrijpen. Bewijs-vragen en integralen
-- zitten er niet in. Tekst letterlijk uit het examen, antwoord uit het
-- correctievoorschrift. Twee keer draaien voegt niets dubbel toe.

ALTER TABLE public.questions_new
  ADD COLUMN IF NOT EXISTS source_label text,
  ADD COLUMN IF NOT EXISTS source_url text;

COMMENT ON COLUMN public.questions_new.source_label IS
  'Bronregel bij een echte examenvraag, bijvoorbeeld CE vwo wiskunde B 2024 · tijdvak 1 · vraag 6. Leeg bij een eigen opgave.';

COMMENT ON COLUMN public.questions_new.source_url IS
  'Link naar het opgavenblad op examenblad.nl. Leeg bij een eigen opgave.';

UPDATE public.topics_new
SET title = 'Examenstijl'
WHERE slug = 'h16_examentraining'
  AND title IS DISTINCT FROM 'Examenstijl';

INSERT INTO public.chapters (slug, title, book_part, order_index)
VALUES ('examen', 'Eindexamenvragen', 4, 17)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.topics_new (slug, title, chapter_id, order_index, is_unlocked_by_default)
SELECT 'examen_vragen', 'Eindexamenvragen', c.id, 1, false
FROM public.chapters c
WHERE c.slug = 'examen'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index)
SELECT t.id, v.slug, v.title, v.order_index
FROM public.topics_new t
JOIN (VALUES
  ('raaklijn', 'Raaklijn', 1::smallint),
  ('buigpunt_en_buigraaklijn', 'Buigpunt', 2::smallint),
  ('snijpunten_afgeleide', 'Snijpunten met de afgeleide', 3::smallint)
) AS v(slug, title, order_index)
  ON true
WHERE t.slug = 'examen_vragen'
ON CONFLICT (topic_id, slug) DO NOTHING;

INSERT INTO public.questions_new (
  topic_id, cluster_id, latex_body, answer, latex_answer,
  difficulty, is_ai_generated, order_index, answer_alternatives, answer_prefix,
  source_label, source_url
)
SELECT
  t.id, c.id, v.latex_body, v.answer, v.latex_answer,
  v.difficulty, false, v.order_index, v.alternatives, v.answer_prefix,
  v.source_label, v.source_url
FROM (VALUES
  (
    'raaklijn', 1, 3,
    $vraag$De functie $f$ wordt gegeven door $f(x) = (3x - 7)^{2}$.

De grafiek van $f$ wordt naar rechts en omhoog verschoven. Hierdoor ontstaat de grafiek van de functie $g$.

De grafiek van $g$ gaat door het punt $A(5, 40)$. De helling van de raaklijn in $A$ aan de grafiek van $g$ is $-6$.

Stel op exacte wijze een functievoorschrift van $g$ op.$vraag$,
    '(3(x-3)-7)^2+39',
    '(3(x-3)-7)^{2}+39',
    'g(x) =',
    ARRAY[
      '(3x-16)^2+39',
      '9x^2-96x+295',
      '9*x^2-96*x+295',
      '(3(x-3)-7)^2+39'
    ]::text[],
    'CE vwo wiskunde B 2024 · tijdvak 1 · vraag 6',
    'https://www.examenblad.nl/2024/vwo/documenten/cse-1/vw-1025-a-24-1-o'
  ),
  (
    'raaklijn', 2, 3,
    $vraag$De kwadratische functie $f$ wordt gegeven door $f(x) = ax^{2} + bx + c$.

De grafiek van $f$ snijdt de $y$-as in het punt $S(0, 2)$.

De raaklijn aan de grafiek van $f$ in punt $S$ snijdt de $x$-as in het punt $\left(\dfrac{2}{3}\sqrt{3},\, 0\right)$.

Verder is gegeven dat de grafiek van $f$ een dalparabool is die de positieve $x$-as raakt.

Bereken exact de waarden van $a$, $b$ en $c$.$vraag$,
    'a=(3)/(8), b=-sqrt(3), c=2',
    'a=\dfrac{3}{8},\; b=-\sqrt{3},\; c=2',
    NULL::text,
    ARRAY[
      'a=3/8, b=-sqrt(3), c=2',
      'a=(3)/8, b=-sqrt(3), c=2',
      '(3)/(8), -sqrt(3), 2',
      '3/8, -sqrt(3), 2',
      'a=(3)/(8), b=-√3, c=2',
      'a=3/8, b=-√3, c=2'
    ]::text[],
    'CE vwo wiskunde B 2024 · tijdvak 2 · vraag 9',
    'https://www.examenblad.nl/2024/vwo/documenten/cse-2/vw-1025-a-24-2-o'
  ),
  (
    'buigpunt_en_buigraaklijn', 1, 3,
    $vraag$De vierdegraadsfunctie $f$ wordt gegeven door $f(x) = x^{4} - 30x^{2}$.

De grafiek van $f$ heeft twee buigpunten met dezelfde $y$-coördinaat.
De $y$-coördinaat van de buigpunten is $-125$.

De lijn door de buigpunten $B$ en $C$ snijdt de grafiek van $f$ in twee andere punten, $A$ en $D$.

Bereken exact de lengte van $AD$.$vraag$,
    '10',
    '10',
    NULL::text,
    '{}'::text[],
    'CE vwo wiskunde B 2025 · tijdvak 1 · vraag 2',
    'https://www.examenblad.nl/2025/vwo/documenten/cse-1/vw-1025-a-25-1-o'
  ),
  (
    'snijpunten_afgeleide', 1, 3,
    $vraag$De functies $f$ en $g$ worden gegeven door
$f(x) = x\ln(x) - x + 1$ en $g(x) = f'(x)$.

Bereken exact de $x$-coördinaten van de snijpunten van de grafieken van $f$ en $g$.$vraag$,
    '1 en e',
    '1 \text{ en } e',
    NULL::text,
    ARRAY[
      '1, e',
      '1 of e',
      'e en 1',
      'e, 1',
      'x=1 of x=e',
      'x=1 en x=e'
    ]::text[],
    'CE vwo wiskunde B 2019 · tijdvak 1 · vraag 8',
    'https://www.examenblad.nl/2019/vwo/documenten/cse-1/vw-1025-a-19-1-o'
  )
) AS v(
  cluster_slug, order_index, difficulty, latex_body, answer, latex_answer,
  answer_prefix, alternatives, source_label, source_url
)
JOIN public.topics_new t
  ON t.slug = 'examen_vragen'
JOIN public.topic_clusters_new c
  ON c.topic_id = t.id AND c.slug = v.cluster_slug
WHERE NOT EXISTS (
  SELECT 1
  FROM public.questions_new q
  WHERE q.source_label = v.source_label
);

INSERT INTO public.question_steps_new (question_id, step_order, step_description)
SELECT q.id, v.step_order, v.step_description
FROM (VALUES
  (
    'CE vwo wiskunde B 2024 · tijdvak 1 · vraag 6', 0,
    $stap$Schrijf $g(x) = (3(x - a) - 7)^{2} + b$.$stap$
  ),
  (
    'CE vwo wiskunde B 2024 · tijdvak 1 · vraag 6', 1,
    $stap$De afgeleide is $g'(x) = 6(3(x - a) - 7)$.$stap$
  ),
  (
    'CE vwo wiskunde B 2024 · tijdvak 1 · vraag 6', 2,
    $stap$De helling in $A$ is $-6$, dus $6(3(5 - a) - 7) = -6$. Dat geeft $a = 3$.$stap$
  ),
  (
    'CE vwo wiskunde B 2024 · tijdvak 1 · vraag 6', 3,
    $stap$Het punt $A$ ligt op de grafiek: $(3(5 - 3) - 7)^{2} + b = 40$, dus $1 + b = 40$.$stap$
  ),
  (
    'CE vwo wiskunde B 2024 · tijdvak 1 · vraag 6', 4,
    $stap$Dus $b = 39$ en $g(x) = (3(x - 3) - 7)^{2} + 39$.$stap$
  ),
  (
    'CE vwo wiskunde B 2024 · tijdvak 2 · vraag 9', 0,
    $stap$De grafiek snijdt de $y$-as in $(0, 2)$, dus $c = 2$.$stap$
  ),
  (
    'CE vwo wiskunde B 2024 · tijdvak 2 · vraag 9', 1,
    $stap$De afgeleide is $f'(x) = 2ax + b$. In $S$ is de helling $f'(0) = b$.$stap$
  ),
  (
    'CE vwo wiskunde B 2024 · tijdvak 2 · vraag 9', 2,
    $stap$De raaklijn gaat door $S(0, 2)$ en $\left(\dfrac{2}{3}\sqrt{3},\, 0\right)$. De helling is $\dfrac{0 - 2}{\dfrac{2}{3}\sqrt{3}} = -\sqrt{3}$. Dus $b = -\sqrt{3}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2024 · tijdvak 2 · vraag 9', 3,
    $stap$De grafiek raakt de $x$-as, dus de discriminant is $0$: $(-\sqrt{3})^{2} - 8a = 3 - 8a = 0$.$stap$
  ),
  (
    'CE vwo wiskunde B 2024 · tijdvak 2 · vraag 9', 4,
    $stap$Dus $a = \dfrac{3}{8}$. Samen: $a = \dfrac{3}{8}$, $b = -\sqrt{3}$ en $c = 2$.$stap$
  ),
  (
    'CE vwo wiskunde B 2025 · tijdvak 1 · vraag 2', 0,
    $stap$De buigpunten hebben dezelfde $y$-coördinaat $-125$. De lijn door $B$ en $C$ is dus $y = -125$.$stap$
  ),
  (
    'CE vwo wiskunde B 2025 · tijdvak 1 · vraag 2', 1,
    $stap$De andere snijpunten vind je met $x^{4} - 30x^{2} = -125$, dus $x^{4} - 30x^{2} + 125 = 0$.$stap$
  ),
  (
    'CE vwo wiskunde B 2025 · tijdvak 1 · vraag 2', 2,
    $stap$Met $u = x^{2}$ wordt dat $u^{2} - 30u + 125 = 0$. De oplossingen zijn $u = 5$ en $u = 25$.$stap$
  ),
  (
    'CE vwo wiskunde B 2025 · tijdvak 1 · vraag 2', 3,
    $stap$$x = \pm\sqrt{5}$ horen bij de buigpunten. De andere snijpunten zijn $x = -5$ en $x = 5$.$stap$
  ),
  (
    'CE vwo wiskunde B 2025 · tijdvak 1 · vraag 2', 4,
    $stap$De lengte van $AD$ is $5 - (-5) = 10$.$stap$
  ),
  (
    'CE vwo wiskunde B 2019 · tijdvak 1 · vraag 8', 0,
    $stap$De afgeleide: $f'(x) = \ln(x) + x \cdot \dfrac{1}{x} - 1 = \ln(x)$. Dus $g(x) = \ln(x)$.$stap$
  ),
  (
    'CE vwo wiskunde B 2019 · tijdvak 1 · vraag 8', 1,
    $stap$De snijpunten: $x\ln(x) - x + 1 = \ln(x)$.$stap$
  ),
  (
    'CE vwo wiskunde B 2019 · tijdvak 1 · vraag 8', 2,
    $stap$Dat wordt $(x - 1)\ln(x) - (x - 1) = 0$, dus $(x - 1)(\ln(x) - 1) = 0$.$stap$
  ),
  (
    'CE vwo wiskunde B 2019 · tijdvak 1 · vraag 8', 3,
    $stap$Dus $x = 1$ of $\ln(x) = 1$. De $x$-coördinaten zijn $1$ en $e$.$stap$
  )
) AS v(source_label, step_order, step_description)
JOIN public.questions_new q
  ON q.source_label = v.source_label
ON CONFLICT (question_id, step_order) DO NOTHING;

DO $$
DECLARE
  n_vragen int;
  n_stappen int;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.topics_new WHERE slug = 'h16_examentraining' AND title = 'Examenstijl'
  ) THEN
    RAISE EXCEPTION 'Het onderwerp in H16 heet nog niet Examenstijl';
  END IF;

  SELECT count(*) INTO n_vragen
  FROM public.questions_new
  WHERE source_label LIKE 'CE vwo wiskunde B %';

  SELECT count(*) INTO n_stappen
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  WHERE q.source_label LIKE 'CE vwo wiskunde B %';

  IF n_vragen <> 4 OR n_stappen <> 19 THEN
    RAISE EXCEPTION 'Eindexamenvragen kloppen niet: % opgaven, % stappen', n_vragen, n_stappen;
  END IF;
END $$;
