-- Dezelfde herstelactie als 0054, voor de onderwerpen die toen
-- buiten de kettingregel bleven:
--   machten, goniometrie, haakjes eerst, productregel, logaritmes,
--   termsgewijs, e-machten en de quotiëntregel.
--
-- Twee oude regels lieten tegels op bezig staan:
--   • een misser ná drie goede antwoorden zette "beheerst" terug;
--   • een goed antwoord in een andere schrijfwijze werd eerst als fout
--     geteld (reeks naar 0) en daarna als goed (reeks naar 1).
-- De site doet dat nu niet meer. Deze migratie speelt de oefenantwoorden
-- opnieuw af met die huidige regel.
--
-- Een zelftoets telt niet mee. Wie al beheerst is, blijft dat. Een reeks
-- wordt niet korter gezet. Twee keer draaien verandert niets meer.

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
    WHERE t.slug IN (
      'h2_haakjes_eerst',
      'h2_productregel',
      'h2_quotientregel',
      'h2_termsgewijs',
      'h6_machten',
      'h7_goniometrie_diff',
      'h9_e_machten',
      'h9_logaritmes'
    )
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

  RAISE NOTICE 'overige voortgang bijgewerkt: %', bijgewerkt;
END
$mig$;

COMMIT;
