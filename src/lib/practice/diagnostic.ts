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
  Database['public']['Tables']['questions_new']['Row'] & {
    topic_slug: string
    topic_title: string
  }

/** Strip the chapter prefix (h2_, h3_, …) from a new-style topic slug. */
function topicSuffix(newSlug: string): string {
  return newSlug.replace(/^h\d+_/, '')
}

/** Eén representatieve vraag per topic — laagste cluster, eerst difficulty 2. */
export async function loadDiagnosticQuestions(
  db: DB,
): Promise<DiagnosticQuestion[]> {
  const out: DiagnosticQuestion[] = []

  const { data: allTopics } = await db
    .from('topics_new')
    .select('id, slug, title')

  const topicBySuffix = new Map<
    string,
    { id: string; slug: string; title: string }
  >()
  for (const tp of allTopics ?? []) {
    topicBySuffix.set(topicSuffix(tp.slug), tp)
  }

  for (const suffix of TOPIC_ORDER) {
    const topic = topicBySuffix.get(suffix)
    if (!topic) continue

    const { data: clusters } = await db
      .from('topic_clusters_new')
      .select('id')
      .eq('topic_id', topic.id)
      .order('order_index')
      .limit(1)

    const clusterId = clusters?.[0]?.id
    if (!clusterId) continue

    const { data: qD2 } = await db
      .from('questions_new')
      .select('*')
      .eq('cluster_id', clusterId)
      .eq('difficulty', 2)
      .order('order_index', { ascending: true, nullsFirst: false })
      .limit(1)
      .maybeSingle()

    let q = qD2
    if (!q) {
      const alt = await db
        .from('questions_new')
        .select('*')
        .eq('cluster_id', clusterId)
        .order('difficulty')
        .limit(1)
        .maybeSingle()
      q = alt.data
    }

    if (q) {
      out.push({ ...q, topic_slug: topic.slug, topic_title: topic.title })
    }
  }

  return out
}

export function diagnosticTopicOrder(): readonly string[] {
  return TOPIC_ORDER
}
