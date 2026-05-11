-- =====================================================================
-- Migration 0011: Remove legacy question body column
-- =====================================================================
-- Deze migratie verwijdert de oude `body` kolom uit de `questions` tabel.
-- De website gebruikt nu alleen nog `latex_body` en `answer`.

ALTER TABLE public.questions
  DROP COLUMN IF EXISTS body;
