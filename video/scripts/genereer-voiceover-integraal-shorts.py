#!/usr/bin/env python3
"""Stem Pauline (ElevenLabs) voor de vijf integraal-Shorts.

ELEVENLABS_API_KEY in de omgeving. Opnieuw genereren kost tegoed.
SHORT=primitief BEATS=2 beperkt tot die fragmenten. FORCE=1 overschrijft mp3's.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VOICE_ID = os.environ.get("VOICE_ID", "6UGZSawYvSTRIMHxH2uW")
MODEL = "eleven_multilingual_v2"
LEAD = 10
TAIL = 20
# Het eindbeeld met de sitenaam blijft iets langer staan, zodat die leesbaar is.
END_HOLD = 45
FPS = 30

# Volgorde vast: de beats in src/shorts.tsx volgen deze lijst.
TEKSTEN = {
    "primitief": [
        "Hoe vind je de primitieve van vier x tot de derde?",
        "De primitieve van een macht. De macht gaat één omhoog, en je deelt door die nieuwe macht.",
        "Kijk naar de integraal van vier x tot de derde.",
        "De macht drie wordt vier. Daarna deel je door vier.",
        "De vieren vallen weg. De primitieve is x tot de vierde, plus c.",
        "Oefen dit op integraaloefenen punt nl.",
    ],
    "substitutie": [
        "Hoe primitiver je twee x keer, haakje x kwadraat plus drie, tot de vierde?",
        "Substitutie. Zie je een functie, en vlak ervoor zijn afgeleide? Dan ken je de primitieve.",
        "Neem de integraal van twee x, keer, x kwadraat plus drie, tot de vierde.",
        "Noem de kern g van x. g van x is x kwadraat plus drie. De afgeleide van g is twee x. Die staat er al.",
        "De primitieve is x kwadraat plus drie, tot de vijfde, gedeeld door vijf, plus c.",
        "Oefen substitutie op integraaloefenen punt nl.",
    ],
    "partieel": [
        "Hoe primitiver je x keer e tot de x?",
        "Partieel integreren gebruik je bij een product van twee functies.",
        "Neem de integraal van x keer e tot de x.",
        "g van x is x. De afgeleide van g is één. De afgeleide van h is e tot de x, dus h van x is ook e tot de x.",
        "Vul de formule in. x keer e tot de x, min de integraal van e tot de x.",
        "De primitieve is x keer e tot de x, min e tot de x, plus c.",
        "Meer partieel oefenen doe je op integraaloefenen punt nl.",
    ],
    "oppervlakte": [
        "Wat is de oppervlakte onder de grafiek van twee x, tussen nul en drie?",
        "De oppervlakte onder een grafiek reken je uit met een integraal.",
        "De grafiek van f van x is twee x, tussen nul en drie.",
        "De primitieve van twee x is x kwadraat.",
        "Drie kwadraat min nul is negen. De oppervlakte is negen.",
        "Zelf oefenen doe je op integraaloefenen punt nl.",
    ],
    "arctan": [
        "Welke primitieve hoort bij één gedeeld door x kwadraat plus één?",
        "Die staat op de formulekaart: de arctangens van x, plus c.",
        "Ter controle. De afgeleide van de arctangens van x is precies één gedeeld door x kwadraat plus één.",
        "Oefen de arctangens op integraaloefenen punt nl.",
    ],
}


def laad_sleutel() -> str:
    sleutel = os.environ.get("ELEVENLABS_API_KEY", "")
    if sleutel:
        return sleutel
    env = ROOT / ".env"
    if env.exists():
        for regel in env.read_text(encoding="utf-8").splitlines():
            if regel.startswith("ELEVENLABS_API_KEY="):
                return regel.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit("Zet ELEVENLABS_API_KEY")


def spreek(sleutel: str, tekst: str, doel: Path) -> None:
    body = json.dumps({"text": tekst, "model_id": MODEL}).encode()
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?output_format=mp3_44100_128",
        data=body,
        headers={"xi-api-key": sleutel, "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as antwoord:
            doel.write_bytes(antwoord.read())
    except urllib.error.HTTPError as fout:
        detail = fout.read().decode("utf-8", errors="replace")[:500]
        sys.exit(f"FOUT bij {doel.name} (HTTP {fout.code}): {detail}")


def seconden(pad: Path) -> float:
    out = subprocess.check_output(["afinfo", str(pad)], text=True)
    gevonden = re.search(r"estimated duration:\s*([0-9.]+)", out)
    if not gevonden:
        sys.exit(f"geen duur in afinfo voor {pad}")
    return float(gevonden.group(1))


def schrijf_duren(frames_per_short: dict[str, list[int]]) -> None:
    regels = [
        "/**",
        " * Frame-aantallen per beat (30 fps), inclusief aanloop en uitloop.",
        " * Geschreven door scripts/genereer-voiceover-integraal-shorts.py. Niet met de hand",
        " * aanpassen: opnieuw genereren overschrijft dit bestand.",
        " * SHORT_LEAD blijft de stilte vóór de stem in shorts.tsx.",
        " */",
        f"export const SHORT_LEAD = {LEAD}",
        f"export const SHORT_TAIL = {TAIL}",
        "",
        "export const shortDuren = {",
    ]
    for naam, frames in frames_per_short.items():
        regels.append(f"  {naam}: [{', '.join(str(n) for n in frames)}],")
    regels += [
        "} as const",
        "",
        "export function duurVan(frames: readonly number[]) {",
        "  return frames.reduce((som, n) => som + n, 0)",
        "}",
        "",
    ]
    (ROOT / "src" / "shorts-duren.ts").write_text("\n".join(regels), encoding="utf-8")


def main() -> None:
    os.chdir(ROOT)
    sleutel = laad_sleutel()
    gekozen = os.environ.get("SHORT", "")
    beats = {int(n) for n in os.environ.get("BEATS", "").split(",") if n}
    force = os.environ.get("FORCE") == "1"

    for naam, zinnen in TEKSTEN.items():
        if gekozen and naam != gekozen:
            continue
        uit = ROOT / "public" / "voiceover-shorts" / naam
        uit.mkdir(parents=True, exist_ok=True)
        for index, zin in enumerate(zinnen, start=1):
            if beats and index not in beats:
                continue
            doel = uit / f"beat-{index}.mp3"
            if doel.exists() and not force:
                print(f"sla {naam} beat {index} over (bestaat al)")
                continue
            print(f"Short {naam}, beat {index}…", flush=True)
            spreek(sleutel, zin, doel)

    print("Duur per short (beeld, seconden):")
    frames_per_short: dict[str, list[int]] = {}
    te_lang = False
    for naam in TEKSTEN:
        map_ = ROOT / "public" / "voiceover-shorts" / naam
        bestanden = sorted(map_.glob("beat-*.mp3"), key=lambda pad: int(pad.stem.split("-")[1]))
        if len(bestanden) != len(TEKSTEN[naam]):
            sys.exit(f"{naam}: {len(bestanden)} fragmenten, verwacht {len(TEKSTEN[naam])}")
        frames = []
        audio = 0.0
        for pad in bestanden:
            sec = seconden(pad)
            audio += sec
            frames.append(max(45, round(sec * FPS) + LEAD + TAIL))
        frames[-1] += END_HOLD
        beeld = sum(frames) / FPS
        print(f"  {naam}: audio {audio:.1f}s, beeld {beeld:.1f}s, frames {frames}")
        if beeld > 50 or beeld < 20:
            print(f"  WAARSCHUWING: {naam} valt buiten 20–50 seconden", file=sys.stderr)
            te_lang = True
        frames_per_short[naam] = frames
    schrijf_duren(frames_per_short)
    if te_lang:
        sys.exit(1)


if __name__ == "__main__":
    main()
