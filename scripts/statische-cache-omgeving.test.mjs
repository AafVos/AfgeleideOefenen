import { describe, expect, it } from 'vitest'
import { ontbrekendeSupabaseVariabelen } from './statische-cache-omgeving.mjs'

describe('ontbrekendeSupabaseVariabelen', () => {
  it('ziet beide variabelen als ontbrekend zonder omgeving', () => {
    expect(ontbrekendeSupabaseVariabelen({})).toEqual([
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ])
  })

  it('ziet niets ontbreken als beide gezet zijn', () => {
    expect(
      ontbrekendeSupabaseVariabelen({
        NEXT_PUBLIC_SUPABASE_URL: 'https://rooktest.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'rooktest',
      }),
    ).toEqual([])
  })

  it('merkt een lege waarde ook als ontbrekend', () => {
    expect(
      ontbrekendeSupabaseVariabelen({
        NEXT_PUBLIC_SUPABASE_URL: '',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'rooktest',
      }),
    ).toEqual(['NEXT_PUBLIC_SUPABASE_URL'])
  })
})
