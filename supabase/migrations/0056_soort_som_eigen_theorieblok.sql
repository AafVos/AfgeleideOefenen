-- Een onderwerp hangt aan één theorieblok. Sommige soorten sommen
-- horen bij een blok ernaast. Die krijgen hier hun eigen blok.
-- Ontbreekt dat, dan blijft de soort aan het blok van het onderwerp
-- hangen. Opgaven en voortgang blijven staan.
--
-- Twee keer draaien verandert niets en voegt niets dubbel toe.
-- Ontbreekt een genoemde soort of een blok, dan stopt dit bestand.

BEGIN;

ALTER TABLE public.topic_clusters_new
  ADD COLUMN IF NOT EXISTS theory_block_id uuid REFERENCES public.theory_blocks (id);

CREATE INDEX IF NOT EXISTS topic_clusters_new_theory_block_id_idx
  ON public.topic_clusters_new (theory_block_id);

UPDATE public.topic_clusters_new AS c
SET theory_block_id = b.id
FROM (
  VALUES
    -- 15.1 B Buigpunten. De rest van hellingen blijft aan 15.1 C.
    ('h15_hellingen'::text, 'x_buigpunt'::text, 'h15-1b'::text),
    ('h15_hellingen', 'parameter_bij_buigpunt', 'h15-1b'),
    -- 15.2 B en C. De hoek tussen twee grafieken blijft aan 15.2 A.
    ('h15_raakproblemen', 'grafieken_raken', 'h15-2b'),
    ('h15_raakproblemen', 'loodrecht_snijden', 'h15-2c'),
    -- 2.4 E Snelheid en afgeleide. De andere soorten van termsgewijs
    -- blijven aan 2.3 D.
    ('h2_termsgewijs', 'snelheid', 'h2-4e'),
    -- 9.3 A De afgeleide van f(x) = a^x. De logaritmes blijven aan 9.4 B.
    ('h9_logaritmes', 'basis_gx_glog', 'h9-3a')
) AS v(topic_slug, cluster_slug, block_slug)
JOIN public.topics_new t ON t.slug = v.topic_slug
JOIN public.theory_blocks b ON b.slug = v.block_slug
WHERE c.topic_id = t.id
  AND c.slug = v.cluster_slug
  AND c.theory_block_id IS DISTINCT FROM b.id;

DO $$
DECLARE
  klopt int;
  verkeerd_hoofdstuk int;
BEGIN
  SELECT count(*) INTO klopt
  FROM (
    VALUES
      ('h15_hellingen'::text, 'x_buigpunt'::text, 'h15-1b'::text),
      ('h15_hellingen', 'parameter_bij_buigpunt', 'h15-1b'),
      ('h15_raakproblemen', 'grafieken_raken', 'h15-2b'),
      ('h15_raakproblemen', 'loodrecht_snijden', 'h15-2c'),
      ('h2_termsgewijs', 'snelheid', 'h2-4e'),
      ('h9_logaritmes', 'basis_gx_glog', 'h9-3a')
  ) AS v(topic_slug, cluster_slug, block_slug)
  JOIN public.topics_new t ON t.slug = v.topic_slug
  JOIN public.topic_clusters_new c
    ON c.topic_id = t.id AND c.slug = v.cluster_slug
  JOIN public.theory_blocks b ON b.slug = v.block_slug
  WHERE c.theory_block_id = b.id;

  IF klopt <> 6 THEN
    RAISE EXCEPTION 'Niet alle 6 soorten hangen aan hun eigen blok (% klopt)', klopt;
  END IF;

  SELECT count(*) INTO verkeerd_hoofdstuk
  FROM public.topic_clusters_new c
  JOIN public.topics_new t ON t.id = c.topic_id
  JOIN public.theory_blocks b ON b.id = c.theory_block_id
  JOIN public.paragraphs p ON p.id = b.paragraph_id
  WHERE c.theory_block_id IS NOT NULL
    AND p.chapter_id IS DISTINCT FROM t.chapter_id;

  IF verkeerd_hoofdstuk <> 0 THEN
    RAISE EXCEPTION 'Een soort som hangt aan een blok in een ander hoofdstuk (% rijen)', verkeerd_hoofdstuk;
  END IF;
END $$;

COMMIT;
