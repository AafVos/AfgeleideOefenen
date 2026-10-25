-- Vervolg op 0058: nog een paar LaTeX-restjes in answer/answer_alternatives
-- die normalizeAnswer (src/lib/practice/engine.ts) niet opvangt.
--
-- normalizeAnswer zet ^(...) (ronde haakjes) om naar een kale exponent,
-- maar niet ^{...} (accolades): die blijven letterlijk staan. En \cdot
-- wordt alleen tussen twee cijfers een ×; staat er een haakje of letter
-- naast, dan blijft de \cdot letterlijk staan.
--
-- In elk geval hieronder staat er al een werkend alternatief naast (soms
-- de paren-vorm van hetzelfde antwoord, soms een volledig uitgewerkte
-- vorm), dus geen leerling loopt hier nu op vast. Dit is opschonen:
-- de accolade-vorm vervalt als er al een paren-vorm in de lijst staat
-- (anders wordt hij een dubbele vermelding), en \cdot wordt *, zoals
-- elders in de oefenstof al getypt wordt (bijvoorbeeld "((x+4)*3-(3x-2))").
--
-- Herhaalbaar: elke UPDATE matcht op de huidige (nog kapotte) waarde, dus
-- een tweede keer draaien vindt niets meer en verandert niets.

BEGIN;

-- 1. h9, emacht_in_een_verhaal: "Ne^{-1}" naast de al werkende "Ne^(-1)".
UPDATE public.questions_new AS q
SET answer_alternatives = v.nieuw
FROM public.topics_new AS t
JOIN public.topic_clusters_new AS c
  ON c.topic_id = t.id
JOIN (
  VALUES
    (2, ARRAY['8e^{-1}', '8e^(-1)', '(8)/e', '(8)/(e)'], ARRAY['8e^(-1)', '(8)/e', '(8)/(e)']),
    (4, ARRAY['15e^{-1}', '15e^(-1)', '(15)/e', '(15)/(e)'], ARRAY['15e^(-1)', '(15)/e', '(15)/(e)']),
    (6, ARRAY['10e^{-1}', '10e^(-1)', '(10)/e', '(10)/(e)'], ARRAY['10e^(-1)', '(10)/e', '(10)/(e)']),
    (8, ARRAY['24e^{-1}', '24e^(-1)', '(24)/e', '(24)/(e)'], ARRAY['24e^(-1)', '(24)/e', '(24)/(e)'])
) AS v(order_index, oud, nieuw)
  ON true
WHERE t.slug = 'h9_e_machten'
  AND c.slug = 'emacht_in_een_verhaal'
  AND q.topic_id = t.id
  AND q.cluster_id = c.id
  AND q.order_index = v.order_index
  AND q.answer_alternatives = v.oud;

-- 2. h15, waarde_van_de_top #6: "2e^{-1}" en "W=2e^{-1}".
UPDATE public.questions_new AS q
SET answer_alternatives = ARRAY[
  '2e^(-1)', '(2)/e', '(2)/(e)', 'W=2/e', 'W=(2)/(e)', 'W=2e^(-1)'
]
FROM public.topics_new AS t
JOIN public.topic_clusters_new AS c
  ON c.topic_id = t.id
WHERE t.slug = 'h15_hellingen'
  AND c.slug = 'waarde_van_de_top'
  AND q.topic_id = t.id
  AND q.cluster_id = c.id
  AND q.order_index = 6
  AND q.answer_alternatives = ARRAY[
    '2e^{-1}', '2e^(-1)', '(2)/e', '(2)/(e)', 'W=2/e', 'W=(2)/(e)', 'W=2e^{-1}'
  ];

-- 3. h15, voorraad #7 en #8.
UPDATE public.questions_new AS q
SET answer_alternatives = v.nieuw
FROM public.topics_new AS t
JOIN public.topic_clusters_new AS c
  ON c.topic_id = t.id
JOIN (
  VALUES
    (
      7,
      ARRAY[
        '20e^{-1}', '20e^(-1)', '(20)/e', '(20)/(e)', 'V=20/e',
        'V=20e^{-1}', 'V=20e^(-1)', 'V=(20)/e', 'V=(20)/(e)'
      ],
      ARRAY[
        '20e^(-1)', '(20)/e', '(20)/(e)', 'V=20/e',
        'V=20e^(-1)', 'V=(20)/e', 'V=(20)/(e)'
      ]
    ),
    (
      8,
      ARRAY[
        '24/e^{2}', '24e^{-2}', '24e^(-2)', '(24)/e^2', '(24)/(e^2)',
        'V=24/e^2', 'V=24/e^{2}', 'V=24e^{-2}', 'V=24e^(-2)', 'V=(24)/e^2'
      ],
      ARRAY[
        '24/e^(2)', '24e^(-2)', '(24)/e^2', '(24)/(e^2)',
        'V=24/e^2', 'V=24/e^(2)', 'V=24e^(-2)', 'V=(24)/e^2'
      ]
    )
) AS v(order_index, oud, nieuw)
  ON true
WHERE t.slug = 'h15_optimaliseren'
  AND c.slug = 'voorraad'
  AND q.topic_id = t.id
  AND q.cluster_id = c.id
  AND q.order_index = v.order_index
  AND q.answer_alternatives = v.oud;

-- 4. h16, vijf plekken met "^{...}" in plaats van "^(...)".
UPDATE public.questions_new AS q
SET answer_alternatives = v.nieuw
FROM public.topics_new AS t
JOIN public.topic_clusters_new AS c
  ON c.topic_id = t.id
JOIN (
  VALUES
    (
      'helling_in_een_punt', 5,
      ARRAY['3e^{1}', 'e*3', '3e^(1)', '3*e'],
      ARRAY['3e^(1)', 'e*3', '3*e']
    ),
    (
      'raaklijn', 7,
      ARRAY[
        '(1/e)x', 'x*e^{-1}', 'y = x/e', '(x)/(e)', '(x)/e',
        'y=(1/e)x', 'y=x*e^{-1}', 'y=(x)/(e)', 'y=(x)/e'
      ],
      ARRAY[
        '(1/e)x', 'x*e^(-1)', 'y = x/e', '(x)/(e)', '(x)/e',
        'y=(1/e)x', 'y=x*e^(-1)', 'y=(x)/(e)', 'y=(x)/e'
      ]
    ),
    (
      'top', 8,
      ARRAY['√2', '2^{1/2}', '2^(1/2)'],
      ARRAY['√2', '2^(1/2)']
    ),
    (
      'kleinste_of_grootste', 5,
      ARRAY['3e^{-1}', '3e^(-1)', '(3)/e', '(3)/(e)'],
      ARRAY['3e^(-1)', '(3)/e', '(3)/(e)']
    ),
    (
      'kleinste_of_grootste', 8,
      ARRAY['e^{-2}', 'e^(-2)', '1/e^{2}', '(1)/(e^2)', '(1)/(e^{2})'],
      ARRAY['e^(-2)', '1/e^(2)', '(1)/(e^2)']
    )
) AS v(cluster_slug, order_index, oud, nieuw)
  ON true
WHERE t.slug = 'h16_examentraining'
  AND c.slug = v.cluster_slug
  AND q.topic_id = t.id
  AND q.cluster_id = c.id
  AND q.order_index = v.order_index
  AND q.answer_alternatives = v.oud;

-- 5. h2: \cdot naast een haakje in het answer-veld zelf (niet tussen twee
-- cijfers, dus normalizeAnswer laat hem staan). Beide hebben al een
-- volledig uitgewerkt alternatief dat wel werkt.
UPDATE public.questions_new AS q
SET answer = '2*(4x + 1)(2x^2 + x)'
FROM public.topics_new AS t
JOIN public.topic_clusters_new AS c
  ON c.topic_id = t.id
WHERE t.slug = 'h2_productregel'
  AND c.slug = 'kwadraat_van_polynoom'
  AND q.topic_id = t.id
  AND q.cluster_id = c.id
  AND q.order_index = 8
  AND q.answer = '2 \cdot (4x + 1)(2x^{2} + x)';

UPDATE public.questions_new AS q
SET answer = '(2x(x^2 - 2) - (x^2 + 1)*2x)/(x^2 - 2)^2',
    answer_alternatives = ARRAY[
      '-6x/(x^2 - 2)^2', '(2x(x² - 2) - (x² + 1)*2x)/(x² - 2)²'
    ]
FROM public.topics_new AS t
JOIN public.topic_clusters_new AS c
  ON c.topic_id = t.id
WHERE t.slug = 'h2_quotientregel'
  AND c.slug = 'polynoom_breuk'
  AND q.topic_id = t.id
  AND q.cluster_id = c.id
  AND q.order_index = 8
  AND q.answer = '(2x(x^2 - 2) - (x^2 + 1) \cdot 2x)/(x^2 - 2)^2'
  AND q.answer_alternatives = ARRAY[
    '-6x/(x^2 - 2)^2', '(2x(x² - 2) - (x² + 1) \cdot 2x)/(x² - 2)²'
  ];

DO $$
DECLARE
  n int;
BEGIN
  SELECT count(*) INTO n
  FROM public.questions_new AS q
  JOIN public.topics_new AS t ON t.id = q.topic_id
  JOIN public.topic_clusters_new AS c ON c.id = q.cluster_id
  WHERE (t.slug, c.slug, q.order_index) IN (
    ('h9_e_machten', 'emacht_in_een_verhaal', 2),
    ('h9_e_machten', 'emacht_in_een_verhaal', 4),
    ('h9_e_machten', 'emacht_in_een_verhaal', 6),
    ('h9_e_machten', 'emacht_in_een_verhaal', 8),
    ('h15_hellingen', 'waarde_van_de_top', 6),
    ('h15_optimaliseren', 'voorraad', 7),
    ('h15_optimaliseren', 'voorraad', 8),
    ('h16_examentraining', 'helling_in_een_punt', 5),
    ('h16_examentraining', 'raaklijn', 7),
    ('h16_examentraining', 'top', 8),
    ('h16_examentraining', 'kleinste_of_grootste', 5),
    ('h16_examentraining', 'kleinste_of_grootste', 8),
    ('h2_productregel', 'kwadraat_van_polynoom', 8),
    ('h2_quotientregel', 'polynoom_breuk', 8)
  )
  AND (
    array_to_string(q.answer_alternatives, '|') ~ '[{}]'
    OR q.answer ~ '[{}]'
    OR strpos(array_to_string(q.answer_alternatives, ''), chr(92)) > 0
    OR strpos(q.answer, chr(92)) > 0
  );

  IF n <> 0 THEN
    RAISE EXCEPTION 'Er staan nog % vragen met een LaTeX-restje in answer/answer_alternatives', n;
  END IF;
END $$;

COMMIT;
