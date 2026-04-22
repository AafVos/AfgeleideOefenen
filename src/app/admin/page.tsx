import Link from 'next/link'

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const admin = createServiceRoleClient()

  const [topics, clusters, questions, rootCauses, aiQuestions] =
    await Promise.all([
      supabase.from('topics').select('*', { count: 'exact', head: true }),
      supabase.from('topic_clusters').select('*', { count: 'exact', head: true }),
      supabase.from('questions').select('*', { count: 'exact', head: true }),
      supabase.from('root_causes').select('*', { count: 'exact', head: true }),
      supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('is_ai_generated', true),
    ])

  // Service role bypasses RLS so we can count *all* profiles / sessions for stats.
  const [profileCount, sessionCount, answerCount] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('user_sessions').select('*', { count: 'exact', head: true }),
    admin.from('session_answers').select('*', { count: 'exact', head: true }),
  ])

  const stats: Array<{ label: string; value: number | null; href?: string }> = [
    { label: 'Topics', value: topics.count, href: '/admin/topics' },
    { label: 'Clusters', value: clusters.count, href: '/admin/topics' },
    { label: 'Vragen totaal', value: questions.count, href: '/admin/questions' },
    { label: 'AI-gegenereerde vragen', value: aiQuestions.count },
    { label: 'Root causes', value: rootCauses.count, href: '/admin/root-causes' },
    { label: 'Gebruikers', value: profileCount.count, href: '/admin/users' },
    { label: 'Oefensessies', value: sessionCount.count },
    { label: 'Antwoorden totaal', value: answerCount.count },
  ]

  return (
    <div>
      <h2 className="mb-4 font-serif text-xl text-text">Statistieken</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const content = (
            <Card className="h-full">
              <p className="text-xs uppercase tracking-wider text-text-muted">
                {s.label}
              </p>
              <p className="mt-1 font-serif text-3xl text-text">
                {s.value ?? '—'}
              </p>
            </Card>
          )
          return s.href ? (
            <Link
              key={s.label}
              href={s.href}
              className="block transition hover:-translate-y-0.5"
            >
              {content}
            </Link>
          ) : (
            <div key={s.label}>{content}</div>
          )
        })}
      </div>
    </div>
  )
}
