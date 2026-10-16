import {
  getChapters,
  getCurrentProfile,
  getCurrentUser,
} from '@/lib/supabase/request-cache'

import { IngelogdeBalk } from './ingelogde-balk'
import { PubliekeKop } from './publieke-kop'

export async function SiteHeader({ locale }: { locale: string }) {
  const user = await getCurrentUser()
  if (!user) return <PubliekeKop locale={locale} />

  // Profiel en hoofdstukken hangen niet van elkaar af, en ze zijn per
  // request gedeeld met de pagina onder de header.
  const [profile, chapters] = await Promise.all([
    getCurrentProfile(),
    getChapters(),
  ])

  return (
    <IngelogdeBalk
      locale={locale}
      username={profile?.username ?? null}
      email={user.email ?? ''}
      role={profile?.role ?? null}
      tourSeen={profile ? profile.tour_seen_at != null : true}
      chapters={chapters.map((ch) => ({ slug: ch.slug, title: ch.title }))}
    />
  )
}
