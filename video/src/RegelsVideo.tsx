import { Audio, Sequence, Series, staticFile } from 'remotion'

import {
  RegelsIntro,
  RegelsLijm,
  RegelsProduct,
  RegelsSamenvatting,
  RegelsSom,
} from './scenes-regels'

/** Voice-overfragment dat `delay` frames na de scènestart begint. */
function Stem({ scene, delay = 15 }: { scene: number; delay?: number }) {
  return (
    <Sequence from={delay}>
      <Audio src={staticFile(`voiceover-regels/scene-${scene}.mp3`)} />
    </Sequence>
  )
}

/**
 * "Somregel of productregel?" — wanneer gebruik je welke regel bij het
 * differentiëren (140 s bij 30 fps = 4210 frames).
 *
 * Voice-over: public/voiceover-regels/, opnieuw genereren met
 * scripts/genereer-voiceover-regels.sh (stem Pauline).
 */
export function RegelsVideo() {
  return (
    <Series>
      <Series.Sequence durationInFrames={280}>
        <RegelsIntro />
        <Stem scene={1} delay={30} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={450}>
        <RegelsLijm />
        <Stem scene={2} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={1300}>
        <RegelsSom />
        <Stem scene={3} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={1680}>
        <RegelsProduct />
        <Stem scene={4} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={500}>
        <RegelsSamenvatting />
        <Stem scene={5} />
      </Series.Sequence>
    </Series>
  )
}
