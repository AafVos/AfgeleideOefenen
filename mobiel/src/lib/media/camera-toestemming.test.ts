import { describe, expect, it } from 'vitest'

import { toestemmingsmelding } from './camera-toestemming'

describe('toestemmingsmelding', () => {
  it('geeft geen melding als de toestemming is gegeven', () => {
    expect(toestemmingsmelding('camera', { granted: true, canAskAgain: true })).toBeNull()
  })

  it('vraagt het nog eens als de leerling nog niet gekozen heeft', () => {
    const melding = toestemmingsmelding('camera', { granted: false, canAskAgain: true })
    expect(melding).toMatch(/nog geen toestemming/)
    expect(melding).toMatch(/camera/)
  })

  it('wijst naar de instellingen als er niet opnieuw gevraagd kan worden', () => {
    const melding = toestemmingsmelding('fotos', { granted: false, canAskAgain: false })
    expect(melding).toMatch(/instellingen van je telefoon/)
    expect(melding).toMatch(/foto's/)
  })
})
