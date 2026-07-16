BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0024: h11 integralen + vergelijkingen + toepassingen
-- 18 topics, 18 clusters, 108 questions, ~142 steps
--
-- Data notes:
--   • opp_grafiek Q1 (f(x)=4-x²): CSV answer was 16/3 (wrong). Corrected to
--     32/3 — integral runs from x=-2 to x=2, confirmed by steps.
--   • opp_tussen Q4-Q6: steps are shifted (Q4 steps contain Q5 math, etc.).
--     Steps omitted for opp_tussen Q4-Q6.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Topics ───────────────────────────────────────────────────────────────────
INSERT INTO public.topics_new
  (site, chapter_id, slug, title, order_index, is_unlocked_by_default, category)
SELECT 'integralen', ch.id, v.slug, v.title, v.order_index, false, v.category
FROM (VALUES
  ('h11_machten_int',  'Polynoom-integralen',              10, 'integralen'),
  ('h11_wortels_int',  'Integralen met wortels en breuken',11, 'integralen'),
  ('h11_e_ln_int',     'Integralen met e en ln',           12, 'integralen'),
  ('h11_gonio_int',    'Goniometrische integralen',        13, 'integralen'),
  ('h11_ketting_int',  'Integralen met f(ax+b)',           14, 'integralen'),
  ('h11_uitdelen_int', 'Integralen met uitdelen',          15, 'integralen'),
  ('h11_subst_ex',     'Substitutie met e-machten',        16, 'vergelijkingen'),
  ('h11_subst_px',     'Substitutie met machten',          17, 'vergelijkingen'),
  ('h11_ln_nemen',     'Ln nemen en e-macht nemen',        18, 'vergelijkingen'),
  ('h11_ontbinden',    'Ontbinden in factoren',            19, 'vergelijkingen'),
  ('h11_int_waarde',   'Integraal is gegeven waarde',      20, 'vergelijkingen'),
  ('h11_twee_int',     'Twee integralen vergelijken',      21, 'vergelijkingen'),
  ('h11_opp_grafiek',  'Oppervlakte onder grafiek',        22, 'toepassingen'),
  ('h11_opp_tussen',   'Oppervlakte tussen grafieken',     23, 'toepassingen'),
  ('h11_opp_xas',      'Oppervlakte met opsplitsen',       24, 'toepassingen'),
  ('h11_inhoud',       'Inhoud omwentelingslichaam',       25, 'toepassingen'),
  ('h11_afstand',      'Afstand uit snelheid',             26, 'toepassingen'),
  ('h11_gemiddelde',   'Gemiddelde waarde',                27, 'toepassingen')
) AS v(slug, title, order_index, category)
CROSS JOIN (
  SELECT id FROM public.chapters WHERE site = 'integralen' AND slug = 'h11'
) ch;

-- ── Clusters ─────────────────────────────────────────────────────────────────
INSERT INTO public.topic_clusters_new (site, topic_id, slug, title, order_index)
SELECT 'integralen', t.id, v.cluster_slug, v.cluster_title, 1
FROM (VALUES
  ('h11_machten_int',  'machten_integraal',       'Machten Integraal'),
  ('h11_wortels_int',  'wortels_breuken_integraal','Wortels Breuken Integraal'),
  ('h11_e_ln_int',     'e_ln_integraal',           'E Ln Integraal'),
  ('h11_gonio_int',    'gonio_integraal',           'Gonio Integraal'),
  ('h11_ketting_int',  'kettingregel_integraal',    'Kettingregel Integraal'),
  ('h11_uitdelen_int', 'uitdelen_integraal',        'Uitdelen Integraal'),
  ('h11_subst_ex',     'substitutie_ex',            'Substitutie Ex'),
  ('h11_subst_px',     'substitutie_px',            'Substitutie Px'),
  ('h11_ln_nemen',     'ln_nemen',                  'Ln Nemen'),
  ('h11_ontbinden',    'ontbinden',                 'Ontbinden'),
  ('h11_int_waarde',   'integraal_is_waarde',       'Integraal Is Waarde'),
  ('h11_twee_int',     'twee_integralen',            'Twee Integralen'),
  ('h11_opp_grafiek',  'opp_onder_grafiek',          'Opp Onder Grafiek'),
  ('h11_opp_tussen',   'opp_tussen_grafieken',       'Opp Tussen Grafieken'),
  ('h11_opp_xas',      'opp_onder_xas',              'Opp Onder Xas'),
  ('h11_inhoud',       'inhoud_omwenteling',         'Inhoud Omwenteling'),
  ('h11_afstand',      'afstand_snelheid',           'Afstand Snelheid'),
  ('h11_gemiddelde',   'gemiddelde_waarde',          'Gemiddelde Waarde')
) AS v(topic_slug, cluster_slug, cluster_title)
JOIN public.topics_new t ON t.site = 'integralen' AND t.slug = v.topic_slug;

-- ── Questions: integralen ─────────────────────────────────────────────────────
INSERT INTO public.questions_new
  (site, topic_id, cluster_id, latex_body, answer, latex_answer, difficulty, is_ai_generated, order_index, answer_alternatives)
SELECT 'integralen', t.id, c.id, v.latex_body, v.answer, v.latex_answer, v.difficulty, true, v.order_index, '{}'::text[]
FROM (VALUES
  -- h11_machten_int
  ('h11_machten_int','machten_integraal','\int_{0}^{2} 3x^{2}\,dx','8','8',1,1),
  ('h11_machten_int','machten_integraal','\int_{1}^{3} 2x\,dx','8','8',1,2),
  ('h11_machten_int','machten_integraal','\int_{0}^{1} (6x^{2} - 4x + 3)\,dx','3','3',2,3),
  ('h11_machten_int','machten_integraal','\int_{-1}^{2} (x^{2} + x)\,dx','9/2','\frac{9}{2}',2,4),
  ('h11_machten_int','machten_integraal','\int_{1}^{4} (x^{3} - 3x^{2} + 2)\,dx','27/4','\frac{27}{4}',3,5),
  ('h11_machten_int','machten_integraal','\int_{-2}^{1} (x^{3} + 2x^{2} - x)\,dx','15/4','\frac{15}{4}',3,6),
  -- h11_wortels_int
  ('h11_wortels_int','wortels_breuken_integraal','\int_{1}^{4} \sqrt{x}\,dx','14/3','\frac{14}{3}',1,1),
  ('h11_wortels_int','wortels_breuken_integraal','\int_{1}^{2} \dfrac{1}{x^{2}}\,dx','1/2','\frac{1}{2}',1,2),
  ('h11_wortels_int','wortels_breuken_integraal','\int_{1}^{9} \sqrt{x}\,dx','52/3','\frac{52}{3}',2,3),
  ('h11_wortels_int','wortels_breuken_integraal','\int_{1}^{4} \left(\sqrt{x} + \dfrac{1}{x^{2}}\right)\,dx','65/12','\frac{65}{12}',2,4),
  ('h11_wortels_int','wortels_breuken_integraal','\int_{0}^{4} x\sqrt{x}\,dx','64/5','\frac{64}{5}',3,5),
  ('h11_wortels_int','wortels_breuken_integraal','\int_{1}^{4} \dfrac{3}{x^{4}}\,dx','63/64','\frac{63}{64}',3,6),
  -- h11_e_ln_int
  ('h11_e_ln_int','e_ln_integraal','\int_{0}^{1} e^{x}\,dx','e - 1','-1 + e',1,1),
  ('h11_e_ln_int','e_ln_integraal','\int_{1}^{e} \dfrac{1}{x}\,dx','1','1',1,2),
  ('h11_e_ln_int','e_ln_integraal','\int_{0}^{2} 3e^{x}\,dx','-3 + 3*exp(2)','-3 + 3 e^{2}',2,3),
  ('h11_e_ln_int','e_ln_integraal','\int_{1}^{e^{2}} \dfrac{2}{x}\,dx','4','4',2,4),
  ('h11_e_ln_int','e_ln_integraal','\int_{0}^{1} (e^{x} + x^{2})\,dx','e - 2/3','- \frac{2}{3} + e',3,5),
  ('h11_e_ln_int','e_ln_integraal','\int_{0}^{\ln(3)} e^{x}\,dx','2','2',3,6),
  -- h11_gonio_int
  ('h11_gonio_int','gonio_integraal','\int_{0}^{\pi} \sin(x)\,dx','2','2',1,1),
  ('h11_gonio_int','gonio_integraal','\int_{0}^{\frac{1}{2}\pi} \cos(x)\,dx','1','1',1,2),
  ('h11_gonio_int','gonio_integraal','\int_{0}^{\pi} (1 + \sin(x))\,dx','2 + pi','2 + \pi',2,3),
  ('h11_gonio_int','gonio_integraal','\int_{0}^{\frac{1}{2}\pi} (2\cos(x) - 1)\,dx','2 - pi/2','2 - \frac{\pi}{2}',2,4),
  ('h11_gonio_int','gonio_integraal','\int_{\frac{1}{4}\pi}^{\frac{3}{4}\pi} \sin(x)\,dx','sqrt(2)','\sqrt{2}',3,5),
  ('h11_gonio_int','gonio_integraal','\int_{0}^{\pi} (\sin(x) + \cos(x))\,dx','2','2',3,6),
  -- h11_ketting_int
  ('h11_ketting_int','kettingregel_integraal','\int_{0}^{1} (2x+1)^{3}\,dx','10','10',1,1),
  ('h11_ketting_int','kettingregel_integraal','\int_{0}^{1} e^{2x}\,dx','-1/2 + exp(2)/2','- \frac{1}{2} + \frac{e^{2}}{2}',1,2),
  ('h11_ketting_int','kettingregel_integraal','\int_{0}^{\frac{1}{2}\pi} \sin(2x)\,dx','1','1',2,3),
  ('h11_ketting_int','kettingregel_integraal','\int_{1}^{2} \dfrac{1}{(3x-1)^{2}}\,dx','1/10','\frac{1}{10}',2,4),
  ('h11_ketting_int','kettingregel_integraal','\int_{0}^{4} \sqrt{2x+1}\,dx','26/3','\frac{26}{3}',3,5),
  ('h11_ketting_int','kettingregel_integraal','\int_{0}^{1} e^{3x}\,dx','-1/3 + exp(3)/3','- \frac{1}{3} + \frac{e^{3}}{3}',3,6),
  -- h11_uitdelen_int
  ('h11_uitdelen_int','uitdelen_integraal','\int_{1}^{2} \dfrac{x^{2}+1}{x}\,dx','log(2) + 3/2','\log{\left(2 \right)} + \frac{3}{2}',1,1),
  ('h11_uitdelen_int','uitdelen_integraal','\int_{1}^{2} \dfrac{x^{2}+4}{x^{2}}\,dx','3','3',1,2),
  ('h11_uitdelen_int','uitdelen_integraal','\int_{1}^{4} \dfrac{x+1}{\sqrt{x}}\,dx','20/3','\frac{20}{3}',2,3),
  ('h11_uitdelen_int','uitdelen_integraal','\int_{1}^{3} \dfrac{2x^{3} + 1}{x^{2}}\,dx','26/3','\frac{26}{3}',2,4),
  ('h11_uitdelen_int','uitdelen_integraal','\int_{1}^{2} \dfrac{x^{4}-1}{x^{2}}\,dx','11/6','\frac{11}{6}',3,5),
  ('h11_uitdelen_int','uitdelen_integraal','\int_{1}^{4} \dfrac{2x+3}{x^{3}}\,dx','93/32','\frac{93}{32}',3,6)
) AS v(topic_slug, cluster_slug, latex_body, answer, latex_answer, difficulty, order_index)
JOIN public.topics_new t ON t.site = 'integralen' AND t.slug = v.topic_slug
JOIN public.topic_clusters_new c ON c.site = 'integralen' AND c.slug = v.cluster_slug AND c.topic_id = t.id;

-- ── Questions: vergelijkingen ─────────────────────────────────────────────────
INSERT INTO public.questions_new
  (site, topic_id, cluster_id, latex_body, answer, latex_answer, difficulty, is_ai_generated, order_index, answer_alternatives)
SELECT 'integralen', t.id, c.id, v.latex_body, v.answer, v.latex_answer, v.difficulty, true, v.order_index, '{}'::text[]
FROM (VALUES
  -- h11_subst_ex
  ('h11_subst_ex','substitutie_ex','Los exact op: $e^{2x} - 5e^{x} + 6 = 0$','x = ln(2) of x = ln(3)','x = \ln(2) \vee x = \ln(3)',1,1),
  ('h11_subst_ex','substitutie_ex','Los exact op: $e^{2x} - 4e^{x} + 3 = 0$','x = 0 of x = ln(3)','x = 0 \vee x = \ln(3)',1,2),
  ('h11_subst_ex','substitutie_ex','Los exact op: $e^{2x} + e^{x} - 6 = 0$','x = ln(2)','x = \ln(2)',2,3),
  ('h11_subst_ex','substitutie_ex','Los exact op: $2e^{2x} - 9e^{x} + 4 = 0$','x = ln(1/2) of x = ln(4)','x = -\ln(2) \vee x = \ln(4)',2,4),
  ('h11_subst_ex','substitutie_ex','Los exact op: $e^{2x} - 3e^{x} + 2 = 0$','x = 0 of x = ln(2)','x = 0 \vee x = \ln(2)',3,5),
  ('h11_subst_ex','substitutie_ex','Los exact op: $3e^{2x} - 10e^{x} + 3 = 0$','x = ln(1/3) of x = ln(3)','x = -\ln(3) \vee x = \ln(3)',3,6),
  -- h11_subst_px
  ('h11_subst_px','substitutie_px','Los exact op: $x^{4} - 5x^{2} + 4 = 0$','x = -2, -1, 1 of 2','x = -2 \vee x = -1 \vee x = 1 \vee x = 2',1,1),
  ('h11_subst_px','substitutie_px','Los exact op: $x^{4} - 13x^{2} + 36 = 0$','x = -3, -2, 2 of 3','x = -3 \vee x = -2 \vee x = 2 \vee x = 3',1,2),
  ('h11_subst_px','substitutie_px','Los exact op: $x^{4} - 10x^{2} + 9 = 0$','x = -3, -1, 1 of 3','x = -3 \vee x = -1 \vee x = 1 \vee x = 3',2,3),
  ('h11_subst_px','substitutie_px','Los exact op: $p^{4} - 4p^{2} + 2 = 0$','p = ±sqrt(2-sqrt(2)) of p = ±sqrt(2+sqrt(2))','p = \pm\sqrt{2 - \sqrt{2}} \vee p = \pm\sqrt{2 + \sqrt{2}}',2,4),
  ('h11_subst_px','substitutie_px','Los exact op: $x^{4} + 2x^{2} - 8 = 0$','x = -sqrt(2) of x = sqrt(2)','x = -\sqrt{2} \vee x = \sqrt{2}',3,5),
  ('h11_subst_px','substitutie_px','Los exact op: $2x^{4} - 5x^{2} - 3 = 0$','x = -sqrt(3) of x = sqrt(3)','x = -\sqrt{3} \vee x = \sqrt{3}',3,6),
  -- h11_ln_nemen
  ('h11_ln_nemen','ln_nemen','Los exact op: $e^{2x} = 5$','x = ln(5)/2','x = \tfrac{1}{2}\ln(5)',1,1),
  ('h11_ln_nemen','ln_nemen','Los exact op: $3^{x} = 7$','x = ln(7)/ln(3)','x = \dfrac{\ln(7)}{\ln(3)}',1,2),
  ('h11_ln_nemen','ln_nemen','Los exact op: $2 \cdot 5^{x} = 40$','x = ln(20)/ln(5)','x = \dfrac{\ln(20)}{\ln(5)}',2,3),
  ('h11_ln_nemen','ln_nemen','Los exact op: $\ln(x) = 3$','x = e^3','x = e^{3}',2,4),
  ('h11_ln_nemen','ln_nemen','Los exact op: $e^{3x-1} = 10$','x = (1 + ln(10))/3','x = \dfrac{1 + \ln(10)}{3}',3,5),
  ('h11_ln_nemen','ln_nemen','Los exact op: $2^{x+1} = 3^{x}$','x = ln(2)/(ln(3)-ln(2))','x = \dfrac{\ln(2)}{\ln(3) - \ln(2)}',3,6),
  -- h11_ontbinden
  ('h11_ontbinden','ontbinden','Los exact op: $x \cdot e^{x} = 0$','x = 0','x = 0',1,1),
  ('h11_ontbinden','ontbinden','Los exact op: $x^{2} e^{x} - 4e^{x} = 0$','x = -2 of x = 2','x = -2 \vee x = 2',1,2),
  ('h11_ontbinden','ontbinden','Los exact op: $x^{2}\ln(x) - 4\ln(x) = 0$','x = 1 of x = 2','x = 1 \vee x = 2',2,3),
  ('h11_ontbinden','ontbinden','Los exact op: $xe^{x} + 2e^{x} = 0$','x = -2','x = -2',2,4),
  ('h11_ontbinden','ontbinden','Los exact op: $3x^{2}e^{x} - xe^{x} = 0$','x = 0 of x = 1/3','x = 0 \vee x = \tfrac{1}{3}',3,5),
  ('h11_ontbinden','ontbinden','Los exact op: $(x-1)\ln(x) + (x-1) = 0$','x = 1 of x = e^(-1)','x = 1 \vee x = e^{-1}',3,6),
  -- h11_int_waarde
  ('h11_int_waarde','integraal_is_waarde','$\int_{0}^{p} 3x^{2}\,dx = 8$. Bereken $p$.','p = 2','p = 2',1,1),
  ('h11_int_waarde','integraal_is_waarde','$\int_{0}^{p} 2x\,dx = 9$. Bereken $p$ met $p > 0$.','p = 3','p = 3',1,2),
  ('h11_int_waarde','integraal_is_waarde','$\int_{0}^{p} (4x - 1)\,dx = 3$. Bereken exact $p$ met $p > 0$.','p = 3/2','p = \tfrac{3}{2}',2,3),
  ('h11_int_waarde','integraal_is_waarde','$\int_{0}^{p} e^{x}\,dx = 5$. Bereken exact $p$.','p = ln(6)','p = \ln(6)',2,4),
  ('h11_int_waarde','integraal_is_waarde','$\int_{1}^{p} \dfrac{1}{x}\,dx = 3$. Bereken exact $p$.','p = e^3','p = e^{3}',3,5),
  ('h11_int_waarde','integraal_is_waarde','$\int_{0}^{p} (3x^{2} - x^{3})\,dx = 6\tfrac{3}{4}$. Bereken $p$ met $p > 0$.','p = 3','p = 3',3,6),
  -- h11_twee_int
  ('h11_twee_int','twee_integralen','$f(x) = 4-x^{2}$. De lijn $x = p$ met $0 < p < 2$ verdeelt het vlakdeel tussen de grafiek en de $x$-as in twee gelijke delen. Bereken $p$.','p ≈ 0,69 (numeriek)','p \approx 0{,}69',2,1),
  ('h11_twee_int','twee_integralen','$f(x) = x^{2}$ op $[0, 3]$. De lijn $x = p$ verdeelt het vlakdeel onder de grafiek in twee gelijke delen. Bereken exact $p$.','p = 3/cbrt(2)','p = \dfrac{3}{\sqrt[3]{2}}',2,2),
  ('h11_twee_int','twee_integralen','$f(x) = e^{x}$ op $[0, p]$ en $[p, 2p]$. Bereken voor welke $p$ geldt $O(W) = 2 \cdot O(V)$ met $V$ het vlakdeel op $[0, p]$ en $W$ op $[p, 2p]$.','p = ln(2)','p = \ln(2)',3,3),
  ('h11_twee_int','twee_integralen','$f(x) = \sqrt{x}$. Bereken exact voor welke $p$ geldt $\int_{0}^{p} \sqrt{x}\,dx = 18$.','p = 9','p = 9',1,4),
  ('h11_twee_int','twee_integralen','$f(x) = \dfrac{1}{x}$ op $[1, p]$ met $p > 1$. Bereken voor welke $p$ de oppervlakte gelijk is aan $2$.','p = e^2','p = e^{2}',2,5),
  ('h11_twee_int','twee_integralen','$f(x) = 3x^{2} - x^{3}$. De lijn $x = p$ met $0 < p < 3$ verdeelt het vlakdeel tussen de grafiek en de $x$-as in twee gelijke delen. Bereken $p$ op twee decimalen.','p ≈ 1,84','p \approx 1{,}84',3,6)
) AS v(topic_slug, cluster_slug, latex_body, answer, latex_answer, difficulty, order_index)
JOIN public.topics_new t ON t.site = 'integralen' AND t.slug = v.topic_slug
JOIN public.topic_clusters_new c ON c.site = 'integralen' AND c.slug = v.cluster_slug AND c.topic_id = t.id;

-- ── Questions: toepassingen ───────────────────────────────────────────────────
INSERT INTO public.questions_new
  (site, topic_id, cluster_id, latex_body, answer, latex_answer, difficulty, is_ai_generated, order_index, answer_alternatives)
SELECT 'integralen', t.id, c.id, v.latex_body, v.answer, v.latex_answer, v.difficulty, true, v.order_index, '{}'::text[]
FROM (VALUES
  -- h11_opp_grafiek (Q1 answer corrected from 16/3 to 32/3)
  ('h11_opp_grafiek','opp_onder_grafiek','Gegeven is $f(x) = 4 - x^{2}$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafiek van $f$ en de $x$-as.','32/3','\tfrac{32}{3}',1,1),
  ('h11_opp_grafiek','opp_onder_grafiek','Gegeven is $f(x) = 3x^{2} - x^{3}$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafiek van $f$ en de $x$-as.','27/4','\tfrac{27}{4}',1,2),
  ('h11_opp_grafiek','opp_onder_grafiek','Gegeven is $f(x) = x^{2} - 4x$. Het vlakdeel $V$ wordt ingesloten door de grafiek van $f$ en de $x$-as. Bereken exact $O(V)$.','32/3','\tfrac{32}{3}',2,3),
  ('h11_opp_grafiek','opp_onder_grafiek','Gegeven is $f(x) = e^{x}$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafiek van $f$, de $x$-as, de $y$-as en de lijn $x = 2$.','e^2 - 1','e^{2} - 1',2,4),
  ('h11_opp_grafiek','opp_onder_grafiek','Gegeven is $f(x) = \dfrac{1}{x}$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafiek van $f$, de $x$-as en de lijnen $x = 1$ en $x = e^{3}$.','3','3',3,5),
  ('h11_opp_grafiek','opp_onder_grafiek','Gegeven is $f(x) = 6x - x^{2}$. Het vlakdeel $V$ wordt ingesloten door de grafiek van $f$ en de $x$-as. Bereken exact $O(V)$.','36','36',3,6),
  -- h11_opp_tussen
  ('h11_opp_tussen','opp_tussen_grafieken','Gegeven zijn $f(x) = x^{2}$ en $g(x) = x$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafieken van $f$ en $g$.','1/6','\tfrac{1}{6}',1,1),
  ('h11_opp_tussen','opp_tussen_grafieken','Gegeven zijn $f(x) = 6x - x^{2}$ en $g(x) = x$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafieken van $f$ en $g$.','125/6','\tfrac{125}{6}',1,2),
  ('h11_opp_tussen','opp_tussen_grafieken','Gegeven zijn $f(x) = 4 - x^{2}$ en $g(x) = x + 2$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafieken.','9/2','\tfrac{9}{2}',2,3),
  ('h11_opp_tussen','opp_tussen_grafieken','Gegeven zijn $f(x) = e^{x}$ en $g(x) = 1$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafieken en de $y$-as.','e - 2','e - 2',2,4),
  ('h11_opp_tussen','opp_tussen_grafieken','Gegeven zijn $f(x) = x^{2} + 2$ en $g(x) = 2x + 2$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafieken.','4/3','\tfrac{4}{3}',2,5),
  ('h11_opp_tussen','opp_tussen_grafieken','Gegeven zijn $f(x) = \sqrt{x}$ en $g(x) = x^{2}$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafieken.','1/3','\tfrac{1}{3}',3,6),
  -- h11_opp_xas
  ('h11_opp_xas','opp_onder_xas','Gegeven is $f(x) = x^{2} - 1$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafiek van $f$ en de $x$-as.','4/3','\tfrac{4}{3}',1,1),
  ('h11_opp_xas','opp_onder_xas','Gegeven is $f(x) = x^{3} - 4x$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafiek van $f$ en de $x$-as voor $x \geq 0$.','4','4',1,2),
  ('h11_opp_xas','opp_onder_xas','Gegeven is $f(x) = x^{2} - 4x + 3$. Bereken exact de oppervlakte van het vlakdeel tussen de grafiek van $f$ en de $x$-as.','4/3','\tfrac{4}{3}',2,3),
  ('h11_opp_xas','opp_onder_xas','Gegeven is $f(x) = \sin(x)$ met domein $[0, 2\pi]$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafiek en de $x$-as.','4','4',2,4),
  ('h11_opp_xas','opp_onder_xas','Gegeven is $f(x) = x^{3} - x$. Bereken exact de totale oppervlakte van de vlakdelen ingesloten door de grafiek van $f$ en de $x$-as.','1/2','\tfrac{1}{2}',3,5),
  ('h11_opp_xas','opp_onder_xas','Gegeven is $f(x) = x^{3} - 4x^{2} + 3x$. Bereken exact de totale oppervlakte van de vlakdelen ingesloten door de grafiek van $f$ en de $x$-as.','37/12','\tfrac{37}{12}',3,6),
  -- h11_inhoud
  ('h11_inhoud','inhoud_omwenteling','Gegeven is $f(x) = x$. Het vlakdeel ingesloten door de grafiek, de $x$-as en de lijn $x = 3$ wordt gewenteld om de $x$-as. Bereken exact de inhoud.','9 pi','9\pi',1,1),
  ('h11_inhoud','inhoud_omwenteling','Gegeven is $f(x) = \sqrt{x}$. Het vlakdeel ingesloten door de grafiek, de $x$-as en de lijn $x = 4$ wordt gewenteld om de $x$-as. Bereken exact de inhoud.','8 pi','8\pi',1,2),
  ('h11_inhoud','inhoud_omwenteling','Gegeven is $f(x) = x^{2}$. Het vlakdeel ingesloten door de grafiek, de $x$-as en de lijn $x = 2$ wordt gewenteld om de $x$-as. Bereken exact de inhoud.','32 pi/5','\tfrac{32}{5}\pi',2,3),
  ('h11_inhoud','inhoud_omwenteling','Gegeven is $f(x) = e^{x}$. Het vlakdeel ingesloten door de grafiek, de $x$-as, de $y$-as en de lijn $x = 1$ wordt gewenteld om de $x$-as. Bereken exact de inhoud.','pi(e^2-1)/2','\tfrac{\pi(e^{2} - 1)}{2}',2,4),
  ('h11_inhoud','inhoud_omwenteling','Bewijs met integraalrekening dat de inhoud van een bol met straal $r$ gelijk is aan $\tfrac{4}{3}\pi r^{3}$.','4/3 pi r^3','\tfrac{4}{3}\pi r^{3}',3,5),
  ('h11_inhoud','inhoud_omwenteling','Gegeven is $f(x) = 9 - x^{2}$. Het vlakdeel ingesloten door de grafiek en de $x$-as wordt gewenteld om de $x$-as. Bereken exact de inhoud.','1296 pi/5','\tfrac{1296}{5}\pi',3,6),
  -- h11_afstand
  ('h11_afstand','afstand_snelheid','De snelheid van een voorwerp is $v(t) = 3t^{2}$ m/s. Bereken de afgelegde afstand in de eerste $4$ seconden.','64','64',1,1),
  ('h11_afstand','afstand_snelheid','De snelheid van een voorwerp is $v(t) = 2t + 1$ m/s. Bereken de afgelegde afstand in het interval $[1, 5]$.','28','28',1,2),
  ('h11_afstand','afstand_snelheid','De snelheid van een voorwerp is $v(t) = 10 - 2t$ m/s. Het voorwerp begint op $t = 0$. Bereken de afgelegde afstand tot het voorwerp stilstaat.','25','25',2,3),
  ('h11_afstand','afstand_snelheid','De snelheid van een voorwerp is $v(t) = e^{t}$ m/s. Bereken exact de afgelegde afstand in de eerste $3$ seconden.','e^3 - 1','e^{3} - 1',2,4),
  ('h11_afstand','afstand_snelheid','De versnelling van een voorwerp is $a(t) = 6t$ m/s$^{2}$ en $v(0) = 2$ m/s. Bereken de afgelegde afstand in de eerste $3$ seconden.','33','33',3,5),
  ('h11_afstand','afstand_snelheid','De snelheid van een voorwerp is $v(t) = -\tfrac{1}{2}t^{2} + 2t + 1$ m/s. Bereken exact de afgelegde afstand op het interval $[1, 4]$.','15/2','\tfrac{15}{2}',3,6),
  -- h11_gemiddelde
  ('h11_gemiddelde','gemiddelde_waarde','Bereken de gemiddelde waarde van $f(x) = x^{2}$ op het interval $[0, 3]$.','3','3',1,1),
  ('h11_gemiddelde','gemiddelde_waarde','Bereken de gemiddelde waarde van $f(x) = 2x + 1$ op het interval $[0, 4]$.','5','5',1,2),
  ('h11_gemiddelde','gemiddelde_waarde','Bereken de gemiddelde waarde van $f(x) = \sin(x)$ op het interval $[0, \pi]$.','2/pi','\dfrac{2}{\pi}',2,3),
  ('h11_gemiddelde','gemiddelde_waarde','Bereken de gemiddelde waarde van $f(x) = e^{x}$ op het interval $[0, 2]$.','(e^2-1)/2','\dfrac{e^{2} - 1}{2}',2,4),
  ('h11_gemiddelde','gemiddelde_waarde','Bereken de gemiddelde waarde van $f(x) = \dfrac{1}{x}$ op het interval $[1, e]$.','1/(e-1)','\dfrac{1}{e - 1}',3,5),
  ('h11_gemiddelde','gemiddelde_waarde','Bereken de gemiddelde waarde van $f(x) = x^{3} - x$ op het interval $[0, 2]$.','1','1',3,6)
) AS v(topic_slug, cluster_slug, latex_body, answer, latex_answer, difficulty, order_index)
JOIN public.topics_new t ON t.site = 'integralen' AND t.slug = v.topic_slug
JOIN public.topic_clusters_new c ON c.site = 'integralen' AND c.slug = v.cluster_slug AND c.topic_id = t.id;

-- ── Steps: vergelijkingen ─────────────────────────────────────────────────────
INSERT INTO public.question_steps_new (question_id, step_order, step_description)
SELECT q.id, v.step_order, v.step_description
FROM (VALUES
  -- h11_subst_ex Q1
  ('h11_subst_ex','substitutie_ex',1,1,'Stel $u = e^x$, dan $e^{2x} = u^2$. De vergelijking wordt $u^2 - 5u + 6 = 0$.'),
  ('h11_subst_ex','substitutie_ex',1,2,'Ontbind: $(u-2)(u-3) = 0$, dus $u = 2$ of $u = 3$.'),
  ('h11_subst_ex','substitutie_ex',1,3,'Terug: $e^x = 2 \Rightarrow x = \ln(2)$ of $e^x = 3 \Rightarrow x = \ln(3)$.'),
  -- h11_subst_ex Q2
  ('h11_subst_ex','substitutie_ex',2,1,'Stel $u = e^x$. De vergelijking wordt $u^2 - 4u + 3 = 0$.'),
  ('h11_subst_ex','substitutie_ex',2,2,'Ontbind: $(u-1)(u-3) = 0$, dus $u = 1$ of $u = 3$.'),
  ('h11_subst_ex','substitutie_ex',2,3,'Terug: $e^x = 1 \Rightarrow x = 0$ of $e^x = 3 \Rightarrow x = \ln(3)$.'),
  -- h11_subst_ex Q3
  ('h11_subst_ex','substitutie_ex',3,1,'Stel $u = e^x$. De vergelijking wordt $u^2 + u - 6 = 0$.'),
  ('h11_subst_ex','substitutie_ex',3,2,'Ontbind: $(u+3)(u-2) = 0$, dus $u = -3$ of $u = 2$.'),
  ('h11_subst_ex','substitutie_ex',3,3,'$u = -3$ voldoet niet want $e^x > 0$. Dus $e^x = 2 \Rightarrow x = \ln(2)$.'),
  -- h11_subst_ex Q4
  ('h11_subst_ex','substitutie_ex',4,1,'Stel $u = e^x$. De vergelijking wordt $2u^2 - 9u + 4 = 0$.'),
  ('h11_subst_ex','substitutie_ex',4,2,'Ontbind: $(2u-1)(u-4) = 0$, dus $u = \tfrac{1}{2}$ of $u = 4$.'),
  ('h11_subst_ex','substitutie_ex',4,3,'Terug: $e^x = \tfrac{1}{2} \Rightarrow x = -\ln(2)$ of $e^x = 4 \Rightarrow x = \ln(4)$.'),
  -- h11_subst_ex Q5
  ('h11_subst_ex','substitutie_ex',5,1,'Stel $u = e^x$. De vergelijking wordt $u^2 - 3u + 2 = 0$.'),
  ('h11_subst_ex','substitutie_ex',5,2,'Ontbind: $(u-1)(u-2) = 0$, dus $u = 1$ of $u = 2$.'),
  ('h11_subst_ex','substitutie_ex',5,3,'Terug: $e^x = 1 \Rightarrow x = 0$ of $e^x = 2 \Rightarrow x = \ln(2)$.'),
  -- h11_subst_ex Q6
  ('h11_subst_ex','substitutie_ex',6,1,'Stel $u = e^x$. De vergelijking wordt $3u^2 - 10u + 3 = 0$.'),
  ('h11_subst_ex','substitutie_ex',6,2,'Ontbind: $(3u-1)(u-3) = 0$, dus $u = \tfrac{1}{3}$ of $u = 3$.'),
  ('h11_subst_ex','substitutie_ex',6,3,'Terug: $e^x = \tfrac{1}{3} \Rightarrow x = -\ln(3)$ of $e^x = 3 \Rightarrow x = \ln(3)$.'),
  -- h11_subst_px Q1
  ('h11_subst_px','substitutie_px',1,1,'Stel $u = x^2$. De vergelijking wordt $u^2 - 5u + 4 = 0$.'),
  ('h11_subst_px','substitutie_px',1,2,'Ontbind: $(u-1)(u-4) = 0$, dus $u = 1$ of $u = 4$.'),
  ('h11_subst_px','substitutie_px',1,3,'Terug: $x^2 = 1 \Rightarrow x = \pm 1$ of $x^2 = 4 \Rightarrow x = \pm 2$.'),
  -- h11_subst_px Q2
  ('h11_subst_px','substitutie_px',2,1,'Stel $u = x^2$. De vergelijking wordt $u^2 - 13u + 36 = 0$.'),
  ('h11_subst_px','substitutie_px',2,2,'Ontbind: $(u-4)(u-9) = 0$, dus $u = 4$ of $u = 9$.'),
  ('h11_subst_px','substitutie_px',2,3,'Terug: $x^2 = 4 \Rightarrow x = \pm 2$ of $x^2 = 9 \Rightarrow x = \pm 3$.'),
  -- h11_subst_px Q3
  ('h11_subst_px','substitutie_px',3,1,'Stel $u = x^2$. De vergelijking wordt $u^2 - 10u + 9 = 0$.'),
  ('h11_subst_px','substitutie_px',3,2,'Ontbind: $(u-1)(u-9) = 0$, dus $u = 1$ of $u = 9$.'),
  ('h11_subst_px','substitutie_px',3,3,'Terug: $x^2 = 1 \Rightarrow x = \pm 1$ of $x^2 = 9 \Rightarrow x = \pm 3$.'),
  -- h11_subst_px Q4
  ('h11_subst_px','substitutie_px',4,1,'Stel $u = p^2$. De vergelijking wordt $u^2 - 4u + 2 = 0$.'),
  ('h11_subst_px','substitutie_px',4,2,'ABC-formule: $u = \dfrac{4 \pm \sqrt{16-8}}{2} = 2 \pm \sqrt{2}$.'),
  ('h11_subst_px','substitutie_px',4,3,'Terug: $p^2 = 2 + \sqrt{2} \Rightarrow p = \pm\sqrt{2+\sqrt{2}}$ of $p^2 = 2 - \sqrt{2} \Rightarrow p = \pm\sqrt{2-\sqrt{2}}$.'),
  -- h11_subst_px Q5
  ('h11_subst_px','substitutie_px',5,1,'Stel $u = x^2$. De vergelijking wordt $u^2 + 2u - 8 = 0$.'),
  ('h11_subst_px','substitutie_px',5,2,'Ontbind: $(u+4)(u-2) = 0$, dus $u = -4$ of $u = 2$.'),
  ('h11_subst_px','substitutie_px',5,3,'$u = -4$ voldoet niet want $x^2 \geq 0$. Dus $x^2 = 2 \Rightarrow x = \pm\sqrt{2}$.'),
  -- h11_subst_px Q6
  ('h11_subst_px','substitutie_px',6,1,'Stel $u = x^2$. De vergelijking wordt $2u^2 - 5u - 3 = 0$.'),
  ('h11_subst_px','substitutie_px',6,2,'Ontbind: $(2u+1)(u-3) = 0$, dus $u = -\tfrac{1}{2}$ of $u = 3$.'),
  ('h11_subst_px','substitutie_px',6,3,'$u = -\tfrac{1}{2}$ voldoet niet. Dus $x^2 = 3 \Rightarrow x = \pm\sqrt{3}$.'),
  -- h11_ln_nemen Q1
  ('h11_ln_nemen','ln_nemen',1,1,'Neem de natuurlijke logaritme: $2x = \ln(5)$.'),
  ('h11_ln_nemen','ln_nemen',1,2,'$x = \dfrac{\ln(5)}{2}$.'),
  -- h11_ln_nemen Q2
  ('h11_ln_nemen','ln_nemen',2,1,'Neem de ln aan beide kanten: $x \cdot \ln(3) = \ln(7)$.'),
  ('h11_ln_nemen','ln_nemen',2,2,'$x = \dfrac{\ln(7)}{\ln(3)}$.'),
  -- h11_ln_nemen Q3
  ('h11_ln_nemen','ln_nemen',3,1,'Deel eerst door $2$: $5^x = 20$. Neem ln: $x \cdot \ln(5) = \ln(20)$.'),
  ('h11_ln_nemen','ln_nemen',3,2,'$x = \dfrac{\ln(20)}{\ln(5)}$.'),
  -- h11_ln_nemen Q4
  ('h11_ln_nemen','ln_nemen',4,1,'Neem $e$-macht aan beide kanten: $x = e^3$.'),
  ('h11_ln_nemen','ln_nemen',4,2,'$x = e^3$.'),
  -- h11_ln_nemen Q5
  ('h11_ln_nemen','ln_nemen',5,1,'Neem ln: $3x - 1 = \ln(10)$.'),
  ('h11_ln_nemen','ln_nemen',5,2,'$3x = 1 + \ln(10)$, dus $x = \dfrac{1 + \ln(10)}{3}$.'),
  -- h11_ln_nemen Q6
  ('h11_ln_nemen','ln_nemen',6,1,'Neem ln: $(x+1)\ln(2) = x\ln(3)$. Werk uit: $x\ln(2) + \ln(2) = x\ln(3)$.'),
  ('h11_ln_nemen','ln_nemen',6,2,'$x(\ln(3) - \ln(2)) = \ln(2)$, dus $x = \dfrac{\ln(2)}{\ln(3) - \ln(2)}$.'),
  -- h11_ontbinden Q1
  ('h11_ontbinden','ontbinden',1,1,'$e^x > 0$ voor alle $x$, dus het product $x \cdot e^x = 0$ geeft alleen $x = 0$.'),
  ('h11_ontbinden','ontbinden',1,2,'$x = 0$.'),
  -- h11_ontbinden Q2
  ('h11_ontbinden','ontbinden',2,1,'$e^x$ buiten haakjes: $e^x(x^2 - 4) = 0$. Omdat $e^x > 0$: $x^2 - 4 = 0$.'),
  ('h11_ontbinden','ontbinden',2,2,'$x^2 = 4$, dus $x = -2$ of $x = 2$.'),
  -- h11_ontbinden Q3
  ('h11_ontbinden','ontbinden',3,1,'$\ln(x)$ buiten haakjes: $\ln(x)(x^2 - 4) = 0$. Let op: domein $x > 0$.'),
  ('h11_ontbinden','ontbinden',3,2,'$\ln(x) = 0 \Rightarrow x = 1$ of $x^2 = 4 \Rightarrow x = 2$ (want $x > 0$, dus $x = -2$ vervalt).'),
  -- h11_ontbinden Q4
  ('h11_ontbinden','ontbinden',4,1,'$e^x$ buiten haakjes: $e^x(x + 2) = 0$. Omdat $e^x > 0$: $x + 2 = 0$.'),
  ('h11_ontbinden','ontbinden',4,2,'$x = -2$.'),
  -- h11_ontbinden Q5
  ('h11_ontbinden','ontbinden',5,1,'$xe^x$ buiten haakjes: $xe^x(3x - 1) = 0$. Omdat $e^x > 0$: $x = 0$ of $3x - 1 = 0$.'),
  ('h11_ontbinden','ontbinden',5,2,'$x = 0$ of $x = \tfrac{1}{3}$.'),
  -- h11_ontbinden Q6
  ('h11_ontbinden','ontbinden',6,1,'$(x-1)$ buiten haakjes: $(x-1)(\ln(x) + 1) = 0$. Let op: domein $x > 0$.'),
  ('h11_ontbinden','ontbinden',6,2,'$x - 1 = 0 \Rightarrow x = 1$ of $\ln(x) = -1 \Rightarrow x = e^{-1}$.'),
  -- h11_int_waarde Q1
  ('h11_int_waarde','integraal_is_waarde',1,1,'Primitiveer: $\left[x^3\right]_0^p = p^3$.'),
  ('h11_int_waarde','integraal_is_waarde',1,2,'$p^3 = 8$, dus $p = 2$.'),
  -- h11_int_waarde Q2
  ('h11_int_waarde','integraal_is_waarde',2,1,'Primitiveer: $\left[x^2\right]_0^p = p^2$.'),
  ('h11_int_waarde','integraal_is_waarde',2,2,'$p^2 = 9$ met $p > 0$, dus $p = 3$.'),
  -- h11_int_waarde Q3
  ('h11_int_waarde','integraal_is_waarde',3,1,'Primitiveer: $\left[2x^2 - x\right]_0^p = 2p^2 - p$.'),
  ('h11_int_waarde','integraal_is_waarde',3,2,'$2p^2 - p = 3 \Rightarrow 2p^2 - p - 3 = 0 \Rightarrow (2p-3)(p+1) = 0$.'),
  ('h11_int_waarde','integraal_is_waarde',3,3,'$p > 0$, dus $p = \tfrac{3}{2}$.'),
  -- h11_int_waarde Q4
  ('h11_int_waarde','integraal_is_waarde',4,1,'Primitiveer: $\left[e^x\right]_0^p = e^p - 1$.'),
  ('h11_int_waarde','integraal_is_waarde',4,2,'$e^p - 1 = 5 \Rightarrow e^p = 6 \Rightarrow p = \ln(6)$.'),
  -- h11_int_waarde Q5
  ('h11_int_waarde','integraal_is_waarde',5,1,'Primitiveer: $\left[\ln|x|\right]_1^p = \ln(p) - 0 = \ln(p)$.'),
  ('h11_int_waarde','integraal_is_waarde',5,2,'$\ln(p) = 3 \Rightarrow p = e^3$.'),
  -- h11_int_waarde Q6
  ('h11_int_waarde','integraal_is_waarde',6,1,'Primitiveer: $\left[x^3 - \tfrac{1}{4}x^4\right]_0^p = p^3 - \tfrac{1}{4}p^4$.'),
  ('h11_int_waarde','integraal_is_waarde',6,2,'$p^3 - \tfrac{1}{4}p^4 = \tfrac{27}{4}$. Probeer $p = 3$: $27 - \tfrac{81}{4} = \tfrac{108-81}{4} = \tfrac{27}{4}$ $\checkmark$.'),
  ('h11_int_waarde','integraal_is_waarde',6,3,'$p = 3$.'),
  -- h11_twee_int Q1
  ('h11_twee_int','twee_integralen',1,1,'Bereken de totale oppervlakte: $\int_0^2 (4-x^2)\,dx = \left[4x - \tfrac{1}{3}x^3\right]_0^2 = 8 - \tfrac{8}{3} = \tfrac{16}{3}$.'),
  ('h11_twee_int','twee_integralen',1,2,'De helft is $\tfrac{8}{3}$. Stel op: $\int_0^p (4-x^2)\,dx = \tfrac{8}{3}$, ofwel $4p - \tfrac{1}{3}p^3 = \tfrac{8}{3}$.'),
  ('h11_twee_int','twee_integralen',1,3,'Numeriek oplossen: $p \approx 0{,}69$.'),
  -- h11_twee_int Q2
  ('h11_twee_int','twee_integralen',2,1,'Totale oppervlakte: $\int_0^3 x^2\,dx = \left[\tfrac{1}{3}x^3\right]_0^3 = 9$. De helft is $\tfrac{9}{2}$.'),
  ('h11_twee_int','twee_integralen',2,2,'Stel op: $\tfrac{1}{3}p^3 = \tfrac{9}{2}$, dus $p^3 = \tfrac{27}{2}$.'),
  ('h11_twee_int','twee_integralen',2,3,'$p = \sqrt[3]{\tfrac{27}{2}} = \dfrac{3}{\sqrt[3]{2}}$.'),
  -- h11_twee_int Q3
  ('h11_twee_int','twee_integralen',3,1,'$O(V) = \int_0^p e^x\,dx = e^p - 1$ en $O(W) = \int_p^{2p} e^x\,dx = e^{2p} - e^p$.'),
  ('h11_twee_int','twee_integralen',3,2,'$O(W) = 2 \cdot O(V)$: $e^{2p} - e^p = 2(e^p - 1)$. Stel $u = e^p$: $u^2 - 3u + 2 = 0$.'),
  ('h11_twee_int','twee_integralen',3,3,'$(u-1)(u-2) = 0$. $u = 1$ geeft $p = 0$ (voldoet niet). $u = 2$ geeft $p = \ln(2)$.'),
  -- h11_twee_int Q4
  ('h11_twee_int','twee_integralen',4,1,'$\int_0^p \sqrt{x}\,dx = \left[\tfrac{2}{3}x^{\frac{3}{2}}\right]_0^p = \tfrac{2}{3}p^{\frac{3}{2}}$.'),
  ('h11_twee_int','twee_integralen',4,2,'$\tfrac{2}{3}p^{\frac{3}{2}} = 18 \Rightarrow p^{\frac{3}{2}} = 27 \Rightarrow p = 27^{\frac{2}{3}} = 9$.'),
  -- h11_twee_int Q5
  ('h11_twee_int','twee_integralen',5,1,'$\int_1^p \dfrac{1}{x}\,dx = \left[\ln|x|\right]_1^p = \ln(p)$.'),
  ('h11_twee_int','twee_integralen',5,2,'$\ln(p) = 2 \Rightarrow p = e^2$.'),
  -- h11_twee_int Q6
  ('h11_twee_int','twee_integralen',6,1,'Nulpunten: $x^2(3-x) = 0 \Rightarrow x = 0$ of $x = 3$. Totaal: $\int_0^3 (3x^2-x^3)\,dx = \left[x^3 - \tfrac{1}{4}x^4\right]_0^3 = 27 - \tfrac{81}{4} = \tfrac{27}{4}$.'),
  ('h11_twee_int','twee_integralen',6,2,'Halve oppervlakte: $\tfrac{27}{8}$. Stel op: $p^3 - \tfrac{1}{4}p^4 = \tfrac{27}{8}$.'),
  ('h11_twee_int','twee_integralen',6,3,'Numeriek oplossen: $p \approx 1{,}84$.')
) AS v(topic_slug, cluster_slug, q_order_index, step_order, step_description)
JOIN public.topics_new t ON t.site = 'integralen' AND t.slug = v.topic_slug
JOIN public.topic_clusters_new c ON c.site = 'integralen' AND c.slug = v.cluster_slug AND c.topic_id = t.id
JOIN public.questions_new q ON q.site = 'integralen' AND q.topic_id = t.id AND q.cluster_id = c.id AND q.order_index = v.q_order_index;

-- ── Steps: toepassingen ───────────────────────────────────────────────────────
INSERT INTO public.question_steps_new (question_id, step_order, step_description)
SELECT q.id, v.step_order, v.step_description
FROM (VALUES
  -- h11_opp_grafiek Q1
  ('h11_opp_grafiek','opp_onder_grafiek',1,1,'Bepaal de nulpunten: $4-x^2=0 \Rightarrow x=\pm 2$. De grafiek ligt boven de $x$-as op $(-2,2)$.'),
  ('h11_opp_grafiek','opp_onder_grafiek',1,2,'$O = \int_{-2}^{2}(4-x^2)\,dx = \left[4x-\tfrac{1}{3}x^3\right]_{-2}^{2} = \tfrac{16}{3}-(-\tfrac{16}{3}) = \tfrac{32}{3}$.'),
  -- h11_opp_grafiek Q2
  ('h11_opp_grafiek','opp_onder_grafiek',2,1,'Nulpunten: $x^2(3-x)=0 \Rightarrow x=0$ of $x=3$. De grafiek ligt boven de $x$-as op $(0,3)$.'),
  ('h11_opp_grafiek','opp_onder_grafiek',2,2,'$O = \int_0^3(3x^2-x^3)\,dx = \left[x^3-\tfrac{1}{4}x^4\right]_0^3 = 27-\tfrac{81}{4} = \tfrac{27}{4}$.'),
  -- h11_opp_grafiek Q3
  ('h11_opp_grafiek','opp_onder_grafiek',3,1,'Nulpunten: $x(x-4)=0 \Rightarrow x=0,4$. De grafiek ligt onder de $x$-as op $(0,4)$.'),
  ('h11_opp_grafiek','opp_onder_grafiek',3,2,'$O = -\int_0^4(x^2-4x)\,dx = \int_0^4(4x-x^2)\,dx = \left[2x^2-\tfrac{1}{3}x^3\right]_0^4 = 32-\tfrac{64}{3} = \tfrac{32}{3}$.'),
  -- h11_opp_grafiek Q4
  ('h11_opp_grafiek','opp_onder_grafiek',4,1,'Het vlakdeel loopt van $x=0$ (y-as) tot $x=2$. $e^x > 0$ dus alles boven de $x$-as.'),
  ('h11_opp_grafiek','opp_onder_grafiek',4,2,'$O = \int_0^2 e^x\,dx = \left[e^x\right]_0^2 = e^2-1$.'),
  -- h11_opp_grafiek Q5
  ('h11_opp_grafiek','opp_onder_grafiek',5,1,'Het vlakdeel loopt van $x=1$ tot $x=e^3$. $\tfrac{1}{x}>0$ voor $x>0$.'),
  ('h11_opp_grafiek','opp_onder_grafiek',5,2,'$O = \int_1^{e^3}\tfrac{1}{x}\,dx = \left[\ln|x|\right]_1^{e^3} = 3-0 = 3$.'),
  -- h11_opp_grafiek Q6
  ('h11_opp_grafiek','opp_onder_grafiek',6,1,'Nulpunten: $x(6-x)=0 \Rightarrow x=0,6$. De grafiek ligt boven de $x$-as op $(0,6)$.'),
  ('h11_opp_grafiek','opp_onder_grafiek',6,2,'$O = \int_0^6(6x-x^2)\,dx = \left[3x^2-\tfrac{1}{3}x^3\right]_0^6 = 108-72 = 36$.'),
  -- h11_opp_tussen Q1
  ('h11_opp_tussen','opp_tussen_grafieken',1,1,'Snijpunten: $x^2=x \Rightarrow x(x-1)=0 \Rightarrow x=0,1$. Op $(0,1)$ geldt $g>f$ (want $x>x^2$).'),
  ('h11_opp_tussen','opp_tussen_grafieken',1,2,'$O = \int_0^1(x-x^2)\,dx = \left[\tfrac{1}{2}x^2-\tfrac{1}{3}x^3\right]_0^1 = \tfrac{1}{2}-\tfrac{1}{3} = \tfrac{1}{6}$.'),
  -- h11_opp_tussen Q2
  ('h11_opp_tussen','opp_tussen_grafieken',2,1,'Snijpunten: $6x-x^2=x \Rightarrow x^2-5x=0 \Rightarrow x=0,5$. Op $(0,5)$ geldt $f>g$.'),
  ('h11_opp_tussen','opp_tussen_grafieken',2,2,'$O = \int_0^5(5x-x^2)\,dx = \left[\tfrac{5}{2}x^2-\tfrac{1}{3}x^3\right]_0^5 = \tfrac{125}{2}-\tfrac{125}{3} = \tfrac{125}{6}$.'),
  -- h11_opp_tussen Q3
  ('h11_opp_tussen','opp_tussen_grafieken',3,1,'Snijpunten: $4-x^2=x+2 \Rightarrow x^2+x-2=0 \Rightarrow (x+2)(x-1)=0 \Rightarrow x=-2,1$.'),
  ('h11_opp_tussen','opp_tussen_grafieken',3,2,'Op $(-2,1)$ geldt $f>g$. $O = \int_{-2}^1(2-x-x^2)\,dx = \left[2x-\tfrac{1}{2}x^2-\tfrac{1}{3}x^3\right]_{-2}^1 = \tfrac{7}{6}+\tfrac{10}{3} = \tfrac{9}{2}$.'),
  -- h11_opp_xas Q1
  ('h11_opp_xas','opp_onder_xas',1,1,'Nulpunten: $x^2-1=0 \Rightarrow x=\pm 1$. $f<0$ op $(-1,1)$.'),
  ('h11_opp_xas','opp_onder_xas',1,2,'$O = -\int_{-1}^1(x^2-1)\,dx = \int_{-1}^1(1-x^2)\,dx = \left[x-\tfrac{1}{3}x^3\right]_{-1}^1 = \tfrac{2}{3}+\tfrac{2}{3} = \tfrac{4}{3}$.'),
  -- h11_opp_xas Q2
  ('h11_opp_xas','opp_onder_xas',2,1,'Nulpunten $x\geq 0$: $x(x^2-4)=0 \Rightarrow x=0,2$. $f<0$ op $(0,2)$.'),
  ('h11_opp_xas','opp_onder_xas',2,2,'$O = \int_0^2(4x-x^3)\,dx = \left[2x^2-\tfrac{1}{4}x^4\right]_0^2 = 8-4 = 4$.'),
  -- h11_opp_xas Q3
  ('h11_opp_xas','opp_onder_xas',3,1,'Nulpunten: $(x-1)(x-3)=0 \Rightarrow x=1,3$. $f<0$ op $(1,3)$.'),
  ('h11_opp_xas','opp_onder_xas',3,2,'$O = \int_1^3(-x^2+4x-3)\,dx = \left[-\tfrac{1}{3}x^3+2x^2-3x\right]_1^3 = 0-(-\tfrac{4}{3}) = \tfrac{4}{3}$.'),
  -- h11_opp_xas Q4
  ('h11_opp_xas','opp_onder_xas',4,1,'$\sin(x)>0$ op $(0,\pi)$ en $\sin(x)<0$ op $(\pi,2\pi)$. Splits de integraal.'),
  ('h11_opp_xas','opp_onder_xas',4,2,'$O = \int_0^{\pi}\sin(x)\,dx + \left|\int_{\pi}^{2\pi}\sin(x)\,dx\right| = 2 + |-{-2}| = 2+2 = 4$.'),
  -- h11_opp_xas Q5
  ('h11_opp_xas','opp_onder_xas',5,1,'Nulpunten: $x(x-1)(x+1)=0$. $f>0$ op $(-1,0)$, $f<0$ op $(0,1)$.'),
  ('h11_opp_xas','opp_onder_xas',5,2,'$\int_{-1}^0(x^3-x)\,dx = \tfrac{1}{4}$ en $\left|\int_0^1(x^3-x)\,dx\right| = \tfrac{1}{4}$. Totaal: $\tfrac{1}{2}$.'),
  -- h11_opp_xas Q6
  ('h11_opp_xas','opp_onder_xas',6,1,'Nulpunten: $x(x-1)(x-3)=0$. $f>0$ op $(0,1)$, $f<0$ op $(1,3)$.'),
  ('h11_opp_xas','opp_onder_xas',6,2,'$\int_0^1(x^3-4x^2+3x)\,dx = \tfrac{5}{12}$ en $\left|\int_1^3(x^3-4x^2+3x)\,dx\right| = \tfrac{8}{3}$.'),
  ('h11_opp_xas','opp_onder_xas',6,3,'Totaal: $\tfrac{5}{12}+\tfrac{32}{12} = \tfrac{37}{12}$.'),
  -- h11_inhoud Q1
  ('h11_inhoud','inhoud_omwenteling',1,1,'$I = \pi\int_0^3 x^2\,dx = \pi\left[\tfrac{1}{3}x^3\right]_0^3 = 9\pi$.'),
  -- h11_inhoud Q2
  ('h11_inhoud','inhoud_omwenteling',2,1,'$(\sqrt{x})^2 = x$. Dus $I = \pi\int_0^4 x\,dx = \pi\left[\tfrac{1}{2}x^2\right]_0^4 = 8\pi$.'),
  -- h11_inhoud Q3
  ('h11_inhoud','inhoud_omwenteling',3,1,'$(x^2)^2 = x^4$. Dus $I = \pi\int_0^2 x^4\,dx = \pi\left[\tfrac{1}{5}x^5\right]_0^2 = \tfrac{32}{5}\pi$.'),
  -- h11_inhoud Q4
  ('h11_inhoud','inhoud_omwenteling',4,1,'$(e^x)^2 = e^{2x}$. Dus $I = \pi\int_0^1 e^{2x}\,dx = \pi\left[\tfrac{1}{2}e^{2x}\right]_0^1 = \tfrac{\pi(e^2-1)}{2}$.'),
  -- h11_inhoud Q5
  ('h11_inhoud','inhoud_omwenteling',5,1,'Cirkel $x^2+y^2=r^2$ geeft $y^2=r^2-x^2$. Wentel van $-r$ tot $r$.'),
  ('h11_inhoud','inhoud_omwenteling',5,2,'$I = \pi\int_{-r}^{r}(r^2-x^2)\,dx = \pi\left[r^2x-\tfrac{1}{3}x^3\right]_{-r}^r = \pi\left(\tfrac{2}{3}r^3+\tfrac{2}{3}r^3\right) = \tfrac{4}{3}\pi r^3$.'),
  -- h11_inhoud Q6
  ('h11_inhoud','inhoud_omwenteling',6,1,'Nulpunten: $9-x^2=0 \Rightarrow x=\pm 3$. $(9-x^2)^2 = 81-18x^2+x^4$.'),
  ('h11_inhoud','inhoud_omwenteling',6,2,'$I = \pi\int_{-3}^3(81-18x^2+x^4)\,dx = \pi\left[81x-6x^3+\tfrac{1}{5}x^5\right]_{-3}^3 = \tfrac{1296}{5}\pi$.'),
  -- h11_afstand Q1
  ('h11_afstand','afstand_snelheid',1,1,'$s = \int_0^4 3t^2\,dt = \left[t^3\right]_0^4 = 64$ m.'),
  -- h11_afstand Q2
  ('h11_afstand','afstand_snelheid',2,1,'$s = \int_1^5(2t+1)\,dt = \left[t^2+t\right]_1^5 = 30-2 = 28$ m.'),
  -- h11_afstand Q3
  ('h11_afstand','afstand_snelheid',3,1,'Stilstand: $v=0 \Rightarrow 10-2t=0 \Rightarrow t=5$.'),
  ('h11_afstand','afstand_snelheid',3,2,'$s = \int_0^5(10-2t)\,dt = \left[10t-t^2\right]_0^5 = 50-25 = 25$ m.'),
  -- h11_afstand Q4
  ('h11_afstand','afstand_snelheid',4,1,'$s = \int_0^3 e^t\,dt = \left[e^t\right]_0^3 = e^3-1$ m.'),
  -- h11_afstand Q5
  ('h11_afstand','afstand_snelheid',5,1,'Eerst $v(t)$ bepalen: $v(t) = \int 6t\,dt = 3t^2+c$. $v(0)=2$ geeft $c=2$, dus $v(t)=3t^2+2$.'),
  ('h11_afstand','afstand_snelheid',5,2,'$s = \int_0^3(3t^2+2)\,dt = \left[t^3+2t\right]_0^3 = 27+6 = 33$ m.'),
  -- h11_afstand Q6
  ('h11_afstand','afstand_snelheid',6,1,'$s = \int_1^4\left(-\tfrac{1}{2}t^2+2t+1\right)\,dt = \left[-\tfrac{1}{6}t^3+t^2+t\right]_1^4$.'),
  ('h11_afstand','afstand_snelheid',6,2,'$= (-\tfrac{64}{6}+16+4)-(-\tfrac{1}{6}+1+1) = \tfrac{28}{3}-\tfrac{11}{6} = \tfrac{56-11}{6} = \tfrac{45}{6} = \tfrac{15}{2}$ m.'),
  -- h11_gemiddelde Q1
  ('h11_gemiddelde','gemiddelde_waarde',1,1,'Gemiddelde $= \dfrac{1}{3-0}\int_0^3 x^2\,dx = \tfrac{1}{3}\left[\tfrac{1}{3}x^3\right]_0^3 = \tfrac{1}{3} \cdot 9 = 3$.'),
  -- h11_gemiddelde Q2
  ('h11_gemiddelde','gemiddelde_waarde',2,1,'Gemiddelde $= \dfrac{1}{4}\int_0^4(2x+1)\,dx = \tfrac{1}{4}\left[x^2+x\right]_0^4 = \tfrac{1}{4} \cdot 20 = 5$.'),
  -- h11_gemiddelde Q3
  ('h11_gemiddelde','gemiddelde_waarde',3,1,'Gemiddelde $= \dfrac{1}{\pi}\int_0^{\pi}\sin(x)\,dx = \dfrac{1}{\pi}\left[-\cos(x)\right]_0^{\pi} = \dfrac{1}{\pi}(1+1) = \dfrac{2}{\pi}$.'),
  -- h11_gemiddelde Q4
  ('h11_gemiddelde','gemiddelde_waarde',4,1,'Gemiddelde $= \dfrac{1}{2}\int_0^2 e^x\,dx = \dfrac{1}{2}\left[e^x\right]_0^2 = \dfrac{e^2-1}{2}$.'),
  -- h11_gemiddelde Q5
  ('h11_gemiddelde','gemiddelde_waarde',5,1,'Gemiddelde $= \dfrac{1}{e-1}\int_1^e \dfrac{1}{x}\,dx = \dfrac{1}{e-1} \cdot \left[\ln|x|\right]_1^e = \dfrac{1}{e-1} \cdot 1 = \dfrac{1}{e-1}$.'),
  -- h11_gemiddelde Q6
  ('h11_gemiddelde','gemiddelde_waarde',6,1,'Gemiddelde $= \dfrac{1}{2}\int_0^2(x^3-x)\,dx = \dfrac{1}{2}\left[\tfrac{1}{4}x^4-\tfrac{1}{2}x^2\right]_0^2 = \dfrac{1}{2}(4-2) = 1$.')
) AS v(topic_slug, cluster_slug, q_order_index, step_order, step_description)
JOIN public.topics_new t ON t.site = 'integralen' AND t.slug = v.topic_slug
JOIN public.topic_clusters_new c ON c.site = 'integralen' AND c.slug = v.cluster_slug AND c.topic_id = t.id
JOIN public.questions_new q ON q.site = 'integralen' AND q.topic_id = t.id AND q.cluster_id = c.id AND q.order_index = v.q_order_index;

COMMIT;
