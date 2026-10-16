// President Hunt – AAA 5. Find the Presidents, answer the question, take a sharp photo, collect the card.
(function () {
'use strict';
const P = window.PRES, CR = window.CRED || {}, S = KIT.SND, st = KIT.store('aaa5hunt');
const N = P.length;
const $ = s => document.querySelector(s);
const ov = $('#ov'), cv = $('#map'), g = cv.getContext('2d');
let album = st.get('album') || {};          // index -> timestamp
let mode = null;                            // 'gps' | 'desk' | null
let me = { x: 0, y: 0 }, spawns = [], geo = null, origin = null, acc = 0, busy = false, last = 0, drag = null, keys = {};
const RANGE = { gps: 32, desk: 26 };
const RANKS = [[0, 'Tourist'], [5, 'Intern'], [12, 'Reporter'], [20, 'White House Correspondent'], [30, 'Historian'], [40, 'Presidential Scholar'], [N, 'Hall of Fame']];

const pad = n => String(n).padStart(2, '0');
const img = i => CR[i + 1] ? 'img/' + pad(i + 1) + '.jpg' : null;
const nums = i => P[i].n.map(n => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th')).join(' & ');
const RN = ['', 'Common', 'Rare', 'Legendary'];
const got = () => Object.keys(album).length;
const rank = () => RANKS.filter(r => got() >= r[0]).pop()[1];
const rnd = (a, b) => a + Math.random() * (b - a);
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const code = i => ((i + 1) * 7349 + 1789).toString(36);
const decode = c => { const v = (parseInt(c, 36) - 1789) / 7349 - 1; return Number.isInteger(v) && v >= 0 && v < N ? v : -1; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function showOv(html, cls = '') { ov.innerHTML = '<div class="' + cls + ' fade">' + html + '</div>'; ov.classList.add('on'); ov.scrollTop = 0; }
function hideOv() { ov.classList.remove('on'); ov.innerHTML = ''; }
function updCount() { $('#count').textContent = got() + ' / ' + N; }
function status(t) { const s = $('#status'); s.textContent = t; s.classList.toggle('hide', !t); }

// ---------- menu ----------
function menu() {
  stopHunt();
  const k = got();
  showOv(`<div class="logo"><small>AAA 5 · the USA</small>President<br>Hunt</div>
  <p class="tag">Forty-five Presidents are hiding around you. Find them, answer the question, take a sharp photo – and complete your album.</p>
  <div class="prog"><b style="width:${k / N * 100}%"></b></div><div class="rank">${k} / ${N} · ${rank()}</div>
  <div class="menu">
    <button class="mbtn main" id="mGps"><i>📍</i><span>Walk &amp; hunt<small>Use your phone's location – outside, e.g. in the school yard</small></span></button>
    <button class="mbtn" id="mDesk"><i>🗺️</i><span>Desk hunt<small>Walk on the map with your finger or the arrow keys</small></span></button>
    <button class="mbtn" id="mQr"><i>▣</i><span>QR cards<small>Your teacher hid QR cards – scan one with the phone camera</small></span></button>
    <button class="mbtn" id="mAlb"><i>🃏</i><span>My album<small>${k} of ${N} cards collected</small></span></button>
  </div>
  <p class="foot">The 47 presidencies of the USA belong to 45 people – Grover Cleveland and Donald Trump served two non-consecutive terms, so each has one card. Portraits: public-domain official portraits and photographs via Wikimedia Commons (details on each card). Your album is saved only on this device. No sign-in, no data collected. · <a href="../">All AAA 5 games</a> · <a href="cards.html">Teachers: print QR cards</a></p>`, 'screen dim');
  $('#mGps').onclick = () => { S.init(); S.click(); gpsIntro(); };
  $('#mDesk').onclick = () => { S.init(); S.click(); start('desk'); };
  $('#mQr').onclick = () => { S.init(); S.click(); qrHelp(); };
  $('#mAlb').onclick = () => { S.init(); S.click(); albumView(menu); };
}
function gpsIntro() {
  showOv(`<div class="logo" style="font-size:54px">Walk &amp; hunt</div>
  <div class="warn"><b>Safety first.</b> Play only in a safe place your teacher agrees with – a school yard, a park. Look up from the screen when you walk. Never cross a road while playing.</div>
  <p class="tag" style="font-size:14.5px">Your browser will ask for your location. It is used only on your phone to move you on the map – it is never sent anywhere. Presidents appear within about 150 metres. Walk to one (closer than ${RANGE.gps} m) and tap it.</p>
  <div><button class="btn" id="go">Start walking</button><button class="btn ghost" id="bk">Back</button></div>`, 'screen dim');
  $('#go').onclick = () => start('gps'); $('#bk').onclick = menu;
}
function qrHelp() {
  showOv(`<div class="logo" style="font-size:54px">QR cards</div>
  <p class="tag">Your teacher has hidden President cards around the classroom or the school. When you find one, open the <b>camera</b> on your phone and point it at the QR code. The link opens this game and the President appears.</p>
  <p class="tag" style="font-size:14px">Each card works only once for your album – but you can scan it again to read the facts.</p>
  <div><button class="btn" id="bk">OK</button><a class="btn ghost" style="text-decoration:none;display:inline-block" href="cards.html">Teachers: print the cards</a></div>`, 'screen dim');
  $('#bk').onclick = menu;
}

// ---------- hunting map ----------
function start(m) {
  mode = m; hideOv(); me = { x: 0, y: 0 }; spawns = []; origin = null;
  ['#hud'].forEach(s => $(s).classList.remove('hide'));
  $('#pad').classList.toggle('hide', m !== 'desk');
  updCount();
  if (m === 'gps') {
    status('Looking for your location…');
    if (!navigator.geolocation) { gpsFail('This browser cannot use location.'); return; }
    geo = navigator.geolocation.watchPosition(p => {
      const { latitude: la, longitude: lo, accuracy } = p.coords; acc = accuracy;
      if (!origin) { origin = { la, lo }; fill(); }
      me.x = (lo - origin.lo) * Math.cos(origin.la * Math.PI / 180) * 111320;
      me.y = -(la - origin.la) * 110540;
      status(acc > 40 ? 'Location is not exact (±' + Math.round(acc) + ' m). Go outside, away from buildings.' : 'Walk to a President and tap it.');
    }, e => gpsFail(e.code === 1 ? 'Location is switched off for this page.' : 'Your location could not be found.'), { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 });
  } else { fill(); status('Walk to a President and tap it.'); }
  S.startMusic([57, 0, 64, 0, 62, 0, 60, 0, 57, 0, 64, 0, 67, 0, 64, 0], 300, 'sine');
}
function gpsFail(t) {
  stopHunt();
  showOv(`<div class="logo" style="font-size:54px">No location</div><p class="tag">${t} You can allow it in the browser settings – or play the Desk hunt instead.</p>
  <div><button class="btn" id="d">Desk hunt</button><button class="btn ghost" id="bk">Menu</button></div>`, 'screen dim');
  $('#d').onclick = () => start('desk'); $('#bk').onclick = menu;
}
function stopHunt() {
  if (geo !== null) navigator.geolocation.clearWatch(geo); geo = null; mode = null;
  ['#hud', '#pad'].forEach(s => $(s).classList.add('hide')); status(''); S.stopMusic();
}
function pick() {
  const taken = new Set(spawns.map(s => s.i));
  const pool = [...Array(N).keys()].filter(i => !taken.has(i));
  const fresh = pool.filter(i => !album[i]);
  const from = fresh.length && Math.random() < .8 ? fresh : pool;
  // rarity weights: legendary appear less often
  const w = from.map(i => [0, 6, 3, 1.4][P[i].r]); let t = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let k = 0; k < from.length; k++) { t -= w[k]; if (t <= 0) return from[k]; } return from[0];
}
function spawn() {
  const near = mode === 'gps' ? [45, 150] : [60, 230];
  for (let k = 0; k < 20; k++) {
    const a = Math.random() * Math.PI * 2, d = rnd(near[0], near[1]), x = me.x + Math.cos(a) * d, y = me.y + Math.sin(a) * d;
    if (k < 19 && spawns.some(s => Math.hypot(s.x - x, s.y - y) < 45)) continue;
    spawns.push({ i: pick(), x, y, ph: Math.random() * 6 }); return;
  }
}
function fill() { while (spawns.length < 7) spawn(); }

// world drawing
let W = 0, H = 0, DPR = 1;
function resize() { DPR = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; g.setTransform(DPR, 0, 0, DPR, 0, 0); }
addEventListener('resize', resize); resize();
const hash = (x, y) => { let h = x * 374761393 + y * 668265263; h = (h ^ (h >> 13)) * 1274126177; return ((h ^ (h >> 16)) >>> 0) / 4294967295; };
const scale = () => Math.min(W, H) / 380;          // px per metre
function draw(t) {
  const k = scale(), cx = W / 2, cy = H / 2 + 20, CELL = 56, ST = 9;
  g.fillStyle = '#0A1528'; g.fillRect(0, 0, W, H);
  const x0 = me.x - cx / k, y0 = me.y - cy / k, x1 = me.x + (W - cx) / k, y1 = me.y + (H - cy) / k;
  // street glow
  g.fillStyle = '#132542';
  for (let gx = Math.floor(x0 / CELL); gx <= Math.floor(x1 / CELL); gx++) {
    for (let gy = Math.floor(y0 / CELL); gy <= Math.floor(y1 / CELL); gy++) {
      const h = hash(gx, gy), sx = cx + (gx * CELL - me.x) * k, sy = cy + (gy * CELL - me.y) * k, s = (CELL - ST) * k, o = ST / 2 * k;
      if (h < .13) { g.fillStyle = '#123A35'; g.fillRect(sx + o, sy + o, s, s); g.fillStyle = '#17483F';
        for (let j = 0; j < 5; j++) { const a = hash(gx * 7 + j, gy * 3 - j); g.beginPath(); g.arc(sx + o + a * s, sy + o + hash(gx - j, gy + j * 5) * s, (3 + a * 4) * k, 0, 7); g.fill(); } continue; }
      if (h < .19) { g.fillStyle = '#1A2B47'; g.fillRect(sx + o, sy + o, s, s); g.strokeStyle = '#25406A'; g.lineWidth = 1; g.beginPath(); g.arc(sx + o + s / 2, sy + o + s / 2, s / 4, 0, 7); g.stroke(); continue; }
      // buildings: split block into 2–4 lots
      const n = 1 + Math.floor(hash(gy, gx) * 3), lot = s / n;
      for (let j = 0; j < n; j++) {
        const hh = hash(gx * 13 + j, gy * 17), shade = 30 + Math.floor(hh * 22);
        g.fillStyle = `rgb(${shade - 8},${shade + 6},${shade + 34})`;
        const bx = sx + o + j * lot + 1.5 * k, by = sy + o + 1.5 * k, bw = lot - 3 * k, bh = s - 3 * k;
        g.fillRect(bx, by, bw, bh);
        g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(bx, by + bh - 3 * k, bw, 3 * k);
        if (hh > .62) { g.fillStyle = 'rgba(246,197,74,.18)'; for (let w = 0; w < 4; w++) g.fillRect(bx + (w + .5) * bw / 4.5, by + bh * .3, 2 * k, 2 * k); }
      }
    }
  }
  // radar sweep
  const R = 200 * k, a = (t / 1400) % (Math.PI * 2);
  const grd = g.createRadialGradient(cx, cy, 0, cx, cy, R); grd.addColorStop(0, 'rgba(63,242,208,.10)'); grd.addColorStop(1, 'rgba(63,242,208,0)');
  g.fillStyle = grd; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, a - .7, a); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(63,242,208,.18)'; g.lineWidth = 1; [60, 120, 180].forEach(r => { g.beginPath(); g.arc(cx, cy, r * k, 0, 7); g.stroke(); });
  // catch range
  const rr = RANGE[mode] * k; g.setLineDash([6, 6]); g.strokeStyle = 'rgba(63,242,208,.7)'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, rr, 0, 7); g.stroke(); g.setLineDash([]);
  g.fillStyle = 'rgba(63,242,208,.06)'; g.fill();
  // spawns
  spawns.forEach(s => {
    const sx = cx + (s.x - me.x) * k, sy = cy + (s.y - me.y) * k, d = Math.hypot(s.x - me.x, s.y - me.y), inR = d <= RANGE[mode];
    s.sx = sx; s.sy = sy; s.d = d;
    const p = P[s.i], col = ['', '#C9D2DC', '#3FF2D0', '#F6C54A'][p.r], bob = Math.sin(t / 300 + s.ph) * (inR ? 6 : 2.5);
    if (sx < -60 || sy < -60 || sx > W + 60 || sy > H + 60) { // edge arrow
      const ang = Math.atan2(sy - cy, sx - cx), ex = Math.max(24, Math.min(W - 24, sx)), ey = Math.max(80, Math.min(H - 60, sy));
      g.save(); g.translate(ex, ey); g.rotate(ang); g.fillStyle = col; g.beginPath(); g.moveTo(10, 0); g.lineTo(-6, -7); g.lineTo(-6, 7); g.fill(); g.restore(); return;
    }
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(sx, sy + 4, 14, 5, 0, 0, 7); g.fill();
    const pulse = 1 + Math.sin(t / 250 + s.ph) * .12;
    g.fillStyle = col.replace(')', '') ; g.globalAlpha = .22; g.beginPath(); g.arc(sx, sy - 22 + bob, 26 * pulse, 0, 7); g.fill(); g.globalAlpha = 1;
    // badge
    g.fillStyle = '#0B1424'; g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.arc(sx, sy - 22 + bob, 18, 0, 7); g.fill(); g.stroke();
    // bust silhouette
    g.fillStyle = col; g.beginPath(); g.arc(sx, sy - 28 + bob, 5.5, 0, 7); g.fill();
    g.beginPath(); g.moveTo(sx - 10, sy - 12 + bob); g.quadraticCurveTo(sx - 9, sy - 22 + bob, sx, sy - 21 + bob); g.quadraticCurveTo(sx + 9, sy - 22 + bob, sx + 10, sy - 12 + bob); g.closePath(); g.fill();
    if (album[s.i]) { g.fillStyle = '#0B1424'; g.beginPath(); g.arc(sx + 13, sy - 35 + bob, 7, 0, 7); g.fill(); g.fillStyle = '#3FF2D0'; g.font = '800 10px Inter'; g.textAlign = 'center'; g.fillText('✓', sx + 13, sy - 31.5 + bob); }
    g.textAlign = 'center'; g.font = inR ? '400 15px Anton' : '700 11px Inter'; g.fillStyle = inR ? '#fff' : 'rgba(255,255,255,.75)';
    g.fillText(inR ? 'TAP!' : Math.round(d) + ' m', sx, sy + 18);
  });
  // player
  const pr = 10 + Math.sin(t / 400) * 1.5;
  g.fillStyle = 'rgba(63,242,208,.25)'; g.beginPath(); g.arc(cx, cy, pr + 10, 0, 7); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, cy, pr, 0, 7); g.fill(); g.fillStyle = '#3FF2D0'; g.beginPath(); g.arc(cx, cy, pr - 4, 0, 7); g.fill();
  // north
  g.fillStyle = 'rgba(255,255,255,.55)'; g.font = '700 11px Inter'; g.textAlign = 'right'; g.fillText('N ▲', W - 14, H - 18 - (innerHeight - H));
}
function loop(t) {
  const dt = Math.min(.05, (t - last) / 1000 || 0); last = t;
  if (mode) {
    if (mode === 'desk') {
      let vx = 0, vy = 0;
      if (keys.ArrowLeft || keys.a) vx--; if (keys.ArrowRight || keys.d) vx++; if (keys.ArrowUp || keys.w) vy--; if (keys.ArrowDown || keys.s) vy++;
      if (drag) { const dx = drag.x - W / 2, dy = drag.y - (H / 2 + 20), l = Math.hypot(dx, dy); if (l > 20) { vx = dx / l; vy = dy / l; } }
      const l = Math.hypot(vx, vy); if (l) { me.x += vx / l * 34 * dt; me.y += vy / l * 34 * dt; }
    }
    spawns = spawns.filter(s => Math.hypot(s.x - me.x, s.y - me.y) < 320);
    if (origin || mode === 'desk') fill();
    draw(t);
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
cv.addEventListener('pointerdown', e => {
  if (!mode || busy) return; S.init();
  const hit = spawns.filter(s => s.sx !== undefined && Math.hypot(e.clientX - s.sx, e.clientY - (s.sy - 22)) < 30).sort((a, b) => a.d - b.d)[0];
  if (hit) {
    if (hit.d <= RANGE[mode]) { S.click(); const idx = hit.i; encounter(idx, ok => { if (ok) spawns = spawns.filter(s => s !== hit); else { const a = Math.random() * 7; hit.x += Math.cos(a) * 70; hit.y += Math.sin(a) * 70; } updCount(); });
    } else { status('Too far – walk ' + Math.round(hit.d - RANGE[mode]) + ' m closer.'); S.tone(300, .1, 'sine', .08); }
    return;
  }
  if (mode === 'desk') { drag = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); }
});
cv.addEventListener('pointermove', e => { if (drag) drag = { x: e.clientX, y: e.clientY }; });
['pointerup', 'pointercancel'].forEach(ev => cv.addEventListener(ev, () => drag = null));
addEventListener('keydown', e => { keys[e.key] = true; if (mode && e.key.startsWith('Arrow')) e.preventDefault(); });
addEventListener('keyup', e => { keys[e.key] = false; });
$('#back').onclick = () => { S.click(); menu(); };
$('#albumBtn').onclick = () => { S.click(); const m = mode; busy = true; albumView(() => { hideOv(); busy = false; if (!m) menu(); }); };

// ---------- encounter ----------
function question(i) {
  const p = P[i], near = [...Array(N).keys()].filter(j => j !== i && Math.abs(j - i) <= 9);
  const others = shuffle(near).slice(0, 3);
  const kind = p.p !== 'none' && Math.random() < .12 ? 'party' : Math.random() < .62 ? 'who' : 'when';
  if (kind === 'who') return { q: 'Who is this President?', clue: p.f.replace(p.name, 'this President'), o: shuffle([i, ...others]).map(j => ({ t: P[j].name, ok: j === i })) };
  if (kind === 'when') return { q: 'This is ' + p.name + ', the ' + nums(i) + ' President. When was he in office?', o: shuffle([i, ...others]).map(j => ({ t: P[j].y, ok: j === i })) };
  const parties = ['Democratic', 'Republican', 'Whig', 'Federalist', 'Democratic-Republican', 'National Union'].filter(x => x !== p.p);
  return { q: 'This is ' + p.name + ' (' + p.y + '). Which party did he belong to?', o: shuffle([{ t: p.p, ok: true }, ...shuffle(parties).slice(0, 3).map(t => ({ t, ok: false }))]) };
}
function portrait(i) { const s = img(i); return s ? `<img src="${s}" alt="">` : `<div class="ph">${P[i].n[0]}</div>`; }
function encounter(i, done, viaQr) {
  busy = true; S.stopMusic(); const p = P[i], q = question(i), had = !!album[i];
  showOv(`<div class="kick">${viaQr ? 'QR card found' : RN[p.r] + ' sighting'}</div><h3>A President appears!</h3>
    <div class="stage sil" id="stg"><div class="spot"></div>${portrait(i)}<canvas class="vf" id="vf"></canvas><div class="flash" id="fl"></div></div>
    <div class="q">${esc(q.q)}${q.clue ? '<em>“' + esc(q.clue) + '”</em>' : ''}</div><div class="opts" id="opts"></div>`, 'enc');
  S.tone(196, .5, 'sine', .12); S.tone(294, .6, 'sine', .1, .15);
  const box = $('#opts');
  q.o.forEach(o => { const b = document.createElement('button'); b.className = 'opt'; b.textContent = o.t; b.onclick = () => answer(o, b); box.appendChild(b); });
  function answer(o, b) {
    [...box.children].forEach(x => x.disabled = true);
    if (o.ok) { b.classList.add('ok'); S.good(); setTimeout(() => shoot(i, had, done), 700); }
    else {
      b.classList.add('bad'); [...box.children].forEach((x, k) => { if (q.o[k].ok) x.classList.add('ok'); }); S.bad();
      setTimeout(() => {
        $('#stg').classList.remove('sil');
        box.insertAdjacentHTML('afterend', `<p class="q" style="color:#FF9AA4">He slipped away into the crowd…</p><p class="q" style="font-weight:500">That was <b>${esc(p.name)}</b> (${p.y}). ${viaQr ? 'Scan the card again to try once more.' : 'He is still nearby – find him again!'}</p><button class="btn" id="cont">Continue</button>`);
        $('#cont').onclick = () => { end(); done(false); };
      }, 900);
    }
  }
  function end() { busy = false; hideOv(); if (mode) S.startMusic([57, 0, 64, 0, 62, 0, 60, 0, 57, 0, 64, 0, 67, 0, 64, 0], 300, 'sine'); }
  function shoot() {
    const stg = $('#stg'); stg.classList.remove('sil'); stg.classList.add('blur');
    const im = stg.querySelector('img,.ph'), vf = $('#vf'), r = stg.getBoundingClientRect();
    vf.width = r.width * 2; vf.height = r.height * 2; const v = vf.getContext('2d');
    box.innerHTML = ''; document.querySelector('.q').innerHTML = 'Correct! Now take a sharp photo.<em>Press the shutter when the picture is in focus.</em>';
    box.insertAdjacentHTML('afterend', `<button class="shoot" id="sh">SNAP</button><div class="shots" id="sl"></div>`);
    const speed = [0, 1.7, 2.3, 3.1][p.r], tol = [0, 2.6, 2.0, 1.5][p.r]; let shots = 3, t0 = performance.now(), live = true, blur = 10;
    const sl = $('#sl'); const info = () => sl.textContent = '📷 ' + shots + (shots === 1 ? ' shot' : ' shots') + ' left';
    info();
    (function frame(t) {
      if (!live) return;
      blur = Math.abs(Math.sin((t - t0) / 1000 * speed)) * 12;
      im.style.filter = 'blur(' + blur.toFixed(1) + 'px)';
      const w = vf.width, h = vf.height, c = blur < tol ? '#3FF2D0' : '#fff'; v.clearRect(0, 0, w, h);
      v.strokeStyle = c; v.lineWidth = 5; const m = 26, L = 46;
      [[m, m, 1, 1], [w - m, m, -1, 1], [m, h - m, 1, -1], [w - m, h - m, -1, -1]].forEach(([x, y, a, b]) => { v.beginPath(); v.moveTo(x, y + b * L); v.lineTo(x, y); v.lineTo(x + a * L, y); v.stroke(); });
      const fw = w * .6, fx = (w - fw) / 2, fy = h - 46; v.fillStyle = 'rgba(0,0,0,.5)'; v.fillRect(fx, fy, fw, 14);
      v.fillStyle = 'rgba(63,242,208,.55)'; v.fillRect(fx, fy, fw * tol / 12, 14);
      v.fillStyle = c; v.fillRect(fx + fw * blur / 12 - 3, fy - 6, 6, 26);
      requestAnimationFrame(frame);
    })(t0);
    $('#sh').onclick = () => {
      if (!live) return; const fl = $('#fl'); fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go');
      S.noise(.12, .3, 5000); S.tone(1200, .05, 'square', .06);
      if (blur < tol) { live = false; im.style.filter = 'none'; setTimeout(() => reveal(), 650); return; }
      shots--; info(); S.bad();
      if (!shots) {
        live = false; $('#sh').remove();
        sl.insertAdjacentHTML('afterend', `<p class="q" style="color:#FF9AA4">All your photos are blurred – he walked away.</p><p class="q" style="font-weight:500">${esc(p.name)} is still somewhere near. Try again!</p><button class="btn" id="cont">Continue</button>`);
        $('#cont').onclick = () => { end(); done(false); };
      }
    };
  }
  function reveal() {
    const fresh = !album[i]; if (fresh) { album[i] = Date.now(); st.set('album', album); }
    S.win();
    showOv(`<div class="kick">${fresh ? 'New card!' : 'You already have this card'}</div><h3>${got()} / ${N}</h3>${cardHTML(i)}
      <div class="rank" style="margin-top:12px">${rank()}</div>
      <div style="margin-top:8px"><button class="btn" id="cont">${mode ? 'Keep hunting' : 'Menu'}</button><button class="btn ghost" id="alb">Album</button></div>`, 'enc');
    if (got() === N && fresh) setTimeout(() => S.special(), 600);
    $('#cont').onclick = () => { end(); done(true); if (!mode) menu(); };
    $('#alb').onclick = () => { albumView(() => { end(); done(true); if (!mode) menu(); }); };
  }
}
function cardHTML(i) {
  const p = P[i], c = CR[i + 1];
  return `<div class="card r${p.r}"><div class="in"><div class="top"><b>${esc(p.name)}</b><span>${p.n.join(' · ')}</span></div>
  <div class="pic">${img(i) ? `<img src="${img(i)}" alt="${esc(p.name)}">` : `<div class="ph">${p.n[0]}</div>`}<span class="rar">${'★'.repeat(p.r)} ${RN[p.r]}</span></div>
  <div class="meta"><i>${nums(i)} President</i><i>${p.y}</i>${p.p !== 'none' ? `<i>${esc(p.p)}</i>` : '<i>no party</i>'}</div>
  <div class="fact">${esc(p.f)}</div>
  <div class="cr">${c ? `Portrait: ${esc(c.a || 'unknown author')}${c.d ? ', ' + esc(c.d) : ''}. ${esc(c.l)}, via <a href="${c.u}" target="_blank" rel="noopener">Wikimedia Commons</a>.` : 'Portrait not available yet.'}</div></div></div>`;
}

// ---------- album ----------
function albumView(back) {
  const k = got();
  let h = `<header><div><h2>My album</h2><div class="rank" style="margin:0">${k} / ${N} · ${rank()}</div></div><button class="btn ghost" id="cls">Close</button></header><div class="grid">`;
  P.forEach((p, i) => {
    const has = album[i];
    h += has ? `<button class="slot r${p.r}" data-i="${i}">${img(i) ? `<img src="${img(i)}" alt="" loading="lazy">` : ''}<span class="no"><b>${p.n.join(' · ')}</b>${esc(p.name)}</span></button>`
      : `<div class="slot locked"><span class="q2">?</span><span class="no"><b>${p.n.join(' · ')}</b>${p.y}</span></div>`;
  });
  h += '</div>';
  if (k) h += `<p class="foot" style="text-align:center;margin:16px auto"><button class="btn ghost" id="rst" style="font-size:12px;padding:8px 12px">Start a new album</button></p>`;
  showOv(h, 'album');
  $('#cls').onclick = back;
  ov.querySelectorAll('.slot[data-i]').forEach(b => b.onclick = () => {
    S.click(); const i = +b.dataset.i;
    showOv(cardHTML(i) + `<div style="margin-top:12px"><button class="btn" id="b2">Back to album</button></div>`, 'enc');
    $('#b2').onclick = () => albumView(back);
  });
  const r = $('#rst'); if (r) r.onclick = () => { if (confirm('Delete all your cards and start again?')) { album = {}; st.set('album', album); updCount(); albumView(back); } };
}

// ---------- start ----------
const qp = new URLSearchParams(location.search).get('c');
if (qp) {
  history.replaceState(null, '', location.pathname);
  const i = decode(qp.toLowerCase());
  if (i >= 0) {
    showOv(`<div class="logo" style="font-size:56px"><small>QR card</small>You found<br>a President!</div><p class="tag">Answer the question and take a sharp photo to get the card.</p><button class="btn gold" id="go">Show me</button>`, 'screen dim');
    $('#go').onclick = () => { S.init(); encounter(i, () => { }, true); };
  } else menu();
} else menu();
window.__hunt = { code, P };
})();
