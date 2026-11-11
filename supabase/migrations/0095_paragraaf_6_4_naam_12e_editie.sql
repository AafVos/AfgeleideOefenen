-- Paragraafnaam naar de 12e editie van Getal & Ruimte vwo B (AFG-301).
--
-- De officiële inhoudsopgave (Noordhoff, "Inhoudsopgaven Getal & Ruimte TF
-- 12e editie, Vwo B deel 1-4", © Noordhoff BV 2021) noemt paragraaf 6.4
-- "Functies met parameters". Migratie 0053 had hier "Toppen en snijpunten"
-- staan — dat was niet de boektitel. Alleen de titel verandert, niet het
-- nummer, de slug of welke onderwerpen/opgaven eraan hangen.
--
-- Gecontroleerd tegen dezelfde bron: de overige paragrafen van H2, H6 en H15
-- die deze site al gebruikt, zijn behalve 6.4 en (zie hieronder) H15 woord
-- voor woord gelijk aan de 12e editie. H15 wijkt wel degelijk af
-- (nummering én namen staan door elkaar) — dat vraagt om een echte
-- herindeling in plaats van een titelwisseling, en is apart als
-- "Beslissing" bij Aaf neergelegd in plaats van hier gegokt.
--
-- Twee keer draaien laat dezelfde titel staan.

BEGIN;

DO $$
DECLARE
  huidig text;
BEGIN
  SELECT title INTO huidig FROM public.paragraphs WHERE slug = 'h6-4';

  IF huidig IS NULL THEN
    RAISE EXCEPTION 'paragraaf h6-4 bestaat niet';
  END IF;

  IF huidig = 'Toppen en snijpunten' THEN
    UPDATE public.paragraphs SET title = 'Functies met parameters' WHERE slug = 'h6-4';
  ELSIF huidig IS DISTINCT FROM 'Functies met parameters' THEN
    RAISE EXCEPTION 'onverwachte titel bij paragraaf h6-4: %', huidig;
  END IF;
END $$;

COMMIT;
