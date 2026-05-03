import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import {
  findActiveCluster,
  loadLearningPath,
  pickNextQuestion,
} from '@/lib/practice/engine'
import { Card } from '@/components/ui'

import { ClusterRuleHint } from './cluster-rule'
import { PracticeCard } from './practice-card'
import { PracticeSidebar } from './sidebar'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Leerpad' })
  return { title: t('title') }
}

type PageProps = {
  searchParams?: Promise<{ topic?: string; cluster?: string }>
}

export default async function LeerpadPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/inloggen')

  const t = await getTranslations('Leerpad')

  const params = (await searchParams) ?? {}
  const topicParam = params.topic?.trim()
  const clusterParam = params.cluster?.trim()

  const [{ data: greetProfile }, path] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle(),
    loadLearningPath(supabase, user.id),
  ])
  const greeting =
    greetProfile?.display_name?.trim().split(/\s+/)[0]?.trim() || null

  let active = findActiveCluster(path)

  if (clusterParam) {
    for (const topic of path) {
      if (topic.isLocked) continue
      const cluster = topic.clusters.find((c) => c.id === clusterParam)
      if (cluster) { active = { topic, cluster }; break }
    }
  } else if (topicParam) {
    const topic = path.find((t2) => t2.slug === topicParam && !t2.isLocked)
    if (topic) {
      const cluster =
        topic.clusters.find((c) => c.status !== 'mastered') ??
        topic.clusters[topic.clusters.length - 1]
      if (cluster) active = { topic, cluster }
    }
  }

  if (!active) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center">
        {greeting ? (
          <p className="mb-2 text-sm text-text-muted">{t('hi', { name: greeting })}</p>
        ) : null}
        <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent">
          {t('completeEyebrow')}
        </p>
        <h1 className="font-serif text-3xl text-text">{t('completeH1')}</h1>
        <p className="mt-3 max-w-md text-text-muted">{t('completeBody')}</p>
        <Link
          href="/dashboard"
          className="mt-6 rounded-md bg-accent px-4 py-2 text-white"
        >
          {t('completeCta')}
        </Link>
      </div>
    )
  }

  const question = await pickNextQuestion(supabase, user.id, active.cluster.id)

  let steps: Array<{
    id: string
    step_order: number
    step_description: string
  }> = []
  if (question) {
    const { data } = await supabase
      .from('question_steps')
      .select('id, step_order, step_description')
      .eq('question_id', question.id)
      .order('step_order')
    steps = data ?? []
  }

  return (
    <div className="flex">
      <PracticeSidebar path={path} activeClusterId={active.cluster.id} />

      <div className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-10">
          {greeting ? (
            <p className="mb-2 text-sm text-text-muted">
              {t('hi', { name: greeting })}
            </p>
          ) : null}
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-wider text-accent">
              {active.topic.title}
            </p>
            <h1 className="font-serif text-2xl text-text">
              {active.cluster.title}
            </h1>
            <ClusterRuleHint
              key={`${active.topic.slug}/${active.cluster.slug}`}
              topicSlug={active.topic.slug}
              clusterSlug={active.cluster.slug}
            />
            <ProgressBar streak={active.cluster.correct_streak} threshold={3} streakLabel={t('streakLabel')} />
          </div>

          {question ? (
            <PracticeCard
              key={question.id}
              question={{
                id: question.id,
                body: question.body,
                latex_body: question.latex_body,
                difficulty: question.difficulty,
              }}
              steps={steps}
              streakAtStart={active.cluster.correct_streak}
            />
          ) : (
            <Card>
              <p className="font-serif text-lg text-text">{t('noQuestions')}</p>
              <p className="mt-2 text-sm text-text-muted">{t('noQuestionsBody')}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function ProgressBar({
  streak,
  threshold,
  streakLabel,
}: {
  streak: number
  threshold: number
  streakLabel: string
}) {
  const dots = Array.from({ length: threshold }, (_, i) => i < streak)
  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="text-xs text-text-muted">{streakLabel}</span>
      <div className="flex items-center gap-1">
        {dots.map((filled, i) => (
          <span
            key={i}
            className={
              filled
                ? 'inline-block size-2.5 rounded-full bg-accent'
                : 'inline-block size-2.5 rounded-full border border-border bg-surface'
            }
          />
        ))}
      </div>
      <span className="text-xs text-text-muted">
        {streak}/{threshold}
      </span>
    </div>
  )
}
