-- =============================================================================
-- Migration 0012: Fix 3 NULL-rijen in productregel / twee_veeltermen cluster
-- =============================================================================

update public.questions
set
  latex_body       = 'f(x) = (x^{2}+1)(x-2)',
  answer           = '3x^2-4x+1',
  latex_answer     = '3x^{2} - 4x + 1',
  difficulty       = 2,
  root_cause_tags  = array['productregel.formule_invullen'],
  is_ai_generated  = false
where id = '5388b8ed-dc86-45b6-b7c3-de0a603d18db';

update public.questions
set
  latex_body       = 'f(x) = (2x+3)(x^{2}-1)',
  answer           = '6x^2+6x-2',
  latex_answer     = '6x^{2} + 6x - 2',
  difficulty       = 2,
  root_cause_tags  = array['productregel.formule_invullen'],
  is_ai_generated  = false
where id = 'b0d8ccdf-8618-4948-a7ce-19ce808fe563';

update public.questions
set
  latex_body       = 'f(x) = (x^{2}-4)(x+3)',
  answer           = '3x^2+6x-4',
  latex_answer     = '3x^{2} + 6x - 4',
  difficulty       = 2,
  root_cause_tags  = array['productregel.formule_invullen'],
  is_ai_generated  = false
where id = '4a7123df-a2f5-45da-8993-400d121f96e5';
