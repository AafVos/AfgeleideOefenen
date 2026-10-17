import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { hrefMetOefenpad, veiligOefenpad } from '@/lib/auth/oefenpad'
import { canoniek, nietIndexeren } from '@/lib/seo'

import { ForgotForm } from './forgot-form'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'ForgotPassword' })
  return {
    title: t('title'),
    alternates: canoniek(locale, '/wachtwoord-vergeten'),
    robots: nietIndexeren(),
  }
}

export default async function WachtwoordVergetenPage({
  searchParams,
}: {
  searchParams: Promise<{ mail?: string; naar?: string | string[] }>
}) {
  const t = await getTranslations('ForgotPassword')
  const { mail, naar } = await searchParams
  const linkVerlopen = mail === 'verlopen'
  const oefenpad = veiligOefenpad(naar)

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl text-text">{t('h1')}</h1>
          <p className="text-sm text-text-muted">{t('subtitle')}</p>
        </div>
        {linkVerlopen && (
          <p
            role="alert"
            className="rounded-xl bg-accent-2/10 px-4 py-3 text-sm text-accent-2"
          >
            {t('linkVerlopen')}
          </p>
        )}
        <ForgotForm oefenpad={oefenpad} />
        <Link
          href={hrefMetOefenpad('/inloggen', oefenpad)}
          className="block text-center text-sm text-text-muted underline-offset-2 hover:underline"
        >
          {t('backToLogin')}
        </Link>
      </div>
    </div>
  )
}
