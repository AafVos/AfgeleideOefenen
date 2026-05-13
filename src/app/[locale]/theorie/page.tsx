import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

import { THEORY_OVERVIEW } from '@/lib/theory'

import { OverviewCard } from './overview-card'
import { DetailCard } from './detail-card'
import { ChapterSection } from './chapter-section'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Theorie' })
  return { title: t('title'), description: t('description') }
}

export default async function TheoriePage() {
  const t = await getTranslations('Theorie')

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-sm font-medium uppercase tracking-wider text-accent">
        {t('eyebrow')}
      </p>
      <h1 className="mt-2 font-serif text-4xl text-text sm:text-[2.75rem]">
        {t('h1')}
      </h1>
      <p className="mt-6 max-w-3xl text-lg text-text-muted">
        {t.rich('intro', {
          practiceLink: (chunks) => (
            <Link href="/oefenen" className="text-accent hover:underline">
              {chunks}
            </Link>
          ),
        })}
      </p>

      {/* ──────────────────────────────────────────────────────────────── */}
      {/* TOP: compact formule-overzicht per hoofdstuk                     */}
      {/* ──────────────────────────────────────────────────────────────── */}
      <div className="mt-10 rounded-2xl border border-border bg-surface-2 p-6 sm:p-8">
        <div className="space-y-12">
          {(() => {
            let cardIndex = 0
            return THEORY_OVERVIEW.map((chapter) => (
              <section key={`top-${chapter.slug}`} aria-labelledby={`top-${chapter.slug}`}>
                <h2
                  id={`top-${chapter.slug}`}
                  className="mb-4 font-serif text-2xl text-text"
                >
                  {chapter.title}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {chapter.cards.map((card) => {
                    cardIndex++
                    return (
                      <OverviewCard
                        key={card.id}
                        card={card}
                        index={cardIndex}
                        exampleLabel={t('example')}
                        hideExamples
                        href={card.examples && card.examples.length > 0 ? `#${card.id}` : undefined}
                      />
                    )
                  })}
                </div>
              </section>
            ))
          })()}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────── */}
      {/* BOTTOM: voorbeelden per hoofdstuk                                */}
      {/* ──────────────────────────────────────────────────────────────── */}
      <div className="mt-10 rounded-2xl border border-border bg-surface-2 p-6 sm:p-8">
        <div className="space-y-16">
          {THEORY_OVERVIEW.map((chapter) => {
            const cardsWithExamples = chapter.cards.filter(
              (c) => c.examples && c.examples.length > 0,
            )
            if (cardsWithExamples.length === 0) return null

            return (
              <ChapterSection
                key={`detail-${chapter.slug}`}
                slug={chapter.slug}
                title={chapter.title}
                exampleLabel={t('example')}
                footer={
                  <Link
                    href={`/oefenen?chapter=${encodeURIComponent(chapter.slug)}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                  >
                    {t('practiceLink', { topic: chapter.title })}
                  </Link>
                }
              >
                {cardsWithExamples.map((card) => (
                  <DetailCard
                    key={card.id}
                    card={card}
                    exampleLabel={t('example')}
                    stepLabel={t.raw('step') as string}
                  />
                ))}
              </ChapterSection>
            )
          })}
        </div>
      </div>
    </div>
  )
}
