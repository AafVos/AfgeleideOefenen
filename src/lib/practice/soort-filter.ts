/** Wat een leerling op de oefenpagina wil zien. */
export type SoortKeuze = 'alles' | 'gewoon' | 'verhaal'

export function leesSoort(waarde: string | null | undefined): SoortKeuze | null {
  if (waarde === 'alles' || waarde === 'gewoon' || waarde === 'verhaal') return waarde
  return null
}

export function teltSoorten(tegels: ReadonlyArray<{ verhaal?: boolean }>): {
  gewoon: number
  verhaal: number
} {
  let gewoon = 0
  let verhaal = 0
  for (const tegel of tegels) {
    if (tegel.verhaal) verhaal += 1
    else gewoon += 1
  }
  return { gewoon, verhaal }
}

/** Alleen tonen als je echt iets te kiezen hebt. */
export function toonSoortFilter(aantal: { gewoon: number; verhaal: number }): boolean {
  return aantal.gewoon > 0 && aantal.verhaal > 0
}

export function pastBijSoort(verhaal: boolean, soort: SoortKeuze): boolean {
  if (soort === 'verhaal') return verhaal
  if (soort === 'gewoon') return !verhaal
  return true
}
