-- =============================================================================
-- Migration 0030: Beslisboom voor vraagtypes
-- =============================================================================
-- Een boom die van "wat vragen ze?" (wortelknoop, bv. "Ze vragen de raaklijn")
-- via keuzevragen ("Wat is er gegeven?") naar eindknopen met het exacte
-- stappenplan leidt.
--
--   • label   = de keuze/tak-tekst waarmee je vanaf de ouder hier komt
--               (voor een wortelknoop: de naam van het vraagtype)
--   • vraag   = de vervolgvraag in deze knoop (alleen bij tussenknopen)
--   • stappen = het exacte stappenplan (alleen bij eindknopen)
--
-- Examenvragen kunnen aan knopen gekoppeld worden (beslisboom_node_vragen),
-- zodat je systematisch alle vragen kunt indelen en per eindknoop voorbeelden
-- hebt. Wordt beheerd vanuit /admin/boom; gaat later naar de site.
-- =============================================================================

BEGIN;

CREATE TABLE public.beslisboom_nodes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site        text NOT NULL DEFAULT 'afgeleiden'
              CHECK (site IN ('afgeleiden', 'integralen')),
  parent_id   uuid REFERENCES public.beslisboom_nodes(id) ON DELETE CASCADE,
  label       text NOT NULL,
  vraag       text,
  stappen     text[] NOT NULL DEFAULT '{}',
  order_index int  NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX beslisboom_nodes_parent_idx
  ON public.beslisboom_nodes (site, parent_id, order_index);

CREATE TABLE public.beslisboom_node_vragen (
  node_id          uuid NOT NULL REFERENCES public.beslisboom_nodes(id) ON DELETE CASCADE,
  exam_question_id uuid NOT NULL REFERENCES public.exam_questions(id)   ON DELETE CASCADE,
  PRIMARY KEY (node_id, exam_question_id)
);

ALTER TABLE public.beslisboom_nodes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beslisboom_node_vragen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_beslisboom_nodes"        ON public.beslisboom_nodes;
DROP POLICY IF EXISTS "write_beslisboom_nodes"       ON public.beslisboom_nodes;
DROP POLICY IF EXISTS "read_beslisboom_node_vragen"  ON public.beslisboom_node_vragen;
DROP POLICY IF EXISTS "write_beslisboom_node_vragen" ON public.beslisboom_node_vragen;

CREATE POLICY "read_beslisboom_nodes" ON public.beslisboom_nodes
  FOR SELECT USING (true);

CREATE POLICY "write_beslisboom_nodes" ON public.beslisboom_nodes
  FOR ALL
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "read_beslisboom_node_vragen" ON public.beslisboom_node_vragen
  FOR SELECT USING (true);

CREATE POLICY "write_beslisboom_node_vragen" ON public.beslisboom_node_vragen
  FOR ALL
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

COMMIT;
