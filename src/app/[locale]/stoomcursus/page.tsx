import { getTranslations } from 'next-intl/server'

import { SITE } from '@/config/site'
import { createClient } from '@/lib/supabase/server'

import type { StoomcursusProgress } from './actions'
import { StoomcursusClient } from './stoomcursus-client'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Stoomcursus' })
  return { title: t('title'), description: t('description') }
}

export default async function StoomcursusPage() {
  const t = await getTranslations('Stoomcursus')

  // Ingelogd: voortgang uit het account; anders valt de client terug op localStorage
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let initialProgress: StoomcursusProgress | null = null
  if (user) {
    const { data } = await supabase
      .from('stoomcursus_progress')
      .select('step, placed, part, data')
      .eq('user_id', user.id)
      .eq('site', SITE)
      .maybeSingle()
    if (data) {
      initialProgress = {
        ...data,
        data: (data.data ?? {}) as StoomcursusProgress['data'],
      }
    }
  }

  return (
    <StoomcursusClient
      accountPersist={!!user}
      initialProgress={initialProgress}
      labels={{
        eyebrow: t('eyebrow'),
        welcome: t('welcome'),
        start: t('start'),
        partsIntro: t('partsIntro'),
        next: t('next'),
        back: t('back'),
        exampleEyebrow: t('exampleEyebrow'),
        exampleGiven: t('exampleGiven'),
        exampleQuestion: t('exampleQuestion'),
        howSolve: t('howSolve'),
        answerEyebrow: t('answerEyebrow'),
        answerBody: t('answerBody'),
        methodTitle: t('methodTitle'),
        methodBody: t('methodBody'),
        choosePrompt: t('choosePrompt'),
        hubStatusNieuw: t('hubStatusNieuw'),
        hubStatusBezig: t('hubStatusBezig'),
        hubStatusKlaar: t('hubStatusKlaar'),
        hubFinaleTitle: t('hubFinaleTitle'),
        hubFinaleLocked: t('hubFinaleLocked'),
        hubFinaleSoon: t('hubFinaleSoon'),
        oplosTitle: t('oplosTitle'),
        oplosIntro: t('oplosIntro'),
        oplosGroepen: (
          [
            { groep: 1, items: [1, 2] },
            { groep: 2, items: [3, 4, 12] },
            { groep: 3, items: [5, 13] },
            { groep: 4, items: [6, 7, 8] },
            { groep: 5, items: [9, 10, 11] },
          ] as const
        ).map(({ groep, items }) => ({
          title: t(`oplosGroep${groep}Title` as 'oplosGroep1Title'),
          items: items.map((n) => ({
            // t.raw: als/dan bevatten LaTeX-accolades (e^{2x}, {}^g\log) die ICU niet mag parsen
            als: t.raw(`oplos${n}Als` as 'oplos1Als') as string,
            dan: t.raw(`oplos${n}Dan` as 'oplos1Dan') as string,
            stappen: t.raw(`oplos${n}Stappen` as 'oplos1Stappen') as string[],
          })),
        })),
        groenTitle: t('groenTitle'),
        groenIntro: t('groenIntro'),
        groenGroepen: (
          [
            { groep: 1, items: [1, 2] },
            { groep: 2, items: [3, 4, 5] },
            { groep: 3, items: [6, 7, 8] },
            { groep: 4, items: [9, 10, 11, 12, 13] },
          ] as const
        ).map(({ groep, items }) => ({
          title: t(`groenGroep${groep}Title` as 'groenGroep1Title'),
          items: items.map((n) => ({
            // t.raw: als/dan bevatten LaTeX-accolades (x^{n-1}, \frac, e^{...}) die ICU niet mag parsen
            als: t.raw(`groen${n}Als` as 'groen1Als') as string,
            dan: t.raw(`groen${n}Dan` as 'groen1Dan') as string,
            stappen: t.raw(`groen${n}Stappen` as 'groen1Stappen') as string[],
          })),
        })),
        parts: ([1, 2, 3] as const).map((n) => {
          const title = t(`part${n}Title` as 'part1Title')
          return {
            label: t('partLabel', { number: n }),
            title,
            body: t(`part${n}Body` as 'part1Body'),
            oefenPlaceholder: t('oefenPlaceholder', { title }),
          }
        }),
      }}
    />
  )
}
