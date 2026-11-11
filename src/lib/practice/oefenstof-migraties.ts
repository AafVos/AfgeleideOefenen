/**
 * Leest oefenstof-migraties (bestandsnaam bevat `_oefenstof_`) en zet de
 * SQL-tuples om naar gewone JS-waarden, zodat `oefenstof.test.ts` elke vraag
 * en stap kan controleren zonder een draaiende database.
 *
 * Verwacht de vaste vorm die in AGENTS.md staat: een `INSERT INTO
 * public.questions_new ... FROM (VALUES (...), (...)) AS v(kolomnamen)` en
 * optioneel een `INSERT INTO public.question_steps_new ...` met dezelfde
 * vorm. Een migratie die alleen rijen weghaalt (`DELETE FROM`, zoals bij het
 * opruimen van een oude set) levert gewoon nul vragen op.
 */
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

export const MIGRATIES_MAP = path.join(process.cwd(), 'supabase/migrations')

export function oefenstofMigratiePaden(map: string = MIGRATIES_MAP): string[] {
  return readdirSync(map)
    .filter((bestand) => /_oefenstof_.*\.sql$/.test(bestand))
    .sort()
    .map((bestand) => path.join(map, bestand))
}

export type OefenstofVraag = {
  bestand: string
  topic: string
  cluster: string
  orderIndex: number
  difficulty: number | null
  latexBody: string
  answer: string
  latexAnswer: string
  answerPrefix: string | null
  alternatives: string[]
}

export type OefenstofStap = {
  bestand: string
  topic: string
  cluster: string
  qOrder: number
  stepOrder: number
  stepDescription: string
}

/**
 * Loopt door `s` en geeft de inhoud van elke top-level `(...)`-groep terug.
 * Houdt rekening met dollar-quotes (`$tag$...$tag$`): haakjes daarbinnen
 * (bijvoorbeeld in `$vraag$Bereken f(x)...$vraag$`) tellen niet mee.
 */
function vindTopLevelGroepen(s: string): string[] {
  const groepen: string[] = []
  let i = 0
  while (i < s.length) {
    if (s[i] === '$') {
      const na = leesDollarQuote(s, i)
      if (na !== null) {
        i = na
        continue
      }
    }
    if (s[i] === '(') {
      let diepte = 1
      let j = i + 1
      while (j < s.length && diepte > 0) {
        if (s[j] === '$') {
          const na = leesDollarQuote(s, j)
          if (na !== null) {
            j = na
            continue
          }
        }
        if (s[j] === '(') diepte++
        else if (s[j] === ')') diepte--
        j++
      }
      groepen.push(s.slice(i + 1, j - 1))
      i = j
      continue
    }
    i++
  }
  return groepen
}

/** Staat er op positie `i` een dollar-quote? Zo ja: index net na het einde. Anders: null. */
function leesDollarQuote(s: string, i: number): number | null {
  const m = /^\$([a-zA-Z_][a-zA-Z0-9_]*)\$/.exec(s.slice(i))
  if (!m) return null
  const sluit = `$${m[1]}$`
  const eind = s.indexOf(sluit, i + m[0].length)
  if (eind === -1) throw new Error(`Ongesloten dollar-quote $${m[1]}$`)
  return eind + sluit.length
}

/** Splitst de inhoud van één tuple in zijn velden, op komma's op diepte 0. */
function splitsVelden(tupleInhoud: string): string[] {
  const velden: string[] = []
  let huidig = ''
  let diepte = 0
  let inString = false
  let i = 0
  while (i < tupleInhoud.length) {
    const ch = tupleInhoud[i]
    if (!inString && ch === '$') {
      const m = /^\$([a-zA-Z_][a-zA-Z0-9_]*)\$/.exec(tupleInhoud.slice(i))
      if (m) {
        const sluit = `$${m[1]}$`
        const eind = tupleInhoud.indexOf(sluit, i + m[0].length)
        if (eind === -1) throw new Error(`Ongesloten dollar-quote $${m[1]}$`)
        const einde = eind + sluit.length
        huidig += tupleInhoud.slice(i, einde)
        i = einde
        continue
      }
    }
    if (ch === "'") {
      // Een `''` binnen een string is een ontsnapte aanhalingsteken, geen
      // einde. Buiten een string begint hier een nieuwe.
      if (inString && tupleInhoud[i + 1] === "'") {
        huidig += "''"
        i += 2
        continue
      }
      inString = !inString
      huidig += ch
      i++
      continue
    }
    if (!inString) {
      if (ch === '(' || ch === '[') diepte++
      if (ch === ')' || ch === ']') diepte--
      if (ch === ',' && diepte === 0) {
        velden.push(huidig.trim())
        huidig = ''
        i++
        continue
      }
    }
    huidig += ch
    i++
  }
  if (huidig.trim() !== '') velden.push(huidig.trim())
  return velden
}

type SqlWaarde = string | number | null | string[]

/** Zet één SQL-veld (zoals teruggegeven door `splitsVelden`) om naar een JS-waarde. */
function parseWaarde(ruw: string): SqlWaarde {
  const dollar = /^\$([a-zA-Z_][a-zA-Z0-9_]*)\$([\s\S]*)\$\1\$$/.exec(ruw)
  if (dollar) return dollar[2]

  if (/^null$/i.test(ruw)) return null

  if (/^-?\d+(\.\d+)?$/.test(ruw)) return Number(ruw)

  const zonderTypecast = ruw.replace(/::text\[\]$/, '')
  const array = /^ARRAY\[([\s\S]*)\]$/.exec(zonderTypecast)
  if (array) {
    const inhoud = array[1].trim()
    if (inhoud === '') return []
    return splitsVelden(inhoud).map((veld) => parseWaarde(veld) as string)
  }

  const string = /^'([\s\S]*)'$/.exec(ruw)
  if (string) return string[1].replace(/''/g, "'")

  // Onbekende vorm (bijv. een expressie): geef de ruwe tekst terug, zodat de
  // test erop kan struikelen in plaats van iets stilletjes verkeerd te lezen.
  return ruw
}

function zoekEersteSlug(veld: string, tekst: string): string {
  const m = new RegExp(`${veld}\\.slug\\s*=\\s*'([^']+)'`).exec(tekst)
  if (!m) throw new Error(`Geen ${veld}.slug gevonden in migratie-context`)
  return m[1]
}

/** Verzamelt uit één `VALUES (...), (...)` blok de tuples, gekoppeld aan hun kolomnamen. */
function leesValuesBlok(
  valuesInhoud: string,
  kolomnamen: string[],
): Record<string, SqlWaarde>[] {
  return vindTopLevelGroepen(valuesInhoud).map((tupleInhoud) => {
    const velden = splitsVelden(tupleInhoud)
    if (velden.length !== kolomnamen.length) {
      throw new Error(
        `Tuple heeft ${velden.length} velden, kolomnamen zijn er ${kolomnamen.length}: ${kolomnamen.join(', ')}`,
      )
    }
    const rij: Record<string, SqlWaarde> = {}
    kolomnamen.forEach((naam, idx) => {
      rij[naam] = parseWaarde(velden[idx])
    })
    return rij
  })
}

const QUESTIONS_BLOK =
  /INSERT INTO public\.questions_new[\s\S]*?FROM \(VALUES([\s\S]*?)\)\s*AS v\(([^)]*)\)([\s\S]*?)(?=\nINSERT INTO|\nDO \$|\nCOMMIT;|$)/g

const STEPS_BLOK =
  /INSERT INTO public\.question_steps_new[\s\S]*?FROM \(VALUES([\s\S]*?)\)\s*AS v\(([^)]*)\)([\s\S]*?)(?=\nINSERT INTO|\nDO \$|\nCOMMIT;|$)/g

export function parseOefenstofMigratie(bestand: string): {
  vragen: OefenstofVraag[]
  stappen: OefenstofStap[]
} {
  const sql = readFileSync(bestand, 'utf8')
  const vragen: OefenstofVraag[] = []
  const stappen: OefenstofStap[] = []

  for (const match of sql.matchAll(QUESTIONS_BLOK)) {
    const [, valuesInhoud, kolomnamenRaw, context] = match
    const kolomnamen = kolomnamenRaw.split(',').map((k) => k.trim())
    const topic = zoekEersteSlug('t', context)
    const cluster = zoekEersteSlug('c', context)
    for (const rij of leesValuesBlok(valuesInhoud, kolomnamen)) {
      const latexAnswer = rij.latex_answer ?? rij.answer
      vragen.push({
        bestand,
        topic,
        cluster,
        orderIndex: Number(rij.order_index),
        difficulty: typeof rij.difficulty === 'number' ? rij.difficulty : null,
        latexBody: String(rij.latex_body),
        answer: String(rij.answer),
        latexAnswer: String(latexAnswer),
        answerPrefix: (rij.answer_prefix as string | null) ?? null,
        alternatives: Array.isArray(rij.alternatives) ? rij.alternatives : [],
      })
    }
  }

  for (const match of sql.matchAll(STEPS_BLOK)) {
    const [, valuesInhoud, kolomnamenRaw, context] = match
    const kolomnamen = kolomnamenRaw.split(',').map((k) => k.trim())
    const topic = zoekEersteSlug('t', context)
    const cluster = zoekEersteSlug('c', context)
    for (const rij of leesValuesBlok(valuesInhoud, kolomnamen)) {
      stappen.push({
        bestand,
        topic,
        cluster,
        qOrder: Number(rij.q_order),
        stepOrder: Number(rij.step_order),
        stepDescription: String(rij.step_description),
      })
    }
  }

  return { vragen, stappen }
}

export function leesAlleOefenstofMigraties(map: string = MIGRATIES_MAP): {
  vragen: OefenstofVraag[]
  stappen: OefenstofStap[]
} {
  const vragen: OefenstofVraag[] = []
  const stappen: OefenstofStap[] = []
  for (const bestand of oefenstofMigratiePaden(map)) {
    const gelezen = parseOefenstofMigratie(bestand)
    vragen.push(...gelezen.vragen)
    stappen.push(...gelezen.stappen)
  }
  return { vragen, stappen }
}
