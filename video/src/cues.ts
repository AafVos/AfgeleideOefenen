/**
 * Cue-punten voor de presenter (npm run presenter): elke klik op "volgende"
 * speelt de animatie tot het volgende cue-frame en pauzeert daar.
 * Frames zijn globaal (scène-offsets meegerekend). Houd ze synchroon met de
 * `from`-waardes in de scènebestanden.
 */
export type Cue = { frame: number; label: string }

/** Som29: scène-offsets 0 / 210 / 1380, totaal 3080 frames. */
export const SOM29_CUES: Cue[] = [
  { frame: 0, label: 'start — druk op spatie om te beginnen' },
  { frame: 70, label: '#29 en de opgave in beeld' },
  { frame: 360, label: 'scène 2 · de som bovenaan, q gemarkeerd' },
  { frame: 435, label: 'de marker op q vervaagt' },
  { frame: 500, label: 'groene cirkel om de 1' },
  { frame: 560, label: 'rode cirkel om −(3q²−2)²' },
  { frame: 920, label: 'pijl omlaag · de 1 doorgestreept' },
  { frame: 1170, label: 'pijl omlaag · kwadraat als product' },
  { frame: 1340, label: '"Productregel!"' },
  { frame: 1460, label: 'scène 3 · titel en de regelkaart' },
  { frame: 1610, label: 'het stappenplan (drie chips)' },
  { frame: 1770, label: 'onze m(q) — zelfde regel, met q' },
  { frame: 2090, label: 'stap 1 popt · g en h gekozen' },
  { frame: 2240, label: 'stap 2 popt · de afgeleiden' },
  { frame: 2340, label: 'stap 3 popt · formule met g en h' },
  { frame: 2610, label: 'formule ingevuld' },
  { frame: 2910, label: 'eindantwoord −12q(3q²−2)' },
  { frame: 3079, label: 'einde · Aaf springt' },
]
