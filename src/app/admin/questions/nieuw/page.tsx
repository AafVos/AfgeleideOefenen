import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui'

import { createQuestion } from '../actions'
import { QuestionForm } from '../question-form'

export default async function NewQuestionPage() {
  const supabase = await createClient()

  const [{ data: topics }, { data: clusters }, { data: rootCauses }] =
    await Promise.all([
      supabase
        .from('topics')
        .select('id, title, order_index')
        .order('order_index'),
      supabase
        .from('topic_clusters')
        .select('id, topic_id, title, order_index')
        .order('order_index'),
      supabase.from('root_causes').select('slug, description, topic_id'),
    ])

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/questions"
          className="text-sm text-text-muted hover:text-text"
        >
          ← Alle vragen
        </Link>
        <h2 className="mt-1 font-serif text-2xl text-text">Nieuwe vraag</h2>
      </div>

      <Card>
        <QuestionForm
          action={createQuestion}
          topics={topics ?? []}
          clusters={clusters ?? []}
          rootCauses={rootCauses ?? []}
          submitLabel="Vraag opslaan"
        />
      </Card>
    </div>
  )
}
