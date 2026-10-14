'use client'

import { NextIntlClientProvider, useTranslations } from 'next-intl'
import Link from 'next/link'

import { routing } from '@/i18n/routing'
import berichten from '../../messages/nl.json'

const TAAL = routing.defaultLocale

function Inhoud({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations('ErrorPage')

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent">
          {t('eyebrow')}
        </p>
        <h1 className="font-serif text-4xl leading-tight text-text sm:text-5xl">
          {t('h1')}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-text-muted">{t('lead')}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="min-h-11 rounded-lg bg-accent px-5 py-3 text-white shadow-sm hover:bg-accent/90"
          >
            {t('ctaRetry')}
          </button>
          <Link
            href={`/${TAAL}/oefenen`}
            className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-5 py-3 text-text hover:bg-surface-2"
          >
            {t('ctaOefenen')}
          </Link>
        </div>
      </div>
    </main>
  )
}

/** Tekst voor een crash. De ruwe fout hoort hier niet op: die blijft in de console. */
export function FoutPagina({ onRetry }: { onRetry: () => void }) {
  return (
    <NextIntlClientProvider locale={TAAL} messages={berichten}>
      <Inhoud onRetry={onRetry} />
    </NextIntlClientProvider>
  )
}
