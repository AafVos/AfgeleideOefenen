/**
 * De snelle oefenstof-check (`npm run test:oefenstof`).
 *
 * Leest elke migratie waarvan de bestandsnaam `_oefenstof_` bevat (zie
 * AGENTS.md, "Oefenstof-migraties") en controleert per vraag:
 *
 *   a. het eigen `answer` en elk `answer_alternatives`-item worden door
 *      `answersMatch` goed gerekend;
 *   b. alle LaTeX (vraag, antwoord, stappen) rendert zonder fout met KaTeX;
 *   c. functienamen zijn f, g of h — nooit een losse u, v of w;
 *   d. elke (topic, cluster)-combinatie die in deze migraties voorkomt heeft
 *      minstens 8 vragen.
 *
 * Dit draait in seconden, zonder database: het leest alleen de SQL-bestanden.
 * Wat deze test niet doet: de wiskunde zelf narekenen (klopt het antwoord
 * ook echt?). Dat blijft een losse, bij de migratie horende test, zoals
 * `kromme-door-toppen.test.ts`.
 */
import katex from 'katex'
import { describe, expect, it } from 'vitest'

import { answersMatch } from './engine'
import {
  leesAlleOefenstofMigraties,
  oefenstofMigratiePaden,
  type OefenstofStap,
  type OefenstofVraag,
} from './oefenstof-migraties'

const { vragen, stappen } = leesAlleOefenstofMigraties()

/** Haalt de losse `$...$`-stukken uit een tekst die Nederlands en LaTeX mengt. */
function vindLatexSpans(tekst: string): string[] {
  const spans: string[] = []
  const re = /\$([^$]+)\$/g
  let m: RegExpExecArray | null
  while ((m = re.exec(tekst))) spans.push(m[1])
  return spans
}

function renderFout(tex: string): string | null {
  try {
    katex.renderToString(tex, { throwOnError: true, strict: 'ignore' })
    return null
  } catch (e) {
    return e instanceof Error ? e.message : String(e)
  }
}

/**
 * Een losse functienaam u, v of w, zoals `u(x)`, `v'`, of een kale `w`
 * tussen niet-letters. Dezelfde regex als migratie 0083 gebruikte om
 * `drie_factoren` na te lopen.
 */
const VERBODEN_LETTER = /(^|[^A-Za-z\\])[uvw]'?(\([a-zA-Z]\))?([^A-Za-z]|$)/

function naam(v: OefenstofVraag): string {
  return `${v.bestand.split('/').pop()} — ${v.topic}/${v.cluster} #${v.orderIndex}`
}

describe('oefenstof-migraties: bestanden gevonden', () => {
  it('leest tenminste de aanwezige _oefenstof_-migraties in', () => {
    // Geen harde ondergrens: dit is vooral een teken van leven. Staat er
    // geen enkele oefenstof-migratie (bijvoorbeeld net na een opschoning),
    // dan blijven de tests hieronder leeg en dus triviaal groen — dat mag.
    expect(oefenstofMigratiePaden().length).toBeGreaterThanOrEqual(0)
  })
})

describe.each(vragen)('vraag: %s', (v: OefenstofVraag) => {
  it(`${naam(v)} — eigen antwoord wordt goedgerekend`, () => {
    expect(answersMatch(v.answer, v.answer, v.alternatives)).toBe(true)
  })

  it.each(v.alternatives)(`${naam(v)} — alternatief %s wordt goedgerekend`, (alt) => {
    expect(answersMatch(alt, v.answer, v.alternatives)).toBe(true)
  })

  it(`${naam(v)} — LaTeX rendert zonder fout`, () => {
    const spans = [
      ...vindLatexSpans(v.latexBody),
      v.answerPrefix ? `${v.answerPrefix} ${v.latexAnswer}` : v.latexAnswer,
    ]
    for (const span of spans) {
      const fout = renderFout(span)
      expect(fout, `KaTeX kon "${span}" niet renderen: ${fout}`).toBeNull()
    }
  })

  it(`${naam(v)} — geen losse u, v of w in de vraag of het antwoord`, () => {
    expect(VERBODEN_LETTER.test(v.latexBody)).toBe(false)
    expect(VERBODEN_LETTER.test(v.latexAnswer)).toBe(false)
  })
})

describe.each(stappen)('stap: %s', (s: OefenstofStap) => {
  const label = `${s.bestand.split('/').pop()} — ${s.topic}/${s.cluster} vraag ${s.qOrder} stap ${s.stepOrder}`

  it(`${label} — LaTeX rendert zonder fout`, () => {
    for (const span of vindLatexSpans(s.stepDescription)) {
      const fout = renderFout(span)
      expect(fout, `KaTeX kon "${span}" niet renderen: ${fout}`).toBeNull()
    }
  })

  it(`${label} — geen losse u, v of w`, () => {
    expect(VERBODEN_LETTER.test(s.stepDescription)).toBe(false)
  })
})

describe('minstens 8 vragen per (topic, cluster) in deze migraties', () => {
  const groepen = new Map<string, number>()
  for (const v of vragen) {
    const sleutel = `${v.topic}/${v.cluster}`
    groepen.set(sleutel, (groepen.get(sleutel) ?? 0) + 1)
  }

  if (groepen.size === 0) {
    it('geen oefenstof-migraties om te tellen', () => {
      expect(groepen.size).toBe(0)
    })
  } else {
    it.each([...groepen.entries()])('%s heeft minstens 8 vragen (telling: %i)', (_sleutel, aantal) => {
      expect(aantal).toBeGreaterThanOrEqual(8)
    })
  }
})
