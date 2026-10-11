import { NextResponse, type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Respect an explicit `next` param if it's already locale-prefixed;
  // otherwise default to the Dutch dashboard.
  const nextParam = searchParams.get('next')
  const next = nextParam
    ? /^\/(nl|en)(\/|$)/.test(nextParam)
      ? nextParam          // already has locale prefix → use as-is
      : `/nl${nextParam}`  // no locale prefix → prepend default locale
    : '/nl/dashboard'      // no next param → default

  // Bestemming is de inlogpagina (bv. na e-mailbevestiging): geen sessie
  // aanmaken, zodat de gebruiker daar echt zelf kan inloggen. Het account is
  // op dat moment al bevestigd door Supabase's verify-endpoint.
  if (/^\/(nl|en)\/inloggen(\/|$|\?)/.test(next)) {
    const url = new URL(next, origin)
    // Alleen "bevestigd" zeggen als Supabase het ook écht bevestigd heeft.
    // Dat herken je aan de `code` in de adresregel. Ging het mis — de link is
    // verlopen of al een keer gebruikt — dan stuurt Supabase in plaats daarvan
    // `error`, `error_code` (bv. `otp_expired`) en `error_description` mee.
    // Die Engelse tekst hoort niet op het scherm van een leerling; de
    // inlogpagina maakt er een eigen melding van.
    const mislukt = searchParams.has('error') || searchParams.has('error_code')
    if (code && !mislukt) {
      url.searchParams.set('bevestigd', '1')
    } else {
      url.searchParams.set('mail', 'verlopen')
    }
    return NextResponse.redirect(url)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  const url = new URL('/nl/inloggen', origin)
  url.searchParams.set('error', 'auth_callback_failed')
  return NextResponse.redirect(url)
}
