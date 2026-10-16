import lijst from '../../../scripts/worker-omgeving.json'

export type WorkerVariabele = {
  naam: string
  doel: string
  wanneer: 'bouw' | 'runtime'
  geheim: boolean
  verplicht: boolean
}

export const WORKER_VARIABELEN = lijst as WorkerVariabele[]

/** Namen van verplichte geheimen die op de Worker moeten staan. Geen waarden. */
export function verplichteRuntimeGeheimen(): string[] {
  return WORKER_VARIABELEN.filter(
    (regel) => regel.verplicht && regel.geheim && regel.wanneer === 'runtime',
  ).map((regel) => regel.naam)
}

/** Welke verplichte namen ontbreken. `aanwezig` bevat alleen namen. */
export function ontbrekendeGeheimen(aanwezig: readonly string[]): string[] {
  const bekend = new Set(aanwezig)
  return verplichteRuntimeGeheimen().filter((naam) => !bekend.has(naam))
}

/**
 * Namen die op deze omgeving leeg zijn, terwijl het seintje bij een nieuwe
 * gebruiker ze nodig heeft. Alleen de namen, nooit de waarde.
 */
export function seintjeOntbreekt(
  env: Record<string, string | undefined> = process.env,
): string[] {
  return ['NOTIFY_EMAIL', 'RESEND_API_KEY'].filter((naam) => !env[naam]?.trim())
}
