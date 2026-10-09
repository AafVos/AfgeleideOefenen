'use server'

import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

import { createClient } from '@/lib/supabase/server'
import type { Grade, LearningMode } from '@/lib/supabase/types'

const VALID_GRADES: Grade[] = [
  'vwo_4',
  'vwo_5',
  'vwo_6',
  'examen_training',
  'anders',
]
const VALID_MODES: LearningMode[] = [
  'guided',
  'topic_select',
  'diagnostic',
  'free',
]

/** Sleutels uit de `Onboarding`-teksten; de wizard vertaalt ze. */
export type OnboardingErrorKey =
  | 'errorNoGrade'
  | 'errorNoName'
  | 'errorNoMode'
  | 'errorGeneric'

export type OnboardingState = { errorKey: OnboardingErrorKey | null }

export async function completeOnboardingAction(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const grade = formData.get('grade')
  const displayName = formData.get('display_name')
  const mode = formData.get('learning_mode')

  if (typeof grade !== 'string' || !VALID_GRADES.includes(grade as Grade)) {
    return { errorKey: 'errorNoGrade' }
  }
  if (typeof displayName !== 'string' || displayName.trim().length === 0) {
    return { errorKey: 'errorNoName' }
  }
  if (typeof mode !== 'string' || !VALID_MODES.includes(mode as LearningMode)) {
    return { errorKey: 'errorNoMode' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const locale = await getLocale()
  if (!user) redirect(`/${locale}/inloggen`)

  const { error } = await supabase
    .from('profiles')
    .update({
      grade: grade as Grade,
      display_name: displayName.trim().slice(0, 50),
      learning_mode: mode as LearningMode,
      onboarded_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    // De technische tekst gaat naar de serverlog, niet naar de leerling.
    console.error('[onboarding] profiel opslaan mislukt:', error.message)
    return { errorKey: 'errorGeneric' }
  }

  redirect(`/${locale}/oefenen`)
}
