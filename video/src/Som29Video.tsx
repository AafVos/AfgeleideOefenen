import { Series } from 'remotion'

import { Som29Herkennen, Som29Intro, Som29Productregel, t } from './scenes-som29'

/**
 * "Uitleg bij som 29" — m(q) = 1 − (3q² − 2)² differentiëren.
 * Tempo is geschaald via TEMPO in scenes-som29.tsx (ruimer, voor zelf
 * inspreken); totaalduur = t(180) + t(1200) + t(1670) frames.
 *
 * Voice-over: wordt zelf ingesproken (script: VOICEOVER-som29.md).
 * Eigen opnames monteren: zet ze als scene-1.mp3 t/m scene-3.mp3 in
 * public/voiceover-som29/ en zet per scène een blok terug zoals:
 *
 *   <Sequence from={15}><Audio src={staticFile('voiceover-som29/scene-1.mp3')} /></Sequence>
 *
 * (import { Audio, Sequence, staticFile } from 'remotion')
 */
export const SOM29_DUUR = t(180) + t(1200) + t(1670)

export function Som29Video() {
  return (
    <Series>
      <Series.Sequence durationInFrames={t(180)}>
        <Som29Intro />
      </Series.Sequence>
      <Series.Sequence durationInFrames={t(1200)}>
        <Som29Herkennen />
      </Series.Sequence>
      <Series.Sequence durationInFrames={t(1670)}>
        <Som29Productregel />
      </Series.Sequence>
    </Series>
  )
}
