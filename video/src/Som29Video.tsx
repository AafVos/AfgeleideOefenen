import { Audio, Sequence, Series, staticFile } from 'remotion'

import {
  Som29Delen,
  Som29Herkennen,
  Som29Intro,
  Som29Min,
  Som29Productregel,
  Som29Samenvatting,
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
 * "Uitleg bij som 29" — m(q) = 1 − (3q² − 2)² differentiëren
 * (133 s bij 30 fps = 3990 frames). Gemaakt op leerlingverzoek.
 *
 * Voice-over: public/voiceover-som29/, opnieuw genereren met
 * scripts/genereer-voiceover-som29.sh.
 */
export function Som29Video() {
  return (
    <Series>
      <Series.Sequence durationInFrames={500}>
        <Som29Intro />
        <Stem scene={1} delay={30} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={720}>
        <Som29Herkennen />
        <Stem scene={2} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={645}>
        <Som29Delen />
        <Stem scene={3} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={1000}>
        <Som29Productregel />
        <Stem scene={4} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={510}>
        <Som29Min />
        <Stem scene={5} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={615}>
        <Som29Samenvatting />
        <Stem scene={6} />
      </Series.Sequence>
    </Series>
  )
}
