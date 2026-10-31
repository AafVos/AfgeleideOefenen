-- Meet-overzichten telden afgeleide en wiskundemetaaf door elkaar (AFG-759).
--
-- Migratie 0072 maakte de meet_*-overzichten toen er nog maar één site was.
-- Migratie 0081 voegde de kolom `site` aan site_gebeurtenissen toe, maar de
-- overzichten zelf bleven ongewijzigd: ze telden alle rijen samen, ongeacht
-- site. Op een dag met verkeer op allebei de sites gaf meet_bezoekers_per_dag
-- dus een te hoog totaal voor afgeleideoefenen.nl.
--
-- Elk overzicht dat uit site_gebeurtenissen leest krijgt nu een kolom `site`
-- (steeds als laatste kolom: `CREATE OR REPLACE VIEW` mag een bestaande
-- kolom niet van naam of plek laten wisselen) en groepeert daar ook op,
-- zodat `WHERE site = 'afgeleide'` het juiste totaal geeft.
-- meet_voortgang_per_schuilnaam blijft ongemoeid: die leest uit
-- user_progress_new, niet uit site_gebeurtenissen.
--
-- Alleen overzichten; er verandert niets aan de opgeslagen gegevens.
-- Twee keer draaien verandert niets en voegt niets dubbel toe.

CREATE OR REPLACE VIEW public.meet_bezoekers_per_dag AS
SELECT
  (tijdstip AT TIME ZONE 'Europe/Amsterdam')::date AS dag,
  count(DISTINCT sessie_id) AS sessies,
  count(*) FILTER (WHERE soort = 'pagina') AS paginabezoeken,
  count(DISTINCT sessie_id) FILTER (WHERE ingelogd) AS sessies_ingelogd,
  site
FROM public.site_gebeurtenissen
GROUP BY dag, site
ORDER BY dag DESC, site;

CREATE OR REPLACE VIEW public.meet_apparaat_per_dag AS
SELECT
  (tijdstip AT TIME ZONE 'Europe/Amsterdam')::date AS dag,
  apparaat,
  count(DISTINCT sessie_id) AS sessies,
  site
FROM public.site_gebeurtenissen
GROUP BY dag, apparaat, site
ORDER BY dag DESC, apparaat, site;

CREATE OR REPLACE VIEW public.meet_trechter AS
WITH per_sessie AS (
  SELECT
    sessie_id,
    min((tijdstip AT TIME ZONE 'Europe/Amsterdam')::date) AS dag,
    max(site) AS site,
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
  count(*) FILTER (WHERE eerste_som) AS som_nagekeken,
  site
FROM per_sessie
GROUP BY dag, site
ORDER BY dag DESC, site;

COMMENT ON VIEW public.meet_trechter IS
  'Startpagina → proefsom → registreren → eerste som, per dag en per site in sessies. De proefsom telt zowel op /proberen als op de startpagina zelf (klik home-proefsom-nakijken).';

CREATE OR REPLACE VIEW public.meet_doelen_top AS
SELECT
  doel,
  count(*) AS kliks,
  count(DISTINCT sessie_id) AS sessies,
  site
FROM public.site_gebeurtenissen
WHERE soort = 'klik'
  AND doel IS NOT NULL
  AND tijdstip > now() - interval '30 days'
GROUP BY doel, site
ORDER BY kliks DESC;

CREATE OR REPLACE VIEW public.meet_dode_klikken AS
SELECT
  pad,
  doel,
  count(*) AS aantal,
  count(DISTINCT sessie_id) AS sessies,
  site
FROM public.site_gebeurtenissen
WHERE soort = 'dode_klik'
  AND tijdstip > now() - interval '30 days'
GROUP BY pad, doel, site
ORDER BY aantal DESC;

CREATE OR REPLACE VIEW public.meet_woedeklikken AS
SELECT
  pad,
  doel,
  count(*) AS aantal,
  count(DISTINCT sessie_id) AS sessies,
  site
FROM public.site_gebeurtenissen
WHERE soort = 'woedeklik'
  AND tijdstip > now() - interval '30 days'
GROUP BY pad, doel, site
ORDER BY aantal DESC;

CREATE OR REPLACE VIEW public.meet_fouten AS
SELECT
  pad,
  doel,
  count(*) AS aantal,
  count(DISTINCT sessie_id) AS sessies,
  max(tijdstip) AS laatst,
  site
FROM public.site_gebeurtenissen
WHERE soort = 'fout'
  AND tijdstip > now() - interval '30 days'
GROUP BY pad, doel, site
ORDER BY aantal DESC;

CREATE OR REPLACE VIEW public.meet_scroll_per_pagina AS
SELECT
  pad,
  count(DISTINCT sessie_id) FILTER (WHERE waarde >= 25) AS tot_25,
  count(DISTINCT sessie_id) FILTER (WHERE waarde >= 50) AS tot_50,
  count(DISTINCT sessie_id) FILTER (WHERE waarde >= 75) AS tot_75,
  count(DISTINCT sessie_id) FILTER (WHERE waarde >= 100) AS tot_100,
  site
FROM public.site_gebeurtenissen
WHERE soort = 'scroll'
  AND tijdstip > now() - interval '30 days'
GROUP BY pad, site
ORDER BY tot_25 DESC;

-- De twintig meestgelopen routes, nu per site: anders verdringen de drukkere
-- routes van de ene site die van de andere uit de top 20.
CREATE OR REPLACE VIEW public.meet_routes_top AS
WITH stappen AS (
  SELECT
    sessie_id,
    site,
    CASE WHEN soort = 'pagina' THEN pad ELSE coalesce(doel, soort) END AS stap,
    row_number() OVER (PARTITION BY sessie_id ORDER BY volgnummer) AS nr
  FROM public.site_gebeurtenissen
  WHERE soort IN ('pagina', 'klik', 'registratie', 'inlog')
),
routes AS (
  SELECT sessie_id, max(site) AS site, string_agg(stap, ' → ' ORDER BY nr) AS route
  FROM stappen
  WHERE nr <= 6
  GROUP BY sessie_id
),
geteld AS (
  SELECT route, count(*) AS sessies, site
  FROM routes
  GROUP BY route, site
)
SELECT route, sessies, site
FROM (
  SELECT *, row_number() OVER (PARTITION BY site ORDER BY sessies DESC, route) AS rn
  FROM geteld
) AS top_per_site
WHERE rn <= 20
ORDER BY site, sessies DESC, route;

CREATE OR REPLACE VIEW public.meet_route_naar_registratie AS
WITH eind AS (
  SELECT sessie_id, min(volgnummer) AS tot
  FROM public.site_gebeurtenissen
  WHERE soort = 'registratie'
  GROUP BY sessie_id
),
stappen AS (
  SELECT
    g.sessie_id,
    g.site,
    g.volgnummer,
    CASE WHEN g.soort = 'pagina' THEN g.pad ELSE coalesce(g.doel, g.soort) END AS stap
  FROM public.site_gebeurtenissen AS g
  JOIN eind ON eind.sessie_id = g.sessie_id AND g.volgnummer <= eind.tot
  WHERE g.soort IN ('pagina', 'klik', 'registratie')
),
routes AS (
  SELECT
    sessie_id,
    max(site) AS site,
    count(*) AS stappen,
    string_agg(stap, ' → ' ORDER BY volgnummer) AS route
  FROM stappen
  GROUP BY sessie_id
)
SELECT
  route,
  count(*) AS sessies,
  round(avg(stappen), 1) AS gemiddeld_aantal_stappen,
  site
FROM routes
GROUP BY route, site
ORDER BY site, sessies DESC, route;

CREATE OR REPLACE VIEW public.meet_per_schuilnaam AS
SELECT
  schuilnaam,
  count(DISTINCT sessie_id) AS sessies,
  count(DISTINCT (tijdstip AT TIME ZONE 'Europe/Amsterdam')::date) AS dagen_actief,
  min(tijdstip) AS eerste,
  max(tijdstip) AS laatste,
  count(*) AS gebeurtenissen,
  site
FROM public.site_gebeurtenissen
WHERE schuilnaam IS NOT NULL
GROUP BY schuilnaam, site
ORDER BY dagen_actief DESC, sessies DESC;

NOTIFY pgrst, 'reload schema';
