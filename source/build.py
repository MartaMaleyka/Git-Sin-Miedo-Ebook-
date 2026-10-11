#!/usr/bin/env python3
"""Build index.html: the bilingual (Spanish / English) reader for "Git sin miedo".

Inputs, relative to this file:
  es.html        Spanish book fragment (h2 = chapter, h3/h4 = sections)
  en/*.html      English fragments, concatenated in filename order
  template.html  page shell (CSS + JS); __PANES__ and __I18N__ are filled in
Output: ../index.html

Both fragments must have the same structure (same sections, same number of
checkboxes per section), because checklist progress is shared between languages.

Run: python3 source/build.py
"""
import html
import itertools
import json
import pathlib
import re
import unicodedata

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parent / "index.html"
TEMPLATE = (HERE / "template.html").read_text(encoding="utf-8")
WORDS_PER_MINUTE = 220

# Strings the page script needs at runtime.
JS_KEYS = ["progress", "total", "copy", "copied", "copy_fail", "to_dark", "to_light", "doc_title"]

LANGS = {
    "es": {
        "html_lang": "es",
        "title": "Git sin miedo",
        "subtitle": "Control de versiones y trabajo en equipo explicado desde cero",
        "eyebrow": "Guía práctica · Control de versiones",
        "by": "Por Marta Magallón",
        "date": "5 de octubre de 2026",
        "minutes": "~{n} min de lectura",
        "start_btn": "Empezar a leer",
        "index_btn": "Ver el índice",
        "index_eyebrow": "Mapa del libro",
        "index_lead": "Toca un capítulo para ir directo a él.",
        "chapter_word": "Capítulo",
        "intro_title": "Introducción",
        "intro_label": "Inicio",
        "closing_label": "Cierre",
        "closing_first": "Plan de acción de 7 días",
        "start_link": "Inicio",
        "prev": "Anterior",
        "next": "Siguiente",
        "chapter_nav_aria": "Navegación entre capítulos",
        "index_aria": "Índice del libro",
        "contents_aria": "Capítulos",
        "filter_ph": "Filtrar capítulos y temas (tecla /)",
        "open_menu": "Abrir índice",
        "fs_down": "Reducir tamaño del texto",
        "fs_up": "Aumentar tamaño del texto",
        "theme_aria": "Cambiar entre modo claro y oscuro",
        "to_top": "Volver arriba",
        "footer_tail": "Léelo con calma. Casi todo en Git se puede deshacer.",
        "progress": "{n} de {m} listos",
        "total": "Checklists: {n} de {m}",
        "copy": "Copiar",
        "copied": "¡Copiado!",
        "copy_fail": "No se pudo",
        "to_dark": "Oscuro",
        "to_light": "Claro",
        "doc_title": "Git sin miedo · Marta Magallón",
    },
    "en": {
        "html_lang": "en",
        "title": "Git Without Fear",
        "subtitle": "Version control and teamwork, explained from scratch",
        "eyebrow": "Practical guide · Version control",
        "by": "By Marta Magallón",
        "date": "October 5, 2026",
        "minutes": "~{n} min read",
        "start_btn": "Start reading",
        "index_btn": "View contents",
        "index_eyebrow": "Book map",
        "index_lead": "Tap a chapter to jump straight to it.",
        "chapter_word": "Chapter",
        "intro_title": "Introduction",
        "intro_label": "Start",
        "closing_label": "Closing",
        "closing_first": "7-Day Action Plan",
        "start_link": "Start",
        "prev": "Previous",
        "next": "Next",
        "chapter_nav_aria": "Chapter navigation",
        "index_aria": "Book contents",
        "contents_aria": "Chapters",
        "filter_ph": "Filter chapters and topics (press /)",
        "open_menu": "Open contents",
        "fs_down": "Decrease text size",
        "fs_up": "Increase text size",
        "theme_aria": "Switch between light and dark mode",
        "to_top": "Back to top",
        "footer_tail": "Read at your own pace. Almost everything in Git can be undone.",
        "progress": "{n} of {m} done",
        "total": "Checklists: {n} of {m}",
        "copy": "Copy",
        "copied": "Copied!",
        "copy_fail": "Failed",
        "to_dark": "Dark",
        "to_light": "Light",
        "doc_title": "Git Without Fear · Marta Magallón",
    },
}

HERO_GRAPH = """<svg class="hero-graph" viewBox="0 0 640 320" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
<path d="M30 270 H200 C240 270 240 150 290 150 H430"/>
<path d="M200 270 C240 270 240 50 300 50 H600"/>
<path d="M290 150 C330 150 330 220 380 220 H600"/>
</g>
<g fill="currentColor">
<circle cx="30" cy="270" r="9"/><circle cx="200" cy="270" r="9"/><circle cx="290" cy="150" r="9"/>
<circle cx="300" cy="50" r="9"/><circle cx="380" cy="220" r="9"/><circle cx="430" cy="150" r="9"/>
</g></svg>"""


def esc(s):
    return html.escape(s, quote=True)


def plain(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s)).strip()


def slugify(text):
    t = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-") or "section"


def load_fragment(code):
    if code == "es":
        # The original file starts with a title block (h1, subtitle, date) that
        # the cover generates from LANGS, so keep only the chapters.
        text = (HERE / "es.html").read_text(encoding="utf-8")
        return text[text.index("<h2"):]
    files = sorted((HERE / code).glob("*.html"))
    assert files, f"no English fragments in {HERE / code}"
    return "\n".join(f.read_text(encoding="utf-8") for f in files)


def parse_sections(fragment):
    """Split a fragment at its <h2> headings. Headings without an id get a slug."""
    heads = list(re.finditer(r'<h2(?: id="([^"]+)")?>(.*?)</h2>', fragment, re.S))
    assert heads and fragment[: heads[0].start()].strip() == "", "fragment must start with <h2>"
    used = set(re.findall(r'\sid="([^"]+)"', fragment))

    def fresh(base):
        cand, n = base, 2
        while cand in used:
            cand, n = f"{base}-{n}", n + 1
        used.add(cand)
        return cand

    sections = []
    for k, m in enumerate(heads):
        end = heads[k + 1].start() if k + 1 < len(heads) else len(fragment)
        body = fragment[m.end():end]
        body = re.sub(
            r"<h([34])>(.*?)</h\1>",
            lambda h: f'<h{h.group(1)} id="{fresh(slugify(plain(h.group(2))))}">{h.group(2)}</h{h.group(1)}>',
            body,
            flags=re.S,
        )
        sid = m.group(1) or fresh(slugify(plain(m.group(2))))
        sections.append({"id": sid, "title": plain(m.group(2)), "html": body})
    return sections


def tidy(body, idx):
    """Structure shared by every section body: checkboxes, checklists, tables."""
    counter = itertools.count()
    body = re.sub(
        r'<input type="checkbox" disabled>',
        lambda m: f'<input type="checkbox" class="gsm-check" data-ck="s{idx}:{next(counter)}">',
        body,
    )
    body = re.sub(r'<ul><li data-checked=', '<ul class="checklist"><li data-checked=', body)
    body = re.sub(r"(<table>.*?</table>)", r'<div class="table-wrap">\1</div>', body, flags=re.S)
    return body


def prefix_ids(s, p):
    """Give every id and in-page link a language prefix so both panes can coexist."""
    s = re.sub(r'\bid="([^"]+)"', lambda m: f'id="{p}{m.group(1)}"', s)
    return re.sub(r'href="#([^"]+)"', lambda m: f'href="#{p}{m.group(1)}"', s)


def build_pane(code):
    L = LANGS[code]
    p = f"{code}-"
    chapter_re = re.compile(rf"^{L['chapter_word']} (\d+)\.\s*(.*)$")
    sections = parse_sections(load_fragment(code))
    index, chapters = sections[0], sections[1:]
    by_title = {s["title"]: s for s in chapters}

    for i, s in enumerate(sections):
        s["html"] = tidy(s["html"], i)

    def target_of(name):
        if name == L["closing_label"]:
            name = L["closing_first"]
        return by_title[name]["id"]

    # Index cards: one per part of the book, linking into the chapters.
    cards = []
    for name, ul in re.findall(r"<p><strong>(.*?)</strong></p>\s*<ul>(.*?)</ul>", index["html"], re.S):
        name = plain(name)
        topics = [t.strip() for li in re.findall(r"<li><p>(.*?)</p></li>", ul, re.S) for t in li.split(" · ")]
        m = chapter_re.match(name)
        if name == L["closing_label"]:
            num, numcls, short = L["closing_label"], " small", name
        elif name == L["intro_title"]:
            num, numcls, short = L["intro_label"], " small", name
        elif m:
            num, numcls, short = f"{int(m.group(1)):02d}", "", m.group(2)
        else:
            num, numcls, short = "", "", name
        items = "".join(f"<li>{t}</li>" for t in topics)
        cards.append(
            f'<a class="toc-card" href="#{p}{target_of(name)}">'
            f'<span class="toc-num{numcls}">{esc(num)}</span>'
            f'<span class="toc-name">{esc(short)}</span><ul>{items}</ul></a>'
        )

    # Sidebar: index link, then each part with its h3 topics underneath.
    nav = [f'<a class="plain nav-plain" href="#{p}{index["id"]}">{esc(index["title"])}</a>']
    for s in chapters:
        h3s = re.findall(r'<h3 id="([^"]+)">(.*?)</h3>', s["html"], re.S)
        start = f'<li data-text="{esc(s["title"].lower())}"><a href="#{p}{s["id"]}">{esc(L["start_link"])}</a></li>'
        items = [
            f'<li data-text="{esc((s["title"] + " " + plain(t)).lower())}"><a href="#{p}{hid}">{esc(plain(t))}</a></li>'
            for hid, t in h3s
        ]
        nav.append(
            f'<details class="nav-ch"><summary>{esc(s["title"])}</summary>'
            f'<ul>{start}{"".join(items)}</ul></details>'
        )

    # Chapter bodies, each with eyebrow, prev/next links.
    blocks = []
    for i, s in enumerate(sections):
        if i == 0:
            continue
        m = chapter_re.match(s["title"])
        if i == 1:
            eyebrow, title = L["intro_label"], s["title"]
        elif m:
            eyebrow, title = f"{L['chapter_word']} {m.group(1)}", m.group(2)
        else:
            eyebrow, title = L["closing_label"], s["title"]
        bits = []
        prev_s, next_s = sections[i - 1], (sections[i + 1] if i + 1 < len(sections) else None)
        bits.append(f'<a class="prev" href="#{p}{prev_s["id"]}"><span>{esc(L["prev"])}</span>{esc(prev_s["title"])}</a>')
        if next_s:
            bits.append(f'<a class="next" href="#{p}{next_s["id"]}"><span>{esc(L["next"])}</span>{esc(next_s["title"])}</a>')
        nav_html = f'<nav class="chapter-nav" aria-label="{esc(L["chapter_nav_aria"])}">{"".join(bits)}</nav>'
        blocks.append(
            f'<section class="chapter" id="{p}{s["id"]}" data-sec="{i}">'
            f'<header class="chapter-head"><p class="eyebrow">{esc(eyebrow)}</p><h2>{esc(title)}</h2></header>'
            f'{prefix_ids(s["html"], p)}{nav_html}</section>'
        )

    index_block = (
        f'<section class="toc" id="{p}{index["id"]}" data-sec="0">'
        f'<header class="chapter-head"><p class="eyebrow">{esc(L["index_eyebrow"])}</p>'
        f'<h2>{esc(index["title"])}</h2><p class="muted">{esc(L["index_lead"])}</p></header>'
        f'<div class="toc-grid">{"".join(cards)}</div></section>'
    )

    words = len(re.sub(r"<[^>]+>", " ", load_fragment(code)).split())
    minutes = max(1, round(words / WORDS_PER_MINUTE))
    intro_id = chapters[0]["id"]
    hero = (
        '<header class="hero">' + HERO_GRAPH +
        '<div class="hero-inner">'
        f'<p class="eyebrow">{esc(L["eyebrow"])}</p>'
        f'<h1>{esc(L["title"])}</h1>'
        f'<p class="lead">{esc(L["subtitle"])}</p>'
        '<div class="byline">'
        f'<span>{esc(L["by"])}</span><span>{esc(L["date"])}</span>'
        f'<span>{esc(L["minutes"].format(n=minutes))}</span></div>'
        '<div class="hero-cta">'
        f'<a class="btn primary" href="#{p}{intro_id}">{esc(L["start_btn"])}</a>'
        f'<a class="btn ghost" href="#{p}{index["id"]}">{esc(L["index_btn"])}</a>'
        '</div></div></header>'
    )

    lang_btns = "".join(
        f'<button type="button" data-set-lang="{c}" aria-pressed="{str(c == code).lower()}">{c.upper()}</button>'
        for c in ("es", "en")
    )
    return f"""<div class="pane pane-{code}" lang="{L['html_lang']}" data-lang="{code}">
<div class="layout">
<aside class="sidebar" aria-label="{esc(L['index_aria'])}">
  <div class="brand"><div class="logo" aria-hidden="true">G</div><div><b>{esc(L['title'])}</b><small>Marta Magallón</small></div></div>
  <input class="search" type="search" placeholder="{esc(L['filter_ph'])}" aria-label="{esc(L['filter_ph'])}">
  <nav class="nav" aria-label="{esc(L['contents_aria'])}">{"".join(nav)}</nav>
  <div class="side-foot"></div>
</aside>
<div class="scrim"></div>
<div class="main">
<header class="topbar">
  <button class="ibtn menu-btn" type="button" aria-label="{esc(L['open_menu'])}">☰</button>
  <span class="now">{esc(L['title'])}</span>
  <div class="tools">
    <div class="lang-switch" role="group" aria-label="Language / Idioma">{lang_btns}</div>
    <button class="ibtn" data-fs="-1" type="button" aria-label="{esc(L['fs_down'])}">A−</button>
    <button class="ibtn" data-fs="1" type="button" aria-label="{esc(L['fs_up'])}">A+</button>
    <button class="ibtn theme-btn" type="button" aria-label="{esc(L['theme_aria'])}"><span class="ico" aria-hidden="true">☾</span><span class="lbl"></span></button>
  </div>
  <div class="bar"></div>
</header>
{hero}
<div class="content">
{index_block}
{"".join(blocks)}
</div>
<footer class="site">
  <p><b>{esc(L['title'])}</b> · Marta Magallón · 2026</p>
  <p>{esc(L['footer_tail'])}</p>
</footer>
</div>
</div>
<button class="to-top" type="button" aria-label="{esc(L['to_top'])}">↑</button>
</div>"""


def main():
    panes = "\n".join(build_pane(code) for code in ("es", "en"))
    page = (
        TEMPLATE.replace("__TITLE__", esc(LANGS["es"]["doc_title"]))
        .replace("__DESCRIPTION__", esc(LANGS["es"]["subtitle"]))
        .replace("__PANES__", panes)
        .replace("__I18N__", json.dumps({c: {k: LANGS[c][k] for k in JS_KEYS} for c in LANGS}, ensure_ascii=False))
    )
    ids = re.findall(r'\sid="([^"]+)"', page)
    dups = sorted({k for k in ids if ids.count(k) > 1})
    assert not dups, f"duplicate ids: {dups[:5]}"
    OUT.write_text(page, encoding="utf-8")
    print(f"wrote {OUT} ({len(page)} bytes)")


if __name__ == "__main__":
    main()
