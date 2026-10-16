// Race to 270 – AAA 5 class game. Runs fully in the browser; nothing is stored or sent anywhere.
(function () {
  const app = document.getElementById('app');
  const D = window.AAA;
  const md = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\*(.+?)\*/g, '<i>$1</i>');
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const COLORS = ['var(--t0)', 'var(--t1)', 'var(--t2)', 'var(--t3)'];
  const DEF_NAMES = ['Team Red', 'Team Blue', 'Team Green', 'Team Gold'];

  // Electoral votes 2024 & 2028 (National Archives, based on the 2020 Census). [code, name, EV, col, row]
  const STATES = [
    ['AK', 'Alaska', 3, 0, 0], ['ME', 'Maine', 4, 11, 0],
    ['WI', 'Wisconsin', 10, 6, 1], ['VT', 'Vermont', 3, 10, 1], ['NH', 'New Hampshire', 4, 11, 1],
    ['WA', 'Washington', 12, 1, 2], ['ID', 'Idaho', 4, 2, 2], ['MT', 'Montana', 4, 3, 2], ['ND', 'North Dakota', 3, 4, 2], ['MN', 'Minnesota', 10, 5, 2], ['IL', 'Illinois', 19, 6, 2], ['MI', 'Michigan', 15, 7, 2], ['NY', 'New York', 28, 9, 2], ['MA', 'Massachusetts', 11, 10, 2],
    ['OR', 'Oregon', 8, 1, 3], ['NV', 'Nevada', 6, 2, 3], ['WY', 'Wyoming', 3, 3, 3], ['SD', 'South Dakota', 3, 4, 3], ['IA', 'Iowa', 6, 5, 3], ['IN', 'Indiana', 11, 6, 3], ['OH', 'Ohio', 17, 7, 3], ['PA', 'Pennsylvania', 19, 8, 3], ['NJ', 'New Jersey', 14, 9, 3], ['CT', 'Connecticut', 7, 10, 3], ['RI', 'Rhode Island', 4, 11, 3],
    ['CA', 'California', 54, 1, 4], ['UT', 'Utah', 6, 2, 4], ['CO', 'Colorado', 10, 3, 4], ['NE', 'Nebraska', 5, 4, 4], ['MO', 'Missouri', 10, 5, 4], ['KY', 'Kentucky', 8, 6, 4], ['WV', 'West Virginia', 4, 7, 4], ['VA', 'Virginia', 13, 8, 4], ['MD', 'Maryland', 10, 9, 4], ['DE', 'Delaware', 3, 10, 4],
    ['AZ', 'Arizona', 11, 2, 5], ['NM', 'New Mexico', 5, 3, 5], ['KS', 'Kansas', 6, 4, 5], ['AR', 'Arkansas', 6, 5, 5], ['TN', 'Tennessee', 11, 6, 5], ['NC', 'North Carolina', 16, 7, 5], ['SC', 'South Carolina', 9, 8, 5], ['DC', 'District of Columbia', 3, 9, 5],
    ['OK', 'Oklahoma', 7, 4, 6], ['LA', 'Louisiana', 8, 5, 6], ['MS', 'Mississippi', 6, 6, 6], ['AL', 'Alabama', 9, 7, 6], ['GA', 'Georgia', 16, 8, 6],
    ['HI', 'Hawaii', 4, 0, 7], ['TX', 'Texas', 40, 4, 7], ['FL', 'Florida', 30, 9, 7]
  ];
  const EV = Object.fromEntries(STATES.map(s => [s[0], s[2]]));
  const NAME = Object.fromEntries(STATES.map(s => [s[0], s[1]]));
  const THR = c => { const e = EV[c]; return e <= 5 ? 1 : e <= 10 ? 2 : e <= 19 ? 3 : e <= 30 ? 4 : 5; };
  const RUST = ['PA', 'MI', 'WI'], SUN = ['AZ', 'NV', 'GA', 'NC'];

  const EVENTS = [
    { t: 'TV debate', p: 'The candidates meet in a televised debate. Answer a bonus question after your normal question: if you are right, you get $3M more.', why: 'Since Kennedy and Nixon in 1960, TV debates have been major events of every campaign.', fx: { bonusQ: 1 } },
    { t: 'Fundraising dinner', p: 'Supporters pay for a big dinner. You get $2M.', why: 'American campaigns are financed by donations, so fundraising is a full-time job.', fx: { money: 2 } },
    { t: 'Scandal in the press', p: 'A newspaper publishes an embarrassing story about your campaign. You lose $2M.', why: 'Investigative journalism controls the powerful – remember Watergate (Unit 1).', fx: { money: -2 } },
    { t: 'Viral video', p: 'Your campaign video goes viral on social media. Place 2 free influence points in any one or two states.', why: 'About half of American adults at least sometimes get news from social media (Pew Research Center, 2025).', fx: { free: 2 } },
    { t: 'Rust Belt rally', p: 'A huge rally in an old industrial city. Place 2 free influence points in Pennsylvania, Michigan or Wisconsin.', why: 'The “Rust Belt” states, where many factories closed, are often decisive in close elections.', fx: { free: 2, only: RUST } },
    { t: 'Sun Belt tour', p: 'A bus tour through the fast-growing South and West. Place 2 free influence points in Arizona, Nevada, Georgia or North Carolina.', why: 'Swing states, where both sides can win, get most of the candidates\' time and money.', fx: { free: 2, only: SUN } },
    { t: 'Fake news attack', p: 'A false story about you spreads online. You lose 1 influence point in your strongest state.', why: 'Disinformation is false information spread on purpose (Unit 5). Check sources before you share.', fx: { lose: 1 } },
    { t: 'Newspaper endorsement', p: 'A big newspaper writes an editorial supporting you. You get $1M and 1 free influence point.', why: 'An editorial expresses the opinion of the newspaper itself (Unit 5).', fx: { money: 1, free: 1 } },
    { t: 'Cable news interview', p: 'You appear on a 24-hour news channel. You get $1M.', why: 'CNN started the first 24-hour cable news channel in 1980 (Unit 5).', fx: { money: 1 } },
    { t: 'Quiet day', p: 'Nothing special happens today. Concentrate on your campaign.', why: 'The presidential election takes place on the Tuesday after the first Monday in November.', fx: {} },
    { t: 'Primary momentum', p: 'You win an important primary. Place 1 free influence point anywhere.', why: 'Before the election, each party chooses its candidate in primaries and caucuses (Unit 3).', fx: { free: 1 } },
    { t: 'Campaign mistake', p: 'Your candidate forgets the name of a state capital on live TV. You lose $1M.', why: 'Every word a candidate says can be filmed and shared within minutes.', fx: { money: -1 } }
  ];


  const S = window.KIT ? KIT.SND : { init() { }, click() { }, good() { }, bad() { }, coin() { }, win() { }, horn() { }, tone() { } };
  const TEAMC = ['#E5383B', '#2F7DEB', '#22B07D', '#F2A516'];
  let G = null, sel = null;

  // ---------- set-up ----------
  function setup() {
    const cfg = { n: 2, names: DEF_NAMES.slice(), rounds: 8, units: new Set(D.units.map(u => u.n)) };
    const draw = () => {
      app.innerHTML = `<section class="studio">
        <div class="onair"><i></i> Live · Election special</div>
        <h1 class="logo">Race to <span>270</span></h1>
        <p class="sub">You run the campaign of a presidential candidate. Win the states, collect electoral votes and be the first to reach <b>270 of 538</b>.</p>
        <div class="how">
          <div class="step"><b>1</b><h4>Breaking news</h4><p>Every turn starts with a campaign event – money, free rallies, a scandal…</p></div>
          <div class="step"><b>2</b><h4>The debate</h4><p>Answer a question from AAA 5. Right answer = <strong>$5M</strong> (a streak of 3 = $6M). Wrong = $2M.</p></div>
          <div class="step"><b>3</b><h4>On the trail</h4><p>Spend $1M for one rally in a state. Enough rallies <i>and</i> more than every rival = the state is yours.</p></div>
          <div class="step"><b>4</b><h4>Winner takes all</h4><p>The team that wins a state gets <i>all</i> its electoral votes. Rivals can take a state back!</p></div>
        </div>
        <div class="cfg">
          <div class="row3"><span class="lab">Teams</span><div class="seg" id="nt">${[1, 2, 3, 4].map(k => `<button data-k="${k}" class="${cfg.n === k ? 'on' : ''}">${k === 1 ? '1 vs computer' : k}</button>`).join('')}</div></div>
          <div class="names">${Array.from({ length: cfg.n }, (_, i) => `<label style="--c:${TEAMC[i]}"><i></i><input type="text" data-i="${i}" value="${md(cfg.names[i])}" maxlength="18"></label>`).join('')}</div>
          <div class="row3"><span class="lab">Rounds</span><div class="seg" id="nr">${[6, 8, 10, 12].map(k => `<button data-k="${k}" class="${cfg.rounds === k ? 'on' : ''}">${k}</button>`).join('')}</div></div>
          <div class="row3"><span class="lab">Units</span><div class="seg" id="nu">${D.units.map(u => `<button data-k="${u.n}" class="${cfg.units.has(u.n) ? 'on' : ''}" title="${md(u.name)}">${u.n}</button>`).join('')}</div></div>
          <p class="note">Small states (3–5 votes) need 1 rally · 6–10 votes: 2 · 11–19: 3 · 20–30: 4 · California and Texas: 5. One round = one turn for every team; 8 rounds ≈ 30 minutes.</p>
          <button class="go" id="go">Start the campaign ▸</button>
        </div></section>`;
      app.querySelectorAll('#nt button').forEach(b => b.onclick = () => { save(); cfg.n = +b.dataset.k; draw(); });
      app.querySelectorAll('#nr button').forEach(b => b.onclick = () => { save(); cfg.rounds = +b.dataset.k; draw(); });
      app.querySelectorAll('#nu button').forEach(b => b.onclick = () => { save(); const k = +b.dataset.k; if (cfg.units.has(k)) { if (cfg.units.size > 1) cfg.units.delete(k); } else cfg.units.add(k); draw(); });
      app.querySelector('#go').onclick = () => { save(); S.init(); S.horn(); start(cfg); };
    };
    const save = () => app.querySelectorAll('input[data-i]').forEach(i => cfg.names[+i.dataset.i] = i.value.trim() || DEF_NAMES[+i.dataset.i]);
    draw();
  }
  function start(cfg) {
    const teams = [];
    for (let i = 0; i < cfg.n; i++) teams.push({ name: cfg.names[i], color: TEAMC[i], money: 0, streak: 0, cpu: false });
    if (cfg.n === 1) teams.push({ name: 'Computer', color: TEAMC[1], money: 0, streak: 0, cpu: true });
    const pool = D.units.filter(u => cfg.units.has(u.n)).flatMap(u => u.q.map(q => Object.assign({ unit: u.n }, q)));
    G = { teams, rounds: cfg.rounds, round: 1, cur: 0, infl: Object.fromEntries(STATES.map(s => [s[0], teams.map(() => 0)])), pool, deck: [], qdeck: [], ticker: ['Polls are open in all 50 states and D.C.', 'A candidate needs 270 of the 538 electoral votes to win.'] };
    sel = null; turnStart();
  }

  const owner = c => { const v = G.infl[c]; let best = -1, bi = -1, second = -1; v.forEach((x, i) => { if (x > best) { second = best; best = x; bi = i; } else if (x > second) second = x; }); return best >= THR(c) && best > second ? bi : -1; };
  const leader = c => { const v = G.infl[c], m = Math.max(...v); return m > 0 && v.filter(x => x === m).length === 1 ? v.indexOf(m) : -1; };
  const evOf = i => STATES.reduce((n, s) => n + (owner(s[0]) === i ? s[2] : 0), 0);
  const nextQ = () => { if (!G.qdeck.length) G.qdeck = shuffle(G.pool); const q = G.qdeck.pop(); const idx = shuffle([0, 1, 2, 3]); return Object.assign({}, q, { o: idx.map(i => q.o[i]), a: idx.indexOf(q.a) }); };
  const nextE = () => { if (!G.deck.length) G.deck = shuffle(EVENTS); return G.deck.pop(); };
  const need = c => { const v = G.infl[c], i = G.cur, other = Math.max(0, ...v.filter((_, k) => k !== i)); return Math.max(THR(c) - v[i], other + 1 - v[i], 1); };
  const say = t => { G.ticker.unshift(t); G.ticker = G.ticker.slice(0, 8); };

  function turnStart() {
    const T = G.teams[G.cur];
    G.turn = { ev: nextE(), free: 0, only: null, placed: [], phase: 'event', bonus: 0 };
    if (T.cpu) return cpuTurn();
    render(); S.tone(880, .12, 'square', .05); S.tone(660, .2, 'square', .05, .12);
  }
  function applyEvent(T) {
    const fx = G.turn.ev.fx, i = G.cur;
    if (fx.money) T.money = Math.max(0, T.money + fx.money);
    if (fx.free) { G.turn.free = fx.free; G.turn.only = fx.only || null; }
    if (fx.bonusQ) G.turn.bonus = 1;
    if (fx.lose) { let best = null; STATES.forEach(s => { const v = G.infl[s[0]][i]; if (v > 0 && (!best || EV[s[0]] * 100 + v > EV[best] * 100 + G.infl[best][i])) best = s[0]; }); if (best) { G.infl[best][i]--; G.turn.lost = best; } }
  }

  // ---------- hex map ----------
  function mapSVG(clickable) {
    const R = 30, w = Math.sqrt(3) * R, h = 1.5 * R, pts = [...Array(6)].map((_, k) => { const a = Math.PI / 180 * (60 * k - 30); return [R * Math.cos(a), R * Math.sin(a)]; });
    const poly = pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
    let out = `<svg class="hex" viewBox="${-w * .6} ${-R * 1.1} ${12.6 * w} ${7 * h + R * 2.3}" role="img" aria-label="Map of the United States">`;
    STATES.forEach(([c, n, e, col, row]) => {
      const x = col * w + (row % 2 ? w / 2 : 0), y = row * h, o = owner(c), l = leader(c), v = G.infl[c];
      const allowed = clickable && (G.turn.free > 0 && (!G.turn.only || G.turn.only.includes(c)) || G.teams[G.cur].money > 0);
      const fill = o >= 0 ? G.teams[o].color : l >= 0 ? G.teams[l].color : '#22314F';
      const hl = G.turn && G.turn.only && G.turn.free > 0 && G.turn.only.includes(c);
      out += `<g class="h ${o >= 0 ? 'own' : l >= 0 ? 'lean' : ''} ${sel === c ? 'sel' : ''} ${allowed ? 'can' : ''} ${hl ? 'hl' : ''}" data-c="${c}" transform="translate(${x.toFixed(1)},${y.toFixed(1)})" tabindex="${allowed ? 0 : -1}">
        <title>${n}: ${e} electoral votes</title>
        <polygon points="${poly}" style="fill:${fill}" />
        <text class="ev" y="2">${e}</text><text class="cd" y="15">${c}</text>
        <g class="pips">${v.map((x, k) => x ? `<circle cx="${(k - (v.length - 1) / 2) * 9}" cy="-17" r="${3 + Math.min(x, 5) * .5}" style="fill:${G.teams[k].color}"/>` : '').join('')}</g></g>`;
    });
    return out + '</svg>';
  }
  function board() {
    const T = G.teams;
    const bars = T.map((t, i) => { const e = evOf(i); return `<div class="cand ${i === G.cur ? 'now' : ''}" style="--c:${t.color}"><span class="nm">${md(t.name)}${t.cpu ? ' 🤖' : ''}</span><span class="num">${e}</span><span class="cash">$${t.money}M</span></div>`; }).join('');
    const seg = T.map((t, i) => `<i style="width:${evOf(i) / 538 * 100}%;background:${t.color}"></i>`).join('');
    return `<div class="board">${bars}</div><div class="bar270"><div class="fillx">${seg}</div><b style="left:${270 / 538 * 100}%"></b><span style="left:${270 / 538 * 100}%">270 to win</span></div>`;
  }
  function ticker() { const t = G.ticker.join('   ●   '); return `<div class="ticker"><b>Latest</b><div><span>${t}   ●   ${t}</span></div></div>`; }
  function stateInfo() {
    if (!sel) return `<p class="tip">Tap a state on the map to see who leads there and what you need to win it.</p>`;
    const c = sel, v = G.infl[c], o = owner(c), T = G.teams[G.cur], can = G.turn.phase === 'camp' && (G.turn.free > 0 && (!G.turn.only || G.turn.only.includes(c)) || T.money > 0);
    const freeHere = G.turn.free > 0 && (!G.turn.only || G.turn.only.includes(c));
    return `<div class="sinfo"><div class="sh"><b>${NAME[c]}</b><span>${EV[c]} votes</span></div>
      <p>Needs <b>${THR(c)}</b> rall${THR(c) > 1 ? 'ies' : 'y'} to win · ${o >= 0 ? `won by <b style="color:${G.teams[o].color}">${md(G.teams[o].name)}</b>` : 'nobody has won it yet'}</p>
      <div class="infl">${G.teams.map((t, k) => `<span style="--c:${t.color}"><i></i>${md(t.name)}: <b>${v[k]}</b></span>`).join('')}</div>
      ${G.turn.phase === 'camp' ? `<p class="small">${o === G.cur ? 'You hold this state. One more rally makes it safer.' : `You need <b>${need(c)}</b> more rall${need(c) > 1 ? 'ies' : 'y'} to win it.`}</p>
      <button class="go sm" id="rally" ${can ? '' : 'disabled'}>${freeHere ? 'Free rally here' : 'Hold a rally here · $1M'}</button>` : ''}</div>`;
  }

  // ---------- turn panels ----------
  function render() {
    const T = G.teams[G.cur], tu = G.turn;
    const steps = ['Breaking news', 'The debate', 'On the trail'], si = tu.phase === 'event' ? 0 : tu.phase === 'camp' ? 2 : 1;
    let panel = '';
    if (tu.phase === 'event') panel = `<div class="breaking"><div class="bk">Breaking news</div><h3>${md(tu.ev.t)}</h3><p>${md(tu.ev.p)}</p><p class="why">ⓘ ${md(tu.ev.why)}</p><button class="go" id="ok">Go to the debate ▸</button></div>`;
    else if (tu.phase === 'q' || tu.phase === 'bq') {
      const q = tu.q;
      panel = `<div class="debate"><div class="bk blue">${tu.phase === 'bq' ? 'Bonus question · TV debate' : 'The debate'} · Unit ${q.unit}</div><h3>${md(q.q)}</h3>
        <div class="ans">${q.o.map((o, j) => `<button class="a" data-j="${j}"><b>${'ABCD'[j]}</b>${md(o)}</button>`).join('')}</div><div id="fb"></div>
        <button class="go" id="ok" style="display:none">${tu.bonus && tu.phase === 'q' ? 'Bonus question ▸' : 'Hit the campaign trail ▸'}</button></div>`;
    } else panel = `<div class="trail"><div class="bk green">On the campaign trail</div>
        <p class="big">$${T.money}M${tu.free ? ` <small>+ ${tu.free} free rall${tu.free > 1 ? 'ies' : 'y'}${tu.only ? ' in ' + tu.only.map(c => NAME[c]).join(', ') : ''}</small>` : ''}</p>
        ${stateInfo()}
        <p class="small">Money you don't spend is saved for your next turn.</p>
        <div class="btns"><button class="go ghost sm" id="undo" ${tu.placed.length ? '' : 'disabled'}>↶ Undo</button><button class="go sm" id="end">End turn ▸</button></div></div>`;
    app.innerHTML = `<div class="top"><div class="onair"><i></i> Live</div><div class="rd">Round ${G.round} / ${G.rounds}</div><div class="who" style="--c:${T.color}">${md(T.name)}'s turn</div></div>
      ${board()}
      <div class="main"><div class="mapw">${mapSVG(tu.phase === 'camp')}<div class="legend"><span><i class="lg own"></i>won</span><span><i class="lg lean"></i>leading, not won yet</span><span>● rallies of each team</span><span>number = electoral votes</span></div></div>
      <div class="panel"><div class="steps">${steps.map((s, k) => `<span class="${k === si ? 'on' : k < si ? 'done' : ''}">${k + 1} ${s}</span>`).join('')}</div>${panel}</div></div>${ticker()}`;
    wire();
  }
  function rally(c) {
    const T = G.teams[G.cur], tu = G.turn; let kind;
    if (tu.free > 0 && (!tu.only || tu.only.includes(c))) { tu.free--; kind = 'free'; }
    else if (T.money > 0) { T.money--; kind = 'money'; } else return;
    const before = owner(c); G.infl[c][G.cur]++; tu.placed.push([c, kind]);
    const after = owner(c);
    if (after === G.cur && before !== G.cur) { say(`PROJECTION: ${T.name} wins ${NAME[c]} (${EV[c]} votes)${before >= 0 ? ' – taken from ' + G.teams[before].name : ''}`); S.win(); }
    else S.coin();
    render();
    const g = app.querySelector(`.h[data-c="${c}"]`); if (g) g.classList.add('pop');
  }
  function wire() {
    const T = G.teams[G.cur], tu = G.turn, ok = app.querySelector('#ok');
    if (tu.phase === 'event') ok.onclick = () => { S.click(); applyEvent(T); if (tu.lost) say(`Fake news: ${T.name} loses a rally in ${NAME[tu.lost]}`); tu.phase = 'q'; tu.q = nextQ(); render(); };
    if (tu.phase === 'q' || tu.phase === 'bq') {
      const opts = [...app.querySelectorAll('.a')];
      opts.forEach(b => b.onclick = () => {
        if (opts[0].dataset.done) return; opts.forEach(x => { x.disabled = true; x.dataset.done = 1; });
        const j = +b.dataset.j, q = tu.q, right = j === q.a; let gain;
        opts[q.a].classList.add('ok'); if (!right) b.classList.add('bad');
        if (tu.phase === 'q') { T.streak = right ? T.streak + 1 : 0; gain = right ? 5 + (T.streak >= 3 ? 1 : 0) : 2; } else gain = right ? 3 : 0;
        T.money += gain; right ? S.good() : S.bad();
        app.querySelector('#fb').innerHTML = `<div class="fb ${right ? 'y' : 'n'}"><b>${right ? 'Correct!' : 'Not quite.'} +$${gain}M${right && tu.phase === 'q' && T.streak >= 3 ? ' · streak bonus!' : ''}</b> ${md(q.e)}</div>`;
        app.querySelectorAll('.cand .cash')[G.cur].textContent = '$' + T.money + 'M';
        ok.style.display = ''; ok.focus();
      });
      ok.onclick = () => { S.click(); if (tu.phase === 'q' && tu.bonus) { tu.phase = 'bq'; tu.bonus = 0; tu.q = nextQ(); } else tu.phase = 'camp'; render(); };
    }
    app.querySelectorAll('.h').forEach(g => {
      g.onclick = () => { sel = g.dataset.c; S.tone(520, .05, 'sine', .08); if (tu.phase === 'camp') render(); else { const p = app.querySelector('.h.sel'); if (p) p.classList.remove('sel'); g.classList.add('sel'); } };
      g.ondblclick = () => { if (tu.phase === 'camp' && g.classList.contains('can')) rally(g.dataset.c); };
      g.onkeydown = e => { if (e.key === 'Enter' && tu.phase === 'camp') { sel = g.dataset.c; rally(sel); } };
    });
    if (tu.phase === 'camp') {
      const r = app.querySelector('#rally'); if (r) r.onclick = () => rally(sel);
      app.querySelector('#undo').onclick = () => { const p = tu.placed.pop(); if (!p) return; G.infl[p[0]][G.cur]--; if (p[1] === 'free') tu.free++; else T.money++; render(); };
      app.querySelector('#end').onclick = () => { S.click(); endTurn(); };
    }
  }
  function endTurn() {
    if (G.teams.some((t, i) => evOf(i) >= 270)) return finish();
    G.cur++; if (G.cur >= G.teams.length) { G.cur = 0; G.round++; }
    if (G.round > G.rounds) return finish();
    sel = null; turnStart();
  }
  function cpuTurn() {
    const T = G.teams[G.cur], i = G.cur, tu = G.turn;
    applyEvent(T);
    const right = Math.random() < 0.65; T.streak = right ? T.streak + 1 : 0; T.money += right ? 5 + (T.streak >= 3 ? 1 : 0) : 2;
    if (tu.bonus && Math.random() < 0.6) T.money += 3;
    const won = [];
    const cost = c => { const v = G.infl[c], mine = v[i], other = Math.max(...v.filter((_, k) => k !== i)); return Math.max(THR(c) - mine, other + 1 - mine, 0); };
    const place = (c, free) => { const before = owner(c); G.infl[c][i]++; if (!free) T.money--; if (owner(c) === i && before !== i) won.push(NAME[c]); };
    while (tu.free > 0) { const o = STATES.map(s => s[0]).filter(c => !tu.only || tu.only.includes(c)); const best = o.sort((a, b) => EV[b] / Math.max(1, cost(b)) - EV[a] / Math.max(1, cost(a)))[0]; place(best, true); tu.free--; }
    for (let guard = 0; guard < 40 && T.money > 0; guard++) {
      const cands = STATES.map(s => s[0]).filter(c => owner(c) !== i || G.infl[c][i] - Math.max(...G.infl[c].filter((_, k) => k !== i)) <= 0).map(c => [c, cost(c)]).filter(([c, k]) => k > 0 && k <= T.money);
      if (!cands.length) break;
      cands.sort((a, b) => EV[b[0]] / b[1] - EV[a[0]] / a[1] + (Math.random() - 0.5) * 0.6);
      const [c, k] = cands[0]; for (let n = 0; n < k; n++) place(c, false);
      if (Math.random() < 0.25) break;
    }
    say(`Computer: ${tu.ev.t}; answered ${right ? 'correctly' : 'wrongly'}${won.length ? '; wins ' + won.join(', ') : ''}`);
    G.turn.phase = 'cpu';
    app.innerHTML = `<div class="top"><div class="onair"><i></i> Live</div><div class="rd">Round ${G.round} / ${G.rounds}</div><div class="who" style="--c:${T.color}">Computer's turn</div></div>${board()}
      <div class="main"><div class="mapw">${mapSVG(false)}</div><div class="panel"><div class="breaking"><div class="bk">Computer's campaign</div><h3>${md(tu.ev.t)}</h3><p>The computer answered ${right ? 'correctly' : 'wrongly'}${won.length ? ' and won <b>' + won.join(', ') + '</b>' : ' and campaigned in several states'}.</p><button class="go" id="ok">Your turn ▸</button></div></div></div>${ticker()}`;
    app.querySelector('#ok').onclick = () => { S.click(); endTurn(); };
  }
  function finish() {
    const res = G.teams.map((t, i) => ({ t, e: evOf(i), s: STATES.filter(s => owner(s[0]) === i).length })).sort((a, b) => b.e - a.e);
    const tie = res.length > 1 && res[0].e === res[1].e, w = res[0];
    S.win(); setTimeout(() => S.horn(), 700);
    app.innerHTML = `<div class="top"><div class="onair"><i></i> Live</div><div class="rd">Election night</div></div>${board()}
      <div class="main"><div class="mapw">${mapSVG(false)}</div><div class="panel"><div class="result" style="--c:${tie ? '#8899BB' : w.t.color}">
      <div class="bk">${tie ? 'Too close to call' : 'Projected winner'}</div><h2>${tie ? 'A tie!' : md(w.t.name)}</h2>
      <p>${tie ? 'In a real election, if no candidate gets 270, the House of Representatives chooses the President.' : w.e >= 270 ? 'reaches 270 electoral votes and wins the presidency!' : 'has the most electoral votes – but nobody reached 270. In a real election the House of Representatives would choose the President.'}</p>
      <table>${res.map(r => `<tr><td><i style="background:${r.t.color}"></i>${md(r.t.name)}</td><td>${r.s} state${r.s === 1 ? '' : 's'}</td><td><b>${r.e}</b></td></tr>`).join('')}</table>
      <p class="why">Talk about it: Did you win the most states or the biggest ones? Why do candidates spend so much time in swing states? Is “winner takes all” fair?</p>
      <div class="btns"><button class="go" id="again">Play again</button><a class="go ghost" href="../">AAA 5 games</a></div></div></div></div>`;
    app.querySelector('#again').onclick = setup;
  }
  setup();
})();
