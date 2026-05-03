'use server'

import { redirect } from 'next/navigation'

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

export type OnboardingState = { error: string | null }

export async function completeOnboardingAction(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const grade = formData.get('grade')
  const displayName = formData.get('display_name')
  const mode = formData.get('learning_mode')

  if (typeof grade !== 'string' || !VALID_GRADES.includes(grade as Grade)) {
    return { error: 'Kies eerst je klas.' }
  }
  if (typeof displayName !== 'string' || displayName.trim().length === 0) {
    return { error: 'Vul je voornaam in.' }
  }
  if (typeof mode !== 'string' || !VALID_MODES.includes(mode as LearningMode)) {
    return { error: 'Kies hoe je wilt beginnen.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/inloggen')

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
    return { error: 'Er ging iets mis: ' + error.message }
  }

  switch (mode as LearningMode) {
    case 'guided':
      redirect('/leerpad')
    case 'topic_select':
      redirect('/onboarding/pad')
    case 'diagnostic':
      redirect('/onboarding/toets')
    case 'free':
      redirect('/oefenen')
  }
}
