import { describe, expect, it } from 'vitest'

import { buildCheckAnswerPromptNew } from './prompts'

const basis = {
  correctAnswer: '2',
  studentAnswer: '4',
  topicTitle: 'Toepassen',
  clusterTitle: 'Hoogte',
  stepsAlreadyExist: true,
}

describe('buildCheckAnswerPromptNew', () => {
  it('houdt bij een kale som de opdracht om de afgeleide te bepalen', () => {
    const prompt = buildCheckAnswerPromptNew({
      ...basis,
      questionBody: 'f(x) = \\sin(x)',
    })
    expect(prompt).toContain('Bepaal de afgeleide van f(x) = \\sin(x)')
  })

  it('zet bij een verhaaltje de vraagzin in de opdracht', () => {
    const vraagzin = 'Na hoeveel seconden is de bal op zijn hoogste punt?'
    const verhaal = `Een bal wordt omhoog gegooid. De hoogte in meter is $h(t) = -5t^{2}+20t$. ${vraagzin}`
    const prompt = buildCheckAnswerPromptNew({
      ...basis,
      questionBody: verhaal,
    })
    expect(prompt).toContain(vraagzin)
    expect(prompt).not.toContain('Bepaal de afgeleide van')
  })

  it('noemt in het voorbeeld de binnenste functie h', () => {
    const prompt = buildCheckAnswerPromptNew({
      ...basis,
      questionBody: 'f(x) = \\sqrt{2x+1}',
      stepsAlreadyExist: false,
    })
    expect(prompt).toContain('Binnenste functie: $h(x) = 2x+1$')
    expect(prompt).toContain('$f(x) = \\sqrt{h(x)}$')
    expect(prompt).not.toContain('$g(x) = 2x+1$')
  })
})
