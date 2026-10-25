import { answersMatch } from './engine'

/** Hoogstens zoveel sommen in één proef, zonder account. */
export const PROEF_AANTAL = 3

const SLUG = /^[a-z0-9_-]{1,80}$/

export type ProefSelectie = {
  chapter: string
  topic: string | null
  cluster: string | null
}

export type ProefKandidaat = {
  id: string
  difficulty: number
  order_index: number | null
}

export type ProefUitspraak = 'goed' | 'fout' | 'overgeslagen' | 'leeg'

/**
 * Zelfde zoekwoorden als de oefenlink (`chapter`, `topic`, `cluster`),
 * zonder `van=`. Een rare tekst wordt geweigerd.
 */
export function leesProefSelectie(input: {
  chapter?: string | null
  topic?: string | null
  cluster?: string | null
}): ProefSelectie | null {
  const chapter = schoon(input.chapter)
  if (!chapter || !SLUG.test(chapter)) return null
  const topic = schoon(input.topic)
  const cluster = schoon(input.cluster)
  if (topic && !SLUG.test(topic)) return null
  if (cluster && !SLUG.test(cluster)) return null
  return { chapter, topic, cluster }
}

/**
 * Van een oefenlink naar de proefroute. `van=` blijft staan: dat is geen
 * volgcookie maar de bronmeting (bijvoorbeeld een voorbeeldpagina), en
 * `src/lib/meten/gebeurtenis.ts` leest die juist uit de adresbalk.
 */
export function proberenVanOefenen(oefenen: string): string {
  const vraag = oefenen.includes('?') ? oefenen.slice(oefenen.indexOf('?') + 1) : ''
  const params = new URLSearchParams(vraag)
  const tekst = params.toString()
  return tekst ? `/proberen?${tekst}` : '/proberen'
}

/**
 * Van de proef terug naar de bijbehorende oefenpagina, zodat een leerling na
 * het aanmelden met Google verdergaat met dezelfde soort som.
 */
export function oefenenVanProberen(selectie: ProefSelectie): string {
  const params = new URLSearchParams({ chapter: selectie.chapter })
  if (selectie.topic) params.set('topic', selectie.topic)
  if (selectie.cluster) params.set('cluster', selectie.cluster)
  return `/oefenen?${params.toString()}`
}

/**
 * De drie makkelijkste sommen, stabiel gesorteerd. Zo krijgt iedereen
 * dezelfde proef bij dezelfde soort, ook na een herlaadactie.
 */
export function kiesDrieProefopgaven<T extends ProefKandidaat>(rijen: readonly T[]): T[] {
  return [...rijen]
    .sort((a, b) => {
      if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty
      const ao = a.order_index ?? 9999
      const bo = b.order_index ?? 9999
      if (ao !== bo) return ao - bo
      if (a.id < b.id) return -1
      if (a.id > b.id) return 1
      return 0
    })
    .slice(0, PROEF_AANTAL)
}

/**
 * Nakijken zonder AI: alleen het vaste antwoord en de alternatieven.
 * `opvragen` is "Ik weet het niet": dan tonen we de uitwerking meteen.
 */
export function uitspraakProef(
  antwoord: string,
  goed: string,
  alternatieven: readonly string[],
  opvragen: boolean,
): ProefUitspraak {
  if (opvragen) return 'overgeslagen'
  if (!antwoord.trim()) return 'leeg'
  return answersMatch(antwoord, goed, [...alternatieven]) ? 'goed' : 'fout'
}

function schoon(waarde: string | null | undefined): string | null {
  const tekst = waarde?.trim() ?? ''
  return tekst ? tekst : null
}
