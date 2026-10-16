// AAA quiz engine – works with window.AAA (questions.js). No data is collected or sent anywhere.
(function () {
  const D = window.AAA, app = document.getElementById('app');
  const T = window.THEME || null;
  const RANKS = T ? T.ranks : ['Peasant', 'Yeoman', 'Squire', 'Knight', 'Lord', 'Duke', 'Monarch'];
  const LIVES = T ? T.lives : 0;
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const trail = i => T ? `<div class="trail">${T.stages.map((st, k) => `<span class="${k < i ? 'done' : k === i ? 'here' : ''}" title="${md(st[0])}"></span>`).join('')}</div>` : '';
  const hearts = () => T ? `<span class="lives" title="${LIVES} = ${md(T.life)}">${Array.from({ length: LIVES }, (_, k) => `<i class="${k < S.lives ? '' : 'off'}"></i>`).join('')}</span>` : '';
  const PER = 10;
  const md = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\*(.+?)\*/g, '<i>$1</i>');
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  let S = null;

  function home() {
    const total = D.units.reduce((n, u) => n + u.q.length, 0);
    app.innerHTML = T ? `<div class="hero"><div class="kick">${md(D.title)}</div><h1>${md(T.game)}</h1><p>${md(T.intro)}</p>${trail(-1)}<div class="route"><span>${md(T.stages[0][0])}</span><span>${md(T.stages[T.stages.length - 1][0])}</span></div></div><p class="lead">Choose a unit to ${md(T.start.toLowerCase())}. You have one joker: <b>${md(T.joker)}</b>.</p>
    <div class="units">${D.units.map(u => `<button class="unit" data-u="${u.n}"><div class="n">Unit ${u.n}</div><div class="t">${md(u.name)}</div><div class="c">${u.q.length} questions</div></button>`).join('')}
    <button class="unit all" data-u="all"><div class="n">Whole year</div><div class="t">Mixed questions</div><div class="c">${total} questions</div></button></div>` : `<h1>${md(D.title)}</h1><p class="lead">Choose a unit. You get ${PER} questions; each has one correct answer. You have one 50 : 50 joker per game. Climb from <b>Peasant</b> to <b>Monarch</b>!</p>
    <div class="units">${D.units.map(u => `<button class="unit" data-u="${u.n}"><div class="n">Unit ${u.n}</div><div class="t">${md(u.name)}</div><div class="c">${u.q.length} questions</div></button>`).join('')}
    <button class="unit all" data-u="all"><div class="n">Whole year</div><div class="t">Mixed questions</div><div class="c">${total} questions</div></button></div>`;
    app.querySelectorAll('.unit').forEach(b => b.onclick = () => start(b.dataset.u));
  }
  function start(u) {
    const want = u === 'all' ? D.units.map(x => String(x.n)) : String(u).split(',');
    const pool = D.units.filter(x => want.includes(String(x.n))).flatMap(x => x.q.map(q => Object.assign({ unit: x.n }, q)));
    const qs = shuffle(pool).slice(0, PER).map(q => { const idx = shuffle([0, 1, 2, 3]); return Object.assign({}, q, { o: idx.map(i => q.o[i]), a: idx.indexOf(q.a) }); });
    S = { u, qs, i: 0, score: 0, streak: 0, best: 0, joker: true, wrong: [], lives: LIVES, out: false };
    history.replaceState(null, '', '?u=' + u);
    ask();
  }
  function ask() {
    const q = S.qs[S.i], uname = D.units.find(x => x.n === q.unit).name;
    const st = T ? T.stages[Math.min(S.i, T.stages.length - 1)] : null;
    app.innerHTML = (T ? `<div class="stage"><div><div class="kick">Stop ${S.i + 1} of ${S.qs.length}</div><b>${md(st[0])}</b><span>${md(st[1])}</span></div>${hearts()}</div>${trail(S.i)}` : `<div class="bar"><span>${S.i + 1} / ${S.qs.length}</span><div class="prog"><i style="width:${S.i / S.qs.length * 100}%"></i></div><span>Score <b>${S.score}</b>${S.streak > 1 ? ` · <span class="streak">streak ${S.streak}</span>` : ''}</span></div>`) + `
    <div class="qcard"><div class="qn">Unit ${q.unit} · ${md(uname)}</div><h2>${md(q.q)}</h2>
    <div class="opts">${q.o.map((o, j) => `<button class="opt" data-j="${j}"><span class="l">${'ABCD'[j]}</span><span>${md(o)}</span></button>`).join('')}</div>
    <div id="fb"></div>
    <div class="row"><button class="btn ghost" id="joker" ${S.joker ? '' : 'disabled'}>${T ? md(T.joker) : '50 : 50'}</button><button class="btn" id="next" style="display:none">${S.i + 1 < S.qs.length ? 'Next question' : 'See my result'}</button><span class="life">Keys A–D work too</span></div></div>`;
    const opts = [...app.querySelectorAll('.opt')];
    opts.forEach(b => b.onclick = () => answer(+b.dataset.j));
    app.querySelector('#joker').onclick = () => { if (!S.joker) return; S.joker = false; shuffle([0, 1, 2, 3].filter(j => j !== q.a)).slice(0, 2).forEach(j => { opts[j].classList.add('gone'); opts[j].disabled = true; }); app.querySelector('#joker').disabled = true; };
    app.querySelector('#next').onclick = () => { S.i++; S.i < S.qs.length && !S.out ? ask() : result(); };
  }
  function answer(j) {
    const q = S.qs[S.i], opts = [...app.querySelectorAll('.opt')];
    if (opts[0].dataset.done) return; opts.forEach(b => { b.disabled = true; b.dataset.done = 1; });
    const ok = j === q.a;
    opts[q.a].classList.add('ok'); if (!ok) opts[j].classList.add('bad');
    if (ok) { S.score++; S.streak++; S.best = Math.max(S.best, S.streak); } else { S.streak = 0; S.wrong.push(q); if (T) { S.lives--; if (S.lives <= 0) S.out = true; } }
    const head = T ? (ok ? 'Correct! ' + pick(T.ok) : 'Not quite. ' + T.bad) : (ok ? (S.streak >= 3 ? 'Brilliant – ' + S.streak + ' in a row!' : 'Correct!') : 'Not quite.');
    app.querySelector('#fb').innerHTML = `<div class="fb"><b>${md(head)}</b>${md(q.e)}</div>`;
    if (T) { const h = app.querySelector('.lives'); if (h) h.outerHTML = hearts(); }
    app.querySelector('#joker').style.display = 'none';
    const n = app.querySelector('#next'); if (S.out) n.textContent = 'See what happened'; n.style.display = ''; n.focus();
  }
  function result() {
    const r = Math.min(RANKS.length - 1, Math.floor(S.score / S.qs.length * (RANKS.length - 1) + 0.0001));
    app.innerHTML = `<div class="result"><div class="qn" style="font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--m2)">${S.u === 'all' ? 'Whole year' : (String(S.u).includes(',') ? 'Units ' : 'Unit ') + String(S.u).replace(',', ' + ')}</div>
    ${T ? `<h2 class="end">${md(S.out ? T.lose : T.win)}</h2>` : ''}<div class="score">${S.score} / ${S.qs.length}</div><div class="rank">${T ? 'Your title: ' + RANKS[r] : 'You are a ' + RANKS[r] + '!'}</div><p class="lead" style="margin:0">Best streak: ${S.best}</p>
    <div class="ladder">${RANKS.map((x, k) => `<span class="${k === r ? 'on' : ''}">${x}</span>`).join('')}</div>
    <div class="row" style="justify-content:center"><button class="btn" id="again">Play again</button><button class="btn ghost" id="home">Choose another unit</button></div>
    ${S.wrong.length ? `<div class="review"><h3>Learn from your mistakes</h3>${S.wrong.map(q => `<div><b>${md(q.q)}</b><br>Correct answer: <b>${md(q.o[q.a])}</b><br><i>${md(q.e)}</i></div>`).join('')}</div>` : '<p class="lead" style="margin-top:14px">No mistakes – perfect!</p>'}</div>`;
    app.querySelector('#again').onclick = () => start(S.u);
    app.querySelector('#home').onclick = () => { history.replaceState(null, '', location.pathname); home(); };
  }
  document.addEventListener('keydown', e => {
    const k = 'abcd'.indexOf(e.key.toLowerCase()); const b = app.querySelectorAll('.opt')[k];
    if (k >= 0 && b && !b.disabled) b.click();
    if (e.key === 'Enter') { const n = app.querySelector('#next'); if (n && n.style.display !== 'none' && document.activeElement !== n) n.click(); }
  });
  const u = new URLSearchParams(location.search).get('u');
  if (u && (u === 'all' || u.split(',').every(v => D.units.some(x => String(x.n) === v)))) start(u); else home();
})();
