import { after, NextResponse, type NextRequest } from 'next/server'

import { bestemmingNaBevestigen } from '@/lib/auth/bestemming'
import { oefenpadUitAdres, veiligOefenpad } from '@/lib/auth/oefenpad'
import { stuurWelkomstmail } from '@/lib/email/welkom'
import { createClient } from '@/lib/supabase/server'
import { zetGekozenGebruikersnaam } from '@/lib/supabase/gebruikersnaam'

function metOefenpad(url: URL, nextParam: string | null) {
  const pad = oefenpadUitAdres(nextParam)
  if (pad) url.searchParams.set('naar', pad)
  return url
}

function inlogMetMail(origin: string, mail: string, oefenpad: string | null) {
  const url = new URL('/nl/inloggen', origin)
  url.searchParams.set('mail', mail)
  if (oefenpad) url.searchParams.set('naar', oefenpad)
  return NextResponse.redirect(url)
}

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

  // Alleen een pad dat met /oefenen begint telt als gekozen soort.
  // Iets anders (een ander pad, een adres buiten de site) valt weg.
  const oefenpad = veiligOefenpad(nextParam)

  // E-mailbevestiging: de code inwisselen voor een sessie, zodat de leerling
  // direct ingelogd is op zijn eerste opgave — net als bij aanmelden zonder
  // bevestigingsmail. Oude mails met `next=/nl/inloggen` blijven werken: ook
  // dan wordt de code ingewisseld. Een gekozen soort (`next=/oefenen?…`)
  // komt op die som uit, niet op het hoofdstukkenmenu.
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
  const bevestigen = /^\/nl\/inloggen(\/|$|\?)/.test(next) || oefenpad !== null
  if (bevestigen) {
    if (searchParams.has('error') || searchParams.has('error_code')) {
      return inlogMetMail(origin, 'verlopen', oefenpad)
    }

    if (code) {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        return inlogMetMail(origin, 'verlopen', oefenpad)
      }

      // Ingelogd na bevestigen. Kopieer de gebruikersnaam uit user_metadata
      // naar profiles, net als de login-action doet — anders staat er voor
      // altijd een e-mailadres in de bovenbalk in plaats van de naam die de
      // leerling koos.
      if (data.user) {
        await zetGekozenGebruikersnaam(supabase, data.user)

        const userId = data.user.id
        after(async () => {
          await stuurWelkomstmail(userId)
        })
      }

      const doel = await bestemmingNaBevestigen(supabase, oefenpad)
      return NextResponse.redirect(`${origin}${doel}`)
    }

    // Geen code en geen fout: de `#`-staart met het antwoord is niet bij de
    // server aangekomen. De inlogpagina vangt dat zelf op.
    return inlogMetMail(origin, 'onbekend', oefenpad)
  }

  // Bestemming is niet de inlogpagina (bv. de resetpagina na een
  // wachtwoordverzoek) en Supabase meldt een fout: de link is verlopen of al
  // gebruikt. Stuur naar de pagina waar je een nieuwe link kunt aanvragen,
  // zodat het formulier meteen onder de melding staat.
  if (searchParams.has('error') || searchParams.has('error_code')) {
    const url = metOefenpad(new URL('/nl/wachtwoord-vergeten', origin), nextParam)
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

  const url = metOefenpad(new URL('/nl/inloggen', origin), nextParam)
  url.searchParams.set('error', 'auth_callback_failed')
  return NextResponse.redirect(url)
}
