/**
 * De schakelaar waarmee een apparaat zichzelf buiten de klikmeting zet.
 *
 * Een bezoek aan een adres als `/nl?meten=uit` zet een vlag in
 * `localStorage`; zolang die er staat, stuurt `meter.ts` niets voor dit
 * apparaat (zie `metenStaatUit`, gebruikt in `metenMag`). `?meten=aan` zet
 * hem terug. Bewust `localStorage` en geen koekje: de vlag hoort bij dit
 * apparaat, niet bij een bezoek aan de server, en de klikmeting belooft op de
 * privacypagina dat ze geen koekjes gebruikt.
 *
 * De beheerder (`profiles.role === 'admin'`) krijgt deze vlag automatisch
 * gezet zodra ze inlogt, op elk apparaat waar dat gebeurt — zie
 * `zetMetenUitVoorBeheerder` en `src/components/beheerder-meting.tsx`.
 */

/** De parameter in de adresregel: `meten=uit` of `meten=aan`. */
export const METEN_PARAMETER = 'meten'

/** De vlag in `localStorage`; alleen of hij er staat telt, niet de waarde. */
export const METEN_UIT_SLEUTEL = 'meet-uit'

export type MetenActie = 'uit' | 'aan'

function isMetenActie(waarde: string): waarde is MetenActie {
  return waarde === 'uit' || waarde === 'aan'
}

/**
 * Wat er uit de adresregel komt en wat erin overblijft. Los van de browser,
 * zodat het te testen is zonder er een te starten.
 *
 * Onbekende waarden (niet `uit` of `aan`) worden, net als bij de
 * registratieparameter in `melden.ts`, toch uit de adresregel gehaald — die
 * hoort daar niet te blijven staan — maar veranderen niets aan de vlag.
 */
export function schakelaarUitZoekreeks(zoekreeks: string): {
  actie: MetenActie | null
  zoek: string
} {
  const parameters = new URLSearchParams(zoekreeks.replace(/^\?/, ''))
  const waarde = parameters.get(METEN_PARAMETER)
  if (waarde === null) return { actie: null, zoek: zoekreeks }

  parameters.delete(METEN_PARAMETER)
  const rest = parameters.toString()
  return {
    actie: isMetenActie(waarde) ? waarde : null,
    zoek: rest ? `?${rest}` : '',
  }
}

/** Het stukje `localStorage` dat we gebruiken, los van de browser. */
export type Bewaarplek = {
  getItem(sleutel: string): string | null
  setItem(sleutel: string, waarde: string): void
  removeItem(sleutel: string): void
}

/** Staat de vlag erin? */
export function metenUitgeschakeld(opslag: Bewaarplek): boolean {
  return opslag.getItem(METEN_UIT_SLEUTEL) !== null
}

export function zetMetenUit(opslag: Bewaarplek): void {
  opslag.setItem(METEN_UIT_SLEUTEL, '1')
}

export function zetMetenAan(opslag: Bewaarplek): void {
  opslag.removeItem(METEN_UIT_SLEUTEL)
}

/** `localStorage`, of niets als de browser er niet bij kan (privémodus, geen browser). */
function lokaleOpslag(): Bewaarplek | null {
  try {
    if (typeof window === 'undefined') return null
    return window.localStorage ?? null
  } catch {
    return null
  }
}

/** Staat de vlag aan op dit apparaat? Dit vraagt `metenMag` bij elke meting. */
export function metenStaatUit(): boolean {
  const opslag = lokaleOpslag()
  if (!opslag) return false
  try {
    return metenUitgeschakeld(opslag)
  } catch {
    return false
  }
}

/**
 * Pikt `?meten=uit` of `?meten=aan` uit de adresregel, zet de vlag in
 * `localStorage` en haalt de parameter meteen weg. Geeft de actie terug zodat
 * de aanroeper één keer een bevestiging kan tonen; `null` als er niets te
 * doen was (geen parameter, of een onbekende waarde).
 */
export function pikMetenSchakelaarUitAdres(): MetenActie | null {
  if (typeof window === 'undefined') return null

  const { actie, zoek } = schakelaarUitZoekreeks(window.location.search)
  if (actie === null) return null

  // Weg uit de adresregel: hij hoort daar niet te blijven staan.
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${zoek}${window.location.hash}`,
  )

  const opslag = lokaleOpslag()
  if (opslag) {
    try {
      if (actie === 'uit') zetMetenUit(opslag)
      else zetMetenAan(opslag)
    } catch {
      // Vol of geweigerd: dan verandert er niets aan de meting.
    }
  }

  return actie
}

/**
 * Zet de vlag voor de beheerder, op dit apparaat. Stil als het niet lukt
 * (privémodus, `localStorage` uit): dan telt dit apparaat voorlopig nog mee.
 */
export function zetMetenUitVoorBeheerder(): void {
  const opslag = lokaleOpslag()
  if (!opslag) return
  try {
    zetMetenUit(opslag)
  } catch {
    // Vol of geweigerd.
  }
}
