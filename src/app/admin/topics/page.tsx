import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'
import { Badge, Button, Card, Input } from '@/components/ui'

import { createTopic } from './actions'

type TopicRow = {
  id: string
  slug: string
  title: string
  order_index: number
  is_unlocked_by_default: boolean
  topic_clusters: Array<{ count: number }>
  questions: Array<{ count: number }>
}

export default async function TopicsPage() {
  const supabase = await createClient()
  const { data: topics } = await supabase
    .from('topics')
    .select(
      'id, slug, title, order_index, is_unlocked_by_default, topic_clusters(count), questions(count)',
    )
    .order('order_index', { ascending: true })
    .returns<TopicRow[]>()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-text">Topics</h2>
        <p className="text-sm text-text-muted">
          De hoofdonderwerpen van de leerlijn. Clusters beheer je vanuit de
          detailpagina.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">#</th>
              <th className="px-4 py-2 font-medium">Titel</th>
              <th className="px-4 py-2 font-medium">Slug</th>
              <th className="px-4 py-2 font-medium">Clusters</th>
              <th className="px-4 py-2 font-medium">Vragen</th>
              <th className="px-4 py-2 font-medium">Toegang</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {topics?.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-2 text-text-muted">{t.order_index}</td>
                <td className="px-4 py-2 font-medium">{t.title}</td>
                <td className="px-4 py-2 font-mono text-xs text-text-muted">
                  {t.slug}
                </td>
                <td className="px-4 py-2">
                  {t.topic_clusters?.[0]?.count ?? 0}
                </td>
                <td className="px-4 py-2">{t.questions?.[0]?.count ?? 0}</td>
                <td className="px-4 py-2">
                  {t.is_unlocked_by_default ? (
                    <Badge tone="accent">Open</Badge>
                  ) : (
                    <Badge>Op slot</Badge>
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  <Link
                    href={`/admin/topics/${t.id}`}
                    className="text-accent hover:underline"
                  >
                    Bewerken →
                  </Link>
                </td>
              </tr>
            ))}
            {!topics?.length && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-text-muted"
                >
                  Nog geen topics. Voeg er hieronder een toe.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Card>
        <h3 className="mb-4 font-serif text-lg text-text">Nieuw topic</h3>
        <form action={createTopic} className="grid gap-3 sm:grid-cols-2">
          <Input name="title" label="Titel" required placeholder="De Integraalregel" />
          <Input
            name="slug"
            label="Slug"
            required
            pattern="[a-z0-9_-]+"
            placeholder="integraalregel"
            hint="Kleine letters, cijfers, - of _"
          />
          <Input
            name="order_index"
            label="Volgorde"
            type="number"
            defaultValue={99}
            min={0}
          />
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-text">
            <input
              type="checkbox"
              name="is_unlocked_by_default"
              className="size-4 rounded border-border"
            />
            Direct beschikbaar voor nieuwe studenten
          </label>
          <div className="sm:col-span-2">
            <Button type="submit">Toevoegen</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
