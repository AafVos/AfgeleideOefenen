/**
 * Waar "Volgende" naartoe gaat.
 *
 * `zichtbaar` zijn de tegels die nu op de pagina staan (dus na het
 * soort-filter), `volgorde` zijn alle tegels van dit onderdeel in de volgorde
 * van het boek. Normaal pakken we de tegel ná de opgave die open staat.
 *
 * Staat het filter op "Verhaaltjes" en opent een leerling via een losse link
 * een gewone som, dan zit die opgave niet tussen de zichtbare tegels. Dan
 * zoeken we de eerste zichtbare tegel die er in het boek ná komt, zodat de
 * leerling vooruit gaat in plaats van terug naar de eerste tegel.
 */
export function volgendeTegel<T extends { questionId: string }>(
  zichtbaar: readonly T[],
  volgorde: readonly T[],
  huidigeId: string | null,
): T | null {
  const eerste = zichtbaar[0] ?? null
  if (!eerste || !huidigeId) return eerste

  const plek = zichtbaar.findIndex((tegel) => tegel.questionId === huidigeId)
  if (plek >= 0) return zichtbaar[(plek + 1) % zichtbaar.length] ?? null

  const plekInBoek = volgorde.findIndex((tegel) => tegel.questionId === huidigeId)
  if (plekInBoek < 0) return eerste

  const zichtbareIds = new Set(zichtbaar.map((tegel) => tegel.questionId))
  const verderop = volgorde
    .slice(plekInBoek + 1)
    .find((tegel) => zichtbareIds.has(tegel.questionId))
  if (!verderop) return eerste

  return zichtbaar.find((tegel) => tegel.questionId === verderop.questionId) ?? eerste
}
