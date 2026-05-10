/**
 * Find all questions containing "Bepaal" in body or latex_body and strip the
 * natural-language prefix, keeping only the mathematical expression.
 *
 * Preview mode (default): prints changes without writing.
 * Apply mode: APPLY=1 npx tsx scripts/fix-bepaal-questions.ts
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!url || !key) { console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }

const sb = createClient(url, key)
const APPLY = process.env.APPLY === '1'

/**
 * Extract the mathematical part from a question body.
 * Handles patterns like:
 *   "Bepaal f'(x) als f(x) = ..."         → "f(x) = ..."
 *   "Bepaal de afgeleide van f(x) = ..."   → "f(x) = ..."
 *   "Bepaal f'(x) voor f(x) = ..."         → "f(x) = ..."
 *   "Bepaal f'(x) als ..."                 → "..."  (if no f(x) = )
 */
function extractMath(raw: string): string | null {
  const s = raw.trim()
  if (!s.toLowerCase().includes('bepaal')) return null

  // Try "... als f(x) = ..." or "... voor f(x) = ..." or "... van f(x) = ..."
  const afterKw = s.match(/\b(?:als|voor|van)\s+(.+)/i)
  if (afterKw) return afterKw[1].trim()

  // Fallback: drop everything up to and including "Bepaal <something> "
  // e.g. "Bepaal f'(x)" → return the rest after a second word
  const fallback = s.match(/^Bepaal\s+\S+\s+(.+)/i)
  if (fallback) return fallback[1].trim()

  return null
}

async function main() {
  const { data, error } = await sb
    .from('questions')
    .select('id, body, latex_body')
    .or('body.ilike.%Bepaal%,latex_body.ilike.%Bepaal%')
    .order('id')

  if (error) throw error

  const rows = data ?? []
  console.log(`Found ${rows.length} question(s) containing "Bepaal"\n`)

  const updates: Array<{ id: string; body: string; latex_body: string }> = []

  for (const row of rows) {
    const source = row.latex_body?.trim().length ? row.latex_body : row.body
    const math = extractMath(source)

    if (!math) {
      console.log(`[SKIP] id=${row.id}  could not extract math`)
      console.log(`       body:       ${row.body}`)
      console.log(`       latex_body: ${row.latex_body ?? '(null)'}`)
      console.log()
      continue
    }

    console.log(`[UPDATE] id=${row.id}`)
    console.log(`  before: ${source}`)
    console.log(`  after:  ${math}`)
    console.log()

    updates.push({ id: row.id, body: math, latex_body: math })
  }

  if (!APPLY) {
    console.log(`--- DRY RUN: ${updates.length} update(s) queued. Re-run with APPLY=1 to apply. ---`)
    return
  }

  let ok = 0
  for (const u of updates) {
    const { error: uErr } = await sb
      .from('questions')
      .update({ body: u.body, latex_body: u.latex_body })
      .eq('id', u.id)
    if (uErr) {
      console.error(`FAILED id=${u.id}:`, uErr.message)
    } else {
      ok++
    }
  }

  console.log(`Applied ${ok}/${updates.length} updates.`)
}

main().catch((e) => { console.error(e); process.exit(1) })
