'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

function parseDifficulty(v: FormDataEntryValue | null): 1 | 2 | 3 {
  const n = Number(v)
  if (n === 1 || n === 2 || n === 3) return n
  throw new Error('Moeilijkheid moet 1, 2 of 3 zijn.')
}

function parseTags(v: FormDataEntryValue | null): string[] {
  if (!v) return []
  return v
    .toString()
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

function readQuestionFields(formData: FormData) {
  const topic_id = (formData.get('topic_id') ?? '').toString()
  const cluster_id = (formData.get('cluster_id') ?? '').toString()
  const body = (formData.get('body') ?? '').toString().trim()
  const latex_body =
    (formData.get('latex_body') ?? '').toString().trim() || null
  const answer = (formData.get('answer') ?? '').toString().trim()
  const latex_answer =
    (formData.get('latex_answer') ?? '').toString().trim() || null
  const difficulty = parseDifficulty(formData.get('difficulty'))
  const root_cause_tags = parseTags(formData.get('root_cause_tags'))
  const order_index_raw = formData.get('order_index')
  const order_index = order_index_raw ? Number(order_index_raw) : null

  if (!topic_id || !cluster_id) throw new Error('Kies een topic en cluster.')
  if (!body) throw new Error('De vraagtekst is verplicht.')
  if (!answer) throw new Error('Het juiste antwoord is verplicht.')

  return {
    topic_id,
    cluster_id,
    body,
    latex_body,
    answer,
    latex_answer,
    difficulty,
    root_cause_tags,
    order_index,
  }
}

// ---------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------
export async function createQuestion(formData: FormData) {
  const supabase = await createClient()
  const fields = readQuestionFields(formData)

  const { data, error } = await supabase
    .from('questions')
    .insert({ ...fields, is_ai_generated: false })
    .select('id')
    .single()
  if (error) throw new Error(error.message)

  revalidatePath('/admin/questions')
  revalidatePath('/admin')
  redirect(`/admin/questions/${data.id}`)
}

export async function updateQuestion(id: string, formData: FormData) {
  const supabase = await createClient()
  const fields = readQuestionFields(formData)

  const { error } = await supabase
    .from('questions')
    .update(fields)
    .eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/questions')
  revalidatePath(`/admin/questions/${id}`)
}

export async function deleteQuestion(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('questions').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/questions')
  revalidatePath('/admin')
  redirect('/admin/questions')
}

// ---------------------------------------------------------------------
// Question steps
// ---------------------------------------------------------------------
export async function addStep(questionId: string, formData: FormData) {
  const step_description = (formData.get('step_description') ?? '')
    .toString()
    .trim()
  const step_order = Number(formData.get('step_order') ?? 0)
  const root_cause_id =
    (formData.get('root_cause_id') ?? '').toString() || null

  if (!step_description) throw new Error('Stapomschrijving is verplicht.')

  const supabase = await createClient()
  const { error } = await supabase.from('question_steps').insert({
    question_id: questionId,
    step_order,
    step_description,
    root_cause_id,
  })
  if (error) throw new Error(error.message)

  revalidatePath(`/admin/questions/${questionId}`)
}

export async function updateStep(
  stepId: string,
  questionId: string,
  formData: FormData,
) {
  const step_description = (formData.get('step_description') ?? '')
    .toString()
    .trim()
  const step_order = Number(formData.get('step_order') ?? 0)
  const root_cause_id =
    (formData.get('root_cause_id') ?? '').toString() || null

  if (!step_description) throw new Error('Stapomschrijving is verplicht.')

  const supabase = await createClient()
  const { error } = await supabase
    .from('question_steps')
    .update({ step_description, step_order, root_cause_id })
    .eq('id', stepId)
  if (error) throw new Error(error.message)

  revalidatePath(`/admin/questions/${questionId}`)
}

export async function deleteStep(stepId: string, questionId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('question_steps')
    .delete()
    .eq('id', stepId)
  if (error) throw new Error(error.message)

  revalidatePath(`/admin/questions/${questionId}`)
}
