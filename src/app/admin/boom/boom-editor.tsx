'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { RichMath } from '@/components/math'
import { Badge, cn } from '@/components/ui'

import {
  createNode,
  deleteNode,
  koppelVraag,
  moveNode,
  ontkoppelVraag,
  updateNode,
} from './actions'

export type BoomNode = {
  id: string
  parent_id: string | null
  label: string
  vraag: string | null
  stappen: string[]
  order_index: number
}

export type Koppeling = { node_id: string; exam_question_id: string }

export type ExamVraag = {
  id: string
  bron_type: 'examen' | 'boek'
  jaar: number | null
  tijdvak: number | null
  paragraaf: string | null
  onderdeel: string | null
  nummer: number
  onderwerp: string
  vraag: string
}

/* ── Hulpjes ──────────────────────────────────────────────────────────── */

function vraagLabel(v: ExamVraag) {
  return v.bron_type === 'boek'
    ? `boek §${v.paragraaf} · opg ${v.nummer}${v.onderdeel ?? ''}`
    : `${v.jaar} tv${v.tijdvak} · vr ${v.nummer}`
}

/** Pad-label per knoop ("Raaklijn → 2 punten gegeven"). */
function bouwPaden(nodes: BoomNode[]): Map<string, string> {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const paden = new Map<string, string>()
  const padVan = (n: BoomNode): string => {
    if (paden.has(n.id)) return paden.get(n.id)!
    const parent = n.parent_id ? byId.get(n.parent_id) : null
    const pad = parent ? `${padVan(parent)} → ${n.label}` : n.label
    paden.set(n.id, pad)
    return pad
  }
  nodes.forEach(padVan)
  return paden
}

async function verstuur(
  action: (fd: FormData) => Promise<void>,
  fd: FormData,
  na?: () => void,
) {
  try {
    await action(fd)
    na?.()
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Er ging iets mis.')
  }
}

/* Verbindingslijnen voor de boomdiagram (organogram-patroon):
   elke <ul> is een rij kinderen; pseudo-elementen tekenen de lijnen. */
const BOOM_CSS = `
.boomchart ul {
  display: flex;
  justify-content: center;
  padding-top: 24px;
  position: relative;
}
.boomchart ul::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 0;
  height: 24px;
  border-left: 2px solid var(--color-border);
}
.boomchart li {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 24px 8px 0;
}
.boomchart li::before,
.boomchart li::after {
  content: '';
  position: absolute;
  top: 0;
  right: 50%;
  width: 50%;
  height: 24px;
  border-top: 2px solid var(--color-border);
}
.boomchart li::after {
  right: auto;
  left: 50%;
  border-left: 2px solid var(--color-border);
}
.boomchart li:only-child::before,
.boomchart li:only-child::after { display: none; }
.boomchart li:only-child { padding-top: 0; }
.boomchart li:first-child::before,
.boomchart li:last-child::after { border-top: 0 none; }
.boomchart li:last-child::before {
  border-right: 2px solid var(--color-border);
  border-radius: 0 10px 0 0;
}
.boomchart li:first-child::after { border-radius: 10px 0 0 0; }
`

/* ── Formulier voor knoop aanmaken/bewerken ───────────────────────────── */

function NodeForm({
  actie,
  verborgen,
  initial,
  submitLabel,
  onKlaar,
}: {
  actie: (fd: FormData) => Promise<void>
  verborgen: Record<string, string>
  initial?: Partial<Pick<BoomNode, 'label' | 'vraag' | 'stappen'>>
  submitLabel: string
  onKlaar: () => void
}) {
  return (
    <form
      action={(fd) => verstuur(actie, fd, onKlaar)}
      className="mt-3 space-y-2 rounded-lg border border-accent/40 bg-surface-2/50 p-3"
    >
      {Object.entries(verborgen).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <div>
        <label className="text-xs font-medium text-text-muted">
          Label (de keuze/naam van deze knoop)
        </label>
        <input
          name="label"
          required
          defaultValue={initial?.label ?? ''}
          placeholder="bv. Ze vragen de raaklijn — of: 2 punten gegeven"
          className="mt-1 w-full rounded-md border border-border bg-surface px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-text-muted">
          Vervolgvraag (alleen bij een tussenknoop)
        </label>
        <input
          name="vraag"
          defaultValue={initial?.vraag ?? ''}
          placeholder="bv. Wat is er gegeven?"
          className="mt-1 w-full rounded-md border border-border bg-surface px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-text-muted">
          Stappenplan (alleen bij een eindknoop — één stap per regel, $…$ voor
          formules)
        </label>
        <textarea
          name="stappen"
          rows={4}
          defaultValue={(initial?.stappen ?? []).join('\n')}
          placeholder={'Bereken $f\'(x)$\nStel $f\'(x) = 0$\n…'}
          className="mt-1 w-full rounded-md border border-border bg-surface px-2 py-1.5 font-mono text-xs"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent/90"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onKlaar}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-text hover:bg-surface-2"
        >
          Annuleren
        </button>
      </div>
    </form>
  )
}

/* ── De editor ────────────────────────────────────────────────────────── */

export function BoomEditor({
  nodes,
  koppelingen,
  vragen,
}: {
  nodes: BoomNode[]
  koppelingen: Koppeling[]
  vragen: ExamVraag[]
}) {
  const [gekozenVraagId, setGekozenVraagId] = useState<string | null>(null)
  const [gekozenNodeId, setGekozenNodeId] = useState<string | null>(null)
  const [formModus, setFormModus] = useState<'bewerken' | 'tak' | 'root' | null>(
    null,
  )
  // Op mobiel staat de vragenlijst boven de boom; standaard ingeklapt.
  const [lijstOpen, setLijstOpen] = useState(false)
  const detailRef = useRef<HTMLDivElement>(null)

  // Op mobiel staat het detailpaneel onder de boom: scroll het in beeld.
  useEffect(() => {
    if (!gekozenNodeId) return
    if (window.matchMedia('(min-width: 1024px)').matches) return
    detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [gekozenNodeId])

  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes])

  const kinderenVan = useMemo(() => {
    const m = new Map<string | null, BoomNode[]>()
    for (const n of nodes) {
      const key = n.parent_id
      if (!m.has(key)) m.set(key, [])
      m.get(key)!.push(n)
    }
    for (const lijst of m.values()) lijst.sort((a, b) => a.order_index - b.order_index)
    return m
  }, [nodes])

  const paden = useMemo(() => bouwPaden(nodes), [nodes])
  const vraagById = useMemo(() => new Map(vragen.map((v) => [v.id, v])), [vragen])

  const vragenPerNode = useMemo(() => {
    const m = new Map<string, ExamVraag[]>()
    for (const k of koppelingen) {
      const v = vraagById.get(k.exam_question_id)
      if (!v) continue
      if (!m.has(k.node_id)) m.set(k.node_id, [])
      m.get(k.node_id)!.push(v)
    }
    return m
  }, [koppelingen, vraagById])

  const ingedeeldeIds = useMemo(
    () => new Set(koppelingen.map((k) => k.exam_question_id)),
    [koppelingen],
  )

  const gekozenVraag = gekozenVraagId ? (vraagById.get(gekozenVraagId) ?? null) : null
  const gekozenNode = gekozenNodeId ? (nodeById.get(gekozenNodeId) ?? null) : null

  // Pad van de gekozen examenvraag: gekoppelde knopen + alle voorouders.
  const padIds = useMemo(() => {
    const set = new Set<string>()
    if (!gekozenVraagId) return set
    for (const k of koppelingen) {
      if (k.exam_question_id !== gekozenVraagId) continue
      let cursor: BoomNode | undefined = nodeById.get(k.node_id)
      while (cursor) {
        set.add(cursor.id)
        cursor = cursor.parent_id ? nodeById.get(cursor.parent_id) : undefined
      }
    }
    return set
  }, [gekozenVraagId, koppelingen, nodeById])

  const heeftPad = padIds.size > 0

  /* Compacte knoop in de diagram; klik = selecteren (detail onderin). */
  function KnoopBox({ node, isRoot }: { node: BoomNode; isRoot: boolean }) {
    const kinderen = kinderenVan.get(node.id) ?? []
    const isEind = kinderen.length === 0
    const nVragen = vragenPerNode.get(node.id)?.length ?? 0
    const opPad = padIds.has(node.id)
    const gedimd = heeftPad && !opPad

    return (
      <button
        type="button"
        onClick={() => {
          setGekozenNodeId(gekozenNodeId === node.id ? null : node.id)
          setFormModus(null)
        }}
        className={cn(
          'w-40 rounded-xl border px-3 py-2 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
          isRoot
            ? 'border-accent/50 bg-accent-light'
            : isEind
              ? 'border-[#e2c25c]/70 bg-[#fbf3d8]'
              : 'border-border bg-surface',
          gedimd && 'opacity-30',
          opPad && 'ring-2 ring-accent ring-offset-2 ring-offset-[var(--color-bg)]',
          gekozenNodeId === node.id &&
            'ring-2 ring-accent-2 ring-offset-2 ring-offset-[var(--color-bg)]',
        )}
      >
        <span className="block text-xs font-medium leading-snug text-text [overflow-wrap:anywhere]">
          <RichMath source={node.label} />
        </span>
        <span className="mt-1 block text-[10px] text-text-muted">
          {node.vraag
            ? '❓ vervolgvraag'
            : isEind
              ? node.stappen.length
                ? `📋 ${node.stappen.length} stappen`
                : '⚠ nog geen stappen'
              : `${kinderen.length} takken`}
          {isEind && nVragen > 0 && ` · ${nVragen} vr.`}
        </span>
      </button>
    )
  }

  function Tak({ node }: { node: BoomNode }) {
    const kinderen = kinderenVan.get(node.id) ?? []
    return (
      <li>
        <KnoopBox node={node} isRoot={false} />
        {kinderen.length > 0 && (
          <ul>
            {kinderen.map((kind) => (
              <Tak key={kind.id} node={kind} />
            ))}
          </ul>
        )}
      </li>
    )
  }

  const wortels = kinderenVan.get(null) ?? []
  const gekozenNodeKinderen = gekozenNode
    ? (kinderenVan.get(gekozenNode.id) ?? [])
    : []
  const gekozenNodeVragen = gekozenNode
    ? (vragenPerNode.get(gekozenNode.id) ?? [])
    : []

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <style>{BOOM_CSS}</style>

      {/* ── Links: alle examenvragen boven elkaar ── */}
      <aside className="shrink-0 lg:sticky lg:top-4 lg:w-64">
        <div className="rounded-xl border border-border bg-surface">
          <button
            type="button"
            aria-expanded={lijstOpen}
            onClick={() => setLijstOpen(!lijstOpen)}
            className={cn(
              'flex w-full items-center justify-between gap-2 px-3 py-2 text-left lg:pointer-events-none lg:border-b lg:border-border',
              lijstOpen && 'border-b border-border',
            )}
          >
            <span className="min-w-0">
              <span className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                Examenvragen
              </span>
              <span className="block text-xs text-text-muted">
                {ingedeeldeIds.size} van {vragen.length} ingedeeld
              </span>
            </span>
            <span
              aria-hidden
              className={cn(
                'text-text-muted transition-transform lg:hidden',
                lijstOpen && 'rotate-90',
              )}
            >
              ›
            </span>
          </button>
          <ul
            className={cn(
              'max-h-72 divide-y divide-border overflow-y-auto lg:max-h-[75vh]',
              lijstOpen ? 'block' : 'hidden lg:block',
            )}
          >
            {vragen.map((v) => {
              const ingedeeld = ingedeeldeIds.has(v.id)
              const gekozen = v.id === gekozenVraagId
              return (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setGekozenVraagId(gekozen ? null : v.id)
                      if (!gekozen) setLijstOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-start gap-2 px-3 py-2 text-left transition',
                      gekozen ? 'bg-accent-light' : 'hover:bg-surface-2',
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'mt-0.5 text-xs',
                        ingedeeld ? 'text-accent' : 'text-text-muted',
                      )}
                    >
                      {ingedeeld ? '✓' : '○'}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={cn(
                          'block text-xs font-medium',
                          gekozen ? 'text-accent' : 'text-text',
                        )}
                      >
                        {vraagLabel(v)}
                      </span>
                      <span className="block truncate text-xs text-text-muted">
                        {v.onderwerp}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </aside>

      {/* ── Main: de boomdiagram + detailpaneel ── */}
      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl text-text">Beslisboom</h2>
            <p className="text-sm text-text-muted">
              Klik een knoop aan voor details en bewerken.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFormModus(formModus === 'root' ? null : 'root')
              setGekozenNodeId(null)
            }}
            className="inline-flex items-center rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-accent/90"
          >
            + Nieuw vraagtype
          </button>
        </div>

        {/* Gekozen examenvraag: tekst + padstatus */}
        {gekozenVraag && (
          <div className="rounded-xl border border-accent/40 bg-accent-light/30 p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                {vraagLabel(gekozenVraag)} — {gekozenVraag.onderwerp}
              </p>
              <button
                type="button"
                onClick={() => setGekozenVraagId(null)}
                className="text-xs text-text-muted hover:text-text"
              >
                ✕ sluiten
              </button>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-text">
              <RichMath source={gekozenVraag.vraag} />
            </p>
            <p className="mt-2 text-xs text-text-muted">
              {heeftPad
                ? 'Het pad van deze vraag is groen gemarkeerd in de boom.'
                : 'Nog niet ingedeeld — klik de juiste eindknoop aan en koppel de vraag daar.'}
            </p>
          </div>
        )}

        {formModus === 'root' && (
          <NodeForm
            actie={createNode}
            verborgen={{ parent_id: '' }}
            submitLabel="Vraagtype toevoegen"
            onKlaar={() => setFormModus(null)}
          />
        )}

        {/* De letterlijke boom: knopen + lijntjes, per vraagtype */}
        <div className="space-y-4">
          {wortels.map((wortel) => {
            const kinderen = kinderenVan.get(wortel.id) ?? []
            return (
              <div
                key={wortel.id}
                className="overflow-x-auto rounded-xl border border-border bg-surface p-4"
              >
                <div className="boomchart flex min-w-max flex-col items-center">
                  <KnoopBox node={wortel} isRoot />
                  {kinderen.length > 0 && (
                    <ul>
                      {kinderen.map((kind) => (
                        <Tak key={kind.id} node={kind} />
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )
          })}
          {!wortels.length && (
            <p className="rounded-xl border border-border bg-surface px-4 py-10 text-center text-sm text-text-muted">
              Nog geen knopen. Begin met &quot;+ Nieuw vraagtype&quot;, bv. “Ze
              vragen de raaklijn”.
            </p>
          )}
        </div>

        {/* ── Detailpaneel van de aangeklikte knoop ── */}
        {gekozenNode && (
          <div
            ref={detailRef}
            className="scroll-mt-4 rounded-xl border border-accent-2/40 bg-surface p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-text-muted">
                  {paden.get(gekozenNode.id)}
                </p>
                <p className="mt-1 text-sm font-medium text-text">
                  <RichMath source={gekozenNode.label} />
                </p>
                {gekozenNode.vraag && (
                  <p className="mt-0.5 text-xs italic text-text-muted">
                    ❓ <RichMath source={gekozenNode.vraag} />
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1 text-xs">
                {gekozenNodeKinderen.length === 0 ? (
                  <Badge tone={gekozenNode.stappen.length ? 'accent' : 'danger'}>
                    {gekozenNode.stappen.length
                      ? `eindknoop · ${gekozenNode.stappen.length} stappen`
                      : 'eindknoop · nog geen stappen'}
                  </Badge>
                ) : (
                  <Badge>{gekozenNodeKinderen.length} takken</Badge>
                )}
                <button
                  type="button"
                  onClick={() => setGekozenNodeId(null)}
                  className="rounded px-1.5 py-0.5 text-text-muted hover:bg-surface-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {gekozenNode.stappen.length > 0 && (
              <ol className="mt-3 space-y-0.5 border-l-2 border-[#e2c25c]/60 pl-3">
                {gekozenNode.stappen.map((stap, i) => (
                  <li key={i} className="text-xs leading-relaxed text-text-muted">
                    <span className="font-medium text-[#8a6a14]">{i + 1}.</span>{' '}
                    <RichMath source={stap} />
                  </li>
                ))}
              </ol>
            )}

            {/* Gekoppelde vragen + koppel-actie voor de gekozen examenvraag */}
            {gekozenNodeKinderen.length === 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {gekozenNodeVragen.map((v) => (
                  <span
                    key={v.id}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs',
                      v.id === gekozenVraagId
                        ? 'border-accent bg-accent-light text-accent'
                        : 'border-border bg-surface text-text-muted',
                    )}
                  >
                    {vraagLabel(v)}
                    <form action={(fd) => verstuur(ontkoppelVraag, fd)} className="inline">
                      <input type="hidden" name="node_id" value={gekozenNode.id} />
                      <input type="hidden" name="exam_question_id" value={v.id} />
                      <button className="text-accent-2 hover:font-bold" title="Ontkoppelen">
                        ✕
                      </button>
                    </form>
                  </span>
                ))}
                {gekozenVraag &&
                  !gekozenNodeVragen.some((g) => g.id === gekozenVraag.id) && (
                    <form action={(fd) => verstuur(koppelVraag, fd)} className="inline">
                      <input type="hidden" name="node_id" value={gekozenNode.id} />
                      <input
                        type="hidden"
                        name="exam_question_id"
                        value={gekozenVraag.id}
                      />
                      <button className="rounded-full border border-accent bg-accent-light px-2 py-0.5 text-xs font-medium text-accent hover:bg-accent hover:text-white">
                        ⚡ Koppel {vraagLabel(gekozenVraag)} aan deze eindknoop
                      </button>
                    </form>
                  )}
              </div>
            )}

            {/* Acties */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() =>
                  setFormModus(formModus === 'bewerken' ? null : 'bewerken')
                }
                className="rounded-md border border-border px-2.5 py-1.5 text-text hover:bg-surface-2"
              >
                ✏️ Bewerken
              </button>
              <button
                type="button"
                onClick={() => setFormModus(formModus === 'tak' ? null : 'tak')}
                className="rounded-md border border-border px-2.5 py-1.5 font-medium text-accent hover:bg-surface-2"
              >
                + Tak toevoegen
              </button>
              <form action={(fd) => verstuur(moveNode, fd)}>
                <input type="hidden" name="id" value={gekozenNode.id} />
                <input type="hidden" name="richting" value="up" />
                <button className="rounded-md border border-border px-2.5 py-1.5 text-text-muted hover:bg-surface-2">
                  ↑ Eerder
                </button>
              </form>
              <form action={(fd) => verstuur(moveNode, fd)}>
                <input type="hidden" name="id" value={gekozenNode.id} />
                <input type="hidden" name="richting" value="down" />
                <button className="rounded-md border border-border px-2.5 py-1.5 text-text-muted hover:bg-surface-2">
                  ↓ Later
                </button>
              </form>
              <form
                action={(fd) =>
                  verstuur(deleteNode, fd, () => setGekozenNodeId(null))
                }
                onSubmit={(e) => {
                  if (
                    !confirm(
                      'Knoop verwijderen? De hele subtak (en koppelingen) gaat mee.',
                    )
                  )
                    e.preventDefault()
                }}
              >
                <input type="hidden" name="id" value={gekozenNode.id} />
                <button className="rounded-md border border-accent-2/50 px-2.5 py-1.5 text-accent-2 hover:bg-accent-2-light">
                  🗑 Verwijderen
                </button>
              </form>
            </div>

            {formModus === 'bewerken' && (
              <NodeForm
                actie={updateNode}
                verborgen={{ id: gekozenNode.id }}
                initial={gekozenNode}
                submitLabel="Opslaan"
                onKlaar={() => setFormModus(null)}
              />
            )}
            {formModus === 'tak' && (
              <NodeForm
                actie={createNode}
                verborgen={{ parent_id: gekozenNode.id }}
                submitLabel="Tak toevoegen"
                onKlaar={() => setFormModus(null)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
