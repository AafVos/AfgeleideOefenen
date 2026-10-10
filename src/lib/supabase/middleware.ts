import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { routing } from '@/i18n/routing'

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

  // Het beheergedeelte staat buiten `src/app/[locale]`, dus daar zit geen
  // taalcode in het pad. De leerlingpagina's wel; die halen we eraf.
  const pad = request.nextUrl.pathname
  const padZonderTaal = zonderTaalcode(pad)

  const naarInloggen = () => {
    const url = request.nextUrl.clone()
    url.pathname = `/${TAAL}/inloggen`
    // De zoekwoorden van de oefenpagina horen niet op het inlogscherm thuis.
    url.search = ''
    return NextResponse.redirect(url)
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
