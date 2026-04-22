import Link from 'next/link'
import { notFound } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { Button, Card, Input } from '@/components/ui'

import {
  createCluster,
  deleteCluster,
  deleteTopic,
  updateCluster,
  updateTopic,
} from '../actions'

export default async function TopicEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: topic } = await supabase
    .from('topics')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!topic) notFound()

  const { data: clusters } = await supabase
    .from('topic_clusters')
    .select('id, slug, title, order_index')
    .eq('topic_id', id)
    .order('order_index', { ascending: true })

  const updateThisTopic = updateTopic.bind(null, id)
  const deleteThisTopic = deleteTopic.bind(null, id)
  const createClusterHere = createCluster.bind(null, id)

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/topics"
          className="text-sm text-text-muted hover:text-text"
        >
          ← Alle topics
        </Link>
        <h2 className="mt-1 font-serif text-2xl text-text">{topic.title}</h2>
      </div>

      {/* --- Topic details --- */}
      <Card>
        <h3 className="mb-4 font-serif text-lg text-text">Details</h3>
        <form action={updateThisTopic} className="grid gap-3 sm:grid-cols-2">
          <Input
            name="title"
            label="Titel"
            defaultValue={topic.title}
            required
          />
          <Input
            name="slug"
            label="Slug"
            defaultValue={topic.slug}
            required
            pattern="[a-z0-9_-]+"
          />
          <Input
            name="order_index"
            label="Volgorde"
            type="number"
            defaultValue={topic.order_index}
            min={0}
          />
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-text">
            <input
              type="checkbox"
              name="is_unlocked_by_default"
              defaultChecked={topic.is_unlocked_by_default}
              className="size-4 rounded border-border"
            />
            Direct beschikbaar voor nieuwe studenten
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit">Opslaan</Button>
          </div>
        </form>
        <form action={deleteThisTopic} className="mt-3 border-t border-border pt-3">
          <Button type="submit" variant="danger">
            Topic verwijderen (cascade)
          </Button>
        </form>
      </Card>

      {/* --- Clusters --- */}
      <div>
        <h3 className="mb-2 font-serif text-lg text-text">Clusters</h3>
        <p className="mb-3 text-sm text-text-muted">
          Een cluster is een specifieke vraagcategorie binnen dit topic. De
          student doorloopt ze in volgorde.
        </p>

        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Titel</th>
                <th className="px-3 py-2 font-medium">Slug</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clusters?.map((c) => {
                const update = updateCluster.bind(null, c.id, id)
                const remove = deleteCluster.bind(null, c.id, id)
                return (
                  <tr key={c.id}>
                    <td className="px-3 py-2 align-top text-text-muted">
                      <input
                        form={`cluster-${c.id}`}
                        name="order_index"
                        defaultValue={c.order_index}
                        type="number"
                        min={0}
                        className="w-16 rounded border border-border bg-surface px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <input
                        form={`cluster-${c.id}`}
                        name="title"
                        defaultValue={c.title}
                        required
                        className="w-full rounded border border-border bg-surface px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <input
                        form={`cluster-${c.id}`}
                        name="slug"
                        defaultValue={c.slug}
                        required
                        pattern="[a-z0-9_-]+"
                        className="w-full rounded border border-border bg-surface px-2 py-1 font-mono text-xs"
                      />
                    </td>
                    <td className="px-3 py-2 align-top text-right">
                      <form action={update} id={`cluster-${c.id}`} className="inline">
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
              {!clusters?.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-text-muted">
                    Nog geen clusters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Card className="mt-4">
          <h4 className="mb-3 font-serif text-base text-text">Nieuw cluster</h4>
          <form action={createClusterHere} className="grid gap-3 sm:grid-cols-3">
            <Input name="title" label="Titel" required placeholder="Haakjes uitwerken" />
            <Input
              name="slug"
              label="Slug"
              required
              pattern="[a-z0-9_-]+"
              placeholder="haakjes_uitwerken"
            />
            <Input
              name="order_index"
              label="Volgorde"
              type="number"
              defaultValue={(clusters?.length ?? 0) + 1}
              min={0}
            />
            <div className="sm:col-span-3">
              <Button type="submit">Cluster toevoegen</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
