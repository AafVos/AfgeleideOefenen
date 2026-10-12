-- Bijhouden welke migraties al gedraaid zijn.
--
-- Tot nu toe stond dat nergens: 0001 t/m 0028 zijn met de hand op de
-- echte database gezet. Deze migratie maakt de tabel die de Supabase-CLI
-- zelf ook gebruikt, en vult die eenmalig met de bestanden waarvan het
-- resultaat al aanwezig is. Hij draait die bestanden niet opnieuw.
--
-- 0029 zelf staat hier niet in. Wie dit bestand met de hand draait, zet
-- dat nummer er daarna zelf bij. De CLI doet dat vanzelf na een geslaagde run.
--
-- Twee keer draaien voegt niets dubbel toe en laat bestaande rijen staan.

CREATE SCHEMA IF NOT EXISTS supabase_migrations;

CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
  version text NOT NULL PRIMARY KEY
);

ALTER TABLE supabase_migrations.schema_migrations
  ADD COLUMN IF NOT EXISTS statements text[];

ALTER TABLE supabase_migrations.schema_migrations
  ADD COLUMN IF NOT EXISTS name text;

INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES
  ('0001', 'init'),
  ('0002', 'question_flags'),
  ('0003', 'onboarding'),
  ('0004', 'basis_topic'),
  ('0005', 'wortel_negatief'),
  ('0006', 'herleiden'),
  ('0007', 'restructure_basics'),
  ('0008', 'quotientregel'),
  ('0009', 'answer_alternatives'),
  ('0010', 'user_progress_skipped'),
  ('0011', 'drop_question_body'),
  ('0012', 'fix_twee_veeltermen_null_rows'),
  ('0013', 'add_chapters_h2'),
  ('0014', 'chapters_full_content'),
  ('0015', 'h6_question_steps'),
  ('0016', 'h7_question_steps'),
  ('0017', 'h9_question_steps'),
  ('0018', 'user_tables_new'),
  ('0019', 'custom_tests'),
  ('0020', 'session_name'),
  ('0021', 'site_scope'),
  ('0022', 'h11_integralen_content'),
  ('0023', 'topic_category'),
  ('0024', 'h11_integralen_verg_toep'),
  ('0025', 'profiles_tour_seen'),
  ('0026', 'answer_prefix'),
  ('0027', 'h2_verhaaltjes'),
  ('0028', 'h6_verhaaltjes')
ON CONFLICT (version) DO NOTHING;
