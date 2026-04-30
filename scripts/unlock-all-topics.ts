import { createClient } from '@supabase/supabase-js'
async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data, error } = await sb.from('topics').update({ is_unlocked_by_default: true }).neq('slug', '').select('slug, is_unlocked_by_default')
  console.log(error ?? data)
}
main()
