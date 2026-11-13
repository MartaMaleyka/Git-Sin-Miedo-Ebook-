/* ================================================================
   Navegación y páginas
   ================================================================ */
const RENDER = { quiz: rQuiz, sort: rSort, order: rOrder, fill: rFill, flips: rFlips, tabs: rTabs, checklist: rChecklist, term: rTerm };
const view = document.getElementById('view');
const modPct = m => { const ids = m.blocks.filter(b => b.id).map(b => b.id); return ids.length ? Math.round(ids.filter(i => P.done[i]).length / ids.length * 100) : 0; };

function renderNav() {
  const nav = document.getElementById('nav'); nav.innerHTML = '';
  const cur = location.hash.slice(1) || 'inicio';
  const link = (href, num, label, pct, cls) => h('a', { href: '#' + href, class: (cur === href ? 'on ' : '') + (cls || '') }, h('span', { class: 'num' }, num), h('span', null, label), pct === null ? h('span') : h('span', { class: 'pct' }, pct + '%'));
  nav.append(link('inicio', '⌂', 'Inicio y mapa del curso', null));
  STAGES.forEach(([name, ids]) => {
    nav.append(h('div', { class: 'navgroup' }, name));
    ids.forEach(id => { const m = MODULES.find(x => x.id === id); const p = modPct(m); nav.append(link(id, p === 100 ? '✓' : m.n, m.title, p, p === 100 ? 'done' : p > 0 ? 'part' : '')); });
  });
  nav.append(h('div', { class: 'navgroup' }, 'Referencia'));
  nav.append(link('glosario', 'Aa', 'Glosario de bolsillo', null), link('comandos', '$_', 'Hoja de comandos', null));
}

const AV = { marcos: 'var(--teal)', katherine: 'var(--accent)', cesar: 'var(--gold)' };
function teamBlock(intro) {
  const box = h('section', { class: 'block' + (hasWho() ? '' : ' act') }, h('div', { class: 'kind' }, h('i', null, '👥'), 'El equipo de sitio-oficina'),
    h('p', { html: intro }));
  const row = h('div', { class: 'team' });
  Object.entries(TEAM).forEach(([k, t]) => row.append(h('button', { class: 'member' + (hasWho() && k === WHO ? ' sel' : ''), type: 'button', onclick: () => {
    WHO = k; try { localStorage.setItem('gsm-curso-who', k); } catch (e) {}
    toast(nm('Ahora eres <b>‹YO›</b>. Tus compañeros: ‹A› y ‹B›.')); route();
  } }, h('span', { class: 'av', style: 'background:' + AV[k] }, t.name[0]), h('b', null, t.name), h('small', null, t.mail), h('small', null, hasWho() && k === WHO ? 'Eres tú ✓' : 'Ser ' + t.name))));
  box.append(row);
  if (hasWho()) box.append(h('p', { class: 'muted', style: 'margin:0', html: 'Eres <b>‹YO›</b>. En las prácticas, <b>‹A›</b> y <b>‹B›</b> publican cambios, revisan tus Merge Requests y a veces tocan lo mismo que tú. Puedes cambiar de persona cuando quieras.' }));
  else box.append(h('p', { class: 'muted', style: 'margin:0' }, 'Si todavía no eliges, practicarás como Marcos.'));
  return box;
}
function renderWhoBox() {
  const el = document.getElementById('whobox'); el.innerHTML = '';
  el.append(h('span', { class: 'av', style: 'width:26px;height:26px;border-radius:50%;display:grid;place-items:center;color:#fff;font:700 .8rem var(--f-display);background:' + AV[WHO] }, me().name[0]),
    h('span', null, 'Eres ', h('b', null, me().name)), h('a', { href: '#equipo', style: 'font-size:.78rem' }, hasWho() ? 'cambiar' : 'elegir'));
}
function renderBlock(b) {
  if (b.story) return h('section', { class: 'block story' }, h('div', { class: 'kind' }, h('i', null, '❝'), 'Historia real'), h('div', { html: b.story }));
  if (b.analogy) return h('section', { class: 'block analogy' }, h('div', { class: 'kind' }, h('i', null, '≈'), 'Para entenderlo fácil'), h('div', { html: b.analogy }));
  if (b.tip) return h('section', { class: 'block tip' }, h('div', { class: 'kind' }, h('i', null, '★'), 'Llévalo a tu computadora'), h('div', { html: b.tip }));
  if (b.text) return h('section', { class: 'block' }, h('div', { html: b.text }));
  if (b.act) { const fn = RENDER[b.act] || W[b.act]; return fn(b, b.id); }
  return h('div');
}

function renderModule(m) {
  const idx = MODULES.indexOf(m), prev = MODULES[idx - 1], next = MODULES[idx + 1];
  const acts = m.blocks.filter(b => b.id);
  const steps = h('div', { class: 'steps' }, acts.map((b, i) => h('span', { class: P.done[b.id] ? 'ok' : '' }, (P.done[b.id] ? '✓ ' : '') + 'Actividad ' + (i + 1))));
  view.append(h('header', { class: 'lhead' },
    h('span', { class: 'eyebrow' }, 'Módulo ' + m.n + ' · ' + (STAGES.find(s => s[1].includes(m.id)) || [''])[0]),
    h('h1', null, m.title), h('p', { class: 'lead' }, m.short + '.'),
    ROADMAP[m.id] ? h('div', { class: 'fb info', style: 'margin:0', html: '📁 <b>Tu proyecto <code>sitio-oficina</code> en este módulo:</b> ' + ROADMAP[m.id] }) : null,
    h('div', { class: 'meta' }, h('span', { class: 'tag goal' }, '🎯 ' + m.goal), h('span', { class: 'tag' }, '⏱ ' + m.time), h('span', { class: 'tag' }, acts.length + ' actividades')), steps));
  if (m.id === 'm2') view.append(teamBlock('Antes de configurar Git, elige quién eres en el equipo. Tu nombre y tu correo serán los de esa persona, y los otros dos serán tus compañeros en todo el proyecto.'));
  m.blocks.forEach(b => view.append(renderBlock(b)));
  view.append(h('nav', { class: 'navbtns', 'aria-label': 'Navegación entre módulos' },
    prev ? h('a', { class: 'btn ghost', href: '#' + prev.id, style: 'text-decoration:none' }, '← ' + prev.title) : h('a', { class: 'btn ghost', href: '#inicio', style: 'text-decoration:none' }, '← Inicio'),
    next ? h('a', { class: 'btn', href: '#' + next.id, style: 'text-decoration:none' }, 'Siguiente: ' + next.title + ' →') : h('a', { class: 'btn', href: '#glosario', style: 'text-decoration:none' }, 'Ir al glosario →')));
}

function renderHome() {
  const first = MODULES.find(m => modPct(m) < 100) || MODULES[0];
  const started = ALL_ACTS.some(a => P.done[a]);
  view.append(h('header', { class: 'hero' },
    h('span', { class: 'eyebrow' }, 'Curso interactivo desde cero · por Marta Magallón'),
    h('h1', null, 'Git sin miedo'),
    h('p', { class: 'lead' }, 'Control de versiones y trabajo en equipo explicado desde cero, practicando. No necesitas saber programar ni instalar nada para empezar: todo pasa en una terminal de práctica dentro de esta página.'),
    h('div', { class: 'row' }, h('a', { class: 'btn', href: '#' + first.id, style: 'text-decoration:none' }, started ? 'Continuar: ' + first.title + ' →' : 'Empezar el curso →'), h('a', { class: 'btn ghost', href: '#comandos', style: 'text-decoration:none' }, 'Ver la hoja de comandos'))));
  view.append(h('section', { class: 'block' }, h('h2', null, 'Cómo funciona cada módulo'), h('div', { class: 'grid2' },
    h('div', { class: 'mini' }, h('b', null, '❝ Una historia real'), h('p', null, 'Cada tema empieza con el problema, tal como pasa en un equipo.')),
    h('div', { class: 'mini' }, h('b', null, '≈ Una comparación sencilla'), h('p', null, 'Cuadernos, cajas, borradores y semáforos para que la idea se quede.')),
    h('div', { class: 'mini' }, h('b', null, '>_ Práctica en la terminal'), h('p', null, 'Misiones paso a paso con un mapa que dibuja lo que pasa, en vivo.')),
    h('div', { class: 'mini' }, h('b', null, '✓ Retos y checklist'), h('p', null, 'Quizzes, juegos de ordenar y clasificar, y un checklist para comprobar lo aprendido.'))),
    h('p', { class: 'muted', style: 'margin:0' }, 'Tu avance se guarda en este navegador. Puedes repetir cualquier actividad cuando quieras. No necesitas conocimientos previos: todo se explica aquí, paso a paso. Vas a equivocarte, y está bien. Casi todo en Git se puede deshacer.')));
  view.append(Object.assign(teamBlock('<code>sitio-oficina</code> lo llevan tres personas: <b>Marcos</b>, <b>Katherine</b> y <b>César</b>. ¿Quién eres tú? Los otros dos serán tus compañeros durante todo el curso.'), { id: 'equipo' }));
  view.append(h('section', { class: 'block analogy' }, h('div', { class: 'kind' }, h('i', null, '📁'), 'Un solo proyecto, de principio a fin'),
    h('p', { html: 'Durante todo el curso trabajas en <b>el mismo proyecto</b>: <code>sitio-oficina</code>, la página web de la oficina que mantienes con ‹A› y ‹B›. Lo descargas en el módulo 2 y cada módulo le agrega algo, como en un equipo real. Cuando empieces una práctica, el proyecto estará tal como quedó en la anterior, más lo que tu equipo haya publicado mientras tanto.' }),
    h('ol', { class: 'olist' }, MODULES.filter(m => ['m2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm12', 'm13', 'm14'].includes(m.id)).map(m => h('li', null, h('span', { class: 'n' }, m.n), h('span', { html: '<a href="#' + m.id + '">' + esc(m.title) + '</a>: ' + ROADMAP[m.id] }))))));
  STAGES.forEach(([name, ids]) => {
    view.append(h('div', { class: 'stage-label' }, name));
    view.append(h('div', { class: 'path' }, ids.map(id => { const m = MODULES.find(x => x.id === id); const p = modPct(m); return h('a', { class: 'pcard' + (p === 100 ? ' done' : ''), href: '#' + id }, h('div', { class: 'top' }, h('span', { class: 'n' }, 'Módulo ' + m.n), h('span', { class: 'pct', style: 'font:500 .72rem var(--f-mono);color:' + (p === 100 ? 'var(--teal)' : 'var(--muted)') }, p === 100 ? 'Completado ✓' : p + '%')), h('h3', null, m.title), h('p', null, m.short + ' · ' + m.time), h('div', { class: 'bar' }, h('i', { style: 'width:' + p + '%' }))); })));
  });
}

function renderGlossary() {
  view.append(h('header', { class: 'lhead' }, h('span', { class: 'eyebrow' }, 'Referencia'), h('h1', null, 'Glosario de bolsillo'), h('p', { class: 'lead' }, 'Todas las palabras técnicas del curso, explicadas en una línea. El número indica el módulo donde se explica.')));
  const inp = h('input', { class: 'fillin', id: 'gloss-q', placeholder: 'Busca una palabra: rama, stash, token…', style: 'font-family:var(--f-body)' });
  const list = h('div', { class: 'gloss' });
  const draw = () => { const q = inp.value.trim().toLowerCase(); list.innerHTML = ''; GLOSSARY.filter(([t, d]) => !q || (t + ' ' + d).toLowerCase().includes(q)).forEach(([t, d, c]) => list.append(h('div', { class: 'gi' }, h('b', null, t), h('span', null, d + ' ', h('a', { href: '#m' + c, class: 'muted', style: 'font-size:.8rem' }, 'módulo ' + c))))); if (!list.children.length) list.append(h('p', { class: 'muted' }, 'No hay resultados para esa palabra.')); };
  inp.addEventListener('input', draw); draw();
  view.append(h('section', { class: 'block' }, inp, list));
}
function renderCheats() {
  view.append(h('header', { class: 'lhead' }, h('span', { class: 'eyebrow' }, 'Referencia'), h('h1', null, 'Hoja resumen de comandos'), h('p', { class: 'lead' }, 'Nadie se los aprende de memoria al inicio, y está bien. Tenla a mano.')));
  CHEATSHEET.forEach(([t, c]) => {
    const btn = h('button', { class: 'chipbtn', type: 'button' }, 'Copiar');
    btn.onclick = () => { const done = () => { btn.textContent = 'Copiado ✓'; setTimeout(() => btn.textContent = 'Copiar', 1500); }; try { navigator.clipboard.writeText(c).then(done, () => { btn.textContent = 'Selecciónalo a mano'; }); } catch (e) { btn.textContent = 'Selecciónalo a mano'; } };
    view.append(h('section', { class: 'block' + (t.startsWith('Nunca') ? ' story' : '') }, h('div', { class: 'row', style: 'justify-content:space-between' }, h('h2', null, t), btn), h('pre', { class: 'cmd' }, c)));
  });
}

function route() {
  let id = location.hash.slice(1) || 'inicio'; const goTeam = id === 'equipo'; if (goTeam) id = 'inicio';
  view.innerHTML = '';
  document.body.classList.remove('menu'); const sc = document.querySelector('.scrim'); if (sc) sc.remove();
  const m = MODULES.find(x => x.id === id);
  if (m) renderModule(m); else if (id === 'glosario') renderGlossary(); else if (id === 'comandos') renderCheats(); else renderHome();
  document.getElementById('topTitle').textContent = m ? 'Módulo ' + m.n + ' · ' + m.title : id === 'glosario' ? 'Glosario' : id === 'comandos' ? 'Comandos' : 'Git sin miedo';
  renderNav(); renderWhoBox();
  if (goTeam) { const t = document.getElementById('equipo'); if (t) t.scrollIntoView(); } else window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);

document.getElementById('menuBtn').addEventListener('click', () => { document.body.classList.add('menu'); const s = h('div', { class: 'scrim', onclick: () => { document.body.classList.remove('menu'); s.remove(); } }); document.body.append(s); });
document.getElementById('themeBtn').addEventListener('click', () => {
  const root = document.documentElement; const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark'; try { localStorage.setItem('gsm-curso-theme', root.dataset.theme); } catch (e) {}
});
try { const t = localStorage.getItem('gsm-curso-theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
const resetBtn = document.getElementById('resetBtn');
resetBtn.addEventListener('click', () => {
  if (resetBtn.dataset.confirm) { P = { done: {}, checks: {}, xp: 0, seen: {} }; save(); delete resetBtn.dataset.confirm; resetBtn.textContent = 'Reiniciar progreso'; refreshProgress(); route(); toast('Progreso reiniciado'); return; }
  resetBtn.dataset.confirm = '1'; resetBtn.textContent = '¿Seguro? Toca otra vez'; setTimeout(() => { delete resetBtn.dataset.confirm; resetBtn.textContent = 'Reiniciar progreso'; }, 3500);
});
/* Los textos llevan marcas ‹YO› ‹A› ‹B›: se cambian por los nombres del equipo al mostrarse. */
function fixNames(root) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) if (n.nodeValue.indexOf('‹') >= 0) n.nodeValue = nm(n.nodeValue);
}
new MutationObserver(ms => ms.forEach(m => { if (m.type === 'characterData') { if (m.target.nodeValue.indexOf('‹') >= 0) m.target.nodeValue = nm(m.target.nodeValue); } else m.addedNodes.forEach(x => { if (x.nodeType === 3) { if (x.nodeValue.indexOf('‹') >= 0) x.nodeValue = nm(x.nodeValue); } else if (x.nodeType === 1) fixNames(x); }); }))
  .observe(document.body, { childList: true, subtree: true, characterData: true });
refreshProgress(); route();
