/**
 * Supabase bewaart de sessie in een koekje `sb-<project>-auth-token`.
 * Is de sessie te lang voor één koekje, dan heet het vervolg `.0`, `.1`, …
 * Het koekje `…-auth-token-code-verifier` is alleen de tussenstap van
 * "Doorgaan met Google" en telt niet als een sessie.
 */
const SESSIE_KOEKJE = /^sb-.+-auth-token(?:\.\d+)?$/

export function heeftSessiekoekje(koekjes: { name: string }[]): boolean {
  return koekjes.some((koekje) => SESSIE_KOEKJE.test(koekje.name))
}
