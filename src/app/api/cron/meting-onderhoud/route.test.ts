import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Geen echte database: een nepje dat bijhoudt waarmee het aangeroepen is.
const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }))

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: () => ({ rpc }),
}))

const { POST } = await import('./route')

function verzoek(geheim?: string) {
  return new Request('https://afgeleideoefenen.nl/api/cron/meting-onderhoud', {
    method: 'POST',
    headers: geheim ? { 'x-webhook-secret': geheim } : {},
  })
}

beforeEach(() => {
  vi.stubEnv('WEBHOOK_SECRET', 'geheimpje')
  rpc.mockReset()
  rpc.mockResolvedValue({ data: 0, error: null })
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('POST /api/cron/meting-onderhoud', () => {
  it('weigert zonder het juiste geheim', async () => {
    const antwoord = await POST(verzoek('fout'))

    expect(antwoord.status).toBe(401)
    expect(rpc).not.toHaveBeenCalled()
  })

  it('weigert als er geen geheim is ingesteld', async () => {
    vi.stubEnv('WEBHOOK_SECRET', '')

    expect((await POST(verzoek('iets'))).status).toBe(401)
    expect(rpc).not.toHaveBeenCalled()
  })

  it('roept het onderhoud aan met het juiste geheim', async () => {
    const antwoord = await POST(verzoek('geheimpje'))

    expect(antwoord.status).toBe(200)
    expect(rpc).toHaveBeenCalledWith('site_meting_onderhoud')
  })

  it('geeft een foutstatus terug als het onderhoud zelf mislukt', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'kapot' } })
    const stil = vi.spyOn(console, 'error').mockImplementation(() => {})

    const antwoord = await POST(verzoek('geheimpje'))

    expect(antwoord.status).toBe(500)
    stil.mockRestore()
  })
})
