import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import { FeedbackForm } from './feedback-form'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Feedback' })
  return { title: t('title') }
}

export default async function FeedbackPage({
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

  const t = await getTranslations('Feedback')

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-3xl text-text">{t('h1')}</h1>
      <p className="mt-3 max-w-xl text-text-muted">{t('intro')}</p>
      <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <FeedbackForm />
      </div>
    </div>
  )
}
