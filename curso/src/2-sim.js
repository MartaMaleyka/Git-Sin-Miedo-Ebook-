/* ================================================================
   Simulador de Git: una versión pequeña y honesta de Git que vive
   en el navegador. No toca tu computadora: todo es de práctica.
   ================================================================ */
/* El equipo del proyecto. Quien estudia elige quién es; los otros dos son sus compañeros. */
const TEAM = {
  marcos: { name: 'Marcos', mail: 'marcos@oficina.com' },
  katherine: { name: 'Katherine', mail: 'katherine@oficina.com' },
  cesar: { name: 'César', mail: 'cesar@oficina.com' }
};
let WHO = 'marcos';
try { const w = localStorage.getItem('gsm-curso-who'); if (TEAM[w]) WHO = w; } catch (e) {}
const hasWho = () => { try { return !!TEAM[localStorage.getItem('gsm-curso-who')]; } catch (e) { return false; } };
const me = () => TEAM[WHO];
const mates = () => Object.keys(TEAM).filter(k => k !== WHO).map(k => TEAM[k]);
/* Cambia las marcas ‹YO› ‹MAIL› ‹A› ‹B› por los nombres reales del equipo. */
function nm(s) {
  if (typeof s !== 'string' || s.indexOf('‹') < 0) return s;
  const [a, b] = mates();
  return s.replace(/‹YO›/g, me().name).replace(/‹MAIL›/g, me().mail).replace(/‹A›/g, a.name).replace(/‹B›/g, b.name);
}
const AUTHORS = {
  get ana() { const a = mates()[0]; return a.name + ' <' + a.mail + '>'; },
  get luis() { const b = mates()[1]; return b.name + ' <' + b.mail + '>'; }
};

function rid() { let s = ''; for (let i = 0; i < 7; i++) s += '0123456789abcdef'[Math.floor(Math.random() * 16)]; return s; }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function sameTree(a, b) { const ka = Object.keys(a), kb = Object.keys(b); if (ka.length !== kb.length) return false; return ka.every(k => b[k] === a[k]); }

/* diff de líneas (LCS) */
function lineDiff(a, b) {
  const A = a === undefined ? [] : a.split('\n'), B = b === undefined ? [] : b.split('\n');
  if (A.length && A[A.length - 1] === '') A.pop();
  if (B.length && B[B.length - 1] === '') B.pop();
  const n = A.length, m = B.length, dp = [];
  for (let i = 0; i <= n; i++) { dp.push(new Array(m + 1).fill(0)); }
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = []; let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) { out.push([' ', A[i]]); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push(['-', A[i]]); i++; }
    else { out.push(['+', B[j]]); j++; }
  }
  while (i < n) out.push(['-', A[i++]]);
  while (j < m) out.push(['+', B[j++]]);
  return out;
}

/* fusión de tres versiones de un archivo, línea por línea */
function merge3(base, ours, theirs, oursName, theirsName) {
  if (ours === theirs) return { text: ours };
  if (ours === base) return { text: theirs };
  if (theirs === base) return { text: ours };
  if (ours === undefined || theirs === undefined) return { conflict: true, deleted: true, text: ours === undefined ? theirs : ours };
  const sp = s => { const a = (s || '').split('\n'); if (a.length && a[a.length - 1] === '') a.pop(); return a; };
  const B = sp(base), O = sp(ours), T = sp(theirs);
  const mark = (o, t) => ['<<<<<<< HEAD', ...o, '=======', ...t, '>>>>>>> ' + theirsName];
  if (B.length === O.length && B.length === T.length) {
    const res = []; let conflict = false, oBuf = [], tBuf = [];
    const flush = () => { if (oBuf.length) { res.push(...mark(oBuf, tBuf)); oBuf = []; tBuf = []; } };
    for (let i = 0; i < B.length; i++) {
      if (O[i] === T[i]) { flush(); res.push(O[i]); }
      else if (O[i] === B[i]) { flush(); res.push(T[i]); }
      else if (T[i] === B[i]) { flush(); res.push(O[i]); }
      else { conflict = true; oBuf.push(O[i]); tBuf.push(T[i]); }
    }
    flush();
    return { text: res.join('\n') + '\n', conflict };
  }
  // un lado solo agregó líneas al final
  const pre = (X) => B.every((l, i) => X[i] === l);
  if (pre(O) && T.length === B.length) { const r = merge3(base, O.slice(0, B.length).join('\n') + '\n', theirs, oursName, theirsName); if (!r.conflict) return { text: r.text + O.slice(B.length).join('\n') + '\n' }; }
  if (pre(T) && O.length === B.length) { const r = merge3(base, ours, T.slice(0, B.length).join('\n') + '\n', oursName, theirsName); if (!r.conflict) return { text: r.text + T.slice(B.length).join('\n') + '\n' }; }
  // prefijo y sufijo comunes, conflicto en el medio
  let p = 0; while (p < O.length && p < T.length && O[p] === T[p]) p++;
  let s = 0; while (s < O.length - p && s < T.length - p && O[O.length - 1 - s] === T[T.length - 1 - s]) s++;
  const res = [...O.slice(0, p), ...mark(O.slice(p, O.length - s), T.slice(p, T.length - s)), ...O.slice(O.length - s)];
  return { text: res.join('\n') + '\n', conflict: true };
}

function tokenize(line) {
  const out = []; let cur = '', q = null, had = false;
  for (const ch of line) {
    if (q) { if (ch === q) q = null; else cur += ch; continue; }
    if (ch === '"' || ch === "'") { q = ch; had = true; continue; }
    if (/\s/.test(ch)) { if (cur || had) { out.push(cur); cur = ''; had = false; } continue; }
    if (ch === '>' ) { if (cur || had) { out.push(cur); cur = ''; had = false; } if (out[out.length - 1] === '>') out[out.length - 1] = '>>'; else out.push('>'); continue; }
    cur += ch;
  }
  if (cur || had) out.push(cur);
  return out;
}

const GIT_CMDS = ['status', 'add', 'commit', 'diff', 'log', 'push', 'pull', 'fetch', 'branch', 'switch', 'checkout', 'merge', 'restore', 'reset', 'revert', 'stash', 'reflog', 'show', 'tag', 'blame', 'clone', 'init', 'config', 'remote', 'rm', 'help', 'clean'];
function lev(a, b) { const d = []; for (let i = 0; i <= a.length; i++) { d[i] = [i]; for (let j = 1; j <= b.length; j++) d[i][j] = i ? Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) : j; } return d[a.length][b.length]; }

class Sim {
  constructor() {
    this.user = { name: '', email: '' };
    this.config = {};
    this.home = {};          // archivos fuera de un repo
    this.cwd = '~';
    this.repos = {};         // nombre -> repo
    this.remotes = {};       // url -> {branches, tags}
    this.commits = {};       // almacén compartido
    this.counter = 0;
    this.clonable = {};      // url -> función que arma el remoto
    this.lastNote = '';
  }
  /* ---------- helpers de repositorio ---------- */
  get repo() { return this.cwd.startsWith('~/') ? this.repos[this.cwd.slice(2)] || null : null; }
  headId(r = this.repo) { return r.detached || r.branches[r.head]; }
  tree(id) { return id && this.commits[id] ? this.commits[id].tree : {}; }
  laneOf(r, name) { if (!(name in r.lanes)) r.lanes[name] = Object.keys(r.lanes).length; return r.lanes[name]; }
  mkCommit(r, { msg, tree, parents, author, lane }) {
    const id = rid();
    const t = clone(tree); Object.keys(t).forEach(k => { t[k] = nm(t[k]); });
    const bname = lane || r.head || 'main';
    this.commits[id] = { id, msg: nm(msg), tree: t, parents: parents.filter(Boolean), author: nm(author || this.authorStr()), n: this.realTime ? Date.now() * 100 + (++this.counter % 100) : ++this.counter, lane: this.laneOf(r, bname), bname, date: this.realTime ? new Date().toISOString() : new Date(Date.now() - (1000 - this.counter) * 3600e3).toISOString() };
    return id;
  }
  authorStr() { return (this.user.name || '‹YO›') + ' <' + (this.user.email || '‹MAIL›') + '>'; }
  ancestors(id) { const set = new Set(), st = [id]; while (st.length) { const c = st.pop(); if (!c || set.has(c)) continue; set.add(c); st.push(...(this.commits[c]?.parents || [])); } return set; }
  isAnc(a, b) { return !a || this.ancestors(b).has(a); } // a es ancestro de b
  mergeBase(a, b) { const A = this.ancestors(a); const q = [b], seen = new Set(); let best = null; while (q.length) { const c = q.shift(); if (!c || seen.has(c)) continue; seen.add(c); if (A.has(c)) { if (!best || this.commits[c].n > this.commits[best].n) best = c; continue; } q.push(...this.commits[c].parents); } return best; }
  newRepo(name, { remoteUrl } = {}) {
    const r = { name, files: {}, index: {}, branches: {}, head: 'main', detached: null, lanes: { main: 0 }, rt: {}, upstream: {}, stash: [], reflog: [], tags: {}, merge: null, remoteUrl: remoteUrl || null };
    this.repos[name] = r; return r;
  }
  reflog(r, msg) { r.reflog.unshift({ id: this.headId(r), msg }); }
  ignored(r, f) {
    const gi = r.files['.gitignore']; if (!gi) return false;
    return gi.split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#')).some(p => {
      if (p.endsWith('/')) return f.startsWith(p);
      if (p.startsWith('*.')) return f.endsWith(p.slice(1));
      return f === p;
    });
  }
  changes(r) {
    const H = this.tree(this.headId(r)), I = r.index, W = r.files;
    const staged = [], unstaged = [], untracked = [], conflicts = r.merge ? r.merge.conflicts.slice() : [];
    new Set([...Object.keys(H), ...Object.keys(I)]).forEach(f => {
      if (conflicts.includes(f)) return;
      if (H[f] === undefined && I[f] !== undefined) staged.push(['new file', f]);
      else if (H[f] !== undefined && I[f] === undefined) staged.push(['deleted', f]);
      else if (H[f] !== I[f]) staged.push(['modified', f]);
    });
    Object.keys(I).forEach(f => { if (conflicts.includes(f)) return; if (W[f] === undefined) unstaged.push(['deleted', f]); else if (W[f] !== I[f]) unstaged.push(['modified', f]); });
    Object.keys(W).forEach(f => { if (I[f] === undefined && !conflicts.includes(f) && !this.ignored(r, f)) untracked.push(f); });
    return { staged, unstaged, untracked, conflicts };
  }
  dirtyTracked(r) { const c = this.changes(r); return c.staged.length + c.unstaged.length + c.conflicts.length > 0; }
  resolve(r, ref) {
    if (!ref) return null;
    let m = ref.match(/^(.*?)~(\d*)$/);
    let base = m ? m[1] : ref, n = m ? (m[2] === '' ? 1 : +m[2]) : 0;
    let id = null;
    if (base === 'HEAD') id = this.headId(r);
    else if (r.branches[base]) id = r.branches[base];
    else if (base.startsWith('origin/') && r.rt[base.slice(7)]) id = r.rt[base.slice(7)];
    else if (r.tags[base]) id = r.tags[base].id;
    else { const hit = Object.keys(this.commits).filter(k => base.length >= 4 && k.startsWith(base)); if (hit.length === 1) id = hit[0]; }
    while (id && n-- > 0) id = this.commits[id].parents[0];
    return id || null;
  }
  checkoutTree(r, target) {
    const H = this.tree(this.headId(r)), T = this.tree(target), W = r.files, I = r.index;
    const bad = [];
    new Set([...Object.keys(H), ...Object.keys(T)]).forEach(f => { const local = W[f] !== H[f] || I[f] !== H[f]; if (local && T[f] !== H[f]) bad.push(f); });
    if (bad.length) return bad;
    new Set([...Object.keys(H), ...Object.keys(T)]).forEach(f => {
      const local = W[f] !== H[f] || I[f] !== H[f];
      if (local) return;
      if (T[f] === undefined) { delete W[f]; delete I[f]; } else { W[f] = T[f]; I[f] = T[f]; }
    });
    return null;
  }
  remoteOf(r) { return r.remoteUrl ? this.remotes[r.remoteUrl] : null; }

  /* ---------- ejecutar una línea ---------- */
  run(line) {
    line = nm(line).trim();
    if (!line) return { out: '' };
    const t = tokenize(line);
    const cmd = t[0];
    try {
      if (cmd === 'git') return this.git(t.slice(1), line);
      return this.shell(cmd, t.slice(1), line);
    } catch (e) { return { out: '<span class="r">Error del simulador: ' + esc(e.message) + '</span>', err: true }; }
  }
  shell(cmd, a, line) {
    const r = this.repo, W = r ? r.files : this.home;
    switch (cmd) {
      case 'clear': return { clear: true };
      case 'pwd': return { out: '/home/tu-usuario' + this.cwd.slice(1) };
      case 'ls': {
        const all = a.includes('-a') || a.includes('-la');
        const names = Object.keys(W).filter(f => all || !f.startsWith('.')).sort();
        const dirs = r ? [] : Object.keys(this.repos).map(x => '<span class="b">' + x + '/</span>');
        const list = [...(all && r ? ['<span class="b">.git/</span>'] : []), ...dirs, ...names.map(esc)];
        return { out: list.join('   ') || '<span class="m">(carpeta vacía)</span>', ok: true, files: names };
      }
      case 'cd': {
        const d = (a[0] || '~').replace(/\/$/, '');
        if (d === '..' || d === '~') { this.cwd = '~'; return { out: '', ok: true }; }
        if (this.repos[d] && this.cwd === '~') { this.cwd = '~/' + d; return { out: '', ok: true, note: 'Entraste a la carpeta <b>' + esc(d) + '</b>. Desde aquí todos los comandos de Git funcionan.' }; }
        return { out: 'bash: cd: ' + esc(d) + ': No such file or directory', err: true };
      }
      case 'cat': {
        if (!a[0]) return { out: 'cat: falta el nombre del archivo', err: true };
        if (W[a[0]] === undefined) return { out: 'cat: ' + esc(a[0]) + ': No such file or directory', err: true };
        const txt = esc(W[a[0]]).replace(/^(&lt;&lt;&lt;&lt;&lt;&lt;&lt;.*|=======|&gt;&gt;&gt;&gt;&gt;&gt;&gt;.*)$/gm, '<span class="r">$1</span>');
        return { out: txt.replace(/\n$/, ''), ok: true };
      }
      case 'touch': { a.forEach(f => { if (W[f] === undefined) W[f] = ''; }); return { out: '', ok: true }; }
      case 'rm': { const f = a.filter(x => !x.startsWith('-'))[0]; if (W[f] === undefined) return { out: 'rm: ' + esc(f || '') + ': No such file', err: true }; delete W[f]; return { out: '', ok: true }; }
      case 'echo': {
        const i = a.findIndex(x => x === '>' || x === '>>');
        if (i < 0) return { out: esc(a.join(' ')), ok: true };
        const txt = a.slice(0, i).join(' '), f = a[i + 1];
        if (!f) return { out: 'bash: error de sintaxis: falta el archivo', err: true };
        const existed = W[f] !== undefined;
        if (a[i] === '>>') W[f] = (W[f] || '') + txt + '\n'; else W[f] = txt + '\n';
        return { out: '', ok: true, note: a[i] === '>>' ? 'Agregaste una línea al final de <b>' + esc(f) + '</b>.' : (existed ? 'Reemplazaste todo el contenido de <b>' + esc(f) + '</b>.' : 'Creaste el archivo <b>' + esc(f) + '</b>.') };
      }
      case 'sed': {
        const inplace = a.includes('-i'); const rest = a.filter(x => x !== '-i');
        const m = (rest[0] || '').match(/^s\/(.*?)\/(.*?)\/(g?)$/); const f = rest[1];
        if (!m || !f) return { out: "sed: usa la forma sed -i 's/texto-viejo/texto-nuevo/' archivo", err: true };
        if (W[f] === undefined) return { out: 'sed: ' + esc(f) + ': No such file or directory', err: true };
        const rx = new RegExp(m[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), m[3] ? 'g' : '');
        const res = W[f].replace(rx, m[2]);
        if (!inplace) return { out: esc(res).replace(/\n$/, ''), ok: true };
        const changed = res !== W[f]; W[f] = res;
        return { out: '', ok: true, note: changed ? 'Reemplazaste <b>' + esc(m[1]) + '</b> por <b>' + esc(m[2]) + '</b> en ' + esc(f) + '.' : 'No se encontró <b>' + esc(m[1]) + '</b> en ' + esc(f) + '. Nada cambió.' };
      }
      case 'nano': case 'vim': case 'code': case 'cursor':
        return { out: '', note: 'En este simulador no hay editor. Para escribir en un archivo usa <code>echo "texto" &gt; archivo</code> (reemplaza todo) o <code>echo "texto" &gt;&gt; archivo</code> (agrega una línea al final).' };
      case 'help': case 'ayuda': return { out: this.helpText() };
      case 'ssh-keygen': return { out: 'Generating public/private ed25519 key pair.\nYour identification has been saved in ~/.ssh/id_ed25519\nYour public key has been saved in ~/.ssh/id_ed25519.pub', ok: true, note: 'Se crearon dos llaves: <b>id_ed25519</b> (privada, nunca se comparte) e <b>id_ed25519.pub</b> (pública, la que pegas en GitLab).' };
      case 'ssh': if (a.includes('-T')) return { out: 'Welcome to GitLab, @' + ((this.user.name || 'tu-usuario').split(' ')[0].toLowerCase()) + '!', ok: true, note: 'Conexión correcta: GitLab reconoció tu llave.' }; break;
    }
    return { out: 'bash: ' + esc(cmd) + ': command not found', err: true, note: 'Ese comando no existe en el simulador. Escribe <code>help</code> para ver los que puedes usar.' };
  }
  helpText() {
    return '<span class="y">Comandos de la terminal:</span> ls, ls -a, cat archivo, echo "texto" &gt; archivo, echo "texto" &gt;&gt; archivo, sed -i \'s/viejo/nuevo/\' archivo, touch, rm, cd carpeta, cd .., pwd, clear\n' +
      '<span class="y">Comandos de Git:</span> status, diff, diff --staged, add, commit -m, commit --amend, log --oneline, show, push, pull, fetch, branch, switch, switch -c, merge, merge --abort, restore, restore --staged, reset, revert, stash, reflog, tag, blame, clone, init, config, remote -v';
  }

  /* ---------- git ---------- */
  git(a, line) {
    const sub = a[0];
    if (!sub || sub === '--help' || sub === 'help') return { out: 'usage: git &lt;command&gt; [&lt;args&gt;]\n' + this.helpText() };
    if (sub === '--version' || sub === 'version') return { out: 'git version 2.47.1', ok: true };
    if (sub === 'config') return this.gConfig(a.slice(1));
    if (sub === 'clone') return this.gClone(a.slice(1));
    if (sub === 'init') return this.gInit();
    if (!GIT_CMDS.includes(sub)) {
      const best = GIT_CMDS.map(c => [c, lev(sub, c)]).sort((x, y) => x[1] - y[1])[0];
      return { out: "git: '" + esc(sub) + "' is not a git command. See 'git --help'." + (best[1] <= 2 ? '\n\nThe most similar command is\n\t' + best[0] : ''), err: true, note: best[1] <= 2 ? '¿Quisiste escribir <code>git ' + best[0] + '</code>? Pasa mucho: Git hasta te sugiere el comando correcto.' : '' };
    }
    const r = this.repo;
    if (!r) return { out: 'fatal: not a git repository (or any of the parent directories): .git', err: true, note: 'Estás fuera de la carpeta del proyecto. Usa <code>ls</code> para verla y <code>cd nombre-del-proyecto</code> para entrar.' };
    const fn = this['g_' + sub];
    return fn.call(this, r, a.slice(1), line);
  }
  gConfig(a) {
    const g = a.includes('--global'); const b = a.filter(x => x !== '--global');
    if (b[0] === '--list' || b[0] === '-l') {
      const lines = []; if (this.user.name) lines.push('user.name=' + this.user.name); if (this.user.email) lines.push('user.email=' + this.user.email);
      Object.entries(this.config).forEach(([k, v]) => lines.push(k + '=' + v));
      return { out: esc(lines.join('\n')) || '<span class="m">(sin configuración todavía)</span>', ok: true };
    }
    const key = b[0], val = b.slice(1).join(' ');
    if (!key) return { out: 'usage: git config [--global] &lt;nombre&gt; &lt;valor&gt;', err: true };
    if (!val) { const v = key === 'user.name' ? this.user.name : key === 'user.email' ? this.user.email : this.config[key]; return { out: esc(v || ''), ok: true }; }
    if (key === 'user.name') this.user.name = val; else if (key === 'user.email') this.user.email = val; else this.config[key] = val;
    const notes = { 'user.name': 'Listo: cada commit llevará el nombre <b>' + esc(val) + '</b>.', 'user.email': 'Listo: tus commits llevarán el correo <b>' + esc(val) + '</b>. Usa el mismo que en GitLab.', 'init.defaultBranch': 'Los proyectos nuevos empezarán con la rama <b>' + esc(val) + '</b>.' };
    return { out: '', ok: true, note: (notes[key] || 'Configuración guardada.') + (g ? '' : ' (Sin <code>--global</code>: solo aplica a este proyecto.)') };
  }
  gClone(a) {
    const url = a[0];
    if (!url) return { out: 'fatal: You must specify a repository to clone.', err: true };
    if (this.repo) return { out: 'fatal: ya estás dentro de un repositorio. Sal con cd .. antes de clonar.', err: true };
    const name = url.replace(/\.git$/, '').split(/[/:]/).pop();
    if (!this.clonable[url] && !this.remotes[url]) return { out: "Cloning into '" + esc(name) + "'...\nERROR: Repository not found.\nfatal: Could not read from remote repository.", err: true, note: 'La dirección no coincide con ningún proyecto. Copia la dirección exacta del reto (botón <b>Code</b> en GitLab).' };
    if (this.repos[name]) return { out: "fatal: destination path '" + esc(name) + "' already exists and is not an empty directory.", err: true };
    if (!this.remotes[url]) this.clonable[url](this, url);
    const R = this.remotes[url]; const r = this.newRepo(name, { remoteUrl: url });
    Object.entries(R.branches).forEach(([b, id]) => { r.rt[b] = id; });
    r.branches.main = R.branches.main; r.upstream.main = true;
    const T = this.tree(r.branches.main); r.files = clone(T); r.index = clone(T);
    this.reflog(r, 'clone: from ' + url);
    const n = this.ancestors(r.branches.main).size;
    return { out: "Cloning into '" + esc(name) + "'...\nremote: Enumerating objects: " + (n * 3) + ", done.\nReceiving objects: 100% (" + (n * 3) + '/' + (n * 3) + '), done.', ok: true, note: 'Se descargó el proyecto <b>' + esc(name) + '</b> con toda su historia (' + n + ' commit' + (n > 1 ? 's' : '') + '). Ahora entra con <code>cd ' + esc(name) + '</code>.' };
  }
  gInit() {
    if (this.repo) return { out: 'Reinitialized existing Git repository', ok: true };
    return { out: 'fatal: en este simulador usa git init dentro de una carpeta de proyecto', err: true };
  }
  g_status(r) {
    const c = this.changes(r), H = this.headId(r);
    let o = r.detached ? '<span class="r">HEAD detached at ' + r.detached + '</span>\n' : 'On branch <span class="g">' + esc(r.head) + '</span>\n';
    if (!H) o += '\nNo commits yet\n';
    if (r.upstream[r.head] && r.rt[r.head] && H) {
      const ahead = [...this.ancestors(H)].filter(x => !this.ancestors(r.rt[r.head]).has(x)).length;
      const behind = [...this.ancestors(r.rt[r.head])].filter(x => !this.ancestors(H).has(x)).length;
      if (ahead && behind) o += "Your branch and 'origin/" + r.head + "' have diverged,\nand have " + ahead + ' and ' + behind + ' different commits each.\n';
      else if (ahead) o += "Your branch is ahead of 'origin/" + r.head + "' by " + ahead + ' commit' + (ahead > 1 ? 's' : '') + '.\n  (use "git push" to publish your local commits)\n';
      else if (behind) o += "Your branch is behind 'origin/" + r.head + "' by " + behind + ' commit' + (behind > 1 ? 's' : '') + '.\n  (use "git pull" to update your local branch)\n';
      else o += "Your branch is up to date with 'origin/" + r.head + "'.\n";
    }
    if (r.merge) o += '\nYou have unmerged paths.\n  (fix conflicts and run "git commit")\n  (use "git merge --abort" to abort the merge)\n';
    if (c.staged.length) o += '\nChanges to be committed:\n' + c.staged.map(([k, f]) => '        <span class="g">' + (k + ':').padEnd(12) + esc(f) + '</span>').join('\n') + '\n';
    if (c.conflicts.length) o += '\nUnmerged paths:\n' + c.conflicts.map(f => '        <span class="r">both modified:   ' + esc(f) + '</span>').join('\n') + '\n';
    if (c.unstaged.length) o += '\nChanges not staged for commit:\n' + c.unstaged.map(([k, f]) => '        <span class="r">' + (k + ':').padEnd(12) + esc(f) + '</span>').join('\n') + '\n';
    if (c.untracked.length) o += '\nUntracked files:\n' + c.untracked.map(f => '        <span class="r">' + esc(f) + '</span>').join('\n') + '\n';
    if (!c.staged.length && !c.unstaged.length && !c.untracked.length && !c.conflicts.length && !r.merge) o += '\nnothing to commit, working tree clean';
    const parts = [];
    if (c.conflicts.length) parts.push('<b>' + c.conflicts.length + '</b> archivo(s) en conflicto: ábrelos y decide cómo quedan');
    if (c.staged.length) parts.push('<b>' + c.staged.length + '</b> en la caja, listo(s) para commit');
    if (c.unstaged.length) parts.push('<b>' + c.unstaged.length + '</b> modificado(s) fuera de la caja');
    if (c.untracked.length) parts.push('<b>' + c.untracked.length + '</b> archivo(s) nuevo(s) que Git todavía no sigue');
    return { out: o.replace(/\n+$/, ''), ok: true, note: 'Traducido: estás en la rama <b>' + esc(r.detached ? '(ninguna)' : r.head) + '</b>. ' + (parts.length ? parts.join('; ') + '.' : 'Todo está guardado.') };
  }
  fmtDiff(f, a, b) {
    const d = lineDiff(a, b); if (!d.some(x => x[0] !== ' ')) return '';
    let o = '<span class="echo">diff --git a/' + esc(f) + ' b/' + esc(f) + '</span>\n' + (a === undefined ? 'new file\n' : '') + (b === undefined ? 'deleted file\n' : '');
    o += d.map(([k, l]) => k === '+' ? '<span class="g">+ ' + esc(l) + '</span>' : k === '-' ? '<span class="r">- ' + esc(l) + '</span>' : '  ' + esc(l)).join('\n');
    return o;
  }
  g_diff(r, a) {
    const staged = a.includes('--staged') || a.includes('--cached');
    const rest = a.filter(x => !x.startsWith('--') && x !== '--');
    const stat = a.includes('--stat');
    let A, B, files;
    if (rest.length >= 2) { const x = this.resolve(r, rest[0]), y = this.resolve(r, rest[1]); if (!x || !y) return { out: 'fatal: bad revision', err: true }; A = this.tree(x); B = this.tree(y); }
    else if (rest.length === 1 && this.resolve(r, rest[0])) { A = this.tree(this.resolve(r, rest[0])); B = r.files; }
    else if (staged) { A = this.tree(this.headId(r)); B = r.index; }
    else { A = r.index; B = {}; Object.keys(r.index).forEach(f => { B[f] = r.files[f]; }); }
    files = [...new Set([...Object.keys(A), ...Object.keys(B)])].sort();
    if (stat) { const lines = files.map(f => { const d = lineDiff(A[f], B[f]); const p = d.filter(x => x[0] === '+').length, m = d.filter(x => x[0] === '-').length; return p + m ? ' ' + esc(f).padEnd(18) + ' | ' + (p + m) + ' <span class="g">' + '+'.repeat(p) + '</span><span class="r">' + '-'.repeat(m) + '</span>' : ''; }).filter(Boolean); return { out: lines.join('\n'), ok: true }; }
    const out = files.map(f => this.fmtDiff(f, A[f], B[f])).filter(Boolean).join('\n\n');
    return { out, ok: true, note: out ? 'Las líneas con <span style="color:#7ee2a8">+</span> se agregaron y las que tienen <span style="color:#ff8b7b">-</span> se quitaron.' + (staged ? ' Esto es lo que ya está en la caja.' : ' Esto es lo que cambiaste y todavía no está en la caja.') : (staged ? 'La caja está vacía: no hay nada preparado para el commit.' : 'No hay cambios fuera de la caja.' + (this.changes(r).untracked.length ? ' Ojo: <code>git diff</code> no muestra archivos nuevos que Git todavía no sigue.' : '')) };
  }
  g_add(r, a) {
    let files = a.filter(x => !x.startsWith('-'));
    if (a.includes('-p')) return { out: '', note: '<code>git add -p</code> te deja elegir pedazo por pedazo. En este simulador agrega el archivo completo con <code>git add ' + esc(files[0] || 'archivo') + '</code>.' };
    if (!files.length && !a.includes('-A')) return { out: 'Nothing specified, nothing added.', err: true };
    const all = a.includes('-A') || files.includes('.');
    if (all) files = [...new Set([...Object.keys(r.files).filter(f => !this.ignored(r, f) || r.index[f] !== undefined), ...Object.keys(r.index)])];
    const added = [];
    for (const f of files) {
      if (r.files[f] === undefined && r.index[f] === undefined) return { out: "fatal: pathspec '" + esc(f) + "' did not match any files", err: true, note: 'Ese archivo no existe. Revisa el nombre con <code>ls</code>.' };
      if (!all && this.ignored(r, f) && r.index[f] === undefined) return { out: 'The following paths are ignored by one of your .gitignore files:\n' + esc(f), err: true, note: 'Git se niega porque <b>' + esc(f) + '</b> está en tu .gitignore. Así te protege de subirlo por accidente.' };
      if (r.files[f] === undefined) delete r.index[f]; else { if (r.index[f] !== r.files[f]) added.push(f); r.index[f] = r.files[f]; }
      if (r.merge && r.merge.conflicts.includes(f)) r.merge.conflicts = r.merge.conflicts.filter(x => x !== f);
    }
    const markers = files.filter(f => /^(<<<<<<<|=======|>>>>>>>)/m.test(r.files[f] || ''));
    return { out: '', ok: true, added, note: (added.length ? 'Entró a la caja: <b>' + added.map(esc).join(', ') + '</b>.' : 'No había nada nuevo que meter en la caja.') + (all ? ' Usaste <code>' + (a.includes('-A') ? '-A' : '.') + '</code>: eso mete <i>todo</i>. Úsalo solo después de mirar <code>git status</code>.' : '') + (markers.length ? ' <b>Cuidado:</b> ' + markers.map(esc).join(', ') + ' todavía tiene marcas &lt;&lt;&lt;&lt;&lt;&lt;&lt; de conflicto.' : '') };
  }
  parseMsg(a) { let i = a.indexOf('-m'); if (i < 0) i = a.indexOf('-am'); return i >= 0 ? a[i + 1] : null; }
  g_commit(r, a) {
    const amend = a.includes('--amend'); let msg = this.parseMsg(a);
    const H = this.headId(r);
    if (a.includes('-a') || a.includes('-am')) Object.keys(r.index).forEach(f => { if (r.merge && r.merge.conflicts.includes(f)) return; if (r.files[f] === undefined) delete r.index[f]; else r.index[f] = r.files[f]; });
    if (r.merge && r.merge.conflicts.length) return { out: 'error: Committing is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use \'git add &lt;file&gt;\'\nfatal: Exiting because of an unresolved conflict.', err: true, note: 'Todavía hay archivos en conflicto. Edítalos, quita las marcas y márcalos como resueltos con <code>git add</code>.' };
    if (amend) {
      if (!H) return { out: 'fatal: You have nothing to amend.', err: true };
      const old = this.commits[H];
      if (a.includes('--no-edit')) msg = old.msg;
      if (!msg) return { out: '', note: 'Escribe el mensaje con <code>-m "..."</code> o usa <code>--no-edit</code> para conservar el anterior.' };
      const id = this.mkCommit(r, { msg, tree: r.index, parents: old.parents, lane: r.head });
      this.commits[id].lane = old.lane;
      if (r.detached) r.detached = id; else r.branches[r.head] = id;
      this.reflog(r, 'commit (amend): ' + msg);
      const pub = r.rt[r.head] && this.ancestors(r.rt[r.head]).has(H);
      return { out: '[' + esc(r.head) + ' ' + id + '] ' + esc(msg), ok: true, amend: true, note: 'Reemplazaste el último commit (' + H + ') por uno nuevo (' + id + '). ' + (pub ? '<b>Ojo:</b> ese commit ya estaba publicado; esto reescribe historia compartida.' : 'Como no habías hecho push, no afecta a nadie.') };
    }
    if (!msg && !r.merge) return { out: '', note: 'Git abriría un editor para que escribas el mensaje. En el simulador escríbelo directo: <code>git commit -m "Agrega ..."</code>.' };
    if (!r.merge && sameTree(r.index, this.tree(H))) {
      const c = this.changes(r);
      return { out: c.unstaged.length || c.untracked.length ? 'On branch ' + esc(r.head) + '\nnothing added to commit but untracked files present (use "git add" to track)' : 'On branch ' + esc(r.head) + '\nnothing to commit, working tree clean', err: true, note: c.unstaged.length || c.untracked.length ? 'La caja está vacía. Primero elige qué entra con <code>git add archivo</code>.' : 'No hay nada que guardar.' };
    }
    if (!msg) msg = r.merge.msg;
    const parents = [H]; if (r.merge) parents.push(r.merge.theirs);
    const id = this.mkCommit(r, { msg, tree: r.index, parents, lane: r.head });
    if (r.detached) r.detached = id; else r.branches[r.head] = id;
    const wasMerge = !!r.merge; r.merge = null;
    this.reflog(r, 'commit' + (wasMerge ? ' (merge)' : '') + ': ' + msg);
    const nf = Object.keys(r.index).filter(f => r.index[f] !== this.tree(H)[f]).length;
    return { out: '[' + esc(r.head) + ' ' + id + '] ' + esc(msg) + '\n ' + nf + ' file' + (nf !== 1 ? 's' : '') + ' changed', ok: true, commit: id, msg, merge: wasMerge, note: (wasMerge ? 'Fusión terminada: este commit une las dos ramas.' : 'Paquete cerrado y etiquetado: commit <b>' + id + '</b>.') + ' Por ahora vive <b>solo en tu computadora</b>; para que el equipo lo vea falta <code>git push</code>.' };
  }
  walk(r, starts) { const seen = new Set(); starts.forEach(s => this.ancestors(s).forEach(x => seen.add(x))); return [...seen].map(id => this.commits[id]).sort((x, y) => y.n - x.n); }
  decorations(r, id) {
    const d = [];
    Object.entries(r.branches).forEach(([b, x]) => { if (x === id) d.push(!r.detached && b === r.head ? '<span class="b">HEAD -&gt; </span><span class="g">' + esc(b) + '</span>' : '<span class="g">' + esc(b) + '</span>'); });
    if (r.detached === id) d.unshift('<span class="b">HEAD</span>');
    Object.entries(r.rt).forEach(([b, x]) => { if (x === id) d.push('<span class="r">origin/' + esc(b) + '</span>'); });
    Object.entries(r.tags).forEach(([t, x]) => { if (x.id === id) d.push('<span class="y">tag: ' + esc(t) + '</span>'); });
    return d.length ? ' <span class="y">(</span>' + d.join('<span class="y">, </span>') + '<span class="y">)</span>' : '';
  }
  g_log(r, a) {
    const H = this.headId(r); if (!H) return { out: "fatal: your current branch '" + esc(r.head) + "' does not have any commits yet", err: true };
    const opt = k => { const x = a.find(s => s.startsWith(k + '=')); if (x) return x.slice(k.length + 1); const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
    const range = a.find(s => s.includes('..'));
    let list;
    if (range) { const [x, y] = range.split('..'); const X = this.resolve(r, x), Y = this.resolve(r, y); if (!X || !Y) return { out: 'fatal: bad revision', err: true }; const ax = this.ancestors(X); list = this.walk(r, [Y]).filter(c => !ax.has(c.id)); }
    else if (a.includes('--all')) list = this.walk(r, [H, ...Object.values(r.branches), ...Object.values(r.rt)]);
    else { const ref = a.find(s => !s.startsWith('-') && this.resolve(r, s) && a[a.indexOf(s) - 1] !== '-S' && a[a.indexOf(s) - 1] !== '--author' && a[a.indexOf(s) - 1] !== '--grep'); list = this.walk(r, [ref ? this.resolve(r, ref) : H]); }
    const au = opt('--author'), gr = opt('--grep'), S = opt('-S');
    const dd = a.indexOf('--'); const file = dd >= 0 ? a[dd + 1] : null;
    if (au) list = list.filter(c => c.author.toLowerCase().includes(au.toLowerCase()));
    if (gr) list = list.filter(c => c.msg.toLowerCase().includes(gr.toLowerCase()));
    if (file) list = list.filter(c => this.tree(c.id)[file] !== this.tree(c.parents[0])[file]);
    if (S) { const cnt = (t) => Object.values(t).join('\n').split(S).length - 1; list = list.filter(c => cnt(this.tree(c.id)) !== cnt(this.tree(c.parents[0]))); }
    const nArg = a.find(s => /^-\d+$/.test(s)); if (nArg) list = list.slice(0, +nArg.slice(1));
    const one = a.includes('--oneline'), graph = a.includes('--graph');
    if (!list.length) return { out: '<span class="m">(ningún commit coincide)</span>', ok: true, filtered: true };
    const out = list.map(c => one ? (graph ? '<span class="y">*</span> ' : '') + '<span class="y">' + c.id + '</span>' + this.decorations(r, c.id) + ' ' + esc(c.msg) + (graph && c.parents.length > 1 ? ' <span class="m">(2 padres)</span>' : '')
      : '<span class="y">commit ' + c.id + '</span>' + this.decorations(r, c.id) + (c.parents.length > 1 ? '\nMerge: ' + c.parents.join(' ') : '') + '\nAuthor: ' + esc(c.author) + '\nDate:   ' + new Date(c.date).toLocaleString('es') + '\n\n    ' + esc(c.msg)).join(one ? '\n' : '\n\n');
    return { out, ok: true, list: list.map(c => c.id), filtered: !!(au || gr || S || file || range), note: (au || gr || S || file || range ? 'Filtraste el historial: ' + list.length + ' commit(s) coinciden. ' : '') + (graph ? 'El dibujo de ramas lo tienes más claro en el mapa de la derecha.' : 'El código amarillo es el identificador de cada commit. Lo usarás para <code>show</code>, <code>revert</code> o <code>reset</code>.') };
  }
  g_show(r, a) {
    const ref = a[0] || 'HEAD';
    if (ref.includes(':')) { const [c, f] = ref.split(':'); const id = this.resolve(r, c); if (!id) return { out: 'fatal: invalid object name', err: true }; const t = this.tree(id)[f]; if (t === undefined) return { out: "fatal: path '" + esc(f) + "' does not exist in '" + esc(c) + "'", err: true }; return { out: esc(t).replace(/\n$/, ''), ok: true, note: 'Así era <b>' + esc(f) + '</b> en el commit ' + id + '. Tu carpeta no cambió.' }; }
    const id = this.resolve(r, ref); if (!id) return { out: "fatal: ambiguous argument '" + esc(ref) + "': unknown revision", err: true };
    const c = this.commits[id], P = this.tree(c.parents[0]), T = c.tree;
    const diffs = [...new Set([...Object.keys(P), ...Object.keys(T)])].sort().map(f => this.fmtDiff(f, P[f], T[f])).filter(Boolean).join('\n\n');
    return { out: '<span class="y">commit ' + id + '</span>' + this.decorations(r, id) + '\nAuthor: ' + esc(c.author) + '\n\n    ' + esc(c.msg) + '\n\n' + diffs, ok: true, shown: id };
  }
  g_branch(r, a) {
    const del = a.find(x => x === '-d' || x === '-D'), name = a.find(x => !x.startsWith('-'));
    if (del) {
      if (!name || !r.branches[name]) return { out: "error: branch '" + esc(name || '') + "' not found.", err: true };
      if (name === r.head && !r.detached) return { out: "error: Cannot delete branch '" + esc(name) + "' checked out", err: true, note: 'No puedes borrar la rama en la que estás. Cámbiate primero a otra (por ejemplo <code>git switch main</code>).' };
      const merged = this.ancestors(this.headId(r)).has(r.branches[name]) || (r.rt[name] === r.branches[name]);
      if (del === '-d' && !this.ancestors(this.headId(r)).has(r.branches[name])) return { out: "error: The branch '" + esc(name) + "' is not fully merged.\nIf you are sure you want to delete it, run 'git branch -D " + esc(name) + "'.", err: true, note: 'Git te protege: esa rama tiene commits que no están en tu rama actual. Revisa antes de borrar.' };
      const id = r.branches[name]; delete r.branches[name];
      return { out: 'Deleted branch ' + esc(name) + ' (was ' + id + ').', ok: true, deleted: name, note: merged ? 'Rama borrada. Sus commits siguen en el historial de la rama donde se fusionó.' : 'Rama borrada con <b>-D</b>. Sus commits ya no aparecen en <code>git log</code>, pero <code>git reflog</code> todavía los recuerda.' };
    }
    if (name && !a.includes('-a')) {
      if (r.branches[name]) return { out: "fatal: a branch named '" + esc(name) + "' already exists", err: true };
      const at = a[a.indexOf(name) + 1] ? this.resolve(r, a[a.indexOf(name) + 1]) : this.headId(r);
      r.branches[name] = at; this.laneOf(r, name);
      return { out: '', ok: true, created: name, note: 'Creaste la rama <b>' + esc(name) + '</b> apuntando al commit ' + at + ', pero <b>sigues en ' + esc(r.head) + '</b>. Para cambiarte usa <code>git switch ' + esc(name) + '</code>.' };
    }
    let out = Object.keys(r.branches).sort().map(b => (b === r.head && !r.detached ? '<span class="g">* ' + esc(b) + '</span>' : '  ' + esc(b))).join('\n');
    if (r.detached) out = '<span class="g">* (HEAD detached at ' + r.detached + ')</span>\n' + out;
    if (a.includes('-a')) out += '\n' + Object.keys(r.rt).sort().map(b => '  <span class="r">remotes/origin/' + esc(b) + '</span>').join('\n');
    return { out, ok: true, note: 'El asterisco marca la rama en la que estás.' + (a.includes('-a') ? ' Las rojas <code>remotes/origin/...</code> son las que existen en GitLab.' : '') };
  }
  doSwitch(r, name, create, at) {
    if (r.merge) return { out: 'error: you need to resolve your current index first', err: true };
    if (create) {
      if (r.branches[name]) return { out: "fatal: a branch named '" + esc(name) + "' already exists", err: true };
      const id = at ? this.resolve(r, at) : this.headId(r);
      if (at && !id) return { out: "fatal: invalid reference: " + esc(at), err: true };
      if (at && id !== this.headId(r)) { const bad = this.checkoutTree(r, id); if (bad) return this.owErr(bad); }
      r.branches[name] = id; this.laneOf(r, name); const from = r.detached ? 'HEAD' : r.head; r.head = name; r.detached = null;
      this.reflog(r, 'checkout: moving from ' + from + ' to ' + name);
      return { out: "Switched to a new branch '" + esc(name) + "'", ok: true, switched: name, created: name, note: 'Creaste la rama <b>' + esc(name) + '</b> y ya estás en ella. Tus próximos commits van aquí, sin tocar <b>main</b>.' };
    }
    let id = r.branches[name];
    let tracked = false;
    if (!id && r.rt[name]) { id = r.rt[name]; r.branches[name] = id; r.upstream[name] = true; this.laneOf(r, name); tracked = true; }
    if (!id) return { out: "fatal: invalid reference: " + esc(name), err: true, note: 'No existe una rama llamada <b>' + esc(name) + '</b>. Revisa el nombre con <code>git branch -a</code>. Si la crearon en GitLab, primero <code>git fetch</code>.' };
    if (name === r.head && !r.detached) return { out: "Already on '" + esc(name) + "'", ok: true, switched: name };
    const bad = this.checkoutTree(r, id); if (bad) return this.owErr(bad);
    const from = r.detached ? 'HEAD' : r.head; r.head = name; r.detached = null;
    this.reflog(r, 'checkout: moving from ' + from + ' to ' + name);
    const c = this.changes(r);
    return { out: (tracked ? "branch '" + esc(name) + "' set up to track 'origin/" + esc(name) + "'.\n" : '') + "Switched to branch '" + esc(name) + "'", ok: true, switched: name, note: 'Ahora estás en <b>' + esc(name) + '</b>. Los archivos de tu carpeta cambiaron para mostrar esta rama.' + (c.unstaged.length + c.staged.length ? ' <b>Ojo:</b> tus cambios sin commit viajaron contigo.' : '') };
  }
  owErr(bad) { return { out: 'error: Your local changes to the following files would be overwritten by checkout:\n\t' + bad.map(esc).join('\n\t') + '\nPlease commit your changes or stash them before you switch branches.\nAborting', err: true, note: 'Git no te deja cambiar para no pisar tus cambios sin guardar. Haz commit o apártalos con <code>git stash push -m "..."</code>.' }; }
  g_switch(r, a) {
    if (a.includes('--detach')) { const id = this.resolve(r, a.find(x => !x.startsWith('-'))); if (!id) return { out: 'fatal: invalid reference', err: true }; const bad = this.checkoutTree(r, id); if (bad) return this.owErr(bad); r.detached = id; this.reflog(r, 'checkout: moving to ' + id); return { out: 'HEAD is now at ' + id + ' ' + esc(this.commits[id].msg), ok: true, note: 'Estás en modo <b>detached HEAD</b>: mirando una versión vieja, sin rama. Para volver: <code>git switch main</code>.' }; }
    const c = a.includes('-c') || a.includes('-b') || a.includes('-C');
    const names = a.filter(x => !x.startsWith('-'));
    if (!names[0]) return { out: 'fatal: missing branch name', err: true };
    return this.doSwitch(r, names[0], c, names[1]);
  }
  g_checkout(r, a) {
    if (a.includes('--ours') || a.includes('--theirs')) { const f = a.find(x => !x.startsWith('-')); if (!r.merge) return { out: 'error: no hay una fusión en curso', err: true }; const side = a.includes('--ours') ? this.tree(this.headId(r))[f] : this.tree(r.merge.theirs)[f]; r.files[f] = side; return { out: 'Updated 1 path from the index', ok: true, note: 'Elegiste la versión ' + (a.includes('--ours') ? '<b>tuya</b>' : '<b>de la otra rama</b>') + ' completa. Ahora márcalo como resuelto con <code>git add ' + esc(f) + '</code>.' }; }
    const res = this.g_switch(r, a.map(x => x === '-b' ? '-c' : x));
    res.note = (res.note || '') + ' <span style="opacity:.8">(Funciona, pero en este curso usamos <code>git switch</code>: es la forma moderna y más clara, porque <code>checkout</code> hace demasiadas cosas distintas.)</span>';
    return res;
  }
  doMerge(r, theirs, name) {
    const H = this.headId(r);
    if (!H) return { out: 'fatal: no hay commits todavía', err: true };
    if (this.ancestors(H).has(theirs)) return { out: 'Already up to date.', ok: true, upToDate: true, note: 'No había nada nuevo que traer: tu rama ya tiene todo lo de <b>' + esc(name) + '</b>.' };
    if (this.ancestors(theirs).has(H)) {
      const bad = this.checkoutTree(r, theirs); if (bad) return { out: 'error: Your local changes to the following files would be overwritten by merge:\n\t' + bad.map(esc).join('\n\t') + '\nAborting', err: true };
      if (r.detached) r.detached = theirs; else r.branches[r.head] = theirs;
      this.reflog(r, 'merge ' + name + ': Fast-forward');
      return { out: 'Updating ' + H + '..' + theirs + '\nFast-forward', ok: true, ff: true, note: '<b>Fast-forward</b> (avance rápido): tu rama solo tenía que avanzar hasta los commits nuevos. No hizo falta un commit de fusión.' };
    }
    if (this.dirtyTracked(r)) return { out: 'error: Your local changes would be overwritten by merge.\nPlease commit your changes or stash them before you merge.\nAborting', err: true, note: 'Antes de fusionar, deja tu carpeta limpia: commit o stash.' };
    const base = this.mergeBase(H, theirs), B = this.tree(base), O = this.tree(H), T = this.tree(theirs);
    const conflicts = [], out = [], files = [...new Set([...Object.keys(O), ...Object.keys(T)])];
    const W = {}; const I = {};
    files.forEach(f => {
      const m = merge3(B[f], O[f], T[f], r.head, name);
      if (m.conflict) { conflicts.push(f); W[f] = m.text; I[f] = O[f]; out.push('Auto-merging ' + esc(f) + '\n<span class="r">CONFLICT (content): Merge conflict in ' + esc(f) + '</span>'); }
      else if (m.text !== undefined) { W[f] = m.text; I[f] = m.text; if (O[f] !== T[f] && O[f] !== undefined && T[f] !== undefined) out.push('Auto-merging ' + esc(f)); }
    });
    r.files = Object.assign(Object.fromEntries(Object.entries(r.files).filter(([f]) => !(f in O) && !(f in T))), W); r.index = I;
    const msg = "Merge branch '" + name + "' into " + r.head;
    if (conflicts.length) {
      r.merge = { theirs, name, conflicts, msg };
      return { out: out.join('\n') + '\nAutomatic merge failed; fix conflicts and then commit the result.', ok: true, conflict: true, note: '<b>Conflicto</b>: tú y la otra rama cambiaron las mismas líneas de ' + conflicts.map(f => '<b>' + esc(f) + '</b>').join(', ') + '. No se rompió nada. Abre el archivo con <code>cat</code>, decide cómo debe quedar, o cancela con <code>git merge --abort</code>.' };
    }
    const id = this.mkCommit(r, { msg, tree: I, parents: [H, theirs], lane: r.head });
    if (r.detached) r.detached = id; else r.branches[r.head] = id;
    this.reflog(r, 'merge ' + name + ': Merge made');
    return { out: (out.length ? out.join('\n') + '\n' : '') + "Merge made by the 'ort' strategy.", ok: true, merged: true, note: 'Git juntó los cambios solo, porque tocaban partes distintas. Creó un <b>commit de fusión</b> con dos padres.' };
  }
  g_merge(r, a) {
    if (a.includes('--abort')) { if (!r.merge) return { out: 'fatal: There is no merge to abort (MERGE_HEAD missing).', err: true }; const T = this.tree(this.headId(r)); r.files = Object.assign(Object.fromEntries(Object.entries(r.files).filter(([f]) => !(f in T) && !(f in this.tree(r.merge.theirs)))), clone(T)); r.index = clone(T); r.merge = null; return { out: '', ok: true, aborted: true, note: 'Botón de emergencia: la fusión se canceló y todo volvió a como estaba antes. Nadie perdió nada.' }; }
    const name = a.find(x => !x.startsWith('-')); if (!name) return { out: 'fatal: No remote for the current branch.', err: true };
    if (r.merge) return { out: 'error: Merging is not possible because you have unmerged files.', err: true };
    const id = this.resolve(r, name); if (!id) return { out: 'merge: ' + esc(name) + ' - not something we can merge', err: true };
    return this.doMerge(r, id, name);
  }
  g_fetch(r, a) {
    const R = this.remoteOf(r); if (!R) return { out: "fatal: 'origin' does not appear to be a git repository", err: true };
    const lines = [];
    Object.entries(R.branches).forEach(([b, id]) => { if (r.rt[b] !== id) lines.push((r.rt[b] ? '   ' + r.rt[b] + '..' + id + '  ' : ' * [new branch]      ') + b + ' -&gt; origin/' + b); r.rt[b] = id; });
    Object.entries(R.tags || {}).forEach(([t, v]) => { if (!r.tags[t]) { r.tags[t] = v; lines.push(' * [new tag]         ' + esc(t) + ' -&gt; ' + esc(t)); } });
    if (a.includes('--prune')) Object.keys(r.rt).forEach(b => { if (!R.branches[b]) { lines.push(' - [deleted]  origin/' + b); delete r.rt[b]; } });
    return { out: lines.length ? 'From ' + esc(r.remoteUrl) + '\n' + lines.join('\n') : '', ok: true, fetched: true, note: lines.length ? 'Trajiste la información nueva de GitLab, <b>sin tocar tus archivos</b>. Es mirar el buzón sin abrir las cartas.' : 'No había nada nuevo en GitLab.' };
  }
  g_pull(r) {
    if (r.detached) return { out: 'You are not currently on a branch.', err: true };
    if (!r.upstream[r.head]) return { out: 'There is no tracking information for the current branch.\nPlease specify which branch you want to merge with.', err: true, note: 'Esta rama todavía no está conectada con GitLab. Publícala primero con <code>git push -u origin ' + esc(r.head) + '</code>.' };
    const f = this.g_fetch(r, []);
    const res = this.doMerge(r, r.rt[r.head], 'origin/' + r.head);
    res.out = (f.out ? f.out + '\n' : '') + res.out; res.pulled = true;
    if (res.upToDate) res.note = 'Ya estabas al día: nadie había publicado nada nuevo en <b>' + esc(r.head) + '</b>.';
    else if (res.ff) res.note = 'Trajiste los cambios nuevos del equipo a tu rama. ' + res.note;
    return res;
  }
  g_push(r, a) {
    const R = this.remoteOf(r); if (!R) return { out: "fatal: No configured push destination.", err: true, note: 'Este proyecto no está conectado a GitLab todavía.' };
    if (a.includes('--force') || a.includes('-f')) return { out: '', err: true, note: '<b>push --force</b> reescribe la historia compartida y puede borrar trabajo del equipo. En este curso no lo usamos. Si tu push fue rechazado, haz <code>git pull</code> primero.' };
    if (a.includes('--delete')) { const b = a[a.length - 1]; const from = R.branches[b]; delete R.branches[b]; delete r.rt[b]; if (this.onRemoteWrite) this.onRemoteWrite({ type: 'delete', branch: b, from }); return { out: 'To ' + esc(r.remoteUrl) + '\n - [deleted]         ' + esc(b), ok: true }; }
    const names = a.filter(x => !x.startsWith('-'));
    if (names[0] === 'origin' && (r.tags[names[1]] || a.includes('--tags'))) {
      const list = a.includes('--tags') ? Object.keys(r.tags) : [names[1]]; list.forEach(t => { R.tags[t] = r.tags[t]; });
      if (this.onRemoteWrite) this.onRemoteWrite({ type: 'tags', list: list.map(t => [t, r.tags[t]]) });
      return { out: 'To ' + esc(r.remoteUrl) + '\n' + list.map(t => ' * [new tag]         ' + esc(t) + ' -&gt; ' + esc(t)).join('\n'), ok: true, pushedTags: list, note: 'Las etiquetas no viajan solas: ahora <b>' + list.map(esc).join(', ') + '</b> ya está en GitLab.' };
    }
    if (r.detached) return { out: 'fatal: You are not currently on a branch.', err: true };
    const b = names[1] || r.head, H = r.branches[b];
    if (!H) return { out: "error: src refspec " + esc(b) + " does not match any", err: true };
    if (!r.upstream[b] && !a.includes('-u') && !a.includes('--set-upstream') && !names[1]) return { out: 'fatal: The current branch ' + esc(b) + ' has no upstream branch.\nTo push the current branch and set the remote as upstream, use\n\n    git push --set-upstream origin ' + esc(b), err: true, note: 'Es la primera vez que publicas esta rama. Usa <code>git push -u origin ' + esc(b) + '</code>. Después bastará con <code>git push</code>.' };
    const cur = R.branches[b];
    if (cur && !this.ancestors(H).has(cur)) return { out: 'To ' + esc(r.remoteUrl) + '\n <span class="r">! [rejected]        ' + esc(b) + ' -&gt; ' + esc(b) + ' (fetch first)</span>\nerror: failed to push some refs\nhint: Updates were rejected because the remote contains work that you do\nhint: not have locally. Integrate the remote changes (e.g. \'git pull ...\')', err: true, rejected: true, note: '<b>Rechazado, y no es grave:</b> alguien publicó algo después de tu último pull. Haz <code>git pull</code> y vuelve a intentar.' };
    if (b === 'main' && R.protected) return { out: 'remote: GitLab: You are not allowed to push code to protected branches on this project.\n <span class="r">! [remote rejected] main -&gt; main (pre-receive hook declined)</span>', err: true, protectedReject: true, note: '<b>main está protegida</b>: nadie hace push directo. El camino es una rama + Merge Request.' };
    if (cur === H) return { out: 'Everything up-to-date', ok: true, pushed: b, note: 'Nada nuevo que publicar: GitLab ya tiene todos tus commits de <b>' + esc(b) + '</b>.' };
    const isNew = !cur; const prevRt = r.rt[b]; R.branches[b] = H; r.rt[b] = H;
    if (this.onRemoteWrite) this.onRemoteWrite({ type: 'push', branch: b, from: cur || null, to: H, prevRt }); if (a.includes('-u') || a.includes('--set-upstream')) r.upstream[b] = true;
    const mr = isNew && b !== 'main' ? '\nremote:\nremote: To create a merge request for ' + esc(b) + ', visit:\nremote:   https://gitlab.com/' + esc(r.remoteUrl.split(':')[1] || '').replace(/\.git$/, '') + '/-/merge_requests/new\nremote:' : '';
    return { out: (mr ? mr.slice(1) + '\n' : '') + 'To ' + esc(r.remoteUrl) + '\n   ' + (isNew ? ' * [new branch]      ' + esc(b) + ' -&gt; ' + esc(b) : (cur + '..' + H + '  ' + esc(b) + ' -&gt; ' + esc(b))) + (r.upstream[b] && isNew ? "\nbranch '" + esc(b) + "' set up to track 'origin/" + esc(b) + "'." : ''), ok: true, pushed: b, note: 'Publicado: tus commits de <b>' + esc(b) + '</b> ya están en GitLab y el equipo los puede ver.' + (mr ? ' GitLab te dejó un enlace para abrir la Merge Request.' : '') };
  }
  g_restore(r, a) {
    const staged = a.includes('--staged'), si = a.indexOf('--source');
    const src = si >= 0 ? a[si + 1] : null;
    let files = a.filter((x, i) => !x.startsWith('-') && (si < 0 || i !== si + 1));
    if (!files.length) return { out: 'fatal: you must specify path(s) to restore', err: true };
    if (files.includes('.')) files = staged ? Object.keys({ ...r.index, ...this.tree(this.headId(r)) }) : Object.keys(r.index);
    const H = this.tree(this.headId(r)); const done = [];
    for (const f of files) {
      if (src) { const id = this.resolve(r, src); if (!id) return { out: 'fatal: invalid source', err: true }; const t = this.tree(id)[f]; if (t === undefined) return { out: "error: pathspec '" + esc(f) + "' did not match", err: true }; r.files[f] = t; done.push(f); continue; }
      if (staged) { if (H[f] === undefined) delete r.index[f]; else r.index[f] = H[f]; done.push(f); continue; }
      if (r.index[f] === undefined) return { out: "error: pathspec '" + esc(f) + "' did not match any file(s) known to git", err: true, note: 'Git no puede restaurar un archivo que nunca guardó. Si es un archivo nuevo, simplemente bórralo con <code>rm</code>.' };
      if (r.files[f] !== r.index[f]) done.push(f); r.files[f] = r.index[f];
    }
    return { out: '', ok: true, restored: done, staged, note: src ? 'Recuperaste <b>' + done.map(esc).join(', ') + '</b> tal como estaba en ' + esc(src) + '. Revísalo y, si te sirve, haz commit.' : staged ? 'Sacaste <b>' + done.map(esc).join(', ') + '</b> de la caja. Tu cambio sigue en el archivo: no perdiste nada.' : (done.length ? 'Descartaste los cambios de <b>' + done.map(esc).join(', ') + '</b>. Volvió a su última versión guardada. Esos cambios no se pueden recuperar.' : 'No había cambios que descartar.') };
  }
  g_reset(r, a) {
    const mode = a.includes('--hard') ? 'hard' : a.includes('--soft') ? 'soft' : 'mixed';
    const ref = a.find(x => !x.startsWith('-')) || 'HEAD';
    const id = this.resolve(r, ref); if (!id) return { out: "fatal: ambiguous argument '" + esc(ref) + "'", err: true };
    const old = this.headId(r);
    if (r.detached) r.detached = id; else r.branches[r.head] = id;
    r.merge = null;
    const T = this.tree(id);
    if (mode !== 'soft') r.index = clone(T);
    if (mode === 'hard') { const keep = Object.fromEntries(Object.entries(r.files).filter(([f]) => !(f in T) && !(f in this.tree(old)))); r.files = Object.assign(keep, clone(T)); }
    this.reflog(r, 'reset: moving to ' + ref);
    const pub = r.rt[r.head] && this.ancestors(r.rt[r.head]).has(old) && !this.ancestors(id).has(r.rt[r.head]) ? ' <b>Ojo:</b> deshiciste commits que ya estaban en GitLab; para eso se usa <code>git revert</code>.' : '';
    const notes = { soft: 'Deshiciste el commit, pero sus cambios <b>siguen en la caja</b>, listos para un commit nuevo.', mixed: 'Deshiciste el commit. Sus cambios <b>siguen en tus archivos</b>, fuera de la caja.', hard: 'Deshiciste el commit y <b>borraste sus cambios</b> de tus archivos. Si te arrepientes, <code>git reflog</code> todavía lo recuerda.' };
    return { out: mode === 'hard' ? 'HEAD is now at ' + id + ' ' + esc(this.commits[id].msg) : (mode === 'mixed' ? 'Unstaged changes after reset:\n' + this.changes(r).unstaged.map(([k, f]) => 'M\t' + esc(f)).join('\n') : ''), ok: true, reset: mode, from: old, to: id, note: (ref === 'HEAD' ? '' : notes[mode]) + pub };
  }
  g_revert(r, a) {
    const ref = a.find(x => !x.startsWith('-')); const id = this.resolve(r, ref);
    if (!id) return { out: 'fatal: bad revision', err: true };
    if (this.dirtyTracked(r)) return { out: 'error: your local changes would be overwritten by revert.', err: true, note: 'Deja tu carpeta limpia antes de revertir.' };
    const c = this.commits[id], H = this.headId(r), O = this.tree(H), B = c.tree, T = this.tree(c.parents[0]);
    const res = {}; let bad = false;
    new Set([...Object.keys(O), ...Object.keys(B), ...Object.keys(T)]).forEach(f => { const m = merge3(B[f], O[f], T[f], r.head, 'revert'); if (m.conflict) bad = true; else if (m.text !== undefined) res[f] = m.text; });
    if (bad) return { out: 'error: could not revert ' + id, err: true, note: 'Este revert choca con cambios posteriores. En el curso no lo necesitamos.' };
    const msg = 'Revert "' + c.msg + '"';
    const nid = this.mkCommit(r, { msg, tree: res, parents: [H], lane: r.head });
    r.branches[r.head] = nid; r.index = clone(res); r.files = Object.assign(Object.fromEntries(Object.entries(r.files).filter(([f]) => !(f in O))), clone(res));
    this.reflog(r, 'revert: ' + msg);
    return { out: '[' + esc(r.head) + ' ' + nid + '] ' + esc(msg), ok: true, reverted: id, commit: nid, note: 'Creaste un commit nuevo que hace lo contrario de ' + id + '. La historia no se borra: se ven los dos. Ahora publícalo con <code>git push</code>.' };
  }
  g_stash(r, a) {
    const sub = a[0] && !a[0].startsWith('-') ? a[0] : 'push';
    if (sub === 'list') return { out: r.stash.map((s, i) => 'stash@{' + i + '}: On ' + esc(s.branch) + ': ' + esc(s.msg)).join('\n') || '<span class="m">(el cajón está vacío)</span>', ok: true, listed: true };
    if (sub === 'push' || sub === 'save') {
      const mi = a.indexOf('-m'), msg = mi >= 0 ? a[mi + 1] : 'WIP on ' + r.head; const u = a.includes('-u');
      const c = this.changes(r);
      if (!c.staged.length && !c.unstaged.length && !(u && c.untracked.length)) return { out: 'No local changes to save', ok: true, note: 'No hay cambios que apartar.' + (c.untracked.length ? ' Los archivos nuevos solo se guardan con <code>-u</code>.' : '') };
      const H = this.tree(this.headId(r)); const saved = {};
      Object.keys({ ...r.files, ...H }).forEach(f => { const tracked = r.index[f] !== undefined || H[f] !== undefined; if ((tracked && r.files[f] !== H[f]) || (u && !tracked)) saved[f] = r.files[f]; });
      r.stash.unshift({ msg, branch: r.head, files: saved });
      Object.keys(saved).forEach(f => { if (H[f] === undefined) delete r.files[f]; else r.files[f] = H[f]; });
      r.index = clone(H);
      return { out: 'Saved working directory and index state On ' + esc(r.head) + ': ' + esc(msg), ok: true, stashed: true, note: 'Guardaste tu trabajo a medias en el <b>cajón</b> (stash) y tu carpeta quedó limpia. Ya puedes cambiar de rama tranquila o tranquilo.' + (mi < 0 ? ' Consejo: ponle siempre un nombre con <code>-m</code>.' : '') };
    }
    if (sub === 'pop' || sub === 'apply') {
      if (!r.stash.length) return { out: 'No stash entries found.', err: true };
      const s = r.stash[0];
      Object.entries(s.files).forEach(([f, v]) => { if (v === undefined) delete r.files[f]; else r.files[f] = v; });
      if (sub === 'pop') r.stash.shift();
      return { out: 'On branch ' + esc(r.head) + '\nChanges not staged for commit:\n' + Object.keys(s.files).map(f => '        <span class="r">modified:   ' + esc(f) + '</span>').join('\n') + (sub === 'pop' ? '\nDropped refs/stash@{0}' : ''), ok: true, popped: sub === 'pop', note: sub === 'pop' ? 'Sacaste tus cambios del cajón y volvieron a tu carpeta.' : 'Aplicaste los cambios, y además siguen guardados en el cajón por si acaso.' };
    }
    if (sub === 'drop') { if (!r.stash.length) return { out: 'No stash entries found.', err: true }; r.stash.shift(); return { out: 'Dropped refs/stash@{0}', ok: true }; }
    if (sub === 'show') { if (!r.stash.length) return { out: 'No stash entries found.', err: true }; const H = this.tree(this.headId(r)); return { out: Object.entries(r.stash[0].files).map(([f, v]) => this.fmtDiff(f, H[f], v)).join('\n\n'), ok: true }; }
    return { out: 'usage: git stash [push -m "..." | list | pop | apply | drop | show]', err: true };
  }
  g_reflog(r) { return { out: r.reflog.map((e, i) => '<span class="y">' + (e.id || '0000000') + '</span> HEAD@{' + i + '}: ' + esc(e.msg)).join('\n'), ok: true, reflog: true, note: 'Cada línea es un momento por el que pasó tu proyecto, incluso los commits que "borraste". Para recuperar uno: <code>git switch -c rescate CODIGO</code>.' }; }
  g_tag(r, a) {
    if (a.includes('-d')) { const t = a.find(x => !x.startsWith('-')); delete r.tags[t]; return { out: "Deleted tag '" + esc(t) + "'", ok: true }; }
    const names = a.filter((x, i) => !x.startsWith('-') && a[i - 1] !== '-m' && a[i - 1] !== '-l');
    if (!names.length) { const pat = a.includes('-l') ? a[a.indexOf('-l') + 1] : null; const re = pat ? new RegExp('^' + pat.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$') : null; return { out: Object.keys(r.tags).filter(t => !re || re.test(t)).sort().join('\n') || '<span class="m">(no hay etiquetas)</span>', ok: true, listedTags: true }; }
    const t = names[0]; if (r.tags[t]) return { out: "fatal: tag '" + esc(t) + "' already exists", err: true, note: 'No se mueve una etiqueta publicada: si hubo un error, la corrección es una versión nueva.' };
    const id = names[1] ? this.resolve(r, names[1]) : this.headId(r);
    const msg = this.parseMsg(a);
    if (!a.includes('-a') || !msg) { r.tags[t] = { id, msg: '' }; return { out: '', ok: true, tagged: t, note: 'Creaste una etiqueta <b>ligera</b>. Te recomendamos la <b>anotada</b>, que guarda autor, fecha y mensaje: <code>git tag -a ' + esc(t) + ' -m "..."</code>.' }; }
    r.tags[t] = { id, msg, annotated: true };
    return { out: '', ok: true, tagged: t, annotated: true, note: 'Etiqueta <b>' + esc(t) + '</b> creada sobre el commit ' + id + '. Recuerda: no viaja sola, publícala con <code>git push origin ' + esc(t) + '</code>.' };
  }
  g_blame(r, a) {
    const f = a.find(x => !x.startsWith('-')); const H = this.headId(r);
    const T = this.tree(H)[f]; if (T === undefined) return { out: "fatal: no such path '" + esc(f || '') + "' in HEAD", err: true };
    const lines = T.split('\n'); if (lines[lines.length - 1] === '') lines.pop();
    const out = lines.map(l => {
      let c = H;
      while (true) { const p = this.commits[c].parents[0]; if (!p) break; const pt = this.tree(p)[f]; if (pt === undefined || !pt.split('\n').includes(l)) break; c = p; }
      const cm = this.commits[c]; const nm = cm.author.split('<')[0].trim();
      return '<span class="y">' + c + '</span> (' + esc(nm).padEnd(11) + ' ' + cm.date.slice(0, 10) + ') ' + esc(l);
    }).join('\n');
    return { out, ok: true, blamed: f, note: 'Junto a cada línea: el commit, la persona y la fecha del último cambio. Úsalo para saber <b>a quién preguntar</b>, no para culpar.' };
  }
  g_remote(r, a) {
    if (a[0] === 'add') { r.remoteUrl = a[2]; if (!this.remotes[a[2]]) this.remotes[a[2]] = { branches: {}, tags: {} }; return { out: '', ok: true, note: 'Conectaste el proyecto con GitLab bajo el apodo <b>' + esc(a[1]) + '</b>.' }; }
    return { out: r.remoteUrl ? 'origin\t' + esc(r.remoteUrl) + ' (fetch)\norigin\t' + esc(r.remoteUrl) + ' (push)' : '', ok: true };
  }
  g_rm(r, a) { const f = a.find(x => !x.startsWith('-')); if (r.files[f] === undefined && r.index[f] === undefined) return { out: "fatal: pathspec '" + esc(f || '') + "' did not match any files", err: true }; delete r.files[f]; delete r.index[f]; if (r.merge) r.merge.conflicts = r.merge.conflicts.filter(x => x !== f); return { out: "rm '" + esc(f) + "'", ok: true }; }
  g_clean(r, a) { const c = this.changes(r).untracked; if (a.includes('-n')) return { out: c.map(f => 'Would remove ' + esc(f)).join('\n') || '', ok: true, note: 'Con <code>-n</code> solo miras. Nada se borró todavía.' }; if (a.includes('-f')) { c.forEach(f => delete r.files[f]); return { out: c.map(f => 'Removing ' + esc(f)).join('\n'), ok: true, note: 'Borrados para siempre: <code>git clean</code> no se recupera con reflog.' }; } return { out: 'fatal: clean.requireForce defaults to true; refusing to clean', err: true }; }
  g_help() { return { out: this.helpText() }; }
  g_init() { return { out: 'Reinitialized existing Git repository', ok: true }; }
  g_clone() { return { out: 'fatal: ya estás dentro de un repositorio. Sal con cd .. antes de clonar.', err: true }; }
  g_config(r, a) { return this.gConfig(a); }
}

/* ---------- escenarios listos para las misiones ---------- */
function seedRemote(sim, url, build) {
  // build(ctx) recibe helpers para crear commits en el remoto
  const R = { branches: {}, tags: {} }; sim.remotes[url] = R;
  const tmp = sim.newRepo('__tmp__'); let cur = null, tree = {};
  const ctx = {
    commit(msg, changes, author, lane) { tree = Object.assign({}, tree, changes); Object.keys(tree).forEach(k => { if (tree[k] === null) delete tree[k]; }); cur = sim.mkCommit(tmp, { msg, tree, parents: [cur], author: AUTHORS[author] || author || AUTHORS.ana, lane: lane || 'main' }); return cur; },
    get head() { return cur; }, set head(v) { cur = v; tree = clone(sim.tree(v)); }
  };
  build(ctx);
  R.branches.main = cur; delete sim.repos['__tmp__'];
  return R;
}
function setupClonedRepo(sim, name, build, opts = {}) {
  const url = 'git@gitlab.com:tu-usuario/' + name + '.git';
  seedRemote(sim, url, build);
  sim.user = { name: '‹YO›', email: '‹MAIL›' };
  const res = sim.gClone([url]); sim.cwd = '~/' + name;
  if (opts.protectMain) sim.remotes[url].protected = true;
  return { url, repo: sim.repos[name], res };
}
function teammatePush(sim, repo, branch, msg, changes, author) {
  const R = sim.remoteOf(repo); const base = R.branches[branch];
  const tree = Object.assign({}, sim.tree(base), changes);
  const id = sim.mkCommit(repo, { msg, tree, parents: [base], author: AUTHORS[author], lane: branch });
  R.branches[branch] = id; return id;
}
