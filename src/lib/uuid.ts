const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Of een tekst eruitziet als een geldige UUID (zoals een vraag-id). */
export function isGeldigeUuid(waarde: string): boolean {
  return UUID_REGEX.test(waarde)
}
