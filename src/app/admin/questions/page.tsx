import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui'

type SearchParams = Promise<{
  topic?: string
  cluster?: string
  difficulty?: string
  ai?: string
  q?: string
}>

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const supabase = await createClient()

  const [{ data: topics }, { data: clusters }] = await Promise.all([
    supabase
      .from('topics')
      .select('id, slug, title, order_index')
      .order('order_index'),
    supabase
      .from('topic_clusters')
      .select('id, topic_id, slug, title, order_index')
      .order('order_index'),
  ])

  let query = supabase
    .from('questions')
    .select(
      'id, body, answer, difficulty, is_ai_generated, topic_id, cluster_id, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(200)

  if (sp.topic) query = query.eq('topic_id', sp.topic)
  if (sp.cluster) query = query.eq('cluster_id', sp.cluster)
  if (sp.difficulty) {
    const d = Number(sp.difficulty)
    if (d === 1 || d === 2 || d === 3) query = query.eq('difficulty', d)
  }
  if (sp.ai === '1') query = query.eq('is_ai_generated', true)
  if (sp.ai === '0') query = query.eq('is_ai_generated', false)
  if (sp.q) query = query.ilike('body', `%${sp.q}%`)

  const { data: questions } = await query

  const clustersForSelectedTopic = sp.topic
    ? clusters?.filter((c) => c.topic_id === sp.topic)
    : clusters

  const topicById = new Map(topics?.map((t) => [t.id, t]))
  const clusterById = new Map(clusters?.map((c) => [c.id, c]))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl text-text">Vragen</h2>
          <p className="text-sm text-text-muted">
            {questions?.length ?? 0} getoond (maximaal 200).
          </p>
        </div>
        <Link
          href="/admin/questions/nieuw"
          className="inline-flex items-center rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-accent/90"
        >
          + Nieuwe vraag
        </Link>
      </div>

      {/* --- Filters --- */}
      <form
        className="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-5"
        action="/admin/questions"
      >
        <select
          name="topic"
          defaultValue={sp.topic ?? ''}
          className="rounded-md border border-border bg-surface px-2 py-2 text-sm"
        >
          <option value="">Alle topics</option>
          {topics?.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
        <select
          name="cluster"
          defaultValue={sp.cluster ?? ''}
          className="rounded-md border border-border bg-surface px-2 py-2 text-sm"
        >
          <option value="">Alle clusters</option>
          {clustersForSelectedTopic?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <select
          name="difficulty"
          defaultValue={sp.difficulty ?? ''}
          className="rounded-md border border-border bg-surface px-2 py-2 text-sm"
        >
          <option value="">Alle moeilijkheden</option>
          <option value="1">Moeilijkheid 1</option>
          <option value="2">Moeilijkheid 2</option>
          <option value="3">Moeilijkheid 3</option>
        </select>
        <select
          name="ai"
          defaultValue={sp.ai ?? ''}
          className="rounded-md border border-border bg-surface px-2 py-2 text-sm"
        >
          <option value="">Alle bronnen</option>
          <option value="0">Handmatig</option>
          <option value="1">AI-gegenereerd</option>
        </select>
        <div className="flex gap-2">
          <input
            name="q"
            defaultValue={sp.q ?? ''}
            placeholder="Zoek in vraagtekst…"
            className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent/90"
          >
            Filter
          </button>
        </div>
      </form>

      {/* --- Table --- */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Vraag</th>
              <th className="px-4 py-2 font-medium">Antwoord</th>
              <th className="px-4 py-2 font-medium">Topic / cluster</th>
              <th className="px-4 py-2 font-medium">Moeilijkheid</th>
              <th className="px-4 py-2 font-medium">Bron</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {questions?.map((q) => {
              const topic = topicById.get(q.topic_id)
              const cluster = clusterById.get(q.cluster_id)
              return (
                <tr key={q.id} className="align-top">
                  <td className="px-4 py-2 max-w-[32ch]">
                    <p className="line-clamp-2">{q.body}</p>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-text-muted">
                    {q.answer}
                  </td>
                  <td className="px-4 py-2 text-xs text-text-muted">
                    <div>{topic?.title ?? '—'}</div>
                    <div className="italic">{cluster?.title ?? '—'}</div>
                  </td>
                  <td className="px-4 py-2">
                    <Badge
                      tone={
                        q.difficulty === 1
                          ? 'accent'
                          : q.difficulty === 2
                            ? 'warn'
                            : 'danger'
                      }
                    >
                      {q.difficulty}
                    </Badge>
                  </td>
                  <td className="px-4 py-2">
                    {q.is_ai_generated ? (
                      <Badge tone="warn">AI</Badge>
                    ) : (
                      <Badge>Handmatig</Badge>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/admin/questions/${q.id}`}
                      className="text-accent hover:underline"
                    >
                      Bewerken →
                    </Link>
                  </td>
                </tr>
              )
            })}
            {!questions?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-text-muted">
                  Geen vragen gevonden met deze filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
