// The Crown – AAA 2. Illuminated-chronicle decision game. Nothing is stored or sent anywhere (only the sound setting).
(function () {
'use strict';
const app = document.getElementById('app'), C = window.CROWN, END = window.CROWN_END, POR = window.PORTR || {}, S = KIT.SND;
const md = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\*(.+?)\*/g, '<i>$1</i>');
const PW = [['c', 'Church'], ['p', 'People'], ['a', 'Army'], ['t', 'Treasury']];
const ICON = {
  c: 'M18 2h4v5h5v4h-5v4l9 7v16H9V22l9-7v-4h-5V7h5zM17 38v-8a3 3 0 016 0v8z',
  p: 'M20 5a5 5 0 110 10a5 5 0 010-10zM9 11a4 4 0 110 8a4 4 0 010-8zM31 11a4 4 0 110 8a4 4 0 010-8zM11 38c0-8 4-15 9-15s9 7 9 15zM1 36c0-7 3-13 8-13 2 0 4 1 5 2-2 3-4 7-4 11zM39 36c0-7-3-13-8-13-2 0-4 1-5 2 2 3 4 7 4 11z',
  a: 'M19 1h2l1.5 25h-5zM11 26h18v3.5H11zM18.5 29.5h3v6h-3zM20 34.5a2.8 2.8 0 110 5.6a2.8 2.8 0 010-5.6z',
  t: 'M13 4h14l-3.5 6h-7zM20 10c-9 0-15 10-15 18 0 7 6 10 15 10s15-3 15-10c0-8-6-18-15-18zM16 31h9v-2.5h-5.5c.6-1.2.8-2.4.6-3.5H24v-2.4h-4.6c-.3-1.2.1-2.4 1.5-2.4 1 0 1.8.5 2.3 1.2l1.9-1.6C24 17.5 22.6 17 21 17c-3 0-4.6 2.4-4.1 5.6H15V25h2.1c.1 1.4-.4 2.8-1.6 3.6z'
};
const CORNER = '<svg class="cn {k}" viewBox="0 0 30 30"><path d="M3 27V9C3 5 5 3 9 3h18" fill="none" stroke="#A3201B" stroke-width="2"/><path d="M8 22c0-7 3-12 11-13" fill="none" stroke="#C9962B" stroke-width="1.6"/><circle cx="19" cy="9" r="2.6" fill="#1E3F8C"/><path d="M11 16c-3-1-4-4-3-6 3 0 4 3 3 6zM15 11c-1-3 1-5 3-6 1 3-1 5-3 6z" fill="#2F5B2E"/><circle cx="6" cy="6" r="2" fill="#C9962B"/></svg>';
const corners = () => ['a', 'b', 'c', 'd'].map(k => CORNER.replace('{k}', k)).join('');
const yr = y => y < 1000 ? 'Anno ' + y : String(y);
let G, busy = false;

function icon(k, v) {
  return `<svg viewBox="0 0 40 40"><defs><clipPath id="cl${k}"><rect x="0" y="${40 - v * .4}" width="40" height="40"/></clipPath><linearGradient id="gg${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3D27A"/><stop offset="1" stop-color="#B07A18"/></linearGradient></defs>
  <path d="${ICON[k]}" fill="rgba(232,207,160,.12)" stroke="#8E6A33" stroke-width="1"/><path d="${ICON[k]}" fill="url(#gg${k})" clip-path="url(#cl${k})"/></svg>`;
}
function powers(fx) {
  return `<div class="pw" id="pw">${PW.map(([k, n]) => { const d = fx ? Math.abs(fx[k] || 0) : 0, v = G ? G.v[k] : 50; return `<div class="m ${v <= 15 || v >= 85 ? 'warn' : ''}"><div class="dot"><b class="${d ? (d >= 15 ? 'l' : 's') : ''}"></b></div>${icon(k, v)}${n}</div>`; }).join('')}</div>`;
}
function setPowers(fx) { const p = document.getElementById('pw'); if (p) p.outerHTML = powers(fx); }
function medal(k) { const p = POR[k]; return `<div class="med">${p ? `<img src="${p.f}" alt="${md(k)}">` : `<span>${k[0]}</span>`}</div>`; }
function credit(k) { const p = POR[k]; return p ? `<p class="cr">Portrait: ${md(p.a)} · <a href="${p.u}" target="_blank" rel="noopener">Wikimedia Commons</a>, ${md(p.l)}.</p>` : ''; }
function initial(t) { const s = md(t); return `<span class="ini">${s[0]}</span>${s.slice(1)}`; }

function intro() {
  G = null;
  app.innerHTML = `<div class="stack"><div class="page rise">${corners()}<div class="title">
    <svg class="crown" viewBox="0 0 120 70"><path d="M8 58L2 14l28 22L60 4l30 32 28-22-6 44z" fill="#C9962B" stroke="#6B4A10" stroke-width="2"/><rect x="8" y="56" width="104" height="10" fill="#A3201B" stroke="#6B4A10" stroke-width="2"/><circle cx="60" cy="4" r="4" fill="#F3D27A"/><circle cx="2" cy="14" r="3.4" fill="#F3D27A"/><circle cx="118" cy="14" r="3.4" fill="#F3D27A"/><circle cx="35" cy="61" r="3" fill="#1E3F8C"/><circle cx="60" cy="61" r="3.4" fill="#2F5B2E"/><circle cx="85" cy="61" r="3" fill="#1E3F8C"/></svg>
    <h1>The Crown</h1>
    <p>${initial('Rule England from Alfred the Great to Queen Victoria. Your advisers bring you real problems from a thousand years of British history – and you must decide.')}</p>
    <p>Keep the four powers of the realm in balance. If one of them falls to nothing – or grows too strong – your dynasty ends.</p>
    <div class="legend">${PW.map(([k, n]) => `<div>${icon(k, 50)}${n}</div>`).join('')}</div>
    <p style="font-size:16px"><i>Drag the page left or right, use the arrow keys or tap a choice. The golden dots show which powers a choice will touch.</i></p>
    <div class="row"><button class="btn" id="go">Take the crown</button></div>
    <p class="cr" style="text-align:center">${C.length} decisions · ${C[0].y}–${C[C.length - 1].y} · about 15 minutes</p></div></div></div>`;
  app.querySelector('#go').onclick = () => { S.init(); S.special(); start(); };
}
function start() { G = { i: 0, v: { c: 50, p: 50, a: 50, t: 50 }, hist: 0, order: C.map(() => Math.random() < .5), log: [] }; S.startMusic([62, 0, 64, 65, 67, 0, 65, 64, 62, 0, 60, 62, 64, 0, 62, 0, 57, 0, 60, 62, 64, 0, 62, 60, 62, 0, 0, 0], 420, 'triangle'); show(); }
function opts(card) { return G.order[G.i] ? [card.o[1], card.o[0], 1] : [card.o[0], card.o[1], 0]; }
function frame(inner, anim = 'rise') {
  return `${powers()}<div class="rib"><span class="yr">${yr(C[G.i].y)}</span><div class="line">${C.map((_, k) => `<i class="${k < G.i ? 'd' : k === G.i ? 'h' : ''}"></i>`).join('')}</div></div>
  <div class="stack"><div class="page ${anim}" id="pg">${corners()}<div class="banner" id="bn"></div>${inner}</div></div>`;
}
function show() {
  const card = C[G.i], [L, R] = opts(card); busy = false;
  app.innerHTML = frame(`<div class="head">${medal(card.k)}<div><h2>${md(card.k)}</h2><div class="who">${md(card.who)} speak:</div></div></div>
    <p class="txt">${initial(card.txt)}</p>
    <div class="ask"><button class="opt" data-s="0"><small>◂ left</small>${md(L[0])}</button><button class="opt" data-s="1"><small>right ▸</small>${md(R[0])}</button></div>
    <p class="hint">Drag the page, tap a choice, or use ← →</p>${credit(card.k)}`);
  S.noise(.25, .07, 3200);
  app.querySelectorAll('.opt').forEach(b => {
    const fx = (+b.dataset.s ? R : L)[1];
    b.onmouseenter = b.onfocus = () => setPowers(fx); b.onmouseleave = b.onblur = () => setPowers();
    b.onclick = () => choose(+b.dataset.s);
  });
  const pg = document.getElementById('pg'), bn = document.getElementById('bn'); let x0 = null, side = -1;
  pg.onpointerdown = e => { if (e.target.closest('.opt') || busy) return; x0 = e.clientX; pg.style.transition = 'none'; pg.setPointerCapture(e.pointerId); };
  pg.onpointermove = e => {
    if (x0 === null) return; const dx = e.clientX - x0; pg.style.transform = `translateX(${dx}px) rotate(${dx / 26}deg)`;
    const s = dx < 0 ? 0 : 1, on = Math.abs(dx) > 40; bn.style.opacity = on ? 1 : 0; bn.style.setProperty('--r', (s ? 4 : -4) + 'deg');
    if (on && s !== side) { side = s; bn.textContent = (s ? R : L)[0]; setPowers((s ? R : L)[1]); } if (!on && side !== -1) { side = -1; setPowers(); }
  };
  pg.onpointerup = pg.onpointercancel = e => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; pg.style.transition = ''; pg.style.transform = ''; bn.style.opacity = 0; if (Math.abs(dx) > 100) choose(dx < 0 ? 0 : 1); else setPowers(); };
}
function choose(side) {
  if (busy) return; busy = true;
  const card = C[G.i], [L, R, flip] = opts(card), pick = side ? R : L, orig = flip ? 1 - side : side;
  Object.entries(pick[1]).forEach(([k, d]) => G.v[k] = Math.max(0, Math.min(100, G.v[k] + d)));
  const real = orig === card.h; if (real) G.hist++;
  G.log.push({ y: card.y, k: card.k, c: pick[0], real });
  const dead = PW.find(([k]) => G.v[k] <= 0 || G.v[k] >= 100); if (dead) G.dead = [dead[0], G.v[dead[0]] <= 0 ? 0 : 1];
  S.tone(110, .3, 'sine', .25); S.noise(.15, .2, 600);
  const pg = document.getElementById('pg'); pg.style.setProperty('--fr', (side ? 8 : -8) + 'deg'); pg.style.transform = `translateX(${side ? 60 : -60}px)`;
  setTimeout(() => verdict(real, pick[0]), 260);
}
function verdict(real, choice) {
  const card = C[G.i], last = G.dead || G.i + 1 >= C.length;
  app.innerHTML = frame(`<div class="head">${medal(card.k)}<div><h2>${md(card.k)}</h2><div class="who">Thou hast decreed:</div></div></div>
    <p class="txt" style="font-style:italic">“${md(choice)}.”</p>
    <div class="chron"><div class="seal ${real ? '' : 'no'}">${real ? 'As<br>history<br>did' : 'History<br>went<br>otherwise'}</div><h4>What the chronicles say</h4>${md(card.n)}</div>
    <div class="row"><button class="btn" id="nx">${G.dead ? 'Thy fate…' : last ? 'Close the chronicle' : 'Turn the page'}</button></div>${credit(card.k)}`);
  real ? S.good() : S.tone(196, .4, 'triangle', .14);
  const nx = document.getElementById('nx'); nx.focus();
  nx.onclick = () => { S.click(); const pg = document.getElementById('pg'); pg.classList.add('fall'); setTimeout(() => { if (G.dead) return end(); G.i++; if (G.i >= C.length) return end(); show(); }, 380); };
}
function end() {
  S.stopMusic();
  const won = !G.dead, card = C[G.i], done = won ? C.length : G.i + 1, years = card.y - C[0].y;
  won ? S.win() : S.lose();
  app.innerHTML = `${powers()}<div class="stack"><div class="page rise">${corners()}<div class="title">
    <div class="big">${won ? 'Long live the Crown!' : 'Here endeth thy reign'}</div>
    <p style="text-align:center;margin-top:12px">${won ? 'Thy dynasty survived from ' + C[0].y + ' to ' + card.y + '. The realm passes safely to a Parliament and a Queen who reign together.' : md(END[G.dead[0]][G.dead[1]]) + ' <i>(in the year ' + card.y + ')</i>'}</p>
    <div class="chron" style="text-align:left"><h4>The chronicle of thy reign</h4>${done} of ${C.length} decisions survived · ${years} years of history · thou didst choose as history did <b>${G.hist}</b> times.</div>
    <p style="font-size:16px;text-align:left;margin-top:12px"><i>Talk about it:</i> Which decision was the hardest? Did the real kings and queens choose well? Who had more power at the end of the story – the monarch or Parliament?</p>
    <div class="row"><button class="btn" id="ag">Reign again</button><a class="btn ghost" href="../" style="text-decoration:none">AAA 2 games</a></div></div></div></div>`;
  document.getElementById('ag').onclick = () => { S.click(); start(); };
}
document.addEventListener('keydown', e => { if (!G || busy) return; if (e.key === 'ArrowLeft' && document.querySelector('.opt')) choose(0); if (e.key === 'ArrowRight' && document.querySelector('.opt')) choose(1); });
intro();
})();
