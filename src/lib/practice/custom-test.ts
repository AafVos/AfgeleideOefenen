/**
 * Custom self-test ("zelf-toets") — data loading + question picking.
 *
 * Actions live in src/app/[locale]/zelf-toets/actions.ts.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/supabase/types'

type DB = SupabaseClient<Database>

export type QuestionSource = 'new' | 'all' | 'wrong'

export type ConfigChapter = {
  id: string
  slug: string
  title: string
  order_index: number
}

export type ConfigTopic = {
  id: string
  slug: string
  title: string
  chapter_id: string
  order_index: number
}

export type ConfigCluster = {
  id: string
  slug: string
  title: string
  topic_id: string
  order_index: number
  questionCount: number
  newCount: number
  wrongCount: number
}

export type ConfigData = {
  chapters: ConfigChapter[]
  topics: ConfigTopic[]
  clusters: ConfigCluster[]
}

export async function loadConfigData(db: DB, userId: string): Promise<ConfigData> {
  const [{ data: chapters }, { data: topics }, { data: clusters }, { data: questions }] =
    await Promise.all([
      db
        .from('chapters')
        .select('id, slug, title, order_index')
        .order('order_index'),
      db
        .from('topics_new')
        .select('id, slug, title, chapter_id, order_index')
        .order('order_index'),
      db
        .from('topic_clusters_new')
        .select('id, slug, title, topic_id, order_index')
        .order('order_index'),
      db
        .from('questions_new')
        .select('id, cluster_id'),
    ])

  // Build cluster → question IDs map
  const questionsByCluster = new Map<string, string[]>()
  for (const q of questions ?? []) {
    const arr = questionsByCluster.get(q.cluster_id) ?? []
    arr.push(q.id)
    questionsByCluster.set(q.cluster_id, arr)
  }

  // Load user's session IDs to derive answered/wrong question IDs
  const { data: sessions } = await db
    .from('user_sessions_new')
    .select('id')
    .eq('user_id', userId)
  const sessionIds = (sessions ?? []).map((s) => s.id)

  const answeredIds = new Set<string>()
  const wrongIds = new Set<string>()
  if (sessionIds.length > 0) {
    const { data: answers } = await db
      .from('session_answers_new')
      .select('question_id, is_correct')
      .in('session_id', sessionIds)
    for (const a of answers ?? []) {
      answeredIds.add(a.question_id)
      if (a.is_correct === false) wrongIds.add(a.question_id)
    }
  }

  const enrichedClusters: ConfigCluster[] = (clusters ?? []).map((c) => {
    const qIds = questionsByCluster.get(c.id) ?? []
    let newCount = 0
    let wrongCount = 0
    for (const qid of qIds) {
      if (!answeredIds.has(qid)) newCount++
      if (wrongIds.has(qid)) wrongCount++
    }
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      topic_id: c.topic_id,
      order_index: c.order_index,
      questionCount: qIds.length,
      newCount,
      wrongCount,
    }
  })

  return {
    chapters: (chapters ?? []) as ConfigChapter[],
    topics: (topics ?? []) as ConfigTopic[],
    clusters: enrichedClusters,
  }
}

/**
 * Pick `count` random question IDs from `clusterIds`, filtered by source.
 * Returns null on no available questions.
 */
export async function pickQuestionsForTest(
  db: DB,
  userId: string,
  clusterIds: string[],
  source: QuestionSource,
  count: number,
): Promise<string[]> {
  if (clusterIds.length === 0 || count <= 0) return []

  const { data: questions } = await db
    .from('questions_new')
    .select('id, cluster_id')
    .in('cluster_id', clusterIds)

  let pool = (questions ?? []).map((q) => q.id)
  if (pool.length === 0) return []

  if (source !== 'all') {
    const { data: sessions } = await db
      .from('user_sessions_new')
      .select('id')
      .eq('user_id', userId)
    const sessionIds = (sessions ?? []).map((s) => s.id)

    const answeredIds = new Set<string>()
    const wrongIds = new Set<string>()

    if (sessionIds.length > 0) {
      const { data: answers } = await db
        .from('session_answers_new')
        .select('question_id, is_correct')
        .in('session_id', sessionIds)
      for (const a of answers ?? []) {
        answeredIds.add(a.question_id)
        if (a.is_correct === false) wrongIds.add(a.question_id)
      }
    }

    if (source === 'new') pool = pool.filter((id) => !answeredIds.has(id))
    else if (source === 'wrong') pool = pool.filter((id) => wrongIds.has(id))
  }

  // Fisher–Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j]!, pool[i]!]
  }

  return pool.slice(0, count)
}

export type TestSessionState = {
  sessionId: string
  totalCount: number
  answeredCount: number
  ended: boolean
  showAnswers: 'immediate' | 'end'
  /** First unanswered question id, or null when all done */
  nextQuestionId: string | null
  /** 1-based ordinal of the next question */
  nextOrdinal: number | null
}

export async function loadTestSessionState(
  db: DB,
  userId: string,
  sessionId: string,
): Promise<TestSessionState | null> {
  const { data: session } = await db
    .from('user_sessions_new')
    .select('id, user_id, kind, ended_at, show_answers')
    .eq('id', sessionId)
    .maybeSingle()
  if (!session || session.user_id !== userId || session.kind !== 'custom_test') {
    return null
  }

  const { data: questions } = await db
    .from('custom_test_questions')
    .select('question_id, order_index')
    .eq('session_id', sessionId)
    .order('order_index')

  const { data: answers } = await db
    .from('session_answers_new')
    .select('question_id')
    .eq('session_id', sessionId)

  const answeredIds = new Set((answers ?? []).map((a) => a.question_id))
  const totalCount = (questions ?? []).length
  const answeredCount = (questions ?? []).filter((q) => answeredIds.has(q.question_id)).length

  const nextEntry = (questions ?? []).find((q) => !answeredIds.has(q.question_id))

  return {
    sessionId,
    totalCount,
    answeredCount,
    ended: session.ended_at != null,
    showAnswers: (session.show_answers as 'immediate' | 'end') ?? 'immediate',
    nextQuestionId: nextEntry?.question_id ?? null,
    nextOrdinal: nextEntry ? nextEntry.order_index + 1 : null,
  }
}

export type ResultBreakdown = {
  totalCount: number
  correctCount: number
  perCluster: Array<{
    clusterId: string
    clusterTitle: string
    topicTitle: string
    chapterSlug: string
    topicSlug: string
    clusterSlug: string
    total: number
    correct: number
    items: Array<{
      questionId: string
      latexBody: string | null
      userAnswer: string | null
      correctAnswer: string
      latexAnswer: string | null
      isCorrect: boolean
    }>
  }>
}

export async function loadTestResults(
  db: DB,
  userId: string,
  sessionId: string,
): Promise<ResultBreakdown | null> {
  const { data: session } = await db
    .from('user_sessions_new')
    .select('id, user_id, kind')
    .eq('id', sessionId)
    .maybeSingle()
  if (!session || session.user_id !== userId || session.kind !== 'custom_test') {
    return null
  }

  const { data: testQuestions } = await db
    .from('custom_test_questions')
    .select('question_id, order_index')
    .eq('session_id', sessionId)
    .order('order_index')

  const questionIds = (testQuestions ?? []).map((q) => q.question_id)
  if (questionIds.length === 0) {
    return { totalCount: 0, correctCount: 0, perCluster: [] }
  }

  const [{ data: questions }, { data: answers }] = await Promise.all([
    db
      .from('questions_new')
      .select('id, cluster_id, latex_body, answer, latex_answer')
      .in('id', questionIds),
    db
      .from('session_answers_new')
      .select('question_id, user_answer, is_correct')
      .eq('session_id', sessionId),
  ])

  const clusterIds = Array.from(
    new Set((questions ?? []).map((q) => q.cluster_id)),
  )

  const { data: clusters } = await db
    .from('topic_clusters_new')
    .select('id, slug, title, topic_id')
    .in('id', clusterIds.length ? clusterIds : ['__none__'])

  const topicIds = Array.from(new Set((clusters ?? []).map((c) => c.topic_id)))
  const { data: topics } = await db
    .from('topics_new')
    .select('id, slug, title, chapter_id')
    .in('id', topicIds.length ? topicIds : ['__none__'])

  const chapterIds = Array.from(new Set((topics ?? []).map((t) => t.chapter_id)))
  const { data: chapters } = await db
    .from('chapters')
    .select('id, slug')
    .in('id', chapterIds.length ? chapterIds : ['__none__'])

  const clusterById = new Map((clusters ?? []).map((c) => [c.id, c]))
  const topicById = new Map((topics ?? []).map((t) => [t.id, t]))
  const chapterById = new Map((chapters ?? []).map((c) => [c.id, c]))
  const questionById = new Map((questions ?? []).map((q) => [q.id, q]))
  const answerByQuestion = new Map((answers ?? []).map((a) => [a.question_id, a]))

  const groups = new Map<string, ResultBreakdown['perCluster'][number]>()

  let totalCount = 0
  let correctCount = 0

  for (const tq of testQuestions ?? []) {
    const q = questionById.get(tq.question_id)
    if (!q) continue
    const cluster = clusterById.get(q.cluster_id)
    const topic = cluster ? topicById.get(cluster.topic_id) : null
    const chapter = topic ? chapterById.get(topic.chapter_id) : null
    const a = answerByQuestion.get(tq.question_id)
    const isCorrect = a?.is_correct === true

    totalCount++
    if (isCorrect) correctCount++

    const key = q.cluster_id
    if (!groups.has(key)) {
      groups.set(key, {
        clusterId: q.cluster_id,
        clusterTitle: cluster?.title ?? '—',
        topicTitle: topic?.title ?? '—',
        chapterSlug: chapter?.slug ?? '',
        topicSlug: topic?.slug ?? '',
        clusterSlug: cluster?.slug ?? '',
        total: 0,
        correct: 0,
        items: [],
      })
    }
    const g = groups.get(key)!
    g.total++
    if (isCorrect) g.correct++
    g.items.push({
      questionId: q.id,
      latexBody: q.latex_body,
      userAnswer: a?.user_answer ?? null,
      correctAnswer: q.answer,
      latexAnswer: q.latex_answer,
      isCorrect,
    })
  }

  return {
    totalCount,
    correctCount,
    perCluster: Array.from(groups.values()),
  }
}
