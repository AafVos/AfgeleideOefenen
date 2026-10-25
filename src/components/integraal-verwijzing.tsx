/** Verwijzing naar de zustersite. De query laat zien waar de leerling vandaan komt. */
export const INTEGRAAL_URL = 'https://integraaloefenen.nl/?van=afgeleideoefenen'

export function IntegraalVerwijzing({
  tekst,
  className,
  dataMeet,
}: {
  tekst: string
  className?: string
  /** Vaste naam voor de klikmeting, zie src/lib/meten/. */
  dataMeet?: string
}) {
  return (
    <a
      href={INTEGRAAL_URL}
      className={className}
      data-meet={dataMeet}
      rel="noopener noreferrer"
    >
      {tekst}
    </a>
  )
}
