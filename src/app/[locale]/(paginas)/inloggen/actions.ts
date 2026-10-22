'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { after } from 'next/server'
import { getLocale } from 'next-intl/server'

import { bestemmingNaInloggen } from '@/lib/auth/bestemming'
import { bevestigingsRedirect } from '@/lib/auth/bevestigingslink'
import { gebruikersnaamBestemming, moetNaamVragen } from '@/lib/auth/google'
import { stuurWelkomstmail } from '@/lib/email/welkom'
import { createClient } from '@/lib/supabase/server'
import { zetGekozenGebruikersnaam } from '@/lib/supabase/gebruikersnaam'

/** Sleutels uit de `Login`-teksten; het formulier vertaalt ze. */
export type LoginErrorKey =
  | 'errorMissingFields'
  | 'errorInvalidCredentials'
  | 'errorUnconfirmed'
  | 'errorGeneric'

export type LoginState = {
  errorKey: LoginErrorKey | null
  unconfirmedEmail?: string | null
  /** Het ingevulde e-mailadres teruggeven na een foutmelding, zodat de
   * leerling dat niet opnieuw hoeft te typen. Het wachtwoord gaat hier
   * nooit in mee. */
  values?: { email: string }
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = (formData.get('email') ?? '').toString().trim()
  const password = (formData.get('password') ?? '').toString()

  if (!email || !password) {
    return { errorKey: 'errorMissingFields', values: { email } }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const isUnconfirmed = /email not confirmed/i.test(error.message)
    return {
      errorKey: authErrorKey(error.message),
      unconfirmedEmail: isUnconfirmed ? email : null,
      values: { email },
    }
  }

  // De gebruikersnaam die bij het registreren is ingevuld staat wel in de
  // metagegevens van de auth-rij, maar nog niet in `profiles`: met
  // e-mailbevestiging aan is er op dat moment nog geen sessie om hem mee weg
  // te schrijven (zie registreren/actions.ts). Dat doen we hier, bij de
  // eerste keer inloggen — anders staat er voor altijd een e-mailadres in de
  // bovenbalk in plaats van de naam die de leerling zelf koos.
  //
  // `is('username', null)` houdt het op één query en zorgt ervoor dat een
  // naam die de leerling later bij Instellingen koos, blijft staan.
  if (data.user) {
    await zetGekozenGebruikersnaam(supabase, data.user)
  }

  // Vangnet naast de webhook op e-mailbevestiging: wie daar tussendoor valt,
  // krijgt de welkomstmail alsnog bij de eerste keer inloggen. De functie is
  // idempotent, dus dubbel aanroepen levert geen tweede mail op.
  //
  // Via `after` in plaats van een `await`: de mail kost een admin-call en een
  // Resend-call, en daar hoefde de leerling voorheen op te wachten voordat hij
  // doorgestuurd werd — ook als de mail allang verstuurd was. `after` draait
  // het werk ná de response, en blijft ook lopen als hieronder `redirect` wordt
  // aangeroepen.
  if (data.user) {
    const userId = data.user.id
    after(() => stuurWelkomstmail(userId))
  }

  const locale = await getLocale()
  revalidatePath('/', 'layout')
  // Eerste keer via Google: het formulier "Hoe mogen we je noemen?" hoort
  // op zijn eigen adres. Doen we dat pas in de middleware, dan blijft de
  // browser op het dashboard staan en valt de rondleiding over het formulier.
  if (data.user && moetNaamVragen(data.user)) {
    redirect(gebruikersnaamBestemming('/dashboard', ''))
  }
  redirect(await bestemmingNaInloggen(supabase, formData.get('naar'), locale))
}

function authErrorKey(msg: string): LoginErrorKey {
  if (/invalid login credentials/i.test(msg)) {
    return 'errorInvalidCredentials'
  }
  if (/email not confirmed/i.test(msg)) {
    return 'errorUnconfirmed'
  }
  // Alles wat we niet kennen is Engelse systeemtaal van Supabase. Die hoort
  // niet op het scherm van een leerling; wel in de serverlog.
  console.error('[inloggen] onbekende foutmelding van Supabase:', msg)
  return 'errorGeneric'
}

export async function resendConfirmationAction(
  email: string,
  gekozenPad?: string,
): Promise<{ ok: boolean }> {
  const supabase = await createClient()
  const locale = await getLocale()
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      // Dezelfde bestemming als bij het registreren. Laat je dit weg, dan
      // valt Supabase terug op de voorpagina van de site en komt de leerling
      // na het bevestigen op de homepage terecht. Een gekozen soort som
      // gaat mee; een ander pad niet.
      emailRedirectTo: await bevestigingsRedirect(gekozenPad, locale),
    },
  })
  if (error) {
    console.error('[inloggen] bevestigingsmail opnieuw sturen mislukt:', error.message)
    return { ok: false }
  }
  return { ok: true }
}
