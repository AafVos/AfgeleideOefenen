import { stuurWelkomstmail } from '@/lib/email/welkom'

/**
 * Supabase Database Webhook op `auth.users` (UPDATE). Zodra `email_confirmed_at`
 * van leeg naar gevuld gaat, krijgt de leerling de welkomstmail.
 *
 * Instellen: Supabase → Database → Webhooks → nieuwe webhook op `auth.users`,
 * event UPDATE, type HTTP Request POST naar
 * `https://<domein>/api/webhooks/welkom`, met header
 * `x-webhook-secret: <WEBHOOK_SECRET>`.
 */
export async function POST(req: Request) {
  if (req.headers.get('x-webhook-secret') !== process.env.WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await req.json()
    if (payload.type !== 'UPDATE') return Response.json({ ok: true, reden: 'geen-update' })

    const bevestigdNu = payload.record?.email_confirmed_at ?? null
    const bevestigdEerder = payload.old_record?.email_confirmed_at ?? null
    // Alleen op de overgang; elke andere wijziging aan de gebruiker negeren we.
    if (!bevestigdNu || bevestigdEerder) {
      return Response.json({ ok: true, reden: 'geen-bevestiging' })
    }

    const userId = payload.record?.id
    if (!userId) return Response.json({ ok: true, reden: 'geen-id' })

    const resultaat = await stuurWelkomstmail(userId)
    return Response.json({ ok: true, ...resultaat })
  } catch (e) {
    console.error('[webhook welkom]', e)
    return Response.json({ error: 'Bad request' }, { status: 400 })
  }
}
