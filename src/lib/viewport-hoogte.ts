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
 * Elke bron werkt bij met zíjn eigen meting, niet die van de ander. Eerder
 * (AFG-862) gebruikte elke update altijd `visualViewport`s hoogte zodra die
 * bestond — ook bij een gewone `window`-resize. Dat ging stelselmatig mis:
 * de visuele viewport is per specificatie nooit groter dan de
 * layout-viewport (waar `dvh` op gebaseerd is), en op een flink deel van de
 * tablets staat hij daar altijd een stuk onder, los van een toetsenbord
 * (bijvoorbeeld door een systeembalk). Zo werd `--app-height` structureel
 * te klein gezet, en bleef precies de kale strook staan die deze rekenregel
 * juist moest wegnemen (AFG-921) — op tablet 6 van de 9 metingen.
 *
 * `venster` (het gewone `window`) is dus de bron bij het beginnen en bij
 * een gewone resize (een draaiend scherm, een in/uitklappende adresbalk).
 * `visueelVenster` (het echte `visualViewport`) telt alleen bij zíjn eigen
 * gebeurtenis: dat is het toetsenbord dat het zichtbare venster verkleint
 * zonder een gewone window-resize te geven.
 */
export function volgVensterHoogte(
  venster: Vensterachtig,
  visueelVenster: Vensterachtig | null,
  zet: (pixels: string) => void,
): () => void {
  function bijwerkenVenster() {
    zet(`${venster.innerHeight}px`)
  }
  function bijwerkenVisueelVenster() {
    if (visueelVenster) zet(`${visueelVenster.innerHeight}px`)
  }

  bijwerkenVenster()
  venster.addEventListener('resize', bijwerkenVenster)
  visueelVenster?.addEventListener('resize', bijwerkenVisueelVenster)

  return () => {
    venster.removeEventListener('resize', bijwerkenVenster)
    visueelVenster?.removeEventListener('resize', bijwerkenVisueelVenster)
  }
}
