// London Calling – AAA 3 reporter game. The newspaper is invented; the events are real.
(function () {
'use strict';
const K = window.KIT, SND = K.SND, app = document.getElementById('app'), esc = K.esc;
const IMG = {
  1913: ['img/1913.jpg', 'The arrest of a suffragette in London, October 1913. Bain News Service, Library of Congress, no known restrictions.'],
  1916: ['img/1916.jpg', 'British soldiers in a front-line trench, about 1916. Library of Congress, no known restrictions.'],
  1944: ['img/1944.jpg', '“Into the Jaws of Death”: troops landing on 6 June 1944. Photo: Robert F. Sargent, US Coast Guard, public domain.'],
  1948: ['img/1948.jpg', 'The National Windrush Monument at Waterloo station, London (2022). Photo: Basher Eyre, CC BY-SA 2.0.'],
  1979: ['img/1979.jpg', 'Margaret Thatcher in Washington, December 1979. Photo: Marion S. Trikosko, Library of Congress, no known restrictions.'],
  1998: ['img/1998.jpg', 'A “peace wall” in Belfast. Photo: Mike Faherty, CC BY-SA 2.0.'],
  2016: ['img/2016.jpg', 'Protesters against Brexit in Trafalgar Square, London. Photo: Ian Hawfinch, CC BY-SA 2.0.']
};
// Each chapter: date, place, scene, two leads (sources), optional dilemma, three headlines [text, kind], what happened
const CH = [
  { y: 1913, fq: ["What was the motto of the Women's Social and Political Union?", ["Deeds, not words", "Keep calm and carry on", "Peace for our time", "God save the King"], "The suffragettes believed that action was needed, not just speeches."], date: 'Wednesday, 4 June 1913', place: 'Epsom Downs, Surrey', title: 'The Derby',
    scene: 'The biggest horse race of the year. King George V\'s horse, Anmer, is running. Suddenly, at Tattenham Corner, a woman slips under the rail and runs onto the course. The King\'s horse hits her. She falls and does not move.',
    leads: [['Talk to a suffragette in the crowd', 'She says the woman is Emily Wilding Davison, a member of the Women\'s Social and Political Union. “Deeds, not words!” is their motto – they want the vote for women.', 8], ['Talk to a police officer', 'He calls the woman “a lunatic” and says the race must go on. The jockey has been taken to hospital.', 2]],
    heads: [['Suffragette Struck Down by the King\'s Horse at the Derby', 'good'], ['Mad Woman Ruins the Derby!', 'sens'], ['Women Win the Vote at Epsom', 'wrong']],
    real: 'Emily Wilding Davison died of her injuries on 8 June 1913. Thousands of suffragettes walked in her funeral procession. In 1918 women over 30 who met a property qualification got the vote; in 1928 women got the vote on the same terms as men.' },
  { y: 1916, fq: ["In which country is the river Somme?", ["France", "Belgium", "Germany", "Italy"], "Most of the Western Front ran through Belgium and France."], date: 'Saturday, 1 July 1916', place: 'The Somme, France', title: 'The Big Push',
    scene: 'At 7.30 in the morning the whistles blow. After a week of heavy bombardment, British soldiers climb out of their trenches and walk towards the German lines. By evening the field hospitals are full.',
    leads: [['Visit a field hospital', 'A nurse tells you that she has never seen so many wounded men. Whole “Pals battalions” – friends from the same towns – have been destroyed.', 8], ['Attend the press briefing at headquarters', 'An officer tells you that “good progress” has been made and that German losses are heavy.', 2]],
    dilemma: ['The army censor reads your report. “Morale at home must stay high,” he says. “Cut the part about the losses.”', [['Accept the censor\'s changes', 'Under the Defence of the Realm Act, newspapers had to accept censorship.', 0], ['Refuse – and your report is not printed this week', 'You keep your honesty, but your editor is furious.', -2]]],
    heads: [['Great Offensive Begins on the Somme', 'good'], ['Germans Run Away – War Will Be Over by Christmas!', 'sens'], ['British Army Captures Berlin', 'wrong']],
    real: 'The first day of the Battle of the Somme was the bloodiest day in the history of the British Army. The battle lasted until November 1916; the British and French advanced only a few miles. Wartime newspapers were censored, and many people at home learned the truth only later.' },
  { y: 1938, fq: ["Which part of Czechoslovakia was given to Germany in 1938?", ["the Sudetenland", "Slovakia", "Moravia", "Prague"], "The Sudetenland was the border region with a large German-speaking population."], date: 'Friday, 30 September 1938', place: 'Heston Aerodrome, London', title: 'Peace for our time?',
    scene: 'Prime Minister Neville Chamberlain steps out of his plane after meeting Hitler in Munich. He waves a piece of paper signed by Hitler and himself. The crowd cheers. Later, at Downing Street, he tells people that it is “peace for our time”.',
    leads: [['Ask a Czechoslovak diplomat in London', 'He is in tears. “The agreement gives the Sudetenland to Germany – and nobody even asked us. It was decided about us without us.”', 8], ['Ask people in the cheering crowd', 'A woman says: “Thank God. My son will not have to go to war.”', 4]],
    heads: [['Munich Agreement Signed: Sudetenland Given to Germany', 'good'], ['Hitler Is Our Friend!', 'sens'], ['Britain Declares War on Germany', 'wrong']],
    real: 'In March 1939 Germany occupied the rest of the Czech lands, and Slovakia became a separate state under German control. On 1 September 1939 Germany invaded Poland, and two days later Britain declared war. Appeasement had failed.' },
  { y: 1940, fq: ["Who became Prime Minister in May 1940?", ["Winston Churchill", "Neville Chamberlain", "Clement Attlee", "Anthony Eden"], "Churchill led a coalition government until 1945."], date: 'Saturday, 7 September 1940', place: 'The East End, London', title: 'The Blitz',
    scene: 'In the late afternoon hundreds of German bombers appear over London. The docks are on fire. At night thousands of Londoners go down into the Underground stations to sleep on the platforms.',
    leads: [['Spend the night in an Underground station', 'Families sing songs and share tea. An old man says: “Hitler won\'t make us give up.”', 6], ['Go out with the firefighters', 'The heat is terrible. A fireman tells you they have been fighting the fires for twelve hours.', 6]],
    dilemma: ['A government official asks you not to print the names of the streets that were hit – it could help the enemy.', [['Agree', 'You protect people – and stay on good terms with the government.', 2], ['Print everything', 'Your story is more exciting, but it is dangerous.', -6]]],
    heads: [['London Bombed: Docks on Fire as City Shelters Underground', 'good'], ['London Destroyed – It Is the End!', 'sens'], ['Germans Land in Kent', 'wrong']],
    real: 'The Blitz lasted until May 1941. London and many other cities were bombed again and again; tens of thousands of civilians were killed. The idea of the “Blitz spirit” – calm courage – became part of the British memory of the war. Winston Churchill had been Prime Minister since May 1940.' },
  { y: 1944, fq: ["Which D-Day beaches were attacked by British troops?", ["Gold and Sword", "Utah and Omaha", "only Juno", "Dover and Calais"], "Utah and Omaha were American, Juno was Canadian."], date: 'Tuesday, 6 June 1944', place: 'Normandy, France', title: 'D-Day',
    scene: 'Before dawn, thousands of ships cross the English Channel. British, American and Canadian soldiers land on five beaches in Normandy. You are with the British troops on Gold Beach.',
    leads: [['Stay on the beach with the soldiers', 'The noise is unbelievable. By the evening the British have pushed several miles inland.', 6], ['Return to the ship and send your report quickly', 'You are the first to send news to London – but you saw less.', 3]],
    heads: [['Allies Land in Normandy: The Liberation of Europe Begins', 'good'], ['War Is Over!', 'sens'], ['Germans Invade England', 'wrong']],
    real: 'D-Day was the largest seaborne invasion in history. The landings took place on five beaches: Utah and Omaha (American), Gold and Sword (British) and Juno (Canadian). Paris was liberated in August 1944, and the war in Europe ended on 8 May 1945.' },
  { y: 1948, fq: ["When did the National Health Service start?", ["5 July 1948", "1 January 1945", "4 June 1913", "30 July 1966"], "Aneurin Bevan was the Labour health minister who created it."], date: 'Summer 1948', place: 'Tilbury and London', title: 'A New Britain',
    scene: 'Two big stories this summer. In June the ship Empire Windrush arrives at Tilbury with hundreds of passengers from the Caribbean who have come to work in Britain. On 5 July the new National Health Service opens its doors.',
    leads: [['Meet the Windrush passengers', 'A young man from Jamaica tells you he served in the RAF during the war. “Britain is the mother country,” he says. “I want to help rebuild it.”', 8], ['Visit a hospital on the first day of the NHS', 'A mother says: “For the first time I can take my children to the doctor without worrying about the bill.” Health minister Aneurin Bevan calls it a service for everyone.', 8]],
    heads: [['A Health Service Free for All – and New Arrivals from the Caribbean', 'good'], ['Immigrants Will Take Your Jobs!', 'sens'], ['Hospitals Closed Across Britain', 'wrong']],
    real: 'The NHS, free at the point of use, became one of Britain\'s most loved institutions. The “Windrush generation” helped to rebuild post-war Britain – but many faced racism. In 2018 the Windrush scandal revealed that some had been wrongly treated as illegal immigrants.' },
  { y: 1966, fq: ["Who did England beat in the 1966 World Cup final?", ["West Germany", "Brazil", "Argentina", "Italy"], "England won 4–2 after extra time at Wembley."], date: 'Saturday, 30 July 1966', place: 'Wembley Stadium, London', title: 'The World Cup Final',
    scene: 'England against West Germany in the World Cup final. Queen Elizabeth II is in the royal box. After 90 minutes it is 2–2. Extra time!',
    leads: [['Interview the fans outside the stadium', 'Thousands are singing. A young woman in a miniskirt says London is “the most exciting city in the world”.', 4], ['Wait for the players in the tunnel', 'Captain Bobby Moore lifts the trophy. Geoff Hurst has scored three goals – a hat-trick in a final!', 8]],
    heads: [['England Win the World Cup: 4–2 After Extra Time', 'good'], ['Greatest Day in the History of the Universe!', 'sens'], ['England Lose to Brazil', 'wrong']],
    real: 'England beat West Germany 4–2 after extra time. It is still England\'s only World Cup victory. The 1960s were the decade of “Swinging London”: the Beatles, fashion in Carnaby Street and a new youth culture.' },
  { y: 1979, fq: ["Which party did Margaret Thatcher lead?", ["the Conservative Party", "the Labour Party", "the Liberal Party", "the Scottish National Party"], "The Conservatives are also called the Tories."], date: 'Friday, 4 May 1979', place: 'Downing Street, London', title: 'The First Woman Prime Minister',
    scene: 'The Conservatives have won the general election. Margaret Thatcher, a grocer\'s daughter from Grantham, arrives at Number 10. She is the first woman to become Prime Minister of the United Kingdom.',
    leads: [['Talk to a trade union leader', 'He is worried: “She wants to close the unprofitable coal mines and limit the power of the unions.”', 6], ['Talk to a young businesswoman', 'She is delighted: “Lower taxes and less state control – finally!”', 6]],
    heads: [['Thatcher Becomes Britain\'s First Woman Prime Minister', 'good'], ['The Iron Lady Will Destroy Us All!', 'sens'], ['Labour Wins a Landslide', 'wrong']],
    real: 'Thatcher was Prime Minister until 1990 – longer than anyone else in the 20th century. She privatised state companies and fought the miners\' strike of 1984–85. Few British politicians have been so admired and so criticised.' },
  { y: 1998, fq: ["What do people call the thirty years of violence in Northern Ireland?", ["the Troubles", "the Blitz", "the Restoration", "the Reformation"], "The Troubles lasted from the late 1960s to 1998."], date: 'Friday, 10 April 1998', place: 'Belfast, Northern Ireland', title: 'Good Friday',
    scene: 'After thirty years of violence known as “the Troubles”, the British and Irish governments and most Northern Irish parties have reached an agreement in Belfast.',
    leads: [['Talk to families on both sides of a “peace wall”', 'A Catholic mother and a Protestant father say almost the same thing: “We want our children to grow up without fear.”', 8], ['Talk to a politician who voted against it', 'He says the deal gives too much to the other side.', 4]],
    heads: [['Peace Deal Agreed in Belfast', 'good'], ['Ireland and Britain Become One Country!', 'wrong'], ['Troubles Over Forever – Nothing Can Go Wrong Now!', 'sens']],
    real: 'In May 1998 voters in both Northern Ireland and the Republic of Ireland approved the Good Friday Agreement in referendums. It created a power-sharing government in Northern Ireland. Violence fell dramatically, although “peace walls” still divide some areas of Belfast.' },
  { y: 2016, fq: ["When did the United Kingdom leave the European Union?", ["31 January 2020", "23 June 2016", "1 January 1973", "8 May 1945"], "1 January 1973 was the day the UK joined the European Economic Community."], date: 'Friday, 24 June 2016', place: 'London', title: 'The Referendum',
    scene: 'Yesterday the United Kingdom voted on its membership of the European Union. In the early morning the result is announced: 51.9% of voters chose to leave.',
    leads: [['Report from a Leave rally', 'A man says: “We have taken back control of our country.”', 6], ['Report from a Remain-voting London street', 'A student says: “I feel European. Today I lost something.”', 6]],
    dilemma: ['A website sends you a shocking story about the result. It has no author and no sources.', [['Check it with two reliable sources first', 'It turns out to be fake. You avoided a big mistake.', 8], ['Publish it at once – it will get many clicks', 'The story is false. Your newspaper has to apologise.', -12]]],
    heads: [['UK Votes to Leave the European Union', 'good'], ['Britain Is Finished!', 'sens'], ['Remain Wins by a Landslide', 'wrong']],
    real: 'The result divided the country – England and Wales voted Leave, Scotland and Northern Ireland voted Remain. After long negotiations, the UK left the EU on 31 January 2020.' }
];
const RANKS = [[0, 'Tea boy at the Courier'], [40, 'Junior reporter'], [70, 'Reporter'], [100, 'Senior reporter'], [130, 'Foreign correspondent'], [160, 'Chief correspondent'], [185, 'Editor of the Daily Courier']];
let S;
const rank = r => RANKS.filter(x => r >= x[0]).pop()[1];
const stars = r => { const n = Math.max(1, Math.min(5, Math.round(r / 40))); return '★'.repeat(n) + '<span style="color:#B9B09A">' + '★'.repeat(5 - n) + '</span>'; };
function type(el, text, done) { el.textContent = ''; let i = 0; const step = () => { if (i >= text.length) return done && done(); el.textContent += text.slice(i, i + 3); i += 3; if (i % 12 === 0) SND.noise(.02, .05, 3000); setTimeout(step, 14); }; step(); el.onclick = () => { i = text.length; el.textContent = text; done && done(); done = null; }; }
function stats() { return `<div class="stats"><span>Reputation <span class="stars">${stars(S.rep)}</span></span><span>${rank(S.rep)}</span><span>Front pages: ${S.pages.length}</span></div>`; }
function line(i) { return `<div class="timeline">${CH.map((_, k) => `<span class="${k < i ? 'done' : k === i ? 'here' : ''}"></span>`).join('')}</div>`; }
function mast(date) { return `<div class="mast"><h1>The Daily Courier</h1><div class="bar"><span>London</span><span>${date}</span><span>One penny</span></div></div>`; }

function title() { app.innerHTML = `<div class="paper fade">${mast('Est. 1900')}<div class="cols"><div><div class="kick">AAA 3 · a game of 20th-century Britain</div><h2>London Calling</h2>
  <p class="type">It is 1913. You have just joined the Daily Courier as a young reporter. For the next hundred years you will witness the great moments of British history – from the suffragettes to the EU referendum.\n\nChoose your sources. Write honest headlines. Build your career.</p>
  <button class="btn" id="go">Start your first day</button></div>
  <figure><img src="${IMG[1913][0]}" alt=""><figcaption>${IMG[1913][1]}</figcaption></figure></div></div>`;
  document.getElementById('go').onclick = () => { SND.init(); SND.click(); S = { i: 0, rep: 20, pages: [], notes: [] }; chapter(); }; }

function chapter() { const C = CH[S.i]; window.scrollTo(0, 0); const img = IMG[C.y];
  app.innerHTML = `<div class="paper fade">${line(S.i)}<div class="cols"><div><div class="kick">${C.date} · ${C.place}</div><h2>${C.title}</h2><p class="type" id="sc"></p><div id="act"></div></div>
    ${img ? `<figure><img src="${img[0]}" alt=""><figcaption>${img[1]}</figcaption></figure>` : `<div class="note">${C.y}. Your notebook is open. Your pencil is sharp.</div>`}</div>${stats()}</div>`;
  type(document.getElementById('sc'), C.scene, () => leads(C)); }
function choices(el, list, cb, cls = '') { el.innerHTML = `<div class="choices">${list.map((c, i) => `<button class="choice ${cls}" data-i="${i}">${esc(c[0])}${c[1] ? `<small>${esc(c[1])}</small>` : ''}</button>`).join('')}</div>`; el.querySelectorAll('.choice').forEach(b => b.onclick = () => { SND.click(); cb(+b.dataset.i); }); }
function leads(C) { const act = document.getElementById('act'); if (!act || act.dataset.done) return; act.dataset.done = 1;
  act.insertAdjacentHTML('beforebegin', '<p class="kick" style="margin-top:14px">Where do you go for your story?</p>');
  choices(act, C.leads.map(l => [l[0]]), i => { const L = C.leads[i]; S.rep += L[2]; S.note = L[1]; act.innerHTML = `<div class="note">${esc(L[1])}</div><div id="act2"></div>`; setTimeout(() => C.dilemma ? dilemma(C) : factCheck(C), 300); }); }
function dilemma(C) { const el = document.getElementById('act2'); el.innerHTML = `<p class="kick" style="margin-top:14px">A difficult decision</p><p class="type" style="margin-top:6px">${esc(C.dilemma[0])}</p><div id="d"></div>`;
  choices(el.querySelector('#d'), C.dilemma[1].map(d => [d[0]]), i => { const D = C.dilemma[1][i]; S.rep += D[2]; el.querySelector('#d').innerHTML = `<div class="note">${esc(D[1])}</div>`; D[2] < 0 ? SND.bad() : SND.good(); setTimeout(() => factCheck(C, el), 400); }); }
function factCheck(C, host) { const el = host || document.getElementById('act2'); const idx = K.shuffle([0, 1, 2, 3]); const q = { q: C.fq[0], o: idx.map(i => C.fq[1][i]), a: idx.indexOf(0), e: C.fq[2] };
  el.insertAdjacentHTML('beforeend', `<div id="fc"><p class="kick" style="margin-top:14px">Fact-check before you write (optional bonus)</p><p style="font:700 17px 'Old Standard TT';margin-top:4px">${esc(q.q)}</p><div class="opts">${q.o.map((o, j) => `<button class="opt" data-j="${j}">${'ABCD'[j]} · ${esc(o)}</button>`).join('')}</div><div class="fb" id="fbk"></div></div>`);
  const bs = [...el.querySelectorAll('.opt')]; bs.forEach(b => b.onclick = () => { if (bs[0].dataset.d) return; bs.forEach(x => x.dataset.d = 1); const ok = +b.dataset.j === q.a; bs[q.a].classList.add('ok'); if (!ok) b.classList.add('bad'); S.rep += ok ? 5 : 0; ok ? SND.good() : SND.bad();
    el.querySelector('#fbk').innerHTML = `${ok ? 'Checked and correct. +reputation' : 'Wrong – good thing you checked.'} ${esc(q.e)}`; setTimeout(() => headline(C, el), 700); }); }
function headline(C, el) { if (el.querySelector('#hl')) return; el.insertAdjacentHTML('beforeend', '<div id="hl"><p class="kick" style="margin-top:16px">Write the headline</p><div id="h"></div></div>');
  const order = K.shuffle([0, 1, 2]); choices(el.querySelector('#h'), order.map(k => [C.heads[k][0]]), i => { const H = C.heads[order[i]]; const kind = H[1]; S.rep += kind === 'good' ? 12 : kind === 'sens' ? 2 : -10; S.pages.push({ y: C.y, h: H[0], kind }); front(C, H); }, 'head'); }
function front(C, H) { window.scrollTo(0, 0); SND.boom(); const img = IMG[C.y]; const kind = H[1];
  const verdict = kind === 'good' ? ['The editor is pleased', 'Accurate and clear – a headline readers can trust.'] : kind === 'sens' ? ['It sells – but…', 'Sensational headlines sell papers, but they exaggerate. Some readers stop trusting you.'] : ['Disaster!', 'The headline is false. The Courier has to print an apology.'];
  app.innerHTML = `<div class="paper press">${kind === 'wrong' ? '<div class="stamp">APOLOGY</div>' : ''}${mast(C.date)}<div class="front"><div class="hl">${esc(H[0])}</div><div class="sub">From our correspondent · ${esc(C.place)}</div>
    <div class="cols"><div class="body"><p>${esc(C.scene)}</p><p>${esc(S.note || '')}</p></div>${img ? `<figure><img src="${img[0]}" alt=""><figcaption>${img[1]}</figcaption></figure>` : ''}</div></div>
    <div class="note"><b>${verdict[0]}.</b> ${verdict[1]}</div>
    <div class="note" style="transform:rotate(.5deg);background:#F3F0E6;border-color:#B9B09A"><b>What happened next:</b> ${esc(C.real)}</div>
    <button class="btn" id="next">${S.i + 1 < CH.length ? 'Next assignment →' : 'Your last day at the Courier'}</button>${stats()}</div>`;
  document.getElementById('next').onclick = () => { SND.click(); S.i++; S.i < CH.length ? chapter() : finale(); }; }
function finale() { window.scrollTo(0, 0); SND.win(); const good = S.pages.filter(p => p.kind === 'good').length;
  app.innerHTML = `<div class="paper fade">${mast('A century of news')}<div class="kick">Your career</div><h2>${rank(S.rep)}</h2><p class="type">Reputation: ${stars(S.rep)}  ·  Honest headlines: ${good} of ${CH.length}\n\nFrom the Derby of 1913 to the referendum of 2016, you saw Britain change: votes for women, two world wars, the welfare state, a multicultural society, the first woman Prime Minister, peace in Northern Ireland – and Brexit.</p>
  <div class="gallery">${S.pages.map(p => `<div class="mini"><small>${p.y}${p.kind === 'wrong' ? ' · APOLOGY' : p.kind === 'sens' ? ' · TABLOID' : ''}</small>${esc(p.h)}</div>`).join('')}</div>
  <button class="btn" id="again">Start again</button> <a class="btn ghost" href="../" style="display:inline-block;text-decoration:none">AAA 3 games</a></div>`;
  document.getElementById('again').onclick = title; }
const sb = document.getElementById('snd'); sb.textContent = SND.on ? '♪ sound on' : '♪ sound off'; sb.onclick = () => { SND.init(); sb.textContent = SND.toggle() ? '♪ sound on' : '♪ sound off'; };
title();
})();
