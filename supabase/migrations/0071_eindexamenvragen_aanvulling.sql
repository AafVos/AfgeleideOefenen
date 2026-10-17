-- Vervolg op 0070: nog berekenvragen uit vwo wiskunde B, tijdvak 1 en 2,
-- 2018 tot en met 2025. Alleen vragen waarbij je differentieert en een
-- berekenbaar eindantwoord krijgt. Bewijs, toon aan, integralen en
-- vragen die een plaatje nodig hebben zitten er niet in.
-- 2020 heeft geen centraal examen op examenblad.nl.
-- Tekst uit het examen, antwoord uit het correctievoorschrift.
-- Twee keer draaien voegt niets dubbel toe.

INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index)
SELECT t.id, v.slug, v.title, v.order_index
FROM public.topics_new t
JOIN (VALUES
  ('extreme_waarde', 'Extreme waarde', 4::smallint),
  ('snelheid', 'Snelheid', 5::smallint),
  ('helling', 'Helling', 6::smallint)
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
    'snelheid', 1, 3,
    $vraag$De beweging van een punt $P$ wordt gegeven door
$x(t) = 1 - t^{2}$ en $y(t) = (1 + t)^{2}$.

De baan van $P$ snijdt de $y$-as in de oorsprong en in punt $A$.

Bereken exact de snelheid waarmee $P$ door punt $A$ gaat.$vraag$,
    '2*sqrt(5)',
    '2\sqrt{5}',
    NULL::text,
    ARRAY['2√5', '2*√5', 'sqrt(20)', '√20', '2sqrt(5)']::text[],
    'CE vwo wiskunde B 2018 · tijdvak 1 · vraag 1',
    'https://www.examenblad.nl/2018/vwo/documenten/cse-1/vw-1025-a-18-1-o'
  ),
  (
    'extreme_waarde', 1, 3,
    $vraag$De functie $f$ wordt gegeven door $f(x) = 6\sin(x) - \cos(2x)$.

De grafiek van $f$ heeft oneindig veel toppen.

Bereken exact de $x$-coördinaten van alle toppen van de grafiek van $f$. Neem $k$ een geheel getal.$vraag$,
    '1/2 pi + k*pi',
    '\dfrac{1}{2}\pi + k\pi',
    'x =',
    ARRAY[
      'pi/2 + k*pi',
      'pi/2 + kpi',
      '1/2pi + k*pi',
      '(1/2)pi + k*pi',
      '0.5pi + k*pi',
      '0,5pi + k*pi',
      'x=pi/2 + k*pi',
      'pi/2+k*pi'
    ]::text[],
    'CE vwo wiskunde B 2018 · tijdvak 1 · vraag 8',
    'https://www.examenblad.nl/2018/vwo/documenten/cse-1/vw-1025-a-18-1-o'
  ),
  (
    'snelheid', 2, 3,
    $vraag$De beweging van een punt $P$ wordt beschreven door
$x(t) = \cos(2t) - \sin(2t)$ en $y(t) = \sin(2t) - \sin(t)$,
met $0 \leq t \leq 2\pi$.

Op de tijdstippen $t = 0$ en $t = \pi$ bevindt $P$ zich in hetzelfde punt.

Bereken algebraïsch de hoek in graden tussen de snelheidsvector op $t = 0$ en de snelheidsvector op $t = \pi$. Geef je eindantwoord in één decimaal.$vraag$,
    '29,7',
    '29{,}7',
    NULL::text,
    ARRAY['29.7', '29,7 graden', '29.7 graden']::text[],
    'CE vwo wiskunde B 2019 · tijdvak 2 · vraag 3',
    'https://www.examenblad.nl/2019/vwo/documenten/cse-2/vw-1025-a-19-2-o'
  ),
  (
    'raaklijn', 3, 3,
    $vraag$De functie $f$ wordt gegeven door
$f(x) = \left|x - 2\right| \cdot \left(\dfrac{1}{2}x + 2\right) + 1$.

De grafiek van $f$ heeft een knik in het punt $A$. De lijn $l$ is de raaklijn in $A$ aan het linkerdeel van de grafiek.

Stel op exacte wijze een vergelijking van lijn $l$ op.$vraag$,
    '-3x+7',
    '-3x+7',
    'y =',
    ARRAY['y=-3x+7', '7-3x', '-3*x+7']::text[],
    'CE vwo wiskunde B 2019 · tijdvak 2 · vraag 4',
    'https://www.examenblad.nl/2019/vwo/documenten/cse-2/vw-1025-a-19-2-o'
  ),
  (
    'extreme_waarde', 5, 3,
    $vraag$De functie $f$ is voor $x > 0$ gegeven door $f(x) = \mathrm{e}^{1 - \dfrac{1}{x}}$.

De afgeleide is $f'(x) = \dfrac{1}{x^{2}} \cdot \mathrm{e}^{1 - \dfrac{1}{x}}$.

De raaklijn aan de grafiek van $f$ in een punt $P$ snijdt de $x$-as in een punt $S$. Er is een positie van $P$ waarvoor de $x$-coördinaat van $S$ maximaal is.

Bereken exact deze maximale waarde.$vraag$,
    '1/4',
    '\dfrac{1}{4}',
    NULL::text,
    ARRAY['(1)/(4)', '0.25', '0,25', '1/4']::text[],
    'CE vwo wiskunde B 2021 · tijdvak 2 · vraag 14',
    'https://www.examenblad.nl/2021/vwo/documenten/cse-2/vw-1025-a-21-2-o'
  ),
  (
    'raaklijn', 4, 3,
    $vraag$De functies $f_p$ en $g_p$ zijn voor $p \neq 0$ gegeven door
$f_p(x) = p\ln(x)$ en $g_p(x) = \mathrm{e}^{\dfrac{x}{p}}$.

Er is een waarde van $p$ waarbij de lijn $y = x$ de gemeenschappelijke raaklijn is van de grafieken van $f_p$ en $g_p$.

Bereken exact deze waarde van $p$.$vraag$,
    'e',
    'e',
    'p =',
    ARRAY['p=e']::text[],
    'CE vwo wiskunde B 2022 · tijdvak 1 · vraag 3',
    'https://www.examenblad.nl/2022/vwo/documenten/cse-1/vw-1025-a-22-1-o'
  ),
  (
    'buigpunt_en_buigraaklijn', 2, 3,
    $vraag$De functie $f$ is gegeven door $f(x) = 2(2x - 1)^{3} + 3(2x - 1)^{2}$.

De lijn $k$ raakt de grafiek van $f$ in het buigpunt.

Stel door middel van exacte berekeningen een vergelijking op van $k$.$vraag$,
    '-3x+(5)/(4)',
    '-3x+\dfrac{5}{4}',
    'y =',
    ARRAY['-3x+5/4', '-3x+1.25', '-3x+1,25', 'y=-3x+5/4', '(5)/(4)-3x']::text[],
    'CE vwo wiskunde B 2022 · tijdvak 2 · vraag 2',
    'https://www.examenblad.nl/2022/vwo/documenten/cse-2/vw-1025-a-22-2-o'
  ),
  (
    'extreme_waarde', 2, 3,
    $vraag$De functie $f$ wordt voor $x > 0$ gegeven door $f(x) = 2x + \dfrac{1}{x}$.

De functie $f$ heeft een minimum.

Bereken exact dit minimum.$vraag$,
    '2*sqrt(2)',
    '2\sqrt{2}',
    NULL::text,
    ARRAY['2√2', '2*√2', 'sqrt(8)', '√8', '2sqrt(2)']::text[],
    'CE vwo wiskunde B 2023 · tijdvak 1 · vraag 1',
    'https://www.examenblad.nl/2023/vwo/documenten/cse-1/vw-1025-a-23-1-o'
  ),
  (
    'extreme_waarde', 6, 3,
    $vraag$De kracht om een metalen plaat te buigen hangt af van de dikte en van de opening van de matrijs:
$F = \dfrac{R \cdot d^{2}}{V}\left(1 + \dfrac{4d}{V}\right)$.

Hierin is $d$ de dikte in mm en $V$ de breedte van de opening in mm. Verder geldt $V = d^{1{,}75}$.

Er is een plaatdikte $d$ waarbij de kracht $F$ minimaal is.

Bereken exact deze waarde van $d$.$vraag$,
    '16',
    '16',
    NULL::text,
    ARRAY['16 mm', 'd=16']::text[],
    'CE vwo wiskunde B 2023 · tijdvak 1 · vraag 6',
    'https://www.examenblad.nl/2023/vwo/documenten/cse-1/vw-1025-a-23-1-o'
  ),
  (
    'snelheid', 3, 3,
    $vraag$De beweging van punt $P$ wordt gegeven door $x_P(t) = 2t$ en $y_P(t) = 2t^{2}$.

De beweging van punt $Q$ wordt gegeven door $x_Q(t) = t + t^{2}$ en $y_Q(t) = t - t^{2}$.

De snelheid van $P$ is $\sqrt{4 + 16t^{2}}$. Die snelheid is een factor $c$ keer zo groot als de snelheid van $Q$, voor elke waarde van $t$.

Bereken exact de waarde van $c$.$vraag$,
    'sqrt(2)',
    '\sqrt{2}',
    'c =',
    ARRAY['√2', 'c=√2', 'c=sqrt(2)', '2^(1/2)']::text[],
    'CE vwo wiskunde B 2023 · tijdvak 1 · vraag 8',
    'https://www.examenblad.nl/2023/vwo/documenten/cse-1/vw-1025-a-23-1-o'
  ),
  (
    'helling', 1, 3,
    $vraag$Voor de lengte $L$ geldt $L(t) = \left|t\right| \cdot \sqrt{2t^{2} + 2}$.

De grafiek van $L$ heeft bij $t = 0$ een knik. De helling nadert niet van links en van rechts tot dezelfde waarde.

Bereken exact tot welke waarde de helling van de grafiek van $L$ nadert als $t$ vanaf links tot $0$ nadert.$vraag$,
    '-sqrt(2)',
    '-\sqrt{2}',
    NULL::text,
    ARRAY['-√2', '-2/sqrt(2)', '-2/√2']::text[],
    'CE vwo wiskunde B 2023 · tijdvak 1 · vraag 10',
    'https://www.examenblad.nl/2023/vwo/documenten/cse-1/vw-1025-a-23-1-o'
  ),
  (
    'raaklijn', 5, 3,
    $vraag$De functie $f$ wordt gegeven door $f(x) = \dfrac{x^{2} - 2x}{x - 3}$.

De lijn $l$ is de raaklijn aan de grafiek van $f$ in de oorsprong.

Bereken exact de richtingscoëfficiënt van $l$.$vraag$,
    '2/3',
    '\dfrac{2}{3}',
    NULL::text,
    ARRAY['(2)/(3)', '2/3']::text[],
    'CE vwo wiskunde B 2023 · tijdvak 2 · vraag 1',
    'https://www.examenblad.nl/2023/vwo/documenten/cse-2/vw-1025-a-23-2-o'
  ),
  (
    'extreme_waarde', 3, 3,
    $vraag$De functie $f$ wordt voor $x \geq -3$ gegeven door $f(x) = -3 + x\sqrt{x + 3}$.

De grafiek van $f$ heeft links van de $y$-as een top $T$.

Bereken exact de $x$-coördinaat van $T$.$vraag$,
    '-2',
    '-2',
    'x =',
    ARRAY['x=-2']::text[],
    'CE vwo wiskunde B 2023 · tijdvak 2 · vraag 12',
    'https://www.examenblad.nl/2023/vwo/documenten/cse-2/vw-1025-a-23-2-o'
  ),
  (
    'raaklijn', 6, 3,
    $vraag$Punt $P$ beweegt volgens
$x(t) = 4\cos(t) + \cos(4t)$ en $y(t) = 4\sin(t) + \sin(4t)$.

Op tijdstip $t = \dfrac{2}{3}\pi$ zit $P$ in het punt $\left(-\dfrac{5}{2},\, \dfrac{5}{2}\sqrt{3}\right)$.

Bereken exact de scherpe hoek in graden tussen de raaklijn aan de baan in $P$ en de $x$-as.$vraag$,
    '30',
    '30',
    NULL::text,
    ARRAY['30 graden', '30°']::text[],
    'CE vwo wiskunde B 2024 · tijdvak 1 · vraag 10',
    'https://www.examenblad.nl/2024/vwo/documenten/cse-1/vw-1025-a-24-1-o'
  ),
  (
    'raaklijn', 7, 3,
    $vraag$De kromme $K$ wordt gegeven door
$x(t) = \sin(t)\left(\cos(t) - 1\right)$ en $y(t) = \cos(t)$,
met $0 \leq t \leq 2\pi$.

In drie punten van deze kromme loopt de raaklijn verticaal.

Bereken exact de coördinaten van deze drie punten.$vraag$,
    '(0, 1), (-3/4 sqrt(3), -1/2) en (3/4 sqrt(3), -1/2)',
    '(0,\, 1),\ \left(-\dfrac{3}{4}\sqrt{3},\, -\dfrac{1}{2}\right)\ \text{en}\ \left(\dfrac{3}{4}\sqrt{3},\, -\dfrac{1}{2}\right)',
    NULL::text,
    ARRAY[
      '(0, 1), (3/4 sqrt(3), -1/2) en (-3/4 sqrt(3), -1/2)',
      '(0,1), (-3√3/4, -1/2) en (3√3/4, -1/2)',
      '(0, 1), (-3√3/4, -1/2), (3√3/4, -1/2)',
      '(0,1), (-(3/4)sqrt(3), -1/2) en ((3/4)sqrt(3), -1/2)'
    ]::text[],
    'CE vwo wiskunde B 2025 · tijdvak 1 · vraag 3',
    'https://www.examenblad.nl/2025/vwo/documenten/cse-1/vw-1025-a-25-1-o'
  ),
  (
    'extreme_waarde', 4, 3,
    $vraag$Voor $x \geq 0$ worden de functies $f$ en $g$ gegeven door
$f(x) = \sqrt{\dfrac{1}{2}x^{2} - 1}$ en $g(x) = \sqrt{2x^{2} + 2}$.

De lijn $y = -x + a$, met $a \geq 2$, snijdt de grafiek van $f$ in $P$ en de grafiek van $g$ in $Q$.

De lengte van $PQ$ is $PQ = 3\sqrt{2}\, a - 4\sqrt{a^{2} - 1}$.

Er is een waarde van $a$ waarvoor deze lengte minimaal is.

Bereken exact deze waarde van $a$.$vraag$,
    '3',
    '3',
    'a =',
    ARRAY['a=3']::text[],
    'CE vwo wiskunde B 2025 · tijdvak 1 · vraag 9',
    'https://www.examenblad.nl/2025/vwo/documenten/cse-1/vw-1025-a-25-1-o'
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
    'CE vwo wiskunde B 2018 · tijdvak 1 · vraag 1', 0,
    $stap$Op de $y$-as is $x = 0$, dus $1 - t^{2} = 0$. Dan is $t = 1$ of $t = -1$. Bij $t = -1$ is $y = 0$, dat is de oorsprong. Bij punt $A$ hoort $t = 1$.$stap$
  ),
  (
    'CE vwo wiskunde B 2018 · tijdvak 1 · vraag 1', 1,
    $stap$De afgeleiden zijn $x'(t) = -2t$ en $y'(t) = 2(1 + t)$.$stap$
  ),
  (
    'CE vwo wiskunde B 2018 · tijdvak 1 · vraag 1', 2,
    $stap$Op $t = 1$ is de snelheidsvector $(-2,\, 4)$.$stap$
  ),
  (
    'CE vwo wiskunde B 2018 · tijdvak 1 · vraag 1', 3,
    $stap$De snelheid is $\sqrt{(-2)^{2} + 4^{2}} = \sqrt{20} = 2\sqrt{5}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2018 · tijdvak 1 · vraag 8', 0,
    $stap$De afgeleide is $f'(x) = 6\cos(x) + 2\sin(2x)$.$stap$
  ),
  (
    'CE vwo wiskunde B 2018 · tijdvak 1 · vraag 8', 1,
    $stap$Met $\sin(2x) = 2\sin(x)\cos(x)$ wordt dat $f'(x) = 2\cos(x)\left(3 + 2\sin(x)\right)$.$stap$
  ),
  (
    'CE vwo wiskunde B 2018 · tijdvak 1 · vraag 8', 2,
    $stap$$3 + 2\sin(x) = 0$ geeft $\sin(x) = -\dfrac{3}{2}$. Dat kan niet.$stap$
  ),
  (
    'CE vwo wiskunde B 2018 · tijdvak 1 · vraag 8', 3,
    $stap$Dus $\cos(x) = 0$. De toppen liggen bij $x = \dfrac{1}{2}\pi + k\pi$.$stap$
  ),
  (
    'CE vwo wiskunde B 2019 · tijdvak 2 · vraag 3', 0,
    $stap$De afgeleiden: $x'(t) = -2\sin(2t) - 2\cos(2t)$ en $y'(t) = 2\cos(2t) - \cos(t)$.$stap$
  ),
  (
    'CE vwo wiskunde B 2019 · tijdvak 2 · vraag 3', 1,
    $stap$Op $t = 0$ is de snelheidsvector $(-2,\, 1)$. Op $t = \pi$ is die $(-2,\, 3)$.$stap$
  ),
  (
    'CE vwo wiskunde B 2019 · tijdvak 2 · vraag 3', 2,
    $stap$Het inproduct is $4 + 3 = 7$. De lengtes zijn $\sqrt{5}$ en $\sqrt{13}$. Dus $\cos(\varphi) = \dfrac{7}{\sqrt{65}}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2019 · tijdvak 2 · vraag 3', 3,
    $stap$De hoek is ongeveer $29{,}7$ graden.$stap$
  ),
  (
    'CE vwo wiskunde B 2019 · tijdvak 2 · vraag 4', 0,
    $stap$De knik zit bij $x = 2$. Links daarvan is $f(x) = -(x - 2)\left(\dfrac{1}{2}x + 2\right) + 1$.$stap$
  ),
  (
    'CE vwo wiskunde B 2019 · tijdvak 2 · vraag 4', 1,
    $stap$De afgeleide links is $f'(x) = -\left(\dfrac{1}{2}x + 2\right) - (x - 2)\cdot \dfrac{1}{2}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2019 · tijdvak 2 · vraag 4', 2,
    $stap$Als $x$ naar $2$ gaat, wordt de helling $-3$. In het knikpunt is $y = 1$.$stap$
  ),
  (
    'CE vwo wiskunde B 2019 · tijdvak 2 · vraag 4', 3,
    $stap$De raaklijn is $y = -3x + 7$.$stap$
  ),
  (
    'CE vwo wiskunde B 2021 · tijdvak 2 · vraag 14', 0,
    $stap$In het punt met $x = p$ is de helling $\dfrac{1}{p^{2}}\mathrm{e}^{1 - \dfrac{1}{p}}$ en de $y$-waarde $\mathrm{e}^{1 - \dfrac{1}{p}}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2021 · tijdvak 2 · vraag 14', 1,
    $stap$De raaklijn snijdt de $x$-as in $x_S = p - p^{2}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2021 · tijdvak 2 · vraag 14', 2,
    $stap$De afgeleide van $p - p^{2}$ is $1 - 2p$. Die is nul bij $p = \dfrac{1}{2}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2021 · tijdvak 2 · vraag 14', 3,
    $stap$De grootste $x$-coördinaat van $S$ is $\dfrac{1}{2} - \left(\dfrac{1}{2}\right)^{2} = \dfrac{1}{4}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2022 · tijdvak 1 · vraag 3', 0,
    $stap$De afgeleide van $f_p$ is $\dfrac{p}{x}$. Die is $1$ als $x = p$.$stap$
  ),
  (
    'CE vwo wiskunde B 2022 · tijdvak 1 · vraag 3', 1,
    $stap$Het raakpunt ligt op $y = x$, dus $p\ln(p) = p$. Daaruit volgt $\ln(p) = 1$, dus $p = e$.$stap$
  ),
  (
    'CE vwo wiskunde B 2022 · tijdvak 1 · vraag 3', 2,
    $stap$Controle bij $g_e$: $g_e(e) = e$ en de helling is $\dfrac{1}{e}\cdot e = 1$.$stap$
  ),
  (
    'CE vwo wiskunde B 2022 · tijdvak 1 · vraag 3', 3,
    $stap$Dus $p = e$.$stap$
  ),
  (
    'CE vwo wiskunde B 2022 · tijdvak 2 · vraag 2', 0,
    $stap$De afgeleide is $f'(x) = 48x^{2} - 24x$. De tweede afgeleide is $f''(x) = 96x - 24$.$stap$
  ),
  (
    'CE vwo wiskunde B 2022 · tijdvak 2 · vraag 2', 1,
    $stap$$f''(x) = 0$ geeft $x = \dfrac{1}{4}$. Daar wisselt $f''$ van teken, dus dat is het buigpunt.$stap$
  ),
  (
    'CE vwo wiskunde B 2022 · tijdvak 2 · vraag 2', 2,
    $stap$De helling is $f'\left(\dfrac{1}{4}\right) = -3$. De functiewaarde is $f\left(\dfrac{1}{4}\right) = \dfrac{1}{2}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2022 · tijdvak 2 · vraag 2', 3,
    $stap$De raaklijn is $y - \dfrac{1}{2} = -3\left(x - \dfrac{1}{4}\right)$, dus $y = -3x + \dfrac{5}{4}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2023 · tijdvak 1 · vraag 1', 0,
    $stap$De afgeleide is $f'(x) = 2 - \dfrac{1}{x^{2}}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2023 · tijdvak 1 · vraag 1', 1,
    $stap$$f'(x) = 0$ geeft $x^{2} = \dfrac{1}{2}$. Omdat $x > 0$ is $x = \dfrac{1}{2}\sqrt{2}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2023 · tijdvak 1 · vraag 1', 2,
    $stap$Het minimum is $f\left(\dfrac{1}{2}\sqrt{2}\right) = 2\sqrt{2}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2023 · tijdvak 1 · vraag 6', 0,
    $stap$Vul $V = d^{1{,}75}$ in. Dan wordt $F = R\, d^{0{,}25} + 4R\, d^{-0{,}5}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2023 · tijdvak 1 · vraag 6', 1,
    $stap$De afgeleide naar $d$ is $R\left(\dfrac{1}{4}d^{-\dfrac{3}{4}} - 2d^{-\dfrac{3}{2}}\right)$.$stap$
  ),
  (
    'CE vwo wiskunde B 2023 · tijdvak 1 · vraag 6', 2,
    $stap$Die is nul als $\dfrac{1}{4}d^{-\dfrac{3}{4}} = 2d^{-\dfrac{3}{2}}$, dus $d^{\dfrac{3}{4}} = 8$.$stap$
  ),
  (
    'CE vwo wiskunde B 2023 · tijdvak 1 · vraag 6', 3,
    $stap$Dus $d = 8^{\dfrac{4}{3}} = 16$.$stap$
  ),
  (
    'CE vwo wiskunde B 2023 · tijdvak 1 · vraag 8', 0,
    $stap$De snelheid van $Q$ is $\sqrt{(1 + 2t)^{2} + (1 - 2t)^{2}} = \sqrt{2 + 8t^{2}}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2023 · tijdvak 1 · vraag 8', 1,
    $stap$De snelheid van $P$ is $\sqrt{4 + 16t^{2}} = \sqrt{2}\cdot \sqrt{2 + 8t^{2}}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2023 · tijdvak 1 · vraag 8', 2,
    $stap$Dus $c = \sqrt{2}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2023 · tijdvak 1 · vraag 10', 0,
    $stap$Links van $0$ is $L(t) = -t\sqrt{2t^{2} + 2}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2023 · tijdvak 1 · vraag 10', 1,
    $stap$De afgeleide is $L'(t) = -\dfrac{4t^{2} + 2}{\sqrt{2t^{2} + 2}}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2023 · tijdvak 1 · vraag 10', 2,
    $stap$Als $t$ naar $0$ gaat, nadert de helling tot $-\dfrac{2}{\sqrt{2}} = -\sqrt{2}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2023 · tijdvak 2 · vraag 1', 0,
    $stap$Met de quotiëntregel is $f'(x) = \dfrac{(2x - 2)(x - 3) - (x^{2} - 2x)}{(x - 3)^{2}}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2023 · tijdvak 2 · vraag 1', 1,
    $stap$In de oorsprong is de teller $(-2)\cdot(-3) = 6$ en de noemer $9$.$stap$
  ),
  (
    'CE vwo wiskunde B 2023 · tijdvak 2 · vraag 1', 2,
    $stap$De richtingscoëfficiënt is $\dfrac{6}{9} = \dfrac{2}{3}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2023 · tijdvak 2 · vraag 12', 0,
    $stap$De afgeleide is $f'(x) = \sqrt{x + 3} + \dfrac{x}{2\sqrt{x + 3}} = \dfrac{3x + 6}{2\sqrt{x + 3}}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2023 · tijdvak 2 · vraag 12', 1,
    $stap$$f'(x) = 0$ geeft $x = -2$. Dat ligt links van de $y$-as en binnen het domein.$stap$
  ),
  (
    'CE vwo wiskunde B 2023 · tijdvak 2 · vraag 12', 2,
    $stap$Links van $-2$ daalt de grafiek en rechts ervan stijgt ze, dus $T$ heeft $x = -2$.$stap$
  ),
  (
    'CE vwo wiskunde B 2024 · tijdvak 1 · vraag 10', 0,
    $stap$De afgeleiden zijn $x'(t) = -4\sin(t) - 4\sin(4t)$ en $y'(t) = 4\cos(t) + 4\cos(4t)$.$stap$
  ),
  (
    'CE vwo wiskunde B 2024 · tijdvak 1 · vraag 10', 1,
    $stap$Op $t = \dfrac{2}{3}\pi$ is $x' = -4\sqrt{3}$ en $y' = -4$.$stap$
  ),
  (
    'CE vwo wiskunde B 2024 · tijdvak 1 · vraag 10', 2,
    $stap$De helling van de raaklijn is $\dfrac{-4}{-4\sqrt{3}} = \dfrac{1}{\sqrt{3}}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2024 · tijdvak 1 · vraag 10', 3,
    $stap$De scherpe hoek met de $x$-as is $30$ graden.$stap$
  ),
  (
    'CE vwo wiskunde B 2025 · tijdvak 1 · vraag 3', 0,
    $stap$Een verticale raaklijn krijg je als $x'(t) = 0$ en de helling oneindig wordt.$stap$
  ),
  (
    'CE vwo wiskunde B 2025 · tijdvak 1 · vraag 3', 1,
    $stap$$x'(t) = \cos(2t) - \cos(t)$. Die is nul bij $t = 0$, $t = \dfrac{2}{3}\pi$, $t = \dfrac{4}{3}\pi$ en $t = 2\pi$.$stap$
  ),
  (
    'CE vwo wiskunde B 2025 · tijdvak 1 · vraag 3', 2,
    $stap$Bij $t = 0$ en $t = 2\pi$ hoort het punt $(0,\, 1)$. De helling loopt daar naar oneindig.$stap$
  ),
  (
    'CE vwo wiskunde B 2025 · tijdvak 1 · vraag 3', 3,
    $stap$De andere twee punten zijn $\left(-\dfrac{3}{4}\sqrt{3},\, -\dfrac{1}{2}\right)$ en $\left(\dfrac{3}{4}\sqrt{3},\, -\dfrac{1}{2}\right)$.$stap$
  ),
  (
    'CE vwo wiskunde B 2025 · tijdvak 1 · vraag 9', 0,
    $stap$De afgeleide van de lengte is $\dfrac{\mathrm{d}}{\mathrm{d}a}PQ = 3\sqrt{2} - \dfrac{4a}{\sqrt{a^{2} - 1}}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2025 · tijdvak 1 · vraag 9', 1,
    $stap$Die is nul als $\dfrac{4a}{\sqrt{a^{2} - 1}} = 3\sqrt{2}$.$stap$
  ),
  (
    'CE vwo wiskunde B 2025 · tijdvak 1 · vraag 9', 2,
    $stap$Kwadrateren geeft $16a^{2} = 18(a^{2} - 1)$, dus $a^{2} = 9$.$stap$
  ),
  (
    'CE vwo wiskunde B 2025 · tijdvak 1 · vraag 9', 3,
    $stap$Omdat $a \geq 2$ is $a = 3$.$stap$
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
  SELECT count(*) INTO n_vragen
  FROM public.questions_new
  WHERE source_label LIKE 'CE vwo wiskunde B %';

  SELECT count(*) INTO n_stappen
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  WHERE q.source_label LIKE 'CE vwo wiskunde B %';

  IF n_vragen <> 20 OR n_stappen <> 78 THEN
    RAISE EXCEPTION 'Eindexamenvragen kloppen niet: % opgaven, % stappen', n_vragen, n_stappen;
  END IF;
END $$;
