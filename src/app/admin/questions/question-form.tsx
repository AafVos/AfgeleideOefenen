'use client'

import { useMemo, useState } from 'react'

import { Input, Select, Textarea, Button } from '@/components/ui'

type TopicOpt = { id: string; title: string }
type ClusterOpt = { id: string; topic_id: string; title: string }

export type QuestionFormValues = {
  topic_id: string
  cluster_id: string
  latex_body: string | null
  answer: string
  latex_answer: string | null
  difficulty: 1 | 2 | 3
  order_index: number | null
}

export function QuestionForm({
  action,
  topics,
  clusters,
  initial,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>
  topics: TopicOpt[]
  clusters: ClusterOpt[]
  initial?: Partial<QuestionFormValues>
  submitLabel: string
}) {
  const [topicId, setTopicId] = useState(initial?.topic_id ?? topics[0]?.id ?? '')
  const [clusterId, setClusterId] = useState(initial?.cluster_id ?? '')

  const filteredClusters = useMemo(
    () => clusters.filter((c) => c.topic_id === topicId),
    [clusters, topicId],
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
        name="latex_body"
        label="LaTeX vraag"
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

      <Button type="submit">{submitLabel}</Button>
    </form>
  )
}
