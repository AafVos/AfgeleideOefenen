'use client'

import { useEffect, useLayoutEffect, useState } from 'react'

import { leesSessieInBrowser, sessieKopStijl } from '@/lib/sessie-scherm'
import { createClient } from '@/lib/supabase/client'

import { IngelogdeBalk, type BalkHoofdstuk } from './ingelogde-balk'

/**
 * De ingelogde kop op een pagina die van tevoren klaarstaat. De server kent
 * de sessie daar niet; de browser leest hem en haalt naam en hoofdstukken op.
 */
export function SessieKop({ locale }: { locale: string }) {
  const [username, setUsername] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<string | null>(null)
  const [tourSeen, setTourSeen] = useState(true)
  const [chapters, setChapters] = useState<BalkHoofdstuk[]>([])

  useLayoutEffect(() => {
    const ingelogd = leesSessieInBrowser()
    let stijl = document.head.querySelector('style[data-sessie-kop]')
    if (!stijl) {
      stijl = document.createElement('style')
      stijl.setAttribute('data-sessie-kop', '')
      document.head.appendChild(stijl)
    }
    stijl.textContent = sessieKopStijl(ingelogd)
  }, [])

  useEffect(() => {
    if (!leesSessieInBrowser()) return
    let geannuleerd = false

    void (async () => {
      try {
        const supabase = createClient()
        const { data: userData } = await supabase.auth.getUser()
        const user = userData.user
        if (!user || geannuleerd) return
        setEmail(user.email ?? '')

        const [profiel, hoofdstukken] = await Promise.all([
          supabase
            .from('profiles')
            .select('username, role, tour_seen_at')
            .eq('id', user.id)
            .maybeSingle(),
          supabase.from('chapters').select('slug, title').order('order_index'),
        ])
        if (geannuleerd) return

        setUsername(profiel.data?.username ?? null)
        setRole(profiel.data?.role ?? null)
        setTourSeen(profiel.data ? profiel.data.tour_seen_at != null : true)
        setChapters(
          (hoofdstukken.data ?? []).map((rij) => ({
            slug: rij.slug,
            title: rij.title,
          })),
        )
      } catch {
        // De balk blijft staan. Naam en hoofdstukken verschijnen zodra het lukt.
      }
    })()

    return () => {
      geannuleerd = true
    }
  }, [])

  return (
    <IngelogdeBalk
      locale={locale}
      username={username}
      email={email}
      role={role}
      tourSeen={tourSeen}
      chapters={chapters}
    />
  )
}
