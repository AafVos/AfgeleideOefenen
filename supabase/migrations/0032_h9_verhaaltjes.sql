-- Verhaaltjes achteraan e-machten differentiëren (hoofdstuk 9).
-- Eén soort, 8 opgaven, bij de productregel. Vorm a t e^{-t}, met t >= 0.
-- Productregel: (a t e^{-t})' = a e^{-t} (1 - t). Grootst op t = 1.
-- Grootste waarde: a/e. Niet afgerond.
-- Terugrekenen: N(0) = 0 en N(2) = 2a/e^2, kleiner dan a/e omdat 2a/e < a
-- (want e > 2).
-- De helft: op welk tijdstip. Voorvoegsel t =, antwoord 1.
-- De andere helft: hoe groot is die grootste waarde. Voorvoegsel leeg.
-- De eenheid en de functie staan in de zin. Stappen inclusief stap 0.
-- Herhaalbaar: een tweede keer draaien voegt niets dubbel toe.

BEGIN;

INSERT INTO public.topic_clusters_new (site, topic_id, slug, title, order_index)
SELECT 'afgeleiden', t.id, 'emacht_in_een_verhaal', 'E-macht in een verhaal', 6::smallint
FROM public.topics_new t
WHERE t.site = 'afgeleiden'
  AND t.slug = 'h9_e_machten'
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
  -- Oneven: tijdstip. Voorvoegsel t =. Antwoord is steeds 1.
  (
    1,
    $vraag$Je volgt een medicijn in het bloed. De hoeveelheid in milligram na $t$ uur is $N = 20t\,e^{-t}$, met $t \geq 0$. Op welk tijdstip is de hoeveelheid het grootst?$vraag$,
    '1', '1', 't =', ARRAY[]::text[]
  ),
  -- Even: grootste waarde, exact, met e. Voorvoegsel leeg.
  (
    2,
    $vraag$Je volgt een kleurstof in een bak water. De hoeveelheid in gram na $t$ minuten is $K = 8t\,e^{-t}$, met $t \geq 0$. Hoe groot is de grootste hoeveelheid, in gram?$vraag$,
    '8/e', '\dfrac{8}{e}', NULL::text,
    ARRAY['8e^{-1}', '8e^(-1)', '(8)/e', '(8)/(e)']::text[]
  ),
  (
    3,
    $vraag$Je volgt mest in een sloot. De concentratie in milligram per liter na $t$ dagen is $C = 6t\,e^{-t}$, met $t \geq 0$. Op welk tijdstip is de concentratie het grootst?$vraag$,
    '1', '1', 't =', ARRAY[]::text[]
  ),
  (
    4,
    $vraag$Je volgt cafeïne in je bloed. De hoeveelheid in milligram na $t$ uur is $H = 15t\,e^{-t}$, met $t \geq 0$. Hoe groot is de grootste hoeveelheid, in milligram?$vraag$,
    '15/e', '\dfrac{15}{e}', NULL::text,
    ARRAY['15e^{-1}', '15e^(-1)', '(15)/e', '(15)/(e)']::text[]
  ),
  (
    5,
    $vraag$Je volgt parfum in een kamer. De concentratie in milligram per kubieke meter na $t$ minuten is $P = 4t\,e^{-t}$, met $t \geq 0$. Op welk tijdstip is de concentratie het grootst?$vraag$,
    '1', '1', 't =', ARRAY[]::text[]
  ),
  (
    6,
    $vraag$Je volgt gist in een fles. De hoeveelheid in gram na $t$ uur is $G = 10t\,e^{-t}$, met $t \geq 0$. Hoe groot is de grootste hoeveelheid, in gram?$vraag$,
    '10/e', '\dfrac{10}{e}', NULL::text,
    ARRAY['10e^{-1}', '10e^(-1)', '(10)/e', '(10)/(e)']::text[]
  ),
  (
    7,
    $vraag$Je volgt stuifmeel in de lucht. De hoeveelheid in milligram per kubieke meter na $t$ uur is $M = 30t\,e^{-t}$, met $t \geq 0$. Op welk tijdstip is de hoeveelheid het grootst?$vraag$,
    '1', '1', 't =', ARRAY[]::text[]
  ),
  (
    8,
    $vraag$Je volgt schuim in een bad. De hoeveelheid in liter na $t$ minuten is $S = 24t\,e^{-t}$, met $t \geq 0$. Hoe groot is de grootste hoeveelheid, in liter?$vraag$,
    '24/e', '\dfrac{24}{e}', NULL::text,
    ARRAY['24e^{-1}', '24e^(-1)', '(24)/e', '(24)/(e)']::text[]
  )
) AS v(order_index, latex_body, answer, latex_answer, answer_prefix, alternatives)
JOIN public.topics_new t
  ON t.site = 'afgeleiden' AND t.slug = 'h9_e_machten'
JOIN public.topic_clusters_new c
  ON c.site = 'afgeleiden' AND c.topic_id = t.id AND c.slug = 'emacht_in_een_verhaal'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.questions_new q
  WHERE q.cluster_id = c.id
    AND q.order_index = v.order_index
);

INSERT INTO public.question_steps_new (question_id, step_order, step_description)
SELECT q.id, v.step_order, v.step_description
FROM (VALUES
  -- 1. N = 20t e^{-t}. N' = 20 e^{-t}(1-t). Grootst op t = 1. N(1) = 20/e.
  ('emacht_in_een_verhaal', 1, 0, $stap$De hoeveelheid is $N(t) = 20t\,e^{-t}$, met $t \geq 0$. Je zoekt het tijdstip waar die het grootst is. Dat is waar $N'(t) = 0$, en de hoeveelheid daarna daalt.$stap$),
  ('emacht_in_een_verhaal', 1, 1, $stap$Productregel. De afgeleide van $20t$ is $20$. De afgeleide van $e^{-t}$ is $-e^{-t}$. Dus $N'(t) = 20 \cdot e^{-t} + 20t \cdot (-e^{-t}) = 20e^{-t}(1 - t)$.$stap$),
  ('emacht_in_een_verhaal', 1, 2, $stap$Stel $N'(t) = 0$. De factor $20e^{-t}$ is nooit $0$. Dus $1 - t = 0$, en $t = 1$. Voor $t < 1$ is $N'(t)$ positief, voor $t > 1$ negatief. De hoeveelheid stijgt tot $t = 1$ en daalt daarna.$stap$),
  ('emacht_in_een_verhaal', 1, 3, $stap$Controle: $N(0) = 0$ en $N(2) = \dfrac{40}{e^2}$. Dat is kleiner dan $N(1) = \dfrac{20}{e}$, omdat $\dfrac{40}{e} < 20$ (want $e > 2$). De hoeveelheid is het grootst op $t = 1$.$stap$),
  -- 2. K = 8t e^{-t}. Grootste waarde 8/e.
  ('emacht_in_een_verhaal', 2, 0, $stap$De hoeveelheid is $K(t) = 8t\,e^{-t}$, met $t \geq 0$. Je zoekt hoe groot die op zijn grootst is. Eerst het tijdstip waar $K'(t) = 0$.$stap$),
  ('emacht_in_een_verhaal', 2, 1, $stap$Productregel. De afgeleide van $8t$ is $8$. De afgeleide van $e^{-t}$ is $-e^{-t}$. Dus $K'(t) = 8 \cdot e^{-t} + 8t \cdot (-e^{-t}) = 8e^{-t}(1 - t)$.$stap$),
  ('emacht_in_een_verhaal', 2, 2, $stap$Stel $K'(t) = 0$. De factor $8e^{-t}$ is nooit $0$. Dus $t = 1$. Voor $t < 1$ stijgt de hoeveelheid, voor $t > 1$ daalt die.$stap$),
  ('emacht_in_een_verhaal', 2, 3, $stap$Vul het tijdstip in: $K(1) = 8 \cdot 1 \cdot e^{-1} = \dfrac{8}{e}$.$stap$),
  ('emacht_in_een_verhaal', 2, 4, $stap$Controle: $K(0) = 0$ en $K(2) = \dfrac{16}{e^2}$. Dat is kleiner dan $\dfrac{8}{e}$, omdat $\dfrac{16}{e} < 8$ (want $e > 2$). De grootste hoeveelheid is $\dfrac{8}{e}$ gram.$stap$),
  -- 3. C = 6t e^{-t}. Grootst op t = 1.
  ('emacht_in_een_verhaal', 3, 0, $stap$De concentratie is $C(t) = 6t\,e^{-t}$, met $t \geq 0$. Je zoekt het tijdstip waar die het grootst is. Dat is waar $C'(t) = 0$, en de concentratie daarna daalt.$stap$),
  ('emacht_in_een_verhaal', 3, 1, $stap$Productregel. De afgeleide van $6t$ is $6$. De afgeleide van $e^{-t}$ is $-e^{-t}$. Dus $C'(t) = 6 \cdot e^{-t} + 6t \cdot (-e^{-t}) = 6e^{-t}(1 - t)$.$stap$),
  ('emacht_in_een_verhaal', 3, 2, $stap$Stel $C'(t) = 0$. De factor $6e^{-t}$ is nooit $0$. Dus $1 - t = 0$, en $t = 1$. Voor $t < 1$ is $C'(t)$ positief, voor $t > 1$ negatief. De concentratie stijgt tot $t = 1$ en daalt daarna.$stap$),
  ('emacht_in_een_verhaal', 3, 3, $stap$Controle: $C(0) = 0$ en $C(2) = \dfrac{12}{e^2}$. Dat is kleiner dan $C(1) = \dfrac{6}{e}$, omdat $\dfrac{12}{e} < 6$ (want $e > 2$). De concentratie is het grootst op $t = 1$.$stap$),
  -- 4. H = 15t e^{-t}. Grootste waarde 15/e.
  ('emacht_in_een_verhaal', 4, 0, $stap$De hoeveelheid is $H(t) = 15t\,e^{-t}$, met $t \geq 0$. Je zoekt hoe groot die op zijn grootst is. Eerst het tijdstip waar $H'(t) = 0$.$stap$),
  ('emacht_in_een_verhaal', 4, 1, $stap$Productregel. De afgeleide van $15t$ is $15$. De afgeleide van $e^{-t}$ is $-e^{-t}$. Dus $H'(t) = 15 \cdot e^{-t} + 15t \cdot (-e^{-t}) = 15e^{-t}(1 - t)$.$stap$),
  ('emacht_in_een_verhaal', 4, 2, $stap$Stel $H'(t) = 0$. De factor $15e^{-t}$ is nooit $0$. Dus $t = 1$. Voor $t < 1$ stijgt de hoeveelheid, voor $t > 1$ daalt die.$stap$),
  ('emacht_in_een_verhaal', 4, 3, $stap$Vul het tijdstip in: $H(1) = 15 \cdot 1 \cdot e^{-1} = \dfrac{15}{e}$.$stap$),
  ('emacht_in_een_verhaal', 4, 4, $stap$Controle: $H(0) = 0$ en $H(2) = \dfrac{30}{e^2}$. Dat is kleiner dan $\dfrac{15}{e}$, omdat $\dfrac{30}{e} < 15$ (want $e > 2$). De grootste hoeveelheid is $\dfrac{15}{e}$ milligram.$stap$),
  -- 5. P = 4t e^{-t}. Grootst op t = 1.
  ('emacht_in_een_verhaal', 5, 0, $stap$De concentratie is $P(t) = 4t\,e^{-t}$, met $t \geq 0$. Je zoekt het tijdstip waar die het grootst is. Dat is waar $P'(t) = 0$, en de concentratie daarna daalt.$stap$),
  ('emacht_in_een_verhaal', 5, 1, $stap$Productregel. De afgeleide van $4t$ is $4$. De afgeleide van $e^{-t}$ is $-e^{-t}$. Dus $P'(t) = 4 \cdot e^{-t} + 4t \cdot (-e^{-t}) = 4e^{-t}(1 - t)$.$stap$),
  ('emacht_in_een_verhaal', 5, 2, $stap$Stel $P'(t) = 0$. De factor $4e^{-t}$ is nooit $0$. Dus $1 - t = 0$, en $t = 1$. Voor $t < 1$ is $P'(t)$ positief, voor $t > 1$ negatief. De concentratie stijgt tot $t = 1$ en daalt daarna.$stap$),
  ('emacht_in_een_verhaal', 5, 3, $stap$Controle: $P(0) = 0$ en $P(2) = \dfrac{8}{e^2}$. Dat is kleiner dan $P(1) = \dfrac{4}{e}$, omdat $\dfrac{8}{e} < 4$ (want $e > 2$). De concentratie is het grootst op $t = 1$.$stap$),
  -- 6. G = 10t e^{-t}. Grootste waarde 10/e.
  ('emacht_in_een_verhaal', 6, 0, $stap$De hoeveelheid is $G(t) = 10t\,e^{-t}$, met $t \geq 0$. Je zoekt hoe groot die op zijn grootst is. Eerst het tijdstip waar $G'(t) = 0$.$stap$),
  ('emacht_in_een_verhaal', 6, 1, $stap$Productregel. De afgeleide van $10t$ is $10$. De afgeleide van $e^{-t}$ is $-e^{-t}$. Dus $G'(t) = 10 \cdot e^{-t} + 10t \cdot (-e^{-t}) = 10e^{-t}(1 - t)$.$stap$),
  ('emacht_in_een_verhaal', 6, 2, $stap$Stel $G'(t) = 0$. De factor $10e^{-t}$ is nooit $0$. Dus $t = 1$. Voor $t < 1$ stijgt de hoeveelheid, voor $t > 1$ daalt die.$stap$),
  ('emacht_in_een_verhaal', 6, 3, $stap$Vul het tijdstip in: $G(1) = 10 \cdot 1 \cdot e^{-1} = \dfrac{10}{e}$.$stap$),
  ('emacht_in_een_verhaal', 6, 4, $stap$Controle: $G(0) = 0$ en $G(2) = \dfrac{20}{e^2}$. Dat is kleiner dan $\dfrac{10}{e}$, omdat $\dfrac{20}{e} < 10$ (want $e > 2$). De grootste hoeveelheid is $\dfrac{10}{e}$ gram.$stap$),
  -- 7. M = 30t e^{-t}. Grootst op t = 1.
  ('emacht_in_een_verhaal', 7, 0, $stap$De hoeveelheid is $M(t) = 30t\,e^{-t}$, met $t \geq 0$. Je zoekt het tijdstip waar die het grootst is. Dat is waar $M'(t) = 0$, en de hoeveelheid daarna daalt.$stap$),
  ('emacht_in_een_verhaal', 7, 1, $stap$Productregel. De afgeleide van $30t$ is $30$. De afgeleide van $e^{-t}$ is $-e^{-t}$. Dus $M'(t) = 30 \cdot e^{-t} + 30t \cdot (-e^{-t}) = 30e^{-t}(1 - t)$.$stap$),
  ('emacht_in_een_verhaal', 7, 2, $stap$Stel $M'(t) = 0$. De factor $30e^{-t}$ is nooit $0$. Dus $1 - t = 0$, en $t = 1$. Voor $t < 1$ is $M'(t)$ positief, voor $t > 1$ negatief. De hoeveelheid stijgt tot $t = 1$ en daalt daarna.$stap$),
  ('emacht_in_een_verhaal', 7, 3, $stap$Controle: $M(0) = 0$ en $M(2) = \dfrac{60}{e^2}$. Dat is kleiner dan $M(1) = \dfrac{30}{e}$, omdat $\dfrac{60}{e} < 30$ (want $e > 2$). De hoeveelheid is het grootst op $t = 1$.$stap$),
  -- 8. S = 24t e^{-t}. Grootste waarde 24/e.
  ('emacht_in_een_verhaal', 8, 0, $stap$De hoeveelheid is $S(t) = 24t\,e^{-t}$, met $t \geq 0$. Je zoekt hoe groot die op zijn grootst is. Eerst het tijdstip waar $S'(t) = 0$.$stap$),
  ('emacht_in_een_verhaal', 8, 1, $stap$Productregel. De afgeleide van $24t$ is $24$. De afgeleide van $e^{-t}$ is $-e^{-t}$. Dus $S'(t) = 24 \cdot e^{-t} + 24t \cdot (-e^{-t}) = 24e^{-t}(1 - t)$.$stap$),
  ('emacht_in_een_verhaal', 8, 2, $stap$Stel $S'(t) = 0$. De factor $24e^{-t}$ is nooit $0$. Dus $t = 1$. Voor $t < 1$ stijgt de hoeveelheid, voor $t > 1$ daalt die.$stap$),
  ('emacht_in_een_verhaal', 8, 3, $stap$Vul het tijdstip in: $S(1) = 24 \cdot 1 \cdot e^{-1} = \dfrac{24}{e}$.$stap$),
  ('emacht_in_een_verhaal', 8, 4, $stap$Controle: $S(0) = 0$ en $S(2) = \dfrac{48}{e^2}$. Dat is kleiner dan $\dfrac{24}{e}$, omdat $\dfrac{48}{e} < 24$ (want $e > 2$). De grootste hoeveelheid is $\dfrac{24}{e}$ liter.$stap$)
) AS v(cluster_slug, q_order_index, step_order, step_description)
JOIN public.topics_new t
  ON t.site = 'afgeleiden' AND t.slug = 'h9_e_machten'
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
  n_tijdstip int;
  n_waarde int;
  n_zonder_stap0 int;
  n_stappen int;
  n_verboden int;
  n_zonder_functie int;
  laatste_oud smallint;
  nieuw smallint;
BEGIN
  SELECT max(c.order_index) INTO laatste_oud
  FROM public.topic_clusters_new c
  JOIN public.topics_new t ON t.id = c.topic_id
  WHERE t.site = 'afgeleiden'
    AND t.slug = 'h9_e_machten'
    AND c.slug <> 'emacht_in_een_verhaal';

  SELECT c.order_index INTO nieuw
  FROM public.topic_clusters_new c
  JOIN public.topics_new t ON t.id = c.topic_id
  WHERE t.site = 'afgeleiden'
    AND t.slug = 'h9_e_machten'
    AND c.slug = 'emacht_in_een_verhaal';

  IF laatste_oud IS NULL OR nieuw IS NULL OR nieuw <= laatste_oud THEN
    RAISE EXCEPTION 'soort staat niet achteraan e-machten differentiëren';
  END IF;

  SELECT count(*),
         count(*) FILTER (WHERE q.answer_prefix = 't =' AND q.answer = '1'),
         count(*) FILTER (
           WHERE q.answer_prefix IS NULL
             AND q.answer ~ '^[0-9]+/e$'
             AND q.latex_answer = '\dfrac{' || split_part(q.answer, '/', 1) || '}{e}'
         )
    INTO n_opgaven, n_tijdstip, n_waarde
  FROM public.questions_new q
  JOIN public.topic_clusters_new c ON c.id = q.cluster_id
  JOIN public.topics_new t ON t.id = q.topic_id
  WHERE t.site = 'afgeleiden'
    AND t.slug = 'h9_e_machten'
    AND c.slug = 'emacht_in_een_verhaal';

  SELECT count(*) INTO n_zonder_stap0
  FROM public.questions_new q
  JOIN public.topic_clusters_new c ON c.id = q.cluster_id
  JOIN public.topics_new t ON t.id = q.topic_id
  WHERE t.site = 'afgeleiden'
    AND t.slug = 'h9_e_machten'
    AND c.slug = 'emacht_in_een_verhaal'
    AND NOT EXISTS (
      SELECT 1 FROM public.question_steps_new s
      WHERE s.question_id = q.id AND s.step_order = 0
    );

  SELECT count(*) INTO n_stappen
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  JOIN public.topic_clusters_new c ON c.id = q.cluster_id
  JOIN public.topics_new t ON t.id = q.topic_id
  WHERE t.site = 'afgeleiden'
    AND t.slug = 'h9_e_machten'
    AND c.slug = 'emacht_in_een_verhaal';

  SELECT count(*) INTO n_verboden
  FROM public.questions_new q
  JOIN public.topic_clusters_new c ON c.id = q.cluster_id
  JOIN public.topics_new t ON t.id = q.topic_id
  WHERE t.site = 'afgeleiden'
    AND t.slug = 'h9_e_machten'
    AND c.slug = 'emacht_in_een_verhaal'
    AND (
      q.latex_body ILIKE '%toon aan%'
      OR q.latex_body ILIKE '%bewijs%'
      OR q.latex_body ILIKE '%raaklijn%'
      OR q.latex_body ILIKE '%plaatje%'
    );

  SELECT count(*) INTO n_zonder_functie
  FROM public.questions_new q
  JOIN public.topic_clusters_new c ON c.id = q.cluster_id
  JOIN public.topics_new t ON t.id = q.topic_id
  WHERE t.site = 'afgeleiden'
    AND t.slug = 'h9_e_machten'
    AND c.slug = 'emacht_in_een_verhaal'
    AND (
      strpos(q.latex_body, 'e^{-t}') = 0
      OR strpos(q.latex_body, 't \geq 0') = 0
    );

  IF n_opgaven <> 8 OR n_tijdstip <> 4 OR n_waarde <> 4
     OR n_zonder_stap0 <> 0 OR n_stappen <> 36
     OR n_verboden <> 0 OR n_zonder_functie <> 0 THEN
    RAISE EXCEPTION
      'soort klopt niet: opgaven %, tijdstip %, waarde %, zonder stap 0 %, stappen %, verboden %, zonder functie %',
      n_opgaven, n_tijdstip, n_waarde, n_zonder_stap0, n_stappen, n_verboden, n_zonder_functie;
  END IF;
END $$;

COMMIT;
