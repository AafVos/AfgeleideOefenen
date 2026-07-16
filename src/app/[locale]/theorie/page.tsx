import { getTranslations } from 'next-intl/server'

import { THEORY_OVERVIEW } from '@/lib/theory'

import { TheorieClient, type TheorieChapter } from './theorie-client'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Theorie' })
  return { title: t('title'), description: t('description') }
}

/** "H2 — De afgeleide functie" → "De afgeleide functie" */
function stripChapterCode(title: string): string {
  return title.replace(/^H\d+\s*[—–-]\s*/, '')
}

export default async function TheoriePage() {
  const t = await getTranslations('Theorie')

  const chapters: TheorieChapter[] = THEORY_OVERVIEW.map((ch) => ({
    slug: ch.slug,
    title: ch.title,
    practiceLabel: t('practiceLink', { topic: stripChapterCode(ch.title) }),
    cards: ch.cards,
  }))

  return (
    <TheorieClient
      chapters={chapters}
      labels={{
        h1: t('h1'),
        chapterLabel: t('chapterLabel'),
        collapseSidebar: t('collapseSidebar'),
        expandSidebar: t('expandSidebar'),
        exampleLabel: t('example'),
        detailsLabel: t('detailsLabel'),
      }}
    />
  )
}
