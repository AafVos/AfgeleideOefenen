import { NextResponse } from 'next/server'

import { checkWrongAnswer } from '@/lib/ai/check-answer'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

/**
 * POST /api/check-answer
 * Body: { questionId: string, answer: string }
 *
 * Vereist een ingelogde gebruiker.
 * Zoekt eerst in de `known_wrong_answers` cache; zo niet, dan roept dit endpoint
 * Gemini aan en slaat resultaat + eventuele gegenereerde vragen op.
 */
export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 })
  }

  let body: { questionId?: string; answer?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Ongeldige JSON.' }, { status: 400 })
  }

  const questionId = body.questionId?.trim()
  const studentAnswer = body.answer?.trim()
  if (!questionId || !studentAnswer) {
    return NextResponse.json(
      { error: 'questionId en answer zijn verplicht.' },
      { status: 400 },
    )
  }

  const service = createServiceRoleClient()
  const result = await checkWrongAnswer(service, questionId, studentAnswer)

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 502 })
  }

  return NextResponse.json(result)
}
