-- =============================================================================
-- Migration 0022: H11 integralen content (54 questions + ~130 steps)
-- =============================================================================
BEGIN;

-- ============================================================
-- 1. CHAPTER
-- ============================================================
INSERT INTO public.chapters (slug, title, book_part, order_index, site)
VALUES ('h11', 'H11 — Primitiveren en integralen', 3, 11, 'integralen');

-- ============================================================
-- 2. TOPICS
-- ============================================================
INSERT INTO public.topics_new (slug, title, chapter_id, order_index, is_unlocked_by_default, site)
SELECT v.slug, v.title, ch.id, v.ord, true, 'integralen'
FROM (VALUES
  ('h11_machtsfuncties',   'Machtsfuncties primitiveren',     1),
  ('h11_wortels_breuken',  'Wortels en negatieve machten',    2),
  ('h11_e_machten',        'E-machten primitiveren',          3),
  ('h11_logaritmes',       'Logaritmes primitiveren',         4),
  ('h11_goniometrie',      'Goniometrie primitiveren',        5),
  ('h11_lineaire_ketting', 'Lineaire kettingregel',           6),
  ('h11_uitdelen',         'Uitdelen dan primitiveren',       7),
  ('h11_aantonen',         'Aantonen dat F primitieve is',    8),
  ('h11_beginvoorwaarde',  'Primitieve met beginvoorwaarde',  9)
) AS v(slug, title, ord)
CROSS JOIN (SELECT id FROM public.chapters WHERE slug = 'h11' AND site = 'integralen') AS ch;

-- ============================================================
-- 3. CLUSTERS
-- ============================================================
INSERT INTO public.topic_clusters_new (slug, title, topic_id, order_index, site)
SELECT v.slug, v.title, t.id, 1, 'integralen'
FROM (VALUES
  ('standaard_machten',      'Standaard machtsfuncties',     'h11_machtsfuncties'),
  ('wortels_en_neg_machten', 'Wortels en negatieve machten', 'h11_wortels_breuken'),
  ('e_en_g_machten',         'E-machten en g^x',             'h11_e_machten'),
  ('ln_en_glog',             'ln(x) en 1/x',                 'h11_logaritmes'),
  ('sin_cos_primitiveren',   'Sin en cos primitiveren',      'h11_goniometrie'),
  ('f_ax_plus_b',            'f(ax + b) primitiveren',       'h11_lineaire_ketting'),
  ('breuk_uitdelen',         'Breuk uitdelen',               'h11_uitdelen'),
  ('toon_aan_primitieve',    'Toon aan: F is primitieve',    'h11_aantonen'),
  ('c_bepalen',              'Integratieconstante bepalen',  'h11_beginvoorwaarde')
) AS v(slug, title, topic_slug)
JOIN public.topics_new t ON t.slug = v.topic_slug AND t.site = 'integralen';

-- ============================================================
-- 4. QUESTIONS
-- ============================================================
INSERT INTO public.questions_new
  (site, topic_id, cluster_id, latex_body, answer, latex_answer, difficulty, order_index, is_ai_generated, answer_alternatives)
SELECT 'integralen', t.id, c.id,
       v.latex_body, v.answer, v.latex_answer,
       v.difficulty::integer, v.ord::integer,
       true, '{}'::text[]
FROM (VALUES
  -- h11_machtsfuncties / standaard_machten
  ('h11_machtsfuncties','standaard_machten',
   'f(x) = 3x^{2}',
   'x^3 + c', 'x^{3} + c', '1','1'),
  ('h11_machtsfuncties','standaard_machten',
   'f(x) = 5x^{4}',
   'x^5 + c', 'x^{5} + c', '1','2'),
  ('h11_machtsfuncties','standaard_machten',
   'f(x) = 6x^{2} - 4x + 7',
   '2x^3 - 2x^2 + 7x + c', '2x^{3} - 2x^{2} + 7x + c', '2','3'),
  ('h11_machtsfuncties','standaard_machten',
   'f(x) = 2x^{3} + 5x^{4}',
   'x^4/2 + x^5 + c', '\tfrac{1}{2}x^{4} + x^{5} + c', '2','4'),
  ('h11_machtsfuncties','standaard_machten',
   'f(x) = -2x^{8} + 3x^{3} - x',
   '-2x^9/9 + 3x^4/4 - x^2/2 + c',
   '-\tfrac{2}{9}x^{9} + \tfrac{3}{4}x^{4} - \tfrac{1}{2}x^{2} + c', '3','5'),
  ('h11_machtsfuncties','standaard_machten',
   'h(t) = 4t^{5} - 3t^{2} + 1',
   '2t^6/3 - t^3 + t + c', '\tfrac{2}{3}t^{6} - t^{3} + t + c', '3','6'),
  -- h11_wortels_breuken / wortels_en_neg_machten
  ('h11_wortels_breuken','wortels_en_neg_machten',
   'f(x) = \sqrt{x}',
   '2/3 x sqrt(x) + c', '\tfrac{2}{3}x\sqrt{x} + c', '1','1'),
  ('h11_wortels_breuken','wortels_en_neg_machten',
   'f(x) = \dfrac{1}{x^{2}}',
   '-1/x + c', '-\dfrac{1}{x} + c', '1','2'),
  ('h11_wortels_breuken','wortels_en_neg_machten',
   'f(x) = \dfrac{3}{x^{4}}',
   '-1/x^3 + c', '-\dfrac{1}{x^{3}} + c', '2','3'),
  ('h11_wortels_breuken','wortels_en_neg_machten',
   'f(x) = 2\sqrt{x} + \dfrac{1}{x^{3}}',
   '4/3 x sqrt(x) - 1/(2x^2) + c',
   '\tfrac{4}{3}x\sqrt{x} - \dfrac{1}{2x^{2}} + c', '2','4'),
  ('h11_wortels_breuken','wortels_en_neg_machten',
   'f(x) = x\sqrt{x}',
   '2/5 x^2 sqrt(x) + c', '\tfrac{2}{5}x^{2}\sqrt{x} + c', '3','5'),
  ('h11_wortels_breuken','wortels_en_neg_machten',
   'f(x) = 10x\sqrt{x}',
   '4x^2 sqrt(x) + c', '4x^{2}\sqrt{x} + c', '3','6'),
  -- h11_e_machten / e_en_g_machten
  ('h11_e_machten','e_en_g_machten',
   'f(x) = e^{x}',
   'e^x + c', 'e^{x} + c', '1','1'),
  ('h11_e_machten','e_en_g_machten',
   'f(x) = 3e^{x}',
   '3e^x + c', '3e^{x} + c', '1','2'),
  ('h11_e_machten','e_en_g_machten',
   'f(x) = e^{x} + x^{2}',
   'e^x + x^3/3 + c', 'e^{x} + \tfrac{1}{3}x^{3} + c', '2','3'),
  ('h11_e_machten','e_en_g_machten',
   'f(x) = 5 \cdot 2^{x}',
   '5 * 2^x / ln(2) + c', '\dfrac{5 \cdot 2^{x}}{\ln(2)} + c', '2','4'),
  ('h11_e_machten','e_en_g_machten',
   'f(x) = 3^{x} + x^{3}',
   '3^x / ln(3) + x^4/4 + c',
   '\dfrac{3^{x}}{\ln(3)} + \tfrac{1}{4}x^{4} + c', '3','5'),
  ('h11_e_machten','e_en_g_machten',
   'f(x) = 10^{x}',
   '10^x / ln(10) + c', '\dfrac{10^{x}}{\ln(10)} + c', '3','6'),
  -- h11_logaritmes / ln_en_glog
  ('h11_logaritmes','ln_en_glog',
   'f(x) = \dfrac{1}{x}',
   'ln|x| + c', '\ln|x| + c', '1','1'),
  ('h11_logaritmes','ln_en_glog',
   'f(x) = \dfrac{3}{x}',
   '3 ln|x| + c', '3\ln|x| + c', '1','2'),
  ('h11_logaritmes','ln_en_glog',
   'f(x) = \ln(x)',
   'x ln(x) - x + c', 'x\ln(x) - x + c', '2','3'),
  ('h11_logaritmes','ln_en_glog',
   'f(x) = 2\ln(x)',
   '2x ln(x) - 2x + c', '2x\ln(x) - 2x + c', '2','4'),
  ('h11_logaritmes','ln_en_glog',
   'f(x) = {}^{2}\!\log(x)',
   '(x ln(x) - x) / ln(2) + c', '\dfrac{x\ln(x) - x}{\ln(2)} + c', '3','5'),
  ('h11_logaritmes','ln_en_glog',
   'f(x) = \ln(2x)',
   'x ln(2x) - x + c', 'x\ln(2x) - x + c', '3','6'),
  -- h11_goniometrie / sin_cos_primitiveren
  ('h11_goniometrie','sin_cos_primitiveren',
   'f(x) = \sin(x)',
   '-cos(x) + c', '-\cos(x) + c', '1','1'),
  ('h11_goniometrie','sin_cos_primitiveren',
   'f(x) = \cos(x)',
   'sin(x) + c', '\sin(x) + c', '1','2'),
  ('h11_goniometrie','sin_cos_primitiveren',
   'f(x) = 3\sin(x) + 2\cos(x)',
   '-3 cos(x) + 2 sin(x) + c', '-3\cos(x) + 2\sin(x) + c', '2','3'),
  ('h11_goniometrie','sin_cos_primitiveren',
   'f(x) = x^{2} + \sin(x)',
   'x^3/3 - cos(x) + c', '\tfrac{1}{3}x^{3} - \cos(x) + c', '2','4'),
  ('h11_goniometrie','sin_cos_primitiveren',
   'f(x) = 5\sin(x) - 3\cos(x) + 2',
   '-5 cos(x) - 3 sin(x) + 2x + c', '-5\cos(x) - 3\sin(x) + 2x + c', '3','5'),
  ('h11_goniometrie','sin_cos_primitiveren',
   'f(x) = e^{x} + \cos(x)',
   'e^x + sin(x) + c', 'e^{x} + \sin(x) + c', '3','6'),
  -- h11_lineaire_ketting / f_ax_plus_b
  ('h11_lineaire_ketting','f_ax_plus_b',
   'f(x) = (2x + 1)^{3}',
   '(2x+1)^4 / 8 + c', '\dfrac{(2x + 1)^{4}}{8} + c', '1','1'),
  ('h11_lineaire_ketting','f_ax_plus_b',
   'f(x) = (3x + 4)^{5}',
   '(3x+4)^6 / 18 + c', '\dfrac{(3x + 4)^{6}}{18} + c', '1','2'),
  ('h11_lineaire_ketting','f_ax_plus_b',
   'f(x) = \sqrt{4x - 1}',
   '(4x-1) sqrt(4x-1) / 6 + c',
   '\dfrac{(4x - 1)\sqrt{4x - 1}}{6} + c', '2','3'),
  ('h11_lineaire_ketting','f_ax_plus_b',
   'f(x) = \dfrac{1}{(3x + 2)^{2}}',
   '-1/(3(3x+2)) + c', '-\dfrac{1}{3(3x + 2)} + c', '2','4'),
  ('h11_lineaire_ketting','f_ax_plus_b',
   'f(x) = e^{4x + 1}',
   'e^(4x+1)/4 + c', '\dfrac{e^{4x + 1}}{4} + c', '3','5'),
  ('h11_lineaire_ketting','f_ax_plus_b',
   'f(x) = \sin(2x + \tfrac{1}{3}\pi)',
   '-cos(2x + 1/3 pi)/2 + c',
   '-\dfrac{\cos(2x + \tfrac{1}{3}\pi)}{2} + c', '3','6'),
  -- h11_uitdelen / breuk_uitdelen
  ('h11_uitdelen','breuk_uitdelen',
   'f(x) = \dfrac{x^{2} + 1}{x}',
   'x^2/2 + ln|x| + c', '\tfrac{1}{2}x^{2} + \ln|x| + c', '1','1'),
  ('h11_uitdelen','breuk_uitdelen',
   'f(x) = \dfrac{2x + 6}{x^{2}}',
   '2 ln|x| - 6/x + c', '2\ln|x| - \dfrac{6}{x} + c', '1','2'),
  ('h11_uitdelen','breuk_uitdelen',
   'f(x) = \dfrac{x^{6} + 2x^{2} + 7}{x^{2}}',
   'x^5/5 + 2x - 7/x + c', '\tfrac{1}{5}x^{5} + 2x - \dfrac{7}{x} + c', '2','3'),
  ('h11_uitdelen','breuk_uitdelen',
   'f(x) = \dfrac{x^{4} - 2x}{2x^{3}}',
   'x^2/4 + 1/x + c', '\tfrac{1}{4}x^{2} + \dfrac{1}{x} + c', '2','4'),
  ('h11_uitdelen','breuk_uitdelen',
   'f(x) = \dfrac{x^{3} + 2}{x^{4}}',
   'ln|x| - 2/(3x^3) + c', '\ln|x| - \dfrac{2}{3x^{3}} + c', '3','5'),
  ('h11_uitdelen','breuk_uitdelen',
   'f(x) = \dfrac{-x^{2} + 2x + 3}{x^{4}}',
   '1/x - 1/x^2 - 1/x^3 + c',
   '\dfrac{1}{x} - \dfrac{1}{x^{2}} - \dfrac{1}{x^{3}} + c', '3','6'),
  -- h11_aantonen / toon_aan_primitieve  (F'(x) → F''(x) in SQL strings)
  ('h11_aantonen','toon_aan_primitieve',
   'Toon aan dat $F(x) = x^{3} + 7$ een primitieve is van $f(x) = 3x^{2}$.',
   'F''(x) = 3x^2 = f(x)', 'F''(x) = 3x^{2} = f(x) \checkmark', '1','1'),
  ('h11_aantonen','toon_aan_primitieve',
   'Toon aan dat $F(x) = \tfrac{1}{5}x^{5}$ een primitieve is van $f(x) = x^{4}$.',
   'F''(x) = x^4 = f(x)', 'F''(x) = x^{4} = f(x) \checkmark', '1','2'),
  ('h11_aantonen','toon_aan_primitieve',
   'Toon aan dat $F(x) = (x^{2}+1)^{6}+1$ een primitieve is van $f(x) = 12x(x^{2}+1)^{5}$.',
   'F''(x) = 6(x^2+1)^5 * 2x = 12x(x^2+1)^5 = f(x)',
   'F''(x) = 6(x^{2}+1)^{5} \cdot 2x = 12x(x^{2}+1)^{5} = f(x) \checkmark', '2','3'),
  ('h11_aantonen','toon_aan_primitieve',
   'Toon aan dat $F(x) = x \cdot e^{x} - e^{x}$ een primitieve is van $f(x) = x \cdot e^{x}$.',
   'F''(x) = e^x + x e^x - e^x = x e^x = f(x)',
   'F''(x) = e^{x} + xe^{x} - e^{x} = xe^{x} = f(x) \checkmark', '2','4'),
  ('h11_aantonen','toon_aan_primitieve',
   'Toon aan dat $F(x) = x\ln(x) - x$ een primitieve is van $f(x) = \ln(x)$.',
   'F''(x) = ln(x) + x * 1/x - 1 = ln(x) + 1 - 1 = ln(x) = f(x)',
   'F''(x) = \ln(x) + x \cdot \tfrac{1}{x} - 1 = \ln(x) = f(x) \checkmark', '3','5'),
  ('h11_aantonen','toon_aan_primitieve',
   'Toon aan dat $F(x) = \sin^{3}(x)$ een primitieve is van $f(x) = 3\sin^{2}(x)\cos(x)$.',
   'F''(x) = 3 sin^2(x) cos(x) = f(x)',
   'F''(x) = 3\sin^{2}(x)\cos(x) = f(x) \checkmark', '3','6'),
  -- h11_beginvoorwaarde / c_bepalen
  ('h11_beginvoorwaarde','c_bepalen',
   '$f(x) = 2x - 3$. De grafiek van een primitieve $F$ gaat door het punt $(0, 5)$. Bereken $F(x)$.',
   'F(x) = x^2 - 3x + 5', 'F(x) = x^{2} - 3x + 5', '1','1'),
  ('h11_beginvoorwaarde','c_bepalen',
   '$f(x) = 3x^{2}$. De grafiek van een primitieve $F$ gaat door het punt $(2, 15)$. Bereken $F(x)$.',
   'F(x) = x^3 + 7', 'F(x) = x^{3} + 7', '1','2'),
  ('h11_beginvoorwaarde','c_bepalen',
   '$f(x) = 4x - 1$. De grafiek van een primitieve $F$ gaat door het punt $(1, 7)$. Bereken $F(x)$.',
   'F(x) = 2x^2 - x + 6', 'F(x) = 2x^{2} - x + 6', '2','3'),
  ('h11_beginvoorwaarde','c_bepalen',
   '$f(x) = e^{x}$. De grafiek van een primitieve $F$ gaat door het punt $(0, 3)$. Bereken $F(x)$.',
   'F(x) = e^x + 2', 'F(x) = e^{x} + 2', '2','4'),
  ('h11_beginvoorwaarde','c_bepalen',
   '$f(x) = (x^{2}-1)^{2}$. De grafiek van $F$ gaat door $(1, 7)$. Bereken $F(x)$.',
   'F(x) = x^5/5 - 2x^3/3 + x + 6 + 7/15',
   'F(x) = \tfrac{1}{5}x^{5} - \tfrac{2}{3}x^{3} + x + 6\tfrac{7}{15}', '3','5'),
  ('h11_beginvoorwaarde','c_bepalen',
   '$f(x) = 4x - \ln(x)$. De grafiek van $F$ gaat door $(1, 0)$. Bereken $F(x)$.',
   'F(x) = 2x^2 - x ln(x) + x - 3',
   'F(x) = 2x^{2} - x\ln(x) + x - 3', '3','6')
) AS v(topic_slug, cluster_slug, latex_body, answer, latex_answer, difficulty, ord)
JOIN public.topics_new t ON t.slug = v.topic_slug AND t.site = 'integralen'
JOIN public.topic_clusters_new c ON c.slug = v.cluster_slug AND c.site = 'integralen';

-- ============================================================
-- 5. QUESTION STEPS
-- ============================================================
INSERT INTO public.question_steps_new (question_id, step_order, step_description)
SELECT q.id, v.step_order::integer, v.step_description
FROM (VALUES
  -- standaard_machten Q1
  ('standaard_machten','f(x) = 3x^{2}','1','Gebruik de regel: $\int ax^n\,dx = \dfrac{a}{n+1}x^{n+1} + c$.'),
  ('standaard_machten','f(x) = 3x^{2}','2','$\int 3x^2\,dx = \dfrac{3}{3}x^3 + c = x^3 + c$.'),
  -- standaard_machten Q2
  ('standaard_machten','f(x) = 5x^{4}','1','Gebruik de regel: $\int ax^n\,dx = \dfrac{a}{n+1}x^{n+1} + c$.'),
  ('standaard_machten','f(x) = 5x^{4}','2','$\int 5x^4\,dx = \dfrac{5}{5}x^5 + c = x^5 + c$.'),
  -- standaard_machten Q3
  ('standaard_machten','f(x) = 6x^{2} - 4x + 7','1','Primitiveer elke term apart.'),
  ('standaard_machten','f(x) = 6x^{2} - 4x + 7','2','$\int 6x^2\,dx = 2x^3$, $\int -4x\,dx = -2x^2$, $\int 7\,dx = 7x$.'),
  ('standaard_machten','f(x) = 6x^{2} - 4x + 7','3','$F(x) = 2x^3 - 2x^2 + 7x + c$.'),
  -- standaard_machten Q4
  ('standaard_machten','f(x) = 2x^{3} + 5x^{4}','1','Primitiveer elke term apart.'),
  ('standaard_machten','f(x) = 2x^{3} + 5x^{4}','2','$\int 2x^3\,dx = \tfrac{1}{2}x^4$ en $\int 5x^4\,dx = x^5$.'),
  ('standaard_machten','f(x) = 2x^{3} + 5x^{4}','3','$F(x) = \tfrac{1}{2}x^4 + x^5 + c$.'),
  -- standaard_machten Q5
  ('standaard_machten','f(x) = -2x^{8} + 3x^{3} - x','1','Primitiveer elke term apart met de machtsregel.'),
  ('standaard_machten','f(x) = -2x^{8} + 3x^{3} - x','2','$\int -2x^8\,dx = -\tfrac{2}{9}x^9$, $\int 3x^3\,dx = \tfrac{3}{4}x^4$, $\int -x\,dx = -\tfrac{1}{2}x^2$.'),
  ('standaard_machten','f(x) = -2x^{8} + 3x^{3} - x','3','$F(x) = -\tfrac{2}{9}x^9 + \tfrac{3}{4}x^4 - \tfrac{1}{2}x^2 + c$.'),
  -- standaard_machten Q6
  ('standaard_machten','h(t) = 4t^{5} - 3t^{2} + 1','1','De variabele is $t$. Primitiveer elke term.'),
  ('standaard_machten','h(t) = 4t^{5} - 3t^{2} + 1','2','$\int 4t^5\,dt = \tfrac{2}{3}t^6$, $\int -3t^2\,dt = -t^3$, $\int 1\,dt = t$.'),
  ('standaard_machten','h(t) = 4t^{5} - 3t^{2} + 1','3','$H(t) = \tfrac{2}{3}t^6 - t^3 + t + c$.'),
  -- wortels_en_neg_machten Q1
  ('wortels_en_neg_machten','f(x) = \sqrt{x}','1','Schrijf als macht: $\sqrt{x} = x^{\frac{1}{2}}$.'),
  ('wortels_en_neg_machten','f(x) = \sqrt{x}','2','Primitiveer: $\int x^{\frac{1}{2}}\,dx = \dfrac{1}{\frac{3}{2}}x^{\frac{3}{2}} = \tfrac{2}{3}x^{\frac{3}{2}}$.'),
  ('wortels_en_neg_machten','f(x) = \sqrt{x}','3','Schrijf terug: $F(x) = \tfrac{2}{3}x\sqrt{x} + c$.'),
  -- wortels_en_neg_machten Q2
  ('wortels_en_neg_machten','f(x) = \dfrac{1}{x^{2}}','1','Schrijf als macht: $\dfrac{1}{x^2} = x^{-2}$.'),
  ('wortels_en_neg_machten','f(x) = \dfrac{1}{x^{2}}','2','Primitiveer: $\int x^{-2}\,dx = \dfrac{1}{-1}x^{-1} = -x^{-1}$.'),
  ('wortels_en_neg_machten','f(x) = \dfrac{1}{x^{2}}','3','Schrijf terug: $F(x) = -\dfrac{1}{x} + c$.'),
  -- wortels_en_neg_machten Q3
  ('wortels_en_neg_machten','f(x) = \dfrac{3}{x^{4}}','1','Schrijf als macht: $\dfrac{3}{x^4} = 3x^{-4}$.'),
  ('wortels_en_neg_machten','f(x) = \dfrac{3}{x^{4}}','2','Primitiveer: $\int 3x^{-4}\,dx = 3 \cdot \dfrac{1}{-3}x^{-3} = -x^{-3}$.'),
  ('wortels_en_neg_machten','f(x) = \dfrac{3}{x^{4}}','3','Schrijf terug: $F(x) = -\dfrac{1}{x^3} + c$.'),
  -- wortels_en_neg_machten Q4
  ('wortels_en_neg_machten','f(x) = 2\sqrt{x} + \dfrac{1}{x^{3}}','1','Schrijf als machten: $2\sqrt{x} = 2x^{\frac{1}{2}}$ en $\dfrac{1}{x^3} = x^{-3}$.'),
  ('wortels_en_neg_machten','f(x) = 2\sqrt{x} + \dfrac{1}{x^{3}}','2','Primitiveer: $\int 2x^{\frac{1}{2}}\,dx = \tfrac{4}{3}x^{\frac{3}{2}}$ en $\int x^{-3}\,dx = -\tfrac{1}{2}x^{-2}$.'),
  ('wortels_en_neg_machten','f(x) = 2\sqrt{x} + \dfrac{1}{x^{3}}','3','Schrijf terug: $F(x) = \tfrac{4}{3}x\sqrt{x} - \dfrac{1}{2x^2} + c$.'),
  -- wortels_en_neg_machten Q5
  ('wortels_en_neg_machten','f(x) = x\sqrt{x}','1','Schrijf als macht: $x\sqrt{x} = x^{\frac{3}{2}}$.'),
  ('wortels_en_neg_machten','f(x) = x\sqrt{x}','2','Primitiveer: $\int x^{\frac{3}{2}}\,dx = \dfrac{1}{\frac{5}{2}}x^{\frac{5}{2}} = \tfrac{2}{5}x^{\frac{5}{2}}$.'),
  ('wortels_en_neg_machten','f(x) = x\sqrt{x}','3','Schrijf terug: $F(x) = \tfrac{2}{5}x^2\sqrt{x} + c$.'),
  -- wortels_en_neg_machten Q6
  ('wortels_en_neg_machten','f(x) = 10x\sqrt{x}','1','Schrijf als macht: $10x\sqrt{x} = 10x^{\frac{3}{2}}$.'),
  ('wortels_en_neg_machten','f(x) = 10x\sqrt{x}','2','Primitiveer: $\int 10x^{\frac{3}{2}}\,dx = 10 \cdot \tfrac{2}{5}x^{\frac{5}{2}} = 4x^{\frac{5}{2}}$.'),
  ('wortels_en_neg_machten','f(x) = 10x\sqrt{x}','3','Schrijf terug: $F(x) = 4x^2\sqrt{x} + c$.'),
  -- e_en_g_machten Q1
  ('e_en_g_machten','f(x) = e^{x}','1','Gebruik: $\int e^x\,dx = e^x + c$.'),
  ('e_en_g_machten','f(x) = e^{x}','2','$F(x) = e^x + c$.'),
  -- e_en_g_machten Q2
  ('e_en_g_machten','f(x) = 3e^{x}','1','Constante factor blijft staan: $\int 3e^x\,dx = 3e^x + c$.'),
  ('e_en_g_machten','f(x) = 3e^{x}','2','$F(x) = 3e^x + c$.'),
  -- e_en_g_machten Q3
  ('e_en_g_machten','f(x) = e^{x} + x^{2}','1','Primitiveer termsgewijs: $\int e^x\,dx = e^x$ en $\int x^2\,dx = \tfrac{1}{3}x^3$.'),
  ('e_en_g_machten','f(x) = e^{x} + x^{2}','2','$F(x) = e^x + \tfrac{1}{3}x^3 + c$.'),
  -- e_en_g_machten Q4
  ('e_en_g_machten','f(x) = 5 \cdot 2^{x}','1','Gebruik: $\int g^x\,dx = \dfrac{g^x}{\ln(g)} + c$ met $g = 2$.'),
  ('e_en_g_machten','f(x) = 5 \cdot 2^{x}','2','$F(x) = \dfrac{5 \cdot 2^x}{\ln(2)} + c$.'),
  -- e_en_g_machten Q5
  ('e_en_g_machten','f(x) = 3^{x} + x^{3}','1','Primitiveer termsgewijs: $\int 3^x\,dx = \dfrac{3^x}{\ln(3)}$ en $\int x^3\,dx = \tfrac{1}{4}x^4$.'),
  ('e_en_g_machten','f(x) = 3^{x} + x^{3}','2','$F(x) = \dfrac{3^x}{\ln(3)} + \tfrac{1}{4}x^4 + c$.'),
  -- e_en_g_machten Q6
  ('e_en_g_machten','f(x) = 10^{x}','1','Gebruik: $\int g^x\,dx = \dfrac{g^x}{\ln(g)} + c$ met $g = 10$.'),
  ('e_en_g_machten','f(x) = 10^{x}','2','$F(x) = \dfrac{10^x}{\ln(10)} + c$.'),
  -- ln_en_glog Q1
  ('ln_en_glog','f(x) = \dfrac{1}{x}','1','Gebruik: $\int \dfrac{1}{x}\,dx = \ln|x| + c$.'),
  ('ln_en_glog','f(x) = \dfrac{1}{x}','2','$F(x) = \ln|x| + c$.'),
  -- ln_en_glog Q2
  ('ln_en_glog','f(x) = \dfrac{3}{x}','1','Constante factor: $\int \dfrac{3}{x}\,dx = 3\ln|x| + c$.'),
  ('ln_en_glog','f(x) = \dfrac{3}{x}','2','$F(x) = 3\ln|x| + c$.'),
  -- ln_en_glog Q3
  ('ln_en_glog','f(x) = \ln(x)','1','Gebruik de standaard-primitieve: $\int \ln(x)\,dx = x\ln(x) - x + c$.'),
  ('ln_en_glog','f(x) = \ln(x)','2','$F(x) = x\ln(x) - x + c$.'),
  -- ln_en_glog Q4
  ('ln_en_glog','f(x) = 2\ln(x)','1','Constante factor: $\int 2\ln(x)\,dx = 2(x\ln(x) - x) + c = 2x\ln(x) - 2x + c$.'),
  ('ln_en_glog','f(x) = 2\ln(x)','2','$F(x) = 2x\ln(x) - 2x + c$.'),
  -- ln_en_glog Q5
  ('ln_en_glog','f(x) = {}^{2}\!\log(x)','1','Gebruik: ${}^g\!\log(x) = \dfrac{\ln(x)}{\ln(g)}$, dus $\int {}^2\!\log(x)\,dx = \dfrac{1}{\ln(2)}\int \ln(x)\,dx$.'),
  ('ln_en_glog','f(x) = {}^{2}\!\log(x)','2','$\int \ln(x)\,dx = x\ln(x) - x$, dus $F(x) = \dfrac{x\ln(x) - x}{\ln(2)} + c$.'),
  -- ln_en_glog Q6
  ('ln_en_glog','f(x) = \ln(2x)','1','Gebruik: $\int \ln(ax)\,dx = x\ln(ax) - x + c$ (want $\dfrac{d}{dx}[x\ln(ax) - x] = \ln(ax) + 1 - 1 = \ln(ax)$).'),
  ('ln_en_glog','f(x) = \ln(2x)','2','$F(x) = x\ln(2x) - x + c$.'),
  -- sin_cos_primitiveren Q1
  ('sin_cos_primitiveren','f(x) = \sin(x)','1','Gebruik: $\int \sin(x)\,dx = -\cos(x) + c$.'),
  ('sin_cos_primitiveren','f(x) = \sin(x)','2','$F(x) = -\cos(x) + c$.'),
  -- sin_cos_primitiveren Q2
  ('sin_cos_primitiveren','f(x) = \cos(x)','1','Gebruik: $\int \cos(x)\,dx = \sin(x) + c$.'),
  ('sin_cos_primitiveren','f(x) = \cos(x)','2','$F(x) = \sin(x) + c$.'),
  -- sin_cos_primitiveren Q3
  ('sin_cos_primitiveren','f(x) = 3\sin(x) + 2\cos(x)','1','Primitiveer termsgewijs: $\int 3\sin(x)\,dx = -3\cos(x)$ en $\int 2\cos(x)\,dx = 2\sin(x)$.'),
  ('sin_cos_primitiveren','f(x) = 3\sin(x) + 2\cos(x)','2','$F(x) = -3\cos(x) + 2\sin(x) + c$.'),
  -- sin_cos_primitiveren Q4
  ('sin_cos_primitiveren','f(x) = x^{2} + \sin(x)','1','Primitiveer termsgewijs: $\int x^2\,dx = \tfrac{1}{3}x^3$ en $\int \sin(x)\,dx = -\cos(x)$.'),
  ('sin_cos_primitiveren','f(x) = x^{2} + \sin(x)','2','$F(x) = \tfrac{1}{3}x^3 - \cos(x) + c$.'),
  -- sin_cos_primitiveren Q5
  ('sin_cos_primitiveren','f(x) = 5\sin(x) - 3\cos(x) + 2','1','Primitiveer termsgewijs: $\int 5\sin(x)\,dx = -5\cos(x)$, $\int -3\cos(x)\,dx = -3\sin(x)$, $\int 2\,dx = 2x$.'),
  ('sin_cos_primitiveren','f(x) = 5\sin(x) - 3\cos(x) + 2','2','$F(x) = -5\cos(x) - 3\sin(x) + 2x + c$.'),
  -- sin_cos_primitiveren Q6
  ('sin_cos_primitiveren','f(x) = e^{x} + \cos(x)','1','Primitiveer termsgewijs: $\int e^x\,dx = e^x$ en $\int \cos(x)\,dx = \sin(x)$.'),
  ('sin_cos_primitiveren','f(x) = e^{x} + \cos(x)','2','$F(x) = e^x + \sin(x) + c$.'),
  -- f_ax_plus_b Q1
  ('f_ax_plus_b','f(x) = (2x + 1)^{3}','1','Gebruik: de primitieven van $f(ax+b)$ zijn $\dfrac{1}{a}F(ax+b) + c$. Hier $a = 2$.'),
  ('f_ax_plus_b','f(x) = (2x + 1)^{3}','2','$\int (2x+1)^3\,dx = \dfrac{1}{2} \cdot \dfrac{(2x+1)^4}{4} + c = \dfrac{(2x+1)^4}{8} + c$.'),
  -- f_ax_plus_b Q2
  ('f_ax_plus_b','f(x) = (3x + 4)^{5}','1','Gebruik: $\int (ax+b)^n\,dx = \dfrac{1}{a} \cdot \dfrac{(ax+b)^{n+1}}{n+1} + c$. Hier $a = 3$, $n = 5$.'),
  ('f_ax_plus_b','f(x) = (3x + 4)^{5}','2','$\int (3x+4)^5\,dx = \dfrac{1}{3} \cdot \dfrac{(3x+4)^6}{6} + c = \dfrac{(3x+4)^6}{18} + c$.'),
  -- f_ax_plus_b Q3
  ('f_ax_plus_b','f(x) = \sqrt{4x - 1}','1','Schrijf als macht: $\sqrt{4x-1} = (4x-1)^{\frac{1}{2}}$. Hier $a = 4$.'),
  ('f_ax_plus_b','f(x) = \sqrt{4x - 1}','2','$\int (4x-1)^{\frac{1}{2}}\,dx = \dfrac{1}{4} \cdot \dfrac{(4x-1)^{\frac{3}{2}}}{\frac{3}{2}} + c = \dfrac{(4x-1)^{\frac{3}{2}}}{6} + c$.'),
  ('f_ax_plus_b','f(x) = \sqrt{4x - 1}','3','Schrijf terug: $F(x) = \dfrac{(4x-1)\sqrt{4x-1}}{6} + c$.'),
  -- f_ax_plus_b Q4
  ('f_ax_plus_b','f(x) = \dfrac{1}{(3x + 2)^{2}}','1','Schrijf als macht: $\dfrac{1}{(3x+2)^2} = (3x+2)^{-2}$. Hier $a = 3$.'),
  ('f_ax_plus_b','f(x) = \dfrac{1}{(3x + 2)^{2}}','2','$\int (3x+2)^{-2}\,dx = \dfrac{1}{3} \cdot \dfrac{(3x+2)^{-1}}{-1} + c = -\dfrac{1}{3(3x+2)} + c$.'),
  -- f_ax_plus_b Q5
  ('f_ax_plus_b','f(x) = e^{4x + 1}','1','Gebruik: $\int e^{ax+b}\,dx = \dfrac{1}{a}e^{ax+b} + c$. Hier $a = 4$.'),
  ('f_ax_plus_b','f(x) = e^{4x + 1}','2','$F(x) = \dfrac{e^{4x+1}}{4} + c$.'),
  -- f_ax_plus_b Q6
  ('f_ax_plus_b','f(x) = \sin(2x + \tfrac{1}{3}\pi)','1','Gebruik: $\int \sin(ax+b)\,dx = -\dfrac{1}{a}\cos(ax+b) + c$. Hier $a = 2$.'),
  ('f_ax_plus_b','f(x) = \sin(2x + \tfrac{1}{3}\pi)','2','$F(x) = -\dfrac{\cos(2x + \tfrac{1}{3}\pi)}{2} + c$.'),
  -- breuk_uitdelen Q1
  ('breuk_uitdelen','f(x) = \dfrac{x^{2} + 1}{x}','1','Deel de teller door de noemer: $\dfrac{x^2+1}{x} = x + \dfrac{1}{x}$.'),
  ('breuk_uitdelen','f(x) = \dfrac{x^{2} + 1}{x}','2','Primitiveer: $\int x\,dx = \tfrac{1}{2}x^2$ en $\int \dfrac{1}{x}\,dx = \ln|x|$.'),
  ('breuk_uitdelen','f(x) = \dfrac{x^{2} + 1}{x}','3','$F(x) = \tfrac{1}{2}x^2 + \ln|x| + c$.'),
  -- breuk_uitdelen Q2
  ('breuk_uitdelen','f(x) = \dfrac{2x + 6}{x^{2}}','1','Deel de teller door de noemer: $\dfrac{2x+6}{x^2} = \dfrac{2}{x} + \dfrac{6}{x^2} = 2x^{-1} + 6x^{-2}$.'),
  ('breuk_uitdelen','f(x) = \dfrac{2x + 6}{x^{2}}','2','Primitiveer: $\int \dfrac{2}{x}\,dx = 2\ln|x|$ en $\int 6x^{-2}\,dx = -6x^{-1}$.'),
  ('breuk_uitdelen','f(x) = \dfrac{2x + 6}{x^{2}}','3','$F(x) = 2\ln|x| - \dfrac{6}{x} + c$.'),
  -- breuk_uitdelen Q3
  ('breuk_uitdelen','f(x) = \dfrac{x^{6} + 2x^{2} + 7}{x^{2}}','1','Deel uit: $\dfrac{x^6+2x^2+7}{x^2} = x^4 + 2 + 7x^{-2}$.'),
  ('breuk_uitdelen','f(x) = \dfrac{x^{6} + 2x^{2} + 7}{x^{2}}','2','Primitiveer: $\int x^4\,dx = \tfrac{1}{5}x^5$, $\int 2\,dx = 2x$, $\int 7x^{-2}\,dx = -7x^{-1}$.'),
  ('breuk_uitdelen','f(x) = \dfrac{x^{6} + 2x^{2} + 7}{x^{2}}','3','$F(x) = \tfrac{1}{5}x^5 + 2x - \dfrac{7}{x} + c$.'),
  -- breuk_uitdelen Q4
  ('breuk_uitdelen','f(x) = \dfrac{x^{4} - 2x}{2x^{3}}','1','Deel uit: $\dfrac{x^4-2x}{2x^3} = \dfrac{x}{2} - \dfrac{1}{x^2} = \tfrac{1}{2}x - x^{-2}$.'),
  ('breuk_uitdelen','f(x) = \dfrac{x^{4} - 2x}{2x^{3}}','2','Primitiveer: $\int \tfrac{1}{2}x\,dx = \tfrac{1}{4}x^2$ en $\int -x^{-2}\,dx = x^{-1}$.'),
  ('breuk_uitdelen','f(x) = \dfrac{x^{4} - 2x}{2x^{3}}','3','$F(x) = \tfrac{1}{4}x^2 + \dfrac{1}{x} + c$.'),
  -- breuk_uitdelen Q5
  ('breuk_uitdelen','f(x) = \dfrac{x^{3} + 2}{x^{4}}','1','Deel uit: $\dfrac{x^3+2}{x^4} = x^{-1} + 2x^{-4}$.'),
  ('breuk_uitdelen','f(x) = \dfrac{x^{3} + 2}{x^{4}}','2','Primitiveer: $\int x^{-1}\,dx = \ln|x|$ en $\int 2x^{-4}\,dx = -\tfrac{2}{3}x^{-3}$.'),
  ('breuk_uitdelen','f(x) = \dfrac{x^{3} + 2}{x^{4}}','3','$F(x) = \ln|x| - \dfrac{2}{3x^3} + c$.'),
  -- breuk_uitdelen Q6
  ('breuk_uitdelen','f(x) = \dfrac{-x^{2} + 2x + 3}{x^{4}}','1','Deel uit: $\dfrac{-x^2+2x+3}{x^4} = -x^{-2} + 2x^{-3} + 3x^{-4}$.'),
  ('breuk_uitdelen','f(x) = \dfrac{-x^{2} + 2x + 3}{x^{4}}','2','Primitiveer: $\int -x^{-2}\,dx = x^{-1}$, $\int 2x^{-3}\,dx = -x^{-2}$, $\int 3x^{-4}\,dx = -x^{-3}$.'),
  ('breuk_uitdelen','f(x) = \dfrac{-x^{2} + 2x + 3}{x^{4}}','3','$F(x) = \dfrac{1}{x} - \dfrac{1}{x^2} - \dfrac{1}{x^3} + c$.'),
  -- toon_aan_primitieve Q1  (F'(x) → doubled quote in SQL)
  ('toon_aan_primitieve','Toon aan dat $F(x) = x^{3} + 7$ een primitieve is van $f(x) = 3x^{2}$.','1','Differentieer $F(x) = x^3 + 7$: $F''(x) = 3x^2$.'),
  ('toon_aan_primitieve','Toon aan dat $F(x) = x^{3} + 7$ een primitieve is van $f(x) = 3x^{2}$.','2','$F''(x) = 3x^2 = f(x)$, dus $F$ is een primitieve van $f$. $\checkmark$'),
  -- toon_aan_primitieve Q2
  ('toon_aan_primitieve','Toon aan dat $F(x) = \tfrac{1}{5}x^{5}$ een primitieve is van $f(x) = x^{4}$.','1','Differentieer $F(x) = \tfrac{1}{5}x^5$: $F''(x) = x^4$.'),
  ('toon_aan_primitieve','Toon aan dat $F(x) = \tfrac{1}{5}x^{5}$ een primitieve is van $f(x) = x^{4}$.','2','$F''(x) = x^4 = f(x)$, dus $F$ is een primitieve van $f$. $\checkmark$'),
  -- toon_aan_primitieve Q3
  ('toon_aan_primitieve','Toon aan dat $F(x) = (x^{2}+1)^{6}+1$ een primitieve is van $f(x) = 12x(x^{2}+1)^{5}$.','1','Differentieer $F(x) = (x^2+1)^6 + 1$ met de kettingregel: $F''(x) = 6(x^2+1)^5 \cdot 2x = 12x(x^2+1)^5$.'),
  ('toon_aan_primitieve','Toon aan dat $F(x) = (x^{2}+1)^{6}+1$ een primitieve is van $f(x) = 12x(x^{2}+1)^{5}$.','2','$F''(x) = 12x(x^2+1)^5 = f(x)$, dus $F$ is een primitieve van $f$. $\checkmark$'),
  -- toon_aan_primitieve Q4
  ('toon_aan_primitieve','Toon aan dat $F(x) = x \cdot e^{x} - e^{x}$ een primitieve is van $f(x) = x \cdot e^{x}$.','1','Differentieer $F(x) = xe^x - e^x$ met de productregel: $F''(x) = e^x + xe^x - e^x = xe^x$.'),
  ('toon_aan_primitieve','Toon aan dat $F(x) = x \cdot e^{x} - e^{x}$ een primitieve is van $f(x) = x \cdot e^{x}$.','2','$F''(x) = xe^x = f(x)$, dus $F$ is een primitieve van $f$. $\checkmark$'),
  -- toon_aan_primitieve Q5
  ('toon_aan_primitieve','Toon aan dat $F(x) = x\ln(x) - x$ een primitieve is van $f(x) = \ln(x)$.','1','Differentieer $F(x) = x\ln(x) - x$ met de productregel: $F''(x) = \ln(x) + x \cdot \tfrac{1}{x} - 1 = \ln(x) + 1 - 1 = \ln(x)$.'),
  ('toon_aan_primitieve','Toon aan dat $F(x) = x\ln(x) - x$ een primitieve is van $f(x) = \ln(x)$.','2','$F''(x) = \ln(x) = f(x)$, dus $F$ is een primitieve van $f$. $\checkmark$'),
  -- toon_aan_primitieve Q6
  ('toon_aan_primitieve','Toon aan dat $F(x) = \sin^{3}(x)$ een primitieve is van $f(x) = 3\sin^{2}(x)\cos(x)$.','1','Differentieer $F(x) = \sin^3(x)$ met de kettingregel: $F''(x) = 3\sin^2(x) \cdot \cos(x)$.'),
  ('toon_aan_primitieve','Toon aan dat $F(x) = \sin^{3}(x)$ een primitieve is van $f(x) = 3\sin^{2}(x)\cos(x)$.','2','$F''(x) = 3\sin^2(x)\cos(x) = f(x)$, dus $F$ is een primitieve van $f$. $\checkmark$'),
  -- c_bepalen Q1
  ('c_bepalen','$f(x) = 2x - 3$. De grafiek van een primitieve $F$ gaat door het punt $(0, 5)$. Bereken $F(x)$.','1','Primitiveer: $F(x) = x^2 - 3x + c$.'),
  ('c_bepalen','$f(x) = 2x - 3$. De grafiek van een primitieve $F$ gaat door het punt $(0, 5)$. Bereken $F(x)$.','2','Gebruik $F(0) = 5$: $0 - 0 + c = 5$, dus $c = 5$.'),
  ('c_bepalen','$f(x) = 2x - 3$. De grafiek van een primitieve $F$ gaat door het punt $(0, 5)$. Bereken $F(x)$.','3','$F(x) = x^2 - 3x + 5$.'),
  -- c_bepalen Q2
  ('c_bepalen','$f(x) = 3x^{2}$. De grafiek van een primitieve $F$ gaat door het punt $(2, 15)$. Bereken $F(x)$.','1','Primitiveer: $F(x) = x^3 + c$.'),
  ('c_bepalen','$f(x) = 3x^{2}$. De grafiek van een primitieve $F$ gaat door het punt $(2, 15)$. Bereken $F(x)$.','2','Gebruik $F(2) = 15$: $8 + c = 15$, dus $c = 7$.'),
  ('c_bepalen','$f(x) = 3x^{2}$. De grafiek van een primitieve $F$ gaat door het punt $(2, 15)$. Bereken $F(x)$.','3','$F(x) = x^3 + 7$.'),
  -- c_bepalen Q3
  ('c_bepalen','$f(x) = 4x - 1$. De grafiek van een primitieve $F$ gaat door het punt $(1, 7)$. Bereken $F(x)$.','1','Primitiveer: $F(x) = 2x^2 - x + c$.'),
  ('c_bepalen','$f(x) = 4x - 1$. De grafiek van een primitieve $F$ gaat door het punt $(1, 7)$. Bereken $F(x)$.','2','Gebruik $F(1) = 7$: $2 - 1 + c = 7$, dus $c = 6$.'),
  ('c_bepalen','$f(x) = 4x - 1$. De grafiek van een primitieve $F$ gaat door het punt $(1, 7)$. Bereken $F(x)$.','3','$F(x) = 2x^2 - x + 6$.'),
  -- c_bepalen Q4
  ('c_bepalen','$f(x) = e^{x}$. De grafiek van een primitieve $F$ gaat door het punt $(0, 3)$. Bereken $F(x)$.','1','Primitiveer: $F(x) = e^x + c$.'),
  ('c_bepalen','$f(x) = e^{x}$. De grafiek van een primitieve $F$ gaat door het punt $(0, 3)$. Bereken $F(x)$.','2','Gebruik $F(0) = 3$: $e^0 + c = 1 + c = 3$, dus $c = 2$.'),
  ('c_bepalen','$f(x) = e^{x}$. De grafiek van een primitieve $F$ gaat door het punt $(0, 3)$. Bereken $F(x)$.','3','$F(x) = e^x + 2$.'),
  -- c_bepalen Q5
  ('c_bepalen','$f(x) = (x^{2}-1)^{2}$. De grafiek van $F$ gaat door $(1, 7)$. Bereken $F(x)$.','1','Werk eerst uit: $(x^2-1)^2 = x^4 - 2x^2 + 1$. Primitiveer: $F(x) = \tfrac{1}{5}x^5 - \tfrac{2}{3}x^3 + x + c$.'),
  ('c_bepalen','$f(x) = (x^{2}-1)^{2}$. De grafiek van $F$ gaat door $(1, 7)$. Bereken $F(x)$.','2','Gebruik $F(1) = 7$: $\tfrac{1}{5} - \tfrac{2}{3} + 1 + c = 7$, dus $\tfrac{8}{15} + c = 7$, $c = 6\tfrac{7}{15}$.'),
  ('c_bepalen','$f(x) = (x^{2}-1)^{2}$. De grafiek van $F$ gaat door $(1, 7)$. Bereken $F(x)$.','3','$F(x) = \tfrac{1}{5}x^5 - \tfrac{2}{3}x^3 + x + 6\tfrac{7}{15}$.'),
  -- c_bepalen Q6
  ('c_bepalen','$f(x) = 4x - \ln(x)$. De grafiek van $F$ gaat door $(1, 0)$. Bereken $F(x)$.','1','Primitiveer: $\int 4x\,dx = 2x^2$ en $\int \ln(x)\,dx = x\ln(x) - x$. Dus $F(x) = 2x^2 - (x\ln(x) - x) + c = 2x^2 - x\ln(x) + x + c$.'),
  ('c_bepalen','$f(x) = 4x - \ln(x)$. De grafiek van $F$ gaat door $(1, 0)$. Bereken $F(x)$.','2','Gebruik $F(1) = 0$: $2 - 0 + 1 + c = 0$, dus $c = -3$.'),
  ('c_bepalen','$f(x) = 4x - \ln(x)$. De grafiek van $F$ gaat door $(1, 0)$. Bereken $F(x)$.','3','$F(x) = 2x^2 - x\ln(x) + x - 3$.')
) AS v(cluster_slug, question_latex_body, step_order, step_description)
JOIN public.topic_clusters_new c ON c.slug = v.cluster_slug AND c.site = 'integralen'
JOIN public.questions_new q ON q.cluster_id = c.id AND q.latex_body = v.question_latex_body;

COMMIT;
