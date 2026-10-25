import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { AFMELD_SLEUTEL } from '@/lib/herinnering/links'
import { nietIndexeren } from '@/lib/seo'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { isGeldigeUuid } from '@/lib/uuid'

/**
 * Afmelden voor de herinneringsmail (zie AFG-487).
 *
 * Komt uit de link onderaan de mail, dus zonder dat de leerling ingelogd is.
 * In de link staat het willekeurige nummer uit `profiles.herinnering_sleutel`,
 * nooit het gebruikersnummer. Klopt het nummer niet, dan staat er alleen dat
 * de link niet werkt — nooit of er een account bij hoort.
 */
export async function generateMetadata() {
  const t = await getTranslations('HerinneringUit')
  return { title: t('title'), robots: nietIndexeren() }
}

// Afmelden mag nooit uit een cache komen.
export const dynamic = 'force-dynamic'

export default async function HerinneringUitPagina({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const waarde = (await searchParams)[AFMELD_SLEUTEL]
  const sleutel = (Array.isArray(waarde) ? waarde[0] : waarde)?.trim()
  const gelukt = sleutel ? await zetUit(sleutel) : false
  const t = await getTranslations('HerinneringUit')

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-serif text-3xl text-text">
        {gelukt ? t('geluktH1') : t('misluktH1')}
      </h1>
      <p className="mt-4 text-text-muted">{gelukt ? t('geluktBody') : t('misluktBody')}</p>
      <Link
        href="/dashboard"
        className="mt-8 inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-accent/90"
      >
        {t('naarDashboard')}
      </Link>
    </div>
  )
}

/** Zet de herinnering uit bij het profiel met dit nummer. */
async function zetUit(sleutel: string): Promise<boolean> {
  // Een nummer dat geen UUID is, hoeft de database niet te zien: PostgREST
  // geeft daar een fout op in plaats van "niets gevonden".
  if (!isGeldigeUuid(sleutel)) {
    return false
  }

  const { data, error } = await createServiceRoleClient()
    .from('profiles')
    .update({ herinnering_mail: false })
    .eq('herinnering_sleutel', sleutel)
    .select('id')

  if (error) {
    console.error('[herinnering] afmelden mislukt', error.code)
    return false
  }
  return (data?.length ?? 0) > 0
}
