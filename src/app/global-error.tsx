'use client'

import { useEffect } from 'react'

import { FoutPagina } from '@/components/fout-pagina'
import { ViewportHoogte } from '@/components/viewport-hoogte'

import './globals.css'

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="nl">
      <body className="flex min-h-[var(--app-height,100dvh)] flex-col bg-bg text-text antialiased">
        <title>Er ging iets mis · afgeleideoefenen.nl</title>
        <FoutPagina onRetry={retry} />
        <ViewportHoogte />
      </body>
    </html>
  )
}
