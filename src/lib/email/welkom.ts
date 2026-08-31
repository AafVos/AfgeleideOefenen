import { Resend } from 'resend'

import { SITE_CONFIG } from '@/config/site'
import { createServiceRoleClient } from '@/lib/supabase/server'

const EMAIL_FROM = process.env.EMAIL_FROM ?? `no-reply@${SITE_CONFIG.domain}`
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${SITE_CONFIG.domain}`

export type WelkomResultaat =
  | { verstuurd: true }
  | { verstuurd: false; reden: 'al-verstuurd' | 'niet-bevestigd' | 'geen-adres' | 'fout' }

/**
 * Zelfde opmaak als de bevestigingsmail in supabase/email-templates/, zodat de
 * twee mails die een leerling van ons krijgt als één serie voelen: crème
 * achtergrond, kaart van 540 px, woordmerk erboven, serif-koppen, groene knop
 * en de formule-knipoog onderaan. Houd ze bij wijzigingen synchroon.
 */
function html(videosUrl: string): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #f7f6f3; padding: 32px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px;">

        <tr>
          <td align="center" style="padding: 0 0 20px;">
            <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 20px; color: #1a1a18;">
              ${SITE_CONFIG.brand}<span style="color: #2d6a4f;">.nl</span>
            </span>
          </td>
        </tr>

        <tr>
          <td style="background: #ffffff; border: 1px solid #e6e3db; border-radius: 14px; padding: 36px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

              <tr>
                <td align="center" style="font-family: Georgia, 'Times New Roman', serif; font-size: 26px; line-height: 1.3; color: #1a1a18; padding-bottom: 12px;">
                  Je account is klaar.
                </td>
              </tr>

              <tr>
                <td align="center" style="font-family: 'DM Sans', Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #6f6d65; padding-bottom: 16px;">
                  Leuk dat je er bent.
                </td>
              </tr>

              <tr>
                <td align="center" style="font-family: 'DM Sans', Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #6f6d65; padding-bottom: 26px;">
                  Loop je vast op een opgave? Stuur hem in, dan maak ik er een
                  uitlegvideo van. Een foto uit je boek mag ook.
                </td>
              </tr>

              <tr>
                <td align="center" style="padding-bottom: 24px;">
                  <a href="${videosUrl}"
                     style="display: inline-block; background: #2d6a4f; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-family: 'DM Sans', Arial, sans-serif; font-size: 15px; font-weight: 600;">
                    Stel je eerste vraag
                  </a>
                </td>
              </tr>

              <tr>
                <td align="center" style="font-family: 'DM Sans', Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #6f6d65; padding-bottom: 24px;">
                  Vertel het door aan vrienden. Hoe meer vragen er binnenkomen,
                  hoe meer uitleg er voor iedereen bij komt.
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
            Je krijgt deze e-mail omdat je zojuist je account op
            ${SITE_CONFIG.domain} hebt bevestigd.
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>`
}

function tekst(videosUrl: string): string {
  return `Je account is klaar.

Leuk dat je er bent.

Loop je vast op een opgave? Stuur hem in, dan maak ik er een uitlegvideo van. Een foto uit je boek mag ook: ${videosUrl}

Vertel het door aan vrienden. Hoe meer vragen er binnenkomen, hoe meer uitleg er voor iedereen bij komt.

Groeten van Aaf`
}

/**
 * Stuurt de welkomstmail, maar alleen als het adres bevestigd is en er nog geen
 * welkomstmail uit is. De vlag staat in `user_metadata.welcome_sent_at` en niet
 * in een eigen kolom, zodat hier geen migratie voor nodig is.
 *
 * Wordt vanaf twee kanten aangeroepen — de webhook op e-mailbevestiging en het
 * inloggen als vangnet — dus deze functie moet idempotent zijn.
 */
export async function stuurWelkomstmail(userId: string): Promise<WelkomResultaat> {
  try {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase.auth.admin.getUserById(userId)
    if (error || !data.user) return { verstuurd: false, reden: 'fout' }

    const user = data.user
    if (!user.email) return { verstuurd: false, reden: 'geen-adres' }
    if (!user.email_confirmed_at) return { verstuurd: false, reden: 'niet-bevestigd' }
    if (user.user_metadata?.welcome_sent_at) return { verstuurd: false, reden: 'al-verstuurd' }

    // Vlag eerst zetten: bij twee gelijktijdige aanroepen is één mail te weinig
    // vervelender dan geen, maar twee mails naar een leerling is erger.
    const nu = new Date().toISOString()
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { ...user.user_metadata, welcome_sent_at: nu },
    })

    const videosUrl = `${SITE_URL}/nl/uitleg-videos`
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error: mailError } = await resend.emails.send({
      // Merknaam als afzender, geen persoonsnaam: dit is een no-reply-bericht.
      from: `${SITE_CONFIG.brand} <${EMAIL_FROM}>`,
      to: user.email,
      subject: `Welkom bij ${SITE_CONFIG.brand}!`,
      html: html(videosUrl),
      text: tekst(videosUrl),
    })

    if (mailError) {
      console.error('[welkomstmail]', mailError)
      // Vlag terugdraaien, zodat een volgende poging het opnieuw probeert.
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { ...user.user_metadata, welcome_sent_at: null },
      })
      return { verstuurd: false, reden: 'fout' }
    }

    return { verstuurd: true }
  } catch (e) {
    console.error('[welkomstmail]', e)
    return { verstuurd: false, reden: 'fout' }
  }
}
