import { appCorsJson, appCorsPreflight } from '@/lib/api/app-cors'
import { nakijkenVoorGebruiker } from '@/lib/practice/chapter-actions'
import { OPSLAAN_MISLUKT } from '@/lib/practice/nakijken'
import { authenticateBearer } from '@/lib/supabase/bearer'

/**
 * Nakijken vanuit de app (AFG-558).
 *
 * De site zelf kijkt na via de Server Action `submitStudyAnswerAction` —
 * die bestaat alleen binnen Next.js' eigen protocol en werkt met een
 * cookiesessie, dus een losse app kan hem niet aanroepen. Deze route is een
 * dunne laag eromheen: bearer-token in plaats van cookie, en daarna precies
 * dezelfde `nakijkenVoorGebruiker` als de site gebruikt, zodat een antwoord
 * in de app nooit anders wordt nagekeken dan op de site en de voortgang
 * (`session_answers_new`, `user_progress_new`) overal hetzelfde is.
 */
export async function POST(req: Request) {
  const auth = await authenticateBearer(req)
  if (!auth) return appCorsJson({ error: 'Niet ingelogd.' }, { status: 401 })

  let body: { questionId?: unknown; userAnswer?: unknown; timeSpentSec?: unknown }
  try {
    body = await req.json()
  } catch {
    return appCorsJson({ error: 'Ongeldig verzoek.' }, { status: 400 })
  }

  const { questionId, userAnswer, timeSpentSec } = body
  if (typeof questionId !== 'string' || typeof userAnswer !== 'string') {
    return appCorsJson({ error: 'questionId en userAnswer zijn verplicht.' }, { status: 400 })
  }

  const { supabase, userId } = auth
  try {
    const result = await nakijkenVoorGebruiker(
      supabase,
      userId,
      questionId,
      userAnswer,
      typeof timeSpentSec === 'number' ? timeSpentSec : undefined,
    )

    return appCorsJson(result)
  } catch (e) {
    console.error('[app/nakijken] nakijken mislukt:', e)
    return appCorsJson({ kind: 'error', message: OPSLAAN_MISLUKT }, { status: 500 })
  }
}

export function OPTIONS() {
  return appCorsPreflight()
}
