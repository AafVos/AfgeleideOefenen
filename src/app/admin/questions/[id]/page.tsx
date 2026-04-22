import Link from 'next/link'
import { notFound } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { Button, Card, Input, Select, Badge } from '@/components/ui'

import {
  addStep,
  deleteQuestion,
  deleteStep,
  updateQuestion,
  updateStep,
} from '../actions'
import { QuestionForm } from '../question-form'

export default async function QuestionEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: question } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!question) notFound()

  const [{ data: topics }, { data: clusters }, { data: rootCauses }, { data: steps }] =
    await Promise.all([
      supabase
        .from('topics')
        .select('id, title, order_index')
        .order('order_index'),
      supabase
        .from('topic_clusters')
        .select('id, topic_id, title, order_index')
        .order('order_index'),
      supabase.from('root_causes').select('id, slug, description, topic_id'),
      supabase
        .from('question_steps')
        .select('id, step_order, step_description, root_cause_id')
        .eq('question_id', id)
        .order('step_order'),
    ])

  const rootCausesForTopic = rootCauses?.filter(
    (r) => r.topic_id === question.topic_id,
  )

  const updateThisQuestion = updateQuestion.bind(null, id)
  const deleteThisQuestion = deleteQuestion.bind(null, id)
  const addStepHere = addStep.bind(null, id)

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/questions"
          className="text-sm text-text-muted hover:text-text"
        >
          ← Alle vragen
        </Link>
        <div className="mt-1 flex items-baseline gap-3">
          <h2 className="font-serif text-2xl text-text">Vraag bewerken</h2>
          {question.is_ai_generated && <Badge tone="warn">AI-gegenereerd</Badge>}
        </div>
      </div>

      <Card>
        <QuestionForm
          action={updateThisQuestion}
          topics={topics ?? []}
          clusters={clusters ?? []}
          rootCauses={rootCauses ?? []}
          initial={{
            topic_id: question.topic_id,
            cluster_id: question.cluster_id,
            body: question.body,
            latex_body: question.latex_body,
            answer: question.answer,
            latex_answer: question.latex_answer,
            difficulty: question.difficulty,
            root_cause_tags: question.root_cause_tags,
            order_index: question.order_index,
          }}
          submitLabel="Wijzigingen opslaan"
        />
      </Card>

      {/* --- Steps --- */}
      <div>
        <h3 className="mb-2 font-serif text-lg text-text">Stappenplan</h3>
        <p className="mb-3 text-sm text-text-muted">
          De stappen die de student doorloopt als hij een fout maakt. Koppel
          elke stap aan een root cause zodat we weten waar het misging.
        </p>

        <div className="space-y-2">
          {steps?.map((s) => {
            const update = updateStep.bind(null, s.id, id)
            const remove = deleteStep.bind(null, s.id, id)
            return (
              <Card key={s.id}>
                <form action={update} className="grid gap-3 sm:grid-cols-[80px_1fr_1fr_auto] sm:items-end">
                  <Input
                    name="step_order"
                    label="#"
                    type="number"
                    min={1}
                    defaultValue={s.step_order}
                  />
                  <Input
                    name="step_description"
                    label="Beschrijving"
                    required
                    defaultValue={s.step_description}
                  />
                  <Select
                    name="root_cause_id"
                    label="Root cause"
                    defaultValue={s.root_cause_id ?? ''}
                  >
                    <option value="">— Geen —</option>
                    {rootCausesForTopic?.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.slug}
                      </option>
                    ))}
                  </Select>
                  <div className="flex gap-2">
                    <Button type="submit" variant="secondary">
                      Opslaan
                    </Button>
                  </div>
                </form>
                <form action={remove} className="mt-2">
                  <Button type="submit" variant="ghost" className="text-accent-2">
                    Stap verwijderen
                  </Button>
                </form>
              </Card>
            )
          })}
        </div>

        <Card className="mt-4">
          <h4 className="mb-3 font-serif text-base text-text">Stap toevoegen</h4>
          <form action={addStepHere} className="grid gap-3 sm:grid-cols-[80px_1fr_1fr_auto] sm:items-end">
            <Input
              name="step_order"
              label="#"
              type="number"
              min={1}
              defaultValue={(steps?.length ?? 0) + 1}
            />
            <Input
              name="step_description"
              label="Beschrijving"
              required
              placeholder="Verlaag de exponent met 1"
            />
            <Select name="root_cause_id" label="Root cause" defaultValue="">
              <option value="">— Geen —</option>
              {rootCausesForTopic?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.slug}
                </option>
              ))}
            </Select>
            <Button type="submit">Toevoegen</Button>
          </form>
        </Card>
      </div>

      {/* --- Danger zone --- */}
      <Card className="border-accent-2/40">
        <h3 className="mb-2 font-serif text-lg text-text">Gevarenzone</h3>
        <p className="mb-3 text-sm text-text-muted">
          De vraag en alle bijbehorende stappen, antwoorden en known-wrong
          answers worden verwijderd.
        </p>
        <form action={deleteThisQuestion}>
          <Button type="submit" variant="danger">
            Vraag permanent verwijderen
          </Button>
        </form>
      </Card>
    </div>
  )
}
