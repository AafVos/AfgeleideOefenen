import { PubliekeKop } from '@/components/publieke-kop'
import { SiteFooter } from '@/components/site-footer'

export default async function StartLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <>
      <PubliekeKop locale={locale} />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {children}
        {/* Op de telefoon scrolt de voettekst hier mee — zie AFG-595. */}
        <SiteFooter className="sm:hidden" />
      </main>
    </>
  )
}
