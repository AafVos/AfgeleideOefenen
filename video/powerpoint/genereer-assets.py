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
FORMULES = {
    "opgave": (r"$m(q) = 1 - (3q^2 - 2)^2$", TEKST, 44),
    "opgave-product": (r"$m(q) = 1 - (3q^2-2) \cdot (3q^2-2)$", TEKST, 40),
    "regel-product": (
        r"$f(x) = g(x) \cdot h(x) \;\;\Rightarrow\;\; f'(x) = g'(x) \cdot h(x) + g(x) \cdot h'(x)$",
        TEKST,
        30,
    ),
    "g-def": (r"$g(q) = 3q^2 - 2$", TEKST, 32),
    "h-def": (r"$h(q) = 3q^2 - 2$", TEKST, 32),
    "g-afgeleide": (r"$g'(q) = 6q$", GROEN, 32),
    "h-afgeleide": (r"$h'(q) = 6q$", GROEN, 32),
    "invullen-abstract": (
        r"$m'(q) = 0 - \left(\, g'(q) \cdot h(q) + g(q) \cdot h'(q) \,\right)$",
        TEKST,
        32,
    ),
    "invullen-concreet": (
        r"$m'(q) = 0 - \left(\, 6q \cdot (3q^2-2) + (3q^2-2) \cdot 6q \,\right)$",
        TEKST,
        32,
    ),
    "eindantwoord": (r"$m'(q) = -12q\,(3q^2 - 2)$", TEKST, 44),
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
