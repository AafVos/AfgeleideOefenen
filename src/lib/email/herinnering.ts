import { SITE_CONFIG } from '@/config/site'
import { EMAIL_FROM } from '@/lib/email/adressen'
import { maakMailer } from '@/lib/email/mailer'
import { SITE_URL } from '@/lib/seo'

/**
 * De herinneringsmail: één mailtje voor een leerling die een tijdje niet
 * geoefend heeft, met daarin de eerstvolgende soort som (zie AFG-487).
 *
 * Zelfde opmaak als de welkomstmail en de bevestigingsmail, zodat de mails die
 * een leerling van ons krijgt als één serie voelen. Houd ze bij wijzigingen
 * synchroon met `src/lib/email/welkom.ts` en `supabase/email-templates/`.
 */

export type HerinneringInhoud = {
  /** De soort som waar de leerling verdergaat, bijvoorbeeld "Productregel". */
  soortSom: string
  /** Waar die soort som staat, voor het regeltje eronder. */
  hoofdstuk: string
  onderwerp: string
  /** Pad naar die soort som op de oefenpagina, zonder domein. */
  pad: string
  /** Pad van de afmeldlink, zonder domein. */
  afmeldPad: string
}

export type HerinneringResultaat =
  | { verstuurd: true }
  | { verstuurd: false; reden: 'geen-sleutel' | 'fout' }

function escapeHtml(waarde: string): string {
  return waarde
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function onderwerpRegel(inhoud: HerinneringInhoud): string {
  return `Verder met ${inhoud.soortSom}?`
}

export function herinneringHtml(inhoud: HerinneringInhoud): string {
  const oefenUrl = `${SITE_URL}${inhoud.pad}`
  const afmeldUrl = `${SITE_URL}${inhoud.afmeldPad}`
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #f7f6f3; padding: 32px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px;">

        <tr>
          <td align="center" style="padding: 0 0 20px;">
            <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 20px; color: #1a1a18;">
              ${SITE_CONFIG.brandVoor}<span style="color: #2d6a4f;">${SITE_CONFIG.brandAccent}</span>
            </span>
          </td>
        </tr>

        <tr>
          <td style="background: #ffffff; border: 1px solid #e6e3db; border-radius: 14px; padding: 36px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

              <tr>
                <td align="center" style="font-family: Georgia, 'Times New Roman', serif; font-size: 26px; line-height: 1.3; color: #1a1a18; padding-bottom: 12px;">
                  Nog even verder?
                </td>
              </tr>

              <tr>
                <td align="center" style="font-family: 'DM Sans', Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #6f6d65; padding-bottom: 16px;">
                  Je hebt een tijdje niet geoefend. Je gaat verder bij:
                </td>
              </tr>

              <tr>
                <td align="center" style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; line-height: 1.3; color: #1a1a18; padding-bottom: 6px;">
                  ${escapeHtml(inhoud.soortSom)}
                </td>
              </tr>

              <tr>
                <td align="center" style="font-family: 'DM Sans', Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #a8a599; padding-bottom: 26px;">
                  ${escapeHtml(inhoud.hoofdstuk)} · ${escapeHtml(inhoud.onderwerp)}
                </td>
              </tr>

              <tr>
                <td align="center" style="padding-bottom: 24px;">
                  <a href="${escapeHtml(oefenUrl)}"
                     style="display: inline-block; background: #2d6a4f; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-family: 'DM Sans', Arial, sans-serif; font-size: 15px; font-weight: 600;">
                    Pak deze sommen op
                  </a>
                </td>
              </tr>

              <tr>
                <td align="center" style="font-family: 'DM Sans', Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #6f6d65; padding-bottom: 24px;">
                  Tien minuten is genoeg. Daarna weet je weer hoe het ging.
                </td>
              </tr>

              <tr>
                <td align="center" style="font-family: Georgia, 'Times New Roman', serif; font-size: 15px; color: #1a1a18; border-top: 1px solid #eeece5; padding-top: 22px;">
                  Groeten van Aaf
                </td>
              </tr>

            </table>
          </td>
        </tr>

        <tr>
          <td align="center" style="font-family: 'DM Sans', Arial, sans-serif; font-size: 12px; line-height: 1.6; color: #a8a599; padding: 20px 16px 0;">
            Je krijgt deze e-mail omdat je herinneringen hebt aangezet op
            ${SITE_CONFIG.domain}.
            <a href="${escapeHtml(afmeldUrl)}" style="color: #6f6d65;">Geen herinneringen meer</a>.
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>`
}

export function herinneringTekst(inhoud: HerinneringInhoud): string {
  const oefenUrl = `${SITE_URL}${inhoud.pad}`
  const afmeldUrl = `${SITE_URL}${inhoud.afmeldPad}`
  return `Nog even verder?

Je hebt een tijdje niet geoefend. Je gaat verder bij: ${inhoud.soortSom} (${inhoud.hoofdstuk} · ${inhoud.onderwerp}).

Pak deze sommen op: ${oefenUrl}

Tien minuten is genoeg. Daarna weet je weer hoe het ging.

Groeten van Aaf

Je krijgt deze e-mail omdat je herinneringen hebt aangezet op ${SITE_CONFIG.domain}. Geen herinneringen meer: ${afmeldUrl}`
}

/**
 * Stuurt één herinnering. Houdt zelf niets bij: de taak die hem aanroept zet
 * de teller en het tijdstip in `profiles`, zodat er maar op één plek geteld
 * wordt.
 */
export async function stuurHerinnering(
  adres: string,
  inhoud: HerinneringInhoud,
): Promise<HerinneringResultaat> {
  const resend = maakMailer()
  if (!resend) {
    console.error('[herinnering] geen RESEND_API_KEY; mail overgeslagen')
    return { verstuurd: false, reden: 'geen-sleutel' }
  }

  try {
    const { error } = await resend.emails.send({
      // Merknaam als afzender, geen persoonsnaam: dit is een no-reply-bericht.
      from: `${SITE_CONFIG.brandNaam} <${EMAIL_FROM}>`,
      to: adres,
      subject: onderwerpRegel(inhoud),
      html: herinneringHtml(inhoud),
      text: herinneringTekst(inhoud),
      // Zo kan een mailprogramma zelf een afmeldknop tonen, buiten de mail om.
      headers: { 'List-Unsubscribe': `<${SITE_URL}${inhoud.afmeldPad}>` },
    })
    if (error) throw error
    return { verstuurd: true }
  } catch (e) {
    // Het adres van de leerling hoort niet in de log.
    console.error('[herinnering] versturen mislukt', e)
    return { verstuurd: false, reden: 'fout' }
  }
}
