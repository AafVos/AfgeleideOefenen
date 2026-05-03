import { getTranslations, getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

import { Math as TeX } from '@/components/math'
import { Card } from '@/components/ui'
import { createClient } from '@/lib/supabase/server'
import { CLUSTER_THEORY, CLUSTER_THEORY_EN, TOPIC_FORMULA, TOPIC_INTROS, TOPIC_INTROS_EN } from '@/lib/theory'

import { ClusterBlock } from './cluster-block'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Theorie' })
  return { title: t('title'), description: t('description') }
}

type ClusterRow = {
  id: string
  slug: string
  title: string
  order_index: number
}

type TopicRow = {
  id: string
  slug: string
  title: string
  order_index: number
}

export default async function TheoriePage() {
  const supabase = await createClient()
  const locale = await getLocale()
  const t = await getTranslations('Theorie')

  const { data: topics } = await supabase
    .from('topics')
    .select('id, slug, title, order_index')
    .order('order_index')

  const topicList: TopicRow[] = topics ?? []

  const { data: clustersRaw } = await supabase
    .from('topic_clusters')
    .select('id, slug, title, order_index, topic_id')
    .order('order_index')

  const clustersByTopic = new Map<string, ClusterRow[]>()
  for (const c of clustersRaw ?? []) {
    const arr = clustersByTopic.get(c.topic_id) ?? []
    arr.push({ id: c.id, slug: c.slug, title: c.title, order_index: c.order_index })
    clustersByTopic.set(c.topic_id, arr)
  }

  const theoryMap = locale === 'en' ? CLUSTER_THEORY_EN : CLUSTER_THEORY
  const introsMap = locale === 'en' ? TOPIC_INTROS_EN : TOPIC_INTROS

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
          practiceLink: () => (
            <Link href="/oefenen" className="text-accent hover:underline">
              {t('introLink')}
            </Link>
          ),
        })}
      </p>

      {topicList.length > 0 && (
        <nav
          aria-label="Formule-overzicht"
          className="mt-10 rounded-2xl border border-border bg-surface p-5"
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-wider text-text-muted">
            {t('formulaNavTitle')}
          </p>
          <ol className="grid items-stretch gap-3 sm:grid-cols-2">
            {topicList.map((tp, i) => {
              const formula = TOPIC_FORMULA[tp.slug]
              return (
                <li key={tp.id} className="flex">
                  <a
                    href={`#${tp.slug}`}
                    className="group flex h-full w-full items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-4 transition hover:border-accent hover:bg-accent-light"
                  >
                    <span className="self-start shrink-0 text-sm text-text-muted group-hover:text-accent">
                      <span className="font-serif tabular-nums">{i + 1}.</span>{' '}
                      <span className="font-sans">{tp.title}</span>
                    </span>
                    <span className="min-w-0 flex-1 overflow-x-auto">
                      {formula ? (
                        <TeX tex={formula} displayMode />
                      ) : (
                        <span className="text-sm text-text">{tp.title}</span>
                      )}
                    </span>
                  </a>
                </li>
              )
            })}
          </ol>
        </nav>
      )}

      <div className="mt-14 space-y-16">
        {topicList.map((topic, idx) => {
          const clusters = (clustersByTopic.get(topic.id) ?? [])
            .slice()
            .sort((a, b) => a.order_index - b.order_index)
          const intro = introsMap[topic.slug]

          return (
            <section
              key={topic.id}
              id={topic.slug}
              className="scroll-mt-20"
              aria-labelledby={`${topic.slug}-title`}
            >
              <header className="border-b border-border pb-4">
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                  {t('topicLabel')} {idx + 1}
                </p>
                <h2
                  id={`${topic.slug}-title`}
                  className="mt-1 font-serif text-3xl text-text"
                >
                  {topic.title}
                </h2>
                {intro && (
                  <p className="mt-3 max-w-3xl text-text-muted">
                    {intro.split(/(\$[^$]+\$)/).map((part, i) =>
                      part.startsWith('$') && part.endsWith('$') && part.length > 2
                        ? <TeX key={i} tex={part.slice(1, -1)} />
                        : <span key={i}>{part}</span>
                    )}
                  </p>
                )}
              </header>

              {clusters.length === 0 ? (
                <p className="mt-6 text-sm text-text-muted">{t('noSubtopics')}</p>
              ) : (
                <div className="mt-6 space-y-3">
                  {clusters.map((cluster, ci) => {
                    const key = `${topic.slug}/${cluster.slug}`
                    const theory = theoryMap[key]
                    return (
                      <ClusterBlock
                        key={cluster.id}
                        ordinal={ci + 1}
                        title={cluster.title}
                        theory={theory}
                        exampleLabel={t('example')}
                        stepLabel={t('step', { n: 0 }).replace('0', '{n}')}
                        noTheoryLabel={t('noTheory')}
                      />
                    )
                  })}
                </div>
              )}

              <div className="mt-6">
                <Link
                  href={`/oefenen?topic=${encodeURIComponent(topic.slug)}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                >
                  {t('practiceLink', { topic: topic.title.toLowerCase() })}
                </Link>
              </div>
            </section>
          )
        })}
      </div>

      {topicList.length === 0 && (
        <Card className="mt-12">
          <p className="text-text-muted">{t('noTopics')}</p>
        </Card>
      )}
    </div>
  )
}
