import { t } from './scenes-quotient'
import { QUOTIENT_DUUR, QUOTIENT_SCENES } from './QuotientVideo'

/**
 * Cue-punten voor de presenter (npm run presenter?video=quotient).
 * Basisgetallen volgen de `from`-waardes in de scènes en schalen mee met
 * TEMPO (scenes-quotient.tsx).
 */
export type Cue = { frame: number; label: string }

const o2 = QUOTIENT_SCENES[0]
const o3 = o2 + QUOTIENT_SCENES[1]
const o4 = o3 + QUOTIENT_SCENES[2]

export const QUOTIENT_CUES: Cue[] = [
  { frame: 0, label: 'start — druk op spatie om te beginnen' },
  { frame: t(60), label: 'intro · de quotiëntregel, het stappenplan' },
  { frame: o2 + t(30), label: 'scène 2 · de quotiëntregel-kaart' },
  { frame: o2 + t(100), label: 'net als bij de som- en productregel' },
  { frame: o2 + t(260), label: 'stap 0 · analyseer de buitenste schil' },
  { frame: o2 + t(340), label: 'een breuk → quotiëntregel' },
  { frame: o2 + t(455), label: 'stap 1 · bepaal g en h' },
  { frame: o2 + t(570), label: 'stap 2 · bereken g′ en h′' },
  { frame: o2 + t(700), label: 'stap 3 · vul de formule in' },
  { frame: o3 + t(40), label: 'scène 3 · het voorbeeld H2 · #36' },
  { frame: o3 + t(125), label: 'groene cirkel om de teller' },
  { frame: o3 + t(165), label: 'rode cirkel om de noemer' },
  { frame: o3 + t(230), label: '"Quotiëntregel!"' },
  { frame: o4 + t(30), label: 'scène 4 · kaart en f(x) staan klaar' },
  { frame: o4 + t(110), label: 'g boven, h onder de breukstreep' },
  { frame: o4 + t(175), label: 'stap 1 · g(x) = 2x + 1 en h(x) = 3x − 1' },
  { frame: o4 + t(445), label: 'stap 2 · g′(x) = 2 en h′(x) = 3' },
  { frame: o4 + t(680), label: 'stap 3 · formule symbolisch' },
  { frame: o4 + t(1055), label: 'formule ingevuld' },
  { frame: o4 + t(1365), label: 'teller uitgewerkt' },
  { frame: o4 + t(1570), label: 'het antwoord −5 / (3x − 1)²' },
  { frame: QUOTIENT_DUUR - 1, label: 'einde · Aaf springt' },
]
