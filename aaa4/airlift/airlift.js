// Berlin Airlift – AAA 4 arcade game. Planes, cities and weather are drawn in code; photos are public domain (USAF).
(function () {
'use strict';
const K = window.KIT, { W, H, cv, stroke, fillS, SND, rnd, pick } = K;
const CAP = { tempelhof: 'Berliners watching a C-54 land at Tempelhof Airport, 1948. Photo: Henry Ries / U.S. Air Force, public domain, via Wikimedia Commons.', children: 'Berlin children playing an “airlift” game. Photo: U.S. Air Force, public domain, via Wikimedia Commons.' };
// Six missions through the blockade (dates of the real blockade: 24 June 1948 – 12 May 1949)
const MISSIONS = [
  { m: 'July 1948', sky: ['#7FB2DE', '#E6EEF2'], storms: 1, fog: 0, yaks: 0, need: 70, note: 'The blockade began on 24 June 1948. Two days later the United States started “Operation Vittles”; the British “Operation Plainfare” followed.' },
  { m: 'September 1948', sky: ['#89A9C6', '#E8E2D2'], storms: 2, fog: 0, yaks: 1, need: 75, note: 'In September 1948 about 300,000 West Berliners gathered at the Reichstag to protest against Soviet pressure on their city.' },
  { m: 'November 1948', sky: ['#7D8A98', '#C9CCC8'], storms: 2, fog: 1, yaks: 1, need: 80, note: 'Autumn brings fog and rain. Pilots had to fly by instruments in narrow air corridors.' },
  { m: 'January 1949', sky: ['#5E6878', '#B6BAC0'], storms: 3, fog: 2, yaks: 1, need: 85, snow: true, note: 'Winter: Berlin needs coal for heating and electricity as well as food.' },
  { m: 'March 1949', sky: ['#7F96AE', '#D8DCDA'], storms: 2, fog: 1, yaks: 2, need: 85, note: 'The airlift became more and more efficient. At its height, one plane landed every 45 seconds at Tempelhof.' },
  { m: 'May 1949', sky: ['#78B0E0', '#F0EBDC'], storms: 2, fog: 0, yaks: 2, need: 90, note: 'Last mission before the Soviets give up the blockade.' }
];

/* ---------- drawing ---------- */
function c54(prop) { const c = cv(300, 120), g = c.getContext('2d');
  g.beginPath(); g.moveTo(20, 62); g.quadraticCurveTo(30, 44, 70, 42); g.lineTo(250, 44); g.quadraticCurveTo(290, 48, 292, 62); g.quadraticCurveTo(286, 76, 250, 78); g.lineTo(60, 80); g.quadraticCurveTo(26, 78, 20, 62); fillS(g, '#C9CED4');
  g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(70, 48, 170, 6);
  // tail
  g.beginPath(); g.moveTo(40, 52); g.lineTo(10, 8); g.lineTo(32, 8); g.lineTo(76, 50); fillS(g, '#B8BEC5'); g.beginPath(); g.moveTo(30, 66); g.lineTo(4, 74); g.lineTo(20, 80); g.lineTo(52, 74); fillS(g, '#B8BEC5', 2.5);
  // wing
  g.beginPath(); g.moveTo(120, 64); g.lineTo(196, 64); g.lineTo(176, 110); g.lineTo(150, 110); g.closePath(); fillS(g, '#AEB4BB');
  // engines + props
  [[150, 88], [176, 100]].forEach(([x, y], i) => { g.beginPath(); g.ellipse(x + 18, y, 18, 8, 0, 0, 7); fillS(g, '#8F969E', 2.5); g.save(); g.translate(x + 38, y); g.fillStyle = 'rgba(40,40,46,.55)'; if (prop) { g.beginPath(); g.ellipse(0, 0, 3, 20, 0, 0, 7); g.fill(); } else { g.beginPath(); g.ellipse(0, 0, 2, 18, .6, 0, 7); g.fill(); } g.restore(); });
  // cockpit windows
  g.fillStyle = '#2E4D6B'; [[248, 50, 14, 8], [264, 52, 12, 7]].forEach(([x, y, w, h]) => { K.rr(g, x, y, w, h, 2); g.fill(); }); for (let x = 90; x < 230; x += 22) { g.beginPath(); g.arc(x, 58, 4, 0, 7); g.fill(); }
  // insignia
  g.beginPath(); g.arc(104, 70, 9, 0, 7); g.fillStyle = '#1F3A6E'; g.fill(); g.fillStyle = '#FFF'; g.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5, b = a + Math.PI / 5; g.lineTo(104 + Math.cos(a) * 7, 70 + Math.sin(a) * 7); g.lineTo(104 + Math.cos(b) * 3, 70 + Math.sin(b) * 3); } g.fill();
  g.fillStyle = '#1F3A6E'; g.font = '800 13px Inter, sans-serif'; g.fillText('U.S. AIR FORCE', 128, 75);
  return c; }
function yak() { const c = cv(140, 60), g = c.getContext('2d'); g.translate(140, 0); g.scale(-1, 1);
  g.beginPath(); g.moveTo(10, 30); g.quadraticCurveTo(20, 20, 50, 22); g.lineTo(120, 26); g.quadraticCurveTo(134, 30, 120, 36); g.lineTo(50, 38); g.quadraticCurveTo(18, 40, 10, 30); fillS(g, '#7C8A7A'); g.beginPath(); g.moveTo(20, 28); g.lineTo(8, 8); g.lineTo(22, 8); g.lineTo(38, 26); fillS(g, '#6E7C6C', 2.5); g.beginPath(); g.moveTo(60, 34); g.lineTo(94, 34); g.lineTo(84, 54); g.lineTo(68, 54); fillS(g, '#6E7C6C', 2.5); g.beginPath(); g.ellipse(84, 22, 14, 6, 0, 0, 7); fillS(g, '#7FB0D0', 2); g.fillStyle = '#C0262D'; g.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5, b = a + Math.PI / 5; g.lineTo(18 + Math.cos(a) * 7, 16 + Math.sin(a) * 7); g.lineTo(18 + Math.cos(b) * 3, 16 + Math.sin(b) * 3); } g.fill(); return c; }
function cloud(dark) { const c = cv(260, 140), g = c.getContext('2d'); g.fillStyle = dark ? '#4A5260' : 'rgba(255,255,255,.95)'; [[60, 90, 46], [110, 70, 56], [170, 82, 50], [210, 98, 34], [130, 104, 46]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }); if (dark) { g.strokeStyle = '#FFE58A'; g.lineWidth = 5; g.beginPath(); g.moveTo(130, 110); g.lineTo(116, 128); g.lineTo(132, 128); g.lineTo(118, 140); g.stroke(); } return c; }
function crate() { const c = cv(36, 30), g = c.getContext('2d'); K.rr(g, 2, 2, 32, 26, 3); fillS(g, '#B88A4A', 2.5); g.beginPath(); g.moveTo(2, 2); g.lineTo(34, 28); g.moveTo(34, 2); g.lineTo(2, 28); g.lineWidth = 2; g.strokeStyle = '#7A5A2E'; g.stroke(); return c; }
function candy() { const c = cv(40, 56), g = c.getContext('2d'); g.beginPath(); g.moveTo(4, 18); g.quadraticCurveTo(20, -6, 36, 18); g.closePath(); fillS(g, '#F7F4EC', 2); g.beginPath(); g.moveTo(6, 18); g.lineTo(18, 42); g.moveTo(34, 18); g.lineTo(22, 42); g.lineWidth = 1.5; g.strokeStyle = '#555'; g.stroke(); K.rr(g, 12, 40, 16, 12, 3); fillS(g, '#B5202A', 2); return c; }
function child(fr) { const c = cv(40, 70), g = c.getContext('2d'); const arm = fr ? -14 : -4; g.beginPath(); g.moveTo(14, 40); g.lineTo(12, 68); g.moveTo(26, 40); g.lineTo(28, 68); stroke(g, 5); g.beginPath(); K.rr(g, 10, 22, 20, 22, 6); fillS(g, pick(['#2E4D8B', '#8E1F2C', '#3E6B3A', '#C9A43A']), 2.5); g.beginPath(); g.moveTo(10, 26); g.lineTo(2, 26 + arm); g.moveTo(30, 26); g.lineTo(38, 26 + arm); stroke(g, 4); g.beginPath(); g.arc(20, 14, 9, 0, 7); fillS(g, '#EBC09A', 2.5); return c; }
function city(kind) { // long strip, tiled
  const c = cv(1280, 260), g = c.getContext('2d'); g.clearRect(0, 0, 1280, 260);
  if (kind === 'fields') { g.fillStyle = '#7FA35C'; g.fillRect(0, 120, 1280, 140); for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#8DAE64' : '#C9B470'; g.beginPath(); g.moveTo(i * 80, 140); g.lineTo(i * 80 + 90, 140); g.lineTo(i * 80 + 60, 260); g.lineTo(i * 80 - 30, 260); g.fill(); } for (let i = 0; i < 30; i++) { g.fillStyle = '#3E5F2E'; g.beginPath(); g.arc(rnd(0, 1280), rnd(124, 150), rnd(8, 16), 0, 7); g.fill(); } }
  if (kind === 'ruins') { g.fillStyle = '#9A958C'; g.fillRect(0, 170, 1280, 90); for (let x = 0; x < 1280; x += 60) { const h = rnd(50, 140), w = rnd(36, 56); g.fillStyle = pick(['#6E6A64', '#7A766E', '#5E5A54']); g.beginPath(); g.moveTo(x, 200); g.lineTo(x, 200 - h); for (let k = 0; k < 4; k++) g.lineTo(x + w * (k + 1) / 4, 200 - h + rnd(-18, 22)); g.lineTo(x + w, 200); g.fill(); g.fillStyle = '#2E2C2A'; for (let wy = 200 - h + 26; wy < 192; wy += 22) for (let wx = x + 6; wx < x + w - 8; wx += 14) if (Math.random() < .7) g.fillRect(wx, wy, 7, 10); } }
  if (kind === 'tempelhof') { g.fillStyle = '#8D9A7A'; g.fillRect(0, 170, 1280, 90); g.fillStyle = '#5E5A54'; g.fillRect(0, 214, 1280, 24); g.fillStyle = '#F2F2F2'; for (let x = 0; x < 1280; x += 60) g.fillRect(x, 224, 30, 4); g.fillStyle = '#B9AE96'; g.beginPath(); g.moveTo(760, 200); g.quadraticCurveTo(1000, 120, 1280, 150); g.lineTo(1280, 200); g.closePath(); g.fill(); stroke(g, 3); g.fillStyle = '#7A6E5A'; for (let x = 780; x < 1280; x += 26) g.fillRect(x, 178 - (x - 780) / 18, 12, 12); }
  return c; }
function bg(m) { const c = cv(W, H), g = c.getContext('2d'); K.sky(g, m.sky[0], m.sky[1]); g.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(rnd(0, W), rnd(60, 300), rnd(80, 160), rnd(14, 26), 0, 0, 7); g.fill(); } K.hills(g, 560, '#8FA0A8', 18, 2); return c; }

/* ---------- scenes ---------- */
class Boot extends Phaser.Scene { constructor() { super('Boot'); }
  create() { this.textures.addCanvas('c54a', c54(0)); this.textures.addCanvas('c54b', c54(1)); this.anims.create({ key: 'prop', frames: [{ key: 'c54a' }, { key: 'c54b' }], frameRate: 14, repeat: -1 });
    this.textures.addCanvas('yak', yak()); this.textures.addCanvas('cloud', cloud(0)); this.textures.addCanvas('storm', cloud(1)); this.textures.addCanvas('crate', crate()); this.textures.addCanvas('candy', candy());
    this.textures.addCanvas('kid0', child(0)); this.textures.addCanvas('kid1', child(1)); this.anims.create({ key: 'wave', frames: [{ key: 'kid0' }, { key: 'kid1' }], frameRate: 4, repeat: -1 });
    ['fields', 'ruins', 'tempelhof'].forEach(k => this.textures.addCanvas('city_' + k, city(k)));
    const s = cv(24, 24), g = s.getContext('2d'); g.beginPath(); g.arc(12, 12, 8, 0, 7); g.fillStyle = '#FFFFFF'; g.fill(); this.textures.addCanvas('dot', s);
    K.fonts(['400 40px "Bebas Neue"', '700 20px Inter']).then(() => this.scene.start('Title')); } }

const ST = K.store('airlift');
class Title extends Phaser.Scene { constructor() { super('Title'); }
  create() { K.tex(this, 'bgT', () => bg(MISSIONS[0])); this.add.image(0, 0, 'bgT').setOrigin(0);
    this.add.tileSprite(0, H - 260, W, 260, 'city_ruins').setOrigin(0).setTint(0xB8B0A8);
    for (let i = 0; i < 3; i++) { const p = this.add.sprite(-300 - i * 420, 230 + i * 70, 'c54a').play('prop').setScale(.8 - i * .15); this.tweens.add({ targets: p, x: W + 300, duration: 9000 + i * 1500, repeat: -1, delay: i * 1800 }); }
    this.add.text(W / 2, 96, 'AAA 4 · WEST BERLIN 1948–1949', { fontFamily: 'Inter, sans-serif', fontStyle: '800', fontSize: '20px', color: '#1F2A3A' }).setOrigin(.5);
    this.add.text(W / 2, 176, 'BERLIN AIRLIFT', { fontFamily: '"Bebas Neue", Inter, sans-serif', fontSize: '140px', color: '#F7F4EC', stroke: '#1F2A3A', strokeThickness: 10, shadow: { offsetX: 0, offsetY: 8, color: 'rgba(0,0,0,.4)', blur: 10, fill: true } }).setOrigin(.5);
    this.add.text(W / 2, 266, 'Fly food and coal into the blockaded city', { fontFamily: '"Source Serif 4", Georgia, serif', fontStyle: 'italic', fontSize: '28px', color: '#1F2A3A' }).setOrigin(.5);
    K.button(this, W / 2 - 140, 370, 'TAKE OFF', () => { K.SND.init(); K.SND.startMusic([67, 0, 71, 74, 72, 0, 71, 69, 67, 0, 64, 67, 69, 0, 71, 0], 260, 'square'); briefing(this, 0, { supplies: 60, tons: 0, smiles: 0 }); }, 260, false, 0x1F3A6E);
    K.button(this, W / 2 + 140, 370, 'HOW TO FLY', () => howTo(), 260, true);
    K.corner(this, false); } }

function howTo(done) { K.show(`<div class="sheet"><div class="kick">How to fly</div><h2>Berlin Airlift</h2>
  <p>The Soviet Union has blocked all roads, railways and canals to West Berlin. The only way in is by air. Fly your C-54 through the <b>air corridor</b> and land at <b>Tempelhof</b>.</p>
  <p><b>Steer:</b> move your finger or mouse up and down (or use the ↑ ↓ keys). Avoid <b>storm clouds</b> and keep away from <b>Soviet fighters</b> – they fly close to frighten you. Every hit costs crates of cargo.</p>
  <p><b>Land:</b> at the end, keep the plane inside the green landing zone. Over the fence, children are waiting – press <b>🍬 CANDY</b> to drop sweets on little parachutes, like the “Candy Bomber” Gail Halvorsen.</p>
  <p>Before each flight a <b>briefing question</b> about the USA 1900–1950: a correct answer gives you a better weather forecast and extra cargo. Keep Berlin supplied until the blockade ends!</p>
  <div class="row"><button class="btn" id="ok">Roger!</button></div></div>`); document.getElementById('ok').onclick = () => { K.hide(); if (done) done(); }; }
function bar(v) { return `<div style="height:14px;border-radius:8px;background:#E3D2A8;overflow:hidden;border:2px solid #2A2018"><div style="height:100%;width:${Math.max(0, Math.min(100, v))}%;background:${v > 50 ? '#3E6B3A' : v > 25 ? '#C9962E' : '#B5202A'}"></div></div>`; }
function briefing(scene, i, S) { const M = MISSIONS[i];
  K.show(`<div class="sheet"><div class="split"><div><div class="kick">Mission ${i + 1} of ${MISSIONS.length} · ${M.m}</div><h2>Flight briefing</h2><p>${M.note}</p>
  <p class="small">Berlin's supplies</p>${bar(S.supplies)}<p class="small" style="margin-top:6px">Delivered so far: <b>${S.tons}</b> crates · children's smiles: <b>${S.smiles}</b></p>
  <p>Weather: ${M.storms > 2 ? 'heavy storms' : M.storms > 1 ? 'storms likely' : 'mostly clear'}${M.fog ? ', fog over Berlin' : ''}.</p>
  <div class="row"><button class="btn" id="q" style="background:#1F3A6E;box-shadow:0 3px 0 #0E1E3E">Answer the briefing question</button></div></div>
  <div><img src="img/${i % 2 ? 'children' : 'tempelhof'}.jpg" alt=""><div class="cap">${CAP[i % 2 ? 'children' : 'tempelhof']}</div></div></div></div>`);
  document.getElementById('q').onclick = () => K.ask(K.question([4]), { kick: 'Briefing question', okText: 'Correct! Better weather forecast and two extra crates.', badText: 'Wrong – you fly with the normal forecast.', button: 'To the plane!' }, ok => scene.scene.start('Fly', { i, S, bonus: ok }));
}

class Fly extends Phaser.Scene { constructor() { super('Fly'); }
  create(d) { this.i = d.i; this.S = d.S; const M = this.M = MISSIONS[d.i]; this.bonus = d.bonus;
    K.tex(this, 'bg' + d.i, () => bg(M)); this.add.image(0, 0, 'bg' + d.i).setOrigin(0);
    this.ground = this.add.tileSprite(0, H - 260, W, 260, 'city_fields').setOrigin(0).setDepth(2);
    this.len = 70; this.t = 0; this.cargo = 12 + (d.bonus ? 2 : 0); this.max = this.cargo; this.speed = 1; this.phase = 'fly'; this.done = false; this.paused = false; this.smiles = 0;
    this.plane = this.add.sprite(300, 300, 'c54a').play('prop').setScale(.75).setDepth(10); this.ty = 300;
    this.tweens.add({ targets: this.plane, angle: { from: -1.5, to: 1.5 }, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.obs = []; this.drops = [];
    this.smoke = this.add.particles(0, 0, 'dot', { speed: { min: 10, max: 40 }, lifespan: 700, scale: { start: .5, end: 1.4 }, alpha: { start: .35, end: 0 }, tint: 0xBBBBBB, emitting: false }).setDepth(9);
    if (M.snow) this.add.particles(0, 0, 'dot', { x: { min: 0, max: W + 200 }, y: -10, speedY: { min: 60, max: 120 }, speedX: { min: -80, max: -30 }, scale: { min: .15, max: .35 }, lifespan: 7000, frequency: 40 }).setDepth(20);
    this.fogG = this.add.graphics().setDepth(18);
    // corridor band
    this.band = this.add.graphics().setDepth(1); this.band.fillStyle(0xFFFFFF, .08); this.band.fillRect(0, 110, W, 360); this.band.lineStyle(2, 0xFFFFFF, .35); for (let x = 0; x < W; x += 40) { this.band.lineBetween(x, 110, x + 20, 110); this.band.lineBetween(x, 470, x + 20, 470); }
    this.add.text(14, 112, 'AIR CORRIDOR', { fontFamily: 'Inter, sans-serif', fontStyle: '800', fontSize: '13px', color: 'rgba(255,255,255,.7)' }).setDepth(1);
    // HUD
    this.hudG = this.add.graphics().setDepth(40); this.hudT = this.add.text(20, 16, '', { fontFamily: '"Bebas Neue", Inter, sans-serif', fontSize: '34px', color: '#F7F4EC', stroke: '#1F2A3A', strokeThickness: 6 }).setDepth(41);
    this.msg = this.add.text(W / 2, 170, '', { fontFamily: '"Bebas Neue", Inter, sans-serif', fontSize: '70px', color: '#F7F4EC', stroke: '#1F2A3A', strokeThickness: 10 }).setOrigin(.5).setDepth(50).setAlpha(0);
    this.candyBtn = K.button(this, W - 150, H - 150, '🍬 CANDY', () => this.dropCandy(), 200, false, 0xB5202A).setAlpha(0);
    this.input.on('pointermove', p => { if (p.isDown || !this.sys.game.device.input.touch) this.ty = Phaser.Math.Clamp(p.y, 90, H - 200); });
    this.input.on('pointerdown', p => { this.ty = Phaser.Math.Clamp(p.y, 90, H - 200); });
    this.keys = this.input.keyboard ? this.input.keyboard.addKeys('UP,DOWN,W,S,SPACE') : null;
    K.corner(this, true, ['☰ menu', () => { this.paused = true; K.show(`<div class="sheet"><div class="kick">Paused</div><h2>Leave the airlift?</h2><div class="row"><button class="btn" id="res">Continue</button><button class="btn ghost" id="quit">Back to the start</button></div></div>`); document.getElementById('res').onclick = () => { K.hide(); this.paused = false; }; document.getElementById('quit').onclick = () => { K.hide(); this.scene.start('Title'); }; }], W - 260);
    this.say(this.M.m.toUpperCase(), 900); K.SND.engine();
    this.plan(); }
  plan() { const M = this.M, n = 6 + M.storms * 3 - (this.bonus ? 3 : 0); this.sched = [];
    for (let k = 0; k < n; k++) this.sched.push({ t: 4 + k * (this.len - 22) / n + rnd(-1, 1), type: Math.random() < .35 ? 'cloud' : 'storm' });
    for (let k = 0; k < M.yaks; k++) this.sched.push({ t: 14 + k * 18 + rnd(0, 6), type: 'yak' });
    this.sched.sort((a, b) => a.t - b.t); }
  say(t, hold = 900) { this.msg.setText(t).setAlpha(0).setScale(.6); this.tweens.add({ targets: this.msg, alpha: 1, scale: 1, duration: 300, ease: 'Back.out', yoyo: true, hold }); }
  lose(n, x, y) { const k = Math.min(n, this.cargo); this.cargo -= k; for (let j = 0; j < k; j++) { const c = this.add.image(x, y, 'crate').setDepth(11); this.tweens.add({ targets: c, x: x - rnd(40, 160), y: H + 40, angle: rnd(-200, 200), duration: rnd(900, 1400), ease: 'Quad.in', onComplete: () => c.destroy() }); } this.cameras.main.shake(260, .01); K.SND.hit(); }
  dropCandy() { if (this.phase !== 'approach' || this.candyLeft <= 0) return; this.candyLeft--; const c = this.add.image(this.plane.x - 40, this.plane.y + 30, 'candy').setDepth(12).setScale(.9); this.drops.push({ c, vx: -30, vy: 40 }); K.SND.click(); }
  update(time, delta) { if (this.done || this.paused) return; const dt = Math.min(.05, delta / 1000); this.t += dt; const k = this.keys;
    if (k && (k.UP.isDown || k.W.isDown)) this.ty = Math.max(90, this.ty - 360 * dt); if (k && (k.DOWN.isDown || k.S.isDown)) this.ty = Math.min(H - 200, this.ty + 360 * dt); if (k && Phaser.Input.Keyboard.JustDown(k.SPACE)) this.dropCandy();
    this.plane.y += (this.ty - this.plane.y) * Math.min(1, dt * 4); this.ground.tilePositionX += 220 * dt; if (Math.random() < .5) this.smoke.explode(1, this.plane.x - 120, this.plane.y + 8);
    // scenery change: fields → ruins → Tempelhof
    const prog = this.t / this.len;
    if (prog > .55 && this.ground.texture.key === 'city_fields') { this.ground.setTexture('city_ruins'); this.say('BERLIN AHEAD', 600); }
    // spawns
    while (this.sched.length && this.sched[0].t <= this.t && this.phase === 'fly') { const s = this.sched.shift(); const y = Phaser.Math.Clamp(this.plane.y + rnd(-140, 140), 120, 440);
      if (s.type === 'yak') { const o = this.add.image(W + 120, y, 'yak').setDepth(12).setScale(.9); this.obs.push({ o, type: 'yak', vx: -720, vy: (this.plane.y - y) * .4 }); this.say('SOVIET FIGHTER!', 400); K.SND.engine(); }
      else { const o = this.add.image(W + 160, y, s.type).setDepth(s.type === 'storm' ? 13 : 8).setScale(rnd(.8, 1.15)).setAlpha(s.type === 'cloud' ? .9 : 1); this.obs.push({ o, type: s.type, vx: -220 * rnd(.9, 1.2), vy: 0 }); } }
    for (const ob of this.obs) { ob.o.x += ob.vx * dt; ob.o.y += ob.vy * dt;
      if (!ob.hit && ob.type !== 'cloud') { const dx = Math.abs(ob.o.x - this.plane.x), dy = Math.abs(ob.o.y - this.plane.y); if (dx < (ob.type === 'yak' ? 110 : 120) && dy < (ob.type === 'yak' ? 46 : 52)) { ob.hit = true; this.lose(ob.type === 'yak' ? 2 : 1, this.plane.x, this.plane.y); if (ob.type === 'storm') this.cameras.main.flash(120, 255, 240, 170); } }
      if (ob.o.x < -300) { ob.dead = true; ob.o.destroy(); } }
    this.obs = this.obs.filter(o => !o.dead);
    // fog
    this.fogG.clear(); if (this.M.fog && prog > .5) { this.fogG.fillStyle(0xDDE2E6, Math.min(.55, (prog - .5) * this.M.fog)); this.fogG.fillRect(0, 0, W, H); }
    // approach & landing
    if (this.phase === 'fly' && prog >= .78) { this.phase = 'approach'; this.ground.setTexture('city_tempelhof'); this.say('TEMPELHOF – LANDING', 700); this.candyLeft = 6; this.candyBtn.setAlpha(1);
      this.kids = []; for (let j = 0; j < 7; j++) { const kd = this.add.sprite(W + 100 + j * 60, H - 92, 'kid0').play('wave').setDepth(6); this.kids.push(kd); }
      this.zone = this.add.graphics().setDepth(5); this.zoneY = 420; }
    if (this.phase === 'approach') { const z = this.zone; z.clear(); z.fillStyle(0x3E6B3A, .22); z.fillRect(0, this.zoneY - 40, W, 80); z.lineStyle(3, 0x7FD07F, .9); z.strokeRect(-4, this.zoneY - 40, W + 8, 80);
      this.kids.forEach(kd => kd.x -= 220 * dt);
      this.inZone = (this.inZone || 0) + (Math.abs(this.plane.y - this.zoneY) < 40 ? dt : -dt * .5); this.inZone = Math.max(0, this.inZone);
      if (prog >= 1) this.land(); }
    for (const dr of this.drops) { dr.vy = Math.min(70, dr.vy + 20 * dt); dr.c.x += dr.vx * dt; dr.c.y += dr.vy * dt; dr.c.rotation = Math.sin(this.t * 4) * .2;
      if (!dr.done && this.kids) { const kid = this.kids.find(kd => Math.abs(kd.x - dr.c.x) < 50 && dr.c.y > kd.y - 60); if (kid) { dr.done = true; this.smiles++; this.tweens.add({ targets: kid, y: kid.y - 30, duration: 200, yoyo: true }); this.flash(kid.x, kid.y - 70, '+1 😊'); K.SND.coin(); dr.c.destroy(); } }
      if (dr.c.y > H) { dr.done = true; dr.c.destroy(); } }
    this.drops = this.drops.filter(d => !d.done);
    this.drawHud(prog); }
  flash(x, y, t) { const tx = this.add.text(x, y, t, { fontFamily: 'Inter, sans-serif', fontStyle: '800', fontSize: '22px', color: '#FFFFFF', stroke: '#1F2A3A', strokeThickness: 5 }).setOrigin(.5).setDepth(45); this.tweens.add({ targets: tx, y: y - 40, alpha: 0, duration: 900, onComplete: () => tx.destroy() }); }
  drawHud(prog) { const g = this.hudG; g.clear(); g.fillStyle(0x1F2A3A, .55); g.fillRoundedRect(10, 10, 520, 86, 10);
    g.fillStyle(0xFFFFFF, .25); g.fillRoundedRect(24, 66, 490, 14, 7); g.fillStyle(0xF6D27A, 1); g.fillRoundedRect(24, 66, 490 * Math.min(1, prog), 14, 7);
    for (let j = 0; j < this.max; j++) { g.fillStyle(j < this.cargo ? 0xB88A4A : 0x5A5A5A, 1); g.fillRect(250 + j * 19, 22, 15, 15); }
    this.hudT.setText(`${this.M.m.toUpperCase()}   CARGO`); }
  land() { this.phase = 'done'; this.done = true; this.candyBtn.setAlpha(0); const good = this.inZone > 2.2;
    const finish = () => { const S = this.S; const delivered = good ? this.cargo : Math.floor(this.cargo / 2); S.tons += delivered; S.smiles += this.smiles; S.supplies = Math.min(100, S.supplies + delivered * 5 - (26 + this.i * 4));
      const next = this.i + 1, failed = S.supplies <= 0;
      K.show(`<div class="sheet"><div class="kick">${this.M.m}</div><h2>${good ? 'Safe landing!' : 'Bumpy landing'}</h2><p>${good ? `You landed safely at Tempelhof and delivered <b>${delivered}</b> crates.` : `You missed the landing path and had to go around – only <b>${delivered}</b> crates were unloaded in time.`} The children caught <b>${this.smiles}</b> candy parachutes.</p>
        <p class="small">Berlin's supplies</p>${bar(S.supplies)}
        <div class="row"><button class="btn" id="go" style="background:#1F3A6E;box-shadow:0 3px 0 #0E1E3E">${failed ? 'See what happened' : next < MISSIONS.length ? 'Next mission' : 'The end of the blockade'}</button></div></div>`);
      document.getElementById('go').onclick = () => { K.hide(); if (failed) return end(this, S, false); if (next < MISSIONS.length) briefing(this, next, S); else end(this, S, true); }; };
    if (good) { this.tweens.add({ targets: this.plane, y: H - 140, x: 640, angle: 4, duration: 1600, ease: 'Sine.out', onComplete: () => { this.smoke.explode(16, this.plane.x - 40, this.plane.y + 40); K.SND.boom(); this.tweens.add({ targets: this.plane, x: 1000, duration: 1400, ease: 'Quad.out', onComplete: finish }); } }); this.say('TOUCHDOWN!', 700); }
    else { this.tweens.add({ targets: this.plane, y: 160, x: W + 300, duration: 1800, ease: 'Sine.in', onComplete: finish }); this.say('GO AROUND!', 700); K.SND.bad(); } }
}
function end(scene, S, won) { K.SND.stopMusic(); won ? K.SND.win() : K.SND.lose();
  K.show(`<div class="sheet"><div class="split"><div><div class="kick">${won ? '12 May 1949' : 'The blockade'}</div><h2>${won ? 'Berlin is free!' : 'Berlin runs out of supplies'}</h2>
    <p>${won ? `You delivered <b>${S.tons}</b> crates and made Berlin's children smile <b>${S.smiles}</b> times.` : 'This time the city did not get enough supplies.'}</p>
    <p><b>What really happened:</b> The Soviets blocked West Berlin from 24 June 1948. The United States and Britain answered with an airlift that supplied the people of West Berlin with food and coal. At its height, a plane landed at Tempelhof every 45 seconds. On 12 May 1949 the Soviets lifted the blockade. The crisis deepened the division of Europe – and in 1949 Germany was split into two states.</p>
    <div class="row"><button class="btn" id="again" style="background:#1F3A6E;box-shadow:0 3px 0 #0E1E3E">Fly again</button></div><p class="small">Source: U.S. Department of State, Office of the Historian, “The Berlin Airlift, 1948–1949”.</p></div>
    <div><img src="img/tempelhof.jpg" alt=""><div class="cap">${CAP.tempelhof}</div></div></div></div>`);
  document.getElementById('again').onclick = () => { K.hide(); scene.scene.start('Title'); }; }

K.game([Boot, Title, Fly]);
})();
