/**
 * Fix broken LaTeX in question_steps: restore missing backslashes that Gemini dropped.
 * Preview: npx tsx scripts/fix-steps-backslashes.ts
 * Apply:   APPLY=1 npx tsx scripts/fix-steps-backslashes.ts
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!url || !key) { console.error('Missing env vars'); process.exit(1) }

const sb = createClient(url, key)
const APPLY = process.env.APPLY === '1'

// LaTeX command fragments that appear without their leading backslash.
// Lookbehinds are crafted to avoid double-fixing already-correct commands.
const FIXES: Array<[RegExp, string]> = [
  // "rac{" not preceded by "f" or "\" → missing \frac
  [/(?<![f\\])rac\{/g, '\\frac{'],
  // "frac{" not preceded by "\" → missing leading backslash only
  [/(?<!\\)frac\{/g, '\\frac{'],
  // "sqrt{" not preceded by "\"
  [/(?<!\\)sqrt\{/g, '\\sqrt{'],
  // "cdot" not preceded by "\"
  [/(?<!\\)cdot/g, '\\cdot'],
  // "left(" not preceded by "\"
  [/(?<!\\)left\(/g, '\\left('],
  // "ight)" — missing \right; "ight" preceded by "r" means it's already correct
  [/(?<!r)ight\)/g, '\\right)'],
  // "rightarrow" not preceded by "\"
  [/(?<!\\)rightarrow/g, '\\rightarrow'],
  // trig/log functions not preceded by "\"
  [/(?<!\\)sin\(/g, '\\sin('],
  [/(?<!\\)cos\(/g, '\\cos('],
  [/(?<!\\)ln\(/g, '\\ln('],
]

function fixLatex(s: string): string {
  let out = s
  for (const [pattern, replacement] of FIXES) {
    out = out.replace(pattern, replacement)
  }
  return out
}

async function main() {
  const { data, error } = await sb
    .from('question_steps')
    .select('id, step_description')
    .order('id')
  if (error) throw error

  const rows = data ?? []
  const updates: Array<{ id: string; step_description: string }> = []

  for (const row of rows) {
    const fixed = fixLatex(row.step_description)
    if (fixed !== row.step_description) {
      console.log(`[FIX] ${row.step_description}`)
      console.log(`   →  ${fixed}`)
      console.log()
      updates.push({ id: row.id, step_description: fixed })
    }
  }

  console.log(`${updates.length} step(s) need fixing out of ${rows.length} total\n`)

  if (!APPLY) {
    console.log('--- DRY RUN. Re-run with APPLY=1 to apply. ---')
    return
  }

  let ok = 0
  for (const u of updates) {
    const { error: uErr } = await sb
      .from('question_steps')
      .update({ step_description: u.step_description })
      .eq('id', u.id)
    if (uErr) console.error(`FAILED id=${u.id}:`, uErr.message)
    else ok++
  }
  console.log(`Applied ${ok}/${updates.length} fixes.`)
}

main().catch((e) => { console.error(e); process.exit(1) })
