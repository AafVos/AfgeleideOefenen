-- De trechter telde de proefsom op de startpagina niet mee.
--
-- `meet_trechter` (migratie 0072) telde stap 2 als "een pagina met /proberen
-- in het pad". De proefsom staat ook ín de startpagina zelf: daar klikt
-- iemand op Nakijken zonder ooit naar /proberen te gaan. Zulke bezoeken
-- vielen uit de trechter, en in de ochtendanalyse leek het alsof niemand de
-- proefsom deed.
--
-- Wat hier verandert:
--
-- * Stap 2 telt nu ook een klik op Nakijken bij de proefsom op de
--   startpagina. Die knop heet sinds deze wijziging `home-proefsom-nakijken`.
--   Klikken van vóór die naam staan in de tabel als `button:Nakijken` op de
--   startpagina; die tellen hier ook mee, zodat de cijfers van de afgelopen
--   dagen kloppen.
-- * Stap 1 telde `/nl` wel en `/nl?van=whatsapp` niet. Een gedeelde link
--   houdt `van` en `utm_source` in het pad (zie src/lib/meten/gebeurtenis.ts),
--   dus die bezoeken misten stap 1 terwijl ze wel op de startpagina waren.
--
-- Stap 4 blijft wat het was: een som nakijken op /proberen of in het oefenen
-- zelf. De proefsom op de startpagina is stap 2, niet stap 4.
--
-- Alleen een overzicht; er verandert niets aan de opgeslagen gegevens.
-- Twee keer draaien verandert niets en voegt niets dubbel toe.

CREATE OR REPLACE VIEW public.meet_trechter AS
WITH per_sessie AS (
  SELECT
    sessie_id,
    min((tijdstip AT TIME ZONE 'Europe/Amsterdam')::date) AS dag,
    bool_or(soort = 'pagina' AND pad ~ '^/[a-z]{2}($|\?)') AS startpagina,
    bool_or(
      (soort = 'pagina' AND pad LIKE '%/proberen%')
      OR (soort = 'klik' AND doel = 'home-proefsom-nakijken')
      OR (
        soort = 'klik'
        AND doel = 'button:Nakijken'
        AND pad ~ '^/[a-z]{2}($|\?)'
      )
    ) AS proefsom,
    bool_or(soort = 'pagina' AND pad LIKE '%/registreren%') AS registreren,
    bool_or(soort = 'klik' AND doel IN ('proefsom-nakijken', 'oefenen-nakijken')) AS eerste_som
  FROM public.site_gebeurtenissen
  GROUP BY sessie_id
)
SELECT
  dag,
  count(*) FILTER (WHERE startpagina) AS op_startpagina,
  count(*) FILTER (WHERE proefsom) AS naar_proefsom,
  count(*) FILTER (WHERE registreren) AS naar_registreren,
  count(*) FILTER (WHERE eerste_som) AS som_nagekeken
FROM per_sessie
GROUP BY dag
ORDER BY dag DESC;

COMMENT ON VIEW public.meet_trechter IS
  'Startpagina → proefsom → registreren → eerste som, per dag in sessies. De proefsom telt zowel op /proberen als op de startpagina zelf (klik home-proefsom-nakijken).';

REVOKE ALL ON public.meet_trechter FROM anon, authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'analist') THEN
    GRANT SELECT ON public.meet_trechter TO analist;
  END IF;
END
$$;

NOTIFY pgrst, 'reload schema';
