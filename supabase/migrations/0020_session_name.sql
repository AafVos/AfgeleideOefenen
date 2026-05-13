-- =============================================================================
-- Migration 0020: Add name column to user_sessions_new
-- =============================================================================
-- Allows students to give their custom tests a memorable name so they can
-- find and resume them later. The column is nullable — practice sessions
-- don't have names.
-- =============================================================================

BEGIN;

ALTER TABLE public.user_sessions_new
  ADD COLUMN IF NOT EXISTS name text;

ALTER TABLE public.user_sessions_new
  ADD COLUMN IF NOT EXISTS show_answers text NOT NULL DEFAULT 'immediate'
    CHECK (show_answers IN ('immediate', 'end'));

COMMIT;
