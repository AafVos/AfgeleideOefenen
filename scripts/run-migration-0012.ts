/**
 * Migration 0012: Add goniometrie topic — 4 clusters, 36 questions
 * Also bumps emacht → order 7, lnlog → order 8
 * Run with: npx tsx scripts/run-migration-0012.ts
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!url || !key) { console.error('Missing env vars'); process.exit(1) }
const sb = createClient(url, key)

async function main() {
  // ── 0. Fix order_index of emacht (6→7) and lnlog (7→8) ───────────────────
  await sb.from('topics').update({ order_index: 7 }).eq('slug', 'emacht')
  await sb.from('topics').update({ order_index: 8 }).eq('slug', 'lnlog')
  console.log('emacht/lnlog order updated')

  // ── 1. Upsert topic ───────────────────────────────────────────────────────
  await sb.from('topics').upsert([{
    slug: 'goniometrie', title: 'Goniometrie', order_index: 6, is_unlocked_by_default: false,
  }], { onConflict: 'slug' })

  const { data: topic } = await sb.from('topics').select('id').eq('slug', 'goniometrie').single()
  if (!topic) { console.error('Topic not found'); process.exit(1) }
  const tid = topic.id
  console.log('topic id:', tid)

  // ── 2. Clusters ───────────────────────────────────────────────────────────
  await sb.from('topic_clusters').upsert([
    { topic_id: tid, slug: 'standaard',           title: 'Standaard',               order_index: 1 },
    { topic_id: tid, slug: 'combi_kettingregel',  title: 'Combi met kettingregel',   order_index: 2 },
    { topic_id: tid, slug: 'combi_productregel',  title: 'Combi met productregel',   order_index: 3 },
    { topic_id: tid, slug: 'combi_quotientregel', title: 'Combi met quotiëntregel',  order_index: 4 },
  ], { onConflict: 'topic_id,slug' })

  const { data: cls } = await sb.from('topic_clusters').select('id,slug').eq('topic_id', tid)
  const C = Object.fromEntries((cls ?? []).map(c => [c.slug, c.id]))
  console.log('Cluster map:', C)

  // ── 3. Root causes ────────────────────────────────────────────────────────
  await sb.from('root_causes').upsert([
    { topic_id: tid, slug: 'goniometrie.sin_herkennen',      description: 'd/dx[sin(x)] = cos(x)' },
    { topic_id: tid, slug: 'goniometrie.cos_herkennen',      description: 'd/dx[cos(x)] = -sin(x)' },
    { topic_id: tid, slug: 'goniometrie.tan_herkennen',      description: 'd/dx[tan(x)] = 1+tan²(x)' },
    { topic_id: tid, slug: 'goniometrie.ketting_lineair',    description: 'Kettingregel: d/dx[sin(ax+b)] = a·cos(ax+b)' },
    { topic_id: tid, slug: 'goniometrie.ketting_polynoom',   description: "Kettingregel: d/dx[sin(f(x))] = f'(x)·cos(f(x))" },
    { topic_id: tid, slug: 'goniometrie.product_toepassen',  description: 'Productregel combineren met goniometrie' },
    { topic_id: tid, slug: 'goniometrie.quotient_toepassen', description: 'Quotiëntregel combineren met goniometrie' },
  ], { onConflict: 'slug' })
  console.log('Root causes OK')

  // ── 4. Delete old questions ───────────────────────────────────────────────
  await sb.from('questions').delete().eq('topic_id', tid).eq('is_ai_generated', false)

  const SIN = 'goniometrie.sin_herkennen', COS = 'goniometrie.cos_herkennen'
  const TAN = 'goniometrie.tan_herkennen', KL = 'goniometrie.ketting_lineair'
  const KP = 'goniometrie.ketting_polynoom', PR = 'goniometrie.product_toepassen'
  const QR = 'goniometrie.quotient_toepassen'

  const Q = (slug: string, body: string, lb: string, ans: string, la: string,
             diff: number, tags: string[], order: number) => ({
    topic_id: tid, cluster_id: C[slug],
    body, latex_body: lb, answer: ans, latex_answer: la,
    difficulty: diff, root_cause_tags: tags, is_ai_generated: false, order_index: order,
  })

  const questions = [
    // ── standaard ──────────────────────────────────────────────────────────
    Q('standaard',"Bepaal f'(x) als f(x) = sin(x)",'f(x) = \\sin(x)','cos(x)','\\cos(x)',1,[SIN],1),
    Q('standaard',"Bepaal f'(x) als f(x) = cos(x)",'f(x) = \\cos(x)','-sin(x)','-\\sin(x)',1,[COS],2),
    Q('standaard',"Bepaal f'(x) als f(x) = tan(x)",'f(x) = \\tan(x)','1+tan(x)^2','1+\\tan^{2}(x)',1,[TAN],3),
    Q('standaard',"Bepaal f'(x) als f(x) = 3sin(x)",'f(x) = 3\\sin(x)','3cos(x)','3\\cos(x)',2,[SIN],4),
    Q('standaard',"Bepaal f'(x) als f(x) = −2cos(x)",'f(x) = -2\\cos(x)','2sin(x)','2\\sin(x)',2,[COS],5),
    Q('standaard',"Bepaal f'(x) als f(x) = 2sin(x)+3cos(x)",'f(x) = 2\\sin(x)+3\\cos(x)','2cos(x)-3sin(x)','2\\cos(x)-3\\sin(x)',2,[SIN,COS],6),
    Q('standaard',"Bepaal f'(x) als f(x) = 5cos(x)−sin(x)",'f(x) = 5\\cos(x)-\\sin(x)','-5sin(x)-cos(x)','-5\\sin(x)-\\cos(x)',2,[SIN,COS],7),
    Q('standaard',"Bepaal f'(x) als f(x) = x+sin(x)",'f(x) = x+\\sin(x)','1+cos(x)','1+\\cos(x)',3,[SIN],8),
    Q('standaard',"Bepaal f'(x) als f(x) = x²−cos(x)",'f(x) = x^{2}-\\cos(x)','2x+sin(x)','2x+\\sin(x)',3,[COS],9),

    // ── combi_kettingregel ─────────────────────────────────────────────────
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = sin(2x)",'f(x) = \\sin(2x)','2cos(2x)','2\\cos(2x)',1,[KL,SIN],1),
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = cos(3x)",'f(x) = \\cos(3x)','-3sin(3x)','-3\\sin(3x)',1,[KL,COS],2),
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = tan(2x)",'f(x) = \\tan(2x)','2+2tan(2x)^2','2+2\\tan^{2}(2x)',2,[KL,TAN],3),
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = sin(2x+1)",'f(x) = \\sin(2x+1)','2cos(2x+1)','2\\cos(2x+1)',2,[KL,SIN],4),
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = cos(3x−2)",'f(x) = \\cos(3x-2)','-3sin(3x-2)','-3\\sin(3x-2)',2,[KL,COS],5),
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = 2sin(4x)",'f(x) = 2\\sin(4x)','8cos(4x)','8\\cos(4x)',2,[KL,SIN],6),
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = 3cos(2x+1)",'f(x) = 3\\cos(2x+1)','-6sin(2x+1)','-6\\sin(2x+1)',2,[KL,COS],7),
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = sin(x²)",'f(x) = \\sin(x^{2})','2xcos(x^2)','2x\\cos(x^{2})',3,[KP,SIN],8),
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = cos(x²+1)",'f(x) = \\cos(x^{2}+1)','-2xsin(x^2+1)','-2x\\sin(x^{2}+1)',3,[KP,COS],9),

    // ── combi_productregel ─────────────────────────────────────────────────
    Q('combi_productregel',"Bepaal g'(x) als g(x) = x·sin(x)",'g(x) = x\\sin(x)','sin(x)+xcos(x)','\\sin(x)+x\\cos(x)',2,[PR,SIN],1),
    Q('combi_productregel',"Bepaal f'(x) als f(x) = x·cos(x)",'f(x) = x\\cos(x)','cos(x)-xsin(x)','\\cos(x)-x\\sin(x)',2,[PR,COS],2),
    Q('combi_productregel',"Bepaal f'(x) als f(x) = x²·sin(x)",'f(x) = x^{2}\\sin(x)','2xsin(x)+x^2cos(x)','2x\\sin(x)+x^{2}\\cos(x)',2,[PR,SIN],3),
    Q('combi_productregel',"Bepaal f'(x) als f(x) = x·cos(2x)",'f(x) = x\\cos(2x)','cos(2x)-2xsin(2x)','\\cos(2x)-2x\\sin(2x)',2,[PR,KL,COS],4),
    Q('combi_productregel',"Bepaal k'(x) als k(x) = x²·sin(3x)",'k(x) = x^{2}\\sin(3x)','2xsin(3x)+3x^2cos(3x)','2x\\sin(3x)+3x^{2}\\cos(3x)',2,[PR,KL,SIN],5),
    Q('combi_productregel',"Bepaal l'(x) als l(x) = 2x·sin(3x−1)",'l(x) = 2x\\sin(3x-1)','2sin(3x-1)+6xcos(3x-1)','2\\sin(3x-1)+6x\\cos(3x-1)',3,[PR,KL,SIN],6),
    Q('combi_productregel',"Bepaal f'(x) als f(x) = x²·cos(x)",'f(x) = x^{2}\\cos(x)','2xcos(x)-x^2sin(x)','2x\\cos(x)-x^{2}\\sin(x)',3,[PR,COS],7),
    Q('combi_productregel',"Bepaal f'(x) als f(x) = (x+1)·sin(x)",'f(x) = (x+1)\\sin(x)','sin(x)+(x+1)cos(x)','\\sin(x)+(x+1)\\cos(x)',3,[PR,SIN],8),
    Q('combi_productregel',"Bepaal j'(x) als j(x) = x²·tan(x)",'j(x) = x^{2}\\tan(x)','2xtan(x)+x^2+x^2tan(x)^2','2x\\tan(x)+x^{2}+x^{2}\\tan^{2}(x)',3,[PR,TAN],9),

    // ── combi_quotientregel ────────────────────────────────────────────────
    Q('combi_quotientregel',"Bepaal f'(x) als f(x) = sin(x)/x",'f(x) = \\dfrac{\\sin(x)}{x}','(xcos(x)-sin(x))/x^2','\\dfrac{x\\cos(x)-\\sin(x)}{x^{2}}',2,[QR,SIN],1),
    Q('combi_quotientregel',"Bepaal f'(x) als f(x) = cos(x)/x",'f(x) = \\dfrac{\\cos(x)}{x}','-(xsin(x)+cos(x))/x^2','\\dfrac{-(x\\sin(x)+\\cos(x))}{x^{2}}',2,[QR,COS],2),
    Q('combi_quotientregel',"Bepaal f'(x) als f(x) = cos(x)/sin(x)",'f(x) = \\dfrac{\\cos(x)}{\\sin(x)}','-1/sin(x)^2','\\dfrac{-1}{\\sin^{2}(x)}',2,[QR],3),
    Q('combi_quotientregel',"Bepaal h'(x) als h(x) = (x+cos(x))/sin(x)",'h(x) = \\dfrac{x+\\cos(x)}{\\sin(x)}','(sin(x)-xcos(x)-1)/sin(x)^2','\\dfrac{\\sin(x)-x\\cos(x)-1}{\\sin^{2}(x)}',2,[QR],4),
    Q('combi_quotientregel',"Bepaal f'(x) als f(x) = (sin(x)+1)/cos(x)",'f(x) = \\dfrac{\\sin(x)+1}{\\cos(x)}','(1+sin(x))/cos(x)^2','\\dfrac{1+\\sin(x)}{\\cos^{2}(x)}',2,[QR],5),
    Q('combi_quotientregel',"Bepaal f'(x) als f(x) = (x²+sin(x))/cos(x)",'f(x) = \\dfrac{x^{2}+\\sin(x)}{\\cos(x)}','(2xcos(x)+1+x^2sin(x))/cos(x)^2','\\dfrac{2x\\cos(x)+1+x^{2}\\sin(x)}{\\cos^{2}(x)}',3,[QR,SIN,COS],6),
    Q('combi_quotientregel',"Bepaal j'(x) als j(x) = x·sin(x)/(x+sin(x))",'j(x) = \\dfrac{x\\sin(x)}{x+\\sin(x)}','(x^2cos(x)+sin(x)^2)/(x+sin(x))^2','\\dfrac{x^{2}\\cos(x)+\\sin^{2}(x)}{(x+\\sin(x))^{2}}',3,[QR,PR,SIN],7),
    Q('combi_quotientregel',"Bepaal f'(x) als f(x) = tan(x)/x",'f(x) = \\dfrac{\\tan(x)}{x}','(x+xtan(x)^2-tan(x))/x^2','\\dfrac{x+x\\tan^{2}(x)-\\tan(x)}{x^{2}}',3,[QR,TAN],8),
    Q('combi_quotientregel',"Bepaal f'(x) als f(x) = sin(x)/(x²+cos(x))",'f(x) = \\dfrac{\\sin(x)}{x^{2}+\\cos(x)}','(x^2cos(x)+1-2xsin(x))/(x^2+cos(x))^2','\\dfrac{x^{2}\\cos(x)+1-2x\\sin(x)}{(x^{2}+\\cos(x))^{2}}',3,[QR,SIN,COS],9),
  ]

  const { data: inserted, error: iqe } = await sb.from('questions').insert(questions).select('id,latex_body')
  if (iqe) { console.error('Questions:', iqe); process.exit(1) }
  console.log(`Inserted ${inserted?.length} questions`)

  // ── 5. Step plan for h(x) = (x+cos(x))/sin(x) ───────────────────────────
  const { data: rcRows } = await sb.from('root_causes').select('id,slug')
  const RC = Object.fromEntries((rcRows ?? []).map(r => [r.slug, r.id]))

  const hq = inserted?.find(q => q.latex_body === 'h(x) = \\dfrac{x+\\cos(x)}{\\sin(x)}')
  if (hq) {
    await sb.from('question_steps').upsert([
      { question_id: hq.id, step_order: 1, step_description: 'Herken de quotiëntregel: t = x+cos(x)  en  n = sin(x)', root_cause_id: RC['quotientregel.tn_identificeren'] },
      { question_id: hq.id, step_order: 2, step_description: "Differentieer t: t' = 1−sin(x)", root_cause_id: RC['goniometrie.cos_herkennen'] },
      { question_id: hq.id, step_order: 3, step_description: "Differentieer n: n' = cos(x)", root_cause_id: RC['goniometrie.sin_herkennen'] },
      { question_id: hq.id, step_order: 4, step_description: "t'n − tn' = (1−sin(x))·sin(x) − (x+cos(x))·cos(x)", root_cause_id: RC['quotientregel.formule_volgorde'] },
      { question_id: hq.id, step_order: 5, step_description: "Werk de teller uit: sin(x)−sin²(x) − xcos(x) − cos²(x)", root_cause_id: RC['quotientregel.teller_uitwerken'] ?? RC['quotientregel.noemer_kwadraat'] },
      { question_id: hq.id, step_order: 6, step_description: "Gebruik sin²(x)+cos²(x)=1: teller = sin(x)−1−xcos(x)", root_cause_id: RC['goniometrie.quotient_toepassen'] },
      { question_id: hq.id, step_order: 7, step_description: "h'(x) = (sin(x)−xcos(x)−1)/sin²(x)", root_cause_id: RC['quotientregel.noemer_kwadraat'] },
    ], { onConflict: 'question_id,step_order' })
    console.log('Step plan OK: (x+cos(x))/sin(x)')
  }

  console.log('\n✓ Migration 0012 complete')
}

main().catch(e => { console.error(e); process.exit(1) })
