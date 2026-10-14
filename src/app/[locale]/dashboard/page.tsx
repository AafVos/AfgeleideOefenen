import { getTranslations } from 'next-intl/server'

import { bouwDashboardIndeling, bouwOnderwerpVoortgang } from '@/lib/dashboard/indeling'
import { oefenIndeling } from '@/lib/practice/oefenen-indeling'
import { canoniek } from '@/lib/seo'
import { getCurrentProfile } from '@/lib/supabase/request-cache'
import { requireUser } from '@/lib/supabase/require-user'
import { createClient } from '@/lib/supabase/server'

import { berekenReeks, dagSleutel, laatsteDagen, telOefendagen } from './activiteit'
import { DashboardGrid } from './dashboard-grid'
import { eersteOnderdeel, eersteOpgaveId, opgaveLink } from './start'
import type { ChapterData } from './topic-block'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Dashboard' })
  return { title: t('title'), alternates: canoniek(locale, '/dashboard') }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const user = await requireUser()

  // Activiteit uit session_answers_new. De balkjes gaan over de laatste
  // 14 dagen; "Dagen op rij", "Goed beantwoord" en "Vragen" gaan over
  // alles wat de leerling ooit gedaan heeft.
  // De dagen lopen van middernacht tot middernacht in Nederlandse tijd.
  const vandaag = dagSleutel(new Date())
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
    tellingPerDag,
    antwoordTotaal,
    goedTotaal,
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
      .select('cluster_id, status, total_answered, total_correct, correct_streak')
      .eq('user_id', user.id),
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

  const streakDays = berekenReeks(new Set(tellingPerDag.keys()), vandaag)

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
          blocks: blocks ?? [],
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
        activity={activity}
        totalAnswered={totalAnswered}
        totalCorrect={totalCorrect}
        start={start}
        blokIndeling={blokIndeling}
      />
    </div>
  )
}
