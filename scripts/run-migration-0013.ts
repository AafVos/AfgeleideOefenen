/**
 * Migration 0013: Herstructureer basis (3 clusters) + somregel (2 clusters),
 * verwijder machtsregel topic, fix order_indices.
 * Run with: npx tsx scripts/run-migration-0013.ts
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!url || !key) { console.error('Missing env vars'); process.exit(1) }
const sb = createClient(url, key)

async function main() {
  // ── 0. Fix order_indices ──────────────────────────────────────────────────
  await sb.from('topics').update({ order_index: 2 }).eq('slug', 'somregel')
  await sb.from('topics').update({ order_index: 3 }).eq('slug', 'productregel')
  await sb.from('topics').update({ order_index: 4 }).eq('slug', 'quotientregel')
  await sb.from('topics').update({ order_index: 5 }).eq('slug', 'kettingregel')
  await sb.from('topics').update({ order_index: 6 }).eq('slug', 'goniometrie')
  await sb.from('topics').update({ order_index: 7 }).eq('slug', 'emacht')
  await sb.from('topics').update({ order_index: 8 }).eq('slug', 'lnlog')
  console.log('Order indices fixed')

  // ── 1. Verwijder machtsregel topic (cascades via FK naar clusters+questions) ─
  const { data: mr } = await sb.from('topics').select('id').eq('slug', 'machtsregel').maybeSingle()
  if (mr) {
    const { data: mrClusters } = await sb.from('topic_clusters').select('id').eq('topic_id', mr.id)
    for (const c of mrClusters ?? []) {
      await sb.from('questions').delete().eq('cluster_id', c.id)
    }
    await sb.from('topic_clusters').delete().eq('topic_id', mr.id)
    await sb.from('root_causes').delete().eq('topic_id', mr.id)
    await sb.from('topics').delete().eq('id', mr.id)
    console.log('machtsregel verwijderd')
  }

  // ── 2. Basis herstructureren ──────────────────────────────────────────────
  const { data: basisTopic } = await sb.from('topics').select('id').eq('slug', 'basis').single()
  if (!basisTopic) { console.error('basis topic niet gevonden'); process.exit(1) }
  const bid = basisTopic.id

  // Verwijder oude clusters + vragen
  const { data: oldBasisClusters } = await sb.from('topic_clusters').select('id').eq('topic_id', bid)
  for (const c of oldBasisClusters ?? []) {
    await sb.from('questions').delete().eq('cluster_id', c.id)
  }
  await sb.from('topic_clusters').delete().eq('topic_id', bid)
  await sb.from('root_causes').delete().eq('topic_id', bid)

  // Nieuwe clusters
  await sb.from('topic_clusters').insert([
    { topic_id: bid, slug: 'standaard',           title: 'Standaard ax^n',              order_index: 1 },
    { topic_id: bid, slug: 'herschrijven',         title: 'Wortels en negatieve machten', order_index: 2 },
    { topic_id: bid, slug: 'machten_combineren',   title: 'Machten combineren',           order_index: 3 },
  ])
  const { data: bc } = await sb.from('topic_clusters').select('id,slug').eq('topic_id', bid)
  const B = Object.fromEntries((bc ?? []).map(c => [c.slug, c.id]))
  console.log('Basis clusters:', B)

  // Root causes
  await sb.from('root_causes').insert([
    { topic_id: bid, slug: 'basis.machtsregel',     description: "f(x)=ax^n → f'(x)=n·ax^(n-1)" },
    { topic_id: bid, slug: 'basis.herschrijven',    description: 'Schrijf √x=x^½ en 1/x^n=x^(-n) om voor afleiden' },
    { topic_id: bid, slug: 'basis.combineren',      description: 'Gebruik x^a·x^b=x^(a+b) om één macht te maken' },
  ])

  const Qb = (slug: string, body: string, lb: string, ans: string, la: string,
              diff: number, tags: string[], order: number) => ({
    topic_id: bid, cluster_id: B[slug],
    body, latex_body: lb, answer: ans, latex_answer: la,
    difficulty: diff, root_cause_tags: tags, is_ai_generated: false, order_index: order,
  })
  const BM = 'basis.machtsregel', BH = 'basis.herschrijven', BC = 'basis.combineren'

  await sb.from('questions').insert([
    // ── cluster: standaard ────────────────────────────────────────────────
    Qb('standaard',"Bepaal f'(x) als f(x) = x³",'f(x) = x^{3}','3x^2','3x^{2}',1,[BM],1),
    Qb('standaard',"Bepaal f'(x) als f(x) = 2x⁴",'f(x) = 2x^{4}','8x^3','8x^{3}',1,[BM],2),
    Qb('standaard',"Bepaal f'(x) als f(x) = 5x²",'f(x) = 5x^{2}','10x','10x',1,[BM],3),
    Qb('standaard',"Bepaal f'(x) als f(x) = 4x⁵",'f(x) = 4x^{5}','20x^4','20x^{4}',2,[BM],4),
    Qb('standaard',"Bepaal f'(x) als f(x) = −3x⁴",'f(x) = -3x^{4}','-12x^3','-12x^{3}',2,[BM],5),
    Qb('standaard',"Bepaal f'(x) als f(x) = 3x⁷",'f(x) = 3x^{7}','21x^6','21x^{6}',2,[BM],6),
    Qb('standaard',"Bepaal f'(x) als f(x) = −2x⁵",'f(x) = -2x^{5}','-10x^4','-10x^{4}',3,[BM],7),
    Qb('standaard',"Bepaal f'(x) als f(x) = 6x⁶",'f(x) = 6x^{6}','36x^5','36x^{5}',3,[BM],8),
    Qb('standaard',"Bepaal f'(x) als f(x) = −4x³",'f(x) = -4x^{3}','-12x^2','-12x^{2}',3,[BM],9),

    // ── cluster: herschrijven ─────────────────────────────────────────────
    Qb('herschrijven',"Bepaal f'(x) als f(x) = √x",'f(x) = \\sqrt{x}','1/(2sqrt(x))','\\dfrac{1}{2\\sqrt{x}}',1,[BH],1),
    Qb('herschrijven',"Bepaal f'(x) als f(x) = 1/x",'f(x) = \\dfrac{1}{x}','-1/x^2','\\dfrac{-1}{x^{2}}',1,[BH],2),
    Qb('herschrijven',"Bepaal f'(x) als f(x) = 1/x²",'f(x) = \\dfrac{1}{x^{2}}','-2/x^3','\\dfrac{-2}{x^{3}}',1,[BH],3),
    Qb('herschrijven',"Bepaal f'(x) als f(x) = 2√x",'f(x) = 2\\sqrt{x}','1/sqrt(x)','\\dfrac{1}{\\sqrt{x}}',2,[BH],4),
    Qb('herschrijven',"Bepaal f'(x) als f(x) = 3/x",'f(x) = \\dfrac{3}{x}','-3/x^2','\\dfrac{-3}{x^{2}}',2,[BH],5),
    Qb('herschrijven',"Bepaal f'(x) als f(x) = 4/x²",'f(x) = \\dfrac{4}{x^{2}}','-8/x^3','\\dfrac{-8}{x^{3}}',2,[BH],6),
    Qb('herschrijven',"Bepaal f'(x) als f(x) = 2/x³",'f(x) = \\dfrac{2}{x^{3}}','-6/x^4','\\dfrac{-6}{x^{4}}',3,[BH],7),
    Qb('herschrijven',"Bepaal f'(x) als f(x) = 5√x",'f(x) = 5\\sqrt{x}','5/(2sqrt(x))','\\dfrac{5}{2\\sqrt{x}}',3,[BH],8),
    Qb('herschrijven',"Bepaal f'(x) als f(x) = 3/x⁴",'f(x) = \\dfrac{3}{x^{4}}','-12/x^5','\\dfrac{-12}{x^{5}}',3,[BH],9),

    // ── cluster: machten_combineren ───────────────────────────────────────
    Qb('machten_combineren',"Bepaal f'(x) als f(x) = x · x³",'f(x) = x \\cdot x^{3}','4x^3','4x^{3}',1,[BC,BM],1),
    Qb('machten_combineren',"Bepaal f'(x) als f(x) = x² · x⁴",'f(x) = x^{2} \\cdot x^{4}','6x^5','6x^{5}',1,[BC,BM],2),
    Qb('machten_combineren',"Bepaal f'(x) als f(x) = x⁵ · x²",'f(x) = x^{5} \\cdot x^{2}','7x^6','7x^{6}',1,[BC,BM],3),
    Qb('machten_combineren',"Bepaal f'(x) als f(x) = 2x · 3x²",'f(x) = 2x \\cdot 3x^{2}','18x^2','18x^{2}',2,[BC,BM],4),
    Qb('machten_combineren',"Bepaal f'(x) als f(x) = x⁴/x",'f(x) = \\dfrac{x^{4}}{x}','3x^2','3x^{2}',2,[BC,BM],5),
    Qb('machten_combineren',"Bepaal f'(x) als f(x) = x⁶/x²",'f(x) = \\dfrac{x^{6}}{x^{2}}','4x^3','4x^{3}',2,[BC,BM],6),
    Qb('machten_combineren',"Bepaal f'(x) als f(x) = √x · x",'f(x) = \\sqrt{x} \\cdot x','(3/2)sqrt(x)','\\dfrac{3}{2}\\sqrt{x}',3,[BC,BH,BM],7),
    Qb('machten_combineren',"Bepaal f'(x) als f(x) = (x²)³",'f(x) = (x^{2})^{3}','6x^5','6x^{5}',3,[BC,BM],8),
    Qb('machten_combineren',"Bepaal f'(x) als f(x) = x³ · x^{-1}",'f(x) = x^{3} \\cdot x^{-1}','2x','2x',3,[BC,BM],9),
  ])
  console.log('Basis: 27 vragen ingevoegd')

  // ── 3. Somregel herstructureren ───────────────────────────────────────────
  const { data: srTopic } = await sb.from('topics').select('id').eq('slug', 'somregel').single()
  if (!srTopic) { console.error('somregel topic niet gevonden'); process.exit(1) }
  const sid = srTopic.id

  const { data: oldSrClusters } = await sb.from('topic_clusters').select('id').eq('topic_id', sid)
  for (const c of oldSrClusters ?? []) {
    await sb.from('questions').delete().eq('cluster_id', c.id)
  }
  await sb.from('topic_clusters').delete().eq('topic_id', sid)
  await sb.from('root_causes').delete().eq('topic_id', sid)

  await sb.from('topic_clusters').insert([
    { topic_id: sid, slug: 'optelling',          title: 'Optelling',           order_index: 1 },
    { topic_id: sid, slug: 'haakjes_uitwerken',  title: 'Haakjes uitwerken',   order_index: 2 },
  ])
  const { data: sc } = await sb.from('topic_clusters').select('id,slug').eq('topic_id', sid)
  const S = Object.fromEntries((sc ?? []).map(c => [c.slug, c.id]))
  console.log('Somregel clusters:', S)

  await sb.from('root_causes').insert([
    { topic_id: sid, slug: 'somregel.optellen',     description: "Leid elke term apart af: (f+g)'=f'+g'" },
    { topic_id: sid, slug: 'somregel.haakjes',      description: 'Werk haakjes uit, pas dan somregel toe' },
  ])

  const Qs = (slug: string, body: string, lb: string, ans: string, la: string,
              diff: number, tags: string[], order: number) => ({
    topic_id: sid, cluster_id: S[slug],
    body, latex_body: lb, answer: ans, latex_answer: la,
    difficulty: diff, root_cause_tags: tags, is_ai_generated: false, order_index: order,
  })
  const SO = 'somregel.optellen', SH = 'somregel.haakjes'

  await sb.from('questions').insert([
    // ── cluster: optelling ────────────────────────────────────────────────
    Qs('optelling',"Bepaal f'(x) als f(x) = 2x³ + 3x²",'f(x) = 2x^{3}+3x^{2}','6x^2+6x','6x^{2}+6x',1,[SO],1),
    Qs('optelling',"Bepaal f'(x) als f(x) = x⁴ − 5x",'f(x) = x^{4}-5x','4x^3-5','4x^{3}-5',1,[SO],2),
    Qs('optelling',"Bepaal f'(x) als f(x) = 3x² − 4x + 1",'f(x) = 3x^{2}-4x+1','6x-4','6x-4',1,[SO],3),
    Qs('optelling',"Bepaal f'(x) als f(x) = x² + √x",'f(x) = x^{2}+\\sqrt{x}','2x+1/(2sqrt(x))','2x+\\dfrac{1}{2\\sqrt{x}}',2,[SO,BH],4),
    Qs('optelling',"Bepaal f'(x) als f(x) = 3x + 1/x",'f(x) = 3x+\\dfrac{1}{x}','3-1/x^2','3-\\dfrac{1}{x^{2}}',2,[SO,BH],5),
    Qs('optelling',"Bepaal f'(x) als f(x) = x³ − 2/x",'f(x) = x^{3}-\\dfrac{2}{x}','3x^2+2/x^2','3x^{2}+\\dfrac{2}{x^{2}}',2,[SO,BH],6),
    Qs('optelling',"Bepaal f'(x) als f(x) = x · x² + 2x",'f(x) = x \\cdot x^{2}+2x','3x^2+2','3x^{2}+2',3,[SO,BC],7),
    Qs('optelling',"Bepaal f'(x) als f(x) = x · x² + 2x²",'f(x) = x \\cdot x^{2}+2x^{2}','3x^2+4x','3x^{2}+4x',3,[SO,BC],8),
    Qs('optelling',"Bepaal f'(x) als f(x) = √x · x + 3x",'f(x) = \\sqrt{x} \\cdot x+3x','(3/2)sqrt(x)+3','\\dfrac{3}{2}\\sqrt{x}+3',3,[SO,BC,BH],9),

    // ── cluster: haakjes_uitwerken ────────────────────────────────────────
    Qs('haakjes_uitwerken',"Differentieer f(x) = x(x + 2)",'f(x) = x(x+2)','2x+2','2x+2',1,[SH,SO],1),
    Qs('haakjes_uitwerken',"Differentieer f(x) = x(x² − 1)",'f(x) = x(x^{2}-1)','3x^2-1','3x^{2}-1',1,[SH,SO],2),
    Qs('haakjes_uitwerken',"Differentieer f(x) = 2x(x + 3)",'f(x) = 2x(x+3)','4x+6','4x+6',1,[SH,SO],3),
    Qs('haakjes_uitwerken',"Differentieer f(x) = (x + 1)(x + 2)",'f(x) = (x+1)(x+2)','2x+3','2x+3',2,[SH,SO],4),
    Qs('haakjes_uitwerken',"Differentieer f(x) = (x + 2)(x − 2)",'f(x) = (x+2)(x-2)','2x','2x',2,[SH,SO],5),
    Qs('haakjes_uitwerken',"Differentieer f(x) = (2x + 1)(x + 3)",'f(x) = (2x+1)(x+3)','4x+7','4x+7',2,[SH,SO],6),
    Qs('haakjes_uitwerken',"Differentieer f(x) = (x + 1)²",'f(x) = (x+1)^{2}','2x+2','2x+2',3,[SH,SO],7),
    Qs('haakjes_uitwerken',"Differentieer f(x) = (x − 2)²",'f(x) = (x-2)^{2}','2x-4','2x-4',3,[SH,SO],8),
    Qs('haakjes_uitwerken',"Differentieer f(x) = (x + 1)(x² + x)",'f(x) = (x+1)(x^{2}+x)','3x^2+4x+1','3x^{2}+4x+1',3,[SH,SO],9),
  ])
  console.log('Somregel: 18 vragen ingevoegd')

  console.log('\n✓ Migration 0013 complete')
}

main().catch(e => { console.error(e); process.exit(1) })
