/**
 * Houdt de CSS-variabele `--app-height` gelijk aan de echte, actuele
 * vensterhoogte (`window.innerHeight`).
 *
 * `100dvh` hoort dit zelf al te doen, en sinds AFG-848 gebruiken
 * `html`/`body`/de kolom in `[locale]/layout.tsx` die eenheid consequent.
 * Toch bleven er daarna nog dode klikken op `body` over, bijna allemaal op
 * tablet (AFG-862): een bekende eigenaardigheid in Safari en Chrome is dat
 * `dvh` pas bijwerkt ná een scroll- of resize-gebeurtenis, niet meteen bij
 * een inklappende adresbalk of toetsenbord. Deze rekenregel is de
 * eigenhandige correctie: zodra er een resize is (ook de `visualViewport`
 * van een toetsenbord, die geen gewone window-resize geeft), zet hij de
 * variabele zelf goed.
 *
 * Puur en zonder `document`/`window`, zodat dit zonder browser te testen
 * is — zie `src/lib/meten/gebeurtenis.ts` voor hetzelfde idee.
 */

export type Vensterachtig = {
  readonly innerHeight: number
  addEventListener: (soort: 'resize', fn: () => void) => void
  removeEventListener: (soort: 'resize', fn: () => void) => void
}

/**
 * Begint met volgen en zet de variabele meteen één keer. Geeft een functie
 * terug die het volgen weer stopt (voor de opruimfunctie van een effect).
 *
 * Is er een `visueelVenster` (het echte `visualViewport`, dat krimpt als
 * een toetsenbord opent), dan telt zíjn hoogte: dat is de daadwerkelijk
 * zichtbare ruimte. `venster` (het gewone `window`) blijft nodig als bron
 * voor de gewone resize (een draaiend scherm, een in/uitklappende
 * adresbalk) — daar geeft `visualViewport` soms geen eigen gebeurtenis bij.
 */
export function volgVensterHoogte(
  venster: Vensterachtig,
  visueelVenster: Vensterachtig | null,
  zet: (pixels: string) => void,
): () => void {
  function bijwerken() {
    const hoogte = visueelVenster ? visueelVenster.innerHeight : venster.innerHeight
    zet(`${hoogte}px`)
  }

  bijwerken()
  venster.addEventListener('resize', bijwerken)
  visueelVenster?.addEventListener('resize', bijwerken)

  return () => {
    venster.removeEventListener('resize', bijwerken)
    visueelVenster?.removeEventListener('resize', bijwerken)
  }
}
