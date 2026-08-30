import { t } from './scenes-som30'
import { SOM30_DUUR, SOM30_SCENES } from './Som30Video'

import type { Cue } from './cues'

/**
 * Cue-punten voor de presenter (npm run presenter): elke klik op "volgende"
 * speelt de animatie tot het volgende cue-frame en pauzeert daar.
 * Basisgetallen volgen de `from`-waardes in de scènes en schalen mee met
 * TEMPO (scenes-som30.tsx).
 */
const o2 = SOM30_SCENES[0]
const o3 = o2 + SOM30_SCENES[1]
const o4 = o3 + SOM30_SCENES[2]
const o5 = o4 + SOM30_SCENES[3]

export const SOM30_CUES: Cue[] = [
  { frame: 0, label: 'start — druk op spatie om te beginnen' },
  { frame: t(130), label: 'H2 · #30 en de opgave in beeld' },
  { frame: o2 + t(60), label: 'stap 0 · de som in beeld' },
  { frame: o2 + t(400), label: 'groene cirkel om de 5' },
  { frame: o2 + t(460), label: 'rode cirkel om 3(x⁴ − x)(x + 1)' },
  { frame: o2 + t(670), label: '"Somregel!"' },
  { frame: o2 + t(730), label: 'de somregel-kaart verschijnt' },
  { frame: o3 + t(50), label: 'scène 3 · somregel-kaart en de som staan klaar' },
  { frame: o3 + t(145), label: 'stap 1 · u(x) = 5 en v(x) = 3(x⁴ − x)(x + 1)' },
  { frame: o3 + t(420), label: 'stap 2 · u′(x) = 0 (geen x in u)' },
  { frame: o3 + t(650), label: 'de 3 naar binnen: v(x) = (3x⁴ − 3x)(x + 1)' },
  { frame: o3 + t(780), label: 'de tip onder de herschrijving' },
  { frame: o3 + t(1010), label: '"Productregel!"' },
  { frame: o4 + t(50), label: 'scène 4 · productregel en v(x) staan klaar' },
  { frame: o4 + t(145), label: 'stap 1 · g(x) = 3x⁴ − 3x en h(x) = x + 1' },
  { frame: o4 + t(310), label: 'stap 2 · g′(x) = 12x³ − 3 en h′(x) = 1' },
  { frame: o4 + t(560), label: 'stap 3 · formule symbolisch opgeschreven' },
  { frame: o4 + t(775), label: 'formule ingevuld' },
  { frame: o4 + t(1015), label: 'haakjes weggewerkt' },
  { frame: o4 + t(1350), label: 'eindantwoord v′(x) = 15x⁴ + 12x³ − 6x − 3' },
  { frame: o5 + t(55), label: 'scène 5 · voeg alles samen: de opgave' },
  { frame: o5 + t(110), label: 'k′(x) = u′(x) − v′(x)' },
  { frame: o5 + t(255), label: 'k′(x) = 0 − (15x⁴ + 12x³ − 6x − 3)' },
  { frame: o5 + t(485), label: 'de min gaat over álle termen' },
  { frame: o5 + t(590), label: 'de uitkomst' },
  { frame: SOM30_DUUR - 1, label: 'einde · Aaf springt' },
]
