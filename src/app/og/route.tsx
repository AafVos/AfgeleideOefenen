import { maakDeelplaatje, veiligeDeeltitel } from '@/lib/deelplaatje'

/** Plaatje voor WhatsApp: /og?titel=De+machtsregel */
export function GET(request: Request) {
  const titel = veiligeDeeltitel(new URL(request.url).searchParams.get('titel'))
  return maakDeelplaatje(titel)
}
