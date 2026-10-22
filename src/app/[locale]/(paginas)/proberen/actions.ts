'use server'

import { laadNakijkRij, type ProefStap } from '@/lib/practice/proberen-laden'
import { leesProefSelectie, uitspraakProef } from '@/lib/practice/proberen'
import { isGeldigeUuid } from '@/lib/uuid'

/** Lang genoeg voor een formule, kort genoeg om geen lap tekst na te kijken. */
const MAX_ANTWOORD = 2000

export type ProefUitslag =
  | {
      kind: 'goed' | 'fout' | 'overgeslagen'
      antwoord: string
      latexAntwoord: string | null
      stappen: ProefStap[]
    }
  | { kind: 'melding'; tekst: string }

/**
 * Nakijken van een proefsom. Alleen het vaste antwoord en de alternatieven.
 * Geen AI, en er wordt niets in de database gezet.
 */
export async function nakijkProefopgave(input: {
  chapter?: string | null
  topic?: string | null
  cluster?: string | null
  questionId?: string | null
  antwoord?: string | null
  opvragen?: boolean
}): Promise<ProefUitslag> {
  const selectie = leesProefSelectie({
    chapter: input.chapter,
    topic: input.topic,
    cluster: input.cluster,
  })
  const questionId = input.questionId?.trim() ?? ''
  if (!selectie || !isGeldigeUuid(questionId)) {
    return { kind: 'melding', tekst: 'Deze som hoort niet bij deze proef.' }
  }

  const ruw = (input.antwoord ?? '').slice(0, MAX_ANTWOORD)
  const opvragen = input.opvragen === true

  try {
    const rij = await laadNakijkRij(selectie, questionId)
    if (!rij) {
      return { kind: 'melding', tekst: 'Deze som hoort niet bij deze proef.' }
    }

    const uitspraak = uitspraakProef(
      ruw,
      rij.answer,
      rij.answer_alternatives ?? [],
      opvragen,
    )
    if (uitspraak === 'leeg') {
      return { kind: 'melding', tekst: 'Vul eerst een antwoord in.' }
    }

    return {
      kind: uitspraak,
      antwoord: rij.answer,
      latexAntwoord: rij.latex_answer,
      stappen: rij.stappen,
    }
  } catch (e) {
    console.error('[proberen] nakijken mislukt', e)
    return { kind: 'melding', tekst: 'Nakijken is niet gelukt. Probeer het nog eens.' }
  }
}
