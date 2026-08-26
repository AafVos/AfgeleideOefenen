-- =============================================================================
-- Migration 0028: Grants op het public-schema voor de API-rollen
-- =============================================================================
-- Nieuwere Supabase-images (lokaal via `supabase start`) geven anon,
-- authenticated en service_role standaard géén SELECT/INSERT/UPDATE/DELETE
-- meer op tabellen in public — alles liep daardoor lokaal tegen
-- "permission denied" aan. Het productieproject (ouder) heeft de ruime
-- grants nog wél; deze migratie maakt beide omgevingen gelijk.
-- Row Level Security blijft gewoon de toegangscontrole doen.
-- =============================================================================

BEGIN;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

GRANT USAGE, SELECT
  ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

GRANT EXECUTE
  ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Ook voor tabellen die toekomstige migraties nog aanmaken:
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;

COMMIT;
