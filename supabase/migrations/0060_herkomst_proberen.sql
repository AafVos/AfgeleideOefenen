-- Herkomstcode voor iemand die zich aanmeldt na drie proefsommen.
-- Alleen deze codes: docent, youtube, klas, forum, proberen.
-- Bestaande rijen blijven staan. Twee keer draaien verandert niets extra's.

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_herkomst_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_herkomst_check
  CHECK (
    herkomst IS NULL
    OR herkomst IN ('docent', 'youtube', 'klas', 'forum', 'proberen')
  );

COMMENT ON COLUMN public.profiles.herkomst IS
  'Alleen docent, youtube, klas, forum of proberen. Eén keer gezet bij aanmelden. Leeg als de link geen toegestane code had.';

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
  IF code NOT IN ('docent', 'youtube', 'klas', 'forum', 'proberen') THEN
    code := NULL;
  END IF;

  INSERT INTO public.profiles (id, herkomst)
  VALUES (new.id, code)
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;
