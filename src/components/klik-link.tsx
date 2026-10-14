'use client'

import { useState, type ComponentProps, type MouseEvent } from 'react'

import { Link } from '@/i18n/navigation'
import { cn } from '@/components/ui'

type KlikLinkProps = ComponentProps<typeof Link> & {
  /** Tekst voor de schermlezer terwijl de volgende pagina nog laadt. */
  bezigTekst?: string
}

/**
 * Een link die meteen laat zien dat er iets gebeurt.
 *
 * Het laadscherm van de route komt pas als de server antwoordt. Tot die
 * tijd blijft deze link een draaiend icoon tonen. Een gewone klik met een
 * extra toets (nieuw tabblad) gaat gewoon door, zonder dat icoon.
 */
export function KlikLink({
  children,
  className,
  bezigTekst = 'Even laden',
  onClick,
  ...rest
}: KlikLinkProps) {
  const [bezig, setBezig] = useState(false)
  function klik(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return
    }
    setBezig(true)
  }
  return (
    <Link {...rest} className={cn('relative', className)} onClick={klik}>
      {children}
      {bezig ? (
        <span
          role="status"
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-surface/80"
        >
          <svg
            className="size-5 animate-spin text-accent"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M12 3a9 9 0 1 1-9 9" />
          </svg>
          <span className="sr-only">{bezigTekst}</span>
        </span>
      ) : null}
    </Link>
  )
}
