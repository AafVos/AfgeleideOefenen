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
  { frame: o2 + t(410), label: 'rode cirkel om −(3q²−2)²' },
  { frame: o2 + t(470), label: '"− ertussen → somregel!"' },
  { frame: o2 + t(540), label: 'de somregel-kaart verschijnt' },
  { frame: o3 + t(60), label: 'scène 3 · somregel-kaart en de som staan klaar' },
  { frame: o3 + t(200), label: 'stap 1 · g en h gekozen (labels onder de som)' },
  { frame: o3 + t(400), label: 'stap 2 · g′ = 0 (geen q in g)' },
  { frame: o3 + t(620), label: 'h herschreven als product' },
  { frame: o3 + t(740), label: '"een product → productregel!"' },
  { frame: o4 + t(60), label: 'scène 4 · productregel en h(q) staan klaar' },
  { frame: o4 + t(250), label: 'stap 1 · de factoren g en h' },
  { frame: o4 + t(480), label: 'stap 2 · de afgeleiden (6q en 6q)' },
  { frame: o4 + t(660), label: 'stap 3 · formule ingevuld' },
  { frame: o4 + t(800), label: 'één stap uitgerekend' },
  { frame: o4 + t(920), label: 'eindantwoord h′(q) = −12q(3q²−2)' },
  { frame: o5 + t(110), label: 'scène 5 · voeg alles samen: de opgave' },
  { frame: o5 + t(200), label: 'm′(q) = g′(q) + h′(q)' },
  { frame: o5 + t(300), label: 'm′(q) = 0 − 12q(3q²−2)' },
  { frame: o5 + t(450), label: 'de uitkomst' },
  { frame: SOM29_DUUR - 1, label: 'einde · Aaf springt' },
]
