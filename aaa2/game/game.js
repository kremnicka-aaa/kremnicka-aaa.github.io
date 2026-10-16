// The Crown – AAA 2 decision game. Runs fully in the browser; nothing is stored or sent anywhere.
(function () {
  const app = document.getElementById('app'), C = window.CROWN, END = window.CROWN_END;
  const md = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\*(.+?)\*/g, '<i>$1</i>');
  const P = [['c', 'Church'], ['p', 'People'], ['a', 'Army'], ['t', 'Treasury']];
  let S;
  const yr = y => y < 1000 ? 'AD ' + y : y;

  function intro() {
    app.innerHTML = `<div class="hero"><div class="kick">AAA 2 · game</div><h1>The Crown</h1><p>Rule England from Alfred the Great to Queen Victoria. Your advisers bring you real problems from British history – you decide. Keep the four powers of the kingdom in balance: <b>the Church, the People, the Army and the Treasury</b>. If one of them falls to nothing – or grows too strong – your reign is over.</p></div>
      <div class="card" style="background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px">
      <p><b>How to play:</b> read the card and choose left or right – click, use the arrow keys, or swipe on your phone. The gold dots show which powers a choice will affect (big dot = big change). After each decision you learn <b>what really happened</b>.</p>
      <p class="small" style="margin-top:8px">About 10–15 minutes · ${C.length} decisions · ${yr(C[0].y)}–${C[C.length - 1].y}</p>
      <div class="row"><button class="btn" id="go">Take the crown</button></div></div>`;
    app.querySelector('#go').onclick = start;
  }
  function start() { S = { i: 0, v: { c: 50, p: 50, a: 50, t: 50 }, hist: 0, phase: 'card', order: C.map(() => Math.random() < .5) }; show(); }

  function meters(fx) {
    return `<div class="meters">${P.map(([k, n]) => { const d = fx ? Math.abs(fx[k] || 0) : 0; const v = S.v[k]; return `<div class="mt"><div class="dot"><b class="${d ? (d >= 15 ? 'l' : 's') : ''}"></b></div><div class="tube"><i class="${v <= 15 || v >= 85 ? 'warn' : ''}" style="height:${v}%"></i></div>${n}</div>`; }).join('')}</div>`;
  }
  function opts(card) { return S.order[S.i] ? [card.o[1], card.o[0], 1] : [card.o[0], card.o[1], 0]; }

  function show(after) {
    const card = C[S.i], [L, R] = opts(card);
    app.innerHTML = `${meters()}<div class="era"><span>${yr(card.y)}</span><b>${md(card.k)}</b></div>
      <div class="timeline">${C.map((_, k) => `<span class="${k < S.i ? 'done' : k === S.i ? 'here' : ''}"></span>`).join('')}</div>
      <div class="ccard" id="cc"><div class="who">${md(card.who)}</div><p class="txt">${md(card.txt)}</p>
      ${after ? `<div class="hist"><b>${after.real ? 'You chose as history did.' : 'History went the other way.'}</b>${md(card.n)}</div><div class="row"><button class="btn" id="next">${S.dead ? 'See what happened' : S.i + 1 < C.length ? 'Next' : 'The end of your dynasty'}</button></div>` :
      `<div class="choices"><button class="choice" data-s="0"><small>← left</small>${md(L[0])}</button><button class="choice" data-s="1"><small>right →</small>${md(R[0])}</button></div><p class="hint">Swipe, click or use ← →</p>`}</div>`;
    if (after) { app.querySelector('#next').onclick = next; app.querySelector('#next').focus(); return; }
    const bs = [...app.querySelectorAll('.choice')];
    bs.forEach(b => {
      const fx = (+b.dataset.s ? R : L)[1];
      b.onmouseenter = b.onfocus = () => { const mm = app.querySelector('.meters'); if (mm) mm.outerHTML = meters(fx); };
      b.onmouseleave = b.onblur = () => { const mm = app.querySelector('.meters'); if (mm) mm.outerHTML = meters(); };
      b.onclick = () => choose(+b.dataset.s);
    });
    // swipe
    const cc = app.querySelector('#cc'); let x0 = null;
    cc.onpointerdown = e => { if (e.target.closest('.choice')) return; x0 = e.clientX; cc.setPointerCapture(e.pointerId); };
    cc.onpointermove = e => { if (x0 === null) return; const dx = e.clientX - x0; cc.style.transform = `translateX(${dx}px) rotate(${dx / 30}deg)`; const s = dx < 0 ? 0 : 1; const mm = app.querySelector('.meters'); if (Math.abs(dx) > 30 && mm) mm.outerHTML = meters((s ? R : L)[1]); };
    cc.onpointerup = e => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; cc.style.transform = ''; if (Math.abs(dx) > 90) choose(dx < 0 ? 0 : 1); };
  }

  function choose(side) {
    const card = C[S.i], [L, R, flip] = opts(card), pick = side ? R : L;
    const orig = flip ? 1 - side : side; // index in card.o
    Object.entries(pick[1]).forEach(([k, d]) => S.v[k] = Math.max(0, Math.min(100, S.v[k] + d)));
    const real = orig === card.h; if (real) S.hist++;
    const k = P.find(([k]) => S.v[k] <= 0 || S.v[k] >= 100);
    if (k) S.dead = [k[0], S.v[k[0]] <= 0 ? 0 : 1];
    show({ real });
  }
  function next() { if (S.dead) return end(); S.i++; if (S.i >= C.length) return end(); show(); }

  function end() {
    const card = C[S.i], won = !S.dead, done = won ? C.length : S.i + 1;
    const years = card.y - C[0].y;
    const title = won ? 'Your dynasty survived!' : END[S.dead[0]][S.dead[1]];
    app.innerHTML = `${meters()}<div class="result"><div class="kick">${won ? 'From ' + yr(C[0].y) + ' to ' + card.y : 'The end in ' + card.y}</div>
      <h2 class="end" style="margin-top:6px">${md(title)}</h2>
      <div class="score">${done} / ${C.length}</div><div class="rank">decisions survived · ${years} years of history</div>
      <p class="lead" style="margin:8px 0 0">You chose like real history ${S.hist} times out of ${done}.</p>
      <div class="row" style="justify-content:center"><button class="btn" id="again">Play again</button><a class="btn ghost" href="../" style="text-decoration:none">AAA 2 games</a></div>
      <p class="small" style="margin-top:14px;text-align:left">Talk about it: Which decision was the hardest? Did the real kings and queens choose well? Who had more power at the end of the story – the monarch or Parliament?</p></div>`;
    app.querySelector('#again').onclick = start;
  }

  document.addEventListener('keydown', e => {
    if (!S || S.phase === 'end') return;
    const bs = app.querySelectorAll('.choice');
    if (e.key === 'ArrowLeft' && bs[0]) choose(0);
    if (e.key === 'ArrowRight' && bs[1]) choose(1);
  });
  intro();
})();
