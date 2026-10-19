'use client'

import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

import { IntegraalVerwijzing } from '@/components/integraal-verwijzing'
import { KlikLink } from '@/components/klik-link'
import { cn } from '@/components/ui'

import { telBeheerst, type DashboardIndeling } from '@/lib/dashboard/indeling'

import { HerinneringKaart } from './herinnering-kaart'
import { ChapterBlock, NieuwHoofdstukBlock, type ChapterData } from './topic-block'

export type ActivityDay = { date: string; count: number }

/**
 * De eerste opgave van een leerling die nog niets gemaakt heeft. Is dit
 * gevuld, dan staat er een startblok bovenaan in plaats van vier nullen en
 * een leeg staafdiagram (zie AFG-114).
 */
export type StartData = {
  href: string
  chapterId: string
  chapterTitle: string
  topicTitle: string
}

/**
 * De eerstvolgende soort som die nog niet beheerst is, voor een leerling die
 * al eerder geoefend heeft (zie AFG-484).
 */
export type VerderData = {
  href: string
  clusterTitle: string
  chapterTitle: string
  topicTitle: string
}

/**
 * Een soort som die al weken beheerst is en sindsdien niet meer langskwam
 * (zie AFG-488). Vrijblijvend: negeren mag, en de status verandert er niet
 * van.
 */
export type OpfrisData = {
  href: string
  clusterTitle: string
}

export function DashboardGrid({
  chapterData,
  streakDays = 0,
  streakAtRisk = false,
  activity = [],
  totalAnswered = 0,
  totalCorrect = 0,
  start = null,
  verder = null,
  opfrissen = null,
  blokIndeling = null,
  herinneringAan = false,
}: {
  chapterData: ChapterData[]
  streakDays?: number
  /** Reeks loopt af als er vandaag niet geoefend wordt (zie AFG-486). */
  streakAtRisk?: boolean
  activity?: ActivityDay[]
  totalAnswered?: number
  totalCorrect?: number
  start?: StartData | null
  verder?: VerderData | null
  /** Iets wat al lang beheerst is en wel weer eens langs mag (AFG-488). */
  opfrissen?: OpfrisData | null
  /** Staat de herinneringsmail aan? (zie AFG-487) */
  herinneringAan?: boolean
  /** Boekindeling. Ontbreekt hij, dan blijft de lijst per onderwerp. */
  blokIndeling?: DashboardIndeling | null
}) {
  const t = useTranslations('Dashboard')
  const allClusters = useMemo(
    () => chapterData.flatMap((ch) => ch.topics.flatMap((t) => t.clusters)),
    [chapterData],
  )
  const { mastered, total, pct: pctOverall } = telBeheerst(allClusters)
  const pctAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0
  const hoofdstukBeheerst = blokIndeling
    ? blokIndeling.hoofdstukken.some((chapter) => {
        const { mastered, total } = telBeheerst(chapter.clusters)
        return total > 0 && mastered === total
      })
    : chapterData.some((chapter) => {
        const clusters = chapter.topics.flatMap((onderwerp) => onderwerp.clusters)
        return clusters.length > 0 && clusters.every((cluster) => cluster.isKnown)
      })

  return (
    <>
      {!start && verder && <VerderCard verder={verder} />}
      {!start && !verder && total > 0 && mastered === total && (
        <div className="mb-5 rounded-xl border border-accent/30 bg-accent-light px-4 py-3">
          <p className="text-sm text-text">{t('verderKlaar')}</p>
        </div>
      )}
      {!start && opfrissen && <OpfrisRegel opfrissen={opfrissen} />}

      {start ? (
        <StartCard start={start} />
      ) : (
        /* KPI row */
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiHero
            pct={pctOverall}
            mastered={mastered}
            total={total}
            label={t('statMastered')}
            sub={t('statMasteredSub')}
          />
          <StreakCard days={streakDays} atRisk={streakAtRisk} />
          <KpiCard label={t('statCorrect')} value={`${pctAccuracy}%`} tone="accent" />
          <KpiCard
            label={t('statAnswered')}
            value={String(totalAnswered)}
            sub={t('statAnsweredSub')}
            tone="neutral"
          />
        </div>
      )}

      {hoofdstukBeheerst && (
        <div className="mb-5 rounded-xl border border-border bg-surface px-4 py-3">
          <IntegraalVerwijzing
            tekst={t('integraal')}
            className="inline-flex min-h-11 items-center text-sm text-accent underline-offset-2 hover:underline"
          />
        </div>
      )}

      {/* 2-column layout */}
      <div className={cn('grid gap-4', !start && 'lg:grid-cols-3')}>
        {/* Left: topic accordions */}
        <div className={cn(!start && 'lg:col-span-2')}>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">
            {start ? t('chapterOverview') : t('chapterProgress')}
          </p>
          <div className="space-y-2">
            {blokIndeling
              ? blokIndeling.hoofdstukken.map((chapter) => (
                  <NieuwHoofdstukBlock
                    key={chapter.id}
                    chapter={chapter}
                    defaultOpen={chapter.id === start?.chapterId}
                  />
                ))
              : chapterData.map((chapter) => (
                  <ChapterBlock
                    key={chapter.id}
                    chapter={chapter}
                    defaultOpen={chapter.id === start?.chapterId}
                  />
                ))}
          </div>
        </div>

        {/* Right: activity */}
        {!start && (
          <div className="space-y-3">
            <ActivityCard activity={activity} />
            <HerinneringKaart aan={herinneringAan} />
          </div>
        )}
      </div>
    </>
  )
}

/**
 * Het startblok voor een kersverse leerling: één knop die meteen een opgave
 * op het scherm zet. Zonder dit blok moest hij eerst zelf een hoofdstuk
 * openklappen en een onderwerp aanklikken, en dat deed bijna niemand.
 */
function StartCard({ start }: { start: StartData }) {
  const t = useTranslations('Dashboard')
  return (
    <div className="mb-5 rounded-xl border border-accent/30 bg-accent-light p-5">
      <p className="font-serif text-xl text-text sm:text-2xl">{t('startTitle')}</p>
      <p className="mt-1 max-w-prose text-sm text-text-muted">{t('startBody')}</p>
      <KlikLink
        href={start.href}
        bezigTekst="Eerste opgave openen"
        className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-accent px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-accent/90"
      >
        {t('startButton')}
      </KlikLink>
      <p className="mt-3 text-xs text-text-muted">
        {t('startWhere', {
          chapter: start.chapterTitle,
          topic: start.topicTitle,
        })}
      </p>
    </div>
  )
}

/**
 * De kaart bovenaan voor een leerling die al eerder geoefend heeft: één knop
 * naar de eerstvolgende soort som die hij nog niet beheerst. Zonder deze kaart
 * moest hij bij elke terugkomst zelf de hele boom van /oefenen doorzoeken om
 * te zien waar hij gebleven was (zie AFG-484).
 */
function VerderCard({ verder }: { verder: VerderData }) {
  const t = useTranslations('Dashboard')
  return (
    <div className="mb-5 rounded-xl border border-accent/30 bg-accent-light p-5">
      <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
        {t('verderLabel')}
      </p>
      <p className="mt-1 font-serif text-xl text-text sm:text-2xl">{verder.clusterTitle}</p>
      <KlikLink
        href={verder.href}
        bezigTekst="Opgave openen"
        className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-accent px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-accent/90"
      >
        {t('verderButton')}
      </KlikLink>
      <p className="mt-3 text-xs text-text-muted">
        {t('verderWhere', {
          chapter: verder.chapterTitle,
          topic: verder.topicTitle,
        })}
      </p>
    </div>
  )
}

/**
 * "Even opfrissen?" — één rustige regel over een soort som die al weken
 * beheerst is en sindsdien niet meer langskwam (zie AFG-488). Bewust zonder
 * knop in de accentkleur en zonder wegklikken: wie hem negeert, is hem na de
 * volgende oefenbeurt vanzelf kwijt, en zijn beheersing blijft hoe dan ook
 * staan.
 */
function OpfrisRegel({ opfrissen }: { opfrissen: OpfrisData }) {
  const t = useTranslations('Dashboard')
  return (
    <div className="mb-5 rounded-xl border border-border bg-surface px-4 py-3">
      <p className="text-sm text-text">
        {t('opfrissenTekst', { cluster: opfrissen.clusterTitle })}
      </p>
      <p className="mt-1 text-xs text-text-muted">{t('opfrissenUitleg')}</p>
      <KlikLink
        href={opfrissen.href}
        bezigTekst="Opgave openen"
        className="inline-flex min-h-11 items-center text-sm text-accent underline-offset-2 hover:underline"
      >
        {t('opfrissenLink')}
      </KlikLink>
    </div>
  )
}

function KpiHero({
  pct,
  mastered,
  total,
  label,
  sub,
}: {
  pct: number
  mastered: number
  total: number
  label: string
  sub: string
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        <Ring pct={pct} size={60} stroke={7} />
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted">{label}</div>
          <div className="font-serif text-xl text-text">
            {mastered} <span className="text-text-muted">/ {total}</span>
          </div>
          <div className="text-xs text-text-muted">{sub}</div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: string
  sub?: string
  tone: 'accent' | 'neutral'
}) {
  const valueColor = tone === 'accent' ? 'text-accent' : 'text-text'
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted">{label}</div>
      <div className={cn('font-serif text-2xl', valueColor)}>{value}</div>
      {sub && <div className="text-xs text-text-muted">{sub}</div>}
    </div>
  )
}

/**
 * De "dagen op rij"-tegel: net iets opvallender dan de andere drie KPI's,
 * want dit is het "kom terug"-signaal en geen zomaar een getal (zie
 * AFG-486). Loopt de reeks gevaar (nog niet geoefend vandaag), dan komt
 * daar een rustige regel bij — geen paniekmakerij, gewoon een tekstregel.
 */
function StreakCard({ days, atRisk }: { days: number; atRisk: boolean }) {
  const t = useTranslations('Dashboard')
  return (
    <div className="rounded-xl border border-accent-2/30 bg-accent-2-light p-4">
      <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
        {t('statStreak')}
      </div>
      <div className="font-serif text-3xl text-accent-2">{days}</div>
      {atRisk && <p className="mt-1 text-xs text-text-muted">{t('streakAtRisk')}</p>}
    </div>
  )
}

function ActivityCard({ activity }: { activity: ActivityDay[] }) {
  const t = useTranslations('Dashboard')
  const max = Math.max(1, ...activity.map((a) => a.count))
  const padded =
    activity.length >= 14
      ? activity.slice(-14)
      : [...Array(14 - activity.length).fill({ date: '', count: 0 } as ActivityDay), ...activity]
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
        {t('activityTitle')}
      </div>
      <div className="mt-3 flex h-20 items-end gap-1">
        {padded.map((d, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${(d.count / max) * 92 + 6}%`,
              backgroundColor:
                d.count === 0 ? 'var(--color-border)' : `rgba(45, 106, 79, ${0.25 + (d.count / max) * 0.65})`,
            }}
            title={d.date ? `${d.date}: ${d.count}` : undefined}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-text-muted">
        <span>{t('activityStart')}</span>
        <span>{t('activityEnd')}</span>
      </div>
    </div>
  )
}

function Ring({ pct, size = 92, stroke = 9 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = (pct / 100) * c
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-surface-2)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--font-serif)"
        fontSize={size * 0.26}
        fill="var(--color-text)"
      >
        {pct}%
      </text>
    </svg>
  )
}
