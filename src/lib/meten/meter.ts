/**
 * Het meetscriptje in de browser.
 *
 * Het verzamelt gebeurtenissen en stuurt ze per paar seconden in één keer
 * naar /api/meet. Het laadt pas na de eerste weergave (zie
 * `src/components/meten.tsx`) en bewaart niets dat een tabblad overleeft:
 * het sessie-id staat in `sessionStorage`, niet in een koekje.
 *
 * De rekenregels staan in `gebeurtenis.ts`, zodat ze te testen zijn zonder
 * browser.
 */

import {
  apparaatVanBreedte,
  doelNaam,
  isBot,
  isWoedeklik,
  MAX_PER_UUR,
  MAX_PER_ZENDING,
  SCROLL_STAPPEN,
  schoonPad,
  slaPadOver,
  utmBron,
  verwijzerDomein,
  type Gebeurtenis,
  type Klikplek,
  type MeetSoort,
} from './gebeurtenis'
import {
  doelVanBewaard,
  EIGEN_MELDING,
  haalKlaargezetteRegistratie,
} from './melden'

const SLEUTEL = 'meet-sessie'
const ADRES = '/api/meet'
const WACHTTIJD = 3000

/** Elementen waar een klik ergens op uitkomt. Al het andere is een dode klik. */
const KLIKBAAR =
  'a[href], button, [role="button"], [role="link"], [role="tab"], input, select, textarea, summary, label, [data-meet], [onclick], [tabindex]:not([tabindex="-1"])'

/** Tekstvelden: hier is twee- of driemaal snel klikken tekst selecteren, geen woedeklik. */
const TEKSTVELD = 'input, textarea, [contenteditable="true"]'

export type Meter = {
  /** Een nieuw paginabezoek, ook bij navigatie binnen de app. */
  pagina: () => void
  /** Alles wat nog klaarstaat versturen en de luisteraars opruimen. */
  stop: () => void
}

/** Meten we hier? Niet bij een testbrowser, een crawler of op de testomgeving. */
function metenMag(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false
  if (navigator.webdriver) return false
  if (isBot(navigator.userAgent)) return false

  const host = window.location.hostname
  const lokaal =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '[::1]' ||
    host.endsWith('.local')
  // Lokaal meten we niet, behalve als je het zelf aanzet om het te bekijken.
  if (lokaal && process.env.NEXT_PUBLIC_MEET_LOKAAL !== '1') return false

  return true
}

function sessieId(): string | null {
  try {
    const bestaand = window.sessionStorage.getItem(SLEUTEL)
    if (bestaand) return bestaand
    const nieuw = crypto.randomUUID()
    window.sessionStorage.setItem(SLEUTEL, nieuw)
    return nieuw
  } catch {
    // Privémodus of sessionStorage uit: dan meten we niet.
    return null
  }
}

function huidigPad(): string {
  return schoonPad(window.location.pathname, window.location.search)
}

/**
 * Wat er op deze pagina scrolt. Niet het document: de hele site staat in een
 * blok van schermhoogte waarin alleen het midden schuift (zie de lay-out in
 * `src/app/[locale]`). Scrolt er niets, dan paste de pagina in één scherm.
 */
function scrollBak(): Element | null {
  const kandidaten = [
    document.querySelector('[data-oefen-scroll]'),
    document.querySelector('main'),
    document.scrollingElement,
  ]
  for (const bak of kandidaten) {
    if (bak && bak.scrollHeight > bak.clientHeight + 4) return bak
  }
  return null
}

/** De tekst van een knop of link, maar nooit die van een invoerveld. */
function tekstVan(element: Element): string | null {
  const naam = element.tagName.toLowerCase()
  if (naam === 'input' || naam === 'textarea' || naam === 'select') return null
  if (element.getAttribute('contenteditable') === 'true') return null
  if (element.closest(TEKSTVELD)) return null
  return element.textContent
}

export function startMeten(): Meter | null {
  if (!metenMag()) return null

  const gevonden = sessieId()
  if (!gevonden) return null
  const sessie: string = gevonden

  let wachtrij: Gebeurtenis[] = []
  let gestuurdDitUur = 0
  let uurBegin = Date.now()
  let verwijzer = verwijzerDomein(document.referrer, window.location.hostname)
  let utmSource = utmBron(window.location.search)
  let gehaaldeStappen = new Set<number>()
  let kliks: Klikplek[] = []
  let gestopt = false

  function zet(soort: MeetSoort, doel: string | null, waarde: number | null = null) {
    if (gestopt) return
    const pad = huidigPad()
    if (slaPadOver(pad)) return

    if (Date.now() - uurBegin > 3_600_000) {
      uurBegin = Date.now()
      gestuurdDitUur = 0
    }
    if (gestuurdDitUur >= MAX_PER_UUR) return
    gestuurdDitUur += 1

    wachtrij.push({
      sessie_id: sessie,
      soort,
      pad,
      doel,
      waarde,
      // Breedte per gebeurtenis: wie zijn telefoon draait, telt daarna mee
      // als wat hij op dat moment is.
      apparaat: apparaatVanBreedte(window.innerWidth),
      verwijzer,
      utm_source: utmSource,
      // De server bepaalt dit zelf uit het sessiekoekje; de browser kan er
      // niet bij.
      ingelogd: false,
    })
    // De verwijzer en utm_source horen maar bij de eerste gebeurtenis van
    // het tabblad.
    verwijzer = null
    utmSource = null

    if (wachtrij.length >= MAX_PER_ZENDING) verstuur()
  }

  function verstuur() {
    if (!wachtrij.length) return
    const pakket = wachtrij.slice(0, MAX_PER_ZENDING)
    wachtrij = wachtrij.slice(pakket.length)

    const inhoud = JSON.stringify(pakket)
    try {
      if (typeof navigator.sendBeacon === 'function') {
        navigator.sendBeacon(ADRES, new Blob([inhoud], { type: 'application/json' }))
        return
      }
    } catch {
      // Hieronder nog een keer, met fetch.
    }
    void fetch(ADRES, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: inhoud,
      keepalive: true,
    }).catch(() => {})
  }

  function pagina() {
    gehaaldeStappen = new Set()
    zet('pagina', null)
    // De 404-pagina zet een merkteken neer; zo tellen we die zonder de
    // serverlogs te hoeven lezen.
    if (document.querySelector('[data-meet-404]')) zet('fout', '404')
    // Niet meteen kijken hoe hoog de pagina is: na een sprong binnen de app
    // staat de nieuwe inhoud er vaak nog niet. Anders lijkt elke pagina in
    // één scherm te passen.
    window.setTimeout(scrollKijken, 600)
  }

  function klikKijken(gebeurtenis: MouseEvent) {
    const doelElement = gebeurtenis.target
    if (!(doelElement instanceof Element)) return

    const nu: Klikplek = {
      x: gebeurtenis.clientX,
      y: gebeurtenis.clientY,
      t: Date.now(),
      opTekstveld: !!doelElement.closest(TEKSTVELD),
    }
    kliks = [...kliks.filter((klik) => nu.t - klik.t <= 1000), nu]

    const klikbaar = doelElement.closest(KLIKBAAR)
    const gemerkt = doelElement.closest('[data-meet]')
    const naam = klikbaar
      ? doelNaam(
          gemerkt?.getAttribute('data-meet'),
          klikbaar.tagName,
          tekstVan(klikbaar),
        )
      : // Dode klik: alleen het soort element, plus de vaste naam van het
        // blok eromheen als dat er is. Nooit de tekst van de pagina zelf.
        `${doelElement.tagName.toLowerCase()}${
          gemerkt ? `@${gemerkt.getAttribute('data-meet')}` : ''
        }`

    if (isWoedeklik(kliks)) {
      zet('woedeklik', naam)
      kliks = []
      return
    }

    zet(klikbaar ? 'klik' : 'dode_klik', naam)
  }

  function scrollKijken() {
    const bak = scrollBak()

    // Niets te scrollen: de hele pagina paste in één scherm. Eén gebeurtenis
    // is dan genoeg; de overzichten tellen 100 ook mee bij 25, 50 en 75.
    if (!bak) {
      if (gehaaldeStappen.has(100)) return
      for (const stap of SCROLL_STAPPEN) gehaaldeStappen.add(stap)
      zet('scroll', null, 100)
      return
    }

    const deel = Math.round(
      ((bak.scrollTop + bak.clientHeight) / bak.scrollHeight) * 100,
    )
    for (const stap of SCROLL_STAPPEN) {
      if (deel >= stap && !gehaaldeStappen.has(stap)) {
        gehaaldeStappen.add(stap)
        zet('scroll', null, stap)
      }
    }
  }

  let scrollWacht = false
  function scrollGeruis() {
    if (scrollWacht) return
    scrollWacht = true
    window.requestAnimationFrame(() => {
      scrollWacht = false
      scrollKijken()
    })
  }

  function foutKijken(gebeurtenis: ErrorEvent) {
    // Alleen de naam van de fout; de tekst kan van alles bevatten.
    const naam =
      gebeurtenis.error instanceof Error ? gebeurtenis.error.name : 'Error'
    zet('fout', naam)
  }

  function beloftenKijken() {
    zet('fout', 'belofte')
  }

  /**
   * Staat er een aanmelding klaar, dan telt die hier. `melden.ts` geeft hem
   * maar één keer af — of hij nu uit de adresregel kwam of uit het
   * registratieformulier — dus dit kan niet dubbel tellen.
   */
  function registratie() {
    const bewaard = haalKlaargezetteRegistratie()
    if (bewaard === null) return
    zet('registratie', doelVanBewaard(bewaard))
    // Niet wachten op de klok: hierna gaat de leerling vaak meteen weg.
    verstuur()
  }

  function zichtbaarheid() {
    if (document.visibilityState === 'hidden') verstuur()
  }

  document.addEventListener('click', klikKijken, true)
  // In de opvangfase, want scrollen van een blok binnen de pagina borrelt
  // niet omhoog naar window.
  document.addEventListener('scroll', scrollGeruis, { capture: true, passive: true })
  window.addEventListener('error', foutKijken)
  window.addEventListener('unhandledrejection', beloftenKijken)
  document.addEventListener('visibilitychange', zichtbaarheid)
  window.addEventListener('pagehide', verstuur)
  // Een melding uit de site zelf: het registratieformulier zegt dat de
  // aanmelding gelukt is. Wat erbij hoort staat al klaar; `registratie` haalt
  // het op.
  window.addEventListener(EIGEN_MELDING, registratie)

  const klok = window.setInterval(verstuur, WACHTTIJD)

  pagina()

  // Kwam dit tabblad net terug van "Doorgaan met Google" met een gloednieuw
  // account, of meldde het registratieformulier er net een terwijl dit
  // scriptje nog aan het laden was? Dan staat die aanmelding klaar.
  registratie()

  return {
    pagina,
    stop() {
      gestopt = true
      window.clearInterval(klok)
      document.removeEventListener('click', klikKijken, true)
      document.removeEventListener('scroll', scrollGeruis, { capture: true })
      window.removeEventListener('error', foutKijken)
      window.removeEventListener('unhandledrejection', beloftenKijken)
      document.removeEventListener('visibilitychange', zichtbaarheid)
      window.removeEventListener('pagehide', verstuur)
      window.removeEventListener(EIGEN_MELDING, registratie)
      verstuur()
    },
  }
}
