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

/** Foto's van een boekopgave mogen mee met een video-verzoek. */
const MAX_FOTOS = 3
/**
 * De browser verkleint foto's al (lib/images/compress.ts) en bewaakt het
 * totaal; dit is het vangnet voor het geval dat mislukt. Blijf onder de
 * bodySizeLimit van 4 MB uit next.config.ts.
 */
const MAX_FOTO_BYTES = 3 * 1024 * 1024
const MAX_TOTAAL_BYTES = 3.2 * 1024 * 1024
const TOEGESTANE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

type Bijlage = {
  filename: string
  content: string
  contentType: string
  /** Zonder contentId komt de foto alleen als bijlage mee en zie je hem niet in de mail. */
  contentId: string
}

/**
 * Leest de meegestuurde foto's uit het formulier en zet ze om naar
 * base64-bijlagen. Geeft een foutmelding terug zodra er iets niet klopt, zodat
 * de leerling het meteen ziet in plaats van dat de mail stil zonder foto vertrekt.
 */
async function leesFotos(
  formData: FormData,
): Promise<{ bijlagen: Bijlage[] } | { error: string }> {
  const bestanden = formData
    .getAll('fotos')
    .filter((f): f is File => f instanceof File && f.size > 0)

  if (bestanden.length === 0) return { bijlagen: [] }
  if (bestanden.length > MAX_FOTOS) {
    return { error: `Maximaal ${MAX_FOTOS} foto's per vraag.` }
  }

  const totaal = bestanden.reduce((som, f) => som + f.size, 0)
  if (totaal > MAX_TOTAAL_BYTES) {
    return { error: "Deze foto's zijn samen te groot. Kies er minder." }
  }

  const bijlagen: Bijlage[] = []
  for (const [i, bestand] of bestanden.entries()) {
    if (!TOEGESTANE_TYPES.includes(bestand.type)) {
      return { error: 'Alleen foto\'s (jpg, png, webp of heic) kunnen mee.' }
    }
    if (bestand.size > MAX_FOTO_BYTES) {
      return { error: 'Deze foto is te groot. Maak er een nieuwe of kies een kleinere.' }
    }
    const buffer = Buffer.from(await bestand.arrayBuffer())
    bijlagen.push({
      filename: bestand.name || `foto-${i + 1}.jpg`,
      content: buffer.toString('base64'),
      contentType: bestand.type || 'image/jpeg',
      contentId: `foto-${i + 1}`,
    })
  }
  return { bijlagen }
}

/**
 * Video-verzoek: leerling mist een uitleg; mailt de vraag door, slaat niets op.
 * Foto's van een boekopgave gaan als bijlage mee, zodat de opgave niet
 * overgetypt hoeft te worden.
 */
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

  const fotos = await leesFotos(formData)
  if ('error' in fotos) return { error: fotos.error, sent: false }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: 'alhvos@gmail.com',
      replyTo: user.email ?? undefined,
      subject: `Video-verzoek via ${SITE_CONFIG.domain}`,
      attachments: fotos.bijlagen.length > 0 ? fotos.bijlagen : undefined,
      html: `
        <h2>Video-verzoek (uitlegvideo's)</h2>
        <p><b>Van:</b> ${escapeHtml(user.email ?? user.id)}</p>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
        ${
          fotos.bijlagen.length > 0
            ? `<p><b>Foto's van de opgave:</b></p>
               ${fotos.bijlagen
                 .map(
                   (b) =>
                     `<p><img src="cid:${b.contentId}" alt="${escapeHtml(b.filename)}"
                        style="max-width:100%;height:auto;border:1px solid #ddd;border-radius:8px" /></p>`,
                 )
                 .join('')}`
            : ''
        }
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
