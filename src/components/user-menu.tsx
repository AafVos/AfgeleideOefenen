'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'

import { NAV_DROPDOWN_OPEN_EVENT } from './nav-dropdown'

export function UserMenu({
  displayName,
  email,
  locale,
  labels,
}: {
  displayName: string
  email: string
  locale: string
  labels: {
    signedInAs: string
    settings: string
    feedback: string
    logout: string
  }
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const closeTimer = useRef<number | null>(null)
  const menuId = useId()

  const initial = (displayName.trim()[0] ?? '?').toUpperCase()

  useEffect(() => {
    function onSiblingOpen(e: Event) {
      if ((e as CustomEvent).detail !== menuId) setOpen(false)
    }
    window.addEventListener(NAV_DROPDOWN_OPEN_EVENT, onSiblingOpen)
    return () => window.removeEventListener(NAV_DROPDOWN_OPEN_EVENT, onSiblingOpen)
  }, [menuId])

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  function scheduleClose() {
    cancelClose()
    closeTimer.current = window.setTimeout(() => setOpen(false), 150)
  }

  function openMenu() {
    cancelClose()
    setOpen(true)
    window.dispatchEvent(new CustomEvent(NAV_DROPDOWN_OPEN_EVENT, { detail: menuId }))
  }

  const itemClass =
    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-text-muted hover:bg-surface-2 hover:text-text'

  return (
    <div
      ref={rootRef}
      className="relative ml-4"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={displayName}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className={`flex size-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white transition hover:bg-accent/90 ${
          open ? 'ring-2 ring-accent/30' : ''
        }`}
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-1.5 w-60 rounded-xl border border-border bg-surface p-1.5 shadow-lg">
          <div className="px-3 py-2">
            <p className="text-xs text-text-muted">{labels.signedInAs}</p>
            <p className="truncate text-sm font-medium text-text">{displayName}</p>
            {email && email !== displayName && (
              <p className="truncate text-xs text-text-muted">{email}</p>
            )}
          </div>
          <div className="my-1.5 border-t border-border" />
          <Link
            href={`/${locale}/instellingen`}
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
            </svg>
            {labels.settings}
          </Link>
          <Link
            href={`/${locale}/feedback`}
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 11.5a8.38 8.38 0 0 1-9 8.35 8.5 8.5 0 0 1-3.4-.7L3 21l1.85-5.6A8.38 8.38 0 0 1 4 11.5a8.5 8.5 0 1 1 17 0Z" />
            </svg>
            {labels.feedback}
          </Link>
          <div className="my-1.5 border-t border-border" />
          <form action="/uitloggen" method="post">
            <button type="submit" className={itemClass}>
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="m16 17 5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              {labels.logout}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
