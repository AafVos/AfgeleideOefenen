/** Verwijzing naar de zustersite. De query laat zien waar de leerling vandaan komt. */
export const INTEGRAAL_URL = 'https://integraaloefenen.nl/?van=afgeleideoefenen'

export function IntegraalVerwijzing({
  tekst,
  className,
}: {
  tekst: string
  className?: string
}) {
  return (
    <a
      href={INTEGRAAL_URL}
      className={className}
      rel="noopener noreferrer"
    >
      {tekst}
    </a>
  )
}
