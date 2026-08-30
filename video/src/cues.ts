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
  { frame: t(130), label: 'H2 · #29 en de opgave in beeld' },
  { frame: o2 + t(60), label: 'stap 0 · de som in beeld, q gemarkeerd' },
  { frame: o2 + t(275), label: 'de marker op q vervaagt' },
  { frame: o2 + t(320), label: 'groene cirkel om de 1' },
  { frame: o2 + t(380), label: 'rode cirkel om (3q²−2)²' },
  { frame: o2 + t(490), label: '"Somregel!"' },
  { frame: o2 + t(550), label: 'de somregel-kaart verschijnt' },
  { frame: o3 + t(50), label: 'scène 3 · somregel-kaart en de som staan klaar' },
  { frame: o3 + t(160), label: 'stap 1 · g(q) = 1 en h(q) = (3q²−2)²' },
  { frame: o3 + t(380), label: 'stap 2 · g′(q) = 0 (geen q in g)' },
  { frame: o3 + t(600), label: 'h herschreven als product' },
  { frame: o3 + t(900), label: '"Productregel!"' },
  { frame: o4 + t(60), label: 'scène 4 · de productregel-kaart' },
  { frame: o4 + t(165), label: 'de functie van de vorige pagina wordt hier f' },
  { frame: o4 + t(380), label: 'stap 1 · g(q) en h(q) gekozen' },
  { frame: o4 + t(580), label: 'stap 2 · g′(q) = 6q en h′(q) = 6q' },
  { frame: o4 + t(760), label: 'stap 3 · formule symbolisch opgeschreven' },
  { frame: o4 + t(990), label: 'formule ingevuld' },
  { frame: o4 + t(1230), label: 'één stap uitgerekend' },
  { frame: o4 + t(1350), label: 'eindantwoord f′(q) = 12q(3q²−2)' },
  { frame: o5 + t(55), label: 'scène 5 · voeg alles samen: de opgave' },
  { frame: o5 + t(100), label: 'dat antwoord hoorde bij h: h′(q) = 12q(3q²−2)' },
  { frame: o5 + t(285), label: 'm′(q) = g′(q) − h′(q)' },
  { frame: o5 + t(400), label: 'm′(q) = 0 − 12q(3q²−2)' },
  { frame: o5 + t(515), label: 'de uitkomst' },
  { frame: SOM29_DUUR - 1, label: 'einde · Aaf springt' },
]
