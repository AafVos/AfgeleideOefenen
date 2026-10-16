'use client'

import { useState } from 'react'

import { deelLink } from '@/lib/deel-link'

/** Op een telefoon het deelmenu, anders de link naar het klembord. */
export function DeelKnop({ compact = false }: { compact?: boolean }) {
  const [melding, setMelding] = useState<string | null>(null)

  async function deel() {
    const link = `${window.location.origin}${deelLink(
      `${window.location.pathname}${window.location.search}`,
    )}`
    const titel = document.title

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: titel, url: link })
        setMelding(null)
        return
      } catch (fout) {
        if (fout instanceof Error && fout.name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(link)
      setMelding('Link gekopieerd. Plak hem in de klasapp.')
    } catch {
      setMelding(link)
    }
  }

  return (
    <div className={compact ? 'flex flex-col items-end gap-2' : 'flex flex-col items-start gap-2'}>
      <button
        type="button"
        onClick={() => void deel()}
        data-tour="delen"
        data-meet="delen"
        className={
          compact
            ? 'inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-sm text-text hover:bg-surface-2'
            : 'inline-flex min-h-11 items-center rounded-lg border border-border px-5 py-3 text-sm text-text hover:bg-surface-2'
        }
      >
        Stuur naar een klasgenoot
      </button>
      {melding && <p className="max-w-md break-all text-sm text-text-muted">{melding}</p>}
    </div>
  )
}
