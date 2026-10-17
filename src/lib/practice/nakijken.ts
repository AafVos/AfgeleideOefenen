/**
 * Eén plek waar een antwoord van een leerling wordt nagekeken.
 *
 * Oefenen, de zelf-toets en de oefenvraag bij een uitlegvideo deden dit alle
 * drie zelf, met dezelfde stappen en dezelfde valkuilen. Nu staat die
 * volgorde hier:
 *
 *   1. tekstvergelijking (`answersMatch`)
 *   2. het antwoord opslaan, als de aanroeper dat wil (`bewaar`)
 *   3. alleen bij een fout antwoord de extra controle: is het misschien
 *      hetzelfde antwoord, anders opgeschreven?
 *
 * Stap 2 zit er bewust tussen: lukt de extra controle niet, dan is het
 * antwoord van de leerling toch al opgeslagen.
 */

import { checkWrongAnswerNew } from '@/lib/ai/check-answer-new'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

import { answersMatch, cleanTimeSpentSec } from './engine'

type DB = Awaited<ReturnType<typeof createClient>>

/** Zin op het scherm als opslaan mislukt. De tekst van de database blijft in de log. */
export const OPSLAAN_MISLUKT = 'Opslaan is niet gelukt. Probeer het nog eens.'

/**
 * Zin op het scherm als de extra controle niet lukte. Zonder die zin staat
 * een goed antwoord in een andere schrijfwijze zomaar fout, en snapt de
 * leerling niet waarom.
 */
export const EXTRA_CONTROLE_MISLUKT =
  'Het lukte even niet om te controleren of je antwoord anders opgeschreven toch goed is.'

export class OpslagMislukt extends Error {
  constructor() {
    super(OPSLAAN_MISLUKT)
    this.name = 'OpslagMislukt'
  }
}

/** Vangt alles wat tijdens het opslaan misgaat en houdt de databasetekst binnen. */
export function vangOpslag(plek: string, e: unknown): { kind: 'error'; message: string } {
  if (!(e instanceof OpslagMislukt)) console.error(plek, e)
  return { kind: 'error', message: OPSLAAN_MISLUKT }
}

export type Nakijkuitslag = {
  /** Telt het antwoord als goed? */
  goed: boolean
  /** Goed gerekend door de extra controle, niet door de tekstvergelijking. */
  viaExtraControle: boolean
  /** Uitleg bij een fout antwoord, of null als die er niet is. */
  uitleg: string | null
  /**
   * Een zin voor de leerling als er iets niet lukte, of null. Nu alleen als de
   * extra controle misging; die fout mag niet stilletjes verdwijnen.
   */
  melding: string | null
}

/**
 * Kijkt één antwoord na.
 *
 * `bewaar` draait tussen de tekstvergelijking en de extra controle in, met de
 * uitslag van de tekstvergelijking. Gaat het opslaan mis, gooi dan
 * `OpslagMislukt`; de aanroeper vangt dat af met `vangOpslag`.
 */
export async function kijkAntwoordNa({
  questionId,
  userAnswer,
  correctAnswer,
  alternatives,
  bewaar,
}: {
  questionId: string
  userAnswer: string
  correctAnswer: string
  alternatives?: string[] | null
  bewaar?: (goed: boolean) => Promise<void>
}): Promise<Nakijkuitslag> {
  const meteenGoed = answersMatch(userAnswer, correctAnswer, alternatives ?? [])

  await bewaar?.(meteenGoed)

  if (meteenGoed) {
    return { goed: true, viaExtraControle: false, uitleg: null, melding: null }
  }

  return await extraControle(questionId, userAnswer)
}

/**
 * Fout volgens de tekstvergelijking. Vraag de AI of het toch hetzelfde
 * antwoord is, anders opgeschreven. Lezen mag met de gewone rechten, maar het
 * wegschrijven van een gevonden notatie gaat via de service role.
 */
async function extraControle(questionId: string, userAnswer: string): Promise<Nakijkuitslag> {
  try {
    const service = createServiceRoleClient()
    const uitkomst = await checkWrongAnswerNew(service, questionId, userAnswer)

    if ('error' in uitkomst) {
      console.error('[nakijken] extra controle mislukt:', uitkomst.error)
      return {
        goed: false,
        viaExtraControle: false,
        uitleg: null,
        melding: EXTRA_CONTROLE_MISLUKT,
      }
    }

    if (uitkomst.isMathematicallyCorrect) {
      return { goed: true, viaExtraControle: true, uitleg: null, melding: null }
    }

    return {
      goed: false,
      viaExtraControle: false,
      uitleg: uitkomst.errorExplanation || null,
      melding: null,
    }
  } catch (e) {
    console.error('[nakijken] extra controle viel om:', e)
    return {
      goed: false,
      viaExtraControle: false,
      uitleg: null,
      melding: EXTRA_CONTROLE_MISLUKT,
    }
  }
}

/**
 * Zet het antwoord van de leerling in `session_answers_new` en geeft het id
 * van die rij terug. Lukt dat niet, dan stopt de hele actie met
 * `OpslagMislukt`: zonder opgeslagen antwoord klopt de voortgang niet meer.
 */
export async function bewaarAntwoord(
  db: DB,
  plek: string,
  rij: {
    sessionId: string
    questionId: string
    userAnswer: string
    isCorrect: boolean
    timeSpentSec?: number
  },
): Promise<string> {
  const { data, error } = await db
    .from('session_answers_new')
    .insert({
      session_id: rij.sessionId,
      question_id: rij.questionId,
      user_answer: rij.userAnswer,
      is_correct: rij.isCorrect,
      time_spent_sec: cleanTimeSpentSec(rij.timeSpentSec),
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error(plek, error?.code ?? '', error?.message ?? '')
    throw new OpslagMislukt()
  }
  return data.id
}

/**
 * Rekent een al opgeslagen antwoord alsnog goed na de extra controle.
 *
 * Lukt dat niet, dan blijft de rij op fout staan terwijl de leerling "goed"
 * ziet. Dat is geen reden om hem een foutmelding te geven — zijn antwoord
 * wás goed en de voortgang gaat gewoon omhoog — maar het mag ook niet
 * stilletjes verdwijnen, dus het gaat in de log.
 */
export async function rekenAlsnogGoed(db: DB, plek: string, answerId: string): Promise<void> {
  const { error } = await db
    .from('session_answers_new')
    .update({ is_correct: true })
    .eq('id', answerId)

  if (error) console.error(plek, error.code ?? '', error.message ?? '')
}
