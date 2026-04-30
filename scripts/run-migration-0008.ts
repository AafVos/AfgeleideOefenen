/**
 * Migration 0008: Redesign quotiëntregel clusters + 27 new questions
 * Run with: npx tsx scripts/run-migration-0008.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const sb = createClient(url, key)

async function main() {
  // ── 1. Get topic id ──────────────────────────────────────────────────────
  const { data: topic, error: te } = await sb
    .from('topics')
    .select('id')
    .eq('slug', 'quotientregel')
    .single()
  if (te || !topic) { console.error('Topic not found', te); process.exit(1) }
  const topicId = topic.id
  console.log('topic id:', topicId)

  // ── 2. Delete old clusters (questions cascade) ───────────────────────────
  const { error: dce } = await sb
    .from('topic_clusters')
    .delete()
    .in('slug', ['lineaire_noemer', 'kwadratische_noemer', 'macht_in_noemer', 'wortel'])
    .eq('topic_id', topicId)
  if (dce) { console.error('Delete clusters failed', dce); process.exit(1) }
  console.log('Deleted old clusters')

  // ── 3. Insert new clusters ───────────────────────────────────────────────
  const clusters = [
    { topic_id: topicId, slug: 'makkelijk',      title: 'Makkelijk',          order_index: 1 },
    { topic_id: topicId, slug: 'polynoom',        title: 'Polynoom',           order_index: 2 },
    { topic_id: topicId, slug: 'combi_somregel',  title: 'Combi met somregel', order_index: 3 },
  ]
  const { error: ice } = await sb.from('topic_clusters').upsert(clusters, { onConflict: 'topic_id,slug' })
  if (ice) { console.error('Insert clusters failed', ice); process.exit(1) }
  console.log('Inserted new clusters')

  // Fetch cluster ids
  const { data: cls, error: clse } = await sb
    .from('topic_clusters')
    .select('id, slug')
    .eq('topic_id', topicId)
  if (clse || !cls) { console.error('Fetch clusters failed', clse); process.exit(1) }
  const clusterMap = Object.fromEntries(cls.map(c => [c.slug, c.id]))
  console.log('Cluster map:', clusterMap)

  // ── 4. Extra root cause ──────────────────────────────────────────────────
  const { error: rce } = await sb.from('root_causes').upsert([{
    topic_id: topicId,
    slug: 'quotientregel.combi_somregel',
    description: 'Andere term(en) naast de breuk apart differentiëren (somregel)',
  }], { onConflict: 'slug' })
  if (rce) { console.error('Insert root cause failed', rce); process.exit(1) }
  console.log('Inserted root cause')

  // ── 5. Delete old questions ──────────────────────────────────────────────
  const { error: dqe } = await sb
    .from('questions')
    .delete()
    .eq('topic_id', topicId)
    .eq('is_ai_generated', false)
  if (dqe) { console.error('Delete questions failed', dqe); process.exit(1) }
  console.log('Deleted old questions')

  // ── 6. Insert 27 new questions ───────────────────────────────────────────
  const Q = (slug: string, body: string, latexBody: string, answer: string, latexAnswer: string,
             diff: number, tags: string[], order: number) => ({
    topic_id: topicId,
    cluster_id: clusterMap[slug],
    body, latex_body: latexBody,
    answer, latex_answer: latexAnswer,
    difficulty: diff,
    root_cause_tags: tags,
    is_ai_generated: false,
    order_index: order,
  })

  const questions = [
    // ── makkelijk diff 1 ──────────────────────────────────────────────────
    Q('makkelijk', "Bepaal f'(x) als f(x) = 1/(x+1)", 'f(x) = \\dfrac{1}{x+1}',
      '-1/(x+1)^2', '\\dfrac{-1}{(x+1)^{2}}', 1,
      ['quotientregel.tn_identificeren','quotientregel.formule_volgorde','quotientregel.noemer_kwadraat'], 1),
    Q('makkelijk', "Bepaal f'(x) als f(x) = x/(x+1)", 'f(x) = \\dfrac{x}{x+1}',
      '1/(x+1)^2', '\\dfrac{1}{(x+1)^{2}}', 1,
      ['quotientregel.formule_volgorde','quotientregel.noemer_kwadraat'], 2),
    Q('makkelijk', "Bepaal f'(x) als f(x) = (x+1)/(x−1)", 'f(x) = \\dfrac{x+1}{x-1}',
      '-2/(x-1)^2', '\\dfrac{-2}{(x-1)^{2}}', 1,
      ['quotientregel.formule_volgorde','quotientregel.noemer_kwadraat'], 3),
    Q('makkelijk', "Bepaal f'(x) als f(x) = 2x/(x+3)", 'f(x) = \\dfrac{2x}{x+3}',
      '6/(x+3)^2', '\\dfrac{6}{(x+3)^{2}}', 1,
      ['quotientregel.formule_volgorde','quotientregel.noemer_kwadraat'], 4),
    Q('makkelijk', "Bepaal f'(x) als f(x) = (x−2)/(x+3)", 'f(x) = \\dfrac{x-2}{x+3}',
      '5/(x+3)^2', '\\dfrac{5}{(x+3)^{2}}', 1,
      ['quotientregel.formule_volgorde','quotientregel.noemer_kwadraat'], 5),
    // ── makkelijk diff 2 ──────────────────────────────────────────────────
    Q('makkelijk', "Bepaal f'(x) als f(x) = (2x+3)/(x−1)", 'f(x) = \\dfrac{2x+3}{x-1}',
      '-5/(x-1)^2', '\\dfrac{-5}{(x-1)^{2}}', 2,
      ['quotientregel.formule_volgorde','quotientregel.noemer_kwadraat'], 6),
    Q('makkelijk', "Bepaal f'(x) als f(x) = (3x−1)/(x+2)", 'f(x) = \\dfrac{3x-1}{x+2}',
      '7/(x+2)^2', '\\dfrac{7}{(x+2)^{2}}', 2,
      ['quotientregel.formule_volgorde','quotientregel.noemer_kwadraat'], 7),
    Q('makkelijk', "Bepaal f'(x) als f(x) = x/(x−4)", 'f(x) = \\dfrac{x}{x-4}',
      '-4/(x-4)^2', '\\dfrac{-4}{(x-4)^{2}}', 2,
      ['quotientregel.formule_volgorde','quotientregel.noemer_kwadraat'], 8),
    Q('makkelijk', "Bepaal f'(x) als f(x) = x²/(x+1)", 'f(x) = \\dfrac{x^{2}}{x+1}',
      '(x^2+2x)/(x+1)^2', '\\dfrac{x^{2}+2x}{(x+1)^{2}}', 2,
      ['quotientregel.t_differentieren','quotientregel.formule_volgorde','quotientregel.noemer_kwadraat'], 9),

    // ── polynoom diff 2 ───────────────────────────────────────────────────
    Q('polynoom', "Bepaal f'(x) als f(x) = x/(x²+1)", 'f(x) = \\dfrac{x}{x^{2}+1}',
      '(1-x^2)/(x^2+1)^2', '\\dfrac{1-x^{2}}{(x^{2}+1)^{2}}', 2,
      ['quotientregel.n_differentieren','quotientregel.formule_volgorde'], 1),
    Q('polynoom', "Bepaal f'(x) als f(x) = x²/(x²+4)", 'f(x) = \\dfrac{x^{2}}{x^{2}+4}',
      '8x/(x^2+4)^2', '\\dfrac{8x}{(x^{2}+4)^{2}}', 2,
      ['quotientregel.t_differentieren','quotientregel.n_differentieren','quotientregel.formule_volgorde'], 2),
    Q('polynoom', "Bepaal f'(x) als f(x) = (x−1)/(x²+1)", 'f(x) = \\dfrac{x-1}{x^{2}+1}',
      '(-x^2+2x+1)/(x^2+1)^2', '\\dfrac{-x^{2}+2x+1}{(x^{2}+1)^{2}}', 2,
      ['quotientregel.n_differentieren','quotientregel.formule_volgorde'], 3),
    Q('polynoom', "Bepaal f'(x) als f(x) = (3−x²)/(x−2)", 'f(x) = \\dfrac{3-x^{2}}{x-2}',
      '(-x^2+4x-3)/(x-2)^2', '\\dfrac{-x^{2}+4x-3}{(x-2)^{2}}', 2,
      ['quotientregel.t_differentieren','quotientregel.formule_volgorde'], 4),
    // ── polynoom diff 3 ───────────────────────────────────────────────────
    Q('polynoom', "Bepaal f'(x) als f(x) = (x²−1)/(x²+1)", 'f(x) = \\dfrac{x^{2}-1}{x^{2}+1}',
      '4x/(x^2+1)^2', '\\dfrac{4x}{(x^{2}+1)^{2}}', 3,
      ['quotientregel.t_differentieren','quotientregel.n_differentieren','quotientregel.formule_volgorde'], 5),
    Q('polynoom', "Bepaal f'(x) als f(x) = x³/(x+1)", 'f(x) = \\dfrac{x^{3}}{x+1}',
      '(2x^3+3x^2)/(x+1)^2', '\\dfrac{2x^{3}+3x^{2}}{(x+1)^{2}}', 3,
      ['quotientregel.t_differentieren','quotientregel.formule_volgorde'], 6),
    Q('polynoom', "Bepaal f'(x) als f(x) = (x²+x)/(x+2)", 'f(x) = \\dfrac{x^{2}+x}{x+2}',
      '(x^2+4x+2)/(x+2)^2', '\\dfrac{x^{2}+4x+2}{(x+2)^{2}}', 3,
      ['quotientregel.t_differentieren','quotientregel.formule_volgorde'], 7),
    Q('polynoom', "Bepaal f'(x) als f(x) = (x²+1)/(x−1)", 'f(x) = \\dfrac{x^{2}+1}{x-1}',
      '(x^2-2x-1)/(x-1)^2', '\\dfrac{x^{2}-2x-1}{(x-1)^{2}}', 3,
      ['quotientregel.t_differentieren','quotientregel.formule_volgorde'], 8),
    Q('polynoom', "Bepaal f'(x) als f(x) = (x³−1)/(x+1)", 'f(x) = \\dfrac{x^{3}-1}{x+1}',
      '(2x^3+3x^2+1)/(x+1)^2', '\\dfrac{2x^{3}+3x^{2}+1}{(x+1)^{2}}', 3,
      ['quotientregel.t_differentieren','quotientregel.formule_volgorde'], 9),

    // ── combi_somregel diff 2 ─────────────────────────────────────────────
    Q('combi_somregel', "Bepaal f'(x) als f(x) = x − 2/(x+4)", 'f(x) = x - \\dfrac{2}{x+4}',
      '1+2/(x+4)^2', '1+\\dfrac{2}{(x+4)^{2}}', 2,
      ['quotientregel.formule_volgorde','quotientregel.combi_somregel'], 1),
    Q('combi_somregel', "Bepaal f'(x) als f(x) = x² + 1/(x−1)", 'f(x) = x^{2} + \\dfrac{1}{x-1}',
      '2x-1/(x-1)^2', '2x-\\dfrac{1}{(x-1)^{2}}', 2,
      ['quotientregel.formule_volgorde','quotientregel.combi_somregel'], 2),
    Q('combi_somregel', "Bepaal f'(x) als f(x) = 3x + x/(x+2)", 'f(x) = 3x + \\dfrac{x}{x+2}',
      '3+2/(x+2)^2', '3+\\dfrac{2}{(x+2)^{2}}', 2,
      ['quotientregel.formule_volgorde','quotientregel.combi_somregel'], 3),
    Q('combi_somregel', "Bepaal f'(x) als f(x) = x³ + (x+1)/(x−1)", 'f(x) = x^{3} + \\dfrac{x+1}{x-1}',
      '3x^2-2/(x-1)^2', '3x^{2}-\\dfrac{2}{(x-1)^{2}}', 2,
      ['quotientregel.formule_volgorde','quotientregel.combi_somregel'], 4),
    Q('combi_somregel', "Bepaal f'(x) als f(x) = x − (x−1)/(x+2)", 'f(x) = x - \\dfrac{x-1}{x+2}',
      '1-3/(x+2)^2', '1-\\dfrac{3}{(x+2)^{2}}', 2,
      ['quotientregel.formule_volgorde','quotientregel.combi_somregel'], 5),
    // ── combi_somregel diff 3 ─────────────────────────────────────────────
    Q('combi_somregel', "Bepaal f'(x) als f(x) = (3−x²)/(x−2) + x³",
      'f(x) = \\dfrac{3-x^{2}}{x-2} + x^{3}',
      '(-x^2+4x-3)/(x-2)^2+3x^2', '\\dfrac{-x^{2}+4x-3}{(x-2)^{2}}+3x^{2}', 3,
      ['quotientregel.formule_volgorde','quotientregel.combi_somregel'], 6),
    Q('combi_somregel', "Bepaal f'(x) als f(x) = (2x+1)/(x+3) + x²",
      'f(x) = \\dfrac{2x+1}{x+3} + x^{2}',
      '5/(x+3)^2+2x', '\\dfrac{5}{(x+3)^{2}}+2x', 3,
      ['quotientregel.formule_volgorde','quotientregel.combi_somregel'], 7),
    Q('combi_somregel', "Bepaal f'(x) als f(x) = x² − (x+2)/(x−1)",
      'f(x) = x^{2} - \\dfrac{x+2}{x-1}',
      '2x+3/(x-1)^2', '2x+\\dfrac{3}{(x-1)^{2}}', 3,
      ['quotientregel.formule_volgorde','quotientregel.combi_somregel'], 8),
    Q('combi_somregel', "Bepaal f'(x) als f(x) = (x²+1)/(x−1) + 2x",
      'f(x) = \\dfrac{x^{2}+1}{x-1} + 2x',
      '(x^2-2x-1)/(x-1)^2+2', '\\dfrac{x^{2}-2x-1}{(x-1)^{2}}+2', 3,
      ['quotientregel.formule_volgorde','quotientregel.combi_somregel'], 9),
  ]

  const { data: inserted, error: iqe } = await sb
    .from('questions')
    .insert(questions)
    .select('id, latex_body')
  if (iqe) { console.error('Insert questions failed', iqe); process.exit(1) }
  console.log(`Inserted ${inserted?.length} questions`)

  // ── 7. Step plan for (3−x²)/(x−2) + x³ ─────────────────────────────────
  const combiQ = inserted?.find(q => q.latex_body === 'f(x) = \\dfrac{3-x^{2}}{x-2} + x^{3}')
  if (!combiQ) { console.error('Combi question not found in inserted rows'); process.exit(1) }

  // Fetch root cause ids
  const rcSlugs = [
    'quotientregel.combi_somregel',
    'quotientregel.formule_volgorde',
    'quotientregel.tn_identificeren',
    'quotientregel.t_differentieren',
    'quotientregel.noemer_kwadraat',
  ]
  const { data: rcRows } = await sb.from('root_causes').select('id, slug').in('slug', rcSlugs)
  const rcMap = Object.fromEntries((rcRows ?? []).map(r => [r.slug, r.id]))

  const steps = [
    { question_id: combiQ.id, step_order: 1, step_description: 'Splits de functie: breukdeel (3−x²)/(x−2) en machtsdeel x³', root_cause_id: rcMap['quotientregel.combi_somregel'] },
    { question_id: combiQ.id, step_order: 2, step_description: 'Differentieer de breuk met de quotiëntregel: stel t = 3−x², n = x−2', root_cause_id: rcMap['quotientregel.tn_identificeren'] },
    { question_id: combiQ.id, step_order: 3, step_description: "Bereken t' = −2x  en  n' = 1", root_cause_id: rcMap['quotientregel.t_differentieren'] },
    { question_id: combiQ.id, step_order: 4, step_description: "t'n − tn' = −2x(x−2) − (3−x²) = −2x²+4x−3+x² = −x²+4x−3", root_cause_id: rcMap['quotientregel.formule_volgorde'] },
    { question_id: combiQ.id, step_order: 5, step_description: 'Quotiëntdeel: (−x²+4x−3)/(x−2)²', root_cause_id: rcMap['quotientregel.noemer_kwadraat'] },
    { question_id: combiQ.id, step_order: 6, step_description: 'Differentieer het machtsdeel: d/dx[x³] = 3x²', root_cause_id: rcMap['quotientregel.combi_somregel'] },
    { question_id: combiQ.id, step_order: 7, step_description: "f'(x) = (−x²+4x−3)/(x−2)² + 3x²", root_cause_id: rcMap['quotientregel.combi_somregel'] },
  ]

  const { error: ste } = await sb
    .from('question_steps')
    .upsert(steps, { onConflict: 'question_id,step_order' })
  if (ste) { console.error('Insert steps failed', ste); process.exit(1) }
  console.log('Inserted step plan')
  console.log('\n✓ Migration 0008 complete')
}

main().catch(e => { console.error(e); process.exit(1) })
