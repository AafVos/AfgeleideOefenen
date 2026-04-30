/**
 * Migration 0011: Add lnlog topic — 5 clusters, 45 questions
 * Run with: npx tsx scripts/run-migration-0011.ts
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!url || !key) { console.error('Missing env vars'); process.exit(1) }
const sb = createClient(url, key)

async function main() {
  // ── 1. Upsert topic ───────────────────────────────────────────────────────
  await sb.from('topics').upsert([{
    slug: 'lnlog', title: 'ln en log', order_index: 7, is_unlocked_by_default: false,
  }], { onConflict: 'slug' })

  const { data: topic } = await sb.from('topics').select('id').eq('slug', 'lnlog').single()
  if (!topic) { console.error('Topic not found'); process.exit(1) }
  const tid = topic.id
  console.log('topic id:', tid)

  // ── 2. Clusters ───────────────────────────────────────────────────────────
  const { error: ce } = await sb.from('topic_clusters').upsert([
    { topic_id: tid, slug: 'standaard',           title: 'Standaard',               order_index: 1 },
    { topic_id: tid, slug: 'combi_somregel',      title: 'Combi met somregel',       order_index: 2 },
    { topic_id: tid, slug: 'combi_productregel',  title: 'Combi met productregel',   order_index: 3 },
    { topic_id: tid, slug: 'combi_kettingregel',  title: 'Combi met kettingregel',   order_index: 4 },
    { topic_id: tid, slug: 'combi_quotientregel', title: 'Combi met quotiëntregel',  order_index: 5 },
  ], { onConflict: 'topic_id,slug' })
  if (ce) { console.error('Clusters:', ce); process.exit(1) }

  const { data: cls } = await sb.from('topic_clusters').select('id,slug').eq('topic_id', tid)
  const C = Object.fromEntries((cls ?? []).map(c => [c.slug, c.id]))
  console.log('Cluster map:', C)

  // ── 3. Root causes ────────────────────────────────────────────────────────
  await sb.from('root_causes').upsert([
    { topic_id: tid, slug: 'lnlog.ln_herkennen',       description: 'Afgeleide van ln(x) is 1/x' },
    { topic_id: tid, slug: 'lnlog.ketting_lineair',    description: 'Kettingregel: d/dx[ln(ax+b)] = a/(ax+b)' },
    { topic_id: tid, slug: 'lnlog.ketting_polynoom',   description: "Kettingregel: d/dx[ln(f(x))] = f'(x)/f(x)" },
    { topic_id: tid, slug: 'lnlog.glog_regel',         description: 'Afgeleide van ᵍlog(x) = 1/(x·ln(g))' },
    { topic_id: tid, slug: 'lnlog.product_toepassen',  description: 'Productregel combineren met ln' },
    { topic_id: tid, slug: 'lnlog.quotient_toepassen', description: 'Quotiëntregel combineren met ln' },
    { topic_id: tid, slug: 'lnlog.uitfactoren',        description: 'Antwoord vereenvoudigen' },
  ], { onConflict: 'slug' })
  console.log('Root causes OK')

  // ── 4. Delete old questions ───────────────────────────────────────────────
  await sb.from('questions').delete().eq('topic_id', tid).eq('is_ai_generated', false)

  const Q = (slug: string, body: string, lb: string, ans: string, la: string,
             diff: number, tags: string[], order: number) => ({
    topic_id: tid, cluster_id: C[slug],
    body, latex_body: lb, answer: ans, latex_answer: la,
    difficulty: diff, root_cause_tags: tags, is_ai_generated: false, order_index: order,
  })
  const LN = 'lnlog.ln_herkennen', KL = 'lnlog.ketting_lineair', KP = 'lnlog.ketting_polynoom'
  const GL = 'lnlog.glog_regel', PR = 'lnlog.product_toepassen'
  const QR = 'lnlog.quotient_toepassen', UF = 'lnlog.uitfactoren'

  const questions = [
    // ── standaard diff 1 ───────────────────────────────────────────────────
    Q('standaard',"Bepaal f'(x) als f(x) = ln(x)",'f(x) = \\ln(x)','1/x','\\dfrac{1}{x}',1,[LN],1),
    Q('standaard',"Bepaal f'(x) als f(x) = 2ln(x)",'f(x) = 2\\ln(x)','2/x','\\dfrac{2}{x}',1,[LN],2),
    Q('standaard',"Bepaal f'(x) als f(x) = ln(3x)",'f(x) = \\ln(3x)','1/x','\\dfrac{1}{x}',1,[KL],3),
    Q('standaard',"Bepaal f'(x) als f(x) = ln(3x+1)",'f(x) = \\ln(3x+1)','3/(3x+1)','\\dfrac{3}{3x+1}',1,[KL],4),
    // diff 2
    Q('standaard',"Bepaal f'(x) als f(x) = 4ln(x)",'f(x) = 4\\ln(x)','4/x','\\dfrac{4}{x}',2,[LN],5),
    Q('standaard',"Bepaal f'(x) als f(x) = ln(2x+5)",'f(x) = \\ln(2x+5)','2/(2x+5)','\\dfrac{2}{2x+5}',2,[KL],6),
    Q('standaard',"Bepaal f'(x) als f(x) = ³log(x)",'f(x) = \\log_3(x)','1/(xln(3))','\\dfrac{1}{x\\ln(3)}',2,[GL],7),
    Q('standaard',"Bepaal f'(x) als f(x) = ²log(x)",'f(x) = \\log_2(x)','1/(xln(2))','\\dfrac{1}{x\\ln(2)}',2,[GL],8),
    // diff 3
    Q('standaard',"Bepaal f'(x) als f(x) = ³log(2x+1)",'f(x) = \\log_3(2x+1)','2/((2x+1)ln(3))','\\dfrac{2}{(2x+1)\\ln(3)}',3,[GL,KL],9),

    // ── combi_somregel diff 2 ──────────────────────────────────────────────
    Q('combi_somregel',"Bepaal f'(x) als f(x) = x + ln(x)",'f(x) = x + \\ln(x)','1+1/x','1+\\dfrac{1}{x}',2,[LN],1),
    Q('combi_somregel',"Bepaal f'(x) als f(x) = x² + ln(x)",'f(x) = x^{2} + \\ln(x)','2x+1/x','2x+\\dfrac{1}{x}',2,[LN],2),
    Q('combi_somregel',"Bepaal f'(x) als f(x) = 3x − ln(x)",'f(x) = 3x - \\ln(x)','3-1/x','3-\\dfrac{1}{x}',2,[LN],3),
    Q('combi_somregel',"Bepaal f'(x) als f(x) = x³ + 2ln(x)",'f(x) = x^{3} + 2\\ln(x)','3x^2+2/x','3x^{2}+\\dfrac{2}{x}',2,[LN],4),
    Q('combi_somregel',"Bepaal f'(x) als f(x) = x + ln(3x+2)",'f(x) = x + \\ln(3x+2)','1+3/(3x+2)','1+\\dfrac{3}{3x+2}',2,[KL],5),
    // diff 3
    Q('combi_somregel',"Bepaal f'(x) als f(x) = e^x + ln(x)",'f(x) = e^{x} + \\ln(x)','e^x+1/x','e^{x}+\\dfrac{1}{x}',3,[LN],6),
    Q('combi_somregel',"Bepaal f'(x) als f(x) = e^{2x} + ln(x)",'f(x) = e^{2x} + \\ln(x)','2e^(2x)+1/x','2e^{2x}+\\dfrac{1}{x}',3,[LN],7),
    Q('combi_somregel',"Bepaal f'(x) als f(x) = x² + ln(x²+1)",'f(x) = x^{2} + \\ln(x^{2}+1)','2x+2x/(x^2+1)','2x+\\dfrac{2x}{x^{2}+1}',3,[KP],8),
    Q('combi_somregel',"Bepaal f'(x) als f(x) = ln(x) + ³log(x)",'f(x) = \\ln(x) + \\log_3(x)','1/x+1/(xln(3))','\\dfrac{1}{x}+\\dfrac{1}{x\\ln(3)}',3,[LN,GL],9),

    // ── combi_productregel diff 2 ──────────────────────────────────────────
    Q('combi_productregel',"Bepaal f'(x) als f(x) = x·ln(x)",'f(x) = x\\ln(x)','1+ln(x)','1+\\ln(x)',2,[PR],1),
    Q('combi_productregel',"Bepaal f'(x) als f(x) = x²·ln(x)",'f(x) = x^{2}\\ln(x)','2xln(x)+x','2x\\ln(x)+x',2,[PR,UF],2),
    Q('combi_productregel',"Bepaal f'(x) als f(x) = (x+1)·ln(x)",'f(x) = (x+1)\\ln(x)','ln(x)+(x+1)/x','\\ln(x)+\\dfrac{x+1}{x}',2,[PR],3),
    Q('combi_productregel',"Bepaal f'(x) als f(x) = x·ln(2x+1)",'f(x) = x\\ln(2x+1)','ln(2x+1)+2x/(2x+1)','\\ln(2x+1)+\\dfrac{2x}{2x+1}',2,[PR,KL],4),
    Q('combi_productregel',"Bepaal f'(x) als f(x) = (x−1)·ln(x)",'f(x) = (x-1)\\ln(x)','ln(x)+(x-1)/x','\\ln(x)+\\dfrac{x-1}{x}',2,[PR],5),
    // diff 3
    Q('combi_productregel',"Bepaal f'(x) als f(x) = x²·ln(2x)",'f(x) = x^{2}\\ln(2x)','2xln(2x)+x','2x\\ln(2x)+x',3,[PR,KL,UF],6),
    Q('combi_productregel',"Bepaal f'(x) als f(x) = x·ln(x²)",'f(x) = x\\ln(x^{2})','ln(x^2)+2','\\ln(x^{2})+2',3,[PR,KP],7),
    Q('combi_productregel',"Bepaal f'(x) als f(x) = (x²−1)·ln(x)",'f(x) = (x^{2}-1)\\ln(x)','2xln(x)+(x^2-1)/x','2x\\ln(x)+\\dfrac{x^{2}-1}{x}',3,[PR,UF],8),
    Q('combi_productregel',"Bepaal f'(x) als f(x) = (x²+x)·ln(x)",'f(x) = (x^{2}+x)\\ln(x)','(2x+1)ln(x)+x+1','(2x+1)\\ln(x)+x+1',3,[PR,UF],9),

    // ── combi_kettingregel diff 2 ──────────────────────────────────────────
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = ln(x²)",'f(x) = \\ln(x^{2})','2/x','\\dfrac{2}{x}',2,[KP],1),
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = ln(x²+1)",'f(x) = \\ln(x^{2}+1)','2x/(x^2+1)','\\dfrac{2x}{x^{2}+1}',2,[KP],2),
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = ln(x²−1)",'f(x) = \\ln(x^{2}-1)','2x/(x^2-1)','\\dfrac{2x}{x^{2}-1}',2,[KP],3),
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = ln(x²+2x)",'f(x) = \\ln(x^{2}+2x)','(2x+2)/(x^2+2x)','\\dfrac{2x+2}{x^{2}+2x}',2,[KP],4),
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = 2ln(x²+1)",'f(x) = 2\\ln(x^{2}+1)','4x/(x^2+1)','\\dfrac{4x}{x^{2}+1}',2,[KP],5),
    // diff 3
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = ln(x³+1)",'f(x) = \\ln(x^{3}+1)','3x^2/(x^3+1)','\\dfrac{3x^{2}}{x^{3}+1}',3,[KP],6),
    Q('combi_kettingregel',"Bepaal h'(x) als h(x) = ³log(x²+1)",'h(x) = \\log_3(x^{2}+1)','2x/((x^2+1)ln(3))','\\dfrac{2x}{(x^{2}+1)\\ln(3)}',3,[GL,KP],7),
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = ln(√x)",'f(x) = \\ln(\\sqrt{x})','1/(2x)','\\dfrac{1}{2x}',3,[KP],8),
    Q('combi_kettingregel',"Bepaal f'(x) als f(x) = ln(x²+3x+2)",'f(x) = \\ln(x^{2}+3x+2)','(2x+3)/(x^2+3x+2)','\\dfrac{2x+3}{x^{2}+3x+2}',3,[KP],9),

    // ── combi_quotientregel diff 2 ─────────────────────────────────────────
    Q('combi_quotientregel',"Bepaal f'(x) als f(x) = ln(x)/x",'f(x) = \\dfrac{\\ln(x)}{x}','(1-ln(x))/x^2','\\dfrac{1-\\ln(x)}{x^{2}}',2,[QR,UF],1),
    Q('combi_quotientregel',"Bepaal f'(x) als f(x) = (ln(x)+1)/x",'f(x) = \\dfrac{\\ln(x)+1}{x}','-ln(x)/x^2','\\dfrac{-\\ln(x)}{x^{2}}',2,[QR,UF],2),
    Q('combi_quotientregel',"Bepaal f'(x) als f(x) = ln(x)/x²",'f(x) = \\dfrac{\\ln(x)}{x^{2}}','(1-2ln(x))/x^3','\\dfrac{1-2\\ln(x)}{x^{3}}',2,[QR,UF],3),
    Q('combi_quotientregel',"Bepaal f'(x) als f(x) = x/ln(x)",'f(x) = \\dfrac{x}{\\ln(x)}','(ln(x)-1)/(ln(x))^2','\\dfrac{\\ln(x)-1}{(\\ln(x))^{2}}',2,[QR],4),
    Q('combi_quotientregel',"Bepaal f'(x) als f(x) = x²/ln(x)",'f(x) = \\dfrac{x^{2}}{\\ln(x)}','x(2ln(x)-1)/(ln(x))^2','\\dfrac{x(2\\ln(x)-1)}{(\\ln(x))^{2}}',2,[QR,UF],5),
    // diff 3
    Q('combi_quotientregel',"Bepaal f'(x) als f(x) = 2/ln(x)",'f(x) = \\dfrac{2}{\\ln(x)}','-2/(xln(x)^2)','\\dfrac{-2}{x(\\ln(x))^{2}}',3,[QR],6),
    Q('combi_quotientregel',"Bepaal f'(x) als f(x) = (x+1)/ln(x)",'f(x) = \\dfrac{x+1}{\\ln(x)}','(xln(x)-x-1)/(xln(x)^2)','\\dfrac{x\\ln(x)-x-1}{x(\\ln(x))^{2}}',3,[QR,UF],7),
    Q('combi_quotientregel',"Bepaal f'(x) als f(x) = (ln(x))²/x",'f(x) = \\dfrac{(\\ln(x))^{2}}{x}','ln(x)(2-ln(x))/x^2','\\dfrac{\\ln(x)(2-\\ln(x))}{x^{2}}',3,[QR,UF],8),
    Q('combi_quotientregel',"Bepaal f'(x) als f(x) = x²/ln(2x)",'f(x) = \\dfrac{x^{2}}{\\ln(2x)}','x(2ln(2x)-1)/(ln(2x))^2','\\dfrac{x(2\\ln(2x)-1)}{(\\ln(2x))^{2}}',3,[QR,KL,UF],9),
  ]

  const { data: inserted, error: iqe } = await sb.from('questions').insert(questions).select('id,latex_body')
  if (iqe) { console.error('Questions:', iqe); process.exit(1) }
  console.log(`Inserted ${inserted?.length} questions`)

  // ── 5. Step plan for x²·ln(x) ────────────────────────────────────────────
  const { data: rcRows } = await sb.from('root_causes').select('id,slug')
  const RC = Object.fromEntries((rcRows ?? []).map(r => [r.slug, r.id]))

  const xlnx = inserted?.find(q => q.latex_body === 'f(x) = x^{2}\\ln(x)')
  if (xlnx) {
    await sb.from('question_steps').upsert([
      { question_id: xlnx.id, step_order: 1, step_description: 'Herken de productregel: f = x²  en  g = ln(x)', root_cause_id: RC['productregel.fg_identificeren'] },
      { question_id: xlnx.id, step_order: 2, step_description: "Differentieer f: f' = 2x", root_cause_id: RC['productregel.f_differentieren'] },
      { question_id: xlnx.id, step_order: 3, step_description: "Differentieer g: g' = 1/x", root_cause_id: RC['lnlog.ln_herkennen'] },
      { question_id: xlnx.id, step_order: 4, step_description: "f'·g + f·g' = 2x·ln(x) + x²·(1/x) = 2x·ln(x) + x", root_cause_id: RC['productregel.formule_invullen'] },
      { question_id: xlnx.id, step_order: 5, step_description: "Factoriseer x: g'(x) = x(2ln(x)+1)", root_cause_id: RC['lnlog.uitfactoren'] },
    ], { onConflict: 'question_id,step_order' })
    console.log('Step plan OK: x²·ln(x)')
  }

  // ── 6. Step plan for (ln(x)+1)/x ─────────────────────────────────────────
  const lnq = inserted?.find(q => q.latex_body === 'f(x) = \\dfrac{\\ln(x)+1}{x}')
  if (lnq) {
    await sb.from('question_steps').upsert([
      { question_id: lnq.id, step_order: 1, step_description: 'Herken de quotiëntregel: t = ln(x)+1  en  n = x', root_cause_id: RC['quotientregel.tn_identificeren'] },
      { question_id: lnq.id, step_order: 2, step_description: "Differentieer t: t' = 1/x", root_cause_id: RC['lnlog.ln_herkennen'] },
      { question_id: lnq.id, step_order: 3, step_description: "Differentieer n: n' = 1", root_cause_id: RC['quotientregel.n_differentieren'] },
      { question_id: lnq.id, step_order: 4, step_description: "t'n − tn' = (1/x)·x − (ln(x)+1)·1 = 1 − ln(x) − 1 = −ln(x)", root_cause_id: RC['quotientregel.formule_volgorde'] },
      { question_id: lnq.id, step_order: 5, step_description: "f'(x) = −ln(x)/x²", root_cause_id: RC['quotientregel.noemer_kwadraat'] },
    ], { onConflict: 'question_id,step_order' })
    console.log('Step plan OK: (ln(x)+1)/x')
  }

  console.log('\n✓ Migration 0011 complete')
}

main().catch(e => { console.error(e); process.exit(1) })
