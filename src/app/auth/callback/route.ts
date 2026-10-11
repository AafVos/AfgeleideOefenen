import { NextResponse, type NextRequest } from 'next/server'
import { after } from 'next/server'

import { stuurWelkomstmail } from '@/lib/email/welkom'
import { createClient } from '@/lib/supabase/server'
import { zetGekozenGebruikersnaam } from '@/lib/supabase/gebruikersnaam'

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

  // E-mailbevestiging: de code inwisselen voor een sessie, zodat de leerling
  // direct ingelogd is op de oefenpagina — net als bij aanmelden zonder
  // bevestigingsmail. Oude mails met `next=/nl/inloggen` blijven werken: ook
  // dan wordt de code ingewisseld; de inlogpagina stuurt een ingelogde
  // leerling alsnog door.
  //
  // Of het ook gelukt is, zegt Supabase op twee verschillende manieren:
  //
  //   * De mail van het registreren is met een code-uitdaging aangevraagd.
  //     Gelukt geeft `?code=…`, mislukt geeft `?error=…&error_code=otp_expired`.
  //     Dat staat in de adresregel, dus daar kijken we hieronder naar.
  //   * Een opnieuw gestuurde mail (`auth.resend`) gaat zonder code-uitdaging.
  //     Dan zet Supabase het antwoord achter de `#`, en dat stuk stuurt een
  //     browser nooit naar de server. Daar kan hier dus niets over gezegd
  //     worden: dat vangt de inlogpagina zelf op (`mail=onbekend`).
  if (/^\/nl\/inloggen(\/|$|\?)/.test(next)) {
    if (searchParams.has('error') || searchParams.has('error_code')) {
      const url = new URL(next, origin)
      url.searchParams.set('mail', 'verlopen')
      return NextResponse.redirect(url)
    }

    if (code) {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        const url = new URL(next, origin)
        url.searchParams.set('mail', 'verlopen')
        return NextResponse.redirect(url)
      }

      // Ingelogd op de oefenpagina na bevestigen.
      // Kopieer de gebruikersnaam uit user_metadata naar profiles, net als
      // de login-action doet -- anders staat er voor altijd een e-mailadres
      // in de bovenbalk in plaats van de naam die de leerling koos.
      if (data.user) {
        await zetGekozenGebruikersnaam(supabase, data.user)

        after(async () => {
          await stuurWelkomstmail(data.user.id)
        })
      }
      return NextResponse.redirect(`${origin}/nl/oefenen`)
    }

    // Geen code en geen fout: de `#`-staart met het antwoord is niet bij de
    // server aangekomen. De inlogpagina vangt dat zelf op.
    const url = new URL(next, origin)
    url.searchParams.set('mail', 'onbekend')
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