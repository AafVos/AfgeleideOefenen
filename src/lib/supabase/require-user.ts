import type { User } from '@supabase/supabase-js'
import { getLocale } from 'next-intl/server'
import { redirect } from 'next/navigation'

import { getCurrentUser } from './request-cache'

/**
 * De ingelogde leerling, of anders weg naar het inlogscherm.
 *
 * Zet dit in de `layout.tsx` van een deel van de site waar je ingelogd voor
 * moet zijn, en niet alleen in de `page.tsx`. Staat er in zo'n map namelijk
 * ook een `loading.tsx`, dan legt Next een Suspense-grens om de `page.tsx`
 * (en om alles wat eronder valt). Zodra het laadscherm vertrekt staat de
 * HTTP-status al vast op 200 en kan `redirect()` alleen nog een
 * `<meta http-equiv="refresh">` in de HTML meesturen: de bezoeker ziet eerst
 * een draaiend wieltje en gaat daarna pas via de browser naar het inlogscherm.
 * Een `layout.tsx` valt buiten die grens, dus daar wordt het wél een echte
 * 307 en komt het laadscherm nooit in beeld.
 *
 * In de `page.tsx` blijft het bruikbaar als "geef me de gebruiker": de
 * aanroep is binnen één request gedeeld, dus hij kost geen tweede vraag aan
 * Supabase, en TypeScript weet daarna dat `user` bestaat.
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    const locale = await getLocale()
    redirect(`/${locale}/inloggen`)
  }
  return user
}
