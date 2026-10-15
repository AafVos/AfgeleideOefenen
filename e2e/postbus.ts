/**
 * De twee testpostbussen van de e2e-tests. Allebei lokaal: er gaat nooit een
 * mail echt de deur uit.
 *
 * 1. De mail die **Supabase** stuurt (bevestigen, wachtwoord opnieuw) blijft
 *    hangen in Mailpit, een postbus in Docker die standaard op poort 54324
 *    draait. Via de HTTP-API daarvan kunnen de tests die mail echt openmaken
 *    en op de link klikken, net als een leerling. Daarvoor is `wachtOpMail`.
 * 2. De mail die **de site zelf** stuurt (de welkomstmail) gaat via Resend.
 *    `scripts/e2e.mjs` start een neppe Resend (`scripts/nep-resend.mjs`) en
 *    wijst `RESEND_BASE_URL` daarheen; daar haalt `wachtOpSitemail` hem op.
 *
 * Een test ziet er bij allebei hetzelfde uit: wachten tot er mail voor een
 * adres ligt, en dan `linkUitMail` erop loslaten.
 */

/* ---------- De testpostbus van Supabase (Mailpit) ---------- */

/** Waar de postbus luistert. `scripts/e2e.mjs` vult dit uit `supabase status`. */
function postbus(): string {
  return process.env.E2E_POSTBUS_URL ?? 'http://127.0.0.1:54324'
}

/** Eén mail, met alleen wat een test nodig heeft. */
export type Mail = {
  /** Het nummer dat de postbus eraan gaf; om een nieuwe mail van een oude te onderscheiden. */
  id: string
  onderwerp: string
  afzenderNaam: string
  afzenderAdres: string
  aan: string[]
  html: string
  tekst: string
}

type MailpitRegel = {
  ID: string
  Subject: string
  From: { Name?: string; Address?: string } | null
  To: { Address?: string }[] | null
  Created: string
}

async function haal<T>(pad: string, init?: RequestInit): Promise<T> {
  let antwoord: Response
  try {
    antwoord = await fetch(`${postbus()}${pad}`, init)
  } catch (e) {
    throw new Error(
      `De testpostbus op ${postbus()} reageert niet. Draait de lokale Supabase ` +
        `met de mailcontainer erbij? (${(e as Error).message})`,
    )
  }
  if (!antwoord.ok) {
    throw new Error(`Testpostbus gaf ${antwoord.status} op ${pad}.`)
  }
  return (await antwoord.json()) as T
}

/**
 * Gooit alle mail weg. Draait vóór de tests, zodat een mail van een vorige
 * run nooit voor een verse aangezien kan worden.
 */
export async function leegPostbus(): Promise<void> {
  const antwoord = await fetch(`${postbus()}/api/v1/messages`, {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: '{}',
  })
  if (!antwoord.ok) {
    throw new Error(`Postbus leegmaken mislukte: ${antwoord.status}.`)
  }
}

/**
 * Wacht tot er mail van Supabase voor dit adres binnen is en geef de nieuwste
 * terug.
 *
 * Supabase verstuurt de mail nadat het formulier al antwoord heeft gegeven,
 * dus even wachten hoort erbij — net als bij een leerling die zijn inbox
 * ververst.
 */
export async function wachtOpMail(
  adres: string,
  opties: {
    onderwerpBevat?: string
    /** Wacht op een ándere mail dan deze; voor "stuur de mail opnieuw". */
    andersDan?: string
    wachtMs?: number
  } = {},
): Promise<Mail> {
  const grens = Date.now() + (opties.wachtMs ?? 20_000)
  let laatsteFout = `er kwam niets binnen voor ${adres}`

  while (Date.now() < grens) {
    const { messages } = await haal<{ messages: MailpitRegel[] }>(
      '/api/v1/messages?limit=200',
    )

    const voorMij = (messages ?? []).filter(
      (m) =>
        (m.To ?? []).some(
          (t) => t.Address?.toLowerCase() === adres.toLowerCase(),
        ) && m.ID !== opties.andersDan,
    )
    const passend = opties.onderwerpBevat
      ? voorMij.filter((m) => m.Subject?.includes(opties.onderwerpBevat!))
      : voorMij

    if (passend.length > 0) {
      // De nieuwste, want na "stuur de mail opnieuw" liggen er twee met
      // hetzelfde onderwerp en werkt alleen de laatste link nog.
      passend.sort((a, b) => Date.parse(b.Created) - Date.parse(a.Created))
      return await openMail(passend[0].ID)
    }
    if (voorMij.length > 0 && opties.onderwerpBevat) {
      laatsteFout =
        `er kwam wel mail voor ${adres}, maar geen onderwerp met ` +
        `"${opties.onderwerpBevat}" erin. Gevonden: ` +
        voorMij.map((m) => `"${m.Subject}"`).join(', ')
    }

    await new Promise((klaar) => setTimeout(klaar, 300))
  }

  throw new Error(`Geen mail in de testpostbus: ${laatsteFout}.`)
}

async function openMail(id: string): Promise<Mail> {
  const mail = await haal<{
    Subject: string
    From: { Name?: string; Address?: string } | null
    To: { Address?: string }[] | null
    HTML?: string
    Text?: string
  }>(`/api/v1/message/${id}`)

  return {
    id,
    onderwerp: mail.Subject ?? '',
    afzenderNaam: mail.From?.Name ?? '',
    afzenderAdres: mail.From?.Address ?? '',
    aan: (mail.To ?? []).map((t) => t.Address ?? ''),
    html: mail.HTML ?? '',
    tekst: mail.Text ?? '',
  }
}

/* ---------- De postbus van de site zelf (de neppe Resend) ---------- */

/** Waar het neppe postkantoor luistert. `scripts/e2e.mjs` vult dit. */
function sitepostbus(): string {
  const url = process.env.RESEND_BASE_URL
  if (!url) {
    throw new Error(
      'RESEND_BASE_URL ontbreekt. Start de tests met `npm run test:e2e`; dat zet de neppe Resend klaar.',
    )
  }
  return url
}

/** Eén mail zoals `scripts/nep-resend.mjs` hem bewaart. */
type NepResendRegel = {
  id: string
  ontvangenOp: string
  from: string
  to: string[]
  subject: string
  html: string
  text: string
}

async function uitSitepostbus(): Promise<NepResendRegel[]> {
  let antwoord: Response
  try {
    antwoord = await fetch(`${sitepostbus()}/opgevangen`)
  } catch (e) {
    throw new Error(
      `Het neppe postkantoor op ${sitepostbus()} reageert niet. Start de tests ` +
        `met \`npm run test:e2e\`. (${(e as Error).message})`,
    )
  }
  if (!antwoord.ok) {
    throw new Error(`Het neppe postkantoor gaf ${antwoord.status}.`)
  }
  const { mails } = (await antwoord.json()) as { mails: NepResendRegel[] }
  return mails ?? []
}

/** `AfgeleideOefenen <no-reply@...>` uit elkaar halen in naam en adres. */
function alsMail(regel: NepResendRegel): Mail {
  const afzender = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(regel.from ?? '')
  return {
    id: regel.id,
    onderwerp: regel.subject ?? '',
    afzenderNaam: afzender?.[1] ?? '',
    afzenderAdres: afzender?.[2] ?? regel.from ?? '',
    aan: regel.to ?? [],
    html: regel.html ?? '',
    tekst: regel.text ?? '',
  }
}

/** Gooit alle mail van de site weg. Draait vóór de tests. */
export async function leegSitepostbus(): Promise<void> {
  const antwoord = await fetch(`${sitepostbus()}/opgevangen`, { method: 'DELETE' })
  if (!antwoord.ok) {
    throw new Error(`Het neppe postkantoor leegmaken mislukte: ${antwoord.status}.`)
  }
}

/**
 * Alle mail die de site naar dit adres stuurde, oudste eerst. Voor "en er
 * kwam er geen tweede bij".
 */
export async function sitemails(
  adres: string,
  opties: { onderwerpBevat?: string } = {},
): Promise<Mail[]> {
  return (await uitSitepostbus())
    .filter((m) =>
      (m.to ?? []).some((t) => t.toLowerCase() === adres.toLowerCase()),
    )
    .filter((m) => !opties.onderwerpBevat || m.subject?.includes(opties.onderwerpBevat))
    .map(alsMail)
}

/**
 * Wacht tot de site mail naar dit adres gestuurd heeft en geef de nieuwste
 * terug.
 *
 * De welkomstmail gaat na het antwoord aan de leerling de deur uit (`after()`
 * in `src/app/[locale]/(paginas)/inloggen/actions.ts`), dus even wachten hoort erbij.
 */
export async function wachtOpSitemail(
  adres: string,
  opties: { onderwerpBevat?: string; wachtMs?: number } = {},
): Promise<Mail> {
  const grens = Date.now() + (opties.wachtMs ?? 20_000)
  let laatsteFout = `de site stuurde niets naar ${adres}`

  while (Date.now() < grens) {
    const voorMij = await sitemails(adres)
    const passend = opties.onderwerpBevat
      ? voorMij.filter((m) => m.onderwerp.includes(opties.onderwerpBevat!))
      : voorMij

    if (passend.length > 0) return passend[passend.length - 1]

    if (voorMij.length > 0 && opties.onderwerpBevat) {
      laatsteFout =
        `de site stuurde wel mail naar ${adres}, maar geen onderwerp met ` +
        `"${opties.onderwerpBevat}" erin. Gevonden: ` +
        voorMij.map((m) => `"${m.onderwerp}"`).join(', ')
    }

    await new Promise((klaar) => setTimeout(klaar, 300))
  }

  throw new Error(`Geen mail van de site: ${laatsteFout}.`)
}

/* ---------- Voor allebei de postbussen ---------- */

/**
 * De link uit een mail waar een leerling op klikt.
 *
 * `bevat` kiest de juiste link: in de bevestigingsmail staat behalve de knop
 * ook een "werkt de knop niet"-link, en die wijzen allebei naar hetzelfde.
 */
export function linkUitMail(mail: Mail, bevat: string): string {
  const links = [...mail.html.matchAll(/href="([^"]+)"/g)]
    .map((m) => ontsnap(m[1]))
    .filter((url) => url.includes(bevat))

  if (links.length === 0) {
    throw new Error(
      `Geen link met "${bevat}" in de mail "${mail.onderwerp}". ` +
        `Gevonden links: ${[...mail.html.matchAll(/href="([^"]+)"/g)]
          .map((m) => m[1])
          .join(', ')}`,
    )
  }
  return links[0]
}

/** `&amp;` en vrienden terug naar gewone tekens; anders klopt de link niet. */
function ontsnap(waarde: string): string {
  return waarde
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}
