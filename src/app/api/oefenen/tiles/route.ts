import { type NextRequest, NextResponse } from 'next/server'

import { loadTilesForClusters } from '@/lib/practice/chapter-overview'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clusterIds = (req.nextUrl.searchParams.get('clusterIds') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const tiles = await loadTilesForClusters(supabase, clusterIds)
  return NextResponse.json(tiles)
}
