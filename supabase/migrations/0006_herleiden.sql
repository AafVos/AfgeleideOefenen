-- Nieuw topic «Herleiden» na somregel (positie 5).
-- Productregel / quotiëntregel / kettingregel schuiven elk één op.

insert into public.topics (slug, title, order_index, is_unlocked_by_default)
values
  ('basis',           'Basis',                           1, true),
  ('wortel_negatief', 'Wortels en negatieve exponenten', 2, false),
  ('machtsregel',     'De Machtsregel',                  3, false),
  ('somregel',        'De Somregel',                     4, false),
  ('herleiden',       'Herleiden',                       5, false),
  ('productregel',    'De Productregel',                 6, false),
  ('quotientregel',   'De Quotiëntregel',                7, false),
  ('kettingregel',    'De Kettingregel',                 8, false)
on conflict (slug) do update
  set title                  = excluded.title,
      order_index            = excluded.order_index,
      is_unlocked_by_default = excluded.is_unlocked_by_default;

insert into public.topic_clusters (topic_id, slug, title, order_index)
select tt.id, c.slug, c.title, c.order_index
from public.topics tt
cross join (values
  ('eenvoudig', 'Eenvoudig herleiden',     1),
  ('som',       'Breuk met som in teller', 2)
) as c(slug, title, order_index)
where tt.slug = 'herleiden'
on conflict (topic_id, slug) do update
  set title = excluded.title, order_index = excluded.order_index;

insert into public.root_causes (topic_id, slug, description)
select tt.id, r.slug, r.description
from public.topics tt
cross join (values
  ('herleiden.breuk_naar_macht',
   'Breuk a/x^n herschrijven als a·x^{-n}'),
  ('herleiden.som_splitsen',
   'Breuk met som in teller opsplitsen in afzonderlijke termen'),
  ('herleiden.vereenvoudigen',
   'Termen vereenvoudigen na splitsen (bijv. x³/(3x²) = (1/3)x)'),
  ('herleiden.diff_na_herleiden',
   'Na herschrijven de machtsregel correct toepassen per term'),
  ('herleiden.coeff_berekenen',
   'Nieuwe coëfficiënt correct berekenen (n · a)')
) as r(slug, description)
where tt.slug = 'herleiden'
on conflict (slug) do update set description = excluded.description;

delete from public.questions
  where is_ai_generated = false
    and topic_id = (select id from public.topics where slug = 'herleiden');

with
  t  as (select id from public.topics where slug = 'herleiden'),
  cl as (
    select tc.slug, tc.id
    from public.topic_clusters tc
    join public.topics tt on tt.id = tc.topic_id
    where tt.slug = 'herleiden'
  )
insert into public.questions
  (topic_id, cluster_id, body, latex_body, answer, latex_answer,
   difficulty, root_cause_tags, is_ai_generated, order_index)
values

  -- eenvoudig — difficulty 1
  ((select id from t), (select id from cl where slug = 'eenvoudig'),
   'Bepaal f''(x) als f(x) = 4/x²',
   'f(x) = \dfrac{4}{x^{2}}',
   '-8x^(-3)', '-8x^{-3}',
   1, array['herleiden.breuk_naar_macht','herleiden.coeff_berekenen'],
   false, 1),

  ((select id from t), (select id from cl where slug = 'eenvoudig'),
   'Bepaal f''(x) als f(x) = 1/x³',
   'f(x) = \dfrac{1}{x^{3}}',
   '-3x^(-4)', '-3x^{-4}',
   1, array['herleiden.breuk_naar_macht','herleiden.diff_na_herleiden'],
   false, 2),

  ((select id from t), (select id from cl where slug = 'eenvoudig'),
   'Bepaal f''(x) als f(x) = 6/x³',
   'f(x) = \dfrac{6}{x^{3}}',
   '-18x^(-4)', '-18x^{-4}',
   1, array['herleiden.breuk_naar_macht','herleiden.coeff_berekenen'],
   false, 3),

  ((select id from t), (select id from cl where slug = 'eenvoudig'),
   'Bepaal f''(x) als f(x) = 3/x⁵',
   'f(x) = \dfrac{3}{x^{5}}',
   '-15x^(-6)', '-15x^{-6}',
   1, array['herleiden.breuk_naar_macht','herleiden.coeff_berekenen'],
   false, 4),

  ((select id from t), (select id from cl where slug = 'eenvoudig'),
   'Bepaal f''(x) als f(x) = 10/x²',
   'f(x) = \dfrac{10}{x^{2}}',
   '-20x^(-3)', '-20x^{-3}',
   1, array['herleiden.breuk_naar_macht','herleiden.coeff_berekenen'],
   false, 5),

  -- eenvoudig — difficulty 2
  ((select id from t), (select id from cl where slug = 'eenvoudig'),
   'Bepaal f''(x) als f(x) = 8/x³',
   'f(x) = \dfrac{8}{x^{3}}',
   '-24x^(-4)', '-24x^{-4}',
   2, array['herleiden.breuk_naar_macht','herleiden.coeff_berekenen'],
   false, 6),

  ((select id from t), (select id from cl where slug = 'eenvoudig'),
   'Bepaal f''(x) als f(x) = 2/x⁷',
   'f(x) = \dfrac{2}{x^{7}}',
   '-14x^(-8)', '-14x^{-8}',
   2, array['herleiden.breuk_naar_macht','herleiden.coeff_berekenen'],
   false, 7),

  ((select id from t), (select id from cl where slug = 'eenvoudig'),
   'Bepaal f''(x) als f(x) = 5/(2x²)',
   'f(x) = \dfrac{5}{2x^{2}}',
   '-5x^(-3)', '-5x^{-3}',
   2, array['herleiden.breuk_naar_macht','herleiden.coeff_berekenen'],
   false, 8),

  ((select id from t), (select id from cl where slug = 'eenvoudig'),
   'Bepaal f''(x) als f(x) = 12/x⁴',
   'f(x) = \dfrac{12}{x^{4}}',
   '-48x^(-5)', '-48x^{-5}',
   2, array['herleiden.breuk_naar_macht','herleiden.coeff_berekenen'],
   false, 9),

  -- som — difficulty 2
  ((select id from t), (select id from cl where slug = 'som'),
   'Bepaal f''(x) als f(x) = (x + 1)/x',
   'f(x) = \dfrac{x + 1}{x}',
   '-x^(-2)', '-x^{-2}',
   2, array['herleiden.som_splitsen','herleiden.diff_na_herleiden'],
   false, 1),

  ((select id from t), (select id from cl where slug = 'som'),
   'Bepaal f''(x) als f(x) = (x² + 1)/x',
   'f(x) = \dfrac{x^{2}+1}{x}',
   '1-x^(-2)', '1-x^{-2}',
   2, array['herleiden.som_splitsen','herleiden.diff_na_herleiden'],
   false, 2),

  ((select id from t), (select id from cl where slug = 'som'),
   'Bepaal f''(x) als f(x) = (x² − 1)/x',
   'f(x) = \dfrac{x^{2}-1}{x}',
   '1+x^(-2)', '1+x^{-2}',
   2, array['herleiden.som_splitsen','herleiden.vereenvoudigen'],
   false, 3),

  ((select id from t), (select id from cl where slug = 'som'),
   'Bepaal f''(x) als f(x) = (x³ + 1)/x²',
   'f(x) = \dfrac{x^{3}+1}{x^{2}}',
   '1-2x^(-3)', '1-2x^{-3}',
   2, array['herleiden.som_splitsen','herleiden.coeff_berekenen'],
   false, 4),

  ((select id from t), (select id from cl where slug = 'som'),
   'Bepaal f''(x) als f(x) = 5x² − 5/x²',
   'f(x) = 5x^{2} - \dfrac{5}{x^{2}}',
   '10x+10x^(-3)', '10x+10x^{-3}',
   2, array['herleiden.breuk_naar_macht','herleiden.coeff_berekenen'],
   false, 5),

  ((select id from t), (select id from cl where slug = 'som'),
   'Bepaal h''(x) als h(x) = 6 − (x² − 1)/x',
   'h(x) = 6 - \dfrac{x^{2}-1}{x}',
   '-1-x^(-2)', '-1-x^{-2}',
   2, array['herleiden.som_splitsen','herleiden.vereenvoudigen'],
   false, 6),

  -- som — difficulty 3
  ((select id from t), (select id from cl where slug = 'som'),
   'Bepaal g''(x) als g(x) = (x³ + 1)/(3x²)',
   'g(x) = \dfrac{x^{3}+1}{3x^{2}}',
   '(1/3)-(2/3)x^(-3)', '\dfrac{1}{3}-\dfrac{2}{3}x^{-3}',
   3, array['herleiden.som_splitsen','herleiden.vereenvoudigen','herleiden.coeff_berekenen'],
   false, 7),

  ((select id from t), (select id from cl where slug = 'som'),
   'Bepaal g''(x) als g(x) = 5/(2x²) − 2x²/5',
   'g(x) = \dfrac{5}{2x^{2}} - \dfrac{2x^{2}}{5}',
   '-5x^(-3)-(4/5)x', '-5x^{-3}-\dfrac{4}{5}x',
   3, array['herleiden.breuk_naar_macht','herleiden.coeff_berekenen'],
   false, 8),

  ((select id from t), (select id from cl where slug = 'som'),
   'Bepaal f''(x) als f(x) = (2x³ − 3)/x²',
   'f(x) = \dfrac{2x^{3}-3}{x^{2}}',
   '2+6x^(-3)', '2+6x^{-3}',
   3, array['herleiden.som_splitsen','herleiden.coeff_berekenen'],
   false, 9);

-- Stappen: f(x) = 6/x³
with q as (
  select id from public.questions
  where latex_body = 'f(x) = \dfrac{6}{x^{3}}'
    and topic_id = (select id from public.topics where slug = 'herleiden')
  limit 1
)
insert into public.question_steps (question_id, step_order, step_description, root_cause_id)
select (select id from q), s.step_order, s.step_description, rc.id
from (values
  (1, 'Herken de breuk: f(x) = 6/x³ — de noemer is x³',         'herleiden.breuk_naar_macht'),
  (2, 'Schrijf de noemer als negatieve macht: 1/x³ = x^{-3}',    'herleiden.breuk_naar_macht'),
  (3, 'Herschrijf: f(x) = 6·x^{-3}',                             'herleiden.breuk_naar_macht'),
  (4, 'Pas machtsregel toe: f''(x) = -3·6·x^{-3-1}',             'herleiden.diff_na_herleiden'),
  (5, 'Bereken de coëfficiënt: -3·6 = -18',                      'herleiden.coeff_berekenen'),
  (6, 'Antwoord: f''(x) = -18x^{-4}',                            'herleiden.coeff_berekenen')
) as s(step_order, step_description, root_cause_slug)
left join public.root_causes rc on rc.slug = s.root_cause_slug
on conflict (question_id, step_order) do update
  set step_description = excluded.step_description,
      root_cause_id    = excluded.root_cause_id;

-- Stappen: g(x) = (x³+1)/(3x²)
with q as (
  select id from public.questions
  where latex_body = 'g(x) = \dfrac{x^{3}+1}{3x^{2}}'
    and topic_id = (select id from public.topics where slug = 'herleiden')
  limit 1
)
insert into public.question_steps (question_id, step_order, step_description, root_cause_id)
select (select id from q), s.step_order, s.step_description, rc.id
from (values
  (1, 'Splits de breuk: (x³+1)/(3x²) = x³/(3x²) + 1/(3x²)',      'herleiden.som_splitsen'),
  (2, 'Vereenvoudig eerste term: x³/(3x²) = (1/3)·x^{3-2} = (1/3)x', 'herleiden.vereenvoudigen'),
  (3, 'Herschrijf tweede term: 1/(3x²) = (1/3)·x^{-2}',            'herleiden.breuk_naar_macht'),
  (4, 'g(x) = (1/3)x + (1/3)x^{-2}',                               'herleiden.vereenvoudigen'),
  (5, 'Differentieer term 1: d/dx[(1/3)x] = 1/3',                   'herleiden.diff_na_herleiden'),
  (6, 'Differentieer term 2: d/dx[(1/3)x^{-2}] = (1/3)·(-2)x^{-3} = -(2/3)x^{-3}', 'herleiden.coeff_berekenen'),
  (7, 'g''(x) = 1/3 - (2/3)x^{-3}',                                'herleiden.diff_na_herleiden')
) as s(step_order, step_description, root_cause_slug)
left join public.root_causes rc on rc.slug = s.root_cause_slug
on conflict (question_id, step_order) do update
  set step_description = excluded.step_description,
      root_cause_id    = excluded.root_cause_id;
