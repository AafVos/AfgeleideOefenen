import { getTranslations } from 'next-intl/server'

import { NewPasswordForm } from './new-password-form'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'NewPassword' })
  return { title: t('title') }
}

export default async function WachtwoordOpnieuwPage() {
  const t = await getTranslations('NewPassword')

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="font-serif text-3xl text-text">{t('h1')}</h1>
        <NewPasswordForm />
      </div>
    </div>
  )
}
