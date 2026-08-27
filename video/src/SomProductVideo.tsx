import { Audio, Sequence, Series, staticFile } from 'remotion'

import {
  SceneIntro,
  SceneKern,
  SceneOplossen,
  SceneSamenvatting,
  SceneWanneerNiet,
  SceneZoeken,
} from './scenes'

/** Voice-overfragment dat `delay` frames na de scènestart begint. */
function Stem({ scene, delay = 15 }: { scene: number; delay?: number }) {
  return (
    <Sequence from={delay}>
      <Audio src={staticFile(`voiceover/scene-${scene}.mp3`)} />
    </Sequence>
  )
}

/**
 * Volledige uitlegvideo (98 s bij 30 fps = 2940 frames).
 * Tijden per scène staan ook in VOICEOVER.md — houd die synchroon.
 *
 * De mp3's in public/voiceover/ komen uit ElevenLabs (stem "Jessica");
 * opnieuw genereren kan met scripts/genereer-voiceover.sh.
 */
export function SomProductVideo() {
  return (
    <Series>
      <Series.Sequence durationInFrames={300}>
        <SceneIntro />
        <Stem scene={1} delay={30} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={450}>
        <SceneKern />
        <Stem scene={2} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={600}>
        <SceneZoeken />
        <Stem scene={3} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={330}>
        <SceneOplossen />
        <Stem scene={4} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={600}>
        <SceneWanneerNiet />
        <Stem scene={5} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={660}>
        <SceneSamenvatting />
        <Stem scene={6} />
      </Series.Sequence>
    </Series>
  )
}
