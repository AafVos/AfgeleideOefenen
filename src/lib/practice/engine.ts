import type { SupabaseClient } from '@supabase/supabase-js'

import { SITE } from '@/config/site'
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
    // ^(5), ^(-1), ^(x) → ^5, ^-1, ^x — alleen simpele exponenten, zodat
    // bv. e^(x+1) niet gelijk wordt aan e^x+1
    .replace(/\^\((-?\d+|-?[a-z])\)/g, '^$1')
    .replace(/x\^1\b/g, 'x')
    .replace(/\+-/g, '-')
    .replace(/−/g, '-')
    .replace(/\u2212/g, '-')
}

export function answersMatch(
  student: string,
  correct: string,
  alternatives: string[] = [],
): boolean {
  const norm = normalizeAnswer(student)
  if (norm === normalizeAnswer(correct)) return true
  return alternatives.some((alt) => norm === normalizeAnswer(alt))
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
): { topic: TopicWithClusters; cluster: ClusterWithStatus } | null
export function findActiveCluster(
  path: TopicWithClustersNew[],
): { topic: TopicWithClustersNew; cluster: ClusterWithStatusNew } | null
export function findActiveCluster(
  path: Array<{ isLocked: boolean; clusters: Array<{ status: string }> }>,
): { topic: unknown; cluster: unknown } | null {
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

/** Vrij oefenen: altijd een vraag uit het cluster als die er zijn — geen bovengrens op eerder goed tellen. */
export async function pickFreePracticeQuestion(
  db: DB,
  clusterId: string,
): Promise<Question | null> {
  const { data: cluster_questions } = await db
    .from('questions')
    .select('id, difficulty')
    .eq('cluster_id', clusterId)

  if (!cluster_questions?.length) return null

  const byDifficulty = new Map<number, typeof cluster_questions>()
  for (const q of cluster_questions) {
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
// New (_new table) types and functions
// =====================================================================

export type ClusterWithStatusNew = {
  id: string
  slug: string
  title: string
  topic_id: string
  order_index: number
  status: ProgressStatus
  correct_streak: number
}

export type TopicWithClustersNew = {
  id: string
  slug: string
  title: string
  chapter_id: string
  chapter_slug: string
  chapter_title: string
  order_index: number
  clusters: ClusterWithStatusNew[]
  isLocked: boolean
  isMastered: boolean
}

export async function loadLearningPathNew(
  db: DB,
  userId: string | null,
): Promise<TopicWithClustersNew[]> {
  const [
    { data: chapters },
    { data: topics },
    { data: clusters },
    { data: progress },
  ] = await Promise.all([
    db.from('chapters').select('id, slug, title, order_index').eq('site', SITE).order('order_index'),
    db.from('topics_new').select('id, slug, title, chapter_id, order_index, is_unlocked_by_default').eq('site', SITE).order('order_index'),
    db.from('topic_clusters_new').select('id, slug, title, topic_id, order_index').eq('site', SITE).order('order_index'),
    userId
      ? db.from('user_progress_new').select('cluster_id, status, correct_streak').eq('user_id', userId)
      : Promise.resolve({ data: [] as Array<{ cluster_id: string; status: ProgressStatus; correct_streak: number }> }),
  ])

  const chapterById = new Map((chapters ?? []).map((c) => [c.id, c]))

  const progressByCluster = new Map<string, { status: ProgressStatus; correct_streak: number }>()
  for (const p of progress ?? []) {
    progressByCluster.set(p.cluster_id, { status: p.status as ProgressStatus, correct_streak: p.correct_streak })
  }

  const clustersByTopic = new Map<string, typeof clusters>()
  for (const c of clusters ?? []) {
    const list = clustersByTopic.get(c.topic_id) ?? []
    list.push(c)
    clustersByTopic.set(c.topic_id, list)
  }

  // Sort topics by chapter order first, then by topic order within the chapter.
  // topics_new.order_index is scoped per chapter (1, 2, 3…) so a plain global
  // sort would interleave chapters with the same order_index values.
  const sortedTopics = [...(topics ?? [])].sort((a, b) => {
    const ca = chapterById.get(a.chapter_id)?.order_index ?? 999
    const cb = chapterById.get(b.chapter_id)?.order_index ?? 999
    if (ca !== cb) return ca - cb
    return a.order_index - b.order_index
  })

  const result: TopicWithClustersNew[] = []
  let previousTopicMastered = true

  for (const t of sortedTopics) {
    const chapter = chapterById.get(t.chapter_id)
    const topicClusters = clustersByTopic.get(t.id) ?? []

    const isLocked = (t.is_unlocked_by_default as boolean) ? false : !previousTopicMastered

    const withStatus: ClusterWithStatusNew[] = topicClusters.map((c) => {
      const p = progressByCluster.get(c.id)
      return {
        ...c,
        status: (p?.status ?? 'locked') as ProgressStatus,
        correct_streak: p?.correct_streak ?? 0,
      }
    })

    const isMastered =
      withStatus.length > 0 && withStatus.every((c) => c.status === 'mastered')

    result.push({
      ...t,
      chapter_id: t.chapter_id,
      chapter_slug: chapter?.slug ?? '',
      chapter_title: chapter?.title ?? '',
      clusters: withStatus,
      isLocked,
      isMastered,
    })

    previousTopicMastered = isMastered
  }

  return result
}

export async function pickNextQuestionNew(
  db: DB,
  userId: string,
  clusterId: string,
): Promise<{
  id: string
  latex_body: string | null
  answer: string
  difficulty: number
  topic_id: string
  cluster_id: string
} | null> {
  const { data: clusterQuestions } = await db
    .from('questions_new')
    .select('id, difficulty')
    .eq('cluster_id', clusterId)

  if (!clusterQuestions?.length) return null

  const questionIds = clusterQuestions.map((q) => q.id)

  // Count correct answers per question for this user via user_sessions_new join
  const { data: correctRows } = await db
    .from('session_answers_new')
    .select('question_id, user_sessions_new!inner(user_id)')
    .eq('is_correct', true)
    .eq('user_sessions_new.user_id', userId)
    .in('question_id', questionIds)
    .returns<Array<{ question_id: string; user_sessions_new: { user_id: string } | { user_id: string }[] }>>()

  const correctCount = new Map<string, number>()
  for (const row of correctRows ?? []) {
    correctCount.set(row.question_id, (correctCount.get(row.question_id) ?? 0) + 1)
  }

  const available = clusterQuestions.filter(
    (q) => (correctCount.get(q.id) ?? 0) < MAX_CORRECT_PER_QUESTION,
  )
  if (!available.length) return null

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
    .from('questions_new')
    .select('id, latex_body, answer, difficulty, topic_id, cluster_id')
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
