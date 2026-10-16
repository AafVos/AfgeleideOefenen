import { PubliekeKop } from '@/components/publieke-kop'
import { SessieKop } from '@/components/sessie-kop'
import { SESSIE_KOP_SCRIPT } from '@/lib/sessie-scherm'

// Voor iedereen hetzelfde bestand. Wie is ingelogd, ziet de eigen kop via
// een script dat vóór de eerste paint draait. Zo hoeft deze pagina niet te
// wachten op de zware server.
export const dynamic = 'force-static'

export default async function OpenbaarLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SESSIE_KOP_SCRIPT }} />
      <div className="kop-zonder-sessie">
        <PubliekeKop locale={locale} />
      </div>
      <div className="kop-met-sessie">
        <SessieKop locale={locale} />
      </div>
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</main>
    </>
  )
}
