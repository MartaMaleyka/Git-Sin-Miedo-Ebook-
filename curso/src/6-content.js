/* ================================================================
   Contenido del curso (basado en "Git sin miedo", de Marta Magallón)
   ================================================================ */
const ran = (re) => (s, r, c) => re.test(c) && !r.err;
const VERB_RX = /^[A-ZÁÉÍÓÚ][a-záéíóúñ]+(a|e)\b/;
const goodMsg = m => VERB_RX.test(m || '') && m.split(/\s+/).length >= 3 && !/^(Cambios|Arreglos|Update|Prueba)\b/i.test(m);
const rp = s => s.repo;

const MODULES = [
/* ------------------------------------------------------------ 0 */
{ id: 'm0', n: 0, title: 'El caos antes de Git', short: 'Por qué existe el control de versiones', time: '15 min', goal: 'Entender qué problema resuelve Git',
  blocks: [
  { story: `<p>Seguro reconoces esta carpeta:</p><pre class="cmd">Informe/
├── informe.docx
├── informe_v2.docx
├── informe_v2_revisado.docx
├── informe_final.docx
├── informe_final_AHORA_SI.docx
└── informe_final_v3_DEFINITIVO_Carlos.docx</pre><p>¿Cuál es la versión buena? ¿Qué cambió entre <i>v2</i> y <i>final</i>? ¿Quién hizo cada cambio y por qué? Nadie lo sabe con certeza. Y eso que es un solo documento.</p>` },
  { act: 'flips', title: 'Los cuatro problemas de guardar a mano', intro: 'Toca cada tarjeta para descubrir el problema.', cards: [
    ['1 · No sabes qué cambió', 'Tienes dos archivos casi iguales y tendrías que leerlos línea por línea para encontrar la diferencia.'],
    ['2 · No sabes quién ni por qué', 'Aunque encuentres el cambio, no hay ninguna nota que diga quién lo hizo ni qué buscaba resolver.'],
    ['3 · No puedes volver atrás con seguridad', 'Si algo se rompe, ¿a cuál copia regresas? ¿Y qué pierdes al hacerlo?'],
    ['4 · El trabajo en equipo es una lotería', 'Dos personas editan el mismo archivo, se lo mandan por chat, y uno termina pisando lo del otro sin darse cuenta.']] },
  { text: `<h2>Qué es el control de versiones</h2><p>Es un sistema que <b>guarda la historia completa de tu proyecto por ti</b>, como un cuaderno de bitácora automático. Cada vez que terminas un avance le dices: <i>"guarda este momento"</i>. Y el sistema anota:</p><div class="grid2"><div class="mini"><b>Qué</b><p>cambió, línea por línea</p></div><div class="mini"><b>Quién</b><p>lo cambió</p></div><div class="mini"><b>Cuándo</b><p>lo cambió</p></div><div class="mini"><b>Por qué</b><p>con un mensaje corto que escribes tú</p></div></div><p>En vez de seis copias del informe, tienes <b>un solo archivo</b> con toda su historia guardada detrás.</p>` },
  { analogy: `<h3>Los puntos de guardado de un videojuego</h3><p>Antes de enfrentar al jefe final, guardas la partida. Si pierdes, vuelves a ese punto sin empezar desde cero. Git funciona igual: cada "guardado" es una foto de tu proyecto. La diferencia es que en Git <b>cada foto lleva una nota</b> explicando qué hiciste.</p>` },
  { act: 'compare' },
  { text: `<h2>Lo que Git no es</h2><ul><li><b>No es una copia de seguridad automática.</b> Solo guarda lo que tú le dices, y solo comparte lo que tú publicas.</li><li><b>No es Google Drive ni Dropbox.</b> Esos sincronizan solos a cada momento. Git guarda momentos que tú eliges, con una explicación.</li><li><b>No es ideal para archivos pesados</b> (videos, Word, Excel): los guarda, pero no te muestra qué cambió por dentro.</li><li><b>No decide por ti.</b> Si dos personas cambian lo mismo, te pregunta. Eso se llama <i>conflicto</i> y lo practicarás en el módulo 6.</li></ul><p>Y un dato: Git lo creó <b>Linus Torvalds en 2005</b>, el mismo creador de Linux, en pocas semanas. Es <b>distribuido</b>: cada persona tiene una copia completa de la historia, así que puedes trabajar sin internet.</p>` },
  { act: 'sort', title: '¿Mito o realidad?', buckets: ['Mito', 'Realidad'], items: [
    ['"Git es solo para programadores expertos."', 0, 'Lo básico se aprende en una tarde.'],
    ['"La mayoría de los comandos solo miran o guardan."', 1],
    ['"Si uso Git, puedo romper el proyecto de todos."', 0, 'Trabajas en tu copia y tu rama, y los cambios se revisan antes de entrar.'],
    ['"Si me equivoco, pierdo todo."', 0, 'Git guarda tanta historia que casi todo se puede recuperar.'],
    ['"Git sirve también para documentación, sitios web y configuraciones."', 1],
    ['"Cada persona tiene una copia completa de toda la historia."', 1]], why: 'Es más difícil perder trabajo con Git que sin él.' },
  { act: 'quiz', qs: [
    { q: '‹A› cambia el horario y ‹B› el teléfono, al mismo tiempo, en el mismo archivo pero en líneas distintas. Con Git, ¿qué pasa?', o: ['Git junta los dos cambios porque tocan partes distintas', 'Gana el último que publica', 'Git borra los dos cambios', 'Git elige uno al azar'], a: 0, why: 'Git es muy bueno juntando cambios en partes distintas. Solo pregunta cuando chocan en las mismas líneas.' },
    { q: '¿Qué cuatro cosas anota Git de cada cambio?', o: ['Qué, quién, cuándo y por qué', 'Solo la fecha', 'El tamaño del archivo y su nombre', 'La contraseña de quien lo hizo'], a: 0, why: 'Qué cambió, quién, cuándo y por qué (con tu mensaje).' }] },
  { act: 'checklist', items: ['Puedo explicar con mis palabras qué es el control de versiones.', 'Entiendo los cuatro problemas de guardar versiones a mano.', 'Sé que Git guarda qué, quién, cuándo y por qué de cada cambio.', 'Sé que un conflicto es cuando dos personas tocan lo mismo, y que Git me pide decidir.'] },
  { tip: `<b>Ejercicio fuera de pantalla:</b> abre una carpeta tuya y busca archivos con nombres como <i>final</i>, <i>v2</i> o <i>copia</i>. Elige uno y responde: ¿cuál es la versión buena? ¿quién cambió qué? Anota cuánto tardaste. Al terminar el curso, compara con lo que Git responde en segundos.` }
]},
/* ------------------------------------------------------------ 1 */
{ id: 'm1', n: 1, title: 'Git, GitLab y GitHub sin enredos', short: 'El cuaderno y la biblioteca', time: '20 min', goal: 'Separar la herramienta de la plataforma',
  blocks: [
  { analogy: `<h3>El cuaderno y la biblioteca</h3><p><b>Git es tu cuaderno.</b> En él anotas cada avance, con fecha y explicación. Es tuyo, vive en tu computadora y funciona sin internet.</p><p><b>GitLab y GitHub son la biblioteca.</b> Un lugar compartido donde dejas una copia de tu cuaderno para que el equipo la vea, la copie y le agregue cosas. Además tiene salas de reunión, tablones de anuncios y personas que revisan lo que entra.</p>` },
  { text: `<div class="table"><table><tr><th></th><th>Git</th><th>GitLab / GitHub</th></tr><tr><td>Qué es</td><td>Programa que instalas</td><td>Sitio web / plataforma</td></tr><tr><td>Dónde vive</td><td>Tu computadora</td><td>Internet (GitLab también en servidores de tu empresa)</td></tr><tr><td>¿Sin internet?</td><td>Sí</td><td>No</td></tr><tr><td>Para qué</td><td>Guardar la historia de cambios</td><td>Compartir, revisar y organizar en equipo</td></tr></table></div><p class="muted" style="margin:0">En GitHub, lo que en GitLab es una <b>Merge Request</b> se llama <b>Pull Request</b>. Es lo mismo con otro nombre.</p>` },
  { act: 'sort', title: '¿Git o plataforma?', intro: 'Clasifica cada frase.', buckets: ['Git', 'GitLab / GitHub'], items: [
    ['Se instala en tu computadora', 0], ['Tiene Issues y Merge Requests', 1], ['Funciona sin internet', 0], ['Es donde el equipo revisa los cambios antes de aceptarlos', 1], ['Guarda la historia en una carpeta oculta llamada .git', 0], ['Muestra si el pipeline pasó o falló', 1]] },
  { text: `<h2>Las palabras que vas a escuchar todo el tiempo</h2>` },
  { act: 'flips', title: 'Vocabulario básico', cards: [
    ['Repositorio (repo)', 'La carpeta del proyecto con toda su historia. Por dentro tiene una carpeta oculta <code>.git</code>. Nunca la toques a mano.'],
    ['Commit', 'Un punto de guardado: una foto del proyecto con un mensaje que explica qué cambiaste.'],
    ['Historial', 'La lista de todos los commits, del más reciente al más antiguo.'],
    ['Local y remoto', '<b>Local</b>: la copia en tu computadora. <b>Remoto</b>: la copia en GitLab, la que comparte el equipo.'],
    ['Rama', 'Una línea de trabajo paralela para probar cosas sin tocar la versión principal (módulo 4).'],
    ['Push y pull', '<b>Push</b> (empujar): envías tus commits a GitLab. <b>Pull</b> (jalar): traes los de otros a tu computadora.']] },
  { story: `<p><b>La idea que más confunde:</b> guardar un cambio en tu computadora <b>no es lo mismo</b> que publicarlo. Si haces commit pero nunca haces push, tu trabajo existe solo en tu computadora. Si el disco se daña, se pierde. Y tu equipo nunca lo vio. Este malentendido causa muchísimos <i>"pero yo sí lo guardé"</i>.</p>` },
  { act: 'journey' },
  { text: `<h2>Qué hay dentro de un commit</h2><div class="table"><table><tr><th>Parte</th><th>Ejemplo</th></tr><tr><td>Identificador único</td><td><code>a3f9c21</code></td></tr><tr><td>Autor</td><td>‹A› &lt;ana@ejemplo.com&gt;</td></tr><tr><td>Fecha</td><td>8 de octubre, 10:42 a.m.</td></tr><tr><td>Mensaje</td><td>Corrige teléfono de contacto</td></tr><tr><td>Commit anterior</td><td><code>7b2e104</code></td></tr></table></div><p>Ese último punto es la clave: <b>cada commit apunta al anterior</b>, como los eslabones de una cadena. Por eso Git puede reconstruir el proyecto en cualquier momento, y por eso un commit no se puede "editar en secreto": si cambias uno viejo, cambian todos los identificadores que vienen después.</p>` },
  { act: 'quiz', qs: [
    { q: 'Hiciste tres commits esta mañana pero ningún push. Tu compañero dice que no ve nada en GitLab. ¿Por qué?', o: ['Porque los commits viven solo en tu computadora hasta que haces push', 'Porque GitLab tarda un día en mostrarlos', 'Porque tu compañero no tiene permisos', 'Porque los commits se borran al apagar la computadora'], a: 0, why: 'Commit guarda en tu cuaderno; push lo lleva a la biblioteca.' },
    { q: 'Vas a crear un proyecto nuevo del trabajo y no sabes qué visibilidad elegir. ¿Qué conviene?', o: ['Privado: siempre puedes abrirlo después', 'Público: así cualquiera ayuda', 'Interno, sin pensarlo', 'Da igual'], a: 0, why: 'Ante la duda, empieza en privado. Lo contrario es más delicado: lo que estuvo público pudo haber sido copiado.' },
    { q: '¿Qué pasa si borras la carpeta del proyecto en tu computadora?', o: ['Si habías hecho push, lo vuelves a clonar; lo no publicado se pierde', 'Se borra también en GitLab', 'Nada, Git lo recupera solo', 'Se pierde todo para siempre'], a: 0, why: 'GitLab tiene la copia de lo que publicaste.' }] },
  { act: 'checklist', items: ['Sé que Git es un programa y GitLab/GitHub son plataformas web.', 'Puedo explicar qué es un repositorio, un commit y el historial.', 'Entiendo la diferencia entre repositorio local y remoto.', 'Sé que hacer commit no es publicar: para compartir hay que hacer push.', 'Sé que en GitHub una Merge Request se llama Pull Request.'] },
  { tip: `<b>Ejercicio en GitLab real:</b> crea una cuenta gratuita en gitlab.com, abre cualquier proyecto público, lee su README y entra a la sección de commits. Elige tres y anota quién, cuándo y qué dice su mensaje. Solo mira, no toques nada.` }
]},
/* ------------------------------------------------------------ 2 */
{ id: 'm2', n: 2, title: 'Prepara tu computadora', short: 'Instalar, configurar y clonar', time: '25 min', goal: 'Tener Git listo y tu primer proyecto descargado',
  blocks: [
  { text: `<h2>La terminal no muerde</h2><p>La terminal es una ventana donde escribes órdenes y la computadora las ejecuta. Tres reglas para no asustarte:</p><ol><li>Escribes la orden y pulsas <b>Enter</b>.</li><li>Si no aparece ningún mensaje, casi siempre significa que <b>todo salió bien</b>.</li><li>Si te equivocas al escribir, no pasa nada: sale un error y vuelves a intentar.</li></ol><div class="table"><table><tr><th>Sistema</th><th>Cómo abrirla</th></tr><tr><td>Windows</td><td>Instala Git desde git-scm.com y abre <b>Git Bash</b></td></tr><tr><td>Mac</td><td>Cmd + Espacio, escribe <b>Terminal</b></td></tr><tr><td>Linux</td><td>Ctrl + Alt + T</td></tr></table></div>` },
  { text: `<h2>Dile a Git quién eres</h2><p>Cada commit llevará tu nombre y correo. Se configura <b>una sola vez</b>:</p><pre class="cmd">git config --global user.name "‹YO› Apellido"
git config --global user.email "‹MAIL›"</pre><p><code>--global</code> significa "para todos mis proyectos en esta computadora". Usa <b>el mismo correo que en GitLab</b>: así GitLab conecta tus commits con tu perfil.</p>` },
  { analogy: `<h3>SSH: el candado y la llave</h3><p>Le das el <b>candado</b> (llave pública, el archivo que termina en <code>.pub</code>) a GitLab. La <b>llave privada</b> se queda en tu computadora y <b>nunca</b> la compartes. Cuando te conectas, GitLab comprueba que tu llave abre su candado.</p>` },
  { act: 'quiz', qs: [
    { q: 'Tienes dos archivos: <code>id_ed25519</code> e <code>id_ed25519.pub</code>. ¿Cuál pegas en GitLab?', o: ['<code>id_ed25519.pub</code>, la pública', '<code>id_ed25519</code>, la privada', 'Los dos', 'Ninguno, se manda por correo'], a: 0, why: 'El que termina en .pub se puede compartir. El otro nunca sale de tu computadora: ni por correo, ni por chat, ni dentro de un repositorio.', fb: { 1: '¡Cuidado! La privada es tu llave de la casa. Nunca se comparte.', 2: 'La privada nunca se comparte.' } },
    { q: 'Trabajas a diario con GitLab y no quieres que te pida credenciales a cada rato. ¿Qué conexión conviene?', o: ['SSH con llaves', 'HTTPS con token', 'Mandar los archivos por correo', 'Ninguna, Git no se conecta'], a: 0, why: 'SSH tiene un par de pasos más al inicio, pero luego no te pide nada. HTTPS con token sirve para empezar rápido o en redes que bloquean SSH.' },
    { q: 'Tus commits aparecen en GitLab sin tu foto y con un nombre raro. ¿Lo más probable?', o: ['El correo configurado en Git no coincide con el de tu cuenta de GitLab', 'GitLab está caído', 'Hiciste demasiados commits', 'Te falta instalar Git otra vez'], a: 0, why: 'Revísalo con <code>git config user.email</code> y corrígelo. Los commits nuevos saldrán bien.' }] },
  { text: `<h2>Clonar o empezar de cero</h2><div class="table"><table><tr><th></th><th>git clone</th><th>git init</th></tr><tr><td>Qué hace</td><td>Descarga un proyecto que ya existe en GitLab</td><td>Convierte una carpeta tuya en repositorio nuevo</td></tr><tr><td>¿Trae historia?</td><td>Sí, toda</td><td>No, empieza vacío</td></tr><tr><td>¿Conectado a GitLab?</td><td>Sí</td><td>No, hay que conectarlo</td></tr><tr><td>Cuándo</td><td>Casi siempre, al unirte a un proyecto</td><td>Cuando empiezas algo desde tu computadora</td></tr></table></div><p>Al clonar, Git le pone a la copia de GitLab el apodo <b><code>origin</code></b>. Lo verás en comandos como <code>git push -u origin mi-rama</code>: significa "envía a GitLab".</p><p><code>cd</code> significa "cambiar de directorio": es como hacer doble clic en una carpeta. <code>cd ..</code> te devuelve atrás y <code>ls</code> muestra lo que hay.</p>` },
  { act: 'term', title: 'Misión: deja tu computadora lista', xp: 50,
    intro: 'Aquí empieza <b>tu proyecto del curso</b>: <code>sitio-oficina</code>, la página web de la oficina que mantienes con ‹A› y ‹B›. Lo vas a descargar ahora y lo harás crecer en cada módulo. La terminal es un simulador seguro; a la derecha ves en vivo lo que pasa en tu computadora y en GitLab.',
    setup: s => buildProject(s, 'm2'), project: true,
    quick: ['git --version', 'git config --global --list', 'ls', 'help'],
    goals: [
      { t: 'Comprueba que Git está instalado', hint: 'git --version', check: ran(/^git --version$/) },
      { t: 'Configura tu nombre', hint: 'git config --global user.name "‹YO›"', check: s => !!s.user.name },
      { t: 'Configura tu correo (el mismo de GitLab)', hint: 'git config --global user.email "‹MAIL›"', check: s => /@/.test(s.user.email) },
      { t: 'Revisa lo que configuraste', hint: 'git config --global --list', check: ran(/^git config( --global)? (--list|-l)$/) },
      { t: 'Prueba tu conexión SSH con GitLab', hint: 'ssh -T git@gitlab.com', check: ran(/^ssh -T git@gitlab\.com$/) },
      { t: 'Clona el proyecto <code>sitio-oficina</code>', hint: 'git clone ' + PROJECT_URL, check: s => !!s.repos[PROJ], why: 'La dirección la copias del botón azul <b>Code</b> en GitLab.' },
      { t: 'Entra a la carpeta del proyecto', hint: 'cd sitio-oficina', check: s => s.cwd === '~/sitio-oficina' },
      { t: 'Mira qué hay dentro', hint: 'ls', check: (s, r, c) => /^ls/.test(c) && s.cwd === '~/sitio-oficina' }],
    outro: 'Tienes Git configurado y <code>sitio-oficina</code> en tu computadora. En el próximo módulo harás tu primer cambio en él.' },
  { act: 'sort', title: 'Lo que ves y qué significa', buckets: ['Estás fuera del proyecto', 'GitLab no reconoce tu llave', 'La dirección está mal o no tienes acceso', 'Git no está instalado'], items: [
    ['<code>fatal: not a git repository</code>', 0], ['<code>Permission denied (publickey)</code>', 1], ['<code>Repository not found</code>', 2], ['<code>git: command not found</code>', 3]], why: 'Cada error tiene un mensaje claro. Leerlo con calma es la mitad de la solución.' },
  { act: 'checklist', items: ['Sé abrir la terminal en mi computadora.', 'Configuré mi nombre y el mismo correo que uso en GitLab.', 'Entiendo la diferencia entre HTTPS (token) y SSH (llaves).', 'Sé que la llave privada nunca se comparte.', 'Sé clonar un proyecto y moverme entre carpetas con cd.'] },
  { tip: `<b>En tu computadora real:</b> instala Git, crea en GitLab un proyecto en blanco llamado <code>sitio-oficina</code> con la opción <i>Initialize repository with a README</i>, y clónalo. Si usas Windows, ejecuta una vez <code>git config --global core.autocrlf true</code>.` }
]},
/* ------------------------------------------------------------ 3 */
{ id: 'm3', n: 3, title: 'Tu primer ciclo: mira antes de guardar', short: 'status, diff, add, commit, push', time: '35 min', goal: 'Hacer tu primer ciclo completo sin sustos',
  blocks: [
  { analogy: `<h3>Las tres zonas: preparar un envío por correo</h3><div class="grid2"><div class="mini"><b>1 · La mesa de trabajo</b><p>Tu carpeta (directorio de trabajo). Aquí editas y todo está en desorden. Está bien.</p></div><div class="mini"><b>2 · La caja abierta</b><p>El área de preparación (<i>staging</i>). Metes solo lo que va en este paquete. Puedes sacar y meter.</p></div><div class="mini"><b>3 · El paquete cerrado</b><p>El commit. Cerraste la caja y le pusiste una etiqueta. Queda en tu historial.</p></div><div class="mini"><b>4 · La oficina de correos</b><p>GitLab. El paquete no llega hasta que lo envías con <code>push</code>.</p></div></div>` },
  { act: 'zones' },
  { text: `<h2>El ciclo, comando por comando</h2><pre class="cmd">git status                 <span class="c"># 1. ¿Qué cambió? (solo mira, úsalo sin miedo)</span>
git diff                   <span class="c"># 2. ¿Qué cambié exactamente? (sal con q)</span>
git add archivo            <span class="c"># 3. Elijo qué entra en la caja</span>
git diff --staged          <span class="c">#    Reviso la caja antes de cerrarla</span>
git commit -m "Mensaje"    <span class="c"># 4. Cierro el paquete con un buen mensaje</span>
git log --oneline          <span class="c"># 5. Veo la historia</span>
git pull                   <span class="c"># 6. Traigo lo nuevo del equipo...</span>
git push                   <span class="c">#    ...y publico</span></pre><p><b>Sobre <code>git add .</code>:</b> mete todo lo que cambió. No está prohibido, pero úsalo <b>solo después de mirar</b> <code>git status</code>. ¿Metiste algo por error? <code>git restore --staged archivo</code> lo saca de la caja sin perder el cambio.</p>` },
  { text: `<h2>Tres trucos que te van a servir</h2><div class="grid2"><div class="mini"><b>Elegir pedazos: <code>git add -p</code></b><p>Si cambiaste dos cosas distintas en el mismo archivo, Git te muestra cada bloque y respondes <b>y</b> (sí, entra) o <b>n</b> (no, se queda fuera). Así cumples la regla "un commit, una idea".</p></div><div class="mini"><b>Corregir el último commit: <code>--amend</code></b><p><code>git commit --amend -m "Mensaje corregido"</code> reemplaza tu último commit. <b>Solo si todavía no hiciste push</b>; si ya lo publicaste, haz un commit nuevo con la corrección.</p></div><div class="mini"><b>¿Cada cuánto hago commit?</b><p>Cuando terminas una idea completa, aunque sea pequeña. Si puedes describir el cambio en una línea clara, es buen momento. No esperes días.</p></div></div>` },
  { text: `<h2>.gitignore: lo que nunca debe entrar</h2><p>Un archivo de texto en la raíz del proyecto con la lista de lo que Git debe ignorar: contraseñas (<code>.env</code>), archivos del sistema (<code>.DS_Store</code>), carpetas que se generan solas (<code>node_modules/</code>) o tus notas personales. Lo que está ahí deja de salir en <code>git status</code>, así no lo agregas por accidente.</p><p class="muted" style="margin:0"><b>Ojo:</b> solo funciona con archivos que todavía no se guardaron. Si ya entró en un commit, agregarlo después no lo borra del historial.</p>` },
  { act: 'commitJudge' },
  { act: 'term', title: 'Misión: tu primer ciclo completo', xp: 60,
    intro: 'Seguimos con <code>sitio-oficina</code>. Ya agregaste tu nombre al README y creaste <code>notas-personales.txt</code> con apuntes tuyos. Mientras tanto, ‹A› publicó un cambio en GitLab (todavía no lo sabes).',
    setup: s => buildProject(s, 'm3'), project: true,
    quick: ['git status', 'git diff', 'git diff --staged', 'git log --oneline', 'cat .gitignore'],
    goals: [
      { t: 'Mira qué está pasando', hint: 'git status', check: ran(/^git status$/) },
      { t: 'Mira exactamente qué cambiaste', hint: 'git diff', check: ran(/^git diff$/) },
      { t: 'Crea un <code>.gitignore</code> que ignore tus notas', hint: 'echo "notas-personales.txt" > .gitignore', check: s => /notas-personales\.txt/.test(rp(s).files['.gitignore'] || '') },
      { t: 'Vuelve a mirar: tus notas ya no deberían aparecer', hint: 'git status', check: ran(/^git status$/) },
      { t: 'Mete en la caja, <b>por nombre</b>, el README y el .gitignore', hint: 'git add README.md .gitignore', check: s => { const r = rp(s); return r.index['README.md'] === r.files['README.md'] && r.index['.gitignore'] !== undefined && r.index['notas-personales.txt'] === undefined; } },
      { t: 'Revisa la caja antes de cerrarla', hint: 'git diff --staged', check: ran(/^git diff --(staged|cached)$/) },
      { t: 'Haz el commit con un mensaje que empiece con un verbo', hint: 'git commit -m "Agrega mi nombre al README e ignora notas personales"', check: (s, r) => !!r.commit && goodMsg(r.msg), why: 'Ejemplo: <i>Agrega mi nombre al README e ignora notas personales</i>.' },
      { t: 'Mira la historia', hint: 'git log --oneline', check: ran(/^git log/) },
      { t: 'Intenta publicar con <code>git push</code>', hint: 'git push', check: (s, r) => !!r.rejected || (!!r.pushed && !r.err) },
      { t: 'Te lo rechazaron: alguien publicó antes. Trae lo nuevo', hint: 'git pull', check: (s, r) => !!r.pulled && !r.err },
      { t: 'Ahora sí, publica', hint: 'git push', check: s => { const r = rp(s); return s.remoteOf(r).branches.main === r.branches.main; } }],
    outro: 'Fíjate en el mapa: el commit de ‹A› y el tuyo se juntaron. Por eso se dice <b>pull antes de push</b>.' },
  { act: 'sort', title: 'Lo que ves y qué hacer', buckets: ['git add primero', 'git pull', 'git push', 'Nada: todo está guardado'], items: [
    ['<code>nothing added to commit</code>', 0], ['<code>rejected ... (fetch first)</code> al hacer push', 1], ["<code>Your branch is ahead of 'origin/main' by 2 commits</code>", 2], ["<code>Your branch is behind 'origin/main'</code>", 1], ['<code>nothing to commit, working tree clean</code>', 3]] },
  { act: 'quiz', qs: [
    { q: 'Cambiaste dos cosas en el mismo archivo: una corrección y una prueba. Solo quieres guardar la corrección. ¿Qué usas?', o: ['<code>git add -p archivo</code> y eliges pedazo por pedazo', '<code>git add .</code>', '<code>git commit -a</code>', 'Borras la prueba para siempre'], a: 0, why: 'Con <code>-p</code> Git te muestra cada bloque y respondes <b>y</b> (sí) o <b>n</b> (no). Perfecto para "un commit, una idea".' },
    { q: 'Escribiste mal el mensaje del último commit y <b>todavía no hiciste push</b>. ¿Qué haces?', o: ['<code>git commit --amend -m "Mensaje corregido"</code>', 'Borras la carpeta y clonas de nuevo', '<code>git push --force</code>', 'Nada, no se puede'], a: 0, why: 'Solo si no has hecho push. Si ya publicaste, haz un commit nuevo con la corrección.' },
    { q: '¿Cuándo es buen momento para un commit?', o: ['Cuando terminas una idea completa y puedes describirla en una línea', 'Una vez por semana', 'Solo al final del proyecto', 'Cada vez que guardas el archivo en el editor'], a: 0, why: 'Si puedes describir el cambio en una línea clara, es buen momento.' }] },
  { act: 'checklist', items: ['Uso git status antes y después de cada paso.', 'Reviso mis cambios con git diff antes de guardarlos.', 'Agrego archivos por nombre y solo uso git add . después de mirar.', 'Sé sacar un archivo de la caja con git restore --staged.', 'Escribo mensajes que empiezan con un verbo y dicen qué cambia.', 'Hago git pull antes de git push.', 'Tengo un .gitignore y sé para qué sirve.'] }
]},
/* ------------------------------------------------------------ 4 */
{ id: 'm4', n: 4, title: 'Ramas: trabaja sin miedo', short: 'Borradores paralelos de tu proyecto', time: '35 min', goal: 'Nunca trabajar directo en main',
  blocks: [
  { story: `<p>Tu equipo mantiene el sitio web de la oficina. Te piden rediseñar el formulario de contacto: tres días de trabajo. Si trabajas directo en <code>main</code>, durante tres días la versión principal tiene un formulario a medio hacer. Y si alguien necesita corregir algo urgente, tendría que publicar también tu trabajo incompleto. <b>Con una rama</b>, todo ese rediseño pasa aparte, y <code>main</code> sigue intacta.</p>` },
  { analogy: `<h3>El borrador</h3><p><code>main</code> es el documento oficial publicado. Una rama es un <b>borrador</b> que sacas a partir de él. Escribes, tachas y reescribes; el oficial no cambia. Cuando tu borrador está listo y alguien lo revisa, sus cambios pasan al oficial: eso es <b>fusionar</b> (<i>merge</i>). Y cada persona puede tener sus propios borradores a la vez.</p>` },
  { text: `<h2>Cómo se ve una rama por dentro</h2><pre class="cmd">main:            A --- B --- C
                        \\
formulario-nuevo:        D --- E</pre><p>Una rama es solo <b>una etiqueta que apunta al último commit</b> de una línea de trabajo. Cuando haces commit, la etiqueta avanza. Por eso crear una rama es instantáneo: Git no copia archivos.</p><pre class="cmd">git switch main && git pull          <span class="c"># parte de main actualizada</span>
git switch -c feature/formulario     <span class="c"># crea la rama y entra (-c = create)</span>
git push -u origin feature/formulario <span class="c"># publícala la primera vez</span>
git merge main                       <span class="c"># trae lo nuevo de main a tu rama</span>
git branch -d feature/formulario     <span class="c"># bórrala cuando ya se fusionó</span></pre><p>El <code>-u</code> de <code>git push -u</code> se usa solo la primera vez: conecta tu rama con la de GitLab para que después baste con <code>git push</code>.</p><p><b>¿Y mis cambios sin guardar si cambio de rama?</b> Pueden viajar contigo o Git puede no dejarte cambiar para no pisarlos. Regla sencilla: antes de cambiar de rama, deja la carpeta limpia (haz commit, o apártalos en el "cajón" con <code>git stash</code>, que verás en el módulo 7).</p><p class="muted" style="margin:0">En tutoriales viejos verás <code>git checkout -b</code>. Hace lo mismo; <code>switch</code> es la forma moderna y clara.</p>` },
  { act: 'term', title: 'Misión: tu primera rama', xp: 60,
    intro: 'Tu commit del módulo anterior ya está en GitLab. Ahora vas a agregar a <code>sitio-oficina</code> la sección "Sobre mí", en una rama y sin tocar main. Mira cómo se dibuja la rama en el mapa a cada paso.',
    setup: s => buildProject(s, 'm4'), project: true,
    quick: ['git status', 'git branch', 'git log --oneline --graph --all', 'ls'],
    goals: [
      { t: 'Asegúrate de partir de main al día', hint: 'git pull', check: (s, r) => !!r.pulled && !r.err },
      { t: 'Crea la rama <code>feature/seccion-sobre-mi</code> y entra en ella', hint: 'git switch -c feature/seccion-sobre-mi', check: s => rp(s).head === 'feature/seccion-sobre-mi' },
      { t: 'Crea <code>sobre-mi.md</code> y haz tu primer commit en la rama', hint: 'echo "# Sobre mí" > sobre-mi.md', why: 'Luego: <code>git add sobre-mi.md</code> y <code>git commit -m "Agrega sección Sobre mí"</code>.', check: s => { const r = rp(s), b = r.branches['feature/seccion-sobre-mi']; return b && s.tree(b)['sobre-mi.md'] !== undefined; } },
      { t: 'Agrega una línea más y haz un segundo commit', hint: 'echo "Me gusta aprender Git sin miedo" >> sobre-mi.md', why: 'Luego <code>git add sobre-mi.md</code> y <code>git commit -m "Agrega presentación en Sobre mí"</code>.', check: s => { const r = rp(s), b = r.branches['feature/seccion-sobre-mi']; return b && [...s.ancestors(b)].filter(x => !s.ancestors(r.branches.main).has(x)).length >= 2; } },
      { t: 'Publica tu rama en GitLab por primera vez', hint: 'git push -u origin feature/seccion-sobre-mi', check: s => { const r = rp(s); return s.remoteOf(r).branches['feature/seccion-sobre-mi'] === r.branches['feature/seccion-sobre-mi']; } },
      { t: 'Vuelve a main', hint: 'git switch main', check: s => rp(s).head === 'main' },
      { t: 'Busca <code>sobre-mi.md</code> con ls. ¿Está?', hint: 'ls', check: (s, r, c) => /^ls/.test(c) && rp(s).head === 'main' },
      { t: 'Vuelve a tu rama: ahí sigue tu archivo', hint: 'git switch feature/seccion-sobre-mi', check: s => rp(s).head === 'feature/seccion-sobre-mi' },
      { t: 'Mira las ramas dibujadas', hint: 'git log --oneline --graph --all', check: ran(/^git log.*--graph/) }],
    outro: 'El archivo "desaparece" en main porque sigue guardado en la otra rama. Nada se perdió. En el próximo módulo pedirás que revisen esta rama con una Merge Request.' },
  { act: 'branchNames' },
  { act: 'order', title: 'Un error urgente en medio de tu trabajo', intro: '‹A› está a mitad del rediseño en <code>feature/formulario-contacto</code> y le piden corregir el teléfono hoy. Ordena lo que hace:', steps: [
    'Hace commit de lo que lleva en su rama: <code>Avance: estructura del nuevo formulario</code>',
    'Vuelve a main y la actualiza: <code>git switch main</code> y <code>git pull</code>',
    'Crea la rama de la corrección: <code>git switch -c fix/telefono-pie-de-pagina</code>',
    'Corrige, hace commit y push, y pide revisión',
    'La corrección se fusiona en main y se publica el mismo día',
    'Vuelve a su rama: <code>git switch feature/formulario-contacto</code>',
    'Trae la corrección a su rama: <code>git merge main</code>'], why: 'El error urgente se resolvió sin publicar el formulario a medias. Imposible de hacer limpio si todos trabajan en main.' },
  { act: 'quiz', qs: [
    { q: 'Tienes cambios sin commit e intentas cambiar de rama. Git dice que tus cambios "would be overwritten". ¿Qué haces?', o: ['Hago commit o los aparto con git stash antes de cambiar', 'Borro la carpeta del proyecto', 'Uso git push --force', 'Ignoro el mensaje'], a: 0, why: 'Regla sencilla: antes de cambiar de rama, deja tu carpeta limpia.' },
    { q: '¿Cuánto debería vivir una rama?', o: ['Días, no semanas', 'Meses', 'Para siempre', 'Exactamente un año'], a: 0, why: 'Mientras más tiempo vive separada de main, más difícil es juntarlas. Si la dejas semanas separada, al juntarla aparecen muchos conflictos a la vez (módulo 6).' },
    { q: '<code>git branch -d mi-rama</code> responde "not fully merged". ¿Qué significa?', o: ['Git te protege: esa rama tiene commits que no están en main', 'La rama ya no existe', 'Necesitas internet', 'Escribiste mal el comando'], a: 0, why: 'Revisa antes de borrar. Solo si estás segura o seguro de perder ese trabajo se usa <code>-D</code>.' }] },
  { act: 'checklist', items: ['Puedo explicar qué es una rama con mis propias palabras.', 'Antes de crear una rama, actualizo main con git pull.', 'Sé crear una rama y cambiarme con git switch -c y git switch.', 'Sé publicar una rama nueva con git push -u origin.', 'Dejo la carpeta limpia antes de cambiar de rama.', 'Nombro mis ramas con tipo/descripcion-corta.', 'Mantengo mis ramas cortas: días, no semanas.'] }
]},
/* ------------------------------------------------------------ 5 */
{ id: 'm5', n: 5, title: 'Merge Requests: pide permiso para integrar', short: 'Otro par de ojos antes de entrar a main', time: '30 min', goal: 'Abrir, describir, responder y fusionar una MR',
  blocks: [
  { text: `<h2>Por qué no simplemente fusionar</h2><p>Podrías juntar tu rama con main desde la terminal sin preguntar a nadie. Pero perderías tres cosas valiosas:</p><div class="grid2"><div class="mini"><b>Otro par de ojos</b><p>Quien escribe un cambio casi nunca ve sus propios errores.</p></div><div class="mini"><b>Un registro de la decisión</b><p>Qué se cambió, por qué, quién lo revisó y qué se discutió.</p></div><div class="mini"><b>Aprendizaje en equipo</b><p>Al revisar el trabajo de otros conoces partes del proyecto que no tocas.</p></div></div><p class="muted" style="margin:0">En GitHub se llama <b>Pull Request</b>. "Abre un PR" y "abre una MR" es lo mismo.</p>` },
  { act: 'order', title: 'El recorrido completo de una Merge Request', steps: ['Trabajas en tu rama y haces push', 'Abres la Merge Request: "quiero juntar feature/x con main"', 'Asignas a alguien para revisar', 'Revisan y dejan comentarios', 'Respondes y corriges con nuevos commits en la misma rama', 'Aprueban', 'Se fusiona y la rama se borra', 'Todos actualizan su main con git pull'] },
  { text: `<h2>Una buena descripción le ahorra a tu compañero adivinar</h2><pre class="cmd">## Qué cambia
Agrega validación del correo en el formulario de contacto.

## Por qué
Recibíamos mensajes que no podíamos responder.
Closes #42

## Cómo probarlo
1. Abre la página de contacto.
2. Escribe un correo sin @ y pulsa Enviar.
3. Debe aparecer "Correo no válido".</pre><p><code>Closes #42</code> enlaza la MR con la tarea número 42 (un <i>issue</i>) y la cierra sola al fusionar; lo verás en el módulo 8.</p><p><b>Squash:</b> al fusionar puedes marcar la opción de juntar todos los commits de tu rama en uno solo. Así diez commits como "avance" o "corrijo typo" entran a main como uno limpio.</p><p><b>Borrador (Draft):</b> si tu trabajo no está terminado pero quieres una opinión temprana, márcala como borrador. No se puede fusionar hasta que pulses <i>Mark as ready</i>.</p>` },
  { act: 'mr' },
  { text: `<h2>Cómo escribir buenos comentarios</h2><p>La revisión es sobre el código, no sobre la persona. Y ayuda marcar la importancia de cada comentario: <b>Bloqueante</b> (corregir antes de fusionar), <b>Sugerencia</b> (mejoraría, no es obligatorio), <b>Detalle</b> o <i>nit</i> (algo menor) y <b>Pregunta</b> (solo quieres entender).</p>` },
  { act: 'sort', title: '¿Comentario útil o comentario que duele?', buckets: ['Útil', 'Mejorable'], items: [
    ['"Esto está mal."', 1, 'No dice qué está mal ni por qué.'],
    ['"Aquí falta validar que la fecha no esté vacía. Si llega vacía, el formulario falla."', 0],
    ['"¿Por qué hiciste esto así?"', 1, 'Suena a reproche. Mejor: "¿Qué te llevó a este enfoque? Pregunto porque X podría ser más sencillo."'],
    ['"Sugerencia: total_mensual sería más claro que tm."', 0],
    ['"Me gustó cómo separaste esta parte, se entiende muy bien."', 0],
    ['"Cambia el nombre."', 1, '¿A cuál? ¿Por qué? Propón uno concreto.']], why: 'Concreto, con el porqué, y sin olvidar lo bueno.' },
  { act: 'quiz', qs: [
    { q: 'Tu MR tiene 2,000 líneas de cambios. ¿Qué es lo más probable?', o: ['Que se apruebe por cansancio, sin revisarse de verdad', 'Que se revise mejor por ser grande', 'Que GitLab la rechace', 'Nada especial'], a: 0, why: 'Una de 50 líneas se revisa con atención en diez minutos. Si es grande, divídela: una MR, una tarea.' },
    { q: '¿Qué hace <b>squash</b> al fusionar?', o: ['Junta todos los commits de tu rama en uno solo al entrar a main', 'Borra la rama sin fusionar', 'Revisa la ortografía', 'Ejecuta el pipeline'], a: 0, why: 'Diez commits como "avance", "otro avance", "corrijo typo" entran como uno solo y limpio.' }] },
  { act: 'checklist', items: ['Reviso siempre la rama origen y la rama destino.', 'Escribo títulos claros y descripciones con qué cambia, por qué y cómo probarlo.', 'Reviso mi propia Merge Request antes de pedir revisión.', 'Escribo comentarios sobre el código, no sobre la persona.', 'Sé que un push a la misma rama actualiza la Merge Request.', 'Después del merge, actualizo main y borro mi rama local.'] }
]},
/* ------------------------------------------------------------ 6 */
{ id: 'm6', n: 6, title: 'Conflictos: no borres el trabajo del otro', short: 'Git te pide ayuda, no es un error', time: '35 min', goal: 'Resolver conflictos entendiendo los dos lados',
  blocks: [
  { story: `<p><b>El conflicto gigante:</b> imagina que dejas tu rama separada de main <b>durante semanas</b>. Mientras tanto, main sigue cambiando. Cuando por fin quieres juntarlas, Git marca conflictos en archivo tras archivo. Cada uno es sencillo; el problema es la cantidad, y que ya no recuerdas por qué hiciste cada cambio. <b>Un conflicto pequeño hoy se resuelve en cinco minutos. Veinte acumulados te pueden costar un día entero.</b></p><p>Y el error más común: aparece el conflicto, la persona se asusta y se queda con su versión sin leer la otra. El conflicto desaparece de la pantalla... y el trabajo de un compañero se pierde en silencio.</p>` },
  { text: `<h2>Por qué aparecen</h2><p>Git junta solo los cambios en partes distintas. El conflicto aparece únicamente cuando <b>dos decisiones humanas chocan</b>:</p><ul><li>Dos personas cambian <b>las mismas líneas</b> (‹A› pone 5:00 y ‹B› 4:30).</li><li>Una persona <b>borra</b> un archivo y otra lo <b>modifica</b>.</li><li>Dos personas crean un archivo con el <b>mismo nombre</b>.</li></ul><h3>Cómo se lee</h3><pre class="cmd">&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD                      <span class="c">← empieza TU versión (la rama donde estás)</span>
Horario: lunes a viernes, 8:00 a 5:00
=======                           <span class="c">← separa las dos versiones</span>
Horario: lunes a viernes, 8:00 a 4:30
&gt;&gt;&gt;&gt;&gt;&gt;&gt; fix/horario-viernes       <span class="c">← termina la versión que llega</span></pre><p>Todo lo que está fuera de las marcas no tiene conflicto.</p>` },
  { act: 'order', title: 'Resolver paso a paso', steps: ['No entres en pánico, no borres nada (si necesitas pensar: <code>git merge --abort</code>)', 'Entiende los dos cambios: ¿qué intentaba cada uno? Pregunta si dudas', 'Decide cómo debe quedar: tu versión, la otra, ambas o combinar', 'Edita el archivo y quita las tres marcas', 'Marca como resuelto y guarda: <code>git add</code> y <code>git commit</code>', 'Verifica que todo funciona'], why: 'La regla de oro: un conflicto se resuelve entendiendo los dos cambios, no eligiendo el tuyo por defecto.' },
  { act: 'conflict' },
  { act: 'term', title: 'Misión: provoca un conflicto a propósito', xp: 60,
    intro: 'Tu sección "Sobre mí" ya se fusionó en main. Ahora <code>sitio-oficina</code> tiene una página nueva, <code>horario.md</code> (8:00 a 4:00). En tu rama <code>fix/horario-tarde</code> la cambiaste a 8:00 a 5:00, y en <code>main</code> se cambió la misma línea a 7:00 a 4:00. Al juntarlas habrá conflicto.',
    setup: s => buildProject(s, 'm6'), project: true,
    quick: ['git status', 'cat horario.md', 'git merge --abort', 'git log --oneline --graph --all'],
    goals: [
      { t: 'Trae main a tu rama', hint: 'git merge main', check: (s, r) => !!r.conflict },
      { t: 'Lee el aviso y mira el estado', hint: 'git status', check: ran(/^git status$/) },
      { t: 'Abre el archivo e identifica las marcas', hint: 'cat horario.md', check: ran(/^cat horario\.md$/) },
      { t: 'Prueba el botón de emergencia: cancela la fusión', hint: 'git merge --abort', check: (s, r) => !!r.aborted },
      { t: 'Vuelve a traer main (sin miedo)', hint: 'git merge main', check: (s, r) => !!r.conflict },
      { t: 'Resuelve combinando: <code>Horario: 7:00 a 5:00</code>, sin marcas', hint: 'echo "Horario: 7:00 a 5:00" > horario.md', check: s => { const f = rp(s).files['horario.md'] || ''; return /7:00 a 5:00/.test(f) && !/^(<{7}|={7}|>{7})/m.test(f); } },
      { t: 'Marca el archivo como resuelto', hint: 'git add horario.md', check: s => rp(s).merge && !rp(s).merge.conflicts.length },
      { t: 'Termina la fusión con un commit', hint: 'git commit -m "Combina apertura a las 7:00 con cierre a las 5:00"', check: (s, r) => !!r.merge },
      { t: 'Publica tu rama', hint: 'git push -u origin fix/horario-tarde', check: s => !!s.remoteOf(rp(s)).branches['fix/horario-tarde'] }],
    outro: 'En el mapa, el commit de fusión es el círculo hueco: tiene <b>dos padres</b>. Nadie perdió su cambio.' },
  { act: 'sort', title: 'Prevenir o provocar', intro: '¿Cada costumbre previene conflictos o los provoca?', buckets: ['Previene', 'Provoca'], items: [
    ['Ramas cortas: días, no semanas', 0], ['Hacer git pull antes de empezar cada día', 0], ['Reformatear un archivo entero mezclado con cambios reales', 1], ['Avisar en el chat del equipo si dos van a tocar el mismo archivo', 0], ['Esperar un mes para integrar', 1], ['Commits y Merge Requests pequeños', 0]] },
  { act: 'quiz', qs: [
    { q: 'En VS Code ves los botones <i>Accept Current</i>, <i>Accept Incoming</i>, <i>Accept Both</i>. ¿Cuál es el riesgo?', o: ['Hacen fácil el error de "aceptar lo mío" sin leer', 'Borran el repositorio', 'Hacen push automático', 'Ninguno'], a: 0, why: 'Son cómodos, pero lee los dos bloques antes de hacer clic.' },
    { q: 'El conflicto es en <code>logo.png</code>, una imagen. ¿Qué haces?', o: ['Hablas con la otra persona y eliges una versión completa con --ours o --theirs', 'Editas las marcas en la imagen', 'Borras la imagen', 'Combinas las dos imágenes con git'], a: 0, why: 'Git no puede mostrar diferencias dentro de una imagen. Uno de los dos va a perder su versión: hablen antes.' }] },
  { act: 'checklist', items: ['Entiendo que un conflicto no es un error: Git me pide decidir.', 'Sé leer las marcas <<<<<<<, ======= y >>>>>>>.', 'Sé cancelar con git merge --abort cuando necesito pensar.', 'Nunca acepto mi versión por defecto sin leer la otra.', 'Busco marcas olvidadas y pruebo el resultado.', 'Provoqué y resolví un conflicto en mi proyecto de práctica.'] }
]},
/* ------------------------------------------------------------ 7 */
{ id: 'm7', n: 7, title: 'Botiquín de emergencias', short: 'Deshacer sin perder trabajo', time: '40 min', goal: 'Saber qué comando usar en cada accidente',
  blocks: [
  { text: `<h2>Antes de tocar nada: las dos preguntas</h2><p>Cuando algo sale mal, respira y responde: <b>1. ¿Dónde está el error?</b> y <b>2. ¿Quiero perder ese cambio o conservarlo?</b></p><div class="table"><table><tr><th>Dónde está el error</th><th>Herramienta</th><th>¿Pierdo el cambio?</th></tr><tr><td>Archivo modificado, sin add</td><td><code>git restore archivo</code></td><td>Sí, se descarta</td></tr><tr><td>En la caja, sin commit</td><td><code>git restore --staged archivo</code></td><td>No, solo sale de la caja</td></tr><tr><td>Commit local, sin push</td><td><code>git reset</code></td><td>Depende de la opción</td></tr><tr><td>Commit ya publicado</td><td><code>git revert</code></td><td>No, se crea un commit que lo anula</td></tr><tr><td>Trabajo a medias que quiero apartar</td><td><code>git stash</code></td><td>No, queda guardado aparte</td></tr></table></div><p><b>Vocabulario:</b> <code>HEAD</code> es el commit en el que estás ahora mismo. <code>HEAD~1</code> significa "un commit antes", <code>HEAD~2</code> dos antes, y así.</p><p><b>La regla que te salva:</b> lo que ya publicaste no se reescribe, se corrige con un commit nuevo. ¿Ya hiciste push? Entonces <b>revert</b>.</p>` },
  { act: 'undo' },
  { act: 'reset' },
  { act: 'term', title: 'Misión 1: restore y reset --soft', xp: 50,
    intro: 'El conflicto del horario quedó resuelto y fusionado. Ahora, trabajando en <code>sitio-oficina</code>, escribiste algo que no querías en el README. Vamos a deshacer con calma.',
    setup: s => buildProject(s, 'm7a'), project: true,
    quick: ['git status', 'git diff', 'git log --oneline', 'cat README.md'],
    goals: [
      { t: 'Mira qué vas a perder antes de descartarlo', hint: 'git diff README.md', check: ran(/^git diff( README\.md)?$/) },
      { t: 'Descarta el cambio del README', hint: 'git restore README.md', check: (s, r) => (r.restored || []).includes('README.md') && !r.staged },
      { t: 'Agrega una línea a contacto.md y métela en la caja', hint: 'echo "Correo: info@ejemplo.com" >> contacto.md', why: 'Luego <code>git add contacto.md</code>.', check: s => { const r = rp(s); return r.index['contacto.md'] !== s.tree(s.headId(r))['contacto.md']; } },
      { t: 'Sácala de la caja, sin perder el cambio', hint: 'git restore --staged contacto.md', check: (s, r) => !!r.staged && rp(s).files['contacto.md'] !== rp(s).index['contacto.md'] },
      { t: 'Vuelve a meterla y haz un commit con un mensaje <b>feo</b> (a propósito)', hint: 'git add contacto.md', why: 'Luego <code>git commit -m "cosas"</code>.', check: (s, r) => !!r.commit },
      { t: 'Deshaz ese commit conservando todo en la caja', hint: 'git reset --soft HEAD~1', check: (s, r) => r.reset === 'soft' },
      { t: 'Rehazlo con un buen mensaje', hint: 'git commit -m "Agrega correo de contacto"', check: (s, r) => !!r.commit && goodMsg(r.msg) }],
    outro: 'Restore para archivos, reset para commits locales. Y nadie se enteró del mensaje feo.' },
  { act: 'term', title: 'Misión 2: revert y stash', xp: 50,
    intro: '‹B› agregó a <code>sitio-oficina</code> un reporte mensual. Esta mañana publicaste en tu rama <code>feature/reporte</code> el commit <i>Cambia formato de totales</i>, y rompió el cálculo. Además te van a interrumpir con una urgencia.',
    setup: s => buildProject(s, 'm7b'), project: true,
    quick: ['git status', 'git log --oneline', 'git stash list', 'cat reporte.md'],
    goals: [
      { t: 'Busca el código del commit que rompió el total', hint: 'git log --oneline', check: ran(/^git log/) },
      { t: 'Ya está publicado: anúlalo con un commit nuevo', hint: 'git revert CODIGO', why: 'Cambia CODIGO por el identificador amarillo de <i>Cambia formato de totales</i>.', check: (s, r) => !!r.reverted && s.commits[r.reverted].msg === 'Cambia formato de totales' },
      { t: 'Publica la reversión', hint: 'git push', check: s => s.remoteOf(rp(s)).branches['feature/reporte'] === rp(s).branches['feature/reporte'] },
      { t: 'Empieza un ajuste a medias en reporte.md', hint: 'echo "Nota: falta revisar diciembre" >> reporte.md', check: s => rp(s).files['reporte.md'] !== rp(s).index['reporte.md'] },
      { t: '¡Urgencia! Aparta tu trabajo a medias con un nombre', hint: 'git stash push -m "Ajustes del reporte"', check: (s, r) => !!r.stashed },
      { t: 'Ve a main a atender la urgencia', hint: 'git switch main', check: s => rp(s).head === 'main' },
      { t: 'Urgencia atendida. Vuelve a tu rama', hint: 'git switch feature/reporte', check: s => rp(s).head === 'feature/reporte' },
      { t: 'Recupera tu trabajo del cajón', hint: 'git stash pop', check: (s, r) => !!r.popped }],
    outro: 'Revert no borra historia: se ven los dos commits. Y el stash es para minutos u horas, no para semanas.' },
  { act: 'term', title: 'Misión 3: rescate con reflog', xp: 40,
    intro: 'Acabas de agregar a <code>sitio-oficina</code> la lista del equipo (sin publicar todavía). Vas a "perderla" a propósito y recuperarla. Este es el secreto que tranquiliza a todo el mundo.',
    setup: s => buildProject(s, 'm7c'), project: true,
    quick: ['git log --oneline', 'git reflog', 'ls', 'git branch'],
    goals: [
      { t: 'Mira la historia: tu último commit es <i>Agrega lista del equipo</i>', hint: 'git log --oneline', check: ran(/^git log/) },
      { t: 'Bórralo con reset --hard (a propósito)', hint: 'git reset --hard HEAD~1', check: (s, r) => r.reset === 'hard' },
      { t: 'Compruébalo: ya no está en el historial', hint: 'git log --oneline', check: ran(/^git log/) },
      { t: 'Abre la red de seguridad', hint: 'git reflog', check: (s, r) => !!r.reflog },
      { t: 'Crea la rama <code>rescate</code> en el commit perdido', hint: 'git switch -c rescate CODIGO', why: 'Cambia CODIGO por el de la línea <i>commit: Agrega lista del equipo</i>.', check: s => { const r = rp(s), b = r.branches.rescate; return b && s.commits[b].msg === 'Agrega lista del equipo'; } }],
    outro: 'Límites: el reflog vive solo en tu computadora, dura unas semanas y no recupera lo que nunca tuvo commit.' },
  { act: 'sort', title: 'Comandos que piden respeto', intro: '¿Lo que borran se puede recuperar con reflog?', buckets: ['Sí, por un tiempo', 'No'], items: [
    ['<code>git restore archivo</code> (cambios sin commit)', 1], ['<code>git reset --hard</code> (los commits)', 0], ['<code>git clean -f</code> (archivos que Git no sigue)', 1], ['<code>git branch -D</code> (una rama no fusionada)', 0]], why: 'Antes de cualquiera de ellos: git status y git log.' },
  { act: 'quiz', qs: [{ q: 'Subiste por error una contraseña en un commit. ¿Qué es lo primero?', o: ['Cambiar la contraseña o revocar el token de inmediato', 'Hacer git revert y listo', 'Borrar el repositorio', 'Esperar a ver si alguien lo nota'], a: 0, why: 'Aunque la borres con un commit nuevo, sigue en la historia. Cambiarla es lo único que realmente te protege. Luego avisa a seguridad.' }] },
  { act: 'checklist', items: ['Antes de deshacer algo, me pregunto dónde está el error y si ya lo publiqué.', 'Sé descartar cambios con git restore y sé que no se recuperan.', 'Uso git revert para commits ya publicados.', 'Conozco las tres formas de git reset y uso --hard con mucho cuidado.', 'Nunca hago push --force sobre ramas compartidas.', 'Sé apartar trabajo con git stash y recuperarlo con git stash pop.', 'Sé usar git reflog para recuperar commits "perdidos".'] }
]},
/* ------------------------------------------------------------ 8 */
{ id: 'm8', n: 8, title: 'Organiza el trabajo en GitLab', short: 'Issues, etiquetas, milestones y tableros', time: '25 min', goal: 'Conectar la tarea con el código que la resolvió',
  blocks: [
  { story: `<p>Sin un lugar central, las tareas viven en mensajes sueltos: <i>"¿alguien vio lo del formulario?"</i>, <i>"creo que ‹B› lo iba a hacer"</i>, <i>"¿eso ya se arregló?"</i>. Con GitLab, cada tarea tiene una ficha, un responsable y un estado. Y cada cambio en el código se enlaza con la tarea que lo pidió.</p>` },
  { act: 'flips', title: 'Las herramientas de organización', cards: [
    ['Issue', 'Una ficha de trabajo con número propio (#42): un error, una función nueva, una duda. Un buen issue lo puede tomar otra persona sin preguntarte nada.'],
    ['Etiquetas (labels)', 'Marcas de colores para clasificar: tipo, prioridad, estado, área. Pocas y claras, acordadas en equipo.'],
    ['Milestone', 'Un objetivo con fecha (una versión, un sprint). Muestra una barra de progreso: ¿vamos a llegar?'],
    ['Tablero (board)', 'Issues como tarjetas en columnas, estilo Kanban. Mover una tarjeta le cambia la etiqueta.'],
    ['Wiki', 'La memoria del proyecto: guías, procedimientos y decisiones. Por dentro, es otro repositorio Git.']] },
  { text: `<h2>La magia: enlazar todo con el número del issue</h2><pre class="cmd">fix/42-fecha-vacia-formulario                       <span class="c"># en el nombre de la rama</span>
git commit -m "Valida fecha obligatoria (#42)"      <span class="c"># en el mensaje del commit</span>
Closes #42                                          <span class="c"># en la descripción de la MR</span></pre><p>Con <code>Closes #42</code> (o <code>Fixes</code>, <code>Resolves</code>), GitLab <b>cierra el issue solo</b> cuando se fusiona la MR. El atajo más cómodo: dentro del issue, el botón <b>Create merge request</b> crea la rama y la MR ya enlazadas.</p>` },
  { act: 'kanban' },
  { act: 'order', title: 'Un buen reporte de error', intro: 'Ordena las secciones de la plantilla de issue para reportar un error.', steps: ['<b>Qué pasa:</b> al enviar el formulario sin fecha aparece una página en blanco', '<b>Pasos para reproducirlo:</b> 1. Ir a contacto 2. Dejar la fecha vacía 3. Pulsar Enviar', '<b>Qué debería pasar:</b> aparecer "La fecha es obligatoria"', '<b>Dónde:</b> Chrome, versión de producción del 8 de octubre', '<b>Capturas</b> (adjuntar)'] },
  { act: 'quiz', qs: [
    { q: '¿Qué sección de un issue de "función nueva" evita la discusión de "yo pensé que también incluía…"?', o: ['Cuándo lo damos por terminado (criterios con casillas)', 'El título', 'La fecha límite', 'Las etiquetas'], a: 0, why: 'Las casillas <code>- [ ]</code> se marcan en GitLab a medida que avanzas.' },
    { q: 'Quieres enlazar una MR con el issue #42 <b>sin cerrarlo</b>. ¿Qué escribes?', o: ['Related to #42', 'Closes #42', 'Fixes #42', 'Delete #42'], a: 0, why: 'Closes, Fixes y Resolves cierran el issue al fusionar. Related to (o solo #42) solo enlaza.' },
    { q: '¿Wiki o carpeta docs/ para instrucciones técnicas que cambian con cada versión del código?', o: ['Carpeta docs/ en el repositorio, revisada con MR', 'Wiki', 'Un correo', 'El chat del equipo'], a: 0, why: 'docs/ va junto con cada versión y se revisa como el código. La wiki es ideal para guías generales y procesos.' }] },
  { act: 'checklist', items: ['Sé crear un issue con título claro, descripción y criterios de terminado.', 'Me asigno el issue antes de empezar y comento los avances en él.', 'Enlazo issues desde ramas, commits y Merge Requests.', 'Uso Closes #número para cerrar issues automáticamente.', 'Sé usar el tablero y entiendo que mover tarjetas cambia etiquetas.'] }
]},
/* ------------------------------------------------------------ 9 */
{ id: 'm9', n: 9, title: 'CI/CD: aprende a leer el semáforo', short: 'Revisiones automáticas en verde o rojo', time: '20 min', goal: 'Saber leer un pipeline y qué hacer si falla',
  blocks: [
  { analogy: `<h3>El control de calidad de una panadería</h3><p>Antes de que una bandeja salga a la tienda, pasa por estaciones: se revisa la masa, se hornea, se mide la temperatura, se empaca. Si una estación detecta un problema, la bandeja no avanza. Un <b>pipeline</b> hace lo mismo con tu código: cada estación es una revisión automática, y los errores se quedan en la fábrica.</p>` },
  { text: `<h2>Qué significa CI/CD</h2><div class="table"><table><tr><th></th><th>Qué hace</th><th>¿Quién decide publicar?</th></tr><tr><td>Integración continua (CI)</td><td>Revisa cada cambio automáticamente</td><td>Nadie publica todavía</td></tr><tr><td>Entrega continua</td><td>Deja una versión lista para publicar</td><td>Una persona pulsa el botón</td></tr><tr><td>Despliegue continuo</td><td>Publica automáticamente</td><td>Nadie: si todo pasa, se publica solo</td></tr></table></div><p>Un pipeline se organiza en <b>etapas</b> (stages) que se ejecutan en orden, y cada etapa tiene <b>trabajos</b> (jobs). La configuración vive en <code>.gitlab-ci.yml</code>. <b>En este curso no se configura</b>: solo aprendes a leerlo, que es lo que necesitas en un equipo que ya lo usa.</p>` },
  { act: 'pipeline' },
  { act: 'sort', title: 'Estado del pipeline: ¿qué haces?', buckets: ['Seguir con la revisión', 'No fusionar: revisar', 'Esperar', 'Arreglar la etapa anterior'], items: [
    ['🟢 <b>passed</b>', 0], ['🔴 <b>failed</b>', 1], ['🔵 <b>running</b>', 2], ['⚪ <b>pending</b>', 2], ['<b>skipped</b>: no se ejecutó porque una etapa anterior falló', 3]] },
  { act: 'quiz', qs: [
    { q: 'El pipeline está en verde. ¿Significa que el cambio es perfecto?', o: ['No: solo que las revisiones que existen pasaron; la revisión humana sigue siendo necesaria', 'Sí, ya no hace falta revisar', 'Significa que se publicó', 'Significa que no hay pruebas'], a: 0, why: 'La máquina revisa lo repetitivo y medible; las personas revisan la lógica y si resuelve lo que se pidió.' },
    { q: 'Un trabajo falló por algo que no tiene relación con tu cambio (un problema de red del runner). ¿Qué haces?', o: ['Pulsas Retry una vez; si vuelve a fallar igual, no es pasajero y pides ayuda', 'Modificas .gitlab-ci.yml para saltarlo', 'Fusionas en rojo', 'Desactivas todas las pruebas'], a: 0, why: 'Si no entiendes el error, pregunta en la MR con el enlace al trabajo fallido y las últimas líneas del registro.' }] },
  { act: 'checklist', items: ['Puedo explicar qué es integración continua y qué es entrega o despliegue continuo.', 'Sé qué es un pipeline, una etapa y un trabajo.', 'Reconozco los estados: passed, failed, running, pending, skipped.', 'Sé leer el registro de un trabajo fallido empezando por el final.', 'Nunca fusiono en rojo ni desactivo pruebas para pasar.'] }
]},
/* ------------------------------------------------------------ 10 */
{ id: 'm10', n: 10, title: 'Seguridad y buenas prácticas', short: 'Roles, ramas protegidas y secretos', time: '25 min', goal: 'Proteger el proyecto y tu cuenta',
  blocks: [
  { text: `<h2>Roles: el mínimo necesario</h2><div class="table"><table><tr><th>Rol</th><th>Qué puede hacer</th><th>Para quién</th></tr><tr><td>Guest</td><td>Ver el proyecto y crear issues</td><td>Personas usuarias que reportan errores</td></tr><tr><td>Reporter</td><td>Leer el código, comentar, gestionar issues</td><td>Analistas, jefaturas</td></tr><tr><td>Developer</td><td>Crear ramas, push, abrir MR</td><td>El equipo que desarrolla</td></tr><tr><td>Maintainer</td><td>Fusionar en ramas protegidas, configurar</td><td>Líderes técnicos</td></tr><tr><td>Owner</td><td>Control total, incluso borrar</td><td>Muy pocas personas</td></tr></table></div><p><b>Principio del menor privilegio:</b> no porque desconfíes de nadie, sino porque reduce el daño de un error o de una cuenta robada. No des Maintainer "por si acaso".</p>` },
  { act: 'sort', title: '¿Qué rol le das?', buckets: ['Guest', 'Reporter', 'Developer', 'Maintainer'], items: [
    ['Una usuaria del sistema que solo reporta errores', 0], ['La jefa del área que sigue el avance y comenta', 1], ['Un compañero nuevo del equipo de desarrollo', 2], ['La líder técnica que aprueba y fusiona en main', 3]] },
  { text: `<h2>Nunca guardes secretos en el repositorio</h2><p>Un <b>secreto</b> es una contraseña, un token o una llave que da acceso a algo. Si entra en un commit, queda en la historia para siempre y cualquiera con acceso al proyecto (o a una copia) puede verlo. Los secretos van en un archivo local <code>.env</code> que está en el <code>.gitignore</code>, o en las variables protegidas de GitLab, y el código solo lee su nombre (por ejemplo <code>process.env.API_TOKEN</code>).</p><h2>Ramas protegidas</h2><p>En <i>Settings › Repository › Protected branches</i>. Configuración recomendada para <code>main</code>: fusionar solo <b>Maintainers</b>, push directo <b>No one</b>, force push <b>desactivado</b>. Así, la única forma de cambiar main es una Merge Request aprobada: el flujo de los módulos 4 y 5 (rama + Merge Request) pasa de buena intención a regla.</p>` },
  { act: 'secrets' },
  { act: 'order', title: 'Si subiste un secreto: qué hacer, en este orden', steps: ['Cambia o revoca el secreto de inmediato (aunque el repo sea privado)', 'Avisa a la persona responsable de seguridad, sin vergüenza', 'Revisa si el secreto fue usado (registros de acceso)', 'Quita el secreto del código con un commit nuevo y muévelo a .env o a las variables de GitLab', 'Limpiar la historia, solo con acompañamiento de alguien con experiencia'], why: 'El paso 1 es el único que realmente te protege.' },
  { act: 'quiz', qs: [
    { q: '¿Cuál de estas protege mejor tu cuenta de GitLab si alguien obtiene tu contraseña?', o: ['La verificación en dos pasos (2FA)', 'Una contraseña más larga solamente', 'Cambiar el nombre de usuario', 'Tener muchos proyectos'], a: 0, why: 'Con 2FA, aunque tengan tu contraseña, no pueden entrar. Además: tokens con vencimiento, frase en tu llave SSH y bloquear tu computadora.' }] },
  { act: 'checklist', items: ['Entiendo los roles de GitLab y el principio del menor privilegio.', 'Sé qué es una rama protegida y por qué main lo está.', 'Nunca guardo secretos en el repositorio: uso .env y variables.', 'Sé qué hacer, en orden, si subo un secreto.', 'Tengo activada la verificación en dos pasos.'] }
]},
/* ------------------------------------------------------------ 11 */
{ id: 'm11', n: 11, title: 'Git con un agente: tú decides, la IA ejecuta', short: 'Automatizar sin perder el control', time: '15 min', goal: 'Usar IA como apoyo sin publicar a ciegas',
  blocks: [
  { story: `<p><b>Un flujo de trabajo sano con IA:</b> usas un asistente para planear el cambio, un editor con IA para escribirlo, y <b>revisas cada commit antes de hacer push</b>. La IA propone y escribe. Tú lees, entiendes, corriges y decides qué se publica. Ese último paso no es opcional: si publicas sin mirar, el responsable del cambio sigues siendo tú.</p><p>Por eso este módulo va casi al final: para supervisar a un agente necesitas entender todo lo anterior.</p>` },
  { act: 'sort', title: '¿Se puede automatizar?', buckets: ['Sí, con confirmación', 'No, es humano'], items: [
    ['Revisar en qué rama y estado estás', 0], ['Proponer el mensaje del commit', 0], ['Resolver conflictos', 1, 'Requiere entender los dos lados (módulo 6).'], ['git push a tu rama, después de que confirmes', 0], ['Aprobar una Merge Request', 1], ['Fusionar en una rama protegida', 1], ['Abrir una MR con descripción (tú revisas el texto)', 0], ['push --force, reset --hard, borrar ramas', 1], ['Manejar contraseñas', 1, 'Nunca se le pasan secretos a un agente.']] },
  { act: 'flips', title: 'Las cinco reglas de una automatización segura', cards: [
    ['1 · Validar antes de actuar', '¿Estoy en un repo? ¿En qué rama (que no sea main)? ¿Hay un merge a medias? ¿Archivos sospechosos como .env o llaves? Si algo no cuadra, se detiene y avisa.'],
    ['2 · Vista previa y confirmación', 'Te muestra los archivos, el diff, el mensaje y la rama. Y espera un "sí" escrito por ti.'],
    ['3 · Revisión humana en puntos críticos', 'Conflictos, ramas protegidas y Merge Requests: ahí siempre te devuelve el control.'],
    ['4 · Registro de cada comando', 'Fecha, proyecto, rama, comando y resultado. Si algo sale mal, sabes exactamente qué revertir.'],
    ['5 · Mínimos permisos', 'El token del agente solo puede lo indispensable. Nunca permisos de Maintainer "por comodidad".']] },
  { act: 'quiz', qs: [
    { q: 'El agente te muestra el diff y el diff incluye un archivo <code>.env</code> que no pediste tocar. ¿Qué haces?', o: ['No confirmo: saco ese archivo y reviso por qué apareció', 'Confirmo, el agente sabe lo que hace', 'Hago push --force', 'Lo ignoro, ya lo arreglaré'], a: 0, why: 'Revisa lo que el agente hizo como revisarías la MR de un compañero. Tú decides.' }] },
  { act: 'checklist', items: ['Sé qué se puede automatizar y qué no.', 'Conozco las cinco reglas de una automatización segura.', 'Reviso cada diff que propone un agente antes de confirmarlo.', 'Entiendo que el responsable del cambio sigo siendo yo.'] }
]},
/* ------------------------------------------------------------ 12 */
{ id: 'm12', n: 12, title: 'Investigar el historial: Git como detective', short: 'log, blame, diff y cómo se juntan las ramas', time: '35 min', goal: 'Responder "¿qué cambió?" en minutos',
  blocks: [
  { text: `<h2>Preguntas y comandos</h2><div class="table"><table><tr><th>Pregunta</th><th>Comando</th></tr><tr><td>¿Qué hizo ‹A›?</td><td><code>git log --oneline --author="‹A›"</code></td></tr><tr><td>¿Qué cambió esta semana?</td><td><code>git log --oneline --since="1 week ago"</code></td></tr><tr><td>¿Qué commits tocaron este archivo?</td><td><code>git log --oneline -- contacto.md</code></td></tr><tr><td>¿Qué commits mencionan "horario"?</td><td><code>git log --oneline --grep="horario"</code></td></tr><tr><td>¿Qué commit agregó o quitó este texto?</td><td><code>git log --oneline -S "500-0000"</code></td></tr><tr><td>¿Quién escribió cada línea?</td><td><code>git blame contacto.md</code></td></tr><tr><td>¿Cómo era el archivo antes?</td><td><code>git show a3f9c21:contacto.md</code></td></tr></table></div><p><b>Sobre blame:</b> significa "culpar", pero no lo uses para buscar culpables. Úsalo para saber <b>a quién preguntar</b>.</p>` },
  { act: 'term', title: 'Misión: el teléfono que cambió solo', xp: 60,
    intro: 'Mientras aprendías a organizarte, el equipo siguió trabajando en <code>sitio-oficina</code> y ya trajiste sus cambios con <code>git pull</code>. Ahora un usuario reporta que el teléfono de la página está mal: debería ser <b>500-0000</b>. Nadie recuerda haberlo cambiado. Investiga.',
    setup: s => buildProject(s, 'm12'), project: true,
    quick: ['git log --oneline', 'cat contacto.md', 'git blame contacto.md'],
    goals: [
      { t: 'Lista solo los commits de ‹A›', hint: 'git log --oneline --author="‹A›"', check: (s, r, c) => /--author/.test(c) && !r.err },
      { t: 'Busca los commits que mencionan "horario"', hint: 'git log --oneline --grep="horario"', check: (s, r, c) => /--grep/.test(c) && !r.err },
      { t: 'Encuentra dónde apareció o desapareció <code>500-0000</code>', hint: 'git log --oneline -S "500-0000"', check: (s, r, c) => /-S/.test(c) && (r.list || []).length >= 2 },
      { t: 'Abre el commit sospechoso para ver qué cambió', hint: 'git show CODIGO', why: 'Usa el código de <i>Actualiza pie de página</i>.', check: (s, r) => !!r.shown && s.commits[r.shown].msg === 'Actualiza pie de página' },
      { t: 'Confirma con blame de dónde viene la línea actual', hint: 'git blame contacto.md', check: (s, r) => r.blamed === 'contacto.md' },
      { t: 'Crea una rama para la corrección', hint: 'git switch -c fix/telefono-contacto', check: s => rp(s).head === 'fix/telefono-contacto' },
      { t: 'Corrige el número en el archivo', hint: "sed -i 's/500-1234/500-0000/' contacto.md", why: '<code>sed</code> reemplaza un texto por otro dentro del archivo.', check: s => /500-0000/.test(rp(s).files['contacto.md']) },
      { t: 'Guarda la corrección con un buen commit', hint: 'git commit -am "Corrige teléfono de contacto en la página"', why: 'O en dos pasos: <code>git add contacto.md</code> y <code>git commit -m "..."</code>.', check: s => { const r = rp(s), b = r.branches['fix/telefono-contacto']; return b && /500-0000/.test(s.tree(b)['contacto.md']) && goodMsg(s.commits[b].msg); } },
      { t: 'Compara tu rama con main', hint: 'git diff main fix/telefono-contacto', check: (s, r, c) => /^git (diff main|log --oneline main\.\.)/.test(c) && !r.err }],
    outro: 'Quince minutos, sin culpar a nadie. Al reorganizar el pie de página se copió un teléfono viejo. Aquí se nota el valor de los buenos mensajes de commit.' },
  { act: 'tabs', title: 'Cómo se juntan las ramas por dentro', intro: 'Explora las cuatro formas. Normalmente no lo decides tú: lo define tu equipo en <i>Settings › Merge requests › Merge method</i>.', tabs: [
    ['Fast-forward', `<pre class="cmd">Antes:   main: A --- B
Después: main: A --- B --- C --- D</pre><p>Si main <b>no cambió</b> desde que creaste tu rama, Git solo mueve la etiqueta. No se crea ningún commit nuevo.</p>`],
    ['Merge commit', `<pre class="cmd">main: A --- B --- E ------- M
rama:         C --- D ----/</pre><p>Si main sí cambió, Git crea un commit especial con <b>dos padres</b>. Muestra exactamente cuándo se trabajó en paralelo. Con muchas ramas, el dibujo se enreda.</p>`],
    ['Squash', `<pre class="cmd">main: A --- B --- E --- S     (S = C + D juntos)</pre><p>Todos los commits de la rama entran como <b>uno solo</b>. main queda limpia, un commit por tarea; se pierde el detalle de los pasos intermedios.</p>`],
    ['Rebase', `<pre class="cmd">main: A --- B --- E --- C' --- D'</pre><p>Reescribe tus commits como si los hubieras hecho después (por eso la comilla: son copias con otros identificadores). Historia en línea recta. <b>Regla de oro: nunca hagas rebase de commits que otras personas ya descargaron.</b></p>`]] },
  { act: 'fill', title: '¿Qué comando usarías?', qs: [
    { q: 'Quieres ver qué commits tiene tu rama <code>feature/formulario</code> que main todavía no tiene.', a: ['git log( --oneline)? main\\.\\.feature/formulario'], show: 'git log --oneline main..feature/formulario', hint: 'Usa dos puntos entre las ramas: primero la base.', why: 'Al revés (<code>feature/formulario..main</code>) ves lo que te falta de main.' },
    { q: 'Quieres traer lo nuevo de GitLab <b>sin juntarlo todavía</b> con tu trabajo, para mirar primero.', a: ['git fetch'], show: 'git fetch', hint: 'pull hace dos cosas: fetch + merge. Solo quieres la primera.', why: 'Es mirar el buzón sin abrir las cartas. Luego comparas con <code>git log main..origin/main</code>.' }] },
  { act: 'checklist', items: ['Sé filtrar el historial por autor, fecha, archivo, mensaje y texto.', 'Sé usar git blame para saber a quién preguntar.', 'Sé comparar ramas con git diff y git log main..rama.', 'Entiendo que pull = fetch + merge.', 'Conozco fast-forward, merge commit, squash y rebase.'] }
]},
/* ------------------------------------------------------------ 13 */
{ id: 'm13', n: 13, title: 'Versiones, etiquetas y forks', short: 'Marcar momentos y contribuir a proyectos ajenos', time: '25 min', goal: 'Etiquetar versiones y entender los forks',
  blocks: [
  { text: `<h2>Etiquetas: un separador en la página</h2><p>Un usuario dice: <i>"esto funcionaba en la versión del mes pasado"</i>. ¿Qué commit era? Si nadie lo marcó, toca adivinar entre cientos. Una <b>etiqueta</b> (tag) es un nombre fijo para un commit. A diferencia de una rama, <b>no se mueve</b>.</p><h3>Versionado semántico: MAYOR.MENOR.PARCHE</h3><div class="table"><table><tr><th>Parte</th><th>Cuándo sube</th><th>Ejemplo</th></tr><tr><td>PARCHE</td><td>Correcciones, sin cambios en cómo se usa</td><td>1.4.2 → 1.4.3</td></tr><tr><td>MENOR</td><td>Funciones nuevas que no rompen lo anterior</td><td>1.4.3 → 1.5.0</td></tr><tr><td>MAYOR</td><td>Cambios que obligan a adaptarse</td><td>1.5.0 → 2.0.0</td></tr></table></div>` },
  { act: 'semver' },
  { act: 'term', title: 'Misión: publica tu primera versión', xp: 50,
    intro: 'Con el teléfono corregido, <code>sitio-oficina</code> está listo para su primera versión estable.',
    setup: s => buildProject(s, 'm13'), project: true,
    quick: ['git tag', 'git log --oneline', 'git show v1.0.0'],
    goals: [
      { t: 'Mira las etiquetas que existen', hint: 'git tag', check: (s, r) => !!r.listedTags },
      { t: 'Crea la etiqueta anotada <code>v1.0.0</code>', hint: 'git tag -a v1.0.0 -m "Primera versión estable del sitio"', check: s => rp(s).tags['v1.0.0'] && rp(s).tags['v1.0.0'].annotated },
      { t: 'Publícala: las etiquetas no viajan solas', hint: 'git push origin v1.0.0', check: s => !!s.remoteOf(rp(s)).tags['v1.0.0'] },
      { t: 'Agrega la dirección de la oficina y haz commit', hint: 'echo "Dirección: Calle Central 10" >> contacto.md', why: 'Luego <code>git commit -am "Agrega dirección de la oficina"</code>.', check: s => s.headId(rp(s)) !== rp(s).tags['v1.0.0'].id },
      { t: 'Etiqueta la corrección como <code>v1.0.1</code>', hint: 'git tag -a v1.0.1 -m "Agrega dirección de la oficina"', check: s => rp(s).tags['v1.0.1'] && rp(s).tags['v1.0.1'].id === s.headId(rp(s)) },
      { t: 'Publica todas tus etiquetas', hint: 'git push origin --tags', check: s => !!s.remoteOf(rp(s)).tags['v1.0.1'] },
      { t: 'Publica también el commit', hint: 'git push', check: s => s.remoteOf(rp(s)).branches.main === rp(s).branches.main }],
    outro: 'No se cambia una etiqueta publicada: si v1.0.0 tenía un error, la corrección es v1.0.1.' },
  { text: `<h2>Markdown básico</h2><p>Es el formato de los README, issues y Merge Requests: texto normal con unos pocos símbolos.</p><pre class="cmd"># Título principal
## Sección
**negrita** y *cursiva*
- elemento de una lista
[texto del enlace](https://ejemplo.com)
&#96;código&#96;</pre><p>Un buen <b>README</b> explica qué hace el proyecto y cómo empezar a usarlo.</p><h2>Forks: contribuir a proyectos que no son tuyos</h2><div class="table"><table><tr><th></th><th>Rama</th><th>Fork</th></tr><tr><td>Dónde vive</td><td>Dentro del mismo proyecto</td><td>En tu cuenta, como proyecto aparte</td></tr><tr><td>¿Permiso de escritura?</td><td>Sí</td><td>No</td></tr><tr><td>Cuándo</td><td>Trabajo dentro de tu equipo</td><td>Proyectos ajenos o de código abierto</td></tr></table></div>` },
  { act: 'order', title: 'El recorrido de una contribución con fork', steps: ['En el proyecto original, pulsa <b>Fork</b> y elige tu cuenta', 'Clona <b>tu fork</b>, no el original', 'Conecta el original como <code>upstream</code>: <code>git remote add upstream ...</code>', 'Crea una rama, haz tus cambios y commits', 'Haz push a tu fork', 'Abre una Merge Request desde tu fork hacia el proyecto original'] },
  { act: 'quiz', qs: [
    { q: 'Hiciste <code>git switch --detach v1.0.0</code> y Git dice "detached HEAD". ¿Qué significa?', o: ['Estás mirando esa versión sin estar en ninguna rama; para volver, git switch main', 'Se borró la rama main', 'La etiqueta se rompió', 'Perdiste tus commits'], a: 0, why: 'Puedes mirar y probar. Si haces commits ahí quedan "sueltos".' },
    { q: 'En Markdown, ¿cómo escribes un título de segundo nivel?', o: ['<code>## Título</code>', '<code>**Título**</code>', '<code>[Título]</code>', '<code>- Título</code>'], a: 0, why: '<code>#</code> para el principal, <code>##</code> para secciones. <code>**texto**</code> es negrita y <code>- </code> una lista.' }] },
  { act: 'checklist', items: ['Sé usar el versionado semántico.', 'Sé crear etiquetas anotadas y publicarlas.', 'No muevo etiquetas ya publicadas.', 'Entiendo la diferencia entre rama y fork.', 'Sé lo básico de Markdown para escribir un README.'] }
]},
/* ------------------------------------------------------------ 14 */
{ id: 'm14', n: 14, title: 'Proyecto práctico final', short: 'El flujo completo, de principio a fin', time: '45 min', goal: 'Hacer cada paso del proceso bien',
  blocks: [
  { story: `<p><b>El escenario:</b> es el último paso de <b>tu proyecto</b>, <code>sitio-oficina</code>. Ya tiene README, contacto, horario, sección "Sobre mí", reporte, lista del equipo y la versión <code>v1.0.1</code>. Ahora el issue <b>#7</b> pide agregar una página de <b>preguntas frecuentes</b>. Es un cambio pequeño a propósito: lo importante es hacer cada paso del proceso bien. Y el equipo acaba de proteger <code>main</code> (módulo 10): nadie hace push directo.</p>` },
  { act: 'term', title: 'Proyecto final: issue #7 de principio a fin', xp: 120,
    intro: 'Usa todo lo que aprendiste, en el mismo proyecto de siempre. Cuando haga falta GitLab (revisión, pipeline, merge), usa los botones de la misión.',
    setup: s => buildProject(s, 'm14'), project: true,
    quick: ['git status', 'git log --oneline -5', 'cat faq.md', 'git branch -a'],
    actions: [
      { label: '👀 ‹A› revisa la MR', run: s => { const r = s.repos[PROJ]; const R = r && s.remoteOf(r); const b = R && Object.keys(R.branches).find(x => x !== 'main'); if (!b) return { msg: 'Todavía no hay ninguna rama publicada para revisar. Haz push de tu rama primero.' }; return { ok: true, msg: '<b>‹A› comentó (bloqueante):</b> «Falta una pregunta sobre el horario de trabajo. Las personas nuevas siempre lo preguntan.» Corrige en tu rama y haz push: la MR se actualiza sola.' }; }, flag: 'reviewed' },
      { label: '✅ Fusionar en GitLab', run: s => { const r = s.repos[PROJ]; const R = r && s.remoteOf(r); const b = R && Object.keys(R.branches).find(x => x !== 'main'); if (!b) return { msg: 'No hay ninguna MR que fusionar todavía.' }; const t = s.tree(R.branches[b]); if (!/horario/i.test(t['faq.md'] || '')) return { msg: '<b>No se puede fusionar:</b> el hilo de ‹A› sigue sin resolver (en GitLab todavía falta la pregunta del horario).' }; const id = s.mkCommit(r, { msg: "Merge branch '" + b + "' into 'main'", tree: t, parents: [R.branches.main, R.branches[b]], author: AUTHORS.ana, lane: 'main' }); R.branches.main = id; delete R.branches[b]; return { ok: true, msg: '🟢 Pipeline <b>passed</b> · ‹A› aprobó · <b>Merged</b>. GitLab cerró el issue #7 (por el <code>Closes #7</code>) y borró la rama remota. Ahora pon tu computadora al día.' }; }, flag: 'merged' }],
    goals: [
      { t: 'Empieza el día trayendo lo último del equipo', hint: 'git pull', check: (s, r) => !!r.pulled && !r.err },
      { t: 'Repasa cómo ha crecido tu proyecto', hint: 'git log --oneline -5', check: ran(/^git log/) },
      { t: 'Crea la rama para el issue #7 (tipo docs, con el número)', hint: 'git switch -c docs/7-preguntas-frecuentes', check: s => { const r = rp(s); return r && /^docs\/7-[a-z0-9-]+$/.test(r.head); } },
      { t: 'Crea <code>faq.md</code> con un título y una pregunta', hint: 'echo "# Preguntas frecuentes" > faq.md', why: 'Y luego: <code>echo "¿Dónde pido acceso a GitLab? Con ‹A›." &gt;&gt; faq.md</code>', check: s => (rp(s).files['faq.md'] || '').split('\n').filter(Boolean).length >= 2 },
      { t: 'Revisa y haz commit mencionando el issue <code>(#7)</code>', hint: 'git add faq.md', why: 'Luego <code>git commit -m "Agrega preguntas frecuentes (#7)"</code>. Antes, mira con <code>git status</code> y <code>git diff --staged</code>.', check: s => { const r = rp(s); const id = r.branches[r.head]; return /#7/.test(s.commits[id].msg) && s.tree(id)['faq.md'] !== undefined; } },
      { t: 'Publica tu rama (se abre la MR con <code>Closes #7</code>)', hint: 'git push -u origin docs/7-preguntas-frecuentes', check: s => { const r = rp(s); const R = s.remoteOf(r); return r.head !== 'main' && R.branches[r.head] === r.branches[r.head]; } },
      { t: 'Pide la revisión: pulsa <b>👀 ‹A› revisa la MR</b>', check: (s, r) => r.action === 'reviewed' },
      { t: 'Agrega la pregunta del horario y haz commit', hint: 'echo "¿Cuál es el horario? De 8:00 a 5:00." >> faq.md', why: 'Luego <code>git commit -am "Agrega pregunta sobre el horario (#7)"</code>.', check: s => { const r = rp(s); return /horario/i.test(s.tree(r.branches[r.head])['faq.md'] || ''); } },
      { t: 'Actualiza la MR con un push a la misma rama', hint: 'git push', check: s => { const r = rp(s); const R = s.remoteOf(r); return R.branches[r.head] && /horario/i.test(s.tree(R.branches[r.head])['faq.md'] || ''); } },
      { t: 'Pulsa <b>✅ Fusionar en GitLab</b>', check: (s, r) => r.action === 'merged' },
      { t: 'Vuelve a main', hint: 'git switch main', check: s => rp(s).head === 'main' },
      { t: 'Pon main al día', hint: 'git pull', check: s => { const r = rp(s); return r.branches.main === s.remoteOf(r).branches.main && /horario/i.test(s.tree(r.branches.main)['faq.md'] || ''); } },
      { t: 'Borra tu rama local, ya fusionada', hint: 'git branch -d docs/7-preguntas-frecuentes', check: s => !Object.keys(rp(s).branches).some(b => b.startsWith('docs/7')) },
      { t: 'Limpia las referencias a ramas borradas en GitLab', hint: 'git fetch --prune', check: s => !Object.keys(rp(s).rt).some(b => b.startsWith('docs/7')) }],
    outro: 'Issue → rama → commits → MR → revisión → corrección → pipeline → merge → limpieza. <b>Ese es el flujo de un equipo real.</b>' },
  { act: 'quiz', title: 'Evaluación final', qs: [
    { q: 'Te piden un cambio en un proyecto compartido. ¿Cuál es el primer paso correcto?', o: ['git switch main, git pull y crear una rama para la tarea', 'Editar directo en main y hacer push', 'Descargar un ZIP del proyecto', 'Abrir una MR vacía'], a: 0, why: 'Siempre partes de main actualizada y en tu propia rama.' },
    { q: 'Hiciste push de un commit que rompió algo en una rama compartida. ¿Qué usas?', o: ['git revert', 'git reset --hard + push --force', 'git restore', 'Borras la rama'], a: 0, why: 'Lo publicado se corrige con un commit nuevo.' },
    { q: 'Aparece un conflicto en un archivo que tocaron tú y ‹B›. ¿Qué haces primero?', o: ['Leo los dos cambios, entiendo qué buscaba cada uno y pregunto si dudo', 'Acepto mi versión', 'Acepto la de ‹B›', 'Borro el archivo'], a: 0, why: 'Nunca resuelvas borrando el trabajo del otro.' },
    { q: 'El pipeline de tu MR está en rojo. ¿Qué haces?', o: ['Leo el registro desde el final, relaciono con mi cambio y corrijo en mi rama', 'Fusiono igual', 'Desactivo la prueba', 'Retry diez veces'], a: 0, why: 'Rojo es información, no un regaño.' },
    { q: '¿Qué es lo único que realmente te protege si subiste un token?', o: ['Revocarlo de inmediato', 'Borrarlo con un commit', 'Hacer el repo privado', 'Cambiar el nombre del archivo'], a: 0, why: 'Aunque lo borres, sigue en la historia.' }] },
  { text: `<h2>Preguntas para reflexionar</h2><ul><li>¿Qué paso del flujo te costó más y por qué?</li><li>¿Qué harías distinto si la MR tuviera 50 archivos en lugar de uno?</li><li>Si mañana te unes a un equipo nuevo, ¿qué tres acuerdos propondrías (nombres de ramas, mensajes, revisión)?</li><li>Vuelve a la hoja del módulo 0, la de la carpeta caótica. ¿Qué podrías responder ahora en segundos?</li></ul>` },
  { act: 'cert' },
  { tip: `<b>Plan de 7 días para afianzarlo en tu computadora real:</b> Día 1 prepara todo · Día 2 el ciclo básico · Día 3 ramas y MR · Día 4 conflictos y errores · Día 5 organización, pipelines y seguridad · Día 6 herramientas extra y automatización · Día 7 proyecto final con alguien de tu equipo. Después, cada día: <code>git pull</code> al empezar, ramas cortas, mira antes de guardar.` }
]}
];

const STAGES = [['Fundamentos', ['m0', 'm1', 'm2']], ['Tu día a día', ['m3', 'm4']], ['Trabajo en equipo', ['m5', 'm6', 'm7']], ['Organización y calidad', ['m8', 'm9', 'm10']], ['Nivel avanzado', ['m11', 'm12', 'm13']], ['Cierre', ['m14']]];
const ALL_ACTS = [];
MODULES.forEach(m => m.blocks.forEach((b, i) => { if (b.act && b.act !== 'cert') { b.id = m.id + '-' + i; ALL_ACTS.push(b.id); } }));

const GLOSSARY = [['Approve (aprobar)', 'Dar el visto bueno a una Merge Request después de revisarla', 5], ['Área de preparación (staging)', 'La "caja" donde pones lo que va a entrar en el próximo commit', 3], ['Blame', 'Vista que muestra quién cambió por última vez cada línea de un archivo', 12], ['Branch (rama)', 'Línea de trabajo paralela para hacer cambios sin tocar la principal', 4], ['CI/CD', 'Revisiones y tareas automáticas que se ejecutan con cada cambio', 9], ['Clonar (clone)', 'Descargar un proyecto de GitLab a tu computadora, con toda su historia', 2], ['Commit', 'Punto de guardado del proyecto, con un mensaje que explica el cambio', 3], ['Conflicto', 'Cuando dos cambios tocan la misma parte y Git te pide decidir', 6], ['Diff', 'La lista de diferencias entre dos versiones, línea por línea', 3], ['Draft (borrador)', 'Merge Request que todavía no está lista para fusionarse', 5], ['.env', 'Archivo local con configuración y secretos, que nunca se sube', 10], ['Etiqueta (label)', 'Marca de color para clasificar issues y Merge Requests', 8], ['Etiqueta de versión (tag)', 'Nombre fijo para un commit importante, como v1.0.0', 13], ['Fast-forward', 'Fusión en la que solo se avanza la rama, sin commit nuevo', 12], ['Fetch', 'Traer la información nueva de GitLab sin juntarla con tu trabajo', 12], ['Fork', 'Copia de un proyecto ajeno en tu cuenta, para proponer cambios', 13], ['Git', 'Programa que guarda la historia de los cambios de un proyecto', 1], ['.gitignore', 'Archivo con la lista de lo que Git debe ignorar', 3], ['GitHub / GitLab', 'Plataformas web para compartir, revisar y organizar repositorios', 1], ['HEAD', 'El commit en el que estás parada o parado ahora mismo', 7], ['Historial', 'La lista de todos los commits del proyecto', 1], ['Issue', 'Ficha de una tarea, error o pedido, con número propio', 8], ['Job (trabajo)', 'Una tarea concreta dentro de un pipeline', 9], ['main', 'Nombre habitual de la rama principal', 4], ['Maintainer', 'Rol de GitLab que puede fusionar en ramas protegidas', 10], ['Markdown', 'Formato de texto sencillo con símbolos para títulos, listas y enlaces', 13], ['Merge (fusionar)', 'Juntar los cambios de una rama con otra', 4], ['Merge Request (MR)', 'Solicitud para revisar y fusionar una rama. En GitHub: Pull Request', 5], ['Milestone', 'Objetivo con fecha que agrupa issues y Merge Requests', 8], ['origin', 'Apodo de la copia del proyecto en GitLab', 2], ['Pipeline', 'La secuencia de revisiones automáticas de un cambio', 9], ['Pull', 'Traer cambios de GitLab y juntarlos con tu rama', 3], ['Push', 'Enviar tus commits a GitLab', 3], ['Rama protegida', 'Rama con reglas sobre quién puede cambiarla y cómo', 10], ['README', 'Archivo de presentación del proyecto', 13], ['Rebase', 'Reescribir tus commits sobre la versión más nueva de otra rama', 12], ['Reflog', 'Registro de todos tus movimientos, para recuperar commits', 7], ['Release', 'Versión publicada con título y notas', 13], ['Remoto', 'La copia del repositorio en GitLab', 1], ['Repositorio (repo)', 'Carpeta del proyecto con toda su historia', 1], ['Reset', 'Mover tu rama hacia atrás, deshaciendo commits locales', 7], ['Restore', 'Devolver archivos a una versión guardada', 7], ['Revert', 'Commit nuevo que anula un commit anterior', 7], ['Runner', 'Máquina que ejecuta los trabajos de un pipeline', 9], ['Secreto', 'Contraseña, token o llave que da acceso a algo', 10], ['Squash', 'Juntar varios commits en uno solo al fusionar', 12], ['SSH', 'Forma segura de conectarte a GitLab con un par de llaves', 2], ['Stash', 'Cajón temporal para apartar cambios a medias', 7], ['Tablero (board)', 'Vista de issues como tarjetas en columnas', 8], ['Terminal', 'Ventana para darle órdenes a la computadora escribiendo', 2], ['Token', 'Clave especial con permisos limitados, que reemplaza tu contraseña', 2], ['upstream', 'Apodo del proyecto original cuando trabajas con un fork', 13], ['Wiki', 'Espacio de documentación dentro del proyecto', 8]];

const CHEATSHEET = [
  ['Configuración (una sola vez)', 'git config --global user.name "‹YO›"\ngit config --global user.email "‹MAIL›"\ngit config --global init.defaultBranch main'],
  ['Empezar un proyecto', 'git clone git@gitlab.com:usuario/proyecto.git\ncd proyecto'],
  ['El ciclo de todos los días', 'git status\ngit diff\ngit add archivo\ngit diff --staged\ngit commit -m "Agrega ..."\ngit pull\ngit push'],
  ['Ramas', 'git switch main && git pull\ngit switch -c feature/descripcion\ngit push -u origin feature/descripcion\ngit merge main\ngit branch -d feature/descripcion'],
  ['Conflictos', 'git status                  # ¿qué archivos?\ngit merge --abort           # botón de emergencia\n# editar, quitar marcas <<<<<<< ======= >>>>>>>\ngit add archivo\ngit commit'],
  ['Deshacer', 'git restore archivo         # descarta cambios (¡se pierden!)\ngit restore --staged archivo\ngit reset --soft HEAD~1     # solo sin push\ngit revert codigo           # ya publicado\ngit stash push -m "..." / git stash pop\ngit reflog                  # red de seguridad'],
  ['Investigar', 'git log --oneline --author="‹A›"\ngit log --oneline -S "texto"\ngit blame archivo\ngit show codigo:archivo\ngit log --oneline main..mi-rama\ngit fetch'],
  ['Versiones y forks', 'git tag -a v1.0.0 -m "Mensaje"\ngit push origin v1.0.0\ngit remote add upstream URL-del-original'],
  ['Nunca en ramas compartidas', 'git push --force\ngit reset --hard   (sobre commits publicados)\ngit rebase         (de commits que otros ya descargaron)']
];
