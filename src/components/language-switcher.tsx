'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'

export function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  function switchLocale(newLocale: string) {
    // pathname is like /nl/dashboard → replace leading /nl or /en
    const stripped = pathname.replace(/^\/(nl|en)/, '') || '/'
    startTransition(() => {
      router.push(`/${newLocale}${stripped}`)
    })
  }

  return (
    <div className="ml-2 flex items-center rounded-md border border-border bg-surface text-xs">
      <button
        type="button"
        onClick={() => switchLocale('nl')}
        className={`rounded-l-md px-2 py-1 transition ${
          currentLocale === 'nl'
            ? 'bg-accent text-white'
            : 'text-text-muted hover:bg-surface-2 hover:text-text'
        }`}
        aria-label="Switch to Dutch"
      >
        NL
      </button>
      <button
        type="button"
        onClick={() => switchLocale('en')}
        className={`rounded-r-md px-2 py-1 transition ${
          currentLocale === 'en'
            ? 'bg-accent text-white'
            : 'text-text-muted hover:bg-surface-2 hover:text-text'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  )
}
