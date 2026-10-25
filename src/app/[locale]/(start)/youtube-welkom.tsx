'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { leesHerkomst } from '@/lib/herkomst'

/**
 * Korte welkomstregel voor wie via `?van=youtube` binnenkomt. Alleen zichtbaar
 * met die parameter, dus los van de rest van de (statische) startpagina.
 */
export function YoutubeWelkom() {
  const t = useTranslations('Home')
  const searchParams = useSearchParams()

  if (leesHerkomst(searchParams.get('van')) !== 'youtube') return null

  return (
    <div className="mx-auto mt-4 max-w-xl rounded-xl border border-accent/30 bg-accent-light p-4 text-center sm:mt-6">
      <p className="text-sm text-accent sm:text-base">{t('youtubeWelkom')}</p>
      <a
        href="#proefsom"
        data-meet="start-youtube-proefsom"
        className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-accent/90"
      >
        {t('youtubeWelkomCta')}
      </a>
    </div>
  )
}
