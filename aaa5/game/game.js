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

  let G = null;

  function setup() {
    const units = D.units.map(u => u.n);
    const cfg = { n: 2, names: DEF_NAMES.slice(), rounds: 8, units: new Set(units) };
    const draw = () => {
      app.innerHTML = `<div class="hero"><div class="kick">AAA 5 · class game</div><h1>Race to 270</h1><p>You are campaign teams in an American presidential election. Answer questions from AAA 5 to raise money, spend it on campaigning in the states and win their electoral votes. The first team to reach <b>270 electoral votes</b> wins – or the team with the most votes when time runs out.</p></div>
      <div class="setup">
        <div class="panel"><h3>Set up the game</h3>
          <div class="field"><label>Teams</label><div class="seg" id="nt">${[1, 2, 3, 4].map(k => `<button data-k="${k}" class="${cfg.n === k ? 'on' : ''}">${k === 1 ? '1 (vs computer)' : k}</button>`).join('')}</div></div>
          ${Array.from({ length: Math.max(cfg.n, 1) }, (_, i) => `<div class="field"><label><span class="chip" style="background:${COLORS[i]}"></span> Team ${i + 1}</label><input type="text" data-i="${i}" value="${md(cfg.names[i])}" maxlength="20"></div>`).join('')}
          <div class="field"><label>Rounds</label><div class="seg" id="nr">${[6, 8, 10, 12].map(k => `<button data-k="${k}" class="${cfg.rounds === k ? 'on' : ''}">${k}</button>`).join('')}</div></div>
          <div class="field"><label>Units</label><div class="seg" id="nu">${D.units.map(u => `<button data-k="${u.n}" class="${cfg.units.has(u.n) ? 'on' : ''}" title="${md(u.name)}">${u.n}</button>`).join('')}</div></div>
          <p class="small">One round = one turn for every team. 8 rounds take about 30–35 minutes with two teams.</p>
          <div class="row"><button class="btn" id="go">Start the campaign</button></div>
        </div>
        <div class="panel"><h3>How to play</h3><ol>
          <li><b>Event.</b> Each turn starts with a campaign event: good news, bad news or a chance.</li>
          <li><b>Question.</b> Answer a question from AAA 5. Correct: <b>$5M</b> (+$1M for a streak of three). Wrong: only $2M.</li>
          <li><b>Campaign.</b> Click a state to put $1M = 1 influence point there. You can spread your money or save it.</li>
          <li><b>Win states.</b> Small states (3–5 votes) need 1 point, then 2, 3, 4 – California and Texas need 5. You win a state when you have enough points <i>and</i> more than every other team. Others can take it from you!</li>
          <li><b>Winner takes all.</b> The team that wins a state gets all its electoral votes – as in 48 real states and D.C.</li>
        </ol>
        <h3 style="margin-top:14px">Strategy tip</h3><p>Big states are worth a lot but are expensive and easy to attack. Small states are cheap. Do you defend, attack or save?</p></div>
      </div>`;
      app.querySelectorAll('#nt button').forEach(b => b.onclick = () => { save(); cfg.n = +b.dataset.k; draw(); });
      app.querySelectorAll('#nr button').forEach(b => b.onclick = () => { save(); cfg.rounds = +b.dataset.k; draw(); });
      app.querySelectorAll('#nu button').forEach(b => b.onclick = () => { save(); const k = +b.dataset.k; if (cfg.units.has(k)) { if (cfg.units.size > 1) cfg.units.delete(k); } else cfg.units.add(k); draw(); });
      app.querySelector('#go').onclick = () => { save(); start(cfg); };
    };
    const save = () => app.querySelectorAll('input[data-i]').forEach(i => cfg.names[+i.dataset.i] = i.value.trim() || DEF_NAMES[+i.dataset.i]);
    draw();
  }

  function start(cfg) {
    const teams = [];
    for (let i = 0; i < cfg.n; i++) teams.push({ name: cfg.names[i], color: COLORS[i], money: 0, streak: 0, cpu: false });
    if (cfg.n === 1) teams.push({ name: 'Computer', color: COLORS[1], money: 0, streak: 0, cpu: true });
    const pool = D.units.filter(u => cfg.units.has(u.n)).flatMap(u => u.q.map(q => Object.assign({ unit: u.n }, q)));
    G = { teams, rounds: cfg.rounds, round: 1, cur: 0, infl: Object.fromEntries(STATES.map(s => [s[0], teams.map(() => 0)])), pool, deck: [], qdeck: [], log: '', units: cfg.units };
    turnStart();
  }

  const owner = c => { const v = G.infl[c]; let best = -1, bi = -1, second = -1; v.forEach((x, i) => { if (x > best) { second = best; best = x; bi = i; } else if (x > second) second = x; }); return best >= THR(c) && best > second ? bi : -1; };
  const evOf = i => STATES.reduce((n, s) => n + (owner(s[0]) === i ? s[2] : 0), 0);
  const nextQ = () => { if (!G.qdeck.length) G.qdeck = shuffle(G.pool); const q = G.qdeck.pop(); const idx = shuffle([0, 1, 2, 3]); return Object.assign({}, q, { o: idx.map(i => q.o[i]), a: idx.indexOf(q.a) }); };
  const nextE = () => { if (!G.deck.length) G.deck = shuffle(EVENTS); return G.deck.pop(); };

  function turnStart() {
    const T = G.teams[G.cur];
    G.turn = { ev: nextE(), free: 0, only: null, placed: [], phase: 'event', bonus: 0 };
    if (T.cpu) return cpuTurn();
    render();
  }

  function applyEvent(T) {
    const fx = G.turn.ev.fx, i = G.cur;
    if (fx.money) T.money = Math.max(0, T.money + fx.money);
    if (fx.free) { G.turn.free = fx.free; G.turn.only = fx.only || null; }
    if (fx.bonusQ) G.turn.bonus = 1;
    if (fx.lose) { let best = null; STATES.forEach(s => { const v = G.infl[s[0]][i]; if (v > 0 && (!best || EV[s[0]] * 100 + v > EV[best] * 100 + G.infl[best][i])) best = s[0]; }); if (best) { G.infl[best][i]--; G.turn.lost = best; } }
  }

  function mapHTML(clickable) {
    const tiles = Array(96).fill('<div></div>');
    STATES.forEach(([c, n, e, col, row]) => {
      const o = owner(c), v = G.infl[c];
      const allowed = clickable && (G.turn.free > 0 && (!G.turn.only || G.turn.only.includes(c)) || G.teams[G.cur].money > 0);
      tiles[row * 12 + col] = `<button class="st ${o >= 0 ? 'own' : ''}" data-c="${c}" ${allowed ? '' : 'disabled'} style="${o >= 0 ? `background:${G.teams[o].color}` : ''}${G.turn.only && G.turn.only.includes(c) && G.turn.free > 0 ? ';border-color:var(--gold);border-width:3px' : ''}" title="${n}: ${e} electoral votes · needs ${THR(c)} point${THR(c) > 1 ? 's' : ''}${v.some(x => x) ? ' · influence: ' + G.teams.map((t, i) => t.name + ' ' + v[i]).join(', ') : ''}"><b>${c}</b><small>${e}</small><span class="dots">${v.map((x, i) => x ? `<i style="background:${G.teams[i].color};${o === i ? 'box-shadow:0 0 0 1px #fff' : ''}">${x}</i>` : '').join('')}</span></button>`;
    });
    return `<div class="map">${tiles.join('')}</div><div class="legend"><span>Number = electoral votes</span><span>Coloured numbers = influence points of each team</span><span>Hover or long-press a state for details</span></div>`;
  }

  function scoreHTML() {
    return `<div class="card"><div class="k">Round ${Math.min(G.round, G.rounds)} of ${G.rounds} · electoral votes</div><div class="score" style="margin-top:8px">${G.teams.map((t, i) => { const e = evOf(i); return `<div class="row2"><span style="font-weight:${i === G.cur ? 800 : 500}"><span class="chip" style="background:${t.color}"></span> ${md(t.name)}</span><div class="trk"><i style="width:${Math.min(100, e / 538 * 100)}%;background:${t.color}"></i><span class="mark" style="left:${270 / 538 * 100}%"></span></div><b>${e}</b></div>`; }).join('')}</div><p class="small" style="margin-top:6px">The line marks 270 – more than half of the 538 electoral votes.</p></div>`;
  }

  function render() {
    const T = G.teams[G.cur], tu = G.turn;
    let panel = '';
    if (tu.phase === 'event') {
      panel = `<div class="card"><div class="k">Campaign event</div><h4>${md(tu.ev.t)}</h4><p>${md(tu.ev.p)}</p><p class="why">${md(tu.ev.why)}</p><div class="row"><button class="btn" id="ok">OK – next: the question</button></div></div>`;
    } else if (tu.phase === 'q' || tu.phase === 'bq') {
      const q = tu.q;
      panel = `<div class="card"><div class="k">${tu.phase === 'bq' ? 'Bonus question (TV debate)' : 'Question'} · Unit ${q.unit}</div><div class="qq">${md(q.q)}</div><div class="opts">${q.o.map((o, j) => `<button class="opt" data-j="${j}"><span class="l">${'ABCD'[j]}</span><span>${md(o)}</span></button>`).join('')}</div><div id="fb"></div><div class="row"><button class="btn" id="ok" style="display:none">Continue</button></div></div>`;
    } else {
      panel = `<div class="card"><div class="k">Campaign</div><h4>Spend your money</h4><p>Click a state to place 1 influence point (${tu.free > 0 ? `<b>${tu.free} free point${tu.free > 1 ? 's' : ''}</b>${tu.only ? ' in ' + tu.only.map(c => NAME[c]).join(', ') : ''} first, then ` : ''}$1M each). Money you do not spend is saved for your next turn.</p>
      <div class="row"><button class="btn ghost sm" id="undo" ${tu.placed.length ? '' : 'disabled'}>Undo</button><button class="btn" id="end">End turn</button></div></div>`;
    }
    app.innerHTML = `<div class="game"><div>${mapHTML(tu.phase === 'camp')}</div><div class="side">
      <div class="turn" style="background:${T.color}"><div class="k">Round ${G.round} of ${G.rounds} · now playing</div><b>${md(T.name)}</b><div style="display:flex;justify-content:space-between;align-items:end"><span>Campaign money</span><span class="money">$${T.money}M</span></div></div>
      ${G.log ? `<div class="card"><p class="small">${G.log}</p></div>` : ''}
      ${panel}${scoreHTML()}</div></div>`;
    wire();
  }

  function wire() {
    const T = G.teams[G.cur], tu = G.turn;
    const ok = app.querySelector('#ok');
    if (tu.phase === 'event') ok.onclick = () => { applyEvent(T); G.log = tu.lost ? `Fake news: ${md(T.name)} lost 1 point in ${NAME[tu.lost]}.` : ''; tu.phase = 'q'; tu.q = nextQ(); render(); };
    if (tu.phase === 'q' || tu.phase === 'bq') {
      const opts = [...app.querySelectorAll('.opt')];
      opts.forEach(b => b.onclick = () => {
        if (opts[0].dataset.done) return; opts.forEach(x => { x.disabled = true; x.dataset.done = 1; });
        const j = +b.dataset.j, q = tu.q, right = j === q.a; let gain;
        opts[q.a].classList.add('ok'); if (!right) b.classList.add('bad');
        if (tu.phase === 'q') { T.streak = right ? T.streak + 1 : 0; gain = right ? 5 + (T.streak >= 3 ? 1 : 0) : 2; }
        else gain = right ? 3 : 0;
        T.money += gain;
        app.querySelector('#fb').innerHTML = `<div class="fb"><b>${right ? 'Correct!' : 'Not quite.'} +$${gain}M${right && tu.phase === 'q' && T.streak >= 3 ? ' (streak bonus!)' : ''}</b>${md(q.e)}</div>`;
        app.querySelector('.money').textContent = '$' + T.money + 'M';
        ok.style.display = ''; ok.focus();
      });
      ok.onclick = () => { if (tu.phase === 'q' && tu.bonus) { tu.phase = 'bq'; tu.bonus = 0; tu.q = nextQ(); } else tu.phase = 'camp'; G.log = ''; render(); };
    }
    if (tu.phase === 'camp') {
      app.querySelectorAll('.st:not(:disabled)').forEach(b => b.onclick = () => {
        const c = b.dataset.c; let kind;
        if (tu.free > 0 && (!tu.only || tu.only.includes(c))) { tu.free--; kind = 'free'; }
        else if (T.money > 0) { T.money--; kind = 'money'; } else return;
        const before = owner(c);
        G.infl[c][G.cur]++; tu.placed.push([c, kind]);
        const after = owner(c);
        G.log = after === G.cur && before !== G.cur ? `<b>${md(T.name)}</b> wins <b>${NAME[c]}</b> (${EV[c]} votes)!${before >= 0 ? ' Taken from ' + md(G.teams[before].name) + '.' : ''}` : '';
        render();
        const t = app.querySelector(`.st[data-c="${c}"]`); if (t) t.classList.add('flash');
      });
      app.querySelector('#undo').onclick = () => { const p = tu.placed.pop(); if (!p) return; G.infl[p[0]][G.cur]--; if (p[1] === 'free') tu.free++; else T.money++; G.log = ''; render(); };
      app.querySelector('#end').onclick = endTurn;
    }
  }

  function endTurn() {
    G.log = '';
    if (G.teams.some((t, i) => evOf(i) >= 270)) return finish();
    G.cur++;
    if (G.cur >= G.teams.length) { G.cur = 0; G.round++; }
    if (G.round > G.rounds) return finish();
    turnStart();
  }

  function cpuTurn() {
    const T = G.teams[G.cur], i = G.cur, tu = G.turn;
    applyEvent(T);
    const right = Math.random() < 0.65; T.streak = right ? T.streak + 1 : 0; T.money += right ? 5 + (T.streak >= 3 ? 1 : 0) : 2;
    if (tu.bonus && Math.random() < 0.6) T.money += 3;
    const won = [];
    const cost = c => { const v = G.infl[c], mine = v[i], other = Math.max(...v.filter((_, k) => k !== i)); return Math.max(THR(c) - mine, other + 1 - mine, 0); };
    const place = (c, free) => { const before = owner(c); G.infl[c][i]++; if (!free) T.money--; if (owner(c) === i && before !== i) won.push(NAME[c]); };
    while (tu.free > 0) { const opts = STATES.map(s => s[0]).filter(c => !tu.only || tu.only.includes(c)); const best = opts.sort((a, b) => EV[b] / Math.max(1, cost(b)) - EV[a] / Math.max(1, cost(a)))[0]; place(best, true); tu.free--; }
    for (let guard = 0; guard < 40 && T.money > 0; guard++) {
      const cands = STATES.map(s => s[0]).filter(c => owner(c) !== i || G.infl[c][i] - Math.max(...G.infl[c].filter((_, k) => k !== i)) <= 0).map(c => [c, cost(c)]).filter(([c, k]) => k > 0 && k <= T.money);
      if (!cands.length) break;
      cands.sort((a, b) => EV[b[0]] / b[1] - EV[a[0]] / a[1] + (Math.random() - 0.5) * 0.6);
      const [c, k] = cands[0]; for (let n = 0; n < k; n++) place(c, false);
      if (Math.random() < 0.25) break;
    }
    G.log = `<b>Computer</b> – event: ${md(tu.ev.t)}. It answered ${right ? 'correctly' : 'wrongly'}${won.length ? ' and won ' + won.join(', ') : ''}.`;
    tu.phase = 'cpu';
    const T2 = T;
    app.innerHTML = `<div class="game"><div>${mapHTML(false)}</div><div class="side"><div class="turn" style="background:${T2.color}"><div class="k">Round ${G.round} of ${G.rounds}</div><b>Computer's turn</b><div style="display:flex;justify-content:space-between"><span>Campaign money</span><span class="money">$${T2.money}M</span></div></div><div class="card"><p>${G.log}</p><div class="row"><button class="btn" id="ok">Your turn</button></div></div>${scoreHTML()}</div></div>`;
    app.querySelector('#ok').onclick = () => { G.log = ''; endTurn(); };
  }

  function finish() {
    const res = G.teams.map((t, i) => ({ t, e: evOf(i) })).sort((a, b) => b.e - a.e);
    const tie = res.length > 1 && res[0].e === res[1].e;
    const w = res[0];
    const states = i => STATES.filter(s => owner(s[0]) === i).length;
    app.innerHTML = `<div class="game"><div>${mapHTML(false)}</div><div class="side">
      <div class="turn" style="background:${tie ? 'var(--m)' : w.t.color}"><div class="k">Election night</div><b>${tie ? 'A tie!' : md(w.t.name) + (w.e >= 270 ? ' reaches 270 and wins the presidency!' : ' wins with the most electoral votes!')}</b></div>
      <div class="card"><div class="k">Results</div><div class="score" style="margin-top:8px">${res.map(r => `<div class="row2"><span><span class="chip" style="background:${r.t.color}"></span> ${md(r.t.name)}</span><span class="small">${(k => k + (k === 1 ? ' state' : ' states'))(states(G.teams.indexOf(r.t)))}</span><b>${r.e}</b></div>`).join('')}</div></div>
      <div class="card"><div class="k">Talk about it</div><p>${tie ? 'In a real election, if no candidate gets 270, the House of Representatives chooses the President.' : w.e < 270 ? 'Nobody reached 270. In a real election the House of Representatives would then choose the President.' : 'In a real election the winner needs at least 270 of the 538 electoral votes.'}</p><p class="why">Discuss: Did your team win more states or bigger states? Is it fair that the winner of a state takes all its votes? Could a team win the most states but lose the election?</p>
      <div class="row"><button class="btn" id="again">Play again</button><a class="btn ghost" href="../" style="text-decoration:none">AAA 5 games</a></div></div></div></div>`;
    app.querySelector('#again').onclick = setup;
  }

  setup();
})();
