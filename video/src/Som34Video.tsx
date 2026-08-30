import { Audio, Sequence, Series, staticFile } from 'remotion'

import { Som34Analyse, Som34Intro, Som34Quotientregel, t } from './scenes-som34'

/** Voice-overfragment dat `delay` frames na de scènestart begint. */
function Stem({ scene, delay = 15 }: { scene: number; delay?: number }) {
  return (
    <Sequence from={delay}>
      <Audio src={staticFile(`voiceover-som34/scene-${scene}.mp3`)} />
    </Sequence>
  )
}

/**
 * "Uitleg bij #34 (H2)" — f(x) = (x − 2)/(x + 5) differentiëren met de
 * quotiëntregel. Eén regel is genoeg en het antwoord staat aan het eind van
 * die scène al in beeld, dus geen slotscène: intro, analyse, de quotiëntregel.
 *
 * Voice-over: public/voiceover-som34/ (Pauline), opnieuw genereren met
 * scripts/genereer-voiceover-som34.sh (SCENES=n voor één fragment).
 */
export const SOM34_SCENES = [200, 675, 1540].map(t)
export const SOM34_DUUR = SOM34_SCENES.reduce((a, b) => a + b, 0)

export function Som34Video() {
  return (
    <Series>
      <Series.Sequence durationInFrames={SOM34_SCENES[0]}>
        <Som34Intro />
        <Stem scene={1} delay={30} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SOM34_SCENES[1]}>
        <Som34Analyse />
        <Stem scene={2} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SOM34_SCENES[2]}>
        <Som34Quotientregel />
        <Stem scene={3} />
      </Series.Sequence>
    </Series>
  )
}
