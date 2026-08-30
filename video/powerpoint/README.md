# PowerPoint-versie van de uitlegvideo's (proof of concept)

`Som29.pptx` is de som 29-video als PowerPoint: **vijf slides**, één per scène,
waarin elk element met een **klik verschijnt** (zelfde volgorde als de
Remotion-video).

| Slide | Scène |
| --- | --- |
| 1 | H2 · #29 — de opgave |
| 2 | Stap 0 · Analyseer de buitenste schil |
| 3 | De somregel (f, g, h) |
| 4 | De productregel — begint bij zijn eigen f |
| 5 | Voeg alles samen |

Houd hem gelijk met `src/scenes-som29.tsx`: wijzigt de video, dan ook hier
`genereer-assets.py` en `bouw-pptx.py` bijwerken.
Formules zijn scherpe afbeeldingen; cirkels, strepen, pijlen en chips zijn
gewone PowerPoint-vormen die je zelf kunt verplaatsen of aanpassen.

## Zelf opnemen

1. Open `Som29.pptx` in PowerPoint.
2. **Diavoorstelling → Diavoorstelling opnemen** (of in Keynote: importeer,
   dan *Speel af → Neem diavoorstelling op*).
3. Praat en klik door de builds; PowerPoint onthoudt je timing en audio.
4. **Bestand → Exporteren → Video maken** → mp4, klaar voor de site.

## Opnieuw genereren of aanpassen via AI

```bash
cd video/powerpoint
python3 genereer-assets.py   # formule-PNG's (matplotlib) + zie aaf.html voor Aaf-poses
python3 bouw-pptx.py         # bouwt Som29.pptx incl. klik-animaties
```

**Sluit `Som29.pptx` eerst in PowerPoint**, anders overschrijft jouw geopende
versie het resultaat zodra je daar opslaat.

Even nakijken zonder PowerPoint:

```bash
/Applications/LibreOffice.app/Contents/MacOS/soffice --headless \
  --convert-to pdf --outdir preview Som29.pptx
```

De klik-animaties zijn timing-XML die `bouw-pptx.py` injecteert (python-pptx
kan dat niet zelf); de volgorde staat per slide onderaan het script in de
`voeg_animaties_toe(...)`-aanroepen.

Fonts: de bestanden verwijzen naar *DM Serif Display* en *DM Sans* (de
huisstijl). Niet geïnstalleerd? Download ze gratis via Google Fonts, anders
valt PowerPoint terug op een standaardletter.
