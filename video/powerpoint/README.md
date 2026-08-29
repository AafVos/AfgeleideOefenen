# PowerPoint-versie van de uitlegvideo's (proof of concept)

`Som29.pptx` is de som 29-video als PowerPoint: drie slides waarin elk
element met een **klik verschijnt** (zelfde beats als de Remotion-video).
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

De klik-animaties zijn timing-XML die `bouw-pptx.py` injecteert (python-pptx
kan dat niet zelf); de volgorde staat per slide onderaan het script in de
`voeg_animaties_toe(...)`-aanroepen.

Fonts: de bestanden verwijzen naar *DM Serif Display* en *DM Sans* (de
huisstijl). Niet geïnstalleerd? Download ze gratis via Google Fonts, anders
valt PowerPoint terug op een standaardletter.
