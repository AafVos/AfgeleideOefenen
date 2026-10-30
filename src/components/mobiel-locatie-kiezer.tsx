'use client'

import { useEffect, useSyncExternalStore } from 'react'

export const DESKTOP_QUERY = '(min-width: 1024px)'

function subscribeDesktop(onChange: () => void) {
  const mq = window.matchMedia(DESKTOP_QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

/** Op de server (en bij de eerste paint) dicht, zodat een telefoon de inhoud ziet. */
export function useIsDesktop() {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  )
}

/**
 * Vaste balk bovenaan de inhoud op een telefoon: toont de huidige locatie als
 * tekst. Een tik opent `OnderdeelOverlay` met de boomstructuur. Hetzelfde
 * patroon voor Oefenen en Theorie (AFG-772).
 */
export function LocatieBalk({
  label,
  onOpen,
  dataTour,
  dataMeet,
}: {
  label: string
  onOpen: () => void
  dataTour?: string
  dataMeet: string
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      data-tour={dataTour}
      data-meet={dataMeet}
      className="sticky top-0 z-20 flex min-h-11 w-full items-center justify-between gap-3 border-b border-border bg-surface px-4 text-left text-sm font-medium [overflow-anchor:none] lg:hidden"
    >
      <span className="min-w-0 truncate">{label}</span>
      <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="currentColor" aria-hidden>
        <path d="M7 10l5 5 5-5H7z" />
      </svg>
    </button>
  )
}

/** Volledig scherm met de boomstructuur, geopend vanaf `LocatieBalk`. Sluit ook met Escape. */
export function OnderdeelOverlay({
  open,
  onClose,
  title,
  closeLabel,
  dataMeetSluiten,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  closeLabel: string
  dataMeetSluiten: string
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-surface lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="flex items-center justify-between border-b border-border px-4">
        <p className="text-sm font-medium">{title}</p>
        <button
          type="button"
          onClick={onClose}
          data-meet={dataMeetSluiten}
          className="min-h-11 px-3 text-sm font-medium text-text"
        >
          {closeLabel}
        </button>
      </div>
      <div className="nice-scrollbar flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  )
}
