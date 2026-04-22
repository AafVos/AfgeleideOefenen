'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

export async function createRootCause(formData: FormData) {
  const topic_id = (formData.get('topic_id') ?? '').toString()
  const slug = (formData.get('slug') ?? '').toString().trim()
  const description = (formData.get('description') ?? '').toString().trim()

  if (!topic_id || !slug || !description) {
    throw new Error('Topic, slug en beschrijving zijn verplicht.')
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('root_causes')
    .insert({ topic_id, slug, description })
  if (error) throw new Error(error.message)

  revalidatePath('/admin/root-causes')
}

export async function updateRootCause(id: string, formData: FormData) {
  const slug = (formData.get('slug') ?? '').toString().trim()
  const description = (formData.get('description') ?? '').toString().trim()
  const topic_id = (formData.get('topic_id') ?? '').toString()

  if (!slug || !description || !topic_id) {
    throw new Error('Topic, slug en beschrijving zijn verplicht.')
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('root_causes')
    .update({ slug, description, topic_id })
    .eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/root-causes')
}

export async function deleteRootCause(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('root_causes').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/root-causes')
}
