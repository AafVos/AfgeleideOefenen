import { Resend } from 'resend'

import { SITE_CONFIG } from '@/config/site'
import { createServiceRoleClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * De metagegevens van een auth-rij zijn vrije JSON: daar kan alles in staan.
 * Alleen een niet-lege tekst is bruikbaar als gebruikersnaam.
 */
function alsTekst(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null
}

export async function POST(req: Request) {
  // Verify webhook secret
  const secret = req.headers.get('x-webhook-secret')
  if (secret !== process.env.WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await req.json()

    if (payload.type !== 'INSERT') {
      return Response.json({ ok: true })
    }

    const record = payload.record
    const aangemeldOp = new Date(record.created_at).toLocaleString('nl-NL', {
      timeZone: 'Europe/Amsterdam',
    })

    // De webhook hangt aan `auth.users` bij INSERT. Op dat moment bestaat de
    // rij in `profiles` wel (een trigger maakt hem aan), maar staat de
    // gebruikersnaam er nog niet in: die zet de site er pas na het aanmelden
    // bij. De naam zit op dat moment al wel in de metagegevens van de
    // auth-rij, omdat het registratieformulier hem aan Supabase meegeeft.
    // We proberen daarom op volgorde: wat er in het seintje zelf zit, dan
    // `profiles`, dan de metagegevens. Het e-mailadres staat niet in elke
    // soort record, dus dat halen we op via de service-role.
    let email: string | null = record.email ?? null
    let username: string | null =
      alsTekst(record.username) ?? alsTekst(record.raw_user_meta_data?.username)
    try {
      const supabase = createServiceRoleClient()
      const { data } = await supabase.auth.admin.getUserById(record.id)
      email = data.user?.email ?? email
      if (!username) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', record.id)
          .maybeSingle()
        username =
          alsTekst(profile?.username) ??
          alsTekst(data.user?.user_metadata?.username)
      }
    } catch (lookupErr) {
      console.error('Kon gebruikersgegevens niet ophalen:', lookupErr)
    }

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? `no-reply@${SITE_CONFIG.domain}`,
      to: process.env.NOTIFY_EMAIL!,
      subject: `Nieuwe gebruiker op ${SITE_CONFIG.domain}`,
      html: `
        <h2>Nieuwe registratie</h2>
        <table cellpadding="6">
          <tr><td><b>E-mail</b></td><td>${email ? escapeHtml(email) : '—'}</td></tr>
          <tr><td><b>Gebruikersnaam</b></td><td>${username ? escapeHtml(username) : '—'}</td></tr>
          <tr><td><b>Aangemeld op</b></td><td>${aangemeldOp}</td></tr>
          <tr><td><b>ID</b></td><td>${escapeHtml(String(record.id))}</td></tr>
        </table>
      `,
    })

    // De Resend-SDK gooit geen fout bij een geweigerde verzending
    // (bv. niet-geverifieerd afzenderdomein); die zit in `error`.
    if (error) {
      console.error('Resend kon de mail niet versturen:', error)
      return Response.json({ error: 'Email not sent', detail: error }, { status: 502 })
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return Response.json({ error: 'Failed' }, { status: 500 })
  }
}
