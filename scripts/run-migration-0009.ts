/**
 * Migration 0009: Redesign kettingregel — 7 clusters, 63 questions
 * Run with: npx tsx scripts/run-migration-0009.ts
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!url || !key) { console.error('Missing env vars'); process.exit(1) }
const sb = createClient(url, key)

async function main() {
  // ── topic id ──────────────────────────────────────────────────────────────
  const { data: topic } = await sb.from('topics').select('id').eq('slug', 'kettingregel').single()
  if (!topic) { console.error('Topic not found'); process.exit(1) }
  const tid = topic.id
  console.log('topic id:', tid)

  // ── 1. Delete old clusters + upsert new 7 ─────────────────────────────────
  await sb.from('topic_clusters').delete()
    .eq('topic_id', tid)
    .in('slug', ['macht_lineair','macht_veelterm','wortel','negatieve_macht',
                 'plus_productregel','plus_quotientregel','combi_somregel'])

  const clusters = [
    { topic_id: tid, slug: 'macht_lineair',      title: 'Lineaire kern',           order_index: 1 },
    { topic_id: tid, slug: 'macht_veelterm',      title: 'Polynoomkern',            order_index: 2 },
    { topic_id: tid, slug: 'wortel',              title: 'Wortels',                 order_index: 3 },
    { topic_id: tid, slug: 'negatieve_macht',     title: 'Negatieve machten',       order_index: 4 },
    { topic_id: tid, slug: 'combi_somregel',      title: 'Combi met somregel',      order_index: 5 },
    { topic_id: tid, slug: 'plus_productregel',   title: 'Combi met productregel',  order_index: 6 },
    { topic_id: tid, slug: 'plus_quotientregel',  title: 'Combi met quotiëntregel', order_index: 7 },
  ]
  const { error: ce } = await sb.from('topic_clusters').upsert(clusters, { onConflict: 'topic_id,slug' })
  if (ce) { console.error('Clusters:', ce); process.exit(1) }
  console.log('Clusters OK')

  // ── 2. Extra root cause ───────────────────────────────────────────────────
  await sb.from('root_causes').upsert([{
    topic_id: tid, slug: 'kettingregel.combi_somregel',
    description: 'Andere term(en) naast kettingregelterm apart differentiëren',
  }], { onConflict: 'slug' })
  console.log('Root cause OK')

  // ── 3. Fetch cluster ids ──────────────────────────────────────────────────
  const { data: cls } = await sb.from('topic_clusters').select('id,slug').eq('topic_id', tid)
  const C = Object.fromEntries((cls ?? []).map(c => [c.slug, c.id]))
  console.log('Cluster map:', C)

  // ── 4. Delete old questions ───────────────────────────────────────────────
  await sb.from('questions').delete().eq('topic_id', tid).eq('is_ai_generated', false)
  console.log('Old questions deleted')

  // helper
  const Q = (slug: string, body: string, lb: string, ans: string, la: string,
             diff: number, tags: string[], order: number) => ({
    topic_id: tid, cluster_id: C[slug],
    body, latex_body: lb, answer: ans, latex_answer: la,
    difficulty: diff, root_cause_tags: tags, is_ai_generated: false, order_index: order,
  })
  const KL = 'kettingregel'
  const bi = `${KL}.binnenste_differentieren`, bu = `${KL}.buitenste_differentieren`
  const vm = `${KL}.vermenigvuldigen`, hr = `${KL}.herschrijven_machtsvorm`
  const rc = `${KL}.regel_combineren`, cs = `${KL}.combi_somregel`
  const vs = `${KL}.vereenvoudigen`
  const pf = 'productregel.formule_invullen', qf = 'quotientregel.formule_volgorde'

  const questions = [
    // ── macht_lineair diff 1 ───────────────────────────────────────────────
    Q('macht_lineair',"Bepaal f'(x) als f(x) = (x−3)^4",'f(x) = (x-3)^{4}','4(x-3)^3','4(x-3)^{3}',1,[bu,vm],1),
    Q('macht_lineair',"Bepaal f'(x) als f(x) = (2x+1)^3",'f(x) = (2x+1)^{3}','6(2x+1)^2','6(2x+1)^{2}',1,[bi,vm],2),
    Q('macht_lineair',"Bepaal f'(x) als f(x) = (3x+2)^2",'f(x) = (3x+2)^{2}','6(3x+2)','6(3x+2)',1,[bi,vm],3),
    // diff 2
    Q('macht_lineair',"Bepaal f'(x) als f(x) = (4x+3)^3",'f(x) = (4x+3)^{3}','12(4x+3)^2','12(4x+3)^{2}',2,[bi,vm],4),
    Q('macht_lineair',"Bepaal f'(x) als f(x) = −2(2x+1)^4",'f(x) = -2(2x+1)^{4}','-16(2x+1)^3','-16(2x+1)^{3}',2,[bi,vm],5),
    Q('macht_lineair',"Bepaal f'(x) als f(x) = (3x−1)^5",'f(x) = (3x-1)^{5}','15(3x-1)^4','15(3x-1)^{4}',2,[bi,vm],6),
    Q('macht_lineair',"Bepaal f'(x) als f(x) = 4(x−2)^3",'f(x) = 4(x-2)^{3}','12(x-2)^2','12(x-2)^{2}',2,[bu,vm],7),
    // diff 3
    Q('macht_lineair',"Bepaal f'(x) als f(x) = (1−2x)^6",'f(x) = (1-2x)^{6}','-12(1-2x)^5','-12(1-2x)^{5}',3,[bi,vm],8),
    Q('macht_lineair',"Bepaal f'(x) als f(x) = (2−3x)^5",'f(x) = (2-3x)^{5}','-15(2-3x)^4','-15(2-3x)^{4}',3,[bi,vm],9),

    // ── macht_veelterm diff 2 ──────────────────────────────────────────────
    Q('macht_veelterm',"Bepaal f'(x) als f(x) = (x²+1)^3",'f(x) = (x^{2}+1)^{3}','6x(x^2+1)^2','6x(x^{2}+1)^{2}',2,[bi,vm],1),
    Q('macht_veelterm',"Bepaal f'(x) als f(x) = (x²−4)^2",'f(x) = (x^{2}-4)^{2}','4x(x^2-4)','4x(x^{2}-4)',2,[bi,vm],2),
    Q('macht_veelterm',"Bepaal f'(x) als f(x) = (2x²+1)^3",'f(x) = (2x^{2}+1)^{3}','12x(2x^2+1)^2','12x(2x^{2}+1)^{2}',2,[bi,vm],3),
    Q('macht_veelterm',"Bepaal f'(x) als f(x) = (x²+3x)^2",'f(x) = (x^{2}+3x)^{2}','2(2x+3)(x^2+3x)','2(2x+3)(x^{2}+3x)',2,[bi,vm],4),
    // diff 3
    Q('macht_veelterm',"Bepaal f'(x) als f(x) = (4x²−3)^4",'f(x) = (4x^{2}-3)^{4}','32x(4x^2-3)^3','32x(4x^{2}-3)^{3}',3,[bi,vm],5),
    Q('macht_veelterm',"Bepaal f'(x) als f(x) = (x²−2x+3)^3",'f(x) = (x^{2}-2x+3)^{3}','6(x-1)(x^2-2x+3)^2','6(x-1)(x^{2}-2x+3)^{2}',3,[bi,vm],6),
    Q('macht_veelterm',"Bepaal f'(x) als f(x) = 4(x³+7x−2)^2",'f(x) = 4(x^{3}+7x-2)^{2}','8(3x^2+7)(x^3+7x-2)','8(3x^{2}+7)(x^{3}+7x-2)',3,[bi,vm],7),
    Q('macht_veelterm',"Bepaal f'(x) als f(x) = (x²+x+1)^4",'f(x) = (x^{2}+x+1)^{4}','4(2x+1)(x^2+x+1)^3','4(2x+1)(x^{2}+x+1)^{3}',3,[bi,vm],8),
    Q('macht_veelterm',"Bepaal f'(x) als f(x) = (x³−x)^2",'f(x) = (x^{3}-x)^{2}','2(3x^2-1)(x^3-x)','2(3x^{2}-1)(x^{3}-x)',3,[bi,vm],9),

    // ── wortel diff 1 ──────────────────────────────────────────────────────
    Q('wortel',"Bepaal f'(x) als f(x) = √(x+5)",'f(x) = \\sqrt{x+5}','1/(2sqrt(x+5))','\\dfrac{1}{2\\sqrt{x+5}}',1,[hr,vm],1),
    Q('wortel',"Bepaal f'(x) als f(x) = √(2x+1)",'f(x) = \\sqrt{2x+1}','1/sqrt(2x+1)','\\dfrac{1}{\\sqrt{2x+1}}',1,[hr,bi],2),
    Q('wortel',"Bepaal f'(x) als f(x) = √(4x+1)",'f(x) = \\sqrt{4x+1}','2/sqrt(4x+1)','\\dfrac{2}{\\sqrt{4x+1}}',1,[hr,bi],3),
    // diff 2
    Q('wortel',"Bepaal f'(x) als f(x) = √(3x−2)",'f(x) = \\sqrt{3x-2}','3/(2sqrt(3x-2))','\\dfrac{3}{2\\sqrt{3x-2}}',2,[hr,bi],4),
    Q('wortel',"Bepaal f'(x) als f(x) = 3√(2x−1)",'f(x) = 3\\sqrt{2x-1}','3/sqrt(2x-1)','\\dfrac{3}{\\sqrt{2x-1}}',2,[hr,bi],5),
    Q('wortel',"Bepaal f'(x) als f(x) = √(x²+1)",'f(x) = \\sqrt{x^{2}+1}','x/sqrt(x^2+1)','\\dfrac{x}{\\sqrt{x^{2}+1}}',2,[hr,bi],6),
    // diff 3
    Q('wortel',"Bepaal f'(x) als f(x) = √(2x²+4x)",'f(x) = \\sqrt{2x^{2}+4x}','(2x+2)/sqrt(2x^2+4x)','\\dfrac{2x+2}{\\sqrt{2x^{2}+4x}}',3,[hr,bi],7),
    Q('wortel',"Bepaal f'(x) als f(x) = √(x²+2x+3)",'f(x) = \\sqrt{x^{2}+2x+3}','(x+1)/sqrt(x^2+2x+3)','\\dfrac{x+1}{\\sqrt{x^{2}+2x+3}}',3,[hr,bi],8),
    Q('wortel',"Bepaal f'(x) als f(x) = 4√(x²+3)",'f(x) = 4\\sqrt{x^{2}+3}','4x/sqrt(x^2+3)','\\dfrac{4x}{\\sqrt{x^{2}+3}}',3,[hr,bi],9),

    // ── negatieve_macht diff 2 ─────────────────────────────────────────────
    Q('negatieve_macht',"Bepaal f'(x) als f(x) = 1/(x+1)^2",'f(x) = \\dfrac{1}{(x+1)^{2}}','-2/(x+1)^3','\\dfrac{-2}{(x+1)^{3}}',2,[hr,vm],1),
    Q('negatieve_macht',"Bepaal f'(x) als f(x) = 1/(2x−1)^3",'f(x) = \\dfrac{1}{(2x-1)^{3}}','-6/(2x-1)^4','\\dfrac{-6}{(2x-1)^{4}}',2,[hr,bi,vm],2),
    Q('negatieve_macht',"Bepaal f'(x) als f(x) = 1/(3x+2)^2",'f(x) = \\dfrac{1}{(3x+2)^{2}}','-6/(3x+2)^3','\\dfrac{-6}{(3x+2)^{3}}',2,[hr,bi],3),
    Q('negatieve_macht',"Bepaal f'(x) als f(x) = 1/√(2x+1)",'f(x) = \\dfrac{1}{\\sqrt{2x+1}}','-1/(2x+1)^(3/2)','\\dfrac{-1}{(2x+1)^{3/2}}',2,[hr,vm],4),
    Q('negatieve_macht',"Bepaal f'(x) als f(x) = 1/√(4x−1)",'f(x) = \\dfrac{1}{\\sqrt{4x-1}}','-2/(4x-1)^(3/2)','\\dfrac{-2}{(4x-1)^{3/2}}',2,[hr,bi],5),
    // diff 3
    Q('negatieve_macht',"Bepaal f'(x) als f(x) = 1/(x²+1)^2",'f(x) = \\dfrac{1}{(x^{2}+1)^{2}}','-4x/(x^2+1)^3','\\dfrac{-4x}{(x^{2}+1)^{3}}',3,[hr,bi,vm],6),
    Q('negatieve_macht',"Bepaal f'(x) als f(x) = 4/(2x+3)^3",'f(x) = \\dfrac{4}{(2x+3)^{3}}','-24/(2x+3)^4','\\dfrac{-24}{(2x+3)^{4}}',3,[hr,bi],7),
    Q('negatieve_macht',"Bepaal f'(x) als f(x) = 1/√(x²+2x+3)",'f(x) = \\dfrac{1}{\\sqrt{x^{2}+2x+3}}','-(x+1)/(x^2+2x+3)^(3/2)','\\dfrac{-(x+1)}{(x^{2}+2x+3)^{3/2}}',3,[hr,bi],8),
    Q('negatieve_macht',"Bepaal f'(x) als f(x) = −6/(x²+3x)^3",'f(x) = \\dfrac{-6}{(x^{2}+3x)^{3}}','18(2x+3)/(x^2+3x)^4','\\dfrac{18(2x+3)}{(x^{2}+3x)^{4}}',3,[hr,bi,vm],9),

    // ── combi_somregel diff 2 ──────────────────────────────────────────────
    Q('combi_somregel',"Bepaal f'(x) als f(x) = x² + (2x+1)^3",'f(x) = x^{2} + (2x+1)^{3}','2x+6(2x+1)^2','2x+6(2x+1)^{2}',2,[bu,cs],1),
    Q('combi_somregel',"Bepaal f'(x) als f(x) = 2x + (3x−1)^2",'f(x) = 2x + (3x-1)^{2}','2+6(3x-1)','2+6(3x-1)',2,[bi,cs],2),
    Q('combi_somregel',"Bepaal f'(x) als f(x) = x³ + (x+2)^4",'f(x) = x^{3} + (x+2)^{4}','3x^2+4(x+2)^3','3x^{2}+4(x+2)^{3}',2,[bu,cs],3),
    Q('combi_somregel',"Bepaal f'(x) als f(x) = x + √(2x+1)",'f(x) = x + \\sqrt{2x+1}','1+1/sqrt(2x+1)','1+\\dfrac{1}{\\sqrt{2x+1}}',2,[hr,cs],4),
    Q('combi_somregel',"Bepaal f'(x) als f(x) = 3x² + √(x²+1)",'f(x) = 3x^{2} + \\sqrt{x^{2}+1}','6x+x/sqrt(x^2+1)','6x+\\dfrac{x}{\\sqrt{x^{2}+1}}',2,[hr,cs],5),
    // diff 3
    Q('combi_somregel',"Bepaal f'(x) als f(x) = 5x − 4/(3x+2)^3",'f(x) = 5x - \\dfrac{4}{(3x+2)^{3}}','5+36/(3x+2)^4','5+\\dfrac{36}{(3x+2)^{4}}',3,[hr,cs],6),
    Q('combi_somregel',"Bepaal f'(x) als f(x) = 3x² − (2x−1)^3",'f(x) = 3x^{2} - (2x-1)^{3}','6x-6(2x-1)^2','6x-6(2x-1)^{2}',3,[bi,cs],7),
    Q('combi_somregel',"Bepaal f'(x) als f(x) = x − 1/(2x+1)^2",'f(x) = x - \\dfrac{1}{(2x+1)^{2}}','1+4/(2x+1)^3','1+\\dfrac{4}{(2x+1)^{3}}',3,[hr,cs],8),
    Q('combi_somregel',"Bepaal f'(x) als f(x) = x² + (x²+1)^3",'f(x) = x^{2} + (x^{2}+1)^{3}','2x+6x(x^2+1)^2','2x+6x(x^{2}+1)^{2}',3,[bi,cs],9),

    // ── plus_productregel diff 2 ───────────────────────────────────────────
    Q('plus_productregel',"Bepaal f'(x) als f(x) = x·√(2x+1)",'f(x) = x\\sqrt{2x+1}','(3x+1)/sqrt(2x+1)','\\dfrac{3x+1}{\\sqrt{2x+1}}',2,[rc,pf,hr],1),
    Q('plus_productregel',"Bepaal f'(x) als f(x) = x·(2x+1)^3",'f(x) = x(2x+1)^{3}','(2x+1)^3+6x(2x+1)^2','(2x+1)^{3}+6x(2x+1)^{2}',2,[rc,pf],2),
    Q('plus_productregel',"Bepaal f'(x) als f(x) = x·√(3x+1)",'f(x) = x\\sqrt{3x+1}','(9x+2)/(2sqrt(3x+1))','\\dfrac{9x+2}{2\\sqrt{3x+1}}',2,[rc,pf,hr],3),
    Q('plus_productregel',"Bepaal f'(x) als f(x) = x²·√(x+1)",'f(x) = x^{2}\\sqrt{x+1}','(5x^2+4x)/(2sqrt(x+1))','\\dfrac{5x^{2}+4x}{2\\sqrt{x+1}}',2,[rc,pf,hr],4),
    // diff 3
    Q('plus_productregel',"Bepaal f'(x) als f(x) = x·(3x+1)^3",'f(x) = x(3x+1)^{3}','(3x+1)^3+9x(3x+1)^2','(3x+1)^{3}+9x(3x+1)^{2}',3,[rc,pf],5),
    Q('plus_productregel',"Bepaal f'(x) als f(x) = x·√(x²+1)",'f(x) = x\\sqrt{x^{2}+1}','(2x^2+1)/sqrt(x^2+1)','\\dfrac{2x^{2}+1}{\\sqrt{x^{2}+1}}',3,[rc,pf,bi],6),
    Q('plus_productregel',"Bepaal f'(x) als f(x) = (x+1)·(2x−1)^3",'f(x) = (x+1)(2x-1)^{3}','(2x-1)^3+6(x+1)(2x-1)^2','(2x-1)^{3}+6(x+1)(2x-1)^{2}',3,[rc,pf],7),
    Q('plus_productregel',"Bepaal f'(x) als f(x) = x·√(3x−1)",'f(x) = x\\sqrt{3x-1}','(9x-2)/(2sqrt(3x-1))','\\dfrac{9x-2}{2\\sqrt{3x-1}}',3,[rc,pf,hr],8),
    Q('plus_productregel',"Bepaal f'(x) als f(x) = x²·(x²+1)^2",'f(x) = x^{2}(x^{2}+1)^{2}','2x(x^2+1)^2+4x^3(x^2+1)','2x(x^{2}+1)^{2}+4x^{3}(x^{2}+1)',3,[rc,pf,bi],9),

    // ── plus_quotientregel diff 2 ──────────────────────────────────────────
    Q('plus_quotientregel',"Bepaal f'(x) als f(x) = x/√(2x+1)",'f(x) = \\dfrac{x}{\\sqrt{2x+1}}','(x+1)/(2x+1)^(3/2)','\\dfrac{x+1}{(2x+1)^{3/2}}',2,[rc,qf,hr],1),
    Q('plus_quotientregel',"Bepaal f'(x) als f(x) = x/√(4x−1)",'f(x) = \\dfrac{x}{\\sqrt{4x-1}}','(2x-1)/(4x-1)^(3/2)','\\dfrac{2x-1}{(4x-1)^{3/2}}',2,[rc,qf,hr],2),
    Q('plus_quotientregel',"Bepaal f'(x) als f(x) = (x+3)/√(2x+1)",'f(x) = \\dfrac{x+3}{\\sqrt{2x+1}}','(x-2)/(2x+1)^(3/2)','\\dfrac{x-2}{(2x+1)^{3/2}}',2,[rc,qf,hr],3),
    Q('plus_quotientregel',"Bepaal f'(x) als f(x) = (x²+1)/(2x+1)",'f(x) = \\dfrac{x^{2}+1}{2x+1}','(2x^2+2x-2)/(2x+1)^2','\\dfrac{2x^{2}+2x-2}{(2x+1)^{2}}',2,[rc,qf],4),
    Q('plus_quotientregel',"Bepaal g'(x) als g(x) = (x+6)/√(8x+9)",'g(x) = \\dfrac{x+6}{\\sqrt{8x+9}}','(4x-15)/(8x+9)^(3/2)','\\dfrac{4x-15}{(8x+9)^{3/2}}',2,[rc,qf,hr],5),
    // diff 3
    Q('plus_quotientregel',"Bepaal k'(x) als k(x) = (x²−1)/√(4x+1)",'k(x) = \\dfrac{x^{2}-1}{\\sqrt{4x+1}}','(6x^2+2x+2)/(4x+1)^(3/2)','\\dfrac{6x^{2}+2x+2}{(4x+1)^{3/2}}',3,[rc,qf,bi],6),
    Q('plus_quotientregel',"Bepaal f'(x) als f(x) = (x²+1)/(3x−2)^2",'f(x) = \\dfrac{x^{2}+1}{(3x-2)^{2}}','(-4x-6)/(3x-2)^3','\\dfrac{-4x-6}{(3x-2)^{3}}',3,[rc,qf,bi],7),
    Q('plus_quotientregel',"Bepaal f'(x) als f(x) = (2x+1)^2/(x+1)",'f(x) = \\dfrac{(2x+1)^{2}}{x+1}','(2x+1)(2x+3)/(x+1)^2','\\dfrac{(2x+1)(2x+3)}{(x+1)^{2}}',3,[rc,qf],8),
    Q('plus_quotientregel',"Bepaal h'(x) als h(x) = (x²+1)/√(x+1)",'h(x) = \\dfrac{x^{2}+1}{\\sqrt{x+1}}','(3x^2+4x-1)/(2(x+1)^(3/2))','\\dfrac{3x^{2}+4x-1}{2(x+1)^{3/2}}',3,[rc,qf,bi],9),
  ]

  const { data: inserted, error: iqe } = await sb.from('questions').insert(questions).select('id,latex_body')
  if (iqe) { console.error('Insert questions:', iqe); process.exit(1) }
  console.log(`Inserted ${inserted?.length} questions`)

  // ── 5. Step plans ─────────────────────────────────────────────────────────
  const { data: rcRows } = await sb.from('root_causes').select('id,slug')
  const RC = Object.fromEntries((rcRows ?? []).map(r => [r.slug, r.id]))

  // Plan 1: x·√(2x+1)
  const q1 = inserted?.find(q => q.latex_body === 'f(x) = x\\sqrt{2x+1}')
  if (q1) {
    await sb.from('question_steps').upsert([
      { question_id: q1.id, step_order: 1, step_description: 'Herken de productregel: f = x  en  g = √(2x+1)', root_cause_id: RC['productregel.fg_identificeren'] },
      { question_id: q1.id, step_order: 2, step_description: "Differentieer f: f' = 1", root_cause_id: RC['productregel.f_differentieren'] },
      { question_id: q1.id, step_order: 3, step_description: 'Schrijf g als macht: g = (2x+1)^{1/2}  →  kettingregel', root_cause_id: RC['kettingregel.herschrijven_machtsvorm'] },
      { question_id: q1.id, step_order: 4, step_description: "g' = ½·2·(2x+1)^{-1/2} = 1/√(2x+1)", root_cause_id: RC['kettingregel.vermenigvuldigen'] },
      { question_id: q1.id, step_order: 5, step_description: "f'·g + f·g' = √(2x+1) + x/√(2x+1)", root_cause_id: RC['productregel.formule_invullen'] },
      { question_id: q1.id, step_order: 6, step_description: 'Samenvoegen: (2x+1+x)/√(2x+1) = (3x+1)/√(2x+1)', root_cause_id: RC['kettingregel.vereenvoudigen'] },
    ], { onConflict: 'question_id,step_order' })
    console.log('Step plan 1 OK: x·√(2x+1)')
  }

  // Plan 2: (x+6)/√(8x+9)
  const q2 = inserted?.find(q => q.latex_body === 'g(x) = \\dfrac{x+6}{\\sqrt{8x+9}}')
  if (q2) {
    await sb.from('question_steps').upsert([
      { question_id: q2.id, step_order: 1, step_description: 'Herken de quotiëntregel: t = x+6  en  n = √(8x+9)', root_cause_id: RC['quotientregel.tn_identificeren'] },
      { question_id: q2.id, step_order: 2, step_description: "Differentieer t: t' = 1", root_cause_id: RC['quotientregel.t_differentieren'] },
      { question_id: q2.id, step_order: 3, step_description: 'Schrijf n als macht: n = (8x+9)^{1/2}  →  kettingregel', root_cause_id: RC['kettingregel.herschrijven_machtsvorm'] },
      { question_id: q2.id, step_order: 4, step_description: "n' = ½·8·(8x+9)^{-1/2} = 4/√(8x+9)", root_cause_id: RC['kettingregel.vermenigvuldigen'] },
      { question_id: q2.id, step_order: 5, step_description: "t'n − tn' = √(8x+9) − (x+6)·4/√(8x+9)", root_cause_id: RC['quotientregel.formule_volgorde'] },
      { question_id: q2.id, step_order: 6, step_description: 'Teller: 8x+9 − 4(x+6) = 4x−15', root_cause_id: RC['kettingregel.vereenvoudigen'] },
      { question_id: q2.id, step_order: 7, step_description: "g'(x) = (4x−15)/(8x+9)^{3/2}", root_cause_id: RC['quotientregel.noemer_kwadraat'] },
    ], { onConflict: 'question_id,step_order' })
    console.log('Step plan 2 OK: (x+6)/√(8x+9)')
  }

  console.log('\n✓ Migration 0009 complete')
}

main().catch(e => { console.error(e); process.exit(1) })
