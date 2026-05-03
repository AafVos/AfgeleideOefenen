/**
 * Voegt de kolom `answer_alternatives text[]` toe aan de `questions` tabel.
 * Run with: npx tsx --env-file=.env.local scripts/add-answer-alternatives.ts
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!url || !key) { console.error('Missing env vars'); process.exit(1) }

const projectRef = url.replace('https://', '').split('.')[0]

async function main() {
  const sql = `ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS answer_alternatives text[] NOT NULL DEFAULT '{}';`

  // Try Supabase Management API (needs personal access token — won't work with service role)
  // Instead, verify the column exists or provide instructions
  const sb = createClient(url, key)
  const { data, error } = await sb.from('questions').select('answer_alternatives').limit(1)

  if (!error) {
    console.log('✅ Kolom answer_alternatives bestaat al!')
    return
  }

  console.log('❌ Kolom bestaat nog niet. Voer dit uit in de Supabase SQL Editor:')
  console.log()
  console.log(sql)
  console.log()
  console.log(`SQL Editor: https://supabase.com/dashboard/project/${projectRef}/sql/new`)
}

main().catch(console.error)
