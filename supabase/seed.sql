-- =====================================================================
-- afgeleideoefenen.nl — seed data
-- =====================================================================
-- Alleen de vaste testleerlingen en het testhoofdstuk. De oude
-- oefenstof (topics, questions, …) stond in de tabellen van vóór de
-- overstap; die tabellen zijn weg sinds migratie 0033. De echte
-- oefenstof komt uit de migraties, in de tabellen met _new.
--
-- Dit bestand draait alleen op een lokale Supabase en op de
-- wegwerp-database in GitHub Actions. Het komt nooit in de
-- productiedatabase terecht.
-- =====================================================================

-- =====================================================================
-- E2E-testgegevens — ALLEEN LOKAAL
-- =====================================================================
-- Dit deel draait alleen op een lokale Supabase (`npx supabase db reset`)
-- en op de wegwerp-database in GitHub Actions. Het staat met opzet NIET in
-- een migratie, dus het komt nooit in de productiedatabase met de echte
-- accounts en voortgang terecht.
--
-- Het wachtwoord hieronder is geen geheim: dit account bestaat alleen op
-- je eigen computer en in de testomgeving.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Vaste testleerling: leerling@test.local / oefenen123
-- ---------------------------------------------------------------------
-- De lege tekstvelden zijn geen opsmuk: Supabase Auth struikelt over NULL in
-- confirmation_token en de andere token-kolommen ("Database error querying
-- schema") en weigert dan het inloggen.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
values (
  '00000000-0000-0000-0000-000000000000',
  'e2e00000-0000-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'leerling@test.local',
  crypt('oefenen123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Test Leerling"}'::jsonb,
  now(),
  now(),
  '', '', '', ''
)
on conflict (id) do update
  set email              = excluded.email,
      encrypted_password = excluded.encrypted_password,
      email_confirmed_at = excluded.email_confirmed_at,
      updated_at         = now();

-- Zonder identity-rij weigert Supabase Auth het inloggen met wachtwoord.
insert into auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
)
values (
  'e2e00000-0000-4000-8000-000000000002',
  'e2e00000-0000-4000-8000-000000000001',
  'e2e00000-0000-4000-8000-000000000001',
  '{"sub":"e2e00000-0000-4000-8000-000000000001","email":"leerling@test.local","email_verified":true,"phone_verified":false}'::jsonb,
  'email',
  now(),
  now(),
  now()
)
on conflict (provider_id, provider) do nothing;

-- De rondleiding is al gezien, zodat die geen knoppen afdekt in de tests.
update public.profiles
   set display_name = 'Test Leerling',
       tour_seen_at = now()
 where id = 'e2e00000-0000-4000-8000-000000000001';

-- ---------------------------------------------------------------------
-- Tweede testleerling: nieuw@test.local / oefenen123
-- ---------------------------------------------------------------------
-- Een kersverse leerling die de rondleiding nog nooit heeft gezien. Apart
-- account, zodat de rondleiding niet in de weg zit bij de tests hierboven.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
values (
  '00000000-0000-0000-0000-000000000000',
  'e2e00000-0000-4000-8000-000000000003',
  'authenticated',
  'authenticated',
  'nieuw@test.local',
  crypt('oefenen123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Nieuwe Leerling"}'::jsonb,
  now(),
  now(),
  '', '', '', ''
)
on conflict (id) do update
  set email              = excluded.email,
      encrypted_password = excluded.encrypted_password,
      email_confirmed_at = excluded.email_confirmed_at,
      updated_at         = now();

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
)
values (
  'e2e00000-0000-4000-8000-000000000004',
  'e2e00000-0000-4000-8000-000000000003',
  'e2e00000-0000-4000-8000-000000000003',
  '{"sub":"e2e00000-0000-4000-8000-000000000003","email":"nieuw@test.local","email_verified":true,"phone_verified":false}'::jsonb,
  'email',
  now(),
  now(),
  now()
)
on conflict (provider_id, provider) do nothing;

-- Nog nooit rondgeleid: hier hoort Aaf dus zelf in beeld te komen.
update public.profiles
   set display_name = 'Nieuwe Leerling',
       tour_seen_at = null
 where id = 'e2e00000-0000-4000-8000-000000000003';

-- ---------------------------------------------------------------------
-- Vaste oefenstof voor de tests: één hoofdstuk, twee onderwerpen
-- ---------------------------------------------------------------------
insert into public.chapters (slug, title, book_part, order_index)
values ('e2e', 'Testhoofdstuk voor de e2e-tests', 1, 99)
on conflict (slug) do update
  set title       = excluded.title,
      order_index = excluded.order_index;

insert into public.topics_new
  (slug, title, chapter_id, order_index, is_unlocked_by_default)
values
  ('e2e_nakijken',  'Nakijken (e2e)',
   (select id from public.chapters where slug = 'e2e'), 1, true),
  ('e2e_beheersen', 'Beheersen (e2e)',
   (select id from public.chapters where slug = 'e2e'), 2, true),
  -- Achteraan, zodat de opgavenummers van de bestaande tests niet opschuiven.
  ('e2e_uitwerking', 'Uitwerking (e2e)',
   (select id from public.chapters where slug = 'e2e'), 3, true),
  -- Achteraan, zodat de nummers van de bestaande tests hetzelfde blijven.
  ('e2e_soort', 'Soort som (e2e)',
   (select id from public.chapters where slug = 'e2e'), 4, true)
on conflict (slug) do update
  set title       = excluded.title,
      chapter_id  = excluded.chapter_id,
      order_index = excluded.order_index;

insert into public.topic_clusters_new (topic_id, slug, title, order_index)
values
  ((select id from public.topics_new where slug = 'e2e_nakijken'),
   'e2e_goed',    'Goed antwoord (e2e)',    1),
  ((select id from public.topics_new where slug = 'e2e_nakijken'),
   'e2e_fout',    'Fout antwoord (e2e)',    2),
  ((select id from public.topics_new where slug = 'e2e_nakijken'),
   'e2e_notatie', 'Andere notatie (e2e)',   3),
  ((select id from public.topics_new where slug = 'e2e_beheersen'),
   'e2e_rij',     'Drie goed op rij (e2e)', 1),
  ((select id from public.topics_new where slug = 'e2e_uitwerking'),
   'e2e_niet_weten', 'Ik weet het niet (e2e)', 1),
  ((select id from public.topics_new where slug = 'e2e_soort'),
   'e2e_verhaal', 'Verhaaltje (e2e)', 1)
on conflict (topic_id, slug) do update
  set title       = excluded.title,
      order_index = excluded.order_index;

-- Vragen opnieuw neerzetten (questions_new heeft geen natuurlijke sleutel).
delete from public.questions_new
 where topic_id in (
   select id from public.topics_new
    where slug in ('e2e_nakijken', 'e2e_beheersen', 'e2e_uitwerking', 'e2e_soort')
 );

insert into public.questions_new
  (topic_id, cluster_id, latex_body, answer, latex_answer,
   difficulty, order_index)
select tc.topic_id, tc.id, q.latex_body, q.answer, q.latex_answer,
       1, q.order_index
from (values
  -- Eén goed antwoord: f(x) = 4x^3  →  f'(x) = 12x^2
  ('e2e_goed',    'f(x) = 4x^{3}',          '12x^2', '12x^{2}', 1),
  -- Eén fout antwoord: g(x) = 5x^2 + 3x  →  g'(x) = 10x + 3
  ('e2e_fout',    'g(x) = 5x^{2} + 3x',     '10x+3', '10x + 3', 1),
  -- Andere notatie: h(x) = 1/x  →  h'(x) = -x^-2, oftewel -1/x^2
  ('e2e_notatie', 'h(x) = \dfrac{1}{x}',    '-x^-2', '-x^{-2}', 1),
  -- Drie op rij: x^2 → 2x, x^3 → 3x^2, x^4 → 4x^3
  ('e2e_rij',     'f(x) = x^{2}',           '2x',    '2x',      1),
  ('e2e_rij',     'f(x) = x^{3}',           '3x^2',  '3x^{2}',  2),
  ('e2e_rij',     'f(x) = x^{4}',           '4x^3',  '4x^{3}',  3),
  -- "Ik weet het niet": f(x) = x^5  →  f'(x) = 5x^4. De tweede opgave staat
  -- er zodat "Volgende" echt naar een andere opgave gaat.
  ('e2e_niet_weten', 'f(x) = x^{5}',        '5x^4',  '5x^{4}',  1),
  ('e2e_niet_weten', 'f(x) = x^{6}',        '6x^5',  '6x^{5}',  2),
  -- Verhaaltje: h(t) = -5t^2 + 20t, hoogste punt als h'(t) = -10t + 20 = 0, dus t = 2.
  ('e2e_verhaal', 'Een bal wordt omhoog gegooid. De hoogte in meter na $t$ seconden is $h(t) = -5t^{2} + 20t$. Na hoeveel seconden is de bal op zijn hoogste punt?', '2', '2', 1)
) as q(cluster_slug, latex_body, answer, latex_answer, order_index)
join public.topic_clusters_new tc on tc.slug = q.cluster_slug;

-- Bij de eerste van die twee opgaven hoort een vast stappenplan: de knop
-- "Ik weet het niet" hoort de uitwerking te laten zien, en die komt normaal
-- pas van de AI-controle ná een fout antwoord. Zie `e2e/schone-start.ts`:
-- dit stappenplan blijft tussen twee testruns door staan.
insert into public.question_steps_new (question_id, step_order, step_description)
select q.id, s.step_order, s.step_description
from public.questions_new q
join public.topic_clusters_new tc
  on tc.id = q.cluster_id and tc.slug = 'e2e_niet_weten'
cross join (values
  (1, 'Schrijf de functie op: $f(x) = x^{5}$.'),
  (2, 'Gebruik de machtsregel: de macht komt ervoor en de exponent gaat er één af.'),
  (3, 'Dus $f''(x) = 5x^{4}$.')
) as s(step_order, step_description)
where q.order_index = 1
on conflict (question_id, step_order) do update
  set step_description = excluded.step_description;

-- Stappenplan bij de drie proefsommen, zodat de proefroute zonder account
-- de uitwerking kan laten zien. Alleen in deze lokale seed.
insert into public.question_steps_new (question_id, step_order, step_description)
select q.id, 1, 'Schrijf de macht naar voren. Die macht gaat er daarna één af.'
from public.questions_new q
join public.topic_clusters_new tc
  on tc.id = q.cluster_id and tc.slug = 'e2e_rij'
on conflict (question_id, step_order) do update
  set step_description = excluded.step_description;

-- =====================================================================
-- De welkomstmail-webhook, lokaal
-- =====================================================================
-- De triggers uit migratie 0035 (welkomstmail) en 0036 (nieuwe
-- registratie) sturen alleen iets als allebei deze waarden in de Vault
-- staan. Hier wijzen ze naar de ontwikkelserver op
-- je eigen computer, zodat een bevestiging in een test nooit bij de
-- echte site uitkomt. De migratie zet er het echte domein neer; dit
-- blok draait daarna en zet het terug naar lokaal.
--
-- `host.docker.internal`: de database draait in Docker, de site erbuiten.
-- Poort 3177 is die van `npm run test:e2e`. Draai je met E2E_PORT op een
-- andere poort, dan komt de webhook niet aan.
--
-- Het geheim hieronder is geen geheim: het bestaat alleen op je eigen
-- computer. Dezelfde waarde staat in scripts/e2e.mjs als WEBHOOK_SECRET.
-- =====================================================================
do $$
begin
  if to_regclass('vault.secrets') is null then
    raise warning 'Geen Vault in deze database; de welkomstmail-webhook blijft lokaal uit.';
    return;
  end if;
  delete from vault.secrets where name in (
    'webhook_secret', 'webhook_basis_url', 'meet_schuilnaam_geheim'
  );
  perform vault.create_secret(
    'e2e-nep-geheim', 'webhook_secret',
    'x-webhook-secret voor /api/webhooks/* (alleen lokaal)'
  );
  perform vault.create_secret(
    'http://host.docker.internal:3177', 'webhook_basis_url',
    'Waar /api/webhooks/* staat (alleen lokaal)'
  );
  -- Dezelfde waarde als MEET_SCHUILNAAM_GEHEIM in .env.local.example, zodat
  -- de site en de overzichten lokaal dezelfde schuilnaam uitrekenen.
  perform vault.create_secret(
    'lokaal-nep-schuilnaamgeheim', 'meet_schuilnaam_geheim',
    'Geheim voor de schuilnaam in de klikmeting (alleen lokaal)'
  );
end
$$;
