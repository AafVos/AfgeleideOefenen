/**
 * Migration 0010: Add emacht topic — 5 clusters, 45 questions
 * Run with: npx tsx scripts/run-migration-0010.ts
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!url || !key) { console.error('Missing env vars'); process.exit(1) }
const sb = createClient(url, key)

async function main() {
  // ── 1. Upsert topic ───────────────────────────────────────────────────────
  const { error: te } = await sb.from('topics').upsert([{
    slug: 'emacht', title: 'De e-macht', order_index: 6, is_unlocked_by_default: false,
  }], { onConflict: 'slug' })
  if (te) { console.error('Topic:', te); process.exit(1) }

  const { data: topic } = await sb.from('topics').select('id').eq('slug', 'emacht').single()
  if (!topic) { console.error('Topic not found'); process.exit(1) }
  const tid = topic.id
  console.log('topic id:', tid)

  // ── 2. Clusters ───────────────────────────────────────────────────────────
  const clusters = [
    { topic_id: tid, slug: 'standaard',           title: 'Standaard',               order_index: 1 },
    { topic_id: tid, slug: 'combi_somregel',      title: 'Combi met somregel',       order_index: 2 },
    { topic_id: tid, slug: 'combi_productregel',  title: 'Combi met productregel',   order_index: 3 },
    { topic_id: tid, slug: 'combi_kettingregel',  title: 'Combi met kettingregel',   order_index: 4 },
    { topic_id: tid, slug: 'combi_quotientregel', title: 'Combi met quotiëntregel',  order_index: 5 },
  ]
  const { error: ce } = await sb.from('topic_clusters').upsert(clusters, { onConflict: 'topic_id,slug' })
  if (ce) { console.error('Clusters:', ce); process.exit(1) }

  const { data: cls } = await sb.from('topic_clusters').select('id,slug').eq('topic_id', tid)
  const C = Object.fromEntries((cls ?? []).map(c => [c.slug, c.id]))
  console.log('Cluster map:', C)

  // ── 3. Root causes ────────────────────────────────────────────────────────
  const rcData = [
    { topic_id: tid, slug: 'emacht.e_herkennen',        description: "Afgeleide van e^x is e^x" },
    { topic_id: tid, slug: 'emacht.ketting_lineair',    description: "Kettingregel: d/dx[e^{ax+b}] = a·e^{ax+b}" },
    { topic_id: tid, slug: 'emacht.ketting_polynoom',   description: "Kettingregel: d/dx[e^{f(x)}] = f'(x)·e^{f(x)}" },
    { topic_id: tid, slug: 'emacht.product_toepassen',  description: "Productregel combineren met e-macht" },
    { topic_id: tid, slug: 'emacht.quotient_toepassen', description: "Quotiëntregel combineren met e-macht" },
    { topic_id: tid, slug: 'emacht.uitfactoren',        description: "e^x uitfactoren in eindantwoord" },
  ]
  await sb.from('root_causes').upsert(rcData, { onConflict: 'slug' })
  console.log('Root causes OK')

  // ── 4. Delete old questions ───────────────────────────────────────────────
  await sb.from('questions').delete().eq('topic_id', tid).eq('is_ai_generated', false)

  // helper
  const Q = (slug: string, body: string, lb: string, ans: string, la: string,
             diff: number, tags: string[], order: number) => ({
    topic_id: tid, cluster_id: C[slug],
    body, latex_body: lb, answer: ans, latex_answer: la,
    difficulty: diff, root_cause_tags: tags, is_ai_generated: false, order_index: order,
  })
  const EH = 'emacht.e_herkennen', KL = 'emacht.ketting_lineair', KP = 'emacht.ketting_polynoom'
  const PR = 'emacht.product_toepassen', QR = 'emacht.quotient_toepassen', UF = 'emacht.uitfactoren'

  const questions = [
    // ── standaard ──────────────────────────────────────────────────────────
    Q('standaard',"Bepaal f'(x) als f(x) = e^x",'f(x) = e^{x}','e^x','e^{x}',1,[EH],1),
    Q('standaard',"Bepaal f'(x) als f(x) = 3e^x",'f(x) = 3e^{x}','3e^x','3e^{x}',1,[EH],2),
    Q('standaard',"Bepaal f'(x) als f(x) = e^{2x}",'f(x) = e^{2x}','2e^(2x)','2e^{2x}',1,[KL],3),
    Q('standaard',"Bepaal f'(x) als f(x) = e^{3x}",'f(x) = e^{3x}','3e^(3x)','3e^{3x}',1,[KL],4),
    Q('standaard',"Bepaal f'(x) als f(x) = e^{3x+1}",'f(x) = e^{3x+1}','3e^(3x+1)','3e^{3x+1}',2,[KL],5),
    Q('standaard',"Bepaal f'(x) als f(x) = 5e^{2x}",'f(x) = 5e^{2x}','10e^(2x)','10e^{2x}',2,[KL],6),
    Q('standaard',"Bepaal f'(x) als f(x) = e^{-x}",'f(x) = e^{-x}','-e^(-x)','-e^{-x}',2,[KL],7),
    Q('standaard',"Bepaal f'(x) als f(x) = 4e^{-2x}",'f(x) = 4e^{-2x}','-8e^(-2x)','-8e^{-2x}',2,[KL],8),
    Q('standaard',"Bepaal f'(x) als f(x) = e^{4x-3}",'f(x) = e^{4x-3}','4e^(4x-3)','4e^{4x-3}',3,[KL],9),

    // ── combi_somregel ─────────────────────────────────────────────────────
    Q('combi_somregel',"Bepaal f'(x) als f(x) = x² + e^x",'f(x) = x^{2} + e^{x}','2x+e^x','2x+e^{x}',2,[EH],1),
    Q('combi_somregel',"Bepaal f'(x) als f(x) = 3x + e^{2x}",'f(x) = 3x + e^{2x}','3+2e^(2x)','3+2e^{2x}',2,[KL],2),
    Q('combi_somregel',"Bepaal f'(x) als f(x) = x³ + e^{-x}",'f(x) = x^{3} + e^{-x}','3x^2-e^(-x)','3x^{2}-e^{-x}',2,[KL],3),
    Q('combi_somregel',"Bepaal f'(x) als f(x) = e^x + e^{2x}",'f(x) = e^{x} + e^{2x}','e^x+2e^(2x)','e^{x}+2e^{2x}',2,[KL],4),
    Q('combi_somregel',"Bepaal f'(x) als f(x) = 2e^{3x} − x²",'f(x) = 2e^{3x} - x^{2}','6e^(3x)-2x','6e^{3x}-2x',2,[KL],5),
    Q('combi_somregel',"Bepaal f'(x) als f(x) = e^{2x} + e^{-2x}",'f(x) = e^{2x} + e^{-2x}','2e^(2x)-2e^(-2x)','2e^{2x}-2e^{-2x}',3,[KL],6),
    Q('combi_somregel',"Bepaal f'(x) als f(x) = 3e^{x+1} − x³",'f(x) = 3e^{x+1} - x^{3}','3e^(x+1)-3x^2','3e^{x+1}-3x^{2}',3,[KL],7),
    Q('combi_somregel',"Bepaal f'(x) als f(x) = x + e^{x²}",'f(x) = x + e^{x^{2}}','1+2xe^(x^2)','1+2xe^{x^{2}}',3,[KP],8),
    Q('combi_somregel',"Bepaal f'(x) als f(x) = x² + e^{x²+1}",'f(x) = x^{2} + e^{x^{2}+1}','2x+2xe^(x^2+1)','2x+2xe^{x^{2}+1}',3,[KP],9),

    // ── combi_productregel ─────────────────────────────────────────────────
    Q('combi_productregel',"Bepaal f'(x) als f(x) = x·e^x",'f(x) = xe^{x}','(x+1)e^x','(x+1)e^{x}',2,[PR,UF],1),
    Q('combi_productregel',"Bepaal f'(x) als f(x) = x²·e^x",'f(x) = x^{2}e^{x}','(x^2+2x)e^x','(x^{2}+2x)e^{x}',2,[PR,UF],2),
    Q('combi_productregel',"Bepaal f'(x) als f(x) = (x+1)·e^x",'f(x) = (x+1)e^{x}','(x+2)e^x','(x+2)e^{x}',2,[PR,UF],3),
    Q('combi_productregel',"Bepaal f'(x) als f(x) = x·e^{2x}",'f(x) = xe^{2x}','(1+2x)e^(2x)','(1+2x)e^{2x}',2,[PR,KL],4),
    Q('combi_productregel',"Bepaal f'(x) als f(x) = (x−1)·e^x",'f(x) = (x-1)e^{x}','xe^x','xe^{x}',2,[PR,UF],5),
    Q('combi_productregel',"Bepaal f'(x) als f(x) = x²·e^{2x}",'f(x) = x^{2}e^{2x}','2x(x+1)e^(2x)','2x(x+1)e^{2x}',3,[PR,KL,UF],6),
    Q('combi_productregel',"Bepaal f'(x) als f(x) = x·e^{-x}",'f(x) = xe^{-x}','(1-x)e^(-x)','(1-x)e^{-x}',3,[PR,KL],7),
    Q('combi_productregel',"Bepaal f'(x) als f(x) = (x²+2x)·e^x",'f(x) = (x^{2}+2x)e^{x}','(x^2+4x+2)e^x','(x^{2}+4x+2)e^{x}',3,[PR,UF],8),
    Q('combi_productregel',"Bepaal f'(x) als f(x) = (x²−1)·e^x",'f(x) = (x^{2}-1)e^{x}','(x^2+2x-1)e^x','(x^{2}+2x-1)e^{x}',3,[PR,UF],9),

    // ── combi_kettingregel ─────────────────────────────────────────────────
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = e^{x²}",'f(x) = e^{x^{2}}','2xe^(x^2)','2xe^{x^{2}}',2,[KP],1),
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = e^{x²+1}",'f(x) = e^{x^{2}+1}','2xe^(x^2+1)','2xe^{x^{2}+1}',2,[KP],2),
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = 4e^{x²}",'f(x) = 4e^{x^{2}}','8xe^(x^2)','8xe^{x^{2}}',2,[KP],3),
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = e^{x²-x}",'f(x) = e^{x^{2}-x}','(2x-1)e^(x^2-x)','(2x-1)e^{x^{2}-x}',2,[KP],4),
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = 2e^{x²+3}",'f(x) = 2e^{x^{2}+3}','4xe^(x^2+3)','4xe^{x^{2}+3}',2,[KP],5),
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = e^{-x²}",'f(x) = e^{-x^{2}}','-2xe^(-x^2)','-2xe^{-x^{2}}',3,[KP],6),
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = e^{x³}",'f(x) = e^{x^{3}}','3x^2e^(x^3)','3x^{2}e^{x^{3}}',3,[KP],7),
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = 3e^{x²+2x}",'f(x) = 3e^{x^{2}+2x}','6(x+1)e^(x^2+2x)','6(x+1)e^{x^{2}+2x}',3,[KP,UF],8),
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = e^{x²+3x+1}",'f(x) = e^{x^{2}+3x+1}','(2x+3)e^(x^2+3x+1)','(2x+3)e^{x^{2}+3x+1}',3,[KP],9),

    // ── combi_quotientregel ────────────────────────────────────────────────
    Q('combi_quotientregel',"Bepaal f'(x) als f(x) = e^x/x",'f(x) = \\dfrac{e^{x}}{x}','(x-1)e^x/x^2','\\dfrac{(x-1)e^{x}}{x^{2}}',2,[QR,UF],1),
    Q('combi_quotientregel',"Bepaal f'(x) als f(x) = e^{2x}/x",'f(x) = \\dfrac{e^{2x}}{x}','(2x-1)e^(2x)/x^2','\\dfrac{(2x-1)e^{2x}}{x^{2}}',2,[QR,KL],2),
    Q('combi_quotientregel',"Bepaal f'(x) als f(x) = e^x/(x+1)",'f(x) = \\dfrac{e^{x}}{x+1}','xe^x/(x+1)^2','\\dfrac{xe^{x}}{(x+1)^{2}}',2,[QR,UF],3),
    Q('combi_quotientregel',"Bepaal f'(x) als f(x) = x²/e^x",'f(x) = \\dfrac{x^{2}}{e^{x}}','(2x-x^2)/e^x','\\dfrac{2x-x^{2}}{e^{x}}',2,[QR],4),
    Q('combi_quotientregel',"Bepaal f'(x) als f(x) = e^x/(x²+1)",'f(x) = \\dfrac{e^{x}}{x^{2}+1}','e^x(x^2-2x+1)/(x^2+1)^2','\\dfrac{e^{x}(x^{2}-2x+1)}{(x^{2}+1)^{2}}',2,[QR,UF],5),
    Q('combi_quotientregel',"Bepaal f'(x) als f(x) = e^{2x}/(x+1)",'f(x) = \\dfrac{e^{2x}}{x+1}','(2x+1)e^(2x)/(x+1)^2','\\dfrac{(2x+1)e^{2x}}{(x+1)^{2}}',3,[QR,KL],6),
    Q('combi_quotientregel',"Bepaal f'(x) als f(x) = e^{3x}/(x²+1)",'f(x) = \\dfrac{e^{3x}}{x^{2}+1}','(3x^2-2x+3)e^(3x)/(x^2+1)^2','\\dfrac{(3x^{2}-2x+3)e^{3x}}{(x^{2}+1)^{2}}',3,[QR,KL],7),
    Q('combi_quotientregel',"Bepaal f'(x) als f(x) = (e^x-1)/(e^x+1)",'f(x) = \\dfrac{e^{x}-1}{e^{x}+1}','2e^x/(e^x+1)^2','\\dfrac{2e^{x}}{(e^{x}+1)^{2}}',3,[QR,EH],8),
    Q('combi_quotientregel',"Bepaal f'(x) als f(x) = x²/e^{2x}",'f(x) = \\dfrac{x^{2}}{e^{2x}}','2x(1-x)/e^(2x)','\\dfrac{2x(1-x)}{e^{2x}}',3,[QR,KL],9),
  ]

  const { data: inserted, error: iqe } = await sb.from('questions').insert(questions).select('id,latex_body')
  if (iqe) { console.error('Questions:', iqe); process.exit(1) }
  console.log(`Inserted ${inserted?.length} questions`)

  // ── 5. Step plan for x·e^x ───────────────────────────────────────────────
  const { data: rcRows } = await sb.from('root_causes').select('id,slug')
  const RC = Object.fromEntries((rcRows ?? []).map(r => [r.slug, r.id]))

  const xex = inserted?.find(q => q.latex_body === 'f(x) = xe^{x}')
  if (xex) {
    await sb.from('question_steps').upsert([
      { question_id: xex.id, step_order: 1, step_description: 'Herken de productregel: f = x  en  g = e^x', root_cause_id: RC['productregel.fg_identificeren'] },
      { question_id: xex.id, step_order: 2, step_description: "Differentieer f: f' = 1", root_cause_id: RC['productregel.f_differentieren'] },
      { question_id: xex.id, step_order: 3, step_description: "Differentieer g: g' = e^x  (e^x is zijn eigen afgeleide)", root_cause_id: RC['emacht.e_herkennen'] },
      { question_id: xex.id, step_order: 4, step_description: "f'·g + f·g' = 1·e^x + x·e^x = e^x + xe^x", root_cause_id: RC['productregel.formule_invullen'] },
      { question_id: xex.id, step_order: 5, step_description: "Factoriseer e^x: f'(x) = (1+x)e^x", root_cause_id: RC['emacht.uitfactoren'] },
    ], { onConflict: 'question_id,step_order' })
    console.log('Step plan OK: x·e^x')
  }

  console.log('\n✓ Migration 0010 complete')
}

main().catch(e => { console.error(e); process.exit(1) })
