#!/usr/bin/env python3
"""Build curso/index.html: the interactive course based on "Git sin miedo".

Inputs (src/, concatenated in filename order):
  1-head.html   page shell: <head>, CSS and layout markup
  2-sim.js      the in-browser Git simulator
  3-ui.js       progress store, activity renderers and the terminal lab
  4-widgets.js  chapter-specific interactive widgets
  5-content.js  course content (modules, glossary, cheat sheet)
  6-app.js      navigation and pages
Output: index.html

Run: python3 curso/build.py
"""
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
src = sorted((HERE / "src").iterdir())
head = next(p for p in src if p.suffix == ".html").read_text(encoding="utf-8")
scripts = "\n".join(p.read_text(encoding="utf-8") for p in src if p.suffix == ".js")
out = head + "<script>\n" + scripts + "\n</script>\n</body>\n</html>\n"
(HERE / "index.html").write_text(out, encoding="utf-8")
print(f"wrote {HERE / 'index.html'} ({len(out):,} bytes)")
