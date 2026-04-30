import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import type { Database } from './types'

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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  if (path.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/inloggen'
      return NextResponse.redirect(url)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  const protectedPaths = ['/leerpad', '/oefenen', '/dashboard', '/onboarding']
  if (!user && protectedPaths.some((p) => path.startsWith(p))) {
    const url = request.nextUrl.clone()
    url.pathname = '/inloggen'
    return NextResponse.redirect(url)
  }

  // Voor ingelogde users die hun onboarding nog niet hebben afgerond:
  // forceer naar /onboarding voor ze ergens anders heen kunnen.
  if (user) {
    const onboardingExempt = [
      '/onboarding',
      '/uitloggen',
      '/inloggen',
      '/registreren',
      '/auth',
      '/api',
      '/admin', // admins hoeven geen onboarding
    ]
    const needsCheck =
      protectedPaths.some((p) => path.startsWith(p)) &&
      !onboardingExempt.some((p) => path.startsWith(p))

    if (needsCheck) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarded_at, role')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.role !== 'admin' && !profile?.onboarded_at) {
        const url = request.nextUrl.clone()
        url.pathname = '/onboarding'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
