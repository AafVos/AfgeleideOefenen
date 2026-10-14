-- Paragrafen en theorieblokken, zoals het boek (12e editie, dezelfde
-- nummering als de oefenstof).
--
-- Een leerling zoekt 2.4, niet een losse technieknaam. De onderwerpen
-- blijven staan (voortgang, clusters, sessies). Elk onderwerp van
-- H2, H6, H7, H9 en H15 wijst naar zijn theorieblok. Opgaven worden
-- niet verplaatst of weggegooid.
--
-- Beweging en examentraining hebben geen boekparagrafen. Die
-- onderwerpen blijven zonder blok.
-- Paragraaf 15.4 hoort bij integralen en staat hier niet in. Het
-- hoofdstuk heet op deze site al "Hellingen, raaklijnen en optimaliseren".
-- Voorkennis vóór de eerste paragraaf is geen genummerde paragraaf.
--
-- Het boek schrijft het grondtal als g. Op deze site is g een functie,
-- dus in de titels staat a.
--
-- Twee keer draaien voegt niets dubbel toe. Ontbreekt een genoemd
-- onderwerp of blok, dan stopt dit bestand en rolt de transactie terug.

BEGIN;

CREATE TABLE IF NOT EXISTS public.paragraphs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES public.chapters (id) ON DELETE CASCADE,
  slug text NOT NULL,
  label text NOT NULL,
  title text NOT NULL,
  order_index smallint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT paragraphs_slug_key UNIQUE (slug)
);

CREATE TABLE IF NOT EXISTS public.theory_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paragraph_id uuid NOT NULL REFERENCES public.paragraphs (id) ON DELETE CASCADE,
  slug text NOT NULL,
  letter text NOT NULL,
  title text NOT NULL,
  order_index smallint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT theory_blocks_slug_key UNIQUE (slug),
  CONSTRAINT theory_blocks_paragraph_letter_key UNIQUE (paragraph_id, letter)
);

CREATE INDEX IF NOT EXISTS paragraphs_chapter_id_idx
  ON public.paragraphs (chapter_id);

CREATE INDEX IF NOT EXISTS theory_blocks_paragraph_id_idx
  ON public.theory_blocks (paragraph_id);

ALTER TABLE public.topics_new
  ADD COLUMN IF NOT EXISTS theory_block_id uuid REFERENCES public.theory_blocks (id);

CREATE INDEX IF NOT EXISTS topics_new_theory_block_id_idx
  ON public.topics_new (theory_block_id);

ALTER TABLE public.paragraphs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theory_blocks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'paragraphs' AND policyname = 'read_paragraphs'
  ) THEN
    CREATE POLICY read_paragraphs ON public.paragraphs
      FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'paragraphs' AND policyname = 'write_paragraphs'
  ) THEN
    CREATE POLICY write_paragraphs ON public.paragraphs
      FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'theory_blocks' AND policyname = 'read_theory_blocks'
  ) THEN
    CREATE POLICY read_theory_blocks ON public.theory_blocks
      FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'theory_blocks' AND policyname = 'write_theory_blocks'
  ) THEN
    CREATE POLICY write_theory_blocks ON public.theory_blocks
      FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

INSERT INTO public.paragraphs (chapter_id, slug, label, title, order_index)
SELECT c.id, v.slug, v.label, v.title, v.order_index::smallint
FROM public.chapters c
JOIN (
  VALUES
    ('h2'::text, 'h2-1'::text, '2.1'::text, 'Snelheden'::text, 1),
    ('h2', 'h2-2', '2.2', 'Raaklijnen en hellinggrafieken', 2),
    ('h2', 'h2-3', '2.3', 'Limiet en afgeleide', 3),
    ('h2', 'h2-4', '2.4', 'Toepassingen van de afgeleide', 4),
    ('h2', 'h2-5', '2.5', 'Hellingen en raaklijnen met GeoGebra', 5),

    ('h6', 'h6-1', '6.1', 'Toppen en buigpunten', 1),
    ('h6', 'h6-2', '6.2', 'De afgeleide van machtsfuncties', 2),
    ('h6', 'h6-3', '6.3', 'De kettingregel', 3),
    ('h6', 'h6-4', '6.4', 'Toppen en snijpunten', 4),

    ('h7', 'h7-1', '7.1', 'Eenheidscirkel en radiaal', 1),
    ('h7', 'h7-2', '7.2', 'Goniometrische vergelijkingen', 2),
    ('h7', 'h7-3', '7.3', 'Transformaties en functies', 3),
    ('h7', 'h7-4', '7.4', 'Grafieken van goniometrische functies', 4),
    ('h7', 'h7-5', '7.5', 'Goniometrische functies differentiëren', 5),

    ('h9', 'h9-1', '9.1', 'Rekenregels voor logaritmen', 1),
    ('h9', 'h9-2', '9.2', 'Exponentiële en logaritmische formules', 2),
    ('h9', 'h9-3', '9.3', 'Het grondtal e', 3),
    ('h9', 'h9-4', '9.4', 'De natuurlijke logaritme', 4),

    ('h15', 'h15-1', '15.1', 'Hellingen, buigpunten en toppen', 1),
    ('h15', 'h15-2', '15.2', 'Raakproblemen', 2),
    ('h15', 'h15-3', '15.3', 'Optimaliseringsproblemen', 3)
) AS v(chapter_slug, slug, label, title, order_index)
  ON c.slug = v.chapter_slug
ON CONFLICT (slug) DO UPDATE
  SET title = excluded.title,
      label = excluded.label,
      order_index = excluded.order_index,
      chapter_id = excluded.chapter_id;

INSERT INTO public.theory_blocks (paragraph_id, slug, letter, title, order_index)
SELECT p.id, v.slug, v.letter, v.title, v.order_index::smallint
FROM public.paragraphs p
JOIN (
  VALUES
    -- 2.1
    ('h2-1'::text, 'h2-1a'::text, 'A'::text, 'Soorten van stijgen en dalen'::text, 1),
    ('h2-1', 'h2-1b', 'B', 'Gemiddelde snelheid', 2),
    ('h2-1', 'h2-1c', 'C', 'Differentiequotiënten', 3),
    ('h2-1', 'h2-1d', 'D', 'Differentiequotiënten berekenen bij een functievoorschrift', 4),
    ('h2-1', 'h2-1e', 'E', 'Snelheid op één moment', 5),
    -- 2.2
    ('h2-2', 'h2-2a', 'A', 'Snelheid en richtingscoëfficiënt', 1),
    ('h2-2', 'h2-2b', 'B', 'Hellinggrafiek schetsen', 2),
    -- 2.3
    ('h2-3', 'h2-3a', 'A', 'De limiet als continumakende waarde', 1),
    ('h2-3', 'h2-3b', 'B', 'De afgeleide functie', 2),
    ('h2-3', 'h2-3c', 'C', 'Differentieerregels aantonen', 3),
    ('h2-3', 'h2-3d', 'D', 'Differentiëren', 4),
    -- 2.4
    ('h2-4', 'h2-4a', 'A', 'De productregel', 1),
    ('h2-4', 'h2-4b', 'B', 'De quotiëntregel', 2),
    ('h2-4', 'h2-4c', 'C', 'Raaklijn en afgeleide', 3),
    ('h2-4', 'h2-4d', 'D', 'Raaklijn met gegeven richtingscoëfficiënt', 4),
    ('h2-4', 'h2-4e', 'E', 'Snelheid en afgeleide', 5),
    -- 2.5
    ('h2-5', 'h2-5a', 'A', 'Grafieken tekenen met GeoGebra', 1),
    ('h2-5', 'h2-5b', 'B', 'Raaklijnen', 2),
    ('h2-5', 'h2-5c', 'C', 'De formule van de hellinggrafiek', 3),

    -- 6.1
    ('h6-1', 'h6-1a', 'A', 'Algebraïsch berekenen van extreme waarden', 1),
    ('h6-1', 'h6-1b', 'B', 'Aantonen van extreme waarden', 2),
    ('h6-1', 'h6-1c', 'C', 'Buigpunt en buigraaklijn', 3),
    -- 6.2
    ('h6-2', 'h6-2a', 'A', 'De afgeleide van f(x) = x^n voor gehele n', 1),
    ('h6-2', 'h6-2b', 'B', 'De afgeleide van f(x) = x^n voor elke reële n', 2),
    -- 6.3
    ('h6-3', 'h6-3a', 'A', 'De afgeleide van een samengestelde functie', 1),
    ('h6-3', 'h6-3b', 'B', 'De kettingregel gecombineerd met de productregel of de quotiëntregel', 2),
    -- 6.4
    ('h6-4', 'h6-4a', 'A', 'Aantal oplossingen van de vergelijking f(x) = p', 1),
    ('h6-4', 'h6-4b', 'B', 'Derdegraadsfuncties met een parameter', 2),
    ('h6-4', 'h6-4c', 'C', 'Raaklijnproblemen bij functies met een parameter', 3),
    ('h6-4', 'h6-4d', 'D', 'Kromme door toppen', 4),

    -- 7.1
    ('h7-1', 'h7-1a', 'A', 'Definitie van sinus, cosinus en tangens', 1),
    ('h7-1', 'h7-1b', 'B', 'Hoek berekenen bij gegeven x_P of y_P', 2),
    ('h7-1', 'h7-1c', 'C', 'De hoekeenheid radiaal', 3),
    ('h7-1', 'h7-1d', 'D', 'De exacte-waarden-cirkel', 4),
    -- 7.2
    ('h7-2', 'h7-2a', 'A', 'sin(A) = C en cos(A) = C met C = -1, 0 of 1', 1),
    ('h7-2', 'h7-2b', 'B', 'sin(A) = C en cos(A) = C met C = -1/2√3, -1/2√2, -1/2, 1/2, 1/2√2 of 1/2√3', 2),
    ('h7-2', 'h7-2c', 'C', 'sin(A) = sin(B) en cos(A) = cos(B)', 3),
    -- 7.3
    ('h7-3', 'h7-3a', 'A', 'De functie f(x) = sin(x)', 1),
    ('h7-3', 'h7-3b', 'B', 'Sinusoïden', 2),
    ('h7-3', 'h7-3c', 'C', 'Goniometrische formules aantonen', 3),
    -- 7.4
    ('h7-4', 'h7-4a', 'A', 'Sinusoïden tekenen', 1),
    ('h7-4', 'h7-4b', 'B', 'Een formule van een sinusoïde opstellen', 2),
    ('h7-4', 'h7-4c', 'C', 'De tangensfunctie', 3),
    -- 7.5
    ('h7-5', 'h7-5a', 'A', 'De afgeleide van sinus, cosinus en tangens', 1),

    -- 9.1
    ('h9-1', 'h9-1a', 'A', 'Herleiden van logaritmen', 1),
    ('h9-1', 'h9-1b', 'B', 'Vergelijkingen van de vorm a-log(A) = a-log(B)', 2),
    ('h9-1', 'h9-1c', 'C', 'Overgaan op ander grondtal', 3),
    -- 9.2
    ('h9-2', 'h9-2a', 'A', 'Groeifactoren en groeipercentages', 1),
    ('h9-2', 'h9-2b', 'B', 'Verdubbelingstijd en halveringstijd', 2),
    ('h9-2', 'h9-2c', 'C', 'Exponentiële en logaritmische formules omwerken', 3),
    -- 9.3
    ('h9-3', 'h9-3a', 'A', 'De afgeleide van f(x) = a^x', 1),
    ('h9-3', 'h9-3b', 'B', 'Het getal e', 2),
    ('h9-3', 'h9-3c', 'C', 'Functies met e-machten differentiëren', 3),
    -- 9.4
    ('h9-4', 'h9-4a', 'A', 'Logaritmen met grondtal e', 1),
    ('h9-4', 'h9-4b', 'B', 'Exponentiële en logaritmische functies differentiëren', 2),

    -- 15.1
    ('h15-1', 'h15-1a', 'A', 'Soorten van stijgen en dalen', 1),
    ('h15-1', 'h15-1b', 'B', 'Buigpunten', 2),
    ('h15-1', 'h15-1c', 'C', 'Toppen en afstanden', 3),
    -- 15.2
    ('h15-2', 'h15-2a', 'A', 'De hoek tussen twee krommen', 1),
    ('h15-2', 'h15-2b', 'B', 'Rakende grafieken', 2),
    ('h15-2', 'h15-2c', 'C', 'Elkaar loodrecht snijdende grafieken', 3),
    -- 15.3
    ('h15-3', 'h15-3a', 'A', 'Optimaliseren van oppervlakten en lengten', 1),
    ('h15-3', 'h15-3b', 'B', 'Verticale afstanden bij grafieken', 2),
    ('h15-3', 'h15-3c', 'C', 'Optimaliseren bij goniometrische modellen', 3)
) AS v(paragraph_slug, slug, letter, title, order_index)
  ON v.paragraph_slug = p.slug
ON CONFLICT (slug) DO UPDATE
  SET title = excluded.title,
      letter = excluded.letter,
      order_index = excluded.order_index,
      paragraph_id = excluded.paragraph_id;

-- Koppeling onderwerp → theorieblok.
-- H6 machten dekt 6.2 A (gehele n) én 6.2 B (elke reële n). Het onderwerp
-- hangt aan B, de algemenere regel.
-- H9 logaritmen heeft ook sommen met a^x; die horen bij 9.3 A. Het
-- onderwerp heet logaritmes differentiëren en hangt aan 9.4 B.
-- H15-onderwerpen dekken elk een hele paragraaf. Ze hangen aan het blok
-- waar de meeste soorten sommen bij horen. Zie de toelichting in de taak.
UPDATE public.topics_new AS t
SET theory_block_id = b.id
FROM (
  VALUES
    ('h2_termsgewijs'::text, 'h2-3d'::text),
    ('h2_haakjes_eerst', 'h2-3d'),
    ('h2_productregel', 'h2-4a'),
    ('h2_quotientregel', 'h2-4b'),
    ('h6_machten', 'h6-2b'),
    ('h6_kettingregel', 'h6-3a'),
    ('h6_combinaties', 'h6-3b'),
    ('h7_goniometrie_diff', 'h7-5a'),
    ('h9_e_machten', 'h9-3c'),
    ('h9_logaritmes', 'h9-4b'),
    ('h15_hellingen', 'h15-1c'),
    ('h15_raakproblemen', 'h15-2a'),
    ('h15_optimaliseren', 'h15-3a')
) AS v(topic_slug, block_slug)
JOIN public.theory_blocks b ON b.slug = v.block_slug
WHERE t.slug = v.topic_slug
  AND t.theory_block_id IS DISTINCT FROM b.id;

DO $$
DECLARE
  ontbreekt int;
  paragrafen int;
  blokken int;
  los int;
BEGIN
  SELECT count(*) INTO paragrafen
  FROM public.paragraphs
  WHERE slug IN (
    'h2-1', 'h2-2', 'h2-3', 'h2-4', 'h2-5',
    'h6-1', 'h6-2', 'h6-3', 'h6-4',
    'h7-1', 'h7-2', 'h7-3', 'h7-4', 'h7-5',
    'h9-1', 'h9-2', 'h9-3', 'h9-4',
    'h15-1', 'h15-2', 'h15-3'
  );

  SELECT count(*) INTO blokken
  FROM public.theory_blocks
  WHERE slug LIKE 'h2-%'
     OR slug LIKE 'h6-%'
     OR slug LIKE 'h7-%'
     OR slug LIKE 'h9-%'
     OR slug LIKE 'h15-%';

  SELECT count(*) INTO ontbreekt
  FROM (
    VALUES
      ('h2_termsgewijs'::text, 'h2-3d'::text),
      ('h2_haakjes_eerst', 'h2-3d'),
      ('h2_productregel', 'h2-4a'),
      ('h2_quotientregel', 'h2-4b'),
      ('h6_machten', 'h6-2b'),
      ('h6_kettingregel', 'h6-3a'),
      ('h6_combinaties', 'h6-3b'),
      ('h7_goniometrie_diff', 'h7-5a'),
      ('h9_e_machten', 'h9-3c'),
      ('h9_logaritmes', 'h9-4b'),
      ('h15_hellingen', 'h15-1c'),
      ('h15_raakproblemen', 'h15-2a'),
      ('h15_optimaliseren', 'h15-3a')
  ) AS v(topic_slug, block_slug)
  LEFT JOIN public.topics_new t ON t.slug = v.topic_slug
  LEFT JOIN public.theory_blocks b ON b.slug = v.block_slug
  WHERE t.id IS NULL
     OR b.id IS NULL
     OR t.theory_block_id IS DISTINCT FROM b.id;

  SELECT count(*) INTO los
  FROM public.topics_new t
  JOIN public.chapters c ON c.id = t.chapter_id
  WHERE c.slug IN ('beweging', 'h16')
    AND t.theory_block_id IS NOT NULL;

  IF paragrafen <> 21 THEN
    RAISE EXCEPTION 'Er horen 21 paragrafen te staan, niet %', paragrafen;
  END IF;
  IF blokken <> 64 THEN
    RAISE EXCEPTION 'Er horen 64 theorieblokken te staan, niet %', blokken;
  END IF;
  IF ontbreekt <> 0 THEN
    RAISE EXCEPTION 'Niet alle 13 onderwerpen hangen aan het juiste theorieblok (% klopt niet)', ontbreekt;
  END IF;
  IF los <> 0 THEN
    RAISE EXCEPTION 'Beweging of examentraining hangt toch aan een theorieblok (% rijen)', los;
  END IF;
END $$;

COMMIT;
