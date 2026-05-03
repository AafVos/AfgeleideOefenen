'use client'

import { useMemo, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'

import { Button, ErrorBanner, cn } from '@/components/ui'

import { savePadSelectionsAction } from './actions'

export type TopicPadRow = {
  id: string
  title: string
  slug: string
  order_index: number
}

export function PadForm({ topics }: { topics: TopicPadRow[] }) {
  const t = useTranslations('OnboardingPad')
  const sorted = [...topics].sort((a, b) => a.order_index - b.order_index)

  const initial = () => {
    const m = new Map<string, { ken: boolean; wil: boolean }>()
    for (const tp of sorted) {
      m.set(tp.id, { ken: false, wil: true })
    }
    return m
  }

  const [sel, setSel] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function setCell(topicId: string, key: 'ken' | 'wil', value: boolean) {
    setSel((prev) => {
      const next = new Map(prev)
      const cur = next.get(topicId) ?? { ken: false, wil: false }
      if (key === 'ken') {
        next.set(topicId, { ken: value, wil: value ? false : cur.wil })
      } else {
        next.set(topicId, { ken: value ? false : cur.ken, wil: value })
      }
      return next
    })
  }

  const canSubmit = useMemo(() => {
    return sorted.some((tp) => {
      const c = sel.get(tp.id)
      return c?.wil && !c?.ken
    })
  }, [sorted, sel])

  function submit() {
    if (!canSubmit) {
      setError(t('errorMin'))
      return
    }
    const topicIds = sorted.map((tp) => tp.id)
    const payload = topicIds.map((topicId) => {
      const c = sel.get(topicId) ?? { ken: false, wil: false }
      return { topicId, kenIk: c.ken, wilOefenen: c.wil }
    })

    start(async () => {
      const res = await savePadSelectionsAction(topicIds, payload)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <div className="space-y-8">
      <p className="text-text-muted">{t('intro')}</p>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[28rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-left">
              <th className="px-4 py-3 font-medium text-text">{t('colTopic')}</th>
              <th className="px-4 py-3 font-medium text-text">{t('colKnow')}</th>
              <th className="px-4 py-3 font-medium text-text">{t('colPractice')}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((tp, i) => {
              const c = sel.get(tp.id) ?? { ken: false, wil: false }
              return (
                <tr
                  key={tp.id}
                  className={cn('border-b border-border last:border-0', i % 2 === 0 ? 'bg-surface' : 'bg-bg')}
                >
                  <td className="px-4 py-3 font-medium text-text">{tp.title}</td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="size-4 accent-accent"
                      checked={c.ken}
                      onChange={(e) => setCell(tp.id, 'ken', e.target.checked)}
                      aria-label={`${tp.title}: ${t('colKnow')}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="size-4 accent-accent"
                      checked={c.wil}
                      disabled={c.ken}
                      onChange={(e) => setCell(tp.id, 'wil', e.target.checked)}
                      aria-label={`${tp.title}: ${t('colPractice')}`}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={submit} disabled={pending || !canSubmit}>
          {pending ? t('submitPending') : t('submitLabel')}
        </Button>
      </div>
    </div>
  )
}
