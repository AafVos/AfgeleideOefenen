'use server'

import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { redirect } from 'next/navigation'

import { bestemmingNaBevestigen } from '@/lib/auth/bestemming'
import { stuurWelkomstmail } from '@/lib/email/welkom'
import { requireUser } from '@/lib/supabase/require-user'
import { createClient } from '@/lib/supabase/server'

export type NaamFout = 'errorTeLang' | 'errorBezet' | 'errorGeneric'

export type NaamState = {
  errorKey: NaamFout | null
  username?: string
}

export async function kiesNaamAction(_prev: NaamState, formData: FormData): Promise<NaamState> {
  const username = (formData.get('username') ?? '').toString().trim()
  if (username.length > 40) {
    return { errorKey: 'errorTeLang', username }
  }

  const supabase = await createClient()
  const user = await requireUser()

  if (username) {
    const { error } = await supabase.from('profiles').update({ username }).eq('id', user.id)
    if (error) {
      console.error('[gebruikersnaam] opslaan mislukt:', error.message)
      if (error.code === '23505' || /unique|duplicate key/i.test(error.message)) {
        return { errorKey: 'errorBezet', username }
      }
      return { errorKey: 'errorGeneric', username }
    }
  }

  const { error: metaFout } = await supabase.auth.updateUser({
    data: username
      ? { username, google_naam_gevraagd: true }
      : { google_naam_gevraagd: true },
  })
  if (metaFout) {
    console.error('[gebruikersnaam] kon de keuze niet vastleggen:', metaFout.message)
    return { errorKey: 'errorGeneric', username }
  }

  const userId = user.id
  after(() => stuurWelkomstmail(userId))

  revalidatePath('/', 'layout')
  redirect(await bestemmingNaBevestigen(supabase, formData.get('naar')))
}
