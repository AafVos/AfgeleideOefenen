import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database, ProgressStatus } from '@/lib/supabase/types'

export const MASTERY_THRESHOLD = 3
export const MAX_CORRECT_PER_QUESTION = 3

type DB = SupabaseClient<Database>

export type Topic = Database['public']['Tables']['topics']['Row']
export type Cluster = Database['public']['Tables']['topic_clusters']['Row']
export type Question = Database['public']['Tables']['questions']['Row']
export type Progress = Database['public']['Tables']['user_progress']['Row']

export type ClusterWithStatus = Cluster & {
  status: ProgressStatus
  correct_streak: number
}

export type TopicWithClusters = Topic & {
  clusters: ClusterWithStatus[]
  isLocked: boolean
  isMastered: boolean
}

// =====================================================================
// Normalisatie (sectie 5.3)
// =====================================================================
export function normalizeAnswer(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/\*/g, '')
    .replace(/·/g, '')
    .replace(/x\^1\b/g, 'x')
    .replace(/\+-/g, '-')
    .replace(/−/g, '-')
    .replace(/\u2212/g, '-')
}

export function answersMatch(student: string, correct: string): boolean {
  return normalizeAnswer(student) === normalizeAnswer(correct)
}

// =====================================================================
// Leerlijn berekenen
// =====================================================================
export async function loadLearningPath(
  db: DB,
  userId: string | null,
): Promise<TopicWithClusters[]> {
  const [{ data: topics }, { data: clusters }, { data: progress }] =
    await Promise.all([
      db.from('topics').select('*').order('order_index'),
      db.from('topic_clusters').select('*').order('order_index'),
      userId
        ? db.from('user_progress').select('*').eq('user_id', userId)
        : Promise.resolve({ data: [] as Progress[] }),
    ])

  const progressByCluster = new Map<string, Progress>()
  for (const p of progress ?? []) progressByCluster.set(p.cluster_id, p)

  const clustersByTopic = new Map<string, Cluster[]>()
  for (const c of clusters ?? []) {
    const list = clustersByTopic.get(c.topic_id) ?? []
    list.push(c)
    clustersByTopic.set(c.topic_id, list)
  }

  const result: TopicWithClusters[] = []
  let previousTopicMastered = true

  for (const t of topics ?? []) {
    const topicClusters = clustersByTopic.get(t.id) ?? []

    // Topic 1 altijd ontgrendeld als is_unlocked_by_default, anders
    // ontgrendelen zodra het vorige topic volledig gemasterd is.
    const isLocked = t.is_unlocked_by_default ? false : !previousTopicMastered

    const withStatus: ClusterWithStatus[] = topicClusters.map((c) => {
      const p = progressByCluster.get(c.id)
      return {
        ...c,
        status: p?.status ?? 'locked',
        correct_streak: p?.correct_streak ?? 0,
      }
    })

    const isMastered =
      withStatus.length > 0 && withStatus.every((c) => c.status === 'mastered')

    result.push({ ...t, clusters: withStatus, isLocked, isMastered })
    previousTopicMastered = isMastered
  }

  return result
}

// =====================================================================
// Actief cluster bepalen
// =====================================================================
export function findActiveCluster(
  path: TopicWithClusters[],
): { topic: TopicWithClusters; cluster: ClusterWithStatus } | null {
  for (const topic of path) {
    if (topic.isLocked) return null
    for (const cluster of topic.clusters) {
      if (cluster.status !== 'mastered') {
        return { topic, cluster }
      }
    }
  }
  return null
}

// =====================================================================
// Volgende vraag kiezen (sectie 5.2)
// =====================================================================
export async function pickNextQuestion(
  db: DB,
  userId: string,
  clusterId: string,
): Promise<Question | null> {
  // Welke vragen in dit cluster heeft de student al 3x goed?
  const { data: cluster_questions } = await db
    .from('questions')
    .select('id, difficulty')
    .eq('cluster_id', clusterId)

  if (!cluster_questions?.length) return null

  const questionIds = cluster_questions.map((q) => q.id)

  const { data: mastered } = await db
    .from('session_answers')
    .select('question_id, is_correct, user_sessions!inner(user_id)')
    .eq('is_correct', true)
    .eq('user_sessions.user_id', userId)
    .in('question_id', questionIds)
    .returns<
      Array<{
        question_id: string
        is_correct: boolean | null
        user_sessions: { user_id: string } | { user_id: string }[]
      }>
    >()

  const correctCount = new Map<string, number>()
  for (const row of mastered ?? []) {
    correctCount.set(
      row.question_id,
      (correctCount.get(row.question_id) ?? 0) + 1,
    )
  }

  const available = cluster_questions.filter(
    (q) => (correctCount.get(q.id) ?? 0) < MAX_CORRECT_PER_QUESTION,
  )

  if (!available.length) return null

  // Kies laagste moeilijkheid met beschikbare vragen, dan random.
  const byDifficulty = new Map<number, typeof available>()
  for (const q of available) {
    const list = byDifficulty.get(q.difficulty) ?? []
    list.push(q)
    byDifficulty.set(q.difficulty, list)
  }

  const lowestDifficulty = [...byDifficulty.keys()].sort((a, b) => a - b)[0]
  const pool = byDifficulty.get(lowestDifficulty)!
  const chosen = pool[Math.floor(Math.random() * pool.length)]

  const { data: fullQuestion } = await db
    .from('questions')
    .select('*')
    .eq('id', chosen.id)
    .maybeSingle()

  return fullQuestion ?? null
}

// =====================================================================
// Sessie ophalen of aanmaken (per cluster, open sessie van <24u)
// =====================================================================
export async function getOrCreateSession(
  db: DB,
  userId: string,
  topicId: string,
  clusterId: string,
): Promise<string> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: existing } = await db
    .from('user_sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('cluster_id', clusterId)
    .is('ended_at', null)
    .gte('started_at', since)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) return existing.id

  const { data: created, error } = await db
    .from('user_sessions')
    .insert({
      user_id: userId,
      topic_id: topicId,
      cluster_id: clusterId,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return created.id
}
