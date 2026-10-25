-- =============================================================================
-- Opt-in e-mailherinnering als een leerling een tijdje niet geoefend heeft.
-- Zie AFG-487 (en de analyse in AFG-483).
--
-- Vijf kolommen bij `profiles`:
--
--   herinnering_mail       staat de herinnering aan? Standaard uit. Alleen de
--                          leerling zelf zet hem aan.
--   herinnering_aan_sinds  wanneer hij hem aanzette. Heeft de leerling nog
--                          nooit geoefend, dan telt de stilte vanaf dit moment
--                          en niet vanaf het aanmaken van het account.
--   herinnering_laatst_op  wanneer de laatste herinnering de deur uit ging.
--   herinnering_aantal     hoeveel herinneringen deze leerling ooit kreeg.
--                          Na drie houdt het op: wie echt gestopt is, hoeft
--                          geen mail te blijven krijgen.
--   herinnering_sleutel    het willekeurige nummer in de afmeldlink van de
--                          mail. Daarmee kan iemand zich afmelden zonder eerst
--                          in te loggen, zonder dat zijn gebruikersnummer in
--                          de link staat.
--
-- De laatste drie zijn van de server. Een leerling mag ze niet zelf zetten —
-- anders zou hij zichzelf eindeloos mail kunnen laten sturen. De trigger
-- onderaan zet ze terug bij elke update die niet van de service-rol komt,
-- net zoals `herkomst_blijft_staan` dat doet voor de herkomst (migratie 0057).
--
-- Twee keer draaien verandert niets en voegt niets dubbel toe.
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS herinnering_mail      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS herinnering_aan_sinds timestamptz,
  ADD COLUMN IF NOT EXISTS herinnering_laatst_op timestamptz,
  ADD COLUMN IF NOT EXISTS herinnering_aantal    integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS herinnering_sleutel   uuid    NOT NULL DEFAULT gen_random_uuid();

COMMENT ON COLUMN public.profiles.herinnering_mail IS
  'Opt-in: staat standaard uit. De leerling zet hem zelf aan, vanaf 16 jaar.';
COMMENT ON COLUMN public.profiles.herinnering_sleutel IS
  'Willekeurig nummer voor de afmeldlink in de mail. Nooit het gebruikersnummer gebruiken.';

-- De afmeldlink zoekt hierop; hij moet uniek zijn.
CREATE UNIQUE INDEX IF NOT EXISTS profiles_herinnering_sleutel_idx
  ON public.profiles (herinnering_sleutel);

-- De dagelijkse taak kijkt alleen naar wie hem aan heeft staan.
CREATE INDEX IF NOT EXISTS profiles_herinnering_mail_idx
  ON public.profiles (herinnering_mail)
  WHERE herinnering_mail;

-- ── De tellers blijven van de server ────────────────────────────────────────
-- PostgREST draait als `authenticated` voor een ingelogde leerling en als
-- `service_role` voor de site zelf. Een migratie draait als `postgres`.
CREATE OR REPLACE FUNCTION public.herinnering_blijft_van_de_server()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_user NOT IN ('service_role', 'postgres', 'supabase_admin') THEN
    NEW.herinnering_laatst_op := OLD.herinnering_laatst_op;
    NEW.herinnering_aantal    := OLD.herinnering_aantal;
    NEW.herinnering_sleutel   := OLD.herinnering_sleutel;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_herinnering_van_de_server ON public.profiles;

CREATE TRIGGER profiles_herinnering_van_de_server
  BEFORE UPDATE OF herinnering_laatst_op, herinnering_aantal, herinnering_sleutel
  ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.herinnering_blijft_van_de_server();
