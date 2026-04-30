import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/supabase/types'

type DB = SupabaseClient<Database>

const TOPIC_ORDER = [
  'basis',
  'somregel',
  'productregel',
  'quotientregel',
  'kettingregel',
  'goniometrie',
  'emacht',
  'lnlog',
] as const

export type DiagnosticQuestion =
  Database['public']['Tables']['questions']['Row'] & {
    topic_slug: string
  }

/** Eén representatieve vraag per topic — laagste cluster, eerst difficulty 2. */
export async function loadDiagnosticQuestions(
  db: DB,
): Promise<DiagnosticQuestion[]> {
  const out: DiagnosticQuestion[] = []

  for (const slug of TOPIC_ORDER) {
    const { data: topic } = await db
      .from('topics')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (!topic) continue

    const { data: clusters } = await db
      .from('topic_clusters')
      .select('id')
      .eq('topic_id', topic.id)
      .order('order_index')
      .limit(1)

    const clusterId = clusters?.[0]?.id
    if (!clusterId) continue

    const { data: qD2 } = await db
      .from('questions')
      .select('*')
      .eq('cluster_id', clusterId)
      .eq('difficulty', 2)
      .order('order_index', { ascending: true, nullsFirst: false })
      .limit(1)
      .maybeSingle()

    let q = qD2
    if (!q) {
      const alt = await db
        .from('questions')
        .select('*')
        .eq('cluster_id', clusterId)
        .order('difficulty')
        .limit(1)
        .maybeSingle()
      q = alt.data
    }

    if (q) {
      out.push({ ...q, topic_slug: slug })
    }
  }

  return out
}

export function diagnosticTopicOrder(): readonly string[] {
  return TOPIC_ORDER
}
