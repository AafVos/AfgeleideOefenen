-- Alternatieve correcte antwoorden per vraag.
-- Als AI een andere correcte notatie herkent, wordt die hier opgeslagen.
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS answer_alternatives text[] NOT NULL DEFAULT '{}';
