import { Math as TeX, RichMath } from '@/components/math'
import type { OverviewCard as OverviewCardData } from '@/lib/theory'

export function OverviewCard({
  card,
  index,
  exampleLabel,
  hideExamples,
  href,
}: {
  card: OverviewCardData
  index: number
  exampleLabel: string
  hideExamples?: boolean
  href?: string
}) {
  const article = (
    <article className={`rounded-xl border border-border bg-surface p-5 transition-colors${href ? ' hover:border-accent' : ''}`}>
      <header className="mb-3 flex items-baseline gap-2">
        <span className="font-serif text-sm text-text-muted tabular-nums">
          {index}.
        </span>
        <h3 className="font-serif text-lg text-text">{card.title}</h3>
      </header>

      {card.formula && (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface-2 px-4 py-3 text-[0.85em]">
          <TeX tex={card.formula} displayMode />
        </div>
      )}

      {card.table && (
        <div className={`${card.formula ? 'mt-4' : ''} overflow-x-auto rounded-lg border border-border`}>
          <table className="w-full text-sm">
            <thead className="bg-surface-2">
              <tr>
                {card.table.headers.map((h, i) => (
                  <th
                    key={i}
                    className="px-3 py-2 text-left font-medium text-text-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {card.table.rows.map((row, ri) => (
                <tr key={ri} className={ri > 0 ? 'border-t border-border' : ''}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 align-middle text-text">
                      <RichMath source={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!hideExamples && card.examples && card.examples.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
            {exampleLabel}
          </p>
          <ul className="space-y-1.5">
            {card.examples.map((ex, i) => (
              <li
                key={i}
                className="overflow-x-auto rounded-md bg-surface-2 px-3 py-2 text-sm"
              >
                <TeX tex={`${ex.problem} \\implies ${ex.answer}`} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {card.notes && card.notes.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs leading-relaxed text-text-muted">
          {card.notes.map((note, i) => (
            <li key={i}>
              <RichMath source={note} />
            </li>
          ))}
        </ul>
      )}
    </article>
  )

  if (href) {
    return (
      <a href={href} className="block cursor-pointer">
        {article}
      </a>
    )
  }
  return article
}
