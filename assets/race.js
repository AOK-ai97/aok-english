/* AOK English — Question Race (sinf o'yini, o'qituvchi boshqaradi) */
"use strict";
const BUILTIN = [{"t": "Savol tuzing", "q": "You are a student.", "a": "Are you a student?", "p": 1, "h": "", "x": ""}, {"t": "Fe’lni yozing", "q": "I ___ (play) football every day.", "a": "play", "p": 1, "h": "", "x": ""}, {"t": "Tag qo‘shing", "q": "It is hot, ___?", "a": "isn’t it?", "p": 2, "h": "", "x": ""}, {"t": "Qisqa javob", "q": "Is he a doctor? — Yes, ___", "a": "Yes, he is.", "p": 1, "h": "", "x": ""}, {"t": "Zamonni ayting", "q": "She is sleeping now.", "a": "Present Continuous", "p": 1, "h": "", "x": ""}, {"t": "So / Neither", "q": "I like pizza. — ___ do I.", "a": "So", "p": 1, "h": "", "x": ""}, {"t": "Savol tuzing", "q": "She likes cats.", "a": "Does she like cats?", "p": 1, "h": "", "x": ""}, {"t": "Tanlang", "q": "Yesterday I ( go / went ) to school.", "a": "went", "p": 1, "h": "", "x": ""}, {"t": "Who? What?", "q": "Ali is my friend.", "a": "Who is your friend?", "p": 2, "h": "Ali", "x": ""}, {"t": "Or bilan so‘rang", "q": "Do you like tea? (coffee)", "a": "Do you like tea or coffee?", "p": 2, "h": "", "x": ""}, {"t": "Fe’lni yozing", "q": "He ___ (watch) TV every evening.", "a": "watches", "p": 1, "h": "", "x": ""}, {"t": "Savol tuzing", "q": "They are at home.", "a": "Are they at home?", "p": 1, "h": "", "x": ""}, {"t": "Tag qo‘shing", "q": "You like apples, ___?", "a": "don’t you?", "p": 2, "h": "", "x": ""}, {"t": "Qisqa javob", "q": "Do you have a cat? — No, ___", "a": "No, I don’t.", "p": 1, "h": "", "x": ""}, {"t": "Where?", "q": "She lives in Tashkent.", "a": "Where does she live?", "p": 2, "h": "in Tashkent", "x": ""}, {"t": "Zamonni ayting", "q": "I will go to Samarkand tomorrow.", "a": "Future Simple", "p": 1, "h": "", "x": ""}, {"t": "So / Neither", "q": "I can’t swim. — ___ can I.", "a": "Neither", "p": 2, "h": "", "x": ""}, {"t": "Tanlang", "q": "Look! The baby ( sleeps / is sleeping ).", "a": "is sleeping", "p": 1, "h": "", "x": ""}, {"t": "Savol tuzing", "q": "He played football yesterday.", "a": "Did he play football yesterday?", "p": 2, "h": "", "x": ""}, {"t": "Fe’lni yozing", "q": "We ___ (visit) grandma last Sunday.", "a": "visited", "p": 1, "h": "", "x": ""}, {"t": "Or bilan so‘rang", "q": "Is it a cat? (a dog)", "a": "Is it a cat or a dog?", "p": 2, "h": "", "x": ""}, {"t": "Tag qo‘shing", "q": "She can swim, ___?", "a": "can’t she?", "p": 2, "h": "", "x": ""}, {"t": "What?", "q": "He is reading a book.", "a": "What is he reading?", "p": 2, "h": "a book", "x": ""}, {"t": "Qisqa javob", "q": "Can you cook? — Yes, ___", "a": "Yes, I can.", "p": 1, "h": "", "x": ""}, {"t": "Zamonni ayting", "q": "They played chess yesterday.", "a": "Past Simple", "p": 1, "h": "", "x": ""}, {"t": "Savol tuzing", "q": "You can drive.", "a": "Can you drive?", "p": 1, "h": "", "x": ""}, {"t": "Fe’lni yozing", "q": "Look! It ___ (rain).", "a": "is raining", "p": 2, "h": "", "x": ""}, {"t": "So / Neither", "q": "She is tired. — ___ am I.", "a": "So", "p": 1, "h": "", "x": ""}, {"t": "Tanlang", "q": "She ( don’t / doesn’t ) like milk.", "a": "doesn’t", "p": 1, "h": "", "x": ""}, {"t": "When?", "q": "They came yesterday.", "a": "When did they come?", "p": 2, "h": "yesterday", "x": ""}, {"t": "Savol tuzing", "q": "It will rain tomorrow.", "a": "Will it rain tomorrow?", "p": 2, "h": "", "x": ""}, {"t": "Tag qo‘shing", "q": "They aren’t at school, ___?", "a": "are they?", "p": 2, "h": "", "x": ""}, {"t": "Fe’lni yozing", "q": "Tomorrow I ___ (help) you.", "a": "will help", "p": 1, "h": "", "x": ""}, {"t": "Qisqa javob", "q": "Did you see the film? — No, ___", "a": "No, I didn’t.", "p": 2, "h": "", "x": ""}, {"t": "Or bilan so‘rang", "q": "Does he play football? (tennis)", "a": "Does he play football or tennis?", "p": 2, "h": "", "x": ""}, {"t": "Zamonni ayting", "q": "I have finished my homework.", "a": "Present Perfect", "p": 2, "h": "", "x": ""}, {"t": "Savol tuzing", "q": "She has a bike.", "a": "Does she have a bike?", "p": 2, "h": "", "x": ""}, {"t": "Xatoni toping", "q": "Do she like music?", "a": "Does she like music?", "p": 2, "h": "", "x": "Do"}, {"t": "How many?", "q": "I have two brothers.", "a": "How many brothers do you have?", "p": 3, "h": "two", "x": ""}, {"t": "Tanlang", "q": "( Did / Do ) you go to the park yesterday?", "a": "Did", "p": 1, "h": "", "x": ""}, {"t": "So / Neither", "q": "I don’t like coffee. — ___ do I.", "a": "Neither", "p": 2, "h": "", "x": ""}, {"t": "Tag qo‘shing", "q": "He went home, ___?", "a": "didn’t he?", "p": 3, "h": "", "x": ""}, {"t": "Fe’lni yozing", "q": "She ___ (not / eat) meat.", "a": "doesn’t eat", "p": 2, "h": "", "x": ""}, {"t": "Savol tuzing", "q": "We were at the park.", "a": "Were we at the park?", "p": 1, "h": "", "x": ""}, {"t": "Who?", "q": "Tom broke the window.", "a": "Who broke the window?", "p": 3, "h": "Tom", "x": ""}, {"t": "Qisqa javob", "q": "Are they your friends? — Yes, ___", "a": "Yes, they are.", "p": 1, "h": "", "x": ""}, {"t": "Xatoni toping", "q": "I am go to school every day.", "a": "I go to school every day.", "p": 2, "h": "", "x": "am go"}, {"t": "Zamonni ayting", "q": "She was cooking at 7 o’clock.", "a": "Past Continuous", "p": 2, "h": "", "x": ""}, {"t": "Or bilan so‘rang", "q": "Will you go by bus? (by taxi)", "a": "Will you go by bus or by taxi?", "p": 2, "h": "", "x": ""}, {"t": "Fe’lni yozing", "q": "At 8 yesterday I ___ (sleep).", "a": "was sleeping", "p": 3, "h": "", "x": ""}, {"t": "Tag qo‘shing", "q": "I am right, ___?", "a": "aren’t I?", "p": 3, "h": "", "x": ""}, {"t": "Savol tuzing", "q": "He is playing now.", "a": "Is he playing now?", "p": 1, "h": "", "x": ""}, {"t": "What time?", "q": "School starts at 8.", "a": "What time does school start?", "p": 3, "h": "at 8", "x": ""}, {"t": "So / Neither", "q": "I went to the zoo. — ___ did I.", "a": "So", "p": 2, "h": "", "x": ""}, {"t": "Tanlang", "q": "She ( has / have ) seen this film.", "a": "has", "p": 1, "h": "", "x": ""}, {"t": "Xatoni toping", "q": "He don’t play chess.", "a": "He doesn’t play chess.", "p": 2, "h": "", "x": "don’t"}, {"t": "Fe’lni yozing", "q": "I ___ (see) this film already.", "a": "have seen", "p": 3, "h": "", "x": ""}, {"t": "Qisqa javob", "q": "Will you come? — Yes, ___", "a": "Yes, I will.", "p": 1, "h": "", "x": ""}, {"t": "Why?", "q": "She is sad because she is ill.", "a": "Why is she sad?", "p": 3, "h": "because she is ill", "x": ""}, {"t": "Zamonni ayting", "q": "I have been waiting for an hour.", "a": "Present Perfect Continuous", "p": 3, "h": "", "x": ""}, {"t": "Savol tuzing", "q": "He is hungry.", "a": "Is he hungry?", "p": 1, "h": "", "x": ""}, {"t": "Fe’lni yozing", "q": "My mother ___ (cook) dinner every day.", "a": "cooks", "p": 1, "h": "", "x": ""}, {"t": "Tag qo‘shing", "q": "You are tired, ___?", "a": "aren’t you?", "p": 2, "h": "", "x": ""}, {"t": "Qisqa javob", "q": "Does she like music? — Yes, ___", "a": "Yes, she does.", "p": 1, "h": "", "x": ""}, {"t": "Zamonni ayting", "q": "We visited Bukhara last summer.", "a": "Past Simple", "p": 1, "h": "", "x": ""}, {"t": "So / Neither", "q": "I am hungry. — ___ am I.", "a": "So", "p": 1, "h": "", "x": ""}, {"t": "Where?", "q": "They are in the park.", "a": "Where are they?", "p": 2, "h": "in the park", "x": ""}, {"t": "Or bilan so‘rang", "q": "Is your bag black? (brown)", "a": "Is your bag black or brown?", "p": 2, "h": "", "x": ""}, {"t": "Tanlang", "q": "They ( is / are ) my friends.", "a": "are", "p": 1, "h": "", "x": ""}, {"t": "Savol tuzing", "q": "They went to the cinema.", "a": "Did they go to the cinema?", "p": 2, "h": "", "x": ""}, {"t": "Fe’lni yozing", "q": "Now we ___ (have) lunch.", "a": "are having", "p": 2, "h": "", "x": ""}, {"t": "Tag qo‘shing", "q": "He doesn’t eat meat, ___?", "a": "does he?", "p": 2, "h": "", "x": ""}, {"t": "What?", "q": "She likes pizza.", "a": "What does she like?", "p": 2, "h": "pizza", "x": ""}, {"t": "Xatoni toping", "q": "She can sings well.", "a": "She can sing well.", "p": 2, "h": "", "x": ""}, {"t": "Qisqa javob", "q": "Was it cold yesterday? — Yes, ___", "a": "Yes, it was.", "p": 1, "h": "", "x": ""}, {"t": "Zamonni ayting", "q": "He will call you tomorrow.", "a": "Future Simple", "p": 1, "h": "", "x": ""}, {"t": "So / Neither", "q": "She didn’t go. — ___ did I.", "a": "Neither", "p": 2, "h": "", "x": ""}, {"t": "Savol tuzing", "q": "You will help me.", "a": "Will you help me?", "p": 1, "h": "", "x": ""}, {"t": "When?", "q": "She was born in 2010.", "a": "When was she born?", "p": 2, "h": "in 2010", "x": ""}, {"t": "Tanlang", "q": "I ( am / is ) a student.", "a": "am", "p": 1, "h": "", "x": ""}, {"t": "Or bilan so‘rang", "q": "Did you go by bus? (by car)", "a": "Did you go by bus or by car?", "p": 2, "h": "", "x": ""}, {"t": "Fe’lni yozing", "q": "He ___ (not / go) to school yesterday.", "a": "didn’t go", "p": 2, "h": "", "x": ""}, {"t": "Tag qo‘shing", "q": "We can play here, ___?", "a": "can’t we?", "p": 2, "h": "", "x": ""}, {"t": "Who?", "q": "My father drives a car.", "a": "Who drives a car?", "p": 3, "h": "My father", "x": ""}, {"t": "Xatoni toping", "q": "Did you went home?", "a": "Did you go home?", "p": 2, "h": "", "x": ""}, {"t": "Zamonni ayting", "q": "They have bought a new car.", "a": "Present Perfect", "p": 2, "h": "", "x": ""}, {"t": "How old?", "q": "My sister is ten.", "a": "How old is your sister?", "p": 3, "h": "ten", "x": ""}, {"t": "Fe’lni yozing", "q": "I ___ (never / see) a lion.", "a": "have never seen", "p": 3, "h": "", "x": ""}, {"t": "So / Neither", "q": "I have finished. — ___ have I.", "a": "So", "p": 2, "h": "", "x": ""}, {"t": "Tag qo‘shing", "q": "She was at home, ___?", "a": "wasn’t she?", "p": 3, "h": "", "x": ""}];
const VERBS = [["go","went"],["see","saw"],["eat","ate"],["drink","drank"],["write","wrote"],["take","took"],["come","came"],["buy","bought"],["make","made"],["run","ran"],["swim","swam"],["sing","sang"],["sleep","slept"],["read","read"],["give","gave"],["find","found"],["speak","spoke"],["drive","drove"],["fly","flew"],["have","had"],["do","did"],["get","got"],["know","knew"],["think","thought"],["sit","sat"],["begin","began"],["break","broke"],["teach","taught"],["catch","caught"],["tell","told"]];
const EMOJIS = ["🦁","🐯","🐵","🦊","🐼","🐨","🐸","🦉","🦄","🐲","🐙","🦋","🐢","🦜","🐬","🦓","🦒","🐘","🦩","🐝","🦔","🐧","🦀","🐳","🦖","🐊","🦥","🐿️","🦚","🐞"];
const SPEC = {
  3:{k:'ladder',to:10}, 4:{k:'plus',n:2}, 6:{k:'quick'}, 8:{k:'card'}, 9:{k:'ask'}, 11:{k:'minus',n:1}, 12:{k:'duel'},
  14:{k:'ladder',to:23}, 15:{k:'swap'}, 18:{k:'ice'}, 21:{k:'slide',to:16}, 24:{k:'duel'}, 26:{k:'ask'}, 27:{k:'quick'}, 29:{k:'slide',to:20}
};
const ICON = {ladder:'🌿',plus:'🍃',minus:'🌵',quick:'⚡',card:'🃏',ask:'❓',duel:'⚔️',swap:'🔄',ice:'❄️',slide:'🐍'};
const LABEL = {ladder:'TEZ YO‘L',plus:'+',minus:'−',quick:'TEZKOR',card:'YANA KARTA',ask:'SAVOL BER',duel:'DUEL',swap:'ALMASHTIR',ice:'MUZ',slide:'SIRPANCHIQ'};
const VERSES = {
  plus:["Shamol esdi orqangdan, qanot bitdi yelkangdan — {n} qadam olg‘a, botir!","Jungli seni olqishlar, yo‘l o‘zi oldinga boshlar — {n} qadam oldinga!"],
  minus:["Tikanli butalar yo‘lingni to‘sdi, chakalakzor oyog‘ingni bosdi — {n} qadam ortga!","Botqoq seni ushladi, yo‘l orqaga burildi — {n} qadam ortga qayt!"],
  ladder:["Daraxtdan liana tushdi osmondan, ushla uni qo‘rqmasdan — yuqoriga chiq, {to}-katakka!","Qadimiy narvon uyg‘ondi, botirlar uchun yo‘l ochildi — {to}-katakka ko‘taril!"],
  slide:["Yer tagidan ilon chiqdi, yo‘lingga zahar sochdi… Pastga sudrar seni u — {to}-katakka!","Sirpanchiq tosh, sovuq ilon — pastga tortar beomon… {to}-katakka tushasan!"],
  card:["Sehrli sandiq ochildi, ichidan yana bir sir sochildi — yana bitta karta ol!","Jungli hali tinchimadi, yana bir savol kutmoqda seni — karta ol!"],
  quick:["Daryo toshdi, vaqt oz qoldi, tez bo‘l — yo‘l shu on ochildi! O‘n soniya ichida uch fe’lni o‘tgan zamonga aylantir!","Chaqmoq chaqdi osmonda, chaqqon bo‘l bu zamonda — 10 soniya, 3 fe’l!"],
  duel:["Ikki sher bir cho‘qqida, kim kuchli — bilinar shu daqiqada! Raqibingni tanla!","Jungli nog‘orasi chalindi, bellashuv vaqti keldi — raqibingni chaqir!"],
  swap:["Sehrgar tayog‘ini silkitdi, yo‘llar o‘rnini almashtirdi… To‘g‘ri javob bersang — istagan joyingga ko‘chasan!","Ko‘zgu ichra yo‘l ochildi, ikki yo‘lchi o‘rin almashdi — avval savolni yech!"],
  ask:["Endi sehrgar sen bo‘lding, savolni o‘zing tuzding — kim javob bersa, sovg‘ani teng bo‘lishing!","Jungli tilini sen bilasan — o‘zing savol ber, do‘stingni sina!"],
  ice:["Shimol shamoli esdi qattiq, oyog‘ing muzga botdi mahkam… Keyingi navbatda to‘g‘ri javob bersang — muz eriydi, undan keyingi navbatda yurasan.","Muz qal’asi seni yutdi, sovuq shamol qotirdi… To‘g‘ri javob — muzni eritadigan olov! Erigach, keyingi navbatda yo‘lga chiqasan."],
  melt:["Bilim olovi yondi, muz qal’asi qulab tushdi — sen yana erkinsan!"],
  frozen:["Muz hali erimadi… Sabr qil, keyingi navbatda yana urinib ko‘r."],
  win:["Jungli seni tan oldi! Barcha sinovlardan o‘tding — sen g‘olibsan!"]
};
const KIND_TITLE = {plus:'OLG‘A!',minus:'ORTGA!',ladder:'TEZ YO‘L',slide:'SIRPANCHIQ',card:'YANA KARTA',quick:'TEZKOR',duel:'DUEL',swap:'ALMASHTIR',ask:'SAVOL BER',ice:'MUZ',melt:'MUZ ERIDI',frozen:'MUZLAGAN',win:'G‘OLIB!'};

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
function newDeck(){ return shuffle(pool()); }
function draw(){ if(!Array.isArray(S.deck) || !S.deck.length || typeof S.deck[0]!=='object') S.deck=newDeck(); return S.deck.pop(); }
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
  const list=VERSES[kind]; let t=list[Math.floor(Math.random()*list.length)];
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
  return `<div class="hd"><span class="chip">${esc(q.t)}</span><span class="stars" aria-label="${q.p} ball">${stars}</span></div>
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

/* ---------------- special squares ---------------- */
async function settle(pi){ const p=S.players[pi]; if(!p||p.done) return; if(await checkWin(pi)) return; await resolve(pi,1); await checkWin(pi); } // duel, savol ber, almashtirishdan keyin ham narvon/ilon ishlaydi
async function resolve(pi, depth=0){
  const p=S.players[pi]; const s=SPEC[p.pos]; if(!s || p.done) return;
  if(depth>0 && !['ladder','slide'].includes(s.k)) return;
  SFX.drum(); await sleep(250);
  switch(s.k){
    case 'plus': await omen('plus',{n:s.n}); log(`🍃 ${who(p)} +${s.n} qadam`); SFX.plus(); await moveBy(pi,s.n); await checkWin(pi) || await resolve(pi,depth+1); break;
    case 'minus': await omen('minus',{n:s.n}); log(`🌵 ${who(p)} −${s.n} qadam`); SFX.minus(); await moveBy(pi,-s.n); await resolve(pi,depth+1); break;
    case 'ladder': await omen('ladder',{to:s.to}); log(`🌿 ${who(p)} narvondan ${s.to}-katakka chiqdi`); await jumpTo(pi,s.to,SFX.ladder); break;
    case 'slide': {
      const v=await omen('slide',{to:s.to},'<b>Qutqarish sinovi:</b> 2 ta karta. Ikkalasiga ham to‘g‘ri javob bersang — joyingda qolasan!',[{v:'try',label:'⚔ Qutqarish sinovi',cls:'gold big'},{v:'fall',label:'Sirpanib tushish',cls:'red'}]);
      let saved=false;
      if(v==='try'){
        const a=await cardModal(draw(),'Qutqarish · 1-karta',judgeBtns); a==='1'?SFX.correct():SFX.wrong();
        if(a==='1'){ const b=await cardModal(draw(),'Qutqarish · 2-karta',judgeBtns); b==='1'?SFX.correct():SFX.wrong(); saved=b==='1'; }
      }
      if(saved){ log(`🛡 ${who(p)} ilondan qutuldi!`); SFX.melt(); }
      else { log(`🐍 ${who(p)} ${s.to}-katakka sirpanib tushdi`); await jumpTo(pi,s.to,SFX.slide); }
      break; }
    case 'card': {
      await omen('card');
      const q=draw(); const v=+await cardModal(q,`Bonus karta · ${p.em} ${esc(p.name)}`, pointsBtns(+q.p||1));
      if(v>0){ SFX.correct(); log(`🃏 ${who(p)} bonus karta: +${v}`); await moveBy(pi,v); await checkWin(pi) || await resolve(pi,depth+1); }
      else { SFX.wrong(); log(`🃏 ${who(p)} bonus kartada xato`); }
      break; }
    case 'quick': {
      const vs=shuffle(VERBS).slice(0,3);
      const v=await omen('quick',{},'',[{v:'ok',label:'✔ Uddaladi (+2)',cls:'green big'},{v:'no',label:'✘ Uddalay olmadi',cls:'red'}],
        `<div class="verbs">${vs.map(x=>`<div>${x[0]}<small class="v2" hidden>${x[1]}</small></div>`).join('')}</div>
         <div class="timer" id="tm">10</div><div class="row center"><button class="btn gold" id="tStart">⏱ Boshlash</button><button class="btn" id="tShow">👁 V2 ni ko‘rsatish</button></div>`);
      if(v==='ok'){ SFX.correct(); log(`⚡ ${who(p)} tezkor sinovdan o‘tdi: +2`); await moveBy(pi,2); await checkWin(pi) || await resolve(pi,depth+1); }
      else { SFX.wrong(); log(`⚡ ${who(p)} tezkor sinovda ulgurmadi`); }
      break; }
    case 'duel': {
      await omen('duel');
      const oi=await pickPlayer('⚔️ Raqibni tanlang', `${p.em} ${esc(p.name)} kim bilan bellashadi?`, [pi]);
      if(oi===null) break; const o=S.players[oi]; SFX.clang();
      const v=await cardModal(draw(), `${p.em} ${esc(p.name)}  ⚔  ${o.em} ${esc(o.name)}`,
        `<p class="muted" style="text-align:center;margin:12px 0 0">Kim birinchi to‘g‘ri aytdi? G‘olib +2, yutqazgan −1.</p>
         <div class="row center"><button class="btn green" data-v="a">${p.em} ${esc(p.name)} yutdi</button><button class="btn green" data-v="b">${o.em} ${esc(o.name)} yutdi</button><button class="btn ghost" data-v="n">Hech kim</button></div>`);
      if(v==='n'){ log(`⚔️ ${who(p)} va ${who(o)} — durang`); break; }
      const [w,l]= v==='a'?[pi,oi]:[oi,pi]; SFX.correct();
      log(`⚔️ Duel: ${who(S.players[w])} yutdi (+2), ${who(S.players[l])} −1`);
      await moveBy(w,2); await moveBy(l,-1); await settle(w); await settle(l);
      break; }
    case 'swap': {
      await omen('swap');
      const v=await cardModal(draw(), `Almashtir · ${p.em} ${esc(p.name)}`, judgeBtns);
      if(v!=='1'){ SFX.wrong(); log(`🔄 ${who(p)} almashtirish savolida xato`); break; }
      SFX.correct();
      const oi=await pickPlayer('🔄 Kim bilan joy almashasiz?', 'Istalgan o‘yinchini tanlang (masalan, eng oldindagisini).', [pi]);
      if(oi===null) break; const o=S.players[oi]; const a=p.pos, b=o.pos;
      SFX.swap(); log(`🔄 ${who(p)} va ${who(o)} joy almashdi (${a} ↔ ${b})`);
      const ea=document.querySelector(`.tok[data-id="${p.id}"]`), eb=document.querySelector(`.tok[data-id="${o.id}"]`);
      ea&&ea.classList.add('jump'); eb&&eb.classList.add('jump'); p.pos=b; o.pos=a; renderTokens(); await sleep(800);
      ea&&ea.classList.remove('jump'); eb&&eb.classList.remove('jump'); render(); await settle(pi); await settle(oi);
      break; }
    case 'ask': {
      await omen('ask');
      const oi=await pickPlayer('❓ Kimga savol berasiz?', `${p.em} ${esc(p.name)} o‘zi inglizcha savol tuzadi (Do you…? Where…? What…?).`, [pi]);
      if(oi===null) break; const o=S.players[oi];
      const v=await openModal(`<h2>${p.em} → ${o.em}</h2><p class="muted">${esc(p.name)} savol beradi, ${esc(o.name)} javob beradi. Savol ham, javob ham to‘g‘ri bo‘lsa — ikkalasiga +1.</p>
        <div class="row center"><button class="btn green big" data-v="1">✔ Ikkalasi to‘g‘ri (+1)</button><button class="btn red" data-v="0">✘ Xato bo‘ldi</button></div>`);
      if(v==='1'){ SFX.correct(); log(`❓ ${who(p)} va ${who(o)} +1`); await moveBy(pi,1); await moveBy(oi,1); await settle(pi); await settle(oi); }
      else { SFX.wrong(); log(`❓ ${who(p)} savol-javobi chiqmadi`); }
      break; }
    case 'ice': SFX.ice(); await omen('ice',{},'Keyingi navbatingda to‘g‘ri javob bersang — muz eriydi. Yurish — undan keyingi navbatda.'); p.frozen=true; log(`❄️ ${who(p)} muzlab qoldi`); render(); break;
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
    <div class="row center"><button class="btn green big" id="bStart">▶ O‘yinni boshlash</button><button class="btn ghost" data-v="x">Yopish</button></div>`, (ov, done)=>{
      const list=ov.querySelector('#plist'), cnt=ov.querySelector('#cnt'), inp=ov.querySelector('#inName'), start=ov.querySelector('#bStart');
      const paint=()=>{
        list.innerHTML=draft.map((d,i)=>`<div class="pchip"><button class="em" data-e="${i}" title="Emojini almashtirish">${d.em}</button><span class="nm">${esc(d.name)}</span><button class="x" data-x="${i}" aria-label="O‘chirish">✕</button></div>`).join('');
        cnt.textContent=`${draft.length} / 20 o‘yinchi`; start.disabled=draft.length<2;
        inp.disabled=draft.length>=20; inp.placeholder=draft.length>=20?'20 ta o‘yinchi to‘ldi':'O‘quvchi ismi…';
      };
      paint();
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
const STD={id:"std",name:"Standart to‘plam",by:"AOK English",std:true,qs:BUILTIN};
let SETS=(()=>{try{const v=JSON.parse(lsg("qrace-sets")||"[]");return Array.isArray(v)?v:[]}catch(e){return[]}})();
let ACTIVE=(()=>{try{const v=JSON.parse(lsg("qrace-active")||"null");return Array.isArray(v)&&v.length?v:["std"]}catch(e){return["std"]}})();
let ME="";
const allSets=()=>[STD,...SETS];
function saveLocal(){ lss("qrace-sets",JSON.stringify(SETS)); lss("qrace-active",JSON.stringify(ACTIVE)); }
function pool(){ const qs=allSets().filter(s=>ACTIVE.includes(s.id)).flatMap(s=>s.qs||[]).filter(q=>q&&q.q&&q.a); return qs.length?qs:BUILTIN.slice(); }
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
    ACTIVE=ACTIVE.filter(id=>allSets().some(s=>s.id===id)); if(!ACTIVE.length) ACTIVE=["std"];
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
        root.innerHTML=`<h2>📚 Savol to‘plamlari</h2><p class="muted" style="margin:0 0 6px">${who()}</p>
          <p class="note">O‘yinda ishlatiladiganlarini belgilang. Hozir kartalar dastasida: <span class="count">${n} ta savol</span>.</p>
          <div class="sets">${allSets().map(s=>`<div class="setrow"><label class="chk"><input type="checkbox" data-act="${esc(s.id)}" ${ACTIVE.includes(s.id)?"checked":""}><span><b>${esc(s.name)}</b> <span class="muted">· ${(s.qs||[]).length} ta${s.by?` · ${esc(s.by)}`:""}${s.dirty?' · <span class="warn">saqlanmagan</span>':""}</span></span></label>
            <span class="sp"></span>${s.std?`<button class="btn" data-copy="std">⧉ Nusxa olib tahrirlash</button><button class="btn ghost" data-open="std">👁 Ko‘rish</button>`:`<button class="btn gold" data-open="${esc(s.id)}">✎ Ochish</button><button class="btn ghost" data-del="${esc(s.id)}" title="O‘chirish">🗑</button>`}</div>`).join("")}</div>
          <div class="row"><button class="btn green" id="qmNew">➕ Yangi to‘plam</button></div>${msg?`<p class="note">${msg}</p>`:""}`;
        root.querySelectorAll("[data-act]").forEach(c=>c.onchange=()=>{ const id=c.dataset.act; ACTIVE=c.checked?[...new Set([...ACTIVE,id])]:ACTIVE.filter(x=>x!==id); if(!ACTIVE.length){ACTIVE=["std"];} saveLocal(); msg=""; paint(); });
        root.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>{ const s=allSets().find(x=>x.id===b.dataset.open); ed=JSON.parse(JSON.stringify(s)); ed.dirty=!!s.dirty; ei=-1; view="edit"; msg=""; paint(); });
        root.querySelectorAll("[data-copy]").forEach(b=>b.onclick=()=>{ ed={id:newId(),name:"Mening to‘plamim",qs:JSON.parse(JSON.stringify(BUILTIN)),dirty:true,isNew:true}; ei=-1; view="edit"; msg=""; paint(); });
        root.querySelectorAll("[data-del]").forEach(b=>b.onclick=async()=>{ const s=SETS.find(x=>x.id===b.dataset.del); if(!s||!confirm(`«${s.name}» to‘plami o‘chirilsinmi? (${(s.qs||[]).length} ta savol)`)) return;
          try{ if(TCODE()&&!s.localOnly) await api("/teacher/race/del",{id:s.id}); SETS=SETS.filter(x=>x.id!==s.id); ACTIVE=ACTIVE.filter(x=>x!==s.id); if(!ACTIVE.length)ACTIVE=["std"]; saveLocal(); msg="🗑 O‘chirildi."; }catch(e){ msg="❌ "+esc(e.message); } paint(); });
        root.querySelector("#qmNew").onclick=()=>{ ed={id:newId(),name:"",qs:[],dirty:true,isNew:true}; ei=-1; view="edit"; msg=""; paint(); root.querySelector("#seName").focus(); };
        return;
      }
      // ---- to'plamni tahrirlash ----
      const ro=!!ed.std, q=ei>=0?ed.qs[ei]:{t:"",q:"",a:"",p:1,h:"",x:""};
      root.innerHTML=`<div class="edhd"><button class="btn ghost" id="seBack">← To‘plamlar</button><span class="sp"></span>${ro?"":`<button class="btn gold" id="seSave">💾 Saqlash</button>`}</div>
        ${ro?`<h2>${esc(ed.name)}</h2><p class="note">Standart to‘plamni o‘zgartirib bo‘lmaydi — «⧉ Nusxa olib tahrirlash» orqali o‘zingizniki qiling.</p>`
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
