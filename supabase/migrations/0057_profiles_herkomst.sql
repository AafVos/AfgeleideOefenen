-- Onthoud bij een nieuw account waar de aanmeldlink vandaan kwam.
-- Alleen deze codes: docent, youtube, klas, forum.
-- Eén keer, bij het aanmaken van het account. Een latere wijziging telt niet.
-- Geen cookie en geen volledig adres: alleen deze kolom.
--
-- Twee keer draaien verandert niets en voegt niets dubbel toe.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS herkomst text;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_herkomst_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_herkomst_check
  CHECK (herkomst IS NULL OR herkomst IN ('docent', 'youtube', 'klas', 'forum'));

COMMENT ON COLUMN public.profiles.herkomst IS
  'Alleen docent, youtube, klas of forum. Eén keer gezet bij aanmelden. Leeg als de link geen toegestane code had.';

-- Het account ontstaat meteen bij het aanmelden, ook als de mail nog
-- bevestigd moet worden. De code staat dan al in de metagegevens.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code text;
BEGIN
  code := lower(btrim(coalesce(new.raw_user_meta_data->>'herkomst', '')));
  IF code NOT IN ('docent', 'youtube', 'klas', 'forum') THEN
    code := NULL;
  END IF;

  INSERT INTO public.profiles (id, herkomst)
  VALUES (new.id, code)
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

-- Een leerling mag het eigen profiel bijwerken (gebruikersnaam, rondleiding).
-- Die update mag de herkomst niet vullen en niet overschrijven.
CREATE OR REPLACE FUNCTION public.herkomst_blijft_staan()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.herkomst := OLD.herkomst;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_herkomst_blijft_staan ON public.profiles;

CREATE TRIGGER profiles_herkomst_blijft_staan
  BEFORE UPDATE OF herkomst ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.herkomst_blijft_staan();
