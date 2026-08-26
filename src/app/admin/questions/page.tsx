import Link from 'next/link'

import { SITE } from '@/config/site'
import { createClient } from '@/lib/supabase/server'
import { RichMath } from '@/components/math'
import { Badge, cn } from '@/components/ui'

type SearchParams = Promise<{
  bron?: string
  topic?: string
  cluster?: string
  difficulty?: string
  ai?: string
  q?: string
  jaar?: string
  tijdvak?: string
}>

/** Kleine gekleurde tag-lijst voor de drie stoomcursus-dimensies. */
function TagList({
  nums,
  className,
}: {
  nums: number[]
  className: string
}) {
  if (!nums.length) return <span className="text-text-muted">—</span>
  return <span className={cn('font-mono text-xs', className)}>{nums.join(', ')}</span>
}

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const bron = sp.bron === 'examen' ? 'examen' : 'ai'
  const supabase = await createClient()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl text-text">Vragen</h2>
        </div>
        {bron === 'ai' && (
          <Link
            href="/admin/questions/nieuw"
            className="inline-flex items-center rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-accent/90"
          >
            + Nieuwe vraag
          </Link>
        )}
      </div>

      {/* --- Bron-filter: AI-vragen (website) of examenvragen --- */}
      <div className="flex w-fit gap-1 rounded-xl border border-border bg-surface p-1">
        <Link
          href="/admin/questions"
          className={cn(
            'rounded-lg px-4 py-1.5 text-sm font-medium transition',
            bron === 'ai'
              ? 'bg-accent text-white shadow-sm'
              : 'text-text-muted hover:bg-surface-2 hover:text-text',
          )}
        >
          AI-vragen
        </Link>
        <Link
          href="/admin/questions?bron=examen"
          className={cn(
            'rounded-lg px-4 py-1.5 text-sm font-medium transition',
            bron === 'examen'
              ? 'bg-accent text-white shadow-sm'
              : 'text-text-muted hover:bg-surface-2 hover:text-text',
          )}
        >
          Examenvragen
        </Link>
      </div>

      {bron === 'ai' ? <AiVragen sp={sp} /> : <ExamenVragen sp={sp} />}
    </div>
  )

  /* ── AI-vragen (website-oefenvragen, questions_new) ─────────────────── */
  async function AiVragen({ sp }: { sp: Awaited<SearchParams> }) {
    const [{ data: topics }, { data: clusters }] = await Promise.all([
      supabase
        .from('topics_new')
        .select('id, slug, title, order_index')
        .eq('site', SITE)
        .order('order_index'),
      supabase
        .from('topic_clusters_new')
        .select('id, topic_id, slug, title, order_index')
        .eq('site', SITE)
        .order('order_index'),
    ])

    let query = supabase
      .from('questions_new')
      .select(
        'id, answer, difficulty, is_ai_generated, topic_id, cluster_id, created_at',
      )
      .eq('site', SITE)
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
    if (sp.q) query = query.ilike('latex_body', `%${sp.q}%`)

    const { data: questions } = await query

    const clustersForSelectedTopic = sp.topic
      ? clusters?.filter((c) => c.topic_id === sp.topic)
      : clusters

    const topicById = new Map(topics?.map((t) => [t.id, t]))
    const clusterById = new Map(clusters?.map((c) => [c.id, c]))

    return (
      <>
        <p className="text-sm text-text-muted">
          {questions?.length ?? 0} getoond (maximaal 200).
        </p>

        {/* --- Filters --- */}
        <form
          className="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-5"
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
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[34rem] text-sm">
            <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-text-muted">
              <tr>
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
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-text-muted"
                  >
                    Geen vragen gevonden met deze filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  /* ── Examenvragen (exam_questions) ──────────────────────────────────── */
  async function ExamenVragen({ sp }: { sp: Awaited<SearchParams> }) {
    let query = supabase
      .from('exam_questions')
      .select(
        'id, jaar, tijdvak, nummer, onderwerp, context, vraag, verhaaltjes, afgeleides, oplosmethoden, toelichting',
      )
      .eq('site', SITE)
      .eq('bron_type', 'examen')
      .order('jaar', { ascending: false })
      .order('tijdvak')
      .order('nummer')

    if (sp.jaar) query = query.eq('jaar', Number(sp.jaar))
    if (sp.tijdvak) {
      const tv = Number(sp.tijdvak)
      if (tv === 1 || tv === 2) query = query.eq('tijdvak', tv)
    }
    if (sp.q) query = query.ilike('onderwerp', `%${sp.q}%`)

    const { data: questions } = await query

    // Beschikbare jaren voor het filter (los van de actieve filters)
    const { data: jaarRows } = await supabase
      .from('exam_questions')
      .select('jaar')
      .eq('site', SITE)
      .eq('bron_type', 'examen')
    const jaren = [
      ...new Set(
        (jaarRows ?? [])
          .map((r) => r.jaar)
          .filter((j): j is number => j !== null),
      ),
    ].sort((a, b) => b - a)

    return (
      <>
        <p className="text-sm text-text-muted">
          {questions?.length ?? 0} examenvragen (centraal examen wiskunde B VWO,
          alleen vragen met een afgeleide).
        </p>

        {/* --- Filters --- */}
        <form
          className="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4"
          action="/admin/questions"
        >
          <input type="hidden" name="bron" value="examen" />
          <select
            name="jaar"
            defaultValue={sp.jaar ?? ''}
            className="rounded-md border border-border bg-surface px-2 py-2 text-sm"
          >
            <option value="">Alle jaren</option>
            {jaren.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
          <select
            name="tijdvak"
            defaultValue={sp.tijdvak ?? ''}
            className="rounded-md border border-border bg-surface px-2 py-2 text-sm"
          >
            <option value="">Beide tijdvakken</option>
            <option value="1">Tijdvak 1</option>
            <option value="2">Tijdvak 2</option>
          </select>
          <input
            name="q"
            defaultValue={sp.q ?? ''}
            placeholder="Zoek in onderwerp…"
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent/90"
          >
            Filter
          </button>
        </form>

        {/* --- Tegels (zoals op de oefen-pagina); klik om open te klappen --- */}
        <ul className="grid grid-cols-1 items-start gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {questions?.map((q) => (
            <li key={q.id} className="has-[details[open]]:col-span-full">
              <details className="group rounded-xl border border-border bg-surface transition hover:bg-surface-2 open:hover:bg-surface">
                <summary className="flex min-h-[6.75rem] cursor-pointer list-none flex-col px-3 py-3 [&::-webkit-details-marker]:hidden">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-text-muted">
                      {q.jaar} tv{q.tijdvak} · vr {q.nummer}
                    </span>
                    <span
                      aria-hidden
                      className="text-text-muted transition-transform duration-200 group-open:rotate-90"
                    >
                      ›
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-text">
                    {q.onderwerp}
                  </p>
                  {/* Preview alleen ingeklapt; open toont het volledige blok eronder */}
                  <div className="pointer-events-none mt-1 max-h-[5rem] flex-1 overflow-hidden text-left group-open:hidden">
                    <div className="text-xs leading-snug text-text-muted">
                      <RichMath source={q.vraag} blockDisplay={false} />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                    <span>
                      <span className="text-text-muted">G </span>
                      <TagList nums={q.verhaaltjes} className="text-[#8a6a14]" />
                    </span>
                    <span>
                      <span className="text-text-muted">A </span>
                      <TagList nums={q.afgeleides} className="text-accent" />
                    </span>
                    <span>
                      <span className="text-text-muted">O </span>
                      <TagList nums={q.oplosmethoden} className="text-accent-2" />
                    </span>
                  </div>
                </summary>
                <div className="space-y-3 border-t border-border px-4 py-4 text-sm leading-relaxed">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                      Context
                    </p>
                    <p className="mt-1 text-text">
                      <RichMath source={q.context} blockDisplay={false} />
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                      Vraag
                    </p>
                    <p className="mt-1 font-medium text-text">
                      <RichMath source={q.vraag} blockDisplay={false} />
                    </p>
                  </div>
                  {q.toelichting && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                        Toelichting (correctievoorschrift)
                      </p>
                      <p className="mt-1 text-text-muted">
                        <RichMath source={q.toelichting} blockDisplay={false} />
                      </p>
                    </div>
                  )}
                </div>
              </details>
            </li>
          ))}
        </ul>
        {!questions?.length && (
          <p className="rounded-xl border border-border bg-surface px-4 py-10 text-center text-sm text-text-muted">
            Geen examenvragen gevonden met deze filters.
          </p>
        )}
      </>
    )
  }
}
