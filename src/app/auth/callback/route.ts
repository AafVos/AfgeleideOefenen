import { NextResponse, type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Respect an explicit `next` param if it's already locale-prefixed;
  // otherwise default to the Dutch dashboard.
  const nextParam = searchParams.get('next')
  const next = nextParam
    ? /^\/nl(\/|$)/.test(nextParam)
      ? nextParam          // already has locale prefix → use as-is
      : `/nl${nextParam}`  // no locale prefix → prepend default locale
    : '/nl/dashboard'      // no next param → default

  // Bestemming is de inlogpagina (bv. na e-mailbevestiging): geen sessie
  // aanmaken, zodat de gebruiker daar echt zelf kan inloggen. Het account is
  // op dat moment al bevestigd door Supabase's verify-endpoint.
  //
  // Of het ook gelukt is, zegt Supabase op twee verschillende manieren, en dat
  // hangt af van de mail waar de link in stond:
  //
  //   * De mail van het registreren is met een code-uitdaging aangevraagd.
  //     Gelukt geeft `?code=…`, mislukt geeft `?error=…&error_code=otp_expired`.
  //     Dat staat in de adresregel, dus daar kijken we hieronder naar.
  //   * Een opnieuw gestuurde mail (`auth.resend`) gaat zonder code-uitdaging.
  //     Dan zet Supabase het antwoord achter de `#`, en dat stuk stuurt een
  //     browser nooit naar de server. Daar kan hier dus niets over gezegd
  //     worden: dat vangt de inlogpagina zelf op (`mail=onbekend`).
  if (/^\/nl\/inloggen(\/|$|\?)/.test(next)) {
    const url = new URL(next, origin)
    const mislukt = searchParams.has('error') || searchParams.has('error_code')
    url.searchParams.set('mail', mislukt ? 'verlopen' : code ? 'bevestigd' : 'onbekend')
    return NextResponse.redirect(url)
  }

  // Bestemming is niet de inlogpagina (bv. de resetpagina na een
  // wachtwoordverzoek) en Supabase meldt een fout: de link is verlopen of al
  // gebruikt. Stuur naar de pagina waar je een nieuwe link kunt aanvragen,
  // zodat het formulier meteen onder de melding staat.
  if (searchParams.has('error') || searchParams.has('error_code')) {
    const url = new URL('/nl/wachtwoord-vergeten', origin)
    url.searchParams.set('mail', 'verlopen')
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
