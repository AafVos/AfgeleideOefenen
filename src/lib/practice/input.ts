/**
 * Hulpfuncties rond de antwoord-input.
 */

/**
 * Converteer de getypte notatie (bv. `12x^2` of `(1/2)x^(-1/2)`) naar LaTeX
 * zodat we een live-preview kunnen tonen. Dit is een ruwe converter — hoeft
 * niet alle gevallen perfect te vangen, alleen de dagelijkse wiskundige input.
 *
 * Regels:
 *   a^b           → a^{b}
 *   a^(…)         → a^{…}
 *   sqrt(…)       → \sqrt{…}
 *   (a)/(b)       → \dfrac{a}{b}
 *   a/b           → \dfrac{a}{b}   (alleen als a en b simpele tokens zijn)
 *   *  , ·         → \cdot
 *   pi            → \pi
 */
export function toLatexPreview(raw: string): string {
  if (!raw.trim()) return ''
  let s = raw

  // sqrt(...) en √ notatie
  s = replaceFunctionCall(s, 'sqrt', (inner) => `\\sqrt{${inner}}`)
  s = s.replace(/√\(([^()]*)\)/g, '\\sqrt{$1}')
  s = s.replace(/√([A-Za-z0-9]+)/g, '\\sqrt{$1}')

  // a^(...) — pakt groepen tussen haakjes, ook met negatief teken en /
  s = s.replace(/\^\(\s*([^()]*?)\s*\)/g, '^{$1}')
  // a^token — losse exponent zonder haakjes (1 of meer cijfers/letters of -
  //  gevolgd door cijfers/letters)
  s = s.replace(/\^(-?[A-Za-z0-9]+)/g, '^{$1}')

  // (num)/(den) → \dfrac{...}{...}
  s = s.replace(/\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g, '\\dfrac{$1}{$2}')
  // num/den met simpele tokens
  s = s.replace(
    /(^|[\s(+\-*/=,])(-?[A-Za-z0-9.]+)\s*\/\s*(-?[A-Za-z0-9.]+)(?=$|[\s)+\-*/=,])/g,
    '$1\\dfrac{$2}{$3}',
  )

  // pi → \pi
  s = s.replace(/\bpi\b/g, '\\pi')

  // * en · naar \cdot
  s = s.replace(/\*|·/g, '\\cdot ')

  return s
}

/**
 * Zoekt `name(...)` en vervangt door replacement(inhoud-tussen-haakjes).
 * Ondersteunt 1 niveau genest haakje-paren.
 */
function replaceFunctionCall(
  input: string,
  name: string,
  replacement: (inner: string) => string,
): string {
  const marker = `\u0000${name}(`
  // Escape regex special chars in name (we weten dat het alfabetisch is, dus ok).
  const re = new RegExp(`\\b${name}\\(`, 'g')
  const pre = input.replace(re, marker)

  let out = ''
  let i = 0
  while (i < pre.length) {
    const idx = pre.indexOf(marker, i)
    if (idx === -1) {
      out += pre.slice(i)
      break
    }
    out += pre.slice(i, idx)
    let j = idx + marker.length
    let depth = 1
    let inner = ''
    while (j < pre.length && depth > 0) {
      const ch = pre[j]
      if (ch === '(') depth++
      else if (ch === ')') {
        depth--
        if (depth === 0) break
      }
      inner += ch
      j++
    }
    out += replacement(inner)
    i = j + 1
  }
  return out
}

/**
 * Hulp voor het math-toetsenbord: voeg een tekst in op de huidige cursor-
 * positie van een input, en geef de nieuwe waarde + cursor-positie terug.
 */
export function insertAtCursor(
  current: string,
  selectionStart: number,
  selectionEnd: number,
  insert: string,
): { value: string; caret: number } {
  const before = current.slice(0, selectionStart)
  const after = current.slice(selectionEnd)
  const caretMarker = insert.indexOf('|')
  if (caretMarker >= 0) {
    const clean = insert.slice(0, caretMarker) + insert.slice(caretMarker + 1)
    return {
      value: before + clean + after,
      caret: before.length + caretMarker,
    }
  }
  return {
    value: before + insert + after,
    caret: before.length + insert.length,
  }
}
