import type { ViewStyle } from 'react-native'

/** Minimale hoogte van een tikbaar vlak, zie docs/ontwerpregels.md (site). */
export const MIN_RAAKVLAK = 44

/**
 * Zorgt dat een Pressable minstens de minimale tikzone heeft, ook als de
 * zichtbare inhoud (bijvoorbeeld een korte tekstlink) kleiner is. Een
 * controle vond eerder tekstlinks van ongeveer 22 px hoog in het
 * inlogscherm (AFG-557) — deze helper voorkomt dat dat zich herhaalt.
 */
export function raakvlak(stijl?: ViewStyle): ViewStyle {
  return {
    justifyContent: 'center',
    ...stijl,
    // Staat na het spreiden van `stijl`, zodat een meegegeven kleinere
    // waarde de minimale tikzone niet per ongeluk kan verkleinen.
    minHeight: MIN_RAAKVLAK,
  }
}
