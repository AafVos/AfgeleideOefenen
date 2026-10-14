-- Zes antwoorden stonden als LaTeX (\tfrac en \pi). Een leerling typt
-- (1/2) en pi. Die vorm werd niet gelijk aan het opgeslagen antwoord,
-- en er stond geen andere schrijfwijze bij.
--
-- De afgeleide zelf klopt. Alleen het veld dat vergeleken wordt, wordt
-- de gewone typwijze. De formule op het scherm (latex_answer) blijft LaTeX.
--
-- Nageteld:
--   (1/2)sin(x) - 2x cos(pi/2): cos(pi/2) = 0, dus afgeleide (1/2)cos(x).
--   3 + 4 sin(2x - pi/4): 4 * cos(...) * 2 = 8 cos(2x - pi/4).
--   1 + 2 cos(3(x - pi/6)): binnenkant 3x - pi/2, keer -2 * 3 = -6 sin(3x - pi/2).
--   10 + 16 cos((1/2)(x - 1)): 16 * (-sin(...)) * (1/2) = -8 sin((1/2)(x - 1)).
--   6((1/2)x - 4)^5: 30 * (1/2) = 15((1/2)x - 4)^4.
--   ((1/2)x^2 - 2x)^3: binnenste afgeleide x - 2, dus 3(x - 2)(...)^2.
--
-- De breukknop zet (1)/(2). Die vorm, en pi/4 als (pi)/4 of (1/4)pi,
-- telt ook goed. Een eerder als fout opgeslagen goede vorm wordt
-- weer vrijgegeven.
--
-- Herhaalbaar: twee keer draaien zet hetzelfde antwoord en dezelfde vormen.

BEGIN;

-- Migratie 0051 maakt dezelfde hulpfunctie al aan, in dezelfde sessie.
CREATE OR REPLACE FUNCTION pg_temp.norm_antwoord(raw text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT replace(
    replace(
      replace(
        replace(lower(coalesce(raw, '')), ' ', ''),
        '*', ''
      ),
      '·', ''
    ),
    '−', '-'
  );
$$;

UPDATE public.questions_new AS q
SET
  answer = v.antwoord,
  answer_alternatives = (
    SELECT COALESCE(array_agg(vorm ORDER BY volgorde), '{}'::text[])
    FROM (
      SELECT vorm, min(volgorde) AS volgorde
      FROM unnest(q.answer_alternatives || v.extra)
        WITH ORDINALITY AS u(vorm, volgorde)
      WHERE vorm <> ''
        AND vorm <> v.antwoord
        AND strpos(vorm, chr(92)) = 0
      GROUP BY vorm
    ) AS uniek
  )
FROM public.topics_new AS t
JOIN public.topic_clusters_new AS c
  ON c.topic_id = t.id
JOIN (
  VALUES
    (
      'h7_goniometrie_diff',
      'basis_sin_cos',
      6,
      $b$f(x) = \tfrac{1}{2}\sin(x) - 2x\cos(\tfrac{1}{2}\pi)$b$,
      $a$(1/2)cos(x)$a$,
      $o$\tfrac{1}{2}cos(x)$o$,
      ARRAY['(1)/(2)cos(x)', '(1)/2cos(x)']::text[]
    ),
    (
      'h7_goniometrie_diff',
      'ketting_lineair',
      4,
      $b$f(x) = 3 + 4\sin(2x - \tfrac{1}{4}\pi)$b$,
      $a$8cos(2x-pi/4)$a$,
      $o$8cos(2x - \tfrac{1}{4}\pi)$o$,
      ARRAY[
        '8cos(2x-(pi)/4)',
        '8cos(2x-(1/4)pi)',
        '8cos(2x-(1)/(4)pi)',
        '8cos(2x-1/4pi)'
      ]::text[]
    ),
    (
      'h7_goniometrie_diff',
      'ketting_lineair',
      5,
      $b$g(x) = 10 + 16\cos(\tfrac{1}{2}(x - 1))$b$,
      $a$-8sin((1/2)(x-1))$a$,
      $o$-8sin(\tfrac{1}{2}(x-1))$o$,
      ARRAY['-8sin((1)/(2)(x-1))', '-8sin((1)/2(x-1))']::text[]
    ),
    (
      'h7_goniometrie_diff',
      'ketting_lineair',
      6,
      $b$f(x) = 1 + 2\cos\bigl(3(x - \tfrac{1}{6}\pi)\bigr)$b$,
      $a$-6sin(3x-pi/2)$a$,
      $o$-6sin(3x - \tfrac{1}{2}\pi)$o$,
      ARRAY[
        '-6sin(3x-(pi)/2)',
        '-6sin(3x-(1/2)pi)',
        '-6sin(3x-(1)/(2)pi)',
        '-6sin(3x-1/2pi)'
      ]::text[]
    ),
    (
      'h6_kettingregel',
      'macht_lineair',
      3,
      $b$g(x) = 6(\tfrac{1}{2}x - 4)^{5}$b$,
      $a$15((1/2)x-4)^4$a$,
      $o$15(\tfrac{1}{2}x-4)^4$o$,
      ARRAY['15((1)/(2)x-4)^4', '15((1)/2x-4)^4']::text[]
    ),
    (
      'h6_kettingregel',
      'macht_polynoom',
      6,
      $b$k(x) = (\tfrac{1}{2}x^{2} - 2x)^{3}$b$,
      $a$3(x-2)((1/2)x^2-2x)^2$a$,
      $o$3(x-2)(\tfrac{1}{2}x^2-2x)^2$o$,
      ARRAY[
        '3(x-2)((1)/(2)x^2-2x)^2',
        '3(x-2)((1)/2x^2-2x)^2'
      ]::text[]
    )
) AS v(onderwerp, soort, volgorde, lichaam, antwoord, oud, extra)
  ON t.slug = v.onderwerp
 AND c.slug = v.soort
WHERE q.topic_id = t.id
  AND q.cluster_id = c.id
  AND q.order_index = v.volgorde
  AND q.latex_body = v.lichaam;

DELETE FROM public.known_wrong_answers_new AS w
USING public.questions_new AS q
JOIN public.topics_new AS t
  ON t.id = q.topic_id
JOIN public.topic_clusters_new AS c
  ON c.id = q.cluster_id
 AND c.topic_id = t.id
JOIN (
  VALUES
    (
      'h7_goniometrie_diff',
      'basis_sin_cos',
      6,
      $b$f(x) = \tfrac{1}{2}\sin(x) - 2x\cos(\tfrac{1}{2}\pi)$b$,
      $o$\tfrac{1}{2}cos(x)$o$
    ),
    (
      'h7_goniometrie_diff',
      'ketting_lineair',
      4,
      $b$f(x) = 3 + 4\sin(2x - \tfrac{1}{4}\pi)$b$,
      $o$8cos(2x - \tfrac{1}{4}\pi)$o$
    ),
    (
      'h7_goniometrie_diff',
      'ketting_lineair',
      5,
      $b$g(x) = 10 + 16\cos(\tfrac{1}{2}(x - 1))$b$,
      $o$-8sin(\tfrac{1}{2}(x-1))$o$
    ),
    (
      'h7_goniometrie_diff',
      'ketting_lineair',
      6,
      $b$f(x) = 1 + 2\cos\bigl(3(x - \tfrac{1}{6}\pi)\bigr)$b$,
      $o$-6sin(3x - \tfrac{1}{2}\pi)$o$
    ),
    (
      'h6_kettingregel',
      'macht_lineair',
      3,
      $b$g(x) = 6(\tfrac{1}{2}x - 4)^{5}$b$,
      $o$15(\tfrac{1}{2}x-4)^4$o$
    ),
    (
      'h6_kettingregel',
      'macht_polynoom',
      6,
      $b$k(x) = (\tfrac{1}{2}x^{2} - 2x)^{3}$b$,
      $o$3(x-2)(\tfrac{1}{2}x^2-2x)^2$o$
    )
) AS v(onderwerp, soort, volgorde, lichaam, oud)
  ON t.slug = v.onderwerp
 AND c.slug = v.soort
 AND q.order_index = v.volgorde
 AND q.latex_body = v.lichaam
WHERE w.question_id = q.id
  AND pg_temp.norm_antwoord(w.wrong_answer) IN (
    SELECT pg_temp.norm_antwoord(vorm)
    FROM unnest(ARRAY[q.answer] || q.answer_alternatives || ARRAY[v.oud]) AS vorm
  );

DO $$
DECLARE
  n int;
BEGIN
  SELECT count(*) INTO n
  FROM (
    VALUES
      (
        'h7_goniometrie_diff',
        'basis_sin_cos',
        6,
        $b$f(x) = \tfrac{1}{2}\sin(x) - 2x\cos(\tfrac{1}{2}\pi)$b$,
        $a$(1/2)cos(x)$a$,
        $l$\tfrac{1}{2}\cos(x)$l$,
        ARRAY['(1)/(2)cos(x)', '(1)/2cos(x)']::text[]
      ),
      (
        'h7_goniometrie_diff',
        'ketting_lineair',
        4,
        $b$f(x) = 3 + 4\sin(2x - \tfrac{1}{4}\pi)$b$,
        $a$8cos(2x-pi/4)$a$,
        $l$8\cos(2x - \tfrac{1}{4}\pi)$l$,
        ARRAY[
          '8cos(2x-(pi)/4)',
          '8cos(2x-(1/4)pi)',
          '8cos(2x-(1)/(4)pi)',
          '8cos(2x-1/4pi)'
        ]::text[]
      ),
      (
        'h7_goniometrie_diff',
        'ketting_lineair',
        5,
        $b$g(x) = 10 + 16\cos(\tfrac{1}{2}(x - 1))$b$,
        $a$-8sin((1/2)(x-1))$a$,
        $l$-8\sin(\tfrac{1}{2}(x - 1))$l$,
        ARRAY['-8sin((1)/(2)(x-1))', '-8sin((1)/2(x-1))']::text[]
      ),
      (
        'h7_goniometrie_diff',
        'ketting_lineair',
        6,
        $b$f(x) = 1 + 2\cos\bigl(3(x - \tfrac{1}{6}\pi)\bigr)$b$,
        $a$-6sin(3x-pi/2)$a$,
        $l$-6\sin\bigl(3x - \tfrac{1}{2}\pi\bigr)$l$,
        ARRAY[
          '-6sin(3x-(pi)/2)',
          '-6sin(3x-(1/2)pi)',
          '-6sin(3x-(1)/(2)pi)',
          '-6sin(3x-1/2pi)'
        ]::text[]
      ),
      (
        'h6_kettingregel',
        'macht_lineair',
        3,
        $b$g(x) = 6(\tfrac{1}{2}x - 4)^{5}$b$,
        $a$15((1/2)x-4)^4$a$,
        $l$15(\tfrac{1}{2}x - 4)^{4}$l$,
        ARRAY['15((1)/(2)x-4)^4', '15((1)/2x-4)^4']::text[]
      ),
      (
        'h6_kettingregel',
        'macht_polynoom',
        6,
        $b$k(x) = (\tfrac{1}{2}x^{2} - 2x)^{3}$b$,
        $a$3(x-2)((1/2)x^2-2x)^2$a$,
        $l$3(x - 2)(\tfrac{1}{2}x^{2} - 2x)^{2}$l$,
        ARRAY[
          '3(x-2)((1)/(2)x^2-2x)^2',
          '3(x-2)((1)/2x^2-2x)^2'
        ]::text[]
      )
  ) AS v(onderwerp, soort, volgorde, lichaam, antwoord, latex, extra)
  JOIN public.topics_new AS t
    ON t.slug = v.onderwerp
  JOIN public.topic_clusters_new AS c
    ON c.topic_id = t.id
   AND c.slug = v.soort
  JOIN public.questions_new AS q
    ON q.topic_id = t.id
   AND q.cluster_id = c.id
   AND q.order_index = v.volgorde
   AND q.latex_body = v.lichaam
   AND q.answer = v.antwoord
   AND q.latex_answer = v.latex
   AND q.answer_alternatives @> v.extra
   AND strpos(q.answer, chr(92)) = 0;

  IF n <> 6 THEN
    RAISE EXCEPTION
      'Niet precies zes antwoorden staan als gewone typwijze (aantal %)',
      n;
  END IF;
END $$;

COMMIT;
