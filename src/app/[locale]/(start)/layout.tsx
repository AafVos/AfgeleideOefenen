import { PubliekeKop } from '@/components/publieke-kop'

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
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</main>
    </>
  )
}
