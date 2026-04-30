-- afgeleideoefenen.nl — onboarding velden voor profiles
-- Toegevoegd: klas, weergavenaam, leermodus en tijdstempel van afronding.

alter table public.profiles
  add column if not exists grade text,
  add column if not exists display_name text,
  add column if not exists learning_mode text,
  add column if not exists onboarded_at timestamptz;

-- Toegestane waarden voor klas (NULL = nog niet ingevuld).
alter table public.profiles
  drop constraint if exists profiles_grade_check;
alter table public.profiles
  add constraint profiles_grade_check
  check (
    grade is null
    or grade in ('vwo_4', 'vwo_5', 'vwo_6', 'examen_training', 'anders')
  );

-- Toegestane waarden voor leermodus (NULL = nog niet ingevuld).
--   guided        Net begonnen, volg het volledige leerpad vanaf begin
--   topic_select  Eigen topic-keuze; engine adaptief binnen scope
--   diagnostic    Korte toets, daarna leerpad op gekalibreerd niveau
--   free          Geen leerpad, kies elke sessie zelf een onderwerp
alter table public.profiles
  drop constraint if exists profiles_learning_mode_check;
alter table public.profiles
  add constraint profiles_learning_mode_check
  check (
    learning_mode is null
    or learning_mode in ('guided', 'topic_select', 'diagnostic', 'free')
  );

-- Index voor snelle 'is onboarded?'-checks in de middleware.
create index if not exists profiles_onboarded_at_idx
  on public.profiles (onboarded_at);
