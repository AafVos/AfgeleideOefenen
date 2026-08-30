import { Audio, Sequence, Series, staticFile } from 'remotion'

import {
  Som29Analyse,
  Som29Intro,
  Som29Productregel,
  Som29Samen,
  Som29Somregel,
  t,
} from './scenes-som29'

/** Voice-overfragment dat `delay` frames na de scènestart begint. */
function Stem({ scene, delay = 15 }: { scene: number; delay?: number }) {
  return (
    <Sequence from={delay}>
      <Audio src={staticFile(`voiceover-som29/scene-${scene}.mp3`)} />
    </Sequence>
  )
}

/**
 * "Uitleg bij #29 (H2)" — m(q) = 1 − (3q² − 2)² differentiëren via de
 * somregel (g = 1, h = (3q²−2)²). Voor h′ is de productregel nodig; die pagina
 * begint bij zijn eigen f, namelijk het deel dat we meenamen. De slotscène
 * koppelt dat antwoord terug aan h′ en voegt alles samen.
 *
 * Voice-over: public/voiceover-som29/ (Pauline), opnieuw genereren met
 * scripts/genereer-voiceover-som29.sh. Beats zijn op haar tempo getimed
 * (TEMPO = 1 in scenes-som29.tsx).
 */
export const SOM29_SCENES = [200, 630, 980, 1530, 690].map(t)
export const SOM29_DUUR = SOM29_SCENES.reduce((a, b) => a + b, 0)

export function Som29Video() {
  return (
    <Series>
      <Series.Sequence durationInFrames={SOM29_SCENES[0]}>
        <Som29Intro />
        <Stem scene={1} delay={30} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SOM29_SCENES[1]}>
        <Som29Analyse />
        <Stem scene={2} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SOM29_SCENES[2]}>
        <Som29Somregel />
        <Stem scene={3} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SOM29_SCENES[3]}>
        <Som29Productregel />
        <Stem scene={4} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SOM29_SCENES[4]}>
        <Som29Samen />
        <Stem scene={5} />
      </Series.Sequence>
    </Series>
  )
}
