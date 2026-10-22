/** Dezelfde sleutels als `LoginErrorKey` op de site (inloggen/actions.ts). */
export type InlogFoutSleutel =
  | 'errorMissingFields'
  | 'errorInvalidCredentials'
  | 'errorUnconfirmed'
  | 'errorGeneric'

export const inlogFoutmelding: Record<InlogFoutSleutel, string> = {
  errorMissingFields: 'Vul je e-mailadres en wachtwoord in.',
  errorInvalidCredentials: 'Onjuiste combinatie van e-mail en wachtwoord.',
  errorUnconfirmed: 'Je hebt je e-mailadres nog niet bevestigd. Check je inbox.',
  errorGeneric: 'Er ging iets mis bij het inloggen. Probeer het opnieuw.',
}

/**
 * Vertaalt de Engelse foutmelding van Supabase naar een sleutel die op het
 * scherm getoond mag worden. Dezelfde indeling als `authErrorKey` op de
 * site, zodat een leerling via de app dezelfde meldingen ziet als op de
 * site.
 */
export function inlogFoutSleutel(message: string): InlogFoutSleutel {
  if (/invalid login credentials/i.test(message)) {
    return 'errorInvalidCredentials'
  }
  if (/email not confirmed/i.test(message)) {
    return 'errorUnconfirmed'
  }
  return 'errorGeneric'
}
