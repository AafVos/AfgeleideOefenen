-- =====================================================================
-- lerendifferentiëren.nl — seed data
--   Section 4:  topics, topic_clusters, root_causes
--   Section 13: first questions (Machtsregel) + example step plan
-- =====================================================================
-- Idempotent: safe to re-run. Uses ON CONFLICT on the unique slugs.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Topics
-- ---------------------------------------------------------------------
insert into public.topics (slug, title, order_index, is_unlocked_by_default)
values
  ('machtsregel',   'De Machtsregel',   1, true),
  ('somregel',      'De Somregel',      2, false),
  ('productregel',  'De Productregel',  3, false),
  ('quotientregel', 'De Quotiëntregel', 4, false),
  ('kettingregel',  'De Kettingregel',  5, false)
on conflict (slug) do update
  set title                  = excluded.title,
      order_index            = excluded.order_index,
      is_unlocked_by_default = excluded.is_unlocked_by_default;

-- ---------------------------------------------------------------------
-- Topic clusters
-- ---------------------------------------------------------------------
-- Machtsregel
insert into public.topic_clusters (topic_id, slug, title, order_index)
select t.id, c.slug, c.title, c.order_index
from public.topics t
cross join (values
  ('enkelvoudig',        'Enkelvoudig',        1),
  ('meerdere_termen',    'Meerdere termen',    2),
  ('haakjes_uitwerken',  'Haakjes uitwerken',  3),
  ('negatieve_exponent', 'Negatieve exponent', 4)
) as c(slug, title, order_index)
where t.slug = 'machtsregel'
on conflict (topic_id, slug) do update
  set title = excluded.title, order_index = excluded.order_index;

-- Somregel
insert into public.topic_clusters (topic_id, slug, title, order_index)
select t.id, c.slug, c.title, c.order_index
from public.topics t
cross join (values
  ('twee_termen',      'Twee termen',      1),
  ('drie_plus_termen', 'Drie+ termen',     2),
  ('constante_factor', 'Constante factor', 3),
  ('genest',           'Genest',           4)
) as c(slug, title, order_index)
where t.slug = 'somregel'
on conflict (topic_id, slug) do update
  set title = excluded.title, order_index = excluded.order_index;

-- Productregel
insert into public.topic_clusters (topic_id, slug, title, order_index)
select t.id, c.slug, c.title, c.order_index
from public.topics t
cross join (values
  ('twee_veeltermen',  'Twee veeltermen',       1),
  ('veelterm_macht',   'Veelterm × macht',      2),
  ('veelterm_wortel',  'Veelterm × wortel',     3),
  ('drie_factoren',    'Drie factoren',         4)
) as c(slug, title, order_index)
where t.slug = 'productregel'
on conflict (topic_id, slug) do update
  set title = excluded.title, order_index = excluded.order_index;

-- Quotiëntregel
insert into public.topic_clusters (topic_id, slug, title, order_index)
select t.id, c.slug, c.title, c.order_index
from public.topics t
cross join (values
  ('lineaire_noemer',      'Lineaire noemer',      1),
  ('kwadratische_noemer',  'Kwadratische noemer',  2),
  ('macht_in_noemer',      'Macht in noemer',      3),
  ('wortel',               'Wortel in noemer',     4)
) as c(slug, title, order_index)
where t.slug = 'quotientregel'
on conflict (topic_id, slug) do update
  set title = excluded.title, order_index = excluded.order_index;

-- Kettingregel
insert into public.topic_clusters (topic_id, slug, title, order_index)
select t.id, c.slug, c.title, c.order_index
from public.topics t
cross join (values
  ('macht_lineair',       'Macht + lineaire binnenste',  1),
  ('macht_veelterm',      'Macht + veelterm binnenste',  2),
  ('wortel',              'Wortel',                      3),
  ('negatieve_macht',     'Negatieve macht',             4),
  ('plus_productregel',   'Gecombineerd met productregel',  5),
  ('plus_quotientregel',  'Gecombineerd met quotiëntregel', 6)
) as c(slug, title, order_index)
where t.slug = 'kettingregel'
on conflict (topic_id, slug) do update
  set title = excluded.title, order_index = excluded.order_index;

-- ---------------------------------------------------------------------
-- Root causes  (slugs are namespaced per topic to stay globally unique)
-- ---------------------------------------------------------------------
-- Machtsregel
insert into public.root_causes (topic_id, slug, description)
select t.id, r.slug, r.description
from public.topics t
cross join (values
  ('machtsregel.n_identificeren',     'Herkennen van de exponent n in x^n'),
  ('machtsregel.coefficient_berekenen','Nieuwe coëfficiënt berekenen (n · oude coëfficiënt)'),
  ('machtsregel.exponent_verlaging',  'Exponent verlagen met 1 na differentiëren'),
  ('machtsregel.haakjes_uitwerken',   'Haakjes uitwerken vóór differentiëren'),
  ('machtsregel.notatie_fout',        'Notatiefout (bijv. x^1 schrijven i.p.v. x)')
) as r(slug, description)
where t.slug = 'machtsregel'
on conflict (slug) do update set description = excluded.description;

-- Somregel
insert into public.root_causes (topic_id, slug, description)
select t.id, r.slug, r.description
from public.topics t
cross join (values
  ('somregel.termen_splitsen',  'Som opsplitsen in afzonderlijke termen'),
  ('somregel.constante_factor', 'Constante factor juist meedifferentiëren'),
  ('somregel.elke_term_apart',  'Elke term apart differentiëren'),
  ('somregel.notatie_fout',     'Notatiefout in samengestelde uitdrukking')
) as r(slug, description)
where t.slug = 'somregel'
on conflict (slug) do update set description = excluded.description;

-- Productregel
insert into public.root_causes (topic_id, slug, description)
select t.id, r.slug, r.description
from public.topics t
cross join (values
  ('productregel.fg_identificeren',   'f(x) en g(x) juist benoemen'),
  ('productregel.f_differentieren',   'f(x) correct differentiëren'),
  ('productregel.g_differentieren',   'g(x) correct differentiëren'),
  ('productregel.formule_invullen',   'Formule f''·g + f·g'' correct invullen'),
  ('productregel.volgorde_min',       'Volgorde / teken van termen'),
  ('productregel.vereenvoudigen',     'Eindantwoord vereenvoudigen')
) as r(slug, description)
where t.slug = 'productregel'
on conflict (slug) do update set description = excluded.description;

-- Quotiëntregel
insert into public.root_causes (topic_id, slug, description)
select t.id, r.slug, r.description
from public.topics t
cross join (values
  ('quotientregel.tn_identificeren',  'Teller t(x) en noemer n(x) juist benoemen'),
  ('quotientregel.t_differentieren',  't(x) correct differentiëren'),
  ('quotientregel.n_differentieren',  'n(x) correct differentiëren'),
  ('quotientregel.formule_volgorde',  'Formule (t''·n − t·n'') / n² in juiste volgorde toepassen'),
  ('quotientregel.noemer_kwadraat',   'Noemer kwadrateren'),
  ('quotientregel.vereenvoudigen',    'Eindantwoord vereenvoudigen')
) as r(slug, description)
where t.slug = 'quotientregel'
on conflict (slug) do update set description = excluded.description;

-- Kettingregel
insert into public.root_causes (topic_id, slug, description)
select t.id, r.slug, r.description
from public.topics t
cross join (values
  ('kettingregel.buitenste_identificeren',  'Buitenste functie herkennen'),
  ('kettingregel.binnenste_identificeren',  'Binnenste functie herkennen'),
  ('kettingregel.buitenste_differentieren', 'Buitenste functie differentiëren'),
  ('kettingregel.binnenste_differentieren', 'Binnenste functie differentiëren'),
  ('kettingregel.vermenigvuldigen',         'Buitenste en binnenste vermenigvuldigen'),
  ('kettingregel.herschrijven_machtsvorm',  'Wortel / breuk herschrijven naar machtsvorm'),
  ('kettingregel.regel_combineren',         'Combineren met product- of quotiëntregel'),
  ('kettingregel.vereenvoudigen',           'Eindantwoord vereenvoudigen')
) as r(slug, description)
where t.slug = 'kettingregel'
on conflict (slug) do update set description = excluded.description;

-- ---------------------------------------------------------------------
-- Seed questions — Machtsregel (section 13)
-- ---------------------------------------------------------------------
-- Helper: delete previous seed rows for this topic before reinserting,
-- but only rows that are not AI-generated. Keeps the script idempotent
-- without wiping AI data the app created at runtime.
delete from public.questions
  where is_ai_generated = false
    and topic_id = (select id from public.topics where slug = 'machtsregel');

with
  t as (select id from public.topics where slug = 'machtsregel'),
  cl as (
    select tc.slug, tc.id
    from public.topic_clusters tc
    join public.topics tt on tt.id = tc.topic_id
    where tt.slug = 'machtsregel'
  )
insert into public.questions
  (topic_id, cluster_id, body, latex_body, answer, latex_answer,
   difficulty, root_cause_tags, is_ai_generated, order_index)
values
  -- difficulty 1 — Enkelvoudig
  ((select id from t),
   (select id from cl where slug = 'enkelvoudig'),
   'Bepaal f''(x) als f(x) = x⁵',
   'f(x) = x^{5}',
   '5x^4', '5x^{4}',
   1,
   array['machtsregel.n_identificeren','machtsregel.exponent_verlaging'],
   false, 1),

  ((select id from t),
   (select id from cl where slug = 'enkelvoudig'),
   'Bepaal f''(x) als f(x) = 4x³',
   'f(x) = 4x^{3}',
   '12x^2', '12x^{2}',
   1,
   array['machtsregel.coefficient_berekenen','machtsregel.exponent_verlaging'],
   false, 2),

  ((select id from t),
   (select id from cl where slug = 'enkelvoudig'),
   'Bepaal f''(x) als f(x) = 7x²',
   'f(x) = 7x^{2}',
   '14x', '14x',
   1,
   array['machtsregel.coefficient_berekenen','machtsregel.exponent_verlaging'],
   false, 3),

  -- difficulty 2 — Meerdere termen
  ((select id from t),
   (select id from cl where slug = 'meerdere_termen'),
   'Differentieer f(x) = −5x⁷ + 2x⁴ − x − 9',
   'f(x) = -5x^{7} + 2x^{4} - x - 9',
   '-35x^6+8x^3-1', '-35x^{6} + 8x^{3} - 1',
   2,
   array['machtsregel.coefficient_berekenen','machtsregel.exponent_verlaging','somregel.elke_term_apart'],
   false, 4),

  ((select id from t),
   (select id from cl where slug = 'meerdere_termen'),
   'Differentieer h(t) = 2t³ − 4t² + 3t − 2',
   'h(t) = 2t^{3} - 4t^{2} + 3t - 2',
   '6t^2-8t+3', '6t^{2} - 8t + 3',
   2,
   array['machtsregel.coefficient_berekenen','somregel.elke_term_apart'],
   false, 5),

  -- difficulty 3 — Haakjes uitwerken
  ((select id from t),
   (select id from cl where slug = 'haakjes_uitwerken'),
   'Differentieer g(x) = (3x⁴ − 1)(5x² + 2)',
   'g(x) = (3x^{4} - 1)(5x^{2} + 2)',
   '90x^5+24x^3-10x', '90x^{5} + 24x^{3} - 10x',
   3,
   array['machtsregel.haakjes_uitwerken','machtsregel.coefficient_berekenen'],
   false, 6),

  -- difficulty 3 — Negatieve exponent
  ((select id from t),
   (select id from cl where slug = 'negatieve_exponent'),
   'Bepaal f''(x) als f(x) = 1/x²',
   'f(x) = \dfrac{1}{x^{2}}',
   '-2x^-3', '-2x^{-3}',
   3,
   array['machtsregel.n_identificeren','machtsregel.exponent_verlaging'],
   false, 7),

  ((select id from t),
   (select id from cl where slug = 'negatieve_exponent'),
   'Bepaal f''(x) als f(x) = √x',
   'f(x) = \sqrt{x}',
   '(1/2)x^(-1/2)', '\tfrac{1}{2}x^{-1/2}',
   3,
   array['machtsregel.n_identificeren','machtsregel.exponent_verlaging','kettingregel.herschrijven_machtsvorm'],
   false, 8);

-- ---------------------------------------------------------------------
-- Example step plan — f(x) = 4x³ (section 13)
-- ---------------------------------------------------------------------
with q as (
  select id from public.questions
  where body = 'Bepaal f''(x) als f(x) = 4x³'
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
  (1, 'Identificeer de exponent n (n = 3)',                  'machtsregel.n_identificeren'),
  (2, 'Schrijf de exponent als coëfficiënt ervoor (3 · 4x³)','machtsregel.coefficient_berekenen'),
  (3, 'Bereken de nieuwe coëfficiënt (3 · 4 = 12)',          'machtsregel.coefficient_berekenen'),
  (4, 'Verlaag de exponent met 1 (3 − 1 = 2)',               'machtsregel.exponent_verlaging'),
  (5, 'Schrijf het antwoord op: f''(x) = 12x²',              'machtsregel.notatie_fout')
) as s(step_order, step_description, root_cause_slug)
left join public.root_causes rc on rc.slug = s.root_cause_slug
on conflict (question_id, step_order) do update
  set step_description = excluded.step_description,
      root_cause_id    = excluded.root_cause_id;
