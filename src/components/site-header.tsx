import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

import { loadChapters } from '@/lib/practice/chapter-overview'
import { createClient } from '@/lib/supabase/server'
import { THEORY_OVERVIEW } from '@/lib/theory'
import { MobileNav } from './mobile-nav'
import { NavDropdown } from './nav-dropdown'
import { UserMenu } from './user-menu'
import { WelcomeTour } from './welcome-tour'

/** "H2 — De afgeleide functie" → "De afgeleide functie" (code staat al in de badge) */
function stripChapterCode(title: string): string {
  return title.replace(/^H\d+\s*[—–-]\s*/, '')
}

function IconPencil() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function IconClipboardCheck() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="m9.5 13.5 2 2 3.5-4" />
    </svg>
  )
}

function IconBook() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
      <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

function IconChart() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 3v18h18" />
      <path d="M8 17v-6" />
      <path d="M13 17V7" />
      <path d="M18 17v-4" />
    </svg>
  )
}

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

  const chapters = user ? await loadChapters(supabase) : []

  const t = await getTranslations({ locale, namespace: 'Header' })

  const oefenenItems = chapters.map((ch) => ({
    href: `/${locale}/oefenen?chapter=${encodeURIComponent(ch.slug)}`,
    code: ch.slug.toUpperCase(),
    label: stripChapterCode(ch.title),
  }))

  const theorieItems = THEORY_OVERVIEW.map((ch) => ({
    href: `/${locale}/theorie#hoofdstuk-${ch.slug}`,
    code: ch.slug.toUpperCase(),
    label: stripChapterCode(ch.title),
  }))

  const theorieDropdown = (
    <NavDropdown
      label={t('theory')}
      icon={<IconBook />}
      overviewHref={`/${locale}/theorie`}
      overviewLabel={t('overview')}
      items={theorieItems}
      dataTour="theorie"
    />
  )

  return (
    <>
    <header className="relative sticky top-0 z-30 h-14 border-b border-border bg-surface/85 backdrop-blur">
      <div className="flex h-full w-full items-center justify-between gap-4 px-4">
        <Link
          href={`/${locale}`}
          className="min-w-0 shrink font-serif text-lg font-medium tracking-tight text-text"
        >
          {t('brand')}<span className="text-accent">{t('brandSuffix')}</span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm md:flex">
          {user ? (
            <>
              {theorieDropdown}
              <NavDropdown
                label={t('freeExercise')}
                icon={<IconPencil />}
                overviewHref={`/${locale}/oefenen`}
                overviewLabel={t('overview')}
                items={oefenenItems}
                dataTour="oefenen"
              />
              <Link
                href={`/${locale}/zelf-toets`}
                data-tour="zelftoets"
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
              >
                <IconClipboardCheck />
                {t('zelfToets')}
              </Link>
              <Link
                href={`/${locale}/dashboard`}
                data-tour="voortgang"
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
              >
                <IconChart />
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
              <UserMenu
                displayName={username ?? user.email ?? ''}
                email={user.email ?? ''}
                locale={locale}
                labels={{
                  signedInAs: t('signedInAs'),
                  settings: t('settings'),
                  feedback: t('feedback'),
                  logout: t('logout'),
                }}
              />
            </>
          ) : (
            <>
              {theorieDropdown}
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
        </nav>

        {/* Mobile: hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          <MobileNav
            locale={locale}
            isLoggedIn={!!user}
            username={username}
            role={role}
          />
        </div>
      </div>
    </header>
    {/* Buiten de header: backdrop-blur maakt position:fixed anders relatief aan de header */}
    {user && <WelcomeTour />}
    </>
  )
}
