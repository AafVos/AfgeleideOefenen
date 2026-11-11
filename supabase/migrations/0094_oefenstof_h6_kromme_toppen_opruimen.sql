-- Opruimen van een dubbele set (AFG-375): twee topics hingen allebei aan
-- theory_block h6-4d ("Kromme door toppen"): de oude `h6_kromme_toppen`
-- (migratie 0061, bestandsnaam ondanks de naam "door_toppen" — de slug erin
-- is echt `h6_kromme_toppen`/`kromme_toppen`) en de nieuwere, betere
-- `h6_kromme_door_toppen` (migratie 0065). We houden 0065 en halen 0061 weg.
--
-- Gecontroleerd dat geen code in src/ de slugs `h6_kromme_toppen` of
-- `kromme_toppen` nog gebruikt (alleen migratie 0061 zelf noemt ze).
--
-- BELANGRIJK voor wie dit draait op de echte database (regelboek 6: eerst
-- een reservekopie bij alles wat weghaalt):
--   * `topics_new`, `topic_clusters_new`, `questions_new` en
--     `question_steps_new` hebben hier maar een paar rijen voor nodig
--     (topic `h6_kromme_toppen`): een gewone `pg_dump -Fc -t` per tabel kan.
--   * De DELETE op `topics_new` cascadeert (ON DELETE CASCADE) ook naar
--     `user_progress_new`, `session_answers_new`, `step_mistakes_new`,
--     `question_flags_new`, `known_wrong_answers_new` en
--     `custom_test_questions` — tabellen met echte leerlinggegevens, en
--     `session_answers_new` is groot. Maak daarvan GEEN volledige
--     tabel-dump, maar een kleine, op de weg te verwijderen vragen
--     gefilterde kopie, bijvoorbeeld:
--       psql "$AFG_DB_URL" -c "\copy (
--         select sa.* from public.session_answers_new sa
--         join public.questions_new q on q.id = sa.question_id
--         join public.topic_clusters_new c on c.id = q.cluster_id
--         join public.topics_new t on t.id = c.topic_id
--         where t.slug = 'h6_kromme_toppen'
--       ) to 'session_answers_h6_kromme_toppen.csv' csv header"
--     en hetzelfde patroon voor de andere cascade-tabellen hierboven.
--
-- Herhaalbaar: de tweede keer draaien verwijdert gewoon niets meer (de rij
-- bestaat dan al niet meer).

BEGIN;

DELETE FROM public.topics_new
WHERE slug = 'h6_kromme_toppen';

DO $$
DECLARE
  oud_bestaat boolean;
  nieuw_aantal int;
  nieuw_blok text;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.topics_new WHERE slug = 'h6_kromme_toppen'
  ) INTO oud_bestaat;

  IF oud_bestaat THEN
    RAISE EXCEPTION 'h6_kromme_toppen bestaat nog na het opruimen';
  END IF;

  SELECT count(*) INTO nieuw_aantal
  FROM public.questions_new q
  JOIN public.topic_clusters_new c ON c.id = q.cluster_id
  JOIN public.topics_new t ON t.id = c.topic_id
  WHERE t.slug = 'h6_kromme_door_toppen'
    AND c.slug = 'kromme_door_toppen';

  SELECT b.slug INTO nieuw_blok
  FROM public.topics_new t
  JOIN public.theory_blocks b ON b.id = t.theory_block_id
  WHERE t.slug = 'h6_kromme_door_toppen';

  IF nieuw_aantal <> 8 OR nieuw_blok IS DISTINCT FROM 'h6-4d' THEN
    RAISE EXCEPTION 'h6_kromme_door_toppen (de set die moest blijven) klopt niet meer: % vragen, blok %',
      nieuw_aantal, nieuw_blok;
  END IF;
END $$;

COMMIT;
