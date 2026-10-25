'use client'

import { useEffect, useRef, useState } from 'react'
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
  const rootRef = useRef<HTMLDivElement | null>(null)
  const t = useTranslations('Header')

  useEffect(() => {
    if (!open) return
    function onDocPointer(e: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocPointer)
    document.addEventListener('touchstart', onDocPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocPointer)
      document.removeEventListener('touchstart', onDocPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative md:hidden">
      <button
        type="button"
        aria-label={open ? 'Menu sluiten' : 'Menu openen'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        data-tour="menu"
        data-meet="menu-hamburger"
        className="flex size-11 items-center justify-center rounded-md text-text-muted hover:bg-surface-2 hover:text-text"
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
                <NavLink href={`/${locale}/theorie`} meet="menu-theorie" onClick={() => setOpen(false)}>{t('theory')}</NavLink>
                <NavLink href={`/${locale}/uitleg-videos`} meet="menu-videos" onClick={() => setOpen(false)}>{t('videos')}</NavLink>
                <NavLink href={`/${locale}/oefenen`} meet="menu-oefenen" onClick={() => setOpen(false)}>{t('freeExercise')}</NavLink>
                <NavLink href={`/${locale}/zelf-toets`} meet="menu-zelftoets" onClick={() => setOpen(false)}>{t('zelfToets')}</NavLink>
                <NavLink href={`/${locale}/dashboard`} meet="menu-dashboard" onClick={() => setOpen(false)}>{t('dashboard')}</NavLink>
                {role === 'admin' && (
                  <NavLink href="/admin" meet="menu-admin" onClick={() => setOpen(false)}>{t('admin')}</NavLink>
                )}
                <div className="flex flex-col space-y-0.5 border-t border-border mt-1 pt-1">
                  <NavLink href={`/${locale}/instellingen`} meet="menu-instellingen" onClick={() => setOpen(false)}>{t('settings')}</NavLink>
                  <NavLink href={`/${locale}/feedback`} meet="menu-feedback" onClick={() => setOpen(false)}>{t('feedback')}</NavLink>
                </div>
                <div className="border-t border-border mt-1 pt-1">
                  {username && (
                    <p className="px-3 py-1.5 text-xs text-text-muted truncate">{username}</p>
                  )}
                  <form action="/uitloggen" method="post">
                    <button
                      type="submit"
                      data-meet="menu-uitloggen"
                      className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-text-muted hover:bg-surface-2 hover:text-text"
                    >
                      {t('logout')}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <>
                <NavLink href={`/${locale}/theorie`} meet="menu-theorie" onClick={() => setOpen(false)}>{t('theory')}</NavLink>
                <NavLink href={`/${locale}/uitleg-videos`} meet="menu-videos" onClick={() => setOpen(false)}>{t('videos')}</NavLink>
                <NavLink href={`/${locale}/inloggen`} meet="menu-inloggen" onClick={() => setOpen(false)}>{t('login')}</NavLink>
                <NavLink href={`/${locale}/registreren`} meet="menu-registreren" onClick={() => setOpen(false)}>{t('register')}</NavLink>
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
  meet,
  children,
}: {
  href: string
  onClick: () => void
  /** Vaste naam voor de klikmeting. Dezelfde als in de balk op de computer. */
  meet?: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      data-meet={meet}
      className="rounded-lg px-3 py-2.5 text-sm text-text-muted hover:bg-surface-2 hover:text-text"
    >
      {children}
    </Link>
  )
}
