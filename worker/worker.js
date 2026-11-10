// AOK English — Writing & Speaking Checker v7 + AOK Radar 📡 bot (Cloudflare Worker)
// Settings → Variables: GEMINI_KEY, CLASS_CODE, TEACHER_CODE, TG_TOKEN (Secret), OWNER_ID, ALLOWED_ORIGIN = https://aok-ai97.github.io, MODEL / LITE_MODEL (ixtiyoriy).
// Bindings: KV namespace → nomi "KV". Triggers → Cron: */5 * * * *. Bot ulash: brauzerda <worker manzili>/bot/setup ni oching.

/* ================= BAHOLASH QOIDALARI (CEFR Multilevel) ================= */
const BANDS = `SCORING (each category 0–5, steps of 0.5), aligned with CEFR descriptors used in the Uzbekistan Multilevel exam:
5 = C1: fully appropriate, natural and precise; wide range; errors are rare and minor.
4 = B2: clear and well organised; good range; some errors that never block meaning.
3 = B1: generally clear; adequate but limited range; noticeable errors, meaning mostly clear.
2 = A2: simple, short, repetitive; frequent errors; meaning sometimes unclear.
1 = A1: isolated words/phrases; meaning often lost.   0 = nothing relevant / no answer.
Be STRICT and consistent like a certified examiner — do not inflate. A score of 5 requires that the answer would genuinely receive the maximum in the real exam.
OVERALL for a task/part = average of its category scores, rounded DOWN to the nearest 0.5.`;

const W_CRIT = `CATEGORIES (names exactly, this order):
"Task Response" — answers EVERY point/question of the email or essay question; correct register (Task 1.1 informal to a friend; Task 1.2 formal/neutral to an official; Task 2 academic essay with a clear position); right length (Task 1.1 ≈50 words, Task 1.2 120–150, Task 2 ≈180). Under 80% of the length → max 2; under 50% → max 1.
"Coherence & Cohesion" — logical paragraphs (greeting / opening / body / closing for letters; intro–body–conclusion for the essay), varied linking words, clear referencing.
"Lexical Resource" — range and precision of topic vocabulary, collocations, appropriate formality (spelling is NOT judged here).
"Grammatical Range & Accuracy" — variety of structures (complex sentences, conditionals, relative clauses, passive, modals) and how often errors occur.
"Imlo xato" — spelling, punctuation and capital letters only.`;

const WRITING_SYS = `You are a certified, strict CEFR Multilevel (Uzbekistan) WRITING examiner at AOK English.
The student uploads PHOTOS of handwritten work (or typed text). The photos may contain Task 1.1, Task 1.2 and/or Task 2, in any order; one answer may continue on several photos.
Task 1.1 = informal letter to a friend (Hi/Hey…, Take care). Task 1.2 = formal letter (Dear Sir or Madam / Dear Manager…, Yours faithfully). Task 2 = essay (no greeting; discusses a statement).
Return only the tasks that are really written, ordered 1.1, 1.2, 2.
"student_name": the name from the signatures (prefer the FULL name under Task 1.2), normal Latin spelling with capitals. If none, "Noma'lum".
TOPIC CHECK: compare every answer with the given email / essay question. on_topic=false if it answers a DIFFERENT topic or ignores the questions completely (a weak answer on the right topic stays true). "topic_check" = one short Uzbek sentence.
For EACH task:
- "transcript": the text EXACTLY as written (keep every mistake; \\n for new lines; ignore crossed-out words).
- "word_count".
- "errors": EVERY mistake in order: "wrong" (exact fragment), "correct", "explain" (very short, UZBEK Latin), "rule" (2–4 word English category tag, e.g. "articles a/an", "past simple irregular", "subject-verb agreement", "spelling", "capital letters", "word choice").
- "criteria": 5 categories (below) with "score" and "comment" (UZBEK: what exactly lowers the score + what to do to get 5).
- "overall".
- "ideal": the SAME letter/essay rewritten so that it would receive 5/5 in EVERY category: keep the student's ideas and situation, answer every question of the email, use the right register and length, natural B2–C1 language (not over-complicated). Plain text with \\n.
- "max_tips": 3–5 short UZBEK steps — concrete actions that take THIS student from the current score to 5/5.
${W_CRIT}
${BANDS}
"topic_uz": 2–4 word Uzbek name of the topic. Answer ONLY with JSON.`;

const S_CRIT = `CATEGORIES (names exactly, this order): "Fluency & Coherence" (speed, pauses, fillers, logical development, linking), "Lexical Resource" (range, topic words, collocations), "Grammatical Range & Accuracy", "Pronunciation" (individual sounds, word stress, intonation, intelligibility), "Task Response" (answers the question fully, uses the time: Part 1.1 ≈30 s each, Part 1.2 ≈30–45 s, Part 2 ≈2 min covering all 3 questions, Part 3 ≈2 min covering both sides + own opinion).`;

const SPEAKING_SYS = `You are a certified, strict CEFR Multilevel (Uzbekistan) SPEAKING examiner at AOK English.
You receive several AUDIO clips, each labelled "Clip k — Part X — Question". Assess each PART separately (Part 1.1 has several clips/questions: assess them together as one part).
For each part:
- "part", "question" (the question(s) asked),
- "transcript": exactly what the student said (keep mistakes, fillers like "eee", [unclear]); for several clips write "Q1: … \\nQ2: …".
- "errors": grammar / vocabulary mistakes: "wrong", "correct", "explain" (very short UZBEK), "rule" (2–4 word English category tag, e.g. "articles a/an", "past simple irregular", "subject-verb agreement", "word choice").
- "criteria": 5 categories (below) with "score" and UZBEK "comment" (what lowers the score + how to get 5).
- "overall".
- "ideal": a model answer that would get 5/5: same ideas as the student, natural spoken B2–C1 English, right length for the part.
- "max_tips": 3–5 short UZBEK steps to reach 5/5.
"pron": EVERY clearly mispronounced word (max 15): "word", "clip" (clip number, 1-based), "start" and "end" (seconds inside that clip, as precise as you can), "heard" (how the student said it, simple letters), "ipa" (correct British IPA), "tip" (very short UZBEK advice, e.g. "th — tilni tishlar orasiga qo'ying").
UNANSWERED: if a clip has no speech (silence/noise only), is cut off before any real answer, or the student does not answer THAT question at all, put the question text into that part's "unanswered" array and write "[javob yo'q]" for it in the transcript. Never invent speech. Score only what was really said.
"summary_uz": 2 short Uzbek sentences: main strength and main weakness.
${S_CRIT}
${BANDS}
Answer ONLY with JSON.`;

const VERIFY_SYS = `You are a strict CEFR Multilevel examiner. You get MODEL answers that are supposed to score 5/5 in every category.
Grade each one strictly with the same categories. If ANY category is below 5, rewrite the answer so that it truly deserves 5/5 (keep the ideas, task and length) and put it in "revised"; otherwise copy it unchanged into "revised".
${BANDS}
Answer ONLY with JSON.`;

const PRON_SYS = `You are a British English pronunciation coach. The student tries to say ONE target word. Listen carefully.
"score": 0–100 (100 = native-like British pronunciation of the target word; 70+ = clearly correct with a small accent; 40–69 = understandable but with wrong sounds or stress; <40 = wrong word or unintelligible; 0 = silence).
"heard": what you heard (simple letters). "tip": one very short UZBEK tip. Answer ONLY with JSON.`;

/* ================= SCHEMAS ================= */
const STR = {type:"STRING"}, NUM = {type:"NUMBER"};
const ERR = {type:"ARRAY",items:{type:"OBJECT",properties:{wrong:STR,correct:STR,explain:STR,rule:STR},required:["wrong","correct","explain","rule"]}};
const CRIT = {type:"ARRAY",items:{type:"OBJECT",properties:{name:STR,score:NUM,comment:STR},required:["name","score","comment"]}};
const TIPS = {type:"ARRAY",items:STR};
const W_SCHEMA = {type:"OBJECT",properties:{student_name:STR,topic_uz:STR,tasks:{type:"ARRAY",items:{type:"OBJECT",properties:{
  task:STR,on_topic:{type:"BOOLEAN"},topic_check:STR,transcript:STR,word_count:{type:"INTEGER"},errors:ERR,criteria:CRIT,overall:NUM,ideal:STR,max_tips:TIPS},
  required:["task","on_topic","topic_check","transcript","word_count","errors","criteria","overall","ideal","max_tips"]}}},required:["student_name","topic_uz","tasks"]};
const S_SCHEMA = {type:"OBJECT",properties:{parts:{type:"ARRAY",items:{type:"OBJECT",properties:{
  part:STR,question:STR,transcript:STR,unanswered:{type:"ARRAY",items:STR},errors:ERR,criteria:CRIT,overall:NUM,ideal:STR,max_tips:TIPS},
  required:["part","question","transcript","unanswered","errors","criteria","overall","ideal","max_tips"]}},
  pron:{type:"ARRAY",items:{type:"OBJECT",properties:{word:STR,clip:{type:"INTEGER"},start:NUM,end:NUM,heard:STR,ipa:STR,tip:STR},required:["word","clip","start","end","ipa","tip"]}},
  summary_uz:STR},required:["parts","pron","summary_uz"]};
const V_SCHEMA = {type:"OBJECT",properties:{items:{type:"ARRAY",items:{type:"OBJECT",properties:{id:STR,scores:{type:"ARRAY",items:NUM},revised:STR},required:["id","scores","revised"]}}},required:["items"]};
const P_SCHEMA = {type:"OBJECT",properties:{score:NUM,heard:STR,tip:STR},required:["score","heard","tip"]};

/* ================= YORDAMCHI ================= */
const half = x => Math.floor(Math.max(0, Math.min(5, +x || 0)) * 2) / 2;
const clean = (x, n=4000) => String(x||"").slice(0,n);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);
const norm = t => String(t||"").toLowerCase().replace(/[’']/g,"'").replace(/favou?rite/g,"favorite").replace(/colou?r/g,"color").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
const SPARTS = ["1.1","1.2","2","3"], WPARTS = ["T1","T2"];
const keyText = it => it.kind==="writing" ? (it.wtype==="T1" ? it.email : it.essay) : (it.q||[]).join(" ");
const shuffle = a => { a = a.slice(); for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };

function fixTask(t){
  t.criteria = (t.criteria||[]).map(c => ({...c, score: half(c.score)}));
  t.overall = half(t.criteria.reduce((a,c)=>a+c.score,0) / (t.criteria.length||1));
  if (t.on_topic === false) {
    const tr = t.criteria.find(c=>/task/i.test(c.name));
    if (tr) { tr.score = 0; tr.comment = "Mavzuga mos emas: " + (t.topic_check||"") + " Email/savoldagi har bir savolga javob bering."; }
    t.overall = 0;
  }
  return t;
}

async function gemini(env, sys, parts, schema, temp=0.2, lite=false){
  const model = lite ? (env.LITE_MODEL || "gemini-2.5-flash-lite") : (env.MODEL || "gemini-2.5-flash");
  let last = "";
  for (let i=0; i<4; i++){ // band bo'lsa kutib qayta urinadi
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method:"POST", headers:{"content-type":"application/json","x-goog-api-key":env.GEMINI_KEY},
      body: JSON.stringify({ systemInstruction:{parts:[{text:sys}]}, contents:[{role:"user",parts}],
        generationConfig:{ temperature:temp, responseMimeType:"application/json", responseSchema:schema } }) });
    const j = await r.json().catch(()=>({}));
    if (r.ok) return JSON.parse(j.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("") || "{}");
    last = (j.error && j.error.message) || ("Gemini " + r.status);
    if (![429,500,503].includes(r.status)) throw new Error(last);
    if (i < 3) await new Promise(res => setTimeout(res, [3000,8000,15000][i]));
    else { const e = new Error("BUSY: AI hozir band. " + last); e.busy = true; throw e; }
  }
}

// Ideal javobni tekshirish: 5/5 bo'lmasa tuzatiladi (2 martagacha)
async function verifyIdeals(env, list, crit){
  for (let round=0; round<2; round++){
    const todo = list.filter(x => !x.verified && x.text);
    if (!todo.length) break;
    const v = await gemini(env, VERIFY_SYS + "\n" + crit,
      [{text: todo.map(x => `=== ID ${x.id} — ${x.label} ===\nTask/question: ${x.context}\nModel answer:\n${x.text}`).join("\n\n")}], V_SCHEMA, 0.1, true);
    for (const it of (v.items||[])) {
      const x = todo.find(y => y.id === it.id); if (!x) continue;
      const ok = (it.scores||[]).length && it.scores.every(s => +s >= 5);
      if (ok) { x.verified = true; x.scores = it.scores; }
      else if (it.revised) { x.text = it.revised; x.scores = it.scores; }
    }
  }
  return list;
}

/* ================= KV: BAZA ================= */
async function getBank(env, kind, part){ const v = await env.KV.get(`b:${kind}:${part}`); return v ? JSON.parse(v) : []; }
async function putBank(env, kind, part, arr){ await env.KV.put(`b:${kind}:${part}`, JSON.stringify(arr)); }
async function allBank(env, kind){ const ps = kind==="writing" ? WPARTS : SPARTS; const o = {}; for (const p of ps) o[p] = await getBank(env, kind, p); return o; }
async function withImages(env, items){
  return Promise.all(items.map(async it => {
    if (!it.images || !it.images.length) return it;
    const imgs = await Promise.all(it.images.map(async im => typeof im === "string" ? {url: im} : im.k ? ({data: await env.KV.get(im.k)}) : im));
    return {...it, images: imgs};
  }));
}
async function findItems(env, kind, ids){
  const bank = await allBank(env, kind); const all = Object.values(bank).flat();
  return ids.map(id => all.find(x => x.id === id)).filter(Boolean);
}
function compose(kind, bank, sections, pool, topic){
  const pick = (part, n) => {
    let c = bank[part] || [];
    if (pool) c = c.filter(x => pool.includes(x.id));
    if (topic) { const t = c.filter(x => x.topic === topic); if (t.length) c = t; }
    if ((part==="1.2"||part==="2") && c.some(x => (x.images||[]).length)) c = c.filter(x => (x.images||[]).length);
    return shuffle(c).slice(0, n);
  };
  const out = [];
  for (const s of sections) out.push(...pick(s, kind==="speaking" && s==="1.1" ? 3 : 1));
  return out;
}

/* =====================================================================
   AOK RADAR 📡 — o'quvchilar, PIN, guruhlar, Telegram bot, davomat, eslatmalar
   ===================================================================== */
const TZ = 5 * 3600e3;                                   // O'zbekiston vaqti (UTC+5)
const L = (t = Date.now()) => new Date(t + TZ);           // getUTC* = mahalliy vaqt
const dayKey = (t = Date.now()) => L(t).toISOString().slice(0, 10);
const isQuiet = (t = Date.now()) => L(t).getUTCHours() < 6; // 00:00–06:00 jim
const ddmm = t => { const d = L(t); return `${String(d.getUTCDate()).padStart(2,"0")}.${String(d.getUTCMonth()+1).padStart(2,"0")}`; };
const ddmmyyyy = t => ddmm(t) + "." + L(t).getUTCFullYear();
const hhmm = t => { const d = L(t); return `${String(d.getUTCHours()).padStart(2,"0")}:${String(d.getUTCMinutes()).padStart(2,"0")}`; };
const J = async (env, k, def) => { const v = await env.KV.get(k); return v ? JSON.parse(v) : def; };
const PUT = (env, k, v, o) => env.KV.put(k, JSON.stringify(v), o);
const H = s => String(s ?? "").replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
const nn = s => String(s || "").toLowerCase().replace(/[ʻʼ’‘`´']/g, "").replace(/[^a-zа-яёўқғҳ0-9 ]/gi, " ").replace(/\s+/g, " ").trim();
const first = n => String(n || "").trim().split(/\s+/)[0] || "";
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
const r1 = x => Math.round(x * 10) / 10;
const KINDS = ["writing", "speaking"];
const KIND_UZ = {writing: "✍️ Writing", speaking: "🎤 Speaking"};

const getGroups = env => J(env, "groups", []);
const getStudents = env => J(env, "students", []);
const getProfile = (env, sid) => J(env, "p:" + sid, {h: []});
function newPin(studs){ let p; do { p = String(1000 + Math.floor(Math.random() * 9000)); } while (studs.some(s => s.pin === p)); return p; }
function parseLink(s){ const m = String(s || "").match(/t\.me\/c\/(\d+)\/(\d+)/); return m ? {chat: "-100" + m[1], thread: +m[2]} : null; }
async function studentByPin(env, pin){
  pin = String(pin || "").trim(); if (!/^\d{4}$/.test(pin)) return null;
  return (await getStudents(env)).find(s => s.pin === pin) || null;
}

/* ---------------- Telegram ---------------- */
async function tg(env, method, body){
  if (!env.TG_TOKEN) return {ok:false, description:"TG_TOKEN yo'q"};
  try {
    const r = await fetch(`https://api.telegram.org/bot${env.TG_TOKEN}/${method}`, {method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify(body)});
    const j = await r.json(); if (!j.ok) console.log("TG", method, j.description); return j;
  } catch (e) { console.log("TG", method, e.message); return {ok:false, description:e.message}; }
}
async function tgForm(env, method, fd){
  try { const r = await fetch(`https://api.telegram.org/bot${env.TG_TOKEN}/${method}`, {method:"POST", body: fd}); const j = await r.json(); if (!j.ok) console.log("TG", method, j.description); return j; }
  catch (e) { return {ok:false, description:e.message}; }
}
const say = (env, chat, text, extra = {}) => tg(env, "sendMessage", {chat_id: chat, text, parse_mode: "HTML", disable_web_page_preview: true, ...extra});
const toTopic = (env, gid, thread, text, extra = {}) => say(env, gid, text, thread && thread > 1 ? {message_thread_id: thread, ...extra} : extra);
const owner = (env, text, extra) => say(env, env.OWNER_ID, text, extra);
const kb = rows => ({reply_markup: {inline_keyboard: rows}});
async function secretOf(env){ const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("aok-radar:" + env.TG_TOKEN)); return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2,"0")).join("").slice(0, 48); }

/* ---------------- AI gaplar (maqtov, eslatma, tanbeh) ---------------- */
const RADAR_SYS = `You are "AOK Radar 📡", the Telegram assistant of an English teacher at AOK English (CEFR Multilevel exam preparation, Uzbekistan).
Write ONE short message in UZBEK (Latin script) to the student, addressed by first name: 1–3 sentences, max 300 characters, 1–3 fitting emoji.
Every message must be worded differently (never a template); sometimes use a light radar/signal metaphor, but not always.
Tone by type: "praise" = warm, specific (mention what exactly was good); "encourage" = friendly, points to one thing to improve;
"scold" = respectful, never rude or humiliating, firm, gives one concrete next step; "remind" = urgent but kind, says what is still missing and how much time is left;
"late" = respectful disappointment that the deadline passed + it can still be submitted today; "late_ok" = thanks for submitting even though late, next time on time.
Use ONLY the facts given. No markdown. Answer ONLY with JSON {"text": "..."}.`;
const FALLBACK = {
  praise: ["🔥 {n}, zo'r natija! Shu tempda davom eting 💪", "🏆 {n}, bugun a'lo ishladingiz! Radar faxrlanadi 📡", "👏 {n}, juda yaxshi! Keyingi darsda ham shunday 🚀"],
  encourage: ["🙂 {n}, yomon emas! Biroz ko'proq mashq qilsangiz, natija ancha o'sadi 💪", "📈 {n}, yaxshi harakat. Kamchiliklarni takrorlab oling, keyingi safar a'lo bo'ladi!"],
  scold: ["⚠️ {n}, bugun natija past bo'ldi. Uyda qaytadan takrorlab oling — sizdan ko'proq kutamiz 💪", "📡 {n}, radar past signal ko'rdi. Bugun 20 daqiqa ajratib qayta tayyorlaning!"],
  remind: ["⏰ {n}, vazifa hali kutib turibdi: {x}. Muddatgacha {t} qoldi!", "📡 {n}, {x} hali topshirilmagan. {t} qoldi — hozir boshlang 💪"],
  late: ["⌛ {n}, muddat o'tdi: {x} topshirilmagan. Bugun topshirsangiz baribir hisobga olinadi 🙏", "📡 {n}, vazifa muddatida kelmadi ({x}). Iltimos, bugunoq topshiring."],
  late_ok: ["✅ {n}, kech bo'lsa ham topshirdingiz — rahmat! Keyingi safar muddatida kutamiz 🙂"]
};
async function radarText(env, type, name, facts){
  try {
    const r = await gemini(env, RADAR_SYS, [{text: `Type: ${type}\nStudent: ${first(name)}\nFacts: ${facts}`}], {type:"OBJECT",properties:{text:STR},required:["text"]}, 1.0, true);
    if (r.text && r.text.length > 10) return r.text.slice(0, 600);
  } catch (e) {}
  const a = FALLBACK[type] || FALLBACK.encourage; return a[Math.floor(Math.random() * a.length)].replace("{n}", first(name)).replace("{x}", facts).replace("{t}", "");
}

/* ---------------- Baholarni o'qish ---------------- */
const LEVELS = [["super",6],["sal a'lo",4],["sal alo",4],["sal yaxshi",2.5],["sal chala",2],["a'lo",5],["alo",5],["zo'r",5],["zor",5],["yaxshi",3],["chala",1],["yodlamagan",0],["yomon",0],["qilmagan",0],["bajarmagan",0],["yo'q",0],["yoq",0]];
const LV_COLOR = l => l >= 4.5 ? "🔵" : l >= 3.5 ? "🟢" : l >= 2.5 ? "🟡" : l >= 1.5 ? "🟠" : l >= 0.5 ? "🔴" : "⚫️";
const LV_NAME = l => l >= 6 ? "Super" : l >= 5 ? "A'lo" : l >= 4 ? "sal A'lo" : l >= 3 ? "yaxshi" : l >= 2.5 ? "sal yaxshi" : l >= 2 ? "sal chala" : l >= 1 ? "chala" : "yomon";
const ITEMS = [["lugat",/lug'?at|vocab|so'zlar|words?\b/],["structure",/struct|strukt/],["speaking",/speak|gapir/],["translate",/transl|tarjim/],["writing",/writ|yozuv|insho/],["reading",/read|o'qish/],["listening",/listen|tinglash/],["grammar",/gramm/],["vazifa",/homework|vazifa/]];
const ITEM_UZ = {lugat:"Lug'at",structure:"Structure",speaking:"Speaking",translate:"Translate",writing:"Writing",reading:"Reading",listening:"Listening",grammar:"Grammar",vazifa:"Vazifa",umumiy:"Umumiy"};
function parseGrades(text){
  const out = {it: {}, st: null};
  for (let raw of String(text || "").split(/\n/)) {
    let line = raw.toLowerCase().replace(/[ʻʼ’‘`´]/g, "'"); const note = (line.match(/\(([^)]*)\)/) || [])[1] || "";
    line = line.replace(/\([^)]*\)/g, " ").trim(); if (!line) continue;
    if (/kelmadi|kelmagan|qatnashmadi/.test(line)) { out.st = "absent"; continue; }
    if (/pauza|pause|ta'til/.test(line)) { out.st = "pause"; continue; }
    if (/be'?tob|kasal/.test(line)) { out.st = "sick"; continue; }
    let item = (ITEMS.find(([, re]) => re.test(line)) || [])[0] || null, lvl = null, done = false;
    const x = line.match(/(\d+)\s*(ta)?\s*xato/);
    if (x) { const n = +x[1]; lvl = n === 0 ? 5 : n === 1 ? 4 : n === 2 ? 3 : 0; item = item || "lugat"; }
    else if (/xatosiz/.test(line)) { lvl = 5; item = item || "lugat"; }
    else { const f = LEVELS.find(([w]) => new RegExp("(^|[^a-z'])" + w.replace(/'/g, "'?") + "($|[^a-z'])").test(line)); if (f) lvl = f[1]; }
    if (lvl === null && /\bbor\b|topshirdi|qildi/.test(line)) done = true;
    if (lvl === null && !done) continue;
    item = item || "umumiy";
    out.it[item] = {l: lvl, done: done || lvl !== null, n: note.slice(0, 120)};
  }
  return out;
}
function dayMark(rec){
  if (!rec) return "✅";
  if (rec.st === "absent") return "❌ 🟤"; if (rec.st === "pause") return "❌ ⚪️"; if (rec.st === "sick") return "❌ 🟣";
  const ls = Object.values(rec.it || {}).filter(x => x.l !== null && x.l !== undefined).map(x => x.l);
  if (!ls.length) return "✅";
  if (ls.includes(6) && ls.every(l => l >= 5)) return "✅ 🟦";
  return "✅ " + LV_COLOR(avg(ls.map(l => Math.min(l, 5))));
}
const dayScore = rec => { if (!rec || rec.st) return null; const ls = Object.values(rec.it || {}).filter(x => x.l != null).map(x => Math.min(x.l, 5)); return ls.length ? avg(ls) : null; };

/* ---------------- O'qituvchilar va rollar ---------------- */
const getTeachers = env => J(env, "teachers", []);
async function roleOf(env, uid){
  uid = String(uid || ""); if (!uid) return null;
  if (uid === String(env.OWNER_ID)) return {admin: true, uid, name: "Bosh admin"};
  const t = (await getTeachers(env)).find(x => String(x.tg) === uid); return t ? {admin: false, uid, t, name: t.name} : null;
}
const canG = (r, g) => !!(r && g && (r.admin || (r.t.groups || []).includes(g.id)));
async function staffIds(env, g){ const ts = (await getTeachers(env)).filter(t => t.tg && (t.groups || []).includes(g.id)).map(t => String(t.tg)); return [...new Set([String(env.OWNER_ID), ...ts])]; }
const pm = (env, uid, text, extra) => say(env, uid, text, extra);
function newCode(ts, env){ let c; do { c = String(100000 + Math.floor(Math.random() * 900000)); } while (ts.some(t => t.code === c) || c === env.TEACHER_CODE); return c; }

/* ---------------- Dars kunlari (davomat postidan o'rganiladi) ---------------- */
const DAYS = [[0,/(^|[^a-z'])(sunday|yakshanba|sun)\b/],[1,/(^|[^a-z'])(monday|dushanba|mon)\b/],[2,/(^|[^a-z'])(tuesday|seshanba|tue)\b/],[3,/(^|[^a-z'])(wednesday|chorshanba|wed)\b/],
  [4,/(^|[^a-z'])(thursday|payshanba|thu)\b/],[5,/(^|[^a-z'])(friday|juma|fri)\b/],[6,/(^|[^a-z'])(saturday|shanba|sat)\b/]];
const DAY_EN = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAY_UZ = ["yakshanba","dushanba","seshanba","chorshanba","payshanba","juma","shanba"];
function parseDays(text){ const t = String(text || "").toLowerCase(); const d = DAYS.filter(([, re]) => re.test(t)).map(([i]) => i); return d.length >= 2 ? d : null; }
function lessonEnd(g){ const m = String(g.time || "").match(/(\d{1,2})[:.](\d{2})\s*[-–—]\s*(\d{1,2})[:.](\d{2})/); return m ? (+m[3]) * 60 + (+m[4]) : 18 * 60; }
const atLocal = (dk, mins) => Date.parse(dk + "T00:00:00Z") - TZ + mins * 60e3;      // dk = "YYYY-MM-DD" mahalliy
const addDays = (dk, n) => new Date(Date.parse(dk + "T00:00:00Z") + n * 864e5).toISOString().slice(0, 10);
const wdOf = dk => new Date(dk + "T00:00:00Z").getUTCDay();
function nextLesson(g, fromDk){ // keyingi dars kuni (post kunidan keyin), dars tugashidan 15 daqiqa oldin
  const days = g.days && g.days.length ? g.days : null;
  for (let i = 1; i <= 8; i++) { const dk = addDays(fromDk, i); if (!days || days.includes(wdOf(dk))) return atLocal(dk, lessonEnd(g) - 15); if (!days && i >= 2) break; }
  return atLocal(addDays(fromDk, 2), lessonEnd(g) - 15);
}

/* ---------------- Homework posti (#Homework) ---------------- */
const HP_TYPES = ["shadowing","site_writing","site_speaking","voice","photo","text","video","in_class","none"];
const HP_ICON = {shadowing:"🎧", site_writing:"✍️", site_speaking:"🎤", voice:"🎙", photo:"📷", text:"💬", video:"🎥", in_class:"🏫", none:"ℹ️"};
const HP_HOW = {shadowing:"ovozli xabar (shadowing)", site_writing:"AOK Checker · Writing", site_speaking:"AOK Checker · Speaking", voice:"ovozli xabar", photo:"rasm", text:"matn", video:"video", in_class:"darsda so'raladi", none:"—"};
const SUBMIT = t => !["in_class", "none"].includes(t);
const HP_SYS = `You read a homework post written by an English teacher in Uzbek (Telegram). Split it into separate tasks, in the same order.
For each line/task return:
"title": short Uzbek title exactly in the teacher's words (max 70 chars);
"type": one of shadowing (listen to the attached audio and repeat it, send a voice message), site_writing (Writing Task 1.1 / 1.2 / 2 checked on the AOK website — "AOK check"), site_speaking (Speaking Part 1.1/1.2/2/3 checked on the AOK website), voice (send a voice message/audio, not shadowing), photo (written work to send as a photo), text (send as a text message), video (send a video), in_class (memorise / learn / read / do exercises — checked in the next lesson, nothing to send), none (bring money/books/things, announcements, not a task);
"count": how many submissions (e.g. "2 ta audio shadowing" → 2; default 1);
"due_kind": today | tomorrow | next_lesson | weekday | date | none — from words like "bugun", "ertaga", "keyingi darsga qadar", "juma kuni", "15-noyabr";
"time": "HH:MM" if a time is written (e.g. "23:59", "21:00"), else "";
"weekday": 0–6 (0 = Sunday) if a weekday is named, else -1;
"date": "YYYY-MM-DD" if a calendar date is named, else "".
Answer ONLY with JSON.`;
const HP_SCHEMA = {type:"OBJECT",properties:{items:{type:"ARRAY",items:{type:"OBJECT",properties:{title:STR,type:{type:"STRING",enum:HP_TYPES},count:{type:"INTEGER"},due_kind:STR,time:STR,weekday:{type:"INTEGER"},date:STR},required:["title","type","count","due_kind","time","weekday","date"]}}},required:["items"]};
function hpDue(g, postAt, it){
  const dk = dayKey(postAt); const tm = String(it.time || "").match(/^(\d{1,2}):(\d{2})$/); const mins = tm ? (+tm[1]) * 60 + (+tm[2]) : null;
  switch (it.due_kind) {
    case "today": return atLocal(dk, mins ?? 23 * 60 + 59);
    case "tomorrow": return atLocal(addDays(dk, 1), mins ?? 23 * 60 + 59);
    case "weekday": if (it.weekday >= 0) { for (let i = 1; i <= 7; i++) { const d = addDays(dk, i); if (wdOf(d) === it.weekday) return atLocal(d, mins ?? ((g.days || []).includes(it.weekday) ? lessonEnd(g) - 15 : 23 * 60 + 59)); } } break;
    case "date": if (/^\d{4}-\d{2}-\d{2}$/.test(it.date)) return atLocal(it.date, mins ?? 23 * 60 + 59); break;
  }
  const nl = nextLesson(g, dk); return mins !== null && it.due_kind === "next_lesson" ? atLocal(dayKey(nl), mins) : nl;
}
async function hpParse(env, g, text, postAt, fix){
  const today = dayKey(postAt);
  const ctx = `Post date: ${today} (${DAY_EN[wdOf(today)]}). Lesson days: ${(g.days || []).map(d => DAY_EN[d]).join(", ") || "unknown"}.\n\nPOST:\n${clean(text, 3000)}` + (fix ? `\n\nTEACHER'S CORRECTION (apply it, it overrides the post):\n${clean(fix, 800)}` : "");
  const r = await gemini(env, HP_SYS, [{text: ctx}], HP_SCHEMA, 0.1, true);
  return (r.items || []).slice(0, 15).map((it, i) => ({id: "i" + (i + 1), title: clean(it.title, 90), type: HP_TYPES.includes(it.type) ? it.type : "in_class", count: Math.max(1, Math.min(10, +it.count || 1)),
    due: SUBMIT(it.type) ? hpDue(g, postAt, it) : null}));
}
function hpTable(hp){
  return hp.items.map((it, i) => `${i + 1}. ${HP_ICON[it.type]} <b>${H(it.title)}</b>\n     ${H(HP_HOW[it.type])}${it.count > 1 && SUBMIT(it.type) ? ` ×${it.count}` : ""}${it.due ? ` · ⏰ ${DAY_UZ[wdOf(dayKey(it.due))]} ${ddmm(it.due)} ${hhmm(it.due)}` : ""}`).join("\n") +
    (hp.refs && hp.refs.length ? `\n\n🎧 Shadowing audiolari: ${hp.refs.map(r => H(r.name)).join(", ")}` : "");
}
const hpEnd = (g, hp) => Math.max(...hp.items.filter(i => i.due).map(i => i.due), nextLesson(g, dayKey(hp.at)));
async function hpConfirm(env, g, hp){
  return pm(env, hp.by, `📋 <b>${H(g.title)} — Homework</b> (${ddmm(hp.at)})\n\n${hpTable(hp)}\n\n🗓 Topshirish ${DAY_UZ[wdOf(dayKey(hpEnd(g, hp)))]} ${ddmm(hpEnd(g, hp))} ${hhmm(hpEnd(g, hp))} gacha qabul qilinadi.\n<i>15 daqiqada tasdiqlamasangiz, o'zi ishga tushadi.</i>`,
    kb([[{text: "✅ To'g'ri", callback_data: "hpok:" + g.id}, {text: "✏️ Tuzatish", callback_data: "hped:" + g.id}]]));
}
const hsubKey = (hp, sid) => `hs:${hp.id}:${sid}`;
async function hpProgress(env, g, hp, s, prof){
  const sub = await J(env, hsubKey(hp, s.id), {it: {}}); prof = prof || await getProfile(env, s.id);
  const res = {};
  for (const it of hp.items.filter(i => SUBMIT(i.type))) {
    let n = 0, info = "";
    if (it.type === "site_writing" || it.type === "site_speaking") { const k = it.type === "site_writing" ? "writing" : "speaking";
      const e = (prof.h || []).filter(x => x.k === k && x.at >= hp.at).sort((a, b) => b.at - a.at); n = e.length ? Math.min(it.count, e.length) : 0; if (e[0]) info = `${fmtN(e[0].tot)}/${e[0].max}`; }
    else { const x = sub.it[it.id]; n = x ? x.n : 0; if (x && x.best != null) info = x.best + "%"; }
    res[it.id] = {n, need: it.count, ok: n >= it.count, info, late: false};
  }
  return res;
}
async function hpSummary(env, g, hp, final){
  const studs = (await getStudents(env)).filter(s => s.gid === g.id); const items = hp.items.filter(i => SUBMIT(i.type));
  let t = `📊 <b>${final ? "YAKUNIY NATIJA" : "HOLAT"} — ${H(g.title)}</b>\n📋 Homework ${ddmm(hp.at)}\n` + items.map((it, i) => `${i + 1}. ${HP_ICON[it.type]} ${H(it.title)}`).join("\n") + "\n\n";
  let full = 0;
  for (const [i, s] of studs.entries()) {
    const pr = await hpProgress(env, g, hp, s); const done = items.filter(it => pr[it.id].ok).length; if (done === items.length) full++;
    t += `${i + 1}. ${H(s.name)} — ${items.map(it => pr[it.id].ok ? "✅" : pr[it.id].n ? "🟡" : "❌").join("")} <b>${done}/${items.length}</b>${items.map(it => pr[it.id].info ? ` · ${HP_ICON[it.type]}${pr[it.id].info}` : "").join("")}\n`;
  }
  return t + `\n✅ To'liq bajardi: <b>${full}/${studs.length}</b>   (✅ bajardi · 🟡 chala · ❌ yo'q)`;
}

/* ---------------- Shadowing tekshiruvi ---------------- */
const SH_SYS = `You check a SHADOWING homework of an English learner (Uzbekistan). The learner listened to an ORIGINAL recording and recorded himself repeating it.
You get the ORIGINAL recording(s) (numbered) and the STUDENT recording${"(s)"}. Optionally an EARLIER recording of the same student for voice comparison.
Return:
"ref": number of the original that the student shadowed (1-based; 0 if none matches);
"coverage": 0–100 — how much of that original's text the student really said;
"pron": 0–100 pronunciation accuracy (sounds, word stress) of the student;
"fluency": 0–100 (rhythm, speed, intonation compared with the original);
"wrong": up to 8 mispronounced words: {"word", "tip" (very short UZBEK tip)};
"voices": how many different human voices are clearly audible in the STUDENT recording;
"playback": true if the STUDENT recording seems to contain the original audio itself (studio-quality native voice, the original playing from a speaker/phone, identical to the original) instead of the student's own voice;
"other_person": true if the student's voice clearly differs from the EARLIER recording (only when an earlier recording is given; else false);
"suspect_uz": one short UZBEK sentence explaining any suspicion (empty if none);
"note_uz": 1–2 short UZBEK sentences of feedback for the student (what was good, what to fix).
Be fair: background noise, accent and quiet voice are NOT cheating. Answer ONLY with JSON.`;
const SH_SCHEMA = {type:"OBJECT",properties:{ref:{type:"INTEGER"},coverage:NUM,pron:NUM,fluency:NUM,wrong:{type:"ARRAY",items:{type:"OBJECT",properties:{word:STR,tip:STR},required:["word","tip"]}},voices:{type:"INTEGER"},playback:{type:"BOOLEAN"},other_person:{type:"BOOLEAN"},suspect_uz:STR,note_uz:STR},required:["ref","coverage","pron","fluency","wrong","voices","playback","other_person","suspect_uz","note_uz"]};
async function tgFileB64(env, file_id, max = 15e6){
  const f = await tg(env, "getFile", {file_id}); if (!f.ok || !f.result.file_path || (f.result.file_size || 0) > max) return null;
  const r = await fetch(`https://api.telegram.org/file/bot${env.TG_TOKEN}/${f.result.file_path}`); if (!r.ok) return null;
  const u8 = new Uint8Array(await r.arrayBuffer()); let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return {data: btoa(s), path: f.result.file_path};
}
const audioMime = (m, path) => (m && m.mime_type) || (/\.mp3$/i.test(path) ? "audio/mpeg" : /\.m4a$/i.test(path) ? "audio/mp4" : /\.wav$/i.test(path) ? "audio/wav" : "audio/ogg");
async function checkShadowing(env, g, hp, s, msg, studs){
  const it = hp.items.find(i => i.type === "shadowing"); const media = msg.voice || msg.audio || msg.document;
  const reply = (text) => toTopic(env, g.id, msg.message_thread_id || s.thread, text, {reply_to_message_id: msg.message_id, allow_sending_without_reply: true});
  const fwd = !!(msg.forward_origin || msg.forward_from || msg.forward_sender_name || msg.forward_date);
  if (fwd) { await reply(`⚠️ ${H(first(s.name))}, shadowing'ni <b>o'zingiz yozib</b> yuboring — forward qilingan audio qabul qilinmaydi 🙂`);
    for (const id of await staffIds(env, g)) await pm(env, id, `⚠️ <b>${H(s.name)}</b> (${H(g.title)}) shadowing o'rniga <b>forward qilingan audio</b> yubordi.`); return; }
  const mine = await tgFileB64(env, media.file_id); if (!mine) return reply("⚠️ Audio juda katta yoki yuklab bo'lmadi. Iltimos, qisqaroq ovozli xabar yuboring.");
  const parts = []; const refs = (hp.refs || []).slice(0, 4);
  for (const [i, r] of refs.entries()) { const a = await tgFileB64(env, r.file_id); if (a) { parts.push({text: `ORIGINAL ${i + 1} — "${r.name}":`}); parts.push({inline_data: {mime_type: r.mime || audioMime(null, a.path), data: a.data}}); } }
  if (!parts.length) parts.push({text: "(No original audio is available — judge only pronunciation and fluency; ref=0, coverage = estimate of how complete and natural the passage sounds.)"});
  if (s.vf && s.vf !== media.file_id) { const old = await tgFileB64(env, s.vf, 4e6); if (old) { parts.push({text: "EARLIER recording of the same student (voice comparison only):"}); parts.push({inline_data: {mime_type: "audio/ogg", data: old.data}}); } }
  parts.push({text: `STUDENT recording${msg.caption ? ` (caption: "${clean(msg.caption, 80)}")` : ""}:`}); parts.push({inline_data: {mime_type: audioMime(media, mine.path), data: mine.data}});
  let r; try { r = await gemini(env, SH_SYS, parts, SH_SCHEMA, 0.1); } catch (e) { return reply("⏳ AI hozir band — shadowing'ingiz saqlandi, o'qituvchi tekshiradi."); }
  const cov = Math.round(Math.max(0, Math.min(100, +r.coverage || 0))), pron = Math.round(Math.max(0, Math.min(100, +r.pron || 0))), flu = Math.round(Math.max(0, Math.min(100, +r.fluency || 0)));
  const refName = r.ref > 0 && refs[r.ref - 1] ? refs[r.ref - 1].name : (msg.caption || "");
  const sus = !!(r.playback || (r.voices || 1) > 1 || r.other_person || (msg.audio && !msg.voice));
  const counted = cov >= 40 && !r.playback;
  const k = hsubKey(hp, s.id); const sub = await J(env, k, {it: {}}); const x = sub.it[it.id] = sub.it[it.id] || {n: 0, refs: [], best: null, list: []};
  const key = refName || ("#" + (x.list.length + 1));
  if (counted && !x.refs.includes(key)) { x.refs.push(key); x.n = x.refs.length; }
  x.best = Math.max(x.best || 0, Math.round((cov + pron) / 2)); x.list.push({at: Date.now(), ref: key, cov, pron, flu, sus}); x.list = x.list.slice(-10);
  await PUT(env, k, sub, {expirationTtl: 30 * 864e5});
  if (msg.voice) { const studsAll = studs || await getStudents(env); const ss = studsAll.find(y => y.id === s.id); if (ss && !ss.vf) { ss.vf = msg.voice.file_id; await PUT(env, "students", studsAll); } }
  const bar = v => v >= 85 ? "🟢" : v >= 65 ? "🟡" : v >= 40 ? "🟠" : "🔴";
  let t = `📡 <b>Shadowing${refName ? " — " + H(refName) : ""}</b> ${counted ? "✅" : "🔁"}\n${bar(cov)} To'liqlik: <b>${cov}%</b>\n${bar(pron)} Talaffuz: <b>${pron}%</b>\n${bar(flu)} Ravonlik: <b>${flu}%</b>`;
  if ((r.wrong || []).length) t += `\n\n❗ <b>Xato so'zlar:</b>\n` + r.wrong.slice(0, 8).map(w => `• <b>${H(w.word)}</b> — ${H(w.tip)}`).join("\n");
  if (r.note_uz) t += `\n\n💬 ${H(r.note_uz)}`;
  t += counted ? `\n\n📋 Shadowing: <b>${x.n}/${it.count}</b>${x.n >= it.count ? " — bajarildi! 🎉" : ""}` : `\n\n🔁 Hisobga olinmadi: matnning ko'p qismi aytilmagan. Qaytadan, to'liq yozib yuboring.`;
  await reply(t);
  if (sus) for (const id of await staffIds(env, g)) await pm(env, id, `⚠️ <b>Shubhali shadowing</b> — ${H(s.name)} (${H(g.title)})\n${r.playback ? "🔊 Asl audio o'ynatilgan bo'lishi mumkin\n" : ""}${(r.voices || 1) > 1 ? `👥 ${r.voices} xil ovoz eshitildi\n` : ""}${r.other_person ? "🧑‍🤝‍🧑 Ovoz oldingi yozuvlariga o'xshamaydi\n" : ""}${msg.audio && !msg.voice ? "📁 Ovozli xabar emas, audio fayl yuklangan\n" : ""}${r.suspect_uz ? "💬 " + H(r.suspect_uz) : ""}\n<i>AI taxmini — tekshirib ko'ring.</i>`);
}

/* ---------------- Natijalar / davomat matnlari ---------------- */
async function hwOf(env, kind, gid){ const h = await J(env, `hw:${kind}:${gid}`, null); if (h && h.ids && h.ids.length) return h; const l = await J(env, "hw:" + kind, null); return hwFor(l, gid) ? l : null; }
async function latestHw(env, gid){ const o = {}; for (const k of KINDS) o[k] = gid ? await hwOf(env, k, gid) : await J(env, "hw:" + k, null); return o; }
const hwFor = (hw, gid) => hw && hw.ids && hw.ids.length && (!hw.groups || !hw.groups.length || hw.groups.includes(gid));
function subOf(prof, kind, hw){ return (prof.h || []).filter(e => e.k === kind && e.hw === hw.at).sort((a, b) => b.at - a.at)[0] || null; }
const recentHp = async (env, g) => { const hp = await J(env, "hp:" + g.id, null); return hp && Date.now() - hp.at < 10 * 864e5 ? hp : null; };
async function resultsText(env, g){
  const hp = await recentHp(env, g); if (hp) return hpSummary(env, g, hp, hp.st === "done");
  const studs = (await getStudents(env)).filter(s => s.gid === g.id);
  const hws = await latestHw(env, g.id); const act = KINDS.filter(k => hws[k]);
  if (!act.length) return `📊 <b>${H(g.title)}</b>\nHozircha bu guruhga vazifa berilmagan.`;
  let t = `📊 <b>NATIJALAR — ${H(g.title)}</b>\n`;
  for (const k of act) t += `${KIND_UZ[k]}: ${H(hws[k].title)}${hws[k].due ? ` · ⏰ muddat ${ddmm(hws[k].due)} ${hhmm(hws[k].due)}` : ""}\n`;
  t += "\n"; let done = 0;
  for (const [i, s] of studs.entries()) {
    const p = await getProfile(env, s.id); let full = true;
    const cells = act.map(k => { const e = subOf(p, k, hws[k]); if (!e) { full = false; return `${k === "writing" ? "✍️" : "🎤"} ❌`; }
      return `${k === "writing" ? "✍️" : "🎤"} ${fmtN(e.tot)}/${e.max}${e.late ? " ⏰" : ""}`; });
    if (full) done++;
    t += `${i + 1}. ${H(s.name)} — ${cells.join(" · ")}\n`;
  }
  return t + `\n✅ To'liq topshirdi: <b>${done}/${studs.length}</b>  ·  ⏰ = kech topshirilgan`;
}
const fmtN = x => String(Math.round((+x || 0) * 2) / 2);
async function davomatText(env, g){
  const studs = (await getStudents(env)).filter(s => s.gid === g.id);
  const day = await J(env, `gr:${g.id}:${dayKey()}`, {});
  let present = 0;
  const lines = studs.map((s, i) => { const m = dayMark(day[s.id]); if (m.startsWith("✅")) present++; return `${i + 1}. ${H(s.name)} ${m}`; });
  const pct = studs.length ? Math.round(present / studs.length * 100) : 0;
  return `#attendance\n👨‍🏫 Teacher: ${H(g.teacher || "A. Ozodbek")}\n🕘 Time: ${H(g.time || "16:00-18:00")}\n📅 Date: ${ddmmyyyy(Date.now())}${g.days && g.days.length ? "\n" + g.days.map(d => DAY_EN[d]).join("-") : ""}\n\n${lines.join("\n")}\n\n${pct}%`;
}
async function holatText(env, g){
  const hp = await recentHp(env, g); if (hp) return hpSummary(env, g, hp, false);
  const studs = (await getStudents(env)).filter(s => s.gid === g.id); const hws = await latestHw(env, g.id);
  const act = KINDS.filter(k => hws[k]); if (!act.length) return "Hozir faol vazifa yo'q.";
  let t = `🔎 <b>${H(g.title)} — vazifa holati</b>\n`;
  for (const s of studs) { const p = await getProfile(env, s.id); t += `${act.map(k => subOf(p, k, hws[k]) ? "✅" : "▫️").join("")} ${H(s.name)}${s.thread ? "" : " ⚠️ topic ulanmagan"}\n`; }
  return t + `\n(${act.map(k => KIND_UZ[k]).join(" · ")})`;
}
async function pinText(env, g){
  const studs = (await getStudents(env)).filter(s => s.gid === g.id);
  return `🔑 <b>${H(g.title)} — PIN kodlar</b>\n\n` + studs.map((s, i) => `${i + 1}. ${H(s.name)} — <code>${s.pin}</code>${s.thread ? "" : " ⚠️"}`).join("\n") +
    `\n\nSayt: Checker → Writing/Speaking → PIN kodni kiritadi.\n⚠️ = topic hali ulanmagan`;
}

/* ---------------- Haftalik hisobot ---------------- */
const WEEK = 7 * 864e5;
function weekStats(prof, grades, from, to){
  const h = (prof.h || []).filter(e => e.at >= from && e.at < to);
  const sp = h.filter(e => e.k === "speaking").map(e => e.tot / (e.max || 5) * 100);
  const wr = h.filter(e => e.k === "writing").map(e => e.tot / (e.max || 10) * 100);
  const days = grades.filter(([t]) => t >= from && t < to).map(([, r]) => r);
  const att = days.length ? days.filter(r => !r || !r.st).length / days.length * 100 : null;
  const ds = days.map(dayScore).filter(x => x !== null);
  const hw = (prof.hwc || []).filter(e => e.at >= from && e.at < to).map(e => e.total ? e.done / e.total * 100 : 0);
  return {sp: avg(sp), wr: avg(wr), att, dars: ds.length ? avg(ds) / 5 * 100 : null, hw: avg(hw), n: h.length};
}
const arrow = (a, b) => a == null || b == null ? "" : a - b > 3 ? " ↑" : b - a > 3 ? " ↓" : " →";
async function weeklyReport(env, g){
  const studs = (await getStudents(env)).filter(s => s.gid === g.id); if (!studs.length) return;
  const now = Date.now(), W = 6;
  const grDays = [];
  for (let i = 0; i < W * 7; i++) { const t = now - i * 864e5; const d = await env.KV.get(`gr:${g.id}:${dayKey(t)}`); if (d) grDays.push([t, JSON.parse(d)]); }
  const rows = [], charts = [];
  for (const s of studs) {
    const p = await getProfile(env, s.id); const gr = grDays.filter(([, d]) => d[s.id] !== undefined).map(([t, d]) => [t, d[s.id]]);
    const weeks = []; for (let w = W - 1; w >= 0; w--) weeks.push(weekStats(p, gr, now - (w + 1) * WEEK, now - w * WEEK));
    const cur = weeks[W - 1], prev = weeks[W - 2];
    const all = x => [x.sp, x.wr, x.dars, x.hw].filter(v => v != null);
    rows.push({s, cur, prev, score: all(cur).length ? avg(all(cur)) : null, pscore: all(prev).length ? avg(all(prev)) : null});
    charts.push({s, weeks});
  }
  const f = v => v == null ? "—" : Math.round(v) + "%";
  let t = `📈 <b>HAFTALIK HISOBOT — ${H(g.title)}</b>\n🗓 ${ddmm(now - WEEK + 864e5)} – ${ddmm(now)}\n\n`;
  rows.forEach((r, i) => { t += `${i + 1}. <b>${H(r.s.name)}</b>${arrow(r.score, r.pscore)}\n   🎤 ${f(r.cur.sp)}${arrow(r.cur.sp, r.prev.sp)} · ✍️ ${f(r.cur.wr)}${arrow(r.cur.wr, r.prev.wr)} · 📝 ${f(r.cur.hw)}${arrow(r.cur.hw, r.prev.hw)} · 📋 ${f(r.cur.att)} · 🎯 ${f(r.cur.dars)}${arrow(r.cur.dars, r.prev.dars)}\n`; });
  const ranked = rows.filter(r => r.score != null).sort((a, b) => b.score - a.score);
  const grow = rows.filter(r => r.score != null && r.pscore != null).sort((a, b) => (b.score - b.pscore) - (a.score - a.pscore));
  if (ranked[0]) t += `\n🏆 Hafta yulduzi: <b>${H(ranked[0].s.name)}</b> (${f(ranked[0].score)})`;
  if (grow[0] && grow[0].score - grow[0].pscore > 3) t += `\n🚀 Eng ko'p o'sgan: <b>${H(grow[0].s.name)}</b> (+${Math.round(grow[0].score - grow[0].pscore)}%)`;
  const down = grow.filter(r => r.pscore - r.score > 3).map(r => H(r.s.name));
  if (down.length) t += `\n📉 E'tibor kerak: ${down.join(", ")}`;
  t += `\n\n🎤 Speaking · ✍️ Writing · 📝 Uy vazifasi · 📋 Davomat · 🎯 Darsdagi baholar\n↑ o'sdi · ↓ tushdi · → o'zgarmadi`;
  await toTopic(env, g.id, g.res, t);
  const labels = []; for (let w = W - 1; w >= 0; w--) labels.push(ddmm(now - w * WEEK));
  const media = charts.map(c => {
    const ds = [["Speaking","#2E7D32","sp"],["Writing","#1565C0","wr"],["Uy vazifasi","#00838F","hw"],["Darsdagi baho","#EF6C00","dars"],["Davomat","#8E24AA","att"]]
      .map(([l, col, k]) => ({label: l, data: c.weeks.map(w => w[k] == null ? null : Math.round(w[k])), borderColor: col, backgroundColor: col, fill: false, spanGaps: true, borderWidth: 3, pointRadius: 4}));
    const cfg = {type:"line", data:{labels, datasets: ds}, options:{title:{display:true, text: c.s.name + " — oxirgi 6 hafta", fontSize: 18}, legend:{position:"bottom"}, scales:{yAxes:[{ticks:{min:0, max:100, stepSize:20}}]}}};
    return {type:"photo", media: "https://quickchart.io/chart?w=700&h=420&bkg=white&c=" + encodeURIComponent(JSON.stringify(cfg)), caption: `📈 ${c.s.name}`};
  });
  for (let i = 0; i < media.length; i += 10) {
    const chunk = media.slice(i, i + 10); const th = g.res > 1 ? g.res : undefined;
    await tg(env, chunk.length > 1 ? "sendMediaGroup" : "sendPhoto", chunk.length > 1 ? {chat_id: g.id, message_thread_id: th, media: chunk} : {chat_id: g.id, message_thread_id: th, photo: chunk[0].media, caption: chunk[0].caption});
  }
}

/* ---------------- Bot: menyular ---------------- */
async function myGroups(env, r){ return (await getGroups(env)).filter(g => g.active !== false && canG(r, g)); }
async function mainMenu(env, r, edit){
  const gs = await myGroups(env, r); const studs = await getStudents(env);
  const text = gs.length ? `📡 <b>AOK Radar</b>${r.admin ? "" : ` · ${H(r.name)}`}\nGuruhni tanlang:` : `📡 <b>AOK Radar</b>\nHali guruh yo'q.\n\nBotni guruhga qo'shing va <b>admin</b> qiling — guruh shu yerda o'zi paydo bo'ladi.`;
  const rows = gs.map(g => [{text: `📚 ${g.title} (${studs.filter(s => s.gid === g.id).length})`, callback_data: "g:" + g.id}]);
  if (r.admin) rows.push([{text: "👩‍🏫 O'qituvchilar", callback_data: "tl"}]);
  return edit ? tg(env, "editMessageText", {chat_id: r.uid, message_id: edit, text, parse_mode: "HTML", ...kb(rows)}) : pm(env, r.uid, text, kb(rows));
}
function groupKb(g, r){
  const rows = [[{text:"📊 Natijalar", callback_data:"res:" + g.id}, {text:"📋 Davomat", callback_data:"dav:" + g.id}],
    [{text:"🔎 Holat", callback_data:"hol:" + g.id}, {text:"🔑 PIN kodlar", callback_data:"pin:" + g.id}],
    [{text:"📈 Haftalik hisobot", callback_data:"wk:" + g.id}, {text:"⚙️ Sozlamalar", callback_data:"set:" + g.id}]];
  if (r.admin) rows.push([{text:"🗑 Guruhni yopish", callback_data:"del1:" + g.id}]);
  rows.push([{text:"⬅️ Orqaga", callback_data:"menu"}]); return kb(rows);
}
async function groupMenu(env, r, g, edit){
  const n = (await getStudents(env)).filter(s => s.gid === g.id); const ts = (await getTeachers(env)).filter(t => (t.groups || []).includes(g.id));
  const hp = await recentHp(env, g);
  const text = `📚 <b>${H(g.title)}</b>\n👥 ${n.length} ta o'quvchi · 🔗 ${n.filter(s => s.thread).length} ta topic ulangan${g.quiet ? "\n🔕 Eslatmalar o'chiq" : ""}\n` +
    `🗓 Darslar: ${g.days && g.days.length ? g.days.map(d => DAY_UZ[d]).join(", ") : "noma'lum (davomat postidan o'rganiladi)"} · ${H(g.time || "16:00-18:00")}\n` +
    `👩‍🏫 O'qituvchi: ${ts.length ? ts.map(t => H(t.name)).join(", ") : "siz"}\n📋 Homework: ${hp ? `${ddmm(hp.at)} (${hp.st === "done" ? "yakunlangan" : hp.st === "draft" ? "tasdiq kutilmoqda" : "faol"})` : "yo'q"}\n\n` +
    `Results: ${g.res ? "✅" : "❌"} · Davomat: ${g.dav ? "✅" : "❌"} · Kun e'tirozi: ${g.kun ? "✅" : "❌"} · Homework: ${g.hwt ? "✅" : "—"}`;
  return edit ? tg(env, "editMessageText", {chat_id: r.uid, message_id: edit, text, parse_mode: "HTML", ...groupKb(g, r)}) : pm(env, r.uid, text, groupKb(g, r));
}
function settingsKb(g){
  return kb([[{text:"🔗 Kun e'tirozi topic", callback_data:"w:kun:" + g.id}], [{text:"🔗 Results topic", callback_data:"w:res:" + g.id}], [{text:"🔗 Davomat topic", callback_data:"w:dav:" + g.id}], [{text:"🔗 Homework topic", callback_data:"w:hwt:" + g.id}],
    [{text:"👥 O'quvchilar qo'shish", callback_data:"w:list:" + g.id}], [{text:"🔗 Ulanmagan topiclarni ulash", callback_data:"w:links:" + g.id}],
    [{text: g.quiet ? "🔔 Eslatmalarni yoqish" : "🔕 Eslatmalarni o'chirish", callback_data:"quiet:" + g.id}], [{text:"⬅️ Orqaga", callback_data:"g:" + g.id}]]);
}
const ASK = {
  kun: "📌 <b>Kun e'tirozi</b> topic linkini yuboring.\n\n<i>Topic nomini bosib turing (telefonda) yoki o'ng tugma (kompyuterda) → «Copy link».</i>",
  res: "📊 <b>Results</b> topic linkini yuboring.",
  dav: "📋 <b>Davomat</b> topic linkini yuboring.",
  hwt: "📝 <b>Homework</b> topic linkini yuboring. (Ixtiyoriy: #Homework yozilgan postni bot o'zi ham topadi.)",
  list: "👥 <b>O'quvchilar ro'yxatini</b> yuboring — har qatorda bitta ism. Xohlasangiz yoniga topic linki:\n\n<code>Aziza Karimova\nBexruz Islomjonov - https://t.me/c/4306427312/41</code>",
  tname: "👩‍🏫 Yangi o'qituvchining <b>ism familiyasini</b> yozing:",
  hpfix: "✏️ Nimani tuzatay? Oddiy so'z bilan yozing, masalan:\n<code>2-vazifa rasm emas, ovozli bo'ladi</code>\n<code>4-vazifa muddati juma 18:00</code>"
};
const wizK = uid => "wiz:" + uid;
async function askNextLink(env, w){
  const studs = await getStudents(env); const q = studs.filter(s => s.gid === w.gid && !s.thread && s.thread !== 0);
  if (!q.length) return finishWizard(env, w);
  const s = q[0]; w.step = "links"; w.sid = s.id; await PUT(env, wizK(w.uid), w);
  return pm(env, w.uid, `🔗 <b>${H(s.name)}</b> — topic linkini yuboring.\n(${studs.filter(x => x.gid === w.gid && x.thread).length + 1}/${studs.filter(x => x.gid === w.gid).length})`,
    kb([[{text:"⏭ O'tkazib yuborish", callback_data:"skip"}, {text:"✅ Keyinroq ulayman", callback_data:"wdone"}]]));
}
async function finishWizard(env, w){
  await env.KV.delete(wizK(w.uid)); const g = (await getGroups(env)).find(x => x.id === w.gid); if (!g) return;
  const studs = await getStudents(env); if (studs.some(s => s.thread === 0)) { studs.forEach(s => { if (s.thread === 0) s.thread = null; }); await PUT(env, "students", studs); }
  await pm(env, w.uid, `✅ <b>${H(g.title)}</b> nazoratga olindi!\n\n💡 Davomat topic'iga dars kunlari va vaqtini bir marta yozib qo'ying, masalan:\n<code>Time: 16:00-18:00\nTuesday-Thursday-Saturday</code>\nBot "keyingi darsgacha" muddatini shundan hisoblaydi.`);
  await pm(env, w.uid, await pinText(env, g)); const r = await roleOf(env, w.uid); return r && groupMenu(env, r, g);
}
async function wizardNext(env, w){
  const g = (await getGroups(env)).find(x => x.id === w.gid);
  const order = ["kun", "res", "dav", "list"];
  if (w.flow === "setup") {
    const nx = order.find(k => k === "list" ? !w.listed : !g[k]);
    if (nx) { w.step = nx; await PUT(env, wizK(w.uid), w); return pm(env, w.uid, `<b>${order.indexOf(nx) + 1}/4.</b> ` + ASK[nx]); }
    if (w.type === "new") { await pm(env, w.uid, "🆕 Yangi guruh: o'quvchilar topic'larini guruhda o'zingiz oching. <b>Topic nomi o'quvchi ismi bilan bir xil bo'lsa, bot uni o'zi ulaydi.</b>"); return finishWizard(env, w); }
    return askNextLink(env, w);
  }
  await env.KV.delete(wizK(w.uid)); const r = await roleOf(env, w.uid); return groupMenu(env, r, g);
}
async function teachersMenu(env, uid, edit){
  const ts = await getTeachers(env); const gs = (await getGroups(env)).filter(g => g.active !== false);
  const text = `👩‍🏫 <b>O'qituvchilar</b>\n\n` + (ts.length ? ts.map((t, i) => `${i + 1}. <b>${H(t.name)}</b> — ${t.tg ? "✅ botga ulangan" : "⏳ hali ulanmagan"}\n     📚 ${(t.groups || []).map(id => H((gs.find(g => g.id === id) || {}).title || "?")).join(", ") || "guruh berilmagan"}`).join("\n") : "Hali o'qituvchi qo'shilmagan.") +
    `\n\nHar bir o'qituvchi o'z kodi bilan saytdagi panelga kiradi va botga shu kodni yuborib ulanadi. Baza hammaga umumiy.`;
  const rows = ts.map(t => [{text: "✏️ " + t.name, callback_data: "t:" + t.id}]); rows.push([{text: "➕ Yangi o'qituvchi", callback_data: "ta"}]); rows.push([{text: "⬅️ Orqaga", callback_data: "menu"}]);
  return edit ? tg(env, "editMessageText", {chat_id: uid, message_id: edit, text, parse_mode: "HTML", ...kb(rows)}) : pm(env, uid, text, kb(rows));
}
async function teacherCard(env, uid, t, edit){
  const gs = (await getGroups(env)).filter(g => g.active !== false);
  const text = `👩‍🏫 <b>${H(t.name)}</b>\n🔑 Kod: <code>${t.code}</code>\n${t.tg ? "✅ Botga ulangan" : "⏳ Botga hali ulanmagan — o'qituvchi botga /start bosib shu kodni yuborsin"}\n\n📚 Guruhlarini belgilang:`;
  const rows = gs.map(g => [{text: ((t.groups || []).includes(g.id) ? "✅ " : "▫️ ") + g.title, callback_data: `tg:${t.id}:${g.id}`}]);
  rows.push([{text: "🔑 Yangi kod", callback_data: "tk:" + t.id}, {text: "🗑 O'chirish", callback_data: "td1:" + t.id}]); rows.push([{text: "⬅️ Orqaga", callback_data: "tl"}]);
  return edit ? tg(env, "editMessageText", {chat_id: uid, message_id: edit, text, parse_mode: "HTML", ...kb(rows)}) : pm(env, uid, text, kb(rows));
}
async function onPrivate(env, msg){
  const me = String(msg.from.id); const text = (msg.text || "").trim(); let r = await roleOf(env, me);
  if (!r) { // o'qituvchi kodini yuborsa — ulanadi
    const ts = await getTeachers(env); const t = /^\d{6}$/.test(text) && ts.find(x => x.code === text);
    if (t) { t.tg = me; await PUT(env, "teachers", ts); await pm(env, me, `✅ Xush kelibsiz, <b>${H(t.name)}</b>!\nSiz AOK Radar'ga o'qituvchi sifatida ulandingiz.`);
      await pm(env, env.OWNER_ID, `👩‍🏫 <b>${H(t.name)}</b> botga ulandi.`); return mainMenu(env, await roleOf(env, me)); }
    return pm(env, me, "📡 <b>AOK Radar</b>\nBu bot AOK English o'qituvchilari uchun. O'quvchi bo'lsangiz, natijalaringiz guruhdagi topic'ingizga keladi 🙂\n\n👩‍🏫 O'qituvchi bo'lsangiz — 6 xonali kodingizni yuboring.");
  }
  const w = await J(env, wizK(me), null);
  if (/^\/(start|guruhlar|menu)/.test(text)) { if (w) await env.KV.delete(wizK(me)); return mainMenu(env, r); }
  const one = await myGroups(env, r);
  const pickG = async (cmd) => one.length === 1 ? one[0] : (await pm(env, me, "Guruhni tanlang:", kb(one.map(g => [{text: g.title, callback_data: cmd + ":" + g.id}]))), null);
  if (/^\/natijalar/.test(text)) { const g = await pickG("res"); return g && cbAction(env, r, "res", g); }
  if (/^\/davomat/.test(text)) { const g = await pickG("dav"); return g && cbAction(env, r, "dav", g); }
  if (/^\/holat/.test(text)) { const g = await pickG("hol"); return g && cbAction(env, r, "hol", g); }
  if (/^\/pinlar/.test(text)) { for (const g of one) await pm(env, me, await pinText(env, g)); return; }
  if (/^\/hisobot/.test(text)) { const g = await pickG("wk"); return g && cbAction(env, r, "wk", g); }
  if (/^\/(jim|yoq)/.test(text)) { const q = /^\/jim/.test(text); const gs = await getGroups(env); for (const g of gs) if (canG(r, g)) g.quiet = q; await PUT(env, "groups", gs); return pm(env, me, q ? "🔕 Eslatmalar o'chirildi. Qayta yoqish: /yoq" : "🔔 Eslatmalar yoqildi."); }
  if (/^\/(ochir|yangipin)\s+/.test(text)) {
    const studs = await getStudents(env); const gids = one.map(g => g.id); const mineS = studs.filter(x => gids.includes(x.gid));
    const q = nn(text.replace(/^\/\S+\s+/, "")); const s = mineS.find(x => nn(x.name) === q) || mineS.find(x => nn(x.name).includes(q));
    if (!s) return pm(env, me, "❓ Bunday o'quvchi topilmadi.");
    if (/^\/ochir/.test(text)) { await PUT(env, "students", studs.filter(x => x.id !== s.id)); return pm(env, me, `🗑 ${H(s.name)} ro'yxatdan o'chirildi.`); }
    s.pin = newPin(studs); await PUT(env, "students", studs); return pm(env, me, `🔑 ${H(s.name)} — yangi PIN: <code>${s.pin}</code>`);
  }
  if (!w) return pm(env, me, "📡 Menyu uchun /start bosing.");
  if (w.step === "tname" && r.admin) {
    const ts = await getTeachers(env); const t = {id: uid(), name: text.slice(0, 60), code: newCode(ts, env), tg: null, groups: [], at: Date.now()};
    ts.push(t); await PUT(env, "teachers", ts); await env.KV.delete(wizK(me)); return teacherCard(env, me, t);
  }
  const gs = await getGroups(env); const g = gs.find(x => x.id === w.gid); if (!g || !canG(r, g)) { await env.KV.delete(wizK(me)); return; }
  if (w.step === "hpfix") {
    const hp = await J(env, "hp:" + g.id, null); if (!hp) { await env.KV.delete(wizK(me)); return; }
    try { hp.items = await hpParse(env, g, hp.text, hp.at, [hp.fix, text].filter(Boolean).join("\n")); hp.fix = [hp.fix, text].filter(Boolean).join("\n"); }
    catch (e) { return pm(env, me, "⏳ AI hozir band, bir daqiqadan keyin qayta yozing."); }
    hp.st = "draft"; hp.at2 = Date.now(); await PUT(env, "hp:" + g.id, hp); await env.KV.delete(wizK(me)); return hpConfirm(env, g, hp);
  }
  if (["kun", "res", "dav", "hwt"].includes(w.step)) {
    const l = parseLink(text); if (!l) return pm(env, me, "❗ Link topilmadi. <code>https://t.me/c/…/…</code> ko'rinishidagi linkni yuboring.");
    if (l.chat !== g.id) return pm(env, me, "❗ Bu link boshqa guruhniki. Shu guruhdagi topic linkini yuboring.");
    g[w.step] = l.thread; await PUT(env, "groups", gs); await pm(env, me, "✅ Saqlandi.");
    if (w.flow !== "setup") { await env.KV.delete(wizK(me)); return groupMenu(env, r, g); }
    return wizardNext(env, w);
  }
  if (w.step === "list") {
    const studs = await getStudents(env); const topics = await J(env, "topics:" + g.id, {}); let add = 0, linked = 0;
    for (const raw of text.split(/\n/)) {
      const l = parseLink(raw); const name = raw.replace(/https?:\/\/\S+/g, "").replace(/^\s*\d+[.)]?\s*/, "").replace(/[✅❌🟦🔵🟢🟡🟠🔴⚫⚪🟣🟤️]/gu, "").replace(/[-–—:|]+\s*$/, "").replace(/\s+/g, " ").trim();
      if (name.length < 3 || !/[a-zа-я]/i.test(name)) continue;
      let s = studs.find(x => x.gid === g.id && nn(x.name) === nn(name));
      if (!s) { s = {id: uid(), gid: g.id, name: name.slice(0, 60), pin: newPin(studs), thread: null, at: Date.now()}; studs.push(s); add++; }
      if (l && l.chat === g.id) { s.thread = l.thread; linked++; }
      else if (!s.thread) { const th = Object.keys(topics).find(k => nn(topics[k]) === nn(s.name)); if (th) { s.thread = +th; linked++; } }
    }
    await PUT(env, "students", studs); w.listed = true;
    await pm(env, me, `✅ ${add} ta o'quvchi qo'shildi${linked ? `, ${linked} ta topic ulandi` : ""}.`);
    if (w.flow !== "setup") return w.type === "new" ? finishWizard(env, w) : askNextLink(env, w);
    return wizardNext(env, w);
  }
  if (w.step === "links") {
    const l = parseLink(text); if (!l) return pm(env, me, "❗ Link topilmadi. Topic linkini yuboring yoki «O'tkazib yuborish»ni bosing.");
    if (l.chat !== g.id) return pm(env, me, "❗ Bu link boshqa guruhniki.");
    const studs = await getStudents(env); const s = studs.find(x => x.id === w.sid);
    const busy = studs.find(x => x.gid === g.id && x.thread === l.thread && x.id !== w.sid);
    if (busy) return pm(env, me, `❗ Bu topic allaqachon <b>${H(busy.name)}</b>ga ulangan.`);
    if ([g.kun, g.res, g.dav, g.hwt].includes(l.thread)) return pm(env, me, "❗ Bu Results/Davomat/Kun e'tirozi/Homework topic'i. O'quvchi topic'ini yuboring.");
    if (s) { s.thread = l.thread; await PUT(env, "students", studs); await pm(env, me, `✅ ${H(s.name)} ulandi.`); }
    return askNextLink(env, w);
  }
}
async function cbAction(env, r, a, g){
  const uid = r.uid;
  if (a === "res") { const t = await resultsText(env, g); if (g.res) await toTopic(env, g.id, g.res, t); return pm(env, uid, (g.res ? "✅ Results topic'ga yuborildi:\n\n" : "⚠️ Results topic ulanmagan (⚙️ Sozlamalar). Natija:\n\n") + t); }
  if (a === "dav") { const t = await davomatText(env, g); if (g.dav) await toTopic(env, g.id, g.dav, t); return pm(env, uid, (g.dav ? "✅ Davomat topic'ga yuborildi:\n\n" : "⚠️ Davomat topic ulanmagan (⚙️ Sozlamalar).\n\n") + t); }
  if (a === "hol") return pm(env, uid, await holatText(env, g));
  if (a === "pin") return pm(env, uid, await pinText(env, g));
  if (a === "wk") { if (!g.res) return pm(env, uid, "⚠️ Results topic ulanmagan."); await weeklyReport(env, g); return pm(env, uid, "✅ Haftalik hisobot Results topic'ga yuborildi."); }
}
async function onCallback(env, cq){
  const r = await roleOf(env, cq.from.id);
  if (!r) return tg(env, "answerCallbackQuery", {callback_query_id: cq.id, text: "Bu bot AOK English o'qituvchilari uchun.", show_alert: true});
  await tg(env, "answerCallbackQuery", {callback_query_id: cq.id});
  const d = cq.data || "", chat = cq.message.chat.id, mid = cq.message.message_id;
  const gs = await getGroups(env); const [a, b, c] = d.split(":");
  if (a === "menu") return mainMenu(env, r, mid);
  // o'qituvchilar (faqat bosh admin)
  if (["tl", "ta", "t", "tg", "tk", "td1", "td2"].includes(a)) {
    if (!r.admin) return;
    const ts = await getTeachers(env); const t = ts.find(x => x.id === b);
    if (a === "tl") return teachersMenu(env, r.uid, mid);
    if (a === "ta") { await PUT(env, wizK(r.uid), {uid: r.uid, step: "tname"}); return pm(env, r.uid, ASK.tname); }
    if (!t) return;
    if (a === "t") return teacherCard(env, r.uid, t, mid);
    if (a === "tg") { t.groups = t.groups || []; t.groups = t.groups.includes(c) ? t.groups.filter(x => x !== c) : [...t.groups, c]; await PUT(env, "teachers", ts); return teacherCard(env, r.uid, t, mid); }
    if (a === "tk") { t.code = newCode(ts, env); t.tg = null; await PUT(env, "teachers", ts); return teacherCard(env, r.uid, t, mid); }
    if (a === "td1") return tg(env, "editMessageText", {chat_id: chat, message_id: mid, parse_mode: "HTML", text: `⚠️ <b>${H(t.name)}</b> o'chirilsinmi? U botga va panelga kira olmay qoladi (baza va natijalar qoladi).`, ...kb([[{text: "🗑 Ha, o'chir", callback_data: "td2:" + t.id}, {text: "Yo'q", callback_data: "t:" + t.id}]])});
    if (a === "td2") { await PUT(env, "teachers", ts.filter(x => x.id !== t.id)); return teachersMenu(env, r.uid, mid); }
  }
  const g = gs.find(x => x.id === (c || b)); if (g && !canG(r, g)) return;
  if (a === "g" && g) return groupMenu(env, r, g, mid);
  if (["res", "dav", "hol", "pin", "wk"].includes(a) && g) return cbAction(env, r, a, g);
  if (a === "set" && g) return tg(env, "editMessageText", {chat_id: chat, message_id: mid, text: `⚙️ <b>${H(g.title)}</b> — sozlamalar`, parse_mode: "HTML", ...settingsKb(g)});
  if (a === "quiet" && g) { g.quiet = !g.quiet; await PUT(env, "groups", gs); return tg(env, "editMessageReplyMarkup", {chat_id: chat, message_id: mid, ...settingsKb(g)}); }
  if (a === "typ" && g) { const w = {uid: r.uid, gid: g.id, flow: "setup", type: b}; await PUT(env, wizK(r.uid), w); return wizardNext(env, w); }
  if (a === "w" && g) { const w = {uid: r.uid, gid: g.id, flow: "edit", step: b, type: b === "list" ? "old" : undefined}; await PUT(env, wizK(r.uid), w);
    if (b === "links") return askNextLink(env, w); return pm(env, r.uid, ASK[b]); }
  if (a === "hpok" && g) { const hp = await J(env, "hp:" + g.id, null); if (!hp) return; hp.st = "active"; await PUT(env, "hp:" + g.id, hp);
    return tg(env, "editMessageText", {chat_id: chat, message_id: mid, parse_mode: "HTML", text: `✅ <b>${H(g.title)}</b> — Homework nazoratga olindi.\n\n${hpTable(hp)}`}); }
  if (a === "hped" && g) { await PUT(env, wizK(r.uid), {uid: r.uid, gid: g.id, step: "hpfix"}); return pm(env, r.uid, ASK.hpfix); }
  if (a === "skip") { const w = await J(env, wizK(r.uid), null); if (!w) return; const studs = await getStudents(env); const s = studs.find(x => x.id === w.sid); if (s) { s.thread = 0; await PUT(env, "students", studs); } return askNextLink(env, w); }
  if (a === "wdone") { const w = await J(env, wizK(r.uid), null); if (!w) return; return finishWizard(env, w); }
  if (!r.admin) return;
  if (a === "del1" && g) return tg(env, "editMessageText", {chat_id: chat, message_id: mid, parse_mode: "HTML", text: `⚠️ <b>${H(g.title)}</b> yopilsinmi?\n\nO'quvchilar, PIN kodlar, davomat va natijalar tarixi o'chadi. Guruhdagi xabarlar va topic'lar tegilmaydi.`,
    ...kb([[{text:"Ha, yopilsin", callback_data:"del2:" + g.id}, {text:"Yo'q", callback_data:"g:" + g.id}]])});
  if (a === "del2" && g) return tg(env, "editMessageText", {chat_id: chat, message_id: mid, parse_mode: "HTML", text: `❗ <b>OXIRGI TASDIQ</b>\n\n<b>${H(g.title)}</b> butunlay o'chiriladi. Buni qaytarib bo'lmaydi.`,
    ...kb([[{text:"🗑 Ha, butunlay o'chir", callback_data:"del3:" + g.id}], [{text:"Bekor qilish", callback_data:"g:" + g.id}]])});
  if (a === "del3" && g) {
    const studs = await getStudents(env); for (const s of studs.filter(x => x.gid === g.id)) await env.KV.delete("p:" + s.id);
    await PUT(env, "students", studs.filter(x => x.gid !== g.id)); await PUT(env, "groups", gs.filter(x => x.id !== g.id)); await env.KV.delete("topics:" + g.id); await env.KV.delete("hp:" + g.id);
    const ts = await getTeachers(env); ts.forEach(t => t.groups = (t.groups || []).filter(x => x !== g.id)); await PUT(env, "teachers", ts);
    await tg(env, "leaveChat", {chat_id: g.id});
    await tg(env, "editMessageText", {chat_id: chat, message_id: mid, text: `🗑 ${H(g.title)} yopildi, bot guruhdan chiqdi.`, parse_mode: "HTML"});
    return mainMenu(env, r);
  }
}
async function onGroupMessage(env, msg){
  const gid = String(msg.chat.id); const gs = await getGroups(env); const g = gs.find(x => x.id === gid);
  if (msg.migrate_to_chat_id) { if (g) { g.id = String(msg.migrate_to_chat_id); await PUT(env, "groups", gs); } return; }
  if (!g) return;
  if (g.title !== msg.chat.title && msg.chat.title) { g.title = msg.chat.title; await PUT(env, "groups", gs); }
  const th = msg.message_thread_id; const tname = (msg.forum_topic_created || msg.forum_topic_edited || msg.reply_to_message?.forum_topic_created || {}).name;
  if (th && tname) {
    const topics = await J(env, "topics:" + gid, {});
    if (topics[th] !== tname) { topics[th] = tname; await PUT(env, "topics:" + gid, topics);
      if (/^\s*home\s*work/i.test(tname) && !g.hwt) { g.hwt = th; await PUT(env, "groups", gs); }
      const studs = await getStudents(env); const s = studs.find(x => x.gid === gid && !x.thread && nn(x.name) === nn(tname));
      if (s && ![g.kun, g.res, g.dav, g.hwt].includes(th)) { s.thread = th; await PUT(env, "students", studs); for (const id of await staffIds(env, g)) await pm(env, id, `🔗 <b>${H(s.name)}</b> topic'i avtomatik ulandi (${H(g.title)}).`); } }
  }
  const text = msg.text || msg.caption || "";
  const r = msg.from ? await roleOf(env, msg.from.id) : null;
  const staff = canG(r, g) || (msg.sender_chat && String(msg.sender_chat.id) === gid);
  if (staff) {
    const pid = r ? r.uid : String(env.OWNER_ID);
    // dars vaqti / kunlari va o'qituvchi (davomat topic'ida yoki #attendance postida)
    if (th === g.dav || /#attendance/i.test(text)) {
      const te = text.match(/teacher\s*:\s*(.+)/i), ti = text.match(/time\s*:\s*([0-9:.\s–—-]+)/i), dy = parseDays(text);
      if (te || ti || dy) { if (te) g.teacher = te[1].trim().slice(0, 60); if (ti) g.time = ti[1].trim().slice(0, 40); if (dy) g.days = dy; await PUT(env, "groups", gs);
        await tg(env, "setMessageReaction", {chat_id: gid, message_id: msg.message_id, reaction: [{type: "emoji", emoji: "👌"}]}); }
      if (th === g.dav) return;
    }
    // #Homework posti
    if (/#\s*home\s*work/i.test(text)) {
      if (th && !g.hwt) { g.hwt = th; await PUT(env, "groups", gs); }
      const old = await J(env, "hp:" + gid, null); if (old && old.st !== "done") await hpFinalize(env, g, old);
      const hp = {id: uid(), at: Date.now(), by: pid, text: clean(text, 3000), items: [], refs: [], st: "draft", mid: msg.message_id};
      try { hp.items = await hpParse(env, g, text, hp.at); } catch (e) { hp.items = []; await pm(env, pid, "⏳ AI band bo'lgani uchun Homework hali o'qilmadi — 5 daqiqada qayta urinaman."); hp.retry = 1; }
      await PUT(env, "hp:" + gid, hp, {expirationTtl: 30 * 864e5}); if (hp.items.length) await hpConfirm(env, g, hp);
      await tg(env, "setMessageReaction", {chat_id: gid, message_id: msg.message_id, reaction: [{type: "emoji", emoji: "✍"}]});
      return;
    }
    // Homework ostidan tashlangan shadowing audiolari
    const au = msg.audio || msg.voice || (msg.document && /^audio\//.test(msg.document.mime_type || "") && msg.document);
    if (au && th && (th === g.hwt)) {
      const hp = await J(env, "hp:" + gid, null);
      if (hp && hp.st !== "done" && Date.now() - hp.at < 6 * 3600e3) { hp.refs = [...(hp.refs || []), {file_id: au.file_id, name: (msg.caption || au.title || au.file_name || `Audio ${hp.refs.length + 1}`).replace(/\.(mp3|m4a|ogg|wav)$/i, "").slice(0, 60), mime: au.mime_type || ""}].slice(0, 6);
        await PUT(env, "hp:" + gid, hp, {expirationTtl: 30 * 864e5}); await tg(env, "setMessageReaction", {chat_id: gid, message_id: msg.message_id, reaction: [{type: "emoji", emoji: "👌"}]}); }
      return;
    }
    if (!th) return;
    const s = (await getStudents(env)).find(x => x.gid === gid && x.thread === th); if (!s || !text) return;
    const pg = parseGrades(text); if (!pg.st && !Object.keys(pg.it).length) return;
    const k = `gr:${gid}:${dayKey()}`; const day = await J(env, k, {});
    const rec = day[s.id] || {it: {}}; rec.prev = rec.prev || {};
    for (const [name, v] of Object.entries(pg.it)) { const old = rec.it[name]; if (old && old.l != null && v.l != null && v.l > old.l) rec.prev[name] = old.l; rec.it[name] = v; }
    if (pg.st) rec.st = pg.st; else if (Object.keys(pg.it).length) rec.st = null;
    rec.due = Date.now() + 10 * 60e3; rec.v = (rec.v || 0) + 1; day[s.id] = rec; await PUT(env, k, day, {expirationTtl: 120 * 864e5});
    await tg(env, "setMessageReaction", {chat_id: gid, message_id: msg.message_id, reaction: [{type: "emoji", emoji: "👀"}]});
    return;
  }
  // ---- o'quvchi xabari: uy vazifasini topshirish ----
  if (!msg.from || msg.from.is_bot) return;
  const studs = await getStudents(env); const fid = String(msg.from.id);
  let s = th ? studs.find(x => x.gid === gid && x.thread === th) : null;
  if (s && !s.tg) { s.tg = fid; await PUT(env, "students", studs); }
  if (s && s.tg && s.tg !== fid) s = null;                 // boshqa odam birovning topic'iga yozdi
  if (!s) s = studs.find(x => x.gid === gid && x.tg === fid); // Results yoki boshqa topic'da — Telegram ID orqali
  if (!s) return;
  const hp = await J(env, "hp:" + gid, null); if (!hp || hp.st === "done" || !hp.items.length) return;
  const media = msg.voice || msg.audio || (msg.document && /^audio\//.test(msg.document.mime_type || "") && msg.document);
  if (media && hp.items.some(i => i.type === "shadowing")) return checkShadowing(env, g, hp, s, msg, studs);
  const kindOf = msg.voice || msg.audio ? "voice" : (msg.photo || (msg.document && /^image\//.test(msg.document.mime_type || ""))) ? "photo" : msg.video || msg.video_note ? "video" : (msg.text && msg.text.length >= 40) ? "text" : null;
  if (!kindOf) return;
  const it = hp.items.find(i => i.type === kindOf) || (kindOf === "photo" ? hp.items.find(i => i.type === "text") : kindOf === "text" ? hp.items.find(i => i.type === "photo") : null);
  if (!it) return;
  const k = hsubKey(hp, s.id); const sub = await J(env, k, {it: {}}); const x = sub.it[it.id] = sub.it[it.id] || {n: 0};
  if (msg.media_group_id && x.mg === msg.media_group_id) return; // bitta albom — bitta topshirish
  x.mg = msg.media_group_id || null; x.n++; x.at = Date.now(); await PUT(env, k, sub, {expirationTtl: 30 * 864e5});
  await tg(env, "setMessageReaction", {chat_id: gid, message_id: msg.message_id, reaction: [{type: "emoji", emoji: "👍"}]});
}
async function onMember(env, up){
  const chat = up.chat; if (!["group", "supergroup"].includes(chat.type)) return;
  const st = up.new_chat_member && up.new_chat_member.status; const gid = String(chat.id);
  const r = await roleOf(env, up.from.id);
  if (!r && ["member", "administrator"].includes(st)) { await say(env, gid, "📡 Bu bot faqat AOK English o'qituvchilari uchun."); return tg(env, "leaveChat", {chat_id: gid}); }
  const gs = await getGroups(env); let g = gs.find(x => x.id === gid);
  if (st === "administrator") {
    if (!g) { g = {id: gid, title: chat.title || "Guruh", at: Date.now(), active: true, by: r.uid}; gs.push(g); await PUT(env, "groups", gs);
      if (!r.admin) { const ts = await getTeachers(env); const t = ts.find(x => x.id === r.t.id); t.groups = [...new Set([...(t.groups || []), gid])]; await PUT(env, "teachers", ts);
        await pm(env, env.OWNER_ID, `📚 <b>${H(r.name)}</b> yangi guruh uladi: <b>${H(g.title)}</b>`); }
      if (!chat.is_forum) await pm(env, r.uid, `⚠️ <b>${H(g.title)}</b> guruhida Topics yoqilmagan. Guruh sozlamalarida <b>Topics</b>ni yoqing.`);
      return pm(env, r.uid, `📡 Yangi guruh ulandi: <b>${H(g.title)}</b>\n\nBu guruh yangi ochilganmi yoki eskimi?`,
        kb([[{text:"🆕 Yangi guruh", callback_data:"typ:new:" + gid}, {text:"📂 Eski guruh", callback_data:"typ:old:" + gid}]])); }
    g.active = true; await PUT(env, "groups", gs); return pm(env, r.uid, `✅ ${H(g.title)} qayta faol.`);
  }
  if (st === "member") return pm(env, r ? r.uid : env.OWNER_ID, `⚠️ <b>${H(chat.title)}</b>: botni <b>admin</b> qiling (Guruh → Administrators → Add admin), shunda guruh ulanadi.`);
  if (["left", "kicked"].includes(st) && g) { g.active = false; await PUT(env, "groups", gs); return pm(env, env.OWNER_ID, `ℹ️ Bot <b>${H(g.title)}</b> guruhidan chiqarildi.`); }
}
async function onUpdate(env, u){
  if (u.my_chat_member) return onMember(env, u.my_chat_member);
  if (u.callback_query) return onCallback(env, u.callback_query);
  const msg = u.message || u.edited_message; if (!msg) return;
  if (msg.chat.type === "private") return onPrivate(env, msg);
  if (u.edited_message && (msg.voice || msg.audio || msg.photo || msg.video)) return; // tahrir — qayta hisoblanmaydi
  return onGroupMessage(env, msg);
}

/* ---------------- Homework yakuni ---------------- */
async function hpFinalize(env, g, hp){
  if (hp.st === "done") return;
  const studs = (await getStudents(env)).filter(s => s.gid === g.id); const items = hp.items.filter(i => SUBMIT(i.type));
  if (items.length) {
    if (g.res) await toTopic(env, g.id, g.res, await hpSummary(env, g, hp, true));
    for (const s of studs) { const pr = await hpProgress(env, g, hp, s); const p = await getProfile(env, s.id);
      p.hwc = [...(p.hwc || []).filter(e => e.id !== hp.id), {id: hp.id, at: hp.at, done: items.filter(it => pr[it.id].ok).length, total: items.length}].slice(-60); await PUT(env, "p:" + s.id, p); }
  }
  hp.st = "done"; await PUT(env, "hp:" + g.id, hp, {expirationTtl: 30 * 864e5});
}

/* ---------------- CRON: har 5 daqiqada ---------------- */
async function cron(env){
  const now = Date.now(); const gs = (await getGroups(env)).filter(g => g.active !== false); if (!gs.length) return;
  const studs = await getStudents(env); const quiet = isQuiet(now);
  // 1) darsdagi baholardan keyin maqtov / tanbeh (10 daqiqa kutib)
  if (!quiet) for (const g of gs) for (const d of [dayKey(now), dayKey(now - 864e5)]) {
    const day = await J(env, `gr:${g.id}:${d}`, null); if (!day) continue;
    const sk = `gs:${g.id}:${d}`; const sent = await J(env, sk, {}); let ch = false;
    for (const [sid, rec] of Object.entries(day)) {
      if (rec.st || !rec.due || rec.due > now || sent[sid] === rec.v) continue;
      const s = studs.find(x => x.id === sid); sent[sid] = rec.v; ch = true; if (!s || !s.thread || g.quiet) continue;
      const items = Object.entries(rec.it || {}); const ls = items.filter(([, v]) => v.l != null).map(([, v]) => Math.min(v.l, 5));
      const facts = items.map(([k, v]) => `${ITEM_UZ[k] || k}: ${v.l != null ? LV_NAME(v.l) : "topshirildi"}${rec.prev && rec.prev[k] != null ? ` (avval ${LV_NAME(rec.prev[k])} edi — qayta ishlab yaxshiladi)` : ""}${v.n ? ` [izoh: ${v.n}]` : ""}`).join("; ");
      const a = avg(ls); const type = a === null ? "praise" : a >= 4 ? "praise" : a <= 2 ? "scold" : "encourage";
      await toTopic(env, g.id, s.thread, await radarText(env, type, s.name, facts));
    }
    if (ch) await PUT(env, sk, sent, {expirationTtl: 7 * 864e5});
  }
  // 2) #Homework posti: tasdiq, eslatma, maqtov, kechikish, yakun
  const hpGroups = new Set();
  for (const g of gs) {
    const hp = await J(env, "hp:" + g.id, null); if (!hp || hp.st === "done") continue;
    if (hp.retry && !hp.items.length) { try { hp.items = await hpParse(env, g, hp.text, hp.at); hp.retry = 0; await PUT(env, "hp:" + g.id, hp); if (hp.items.length) await hpConfirm(env, g, hp); } catch (e) {} continue; }
    if (!hp.items.length) continue;
    hpGroups.add(g.id);
    if (hp.st === "draft" && now - (hp.at2 || hp.at) > 15 * 60e3) { hp.st = "active"; await PUT(env, "hp:" + g.id, hp); await pm(env, hp.by, `✅ <b>${H(g.title)}</b> — Homework avtomatik nazoratga olindi.`); }
    if (now >= hpEnd(g, hp)) { if (!quiet) await hpFinalize(env, g, hp); continue; }
    if (quiet || g.quiet) continue;
    const items = hp.items.filter(i => SUBMIT(i.type)); if (!items.length) continue;
    const sk = "hst:" + hp.id; const st = await J(env, sk, {rem: {}, late: {}, pr: {}}); let ch = false; const kun = [];
    for (const s of studs.filter(x => x.gid === g.id && x.thread)) {
      const pr = await hpProgress(env, g, hp, s);
      const allOk = items.every(it => pr[it.id].ok);
      if (allOk && !st.pr[s.id]) { st.pr[s.id] = 1; ch = true; await toTopic(env, g.id, s.thread, await radarText(env, "praise", s.name, `uy vazifasining hamma qismi bajarildi (${items.length}/${items.length}) muddatidan oldin`)); continue; }
      const pend = items.filter(it => !pr[it.id].ok && now < it.due && it.due - now <= 12 * 3600e3);
      if (pend.length && now - (st.rem[s.id] || 0) >= 3 * 3600e3 - 5 * 60e3) {
        const left = Math.min(...pend.map(i => i.due)) - now;
        await toTopic(env, g.id, s.thread, await radarText(env, "remind", s.name, `bajarilmagan: ${pend.map(i => `${i.title}${i.count > 1 ? ` (${pr[i.id].n}/${i.count})` : ""}`).join("; ")}; eng yaqin muddatgacha ${Math.floor(left / 3600e3)} soat ${Math.round(left % 3600e3 / 60e3)} daqiqa qoldi`));
        st.rem[s.id] = now; ch = true; }
      const late = items.filter(it => !pr[it.id].ok && now >= it.due && !st.late[s.id + ":" + it.id]);
      if (late.length) { late.forEach(it => st.late[s.id + ":" + it.id] = 1); ch = true; kun.push({s, late});
        await toTopic(env, g.id, s.thread, await radarText(env, "late", s.name, `muddat o'tdi, bajarilmagan: ${late.map(i => i.title).join("; ")}`)); }
    }
    if (kun.length && g.kun) await toTopic(env, g.id, g.kun, `📌 <b>KUN E'TIROZI — ${ddmmyyyy(now)}</b>\nUy vazifasi muddatida bajarilmadi:\n\n` + kun.map((x, i) => `${i + 1}. ${H(x.s.name)} — ${x.late.map(it => `${HP_ICON[it.type]} ${H(it.title)}`).join(", ")}`).join("\n"));
    if (ch) await PUT(env, sk, st, {expirationTtl: 30 * 864e5});
  }
  // 3) saytdagi vazifa muddati (panelda qo'yilgan) — Homework posti bo'lmagan guruhlar uchun
  if (!quiet) {
    const st = await J(env, "hwst", {}); let ch = false;
    const S = (k, hw) => { const id = k + ":" + hw.at; return st[id] = st[id] || {pr: {}, rem: {}, late: {}, posted: {}}; };
    for (const g of gs) {
      if (hpGroups.has(g.id)) continue;
      const hws = await latestHw(env, g.id); const mine = KINDS.filter(k => hws[k] && hws[k].due); if (!mine.length) continue;
      const kunList = [];
      for (const s of studs.filter(x => x.gid === g.id)) {
        const p = await getProfile(env, s.id); const pend = [], newSub = [], lateMiss = [];
        for (const k of mine) { const hw = hws[k], e = subOf(p, k, hw), stt = S(k, hw);
          if (e && !stt.pr[s.id]) { stt.pr[s.id] = 1; ch = true; newSub.push({k, e}); }
          if (!e && now < hw.due && hw.due - now <= 12 * 3600e3) pend.push(k);
          if (!e && now >= hw.due && !stt.late[s.id]) { stt.late[s.id] = 1; ch = true; lateMiss.push(k); } }
        if (g.quiet || !s.thread) { if (lateMiss.length) kunList.push({s, ks: lateMiss}); continue; }
        if (newSub.length) { const late = newSub.some(x => x.e.late);
          await toTopic(env, g.id, s.thread, await radarText(env, late ? "late_ok" : "praise", s.name, newSub.map(x => `${x.k} uy vazifasi topshirildi${x.e.late ? " (kech)" : " muddatidan oldin"}, ball ${fmtN(x.e.tot)}/${x.e.max}`).join("; "))); }
        if (pend.length) { const last = Math.max(...pend.map(k => S(k, hws[k]).rem[s.id] || 0));
          if (now - last >= 3 * 3600e3 - 5 * 60e3) { const left = Math.min(...pend.map(k => hws[k].due)) - now;
            await toTopic(env, g.id, s.thread, await radarText(env, "remind", s.name, `topshirilmagan: ${pend.map(k => k === "writing" ? "Writing (yozma ish)" : "Speaking").join(" va ")}; muddatgacha ${Math.floor(left / 3600e3)} soat ${Math.round(left % 3600e3 / 60e3)} daqiqa qoldi`));
            pend.forEach(k => S(k, hws[k]).rem[s.id] = now); ch = true; } }
        if (lateMiss.length) { kunList.push({s, ks: lateMiss});
          await toTopic(env, g.id, s.thread, await radarText(env, "late", s.name, `muddat o'tdi, topshirilmagan: ${lateMiss.map(k => k === "writing" ? "Writing" : "Speaking").join(" va ")}`)); }
      }
      let post = false; for (const k of mine) { const stt = S(k, hws[k]); if (now >= hws[k].due && !stt.posted[g.id]) { stt.posted[g.id] = 1; ch = true; post = true; } }
      if (post && g.res) await toTopic(env, g.id, g.res, await resultsText(env, g));
      if (kunList.length && g.kun) await toTopic(env, g.id, g.kun, `📌 <b>KUN E'TIROZI — ${ddmmyyyy(now)}</b>\nUy vazifasi muddatida topshirilmadi:\n\n` +
        kunList.map((x, i) => `${i + 1}. ${H(x.s.name)} — ${x.ks.map(k => k === "writing" ? "✍️ Writing topshirmadi" : "🎤 Speaking topshirmadi").join(", ")}`).join("\n"));
    }
    for (const id of Object.keys(st)) { const at = +id.split(":")[1]; if (now - at > 30 * 864e5) { delete st[id]; ch = true; } }
    if (ch) await PUT(env, "hwst", st);
  }
  // 4) yakshanba 11:00 — haftalik hisobot
  const lt = L(now);
  if (lt.getUTCDay() === 0 && lt.getUTCHours() === 11) {
    const last = await env.KV.get("wk:last"); const today = dayKey(now);
    if (last !== today) { await env.KV.put("wk:last", today); for (const g of gs) if (g.res) await weeklyReport(env, g); }
  }
}

/* ---------------- Profil (natijalar tarixi) ---------------- */
function critAvg(list){ const m = {}; for (const t of list) for (const c of (t.criteria || [])) (m[c.name] = m[c.name] || []).push(+c.score || 0); const o = {}; for (const k in m) o[k] = r1(avg(m[k])); return o; }
function ruleCounts(prof){ const c = {}; for (const e of (prof.h || [])) for (const r of (e.rules || [])) c[r] = (c[r] || 0) + 1; return c; }
function markRepeats(errLists, counts){
  let n = 0; for (const errs of errLists) for (const e of (errs || [])) { const r = String(e.rule || "").toLowerCase().trim(); if (r && counts[r]) { e.repeat = counts[r] + 1; n++; } } return n;
}
async function saveProfile(env, stu, entry){
  const p = await getProfile(env, stu.id); p.name = stu.name; p.h = [...(p.h || []), entry].slice(-200); await PUT(env, "p:" + stu.id, p); return p;
}
const prevTags = prof => { const c = ruleCounts(prof); return Object.keys(c).sort((a, b) => c[b] - c[a]).slice(0, 30); };

/* =====================================================================
   ASOSIY
   ===================================================================== */
export default {
  async scheduled(ev, env, ctx){ ctx.waitUntil(cron(env).catch(e => console.log("cron", e.stack || e.message))); },
  async fetch(req, env, ctx){
    const url = new URL(req.url); const path = url.pathname;
    /* ---------- Telegram webhook ---------- */
    if (path === "/tg" && req.method === "POST") {
      if (!env.TG_TOKEN || req.headers.get("x-telegram-bot-api-secret-token") !== await secretOf(env)) return new Response("no", {status: 403});
      try { await onUpdate(env, await req.json()); } catch (e) { console.log("upd", e.stack || e.message); }
      return new Response("ok");
    }
    if (path === "/bot/setup" && req.method === "GET") {
      if (!env.TG_TOKEN) return new Response("TG_TOKEN qo'yilmagan.", {status: 500});
      const me = await tg(env, "getMe", {});
      const wh = await tg(env, "setWebhook", {url: url.origin + "/tg", secret_token: await secretOf(env), allowed_updates: ["message", "edited_message", "callback_query", "my_chat_member"], drop_pending_updates: false});
      const cmds = [["start","📡 Bosh menyu"],["guruhlar","📚 Guruhlarim"],["natijalar","📊 Oxirgi vazifa natijalari"],["davomat","📋 Bugungi davomat"],["holat","🔎 Kim topshirdi / kim topshirmadi"],["pinlar","🔑 O'quvchilar PIN kodlari"],["hisobot","📈 Haftalik hisobotni hozir yuborish"],["jim","🔕 Eslatmalarni vaqtincha o'chirish"],["yoq","🔔 Eslatmalarni yoqish"]];
      await tg(env, "setMyCommands", {commands: cmds.map(([command, description]) => ({command, description})), scope: {type: "chat", chat_id: +env.OWNER_ID}});
      if (wh.ok && env.OWNER_ID) await owner(env, "📡 <b>AOK Radar ishga tushdi!</b>\n\nEndi botni guruhlaringizga qo'shing va <b>admin</b> qiling. Menyu: /start");
      return new Response(`<meta charset=utf-8><body style="font:18px system-ui;padding:30px"><h2>${wh.ok ? "✅ Bot ulandi" : "❌ Xato"}</h2><p>Bot: @${H(me.result && me.result.username)}</p><p>${H(wh.description || "")}</p><p>${wh.ok ? "Telegram'da botga qarang — xabar yubordi." : ""}</p>`, {headers: {"content-type": "text/html; charset=utf-8"}});
    }

    const origin = req.headers.get("Origin") || "";
    const allow = (env.ALLOWED_ORIGIN || "https://aok-ai97.github.io").split(",").map(s => s.trim());
    const cors = {"Access-Control-Allow-Origin": allow.includes(origin) ? origin : allow[0],
      "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "content-type", "Vary": "Origin"};
    const out = (o, s = 200) => new Response(JSON.stringify(o), {status: s, headers: {...cors, "content-type": "application/json; charset=utf-8"}});
    if (req.method === "OPTIONS") return new Response(null, {headers: cors});
    if (req.method !== "POST") return out({ok: true, service: "AOK checker + Radar", version: 7, kv: !!env.KV, bot: !!env.TG_TOKEN});
    if (!allow.includes(origin)) return out({error: "Ruxsat yo'q (origin)."}, 403);
    if (!env.KV) return out({error: "KV ulanmagan (Cloudflare → Bindings → KV namespace, nomi: KV)."}, 500);

    /* ---------- 📤 Jo'nat (multipart: video + A4 sahifalar) ---------- */
    if (path === "/send") {
      try {
        const fd = await req.formData(); const stu = await studentByPin(env, fd.get("code"));
        if (!stu) return out({error: "PIN noto'g'ri."}, 401);
        const g = (await getGroups(env)).find(x => x.id === stu.gid);
        if (!g || !stu.thread) return out({error: "Sizning topic'ingiz hali ulanmagan — o'qituvchiga ayting."}, 400);
        const key = String(fd.get("key") || ""); const rv = await env.KV.getWithMetadata(key);
        if (!key.startsWith("r:") || !rv.metadata || rv.metadata.sid !== stu.id) return out({error: "Natija topilmadi."}, 404);
        if (rv.metadata.sent) return out({error: "Bu natija allaqachon yuborilgan ✅"}, 409);
        const base = {chat_id: g.id, message_thread_id: stu.thread};
        const r0 = await say(env, g.id, String(fd.get("caption") || "").slice(0, 3500), {message_thread_id: stu.thread});
        if (!r0.ok) return out({error: "Telegram: " + r0.description}, 502);
        for (const video of fd.getAll("video").slice(0, 4)) if (video && video.size > 1000) {
          if (video.size > 49e6) await say(env, g.id, "⚠️ Video juda katta bo'lgani uchun yuborilmadi (50 MB dan ortiq).", {message_thread_id: stu.thread});
          else { const vf = new FormData(); vf.append("chat_id", g.id); vf.append("message_thread_id", String(stu.thread)); vf.append("supports_streaming", "true");
            const ext = /mp4/.test(video.type) ? "mp4" : "webm"; vf.append("video", video, `speaking.${ext}`); vf.append("caption", `🎥 ${stu.name} — ${rv.metadata.title || "Speaking"}`);
            const rv2 = await tgForm(env, "sendVideo", vf);
            if (!rv2.ok) { const df = new FormData(); df.append("chat_id", g.id); df.append("message_thread_id", String(stu.thread)); df.append("document", video, `speaking.${ext}`); await tgForm(env, "sendDocument", df); } }
        }
        const pages = fd.getAll("page").filter(f => f && f.size).slice(0, 20);
        for (let i = 0; i < pages.length; i += 10) {
          const ch = pages.slice(i, i + 10); const pf = new FormData(); pf.append("chat_id", g.id); pf.append("message_thread_id", String(stu.thread));
          if (ch.length === 1) { pf.append("photo", ch[0], "page.png"); await tgForm(env, "sendPhoto", pf); }
          else { pf.append("media", JSON.stringify(ch.map((_, j) => ({type: "photo", media: `attach://p${j}`})))); ch.forEach((f, j) => pf.append(`p${j}`, f, `p${j}.png`)); await tgForm(env, "sendMediaGroup", pf); }
        }
        await env.KV.put(key, rv.value, {metadata: {...rv.metadata, sent: Date.now()}});
        return out({ok: true});
      } catch (e) { return out({error: "Yuborilmadi: " + e.message}, 500); }
    }

    let b; try { b = await req.json(); } catch { return out({error: "Noto'g'ri so'rov."}, 400); }
    const kind = b.kind === "writing" ? "writing" : "speaking";
    try {
      /* ---------- O'QITUVCHI ---------- */
      if (path.startsWith("/teacher/")) {
        const tc = (b.tcode || "").trim(); const TR = env.TEACHER_CODE && tc === env.TEACHER_CODE ? {admin: true, name: "Bosh admin"} : (() => null)();
        const TT = TR || await (async () => { const t = /^\d{6}$/.test(tc) && (await getTeachers(env)).find(x => x.code === tc); return t ? {admin: false, t, name: t.name} : null; })();
        if (!TT) return out({error: "O'qituvchi kodi noto'g'ri."}, 401);
        const myG = (await getGroups(env)).filter(g => g.active !== false && (TT.admin || (TT.t.groups || []).includes(g.id))).map(g => ({id: g.id, title: g.title}));
        const myGid = myG.map(g => g.id);
        const writeHw = async (k, mk) => { const tgt = (b.groups || []).map(String).filter(x => myGid.includes(x)); const list = tgt.length ? tgt : (myGid.length ? myGid : ["*"]); let n = 0;
          for (const gid of list) { const key = gid === "*" ? "hw:" + k : `hw:${k}:${gid}`; const old = await J(env, key, null); const v = mk(old, gid); if (v) { await PUT(env, key, v); n = v.ids ? v.ids.length : n; } } return n; };
        if (path === "/teacher/login") return out({ok: true, seeded: !!(await env.KV.get("seed:v1")), name: TT.name, admin: TT.admin});
        if (path === "/teacher/groups") return out({groups: myG, students: (await getStudents(env)).filter(s => myGid.includes(s.gid))});
        if (path === "/teacher/bank") {
          const bank = await allBank(env, kind);
          if (kind === "speaking") for (const p of ["1.2", "2"]) bank[p] = await withImages(env, bank[p] || []);
          const homeworks = {}; for (const g of myG) { const h = await hwOf(env, kind, g.id); if (h) homeworks[g.id] = h; }
          const legacy = myG.length ? null : await J(env, "hw:" + kind, null);
          const exams = JSON.parse(await env.KV.get("exams") || "[]").filter(e => e.kind === kind);
          return out({bank, homeworks, homework: legacy, exams, groups: myG, me: {name: TT.name, admin: TT.admin}});
        }
        if (path === "/teacher/import") {
          const items = b.items || []; let added = 0, skipped = 0;
          for (const k of ["writing", "speaking"]) for (const p of (k === "writing" ? WPARTS : SPARTS)) {
            const arr = await getBank(env, k, p); const have = new Set(arr.map(x => norm(keyText(x))));
            for (const it of items.filter(x => x.kind === k && (x.part || x.wtype) === p)) {
              const key = norm(keyText(it)); if (have.has(key)) { skipped++; continue; }
              have.add(key); arr.push(it); added++;
            }
            await putBank(env, k, p, arr);
          }
          await env.KV.put("seed:v1", "1");
          return out({ok: true, added, skipped});
        }
        if (path === "/teacher/item/save") {
          const it = b.item || {}; const k = it.kind === "writing" ? "writing" : "speaking";
          const part = k === "writing" ? (it.wtype === "T2" ? "T2" : "T1") : (SPARTS.includes(it.part) ? it.part : "1.1");
          const clean_it = {id: it.id || uid(), kind: k, topic: clean(it.topic, 60) || "Boshqa", created: it.created || Date.now()};
          if (k === "writing") { clean_it.wtype = part;
            if (part === "T1") Object.assign(clean_it, {sender: clean(it.sender, 150) || "The manager sent you an email.", email: clean(it.email), t11: clean(it.t11, 600), t12: clean(it.t12, 600)});
            else clean_it.essay = clean(it.essay, 1200);
          } else { clean_it.part = part; clean_it.q = (it.q || []).map(x => clean(x, 600)).filter(Boolean).slice(0, 3);
            if (part === "3") { clean_it.for = (it.for || []).map(x => clean(x, 150)).filter(Boolean).slice(0, 3); clean_it.against = (it.against || []).map(x => clean(x, 150)).filter(Boolean).slice(0, 3); }
          }
          if (!norm(keyText(clean_it))) return out({error: "Savol matni bo'sh."}, 400);
          const arr = await getBank(env, k, part);
          const key = norm(keyText(clean_it));
          const dup = arr.find(x => x.id !== clean_it.id && norm(keyText(x)) === key);
          if (dup) return out({error: `Bu savol bazada BOR (mavzu: ${dup.topic}). Takrorlanmagan savol kiriting.`, duplicate: dup.id}, 409);
          const old = arr.find(x => x.id === clean_it.id);
          const imgs = [];
          for (let im of (it.images || []).slice(0, part === "1.2" ? 2 : 1)) { if (typeof im === "string") im = {url: im};
            if (im.url || im.k) imgs.push(im.url ? {url: im.url} : {k: im.k});
            else if (im.data) { const ik = "img:" + uid(); await env.KV.put(ik, im.data); imgs.push({k: ik}); }
          }
          if (k === "speaking" && (part === "1.2" || part === "2")) clean_it.images = imgs;
          if (old) for (const im of (old.images || [])) if (im.k && !imgs.some(x => x.k === im.k)) await env.KV.delete(im.k);
          const i = arr.findIndex(x => x.id === clean_it.id);
          if (i >= 0) arr[i] = clean_it; else arr.push(clean_it);
          await putBank(env, k, part, arr);
          if (b.homework) { const at = Date.now(); await writeHw(k, (old, gid) => ({title: clean(b.homework, 120) || clean_it.topic, ids: [clean_it.id], at, due: +b.due || null, groups: gid === "*" ? [] : [gid]})); }
          return out({ok: true, item: clean_it});
        }
        if (path === "/teacher/item/delete") {
          for (const p of (kind === "writing" ? WPARTS : SPARTS)) { const arr = await getBank(env, kind, p); const it = arr.find(x => x.id === b.id);
            if (it) { for (const im of (it.images || [])) if (im.k) await env.KV.delete(im.k); await putBank(env, kind, p, arr.filter(x => x.id !== b.id)); } }
          return out({ok: true});
        }
        if (path === "/teacher/homework") {
          const at = Date.now();
          const n = await writeHw(kind, (old, gid) => {
            if (old && (!old.ids || !old.ids.length)) old = null;
            if (b.onlyDue) return old ? {...old, due: +b.due || null} : null;
            const keep = b.append && old; const ids = keep ? [...new Set([...old.ids, ...(b.ids || [])])] : (b.ids || []);
            return {title: clean(b.title, 120) || (keep ? old.title : "") || "Uyga vazifa", ids: ids.slice(0, 20), at: keep ? old.at : at, due: b.due !== undefined ? (+b.due || null) : (keep ? old.due : null), groups: gid === "*" ? [] : [gid]};
          });
          return out({ok: true, count: n});
        }
        if (path === "/teacher/audio") { const v = await env.KV.get(clean(b.key, 60)); return v ? out({clips: JSON.parse(v)}) : out({error: "Ovoz o'chirilgan (1 kundan keyin avtomatik o'chadi)."}, 404); }
        if (path === "/teacher/exam/save") {
          const exams = JSON.parse(await env.KV.get("exams") || "[]");
          const e = {id: b.id || uid(), kind, name: clean(b.name, 80) || "Exam", ids: (b.ids || []).slice(0, 500), active: b.active !== false, at: Date.now()};
          const i = exams.findIndex(x => x.id === e.id); if (i >= 0) exams[i] = {...exams[i], ...e}; else exams.push(e);
          await env.KV.put("exams", JSON.stringify(exams)); return out({ok: true, exam: e});
        }
        if (path === "/teacher/exam/delete") { const exams = JSON.parse(await env.KV.get("exams") || "[]"); await env.KV.put("exams", JSON.stringify(exams.filter(x => x.id !== b.id))); return out({ok: true}); }
        if (path === "/teacher/results") {
          const res = []; let cursor;
          do { const l = await env.KV.list({prefix: "r:" + kind + ":", cursor}); res.push(...l.keys.map(k => ({key: k.name, ...(k.metadata || {})}))); cursor = l.list_complete ? null : l.cursor; } while (cursor);
          const sids = TT.admin ? null : new Set((await getStudents(env)).filter(s => myGid.includes(s.gid)).map(s => s.id));
          return out({results: res.filter(r => !sids || sids.has(r.sid)).sort((x, y) => (y.at || 0) - (x.at || 0))});
        }
        if (path === "/teacher/result") { const v = await env.KV.get(b.key); return v ? out(JSON.parse(v)) : out({error: "Topilmadi."}, 404); }
        if (path === "/teacher/delresult") { await env.KV.delete(b.key); return out({ok: true}); }
        return out({error: "Noma'lum manzil."}, 404);
      }

      /* ---------- O'QUVCHI (PIN yoki umumiy sinf kodi) ---------- */
      const stu = await studentByPin(env, b.code);
      if (!stu && (!env.CLASS_CODE || (b.code || "").trim() !== env.CLASS_CODE)) return out({error: "PIN kod noto'g'ri."}, 401);
      const gName = async () => stu ? ((await getGroups(env)).find(g => g.id === stu.gid) || {}).title || "" : "";

      if (path === "/home") {
        const bank = await allBank(env, kind);
        const hw = stu ? await hwOf(env, kind, stu.gid) : JSON.parse(await env.KV.get("hw:" + kind) || "null");
        const exams = JSON.parse(await env.KV.get("exams") || "[]").filter(e => e.kind === kind && e.active).map(e => ({id: e.id, name: e.name, at: e.at}));
        const counts = {}, topics = {};
        for (const p in bank) { counts[p] = bank[p].length; for (const it of bank[p]) topics[it.topic] = (topics[it.topic] || 0) + 1; }
        let homework = null;
        if (hw && hw.ids && hw.ids.length) {
          homework = {title: hw.title, at: hw.at, due: hw.due || null, items: await withImages(env, await findItems(env, kind, hw.ids))};
          if (stu) { const e = subOf(await getProfile(env, stu.id), kind, hw); if (e) homework.done = {at: e.at, tot: e.tot, max: e.max}; }
        }
        return out({homework, exams, counts, topics, me: stu ? {name: stu.name, group: await gName(), linked: !!stu.thread} : null});
      }
      if (path === "/me") {
        if (!stu) return out({error: "Natijalaringizni ko'rish uchun shaxsiy PIN kod bilan kiring."}, 401);
        const p = await getProfile(env, stu.id); const days = [];
        for (let i = 0; i < 28; i++) { const t = Date.now() - i * 864e5; const d = await env.KV.get(`gr:${stu.gid}:${dayKey(t)}`); if (d) { const r = JSON.parse(d)[stu.id]; if (r) days.push({d: dayKey(t), m: dayMark(r), it: Object.fromEntries(Object.entries(r.it || {}).map(([k, v]) => [ITEM_UZ[k] || k, v.l != null ? LV_NAME(v.l) : "bor"]))}); } }
        return out({name: stu.name, group: await gName(), h: p.h || [], days, rules: ruleCounts(p)});
      }
      if (path === "/start") {
        const bank = await allBank(env, kind);
        const order = kind === "writing" ? WPARTS : SPARTS;
        let items;
        if (b.mode === "exam") {
          const e = JSON.parse(await env.KV.get("exams") || "[]").find(x => x.id === b.exam && x.kind === kind);
          if (!e) return out({error: "Imtihon topilmadi."}, 404);
          items = compose(kind, bank, order, e.ids);
          if (!items.length) return out({error: "Bu imtihonda savol yo'q."}, 400);
          return out({title: e.name, items: await withImages(env, items)});
        }
        const secs = (b.sections || []).filter(s => order.includes(s)); if (!secs.length) return out({error: "Bo'lim tanlang."}, 400);
        items = compose(kind, bank, order.filter(s => secs.includes(s)), null, b.topic || "");
        if (!items.length) return out({error: "Bu bo'limda hali savol yo'q."}, 400);
        return out({title: "Baza" + (b.topic ? " · " + b.topic : ""), items: await withImages(env, items)});
      }

      // vazifa bo'yicha topshirishmi? (muddat, kechikish)
      const hwInfo = async () => { if (b.mode !== "hw") return null; const hw = stu ? await hwOf(env, kind, stu.gid) : JSON.parse(await env.KV.get("hw:" + kind) || "null"); if (!hw) return null;
        return {at: hw.at, late: !!(hw.due && Date.now() > hw.due)}; };
      const away = b.away && typeof b.away === "object" ? {n: Math.min(99, +b.away.n || 0), s: Math.min(99999, Math.round(+b.away.s || 0))} : null;
      const prof = stu ? await getProfile(env, stu.id) : {h: []};
      const tagLine = () => { const t = prevTags(prof); return t.length ? `\nTags already used for this student's earlier mistakes (reuse EXACTLY the same tag text when a mistake is of the same kind): ${t.join(" | ")}` : ""; };

      if (path === "/writing") {
        const items = await findItems(env, "writing", b.ids || []);
        const ctx = items.map(it => it.wtype === "T1"
          ? `TASK 1 — ${it.sender}\nEmail:\n${it.email}\nTask 1.1: ${it.t11}\nTask 1.2: ${it.t12}`
          : `TASK 2 — Essay question: ${it.essay}`).join("\n\n") || "(no question given)";
        const imgs = (b.images || []).slice(0, 8);
        if (!imgs.length && !b.text) return out({error: "Rasm yuklang."}, 400);
        const parts = [{text: ctx}];
        imgs.forEach((im, i) => { parts.push({text: `Photo ${i + 1}:`}); parts.push({inline_data: {mime_type: im.mime || "image/jpeg", data: im.data}}); });
        if (b.text) parts.push({text: "Typed answer:\n" + clean(b.text, 6000)});
        const r = await gemini(env, WRITING_SYS + tagLine(), parts, W_SCHEMA);
        if (!r.tasks || !r.tasks.length) return out({error: "Rasmda javob topilmadi. Yorug' joyda, tekis qilib qayta rasmga oling."}, 422);
        r.tasks.forEach(fixTask);
        const expected = items.flatMap(it => it.wtype === "T1" ? ["1.1", "1.2"] : ["2"]);
        for (const t of [...new Set(expected)]) if (!r.tasks.some(x => x.task === t))
          r.tasks.push({task: t, missing: true, on_topic: true, topic_check: "", transcript: "", word_count: 0, errors: [], overall: 0, ideal: "", max_tips: ["Bu Task'ni ham yozing — yozilmagan Task 0 ball oladi."],
            criteria: ["Task Response", "Coherence & Cohesion", "Lexical Resource", "Grammatical Range & Accuracy", "Imlo xato"].map(n => ({name: n, score: 0, comment: "Javob berilmagan."}))});
        r.tasks.sort((a, b) => ["1.1", "1.2", "2"].indexOf(a.task) - ["1.1", "1.2", "2"].indexOf(b.task));
        const v = await verifyIdeals(env, r.tasks.map((t, i) => ({id: String(i), label: "Task " + t.task, context: ctx, text: t.missing ? "" : t.ideal})), W_CRIT);
        v.forEach((x, i) => { r.tasks[i].ideal = x.text; r.tasks[i].ideal_verified = !!x.verified; });
        r.total = r.tasks.reduce((a, t) => a + t.overall, 0); r.max = r.tasks.length * 5;
        if (stu) { r.student_name = stu.name; r.repeats = markRepeats(r.tasks.map(t => t.errors), ruleCounts(prof)); }
        r.kind = "writing"; r.mode = clean(b.mode, 10); r.title = clean(b.title, 120); r.at = Date.now(); r.away = away;
        const hi = await hwInfo(); if (hi) r.late = hi.late;
        const prevW = (prof.h || []).filter(e => e.k === "writing").slice(-1)[0]; if (prevW) r.prev = {tot: prevW.tot, max: prevW.max, at: prevW.at};
        const sc = {}; r.tasks.forEach(t => sc["t" + t.task.replace(".", "")] = t.overall);
        r.key = `r:writing:${r.at}`;
        await env.KV.put(r.key, JSON.stringify(r), {metadata: {name: r.student_name, sid: stu ? stu.id : null, gid: stu ? stu.gid : null, grp: await gName(), mode: r.mode, title: r.title, total: r.total, max: r.max, off: r.tasks.some(t => t.on_topic === false), miss: r.tasks.some(t => t.missing), late: !!r.late, away, at: r.at, ...sc}});
        if (stu) await saveProfile(env, stu, {at: r.at, k: "writing", m: r.mode, t: r.title, tot: r.total, max: r.max, cr: critAvg(r.tasks.filter(t => !t.missing)), rules: [...new Set(r.tasks.flatMap(t => (t.errors || []).map(e => String(e.rule || "").toLowerCase().trim()).filter(Boolean)))].slice(0, 20), ...(hi ? {hw: hi.at, late: hi.late} : {})});
        r.saved = true; r.can_send = !!(stu && stu.thread);
        return out(r);
      }

      if (path === "/speaking") {
        const clips = (b.clips || []).slice(0, 12).filter(c => c.audio);
        if (!clips.length) return out({error: "Audio yo'q."}, 400);
        const parts = [];
        clips.forEach((c, i) => { parts.push({text: `Clip ${i + 1} — Part ${c.part} — Question: ${clean(c.question, 800)}${c.empty ? " (the recording is almost empty)" : ""}`}); parts.push({inline_data: {mime_type: (c.mime || "audio/webm").split(";")[0], data: c.audio}}); });
        const r = await gemini(env, SPEAKING_SYS + tagLine(), parts, S_SCHEMA);
        r.parts = r.parts || [];
        const nq = {}; clips.forEach(c => nq[c.part] = (nq[c.part] || 0) + 1);
        const emptyQ = {}; clips.forEach(c => { if (c.empty) (emptyQ[c.part] = emptyQ[c.part] || []).push(c.question); });
        for (const pt of Object.keys(nq)) if (!r.parts.some(x => x.part === pt))
          r.parts.push({part: pt, question: clips.filter(c => c.part === pt).map(c => c.question).join(" / "), transcript: "[javob yo'q]", unanswered: clips.filter(c => c.part === pt).map(c => c.question), errors: [], criteria: ["Fluency & Coherence", "Lexical Resource", "Grammatical Range & Accuracy", "Pronunciation", "Task Response"].map(n => ({name: n, score: 0, comment: "Javob berilmagan."})), overall: 0, ideal: "", max_tips: ["Har bir savolga javob bering — jim qolgan savol 0 ball oladi."]});
        r.parts.sort((a, b) => SPARTS.indexOf(a.part) - SPARTS.indexOf(b.part));
        for (const p of r.parts) {
          fixTask(p);
          const un = [...new Set([...(p.unanswered || []), ...(emptyQ[p.part] || [])])]; p.unanswered = un;
          const tot = nq[p.part] || 1, frac = Math.max(0, 1 - un.length / tot);
          if (un.length) {
            const tr = p.criteria.find(c => /task/i.test(c.name));
            if (frac <= 0) { p.criteria.forEach(c => { c.score = 0; c.comment = "Javob berilmagan. " + c.comment; }); p.overall = 0; }
            else { if (tr) { tr.score = Math.min(tr.score, half(5 * frac)); tr.comment = `${un.length} ta savolga javob bermadingiz — har bir savolga javob bering. ` + tr.comment; }
                   p.overall = half(p.criteria.reduce((a, c) => a + c.score, 0) / p.criteria.length * frac); }
          }
        }
        const v = await verifyIdeals(env, (r.parts || []).map((p, i) => ({id: String(i), label: "Part " + p.part, context: p.question, text: p.overall > 0 ? p.ideal : ""})), S_CRIT.replace(/"Pronunciation"[^,]*,/, ""));
        v.forEach((x, i) => { r.parts[i].ideal = x.text; r.parts[i].ideal_verified = !!x.verified; });
        r.overall = half((r.parts || []).reduce((a, p) => a + p.overall, 0) / ((r.parts || []).length || 1));
        r.kind = "speaking"; r.student_name = stu ? stu.name : (clean(b.name, 80) || "Noma'lum"); r.mode = clean(b.mode, 10); r.title = clean(b.title, 120); r.at = Date.now(); r.away = away;
        if (stu) r.repeats = markRepeats(r.parts.map(p => p.errors), ruleCounts(prof));
        const hi = await hwInfo(); if (hi) r.late = hi.late;
        const prevS = (prof.h || []).filter(e => e.k === "speaking").slice(-1)[0]; if (prevS) r.prev = {tot: prevS.tot, max: prevS.max, at: prevS.at};
        r.audio_key = `aud:${r.at}`; r.audio_until = r.at + 86400000; r.key = `r:speaking:${r.at}`;
        await env.KV.put(r.audio_key, JSON.stringify(clips.map(c => ({mime: c.mime, audio: c.audio}))), {expirationTtl: 86400});
        await env.KV.put(r.key, JSON.stringify(r), {metadata: {name: r.student_name, sid: stu ? stu.id : null, gid: stu ? stu.gid : null, grp: await gName(), mode: r.mode, title: r.title, total: r.overall, max: 5, parts: (r.parts || []).map(p => p.part).join(","), miss: (r.parts || []).some(p => (p.unanswered || []).length), late: !!r.late, away, at: r.at}});
        if (stu) await saveProfile(env, stu, {at: r.at, k: "speaking", m: r.mode, t: r.title, tot: r.overall, max: 5, parts: (r.parts || []).map(p => p.part).join(","), cr: critAvg(r.parts), rules: [...new Set(r.parts.flatMap(p => (p.errors || []).map(e => String(e.rule || "").toLowerCase().trim()).filter(Boolean)))].slice(0, 20), ...(hi ? {hw: hi.at, late: hi.late} : {})});
        r.saved = true; r.can_send = !!(stu && stu.thread);
        return out(r);
      }

      if (path === "/pron") {
        if (!b.audio || !b.word) return out({error: "So'z yoki audio yo'q."}, 400);
        const r = await gemini(env, PRON_SYS, [{text: `Target word: "${clean(b.word, 60)}"`}, {inline_data: {mime_type: (b.mime || "audio/webm").split(";")[0], data: b.audio}}], P_SCHEMA, 0.1, true);
        r.score = Math.max(0, Math.min(100, Math.round(+r.score || 0)));
        return out(r);
      }
      return out({error: "Noma'lum manzil."}, 404);
    } catch (e) { return out({error: (e.busy ? "BUSY: " : "AI xatosi: ") + e.message.replace(/^BUSY: /, ""), busy: !!e.busy}, e.busy ? 503 : 502); }
  }
};
