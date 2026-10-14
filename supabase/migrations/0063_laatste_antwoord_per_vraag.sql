-- De kleur van een tegel is het laatste goed of fout van die opgave.
-- Eerder haalde de pagina alle pogingen op, in stukken van honderd
-- opgaven. Deze functie geeft per opgave alleen de nieuwste terug.
--
-- De functie loopt als de leerling zelf, dus hij ziet alleen zijn eigen
-- sessies. Twee keer draaien vervangt de functie en laat de index staan.

CREATE OR REPLACE FUNCTION public.laatste_antwoord_per_vraag()
RETURNS TABLE (question_id uuid, is_correct boolean)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT DISTINCT ON (sa.question_id)
    sa.question_id,
    sa.is_correct
  FROM public.session_answers_new AS sa
  WHERE sa.is_correct IS NOT NULL
  ORDER BY sa.question_id, sa.answered_at DESC, sa.id DESC;
$$;

REVOKE ALL ON FUNCTION public.laatste_antwoord_per_vraag() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.laatste_antwoord_per_vraag() TO authenticated;

CREATE INDEX IF NOT EXISTS session_answers_new_vraag_tijd_idx
  ON public.session_answers_new (question_id, answered_at DESC, id DESC)
  WHERE is_correct IS NOT NULL;

NOTIFY pgrst, 'reload schema';
