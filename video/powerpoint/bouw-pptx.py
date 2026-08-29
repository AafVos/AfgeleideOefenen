"""Bouwt Som29.pptx: de uitlegvideo als PowerPoint met verschijn-op-klik-builds.

- Formules = PNG's uit genereer-assets.py (transparant)
- Cirkels, strepen, pijlen, chips = echte PowerPoint-vormen (zelf te bewerken)
- Animaties = timing-XML (python-pptx kan dat niet, dus injecteren we het)

Gebruik: python3 bouw-pptx.py  (vanuit video/powerpoint/)
"""
from PIL import Image
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

matplotlib.rcParams["mathtext.fontset"] = "dejavuserif"

from pptx import Presentation
from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE
from pptx.enum.text import PP_ALIGN
from pptx.oxml import parse_xml
from pptx.util import Emu, Inches, Pt
from pptx.dml.color import RGBColor

GROEN = RGBColor.from_string("2D6A4F")
GROEN_LICHT = RGBColor.from_string("E8F5EE")
ROOD = RGBColor.from_string("C94F4A")
ROOD_LICHT = RGBColor.from_string("FBEEED")
TEKST = RGBColor.from_string("1A1A18")
GRIJS = RGBColor.from_string("7A7870")
RAND = RGBColor.from_string("E4E2D9")

SERIF = "DM Serif Display"
SANS = "DM Sans"

BREED = Inches(13.333)
HOOG = Inches(7.5)


def px_breedte(latex: str, pt: float) -> float:
    """Pixelbreedte van een mathtext-string (voor substring-posities)."""
    fig = plt.figure()
    t = fig.text(0, 0, latex, fontsize=pt)
    fig.canvas.draw()
    w = t.get_window_extent().width
    plt.close(fig)
    return w


def afbeelding(slide, pad: str, midden_x, top, breedte):
    """Plaats PNG met opgegeven breedte, horizontaal gecentreerd op midden_x."""
    im = Image.open(pad)
    ratio = im.height / im.width
    hoogte = Emu(int(breedte * ratio))
    return slide.shapes.add_picture(pad, Emu(int(midden_x - breedte / 2)), top, width=Emu(int(breedte))), hoogte


def tekstvak(slide, x, y, w, h, runs, pt, align=PP_ALIGN.CENTER, font=SANS, vet=False):
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.alignment = align
    for tekst, kleur in runs:
        r = p.add_run()
        r.text = tekst
        r.font.size = Pt(pt)
        r.font.name = font
        r.font.bold = vet
        r.font.color.rgb = kleur
    return tb


def chip(slide, x, y, w, h, tekst, kleur, vulling, pt=14):
    vorm = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, w, h)
    vorm.adjustments[0] = 0.5
    vorm.fill.solid()
    vorm.fill.fore_color.rgb = vulling
    vorm.line.fill.background()
    vorm.shadow.inherit = False
    tf = vorm.text_frame
    tf.margin_left = tf.margin_right = Pt(6)
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = tekst
    r.font.size = Pt(pt)
    r.font.name = SANS
    r.font.bold = True
    r.font.color.rgb = kleur
    return vorm


def kaart(slide, x, y, w, h, vulling, randkleur=None):
    vorm = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, w, h)
    vorm.adjustments[0] = 0.12
    vorm.fill.solid()
    vorm.fill.fore_color.rgb = vulling
    vorm.shadow.inherit = False
    if randkleur is None:
        vorm.line.fill.background()
    else:
        vorm.line.color.rgb = randkleur
        vorm.line.width = Pt(1.75)
    return vorm


def ovaal(slide, x, y, w, h, kleur):
    vorm = slide.shapes.add_shape(MSO_SHAPE.OVAL, x, y, w, h)
    vorm.fill.background()
    vorm.line.color.rgb = kleur
    vorm.line.width = Pt(2.5)
    vorm.shadow.inherit = False
    return vorm


def streep(slide, x1, y1, x2, y2, kleur):
    lijn = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, x1, y1, x2, y2)
    lijn.line.color.rgb = kleur
    lijn.line.width = Pt(2.5)
    lijn.shadow.inherit = False
    return lijn


def pijl_omlaag(slide, midden_x, y):
    return tekstvak(slide, Emu(int(midden_x - Inches(0.3))), y, Inches(0.6), Inches(0.4), [("↓", GRIJS)], 22)


def logo(slide):
    tekstvak(
        slide,
        BREED - Inches(3.9),
        Inches(0.22),
        Inches(3.6),
        Inches(0.4),
        [("afgeleide", TEKST), ("oefenen", GROEN), (".nl", TEKST)],
        18,
        align=PP_ALIGN.RIGHT,
        font=SERIF,
    )


def aaf(slide, pose):
    hoogte = Inches(2.3)
    breedte = Emu(int(hoogte * 420 / 540))
    slide.shapes.add_picture(f"assets/aaf-{pose}.png", BREED - breedte - Inches(0.35), HOOG - hoogte - Inches(0.25), height=hoogte)


# ── Animatie: timing-XML met één (of meer) effecten per klik ──────────────
NS = 'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"'


def effect_xml(ctn_id: int, spid: int, node_type: str, richting: str) -> str:
    klasse = "entr" if richting == "in" else "exit"
    waarde = "visible" if richting == "in" else "hidden"
    return f"""<p:par {NS}><p:cTn id="{ctn_id}" presetID="1" presetClass="{klasse}" presetSubtype="0" fill="hold" grpId="0" nodeType="{node_type}"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:set><p:cBhvr><p:cTn id="{ctn_id + 1}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="{waarde}"/></p:to></p:set></p:childTnLst></p:cTn></p:par>"""


def voeg_animaties_toe(slide, klikken):
    """klikken: lijst van kliks; elke klik is een lijst van (shape, 'in'|'out')."""
    ctn = 3
    klik_delen = []
    for klik in klikken:
        effecten = []
        for i, (vorm, richting) in enumerate(klik):
            node_type = "clickEffect" if i == 0 else "withEffect"
            effecten.append(effect_xml(ctn, vorm.shape_id, node_type, richting))
            ctn += 2
        binnen = f"""<p:par {NS}><p:cTn id="{ctn}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>{''.join(effecten)}</p:childTnLst></p:cTn></p:par>"""
        ctn += 1
        klik_delen.append(
            f"""<p:par {NS}><p:cTn id="{ctn}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst>{binnen}</p:childTnLst></p:cTn></p:par>"""
        )
        ctn += 1

    blds = "".join(
        f'<p:bldP spid="{vorm.shape_id}" grpId="0"/>' for klik in klikken for (vorm, _r) in klik
    )
    xml = f"""<p:timing {NS}><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst><p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>{''.join(klik_delen)}</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq></p:childTnLst></p:cTn></p:par></p:tnLst><p:bldLst>{blds}</p:bldLst></p:timing>"""
    slide._element.append(parse_xml(xml))


# ── Presentatie ────────────────────────────────────────────────────────────
prs = Presentation()
prs.slide_width = BREED
prs.slide_height = HOOG
blanco = prs.slide_layouts[6]

MIDden = Emu(int(Inches(6.0)))  # inhoud iets links van het midden (rechts staat Aaf)

# Substring-posities binnen de opgave (voor marker, cirkels en strepen).
# Let op: meet alleen prefixen die op een glyf eindigen (eindspaties vervallen);
# de startpositie van de "1" leiden we af via de losse breedte van "1".
OPGAVE = r"$m(q) = 1 - (3q^2 - 2)^2$"
PT_OPGAVE = 44
vol = px_breedte(OPGAVE, PT_OPGAVE)
r_q0 = px_breedte(r"$m($", PT_OPGAVE) / vol
r_q1 = px_breedte(r"$m(q$", PT_OPGAVE) / vol
r_e1 = px_breedte(r"$m(q) = 1$", PT_OPGAVE) / vol
r_e0 = r_e1 - 0.92 * px_breedte(r"$1$", PT_OPGAVE) / vol
r_r0 = r_e1 + 0.015

OPGAVE_PROD = r"$m(q) = 1 - (3q^2-2) \cdot (3q^2-2)$"
PT_PROD = 40
vol_p = px_breedte(OPGAVE_PROD, PT_PROD)
p_e1 = px_breedte(r"$m(q) = 1$", PT_PROD) / vol_p
p_e0 = p_e1 - 0.92 * px_breedte(r"$1$", PT_PROD) / vol_p


def sub_x(img_x, img_w, ratio):
    return Emu(int(img_x + ratio * img_w))


# ── Slide 1 · #29 ──────────────────────────────────────────────────────────
s1 = prs.slides.add_slide(blanco)
logo(s1)
aaf(s1, "wave")
titel29 = tekstvak(s1, Inches(3.0), Inches(2.0), Inches(6.0), Inches(1.1), [("#29", GROEN)], 60, font=SERIF, vet=True)
opg1, h1 = afbeelding(s1, "assets/opgave.png", MIDden, Inches(3.5), Inches(5.4))
voeg_animaties_toe(s1, [[(titel29, "in")], [(opg1, "in")]])

# ── Slide 2 · Herkennen en herschrijven ───────────────────────────────────
s2 = prs.slides.add_slide(blanco)
logo(s2)
aaf(s2, "point")

eq_w = Inches(5.2)
eq_x = Emu(int(MIDden - eq_w / 2))
eq_y = Inches(0.85)

# marker achter de q (eerst toevoegen = achter de formule)
mark_x = sub_x(eq_x, eq_w, r_q0)
mark_w = Emu(int((r_q1 - r_q0) * eq_w + Inches(0.06)))
marker = kaart(s2, Emu(int(mark_x - Inches(0.03))), Emu(int(eq_y - Inches(0.04))), mark_w, Inches(0.62), ROOD_LICHT)

opg2, h2 = afbeelding(s2, "assets/opgave.png", MIDden, eq_y, eq_w)

# cirkels om de twee delen
c1_x = sub_x(eq_x, eq_w, r_e0)
c1_w = Emu(int((r_e1 - r_e0) * eq_w + Inches(0.28)))
cirkel1 = ovaal(s2, Emu(int(c1_x - Inches(0.06))), Emu(int(eq_y - Inches(0.16))), c1_w, Emu(int(h2 + Inches(0.32))), GROEN)
c2_x = sub_x(eq_x, eq_w, r_r0)
c2_w = Emu(int((1.0 - r_r0) * eq_w + Inches(0.3)))
cirkel2 = ovaal(s2, Emu(int(c2_x - Inches(0.1))), Emu(int(eq_y - Inches(0.16))), c2_w, Emu(int(h2 + Inches(0.32))), ROOD)

pijl1 = pijl_omlaag(s2, MIDden, Inches(1.95))

opg3, h3 = afbeelding(s2, "assets/opgave.png", MIDden, Inches(2.55), eq_w)
s1_x = sub_x(eq_x, eq_w, r_e0)
s1_w = (r_e1 - r_e0) * eq_w
streep1 = streep(
    s2,
    Emu(int(s1_x - Inches(0.06))),
    Emu(int(Inches(2.55) + h3 + Inches(0.04))),
    Emu(int(s1_x + s1_w + Inches(0.06))),
    Emu(int(Inches(2.55) - Inches(0.04))),
    ROOD,
)

pijl2 = pijl_omlaag(s2, MIDden, Inches(3.6))

prod_w = Inches(6.4)
prod_x = Emu(int(MIDden - prod_w / 2))
prod_y = Inches(4.2)
opg4, h4 = afbeelding(s2, "assets/opgave-product.png", MIDden, prod_y, prod_w)
s2_x = sub_x(prod_x, prod_w, p_e0)
s2_w = (p_e1 - p_e0) * prod_w
streep2 = streep(
    s2,
    Emu(int(s2_x - Inches(0.06))),
    Emu(int(prod_y + h4 + Inches(0.04))),
    Emu(int(s2_x + s2_w + Inches(0.06))),
    Emu(int(prod_y - Inches(0.04))),
    ROOD,
)

chip_prod = chip(s2, Emu(int(MIDden - Inches(1.6))), Inches(5.5), Inches(3.2), Inches(0.55), "Productregel!", ROOD, ROOD_LICHT, 18)

voeg_animaties_toe(
    s2,
    [
        [(opg2, "in")],
        [(marker, "in")],
        [(marker, "out")],
        [(cirkel1, "in")],
        [(cirkel2, "in")],
        [(pijl1, "in")],
        [(opg3, "in"), (streep1, "in")],
        [(pijl2, "in")],
        [(opg4, "in"), (streep2, "in")],
        [(chip_prod, "in")],
    ],
)

# ── Slide 3 · De productregel + stappenplan ────────────────────────────────
s3 = prs.slides.add_slide(blanco)
logo(s3)
aaf(s3, "point")

titel3 = tekstvak(s3, Inches(2.5), Inches(0.25), Inches(7.0), Inches(0.7), [("De ", TEKST), ("productregel", ROOD)], 32, font=SERIF, vet=True)

regelkaart = kaart(s3, Inches(1.5), Inches(1.05), Inches(9.0), Inches(0.95), GROEN_LICHT)
regel_img, hr = afbeelding(s3, "assets/regel-product.png", MIDden, Inches(1.28), Inches(8.2))

stap1 = chip(s3, Inches(1.5), Inches(2.25), Inches(2.8), Inches(0.5), "Stap 1 · kies g en h", GROEN, GROEN_LICHT)
stap2 = chip(s3, Inches(4.6), Inches(2.25), Inches(2.8), Inches(0.5), "Stap 2 · bepaal de afgeleiden", GROEN, GROEN_LICHT, 13)
stap3 = chip(s3, Inches(7.7), Inches(2.25), Inches(2.8), Inches(0.5), "Stap 3 · vul de formule in", GROEN, GROEN_LICHT, 13)

mq_w = Inches(5.2)
mq_x = Emu(int(MIDden - mq_w / 2))
mq_y = Inches(2.95)
mq_img, hmq = afbeelding(s3, "assets/opgave-product.png", MIDden, mq_y, mq_w)
s3_x = sub_x(mq_x, mq_w, p_e0)
s3_w = (p_e1 - p_e0) * mq_w
streep3 = streep(
    s3,
    Emu(int(s3_x - Inches(0.05))),
    Emu(int(mq_y + hmq + Inches(0.03))),
    Emu(int(s3_x + s3_w + Inches(0.05))),
    Emu(int(mq_y - Inches(0.03))),
    ROOD,
)
mq_caption = tekstvak(s3, Inches(2.5), Inches(3.5), Inches(7.0), Inches(0.32), [("zelfde regel — bij ons is de variabele q in plaats van x", GRIJS)], 13)

kaart_g = kaart(s3, Inches(2.0), Inches(3.95), Inches(3.4), Inches(1.62), RGBColor.from_string("FFFFFF"), GROEN)
g_img, _hg = afbeelding(s3, "assets/g-def.png", Emu(int(Inches(3.7))), Inches(4.12), Inches(2.3))
kaart_h = kaart(s3, Inches(6.2), Inches(3.95), Inches(3.4), Inches(1.62), RGBColor.from_string("FFFFFF"), GROEN)
h_img, _hh = afbeelding(s3, "assets/h-def.png", Emu(int(Inches(7.9))), Inches(4.12), Inches(2.3))

pijl_g = pijl_omlaag(s3, Emu(int(Inches(3.7))), Inches(4.55))
ga_img, _ = afbeelding(s3, "assets/g-afgeleide.png", Emu(int(Inches(3.7))), Inches(5.05), Inches(1.6))
pijl_h = pijl_omlaag(s3, Emu(int(Inches(7.9))), Inches(4.55))
ha_img, _ = afbeelding(s3, "assets/h-afgeleide.png", Emu(int(Inches(7.9))), Inches(5.05), Inches(1.6))

abstract_img, _ = afbeelding(s3, "assets/invullen-abstract.png", MIDden, Inches(5.82), Inches(5.4))
concreet_img, _ = afbeelding(s3, "assets/invullen-concreet.png", MIDden, Inches(6.34), Inches(6.0))
eind_img, _ = afbeelding(s3, "assets/eindantwoord.png", MIDden, Inches(6.9), Inches(4.0))

voeg_animaties_toe(
    s3,
    [
        [(titel3, "in")],
        [(regelkaart, "in"), (regel_img, "in")],
        [(stap1, "in"), (stap2, "in"), (stap3, "in")],
        [(mq_img, "in"), (streep3, "in"), (mq_caption, "in")],
        [(kaart_g, "in"), (g_img, "in")],
        [(kaart_h, "in"), (h_img, "in")],
        [(pijl_g, "in"), (ga_img, "in"), (pijl_h, "in"), (ha_img, "in")],
        [(abstract_img, "in")],
        [(concreet_img, "in")],
        [(eind_img, "in")],
    ],
)

prs.save("Som29.pptx")
print("Som29.pptx opgeslagen")
