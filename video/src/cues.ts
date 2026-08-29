import { t } from './scenes-som29'
import { SOM29_DUUR } from './Som29Video'

/**
 * Cue-punten voor de presenter (npm run presenter): elke klik op "volgende"
 * speelt de animatie tot het volgende cue-frame en pauzeert daar.
 * Frames zijn globaal en schalen mee met TEMPO (scenes-som29.tsx); houd de
 * basisgetallen synchroon met de `from`-waardes in de scènebestanden.
 */
export type Cue = { frame: number; label: string }

/** Som29: scène-offsets t(0) / t(180) / t(1380). */
export const SOM29_CUES: Cue[] = [
  { frame: 0, label: 'start — druk op spatie om te beginnen' },
  { frame: t(130), label: '#29 en de opgave in beeld' },
  { frame: t(330), label: 'stap 0 · de som bovenaan, q gemarkeerd' },
  { frame: t(470), label: 'de marker op q vervaagt' },
  { frame: t(525), label: 'groene cirkel om de 1' },
  { frame: t(600), label: 'rode cirkel om −(3q²−2)²' },
  { frame: t(970), label: 'pijl omlaag · de 1 doorgestreept' },
  { frame: t(1190), label: 'pijl omlaag · kwadraat als product' },
  { frame: t(1320), label: '"Productregel!"' },
  { frame: t(1460), label: 'scène 3 · regel en onze som staan klaar' },
  { frame: t(1680), label: 'stap 1 · kies g en h' },
  { frame: t(1870), label: 'stap 2 · bereken g′ en h′' },
  { frame: t(2040), label: 'stap 3 · formule uitgeschreven' },
  { frame: t(2330), label: 'formule ingevuld' },
  { frame: t(2720), label: 'één stap uitgerekend' },
  { frame: t(2880), label: 'de uitkomst' },
  { frame: SOM29_DUUR - 1, label: 'einde · Aaf springt' },
]
