import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { routing } from '@/i18n/routing'
import { gebruikersnaamBestemming, moetNaamVragen, padZonderNaamvraag } from '@/lib/auth/google'
import { inlogAdres } from '@/lib/auth/oefenpad'

import { heeftSessiekoekje } from './sessie-koekje'
import type { Database } from './types'

const TAAL = routing.defaultLocale

// Pagina's waar je ingelogd voor moet zijn. Schrijf ze hier zonder taalcode
// op: `zonderTaalcode` hieronder haalt de `/nl` er eerst af.
//
// Deze lijst hoort gelijk te lopen met de pagina's die de controle ook zelf
// doen — via `requireUser()` in hun `layout.tsx` of `page.tsx`. Die controle
// blijft staan: dit poortje scheelt alleen een rondje door de pagina.
const ALLEEN_INGELOGD = [
  '/dashboard',
  '/feedback',
  '/gebruikersnaam',
  '/instellingen',
  '/oefenen',
  '/zelf-toets',
]

// `/nl/oefenen` wordt `/oefenen`, en `/nl` wordt `/`. De adressen van de site
// beginnen met een taalcode, de lijst hierboven niet.
function zonderTaalcode(pad: string) {
  if (pad === `/${TAAL}`) return '/'
  if (pad.startsWith(`/${TAAL}/`)) return pad.slice(`/${TAAL}`.length)
  return pad
}

export async function updateSession(request: NextRequest) {
  const pad = request.nextUrl.pathname
  const padZonderTaal = zonderTaalcode(pad)

  const naarInloggen = () => {
    const url = request.nextUrl.clone()
    // Alleen een pad dat met /oefenen begint blijft bewaard, als één
    // parameter. Zoekwoorden van de som horen niet los op het inlogscherm,
    // en een ander pad (dashboard, instellingen) ook niet.
    const doel = new URL(inlogAdres(padZonderTaal, request.nextUrl.search), request.url)
    url.pathname = doel.pathname
    url.search = doel.search
    return NextResponse.redirect(url)
  }

  // Geen sessiekoekje: niemand is ingelogd. Supabase overslaan scheelt de
  // wachtronde die de startpagina anders ruim een seconde kostte.
  if (!heeftSessiekoekje(request.cookies.getAll())) {
    if (pad.startsWith('/admin')) return naarInloggen()
    if (ALLEEN_INGELOGD.some((p) => padZonderTaal.startsWith(p))) return naarInloggen()
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data: userData, error: userError } = await supabase.auth.getUser()
  const user = userData.user

  // Stale or revoked refresh token (e.g. user was deleted). Clear all Supabase
  // auth cookies so the next request starts fresh — otherwise every request
  // logs an Invalid Refresh Token error.
  if (userError?.code === 'refresh_token_not_found' && !user) {
    for (const cookie of request.cookies.getAll()) {
      if (cookie.name.startsWith('sb-')) {
        supabaseResponse.cookies.delete(cookie.name)
      }
    }
  }

  // Eerste keer via Google: eerst een gebruikersnaam, daarna de rest van
  // de site. Uitloggen en de terugkeer van Google blijven bereikbaar.
  if (user && moetNaamVragen(user) && !padZonderNaamvraag(pad)) {
    const doel = new URL(
      gebruikersnaamBestemming(padZonderTaal, request.nextUrl.search),
      request.url,
    )
    const url = request.nextUrl.clone()
    url.pathname = doel.pathname
    url.search = doel.search
    const antwoord = NextResponse.redirect(url)
    for (const koekje of supabaseResponse.cookies.getAll()) {
      antwoord.cookies.set(koekje)
    }
    return antwoord
  }

  // De startpagina zelf vraagt niet meer wie er is. Een ingelogde leerling
  // hoort daar niet te blijven: meteen door naar het dashboard.
  if (user && padZonderTaal === '/') {
    const url = request.nextUrl.clone()
    url.pathname = `/${TAAL}/dashboard`
    url.search = ''
    const antwoord = NextResponse.redirect(url)
    for (const koekje of supabaseResponse.cookies.getAll()) {
      antwoord.cookies.set(koekje)
    }
    return antwoord
  }

  if (pad.startsWith('/admin')) {
    if (!user) return naarInloggen()

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = `/${TAAL}`
      return NextResponse.redirect(url)
    }
  }

  if (!user && ALLEEN_INGELOGD.some((p) => padZonderTaal.startsWith(p))) {
    return naarInloggen()
  }

  return supabaseResponse
}
