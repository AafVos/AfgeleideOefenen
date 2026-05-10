-- Add is_skipped flag to user_progress so users can mark clusters as
-- "I don't need to know this yet". Independent from status so it doesn't
-- interfere with the learning-path engine.

alter table public.user_progress
  add column if not exists is_skipped boolean not null default false;

create index if not exists user_progress_user_skipped_idx
  on public.user_progress (user_id, is_skipped);
