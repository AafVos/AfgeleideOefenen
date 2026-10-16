/**
 * De schuilnaam van een ingelogde leerling.
 *
 * Dat is HMAC-SHA256 van het gebruikers-id met een geheim, als hex, de
 * eerste 16 tekens. Zo zijn de klikken van één leerling over meerdere dagen
 * te volgen zonder naam, e-mailadres of gebruikers-id. Terugrekenen kan
 * niet zonder het geheim, en dat staat alleen als Worker-secret
 * `MEET_SCHUILNAAM_GEHEIM` en in de Vault als `meet_schuilnaam_geheim`.
 *
 * Dezelfde rekensom staat in de database als `meet_schuilnaam()`, migratie
 * 0073. Die is voor de overzichten van de analist; de twee moeten hetzelfde
 * uitrekenen, dus staat in `schuilnaam.test.ts` een vaste proefsom.
 *
 * Bezoekers zonder account krijgen hier niets: die hebben alleen het
 * sessie-id van hun tabblad.
 */

/** Hoeveel tekens van de hex-uitkomst we bewaren. */
export const SCHUILNAAM_LENGTE = 16

const encoder = new TextEncoder()

function hex(ruw: ArrayBuffer): string {
  return Array.from(new Uint8Array(ruw))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Rekent de schuilnaam uit. Geen gebruiker of geen geheim? Dan `null`, en
 * blijft de kolom gewoon leeg.
 */
export async function schuilnaam(
  gebruikerId: string | null | undefined,
  geheim: string | null | undefined,
): Promise<string | null> {
  if (!gebruikerId || !geheim) return null

  const sleutel = await crypto.subtle.importKey(
    'raw',
    encoder.encode(geheim),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const handtekening = await crypto.subtle.sign(
    'HMAC',
    sleutel,
    encoder.encode(gebruikerId),
  )

  return hex(handtekening).slice(0, SCHUILNAAM_LENGTE)
}
