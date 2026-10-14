'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

import { bestemmingNaBevestigen } from '@/lib/auth/bestemming'
import { bevestigingsRedirect } from '@/lib/auth/bevestigingslink'
import { leesHerkomst } from '@/lib/herkomst'
import { createClient } from '@/lib/supabase/server'
import { zetGekozenGebruikersnaam } from '@/lib/supabase/gebruikersnaam'

/** Sleutels uit de `Register`-teksten; het formulier vertaalt ze. */
export type SignupErrorKey =
  | 'errorMissingFields'
  | 'errorPasswordTooShort'
  | 'errorPasswordMismatch'
  | 'errorEmailInUse'
  | 'errorWeakPassword'
  | 'errorGeneric'

export type SignupState = {
  errorKey: SignupErrorKey | null
  noticeKey: 'noticeConfirmEmail' | null
  /** Ingevulde velden terugzetten na een foutmelding */
  values?: { username: string; email: string }
  /** Het e-mailadres waarmee geregistreerd is; nodig voor de knop "opnieuw sturen" */
  email?: string
}

export async function signupAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const email = (formData.get('email') ?? '').toString().trim()
  const password = (formData.get('password') ?? '').toString()
  const username = (formData.get('username') ?? '').toString().trim() || null

  const values = { username: username ?? '', email }

  if (!email || !password) {
    return { errorKey: 'errorMissingFields', noticeKey: null, values }
  }

  if (password.length < 8) {
    return { errorKey: 'errorPasswordTooShort', noticeKey: null, values }
  }

  const passwordConfirm = (formData.get('passwordConfirm') ?? '').toString()
  if (password !== passwordConfirm) {
    return { errorKey: 'errorPasswordMismatch', noticeKey: null, values }
  }

  const supabase = await createClient()
  const locale = await getLocale()

  // Alleen een code uit de lijst. Een onbekende tekst, een naam of een
  // adres gaat niet mee. We zetten hier geen cookie: de code staat alleen
  // in dit formulier, meegestuurd vanaf de aanmeldpagina.
  const herkomst = leesHerkomst(formData.get('van'))
  const metadata: { username?: string; herkomst?: string } = {}
  if (username) metadata.username = username
  if (herkomst) metadata.herkomst = herkomst

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Na het bevestigen: de eerste opgave, of de soort die de leerling
      // al gekozen had. Een ander pad gaat niet mee.
      emailRedirectTo: await bevestigingsRedirect(formData.get('naar'), locale),
      data: Object.keys(metadata).length > 0 ? metadata : undefined,
    },
  })

  if (error) {
    return { errorKey: authErrorKey(error.message), noticeKey: null, values }
  }

  // If email confirmation is enabled, the user isn't logged in yet.
  // Toch proberen: met RLS aan werkt dit niet, maar de callback en
  // login-actie doen later een nieuwe poging. Foutloos als het nu al lukt
  // (bijvoorbeeld als bevestiging uit staat).
  if (data.user) {
    await zetGekozenGebruikersnaam(supabase, data.user)
  }

  if (!data.session) {
    return { errorKey: null, noticeKey: 'noticeConfirmEmail', email }
  }

  revalidatePath('/', 'layout')
  // Bevestigen staat uit: dezelfde bestemming als na de bevestigingsmail.
  redirect(await bestemmingNaBevestigen(supabase, formData.get('naar')))
}

function authErrorKey(msg: string): SignupErrorKey {
  if (/already registered|already exists|already in use/i.test(msg)) {
    return 'errorEmailInUse'
  }
  if (/password should be|weak password/i.test(msg)) {
    return 'errorWeakPassword'
  }
  // Alles wat we niet kennen is Engelse systeemtaal van Supabase. Die hoort
  // niet op het scherm van een leerling; wel in de serverlog.
  console.error('[registreren] onbekende foutmelding van Supabase:', msg)
  return 'errorGeneric'
}
