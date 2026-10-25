/**
 * Hulpfuncties rond de antwoord-input.
 *
 * Letterlijke kopie van `src/lib/practice/input.ts` in de hoofdmap (de
 * site): pure functies zonder DOM- of Node-afhankelijkheden, dus zonder
 * risico om hier opnieuw te schrijven. Blijft de site-versie, dan blijft
 * deze ook bijwerken — zie `mobiel/AGENTS.md`/README voor waarom de app geen
 * code uit `src/` kan importeren (eigen `package.json`, eigen build).
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
  s = s.replace(/\^\(\s*([^()]+?)\s*\)/g, '^{$1}')
  // a^token — losse exponent zonder haakjes (1 of meer cijfers/letters of -
  //  gevolgd door cijfers/letters)
  s = s.replace(/\^(-?[A-Za-z0-9]+)/g, '^{$1}')

  // Onaffe machten: laat een placeholder-vakje zien zodat de preview niet
  // breekt terwijl je nog typt.
  //   x^()      → x^{□}
  //   x^(-1     → x^{-1□}   (haakje nog niet gesloten)
  //   x^        → x^{□}
  s = s.replace(/\^\(\s*\)/g, '^{\\square}')
  s = s.replace(/\^\(\s*([^()]*)$/g, '^{$1\\square}')
  s = s.replace(/\^(?=$|[^{])/g, '^{\\square}')

  // (num)/(den) → \dfrac{...}{...} — lege groepen krijgen een placeholder-
  // vakje zodat je bij het typen alvast de breukvorm ziet
  s = s.replace(/\(([^()]*)\)\s*\/\s*\(([^()]*)\)/g, (_m, a: string, b: string) =>
    `\\dfrac{${a.trim() || '\\square'}}{${b.trim() || '\\square'}}`,
  )
  // num/den met simpele tokens
  s = s.replace(
    /(^|[\s(+\-*/=,])(-?[A-Za-z0-9.]+)\s*\/\s*(-?[A-Za-z0-9.]+)(?=$|[\s)+\-*/=,])/g,
    '$1\\dfrac{$2}{$3}',
  )

  // pi → \pi. Een cijfer ervoor (`2pi`) is geen woordgrens, dus die
  // telt niet als begin van het woord.
  s = s.replace(/(?<![A-Za-z])pi\b/g, '\\pi')

  // * en · naar \cdot
  s = s.replace(/\*|·/g, '\\cdot ')

  return s
}

/**
 * Zoekt `name(...)` en vervangt door replacement(inhoud-tussen-haakjes).
 * Ondersteunt geneste haakjes, ook een geneste aanroep van dezelfde functie
 * (bv. `sqrt(sqrt(x))`) — de inhoud wordt eerst zelf verwerkt voordat hij in
 * de replacement gaat.
 */
function replaceFunctionCall(
  input: string,
  name: string,
  replacement: (inner: string) => string,
): string {
  const re = new RegExp(`\\b${name}\\(`)

  let out = ''
  let i = 0
  while (i < input.length) {
    const match = re.exec(input.slice(i))
    if (!match) {
      out += input.slice(i)
      break
    }
    const idx = i + match.index
    out += input.slice(i, idx)
    let j = idx + match[0].length
    const start = j
    let depth = 1
    while (j < input.length && depth > 0) {
      const ch = input[j]
      if (ch === '(') depth++
      else if (ch === ')') {
        depth--
        if (depth === 0) break
      }
      j++
    }
    const inner = input.slice(start, j)
    out += replacement(replaceFunctionCall(inner, name, replacement))
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
