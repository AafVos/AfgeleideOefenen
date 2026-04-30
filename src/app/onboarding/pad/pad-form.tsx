'use client'

import { useMemo, useState, useTransition } from 'react'


import { Button, ErrorBanner, cn } from '@/components/ui'

import { savePadSelectionsAction } from './actions'

export type TopicPadRow = {
  id: string
  title: string
  slug: string
  order_index: number
}

export function PadForm({ topics }: { topics: TopicPadRow[] }) {
  const sorted = [...topics].sort((a, b) => a.order_index - b.order_index)

  const initial = () => {
    const m = new Map<string, { ken: boolean; wil: boolean }>()
    for (const t of sorted) {
      m.set(t.id, { ken: false, wil: true })
    }
    return m
  }

  const [sel, setSel] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function setCell(
    topicId: string,
    key: 'ken' | 'wil',
    value: boolean,
  ) {
    setSel((prev) => {
      const next = new Map(prev)
      const cur = next.get(topicId) ?? { ken: false, wil: false }
      if (key === 'ken') {
        next.set(topicId, {
          ken: value,
          wil: value ? false : cur.wil,
        })
      } else {
        next.set(topicId, {
          ken: value ? false : cur.ken,
          wil: value,
        })
      }
      return next
    })
  }

  const canSubmit = useMemo(() => {
    return sorted.some((t) => {
      const c = sel.get(t.id)
      return c?.wil && !c?.ken
    })
  }, [sorted, sel])

  function submit() {
    if (!canSubmit) {
      setError(
        'Kies minimaal één onderwerp om aan te werken — of zet ergens nog “wil oefenen” aan.',
      )
      return
    }
    const topicIds = sorted.map((t) => t.id)
    const payload = topicIds.map((topicId) => {
      const c = sel.get(topicId) ?? { ken: false, wil: false }
      return {
        topicId,
        kenIk: c.ken,
        wilOefenen: c.wil,
      }
    })

    start(async () => {
      const res = await savePadSelectionsAction(topicIds, payload)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <div className="space-y-8">
      <p className="text-text-muted">
        Vink &ldquo;Ken ik al&rdquo; aan als je dit onderdeel geheel beheerst.
        Vink &ldquo;Wil ik oefenen&rdquo; aan voor stof die je nog wilt
        trainen. Minstens één onderwerp moet op oefenen staan.
      </p>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[28rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-left">
              <th className="px-4 py-3 font-medium text-text">Onderwerp</th>
              <th className="px-4 py-3 font-medium text-text">Ken ik al</th>
              <th className="px-4 py-3 font-medium text-text">
                Wil ik oefenen
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t, i) => {
              const c = sel.get(t.id) ?? { ken: false, wil: false }
              return (
                <tr
                  key={t.id}
                  className={cn(
                    'border-b border-border last:border-0',
                    i % 2 === 0 ? 'bg-surface' : 'bg-bg',
                  )}
                >
                  <td className="px-4 py-3 font-medium text-text">
                    {t.title}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="size-4 accent-accent"
                      checked={c.ken}
                      onChange={(e) =>
                        setCell(t.id, 'ken', e.target.checked)
                      }
                      aria-label={`${t.title}: ken ik al`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="size-4 accent-accent"
                      checked={c.wil}
                      disabled={c.ken}
                      onChange={(e) =>
                        setCell(t.id, 'wil', e.target.checked)
                      }
                      aria-label={`${t.title}: wil ik oefenen`}
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
          {pending ? 'Opslaan…' : 'Start met mijn leerpad'}
        </Button>
        {!canSubmit && (
          <p className="text-sm text-accent-2">
            Zorg dat minimaal één onderwerp “wil ik oefenen” heeft én daar niet
            alleen “ken ik al” voor staat.
          </p>
        )}
      </div>
    </div>
  )
}
