import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    const user = payload.record
    const aangemeldOp = new Date(user.created_at).toLocaleString('nl-NL', {
      timeZone: 'Europe/Amsterdam',
    })

    await resend.emails.send({
      from: 'noreply@afgeleideoefenen.nl',
      to: process.env.NOTIFY_EMAIL!,
      subject: `Nieuwe gebruiker op afgeleideoefenen.nl`,
      html: `
        <h2>Nieuwe registratie</h2>
        <table cellpadding="6">
          <tr><td><b>Aangemeld op</b></td><td>${aangemeldOp}</td></tr>
          <tr><td><b>ID</b></td><td>${user.id}</td></tr>
        </table>
      `,
    })

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return Response.json({ error: 'Failed' }, { status: 500 })
  }
}
