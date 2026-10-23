'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'

/** Eén dropdown tegelijk: bij openen sluiten de anderen direct. */
export const NAV_DROPDOWN_OPEN_EVENT = 'nav-dropdown-open'

export type NavDropdownItem = {
  href: string
  label: string
  code?: string
}

export function NavDropdown({
  label,
  icon,
  overviewHref,
  overviewLabel,
  items,
  dataTour,
  dataMeet,
}: {
  label: string
  icon?: React.ReactNode
  overviewHref: string
  overviewLabel: string
  items: NavDropdownItem[]
  /** Doelwit-id voor de welkomst-rondleiding */
  dataTour?: string
  /** Vaste naam voor de klikmeting, zie src/lib/meten/. */
  dataMeet?: string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const closeTimer = useRef<number | null>(null)
  const menuId = useId()

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

  function onRootBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (!rootRef.current?.contains(e.relatedTarget as Node)) scheduleClose()
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      data-tour={dataTour}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
      onFocus={openMenu}
      onBlur={onRootBlur}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        data-meet={dataMeet}
        onClick={openMenu}
        className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 ${
          open ? 'bg-surface-2 text-text' : 'text-text-muted'
        } hover:bg-surface-2 hover:text-text`}
      >
        {icon}
        {label}
        <svg
          viewBox="0 0 24 24"
          className={`size-3 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          id={menuId}
          className="absolute left-0 top-full z-40 mt-1 w-64 rounded-xl border border-border bg-surface p-1.5 shadow-lg"
        >
          <Link
            href={overviewHref}
            onClick={() => setOpen(false)}
            data-meet={dataMeet ? `${dataMeet}-overzicht` : undefined}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-text hover:bg-surface-2"
          >
            {overviewLabel}
          </Link>
          <div className="my-1.5 border-t border-border" />
          <ul className="space-y-0.5">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  data-meet={dataMeet ? `${dataMeet}-hoofdstuk` : undefined}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-surface-2 hover:text-text"
                >
                  {item.code && (
                    <span
                      title={item.label}
                      className="w-9 shrink-0 overflow-hidden text-ellipsis whitespace-nowrap rounded-md bg-accent-light px-1.5 py-0.5 text-center font-mono text-[11px] font-semibold text-accent"
                    >
                      {item.code}
                    </span>
                  )}
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
