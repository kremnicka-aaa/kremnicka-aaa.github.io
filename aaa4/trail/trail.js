// The Oregon Trail · 1848 – AAA 4 story and survival game. All pictures are drawn in code; one photo is public domain (LOC).
// Historical notes are simplified for the game; distances are rounded and prices are invented game prices.
(function () {
'use strict';
const K = window.KIT, { W, H, cv, stroke, fillS, shade, SND, rnd, pick } = K;
const INK = '#2A1C10';
const LM = [
  { n: 'Independence, Missouri', mi: 0, kind: 'town', reg: 0, fact: 'Independence was one of the “jumping-off” towns where emigrants bought supplies and joined wagon trains in spring.' },
  { n: 'Kansas River crossing', mi: 100, kind: 'river', reg: 0, depth: 3, fact: 'The first big river. Ferries carried wagons across for a fee – or you could try to ford it.' },
  { n: 'Fort Kearny', mi: 310, kind: 'fort', reg: 0, price: 1.5, fact: 'The US Army built Fort Kearny on the Platte River in 1848 to protect travellers on the trail.' },
  { n: 'Chimney Rock', mi: 560, kind: 'rock', reg: 1, fact: 'This tall rock spire in Nebraska was one of the most famous landmarks of the trail. Many emigrants drew it in their diaries.' },
  { n: 'Fort Laramie', mi: 650, kind: 'fort', reg: 1, price: 2, fact: 'A trading post in the land of the Lakota. Emigrants repaired wagons, traded and sent letters home.' },
  { n: 'Independence Rock', mi: 830, kind: 'dome', reg: 2, fact: 'A huge granite rock in Wyoming. Travellers hoped to reach it by 4 July – and carved or painted their names on it.' },
  { n: 'South Pass', mi: 930, kind: 'pass', reg: 2, fact: 'A wide, gentle valley across the Rocky Mountains – almost the only place where wagons could cross them.' },
  { n: 'Fort Hall', mi: 1200, kind: 'fort', reg: 3, price: 2.5, fact: 'A trading post of the British Hudson\'s Bay Company in the Snake River country of today\'s Idaho.' },
  { n: 'Snake River – Three Island Crossing', mi: 1400, kind: 'river', reg: 3, depth: 6, fact: 'A dangerous crossing of the fast Snake River, using islands as stepping stones.' },
  { n: 'Blue Mountains', mi: 1640, kind: 'forest', reg: 4, fact: 'Steep, forested mountains. Wagons had to be pulled up and lowered down with ropes.' },
  { n: 'The Dalles', mi: 1830, kind: 'dalles', reg: 5, fact: 'Here the road ended at the Columbia River. Since 1846 emigrants could choose the new Barlow Road around Mount Hood instead of a dangerous raft trip.' },
  { n: 'Oregon City', mi: 1930, kind: 'end', reg: 5, fact: 'The end of the trail in the fertile Willamette Valley. In August 1848 Congress made Oregon an official territory of the United States.' }
];
const PEOPLES = [
  { reg: 0, who: 'Kansa (Kaw) traders', offer: 'fresh corn and vegetables', fact: 'The Kansa, who gave their name to the river and the later state, traded with emigrants at the crossings.' },
  { reg: 1, who: 'Pawnee families', offer: 'dried corn', fact: 'The Pawnee lived in earth lodge villages along the Platte and grew corn, beans and squash.' },
  { reg: 1, who: 'Lakota traders', offer: 'dried buffalo meat', fact: 'The Lakota (Sioux) were buffalo hunters of the northern plains. Many trade meetings near Fort Laramie were peaceful.' },
  { reg: 3, who: 'Shoshone fishermen', offer: 'fresh and dried salmon', fact: 'Along the Snake River the Shoshone fished for salmon and often traded it with hungry travellers.' },
  { reg: 4, who: 'Cayuse riders', offer: 'food and help over the mountains', fact: 'The Cayuse of the Blue Mountains region were famous for their horses – a small horse is still called a “cayuse”.' }
];
const REG = [ // scenery per region
  { name: 'prairie', sky: ['#9CC3E6', '#F3E2B8'], far: '#8FA7A0', mid: '#7FA05A', near: '#A8B862', deco: 'grass' },
  { name: 'plains', sky: ['#A7C4DE', '#F0D9A8'], far: '#C9A57A', mid: '#B5A060', near: '#C9B46E', deco: 'bluff' },
  { name: 'high plains', sky: ['#8FB6DA', '#EEDCB0'], far: '#8A93A6', mid: '#A49A6A', near: '#B8A86E', deco: 'sage' },
  { name: 'snake river', sky: ['#9FC0DC', '#F2DFB4'], far: '#9A8A7A', mid: '#B8A27A', near: '#C9B07E', deco: 'sage' },
  { name: 'blue mountains', sky: ['#88A6C4', '#DCD8C4'], far: '#5E7290', mid: '#3E5A3E', near: '#6E8A4E', deco: 'pines' },
  { name: 'columbia', sky: ['#8EAACB', '#E2DCC8'], far: '#6E7E92', mid: '#4E6A4E', near: '#7E9A5E', deco: 'pines' }
];

/* ---------- drawing (woodcut / sepia style) ---------- */
function wagon() { const c = cv(300, 210), g = c.getContext('2d');
  g.beginPath(); g.moveTo(40, 120); g.lineTo(260, 120); g.lineTo(250, 160); g.lineTo(50, 160); g.closePath(); fillS(g, '#8A5A2E'); g.strokeStyle = 'rgba(60,30,10,.5)'; g.lineWidth = 2; for (let y = 128; y < 160; y += 9) { g.beginPath(); g.moveTo(46, y); g.lineTo(256, y); g.stroke(); }
  g.beginPath(); g.moveTo(52, 122); g.quadraticCurveTo(40, 30, 96, 26); g.quadraticCurveTo(150, 14, 204, 26); g.quadraticCurveTo(262, 30, 248, 122); g.closePath(); fillS(g, '#F2EAD3'); g.strokeStyle = 'rgba(120,100,70,.45)'; g.lineWidth = 3; [100, 150, 200].forEach(x => { g.beginPath(); g.moveTo(x, 122); g.quadraticCurveTo(x + (x - 150) * .1, 60, x, 22); g.stroke(); });
  g.beginPath(); g.moveTo(52, 122); g.quadraticCurveTo(40, 30, 96, 26); g.quadraticCurveTo(150, 14, 204, 26); g.quadraticCurveTo(262, 30, 248, 122); stroke(g, 3);
  g.beginPath(); g.moveTo(260, 150); g.lineTo(300, 150); stroke(g, 6); return c; }
function wheel(r) { const c = cv(r * 2 + 8, r * 2 + 8), g = c.getContext('2d'), o = r + 4; g.beginPath(); g.arc(o, o, r, 0, 7); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); g.lineWidth = 4; g.strokeStyle = '#7A4A22'; g.stroke(); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.beginPath(); g.moveTo(o, o); g.lineTo(o + Math.cos(a) * r, o + Math.sin(a) * r); g.lineWidth = 3; g.strokeStyle = '#5A3A1A'; g.stroke(); } g.beginPath(); g.arc(o, o, 7, 0, 7); fillS(g, '#5A3A1A', 2); return c; }
function ox(f) { const c = cv(170, 110), g = c.getContext('2d'); const l = f ? 8 : -8;
  [[40, l], [56, -l], [118, -l], [132, l]].forEach(([x, d]) => { g.beginPath(); g.moveTo(x, 66); g.lineTo(x + d, 104); stroke(g, 9); g.strokeStyle = '#6B4524'; g.lineWidth = 6; g.stroke(); });
  g.beginPath(); g.ellipse(86, 60, 60, 26, 0, 0, 7); fillS(g, '#8A5A34'); g.fillStyle = '#E8DCC0'; g.beginPath(); g.ellipse(70, 52, 18, 10, .4, 0, 7); g.fill();
  g.beginPath(); g.moveTo(140, 48); g.quadraticCurveTo(162, 46, 166, 64); g.quadraticCurveTo(160, 78, 146, 74); fillS(g, '#7A4A2A'); g.beginPath(); g.moveTo(150, 46); g.quadraticCurveTo(156, 28, 170, 30); stroke(g, 4); g.strokeStyle = '#EDE3CB'; g.lineWidth = 2.5; g.stroke();
  g.beginPath(); g.moveTo(26, 52); g.quadraticCurveTo(12, 60, 14, 80); stroke(g, 4); g.beginPath(); g.rect(120, 34, 8, 30); fillS(g, '#6B4524', 2); return c; }
function walker(kind, f) { const c = cv(70, 130), g = c.getContext('2d'); const l = f ? 7 : -7;
  const coat = { father: '#5A4632', mother: '#6E4A5E', girl: '#8A3A2E', boy: '#3E5A6E', baby: '#7A6A4E' }[kind] || '#5A4632', small = kind === 'girl' || kind === 'boy';
  g.save(); if (small) { g.translate(10, 34); g.scale(.75, .75); }
  g.beginPath(); g.moveTo(28, 86); g.lineTo(28 - l, 124); g.moveTo(40, 86); g.lineTo(40 + l, 124); stroke(g, 7); g.strokeStyle = '#3A2A1E'; g.lineWidth = 4; g.stroke();
  if (kind === 'mother' || kind === 'girl') { g.beginPath(); g.moveTo(22, 46); g.lineTo(46, 46); g.lineTo(56, 112); g.lineTo(12, 112); g.closePath(); fillS(g, coat); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(20, 72, 28, 4); }
  else { g.beginPath(); K.rr(g, 20, 44, 28, 46, 6); fillS(g, coat); }
  g.beginPath(); g.moveTo(26, 52); g.lineTo(18 + l, 82); stroke(g, 6); g.beginPath(); g.moveTo(42, 52); g.lineTo(50 - l, 80); stroke(g, 6);
  g.beginPath(); g.arc(34, 32, 12, 0, 7); fillS(g, '#E7BE96', 2.5);
  if (kind === 'father' || kind === 'boy') { g.beginPath(); g.ellipse(34, 22, 20, 5, 0, 0, 7); fillS(g, '#4A3A2A', 2); g.beginPath(); g.rect(24, 8, 20, 14); fillS(g, '#4A3A2A', 2); }
  else { g.beginPath(); g.moveTo(20, 36); g.quadraticCurveTo(18, 12, 34, 14); g.quadraticCurveTo(52, 12, 50, 36); g.quadraticCurveTo(46, 22, 34, 22); g.quadraticCurveTo(24, 22, 20, 36); fillS(g, '#EDE3CB', 2); }
  g.restore(); return c; }
function layer(kind, col, h, seed) { const c = cv(1280, h), g = c.getContext('2d'); g.fillStyle = col;
  if (kind === 'mountains') { g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= 1280; x += 80) { const peak = h * .25 + Math.abs(Math.sin(x / 210 + seed)) * h * .45; g.lineTo(x + 40, h - peak); g.lineTo(x + 80, h - peak * .5 - 20); } g.lineTo(1280, h); g.fill(); g.fillStyle = 'rgba(255,255,255,.6)'; for (let x = 0; x <= 1280; x += 80) { const peak = h * .25 + Math.abs(Math.sin(x / 210 + seed)) * h * .45; if (peak > h * .5) { g.beginPath(); g.moveTo(x + 40, h - peak); g.lineTo(x + 26, h - peak + 26); g.lineTo(x + 54, h - peak + 26); g.fill(); } } }
  else { g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= 1280; x += 16) g.lineTo(x, h * .45 + Math.sin(x / 160 + seed) * h * .18 + Math.sin(x / 50 + seed * 3) * h * .05); g.lineTo(1280, h); g.fill(); }
  return c; }
function deco(kind) { const c = cv(1280, 120), g = c.getContext('2d');
  for (let i = 0; i < 26; i++) { const x = rnd(0, 1280), y = rnd(60, 110);
    if (kind === 'grass') { g.strokeStyle = 'rgba(70,90,30,.7)'; g.lineWidth = 2; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(x + k * 3, y); g.lineTo(x + k * 3 + rnd(-6, 6), y - rnd(10, 22)); g.stroke(); } if (Math.random() < .3) { g.fillStyle = pick(['#E3B444', '#C9A0D8', '#F2EAD3']); g.beginPath(); g.arc(x, y - 18, 3, 0, 7); g.fill(); } }
    if (kind === 'sage' || kind === 'bluff') { g.fillStyle = 'rgba(110,120,90,.85)'; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(x + k * 7, y - rnd(4, 12), rnd(6, 10), 0, 7); g.fill(); } }
    if (kind === 'pines') { g.fillStyle = 'rgba(40,70,45,.95)'; g.beginPath(); g.moveTo(x, y + 10); g.lineTo(x + 14, y - 50); g.lineTo(x + 28, y + 10); g.fill(); g.fillStyle = '#5A3A1A'; g.fillRect(x + 12, y + 8, 4, 10); } }
  return c; }
function landmark(kind) { const c = cv(520, 340), g = c.getContext('2d');
  if (kind === 'rock') { g.beginPath(); g.moveTo(80, 340); g.quadraticCurveTo(200, 210, 240, 200); g.lineTo(250, 40); g.lineTo(272, 30); g.lineTo(282, 200); g.quadraticCurveTo(330, 210, 440, 340); g.closePath(); fillS(g, '#C9A27A'); g.strokeStyle = 'rgba(100,70,40,.4)'; g.lineWidth = 3; for (let y = 60; y < 330; y += 20) { g.beginPath(); g.moveTo(150 + y * .25, y + 10); g.lineTo(380 - y * .25, y + 12); g.stroke(); } }
  if (kind === 'dome') { g.beginPath(); g.moveTo(10, 340); g.quadraticCurveTo(60, 140, 260, 130); g.quadraticCurveTo(470, 140, 510, 340); g.closePath(); fillS(g, '#A8998A'); g.fillStyle = 'rgba(60,40,30,.55)'; g.font = '700 18px "IM Fell English", serif'; ['J. Smith 1848', 'OREGON!', 'M. & T. Brown', 'Ohio 1847'].forEach((t, i) => g.fillText(t, 120 + i * 70, 230 + (i % 2) * 34)); }
  if (kind === 'fort') { g.fillStyle = '#9A6B3A'; for (let x = 30; x < 490; x += 18) { g.beginPath(); g.moveTo(x, 340); g.lineTo(x, 180); g.lineTo(x + 8, 168); g.lineTo(x + 16, 180); g.lineTo(x + 16, 340); g.closePath(); fillS(g, x % 36 ? '#9A6B3A' : '#A87A44', 2.5); } [[20, 120], [440, 120]].forEach(([x, y]) => { g.beginPath(); g.rect(x, y, 70, 80); fillS(g, '#8A5A2E'); g.beginPath(); g.moveTo(x - 8, y); g.lineTo(x + 35, y - 40); g.lineTo(x + 78, y); g.closePath(); fillS(g, '#6B4524'); }); g.beginPath(); g.moveTo(260, 168); g.lineTo(260, 40); stroke(g, 4); g.fillStyle = '#B5202A'; g.fillRect(262, 42, 70, 40); g.fillStyle = '#F2EAD3'; for (let i = 0; i < 4; i++) g.fillRect(262, 46 + i * 10, 70, 4); g.fillStyle = '#1F3A6E'; g.fillRect(262, 42, 28, 22); }
  if (kind === 'river') { g.fillStyle = '#4E7FA6'; g.beginPath(); g.moveTo(0, 250); g.quadraticCurveTo(260, 230, 520, 250); g.lineTo(520, 340); g.lineTo(0, 340); g.fill(); g.strokeStyle = 'rgba(220,235,245,.7)'; g.lineWidth = 3; for (let i = 0; i < 18; i++) { const x = rnd(10, 500), y = rnd(262, 330); g.beginPath(); g.arc(x, y, 12, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); } }
  if (kind === 'pass') { g.fillStyle = '#B9B19A'; g.beginPath(); g.moveTo(0, 340); g.lineTo(0, 140); g.quadraticCurveTo(260, 260, 520, 140); g.lineTo(520, 340); g.fill(); stroke(g, 3); }
  if (kind === 'forest' || kind === 'dalles') { for (let i = 0; i < 14; i++) { const x = 10 + i * 36, h = rnd(150, 260); g.beginPath(); g.moveTo(x, 340); g.lineTo(x + 20, 340 - h); g.lineTo(x + 40, 340); g.closePath(); fillS(g, i % 2 ? '#2E4A30' : '#3A5A38', 2.5); } if (kind === 'dalles') { g.fillStyle = '#4E7FA6'; g.fillRect(0, 300, 520, 40); } }
  if (kind === 'town' || kind === 'end') { [[20, 180, 110, 160], [150, 150, 120, 190], [290, 190, 100, 150], [400, 160, 110, 180]].forEach(([x, y, w, h], i) => { g.beginPath(); g.rect(x, y, w, h); fillS(g, ['#B98A5A', '#C9A47A', '#A8784A', '#B9906A'][i]); g.beginPath(); g.moveTo(x - 8, y); g.lineTo(x + w / 2, y - 50); g.lineTo(x + w + 8, y); g.closePath(); fillS(g, '#6B4524'); for (let k = 0; k < 2; k++) { g.beginPath(); g.rect(x + 16 + k * (w - 52), y + 30, 20, 26); fillS(g, '#F2D27A', 2); } }); }
  return c; }

/* ---------- state ---------- */
const NAMES = ['Sarah', 'Thomas', 'Mary', 'John', 'Lucy'], ROLES = ['mother', 'father', 'girl', 'boy', 'girl'];
let S = null, GAMEREF = null;
const ITEMS = [ { k: 'oxen', n: 'Oxen', unit: 'yoke (2 oxen)', price: 40, step: 1, min: 0, max: 6, note: 'You need at least 2 yokes. More oxen = faster, safer travel.' },
  { k: 'food', n: 'Food', unit: '100 lb (flour, bacon, coffee)', price: 10, step: 1, min: 0, max: 20, note: 'Your family of five eats about 10 lb a day.' },
  { k: 'clothes', n: 'Clothing', unit: 'set', price: 10, step: 1, min: 0, max: 10, note: 'Warm clothes protect you in the mountains – and are good for trading.' },
  { k: 'parts', n: 'Spare parts', unit: 'wheel, axle or tongue', price: 10, step: 1, min: 0, max: 6, note: 'A broken wagon without spare parts costs you days.' } ];
function newGame(names) { S = { money: 500, cart: { oxen: 3, food: 12, clothes: 5, parts: 2 }, oxen: 0, food: 0, clothes: 0, parts: 0, day: 0, miles: 0, leg: 0, pace: 'steady', rations: 'filling', people: names.map((n, i) => ({ n, role: ROLES[i], hp: 100, ill: null, alive: true })), log: [], done: false }; }
const DATE0 = new Date(1848, 4, 1);
const dateStr = d => { const x = new Date(DATE0.getTime() + d * 864e5); return x.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); };
const alive = () => S.people.filter(p => p.alive);

/* ---------- DOM screens ---------- */
function titleInfo(scene) { K.show(`<div class="sheet"><div class="split"><div><div class="kick">Spring 1848 · Independence, Missouri</div><h2>Who is travelling?</h2>
  <p>You lead a family of five on the 2,000-mile journey to Oregon. Thousands of families made this journey for cheap land and a new life. Name your family:</p>
  <div class="fam">${NAMES.map((n, i) => `<input maxlength="12" value="${n}" data-i="${i}" aria-label="name ${i + 1}">`).join('')}</div>
  <div class="row"><button class="btn" id="go">To the general store</button></div></div>
  <div><img src="img/memorial.jpg" alt=""><div class="cap">“Covered Wagon”, a memorial to the Oregon Trail emigrants in Salem, Oregon. Photo: Carol M. Highsmith, Library of Congress, no known restrictions.</div></div></div></div>`);
  document.getElementById('go').onclick = () => { newGame([...K.ov().querySelectorAll('input')].map((x, i) => x.value.trim() || NAMES[i])); store(scene, 1, () => scene.scene.start('Trail')); }; }
function store(scene, mult, done, fort) {
  const cart = fort ? { oxen: 0, food: 0, clothes: 0, parts: 0 } : S.cart;
  const price = k => Math.round(ITEMS.find(i => i.k === k).price * mult);
  const total = () => ITEMS.reduce((n, i) => n + cart[i.k] * price(i.k), 0);
  const draw = () => { K.show(`<div class="sheet"><div class="kick">${fort ? fort + ' · trading post' : 'Independence · general store'}</div><h2>${fort ? 'Buy supplies' : 'Outfit your wagon'}</h2>
    ${fort ? '<p>Prices out here are much higher than in Missouri.</p>' : '<p>You have saved <b>$500</b>. Choose carefully – you cannot come back.</p>'}
    <div class="store">${ITEMS.map(i => `<div class="it"><div><b>${i.n}</b><small>$${price(i.k)} per ${i.unit} · ${i.note}</small></div><button data-k="${i.k}" data-d="-1">−</button><span class="n">${cart[i.k]}</span><button data-k="${i.k}" data-d="1">+</button></div>`).join('')}</div>
    <p class="money">Total: $${total()} · money: $${S.money}${fort ? ` · you have ${S.oxen} yokes, ${S.food * 100} lb food, ${S.clothes} clothes, ${S.parts} parts` : ''}</p>
    <div class="row"><button class="btn" id="buy" ${total() > S.money || (!fort && cart.oxen < 2) ? 'disabled style="opacity:.5"' : ''}>${fort ? 'Buy and continue' : 'Buy and set off'}</button>${fort ? '<button class="btn ghost" id="skip">Leave</button>' : ''}<span class="small">${!fort && cart.oxen < 2 ? 'You need at least 2 yokes of oxen.' : 'Game prices – simplified.'}</span></div></div>`);
    K.ov().querySelectorAll('.it button').forEach(b => b.onclick = () => { const it = ITEMS.find(i => i.k === b.dataset.k); cart[it.k] = Math.max(it.min, Math.min(it.max, cart[it.k] + +b.dataset.d)); SND.click(); draw(); });
    const buy = document.getElementById('buy'); if (buy) buy.onclick = () => { if (total() > S.money) return; S.money -= total(); ITEMS.forEach(i => S[i.k] += cart[i.k]); SND.coin(); K.hide(); done(); };
    const sk = document.getElementById('skip'); if (sk) sk.onclick = () => { K.hide(); done(); }; };
  draw(); }
function panel(kick, title, html, choices, cb) { K.show(`<div class="sheet"><div class="kick">${kick}</div><h2>${title}</h2>${html}<div class="choices">${choices.map((c, i) => `<button class="choice" data-i="${i}">${c[0]}${c[1] ? `<small>${c[1]}</small>` : ''}</button>`).join('')}</div></div>`);
  K.ov().querySelectorAll('.choice').forEach(b => b.onclick = () => { SND.click(); K.hide(); cb(+b.dataset.i); }); }

/* ---------- scenes ---------- */
class Boot extends Phaser.Scene { constructor() { super('Boot'); }
  create() { const T = (k, c) => this.textures.addCanvas(k, c);
    T('wagon', wagon()); T('wheelB', wheel(46)); T('wheelS', wheel(34)); T('ox0', ox(0)); T('ox1', ox(1)); this.anims.create({ key: 'oxw', frames: [{ key: 'ox0' }, { key: 'ox1' }], frameRate: 3, repeat: -1 });
    ['father', 'mother', 'girl', 'boy'].forEach(k => { T(k + '0', walker(k, 0)); T(k + '1', walker(k, 1)); this.anims.create({ key: 'w_' + k, frames: [{ key: k + '0' }, { key: k + '1' }], frameRate: 3, repeat: -1 }); });
    REG.forEach((r, i) => { T('far' + i, layer(r.deco === 'pines' || i === 2 ? 'mountains' : 'hills', r.far, 300, i)); T('mid' + i, layer('hills', r.mid, 220, i + 3)); T('deco' + i, deco(r.deco)); });
    ['rock', 'dome', 'fort', 'river', 'pass', 'forest', 'dalles', 'town', 'end'].forEach(k => T('lm_' + k, landmark(k)));
    const d = cv(24, 24), g = d.getContext('2d'); g.beginPath(); g.arc(12, 12, 9, 0, 7); g.fillStyle = 'rgba(200,180,140,.9)'; g.fill(); T('dust', d);
    K.fonts(['400 40px Rye', '400 20px "IM Fell English"', '700 20px Inter']).then(() => this.scene.start('Title')); } }

function sceneBg(scene, r) { const R = REG[r], c = cv(W, H), g = c.getContext('2d'); K.sky(g, R.sky[0], R.sky[1]); g.fillStyle = 'rgba(255,250,235,.5)'; for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(rnd(0, W), rnd(40, 240), rnd(70, 150), rnd(12, 24), 0, 0, 7); g.fill(); } return K.tex(scene, 'sky' + r, c); }

class Title extends Phaser.Scene { constructor() { super('Title'); }
  create() { GAMEREF = this.game; sceneBg(this, 1); this.add.image(0, 0, 'sky1').setOrigin(0).setTint(0xFFD2A0);
    this.add.tileSprite(0, 250, W, 300, 'far1').setOrigin(0); this.add.tileSprite(0, 420, W, 220, 'mid0').setOrigin(0); const gr = this.add.rectangle(0, 600, W, 120, 0xA8B862).setOrigin(0);
    const w = this.add.image(-260, 560, 'wagon').setScale(.8); const wh = [this.add.image(-330, 610, 'wheelB').setScale(.8), this.add.image(-190, 616, 'wheelS').setScale(.8)]; const o = this.add.sprite(-80, 585, 'ox0').play('oxw').setScale(.8);
    [w, ...wh, o].forEach(s => this.tweens.add({ targets: s, x: s.x + W + 600, duration: 22000, repeat: -1 })); this.events.on('update', () => wh.forEach(x => x.rotation += .03));
    this.add.text(W / 2, 92, 'AAA 4 · WESTWARD, 1848', { fontFamily: 'Inter, sans-serif', fontStyle: '800', fontSize: '20px', color: '#2A1C10' }).setOrigin(.5);
    this.add.text(W / 2, 178, 'The Oregon Trail', { fontFamily: 'Rye, serif', fontSize: '104px', color: '#F5E8C8', stroke: '#2A1C10', strokeThickness: 12, shadow: { offsetX: 4, offsetY: 6, color: 'rgba(0,0,0,.35)', blur: 2, fill: true } }).setOrigin(.5);
    this.add.text(W / 2, 266, '2,000 miles · one family · every decision counts', { fontFamily: '"IM Fell English", Georgia, serif', fontStyle: 'italic', fontSize: '30px', color: '#2A1C10' }).setOrigin(.5);
    K.button(this, W / 2 - 140, 370, 'START THE JOURNEY', () => { SND.init(); SND.startMusic([67, 0, 67, 69, 71, 0, 74, 71, 69, 0, 67, 64, 62, 0, 64, 67], 300, 'triangle'); titleInfo(this); }, 300, false, 0x8A2A1A);
    K.button(this, W / 2 + 180, 370, 'HOW TO PLAY', () => K.show(`<div class="sheet"><div class="kick">How to play</div><h2>The Oregon Trail</h2><p>Buy supplies in Independence, then travel west. The wagon moves on its own – you decide the <b>pace</b> and the <b>rations</b>, when to <b>rest</b>, how to cross rivers and what to trade. Watch your food, your oxen and your family's health.</p><p>At the trading posts a trader asks a <b>history question</b> – answer correctly and you get a discount. Reach Oregon City before the snow comes!</p><div class="row"><button class="btn" id="ok">Got it</button></div></div>`) || (document.getElementById('ok').onclick = K.hide), 240, true);
    K.corner(this, false); } }

class Trail extends Phaser.Scene { constructor() { super('Trail'); }
  create() { this.r = -1; this.paused = false; this.acc = 0;
    this.sky = this.add.image(0, 0, 'sky0').setOrigin(0); sceneBg(this, 0);
    this.far = this.add.tileSprite(0, 230, W, 300, 'far0').setOrigin(0); this.mid = this.add.tileSprite(0, 400, W, 220, 'mid0').setOrigin(0);
    this.lm = this.add.image(W + 400, 470, 'lm_rock').setOrigin(.5, 1).setVisible(false);
    this.ground = this.add.rectangle(0, 560, W, 160, 0xA8B862).setOrigin(0); this.ruts = this.add.graphics(); this.deco = this.add.tileSprite(0, 520, W, 120, 'deco0').setOrigin(0);
    this.dust = this.add.particles(0, 0, 'dust', { speed: { min: 10, max: 50 }, angle: { min: 160, max: 220 }, lifespan: 900, scale: { start: .5, end: 1.6 }, alpha: { start: .5, end: 0 }, emitting: false });
    const X = 560; this.wagon = this.add.image(X, 590, 'wagon').setScale(.9); this.wheels = [this.add.image(X - 78, 646, 'wheelB').setScale(.9), this.add.image(X + 76, 654, 'wheelS').setScale(.9)];
    this.oxen = [this.add.sprite(X + 230, 616, 'ox0').play('oxw').setScale(.85), this.add.sprite(X + 370, 618, 'ox1').play('oxw').setScale(.85)];
    this.walkers = S.people.map((p, i) => this.add.sprite(X - 220 - i * 56 + (i > 1 ? 40 : 0), 640 + (i % 2) * 10, p.role + '0').play('w_' + p.role).setScale(.95));
    this.bob = this.tweens.add({ targets: this.wagon, y: 594, duration: 300, yoyo: true, repeat: -1 });
    // HUD
    this.hud = this.add.graphics().setDepth(20); this.hudT = this.add.text(24, 16, '', { fontFamily: 'Rye, serif', fontSize: '24px', color: '#2A1C10' }).setDepth(21); this.hudS = this.add.text(24, 54, '', { fontFamily: 'Inter, sans-serif', fontStyle: '700', fontSize: '16px', color: '#2A1C10' }).setDepth(21);
    this.famT = this.add.text(W - 24, 16, '', { fontFamily: 'Inter, sans-serif', fontStyle: '700', fontSize: '15px', color: '#2A1C10', align: 'right', lineSpacing: 3 }).setOrigin(1, 0).setDepth(21);
    const bx = 24; this.paceB = K.chip(this, bx, H - 14, '', () => { S.pace = S.pace === 'steady' ? 'strenuous' : 'steady'; this.drawHud(); }, 0, 1); this.ratB = K.chip(this, bx + 220, H - 14, '', () => { S.rations = S.rations === 'filling' ? 'meager' : 'filling'; this.drawHud(); }, 0, 1);
    K.chip(this, bx + 440, H - 14, '⛺ rest a day', () => this.rest(), 0, 1); [this.paceB, this.ratB].forEach(b => b.setStyle({ backgroundColor: 'rgba(42,28,16,.75)' }));
    K.corner(this, true, ['☰ menu', () => { this.paused = true; K.show(`<div class="sheet"><div class="kick">Paused</div><h2>Rest by the trail</h2><div class="row"><button class="btn" id="res">Continue</button><button class="btn ghost" id="quit">Start again</button></div></div>`); document.getElementById('res').onclick = () => { K.hide(); this.paused = false; }; document.getElementById('quit').onclick = () => { K.hide(); this.scene.start('Title'); }; }]);
    this.setRegion(0); this.drawHud(); this.arrive(0); }
  setRegion(r) { if (r === this.r) return; this.r = r; this.sky.setTexture(sceneBg(this, r)); this.far.setTexture('far' + r); this.mid.setTexture('mid' + r); this.deco.setTexture('deco' + r); this.ground.setFillStyle(Phaser.Display.Color.HexStringToColor(REG[r].near).color);
    this.ruts.clear(); this.ruts.fillStyle(Phaser.Display.Color.HexStringToColor(shade(REG[r].near, .82)).color, 1); this.ruts.fillRect(0, 642, W, 26); this.ruts.fillStyle(Phaser.Display.Color.HexStringToColor(shade(REG[r].near, .75)).color, 1); this.ruts.fillRect(0, 650, W, 4); this.ruts.fillRect(0, 660, W, 4); }
  drawHud() { const g = this.hud; g.clear(); g.fillStyle(0xEAD9B5, .94); g.fillRect(0, 0, W, 92); g.lineStyle(3, 0x2A1C10, 1); g.lineBetween(0, 92, W, 92); g.lineStyle(1.5, 0x8A6A3A, 1); g.lineBetween(0, 86, W, 86);
    const next = LM[S.leg + 1]; this.hudT.setText(`${dateStr(S.day)}  ·  ${next ? Math.max(0, Math.round(next.mi - S.miles)) + ' miles to ' + next.n : 'Oregon!'}`);
    this.hudS.setText(`Food ${Math.round(S.food * 100)} lb   ·   Oxen ${S.oxen * 2}   ·   Clothes ${S.clothes}   ·   Parts ${S.parts}   ·   $${S.money}   ·   ${Math.round(S.miles)} of 1,930 miles`);
    this.famT.setText(S.people.map(p => `${p.n}: ${p.alive ? (p.ill ? p.ill + ' · ' : '') + (p.hp > 70 ? 'good' : p.hp > 40 ? 'fair' : p.hp > 15 ? 'poor' : 'very poor') : '✝'}`).join('\n'));
    this.paceB.setText('Pace: ' + S.pace); this.ratB.setText('Rations: ' + S.rations);
    this.walkers.forEach((w, i) => w.setVisible(S.people[i].alive)); this.oxen[1].setVisible(S.oxen > 1); this.oxen[0].setVisible(S.oxen > 0); }
  rest() { if (this.paused) return; this.paused = true; S.day++; S.food = Math.max(0, S.food - alive().length * (S.rations === 'filling' ? .02 : .012)); alive().forEach(p => { p.hp = Math.min(100, p.hp + 6); if (p.ill && Math.random() < .35) p.ill = null; }); this.drawHud(); this.say('A day of rest'); this.time.delayedCall(700, () => this.paused = false); }
  say(t) { const tx = this.add.text(W / 2, 170, t, { fontFamily: 'Rye, serif', fontSize: '46px', color: '#F5E8C8', stroke: '#2A1C10', strokeThickness: 9 }).setOrigin(.5).setDepth(30); this.tweens.add({ targets: tx, alpha: { from: 1, to: 0 }, y: 140, delay: 900, duration: 700, onComplete: () => tx.destroy() }); }
  update(time, delta) { if (this.paused || S.done) return; const dt = Math.min(.05, delta / 1000);
    const speed = (S.pace === 'steady' ? 1 : 1.35) * (S.oxen >= 3 ? 1 : S.oxen === 2 ? .85 : .55);
    this.far.tilePositionX += 8 * dt * speed; this.mid.tilePositionX += 30 * dt * speed; this.deco.tilePositionX += 90 * dt * speed; this.wheels.forEach(w => w.rotation += 2.4 * dt * speed); if (Math.random() < .3) this.dust.explode(1, 470, 660);
    if (this.lm.visible) this.lm.x -= 60 * dt * speed;
    this.acc += dt; if (this.acc >= .7) { this.acc = 0; this.dayTick(speed); } }
  dayTick(speed) { S.day++; const n = alive().length; const miles = (S.pace === 'steady' ? 15 : 20) * (S.oxen >= 3 ? 1 : S.oxen === 2 ? .85 : .55) * (S.food <= 0 ? .7 : 1);
    S.miles += miles; S.food = Math.max(0, S.food - n * (S.rations === 'filling' ? .02 : .012));
    const cold = S.day > 140 && S.leg >= 5 && S.clothes < n;
    alive().forEach(p => { p.hp += (S.rations === 'meager' ? -.6 : .3) + (S.pace === 'strenuous' ? -.8 : 0) + (S.food <= 0 ? -3 : 0) + (cold ? -1 : 0) + (p.ill ? -3.5 : 0); if (p.ill && Math.random() < .12) p.ill = null; p.hp = Math.min(100, p.hp); if (p.hp <= 0) this.death(p); });
    if (!alive().length) return this.over('Your whole family has died on the trail.');
    const next = LM[S.leg + 1];
    if (next && next.mi - S.miles < 260 && !this.lm.visible && next.kind !== 'end') { this.lm.setTexture('lm_' + next.kind).setVisible(true).setX(W + 300).setY(next.kind === 'river' ? 610 : 560).setScale(next.kind === 'river' ? 1.4 : 1).setAlpha(.95); }
    if (next && S.miles >= next.mi) { S.miles = next.mi; S.leg++; this.lm.setVisible(false); this.drawHud(); return this.arrive(S.leg); }
    if (Math.random() < .075) this.event(); this.drawHud(); }
  death(p) { p.alive = false; p.hp = 0; p.ill = p.ill || 'exhaustion'; this.paused = true; SND.lose(); this.drawHud();
    panel(dateStr(S.day), `${p.n} has died`, `<p>${p.n} has died of ${p.ill}. The family buries ${p.role === 'father' || p.role === 'boy' ? 'him' : 'her'} beside the trail and marks the grave with a wooden board.</p><div class="fact">Disease – above all cholera – was one of the greatest dangers on the overland trails. Thousands of graves lined the route.</div>`, [['Continue the journey']], () => this.paused = false); }
  event() { const r = REG[this.r], peoples = PEOPLES.filter(p => p.reg === this.r), roll = Math.random(); this.paused = true; const go = () => { this.paused = false; this.drawHud(); };
    const sick = () => { const v = pick(alive().filter(p => !p.ill)); if (!v) return go(); v.ill = this.r <= 1 ? pick(['cholera', 'dysentery', 'a fever']) : this.r <= 3 ? pick(['mountain fever', 'dysentery', 'a bad cough']) : pick(['a fever', 'a bad cough']); v.hp -= 10; SND.bad();
      panel(dateStr(S.day), `${v.n} is ill`, `<p>${v.n} has ${v.ill}. Rest and good food help people to recover.</p>`, [['Rest for two days', 'better chance to recover'], ['Keep going', 'you lose no time']], i => { if (i === 0) { S.day += 2; v.hp += 10; if (Math.random() < .6) v.ill = null; } go(); }); };
    if (roll < .17) return sick();
    if (roll < .29) { SND.hit(); if (S.parts > 0) return panel(dateStr(S.day), 'A broken wheel!', '<p>A wheel hits a rock and breaks. Luckily you have spare parts.</p>', [['Repair it (1 spare part)']], () => { S.parts--; go(); }); return panel(dateStr(S.day), 'A broken axle!', '<p>The axle breaks and you have no spare parts. You must cut a new one from a tree.</p>', [['Repair it (3 days)']], () => { S.day += 3; go(); }); }
    if (roll < .37) { SND.bad(); S.oxen = Math.max(0, S.oxen - .5); return panel(dateStr(S.day), 'An ox is lame', '<p>One of your oxen has hurt its leg and cannot pull any more.</p>', [['Leave it behind']], () => { if (S.oxen <= 0) return this.over('Without oxen, your wagon cannot go on.'); go(); }); }
    if (roll < .47) return panel(dateStr(S.day), r.deco === 'pines' ? 'Rain and mud' : 'A thunderstorm', '<p>A violent storm turns the trail into mud. You must wait.</p>', [['Wait it out (1 day)']], () => { S.day++; go(); });
    if (roll < .55) return panel(dateStr(S.day), 'Lost the trail', '<p>The tracks split and you take the wrong way.</p>', [['Find the way back (2 days)']], () => { S.day += 2; go(); });
    if (roll < .67) { const food = this.r <= 1 ? 'A herd of bison crosses the plain. Your hunters bring back meat.' : this.r === 4 ? 'You find wild berries and mushrooms in the forest.' : 'You catch fish in a creek.'; SND.good(); return panel(dateStr(S.day), 'Fresh food', `<p>${food}</p>`, [['+100 lb of food']], () => { S.food += 1; go(); }); }
    if (roll < .85 && peoples.length) { const P = pick(peoples); return panel(dateStr(S.day), `Meeting ${P.who}`, `<p>A group of ${P.who} rides up to the wagons and offers ${P.offer} in exchange for clothing.</p><div class="fact">${P.fact} Most meetings between emigrants and Native Americans on the trail were peaceful – trade was common.</div>`, [['Trade 1 set of clothing', '+150 lb of food'], ['Thank them politely and move on']], i => { if (i === 0 && S.clothes > 0) { S.clothes--; S.food += 1.5; SND.coin(); } go(); }); }
    return panel(dateStr(S.day), 'Another wagon train', '<p>You meet another family going west. They offer a spare part for some of your food.</p>', [['Trade 100 lb of food for a spare part'], ['No, thank you']], i => { if (i === 0 && S.food >= 1) { S.food -= 1; S.parts++; } go(); }); }
  arrive(i) { const L = LM[i]; this.paused = true; this.setRegion(L.reg); this.drawHud(); SND.horn();
    const cont = () => { this.paused = false; this.say('Westward!'); };
    const head = `<div class="fact">${L.fact}</div>`;
    if (L.kind === 'town' && i === 0) return panel('1 May 1848', 'Independence, Missouri', `<p>Your wagon is packed. Hundreds of wagons are leaving town this spring. Ahead of you: prairie, rivers, deserts and mountains.</p>${head}`, [['Head west!']], cont);
    if (L.kind === 'fort') return panel(dateStr(S.day), L.n, head, [['Visit the trading post', 'answer the trader\'s question for a discount'], ['Rest here for a day'], ['Continue']], c => {
      if (c === 0) return K.ask(K.question([1, 2]), { kick: 'The trader asks', okText: 'Right! You get half price today.', badText: 'Wrong – full price, I\'m afraid.', button: 'To the counter' }, ok => store(this, L.price * (ok ? .5 : 1), cont, L.n));
      if (c === 1) { S.day++; alive().forEach(p => { p.hp = Math.min(100, p.hp + 8); if (p.ill && Math.random() < .4) p.ill = null; }); } cont(); });
    if (L.kind === 'river') { const deep = L.depth; return panel(dateStr(S.day), L.n, `${head}<p>The river is about <b>${deep} feet</b> deep here today.</p>`, i === 1 ? [['Take the ferry', '$5 – safe'], ['Ford the river', 'free, but risky'], ['Caulk the wagon and float it', 'free, less risky']] : [['Ford the river', 'very risky'], ['Hire a Shoshone guide', '1 set of clothing – much safer'], ['Take the long dry route', 'safe, but 8 extra days']], c => this.cross(L, i, c, cont)); }
    if (L.kind === 'dalles') return panel(dateStr(S.day), L.n, head, [['Take the Barlow Road', 'slow mountain road, pay a toll ($10)'], ['Float down the Columbia on a raft', 'fast, but the rapids are dangerous']], c => { if (c === 0) { S.money = Math.max(0, S.money - 10); S.day += 10; if (S.day > 155 && S.clothes < alive().length) alive().forEach(p => p.hp -= 15); alive().forEach(p => { if (p.hp <= 0) this.death(p); }); cont(); } else { S.day += 4; if (Math.random() < .3) { const v = pick(alive()); S.food = Math.max(0, S.food - 2); SND.boom(); return panel(dateStr(S.day), 'Rapids!', `<p>The raft hits a rock in the rapids. You lose supplies${Math.random() < .35 ? ` – and ${v.n} is pulled out of the water, cold and exhausted.` : '.'}</p>`, [['Keep going']], () => { v.hp -= 25; if (v.hp <= 0) this.death(v); cont(); }); } cont(); } });
    if (L.kind === 'end') return this.win();
    return panel(dateStr(S.day), L.n, head + (L.n === 'Independence Rock' ? `<p>${S.day <= 64 ? 'You are here before 4 July – right on time!' : 'You are later than 4 July. Hurry, or the snow will catch you in the mountains!'}</p>` : ''), [['Continue']], cont); }
  cross(L, i, c, cont) { let risk = 0, cost = () => { };
    if (i === 1) { if (c === 0) { if (S.money >= 5) { S.money -= 5; risk = .03; } else risk = .3; } else risk = c === 1 ? .3 : .15; }
    else { if (c === 1) { if (S.clothes > 0) { S.clothes--; risk = .06; } else risk = .45; } else if (c === 2) { S.day += 8; risk = 0; } else risk = .45; }
    S.day++; if (Math.random() < risk) { SND.boom(); S.food = Math.max(0, S.food - rnd(1, 3)); let lostOx = false; if (Math.random() < .4 && S.oxen > 1) { S.oxen -= .5; lostOx = true; } const v = Math.random() < (i === 1 ? .1 : .2) ? pick(alive()) : null; if (v) v.hp -= 45;
      return panel(dateStr(S.day), 'The wagon tips over!', `<p>The current is too strong. You lose food${lostOx ? ' and an ox drowns' : ''}.${v ? ` ${v.n} is swept away and pulled out of the river half-drowned.` : ''}</p>`, [['Dry out and go on']], () => { if (v && v.hp <= 0) this.death(v); this.drawHud(); cont(); }); }
    SND.good(); panel(dateStr(S.day), 'Safe crossing', '<p>You reach the other bank safely.</p>', [['Continue']], () => { this.drawHud(); cont(); }); }
  over(msg) { S.done = true; SND.stopMusic(); SND.lose(); K.show(`<div class="sheet"><div class="kick">${dateStr(S.day)}</div><h2>The journey ends here</h2><p>${msg}</p><p>You travelled <b>${Math.round(S.miles)}</b> miles. Many real families also had to turn back or stopped on the way – the trail was hard and dangerous.</p><div class="row"><button class="btn" id="again">Try again</button></div></div>`); document.getElementById('again').onclick = () => { K.hide(); this.scene.start('Title'); }; }
  win() { S.done = true; SND.stopMusic(); SND.win(); const a = alive(), score = a.length * 400 + Math.round(S.food * 10) + S.money + Math.max(0, 200 - S.day) * 5;
    K.show(`<div class="sheet"><div class="split"><div><div class="kick">${dateStr(S.day)}</div><h2>You have reached Oregon!</h2><p>After <b>${S.day}</b> days and 1,930 miles your wagon rolls into the Willamette Valley. ${a.length === 5 ? 'Your whole family has made it.' : `${a.map(p => p.n).join(', ')} made it. You will never forget those you lost on the way.`}</p><p class="money">Score: ${score}</p>
      <div class="fact">Between the 1840s and the 1860s hundreds of thousands of people travelled west on the overland trails. For the Native nations whose lands they crossed, the great migration brought disease, the loss of the buffalo and, later, the loss of their land.</div>
      <div class="row"><button class="btn" id="again">Travel again</button></div></div><div><img src="img/memorial.jpg" alt=""><div class="cap">Oregon Trail memorial, Salem, Oregon. Photo: Carol M. Highsmith, Library of Congress.</div></div></div></div>`);
    document.getElementById('again').onclick = () => { K.hide(); this.scene.start('Title'); }; }
}

K.game([Boot, Title, Trail]);
})();
