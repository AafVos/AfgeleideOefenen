'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------
// Topics
// ---------------------------------------------------------------------
export async function createTopic(formData: FormData) {
  const slug = (formData.get('slug') ?? '').toString().trim()
  const title = (formData.get('title') ?? '').toString().trim()
  const order_index = Number(formData.get('order_index') ?? 0)
  const is_unlocked_by_default = formData.get('is_unlocked_by_default') === 'on'

  if (!slug || !title) throw new Error('Slug en titel zijn verplicht.')

  const supabase = await createClient()
  const { error } = await supabase.from('topics').insert({
    slug,
    title,
    order_index,
    is_unlocked_by_default,
  })
  if (error) throw new Error(error.message)

  revalidatePath('/admin/topics')
  revalidatePath('/admin')
}

export async function updateTopic(id: string, formData: FormData) {
  const slug = (formData.get('slug') ?? '').toString().trim()
  const title = (formData.get('title') ?? '').toString().trim()
  const order_index = Number(formData.get('order_index') ?? 0)
  const is_unlocked_by_default = formData.get('is_unlocked_by_default') === 'on'

  if (!slug || !title) throw new Error('Slug en titel zijn verplicht.')

  const supabase = await createClient()
  const { error } = await supabase
    .from('topics')
    .update({ slug, title, order_index, is_unlocked_by_default })
    .eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/topics')
  revalidatePath(`/admin/topics/${id}`)
}

export async function deleteTopic(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('topics').delete().eq('id', id)
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
  const { error } = await supabase.from('topic_clusters').insert({
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
    .from('topic_clusters')
    .update({ slug, title, order_index })
    .eq('id', clusterId)
  if (error) throw new Error(error.message)

  revalidatePath(`/admin/topics/${topicId}`)
}

export async function deleteCluster(clusterId: string, topicId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('topic_clusters')
    .delete()
    .eq('id', clusterId)
  if (error) throw new Error(error.message)

  revalidatePath(`/admin/topics/${topicId}`)
}
