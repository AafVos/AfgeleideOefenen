-- Het leerpad en de onboarding zijn weg. Geen code leest deze kolommen nog.
-- De check en de index horen bij dezelfde kolommen en gaan mee weg.
-- Twee keer draaien haalt niets extra weg.

DROP INDEX IF EXISTS public.profiles_onboarded_at_idx;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_learning_mode_check;

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS learning_mode,
  DROP COLUMN IF EXISTS onboarded_at;
