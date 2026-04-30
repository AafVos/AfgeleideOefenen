-- Herstructurering leerpad: 8 topics → 5 topics.
-- Basis krijgt 3 clusters; somregel 2 clusters.
-- machtsregel, wortel_negatief en herleiden worden verwijderd.
-- =====================================================================

-- 1. Verwijder niet meer benodigde topics (cascade naar clusters, root_causes, questions)
delete from public.topics where slug in ('machtsregel', 'wortel_negatief', 'herleiden');

-- 2. Herorden overgebleven topics
insert into public.topics (slug, title, order_index, is_unlocked_by_default)
values
  ('basis',         'Basis',              1, true),
  ('somregel',      'De Somregel',        2, false),
  ('productregel',  'De Productregel',    3, false),
  ('quotientregel', 'De Quotiëntregel',   4, false),
  ('kettingregel',  'De Kettingregel',    5, false)
on conflict (slug) do update
  set title                  = excluded.title,
      order_index            = excluded.order_index,
      is_unlocked_by_default = excluded.is_unlocked_by_default;

-- 3. Verwijder oude clusters van basis en somregel
delete from public.topic_clusters
  where slug in (
    'een_term_x_macht',
    'twee_termen', 'drie_plus_termen', 'constante_factor', 'genest'
  );

-- 4. Nieuwe clusters voor basis
insert into public.topic_clusters (topic_id, slug, title, order_index)
select tt.id, c.slug, c.title, c.order_index
from public.topics tt
cross join (values
  ('standaard_ax_n',  'Standaard ax^n',              1),
  ('wortel_negatief', 'Wortels en negatieve machten', 2),
  ('een_macht_maken', 'Eén macht maken',              3)
) as c(slug, title, order_index)
where tt.slug = 'basis'
on conflict (topic_id, slug) do update
  set title = excluded.title, order_index = excluded.order_index;

-- 5. Nieuwe clusters voor somregel
insert into public.topic_clusters (topic_id, slug, title, order_index)
select tt.id, c.slug, c.title, c.order_index
from public.topics tt
cross join (values
  ('som_termen', 'Somregel',          1),
  ('haakjes',    'Haakjes uitwerken', 2)
) as c(slug, title, order_index)
where tt.slug = 'somregel'
on conflict (topic_id, slug) do update
  set title = excluded.title, order_index = excluded.order_index;

-- 6. Root causes voor basis
insert into public.root_causes (topic_id, slug, description)
select tt.id, r.slug, r.description
from public.topics tt
cross join (values
  ('basis.exponent_verlagen',      'Exponent met 1 verlagen na differentiëren'),
  ('basis.coeff_vermenigvuldigen', 'Coëfficiënt correct berekenen: n·a'),
  ('basis.constante_term',         'Constante term differentieert naar nul'),
  ('basis.schrijf_als_macht',      'Wortel of breuk herschrijven als macht van x'),
  ('basis.negatieve_exp',          'Minteken correct meenemen bij negatieve exponent'),
  ('basis.gebroken_exp',           'Gebroken exponent als coëfficiënt schrijven na differentiëren'),
  ('basis.exponenten_optellen',    'Exponenten optellen bij vermenigvuldigen: x^a · x^b = x^{a+b}'),
  ('basis.exponenten_aftrekken',   'Exponenten aftrekken bij delen: x^a / x^b = x^{a-b}'),
  ('basis.macht_van_macht',        'Macht van een macht: (x^a)^b = x^{a·b}')
) as r(slug, description)
where tt.slug = 'basis'
on conflict (slug) do update set description = excluded.description;

-- 7. Root causes voor somregel
insert into public.root_causes (topic_id, slug, description)
select tt.id, r.slug, r.description
from public.topics tt
cross join (values
  ('somregel.term_voor_term',         'Elke term afzonderlijk differentiëren'),
  ('somregel.constante_factor',       'Constante factor correct meenemen bij differentiëren'),
  ('somregel.constante_nul',          'Constante term differentieert naar nul'),
  ('somregel.herleid_eerst',          'Eerst herleiden naar som van machten, dan differentiëren'),
  ('somregel.haakjes_uitwerken',      'Haakjes volledig uitwerken vóór differentiëren'),
  ('somregel.gelijknamige_samenvoegen', 'Gelijknamige termen samenvoegen na uitwerken haakjes')
) as r(slug, description)
where tt.slug = 'somregel'
on conflict (slug) do update set description = excluded.description;

-- 8. Herplaats basis-vragen (delete + reinsert via seed)
delete from public.questions
  where is_ai_generated = false
    and topic_id = (select id from public.topics where slug = 'basis');

delete from public.questions
  where is_ai_generated = false
    and topic_id = (select id from public.topics where slug = 'somregel');

with
  t  as (select id from public.topics where slug = 'basis'),
  cl as (
    select tc.slug, tc.id
    from public.topic_clusters tc
    join public.topics tt on tt.id = tc.topic_id
    where tt.slug = 'basis'
  )
insert into public.questions
  (topic_id, cluster_id, body, latex_body, answer, latex_answer,
   difficulty, root_cause_tags, is_ai_generated, order_index)
values
  -- standaard_ax_n — diff 1
  ((select id from t), (select id from cl where slug = 'standaard_ax_n'),
   'Bepaal f''(x) als f(x) = 3x²', 'f(x) = 3x^{2}', '6x', '6x',
   1, array['basis.exponent_verlagen','basis.coeff_vermenigvuldigen'], false, 1),
  ((select id from t), (select id from cl where slug = 'standaard_ax_n'),
   'Bepaal f''(x) als f(x) = 5x³', 'f(x) = 5x^{3}', '15x^2', '15x^{2}',
   1, array['basis.exponent_verlagen','basis.coeff_vermenigvuldigen'], false, 2),
  ((select id from t), (select id from cl where slug = 'standaard_ax_n'),
   'Bepaal f''(x) als f(x) = 2x⁴', 'f(x) = 2x^{4}', '8x^3', '8x^{3}',
   1, array['basis.exponent_verlagen','basis.coeff_vermenigvuldigen'], false, 3),
  ((select id from t), (select id from cl where slug = 'standaard_ax_n'),
   'Bepaal f''(x) als f(x) = 4x', 'f(x) = 4x', '4', '4',
   1, array['basis.exponent_verlagen','basis.constante_term'], false, 4),
  ((select id from t), (select id from cl where slug = 'standaard_ax_n'),
   'Bepaal f''(x) als f(x) = x⁵', 'f(x) = x^{5}', '5x^4', '5x^{4}',
   1, array['basis.exponent_verlagen','basis.coeff_vermenigvuldigen'], false, 5),
  -- standaard_ax_n — diff 2
  ((select id from t), (select id from cl where slug = 'standaard_ax_n'),
   'Bepaal f''(x) als f(x) = 6x²', 'f(x) = 6x^{2}', '12x', '12x',
   2, array['basis.exponent_verlagen','basis.coeff_vermenigvuldigen'], false, 6),
  ((select id from t), (select id from cl where slug = 'standaard_ax_n'),
   'Bepaal f''(x) als f(x) = 7x³', 'f(x) = 7x^{3}', '21x^2', '21x^{2}',
   2, array['basis.exponent_verlagen','basis.coeff_vermenigvuldigen'], false, 7),
  ((select id from t), (select id from cl where slug = 'standaard_ax_n'),
   'Bepaal f''(x) als f(x) = (1/2)x⁴', 'f(x) = \dfrac{1}{2}x^{4}', '2x^3', '2x^{3}',
   2, array['basis.exponent_verlagen','basis.coeff_vermenigvuldigen'], false, 8),
  ((select id from t), (select id from cl where slug = 'standaard_ax_n'),
   'Bepaal f''(x) als f(x) = (2/3)x³', 'f(x) = \dfrac{2}{3}x^{3}', '2x^2', '2x^{2}',
   2, array['basis.exponent_verlagen','basis.coeff_vermenigvuldigen'], false, 9),
  -- wortel_negatief — diff 1
  ((select id from t), (select id from cl where slug = 'wortel_negatief'),
   'Bepaal f''(x) als f(x) = 4/x²', 'f(x) = \dfrac{4}{x^{2}}', '-8x^(-3)', '-8x^{-3}',
   1, array['basis.schrijf_als_macht','basis.negatieve_exp','basis.coeff_vermenigvuldigen'], false, 1),
  ((select id from t), (select id from cl where slug = 'wortel_negatief'),
   'Bepaal f''(x) als f(x) = 3x^{-1}', 'f(x) = 3x^{-1}', '-3x^(-2)', '-3x^{-2}',
   1, array['basis.negatieve_exp','basis.coeff_vermenigvuldigen'], false, 2),
  ((select id from t), (select id from cl where slug = 'wortel_negatief'),
   'Bepaal f''(x) als f(x) = 2√x', 'f(x) = 2\sqrt{x}', 'x^(-1/2)', 'x^{-1/2}',
   1, array['basis.schrijf_als_macht','basis.gebroken_exp'], false, 3),
  ((select id from t), (select id from cl where slug = 'wortel_negatief'),
   'Bepaal f''(x) als f(x) = 6/x³', 'f(x) = \dfrac{6}{x^{3}}', '-18x^(-4)', '-18x^{-4}',
   1, array['basis.schrijf_als_macht','basis.negatieve_exp','basis.coeff_vermenigvuldigen'], false, 4),
  ((select id from t), (select id from cl where slug = 'wortel_negatief'),
   'Bepaal f''(x) als f(x) = 3∛x', 'f(x) = 3\sqrt[3]{x}', 'x^(-2/3)', 'x^{-2/3}',
   1, array['basis.schrijf_als_macht','basis.gebroken_exp'], false, 5),
  -- wortel_negatief — diff 2
  ((select id from t), (select id from cl where slug = 'wortel_negatief'),
   'Bepaal f''(x) als f(x) = 5/(2x²)', 'f(x) = \dfrac{5}{2x^{2}}', '-5x^(-3)', '-5x^{-3}',
   2, array['basis.schrijf_als_macht','basis.negatieve_exp','basis.coeff_vermenigvuldigen'], false, 6),
  ((select id from t), (select id from cl where slug = 'wortel_negatief'),
   'Bepaal f''(x) als f(x) = 3x^{-4}', 'f(x) = 3x^{-4}', '-12x^(-5)', '-12x^{-5}',
   2, array['basis.negatieve_exp','basis.coeff_vermenigvuldigen'], false, 7),
  ((select id from t), (select id from cl where slug = 'wortel_negatief'),
   'Bepaal f''(x) als f(x) = (1/3)x^{3/2}', 'f(x) = \dfrac{1}{3}x^{\frac{3}{2}}',
   '(1/2)x^(1/2)', '\dfrac{1}{2}x^{\frac{1}{2}}',
   2, array['basis.gebroken_exp','basis.coeff_vermenigvuldigen'], false, 8),
  ((select id from t), (select id from cl where slug = 'wortel_negatief'),
   'Bepaal f''(x) als f(x) = 4x^{-1/2}', 'f(x) = 4x^{-\frac{1}{2}}',
   '-2x^(-3/2)', '-2x^{-\frac{3}{2}}',
   2, array['basis.negatieve_exp','basis.gebroken_exp','basis.coeff_vermenigvuldigen'], false, 9),
  -- een_macht_maken — diff 1
  ((select id from t), (select id from cl where slug = 'een_macht_maken'),
   'Bepaal f''(x) als f(x) = x² · x³', 'f(x) = x^{2} \cdot x^{3}', '5x^4', '5x^{4}',
   1, array['basis.exponenten_optellen','basis.exponent_verlagen'], false, 1),
  ((select id from t), (select id from cl where slug = 'een_macht_maken'),
   'Bepaal f''(x) als f(x) = x⁶/x²', 'f(x) = \dfrac{x^{6}}{x^{2}}', '4x^3', '4x^{3}',
   1, array['basis.exponenten_aftrekken','basis.exponent_verlagen'], false, 2),
  ((select id from t), (select id from cl where slug = 'een_macht_maken'),
   'Bepaal f''(x) als f(x) = (x³)²', 'f(x) = (x^{3})^{2}', '6x^5', '6x^{5}',
   1, array['basis.macht_van_macht','basis.exponent_verlagen'], false, 3),
  -- een_macht_maken — diff 2
  ((select id from t), (select id from cl where slug = 'een_macht_maken'),
   'Bepaal f''(x) als f(x) = 2x³ · x', 'f(x) = 2x^{3} \cdot x', '8x^3', '8x^{3}',
   2, array['basis.exponenten_optellen','basis.coeff_vermenigvuldigen'], false, 4),
  ((select id from t), (select id from cl where slug = 'een_macht_maken'),
   'Bepaal f''(x) als f(x) = 4x⁶/x³', 'f(x) = \dfrac{4x^{6}}{x^{3}}', '12x^2', '12x^{2}',
   2, array['basis.exponenten_aftrekken','basis.coeff_vermenigvuldigen'], false, 5),
  ((select id from t), (select id from cl where slug = 'een_macht_maken'),
   'Bepaal f''(x) als f(x) = 3x · x^{-2}', 'f(x) = 3x \cdot x^{-2}', '-3x^(-2)', '-3x^{-2}',
   2, array['basis.exponenten_optellen','basis.negatieve_exp'], false, 6),
  -- een_macht_maken — diff 3
  ((select id from t), (select id from cl where slug = 'een_macht_maken'),
   'Bepaal f''(x) als f(x) = √x · x', 'f(x) = \sqrt{x} \cdot x',
   '(3/2)x^(1/2)', '\dfrac{3}{2}x^{\frac{1}{2}}',
   3, array['basis.schrijf_als_macht','basis.exponenten_optellen','basis.gebroken_exp'], false, 7),
  ((select id from t), (select id from cl where slug = 'een_macht_maken'),
   'Bepaal f''(x) als f(x) = x² · √x', 'f(x) = x^{2} \cdot \sqrt{x}',
   '(5/2)x^(3/2)', '\dfrac{5}{2}x^{\frac{3}{2}}',
   3, array['basis.schrijf_als_macht','basis.exponenten_optellen','basis.gebroken_exp'], false, 8),
  ((select id from t), (select id from cl where slug = 'een_macht_maken'),
   'Bepaal f''(x) als f(x) = x³/∛x', 'f(x) = \dfrac{x^{3}}{\sqrt[3]{x}}',
   '(8/3)x^(5/3)', '\dfrac{8}{3}x^{\frac{5}{3}}',
   3, array['basis.schrijf_als_macht','basis.exponenten_aftrekken','basis.gebroken_exp'], false, 9);

-- Stap: √x · x → x^{3/2}
with q as (
  select id from public.questions
  where latex_body = 'f(x) = \sqrt{x} \cdot x'
    and topic_id = (select id from public.topics where slug = 'basis')
  limit 1
)
insert into public.question_steps (question_id, step_order, step_description, root_cause_id)
select (select id from q), s.step_order, s.step_description, rc.id
from (values
  (1, 'Schrijf de wortel als macht: √x = x^{1/2}',                         'basis.schrijf_als_macht'),
  (2, 'Vermenigvuldig de machten: x^{1/2} · x = x^{1/2 + 1} = x^{3/2}',   'basis.exponenten_optellen'),
  (3, 'f(x) = x^{3/2}',                                                      'basis.exponenten_optellen'),
  (4, 'Pas de machtsregel toe: f''(x) = (3/2) · x^{3/2 − 1}',              'basis.gebroken_exp'),
  (5, 'f''(x) = (3/2)x^{1/2}',                                              'basis.gebroken_exp')
) as s(step_order, step_description, root_cause_slug)
left join public.root_causes rc on rc.slug = s.root_cause_slug
on conflict (question_id, step_order) do update
  set step_description = excluded.step_description,
      root_cause_id    = excluded.root_cause_id;

-- Somregel vragen
with
  t  as (select id from public.topics where slug = 'somregel'),
  cl as (
    select tc.slug, tc.id
    from public.topic_clusters tc
    join public.topics tt on tt.id = tc.topic_id
    where tt.slug = 'somregel'
  )
insert into public.questions
  (topic_id, cluster_id, body, latex_body, answer, latex_answer,
   difficulty, root_cause_tags, is_ai_generated, order_index)
values
  -- som_termen — diff 1
  ((select id from t), (select id from cl where slug = 'som_termen'),
   'Bepaal f''(x) als f(x) = 3x² + 2x', 'f(x) = 3x^{2} + 2x', '6x+2', '6x+2',
   1, array['somregel.term_voor_term','somregel.constante_factor'], false, 1),
  ((select id from t), (select id from cl where slug = 'som_termen'),
   'Bepaal f''(x) als f(x) = x³ − 5x + 1', 'f(x) = x^{3} - 5x + 1', '3x^2-5', '3x^{2}-5',
   1, array['somregel.term_voor_term','somregel.constante_nul'], false, 2),
  ((select id from t), (select id from cl where slug = 'som_termen'),
   'Bepaal f''(x) als f(x) = 4x² + 3x − 2', 'f(x) = 4x^{2} + 3x - 2', '8x+3', '8x+3',
   1, array['somregel.term_voor_term','somregel.constante_nul'], false, 3),
  -- som_termen — diff 2
  ((select id from t), (select id from cl where slug = 'som_termen'),
   'Bepaal f''(x) als f(x) = 2x³ − 3x^{-1}', 'f(x) = 2x^{3} - 3x^{-1}',
   '6x^2+3x^(-2)', '6x^{2}+3x^{-2}',
   2, array['somregel.term_voor_term','somregel.constante_factor'], false, 4),
  ((select id from t), (select id from cl where slug = 'som_termen'),
   'Bepaal f''(x) als f(x) = x^{1/2} + 4x^{-2}', 'f(x) = x^{\frac{1}{2}} + 4x^{-2}',
   '(1/2)x^(-1/2)-8x^(-3)', '\dfrac{1}{2}x^{-\frac{1}{2}}-8x^{-3}',
   2, array['somregel.term_voor_term','somregel.constante_factor'], false, 5),
  ((select id from t), (select id from cl where slug = 'som_termen'),
   'Bepaal f''(x) als f(x) = 5x² − 2/x', 'f(x) = 5x^{2} - \dfrac{2}{x}',
   '10x+2x^(-2)', '10x+2x^{-2}',
   2, array['somregel.term_voor_term','somregel.herleid_eerst'], false, 6),
  -- som_termen — diff 3
  ((select id from t), (select id from cl where slug = 'som_termen'),
   'Bepaal f''(x) als f(x) = x·x² + 3x', 'f(x) = x \cdot x^{2} + 3x',
   '3x^2+3', '3x^{2}+3',
   3, array['somregel.herleid_eerst','somregel.term_voor_term'], false, 7),
  ((select id from t), (select id from cl where slug = 'som_termen'),
   'Bepaal f''(x) als f(x) = (x³ + 1)/x²', 'f(x) = \dfrac{x^{3}+1}{x^{2}}',
   '1-2x^(-3)', '1-2x^{-3}',
   3, array['somregel.herleid_eerst','somregel.term_voor_term'], false, 8),
  ((select id from t), (select id from cl where slug = 'som_termen'),
   'Bepaal f''(x) als f(x) = x⁴/x + 2x', 'f(x) = \dfrac{x^{4}}{x} + 2x',
   '3x^2+2', '3x^{2}+2',
   3, array['somregel.herleid_eerst','somregel.term_voor_term'], false, 9),
  -- haakjes — diff 2
  ((select id from t), (select id from cl where slug = 'haakjes'),
   'Bepaal f''(x) als f(x) = (x+1)(x+3)', 'f(x) = (x+1)(x+3)', '2x+4', '2x+4',
   2, array['somregel.haakjes_uitwerken','somregel.term_voor_term'], false, 1),
  ((select id from t), (select id from cl where slug = 'haakjes'),
   'Bepaal f''(x) als f(x) = (x+2)(x−3)', 'f(x) = (x+2)(x-3)', '2x-1', '2x-1',
   2, array['somregel.haakjes_uitwerken','somregel.term_voor_term'], false, 2),
  ((select id from t), (select id from cl where slug = 'haakjes'),
   'Bepaal f''(x) als f(x) = x(x² + 3x − 1)', 'f(x) = x(x^{2} + 3x - 1)',
   '3x^2+6x-1', '3x^{2}+6x-1',
   2, array['somregel.haakjes_uitwerken','somregel.term_voor_term'], false, 3),
  ((select id from t), (select id from cl where slug = 'haakjes'),
   'Bepaal f''(x) als f(x) = (2x+1)(x−3)', 'f(x) = (2x+1)(x-3)', '4x-5', '4x-5',
   2, array['somregel.haakjes_uitwerken','somregel.gelijknamige_samenvoegen'], false, 4),
  ((select id from t), (select id from cl where slug = 'haakjes'),
   'Bepaal f''(x) als f(x) = (x+1)²', 'f(x) = (x+1)^{2}', '2x+2', '2x+2',
   2, array['somregel.haakjes_uitwerken','somregel.gelijknamige_samenvoegen'], false, 5),
  -- haakjes — diff 3
  ((select id from t), (select id from cl where slug = 'haakjes'),
   'Bepaal f''(x) als f(x) = (x+1)²·x', 'f(x) = (x+1)^{2} \cdot x',
   '3x^2+4x+1', '3x^{2}+4x+1',
   3, array['somregel.haakjes_uitwerken','somregel.gelijknamige_samenvoegen'], false, 6),
  ((select id from t), (select id from cl where slug = 'haakjes'),
   'Bepaal f''(x) als f(x) = (x²−1)(x+2)', 'f(x) = (x^{2}-1)(x+2)',
   '3x^2+4x-1', '3x^{2}+4x-1',
   3, array['somregel.haakjes_uitwerken','somregel.gelijknamige_samenvoegen'], false, 7),
  ((select id from t), (select id from cl where slug = 'haakjes'),
   'Bepaal f''(x) als f(x) = (3x−1)(x+2)', 'f(x) = (3x-1)(x+2)', '6x+5', '6x+5',
   3, array['somregel.haakjes_uitwerken','somregel.gelijknamige_samenvoegen'], false, 8),
  ((select id from t), (select id from cl where slug = 'haakjes'),
   'Bepaal f''(x) als f(x) = (x+1)³', 'f(x) = (x+1)^{3}', '3x^2+6x+3', '3x^{2}+6x+3',
   3, array['somregel.haakjes_uitwerken','somregel.gelijknamige_samenvoegen'], false, 9);

-- Stap: (x+1)(x+3)
with q as (
  select id from public.questions
  where latex_body = 'f(x) = (x+1)(x+3)'
    and topic_id = (select id from public.topics where slug = 'somregel')
  limit 1
)
insert into public.question_steps (question_id, step_order, step_description, root_cause_id)
select (select id from q), s.step_order, s.step_description, rc.id
from (values
  (1, 'Werk de haakjes uit: (x+1)(x+3) = x·x + 3x + x + 3',         'somregel.haakjes_uitwerken'),
  (2, '= x² + 4x + 3  (gelijknamige termen samenvoegen)',             'somregel.gelijknamige_samenvoegen'),
  (3, 'f(x) = x² + 4x + 3',                                           'somregel.haakjes_uitwerken'),
  (4, 'Differentieer term voor term: d/dx[x²] = 2x',                  'somregel.term_voor_term'),
  (5, 'd/dx[4x] = 4   en   d/dx[3] = 0',                              'somregel.constante_nul'),
  (6, 'f''(x) = 2x + 4',                                              'somregel.term_voor_term')
) as s(step_order, step_description, root_cause_slug)
left join public.root_causes rc on rc.slug = s.root_cause_slug
on conflict (question_id, step_order) do update
  set step_description = excluded.step_description,
      root_cause_id    = excluded.root_cause_id;

-- =====================================================================
-- Productregel: nieuw cluster haakjes_staan
-- =====================================================================

-- Cluster toevoegen (order_index voor bestaande clusters opschuiven)
update public.topic_clusters
  set order_index = order_index + 1
  where topic_id = (select id from public.topics where slug = 'productregel');

insert into public.topic_clusters (topic_id, slug, title, order_index)
select tt.id, 'haakjes_staan', 'Haakjes staan', 1
from public.topics tt
where tt.slug = 'productregel'
on conflict (topic_id, slug) do update
  set title = excluded.title, order_index = excluded.order_index;

-- Root cause
insert into public.root_causes (topic_id, slug, description)
select tt.id, 'productregel.haakjes_staan', 'Haakjes laten staan in het antwoord (niet uitwerken)'
from public.topics tt
where tt.slug = 'productregel'
on conflict (slug) do update set description = excluded.description;

-- Vragen
with
  t  as (select id from public.topics where slug = 'productregel'),
  cl as (select id from public.topic_clusters
         where slug = 'haakjes_staan'
           and topic_id = (select id from public.topics where slug = 'productregel'))
insert into public.questions
  (topic_id, cluster_id, body, latex_body, answer, latex_answer,
   difficulty, root_cause_tags, is_ai_generated, order_index)
values
  ((select id from t), (select id from cl),
   'Bepaal f''(x) als f(x) = (x+3)². Gebruik de productregel.',
   'f(x) = (x+3)^{2}', '2(x+3)', '2(x+3)',
   2, array['productregel.fg_identificeren','productregel.formule_invullen','productregel.haakjes_staan'], false, 1),
  ((select id from t), (select id from cl),
   'Bepaal f''(x) als f(x) = (2x−5)². Gebruik de productregel.',
   'f(x) = (2x-5)^{2}', '4(2x-5)', '4(2x-5)',
   2, array['productregel.fg_identificeren','productregel.formule_invullen','productregel.haakjes_staan'], false, 2),
  ((select id from t), (select id from cl),
   'Bepaal f''(x) als f(x) = (3x+1)(x−2). Gebruik de productregel.',
   'f(x) = (3x+1)(x-2)', '3(x-2)+(3x+1)', '3(x-2)+(3x+1)',
   2, array['productregel.fg_identificeren','productregel.formule_invullen','productregel.haakjes_staan'], false, 3),
  ((select id from t), (select id from cl),
   'Bepaal f''(x) als f(x) = (2x+1)². Gebruik de productregel.',
   'f(x) = (2x+1)^{2}', '4(2x+1)', '4(2x+1)',
   2, array['productregel.fg_identificeren','productregel.formule_invullen','productregel.haakjes_staan'], false, 4),
  ((select id from t), (select id from cl),
   'Bepaal f''(x) als f(x) = (2−3x²)(2+7x). Gebruik de productregel.',
   'f(x) = (2-3x^{2})(2+7x)',
   '-6x(2+7x)+7(2-3x^2)', '-6x(2+7x)+7(2-3x^{2})',
   2, array['productregel.fg_identificeren','productregel.formule_invullen','productregel.haakjes_staan'], false, 5),
  ((select id from t), (select id from cl),
   'Bepaal f''(x) als f(x) = (x²−4)(x³+2x+3). Gebruik de productregel.',
   'f(x) = (x^{2}-4)(x^{3}+2x+3)',
   '2x(x^3+2x+3)+(x^2-4)(3x^2+2)', '2x(x^{3}+2x+3)+(x^{2}-4)(3x^{2}+2)',
   3, array['productregel.fg_identificeren','productregel.f_differentieren','productregel.g_differentieren','productregel.haakjes_staan'], false, 6),
  ((select id from t), (select id from cl),
   'Bepaal g''(x) als g(x) = (3x²−4)². Gebruik de productregel.',
   'g(x) = (3x^{2}-4)^{2}', '12x(3x^2-4)', '12x(3x^{2}-4)',
   3, array['productregel.fg_identificeren','productregel.formule_invullen','productregel.haakjes_staan'], false, 7),
  ((select id from t), (select id from cl),
   'Bepaal f''(x) als f(x) = (x³+1)(x²−2). Gebruik de productregel.',
   'f(x) = (x^{3}+1)(x^{2}-2)',
   '3x^2(x^2-2)+2x(x^3+1)', '3x^{2}(x^{2}-2)+2x(x^{3}+1)',
   3, array['productregel.fg_identificeren','productregel.f_differentieren','productregel.g_differentieren','productregel.haakjes_staan'], false, 8),
  ((select id from t), (select id from cl),
   'Bepaal h''(x) als h(x) = (x²−3x)(x³+x²+x). Gebruik de productregel.',
   'h(x) = (x^{2}-3x)(x^{3}+x^{2}+x)',
   '(2x-3)(x^3+x^2+x)+(x^2-3x)(3x^2+2x+1)',
   '(2x-3)(x^{3}+x^{2}+x)+(x^{2}-3x)(3x^{2}+2x+1)',
   3, array['productregel.fg_identificeren','productregel.f_differentieren','productregel.g_differentieren','productregel.haakjes_staan'], false, 9);

-- Stappenplan: f(x) = (x²-4)(x³+2x+3)
with q as (
  select id from public.questions
  where latex_body = 'f(x) = (x^{2}-4)(x^{3}+2x+3)'
    and topic_id = (select id from public.topics where slug = 'productregel')
  limit 1
)
insert into public.question_steps (question_id, step_order, step_description, root_cause_id)
select (select id from q), s.step_order, s.step_description, rc.id
from (values
  (1, 'Benoem f = x²-4 en g = x³+2x+3',                               'productregel.fg_identificeren'),
  (2, 'Differentieer f: f'' = 2x',                                     'productregel.f_differentieren'),
  (3, 'Differentieer g: g'' = 3x²+2',                                  'productregel.g_differentieren'),
  (4, 'Pas productregel toe: f''(x) = f''·g + f·g''',                 'productregel.formule_invullen'),
  (5, 'f''(x) = 2x·(x³+2x+3) + (x²-4)·(3x²+2)',                      'productregel.haakjes_staan'),
  (6, 'Laat haakjes staan: f''(x) = 2x(x³+2x+3) + (x²-4)(3x²+2)',    'productregel.haakjes_staan')
) as s(step_order, step_description, root_cause_slug)
left join public.root_causes rc on rc.slug = s.root_cause_slug
on conflict (question_id, step_order) do update
  set step_description = excluded.step_description,
      root_cause_id    = excluded.root_cause_id;
