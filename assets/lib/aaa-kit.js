// Shared helpers for the AAA games (sound, drawing, overlays, buttons). No data is sent anywhere.
(function () {
'use strict';
const W = 1280, H = 720, OUT = '#2A2018';
const K = window.KIT = { W, H, OUT };
K.esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\*(.+?)\*/g, '<i>$1</i>');
K.rnd = (a, b) => a + Math.random() * (b - a);
K.pick = a => a[Math.floor(Math.random() * a.length)];
K.shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
K.store = ns => ({ get(k) { try { return JSON.parse(localStorage.getItem(ns + '.' + k)); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(ns + '.' + k, JSON.stringify(v)); } catch (e) { } } });
const st = K.store('aaa');

K.SND = {
  ctx: null, on: st.get('sound') !== false, music: null,
  init() { if (this.ctx) return; try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); this.master = this.ctx.createGain(); this.master.gain.value = this.on ? .5 : 0; this.master.connect(this.ctx.destination); } catch (e) { } },
  toggle() { this.on = !this.on; st.set('sound', this.on); if (this.master) this.master.gain.value = this.on ? .5 : 0; return this.on; },
  tone(f, d, type = 'triangle', v = .2, t0 = 0, slide = 0) { if (!this.ctx) return; const c = this.ctx, t = c.currentTime + t0, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g); g.connect(this.master); o.start(t); o.stop(t + d + .05); },
  noise(d, v = .2, f = 1200, t0 = 0) { if (!this.ctx) return; const c = this.ctx, t = c.currentTime + t0, b = c.createBuffer(1, Math.floor(c.sampleRate * d), c.sampleRate), x = b.getChannelData(0); for (let i = 0; i < x.length; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / x.length); const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); fl.type = 'lowpass'; fl.frequency.value = f; g.gain.value = v; s.buffer = b; s.connect(fl); fl.connect(g); g.connect(this.master); s.start(t); },
  swish() { this.noise(.14, .14, 2600); }, hit() { this.noise(.08, .3, 900); this.tone(140, .1, 'square', .1, 0, -60); }, block() { this.tone(900, .08, 'square', .07); this.noise(.05, .1, 4000); },
  boom() { this.noise(.5, .5, 380); this.tone(70, .4, 'sine', .3, 0, -40); }, engine() { this.tone(90, .25, 'sawtooth', .04); },
  coin() { this.tone(1320, .08, 'sine', .12); this.tone(1760, .12, 'sine', .1, .06); }, click() { this.tone(330, .08, 'triangle', .12); this.tone(495, .1, 'triangle', .1, .04); },
  horn() { [220, 277, 330].forEach((f, i) => this.tone(f, 1.1, 'sawtooth', .05, i * .02)); }, lose() { this.tone(330, .4, 'triangle', .2, 0, -120); this.tone(220, .6, 'triangle', .2, .35, -80); },
  win() { [392, 494, 587, 784].forEach((f, i) => this.tone(f, .5, 'triangle', .18, i * .16)); }, good() { this.tone(660, .12, 'triangle', .15); this.tone(880, .18, 'triangle', .15, .1); }, bad() { this.tone(200, .3, 'square', .08, 0, -60); },
  special() { [330, 440, 660, 880].forEach((f, i) => this.tone(f, .25, 'sawtooth', .06, i * .05)); this.noise(.4, .25, 1500, .15); },
  startMusic(notes = [62, 65, 69, 67, 65, 64, 62, 57, 60, 62, 64, 65, 67, 65, 64, 60], ms = 380, wave = 'triangle') { if (!this.ctx || this.music) return; let i = 0; const f = m => 440 * Math.pow(2, (m - 69) / 12);
    this.music = setInterval(() => { if (!this.on) return; const n = notes[i % notes.length]; if (n) this.tone(f(n), ms / 700, wave, .045); if (i % 4 === 0 && n) this.tone(f(n - 24), ms / 240, 'sine', .04); i++; }, ms); },
  stopMusic() { clearInterval(this.music); this.music = null; }
};

// canvas drawing
K.cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
K.rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
K.stroke = (g, w = 3) => { g.lineWidth = w; g.strokeStyle = OUT; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); };
K.fillS = (g, c, w = 3) => { g.fillStyle = c; g.fill(); K.stroke(g, w); };
K.shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); const f = v => Math.max(0, Math.min(255, Math.round(v * k))); return '#' + [n >> 16, n >> 8 & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join(''); };
K.sky = (g, top, bottom, h = H) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(0, 0, W, h); };
K.hills = (g, y, col, amp, seed, w = W) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x / 140 + seed) * amp + Math.sin(x / 47 + seed * 2) * amp * .3); g.lineTo(w, H); g.closePath(); g.fill(); };
K.tex = (scene, key, canvas) => { if (!scene.textures.exists(key)) scene.textures.addCanvas(key, typeof canvas === 'function' ? canvas() : canvas); return key; };

// overlays (DOM, for text-heavy screens)
K.ov = () => document.getElementById('ov');
K.show = html => { const o = K.ov(); o.innerHTML = html; o.classList.add('on'); };
K.hide = () => { const o = K.ov(); o.classList.remove('on'); o.innerHTML = ''; };

// Phaser UI helpers
K.button = (scene, x, y, label, fn, w = 220, ghost, col = 0x8E1F2C) => {
  const c = scene.add.container(x, y).setDepth(60); const g = scene.add.graphics();
  const draw = hov => { g.clear(); g.fillStyle(0x000000, .35); g.fillRoundedRect(-w / 2, -23, w, 56, 8); g.fillStyle(ghost ? 0xF3E6C8 : (hov ? Phaser.Display.Color.ValueToColor(col).lighten(12).color : col), 1); g.fillRoundedRect(-w / 2, -28, w, 56, 8); g.lineStyle(3, 0x2A2018, 1); g.strokeRoundedRect(-w / 2, -28, w, 56, 8); };
  draw(); const t = scene.add.text(0, 0, label, { fontFamily: 'Inter, sans-serif', fontStyle: '800', fontSize: '22px', color: ghost ? '#2A2018' : '#FFFFFF' }).setOrigin(.5);
  c.add([g, t]); c.setSize(w, 56).setInteractive({ useHandCursor: true }).on('pointerover', () => draw(1)).on('pointerout', () => draw(0)).on('pointerdown', (p, lx, ly, ev) => { if (ev) ev.stopPropagation(); K.SND.init(); K.SND.click(); fn(); });
  return c;
};
K.chip = (scene, x, y, label, fn, originX = 1, originY = 0) => { const t = scene.add.text(x, y, label, { fontFamily: 'Inter, sans-serif', fontStyle: '700', fontSize: '16px', color: '#F3E6C8', backgroundColor: 'rgba(0,0,0,.4)', padding: { x: 10, y: 6 } }).setOrigin(originX, originY).setInteractive({ useHandCursor: true }).setDepth(70);
  t.on('pointerup', (p, lx, ly, ev) => { if (ev) ev.stopPropagation(); K.SND.init(); fn(t); }); return t; };
K.corner = (scene, bottom, extra, x0) => { // sound + full screen (+ optional extra chip)
  const y = bottom ? H - 12 : 14, oy = bottom ? 1 : 0; let x = x0 || W - 14;
  const s = K.chip(scene, x, y, K.SND.on ? '♪ sound on' : '♪ sound off', t => t.setText(K.SND.toggle() ? '♪ sound on' : '♪ sound off'), 1, oy); x -= s.width + 10;
  if (scene.scale.fullscreen.available) { const f = K.chip(scene, x, y, '⛶ full screen', () => scene.scale.isFullscreen ? scene.scale.stopFullscreen() : scene.scale.startFullscreen(), 1, oy); x -= f.width + 10; }
  if (extra) K.chip(scene, x, y, extra[0], extra[1], 1, oy);
};
K.game = (scenes, opts = {}) => {
  const g = new Phaser.Game(Object.assign({ type: /webgl/.test(location.search) ? Phaser.AUTO : Phaser.CANVAS, parent: 'game', width: W, height: H, backgroundColor: '#15110D', scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, fullscreenTarget: 'stage' }, scene: scenes }, opts));
  const refit = () => [50, 300, 800].forEach(t => setTimeout(() => g.scale && g.scale.refresh(), t));
  window.addEventListener('orientationchange', refit); window.addEventListener('resize', refit); if (window.visualViewport) window.visualViewport.addEventListener('resize', refit);
  return g;
};
K.fonts = (list) => (document.fonts && document.fonts.load ? Promise.all(list.map(f => document.fonts.load(f))) : Promise.resolve()).catch(() => { });
// Questions from questions.js: units = [n…]; returns a shuffled copy with options shuffled
K.question = (units) => { const QB = (window.AAA && window.AAA.units) || []; const pool = QB.filter(u => !units || units.includes(u.n)).flatMap(u => u.q); const q0 = K.pick(pool.length ? pool : QB.flatMap(u => u.q)); const idx = K.shuffle([0, 1, 2, 3]); return { q: q0.q, o: idx.map(i => q0.o[i]), a: idx.indexOf(q0.a), e: q0.e }; };
K.ask = (q, opts, done) => { // opts: {kick, okText, badText, button}
  K.show(`<div class="sheet"><div class="kick">${opts.kick || 'Question'}</div><div class="q">${K.esc(q.q)}</div><div class="opts">${q.o.map((o, j) => `<button class="opt" data-j="${j}"><i>${'ABCD'[j]}</i><span>${K.esc(o)}</span></button>`).join('')}</div><div id="fb"></div><div class="row"><button class="btn" id="cont" style="display:none">${opts.button || 'Continue'}</button></div></div>`);
  const ov = K.ov(), bs = [...ov.querySelectorAll('.opt')];
  bs.forEach(b => b.onclick = () => { if (bs[0].dataset.d) return; bs.forEach(x => x.dataset.d = 1); const j = +b.dataset.j, ok = j === q.a; bs[q.a].classList.add('ok'); if (!ok) b.classList.add('bad');
    ov.querySelector('#fb').innerHTML = `<div class="fb"><b>${ok ? opts.okText : opts.badText}</b><br>${K.esc(q.e)}</div>`; ok ? K.SND.good() : K.SND.bad();
    const c = ov.querySelector('#cont'); c.style.display = ''; c.focus(); c.onclick = () => { K.hide(); done(ok); }; });
};
})();
