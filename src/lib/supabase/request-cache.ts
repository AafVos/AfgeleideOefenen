import { cache } from 'react'

import { loadChapters, type ChapterInfo } from '@/lib/practice/chapter-overview'

import { createClient } from './server'

/**
 * Per-request gedeelde ophalers.
 *
 * De header en de pagina eronder renderen in dezelfde doorloop, maar vroegen
 * allebei los de ingelogde gebruiker, zijn profiel en de hoofdstukken op. Dat
 * waren drie keer zoveel round trips naar Supabase als nodig, allemaal na
 * elkaar. `cache()` van React houdt het resultaat vast binnen één request, dus
 * de tweede en derde aanroep kosten niets meer.
 *
 * Let op: dit werkt alleen binnen dezelfde render. De proxy draait op Vercel
 * als een aparte invocatie en deelt deze cache dus niet.
 */

export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

export type CurrentProfile = {
  display_name: string | null
  username: string | null
  role: string | null
  tour_seen_at: string | null
}

/**
 * Eén profielquery met alle kolommen die de header en de pagina's samen nodig
 * hebben. Losse queries per kolom zouden goedkoper lijken, maar de kosten
 * zitten in de round trip, niet in de breedte van de rij.
 */
export const getCurrentProfile = cache(
  async (): Promise<CurrentProfile | null> => {
    const user = await getCurrentUser()
    if (!user) return null

    const supabase = await createClient()
    const { data } = await supabase
      .from('profiles')
      .select('display_name, username, role, tour_seen_at')
      .eq('id', user.id)
      .maybeSingle()

    return (data as CurrentProfile | null) ?? null
  },
)

export const getChapters = cache(async (): Promise<ChapterInfo[]> => {
  const supabase = await createClient()
  return loadChapters(supabase)
})
