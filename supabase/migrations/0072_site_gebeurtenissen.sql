-- Klikmeting zonder koekjes: wat bezoekers op de site doen, ook zonder account.
--
-- Wat er in gaat: tijdstip, een willekeurig id per tabblad (sessionStorage,
-- geen koekje), het soort gebeurtenis, het pad, een vaste naam van de knop,
-- het apparaat op schermbreedte, het domein van de verwijzer en of iemand is
-- ingelogd. Wat er nooit in gaat: IP-adres, user-agent, e-mailadres,
-- gebruikers-id, ingevulde antwoorden of tekst uit invoervelden.
--
-- Ruwe gebeurtenissen blijven 90 dagen staan. Voor langere trends houdt
-- `site_dagtotalen` per dag de aantallen bij. `site_meting_onderhoud()` doet
-- allebei, hoogstens één keer per dag; de route /api/meet roept hem af en toe
-- aan, want deze database heeft geen pg_cron.
--
-- Twee keer draaien verandert niets en voegt niets dubbel toe.

CREATE TABLE IF NOT EXISTS public.site_gebeurtenissen (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tijdstip timestamptz NOT NULL DEFAULT now(),
  sessie_id uuid NOT NULL,
  soort text NOT NULL,
  pad text NOT NULL,
  doel text,
  waarde smallint,
  apparaat text NOT NULL,
  verwijzer text,
  ingelogd boolean NOT NULL DEFAULT false
);

COMMENT ON TABLE public.site_gebeurtenissen IS
  'Klikmeting zonder koekjes. Geen IP, geen user-agent, geen gebruiker. Ruwe rijen blijven 90 dagen staan.';
COMMENT ON COLUMN public.site_gebeurtenissen.sessie_id IS
  'Willekeurig id per tabblad, uit sessionStorage. Verdwijnt als het tabblad dichtgaat.';
COMMENT ON COLUMN public.site_gebeurtenissen.doel IS
  'Vaste naam uit data-meet, of soort element plus een korte vaste tekst. Nooit tekst uit een invoerveld.';
COMMENT ON COLUMN public.site_gebeurtenissen.waarde IS
  'Alleen bij scroll: 25, 50, 75 of 100 procent.';
COMMENT ON COLUMN public.site_gebeurtenissen.verwijzer IS
  'Alleen het domein van de verwijzer, bijvoorbeeld google.com. Nooit het hele adres.';

ALTER TABLE public.site_gebeurtenissen
  DROP CONSTRAINT IF EXISTS site_gebeurtenissen_soort_check;
ALTER TABLE public.site_gebeurtenissen
  ADD CONSTRAINT site_gebeurtenissen_soort_check
  CHECK (soort IN ('pagina', 'klik', 'dode_klik', 'woedeklik', 'fout', 'scroll'));

ALTER TABLE public.site_gebeurtenissen
  DROP CONSTRAINT IF EXISTS site_gebeurtenissen_apparaat_check;
ALTER TABLE public.site_gebeurtenissen
  ADD CONSTRAINT site_gebeurtenissen_apparaat_check
  CHECK (apparaat IN ('telefoon', 'tablet', 'computer'));

ALTER TABLE public.site_gebeurtenissen
  DROP CONSTRAINT IF EXISTS site_gebeurtenissen_waarde_check;
ALTER TABLE public.site_gebeurtenissen
  ADD CONSTRAINT site_gebeurtenissen_waarde_check
  CHECK (waarde IS NULL OR waarde IN (25, 50, 75, 100));

CREATE INDEX IF NOT EXISTS site_gebeurtenissen_tijd_idx
  ON public.site_gebeurtenissen (tijdstip DESC);
CREATE INDEX IF NOT EXISTS site_gebeurtenissen_sessie_idx
  ON public.site_gebeurtenissen (sessie_id, tijdstip DESC);
CREATE INDEX IF NOT EXISTS site_gebeurtenissen_soort_idx
  ON public.site_gebeurtenissen (soort, tijdstip DESC);

-- Niemand leest of schrijft hier namens de browser. De site schrijft met de
-- service-role (die gaat langs RLS heen); de analistrol leest mee via het
-- beleid onderaan dit bestand.
ALTER TABLE public.site_gebeurtenissen ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.site_gebeurtenissen FROM anon, authenticated;

-- Dagtotalen blijven staan als de ruwe rijen weg zijn.
CREATE TABLE IF NOT EXISTS public.site_dagtotalen (
  dag date NOT NULL,
  soort text NOT NULL,
  apparaat text NOT NULL,
  pad text NOT NULL,
  doel text NOT NULL DEFAULT '',
  aantal integer NOT NULL,
  sessies integer NOT NULL,
  PRIMARY KEY (dag, soort, apparaat, pad, doel)
);

COMMENT ON TABLE public.site_dagtotalen IS
  'Aantallen per dag uit site_gebeurtenissen. Blijft staan als de ruwe rijen na 90 dagen weg zijn.';

ALTER TABLE public.site_dagtotalen ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.site_dagtotalen FROM anon, authenticated;

-- Eén regel die onthoudt wanneer het onderhoud voor het laatst draaide.
CREATE TABLE IF NOT EXISTS public.site_meting_stand (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  gedraaid_op date,
  dagtotalen_tot date
);

INSERT INTO public.site_meting_stand (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_meting_stand ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.site_meting_stand FROM anon, authenticated;

-- Gebeurtenissen wegschrijven. De site stuurt ze per paar seconden in één
-- keer; deze functie bewaakt de grens van 300 per sessie per uur en laat
-- alleen bekende soorten en apparaten door.
CREATE OR REPLACE FUNCTION public.meet_opslaan(gebeurtenissen jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sessie uuid;
  al_geteld integer;
  ruimte integer;
  geschreven integer;
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

  SELECT count(*) INTO al_geteld
  FROM public.site_gebeurtenissen
  WHERE sessie_id = sessie
    AND tijdstip > now() - interval '1 hour';

  ruimte := 300 - al_geteld;
  IF ruimte <= 0 THEN
    RETURN 0;
  END IF;

  WITH binnengekomen AS (
    SELECT *
    FROM jsonb_to_recordset(gebeurtenissen) AS g(
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
    SELECT *
    FROM binnengekomen
    WHERE sessie_id = sessie
      AND soort IN ('pagina', 'klik', 'dode_klik', 'woedeklik', 'fout', 'scroll')
      AND apparaat IN ('telefoon', 'tablet', 'computer')
      AND pad IS NOT NULL
      AND pad <> ''
      AND (waarde IS NULL OR waarde IN (25, 50, 75, 100))
    LIMIT ruimte
  )
  INSERT INTO public.site_gebeurtenissen
    (sessie_id, soort, pad, doel, waarde, apparaat, verwijzer, ingelogd)
  SELECT
    sessie_id,
    soort,
    left(pad, 200),
    nullif(left(doel, 80), ''),
    waarde,
    apparaat,
    nullif(left(verwijzer, 80), ''),
    coalesce(ingelogd, false)
  FROM bruikbaar;

  GET DIAGNOSTICS geschreven = ROW_COUNT;
  RETURN geschreven;
END;
$$;

REVOKE ALL ON FUNCTION public.meet_opslaan(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.meet_opslaan(jsonb) TO service_role;

-- Dagtotalen bijwerken en alles ouder dan 90 dagen weggooien. Hoogstens één
-- keer per dag; wie te vroeg is, krijgt stilletjes niets te doen.
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

  INSERT INTO public.site_dagtotalen (dag, soort, apparaat, pad, doel, aantal, sessies)
  SELECT
    (tijdstip AT TIME ZONE 'Europe/Amsterdam')::date AS dag,
    soort,
    apparaat,
    pad,
    coalesce(doel, ''),
    count(*),
    count(DISTINCT sessie_id)
  FROM public.site_gebeurtenissen
  WHERE (tijdstip AT TIME ZONE 'Europe/Amsterdam')::date >= vanaf
    AND (tijdstip AT TIME ZONE 'Europe/Amsterdam')::date < current_date
  GROUP BY 1, 2, 3, 4, 5
  ON CONFLICT (dag, soort, apparaat, pad, doel) DO UPDATE
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

REVOKE ALL ON FUNCTION public.site_meting_onderhoud() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.site_meting_onderhoud() TO service_role;

-- Handige overzichten voor de ochtendanalyse. Ze draaien als eigenaar, zodat
-- de analistrol ze kan lezen zonder zelf in de tabellen te hoeven.

CREATE OR REPLACE VIEW public.meet_bezoekers_per_dag AS
SELECT
  (tijdstip AT TIME ZONE 'Europe/Amsterdam')::date AS dag,
  count(DISTINCT sessie_id) AS sessies,
  count(*) FILTER (WHERE soort = 'pagina') AS paginabezoeken,
  count(DISTINCT sessie_id) FILTER (WHERE ingelogd) AS sessies_ingelogd
FROM public.site_gebeurtenissen
GROUP BY 1
ORDER BY 1 DESC;

CREATE OR REPLACE VIEW public.meet_apparaat_per_dag AS
SELECT
  (tijdstip AT TIME ZONE 'Europe/Amsterdam')::date AS dag,
  apparaat,
  count(DISTINCT sessie_id) AS sessies
FROM public.site_gebeurtenissen
GROUP BY 1, 2
ORDER BY 1 DESC, 2;

-- De route startpagina → proefsom → registreren → eerste som, per dag,
-- geteld in sessies. Een sessie telt mee bij elke stap die hij haalt.
CREATE OR REPLACE VIEW public.meet_trechter AS
WITH per_sessie AS (
  SELECT
    sessie_id,
    min((tijdstip AT TIME ZONE 'Europe/Amsterdam')::date) AS dag,
    bool_or(soort = 'pagina' AND pad ~ '^/[a-z]{2}$') AS startpagina,
    bool_or(soort = 'pagina' AND pad LIKE '%/proberen%') AS proefsom,
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

CREATE OR REPLACE VIEW public.meet_doelen_top AS
SELECT
  doel,
  count(*) AS kliks,
  count(DISTINCT sessie_id) AS sessies
FROM public.site_gebeurtenissen
WHERE soort = 'klik'
  AND doel IS NOT NULL
  AND tijdstip > now() - interval '30 days'
GROUP BY doel
ORDER BY kliks DESC;

CREATE OR REPLACE VIEW public.meet_dode_klikken AS
SELECT
  pad,
  doel,
  count(*) AS aantal,
  count(DISTINCT sessie_id) AS sessies
FROM public.site_gebeurtenissen
WHERE soort = 'dode_klik'
  AND tijdstip > now() - interval '30 days'
GROUP BY pad, doel
ORDER BY aantal DESC;

CREATE OR REPLACE VIEW public.meet_woedeklikken AS
SELECT
  pad,
  doel,
  count(*) AS aantal,
  count(DISTINCT sessie_id) AS sessies
FROM public.site_gebeurtenissen
WHERE soort = 'woedeklik'
  AND tijdstip > now() - interval '30 days'
GROUP BY pad, doel
ORDER BY aantal DESC;

CREATE OR REPLACE VIEW public.meet_fouten AS
SELECT
  pad,
  doel,
  count(*) AS aantal,
  count(DISTINCT sessie_id) AS sessies,
  max(tijdstip) AS laatst
FROM public.site_gebeurtenissen
WHERE soort = 'fout'
  AND tijdstip > now() - interval '30 days'
GROUP BY pad, doel
ORDER BY aantal DESC;

CREATE OR REPLACE VIEW public.meet_scroll_per_pagina AS
SELECT
  pad,
  count(DISTINCT sessie_id) FILTER (WHERE waarde >= 25) AS tot_25,
  count(DISTINCT sessie_id) FILTER (WHERE waarde >= 50) AS tot_50,
  count(DISTINCT sessie_id) FILTER (WHERE waarde >= 75) AS tot_75,
  count(DISTINCT sessie_id) FILTER (WHERE waarde >= 100) AS tot_100
FROM public.site_gebeurtenissen
WHERE soort = 'scroll'
  AND tijdstip > now() - interval '30 days'
GROUP BY pad
ORDER BY tot_25 DESC;

REVOKE ALL ON public.meet_bezoekers_per_dag FROM anon, authenticated;
REVOKE ALL ON public.meet_apparaat_per_dag FROM anon, authenticated;
REVOKE ALL ON public.meet_trechter FROM anon, authenticated;
REVOKE ALL ON public.meet_doelen_top FROM anon, authenticated;
REVOKE ALL ON public.meet_dode_klikken FROM anon, authenticated;
REVOKE ALL ON public.meet_woedeklikken FROM anon, authenticated;
REVOKE ALL ON public.meet_fouten FROM anon, authenticated;
REVOKE ALL ON public.meet_scroll_per_pagina FROM anon, authenticated;

-- De alleen-lezen analistrol mag meekijken. Die rol bestaat alleen op de
-- echte database; lokaal en in de controle slaat dit blok zichzelf over.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'analist') THEN
    GRANT SELECT ON public.site_gebeurtenissen TO analist;
    GRANT SELECT ON public.site_dagtotalen TO analist;
    GRANT SELECT ON public.meet_bezoekers_per_dag TO analist;
    GRANT SELECT ON public.meet_apparaat_per_dag TO analist;
    GRANT SELECT ON public.meet_trechter TO analist;
    GRANT SELECT ON public.meet_doelen_top TO analist;
    GRANT SELECT ON public.meet_dode_klikken TO analist;
    GRANT SELECT ON public.meet_woedeklikken TO analist;
    GRANT SELECT ON public.meet_fouten TO analist;
    GRANT SELECT ON public.meet_scroll_per_pagina TO analist;

    DROP POLICY IF EXISTS "analist leest de meting" ON public.site_gebeurtenissen;
    CREATE POLICY "analist leest de meting"
      ON public.site_gebeurtenissen FOR SELECT TO analist USING (true);

    DROP POLICY IF EXISTS "analist leest de dagtotalen" ON public.site_dagtotalen;
    CREATE POLICY "analist leest de dagtotalen"
      ON public.site_dagtotalen FOR SELECT TO analist USING (true);
  END IF;
END
$$;

NOTIFY pgrst, 'reload schema';
