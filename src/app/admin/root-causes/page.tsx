import { createClient } from '@/lib/supabase/server'
import { Button, Card, Input, Select } from '@/components/ui'

import {
  createRootCause,
  deleteRootCause,
  updateRootCause,
} from './actions'

export default async function RootCausesPage() {
  const supabase = await createClient()

  const [{ data: topics }, { data: rootCauses }] = await Promise.all([
    supabase
      .from('topics')
      .select('id, title, order_index')
      .order('order_index'),
    supabase
      .from('root_causes')
      .select('id, topic_id, slug, description')
      .order('slug'),
  ])

  const topicById = new Map(topics?.map((t) => [t.id, t.title]))

  // Group root causes per topic for display.
  const grouped = new Map<string, typeof rootCauses>()
  for (const rc of rootCauses ?? []) {
    const list = grouped.get(rc.topic_id) ?? []
    list.push(rc)
    grouped.set(rc.topic_id, list)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-text">Root causes</h2>
        <p className="text-sm text-text-muted">
          De fouttypen waar het antwoord van een student op terug te leiden is.
          Gebruikt door Gemini bij foutanalyse en bij het stappenplan.
        </p>
      </div>

      {topics?.map((t) => {
        const list = grouped.get(t.id) ?? []
        return (
          <div key={t.id}>
            <h3 className="mb-2 font-serif text-lg text-text">{t.title}</h3>
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <table className="w-full text-sm">
                <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-text-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">Slug</th>
                    <th className="px-3 py-2 font-medium">Beschrijving</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {list.map((rc) => {
                    const update = updateRootCause.bind(null, rc.id)
                    const remove = deleteRootCause.bind(null, rc.id)
                    return (
                      <tr key={rc.id} className="align-top">
                        <td className="px-3 py-2">
                          <input
                            form={`rc-${rc.id}`}
                            name="slug"
                            defaultValue={rc.slug}
                            required
                            className="w-full rounded border border-border bg-surface px-2 py-1 font-mono text-xs"
                          />
                          <input
                            form={`rc-${rc.id}`}
                            type="hidden"
                            name="topic_id"
                            defaultValue={rc.topic_id}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            form={`rc-${rc.id}`}
                            name="description"
                            defaultValue={rc.description}
                            required
                            className="w-full rounded border border-border bg-surface px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <form action={update} id={`rc-${rc.id}`} className="inline">
                            <button
                              type="submit"
                              className="mr-2 text-sm font-medium text-accent hover:underline"
                            >
                              Opslaan
                            </button>
                          </form>
                          <form action={remove} className="inline">
                            <button
                              type="submit"
                              className="text-sm font-medium text-accent-2 hover:underline"
                            >
                              Verwijder
                            </button>
                          </form>
                        </td>
                      </tr>
                    )
                  })}
                  {!list.length && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-4 text-center text-text-muted"
                      >
                        Nog geen root causes voor dit topic.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      <Card>
        <h3 className="mb-4 font-serif text-lg text-text">Nieuwe root cause</h3>
        <form action={createRootCause} className="grid gap-3 sm:grid-cols-4">
          <Select name="topic_id" label="Topic" required defaultValue="">
            <option value="" disabled>
              Kies topic…
            </option>
            {topics?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </Select>
          <Input
            name="slug"
            label="Slug"
            required
            placeholder="kettingregel.vereenvoudigen"
            pattern="[a-z0-9._-]+"
            hint="Uniek; prefixen per topic is handig."
          />
          <Input
            name="description"
            label="Beschrijving"
            required
            placeholder="Eindantwoord vereenvoudigen"
            className="sm:col-span-2"
          />
          <div className="sm:col-span-4">
            <Button type="submit">Toevoegen</Button>
          </div>
        </form>
        <p className="mt-3 text-xs text-text-muted">
          Tip: {topicById.size > 0 && 'prefix slugs per topic'} om dubbele namen
          te voorkomen, bv. <code>productregel.vereenvoudigen</code> en{' '}
          <code>quotientregel.vereenvoudigen</code>.
        </p>
      </Card>
    </div>
  )
}
