import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

import { IntegraalVerwijzing } from '@/components/integraal-verwijzing'
import { cn } from '@/components/ui'

export async function SiteFooter({ className }: { className?: string } = {}) {
  const t = await getTranslations('Footer')

  return (
    <footer className={cn('shrink-0 border-t border-border bg-surface', className)}>
      {/* Rechts blijft leeg: daar staat het hulp-poppetje overheen. */}
      <div className="flex flex-col gap-1 px-4 py-2 pr-20 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/privacy"
          className="inline-flex min-h-11 items-center text-sm text-text-muted underline-offset-2 hover:text-text hover:underline"
        >
          {t('privacy')}
        </Link>
        <IntegraalVerwijzing
          tekst={t('integraal')}
          className="inline-flex min-h-11 items-center text-sm text-text-muted underline-offset-2 hover:text-text hover:underline"
        />
      </div>
    </footer>
  )
}
