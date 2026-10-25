'use server'

import { createClient } from '@/lib/supabase/server'

import {
  cleanTimeSpentSec,
  progressAfterCorrect,
  progressAfterIncorrect,
} from './engine'
import {
  bewaarAntwoord,
  kijkAntwoordNa,
  OPSLAAN_MISLUKT,
  OpslagMislukt,
  rekenAlsnogGoed,
  vangOpslag,
} from './nakijken'

type DB = Awaited<ReturnType<typeof createClient>>

async function clusterTitel(db: DB, clusterId: string): Promise<string> {
  const { data } = await db
    .from('topic_clusters_new')
    .select('title')
    .eq('id', clusterId)
    .maybeSingle()
  return data?.title?.trim() ?? ''
}

function isDubbeleRij(error: { code?: string; message?: string }): boolean {
  return error.code === '23505' || /unique|duplicate key/i.test(error.message ?? '')
}

export type StudyResult =
  | { kind: 'correct'; streak: number; mastered: boolean; clusterTitle: string }
  | {
      kind: 'incorrect'
      answerId: string
      correctAnswer: string
      latexCorrectAnswer: string | null
      errorExplanation: string | null
      /** Korte zin als er iets niet lukte, bijvoorbeeld de extra controle. */
      melding: string | null
    }
  | { kind: 'error'; message: string }

export type SkipResult =
  | {
      kind: 'skipped'
      correctAnswer: string
      latexCorrectAnswer: string | null
    }
  | { kind: 'error'; message: string }

// =====================================================================
// De opgave staat op het scherm
// =====================================================================

/**
 * De leerling heeft deze opgave geopend. Zorg dat er een sessie is, ook als
 * er nooit een antwoord komt.
 *
 * Tot nu toe ontstond een sessie pas bij het eerste antwoord. Een leerling
 * die een opgave opende, ernaar keek en wegklikte liet dus geen enkel spoor
 * na, terwijl juist dáár wordt afgehaakt (zie AFG-115).
 *
 * Boekhouding mag het oefenen niet in de weg zitten: gaat er iets mis, dan
 * merkt de leerling daar niets van en blijft de opgave gewoon werken.
 */
export async function startStudySessionAction(questionId: string): Promise<void> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: question } = await supabase
      .from('questions_new')
      .select('topic_id, cluster_id')
      .eq('id', questionId)
      .maybeSingle()
    if (!question) return

    await getOrCreateSession(
      supabase,
      user.id,
      question.topic_id,
      question.cluster_id,
    )
  } catch (e) {
    console.error('[start-study-session]', e)
  }
}

export async function submitStudyAnswerAction(
  questionId: string,
  userAnswer: string,
  timeSpentSec?: number,
): Promise<StudyResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { kind: 'error', message: 'Niet ingelogd.' }

  return nakijkenVoorGebruiker(supabase, user.id, questionId, userAnswer, timeSpentSec)
}

/**
 * Kern van het nakijken, los van hóe de leerling is ingelogd.
 *
 * `submitStudyAnswerAction` (cookiesessie, de site zelf) en de app-route
 * `src/app/api/app/nakijken/route.ts` (bearer-token, de mobiele app) geven
 * allebei hun eigen, al-geauthenticeerde `supabase`-client plus `userId` door
 * aan deze ene functie — zodat nakijken en voortgang overal precies hetzelfde
 * werken, zonder twee keer dezelfde logica te onderhouden.
 */
export async function nakijkenVoorGebruiker(
  supabase: DB,
  userId: string,
  questionId: string,
  userAnswer: string,
  timeSpentSec?: number,
): Promise<StudyResult> {
  try {
    const { data: question } = await supabase
      .from('questions_new')
      .select('id, topic_id, cluster_id, answer, latex_answer, answer_alternatives')
      .eq('id', questionId)
      .maybeSingle()
    if (!question) return { kind: 'error', message: 'Vraag niet gevonden.' }

    const sessionId = await getOrCreateSession(
      supabase,
      userId,
      question.topic_id,
      question.cluster_id,
    )

    // Twee keer op "Nakijken" geklikt, of dezelfde opgave in twee tabbladen:
    // dan telt het maar één keer. Zie `zelfdeInzendingVanNet`.
    const alGeteld = await zelfdeInzendingVanNet(
      supabase,
      sessionId,
      question.id,
      userAnswer,
    )
    if (alGeteld) {
      return await uitslagVanEerdereInzending(
        supabase,
        userId,
        question,
        alGeteld,
      )
    }

    // De voortgang gaat pas na de extra controle bij: een goed antwoord in een
    // andere notatie mag niet eerst als fout geteld worden en daarna nog eens
    // als goed. Zie `kijkAntwoordNa` voor de volgorde.
    let answerId = ''
    const uitslag = await kijkAntwoordNa({
      questionId: question.id,
      userAnswer,
      correctAnswer: question.answer,
      alternatives: question.answer_alternatives,
      bewaar: async (goed) => {
        answerId = await bewaarAntwoord(supabase, '[oefenen] antwoord opslaan mislukt:', {
          sessionId,
          questionId: question.id,
          userAnswer,
          isCorrect: goed,
          timeSpentSec,
        })
      },
    })

    if (uitslag.viaExtraControle)
      await rekenAlsnogGoed(supabase, '[oefenen] alsnog goed rekenen mislukt:', answerId)

    if (uitslag.goed) {
      const [progress, clusterTitle] = await Promise.all([
        bumpProgressOnCorrect(
          supabase,
          userId,
          question.topic_id,
          question.cluster_id,
        ),
        clusterTitel(supabase, question.cluster_id),
      ])
      return {
        kind: 'correct',
        streak: progress.correct_streak,
        mastered: progress.status === 'mastered',
        clusterTitle,
      }
    }

    // Echt fout: nu pas de opgave meetellen en de reeks terugzetten.
    await bumpProgressOnIncorrect(supabase, userId, question.topic_id, question.cluster_id)

    return {
      kind: 'incorrect',
      answerId,
      correctAnswer: question.answer,
      latexCorrectAnswer: question.latex_answer ?? null,
      errorExplanation: uitslag.uitleg,
      melding: uitslag.melding,
    }
  } catch (e) {
    return vangOpslag('[oefenen] nakijken mislukt:', e)
  }
}

/**
 * Hoe lang na een inzending precies hetzelfde antwoord op dezelfde opgave
 * nog als dezelfde inzending telt.
 *
 * Kort genoeg om een echte tweede poging niet in de weg te zitten: de
 * leerling moet dan eerst de uitslag lezen, op "Opnieuw proberen" klikken en
 * het antwoord opnieuw intypen. Lang genoeg voor een trage verbinding, waar
 * het eerste verzoek nog onderweg is als het tweede binnenkomt.
 */
const ZELFDE_INZENDING_MS = 10_000

/**
 * Is dit antwoord net al opgeslagen voor deze sessie en deze opgave?
 *
 * Twee keer op "Nakijken" klikken voordat de knop grijs wordt, of dezelfde
 * opgave in twee tabbladen openen, gaf anders twee rijen in
 * `session_answers_new` én twee keer een ophoging van de reeks. Drie goed op
 * rij was dan haalbaar met twee antwoorden, en het aantal vragen op het
 * dashboard klopte niet meer (AFG-505).
 *
 * Alleen letterlijk hetzelfde antwoord telt als dubbel. Een nieuwe poging met
 * een ander antwoord hoort gewoon mee te tellen — daar is de knop "Opnieuw
 * proberen" voor. Daarom kan hier geen unieke sleutel op de tabel: bij het
 * gewone oefenen mag dezelfde opgave binnen één sessie vaker beantwoord
 * worden, anders dan bij de zelf-toets.
 */
async function zelfdeInzendingVanNet(
  db: DB,
  sessionId: string,
  questionId: string,
  userAnswer: string,
): Promise<{ id: string; is_correct: boolean | null } | null> {
  const since = new Date(Date.now() - ZELFDE_INZENDING_MS).toISOString()

  const { data, error } = await db
    .from('session_answers_new')
    .select('id, is_correct')
    .eq('session_id', sessionId)
    .eq('question_id', questionId)
    .eq('user_answer', userAnswer)
    .gte('answered_at', since)
    .order('answered_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    // Niet kunnen kijken is geen reden om het antwoord te weigeren: dan maar
    // de oude situatie, met het antwoord gewoon opgeslagen.
    console.error('[oefenen] dubbel antwoord opzoeken mislukt:', error.message)
    return null
  }
  return data
}

/**
 * De leerling krijgt bij een dubbele inzending gewoon de uitslag van zijn
 * antwoord te zien — alleen wordt er niets bijgeteld. Een foutmelding zou
 * hier raar zijn: hij heeft niets verkeerd gedaan.
 */
async function uitslagVanEerdereInzending(
  db: DB,
  userId: string,
  question: {
    topic_id: string
    cluster_id: string
    answer: string
    latex_answer: string | null
  },
  eerder: { id: string; is_correct: boolean | null },
): Promise<StudyResult> {
  if (eerder.is_correct) {
    const [voortgang, clusterTitle] = await Promise.all([
      leesVoortgang(db, userId, question.cluster_id),
      clusterTitel(db, question.cluster_id),
    ])
    return {
      kind: 'correct',
      streak: voortgang?.correct_streak ?? 0,
      mastered: voortgang?.status === 'mastered',
      clusterTitle,
    }
  }

  return {
    kind: 'incorrect',
    answerId: eerder.id,
    correctAnswer: question.answer,
    latexCorrectAnswer: question.latex_answer ?? null,
    errorExplanation: null,
    melding: null,
  }
}

// =====================================================================
// "Ik weet het niet": de uitwerking opvragen zonder te gokken
// =====================================================================

/**
 * De leerling weet de opgave niet en vraagt het goede antwoord op.
 *
 * De poging komt apart in de database: géén antwoord, `is_correct` leeg en
 * `hints_used` op 1. Daardoor telt hij niet mee als fout antwoord in het
 * percentage goed, blijft de tegel in het overzicht grijs en staat er in
 * `session_answers_new` geen onzin-invoer meer (zie AFG-102).
 *
 * De reeks "goed op rij" gaat wél terug naar 0: drie goed op rij hoort niet
 * te lukken door drie keer het antwoord op te vragen. Een cluster dat al
 * beheerst is, houdt zijn reeks én zijn status, net als bij een fout antwoord.
 */
export async function skipStudyQuestionAction(
  questionId: string,
  timeSpentSec?: number,
): Promise<SkipResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { kind: 'error', message: 'Niet ingelogd.' }

  try {
    const { data: question } = await supabase
      .from('questions_new')
      .select('id, topic_id, cluster_id, answer, latex_answer')
      .eq('id', questionId)
      .maybeSingle()
    if (!question) return { kind: 'error', message: 'Vraag niet gevonden.' }

    const sessionId = await getOrCreateSession(
      supabase,
      user.id,
      question.topic_id,
      question.cluster_id,
    )

    const { error: answerError } = await supabase
      .from('session_answers_new')
      .insert({
        session_id: sessionId,
        question_id: question.id,
        user_answer: null,
        is_correct: null,
        hints_used: 1,
        time_spent_sec: cleanTimeSpentSec(timeSpentSec),
      })

    if (answerError) {
      console.error('[oefenen] overslaan opslaan mislukt:', answerError.message)
      return { kind: 'error', message: OPSLAAN_MISLUKT }
    }

    await bumpProgressOnSkip(supabase, user.id, question.topic_id, question.cluster_id)

    return {
      kind: 'skipped',
      correctAnswer: question.answer,
      latexCorrectAnswer: question.latex_answer ?? null,
    }
  } catch (e) {
    return vangOpslag('[oefenen] overslaan mislukt:', e)
  }
}

// =====================================================================
// Vraag flaggen
// =====================================================================
export async function flagQuestionNewAction(
  questionId: string,
  reason: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Je bent niet ingelogd.' }

  const trimmed = reason.trim().slice(0, 500)
  const { error } = await supabase.from('question_flags_new').insert({
    question_id: questionId,
    user_id: user.id,
    reason: trimmed || null,
  })

  if (error) {
    // Dezelfde leerling heeft deze opgave al gemeld: dat is geen fout.
    if (isDubbeleRij(error)) return { ok: true }
    console.error('[melding] opslaan mislukt:', error.message)
    return { ok: false, error: 'Versturen is niet gelukt. Probeer het later nog eens.' }
  }

  return { ok: true }
}

async function getOrCreateSession(
  db: DB,
  userId: string,
  topicId: string,
  clusterId: string,
): Promise<string> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: existing } = await db
    .from('user_sessions_new')
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
    .from('user_sessions_new')
    .insert({ user_id: userId, topic_id: topicId, cluster_id: clusterId })
    .select('id')
    .single()
  if (error) {
    console.error('[sessie] aanmaken mislukt:', error.message)
    throw new OpslagMislukt()
  }
  return created.id
}

async function leesVoortgang(db: DB, userId: string, clusterId: string) {
  const { data, error } = await db
    .from('user_progress_new')
    .select('*')
    .eq('user_id', userId)
    .eq('cluster_id', clusterId)
    .maybeSingle()
  if (error) {
    console.error('[voortgang] ophalen mislukt:', error.message)
    throw new OpslagMislukt()
  }
  return data
}

async function getOrCreateProgress(
  db: DB,
  userId: string,
  topicId: string,
  clusterId: string,
) {
  const bestaand = await leesVoortgang(db, userId, clusterId)
  if (bestaand) return bestaand

  const { data: created, error } = await db
    .from('user_progress_new')
    .insert({ user_id: userId, topic_id: topicId, cluster_id: clusterId, status: 'in_progress' })
    .select('*')
    .single()
  if (!error && created) return created

  // Twee pogingen tegelijk zien allebei nog geen rij en voegen allebei in.
  // De tweede botst op de unieke sleutel (gebruiker + cluster). Dan pakken
  // we de rij die de eerste net heeft aangemaakt, zodat de pagina niet omvalt.
  if (error) console.error('[voortgang] opslaan mislukt:', error.message)
  if (error && isDubbeleRij(error)) {
    const opnieuw = await leesVoortgang(db, userId, clusterId)
    if (opnieuw) return opnieuw
  }
  throw new OpslagMislukt()
}

async function bumpProgressOnCorrect(
  db: DB,
  userId: string,
  topicId: string,
  clusterId: string,
) {
  const p = await getOrCreateProgress(db, userId, topicId, clusterId)
  const next = progressAfterCorrect(p.correct_streak)
  const { data, error } = await db
    .from('user_progress_new')
    .update({
      correct_streak: next.correct_streak,
      total_answered: p.total_answered + 1,
      total_correct: p.total_correct + 1,
      status: next.status,
      mastered_at:
        next.mastered && !p.mastered_at
          ? new Date().toISOString()
          : p.mastered_at,
    })
    .eq('id', p.id)
    .select('*')
    .single()
  if (error) {
    console.error('[voortgang] bijwerken mislukt:', error.message)
    throw new OpslagMislukt()
  }
  return data
}

async function bumpProgressOnIncorrect(
  db: DB,
  userId: string,
  topicId: string,
  clusterId: string,
) {
  const p = await getOrCreateProgress(db, userId, topicId, clusterId)
  const next = progressAfterIncorrect(p.status, p.correct_streak)
  const { error } = await db
    .from('user_progress_new')
    .update({
      total_answered: p.total_answered + 1,
      correct_streak: next.correct_streak,
      status: next.status,
    })
    .eq('id', p.id)
  if (error) {
    console.error('[voortgang] bijwerken na fout antwoord mislukt:', error.message)
    throw new OpslagMislukt()
  }
}

/**
 * Voortgang na "Ik weet het niet". Dezelfde reeks-regel als bij een fout
 * antwoord, maar `total_answered` en `total_correct` blijven staan: het was
 * geen poging, dus het percentage goed verandert er niet van.
 */
async function bumpProgressOnSkip(
  db: DB,
  userId: string,
  topicId: string,
  clusterId: string,
) {
  const p = await getOrCreateProgress(db, userId, topicId, clusterId)
  const next = progressAfterIncorrect(p.status, p.correct_streak)
  const { error } = await db
    .from('user_progress_new')
    .update({
      correct_streak: next.correct_streak,
      status: next.status,
    })
    .eq('id', p.id)
  if (error) {
    console.error('[voortgang] bijwerken na overslaan mislukt:', error.message)
    throw new OpslagMislukt()
  }
}
