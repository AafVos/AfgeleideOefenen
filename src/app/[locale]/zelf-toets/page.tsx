import { getTranslations, getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { redirect } from 'next/navigation'

import { loadConfigData } from '@/lib/practice/custom-test'
import { createClient } from '@/lib/supabase/server'

import { ConfigForm } from './config-form'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'ZelfToets' })
  return { title: t('title') }
}

export default async function ZelfToetsPage() {
  const supabase = await createClient()
  const locale = await getLocale()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/inloggen`)

  const t = await getTranslations('ZelfToets')

  const [config, { data: existingTests }] = await Promise.all([
    loadConfigData(supabase, user.id),
    supabase
      .from('user_sessions_new')
      .select('id, name, started_at, ended_at')
      .eq('user_id', user.id)
      .eq('kind', 'custom_test')
      .order('started_at', { ascending: false }),
  ])

  const defaultName = `Zelf-toets-${(existingTests?.length ?? 0) + 1}`

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm font-medium uppercase tracking-wider text-accent">
        {t('eyebrow')}
      </p>
      <h1 className="mt-2 font-serif text-3xl text-text">{t('h1')}</h1>
      <p className="mt-3 max-w-2xl text-text-muted">{t('intro')}</p>

      {existingTests && existingTests.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-text-muted">
            {t('myTests')}
          </h2>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
            {existingTests.map((test) => {
              const isDone = test.ended_at !== null
              const displayName = test.name ?? `Zelf-toets`
              const dateStr = new Date(test.started_at).toLocaleDateString(
                locale === 'nl' ? 'nl-NL' : 'en-GB',
                { day: 'numeric', month: 'short', year: 'numeric' },
              )
              return (
                <li key={test.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-text">{displayName}</p>
                    <p className="text-xs text-text-muted">
                      {dateStr}
                      {' · '}
                      <span
                        className={
                          isDone ? 'text-emerald-600' : 'text-amber-600'
                        }
                      >
                        {isDone ? t('completed') : t('inProgress')}
                      </span>
                    </p>
                  </div>
                  <Link
                    href={
                      isDone
                        ? `/zelf-toets/resultaat/${test.id}`
                        : `/zelf-toets/loop/${test.id}`
                    }
                    className="shrink-0 rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2"
                  >
                    {isDone ? t('viewResult') : t('continueTest')}
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-4 font-serif text-xl text-text">{t('newTestH2')}</h2>
        <ConfigForm config={config} defaultName={defaultName} />
      </section>
    </div>
  )
}
