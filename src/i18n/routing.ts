import { defineRouting } from 'next-intl/routing'

// De site is Nederlandstalig. Er is bewust maar één taal; de `/nl`-prefix in
// de adressen blijft staan omdat links in mails en de instellingen van
// Supabase daarvan uitgaan.
export const routing = defineRouting({
  locales: ['nl'] as const,
  defaultLocale: 'nl',
})

export type Locale = (typeof routing.locales)[number]
