import { getTranslations, getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { redirect } from 'next/navigation'

import { googleLoginAan, gebruikersnaamBestemming, moetNaamVragen } from '@/lib/auth/google'
import { hrefMetOefenpad, veiligOefenpad } from '@/lib/auth/oefenpad'
import { canoniek } from '@/lib/seo'
import { createClient } from '@/lib/supabase/server'

import { LoginForm } from './login-form'
import { MailMelding, type Mail } from './mail-melding'
import { VerlopenMailForm } from './verlopen-mail-form'

/** Alleen de waarden die `/auth/callback` zet tellen mee. */
function leesMail(waarde: string | undefined): Mail | null {
  return waarde === 'bevestigd' || waarde === 'verlopen' || waarde === 'onbekend'
    ? waarde
    : null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Login' })
  return { title: t('title'), alternates: canoniek(locale, '/inloggen') }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mail?: string; naar?: string }>
}) {
  const supabase = await createClient()
  const locale = await getLocale()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const t = await getTranslations('Login')
  const { error, mail, naar } = await searchParams
  const oefenpad = veiligOefenpad(naar)

  if (user) {
    if (moetNaamVragen(user)) {
      const zoek = oefenpad ? `?naar=${encodeURIComponent(oefenpad)}` : ''
      redirect(gebruikersnaamBestemming('/inloggen', zoek))
    }
    redirect(`/${locale}/dashboard`)
  }

  const callbackError =
    error === 'auth_callback_failed'
      ? t('callbackError')
      : error === 'google_afgebroken'
        ? t('googleCancelled')
        : null
  // Hoe het afliep met de bevestigingslink; `/auth/callback` zet dit.
  const bevestigingsmail = leesMail(mail)

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-3xl text-text">{t('h1')}</h1>
      <p className="mt-2 text-sm text-text-muted">{t('subtitle')}</p>

      {bevestigingsmail && <MailMelding mail={bevestigingsmail} />}
      {bevestigingsmail === 'verlopen' && (
        <div className="mt-6">
          <VerlopenMailForm />
        </div>
      )}

      <div className="mt-8 rounded-xl border border-border bg-surface p-6">
        <LoginForm
          callbackError={callbackError}
          oefenpad={oefenpad}
          googleAan={googleLoginAan()}
        />
      </div>

      <p className="mt-6 text-center text-sm text-text-muted">
        {t('noAccount')}{' '}
        <Link href={hrefMetOefenpad('/registreren', oefenpad)} className="font-medium text-accent hover:underline">
          {t('registerLink')}
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-text-muted">
        <Link href={hrefMetOefenpad('/wachtwoord-vergeten', oefenpad)} className="text-accent hover:underline">
          {t('forgotPassword')}
        </Link>
      </p>
    </div>
  )
}
