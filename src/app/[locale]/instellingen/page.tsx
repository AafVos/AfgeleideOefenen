import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import { PasswordForm, UsernameForm } from './settings-forms'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Settings' })
  return { title: t('title') }
}

export default async function InstellingenPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/inloggen`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .maybeSingle()

  const t = await getTranslations('Settings')

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-3xl text-text">{t('h1')}</h1>

      <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <h2 className="mb-3 font-serif text-xl text-text">{t('accountH2')}</h2>
        <div className="space-y-1.5">
          <p className="text-sm text-text-muted">
            {t('emailLabel')}: <span className="font-medium text-text">{user.email}</span>
          </p>
          <UsernameForm initialUsername={profile?.username ?? ''} />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <h2 className="mb-5 font-serif text-xl text-text">{t('passwordH2')}</h2>
        <PasswordForm />
      </section>
    </div>
  )
}
