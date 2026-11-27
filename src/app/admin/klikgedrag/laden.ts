import { fetchAllAuthUsers, fetchAllRows } from '@/app/admin/users/statistieken'
import type { SiteVariant } from '@/config/site'
import { schuilnaam } from '@/lib/meten/schuilnaam'
import { createServiceRoleClient } from '@/lib/supabase/server'

import { korteInvoer, type Antwoord, type LeerlingRij } from './leerlingen'

// =====================================================================
// Gegevens voor de beheerpagina's Klikgedrag, altijd met de service-role.
// Het poortje in `../layout.tsx` laat alleen de beheerder hier binnen.
//
// Gebruikers-id's worden hier alleen gebruikt om de schuilnaam uit te
// rekenen en om de beheerder en testaccounts eruit te laten; ze verlaten
// dit bestand niet.
// =====================================================================

/** Zoveel rijen per keer geeft Supabase hoogstens terug. */
const PAGINA_GROOTTE = 1000

/** Noodrem: meer klikrijen laden we niet in één keer. */
export const MAX_RIJEN = 30000

/** Zoveel id's tegelijk in één `in(...)`, zodat het adres niet te lang wordt. */
const IN_GROOTTE = 150

/** Testaccounts tellen nergens mee (regelboek 7). */
const TEST_DOMEINEN = ['@test.local', '@example.com']

const KLIK_KOLOMMEN =
  'sessie_id, tijdstip, volgnummer, soort, pad, doel, waarde, apparaat, verwijzer, ingelogd, schuilnaam, site'

/** Begin van de periode: middernacht in Nederland, `dagen - 1` dagen terug. */
export function beginVanPeriode(dagen: number): Date {
  const vandaag = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Amsterdam',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  // Middernacht Nederlandse tijd ligt 1 of 2 uur vóór middernacht UTC. Een
  // uur te vroeg beginnen is onschuldig: het telt hoogstens een laat bezoek
  // van gisteravond mee.
  const middernacht = new Date(`${vandaag}T00:00:00Z`)
  middernacht.setUTCHours(middernacht.getUTCHours() - 2)
  middernacht.setUTCDate(middernacht.getUTCDate() - (dagen - 1))
  return middernacht
}

/** Klikrijen vanaf `sinds`, voor één site of (zonder site) voor allebei. */
export async function laadKlikRijen(
  site: SiteVariant | null,
  sinds: Date,
): Promise<{ rijen: LeerlingRij[]; afgekapt: boolean; fout: boolean }> {
  const admin = createServiceRoleClient()
  const rijen: LeerlingRij[] = []
  for (let van = 0; van < MAX_RIJEN; van += PAGINA_GROOTTE) {
    let vraag = admin
      .from('site_gebeurtenissen')
      .select(KLIK_KOLOMMEN)
      .gte('tijdstip', sinds.toISOString())
    if (site) vraag = vraag.eq('site', site)
    const { data, error } = await vraag
      .order('id', { ascending: true })
      .range(van, van + PAGINA_GROOTTE - 1)
    if (error) {
      console.error('Klikgedrag ophalen mislukt', error)
      return { rijen, afgekapt: false, fout: true }
    }
    if (!data || data.length === 0) break
    for (const rij of data) rijen.push(rij)
    if (data.length < PAGINA_GROOTTE) return { rijen, afgekapt: false, fout: false }
  }
  return { rijen, afgekapt: rijen.length >= MAX_RIJEN, fout: false }
}

type AntwoordRij = {
  question_id: string
  is_correct: boolean | null
  hints_used: number
  user_answer: string | null
  answered_at: string
  user_sessions_new: { user_id: string; topic_id: string | null } | null
}

function inStukken<T>(lijst: readonly T[], grootte: number): T[][] {
  const stukken: T[][] = []
  for (let i = 0; i < lijst.length; i += grootte) stukken.push(lijst.slice(i, i + grootte))
  return stukken
}

export type Leerlinggegevens = {
  /** Klikrijen zonder de beheerder en testaccounts. */
  rijen: LeerlingRij[]
  antwoorden: Antwoord[]
  /** Het geheim achter de schuilnaam ontbreekt: antwoorden zijn dan niet te koppelen. */
  zonderGeheim: boolean
  afgekapt: boolean
  fout: boolean
  /** Wanneer dit geladen is, in milliseconden; om "zoveel dagen weg" uit te rekenen. */
  geladenOp: number
}

/**
 * Klikken en oefenantwoorden vanaf `sinds`, met de schuilnaam als enige
 * sleutel. De beheerder en testaccounts vallen eruit, zowel bij de klikken
 * als bij de antwoorden.
 */
export async function laadLeerlinggegevens(
  site: SiteVariant | null,
  sinds: Date,
): Promise<Leerlinggegevens> {
  const geheim = process.env.MEET_SCHUILNAAM_GEHEIM
  const admin = createServiceRoleClient()

  const [klik, antwoordRijen, beheerders, accounts, onderwerpen, soorten] = await Promise.all([
    laadKlikRijen(site, sinds),
    fetchAllRows<AntwoordRij>((van, tot) =>
      admin
        .from('session_answers_new')
        .select('question_id, is_correct, hints_used, user_answer, answered_at, user_sessions_new!inner(user_id, topic_id)')
        .gte('answered_at', sinds.toISOString())
        .order('answered_at', { ascending: true })
        .order('id', { ascending: true })
        .returns<AntwoordRij[]>()
        .range(van, tot),
    ).catch((fout: unknown) => {
      console.error('Oefenantwoorden ophalen mislukt', fout)
      return null
    }),
    admin.from('profiles').select('id').eq('role', 'admin'),
    fetchAllAuthUsers((opts) => admin.auth.admin.listUsers(opts)).catch(() => []),
    admin.from('topics_new').select('id, title'),
    fetchAllRows((van, tot) =>
      admin.from('topic_clusters_new').select('id, title').order('id').range(van, tot),
    ).catch(() => []),
  ])

  // Wie er niet in hoort: de beheerder en testaccounts.
  const uitgesloten = new Set<string>((beheerders.data ?? []).map((p) => p.id))
  for (const account of accounts) {
    const adres = account.email?.toLowerCase() ?? ''
    if (TEST_DOMEINEN.some((domein) => adres.endsWith(domein))) uitgesloten.add(account.id)
  }

  const naamVan = new Map<string, string>()
  const rekenNaam = async (gebruikerId: string) => {
    if (!naamVan.has(gebruikerId)) {
      const naam = await schuilnaam(gebruikerId, geheim)
      if (naam) naamVan.set(gebruikerId, naam)
    }
    return naamVan.get(gebruikerId) ?? null
  }

  const uitgeslotenNamen = new Set<string>()
  for (const id of uitgesloten) {
    const naam = await rekenNaam(id)
    if (naam) uitgeslotenNamen.add(naam)
  }

  // Een tabblad waarin een uitgesloten account voorkomt, valt helemaal weg.
  const uitgeslotenSessies = new Set(
    klik.rijen
      .filter((rij) => rij.schuilnaam && uitgeslotenNamen.has(rij.schuilnaam))
      .map((rij) => rij.sessie_id),
  )
  const rijen = klik.rijen.filter((rij) => !uitgeslotenSessies.has(rij.sessie_id))

  // Soort som per vraag, in stukken opgehaald.
  const rijenMetAntwoord = (antwoordRijen ?? []).filter(
    (rij) => rij.user_sessions_new && !uitgesloten.has(rij.user_sessions_new.user_id),
  )
  const vraagIds = [...new Set(rijenMetAntwoord.map((rij) => rij.question_id))]
  const clusterVanVraag = new Map<string, string>()
  for (const stuk of inStukken(vraagIds, IN_GROOTTE)) {
    const { data } = await admin.from('questions_new').select('id, cluster_id').in('id', stuk)
    for (const vraag of data ?? []) clusterVanVraag.set(vraag.id, vraag.cluster_id)
  }
  const onderwerpTitel = new Map((onderwerpen.data ?? []).map((o) => [o.id, o.title]))
  const soortTitel = new Map(soorten.map((s) => [s.id, s.title]))

  const antwoorden: Antwoord[] = []
  if (geheim) {
    for (const rij of rijenMetAntwoord) {
      const sessie = rij.user_sessions_new!
      const naam = await rekenNaam(sessie.user_id)
      if (!naam) continue
      const cluster = clusterVanVraag.get(rij.question_id)
      antwoorden.push({
        schuilnaam: naam,
        tijdstip: rij.answered_at,
        goed: rij.is_correct,
        hints: rij.hints_used,
        invoer: korteInvoer(rij.user_answer),
        onderwerp: sessie.topic_id ? (onderwerpTitel.get(sessie.topic_id) ?? null) : null,
        soortSom: cluster ? (soortTitel.get(cluster) ?? null) : null,
      })
    }
  }

  return {
    rijen,
    antwoorden,
    zonderGeheim: !geheim,
    afgekapt: klik.afgekapt,
    fout: klik.fout || antwoordRijen === null,
    geladenOp: Date.now(),
  }
}
