import { getLocale } from 'next-intl/server'
import { redirect } from 'next/navigation'

// Leerpad temporarily disabled — bounces to /oefenen.
// To restore: revert this file from git and re-add the nav links.
export default async function LeerpadPage() {
  const locale = await getLocale()
  redirect(`/${locale}/oefenen`)
}
