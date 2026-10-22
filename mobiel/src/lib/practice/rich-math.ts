/**
 * Tokeniseert tekst met `$...$` (inline) en `$$...$$` (display) stukken als
 * losse KaTeX-fragmenten — de opgave- en stappenplan-tekst slaat de
 * database op als gewone string met zulke LaTeX-delimiters erin.
 *
 * Letterlijke kopie van de tokenizer in `src/components/math.tsx` op de
 * site (zie `mobiel/src/lib/practice/input.ts` voor waarom dat hier als
 * kopie staat, niet als import).
 */
export type MathToken =
  | { type: 'text'; value: string }
  | { type: 'math'; value: string; display: boolean }

export function tokenizeRichMath(raw: string): MathToken[] {
  const tokens: MathToken[] = []
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
