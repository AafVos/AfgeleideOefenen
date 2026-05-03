import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { redirect } from 'next/navigation'

import { Card } from '@/components/ui'
import { loadFreePracticePackForQuestion } from '@/lib/practice/free-session'
import type { ExerciseTile } from '@/lib/practice/free-topic-overview'
import { loadExerciseTilesForTopic } from '@/lib/practice/free-topic-overview'
import { createClient } from '@/lib/supabase/server'

import { PracticeCard } from '../leerpad/practice-card'
import { ExerciseTileGrid } from './exercise-tile-grid'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'FreeExercise' })
  return { title: t('title') }
}

type PageProps = {
  searchParams?: Promise<{ topic?: string; q?: string }>
}

export default async function OefenenPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/inloggen')

  const t = await getTranslations('FreeExercise')

  const params = (await searchParams) ?? {}
  const slugParam = params.topic?.trim()
  const qParam = params.q?.trim() ?? null

  const { data: topics } = await supabase
    .from('topics')
    .select('id, title, slug')
    .order('order_index')

  const list = topics ?? []
  const resolved =
    slugParam && list.some((tp) => tp.slug === slugParam)
      ? slugParam
      : list[0]?.slug

  const activeTopic = resolved ? list.find((tp) => tp.slug === resolved) : undefined

  let tiles: ExerciseTile[] = []
  if (activeTopic) {
    const row = await loadExerciseTilesForTopic(supabase, activeTopic.id)
    tiles = row.tiles
  }

  let pack: Awaited<ReturnType<typeof loadFreePracticePackForQuestion>> = null
  let streakAtStart = 0

  if (activeTopic && qParam) {
    pack = await loadFreePracticePackForQuestion(supabase, qParam, activeTopic.id)
    if (pack) {
      const { data: prog } = await supabase
        .from('user_progress')
        .select('correct_streak')
        .eq('user_id', user.id)
        .eq('cluster_id', pack.clusterId)
        .maybeSingle()
      streakAtStart = prog?.correct_streak ?? 0
    }
  }

  const topicBase = resolved
    ? `/oefenen?topic=${encodeURIComponent(resolved)}`
    : '/oefenen'

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col lg:flex-row">
      <aside className="border-b border-border bg-surface p-4 lg:w-56 lg:border-b-0 lg:border-r lg:py-10">
        <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
          {t('topicLabel')}
        </p>
        <ul className="mt-3 flex flex-row gap-1 overflow-x-auto lg:flex-col lg:gap-0.5">
          {list.map((tp) => {
            const on = tp.slug === resolved
            return (
              <li key={tp.id}>
                <Link
                  href={`/oefenen?topic=${encodeURIComponent(tp.slug)}`}
                  className={
                    on
                      ? 'block rounded-md bg-accent px-3 py-2 text-sm font-medium text-white lg:mx-0'
                      : 'block rounded-md px-3 py-2 text-sm text-text-muted hover:bg-surface-2 hover:text-text'
                  }
                >
                  {tp.title}
                </Link>
              </li>
            )
          })}
        </ul>
      </aside>

      <div className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <p className="text-xs font-medium uppercase tracking-wider text-accent">
            {t('h1')}
          </p>
          <h1 className="font-serif text-2xl text-text">
            {activeTopic?.title ?? t('h1')}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-text-muted">
            {t('difficultyHint')} ({t('easy')}, {t('medium')}, {t('hard')}){' '}
            — <strong className="font-medium text-text">{t('lastChecked')}</strong>.
          </p>

          {activeTopic && tiles.length > 0 && (
            <ExerciseTileGrid
              topicSlug={resolved!}
              tiles={tiles}
              activeQuestionId={pack?.question.id ?? null}
              labels={{
                heading: t('tilesHeading'),
                sortedBy: t('tilesSortedBy'),
                easy: t('easy'),
                medium: t('medium'),
                hard: t('hard'),
                lastCorrect: t('tileLastCorrect'),
                lastWrong: t('tileLastWrong'),
                notTried: t('tileNotTried'),
                exercise: t('tileExercise'),
                level: t('tileLevel'),
              }}
            />
          )}

          {pack?.question ? (
            <section
              id="oefenen-practice"
              className="mt-10 scroll-mt-[var(--sticky-offset,6rem)]"
            >
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Link
                  href={topicBase as '/oefenen'}
                  className="text-sm font-medium text-accent underline-offset-2 hover:underline"
                >
                  {t('backToAll')}
                </Link>
              </div>
              <PracticeCard
                key={pack.question.id}
                question={{
                  id: pack.question.id,
                  body: pack.question.body,
                  latex_body: pack.question.latex_body,
                  difficulty: pack.question.difficulty,
                }}
                steps={pack.steps}
                streakAtStart={streakAtStart}
                nextHref={topicBase}
              />
            </section>
          ) : activeTopic && qParam && !pack?.question ? (
            <Card className="mt-8">
              <p className="font-medium text-text">{t('notFound')}</p>
              <Link
                href={topicBase as '/oefenen'}
                className="mt-4 inline-block text-sm font-medium text-accent underline-offset-2 hover:underline"
              >
                {t('backToAll')}
              </Link>
            </Card>
          ) : activeTopic && tiles.length === 0 ? (
            <Card className="mt-8">
              <p className="font-medium text-text">{t('noExercises')}</p>
            </Card>
          ) : !activeTopic ? (
            <Card className="mt-8">
              <p className="text-text-muted">{t('noTopics')}</p>
            </Card>
          ) : (
            <p className="mt-6 text-sm text-text-muted">{t('clickTile')}</p>
          )}
        </div>
      </div>
    </div>
  )
}
