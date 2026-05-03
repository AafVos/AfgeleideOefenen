import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'
import { LanguageSwitcher } from './language-switcher'

export async function SiteHeader({ locale }: { locale: string }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let username: string | null = null
  let role: string | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, role')
      .eq('id', user.id)
      .maybeSingle()
    username = data?.username ?? null
    role = data?.role ?? null
  }

  const t = await getTranslations({ locale, namespace: 'Header' })

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-surface/85 backdrop-blur">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href={`/${locale}`}
          className="min-w-0 shrink font-serif text-lg font-medium tracking-tight text-text"
        >
          {t('brand')}<span className="text-accent">{t('brandSuffix')}</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {user ? (
            <>
              <Link
                href={`/${locale}/leerpad`}
                className="rounded-md px-3 py-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
              >
                {t('leerpad')}
              </Link>
              <Link
                href={`/${locale}/oefenen`}
                className="rounded-md px-3 py-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
              >
                {t('freeExercise')}
              </Link>
              <Link
                href={`/${locale}/theorie`}
                className="rounded-md px-3 py-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
              >
                {t('theory')}
              </Link>
              <Link
                href={`/${locale}/dashboard`}
                className="rounded-md px-3 py-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
              >
                {t('dashboard')}
              </Link>
              {role === 'admin' && (
                <Link
                  href="/admin"
                  className="rounded-md px-3 py-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
                >
                  {t('admin')}
                </Link>
              )}
              <span className="mx-2 hidden text-text-muted sm:inline">
                {username ?? user.email}
              </span>
              <form action="/uitloggen" method="post">
                <button
                  type="submit"
                  className="rounded-md px-3 py-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
                >
                  {t('logout')}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href={`/${locale}/theorie`}
                className="rounded-md px-3 py-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
              >
                {t('theory')}
              </Link>
              <Link
                href={`/${locale}/inloggen`}
                className="rounded-md px-3 py-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
              >
                {t('login')}
              </Link>
              <Link
                href={`/${locale}/registreren`}
                className="ml-1 rounded-md bg-accent px-3 py-1.5 text-white hover:bg-accent/90"
              >
                {t('register')}
              </Link>
            </>
          )}
          <LanguageSwitcher currentLocale={locale} />
        </nav>
      </div>
    </header>
  )
}
