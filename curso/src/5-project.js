/* ================================================================
   El proyecto del curso: sitio-oficina
   Un solo repositorio que crece módulo a módulo. Cada misión empieza
   con el proyecto tal como quedó al final de la anterior, más lo que
   el equipo (‹A› y ‹B›) publicó mientras tanto.
   ================================================================ */
const PROJ = 'sitio-oficina';
const PROJECT_URL = 'git@gitlab.com:oficina/sitio-oficina.git';

function seedProject(sim) {
  sim.clonable[PROJECT_URL] = (s, url) => seedRemote(s, url, ctx => {
    ctx.commit('Initial commit', { 'README.md': '# sitio-oficina\n\nPágina web de la oficina.\n' }, 'ana');
    ctx.commit('Agrega página de contacto', { 'contacto.md': '# Contacto\n\nHorario: lunes a viernes, 8:00 a 4:00\nTeléfono: 500-0000\n' }, 'luis');
  });
}
/* Un compañero publica directo en GitLab. edit recibe una copia del árbol y lo cambia. */
const team = (who, msg, edit) => sim => {
  const r = sim.repos[PROJ], R = sim.remoteOf(r);
  const tree = clone(sim.tree(R.branches.main)); edit(tree);
  R.branches.main = sim.mkCommit(r, { msg, tree, parents: [R.branches.main], author: AUTHORS[who], lane: 'main' });
};
/* Alguien fusiona una Merge Request en GitLab y se borra la rama remota. */
const mergeMR = (branch, who = 'ana') => sim => {
  const r = sim.repos[PROJ], R = sim.remoteOf(r), m = R.branches.main, b = R.branches[branch];
  const base = sim.mergeBase(m, b), B = sim.tree(base), O = sim.tree(m), T = sim.tree(b), tree = {};
  new Set([...Object.keys(O), ...Object.keys(T)]).forEach(f => { const x = merge3(B[f], O[f], T[f], 'main', branch); if (x.text !== undefined) tree[f] = x.text; });
  R.branches.main = sim.mkCommit(r, { msg: "Merge branch '" + branch + "' into 'main'", tree, parents: [m, b], author: AUTHORS[who], lane: 'main' });
  delete R.branches[branch];
};
const byMsg = (sim, msg) => Object.values(sim.commits).filter(c => c.msg === msg).sort((a, b) => b.n - a.n)[0].id;

/* El guion completo, en orden. Cada etapa: comandos (texto) o eventos del equipo (funciones). */
/* Qué le pasa al proyecto en cada módulo (se muestra en la portada y en cada módulo). */
const ROADMAP = {
  m0: 'Conoces el problema que el proyecto va a resolver: el caos de las copias a mano.',
  m1: 'Conoces dónde vivirá el proyecto: tu computadora (Git) y GitLab.',
  m2: 'Descargas <code>sitio-oficina</code> a tu computadora.',
  m3: 'Primer cambio: tu nombre en el README y un <code>.gitignore</code>.',
  m4: 'Creas la sección "Sobre mí" en tu primera rama.',
  m5: 'Pides revisión de "Sobre mí" con una Merge Request y se fusiona.',
  m6: 'Agregas la página de horario y resuelves un conflicto en ella.',
  m7: 'Agregas el correo de contacto, el reporte y la lista del equipo, deshaciendo errores por el camino.',
  m8: 'Organizas el trabajo del proyecto con issues y un tablero.',
  m9: 'Aprendes a leer las revisiones automáticas de cada cambio.',
  m10: 'Proteges el proyecto: roles, main protegida y cero secretos.',
  m11: 'Aprendes a apoyarte en IA sin perder el control del proyecto.',
  m12: 'Investigas en el historial quién cambió el teléfono y lo corriges.',
  m13: 'Publicas las versiones <code>v1.0.0</code> y <code>v1.0.1</code>.',
  m14: 'Cierras el issue #7 con la página de preguntas frecuentes: el flujo completo.'
};
const PROJECT_STAGES = [
  ['m2', ['git config --global user.name "‹YO›"', 'git config --global user.email "‹MAIL›"', 'git clone ' + PROJECT_URL, 'cd ' + PROJ]],
  ['m3', [s => { const r = s.repos[PROJ]; r.files['README.md'] += nm('Hecho por: ‹YO›\n'); r.files['notas-personales.txt'] = nm('No olvidar: preguntar a ‹A› por el horario\n'); },
    team('ana', 'Actualiza horario de atención', t => { t['contacto.md'] = t['contacto.md'].replace('8:00 a 4:00', '8:00 a 5:00'); })], 'pre'],
  ['m3', ['echo "notas-personales.txt" > .gitignore', 'git add README.md .gitignore', 'git commit -m "Agrega mi nombre al README e ignora notas personales"', 'git pull', 'git push']],
  ['m4', ['git pull', 'git switch -c feature/seccion-sobre-mi', 'echo "# Sobre mí" > sobre-mi.md', 'git add sobre-mi.md', 'git commit -m "Agrega sección Sobre mí"', 'echo "Me encargo de mantener la página de contacto." >> sobre-mi.md', 'git commit -am "Agrega presentación en Sobre mí"', 'git push -u origin feature/seccion-sobre-mi', 'git switch main']],
  ['m5', [mergeMR('feature/seccion-sobre-mi'), 'git pull', 'git branch -d feature/seccion-sobre-mi', 'git fetch --prune']],
  ['m6', ['echo "Horario: 8:00 a 4:00" > horario.md', 'git add horario.md', 'git commit -m "Agrega página de horario"', 'git push', 'git switch -c fix/horario-tarde', 'echo "Horario: 8:00 a 5:00" > horario.md', 'git commit -am "Extiende horario hasta las 5:00"', 'git switch main', 'echo "Horario: 7:00 a 4:00" > horario.md', 'git commit -am "Adelanta la apertura a las 7:00"', 'git switch fix/horario-tarde'], 'pre'],
  ['m6', ['git merge main', 'echo "Horario: 7:00 a 5:00" > horario.md', 'git add horario.md', 'git commit -m "Combina apertura a las 7:00 con cierre a las 5:00"', 'git push -u origin fix/horario-tarde', mergeMR('fix/horario-tarde', 'luis'), 'git switch main', 'git pull', 'git branch -d fix/horario-tarde', 'git fetch --prune']],
  ['m7a', [s => { s.repos[PROJ].files['README.md'] += 'asdfasdf texto de prueba BORRAR\n'; }], 'pre'],
  ['m7a', ['git restore README.md', 'echo "Correo: info@oficina.com" >> contacto.md', 'git commit -am "Agrega correo de contacto"', 'git push']],
  ['m7b', [team('luis', 'Agrega reporte mensual', t => { t['reporte.md'] = '# Reporte mensual\n\nTotal: 1,240\n'; }), 'git pull', 'git switch -c feature/reporte', 'echo "# Reporte mensual" > reporte.md', 'echo "" >> reporte.md', 'echo "Total: 0 (formato nuevo)" >> reporte.md', 'git commit -am "Cambia formato de totales"', 'git push -u origin feature/reporte'], 'pre'],
  ['m7b', [s => s.run('git revert ' + byMsg(s, 'Cambia formato de totales')), 'git push', 'git restore reporte.md', 'git switch main', 'git branch -D feature/reporte', 'git push origin --delete feature/reporte']],
  ['m7c', ['echo "‹A›: diseño · ‹B›: reportes · Tú: contacto" > equipo.md', 'git add equipo.md', 'git commit -m "Agrega lista del equipo"'], 'pre'],
  ['m7c', ['git reset --hard HEAD~1', s => s.run('git switch -c rescate ' + byMsg(s, 'Agrega lista del equipo')), 'git switch main', 'git merge rescate', 'git branch -d rescate', 'git push']],
  ['m12', [team('luis', 'Agrega filtro por fecha en la búsqueda', t => { t['busqueda.md'] = '# Búsqueda\n\nFiltro por fecha: desde / hasta\n'; }),
    team('ana', 'Corrige typo en el README', t => { t['README.md'] = t['README.md'].replace('Página web', 'Sitio web'); }),
    team('luis', 'Actualiza pie de página', t => { t['contacto.md'] = t['contacto.md'].replace('500-0000', '500-1234'); t['pie.md'] = 'Oficina central · 2026\n'; }), 'git pull'], 'pre'],
  ['m12', ['git switch -c fix/telefono-contacto', "sed -i 's/500-1234/500-0000/' contacto.md", 'git commit -am "Corrige teléfono de contacto en la página"', 'git push -u origin fix/telefono-contacto', mergeMR('fix/telefono-contacto'), 'git switch main', 'git pull', 'git branch -d fix/telefono-contacto', 'git fetch --prune']],
  ['m13', ['git tag -a v1.0.0 -m "Primera versión estable del sitio"', 'git push origin v1.0.0', 'echo "Dirección: Calle Central 10" >> contacto.md', 'git commit -am "Agrega dirección de la oficina"', 'git tag -a v1.0.1 -m "Agrega dirección de la oficina"', 'git push origin --tags', 'git push']],
  ['m14', [s => { s.remoteOf(s.repos[PROJ]).protected = true; }], 'pre']
];
/* Reconstruye el proyecto justo antes de la misión `key` (incluye su preparación). */
function buildProject(sim, key) {
  seedProject(sim);
  const errors = [];
  for (const [k, steps, kind] of PROJECT_STAGES) {
    if (k === key && kind !== 'pre') break;
    steps.forEach(st => { const res = typeof st === 'function' ? st(sim) : sim.run(st); if (res && res.err) errors.push(k + ': ' + (typeof st === 'string' ? st : 'evento') + ' → ' + String(res.out).replace(/<[^>]+>/g, '').slice(0, 120)); });
    if (k === key) break;
  }
  if (errors.length) console.warn('Proyecto del curso:', errors);
  sim.lastBuildErrors = errors;
  return sim.repos[PROJ];
}
