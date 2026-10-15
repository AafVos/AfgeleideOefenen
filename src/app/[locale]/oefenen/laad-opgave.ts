'use server'

import { loadQuestionNew } from '@/lib/practice/chapter-overview'
import { requireUser } from '@/lib/supabase/require-user'
import { createClient } from '@/lib/supabase/server'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Eén opgave, voor als de leerling een tegel aanklikt.
 *
 * De pagina zelf blijft dan staan. Anders tekent de server alle formules
 * opnieuw, ook als er alleen een andere som opengaat.
 */
export async function laadOpgave(questionId: string) {
  if (!UUID.test(questionId)) return null
  await requireUser()
  const supabase = await createClient()
  return loadQuestionNew(supabase, questionId)
}
