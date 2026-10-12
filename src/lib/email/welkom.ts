import { SITE_CONFIG } from '@/config/site'
import { EMAIL_FROM, meldAdres } from '@/lib/email/adressen'
import { maakMailer } from '@/lib/email/mailer'
import { SITE_URL } from '@/lib/seo'
import { createServiceRoleClient } from '@/lib/supabase/server'

export type WelkomResultaat =
  | { verstuurd: true }
  | {
      verstuurd: false
      reden: 'al-verstuurd' | 'niet-bevestigd' | 'geen-adres' | 'geen-sleutel' | 'fout'
    }

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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function alsTekst(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null
}

/**
 * Seintje aan Aaf dat deze leerling zijn adres heeft bevestigd.
 *
 * Gaat mee met de welkomstmail en dus met dezelfde vlag: wie geen tweede
 * welkomstmail krijgt, krijgt ook geen tweede seintje. Lukt het versturen
 * niet, dan blijft het bij één regel in de log — de welkomstmail is dan al
 * weg en die mag niet opnieuw. Het adres van de leerling komt niet in die log.
 */
async function seintjeBevestigd(
  supabase: ReturnType<typeof createServiceRoleClient>,
  user: {
    id: string
    email?: string | null
    email_confirmed_at?: string | null
    user_metadata?: Record<string, unknown>
  },
): Promise<void> {
  const naar = meldAdres()
  if (!naar) {
    console.error('[seintje bevestigd] geen NOTIFY_EMAIL; seintje niet verstuurd')
    return
  }

  const resend = maakMailer()
  if (!resend) {
    console.error('[seintje bevestigd] geen RESEND_API_KEY; seintje niet verstuurd')
    return
  }

  let username = alsTekst(user.user_metadata?.username)
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .maybeSingle()
    username = alsTekst(profile?.username) ?? username
  } catch {
    console.error('[seintje bevestigd] gebruikersnaam niet opgehaald')
  }

  const bevestigdOp = new Date(user.email_confirmed_at ?? Date.now()).toLocaleString(
    'nl-NL',
    { timeZone: 'Europe/Amsterdam' },
  )
  const email = user.email ?? null

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: naar,
      subject: `Adres bevestigd op ${SITE_CONFIG.domain}`,
      html: `
        <h2>Leerling heeft zijn adres bevestigd</h2>
        <p>Deze leerling heeft op de link in de bevestigingsmail geklikt en heeft de welkomstmail gekregen.</p>
        <table cellpadding="6">
          <tr><td><b>E-mail</b></td><td>${email ? escapeHtml(email) : '—'}</td></tr>
          <tr><td><b>Gebruikersnaam</b></td><td>${username ? escapeHtml(username) : '—'}</td></tr>
          <tr><td><b>Bevestigd op</b></td><td>${bevestigdOp}</td></tr>
          <tr><td><b>ID</b></td><td>${escapeHtml(user.id)}</td></tr>
        </table>
      `,
    })
    if (error) console.error('[seintje bevestigd] versturen mislukt')
  } catch {
    console.error('[seintje bevestigd] versturen mislukt')
  }
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
    // Vóór de vlag: zonder sleutel gaat er niets uit, en dan mag er ook niet
    // "verstuurd" komen te staan.
    const resend = maakMailer()
    if (!resend) {
      console.error('[welkomstmail] geen RESEND_API_KEY; mail overgeslagen')
      return { verstuurd: false, reden: 'geen-sleutel' }
    }

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

    // Vanaf hier staat de vlag. Gaat het versturen op welke manier dan ook mis
    // — een fout terug van Resend, of een fout die eruit vliegt — dan moet de
    // vlag terug, anders slaat een volgende poging de mail over.
    try {
      const videosUrl = `${SITE_URL}/nl/uitleg-videos`
      const { error: mailError } = await resend.emails.send({
        // Merknaam als afzender, geen persoonsnaam: dit is een no-reply-bericht.
        from: `${SITE_CONFIG.brand} <${EMAIL_FROM}>`,
        to: user.email,
        subject: `Welkom bij ${SITE_CONFIG.brand}!`,
        html: html(videosUrl),
        text: tekst(videosUrl),
      })
      if (mailError) throw mailError
    } catch (e) {
      console.error('[welkomstmail]', e)
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { ...user.user_metadata, welcome_sent_at: null },
      })
      return { verstuurd: false, reden: 'fout' }
    }

    await seintjeBevestigd(supabase, user)

    return { verstuurd: true }
  } catch (e) {
    console.error('[welkomstmail]', e)
    return { verstuurd: false, reden: 'fout' }
  }
}
