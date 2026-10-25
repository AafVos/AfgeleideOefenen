'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'

import { ErrorBanner, Input, Select, Textarea } from '@/components/ui'
import { EXAMENJAREN, HONEYPOT_VELD, TIJDVAKKEN } from '@/lib/video-aanvraag'

import { vraagExamenVideoAction, type VideoAanvraagState } from './actions'

const beginStand: VideoAanvraagState = { error: null, sent: false }

/** Hoog genoeg om met een duim te raken, ook op een telefoon. */
const VELD = 'min-h-11'

function VerstuurKnop() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      data-meet="video-aanvraag-versturen"
      className="inline-flex min-h-11 items-center rounded-lg bg-accent px-5 py-3 text-white shadow-sm transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Bezig met versturen…' : 'Vraag deze video aan'}
    </button>
  )
}

export function VideoAanvraagFormulier() {
  const [stand, verstuur] = useActionState(vraagExamenVideoAction, beginStand)
  const [magMailen, setMagMailen] = useState(false)

  if (stand.sent) {
    return (
      <p
        role="status"
        className="rounded-lg border border-accent/30 bg-accent-light px-4 py-3 text-sm text-accent"
      >
        Dank je wel, je aanvraag staat genoteerd. Hoe vaker een vraag gevraagd
        wordt, hoe eerder de video er is.
      </p>
    )
  }

  return (
    <form action={verstuur} className="space-y-5">
      {/* Dit veld is er alleen voor robots. Een leerling ziet het niet en een
          schermlezer slaat het over. */}
      <div className="hidden" aria-hidden>
        <input
          type="text"
          name={HONEYPOT_VELD}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Select
          label="Examenjaar"
          name="jaar"
          defaultValue={String(EXAMENJAREN[0])}
          className={VELD}
        >
          {EXAMENJAREN.map((jaar) => (
            <option key={jaar} value={jaar}>
              {jaar}
            </option>
          ))}
        </Select>
        <Select label="Tijdvak" name="tijdvak" defaultValue="1" className={VELD}>
          {TIJDVAKKEN.map((tijdvak) => (
            <option key={tijdvak} value={tijdvak}>
              {tijdvak}
            </option>
          ))}
        </Select>
        <Input
          label="Vraagnummer"
          name="vraagnummer"
          required
          maxLength={10}
          autoComplete="off"
          placeholder="6 of 12a"
          className={VELD}
        />
      </div>

      <Textarea
        label="Waar loop je vast?"
        hint="Mag kort. Hoe preciezer, hoe beter de uitleg aansluit."
        name="toelichting"
        rows={4}
        maxLength={1000}
        placeholder="Ik snap niet hoe je bij b aan de afgeleide komt."
      />

      <div className="rounded-xl border border-border bg-surface-2 p-4">
        {/* `accent-accent` kleurt het vinkje zelf groen; zonder die regel is
            het het blauw van de browser. */}
        <label className="flex min-h-11 items-start gap-3 text-sm text-text">
          <input
            type="checkbox"
            name="magMailen"
            value="ja"
            checked={magMailen}
            onChange={(e) => setMagMailen(e.target.checked)}
            className="mt-0.5 size-5 shrink-0 rounded border-border accent-accent focus:ring-2 focus:ring-accent/20"
          />
          <span>
            Stuur me een mailtje zodra de video er is. Je adres wordt alleen
            daarvoor gebruikt en verder aan niemand gegeven.
          </span>
        </label>
        {magMailen && (
          <div className="mt-3">
            <Input
              label="Je e-mailadres"
              name="email"
              type="email"
              required
              maxLength={320}
              autoComplete="email"
              placeholder="jij@voorbeeld.nl"
              className={VELD}
            />
          </div>
        )}
      </div>

      {stand.error && <ErrorBanner>{stand.error}</ErrorBanner>}
      <VerstuurKnop />
    </form>
  )
}
