/* ================================================================
   Widgets especiales de cada capítulo
   ================================================================ */
const W = {};

/* Cap. 0 — mismo problema, con y sin Git */
W.compare = function (spec, id) {
  const { box, markDone } = actBox(id, '‹A› y ‹B›: el mismo problema, dos finales', '▶', null, 15);
  const seen = new Set();
  const flows = {
    sin: ['‹A› cambia el horario de atención en su copia de la página.', 'Al mismo tiempo, ‹B› corrige el teléfono en <i>su</i> copia.', '‹A› sube su versión al servidor.', '‹B› sube la suya <b>después</b>: su archivo todavía tiene el horario viejo.', '<b>Resultado:</b> el teléfono quedó bien, pero el horario volvió a ser el viejo. Un usuario llega a una oficina cerrada. Nadie sabe qué pasó.'],
    con: ['‹A› guarda su cambio: <code>Actualiza horario de atención</code>.', '‹B› guarda el suyo: <code>Corrige teléfono de contacto</code>.', 'Cuando ‹B› intenta publicar, Git le avisa: <i>hay cambios nuevos de ‹A›</i>.', '‹B› los trae primero. Git junta los dos cambios porque tocan partes distintas.', '<b>Resultado:</b> se publica todo junto. Y cualquiera puede ver quién cambió el horario y cuándo.']
  };
  const pane = h('ol', { class: 'olist' }); let mode = null, step = 0;
  const nextBtn = h('button', { class: 'btn teal', type: 'button', hidden: true }, 'Siguiente paso');
  const draw = () => {
    pane.innerHTML = '';
    flows[mode].slice(0, step + 1).forEach((t, i) => pane.append(h('li', { class: i === flows[mode].length - 1 ? (mode === 'sin' ? 'wrong' : 'right') : '' }, h('span', { class: 'n' }, i + 1), h('span', { html: t }))));
    nextBtn.hidden = step >= flows[mode].length - 1;
    if (step >= flows[mode].length - 1) { seen.add(mode); if (seen.size === 2) markDone('Viste los dos finales'); }
  };
  const b1 = h('button', { class: 'btn ghost', type: 'button', onclick: () => { mode = 'sin'; step = 0; draw(); b1.className = 'btn'; b2.className = 'btn ghost'; } }, '😬 Sin Git');
  const b2 = h('button', { class: 'btn ghost', type: 'button', onclick: () => { mode = 'con'; step = 0; draw(); b2.className = 'btn'; b1.className = 'btn ghost'; } }, '😌 Con Git');
  nextBtn.onclick = () => { step++; draw(); };
  box.append(h('p', null, '‹A› y ‹B› mantienen la página web de su oficina. Mira la historia de las dos formas.'), h('div', { class: 'row' }, b1, b2), pane, h('div', { class: 'row' }, nextBtn));
  return box;
};

/* Cap. 1 — el viaje de un cambio: local y remoto */
W.journey = function (spec, id) {
  const { box, markDone } = actBox(id, 'El viaje de un cambio', '⇢', null, 15);
  const stages = [
    { b: 'Editar el archivo', where: [1, 0, 0], txt: 'Cambiaste <code>contacto.md</code>. El cambio existe solo en tu carpeta. Si cierras sin guardar, se pierde.' },
    { b: 'git commit', where: [2, 0, 0], txt: 'Guardaste un <b>punto de guardado</b> en tu cuaderno. Sigue <b>solo en tu computadora</b>. Si tu disco se daña, se pierde. Y tu equipo no lo ha visto.' },
    { b: 'git push', where: [2, 2, 0], txt: 'Enviaste tus commits a GitLab. <b>Ahora el equipo puede verlos.</b>' },
    { b: 'git pull (‹B›)', where: [2, 2, 2], txt: '‹B› trae tus cambios a su computadora. El viaje terminó: los tres lugares tienen lo mismo.' }
  ];
  const places = ['💻 Tu computadora', '☁️ GitLab (remoto)', '💻 Compu de ‹B›'];
  const labels = ['—', 'cambio sin guardar', 'commit a3f9c21'];
  let st = -1; const grid = h('div', { class: 'grid2' }); const msg = h('div', { class: 'fb info' }, 'Pulsa el primer botón para empezar.');
  const btns = h('div', { class: 'row' });
  const draw = () => {
    grid.innerHTML = '';
    places.forEach((p, i) => { const w = st < 0 ? 0 : stages[st].where[i]; grid.append(h('div', { class: 'mini', style: w ? 'border-color:var(--teal);background:var(--teal-soft)' : '' }, h('b', null, p), h('p', null, labels[w]))); });
    btns.innerHTML = '';
    stages.forEach((s, i) => btns.append(h('button', { class: 'btn' + (i === st + 1 ? '' : ' ghost'), type: 'button', disabled: i !== st + 1, onclick: () => { st = i; msg.className = 'fb ' + (i === 3 ? 'good' : 'info'); msg.innerHTML = s.txt; draw(); if (i === 3) markDone('Entendiste local y remoto'); } }, s.b)));
    if (st === 3) btns.append(h('button', { class: 'btn ghost', type: 'button', onclick: () => { st = -1; msg.className = 'fb info'; msg.textContent = 'Pulsa el primer botón para empezar.'; draw(); } }, 'Repetir'));
  };
  draw();
  box.append(h('p', null, 'Guardar un cambio en tu computadora no es lo mismo que publicarlo. Avanza paso a paso y mira dónde vive el cambio en cada momento.'), btns, grid, msg);
  return box;
};

/* Cap. 3 — las tres zonas con botones */
W.zones = function (spec, id) {
  const { box, markDone } = actBox(id, 'Prepara el paquete', '📦', null, 20);
  const files = [
    { f: 'README.md', d: 'Agregaste tu nombre y la fecha', want: true },
    { f: 'contacto.md', d: 'Corregiste el teléfono', want: true },
    { f: 'notas-personales.txt', d: 'Tus apuntes privados', want: false },
    { f: 'prueba-colores.css', d: 'Colores que probaste "por si acaso"', want: false }
  ];
  let where = files.map(() => 'mesa'); let pkg = null, sent = false;
  const fb = h('div', { class: 'fb info', html: 'Mete en la caja <b>solo</b> lo que debe ir en este commit. Luego ciérrala y envíala.' });
  const area = h('div', { class: 'zones' });
  const draw = () => {
    area.innerHTML = '';
    const z = (title, sub, key) => {
      const ul = h('ul');
      files.forEach((x, i) => { if (where[i] !== key) return; ul.append(h('li', { class: key === 'caja' ? 'stg' : x.want ? 'mod' : 'new', style: 'display:flex;justify-content:space-between;gap:6px;align-items:center' }, h('span', null, x.f), key === 'mesa' ? h('button', { class: 'chipbtn', type: 'button', style: 'padding:.1rem .5rem;font-size:.7rem', onclick: () => { where[i] = 'caja'; pkg = null; draw(); } }, 'git add') : key === 'caja' ? h('button', { class: 'chipbtn', type: 'button', style: 'padding:.1rem .5rem;font-size:.7rem', onclick: () => { where[i] = 'mesa'; draw(); } }, 'restore --staged') : null)); });
      return h('div', { class: 'zone' }, h('h4', null, title, h('small', null, sub)), ul.children.length ? ul : h('div', { class: 'empty' }, 'Vacía'));
    };
    area.append(z('Mesa de trabajo', 'directorio', 'mesa'), z('Caja abierta', 'staging', 'caja'));
    const p = h('div', { class: 'zone' }, h('h4', null, 'Paquete cerrado', h('small', null, 'commit')), pkg ? h('ul', null, h('li', { class: 'stg' }, '📦 "' + pkg.msg + '"'), ...pkg.files.map(f => h('li', null, '· ' + f))) : h('div', { class: 'empty' }, 'Aún no hay commit'));
    const g = h('div', { class: 'zone' }, h('h4', null, 'Oficina de correos', h('small', null, 'GitLab')), sent ? h('ul', null, h('li', { class: 'stg' }, '✅ Paquete entregado')) : h('div', { class: 'empty' }, 'Nada enviado'));
    area.append(p, g);
  };
  const commitBtn = h('button', { class: 'btn teal', type: 'button' }, 'git commit');
  const pushBtn = h('button', { class: 'btn', type: 'button' }, 'git push');
  const resetBtn = h('button', { class: 'btn ghost', type: 'button' }, 'Empezar de nuevo');
  commitBtn.onclick = () => {
    const inBox = files.filter((x, i) => where[i] === 'caja');
    if (!inBox.length) { fb.className = 'fb badfb'; fb.innerHTML = '<code>nothing added to commit</code>: la caja está vacía. Primero usa <b>git add</b>.'; return; }
    const bad = inBox.filter(x => !x.want), miss = files.filter((x, i) => x.want && where[i] !== 'caja');
    if (bad.length) { fb.className = 'fb badfb'; fb.innerHTML = 'Espera: en la caja está <b>' + bad.map(x => x.f).join(', ') + '</b>. ' + (bad[0].f.startsWith('notas') ? 'Son tus notas privadas: no deben entrar al proyecto (para eso sirve <code>.gitignore</code>).' : 'Es una prueba que no tiene que ver con la tarea. Un commit, una idea.') + ' Sácalo con <b>restore --staged</b>.'; return; }
    if (miss.length) { fb.className = 'fb info'; fb.innerHTML = 'Falta <b>' + miss.map(x => x.f).join(', ') + '</b>, que sí es parte de este cambio.'; return; }
    pkg = { msg: 'Actualiza README y corrige teléfono de contacto', files: inBox.map(x => x.f) }; files.forEach((x, i) => { if (where[i] === 'caja') where[i] = 'pkg'; });
    fb.className = 'fb good'; fb.innerHTML = '¡Caja cerrada y etiquetada! El commit vive en tu computadora. Ahora envíalo con <b>git push</b>.'; draw();
  };
  pushBtn.onclick = () => {
    if (!pkg) { fb.className = 'fb badfb'; fb.innerHTML = 'No hay ningún paquete cerrado. Sin commit no hay nada que enviar.'; return; }
    sent = true; draw(); fb.className = 'fb good'; fb.innerHTML = '<b>¡Entregado!</b> Tu equipo ya puede ver el cambio en GitLab. Y tus notas y pruebas se quedaron en tu mesa, donde deben estar.'; markDone('Paquete limpio enviado');
  };
  resetBtn.onclick = () => { where = files.map(() => 'mesa'); pkg = null; sent = false; fb.className = 'fb info'; fb.innerHTML = 'Mete en la caja <b>solo</b> lo que debe ir en este commit.'; draw(); };
  draw();
  box.append(h('p', { html: 'Tu tarea era: <b>agregar tu nombre al README y corregir el teléfono</b>. En la mesa hay más cosas. Usa los botones como si fueran comandos.' }), area, h('div', { class: 'row' }, commitBtn, pushBtn, resetBtn), fb);
  return box;
};

/* Cap. 3 — juez de mensajes de commit */
W.commitJudge = function (spec, id) {
  const { box, markDone } = actBox(id, 'Escribe un buen mensaje de commit', '✎', null, 20);
  const tasks = [
    'Cambiaste el horario de atención de 4:00 a 5:00 p.m. en la página de contacto.',
    'Arreglaste que el formulario fallaba al enviarse sin fecha.',
    'Agregaste las instrucciones de instalación para Windows en el README.'
  ];
  let ti = 0, passed = 0;
  const task = h('div', { class: 'fb info' });
  const inp = h('input', { class: 'fillin', id: 'cj-' + id, placeholder: 'git commit -m "..."  (escribe solo el mensaje)', autocomplete: 'off' });
  const res = h('ul', { class: 'checklist' });
  const VERBS = ['agrega', 'añade', 'corrige', 'actualiza', 'elimina', 'mejora', 'cambia', 'valida', 'quita', 'renombra', 'reorganiza', 'documenta', 'ajusta', 'crea', 'borra', 'traduce', 'simplifica', 'separa', 'mueve', 'reemplaza', 'evita', 'muestra', 'permite', 'impide', 'configura', 'arregla'];
  const VAGUE = ['cambios', 'arreglos', 'update', 'fix', 'varios', 'cosas', 'ya funciona', 'wip', 'avance', 'test', 'prueba', 'asdf'];
  const draw = () => { task.innerHTML = '<b>Situación ' + (ti + 1) + ' de ' + tasks.length + ':</b> ' + tasks[ti]; };
  const check = () => {
    const m = inp.value.trim().replace(/^git commit -m\s*/, '').replace(/^["']|["']$/g, '');
    const first = (m.split(/\s+/)[0] || '').toLowerCase();
    const rules = [
      [VERBS.includes(first) || /^[a-záéíóú]+(a|e)$/.test(first) && first.length > 4, 'Empieza con un verbo: Agrega, Corrige, Actualiza…'],
      [m.split(/\s+/).length >= 3 && !VAGUE.some(v => m.toLowerCase() === v || m.toLowerCase().startsWith(v + ' ') && m.split(' ').length < 3), 'Es específico: dice qué cambió y dónde'],
      [m.length > 0 && m.length < 70, 'Es corto: menos de 70 caracteres (' + m.length + ')'],
      [!/!!|\?\?/.test(m) && !/ y (también|además)/i.test(m), 'Una sola idea, sin "y además" ni signos de más'],
      [/^[A-ZÁÉÍÓÚ]/.test(m), 'Empieza con mayúscula']
    ];
    res.innerHTML = '';
    rules.forEach(([ok, t]) => res.append(h('li', null, h('label', null, h('span', { style: 'width:20px;flex:none;color:' + (ok ? 'var(--ok)' : 'var(--bad)') }, ok ? '✓' : '✗'), h('span', null, t)))));
    if (rules.every(r => r[0])) {
      passed++;
      if (ti < tasks.length - 1) { ti++; inp.value = ''; draw(); res.prepend(h('li', null, h('div', { class: 'fb good', html: '<b>¡Mensaje claro!</b> Siguiente situación.' }))); }
      else { res.prepend(h('li', null, h('div', { class: 'fb good', html: '<b>¡Excelente!</b> Tu equipo (y tú en seis meses) te lo va a agradecer.' }))); markDone('Mensajes claros'); }
    }
  };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
  draw();
  box.append(h('p', null, 'Un buen mensaje responde: ¿qué hace este cambio? Escribe uno para cada situación y el juez lo revisa con cinco reglas: empieza con un verbo, es específico, es corto, tiene una sola idea y empieza con mayúscula.'), task, h('div', { class: 'fillrow' }, inp, h('button', { class: 'btn', type: 'button', onclick: check }, 'Revisar')), res);
  return box;
};

/* Cap. 4 — nombra las ramas */
W.branchNames = function (spec, id) {
  const { box, markDone } = actBox(id, 'Ponle nombre a la rama', '⑂', null, 20);
  const tasks = [
    { t: 'Te piden rediseñar el formulario de contacto (algo nuevo).', p: 'feature' },
    { t: 'El teléfono del pie de página está mal. Hay que corregirlo.', p: 'fix' },
    { t: 'Vas a mejorar las instrucciones de instalación del README (solo documentación).', p: 'docs' },
    { t: 'Se cayó el login en producción y hay que corregirlo hoy mismo.', p: 'hotfix' }
  ];
  let ti = 0;
  const task = h('div', { class: 'fb info' }); const inp = h('input', { class: 'fillin', id: 'bn-' + id, placeholder: 'tipo/descripcion-corta', autocomplete: 'off', autocapitalize: 'off' });
  const fb = h('div', { class: 'fb', hidden: true });
  const draw = () => { task.innerHTML = '<b>Tarea ' + (ti + 1) + ' de ' + tasks.length + ':</b> ' + tasks[ti].t; };
  const check = () => {
    const v = inp.value.trim(); const errs = [];
    if (/\s/.test(v)) errs.push('Tiene espacios: usa guiones.');
    if (/[A-Z]/.test(v)) errs.push('Tiene mayúsculas: todo en minúsculas.');
    if (/[áéíóúñü]/i.test(v)) errs.push('Tiene tildes o eñes: escribe <i>instalacion</i>, no <i>instalación</i>.');
    const m = v.match(/^([a-z]+)\/(.+)$/);
    if (!m) errs.push('Le falta el prefijo con barra: <code>tipo/descripcion</code>.');
    else {
      if (m[1] !== tasks[ti].p) errs.push('El tipo no encaja con la tarea: piensa si es algo nuevo, una corrección, urgente o solo documentación.');
      const words = m[2].split('-').filter(Boolean);
      if (words.length < 2) errs.push('La descripción es muy corta: dos a cuatro palabras.');
      if (words.length > 5) errs.push('Demasiado larga: tres o cuatro palabras bastan.');
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(m[2])) errs.push('Usa solo letras, números y guiones simples.');
    }
    fb.hidden = false;
    if (errs.length) { fb.className = 'fb badfb'; fb.innerHTML = errs.join('<br>'); inp.classList.add('wrong'); return; }
    inp.classList.remove('wrong');
    if (ti < tasks.length - 1) { fb.className = 'fb good'; fb.innerHTML = '<b>¡Buen nombre!</b> <code>' + esc(v) + '</code>. Siguiente.'; ti++; inp.value = ''; draw(); }
    else { fb.className = 'fb good'; fb.innerHTML = '<b>¡Perfecto!</b> Con nombres así, cualquiera sabe de qué trata cada rama sin abrirla.'; markDone('Ramas bien nombradas'); }
  };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
  draw();
  box.append(h('p', { html: 'Convención: <code>tipo/descripcion-corta</code>. Prefijos: <code>feature/</code> algo nuevo, <code>fix/</code> corrección, <code>hotfix/</code> urgente en producción, <code>docs/</code> documentación.' }), task, h('div', { class: 'fillrow' }, inp, h('button', { class: 'btn', type: 'button', onclick: check }, 'Revisar')), fb);
  return box;
};

/* Cap. 5 — simulador de Merge Request */
W.mr = function (spec, id) {
  const { box, markDone } = actBox(id, 'Tu primera Merge Request, de principio a fin', '⇆', null, 40);
  const card = h('div', { class: 'mrcard' }); const fb = h('div', { class: 'fb info' });
  let step = 0; const S = { title: '', draft: false };
  const steps = [];
  const setFb = (cls, html) => { fb.className = 'fb ' + cls; fb.innerHTML = html; };
  const go = n => { step = n; card.innerHTML = ''; steps[n](); };
  // 0: origen y destino
  steps[0] = () => {
    const src = h('select', { class: 'fillin', id: 'mr-src-' + id }, ['main', 'feature/seccion-sobre-mi', 'fix/typo-readme'].map(x => h('option', null, x)));
    const dst = h('select', { class: 'fillin', id: 'mr-dst-' + id }, ['feature/seccion-sobre-mi', 'main', 'fix/typo-readme'].map(x => h('option', null, x)));
    card.append(h('div', { class: 'mrh' }, h('b', null, 'Paso 1 · Nueva Merge Request')), h('p', { html: 'Hiciste push de <code>feature/seccion-sobre-mi</code>. Elige qué rama quieres juntar (<b>origen</b>) y hacia dónde (<b>destino</b>).' }),
      h('div', { class: 'grid2' }, h('label', null, 'Origen (source branch)', src), h('label', null, 'Destino (target branch)', dst)),
      h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: () => {
        if (src.value === 'feature/seccion-sobre-mi' && dst.value === 'main') { setFb('good', 'Origen y destino correctos. Revisarlos siempre evita el error común de abrir la MR hacia la rama equivocada.'); go(1); }
        else setFb('badfb', 'Revisa: quieres llevar los cambios <b>de</b> tu rama <b>hacia</b> main.');
      } }, 'Continuar')));
  };
  // 1: título
  steps[1] = () => {
    const opts = ['Cambios', 'Rama de ‹A›', 'Agrega sección Sobre mí con mi presentación', 'fix'];
    card.append(h('div', { class: 'mrh' }, h('b', null, 'Paso 2 · El título')), h('p', null, 'Igual que un buen commit: empieza con un verbo y di qué hace el cambio.'));
    const o = h('div', { class: 'opts' }); opts.forEach(t => o.append(h('button', { class: 'opt', type: 'button', onclick: () => { if (t.startsWith('Agrega')) { S.title = t; setFb('good', 'Título claro: quien revisa ya sabe de qué se trata antes de abrir nada.'); go(2); } else setFb('badfb', '«' + t + '» no dice qué cambia. ¿Qué entendería alguien que no sabe nada de tu trabajo?'); } }, t)));
    card.append(o);
  };
  // 2: descripción
  steps[2] = () => {
    const secs = [['Qué cambia', true], ['Por qué', true], ['Cómo probarlo', true], ['Mi opinión sobre el equipo de fútbol', false], ['Pendientes o dudas', true]];
    const chosen = new Set();
    card.append(h('div', { class: 'mrh' }, h('b', null, 'Paso 3 · La descripción')), h('p', null, 'Elige las secciones que debe llevar la plantilla de descripción.'));
    const o = h('div', { class: 'row' }); secs.forEach(([t], i) => { const b = h('button', { class: 'pick', type: 'button', onclick: () => { chosen.has(i) ? chosen.delete(i) : chosen.add(i); b.classList.toggle('sel'); } }, t); o.append(b); });
    card.append(o, h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: () => {
      const ok = secs.every(([t, w], i) => w === chosen.has(i) || (t === 'Pendientes o dudas'));
      if (ok && chosen.has(0) && chosen.has(1) && chosen.has(2)) { setFb('good', '<b>Qué cambia, por qué y cómo probarlo</b> deberían estar en casi todas las MR. Le ahorran a tu compañero adivinar.'); go(3); }
      else setFb('badfb', 'Faltan secciones clave o sobra alguna. Las tres imprescindibles: qué cambia, por qué y cómo probarlo.');
    } }, 'Continuar')));
  };
  // 3: borrador y revisión propia
  steps[3] = () => {
    card.append(h('div', { class: 'mrh' }, h('b', null, S.title), h('span', { class: 'state draft' }, 'Draft')), h('p', { html: 'Tu MR está en <b>borrador</b>: no se puede fusionar todavía. Antes de pedir revisión, ¿qué haces?' }));
    const o = h('div', { class: 'opts' });
    [['Reviso yo primero la pestaña Changes, como si fuera de otra persona', true], ['La marco lista y espero que el revisor encuentre los errores', false]].forEach(([t, ok]) => o.append(h('button', { class: 'opt', type: 'button', onclick: () => { if (ok) { setFb('good', 'Encontraste un texto de prueba olvidado y lo quitaste. Cada cosa que corriges tú es una que no tiene que señalar tu compañero. Ahora: <b>Mark as ready</b>.'); go(4); } else setFb('badfb', 'Revisar tu propia MR primero ahorra tiempo a todos. Te sorprenderá cuántas cosas encuentras.'); } }, t)));
    card.append(o);
  };
  // 4: comentario bloqueante
  steps[4] = () => {
    card.append(h('div', { class: 'mrh' }, h('b', null, S.title), h('span', { class: 'state open' }, 'Open')),
      h('div', { class: 'comment', html: '<b>‹A›</b> · <i>Bloqueante</i><br>En <code>sobre-mi.md</code> línea 3 falta tu correo de contacto. Sin eso, la sección queda incompleta.' }),
      h('p', null, '¿Cómo atiendes el comentario?'));
    const o = h('div', { class: 'opts' });
    [['Corrijo en mi rama, hago commit y git push a la misma rama', true, 'Exacto: no hace falta otra MR. Al hacer push a la misma rama, la MR se actualiza sola.'], ['Abro una Merge Request nueva con la corrección', false, 'No hace falta: el push a la misma rama actualiza la MR que ya existe.'], ['Le respondo "así está bien" y fusiono', false, 'Un comentario bloqueante se corrige antes de fusionar. Si no estás de acuerdo, se explica con respeto, no se ignora.']].forEach(([t, ok, w]) => o.append(h('button', { class: 'opt', type: 'button', onclick: () => { if (ok) { setFb('good', w); go(5); } else setFb('badfb', w); } }, t)));
    card.append(o);
  };
  // 5: resolver hilo + pipeline + merge
  steps[5] = () => {
    const thread = h('button', { class: 'btn ghost', type: 'button' }, 'Responder "Corregido en el último commit" y resolver el hilo');
    const pipe = h('div', { class: 'job running' }, h('span', { class: 'dot' }), 'pipeline: running');
    const merge = h('button', { class: 'btn teal', type: 'button', disabled: true }, 'Merge');
    const del = h('label', { style: 'display:flex;gap:8px;align-items:center;font-size:.9rem' }, h('input', { type: 'checkbox', id: 'mr-del-' + id, checked: true }), 'Delete source branch');
    let resolved = false, green = false;
    const upd = () => { merge.disabled = !(resolved && green); };
    thread.onclick = () => { resolved = true; thread.disabled = true; thread.textContent = 'Hilo resuelto ✓ · ‹A› aprobó'; upd(); };
    setTimeout(() => { pipe.className = 'job passed'; pipe.lastChild.textContent = 'pipeline: passed'; green = true; upd(); }, 1800);
    merge.onclick = () => { setFb('good', '¡Fusionado! Tus cambios entraron a main' + (document.getElementById('mr-del-' + id).checked ? ' y la rama se borró sola en GitLab.' : '.') + ' Falta un último paso en tu computadora.'); go(6); };
    card.append(h('div', { class: 'mrh' }, h('b', null, S.title), h('span', { class: 'state open' }, 'Open')), h('p', { html: 'GitLab activa el botón Merge cuando se cumplen las condiciones: aprobación, hilos resueltos y <b>pipeline</b> en verde. El pipeline es una revisión automática que GitLab ejecuta con cada cambio (lo verás a fondo en el módulo 9).' }), thread, pipe, del, h('div', { class: 'row' }, merge));
  };
  // 6: después del merge
  steps[6] = () => {
    card.append(h('div', { class: 'mrh' }, h('b', null, S.title), h('span', { class: 'state merged' }, 'Merged')), h('p', null, 'Tu rama ya está en main, pero tu computadora todavía no lo sabe. ¿Qué comandos ejecutas, en orden?'));
    const cmds = ['git switch main', 'git pull', 'git branch -d feature/seccion-sobre-mi']; let got = [];
    const show = h('pre', { class: 'cmd' }, '# toca los comandos en orden');
    const o = h('div', { class: 'row' }); shuffle(cmds.concat(['git push --force'])).forEach(c => o.append(h('button', { class: 'pick', type: 'button', onclick: () => {
      if (c === 'git push --force') { setFb('badfb', '<b>push --force</b> no tiene nada que hacer aquí: reescribe historia compartida. Nunca en ramas compartidas.'); return; }
      if (c === cmds[got.length]) { got.push(c); show.textContent = got.join('\n'); if (got.length === 3) { setFb('good', '<b>¡Ciclo completo!</b> Rama → MR → revisión → corrección → merge → limpieza. Así se trabaja en equipo.'); markDone('Merge Request completada'); } }
      else setFb('badfb', 'Ese no va ahora. Piensa: primero vuelves a main, luego la actualizas y al final borras tu rama vieja.');
    } }, c)));
    card.append(o, show);
  };
  go(0);
  box.append(h('p', null, 'Recorre el ciclo completo de una Merge Request en un GitLab de práctica. Cada decisión tiene consecuencias.'), card, fb);
  return box;
};

/* Cap. 6 — resolver un conflicto a mano */
W.conflict = function (spec, id) {
  const { box, markDone } = actBox(id, 'Resuelve el conflicto de ‹A›', '⚡', null, 30);
  const raw = '# Contacto\n\n<<<<<<< HEAD\nHorario: lunes a viernes, 8:00 a 5:00\n=======\nHorario: lunes a viernes, 8:00 a 4:30\n>>>>>>> main\n\nTeléfono: 500-0000\n';
  const view = h('div', { class: 'conflict', html: '# Contacto\n\n<span class="mk">&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</span><span class="ours">Horario: lunes a viernes, 8:00 a 5:00</span><span class="mk">=======</span><span class="theirs">Horario: lunes a viernes, 8:00 a 4:30</span><span class="mk">&gt;&gt;&gt;&gt;&gt;&gt;&gt; main</span>\nTeléfono: 500-0000' });
  const ctx = h('div', { class: 'grid2' },
    h('div', { class: 'mini', style: 'background:var(--teal-soft)' }, h('b', null, 'Tu cambio (HEAD)'), h('p', { html: '‹A›: <code>Cambia horario general a 5:00</code>. El horario de toda la semana se extendió.' })),
    h('div', { class: 'mini', style: 'background:var(--gold-soft)' }, h('b', null, 'El cambio que llega (main)'), h('p', { html: '‹B›: <code>Ajusta horario del viernes por nueva disposición</code>. Los viernes se cierra antes.' })));
  const fb = h('div', { class: 'fb info', html: 'Primero lee los dos cambios. ¿Qué intentaba hacer cada uno? Luego elige.' });
  const editor = h('textarea', { class: 'fillin', id: 'cf-' + id, hidden: true }); editor.value = raw;
  const finish = h('button', { class: 'btn teal', type: 'button', hidden: true }, 'git add contacto.md + git commit');
  const o = h('div', { class: 'opts' });
  [['Accept Current Change: me quedo con mi versión (5:00)', 'Se perdió en silencio el ajuste del viernes de ‹B›. Los viernes la página dirá 5:00 y la oficina estará cerrada a las 4:30. Es el error más común: resolver borrando el trabajo del otro.'],
   ['Accept Incoming Change: me quedo con la otra (4:30)', 'Ahora se perdió tu cambio: el horario general vuelve a ser el viejo. Rara vez uno de los dos cambios sobra por completo.'],
   ['Accept Both: conservo las dos líneas', 'Quedan dos horarios contradictorios, uno debajo de otro. ¿Cuál es el bueno? El usuario no lo sabrá.'],
   ['Combinar: cada cambio tiene una parte correcta', null]].forEach(([t, bad]) => o.append(h('button', { class: 'opt', type: 'button', onclick: (e) => {
    o.querySelectorAll('.opt').forEach(x => x.classList.remove('right', 'wrong'));
    if (bad) { e.currentTarget.classList.add('wrong'); fb.className = 'fb badfb'; fb.innerHTML = bad; return; }
    e.currentTarget.classList.add('right'); fb.className = 'fb good'; fb.innerHTML = '¡Eso! Ahora edita el archivo: deja el texto como debe quedar y <b>borra las tres marcas</b> (&lt;&lt;&lt;&lt;&lt;&lt;&lt;, ======= y &gt;&gt;&gt;&gt;&gt;&gt;&gt;).'; editor.hidden = false; finish.hidden = false; editor.focus();
  } }, t)));
  finish.onclick = () => {
    const v = editor.value;
    if (/^(<{7}|={7}|>{7})/m.test(v)) { fb.className = 'fb badfb'; fb.innerHTML = 'Todavía quedan marcas de conflicto en el archivo. Busca <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>: no debe quedar ninguna.'; return; }
    if (!/5:00/.test(v) || !/4:30/.test(v)) { fb.className = 'fb badfb'; fb.innerHTML = 'El archivo ya no tiene marcas, pero falta uno de los dos cambios: tiene que aparecer el horario general (5:00) <b>y</b> el del viernes (4:30).'; return; }
    if (!/Teléfono: 500-0000/.test(v)) { fb.className = 'fb badfb'; fb.innerHTML = 'Se perdió la línea del teléfono, que no tenía conflicto. Déjala como estaba.'; return; }
    fb.className = 'fb good'; fb.innerHTML = '<b>Conflicto bien resuelto.</b> Nadie perdió trabajo. En el mensaje del commit, ‹A› anota: <i>Combina horario nuevo con el ajuste del viernes de ‹B›</i>. Y luego prueba que todo funcione.'; markDone('Conflicto resuelto sin borrar a nadie');
  };
  box.append(h('p', { html: '‹A› trajo <code>main</code> a su rama con <code>git merge main</code> y apareció esto en <code>contacto.md</code>:' }), view, ctx, h('p', { class: 'qt', style: 'font-weight:600;margin:0' }, '¿Cómo debe quedar?'), o, editor, h('div', { class: 'row' }, finish), fb);
  return box;
};

/* Cap. 7 — el asistente del botiquín */
W.undo = function (spec, id) {
  const { box, markDone } = actBox(id, 'El asistente del botiquín', '✚', null, 25);
  const tree = {
    q: '¿Dónde está el error?', o: [
      ['En archivos que cambié pero no guardé (sin git add)', { q: '¿Quieres perder esos cambios?', o: [['Sí, quiero tirarlos', { r: 'git restore archivo', d: 'El archivo vuelve a su última versión guardada. <b>Ojo:</b> esos cambios se pierden para siempre. Antes mira con <code>git diff archivo</code> qué vas a perder.' }], ['No, quiero apartarlos un rato', { r: 'git stash push -m "descripción"', d: 'Tus cambios van al cajón y la carpeta queda limpia. Los recuperas con <code>git stash pop</code>.' }]] }],
      ['En la caja (hice git add), sin commit', { r: 'git restore --staged archivo', d: 'Es inofensivo: el archivo sale de la caja y tu cambio sigue en el archivo.' }],
      ['En un commit que solo está en mi computadora (sin push)', { q: '¿Qué quieres hacer con ese commit?', o: [['Cambiar solo el mensaje', { r: 'git commit --amend -m "Mensaje correcto"', d: 'Reemplaza el último commit. Solo si no has hecho push.' }], ['Deshacerlo, pero conservar el trabajo', { r: 'git reset --soft HEAD~1', d: 'El commit se deshace y los cambios quedan en la caja, listos para otro commit.' }], ['Lo hice en la rama equivocada', { r: 'git branch feature/mi-cambio\ngit reset --hard HEAD~1\ngit switch feature/mi-cambio', d: 'Creas la rama apuntando a tu commit, lo sacas de main y te cambias a ella. Tu commit queda a salvo.' }], ['Tirarlo con todo su trabajo', { r: 'git reset --hard HEAD~1', d: '<b>Borra</b> el commit y sus cambios. Revisa antes con <code>git status</code> y <code>git log</code>. Si te arrepientes: <code>git reflog</code>.' }]] }],
      ['En un commit que ya publiqué (con push)', { r: 'git revert código-del-commit\ngit push', d: 'Lo que ya publicaste no se reescribe: se corrige con un commit nuevo que anula al otro. No afecta a tus compañeros.' }],
      ['Borré algo y lo quiero de vuelta', { r: 'git reflog\ngit switch -c rescate código', d: 'El reflog anota cada movimiento. Busca el punto que quieres y crea una rama ahí. Límite: no recupera lo que nunca tuvo commit.' }],
      ['Subí una contraseña o un token', { r: 'Cambia o revoca el secreto YA', d: 'Ningún comando lo arregla: aunque lo borres, sigue en la historia. Primero cambia la contraseña o revoca el token, luego avisa a seguridad. Lo ves en detalle en el módulo 10.' }]
    ]
  };
  const seen = new Set(); const wrap = h('div', { class: 'wizard' });
  const show = (node, trail) => {
    wrap.innerHTML = '';
    if (trail.length) wrap.append(h('div', { class: 'trail' }, trail.join(' → ')));
    if (node.r) {
      seen.add(node.r);
      wrap.append(h('div', { class: 'result' }, h('span', { class: 'eyebrow' }, 'Tu herramienta'), h('pre', { class: 'cmd' }, node.r), h('p', { style: 'margin:0', html: node.d })));
      wrap.append(h('div', { class: 'row' }, h('button', { class: 'btn ghost', type: 'button', onclick: () => show(tree, []) }, 'Probar otro accidente'), h('span', { class: 'muted', style: 'font-size:.85rem' }, 'Explorados: ' + seen.size + ' de 3 para completar')));
      if (seen.size >= 3) markDone('Botiquín explorado');
      return;
    }
    wrap.append(h('div', { class: 'wq' }, node.q));
    const o = h('div', { class: 'opts' }); node.o.forEach(([t, n]) => o.append(h('button', { class: 'opt', type: 'button', onclick: () => show(n, trail.concat(t)) }, t))); wrap.append(o);
  };
  show(tree, []);
  box.append(h('p', null, 'Cuando algo sale mal, respira y responde dos preguntas: ¿dónde está el error? y ¿quiero perder ese cambio o conservarlo? Explora al menos tres accidentes.'), wrap);
  return box;
};

/* Cap. 7 — las tres formas de reset */
W.reset = function (spec, id) {
  const { box, markDone } = actBox(id, 'Las tres formas de reset', '↶', null, 15);
  const tried = new Set();
  const zones = ['Commit', 'La caja', 'Tus archivos'];
  const state = { none: [1, 0, 1], soft: [0, 1, 1], mixed: [0, 0, 1], hard: [0, 0, 0] };
  const msgs = { none: 'Tu último commit tiene un error. ¿Qué pasa con sus cambios con cada tipo de reset? Pulsa un botón.', soft: '<b>--soft</b>: el commit se deshace y los cambios quedan <b>en la caja</b>, listos para otro commit. Ideal para rehacerlo con otro mensaje o agregar algo.', mixed: '<b>--mixed</b> (el de por defecto): el commit se deshace y los cambios quedan <b>en tus archivos</b>, fuera de la caja. Ideal para reorganizar qué va en cada commit.', hard: '<b>--hard</b>: el commit se deshace y los cambios <b>se borran</b>. Sin confirmación. Úsalo con mucho cuidado; si dudas, usa --soft.' };
  const grid = h('div', { class: 'resetviz' }); const fb = h('div', { class: 'fb info' });
  const draw = k => {
    grid.innerHTML = '';
    zones.forEach((z, i) => { const on = state[k][i]; grid.append(h('div', { class: 'zone' }, h('h4', { style: 'justify-content:center' }, z), h('span', { class: 'pill ' + (on ? 'on' : (k === 'hard' || (k !== 'none' && i === 0) ? 'gone' : '')) }, on ? (i === 0 ? 'a3f9c21' : 'horario.md') : (i === 0 ? 'deshecho' : k === 'hard' ? 'borrado' : '—')))); });
    fb.className = 'fb ' + (k === 'hard' ? 'badfb' : k === 'none' ? 'info' : 'good'); fb.innerHTML = msgs[k];
    if (k !== 'none') { tried.add(k); if (tried.size === 3) markDone('Reset entendido'); }
  };
  const row = h('div', { class: 'row' }, ['soft', 'mixed', 'hard'].map(k => h('button', { class: 'btn ' + (k === 'hard' ? '' : 'ghost'), type: 'button', onclick: () => draw(k), style: 'font-family:var(--f-mono);font-size:.82rem' }, 'git reset --' + k + ' HEAD~1')), h('button', { class: 'chipbtn', type: 'button', onclick: () => draw('none') }, 'Volver al inicio'));
  draw('none');
  box.append(row, grid, fb, h('p', { class: 'muted', style: 'font-size:.9rem;margin:0', html: 'Regla estricta: <b>reset solo con commits que no hayas publicado</b>. Si ya hiciste push, usa <code>git revert</code>.' }));
  return box;
};

/* Cap. 8 — tablero */
W.kanban = function (spec, id) {
  const { box, markDone } = actBox(id, 'Mueve el issue #42 por el tablero', '▦', null, 20);
  const cols = ['Por hacer', 'En progreso', 'En revisión', 'Cerrado'];
  const labels = ['por hacer', 'en progreso', 'en revisión', 'cerrado'];
  const cards = [{ n: 45, t: 'Filtro por fecha', c: 0 }, { n: 42, t: 'Página en blanco al enviar formulario sin fecha', c: 0, star: true }, { n: 40, t: 'Teléfono en pie de página', c: 2 }, { n: 38, t: 'Logo nuevo', c: 3 }];
  const visited = new Set([0]); const board = h('div', { class: 'kanban' }); const fb = h('div', { class: 'fb info', html: '‹B› se asigna el #42. Muévelo columna por columna y mira cómo cambia su etiqueta.' });
  const events = ['', '‹B› se lo asigna y empieza. Etiqueta: <b>en progreso</b>.', 'Abrió la Merge Request con <code>Closes #42</code>. Etiqueta: <b>en revisión</b>.', '‹A› aprobó, ‹B› fusionó y el issue <b>se cerró solo</b> gracias a <code>Closes #42</code>.'];
  const draw = () => {
    board.innerHTML = '';
    cols.forEach((c, ci) => {
      const col = h('div', { class: 'kcol' }, h('h4', null, c));
      cards.filter(k => k.c === ci).forEach(k => {
        const mv = h('div', { class: 'mvs' }, h('button', { type: 'button', disabled: ci === 0, 'aria-label': 'Mover a la izquierda', onclick: () => { k.c--; draw(); } }, '←'), h('button', { type: 'button', disabled: ci === 3, 'aria-label': 'Mover a la derecha', onclick: () => {
          k.c++; if (k.star) { visited.add(k.c); fb.className = 'fb ' + (k.c === 3 ? 'good' : 'info'); fb.innerHTML = events[k.c] || ''; if (k.c === 3 && visited.has(1) && visited.has(2)) markDone('Del reporte al cierre'); } draw();
        } }, '→'));
        col.append(h('div', { class: 'kcard', style: k.star ? 'border-color:var(--accent)' : '' }, h('span', null, h('b', null, '#' + k.n + ' '), k.t), h('span', { class: 'lbl' }, labels[k.c]), mv));
      });
      board.append(col);
    });
  };
  draw();
  box.append(h('p', { html: 'Al arrastrar (aquí, mover con las flechas) una tarjeta, GitLab le cambia la etiqueta. Al llegar a <b>Cerrado</b>, el issue se cierra.' }), h('div', { class: 'table', style: 'border:0' }, board), fb,
    h('div', { class: 'chain' }, ['Issue #42', 'Rama fix/42-fecha-vacia', 'Commit (#42)', 'MR: Closes #42', 'Issue cerrado'].flatMap((t, i, a) => i < a.length - 1 ? [h('span', { class: 'node' }, t), h('span', { class: 'arrow' }, '→')] : [h('span', { class: 'node' }, t)])));
  return box;
};

/* Cap. 9 — el semáforo del pipeline */
W.pipeline = function (spec, id) {
  const { box, markDone } = actBox(id, 'Lee el semáforo del pipeline', '●', null, 30);
  const stages = [['construir', ['compilar']], ['probar', ['pruebas', 'estilo']], ['publicar', ['desplegar-pruebas']]];
  let fixed = false, running = false;
  const pipe = h('div', { class: 'pipe' }); const fb = h('div', { class: 'fb info', html: '‹B› abrió una MR que cambia el formato de fechas del reporte. Ejecuta el pipeline.' });
  const log = h('div', { class: 'log', hidden: true }); const choice = h('div', { class: 'opts', hidden: true });
  const jobs = {};
  const draw = st => {
    pipe.innerHTML = '';
    stages.forEach(([s, js]) => pipe.append(h('div', { class: 'stage' }, h('h4', null, 'Etapa: ' + s), js.map(j => { const e = h('div', { class: 'job ' + (st[j] || '') }, h('span', { class: 'dot' }, st[j] === 'passed' ? '✓' : st[j] === 'failed' ? '✕' : ''), j + (st[j] ? ' · ' + st[j] : '')); if (st[j] === 'failed') e.onclick = openLog; jobs[j] = e; return e; }))));
  };
  const run = () => {
    if (running) return; running = true; log.hidden = true; choice.hidden = true;
    const st = {}; draw(st);
    const seq = [['compilar', 'passed'], ['pruebas', fixed ? 'passed' : 'failed'], ['estilo', 'passed'], ['desplegar-pruebas', fixed ? 'passed' : 'skipped']];
    let i = 0;
    const tick = () => {
      if (i >= seq.length) { running = false; if (fixed) { fb.className = 'fb good'; fb.innerHTML = '<b>Verde.</b> Las revisiones automáticas pasaron. Ojo: verde no significa perfecto; ‹A› todavía revisa la lógica. Máquina y personas se complementan.'; markDone('Pipeline en verde'); } else { fb.className = 'fb badfb'; fb.innerHTML = '<b>Rojo.</b> Un trabajo falló y la etapa <i>publicar</i> quedó <b>skipped</b>. Toca el trabajo con la ✕ para leer su registro.'; } return; }
      const [j, r] = seq[i]; st[j] = 'running'; draw(st);
      setTimeout(() => { st[j] = r; draw(st); i++; tick(); }, r === 'skipped' ? 300 : 650);
    };
    tick();
  };
  function openLog() {
    log.hidden = false;
    log.innerHTML = '$ npm test\n  ✓ reporte diario muestra la fecha\n  ✓ búsqueda filtra por fecha\n  <span style="color:#ff8b7b">✕ reporte mensual muestra totales correctos</span>\n    Expected: "Octubre: 1,240"\n    Received: "10/2026: 0"\n\n<span style="color:#ff8b7b">FAILED: 1 test failed</span>\nERROR: Job failed: exit code 1';
    fb.className = 'fb info'; fb.innerHTML = 'El error casi siempre está <b>al final</b> del registro. ¿Qué haces ahora?';
    choice.hidden = false; choice.innerHTML = '';
    [['Fusiono igual, seguro no es nada', 'Nunca se fusiona en rojo. El problema terminaría en producción, en el reporte que usan todos.'], ['Desactivo esa prueba para que pase', 'Borrar o desactivar una prueba esconde el problema en vez de resolverlo.'], ['Le doy Retry diez veces hasta que pase', 'Retry sirve para fallos pasajeros (como la red). Si falla igual, no es pasajero. Esto es un error real.'], ['Relaciono el error con mi cambio, corrijo en mi rama y hago push', null]].forEach(([t, bad]) => choice.append(h('button', { class: 'opt', type: 'button', onclick: e => {
      if (bad) { e.currentTarget.classList.add('wrong'); fb.className = 'fb badfb'; fb.innerHTML = bad; return; }
      e.currentTarget.classList.add('right'); fixed = true; fb.className = 'fb good'; fb.innerHTML = 'El cambio de formato rompió cómo se agrupaban los meses. ‹B› lo corrige y hace push: <b>el pipeline se ejecuta solo otra vez</b>.'; setTimeout(run, 900);
    } }, t)));
  }
  draw({});
  box.append(h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: run }, '▶ Ejecutar pipeline')), pipe, log, choice, fb);
  return box;
};

/* Cap. 10 — encuentra los secretos */
W.secrets = function (spec, id) {
  const { box, markDone } = actBox(id, 'Encuentra los secretos antes de fusionar', '🔑', null, 20);
  const lines = [['+ const API_URL = "https://api.ejemplo.com";', 0], ['+ const API_KEY = "sk_live_8f2a9c71b4e0d5";', 1], ['+ // Conexión a la base de datos', 0], ['+ DB_PASSWORD=Oficina2026!', 1], ['+ const timeout = 30;', 0], ['+ const token = process.env.API_TOKEN;', 0], ['+ -----BEGIN OPENSSH PRIVATE KEY-----', 1], ['+ mostrarMensaje("Correo no válido");', 0]];
  const flagged = new Set(); const view = h('div', { class: 'diffview' }); const fb = h('div', { class: 'fb info', html: 'Toca cada línea que <b>nunca</b> debería entrar al repositorio.' });
  lines.forEach(([t, s], i) => { const d = h('div', { class: 'add' }, t); d.onclick = () => { flagged.has(i) ? flagged.delete(i) : flagged.add(i); d.classList.toggle('flag'); }; view.append(d); });
  const btn = h('button', { class: 'btn', type: 'button', onclick: () => {
    const real = lines.map((l, i) => l[1] ? i : -1).filter(i => i >= 0);
    const miss = real.filter(i => !flagged.has(i)), extra = [...flagged].filter(i => !lines[i][1]);
    if (!miss.length && !extra.length) { fb.className = 'fb good'; fb.innerHTML = '<b>¡Los tres!</b> Una llave de API, una contraseña y una llave privada SSH. La línea con <code>process.env.API_TOKEN</code> está bien: lee el valor de una variable, no lo escribe en el código. Los secretos van en <code>.env</code> (en el .gitignore) o en las variables de GitLab.'; markDone('Ojo de seguridad'); }
    else { fb.className = 'fb badfb'; fb.innerHTML = (miss.length ? 'Se te escapa ' + miss.length + ' secreto(s). ' : '') + (extra.length ? 'Marcaste ' + extra.length + ' línea(s) que no son secretos. ' : '') + 'Pista: busca valores escritos directamente, no nombres de variables.'; }
  } }, 'Revisar');
  box.append(h('p', { html: 'Estás revisando una Merge Request. Estas son las líneas nuevas de <code>config.js</code>.' }), view, h('div', { class: 'row' }, btn), fb);
  return box;
};

/* Cap. 13 — versionado semántico */
W.semver = function (spec, id) {
  const { box, markDone } = actBox(id, '¿Qué número sube?', '1.2.3', null, 25);
  const cases = [['Corregiste el teléfono del pie de página, que mostraba un número antiguo.', 2], ['Agregaste un filtro por fecha en la búsqueda. Todo lo anterior sigue funcionando igual.', 1], ['Cambiaste el formato de exportación y los usuarios tienen que adaptar sus plantillas.', 0], ['Arreglaste que el formulario fallaba sin fecha.', 2], ['Agregaste exportar a Excel, sin romper nada.', 1]];
  let v = [1, 4, 2], ci = 0;
  const sv = h('div', { class: 'semver' }); const task = h('div', { class: 'fb info' }); const fb = h('div', { class: 'fb', hidden: true });
  const draw = (bump) => { sv.innerHTML = ''; ['MAYOR', 'MENOR', 'PARCHE'].forEach((n, i) => { sv.append(h('span', { class: bump === i ? 'bump' : '' }, String(v[i]), h('small', null, n))); if (i < 2) sv.append('.'); }); task.innerHTML = ci < cases.length ? '<b>Cambio ' + (ci + 1) + ' de ' + cases.length + ':</b> ' + cases[ci][0] : '<b>¡Terminaste!</b> La versión actual es <code>v' + v.join('.') + '</code>.'; };
  const row = h('div', { class: 'row' }, ['MAYOR', 'MENOR', 'PARCHE'].map((n, i) => h('button', { class: 'btn ghost', type: 'button', onclick: () => {
    if (ci >= cases.length) return;
    fb.hidden = false;
    if (i !== cases[ci][1]) { fb.className = 'fb badfb'; fb.innerHTML = ['MAYOR sube solo cuando los usuarios tienen que adaptarse.', 'MENOR es para funciones nuevas que no rompen lo anterior.', 'PARCHE es para correcciones de errores.'][i]; return; }
    const old = 'v' + v.join('.'); v[i]++; for (let k = i + 1; k < 3; k++) v[k] = 0; ci++;
    fb.className = 'fb good'; fb.innerHTML = old + ' → <b>v' + v.join('.') + '</b>. ' + (i < 2 ? 'Fíjate: las partes de la derecha volvieron a cero.' : 'Solo sube el parche.'); draw(i);
    if (ci === cases.length) markDone('Versionado semántico');
  } }, 'Sube ' + n)));
  draw();
  box.append(h('p', { html: 'Versión actual del sistema de tu equipo. Para cada cambio, decide qué parte del número sube: <code>MAYOR.MENOR.PARCHE</code>.' }), sv, task, row, fb);
  return box;
};

/* Cap. 14 — certificado */
W.cert = function (spec, id) {
  const total = ALL_ACTS.length, d = ALL_ACTS.filter(a => P.done[a]).length;
  const name = h('input', { class: 'fillin', id: 'cert-name', placeholder: 'Escribe tu nombre', style: 'text-align:center;max-width:360px;justify-self:center' });
  try { name.value = localStorage.getItem('gsm-curso-name') || ''; } catch (e) {}
  const nm = h('h2', null, name.value || 'Tu nombre');
  name.addEventListener('input', () => { nm.textContent = name.value || 'Tu nombre'; try { localStorage.setItem('gsm-curso-name', name.value); } catch (e) {} });
  return h('section', { class: 'cert' }, h('span', { class: 'eyebrow' }, 'Certificado de práctica'), h('p', { class: 'muted', style: 'margin:0' }, 'Se reconoce que'), nm,
    h('p', { style: 'margin:0' }, 'recorrió el curso interactivo ', h('b', null, 'Git sin miedo'), ': ciclo básico, ramas, Merge Requests, conflictos, botiquín, organización, pipelines, seguridad, historial y versiones.'),
    h('p', { class: 'muted', style: 'margin:0', html: 'Actividades completadas: <b>' + d + ' de ' + total + '</b> · ' + P.xp + ' XP' }), name,
    h('p', { class: 'muted', style: 'font-size:.85rem;margin:0' }, d === total ? '¡Completaste todo! Haz una captura de pantalla para guardarlo.' : 'Completa todas las actividades para el certificado completo.'));
};
