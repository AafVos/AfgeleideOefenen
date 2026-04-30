'use client'

import { useState } from 'react'

import { Math as TeX } from '@/components/math'

type ClusterInfo = {
  rule: string
  example?: {
    problem: string   // LaTeX
    answer: string    // LaTeX
    steps?: string[]  // plain text met inline LaTeX als $...$
  }
}

/**
 * Formule + voorbeeld per topic/cluster.
 * Sleutel = `topicSlug/clusterSlug`
 */
const CLUSTER_INFO: Record<string, ClusterInfo> = {
  // ── Basis ────────────────────────────────────────────────────────────────
  'basis/standaard': {
    rule: "f(x) = ax^n \\implies f'(x) = n \\cdot ax^{n-1}",
    example: {
      problem: 'f(x) = 3x^4',
      answer: "f'(x) = 12x^3",
      steps: ['$n = 4$, $a = 3$', "$f'(x) = 4 \\cdot 3 \\cdot x^{4-1} = 12x^3$"],
    },
  },
  'basis/herschrijven': {
    rule: "\\sqrt{x} = x^{1/2} \\quad \\dfrac{1}{x^n} = x^{-n} \\implies f'(x) = n \\cdot ax^{n-1}",
    example: {
      problem: 'f(x) = \\sqrt{x} = x^{1/2}',
      answer: "f'(x) = \\dfrac{1}{2}x^{-1/2} = \\dfrac{1}{2\\sqrt{x}}",
      steps: ['Schrijf om: $f(x) = x^{1/2}$', "$n = \\tfrac{1}{2}$: $f'(x) = \\tfrac{1}{2} x^{-1/2} = \\dfrac{1}{2\\sqrt{x}}$"],
    },
  },
  'basis/machten_combineren': {
    rule: "x^a \\cdot x^b = x^{a+b} \\qquad \\dfrac{x^a}{x^b} = x^{a-b} \\qquad (x^a)^b = x^{ab}",
    example: {
      problem: 'f(x) = x^4 / x = x^3',
      answer: "f'(x) = 3x^2",
      steps: ['Vereenvoudig: $x^4/x = x^{4-1} = x^3$', "$f'(x) = 3x^2$"],
    },
  },

  // ── Somregel ────────────────────────────────────────────────────────────
  'somregel/optelling': {
    rule: "f(x) = g(x)+h(x) \\implies f'(x) = g'(x)+h'(x)",
    example: {
      problem: 'f(x) = 2x^3 + 3x^2',
      answer: "f'(x) = 6x^2 + 6x",
      steps: ['Leid elke term apart af', "$2x^3 \\to 6x^2$ en $3x^2 \\to 6x$"],
    },
  },
  'somregel/haakjes_uitwerken': {
    rule: '\\text{Werk haakjes uit, pas dan de somregel toe}',
    example: {
      problem: 'f(x) = (x+1)(x+2)',
      answer: "f'(x) = 2x+3",
      steps: ['Uitwerken: $f(x) = x^2 + 3x + 2$', "$f'(x) = 2x + 3$"],
    },
  },

  // ── Productregel ────────────────────────────────────────────────────────
  'productregel/twee_veeltermen': {
    rule: "f(x) = g(x) \\cdot h(x) \\implies f'(x) = g'h + gh'",
    example: {
      problem: 'f(x) = x^2 \\cdot (x+3)',
      answer: "f'(x) = 2x(x+3) + x^2 = 3x^2 + 6x",
      steps: ['$g = x^2,\\ h = x+3$', "$g' = 2x,\\ h' = 1$", "$f'(x) = 2x(x+3) + x^2 \\cdot 1 = 3x^2+6x$"],
    },
  },
  'productregel/veelterm_macht': {
    rule: "f(x) = g(x) \\cdot h(x) \\implies f'(x) = g'h + gh'",
    example: {
      problem: 'f(x) = x^3 \\cdot (2x+1)',
      answer: "f'(x) = 3x^2(2x+1) + 2x^3 = 8x^3 + 3x^2",
    },
  },
  'productregel/veelterm_wortel': {
    rule: "f(x) = g(x) \\cdot h(x) \\implies f'(x) = g'h + gh'",
    example: {
      problem: 'f(x) = x \\cdot \\sqrt{x}',
      answer: "f'(x) = \\sqrt{x} + \\dfrac{x}{2\\sqrt{x}} = \\dfrac{3}{2}\\sqrt{x}",
      steps: ["$g = x,\\ h = \\sqrt{x} = x^{1/2}$", "$g' = 1,\\ h' = \\tfrac{1}{2}x^{-1/2}$", "$f'(x) = \\sqrt{x} + x \\cdot \\tfrac{1}{2\\sqrt{x}} = \\tfrac{3}{2}\\sqrt{x}$"],
    },
  },
  'productregel/drie_factoren': {
    rule: "f(x) = g \\cdot h \\cdot k \\implies f'(x) = g'hk + gh'k + ghk'",
    example: {
      problem: 'f(x) = x \\cdot x^2 \\cdot x^3',
      answer: "f'(x) = 6x^5",
      steps: ['Of eenvoudiger: $f(x) = x^6$, dus $f\'(x) = 6x^5$'],
    },
  },

  // ── Quotiëntregel ────────────────────────────────────────────────────────
  'quotientregel/makkelijk': {
    rule: "f(x) = \\dfrac{t(x)}{n(x)} \\implies f'(x) = \\dfrac{t'n - tn'}{n^2}",
    example: {
      problem: 'f(x) = \\dfrac{x^2}{x+1}',
      answer: "f'(x) = \\dfrac{2x(x+1)-x^2}{(x+1)^2} = \\dfrac{x^2+2x}{(x+1)^2}",
      steps: ['$t = x^2,\\ n = x+1$', "$t' = 2x,\\ n' = 1$", "$f'(x) = \\dfrac{2x(x+1) - x^2 \\cdot 1}{(x+1)^2} = \\dfrac{x^2+2x}{(x+1)^2}$"],
    },
  },
  'quotientregel/polynoom': {
    rule: "f(x) = \\dfrac{t(x)}{n(x)} \\implies f'(x) = \\dfrac{t'n - tn'}{n^2}",
    example: {
      problem: 'f(x) = \\dfrac{x^3}{x^2+1}',
      answer: "f'(x) = \\dfrac{3x^2(x^2+1)-2x^4}{(x^2+1)^2} = \\dfrac{x^4+3x^2}{(x^2+1)^2}",
    },
  },
  'quotientregel/combi_somregel': {
    rule: "f(x) = \\dfrac{t(x)}{n(x)} \\implies f'(x) = \\dfrac{t'n - tn'}{n^2}",
    example: {
      problem: 'f(x) = \\dfrac{x^2+1}{x} + 3x',
      answer: "f'(x) = \\dfrac{x^2-1}{x^2} + 3",
      steps: ['Leid $\\dfrac{x^2+1}{x}$ af via quotiëntregel', 'Tel de afgeleide van $3x$ erbij op'],
    },
  },

  // ── Kettingregel ────────────────────────────────────────────────────────
  'kettingregel/macht_lineair': {
    rule: "f(x) = (ax+b)^n \\implies f'(x) = n \\cdot a \\cdot (ax+b)^{n-1}",
    example: {
      problem: 'f(x) = (2x+3)^4',
      answer: "f'(x) = 8(2x+3)^3",
      steps: ['$n = 4$, binnenste afgeleide $= 2$', "$f'(x) = 4 \\cdot 2 \\cdot (2x+3)^3 = 8(2x+3)^3$"],
    },
  },
  'kettingregel/macht_veelterm': {
    rule: "f(x) = [g(x)]^n \\implies f'(x) = n \\cdot g'(x) \\cdot [g(x)]^{n-1}",
    example: {
      problem: 'f(x) = (x^2+1)^3',
      answer: "f'(x) = 6x(x^2+1)^2",
      steps: ['$g(x) = x^2+1,\\ g\'(x) = 2x$', "$f'(x) = 3 \\cdot 2x \\cdot (x^2+1)^2 = 6x(x^2+1)^2$"],
    },
  },
  'kettingregel/wortel': {
    rule: "f(x) = \\sqrt{g(x)} \\implies f'(x) = \\dfrac{g'(x)}{2\\sqrt{g(x)}}",
    example: {
      problem: 'f(x) = \\sqrt{x^2+4}',
      answer: "f'(x) = \\dfrac{x}{\\sqrt{x^2+4}}",
      steps: ['$g(x) = x^2+4,\\ g\'(x) = 2x$', "$f'(x) = \\dfrac{2x}{2\\sqrt{x^2+4}} = \\dfrac{x}{\\sqrt{x^2+4}}$"],
    },
  },
  'kettingregel/negatieve_macht': {
    rule: "f(x) = [g(x)]^{-n} \\implies f'(x) = -n \\cdot g'(x) \\cdot [g(x)]^{-n-1}",
    example: {
      problem: 'f(x) = \\dfrac{1}{(x+1)^2} = (x+1)^{-2}',
      answer: "f'(x) = \\dfrac{-2}{(x+1)^3}",
      steps: ["$g(x) = x+1,\\ g'(x) = 1$", "$f'(x) = -2 \\cdot 1 \\cdot (x+1)^{-3} = \\dfrac{-2}{(x+1)^3}$"],
    },
  },
  'kettingregel/combi_somregel': {
    rule: "f(x) = g(x)+h(x) \\implies f'(x) = g'(x)+h'(x) \\quad\\text{(elk lid kettingregel)}",
    example: {
      problem: 'f(x) = (x+1)^2 + (2x-1)^3',
      answer: "f'(x) = 2(x+1) + 6(2x-1)^2",
    },
  },
  'kettingregel/plus_productregel': {
    rule: "f(x) = g(x) \\cdot h(x) \\implies f'(x) = g'h+gh' \\quad\\text{(kettingregel in } g \\text{ of } h\\text{)}",
    example: {
      problem: 'f(x) = x \\cdot (x^2+1)^3',
      answer: "f'(x) = (x^2+1)^3 + 6x^2(x^2+1)^2",
      steps: ["$g = x,\\ h = (x^2+1)^3$", "$g' = 1,\\ h' = 6x(x^2+1)^2$", "$f'(x) = (x^2+1)^3 + x \\cdot 6x(x^2+1)^2$"],
    },
  },
  'kettingregel/plus_quotientregel': {
    rule: "f(x) = \\dfrac{t(x)}{n(x)} \\implies f'(x) = \\dfrac{t'n-tn'}{n^2} \\quad\\text{(kettingregel in } t \\text{ of } n\\text{)}",
    example: {
      problem: 'f(x) = \\dfrac{x+1}{\\sqrt{2x+1}}',
      answer: "f'(x) = \\dfrac{\\sqrt{2x+1} - \\frac{x+1}{\\sqrt{2x+1}}}{2x+1}",
      steps: ["$t = x+1,\\ t' = 1$", "$n = \\sqrt{2x+1},\\ n' = \\dfrac{1}{\\sqrt{2x+1}}$"],
    },
  },

  // ── e-macht ──────────────────────────────────────────────────────────────
  'emacht/standaard': {
    rule: "f(x) = e^x \\implies f'(x) = e^x",
    example: {
      problem: 'f(x) = 3e^x',
      answer: "f'(x) = 3e^x",
    },
  },
  'emacht/combi_somregel': {
    rule: "f(x) = e^x \\implies f'(x) = e^x \\quad\\text{(combineer met somregel)}",
    example: {
      problem: 'f(x) = x^2 + e^x',
      answer: "f'(x) = 2x + e^x",
    },
  },
  'emacht/combi_productregel': {
    rule: "f(x) = g(x) \\cdot e^x \\implies f'(x) = g'(x)e^x + g(x)e^x",
    example: {
      problem: 'f(x) = x \\cdot e^x',
      answer: "f'(x) = (x+1)e^x",
      steps: ["$g = x,\\ g' = 1$", "$f'(x) = 1 \\cdot e^x + x \\cdot e^x = (1+x)e^x$"],
    },
  },
  'emacht/combi_kettingregel': {
    rule: "f(x) = e^{g(x)} \\implies f'(x) = g'(x) \\cdot e^{g(x)}",
    example: {
      problem: 'f(x) = e^{3x+1}',
      answer: "f'(x) = 3e^{3x+1}",
      steps: ["$g(x) = 3x+1,\\ g'(x) = 3$", "$f'(x) = 3 \\cdot e^{3x+1}$"],
    },
  },
  'emacht/combi_quotientregel': {
    rule: "f(x) = \\dfrac{t(x)}{n(x)} \\implies f'(x) = \\dfrac{t'n - tn'}{n^2} \\quad\\text{(met } e^x\\text{)}",
    example: {
      problem: 'f(x) = \\dfrac{e^x}{x}',
      answer: "f'(x) = \\dfrac{e^x(x-1)}{x^2}",
      steps: ["$t = e^x,\\ t' = e^x;\\ n = x,\\ n' = 1$", "$f'(x) = \\dfrac{e^x \\cdot x - e^x}{x^2} = \\dfrac{e^x(x-1)}{x^2}$"],
    },
  },

  // ── Goniometrie ──────────────────────────────────────────────────────────
  'goniometrie/standaard': {
    rule: "f(x)=\\sin x \\Rightarrow f'(x)=\\cos x \\qquad f(x)=\\cos x \\Rightarrow f'(x)=-\\sin x \\qquad f(x)=\\tan x \\Rightarrow f'(x)=1+\\tan^2 x",
    example: {
      problem: 'f(x) = 3\\sin(x) - 2\\cos(x)',
      answer: "f'(x) = 3\\cos(x) + 2\\sin(x)",
    },
  },
  'goniometrie/combi_kettingregel': {
    rule: "f(x) = \\sin(g(x)) \\implies f'(x) = g'(x)\\cos(g(x))",
    example: {
      problem: 'f(x) = \\sin(3x+1)',
      answer: "f'(x) = 3\\cos(3x+1)",
      steps: ["$g(x) = 3x+1,\\ g'(x) = 3$", "$f'(x) = 3 \\cdot \\cos(3x+1)$"],
    },
  },
  'goniometrie/combi_productregel': {
    rule: "f(x) = g(x) \\cdot h(x) \\implies f'(x) = g'h + gh' \\quad\\text{(met goniometrie)}",
    example: {
      problem: 'f(x) = x \\cdot \\sin(x)',
      answer: "f'(x) = \\sin(x) + x\\cos(x)",
      steps: ["$g = x,\\ g' = 1;\\ h = \\sin x,\\ h' = \\cos x$", "$f'(x) = \\sin(x) + x\\cos(x)$"],
    },
  },
  'goniometrie/combi_quotientregel': {
    rule: "f(x) = \\dfrac{t(x)}{n(x)} \\implies f'(x) = \\dfrac{t'n - tn'}{n^2} \\quad\\text{(met goniometrie)}",
    example: {
      problem: 'f(x) = \\dfrac{\\sin(x)}{x}',
      answer: "f'(x) = \\dfrac{x\\cos(x) - \\sin(x)}{x^2}",
      steps: ["$t = \\sin x,\\ t' = \\cos x;\\ n = x,\\ n' = 1$", "$f'(x) = \\dfrac{x\\cos x - \\sin x}{x^2}$"],
    },
  },

  // ── ln en log ────────────────────────────────────────────────────────────
  'lnlog/standaard': {
    rule: "f(x) = \\ln x \\Rightarrow f'(x) = \\dfrac{1}{x} \\qquad f(x) = \\log_g x \\Rightarrow f'(x) = \\dfrac{1}{x \\ln g}",
    example: {
      problem: 'f(x) = 2\\ln(x)',
      answer: "f'(x) = \\dfrac{2}{x}",
    },
  },
  'lnlog/combi_somregel': {
    rule: "f(x) = \\ln x \\Rightarrow f'(x) = \\dfrac{1}{x} \\quad\\text{(combineer met somregel)}",
    example: {
      problem: 'f(x) = x^2 + \\ln(x)',
      answer: "f'(x) = 2x + \\dfrac{1}{x}",
    },
  },
  'lnlog/combi_productregel': {
    rule: "f(x) = g(x) \\cdot \\ln x \\implies f'(x) = g'(x)\\ln x + \\dfrac{g(x)}{x}",
    example: {
      problem: 'f(x) = x^2 \\cdot \\ln(x)',
      answer: "f'(x) = 2x\\ln(x) + x",
      steps: ["$g = x^2,\\ g' = 2x;\\ h = \\ln x,\\ h' = \\tfrac{1}{x}$", "$f'(x) = 2x\\ln x + x^2 \\cdot \\tfrac{1}{x} = 2x\\ln x + x$"],
    },
  },
  'lnlog/combi_kettingregel': {
    rule: "f(x) = \\ln(g(x)) \\implies f'(x) = \\dfrac{g'(x)}{g(x)}",
    example: {
      problem: 'f(x) = \\ln(x^2+1)',
      answer: "f'(x) = \\dfrac{2x}{x^2+1}",
      steps: ["$g(x) = x^2+1,\\ g'(x) = 2x$", "$f'(x) = \\dfrac{2x}{x^2+1}$"],
    },
  },
  'lnlog/combi_quotientregel': {
    rule: "f(x) = \\dfrac{t(x)}{n(x)} \\implies f'(x) = \\dfrac{t'n - tn'}{n^2} \\quad\\text{(met ln)}",
    example: {
      problem: 'f(x) = \\dfrac{\\ln(x)}{x}',
      answer: "f'(x) = \\dfrac{1 - \\ln(x)}{x^2}",
      steps: ["$t = \\ln x,\\ t' = \\tfrac{1}{x};\\ n = x,\\ n' = 1$", "$f'(x) = \\dfrac{\\frac{x}{x} - \\ln x}{x^2} = \\dfrac{1-\\ln x}{x^2}$"],
    },
  },
}

export function ClusterRuleHint({
  topicSlug,
  clusterSlug,
}: {
  topicSlug: string
  clusterSlug: string
}) {
  const [open, setOpen] = useState(false)
  const [exOpen, setExOpen] = useState(false)

  const info = CLUSTER_INFO[`${topicSlug}/${clusterSlug}`]
  if (!info) return null

  return (
    <div className="mt-1">
      <button
        onClick={() => { setOpen((v) => !v); if (open) setExOpen(false) }}
        className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-text-muted transition hover:border-accent hover:text-accent"
        aria-expanded={open}
      >
        <span className="text-[10px]">{open ? '▲' : '▼'}</span>
        Uitleg
      </button>

      {open && (
        <div className="mt-2 rounded-lg border border-border bg-surface-2 px-4 py-3">
          {/* Formule */}
          <TeX tex={info.rule} displayMode />

          {/* Voorbeeld + uitwerking samen */}
          {info.example && (
            <div className="mt-3 border-t border-border pt-3">
              <button
                onClick={() => setExOpen((v) => !v)}
                className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent"
              >
                <span className="text-[10px]">{exOpen ? '▲' : '▼'}</span>
                Voorbeeld
              </button>

              {exOpen && (
                <div className="mt-2 space-y-2">
                  {/* Opgave + antwoord */}
                  <div className="rounded-md bg-surface px-3 py-2">
                    <TeX tex={`${info.example.problem} \\implies ${info.example.answer}`} displayMode />
                  </div>

                  {/* Uitwerking direct erbij (indien aanwezig) */}
                  {info.example.steps && (
                    <ol className="space-y-1.5 pl-1">
                      {info.example.steps.map((step, i) => (
                        <li key={i} className="flex gap-2 text-sm text-text-muted">
                          <span className="shrink-0 font-medium text-accent">{i + 1}.</span>
                          <RichStep text={step} />
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** Rendert een stap-string met inline $...$ als KaTeX */
function RichStep({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$)/)
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith('$') && part.endsWith('$') ? (
          <TeX key={i} tex={part.slice(1, -1)} />
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  )
}
