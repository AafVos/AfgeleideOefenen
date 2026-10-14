#!/usr/bin/env python3
"""Maak woordtijden bij de bestaande stem, zonder de audio opnieuw te genereren.

Bestaande ElevenLabs-alignment (scene-n.json, per teken) wordt omgezet naar woorden.
Ontbreekt die, dan vraagt dit script de forced-alignment-API om woordtijden bij het mp3.
"""
import json
import os
import re
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

VIDEO = Path(__file__).resolve().parents[1]
PUB = VIDEO / "public"
SCRIPTS = VIDEO / "scripts"

def gesproken(ruw: str) -> str:
    tekst = ruw.replace('\\"', '"')
    tekst = re.sub(r"<break\b[^>]*/>", " ", tekst)
    return re.sub(r"\s+", " ", tekst).strip()

def quotes(pad: Path) -> list[str]:
    bron = pad.read_text()
    return re.findall(r'"((?:\\.|[^"\\])*)"', bron)

def teksten_uit_array(pad: Path) -> list[str]:
    bron = pad.read_text()
    blok = re.search(r"teksten=\((.*?)\)\n", bron, re.S)
    if not blok:
        raise SystemExit(f"geen teksten-array in {pad.name}")
    return [gesproken(s) for s in re.findall(r'"((?:\\.|[^"\\])*)"', blok.group(1))]

def shorts_teksten() -> dict[str, list[str]]:
    regels = quotes(SCRIPTS / "genereer-voiceover-shorts.sh")
    spraak = [
        gesproken(s)
        for s in regels
        if " " in gesproken(s)
        and "$" not in s
        and "http" not in s
        and "import " not in s
        and not s.startswith("Content-")
    ]
    groepen = {
        "macht": 6,
        "ketting": 6,
        "product": 7,
        "quotient": 6,
        "wortel": 5,
    }
    if len(spraak) != sum(groepen.values()):
        raise SystemExit(f"shorts: verwacht {sum(groepen.values())} zinnen, kreeg {len(spraak)}")
    uit = {}
    i = 0
    for naam, n in groepen.items():
        uit[naam] = spraak[i : i + n]
        i += n
    return uit

def woorden_uit_tekens(pad: Path) -> list[dict]:
    al = json.loads(pad.read_text())
    tekens = al["characters"]
    starts = al["character_start_times_seconds"]
    einden = al["character_end_times_seconds"]
    woorden = []
    buf = ""
    start = eind = None
    def weg():
        nonlocal buf, start, eind
        if buf:
            woorden.append({"tekst": buf, "start": round(start, 3), "eind": round(eind, 3)})
        buf = ""
        start = eind = None
    for i, ch in enumerate(tekens):
        if ch.isspace():
            weg()
            continue
        if start is None:
            start = starts[i]
        buf += ch
        eind = einden[i]
    weg()
    return woorden

def forced(mp3: Path, tekst: str) -> list[dict]:
    key = os.environ["ELEVENLABS_API_KEY"]
    boundary = "----WoordtijdenBoundary"
    audio = mp3.read_bytes()
    def deel(naam, inhoud, ctype, bestandsnaam=None):
        disp = f'Content-Disposition: form-data; name="{naam}"'
        if bestandsnaam:
            disp += f'; filename="{bestandsnaam}"'
        kop = f"--{boundary}\r\n{disp}\r\nContent-Type: {ctype}\r\n\r\n".encode()
        return kop + inhoud + b"\r\n"
    body = b"".join([
        deel("text", tekst.encode(), "text/plain"),
        deel("file", audio, "audio/mpeg", mp3.name),
    ]) + f"--{boundary}--\r\n".encode()
    req = urllib.request.Request(
        "https://api.elevenlabs.io/v1/forced-alignment",
        data=body,
        headers={"xi-api-key": key, "Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as res:
        data = json.load(res)
    woorden = []
    for w in data["words"]:
        stuk = w["text"].strip()
        if not stuk:
            continue
        woorden.append({"tekst": stuk, "start": round(w["start"], 3), "eind": round(w["end"], 3)})
    return woorden

def taken():
    """(sleutel, mp3, tekst of None als er al een teken-alignment is)."""
    uit = []
    paren = [
        ("voiceover", "genereer-voiceover.sh"),
        ("voiceover-regels", "genereer-voiceover-regels.sh"),
        ("voiceover-som29", "genereer-voiceover-som29.sh"),
        ("voiceover-som30", "genereer-voiceover-som30.sh"),
        ("voiceover-som34", "genereer-voiceover-som34.sh"),
        ("voiceover-quotient", "genereer-voiceover-quotient.sh"),
        ("voiceover-herschrijven", "genereer-voiceover-herschrijven.sh"),
    ]
    for mapnaam, script in paren:
        zinnen = teksten_uit_array(SCRIPTS / script)
        for i, zin in enumerate(zinnen, 1):
            mp3 = PUB / mapnaam / f"scene-{i}.mp3"
            if not mp3.exists():
                raise SystemExit(f"mist {mp3}")
            uit.append((f"{mapnaam}/{i}", mp3, zin))
    for mapnaam, zinnen in shorts_teksten().items():
        for i, zin in enumerate(zinnen, 1):
            mp3 = PUB / "voiceover-shorts" / mapnaam / f"scene-{i}.mp3"
            if not mp3.exists():
                raise SystemExit(f"mist {mp3}")
            uit.append((f"voiceover-shorts/{mapnaam}/{i}", mp3, zin))
    return uit

def een(item):
    sleutel, mp3, zin = item
    teken = mp3.with_suffix(".json")
    if teken.exists():
        return sleutel, woorden_uit_tekens(teken), "tekens"
    return sleutel, forced(mp3, zin), "api"

def main():
    items = taken()
    resultaat = {}
    api = 0
    with ThreadPoolExecutor(max_workers=4) as pool:
        toekomsten = {pool.submit(een, item): item[0] for item in items}
        for fut in as_completed(toekomsten):
            sleutel, woorden, bron = fut.result()
            if not woorden:
                raise SystemExit(f"geen woorden voor {sleutel}")
            resultaat[sleutel] = woorden
            if bron == "api":
                api += 1
            print(f"{sleutel}: {len(woorden)} woorden ({bron})", flush=True)
    regels = [
        "export type Woord = { tekst: string; start: number; eind: number }",
        "",
        "/** Woordtijden van ElevenLabs, per voice-overfragment. */",
        "export const WOORDEN: Record<string, Woord[]> = " + json.dumps(resultaat, ensure_ascii=False, indent=2),
        "",
    ]
    doel = VIDEO / "src" / "woordtijden.ts"
    doel.write_text("\n".join(regels))
    print(f"geschreven {doel} ({len(resultaat)} fragmenten, {api} via de API)")

if __name__ == "__main__":
    main()
