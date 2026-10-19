-- Een leerling vraagt een uitlegvideo aan bij een examenvraag.
--
-- Het formulier staat op /nl/video-aanvragen en hoeft geen account. Wat er
-- in gaat: het examenjaar, het tijdvak, het vraagnummer en een korte
-- toelichting. Een e-mailadres mag, maar hoeft niet: alleen als de leerling
-- zelf aanvinkt dat hij bericht wil als de video er is. Verder gaat er niets
-- in: geen IP-adres, geen user-agent en geen gebruikers-id.
--
-- Twee keer draaien verandert niets en voegt niets dubbel toe.

CREATE TABLE IF NOT EXISTS public.video_aanvragen (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  aangevraagd_op timestamptz NOT NULL DEFAULT now(),
  -- Welke site de aanvraag binnenkreeg; zie 0081_meting_per_site.sql.
  site text NOT NULL DEFAULT 'wiskundemetaaf',
  jaar smallint NOT NULL,
  tijdvak smallint NOT NULL,
  vraagnummer text NOT NULL,
  toelichting text,
  email text,
  mag_mailen boolean NOT NULL DEFAULT false,
  -- Zet Aaf zelf op true zodra de video er is.
  afgehandeld boolean NOT NULL DEFAULT false
);

COMMENT ON TABLE public.video_aanvragen IS
  'Verzoeken om een uitlegvideo bij een examenvraag. Geen IP, geen user-agent, geen gebruikers-id.';
COMMENT ON COLUMN public.video_aanvragen.email IS
  'Alleen als de leerling zelf bericht wil als de video er is. Leeg zodra mag_mailen false is.';
COMMENT ON COLUMN public.video_aanvragen.mag_mailen IS
  'De leerling heeft zelf aangevinkt dat hij bericht wil. Zonder dat vinkje bewaren we geen adres.';
COMMENT ON COLUMN public.video_aanvragen.vraagnummer IS
  'Zoals het op het examen staat, bijvoorbeeld 6 of 12a. Korte tekst, geen getal.';

ALTER TABLE public.video_aanvragen
  DROP CONSTRAINT IF EXISTS video_aanvragen_jaar_check;
ALTER TABLE public.video_aanvragen
  ADD CONSTRAINT video_aanvragen_jaar_check
  CHECK (jaar BETWEEN 2000 AND 2100);

ALTER TABLE public.video_aanvragen
  DROP CONSTRAINT IF EXISTS video_aanvragen_tijdvak_check;
ALTER TABLE public.video_aanvragen
  ADD CONSTRAINT video_aanvragen_tijdvak_check
  CHECK (tijdvak IN (1, 2, 3));

ALTER TABLE public.video_aanvragen
  DROP CONSTRAINT IF EXISTS video_aanvragen_vraagnummer_check;
ALTER TABLE public.video_aanvragen
  ADD CONSTRAINT video_aanvragen_vraagnummer_check
  CHECK (vraagnummer <> '' AND length(vraagnummer) <= 10);

-- Zonder vinkje bewaren we geen adres. Zo kan er nooit per ongeluk een
-- e-mailadres blijven staan van iemand die daar niet om vroeg.
ALTER TABLE public.video_aanvragen
  DROP CONSTRAINT IF EXISTS video_aanvragen_email_check;
ALTER TABLE public.video_aanvragen
  ADD CONSTRAINT video_aanvragen_email_check
  CHECK ((email IS NULL) OR (mag_mailen AND length(email) <= 320));

CREATE INDEX IF NOT EXISTS video_aanvragen_vraag_idx
  ON public.video_aanvragen (jaar, tijdvak, vraagnummer);
CREATE INDEX IF NOT EXISTS video_aanvragen_tijd_idx
  ON public.video_aanvragen (aangevraagd_op DESC);

-- Niemand leest of schrijft hier namens de browser. De site schrijft met de
-- service-role; die gaat langs RLS heen.
ALTER TABLE public.video_aanvragen ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.video_aanvragen FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.video_aanvragen TO service_role;

-- Wat het meest gevraagd wordt. Dit is wat de beheerpagina laat zien; de
-- toelichtingen en de adressen blijven daarbuiten.
CREATE OR REPLACE VIEW public.video_aanvragen_per_vraag
WITH (security_invoker = true) AS
SELECT
  jaar,
  tijdvak,
  vraagnummer,
  count(*)::integer AS aantal,
  max(aangevraagd_op) AS laatste,
  bool_and(afgehandeld) AS afgehandeld
FROM public.video_aanvragen
GROUP BY jaar, tijdvak, vraagnummer;

COMMENT ON VIEW public.video_aanvragen_per_vraag IS
  'Aantal video-aanvragen per examenvraag. Zonder toelichting en zonder e-mailadres.';

REVOKE ALL ON public.video_aanvragen_per_vraag FROM anon, authenticated;
GRANT SELECT ON public.video_aanvragen_per_vraag TO service_role;
