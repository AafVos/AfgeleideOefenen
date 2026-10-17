import { getTranslations, getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { redirect } from 'next/navigation'

import { googleLoginAan, gebruikersnaamBestemming, moetNaamVragen } from '@/lib/auth/google'
import { hrefMetOefenpad, veiligOefenpad } from '@/lib/auth/oefenpad'
import { leesHerkomst } from '@/lib/herkomst'
import { canoniek, nietIndexeren } from '@/lib/seo'
import { createClient } from '@/lib/supabase/server'

import { SignupForm } from './signup-form'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Register' })
  return {
    title: t('title'),
    alternates: canoniek(locale, '/registreren'),
    robots: nietIndexeren(),
  }
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ van?: string | string[]; naar?: string | string[] }>
}) {
  const supabase = await createClient()
  const locale = await getLocale()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { van, naar } = await searchParams
  const herkomst = leesHerkomst(van)
  const oefenpad = veiligOefenpad(naar)

  if (user) {
    if (moetNaamVragen(user)) {
      const zoek = oefenpad ? `?naar=${encodeURIComponent(oefenpad)}` : ''
      redirect(gebruikersnaamBestemming('/registreren', zoek))
    }
    redirect(`/${locale}/dashboard`)
  }

  const t = await getTranslations('Register')

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-3xl text-text">{t('h1')}</h1>
      <p className="mt-2 text-sm text-text-muted">{t('subtitle')}</p>

      <div className="mt-8 rounded-xl border border-border bg-surface p-6">
        <SignupForm herkomst={herkomst} oefenpad={oefenpad} googleAan={googleLoginAan()} />
      </div>

      <p className="mt-2 text-center text-sm text-text-muted">
        <Link href={hrefMetOefenpad('/wachtwoord-vergeten', oefenpad)} className="text-accent hover:underline">
          {t('forgotPassword')}
        </Link>
      </p>
      <p className="mt-4 text-center text-sm leading-relaxed text-text-muted">
        {t.rich('privacyNote', {
          link: (chunks) => (
            <Link href="/privacy" className="font-medium text-accent hover:underline">
              {chunks}
            </Link>
          ),
        })}
      </p>
    </div>
  )
}
