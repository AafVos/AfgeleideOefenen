/**
 * De regels achter "vraag een uitlegvideo aan bij een examenvraag".
 *
 * Alles hier is pure functie, los van het formulier en los van de database,
 * zodat het te testen is. Het formulier staat op `/nl/video-aanvragen`, het
 * opslaan en mailen in `actions.ts` daarnaast.
 */

/** De examenjaren in de keuzelijst, nieuwste eerst. */
export const EXAMENJAREN = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018] as const

/** Tijdvak 1, 2 of 3. Tijdvak 3 bestaat sinds 2020. */
export const TIJDVAKKEN = [1, 2, 3] as const

/** Hoeveel aanvragen één bezoeker per dag mag doen. */
export const MAX_PER_DAG = 3

/** Telwoorden tot tien, voor in de foutmelding bij een volle teller. */
const TELWOORDEN = ['nul', 'één', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien']

/** MAX_PER_DAG voluit in woorden, zodat de foutmelding meeverandert met de constante. */
export const MAX_PER_DAG_IN_WOORDEN = TELWOORDEN[MAX_PER_DAG] ?? String(MAX_PER_DAG)

/** Hoe lang die teller meetelt. */
export const TELLER_UREN = 24

/**
 * Naam van het verborgen veld dat een echte leerling nooit invult. Vult een
 * robot het wel in, dan doen we alsof het gelukt is en slaan we niets op.
 */
export const HONEYPOT_VELD = 'website'

export type VideoAanvraag = {
  jaar: number
  tijdvak: number
  vraagnummer: string
  toelichting: string | null
  /** Alleen gevuld als de leerling zelf bericht wil. */
  email: string | null
  magMailen: boolean
}

export type AanvraagUitslag =
  | { ok: true; aanvraag: VideoAanvraag }
  | { ok: false; fout: string }

const MAX_TOELICHTING = 1000
const MAX_EMAIL = 320

/**
 * Het vraagnummer zoals het op het examen staat: een getal, eventueel met een
 * letter erachter (6, 12a). Geen spaties, geen tekst.
 */
const VRAAGNUMMER = /^\d{1,2}[a-z]?$/

/** Heel ruim: één apenstaartje, een punt erachter, geen spaties. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Haalt tekst uit het formulier, zonder spaties aan het begin en het eind. */
function tekst(waarde: FormDataEntryValue | null): string {
  return typeof waarde === 'string' ? waarde.trim() : ''
}

/**
 * Leest het formulier na. Elke melding is een hele zin in de je-vorm, want de
 * leerling ziet hem meteen boven het formulier.
 */
export function leesAanvraag(formData: FormData): AanvraagUitslag {
  const jaar = Number(tekst(formData.get('jaar')))
  if (!(EXAMENJAREN as readonly number[]).includes(jaar)) {
    return { ok: false, fout: 'Kies een examenjaar uit de lijst.' }
  }

  const tijdvak = Number(tekst(formData.get('tijdvak')))
  if (!(TIJDVAKKEN as readonly number[]).includes(tijdvak)) {
    return { ok: false, fout: 'Kies tijdvak 1, 2 of 3.' }
  }

  const vraagnummer = tekst(formData.get('vraagnummer')).toLowerCase()
  if (!vraagnummer) {
    return { ok: false, fout: 'Vul in om welke vraag het gaat.' }
  }
  if (!VRAAGNUMMER.test(vraagnummer)) {
    return {
      ok: false,
      fout: 'Zet er alleen het vraagnummer neer, zoals 6 of 12a.',
    }
  }

  const toelichting = tekst(formData.get('toelichting'))
  if (toelichting.length > MAX_TOELICHTING) {
    return { ok: false, fout: 'Je toelichting is te lang (max 1000 tekens).' }
  }

  const magMailen = tekst(formData.get('magMailen')) === 'ja'
  const email = tekst(formData.get('email'))

  if (email && !magMailen) {
    return {
      ok: false,
      fout: 'Zet het vinkje aan als je bericht wilt, of haal je e-mailadres weg.',
    }
  }
  if (magMailen && !email) {
    return { ok: false, fout: 'Vul je e-mailadres in, of haal het vinkje weg.' }
  }
  if (email && (email.length > MAX_EMAIL || !EMAIL.test(email))) {
    return { ok: false, fout: 'Dat e-mailadres klopt niet. Kijk het even na.' }
  }

  return {
    ok: true,
    aanvraag: {
      jaar,
      tijdvak,
      vraagnummer,
      toelichting: toelichting || null,
      email: magMailen && email ? email : null,
      magMailen: magMailen && !!email,
    },
  }
}

/** Heeft een robot het verborgen veld ingevuld? */
export function isRobot(formData: FormData): boolean {
  return tekst(formData.get(HONEYPOT_VELD)) !== ''
}

/** Hoe de examenvraag in een regel heet: "2024 · tijdvak 1 · vraag 6". */
export function vraagRegel(aanvraag: Pick<VideoAanvraag, 'jaar' | 'tijdvak' | 'vraagnummer'>) {
  return `${aanvraag.jaar} · tijdvak ${aanvraag.tijdvak} · vraag ${aanvraag.vraagnummer}`
}

/**
 * De teller in het koekje: hoeveel aanvragen er al zijn en wanneer de eerste
 * was. `"2|1760000000000"`. Onleesbaar of te oud, dan begint hij opnieuw.
 */
export type Teller = { aantal: number; begonnenOp: number }

export function leesTeller(ruw: string | undefined, nu: number): Teller {
  const leeg: Teller = { aantal: 0, begonnenOp: nu }
  if (!ruw) return leeg

  const [aantalTekst, begonnenTekst] = ruw.split('|')
  const aantal = Number(aantalTekst)
  const begonnenOp = Number(begonnenTekst)
  if (!Number.isFinite(aantal) || !Number.isFinite(begonnenOp)) return leeg
  if (aantal < 0 || begonnenOp > nu) return leeg
  if (nu - begonnenOp > TELLER_UREN * 60 * 60 * 1000) return leeg

  return { aantal, begonnenOp }
}

export function schrijfTeller(teller: Teller): string {
  return `${teller.aantal}|${teller.begonnenOp}`
}

export function isVol(teller: Teller): boolean {
  return teller.aantal >= MAX_PER_DAG
}
