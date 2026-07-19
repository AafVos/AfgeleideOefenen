-- Rondleiding (Aaf) éénmalig per leerling, over apparaten heen.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tour_seen_at timestamptz;
