-- ===================================================================
-- Migration 0002 — question_flags
-- Studenten kunnen een vraag flaggen als "klopt niet". Admins kunnen de
-- flags reviewen en resolven.
-- ===================================================================

create table if not exists public.question_flags (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  reason      text,
  status      text not null default 'open'
              check (status in ('open', 'resolved', 'dismissed')),
  created_at  timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null,
  unique (question_id, user_id, status)
);

create index if not exists question_flags_question_id_idx
  on public.question_flags (question_id);

create index if not exists question_flags_status_idx
  on public.question_flags (status);

alter table public.question_flags enable row level security;

-- Students kunnen hun eigen flags zien en aanmaken; admins zien alles.
drop policy if exists "question_flags_insert_own" on public.question_flags;
drop policy if exists "question_flags_select"     on public.question_flags;
drop policy if exists "question_flags_admin_all"  on public.question_flags;

create policy "question_flags_select" on public.question_flags
  for select using (auth.uid() = user_id or public.is_admin());

create policy "question_flags_insert_own" on public.question_flags
  for insert with check (auth.uid() = user_id);

create policy "question_flags_admin_all" on public.question_flags
  for all using (public.is_admin()) with check (public.is_admin());
