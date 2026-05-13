'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function MobileNav({
  locale,
  isLoggedIn,
  username,
  role,
}: {
  locale: string
  isLoggedIn: boolean
  username: string | null
  role: string | null
}) {
  const [open, setOpen] = useState(false)
  const t = useTranslations('Header')

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        aria-label={open ? 'Menu sluiten' : 'Menu openen'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex size-9 items-center justify-center rounded-md text-text-muted hover:bg-surface-2 hover:text-text"
      >
        {open ? (
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-border bg-surface shadow-lg">
          <nav className="flex flex-col p-2 space-y-0.5">
            {isLoggedIn ? (
              <>
                <NavLink href={`/${locale}/leerpad`} onClick={() => setOpen(false)}>{t('leerpad')}</NavLink>
                <NavLink href={`/${locale}/oefenen`} onClick={() => setOpen(false)}>{t('freeExercise')}</NavLink>
                <NavLink href={`/${locale}/zelf-toets`} onClick={() => setOpen(false)}>{t('zelfToets')}</NavLink>
                <NavLink href={`/${locale}/theorie`} onClick={() => setOpen(false)}>{t('theory')}</NavLink>
                <NavLink href={`/${locale}/dashboard`} onClick={() => setOpen(false)}>{t('dashboard')}</NavLink>
                {role === 'admin' && (
                  <NavLink href="/admin" onClick={() => setOpen(false)}>{t('admin')}</NavLink>
                )}
                <div className="border-t border-border mt-1 pt-1">
                  {username && (
                    <p className="px-3 py-1.5 text-xs text-text-muted truncate">{username}</p>
                  )}
                  <form action="/uitloggen" method="post">
                    <button
                      type="submit"
                      className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-text-muted hover:bg-surface-2 hover:text-text"
                    >
                      {t('logout')}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <>
                <NavLink href={`/${locale}/theorie`} onClick={() => setOpen(false)}>{t('theory')}</NavLink>
                <NavLink href={`/${locale}/inloggen`} onClick={() => setOpen(false)}>{t('login')}</NavLink>
                <NavLink href={`/${locale}/registreren`} onClick={() => setOpen(false)}>{t('register')}</NavLink>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  )
}

function NavLink({
  href,
  onClick,
  children,
}: {
  href: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-lg px-3 py-2.5 text-sm text-text-muted hover:bg-surface-2 hover:text-text"
    >
      {children}
    </Link>
  )
}
