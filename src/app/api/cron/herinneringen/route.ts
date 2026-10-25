import { volgendeOnderdeel } from '@/app/[locale]/(paginas)/dashboard/start'
import {
  bouwDashboardIndeling,
  bouwOnderwerpVoortgang,
  clusterVolgorde,
} from '@/lib/dashboard/indeling'
import { stuurHerinnering } from '@/lib/email/herinnering'
import {
  kiesOntvangers,
  magNogEenRonde,
  type HerinneringKandidaat,
} from '@/lib/herinnering/kiezen'
import { afmeldPad, oefenPad } from '@/lib/herinnering/links'
import { blokkenVanParagrafen } from '@/lib/practice/chapter-overview'
import { oefenIndeling } from '@/lib/practice/oefenen-indeling'
import { gooiAlsFout } from '@/lib/supabase/fouten'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * De nachtelijke taak die de herinneringsmails stuurt (zie AFG-487).
 *
 * De Worker roept dit elke nacht aan met het geheim uit `WEBHOOK_SECRET`,
 * hetzelfde geheim als de webhooks van Supabase. Zie de `scheduled`-ingang in
 * `scripts/statische-cache.mjs` en `triggers.crons` in `wrangler.jsonc`.
 *
 * Met de hand draaien kan ook — handig om het lokaal te bekijken:
 *
 *   curl -X POST -H "x-webhook-secret: $WEBHOOK_SECRET" \
 *     http://localhost:3000/api/cron/herinneringen
 *
 * In het antwoord staan alleen aantallen. Geen e-mailadressen en geen
 * gebruikersnummers: het logboek van een Worker is geen plek voor gegevens
 * van leerlingen.
 */

type Telling = {
  /** Hoeveel leerlingen de herinnering aan hebben staan. */
  aan: number
  /** Hoeveel daarvan vandaag aan de beurt waren. */
  gekozen: number
  verstuurd: number
  /** Niets te oefenen (alles beheerst), geen bevestigd adres, of een fout. */
  overgeslagen: number
  mislukt: number
}

export async function POST(req: Request) {
  const geheim = process.env.WEBHOOK_SECRET
  if (!geheim || req.headers.get('x-webhook-secret') !== geheim) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    return Response.json({ ok: true, ...(await stuurHerinneringen(new Date())) })
  } catch (e) {
    console.error('[herinneringen]', e)
    return Response.json({ error: 'Mislukt' }, { status: 500 })
  }
}

async function stuurHerinneringen(nu: Date): Promise<Telling> {
  const db = createServiceRoleClient()
  const telling: Telling = {
    aan: 0,
    gekozen: 0,
    verstuurd: 0,
    overgeslagen: 0,
    mislukt: 0,
  }

  const { data: profielen, error } = await db
    .from('profiles')
    .select(
      'id, herinnering_mail, herinnering_aan_sinds, herinnering_laatst_op, herinnering_aantal, herinnering_sleutel',
    )
    .eq('herinnering_mail', true)
  gooiAlsFout(error)

  telling.aan = profielen?.length ?? 0
  if (telling.aan === 0) return telling

  // Eerst wie sowieso niets krijgt eruit; daarna pas opzoeken wanneer de rest
  // voor het laatst een antwoord gaf. Dat scheelt een vraag per leerling.
  const zonderActiviteit: HerinneringKandidaat[] = (profielen ?? []).map((rij) => ({
    userId: rij.id,
    aan: rij.herinnering_mail,
    aanSinds: rij.herinnering_aan_sinds,
    laatsteActiviteit: null,
    laatsteHerinnering: rij.herinnering_laatst_op,
    aantal: rij.herinnering_aantal,
  }))

  const kandidaten: HerinneringKandidaat[] = []
  for (const kandidaat of zonderActiviteit) {
    if (!magNogEenRonde(kandidaat, nu)) continue
    kandidaten.push({
      ...kandidaat,
      laatsteActiviteit: await laatsteAntwoord(db, kandidaat.userId),
    })
  }

  const ontvangers = kiesOntvangers(kandidaten, nu)
  telling.gekozen = ontvangers.length
  if (telling.gekozen === 0) return telling

  const sleutels = new Map(
    (profielen ?? []).map((rij) => [rij.id, rij.herinnering_sleutel]),
  )
  const aanbod = await laadAanbod(db)

  for (const ontvanger of ontvangers) {
    const gelukt = await stuurEen(db, ontvanger.userId, sleutels.get(ontvanger.userId), aanbod)
    if (gelukt === 'verstuurd') telling.verstuurd += 1
    else if (gelukt === 'mislukt') telling.mislukt += 1
    else telling.overgeslagen += 1
  }

  return telling
}

type Db = ReturnType<typeof createServiceRoleClient>

/** Wanneer deze leerling voor het laatst een antwoord gaf. */
async function laatsteAntwoord(db: Db, userId: string): Promise<string | null> {
  const { data } = await db
    .from('session_answers_new')
    .select('answered_at, user_sessions_new!inner(user_id)')
    .eq('user_sessions_new.user_id', userId)
    .order('answered_at', { ascending: false })
    .limit(1)
    .returns<{ answered_at: string }[]>()

  return data?.[0]?.answered_at ?? null
}

/**
 * De hele oefenstof, één keer per ronde. Alleen de voortgang verschilt per
 * leerling; de hoofdstukken, paragrafen en soorten sommen zijn voor iedereen
 * hetzelfde.
 */
async function laadAanbod(db: Db) {
  const [chapters, topics, paragraphs, blocks, clusters] = await Promise.all([
    db.from('chapters').select('id, slug, title, order_index').order('order_index'),
    db
      .from('topics_new')
      .select('id, title, slug, chapter_id, order_index, theory_block_id')
      .order('order_index'),
    db
      .from('paragraphs')
      .select('id, chapter_id, slug, label, title, order_index')
      .eq('zichtbaar', true)
      .order('order_index'),
    db
      .from('theory_blocks')
      .select('id, paragraph_id, slug, letter, title, order_index')
      .order('order_index'),
    db
      .from('topic_clusters_new')
      .select('id, title, slug, topic_id, order_index, theory_block_id')
      .order('order_index'),
  ])

  return {
    chapters: chapters.data ?? [],
    topics: topics.data ?? [],
    paragraphs: paragraphs.data ?? [],
    blocks: blokkenVanParagrafen(blocks.data ?? [], paragraphs.data ?? []),
    clusters: clusters.data ?? [],
  }
}

type Aanbod = Awaited<ReturnType<typeof laadAanbod>>

async function stuurEen(
  db: Db,
  userId: string,
  sleutel: string | undefined,
  aanbod: Aanbod,
): Promise<'verstuurd' | 'overgeslagen' | 'mislukt'> {
  if (!sleutel) return 'overgeslagen'

  const { data: voortgang } = await db
    .from('user_progress_new')
    .select('cluster_id, status, correct_streak')
    .eq('user_id', userId)

  const bron = { ...aanbod, voortgang: voortgang ?? [] }
  // Dezelfde volgorde als de kaart "Ga verder met" op het dashboard (AFG-484),
  // zodat de mail naar precies dezelfde soort som wijst.
  const volgorde =
    oefenIndeling() === 'blok' ? clusterVolgorde(bouwDashboardIndeling(bron)) : []
  const onderdeel = volgendeOnderdeel(bouwOnderwerpVoortgang(bron), volgorde)

  // Alles beheerst: dan is er niets om naartoe te wijzen en sturen we niets.
  // Dat vangt meteen de leerling die net zijn laatste hoofdstuk afmaakte.
  if (!onderdeel) return 'overgeslagen'

  const { data, error } = await db.auth.admin.getUserById(userId)
  if (error || !data.user?.email || !data.user.email_confirmed_at) return 'overgeslagen'

  const resultaat = await stuurHerinnering(data.user.email, {
    soortSom: onderdeel.clusterTitle,
    hoofdstuk: onderdeel.chapterTitle,
    onderwerp: onderdeel.topicTitle,
    pad: oefenPad(onderdeel.chapterSlug, onderdeel.topicSlug, onderdeel.clusterSlug),
    afmeldPad: afmeldPad(sleutel),
  })
  if (!resultaat.verstuurd) return 'mislukt'

  // Pas bijwerken als de mail echt weg is. Gaat dit mis, dan krijgt deze
  // leerling morgen hooguit één mail te veel — vervelender dan andersom zou
  // zijn: een stille teller die niemand meer mail laat krijgen.
  const { error: tellerFout } = await db
    .from('profiles')
    .update({
      herinnering_laatst_op: new Date().toISOString(),
      herinnering_aantal: await volgendAantal(db, userId),
    })
    .eq('id', userId)
  if (tellerFout) console.error('[herinneringen] teller bijwerken mislukt', tellerFout.code)

  return 'verstuurd'
}

/** De teller één hoger, uit de database gelezen en niet uit de kandidaatrij. */
async function volgendAantal(db: Db, userId: string): Promise<number> {
  const { data } = await db
    .from('profiles')
    .select('herinnering_aantal')
    .eq('id', userId)
    .maybeSingle()
  return (data?.herinnering_aantal ?? 0) + 1
}
