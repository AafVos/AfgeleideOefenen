-- Welke site een bezoek binnenkreeg.
--
-- Er draaien nu twee sites op deze database en deze accounts:
-- afgeleideoefenen.nl ('afgeleide') en wiskundemetaaf.nl ('wiskundemetaaf').
-- Zonder deze kolom lopen hun bezoeken door elkaar heen, want het pad is op
-- allebei hetzelfde (/nl, /nl/oefenen, ...).
--
-- De browser zegt niet welke site het is; de server weet dat zelf (zie
-- src/app/api/meet/route.ts) en geeft het als los argument mee. Oude rijen
-- zijn allemaal van afgeleideoefenen.nl.
--
-- Twee keer draaien verandert niets en voegt niets dubbel toe.

ALTER TABLE public.site_gebeurtenissen
  ADD COLUMN IF NOT EXISTS site text NOT NULL DEFAULT 'afgeleide';

COMMENT ON COLUMN public.site_gebeurtenissen.site IS
  'Welke site het bezoek binnenkreeg: afgeleide of wiskundemetaaf. De server zet hem, niet de browser.';

ALTER TABLE public.site_gebeurtenissen
  DROP CONSTRAINT IF EXISTS site_gebeurtenissen_site_check;
ALTER TABLE public.site_gebeurtenissen
  ADD CONSTRAINT site_gebeurtenissen_site_check
  CHECK (site IN ('afgeleide', 'wiskundemetaaf'));

CREATE INDEX IF NOT EXISTS site_gebeurtenissen_site_idx
  ON public.site_gebeurtenissen (site, tijdstip DESC);

ALTER TABLE public.site_dagtotalen
  ADD COLUMN IF NOT EXISTS site text NOT NULL DEFAULT 'afgeleide';

-- De dagtotalen tellen per site apart. De sleutel moet die kolom dus kennen,
-- anders schuift het totaal van de ene site over dat van de andere heen.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_index i
    JOIN pg_class c ON c.oid = i.indexrelid
    JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attname = 'site'
    WHERE i.indrelid = 'public.site_dagtotalen'::regclass
      AND i.indisprimary
      AND a.attnum = ANY (i.indkey)
  ) THEN
    ALTER TABLE public.site_dagtotalen DROP CONSTRAINT IF EXISTS site_dagtotalen_pkey;
    ALTER TABLE public.site_dagtotalen
      ADD CONSTRAINT site_dagtotalen_pkey
      PRIMARY KEY (dag, site, soort, apparaat, pad, doel);
  END IF;
END
$$;

-- De oude versie met twee argumenten gaat weg: anders weet PostgREST niet
-- welke van de twee het moet zijn.
DROP FUNCTION IF EXISTS public.meet_opslaan(jsonb, text);

/**
 * Gebeurtenissen wegschrijven. Gelijk aan 0073, met één verschil: de site
 * komt als argument mee en staat bij elke rij. Een onbekende naam telt als
 * 'afgeleide', zodat er nooit een rij verloren gaat.
 */
CREATE OR REPLACE FUNCTION public.meet_opslaan(
  gebeurtenissen jsonb,
  schuilnaam text DEFAULT NULL,
  site text DEFAULT 'afgeleide'
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sessie uuid;
  naam text;
  welke_site text;
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
  welke_site := CASE
    WHEN site IN ('afgeleide', 'wiskundemetaaf') THEN site
    ELSE 'afgeleide'
  END;

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
        (sessie_id, soort, pad, apparaat, ingelogd, schuilnaam, volgnummer, site)
      VALUES (
        sessie, 'inlog', left(eerste.pad, 200), eerste.apparaat, true, naam,
        vanaf, welke_site
      );
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
     schuilnaam, volgnummer, site)
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
    vanaf + plek::integer,
    welke_site
  FROM bruikbaar;

  GET DIAGNOSTICS geschreven = ROW_COUNT;
  RETURN geschreven;
END;
$$;

REVOKE ALL ON FUNCTION public.meet_opslaan(jsonb, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.meet_opslaan(jsonb, text, text) TO service_role;

/**
 * Dagtotalen bijwerken en alles ouder dan 90 dagen weggooien. Gelijk aan
 * 0072, met de site erbij: de twee sites tellen apart, anders schuift het
 * totaal van de ene over dat van de andere heen.
 */
CREATE OR REPLACE FUNCTION public.site_meting_onderhoud()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  vanaf date;
  opgeruimd integer;
BEGIN
  -- Draait er al een onderhoud, dan doet deze niets.
  IF NOT pg_try_advisory_xact_lock(hashtext('site_meting_onderhoud')) THEN
    RETURN 0;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.site_meting_stand
    WHERE id AND gedraaid_op = current_date
  ) THEN
    RETURN 0;
  END IF;

  SELECT coalesce(dagtotalen_tot, date '2000-01-01') + 1
  INTO vanaf
  FROM public.site_meting_stand
  WHERE id;

  INSERT INTO public.site_dagtotalen
    (dag, site, soort, apparaat, pad, doel, aantal, sessies)
  SELECT
    (tijdstip AT TIME ZONE 'Europe/Amsterdam')::date AS dag,
    site,
    soort,
    apparaat,
    pad,
    coalesce(doel, ''),
    count(*),
    count(DISTINCT sessie_id)
  FROM public.site_gebeurtenissen
  WHERE (tijdstip AT TIME ZONE 'Europe/Amsterdam')::date >= vanaf
    AND (tijdstip AT TIME ZONE 'Europe/Amsterdam')::date < current_date
  GROUP BY 1, 2, 3, 4, 5, 6
  ON CONFLICT (dag, site, soort, apparaat, pad, doel) DO UPDATE
    SET aantal = EXCLUDED.aantal,
        sessies = EXCLUDED.sessies;

  DELETE FROM public.site_gebeurtenissen
  WHERE tijdstip < now() - interval '90 days';
  GET DIAGNOSTICS opgeruimd = ROW_COUNT;

  UPDATE public.site_meting_stand
  SET gedraaid_op = current_date,
      dagtotalen_tot = current_date - 1
  WHERE id;

  RETURN opgeruimd;
END;
$$;
