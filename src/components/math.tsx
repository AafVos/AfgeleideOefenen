import katex from 'katex'
import 'katex/dist/katex.min.css'

import { cn } from '@/components/ui'

export function Math({
  tex,
  displayMode = false,
  className,
}: {
  tex: string
  displayMode?: boolean
  className?: string
}) {
  const html = katex.renderToString(tex, {
    displayMode,
    throwOnError: false,
    strict: 'ignore',
    output: 'html',
  })

  return (
    <span
      className={cn(displayMode && 'block my-2', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

// =====================================================================
// RichMath: parse plain text met $...$ (inline) en $$...$$ (block) als
// KaTeX. Handig omdat we vrage-bodies als gewone string opslaan waarin
// soms LaTeX-delimiters staan.
// =====================================================================
type Token =
  | { type: 'text'; value: string }
  | { type: 'math'; value: string; display: boolean }

function tokenize(raw: string): Token[] {
  const tokens: Token[] = []
  let textBuf = ''
  let i = 0
  const pushText = () => {
    if (textBuf) {
      tokens.push({ type: 'text', value: textBuf })
      textBuf = ''
    }
  }
  while (i < raw.length) {
    const ch = raw[i]
    if (ch === '\\' && raw[i + 1] === '$') {
      textBuf += '$'
      i += 2
      continue
    }
    if (ch === '$') {
      const display = raw[i + 1] === '$'
      const open = display ? '$$' : '$'
      const start = i + open.length
      let end = -1
      let j = start
      while (j < raw.length) {
        if (raw[j] === '\\' && raw[j + 1] === '$') {
          j += 2
          continue
        }
        if (display) {
          if (raw[j] === '$' && raw[j + 1] === '$') {
            end = j
            break
          }
        } else if (raw[j] === '$') {
          end = j
          break
        }
        j++
      }
      if (end === -1) {
        // geen sluiter gevonden → gewoon tekst
        textBuf += ch
        i++
        continue
      }
      pushText()
      tokens.push({
        type: 'math',
        value: raw.slice(start, end).replace(/\\\$/g, '$'),
        display,
      })
      i = end + open.length
      continue
    }
    textBuf += ch
    i++
  }
  pushText()
  return tokens
}

export function RichMath({
  source,
  className,
  blockDisplay = false,
}: {
  /** Tekst met optionele $...$ / $$...$$ stukken */
  source: string
  className?: string
  /** Forceer alle math in displayMode (grote, gecentreerde weergave) */
  blockDisplay?: boolean
}) {
  const tokens = tokenize(source)
  // Als de hele string uit exact één math-token bestaat en blockDisplay is
  // aangevraagd, render die display-mode.
  return (
    <span className={className}>
      {tokens.map((t, idx) =>
        t.type === 'text' ? (
          <span key={idx}>{t.value}</span>
        ) : (
          <Math
            key={idx}
            tex={t.value}
            displayMode={blockDisplay || t.display}
          />
        ),
      )}
    </span>
  )
}
