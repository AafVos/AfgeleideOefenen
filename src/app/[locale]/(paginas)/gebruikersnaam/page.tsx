import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'

import { bestemmingNaInloggen } from '@/lib/auth/bestemming'
import { moetNaamVragen } from '@/lib/auth/google'
import { veiligOefenpad } from '@/lib/auth/oefenpad'
import { canoniek, nietIndexeren } from '@/lib/seo'
import { createClient } from '@/lib/supabase/server'

import { NaamForm } from './naam-form'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Gebruikersnaam' })
  return {
    title: t('title'),
    alternates: canoniek(locale, '/gebruikersnaam'),
    robots: nietIndexeren(),
  }
}

export default async function GebruikersnaamPage({
  searchParams,
}: {
  searchParams: Promise<{ naar?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { naar } = await searchParams
  const oefenpad = veiligOefenpad(naar)

  if (!user) redirect('/nl/inloggen')

  if (!moetNaamVragen(user)) {
    redirect(await bestemmingNaInloggen(supabase, oefenpad, 'nl'))
  }

  const t = await getTranslations('Gebruikersnaam')

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-3xl text-text">{t('h1')}</h1>
      <p className="mt-2 text-sm text-text-muted">{t('subtitle')}</p>

      <div className="mt-8 rounded-xl border border-border bg-surface p-6">
        <NaamForm oefenpad={oefenpad} />
      </div>
    </div>
  )
}
