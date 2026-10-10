/**
 * De testpostbus van de lokale Supabase.
 *
 * Mail die de lokale Supabase verstuurt gaat nergens heen: hij blijft hangen
 * in Mailpit, een postbus in Docker die standaard op poort 54324 draait. Via
 * de HTTP-API daarvan kunnen de tests de bevestigingsmail en de resetmail
 * echt openmaken en op de link klikken, net als een leerling.
 *
 * Let op: dit is alleen de mail die Supabase zelf stuurt (bevestigen,
 * wachtwoord opnieuw). De welkomstmail van de site gaat via Resend en komt
 * hier dus niet aan — zie `src/lib/email/welkom.test.ts` voor die inhoud.
 */

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
 * Wacht tot er mail voor dit adres binnen is en geef de nieuwste terug.
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
