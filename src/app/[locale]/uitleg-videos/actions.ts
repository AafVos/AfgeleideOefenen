'use server'

import { Resend } from 'resend'

import { SITE_CONFIG } from '@/config/site'
import { checkWrongAnswerNew } from '@/lib/ai/check-answer-new'
import { answersMatch } from '@/lib/practice/engine'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

const EMAIL_FROM = process.env.EMAIL_FROM ?? `no-reply@${SITE_CONFIG.domain}`

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

export type VideoVraagState = {
  error: string | null
  sent: boolean
}

/** Video-verzoek: leerling mist een uitleg; mailt de vraag door, slaat niets op. */
export async function vraagVideoAction(
  _prev: VideoVraagState,
  formData: FormData,
): Promise<VideoVraagState> {
  const message = (formData.get('message') ?? '').toString().trim()

  if (!message) {
    return { error: 'Typ eerst je vraag.', sent: false }
  }
  if (message.length > 2000) {
    return { error: 'Je vraag is te lang (max 2000 tekens).', sent: false }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Log in om een vraag in te sturen.', sent: false }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: 'alhvos@gmail.com',
      replyTo: user.email ?? undefined,
      subject: `Video-verzoek via ${SITE_CONFIG.domain}`,
      html: `
        <h2>Video-verzoek (uitlegvideo's)</h2>
        <p><b>Van:</b> ${escapeHtml(user.email ?? user.id)}</p>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      `,
    })
    if (error) {
      console.error('[vraag-video]', error)
      return { error: 'Versturen mislukt. Probeer het later opnieuw.', sent: false }
    }
    return { error: null, sent: true }
  } catch (e) {
    console.error('[vraag-video]', e)
    return { error: 'Versturen mislukt. Probeer het later opnieuw.', sent: false }
  }
}

export type VideoAnswerResult =
  | { kind: 'error'; message: string }
  | { kind: 'correct' }
  | {
      kind: 'wrong'
      correctAnswer: string
      latexCorrectAnswer: string | null
      steps: Array<{ id: string; step_order: number; step_description: string }>
    }

/**
 * Controleert een antwoord op een oefenvraag bij een uitlegvideo.
 * Slaat niets op (geen sessie): puur even meedoen na het kijken.
 */
export async function checkVideoAnswerAction(
  questionId: string,
  userAnswer: string,
): Promise<VideoAnswerResult> {
  const answer = userAnswer.trim()
  if (!answer) return { kind: 'error', message: 'Vul eerst een antwoord in.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { kind: 'error', message: 'Niet ingelogd.' }

  const { data: question } = await supabase
    .from('questions_new')
    .select('id, answer, latex_answer, answer_alternatives')
    .eq('id', questionId)
    .maybeSingle()
  if (!question) return { kind: 'error', message: 'Vraag niet gevonden.' }

  const alts: string[] = question.answer_alternatives ?? []
  let isCorrect = answersMatch(answer, question.answer, alts)

  // Fout volgens de tekstmatch? Vraag de AI of het een geldige alternatieve notatie is.
  if (!isCorrect) {
    try {
      const service = createServiceRoleClient()
      const aiResult = await checkWrongAnswerNew(service, question.id, answer)
      if (!('error' in aiResult) && aiResult.isMathematicallyCorrect) {
        isCorrect = true
      }
    } catch (e) {
      console.error('[check-video-answer]', e)
    }
  }

  if (isCorrect) return { kind: 'correct' }

  const { data: steps } = await supabase
    .from('question_steps_new')
    .select('id, step_order, step_description')
    .eq('question_id', question.id)
    .order('step_order')

  return {
    kind: 'wrong',
    correctAnswer: question.answer,
    latexCorrectAnswer: question.latex_answer ?? null,
    steps: (steps ?? []) as Array<{
      id: string
      step_order: number
      step_description: string
    }>,
  }
}
