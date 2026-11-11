-- AFG-683: herkomst gelijktrekken met integraal.
--
-- Drie dingen:
--
-- 1. `site_gebeurtenissen` krijgt een eigen kolom `utm_source`, net als
--    integraal. Tot nu toe stond die alleen als queryparameter in `pad`
--    (`schoonPad` in gebeurtenis.ts); een eigen kolom is te groeperen zonder
--    tekst uit `pad` te pulken.
-- 2. De herkomst van een account mag voortaan ook gezet worden na het
--    aanmaken ervan — maar maar één keer, en alleen van leeg naar een
--    waarde. Nodig omdat een aanmelding via Google niet langs het
--    registratieformulier gaat: de herkomst staat dan nog niet in de
--    metagegevens als `handle_new_user` het profiel aanmaakt, en komt er pas
--    vlak daarna bij via `/auth/callback` (zie `herkomst-sessie.ts` en
--    `lib/auth/google.ts`).
-- 3. Een overzicht voor de analist: aantallen nieuwe accounts per herkomst
--    per week. Alleen opgetelde cijfers, geen e-mailadres en geen naam.
--
-- Twee keer draaien verandert niets en voegt niets dubbel toe.

-- ---------------------------------------------------------------------
-- 1. utm_source als eigen kolom
-- ---------------------------------------------------------------------

ALTER TABLE public.site_gebeurtenissen
  ADD COLUMN IF NOT EXISTS utm_source text;

COMMENT ON COLUMN public.site_gebeurtenissen.utm_source IS
  'De ?utm_source= van de landingspagina, bijvoorbeeld chatgpt.com. Alleen bij de eerste gebeurtenis van het tabblad, net als verwijzer.';

-- De huidige versie van meet_opslaan komt uit 0081 (met de site erbij, niet
-- uit 0073). De argumenten blijven gelijk (jsonb, text, text), dus
-- CREATE OR REPLACE volstaat.
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
      utm_source text,
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
    (sessie_id, soort, pad, doel, waarde, apparaat, verwijzer, utm_source,
     ingelogd, schuilnaam, volgnummer, site)
  SELECT
    sessie_id,
    soort,
    left(pad, 200),
    nullif(left(doel, 80), ''),
    waarde,
    apparaat,
    nullif(left(verwijzer, 80), ''),
    nullif(left(utm_source, 80), ''),
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

-- ---------------------------------------------------------------------
-- 2. Herkomst na het aanmaken mogen zetten, maar maar één keer
-- ---------------------------------------------------------------------

-- De toegestane lijst in `handle_new_user` liep al achter: migratie 0060
-- voegde `proefsom` toe aan de kolom en aan src/lib/herkomst.ts, maar niet
-- hier, dus een aanmelding met `?van=proefsom` werd hier stilletjes NULL.
-- Deze migratie trekt dat gelijk en voegt meteen `chatgpt` en `zoeken` toe.
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
  IF code NOT IN (
    'docent', 'youtube', 'klas', 'forum', 'proberen', 'proefsom',
    'chatgpt', 'zoeken'
  ) THEN
    code := NULL;
  END IF;

  INSERT INTO public.profiles (id, herkomst)
  VALUES (new.id, code)
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.herkomst_blijft_staan()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Stond er al een herkomst, dan verandert die niet meer. Stond er nog
  -- niets, dan mag deze update hem voor het eerst zetten — dat gebeurt bij
  -- een aanmelding via Google, vlak na het aanmaken van het profiel.
  IF OLD.herkomst IS NOT NULL THEN
    NEW.herkomst := OLD.herkomst;
  END IF;
  RETURN NEW;
END;
$$;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_herkomst_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_herkomst_check
  CHECK (
    herkomst IS NULL
    OR herkomst IN (
      'docent', 'youtube', 'klas', 'forum', 'proberen', 'proefsom',
      'chatgpt', 'zoeken'
    )
  );

COMMENT ON COLUMN public.profiles.herkomst IS
  'Eén van de toegestane codes uit src/lib/herkomst.ts. Gezet bij aanmelden, of vlak erna bij een aanmelding via Google. Daarna niet meer te wijzigen.';

-- ---------------------------------------------------------------------
-- 3. Nieuwe accounts per herkomst per week, voor de analist
-- ---------------------------------------------------------------------

CREATE OR REPLACE VIEW public.nieuwe_accounts_per_herkomst_per_week AS
SELECT
  date_trunc('week', created_at AT TIME ZONE 'Europe/Amsterdam')::date AS week,
  coalesce(herkomst, 'onbekend') AS herkomst,
  count(*) AS aantal
FROM public.profiles
GROUP BY 1, 2
ORDER BY 1 DESC, 2;

COMMENT ON VIEW public.nieuwe_accounts_per_herkomst_per_week IS
  'Alleen aantallen: geen e-mailadres, geen gebruikersnaam, geen user_id.';

REVOKE ALL ON public.nieuwe_accounts_per_herkomst_per_week FROM anon, authenticated;

-- De alleen-lezen analistrol mag meekijken. Die rol bestaat alleen op de
-- echte database; lokaal en in de controle slaat dit blok zichzelf over.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'analist') THEN
    GRANT SELECT ON public.nieuwe_accounts_per_herkomst_per_week TO analist;
  END IF;
END
$$;

NOTIFY pgrst, 'reload schema';
