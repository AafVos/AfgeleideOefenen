import { t } from './scenes-som34'
import { SOM34_DUUR, SOM34_SCENES } from './Som34Video'

import type { Cue } from './cues'

/**
 * Cue-punten voor de presenter (npm run presenter): elke klik op "volgende"
 * speelt de animatie tot het volgende cue-frame en pauzeert daar.
 */
const o2 = SOM34_SCENES[0]
const o3 = o2 + SOM34_SCENES[1]

export const SOM34_CUES: Cue[] = [
  { frame: 0, label: 'start — druk op spatie om te beginnen' },
  { frame: t(140), label: 'H2 · #34 en de opgave in beeld' },
  { frame: o2 + t(60), label: 'stap 0 · de breuk in beeld' },
  { frame: o2 + t(250), label: 'groene cirkel om de teller (x − 2)' },
  { frame: o2 + t(330), label: 'rode cirkel om de noemer (x + 5)' },
  { frame: o2 + t(530), label: '"Quotiëntregel!"' },
  { frame: o2 + t(605), label: 'de quotiëntregel-kaart verschijnt' },
  { frame: o3 + t(50), label: 'scène 3 · kaart en de breuk staan klaar' },
  { frame: o3 + t(130), label: 'g(x) boven en h(x) onder de breukstreep' },
  { frame: o3 + t(195), label: 'stap 1 · g(x) = x − 2 en h(x) = x + 5' },
  { frame: o3 + t(425), label: 'stap 2 · g′(x) = 1 en h′(x) = 1' },
  { frame: o3 + t(640), label: 'stap 3 · formule symbolisch opgeschreven' },
  { frame: o3 + t(975), label: 'formule ingevuld' },
  { frame: o3 + t(1210), label: 'teller uitgewerkt' },
  { frame: o3 + t(1335), label: 'eindantwoord f′(x) = 7/(x + 5)²' },
  { frame: SOM34_DUUR - 1, label: 'einde · Aaf springt' },
]
