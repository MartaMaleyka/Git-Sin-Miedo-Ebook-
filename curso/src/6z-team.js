/* ================================================================
   Proyecto en equipo: Marcos, Katherine y César trabajan a la vez.
   Cada quien tiene su "computadora" (la terminal, guardada en su
   navegador) y los tres comparten el mismo GitLab, guardado en la
   base de datos del artifact y actualizado en vivo.
   ================================================================ */
const WHO_KEYS = ['marcos', 'katherine', 'cesar'];
const nameOf = w => TEAM[w].name;
const REVIEWS = { marcos: 'katherine', katherine: 'cesar', cesar: 'marcos' }; // X revisa la MR de REVIEWS[X]
const reviewerOf = w => WHO_KEYS.find(k => REVIEWS[k] === w);
const encRef = s => s.replace(/\//g, ':');
const decRef = s => s.replace(/:/g, '/');
const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/* ---------- ayudas para las comprobaciones ---------- */
const mainTree = c => c.sim.tree(c.R.branches.main);
const synced = c => !!(c.r && c.r.branches.main && c.r.branches.main === c.R.branches.main);
const myMR = (c, w, pre) => c.mrs.find(m => m.author === w && m.source.startsWith(pre));
const approvedBy = (m, w) => !!(m && m.approvals && m.approvals[w]);
const commentedBy = (c, m, w) => !!(m && c.comments.some(x => x.mr === m.id && x.who === w));
const onMain = (c, pred) => [...c.sim.ancestors(c.R.branches.main)].some(id => pred(c.sim.commits[id]));
const authorIs = (cm, w) => !!cm && norm(cm.author).startsWith(norm(nameOf(w)));
const ranCmd = (c, rx) => (c.flags.cmds || []).some(x => rx.test(x));

/* ---------- las etapas: qué hace cada quien ---------- */
const TEAM_STAGES = [
  { n: 1, mod: 'm2', title: 'Únanse al proyecto', intro: 'Los tres configuran Git con su propio nombre y descargan el mismo proyecto desde el GitLab del equipo.',
    tasks: [
      { id: 'cfg', who: 'all', t: w => 'Configura tu nombre (<b>' + nameOf(w) + '</b>) y tu correo', hint: w => 'git config --global user.name "' + nameOf(w) + '"', check: c => norm(c.sim.user.name).includes(norm(nameOf(c.me))) && /@/.test(c.sim.user.email) },
      { id: 'clone', who: 'all', t: () => 'Clona <code>sitio-oficina</code> y entra a la carpeta', hint: () => 'git clone ' + PROJECT_URL, check: c => c.sim.cwd === '~/' + PROJ },
      { id: 'look', who: 'all', t: () => 'Mira la historia del proyecto', hint: () => 'git log --oneline', check: c => ranCmd(c, /^git log/) && !!c.r }] },
  { n: 2, mod: 'm3', title: 'Primer ciclo, los tres a la vez', intro: 'Cada quien hace un cambio distinto en <code>main</code> y lo publica. Háganlo casi al mismo tiempo: a alguien le van a rechazar el push porque otro publicó antes. Es normal: <code>git pull</code> y otra vez <code>git push</code>.',
    tasks: [
      { id: 'gi', who: 'marcos', t: () => 'Crea un <code>.gitignore</code> que ignore <code>notas-personales.txt</code> y publícalo', hint: () => 'echo "notas-personales.txt" > .gitignore', check: c => /notas-personales/.test(mainTree(c)['.gitignore'] || '') },
      { id: 'readme', who: 'katherine', t: () => 'Agrega al README la línea <i>Aquí encontrarás horarios, contacto y equipo.</i> y publícala', hint: () => 'echo "Aquí encontrarás horarios, contacto y equipo." >> README.md', check: c => /horarios, contacto y equipo/.test(mainTree(c)['README.md'] || '') },
      { id: 'hor', who: 'cesar', t: () => 'Crea <code>horario.md</code> con <i>Horario: lunes a viernes, 8:00 a 4:00</i> y publícalo', hint: () => 'echo "Horario: lunes a viernes, 8:00 a 4:00" > horario.md', check: c => /8:00 a 4:00/.test(mainTree(c)['horario.md'] || '') },
      { id: 'sync', who: 'all', t: () => 'Trae el trabajo de los otros dos: tu <code>main</code> queda igual que GitLab', hint: () => 'git pull', check: c => synced(c) && !!c.r.files['horario.md'] && !!c.r.files['.gitignore'] && /horarios/.test(c.r.files['README.md'] || '') }] },
  { n: 3, mod: 'm5', title: 'Ramas y Merge Requests cruzadas', intro: 'Cada quien crea su sección "Sobre mí" en su propia rama y abre una Merge Request. Se revisan en cadena: <b>Marcos revisa a Katherine</b>, <b>Katherine revisa a César</b> y <b>César revisa a Marcos</b>.',
    tasks: [
      { id: 'br', who: 'all', t: w => 'Crea la rama <code>feature/sobre-' + w + '</code> con el archivo <code>sobre-' + w + '.md</code> y publícala', hint: w => 'git switch -c feature/sobre-' + w, check: c => { const b = c.R.branches['feature/sobre-' + c.me]; return (b && c.sim.tree(b)['sobre-' + c.me + '.md'] !== undefined) || mainTree(c)['sobre-' + c.me + '.md'] !== undefined; } },
      { id: 'mr', who: 'all', t: () => 'Abre tu Merge Request en el panel de GitLab', check: c => !!myMR(c, c.me, 'feature/sobre-') },
      { id: 'rev', who: 'all', t: w => 'Revisa la MR de <b>' + nameOf(REVIEWS[w]) + '</b>: deja un comentario y apruébala', check: c => { const m = myMR(c, REVIEWS[c.me], 'feature/sobre-'); return approvedBy(m, c.me) && commentedBy(c, m, c.me); } },
      { id: 'merge', who: 'all', t: w => 'Cuando <b>' + nameOf(reviewerOf(w)) + '</b> apruebe la tuya, fusiónala', check: c => { const m = myMR(c, c.me, 'feature/sobre-'); return !!m && m.state === 'merged'; } },
      { id: 'clean', who: 'all', t: w => 'Actualiza main y borra tu rama local', hint: () => 'git switch main', check: c => synced(c) && !c.r.branches['feature/sobre-' + c.me] && WHO_KEYS.every(k => c.r.files['sobre-' + k + '.md'] !== undefined) }] },
  { n: 4, mod: 'm6', title: 'Un conflicto de verdad', intro: 'Marcos y Katherine cambian <b>la misma línea</b> de <code>horario.md</code> en ramas distintas. César revisa y fusiona. Cuando entre la primera, la segunda MR quedará con conflicto: su autora o autor lo resuelve combinando los dos cambios.',
    tasks: [
      { id: 'ap', who: 'marcos', t: () => 'En la rama <code>fix/horario-apertura</code>, cambia el horario a <i>7:00 a 4:00</i>, publica y abre la MR', hint: () => 'git switch -c fix/horario-apertura', check: c => !!myMR(c, 'marcos', 'fix/horario-apertura') },
      { id: 'ci', who: 'katherine', t: () => 'En la rama <code>fix/horario-cierre</code>, cambia el horario a <i>8:00 a 5:00</i>, publica y abre la MR', hint: () => 'git switch -c fix/horario-cierre', check: c => !!myMR(c, 'katherine', 'fix/horario-cierre') },
      { id: 'rv', who: 'cesar', t: () => 'Aprueba las dos MR (deja un comentario en cada una)', check: c => ['fix/horario-apertura', 'fix/horario-cierre'].every(s => { const m = c.mrs.find(x => x.source === s); return approvedBy(m, 'cesar'); }) },
      { id: 'res', who: 'marcos', t: () => 'Si tu MR quedó con conflicto: trae main a tu rama, combina en <i>7:00 a 5:00</i> y publica', hint: () => 'git switch main', check: c => /7:00 a 5:00/.test(mainTree(c)['horario.md'] || '') },
      { id: 'res', who: 'katherine', t: () => 'Si tu MR quedó con conflicto: trae main a tu rama, combina en <i>7:00 a 5:00</i> y publica', hint: () => 'git switch main', check: c => /7:00 a 5:00/.test(mainTree(c)['horario.md'] || '') },
      { id: 'mg', who: 'cesar', t: () => 'Fusiona las dos MR (la segunda, cuando ya no tenga conflicto)', check: c => ['fix/horario-apertura', 'fix/horario-cierre'].every(s => { const m = c.mrs.find(x => x.source === s); return m && m.state === 'merged'; }) },
      { id: 'sync', who: 'all', t: () => 'Actualiza tu main: <code>horario.md</code> dice <i>7:00 a 5:00</i>', hint: () => 'git pull', check: c => synced(c) && /7:00 a 5:00/.test(c.r.files['horario.md'] || '') }] },
  { n: 5, mod: 'm7', title: 'Botiquín en equipo', intro: 'Katherine publica un error a propósito, César lo anula con <code>git revert</code>, y Marcos, que tenía un cambio a medias, lo aparta con <code>git stash</code> para poder traer lo nuevo.',
    tasks: [
      { id: 'err', who: 'katherine', t: () => 'En main, agrega a <code>contacto.md</code> la línea <i>Teléfono: 000-0000 (prueba)</i>, commit <i>Prueba de teléfono</i> y push', hint: () => 'echo "Teléfono: 000-0000 (prueba)" >> contacto.md', check: c => onMain(c, cm => cm.msg === 'Prueba de teléfono' && authorIs(cm, 'katherine')) },
      { id: 'rev', who: 'cesar', t: () => 'Trae el cambio, busca el commit <i>Prueba de teléfono</i> y anúlalo con <code>git revert</code>; publica', hint: () => 'git pull', check: c => onMain(c, cm => /^Revert "Prueba de teléfono"/.test(cm.msg) && authorIs(cm, 'cesar')) },
      { id: 'stash', who: 'marcos', t: () => 'Agrega a <code>horario.md</code> <i>Sábados: 9:00 a 12:00</i> sin commit; apártalo con <code>git stash</code>, haz pull, recupéralo con <code>git stash pop</code>, y publícalo', hint: () => 'echo "Sábados: 9:00 a 12:00" >> horario.md', check: c => ranCmd(c, /^git stash( push)?/) && /Sábados/.test(mainTree(c)['horario.md'] || '') },
      { id: 'sync', who: 'all', t: () => 'Actualiza tu main: sin el teléfono de prueba y con los sábados', hint: () => 'git pull', check: c => synced(c) && !/000-0000/.test(c.r.files['contacto.md'] || '') && /Sábados/.test(c.r.files['horario.md'] || '') }] },
  { n: 6, mod: 'm10', title: 'Protejan main', intro: 'Marcos protege <code>main</code> en GitLab. Desde ahí, nadie puede hacer push directo: todo entra por Merge Request. Los tres lo comprueban.',
    tasks: [
      { id: 'prot', who: 'marcos', t: () => 'En el panel de GitLab, pestaña <b>Configuración</b>, activa <b>Proteger main</b>', check: c => !!(c.team && c.team.protected) },
      { id: 'try', who: 'all', t: () => 'Haz un commit en main e intenta publicarlo: GitLab lo rechaza', hint: () => 'echo "Prueba" >> README.md', check: c => !!c.flags.protRej },
      { id: 'undo', who: 'all', t: () => 'Deshaz tu commit local para quedar igual que GitLab', hint: () => 'git reset --hard origin/main', check: c => !!c.flags.protRej && synced(c) }] },
  { n: 7, mod: 'm12', title: 'Detectives del teléfono', intro: 'César cambia el teléfono "por error" en una MR. Katherine investiga con el historial y lo corrige en otra MR.',
    tasks: [
      { id: 'pie', who: 'cesar', t: () => 'Rama <code>fix/pie-de-pagina</code>: cambia <i>500-0000</i> por <i>500-1234</i> en contacto.md, commit <i>Actualiza pie de página</i>, publica y abre la MR', hint: () => "sed -i 's/500-0000/500-1234/' contacto.md", check: c => !!myMR(c, 'cesar', 'fix/pie-de-pagina') },
      { id: 'ok1', who: 'marcos', t: () => 'Aprueba la MR de César (sin notar el error, como pasa a veces)', check: c => approvedBy(c.mrs.find(m => m.source === 'fix/pie-de-pagina'), 'marcos') },
      { id: 'mg1', who: 'cesar', t: () => 'Fusiona tu MR', check: c => { const m = c.mrs.find(x => x.source === 'fix/pie-de-pagina'); return !!m && m.state === 'merged'; } },
      { id: 'inv', who: 'katherine', t: () => 'Trae lo nuevo y busca quién cambió el teléfono con <code>git log -S "500-0000"</code> y <code>git blame contacto.md</code>', hint: () => 'git log --oneline -S "500-0000"', check: c => ranCmd(c, /^git log.*-S/) && ranCmd(c, /^git blame/) },
      { id: 'fix', who: 'katherine', t: () => 'Rama <code>fix/telefono-contacto</code>: vuelve a <i>500-0000</i>, publica, abre la MR y fusiónala cuando César la apruebe', hint: () => 'git switch -c fix/telefono-contacto', check: c => { const m = myMR(c, 'katherine', 'fix/telefono-contacto'); return !!m && m.state === 'merged'; } },
      { id: 'ok2', who: 'cesar', t: () => 'Aprueba la corrección de Katherine', check: c => approvedBy(c.mrs.find(m => m.source === 'fix/telefono-contacto'), 'cesar') },
      { id: 'sync', who: 'all', t: () => 'Actualiza tu main: el teléfono vuelve a ser 500-0000', hint: () => 'git pull', check: c => synced(c) && /500-0000/.test(c.r.files['contacto.md'] || '') && !/500-1234/.test(c.r.files['contacto.md'] || '') }] },
  { n: 8, mod: 'm13', title: 'Primera versión', intro: 'César marca la primera versión estable. Marcos y Katherine la traen a su computadora.',
    tasks: [
      { id: 'tag', who: 'cesar', t: () => 'Actualiza main, crea la etiqueta anotada <code>v1.0.0</code> y publícala', hint: () => 'git tag -a v1.0.0 -m "Primera versión estable del sitio"', check: c => !!c.R.tags['v1.0.0'] },
      { id: 'see', who: 'marcos', t: () => 'Trae la etiqueta con <code>git fetch</code> y mírala con <code>git tag</code>', hint: () => 'git fetch', check: c => !!(c.r && c.r.tags['v1.0.0']) },
      { id: 'see', who: 'katherine', t: () => 'Trae la etiqueta con <code>git fetch</code> y mírala con <code>git tag</code>', hint: () => 'git fetch', check: c => !!(c.r && c.r.tags['v1.0.0']) }] },
  { n: 9, mod: 'm14', title: 'Proyecto final: un issue cada quien', intro: 'Cada quien toma un issue y lo lleva de principio a fin, con <code>main</code> protegida: <b>Marcos #7</b> preguntas frecuentes (<code>faq.md</code>), <b>Katherine #8</b> servicios (<code>servicios.md</code>), <b>César #9</b> ubicación (<code>ubicacion.md</code>). Las revisiones siguen en cadena.',
    tasks: [
      { id: 'mr', who: 'all', t: w => 'Rama <code>docs/' + ISSUE[w][0] + '-' + ISSUE[w][1] + '</code>, crea <code>' + ISSUE[w][2] + '</code>, commit con <code>(#' + ISSUE[w][0] + ')</code>, publica y abre la MR', hint: w => 'git switch -c docs/' + ISSUE[w][0] + '-' + ISSUE[w][1], check: c => !!myMR(c, c.me, 'docs/' + ISSUE[c.me][0] + '-') },
      { id: 'rev', who: 'all', t: w => 'Revisa y aprueba la MR de <b>' + nameOf(REVIEWS[w]) + '</b>, con un comentario', check: c => { const m = myMR(c, REVIEWS[c.me], 'docs/'); return approvedBy(m, c.me) && commentedBy(c, m, c.me); } },
      { id: 'mg', who: 'all', t: () => 'Fusiona tu MR cuando esté aprobada', check: c => { const m = myMR(c, c.me, 'docs/'); return !!m && m.state === 'merged'; } },
      { id: 'fin', who: 'all', t: () => 'Actualiza main, borra tu rama y comprueba que están los tres archivos', hint: () => 'git switch main', check: c => synced(c) && ['faq.md', 'servicios.md', 'ubicacion.md'].every(f => c.r.files[f] !== undefined) && !Object.keys(c.r.branches).some(b => b.startsWith('docs/')) }] }
];
const ISSUE = { marcos: [7, 'preguntas-frecuentes', 'faq.md'], katherine: [8, 'servicios', 'servicios.md'], cesar: [9, 'ubicacion', 'ubicacion.md'] };
const STAGE_OF_MODULE = Object.fromEntries(TEAM_STAGES.map(s => [s.mod, s]));
const tasksFor = (s, w) => s.tasks.filter(t => t.who === 'all' || t.who === w);

/* ---------- base de datos de demostración (solo este navegador) ---------- */
function memoryDb() {
  const docs = new Map(), subs = new Set(), leases = new Map();
  const snapDoc = (path) => { const d = docs.get(path); return { id: path.split('/').pop(), exists: !!d, data: () => d ? JSON.parse(JSON.stringify(d)) : undefined, metadata: { fromCache: false, hasPendingWrites: false } }; };
  const notify = () => subs.forEach(f => f());
  const tick = f => setTimeout(f, 0);
  const ref = path => ({
    id: path.split('/').pop(), path,
    get: async () => snapDoc(path),
    set: async (d) => { docs.set(path, JSON.parse(JSON.stringify(d))); tick(notify); },
    update: async (d) => { const cur = docs.get(path); if (!cur) throw { code: 'invalid_argument', message: 'missing' }; const merge = (a, b) => { for (const k in b) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } }; merge(cur, JSON.parse(JSON.stringify(d))); tick(notify); },
    delete: async () => { docs.delete(path); tick(notify); },
    acquire: async ({ holder, ttlMs }) => { const l = leases.get(path); const now = Date.now(); if (l && l.until > now && l.holder !== holder) return { acquired: false }; leases.set(path, { holder, until: now + (ttlMs || 30000) }); if (!docs.has(path)) docs.set(path, {}); return { acquired: true, holder }; },
    onSnapshot: (next) => { const f = () => next(snapDoc(path)); subs.add(f); tick(f); return () => subs.delete(f); },
    collection: (p) => coll(path + '/' + p)
  });
  const coll = (path, opts = {}) => {
    const run = () => { let list = [...docs.keys()].filter(k => k.startsWith(path + '/') && k.split('/').length === path.split('/').length + 1).map(snapDoc); if (opts.order) { const [f, dir] = opts.order; list.sort((a, b) => ((a.data()[f] ?? Infinity) - (b.data()[f] ?? Infinity)) * (dir === 'desc' ? -1 : 1)); } if (opts.limit) list = list.slice(0, opts.limit); return { docs: list, size: list.length, empty: !list.length, docChanges: () => [], metadata: { fromCache: false, hasPendingWrites: false } }; };
    return {
      path, doc: (id) => ref(path + '/' + (id || Math.random().toString(36).slice(2))),
      add: async (d) => { const r = ref(path + '/' + Math.random().toString(36).slice(2)); await r.set(d); return r; },
      get: async () => run(), orderBy: (f, dir) => coll(path, { ...opts, order: [f, dir] }), limit: (n) => coll(path, { ...opts, limit: n }), where: () => coll(path, opts),
      onSnapshot: (next) => { const f = () => next(run()); subs.add(f); tick(f); return () => subs.delete(f); }
    };
  };
  return { doc: ref, collection: (p) => coll(p) };
}

/* ---------- el laboratorio de un integrante ---------- */
class TeamLab {
  constructor(db, code, who, uid, el, opts = {}) {
    Object.assign(this, { db, code, who, uid, el, opts });
    this.holder = uid + ':' + Math.random().toString(36).slice(2, 8);
    this.team = null; this.mrs = []; this.comments = []; this.progress = {}; this.events = [];
    this.server = new Set(); this.q = Promise.resolve(); this.pq = Promise.resolve();
    this.stage = opts.stage || 1; this.myDone = {}; this.unsubs = []; this.loaded = {};
    this.sim = new Sim(); this.sim.realTime = true;
    this.R = this.sim.remotes[PROJECT_URL] = { branches: {}, tags: {}, protected: false };
    this.flags = { cmds: [] };
    this.sim.onRemoteWrite = ev => { this.q = this.q.then(() => this.remoteWrite(ev)).catch(e => this.note('⚠ No se pudo guardar en GitLab (' + esc(e.code || e.message || e) + '). Vuelve a intentar el comando.')); };
  }
  col(n) { return this.db.doc('teams/' + this.code).collection(n); }
  async lease(ref) { for (let i = 0; i < 12; i++) { const l = await ref.acquire({ holder: this.holder, ttlMs: 1000 }); if (l.acquired) return true; await new Promise(r => setTimeout(r, 200 + Math.random() * 250)); } return false; }
  storeKey() { return 'gsm-team-' + this.code + '-' + this.who; }
  saveLocal() {
    if (this.opts.noStorage) return;
    const s = this.sim, r = s.repos[PROJ];
    const local = r ? [...new Set([...Object.values(r.branches), ...r.reflog.map(x => x.id), ...Object.values(r.rt)].filter(Boolean).flatMap(id => [...s.ancestors(id)]))].filter(id => !this.server.has(id)) : [];
    const data = { user: s.user, config: s.config, cwd: s.cwd, repo: r || null, commits: Object.fromEntries(local.map(id => [id, s.commits[id]])), flags: { protRej: this.flags.protRej, cmds: this.flags.cmds.slice(-60) } };
    try { localStorage.setItem(this.storeKey(), JSON.stringify(data)); } catch (e) {}
  }
  loadLocal() {
    if (this.opts.noStorage) return;
    let d = null; try { d = JSON.parse(localStorage.getItem(this.storeKey())); } catch (e) {}
    if (!d) return;
    const s = this.sim; s.user = d.user || s.user; s.config = d.config || {}; Object.assign(s.commits, d.commits || {});
    if (d.repo) { s.repos[PROJ] = d.repo; s.cwd = d.cwd || '~'; }
    this.flags = Object.assign({ cmds: [] }, d.flags || {});
  }
  relane() { const r = this.sim.repos[PROJ]; Object.values(this.sim.commits).forEach(c => { c.lane = r ? this.sim.laneOf(r, c.bname || 'main') : (c.bname === 'main' || !c.bname ? 0 : 1); }); }
  ctx() { return { sim: this.sim, r: this.sim.repos[PROJ] || null, R: this.R, mrs: this.mrs, comments: this.comments, me: this.who, team: this.team, flags: this.flags }; }

  /* conectar con el GitLab del equipo */
  async start() {
    const L = (name, ref, fn) => { this.unsubs.push(ref.onSnapshot(s => { fn(s); this.loaded[name] = true; this.changed(); }, e => this.note('⚠ Se perdió la conexión con GitLab (' + esc(e.code) + '). Recarga la página.'))); };
    L('team', this.db.doc('teams/' + this.code), s => { this.team = s.exists ? s.data() : null; this.R.protected = !!(this.team && this.team.protected); });
    L('commits', this.col('commits'), q => q.docs.forEach(d => { const c = d.data(); this.server.add(d.id); if (!this.sim.commits[d.id]) this.sim.commits[d.id] = Object.assign({ lane: 0 }, c, { id: d.id }); }));
    L('refs', this.col('refs'), q => { this.R.branches = Object.fromEntries(q.docs.map(d => [decRef(d.id), d.data().id])); });
    L('tags', this.col('tags'), q => { this.R.tags = Object.fromEntries(q.docs.map(d => [decRef(d.id), d.data()])); });
    L('mrs', this.col('mrs'), q => { this.mrs = q.docs.map(d => Object.assign({ id: d.id }, d.data())).sort((a, b) => a.createdAt - b.createdAt); this.mrs.forEach((m, i) => { m.num = i + 1; }); });
    L('comments', this.col('comments'), q => { this.comments = q.docs.map(d => Object.assign({ id: d.id }, d.data())).sort((a, b) => a.at - b.at); });
    L('progress', this.col('progress'), q => { this.progress = Object.fromEntries(q.docs.map(d => [d.id, d.data()])); if (this.progress[this.who]) this.myDone = Object.assign({}, this.progress[this.who].done || {}, this.myDone); });
    L('events', this.col('events').orderBy('at', 'desc').limit(30), q => { this.events = q.docs.map(d => d.data()); });
    this.loadLocal();
  }
  stop() { this.unsubs.forEach(u => u()); }
  ready() { return ['team', 'commits', 'refs', 'tags', 'mrs', 'comments', 'progress'].every(k => this.loaded[k]); }

  async event(text) { try { await this.col('events').add({ who: this.who, text, at: Date.now() }); } catch (e) {} }
  note(html) { if (this.ui && this.ui.print) this.ui.print('<span class="note">' + html + '</span>'); }

  /* lo que la terminal publica en GitLab */
  async remoteWrite(ev) {
    const s = this.sim, r = s.repos[PROJ];
    if (ev.type === 'push') {
      for (const id of s.ancestors(ev.to)) if (!this.server.has(id)) { const c = s.commits[id]; await this.col('commits').doc(id).set({ msg: c.msg, tree: c.tree, parents: c.parents, author: c.author, n: c.n, date: c.date, bname: c.bname || 'main' }); this.server.add(id); }
      const ref = this.col('refs').doc(encRef(ev.branch));
      const leased = await this.lease(ref);
      const snap = await ref.get(); const cur = snap.exists && snap.data().id ? snap.data().id : null;
      const prot = ev.branch === 'main' && this.team && this.team.protected;
      if (!leased || prot || (cur !== ev.from && cur !== ev.to)) {
        if (cur) this.R.branches[ev.branch] = cur; else delete this.R.branches[ev.branch];
        if (r) { if (ev.prevRt) r.rt[ev.branch] = ev.prevRt; else delete r.rt[ev.branch]; }
        this.note(prot ? '⚠ GitLab rechazó tu push: <b>main está protegida</b>.' : '⚠ <b>GitLab rechazó tu push a ' + esc(ev.branch) + '</b>: alguien del equipo publicó ahí justo antes que tú. Haz <code>git pull</code> y vuelve a intentar.');
        if (prot) this.flags.protRej = true;
        this.saveLocal(); this.changed(); return;
      }
      await ref.set({ id: ev.to, by: this.who, at: Date.now() });
      const n = [...s.ancestors(ev.to)].filter(x => !ev.from || !s.ancestors(ev.from).has(x)).length;
      this.event(nameOf(this.who) + ' publicó ' + n + ' commit' + (n === 1 ? '' : 's') + ' en ' + ev.branch);
    } else if (ev.type === 'delete') {
      await this.col('refs').doc(encRef(ev.branch)).delete(); this.event(nameOf(this.who) + ' borró la rama ' + ev.branch + ' en GitLab');
    } else if (ev.type === 'tags') {
      for (const [t, v] of ev.list) { await this.col('tags').doc(encRef(t)).set(Object.assign({}, v, { by: this.who })); for (const id of s.ancestors(v.id)) if (!this.server.has(id)) { const c = s.commits[id]; await this.col('commits').doc(id).set({ msg: c.msg, tree: c.tree, parents: c.parents, author: c.author, n: c.n, date: c.date, bname: c.bname || 'main' }); this.server.add(id); } }
      this.event(nameOf(this.who) + ' publicó la etiqueta ' + ev.list.map(x => x[0]).join(', '));
    }
  }

  /* acciones de GitLab (panel) */
  async createMR(source, title, desc) {
    if (this.mrs.some(m => m.source === source && m.state === 'open')) throw new Error('Ya hay una Merge Request abierta desde esa rama.');
    await this.col('mrs').add({ source, target: 'main', title, desc, author: this.who, state: 'open', approvals: {}, createdAt: Date.now() });
    this.event(nameOf(this.who) + ' abrió una Merge Request: ' + title);
  }
  async comment(mr, kind, text) { await this.col('comments').add({ mr: mr.id, who: this.who, kind, text, at: Date.now() }); this.event(nameOf(this.who) + ' comentó en !' + mr.num); }
  async approve(mr) { await this.col('mrs').doc(mr.id).update({ approvals: { [this.who]: true } }); this.event(nameOf(this.who) + ' aprobó !' + mr.num); }
  mergeInfo(mr) {
    const s = this.sim, m = this.R.branches.main, b = this.R.branches[mr.source];
    if (mr.state !== 'open') return { ok: false };
    if (!b) return { ok: false, why: 'La rama ' + mr.source + ' ya no existe en GitLab.' };
    if (!m) return { ok: false, why: 'GitLab todavía no tiene main.' };
    const base = s.mergeBase(m, b), B = s.tree(base), O = s.tree(m), T = s.tree(b), tree = {}; let conflict = [];
    new Set([...Object.keys(O), ...Object.keys(T)]).forEach(f => { const x = merge3(B[f], O[f], T[f], 'main', mr.source); if (x.conflict) conflict.push(f); else if (x.text !== undefined) tree[f] = x.text; });
    const approvals = Object.keys(mr.approvals || {}).filter(k => mr.approvals[k] && k !== mr.author);
    if (conflict.length) return { ok: false, conflict, why: 'Tiene conflictos con main en ' + conflict.join(', ') + '. Trae main a tu rama (git switch main, git pull, git switch ' + mr.source + ', git merge main), resuélvelos y publica.' };
    if (!approvals.length) return { ok: false, why: 'Necesita la aprobación de alguien que no sea quien la abrió.' };
    return { ok: true, tree, m, b };
  }
  async merge(mr) {
    const info = this.mergeInfo(mr); if (!info.ok) throw new Error(info.why || 'No se puede fusionar.');
    const ref = this.col('refs').doc('main');
    const leased = await this.lease(ref); const snap = await ref.get();
    if (!leased || (snap.exists ? snap.data().id : null) !== info.m) throw new Error('main cambió justo ahora. Vuelve a intentarlo.');
    const id = rid(); const c = { msg: "Merge branch '" + mr.source + "' into 'main'", tree: info.tree, parents: [info.m, info.b], author: nameOf(this.who) + ' <' + TEAM[this.who].mail + '>', n: Date.now() * 100, date: new Date().toISOString(), bname: 'main' };
    await this.col('commits').doc(id).set(c); this.server.add(id);
    await ref.set({ id, by: this.who, at: Date.now() });
    await this.col('refs').doc(encRef(mr.source)).delete();
    await this.col('mrs').doc(mr.id).update({ state: 'merged', mergedBy: this.who, mergedAt: Date.now() });
    this.event(nameOf(this.who) + ' fusionó !' + mr.num + ' en main');
  }
  async setProtected(v) { await this.db.doc('teams/' + this.code).update({ protected: !!v }); this.event(nameOf(this.who) + (v ? ' protegió' : ' desprotegió') + ' main'); }

  /* comprobar tareas y guardar el avance del equipo */
  check() {
    if (!this.ready()) return;
    const c = this.ctx(); let changed = false;
    TEAM_STAGES.forEach(s => tasksFor(s, this.who).forEach(t => { const k = s.n + '-' + t.id; if (!this.myDone[k]) { let ok = false; try { ok = t.check(c); } catch (e) {} if (ok) { this.myDone[k] = true; changed = true; } } }));
    if (changed) { const done = Object.assign({}, this.myDone); this.pq = this.pq.then(() => this.col('progress').doc(this.who).set({ done, at: Date.now() })).catch(() => {}); }
    return changed;
  }
  changed() { this.relane(); this.check(); if (this.ui) this.ui.refresh(); }
  run(line) {
    const res = this.sim.run(line);
    const cmd = nm(line).trim().replace(/\s+/g, ' ');
    if (cmd) this.flags.cmds.push(cmd);
    if (res.protectedReject) this.flags.protRej = true;
    this.saveLocal(); this.changed();
    return res;
  }
}

/* ---------- unirse a un equipo ---------- */
async function joinTeam(db, code, who, uid) {
  const tdoc = db.doc('teams/' + code); const holder = uid + ':join';
  let lease = { acquired: false };
  for (let i = 0; i < 8 && !lease.acquired; i++) { lease = await tdoc.acquire({ holder, ttlMs: 1500 }); if (!lease.acquired) await new Promise(r => setTimeout(r, 400 + Math.random() * 300)); }
  if (!lease.acquired) throw new Error('El equipo está ocupado un momento. Vuelve a intentarlo.');
  const snap = await tdoc.get(); const data = snap.exists ? snap.data() : null;
  const members = (data && data.members) || {};
  if (members[who] && members[who] !== uid) throw new Error(nameOf(who) + ' ya está en el equipo «' + code + '» con otra cuenta. Elige otra persona o revisa el nombre del equipo.');
  if (!data || !data.created) {
    await tdoc.set({ created: Date.now(), createdBy: who, members: { [who]: uid }, protected: false });
    const col = n => tdoc.collection(n); const a = nameOf(who) + ' <' + TEAM[who].mail + '>';
    const t0 = Date.now() * 100;
    const c1 = { msg: 'Initial commit', tree: { 'README.md': '# sitio-oficina\n\nPágina web de la oficina.\n' }, parents: [], author: a, n: t0, date: new Date().toISOString(), bname: 'main' };
    const c2 = { msg: 'Agrega página de contacto', tree: { 'README.md': c1.tree['README.md'], 'contacto.md': '# Contacto\n\nTeléfono: 500-0000\n' }, author: a, n: t0 + 1, date: new Date().toISOString(), bname: 'main' };
    const id1 = rid(), id2 = rid(); c2.parents = [id1];
    await col('commits').doc(id1).set(c1); await col('commits').doc(id2).set(c2);
    await col('refs').doc('main').set({ id: id2, by: who, at: Date.now() });
    await col('events').add({ who, text: nameOf(who) + ' creó el equipo y el proyecto sitio-oficina en GitLab', at: Date.now() });
  } else {
    await tdoc.update({ members: { [who]: uid } });
    if (!members[who]) await tdoc.collection('events').add({ who, text: nameOf(who) + ' se unió al equipo', at: Date.now() });
  }
}

/* ---------- interfaz de la página ---------- */
function teamUI(lab, root) {
  root.innerHTML = '';
  const AVC = { marcos: 'var(--teal)', katherine: 'var(--accent)', cesar: 'var(--gold)' };
  const av = (w, size = 26) => h('span', { style: 'flex:none;width:' + size + 'px;height:' + size + 'px;border-radius:50%;display:inline-grid;place-items:center;color:#fff;font:700 ' + (size / 32) + 'rem var(--f-display);background:' + AVC[w] }, nameOf(w)[0]);
  const membersEl = h('div', { class: 'row', style: 'gap:14px' });
  const stageBar = h('div', { class: 'row', style: 'gap:6px' });
  const stageEl = h('section', { class: 'block act' });
  // terminal
  const out = h('div', { class: 'out', 'aria-live': 'polite' });
  const input = h('input', { id: 'team-term-' + lab.who, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Escribe un comando' });
  const ps = h('span', { class: 'ps' });
  const term = h('div', { class: 'term' }, h('div', { class: 'tbar' }, h('i'), h('i'), h('i'), h('span', null, 'Computadora de ' + nameOf(lab.who) + ' · tu terminal')), out, h('label', { class: 'inrow', for: 'team-term-' + lab.who }, ps, input));
  const viz = h('div', { class: 'viz' });
  const panel = h('section', { class: 'block' });
  const print = html => { out.append(h('div', { html })); out.scrollTop = out.scrollHeight; };
  const hist = []; let hp = 0;
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const v = input.value; input.value = ''; if (v.trim()) { hist.push(v); hp = hist.length; } print('<span class="g">' + esc(ps.textContent) + '</span> <span class="echo">' + esc(v) + '</span>'); const res = lab.run(v); if (res.clear) out.innerHTML = ''; else { if (res.out) print(res.out); if (res.note) print('<span class="note">' + res.note + '</span>'); } }
    else if (e.key === 'ArrowUp') { if (hp > 0) { hp--; input.value = hist[hp]; } e.preventDefault(); }
    else if (e.key === 'ArrowDown') { if (hp < hist.length) { hp++; input.value = hist[hp] || ''; } e.preventDefault(); }
  });
  let tab = 'mr';
  const refresh = () => {
    const s = lab.sim, r = s.repos[PROJ];
    ps.textContent = s.cwd + (r ? ' (' + (r.detached ? 'HEAD' : r.head) + ')' : '') + ' $';
    // integrantes
    membersEl.innerHTML = '';
    WHO_KEYS.forEach(w => { const inTeam = lab.team && lab.team.members && lab.team.members[w]; const p = lab.progress[w]; const done = p ? Object.keys(p.done || {}).length : 0; membersEl.append(h('span', { class: 'row', style: 'gap:6px;opacity:' + (inTeam ? 1 : .5) }, av(w), h('span', { style: 'font-size:.88rem' }, h('b', null, nameOf(w) + (w === lab.who ? ' (tú)' : '')), h('br'), h('small', { class: 'muted' }, inTeam ? done + ' tareas hechas' : 'todavía no se une')))); });
    // etapas
    stageBar.innerHTML = '';
    TEAM_STAGES.forEach(st => { const all = WHO_KEYS.every(w => tasksFor(st, w).every(t => lab.progress[w] && lab.progress[w].done && lab.progress[w].done[st.n + '-' + t.id])); stageBar.append(h('button', { class: 'pick' + (st.n === lab.stage ? ' sel' : ''), type: 'button', title: st.title, onclick: () => { lab.stage = st.n; refresh(); } }, (all ? '✓ ' : '') + 'Etapa ' + st.n)); });
    const st = TEAM_STAGES[lab.stage - 1];
    stageEl.innerHTML = '';
    stageEl.append(h('div', { class: 'kind' }, h('i', null, '👥'), 'Etapa ' + st.n + ' de ' + TEAM_STAGES.length + ' · después del módulo ' + MODULES.find(m => m.id === st.mod).n), h('h2', null, st.title), h('p', { html: st.intro }));
    const cols = h('div', { class: 'grid2' });
    WHO_KEYS.forEach(w => {
      const done = (lab.progress[w] && lab.progress[w].done) || {}; const mine = w === lab.who;
      const ul = h('ol', { style: 'list-style:none;padding:0;margin:6px 0 0;display:grid;gap:6px' });
      tasksFor(st, w).forEach(t => { const ok = mine ? lab.myDone[st.n + '-' + t.id] : done[st.n + '-' + t.id]; ul.append(h('li', { style: 'display:flex;gap:8px;font-size:.88rem;line-height:1.4;margin:0' }, h('span', { style: 'flex:none;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;font-size:.65rem;border:1.5px solid ' + (ok ? 'var(--ok)' : 'var(--gold)') + ';background:' + (ok ? 'var(--ok)' : 'transparent') + ';color:#fff' }, ok ? '✓' : ''), h('span', null, h('span', { html: t.t(w) }), mine && !ok && t.hint ? h('button', { class: 'chipbtn', type: 'button', style: 'margin-left:6px;padding:.05rem .45rem;font-size:.72rem', onclick: () => { input.value = t.hint(w); input.focus(); } }, 'pista') : null))); });
      cols.append(h('div', { class: 'mini', style: mine ? 'border-color:var(--teal);background:var(--teal-soft)' : '' }, h('b', { class: 'row', style: 'gap:8px' }, av(w, 22), nameOf(w) + (mine ? ' (tú)' : '')), ul));
    });
    stageEl.append(cols);
    const allDone = WHO_KEYS.every(w => tasksFor(st, w).every(t => lab.progress[w] && lab.progress[w].done && lab.progress[w].done[st.n + '-' + t.id]));
    if (allDone) { stageEl.append(h('div', { class: 'fb good', html: '<b>¡Etapa completada por los tres!</b>' + (st.n < TEAM_STAGES.length ? ' Sigan con la etapa ' + (st.n + 1) + ' cuando terminen el módulo ' + MODULES.find(m => m.id === TEAM_STAGES[st.n].mod).n + '.' : ' Terminaron el proyecto en equipo.') })); if (lab.opts.onStageDone) lab.opts.onStageDone(st.n); }
    // mapa local
    renderViz(s, viz, {});
    // panel GitLab
    renderPanel();
  };
  const renderPanel = () => {
    const keep = {}; panel.querySelectorAll('[data-k]').forEach(x => { keep[x.dataset.k] = x.tagName === 'DETAILS' ? x.open : x.value; }); const focus = document.activeElement && panel.contains(document.activeElement) ? document.activeElement.dataset.k : null;
    panel.innerHTML = '';
    const tabs = h('div', { class: 'row', style: 'gap:6px' });
    [['mr', 'Merge Requests'], ['act', 'Actividad'], ['repo', 'Repositorio'], ['cfg', 'Configuración']].forEach(([k, l]) => tabs.append(h('button', { class: 'btn' + (tab === k ? '' : ' ghost'), type: 'button', style: 'padding:.4rem .8rem;font-size:.85rem', onclick: () => { tab = k; renderPanel(); } }, l + (k === 'mr' ? ' (' + lab.mrs.filter(m => m.state === 'open').length + ')' : ''))));
    panel.append(h('div', { class: 'kind' }, h('i', null, '🦊'), 'GitLab del equipo · compartido en vivo'), tabs);
    const restore = () => { panel.querySelectorAll('[data-k]').forEach(x => { if (x.dataset.k in keep) { if (x.tagName === 'DETAILS') x.open = keep[x.dataset.k]; else if ([...(x.options || [])].length === 0 || [...x.options].some(o => o.value === keep[x.dataset.k])) x.value = keep[x.dataset.k]; } if (focus && x.dataset.k === focus) x.focus(); }); };
    const err = h('div', { class: 'fb badfb', hidden: true });
    const act = (fn) => async () => { err.hidden = true; try { await fn(); } catch (e) { err.hidden = false; err.textContent = e.message || String(e.code || e); } };
    if (tab === 'mr') {
      const branches = Object.keys(lab.R.branches).filter(b => b !== 'main' && !lab.mrs.some(m => m.source === b && m.state === 'open'));
      const src = h('select', { class: 'fillin', id: 'mr-src-' + lab.who, 'data-k': 'src' }, branches.length ? branches.map(b => h('option', null, b)) : h('option', { value: '' }, '(publica una rama primero)'));
      const title = h('input', { class: 'fillin', id: 'mr-title-' + lab.who, 'data-k': 'title', placeholder: 'Título: empieza con un verbo, p. ej. Agrega sección Sobre mí' });
      const desc = h('textarea', { class: 'fillin', id: 'mr-desc-' + lab.who, 'data-k': 'desc' }); desc.value = '## Qué cambia\n\n## Por qué\n\n## Cómo probarlo\n';
      panel.append(h('details', { 'data-k': 'newmr' }, h('summary', { style: 'cursor:pointer;font-weight:600' }, '+ Nueva Merge Request'), h('div', { class: 'q', style: 'margin-top:8px' }, h('label', null, 'Rama origen → main', src), title, desc, h('button', { class: 'btn', type: 'button', onclick: act(async () => { if (!src.value) throw new Error('No hay ninguna rama publicada. Haz git push -u origin tu-rama.'); if (title.value.trim().split(/\s+/).length < 3) throw new Error('Escribe un título claro, de al menos tres palabras.'); await lab.createMR(src.value, title.value.trim(), desc.value); title.value = ''; delete keep.title; }) }, 'Crear Merge Request'))), err);
      if (!lab.mrs.length) panel.append(h('p', { class: 'muted' }, 'Todavía no hay Merge Requests en el equipo.'));
      lab.mrs.slice().reverse().forEach(m => {
        const info = lab.mergeInfo(m); const ap = Object.keys(m.approvals || {}).filter(k => m.approvals[k]);
        const card = h('div', { class: 'mrcard' }, h('div', { class: 'mrh' }, h('b', null, '!' + m.num + ' ' + m.title), h('span', { class: 'state ' + (m.state === 'merged' ? 'merged' : 'open') }, m.state === 'merged' ? 'Merged' : 'Open')),
          h('div', { class: 'muted', style: 'font-size:.85rem' }, nameOf(m.author) + ' quiere fusionar ', h('code', null, m.source), ' en ', h('code', null, 'main') + ''),
          m.desc ? h('pre', { class: 'cmd', style: 'white-space:pre-wrap' }, m.desc) : null,
          h('div', { style: 'font-size:.85rem' }, 'Aprobada por: ' + (ap.length ? ap.map(nameOf).join(', ') : 'nadie todavía')));
        lab.comments.filter(x => x.mr === m.id).forEach(x => card.append(h('div', { class: 'comment' }, h('b', null, nameOf(x.who)), ' · ', h('i', null, x.kind), h('br'), x.text)));
        if (m.state === 'open') {
          const kind = h('select', { class: 'fillin', style: 'flex:0 1 150px', 'aria-label': 'Tipo de comentario', 'data-k': 'k-' + m.id }, ['Sugerencia', 'Bloqueante', 'Detalle', 'Pregunta', 'Elogio'].map(k => h('option', null, k)));
          const txt = h('input', { class: 'fillin', placeholder: 'Comentario sobre el cambio, no sobre la persona', 'aria-label': 'Comentario', 'data-k': 'c-' + m.id });
          card.append(h('div', { class: 'fillrow' }, kind, txt, h('button', { class: 'btn ghost', type: 'button', onclick: act(async () => { if (txt.value.trim().length < 3) throw new Error('Escribe el comentario.'); await lab.comment(m, kind.value, txt.value.trim()); txt.value = ''; delete keep['c-' + m.id]; }) }, 'Comentar')));
          const row = h('div', { class: 'row' });
          if (m.author !== lab.who && !(m.approvals || {})[lab.who]) row.append(h('button', { class: 'btn teal', type: 'button', onclick: act(() => lab.approve(m)) }, '✓ Aprobar'));
          row.append(h('button', { class: 'btn', type: 'button', disabled: !info.ok, onclick: act(() => lab.merge(m)) }, 'Merge'));
          card.append(row); if (!info.ok && info.why) card.append(h('div', { class: 'fb ' + (info.conflict ? 'badfb' : 'info'), style: 'font-size:.85rem' }, info.why));
        }
        panel.append(card);
      });
    } else if (tab === 'act') {
      panel.append(lab.events.length ? h('ul', { class: 'checklist' }, lab.events.map(e => h('li', { class: 'row', style: 'gap:8px;font-size:.9rem' }, av(e.who, 20), h('span', null, e.text), h('small', { class: 'muted' }, new Date(e.at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }))))) : h('p', { class: 'muted' }, 'Sin actividad todavía.'));
    } else if (tab === 'repo') {
      const T = lab.sim.tree(lab.R.branches.main);
      panel.append(h('p', { class: 'muted', style: 'margin:0' }, 'Así está ', h('code', null, 'main'), ' en GitLab ahora mismo. Tu computadora solo lo ve después de ', h('code', null, 'git pull'), ' o ', h('code', null, 'git fetch'), '.'));
      panel.append(h('div', { class: 'zone' }, h('h4', null, 'Archivos en main'), h('ul', null, Object.keys(T).sort().map(f => h('li', null, f)))));
      const g = h('div', { class: 'graphbox' }, h('h4', null, 'Historial en GitLab (todas las ramas)')); g.append(drawGraph(lab.sim, { branches: lab.R.branches, rt: {}, tags: lab.R.tags, detached: null, head: 'main' })); panel.append(g);
    } else {
      const cb = h('input', { type: 'checkbox', id: 'prot-' + lab.who }); cb.checked = !!lab.R.protected;
      cb.onchange = act(() => lab.setProtected(cb.checked));
      panel.append(h('label', { for: 'prot-' + lab.who, style: 'display:flex;gap:10px;align-items:center' }, cb, h('span', null, h('b', null, 'Proteger main'), h('br'), h('small', { class: 'muted' }, 'Nadie puede hacer push directo a main; todo entra por Merge Request.'))), err);
    }
    restore();
  };
  lab.ui = { refresh, print };
  root.append(h('section', { class: 'block' }, h('div', { class: 'kind' }, h('i', null, '👥'), 'Equipo «' + lab.code + '»'), membersEl), stageBar, stageEl,
    h('div', { class: 'lab' }, term, viz), panel);
  print('<span class="m">Esta es tu computadora: lo que hagas aquí solo lo ves tú hasta que hagas push. Lo que publiquen tus compañeros lo traes con git pull.</span>');
  if (lab.sim.repos[PROJ]) print('<span class="note">Retomas tu trabajo donde lo dejaste en este navegador.</span>');
  refresh();
}

async function getTeamDb() {
  if (!window.claude || !window.claude.use) return null;
  try { const db = await window.claude.use('db'); const user = await window.claude.use('user'); let uid = user ? await user.id() : null; return db ? { db, uid, user } : null; } catch (e) { return null; }
}
let CURRENT_LAB = null;
function renderTeamPage(stageN) {
  view.append(h('header', { class: 'lhead' }, h('span', { class: 'eyebrow' }, 'Proyecto en equipo · los tres a la vez'), h('h1', null, 'sitio-oficina en equipo'),
    h('p', { class: 'lead' }, 'Marcos, Katherine y César trabajan al mismo tiempo, cada quien desde su dispositivo, sobre el mismo GitLab. Lo que uno publica, los otros lo ven en vivo y lo traen con git pull.')));
  if (!hasWho()) { view.append(teamBlock('Primero elige quién eres. Cada integrante del equipo elige a una persona distinta.')); return; }
  const box = h('div', { style: 'display:flex;flex-direction:column;gap:22px' }); view.append(box);
  let last = ''; try { last = localStorage.getItem('gsm-team-code') || ''; } catch (e) {}
  const codeIn = h('input', { class: 'fillin', id: 'team-code', placeholder: 'nombre-del-equipo', value: last, autocomplete: 'off', autocapitalize: 'off', style: 'font-family:var(--f-mono)' });
  const msg = h('div', { class: 'fb info', html: 'Pónganse de acuerdo en un nombre de equipo (por ejemplo <code>equipo-1</code>) y escríbanlo los tres igual. El primero que entre crea el proyecto en GitLab.' });
  const go = h('button', { class: 'btn', type: 'button' }, 'Entrar al equipo como ' + me().name);
  const joinBox = h('section', { class: 'block' }, h('h2', null, 'Entra a tu equipo'), msg, h('div', { class: 'fillrow' }, codeIn, go));
  box.append(joinBox);
  const start = async (demo) => {
    const code = codeIn.value.trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]{1,30}$/.test(code)) { msg.className = 'fb badfb'; msg.textContent = 'Usa solo minúsculas, números y guiones (por ejemplo equipo-1).'; return; }
    go.disabled = true; msg.className = 'fb info'; msg.textContent = 'Conectando con el GitLab del equipo…';
    let conn = demo ? null : await getTeamDb();
    if (!conn) { if (!demo) { msg.className = 'fb badfb'; msg.innerHTML = 'Esta vista no puede guardar datos compartidos. Abre el curso desde su enlace en claude.ai con una cuenta que tenga acceso de <b>colaborador</b>. Mientras tanto puedes probar el modo demostración (solo en este navegador).'; go.disabled = false; return; } conn = { db: memoryDb(), uid: 'demo' }; }
    let uid = conn.uid; if (!uid) { try { uid = localStorage.getItem('gsm-team-uid'); if (!uid) { uid = 'u' + Math.random().toString(36).slice(2, 10); localStorage.setItem('gsm-team-uid', uid); } } catch (e) { uid = 'u' + Math.random().toString(36).slice(2, 10); } }
    try { await joinTeam(conn.db, code, WHO, uid); } catch (e) { msg.className = 'fb badfb'; msg.textContent = e.message || ('No se pudo entrar (' + (e.code || e) + '). Si dice invalid_argument, pide a quien publicó el curso acceso de colaborador.'); go.disabled = false; return; }
    try { localStorage.setItem('gsm-team-code', code); } catch (e) {}
    if (CURRENT_LAB) CURRENT_LAB.stop();
    const lab = CURRENT_LAB = new TeamLab(conn.db, code, WHO, uid, null, { stage: stageN || 1, noStorage: demo });
    joinBox.remove();
    const root = h('div', { style: 'display:flex;flex-direction:column;gap:22px' }); box.append(root);
    root.append(h('div', { class: 'fb info' }, 'Cargando el proyecto…'));
    await lab.start();
    const wait = () => lab.ready() ? teamUI(lab, root) : setTimeout(wait, 150);
    const timer = setTimeout(() => { if (!lab.ready()) root.firstChild && (root.firstChild.textContent = 'GitLab tarda en responder. Revisa tu conexión; seguimos intentando.'); }, 10000);
    wait(); if (lab.ready()) clearTimeout(timer);
  };
  go.onclick = () => start(false);
  codeIn.addEventListener('keydown', e => { if (e.key === 'Enter') start(false); });
  joinBox.append(h('p', { class: 'muted', style: 'margin:0;font-size:.85rem' }, '¿Solo quieres ver cómo funciona? ', h('button', { class: 'chipbtn', type: 'button', onclick: () => start(true) }, 'Modo demostración'), ' (no se comparte con nadie).'));
  view.append(h('section', { class: 'block tip' }, h('div', { class: 'kind' }, h('i', null, '★'), 'Cómo trabajar en equipo'), h('ul', null,
    h('li', null, 'Cada quien abre esta página en su dispositivo, elige su persona y entra con el mismo nombre de equipo.'),
    h('li', null, 'Hagan cada etapa después del módulo que indica. Las tareas de cada persona se marcan solas cuando están hechas, y ven en vivo el avance de los otros.'),
    h('li', null, 'Tu terminal es tu computadora: se guarda en tu navegador. Lo de los demás solo te llega con git pull o git fetch, igual que en la vida real.'),
    h('li', null, 'Las Merge Requests, comentarios, aprobaciones y merges se hacen en el panel de GitLab, abajo.'))));
}
