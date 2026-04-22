'use client'

import { useMemo, useState } from 'react'

import { Input, Select, Textarea, Button } from '@/components/ui'

type TopicOpt = { id: string; title: string }
type ClusterOpt = { id: string; topic_id: string; title: string }
type RootCauseOpt = { slug: string; description: string; topic_id: string }

export type QuestionFormValues = {
  topic_id: string
  cluster_id: string
  body: string
  latex_body: string | null
  answer: string
  latex_answer: string | null
  difficulty: 1 | 2 | 3
  root_cause_tags: string[]
  order_index: number | null
}

export function QuestionForm({
  action,
  topics,
  clusters,
  rootCauses,
  initial,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>
  topics: TopicOpt[]
  clusters: ClusterOpt[]
  rootCauses: RootCauseOpt[]
  initial?: Partial<QuestionFormValues>
  submitLabel: string
}) {
  const [topicId, setTopicId] = useState(initial?.topic_id ?? topics[0]?.id ?? '')
  const [clusterId, setClusterId] = useState(initial?.cluster_id ?? '')

  const filteredClusters = useMemo(
    () => clusters.filter((c) => c.topic_id === topicId),
    [clusters, topicId],
  )

  const filteredRootCauses = useMemo(
    () => rootCauses.filter((r) => r.topic_id === topicId),
    [rootCauses, topicId],
  )

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          name="topic_id"
          label="Topic"
          value={topicId}
          onChange={(e) => {
            setTopicId(e.target.value)
            setClusterId('')
          }}
          required
        >
          <option value="" disabled>
            Kies topic…
          </option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </Select>
        <Select
          name="cluster_id"
          label="Cluster"
          value={clusterId}
          onChange={(e) => setClusterId(e.target.value)}
          required
        >
          <option value="" disabled>
            Kies cluster…
          </option>
          {filteredClusters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
      </div>

      <Textarea
        name="body"
        label="Vraagtekst (platte tekst)"
        rows={2}
        required
        defaultValue={initial?.body}
        hint="Zoals de student de vraag ziet, bv. 'Bepaal f'(x) als f(x) = 4x³'"
      />
      <Textarea
        name="latex_body"
        label="LaTeX vraag (optioneel, voor KaTeX rendering)"
        rows={2}
        defaultValue={initial?.latex_body ?? ''}
        hint="Bijv. f(x) = 4x^{3}"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="answer"
          label="Juist antwoord (genormaliseerd)"
          required
          defaultValue={initial?.answer}
          hint="Zoals het na normalisatie eruit ziet, bv. '12x^2'"
        />
        <Input
          name="latex_answer"
          label="LaTeX antwoord (optioneel)"
          defaultValue={initial?.latex_answer ?? ''}
          hint="Bijv. 12x^{2}"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Select
          name="difficulty"
          label="Moeilijkheid"
          defaultValue={initial?.difficulty ?? 1}
          required
        >
          <option value={1}>1 — basis</option>
          <option value={2}>2 — midden</option>
          <option value={3}>3 — moeilijk</option>
        </Select>
        <Input
          name="order_index"
          label="Volgorde (optioneel)"
          type="number"
          min={0}
          defaultValue={initial?.order_index ?? ''}
        />
      </div>

      <Textarea
        name="root_cause_tags"
        label="Root cause tags (kommagescheiden slugs)"
        rows={2}
        defaultValue={initial?.root_cause_tags?.join(', ') ?? ''}
        hint={
          filteredRootCauses.length
            ? `Beschikbaar voor dit topic: ${filteredRootCauses
                .map((r) => r.slug)
                .join(', ')}`
            : 'Selecteer eerst een topic om voorgestelde tags te zien.'
        }
      />

      <Button type="submit">{submitLabel}</Button>
    </form>
  )
}
