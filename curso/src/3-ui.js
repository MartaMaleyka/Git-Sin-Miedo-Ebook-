/* ================================================================
   Interfaz: progreso, renderizadores de actividades y widgets.
   ================================================================ */
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) { if (c === null || c === undefined || c === false) continue; el.append(c.nodeType ? c : document.createTextNode(c)); }
  return el;
}
const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/* ---------- progreso ---------- */
const STORE = 'gsm-curso-v1';
let P = { done: {}, checks: {}, xp: 0, seen: {} };
try { const s = JSON.parse(localStorage.getItem(STORE)); if (s && s.done) P = Object.assign(P, s); } catch (e) {}
function save() { try { localStorage.setItem(STORE, JSON.stringify(P)); } catch (e) {} }
function toast(msg) { const t = document.getElementById('toast'); t.innerHTML = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600); }
const LEVELS = [[0, 'Curiosa o curioso'], [120, 'Primeros commits'], [320, 'Domadora o domador de ramas'], [600, 'Resuelve conflictos'], [900, 'Botiquín en mano'], [1250, 'Trabaja en equipo'], [1600, 'Detective del historial'], [2000, 'Git sin miedo']];
function complete(id, xp, label) {
  if (P.done[id]) return false;
  P.done[id] = true; P.xp += xp; save();
  toast('+' + xp + ' XP · ' + (label || '¡Actividad completada!'));
  refreshProgress();
  return true;
}
function refreshProgress() {
  const lv = LEVELS.filter(l => P.xp >= l[0]); const next = LEVELS[lv.length];
  document.getElementById('xp').textContent = P.xp + ' XP';
  document.getElementById('topXp').textContent = P.xp + ' XP';
  document.getElementById('level').textContent = 'Nivel ' + lv.length + ' · ' + lv[lv.length - 1][1] + (next ? ' · faltan ' + (next[0] - P.xp) + ' XP' : '');
  const total = ALL_ACTS.length, d = ALL_ACTS.filter(a => P.done[a]).length;
  document.getElementById('xpbar').style.width = (total ? Math.round(d / total * 100) : 0) + '%';
  renderNav();
}

/* ---------- caja de actividad ---------- */
function actBox(id, title, icon, body, xp) {
  const box = h('section', { class: 'block act' + (P.done[id] ? ' done' : ''), id: 'act-' + id });
  const badge = h('span', { class: 'donebadge' }, P.done[id] ? 'Hecho ✓' : '+' + xp + ' XP');
  box.append(h('div', { class: 'kind' }, h('i', null, icon), title, badge));
  const markDone = (label) => { if (complete(id, xp, label)) { box.classList.add('done'); badge.textContent = 'Hecho ✓'; } };
  return { box, markDone };
}

/* ---------- quiz (varias preguntas) ---------- */
function rQuiz(spec, id) {
  const qs = spec.qs; const { box, markDone } = actBox(id, spec.title || 'Comprueba lo que entendiste', '?', null, spec.xp || 10 * qs.length);
  let right = 0; const solved = new Set();
  qs.forEach((q, qi) => {
    const fb = h('div', { class: 'fb', hidden: true });
    const opts = h('div', { class: 'opts' });
    const order = shuffle(q.o.map((t, i) => i));
    order.forEach(i => {
      const b = h('button', { class: 'opt', type: 'button', html: q.o[i] });
      b.addEventListener('click', () => {
        if (solved.has(qi)) return;
        if (i === q.a) {
          b.classList.add('right'); solved.add(qi); opts.querySelectorAll('.opt').forEach(x => x.disabled = true);
          fb.className = 'fb good'; fb.innerHTML = '<b>¡Exacto!</b> ' + (q.why || ''); fb.hidden = false;
          if (solved.size === qs.length) markDone('Quiz superado');
        } else {
          b.classList.add('wrong'); b.disabled = true;
          fb.className = 'fb badfb'; fb.innerHTML = '<b>Todavía no.</b> ' + ((q.fb && q.fb[i]) || 'Vuelve a leer la pregunta con calma y prueba otra opción.'); fb.hidden = false;
        }
      });
      opts.append(b);
    });
    box.append(h('div', { class: 'q' }, h('div', { class: 'qcount' }, 'Pregunta ' + (qi + 1) + ' de ' + qs.length), h('div', { class: 'qt', html: q.q }), opts, fb));
  });
  return box;
}

/* ---------- clasificar ---------- */
function rSort(spec, id) {
  const { box, markDone } = actBox(id, spec.title || 'Clasifica', '⇄', null, spec.xp || 15);
  if (spec.intro) box.append(h('p', { html: spec.intro }));
  const sel = {}; const list = h('div', { class: 'sortitems' });
  const items = shuffle(spec.items.map((it, i) => i));
  const rows = {};
  items.forEach(i => {
    const [text] = spec.items[i];
    const choices = h('div', { class: 'choices' });
    spec.buckets.forEach((b, bi) => {
      const p = h('button', { class: 'pick', type: 'button' }, b);
      p.addEventListener('click', () => { sel[i] = bi; choices.querySelectorAll('.pick').forEach((x, xi) => x.classList.toggle('sel', xi === bi)); rows[i].classList.remove('right', 'wrong'); });
      choices.append(p);
    });
    rows[i] = h('div', { class: 'sitem' }, h('span', { html: text }), choices);
    list.append(rows[i]);
  });
  const fb = h('div', { class: 'fb', hidden: true });
  const btn = h('button', { class: 'btn', type: 'button' }, 'Comprobar');
  btn.addEventListener('click', () => {
    let ok = 0, missing = 0; const why = [];
    spec.items.forEach(([t, b, w], i) => {
      if (sel[i] === undefined) { missing++; return; }
      const good = sel[i] === b; rows[i].classList.toggle('right', good); rows[i].classList.toggle('wrong', !good);
      if (good) ok++; else if (w) why.push(w);
    });
    fb.hidden = false;
    if (missing) { fb.className = 'fb info'; fb.innerHTML = 'Te faltan ' + missing + ' por clasificar.'; return; }
    if (ok === spec.items.length) { fb.className = 'fb good'; fb.innerHTML = '<b>¡Todo en su lugar!</b> ' + (spec.why || ''); markDone('Clasificación perfecta'); }
    else { fb.className = 'fb badfb'; fb.innerHTML = '<b>' + ok + ' de ' + spec.items.length + ' bien.</b> Revisa las que están en rojo.' + (why.length ? '<br>Pista: ' + why[0] : ''); }
  });
  box.append(list, h('div', { class: 'row' }, btn), fb);
  return box;
}

/* ---------- ordenar pasos ---------- */
function rOrder(spec, id) {
  const { box, markDone } = actBox(id, spec.title || 'Pon los pasos en orden', '↕', null, spec.xp || 15);
  if (spec.intro) box.append(h('p', { html: spec.intro }));
  let cur = shuffle(spec.steps.map((s, i) => i)); if (cur.every((v, i) => v === i)) cur.reverse();
  const ol = h('ol', { class: 'olist' }); const fb = h('div', { class: 'fb', hidden: true });
  const draw = () => {
    ol.innerHTML = '';
    cur.forEach((si, pos) => {
      const up = h('button', { type: 'button', 'aria-label': 'Subir' }, '↑'), dn = h('button', { type: 'button', 'aria-label': 'Bajar' }, '↓');
      up.disabled = pos === 0; dn.disabled = pos === cur.length - 1;
      up.addEventListener('click', () => { [cur[pos - 1], cur[pos]] = [cur[pos], cur[pos - 1]]; draw(); });
      dn.addEventListener('click', () => { [cur[pos + 1], cur[pos]] = [cur[pos], cur[pos + 1]]; draw(); });
      ol.append(h('li', null, h('span', { class: 'n' }, pos + 1), h('span', { html: spec.steps[si] }), h('div', { class: 'mv' }, up, dn)));
    });
  };
  draw();
  const btn = h('button', { class: 'btn', type: 'button' }, 'Comprobar orden');
  btn.addEventListener('click', () => {
    const lis = ol.querySelectorAll('li'); let ok = 0;
    cur.forEach((si, pos) => { const g = si === pos; lis[pos].classList.toggle('right', g); lis[pos].classList.toggle('wrong', !g); if (g) ok++; });
    fb.hidden = false;
    if (ok === cur.length) { fb.className = 'fb good'; fb.innerHTML = '<b>¡Orden perfecto!</b> ' + (spec.why || ''); markDone('Pasos en orden'); }
    else { fb.className = 'fb badfb'; fb.innerHTML = '<b>' + ok + ' de ' + cur.length + ' en su lugar.</b> Mueve los que están en rojo.'; }
  });
  box.append(ol, h('div', { class: 'row' }, btn), fb);
  return box;
}

/* ---------- escribir un comando ---------- */
function rFill(spec, id) {
  const { box, markDone } = actBox(id, spec.title || 'Escribe el comando', '⌨', null, spec.xp || 10 * spec.qs.length);
  let solved = 0;
  spec.qs.forEach((q, qi) => {
    const inp = h('input', { class: 'fillin', id: 'fill-' + id + '-' + qi, placeholder: q.ph || 'git ...', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
    const fb = h('div', { class: 'fb', hidden: true }); let done = false;
    const check = () => {
      if (done) return; const v = inp.value.trim().replace(/\s+/g, ' ');
      const ok = q.a.some(rx => new RegExp('^' + rx + '$', 'i').test(v));
      fb.hidden = false; inp.classList.toggle('right', ok); inp.classList.toggle('wrong', !ok);
      if (ok) { done = true; fb.className = 'fb good'; fb.innerHTML = '<b>¡Bien!</b> ' + (q.why || ''); if (++solved === spec.qs.length) markDone('Comandos correctos'); }
      else { fb.className = 'fb badfb'; fb.innerHTML = 'Casi. ' + (q.hint || 'Revisa la sintaxis.') + ' <button type="button" class="chipbtn" style="margin-left:6px">Ver respuesta</button>'; fb.querySelector('button').onclick = () => { inp.value = q.show; check(); }; }
    };
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
    box.append(h('div', { class: 'q' }, h('div', { class: 'qt', html: q.q }), h('div', { class: 'fillrow' }, inp, h('button', { class: 'btn', type: 'button', onclick: check }, 'Comprobar')), fb));
  });
  return box;
}

/* ---------- tarjetas que se voltean ---------- */
function rFlips(spec, id) {
  const { box, markDone } = actBox(id, spec.title || 'Toca cada tarjeta', '◐', null, spec.xp || 10);
  if (spec.intro) box.append(h('p', { html: spec.intro }));
  const open = new Set(); const g = h('div', { class: 'flips' });
  spec.cards.forEach(([f, b], i) => {
    const c = h('button', { class: 'flip', type: 'button' }, h('span', { class: 'front', html: f }), h('span', { class: 'hint' }, 'Toca para ver'));
    c.addEventListener('click', () => {
      const isOpen = c.classList.toggle('open');
      c.innerHTML = ''; c.append(h('span', { class: 'front', html: f }), isOpen ? h('span', { class: 'back', html: b }) : h('span', { class: 'hint' }, 'Toca para ver'));
      open.add(i); if (open.size === spec.cards.length) markDone('Tarjetas exploradas');
    });
    g.append(c);
  });
  box.append(g);
  return box;
}

/* ---------- pestañas (ver todas) ---------- */
function rTabs(spec, id) {
  const { box, markDone } = actBox(id, spec.title || 'Explora cada opción', '▤', null, spec.xp || 10);
  if (spec.intro) box.append(h('p', { html: spec.intro }));
  const seen = new Set(); const bar = h('div', { class: 'row' }); const pane = h('div', { class: 'q' });
  const show = i => {
    seen.add(i); bar.querySelectorAll('button').forEach((b, j) => { b.className = 'btn' + (j === i ? '' : ' ghost'); });
    pane.innerHTML = spec.tabs[i][1];
    if (seen.size === spec.tabs.length) markDone('Todas las opciones vistas');
  };
  spec.tabs.forEach(([t], i) => bar.append(h('button', { class: 'btn ghost', type: 'button', onclick: () => show(i) }, t)));
  box.append(bar, pane); show(0);
  return box;
}

/* ---------- checklist del capítulo ---------- */
function rChecklist(spec, id) {
  const { box, markDone } = actBox(id, 'Checklist del módulo', '✓', null, spec.xp || 10);
  box.append(h('p', { class: 'muted' }, 'Márcalo con honestidad. Si no puedes marcar un punto, vuelve a esa parte antes de seguir.'));
  const ul = h('ul', { class: 'checklist' });
  const st = P.checks[id] || (P.checks[id] = []);
  spec.items.forEach((t, i) => {
    const cb = h('input', { type: 'checkbox', id: 'ck-' + id + '-' + i }); cb.checked = !!st[i];
    cb.addEventListener('change', () => { st[i] = cb.checked; save(); if (spec.items.every((x, j) => st[j])) markDone('Checklist completo'); });
    ul.append(h('li', null, h('label', { for: 'ck-' + id + '-' + i }, cb, h('span', { html: t }))));
  });
  box.append(ul);
  return box;
}

/* ================================================================
   Laboratorio: terminal + mapa en vivo + misión
   ================================================================ */
const LANE_COLORS = ['var(--teal)', 'var(--accent)', 'var(--gold)', '#7c5cd6', '#2f80ed', '#c2477d'];
function drawGraph(sim, r) {
  const starts = [sim.headId(r), ...Object.values(r.branches), ...Object.values(r.rt), ...Object.values(r.tags).map(t => t.id)].filter(Boolean);
  const set = new Set(); starts.forEach(s => sim.ancestors(s).forEach(x => set.add(x)));
  const list = [...set].map(id => sim.commits[id]).sort((a, b) => a.n - b.n);
  if (!list.length) return h('div', { class: 'empty', style: 'padding:6px;font-size:.8rem;color:var(--muted)' }, 'Todavía no hay commits.');
  const lanes = [...new Set(list.map(c => c.lane))].sort((a, b) => a - b); const li = Object.fromEntries(lanes.map((l, i) => [l, i]));
  const X = i => 26 + i * 58, Y = c => 56 + li[c.lane] * 62;
  const pos = {}; list.forEach((c, i) => { pos[c.id] = [X(i), Y(c)]; });
  const W = X(list.length - 1) + 120, H = 56 + (lanes.length - 1) * 62 + 34;
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Dibujo del historial de commits y ramas');
  const add = (tag, at, txt) => { const e = document.createElementNS(ns, tag); for (const k in at) e.setAttribute(k, at[k]); if (txt) e.textContent = txt; svg.append(e); return e; };
  list.forEach(c => c.parents.forEach(p => { if (!pos[p]) return; const [x1, y1] = pos[p], [x2, y2] = pos[c.id]; const col = LANE_COLORS[(y1 === y2 ? c.lane : (y2 > y1 ? c.lane : sim.commits[p].lane)) % LANE_COLORS.length]; add('path', { d: y1 === y2 ? `M${x1} ${y1}L${x2} ${y2}` : `M${x1} ${y1}C${x1 + 30} ${y1} ${x2 - 30} ${y2} ${x2} ${y2}`, style: `stroke:${col};stroke-width:2.5;fill:none` }); }));
  const head = sim.headId(r); let maxX = W;
  list.forEach(c => {
    const [x, y] = pos[c.id]; const col = LANE_COLORS[c.lane % LANE_COLORS.length];
    add('circle', { cx: x, cy: y, r: c.id === head ? 9 : 7, style: `fill:${c.parents.length > 1 ? 'var(--surface)' : col};stroke:${col};stroke-width:${c.parents.length > 1 ? 3 : 2}` });
    add('text', { x, y: y + 22, 'text-anchor': 'middle', style: 'font:500 9px var(--f-mono);fill:var(--muted)' }, c.id.slice(0, 7));
    const labels = [];
    Object.entries(r.branches).forEach(([b, id]) => { if (id === c.id) labels.push({ t: (!r.detached && b === r.head ? '▶ ' : '') + b, kind: !r.detached && b === r.head ? 'head' : 'br' }); });
    Object.entries(r.rt).forEach(([b, id]) => { if (id === c.id) labels.push({ t: 'origin/' + b, kind: 'rt' }); });
    Object.entries(r.tags).forEach(([b, tg]) => { if (tg.id === c.id) labels.push({ t: '🏷 ' + b, kind: 'tag' }); });
    if (r.detached === c.id) labels.unshift({ t: '▶ HEAD', kind: 'head' });
    labels.forEach((l, k) => {
      const ty = y - 14 - k * 15, w = l.t.length * 6.1 + 10; maxX = Math.max(maxX, x + w + 8);
      add('rect', { x: x - 4, y: ty - 10, width: w, height: 13, rx: 4, style: l.kind === 'head' ? `fill:${col}` : l.kind === 'rt' ? 'fill:var(--surface);stroke:var(--muted);stroke-dasharray:3 2' : l.kind === 'tag' ? 'fill:var(--gold-soft);stroke:var(--gold)' : `fill:var(--surface);stroke:${col}` });
      add('text', { x: x + 1, y: ty, style: `font:600 9.5px var(--f-mono);fill:${l.kind === 'head' ? '#fff' : l.kind === 'rt' ? 'var(--muted)' : 'var(--text)'}` }, l.t);
    });
  });
  svg.setAttribute('width', maxX); svg.setAttribute('viewBox', '0 0 ' + maxX + ' ' + H);
  const wrap = h('div'); wrap.append(svg); return wrap;
}
function renderViz(sim, el, opts) {
  el.innerHTML = '';
  const r = sim.repo;
  if (!r) {
    const folders = Object.keys(sim.repos);
    el.append(h('div', { class: 'zone' }, h('h4', null, 'Tu computadora', h('small', null, sim.cwd)),
      folders.length ? h('ul', null, folders.map(f => h('li', null, '📁 ' + f + '/'))) : h('div', { class: 'empty' }, 'Todavía no hay proyectos aquí.'),
      h('p', { class: 'muted', style: 'font-size:.78rem;margin:6px 0 0' }, folders.length ? 'Entra al proyecto con cd nombre.' : 'Clona un proyecto para empezar.')));
    if (sim.user.name || sim.user.email) el.append(h('div', { class: 'zone' }, h('h4', null, 'Tu identidad en Git'), h('ul', null, h('li', null, 'user.name = ' + (sim.user.name || '—')), h('li', null, 'user.email = ' + (sim.user.email || '—')))));
    return;
  }
  const c = sim.changes(r), H = sim.tree(sim.headId(r));
  const files = Object.keys(r.files).sort();
  const work = h('ul');
  files.forEach(f => {
    let cls = '', tag = '';
    if (c.conflicts.includes(f)) { cls = 'cf'; tag = ' · conflicto'; }
    else if (c.untracked.includes(f)) { cls = 'new'; tag = ' · nuevo'; }
    else if (c.unstaged.find(x => x[1] === f)) { cls = 'mod'; tag = ' · modificado'; }
    else if (sim.ignored(r, f) && r.index[f] === undefined) { cls = 'ign'; tag = ' · ignorado'; }
    work.append(h('li', { class: cls }, f + tag));
  });
  c.unstaged.filter(x => x[0] === 'deleted').forEach(x => work.append(h('li', { class: 'mod' }, x[1] + ' · borrado')));
  const box = h('ul'); c.staged.forEach(([k, f]) => box.append(h('li', { class: 'stg' }, f + (k === 'new file' ? ' · nuevo' : k === 'deleted' ? ' · borrado' : ''))));
  const local = h('ul'); Object.entries(r.branches).sort().forEach(([b, id]) => local.append(h('li', { class: !r.detached && b === r.head ? 'stg' : '' }, (!r.detached && b === r.head ? '▶ ' : '') + b + ' → ' + (id ? id : '(vacía)'))));
  if (r.stash.length) local.append(h('li', { class: 'mod' }, '🗄 stash: ' + r.stash.length + ' guardado(s)'));
  const R = sim.remoteOf(r); const rem = h('ul');
  if (R) Object.entries(R.branches).sort().forEach(([b, id]) => { const ahead = r.branches[b] && r.branches[b] !== id; rem.append(h('li', null, b + ' → ' + id + (ahead && sim.isAnc(id, r.branches[b]) ? ' · te faltan tus commits' : ahead && sim.isAnc(r.branches[b], id) ? ' · tiene cambios nuevos' : ''))); });
  if (R) Object.keys(R.tags).forEach(t => rem.append(h('li', null, '🏷 ' + t)));
  const empty = t => h('div', { class: 'empty' }, t);
  el.append(h('div', { class: 'zones' },
    h('div', { class: 'zone' }, h('h4', null, '1 · Mesa de trabajo', h('small', null, 'tus archivos')), files.length ? work : empty('Carpeta vacía')),
    h('div', { class: 'zone' }, h('h4', null, '2 · La caja', h('small', null, 'staging')), c.staged.length ? box : empty('Vacía. Usa git add.')),
    h('div', { class: 'zone' }, h('h4', null, '3 · Tu historial', h('small', null, 'ramas locales')), local),
    h('div', { class: 'zone' }, h('h4', null, '4 · GitLab', h('small', null, 'remoto')), R && Object.keys(R.branches).length ? rem : empty(R ? 'Sin ramas publicadas' : 'Sin conectar'))));
  if (opts.graph !== false) { const g = h('div', { class: 'graphbox' }, h('h4', null, 'Mapa del historial (se actualiza solo)')); g.append(drawGraph(sim, r)); el.append(g); requestAnimationFrame(() => { g.scrollLeft = g.scrollWidth; }); }
}

function rTerm(spec, id) {
  const { box, markDone } = actBox(id, spec.title || 'Práctica en la terminal', '>_', null, spec.xp || 40);
  if (spec.intro) box.append(h('p', { html: spec.intro }));
  const out = h('div', { class: 'out', 'aria-live': 'polite' });
  const input = h('input', { id: 'term-' + id, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Escribe un comando' });
  const ps = h('span', { class: 'ps' });
  const quick = h('div', { class: 'quick' });
  const term = h('div', { class: 'term' }, h('div', { class: 'tbar' }, h('i'), h('i'), h('i'), h('span', null, 'Terminal de práctica · escribe y pulsa Enter')), out, h('label', { class: 'inrow', for: 'term-' + id }, ps, input), quick);
  const viz = h('div', { class: 'viz' });
  const goalsEl = h('div', { class: 'goals' });
  const mapEl = h('div', { class: 'viz' });
  viz.append(goalsEl, mapEl);
  box.append(h('div', { class: 'lab' }, term, viz));
  let sim, gi, hist = [], hp = 0, finished = false;
  const print = (html, cls) => { out.append(h('div', { class: cls || '', html })); out.scrollTop = out.scrollHeight; };
  const prompt = () => { const r = sim.repo; ps.textContent = sim.cwd + (r ? ' (' + (r.detached ? 'HEAD' : r.head) + ')' : '') + ' $'; };
  const drawGoals = () => {
    goalsEl.innerHTML = '';
    const ol = h('ol');
    spec.goals.forEach((g, i) => ol.append(h('li', { class: i < gi ? 'ok' : i === gi ? 'cur' : '' }, h('span', { class: 'ck' }, i < gi ? '✓' : i + 1), h('span', { html: g.t }))));
    const hintBtn = h('button', { class: 'chipbtn', type: 'button' }, 'Pista');
    const fillBtn = h('button', { class: 'chipbtn', type: 'button' }, 'Escríbelo por mí');
    const resetBtn = h('button', { class: 'chipbtn', type: 'button' }, 'Reiniciar práctica');
    const hint = h('div', { class: 'hintline', hidden: true });
    hintBtn.onclick = () => { const g = spec.goals[gi]; if (!g) return; hint.hidden = false; hint.innerHTML = g.hint ? 'Prueba con: <code>' + esc(g.hint) + '</code>' + (g.why ? '<br>' + g.why : '') : 'Revisa el objetivo y usa <code>git status</code> para orientarte.'; };
    fillBtn.onclick = () => { const g = spec.goals[gi]; if (g && g.hint) { input.value = g.hint; input.focus(); } };
    resetBtn.onclick = () => start();
    goalsEl.append(h('h4', null, finished ? '¡Misión cumplida! 🎉' : 'Tu misión'), ol, h('div', { class: 'row', style: 'margin-top:8px;gap:6px' }, finished ? null : hintBtn, finished ? null : fillBtn, resetBtn), hint);
    if (finished && spec.outro) goalsEl.append(h('div', { class: 'hintline', html: spec.outro }));
  };
  const advance = (res, cmd) => {
    let moved = false;
    while (gi < spec.goals.length) {
      let ok = false; try { ok = spec.goals[gi].check(sim, res || {}, cmd || ''); } catch (e) { ok = false; }
      if (!ok) break; gi++; moved = true; res = {}; cmd = '';
    }
    if (gi >= spec.goals.length && !finished) { finished = true; markDone('Misión de terminal'); print('<span class="note">🎉 <b>Misión cumplida.</b> Puedes seguir practicando aquí todo lo que quieras.</span>'); }
    if (moved || finished) drawGoals();
  };
  const exec = line => {
    print('<span class="g">' + esc(ps.textContent) + '</span> <span class="echo">' + esc(line) + '</span>');
    const res = sim.run(line);
    if (res.clear) { out.innerHTML = ''; }
    else { if (res.out) print(res.out, res.err ? '' : ''); if (res.note) print('<span class="note">' + res.note + '</span>'); }
    prompt(); renderViz(sim, mapEl, spec);
    advance(res, line.trim().replace(/\s+/g, ' '));
  };
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const v = input.value; input.value = ''; if (v.trim()) { hist.push(v); hp = hist.length; } exec(v); }
    else if (e.key === 'ArrowUp') { if (hp > 0) { hp--; input.value = hist[hp]; } e.preventDefault(); }
    else if (e.key === 'ArrowDown') { if (hp < hist.length) { hp++; input.value = hist[hp] || ''; } e.preventDefault(); }
  });
  if (spec.actions) {
    const bar = h('div', { class: 'row', style: 'gap:6px' }, h('span', { class: 'muted', style: 'font-size:.8rem' }, 'En GitLab:'));
    spec.actions.forEach(a => bar.append(h('button', { class: 'btn ghost', type: 'button', style: 'padding:.4rem .7rem;font-size:.82rem', onclick: () => {
      const res = a.run(sim); print('<span class="note">' + res.msg + '</span>'); renderViz(sim, mapEl, spec); advance(res.ok ? { action: a.flag } : {}, '');
    } }, a.label)));
    viz.insertBefore(bar, mapEl);
  }
  (spec.quick || ['git status', 'git log --oneline', 'ls', 'help']).forEach(q => quick.append(h('button', { type: 'button', onclick: () => { input.value = q; input.focus(); } }, q)));
  function start() {
    sim = new Sim(); if (spec.setup) spec.setup(sim);
    gi = 0; finished = false; out.innerHTML = '';
    print('<span class="m">' + (spec.welcome || 'Terminal de práctica. Nada de lo que hagas aquí toca tu computadora. Escribe help para ver los comandos.') + '</span>');
    if (spec.project && sim.repo) { const r = sim.repo; const n = sim.ancestors(sim.headId(r)).size; print('<span class="note">📁 <b>Tu proyecto: sitio-oficina</b>, tal como quedó al terminar el módulo anterior (' + n + ' commits, archivos: ' + Object.keys(r.files).sort().map(esc).join(', ') + '). Usa <code>git log --oneline</code> para ver su historia.</span>'); }
    prompt(); renderViz(sim, mapEl, spec); drawGoals();
    if (P.done[id]) { /* se puede repetir libremente */ }
  }
  start();
  return box;
}
