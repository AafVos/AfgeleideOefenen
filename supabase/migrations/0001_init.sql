-- =====================================================================
-- lerendifferentiëren.nl — initial schema (section 3 of the spec)
-- =====================================================================
-- Run this in Supabase SQL editor, or via `supabase db push` if you are
-- using the Supabase CLI.
-- =====================================================================

-- Ensure pgcrypto is available for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 3.1 topics
-- ---------------------------------------------------------------------
create table if not exists public.topics (
  id                      uuid primary key default gen_random_uuid(),
  slug                    text unique not null,
  title                   text not null,
  order_index             int not null,
  is_unlocked_by_default  boolean not null default false,
  created_at              timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3.2 topic_clusters
-- ---------------------------------------------------------------------
create table if not exists public.topic_clusters (
  id          uuid primary key default gen_random_uuid(),
  topic_id    uuid not null references public.topics(id) on delete cascade,
  slug        text not null,
  title       text not null,
  order_index int not null,
  unique (topic_id, slug)
);

create index if not exists topic_clusters_topic_id_idx
  on public.topic_clusters (topic_id);

-- ---------------------------------------------------------------------
-- 3.3 root_causes
-- ---------------------------------------------------------------------
create table if not exists public.root_causes (
  id          uuid primary key default gen_random_uuid(),
  topic_id    uuid not null references public.topics(id) on delete cascade,
  slug        text unique not null,
  description text not null
);

create index if not exists root_causes_topic_id_idx
  on public.root_causes (topic_id);

-- ---------------------------------------------------------------------
-- 3.4 questions
-- ---------------------------------------------------------------------
create table if not exists public.questions (
  id               uuid primary key default gen_random_uuid(),
  topic_id         uuid not null references public.topics(id) on delete cascade,
  cluster_id       uuid not null references public.topic_clusters(id) on delete cascade,
  body             text not null,
  latex_body       text,
  answer           text not null,
  latex_answer     text,
  difficulty       int not null check (difficulty in (1, 2, 3)),
  root_cause_tags  text[] not null default '{}',
  is_ai_generated  boolean not null default false,
  order_index      int,
  created_at       timestamptz not null default now()
);

create index if not exists questions_cluster_id_idx
  on public.questions (cluster_id);

create index if not exists questions_topic_id_idx
  on public.questions (topic_id);

-- ---------------------------------------------------------------------
-- 3.5 question_steps
-- ---------------------------------------------------------------------
create table if not exists public.question_steps (
  id               uuid primary key default gen_random_uuid(),
  question_id      uuid not null references public.questions(id) on delete cascade,
  step_order       int not null,
  step_description text not null,
  root_cause_id    uuid references public.root_causes(id) on delete set null,
  unique (question_id, step_order)
);

create index if not exists question_steps_question_id_idx
  on public.question_steps (question_id);

-- ---------------------------------------------------------------------
-- 3.6 profiles  (extension of Supabase Auth)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text unique,
  role       text not null default 'student'
             check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 3.7 user_progress
-- ---------------------------------------------------------------------
create table if not exists public.user_progress (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  topic_id        uuid not null references public.topics(id) on delete cascade,
  cluster_id      uuid not null references public.topic_clusters(id) on delete cascade,
  status          text not null
                  check (status in ('locked', 'in_progress', 'mastered')),
  correct_streak  int not null default 0,
  total_answered  int not null default 0,
  total_correct   int not null default 0,
  mastered_at     timestamptz,
  unique (user_id, cluster_id)
);

create index if not exists user_progress_user_id_idx
  on public.user_progress (user_id);

-- ---------------------------------------------------------------------
-- 3.8 user_sessions
-- ---------------------------------------------------------------------
create table if not exists public.user_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  topic_id   uuid not null references public.topics(id) on delete cascade,
  cluster_id uuid not null references public.topic_clusters(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at   timestamptz
);

create index if not exists user_sessions_user_id_idx
  on public.user_sessions (user_id);

-- ---------------------------------------------------------------------
-- 3.9 session_answers
-- ---------------------------------------------------------------------
create table if not exists public.session_answers (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null references public.user_sessions(id) on delete cascade,
  question_id     uuid not null references public.questions(id) on delete cascade,
  user_answer     text,
  is_correct      boolean,
  hints_used      int not null default 0,
  is_careless     boolean not null default false,
  time_spent_sec  int,
  answered_at     timestamptz not null default now()
);

create index if not exists session_answers_session_id_idx
  on public.session_answers (session_id);

create index if not exists session_answers_question_id_idx
  on public.session_answers (question_id);

-- ---------------------------------------------------------------------
-- 3.10 step_mistakes
-- ---------------------------------------------------------------------
create table if not exists public.step_mistakes (
  id          uuid primary key default gen_random_uuid(),
  answer_id   uuid not null references public.session_answers(id) on delete cascade,
  step_id     uuid not null references public.question_steps(id) on delete cascade,
  is_careless boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists step_mistakes_answer_id_idx
  on public.step_mistakes (answer_id);

-- ---------------------------------------------------------------------
-- 3.11 known_wrong_answers
-- ---------------------------------------------------------------------
create table if not exists public.known_wrong_answers (
  id                uuid primary key default gen_random_uuid(),
  question_id       uuid not null references public.questions(id) on delete cascade,
  wrong_answer      text not null,
  error_explanation text not null,
  root_cause_slug   text not null,
  seen_count        int not null default 1,
  created_at        timestamptz not null default now(),
  unique (question_id, wrong_answer)
);

create index if not exists known_wrong_answers_question_id_idx
  on public.known_wrong_answers (question_id);

-- =====================================================================
-- Row Level Security
-- =====================================================================
-- Content tables (topics, clusters, root_causes, questions, steps,
-- known_wrong_answers) are world-readable by any authenticated user.
-- Writes to those tables are restricted to users with role = 'admin'.
--
-- Per-user tables (profiles, progress, sessions, answers, step mistakes)
-- are restricted to their owner.
-- =====================================================================

alter table public.topics              enable row level security;
alter table public.topic_clusters      enable row level security;
alter table public.root_causes         enable row level security;
alter table public.questions           enable row level security;
alter table public.question_steps      enable row level security;
alter table public.profiles            enable row level security;
alter table public.user_progress       enable row level security;
alter table public.user_sessions       enable row level security;
alter table public.session_answers     enable row level security;
alter table public.step_mistakes       enable row level security;
alter table public.known_wrong_answers enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---- content tables: read for everyone, write for admins -----------
do $$
declare
  t text;
begin
  foreach t in array array[
    'topics', 'topic_clusters', 'root_causes',
    'questions', 'question_steps', 'known_wrong_answers'
  ]
  loop
    execute format('drop policy if exists "read_%1$s"  on public.%1$I', t);
    execute format('drop policy if exists "write_%1$s" on public.%1$I', t);

    execute format(
      'create policy "read_%1$s" on public.%1$I
         for select using (true)', t);

    execute format(
      'create policy "write_%1$s" on public.%1$I
         for all
         using (public.is_admin())
         with check (public.is_admin())', t);
  end loop;
end $$;

-- ---- profiles ------------------------------------------------------
drop policy if exists "profiles_self_select" on public.profiles;
drop policy if exists "profiles_self_update" on public.profiles;
drop policy if exists "profiles_admin_all"   on public.profiles;

create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and role = 'student');

create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- per-user data tables -----------------------------------------
drop policy if exists "user_progress_owner" on public.user_progress;
create policy "user_progress_owner" on public.user_progress
  for all using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id);

drop policy if exists "user_sessions_owner" on public.user_sessions;
create policy "user_sessions_owner" on public.user_sessions
  for all using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id);

drop policy if exists "session_answers_owner" on public.session_answers;
create policy "session_answers_owner" on public.session_answers
  for all using (
    exists (
      select 1 from public.user_sessions us
      where us.id = session_answers.session_id
        and (us.user_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.user_sessions us
      where us.id = session_answers.session_id
        and us.user_id = auth.uid()
    )
  );

drop policy if exists "step_mistakes_owner" on public.step_mistakes;
create policy "step_mistakes_owner" on public.step_mistakes
  for all using (
    exists (
      select 1
      from public.session_answers sa
      join public.user_sessions us on us.id = sa.session_id
      where sa.id = step_mistakes.answer_id
        and (us.user_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1
      from public.session_answers sa
      join public.user_sessions us on us.id = sa.session_id
      where sa.id = step_mistakes.answer_id
        and us.user_id = auth.uid()
    )
  );
