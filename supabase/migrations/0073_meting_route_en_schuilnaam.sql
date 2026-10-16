-- Routes per bezoek, en een schuilnaam voor ingelogde leerlingen.
--
-- Bovenop migratie 0072:
--
-- * `volgnummer` — de plek van een gebeurtenis binnen één tabblad. De
--   database deelt het nummer uit, niet de browser: dan klopt de volgorde
--   ook na een herlaadactie. Daarmee is de route op volgorde na te lopen.
-- * Twee nieuwe soorten: `registratie` (de aanmelding is gelukt) en `inlog`
--   (dit tabblad was eerst uitgelogd en is nu ingelogd). `inlog` zet deze
--   migratie er zelf bij, op het moment dat het omslaat.
-- * `schuilnaam` — alleen bij een ingelogde leerling. Dat is
--   HMAC-SHA256(user_id, geheim), ingekort tot 16 tekens. Daarmee zijn de
--   klikken van één leerling over meerdere dagen te volgen zonder naam,
--   e-mailadres of gebruikers-id. Wie niet is ingelogd, krijgt niets
--   blijvends: alleen het sessie-id van dat ene tabblad.
--
-- Het geheim staat op twee plekken, net als `webhook_secret`: als
-- Worker-secret `MEET_SCHUILNAAM_GEHEIM` (daar rekent de site mee) en in de
-- Vault als `meet_schuilnaam_geheim` (daar rekenen de overzichten mee).
-- Allebei dezelfde waarde, anders komen de twee kanten niet overeen.
-- Ontbreekt het geheim, dan blijft `schuilnaam` gewoon leeg.
--
-- Twee keer draaien verandert niets en voegt niets dubbel toe.

ALTER TABLE public.site_gebeurtenissen
  ADD COLUMN IF NOT EXISTS volgnummer integer;

ALTER TABLE public.site_gebeurtenissen
  ADD COLUMN IF NOT EXISTS schuilnaam text;

COMMENT ON COLUMN public.site_gebeurtenissen.volgnummer IS
  'Plek binnen het tabblad, vanaf 1. De database deelt hem uit, zodat de route op volgorde na te lopen is.';
COMMENT ON COLUMN public.site_gebeurtenissen.schuilnaam IS
  'Alleen bij een ingelogde leerling: HMAC-SHA256(user_id, geheim), 16 tekens. Nooit samen met een user_id bewaard.';

ALTER TABLE public.site_gebeurtenissen
  DROP CONSTRAINT IF EXISTS site_gebeurtenissen_soort_check;
ALTER TABLE public.site_gebeurtenissen
  ADD CONSTRAINT site_gebeurtenissen_soort_check
  CHECK (soort IN (
    'pagina', 'klik', 'dode_klik', 'woedeklik', 'fout', 'scroll',
    'registratie', 'inlog'
  ));

CREATE INDEX IF NOT EXISTS site_gebeurtenissen_volgorde_idx
  ON public.site_gebeurtenissen (sessie_id, volgnummer);
CREATE INDEX IF NOT EXISTS site_gebeurtenissen_schuilnaam_idx
  ON public.site_gebeurtenissen (schuilnaam, tijdstip DESC)
  WHERE schuilnaam IS NOT NULL;

-- Het geheim uit de Vault. Alleen de overzichten mogen hierbij; de analist
-- kan deze functie niet zelf aanroepen en ziet het geheim dus nooit.
CREATE OR REPLACE FUNCTION public.meet_schuilnaam_geheim()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT decrypted_secret
  FROM vault.decrypted_secrets
  WHERE name = 'meet_schuilnaam_geheim'
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.meet_schuilnaam_geheim() FROM PUBLIC;

/**
 * De schuilnaam van één leerling. Dezelfde rekensom als in de site
 * (src/lib/meten/schuilnaam.ts): HMAC-SHA256 van het id, als hex, eerste
 * 16 tekens. Geen geheim in de Vault? Dan leeg.
 */
CREATE OR REPLACE FUNCTION public.meet_schuilnaam(gebruiker uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN gebruiker IS NULL THEN NULL
    WHEN public.meet_schuilnaam_geheim() IS NULL THEN NULL
    ELSE left(
      encode(
        extensions.hmac(gebruiker::text, public.meet_schuilnaam_geheim(), 'sha256'),
        'hex'
      ),
      16
    )
  END;
$$;

REVOKE ALL ON FUNCTION public.meet_schuilnaam(uuid) FROM PUBLIC;

-- De oude versie zonder schuilnaam gaat weg: anders weet PostgREST niet
-- welke van de twee het moet zijn.
DROP FUNCTION IF EXISTS public.meet_opslaan(jsonb);

/**
 * Gebeurtenissen wegschrijven.
 *
 * Nieuw ten opzichte van 0072: elke rij krijgt een `volgnummer` binnen het
 * tabblad, de schuilnaam komt kant-en-klaar mee uit de site, en zodra een
 * tabblad van uitgelogd naar ingelogd gaat komt er een `inlog`-gebeurtenis
 * bij. De grens van 300 per tabblad per uur blijft.
 */
CREATE OR REPLACE FUNCTION public.meet_opslaan(
  gebeurtenissen jsonb,
  schuilnaam text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sessie uuid;
  naam text;
  al_geteld integer;
  ruimte integer;
  vanaf integer;
  geschreven integer;
  eerste record;
BEGIN
  IF jsonb_typeof(gebeurtenissen) <> 'array' THEN
    RETURN 0;
  END IF;

  -- Eén verzending gaat altijd over één tabblad; de eerste rij bepaalt welke.
  BEGIN
    sessie := (gebeurtenissen -> 0 ->> 'sessie_id')::uuid;
  EXCEPTION WHEN others THEN
    RETURN 0;
  END;
  IF sessie IS NULL THEN
    RETURN 0;
  END IF;

  naam := nullif(left(btrim(coalesce(schuilnaam, '')), 32), '');

  SELECT count(*) INTO al_geteld
  FROM public.site_gebeurtenissen
  WHERE sessie_id = sessie
    AND tijdstip > now() - interval '1 hour';

  ruimte := 300 - al_geteld;
  IF ruimte <= 0 THEN
    RETURN 0;
  END IF;

  SELECT coalesce(max(volgnummer), 0) INTO vanaf
  FROM public.site_gebeurtenissen
  WHERE sessie_id = sessie;

  -- Slaat dit tabblad om van uitgelogd naar ingelogd? Dan is dat het moment
  -- van inloggen. Eén keer per tabblad, en alleen als er eerder al iets
  -- gemeten is zonder sessiekoekje — anders was de leerling al ingelogd toen
  -- hij dit tabblad opende.
  IF ruimte > 1
    AND (gebeurtenissen @> '[{"ingelogd": true}]'::jsonb)
    AND EXISTS (
      SELECT 1 FROM public.site_gebeurtenissen
      WHERE sessie_id = sessie AND NOT ingelogd
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.site_gebeurtenissen
      WHERE sessie_id = sessie AND soort = 'inlog'
    )
  THEN
    SELECT * INTO eerste
    FROM jsonb_to_recordset(gebeurtenissen)
      AS g(pad text, apparaat text, verwijzer text)
    LIMIT 1;

    IF eerste.pad IS NOT NULL
      AND eerste.apparaat IN ('telefoon', 'tablet', 'computer')
    THEN
      vanaf := vanaf + 1;
      INSERT INTO public.site_gebeurtenissen
        (sessie_id, soort, pad, apparaat, ingelogd, schuilnaam, volgnummer)
      VALUES (sessie, 'inlog', left(eerste.pad, 200), eerste.apparaat, true, naam, vanaf);
      ruimte := ruimte - 1;
    END IF;
  END IF;

  WITH binnengekomen AS (
    SELECT rij.*, op_volgorde.nr
    FROM jsonb_array_elements(gebeurtenissen)
      WITH ORDINALITY AS op_volgorde(item, nr)
    CROSS JOIN LATERAL jsonb_to_record(op_volgorde.item) AS rij(
      sessie_id uuid,
      soort text,
      pad text,
      doel text,
      waarde smallint,
      apparaat text,
      verwijzer text,
      ingelogd boolean
    )
  ),
  bruikbaar AS (
    SELECT *, row_number() OVER (ORDER BY nr) AS plek
    FROM binnengekomen
    WHERE sessie_id = sessie
      AND soort IN (
        'pagina', 'klik', 'dode_klik', 'woedeklik', 'fout', 'scroll',
        'registratie', 'inlog'
      )
      AND apparaat IN ('telefoon', 'tablet', 'computer')
      AND pad IS NOT NULL
      AND pad <> ''
      AND (waarde IS NULL OR waarde IN (25, 50, 75, 100))
    ORDER BY nr
    LIMIT ruimte
  )
  INSERT INTO public.site_gebeurtenissen
    (sessie_id, soort, pad, doel, waarde, apparaat, verwijzer, ingelogd,
     schuilnaam, volgnummer)
  SELECT
    sessie_id,
    soort,
    left(pad, 200),
    nullif(left(doel, 80), ''),
    waarde,
    apparaat,
    nullif(left(verwijzer, 80), ''),
    coalesce(ingelogd, false),
    naam,
    vanaf + plek::integer
  FROM bruikbaar;

  GET DIAGNOSTICS geschreven = ROW_COUNT;
  RETURN geschreven;
END;
$$;

REVOKE ALL ON FUNCTION public.meet_opslaan(jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.meet_opslaan(jsonb, text) TO service_role;

-- Rijen van vóór deze migratie hebben nog geen volgnummer. Eén keer
-- bijwerken; daarna doet deze stap niets meer.
WITH op_volgorde AS (
  SELECT id, row_number() OVER (PARTITION BY sessie_id ORDER BY id) AS nr
  FROM public.site_gebeurtenissen
  WHERE volgnummer IS NULL
)
UPDATE public.site_gebeurtenissen AS g
SET volgnummer = op_volgorde.nr
FROM op_volgorde
WHERE g.id = op_volgorde.id;

-- ---------------------------------------------------------------------
-- Overzichten voor de ochtendanalyse
-- ---------------------------------------------------------------------

/** De route van één bezoek, als tekst: de eerste zes stappen op volgorde. */
CREATE OR REPLACE VIEW public.meet_routes_top AS
WITH stappen AS (
  SELECT
    sessie_id,
    CASE WHEN soort = 'pagina' THEN pad ELSE coalesce(doel, soort) END AS stap,
    row_number() OVER (PARTITION BY sessie_id ORDER BY volgnummer) AS nr
  FROM public.site_gebeurtenissen
  WHERE soort IN ('pagina', 'klik', 'registratie', 'inlog')
),
routes AS (
  SELECT sessie_id, string_agg(stap, ' → ' ORDER BY nr) AS route
  FROM stappen
  WHERE nr <= 6
  GROUP BY sessie_id
)
SELECT route, count(*) AS sessies
FROM routes
GROUP BY route
ORDER BY sessies DESC, route
LIMIT 20;

/** De weg die bezoekers aflegden tot aan een geslaagde aanmelding. */
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
    g.volgnummer,
    CASE WHEN g.soort = 'pagina' THEN g.pad ELSE coalesce(g.doel, g.soort) END AS stap
  FROM public.site_gebeurtenissen AS g
  JOIN eind ON eind.sessie_id = g.sessie_id AND g.volgnummer <= eind.tot
  WHERE g.soort IN ('pagina', 'klik', 'registratie')
),
routes AS (
  SELECT
    sessie_id,
    count(*) AS stappen,
    string_agg(stap, ' → ' ORDER BY volgnummer) AS route
  FROM stappen
  GROUP BY sessie_id
)
SELECT
  route,
  count(*) AS sessies,
  round(avg(stappen), 1) AS gemiddeld_aantal_stappen
FROM routes
GROUP BY route
ORDER BY sessies DESC, route;

/** Per schuilnaam: hoeveel tabbladen, hoeveel dagen actief. */
CREATE OR REPLACE VIEW public.meet_per_schuilnaam AS
SELECT
  schuilnaam,
  count(DISTINCT sessie_id) AS sessies,
  count(DISTINCT (tijdstip AT TIME ZONE 'Europe/Amsterdam')::date) AS dagen_actief,
  min(tijdstip) AS eerste,
  max(tijdstip) AS laatste,
  count(*) AS gebeurtenissen
FROM public.site_gebeurtenissen
WHERE schuilnaam IS NOT NULL
GROUP BY schuilnaam
ORDER BY dagen_actief DESC, sessies DESC;

/**
 * Voortgang naast de schuilnaam, zodat klikgedrag en oefenen te vergelijken
 * zijn. Alleen opgetelde cijfers: geen e-mailadres, geen gebruikersnaam,
 * geen user_id. Het geheim wordt één keer uit de Vault gehaald.
 */
CREATE OR REPLACE VIEW public.meet_voortgang_per_schuilnaam AS
WITH geheim AS (
  SELECT public.meet_schuilnaam_geheim() AS sleutel
)
SELECT
  left(
    encode(extensions.hmac(p.user_id::text, geheim.sleutel, 'sha256'), 'hex'),
    16
  ) AS schuilnaam,
  count(*) AS onderdelen_begonnen,
  count(*) FILTER (WHERE p.status = 'mastered') AS onderdelen_af,
  sum(p.total_answered) AS antwoorden,
  sum(p.total_correct) AS goed
FROM public.user_progress_new AS p
CROSS JOIN geheim
WHERE geheim.sleutel IS NOT NULL
GROUP BY 1
ORDER BY antwoorden DESC;

REVOKE ALL ON public.meet_routes_top FROM anon, authenticated;
REVOKE ALL ON public.meet_route_naar_registratie FROM anon, authenticated;
REVOKE ALL ON public.meet_per_schuilnaam FROM anon, authenticated;
REVOKE ALL ON public.meet_voortgang_per_schuilnaam FROM anon, authenticated;

-- De alleen-lezen analistrol mag meekijken. Die rol bestaat alleen op de
-- echte database; lokaal en in de controle slaat dit blok zichzelf over.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'analist') THEN
    GRANT SELECT ON public.meet_routes_top TO analist;
    GRANT SELECT ON public.meet_route_naar_registratie TO analist;
    GRANT SELECT ON public.meet_per_schuilnaam TO analist;
    GRANT SELECT ON public.meet_voortgang_per_schuilnaam TO analist;
  END IF;
END
$$;

NOTIFY pgrst, 'reload schema';
