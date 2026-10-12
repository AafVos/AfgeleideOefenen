import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

export async function SiteFooter() {
  const t = await getTranslations('Footer')

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="px-4 py-2">
        <Link
          href="/privacy"
          className="inline-flex min-h-11 items-center text-sm text-text-muted underline-offset-2 hover:text-text hover:underline"
        >
          {t('privacy')}
        </Link>
      </div>
    </footer>
  )
}
