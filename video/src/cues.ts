/**
 * Cue-punten voor de presenter (npm run presenter): elke klik op "volgende"
 * speelt de animatie tot het volgende cue-frame en pauzeert daar.
 * Frames zijn globaal (scène-offsets meegerekend). Houd ze synchroon met de
 * `from`-waardes in de scènebestanden.
 */
export type Cue = { frame: number; label: string }

/** Som29: scène-offsets 0 / 180 / 1380, totaal 3050 frames. */
export const SOM29_CUES: Cue[] = [
  { frame: 0, label: 'start — druk op spatie om te beginnen' },
  { frame: 130, label: '#29 en de opgave in beeld' },
  { frame: 330, label: 'stap 0 · de som bovenaan, q gemarkeerd' },
  { frame: 470, label: 'de marker op q vervaagt' },
  { frame: 525, label: 'groene cirkel om de 1' },
  { frame: 600, label: 'rode cirkel om −(3q²−2)²' },
  { frame: 970, label: 'pijl omlaag · de 1 doorgestreept' },
  { frame: 1190, label: 'pijl omlaag · kwadraat als product' },
  { frame: 1320, label: '"Productregel!"' },
  { frame: 1460, label: 'scène 3 · regel en onze som staan klaar' },
  { frame: 1680, label: 'stap 1 · kies g en h' },
  { frame: 1870, label: 'stap 2 · bereken g′ en h′' },
  { frame: 2040, label: 'stap 3 · formule uitgeschreven' },
  { frame: 2330, label: 'formule ingevuld' },
  { frame: 2720, label: 'één stap uitgerekend' },
  { frame: 2880, label: 'de uitkomst' },
  { frame: 3049, label: 'einde · Aaf springt' },
]
