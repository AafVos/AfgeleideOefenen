import Link from 'next/link'

import { Card } from '@/components/ui'

export const metadata = {
  title: 'Hoe het werkt · afgeleideoefenen.nl',
  description:
    'Het verschil tussen het leerpad en vrij oefenen, hoe de site zich aanpast, en hoe je bij de start je voorkeuren kiest.',
}

export default function HoeHetWerktPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-medium uppercase tracking-wider text-accent">
        Het idee achter deze site
      </p>
      <h1 className="mt-2 font-serif text-4xl text-text sm:text-[2.75rem]">
        Twee manieren om afgeleiden te oefenen
      </h1>
      <p className="mt-6 text-lg text-text-muted">
        afgeleideoefenen.nl is opgezet voor één doel: je sneller en sterker in
        differentiëren krijgen, op jouw niveau. Daarom bestaat de site uit twee
        duidelijke onderdelen — plus bij de start een korte keuze wat bij je past.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <Card className="!p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-accent">
            Gestructureerd
          </p>
          <h2 className="mt-2 font-serif text-2xl text-text">Het leerpad</h2>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            Je volgt de leerlijn (volgens Getal &amp; Ruimte): van machtsregel
            naar somregel, productregel, quotiëntregel en kettingregel.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            <strong className="font-medium text-text">Dynamisch:</strong>{' '}
            het pad past zich automatisch aan op wat je antwoordt. Mistaken krijg
            je meer uitleg en passende volgvragen; wat je al beheerst, zie je
            minder terug — zonder dat je alles vooraf hoeft te plannen.
          </p>
        </Card>

        <Card className="!p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-accent">
            Los
          </p>
          <h2 className="mt-2 font-serif text-2xl text-text">
            Vrij oefenen
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            Hier kies je <strong className="font-medium text-text">per keer zelf een onderwerp</strong>
            {' '}(machtsregel, kettingregel, enz.). Dezelfde soort vragen als in
            het leerpad, maar zonder dat de site jou door een vaste volgorde
            duwt. Handig voor herhaling, examenstrepen of alleen maar één hoofdstuk te pakken.
          </p>
        </Card>
      </div>

      <section className="mt-14">
        <h2 className="font-serif text-2xl text-text">
          Eerste keer — jouw voorkeuren
        </h2>
        <p className="mt-3 text-text-muted">
          Na registratie stellen we een paar korte vragen. Eerst kies je of je met het{' '}
          <strong className="font-medium text-text">leerpad</strong> of met{' '}
          <strong className="font-medium text-text">vrij oefenen</strong>{' '}
          wilt beginnen. Kies je het leerpad, dan stem je nog af hoe het pad moet starten:
          vanaf stap één, met een onderwerpen-checklist of met een korte toets.
          Kies je vrij oefenen, dan ga je meteen naar de oefenpagina om onderwerpen
          los aan te tikken — het leerpad blijft in het menu bereikbaar.
        </p>
        <ul className="mt-6 space-y-4 border-l-2 border-border pl-5 text-sm text-text-muted">
          <li>
            <strong className="text-text">Net begonnen</strong> — we lopen het
            leerpad bij je langs vanaf het begin.
          </li>
          <li>
            <strong className="text-text">Ik weet wat ik nog wil</strong> — je
            vinkt aan welke onderdelen je al kent en welke je wilt trainen;
            daarop sluit het leerpad aan.
          </li>
          <li>
            <strong className="text-text">Een korte toets</strong> — een paar
            vragen om in te schatten waar je start; daarna ga je verder op het leerpad
            vanaf daar.
          </li>
          <li>
            <strong className="text-text">Ik kies elk keer zelf onderwerpen</strong>
            {' '}
            — je landt bij <strong className="text-text">vrij oefenen</strong>;
            het leerpad blijft voor later beschikbaar in het menu.
          </li>
        </ul>
      </section>

      <section className="mt-14 rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <h2 className="font-serif text-xl text-text">Samengevat</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-text-muted">
          <li>
            <strong className="text-text">Leerpad</strong> = volg de rode draad;
            het systeem{' '}
            <strong className="text-text">past zich aan jouw fouten en voortgang aan</strong>.
          </li>
          <li>
            <strong className="text-text">Vrij oefenen</strong> = jij zet elk
            bezoek zelf een onderwerp open; prima naast het leerpad voor herhaling.
          </li>
          <li>
            Beide gebruiken <strong className="text-text">dezelfde vragenbasis</strong>
            {' '}en hetzelfde account — je dashboard en voortgang lopen synchroon.
          </li>
        </ul>
      </section>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link
          href="/registreren"
          className="rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-accent/90"
        >
          Account aanmaken
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-border px-5 py-3 text-sm text-text hover:bg-surface-2"
        >
          ← Terug naar home
        </Link>
      </div>
    </div>
  )
}
