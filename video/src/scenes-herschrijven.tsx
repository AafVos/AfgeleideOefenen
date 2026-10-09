import type { CSSProperties, ReactNode } from 'react'
import { useCurrentFrame } from 'remotion'

import { theme } from './theme'
import { Wortel, XTot } from './herschrijven-helpers'
import { FnX } from './quotient-helpers'
import { StapLabel } from './scenes-quotient'
import { RegelKaart, sceneTitelStijl } from './scenes-regels'
import {
  AafCorner,
  Breuk,
  captionStyle,
  Chip,
  Circled,
  FadeUp,
  mathStyle,
  Pop,
  Scene,
  titleStyle,
  X,
} from './ui'

const groen = theme.accent
const rood = theme.accent2

/**
 * Tempo-knop: 1 = strak AI-tempo (beats getimed op Pauline). Hoger = ruimer,
 * bijv. voor zelf inspreken. Scèneduren in HerschrijvenVideo.tsx schalen mee.
 */
export const TEMPO = 1
export const t = (n: number) => Math.round(n * TEMPO)

/**
 * Beats per scène, in frames vanaf de scènestart (audio begint op 15). Gemeten
 * met scripts/beats.py op de alignment van Pauline: elk element verschijnt
 * ±10 frames vóór het woord waar het bij hoort.
 */
const B2 = { kaart: 20, alleenAls: 236, negatief: 567, wortel: 695, nde: 814 }
const B3 = { stap0: 95, herschrijven: 297, stap1: 372, stap2: 499, stap3: 608 }
const B4 = { stap0: 153, cirkel: 223, chip: 291, stap1: 347, herschreven: 438, stap2: 519, exponent: 602, uitkomst: 799, stap3: 894, antwoord: 1104 }
const B5 = { stap0: 152, cirkel: 190, chip: 290, stap1: 344, herschreven: 395, optellen: 522, macht: 662, stap2: 790, exponent: 864, uitkomst: 992, stap3: 1044, antwoord: 1204 }
const B6 = { een: 54, twee: 231, drie: 319, letOp: 483, succes: 692 }

/** Rij in een voorbeeld: vaste kolom voor het stap-label, uitwerking ernaast. */
function Rij({ label, from, children }: { label: ReactNode; from: number; children?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 32, width: 1180 }}>
      <div style={{ width: 330, flexShrink: 0 }}>
        <Pop from={from}>
          <StapLabel>{label}</StapLabel>
        </Pop>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>{children}</div>
    </div>
  )
}

const uitwerking: CSSProperties = { ...mathStyle, fontSize: 38 }

/** De machtsregel, zoals op de kaart in de app. */
function MachtsregelKaart({ fontSize = 40 }: { fontSize?: number }) {
  return (
    <RegelKaart fontSize={fontSize}>
      <FnX naam="f" /> = <em>a</em>
      <XTot n={<em>n</em>} /> <span style={{ color: groen }}>⟹</span> <FnX naam="f" accent /> ={' '}
      <span style={{ color: groen }}>
        <em>n</em> · <em>a</em>
        <XTot n={<em>n − 1</em>} />
      </span>
    </RegelKaart>
  )
}

/* ── Scène 1 · Intro ────────────────────────────────────────────────── */
export function HerschrijvenIntro() {
  const frame = useCurrentFrame()
  return (
    <Scene>
      <FadeUp from={t(10)}>
        <h1 style={titleStyle}>
          Machten en wortels <span style={{ color: groen }}>herschrijven</span>
        </h1>
      </FadeUp>
      <FadeUp from={t(45)}>
        <p style={captionStyle}>eerst een macht van x, dan de machtsregel</p>
      </FadeUp>
      <AafCorner pose={frame > 45 ? 'wave' : 'idle'} poseFrame={frame - t(45)} enterAt={10} />
    </Scene>
  )
}

/* ── Scène 2 · Eerst herschrijven ───────────────────────────────────── */
export function HerschrijvenRegels() {
  const frame = useCurrentFrame()
  const regel: CSSProperties = { ...mathStyle, fontSize: 52, display: 'flex', alignItems: 'center', gap: 28 }
  const is = <span style={{ color: theme.textMuted }}>=</span>
  return (
    <Scene gap={34}>
      <FadeUp from={t(5)}>
        <h2 style={sceneTitelStijl}>
          Eerst <span style={{ color: groen }}>herschrijven</span>
        </h2>
      </FadeUp>
      <FadeUp from={t(B2.kaart)}>
        <MachtsregelKaart />
      </FadeUp>
      <FadeUp from={t(B2.alleenAls)}>
        <p style={{ ...captionStyle, fontSize: 32 }}>
          dat kan pas als er echt <em>x</em> tot een macht staat
        </p>
      </FadeUp>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, paddingTop: 6 }}>
        <FadeUp from={t(B2.negatief)}>
          <div style={regel}>
            <Breuk teller="1" noemer={<XTot n={<em>n</em>} />} /> {is} <XTot n={<span>−<em>n</em></span>} />
          </div>
        </FadeUp>
        <FadeUp from={t(B2.wortel)}>
          <div style={regel}>
            <Wortel>
              <X />
            </Wortel>{' '}
            {is} <XTot n="1/2" />
          </div>
        </FadeUp>
        <FadeUp from={t(B2.nde)}>
          <div style={regel}>
            <Wortel index={<em>n</em>}>
              <XTot n={<em>m</em>} />
            </Wortel>{' '}
            {is} <XTot n={<em>m/n</em>} />
          </div>
        </FadeUp>
      </div>
      <AafCorner pose={frame >= t(B2.negatief) ? 'point' : 'idle'} poseFrame={frame - t(B2.negatief)} />
    </Scene>
  )
}

/* ── Scène 3 · Het stappenplan ──────────────────────────────────────── */
export function HerschrijvenStappenplan() {
  const frame = useCurrentFrame()
  const rij: CSSProperties = { display: 'flex', alignItems: 'center', gap: 36, width: 1180 }
  return (
    <Scene gap={30}>
      <FadeUp from={t(5)}>
        <h2 style={sceneTitelStijl}>
          Het <span style={{ color: groen }}>stappenplan</span>
        </h2>
      </FadeUp>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        <div style={rij}>
          <Pop from={t(B3.stap0)}>
            <StapLabel>Stap 0 · Analyseer de buitenste schil</StapLabel>
          </Pop>
          <FadeUp from={t(B3.herschrijven)}>
            <div style={{ ...mathStyle, fontSize: 30 }}>
              alleen <X /> in de noemer of onder de wortel{' '}
              <span style={{ color: theme.textMuted }}>→</span>{' '}
              <span style={{ color: groen }}>herschrijven</span>
            </div>
          </FadeUp>
        </div>
        <div style={rij}>
          <Pop from={t(B3.stap1)}>
            <StapLabel>
              Stap 1 · schrijf als macht van <em>x</em>
            </StapLabel>
          </Pop>
        </div>
        <div style={rij}>
          <Pop from={t(B3.stap2)}>
            <StapLabel>Stap 2 · pas de machtsregel toe</StapLabel>
          </Pop>
        </div>
        <div style={rij}>
          <Pop from={t(B3.stap3)}>
            <StapLabel>Stap 3 · schrijf het antwoord terug</StapLabel>
          </Pop>
        </div>
      </div>
      <AafCorner pose={frame >= t(B3.stap0) ? 'point' : 'idle'} poseFrame={frame - t(B3.stap0)} />
    </Scene>
  )
}

/* ── Scène 4 · Voorbeeld: een macht in de noemer ────────────────────── */
export function HerschrijvenNoemer() {
  const frame = useCurrentFrame()
  return (
    <Scene gap={22}>
      <FadeUp from={t(5)}>
        <h2 style={sceneTitelStijl}>
          Een macht in de <span style={{ color: groen }}>noemer</span>
        </h2>
      </FadeUp>
      <FadeUp from={t(5)}>
        <div style={{ ...mathStyle, fontSize: 52, paddingBottom: 12 }}>
          <FnX naam="f" /> ={' '}
          <Breuk
            teller="6"
            noemer={
              <span style={{ display: 'inline-block', padding: '6px 18px' }}>
                <Circled from={t(B4.cirkel)} color={groen}>
                  <XTot n={3} />
                </Circled>
              </span>
            }
          />
        </div>
      </FadeUp>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Rij label="Stap 0 · analyseer" from={t(B4.stap0)}>
          <Pop from={t(B4.chip)}>
            <Chip color={groen} bg={theme.accentLight}>
              Herschrijven!
            </Chip>
          </Pop>
        </Rij>
        <Rij label="Stap 1 · herschrijf" from={t(B4.stap1)}>
          <FadeUp from={t(B4.herschreven)}>
            <div style={uitwerking}>
              <FnX naam="f" /> = 6<XTot n="−3" />
            </div>
          </FadeUp>
        </Rij>
        <Rij label="Stap 2 · machtsregel" from={t(B4.stap2)}>
          <FadeUp from={t(B4.exponent)}>
            <div style={uitwerking}>
              <FnX naam="f" accent /> = <span style={{ color: rood }}>−3</span> · 6
              <XTot n={<span style={{ color: rood }}>−3 − 1</span>} />
            </div>
          </FadeUp>
          <FadeUp from={t(B4.uitkomst)}>
            <div style={{ ...uitwerking, color: groen }}>
              = −18<XTot n="−4" />
            </div>
          </FadeUp>
        </Rij>
        <Rij label="Stap 3 · schrijf terug" from={t(B4.stap3)}>
          <Pop from={t(B4.antwoord)}>
            <div style={{ ...uitwerking, fontSize: 44 }}>
              <FnX naam="f" accent /> ={' '}
              <span style={{ color: groen }}>
                −<Breuk teller="18" noemer={<XTot n={4} />} />
              </span>
            </div>
          </Pop>
        </Rij>
      </div>
      <AafCorner
        pose={frame >= t(B4.antwoord + 20) ? 'nod' : frame >= t(B4.cirkel) ? 'point' : 'idle'}
        poseFrame={frame >= t(B4.antwoord + 20) ? frame - t(B4.antwoord + 20) : frame - t(B4.cirkel)}
      />
    </Scene>
  )
}

/* ── Scène 5 · Voorbeeld: een wortel ────────────────────────────────── */
export function HerschrijvenWortel() {
  const frame = useCurrentFrame()
  const wortelX = (
    <Wortel>
      <X />
    </Wortel>
  )
  return (
    <Scene gap={22}>
      <FadeUp from={t(5)}>
        <h2 style={sceneTitelStijl}>
          Een <span style={{ color: groen }}>wortel</span>
        </h2>
      </FadeUp>
      <FadeUp from={t(5)}>
        <div style={{ ...mathStyle, fontSize: 52, paddingBottom: 12 }}>
          <FnX naam="f" /> = <X /> ·{' '}
          <span style={{ display: 'inline-block', padding: '6px 18px' }}>
            <Circled from={t(B5.cirkel)} color={groen}>
              {wortelX}
            </Circled>
          </span>
        </div>
      </FadeUp>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Rij label="Stap 0 · analyseer" from={t(B5.stap0)}>
          <Pop from={t(B5.chip)}>
            <Chip color={groen} bg={theme.accentLight}>
              Herschrijven!
            </Chip>
          </Pop>
        </Rij>
        <Rij label="Stap 1 · herschrijf" from={t(B5.stap1)}>
          <FadeUp from={t(B5.herschreven)}>
            <div style={uitwerking}>
              <FnX naam="f" /> = <XTot n={1} /> · <XTot n="1/2" />
            </div>
          </FadeUp>
          <FadeUp from={t(B5.macht)}>
            <div style={{ ...uitwerking, color: groen }}>
              = <XTot n="3/2" />
            </div>
          </FadeUp>
        </Rij>
        <FadeUp from={t(B5.optellen)}>
          <p style={{ ...captionStyle, fontSize: 26, textAlign: 'left', paddingLeft: 362, marginTop: -10 }}>
            bij keer tel je de exponenten op: 1 + ½ = 3/2
          </p>
        </FadeUp>
        <Rij label="Stap 2 · machtsregel" from={t(B5.stap2)}>
          <FadeUp from={t(B5.exponent)}>
            <div style={uitwerking}>
              <FnX naam="f" accent /> = <Breuk teller="3" noemer="2" />
              <XTot n="3/2 − 1" />
            </div>
          </FadeUp>
          <FadeUp from={t(B5.uitkomst)}>
            <div style={{ ...uitwerking, color: groen }}>
              = <Breuk teller="3" noemer="2" />
              <XTot n="1/2" />
            </div>
          </FadeUp>
        </Rij>
        <Rij label="Stap 3 · schrijf terug" from={t(B5.stap3)}>
          <Pop from={t(B5.antwoord)}>
            <div style={{ ...uitwerking, fontSize: 44 }}>
              <FnX naam="f" accent /> = <span style={{ color: groen }}>1,5{wortelX}</span>
            </div>
          </Pop>
        </Rij>
      </div>
      <AafCorner
        pose={frame >= t(B5.antwoord + 20) ? 'jump' : frame >= t(B5.cirkel) ? 'point' : 'idle'}
        poseFrame={frame >= t(B5.antwoord + 20) ? frame - t(B5.antwoord + 20) : frame - t(B5.cirkel)}
      />
    </Scene>
  )
}

/* ── Scène 6 · Samenvatting ─────────────────────────────────────────── */
export function HerschrijvenSamenvatting() {
  const frame = useCurrentFrame()
  const itemStijl: CSSProperties = {
    fontFamily: theme.fontSans,
    fontSize: 40,
    color: theme.text,
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    textAlign: 'left',
  }
  const nummerStijl: CSSProperties = { fontFamily: theme.fontSerif, color: groen, fontSize: 50 }
  return (
    <Scene gap={38}>
      <FadeUp from={t(5)}>
        <h2 style={{ ...titleStyle, fontSize: 72 }}>Samengevat</h2>
      </FadeUp>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1240 }}>
        <FadeUp from={t(B6.een)}>
          <div style={itemStijl}>
            <span style={nummerStijl}>1.</span>
            <span>
              Alleen <em>x</em> in de noemer of onder de wortel? →{' '}
              <strong style={{ color: groen }}>herschrijf</strong>
            </span>
          </div>
        </FadeUp>
        <FadeUp from={t(B6.twee)}>
          <div style={itemStijl}>
            <span style={nummerStijl}>2.</span>
            <span>
              Pas de <strong style={{ color: groen }}>machtsregel</strong> toe
            </span>
          </div>
        </FadeUp>
        <FadeUp from={t(B6.drie)}>
          <div style={itemStijl}>
            <span style={nummerStijl}>3.</span>
            <span>Schrijf terug, zonder negatieve of gebroken exponent</span>
          </div>
        </FadeUp>
      </div>
      <FadeUp from={t(B6.letOp)}>
        <p style={{ ...captionStyle, fontSize: 34 }}>
          meer dan alleen <X /> onder de wortel, zoals{' '}
          <span style={{ fontFamily: theme.fontSerif, color: theme.text }}>
            <Wortel>
              <XTot n={2} /> + 1
            </Wortel>
          </span>
          ? → <strong style={{ color: rood }}>kettingregel</strong>
        </p>
      </FadeUp>
      <FadeUp from={t(B6.succes)}>
        <p style={{ ...captionStyle, fontFamily: theme.fontSerif, fontSize: 54, color: theme.text }}>Succes!</p>
      </FadeUp>
      <AafCorner pose={frame >= t(B6.succes) ? 'wave' : 'idle'} poseFrame={frame - t(B6.succes)} />
    </Scene>
  )
}
