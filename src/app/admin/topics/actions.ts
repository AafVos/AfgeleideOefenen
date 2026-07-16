'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { SITE } from '@/config/site'
import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------
// Topics
// ---------------------------------------------------------------------
function parseCategory(v: FormDataEntryValue | null) {
  const s = (v ?? '').toString()
  if (s === 'primitiveren' || s === 'integralen' || s === 'vergelijkingen' || s === 'toepassingen') return s
  return null
}

export async function createTopic(formData: FormData) {
  const slug = (formData.get('slug') ?? '').toString().trim()
  const title = (formData.get('title') ?? '').toString().trim()
  const chapter_id = (formData.get('chapter_id') ?? '').toString().trim()
  const order_index = Number(formData.get('order_index') ?? 0)
  const is_unlocked_by_default = formData.get('is_unlocked_by_default') === 'on'
  const category = parseCategory(formData.get('category'))

  if (!slug || !title) throw new Error('Slug en titel zijn verplicht.')
  if (!chapter_id) throw new Error('Kies een hoofdstuk.')

  const supabase = await createClient()
  const { error } = await supabase.from('topics_new').insert({
    site: SITE,
    slug,
    title,
    chapter_id,
    order_index,
    is_unlocked_by_default,
    category,
  })
  if (error) throw new Error(error.message)

  revalidatePath('/admin/topics')
  revalidatePath('/admin')
}

export async function updateTopic(id: string, formData: FormData) {
  const slug = (formData.get('slug') ?? '').toString().trim()
  const title = (formData.get('title') ?? '').toString().trim()
  const chapter_id = (formData.get('chapter_id') ?? '').toString().trim()
  const order_index = Number(formData.get('order_index') ?? 0)
  const is_unlocked_by_default = formData.get('is_unlocked_by_default') === 'on'
  const category = parseCategory(formData.get('category'))

  if (!slug || !title) throw new Error('Slug en titel zijn verplicht.')
  if (!chapter_id) throw new Error('Kies een hoofdstuk.')

  const supabase = await createClient()
  const { error } = await supabase
    .from('topics_new')
    .update({ slug, title, chapter_id, order_index, is_unlocked_by_default, category })
    .eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/topics')
  revalidatePath(`/admin/topics/${id}`)
}

export async function deleteTopic(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('topics_new').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/topics')
  redirect('/admin/topics')
}

// ---------------------------------------------------------------------
// Clusters (bound to a topic)
// ---------------------------------------------------------------------
export async function createCluster(topicId: string, formData: FormData) {
  const slug = (formData.get('slug') ?? '').toString().trim()
  const title = (formData.get('title') ?? '').toString().trim()
  const order_index = Number(formData.get('order_index') ?? 0)

  if (!slug || !title) throw new Error('Slug en titel zijn verplicht.')

  const supabase = await createClient()
  const { error } = await supabase.from('topic_clusters_new').insert({
    site: SITE,
    topic_id: topicId,
    slug,
    title,
    order_index,
  })
  if (error) throw new Error(error.message)

  revalidatePath(`/admin/topics/${topicId}`)
}

export async function updateCluster(
  clusterId: string,
  topicId: string,
  formData: FormData,
) {
  const slug = (formData.get('slug') ?? '').toString().trim()
  const title = (formData.get('title') ?? '').toString().trim()
  const order_index = Number(formData.get('order_index') ?? 0)

  if (!slug || !title) throw new Error('Slug en titel zijn verplicht.')

  const supabase = await createClient()
  const { error } = await supabase
    .from('topic_clusters_new')
    .update({ slug, title, order_index })
    .eq('id', clusterId)
  if (error) throw new Error(error.message)

  revalidatePath(`/admin/topics/${topicId}`)
}

export async function deleteCluster(clusterId: string, topicId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('topic_clusters_new')
    .delete()
    .eq('id', clusterId)
  if (error) throw new Error(error.message)

  revalidatePath(`/admin/topics/${topicId}`)
}
