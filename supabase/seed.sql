-- =====================================================================
-- afgeleideoefenen.nl — seed data
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
  ('basis',         'Basis',              1, true),
  ('somregel',      'De Somregel',        2, false),
  ('productregel',  'De Productregel',    3, false),
  ('quotientregel', 'De Quotiëntregel',   4, false),
  ('kettingregel',  'De Kettingregel',    5, false),
  ('goniometrie',   'Goniometrie',        6, false),
  ('emacht',        'De e-macht',         7, false),
  ('lnlog',         'ln en log',          8, false)
on conflict (slug) do update
  set title                  = excluded.title,
      order_index            = excluded.order_index,
      is_unlocked_by_default = excluded.is_unlocked_by_default;

-- ---------------------------------------------------------------------
-- Topic clusters
-- ---------------------------------------------------------------------
-- Basis: 3 clusters
insert into public.topic_clusters (topic_id, slug, title, order_index)
select t.id, c.slug, c.title, c.order_index
from public.topics t
cross join (values
  ('standaard_ax_n',   'Standaard ax^n',                  1),
  ('wortel_negatief',  'Wortels en negatieve machten',     2),
  ('een_macht_maken',  'Eén macht maken',                  3)
) as c(slug, title, order_index)
where t.slug = 'basis'
on conflict (topic_id, slug) do update
  set title = excluded.title, order_index = excluded.order_index;

-- Somregel: 2 clusters
insert into public.topic_clusters (topic_id, slug, title, order_index)
select t.id, c.slug, c.title, c.order_index
from public.topics t
cross join (values
  ('som_termen', 'Somregel',             1),
  ('haakjes',    'Haakjes uitwerken',    2)
) as c(slug, title, order_index)
where t.slug = 'somregel'
on conflict (topic_id, slug) do update
  set title = excluded.title, order_index = excluded.order_index;

-- Productregel
insert into public.topic_clusters (topic_id, slug, title, order_index)
select t.id, c.slug, c.title, c.order_index
from public.topics t
cross join (values
  ('haakjes_staan',    'Haakjes staan',         1),
  ('twee_veeltermen',  'Twee veeltermen',       2),
  ('veelterm_macht',   'Veelterm × macht',      3),
  ('veelterm_wortel',  'Veelterm × wortel',     4),
  ('drie_factoren',    'Drie factoren',         5)
) as c(slug, title, order_index)
where t.slug = 'productregel'
on conflict (topic_id, slug) do update
  set title = excluded.title, order_index = excluded.order_index;

-- Quotiëntregel
insert into public.topic_clusters (topic_id, slug, title, order_index)
select t.id, c.slug, c.title, c.order_index
from public.topics t
cross join (values
  ('makkelijk',      'Makkelijk',            1),
  ('polynoom',       'Polynoom',             2),
  ('combi_somregel', 'Combi met somregel',   3)
) as c(slug, title, order_index)
where t.slug = 'quotientregel'
on conflict (topic_id, slug) do update
  set title = excluded.title, order_index = excluded.order_index;

-- goniometrie
insert into public.topic_clusters (topic_id, slug, title, order_index)
select t.id, c.slug, c.title, c.order_index
from public.topics t
cross join (values
  ('standaard',           'Standaard',                1),
  ('combi_kettingregel',  'Combi met kettingregel',    2),
  ('combi_productregel',  'Combi met productregel',    3),
  ('combi_quotientregel', 'Combi met quotiëntregel',   4)
) as c(slug, title, order_index)
where t.slug = 'goniometrie'
on conflict (topic_id, slug) do update
  set title = excluded.title, order_index = excluded.order_index;

-- ln en log
insert into public.topic_clusters (topic_id, slug, title, order_index)
select t.id, c.slug, c.title, c.order_index
from public.topics t
cross join (values
  ('standaard',           'Standaard',                1),
  ('combi_somregel',      'Combi met somregel',        2),
  ('combi_productregel',  'Combi met productregel',    3),
  ('combi_kettingregel',  'Combi met kettingregel',    4),
  ('combi_quotientregel', 'Combi met quotiëntregel',   5)
) as c(slug, title, order_index)
where t.slug = 'lnlog'
on conflict (topic_id, slug) do update
  set title = excluded.title, order_index = excluded.order_index;

-- e-macht
insert into public.topic_clusters (topic_id, slug, title, order_index)
select t.id, c.slug, c.title, c.order_index
from public.topics t
cross join (values
  ('standaard',           'Standaard',                1),
  ('combi_somregel',      'Combi met somregel',        2),
  ('combi_productregel',  'Combi met productregel',    3),
  ('combi_kettingregel',  'Combi met kettingregel',    4),
  ('combi_quotientregel', 'Combi met quotiëntregel',   5)
) as c(slug, title, order_index)
where t.slug = 'emacht'
on conflict (topic_id, slug) do update
  set title = excluded.title, order_index = excluded.order_index;

-- Kettingregel
insert into public.topic_clusters (topic_id, slug, title, order_index)
select t.id, c.slug, c.title, c.order_index
from public.topics t
cross join (values
  ('macht_lineair',       'Lineaire kern',                  1),
  ('macht_veelterm',      'Polynoomkern',                   2),
  ('wortel',              'Wortels',                        3),
  ('negatieve_macht',     'Negatieve machten',              4),
  ('combi_somregel',      'Combi met somregel',             5),
  ('plus_productregel',   'Combi met productregel',         6),
  ('plus_quotientregel',  'Combi met quotiëntregel',        7)
) as c(slug, title, order_index)
where t.slug = 'kettingregel'
on conflict (topic_id, slug) do update
  set title = excluded.title, order_index = excluded.order_index;

-- ---------------------------------------------------------------------
-- Root causes  (slugs are namespaced per topic to stay globally unique)
-- ---------------------------------------------------------------------
-- Basis
insert into public.root_causes (topic_id, slug, description)
select t.id, r.slug, r.description
from public.topics t
cross join (values
  ('basis.exponent_verlagen',
   'Exponent met 1 verlagen na differentiëren'),
  ('basis.coeff_vermenigvuldigen',
   'Coëfficiënt correct berekenen: n·a'),
  ('basis.constante_term',
   'Constante term differentieert naar nul'),
  ('basis.schrijf_als_macht',
   'Wortel of breuk herschrijven als macht van x (√x = x^{1/2}, 1/x^n = x^{-n})'),
  ('basis.negatieve_exp',
   'Minteken correct meenemen bij negatieve exponent'),
  ('basis.gebroken_exp',
   'Gebroken exponent als coëfficiënt schrijven na differentiëren'),
  ('basis.exponenten_optellen',
   'Exponenten optellen bij vermenigvuldigen: x^a · x^b = x^{a+b}'),
  ('basis.exponenten_aftrekken',
   'Exponenten aftrekken bij delen: x^a / x^b = x^{a-b}'),
  ('basis.macht_van_macht',
   'Macht van een macht: (x^a)^b = x^{a·b}')
) as r(slug, description)
where t.slug = 'basis'
on conflict (slug) do update set description = excluded.description;

-- Somregel
insert into public.root_causes (topic_id, slug, description)
select t.id, r.slug, r.description
from public.topics t
cross join (values
  ('somregel.term_voor_term',
   'Elke term afzonderlijk differentiëren'),
  ('somregel.constante_factor',
   'Constante factor correct meenemen bij differentiëren'),
  ('somregel.constante_nul',
   'Constante term differentieert naar nul'),
  ('somregel.herleid_eerst',
   'Eerst herleiden naar som van machten (1 macht maken), dan differentiëren'),
  ('somregel.haakjes_uitwerken',
   'Haakjes volledig uitwerken vóór differentiëren'),
  ('somregel.gelijknamige_samenvoegen',
   'Gelijknamige termen samenvoegen na uitwerken haakjes')
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
  ('productregel.vereenvoudigen',     'Eindantwoord vereenvoudigen'),
  ('productregel.haakjes_staan',      'Haakjes laten staan in het antwoord (niet uitwerken)')
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
  ('quotientregel.vereenvoudigen',    'Eindantwoord vereenvoudigen'),
  ('quotientregel.combi_somregel',    'Andere term(en) naast de breuk apart differentiëren (somregel)')
) as r(slug, description)
where t.slug = 'quotientregel'
on conflict (slug) do update set description = excluded.description;

-- goniometrie
insert into public.root_causes (topic_id, slug, description)
select t.id, r.slug, r.description
from public.topics t
cross join (values
  ('goniometrie.sin_herkennen',       'd/dx[sin(x)] = cos(x)'),
  ('goniometrie.cos_herkennen',       'd/dx[cos(x)] = -sin(x)'),
  ('goniometrie.tan_herkennen',       'd/dx[tan(x)] = 1+tan²(x)'),
  ('goniometrie.ketting_lineair',     'Kettingregel: d/dx[sin(ax+b)] = a·cos(ax+b)'),
  ('goniometrie.ketting_polynoom',    'Kettingregel: d/dx[sin(f(x))] = f''(x)·cos(f(x))'),
  ('goniometrie.product_toepassen',   'Productregel combineren met goniometrie'),
  ('goniometrie.quotient_toepassen',  'Quotiëntregel combineren met goniometrie')
) as r(slug, description)
where t.slug = 'goniometrie'
on conflict (slug) do update set description = excluded.description;

-- ln en log
insert into public.root_causes (topic_id, slug, description)
select t.id, r.slug, r.description
from public.topics t
cross join (values
  ('lnlog.ln_herkennen',        'Afgeleide van ln(x) is 1/x'),
  ('lnlog.ketting_lineair',     'Kettingregel: d/dx[ln(ax+b)] = a/(ax+b)'),
  ('lnlog.ketting_polynoom',    'Kettingregel: d/dx[ln(f(x))] = f''(x)/f(x)'),
  ('lnlog.glog_regel',          'Afgeleide van ᵍlog(x) = 1/(x·ln(g))'),
  ('lnlog.product_toepassen',   'Productregel combineren met ln'),
  ('lnlog.quotient_toepassen',  'Quotiëntregel combineren met ln'),
  ('lnlog.uitfactoren',         'Antwoord vereenvoudigen')
) as r(slug, description)
where t.slug = 'lnlog'
on conflict (slug) do update set description = excluded.description;

-- e-macht
insert into public.root_causes (topic_id, slug, description)
select t.id, r.slug, r.description
from public.topics t
cross join (values
  ('emacht.e_herkennen',        'Afgeleide van e^x is e^x'),
  ('emacht.ketting_lineair',    'Kettingregel: d/dx[e^{ax+b}] = a·e^{ax+b}'),
  ('emacht.ketting_polynoom',   'Kettingregel: d/dx[e^{f(x)}] = f''(x)·e^{f(x)}'),
  ('emacht.product_toepassen',  'Productregel combineren met e-macht'),
  ('emacht.quotient_toepassen', 'Quotiëntregel combineren met e-macht'),
  ('emacht.uitfactoren',        'e^x uitfactoren in eindantwoord')
) as r(slug, description)
where t.slug = 'emacht'
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
  ('kettingregel.combi_somregel',           'Andere term(en) naast kettingregelterm apart differentiëren'),
  ('kettingregel.regel_combineren',         'Combineren met product- of quotiëntregel'),
  ('kettingregel.vereenvoudigen',           'Eindantwoord vereenvoudigen')
) as r(slug, description)
where t.slug = 'kettingregel'
on conflict (slug) do update set description = excluded.description;

-- ---------------------------------------------------------------------
-- Seed questions — Basis (3 clusters)
-- ---------------------------------------------------------------------
delete from public.questions
  where is_ai_generated = false
    and topic_id = (select id from public.topics where slug = 'basis');

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

  -- ── standaard_ax_n — diff 1 ─────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'standaard_ax_n'),
   'Bepaal f''(x) als f(x) = 3x²',
   'f(x) = 3x^{2}',
   '6x', '6x',
   1, array['basis.exponent_verlagen','basis.coeff_vermenigvuldigen'],
   false, 1),

  ((select id from t), (select id from cl where slug = 'standaard_ax_n'),
   'Bepaal f''(x) als f(x) = 5x³',
   'f(x) = 5x^{3}',
   '15x^2', '15x^{2}',
   1, array['basis.exponent_verlagen','basis.coeff_vermenigvuldigen'],
   false, 2),

  ((select id from t), (select id from cl where slug = 'standaard_ax_n'),
   'Bepaal f''(x) als f(x) = 2x⁴',
   'f(x) = 2x^{4}',
   '8x^3', '8x^{3}',
   1, array['basis.exponent_verlagen','basis.coeff_vermenigvuldigen'],
   false, 3),

  ((select id from t), (select id from cl where slug = 'standaard_ax_n'),
   'Bepaal f''(x) als f(x) = 4x',
   'f(x) = 4x',
   '4', '4',
   1, array['basis.exponent_verlagen','basis.constante_term'],
   false, 4),

  ((select id from t), (select id from cl where slug = 'standaard_ax_n'),
   'Bepaal f''(x) als f(x) = x⁵',
   'f(x) = x^{5}',
   '5x^4', '5x^{4}',
   1, array['basis.exponent_verlagen','basis.coeff_vermenigvuldigen'],
   false, 5),

  -- ── standaard_ax_n — diff 2 ─────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'standaard_ax_n'),
   'Bepaal f''(x) als f(x) = 6x²',
   'f(x) = 6x^{2}',
   '12x', '12x',
   2, array['basis.exponent_verlagen','basis.coeff_vermenigvuldigen'],
   false, 6),

  ((select id from t), (select id from cl where slug = 'standaard_ax_n'),
   'Bepaal f''(x) als f(x) = 7x³',
   'f(x) = 7x^{3}',
   '21x^2', '21x^{2}',
   2, array['basis.exponent_verlagen','basis.coeff_vermenigvuldigen'],
   false, 7),

  ((select id from t), (select id from cl where slug = 'standaard_ax_n'),
   'Bepaal f''(x) als f(x) = (1/2)x⁴',
   'f(x) = \dfrac{1}{2}x^{4}',
   '2x^3', '2x^{3}',
   2, array['basis.exponent_verlagen','basis.coeff_vermenigvuldigen'],
   false, 8),

  ((select id from t), (select id from cl where slug = 'standaard_ax_n'),
   'Bepaal f''(x) als f(x) = (2/3)x³',
   'f(x) = \dfrac{2}{3}x^{3}',
   '2x^2', '2x^{2}',
   2, array['basis.exponent_verlagen','basis.coeff_vermenigvuldigen'],
   false, 9),

  -- ── wortel_negatief — diff 1 ─────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'wortel_negatief'),
   'Bepaal f''(x) als f(x) = 4/x²',
   'f(x) = \dfrac{4}{x^{2}}',
   '-8x^(-3)', '-8x^{-3}',
   1, array['basis.schrijf_als_macht','basis.negatieve_exp','basis.coeff_vermenigvuldigen'],
   false, 1),

  ((select id from t), (select id from cl where slug = 'wortel_negatief'),
   'Bepaal f''(x) als f(x) = 3x^{-1}',
   'f(x) = 3x^{-1}',
   '-3x^(-2)', '-3x^{-2}',
   1, array['basis.negatieve_exp','basis.coeff_vermenigvuldigen'],
   false, 2),

  ((select id from t), (select id from cl where slug = 'wortel_negatief'),
   'Bepaal f''(x) als f(x) = 2√x',
   'f(x) = 2\sqrt{x}',
   'x^(-1/2)', 'x^{-1/2}',
   1, array['basis.schrijf_als_macht','basis.gebroken_exp'],
   false, 3),

  ((select id from t), (select id from cl where slug = 'wortel_negatief'),
   'Bepaal f''(x) als f(x) = 6/x³',
   'f(x) = \dfrac{6}{x^{3}}',
   '-18x^(-4)', '-18x^{-4}',
   1, array['basis.schrijf_als_macht','basis.negatieve_exp','basis.coeff_vermenigvuldigen'],
   false, 4),

  ((select id from t), (select id from cl where slug = 'wortel_negatief'),
   'Bepaal f''(x) als f(x) = 3∛x',
   'f(x) = 3\sqrt[3]{x}',
   'x^(-2/3)', 'x^{-2/3}',
   1, array['basis.schrijf_als_macht','basis.gebroken_exp'],
   false, 5),

  -- ── wortel_negatief — diff 2 ─────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'wortel_negatief'),
   'Bepaal f''(x) als f(x) = 5/(2x²)',
   'f(x) = \dfrac{5}{2x^{2}}',
   '-5x^(-3)', '-5x^{-3}',
   2, array['basis.schrijf_als_macht','basis.negatieve_exp','basis.coeff_vermenigvuldigen'],
   false, 6),

  ((select id from t), (select id from cl where slug = 'wortel_negatief'),
   'Bepaal f''(x) als f(x) = 3x^{-4}',
   'f(x) = 3x^{-4}',
   '-12x^(-5)', '-12x^{-5}',
   2, array['basis.negatieve_exp','basis.coeff_vermenigvuldigen'],
   false, 7),

  ((select id from t), (select id from cl where slug = 'wortel_negatief'),
   'Bepaal f''(x) als f(x) = (1/3)x^{3/2}',
   'f(x) = \dfrac{1}{3}x^{\frac{3}{2}}',
   '(1/2)x^(1/2)', '\dfrac{1}{2}x^{\frac{1}{2}}',
   2, array['basis.gebroken_exp','basis.coeff_vermenigvuldigen'],
   false, 8),

  ((select id from t), (select id from cl where slug = 'wortel_negatief'),
   'Bepaal f''(x) als f(x) = 4x^{-1/2}',
   'f(x) = 4x^{-\frac{1}{2}}',
   '-2x^(-3/2)', '-2x^{-\frac{3}{2}}',
   2, array['basis.negatieve_exp','basis.gebroken_exp','basis.coeff_vermenigvuldigen'],
   false, 9),

  -- ── een_macht_maken — diff 1 ─────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'een_macht_maken'),
   'Bepaal f''(x) als f(x) = x² · x³',
   'f(x) = x^{2} \cdot x^{3}',
   '5x^4', '5x^{4}',
   1, array['basis.exponenten_optellen','basis.exponent_verlagen'],
   false, 1),

  ((select id from t), (select id from cl where slug = 'een_macht_maken'),
   'Bepaal f''(x) als f(x) = x⁶/x²',
   'f(x) = \dfrac{x^{6}}{x^{2}}',
   '4x^3', '4x^{3}',
   1, array['basis.exponenten_aftrekken','basis.exponent_verlagen'],
   false, 2),

  ((select id from t), (select id from cl where slug = 'een_macht_maken'),
   'Bepaal f''(x) als f(x) = (x³)²',
   'f(x) = (x^{3})^{2}',
   '6x^5', '6x^{5}',
   1, array['basis.macht_van_macht','basis.exponent_verlagen'],
   false, 3),

  -- ── een_macht_maken — diff 2 ─────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'een_macht_maken'),
   'Bepaal f''(x) als f(x) = 2x³ · x',
   'f(x) = 2x^{3} \cdot x',
   '8x^3', '8x^{3}',
   2, array['basis.exponenten_optellen','basis.coeff_vermenigvuldigen'],
   false, 4),

  ((select id from t), (select id from cl where slug = 'een_macht_maken'),
   'Bepaal f''(x) als f(x) = 4x⁶/x³',
   'f(x) = \dfrac{4x^{6}}{x^{3}}',
   '12x^2', '12x^{2}',
   2, array['basis.exponenten_aftrekken','basis.coeff_vermenigvuldigen'],
   false, 5),

  ((select id from t), (select id from cl where slug = 'een_macht_maken'),
   'Bepaal f''(x) als f(x) = 3x · x^{-2}',
   'f(x) = 3x \cdot x^{-2}',
   '-3x^(-2)', '-3x^{-2}',
   2, array['basis.exponenten_optellen','basis.negatieve_exp'],
   false, 6),

  -- ── een_macht_maken — diff 3 ─────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'een_macht_maken'),
   'Bepaal f''(x) als f(x) = √x · x',
   'f(x) = \sqrt{x} \cdot x',
   '(3/2)x^(1/2)', '\dfrac{3}{2}x^{\frac{1}{2}}',
   3, array['basis.schrijf_als_macht','basis.exponenten_optellen','basis.gebroken_exp'],
   false, 7),

  ((select id from t), (select id from cl where slug = 'een_macht_maken'),
   'Bepaal f''(x) als f(x) = x² · √x',
   'f(x) = x^{2} \cdot \sqrt{x}',
   '(5/2)x^(3/2)', '\dfrac{5}{2}x^{\frac{3}{2}}',
   3, array['basis.schrijf_als_macht','basis.exponenten_optellen','basis.gebroken_exp'],
   false, 8),

  ((select id from t), (select id from cl where slug = 'een_macht_maken'),
   'Bepaal f''(x) als f(x) = x³/∛x',
   'f(x) = \dfrac{x^{3}}{\sqrt[3]{x}}',
   '(8/3)x^(5/3)', '\dfrac{8}{3}x^{\frac{5}{3}}',
   3, array['basis.schrijf_als_macht','basis.exponenten_aftrekken','basis.gebroken_exp'],
   false, 9);

-- ── Stappen: √x · x → x^{3/2} (een_macht_maken, order 7) ───────────
with q as (
  select id from public.questions
  where latex_body = 'f(x) = \sqrt{x} \cdot x'
    and topic_id = (select id from public.topics where slug = 'basis')
  limit 1
)
insert into public.question_steps (question_id, step_order, step_description, root_cause_id)
select (select id from q), s.step_order, s.step_description, rc.id
from (values
  (1, 'Schrijf de wortel als macht: √x = x^{1/2}',                           'basis.schrijf_als_macht'),
  (2, 'Vermenigvuldig de machten: x^{1/2} · x = x^{1/2 + 1} = x^{3/2}',     'basis.exponenten_optellen'),
  (3, 'f(x) = x^{3/2}',                                                        'basis.exponenten_optellen'),
  (4, 'Pas de machtsregel toe: f''(x) = (3/2) · x^{3/2 − 1}',                'basis.gebroken_exp'),
  (5, 'f''(x) = (3/2)x^{1/2}',                                                'basis.gebroken_exp')
) as s(step_order, step_description, root_cause_slug)
left join public.root_causes rc on rc.slug = s.root_cause_slug
on conflict (question_id, step_order) do update
  set step_description = excluded.step_description,
      root_cause_id    = excluded.root_cause_id;

-- ---------------------------------------------------------------------
-- Seed questions — Somregel (2 clusters)
-- ---------------------------------------------------------------------
delete from public.questions
  where is_ai_generated = false
    and topic_id = (select id from public.topics where slug = 'somregel');

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

  -- ── som_termen — diff 1 (standaard positieve exponenten) ─────────
  ((select id from t), (select id from cl where slug = 'som_termen'),
   'Bepaal f''(x) als f(x) = 3x² + 2x',
   'f(x) = 3x^{2} + 2x',
   '6x+2', '6x+2',
   1, array['somregel.term_voor_term','somregel.constante_factor'],
   false, 1),

  ((select id from t), (select id from cl where slug = 'som_termen'),
   'Bepaal f''(x) als f(x) = x³ − 5x + 1',
   'f(x) = x^{3} - 5x + 1',
   '3x^2-5', '3x^{2}-5',
   1, array['somregel.term_voor_term','somregel.constante_nul'],
   false, 2),

  ((select id from t), (select id from cl where slug = 'som_termen'),
   'Bepaal f''(x) als f(x) = 4x² + 3x − 2',
   'f(x) = 4x^{2} + 3x - 2',
   '8x+3', '8x+3',
   1, array['somregel.term_voor_term','somregel.constante_nul'],
   false, 3),

  -- ── som_termen — diff 2 (wortels en negatieve machten) ───────────
  ((select id from t), (select id from cl where slug = 'som_termen'),
   'Bepaal f''(x) als f(x) = 2x³ − 3x^{-1}',
   'f(x) = 2x^{3} - 3x^{-1}',
   '6x^2+3x^(-2)', '6x^{2}+3x^{-2}',
   2, array['somregel.term_voor_term','somregel.constante_factor'],
   false, 4),

  ((select id from t), (select id from cl where slug = 'som_termen'),
   'Bepaal f''(x) als f(x) = x^{1/2} + 4x^{-2}',
   'f(x) = x^{\frac{1}{2}} + 4x^{-2}',
   '(1/2)x^(-1/2)-8x^(-3)', '\dfrac{1}{2}x^{-\frac{1}{2}}-8x^{-3}',
   2, array['somregel.term_voor_term','somregel.constante_factor'],
   false, 5),

  ((select id from t), (select id from cl where slug = 'som_termen'),
   'Bepaal f''(x) als f(x) = 5x² − 2/x',
   'f(x) = 5x^{2} - \dfrac{2}{x}',
   '10x+2x^(-2)', '10x+2x^{-2}',
   2, array['somregel.term_voor_term','somregel.herleid_eerst'],
   false, 6),

  -- ── som_termen — diff 3 (eerst 1 macht maken, dan differentiëren)
  ((select id from t), (select id from cl where slug = 'som_termen'),
   'Bepaal f''(x) als f(x) = x·x² + 3x',
   'f(x) = x \cdot x^{2} + 3x',
   '3x^2+3', '3x^{2}+3',
   3, array['somregel.herleid_eerst','somregel.term_voor_term'],
   false, 7),

  ((select id from t), (select id from cl where slug = 'som_termen'),
   'Bepaal f''(x) als f(x) = (x³ + 1)/x²',
   'f(x) = \dfrac{x^{3}+1}{x^{2}}',
   '1-2x^(-3)', '1-2x^{-3}',
   3, array['somregel.herleid_eerst','somregel.term_voor_term'],
   false, 8),

  ((select id from t), (select id from cl where slug = 'som_termen'),
   'Bepaal f''(x) als f(x) = x⁴/x + 2x',
   'f(x) = \dfrac{x^{4}}{x} + 2x',
   '3x^2+2', '3x^{2}+2',
   3, array['somregel.herleid_eerst','somregel.term_voor_term'],
   false, 9),

  -- ── haakjes — diff 2 ─────────────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'haakjes'),
   'Bepaal f''(x) als f(x) = (x+1)(x+3)',
   'f(x) = (x+1)(x+3)',
   '2x+4', '2x+4',
   2, array['somregel.haakjes_uitwerken','somregel.term_voor_term'],
   false, 1),

  ((select id from t), (select id from cl where slug = 'haakjes'),
   'Bepaal f''(x) als f(x) = (x+2)(x−3)',
   'f(x) = (x+2)(x-3)',
   '2x-1', '2x-1',
   2, array['somregel.haakjes_uitwerken','somregel.term_voor_term'],
   false, 2),

  ((select id from t), (select id from cl where slug = 'haakjes'),
   'Bepaal f''(x) als f(x) = x(x² + 3x − 1)',
   'f(x) = x(x^{2} + 3x - 1)',
   '3x^2+6x-1', '3x^{2}+6x-1',
   2, array['somregel.haakjes_uitwerken','somregel.term_voor_term'],
   false, 3),

  ((select id from t), (select id from cl where slug = 'haakjes'),
   'Bepaal f''(x) als f(x) = (2x+1)(x−3)',
   'f(x) = (2x+1)(x-3)',
   '4x-5', '4x-5',
   2, array['somregel.haakjes_uitwerken','somregel.gelijknamige_samenvoegen'],
   false, 4),

  ((select id from t), (select id from cl where slug = 'haakjes'),
   'Bepaal f''(x) als f(x) = (x+1)²',
   'f(x) = (x+1)^{2}',
   '2x+2', '2x+2',
   2, array['somregel.haakjes_uitwerken','somregel.gelijknamige_samenvoegen'],
   false, 5),

  -- ── haakjes — diff 3 ─────────────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'haakjes'),
   'Bepaal f''(x) als f(x) = (x+1)²·x',
   'f(x) = (x+1)^{2} \cdot x',
   '3x^2+4x+1', '3x^{2}+4x+1',
   3, array['somregel.haakjes_uitwerken','somregel.gelijknamige_samenvoegen'],
   false, 6),

  ((select id from t), (select id from cl where slug = 'haakjes'),
   'Bepaal f''(x) als f(x) = (x²−1)(x+2)',
   'f(x) = (x^{2}-1)(x+2)',
   '3x^2+4x-1', '3x^{2}+4x-1',
   3, array['somregel.haakjes_uitwerken','somregel.gelijknamige_samenvoegen'],
   false, 7),

  ((select id from t), (select id from cl where slug = 'haakjes'),
   'Bepaal f''(x) als f(x) = (3x−1)(x+2)',
   'f(x) = (3x-1)(x+2)',
   '6x+5', '6x+5',
   3, array['somregel.haakjes_uitwerken','somregel.gelijknamige_samenvoegen'],
   false, 8),

  ((select id from t), (select id from cl where slug = 'haakjes'),
   'Bepaal f''(x) als f(x) = (x+1)³',
   'f(x) = (x+1)^{3}',
   '3x^2+6x+3', '3x^{2}+6x+3',
   3, array['somregel.haakjes_uitwerken','somregel.gelijknamige_samenvoegen'],
   false, 9);

-- ── Stappen: (x+1)(x+3) (haakjes, order 1) ───────────────────────────
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

-- Voorbeeld stappenplan Basis — f(x) = x⁴
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
  (1, 'Herken n in x^n: hier is n = 4',                'basis.n_herkennen'),
  (2, 'Je gebruikt nx^{n−1}: zet eerst de factor n klaar', 'basis.exponent_maalt'),
  (3, 'Vermenigvuldig: 4 · 1 = 4 (coëfficiënt van x⁴ is 1)', 'basis.exponent_maalt'),
  (4, 'Verlaag de exponent: 4 − 1 = 3',                 'basis.exponent_verlagen'),
  (5, 'Schrijf f''(x) = 4x³',                          'basis.notatie_fout')
) as s(step_order, step_description, root_cause_slug)
left join public.root_causes rc on rc.slug = s.root_cause_slug
on conflict (question_id, step_order) do update
  set step_description = excluded.step_description,
      root_cause_id    = excluded.root_cause_id;

-- ---------------------------------------------------------------------
-- Seed questions — Productregel
-- ---------------------------------------------------------------------
delete from public.questions
  where is_ai_generated = false
    and topic_id = (select id from public.topics where slug = 'productregel');

with
  t as (select id from public.topics where slug = 'productregel'),
  cl as (
    select tc.slug, tc.id
    from public.topic_clusters tc
    join public.topics tt on tt.id = tc.topic_id
    where tt.slug = 'productregel'
  )
insert into public.questions
  (topic_id, cluster_id, body, latex_body, answer, latex_answer,
   difficulty, root_cause_tags, is_ai_generated, order_index)
values

  -- ── haakjes_staan — diff 2 ─────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'haakjes_staan'),
   'Bepaal f''(x) als f(x) = (x+3)². Gebruik de productregel.',
   'f(x) = (x+3)^{2}',
   '2(x+3)', '2(x+3)',
   2, array['productregel.fg_identificeren','productregel.formule_invullen','productregel.haakjes_staan'],
   false, 1),

  ((select id from t), (select id from cl where slug = 'haakjes_staan'),
   'Bepaal f''(x) als f(x) = (2x−5)². Gebruik de productregel.',
   'f(x) = (2x-5)^{2}',
   '4(2x-5)', '4(2x-5)',
   2, array['productregel.fg_identificeren','productregel.formule_invullen','productregel.haakjes_staan'],
   false, 2),

  ((select id from t), (select id from cl where slug = 'haakjes_staan'),
   'Bepaal f''(x) als f(x) = (3x+1)(x−2). Gebruik de productregel.',
   'f(x) = (3x+1)(x-2)',
   '3(x-2)+(3x+1)', '3(x-2)+(3x+1)',
   2, array['productregel.fg_identificeren','productregel.formule_invullen','productregel.haakjes_staan'],
   false, 3),

  ((select id from t), (select id from cl where slug = 'haakjes_staan'),
   'Bepaal f''(x) als f(x) = (2x+1)². Gebruik de productregel.',
   'f(x) = (2x+1)^{2}',
   '4(2x+1)', '4(2x+1)',
   2, array['productregel.fg_identificeren','productregel.formule_invullen','productregel.haakjes_staan'],
   false, 4),

  ((select id from t), (select id from cl where slug = 'haakjes_staan'),
   'Bepaal f''(x) als f(x) = (2−3x²)(2+7x). Gebruik de productregel.',
   'f(x) = (2-3x^{2})(2+7x)',
   '-6x(2+7x)+7(2-3x^2)', '-6x(2+7x)+7(2-3x^{2})',
   2, array['productregel.fg_identificeren','productregel.formule_invullen','productregel.haakjes_staan'],
   false, 5),

  -- ── haakjes_staan — diff 3 ─────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'haakjes_staan'),
   'Bepaal f''(x) als f(x) = (x²−4)(x³+2x+3). Gebruik de productregel.',
   'f(x) = (x^{2}-4)(x^{3}+2x+3)',
   '2x(x^3+2x+3)+(x^2-4)(3x^2+2)', '2x(x^{3}+2x+3)+(x^{2}-4)(3x^{2}+2)',
   3, array['productregel.fg_identificeren','productregel.f_differentieren','productregel.g_differentieren','productregel.haakjes_staan'],
   false, 6),

  ((select id from t), (select id from cl where slug = 'haakjes_staan'),
   'Bepaal g''(x) als g(x) = (3x²−4)². Gebruik de productregel.',
   'g(x) = (3x^{2}-4)^{2}',
   '12x(3x^2-4)', '12x(3x^{2}-4)',
   3, array['productregel.fg_identificeren','productregel.formule_invullen','productregel.haakjes_staan'],
   false, 7),

  ((select id from t), (select id from cl where slug = 'haakjes_staan'),
   'Bepaal f''(x) als f(x) = (x³+1)(x²−2). Gebruik de productregel.',
   'f(x) = (x^{3}+1)(x^{2}-2)',
   '3x^2(x^2-2)+2x(x^3+1)', '3x^{2}(x^{2}-2)+2x(x^{3}+1)',
   3, array['productregel.fg_identificeren','productregel.f_differentieren','productregel.g_differentieren','productregel.haakjes_staan'],
   false, 8),

  ((select id from t), (select id from cl where slug = 'haakjes_staan'),
   'Bepaal h''(x) als h(x) = (x²−3x)(x³+x²+x). Gebruik de productregel.',
   'h(x) = (x^{2}-3x)(x^{3}+x^{2}+x)',
   '(2x-3)(x^3+x^2+x)+(x^2-3x)(3x^2+2x+1)',
   '(2x-3)(x^{3}+x^{2}+x)+(x^{2}-3x)(3x^{2}+2x+1)',
   3, array['productregel.fg_identificeren','productregel.f_differentieren','productregel.g_differentieren','productregel.haakjes_staan'],
   false, 9),

  -- ── twee_veeltermen (bestaande vragen) ────────────────────────
  ((select id from t),
   (select id from cl where slug = 'twee_veeltermen'),
   'Differentieer f(x) = x(x^{2}+1)',
   'f(x) = x(x^{2}+1)',
   '3x^2+1', '3x^{2} + 1',
   1,
   array['productregel.formule_invullen'],
   false, 1),

  ((select id from t),
   (select id from cl where slug = 'twee_veeltermen'),
   'Bepaal h''(x) als h(x) = (x+2)(x−3)',
   'h(x) = (x+2)(x-3)',
   '2x-1', '2x - 1',
   1,
   array['productregel.formule_invullen'],
   false, 2),

  ((select id from t),
   (select id from cl where slug = 'veelterm_macht'),
   'Differentieer g(x) = x^{2}(x^{3}+4)',
   'g(x) = x^{2}(x^{3}+4)',
   '5x^4+8x', '5x^{4} + 8x',
   2,
   array['productregel.formule_invullen'],
   false, 3),

  ((select id from t),
   (select id from cl where slug = 'veelterm_macht'),
   'Differentieer f(x) = (2x − 5)(x^{2}+x)',
   'f(x) = (2x - 5)(x^{2}+x)',
   '6x^2-6x-5', '6x^{2} - 6x - 5',
   3,
   array['productregel.formule_invullen'],
   false, 4),

  ((select id from t),
   (select id from cl where slug = 'veelterm_wortel'),
   'Bepaal g''(x) als g(x) = x^{3}\sqrt{x}',
   'g(x) = x^{3}\sqrt{x}',
   '7/2x^{5/2}', '\\tfrac{7}{2}x^{5/2}',
   2,
   array['productregel.fg_identificeren','productregel.formule_invullen'],
   false, 5),

  ((select id from t),
   (select id from cl where slug = 'twee_veeltermen'),
   'Differentieer k(x) = (x^{2}−9)(x+1)',
   'k(x) = (x^{2}-9)(x+1)',
   '3x^2+2x-9', '3x^{2} + 2x - 9',
   2,
   array['productregel.formule_invullen'],
   false, 6),

  ((select id from t),
   (select id from cl where slug = 'drie_factoren'),
   'Differentieer f(x) = 2x \cdot x^{2} \cdot x',
   'f(x) = 2x \cdot x^{2} \cdot x',
   '8x^3', '8x^{3}',
   2,
   array['productregel.formule_invullen','productregel.vereenvoudigen'],
   false, 7),

  ((select id from t),
   (select id from cl where slug = 'drie_factoren'),
   'Bepaal F''(t) als F(t) = t(t−1)(t+2)',
   'F(t) = t(t-1)(t+2)',
   '3t^2+2t-2', '3t^{2} + 2t - 2',
   3,
   array['productregel.formule_invullen'],
   false, 8),

  ((select id from t),
   (select id from cl where slug = 'veelterm_macht'),
   'Differentieer h(x) = (x+3)(x^{2} − 7x)',
   'h(x) = (x+3)(x^{2} - 7x)',
   '3x^2-8x-21', '3x^{2} - 8x - 21',
   2,
   array['productregel.formule_invullen'],
   false, 9);

-- ── Stappen: f(x) = (x²-4)(x³+2x+3) (haakjes_staan, order 6) ──────
with q as (
  select id from public.questions
  where latex_body = 'f(x) = (x^{2}-4)(x^{3}+2x+3)'
    and topic_id = (select id from public.topics where slug = 'productregel')
  limit 1
)
insert into public.question_steps (question_id, step_order, step_description, root_cause_id)
select (select id from q), s.step_order, s.step_description, rc.id
from (values
  (1, 'Benoem f = x²-4 en g = x³+2x+3',                                      'productregel.fg_identificeren'),
  (2, 'Differentieer f: f'' = 2x',                                             'productregel.f_differentieren'),
  (3, 'Differentieer g: g'' = 3x²+2',                                          'productregel.g_differentieren'),
  (4, 'Pas productregel toe: f''(x) = f''·g + f·g''',                         'productregel.formule_invullen'),
  (5, 'f''(x) = 2x·(x³+2x+3) + (x²-4)·(3x²+2)',                              'productregel.haakjes_staan'),
  (6, 'Laat de haakjes staan: f''(x) = 2x(x³+2x+3) + (x²-4)(3x²+2)',         'productregel.haakjes_staan')
) as s(step_order, step_description, root_cause_slug)
left join public.root_causes rc on rc.slug = s.root_cause_slug
on conflict (question_id, step_order) do update
  set step_description = excluded.step_description,
      root_cause_id    = excluded.root_cause_id;

-- ---------------------------------------------------------------------
-- Seed questions — Quotiëntregel
-- ---------------------------------------------------------------------
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

-- ── Stappen: f(x) = (3−x²)/(x−2) + x³ (combi_somregel, order 6) ─────
with q as (
  select id from public.questions
  where latex_body = 'f(x) = \dfrac{3-x^{2}}{x-2} + x^{3}'
    and topic_id = (select id from public.topics where slug = 'quotientregel')
  limit 1
)
insert into public.question_steps (question_id, step_order, step_description, root_cause_id)
select (select id from q), s.step_order, s.step_description, rc.id
from (values
  (1, 'Splits de functie: één breukdeel + één machtsdeel',                          'quotientregel.combi_somregel'),
  (2, 'Differentieer de breuk (3−x²)/(x−2) met de quotiëntregel',                 'quotientregel.formule_volgorde'),
  (3, 'Stel t = 3−x², t'' = −2x  en  n = x−2, n'' = 1',                           'quotientregel.tn_identificeren'),
  (4, 't''n − tn'' = −2x(x−2) − (3−x²)·1 = −2x²+4x−3+x² = −x²+4x−3',           'quotientregel.t_differentieren'),
  (5, 'Quotiëntdeel: (−x²+4x−3)/(x−2)²',                                          'quotientregel.noemer_kwadraat'),
  (6, 'Differentieer het machtsdeel: d/dx[x³] = 3x²',                              'quotientregel.combi_somregel'),
  (7, 'f''(x) = (−x²+4x−3)/(x−2)² + 3x²',                                        'quotientregel.combi_somregel')
) as s(step_order, step_description, root_cause_slug)
left join public.root_causes rc on rc.slug = s.root_cause_slug
on conflict (question_id, step_order) do update
  set step_description = excluded.step_description,
      root_cause_id    = excluded.root_cause_id;


-- ---------------------------------------------------------------------
-- Seed questions — Kettingregel
-- ---------------------------------------------------------------------
delete from public.questions
  where is_ai_generated = false
    and topic_id = (select id from public.topics where slug = 'kettingregel');

with
  t as (select id from public.topics where slug = 'kettingregel'),
  cl as (
    select tc.slug, tc.id
    from public.topic_clusters tc
    join public.topics tt on tt.id = tc.topic_id
    where tt.slug = 'kettingregel'
  )
insert into public.questions
  (topic_id, cluster_id, body, latex_body, answer, latex_answer,
   difficulty, root_cause_tags, is_ai_generated, order_index)
values

  -- ── macht_lineair diff 1 ──────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'macht_lineair'),
   'Bepaal f''(x) als f(x) = (x−3)^4',
   'f(x) = (x-3)^{4}',
   '4(x-3)^3', '4(x-3)^{3}',
   1, array['kettingregel.buitenste_differentieren','kettingregel.vermenigvuldigen'],
   false, 1),

  ((select id from t), (select id from cl where slug = 'macht_lineair'),
   'Bepaal f''(x) als f(x) = (2x+1)^3',
   'f(x) = (2x+1)^{3}',
   '6(2x+1)^2', '6(2x+1)^{2}',
   1, array['kettingregel.binnenste_differentieren','kettingregel.vermenigvuldigen'],
   false, 2),

  ((select id from t), (select id from cl where slug = 'macht_lineair'),
   'Bepaal f''(x) als f(x) = (3x+2)^2',
   'f(x) = (3x+2)^{2}',
   '6(3x+2)', '6(3x+2)',
   1, array['kettingregel.binnenste_differentieren','kettingregel.vermenigvuldigen'],
   false, 3),

  -- ── macht_lineair diff 2 ──────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'macht_lineair'),
   'Bepaal f''(x) als f(x) = (4x+3)^3',
   'f(x) = (4x+3)^{3}',
   '12(4x+3)^2', '12(4x+3)^{2}',
   2, array['kettingregel.binnenste_differentieren','kettingregel.vermenigvuldigen'],
   false, 4),

  ((select id from t), (select id from cl where slug = 'macht_lineair'),
   'Bepaal f''(x) als f(x) = −2(2x+1)^4',
   'f(x) = -2(2x+1)^{4}',
   '-16(2x+1)^3', '-16(2x+1)^{3}',
   2, array['kettingregel.binnenste_differentieren','kettingregel.vermenigvuldigen'],
   false, 5),

  ((select id from t), (select id from cl where slug = 'macht_lineair'),
   'Bepaal f''(x) als f(x) = (3x−1)^5',
   'f(x) = (3x-1)^{5}',
   '15(3x-1)^4', '15(3x-1)^{4}',
   2, array['kettingregel.binnenste_differentieren','kettingregel.vermenigvuldigen'],
   false, 6),

  ((select id from t), (select id from cl where slug = 'macht_lineair'),
   'Bepaal f''(x) als f(x) = 4(x−2)^3',
   'f(x) = 4(x-2)^{3}',
   '12(x-2)^2', '12(x-2)^{2}',
   2, array['kettingregel.buitenste_differentieren','kettingregel.vermenigvuldigen'],
   false, 7),

  -- ── macht_lineair diff 3 ──────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'macht_lineair'),
   'Bepaal f''(x) als f(x) = (1−2x)^6',
   'f(x) = (1-2x)^{6}',
   '-12(1-2x)^5', '-12(1-2x)^{5}',
   3, array['kettingregel.binnenste_differentieren','kettingregel.vermenigvuldigen'],
   false, 8),

  ((select id from t), (select id from cl where slug = 'macht_lineair'),
   'Bepaal f''(x) als f(x) = (2−3x)^5',
   'f(x) = (2-3x)^{5}',
   '-15(2-3x)^4', '-15(2-3x)^{4}',
   3, array['kettingregel.binnenste_differentieren','kettingregel.vermenigvuldigen'],
   false, 9),

  -- ── macht_veelterm diff 2 ─────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'macht_veelterm'),
   'Bepaal f''(x) als f(x) = (x²+1)^3',
   'f(x) = (x^{2}+1)^{3}',
   '6x(x^2+1)^2', '6x(x^{2}+1)^{2}',
   2, array['kettingregel.binnenste_differentieren','kettingregel.vermenigvuldigen'],
   false, 1),

  ((select id from t), (select id from cl where slug = 'macht_veelterm'),
   'Bepaal f''(x) als f(x) = (x²−4)^2',
   'f(x) = (x^{2}-4)^{2}',
   '4x(x^2-4)', '4x(x^{2}-4)',
   2, array['kettingregel.binnenste_differentieren','kettingregel.vermenigvuldigen'],
   false, 2),

  ((select id from t), (select id from cl where slug = 'macht_veelterm'),
   'Bepaal f''(x) als f(x) = (2x²+1)^3',
   'f(x) = (2x^{2}+1)^{3}',
   '12x(2x^2+1)^2', '12x(2x^{2}+1)^{2}',
   2, array['kettingregel.binnenste_differentieren','kettingregel.vermenigvuldigen'],
   false, 3),

  ((select id from t), (select id from cl where slug = 'macht_veelterm'),
   'Bepaal f''(x) als f(x) = (x²+3x)^2',
   'f(x) = (x^{2}+3x)^{2}',
   '2(2x+3)(x^2+3x)', '2(2x+3)(x^{2}+3x)',
   2, array['kettingregel.binnenste_differentieren','kettingregel.vermenigvuldigen'],
   false, 4),

  -- ── macht_veelterm diff 3 ─────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'macht_veelterm'),
   'Bepaal f''(x) als f(x) = (4x²−3)^4',
   'f(x) = (4x^{2}-3)^{4}',
   '32x(4x^2-3)^3', '32x(4x^{2}-3)^{3}',
   3, array['kettingregel.binnenste_differentieren','kettingregel.vermenigvuldigen'],
   false, 5),

  ((select id from t), (select id from cl where slug = 'macht_veelterm'),
   'Bepaal f''(x) als f(x) = (x²−2x+3)^3',
   'f(x) = (x^{2}-2x+3)^{3}',
   '6(x-1)(x^2-2x+3)^2', '6(x-1)(x^{2}-2x+3)^{2}',
   3, array['kettingregel.binnenste_differentieren','kettingregel.vermenigvuldigen'],
   false, 6),

  ((select id from t), (select id from cl where slug = 'macht_veelterm'),
   'Bepaal f''(x) als f(x) = 4(x³+7x−2)^2',
   'f(x) = 4(x^{3}+7x-2)^{2}',
   '8(3x^2+7)(x^3+7x-2)', '8(3x^{2}+7)(x^{3}+7x-2)',
   3, array['kettingregel.binnenste_differentieren','kettingregel.vermenigvuldigen'],
   false, 7),

  ((select id from t), (select id from cl where slug = 'macht_veelterm'),
   'Bepaal f''(x) als f(x) = (x²+x+1)^4',
   'f(x) = (x^{2}+x+1)^{4}',
   '4(2x+1)(x^2+x+1)^3', '4(2x+1)(x^{2}+x+1)^{3}',
   3, array['kettingregel.binnenste_differentieren','kettingregel.vermenigvuldigen'],
   false, 8),

  ((select id from t), (select id from cl where slug = 'macht_veelterm'),
   'Bepaal f''(x) als f(x) = (x³−x)^2',
   'f(x) = (x^{3}-x)^{2}',
   '2(3x^2-1)(x^3-x)', '2(3x^{2}-1)(x^{3}-x)',
   3, array['kettingregel.binnenste_differentieren','kettingregel.vermenigvuldigen'],
   false, 9),

  -- ── wortel diff 1 ─────────────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'wortel'),
   'Bepaal f''(x) als f(x) = √(x+5)',
   'f(x) = \sqrt{x+5}',
   '1/(2sqrt(x+5))', '\dfrac{1}{2\sqrt{x+5}}',
   1, array['kettingregel.herschrijven_machtsvorm','kettingregel.vermenigvuldigen'],
   false, 1),

  ((select id from t), (select id from cl where slug = 'wortel'),
   'Bepaal f''(x) als f(x) = √(2x+1)',
   'f(x) = \sqrt{2x+1}',
   '1/sqrt(2x+1)', '\dfrac{1}{\sqrt{2x+1}}',
   1, array['kettingregel.herschrijven_machtsvorm','kettingregel.binnenste_differentieren'],
   false, 2),

  ((select id from t), (select id from cl where slug = 'wortel'),
   'Bepaal f''(x) als f(x) = √(4x+1)',
   'f(x) = \sqrt{4x+1}',
   '2/sqrt(4x+1)', '\dfrac{2}{\sqrt{4x+1}}',
   1, array['kettingregel.herschrijven_machtsvorm','kettingregel.binnenste_differentieren'],
   false, 3),

  -- ── wortel diff 2 ─────────────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'wortel'),
   'Bepaal f''(x) als f(x) = √(3x−2)',
   'f(x) = \sqrt{3x-2}',
   '3/(2sqrt(3x-2))', '\dfrac{3}{2\sqrt{3x-2}}',
   2, array['kettingregel.herschrijven_machtsvorm','kettingregel.binnenste_differentieren'],
   false, 4),

  ((select id from t), (select id from cl where slug = 'wortel'),
   'Bepaal f''(x) als f(x) = 3√(2x−1)',
   'f(x) = 3\sqrt{2x-1}',
   '3/sqrt(2x-1)', '\dfrac{3}{\sqrt{2x-1}}',
   2, array['kettingregel.herschrijven_machtsvorm','kettingregel.binnenste_differentieren'],
   false, 5),

  ((select id from t), (select id from cl where slug = 'wortel'),
   'Bepaal f''(x) als f(x) = √(x²+1)',
   'f(x) = \sqrt{x^{2}+1}',
   'x/sqrt(x^2+1)', '\dfrac{x}{\sqrt{x^{2}+1}}',
   2, array['kettingregel.herschrijven_machtsvorm','kettingregel.binnenste_differentieren'],
   false, 6),

  -- ── wortel diff 3 ─────────────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'wortel'),
   'Bepaal f''(x) als f(x) = √(2x²+4x)',
   'f(x) = \sqrt{2x^{2}+4x}',
   '(2x+2)/sqrt(2x^2+4x)', '\dfrac{2x+2}{\sqrt{2x^{2}+4x}}',
   3, array['kettingregel.herschrijven_machtsvorm','kettingregel.binnenste_differentieren'],
   false, 7),

  ((select id from t), (select id from cl where slug = 'wortel'),
   'Bepaal f''(x) als f(x) = √(x²+2x+3)',
   'f(x) = \sqrt{x^{2}+2x+3}',
   '(x+1)/sqrt(x^2+2x+3)', '\dfrac{x+1}{\sqrt{x^{2}+2x+3}}',
   3, array['kettingregel.herschrijven_machtsvorm','kettingregel.binnenste_differentieren'],
   false, 8),

  ((select id from t), (select id from cl where slug = 'wortel'),
   'Bepaal f''(x) als f(x) = 4√(x²+3)',
   'f(x) = 4\sqrt{x^{2}+3}',
   '4x/sqrt(x^2+3)', '\dfrac{4x}{\sqrt{x^{2}+3}}',
   3, array['kettingregel.herschrijven_machtsvorm','kettingregel.binnenste_differentieren'],
   false, 9),

  -- ── negatieve_macht diff 2 ────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'negatieve_macht'),
   'Bepaal f''(x) als f(x) = 1/(x+1)^2',
   'f(x) = \dfrac{1}{(x+1)^{2}}',
   '-2/(x+1)^3', '\dfrac{-2}{(x+1)^{3}}',
   2, array['kettingregel.herschrijven_machtsvorm','kettingregel.vermenigvuldigen'],
   false, 1),

  ((select id from t), (select id from cl where slug = 'negatieve_macht'),
   'Bepaal f''(x) als f(x) = 1/(2x−1)^3',
   'f(x) = \dfrac{1}{(2x-1)^{3}}',
   '-6/(2x-1)^4', '\dfrac{-6}{(2x-1)^{4}}',
   2, array['kettingregel.herschrijven_machtsvorm','kettingregel.binnenste_differentieren','kettingregel.vermenigvuldigen'],
   false, 2),

  ((select id from t), (select id from cl where slug = 'negatieve_macht'),
   'Bepaal f''(x) als f(x) = 1/(3x+2)^2',
   'f(x) = \dfrac{1}{(3x+2)^{2}}',
   '-6/(3x+2)^3', '\dfrac{-6}{(3x+2)^{3}}',
   2, array['kettingregel.herschrijven_machtsvorm','kettingregel.binnenste_differentieren'],
   false, 3),

  ((select id from t), (select id from cl where slug = 'negatieve_macht'),
   'Bepaal f''(x) als f(x) = 1/√(2x+1)',
   'f(x) = \dfrac{1}{\sqrt{2x+1}}',
   '-1/(2x+1)^(3/2)', '\dfrac{-1}{(2x+1)^{3/2}}',
   2, array['kettingregel.herschrijven_machtsvorm','kettingregel.vermenigvuldigen'],
   false, 4),

  ((select id from t), (select id from cl where slug = 'negatieve_macht'),
   'Bepaal f''(x) als f(x) = 1/√(4x−1)',
   'f(x) = \dfrac{1}{\sqrt{4x-1}}',
   '-2/(4x-1)^(3/2)', '\dfrac{-2}{(4x-1)^{3/2}}',
   2, array['kettingregel.herschrijven_machtsvorm','kettingregel.binnenste_differentieren'],
   false, 5),

  -- ── negatieve_macht diff 3 ────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'negatieve_macht'),
   'Bepaal f''(x) als f(x) = 1/(x²+1)^2',
   'f(x) = \dfrac{1}{(x^{2}+1)^{2}}',
   '-4x/(x^2+1)^3', '\dfrac{-4x}{(x^{2}+1)^{3}}',
   3, array['kettingregel.herschrijven_machtsvorm','kettingregel.binnenste_differentieren','kettingregel.vermenigvuldigen'],
   false, 6),

  ((select id from t), (select id from cl where slug = 'negatieve_macht'),
   'Bepaal f''(x) als f(x) = 4/(2x+3)^3',
   'f(x) = \dfrac{4}{(2x+3)^{3}}',
   '-24/(2x+3)^4', '\dfrac{-24}{(2x+3)^{4}}',
   3, array['kettingregel.herschrijven_machtsvorm','kettingregel.binnenste_differentieren'],
   false, 7),

  ((select id from t), (select id from cl where slug = 'negatieve_macht'),
   'Bepaal f''(x) als f(x) = 1/√(x²+2x+3)',
   'f(x) = \dfrac{1}{\sqrt{x^{2}+2x+3}}',
   '-(x+1)/(x^2+2x+3)^(3/2)', '\dfrac{-(x+1)}{(x^{2}+2x+3)^{3/2}}',
   3, array['kettingregel.herschrijven_machtsvorm','kettingregel.binnenste_differentieren'],
   false, 8),

  ((select id from t), (select id from cl where slug = 'negatieve_macht'),
   'Bepaal f''(x) als f(x) = −6/(x²+3x)^3',
   'f(x) = \dfrac{-6}{(x^{2}+3x)^{3}}',
   '18(2x+3)/(x^2+3x)^4', '\dfrac{18(2x+3)}{(x^{2}+3x)^{4}}',
   3, array['kettingregel.herschrijven_machtsvorm','kettingregel.binnenste_differentieren','kettingregel.vermenigvuldigen'],
   false, 9),

  -- ── combi_somregel diff 2 ─────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = x² + (2x+1)^3',
   'f(x) = x^{2} + (2x+1)^{3}',
   '2x+6(2x+1)^2', '2x+6(2x+1)^{2}',
   2, array['kettingregel.buitenste_differentieren','kettingregel.combi_somregel'],
   false, 1),

  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = 2x + (3x−1)^2',
   'f(x) = 2x + (3x-1)^{2}',
   '2+6(3x-1)', '2+6(3x-1)',
   2, array['kettingregel.binnenste_differentieren','kettingregel.combi_somregel'],
   false, 2),

  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = x³ + (x+2)^4',
   'f(x) = x^{3} + (x+2)^{4}',
   '3x^2+4(x+2)^3', '3x^{2}+4(x+2)^{3}',
   2, array['kettingregel.buitenste_differentieren','kettingregel.combi_somregel'],
   false, 3),

  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = x + √(2x+1)',
   'f(x) = x + \sqrt{2x+1}',
   '1+1/sqrt(2x+1)', '1+\dfrac{1}{\sqrt{2x+1}}',
   2, array['kettingregel.herschrijven_machtsvorm','kettingregel.combi_somregel'],
   false, 4),

  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = 3x² + √(x²+1)',
   'f(x) = 3x^{2} + \sqrt{x^{2}+1}',
   '6x+x/sqrt(x^2+1)', '6x+\dfrac{x}{\sqrt{x^{2}+1}}',
   2, array['kettingregel.herschrijven_machtsvorm','kettingregel.combi_somregel'],
   false, 5),

  -- ── combi_somregel diff 3 ─────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = 5x − 4/(3x+2)^3',
   'f(x) = 5x - \dfrac{4}{(3x+2)^{3}}',
   '5+36/(3x+2)^4', '5+\dfrac{36}{(3x+2)^{4}}',
   3, array['kettingregel.herschrijven_machtsvorm','kettingregel.combi_somregel'],
   false, 6),

  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = 3x² − (2x−1)^3',
   'f(x) = 3x^{2} - (2x-1)^{3}',
   '6x-6(2x-1)^2', '6x-6(2x-1)^{2}',
   3, array['kettingregel.binnenste_differentieren','kettingregel.combi_somregel'],
   false, 7),

  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = x − 1/(2x+1)^2',
   'f(x) = x - \dfrac{1}{(2x+1)^{2}}',
   '1+4/(2x+1)^3', '1+\dfrac{4}{(2x+1)^{3}}',
   3, array['kettingregel.herschrijven_machtsvorm','kettingregel.combi_somregel'],
   false, 8),

  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = x² + (x²+1)^3',
   'f(x) = x^{2} + (x^{2}+1)^{3}',
   '2x+6x(x^2+1)^2', '2x+6x(x^{2}+1)^{2}',
   3, array['kettingregel.binnenste_differentieren','kettingregel.combi_somregel'],
   false, 9),

  -- ── plus_productregel diff 2 ──────────────────────────────────
  ((select id from t), (select id from cl where slug = 'plus_productregel'),
   'Bepaal f''(x) als f(x) = x·√(2x+1)',
   'f(x) = x\sqrt{2x+1}',
   '(3x+1)/sqrt(2x+1)', '\dfrac{3x+1}{\sqrt{2x+1}}',
   2, array['kettingregel.regel_combineren','productregel.formule_invullen','kettingregel.herschrijven_machtsvorm'],
   false, 1),

  ((select id from t), (select id from cl where slug = 'plus_productregel'),
   'Bepaal f''(x) als f(x) = x·(2x+1)^3',
   'f(x) = x(2x+1)^{3}',
   '(2x+1)^3+6x(2x+1)^2', '(2x+1)^{3}+6x(2x+1)^{2}',
   2, array['kettingregel.regel_combineren','productregel.formule_invullen'],
   false, 2),

  ((select id from t), (select id from cl where slug = 'plus_productregel'),
   'Bepaal f''(x) als f(x) = x·√(3x+1)',
   'f(x) = x\sqrt{3x+1}',
   '(9x+2)/(2sqrt(3x+1))', '\dfrac{9x+2}{2\sqrt{3x+1}}',
   2, array['kettingregel.regel_combineren','productregel.formule_invullen','kettingregel.herschrijven_machtsvorm'],
   false, 3),

  ((select id from t), (select id from cl where slug = 'plus_productregel'),
   'Bepaal f''(x) als f(x) = x²·√(x+1)',
   'f(x) = x^{2}\sqrt{x+1}',
   '(5x^2+4x)/(2sqrt(x+1))', '\dfrac{5x^{2}+4x}{2\sqrt{x+1}}',
   2, array['kettingregel.regel_combineren','productregel.formule_invullen','kettingregel.herschrijven_machtsvorm'],
   false, 4),

  -- ── plus_productregel diff 3 ──────────────────────────────────
  ((select id from t), (select id from cl where slug = 'plus_productregel'),
   'Bepaal f''(x) als f(x) = x·(3x+1)^3',
   'f(x) = x(3x+1)^{3}',
   '(3x+1)^3+9x(3x+1)^2', '(3x+1)^{3}+9x(3x+1)^{2}',
   3, array['kettingregel.regel_combineren','productregel.formule_invullen'],
   false, 5),

  ((select id from t), (select id from cl where slug = 'plus_productregel'),
   'Bepaal f''(x) als f(x) = x·√(x²+1)',
   'f(x) = x\sqrt{x^{2}+1}',
   '(2x^2+1)/sqrt(x^2+1)', '\dfrac{2x^{2}+1}{\sqrt{x^{2}+1}}',
   3, array['kettingregel.regel_combineren','productregel.formule_invullen','kettingregel.binnenste_differentieren'],
   false, 6),

  ((select id from t), (select id from cl where slug = 'plus_productregel'),
   'Bepaal f''(x) als f(x) = (x+1)·(2x−1)^3',
   'f(x) = (x+1)(2x-1)^{3}',
   '(2x-1)^3+6(x+1)(2x-1)^2', '(2x-1)^{3}+6(x+1)(2x-1)^{2}',
   3, array['kettingregel.regel_combineren','productregel.formule_invullen'],
   false, 7),

  ((select id from t), (select id from cl where slug = 'plus_productregel'),
   'Bepaal f''(x) als f(x) = x·√(3x−1)',
   'f(x) = x\sqrt{3x-1}',
   '(9x-2)/(2sqrt(3x-1))', '\dfrac{9x-2}{2\sqrt{3x-1}}',
   3, array['kettingregel.regel_combineren','productregel.formule_invullen','kettingregel.herschrijven_machtsvorm'],
   false, 8),

  ((select id from t), (select id from cl where slug = 'plus_productregel'),
   'Bepaal f''(x) als f(x) = x²·(x²+1)^2',
   'f(x) = x^{2}(x^{2}+1)^{2}',
   '2x(x^2+1)^2+4x^3(x^2+1)', '2x(x^{2}+1)^{2}+4x^{3}(x^{2}+1)',
   3, array['kettingregel.regel_combineren','productregel.formule_invullen','kettingregel.binnenste_differentieren'],
   false, 9),

  -- ── plus_quotientregel diff 2 ─────────────────────────────────
  ((select id from t), (select id from cl where slug = 'plus_quotientregel'),
   'Bepaal f''(x) als f(x) = x/√(2x+1)',
   'f(x) = \dfrac{x}{\sqrt{2x+1}}',
   '(x+1)/(2x+1)^(3/2)', '\dfrac{x+1}{(2x+1)^{3/2}}',
   2, array['kettingregel.regel_combineren','quotientregel.formule_volgorde','kettingregel.herschrijven_machtsvorm'],
   false, 1),

  ((select id from t), (select id from cl where slug = 'plus_quotientregel'),
   'Bepaal f''(x) als f(x) = x/√(4x−1)',
   'f(x) = \dfrac{x}{\sqrt{4x-1}}',
   '(2x-1)/(4x-1)^(3/2)', '\dfrac{2x-1}{(4x-1)^{3/2}}',
   2, array['kettingregel.regel_combineren','quotientregel.formule_volgorde','kettingregel.herschrijven_machtsvorm'],
   false, 2),

  ((select id from t), (select id from cl where slug = 'plus_quotientregel'),
   'Bepaal f''(x) als f(x) = (x+3)/√(2x+1)',
   'f(x) = \dfrac{x+3}{\sqrt{2x+1}}',
   '(x-2)/(2x+1)^(3/2)', '\dfrac{x-2}{(2x+1)^{3/2}}',
   2, array['kettingregel.regel_combineren','quotientregel.formule_volgorde','kettingregel.herschrijven_machtsvorm'],
   false, 3),

  ((select id from t), (select id from cl where slug = 'plus_quotientregel'),
   'Bepaal f''(x) als f(x) = (x²+1)/(2x+1)',
   'f(x) = \dfrac{x^{2}+1}{2x+1}',
   '(2x^2+2x-2)/(2x+1)^2', '\dfrac{2x^{2}+2x-2}{(2x+1)^{2}}',
   2, array['kettingregel.regel_combineren','quotientregel.formule_volgorde'],
   false, 4),

  ((select id from t), (select id from cl where slug = 'plus_quotientregel'),
   'Bepaal g''(x) als g(x) = (x+6)/√(8x+9)',
   'g(x) = \dfrac{x+6}{\sqrt{8x+9}}',
   '(4x-15)/(8x+9)^(3/2)', '\dfrac{4x-15}{(8x+9)^{3/2}}',
   2, array['kettingregel.regel_combineren','quotientregel.formule_volgorde','kettingregel.herschrijven_machtsvorm'],
   false, 5),

  -- ── plus_quotientregel diff 3 ─────────────────────────────────
  ((select id from t), (select id from cl where slug = 'plus_quotientregel'),
   'Bepaal k''(x) als k(x) = (x²−1)/√(4x+1)',
   'k(x) = \dfrac{x^{2}-1}{\sqrt{4x+1}}',
   '(6x^2+2x+2)/(4x+1)^(3/2)', '\dfrac{6x^{2}+2x+2}{(4x+1)^{3/2}}',
   3, array['kettingregel.regel_combineren','quotientregel.formule_volgorde','kettingregel.binnenste_differentieren'],
   false, 6),

  ((select id from t), (select id from cl where slug = 'plus_quotientregel'),
   'Bepaal f''(x) als f(x) = (x²+1)/(3x−2)^2',
   'f(x) = \dfrac{x^{2}+1}{(3x-2)^{2}}',
   '(-4x-6)/(3x-2)^3', '\dfrac{-4x-6}{(3x-2)^{3}}',
   3, array['kettingregel.regel_combineren','quotientregel.formule_volgorde','kettingregel.binnenste_differentieren'],
   false, 7),

  ((select id from t), (select id from cl where slug = 'plus_quotientregel'),
   'Bepaal f''(x) als f(x) = (2x+1)^2/(x+1)',
   'f(x) = \dfrac{(2x+1)^{2}}{x+1}',
   '(2x+1)(2x+3)/(x+1)^2', '\dfrac{(2x+1)(2x+3)}{(x+1)^{2}}',
   3, array['kettingregel.regel_combineren','quotientregel.formule_volgorde'],
   false, 8),

  ((select id from t), (select id from cl where slug = 'plus_quotientregel'),
   'Bepaal h''(x) als h(x) = (x²+1)/√(x+1)',
   'h(x) = \dfrac{x^{2}+1}{\sqrt{x+1}}',
   '(3x^2+4x-1)/(2(x+1)^(3/2))', '\dfrac{3x^{2}+4x-1}{2(x+1)^{3/2}}',
   3, array['kettingregel.regel_combineren','quotientregel.formule_volgorde','kettingregel.binnenste_differentieren'],
   false, 9);

-- ── Stappen: f(x) = x·√(2x+1) (plus_productregel, order 1) ──────────────
with q as (
  select id from public.questions
  where latex_body = 'f(x) = x\sqrt{2x+1}'
    and topic_id = (select id from public.topics where slug = 'kettingregel')
  limit 1
)
insert into public.question_steps (question_id, step_order, step_description, root_cause_id)
select (select id from q), s.step_order, s.step_description, rc.id
from (values
  (1, 'Herken de productregel: f = x  en  g = √(2x+1)',                      'productregel.fg_identificeren'),
  (2, 'Differentieer f: f'' = 1',                                             'productregel.f_differentieren'),
  (3, 'Schrijf g als macht: g = (2x+1)^{1/2}  →  pas kettingregel toe',      'kettingregel.herschrijven_machtsvorm'),
  (4, 'g'' = ½·2·(2x+1)^{−1/2} = 1/√(2x+1)',                               'kettingregel.vermenigvuldigen'),
  (5, 'Productregel: f''·g + f·g'' = √(2x+1) + x/√(2x+1)',                  'productregel.formule_invullen'),
  (6, 'Samenvoegen: (2x+1+x)/√(2x+1) = (3x+1)/√(2x+1)',                    'kettingregel.vereenvoudigen')
) as s(step_order, step_description, root_cause_slug)
left join public.root_causes rc on rc.slug = s.root_cause_slug
on conflict (question_id, step_order) do update
  set step_description = excluded.step_description,
      root_cause_id    = excluded.root_cause_id;

-- ── Stappen: g(x) = (x+6)/√(8x+9) (plus_quotientregel, order 5) ─────────
with q as (
  select id from public.questions
  where latex_body = 'g(x) = \dfrac{x+6}{\sqrt{8x+9}}'
    and topic_id = (select id from public.topics where slug = 'kettingregel')
  limit 1
)
insert into public.question_steps (question_id, step_order, step_description, root_cause_id)
select (select id from q), s.step_order, s.step_description, rc.id
from (values
  (1, 'Herken de quotiëntregel: t = x+6  en  n = √(8x+9)',                   'quotientregel.tn_identificeren'),
  (2, 'Differentieer t: t'' = 1',                                             'quotientregel.t_differentieren'),
  (3, 'Schrijf n als macht: n = (8x+9)^{1/2}  →  pas kettingregel toe',      'kettingregel.herschrijven_machtsvorm'),
  (4, 'n'' = ½·8·(8x+9)^{−1/2} = 4/√(8x+9)',                               'kettingregel.vermenigvuldigen'),
  (5, 't''n − tn'' = √(8x+9) − (x+6)·4/√(8x+9)',                           'quotientregel.formule_volgorde'),
  (6, 'Teller: 8x+9 − 4(x+6) = 4x−15',                                      'kettingregel.vereenvoudigen'),
  (7, 'g''(x) = (4x−15)/(8x+9)^{3/2}',                                      'quotientregel.noemer_kwadraat')
) as s(step_order, step_description, root_cause_slug)
left join public.root_causes rc on rc.slug = s.root_cause_slug
on conflict (question_id, step_order) do update
  set step_description = excluded.step_description,
      root_cause_id    = excluded.root_cause_id;

-- ---------------------------------------------------------------------
-- Seed questions — e-macht (5 clusters)
-- ---------------------------------------------------------------------
delete from public.questions
  where is_ai_generated = false
    and topic_id = (select id from public.topics where slug = 'emacht');

with
  t as (select id from public.topics where slug = 'emacht'),
  cl as (
    select tc.slug, tc.id
    from public.topic_clusters tc
    join public.topics tt on tt.id = tc.topic_id
    where tt.slug = 'emacht'
  )
insert into public.questions
  (topic_id, cluster_id, body, latex_body, answer, latex_answer,
   difficulty, root_cause_tags, is_ai_generated, order_index)
values

  -- ── standaard diff 1 ─────────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'standaard'),
   'Bepaal f''(x) als f(x) = e^x',
   'f(x) = e^{x}',
   'e^x', 'e^{x}',
   1, array['emacht.e_herkennen'],
   false, 1),

  ((select id from t), (select id from cl where slug = 'standaard'),
   'Bepaal f''(x) als f(x) = 3e^x',
   'f(x) = 3e^{x}',
   '3e^x', '3e^{x}',
   1, array['emacht.e_herkennen'],
   false, 2),

  ((select id from t), (select id from cl where slug = 'standaard'),
   'Bepaal f''(x) als f(x) = e^{2x}',
   'f(x) = e^{2x}',
   '2e^(2x)', '2e^{2x}',
   1, array['emacht.ketting_lineair'],
   false, 3),

  ((select id from t), (select id from cl where slug = 'standaard'),
   'Bepaal f''(x) als f(x) = e^{3x}',
   'f(x) = e^{3x}',
   '3e^(3x)', '3e^{3x}',
   1, array['emacht.ketting_lineair'],
   false, 4),

  -- ── standaard diff 2 ─────────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'standaard'),
   'Bepaal f''(x) als f(x) = e^{3x+1}',
   'f(x) = e^{3x+1}',
   '3e^(3x+1)', '3e^{3x+1}',
   2, array['emacht.ketting_lineair'],
   false, 5),

  ((select id from t), (select id from cl where slug = 'standaard'),
   'Bepaal f''(x) als f(x) = 5e^{2x}',
   'f(x) = 5e^{2x}',
   '10e^(2x)', '10e^{2x}',
   2, array['emacht.ketting_lineair'],
   false, 6),

  ((select id from t), (select id from cl where slug = 'standaard'),
   'Bepaal f''(x) als f(x) = e^{−x}',
   'f(x) = e^{-x}',
   '-e^(-x)', '-e^{-x}',
   2, array['emacht.ketting_lineair'],
   false, 7),

  ((select id from t), (select id from cl where slug = 'standaard'),
   'Bepaal f''(x) als f(x) = 4e^{−2x}',
   'f(x) = 4e^{-2x}',
   '-8e^(-2x)', '-8e^{-2x}',
   2, array['emacht.ketting_lineair'],
   false, 8),

  -- ── standaard diff 3 ─────────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'standaard'),
   'Bepaal f''(x) als f(x) = e^{4x−3}',
   'f(x) = e^{4x-3}',
   '4e^(4x-3)', '4e^{4x-3}',
   3, array['emacht.ketting_lineair'],
   false, 9),

  -- ── combi_somregel diff 2 ─────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = x² + e^x',
   'f(x) = x^{2} + e^{x}',
   '2x+e^x', '2x+e^{x}',
   2, array['emacht.e_herkennen'],
   false, 1),

  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = 3x + e^{2x}',
   'f(x) = 3x + e^{2x}',
   '3+2e^(2x)', '3+2e^{2x}',
   2, array['emacht.ketting_lineair'],
   false, 2),

  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = x³ + e^{−x}',
   'f(x) = x^{3} + e^{-x}',
   '3x^2-e^(-x)', '3x^{2}-e^{-x}',
   2, array['emacht.ketting_lineair'],
   false, 3),

  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = e^x + e^{2x}',
   'f(x) = e^{x} + e^{2x}',
   'e^x+2e^(2x)', 'e^{x}+2e^{2x}',
   2, array['emacht.ketting_lineair'],
   false, 4),

  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = 2e^{3x} − x²',
   'f(x) = 2e^{3x} - x^{2}',
   '6e^(3x)-2x', '6e^{3x}-2x',
   2, array['emacht.ketting_lineair'],
   false, 5),

  -- ── combi_somregel diff 3 ─────────────────────────────────────
  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = e^{2x} + e^{−2x}',
   'f(x) = e^{2x} + e^{-2x}',
   '2e^(2x)-2e^(-2x)', '2e^{2x}-2e^{-2x}',
   3, array['emacht.ketting_lineair'],
   false, 6),

  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = 3e^{x+1} − x³',
   'f(x) = 3e^{x+1} - x^{3}',
   '3e^(x+1)-3x^2', '3e^{x+1}-3x^{2}',
   3, array['emacht.ketting_lineair'],
   false, 7),

  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = x + e^{x²}',
   'f(x) = x + e^{x^{2}}',
   '1+2xe^(x^2)', '1+2xe^{x^{2}}',
   3, array['emacht.ketting_polynoom'],
   false, 8),

  ((select id from t), (select id from cl where slug = 'combi_somregel'),
   'Bepaal f''(x) als f(x) = x² + e^{x²+1}',
   'f(x) = x^{2} + e^{x^{2}+1}',
   '2x+2xe^(x^2+1)', '2x+2xe^{x^{2}+1}',
   3, array['emacht.ketting_polynoom'],
   false, 9),

  -- ── combi_productregel diff 2 ─────────────────────────────────
  ((select id from t), (select id from cl where slug = 'combi_productregel'),
   'Bepaal f''(x) als f(x) = x·e^x',
   'f(x) = xe^{x}',
   '(x+1)e^x', '(x+1)e^{x}',
   2, array['emacht.product_toepassen','emacht.uitfactoren'],
   false, 1),

  ((select id from t), (select id from cl where slug = 'combi_productregel'),
   'Bepaal f''(x) als f(x) = x²·e^x',
   'f(x) = x^{2}e^{x}',
   '(x^2+2x)e^x', '(x^{2}+2x)e^{x}',
   2, array['emacht.product_toepassen','emacht.uitfactoren'],
   false, 2),

  ((select id from t), (select id from cl where slug = 'combi_productregel'),
   'Bepaal f''(x) als f(x) = (x+1)·e^x',
   'f(x) = (x+1)e^{x}',
   '(x+2)e^x', '(x+2)e^{x}',
   2, array['emacht.product_toepassen','emacht.uitfactoren'],
   false, 3),

  ((select id from t), (select id from cl where slug = 'combi_productregel'),
   'Bepaal f''(x) als f(x) = x·e^{2x}',
   'f(x) = xe^{2x}',
   '(1+2x)e^(2x)', '(1+2x)e^{2x}',
   2, array['emacht.product_toepassen','emacht.ketting_lineair'],
   false, 4),

  ((select id from t), (select id from cl where slug = 'combi_productregel'),
   'Bepaal f''(x) als f(x) = (x−1)·e^x',
   'f(x) = (x-1)e^{x}',
   'xe^x', 'xe^{x}',
   2, array['emacht.product_toepassen','emacht.uitfactoren'],
   false, 5),

  -- ── combi_productregel diff 3 ─────────────────────────────────
  ((select id from t), (select id from cl where slug = 'combi_productregel'),
   'Bepaal f''(x) als f(x) = x²·e^{2x}',
   'f(x) = x^{2}e^{2x}',
   '2x(x+1)e^(2x)', '2x(x+1)e^{2x}',
   3, array['emacht.product_toepassen','emacht.ketting_lineair','emacht.uitfactoren'],
   false, 6),

  ((select id from t), (select id from cl where slug = 'combi_productregel'),
   'Bepaal f''(x) als f(x) = x·e^{−x}',
   'f(x) = xe^{-x}',
   '(1-x)e^(-x)', '(1-x)e^{-x}',
   3, array['emacht.product_toepassen','emacht.ketting_lineair'],
   false, 7),

  ((select id from t), (select id from cl where slug = 'combi_productregel'),
   'Bepaal f''(x) als f(x) = (x²+2x)·e^x',
   'f(x) = (x^{2}+2x)e^{x}',
   '(x^2+4x+2)e^x', '(x^{2}+4x+2)e^{x}',
   3, array['emacht.product_toepassen','emacht.uitfactoren'],
   false, 8),

  ((select id from t), (select id from cl where slug = 'combi_productregel'),
   'Bepaal f''(x) als f(x) = (x²−1)·e^x',
   'f(x) = (x^{2}-1)e^{x}',
   '(x^2+2x-1)e^x', '(x^{2}+2x-1)e^{x}',
   3, array['emacht.product_toepassen','emacht.uitfactoren'],
   false, 9),

  -- ── combi_kettingregel diff 2 ─────────────────────────────────
  ((select id from t), (select id from cl where slug = 'combi_kettingregel'),
   'Bepaal f''(x) als f(x) = e^{x²}',
   'f(x) = e^{x^{2}}',
   '2xe^(x^2)', '2xe^{x^{2}}',
   2, array['emacht.ketting_polynoom'],
   false, 1),

  ((select id from t), (select id from cl where slug = 'combi_kettingregel'),
   'Bepaal f''(x) als f(x) = e^{x²+1}',
   'f(x) = e^{x^{2}+1}',
   '2xe^(x^2+1)', '2xe^{x^{2}+1}',
   2, array['emacht.ketting_polynoom'],
   false, 2),

  ((select id from t), (select id from cl where slug = 'combi_kettingregel'),
   'Bepaal f''(x) als f(x) = 4e^{x²}',
   'f(x) = 4e^{x^{2}}',
   '8xe^(x^2)', '8xe^{x^{2}}',
   2, array['emacht.ketting_polynoom'],
   false, 3),

  ((select id from t), (select id from cl where slug = 'combi_kettingregel'),
   'Bepaal f''(x) als f(x) = e^{x²−x}',
   'f(x) = e^{x^{2}-x}',
   '(2x-1)e^(x^2-x)', '(2x-1)e^{x^{2}-x}',
   2, array['emacht.ketting_polynoom'],
   false, 4),

  ((select id from t), (select id from cl where slug = 'combi_kettingregel'),
   'Bepaal f''(x) als f(x) = 2e^{x²+3}',
   'f(x) = 2e^{x^{2}+3}',
   '4xe^(x^2+3)', '4xe^{x^{2}+3}',
   2, array['emacht.ketting_polynoom'],
   false, 5),

  -- ── combi_kettingregel diff 3 ─────────────────────────────────
  ((select id from t), (select id from cl where slug = 'combi_kettingregel'),
   'Bepaal f''(x) als f(x) = e^{−x²}',
   'f(x) = e^{-x^{2}}',
   '-2xe^(-x^2)', '-2xe^{-x^{2}}',
   3, array['emacht.ketting_polynoom'],
   false, 6),

  ((select id from t), (select id from cl where slug = 'combi_kettingregel'),
   'Bepaal f''(x) als f(x) = e^{x³}',
   'f(x) = e^{x^{3}}',
   '3x^2e^(x^3)', '3x^{2}e^{x^{3}}',
   3, array['emacht.ketting_polynoom'],
   false, 7),

  ((select id from t), (select id from cl where slug = 'combi_kettingregel'),
   'Bepaal f''(x) als f(x) = 3e^{x²+2x}',
   'f(x) = 3e^{x^{2}+2x}',
   '6(x+1)e^(x^2+2x)', '6(x+1)e^{x^{2}+2x}',
   3, array['emacht.ketting_polynoom','emacht.uitfactoren'],
   false, 8),

  ((select id from t), (select id from cl where slug = 'combi_kettingregel'),
   'Bepaal f''(x) als f(x) = e^{x²+3x+1}',
   'f(x) = e^{x^{2}+3x+1}',
   '(2x+3)e^(x^2+3x+1)', '(2x+3)e^{x^{2}+3x+1}',
   3, array['emacht.ketting_polynoom'],
   false, 9),

  -- ── combi_quotientregel diff 2 ────────────────────────────────
  ((select id from t), (select id from cl where slug = 'combi_quotientregel'),
   'Bepaal f''(x) als f(x) = e^x/x',
   'f(x) = \dfrac{e^{x}}{x}',
   '(x-1)e^x/x^2', '\dfrac{(x-1)e^{x}}{x^{2}}',
   2, array['emacht.quotient_toepassen','emacht.uitfactoren'],
   false, 1),

  ((select id from t), (select id from cl where slug = 'combi_quotientregel'),
   'Bepaal f''(x) als f(x) = e^{2x}/x',
   'f(x) = \dfrac{e^{2x}}{x}',
   '(2x-1)e^(2x)/x^2', '\dfrac{(2x-1)e^{2x}}{x^{2}}',
   2, array['emacht.quotient_toepassen','emacht.ketting_lineair'],
   false, 2),

  ((select id from t), (select id from cl where slug = 'combi_quotientregel'),
   'Bepaal f''(x) als f(x) = e^x/(x+1)',
   'f(x) = \dfrac{e^{x}}{x+1}',
   'xe^x/(x+1)^2', '\dfrac{xe^{x}}{(x+1)^{2}}',
   2, array['emacht.quotient_toepassen','emacht.uitfactoren'],
   false, 3),

  ((select id from t), (select id from cl where slug = 'combi_quotientregel'),
   'Bepaal f''(x) als f(x) = x²/e^x',
   'f(x) = \dfrac{x^{2}}{e^{x}}',
   '(2x-x^2)/e^x', '\dfrac{(2x-x^{2})}{e^{x}}',
   2, array['emacht.quotient_toepassen'],
   false, 4),

  ((select id from t), (select id from cl where slug = 'combi_quotientregel'),
   'Bepaal f''(x) als f(x) = e^x/(x²+1)',
   'f(x) = \dfrac{e^{x}}{x^{2}+1}',
   'e^x(x^2-2x+1)/(x^2+1)^2', '\dfrac{e^{x}(x^{2}-2x+1)}{(x^{2}+1)^{2}}',
   2, array['emacht.quotient_toepassen','emacht.uitfactoren'],
   false, 5),

  -- ── combi_quotientregel diff 3 ────────────────────────────────
  ((select id from t), (select id from cl where slug = 'combi_quotientregel'),
   'Bepaal f''(x) als f(x) = e^{2x}/(x+1)',
   'f(x) = \dfrac{e^{2x}}{x+1}',
   '(2x+1)e^(2x)/(x+1)^2', '\dfrac{(2x+1)e^{2x}}{(x+1)^{2}}',
   3, array['emacht.quotient_toepassen','emacht.ketting_lineair'],
   false, 6),

  ((select id from t), (select id from cl where slug = 'combi_quotientregel'),
   'Bepaal f''(x) als f(x) = e^{3x}/(x²+1)',
   'f(x) = \dfrac{e^{3x}}{x^{2}+1}',
   '(3x^2-2x+3)e^(3x)/(x^2+1)^2', '\dfrac{(3x^{2}-2x+3)e^{3x}}{(x^{2}+1)^{2}}',
   3, array['emacht.quotient_toepassen','emacht.ketting_lineair'],
   false, 7),

  ((select id from t), (select id from cl where slug = 'combi_quotientregel'),
   'Bepaal f''(x) als f(x) = (e^x−1)/(e^x+1)',
   'f(x) = \dfrac{e^{x}-1}{e^{x}+1}',
   '2e^x/(e^x+1)^2', '\dfrac{2e^{x}}{(e^{x}+1)^{2}}',
   3, array['emacht.quotient_toepassen','emacht.e_herkennen'],
   false, 8),

  ((select id from t), (select id from cl where slug = 'combi_quotientregel'),
   'Bepaal f''(x) als f(x) = x²/e^{2x}',
   'f(x) = \dfrac{x^{2}}{e^{2x}}',
   '2x(1-x)/e^(2x)', '\dfrac{2x(1-x)}{e^{2x}}',
   3, array['emacht.quotient_toepassen','emacht.ketting_lineair'],
   false, 9);

-- ── Stappen: f(x) = x·e^x (combi_productregel, order 1) ──────────────────
with q as (
  select id from public.questions
  where latex_body = 'f(x) = xe^{x}'
    and topic_id = (select id from public.topics where slug = 'emacht')
  limit 1
)
insert into public.question_steps (question_id, step_order, step_description, root_cause_id)
select (select id from q), s.step_order, s.step_description, rc.id
from (values
  (1, 'Herken de productregel: f = x  en  g = e^x',                     'productregel.fg_identificeren'),
  (2, 'Differentieer f: f'' = 1',                                        'productregel.f_differentieren'),
  (3, 'Differentieer g: g'' = e^x  (e^x is zijn eigen afgeleide)',       'emacht.e_herkennen'),
  (4, 'Productregel: f''·g + f·g'' = e^x + x·e^x',                     'productregel.formule_invullen'),
  (5, 'Factoriseer e^x: f''(x) = (1+x)e^x',                            'emacht.uitfactoren')
) as s(step_order, step_description, root_cause_slug)
left join public.root_causes rc on rc.slug = s.root_cause_slug
on conflict (question_id, step_order) do update
  set step_description = excluded.step_description,
      root_cause_id    = excluded.root_cause_id;

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
