-- Nieuw topic «Wortels en negatieve exponenten» als tweede topic in de leerlijn.
-- Machtsregel schuift op naar positie 3; rest volgt.

insert into public.topics (slug, title, order_index, is_unlocked_by_default)
values
  ('basis',           'Basis',                          1, true),
  ('wortel_negatief', 'Wortels en negatieve exponenten', 2, false),
  ('machtsregel',     'De Machtsregel',                  3, false),
  ('somregel',        'De Somregel',                     4, false),
  ('productregel',    'De Productregel',                 5, false),
  ('quotientregel',   'De Quotiëntregel',                6, false),
  ('kettingregel',    'De Kettingregel',                 7, false)
on conflict (slug) do update
  set title                  = excluded.title,
      order_index            = excluded.order_index,
      is_unlocked_by_default = excluded.is_unlocked_by_default;

insert into public.topic_clusters (topic_id, slug, title, order_index)
select tt.id, c.slug, c.title, c.order_index
from public.topics tt
cross join (values
  ('negatieve_exponent', 'Negatieve exponent', 1),
  ('gebroken_exponent',  'Gebroken exponent',  2)
) as c(slug, title, order_index)
where tt.slug = 'wortel_negatief'
on conflict (topic_id, slug) do update
  set title = excluded.title, order_index = excluded.order_index;

insert into public.root_causes (topic_id, slug, description)
select tt.id, r.slug, r.description
from public.topics tt
cross join (values
  ('wortel_negatief.negatief_exp',
   'Negatieve exponent: n voor x zetten en teken omdraaien'),
  ('wortel_negatief.gebroken_exp',
   'Gebroken exponent: breuk als coëfficiënt schrijven'),
  ('wortel_negatief.herschrijf_wortel',
   'Wortel herschrijven als fractionaire macht (√x = x^{1/2})'),
  ('wortel_negatief.negatief_coeff',
   'Minteken meenemen in de coëfficiënt bij negatieve exponent'),
  ('wortel_negatief.exponent_verlagen',
   'Exponent verlagen met 1 (ook bij gebroken/negatieve n)')
) as r(slug, description)
where tt.slug = 'wortel_negatief'
on conflict (slug) do update set description = excluded.description;

delete from public.questions
  where is_ai_generated = false
    and topic_id = (select id from public.topics where slug = 'wortel_negatief');

with
  t as (select id from public.topics where slug = 'wortel_negatief'),
  cl as (
    select tc.slug, tc.id
    from public.topic_clusters tc
    join public.topics tt on tt.id = tc.topic_id
    where tt.slug = 'wortel_negatief'
  )
insert into public.questions
  (topic_id, cluster_id, body, latex_body, answer, latex_answer,
   difficulty, root_cause_tags, is_ai_generated, order_index)
values
  -- negatieve_exponent — difficulty 1
  ((select id from t),
   (select id from cl where slug = 'negatieve_exponent'),
   'Bepaal f''(x) als f(x) = x⁻¹',
   'f(x) = x^{-1}',
   '-x^(-2)', '-x^{-2}',
   1, array['wortel_negatief.negatief_exp','wortel_negatief.negatief_coeff'],
   false, 1),

  ((select id from t),
   (select id from cl where slug = 'negatieve_exponent'),
   'Bepaal f''(x) als f(x) = x⁻²',
   'f(x) = x^{-2}',
   '-2x^(-3)', '-2x^{-3}',
   1, array['wortel_negatief.negatief_exp','wortel_negatief.exponent_verlagen'],
   false, 2),

  ((select id from t),
   (select id from cl where slug = 'negatieve_exponent'),
   'Bepaal f''(x) als f(x) = x⁻³',
   'f(x) = x^{-3}',
   '-3x^(-4)', '-3x^{-4}',
   1, array['wortel_negatief.negatief_exp','wortel_negatief.exponent_verlagen'],
   false, 3),

  ((select id from t),
   (select id from cl where slug = 'negatieve_exponent'),
   'Bepaal f''(x) als f(x) = x⁻⁴',
   'f(x) = x^{-4}',
   '-4x^(-5)', '-4x^{-5}',
   1, array['wortel_negatief.negatief_exp','wortel_negatief.exponent_verlagen'],
   false, 4),

  ((select id from t),
   (select id from cl where slug = 'negatieve_exponent'),
   'Bepaal f''(x) als f(x) = x⁻⁵',
   'f(x) = x^{-5}',
   '-5x^(-6)', '-5x^{-6}',
   1, array['wortel_negatief.negatief_exp','wortel_negatief.exponent_verlagen'],
   false, 5),

  -- negatieve_exponent — difficulty 2
  ((select id from t),
   (select id from cl where slug = 'negatieve_exponent'),
   'Bepaal f''(x) als f(x) = x⁻⁶',
   'f(x) = x^{-6}',
   '-6x^(-7)', '-6x^{-7}',
   2, array['wortel_negatief.negatief_exp','wortel_negatief.exponent_verlagen'],
   false, 6),

  ((select id from t),
   (select id from cl where slug = 'negatieve_exponent'),
   'Bepaal f''(x) als f(x) = x⁻⁷',
   'f(x) = x^{-7}',
   '-7x^(-8)', '-7x^{-8}',
   2, array['wortel_negatief.negatief_exp','wortel_negatief.exponent_verlagen'],
   false, 7),

  ((select id from t),
   (select id from cl where slug = 'negatieve_exponent'),
   'Bepaal f''(x) als f(x) = x⁻¹⁰',
   'f(x) = x^{-10}',
   '-10x^(-11)', '-10x^{-11}',
   2, array['wortel_negatief.negatief_exp','wortel_negatief.exponent_verlagen'],
   false, 8),

  ((select id from t),
   (select id from cl where slug = 'negatieve_exponent'),
   'Bepaal f''(x) als f(x) = x⁻¹²',
   'f(x) = x^{-12}',
   '-12x^(-13)', '-12x^{-13}',
   2, array['wortel_negatief.negatief_exp','wortel_negatief.exponent_verlagen'],
   false, 9),

  -- gebroken_exponent — difficulty 2
  ((select id from t),
   (select id from cl where slug = 'gebroken_exponent'),
   'Bepaal f''(x) als f(x) = √x (schrijf het antwoord als macht)',
   'f(x) = \sqrt{x} = x^{1/2}',
   '(1/2)x^(-1/2)', '\dfrac{1}{2}x^{-1/2}',
   2, array['wortel_negatief.herschrijf_wortel','wortel_negatief.gebroken_exp'],
   false, 1),

  ((select id from t),
   (select id from cl where slug = 'gebroken_exponent'),
   'Bepaal f''(x) als f(x) = x^{1/3}',
   'f(x) = x^{1/3}',
   '(1/3)x^(-2/3)', '\dfrac{1}{3}x^{-2/3}',
   2, array['wortel_negatief.gebroken_exp','wortel_negatief.exponent_verlagen'],
   false, 2),

  ((select id from t),
   (select id from cl where slug = 'gebroken_exponent'),
   'Bepaal f''(x) als f(x) = x^{2/3}',
   'f(x) = x^{2/3}',
   '(2/3)x^(-1/3)', '\dfrac{2}{3}x^{-1/3}',
   2, array['wortel_negatief.gebroken_exp','wortel_negatief.exponent_verlagen'],
   false, 3),

  ((select id from t),
   (select id from cl where slug = 'gebroken_exponent'),
   'Bepaal f''(x) als f(x) = x^{3/2}',
   'f(x) = x^{3/2}',
   '(3/2)x^(1/2)', '\dfrac{3}{2}x^{1/2}',
   2, array['wortel_negatief.gebroken_exp','wortel_negatief.exponent_verlagen'],
   false, 4),

  ((select id from t),
   (select id from cl where slug = 'gebroken_exponent'),
   'Bepaal f''(x) als f(x) = x^{1/4}',
   'f(x) = x^{1/4}',
   '(1/4)x^(-3/4)', '\dfrac{1}{4}x^{-3/4}',
   2, array['wortel_negatief.gebroken_exp','wortel_negatief.exponent_verlagen'],
   false, 5),

  ((select id from t),
   (select id from cl where slug = 'gebroken_exponent'),
   'Bepaal f''(x) als f(x) = x^{5/2}',
   'f(x) = x^{5/2}',
   '(5/2)x^(3/2)', '\dfrac{5}{2}x^{3/2}',
   2, array['wortel_negatief.gebroken_exp','wortel_negatief.exponent_verlagen'],
   false, 6),

  -- gebroken_exponent — difficulty 3
  ((select id from t),
   (select id from cl where slug = 'gebroken_exponent'),
   'Bepaal f''(x) als f(x) = x^{-1/2}',
   'f(x) = x^{-1/2}',
   '-(1/2)x^(-3/2)', '-\dfrac{1}{2}x^{-3/2}',
   3, array['wortel_negatief.gebroken_exp','wortel_negatief.negatief_coeff','wortel_negatief.exponent_verlagen'],
   false, 7),

  ((select id from t),
   (select id from cl where slug = 'gebroken_exponent'),
   'Bepaal f''(x) als f(x) = x^{-1/3}',
   'f(x) = x^{-1/3}',
   '-(1/3)x^(-4/3)', '-\dfrac{1}{3}x^{-4/3}',
   3, array['wortel_negatief.gebroken_exp','wortel_negatief.negatief_coeff','wortel_negatief.exponent_verlagen'],
   false, 8),

  ((select id from t),
   (select id from cl where slug = 'gebroken_exponent'),
   'Bepaal f''(x) als f(x) = x^{-3/2}',
   'f(x) = x^{-3/2}',
   '-(3/2)x^(-5/2)', '-\dfrac{3}{2}x^{-5/2}',
   3, array['wortel_negatief.gebroken_exp','wortel_negatief.negatief_coeff','wortel_negatief.exponent_verlagen'],
   false, 9);
