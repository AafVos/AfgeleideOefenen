"""Genereert de formule-afbeeldingen (PNG, transparant) voor de PowerPoint-versie.

Gebruik: python3 genereer-assets.py  (vanuit video/powerpoint/)
"""
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

matplotlib.rcParams["mathtext.fontset"] = "dejavuserif"

TEKST = "#1a1a18"
GROEN = "#2d6a4f"
GRIJS = "#7a7870"

# naam -> (latex, kleur, fontgrootte in pt)
# Volgt de vijf scènes van de video: intro, analyse, somregel, productregel, samen.
FORMULES = {
    # scène 1 + 2 + 5
    "opgave": (r"$m(q) = 1 - (3q^2 - 2)^2$", TEKST, 44),
    # de regelkaarten
    "regel-som": (
        r"$f(x) = g(x) + h(x) \;\;\Rightarrow\;\; f'(x) = g'(x) + h'(x)$",
        TEKST,
        30,
    ),
    "regel-product": (
        r"$f(x) = g(x) \cdot h(x) \;\;\Rightarrow\;\; f'(x) = g'(x) \cdot h(x) + g(x) \cdot h'(x)$",
        TEKST,
        30,
    ),
    # scène 3 · de somregel
    "som-g-def": (r"$g(q) = 1$", TEKST, 32),
    "som-h-def": (r"$h(q) = (3q^2 - 2)^2$", TEKST, 32),
    "som-g-afgeleide": (r"$g'(q) = 0$", GROEN, 32),
    "som-h-kwadraat": (r"$h(q) = (3q^2 - 2)^2$", TEKST, 32),
    "som-h-product": (r"$h(q) = (3q^2 - 2) \cdot (3q^2 - 2)$", TEKST, 32),
    # scène 4 · de productregel
    "prod-f-def": (r"$f(q) = (3q^2 - 2) \cdot (3q^2 - 2)$", TEKST, 36),
    "g-def": (r"$g(q) = 3q^2 - 2$", TEKST, 32),
    "h-def": (r"$h(q) = 3q^2 - 2$", TEKST, 32),
    "g-afgeleide": (r"$g'(q) = 6q$", GROEN, 32),
    "h-afgeleide": (r"$h'(q) = 6q$", GROEN, 32),
    "stap3-symbolisch": (r"$f'(q) = g'(q) \cdot h(q) + g(q) \cdot h'(q)$", TEKST, 32),
    "stap3-ingevuld": (r"$f'(q) = 6q \cdot (3q^2-2) + (3q^2-2) \cdot 6q$", TEKST, 32),
    "stap3-samen": (r"$f'(q) = 2 \cdot 6q\,(3q^2 - 2)$", TEKST, 32),
    "prod-antwoord": (r"$f'(q) = 12q\,(3q^2 - 2)$", GROEN, 38),
    # scène 5 · voeg alles samen
    "samen-h-afgeleide": (r"$h'(q) = 12q\,(3q^2 - 2)$", TEKST, 34),
    "samen-symbolisch": (r"$m'(q) = g'(q) - h'(q)$", TEKST, 36),
    "samen-ingevuld": (r"$m'(q) = 0 - 12q\,(3q^2 - 2)$", TEKST, 36),
    "eindantwoord": (r"$m'(q) = -12q\,(3q^2 - 2)$", GROEN, 44),
}


def render(naam: str, latex: str, kleur: str, pt: float) -> None:
    fig = plt.figure()
    t = fig.text(0, 0, latex, fontsize=pt, color=kleur)
    fig.canvas.draw()
    bbox = t.get_window_extent()
    fig.set_size_inches(bbox.width / fig.dpi + 0.05, bbox.height / fig.dpi + 0.05)
    fig.savefig(f"assets/{naam}.png", dpi=300, transparent=True, bbox_inches="tight", pad_inches=0.02)
    plt.close(fig)
    print(f"assets/{naam}.png")


if __name__ == "__main__":
    import os

    os.makedirs("assets", exist_ok=True)
    for naam, (latex, kleur, pt) in FORMULES.items():
        render(naam, latex, kleur, pt)
