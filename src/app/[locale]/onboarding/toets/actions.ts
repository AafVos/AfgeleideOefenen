'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

import {
  applyDiagnosticResultsNew,
  applyPadSelectionsNew,
} from '@/lib/practice/bulk-progress-new'
import { answersMatch } from '@/lib/practice/engine'
import { loadDiagnosticQuestions } from '@/lib/practice/diagnostic'
import { SITE } from '@/config/site'
import { createClient } from '@/lib/supabase/server'

// ── Nakijken (geen opslaan) ──────────────────────────────────────────────────

export type DiagnosticCheckResult = {
  topicId: string
  topicSlug: string
  topicTitle: string
  questionId: string
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

export async function checkDiagnosticAction(
  payload: { questionId: string; raw: string }[],
): Promise<{ error: string } | DiagnosticCheckResponse> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const locale = await getLocale()
  if (!user) redirect(`/${locale}/inloggen`)

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
      latexBody: q.latex_body,
      correctAnswer: q.answer,
      latexAnswer: q.latex_answer,
      userAnswer: raw,
      correct: answersMatch(raw, q.answer),
    }
  })

  const { data: topics } = await supabase
    .from('topics_new')
    .select('id, slug, title, order_index')
    .eq('site', SITE)
    .order('order_index')

  return { results, allTopics: topics ?? [] }
}

// ── Definitief opslaan na padkeuze ───────────────────────────────────────────

export type PadPayload = {
  topicId: string
  kenIk: boolean
  wilOefenen: boolean
}[]

export async function saveDiagnosticPadAction(
  topicIds: string[],
  payload: PadPayload,
): Promise<{ error: string } | void> {
  if (!topicIds.length) return { error: 'Geen onderwerpen.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const locale = await getLocale()
  if (!user) redirect(`/${locale}/inloggen`)

  const map = new Map(
    payload.map((p) => [p.topicId, { kenIk: p.kenIk, wilOefenen: p.wilOefenen }]),
  )

  try {
    await applyPadSelectionsNew(supabase, user.id, topicIds, map)
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Opslaan mislukt.' }
  }

  revalidatePath(`/nl/dashboard`)
  revalidatePath(`/en/dashboard`)
  redirect(`/${locale}/oefenen`)
}

// ── Directe opslaan na toets (zonder padkeuze) ───────────────────────────────

export async function submitDiagnosticAction(
  payload: { questionId: string; raw: string }[],
): Promise<{ error: string } | void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const locale = await getLocale()
  if (!user) redirect(`/${locale}/inloggen`)

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
    await applyDiagnosticResultsNew(
      supabase,
      user.id,
      orderedTopicIds,
      correctByTopicOrder,
    )
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Opslaan mislukt.' }
  }

  revalidatePath(`/nl/dashboard`)
  revalidatePath(`/en/dashboard`)
  redirect(`/${locale}/oefenen`)
}
