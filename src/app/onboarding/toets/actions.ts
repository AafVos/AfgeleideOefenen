'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { applyDiagnosticResults } from '@/lib/practice/bulk-progress'
import { answersMatch } from '@/lib/practice/engine'
import { loadDiagnosticQuestions } from '@/lib/practice/diagnostic'
import { createClient } from '@/lib/supabase/server'

// ── Nakijken (geen opslaan) ──────────────────────────────────────────────────

export type DiagnosticCheckResult = {
  topicId: string
  topicSlug: string
  topicTitle: string
  questionId: string
  body: string
  latexBody: string | null
  correctAnswer: string
  latexAnswer: string | null
  userAnswer: string
  correct: boolean
}

export type TopicRow = {
  id: string
  slug: string
  title: string
  order_index: number
}

export type DiagnosticCheckResponse = {
  results: DiagnosticCheckResult[]
  allTopics: TopicRow[]
}

/**
 * Kijkt de toets na en geeft de resultaten terug — slaat niets op.
 * De leerling ziet daarna een verslag en kan het aanbevolen leerpad aanpassen.
 */
export async function checkDiagnosticAction(
  payload: { questionId: string; raw: string }[],
): Promise<{ error: string } | DiagnosticCheckResponse> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/inloggen')

  const canonical = await loadDiagnosticQuestions(supabase)
  if (!canonical.length) {
    return { error: 'Er zijn nog geen toetsvragen beschikbaar.' }
  }

  const allowedIds = new Set(canonical.map((q) => q.id))
  if (payload.length !== allowedIds.size) {
    return { error: 'Toets is onvolledig. Probeer opnieuw.' }
  }

  const byId = new Map(payload.map((p) => [p.questionId, p.raw]))

  for (const row of payload) {
    if (!allowedIds.has(row.questionId)) {
      return { error: 'Ongeldige toets-inzending.' }
    }
  }

  const results: DiagnosticCheckResult[] = canonical.map((q) => {
    const raw = (byId.get(q.id) ?? '').trim()
    return {
      topicId: q.topic_id,
      topicSlug: q.topic_slug,
      topicTitle: q.topic_title,
      questionId: q.id,
      body: q.body,
      latexBody: q.latex_body,
      correctAnswer: q.answer,
      latexAnswer: q.latex_answer,
      userAnswer: raw,
      correct: answersMatch(raw, q.answer),
    }
  })

  const { data: topics } = await supabase
    .from('topics')
    .select('id, slug, title, order_index')
    .order('order_index')

  return { results, allTopics: topics ?? [] }
}

// ── Definitief opslaan na padkeuze ───────────────────────────────────────────

export type PadPayload = {
  topicId: string
  kenIk: boolean
  wilOefenen: boolean
}[]

/**
 * Sla de padkeuze op die de leerling (eventueel aangepast) heeft bevestigd
 * na de diagnostische toets.
 */
export async function saveDiagnosticPadAction(
  topicIds: string[],
  payload: PadPayload,
): Promise<{ error: string } | void> {
  if (!topicIds.length) return { error: 'Geen onderwerpen.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/inloggen')

  const { applyPadSelections } = await import('@/lib/practice/bulk-progress')

  const map = new Map(
    payload.map((p) => [p.topicId, { kenIk: p.kenIk, wilOefenen: p.wilOefenen }]),
  )

  try {
    await applyPadSelections(supabase, user.id, topicIds, map)
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Opslaan mislukt.' }
  }

  revalidatePath('/leerpad')
  revalidatePath('/dashboard')
  revalidatePath('/oefenen')
  redirect('/leerpad')
}

// ── Oude directe action (behoud voor backward compat) ────────────────────────

export async function submitDiagnosticAction(
  payload: { questionId: string; raw: string }[],
): Promise<{ error: string } | void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/inloggen')

  const canonical = await loadDiagnosticQuestions(supabase)
  if (canonical.length === 0) {
    return { error: 'Er zijn nog geen toetsvragen beschikbaar.' }
  }

  const allowedIds = new Set(canonical.map((q) => q.id))
  if (payload.length !== allowedIds.size) {
    return { error: 'Toets is onvolledig. Probeer opnieuw.' }
  }

  const byId = new Map(payload.map((p) => [p.questionId, p.raw]))
  for (const row of payload) {
    if (!allowedIds.has(row.questionId)) {
      return { error: 'Ongeldige toets-inzending.' }
    }
  }
  for (const id of allowedIds) {
    if (!byId.has(id)) {
      return { error: 'Ontbrekende antwoorden.' }
    }
  }

  const correctByTopicOrder: boolean[] = []
  for (const q of canonical) {
    const raw = byId.get(q.id)!
    correctByTopicOrder.push(answersMatch(raw, q.answer))
  }

  const orderedTopicIds = canonical.map((q) => q.topic_id)

  try {
    await applyDiagnosticResults(
      supabase,
      user.id,
      orderedTopicIds,
      correctByTopicOrder,
    )
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Opslaan mislukt.' }
  }

  revalidatePath('/leerpad')
  revalidatePath('/dashboard')
  revalidatePath('/oefenen')
  redirect('/leerpad')
}
