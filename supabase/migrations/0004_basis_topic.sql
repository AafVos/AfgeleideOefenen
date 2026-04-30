-- Nieuw eerste topic «Basis»: één term x^n met n geheel en n > 0.
-- Machtsregel schuift op en wordt pas vrij na masteren Basis (via vorig-topic-logica).

insert into public.topics (slug, title, order_index, is_unlocked_by_default)
values
  ('basis',         'Basis',             1, true),
  ('machtsregel',   'De Machtsregel',    2, false),
  ('somregel',      'De Somregel',       3, false),
  ('productregel',  'De Productregel',   4, false),
  ('quotientregel', 'De Quotiëntregel',  5, false),
  ('kettingregel',  'De Kettingregel',   6, false)
on conflict (slug) do update
  set title                  = excluded.title,
      order_index            = excluded.order_index,
      is_unlocked_by_default = excluded.is_unlocked_by_default;

insert into public.topic_clusters (topic_id, slug, title, order_index)
select tt.id, c.slug, c.title, c.order_index
from public.topics tt
cross join (values
  ('een_term_x_macht', 'Eén term: x^n (n geheel, n > 0)', 1)
) as c(slug, title, order_index)
where tt.slug = 'basis'
on conflict (topic_id, slug) do update
  set title = excluded.title, order_index = excluded.order_index;

insert into public.root_causes (topic_id, slug, description)
select tt.id, r.slug, r.description
from public.topics tt
cross join (values
  ('basis.n_herkennen',
   'De exponent n herkennen in x^n (n geheel groter dan 0)'),
  ('basis.exponent_maalt',
   'Exponent n voor de x-factor zetten (hier impliciet 1 × n)'),
  ('basis.exponent_verlagen',
   'Exponent na differentiëren met 1 verlagen'),
  ('basis.notatie_fout',
   'Notatiefout in het antwoord (bijv. x ipv 1 voor de afgeleide van x)')
) as r(slug, description)
where tt.slug = 'basis'
on conflict (slug) do update set description = excluded.description;

delete from public.questions
where is_ai_generated = false
  and topic_id = (select id from public.topics where slug = 'basis');

with
  t as (select id from public.topics where slug = 'basis'),
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
  ((select id from t),
   (select id from cl where slug = 'een_term_x_macht'),
   'Bepaal f''(x) als f(x) = x',
   'f(x) = x',
   '1', '1',
   1,
   array['basis.n_herkennen','basis.exponent_maalt'],
   false, 1),
  ((select id from t),
   (select id from cl where slug = 'een_term_x_macht'),
   'Bepaal f''(x) als f(x) = x²',
   'f(x) = x^{2}',
   '2x', '2x',
   1,
   array['basis.n_herkennen','basis.exponent_verlagen'],
   false, 2),
  ((select id from t),
   (select id from cl where slug = 'een_term_x_macht'),
   'Bepaal f''(x) als f(x) = x³',
   'f(x) = x^{3}',
   '3x^2', '3x^{2}',
   1,
   array['basis.n_herkennen','basis.exponent_maalt','basis.exponent_verlagen'],
   false, 3),
  ((select id from t),
   (select id from cl where slug = 'een_term_x_macht'),
   'Bepaal f''(x) als f(x) = x⁴',
   'f(x) = x^{4}',
   '4x^3', '4x^{3}',
   1,
   array['basis.n_herkennen','basis.exponent_maalt','basis.exponent_verlagen'],
   false, 4),
  ((select id from t),
   (select id from cl where slug = 'een_term_x_macht'),
   'Bepaal f''(x) als f(x) = x⁷',
   'f(x) = x^{7}',
   '7x^6', '7x^{6}',
   1,
   array['basis.n_herkennen','basis.exponent_maalt','basis.exponent_verlagen'],
   false, 5),
  ((select id from t),
   (select id from cl where slug = 'een_term_x_macht'),
   'Bepaal f''(x) als f(x) = x⁵',
   'f(x) = x^{5}',
   '5x^4', '5x^{4}',
   2,
   array['basis.n_herkennen','basis.exponent_maalt','basis.exponent_verlagen'],
   false, 6),
  ((select id from t),
   (select id from cl where slug = 'een_term_x_macht'),
   'Bepaal f''(x) als f(x) = x⁸',
   'f(x) = x^{8}',
   '8x^7', '8x^{7}',
   2,
   array['basis.n_herkennen','basis.exponent_maalt','basis.exponent_verlagen'],
   false, 7),
  ((select id from t),
   (select id from cl where slug = 'een_term_x_macht'),
   'Bepaal f''(x) als f(x) = x¹⁰',
   'f(x) = x^{10}',
   '10x^9', '10x^{9}',
   2,
   array['basis.n_herkennen','basis.exponent_maalt','basis.exponent_verlagen'],
   false, 8),
  ((select id from t),
   (select id from cl where slug = 'een_term_x_macht'),
   'Bepaal f''(x) als f(x) = x¹²',
   'f(x) = x^{12}',
   '12x^11', '12x^{11}',
   2,
   array['basis.n_herkennen','basis.exponent_maalt','basis.exponent_verlagen'],
   false, 9);

with q as (
  select id from public.questions
  where latex_body = 'f(x) = x^{4}'
    and topic_id = (select id from public.topics where slug = 'basis')
  limit 1
)
insert into public.question_steps
  (question_id, step_order, step_description, root_cause_id)
select
  (select id from q),
  s.step_order,
  s.step_description,
  rc.id
from (values
  (1, 'Herken n in x^n: hier is n = 4',               'basis.n_herkennen'),
  (2, 'Zet n als factor: je werkt naar n · x^{n−1}', 'basis.exponent_maalt'),
  (3, 'Vermenigvuldig: 4 · 1 = 4 (coëfficiënt van x⁴ is 1)', 'basis.exponent_maalt'),
  (4, 'Verlaag de exponent: 4 − 1 = 3',              'basis.exponent_verlagen'),
  (5, 'Schrijf f''(x) = 4x³',                        'basis.notatie_fout')
) as s(step_order, step_description, root_cause_slug)
left join public.root_causes rc on rc.slug = s.root_cause_slug
on conflict (question_id, step_order) do update
  set step_description = excluded.step_description,
      root_cause_id    = excluded.root_cause_id;
