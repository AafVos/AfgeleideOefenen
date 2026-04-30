'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { applyDiagnosticResults } from '@/lib/practice/bulk-progress'
import { answersMatch } from '@/lib/practice/engine'
import { loadDiagnosticQuestions } from '@/lib/practice/diagnostic'
import { createClient } from '@/lib/supabase/server'

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
