import { after, NextResponse, type NextRequest } from 'next/server'

import { bestemmingNaBevestigen, bestemmingNaInloggen } from '@/lib/auth/bestemming'
import { googleFoutSleutel, isNieuweAanmelding, moetNaamVragen } from '@/lib/auth/google'
import { oefenpadUitAdres, veiligOefenpad } from '@/lib/auth/oefenpad'
import { stuurWelkomstmail } from '@/lib/email/welkom'
import { leesHerkomst } from '@/lib/herkomst'
import { REGISTRATIE_PARAMETER } from '@/lib/meten/melden'
import { createClient } from '@/lib/supabase/server'
import { zetGekozenGebruikersnaam } from '@/lib/supabase/gebruikersnaam'

/**
 * Zet de herkomst één keer op het profiel, voor een gloednieuw account dat
 * via Google binnenkwam en dus niet langs het registratieformulier ging.
 * De trigger `herkomst_blijft_staan` (migratie 0086) laat dit alleen toe
 * zolang er nog niets stond; een tweede poging verandert niets.
 */
async function zetHerkomstVoorGoogle(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  nieuw: boolean,
  ruweHerkomst: string | null,
) {
  if (!nieuw) return
  const herkomst = leesHerkomst(ruweHerkomst)
  if (!herkomst) return
  const { error } = await supabase
    .from('profiles')
    .update({ herkomst })
    .eq('id', userId)
    .is('herkomst', null)
  // Lukt dit niet, dan blijft het account gewoon bestaan zonder herkomst.
  if (error) console.error('[herkomst]', error.message)
}

/**
 * Een aanmelding via Google komt niet langs het registratieformulier, dus
 * meldt dat formulier ook niets aan de klikmeting. Deze parameter vertelt het
 * tabblad dat er zojuist een account is aangemaakt; `src/lib/meten/meter.ts`
 * pikt hem op en haalt hem meteen uit de adresregel. Er staat alleen `google`
 * in, niets over wie de leerling is.
 */
function metNieuweAanmelding(url: URL, nieuw: boolean) {
  if (nieuw) url.searchParams.set(REGISTRATIE_PARAMETER, 'google')
  return url
}

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

  // Terugkeer van "Doorgaan met Google". Los van de bevestigingsmail: daar
  // wijst `next` naar de inlogpagina, hier naar het dashboard of een som.
  if (searchParams.get('via') === 'google') {
    if (searchParams.has('error') || searchParams.has('error_code') || !code) {
      const url = metOefenpad(new URL('/nl/inloggen', origin), nextParam)
      url.searchParams.set('error', googleFoutSleutel(searchParams.get('error')))
      return NextResponse.redirect(url)
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error || !data.user) {
      const url = metOefenpad(new URL('/nl/inloggen', origin), nextParam)
      url.searchParams.set('error', 'auth_callback_failed')
      return NextResponse.redirect(url)
    }

    // Beide uitgangen hieronder geven dit mee, ook de omweg langs de naamvraag.
    const nieuw = isNieuweAanmelding(data.user)

    await zetGekozenGebruikersnaam(supabase, data.user)
    // Los van de naamvraag: die redirect zou de ?van= hieronder kwijtraken,
    // dus de herkomst wordt meteen gezet, vóór die afslag.
    await zetHerkomstVoorGoogle(supabase, data.user.id, nieuw, searchParams.get('van'))

    if (moetNaamVragen(data.user)) {
      return NextResponse.redirect(
        metNieuweAanmelding(
          metOefenpad(new URL('/nl/gebruikersnaam', origin), nextParam),
          nieuw,
        ),
      )
    }

    const userId = data.user.id
    after(() => stuurWelkomstmail(userId))
    const doel = await bestemmingNaInloggen(supabase, oefenpad, 'nl')
    return NextResponse.redirect(metNieuweAanmelding(new URL(doel, origin), nieuw))
  }

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
