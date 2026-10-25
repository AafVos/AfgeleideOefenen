import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

import { THEORY_OVERVIEW } from '@/content/theory/afgeleiden'
import { hoofdstukCode } from '@/lib/hoofdstuk-code'

import { MobileNav } from './mobile-nav'
import { NavDropdown } from './nav-dropdown'

/** "H2 — De afgeleide functie" → "De afgeleide functie" (code staat al in de badge) */
function stripChapterCode(title: string): string {
  return title.replace(/^H\d+\s*[—–-]\s*/, '')
}

function IconBook() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
      <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

function IconPlayCircle() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="m10 8.5 5 3.5-5 3.5Z" />
    </svg>
  )
}

/**
 * De kop voor wie niet is ingelogd. Die vraagt Supabase niets: de
 * startpagina kan daardoor van tevoren klaarstaan. Een ingelogde leerling
 * ziet deze kop niet op de startpagina; de middleware stuurt hem meteen
 * naar het dashboard.
 */
export async function PubliekeKop({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'Header' })

  const theorieItems = THEORY_OVERVIEW.map((ch) => ({
    href: `/${locale}/theorie#hoofdstuk-${ch.slug}`,
    code: hoofdstukCode(ch.slug),
    label: stripChapterCode(ch.title),
  }))

  return (
    <header className="relative z-30 h-14 shrink-0 border-b border-border bg-surface [overflow-anchor:none]">
      <div className="flex h-full w-full items-center justify-between gap-4 px-4">
        <Link
          href={`/${locale}`}
          data-meet="menu-merk"
          className="min-w-0 shrink font-serif text-lg font-medium tracking-tight text-text"
        >
          {t('brand')}<span className="text-accent">{t('brandSuffix')}</span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm md:flex">
          <NavDropdown
            label={t('theory')}
            icon={<IconBook />}
            overviewHref={`/${locale}/theorie`}
            overviewLabel={t('overview')}
            items={theorieItems}
            dataTour="theorie"
            dataMeet="menu-theorie"
          />
          <Link
            href={`/${locale}/uitleg-videos`}
            data-meet="menu-videos"
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
          >
            <IconPlayCircle />
            {t('videos')}
          </Link>
          <Link
            href={`/${locale}/inloggen`}
            data-meet="menu-inloggen"
            className="rounded-md px-3 py-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
          >
            {t('login')}
          </Link>
          <Link
            href={`/${locale}/registreren`}
            data-meet="menu-registreren"
            className="ml-1 rounded-md bg-accent px-3 py-1.5 text-white hover:bg-accent/90"
          >
            {t('register')}
          </Link>
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <MobileNav
            locale={locale}
            isLoggedIn={false}
            username={null}
            role={null}
          />
        </div>
      </div>
    </header>
  )
}
