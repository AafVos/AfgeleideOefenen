import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

// De kop vraagt hier wie er is ingelogd. De startpagina doet dat niet;
// die staat in de andere map, zodat hij van tevoren klaar kan staan.
export default async function PaginasLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <>
      <SiteHeader locale={locale} />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {children}
        {/* Op de telefoon scrolt de voettekst hier mee, binnen dit
            scrollgebied — zie AFG-595. De oefenpagina heeft haar eigen
            scrollgebied en verbergt dit exemplaar zelf (`oefenen-client.tsx`,
            `main:has([data-oefen-volledig])` in `globals.css`). */}
        <SiteFooter className="site-footer-mobiel sm:hidden" />
      </main>
    </>
  )
}
