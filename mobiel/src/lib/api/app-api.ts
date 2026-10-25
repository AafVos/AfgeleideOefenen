import { API_BASE_URL } from '@/constants/site'
import { supabase } from '@/lib/supabase'

/**
 * De app heeft geen eigen backend: oefenen en nakijken lopen via
 * `/api/app/*` op dezelfde site (zie `src/app/api/app/` in de hoofdmap,
 * AFG-558). De site zelf logt in via een cookiesessie; de app heeft geen
 * cookiejar en stuurt in plaats daarvan de Supabase-sessie van de leerling
 * mee als bearer-token — `src/lib/supabase/bearer.ts` op de site vraagt
 * daarmee aan Supabase wie de aanroeper is.
 */

export class ApiFout extends Error {}

async function appFetch<T>(pad: string, init?: RequestInit): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) throw new ApiFout('Niet ingelogd.')

  const res = await fetch(`${API_BASE_URL}${pad}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  })

  const json = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiFout(
      (json && typeof json === 'object' && 'error' in json && String(json.error)) ||
        'Er ging iets mis. Probeer het nog eens.',
    )
  }
  return json as T
}

// =====================================================================
// Indeling: hoofdstuk → paragraaf/theorieblok → soorten sommen
// =====================================================================

export type Kopje = {
  id: string
  label: string
  sub: { id: string; label: string; clusterId: string }[]
}

export type OverzichtBlok = {
  id: string
  slug: string
  letter: string
  title: string
  kopjes: Kopje[]
}

export type OverzichtParagraaf = {
  id: string
  slug: string
  label: string
  title: string
  blokken: OverzichtBlok[]
}

export type ChapterInfo = {
  id: string
  slug: string
  title: string
  book_part: number
  order_index: number
}

export type OverzichtHoofdstuk = {
  chapter: ChapterInfo
  paragrafen: OverzichtParagraaf[]
  /** Hoofdstuk zonder boekparagrafen (bv. Beweging): kopjes direct eronder. */
  kopjes: Kopje[]
}

export async function haalIndeling(): Promise<OverzichtHoofdstuk[]> {
  const data = await appFetch<{ hoofdstukken: OverzichtHoofdstuk[] }>('/api/app/indeling')
  return data.hoofdstukken
}

// =====================================================================
// Eén opgave, voor een gekozen soort som
// =====================================================================

export type Stap = { id: string; step_order: number; step_description: string }

export type Opgave = {
  id: string
  cluster_id: string | null
  latex_body: string | null
  /** Ruwe tekst uit de database; gebruik `answerPrefix` voor wat op het scherm hoort. */
  answer_prefix: string | null
  difficulty: 1 | 2 | 3
  source_label: string | null
  source_url: string | null
  steps: Stap[]
  /** Al afgeleid door de server (zelfde regels als `answerPrefix()` op de site), bv. "f'(x) =". */
  answerPrefix: string
}

export type OpgaveResponse = {
  clusterTitle: string
  aantalOpgaven: number
  opgave: Opgave
}

export async function haalOpgave(clusterId: string): Promise<OpgaveResponse> {
  return appFetch<OpgaveResponse>(`/api/app/opgave?clusterId=${encodeURIComponent(clusterId)}`)
}

// =====================================================================
// Nakijken
// =====================================================================

export type NakijkUitslag =
  | { kind: 'correct'; streak: number; mastered: boolean; clusterTitle: string }
  | {
      kind: 'incorrect'
      answerId: string
      correctAnswer: string
      latexCorrectAnswer: string | null
      errorExplanation: string | null
      melding: string | null
    }
  | { kind: 'error'; message: string }

export async function stuurAntwoordIn(
  questionId: string,
  userAnswer: string,
  timeSpentSec?: number,
): Promise<NakijkUitslag> {
  return appFetch<NakijkUitslag>('/api/app/nakijken', {
    method: 'POST',
    body: JSON.stringify({ questionId, userAnswer, timeSpentSec }),
  })
}

// =====================================================================
// Voortgang: per hoofdstuk en soort som, zelfde cijfers als het dashboard
// =====================================================================

export type VoortgangSoort = {
  id: string
  title: string
  isKnown: boolean
  correctStreak: number
}

export type VoortgangHoofdstuk = {
  id: string
  slug: string
  title: string
  mastered: number
  total: number
  pct: number
  soorten: VoortgangSoort[]
}

export async function haalVoortgang(): Promise<VoortgangHoofdstuk[]> {
  const data = await appFetch<{ hoofdstukken: VoortgangHoofdstuk[] }>('/api/app/voortgang')
  return data.hoofdstukken
}
