"""Zoek op welk frame een woord in een voice-overfragment valt.

Gebruik:  python3 scripts/beats.py public/voiceover-herschrijven/scene-4.json "Stap één" "min achttien"

Leest de alignment die genereer-voiceover-herschrijven.sh naast elk fragment
wegschrijft en print per zoekterm het frame (30 fps) binnen de scène, inclusief
de 15 frames audio-delay. Met --delay=N geef je een andere delay op.
"""
import json
import sys

FPS = 30

args = [a for a in sys.argv[1:] if not a.startswith('--')]
delay = next((int(a.split('=')[1]) for a in sys.argv[1:] if a.startswith('--delay=')), 15)
pad, termen = args[0], args[1:]

al = json.load(open(pad))
tekst = ''.join(al['characters'])
starts = al['character_start_times_seconds']
einde = al['character_end_times_seconds'][-1]

print(f'fragment: {einde:.2f}s = {round(einde * FPS) + delay} frames incl. delay')
vanaf = 0
for term in termen:
    i = tekst.find(term, vanaf)
    if i < 0:
        i = tekst.find(term)
    if i < 0:
        print(f'  {term!r}: niet gevonden')
        continue
    vanaf = i + 1
    print(f'  {term!r}: {starts[i]:.2f}s → frame {round(starts[i] * FPS) + delay}')
