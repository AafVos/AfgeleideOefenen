import { createClient } from '@supabase/supabase-js'
async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data, error } = await sb
    .from('topic_clusters')
    .update({ title: 'Eén term' })
    .eq('slug', 'een_term_x_macht')
    .select('slug, title')
  console.log(error ?? data)
}
main()
