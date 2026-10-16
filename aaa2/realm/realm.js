// Defend the Realm – AAA 2 game. All graphics are drawn in code; historical artworks are public domain.
// Runs fully in the browser; nothing is stored on a server or sent anywhere.
(function () {
'use strict';
const W = 1280, H = 720;
const OUT = '#2A2018';
const FIELD = { x: 190, y: 168, cw: 108, lh: 104, cols: 9, lanes: 5 };
const ov = document.getElementById('ov');
const QB = (window.AAA && window.AAA.units) || [];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\*(.+?)\*/g, '<i>$1</i>');
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const store = { get(k) { try { return JSON.parse(localStorage.getItem('realm.' + k)); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem('realm.' + k, JSON.stringify(v)); } catch (e) { } } };

/* ---------------- sound (synthesised, no files) ---------------- */
const SND = {
  ctx: null, on: store.get('sound') !== false, music: null,
  init() { if (this.ctx) return; try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); this.master = this.ctx.createGain(); this.master.gain.value = this.on ? .5 : 0; this.master.connect(this.ctx.destination); } catch (e) { } },
  toggle() { this.on = !this.on; store.set('sound', this.on); if (this.master) this.master.gain.value = this.on ? .5 : 0; return this.on; },
  tone(f, d, type = 'triangle', v = .2, t0 = 0, slide = 0) { if (!this.ctx) return; const c = this.ctx, t = c.currentTime + t0, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g); g.connect(this.master); o.start(t); o.stop(t + d + .05); },
  noise(d, v = .2, f = 1200, t0 = 0) { if (!this.ctx) return; const c = this.ctx, t = c.currentTime + t0, b = c.createBuffer(1, Math.floor(c.sampleRate * d), c.sampleRate), x = b.getChannelData(0); for (let i = 0; i < x.length; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / x.length); const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); fl.type = 'lowpass'; fl.frequency.value = f; g.gain.value = v; s.buffer = b; s.connect(fl); fl.connect(g); g.connect(this.master); s.start(t); },
  arrow() { this.noise(.12, .12, 3000); }, hit() { this.tone(180, .08, 'square', .08, 0, -80); }, boom() { this.noise(.5, .5, 380); this.tone(70, .4, 'sine', .3, 0, -40); },
  coin() { this.tone(1320, .08, 'sine', .12); this.tone(1760, .12, 'sine', .1, .06); }, place() { this.tone(330, .1, 'triangle', .15); this.tone(495, .12, 'triangle', .12, .05); },
  horn() { [220, 277, 330].forEach((f, i) => this.tone(f, 1.1, 'sawtooth', .05, i * .02)); }, lose() { this.tone(330, .4, 'triangle', .2, 0, -120); this.tone(220, .6, 'triangle', .2, .35, -80); },
  win() { [392, 494, 587, 784].forEach((f, i) => this.tone(f, .5, 'triangle', .18, i * .16)); }, good() { this.tone(660, .12, 'triangle', .15); this.tone(880, .18, 'triangle', .15, .1); }, bad() { this.tone(200, .3, 'square', .08, 0, -60); },
  startMusic() { if (!this.ctx || this.music) return; const notes = [62, 65, 69, 67, 65, 64, 62, 57, 60, 62, 64, 65, 67, 65, 64, 60]; let i = 0; const f = m => 440 * Math.pow(2, (m - 69) / 12);
    this.music = setInterval(() => { if (!this.on) return; const n = notes[i % notes.length]; this.tone(f(n), .55, 'triangle', .045); if (i % 4 === 0) this.tone(f(n - 24), 1.6, 'sine', .04); i++; }, 380); },
  stopMusic() { clearInterval(this.music); this.music = null; }
};

/* ---------------- vector art ---------------- */
function cv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function stroke(g, w = 3) { g.lineWidth = w; g.strokeStyle = OUT; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
function fillS(g, c, w = 3) { g.fillStyle = c; g.fill(); stroke(g, w); }
function shade(hex, k) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, gg = n >> 8 & 255, b = n & 255; const f = v => Math.max(0, Math.min(255, Math.round(v * k))); return '#' + [f(r), f(gg), f(b)].map(v => v.toString(16).padStart(2, '0')).join(''); }

// A person seen from the side, facing left (enemy) or right (defender). o: {tunic, helm, shield, emblem, weapon, skin, beard, facing, frame, cape}
function person(o) {
  const c = cv(120, 130), g = c.getContext('2d'); g.translate(60, 0); if (o.facing === 'left') g.scale(-1, 1);
  const fr = o.frame || 0, sw = fr ? 7 : -7;
  // shadow
  g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(0, 122, 30, 6, 0, 0, Math.PI * 2); g.fill();
  // legs
  g.beginPath(); g.moveTo(-6, 88); g.lineTo(-6 - sw, 118); g.lineTo(2 - sw, 118); g.lineTo(2, 90); fillS(g, o.legs || '#5B4632');
  g.beginPath(); g.moveTo(4, 88); g.lineTo(4 + sw, 118); g.lineTo(12 + sw, 118); g.lineTo(12, 90); fillS(g, shade(o.legs || '#5B4632', .85));
  // cape
  if (o.cape) { g.beginPath(); g.moveTo(-10, 46); g.quadraticCurveTo(-30, 80, -22, 100); g.lineTo(4, 96); g.lineTo(6, 48); fillS(g, o.cape); }
  // body
  g.beginPath(); g.moveTo(-14, 46); g.lineTo(16, 46); g.lineTo(20, 94); g.lineTo(-18, 94); g.closePath(); fillS(g, o.tunic);
  if (o.mail) { g.save(); g.clip(); g.strokeStyle = 'rgba(40,40,50,.35)'; g.lineWidth = 1.5; for (let y = 50; y < 94; y += 5) { g.beginPath(); for (let x = -20; x < 22; x += 5) g.arc(x + (y % 10 ? 2.5 : 0), y, 2.5, 0, Math.PI); g.stroke(); } g.restore(); }
  g.beginPath(); g.moveTo(-17, 78); g.lineTo(19, 78); stroke(g, 5); g.strokeStyle = '#7A5A2E'; g.lineWidth = 3; g.stroke();
  // back arm
  g.beginPath(); g.moveTo(-8, 52); g.lineTo(-16, 74); stroke(g, 9); g.strokeStyle = shade(o.tunic, .8); g.lineWidth = 5; g.stroke();
  // head
  g.beginPath(); g.arc(2, 32, 14, 0, Math.PI * 2); fillS(g, o.skin || '#E9B98F');
  if (o.beard) { g.beginPath(); g.moveTo(-6, 38); g.quadraticCurveTo(8, 56, 16, 36); g.quadraticCurveTo(8, 44, -6, 38); fillS(g, o.beard, 2); }
  g.fillStyle = OUT; g.beginPath(); g.arc(9, 30, 2, 0, Math.PI * 2); g.fill();
  // helmet
  if (o.helm === 'nasal' || o.helm === 'norman') { g.beginPath(); g.moveTo(-13, 30); g.quadraticCurveTo(2, o.helm === 'norman' ? 4 : 12, 16, 30); g.closePath(); fillS(g, '#A9AEB5'); g.beginPath(); g.moveTo(12, 28); g.lineTo(14, 40); stroke(g, 4); }
  else if (o.helm === 'round') { g.beginPath(); g.arc(2, 30, 15, Math.PI, 0); fillS(g, '#9CA3AB'); g.beginPath(); g.moveTo(-13, 30); g.lineTo(17, 30); stroke(g, 3); g.beginPath(); g.moveTo(10, 30); g.quadraticCurveTo(16, 34, 12, 38); stroke(g, 3); }
  else if (o.helm === 'cap') { g.beginPath(); g.arc(2, 28, 15, Math.PI * 1.05, -0.05); fillS(g, o.capc || '#5E7A3A'); }
  else if (o.helm === 'hair') { g.beginPath(); g.arc(0, 28, 15, Math.PI * .95, Math.PI * 1.95); fillS(g, o.hair || '#7A4A22'); }
  // weapon
  if (o.weapon === 'spear') { g.beginPath(); g.moveTo(-4, 112); g.lineTo(36, 8); stroke(g, 6); g.strokeStyle = '#8B6A3E'; g.lineWidth = 3; g.stroke(); g.beginPath(); g.moveTo(36, 8); g.lineTo(31, 22); g.lineTo(42, 18); g.closePath(); fillS(g, '#C9CDD2', 2); }
  if (o.weapon === 'axe') { g.beginPath(); g.moveTo(10, 96); g.lineTo(34, 30); stroke(g, 6); g.strokeStyle = '#8B6A3E'; g.lineWidth = 3; g.stroke(); g.beginPath(); g.moveTo(30, 34); g.quadraticCurveTo(52, 30, 50, 52); g.lineTo(28, 44); g.closePath(); fillS(g, '#C9CDD2', 2.5); }
  if (o.weapon === 'sword') { g.beginPath(); g.moveTo(18, 70); g.lineTo(46, 30); stroke(g, 5); g.strokeStyle = '#D5D9DE'; g.lineWidth = 3; g.stroke(); g.beginPath(); g.moveTo(14, 66); g.lineTo(24, 76); stroke(g, 4); }
  if (o.weapon === 'bow') { g.beginPath(); g.arc(14, 60, 34, -1.15, 1.15); stroke(g, 5); g.strokeStyle = '#8B5E2E'; g.lineWidth = 3; g.stroke(); g.beginPath(); g.moveTo(14 + 34 * Math.cos(-1.15), 60 + 34 * Math.sin(-1.15)); g.lineTo(fr ? 2 : 10, 60); g.lineTo(14 + 34 * Math.cos(1.15), 60 + 34 * Math.sin(1.15)); g.lineWidth = 1.5; g.strokeStyle = '#EEE'; g.stroke(); }
  // front arm
  g.beginPath(); g.moveTo(6, 52); g.lineTo(o.weapon === 'bow' ? 26 : 18, o.weapon === 'bow' ? 60 : 72); stroke(g, 9); g.strokeStyle = shade(o.tunic, .92); g.lineWidth = 5; g.stroke();
  // shield
  if (o.shield === 'round') { g.beginPath(); g.arc(-12, 70, 20, 0, Math.PI * 2); fillS(g, o.emblem || '#B33A2E'); g.beginPath(); g.arc(-12, 70, 20, 0, Math.PI * 2); g.save(); g.clip(); g.fillStyle = o.emblem2 || '#E8D8A8'; g.fillRect(-14, 48, 4, 44); g.fillRect(-34, 68, 44, 4); g.restore(); g.beginPath(); g.arc(-12, 70, 5, 0, Math.PI * 2); fillS(g, '#9CA3AB', 2); }
  if (o.shield === 'kite') { g.beginPath(); g.moveTo(-30, 52); g.quadraticCurveTo(-12, 44, 6, 52); g.quadraticCurveTo(4, 86, -12, 108); g.quadraticCurveTo(-28, 86, -30, 52); fillS(g, o.emblem || '#2E4D8B'); g.beginPath(); g.moveTo(-12, 52); g.lineTo(-12, 100); g.moveTo(-26, 64); g.lineTo(2, 64); g.lineWidth = 4; g.strokeStyle = o.emblem2 || '#E3C25A'; g.stroke(); }
  return c;
}
function ship(o) { // o: {sail, cross, hull, fire, small, flip}
  const w = o.small ? 150 : 190, c = cv(w, 170), g = c.getContext('2d'); if (o.flip) { g.translate(w, 0); g.scale(-1, 1); }
  const k = o.small ? .78 : 1, hb = 128;
  g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(w / 2, hb + 14, 80 * k, 8, 0, 0, Math.PI * 2); g.fill();
  // hull
  g.beginPath(); g.moveTo(10, hb - 40 * k); g.lineTo(w - 22, hb - 34 * k); g.quadraticCurveTo(w - 4, hb - 36 * k, w - 6, hb - 54 * k); g.lineTo(w - 30, hb - 6); g.quadraticCurveTo(w / 2, hb + 10, 26, hb - 4); g.closePath(); fillS(g, o.hull || '#7B4A27');
  g.beginPath(); g.moveTo(16, hb - 26 * k); g.lineTo(w - 26, hb - 22 * k); g.lineWidth = 3; g.strokeStyle = '#E3C25A'; g.stroke();
  for (let x = 34; x < w - 40; x += 26) { g.beginPath(); g.rect(x, hb - 20 * k, 9, 7); g.fillStyle = OUT; g.fill(); }
  // castle (stern)
  g.beginPath(); g.rect(6, hb - 64 * k, 38 * k, 26 * k); fillS(g, shade(o.hull || '#7B4A27', 1.15));
  // masts
  const mx = [w * .38, w * .66];
  mx.forEach((x, i) => { g.beginPath(); g.moveTo(x, hb - 36); g.lineTo(x, 12 + i * 10); stroke(g, 5); g.strokeStyle = '#6B4524'; g.lineWidth = 3; g.stroke();
    const sy = 22 + i * 10, sh = (o.small ? 52 : 70) - i * 6, sw2 = (o.small ? 26 : 34);
    g.beginPath(); g.moveTo(x - sw2, sy); g.quadraticCurveTo(x - 4, sy + sh / 2, x - sw2 + 4, sy + sh); g.lineTo(x + sw2 - 4, sy + sh); g.quadraticCurveTo(x + 8, sy + sh / 2, x + sw2, sy); g.closePath(); fillS(g, o.sail || '#F2EAD3');
    if (o.cross === 'george') { g.save(); g.clip(); g.fillStyle = '#C0262D'; g.fillRect(x - 5, sy, 10, sh); g.fillRect(x - sw2, sy + sh / 2 - 5, sw2 * 2, 10); g.restore(); }
    if (o.cross === 'burgundy') { g.save(); g.clip(); g.strokeStyle = '#B5202A'; g.lineWidth = 7; g.beginPath(); g.moveTo(x - sw2 + 6, sy + 6); g.lineTo(x + sw2 - 6, sy + sh - 6); g.moveTo(x + sw2 - 6, sy + 6); g.lineTo(x - sw2 + 6, sy + sh - 6); g.stroke(); g.restore(); }
    g.beginPath(); g.moveTo(x, 12 + i * 10); g.lineTo(x + 16, 16 + i * 10); g.lineTo(x, 20 + i * 10); fillS(g, o.cross === 'burgundy' ? '#E3C25A' : '#C0262D', 2); });
  if (o.fire) { for (let i = 0; i < 9; i++) { const x = 30 + i * 15, y = hb - 50 + Math.sin(i) * 8; g.beginPath(); g.moveTo(x - 10, y + 20); g.quadraticCurveTo(x - 6, y - 14 - i % 3 * 8, x, y - 26 - i % 2 * 10); g.quadraticCurveTo(x + 6, y - 10, x + 10, y + 20); g.closePath(); g.fillStyle = i % 2 ? '#F2A33A' : '#E5532E'; g.fill(); } }
  return c;
}
function longship(fr) {
  const c = cv(200, 140), g = c.getContext('2d'); g.translate(200, 0); g.scale(-1, 1);
  g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(100, 120, 90, 8, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(8, 60); g.quadraticCurveTo(30, 112, 100, 112); g.quadraticCurveTo(170, 112, 192, 60); g.quadraticCurveTo(178, 96, 100, 96); g.quadraticCurveTo(22, 96, 8, 60); fillS(g, '#8A5A30');
  g.beginPath(); g.moveTo(192, 60); g.quadraticCurveTo(198, 40, 186, 34); stroke(g, 5); g.beginPath(); g.arc(184, 36, 6, 0, Math.PI * 2); fillS(g, '#8A5A30', 3);
  for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(42 + i * 24, 92, 10, 0, Math.PI * 2); fillS(g, i % 2 ? '#C9A43A' : '#A8322A', 2.5); }
  g.beginPath(); g.moveTo(100, 94); g.lineTo(100, 8); stroke(g, 5);
  g.beginPath(); g.moveTo(58, 16); g.quadraticCurveTo(100, 30 + fr * 4, 142, 16); g.lineTo(138, 74); g.quadraticCurveTo(100, 82, 62, 74); g.closePath(); fillS(g, '#E8DCC0');
  g.save(); g.clip(); g.fillStyle = '#A8322A'; for (let x = 60; x < 142; x += 22) g.fillRect(x, 10, 11, 80); g.restore(); g.beginPath(); g.moveTo(58, 16); g.quadraticCurveTo(100, 30 + fr * 4, 142, 16); g.lineTo(138, 74); g.quadraticCurveTo(100, 82, 62, 74); g.closePath(); stroke(g, 3);
  for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(50 + i * 26, 100); g.lineTo(40 + i * 26 + (fr ? 10 : -6), 126); stroke(g, 4); }
  return c;
}
function building(kind) {
  const c = cv(120, 130), g = c.getContext('2d');
  g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(60, 120, 46, 7, 0, 0, Math.PI * 2); g.fill();
  if (kind === 'village') { g.beginPath(); g.rect(24, 64, 72, 52); fillS(g, '#D9C49A'); g.save(); g.clip(); g.strokeStyle = '#7A5A2E'; g.lineWidth = 4; [[24, 64, 96, 116], [96, 64, 24, 116]].forEach(l => { g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[2], l[3]); g.stroke(); }); g.restore(); g.beginPath(); g.moveTo(14, 70); g.lineTo(60, 26); g.lineTo(106, 70); g.closePath(); fillS(g, '#C99A3E'); g.save(); g.clip(); g.strokeStyle = 'rgba(90,60,20,.45)'; g.lineWidth = 2; for (let y = 34; y < 70; y += 7) { g.beginPath(); g.moveTo(0, y); g.lineTo(120, y); g.stroke(); } g.restore(); g.beginPath(); g.moveTo(14, 70); g.lineTo(60, 26); g.lineTo(106, 70); g.closePath(); stroke(g); g.beginPath(); g.rect(50, 86, 20, 30); fillS(g, '#6B4524'); g.beginPath(); g.arc(85, 30, 4, 0, 7); g.fillStyle = '#999'; g.fill(); }
  if (kind === 'port') { g.beginPath(); g.rect(14, 92, 92, 18); fillS(g, '#8A6A40'); for (let x = 20; x < 106; x += 18) { g.beginPath(); g.rect(x, 108, 6, 14); fillS(g, '#6B4524', 2); } g.beginPath(); g.rect(30, 50, 56, 42); fillS(g, '#E7DCC3'); g.beginPath(); g.moveTo(24, 54); g.lineTo(58, 26); g.lineTo(92, 54); g.closePath(); fillS(g, '#A8322A'); g.beginPath(); g.rect(52, 66, 14, 26); fillS(g, '#6B4524'); g.beginPath(); g.arc(18, 86, 9, 0, 7); fillS(g, '#8B5E2E', 2); g.beginPath(); g.arc(104, 86, 9, 0, 7); fillS(g, '#8B5E2E', 2); }
  if (kind === 'burh') { g.beginPath(); g.moveTo(8, 118); g.quadraticCurveTo(60, 90, 112, 118); fillS(g, '#7A6A3A'); for (let i = 0; i < 8; i++) { const x = 16 + i * 12; g.beginPath(); g.moveTo(x, 104); g.lineTo(x, 36 + (i % 2) * 6); g.lineTo(x + 5, 28 + (i % 2) * 6); g.lineTo(x + 10, 36 + (i % 2) * 6); g.lineTo(x + 10, 104); g.closePath(); fillS(g, i % 2 ? '#9A6B3A' : '#B07A44', 2.5); } g.beginPath(); g.moveTo(14, 60); g.lineTo(108, 60); stroke(g, 4); }
  if (kind === 'wall') { for (let r = 0; r < 4; r++) for (let i = 0; i < 4; i++) { g.beginPath(); g.rect(14 + i * 23 - (r % 2) * 11, 44 + r * 18, 23, 18); fillS(g, ['#A39A8C', '#958C7E', '#B0A898'][(i + r) % 3], 2.5); } g.beginPath(); g.rect(3, 44, 14, 72); fillS(g, '#A39A8C', 2.5); g.beginPath(); g.rect(103, 44, 14, 72); fillS(g, '#A39A8C', 2.5); for (let i = 0; i < 5; i++) { g.beginPath(); g.rect(6 + i * 23, 28, 14, 16); fillS(g, '#B0A898', 2.5); } }
  if (kind === 'shieldwall') { for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(32 + i * 28, 78 - (i % 2) * 6, 26, 0, Math.PI * 2); fillS(g, ['#A8322A', '#C9A43A', '#3E6B3A'][i]); g.beginPath(); g.arc(32 + i * 28, 78 - (i % 2) * 6, 6, 0, 7); fillS(g, '#9CA3AB', 2); } for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(26 + i * 30, 50); g.lineTo(44 + i * 30, 2); stroke(g, 4); g.strokeStyle = '#8B6A3E'; g.lineWidth = 2; g.stroke(); } }
  if (kind === 'cannon') { g.beginPath(); g.moveTo(6, 118); g.quadraticCurveTo(14, 70, 40, 66); g.lineTo(90, 66); g.quadraticCurveTo(112, 70, 114, 118); fillS(g, '#8F7A4E'); for (let i = 0; i < 3; i++) { g.beginPath(); g.rect(12 + i * 36, 52, 26, 20); fillS(g, '#A6905E', 2.5); } g.beginPath(); g.moveTo(40, 56); g.lineTo(108, 46); g.lineTo(110, 60); g.lineTo(42, 72); g.closePath(); fillS(g, '#3B3B3E'); g.beginPath(); g.arc(50, 76, 13, 0, 7); fillS(g, '#6B4524'); g.beginPath(); g.arc(50, 76, 4, 0, 7); fillS(g, '#3B3B3E', 2); }
  return c;
}
function icon(kind) { const c = cv(48, 48), g = c.getContext('2d');
  if (kind === 'coin') { g.beginPath(); g.arc(24, 24, 18, 0, 7); fillS(g, '#E3B444'); g.beginPath(); g.arc(24, 24, 11, 0, 7); g.lineWidth = 2; g.strokeStyle = '#9A7020'; g.stroke(); g.fillStyle = '#9A7020'; g.font = '800 15px Cinzel, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('£', 24, 25); }
  if (kind === 'heart') { g.beginPath(); g.moveTo(24, 40); g.bezierCurveTo(2, 26, 8, 6, 24, 16); g.bezierCurveTo(40, 6, 46, 26, 24, 40); fillS(g, '#C0262D'); }
  if (kind === 'arrow') { const c2 = cv(44, 10), h = c2.getContext('2d'); h.fillStyle = '#6B4524'; h.fillRect(4, 4, 32, 2.5); h.fillStyle = '#C9CDD2'; h.beginPath(); h.moveTo(44, 5); h.lineTo(34, 0); h.lineTo(34, 10); h.fill(); h.fillStyle = '#EEE'; h.fillRect(0, 2, 7, 6); return c2; }
  if (kind === 'ball') { g.beginPath(); g.arc(24, 24, 9, 0, 7); fillS(g, '#2E2E33', 2.5); }
  if (kind === 'spark') { g.beginPath(); g.arc(24, 24, 8, 0, 7); g.fillStyle = '#FFD27A'; g.fill(); }
  if (kind === 'smoke') { g.beginPath(); g.arc(24, 24, 14, 0, 7); g.fillStyle = 'rgba(210,205,195,.9)'; g.fill(); }
  if (kind === 'flame') { g.beginPath(); g.moveTo(24, 4); g.quadraticCurveTo(40, 26, 30, 42); g.quadraticCurveTo(24, 46, 18, 42); g.quadraticCurveTo(8, 26, 24, 4); g.fillStyle = '#F28A2E'; g.fill(); }
  return c; }


function bakeSky(g, top, bottom) { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, top); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
function bakeHills(g, y, col, amp, seed) { g.fillStyle = col; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 16) g.lineTo(x, y + Math.sin(x / 140 + seed) * amp + Math.sin(x / 47 + seed * 2) * amp * .3); g.lineTo(W, H); g.closePath(); g.fill(); }
function bakeCastle(g, x, y, s, col) { g.fillStyle = col; const r = (a, b, c, d) => g.fillRect(x + a * s, y - b * s - d * s, c * s, d * s);
  r(0, 0, 60, 70); r(-12, 0, 22, 120); r(50, 0, 22, 120); r(18, 0, 24, 160); for (let i = 0; i < 4; i++) { r(-12 + i * 6, 120, 4, 10); r(50 + i * 6, 120, 4, 10); r(18 + i * 6.5, 160, 4, 12); } }
function titleBg() { const c = cv(W, H), g = c.getContext('2d'); bakeSky(g, '#2B2440', '#E8945A'); g.fillStyle = 'rgba(246,196,106,.9)'; g.beginPath(); g.arc(940, 462, 90, 0, 7); g.fill(); bakeHills(g, 520, '#5A4A5E', 30, 1); bakeCastle(g, 860, 560, 1.4, '#2E2436'); bakeHills(g, 590, '#3E3446', 24, 3); bakeHills(g, 650, '#231C28', 16, 5); return c; }
function fieldBg(L) { const F = FIELD, c = cv(W, H), g = c.getContext('2d');
  if (L.land) { bakeSky(g, '#8FB4D6', '#E9D9B6'); bakeHills(g, 128, '#7C9A6A', 14, 2);
    for (let r = 0; r < F.lanes; r++) for (let k = 0; k < F.cols + 2; k++) { g.fillStyle = ((r + k) % 2) ? '#7FA35C' : '#89AD64'; g.fillRect(F.x + k * F.cw, F.y + r * F.lh, F.cw, F.lh); }
    g.fillStyle = '#5E7E45'; g.fillRect(0, F.y, F.x, F.lanes * F.lh); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(F.x, F.y, 8, F.lanes * F.lh);
    g.strokeStyle = 'rgba(94,130,64,.6)'; g.lineWidth = 2; for (let i = 0; i < 220; i++) { const x = rnd(F.x, W), y = rnd(F.y + 6, F.y + F.lanes * F.lh); g.beginPath(); g.moveTo(x, y); g.lineTo(x - 3, y - 7); g.moveTo(x, y); g.lineTo(x + 3, y - 6); g.stroke(); }
    for (let i = 0; i < 26; i++) { const x = rnd(F.x + 20, W), y = rnd(F.y + 10, F.y + F.lanes * F.lh - 10); g.fillStyle = pick(['#F3E6C8', '#E3B444', '#C9A0D8']); g.beginPath(); g.arc(x, y, 2.6, 0, 7); g.fill(); }
    for (let r = 0; r < F.lanes; r++) { const y = F.y + r * F.lh + F.lh / 2; for (let i = 0; i < 4; i++) { const xx = 40 + i * 26, yy = y - 40 + (i % 2) * 4; g.beginPath(); g.moveTo(xx, yy + 70); g.lineTo(xx, yy + 8); g.lineTo(xx + 9, yy); g.lineTo(xx + 18, yy + 8); g.lineTo(xx + 18, yy + 70); g.closePath(); g.fillStyle = i % 2 ? '#9A6B3A' : '#B07A44'; g.fill(); stroke(g, 3); } }
  } else { bakeSky(g, '#7FA6C9', '#DCE6EA'); for (let r = 0; r < F.lanes; r++) { g.fillStyle = r % 2 ? '#3E7398' : '#467CA2'; g.fillRect(F.x - 20, F.y + r * F.lh, W, F.lh); }
    g.fillStyle = '#EDE8DA'; g.beginPath(); g.moveTo(0, F.y - 20); for (let y = F.y - 20; y <= H; y += 24) g.lineTo(150 + Math.sin(y / 30) * 14, y); g.lineTo(0, H); g.closePath(); g.fill(); stroke(g, 3); g.fillStyle = '#6E9A4E'; g.fillRect(0, F.y - 30, 165, 16); g.strokeRect(0, F.y - 30, 165, 16);
    g.strokeStyle = 'rgba(160,150,130,.55)'; g.lineWidth = 2; for (let y = F.y; y < H; y += 18) { g.beginPath(); g.moveTo(10, y); g.lineTo(120 + Math.sin(y / 30) * 12, y + 6); g.stroke(); }
    for (let r = 0; r < F.lanes; r++) { const y = F.y + r * F.lh + F.lh / 2; g.beginPath(); g.arc(70, y + 6, 30, Math.PI, 0); g.lineTo(100, y + 36); g.lineTo(40, y + 36); g.closePath(); g.fillStyle = '#B9AE96'; g.fill(); stroke(g, 3);
      for (let i = 0; i < 4; i++) { g.beginPath(); g.rect(42 + i * 15, y - 30, 10, 10); g.fillStyle = '#B9AE96'; g.fill(); stroke(g, 2); }
      g.beginPath(); g.rect(64, y + 14, 12, 22); g.fillStyle = '#5A3A22'; g.fill(); stroke(g, 2); g.beginPath(); g.moveTo(70, y - 30); g.lineTo(70, y - 58); stroke(g, 3); g.beginPath(); g.moveTo(70, y - 58); g.lineTo(92, y - 52); g.lineTo(70, y - 46); g.closePath(); g.fillStyle = '#FFFFFF'; g.fill(); stroke(g, 2); g.fillStyle = '#C0262D'; g.fillRect(77, y - 57, 4, 10); g.fillRect(72, y - 54, 16, 4); } }
  return c; }
function waveIcon() { const c = cv(40, 16), g = c.getContext('2d'); g.strokeStyle = 'rgba(191,217,234,.8)'; g.lineWidth = 3; g.beginPath(); g.arc(20, 18, 14, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); return c; }

/* ---------------- game data ---------------- */
const UNITS = {
  // defenders
  village: { name: 'Village', cost: 50, hp: 260, art: 'village', gold: 25, every: 9, note: 'Farms and villages pay taxes: +£25 every few seconds.' },
  archer: { name: 'Archer', cost: 100, hp: 200, art: 'archer', shoot: { dmg: 26, every: 1.3, proj: 'arrow', speed: 520 }, note: 'Shoots arrows along its lane.' },
  fyrd: { name: 'Fyrd spearman', cost: 75, hp: 520, art: 'fyrd', melee: { dps: 28 }, note: 'The fyrd was the army of free men called up to defend their area. Blocks and fights.' },
  burh: { name: 'Burh', cost: 125, hp: 1700, art: 'burh', note: 'Alfred the Great built a network of fortified towns called burhs. Very strong wall.' },
  housecarl: { name: 'Housecarl', cost: 150, hp: 620, art: 'housecarl', melee: { dps: 48 }, note: 'Harold\'s professional bodyguards, famous for their two-handed axes.' },
  shieldwall: { name: 'Shield wall', cost: 125, hp: 1500, art: 'shieldwall', note: 'At Hastings the English fought in a tight shield wall on top of a hill.' },
  port: { name: 'Port', cost: 50, hp: 300, art: 'port', gold: 25, every: 9, note: 'Trade brings money: +£25 every few seconds.' },
  cannon: { name: 'Coastal gun', cost: 125, hp: 360, art: 'cannon', shoot: { dmg: 80, every: 2.4, proj: 'ball', speed: 600 }, note: 'Heavy guns fire cannonballs along the lane.' },
  galleon: { name: 'English galleon', cost: 175, hp: 700, art: 'galleonE', shoot: { dmg: 42, every: 1.5, proj: 'ball', speed: 560 }, note: 'Fast “race-built” English galleons with long-range guns.' },
  fireship: { name: 'Fireship', cost: 150, hp: 99999, art: 'fireship', fire: { dmg: 420, radius: 150 }, note: 'Sails at the enemy and explodes. The English used fireships at Calais in 1588.' },
  // enemies
  raider: { name: 'Viking raider', hp: 190, speed: 24, dps: 22, art: 'raider', reward: 10 },
  berserker: { name: 'Berserker', hp: 280, speed: 42, dps: 34, art: 'berserker', reward: 15 },
  longship: { name: 'Longship crew', hp: 720, speed: 15, dps: 26, art: 'longship', reward: 30, big: true },
  normanFoot: { name: 'Norman soldier', hp: 220, speed: 24, dps: 24, art: 'normanFoot', reward: 10 },
  knight: { name: 'Mounted knight', hp: 460, speed: 50, dps: 40, art: 'knight', reward: 20 },
  crossbow: { name: 'Norman archer', hp: 160, speed: 26, dps: 16, art: 'normanArcher', reward: 12 },
  pinnace: { name: 'Spanish pinnace', hp: 230, speed: 42, dps: 22, art: 'pinnace', reward: 12, ship: true },
  galleonS: { name: 'Spanish galleon', hp: 950, speed: 14, dps: 34, art: 'galleonS', reward: 30, ship: true, big: true },
  galleass: { name: 'Galleass', hp: 560, speed: 24, dps: 30, art: 'galleass', reward: 20, ship: true }
};
const LEVELS = [
  { id: 'vikings', title: 'The Viking Raids', years: '793–878', img: 'img/lindisfarne.jpg', cap: 'A page of the Lindisfarne Gospels, made in the monastery of Lindisfarne around 700. Public domain, via Wikimedia Commons.',
    intro: 'In 793 Viking raiders attacked the monastery of Lindisfarne off the coast of Northumbria. For the next hundred years Danish armies plundered England. You are a leader of Wessex. Protect your lands until help comes!',
    real: 'Alfred the Great defeated the Danish leader Guthrum at Edington in 878. England was divided: the Danes ruled the Danelaw in the north and east. To protect Wessex, Alfred built a network of fortified towns – the burhs.',
    land: true, units: [1, 2], defenders: ['village', 'archer', 'fyrd', 'burh'], enemies: [['raider', 'raider', 'raider'], ['raider', 'raider', 'berserker'], ['raider', 'berserker', 'longship'], ['berserker', 'raider', 'longship', 'raider'], ['berserker', 'longship', 'raider', 'berserker']] },
  { id: 'hastings', title: 'Hastings', years: '1066', img: 'img/bayeux.jpg', cap: 'The Bayeux Tapestry (11th century), scene 57: King Harold is killed. Photo: Myrabella, public domain, via Wikimedia Commons.',
    intro: 'October 1066. King Harold has just defeated a Norwegian army in the north. Now he has marched south to meet William of Normandy near Hastings. Hold the shield wall on the hill – can you change history?',
    real: 'On 14 October 1066 the English shield wall held for hours. The Normans pretended to flee, and some English soldiers ran after them down the hill. Harold was killed, and William was crowned King of England on Christmas Day 1066.',
    land: true, units: [2], defenders: ['village', 'archer', 'housecarl', 'shieldwall'], enemies: [['normanFoot', 'normanFoot', 'crossbow'], ['normanFoot', 'knight', 'crossbow'], ['knight', 'normanFoot', 'knight', 'crossbow'], ['knight', 'knight', 'normanFoot', 'crossbow'], ['knight', 'knight', 'knight', 'normanFoot', 'crossbow']] },
  { id: 'armada', title: 'The Spanish Armada', years: '1588', img: 'img/armada.jpg', cap: 'The “Armada Portrait” of Elizabeth I (c. 1588); behind the queen, the Spanish fleet is wrecked. Public domain, via Wikimedia Commons.',
    intro: '1588. King Philip II of Spain has sent a huge fleet – the Armada – to invade England and remove the Protestant Queen Elizabeth I. The ships are in the English Channel. Defend the coast!',
    real: 'English fireships scattered the Armada at Calais, and the English attacked it in the Battle of Gravelines. Storms then wrecked many Spanish ships on their way home around Scotland and Ireland. Elizabeth celebrated a great victory.',
    land: false, units: [4], defenders: ['port', 'cannon', 'galleon', 'fireship'], enemies: [['pinnace', 'pinnace', 'galleass'], ['pinnace', 'galleass', 'galleonS'], ['galleass', 'galleonS', 'pinnace', 'pinnace'], ['galleonS', 'galleass', 'galleonS', 'pinnace'], ['galleonS', 'galleonS', 'galleass', 'galleass', 'pinnace']] }
];

/* ---------------- overlay helpers ---------------- */
function show(html) { ov.innerHTML = html; ov.classList.add('on'); }
function hide() { ov.classList.remove('on'); ov.innerHTML = ''; }

/* ---------------- scenes ---------------- */
class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    const T = this.textures, add = (k, c) => T.addCanvas(k, c);
    const P = {
      archer: f => person({ tunic: '#4E7A3E', helm: 'cap', capc: '#3E5F2E', weapon: 'bow', facing: 'right', frame: f }),
      fyrd: f => person({ tunic: '#8C6A3E', helm: 'round', weapon: 'spear', shield: 'round', emblem: '#3E6B3A', emblem2: '#E8D8A8', facing: 'right', frame: f, beard: '#7A4A22' }),
      housecarl: f => person({ tunic: '#7E2430', helm: 'nasal', weapon: 'axe', facing: 'right', frame: f, mail: true, cape: '#3E2A50', beard: '#5A3A1A' }),
      raider: f => person({ tunic: '#6E5A8C', helm: 'round', weapon: 'axe', shield: 'round', emblem: '#C9A43A', emblem2: '#8E1F2C', facing: 'left', frame: f, beard: '#C08A3A' }),
      berserker: f => person({ tunic: '#5A3A2A', helm: 'hair', hair: '#C9822E', weapon: 'axe', facing: 'left', frame: f, beard: '#C9822E', cape: '#8C7A5A' }),
      normanFoot: f => person({ tunic: '#4A5E8C', helm: 'norman', weapon: 'spear', shield: 'kite', emblem: '#2E4D8B', facing: 'left', frame: f, mail: true }),
      normanArcher: f => person({ tunic: '#7A8C4A', helm: 'cap', capc: '#5A4A2A', weapon: 'bow', facing: 'left', frame: f })
    };
    Object.entries(P).forEach(([k, fn]) => { add(k + '0', fn(0)); add(k + '1', fn(1)); });
    // mounted knight
    [0, 1].forEach(f => { const c = cv(160, 140), g = c.getContext('2d'); g.translate(160, 0); g.scale(-1, 1);
      g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(80, 130, 58, 7, 0, 0, 7); g.fill();
      const l = f ? 10 : -10; [[46, l], [60, -l], [104, -l], [118, l]].forEach(([x, d]) => { g.beginPath(); g.moveTo(x, 92); g.lineTo(x + d, 128); stroke(g, 8); g.strokeStyle = '#6B4A30'; g.lineWidth = 5; g.stroke(); });
      g.beginPath(); g.ellipse(82, 88, 50, 22, 0, 0, 7); fillS(g, '#7B5434'); g.beginPath(); g.moveTo(124, 80); g.quadraticCurveTo(140, 54, 152, 58); g.quadraticCurveTo(156, 70, 140, 78); g.quadraticCurveTo(132, 92, 124, 96); fillS(g, '#7B5434');
      g.beginPath(); g.moveTo(40, 80); g.quadraticCurveTo(20, 86, 22, 110); stroke(g, 6);
      g.beginPath(); g.moveTo(40, 72); g.lineTo(122, 74); g.lineTo(118, 100); g.lineTo(44, 100); g.closePath(); fillS(g, '#2E4D8B'); g.fillStyle = '#E3C25A'; g.fillRect(72, 74, 8, 26);
      const rider = person({ tunic: '#4A5E8C', helm: 'norman', weapon: 'spear', shield: 'kite', emblem: '#8E1F2C', facing: 'right', mail: true }); g.drawImage(rider, 30, -40, 100, 108);
      add('knight' + f, c); });
    [0, 1].forEach(f => add('longship' + f, longship(f)));
    add('galleonE0', ship({ cross: 'george', hull: '#6E4424' })); add('galleonE1', ship({ cross: 'george', hull: '#6E4424' }));
    add('galleonS0', ship({ cross: 'burgundy', hull: '#5A3A22', flip: true })); add('galleonS1', ship({ cross: 'burgundy', hull: '#5A3A22', flip: true }));
    add('pinnace0', ship({ cross: 'burgundy', small: true, flip: true, hull: '#7B5434' })); add('pinnace1', ship({ cross: 'burgundy', small: true, flip: true, hull: '#7B5434' }));
    add('galleass0', ship({ cross: 'burgundy', small: true, flip: true, hull: '#8E1F2C', sail: '#E8D8A8' })); add('galleass1', ship({ cross: 'burgundy', small: true, flip: true, hull: '#8E1F2C', sail: '#E8D8A8' }));
    add('fireship0', ship({ small: true, fire: true, hull: '#4A3020', sail: '#CDBB98' })); add('fireship1', ship({ small: true, fire: true, hull: '#4A3020', sail: '#CDBB98' }));
    ['village', 'port', 'burh', 'wall', 'shieldwall', 'cannon'].forEach(k => { add(k + '0', building(k)); add(k + '1', building(k)); });
    ['coin', 'heart', 'arrow', 'ball', 'spark', 'smoke', 'flame'].forEach(k => add(k, icon(k)));
    Object.keys(P).concat(['knight', 'longship', 'galleonE', 'galleonS', 'pinnace', 'galleass', 'fireship']).forEach(k => this.anims.create({ key: 'a_' + k, frames: [{ key: k + '0' }, { key: k + '1' }], frameRate: k.startsWith('galle') || k === 'pinnace' || k === 'fireship' ? 1.5 : 4, repeat: -1 }));
    (document.fonts && document.fonts.load ? Promise.all([document.fonts.load('800 40px Cinzel'), document.fonts.load('700 20px Inter')]) : Promise.resolve()).catch(() => { }).then(() => this.scene.start('Title'));
  }
}

function sky(scene, top, bottom) { const g = scene.add.graphics(); for (let i = 0; i < 60; i++) { const c = Phaser.Display.Color.Interpolate.ColorWithColor(Phaser.Display.Color.HexStringToColor(top), Phaser.Display.Color.HexStringToColor(bottom), 59, i); g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1); g.fillRect(0, i * H / 60, W, H / 60 + 1); } return g; }
function hills(scene, y, col, amp, seed) { const g = scene.add.graphics(); g.fillStyle(col, 1); g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 20) g.lineTo(x, y + Math.sin(x / 140 + seed) * amp + Math.sin(x / 47 + seed * 2) * amp * .3); g.lineTo(W, H); g.closePath(); g.fillPath(); return g; }
function castleSil(scene, x, y, s, col) { const g = scene.add.graphics(); g.fillStyle(col, 1); const r = (a, b, c, d) => g.fillRect(x + a * s, y - b * s - d * s, c * s, d * s);
  r(0, 0, 60, 70); r(-12, 0, 22, 120); r(50, 0, 22, 120); r(18, 0, 24, 160); for (let i = 0; i < 4; i++) { r(-12 + i * 6, 120, 4, 10); r(50 + i * 6, 120, 4, 10); r(18 + i * 6.5, 160, 4, 12); } r(0, 70, 60, 6); return g; }

class Title extends Phaser.Scene {
  constructor() { super('Title'); }
  create() {
    if (!this.textures.exists('titlebg')) this.textures.addCanvas('titlebg', titleBg()); this.add.image(0, 0, 'titlebg').setOrigin(0);
    for (let i = 0; i < 3; i++) { const fx = 860 + [8, 92, 42][i] * 1.4, fy = 560 - [128, 128, 170][i] * 1.4 - 30; this.add.rectangle(fx, fy + 18, 3, 40, 0x231C28); const fl = this.add.triangle(fx + 16, fy, 0, 0, 34, 8, 0, 16, 0x8E1F2C).setOrigin(0, .5); this.tweens.add({ targets: fl, scaleX: .8, duration: 600 + i * 100, yoyo: true, repeat: -1, ease: 'Sine.inOut' }); }
    const em = this.add.particles(0, 0, 'spark', { x: { min: 0, max: W }, y: H + 10, speedY: { min: -40, max: -90 }, speedX: { min: -10, max: 10 }, lifespan: 9000, scale: { start: .35, end: 0 }, alpha: { start: .7, end: 0 }, frequency: 220, tint: 0xF6C46A });
    this.add.text(110, 150, 'AAA 2 · A GAME OF BRITISH HISTORY', { fontFamily: 'Inter', fontStyle: '800', fontSize: '20px', color: '#F3E6C8', letterSpacing: 4 }).setAlpha(.85);
    const t = this.add.text(104, 186, 'Defend\nthe Realm', { fontFamily: 'Cinzel', fontStyle: '800', fontSize: '104px', color: '#F3E6C8', stroke: '#2A2018', strokeThickness: 10, lineSpacing: -18, shadow: { offsetX: 0, offsetY: 6, color: '#000', blur: 14, fill: true } });
    this.add.text(112, 430, 'Vikings · Normans · the Spanish Armada', { fontFamily: '"Source Serif 4", Georgia, serif', fontStyle: 'italic', fontSize: '28px', color: '#F6D9A8' });
    const marchers = ['fyrd', 'archer', 'housecarl'].map((k, i) => this.add.sprite(-120 - i * 110, 640, k + '0').play('a_' + k).setScale(.9));
    marchers.forEach((m, i) => this.tweens.add({ targets: m, x: W + 200, duration: 26000, delay: i * 1200, repeat: -1 }));
    const b = button(this, 245, 535, 'PLAY', () => { SND.init(); SND.startMusic(); this.scene.start('Battle', { pick: true }); }, 260);
    button(this, 520, 535, 'HOW TO PLAY', () => howTo(), 260, true);
    soundBtn(this);
  }
}
function button(scene, x, y, label, fn, w = 220, ghost) {
  const c = scene.add.container(x, y); const g = scene.add.graphics();
  const draw = hov => { g.clear(); g.fillStyle(0x000000, .35); g.fillRoundedRect(-w / 2, -26 + 5, w, 56, 8); g.fillStyle(ghost ? 0xF3E6C8 : (hov ? 0xA82535 : 0x8E1F2C), 1); g.fillRoundedRect(-w / 2, -28, w, 56, 8); g.lineStyle(3, 0x2A2018, 1); g.strokeRoundedRect(-w / 2, -28, w, 56, 8); };
  draw(); const t = scene.add.text(0, 0, label, { fontFamily: 'Inter', fontStyle: '800', fontSize: '22px', color: ghost ? '#2A2018' : '#FFFFFF', letterSpacing: 2 }).setOrigin(.5);
  c.add([g, t]); c.setSize(w, 56).setInteractive({ useHandCursor: true }).on('pointerover', () => draw(1)).on('pointerout', () => draw(0)).on('pointerdown', () => { SND.init(); SND.place(); fn(); });
  return c;
}
function fullBtn(scene, bottom) { const sc = scene.scale; if (!sc.fullscreen.available) return null;
  const t = scene.add.text(bottom ? W - 290 : W - 170, bottom ? H - 12 : 22, '⛶ full screen', { fontFamily: 'Inter', fontStyle: '700', fontSize: '16px', color: '#F3E6C8', backgroundColor: 'rgba(0,0,0,.35)', padding: { x: 10, y: 6 } }).setOrigin(1, bottom ? 1 : 0).setInteractive({ useHandCursor: true }).setDepth(50);
  t.on('pointerup', (p, lx, ly, ev) => { if (ev) ev.stopPropagation(); if (sc.isFullscreen) sc.stopFullscreen(); else sc.startFullscreen(); }); return t; }
function soundBtn(scene, bottom) { fullBtn(scene, bottom); const t = scene.add.text(W - 24, bottom ? H - 12 : 22, SND.on ? '♪ sound on' : '♪ sound off', { fontFamily: 'Inter', fontStyle: '700', fontSize: '16px', color: '#F3E6C8', backgroundColor: 'rgba(0,0,0,.35)', padding: { x: 10, y: 6 } }).setOrigin(1, bottom ? 1 : 0).setInteractive({ useHandCursor: true }).setDepth(50);
  t.on('pointerdown', () => { SND.init(); t.setText(SND.toggle() ? '♪ sound on' : '♪ sound off'); }); return t; }
function howTo(done) {
  show(`<div class="sheet"><div class="kick">How to play</div><h2>Defend the Realm</h2>
  <p>Enemies march (or sail) from the right. Stop them before they reach your lands on the left. If <b>three</b> get through, you lose.</p>
  <p><b>1. Choose a defender</b> in the bar at the top, then <b>click a square</b> on the field to place it. Each defender costs money (£).</p>
  <p><b>2. Earn money:</b> you get a little money all the time, villages and ports pay taxes – and the <b>Royal Council</b> button asks you a history question. A correct answer brings <b>£75</b>!</p>
  <p><b>3. Survive five waves.</b> After the battle you learn what really happened.</p>
  <p class="small">Tip: build villages first, put archers at the back and strong walls at the front. To remove a defender, choose the spade and click it (you get half the money back).</p>
  <div class="row"><button class="btn" id="ok">Got it</button></div></div>`);
  document.getElementById('ok').onclick = () => { hide(); if (done) done(); };
}
function pickLevel(scene) {
  const done = store.get('done') || {};
  show(`<div class="sheet"><div class="kick">Choose a battle</div><h2>Britain under attack</h2>
  <div class="levels">${LEVELS.map((l, i) => `<button class="lv" data-i="${i}"><div class="pic" style="background-image:url('${l.img}')"></div><div class="tx"><b>${l.title}</b><span>${l.years}</span><br><em>${done[l.id] ? '★ defended' : ''}</em></div></button>`).join('')}</div>
  <div class="row"><button class="btn ghost" id="back">Back</button><span class="small">Pictures: public domain, via Wikimedia Commons.</span></div></div>`);
  ov.querySelectorAll('.lv').forEach(b => b.onclick = () => { const l = LEVELS[+b.dataset.i]; intro(l, () => { hide(); scene.startLevel(l); }); });
  document.getElementById('back').onclick = () => { hide(); scene.scene.start('Title'); };
}
function intro(l, go) {
  show(`<div class="sheet"><div class="split"><div><div class="kick">${l.years}</div><h2>${l.title}</h2><p>${l.intro}</p>
  <p class="small">Your defenders: ${l.defenders.map(d => `<b>${UNITS[d].name}</b> – ${UNITS[d].note}`).join('<br>')}</p>
  <div class="row"><button class="btn" id="go">To battle!</button></div></div>
  <div><img src="${l.img}" alt=""><div class="cap">${l.cap}</div></div></div></div>`);
  document.getElementById('go').onclick = go;
}

class Battle extends Phaser.Scene {
  constructor() { super('Battle'); }
  create(data) {
    this.cameras.main.setBackgroundColor('#1D1A16');
    if (data && data.pick) pickLevel(this);
    else if (data && data.level) this.startLevel(data.level);
  }
  startLevel(L) {
    this.children.removeAll(true); this.L = L; soundBtn(this, true); this.menuBtn();
    this.S = { gold: 150, lives: 3, wave: 0, waveT: 0, spawnQ: [], t: 0, trickle: 0, council: 0, over: false, paused: false, sel: null, tool: null, killed: 0 };
    this.grid = Array.from({ length: FIELD.lanes }, () => Array(FIELD.cols).fill(null));
    this.defs = []; this.foes = []; this.shots = [];
    this.drawField();
    this.drawHUD();
    this.fx = this.add.particles(0, 0, 'spark', { speed: { min: 60, max: 220 }, lifespan: 420, scale: { start: .5, end: 0 }, emitting: false, tint: [0xFFD27A, 0xF28A2E] }).setDepth(40);
    this.smoke = this.add.particles(0, 0, 'smoke', { speed: { min: 10, max: 60 }, lifespan: 900, scale: { start: .4, end: 1.2 }, alpha: { start: .6, end: 0 }, emitting: false }).setDepth(39);
    this.nextWave(1.5);
    this.input.on('pointermove', p => this.hover(p));
    this.input.on('pointerdown', p => this.click(p));
  }
  drawField() {
    const L = this.L, F = FIELD, key = 'bg_' + L.id;
    if (!this.textures.exists(key)) this.textures.addCanvas(key, fieldBg(L));
    this.add.image(0, 0, key).setOrigin(0).setDepth(-2);
    if (!L.land) { if (!this.textures.exists('wave')) this.textures.addCanvas('wave', waveIcon());
      for (let i = 0; i < 26; i++) { const x = rnd(F.x, W), y = rnd(F.y + 10, F.y + F.lanes * F.lh - 10), w = this.add.image(x, y, 'wave').setDepth(1); this.tweens.add({ targets: w, x: x - 30, alpha: { from: .9, to: .15 }, duration: rnd(2200, 3600), yoyo: true, repeat: -1 }); } }
    // lane frames + hover
    this.hoverG = this.add.graphics().setDepth(2);
    this.ghost = this.add.image(0, 0, 'coin').setAlpha(0).setDepth(3);
  }
  drawHUD() {
    const L = this.L, g = this.add.graphics().setDepth(30);
    g.fillStyle(0x2A2018, 1); g.fillRect(0, 0, W, 150); g.fillStyle(0xF3E6C8, 1); g.fillRoundedRect(8, 8, W - 16, 134, 8); g.lineStyle(3, 0xC9962E, 1); g.strokeRoundedRect(14, 14, W - 28, 122, 6);
    // gold
    this.add.image(54, 58, 'coin').setScale(1.2).setDepth(31);
    this.goldT = this.add.text(84, 38, '150', { fontFamily: 'Cinzel', fontStyle: '800', fontSize: '40px', color: '#2A2018' }).setDepth(31);
    this.add.text(34, 92, 'TREASURY', { fontFamily: 'Inter', fontStyle: '800', fontSize: '13px', color: '#8E1F2C', letterSpacing: 2 }).setDepth(31);
    // cards
    this.cards = L.defenders.map((k, i) => {
      const u = UNITS[k], x = 200 + i * 128, y = 22, c = this.add.container(x, y).setDepth(31), bg = this.add.graphics();
      const draw = s => { bg.clear(); bg.fillStyle(s ? 0xFFF6DA : 0xFBF0D2, 1); bg.fillRoundedRect(0, 0, 116, 108, 8); bg.lineStyle(s ? 5 : 3, s ? 0x8E1F2C : 0x2A2018, 1); bg.strokeRoundedRect(0, 0, 116, 108, 8); };
      draw(0); const im = this.add.image(58, 44, u.art + '0'); im.setScale(Math.min(76 / im.width, 72 / im.height));
      const name = this.add.text(58, 78, u.name, { fontFamily: 'Inter', fontStyle: '700', fontSize: '12px', color: '#2A2018', align: 'center', wordWrap: { width: 110 } }).setOrigin(.5, 0);
      const cost = this.add.text(8, 6, '£' + u.cost, { fontFamily: 'Inter', fontStyle: '800', fontSize: '14px', color: '#8E1F2C' });
      const dim = this.add.graphics(); c.add([bg, im, name, cost, dim]);
      this.hit(x, y, 116, 108, () => this.select(k));
      return { k, c, draw, dim, u };
    });
    // spade
    const sx = 200 + L.defenders.length * 128, sp = this.add.container(sx, 22).setDepth(31), sg = this.add.graphics();
    const sdraw = s => { sg.clear(); sg.fillStyle(0xFBF0D2, 1); sg.fillRoundedRect(0, 0, 80, 108, 8); sg.lineStyle(s ? 5 : 3, s ? 0x8E1F2C : 0x2A2018, 1); sg.strokeRoundedRect(0, 0, 80, 108, 8); sg.lineStyle(6, 0x6B4524, 1); sg.lineBetween(40, 22, 40, 64); sg.fillStyle(0x9CA3AB, 1); sg.fillRoundedRect(28, 60, 24, 26, 6); sg.lineStyle(3, 0x2A2018, 1); sg.strokeRoundedRect(28, 60, 24, 26, 6); };
    sdraw(0); sp.add([sg, this.add.text(40, 90, 'remove', { fontFamily: 'Inter', fontStyle: '700', fontSize: '12px', color: '#2A2018' }).setOrigin(.5, 0)]);
    this.hit(sx, 22, 80, 108, () => { this.S.tool = this.S.tool === 'spade' ? null : 'spade'; this.S.sel = null; SND.place(); this.refreshCards(); });
    this.spade = sdraw;
    // council button
    const cx = sx + 100, cb = this.add.container(cx, 22).setDepth(31), cg = this.add.graphics();
    this.cdraw = (ready) => { cg.clear(); cg.fillStyle(ready ? 0x8E1F2C : 0x9A8A70, 1); cg.fillRoundedRect(0, 0, 190, 108, 8); cg.lineStyle(3, 0x2A2018, 1); cg.strokeRoundedRect(0, 0, 190, 108, 8); };
    this.cdraw(true); this.councilT = this.add.text(95, 30, 'ROYAL\nCOUNCIL', { fontFamily: 'Cinzel', fontStyle: '800', fontSize: '22px', color: '#FFF', align: 'center', lineSpacing: -4 }).setOrigin(.5, 0);
    this.councilS = this.add.text(95, 84, 'answer: +£75', { fontFamily: 'Inter', fontStyle: '700', fontSize: '13px', color: '#F6D9A8' }).setOrigin(.5, 0);
    cb.add([cg, this.councilT, this.councilS]); this.hit(cx, 22, 190, 108, () => this.council());
    this.tweens.add({ targets: [this.councilT], scale: 1.06, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    // lives + wave
    const rx = W - 160;
    this.hearts = [0, 1, 2].map(i => this.add.image(rx + i * 40, 56, 'heart').setDepth(31));
    this.waveT = this.add.text(rx - 20, 88, 'Wave 1 / 5', { fontFamily: 'Inter', fontStyle: '800', fontSize: '15px', color: '#2A2018' }).setDepth(31);
    this.waveBar = this.add.graphics().setDepth(31);
    this.banner = this.add.text(W / 2, 400, '', { fontFamily: 'Cinzel', fontStyle: '800', fontSize: '64px', color: '#F3E6C8', stroke: '#2A2018', strokeThickness: 10 }).setOrigin(.5).setDepth(45).setAlpha(0);
    this.refreshCards();
  }
  menuBtn() { const t = this.add.text(W - 150, H - 12, '☰ battles', { fontFamily: 'Inter', fontStyle: '700', fontSize: '16px', color: '#F3E6C8', backgroundColor: 'rgba(0,0,0,.35)', padding: { x: 10, y: 6 } }).setOrigin(1, 1).setDepth(50).setInteractive({ useHandCursor: true });
    t.on('pointerdown', (p, lx, ly, ev) => { ev.stopPropagation(); if (!this.S || this.S.over) return; this.S.paused = true;
      show(`<div class="sheet"><div class="kick">Paused</div><h2>Leave this battle?</h2><div class="row"><button class="btn" id="res">Continue</button><button class="btn ghost" id="quit">Choose another battle</button></div></div>`);
      document.getElementById('res').onclick = () => { hide(); this.S.paused = false; };
      document.getElementById('quit').onclick = () => { hide(); this.S.over = true; this.children.removeAll(true); this.S = null; pickLevel(this); }; }); }
  hit(x, y, w, h, fn) { return this.add.zone(x, y, w, h).setOrigin(0).setDepth(35).setInteractive({ useHandCursor: true }).on('pointerdown', (p, lx, ly, ev) => { ev.stopPropagation(); SND.init(); fn(); }); }
  refreshCards() { const S = this.S; this.goldT.setText(String(Math.floor(S.gold)));
    this.cards.forEach(c => { c.draw(S.sel === c.k); c.dim.clear(); if (S.gold < c.u.cost) { c.dim.fillStyle(0x2A2018, .35); c.dim.fillRoundedRect(0, 0, 116, 108, 8); } });
    this.spade(S.tool === 'spade'); this.hearts.forEach((h, i) => h.setAlpha(i < S.lives ? 1 : .18));
    const ready = S.council <= 0; this.cdraw(ready); this.councilS.setText(ready ? 'answer: +£75' : 'ready in ' + Math.ceil(S.council) + ' s');
    this.waveT.setText('Wave ' + Math.min(5, Math.max(1, S.wave)) + ' / 5'); const wb = this.waveBar; wb.clear(); wb.fillStyle(0xD9C49A, 1); wb.fillRoundedRect(W - 180, 114, 150, 10, 5); wb.fillStyle(0x8E1F2C, 1); wb.fillRoundedRect(W - 180, 114, 150 * Math.min(1, (S.wave - 1 + (S.waveDone || 0)) / 5), 10, 5); }
  select(k) { const S = this.S; S.tool = null; S.sel = S.sel === k ? null : k; SND.place(); this.refreshCards(); }
  cellAt(p) { const F = FIELD, c = Math.floor((p.x - F.x) / F.cw), r = Math.floor((p.y - F.y) / F.lh); return (c >= 0 && c < F.cols && r >= 0 && r < F.lanes) ? { c, r } : null; }
  hover(p) { const S = this.S; if (!S) return; const h = this.hoverG; h.clear(); const cell = this.cellAt(p); this.ghost.setAlpha(0); if (!cell || (!S.sel && !S.tool)) return;
    const F = FIELD; h.lineStyle(4, S.tool ? 0x8E1F2C : 0xF3E6C8, .9); h.strokeRoundedRect(F.x + cell.c * F.cw + 4, F.y + cell.r * F.lh + 4, F.cw - 8, F.lh - 8, 8);
    if (S.sel && !this.grid[cell.r][cell.c]) { const u = UNITS[S.sel]; this.ghost.setTexture(u.art + '0').setPosition(F.x + cell.c * F.cw + F.cw / 2, F.y + cell.r * F.lh + F.lh / 2 - 6).setScale(Math.min(96 / this.ghost.width, 100 / this.ghost.height)).setAlpha(.55); } }
  click(p) { const S = this.S; if (!S || S.over || S.paused) return; const cell = this.cellAt(p); if (!cell) return;
    const occ = this.grid[cell.r][cell.c];
    if (S.tool === 'spade') { if (occ) { S.gold += Math.floor(UNITS[occ.k].cost / 2); this.killDef(occ, true); SND.coin(); } S.tool = null; this.refreshCards(); return; }
    if (!S.sel || occ) return; const u = UNITS[S.sel]; if (S.gold < u.cost) { this.flashText(p.x, p.y, 'Not enough £', '#8E1F2C'); SND.bad(); return; }
    S.gold -= u.cost; this.place(S.sel, cell.r, cell.c); if (S.gold < u.cost) S.sel = null; this.refreshCards(); this.hover(p); }
  place(k, r, c) { const F = FIELD, u = UNITS[k], x = F.x + c * F.cw + F.cw / 2, y = F.y + r * F.lh + F.lh / 2 - 6;
    const sp = this.add.sprite(x, y + 30, u.art + '0').play('a_' + u.art); sp.setScale(Math.min(100 / sp.width, 104 / sp.height)); sp.setDepth(10 + r);
    this.tweens.add({ targets: sp, y, duration: 260, ease: 'Back.out' });
    const d = { k, u, r, c, x, y, hp: u.hp, sp, cd: u.shoot ? .4 : 0, t: 0, bar: this.add.graphics().setDepth(20) };
    this.grid[r][c] = d; this.defs.push(d); SND.place(); this.smoke.explode(6, x, y + 40);
    if (u.fire) { d.sailing = true; }
  }
  killDef(d, quiet) { this.grid[d.r][d.c] = null; this.defs = this.defs.filter(x => x !== d); d.bar.destroy(); if (!quiet) { this.smoke.explode(10, d.x, d.y); SND.hit(); } this.tweens.add({ targets: d.sp, alpha: 0, y: d.y + 20, duration: 300, onComplete: () => d.sp.destroy() }); }
  spawn(type, lane) { const F = FIELD, u = UNITS[type], y = F.y + lane * F.lh + F.lh / 2 - 6, sp = this.add.sprite(W + 80, y, u.art + '0').play('a_' + u.art);
    sp.setScale(Math.min((u.big ? 150 : 108) / sp.width, (u.big ? 110 : 104) / sp.height)); sp.setDepth(12 + lane);
    if (u.ship) this.tweens.add({ targets: sp, angle: { from: -3, to: 3 }, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const hpMul = 1 + (this.S.wave - 1) * .12;
    this.foes.push({ type, u, lane, x: W + 80, y, hp: u.hp * hpMul, max: u.hp * hpMul, sp, bar: this.add.graphics().setDepth(21), slow: 0 }); }
  nextWave(delay) { const S = this.S; S.wave++; if (S.wave > 5) return; S.waveDone = 0;
    const mix = this.L.enemies[S.wave - 1], n = 5 + S.wave * 2 + (S.wave === 5 ? 3 : 0); S.spawnQ = [];
    let t = delay; for (let i = 0; i < n; i++) { t += (i === 0 ? 1.5 : Math.max(1.6, 5 - S.wave * .6) + rnd(-.6, .9)); S.spawnQ.push({ t, type: pick(mix), lane: Math.floor(Math.random() * FIELD.lanes) }); }
    S.waveT = 0; S.waveLen = t; this.time.delayedCall(delay * 1000 - 600, () => { if (!S.over) { this.say(S.wave === 5 ? 'Final wave!' : 'Wave ' + S.wave); SND.horn(); } });
    this.refreshCards(); }
  say(txt) { this.banner.setText(txt).setAlpha(0).setScale(.6); this.tweens.add({ targets: this.banner, alpha: 1, scale: 1, duration: 350, ease: 'Back.out', yoyo: true, hold: 900 }); }
  flashText(x, y, txt, col = '#2A2018') { const t = this.add.text(x, y, txt, { fontFamily: 'Inter', fontStyle: '800', fontSize: '20px', color: col, stroke: '#F3E6C8', strokeThickness: 4 }).setOrigin(.5).setDepth(46); this.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 900, onComplete: () => t.destroy() }); }
  coinPop(x, y, amount) { const c = this.add.image(x, y, 'coin').setDepth(44); this.tweens.add({ targets: c, x: 54, y: 58, duration: 700, ease: 'Cubic.in', onComplete: () => { c.destroy(); this.S.gold += amount; SND.coin(); this.refreshCards(); } }); }
  shoot(d) { const s = d.u.shoot, pr = this.add.image(d.x + 30, d.y - 8, s.proj).setDepth(25); this.shots.push({ pr, lane: d.r, x: d.x + 30, dmg: s.dmg, speed: s.speed, proj: s.proj });
    if (s.proj === 'arrow') SND.arrow(); else { SND.boom(); this.smoke.explode(5, d.x + 44, d.y - 10); this.tweens.add({ targets: d.sp, x: d.x - 6, duration: 80, yoyo: true }); } }
  hpBar(g, x, y, f, w = 60) { g.clear(); if (f >= .999) return; g.fillStyle(0x2A2018, .8); g.fillRect(x - w / 2 - 2, y - 2, w + 4, 9); g.fillStyle(f > .5 ? 0x5E9A4E : f > .25 ? 0xE3B444 : 0xC0262D, 1); g.fillRect(x - w / 2, y, w * Math.max(0, f), 5); }
  update(time, delta) {
    const S = this.S; if (!S || S.over || S.paused) return; const dt = Math.min(.1, delta / 1000);
    S.t += dt; S.waveT += dt; S.trickle += dt; if (S.council > 0) { S.council -= dt; if (Math.floor(S.council + dt) !== Math.floor(S.council)) this.refreshCards(); }
    if (S.trickle >= 3) { S.trickle = 0; S.gold += 10; this.refreshCards(); }
    while (S.spawnQ.length && S.spawnQ[0].t <= S.waveT) { const q = S.spawnQ.shift(); this.spawn(q.type, q.lane); }
    if (S.wave <= 5 && S.spawnQ.length) S.waveDone = Math.min(.95, S.waveT / S.waveLen);
    // defenders
    for (const d of this.defs) {
      d.t += dt;
      if (d.u.gold && d.t >= d.u.every) { d.t = 0; this.coinPop(d.x, d.y - 30, d.u.gold); this.tweens.add({ targets: d.sp, scaleY: d.sp.scaleY * 1.06, duration: 120, yoyo: true }); }
      if (d.u.shoot) { d.cd -= dt; if (d.cd <= 0 && this.foes.some(f => f.lane === d.r && f.x > d.x - 10 && f.x < W + 20)) { d.cd = d.u.shoot.every; this.shoot(d); } }
      if (d.u.melee) { const f = this.foes.find(f => f.lane === d.r && f.x > d.x - 20 && f.x - d.x < 90); if (f) { f.hp -= d.u.melee.dps * dt; if (Math.random() < dt * 3) { this.fx.explode(3, f.x - 30, f.y); SND.hit(); } } }
      if (d.sailing) { d.x += 120 * dt; d.sp.x = d.x; const f = this.foes.find(f => f.lane === d.r && Math.abs(f.x - d.x) < 70);
        if (f || d.x > W + 40) { this.foes.forEach(e => { if (Math.abs(e.y - d.y) < d.u.fire.radius && Math.abs(e.x - d.x) < d.u.fire.radius) e.hp -= d.u.fire.dmg; }); this.fx.explode(40, d.x, d.y); this.smoke.explode(20, d.x, d.y); SND.boom(); this.cameras.main.shake(220, .008); this.grid[d.r][d.c] = null; this.defs = this.defs.filter(x => x !== d); d.bar.destroy(); d.sp.destroy(); } }
      this.hpBar(d.bar, d.x, d.y - 58, d.hp / d.u.hp);
    }
    // projectiles
    for (const s of this.shots) { s.x += s.speed * dt; s.pr.x = s.x; if (s.proj === 'ball') s.pr.rotation += dt * 8;
      const f = this.foes.find(f => f.lane === s.lane && Math.abs(f.x - s.x) < 40); if (f) { f.hp -= s.dmg; s.dead = true; this.fx.explode(s.proj === 'ball' ? 12 : 5, s.x, s.pr.y); f.sp.setTintFill(0xFFFFFF); this.time.delayedCall(70, () => f.sp && f.sp.clearTint()); SND.hit(); }
      if (s.x > W + 40) s.dead = true; if (s.dead) s.pr.destroy(); }
    this.shots = this.shots.filter(s => !s.dead);
    // enemies
    for (const f of this.foes) {
      const block = this.defs.find(d => !d.sailing && d.r === f.lane && f.x - d.x < (f.u.big ? 90 : 62) && f.x - d.x > -30);
      if (block) { block.hp -= f.u.dps * dt; if (Math.random() < dt * 2.5) this.fx.explode(2, block.x + 30, block.y); if (block.hp <= 0) this.killDef(block); f.sp.anims.timeScale = 2; }
      else { f.x -= f.u.speed * dt; f.sp.anims.timeScale = 1; }
      f.sp.x = f.x; this.hpBar(f.bar, f.x, f.y - 60, f.hp / f.max, f.u.big ? 90 : 60);
      if (f.hp <= 0) { f.dead = true; S.killed++; this.smoke.explode(14, f.x, f.y); this.flashText(f.x, f.y - 40, '+£' + f.u.reward, '#8E1F2C'); S.gold += f.u.reward; this.refreshCards(); this.tweens.add({ targets: f.sp, alpha: 0, angle: f.u.ship ? 25 : -40, y: f.y + 20, duration: 450, onComplete: () => f.sp.destroy() }); f.bar.destroy(); }
      else if (f.x < FIELD.x - 40) { f.dead = true; S.lives--; this.cameras.main.shake(400, .015); this.cameras.main.flash(250, 160, 20, 30); SND.lose(); f.sp.destroy(); f.bar.destroy(); this.refreshCards(); if (S.lives <= 0) return this.end(false); }
    }
    this.foes = this.foes.filter(f => !f.dead);
    if (!S.spawnQ.length && !this.foes.length && !S.between) {
      S.waveDone = 1; this.refreshCards();
      if (S.wave >= 5) return this.end(true);
      S.between = true; this.say('Wave ' + S.wave + ' defended!'); SND.good(); this.time.delayedCall(2600, () => { S.between = false; this.nextWave(4); });
    }
  }
  council() { const S = this.S; if (!S || S.over || S.council > 0) return; S.paused = true; SND.init();
    const pool = QB.filter(u => this.L.units.includes(u.n)).flatMap(u => u.q); const q0 = pick(pool.length ? pool : QB.flatMap(u => u.q));
    const idx = [0, 1, 2, 3].sort(() => Math.random() - .5), q = { q: q0.q, o: idx.map(i => q0.o[i]), a: idx.indexOf(q0.a), e: q0.e };
    show(`<div class="sheet"><div class="kick">The Royal Council asks</div><div class="q">${esc(q.q)}</div><div class="opts">${q.o.map((o, j) => `<button class="opt" data-j="${j}"><i>${'ABCD'[j]}</i><span>${esc(o)}</span></button>`).join('')}</div><div id="fb"></div><div class="row"><button class="btn" id="cont" style="display:none">Back to battle</button></div></div>`);
    const bs = [...ov.querySelectorAll('.opt')];
    bs.forEach(b => b.onclick = () => { if (bs[0].dataset.d) return; bs.forEach(x => x.dataset.d = 1); const j = +b.dataset.j, ok = j === q.a; bs[q.a].classList.add('ok'); if (!ok) b.classList.add('bad');
      document.getElementById('fb').innerHTML = `<div class="fb"><b>${ok ? 'Wise counsel! +£75' : 'Wrong – the treasury stays closed this time.'}</b><br>${esc(q.e)}</div>`; ok ? SND.good() : SND.bad();
      const c = document.getElementById('cont'); c.style.display = ''; c.focus(); c.onclick = () => { hide(); S.paused = false; S.council = ok ? 10 : 18; if (ok) { for (let i = 0; i < 3; i++) this.time.delayedCall(i * 120, () => this.coinPop(W - 300, 70, 25)); } this.refreshCards(); }; }); }
  end(win) { const S = this.S, L = this.L; S.over = true; SND.stopMusic(); win ? SND.win() : SND.lose();
    if (win) { const d = store.get('done') || {}; d[L.id] = 1; store.set('done', d); }
    this.say(win ? 'Victory!' : 'Defeat');
    this.time.delayedCall(1500, () => show(`<div class="sheet"><div class="split"><div><div class="kick">${win ? 'You defended the realm' : 'The enemy broke through'}</div><h2>${win ? 'Victory!' : 'Defeat'}</h2>
      <p>${win ? `You survived all five waves and defeated ${S.killed} enemies.` : `You held out until wave ${S.wave} and defeated ${S.killed} enemies.`}</p>
      <p><b>What really happened:</b> ${L.real}</p>
      <div class="row"><button class="btn" id="again">${win ? 'Play again' : 'Try again'}</button><button class="btn ghost" id="other">Other battles</button></div></div>
      <div><img src="${L.img}" alt=""><div class="cap">${L.cap}</div></div></div></div>`));
    this.time.delayedCall(1550, () => { const a = document.getElementById('again'), o = document.getElementById('other'); if (a) a.onclick = () => { hide(); SND.startMusic(); this.startLevel(L); }; if (o) o.onclick = () => { hide(); SND.startMusic(); this.children.removeAll(true); this.S = null; pickLevel(this); }; });
  }
}

const GAME = window.__realm = new Phaser.Game({ type: /webgl/.test(location.search) ? Phaser.AUTO : Phaser.CANVAS, parent: 'game', width: W, height: H, backgroundColor: '#15110D', scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, fullscreenTarget: 'stage' }, input: { windowEvents: false }, scene: [Boot, Title, Battle], render: { antialias: true } });
// iPhone/iPad: re-measure after rotation and when the browser bars appear or disappear
const refit = () => { [50, 300, 800].forEach(t => setTimeout(() => GAME.scale && GAME.scale.refresh(), t)); };
window.addEventListener('orientationchange', refit); window.addEventListener('resize', refit); if (window.visualViewport) window.visualViewport.addEventListener('resize', refit);
})();
