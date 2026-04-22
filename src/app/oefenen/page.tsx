import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import {
  findActiveCluster,
  loadLearningPath,
  pickNextQuestion,
} from '@/lib/practice/engine'
import { Card } from '@/components/ui'

import { PracticeCard } from './practice-card'
import { PracticeSidebar } from './sidebar'

export const metadata = {
  title: 'Oefenen · afgeleidenoefenen.nl',
}

export default async function OefenenPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/inloggen')

  const path = await loadLearningPath(supabase, user.id)
  const active = findActiveCluster(path)

  if (!active) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent">
          🎉 Klaar
        </p>
        <h1 className="font-serif text-3xl text-text">
          Je hebt alles gemasterd
        </h1>
        <p className="mt-3 max-w-md text-text-muted">
          Alle topics en clusters zijn afgerond. Je kunt je voortgang bekijken
          op je dashboard.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 rounded-md bg-accent px-4 py-2 text-white"
        >
          Naar dashboard →
        </Link>
      </div>
    )
  }

  const question = await pickNextQuestion(supabase, user.id, active.cluster.id)

  // Haal stappenplan op voor de actieve vraag (wordt pas getoond bij fout).
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
          {/* Header */}
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-wider text-accent">
              {active.topic.title}
            </p>
            <h1 className="font-serif text-2xl text-text">
              {active.cluster.title}
            </h1>
            <ProgressBar
              streak={active.cluster.correct_streak}
              threshold={3}
            />
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
              <p className="font-serif text-lg text-text">
                Geen vragen beschikbaar
              </p>
              <p className="mt-2 text-sm text-text-muted">
                Je hebt alle vragen van dit cluster al 3 keer correct
                beantwoord, maar het cluster is nog niet afgerond. De volgende
                oefenronde genereren we in Fase 3 via AI.
              </p>
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
}: {
  streak: number
  threshold: number
}) {
  const dots = Array.from({ length: threshold }, (_, i) => i < streak)
  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="text-xs text-text-muted">Streak</span>
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
