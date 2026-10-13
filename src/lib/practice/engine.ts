import type { ProgressStatus } from '@/lib/supabase/types'

export const MASTERY_THRESHOLD = 3

// =====================================================================
// Normalisatie (sectie 5.3)
// =====================================================================
/**
 * Eenheid achter een getal, zoals `2 seconden` of `2 meter`.
 * Langste vorm eerst, anders blijft van `seconden` een losse `n` over.
 * Alleen als er een cijfer direct voor staat, zodat `2x` geen eenheid verliest.
 */
const EENHEID_ACHTER_GETAL =
  /(\d)(?:seconden|seconde|minuten|minuut|centimeters|centimeter|kilometers|kilometer|millimeters|millimeter|meters|meter|uren|uur|graden|procent|liters|liter)\.?$/

export function normalizeAnswer(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/\*/g, '')
    .replace(/·/g, '')
    // ^(5), ^(-1), ^(x) → ^5, ^-1, ^x — alleen simpele exponenten, zodat
    // bv. e^(x+1) niet gelijk wordt aan e^x+1
    .replace(/\^\((-?\d+|-?[a-z])\)/g, '^$1')
    .replace(/x\^1\b/g, 'x')
    .replace(/\+-/g, '-')
    .replace(/−/g, '-')
    .replace(/\u2212/g, '-')
    // Verhaaltje of lijn: de leerling typt soms het voorvoegsel of de eenheid mee.
    // Het opgeslagen antwoord blijft het kale getal of de kale uitdrukking.
    // 0,33 blijft 0,33. Een andere termvolgorde van een lijn staat hieronder.
    .replace(/^[txhy]=/, '')
    .replace(EENHEID_ACHTER_GETAL, '$1')
}

/**
 * Een breuk als kleinste gehele teller en noemer, noemer altijd positief.
 * Komt de som buiten de veilige gehele getallen, dan is de breuk onbruikbaar.
 */
type Breuk = { n: number; d: number }

function ggd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) {
    const rest = x % y
    x = y
    y = rest
  }
  return x || 1
}

function breuk(n: number, d = 1): Breuk | null {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d) || d === 0) return null
  if (d < 0) {
    n = -n
    d = -d
  }
  const deler = ggd(n, d)
  return { n: n / deler, d: d / deler }
}

function telBreuk(a: Breuk, b: Breuk): Breuk | null {
  return breuk(a.n * b.d + b.n * a.d, a.d * b.d)
}

function keerBreuk(a: Breuk, k: number): Breuk | null {
  return breuk(a.n * k, a.d)
}

function breukSleutel(a: Breuk): string {
  return a.d === 1 ? String(a.n) : `${a.n}/${a.d}`
}

const NUL: Breuk = { n: 0, d: 1 }

/** Een positief getal: geheel, komma of een breuk a/b. Geen afronding. */
function leesGetal(s: string): Breuk | null {
  if (s.length > 24) return null
  const alsBreuk = /^(\d+)\/(\d+)$/.exec(s)
  if (alsBreuk) {
    if (alsBreuk[1].length > 12 || alsBreuk[2].length > 12) return null
    return breuk(Number(alsBreuk[1]), Number(alsBreuk[2]))
  }
  const decimaal = /^(\d+)(?:[.,](\d+))?$/.exec(s)
  if (!decimaal || decimaal[1].length > 12) return null
  if (!decimaal[2]) return breuk(Number(decimaal[1]))
  if (decimaal[2].length > 6) return null
  const schaal = 10 ** decimaal[2].length
  return breuk(Number(decimaal[1]) * schaal + Number(decimaal[2]), schaal)
}

type Lijnstuk = { soort: 'x' | 'c' | 'pi'; waarde: Breuk }

function stuk(soort: Lijnstuk['soort'], waarde: Breuk | null): Lijnstuk | null {
  return waarde ? { soort, waarde } : null
}

/** `(+2)` en `(-2,5)` : het teken hoort bij het getal, niet bij de term ernaast. */
function metTeken(ruw: string): Breuk | null {
  const negatief = ruw.startsWith('-')
  const waarde = leesGetal(ruw.replace(/^[+-]/, ''))
  return waarde ? keerBreuk(waarde, negatief ? -1 : 1) : null
}

/**
 * Eén term van een lijn: `2x`, `x/3`, `1/2`, `pi`, `(1)/(2)x`.
 * `5/2x` slaan we over: de site toont dat als een breuk met `2x` onder de streep.
 */
function leesTerm(body: string): Lijnstuk | null {
  if (body === 'x') return { soort: 'x', waarde: { n: 1, d: 1 } }
  if (body === 'pi') return { soort: 'pi', waarde: { n: 1, d: 1 } }
  if (/^\d+\/\d+x$/.test(body)) return null

  const haakjesX = /^\((\d+)\)\/\((\d+)\)x$|^\((\d+)\/(\d+)\)x$/.exec(body)
  if (haakjesX) {
    return stuk('x', breuk(Number(haakjesX[1] ?? haakjesX[3]), Number(haakjesX[2] ?? haakjesX[4])))
  }
  const haakjesGetalX = /^\(([+-]?\d+(?:[.,]\d+)?)\)x$/.exec(body)
  if (haakjesGetalX) return stuk('x', metTeken(haakjesGetalX[1]))

  const xDoor = /^(?:(\d+(?:[.,]\d+)?)x|x\/(\d+)|(\d+)x\/(\d+))$/.exec(body)
  if (xDoor) {
    const waarde = xDoor[1]
      ? leesGetal(xDoor[1])
      : xDoor[2]
        ? breuk(1, Number(xDoor[2]))
        : breuk(Number(xDoor[3]), Number(xDoor[4]))
    return stuk('x', waarde)
  }

  const piDoor = /^(?:(\d+(?:[.,]\d+)?)pi|pi\/(\d+)|(\d+)pi\/(\d+))$/.exec(body)
  if (piDoor) {
    const waarde = piDoor[1]
      ? leesGetal(piDoor[1])
      : piDoor[2]
        ? breuk(1, Number(piDoor[2]))
        : breuk(Number(piDoor[3]), Number(piDoor[4]))
    return stuk('pi', waarde)
  }

  const haakjesBreuk = /^\((\d+)\)\/\((\d+)\)$|^\((\d+)\/(\d+)\)$/.exec(body)
  if (haakjesBreuk) {
    return stuk(
      'c',
      breuk(Number(haakjesBreuk[1] ?? haakjesBreuk[3]), Number(haakjesBreuk[2] ?? haakjesBreuk[4])),
    )
  }
  const haakjesGetal = /^\(([+-]?\d+(?:[.,]\d+)?)\)$/.exec(body)
  if (haakjesGetal) return stuk('c', metTeken(haakjesGetal[1]))

  return stuk('c', leesGetal(body))
}

function haalBuitensteHaakjesWeg(s: string): string {
  let huidig = s
  for (let keer = 0; keer < 3; keer++) {
    if (huidig.length < 2 || huidig[0] !== '(' || huidig[huidig.length - 1] !== ')') break
    let diepte = 0
    let sluitOpHetEind = true
    for (let i = 0; i < huidig.length; i++) {
      if (huidig[i] === '(') diepte++
      else if (huidig[i] === ')') diepte--
      if (diepte === 0 && i < huidig.length - 1) {
        sluitOpHetEind = false
        break
      }
    }
    if (!sluitOpHetEind || diepte !== 0) break
    huidig = huidig.slice(1, -1)
  }
  return huidig
}

/**
 * Sleutel van een rechte lijn ax + b + c·π.
 * Zelfde lijn, andere schrijfwijze (`2x - 1` en `-1 + 2x`) krijgt dezelfde
 * sleutel. Geen lijn (een macht, een andere letter, haakjes die nog iets
 * vermenigvuldigen) geeft null: dan blijft de gewone tekstvergelijking.
 */
function lijnSleutel(genormaliseerd: string): string | null {
  const s = haalBuitensteHaakjesWeg(genormaliseerd.replace(/\\pi/g, 'pi'))
  // Een macht of een tweede =-teken is geen kale lijn. Haakjes mogen nog,
  // maar alleen om een factor zoals (1)/(2)x; andere haakjes leest leesTerm niet.
  if (/[\^=]/.test(s) || s === '') return null

  const termen: Array<{ teken: 1 | -1; body: string }> = []
  let i = 0
  let teken: 1 | -1 = 1
  if (s[0] === '+') i = 1
  else if (s[0] === '-') {
    teken = -1
    i = 1
  }
  if (i >= s.length) return null
  while (i < s.length) {
    let j = i
    let diepte = 0
    while (j < s.length) {
      const tekenNu = s[j]
      if (tekenNu === '(') diepte++
      else if (tekenNu === ')') diepte--
      if (diepte < 0) return null
      if (diepte === 0 && (tekenNu === '+' || tekenNu === '-')) break
      j++
    }
    const body = s.slice(i, j)
    if (!body) return null
    termen.push({ teken, body })
    if (j >= s.length) break
    teken = s[j] === '-' ? -1 : 1
    i = j + 1
    if (i >= s.length) return null
  }

  let x = NUL
  let constant = NUL
  let pi = NUL
  let zagX = false
  for (const term of termen) {
    const gelezen = leesTerm(term.body)
    if (!gelezen) return null
    const deel = keerBreuk(gelezen.waarde, term.teken)
    if (!deel) return null
    if (gelezen.soort === 'x') {
      zagX = true
      const som = telBreuk(x, deel)
      if (!som) return null
      x = som
    } else if (gelezen.soort === 'pi') {
      const som = telBreuk(pi, deel)
      if (!som) return null
      pi = som
    } else {
      const som = telBreuk(constant, deel)
      if (!som) return null
      constant = som
    }
  }
  if (!zagX) return null
  return `x=${breukSleutel(x)};pi=${breukSleutel(pi)};c=${breukSleutel(constant)}`
}

function zelfdeLijn(a: string, b: string): boolean {
  const links = lijnSleutel(a)
  return links !== null && links === lijnSleutel(b)
}

export function answersMatch(
  student: string,
  correct: string,
  alternatives: string[] = [],
): boolean {
  const norm = normalizeAnswer(student)
  const goed = normalizeAnswer(correct)
  if (norm === goed || zelfdeLijn(norm, goed)) return true
  return alternatives.some((alt) => {
    const andere = normalizeAnswer(alt)
    return norm === andere || zelfdeLijn(norm, andere)
  })
}

// =====================================================================
// Voortgangsregel bij een goed antwoord
// =====================================================================
type ProgressAfterCorrect = {
  correct_streak: number
  status: ProgressStatus
  mastered: boolean
}

/**
 * Bij een goed antwoord gaat de reeks één omhoog; een cluster is beheerst
 * zodra de reeks MASTERY_THRESHOLD haalt (drie goed achter elkaar). Een
 * cluster dat al beheerst is, blijft dat.
 */
export function progressAfterCorrect(
  currentStreak: number,
): ProgressAfterCorrect {
  const correct_streak = currentStreak + 1
  const mastered = correct_streak >= MASTERY_THRESHOLD
  return {
    correct_streak,
    status: mastered ? 'mastered' : 'in_progress',
    mastered,
  }
}

// =====================================================================
// Voortgangsregel bij een fout antwoord
// =====================================================================
type ProgressAfterIncorrect = {
  correct_streak: number
  status: ProgressStatus
}

/**
 * Bij een fout antwoord gaat de reeks meteen terug naar 0: de leerling moet
 * opnieuw MASTERY_THRESHOLD keer goed achter elkaar halen. Een cluster dat al
 * beheerst is, houdt zijn reeks én zijn status — één misser tijdens het
 * herhalen mag "beheerst" niet afpakken.
 *
 * "Meteen" betekent: op het moment dat het antwoord echt fout blijkt, dus ná
 * de AI-controle.
 */
export function progressAfterIncorrect(
  currentStatus: ProgressStatus,
  currentStreak: number,
): ProgressAfterIncorrect {
  if (currentStatus === 'mastered') {
    return { correct_streak: currentStreak, status: 'mastered' }
  }
  return { correct_streak: 0, status: 'in_progress' }
}

// =====================================================================
// Tijd per opgave
// =====================================================================

/**
 * Langer dan een uur op één opgave is geen denkwerk meer, maar een tabblad
 * dat open bleef staan. Alles daarboven wordt hierop afgekapt.
 */
export const MAX_TIME_SPENT_SEC = 60 * 60

/**
 * De tijd die de browser meestuurt, klaargemaakt voor de database: hele
 * seconden, nooit negatief, nooit langer dan een uur. Niets, NaN of oneindig
 * wordt leeg — liever geen meting dan een verzonnen meting.
 */
export function cleanTimeSpentSec(raw: number | null | undefined): number | null {
  if (raw == null || !Number.isFinite(raw)) return null
  return Math.min(Math.max(Math.round(raw), 0), MAX_TIME_SPENT_SEC)
}
