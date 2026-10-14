-- De kettingregel telde niemand als beheerst, terwijl een deel van de
-- leerlingen drie goede antwoorden achter elkaar had gegeven.
--
-- Twee oude regels deden dat:
--   • een misser ná die reeks zette "beheerst" weer terug naar bezig;
--   • een goed antwoord in een andere schrijfwijze werd eerst als fout
--     geteld (reeks naar 0) en daarna als goed (reeks naar 1).
-- De site doet dat nu niet meer: drie goed op rij blijft beheerst, en een
-- andere schrijfwijze telt één keer mee. Deze migratie speelt de
-- oefenantwoorden van de kettingregel opnieuw af met die huidige regel,
-- zodat de tegels kloppen met wat de leerlingen al hebben laten zien.
--
-- Alleen de kettingregel en de kettingregel gecombineerd. Een zelftoets
-- telt niet mee. Wie al beheerst is, blijft dat. Een reeks wordt niet
-- korter gezet. Twee keer draaien verandert niets meer.

BEGIN;

DO $mig$
DECLARE
  voortgang record;
  antwoord record;
  reeks int;
  beheerst boolean;
  moment timestamptz;
  bijgewerkt int := 0;
BEGIN
  FOR voortgang IN
    SELECT up.id, up.user_id, up.cluster_id, up.status, up.correct_streak, up.mastered_at
    FROM public.user_progress_new AS up
    JOIN public.topics_new AS t ON t.id = up.topic_id
    WHERE t.slug IN ('h6_kettingregel', 'h6_combinaties')
      AND up.status IS DISTINCT FROM 'mastered'
  LOOP
    reeks := 0;
    beheerst := false;
    moment := NULL;

    FOR antwoord IN
      SELECT sa.is_correct, sa.answered_at
      FROM public.session_answers_new AS sa
      JOIN public.user_sessions_new AS us ON us.id = sa.session_id
      WHERE us.user_id = voortgang.user_id
        AND us.cluster_id = voortgang.cluster_id
        AND us.session_type = 'practice'
      ORDER BY sa.answered_at, sa.id
    LOOP
      IF antwoord.is_correct IS TRUE THEN
        reeks := reeks + 1;
        IF reeks >= 3 AND NOT beheerst THEN
          beheerst := true;
          moment := antwoord.answered_at;
        END IF;
      ELSIF NOT beheerst THEN
        reeks := 0;
      END IF;
    END LOOP;

    IF beheerst OR reeks > voortgang.correct_streak THEN
      UPDATE public.user_progress_new
      SET
        status = CASE WHEN beheerst THEN 'mastered' ELSE status END,
        correct_streak = GREATEST(correct_streak, reeks),
        mastered_at = CASE
          WHEN beheerst AND mastered_at IS NULL THEN moment
          ELSE mastered_at
        END
      WHERE id = voortgang.id
        AND status IS DISTINCT FROM 'mastered';

      IF FOUND THEN
        bijgewerkt := bijgewerkt + 1;
      END IF;
    END IF;
  END LOOP;

  RAISE NOTICE 'kettingregel-voortgang bijgewerkt: %', bijgewerkt;
END
$mig$;

COMMIT;
