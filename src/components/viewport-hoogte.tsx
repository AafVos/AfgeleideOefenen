'use client'

import { useEffect } from 'react'

import { volgVensterHoogte, type Vensterachtig } from '@/lib/viewport-hoogte'

/**
 * Zet `--app-height` op `<html>`, en houdt hem bij. Gebruikt door
 * `h-[var(--app-height,100dvh)]` in `src/app/layout.tsx`,
 * `src/app/global-error.tsx` en `src/app/[locale]/layout.tsx`: de
 * eigenhandige correctie op `dvh` uit `src/lib/viewport-hoogte.ts` (AFG-862).
 * Vóórdat dit effect draait geldt gewoon de `100dvh`-terugval uit die
 * CSS, dus er is geen flits bij het laden.
 */
export function ViewportHoogte() {
  useEffect(() => {
    const visueelVenster: Vensterachtig | null = window.visualViewport
      ? {
          get innerHeight() {
            return window.visualViewport!.height
          },
          addEventListener: window.visualViewport.addEventListener.bind(window.visualViewport),
          removeEventListener: window.visualViewport.removeEventListener.bind(
            window.visualViewport,
          ),
        }
      : null

    return volgVensterHoogte(window, visueelVenster, (pixels) => {
      document.documentElement.style.setProperty('--app-height', pixels)
    })
  }, [])

  return null
}
