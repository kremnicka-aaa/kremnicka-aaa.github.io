// Exchange Year – AAA 5 chat story. Ema and the Millers are invented; the facts are from the AAA 5 Student's Book.
(function () {
'use strict';
const SND = window.KIT.SND, chat = document.getElementById('chat'), rep = document.getElementById('rep'), moodEl = document.getElementById('mood'), status = document.getElementById('status');
let mood = 50, good = 0;
const PIC = { house: 'A 1950s suburban kitchen, preserved in a museum in Kansas', street: 'A street of family houses in a US suburb', school: 'A big American public high school', diner: 'A classic American diner', football: 'An NFL game', baseball: 'A baseball game', july4: 'Fourth of July lights', capitol: 'The US Capitol in Washington, D.C.' };
// Episode: d = day label, m = Ema's messages (string, or {pic}), q = [question options: [text, correct?, Ema's reaction]], info = fact card
const EP = [
  { d: 'Mon, 17 August', m: ['AHOJ!! I\'m here 🇺🇸🇺🇸', 'Columbus, Ohio. The Millers picked me up at the airport in a HUGE car', 'Everything is so big here. The house has a garage, a lawn in front and a backyard. No fences!', { pic: 'street', t: 'found a pic online – our street looks exactly like this 😂' }, 'Mrs Miller says we\'ll “grab a bite at the diner” tonight. What is a diner??'],
    q: [['A simple, cheap restaurant, often open 24 hours – pancakes, burgers, milkshakes', true, 'Perfect, I\'m STARVING 🥞'], ['A very formal restaurant – wear your best dress', false, 'I wore a dress… everyone else was in shorts 🙈'], ['It\'s dinner at a neighbour\'s house', false, 'I brought flowers to a restaurant. Mrs Miller laughed so much 😅']],
    info: ['Diner', 'A diner is a simple, cheap American restaurant – breakfasts like pancakes, eggs and bacon are served all day.'] },
  { d: 'Wed, 19 August', m: ['First day of school tomorrow 😬', { pic: 'school', t: 'it\'s soooo big, like a castle' }, 'They told me I\'m a JUNIOR. Is that bad? I\'m not a baby!'],
    q: [['Junior = grade 11. Freshman 9, sophomore 10, junior 11, senior 12', true, 'Ohhh ok, same as our 3rd year. Phew 😌'], ['Junior means the youngest class', false, 'I told everyone I\'m the youngest… they were confused 🤨'], ['It\'s a nickname for exchange students', false, 'Hmm no, my friend says it\'s a grade 🤔']],
    info: ['K–12', 'American school has 12 grades after kindergarten. In high school, students in grades 9–12 are freshmen, sophomores, juniors and seniors.'] },
  { d: 'Fri, 11 September', m: ['I chose my ELECTIVES – photography and drama 🎭📸', 'Every class has a different room and I have a LOCKER like in the films', 'My counselor keeps talking about my GPA. What is that?'],
    q: [['Grade point average – your marks as one number, up to 4.0', true, '4.0 is the best? Challenge accepted 💪'], ['A test you write at the end of the year', false, 'I studied for a test that doesn\'t exist 🫠'], ['The name of the school sports team', false, 'I asked the coach about the GPA team… no 😭']],
    info: ['GPA', 'The grade point average summarises a student\'s marks, usually on a scale up to 4.0 (A = 4, B = 3 …). Colleges look at it.'] },
  { d: 'Sat, 31 October', m: ['HALLOWEEN 🎃🎃🎃', 'The whole street is decorated – skeletons, spider webs, pumpkins with faces', 'Kids come to the door tonight and I give them candy. What do they say?'],
    q: [['“Trick or treat!”', true, 'They said it 100 times. I gave away 3 bags of candy 🍬😂'], ['“Merry Christmas!”', false, 'A little vampire looked at me like I was crazy 🧛'], ['“Happy Thanksgiving!”', false, 'Wrong holiday, Ema 🤦‍♀️ (that\'s what Mr Miller said)']],
    info: ['Halloween', 'Halloween on 31 October comes from the Celtic festival of Samhain and was brought to America by Irish and Scottish immigrants. A carved pumpkin is a jack-o\'-lantern.'] },
  { d: 'Tue, 3 November', m: ['Election day! Not for president – Mr Miller says these are the MIDTERMS', 'They vote for Congress. He explained the House and the Senate but I got lost', 'How many senators does Ohio have? He says it\'s a trick question'],
    q: [['Two – every state has two senators, big or small', true, 'He was impressed!! I explained checks and balances too 😎'], ['It depends on the population', false, '“That\'s the House, honey” 😅'], ['One for every city', false, 'Lol no. 435 is the House, he said']],
    info: ['Congress', 'The Senate has 100 senators – two per state, elected for six years. The House of Representatives has 435 members; seats depend on population. Midterm elections take place in the middle of a President\'s term.'] },
  { d: 'Thu, 26 November', m: ['THANKSGIVING 🦃', 'The whole family is coming. 22 people!!', 'I want to bring something traditional. Help?'],
    q: [['Bake a pumpkin pie – with turkey, stuffing and cranberry sauce it\'s the classic', true, 'Grandma Miller asked for my recipe 🥧❤️'], ['Bring a big box of fireworks', false, 'Fireworks are for the Fourth of July, apparently 🎆😬'], ['Bring an Easter egg basket', false, 'They were very polite about it… 🐣']],
    info: ['Thanksgiving', 'Thanksgiving is on the fourth Thursday of November. In 1863 Abraham Lincoln proclaimed a national day of thanksgiving. The next day, Black Friday, starts the Christmas shopping season.'] },
  { d: 'Mon, 14 December', m: ['I have a fever and my throat hurts 🤒', 'Mrs Miller is taking me to the doctor. She asked for my insurance card?? In Slovakia I just go…', 'Is the doctor free here?'],
    q: [['No – most Americans have private health insurance, often through their job. You have exchange-student insurance', true, 'Found the card in my passport cover. You\'re a lifesaver 💊'], ['Yes, the NHS is free for everyone', false, 'Ema… the NHS is in BRITAIN 🙃'], ['Only Medicare – it\'s for students', false, 'The nurse said Medicare is for people over 65 😂']],
    info: ['Healthcare', 'The USA has no national health service. Most people have private insurance, often through their employer. Medicare is for people aged 65 or older, Medicaid for people with low incomes. The Affordable Care Act of 2010 is often called “Obamacare”.'] },
  { d: 'Super Bowl Sunday, February', m: ['Super Bowl party at the neighbours\' 🏈', { pic: 'football', t: 'the whole street is watching' }, 'Everyone is screaming. What even is the Super Bowl?'],
    q: [['The final of the NFL – American football. Even the adverts are famous', true, 'I\'m watching the ads more than the game 📺😂'], ['The final of the baseball season', false, 'That\'s the World Series, said 5 people at once ⚾'], ['A big soup festival', false, 'BOWL. SOUP. I\'m dying 🥣😭']],
    info: ['Sport', 'The Super Bowl is the final of the NFL, played since 1967 and one of the most watched TV events of the year. Baseball\'s final is the World Series.'] },
  { d: 'Wed, 10 March', m: ['OMG look what my friend shared 😱', '“ALL SCHOOLS IN OHIO CLOSED FOR A MONTH FROM MONDAY!!!”', 'No author, a weird website, but 5,000 shares… Should I share it too?'],
    q: [['Wait – check it first: who published it? Do reliable news sites report it too?', true, 'Checked the school website and two news sites. FAKE 🙄 Thanks!'], ['Share it! 5,000 people can\'t be wrong', false, 'I shared it… it was fake. My counselor gave me a media literacy lecture 🥲'], ['Believe it if it makes you angry', false, 'Ok that\'s literally how fake news works 😬']],
    info: ['Media literacy', 'Disinformation is false information spread on purpose. Before you share: check the source, the author and the date, and read what other reliable sources say (“lateral reading”).'] },
  { d: 'Sat, 17 April', m: ['Two news!! 1) Jake asked me to PROM 💃 2) Mrs Miller wants me to try the SAT just for fun', 'What\'s on the SAT?'],
    q: [['Reading and Writing, and Math – colleges use it for admission', true, 'Doable! And Jake has a car 🚗 haha'], ['Only American history', false, 'There was so much maths. SO MUCH 😵'], ['It\'s a driving test', false, 'I went to the wrong building 🙈']],
    info: ['College', 'To apply to college, students send their GPA, an SAT or ACT score, a personal essay and recommendation letters. The SAT has two sections: Reading and Writing, and Math.'] },
  { d: 'Sun, 4 July', m: ['Last weeks here 🥲 Today is the Fourth of July!', { pic: 'july4', t: 'the lights tonight' }, 'BBQ, flags everywhere, fireworks. What are they celebrating exactly?'],
    q: [['The Declaration of Independence, adopted on 4 July 1776', true, 'Mr Miller read part of it aloud. “Life, Liberty and the pursuit of Happiness” 🇺🇸'], ['The end of the Civil War', false, 'Wrong war, but nice try 😅'], ['The first Moon landing', false, 'That was 20 July 1969, said the 10-year-old 🌕']],
    info: ['Independence Day', 'Independence Day on 4 July is one of the eleven federal holidays. It celebrates the adoption of the Declaration of Independence in 1776.'] }
];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const scroll = () => { chat.scrollTop = chat.scrollHeight; };
const add = (cls, html) => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; chat.appendChild(d); scroll(); return d; };
const setMood = d => { mood = Math.max(0, Math.min(100, mood + d)); moodEl.style.width = mood + '%'; };
async function her(msg) { status.textContent = 'typing…'; const t = add('typing', '<i></i><i></i><i></i>'); await sleep(Math.min(1700, 500 + (typeof msg === 'string' ? msg.length * 18 : 700))); t.remove(); status.textContent = 'online'; SND.tone(1046, .07, 'sine', .08); SND.tone(1318, .09, 'sine', .07, .06);
  if (typeof msg === 'string') add('b her', msg); else { const p = add('pic', `<img src="img/${msg.pic}.jpg" alt="${PIC[msg.pic]}"><small>${PIC[msg.pic]} · Photo: C. M. Highsmith, LOC</small>`); p.querySelector('img').onload = scroll; if (msg.t) { await sleep(500); add('b her', msg.t); } } }
function ask(opts) { return new Promise(res => { rep.innerHTML = opts.map((o, i) => `<button class="rep" data-i="${i}">${o[0]}</button>`).join(''); rep.querySelectorAll('.rep').forEach(b => b.onclick = () => { rep.innerHTML = ''; SND.init(); res(+b.dataset.i); }); }); }
function shuffled(q) { const idx = [0, 1, 2].sort(() => Math.random() - .5); return idx.map(i => q[i]); }
async function play() {
  chat.innerHTML = ''; mood = 50; good = 0; setMood(0);
  add('day', 'Ema · best friends since primary school');
  await her('Hiii, it\'s me! Flight to New York tomorrow 😱✈️'); await her('Promise you\'ll help me with all the American stuff? You had AAA at school 😁');
  await ask([['Of course! Text me anytime 💙'], ['Only if you send me photos 📸']]).then(i => add('b me', i ? 'Only if you send me photos 📸' : 'Of course! Text me anytime 💙'));
  for (const E of EP) {
    await sleep(500); add('day', E.d);
    for (const m of E.m) await her(m);
    const q = shuffled(E.q); const i = await ask(q.map(o => [o[0]])); const o = q[i];
    add('b me', o[0]); await sleep(300);
    if (o[1]) { good++; setMood(9); SND.tone(784, .1, 'triangle', .1); SND.tone(1046, .14, 'triangle', .1, .08); add('react', '❤️ Ema liked your message'); } else { setMood(-6); SND.tone(220, .2, 'triangle', .1); }
    await her(o[2]);
    add('b info', `<b>${E.info[0]}</b>${E.info[1]}`);
    await sleep(400);
  }
  await sleep(500); add('day', 'Sat, 10 July');
  await her('Flying home tomorrow 🥹'); await her(good >= 9 ? 'Honestly, you were the best American guide ever. I didn\'t make a single big mistake thanks to you 🏆' : good >= 6 ? 'Thanks for all the help – ok, a FEW embarrassing moments, but they make good stories 😂' : 'Next time I\'m asking Google first 😜 Joke – thank you for being there!');
  await her('So… is the American Dream real? 🤔');
  const i = await ask([['For some people – it\'s about opportunity, but not everyone has the same chances'], ['Totally – everyone gets rich in America'], ['No, it\'s just a story from films']]);
  add('b me', ['For some people – it\'s about opportunity, but not everyone has the same chances', 'Totally – everyone gets rich in America', 'No, it\'s just a story from films'][i]);
  await her(i === 0 ? 'Yes. That\'s exactly what Mr Miller said. See you in Bratislava!!! 🇸🇰❤️' : 'Hmm, I think it\'s more complicated. Let\'s talk over kofola 🥤 See you soon!');
  rep.innerHTML = `<div class="end"><div style="font-size:40px">${good >= 9 ? '🏆' : good >= 6 ? '🌟' : '🙂'}</div><h2>${good} / ${EP.length} correct answers</h2><p>Ema's year: ${mood >= 80 ? 'unforgettable' : mood >= 55 ? 'great' : 'full of adventures'}.</p><button class="rep big" id="again" style="margin-top:12px;width:100%">Play again</button></div>`;
  document.getElementById('again').onclick = play;
}
rep.innerHTML = '<button class="rep big" id="start">Open the chat with Ema 💬</button>';
document.getElementById('start').onclick = () => { SND.init(); play(); };
})();
