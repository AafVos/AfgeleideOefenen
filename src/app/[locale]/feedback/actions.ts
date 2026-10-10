'use server'

import { SITE_CONFIG } from '@/config/site'
import { EMAIL_FROM, meldAdres } from '@/lib/email/adressen'
import { maakMailer } from '@/lib/email/mailer'
import { createClient } from '@/lib/supabase/server'

export type FeedbackState = {
  error: string | null
  sent: boolean
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

/** Vraag gesteld via Aaf (het hulppoppetje): mailt de vraag door, slaat niets op. */
export async function askAafAction(
  _prev: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
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
  if (!user) return { error: 'Niet ingelogd.', sent: false }

  const naar = meldAdres()
  if (!naar) {
    console.error('[ask-aaf] geen NOTIFY_EMAIL ingesteld; vraag niet verstuurd')
    return {
      error: 'Versturen is niet gelukt. Probeer het later nog eens.',
      sent: false,
    }
  }

  const resend = maakMailer()
  if (!resend) {
    console.error('[ask-aaf] geen RESEND_API_KEY; vraag niet verstuurd')
    return {
      error: 'Versturen is niet gelukt. Probeer het later nog eens.',
      sent: false,
    }
  }

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: naar,
      replyTo: user.email ?? undefined,
      subject: `Vraag via Aaf op ${SITE_CONFIG.domain}`,
      html: `
        <h2>Vraag via Aaf</h2>
        <p><b>Van:</b> ${escapeHtml(user.email ?? user.id)}</p>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      `,
    })
    if (error) {
      console.error('[ask-aaf]', error)
      return {
        error: 'Versturen is niet gelukt. Probeer het later nog eens.',
        sent: false,
      }
    }
  } catch (e) {
    console.error('[ask-aaf]', e)
    return {
      error: 'Versturen is niet gelukt. Probeer het later nog eens.',
      sent: false,
    }
  }

  return { error: null, sent: true }
}

export async function sendFeedbackAction(
  _prev: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const message = (formData.get('message') ?? '').toString().trim()

  if (!message) {
    return { error: 'Schrijf eerst een bericht.', sent: false }
  }
  if (message.length > 5000) {
    return { error: 'Je bericht is te lang (max 5000 tekens).', sent: false }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd.', sent: false }

  const naar = meldAdres()
  if (!naar) {
    console.error('[feedback] geen NOTIFY_EMAIL ingesteld; bericht niet verstuurd')
    return {
      error: 'Versturen is niet gelukt. Probeer het later nog eens.',
      sent: false,
    }
  }

  const resend = maakMailer()
  if (!resend) {
    console.error('[feedback] geen RESEND_API_KEY; bericht niet verstuurd')
    return {
      error: 'Versturen is niet gelukt. Probeer het later nog eens.',
      sent: false,
    }
  }

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: naar,
      replyTo: user.email ?? undefined,
      subject: `Feedback op ${SITE_CONFIG.domain}`,
      html: `
        <h2>Feedback</h2>
        <p><b>Van:</b> ${escapeHtml(user.email ?? user.id)}</p>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      `,
    })
    if (error) {
      console.error('[feedback]', error)
      return {
        error: 'Versturen is niet gelukt. Probeer het later nog eens.',
        sent: false,
      }
    }
  } catch (e) {
    console.error('[feedback]', e)
    return {
      error: 'Versturen is niet gelukt. Probeer het later nog eens.',
      sent: false,
    }
  }

  return { error: null, sent: true }
}
