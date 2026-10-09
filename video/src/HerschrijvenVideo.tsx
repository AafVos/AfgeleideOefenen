import { Audio, Sequence, Series, staticFile } from 'remotion'

import {
  HerschrijvenIntro,
  HerschrijvenNoemer,
  HerschrijvenRegels,
  HerschrijvenSamenvatting,
  HerschrijvenStappenplan,
  HerschrijvenWortel,
  t,
} from './scenes-herschrijven'

/** Voice-overfragment dat `delay` frames na de scènestart begint. */
function Stem({ scene, delay = 15 }: { scene: number; delay?: number }) {
  return (
    <Sequence from={delay}>
      <Audio src={staticFile(`voiceover-herschrijven/scene-${scene}.mp3`)} />
    </Sequence>
  )
}

/**
 * "Machten en wortels herschrijven" — algemene uitleg bij het H6-topic
 * "Machten en wortels herschrijven": de herschrijfregels, het stappenplan, en
 * twee voorbeelden van de theoriekaarten (6/x³ en x·√x), dan een samenvatting.
 *
 * Voice-over: public/voiceover-herschrijven/ (Pauline), opnieuw genereren met
 * scripts/genereer-voiceover-herschrijven.sh (SCENES=n voor één fragment).
 */
export const HERSCHRIJVEN_SCENES = [150, 1010, 820, 1270, 1350, 770].map(t)
export const HERSCHRIJVEN_DUUR = HERSCHRIJVEN_SCENES.reduce((a, b) => a + b, 0)

const SCENES = [
  HerschrijvenIntro,
  HerschrijvenRegels,
  HerschrijvenStappenplan,
  HerschrijvenNoemer,
  HerschrijvenWortel,
  HerschrijvenSamenvatting,
]

export function HerschrijvenVideo() {
  return (
    <Series>
      {SCENES.map((Scene, i) => (
        <Series.Sequence key={i} durationInFrames={HERSCHRIJVEN_SCENES[i]}>
          <Scene />
          <Stem scene={i + 1} delay={i === 0 ? 30 : 15} />
        </Series.Sequence>
      ))}
    </Series>
  )
}
