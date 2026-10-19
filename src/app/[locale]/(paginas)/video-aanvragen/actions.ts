'use server'

import { cookies } from 'next/headers'

import { SITE_CONFIG } from '@/config/site'
import { EMAIL_FROM, meldAdres } from '@/lib/email/adressen'
import { maakMailer } from '@/lib/email/mailer'
import { createServiceRoleClient } from '@/lib/supabase/server'
import {
  isRobot,
  isVol,
  leesAanvraag,
  leesTeller,
  MAX_PER_DAG_IN_WOORDEN,
  schrijfTeller,
  TELLER_UREN,
  vraagRegel,
} from '@/lib/video-aanvraag'

/** Naam van het koekje met de teller. Geen inhoud, alleen een aantal. */
const TELLER_KOEKJE = 'video-aanvraag'

export type VideoAanvraagState = {
  error: string | null
  sent: boolean
}

function escapeHtml(s: string): string {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

/**
 * Een leerling vraagt een uitlegvideo aan bij een examenvraag.
 *
 * De aanvraag gaat in de tabel `video_aanvragen` (migratie 0080) en er gaat
 * een seintje naar `NOTIFY_EMAIL`. Lukt het mailen niet, dan staat de
 * aanvraag er nog steeds: het overzicht op de beheerpagina leest de tabel.
 *
 * Hiervoor hoeft niemand in te loggen. Tegen robots staan er twee dingen in
 * de weg: een verborgen veld dat een mens nooit invult, en een teller in een
 * koekje van hoogstens drie aanvragen per dag.
 */
export async function vraagExamenVideoAction(
  _prev: VideoAanvraagState,
  formData: FormData,
): Promise<VideoAanvraagState> {
  // Een robot krijgt hetzelfde scherm als een leerling, maar er gebeurt niets.
  if (isRobot(formData)) return { error: null, sent: true }

  const uitslag = leesAanvraag(formData)
  if (!uitslag.ok) return { error: uitslag.fout, sent: false }
  const aanvraag = uitslag.aanvraag

  const koekjes = await cookies()
  const nu = Date.now()
  const teller = leesTeller(koekjes.get(TELLER_KOEKJE)?.value, nu)
  if (isVol(teller)) {
    return {
      error: `Je hebt vandaag al ${MAX_PER_DAG_IN_WOORDEN} video’s aangevraagd. Morgen mag er weer een.`,
      sent: false,
    }
  }

  const supabase = createServiceRoleClient()
  const { error } = await supabase.from('video_aanvragen').insert({
    site: SITE_CONFIG.variant,
    jaar: aanvraag.jaar,
    tijdvak: aanvraag.tijdvak,
    vraagnummer: aanvraag.vraagnummer,
    toelichting: aanvraag.toelichting,
    email: aanvraag.email,
    mag_mailen: aanvraag.magMailen,
  })
  if (error) {
    console.error('[video-aanvraag]', error.message)
    return { error: 'Versturen mislukt. Probeer het later opnieuw.', sent: false }
  }

  koekjes.set(TELLER_KOEKJE, schrijfTeller({ ...teller, aantal: teller.aantal + 1 }), {
    httpOnly: true,
    sameSite: 'lax',
    // Lokaal draait de site op http; daar weigert de browser een secure koekje.
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: TELLER_UREN * 60 * 60,
  })

  await stuurSeintje(aanvraag)

  return { error: null, sent: true }
}

/**
 * Het seintje aan Aaf. Gaat het mis, dan merkt de leerling daar niets van:
 * zijn aanvraag staat al in de tabel en komt op de beheerpagina te staan.
 */
async function stuurSeintje(aanvraag: {
  jaar: number
  tijdvak: number
  vraagnummer: string
  toelichting: string | null
  email: string | null
}) {
  const naar = meldAdres()
  if (!naar) {
    console.error('[video-aanvraag] geen NOTIFY_EMAIL ingesteld; seintje niet verstuurd')
    return
  }

  const resend = maakMailer()
  if (!resend) {
    console.error('[video-aanvraag] geen RESEND_API_KEY; seintje niet verstuurd')
    return
  }

  const regel = vraagRegel(aanvraag)
  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: naar,
      replyTo: aanvraag.email ?? undefined,
      subject: `Video aangevraagd: ${regel}`,
      html: `
        <h2>Video aangevraagd</h2>
        <p><b>${escapeHtml(regel)}</b></p>
        ${
          aanvraag.toelichting
            ? `<p style="white-space:pre-wrap">${escapeHtml(aanvraag.toelichting)}</p>`
            : '<p>Geen toelichting.</p>'
        }
        <p>${
          aanvraag.email
            ? `Wil bericht als de video er is: ${escapeHtml(aanvraag.email)}`
            : 'Wil geen bericht.'
        }</p>
        <p>Via ${escapeHtml(SITE_CONFIG.domain)}. Het overzicht staat op /admin/video-aanvragen.</p>
      `,
    })
    if (error) console.error('[video-aanvraag]', error)
  } catch (e) {
    console.error('[video-aanvraag]', e)
  }
}
