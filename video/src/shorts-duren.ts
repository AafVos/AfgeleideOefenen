/**
 * Frame-aantallen per beat (30 fps), inclusief aanloop en uitloop.
 * Geschreven door scripts/genereer-voiceover-integraal-shorts.py. Niet met de hand
 * aanpassen: opnieuw genereren overschrijft dit bestand.
 * SHORT_LEAD blijft de stilte vóór de stem in shorts.tsx.
 */
export const SHORT_LEAD = 10
export const SHORT_TAIL = 20

export const shortDuren = {
  primitief: [109, 190, 111, 120, 151, 143],
  substitutie: [177, 190, 177, 256, 159, 153],
  partieel: [100, 131, 98, 264, 165, 131, 171],
  oppervlakte: [141, 131, 136, 102, 123, 158],
  arctan: [136, 138, 211, 156],
} as const

export function duurVan(frames: readonly number[]) {
  return frames.reduce((som, n) => som + n, 0)
}
