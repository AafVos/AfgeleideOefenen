/**
 * Zet `van=klas` op een adres, zodat we later zien dat een link uit de klasapp komt.
 * Bestaande zoekwoorden (hoofdstuk, opgave) blijven staan.
 */
export function deelLink(padEnZoek: string): string {
  const vraagteken = padEnZoek.indexOf('?')
  const pad = vraagteken === -1 ? padEnZoek : padEnZoek.slice(0, vraagteken)
  const params = new URLSearchParams(vraagteken === -1 ? '' : padEnZoek.slice(vraagteken + 1))
  params.set('van', 'klas')
  const zoek = params.toString()
  return zoek ? `${pad}?${zoek}` : pad
}
