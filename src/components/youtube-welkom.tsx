'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { leesHerkomst } from '@/lib/herkomst'

/**
 * Korte welkomstregel voor wie via `?van=youtube` binnenkomt. Alleen zichtbaar
 * met die parameter, dus los van de rest van de (statische) pagina eromheen.
 * Herbruikbaar op de startpagina, voorbeeldpagina's en theoriepagina's; de
 * CTA verschilt per pagina (een anker op de startpagina, anders de proefroute).
 */
export function YoutubeWelkom({
  ctaHref,
  ctaDataMeet,
}: {
  ctaHref: string
  ctaDataMeet: string
}) {
  const t = useTranslations('YoutubeWelkom')
  const searchParams = useSearchParams()

  if (leesHerkomst(searchParams.get('van')) !== 'youtube') return null

  const className =
    'mt-3 inline-flex min-h-11 items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-accent/90'

  return (
    <div className="mx-auto mt-4 max-w-xl rounded-xl border border-accent/30 bg-accent-light p-4 text-center sm:mt-6">
      <p className="text-sm text-accent sm:text-base">{t('tekst')}</p>
      {ctaHref.startsWith('#') ? (
        <a href={ctaHref} data-meet={ctaDataMeet} className={className}>
          {t('cta')}
        </a>
      ) : (
        <Link href={ctaHref} data-meet={ctaDataMeet} className={className}>
          {t('cta')}
        </Link>
      )}
    </div>
  )
}
