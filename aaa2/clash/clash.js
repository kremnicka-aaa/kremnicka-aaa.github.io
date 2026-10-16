// Clash of Crowns – AAA 2 duel game. Characters and arenas are drawn in code; portraits are public domain.
(function () {
'use strict';
const K = window.KIT, { W, H, cv, stroke, fillS, shade, SND } = K, OUT = K.OUT;
const FLOOR = 610;

/* ---------- fighters ---------- */
const F = {
  boudica: { name: 'Boudica', title: 'Queen of the Iceni', skin: '#E7B892', hair: '#C2502A', hairStyle: 'long', tunic: '#3E6B3A', cloak: '#9A3B2A', plaid: true, torc: true, weapon: 'spear', shield: 'round', shieldC: '#2E4D8B', shieldC2: '#E3C25A', special: 'Chariot Charge', sp: 'dash' },
  paulinus: { name: 'Suetonius Paulinus', title: 'Roman governor', skin: '#D9A77E', hair: '#3A2A1E', tunic: '#A8322A', armor: 'lorica', cloak: '#8E1F2C', helm: 'roman', weapon: 'gladius', shield: 'scutum', shieldC: '#A8322A', shieldC2: '#E3C25A', special: 'Pilum Volley', sp: 'shot', proj: 'pilum' },
  alfred: { name: 'Alfred the Great', title: 'King of Wessex', skin: '#E7B892', hair: '#8A5A2A', beard: '#8A5A2A', tunic: '#2E4D8B', cloak: '#A8322A', crown: true, weapon: 'sword', shield: 'round', shieldC: '#E3C25A', shieldC2: '#A8322A', special: 'Fyrd of Wessex', sp: 'dash' },
  guthrum: { name: 'Guthrum', title: 'Danish king', skin: '#EBC09A', hair: '#D8B25A', beard: '#D8B25A', tunic: '#6E5A8C', cloak: '#5A4A3A', helm: 'viking', weapon: 'axe', shield: 'round', shieldC: '#A8322A', shieldC2: '#E8D8A8', special: 'Great Heathen Army', sp: 'dash' },
  harold: { name: 'Harold II', title: 'King of England', skin: '#E7B892', hair: '#7A4A22', beard: '#7A4A22', tunic: '#7E2430', armor: 'mail', cloak: '#3E2A50', crown: true, weapon: 'axe', shield: 'round', shieldC: '#C9A43A', shieldC2: '#7E2430', special: 'Shield Wall', sp: 'dash' },
  william: { name: 'William of Normandy', title: 'Duke of Normandy', skin: '#E3B088', hair: '#5A3A1A', tunic: '#2E4D8B', armor: 'mail', helm: 'norman', weapon: 'mace', shield: 'kite', shieldC: '#2E4D8B', shieldC2: '#E3C25A', special: 'Norman Cavalry', sp: 'dash' },
  richard: { name: 'Richard the Lionheart', title: 'Duke of Aquitaine', skin: '#E7B892', hair: '#C2702A', beard: '#C2702A', tunic: '#F1EDE2', cross: true, armor: 'mail', crown: true, weapon: 'sword', shield: 'kite', shieldC: '#B5202A', shieldC2: '#E3C25A', lions: true, special: 'Lionheart Roar', sp: 'dash' },
  henry2: { name: 'Henry II', title: 'King of England', skin: '#DDA884', hair: '#9A6A4A', beard: '#B8B0A0', tunic: '#8E1F2C', cloak: '#3E2A50', crown: true, weapon: 'sword', shield: 'kite', shieldC: '#8E1F2C', shieldC2: '#E3C25A', special: 'Royal Decree', sp: 'shot', proj: 'scroll' },
  elizabeth: { name: 'Elizabeth I', title: 'Queen of England', skin: '#F1D2C0', hair: '#C2502A', dress: '#F1EDE2', dress2: '#C9A43A', ruff: true, crown: true, weapon: 'scepter', special: 'Fireships!', sp: 'shot', proj: 'fire' },
  philip: { name: 'Philip II', title: 'King of Spain', skin: '#E3B896', hair: '#B08850', beard: '#B08850', tunic: '#1E1E24', chain: true, hat: true, ruff: true, weapon: 'rapier', special: 'The Armada', sp: 'shot', proj: 'ship' },
  charles: { name: 'Charles I', title: 'King of England', skin: '#EBC4A6', hair: '#5A3A22', hairStyle: 'long', beard: '#5A3A22', tunic: '#2E4D8B', armor: 'plate', sash: '#B5202A', lace: true, weapon: 'rapier', special: 'Cavalier Charge', sp: 'dash' },
  cromwell: { name: 'Oliver Cromwell', title: 'Parliament general', skin: '#E0AE8A', hair: '#5A3A22', tunic: '#C9A46A', armor: 'plate', helm: 'lobster', sash: '#E8D8A8', weapon: 'sword', special: 'New Model Army', sp: 'shot', proj: 'musket' }
};
const DUELS = [
  { a: 'boudica', b: 'paulinus', year: 'AD 60/61', place: 'Roman Britain', arena: 'road', units: [2], img: null,
    intro: 'The Romans have taken the lands of the Iceni and treated Queen Boudica and her daughters brutally. Boudica leads a great revolt and burns the Roman towns of Camulodunum (Colchester), Londinium (London) and Verulamium (St Albans). Now the Roman governor Suetonius Paulinus marches against her.',
    real: 'Boudica\'s huge army was defeated by the smaller, disciplined Roman army of Suetonius Paulinus, probably somewhere in the Midlands. Boudica died soon after. Roman rule in Britain lasted for another 350 years.' },
  { a: 'alfred', b: 'guthrum', year: '878', place: 'Edington, Wessex', arena: 'chalk', units: [2], img: null,
    intro: 'Danish armies have conquered most of England. Alfred of Wessex has survived the winter hiding in the marshes of Athelney. In the spring he gathers the men of Wessex and meets the Danish king Guthrum at Edington.',
    real: 'Alfred won at Edington in 878. Guthrum was baptised as a Christian, with Alfred as his godfather, and England was divided: the Danes ruled the Danelaw in the north and east.' },
  { a: 'harold', b: 'william', year: '1066', place: 'Hastings', arena: 'senlac', units: [2], img: { src: 'img/bayeux.jpg', cap: 'The Bayeux Tapestry (11th century): the death of Harold. Public domain, via Wikimedia Commons.' },
    intro: 'Duke William of Normandy claims that the English crown was promised to him. On 14 October 1066 his army attacks the shield wall of King Harold II on a hill near Hastings.',
    real: 'Harold was killed at Hastings and William won. He was crowned King of England on Christmas Day 1066 – the Norman Conquest had begun.' },
  { a: 'richard', b: 'henry2', year: '1189', place: 'France', arena: 'castle', units: [2], img: null,
    intro: 'Henry II rules England and half of France. His son Richard fears that his father will give the crown to his younger brother John. Richard joins the French king Philip II and turns against his own father.',
    real: 'In 1189 Henry II, old and ill, had to accept his son\'s demands. He died soon afterwards at Chinon. Richard became king and left almost at once for the Third Crusade – he spent only a few months of his reign in England.' },
  { a: 'elizabeth', b: 'philip', year: '1588', place: 'The English Channel', arena: 'cliffs', units: [4], img: { src: 'img/elizabeth.jpg', cap: 'The “Armada Portrait” of Elizabeth I (c. 1588). Public domain, via Wikimedia Commons.' },
    intro: 'King Philip II of Spain, once the husband of Mary I, wants to bring England back to the Catholic Church. After years of war at sea he sends the Spanish Armada against Protestant England and Queen Elizabeth I.',
    real: 'The Armada failed. English fireships scattered it at Calais, the English attacked it at Gravelines, and storms wrecked many ships on the way home. Elizabeth\'s victory became a symbol of the Golden Age.' },
  { a: 'charles', b: 'cromwell', year: '1645', place: 'Naseby', arena: 'naseby', units: [4], img: { src: 'img/charles.jpg', cap: 'Anthony van Dyck, Charles I in Three Positions (1635–36). Public domain, via Wikimedia Commons.' },
    intro: 'The Civil War between the King and Parliament has lasted three years. On 14 June 1645, at Naseby, the King\'s army faces Parliament\'s New Model Army, with Oliver Cromwell commanding the cavalry.',
    real: 'Parliament won a decisive victory at Naseby. Charles I was later put on trial and executed in January 1649. England became a republic, and from 1653 Cromwell ruled as Lord Protector.' }
];

/* ---------- drawing ---------- */
function fighter(s, pose) {
  const c = cv(260, 320), g = c.getContext('2d'); const cx = 120, ground = 305;
  const P = { idle: 0, walk0: 1, walk1: 2, attack: 3, block: 4, hit: 5 }[pose];
  if (pose === 'hit') { g.translate(cx, ground); g.rotate(-.12); g.translate(-cx, -ground); }
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(cx, ground + 4, 58, 9, 0, 0, 7); g.fill();
  const lean = P === 3 ? 10 : 0;
  // legs
  const legs = (sw) => { const lc = s.armor === 'plate' ? '#7A6A5A' : s.legs || '#5B4632';
    g.beginPath(); g.moveTo(cx - 14 + lean, 196); g.lineTo(cx - 18 - sw, ground - 6); g.lineTo(cx - 2 - sw, ground - 6); g.lineTo(cx + 2 + lean, 198); fillS(g, shade(lc, .85));
    g.beginPath(); g.moveTo(cx + 2 + lean, 196); g.lineTo(cx + 6 + sw, ground - 6); g.lineTo(cx + 22 + sw, ground - 6); g.lineTo(cx + 18 + lean, 198); fillS(g, lc);
    [[cx - 26 - sw, cx - 2 - sw], [cx + 2 + sw, cx + 28 + sw]].forEach(([a, b]) => { g.beginPath(); g.moveTo(a, ground - 10); g.lineTo(b, ground - 10); g.lineTo(b + 4, ground); g.lineTo(a, ground); g.closePath(); fillS(g, '#3A2A1E', 2.5); }); };
  const sw = P === 1 ? 16 : P === 2 ? -16 : P === 3 ? 22 : 6;
  // cloak behind
  if (s.cloak) { g.beginPath(); g.moveTo(cx - 20 + lean, 112); g.quadraticCurveTo(cx - 62, 190, cx - 46, 262); g.lineTo(cx + 4, 250); g.lineTo(cx + 10 + lean, 112); fillS(g, s.cloak); if (s.plaid) { g.save(); g.clip(); g.strokeStyle = 'rgba(30,60,40,.45)'; g.lineWidth = 4; for (let i = -80; i < 80; i += 14) { g.beginPath(); g.moveTo(cx - 70, 110 + i * 2); g.lineTo(cx + 20, 110 + i * 2); g.stroke(); g.beginPath(); g.moveTo(cx - 70 + i + 40, 100); g.lineTo(cx - 70 + i + 40, 270); g.stroke(); } g.restore(); } }
  if (s.dress) { // skirt
    const sk = P === 1 ? 6 : P === 2 ? -6 : 0; g.beginPath(); g.moveTo(cx - 22, 150); g.quadraticCurveTo(cx - 64 + sk, 240, cx - 70 + sk, ground - 2); g.lineTo(cx + 74 + sk, ground - 2); g.quadraticCurveTo(cx + 66 + sk, 240, cx + 26, 150); g.closePath(); fillS(g, s.dress);
    g.save(); g.clip(); g.fillStyle = s.dress2; for (let x = -70; x < 80; x += 26) { g.beginPath(); g.arc(cx + x + sk, 230, 5, 0, 7); g.fill(); g.beginPath(); g.arc(cx + x + 13 + sk, 270, 5, 0, 7); g.fill(); } g.fillRect(cx - 10, 150, 20, 160); g.restore();
  } else legs(sw);
  // torso
  const tc = s.tunic; g.beginPath(); g.moveTo(cx - 28 + lean, 104); g.lineTo(cx + 30 + lean, 104); g.lineTo(cx + 34 + lean * .6, 204); g.lineTo(cx - 32 + lean * .6, 204); g.closePath(); fillS(g, s.dress ? s.dress : tc);
  if (s.armor === 'mail') { g.save(); g.clip(); g.strokeStyle = 'rgba(60,60,70,.45)'; g.lineWidth = 1.6; for (let y = 108; y < 206; y += 6) { g.beginPath(); for (let x = -34; x < 36; x += 6) g.arc(cx + x + lean + (y % 12 ? 3 : 0), y, 3, 0, Math.PI); g.stroke(); } g.restore(); }
  if (s.cross) { g.fillStyle = '#B5202A'; g.fillRect(cx - 4 + lean, 112, 10, 86); g.fillRect(cx - 24 + lean, 138, 50, 10); }
  if (s.armor === 'lorica') { g.beginPath(); g.moveTo(cx - 26 + lean, 106); g.lineTo(cx + 28 + lean, 106); g.lineTo(cx + 26 + lean, 176); g.lineTo(cx - 24 + lean, 176); g.closePath(); fillS(g, '#B98B3A'); g.beginPath(); g.moveTo(cx - 10 + lean, 130); g.quadraticCurveTo(cx + lean, 140, cx + 10 + lean, 130); stroke(g, 2); for (let i = 0; i < 6; i++) { g.beginPath(); g.rect(cx - 26 + i * 9 + lean, 176, 8, 26); fillS(g, '#8A5A2E', 2); } }
  if (s.armor === 'plate') { g.beginPath(); g.moveTo(cx - 26 + lean, 108); g.lineTo(cx + 28 + lean, 108); g.quadraticCurveTo(cx + 30 + lean, 160, cx + 2 + lean, 178); g.quadraticCurveTo(cx - 28 + lean, 160, cx - 26 + lean, 108); fillS(g, '#B8BEC6'); g.beginPath(); g.moveTo(cx + 2 + lean, 112); g.lineTo(cx + 2 + lean, 174); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 3; g.stroke(); }
  if (s.sash) { g.beginPath(); g.moveTo(cx - 26 + lean, 110); g.lineTo(cx + 32 + lean, 186); g.lineTo(cx + 30 + lean, 200); g.lineTo(cx - 28 + lean, 124); g.closePath(); fillS(g, s.sash, 2.5); }
  if (s.chain) { g.beginPath(); g.moveTo(cx - 18 + lean, 112); g.quadraticCurveTo(cx + 2 + lean, 160, cx + 22 + lean, 112); g.lineWidth = 5; g.strokeStyle = '#E3C25A'; g.stroke(); g.beginPath(); g.rect(cx - 4 + lean, 150, 12, 14); fillS(g, '#E3C25A', 2); }
  if (!s.dress && !s.armor) { g.beginPath(); g.moveTo(cx - 31 + lean * .6, 184); g.lineTo(cx + 33 + lean * .6, 184); stroke(g, 6); g.strokeStyle = '#7A5A2E'; g.lineWidth = 4; g.stroke(); }
  if (s.torc) { g.beginPath(); g.arc(cx + 2 + lean, 104, 15, .2, Math.PI - .2); g.lineWidth = 6; g.strokeStyle = '#E3B444'; g.stroke(); }
  // back arm
  g.beginPath(); g.moveTo(cx - 16 + lean, 116); g.lineTo(cx - 30 + lean, 168); stroke(g, 16); g.strokeStyle = shade(s.dress || tc, .8); g.lineWidth = 11; g.stroke();
  // head
  const hx = cx + 4 + lean, hy = 70;
  if (s.hairStyle === 'long') { g.beginPath(); g.moveTo(hx - 24, 62); g.quadraticCurveTo(hx - 40, 130, hx - 22, 150); g.lineTo(hx + 4, 120); g.lineTo(hx + 14, 60); fillS(g, s.hair); }
  if (s.ruff) { g.beginPath(); g.ellipse(hx, 102, 34, 12, 0, 0, 7); fillS(g, '#F7F4EC', 2.5); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1.5; for (let i = -30; i < 32; i += 6) { g.beginPath(); g.moveTo(hx + i, 92); g.lineTo(hx + i, 112); g.stroke(); } }
  if (s.lace) { g.beginPath(); g.moveTo(hx - 30, 98); g.lineTo(hx + 30, 98); g.lineTo(hx + 18, 116); g.lineTo(hx - 18, 116); g.closePath(); fillS(g, '#F7F4EC', 2.5); }
  g.beginPath(); g.arc(hx, hy, 26, 0, Math.PI * 2); fillS(g, s.skin);
  if (s.beard) { g.beginPath(); g.moveTo(hx - 12, 78); g.quadraticCurveTo(hx + 8, 112, hx + 26, 76); g.quadraticCurveTo(hx + 10, 88, hx - 12, 78); fillS(g, s.beard, 2.5); }
  // face
  g.fillStyle = OUT; g.beginPath(); g.arc(hx + 13, hy - 4, 3.2, 0, 7); g.fill();
  g.beginPath(); g.moveTo(hx + 6, hy - 13); g.lineTo(hx + 20, hy - (P === 3 || P === 5 ? 9 : 12)); stroke(g, 3);
  g.beginPath(); if (P === 5) { g.arc(hx + 16, hy + 12, 5, 0, 7); g.fillStyle = '#6B2A2A'; g.fill(); } else { g.moveTo(hx + 10, hy + 13); g.lineTo(hx + 22, hy + (P === 3 ? 10 : 13)); stroke(g, 3); }
  g.beginPath(); g.moveTo(hx + 25, hy - 2); g.lineTo(hx + 31, hy + 6); g.lineTo(hx + 24, hy + 7); stroke(g, 2.5);
  // hair / headgear
  if (!s.helm && !s.hat) { g.beginPath(); g.arc(hx - 2, hy - 4, 27, Math.PI * .92, Math.PI * 1.9); g.lineTo(hx - 4, hy - 12); g.closePath(); fillS(g, s.hair); }
  if (s.helm === 'roman') { g.beginPath(); g.arc(hx, hy - 4, 28, Math.PI, 0); fillS(g, '#C9A43A'); g.beginPath(); g.moveTo(hx - 30, hy - 4); g.lineTo(hx + 30, hy - 4); stroke(g, 4); g.beginPath(); g.moveTo(hx - 36, hy - 30); g.quadraticCurveTo(hx, hy - 54, hx + 36, hy - 30); g.lineTo(hx + 30, hy - 24); g.quadraticCurveTo(hx, hy - 42, hx - 30, hy - 24); g.closePath(); fillS(g, '#B5202A', 2.5); }
  if (s.helm === 'norman') { g.beginPath(); g.moveTo(hx - 28, hy - 2); g.quadraticCurveTo(hx, hy - 62, hx + 28, hy - 2); g.closePath(); fillS(g, '#A9AEB5'); g.beginPath(); g.moveTo(hx + 18, hy - 6); g.lineTo(hx + 20, hy + 14); stroke(g, 6); }
  if (s.helm === 'viking') { g.beginPath(); g.arc(hx, hy - 4, 28, Math.PI, 0); fillS(g, '#9CA3AB'); g.beginPath(); g.moveTo(hx - 28, hy - 4); g.lineTo(hx + 28, hy - 4); stroke(g, 4); g.beginPath(); g.moveTo(hx + 12, hy - 4); g.quadraticCurveTo(hx + 26, hy + 2, hx + 18, hy + 10); stroke(g, 4); g.beginPath(); g.moveTo(hx, hy - 32); g.lineTo(hx, hy - 4); stroke(g, 3); }
  if (s.helm === 'lobster') { g.beginPath(); g.arc(hx, hy - 6, 28, Math.PI, 0); fillS(g, '#8F969E'); g.beginPath(); g.moveTo(hx - 28, hy - 6); g.lineTo(hx - 34, hy + 30); g.lineTo(hx - 14, hy + 26); stroke(g, 5); g.beginPath(); g.moveTo(hx + 20, hy - 6); g.lineTo(hx + 34, hy - 2); stroke(g, 5); for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(hx - 30 + i * 2, hy + 4 + i * 9); g.lineTo(hx - 16, hy + 2 + i * 9); stroke(g, 3); } }
  if (s.hat) { g.beginPath(); g.ellipse(hx, hy - 20, 30, 8, 0, 0, 7); fillS(g, '#1E1E24'); g.beginPath(); g.rect(hx - 18, hy - 44, 36, 24); fillS(g, '#1E1E24'); g.beginPath(); g.moveTo(hx + 10, hy - 40); g.quadraticCurveTo(hx + 34, hy - 64, hx + 40, hy - 36); stroke(g, 3); g.strokeStyle = '#F1EDE2'; g.lineWidth = 2; g.stroke(); }
  if (s.crown) { g.beginPath(); g.moveTo(hx - 22, hy - 22); g.lineTo(hx - 22, hy - 44); g.lineTo(hx - 12, hy - 34); g.lineTo(hx - 2, hy - 50); g.lineTo(hx + 8, hy - 34); g.lineTo(hx + 18, hy - 46); g.lineTo(hx + 20, hy - 22); g.closePath(); fillS(g, '#E3B444'); [[-12, -30], [-2, -30], [9, -30]].forEach(([x, y]) => { g.beginPath(); g.arc(hx + x, hy + y, 3, 0, 7); g.fillStyle = '#B5202A'; g.fill(); }); }
  // weapon & front arm
  const ax = cx + 14 + lean, ay = 118;
  let hx2, hy2; if (P === 3) { hx2 = ax + 66; hy2 = 136; } else if (P === 4) { hx2 = ax + 26; hy2 = 102; } else { hx2 = ax + 26; hy2 = 162; }
  const weapon = () => { const wv = s.weapon; g.save(); g.translate(hx2, hy2); const ang = P === 3 ? 0 : P === 4 ? -1.45 : -1.05; g.rotate(ang);
    if (wv === 'sword' || wv === 'gladius' || wv === 'rapier') { const L = wv === 'gladius' ? 66 : wv === 'rapier' ? 104 : 92, w = wv === 'rapier' ? 4 : 9; g.beginPath(); g.moveTo(8, -w / 2); g.lineTo(8 + L, -w / 2); g.lineTo(14 + L, 0); g.lineTo(8 + L, w / 2); g.lineTo(8, w / 2); g.closePath(); fillS(g, '#DCE1E6', 2.5); g.beginPath(); g.moveTo(4, -16); g.lineTo(4, 16); stroke(g, 6); g.strokeStyle = '#C9A43A'; g.lineWidth = 3; g.stroke(); if (wv === 'rapier') { g.beginPath(); g.arc(2, 0, 10, -1.6, 1.6); g.lineWidth = 2.5; g.strokeStyle = '#C9A43A'; g.stroke(); } }
    if (wv === 'spear') { g.beginPath(); g.moveTo(-50, 0); g.lineTo(130, 0); stroke(g, 7); g.strokeStyle = '#8B6A3E'; g.lineWidth = 4; g.stroke(); g.beginPath(); g.moveTo(124, -8); g.lineTo(152, 0); g.lineTo(124, 8); g.closePath(); fillS(g, '#DCE1E6', 2.5); }
    if (wv === 'axe') { g.beginPath(); g.moveTo(-30, 0); g.lineTo(96, 0); stroke(g, 7); g.strokeStyle = '#8B6A3E'; g.lineWidth = 4; g.stroke(); g.beginPath(); g.moveTo(80, -2); g.quadraticCurveTo(84, -38, 106, -40); g.quadraticCurveTo(112, -14, 98, 2); g.closePath(); fillS(g, '#DCE1E6', 2.5); }
    if (wv === 'mace') { g.beginPath(); g.moveTo(-10, 0); g.lineTo(70, 0); stroke(g, 7); g.strokeStyle = '#6B4524'; g.lineWidth = 4; g.stroke(); g.beginPath(); g.arc(80, 0, 14, 0, 7); fillS(g, '#9CA3AB', 2.5); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; g.beginPath(); g.moveTo(80 + Math.cos(a) * 12, Math.sin(a) * 12); g.lineTo(80 + Math.cos(a) * 22, Math.sin(a) * 22); stroke(g, 4); } }
    if (wv === 'scepter') { g.beginPath(); g.moveTo(-6, 0); g.lineTo(74, 0); stroke(g, 6); g.strokeStyle = '#E3B444'; g.lineWidth = 3.5; g.stroke(); g.beginPath(); g.arc(84, 0, 11, 0, 7); fillS(g, '#E3B444', 2.5); g.beginPath(); g.moveTo(92, 0); g.lineTo(104, 0); g.moveTo(98, -6); g.lineTo(98, 6); stroke(g, 3); }
    g.restore(); };
  if (!s.shield || P !== 4) weapon();
  g.beginPath(); g.moveTo(ax, ay); g.lineTo(hx2, hy2); stroke(g, 17); g.strokeStyle = shade(s.dress || tc, .95); g.lineWidth = 12; g.stroke(); g.beginPath(); g.arc(hx2, hy2, 8, 0, 7); fillS(g, s.skin, 2.5);
  if (s.shield && P === 4) weapon();
  // shield (front, on back arm side but drawn in front)
  if (s.shield) { const sx = P === 4 ? cx + 54 + lean : cx - 6 + lean, sy = P === 4 ? 140 : 168;
    if (s.shield === 'round') { g.beginPath(); g.arc(sx, sy, 38, 0, 7); fillS(g, s.shieldC); g.save(); g.beginPath(); g.arc(sx, sy, 38, 0, 7); g.clip(); g.fillStyle = s.shieldC2; g.fillRect(sx - 5, sy - 40, 10, 80); g.fillRect(sx - 40, sy - 5, 80, 10); g.restore(); g.beginPath(); g.arc(sx, sy, 38, 0, 7); stroke(g, 3.5); g.beginPath(); g.arc(sx, sy, 9, 0, 7); fillS(g, '#9CA3AB', 2.5); }
    if (s.shield === 'kite') { g.beginPath(); g.moveTo(sx - 34, sy - 40); g.quadraticCurveTo(sx, sy - 54, sx + 34, sy - 40); g.quadraticCurveTo(sx + 30, sy + 20, sx, sy + 62); g.quadraticCurveTo(sx - 30, sy + 20, sx - 34, sy - 40); fillS(g, s.shieldC); if (s.lions) { g.fillStyle = s.shieldC2; for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(sx, sy - 24 + i * 24, 18, 6, 0, 0, 7); g.fill(); g.beginPath(); g.arc(sx + 16, sy - 28 + i * 24, 5, 0, 7); g.fill(); } } else { g.strokeStyle = s.shieldC2; g.lineWidth = 7; g.beginPath(); g.moveTo(sx, sy - 44); g.lineTo(sx, sy + 52); g.moveTo(sx - 28, sy - 14); g.lineTo(sx + 28, sy - 14); g.stroke(); } }
    if (s.shield === 'scutum') { K.rr(g, sx - 32, sy - 56, 64, 112, 10); fillS(g, s.shieldC); g.strokeStyle = s.shieldC2; g.lineWidth = 4; K.rr(g, sx - 24, sy - 48, 48, 96, 6); g.stroke(); g.beginPath(); g.arc(sx, sy, 10, 0, 7); fillS(g, '#E3B444', 2.5); g.beginPath(); g.moveTo(sx - 18, sy - 30); g.lineTo(sx - 4, sy - 12); g.moveTo(sx + 18, sy - 30); g.lineTo(sx + 4, sy - 12); g.moveTo(sx - 18, sy + 30); g.lineTo(sx - 4, sy + 12); g.moveTo(sx + 18, sy + 30); g.lineTo(sx + 4, sy + 12); g.strokeStyle = s.shieldC2; g.lineWidth = 4; g.stroke(); } }
  return c;
}
function projectile(kind) { const c = cv(120, 60), g = c.getContext('2d');
  if (kind === 'pilum') { g.beginPath(); g.moveTo(4, 30); g.lineTo(96, 30); stroke(g, 6); g.strokeStyle = '#8B6A3E'; g.lineWidth = 3; g.stroke(); g.beginPath(); g.moveTo(70, 30); g.lineTo(106, 30); g.lineWidth = 3; g.strokeStyle = '#DCE1E6'; g.stroke(); g.beginPath(); g.moveTo(104, 25); g.lineTo(116, 30); g.lineTo(104, 35); g.closePath(); fillS(g, '#DCE1E6', 2); }
  if (kind === 'scroll') { K.rr(g, 20, 14, 80, 32, 6); fillS(g, '#F3E6C8'); g.beginPath(); g.arc(20, 30, 10, 0, 7); fillS(g, '#E3D2A8', 2.5); g.beginPath(); g.arc(100, 30, 10, 0, 7); fillS(g, '#E3D2A8', 2.5); g.beginPath(); g.arc(60, 44, 7, 0, 7); fillS(g, '#B5202A', 2); }
  if (kind === 'fire' || kind === 'ship') { g.beginPath(); g.moveTo(10, 36); g.lineTo(100, 36); g.lineTo(88, 52); g.lineTo(22, 52); g.closePath(); fillS(g, kind === 'fire' ? '#4A3020' : '#5A3A22'); g.beginPath(); g.moveTo(56, 36); g.lineTo(56, 4); stroke(g, 3); g.beginPath(); g.moveTo(38, 8); g.lineTo(74, 8); g.lineTo(70, 32); g.lineTo(42, 32); g.closePath(); fillS(g, '#F1EDE2', 2.5);
    if (kind === 'ship') { g.strokeStyle = '#B5202A'; g.lineWidth = 4; g.beginPath(); g.moveTo(42, 10); g.lineTo(70, 30); g.moveTo(70, 10); g.lineTo(42, 30); g.stroke(); }
    else for (let i = 0; i < 6; i++) { const x = 18 + i * 15; g.beginPath(); g.moveTo(x - 8, 38); g.quadraticCurveTo(x - 4, 14 - i % 2 * 8, x, 6 + i % 3 * 4); g.quadraticCurveTo(x + 5, 20, x + 8, 38); g.closePath(); g.fillStyle = i % 2 ? '#F2A33A' : '#E5532E'; g.fill(); } }
  if (kind === 'musket') { g.beginPath(); g.arc(60, 30, 7, 0, 7); fillS(g, '#3B3B3E', 2); g.fillStyle = 'rgba(220,215,205,.85)'; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(40 - i * 10, 30 + (i % 2 ? -3 : 3), 8 - i, 0, 7); g.fill(); } }
  return c; }
function arenaBg(kind) { const c = cv(W, H), g = c.getContext('2d');
  const ground = (col, col2) => { g.fillStyle = col; g.fillRect(0, FLOOR - 40, W, H); g.fillStyle = col2; for (let i = 0; i < 90; i++) { g.beginPath(); g.ellipse(Math.random() * W, FLOOR - 30 + Math.random() * 140, 18 + Math.random() * 30, 3, 0, 0, 7); g.fill(); } };
  if (kind === 'road') { K.sky(g, '#6E7FA0', '#E0B48A'); g.fillStyle = 'rgba(80,70,70,.35)'; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(900 + i * 60, 300 - i * 40, 120 - i * 10, 50, 0, 0, 7); g.fill(); } g.fillStyle = '#4A3A3A'; [[840, 380, 40, 40], [880, 368, 30, 52], [910, 386, 50, 34], [960, 376, 30, 44]].forEach(([x, y, w, h]) => g.fillRect(x, y, w, h)); for (let i = 0; i < 9; i++) { const x = 846 + i * 16; g.beginPath(); g.moveTo(x - 8, 390); g.quadraticCurveTo(x, 350 - (i % 3) * 14, x + 8, 390); g.fillStyle = i % 2 ? '#F2A33A' : '#E5532E'; g.fill(); } K.hills(g, 420, '#5E7A4E', 30, 1); for (let i = 0; i < 26; i++) { const x = i * 52 + (i % 3) * 8, y = 470 + (i % 2) * 14; g.beginPath(); g.moveTo(x, y + 80); g.lineTo(x + 26, y - 40); g.lineTo(x + 52, y + 80); g.closePath(); g.fillStyle = i % 2 ? '#2E4A2E' : '#36583A'; g.fill(); } ground('#7A8A4E', 'rgba(60,80,40,.4)'); g.fillStyle = '#B5A88A'; g.beginPath(); g.moveTo(0, FLOOR + 20); g.lineTo(W, FLOOR - 10); g.lineTo(W, FLOOR + 40); g.lineTo(0, FLOOR + 80); g.closePath(); g.fill(); g.strokeStyle = 'rgba(80,70,50,.4)'; g.lineWidth = 2; for (let x = 0; x < W; x += 46) { g.beginPath(); g.moveTo(x, FLOOR + 20 - x * 30 / W); g.lineTo(x + 20, FLOOR + 74 - x * 40 / W); g.stroke(); } }
  if (kind === 'chalk') { K.sky(g, '#7FA6C9', '#EDE3C8'); K.hills(g, 360, '#8FAF6E', 50, 2); g.fillStyle = '#EDE8DA'; g.beginPath(); g.moveTo(600, 420); g.lineTo(760, 330); g.lineTo(900, 420); g.closePath(); g.fill(); K.hills(g, 470, '#7A9A5A', 26, 4); ground('#7FA35C', 'rgba(70,100,50,.35)'); }
  if (kind === 'senlac') { K.sky(g, '#9AA8B8', '#E8DCC0'); K.hills(g, 400, '#7A8C6A', 20, 1); g.fillStyle = '#6E7E5A'; g.beginPath(); g.moveTo(0, 520); g.quadraticCurveTo(300, 400, 640, 460); g.quadraticCurveTo(900, 500, W, 560); g.lineTo(W, H); g.lineTo(0, H); g.fill(); for (let i = 0; i < 4; i++) { const x = 140 + i * 60, y = 420 + i * 6; g.fillStyle = '#3A2A1E'; g.fillRect(x, y, 4, 110); g.fillStyle = i % 2 ? '#C0262D' : '#E3B444'; g.beginPath(); g.moveTo(x + 4, y); g.lineTo(x + 46, y + 12); g.lineTo(x + 4, y + 26); g.fill(); } ground('#86A060', 'rgba(70,100,50,.35)'); }
  if (kind === 'castle') { K.sky(g, '#3A3058', '#E89A6A'); g.fillStyle = 'rgba(246,196,106,.9)'; g.beginPath(); g.arc(1000, 360, 70, 0, 7); g.fill(); K.hills(g, 420, '#5A4A5E', 26, 2); g.fillStyle = '#3E3446'; [[300, 260, 420, 180], [360, 210, 80, 60], [560, 230, 70, 50], [440, 200, 60, 60]].forEach(([x, y, w, h]) => g.fillRect(x, y, w, h)); for (let i = 0; i < 12; i++) g.fillRect(300 + i * 36, 248, 18, 14); g.fillRect(250, 300, 560, 140); K.hills(g, 500, '#3E3446', 16, 5); ground('#4E5A3E', 'rgba(30,40,30,.4)'); }
  if (kind === 'cliffs') { K.sky(g, '#7FA6C9', '#DCE6EA'); g.fillStyle = '#467CA2'; g.fillRect(0, 380, W, 200); g.strokeStyle = 'rgba(220,235,245,.6)'; g.lineWidth = 3; for (let i = 0; i < 40; i++) { const x = Math.random() * W, y = 390 + Math.random() * 170; g.beginPath(); g.arc(x, y, 10, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); } [[820, 420], [980, 400], [1120, 430]].forEach(([x, y]) => { g.drawImage(projectile('ship'), x, y, 120, 60); }); g.fillStyle = '#EDE8DA'; g.beginPath(); g.moveTo(0, 420); g.lineTo(520, 440); g.lineTo(600, H); g.lineTo(0, H); g.fill(); g.fillStyle = '#7A9A5A'; g.fillRect(0, FLOOR - 40, W * .55, 20); ground('#86A060', 'rgba(70,100,50,.35)'); }
  if (kind === 'naseby') { K.sky(g, '#8A96A6', '#D8D2C0'); g.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 8; i++) { g.beginPath(); g.ellipse(120 + i * 160, 120 + (i % 3) * 30, 90, 26, 0, 0, 7); g.fill(); } K.hills(g, 420, '#7A9068', 24, 3); for (let r = 0; r < 4; r++) { g.fillStyle = r % 2 ? '#8AA26A' : '#94AC70'; g.beginPath(); g.moveTo(0, 450 + r * 30); g.lineTo(W, 440 + r * 30); g.lineTo(W, 470 + r * 30); g.lineTo(0, 480 + r * 30); g.fill(); } g.fillStyle = '#4E6A3E'; for (let x = 0; x < W; x += 30) { g.beginPath(); g.arc(x, 452 + (x % 60 ? 2 : 0), 12, 0, 7); g.fill(); } ground('#7FA35C', 'rgba(70,100,50,.35)'); }
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, FLOOR + 20, W, H); return c; }

/* ---------- scenes ---------- */
class Boot extends Phaser.Scene { constructor() { super('Boot'); }
  create() { Object.entries(F).forEach(([k, s]) => ['idle', 'walk0', 'walk1', 'attack', 'block', 'hit'].forEach(p => this.textures.addCanvas(k + '_' + p, fighter(s, p))));
    ['pilum', 'scroll', 'fire', 'ship', 'musket'].forEach(k => this.textures.addCanvas('p_' + k, projectile(k)));
    const sp = cv(32, 32), g = sp.getContext('2d'); g.beginPath(); g.arc(16, 16, 10, 0, 7); g.fillStyle = '#FFE08A'; g.fill(); this.textures.addCanvas('spark', sp);
    const dust = cv(48, 48), d = dust.getContext('2d'); d.beginPath(); d.arc(24, 24, 18, 0, 7); d.fillStyle = 'rgba(210,200,180,.9)'; d.fill(); this.textures.addCanvas('dust', dust);
    K.fonts(['800 40px Cinzel', '700 20px Inter']).then(() => this.scene.start('Title')); } }

class Title extends Phaser.Scene { constructor() { super('Title'); }
  create() { K.tex(this, 'bg_castle', () => arenaBg('castle')); this.add.image(0, 0, 'bg_castle').setOrigin(0).setTint(0xB8A8C8);
    const l = this.add.image(150, FLOOR + 40, 'boudica_attack').setOrigin(.46, .95).setScale(1.25); const r = this.add.image(1130, FLOOR + 40, 'cromwell_attack').setOrigin(.46, .95).setScale(1.25).setFlipX(true);
    this.tweens.add({ targets: l, x: 180, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' }); this.tweens.add({ targets: r, x: 1100, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: 450 });
    this.add.text(W / 2, 110, 'AAA 2 · HISTORY FIGHTS BACK', { fontFamily: 'Inter, sans-serif', fontStyle: '800', fontSize: '20px', color: '#F3E6C8' }).setOrigin(.5);
    const t = this.add.text(W / 2, 200, 'CLASH OF CROWNS', { fontFamily: 'Cinzel, serif', fontStyle: '800', fontSize: '92px', color: '#F6D27A', stroke: '#2A2018', strokeThickness: 12, shadow: { offsetX: 0, offsetY: 8, color: '#000', blur: 16, fill: true } }).setOrigin(.5);
    this.tweens.add({ targets: t, scale: 1.03, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.add.text(W / 2, 290, 'Six duels from British history · knowledge is your power', { fontFamily: '"Source Serif 4", Georgia, serif', fontStyle: 'italic', fontSize: '26px', color: '#F3E6C8' }).setOrigin(.5);
    K.button(this, W / 2 - 140, 400, 'FIGHT', () => { K.SND.init(); K.SND.startMusic([57, 0, 60, 62, 64, 0, 62, 60, 57, 0, 55, 57, 60, 0, 59, 57], 220, 'sawtooth'); pickDuel(this); }, 240);
    K.button(this, W / 2 + 140, 400, 'HOW TO PLAY', () => howTo(), 240, true);
    K.corner(this, false); } }

function howTo(done) { K.show(`<div class="sheet"><div class="kick">How to play</div><h2>Clash of Crowns</h2>
  <p><b>Move</b> with ◀ ▶ (or the arrow keys), <b>attack</b> with ⚔ (or J / space) and <b>block</b> with 🛡 (or K). Blocking stops most of the damage.</p>
  <p>Your <b>special move</b> (★, or L) needs a full gold bar. The fastest way to fill it: the <b>Herald</b> asks you a history question at the start of each round – and you can call him again with the 📜 button. A correct answer fills most of the bar!</p>
  <p>Win two rounds to win the duel. Afterwards you learn <b>what really happened</b>.</p>
  <div class="row"><button class="btn" id="ok">Got it</button></div></div>`); document.getElementById('ok').onclick = () => { K.hide(); if (done) done(); }; }
function pickDuel(scene) {
  K.show(`<div class="sheet"><div class="kick">Choose a duel</div><h2>Who will you fight?</h2><div class="duels">${DUELS.map((d, i) => `<button class="duel" data-i="${i}"><small>${d.year}</small><b>${F[d.a].name}</b><span>vs ${F[d.b].name}</span></button>`).join('')}</div><div class="row"><button class="btn ghost" id="back">Back</button></div></div>`);
  K.ov().querySelectorAll('.duel').forEach(b => b.onclick = () => pickSide(scene, DUELS[+b.dataset.i])); document.getElementById('back').onclick = () => K.hide();
}
function pickSide(scene, D) {
  K.show(`<div class="sheet"><div class="split"><div><div class="kick">${D.year} · ${D.place}</div><h2>${F[D.a].name} vs ${F[D.b].name}</h2><p>${D.intro}</p><p><b>Choose your side:</b></p>
  <div class="sides"><button class="btn" id="sa">Play as ${F[D.a].name}</button><button class="btn" id="sb" style="background:#2E4D8B;box-shadow:0 3px 0 #1A2E55">Play as ${F[D.b].name}</button></div><div class="row"><button class="btn ghost" id="back">Other duels</button></div></div>
  <div>${D.img ? `<img src="${D.img.src}" alt=""><div class="cap">${D.img.cap}</div>` : `<p class="small">${F[D.a].title} · ${F[D.b].title}</p>`}</div></div></div>`);
  document.getElementById('sa').onclick = () => { K.hide(); scene.scene.start('Fight', { D, me: D.a, foe: D.b }); };
  document.getElementById('sb').onclick = () => { K.hide(); scene.scene.start('Fight', { D, me: D.b, foe: D.a }); };
  document.getElementById('back').onclick = () => pickDuel(scene);
}

class Fight extends Phaser.Scene { constructor() { super('Fight'); }
  create(data) {
    this.D = data.D; const bgk = 'bg_' + this.D.arena; K.tex(this, bgk, () => arenaBg(this.D.arena)); this.add.image(0, 0, bgk).setOrigin(0);
    this.input.addPointer(3);
    this.dust = this.add.particles(0, 0, 'dust', { speed: { min: 20, max: 90 }, lifespan: 500, scale: { start: .5, end: 1.1 }, alpha: { start: .6, end: 0 }, emitting: false }).setDepth(30);
    this.sparks = this.add.particles(0, 0, 'spark', { speed: { min: 120, max: 340 }, lifespan: 380, scale: { start: .7, end: 0 }, emitting: false, blendMode: 'ADD' }).setDepth(31);
    this.p = this.makeF(data.me, 380, 1); this.e = this.makeF(data.foe, 900, -1); this.e.ai = true;
    this.shots = []; this.round = 1; this.wins = [0, 0]; this.paused = false; this.over = false; this.heraldCd = 0;
    this.hud(); this.controls(); this.keys = this.input.keyboard ? this.input.keyboard.addKeys('LEFT,RIGHT,A,D,J,K,L,SPACE,S,E') : null;
    K.corner(this, true, ['☰ duels', () => { this.paused = true; K.show(`<div class="sheet"><div class="kick">Paused</div><h2>Leave this duel?</h2><div class="row"><button class="btn" id="res">Continue</button><button class="btn ghost" id="quit">Choose another duel</button></div></div>`); document.getElementById('res').onclick = () => { K.hide(); this.paused = false; }; document.getElementById('quit').onclick = () => { K.hide(); this.scene.start('Title'); pickDuel(this.scene.get('Title')); }; }], W / 2 + 230);
    this.startRound();
  }
  makeF(key, x, dir) { const s = F[key], sp = this.add.sprite(x, FLOOR, key + '_idle').setOrigin(.46, .95).setDepth(10).setFlipX(dir < 0).setScale(1.2);
    const f = { key, s, sp, x, dir, hp: 100, meter: 0, state: 'idle', t: 0, cd: 0, stun: 0, walkT: 0, blocking: false, hitDone: false };
    this.tweens.add({ targets: sp, scaleY: 1.22, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' }); return f; }
  hud() { const g = this.add.graphics().setDepth(40); this.hudG = g; this.timerT = this.add.text(W / 2, 62, '60', { fontFamily: 'Cinzel, serif', fontStyle: '800', fontSize: '46px', color: '#F3E6C8', stroke: '#2A2018', strokeThickness: 8 }).setOrigin(.5).setDepth(41);
    const nm = (f, x, o) => this.add.text(x, 94, f.s.name.toUpperCase(), { fontFamily: 'Inter, sans-serif', fontStyle: '800', fontSize: '17px', color: '#F3E6C8', stroke: '#2A2018', strokeThickness: 5 }).setOrigin(o, 0).setDepth(41);
    nm(this.p, 70, 0); nm(this.e, W - 70, 1);
    this.banner = this.add.text(W / 2, 330, '', { fontFamily: 'Cinzel, serif', fontStyle: '800', fontSize: '86px', color: '#F6D27A', stroke: '#2A2018', strokeThickness: 12 }).setOrigin(.5).setDepth(50).setAlpha(0);
    this.spName = this.add.text(W / 2, 210, '', { fontFamily: 'Cinzel, serif', fontStyle: '800', fontSize: '48px', color: '#FFFFFF', stroke: '#8E1F2C', strokeThickness: 10 }).setOrigin(.5).setDepth(50).setAlpha(0); }
  drawHud() { const g = this.hudG; g.clear(); const bar = (x, w, f, col, right) => { g.fillStyle(0x2A2018, .85); g.fillRoundedRect(x - 4, 0, w + 8, 1, 0); };
    const hp = (f, x, right) => { const w = 470, h = 24, y = 30; g.fillStyle(0x2A2018, .9); g.fillRoundedRect(x - 4, y - 4, w + 8, h + 8, 8); g.fillStyle(0x6B1A22, 1); g.fillRoundedRect(x, y, w, h, 6); const v = Math.max(0, f.hp) / 100; g.fillStyle(v > .5 ? 0xE3B444 : v > .25 ? 0xE5832E : 0xC0262D, 1); if (right) g.fillRoundedRect(x + w * (1 - v), y, w * v, h, 6); else g.fillRoundedRect(x, y, w * v, h, 6);
      const my = 64, mw = 300; g.fillStyle(0x2A2018, .9); g.fillRoundedRect((right ? x + w - mw : x) - 3, my - 3, mw + 6, 16, 6); g.fillStyle(0x3A3A48, 1); g.fillRoundedRect(right ? x + w - mw : x, my, mw, 10, 4); g.fillStyle(f.meter >= 100 ? 0xFFFFFF : 0xF6D27A, 1); const mv = Math.min(1, f.meter / 100); if (right) g.fillRoundedRect(x + w - mw * mv, my, mw * mv, 10, 4); else g.fillRoundedRect(x, my, mw * mv, 10, 4);
      for (let i = 0; i < 2; i++) { g.fillStyle(this.wins[right ? 1 : 0] > i ? 0xF6D27A : 0x2A2018, 1); g.fillCircle(right ? x + w - 340 - i * 24 : x + 340 + i * 24, 70, 8); g.lineStyle(2, 0xF3E6C8, 1); g.strokeCircle(right ? x + w - 340 - i * 24 : x + 340 + i * 24, 70, 8); } };
    hp(this.p, 60, false); hp(this.e, W - 530, true); }
  controls() { const mk = (x, y, r, label, down, up, col = 0x2A2018) => { const c = this.add.circle(x, y, r, col, .45).setDepth(45).setStrokeStyle(3, 0xF3E6C8, .7).setInteractive(); const t = this.add.text(x, y, label, { fontFamily: 'Inter, sans-serif', fontStyle: '800', fontSize: r > 50 ? '34px' : '28px', color: '#F3E6C8' }).setOrigin(.5).setDepth(46);
      c.on('pointerdown', (p, lx, ly, ev) => { if (ev) ev.stopPropagation(); K.SND.init(); c.setFillStyle(col, .75); down(); }); const rel = () => { c.setFillStyle(col, .45); if (up) up(); }; c.on('pointerup', rel); c.on('pointerout', rel); return c; };
    this.btn = { l: false, r: false, b: false };
    mk(90, H - 90, 56, '◀', () => this.btn.l = true, () => this.btn.l = false); mk(220, H - 90, 56, '▶', () => this.btn.r = true, () => this.btn.r = false);
    mk(W - 330, H - 84, 50, '🛡', () => this.btn.b = true, () => this.btn.b = false); mk(W - 200, H - 110, 62, '⚔', () => this.attack(this.p), null, 0x8E1F2C);
    this.spBtn = mk(W - 78, H - 200, 50, '★', () => this.special(this.p), null, 0xC9962E); mk(W - 78, H - 74, 44, '📜', () => this.herald(), null, 0x3E6B3A); }
  say(t, hold = 900) { this.banner.setText(t).setAlpha(0).setScale(.5); this.tweens.add({ targets: this.banner, alpha: 1, scale: 1, duration: 300, ease: 'Back.out', yoyo: true, hold }); }
  startRound() { [this.p, this.e].forEach((f, i) => { f.hp = 100; f.x = i ? 900 : 380; f.state = 'idle'; f.stun = 0; f.sp.setAngle(0).setTexture(f.key + '_idle'); f.sp.y = FLOOR; f.meter = Math.max(f.meter, 0); }); this.time.now; this.clock = 60; this.live = false; this.drawHud();
    this.say('ROUND ' + this.round, 700); K.SND.horn(); this.time.delayedCall(1300, () => this.herald(true)); }
  herald(auto) { if (this.over || this.paused || (!auto && (this.heraldCd > 0 || !this.live))) return; this.paused = true;
    K.ask(K.question(this.D.units), { kick: 'The Herald asks', okText: 'Well spoken! Your special move is charged.', badText: 'Wrong! Your opponent gains strength.', button: auto ? 'FIGHT!' : 'Back to the duel' }, ok => {
      if (ok) { this.p.meter = Math.min(100, this.p.meter + 70); this.p.hp = Math.min(100, this.p.hp + 5); } else this.e.meter = Math.min(100, this.e.meter + 35);
      this.paused = false; this.heraldCd = 15; if (auto) { this.live = true; this.say('FIGHT!', 300); } this.drawHud(); }); }
  dist() { return Math.abs(this.p.x - this.e.x); }
  attack(f) { if (!this.live || this.paused || f.state === 'attack' || f.stun > 0 || f.state === 'ko' || f.cd > 0) return; f.state = 'attack'; f.t = 0; f.hitDone = false; f.cd = .55; f.sp.setTexture(f.key + '_attack'); K.SND.swish(); }
  special(f) { if (!this.live || this.paused || f.meter < 100 || f.stun > 0 || f.state === 'ko') return; f.meter = 0; this.spName.setText(f.s.special.toUpperCase()).setAlpha(0).setScale(.6); this.tweens.add({ targets: this.spName, alpha: 1, scale: 1, duration: 250, yoyo: true, hold: 600 }); K.SND.special(); this.cameras.main.flash(180, 255, 230, 160);
    if (f.s.sp === 'dash') { f.state = 'dash'; f.t = 0; f.hitDone = false; f.sp.setTexture(f.key + '_attack'); }
    else { f.state = 'attack'; f.t = 0; f.hitDone = true; f.sp.setTexture(f.key + '_attack'); for (let i = 0; i < 3; i++) this.time.delayedCall(i * 160, () => { const pr = this.add.image(f.x + f.dir * 60, FLOOR - 160 + i * 30, 'p_' + f.s.proj).setDepth(20).setFlipX(f.dir < 0); this.shots.push({ pr, from: f, x: pr.x, dir: f.dir, dmg: 9 }); K.SND.swish(); }); }
    this.drawHud(); }
  hurt(target, dmg, from, unblock) { if (target.state === 'ko') return; const blocked = !unblock && target.blocking; const d = blocked ? Math.max(1, Math.round(dmg * .15)) : dmg; target.hp -= d;
    target.x -= target.dir * (blocked ? 22 : 54); target.x = Phaser.Math.Clamp(target.x, 110, W - 110);
    this.sparks.explode(blocked ? 8 : 18, (target.x + from.x) / 2, FLOOR - 170); if (blocked) K.SND.block(); else { K.SND.hit(); target.stun = .28; target.state = 'hit'; target.sp.setTexture(target.key + '_hit'); this.cameras.main.shake(120, .006); target.sp.setTintFill(0xFFFFFF); this.time.delayedCall(60, () => target.sp.clearTint()); }
    from.meter = Math.min(100, from.meter + (blocked ? 2 : 9)); target.meter = Math.min(100, target.meter + 4);
    if (target.hp <= 0) this.ko(target); this.drawHud(); }
  ko(f) { f.state = 'ko'; f.hp = 0; this.live = false; f.sp.setTexture(f.key + '_hit'); this.tweens.add({ targets: f.sp, angle: -90 * f.dir, y: FLOOR + 10, duration: 500, ease: 'Bounce.out' }); this.dust.explode(20, f.x, FLOOR);
    const pw = f === this.e ? 0 : 1; this.wins[pw]++; this.say('K.O.!', 900); K.SND.boom(); this.drawHud();
    this.time.delayedCall(2400, () => this.nextRound()); }
  nextRound() { if (this.wins[0] === 2 || this.wins[1] === 2) return this.finish(this.wins[0] === 2); this.round++; this.startRound(); }
  timeUp() { this.live = false; const w = this.p.hp === this.e.hp ? null : this.p.hp > this.e.hp ? 0 : 1; if (w !== null) this.wins[w]++; this.say(w === null ? 'DRAW' : 'TIME!', 900); this.drawHud(); this.time.delayedCall(2200, () => this.nextRound()); }
  finish(won) { this.over = true; K.SND.stopMusic(); won ? K.SND.win() : K.SND.lose(); const D = this.D, me = F[this.p.key], foe = F[this.e.key];
    K.show(`<div class="sheet"><div class="split"><div><div class="kick">${won ? 'Victory' : 'Defeat'} · ${D.year}</div><h2>${won ? me.name + ' wins!' : foe.name + ' wins!'}</h2><p><b>What really happened:</b> ${D.real}</p>
    <div class="row"><button class="btn" id="again">Fight again</button><button class="btn ghost" id="other">Other duels</button></div></div><div>${D.img ? `<img src="${D.img.src}" alt=""><div class="cap">${D.img.cap}</div>` : ''}</div></div></div>`);
    document.getElementById('again').onclick = () => { K.hide(); K.SND.startMusic([57, 0, 60, 62, 64, 0, 62, 60, 57, 0, 55, 57, 60, 0, 59, 57], 220, 'sawtooth'); this.scene.restart({ D, me: this.p.key, foe: this.e.key }); };
    document.getElementById('other').onclick = () => { K.hide(); K.SND.startMusic([57, 0, 60, 62, 64, 0, 62, 60, 57, 0, 55, 57, 60, 0, 59, 57], 220, 'sawtooth'); this.scene.start('Title'); setTimeout(() => pickDuel(this.scene.get('Title')), 50); }; }
  ai(dt) { const e = this.e, p = this.p; if (e.state === 'ko' || e.stun > 0) return; const d = this.dist(); e.blocking = false; e.aiT = (e.aiT || 0) - dt;
    if (e.meter >= 100 && d < (e.s.sp === 'shot' ? 700 : 380) && Math.random() < .02) return this.special(e);
    if (p.state === 'attack' && d < 230 && Math.random() < .5) { e.blocking = true; return; }
    if (d > 200) { e.mv = 1; } else if (d < 130) { e.mv = -1; } else { e.mv = 0; if (e.aiT <= 0) { this.attack(e); e.aiT = .5 + Math.random() * .7; } } }
  stepF(f, mv, dt) { if (f.state === 'ko') return; f.cd -= dt; if (f.stun > 0) { f.stun -= dt; if (f.stun <= 0) { f.state = 'idle'; f.sp.setTexture(f.key + '_idle'); } }
    else if (f.state === 'attack') { f.t += dt; const other = f === this.p ? this.e : this.p; if (!f.hitDone && f.t > .12) { f.hitDone = true; if (Math.abs(f.x - other.x) < 215 && Math.sign(other.x - f.x) === f.dir) this.hurt(other, 7 + Math.round(Math.random() * 3), f); } if (f.t > .32) { f.state = 'idle'; f.sp.setTexture(f.key + '_idle'); } }
    else if (f.state === 'dash') { f.t += dt; f.x += f.dir * 900 * dt; if (Math.random() < .6) this.dust.explode(2, f.x - f.dir * 40, FLOOR); const other = f === this.p ? this.e : this.p; if (!f.hitDone && Math.abs(f.x - other.x) < 175) { f.hitDone = true; this.hurt(other, 24, f, true); f.t = .5; } if (f.t > .45) { f.state = 'idle'; f.sp.setTexture(f.key + '_idle'); } }
    else if (f.blocking) f.sp.setTexture(f.key + '_block');
    else if (mv) { f.x += mv * f.dir * 250 * dt; f.walkT += dt; f.sp.setTexture(f.key + (Math.floor(f.walkT * 6) % 2 ? '_walk0' : '_walk1')); }
    else if (f.state === 'idle') f.sp.setTexture(f.key + '_idle');
    const other = f === this.p ? this.e : this.p; f.x = Phaser.Math.Clamp(f.x, 110, W - 110); if (Math.abs(f.x - other.x) < 105 && f.state !== 'dash') f.x = other.x - f.dir * 105;
    f.sp.x = f.x; }
  update(time, delta) { if (this.over || this.paused) return; const dt = Math.min(.05, delta / 1000);
    if (this.heraldCd > 0) this.heraldCd -= dt;
    // facing
    this.p.dir = this.e.x > this.p.x ? 1 : -1; this.e.dir = -this.p.dir; this.p.sp.setFlipX(this.p.dir < 0); this.e.sp.setFlipX(this.e.dir < 0);
    if (this.live) { this.clock -= dt; this.timerT.setText(String(Math.max(0, Math.ceil(this.clock)))); if (this.clock <= 0) { this.timeUp(); } }
    const k = this.keys, kd = n => k && k[n] && k[n].isDown;
    let mv = 0; if (this.live) { const left = this.btn.l || kd('LEFT') || kd('A'), right = this.btn.r || kd('RIGHT') || kd('D'); mv = (right ? 1 : 0) - (left ? 1 : 0); mv *= this.p.dir; this.p.blocking = this.btn.b || kd('K') || kd('S');
      if (k && (Phaser.Input.Keyboard.JustDown(k.J) || Phaser.Input.Keyboard.JustDown(k.SPACE))) this.attack(this.p); if (k && (Phaser.Input.Keyboard.JustDown(k.L) || Phaser.Input.Keyboard.JustDown(k.E))) this.special(this.p);
      this.ai(dt); }
    this.stepF(this.p, mv, dt); this.stepF(this.e, this.live ? this.e.mv || 0 : 0, dt);
    for (const s of this.shots) { s.x += s.dir * 700 * dt; s.pr.x = s.x; const t = s.from === this.p ? this.e : this.p; if (!s.dead && Math.abs(s.x - t.x) < 70) { s.dead = true; this.hurt(t, s.dmg, s.from, true); } if (s.x < -60 || s.x > W + 60) s.dead = true; if (s.dead) s.pr.destroy(); }
    this.shots = this.shots.filter(s => !s.dead);
    this.spBtn.setAlpha(this.p.meter >= 100 ? 1 : .45); if (this.p.meter >= 100 && !this.spGlow) { this.spGlow = this.tweens.add({ targets: this.spBtn, scale: 1.15, duration: 300, yoyo: true, repeat: -1 }); } if (this.p.meter < 100 && this.spGlow) { this.spGlow.stop(); this.spGlow = null; this.spBtn.setScale(1); }
    if (Math.random() < .1) this.drawHud(); }
}

K.game([Boot, Title, Fight]);
})();
