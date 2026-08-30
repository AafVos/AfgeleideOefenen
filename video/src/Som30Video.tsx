import { Audio, Sequence, Series, staticFile } from 'remotion'

import {
  Som30Analyse,
  Som30Intro,
  Som30Productregel,
  Som30Samen,
  Som30Somregel,
  t,
} from './scenes-som30'

/** Voice-overfragment dat `delay` frames na de scènestart begint. */
function Stem({ scene, delay = 15 }: { scene: number; delay?: number }) {
  return (
    <Sequence from={delay}>
      <Audio src={staticFile(`voiceover-som30/scene-${scene}.mp3`)} />
    </Sequence>
  )
}

/**
 * "Uitleg bij som 30" — k(x) = 5 − 3(x⁴ − x)(x + 1) differentiëren via de
 * somregel (u = 5, v = 3(x⁴ − x)(x + 1)), met de productregel voor v′, en een
 * slotscène die alles samenvoegt.
 *
 * Voice-over: public/voiceover-som30/ (Pauline), opnieuw genereren met
 * scripts/genereer-voiceover-som30.sh. Beats zijn op haar tempo getimed
 * (TEMPO = 1 in scenes-som30.tsx).
 */
export const SOM30_SCENES = [200, 880, 1160, 1560, 850].map(t)
export const SOM30_DUUR = SOM30_SCENES.reduce((a, b) => a + b, 0)

export function Som30Video() {
  return (
    <Series>
      <Series.Sequence durationInFrames={SOM30_SCENES[0]}>
        <Som30Intro />
        <Stem scene={1} delay={30} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SOM30_SCENES[1]}>
        <Som30Analyse />
        <Stem scene={2} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SOM30_SCENES[2]}>
        <Som30Somregel />
        <Stem scene={3} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SOM30_SCENES[3]}>
        <Som30Productregel />
        <Stem scene={4} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SOM30_SCENES[4]}>
        <Som30Samen />
        <Stem scene={5} />
      </Series.Sequence>
    </Series>
  )
}
