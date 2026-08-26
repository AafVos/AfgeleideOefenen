'use server'

import { SITE } from '@/config/site'
import { createClient } from '@/lib/supabase/server'

export type StoomcursusStep =
  | 'welkom'
  | 'onderdelen'
  | 'uitleg'
  | 'vervolg'
  | 'oefenen'

export type OnderdeelVoortgang = {
  klaar?: boolean
  quizIndex?: number
  score?: number
  foutTypes?: number[]
  /** Geel: indexen van de afgeronde tredes uit de lesladder */
  gedaan?: number[]
}

export type StoomcursusData = {
  geel?: OnderdeelVoortgang
  groen?: OnderdeelVoortgang
  rood?: OnderdeelVoortgang
  finale?: { ontgrendeld?: boolean; opgaveIndex?: number }
}

export type StoomcursusProgress = {
  step: StoomcursusStep
  placed: number
  part: number | null
  data: StoomcursusData
}

const VALID_STEPS: StoomcursusStep[] = [
  'welkom',
  'onderdelen',
  'uitleg',
  'vervolg',
  'oefenen',
]

/** Sla op hoe ver de ingelogde gebruiker in de stoomcursus is. */
export async function saveStoomcursusProgress(
  progress: StoomcursusProgress,
): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const step = VALID_STEPS.includes(progress.step) ? progress.step : 'welkom'
  const placed = Math.min(3, Math.max(0, Math.floor(progress.placed ?? 0)))
  const part =
    typeof progress.part === 'number' && progress.part >= 0 && progress.part <= 2
      ? Math.floor(progress.part)
      : null
  const data =
    progress.data && typeof progress.data === 'object' && !Array.isArray(progress.data)
      ? progress.data
      : {}

  await supabase.from('stoomcursus_progress').upsert(
    {
      user_id: user.id,
      site: SITE,
      step,
      placed,
      part,
      data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,site' },
  )
}
