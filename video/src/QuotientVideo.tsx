import { Audio, Sequence, Series, staticFile } from 'remotion'

import {
  QuotientAnalyse,
  QuotientIntro,
  QuotientStappenplan,
  QuotientUitwerking,
  t,
} from './scenes-quotient'

/** Voice-overfragment dat `delay` frames na de scènestart begint. */
function Stem({ scene, delay = 15 }: { scene: number; delay?: number }) {
  return (
    <Sequence from={delay}>
      <Audio src={staticFile(`voiceover-quotient/scene-${scene}.mp3`)} />
    </Sequence>
  )
}

/**
 * "Het stappenplan bij de quotiëntregel" — de regel zelf plus het stappenplan,
 * daarna meteen toegepast op #36 uit H2 (f(x) = (2x + 1)/(3x − 1)).
 * Opbouw: intro, het stappenplan, stap 0 op het voorbeeld, stappen 1 t/m 3.
 *
 * Voice-over: public/voiceover-quotient/ (Pauline), opnieuw genereren met
 * scripts/genereer-voiceover-quotient.sh (SCENES=n voor één fragment).
 */
export const QUOTIENT_SCENES = [200, 830, 300, 1740].map(t)
export const QUOTIENT_DUUR = QUOTIENT_SCENES.reduce((a, b) => a + b, 0)

export function QuotientVideo() {
  return (
    <Series>
      <Series.Sequence durationInFrames={QUOTIENT_SCENES[0]}>
        <QuotientIntro />
        <Stem scene={1} delay={30} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={QUOTIENT_SCENES[1]}>
        <QuotientStappenplan />
        <Stem scene={2} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={QUOTIENT_SCENES[2]}>
        <QuotientAnalyse />
        <Stem scene={3} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={QUOTIENT_SCENES[3]}>
        <QuotientUitwerking />
        <Stem scene={4} />
      </Series.Sequence>
    </Series>
  )
}
