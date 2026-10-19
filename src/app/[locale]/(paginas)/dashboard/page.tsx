import { getTranslations } from 'next-intl/server'

import {
  bouwDashboardIndeling,
  bouwOnderwerpVoortgang,
  clusterVolgorde,
} from '@/lib/dashboard/indeling'
import { blokkenVanParagrafen, loadLaatsteAntwoorden } from '@/lib/practice/chapter-overview'
import { oefenIndeling } from '@/lib/practice/oefenen-indeling'
import { canoniek, nietIndexeren } from '@/lib/seo'
import { getCurrentProfile } from '@/lib/supabase/request-cache'
import { requireUser } from '@/lib/supabase/require-user'
import { createClient } from '@/lib/supabase/server'

import { berekenReeks, dagSleutel, laatsteDagen, reeksLooptAf, telOefendagen } from './activiteit'
import { DashboardGrid } from './dashboard-grid'
import { onderdeelVanCluster, opfrisCluster, opfrisGrens } from './opfrissen'
import {
  eersteOnderdeel,
  eersteOpgaveId,
  opgaveLink,
  volgendeOnderdeel,
  volgendeOpgaveId,
} from './start'
import type { ChapterData } from './topic-block'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Dashboard' })
  return {
    title: t('title'),
    alternates: canoniek(locale, '/dashboard'),
    robots: nietIndexeren(),
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const user = await requireUser()

  // Activiteit uit session_answers_new. De balkjes gaan over de laatste
  // 14 dagen; "Dagen op rij", "Goed beantwoord" en "Vragen" gaan over
  // alles wat de leerling ooit gedaan heeft.
  // De dagen lopen van middernacht tot middernacht in Nederlandse tijd.
  const nu = new Date()
  const vandaag = dagSleutel(nu)
  const veertienDagen = laatsteDagen(vandaag, 14)

  // "Ik weet het niet" staat met een lege is_correct in de database: de
  // leerling heeft de opgave niet beantwoord, dus die telt hier nergens mee
  // en trekt het percentage goed niet omlaag (zie AFG-102).
  const beantwoord = () =>
    supabase
      .from('session_answers_new')
      .select('answered_at, user_sessions_new!inner(user_id)')
      .eq('user_sessions_new.user_id', user.id)
      .not('is_correct', 'is', null)

  const [
    t,
    profile,
    { data: chapters },
    { data: topics },
    { data: paragraphs },
    { data: blocks },
    { data: clusters },
    { data: progressRows },
    { data: recenteSessies },
    tellingPerDag,
    antwoordTotaal,
    goedTotaal,
    laatsteAntwoorden,
  ] = await Promise.all([
    getTranslations('Dashboard'),
    // Registreren bewaart de naam in `username`. Oudere profielen hebben
    // alleen `display_name`; die kolom wordt bij aanmelden niet meer gevuld.
    getCurrentProfile(),
    supabase.from('chapters').select('id, slug, title, order_index').order('order_index'),
    supabase
      .from('topics_new')
      .select('id, title, slug, chapter_id, order_index, theory_block_id')
      .order('order_index'),
    supabase
      .from('paragraphs')
      .select('id, chapter_id, slug, label, title, order_index')
      .eq('zichtbaar', true)
      .order('order_index'),
    supabase
      .from('theory_blocks')
      .select('id, paragraph_id, slug, letter, title, order_index')
      .order('order_index'),
    supabase
      .from('topic_clusters_new')
      .select('id, title, slug, topic_id, order_index, theory_block_id')
      .order('order_index'),
    supabase
      .from('user_progress_new')
      .select('cluster_id, status, correct_streak, mastered_at')
      .eq('user_id', user.id),
    // Welke soorten sommen er de afgelopen weken nog geoefend zijn, voor de
    // regel "Even opfrissen?" (zie AFG-488). Per soort som komt er hoogstens
    // één sessie per dag bij, dus deze lijst blijft klein; de limiet is een
    // noodrem. Een zelf-toets hangt niet aan één soort som en telt niet mee.
    supabase
      .from('user_sessions_new')
      .select('cluster_id')
      .eq('user_id', user.id)
      .not('cluster_id', 'is', null)
      .gte('started_at', opfrisGrens(nu).toISOString())
      .order('started_at', { ascending: false })
      .limit(1000),
    telOefendagen(
      (van, tot) =>
        beantwoord()
          // Nieuw naar oud, met de id erbij zodat antwoorden met hetzelfde
          // tijdstip niet tussen de pagina's door schuiven.
          .order('answered_at', { ascending: false })
          .order('id', { ascending: false })
          .returns<{ answered_at: string }[]>()
          .range(van, tot),
      vandaag,
      veertienDagen[0],
    ),
    supabase
      .from('session_answers_new')
      .select('user_sessions_new!inner(user_id)', { count: 'exact', head: true })
      .eq('user_sessions_new.user_id', user.id)
      .not('is_correct', 'is', null),
    supabase
      .from('session_answers_new')
      .select('user_sessions_new!inner(user_id)', { count: 'exact', head: true })
      .eq('user_sessions_new.user_id', user.id)
      .eq('is_correct', true),
    // Het laatste goed/fout per opgave, voor de knop "Ga verder met". Gaat
    // dat mis, dan blijft het dashboard gewoon staan en wijst de knop naar de
    // makkelijkste opgave van die soort som.
    loadLaatsteAntwoorden(supabase).catch(() => new Map<string, boolean>()),
  ])

  const gekozenNaam = profile?.username?.trim()
  const oudeNaam = profile?.display_name?.trim().split(/\s+/)[0]?.trim()
  const firstName = gekozenNaam || oudeNaam || null

  const totalAnswered = antwoordTotaal.count ?? 0
  const totalCorrect = goedTotaal.count ?? 0

  const activity = veertienDagen.map((date) => ({
    date,
    count: tellingPerDag.get(date) ?? 0,
  }))

  const dagenMetAntwoord = new Set(tellingPerDag.keys())
  const streakDays = berekenReeks(dagenMetAntwoord, vandaag)
  // "Loss aversion": wie een reeks heeft maar vandaag nog niet oefende, krijgt
  // een rustig regeltje dat hij hem kan kwijtraken (zie AFG-486). Geen
  // pushmelding of mail, alleen zichtbaar voor wie al op het dashboard is.
  const streakAtRisk = reeksLooptAf(dagenMetAntwoord, vandaag)

  const bron = {
    chapters: chapters ?? [],
    topics: topics ?? [],
    clusters: clusters ?? [],
    voortgang: progressRows ?? [],
  }
  // De oude lijst blijft nodig voor de startknop, en voor de schakelaar
  // die de indeling per onderwerp weer aanzet.
  const chapterData: ChapterData[] = bouwOnderwerpVoortgang(bron)
  const blokIndeling =
    oefenIndeling() === 'blok'
      ? bouwDashboardIndeling({
          ...bron,
          paragraphs: paragraphs ?? [],
          blocks: blokkenVanParagrafen(blocks ?? [], paragraphs ?? []),
        })
      : null

  // Een leerling die nog nooit iets gemaakt heeft, krijgt geen lege
  // voortgangsrapportage maar één knop die meteen zijn eerste opgave opent
  // (zie AFG-114). "Ik weet het niet" telt niet mee in `totalAnswered`, maar
  // zet wel een voortgangsregel neer: wie die al heeft, is dus begonnen.
  const nogNietsGedaan =
    totalAnswered === 0 && (progressRows?.length ?? 0) === 0
  const onderdeel = nogNietsGedaan ? eersteOnderdeel(chapterData) : null
  const eersteVraagId = onderdeel
    ? await eersteOpgaveId(supabase, onderdeel.clusterId)
    : null

  // Staat er geen enkele opgave klaar, dan beloven we er ook geen: dan krijgt
  // de leerling gewoon het normale dashboard te zien.
  const start =
    onderdeel && eersteVraagId
      ? {
          href: opgaveLink(onderdeel, eersteVraagId),
          chapterId: onderdeel.chapterId,
          chapterTitle: onderdeel.chapterTitle,
          topicTitle: onderdeel.topicTitle,
        }
      : null

  // Wie al begonnen is, krijgt één knop naar de eerstvolgende soort som die
  // hij nog niet beheerst (zie AFG-484). Zonder die knop moest hij bij elke
  // terugkomst zelf de hele boom van /oefenen doorzoeken.
  const verderOnderdeel = nogNietsGedaan
    ? null
    : volgendeOnderdeel(chapterData, blokIndeling ? clusterVolgorde(blokIndeling) : [])
  const verderVraagId = verderOnderdeel
    ? await volgendeOpgaveId(supabase, verderOnderdeel.clusterId, laatsteAntwoorden)
    : null
  const verder =
    verderOnderdeel && verderVraagId
      ? {
          href: opgaveLink(verderOnderdeel, verderVraagId),
          clusterTitle: verderOnderdeel.clusterTitle,
          chapterTitle: verderOnderdeel.chapterTitle,
          topicTitle: verderOnderdeel.topicTitle,
        }
      : null

  // Een zachte uitnodiging om iets op te frissen wat al weken beheerst is en
  // sindsdien niet meer langskwam (zie AFG-488). De status verandert hier
  // niet van: beheerst blijft beheerst, wat de leerling ook antwoordt.
  const opfrisClusterId = nogNietsGedaan
    ? null
    : opfrisCluster(
        progressRows ?? [],
        new Set((recenteSessies ?? []).map((sessie) => sessie.cluster_id!)),
        nu,
      )
  const opfrisOnderdeel = opfrisClusterId
    ? onderdeelVanCluster(chapterData, opfrisClusterId)
    : null
  const opfrisVraagId = opfrisOnderdeel
    ? await volgendeOpgaveId(supabase, opfrisOnderdeel.clusterId, laatsteAntwoorden)
    : null
  const opfrissen =
    opfrisOnderdeel && opfrisVraagId
      ? {
          href: opgaveLink(opfrisOnderdeel, opfrisVraagId),
          clusterTitle: opfrisOnderdeel.clusterTitle,
        }
      : null

  return (
    <div className="mx-auto max-w-[1400px] px-3 py-6">
      <div className="mb-2">
        <h1 className="font-serif text-2xl text-text">
          {firstName
            ? t('greetingWithName', { name: firstName })
            : t('progressTitle')}
        </h1>
      </div>

      <DashboardGrid
        chapterData={chapterData}
        streakDays={streakDays}
        streakAtRisk={streakAtRisk}
        activity={activity}
        totalAnswered={totalAnswered}
        totalCorrect={totalCorrect}
        start={start}
        verder={verder}
        opfrissen={opfrissen}
        blokIndeling={blokIndeling}
        herinneringAan={profile?.herinnering_mail ?? false}
      />
    </div>
  )
}
