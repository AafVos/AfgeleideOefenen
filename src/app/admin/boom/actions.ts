'use server'

import { revalidatePath } from 'next/cache'

import { SITE } from '@/config/site'
import { createClient } from '@/lib/supabase/server'

/**
 * Server actions voor de beslisboom-editor. Schrijfrechten worden door RLS
 * afgedwongen (alleen admin); hier alleen invoer normaliseren.
 */

function tekst(v: FormDataEntryValue | null): string {
  return (v ?? '').toString().trim()
}

/** Stappen komen uit een textarea: één stap per regel, lege regels overslaan. */
function parseStappen(v: FormDataEntryValue | null): string[] {
  return tekst(v)
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

export async function createNode(formData: FormData) {
  const supabase = await createClient()
  const label = tekst(formData.get('label'))
  if (!label) throw new Error('Label is verplicht.')
  const parentRaw = tekst(formData.get('parent_id'))
  const parent_id = parentRaw || null

  // Achteraan bij de broertjes/zusjes
  let query = supabase
    .from('beslisboom_nodes')
    .select('order_index')
    .eq('site', SITE)
    .order('order_index', { ascending: false })
    .limit(1)
  query = parent_id ? query.eq('parent_id', parent_id) : query.is('parent_id', null)
  const { data: last } = await query
  const order_index = (last?.[0]?.order_index ?? -1) + 1

  const { error } = await supabase.from('beslisboom_nodes').insert({
    site: SITE,
    parent_id,
    label,
    vraag: tekst(formData.get('vraag')) || null,
    stappen: parseStappen(formData.get('stappen')),
    order_index,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/boom')
}

export async function updateNode(formData: FormData) {
  const supabase = await createClient()
  const id = tekst(formData.get('id'))
  const label = tekst(formData.get('label'))
  if (!id) throw new Error('Node-id ontbreekt.')
  if (!label) throw new Error('Label is verplicht.')

  const { error } = await supabase
    .from('beslisboom_nodes')
    .update({
      label,
      vraag: tekst(formData.get('vraag')) || null,
      stappen: parseStappen(formData.get('stappen')),
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/boom')
}

/** Verwijdert de knoop en (via ON DELETE CASCADE) de hele subtak. */
export async function deleteNode(formData: FormData) {
  const supabase = await createClient()
  const id = tekst(formData.get('id'))
  if (!id) throw new Error('Node-id ontbreekt.')

  const { error } = await supabase.from('beslisboom_nodes').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/boom')
}

/** Wissel de volgorde met de vorige/volgende broer (richting = 'up' | 'down'). */
export async function moveNode(formData: FormData) {
  const supabase = await createClient()
  const id = tekst(formData.get('id'))
  const richting = tekst(formData.get('richting'))
  if (!id || (richting !== 'up' && richting !== 'down')) return

  const { data: node } = await supabase
    .from('beslisboom_nodes')
    .select('id, parent_id, order_index')
    .eq('id', id)
    .maybeSingle()
  if (!node) return

  let query = supabase
    .from('beslisboom_nodes')
    .select('id, order_index')
    .eq('site', SITE)
  query = node.parent_id
    ? query.eq('parent_id', node.parent_id)
    : query.is('parent_id', null)
  query =
    richting === 'up'
      ? query.lt('order_index', node.order_index).order('order_index', { ascending: false })
      : query.gt('order_index', node.order_index).order('order_index', { ascending: true })
  const { data: buurRows } = await query.limit(1)
  const buur = buurRows?.[0]
  if (!buur) return

  await supabase
    .from('beslisboom_nodes')
    .update({ order_index: buur.order_index })
    .eq('id', node.id)
  await supabase
    .from('beslisboom_nodes')
    .update({ order_index: node.order_index })
    .eq('id', buur.id)
  revalidatePath('/admin/boom')
}

export async function koppelVraag(formData: FormData) {
  const supabase = await createClient()
  const node_id = tekst(formData.get('node_id'))
  const exam_question_id = tekst(formData.get('exam_question_id'))
  if (!node_id || !exam_question_id) throw new Error('Kies een knoop en een vraag.')

  const { error } = await supabase
    .from('beslisboom_node_vragen')
    .upsert({ node_id, exam_question_id })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/boom')
}

export async function ontkoppelVraag(formData: FormData) {
  const supabase = await createClient()
  const node_id = tekst(formData.get('node_id'))
  const exam_question_id = tekst(formData.get('exam_question_id'))
  if (!node_id || !exam_question_id) return

  const { error } = await supabase
    .from('beslisboom_node_vragen')
    .delete()
    .eq('node_id', node_id)
    .eq('exam_question_id', exam_question_id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/boom')
}
