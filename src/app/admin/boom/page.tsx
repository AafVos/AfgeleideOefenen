import { SITE } from '@/config/site'
import { createClient } from '@/lib/supabase/server'

import { BoomEditor } from './boom-editor'

export default async function BoomPage() {
  const supabase = await createClient()

  const [{ data: nodes }, { data: koppelingen }, { data: vragen }] =
    await Promise.all([
      supabase
        .from('beslisboom_nodes')
        .select('id, parent_id, label, vraag, stappen, order_index')
        .eq('site', SITE)
        .order('order_index'),
      supabase.from('beslisboom_node_vragen').select('node_id, exam_question_id'),
      supabase
        .from('exam_questions')
        .select('id, bron_type, jaar, tijdvak, paragraaf, onderdeel, nummer, onderwerp, vraag')
        .eq('site', SITE)
        .order('bron_type')
        .order('jaar', { ascending: false })
        .order('tijdvak')
        .order('paragraaf')
        .order('nummer')
        .order('onderdeel'),
    ])

  return (
    <BoomEditor
      nodes={nodes ?? []}
      koppelingen={koppelingen ?? []}
      vragen={vragen ?? []}
    />
  )
}
