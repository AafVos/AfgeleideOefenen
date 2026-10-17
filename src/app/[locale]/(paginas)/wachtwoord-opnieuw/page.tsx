import { getTranslations } from 'next-intl/server'

import { veiligOefenpad } from '@/lib/auth/oefenpad'
import { canoniek, nietIndexeren } from '@/lib/seo'

import { NewPasswordForm } from './new-password-form'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'NewPassword' })
  return {
    title: t('title'),
    alternates: canoniek(locale, '/wachtwoord-opnieuw'),
    robots: nietIndexeren(),
  }
}

export default async function WachtwoordOpnieuwPage({
  searchParams,
}: {
  searchParams: Promise<{ naar?: string | string[] }>
}) {
  const t = await getTranslations('NewPassword')
  const { naar } = await searchParams
  const oefenpad = veiligOefenpad(naar)

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="font-serif text-3xl text-text">{t('h1')}</h1>
        <NewPasswordForm oefenpad={oefenpad} />
      </div>
    </div>
  )
}
