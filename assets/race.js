/* AOK English — Question Race (sinf o'yini, o'qituvchi boshqaradi) */
"use strict";
const BUILTIN = BANK.flatMap(s=>s.qs);
const VERBS = [["go","went"],["see","saw"],["eat","ate"],["drink","drank"],["write","wrote"],["take","took"],["come","came"],["buy","bought"],["make","made"],["run","ran"],["swim","swam"],["sing","sang"],["sleep","slept"],["read","read"],["give","gave"],["find","found"],["speak","spoke"],["drive","drove"],["fly","flew"],["have","had"],["do","did"],["get","got"],["know","knew"],["think","thought"],["sit","sat"],["begin","began"],["break","broke"],["teach","taught"],["catch","caught"],["tell","told"]];
const EMOJIS = ["🦁","🐯","🐵","🦊","🐼","🐨","🐸","🦉","🦄","🐲","🐙","🦋","🐢","🦜","🐬","🦓","🦒","🐘","🦩","🐝","🦔","🐧","🦀","🐳","🦖","🐊","🦥","🐿️","🦚","🐞"];
const SPEC = {
  2:{k:'gift'}, 3:{k:'ladder',to:10}, 4:{k:'plus',n:2}, 5:{k:'wheel'}, 6:{k:'quick'}, 7:{k:'trap'}, 8:{k:'card'}, 9:{k:'ask'},
  11:{k:'minus',n:1}, 12:{k:'duel'}, 13:{k:'monkey'}, 14:{k:'ladder',to:23}, 15:{k:'swap'}, 16:{k:'double'}, 17:{k:'storm'}, 18:{k:'ice'},
  19:{k:'arrow'}, 21:{k:'slide',to:16}, 22:{k:'eagle',n:3}, 24:{k:'duel'}, 25:{k:'wheel'}, 26:{k:'hourglass'}, 27:{k:'quick'}, 28:{k:'minus',n:2}, 29:{k:'slide',to:20}
};
const ICON = {ladder:'🌿',plus:'🍃',minus:'🌵',quick:'⚡',card:'🃏',ask:'❓',duel:'⚔️',swap:'🔄',ice:'❄️',slide:'🐍',
  gift:'🎁',wheel:'🎡',trap:'🕳️',monkey:'🐒',storm:'🌪️',arrow:'🏹',double:'🔮',eagle:'🦅',hourglass:'⏳'};
const LABEL = {ladder:'TEZ YO‘L',plus:'+',minus:'−',quick:'TEZKOR',card:'YANA KARTA',ask:'SAVOL BER',duel:'DUEL',swap:'ALMASHTIR',ice:'MUZ',slide:'SIRPANCHIQ',
  gift:'SOVG‘A',wheel:'G‘ILDIRAK',trap:'BOTQOQ',monkey:'MAYMUN',storm:'BO‘RON',arrow:'NISHON',double:'KO‘ZGU',eagle:'BURGUT',hourglass:'QUM SOATI'};
const LEGEND = [['plus','<b>+1/+2</b> oldinga'],['minus','<b>−1/−2</b> ortga'],['ladder','<b>Tez yo‘l</b> narvon'],['slide','<b>Sirpanchiq</b> ilon'],
  ['card','<b>Yana karta</b>'],['quick','<b>Tezkor</b> V2 fe’llar'],['duel','<b>Duel</b> bellashuv'],['swap','<b>Almashtir</b> joy'],['ask','<b>Savol ber</b>'],
  ['ice','<b>Muz</b> muzlash'],['gift','<b>Sovg‘a</b> do‘stga +1'],['wheel','<b>G‘ildirak</b> taqdir'],['trap','<b>Botqoq</b> yoki −3'],['monkey','<b>Maymun</b> o‘g‘irlaydi'],
  ['storm','<b>Bo‘ron</b> hammaga −1'],['arrow','<b>Nishon</b> raqibga −2'],['double','<b>Ko‘zgu</b> 2 karta'],['eagle','<b>Burgut</b> +3 uchish'],['hourglass','<b>Qum soati</b> 30 s']];
const VERSES = {
  plus:["Shamol esdi orqangdan, qanot bitdi yelkangdan — {n} qadam olg‘a, botir!","Jungli seni olqishlar, yo‘l o‘zi oldinga boshlar — {n} qadam oldinga!","Daryo oqimi seni ko‘tardi, qayiqchang yelday uchdi — {n} qadam ilgari!"],
  minus:["Tikanli butalar yo‘lingni to‘sdi, chakalakzor oyog‘ingni bosdi — {n} qadam ortga!","Botqoq seni ushladi, yo‘l orqaga burildi — {n} qadam ortga qayt!","Qoyadan tosh qulab tushdi, so‘qmoq birdan yopildi — {n} qadam chekin!"],
  ladder:["Daraxtdan liana tushdi osmondan, ushla uni qo‘rqmasdan — yuqoriga chiq, {to}-katakka!","Qadimiy narvon uyg‘ondi, botirlar uchun yo‘l ochildi — {to}-katakka ko‘taril!","Ildizlar zinapoya bo‘ldi, yashil yo‘lak porladi — {to}-katakka chiq!"],
  slide:["Yer tagidan ilon chiqdi, yo‘lingga zahar sochdi… Pastga sudrar seni u — {to}-katakka!","Sirpanchiq tosh, sovuq ilon — pastga tortar beomon… {to}-katakka tushasan!","Anakonda dumini silkitdi, yer silkinib ketdi… {to}-katakka sirpanasan!"],
  card:["Sehrli sandiq ochildi, ichidan yana bir sir sochildi — yana bitta karta ol!","Jungli hali tinchimadi, yana bir savol kutmoqda seni — karta ol!","Oltin barg qo‘lingga tushdi, ustida yangi topishmoq — karta ol!"],
  quick:["Daryo toshdi, vaqt oz qoldi, tez bo‘l — yo‘l shu on ochildi! O‘n soniya ichida uch fe’lni o‘tgan zamonga aylantir!","Chaqmoq chaqdi osmonda, chaqqon bo‘l bu zamonda — 10 soniya, 3 fe’l!","Gepard yonimdan o‘tdi, shamoldek g‘oyib bo‘ldi — sen ham tez bo‘l: 10 soniya, 3 fe’l!"],
  duel:["Ikki sher bir cho‘qqida, kim kuchli — bilinar shu daqiqada! Raqibingni tanla!","Jungli nog‘orasi chalindi, bellashuv vaqti keldi — raqibingni chaqir!","Ikki burgut bir osmonda, joy bitta — kim tezroq? Raqibingni tanla!"],
  swap:["Sehrgar tayog‘ini silkitdi, yo‘llar o‘rnini almashtirdi… To‘g‘ri javob bersang — istagan joyingga ko‘chasan!","Ko‘zgu ichra yo‘l ochildi, ikki yo‘lchi o‘rin almashdi — avval savolni yech!","Tuman quyuqlashdi, yo‘llar aralashdi — to‘g‘ri javob bersang, xohlagan o‘rinni olasan!"],
  ask:["Endi sehrgar sen bo‘lding, savolni o‘zing tuzding — kim javob bersa, sovg‘ani teng bo‘lishing!","Jungli tilini sen bilasan — o‘zing savol ber, do‘stingni sina!","To‘tiqush gapirib qoldi: «Savolni sen ber!» — do‘stingni tanla!"],
  ice:["Shimol shamoli esdi qattiq, oyog‘ing muzga botdi mahkam… Keyingi navbatda to‘g‘ri javob bersang — muz eriydi, undan keyingi navbatda yurasan.","Muz qal’asi seni yutdi, sovuq shamol qotirdi… To‘g‘ri javob — muzni eritadigan olov! Erigach, keyingi navbatda yo‘lga chiqasan.","Qor bo‘roni yo‘lingni to‘sdi, tizzangacha muz qotdi… Keyingi navbatda to‘g‘ri javob — erish, undan keyin — yo‘l."],
  melt:["Bilim olovi yondi, muz qal’asi qulab tushdi — sen yana erkinsan!","Quyosh chiqdi, muz tomchiladi — oyoqlaring yana erkin!","Aqling o‘choqdek qizidi, muz bug‘ bo‘lib uchdi — ozodsan!"],
  frozen:["Muz hali erimadi… Sabr qil, keyingi navbatda yana urinib ko‘r.","Sovuq hali ketmadi… Keyingi navbatda yana bir urinish.","Muz qattiq ekan… Keyingi safar albatta erishiga ishon!"],
  win:["Jungli seni tan oldi! Barcha sinovlardan o‘tding — sen g‘olibsan!","Sherlar ta’zim qildi, burgutlar qanot qoqdi — sen g‘olibsan!"],
  gift:["Qadimiy daraxt ostida sovg‘a qutisi topding! To‘g‘ri javob bersang — o‘zingga +1, bir do‘stingga ham +1!","Jungli saxiy bo‘ldi bugun — savolni yech, o‘zing ham, do‘sting ham bir qadam oldinga!","Kapalaklar lenta bog‘ladi, ichida sir bor — to‘g‘ri javob: senga +1, do‘stingga +1!"],
  wheel:["Taqdir g‘ildiragi aylandi, jungli nafasini ichiga yutdi… Qayerda to‘xtarkin?","Qadimiy tosh g‘ildirak uyg‘ondi — omad senga kulib boqarmikan?","G‘ildirak aylanar, taqdiring yozilar — aylantir-chi!"],
  trap:["Oyog‘ing botqoqqa botdi, loy seni pastga tortmoqda… To‘g‘ri javob bersang — qutulasan, xato bo‘lsa — 3 qadam ortga!","Qumloq botqoq yutmoqchi seni! Faqat bilim qutqaradi — xato bo‘lsa, 3 qadam ortga!","Pufakchalar ko‘tarildi, yer yumshab ketdi… Savolga javob ber — aks holda 3 qadam ortga!"],
  monkey:["Shoxdan shoxga sakrab o‘g‘ri maymun keldi — oldindagidan bir qadam o‘g‘irlab, senga berdi!","Maymun bananni tortib oldi-yu qochdi — eng oldindagi −1, sen +1!","Hiylagar maymun hazil qildi — yetakchining bir qadamini senga uzatdi!"],
  storm:["Osmon qorong‘i tortdi, bo‘ron qo‘zg‘aldi — hamma 1 qadam ortga uchdi, faqat sen joyingda qolding!","Girdob kelib daraxtlarni egdi — sendan boshqa hamma 1 qadam ortga!","Momaqaldiroq gumburladi, shamol hammani surdi — sen esa tik turibsan!"],
  arrow:["Kamoningni tortding, nishonni ko‘zlading… To‘g‘ri javob bersang — tanlagan raqibing 2 qadam ortga!","O‘q kamondan uzildi — avval savolni yech, keyin kimni nishonga olishingni tanla!","Ovchi ko‘zi o‘tkir bo‘ladi — to‘g‘ri javob: raqibingga −2!"],
  double:["Sehrli ko‘zgu ikki savolni aks ettirdi — har bir to‘g‘ri javob uchun +1 qadam!","Ko‘zgu ichida ikki yo‘l ko‘rinmoqda — ikkalasini ham bos: har biri +1!","Oy nuri ko‘zguga tushdi, ikki karta yondi — har to‘g‘ri javobga +1!"],
  eagle:["Osmondan burgut tushdi, seni qanotiga oldi — 3 qadam oldinga uchasan!","Burgut sening jasoratingni ko‘rdi — uch katak oshib uchirdi!","Bulutlar ustida parvoz — burgut seni 3 qadam oldinga eltdi!"],
  hourglass:["Qum soati ag‘darildi, qum tez oqmoqda — 30 soniyada uchta savol! Har to‘g‘ri javob — bir qadam.","Vaqt qum bo‘lib to‘kilmoqda — 30 soniya, 3 savol, har biri +1!","Sehrgar soatini ag‘dardi: tez o‘yla, tez ayt — 3 savol, 30 soniya!"]
};
const KIND_TITLE = {plus:'OLG‘A!',minus:'ORTGA!',ladder:'TEZ YO‘L',slide:'SIRPANCHIQ',card:'YANA KARTA',quick:'TEZKOR',duel:'DUEL',swap:'ALMASHTIR',ask:'SAVOL BER',ice:'MUZ',melt:'MUZ ERIDI',frozen:'MUZLAGAN',win:'G‘OLIB!',
  gift:'SOVG‘A',wheel:'TAQDIR G‘ILDIRAGI',trap:'BOTQOQ',monkey:'O‘G‘RI MAYMUN',storm:'BO‘RON',arrow:'NISHON',double:'SEHRLI KO‘ZGU',eagle:'BURGUT',hourglass:'QUM SOATI'};

/* ---------------- geometry ---------------- */
const NODES = {};
(function(){ let n=1; for(let r=0;r<5;r++){ const y=480-r*105; const cols=[0,1,2,3,4,5]; if(r%2) cols.reverse(); for(const c of cols){ NODES[n]={x:55+c*98,y}; n++; } } })();

/* ---------------- state ---------------- */
let S = null;  // {players:[{id,name,em,pos,frozen,done,place}], turn, deck:[], log:[], places}
let history = [];
let soundOn = true;
const KEY='qrace-v1';
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
function load(){ try{ const v=JSON.parse(localStorage.getItem(KEY)); if(v && v.players && v.players.length) return v; }catch(e){} return null; }
function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
function newDeck(){ return []; } // (eski versiya bilan moslik) — savollar endi takrorlanmas tartibda tortiladi
const qkey=q=>(String(q.q)+'|'+String(q.a)).toLowerCase().replace(/\s+/g,' ').trim();
let USED=null, LASTSEC='';
function usedSet(){ if(!USED){ try{ USED=new Set(JSON.parse(localStorage.getItem('qrace-used')||'[]')); }catch(e){ USED=new Set(); } } return USED; }
function saveUsed(){ try{ localStorage.setItem('qrace-used', JSON.stringify([...usedSet()].slice(-3000))); }catch(e){} }
function usedCount(){ const U=usedSet(); return pool().filter(q=>U.has(qkey(q))).length; }
function resetUsed(){ const U=usedSet(); for(const q of pool()) U.delete(qkey(q)); saveUsed(); }
function draw(){ // tanlangan mavzulardagi BARCHA savollar chiqmaguncha bittasi ham takrorlanmaydi; mavzular aralash beriladi
  const P=pool(), U=usedSet(); let av=P.filter(q=>!U.has(qkey(q)));
  if(!av.length){ resetUsed(); av=P; toast('♻ Tanlangan mavzulardagi barcha savollar ishlatildi — endi qaytadan aralashtirildi'); if(S&&S.log) log('♻ Barcha savollar tugadi — dasta qayta aralashtirildi'); }
  let c=av.filter(q=>q.sec!==LASTSEC); if(!c.length) c=av;
  const q=c[Math.floor(Math.random()*c.length)]; U.add(qkey(q)); LASTSEC=q.sec||''; saveUsed(); return q;
}
function toast(msg){ const t=document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t); t.animate([{opacity:0,transform:'translate(-50%,20px)'},{opacity:1,transform:'translate(-50%,0)',offset:.1},{opacity:1,offset:.85},{opacity:0}],{duration:4200}).onfinish=()=>t.remove(); }
const cur = () => S.players[S.turn];
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const esc = s => String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------------- sound (Web Audio) ---------------- */
let AC=null;
function ac(){ if(!AC){ try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } if(AC && AC.state==='suspended') AC.resume(); return AC; }
function tone(f, d=.15, type='sine', v=.18, t0=0, f2=null){
  if(!soundOn) return; const a=ac(); if(!a) return; const t=a.currentTime+t0;
  const o=a.createOscillator(), g=a.createGain(); o.type=type; o.frequency.setValueAtTime(f,t); if(f2) o.frequency.exponentialRampToValueAtTime(f2,t+d);
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(v,t+.012); g.gain.exponentialRampToValueAtTime(0.0001,t+d);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t+d+.05);
}
function noise(d=.3, v=.15, t0=0, from=800, to=3000){
  if(!soundOn) return; const a=ac(); if(!a) return; const t=a.currentTime+t0;
  const b=a.createBuffer(1, a.sampleRate*d, a.sampleRate), ch=b.getChannelData(0); for(let i=0;i<ch.length;i++) ch[i]=Math.random()*2-1;
  const s=a.createBufferSource(); s.buffer=b; const f=a.createBiquadFilter(); f.type='bandpass'; f.frequency.setValueAtTime(from,t); f.frequency.exponentialRampToValueAtTime(to,t+d);
  const g=a.createGain(); g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(0.0001,t+d); s.connect(f).connect(g).connect(a.destination); s.start(t);
}
const SFX = {
  step:i=>{ tone(330+i*45,.09,'triangle',.16); tone(660+i*90,.05,'sine',.05); },
  back:i=>{ tone(300-i*30,.11,'triangle',.15); },
  card:()=>{ noise(.35,.18,0,500,4000); tone(880,.12,'sine',.06,.18); },
  flip:()=>{ noise(.18,.12,0,2000,6000); },
  correct:()=>{ [523,659,784,1047].forEach((f,i)=>tone(f,.22,'triangle',.16,i*.08)); },
  wrong:()=>{ tone(220,.25,'sawtooth',.12,0,160); tone(165,.35,'sawtooth',.12,.2,110); },
  drum:()=>{ [0,.18,.36,.48,.6].forEach((t,i)=>{ tone(i%2?120:85,.22,'sine',.5,t,45); noise(.06,.05,t,200,400); }); },
  ladder:()=>{ [392,440,494,523,587,659,698,784,880].forEach((f,i)=>tone(f,.14,'square',.06,i*.07)); },
  slide:()=>{ tone(900,1.1,'sine',.2,0,120); noise(.9,.06,0,3000,300); tone(140,.4,'sawtooth',.06,.9,90); },
  ice:()=>{ [1568,2093,1760,2637,2349].forEach((f,i)=>tone(f,.5,'sine',.06,i*.07)); noise(.6,.04,0,6000,9000); },
  melt:()=>{ [988,784,659,523].forEach((f,i)=>tone(f,.25,'sine',.1,i*.09)); },
  swap:()=>{ tone(300,.6,'sine',.12,0,900); tone(900,.6,'sine',.12,0,300); },
  clang:()=>{ tone(1400,.3,'square',.08); tone(1900,.25,'square',.05,.02); noise(.15,.1,0,4000,8000); },
  tick:()=>tone(1200,.04,'square',.06),
  buzz:()=>tone(110,.6,'sawtooth',.18,0,80),
  win:()=>{ [523,523,523,659,784,659,784,1047].forEach((f,i)=>tone(f,.3,'triangle',.18,[0,.14,.28,.42,.62,.86,1.0,1.2][i])); setTimeout(SFX.drum,1500); },
  plus:()=>{ tone(600,.3,'sine',.12,0,1200); noise(.4,.05,0,1000,5000); },
  minus:()=>{ tone(500,.35,'sine',.12,0,200); }
};

/* ---------------- board drawing ---------------- */
function drawBoard(){
  const svg=document.getElementById('svg'); let h='';
  h+=`<defs>
    <radialGradient id="g-bg" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#245236"/><stop offset="1" stop-color="#0f2618"/></radialGradient>
    <radialGradient id="g-tile" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fff6dc"/><stop offset="1" stop-color="#dcc38c"/></radialGradient>
    <radialGradient id="g-spec" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ffe9a8"/><stop offset="1" stop-color="#d79e2e"/></radialGradient>
    <radialGradient id="g-end" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#5a3a14"/><stop offset="1" stop-color="#20140a"/></radialGradient>
    <pattern id="p-snake" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#9bc23a"/><path d="M0 7 L7 0 L14 7 L7 14Z" fill="#5d7f1a"/></pattern>
  </defs>`;
  h+=`<rect width="600" height="540" fill="url(#g-bg)"/>`;
  // leafy decor
  const decor=[['🌴',22,525,34],['🌴',580,30,30],['🦜',160,440,22],['🌺',150,328,18],['🍃',450,328,18],['🌿',300,223,20],['🦋',360,112,18],['🐒',120,118,22],['🌋',560,433,22],['🗿',35,223,22]];
  for(const [e,x,y,s] of decor) h+=`<text x="${x}" y="${y}" font-size="${s}" text-anchor="middle" opacity=".5">${e}</text>`;
  // path
  let d=`M${NODES[1].x},${NODES[1].y}`;
  for(let i=2;i<=30;i++){ const a=NODES[i-1], b=NODES[i]; if(a.y===b.y) d+=` L${b.x},${b.y}`; else { const bx=a.x>300?598:2; d+=` C${bx},${a.y} ${bx},${b.y} ${b.x},${b.y}`; } }
  h+=`<path d="${d}" fill="none" stroke="#3b2a12" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/>`;
  h+=`<path d="${d}" fill="none" stroke="#8a6a3a" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/>`;
  h+=`<path d="${d}" fill="none" stroke="#c9a46a" stroke-width="2" stroke-dasharray="6 7" opacity=".7"/>`;
  // ladders & slides
  for(const [k,v] of Object.entries(SPEC)){
    const a=NODES[k], b=NODES[v.to];
    if(v.k==='ladder'){
      const y1=a.y-36, y2=b.y+36;
      h+=`<g><line x1="${a.x-11}" y1="${y1}" x2="${b.x-11}" y2="${y2}" stroke="#4e8a2c" stroke-width="5" stroke-linecap="round"/><line x1="${a.x+11}" y1="${y1}" x2="${b.x+11}" y2="${y2}" stroke="#4e8a2c" stroke-width="5" stroke-linecap="round"/>`;
      for(let y=y1-6;y>y2+2;y-=9) h+=`<line x1="${a.x-11}" y1="${y}" x2="${a.x+11}" y2="${y}" stroke="#a7d46b" stroke-width="3.2" stroke-linecap="round"/>`;
      h+=`<text x="${a.x+28}" y="${(y1+y2)/2+5}" font-size="13" font-weight="900" fill="#d9f0c7" font-family="Nunito,sans-serif">↑ ${v.to}</text></g>`;
    }
    if(v.k==='slide'){
      const y1=a.y+34, y2=b.y-38, hh=y2-y1, x=a.x;
      const p=`M${x},${y1} C${x+26},${y1+hh*.25} ${x-26},${y1+hh*.45} ${x},${y1+hh*.6} S${x+18},${y1+hh*.85} ${x},${y2}`;
      h+=`<path d="${p}" fill="none" stroke="#2c3d0b" stroke-width="15" stroke-linecap="round"/><path d="${p}" fill="none" stroke="url(#p-snake)" stroke-width="11" stroke-linecap="round"/>`;
      h+=`<ellipse cx="${x}" cy="${y1-1}" rx="9" ry="7" fill="#9bc23a" stroke="#2c3d0b" stroke-width="2.5"/><circle cx="${x-3.5}" cy="${y1-3}" r="1.6" fill="#111"/><circle cx="${x+3.5}" cy="${y1-3}" r="1.6" fill="#111"/>`;
      h+=`<text x="${x+24}" y="${(y1+y2)/2+5}" font-size="13" font-weight="900" fill="#ffc2a8" font-family="Nunito,sans-serif">↓ ${v.to}</text>`;
    }
  }
  // tiles
  for(let i=1;i<=30;i++){
    const {x,y}=NODES[i], s=SPEC[i];
    if(i===1||i===30){
      h+=`<circle cx="${x}" cy="${y}" r="40" fill="url(#g-end)" stroke="#e6b54a" stroke-width="4"/>`;
      h+=`<text x="${x}" y="${y-8}" text-anchor="middle" font-size="20">${i===1?'🚩':'🏆'}</text>`;
      h+=`<text x="${x}" y="${y+18}" text-anchor="middle" font-size="12" font-weight="900" fill="#f6d98b" font-family="Cinzel,serif" letter-spacing="1">${i===1?'START':'FINISH'}</text>`;
      continue;
    }
    if(s){
      let pts=''; for(let k=0;k<24;k++){ const an=-Math.PI/2+k*Math.PI/12, rr=k%2?34:39; pts+=`${(x+rr*Math.cos(an)).toFixed(1)},${(y+rr*Math.sin(an)).toFixed(1)} `; }
      h+=`<polygon points="${pts}" fill="#5a3a14" stroke="#e6b54a" stroke-width="1.5"/>`;
      h+=`<circle cx="${x}" cy="${y}" r="31" fill="url(#g-spec)" stroke="#6b4b1b" stroke-width="2"/>`;
      h+=`<text x="${x}" y="${y-9}" text-anchor="middle" font-size="16">${ICON[s.k]}</text>`;
      h+=`<text x="${x}" y="${y+10}" text-anchor="middle" font-size="15" font-weight="900" fill="#2b1d0d" font-family="Nunito,sans-serif">${i}</text>`;
      const lab = s.k==='plus'?'+'+s.n : s.k==='minus'?'−'+s.n : LABEL[s.k];
      h+=`<text x="${x}" y="${y+22}" text-anchor="middle" font-size="${lab.length>6?6.6:9}" font-weight="900" fill="#2b1d0d" font-family="Nunito,sans-serif">${lab}</text>`;
    } else {
      h+=`<circle cx="${x}" cy="${y}" r="32" fill="url(#g-tile)" stroke="#6b4b1b" stroke-width="2.5"/><circle cx="${x}" cy="${y}" r="27" fill="none" stroke="#b88c3a" stroke-width="1" stroke-dasharray="3 3"/>`;
      h+=`<text x="${x}" y="${y+8}" text-anchor="middle" font-size="22" font-weight="900" fill="#2b1d0d" font-family="Nunito,sans-serif">${i}</text>`;
    }
  }
  svg.innerHTML=h;
}

/* ---------------- render ---------------- */
function renderTokens(){
  const box=document.getElementById('toks'); const groups={};
  S.players.forEach((p,i)=>{ (groups[p.pos]=groups[p.pos]||[]).push(i); });
  const existing={}; box.querySelectorAll('.tok').forEach(el=>existing[el.dataset.id]=el);
  const seen=new Set();
  for(const [pos,arr] of Object.entries(groups)){
    const n=arr.length, cols=Math.ceil(Math.sqrt(n)), rows=Math.ceil(n/cols), cell=Math.min(7.2, 10.5/cols);
    arr.forEach((pi,k)=>{
      const p=S.players[pi], node=NODES[pos];
      const cx=(k%cols)-(cols-1)/2, cy=Math.floor(k/cols)-(rows-1)/2;
      const left=(node.x/600*100)+cx*cell, top=(node.y/540*100)+cy*cell*600/540;
      let el=existing[p.id]; if(!el){ el=document.createElement('div'); el.className='tok'; el.dataset.id=p.id; box.appendChild(el); }
      el.style.left=left+'%'; el.style.top=top+'%';
      el.style.width=el.style.height=(cell*.92)+'cqw'; el.style.fontSize=(cell*.62)+'cqw';
      el.textContent=p.em; el.title=p.name+' — '+p.pos+'-katak';
      el.classList.toggle('cur', pi===S.turn && !p.done);
      el.classList.toggle('frozen', !!p.frozen);
      seen.add(String(p.id));
    });
  }
  for(const [id,el] of Object.entries(existing)) if(!seen.has(id)) el.remove();
}
function renderPanel(){
  const p=cur();
  document.getElementById('tEm').textContent=p?p.em:'🏁';
  document.getElementById('tNm').textContent=p?p.name:'—';
  document.getElementById('tSt').textContent=p? (p.frozen?'❄ Muzlagan — to‘g‘ri javob muzni eritadi, keyingi navbatda yuradi':`${p.pos}-katakda · finishgacha ${30-p.pos} qadam`) : '';
  const order=S.players.map((p,i)=>({...p,i})).sort((a,b)=> (a.place||99)-(b.place||99) || b.pos-a.pos);
  document.getElementById('rank').innerHTML=order.map((p,k)=>`<li class="${p.i===S.turn?'cur':''}"><span class="n">${k+1}</span><span class="e">${p.em}</span><span class="nm">${esc(p.name)}${p.frozen?' ❄':''}</span><span class="ps ${p.done?'fin':''}">${p.done?('🏆 '+p.place+'-o‘rin'):p.pos}</span></li>`).join('');
  document.getElementById('log').innerHTML=S.log.slice(-40).reverse().map(l=>`<li>${l}</li>`).join('');
  document.getElementById('bUndo').disabled=!history.length;
  document.getElementById('bSound').textContent=soundOn?'🔊 Ovoz':'🔇 Ovozsiz';
}
function render(){ renderTokens(); renderPanel(); save(); }
function log(html){ S.log.push(html); if(S.log.length>200) S.log.shift(); }
const who = p => `${p.em} <b>${esc(p.name)}</b>`;

/* ---------------- modal helpers ---------------- */
function openModal(html, onMount){
  return new Promise(resolve=>{
    const root=document.getElementById('ovroot'); const ov=document.createElement('div'); ov.className='ov';
    ov.innerHTML=`<div class="modal" role="dialog" aria-modal="true">${html}</div>`; root.appendChild(ov);
    const done=v=>{ ov.remove(); resolve(v); };
    ov.querySelectorAll('[data-v]').forEach(b=>b.addEventListener('click',()=>done(b.dataset.v)));
    if(onMount) onMount(ov, done);
    const f=ov.querySelector('[autofocus],.btn'); if(f) f.focus();
  });
}
function verseHTML(text){ return text.split(' ').map((w,i)=>`<span style="animation-delay:${(i*0.07).toFixed(2)}s">${esc(w)}</span>`).join(' '); }
function omen(kind, vars={}, rule='', buttons=[{v:'ok',label:'Davom etish →',cls:'gold big'}], extra=''){
  let t=verseFor(kind); setTimeout(()=>fx(kind),60);
  t=t.replace('{n}',vars.n??'').replace('{to}',vars.to??'');
  const glyph = kind==='melt'?'🔥':kind==='frozen'?'🧊':kind==='win'?'🏆':ICON[kind];
  return openModal(`<div class="omen"><div class="glyph">${glyph}</div><div class="kind">${KIND_TITLE[kind]}</div>
    <div class="verse">${verseHTML(t)}</div>${rule?`<div class="rule">${rule}</div>`:''}${extra}</div>
    <div class="row center">${buttons.map(b=>`<button class="btn ${b.cls||''}" data-v="${b.v}">${b.label}</button>`).join('')}</div>`);
}
function cardFront(q){
  let txt=esc(q.q);
  if(q.x) txt=txt.replace(esc(q.x), `<mark>${esc(q.x)}</mark>`);
  if(q.h) txt=txt.replace(esc(q.h), `<mark>${esc(q.h)}</mark>`);
  const pp=Math.min(3,Math.max(1,+q.p||1)); const stars='★'.repeat(pp)+`<span class="off">${'★'.repeat(3-pp)}</span>`;
  const hint = q.h?`Tagiga chizilgan so‘zga savol bering`: q.x?`Tagiga chizilgan xatoni to‘g‘rilang`:'';
  return `<div class="hd"><span class="chip">${esc(q.t)}</span>${q.sec?`<span class="secl">${esc(q.sec)}</span>`:''}<span class="stars" aria-label="${q.p} ball">${stars}</span></div>
    <div class="q">${txt}</div>${hint?`<div class="hint">${hint}</div>`:''}
    <div class="ans hide" id="ans">Javob: ${esc(q.a)}</div>`;
}
/* card modal: shows the drawn card, flip, reveal answer; buttons customizable */
function cardModal(q, title, buttons){
  return openModal(`<h2>${title}</h2>
    <div class="qcard"><div class="qinner" id="qi"><div class="face back"><div class="seal">?</div><div class="tap">Kartani ochish uchun bosing</div></div><div class="face front">${cardFront(q)}</div></div></div>
    <div class="row center"><button class="btn" id="bRev">👁 Javobni ko‘rsatish</button></div>
    ${buttons}`, (ov)=>{
      const qi=ov.querySelector('#qi'); SFX.card();
      setTimeout(()=>{ qi.classList.add('flip'); SFX.flip(); }, 550);
      qi.addEventListener('click',()=>{ if(!qi.classList.contains('flip')){ qi.classList.add('flip'); SFX.flip(); } });
      ov.querySelector('#bRev').addEventListener('click',e=>{ ov.querySelector('#ans').classList.remove('hide'); e.target.disabled=true; qi.classList.add('flip'); });
    });
}
const frozenBtns = `<p class="muted" style="text-align:center;margin:12px 0 0">❄ Muzlagan: to‘g‘ri javob muzni eritadi, yurish — keyingi navbatda.</p><div class="row center"><button class="btn green big" data-v="1">✔ To‘g‘ri — muz eriydi</button><button class="btn red big" data-v="0">✘ Xato — muzda qoladi</button></div>`;
const judgeBtns = `<div class="row center"><button class="btn green big" data-v="1">✔ To‘g‘ri</button><button class="btn red big" data-v="0">✘ Xato</button></div>`;
function pointsBtns(sugg){
  return `<div class="pts">
    <button class="btn red" data-v="0">Xato<small>0 qadam</small></button>
    ${[1,2,3].map(n=>`<button class="btn green ${n===sugg?'sugg':''}" data-v="${n}">+${n}<small>${n===sugg?'karta bali':'qadam'}</small></button>`).join('')}
  </div>`;
}
function pickPlayer(title, text, exclude){
  const list=S.players.map((p,i)=>({p,i})).filter(o=>!exclude.includes(o.i) && !o.p.done);
  if(!list.length) return Promise.resolve(null);
  return openModal(`<h2>${title}</h2><p class="muted">${text}</p><div class="pick">${list.map(o=>`<button class="btn" data-v="${o.i}"><span style="font-size:22px">${o.p.em}</span><span class="n">${esc(o.p.name)}</span></button>`).join('')}</div>
    <div class="row center"><button class="btn ghost" data-v="-1">Bekor qilish</button></div>`).then(v=>{ v=+v; return v<0?null:v; });
}

/* ---------------- movement ---------------- */
async function moveBy(pi, n){
  const p=S.players[pi]; const dir=Math.sign(n);
  for(let k=0;k<Math.abs(n);k++){
    const np=p.pos+dir; if(np<1||np>30) break;
    p.pos=np; renderTokens(); (dir>0?SFX.step:SFX.back)(k); await sleep(300);
    if(p.pos===30) break;
  }
  render();
}
async function jumpTo(pi, pos, sfx){
  const p=S.players[pi]; const el=document.querySelector(`.tok[data-id="${p.id}"]`);
  if(el) el.classList.add('jump'); if(sfx) sfx();
  p.pos=pos; renderTokens(); await sleep(800); if(el) el.classList.remove('jump'); render();
}
async function checkWin(pi){
  const p=S.players[pi]; if(p.pos<30 || p.done) return false;
  p.done=true; S.places=(S.places||0)+1; p.place=S.places;
  log(`🏆 ${who(p)} FINISHga yetdi — ${p.place}-o‘rin!`); render(); SFX.win(); confetti();
  const left=S.players.filter(x=>!x.done).length;
  const v=await omen('win',{}, `${p.em} <b>${esc(p.name)}</b> — ${p.place}-o‘rin!`, left>1?[{v:'go',label:'Qolganlar davom etsin →',cls:'gold big'},{v:'new',label:'Yangi o‘yin',cls:''}]:[{v:'new',label:'Yangi o‘yin',cls:'gold big'},{v:'go',label:'Taxtani ko‘rish',cls:''}]);
  if(v==='new'){ openSetup(); }
  return true;
}

/* ---------------- effects: har bir shartga o'z effekti ---------------- */
const FXK = {
  plus:{m:'wind',e:['🍃','🍂','🌿','🍃'],n:26,d:1500,tint:'124,196,106'},
  minus:{m:'rain',e:['🌵','✴️','🥀'],n:22,d:1300,tint:'212,87,46',shake:1},
  ladder:{m:'rise',e:['🌿','🍃','✨','🌱'],n:30,d:1700,tint:'124,196,106',glow:1},
  slide:{m:'sink',e:['🐍','🌀','💚'],n:20,d:1600,tint:'40,70,20',wobble:1},
  card:{m:'burst',e:['✨','⭐','🃏','💛'],n:30,d:1300,tint:'246,217,139'},
  quick:{m:'zig',e:['⚡'],n:9,d:1100,tint:'143,216,238',flash:3},
  duel:{m:'cross',e:['⚔️','🗡️','💥'],n:10,d:1200,tint:'230,120,40',flash:1,shake:1},
  swap:{m:'orbit',e:['🔄','🌀','💫'],n:16,d:1700,tint:'150,90,220'},
  ask:{m:'float',e:['❓','❔','💬'],n:20,d:1800,tint:'80,200,190'},
  ice:{m:'snow',e:['❄️','❅','❆'],n:34,d:2200,tint:'190,230,255',frost:1},
  melt:{m:'rise',e:['🔥','✨','💧'],n:24,d:1500,tint:'255,140,40'},
  gift:{m:'burst',e:['🎁','🎉','🎈','🎀'],n:26,d:1500,tint:'255,120,170'},
  wheel:{m:'orbit',e:['🎡','🍀','🎲','⭐'],n:14,d:1900,tint:'255,210,80',hue:1},
  trap:{m:'bubble',e:['🫧','🟤','💧'],n:24,d:1900,tint:'110,75,30'},
  monkey:{m:'sweep',e:['🐒'],n:1,d:1500,big:1,trail:['🍌','🍌','🍌'],tint:'240,200,60'},
  storm:{m:'gust',e:['🌪️','💨','🍂','🌫️'],n:30,d:1400,tint:'120,130,140',shake:2},
  arrow:{m:'volley',e:['🏹','➶'],n:7,d:1100,tint:'200,60,40'},
  double:{m:'orbit',e:['🔮','✨','🌙'],n:18,d:1800,tint:'120,70,200'},
  eagle:{m:'sweep',e:['🦅'],n:1,d:1600,big:1,trail:['🪶','🪶','🪶'],tint:'180,220,255'},
  hourglass:{m:'sand',e:['⏳','·','•'],n:40,d:2000,tint:'200,160,80'},
  win:{m:'burst',e:['🏆','👑','⭐','🎊'],n:30,d:1800,tint:'246,217,139'}
};
function fxLayer(){ let L=document.getElementById('fx'); if(!L){ L=document.createElement('div'); L.id='fx'; document.body.appendChild(L); } return L; }
function fx(kind){
  try{
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c=FXK[kind]; if(!c) return; const L=fxLayer(); const W=innerWidth, H=innerHeight, cx=W/2, cy=H/2, R=Math.min(W,H);
    const rnd=(a,b)=>a+Math.random()*(b-a), pick=a=>a[Math.floor(Math.random()*a.length)];
    const tint=document.createElement('div'); tint.className='fxtint'; L.appendChild(tint);
    tint.style.background=c.frost?`radial-gradient(circle at 50% 50%, rgba(${c.tint},0) 35%, rgba(${c.tint},.55) 100%)`:`radial-gradient(circle at 50% 50%, rgba(${c.tint},0) 25%, rgba(${c.tint},.35) 100%)`;
    tint.animate([{opacity:0},{opacity:1,offset:.25},{opacity:0}],{duration:c.d*1.25,easing:'ease-out'}).onfinish=()=>tint.remove();
    if(c.flash){ const f=document.createElement('div'); f.className='fxflash'; L.appendChild(f); const kf=[]; for(let i=0;i<c.flash;i++){ kf.push({opacity:0},{opacity:.85},{opacity:0}); } f.animate(kf,{duration:260*c.flash}).onfinish=()=>f.remove(); }
    const wrap=document.querySelector('.wrap');
    if(c.shake&&wrap){ const a=c.shake*7; wrap.animate([0,1,2,3,4,5,6,7].map(i=>({transform:`translate(${i%2?a:-a}px,${i%3?-a/2:a/2}px)`})).concat([{transform:'none'}]),{duration:520}); }
    if(c.wobble){ const b=document.querySelector('.boardbox'); b&&b.animate([{transform:'none'},{transform:'rotate(-2.5deg) scale(.98)'},{transform:'rotate(2deg)'},{transform:'rotate(-1deg)'},{transform:'none'}],{duration:900}); }
    if(c.glow){ const b=document.querySelector('.boardbox'); b&&b.animate([{boxShadow:'0 0 0 0 rgba(124,196,106,0)'},{boxShadow:'0 0 60px 18px rgba(124,196,106,.8)'},{boxShadow:'0 0 0 0 rgba(124,196,106,0)'}],{duration:1400}); }
    if(c.hue){ document.body.animate([{filter:'hue-rotate(0)'},{filter:'hue-rotate(160deg)'},{filter:'hue-rotate(0)'}],{duration:1500}); }
    const items=c.big?[...c.e,...(c.trail||[])]:Array.from({length:c.n},()=>pick(c.e));
    items.forEach((em,i)=>{
      const s=document.createElement('span'); s.className='fxp'; s.textContent=em; L.appendChild(s);
      const big=c.big&&i===0, fs=big?Math.round(R*.22):Math.round(rnd(R*.035,R*.075)); s.style.fontSize=fs+'px';
      let kf, dur=c.d*rnd(.75,1.15), delay=rnd(0,c.d*.35);
      switch(c.m){
        case 'wind': { const y=rnd(0,H), dy=rnd(-80,80); kf=[{transform:`translate(-80px,${y}px) rotate(0)`},{transform:`translate(${cx}px,${y+dy}px) rotate(200deg)`},{transform:`translate(${W+80}px,${y-dy}px) rotate(400deg)`}]; break; }
        case 'gust': { const y=rnd(0,H), rev=i%2; kf=[{transform:`translate(${rev?W+80:-80}px,${y}px) scale(.6)`},{transform:`translate(${rev?-80:W+80}px,${y+rnd(-120,120)}px) scale(1.3) rotate(${rev?-540:540}deg)`}]; dur*=.7; break; }
        case 'rain': { const x=rnd(0,W); kf=[{transform:`translate(${x}px,-80px) rotate(0)`},{transform:`translate(${x+rnd(-40,40)}px,${H+80}px) rotate(${rnd(-180,180)}deg)`}]; break; }
        case 'snow': { const x=rnd(0,W); kf=[{transform:`translate(${x}px,-60px)`,opacity:0},{transform:`translate(${x+40}px,${H*.35}px)`,opacity:1,offset:.3},{transform:`translate(${x-40}px,${H*.7}px)`,opacity:1,offset:.7},{transform:`translate(${x}px,${H+60}px)`,opacity:0}]; dur*=1.3; break; }
        case 'sand': { const x=cx+rnd(-R*.25,R*.25); kf=[{transform:`translate(${x}px,${cy-R*.4}px) scale(.6)`,opacity:0},{transform:`translate(${cx+rnd(-20,20)}px,${cy}px) scale(.8)`,opacity:1,offset:.5},{transform:`translate(${x}px,${cy+R*.45}px) scale(1)`,opacity:0}]; s.style.color='#e6b54a'; break; }
        case 'rise': { const x=rnd(0,W); kf=[{transform:`translate(${x}px,${H+60}px) scale(.5)`,opacity:0},{transform:`translate(${x+rnd(-60,60)}px,${H*.5}px) scale(1)`,opacity:1,offset:.4},{transform:`translate(${x}px,-80px) scale(1.4)`,opacity:0}]; break; }
        case 'float': { const x=rnd(W*.1,W*.9); kf=[{transform:`translate(${x}px,${H+40}px) rotate(-15deg)`,opacity:0},{transform:`translate(${x+30}px,${H*.6}px) rotate(15deg)`,opacity:1,offset:.35},{transform:`translate(${x-30}px,${H*.3}px) rotate(-15deg)`,opacity:1,offset:.7},{transform:`translate(${x}px,-40px) rotate(10deg)`,opacity:0}]; break; }
        case 'bubble': { const x=cx+rnd(-R*.45,R*.45); kf=[{transform:`translate(${x}px,${H+30}px) scale(.3)`,opacity:.9},{transform:`translate(${x+rnd(-30,30)}px,${cy+rnd(-60,60)}px) scale(1.2)`,opacity:1,offset:.8},{transform:`translate(${x}px,${cy}px) scale(2)`,opacity:0}]; break; }
        case 'burst': { const a=rnd(0,Math.PI*2), r=rnd(R*.25,R*.6); kf=[{transform:`translate(${cx}px,${cy}px) scale(.2)`,opacity:1},{transform:`translate(${cx+Math.cos(a)*r}px,${cy+Math.sin(a)*r}px) scale(1.4) rotate(${rnd(-200,200)}deg)`,opacity:0}]; delay*=.3; break; }
        case 'sink': { const a=rnd(0,Math.PI*2), r=R*.6; kf=[0,1,2,3,4].map(k=>({transform:`translate(${cx+Math.cos(a+k*1.3)*r*(1-k/4)}px,${cy+Math.sin(a+k*1.3)*r*(1-k/4)}px) scale(${1.2-k*.25}) rotate(${k*90}deg)`,opacity:k===4?0:1})); break; }
        case 'orbit': { const a=rnd(0,Math.PI*2), r=rnd(R*.18,R*.42); kf=Array.from({length:9},(_,k)=>({transform:`translate(${cx+Math.cos(a+k*Math.PI/4)*r}px,${cy+Math.sin(a+k*Math.PI/4)*r}px) scale(${k===0||k===8?.3:1.1})`,opacity:k===8?0:1})); break; }
        case 'zig': { kf=Array.from({length:5},(_,k)=>({transform:`translate(${rnd(0,W)}px,${rnd(0,H*.8)}px) scale(${rnd(1,2.2)})`,opacity:k%2?1:.2})); s.style.filter='drop-shadow(0 0 12px #8fd8ee)'; dur*=.8; break; }
        case 'cross': { const left=i%2===0, y=cy+rnd(-R*.15,R*.15); kf=[{transform:`translate(${left?-100:W+100}px,${y}px) rotate(${left?-60:60}deg) scale(1.6)`},{transform:`translate(${cx+(left?-30:30)}px,${cy}px) rotate(0) scale(2.2)`,offset:.55},{transform:`translate(${cx+rnd(-R*.4,R*.4)}px,${cy+rnd(-R*.4,R*.4)}px) scale(.5)`,opacity:0}]; break; }
        case 'volley': { const y0=H+60+i*20, y1=-80-i*30; kf=[{transform:`translate(${-80+i*30}px,${y0}px) rotate(-40deg)`},{transform:`translate(${W+80}px,${y1+H*.3}px) rotate(-40deg)`}]; delay=i*90; dur*=.8; break; }
        case 'sweep': { if(big){ kf=[{transform:`translate(${-fs}px,${H*.65}px) rotate(-10deg)`},{transform:`translate(${cx-fs/2}px,${H*.18}px) rotate(5deg) scale(1.15)`},{transform:`translate(${W+fs}px,${H*.5}px) rotate(-5deg)`}]; delay=0; }
          else { const x=rnd(W*.2,W*.8); kf=[{transform:`translate(${x}px,${H*.25}px) rotate(0)`,opacity:0},{transform:`translate(${x+rnd(-80,80)}px,${H*.55}px) rotate(${rnd(-160,160)}deg)`,opacity:1,offset:.3},{transform:`translate(${x+rnd(-120,120)}px,${H+60}px) rotate(${rnd(-300,300)}deg)`,opacity:0}]; delay=rnd(c.d*.25,c.d*.6); } break; }
      }
      const an=s.animate(kf,{duration:dur,delay,easing:c.m==='zig'?'steps(5)':'ease-in-out',fill:'both'}); an.onfinish=()=>s.remove();
    });
  }catch(e){}
}
const lastVerse = {};
function verseFor(kind){ const list=VERSES[kind]||['']; let i=Math.floor(Math.random()*list.length); if(list.length>1&&i===lastVerse[kind]) i=(i+1)%list.length; lastVerse[kind]=i; return list[i]; }
Object.assign(SFX, {
  gift:()=>{ [784,988,1175,1568].forEach((f,i)=>tone(f,.18,'triangle',.12,i*.06)); noise(.3,.06,.1,3000,8000); },
  wheel:()=>{ for(let i=0;i<18;i++) tone(900+(i%3)*80,.03,'square',.05,i*(.05+i*.012)); },
  trap:()=>{ for(let i=0;i<6;i++) tone(140+Math.random()*90,.18,'sine',.16,i*.13,60); },
  monkey:()=>{ [880,1100,880,1300,990].forEach((f,i)=>tone(f,.08,'square',.06,i*.09,f*1.3)); },
  storm:()=>{ noise(1.3,.2,0,200,1600); noise(.9,.12,.4,1800,300); tone(60,.9,'sawtooth',.08,.1,40); },
  arrow:()=>{ noise(.25,.16,0,6000,900); tone(1200,.12,'sine',.06,.2,300); },
  double:()=>{ [523,784,1047,1568,2093].forEach((f,i)=>tone(f,.4,'sine',.06,i*.08)); },
  eagle:()=>{ tone(2200,.5,'sawtooth',.06,0,1400); tone(1800,.4,'sawtooth',.05,.45,1100); noise(.6,.05,0,800,3000); },
  hourglass:()=>{ for(let i=0;i<8;i++) tone(1400,.03,'sine',.06,i*.25); noise(1.6,.03,0,4000,6000); },
  spin:()=>{ for(let i=0;i<26;i++) tone(1000,.025,'square',.05,Math.pow(i,1.35)*.03); }
});

/* ---------------- special squares (zanjir: shartdan keyin boshqa shartga tushsa — u ham bajariladi) ---------------- */
const MAXCHAIN = 5;
function others(pi){ return S.players.map((p,i)=>i).filter(i=>i!==pi && !S.players[i].done); }
async function afterSelfMove(pi, depth, seen){ if(await checkWin(pi)) return; await resolve(pi, depth+1, seen); }
async function settle(pi){ const p=S.players[pi]; if(!p||p.done) return; if(await checkWin(pi)) return; await resolve(pi, 1, new Set(), true); await checkWin(pi); } // boshqa o'yinchilar: narvon/ilon ishlaydi
async function moveOthers(list, n){ for(const i of list){ await moveBy(i,n); } for(const i of list) await settle(i); }
async function wheelSpin(){
  const SEG=[{t:'+3',m:3,c:'#5fb06d'},{t:'−1',m:-1,c:'#d4572e'},{t:'🃏',card:1,c:'#e6b54a'},{t:'+1',m:1,c:'#7cc46a'},{t:'❄',ice:1,c:'#8fd8ee'},{t:'+2',m:2,c:'#3f8f55'},{t:'−2',m:-2,c:'#b0451d'},{t:'🍀+4',m:4,c:'#f6d98b'}];
  const k=Math.floor(Math.random()*SEG.length), n=SEG.length, step=360/n;
  let paths=''; SEG.forEach((s,i)=>{ const a0=(i*step-90-step/2)*Math.PI/180, a1=((i+1)*step-90-step/2)*Math.PI/180; const x0=100+95*Math.cos(a0), y0=100+95*Math.sin(a0), x1=100+95*Math.cos(a1), y1=100+95*Math.sin(a1);
    const am=(i*step-90)*Math.PI/180; paths+=`<path d="M100,100 L${x0.toFixed(1)},${y0.toFixed(1)} A95,95 0 0 1 ${x1.toFixed(1)},${y1.toFixed(1)} Z" fill="${s.c}" stroke="#2b1d0d" stroke-width="2"/><text x="${(100+62*Math.cos(am)).toFixed(1)}" y="${(100+62*Math.sin(am)+7).toFixed(1)}" text-anchor="middle" font-size="19" font-weight="900" fill="#1a1208" font-family="Nunito,sans-serif">${s.t}</text>`; });
  const res=SEG[k];
  await openModal(`<h2>🎡 Taqdir g‘ildiragi</h2><div class="wheelbox"><div class="wptr">▼</div><svg id="whl" viewBox="0 0 200 200" width="260" height="260">${paths}<circle cx="100" cy="100" r="16" fill="#2b1d0d" stroke="#e6b54a" stroke-width="3"/></svg></div>
    <div class="row center"><button class="btn gold big" id="bSpin">🎡 Aylantirish</button><button class="btn green big" data-v="ok" id="bWOk" hidden>Davom etish →</button></div><p class="note" id="wRes" style="text-align:center;font-size:18px"></p>`,(ov)=>{
      ov.querySelector('#bSpin').onclick=e=>{ e.currentTarget.disabled=true; SFX.spin(); const end=360*6-(k*step);
        const an=ov.querySelector('#whl').animate([{transform:'rotate(0deg)'},{transform:`rotate(${end}deg)`}],{duration:3200,easing:'cubic-bezier(.15,.85,.2,1)',fill:'forwards'});
        an.onfinish=()=>{ ov.querySelector('#wRes').innerHTML=`Natija: <b>${res.card?'🃏 Bonus karta':res.ice?'❄ Muz — muzlab qolasan':res.m>0?`+${res.m} qadam oldinga`:`${res.m} qadam ortga`}</b>`; ov.querySelector('#bWOk').hidden=false; res.m>0||res.card?SFX.correct():SFX.wrong(); };
      };
    });
  return res;
}
async function resolve(pi, depth=0, seen=new Set(), onlyMove=false){
  const p=S.players[pi]; if(!p||p.done) return; const s=SPEC[p.pos]; if(!s) return;
  if(onlyMove && !['ladder','slide'].includes(s.k)) return;
  if(depth>MAXCHAIN || seen.has(p.pos)) return; seen.add(p.pos);
  if(depth>0) log(`🔗 Zanjir: ${who(p)} ${p.pos}-katakdagi shartga tushdi`);
  SFX.drum(); await sleep(250);
  const self=async n=>{ await moveBy(pi,n); await afterSelfMove(pi,depth,seen); };
  switch(s.k){
    case 'plus': await omen('plus',{n:s.n}); log(`🍃 ${who(p)} +${s.n} qadam`); SFX.plus(); await self(s.n); break;
    case 'minus': await omen('minus',{n:s.n}); log(`🌵 ${who(p)} −${s.n} qadam`); SFX.minus(); await self(-s.n); break;
    case 'eagle': SFX.eagle(); await omen('eagle',{n:s.n}); log(`🦅 ${who(p)} burgut bilan +${s.n} uchdi`); await self(s.n); break;
    case 'ladder': await omen('ladder',{to:s.to}); log(`🌿 ${who(p)} narvondan ${s.to}-katakka chiqdi`); await jumpTo(pi,s.to,SFX.ladder); await afterSelfMove(pi,depth,seen); break;
    case 'slide': {
      const v=await omen('slide',{to:s.to},'<b>Qutqarish sinovi:</b> 2 ta karta. Ikkalasiga ham to‘g‘ri javob bersang — joyingda qolasan!',[{v:'try',label:'⚔ Qutqarish sinovi',cls:'gold big'},{v:'fall',label:'Sirpanib tushish',cls:'red'}]);
      let saved=false;
      if(v==='try'){
        const a=await cardModal(draw(),'Qutqarish · 1-karta',judgeBtns); a==='1'?SFX.correct():SFX.wrong();
        if(a==='1'){ const b=await cardModal(draw(),'Qutqarish · 2-karta',judgeBtns); b==='1'?SFX.correct():SFX.wrong(); saved=b==='1'; }
      }
      if(saved){ log(`🛡 ${who(p)} ilondan qutuldi!`); SFX.melt(); fx('melt'); }
      else { log(`🐍 ${who(p)} ${s.to}-katakka sirpanib tushdi`); await jumpTo(pi,s.to,SFX.slide); await afterSelfMove(pi,depth,seen); }
      break; }
    case 'card': {
      await omen('card');
      const q=draw(); const v=+await cardModal(q,`Bonus karta · ${p.em} ${esc(p.name)}`, pointsBtns(+q.p||1));
      if(v>0){ SFX.correct(); log(`🃏 ${who(p)} bonus karta: +${v}`); await self(v); }
      else { SFX.wrong(); log(`🃏 ${who(p)} bonus kartada xato`); }
      break; }
    case 'quick': {
      const vs=shuffle(VERBS).slice(0,3);
      const v=await omen('quick',{},'',[{v:'ok',label:'✔ Uddaladi (+2)',cls:'green big'},{v:'no',label:'✘ Uddalay olmadi',cls:'red'}],
        `<div class="verbs">${vs.map(x=>`<div>${x[0]}<small class="v2" hidden>${x[1]}</small></div>`).join('')}</div>
         <div class="timer" id="tm">10</div><div class="row center"><button class="btn gold" id="tStart">⏱ Boshlash</button><button class="btn" id="tShow">👁 V2 ni ko‘rsatish</button></div>`);
      if(v==='ok'){ SFX.correct(); log(`⚡ ${who(p)} tezkor sinovdan o‘tdi: +2`); await self(2); }
      else { SFX.wrong(); log(`⚡ ${who(p)} tezkor sinovda ulgurmadi`); }
      break; }
    case 'duel': {
      await omen('duel');
      const oi=await pickPlayer('⚔️ Raqibni tanlang', `${p.em} ${esc(p.name)} kim bilan bellashadi?`, [pi]);
      if(oi===null) break; const o=S.players[oi]; SFX.clang(); fx('duel');
      const v=await cardModal(draw(), `${p.em} ${esc(p.name)}  ⚔  ${o.em} ${esc(o.name)}`,
        `<p class="muted" style="text-align:center;margin:12px 0 0">Kim birinchi to‘g‘ri aytdi? G‘olib +2, yutqazgan −1.</p>
         <div class="row center"><button class="btn green" data-v="a">${p.em} ${esc(p.name)} yutdi</button><button class="btn green" data-v="b">${o.em} ${esc(o.name)} yutdi</button><button class="btn ghost" data-v="n">Hech kim</button></div>`);
      if(v==='n'){ log(`⚔️ ${who(p)} va ${who(o)} — durang`); break; }
      const [w,l]= v==='a'?[pi,oi]:[oi,pi]; SFX.correct();
      log(`⚔️ Duel: ${who(S.players[w])} yutdi (+2), ${who(S.players[l])} −1`);
      await moveBy(w,2); await moveBy(l,-1);
      if(w===pi){ await settle(l); await afterSelfMove(pi,depth,seen); } else { await settle(w); await afterSelfMove(pi,depth,seen); }
      break; }
    case 'swap': {
      await omen('swap');
      const v=await cardModal(draw(), `Almashtir · ${p.em} ${esc(p.name)}`, judgeBtns);
      if(v!=='1'){ SFX.wrong(); log(`🔄 ${who(p)} almashtirish savolida xato`); break; }
      SFX.correct();
      const oi=await pickPlayer('🔄 Kim bilan joy almashasiz?', 'Istalgan o‘yinchini tanlang (masalan, eng oldindagisini).', [pi]);
      if(oi===null) break; const o=S.players[oi]; const a=p.pos, b=o.pos;
      SFX.swap(); fx('swap'); log(`🔄 ${who(p)} va ${who(o)} joy almashdi (${a} ↔ ${b})`);
      const ea=document.querySelector(`.tok[data-id="${p.id}"]`), eb=document.querySelector(`.tok[data-id="${o.id}"]`);
      ea&&ea.classList.add('jump'); eb&&eb.classList.add('jump'); p.pos=b; o.pos=a; renderTokens(); await sleep(800);
      ea&&ea.classList.remove('jump'); eb&&eb.classList.remove('jump'); render(); await settle(oi); await afterSelfMove(pi,depth,seen);
      break; }
    case 'ask': {
      await omen('ask');
      const oi=await pickPlayer('❓ Kimga savol berasiz?', `${p.em} ${esc(p.name)} o‘zi inglizcha savol tuzadi (Do you…? Where…? What…?).`, [pi]);
      if(oi===null) break; const o=S.players[oi];
      const v=await openModal(`<h2>${p.em} → ${o.em}</h2><p class="muted">${esc(p.name)} savol beradi, ${esc(o.name)} javob beradi. Savol ham, javob ham to‘g‘ri bo‘lsa — ikkalasiga +1.</p>
        <div class="row center"><button class="btn green big" data-v="1">✔ Ikkalasi to‘g‘ri (+1)</button><button class="btn red" data-v="0">✘ Xato bo‘ldi</button></div>`);
      if(v==='1'){ SFX.correct(); log(`❓ ${who(p)} va ${who(o)} +1`); await moveBy(oi,1); await settle(oi); await self(1); }
      else { SFX.wrong(); log(`❓ ${who(p)} savol-javobi chiqmadi`); }
      break; }
    case 'ice': SFX.ice(); await omen('ice',{},'Keyingi navbatingda to‘g‘ri javob bersang — muz eriydi. Yurish — undan keyingi navbatda.'); p.frozen=true; log(`❄️ ${who(p)} muzlab qoldi`); render(); break;
    case 'gift': {
      SFX.gift(); await omen('gift');
      const v=await cardModal(draw(), `🎁 Sovg‘a · ${p.em} ${esc(p.name)}`, judgeBtns);
      if(v!=='1'){ SFX.wrong(); log(`🎁 ${who(p)} sovg‘a savolida xato`); break; }
      SFX.correct(); const oi=await pickPlayer('🎁 Sovg‘ani kimga berasiz?', 'Tanlagan do‘stingiz ham +1 qadam yuradi.', [pi]);
      if(oi!==null){ log(`🎁 ${who(p)} +1 va do‘sti ${who(S.players[oi])} +1`); await moveBy(oi,1); await settle(oi); } else log(`🎁 ${who(p)} +1`);
      await self(1); break; }
    case 'wheel': {
      await omen('wheel'); const r=await wheelSpin();
      if(r.card){ const q=draw(); const v=+await cardModal(q,`🎡 G‘ildirak kartasi · ${p.em} ${esc(p.name)}`, pointsBtns(+q.p||1)); if(v>0){ SFX.correct(); log(`🎡 ${who(p)} g‘ildirak kartasi: +${v}`); await self(v); } else { SFX.wrong(); log(`🎡 ${who(p)} g‘ildirak kartasida xato`); } }
      else if(r.ice){ SFX.ice(); fx('ice'); p.frozen=true; log(`🎡 ${who(p)} — g‘ildirak muzlatdi ❄`); render(); }
      else { log(`🎡 ${who(p)} g‘ildirak: ${r.m>0?'+':''}${r.m}`); await self(r.m); }
      break; }
    case 'trap': {
      SFX.trap(); await omen('trap');
      const v=await cardModal(draw(), `🕳 Botqoq · ${p.em} ${esc(p.name)}`, judgeBtns);
      if(v==='1'){ SFX.correct(); fx('melt'); log(`🕳 ${who(p)} botqoqdan qutuldi`); }
      else { SFX.wrong(); log(`🕳 ${who(p)} botqoqqa botdi: −3`); await self(-3); }
      break; }
    case 'monkey': {
      SFX.monkey(); const os=others(pi); const lead=os.length?os.reduce((a,b)=>S.players[b].pos>S.players[a].pos?b:a):-1;
      if(lead<0 || S.players[lead].pos<=p.pos){ await omen('monkey',{},'Bu safar <b>yetakchi o‘zing</b> ekansan — maymun sening bananingni olib qochdi: <b>−1</b>!'); log(`🐒 ${who(p)} yetakchi — maymun −1 qildi`); await self(-1); }
      else { const L=S.players[lead]; await omen('monkey',{},`${L.em} <b>${esc(L.name)}</b> −1, ${p.em} <b>${esc(p.name)}</b> +1`); log(`🐒 Maymun ${who(L)}dan 1 qadam olib, ${who(p)}ga berdi`); await moveBy(lead,-1); await settle(lead); await self(1); }
      break; }
    case 'storm': {
      SFX.storm(); const os=others(pi); await omen('storm',{},os.length?`${os.map(i=>S.players[i].em).join(' ')} — <b>1 qadam ortga</b>`:'');
      log(`🌪 Bo‘ron: ${who(p)}dan boshqa hamma −1`); await moveOthers(os.filter(i=>S.players[i].pos>1),-1); break; }
    case 'arrow': {
      SFX.arrow(); await omen('arrow');
      const v=await cardModal(draw(), `🏹 Nishon · ${p.em} ${esc(p.name)}`, judgeBtns);
      if(v!=='1'){ SFX.wrong(); log(`🏹 ${who(p)} nishonga ololmadi`); break; }
      SFX.correct(); const oi=await pickPlayer('🏹 Kimni nishonga olasiz?', 'Tanlangan o‘yinchi 2 qadam ortga qaytadi.', [pi]);
      if(oi!==null){ SFX.arrow(); fx('arrow'); log(`🏹 ${who(p)} ${who(S.players[oi])}ni nishonga oldi: −2`); await moveBy(oi,-2); await settle(oi); }
      break; }
    case 'double': {
      SFX.double(); await omen('double'); let n=0;
      for(const k of [1,2]){ const v=await cardModal(draw(), `🔮 Sehrli ko‘zgu · ${k}-karta · ${p.em} ${esc(p.name)}`, judgeBtns); if(v==='1'){ n++; SFX.correct(); } else SFX.wrong(); }
      log(`🔮 ${who(p)} ko‘zgu: ${n}/2 → +${n}`); if(n) await self(n); break; }
    case 'hourglass': {
      SFX.hourglass(); await omen('hourglass');
      const qs=[draw(),draw(),draw()];
      const v=+await openModal(`<h2>⏳ Qum soati · ${p.em} ${esc(p.name)}</h2>
        <div class="hglist">${qs.map((q,i)=>`<div class="hgq"><span class="chip sm">${esc(q.t)}</span><div class="q">${i+1}. ${esc(q.q)}</div><div class="ans hide hga">Javob: ${esc(q.a)}</div></div>`).join('')}</div>
        <div class="timer" id="hgT">30</div><div class="row center"><button class="btn gold" id="hgGo">⏱ Boshlash</button><button class="btn" id="hgShow">👁 Javoblar</button></div>
        <p class="muted" style="text-align:center;margin:10px 0 0">Nechta to‘g‘ri javob berdi?</p>
        <div class="pts">${[0,1,2,3].map(n=>`<button class="btn ${n?'green':'red'}" data-v="${n}">${n}<small>${n?'+'+n+' qadam':'0 qadam'}</small></button>`).join('')}</div>`,(ov)=>{
          ov.querySelector('#hgShow').onclick=e=>{ ov.querySelectorAll('.hga').forEach(a=>a.classList.remove('hide')); e.currentTarget.disabled=true; };
          ov.querySelector('#hgGo').onclick=e=>{ e.currentTarget.disabled=true; const tm=ov.querySelector('#hgT'); let t=30; const iv=setInterval(()=>{ if(!document.body.contains(tm)){clearInterval(iv);return;} t--; tm.textContent=t; if(t<=5){ SFX.tick(); tm.classList.add('low'); } if(t<=0){ clearInterval(iv); SFX.buzz(); tm.textContent='⌛'; } },1000); };
        });
      log(`⏳ ${who(p)} qum soati: ${v}/3 → +${v}`); if(v>0){ SFX.correct(); await self(v); } else SFX.wrong();
      break; }
  }
}

/* ---------------- turn flow ---------------- */
let busy=false;
function snapshot(){ history.push(JSON.stringify(S)); if(history.length>30) history.shift(); }
function nextTurn(){
  if(S.players.every(p=>p.done)) { render(); return; }
  let t=S.turn; for(let k=0;k<S.players.length;k++){ t=(t+1)%S.players.length; if(!S.players[t].done) break; }
  S.turn=t; render();
}
async function applyPoints(v){
  const pi=S.turn, p=cur();
  if(p.frozen){
    if(v<=0){ SFX.ice(); log(`🧊 ${who(p)} hali muzlagan`); await omen('frozen'); nextTurn(); return; }
    p.frozen=false; SFX.melt(); log(`🔥 ${who(p)} muzdan qutuldi — keyingi navbatda yuradi`); render();
    await omen('melt',{},'Bu navbatda joyida qoladi — <b>keyingi navbatida</b> yuradi.'); nextTurn(); return;
  }
  if(v<=0){ SFX.wrong(); log(`✘ ${who(p)} xato javob — joyida qoldi`); render(); await sleep(400); nextTurn(); return; }
  SFX.correct(); log(`✔ ${who(p)} +${v} qadam`); await sleep(350);
  await moveBy(pi,v);
  if(!(await checkWin(pi))) await resolve(pi);
  nextTurn();
}
async function onCard(){
  if(busy || !cur() || cur().done) return; busy=true; snapshot();
  const p=cur(), q=draw(); render();
  const v=await cardModal(q, `${p.em} ${esc(p.name)}${p.frozen?' · ❄ muzlagan':''}`, p.frozen?frozenBtns:pointsBtns(+q.p||1));
  await applyPoints(+v); busy=false; render();
}
async function onManual(){
  if(busy || !cur() || cur().done) return; busy=true; snapshot(); const p=cur();
  const v=await openModal(`<h2>${p.em} ${esc(p.name)}</h2><p class="muted">${p.frozen?'❄ Muzlagan — to‘g‘ri javob bersa muz eriydi (yurmaydi).':'Necha qadam yuradi? (O‘zingiz savol bergan bo‘lsangiz)'}</p>${p.frozen?frozenBtns:pointsBtns(0)}<div class="row center"><button class="btn ghost" data-v="x">Bekor qilish</button></div>`);
  if(v==='x'){ history.pop(); busy=false; return; }
  await applyPoints(+v); busy=false; render();
}
function onSkip(){ if(busy) return; snapshot(); log(`⏭ ${who(cur())} navbati o‘tkazildi`); nextTurn(); }
function onUndo(){ if(busy || !history.length) return; S=JSON.parse(history.pop()); document.getElementById('toks').innerHTML=''; render(); SFX.back(0); }

/* ---------------- setup ---------------- */
let draft=[];
function freeEmoji(exceptIdx=-1){ const used=new Set(draft.filter((_,i)=>i!==exceptIdx).map(d=>d.em)); return shuffle(EMOJIS).find(e=>!used.has(e)); }
function openSetup(){
  draft = S && S.players.length && !S.demo ? S.players.map(p=>({name:p.name, em:p.em})) : ['Ali','Malika','Sardor','Dilnoza'].map(n=>({name:n, em:null}));
  draft.forEach((d,i)=>{ if(!d.em) d.em=freeEmoji(i); });
  const isSample = !S || !S.players.length || S.demo;
  openModal(`<h2>O‘yinchilar</h2>
    <p class="muted" style="margin:0">20 tagacha o‘quvchi. Har biriga takrorlanmas emoji beriladi — emojini bosib almashtirish mumkin.</p>
    <form class="addrow" id="fAdd"><input id="inName" placeholder="O‘quvchi ismi…" maxlength="24" autocomplete="off" autofocus><button class="btn gold" type="submit">+ Qo‘shish</button></form>
    <div class="note"><span class="count" id="cnt"></span>${isSample?' · Namuna ismlar — ✕ bilan o‘chirib, o‘z o‘quvchilaringizni yozing.':''}</div>
    <div class="plist" id="plist"></div>
    <h3 class="sec" style="margin-top:18px">📚 Mavzular — o‘quvchilarga aralash beriladi</h3><div id="tpS"></div>
    <div class="row center"><button class="btn green big" id="bStart">▶ O‘yinni boshlash</button><button class="btn ghost" data-v="x">Yopish</button></div>`, (ov, done)=>{
      const list=ov.querySelector('#plist'), cnt=ov.querySelector('#cnt'), inp=ov.querySelector('#inName'), start=ov.querySelector('#bStart');
      const paint=()=>{
        list.innerHTML=draft.map((d,i)=>`<div class="pchip"><button class="em" data-e="${i}" title="Emojini almashtirish">${d.em}</button><span class="nm">${esc(d.name)}</span><button class="x" data-x="${i}" aria-label="O‘chirish">✕</button></div>`).join('');
        cnt.textContent=`${draft.length} / 20 o‘yinchi`; start.disabled=draft.length<2;
        inp.disabled=draft.length>=20; inp.placeholder=draft.length>=20?'20 ta o‘yinchi to‘ldi':'O‘quvchi ismi…';
      };
      paint(); topicPicker(ov.querySelector('#tpS'));
      list.addEventListener('click',e=>{
        const x=e.target.closest('[data-x]'), em=e.target.closest('[data-e]');
        if(x){ draft.splice(+x.dataset.x,1); paint(); SFX.back(0); }
        if(em){ const i=+em.dataset.e; draft[i].em=freeEmoji(i); paint(); SFX.tick(); }
      });
      ov.querySelector('#fAdd').addEventListener('submit',e=>{
        e.preventDefault(); const n=inp.value.trim(); if(!n||draft.length>=20) return;
        draft.push({name:n, em:freeEmoji()}); inp.value=''; paint(); SFX.step(draft.length%8); inp.focus();
      });
      start.addEventListener('click',()=>{
        ac(); S={players:draft.map((d,i)=>({id:Date.now()+i, name:d.name, em:d.em, pos:1, frozen:false, done:false, place:0})), turn:0, deck:newDeck(), log:[], places:0};
        history=[]; document.getElementById('toks').innerHTML='';
        log(`🥁 O‘yin boshlandi! ${S.players.length} ta o‘yinchi jungliga kirdi.`); render(); SFX.drum(); done('start');
      });
    });
}

/* ---------------- confetti ---------------- */
function confetti(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c=document.getElementById('confetti'); c.hidden=false; const x=c.getContext('2d'); c.width=innerWidth; c.height=innerHeight;
  const cols=['#e6b54a','#7cc46a','#f6d98b','#d4572e','#8fd8ee','#f3e6c4'];
  const P=Array.from({length:160},()=>({x:Math.random()*c.width,y:-20-Math.random()*c.height*.5,vx:(Math.random()-.5)*3,vy:2+Math.random()*4,r:4+Math.random()*6,a:Math.random()*6,c:cols[Math.floor(Math.random()*cols.length)]}));
  let t=0; (function f(){ x.clearRect(0,0,c.width,c.height); P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.a+=.1;x.save();x.translate(p.x,p.y);x.rotate(p.a);x.fillStyle=p.c;x.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);x.restore();});
    if(++t<260) requestAnimationFrame(f); else { x.clearRect(0,0,c.width,c.height); c.hidden=true; } })();
}

/* ---------------- quick-timer wiring (delegated) ---------------- */
document.addEventListener('click',e=>{
  if(e.target.id==='tStart'){
    const btn=e.target, tm=document.getElementById('tm'); btn.disabled=true; let s=10;
    const iv=setInterval(()=>{ if(!document.body.contains(tm)){clearInterval(iv);return;} s--; tm.textContent=s; SFX.tick(); tm.classList.toggle('low',s<=3);
      if(s<=0){ clearInterval(iv); SFX.buzz(); tm.textContent='⌛'; } },1000);
  }
  if(e.target.id==='tShow'){ document.querySelectorAll('.v2').forEach(el=>el.hidden=false); e.target.disabled=true; }
});

/* ---------------- boot ---------------- */
document.getElementById('bCard').addEventListener('click',onCard);
document.getElementById('bManual').addEventListener('click',onManual);
document.getElementById('bSkip').addEventListener('click',onSkip);
document.getElementById('bUndo').addEventListener('click',onUndo);
document.getElementById('bNew').addEventListener('click',()=>{ if(!busy) openSetup(); });
document.getElementById('bSound').addEventListener('click',()=>{ soundOn=!soundOn; renderPanel(); if(soundOn){ ac(); SFX.tick(); } });

function start(data){
  drawBoard();
  const lg=document.getElementById('legend'); if(lg) lg.innerHTML=LEGEND.map(([k,t])=>`<span>${ICON[k]} ${t}</span>`).join('');
  S = (data && data.S) || load();
  if(S){ render(); }
  else {
    S={players:[], turn:0, deck:newDeck(), log:[], places:0};
    // sample game state so the board isn't empty before setup
    const demo=[['Ali',1],['Malika',1],['Sardor',1],['Dilnoza',1]];
    const em=shuffle(EMOJIS); S.players=demo.map(([n,pos],i)=>({id:i+1,name:n,em:em[i],pos,frozen:false,done:false,place:0}));
    S.demo=true; log('Namuna o‘yinchilar. “⚙ O‘yinchilar” tugmasi orqali o‘z o‘quvchilaringizni kiriting.');
    renderTokens(); renderPanel();
    openSetup();
  }
}

/* ---------------- savol to'plamlari (o'qituvchi qo'shadi) ---------------- */
const API=(window.AOK_API||"").replace(/\/$/,"");
const lsg=k=>{try{return localStorage.getItem(k)||""}catch(e){return""}};
const lss=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const TCODE=()=>lsg("aok_tcode");
const GROUPS=["Zamonlar","Savollar","Grammatika","O‘qituvchilar to‘plamlari"];
let SETS=(()=>{try{const v=JSON.parse(lsg("qrace-sets")||"[]");return Array.isArray(v)?v:[]}catch(e){return[]}})();
let ACTIVE=(()=>{const all=BANK.map(s=>s.id); try{let v=JSON.parse(lsg("qrace-active")||"null"); if(!Array.isArray(v)||!v.length) return all; if(v.includes("std")) v=[...v.filter(x=>x!=="std"),...all]; return [...new Set(v)];}catch(e){return all}})();
let ME="";
const allSets=()=>[...BANK,...SETS.map(s=>({...s,group:GROUPS[3]}))];
function saveLocal(){ lss("qrace-sets",JSON.stringify(SETS)); lss("qrace-active",JSON.stringify(ACTIVE)); }
function pool(){ // tanlangan mavzular (takroriy savollar bir marta olinadi)
  const seen=new Set(), out=[];
  for(const st of allSets()) if(ACTIVE.includes(st.id)) for(const q of (st.qs||[])){ if(!q||!q.q||!q.a) continue; const k=qkey(q); if(seen.has(k)) continue; seen.add(k); out.push(q.sec?q:{...q,sec:st.name}); }
  return out.length?out:BUILTIN.slice(); }
function topicPicker(box, onChange){ // mavzularni tanlash (yangi o'yin va «Savollar» oynasida)
  const paint=()=>{ const all=allSets(); const n=pool().length, u=usedCount();
    box.innerHTML=GROUPS.map(g=>{ const ss=all.filter(s=>s.group===g); if(!ss.length) return "";
      const on=ss.filter(s=>ACTIVE.includes(s.id)).length;
      return `<div class="tgrp"><div class="tgh"><b>${esc(g)}</b><span class="muted">${on}/${ss.length}</span><span class="sp"></span><button type="button" class="btn ghost sm" data-ga="${esc(g)}">${on===ss.length?"✗ Hech biri":"✓ Hammasi"}</button></div>
        <div class="tchips">${ss.map(s=>`<button type="button" class="tchip ${ACTIVE.includes(s.id)?"on":""}" data-t="${esc(s.id)}">${ACTIVE.includes(s.id)?"✓ ":""}${esc(s.name)} <small>${(s.qs||[]).length}</small></button>`).join("")}</div></div>`; }).join("")
      +`<p class="note">Tanlangan mavzulardan kartalar <b>aralash</b> beriladi: <span class="count">${n} ta savol</span> · ishlatilgan: ${u}/${n} — hammasi chiqmaguncha savol takrorlanmaydi. ${u?`<button type="button" class="btn ghost sm" data-reset="1">♻ Qaytadan boshlash</button>`:""}</p>`;
  };
  box.onclick=e=>{ const t=e.target.closest("[data-t]"), g=e.target.closest("[data-ga]"), r=e.target.closest("[data-reset]");
    if(t){ const id=t.dataset.t; ACTIVE=ACTIVE.includes(id)?ACTIVE.filter(x=>x!==id):[...ACTIVE,id]; }
    if(g){ const ids=allSets().filter(s=>s.group===g.dataset.ga).map(s=>s.id); const allOn=ids.every(id=>ACTIVE.includes(id)); ACTIVE=allOn?ACTIVE.filter(x=>!ids.includes(x)):[...new Set([...ACTIVE,...ids])]; }
    if(r){ resetUsed(); }
    if(t||g||r){ if(!ACTIVE.length) toast("Kamida bitta mavzu tanlang — hozircha barcha savollar ishlatiladi"); saveLocal(); paint(); onChange&&onChange(); } };
  paint(); }
async function api(path,body){
  if(!API) throw new Error("Server ulanmagan.");
  let r; try{ r=await fetch(API+path,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({tcode:TCODE(),...body})}); }catch(e){ throw new Error("Internet aloqasi yo‘q."); }
  let j={}; try{ j=await r.json(); }catch(e){}
  if(!r.ok||j.error) throw new Error(j.error||("Server xatosi "+r.status)); return j;
}
async function syncSets(){
  if(!TCODE()) return false;
  try{ const j=await api("/teacher/race/get",{}); ME=j.me||"";
    const local=SETS.filter(s=>s.dirty); // saqlanmay qolganlar yo'qolmasin
    SETS=[...local,...(j.sets||[]).filter(s=>!local.some(l=>l.id===s.id))];
    ACTIVE=ACTIVE.filter(id=>allSets().some(s=>s.id===id));
    saveLocal(); return true;
  }catch(e){ return false; }
}
const TYPES=[...new Set(BUILTIN.map(q=>q.t))];
const newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);

function parseBulk(txt){ // har qator: Turi | Savol | Javob | Ball | Tagiga chiziladigan so'z
  const out=[], bad=[];
  txt.split(/\r?\n/).map(l=>l.trim()).filter(Boolean).forEach((l,i)=>{
    const c=l.split("|").map(x=>x.trim());
    if(c.length<3||!c[1]||!c[2]){ bad.push(i+1); return; }
    const p=Math.min(3,Math.max(1,parseInt(c[3],10)||1));
    out.push({t:c[0]||"Savol",q:c[1],a:c[2],p,h:c[4]||"",x:""});
  });
  return {out,bad};
}

function openSets(){
  let view="list", ed=null, ei=-1, msg="";
  return openModal(`<div id="qm"></div><div class="row center"><button class="btn ghost" id="qmClose">Yopish</button></div>`,(ov,done)=>{
    const root=ov.querySelector("#qm"); ov.querySelector(".modal").classList.add("wide");
    const close=()=>{ if(ed&&ed.dirty&&!confirm("Saqlanmagan o‘zgarishlar bor. Baribir yopilsinmi?")) return; if(ed&&ed.dirty) { /* shu qurilmada qoladi */ } S.deck=newDeck(); save(); done("x"); };
    ov.querySelector("#qmClose").onclick=close;
    const who=()=> TCODE()? (ME?`👤 ${esc(ME)} · savollar serverda saqlanadi — istalgan qurilmada ochiladi.`:`👤 O‘qituvchi sifatida kirgansiz — savollar serverda saqlanadi.`)
      : `⚠️ Teacher paneliga kirilmagan — yangi savollar faqat <b>shu qurilmada</b> saqlanadi. <a href="teacher.html">Teacher panelga kirish</a>`;
    function paint(){
      if(view==="list"){
        const n=pool().length;
        root.innerHTML=`<h2>📚 Mavzular va savollar</h2><p class="muted" style="margin:0 0 6px">${who()}</p>
          <h3 class="sec" style="margin-top:12px">O‘yinda qaysi mavzular?</h3><div id="tp"></div>
          <h3 class="sec" style="margin-top:16px">Ko‘rish va tahrirlash</h3>
          <div class="sets">${allSets().map(s=>`<div class="setrow"><span><b>${esc(s.name)}</b> <span class="muted">· ${esc(s.group)} · ${(s.qs||[]).length} ta${s.by&&!s.std?` · ${esc(s.by)}`:""}${s.dirty?' · <span class="warn">saqlanmagan</span>':""}</span></span>
            <span class="sp"></span>${s.std?`<button class="btn ghost" data-open="${esc(s.id)}">👁 Ko‘rish</button><button class="btn" data-copy="${esc(s.id)}">⧉ Nusxa olib tahrirlash</button>`:`<button class="btn gold" data-open="${esc(s.id)}">✎ Ochish</button><button class="btn ghost" data-del="${esc(s.id)}" title="O‘chirish">🗑</button>`}</div>`).join("")}</div>
          <div class="row"><button class="btn green" id="qmNew">➕ Yangi to‘plam</button></div>${msg?`<p class="note">${msg}</p>`:""}`;
        topicPicker(root.querySelector("#tp"));
        root.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>{ const s=allSets().find(x=>x.id===b.dataset.open); ed=JSON.parse(JSON.stringify(s)); ed.dirty=!!s.dirty; ei=-1; view="edit"; msg=""; paint(); });
        root.querySelectorAll("[data-copy]").forEach(b=>b.onclick=()=>{ const src=allSets().find(x=>x.id===b.dataset.copy); ed={id:newId(),name:src.name+" (mening)",qs:JSON.parse(JSON.stringify(src.qs)).map(q=>{ const c={...q}; delete c.sec; return c; }),dirty:true,isNew:true}; ei=-1; view="edit"; msg=""; paint(); });
        root.querySelectorAll("[data-del]").forEach(b=>b.onclick=async()=>{ const s=SETS.find(x=>x.id===b.dataset.del); if(!s||!confirm(`«${s.name}» to‘plami o‘chirilsinmi? (${(s.qs||[]).length} ta savol)`)) return;
          try{ if(TCODE()&&!s.localOnly) await api("/teacher/race/del",{id:s.id}); SETS=SETS.filter(x=>x.id!==s.id); ACTIVE=ACTIVE.filter(x=>x!==s.id); saveLocal(); msg="🗑 O‘chirildi."; }catch(e){ msg="❌ "+esc(e.message); } paint(); });
        root.querySelector("#qmNew").onclick=()=>{ ed={id:newId(),name:"",qs:[],dirty:true,isNew:true}; ei=-1; view="edit"; msg=""; paint(); root.querySelector("#seName").focus(); };
        return;
      }
      // ---- to'plamni tahrirlash ----
      const ro=!!ed.std, q=ei>=0?ed.qs[ei]:{t:"",q:"",a:"",p:1,h:"",x:""};
      root.innerHTML=`<div class="edhd"><button class="btn ghost" id="seBack">← To‘plamlar</button><span class="sp"></span>${ro?"":`<button class="btn gold" id="seSave">💾 Saqlash</button>`}</div>
        ${ro?`<h2>${esc(ed.name)}</h2><p class="note">Standart bo‘limni o‘zgartirib bo‘lmaydi — «⧉ Nusxa olib tahrirlash» orqali o‘zingizniki qiling (u «O‘qituvchilar to‘plamlari» guruhida chiqadi).</p>`
          :`<label class="fl">To‘plam nomi<input id="seName" maxlength="60" value="${esc(ed.name)}" placeholder="Masalan: Past Simple savollari · 12-noyabr"></label>`}
        ${ro?"":`<div class="qform"><h3 class="sec">${ei>=0?`✎ ${ei+1}-savolni tahrirlash`:"➕ Yangi savol"}</h3>
          <div class="g2"><label class="fl">Turi (kartadagi yorliq)<input id="fT" list="dlT" maxlength="40" value="${esc(q.t)}" placeholder="Savol tuzing"></label>
          <label class="fl">Ball (necha qadam)<select id="fP">${[1,2,3].map(n=>`<option value="${n}" ${+q.p===n?"selected":""}>${"★".repeat(n)} — ${n} qadam</option>`).join("")}</select></label></div>
          <datalist id="dlT">${TYPES.map(t=>`<option value="${esc(t)}">`).join("")}</datalist>
          <label class="fl">Savol (kartada ko‘rinadi)<input id="fQ" maxlength="300" value="${esc(q.q)}" placeholder="She likes cats."></label>
          <label class="fl">To‘g‘ri javob<input id="fA" maxlength="200" value="${esc(q.a)}" placeholder="Does she like cats?"></label>
          <div class="g2"><label class="fl">Tagiga chiziladigan so‘z <small>(ixtiyoriy — «shu so‘zga savol bering»)</small><input id="fH" maxlength="80" value="${esc(q.h)}" placeholder="cats"></label>
          <label class="fl">Xato qism <small>(ixtiyoriy — «xatoni to‘g‘rilang»)</small><input id="fX" maxlength="80" value="${esc(q.x)}" placeholder="don’t"></label></div>
          <div class="pv"><div class="pvl">Karta ko‘rinishi:</div><div class="face front pvc" id="pv"></div></div>
          <div class="row"><button class="btn green" id="fAdd">${ei>=0?"✔ O‘zgarishni qo‘llash":"➕ Ro‘yxatga qo‘shish"}</button>${ei>=0?`<button class="btn ghost" id="fCancel">Bekor qilish</button>`:""}</div>
          <p class="note" id="fMsg"></p></div>
          <details class="bulk"><summary>📋 Ko‘p savolni birdan qo‘shish</summary>
            <p class="note">Har qatorga bitta savol: <b>Turi | Savol | Javob | Ball | Tagiga chiziladigan so‘z</b>. Ball va oxirgi ustun ixtiyoriy.<br>Masalan: <code>Savol tuzing | He plays chess. | Does he play chess? | 1</code></p>
            <textarea id="bulkT" rows="6" placeholder="Savol tuzing | They are at home. | Are they at home? | 1&#10;Where? | She lives in Bukhara. | Where does she live? | 2 | in Bukhara"></textarea>
            <div class="row"><button class="btn" id="bulkGo">📥 Qatorlarni qo‘shish</button></div></details>`}
        <h3 class="sec" style="margin-top:16px">Savollar · <span class="count">${ed.qs.length} ta</span></h3>
        ${ed.qs.length?`<ol class="qlist">${ed.qs.map((x,i)=>`<li class="${i===ei?"on":""}"><span class="chip sm">${esc(x.t)}</span><span class="qq">${esc(x.q)}<small>→ ${esc(x.a)}</small></span><span class="st">${"★".repeat(Math.min(3,Math.max(1,+x.p||1)))}</span>${ro?"":`<button class="ib" data-e="${i}" title="Tahrirlash">✎</button><button class="ib" data-d="${i}" title="O‘chirish">🗑</button>`}</li>`).join("")}</ol>`:`<p class="note">Hali savol yo‘q — yuqoridagi formadan qo‘shing.</p>`}
        ${msg?`<p class="note">${msg}</p>`:""}`;
      root.querySelector("#seBack").onclick=()=>{ if(ed.dirty&&!ro){ const s=SETS.find(x=>x.id===ed.id); const copy={...ed}; delete copy.isNew; if(ed.qs.length||ed.name){ if(s) Object.assign(s,copy); else SETS.unshift({...copy,localOnly:!TCODE()}); saveLocal(); } } view="list"; ed=null; msg=""; paint(); };
      root.querySelectorAll("[data-e]").forEach(b=>b.onclick=()=>{ ei=+b.dataset.e; paint(); root.querySelector("#fQ").focus(); });
      root.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{ const i=+b.dataset.d; if(!confirm(`${i+1}-savol o‘chirilsinmi?\n${ed.qs[i].q}`)) return; ed.qs.splice(i,1); ed.dirty=true; if(ei===i)ei=-1; else if(ei>i)ei--; msg=""; paint(); });
      if(ro) return;
      const nm=root.querySelector("#seName"); nm.oninput=()=>{ ed.name=nm.value; ed.dirty=true; };
      const F=k=>root.querySelector(k);
      const cur=()=>({t:F("#fT").value.trim()||"Savol",q:F("#fQ").value.trim(),a:F("#fA").value.trim(),p:+F("#fP").value||1,h:F("#fH").value.trim(),x:F("#fX").value.trim()});
      const pv=()=>{ const c=cur(); F("#pv").innerHTML=cardFront({...c,q:c.q||"Savol matni…",a:c.a||"…"}); const a=F("#pv").querySelector("#ans"); if(a){a.id="";a.classList.remove("hide");}
        const w=[]; if(c.h&&c.q&&!c.q.includes(c.h)) w.push("«Tagiga chiziladigan so‘z» savol matnida topilmadi."); if(c.x&&c.q&&!c.q.includes(c.x)) w.push("«Xato qism» savol matnida topilmadi."); F("#fMsg").textContent=w.join(" "); };
      ["#fT","#fQ","#fA","#fP","#fH","#fX"].forEach(k=>F(k).addEventListener("input",pv)); pv();
      F("#fAdd").onclick=()=>{ const c=cur(); if(!c.q||!c.a){ F("#fMsg").textContent="Savol va javobni yozing."; return; }
        if(ei<0&&ed.qs.some(x=>x.q.toLowerCase()===c.q.toLowerCase())){ F("#fMsg").textContent="Bu savol ro‘yxatda bor."; return; }
        if(ei>=0) ed.qs[ei]=c; else ed.qs.push(c); ed.dirty=true; msg=ei>=0?"✔ Yangilandi — «💾 Saqlash»ni bosishni unutmang.":"✔ Qo‘shildi — «💾 Saqlash»ni bosishni unutmang."; ei=-1; paint(); F("#fQ").focus(); };
      if(F("#fCancel")) F("#fCancel").onclick=()=>{ ei=-1; msg=""; paint(); };
      F("#bulkGo").onclick=()=>{ const {out,bad}=parseBulk(F("#bulkT").value); const fresh=out.filter(c=>!ed.qs.some(x=>x.q.toLowerCase()===c.q.toLowerCase()));
        ed.qs.push(...fresh); if(fresh.length) ed.dirty=true; msg=`📥 ${fresh.length} ta savol qo‘shildi${out.length-fresh.length?`, ${out.length-fresh.length} tasi ro‘yxatda bor edi`:""}${bad.length?` · ${bad.length} ta qator noto‘g‘ri (${bad.slice(0,8).join(", ")}-qator: kamida «Turi | Savol | Javob» kerak)`:""}.`; paint(); };
      F("#seSave").onclick=async e=>{ if(!ed.qs.length){ msg="❌ Kamida bitta savol qo‘shing."; return paint(); } if(!ed.name.trim()) ed.name="Mening to‘plamim";
        const b=e.currentTarget; b.disabled=true; b.textContent="Saqlanmoqda…";
        const local=()=>{ const s=SETS.find(x=>x.id===ed.id); const copy={...ed,localOnly:!TCODE()}; delete copy.isNew; if(s) Object.assign(s,copy); else SETS.unshift(copy); if(!ACTIVE.includes(ed.id)) ACTIVE.push(ed.id); saveLocal(); };
        if(!TCODE()){ ed.dirty=false; local(); msg="✅ Shu qurilmada saqlandi va o‘yinga qo‘shildi."; return paint(); }
        try{ const j=await api("/teacher/race/set",{set:{id:ed.id,name:ed.name,qs:ed.qs}}); Object.assign(ed,j.set); ed.dirty=false; local(); msg=`✅ Serverga saqlandi va o‘yinga qo‘shildi (${ed.qs.length} ta savol).`; }
        catch(err){ ed.dirty=true; local(); msg="⚠️ "+esc(err.message)+" Savollar shu qurilmada saqlandi."; }
        paint(); };
    }
    paint();
    syncSets().then(ok=>{ if(ok&&view==="list") paint(); });
  });
}
document.getElementById("bSets").addEventListener("click",()=>{ if(!busy) openSets(); });
syncSets();

start({});
