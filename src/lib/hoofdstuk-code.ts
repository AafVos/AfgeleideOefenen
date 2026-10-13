/**
 * Korte code voor het groene vakje naast een hoofdstuk.
 * Genummerde hoofdstukken blijven H2…H16. Zonder boeknummer past de
 * slug zelf niet in het vakje, dus die krijgt een vast kort label.
 */
const ZONDER_NUMMER: Record<string, string> = {
  beweging: 'B',
}

export function hoofdstukCode(slug: string): string {
  const genummerd = /^h(\d+)$/i.exec(slug.trim())
  if (genummerd) return `H${genummerd[1]}`

  const kort = ZONDER_NUMMER[slug.trim().toLowerCase()]
  if (kort) return kort

  return slug.trim().slice(0, 3).toUpperCase()
}
