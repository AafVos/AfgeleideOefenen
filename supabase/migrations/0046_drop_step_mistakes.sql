-- step_mistakes_new en de kolom is_careless op session_answers_new
-- horen bij een oud plan: de leerling zou aanklikken welke tussenstap
-- misging, of een slordigheidsfoutje aangeven. Dat scherm is er niet.
-- Geen code leest of schrijft die tabel of die kolom. De uitwerking
-- per stap (question_steps_new) blijft.
--
-- Twee keer draaien haalt niets extra weg.

DROP TABLE IF EXISTS public.step_mistakes_new;

ALTER TABLE public.session_answers_new
  DROP COLUMN IF EXISTS is_careless;
