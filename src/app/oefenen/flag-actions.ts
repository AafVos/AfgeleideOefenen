'use server'

import { createClient } from '@/lib/supabase/server'

export async function flagQuestionAction(
  questionId: string,
  reason: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Je bent niet ingelogd.' }

  const trimmed = reason.trim().slice(0, 500)
  const { error } = await supabase.from('question_flags').insert({
    question_id: questionId,
    user_id: user.id,
    reason: trimmed || null,
  })

  if (error) {
    // Unique constraint: gebruiker heeft deze vraag al een open flag gegeven.
    if (
      error.code === '23505' ||
      error.message.toLowerCase().includes('unique')
    ) {
      return { ok: true }
    }
    return { ok: false, error: error.message }
  }

  return { ok: true }
}
