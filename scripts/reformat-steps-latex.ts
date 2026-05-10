/**
 * Reformat existing question_steps to wrap math expressions with $...$.
 * Preview: npx tsx scripts/reformat-steps-latex.ts
 * Apply:   APPLY=1 npx tsx scripts/reformat-steps-latex.ts
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
const geminiKey = process.env.GEMINI_API_KEY!
if (!url || !key || !geminiKey) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY')
  process.exit(1)
}

const sb = createClient(url, key)
const APPLY = process.env.APPLY === '1'

async function reformatWithGemini(steps: string[]): Promise<string[]> {
  const prompt = `Je bent een wiskundedocent. Herschrijf de onderstaande stapbeschrijvingen zodat alle wiskundige uitdrukkingen zijn omgeven door $...$ (inline LaTeX). De Nederlandse tekst blijft ongewijzigd; alleen de wiskunde wordt omgezet naar LaTeX tussen dollartekens.

Regels:
- Gebruik $...$ (één dollarteken) voor inline wiskunde.
- Gebruik correcte LaTeX: \\frac{}{} voor breuken, \\sqrt{} voor wortels, ^ voor machten met accolades, \\cdot voor vermenigvuldiging.
- Laat de Nederlandse woorden zoals "Identificeer", "Differentieer", "Pas toe" BUITEN de dollartekens.
- Geef ALLEEN een JSON-array terug met de herschreven stappen, in dezelfde volgorde.

Stappen om te herschrijven:
${JSON.stringify(steps, null, 2)}

Antwoord UITSLUITEND met een JSON-array van strings.`

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
      }),
    },
  )

  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`)
  const json = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Empty Gemini response')
  try {
    return JSON.parse(text) as string[]
  } catch {
    // Gemini sometimes emits unescaped backslashes inside JSON strings.
    // Fix by replacing lone backslashes that are not already escaped.
    const fixed = text.replace(/\\(?!["\\/bfnrtu])/g, '\\\\')
    try {
      return JSON.parse(fixed) as string[]
    } catch {
      throw new Error(`Could not parse Gemini JSON:\n${text.slice(0, 500)}`)
    }
  }
}

async function main() {
  const { data, error } = await sb
    .from('question_steps')
    .select('id, step_description')
    .order('id')

  if (error) throw error
  const rows = data ?? []
  console.log(`Found ${rows.length} steps to reformat\n`)

  // Filter out steps that already have $ signs (already formatted)
  const needsFormatting = rows.filter((r) => !r.step_description.includes('$'))
  const alreadyFormatted = rows.length - needsFormatting.length
  console.log(`Already formatted: ${alreadyFormatted}, needs reformatting: ${needsFormatting.length}\n`)

  if (needsFormatting.length === 0) {
    console.log('Nothing to do.')
    return
  }

  // Process in batches of 20 to keep prompt size manageable
  const BATCH = 10
  const updates: Array<{ id: string; step_description: string }> = []

  for (let i = 0; i < needsFormatting.length; i += BATCH) {
    const batch = needsFormatting.slice(i, i + BATCH)
    console.log(`Processing batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(needsFormatting.length / BATCH)}...`)

    const descriptions = batch.map((r) => r.step_description)
    let reformatted: string[]
    try {
      reformatted = await reformatWithGemini(descriptions)
      if (reformatted.length !== batch.length) throw new Error(`length mismatch: got ${reformatted.length}, expected ${batch.length}`)
    } catch (err) {
      console.log(`  Batch failed (${(err as Error).message.slice(0, 80)}), falling back to one-by-one...`)
      reformatted = []
      for (const row of batch) {
        try {
          const [result] = await reformatWithGemini([row.step_description])
          reformatted.push(result)
        } catch {
          console.log(`  SKIP (Gemini error): ${row.step_description.slice(0, 60)}`)
          reformatted.push(row.step_description) // keep original on failure
        }
      }
    }

    for (let j = 0; j < batch.length; j++) {
      const before = batch[j].step_description
      const after = reformatted[j]
      console.log(`  [${i + j + 1}] before: ${before}`)
      console.log(`       after:  ${after}`)
      updates.push({ id: batch[j].id, step_description: after })
    }
    console.log()
  }

  if (!APPLY) {
    console.log(`--- DRY RUN: ${updates.length} update(s) queued. Re-run with APPLY=1 to apply. ---`)
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
  console.log(`Applied ${ok}/${updates.length} updates.`)
}

main().catch((e) => { console.error(e); process.exit(1) })
