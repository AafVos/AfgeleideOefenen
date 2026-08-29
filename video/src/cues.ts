import { t } from './scenes-som29'
import { SOM29_DUUR, SOM29_SCENES } from './Som29Video'

/**
 * Cue-punten voor de presenter (npm run presenter): elke klik op "volgende"
 * speelt de animatie tot het volgende cue-frame en pauzeert daar.
 * Basisgetallen volgen de `from`-waardes in de scènes en schalen mee met
 * TEMPO (scenes-som29.tsx).
 */
export type Cue = { frame: number; label: string }

const o2 = SOM29_SCENES[0]
const o3 = o2 + SOM29_SCENES[1]
const o4 = o3 + SOM29_SCENES[2]
const o5 = o4 + SOM29_SCENES[3]

export const SOM29_CUES: Cue[] = [
  { frame: 0, label: 'start — druk op spatie om te beginnen' },
  { frame: t(130), label: '#29 en de opgave in beeld' },
  { frame: o2 + t(160), label: 'stap 0 · de som in beeld, q gemarkeerd' },
  { frame: o2 + t(285), label: 'de marker op q vervaagt' },
  { frame: o2 + t(340), label: 'groene cirkel om de 1' },
  { frame: o2 + t(410), label: 'rode cirkel om (3q²−2)²' },
  { frame: o2 + t(470), label: '"Somregel!"' },
  { frame: o2 + t(540), label: 'de somregel-kaart verschijnt' },
  { frame: o3 + t(60), label: 'scène 3 · somregel-kaart en de som staan klaar' },
  { frame: o3 + t(200), label: 'stap 1 · g = 1 en h = (3q²−2)²' },
  { frame: o3 + t(450), label: 'stap 2 · g′ = 0 (geen q in g)' },
  { frame: o3 + t(700), label: 'h herschreven als product' },
  { frame: o3 + t(900), label: '"Productregel!"' },
  { frame: o4 + t(60), label: 'scène 4 · productregel en h staan klaar' },
  { frame: o4 + t(200), label: 'we noemen de delen u en v' },
  { frame: o4 + t(400), label: 'stap 1 · u en v gekozen' },
  { frame: o4 + t(620), label: 'stap 2 · u′ en v′ (6q en 6q)' },
  { frame: o4 + t(880), label: 'stap 3 · h′ = u′·v + u·v′' },
  { frame: o4 + t(1120), label: 'formule ingevuld' },
  { frame: o4 + t(1320), label: 'één stap uitgerekend' },
  { frame: o4 + t(1470), label: 'eindantwoord h′ = 12q(3q²−2)' },
  { frame: o5 + t(110), label: 'scène 5 · voeg alles samen: de opgave' },
  { frame: o5 + t(200), label: 'm′(q) = g′ − h′' },
  { frame: o5 + t(300), label: 'm′(q) = 0 − 12q(3q²−2)' },
  { frame: o5 + t(430), label: 'de uitkomst' },
  { frame: SOM29_DUUR - 1, label: 'einde · Aaf springt' },
]
