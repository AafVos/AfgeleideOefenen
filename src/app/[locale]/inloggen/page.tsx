import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import { LoginForm } from './login-form'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Login' })
  return { title: t('title') }
}

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  const t = await getTranslations('Login')

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-3xl text-text">{t('h1')}</h1>
      <p className="mt-2 text-sm text-text-muted">{t('subtitle')}</p>

      <div className="mt-8 rounded-xl border border-border bg-surface p-6">
        <LoginForm />
      </div>

      <p className="mt-6 text-center text-sm text-text-muted">
        {t('noAccount')}{' '}
        <Link href="/registreren" className="font-medium text-accent hover:underline">
          {t('registerLink')}
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-text-muted">
        <Link href="/wachtwoord-vergeten" className="text-accent hover:underline">
          {t('forgotPassword')}
        </Link>
      </p>
    </div>
  )
}
