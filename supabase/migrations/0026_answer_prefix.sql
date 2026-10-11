-- Tekst vóór het antwoordvak. Leeg (null): de oefenpagina blijft f'(x) = tonen.
-- De live opgaven staan in questions_new. De oude tabel questions
-- gebruikt de site niet meer.
ALTER TABLE public.questions_new
  ADD COLUMN IF NOT EXISTS answer_prefix text;
