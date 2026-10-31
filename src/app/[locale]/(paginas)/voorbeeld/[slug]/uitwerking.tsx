'use client'

import { useState } from 'react'

export function Uitwerking({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <details className="mt-10" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 font-medium text-accent underline underline-offset-2">
        {open ? 'Verberg uitwerking' : 'Toon uitwerking'}
        <svg
          viewBox="0 0 24 24"
          className={`size-3 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      {children}
    </details>
  )
}
