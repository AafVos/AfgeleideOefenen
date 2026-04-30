-- =============================================================================
-- Migration 0008: Redesign quotiëntregel clusters + 27 new questions
-- Clusters: makkelijk | polynoom | combi_somregel
-- =============================================================================

-- ── 1. Remove old clusters (cascades questions) ────────────────────────────
delete from public.topic_clusters
where slug in ('lineaire_noemer','kwadratische_noemer','macht_in_noemer','wortel')
  and topic_id = (select id from public.topics where slug = 'quotientregel');

-- ── 2. New clusters ────────────────────────────────────────────────────────
insert into public.topic_clusters (topic_id, slug, title, order_index)
select t.id, c.slug, c.title, c.order_index
from public.topics t
cross join (values
  ('makkelijk',      'Makkelijk',           1),
  ('polynoom',       'Polynoom',            2),
  ('combi_somregel', 'Combi met somregel',  3)
) as c(slug, title, order_index)
where t.slug = 'quotientregel'
on conflict (topic_id, slug) do update
  set title = excluded.title, order_index = excluded.order_index;

-- ── 3. Extra root cause ────────────────────────────────────────────────────
insert into public.root_causes (topic_id, slug, description)
select t.id, 'quotientregel.combi_somregel',
       'Andere term(en) naast de breuk apart differentiëren (somregel)'
from public.topics t
where t.slug = 'quotientregel'
on conflict (slug) do update set description = excluded.description;

-- ── 4. Questions ───────────────────────────────────────────────────────────
delete from public.questions
  where is_ai_generated = false
    and topic_id = (select id from public.topics where slug = 'quotientregel');

with
  t as (select id from public.topics where slug = 'quotientregel'),
  cl as (
    select tc.slug, tc.id
    from public.topic_clusters tc
    join public.topics tt on tt.id = tc.topic_id
    where tt.slug = 'quotientregel'
  )
insert into public.questions
  (topic_id, cluster_id, body, latex_body, answer, latex_answer,
   difficulty, root_cause_tags, is_ai_generated, order_index)
values

  -- ── makkelijk — diff 1 ────────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'makkelijk'),
   'Bepaal f''(x) als f(x) = 1/(x+1)',
   'f(x) = \dfrac{1}{x+1}',
   '-1/(x+1)^2', '\dfrac{-1}{(x+1)^{2}}',
   1, array['quotientregel.tn_identificeren','quotientregel.formule_volgorde','quotientregel.noemer_kwadraat'],
   false, 1),

  ((select id from t), (select id from cl where slug = 'makkelijk'),
   'Bepaal f''(x) als f(x) = x/(x+1)',
   'f(x) = \dfrac{x}{x+1}',
   '1/(x+1)^2', '\dfrac{1}{(x+1)^{2}}',
   1, array['quotientregel.formule_volgorde','quotientregel.noemer_kwadraat'],
   false, 2),

  ((select id from t), (select id from cl where slug = 'makkelijk'),
   'Bepaal f''(x) als f(x) = (x+1)/(x−1)',
   'f(x) = \dfrac{x+1}{x-1}',
   '-2/(x-1)^2', '\dfrac{-2}{(x-1)^{2}}',
   1, array['quotientregel.formule_volgorde','quotientregel.noemer_kwadraat'],
   false, 3),

  ((select id from t), (select id from cl where slug = 'makkelijk'),
   'Bepaal f''(x) als f(x) = 2x/(x+3)',
   'f(x) = \dfrac{2x}{x+3}',
   '6/(x+3)^2', '\dfrac{6}{(x+3)^{2}}',
   1, array['quotientregel.formule_volgorde','quotientregel.noemer_kwadraat'],
   false, 4),

  ((select id from t), (select id from cl where slug = 'makkelijk'),
   'Bepaal f''(x) als f(x) = (x−2)/(x+3)',
   'f(x) = \dfrac{x-2}{x+3}',
   '5/(x+3)^2', '\dfrac{5}{(x+3)^{2}}',
   1, array['quotientregel.formule_volgorde','quotientregel.noemer_kwadraat'],
   false, 5),

  -- ── makkelijk — diff 2 ────────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'makkelijk'),
   'Bepaal f''(x) als f(x) = (2x+3)/(x−1)',
   'f(x) = \dfrac{2x+3}{x-1}',
   '-5/(x-1)^2', '\dfrac{-5}{(x-1)^{2}}',
   2, array['quotientregel.formule_volgorde','quotientregel.noemer_kwadraat'],
   false, 6),

  ((select id from t), (select id from cl where slug = 'makkelijk'),
   'Bepaal f''(x) als f(x) = (3x−1)/(x+2)',
   'f(x) = \dfrac{3x-1}{x+2}',
   '7/(x+2)^2', '\dfrac{7}{(x+2)^{2}}',
   2, array['quotientregel.formule_volgorde','quotientregel.noemer_kwadraat'],
   false, 7),

  ((select id from t), (select id from cl where slug = 'makkelijk'),
   'Bepaal f''(x) als f(x) = x/(x−4)',
   'f(x) = \dfrac{x}{x-4}',
   '-4/(x-4)^2', '\dfrac{-4}{(x-4)^{2}}',
   2, array['quotientregel.formule_volgorde','quotientregel.noemer_kwadraat'],
   false, 8),

  ((select id from t), (select id from cl where slug = 'makkelijk'),
   'Bepaal f''(x) als f(x) = x²/(x+1)',
   'f(x) = \dfrac{x^{2}}{x+1}',
   '(x^2+2x)/(x+1)^2', '\dfrac{x^{2}+2x}{(x+1)^{2}}',
   2, array['quotientregel.t_differentieren','quotientregel.formule_volgorde','quotientregel.noemer_kwadraat'],
   false, 9),

  -- ── polynoom — diff 2 ─────────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'polynoom'),
   'Bepaal f''(x) als f(x) = x/(x²+1)',
   'f(x) = \dfrac{x}{x^{2}+1}',
   '(1-x^2)/(x^2+1)^2', '\dfrac{1-x^{2}}{(x^{2}+1)^{2}}',
   2, array['quotientregel.n_differentieren','quotientregel.formule_volgorde'],
   false, 1),

  ((select id from t), (select id from cl where slug = 'polynoom'),
   'Bepaal f''(x) als f(x) = x²/(x²+4)',
   'f(x) = \dfrac{x^{2}}{x^{2}+4}',
   '8x/(x^2+4)^2', '\dfrac{8x}{(x^{2}+4)^{2}}',
   2, array['quotientregel.t_differentieren','quotientregel.n_differentieren','quotientregel.formule_volgorde'],
   false, 2),

  ((select id from t), (select id from cl where slug = 'polynoom'),
   'Bepaal f''(x) als f(x) = (x−1)/(x²+1)',
   'f(x) = \dfrac{x-1}{x^{2}+1}',
   '(-x^2+2x+1)/(x^2+1)^2', '\dfrac{-x^{2}+2x+1}{(x^{2}+1)^{2}}',
   2, array['quotientregel.n_differentieren','quotientregel.formule_volgorde'],
   false, 3),

  ((select id from t), (select id from cl where slug = 'polynoom'),
   'Bepaal f''(x) als f(x) = (3−x²)/(x−2)',
   'f(x) = \dfrac{3-x^{2}}{x-2}',
   '(-x^2+4x-3)/(x-2)^2', '\dfrac{-x^{2}+4x-3}{(x-2)^{2}}',
   2, array['quotientregel.t_differentieren','quotientregel.formule_volgorde'],
   false, 4),

  -- ── polynoom — diff 3 ─────────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'polynoom'),
   'Bepaal f''(x) als f(x) = (x²−1)/(x²+1)',
   'f(x) = \dfrac{x^{2}-1}{x^{2}+1}',
   '4x/(x^2+1)^2', '\dfrac{4x}{(x^{2}+1)^{2}}',
   3, array['quotientregel.t_differentieren','quotientregel.n_differentieren','quotientregel.formule_volgorde'],
   false, 5),

  ((select id from t), (select id from cl where slug = 'polynoom'),
   'Bepaal f''(x) als f(x) = x³/(x+1)',
   'f(x) = \dfrac{x^{3}}{x+1}',
   '(2x^3+3x^2)/(x+1)^2', '\dfrac{2x^{3}+3x^{2}}{(x+1)^{2}}',
   3, array['quotientregel.t_differentieren','quotientregel.formule_volgorde'],
   false, 6),

  ((select id from t), (select id from cl where slug = 'polynoom'),
   'Bepaal f''(x) als f(x) = (x²+x)/(x+2)',
   'f(x) = \dfrac{x^{2}+x}{x+2}',
   '(x^2+4x+2)/(x+2)^2', '\dfrac{x^{2}+4x+2}{(x+2)^{2}}',
   3, array['quotientregel.t_differentieren','quotientregel.formule_volgorde'],
   false, 7),

  ((select id from t), (select id from cl where slug = 'polynoom'),
   'Bepaal f''(x) als f(x) = (x²+1)/(x−1)',
   'f(x) = \dfrac{x^{2}+1}{x-1}',
   '(x^2-2x-1)/(x-1)^2', '\dfrac{x^{2}-2x-1}{(x-1)^{2}}',
   3, array['quotientregel.t_differentieren','quotientregel.formule_volgorde'],
   false, 8),

  ((select id from t), (select id from cl where slug = 'polynoom'),
   'Bepaal f''(x) als f(x) = (x³−1)/(x+1)',
   'f(x) = \dfrac{x^{3}-1}{x+1}',
   '(2x^3+3x^2+1)/(x+1)^2', '\dfrac{2x^{3}+3x^{2}+1}{(x+1)^{2}}',
   3, array['quotientregel.t_differentieren','quotientregel.formule_volgorde'],
   false, 9),

  -- ── combi_somregel — diff 2 ───────────────────────────────────
  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = x − 2/(x+4)',
   'f(x) = x - \dfrac{2}{x+4}',
   '1+2/(x+4)^2', '1+\dfrac{2}{(x+4)^{2}}',
   2, array['quotientregel.formule_volgorde','quotientregel.combi_somregel'],
   false, 1),

  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = x² + 1/(x−1)',
   'f(x) = x^{2} + \dfrac{1}{x-1}',
   '2x-1/(x-1)^2', '2x-\dfrac{1}{(x-1)^{2}}',
   2, array['quotientregel.formule_volgorde','quotientregel.combi_somregel'],
   false, 2),

  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = 3x + x/(x+2)',
   'f(x) = 3x + \dfrac{x}{x+2}',
   '3+2/(x+2)^2', '3+\dfrac{2}{(x+2)^{2}}',
   2, array['quotientregel.formule_volgorde','quotientregel.combi_somregel'],
   false, 3),

  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = x³ + (x+1)/(x−1)',
   'f(x) = x^{3} + \dfrac{x+1}{x-1}',
   '3x^2-2/(x-1)^2', '3x^{2}-\dfrac{2}{(x-1)^{2}}',
   2, array['quotientregel.formule_volgorde','quotientregel.combi_somregel'],
   false, 4),

  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = x − (x−1)/(x+2)',
   'f(x) = x - \dfrac{x-1}{x+2}',
   '1-3/(x+2)^2', '1-\dfrac{3}{(x+2)^{2}}',
   2, array['quotientregel.formule_volgorde','quotientregel.combi_somregel'],
   false, 5),

  -- ── combi_somregel — diff 3 ───────────────────────────────────
  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = (3−x²)/(x−2) + x³',
   'f(x) = \dfrac{3-x^{2}}{x-2} + x^{3}',
   '(-x^2+4x-3)/(x-2)^2+3x^2', '\dfrac{-x^{2}+4x-3}{(x-2)^{2}}+3x^{2}',
   3, array['quotientregel.formule_volgorde','quotientregel.combi_somregel'],
   false, 6),

  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = (2x+1)/(x+3) + x²',
   'f(x) = \dfrac{2x+1}{x+3} + x^{2}',
   '5/(x+3)^2+2x', '\dfrac{5}{(x+3)^{2}}+2x',
   3, array['quotientregel.formule_volgorde','quotientregel.combi_somregel'],
   false, 7),

  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = x² − (x+2)/(x−1)',
   'f(x) = x^{2} - \dfrac{x+2}{x-1}',
   '2x+3/(x-1)^2', '2x+\dfrac{3}{(x-1)^{2}}',
   3, array['quotientregel.formule_volgorde','quotientregel.combi_somregel'],
   false, 8),

  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = (x²+1)/(x−1) + 2x',
   'f(x) = \dfrac{x^{2}+1}{x-1} + 2x',
   '(x^2-2x-1)/(x-1)^2+2', '\dfrac{x^{2}-2x-1}{(x-1)^{2}}+2',
   3, array['quotientregel.formule_volgorde','quotientregel.combi_somregel'],
   false, 9);

-- ── 5. Stappen: f(x) = (3−x²)/(x−2) + x³ ────────────────────────────────
with q as (
  select id from public.questions
  where latex_body = 'f(x) = \dfrac{3-x^{2}}{x-2} + x^{3}'
    and topic_id = (select id from public.topics where slug = 'quotientregel')
  limit 1
)
insert into public.question_steps (question_id, step_order, step_description, root_cause_id)
select (select id from q), s.step_order, s.step_description, rc.id
from (values
  (1, 'Splits de functie: breukdeel (3−x²)/(x−2) en machtsdeel x³',                'quotientregel.combi_somregel'),
  (2, 'Differentieer de breuk met de quotiëntregel: stel t = 3−x², n = x−2',       'quotientregel.tn_identificeren'),
  (3, 'Bereken t'' = −2x  en  n'' = 1',                                             'quotientregel.t_differentieren'),
  (4, 't''n − tn'' = −2x(x−2) − (3−x²) = −2x²+4x−3+x² = −x²+4x−3',              'quotientregel.formule_volgorde'),
  (5, 'Quotiëntdeel: (−x²+4x−3)/(x−2)²',                                           'quotientregel.noemer_kwadraat'),
  (6, 'Differentieer het machtsdeel: d/dx[x³] = 3x²',                              'quotientregel.combi_somregel'),
  (7, 'f''(x) = (−x²+4x−3)/(x−2)² + 3x²',                                         'quotientregel.combi_somregel')
) as s(step_order, step_description, root_cause_slug)
left join public.root_causes rc on rc.slug = s.root_cause_slug
on conflict (question_id, step_order) do update
  set step_description = excluded.step_description,
      root_cause_id    = excluded.root_cause_id;
