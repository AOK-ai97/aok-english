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
  { const m = String(t.task || "").match(/1\s*[.,]\s*([12])|\b2\b/); t.task = m ? (m[1] ? "1." + m[1] : "2") : String(t.task || "").replace(/task/ig, "").trim(); } // "Task 1.1" → "1.1"
  t.criteria = (t.criteria||[]).map(c => ({...c, score: half(c.score)}));
  t.overall = half(t.criteria.reduce((a,c)=>a+c.score,0) / (t.criteria.length||1));
  if (t.on_topic === false) {
    const tr = t.criteria.find(c=>/task/i.test(c.name));
    if (tr) { tr.score = 0; tr.comment = "Mavzuga mos emas: " + (t.topic_check||"") + " Email/savoldagi har bir savolga javob bering."; }
    t.overall = 0;
  }
  return t;
}

// Model eskirsa ("no longer available" / 404) — keyingi modelga o'tadi; ishlagan model eslab qolinadi
const GOOD = {};
const EXH = {}, OVL = {}; // key|model → qachongacha band (limit tugagan)
const gKeys = env => [...new Set([env.GEMINI_KEY, ...Array.from({length: 11}, (_, i) => env["GEMINI_KEY" + (i + 2)])].filter(Boolean).flatMap(k => String(k).split(/[,\s]+/)).filter(Boolean))];
const USE = {c: {}, n: 0, t: Date.now()};
function aiTag(sys){ const m = [["AOK Radar 📡\", the Telegram","eslatma/maqtov"],["end-of-lesson feedback","dars feedback"],["SHADOWING","shadowing"],["speaking examiner chatting","speaking suhbat"],["FINAL result of a speaking","speaking suhbat xulosa"],["extract CEFR","vazifa kiritish"],["homework post","homework o'qish"],["Target word","talaffuz"],["model answers","namuna tekshiruvi"],["pronunciation coach","talaffuz mashqi"]];
  const low = sys.toLowerCase(); for (const [k, v] of m) if (low.includes(k.toLowerCase())) return v; return /writing/i.test(sys.slice(0, 400)) ? "writing tekshiruv" : /speaking/i.test(sys.slice(0, 400)) ? "speaking tekshiruv" : /pronunc/i.test(sys.slice(0, 400)) ? "talaffuz" : "boshqa"; }
async function aiCount(env, tag, model, force, ki, status){
  if (tag) { const k = tag + (model && /lite/.test(model) ? " (lite)" : ""); const inc = x => USE.c[x] = (USE.c[x] || 0) + 1;
    if (!status || status === 200) inc(k); inc(`#k${ki || 0}|${model}|${status === 200 ? "ok" : status === 429 ? "limit" : "err"}`); USE.n++;
    if (/writing|speaking tekshiruv|shadowing|vazifa kiritish|homework/.test(tag)) USE.h = 1; }
  // /limit real bo'lsin: asosiy tekshiruvlar (writing, speaking, shadowing) darhol yoziladi; mayda so'rovlar (talaffuz, suhbat) — 8 tadan yoki 3 daqiqada
  if (!USE.n || (!force && !USE.h && USE.n < 8 && Date.now() - USE.t < 3 * 60e3)) return;
  if (env.__kvfull) return;
  const dk = "aiu:" + qDay(); const o = await J(env, dk, {}); for (const [k, v] of Object.entries(USE.c)) o[k] = (o[k] || 0) + v;
  USE.c = {}; USE.n = 0; USE.h = 0; USE.t = Date.now(); await PUT(env, dk, o, {expirationTtl: 30 * 86400});
}
// Taxminiy bepul limit (1 kalit = 1 Google loyiha, kuniga). Google o'zgartirsa — Cloudflare'da AI_LIMITS='{"flash":250,"lite":1000}' bilan yangilanadi
function aiLimits(env){ let o = {flash: 250, lite: 1000}; try { if (env.AI_LIMITS) o = {...o, ...JSON.parse(env.AI_LIMITS)}; } catch (e) {} return o; }
function aiCapacity(env, v){
  const L = aiLimits(env), n = gKeys(env).length; let uf = 0, ul = 0;
  for (const o of Object.values(v.keys)) for (const [m, c] of Object.entries(o.m)) /lite/.test(m) ? ul += c : uf += c;
  const cf = n * L.flash, cl = n * L.lite;
  return {n, cf, cl, uf, ul, rf: Math.max(0, cf - uf), rl: Math.max(0, cl - ul)};
}
const qDay = (t = Date.now()) => dayKey(t - 13 * 3600e3); // Google bepul limiti ~13:00 (Toshkent) da yangilanadi — "limit kuni" shu paytdan boshlanadi
function limBar(u, m){ const p = m ? Math.min(100, Math.round(u / m * 100)) : 0; let r = Math.round(p / 10); if (u > 0 && r === 0) r = 1; if (p < 100 && r === 10) r = 9;
  return `${"🟥".repeat(r)}${"🟦".repeat(10 - r)}\n🔴 Ishlatildi <b>${p}%</b> (${u}) · 🔵 Qoldi <b>${100 - p}%</b> (~${Math.max(0, m - u)})`; }
async function limText(env){ await aiCount(env, null, null, true); const c = aiCapacity(env, aiUsageView(await J(env, "aiu:" + qDay(), {})));
  const now = Date.now(); let nr = atLocal(dayKey(now), 13 * 60); if (nr <= now) nr = atLocal(addDays(dayKey(now), 1), 13 * 60);
  return `🤖 <b>AI LIMIT</b> · ${c.n} ta kalit\n\n✍️ <b>Asosiy</b> — writing, speaking, shadowing · kuniga ${c.cf}\n${limBar(c.uf, c.cf)}\n\n💬 <b>Yengil</b> — talaffuz, feedback, suhbat · kuniga ${c.cl}\n${limBar(c.ul, c.cl)}\n\n♻️ Yangi limit: 13:00 (${fmtLeft(nr - now)} qoldi)\n🕒 Yangilandi: ${hhmm(now)}`; }
async function limRefresh(env){ const L0 = await J(env, "limpin", []); if (!L0.length) return; const t = await limText(env);
  for (const x of L0) try { await tg(env, "editMessageText", {chat_id: x.chat, message_id: x.mid, text: t, parse_mode: "HTML"}); } catch (e) {} }
function aiCapText(c){ return `🧮 <b>Taxminiy imkoniyat (${c.n} kalit, kuniga):</b>\n • Asosiy model (writing, speaking, shadowing): qoldi <b>~${c.rf} / ${c.cf}</b> (ishlatildi ${c.uf})\n • Yengil model (talaffuz, feedback, suhbat): qoldi <b>~${c.rl} / ${c.cl}</b> (ishlatildi ${c.ul})\n <i>1 writing/speaking/shadowing tekshiruvi ≈ 1 ta asosiy so'rov; asosiy tugasa yengilga o'tadi.</i>`; }
function aiUsageView(u){ // {feature: n, "#k1|model|ok": n}
  const feat = Object.entries(u).filter(([k]) => !k.startsWith("#")).sort((a, b) => b[1] - a[1]);
  const keys = {}; for (const [k, v] of Object.entries(u)) if (k.startsWith("#")) { const [ki, model, st] = k.slice(2).split("|"); const o = keys[ki] = keys[ki] || {ok: 0, limit: 0, err: 0, m: {}}; o[st] += v; if (st === "ok") o.m[model] = (o.m[model] || 0) + v; }
  return {total: feat.reduce((a, b) => a + b[1], 0), feat, keys};
}
async function gemini(env, sys, parts, schema, temp=0.2, lite=false){
  const TAG = aiTag(sys);
  const main = [env.MODEL, "gemini-2.5-flash", "gemini-3.5-flash", "gemini-2.5-flash-lite", "gemini-3.5-flash-lite"], light = [env.LITE_MODEL, "gemini-3.5-flash-lite", "gemini-2.5-flash-lite", env.MODEL, "gemini-2.5-flash", "gemini-3.5-flash"];
  const models = [...new Set([GOOD[lite ? "l" : "m"], ...(lite ? light : main)].filter(Boolean))]; const keys = gKeys(env);
  let last = "", busy = false; const t0 = Date.now(); const CAP = env.__aiTO || 22e3; // sayt tekshiruvi (vaqt chegarasi yo'q) — 110 s; Telegram (30 s) — 22 s
  MODELS: for (const model of models) { if ((OVL[model] || 0) > Date.now() && model !== models[models.length - 1]) { busy = true; continue; } // model Google tomonda band — boshqasiga
  for (const key of keys) {
    const ek = key.slice(-6) + "|" + model; if ((EXH[ek] || 0) > Date.now()) { busy = true; continue; }
    for (let i = 0; i < 2; i++) {
      if (Date.now() - t0 > CAP) { const e = new Error("BUSY: AI hozir band. " + last); e.busy = true; await aiErr(env, last); throw e; }
      let r; try { r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, { signal: AbortSignal.timeout(Math.max(3e3, CAP + 1e3 - (Date.now() - t0))),
        method:"POST", headers:{"content-type":"application/json","x-goog-api-key":key},
        body: JSON.stringify({ systemInstruction:{parts:[{text:sys}]}, contents:[{role:"user",parts}],
          generationConfig:{ temperature:temp, responseMimeType:"application/json", responseSchema:schema } }) }); }
      catch (e) { busy = true; last = `${model}: javob kelmadi (${e.name})`; OVL[model] = Date.now() + 45e3; continue MODELS; } // osilib qolgan so'rov — kutmaymiz
      const j = await r.json().catch(()=>({})); await aiCount(env, TAG, model, false, keys.indexOf(key) + 1, r.status);
      if (r.ok) { const tx = j.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("") || ""; let o = null; try { o = tx ? JSON.parse(tx) : null; } catch (e) {}
        if (o) { GOOD[lite ? "l" : "m"] = model; return o; }
        busy = true; last = `${model}: bo'sh/buzuq javob (${j.candidates?.[0]?.finishReason || j.promptFeedback?.blockReason || "?"})`; continue MODELS; } // keyingi model
      last = `${model}: ` + ((j.error && j.error.message) || ("Gemini " + r.status));
      if (r.status === 404 || /no longer available|not found|is not supported|deprecated/i.test(last)) { EXH[ek] = Date.now() + 864e5; break; }
      if (r.status === 429) { busy = true; const daily = /per.?day|PerDay|daily/i.test(last); EXH[ek] = Date.now() + (daily ? 3 * 3600e3 : 60e3); break; } // limit — darhol keyingi kalit/model
      if (r.status === 500 || r.status === 503) { busy = true; if (i === 0 && r.status === 500) { await new Promise(res => setTimeout(res, 1500)); continue; } OVL[model] = Date.now() + 45e3; continue MODELS; } // 503 "high demand" — model darajasida: boshqa kalit yordam bermaydi, keyingi modelga
      if (r.status === 400 && /API key/i.test(last)) { EXH[ek] = Date.now() + 864e5; break; }
      throw new Error(last);
    }
  } }
  await aiErr(env, last);
  if (busy) { const e = new Error("BUSY: AI hozir band. " + last); e.busy = true; throw e; }
  throw new Error(last);
}
async function aiErr(env, m){ try { const o = await J(env, "aierr", null); if (!o || Date.now() - o.t > 120e3) await PUT(env, "aierr", {t: Date.now(), m: String(m).slice(0, 300), n: ((o && Date.now() - o.t < 864e5) ? o.n : 0) + 1}, {expirationTtl: 3 * 86400}); } catch (e) {} }

// Ideal javobni tekshirish: 5/5 bo'lmasa tuzatiladi (2 martagacha)
async function verifyIdeals(env, list, crit){ if (!env.VERIFY_IDEALS) return list; // limitni tejash: alohida tekshiruv o'chirilgan
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
    const imgs = await Promise.all(it.images.map(async im => typeof im === "string" ? {url: im} : im.k ? (async () => { const v = await env.KV.get(im.k) || ""; return v.startsWith("data:") ? {url: v} : {data: v}; })() : im)); // import yo'li to'liq data-URI saqlaydi, panel — faqat base64
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
const sleep = ms => new Promise(z => setTimeout(z, ms));
async function tg(env, method, body){
  if (!env.TG_TOKEN) return {ok:false, description:"TG_TOKEN yo'q"};
  try {
    let j; for (let a = 0; a < 3; a++) { const r = await fetch(`https://api.telegram.org/bot${env.TG_TOKEN}/${method}`, {method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify(body)});
      j = await r.json(); const ra = j && j.parameters && j.parameters.retry_after; if (j.ok || j.error_code !== 429 || !ra || ra > 8) break; await new Promise(z => setTimeout(z, ra * 1000 + 300)); } // Telegram "Too Many Requests" — kutib qayta urinadi
    if (!j.ok) console.log("TG", method, j.description); return j;
  } catch (e) { console.log("TG", method, e.message); return {ok:false, description:e.message}; }
}
async function tgForm(env, method, fd){
  try { const r = await fetch(`https://api.telegram.org/bot${env.TG_TOKEN}/${method}`, {method:"POST", body: fd}); const j = await r.json(); if (!j.ok) console.log("TG", method, j.description);
    const th = +fd.get("message_thread_id"); if (j.ok && th > 1 && /^send/.test(method)) { const m = [].concat(j.result).pop(); if (m && m.message_id) await rmMark(env, String(fd.get("chat_id")), th, m.message_id); } // video/rasm tushdi — eslatma pastga ko'chadi
    return j; }
  catch (e) { return {ok:false, description:e.message}; }
}
const say = async (env, chat, text, extra = {}) => { const r = await tg(env, "sendMessage", {chat_id: chat, text, parse_mode: "HTML", disable_web_page_preview: true, ...extra});
  if (r && !r.ok && /parse entities|can't parse/i.test(r.description || "")) return tg(env, "sendMessage", {chat_id: chat, text: String(text).replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"), disable_web_page_preview: true, ...extra}); // HTML xato bo'lsa — oddiy matn
  return r; };
const toTopic = async (env, gid, thread, text, extra = {}) => { const {_rm, ...ex} = extra; const r = await say(env, gid, text, thread && thread > 1 ? {message_thread_id: thread, ...ex} : ex);
  if (!_rm && thread > 1 && r && r.ok && r.result) await rmMark(env, gid, thread, r.result.message_id); return r; }; // eslatmadan keyin topic'ga yozildi — eslatma pastga ko'chiriladi
const owner = (env, text, extra) => say(env, env.OWNER_ID, text, extra);
const kb = rows => ({reply_markup: {inline_keyboard: rows}});
async function secretOf(env){ const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("aok-radar:" + env.TG_TOKEN)); return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2,"0")).join("").slice(0, 48); }

/* ---------------- AI gaplar (maqtov, eslatma, tanbeh) ---------------- */
const RADAR_SYS = `You are "AOK Radar 📡", the Telegram assistant of an English teacher at AOK English (CEFR Multilevel exam preparation, Uzbekistan).
Write ONE short message in UZBEK (Latin script) to the student, addressed by first name: 1–3 sentences, max 300 characters, 1–3 fitting emoji.
Every message must be worded differently (never a template); sometimes use a light radar/signal metaphor, but not always.
Tone by type: "praise" = warm, specific (mention what exactly was good); "encourage" = friendly, points to one thing to improve;
"scold" = respectful, never rude or humiliating, firm, gives one concrete next step; "remind" = urgent but kind, says what is still missing and how much time is left;
"late" = respectful disappointment that the deadline passed + it can still be submitted before the next lesson; "late_remind" = the deadline has already passed, but the student can still submit before the lesson starts — say what is missing and how many hours are left, kind and motivating, not angry; "late_ok" = thanks for submitting even though late, next time on time.
Use ONLY the facts given. No markdown. Answer ONLY with JSON {"text": "..."}.`;
const FB_SYS = `You are "AOK Radar 📡", assistant of an English teacher (CEFR Multilevel prep, Uzbekistan). After the lesson, write ONE end-of-lesson feedback message in UZBEK (Latin script) to the student, addressed by first name.
It must cover ALL graded parts from Facts, but stay short and lively: 2–4 sentences, max 420 characters, 2–3 fitting emoji. No bullet lists, no headings, no "Hurmatli".
Structure: 1) quick overall verdict for today; 2) name the strongest part(s) specifically; 3) name the weakest part(s) with ONE concrete, doable tip for next lesson (e.g. how many words to repeat, what to re-record). If a part was improved after a redo, praise the effort. If Facts include "Uyga vazifa", also say in one short clause whether the homework was done on time, late or not done (a list of it is shown under your text, so do not list items).
Tone by Type: praise = warm and proud; encourage = friendly, motivating; scold = honest and firm but caring, never insulting. Every message must be worded differently — avoid clichés and templates; vary openings. Use the grade names as given (A'lo, yaxshi, chala…). Output JSON {"text": "..."}.`;
const FALLBACK = {
  praise: ["🔥 {n}, zo'r natija! Shu tempda davom eting 💪", "🏆 {n}, bugun a'lo ishladingiz! Radar faxrlanadi 📡", "👏 {n}, juda yaxshi! Keyingi darsda ham shunday 🚀"],
  encourage: ["🙂 {n}, yomon emas! Biroz ko'proq mashq qilsangiz, natija ancha o'sadi 💪", "📈 {n}, yaxshi harakat. Kamchiliklarni takrorlab oling, keyingi safar a'lo bo'ladi!"],
  scold: ["⚠️ {n}, bugun natija past bo'ldi. Uyda qaytadan takrorlab oling — sizdan ko'proq kutamiz 💪", "📡 {n}, radar past signal ko'rdi. Bugun 20 daqiqa ajratib qayta tayyorlaning!"],
  remind: ["⏰ {n}, vazifa hali kutib turibdi: {x}. Muddatgacha {t} qoldi!", "📡 {n}, {x} hali topshirilmagan. {t} qoldi — hozir boshlang 💪"],
  late: ["⌛ {n}, muddat o'tdi: {x} topshirilmagan. Bugun topshirsangiz baribir hisobga olinadi 🙏", "📡 {n}, vazifa muddatida kelmadi ({x}). Iltimos, bugunoq topshiring."],
  late_remind: ["⌛ {n}, muddat o'tdi, lekin hali kech emas: {x}. Darsgacha topshirsangiz hisobga olinadi 💪"],
  late_ok: ["✅ {n}, kech bo'lsa ham topshirdingiz — rahmat! Keyingi safar muddatida kutamiz 🙂"]
};
const TPL = {
  remind: ["⏰ {n}, eslatma!", "📡 {n}, radar vazifangizni qidiryapti 🔎", "⏳ {n}, vaqt ketyapti!", "🔔 {n}, bir eslatib qo'yay 🙂", "📋 {n}, vazifa sizni kutyapti!", "💪 {n}, oz qoldi — tugatib qo'ying!", "🎯 {n}, maqsadga yaqin qoldik!", "📡 {n}, signal hali kelmadi!"],
  late: ["⌛ {n}, muddat o'tib ketdi.", "📡 {n}, radar vazifani muddatida ko'rmadi.", "😕 {n}, vazifa vaqtida kelmadi.", "⚠️ {n}, muddat tugadi."],
  late_remind: ["⌛ {n}, muddat o'tdi, lekin hali kech emas — darsgacha topshiring!", "📡 {n}, hali imkoniyat bor — darsgacha yuboring!", "⏳ {n}, kechikkan bo'lsa ham topshiring, hisobga olinadi!"],
  late_ok: ["✅ {n}, kech bo'lsa ham topshirdingiz — rahmat! Keyingi safar muddatida kutamiz 🙂", "👍 {n}, yetib keldi! Keyingi safar biroz erta yuboring 🙂", "📡 {n}, signal qabul qilindi ✅ Keyingisini muddatida kutamiz!"],
  praise: ["🔥 {n}, zo'r!", "🏆 {n}, a'lo!", "👏 {n}, barakalla!", "🚀 {n}, ajoyib ish!", "📡 {n}, radar kuchli signal ko'rdi! 💪", "🌟 {n}, juda yaxshi!", "✅ {n}, hammasi joyida!"]
};
const cap1 = t => String(t || "").replace(/^\s*\S/, c => c.toUpperCase());
async function radarText(env, type, name, facts, ai){
  if (!ai && TPL[type]) { const a = TPL[type]; return a[Math.floor(Math.random() * a.length)].replace("{n}", first(name)) + (facts ? "\n📋 " + cap1(facts) : ""); } // AI ishlatilmaydi — limitni tejash
  try {
    const r = await gemini(env, RADAR_SYS, [{text: `Type: ${type}\nStudent: ${first(name)}\nFacts: ${facts}`}], {type:"OBJECT",properties:{text:STR},required:["text"]}, 1.0, true);
    if (r.text && r.text.length > 10) return r.text.slice(0, 600);
  } catch (e) {}
  const a = FALLBACK[type] || FALLBACK.encourage; return a[Math.floor(Math.random() * a.length)].replace("{n}", first(name)).replace("{x}", facts).replace("{t}", "");
}




/* ---------------- Shadowing navbati: har bir audio albatta tekshiriladi ---------------- */
async function shadowJob(env, g, hp, s, msg){ // yozuvlarni tejash: avval darhol tekshiramiz, navbatga faqat kerak bo'lsa
  const jk = `shj:${g.id}:${msg.message_id}`, lk = "shl:" + s.id;
  const mk = () => ({st: "run", t: Date.now(), c: Date.now(), gid: g.id, sid: s.id, n: 1, msg: {message_id: msg.message_id, message_thread_id: msg.message_thread_id, voice: msg.voice, audio: msg.audio, document: msg.document, caption: msg.caption, forward_origin: msg.forward_origin, forward_from_chat: msg.forward_from_chat, forward_from: msg.forward_from, from: msg.from, date: msg.date}});
  const enq = async job => { await PUT(env, jk, job, {expirationTtl: 3 * 86400}); const q = await J(env, "shq", []); if (!q.includes(jk)) { q.push(jk); await PUT(env, "shq", q.slice(-250)); } };
  if (L(Date.now()).getUTCHours() >= 5) { // kunduzi: faqat qabul qilamiz — kechasi (00:00–05:00) tekshirib, shu xabar o'rniga feedback yoziladi
    if (await J(env, jk, null)) return;
    const fu = (msg.voice || msg.audio || msg.document || {}).file_unique_id; // shu audio oldin yuborilganmi (navbatda yoki tekshirilgan)
    if (fu) { for (const k of await J(env, "shq", [])) { if (!k.startsWith("shj:" + g.id + ":")) continue; const j = await J(env, k, null); const m = j && j.msg && (j.msg.voice || j.msg.audio || j.msg.document); if (j && j.sid === s.id && m && m.file_unique_id === fu) return; }
      const it0 = hp.items.find(i => i.type === "shadowing"); const sub0 = it0 && await J(env, hsubKey(hp, s.id), null); if (sub0 && sub0.it[it0.id] && (sub0.it[it0.id].list || []).some(e => e.fu === fu)) return; }
    const r = await toTopic(env, g.id, msg.message_thread_id || s.thread, "✅ Qabul qildim! Kechasi tekshirib, shu xabar o'rniga feedback yozaman.", {reply_to_message_id: msg.message_id, allow_sending_without_reply: true, _rm: 1});
    const job = mk(); job.st = "night"; job.t = 0; job.am = r && r.ok ? r.result.message_id : null; job.msg.date = msg.date; return enq(job); }
  const lock = await J(env, lk, null);
  if (lock && lock.k !== jk && Date.now() - lock.t < 90e3 && !env.__kvfull) return enq(mk()); // shu o'quvchining boshqa audiosi tekshirilmoqda — navbat
  await PUT(env, lk, {k: jk, t: Date.now()}, {expirationTtl: 120});
  try { await checkShadowing(env, g, hp, s, msg); }
  catch (e) { if (!e.busy || env.__kvfull) throw e; const job = mk(); job.msg._notified = true; await enq(job); }
}
async function runShadow(env, jk, job, g, hp, s){
  const lk = "shl:" + job.sid; const lock = await J(env, lk, null);
  if (lock && lock.k !== jk && Date.now() - lock.t < 90e3) return; // shu o'quvchining boshqa audiosi tekshirilmoqda — navbat (cron 1 daqiqada oladi)
  await PUT(env, lk, {k: jk, t: Date.now()}, {expirationTtl: 300}); if (env.__kvfull) return; // yozib bo'lmaydi — tekshirsak takror javob bo'ladi
  try { if (job.am) job.msg._am = job.am; await checkShadowing(env, g, hp, s, job.msg); job.st = "done"; await PUT(env, jk, job, {expirationTtl: 3 * 86400});
    await PUT(env, "shq", (await J(env, "shq", [])).filter(x => x !== jk)); }
  catch (e) { if (!e.busy) throw e; job.st = job.am ? "night" : "run"; job.t = Date.now(); job.msg._notified = true; await PUT(env, jk, job, {expirationTtl: 3 * 86400}); }
}
async function hpRefs(env, gid, hp){ // Homework audiolari: hp.refs + har bir audio alohida kalitda (parallel tashlanganda yo'qolmasin)
  const out0 = [...(hp.refs || [])]; try { const L = await env.KV.list({prefix: `hpr:${gid}:${hp.id}:`});
    for (const k of L.keys) { const r = await J(env, k.name, null); if (r && !out0.some(x => x.fu && x.fu === r.fu)) out0.push({...r, name: r.name || `Audio ${out0.length + 1}`}); } } catch (_) {}
  return out0.slice(0, 6); }
async function fbFixOnce(env){ if (await env.KV.get("mig:fbn1")) return; await env.KV.put("mig:fbn1", "1", {expirationTtl: 30 * 86400});
  const k = "gs:-1004306427312:2026-11-14"; const o = await J(env, k, null); if (o && o["mwb183i8k1f9"]) { delete o["mwb183i8k1f9"]; await PUT(env, k, o, {expirationTtl: 7 * 86400}); }
  const q = await J(env, "fbq", []); q.push({gid: "-1004306427312", d: "2026-11-14", by: null, t: Date.now()}); await PUT(env, "fbq", q.slice(-20)); }
async function nightFailOnce(env){ if (await env.KV.get("mig:nfn1")) return; await env.KV.put("mig:nfn1", "1", {expirationTtl: 30 * 86400});
  for (const k of (await env.KV.list({prefix: "gj:"})).keys) { const j = await J(env, k.name, null); if (j && j.st === "fail" && Date.now() - (j.at || 0) < 3 * 864e5) await nightFailNote(env, j).catch(() => {}); } }
async function pronSkipOnce(env){ if (await env.KV.get("mig:pron1")) return; await env.KV.put("mig:pron1", "1", {expirationTtl: 30 * 86400});
  for (const k of ["r:speaking:1794497439466"]) { const rv = await env.KV.getWithMetadata(k); if (rv.value && rv.metadata && !rv.metadata.pronHash) await env.KV.put(k, rv.value, {metadata: {...rv.metadata, pronHash: "skip"}}); } } // Sirojiddin: urinishlari eski versiyada tugagan
async function shRegrade(env){ // bir martalik: asl audiosi botda bo'lmagan mashqlar uchun 0% qo'yilganlarni qayta tekshirish (har daqiqada 1 tadan, qulf bilan)
  const st = await J(env, "mig:shrg2", null); if (st && st.done) return; if (await env.KV.get("shrg:lk")) return;
  await env.KV.put("shrg:lk", "1", {expirationTtl: 120}); const S = st || {seen: []};
  try { const gs = await getGroups(env), studs = await getStudents(env); let cur;
    do { const L = await env.KV.list({prefix: "shj:", cursor: cur}); cur = L.list_complete ? null : L.cursor;
      for (const kk of L.keys) { if (S.seen.includes(kk.name)) continue;
        S.seen.push(kk.name); const job = await J(env, kk.name, null); if (!job || job.st !== "done" || !job.msg) continue;
        const g = gs.find(x => x.id === job.gid), s = studs.find(x => x.id === job.sid); const hp = g && await J(env, "hp:" + g.id, null); if (!hp || !s) continue;
        const it = hp.items.find(i => i.type === "shadowing"); if (!it || (hp.refs || []).length >= (it.count || 1)) continue;
        const media = job.msg.voice || job.msg.audio || job.msg.document; if (!media) continue;
        const k = hsubKey(hp, s.id); const sub = await J(env, k, null); const x = sub && sub.it[it.id]; if (!x) continue;
        const e = (x.list || []).find(z => z.fu === media.file_unique_id); if (e && e.cov > 0) continue;
        if (e) { x.list = x.list.filter(z => z !== e); await PUT(env, k, sub, {expirationTtl: 30 * 86400}); }
        await PUT(env, "mig:shrg2", S, {expirationTtl: 7 * 86400}); // avval belgilab qo'yamiz — ikki marta tekshirilmaydi
        if (job.am) job.msg._am = job.am; job.msg._notified = true; job.msg._rg = 1;
        try { await checkShadowing(env, g, hp, s, job.msg, studs); } catch (err) { console.log("shrg", err.message); }
        return; } }
    while (cur);
    // yakuniy qayta sanash: har audio o'z kaliti bilan
    for (const g of gs) { const hp = await J(env, "hp:" + g.id, null); const it = hp && hp.items.find(i => i.type === "shadowing"); if (!it) continue;
      for (const s of studs.filter(x => x.gid === g.id)) { const k = hsubKey(hp, s.id); const sub = await J(env, k, null); const x = sub && sub.it[it.id]; if (!x) continue;
        const best = {}; for (const e of x.list || []) if (e.fu && (!best[e.fu] || e.cov > best[e.fu].cov)) best[e.fu] = e; x.list = (x.list || []).filter(e => !e.fu || best[e.fu] === e);
        for (const e of x.list) if (String(e.ref).startsWith("#") && e.fu) e.ref = "#" + e.fu;
        const refs = [...new Set(x.list.filter(e => e.cov >= 40).map(e => e.ref))]; const before = x.n || 0;
        x.refs = refs; x.n = refs.length; if (x.n >= it.count && !x.doneAt) { const ds = x.list.filter(e => e.cov >= 40).map(e => e.at).sort((a, b) => a - b); x.doneAt = ds[Math.min(it.count, ds.length) - 1] || Date.now(); }
        await PUT(env, k, sub, {expirationTtl: 30 * 86400}); } }
    S.done = 1; await PUT(env, "mig:shrg2", S, {expirationTtl: 7 * 86400});
  } finally { await env.KV.delete("shrg:lk"); }
}
async function shadowQueue(env){ if (env.__kvfull) return; // har daqiqa: tugallanmagan yoki navbatda qolgan audiolar
  if (!(await env.KV.get("mig:sh2"))) { await env.KV.put("mig:sh2", "1", {expirationTtl: 30 * 86400}); // kecha "AI band" bilan yopilgan audiolarni qayta navbatga qo'yish
    const studs0 = await getStudents(env); const gs0 = await getGroups(env); const q0 = await J(env, "shq", []); let cur;
    do { const L = await env.KV.list({prefix: "shj:", cursor: cur}); cur = L.list_complete ? null : L.cursor;
      for (const k of L.keys) { const job = await J(env, k.name, null); if (!job || job.st !== "done" || Date.now() - job.t > 2 * 864e5) continue;
        const g = gs0.find(x => x.id === job.gid), s = studs0.find(x => x.id === job.sid); const hp = g && await J(env, "hp:" + g.id, null); if (!hp || !s) continue;
        const it = hp.items.find(i => i.type === "shadowing"); const sub = it && await J(env, hsubKey(hp, s.id), null); const x = sub && sub.it[it.id];
        const checked = x && (x.list || []).some(e => Math.abs((e.at || 0) - job.t) < 150e3);
        if (!checked) { job.st = "run"; job.t = 0; job.n = 1; job.msg._notified = true; await PUT(env, k.name, job, {expirationTtl: 3 * 86400}); if (!q0.includes(k.name)) q0.push(k.name); } } }
    while (cur);
    await PUT(env, "shq", q0.slice(-80)); }
  if (!(await env.KV.get("mig:sh1"))) { await env.KV.put("mig:sh1", "1", {expirationTtl: 30 * 86400}); // eski qoida (fondagi asl audio) bilan rad etilganlarni qayta hisoblash
    const st0 = await getStudents(env);
    for (const g of await getGroups(env)) { const hp = await J(env, "hp:" + g.id, null); if (!hp || hp.st === "done") continue; const it = hp.items.find(i => i.type === "shadowing"); if (!it) continue;
      for (const s of st0.filter(x => x.gid === g.id)) { const k = hsubKey(hp, s.id); const sub = await J(env, k, null); const x = sub && sub.it[it.id]; if (!x) continue; let ch = false;
        for (const e of x.list || []) if (e.cov >= 40 && !x.refs.includes(e.ref)) { x.refs.push(e.ref); ch = true; }
        if (ch) { x.n = x.refs.length; if (x.n >= it.count && !x.doneAt) x.doneAt = Date.now(); await PUT(env, k, sub, {expirationTtl: 30 * 86400});
          if (s.thread) await toTopic(env, g.id, s.thread, `📡 ${H(first(s.name))}, shadowing'ingiz qayta tekshirildi va hisobga olindi ✅\n📋 Shadowing: <b>${x.n}/${it.count}</b>${x.n >= it.count ? " — bajarildi! 🎉" : ""}`); } } } }
  const q = await J(env, "shq", []); if (!q.length) return; const gs = await getGroups(env); const studs = await getStudents(env); let done = 0;
  for (const jk of q) { const job = await J(env, jk, null);
    if (!job || job.st === "done" || job.n > 60 || Date.now() - (job.c || 0) > (job.am !== undefined ? 50 : 20) * 3600e3) { await PUT(env, "shq", (await J(env, "shq", [])).filter(x => x !== jk)); continue; }
    if (job.st === "night" && L(Date.now()).getUTCHours() >= 8) continue; // kunduzi qabul qilinganlar — faqat kechasi (00:00–08:00)
    if (Date.now() - job.t < (job.n <= 3 ? 45e3 : job.n <= 10 ? 5 * 60e3 : 20 * 60e3)) continue;
    if (job.st !== "night" && job.am === undefined && isQuiet(Date.now()) && (job.t === 0 || Date.now() - (job.c || job.t) > 30 * 60e3)) continue; // tungi 00–06: eski audiolar ertalab tekshiriladi (o'quvchini uyg'otmaslik) // AI band bo'lsa — tobora siyrakroq qayta urinish
    const g = gs.find(x => x.id === job.gid), s = studs.find(x => x.id === job.sid), hp = g && await J(env, "hp:" + g.id, null);
    if (!g || !s || !hp) { await PUT(env, "shq", (await J(env, "shq", [])).filter(x => x !== jk)); continue; }
    job.n++; job.t = Date.now(); await PUT(env, jk, job, {expirationTtl: 3 * 86400});
    try { await runShadow(env, jk, job, g, hp, s); } catch (e) { console.log("shq", e.message); }
    if (++done >= 5) break; }
}

/* ================= VAZIFANI BOT ORQALI KIRITISH: worksheet → baza → vazifa ================= */
const IMP_SYS = `You extract CEFR Multilevel exam homework questions from an English teacher's worksheet. Input may be plain text, photos, a PDF, or the text of a Word file followed by its embedded pictures labelled "IMAGE 1", "IMAGE 2"…
Return JSON {"title": short homework title (the topic, e.g. "Celebrations & Holidays"), "items": [...]}. Item kinds:
- Speaking Part 1.1: {"kind":"speaking","part":"1.1","topic":"…","q":["ONE question"]} — make ONE item PER Part 1.1 question.
- Speaking Part 1.2: {"kind":"speaking","part":"1.2","topic":"…","q":[its 3 questions],"img":[indexes of its 2 pictures]}.
- Speaking Part 2: {"kind":"speaking","part":"2","topic":"…","q":[its questions],"img":[index of its picture]}.
- Speaking Part 3: {"kind":"speaking","part":"3","topic":"…","q":["the statement/topic"],"for":[up to 3 points],"against":[up to 3 points]}.
- Writing Task 1: {"kind":"writing","part":"T1","topic":"…","sender":"e.g. The City Council sent you an email.","email":"full email text","t11":"Task 1.1 instruction","t12":"Task 1.2 instruction"} (t11 / t12 may be "" if missing).
- Writing Task 2: {"kind":"writing","part":"T2","topic":"…","essay":"full essay question"}.
Worksheets often contain a long article, vocabulary tables, sample answers and tips — skip those, but ALWAYS return every exam question you find: e.g. a "SPEAKING PART 3" section with a statement and a FOR/AGAINST table is one Part 3 item (the table cells alternate FOR, AGAINST row by row). Never return an empty list if any question exists.
Copy question texts exactly (fix only obvious OCR typos, remove numbering like "1."). Ignore articles, vocabulary tables, answer keys, structures/frames, grammar exercises and reading texts.
"img" uses the IMAGE numbers (1-based) or photo numbers; in Word text a marker "[PICTURE n]" is IMAGE n placed at that spot (use the label just before it, e.g. "Part 1.2 — 1-rasm"); [] if unknown. topic = short English topic. Answer ONLY with JSON.`;
const IMP_SCHEMA = {type:"OBJECT",properties:{title:STR,items:{type:"ARRAY",items:{type:"OBJECT",properties:{kind:STR,part:STR,topic:STR,q:{type:"ARRAY",items:STR},img:{type:"ARRAY",items:{type:"INTEGER"}},for:{type:"ARRAY",items:STR},against:{type:"ARRAY",items:STR},sender:STR,email:STR,t11:STR,t12:STR,essay:STR},required:["kind","part"]}}},required:["title","items"]};
// Ustoz so'rovi (wizard): o'chirish o'rniga "yopildi" belgisi — kalit doim mavjud, KV keshi eskirgan "yo'q" javobini bermaydi
const wizGet = async (env, u) => { const w = await J(env, wizK(u), null); return w && !w._del ? w : null; };
const wizDel = (env, u) => PUT(env, wizK(u), {_del: 1}, {expirationTtl: 7 * 86400});
const impK = uid => "imp:" + uid, impD = id => "impd:" + id;
async function tgFileBytes(env, file_id, max = 18e6){
  const f = await tg(env, "getFile", {file_id}); if (!f.ok || !f.result.file_path || (f.result.file_size || 0) > max) return null;
  const r = await fetch(`https://api.telegram.org/file/bot${env.TG_TOKEN}/${f.result.file_path}`); return r.ok ? {u8: new Uint8Array(await r.arrayBuffer()), path: f.result.file_path} : null;
}
const b64of = u8 => { let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
async function unzip(u8){ // .docx (zip) — kerakli fayllarni ochish
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength); let e = u8.length - 22; while (e > 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
  if (e <= 0) return {}; const n = dv.getUint16(e + 10, true); let p = dv.getUint32(e + 16, true); const out = {};
  for (let i = 0; i < n; i++) { if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), off = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nl)); p += 46 + nl + xl + cl;
    if (!/^word\/(document\.xml|media\/|_rels\/document\.xml\.rels)/.test(name)) continue;
    const ln = dv.getUint16(off + 26, true), lx = dv.getUint16(off + 28, true); const data = u8.subarray(off + 30 + ln + lx, off + 30 + ln + lx + csize);
    if (method === 0) out[name] = data; else if (method === 8) out[name] = new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer());
  }
  return out;
}
function docxText(xml, pic){
  return xml.replace(/<w:tab\/>/g, "\t").replace(/<\/w:p>/g, "\n").replace(/<w:br[^>]*\/>/g, "\n").replace(/<w:drawing>[\s\S]*?<\/w:drawing>/g, d => pic ? pic(d) : " [PICTURE] ").replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/\n{3,}/g, "\n\n").trim();
}
async function impAdd(env, r, msg){
  const me = r.uid; const ptr = await J(env, impK(me), null); // ko'rsatkich → joriy qoralama (har qoralama alohida YANGI kalitda: KV keshi eski "yo'q" javobini bermasin)
  let d = ptr && ptr.id && Date.now() - (ptr.mt || 0) < 30 * 60e3 ? await J(env, impD(ptr.id), null) : null; if (!d || d._del || d.items) d = {id: uid(), parts: [], at: Date.now()};
  if (msg.document) d.parts.push({t: "doc", id: msg.document.file_id, name: msg.document.file_name || "fayl", mime: msg.document.mime_type || ""});
  else if (msg.photo) d.parts.push({t: "photo", id: msg.photo[msg.photo.length - 1].file_id});
  else d.parts.push({t: "text", text: clean(msg.text, 8000)});
  if (msg.caption) d.parts.push({t: "text", text: clean(msg.caption, 2000)});
  d.parts = d.parts.slice(0, 20);
  const t = `📥 <b>Vazifa uchun qabul qilindi:</b> ${d.parts.filter(p => p.t !== "text").length} ta fayl/rasm${d.parts.some(p => p.t === "text") ? " + matn" : ""}.\nHammasini tashlab bo'lgach bosing 👇`;
  const k = kb([[{text: "▶️ Savollarni ajratish", callback_data: "imp:go:" + d.id}], [{text: "🗑 Bekor qilish", callback_data: "imp:del:" + d.id}]]);
  if (d.mid && Date.now() - (d.mt || 0) < 60e3) await tg(env, "editMessageText", {chat_id: me, message_id: d.mid, text: t, parse_mode: "HTML", ...k});
  else { const x = await pm(env, me, t, k); if (x.ok) d.mid = x.result.message_id; }
  d.mt = Date.now(); await PUT(env, impD(d.id), d, {expirationTtl: 2 * 86400}); await PUT(env, impK(me), {id: d.id, mt: d.mt}, {expirationTtl: 2 * 86400});
  if (env.__kvfull && d.mid) await tg(env, "editMessageText", {chat_id: me, message_id: d.mid, parse_mode: "HTML", text: "⏳ Bugun botning kunlik xotira limiti tugadi — vazifani saqlab bo'lmaydi.\nFaylni <b>ertalab 05:00 dan keyin</b> qayta yuboring."});
}
function impHeur(text){ // zaxira tahlil (AI bo'sh qaytarsa yoki kamroq topsa): lesson pack formati
  const L = String(text || "").split("\n").map(x => x.trim()).filter(Boolean), out = [];
  const cq = x => x.replace(/^\d+[.)]\s*/, "").replace(/\s*\((Struktura|Part)[^)]*\)\s*$/i, "").trim();
  const pic = {}; for (let i = 1; i < L.length; i++) { const m = L[i].match(/^\[PICTURE (\d+)\]$/); if (m) { const lb = L[i - 1]; const k = /1\.2/.test(lb) ? "1.2" : /part\s*2\b/i.test(lb) ? "2" : null; if (k) (pic[k] = pic[k] || []).push(+m[1]); } }
  const qsAfter = i => { const q = []; for (let k = i + 1; k < L.length && q.length < 6; k++) { if (/^(part\s*(1\.1|1\.2|2|3)|task\s*[12]|💡|writing|speaking)/i.test(L[k])) break; if (/\?\s*(\([^)]*\))?$/.test(L[k]) || /^\d+[.)]\s/.test(L[k])) q.push(cq(L[k])); } return q.filter(x => x.length > 8); };
  for (let i = 0; i < L.length; i++) { const x = L[i];
    if (/^part\s*1\.1$/i.test(x)) { for (const q of qsAfter(i)) out.push({kind: "speaking", part: "1.1", topic: "", q: [q]}); continue; }
    if (/^part\s*1\.2$/i.test(x)) { const q = qsAfter(i); if (q.length) out.push({kind: "speaking", part: "1.2", topic: "", q: q.slice(0, 3), img: (pic["1.2"] || []).slice(0, 2)}); continue; }
    if (/^part\s*2$/i.test(x) && !/^\[PICTURE/.test(L[i + 1] || "")) { const q = qsAfter(i); if (q.length) out.push({kind: "speaking", part: "2", topic: "", q: q.slice(0, 3), img: (pic["2"] || []).slice(0, 1)}); continue; }
    // Part 3: "A. Statement" + "FOR: a · b · c" + "AGAINST: ..."
    if (/^FOR\s*:/i.test(L[i + 1] || "") && /^AGAINST\s*:/i.test(L[i + 2] || "")) { const sp = z => z.replace(/^(FOR|AGAINST)\s*:\s*/i, "").split(/\s*[·•;]\s*/).filter(Boolean).slice(0, 3);
      out.push({kind: "speaking", part: "3", topic: "", q: [x.replace(/^([A-Z]|\d+)[.)]\s*/, "")], for: sp(L[i + 1]), against: sp(L[i + 2])}); i += 2; continue; }
    // Part 3: jadval (✅ FOR / ❌ AGAINST, kataklar navbatma-navbat)
    if (/speaking\s*part\s*3\b/i.test(x)) { let j = i + 1; while (j < L.length && /qadam|daqiqa|minute|instruction/i.test(L[j])) j++; const st = L[j];
      const fi = L.findIndex((y, k) => k > j && k < j + 4 && /^(✅\s*)?FOR\b/i.test(y)), ai = L.findIndex((y, k) => k > j && k < j + 4 && /^(❌\s*)?AGAINST\b/i.test(y)); const b = [];
      if (st && fi > 0 && ai > 0) for (let k = Math.max(fi, ai) + 1; k < L.length && /^[•\-–·]/.test(L[k]); k++) b.push(L[k].replace(/^[•\-–·]\s*/, ""));
      if (b.length) { const f = [], a = []; b.forEach((y, k) => (k % 2 ? a : f).push(y)); out.push({kind: "speaking", part: "3", topic: "", q: [st], for: f.slice(0, 3), against: a.slice(0, 3)}); i = j; } continue; }
    // Writing Task 1: "... sent you an email." + xat + Task 1.1 / 1.2
    if (/sent you an? (e-?mail|letter)\.?$/i.test(x)) { const em = []; let k = i + 1; for (; k < L.length && !/^task\s*1\.1/i.test(L[k]); k++) em.push(L[k]);
      const t11 = (L.find((y, q) => q > i && /^task\s*1\.1/i.test(y)) || "").replace(/^task\s*1\.1[:.\s]*/i, ""), t12 = (L.find((y, q) => q > i && /^task\s*1\.2/i.test(y)) || "").replace(/^task\s*1\.2[:.\s]*/i, "");
      if (em.length) out.push({kind: "writing", part: "T1", topic: "", sender: x, email: em.join("\n").slice(0, 3000), t11, t12}); continue; }
    if (/^task\s*2\b[:.\s]*/i.test(x) && x.length > 25) out.push({kind: "writing", part: "T2", topic: "", essay: x.replace(/^task\s*2\b[:.\s]*/i, "")});
  }
  return out;
}
async function impParse(env, d){
  const parts = [], imgs = []; let ph = 0, allText = "";
  const addImg = (mime, b64, label) => { imgs.push("data:" + mime + ";base64," + b64); parts.push({text: label + " " + imgs.length + ":"}); parts.push({inline_data: {mime_type: mime, data: b64}}); };
  for (const p of d.parts) {
    if (p.t === "text") { allText += "\n" + p.text; parts.push({text: "TEXT:\n" + p.text}); continue; }
    const f = await tgFileBytes(env, p.id); if (!f) continue;
    if (p.t === "photo") { ph++; addImg("image/jpeg", b64of(f.u8), "IMAGE"); continue; }
    const nm = (p.name || f.path).toLowerCase();
    if (/\.docx$/.test(nm) || /wordprocessingml/.test(p.mime)) { const z = await unzip(f.u8); const dec = k => z[k] ? new TextDecoder().decode(z[k]) : "";
      const xml = dec("word/document.xml"), rels = dec("word/_rels/document.xml.rels"), rmap = {};
      for (const m of rels.matchAll(/<Relationship\b[^>]*>/g)) { const id = (m[0].match(/\bId="([^"]+)"/) || [])[1], tg0 = (m[0].match(/\bTarget="([^"]+)"/) || [])[1]; if (id && tg0) rmap[id] = "word/" + tg0.replace(/^(\.\/|\/word\/)/, ""); }
      const want = /part\s*(1\.2|2)\b/i.test(xml.replace(/<[^>]+>/g, " ")); let budget = 7e6; const seen = {};
      // rasmlar hujjatdagi TARTIBda: [PICTURE n] = IMAGE n
      const dt = docxText(xml, dr => { const rid = (dr.match(/r:embed="([^"]+)"/) || [])[1], mf = rid && rmap[rid]; if (!want || !mf || !z[mf] || z[mf].length < 15000 || !/\.(png|jpe?g)$/i.test(mf)) return " [PICTURE] ";
        if (!seen[mf]) { if (imgs.length >= 8 || (budget -= z[mf].length) < 0) return " [PICTURE] "; imgs.push("data:" + (/png$/i.test(mf) ? "image/png" : "image/jpeg") + ";base64," + b64of(z[mf])); seen[mf] = imgs.length; } return ` [PICTURE ${seen[mf]}] `; });
      allText += "\n" + dt; parts.unshift({text: "WORD FILE TEXT (" + p.name + "):\n" + dt.slice(0, 30000)}); continue; }
    if (/\.pdf$/.test(nm) || p.mime === "application/pdf") { parts.push({text: "PDF FILE (" + p.name + "):"}); parts.push({inline_data: {mime_type: "application/pdf", data: b64of(f.u8)}}); continue; }
    if (/^image\//.test(p.mime)) { addImg(p.mime, b64of(f.u8), "IMAGE"); continue; }
    if (/\.txt$/.test(nm)) parts.push({text: new TextDecoder().decode(f.u8).slice(0, 20000)});
  }
  if (!parts.length) throw new Error("Fayl o'qilmadi (docx, pdf, rasm yoki matn yuboring).");
  const hz = impHeur(allText); let r;
  try { r = await gemini(env, IMP_SYS, parts, IMP_SCHEMA, 0.1); } catch (e) { if (!hz.length) { e.message += ` [matn ${allText.length} belgi, ${d.parts.length} qism]`; throw e; } r = {items: []}; } // AI ishlamasa ham lesson pack formatini o'qiymiz
  let raw = r.items || []; if (hz.length > raw.length) raw = hz; // AI bo'sh yoki kam topsa — matndan o'zimiz ajratamiz
  const items = [];
  for (const x of raw) { x.part = String(x.part || "").replace(/part|task|\s/ig, "").replace(/^1$/, "T1").replace(/^([12])\.?$/, (m, d) => x.kind === "writing" ? "T" + d : d);
    const k = x.kind === "writing" ? "writing" : "speaking"; const part = k === "writing" ? (x.part === "T2" || /2/.test(x.part) && !/1/.test(x.part) ? "T2" : "T1") : (SPARTS.includes(x.part) ? x.part : "1.1");
    const it = {id: uid(), kind: k, topic: clean(x.topic, 60) || clean(r.title, 60) || "Boshqa", created: Date.now()};
    if (k === "writing") { it.wtype = part; if (part === "T1") Object.assign(it, {sender: clean(x.sender, 150) || "The manager sent you an email.", email: clean(x.email, 3000), t11: clean(x.t11, 600), t12: clean(x.t12, 600)}); else it.essay = clean(x.essay, 1200); }
    else { it.part = part; it.q = (x.q || []).map(q => clean(q, 600)).filter(Boolean).slice(0, 3);
      if (part === "3") { it.for = (x.for || []).map(q => clean(q, 150)).filter(Boolean).slice(0, 3); it.against = (x.against || []).map(q => clean(q, 150)).filter(Boolean).slice(0, 3); }
      if (part === "1.2" || part === "2") it._img = (x.img || []).map(i => imgs[i - 1]).filter(Boolean).slice(0, part === "1.2" ? 2 : 1); }
    if (norm(keyText(it))) items.push(it);
  }
  const fn = ((d.parts.find(p => p.name) || {}).name || "").replace(/\.\w+$/, "").split(/[_\-]+/).filter(w => /^[A-Za-z]{3,}$/.test(w) && !/^(part|dars|lesson|pack|worksheet)$/i.test(w)).join(" ");
  const tt = (allText.match(/·\s*([A-Z][A-Za-z &'-]{3,40})\s*[:—]/) || [])[1] || fn;
  const title = clean(r.title, 100) || clean(tt, 60) || "Uyga vazifa"; items.forEach(it => { if (it.topic === "Boshqa") it.topic = title.slice(0, 60); });
  return {title, items};
}
// "#VAZIFA <guruh>" matni — AI'siz, aniq formatdan o'qiladi va darhol guruhga uyga vazifa qilib beriladi (muddat: keyingi dars boshlanishi)
async function vazifaText(env, r, text){
  const me = r.uid; const LN = text.split("\n").map(x => x.trim()); const head = LN[0].replace(/^#vazifa\s*/i, "").trim();
  const gs = await myGroups(env, r); const nm = x => String(x || "").toLowerCase().replace(/[^a-z0-9а-яё]/gi, "");
  const g = head ? gs.find(x => nm(x.title).includes(nm(head)) || nm(head).includes(nm(x.title))) : gs.length === 1 ? gs[0] : null;
  if (!g) return pm(env, me, `❓ Guruh topilmadi: «${H(head)}». Birinchi qatorda shunday yozing:\n${gs.map(x => "<code>#VAZIFA " + H(x.title) + "</code>").join("\n")}`);
  let title = "Uyga vazifa", due = null, sec = null; const items = []; const now = Date.now(); let buf = [];
  const mkS = (part, q, extra = {}) => ({id: uid(), kind: "speaking", topic: title, created: now, part, q: q.map(x => clean(x, 600)).filter(Boolean).slice(0, 3), ...extra});
  const pics = []; // [Part 1.2]/[Part 2] ichidagi "Rasm: https://…" qatorlari
  const flush = () => { let B = buf.filter(Boolean); buf = []; if (!sec || !B.length) return; const R0 = B.filter(x => /^(rasm|picture|image)\s*:\s*https?:\/\//i.test(x)).map(x => x.replace(/^[^:]+:\s*/, "")); B = B.filter(x => !/^(rasm|picture|image)\s*:/i.test(x)); if (R0.length && (sec === "1.2" || sec === "2")) pics.push({n: items.length, urls: R0}); if (!B.length) return; const strip = x => x.replace(/^\d+[.)]\s*/, "").replace(/^[-•]\s*/, "");
    if (sec === "1.1") B.forEach(q => items.push(mkS("1.1", [strip(q)])));
    else if (sec === "1.2" || sec === "2") items.push(mkS(sec, B.map(strip)));
    else if (sec === "3") { for (let i = 0; i < B.length; i++) { if (/^(for|against)\s*:/i.test(B[i])) continue; const sp = z => (z || "").replace(/^(for|against)\s*:\s*/i, "").split(/\s*[;·•]\s*/).filter(Boolean).slice(0, 3);
        const f = /^for\s*:/i.test(B[i + 1] || "") ? B[i + 1] : "", a = /^against\s*:/i.test(B[i + 2] || "") ? B[i + 2] : /^against\s*:/i.test(B[i + 1] || "") ? B[i + 1] : "";
        items.push(mkS("3", [strip(B[i])], {for: sp(f), against: sp(a)})); } }
    else if (sec === "T1") { const get = re => { const i = B.findIndex(x => re.test(x)); return i < 0 ? "" : B[i].replace(re, "").trim(); };
      const sender = get(/^sender\s*:/i) || B.find(x => /sent you an? (e-?mail|letter)/i.test(x)) || "The manager sent you an email.";
      const i0 = B.findIndex(x => /^email\s*:?/i.test(x)), i1 = B.findIndex(x => /^task\s*1\.1\s*:/i.test(x));
      const email = (i0 >= 0 ? B.slice(i0, i1 < 0 ? B.length : i1).map((x, k) => k ? x : x.replace(/^email\s*:?\s*/i, "")) : []).filter(Boolean).join("\n");
      items.push({id: uid(), kind: "writing", wtype: "T1", topic: title, created: now, sender: clean(sender, 150), email: clean(email, 3000), t11: clean(get(/^task\s*1\.1\s*:/i), 600), t12: clean(get(/^task\s*1\.2\s*:/i), 600)}); }
    else if (sec === "T2") items.push({id: uid(), kind: "writing", wtype: "T2", topic: title, created: now, essay: clean(B.join(" "), 1200)}); };
  for (const x of LN.slice(1)) { let m;
    if ((m = x.match(/^mavzu\s*:\s*(.+)$/i))) { title = clean(m[1], 80); continue; }
    if ((m = x.match(/^muddat\s*:\s*(\d{1,2})[./](\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?/i))) { const y = L(now).getUTCFullYear(); due = Date.UTC(y, +m[2] - 1, +m[1], (m[3] ? +m[3] : 23) - 5, m[4] ? +m[4] : 59); continue; }
    if ((m = x.match(/^\[(.+)\]$/))) { flush(); const t = m[1].toLowerCase().replace(/\s+/g, " ");
      sec = /1\.1/.test(t) ? "1.1" : /1\.2/.test(t) ? "1.2" : /part 2|^2$/.test(t) ? "2" : /part 3|^3$/.test(t) ? "3" : /task 2|essay/.test(t) ? "T2" : /writing|task 1|email/.test(t) ? "T1" : null; continue; }
    buf.push(x); }
  flush();
  for (const p of pics) { const it = items[p.n]; if (!it) continue; it._img = []; for (const u of p.urls.slice(0, it.part === "1.2" ? 2 : 1)) { try { const rs = await fetch(u); if (rs.ok) { const ct = rs.headers.get("content-type") || "image/jpeg"; it._img.push(`data:${ct.split(";")[0]};base64,` + b64of(new Uint8Array(await rs.arrayBuffer()))); } } catch (e) {} } }
  if (!items.length) return pm(env, me, "❓ Savol topilmadi. Bo'limlar [Part 1.1], [Part 1.2], [Part 2], [Part 3], [Writing], [Task 2] ko'rinishida bo'lsin.");
  const x = await impSave(env, r, {title, items, sel: [g.id]}, true);
  if (env.__kvfull) return pm(env, me, "⏳ Bugun botning kunlik xotira limiti tugadi — vazifa saqlanmadi. 05:00 dan keyin shu xabarni qayta yuboring.");
  const d0 = due || nextLesson(g, dayKey()); if (due) for (const k of ["writing", "speaking"]) { const hw = await J(env, `hw:${k}:${g.id}`, null); if (hw && hw.title === title) { hw.due = due; await PUT(env, `hw:${k}:${g.id}`, hw); } }
  const cnt = {}; items.forEach(it => { const k = PART_UZ[it.kind === "writing" ? it.wtype : it.part] + (it._img && it._img.length ? ` (🖼 ${it._img.length} rasm)` : ""); cnt[k] = (cnt[k] || 0) + 1; });
  return pm(env, me, `✅ <b>${H(title)}</b> — <b>${H(g.title)}</b> guruhiga uyga vazifa qilib berildi\n${Object.entries(cnt).map(([k, v]) => `• ${k}: ${v} ta`).join("\n")}\n📚 Bazaga yangi: ${x.added}${x.dup ? `, oldin bor: ${x.dup}` : ""}\n⏰ Muddat: ${DAY_UZ[wdOf(dayKey(d0))]} ${ddmm(d0)} ${hhmm(d0)}\n<i>O'quvchilar saytda «📌 Vazifa» bo'limida ko'radi.</i>`);
}
const PART_UZ = {"1.1": "🎤 Part 1.1", "1.2": "🎤 Part 1.2", "2": "🎤 Part 2", "3": "🎤 Part 3", T1: "✍️ Task 1", T2: "✍️ Task 2"};
async function impRun(env, r, d, mid){ // savollarni ajratish → ko'rib chiqish xabari
  const x = await impParse(env, d); d.title = x.title; d.items = x.items; delete d.q;
  if (!d.items.length) { await PUT(env, impD(d.id), d, {expirationTtl: 2 * 86400}); return tg(env, "editMessageText", {chat_id: r.uid, message_id: mid, text: "❓ Speaking/Writing savoli topilmadi. Savollar bor sahifani yuboring.", ...kb([[{text: "🗑 Bekor qilish", callback_data: "imp:del:" + d.id}]])}); }
  const gs0 = await myGroups(env, r); d.sel = gs0.length === 1 ? [gs0[0].id] : []; await PUT(env, impD(d.id), d, {expirationTtl: 2 * 86400}); return impPreview(env, r, d, mid);
}
async function impFail(env, r, d, mid, e){ // AI band — qayta urinish navbati (5 martagacha), boshqa xato — xabar
  d.q = d.q || {mid, n: 0}; d.q.n++; const er = String(e.message || e).slice(0, 200);
  if (!e.busy || d.q.n >= 5) { delete d.q; await PUT(env, impD(d.id), d, {expirationTtl: 2 * 86400});
    return tg(env, "editMessageText", {chat_id: r.uid, message_id: mid, parse_mode: "HTML", text: "❌ O'qib bo'lmadi: " + H(er), ...kb([[{text: "🔁 Qayta urinish", callback_data: "imp:go:" + d.id}], [{text: "🗑 Bekor qilish", callback_data: "imp:del:" + d.id}]])}); }
  d.q.next = Date.now() + [60e3, 120e3, 180e3, 300e3][d.q.n - 1]; await PUT(env, impD(d.id), d, {expirationTtl: 2 * 86400});
  return tg(env, "editMessageText", {chat_id: r.uid, message_id: mid, parse_mode: "HTML", text: `⏳ Google AI hozir band — ${d.q.n + 1}-urinish ${Math.round((d.q.next - Date.now()) / 60e3)} daqiqadan keyin. Hech narsa bosish shart emas, o'zim qayta urinaman.`});
}
// Bir martalik: o'qituvchi so'rovi bilan uyga vazifani (sayt repo'sidagi assets/hw/<nom>/) bazaga qo'shib guruhga berish
async function hwSeedOnce(env, name, grpRe, dueAt){ const mk = "mig:hw-" + name; const st = await env.KV.get(mk); if (st) return;
  await env.KV.put(mk, "run", {expirationTtl: 900}); if (env.__kvfull) return;
  const base = `https://aok-ai97.github.io/aok-english/assets/hw/${name}/`; const j = await (await fetch(base + "items.json?" + Date.now())).json(); const items = [];
  for (const it of j.items) { const x = {...it, id: uid(), created: Date.now()}; if (it.imgs) { x._img = []; for (const f of it.imgs) { const b = new Uint8Array(await (await fetch(base + f)).arrayBuffer()); x._img.push("data:image/jpeg;base64," + b64of(b)); } delete x.imgs; } items.push(x); }
  const g = (await getGroups(env)).find(g => grpRe.test(g.title || "")); if (!g) { await pm(env, env.OWNER_ID, "⚠️ Uyga vazifa: guruh topilmadi."); return; }
  const r = {admin: true, uid: String(env.OWNER_ID), name: "Bosh admin"};
  const x = await impSave(env, r, {title: j.title, items, sel: [g.id]}, true); await env.KV.put(mk, "1", {expirationTtl: 60 * 86400});
  const due = dueAt || nextLesson(g, dayKey()); if (dueAt) for (const k of ["writing", "speaking"]) { const hw = await J(env, `hw:${k}:${g.id}`, null); if (hw && hw.title === j.title) { hw.due = dueAt; await PUT(env, `hw:${k}:${g.id}`, hw); } }
  await pm(env, env.OWNER_ID, `✅ <b>${H(j.title)}</b> uyga vazifasi saytga joylashtirildi — <b>${H(g.title)}</b>\n📚 Bazaga qo'shildi: ${x.added} ta${x.dup ? ` (oldin bor edi: ${x.dup})` : ""}\n${x.done.map(t => "📌 " + H(t)).join("\n")}\n⏰ Muddat: ${DAY_UZ[wdOf(dayKey(due))]} ${ddmm(due)} ${hhmm(due)}`);
}
async function hwP3Once(env, title, keep, grpRe){ // uyga vazifada Part 3 dan faqat bittasi qolsin (o'qituvchi so'rovi)
  const mk = "mig:p3-" + title; if (await env.KV.get(mk) || (await env.KV.get("mig:hw-tourism")) !== "1") return;
  const g = (await getGroups(env)).find(g => grpRe.test(g.title || "")); if (!g) return; const k = `hw:speaking:${g.id}`; const hw = await J(env, k, null); if (!hw || hw.title !== title) return;
  const b3 = await getBank(env, "speaking", "3"); const p3 = new Set(b3.map(x => x.id)); const keepIt = b3.find(x => norm(keyText(x)) === norm(keep));
  hw.ids = hw.ids.filter(id => !p3.has(id) || (keepIt && id === keepIt.id)); await PUT(env, k, hw); await env.KV.put(mk, "1", {expirationTtl: 60 * 86400});
  await pm(env, env.OWNER_ID, `✅ <b>${H(title)}</b> uyga vazifasida Part 3 dan bittasi qoldirildi: «${H(keep)}». Speaking savollari: ${hw.ids.length} ta.`);
}
async function fixC1Once(env){ // bir martalik: guruh jadvali (kunlar) + C guruh "Grammar Mix" vazifasiga rasm va to'g'ri muddat
  const mk = "mig:fixC1"; if (await env.KV.get(mk)) return; await env.KV.put(mk, "run", {expirationTtl: 900}); if (env.__kvfull) return;
  const gs = await getGroups(env); let ch = false;
  for (const g of gs) { if (g.days && g.days.length) continue; if (/16\s*-\s*18/.test(g.title || "")) { g.days = [2, 4, 6]; ch = true; } else if (/15\s*-\s*17/.test(g.title || "")) { g.days = [1, 3, 5]; ch = true; } }
  if (ch) await PUT(env, "groups", gs);
  const g = gs.find(x => /15\s*-\s*17/.test(x.title || "")); const out = [];
  if (g) for (const k of ["writing", "speaking"]) { const key = `hw:${k}:${g.id}`; const hw = await J(env, key, null); if (!hw || !/grammar mix/i.test(hw.title || "")) continue;
    hw.due = nextLesson(g, dayKey(hw.at));
    if (k === "speaking") { const arr = await getBank(env, "speaking", "1.2"); const base = "https://aok-ai97.github.io/aok-english/assets/hw/c-celebrations/"; const images = [];
      for (const f of ["1.jpg", "2.jpg"]) { const rs = await fetch(base + f); if (rs.ok) { const ik = "img:" + uid(); await env.KV.put(ik, "data:image/jpeg;base64," + b64of(new Uint8Array(await rs.arrayBuffer()))); images.push({k: ik}); } }
      const it = {id: uid(), kind: "speaking", topic: hw.title, created: Date.now(), part: "1.2", q: ["Tell me what you can see in these pictures."], images};
      if (images.length) { arr.push(it); await putBank(env, "speaking", "1.2", arr); const ids12 = new Set(arr.filter(x => x.part === "1.2" || true).map(x => x.id)); hw.ids = hw.ids.filter(id => !ids12.has(id) || id === it.id); hw.ids.push(it.id); hw.ids = [...new Set(hw.ids)]; out.push(`🖼 Part 1.2 ga ${images.length} ta rasm`); } }
    await PUT(env, key, hw); out.push(`${k === "writing" ? "✍️" : "🎤"} muddat: ${DAY_UZ[wdOf(dayKey(hw.due))]} ${ddmm(hw.due)} ${hhmm(hw.due)}`); }
  await env.KV.put(mk, "1", {expirationTtl: 60 * 86400});
  if (out.length) await pm(env, env.OWNER_ID, `✅ <b>${H(g.title)}</b> — Grammar Mix vazifasi tuzatildi:\n${out.join("\n")}`);
}
async function picC2(env){ // C guruh Grammar Mix: Part 1.2 savolida rasm bo'lmasa — qo'shamiz (muvaffaqiyatli bo'lgunicha har daqiqa urinadi)
  if (await env.KV.get("mig:picC2")) return; const g = (await getGroups(env)).find(x => /15\s*-\s*17/.test(x.title || "")); if (!g) return;
  const hw = await J(env, `hw:speaking:${g.id}`, null); if (!hw || !/grammar mix/i.test(hw.title || "")) return;
  const arr = await getBank(env, "speaking", "1.2"); let it = arr.find(x => hw.ids.includes(x.id));
  if (it && it.images && it.images.length) { await env.KV.put("mig:picC2", "1", {expirationTtl: 60 * 86400}); return; }
  const base = "https://aok-ai97.github.io/aok-english/assets/hw/c-celebrations/"; const images = [];
  for (const f of ["1.jpg", "2.jpg"]) { const rs = await fetch(base + f + "?v=2"); if (!rs.ok) return; const ik = "img:" + uid(); await env.KV.put(ik, "data:image/jpeg;base64," + b64of(new Uint8Array(await rs.arrayBuffer()))); images.push({k: ik}); }
  if (env.__kvfull) return;
  if (!it) { it = {id: uid(), kind: "speaking", topic: hw.title, created: Date.now(), part: "1.2", q: ["Tell me what you can see in these pictures."]}; arr.push(it); hw.ids.push(it.id); await PUT(env, `hw:speaking:${g.id}`, hw); }
  else if (it.topic !== hw.title) { const oldId = it.id; it = {...it, id: uid(), topic: hw.title}; arr.push(it); hw.ids = hw.ids.map(id => id === oldId ? it.id : id); await PUT(env, `hw:speaking:${g.id}`, hw); } // boshqa mavzudagi umumiy savolga tegmaymiz — yangisini yaratamiz
  it.images = images; await putBank(env, "speaking", "1.2", arr); await env.KV.put("mig:picC2", "1", {expirationTtl: 60 * 86400});
  await pm(env, env.OWNER_ID, `🖼 <b>${H(g.title)}</b> — «${H(hw.title)}» Part 1.2 ga ${images.length} ta rasm qo'shildi. O'quvchilar saytdagi sahifani yangilasa, rasmlar chiqadi.`);
}
async function dialogFixOnce(env){ const mk = "mig:dlg1"; if (await env.KV.get(mk)) return; await env.KV.put(mk, "1", {expirationTtl: 60 * 86400});
  for (const g of await getGroups(env)) { const hp = await J(env, "hp:" + g.id, null); if (!hp || hp.st === "done") continue; let ch = false;
    for (const it of hp.items) if ((it.type === "voice" || it.type === "video") && /dialog|suhbat|yodla|retell/i.test(it.title || "") && !/yubor|tashla|ovozli|audio|yozib/i.test(it.title || "")) { it.type = "in_class"; ch = true; }
    if (ch) await PUT(env, "hp:" + g.id, hp, {expirationTtl: 30 * 86400}); } }
async function impSweep(env){ // har daqiqa: navbatdagi vazifa importlari
  const q = await J(env, "impq", []); if (!q.length) return; const drop = [];
  for (const j of q) { if (typeof j !== "object") { drop.push(j); continue; } const d = await J(env, impD(j.id), null);
    if (!d || !d.q || d._del) { if (Date.now() - j.t > 10 * 60e3 || (d && (d._del || d.items))) drop.push(j.id); continue; } // hali ko'rinmagan bo'lishi mumkin — kutamiz
    if ((d.q.next || 0) > Date.now()) continue;
    const r = await roleOf(env, j.uid); if (!r) { drop.push(j.id); continue; } const mid = d.q.mid;
    d.q.next = Date.now() + 120e3; await PUT(env, impD(d.id), d, {expirationTtl: 2 * 86400}); // ishlayapti — qayta olinmasin
    try { await impRun(env, r, d, mid); drop.push(j.id); } catch (e) { await impFail(env, r, d, mid, e); if (!d.q) drop.push(j.id); } }
  if (drop.length) await PUT(env, "impq", (await J(env, "impq", [])).filter(x => !drop.includes(typeof x === "object" ? x.id : x)));
}
async function impPreview(env, r, d, edit){
  const gs = await myGroups(env, r); const sel = d.sel || [];
  let t = `📝 <b>${H(d.title)}</b> — ${d.items.length} ta savol topildi:\n\n`;
  t += d.items.map((it, i) => `${i + 1}. ${PART_UZ[it.part || it.wtype]}${(it._img || []).length ? " 🖼" + it._img.length : (it.part === "1.2" || it.part === "2") ? " ⚠️ rasmsiz" : ""} — ${H(clean(it.kind === "writing" ? (it.wtype === "T1" ? it.sender + " " + (it.t11 ? "(1.1 + 1.2)" : "") : it.essay) : it.q.join(" / "), 110))}`).join("\n");
  t += `\n\n👥 Qaysi guruhga vazifa qilinsin? (belgilang)\n<i>Muddat: keyingi dars boshlanishigacha. Saytda o'quvchilarga darhol chiqadi.</i>`;
  const rows = gs.map(g => [{text: (sel.includes(g.id) ? "✅ " : "⬜️ ") + g.title, callback_data: "impg:" + g.id + ":" + d.id}]);
  rows.push([{text: "📌 Vazifa qilish", callback_data: "imp:ok:" + d.id}, {text: "📚 Faqat bazaga", callback_data: "imp:bank:" + d.id}], [{text: "🗑 Bekor qilish", callback_data: "imp:del:" + d.id}]);
  return edit ? tg(env, "editMessageText", {chat_id: r.uid, message_id: edit, text: t, parse_mode: "HTML", ...kb(rows)}) : pm(env, r.uid, t, kb(rows));
}
async function impSave(env, r, d, assign){
  const ids = {writing: [], speaking: []}; let added = 0, dup = 0;
  for (const it of d.items) {
    const part = it.kind === "writing" ? it.wtype : it.part; const arr = await getBank(env, it.kind, part); const key = norm(keyText(it));
    const pic = it.kind === "speaking" && (part === "1.2" || part === "2"); // rasmli savol matni bir xil bo'lishi mumkin — mavzu ham mos kelsin
    const ex = arr.find(x => norm(keyText(x)) === key && (!pic || norm(x.topic) === norm(it.topic))); if (ex) { ids[it.kind].push(ex.id); dup++; continue; }
    const clean_it = {...it}; delete clean_it._img;
    if (it._img && it._img.length) { clean_it.images = []; for (const im of it._img) { const ik = "img:" + uid(); await env.KV.put(ik, im); clean_it.images.push({k: ik}); } }
    arr.push(clean_it); await putBank(env, it.kind, part, arr); ids[it.kind].push(clean_it.id); added++;
  }
  const done = [];
  if (assign) for (const g of (await myGroups(env, r)).filter(g => (d.sel || []).includes(g.id))) for (const k of ["writing", "speaking"]) if (ids[k].length) {
    await PUT(env, `hw:${k}:${g.id}`, {title: d.title, ids: [...new Set(ids[k])].slice(0, 20), at: Date.now(), due: nextLesson(g, dayKey()), groups: [g.id]}); done.push(`${g.title} — ${k === "writing" ? "✍️ Writing" : "🎤 Speaking"} (${ids[k].length})`); }
  return {added, dup, done};
}

/* ================= SPEAKING KUNI: bot bilan ovozli suhbat (A0 → C1) ================= */
const LVL = ["A0", "A1", "A2", "B1", "B2", "C1"]; const SPK_TURNS = 10;
const SPK_SYS = `You are a friendly CEFR/IELTS speaking examiner chatting by voice messages with an Uzbek learner of English on Telegram.
You get: the student's current target level, the conversation so far (questions + what the student said), the LAST question, and the student's voice answer to it.
Return JSON:
"transcript": what the student said (English, as heard);
"answered": true if the student really tried to answer the last question in English;
"quality": 0–100 — how well this answer meets the TARGET level (relevance, length, grammar, vocabulary, fluency, pronunciation);
"level_shown": CEFR level this answer actually shows (A0, A1, A2, B1, B2 or C1);
"struggle": true if the student clearly struggled (very long pauses, Uzbek words, couldn't build sentences, "I don't know");
"mistakes": up to 3 {"wrong","correct"} from the answer;
"reaction": ONE short natural English reaction to what the student said (max 12 words, warm, no grading words);
"q_up": the NEXT question one CEFR level HIGHER than the target (follow naturally from what the student said, or switch to a new everyday topic);
"q_hold": the NEXT question at level HOLD_LEVEL (given in input), simpler, also natural.
Question style by level: A0 = yes/no, name, colours, numbers, very short; A1 = simple present about self/family/likes; A2 = daily routine, past weekend, simple plans; B1 = experiences, reasons, opinions with "why"; B2 = comparisons, advantages/disadvantages, hypothetical ("what would you do if…"); C1 = abstract, evaluate, speculate about society/future.
Questions max 25 words, one question at a time, never repeat a question already asked. Answer ONLY with JSON.`;
const SPK_SCHEMA = {type:"OBJECT",properties:{transcript:STR,answered:{type:"BOOLEAN"},quality:NUM,level_shown:STR,struggle:{type:"BOOLEAN"},mistakes:{type:"ARRAY",items:{type:"OBJECT",properties:{wrong:STR,correct:STR},required:["wrong","correct"]}},reaction:STR,q_up:STR,q_hold:STR},required:["transcript","answered","quality","level_shown","struggle","mistakes","reaction","q_up","q_hold"]};
const SPK_END_SYS = `You write the FINAL result of a speaking conversation between an AI examiner and an Uzbek learner of English. Input: every question with its level, the student's transcript, quality and the level each answer showed.
Return JSON: "level": the student's realistic CEFR speaking level (A0, A1, A2, B1, B2 or C1 — the highest level the student handled CONSISTENTLY, not a single lucky answer);
"strong_uz": ONE short UZBEK sentence — the main strength; "weak_uz": up to 3 very short UZBEK points — the main weaknesses (concrete: tense, word order, vocabulary range, pronunciation of …, answers too short …);
"tips_uz": up to 3 very short, concrete UZBEK tips for the next week. Be honest, clear and brief. Answer ONLY with JSON.`;
const SPK_END_SCHEMA = {type:"OBJECT",properties:{level:STR,strong_uz:STR,weak_uz:{type:"ARRAY",items:STR},tips_uz:{type:"ARRAY",items:STR}},required:["level","strong_uz","weak_uz","tips_uz"]};
const SPK_OPEN = ["Hello {n}! Nice to meet you. What do you like doing in your free time?", "Hi {n}! Let's talk a little. Can you tell me about your family?", "Hello {n}! Tell me, what is your favourite food?", "Hi {n}! Where do you live? Do you like it there?", "Hello {n}! What do you usually do after school?"];
const SPK_NUDGE = ["🎤 {n}, mikrofon sizni kutyapti… Javobingizni ovozli xabar qilib yuboring!", "📡 Radar jimlikni sezdi 🙂 {n}, qisqa bo'lsa ham javob bering — 2–3 gap kifoya!", "⏳ {n}, bemalol o'ylab oling, lekin javobsiz qoldirmang. Ovozli xabarni bosing 🎙", "🙂 {n}, qiyin bo'lsa ham urinib ko'ring — bitta gap ham hisobga olinadi!", "🎧 Savolni qayta tinglang va javob yozib yuboring, {n}. Siz uddalaysiz! 💪"];
const spsK = sid => "sps:" + sid;
async function ttsMp3(text){ // Google Translate TTS (en-GB) → MP3
  const chunks = []; let cur = "";
  for (const s of String(text).replace(/\s+/g, " ").match(/[^.!?]+[.!?]*\s*/g) || [text]) { if ((cur + s).length > 180) { if (cur) chunks.push(cur); cur = s.slice(0, 180); } else cur += s; }
  if (cur.trim()) chunks.push(cur);
  const bufs = [];
  for (const c of chunks.slice(0, 4)) { const r = await fetch("https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en-GB&q=" + encodeURIComponent(c.trim()), {headers: {"User-Agent": "Mozilla/5.0"}});
    if (!r.ok) return null; bufs.push(new Uint8Array(await r.arrayBuffer())); }
  const n = bufs.reduce((a, b) => a + b.length, 0); if (n < 500) return null; const out = new Uint8Array(n); let o = 0; for (const b of bufs) { out.set(b, o); o += b.length; } return out;
}
async function spkSay(env, gid, th, speak, caption){
  try { const mp3 = await ttsMp3(speak); if (mp3) { const fd = new FormData(); fd.append("chat_id", String(gid)); if (th > 1) fd.append("message_thread_id", String(th));
      fd.append("voice", new Blob([mp3], {type: "audio/mpeg"}), "question.mp3"); fd.append("caption", caption); fd.append("parse_mode", "HTML");
      const r = await tgForm(env, "sendVoice", fd); if (r && r.ok) return r; } } catch (e) {}
  return toTopic(env, gid, th, caption);
}
async function spkAsk(env, ses, s, pre){
  const cap = `🎙 <b>${ses.turn + 1}/${SPK_TURNS}</b> · ${LVL[ses.lvl]}\n${pre ? "<i>" + H(pre) + "</i>\n" : ""}<b>${H(ses.q)}</b>\n\n<i>Ovozli xabar bilan javob bering.</i>`;
  await spkSay(env, ses.gid, ses.th, (pre ? pre + " " : "") + ses.q, cap);
  ses.st = "wait"; ses.askedAt = Date.now(); ses.nudge = 0; await PUT(env, spsK(s.id), ses, {expirationTtl: 2 * 86400});
}
async function spkStart(env, g, s, th){
  const ses = {gid: g.id, sid: s.id, th: th || s.thread, lvl: 1, best: 0, fails: 0, turn: 0, hist: [], day: dayKey(), at: Date.now()};
  ses.q = SPK_OPEN[Math.floor(Math.random() * SPK_OPEN.length)].replace("{n}", first(s.name));
  const l = await J(env, "spl", []); if (!l.includes(s.id)) { l.push(s.id); await PUT(env, "spl", l.slice(-80)); }
  await spkAsk(env, ses, s);
}
async function spkTurn(env, g, s, ses, msg){
  if (ses.st === "busy" && Date.now() - (ses.bt || 0) < 90e3) return; // oldingi javob tekshirilmoqda
  const media = msg.voice || msg.audio || msg.document; ses.st = "busy"; ses.bt = Date.now(); ses.pend = {voice: msg.voice, audio: msg.audio, document: msg.document, message_id: msg.message_id};
  await PUT(env, spsK(s.id), ses, {expirationTtl: 2 * 86400});
  const a = await tgFileB64(env, media.file_id, 8e6); if (!a) { ses.st = "wait"; await PUT(env, spsK(s.id), ses, {expirationTtl: 2 * 86400}); return toTopic(env, g.id, ses.th, "⚠️ Audio juda uzun — 2 daqiqagacha javob yuboring."); }
  const hold = ses.lvl > ses.best ? ses.best : Math.max(0, ses.lvl - (ses.fails >= 1 ? 1 : 0));
  const hist = ses.hist.map((h, i) => `Q${i + 1} [${LVL[h.l]}]: ${h.q}\nStudent: ${h.tr}`).join("\n");
  let r; try { r = await gemini(env, SPK_SYS, [{text: `TARGET level: ${LVL[ses.lvl]}\nHOLD_LEVEL: ${LVL[hold]}\nConversation so far:\n${hist || "(none)"}\nLAST question [${LVL[ses.lvl]}]: ${ses.q}\nStudent's voice answer:`}, {inline_data: {mime_type: audioMime(media, a.path), data: a.data}}], SPK_SCHEMA, 0.7, true); }
  catch (e) { ses.st = "wait"; await PUT(env, spsK(s.id), ses, {expirationTtl: 2 * 86400}); return toTopic(env, g.id, ses.th, "⏳ AI hozir band — 1 daqiqadan keyin javobingizni qayta yuboring."); }
  const q = Math.round(+r.quality || 0), pass = r.answered && q >= 65 && !r.struggle;
  ses.hist.push({q: ses.q, l: ses.lvl, tr: clean(r.transcript, 600), qu: q, ls: r.level_shown, ok: pass, m: (r.mistakes || []).slice(0, 3)});
  if (pass) { ses.best = Math.max(ses.best, ses.lvl); ses.fails = 0; } else ses.fails++;
  const nextLvl = pass ? Math.min(5, ses.lvl + 1) : hold; const nq = pass ? (r.q_up || r.q_hold) : (r.q_hold || r.q_up);
  ses.turn++; delete ses.pend;
  if (ses.turn >= SPK_TURNS || !nq) return spkEnd(env, g, s, ses);
  ses.lvl = nextLvl; ses.q = clean(nq, 300); await spkAsk(env, ses, s, clean(r.reaction, 120));
}
async function spkEnd(env, g, s, ses, why){
  ses.st = "done"; await PUT(env, spsK(s.id), ses, {expirationTtl: 2 * 86400});
  await PUT(env, "spl", (await J(env, "spl", [])).filter(x => x !== s.id));
  if (ses.hist.length < 2) return toTopic(env, g.id, ses.th, `⏹ Suhbat to'xtatildi${why ? " (" + why + ")" : ""}. Qayta boshlash uchun o'qituvchingizdan so'rang 🙂`);
  let e; try { e = await gemini(env, SPK_END_SYS, [{text: ses.hist.map((h, i) => `Q${i + 1} [target ${LVL[h.l]}]: ${h.q}\nStudent: ${h.tr}\nquality ${h.qu}, showed ${h.ls}${h.m.length ? ", mistakes: " + h.m.map(m => m.wrong + " → " + m.correct).join("; ") : ""}`).join("\n\n")}], SPK_END_SCHEMA, 0.3, true); }
  catch (x) { e = {level: LVL[ses.best], strong_uz: "", weak_uz: [], tips_uz: []}; }
  const lv = LVL.includes(e.level) ? e.level : LVL[ses.best];
  const mis = ses.hist.flatMap(h => h.m).filter((m, i, a) => m.wrong && a.findIndex(y => nn(y.wrong) === nn(m.wrong)) === i).slice(0, 3);
  let t = `🏁 <b>Speaking suhbati yakunlandi</b> — ${H(first(s.name))}\n📶 Daraja: <b>${lv}</b> · ${ses.hist.length} ta savol\n`;
  if (e.strong_uz) t += `\n✅ ${H(e.strong_uz)}`;
  if ((e.weak_uz || []).length) t += `\n⚠️ ${e.weak_uz.slice(0, 3).map(H).join("\n⚠️ ")}`;
  if (mis.length) t += `\n\n✏️ ${mis.map(m => `<s>${H(m.wrong)}</s> → <b>${H(m.correct)}</b>`).join("\n✏️ ")}`;
  if ((e.tips_uz || []).length) t += `\n\n🎯 ${e.tips_uz.slice(0, 3).map(H).join("\n🎯 ")}`;
  await toTopic(env, g.id, ses.th, t);
  const rk = `spr:${g.id}:${ses.day}`; const res = await J(env, rk, {}); res[s.id] = {lv, n: ses.hist.length, at: Date.now()}; await PUT(env, rk, res, {expirationTtl: 60 * 86400});
  await spkTable(env, g, ses.day);
}
async function spkTable(env, g, day){
  if (!g.res) return; const res = await J(env, `spr:${g.id}:${day}`, {}); const studs = (await getStudents(env)).filter(x => x.gid === g.id);
  const started = await J(env, `spd:${g.id}:${day}`, {});
  const rows = studs.map(x => res[x.id] ? `✅ ${H(x.name)} — <b>${res[x.id].lv}</b>` : started[x.id] ? `⏳ ${H(x.name)} — suhbatda` : `▫️ ${H(x.name)} — boshlamagan`);
  const t = `🎙 <b>SPEAKING KUNI — ${H(g.title)}</b> · ${ddmm(Date.parse(day + "T12:00:00Z"))}\n\n${rows.join("\n")}\n\n📶 Tugatdi: <b>${Object.keys(res).length}/${studs.length}</b>`;
  const mk = `spt:${g.id}:${day}`; const m = await J(env, mk, null);
  if (m && m.mid) { const x = await tg(env, "editMessageText", {chat_id: g.id, message_id: m.mid, text: t, parse_mode: "HTML"}); if (x.ok || /not modified/.test(x.description || "")) return; }
  const x = await toTopic(env, g.id, g.res, t); if (x.ok) await PUT(env, mk, {mid: x.result.message_id}, {expirationTtl: 60 * 86400});
}
async function spkLaunch(env, g){
  const studs = (await getStudents(env)).filter(x => x.gid === g.id && x.thread); const day = dayKey(); let n = 0;
  for (const s of studs) { const x = await toTopic(env, g.id, s.thread, `🎙 <b>Bugun Speaking kuni!</b>\n${H(first(s.name))}, bot siz bilan <b>${SPK_TURNS} ta savollik</b> ovozli suhbat qiladi: oson savoldan boshlab, darajangizga qarab qiyinlashadi (A0 → C1). Savollarni tinglab, <b>ovozli xabar</b> bilan javob bering.\n\nTayyor bo'lsangiz bosing 👇`, kb([[{text: "▶️ Boshlaymiz", callback_data: `spk:${s.id}`}]])); if (x.ok) n++; }
  await PUT(env, `spd:${g.id}:${day}`, {}, {expirationTtl: 60 * 86400});
  return n;
}
async function spkSweep(env){ if (env.__kvfull) return; // har daqiqa: javob kutayotganlarga eslatma, osilib qolganlarni yakunlash
  const l = await J(env, "spl", []); if (!l.length) return; const gs = await getGroups(env); const studs = await getStudents(env);
  for (const sid of l) { const ses = await J(env, spsK(sid), null); const s = studs.find(x => x.id === sid); const g = ses && gs.find(x => x.id === ses.gid);
    if (!ses || ses.st === "done" || !s || !g) { await PUT(env, "spl", (await J(env, "spl", [])).filter(x => x !== sid)); continue; }
    const idle = Date.now() - (ses.askedAt || ses.at);
    if (ses.st === "busy" && Date.now() - (ses.bt || 0) > 120e3 && ses.pend) { ses.st = "wait"; await PUT(env, spsK(sid), ses, {expirationTtl: 2 * 86400}); await spkTurn(env, g, s, ses, ses.pend); continue; }
    if (ses.st !== "wait") continue;
    if (idle > 8 * 60e3) { await spkEnd(env, g, s, ses, "javob kelmadi"); continue; }
    if ((idle > 60e3 && ses.nudge < 1) || (idle > 3 * 60e3 && ses.nudge < 2)) { ses.nudge++; await PUT(env, spsK(sid), ses, {expirationTtl: 2 * 86400});
      await toTopic(env, g.id, ses.th, SPK_NUDGE[Math.floor(Math.random() * SPK_NUDGE.length)].replace("{n}", H(first(s.name)))); }
  }
}

/* ---------------- Dars oxirida bitta umumiy feedback (tugma) ---------------- */
async function fbText(env, type, name, facts){
  try { const r = await gemini(env, FB_SYS, [{text: `Type: ${type}\nStudent: ${first(name)}\nFacts: ${facts}`}], {type:"OBJECT",properties:{text:STR},required:["text"]}, 1.0, true);
    if (r.text && r.text.length > 20) return r.text.slice(0, 700); } catch (e) {}
  return radarText(env, type, name, facts, true);
}
async function dayFeedback(env, g, d, dl = Infinity){
  d = d || dayKey(); const day = await J(env, `gr:${g.id}:${d}`, {}); const studs = await getStudents(env);
  const now = Date.now(); const hpC = await J(env, "hp:" + g.id, null); const hwsC = await latestHw(env, g.id); // uyga vazifalar holati ham feedbackka
  const hwOf = s => hwStatus(env, g, s, hpC, hwsC, now);
  const sk = `gs:${g.id}:${d}`; const sent = await J(env, sk, {}); const done = [], skip = [], again = [], left = [];
  for (const [sid, rec] of Object.entries(day)) {
    const s = studs.find(x => x.id === sid); if (!s) continue;
    if (rec.st || (!Object.keys(rec.it || {}).length && !Object.keys(rec.res || {}).length)) continue;
    if (sent[sid] === rec.v) { again.push(s.name); continue; }
    if (!s.thread) { skip.push(s.name); continue; }
    if (Date.now() > dl) { left.push(s.name); continue; } // vaqt tugadi — qolganini cron davom ettiradi
    const items = Object.entries(rec.it); const ls = items.filter(([, v]) => v.l != null).map(([, v]) => Math.min(v.l, 5));
    const facts = items.map(([k, v]) => `${ITEM_UZ[k] || k}: ${v.l != null ? LV_NAME(v.l) : "topshirildi"}${v.n ? ` (izoh: ${v.n})` : ""}${rec.prev && rec.prev[k] != null ? ` (avval ${LV_NAME(rec.prev[k])} edi — qayta ishlab yaxshiladi)` : ""}`).join("; ");
    const R = Object.values(rec.res || {}); const facts2 = [facts, ...R.map(x => x.f)].filter(Boolean).join("; "); // Results topic'idagi testlar ham shu bitta xabarga
    const hw = await hwOf(s); const facts3 = [facts2, hw && hw.fact].filter(Boolean).join("; ");
    const rs = R.map(x => x.ty === "praise" ? 5 : x.ty === "scold" ? 1.5 : 3); const a = avg([...ls, ...rs, ...(hw ? hw.sc : [])]); const type = a === null ? "praise" : a >= 4 ? "praise" : a <= 2 ? "scold" : "encourage";
    const ft = await fbText(env, type, s.name, facts3); const rr = await toTopic(env, g.id, s.thread, H(ft).replace(/&lt;(\/?)b&gt;/g, "<$1b>") + (hw ? "\n\n" + hw.line : ""));
    if (!rr || !rr.ok) { left.push(s.name); continue; } // yuborilmadi — keyinroq qayta urinadi
    sent[sid] = rec.v; done.push(s.name);
    await PUT(env, sk, sent, {expirationTtl: 7 * 86400});
  }
  return {done, skip, again, left};
}
const fbKb = g => kb([[{text: "📝 Hammaga feedback yuborish", callback_data: "fb:" + g.id}]]);
/* ---------------- Results: darsdagi test natijalari ---------------- */
function parseResults(text){
  const lines = String(text || "").split(/\n/).map(x => x.trim()).filter(Boolean);
  const rowRe = /^\d+\s*[.)]\s*(.+?)\s+(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+(?:[.,]\d+)?)?)\s*$/;
  const rows = [], head = [];
  for (const l of lines) { const m = l.match(rowRe); if (m) rows.push({name: m[1].replace(/[–—-]\s*$/, "").trim(), v: m[2].split("/").map(x => +x.replace(",", "."))}); else if (!rows.length) head.push(l); }
  let title = head.join(" ").trim(), max = null;
  const mm = title.match(/\s\/\s*(\d+)(?:\s*\/\s*(\d+))?\s*$/) || title.match(/max(?:imal)?\s*:?\s*(\d+)(?:\s*\/\s*(\d+))?/i);
  if (mm) { max = [+mm[1]].concat(mm[2] ? [+mm[2]] : []); title = title.replace(mm[0], "").trim(); }
  const pm2 = title.match(/([A-Za-z']+)\s*\/\s*([A-Za-z']+)/);
  const parts = pm2 ? [pm2[1], pm2[2]] : [(title.match(/[A-Za-z']+/) || ["Test"])[0]];
  const n = Math.max(1, ...rows.map(r => r.v.length));
  if (max && max.length < n) max = Array(n).fill(max[0]);
  const kind = nn(title.replace(/\d+(\s*\/\s*\d+)?/g, " "));
  return {title, parts: parts.slice(0, n), max, rows, kind, n};
}
function matchStudent(studs, name){
  const t = nn(name).split(" ").filter(Boolean); if (!t.length) return null;
  const full = studs.filter(s => { const a = nn(s.name).split(" "); return t.every(x => a.includes(x)) && a.every(x => t.includes(x)); });
  if (full.length === 1) return full[0];
  const part = studs.filter(s => { const a = nn(s.name).split(" "); return t.every(x => a.includes(x)); });
  if (part.length === 1) return part[0];
  const f1 = studs.filter(s => nn(s.name).split(" ").includes(t[0])); return f1.length === 1 ? f1[0] : null;
}
const rpKey = (gid, mid) => `rp:${gid}:${mid}`;
async function onResultsPost(env, g, msg, pid, text){
  const r = parseResults(text); if (r.rows.length < 2) return trace(env, g.id, {th: g.res, why: "Results: ro'yxat topilmadi", txt: text.slice(0, 40)});
  const studs = (await getStudents(env)).filter(x => x.gid === g.id);
  const rows = [], un = [];
  for (const x of r.rows) { const s = matchStudent(studs, x.name); if (s) rows.push({sid: s.id, name: s.name, v: x.v}); else un.push(x.name); }
  const k = rpKey(g.id, msg.message_id); const old = await J(env, k, null);
  if (old && old.st === "sent") return pm(env, pid, `ℹ️ <b>${H(r.title)}</b> natijalari o'quvchilarga allaqachon yuborilgan — tahrir qayta yuborilmaydi.`);
  const rp = {gid: g.id, mid: msg.message_id, by: pid, title: r.title, parts: r.parts, max: r.max, kind: r.kind, rows, un, at: (old && old.at) || (msg.date ? msg.date * 1000 : Date.now()), day: dayKey(msg.date ? msg.date * 1000 : Date.now()), st: "pending", due: Date.now() + 15 * 60e3, v: ((old && old.v) || 0) + 1};
  await PUT(env, k, rp, {expirationTtl: 30 * 86400});
  const pend = await J(env, "rpl", []); if (!pend.includes(k)) { pend.push(k); await PUT(env, "rpl", pend.slice(-30)); }
  await react(env, g.id, msg.message_id, "👀");
  // Natijalar darhol yuborilmaydi — kunlik yozuvga qo'shiladi, «📝 Darsdan keyin feedback» bosilganda har o'quvchiga BITTA xabarda boradi
  const facts = await rpFacts(env, g, rp); const dk = `gr:${g.id}:${rp.day}`; const day = await J(env, dk, {});
  for (const x of facts) { if (!x.facts) continue; const rec = day[x.sid] || {it: {}}; rec.res = rec.res || {}; rec.res[String(rp.mid)] = {t: rp.title, f: x.facts, ty: x.type}; rec.v = (rec.v || 0) + 1; day[x.sid] = rec; }
  await PUT(env, dk, day, {expirationTtl: 120 * 86400});
  rp.st = "day"; await PUT(env, k, rp, {expirationTtl: 30 * 86400}); await PUT(env, "rpl", (await J(env, "rpl", [])).filter(x => x !== k));
  const hist = await J(env, "rh:" + g.id, []); const sc = {}; rp.rows.forEach(x => sc[x.sid] = x.v.reduce((a, b) => a + b, 0));
  const hi = hist.findIndex(h => h.mid === rp.mid); const he = {mid: rp.mid, at: rp.at, kind: rp.kind, title: rp.title, max: rp.max, parts: rp.parts, sc, v: Object.fromEntries(rp.rows.map(x => [x.sid, x.v]))}; if (hi >= 0) hist[hi] = he; else hist.push(he); await PUT(env, "rh:" + g.id, hist.slice(-80));
  const pk = `fbr:${g.id}:${rp.day}:${rp.mid}`; if (!(await env.KV.get(pk))) { await PUT(env, pk, "1", {expirationTtl: 2 * 86400});
    await pm(env, pid, `📊 <b>${H(g.title)} — ${H(rp.title)}</b>: ${facts.filter(x => x.facts).length} ta o'quvchi natijasi yig'ildi.${rp.un.length ? `\n❓ Topilmadi: ${rp.un.map(H).join(", ")}` : ""}${rp.max ? "" : "\n⚠️ Maks ball yozilmagan — sarlavha oxiriga masalan <code>/35</code> qo'shing."}\nDarsdagi boshqa baholar bilan birga «📝 Darsdan keyin feedback» tugmasi bosilganda har o'quvchiga <b>bitta xabarda</b> yuboriladi.`, fbKb(g)); }
}
async function rpFacts(env, g, rp){ // har o'quvchi uchun: tur + faktlar
  const day = await J(env, `gr:${g.id}:${rp.day}`, {}); const hist = await J(env, "rh:" + g.id, []);
  const prev = hist.filter(h => h.kind === rp.kind && h.mid !== rp.mid).sort((a, b) => b.at - a.at)[0];
  const tot = row => row.v.reduce((a, b) => a + b, 0); const mx = rp.max ? rp.max.reduce((a, b) => a + b, 0) : null;
  const ranked = rp.rows.filter(x => tot(x) > 0).sort((a, b) => tot(b) - tot(a));
  return rp.rows.map(x => {
    const st = day[x.sid] && day[x.sid].st; const sum = tot(x);
    const sc = x.v.map((v, i) => `${rp.parts[i] || rp.parts[0]} ${fmtN(v)}${rp.max ? "/" + rp.max[i] : ""}`).join(", ");
    if (sum === 0) {
      if (st === "sick" || st === "pause") return {...x, type: null, line: `${st === "sick" ? "🟣 betob" : "⚪️ pauza"} — xabar yuborilmaydi`};
      if (st === "absent") return {...x, type: "scold", line: "❌ darsda yo'q — tanbeh", facts: `${rp.title}: darsga kelmadi, shuning uchun testni ishlamadi. Testni uyda ishlab, natijasini o'qituvchiga yuborishi kerak.`};
      return {...x, type: "scold", line: "❌ 0 ball (darsda bor edi) — tanbeh", facts: `${rp.title}: darsda bo'la turib testni topshirmadi / 0 ball.`};
    }
    const pct = mx ? sum / mx * 100 : null; const rank = ranked.findIndex(y => y.sid === x.sid) + 1;
    const pv = prev && prev.sc[x.sid]; const diff = pv != null ? sum - pv : null;
    const type = pct == null ? (rank <= 2 ? "praise" : rank > ranked.length - 2 ? "encourage" : "encourage") : pct >= 80 ? "praise" : pct >= 55 ? "encourage" : "scold";
    const facts = `${rp.title}: ${sc}${pct != null ? ` (${Math.round(pct)}%)` : ""}; guruhda ${rank}-o'rin (${ranked.length} kishidan)${diff != null ? `; oldingi shu turdagi testda ${fmtN(pv)} edi → ${diff > 0 ? "+" + fmtN(diff) + " o'sdi" : diff < 0 ? fmtN(diff) + " tushdi" : "o'zgarmadi"}` : ""}.`;
    return {...x, type, line: `${type === "praise" ? "🔥 maqtov" : type === "scold" ? "⚠️ tanbeh" : "💪 rag'bat"} — ${sc}${pct != null ? ` (${Math.round(pct)}%)` : ""} · ${rank}-o'rin${diff != null ? ` · ${diff > 0 ? "+" : ""}${fmtN(diff)}` : ""}`, facts};
  });
}
async function rpPreview(env, g, rp){
  const fs = await rpFacts(env, g, rp);
  let t = `📊 <b>${H(g.title)} — ${H(rp.title)}</b>\n` + (rp.max ? `Maks: ${rp.max.map((m, i) => `${H(rp.parts[i] || rp.parts[0])} ${m}`).join(", ")}\n\n` : `⚠️ <b>Maks ball yozilmagan</b> — sarlavha oxiriga masalan <code>/35</code> (ikki qism bo'lsa <code>/30/35</code>) qo'shib postni tahrirlang. Hozircha faqat guruhdagi o'rin bo'yicha baholanadi.\n\n`);
  t += "Topic'larga yoziladi:\n" + fs.map((x, i) => `${i + 1}. ${H(x.name)} — ${x.line}`).join("\n");
  if (rp.un.length) t += `\n\n❓ Topilmadi (ismini tekshiring): ${rp.un.map(H).join(", ")}`;
  t += "\n\n<i>15 daqiqada bosmasangiz, o'zi yuboriladi. Postni tahrirlasangiz, ro'yxat yangilanadi.</i>";
  return pm(env, rp.by, t, kb([[{text: "✅ Yuborish", callback_data: `rpok:${g.id}:${rp.mid}`}, {text: "🗑 Yubormaslik", callback_data: `rpno:${g.id}:${rp.mid}`}]]));
}
async function rpSend(env, g, rp, dl = Infinity){ // qayta boshlansa — yuborilganlarga takror yozmaydi
  if (!["pending", "sending"].includes(rp.st)) return {n: 0, left: 0}; rp.st = "sending"; rp.sentTo = rp.sentTo || []; await PUT(env, rpKey(g.id, rp.mid), rp, {expirationTtl: 30 * 86400}); if (env.__kvfull) return {n: 0, left: 1};
  const studs = await getStudents(env); let left = 0;
  for (const x of await rpFacts(env, g, rp)) { if (!x.type) continue; const s = studs.find(y => y.id === x.sid); if (!s || !s.thread || rp.sentTo.includes(s.id)) continue;
    if (Date.now() > dl) { left++; continue; }
    await toTopic(env, g.id, s.thread, await radarText(env, x.type, s.name, x.facts, true)); rp.sentTo.push(s.id); await PUT(env, rpKey(g.id, rp.mid), rp, {expirationTtl: 30 * 86400}); }
  if (left) return {n: rp.sentTo.length, left};
  const n = rp.sentTo.length; rp.st = "sent"; await PUT(env, rpKey(g.id, rp.mid), rp, {expirationTtl: 30 * 86400});
  const hist = await J(env, "rh:" + g.id, []); const sc = {}; rp.rows.forEach(x => sc[x.sid] = x.v.reduce((a, b) => a + b, 0));
  hist.push({mid: rp.mid, at: rp.at, kind: rp.kind, title: rp.title, max: rp.max, parts: rp.parts, sc, v: Object.fromEntries(rp.rows.map(x => [x.sid, x.v]))});
  await PUT(env, "rh:" + g.id, hist.slice(-80));
  await PUT(env, "rpl", (await J(env, "rpl", [])).filter(k => k !== rpKey(g.id, rp.mid)));
  return {n, left: 0};
}
/* ---------------- Baholarni o'qish ---------------- */
const LEVELS = [["super",6],["sal a'lo",4],["sal alo",4],["sal yaxshi",2.5],["sal chala",2],["a'lo",5],["alo",5],["zo'r",5],["zor",5],["yaxshi",3],["chala",1],["yodlamagan",0],["yomon",0],["qilmagan",0],["bajarmagan",0],["yo'q",0],["yoq",0]];
const LV_COLOR = l => l >= 4.5 ? "🔵" : l >= 3.5 ? "🟢" : l >= 2.5 ? "🟡" : l >= 1.5 ? "🟠" : l >= 0.5 ? "🔴" : "⚫️";
const LV_NAME = l => l >= 6 ? "Super" : l >= 5 ? "A'lo" : l >= 4 ? "sal A'lo" : l >= 3 ? "yaxshi" : l >= 2.5 ? "sal yaxshi" : l >= 2 ? "sal chala" : l >= 1 ? "chala" : "yomon";
const ITEMS = [["lugat",/lug'?at|vocab|so'zlar|words?\b/],["structure",/struct|strukt/],["speaking",/speak|gapir/],["translate",/transl|tarjim/],["writing",/writ|yozuv|yozma|insho/],["dialog",/dialog|suhbat/],["reading",/read|o'qish/],["listening",/listen|tinglash/],["grammar",/gramm/],["vazifa",/homework|vazifa/]];
const ITEM_UZ = {lugat:"Lug'at",structure:"Structure",speaking:"Speaking",translate:"Translate",writing:"Writing",reading:"Reading",listening:"Listening",grammar:"Grammar",dialog:"Dialog",vazifa:"Vazifa",umumiy:"Umumiy"};
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
async function hwStatus(env, g, s, hpC, hwsC, now){ // shu darsgacha muddati tugagan uyga vazifalar holati
  let T = []; try { T = (await digestTasks(env, g, s, hpC, hwsC, now, [])).filter(x => x.due && x.due <= now + 30 * 60e3); } catch (_) {}
  if (!T.length) { const p = await getProfile(env, s.id); const h = (p.hwc || []).slice(-1)[0]; if (h && now - h.at < 5 * 864e5 && h.total) return {line: `📋 Uyga vazifa: ${h.done}/${h.total} bajarilgan`, fact: `Uyga vazifa: ${h.total} tadan ${h.done} tasi bajarilgan`, sc: [5 * h.done / h.total]}; return null; }
  const st = x => x.ok ? (x.late ? "kech topshirildi" : "o'z vaqtida bajarildi") : x.n ? `qisman (${x.n}/${x.need})` : "bajarilmagan";
  return {line: "📋 <b>Uyga vazifa:</b>\n" + T.map(x => `${x.ok ? (x.late ? "⏰" : "✅") : x.n ? "🟡" : "❌"} ${x.icon} ${H(x.title)}${x.need > 1 ? ` — ${x.n}/${x.need}` : ""}`).join("\n"),
    fact: "Uyga vazifa: " + T.map(x => `${x.title} — ${st(x)}`).join("; "), sc: T.map(x => x.ok ? (x.late ? 3 : 5) : x.n ? 2 : 0)}; } // 5 o'z vaqtida · 3 kech · 2 qisman · 0 qilinmagan
function dayMark(rec, hwSc){
  if (!rec) return "✅";
  if (rec.st === "absent") return "❌ 🟤"; if (rec.st === "pause") return "❌ ⚪️"; if (rec.st === "sick") return "❌ 🟣";
  const ls = [...Object.values(rec.it || {}).filter(x => x.l !== null && x.l !== undefined).map(x => x.l), ...Object.values(rec.res || {}).map(x => x.ty === "praise" ? 5 : x.ty === "scold" ? 1.5 : 3), ...(hwSc || [])]; // darsdagi baholar + test natijalari + uyga vazifa
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
const titleHrs = g => { const m = String(g.title || "").match(/\b(\d{1,2})\s*[-–—]\s*(\d{1,2})\b/); return m && +m[1] < +m[2] && +m[2] <= 23 ? [+m[1], +m[2]] : null; }; // "15-17 GRAMMAR" → 15:00–17:00
function lessonStart(g){ const m = String(g.time || "").match(/(\d{1,2})[:.](\d{2})\s*[-–—]/); const t = titleHrs(g); return m ? (+m[1]) * 60 + (+m[2]) : t ? t[0] * 60 : 16 * 60; }
function lessonEnd(g){ const m = String(g.time || "").match(/(\d{1,2})[:.](\d{2})\s*[-–—]\s*(\d{1,2})[:.](\d{2})/); const t = titleHrs(g); return m ? (+m[3]) * 60 + (+m[4]) : t ? t[1] * 60 : 18 * 60; }
const atLocal = (dk, mins) => Date.parse(dk + "T00:00:00Z") - TZ + mins * 60e3;      // dk = "YYYY-MM-DD" mahalliy
const addDays = (dk, n) => new Date(Date.parse(dk + "T00:00:00Z") + n * 864e5).toISOString().slice(0, 10);
const wdOf = dk => new Date(dk + "T00:00:00Z").getUTCDay();
function nextLesson(g, fromDk){ // keyingi dars kuni (bugundan keyin) — dars BOSHLANISHI vaqti
  const days = g.days && g.days.length ? g.days : null;
  for (let i = 1; i <= 8; i++) { const dk = addDays(fromDk, i); if (!days || days.includes(wdOf(dk))) return atLocal(dk, lessonStart(g)); if (!days && i >= 2) break; }
  return atLocal(addDays(fromDk, 2), lessonStart(g));
}

/* ---------------- Homework posti (#Homework) ---------------- */
const HP_TYPES = ["shadowing","site_writing","site_speaking","voice","photo","text","video","in_class","none"];
const HP_ICON = {shadowing:"🎧", site_writing:"✍️", site_speaking:"🎤", voice:"🎙", photo:"📷", text:"💬", video:"🎥", in_class:"🏫", none:"ℹ️"};
const HP_HOW = {shadowing:"ovozli xabar (shadowing)", site_writing:"AOK Checker · Writing", site_speaking:"AOK Checker · Speaking", voice:"ovozli xabar", photo:"rasm", text:"matn", video:"video", in_class:"darsda so'raladi", none:"—"};
const SUBMIT = t => !["in_class", "none"].includes(t);
const HP_SYS = `You read a homework post written by an English teacher in Uzbek (Telegram). Split it into separate tasks, in the same order.
For each line/task return:
"title": short Uzbek title exactly in the teacher's words (max 70 chars);
"type": one of shadowing (listen to the attached audio and repeat it, send a voice message), site_writing (Writing Task 1.1 / 1.2 / 2 checked on the AOK website — "AOK check"), site_speaking (Speaking Part 1.1/1.2/2/3 checked on the AOK website), voice (send a voice message/audio, not shadowing), photo (written work to send as a photo), text (send as a text message), video (send a video), in_class (memorise / learn / read / do exercises / dialogues, role-plays or retelling that will be ASKED in class — checked in the next lesson, nothing to send; use voice only if the teacher explicitly says to send/record it, e.g. "ovozli yuboring", "tashlang"), none (bring money/books/things, announcements, not a task);
"count": how many submissions (e.g. "2 ta audio shadowing" → 2; default 1);
"due_kind": today | tomorrow | next_lesson | weekday | date | none — from words like "bugun", "ertaga", "keyingi darsga qadar", "juma kuni", "15-noyabr";
"time": "HH:MM" if a time is written (e.g. "23:59", "21:00"), else "";
"weekday": 0–6 (0 = Sunday) if a weekday is named, else -1;
"date": "YYYY-MM-DD" if a calendar date is named, else "".
Answer ONLY with JSON.`;
const HP_SCHEMA = {type:"OBJECT",properties:{items:{type:"ARRAY",items:{type:"OBJECT",properties:{title:STR,type:STR,count:{type:"INTEGER"},due_kind:STR,time:STR,weekday:{type:"INTEGER"},date:STR},required:["title","type","count","due_kind","time","weekday","date"]}}},required:["items"]};
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
  const askIn = it => /dialog|suhbat|yodla|retell|role.?play|so'raladi/i.test(it.title || "") && !/yubor|tashla|ovozli|audio|record|yozib/i.test(it.title || ""); // darsda so'raladigan — yuboriladigan emas
  return (r.items || []).slice(0, 15).map((it, i) => ({id: "i" + (i + 1), title: clean(it.title, 90), type: askIn(it) && (it.type === "voice" || it.type === "video") ? "in_class" : HP_TYPES.includes(it.type) ? it.type : "in_class", count: Math.max(1, Math.min(10, +it.count || 1)),
    due: SUBMIT(it.type) ? hpDue(g, postAt, it) : null}));
}
function hpTable(hp){
  return hp.items.map((it, i) => `${i + 1}. ${HP_ICON[it.type]} <b>${H(it.title)}</b>\n     ${H(HP_HOW[it.type])}${it.count > 1 && SUBMIT(it.type) ? ` ×${it.count}` : ""}${it.due ? ` · ⏰ ${DAY_UZ[wdOf(dayKey(it.due))]} ${ddmm(it.due)} ${hhmm(it.due)}` : ""}`).join("\n") +
    (hp.refs && hp.refs.length ? `\n\n🎧 Shadowing audiolari: ${hp.refs.map(r => H(r.name)).join(", ")}` : "");
}
const hpLessonStart = (g, hp) => atLocal(dayKey(nextLesson(g, dayKey(hp.at))), lessonStart(g)); // keyingi dars boshlanishi
const hpEnd = (g, hp) => Math.max(...hp.items.filter(i => i.due).map(i => i.due), nextLesson(g, dayKey(hp.at)));
async function hpConfirm(env, g, hp){
  return pm(env, hp.by, `📋 <b>${H(g.title)} — Homework</b> (${ddmm(hp.at)})\n\n${hpTable(hp)}\n\n🗓 Topshirish ${DAY_UZ[wdOf(dayKey(hpEnd(g, hp)))]} ${ddmm(hpEnd(g, hp))} ${hhmm(hpEnd(g, hp))} gacha qabul qilinadi.\n<i>15 daqiqada tasdiqlamasangiz, o'zi ishga tushadi.</i>`,
    kb([[{text: "✅ To'g'ri", callback_data: "hpok:" + g.id}, {text: "✏️ Tuzatish", callback_data: "hped:" + g.id}], [{text: "🗑 Bekor qilish (nazorat qilinmasin)", callback_data: "hpdel:" + g.id}]]));
}
const hsubKey = (hp, sid) => `hs:${hp.id}:${sid}`;
async function hpProgress(env, g, hp, s, prof){
  const sub = await J(env, hsubKey(hp, s.id), {it: {}}); prof = prof || await getProfile(env, s.id);
  const res = {};
  for (const it of hp.items.filter(i => SUBMIT(i.type))) {
    let n = 0, info = "", doneAt = null;
    if (it.type === "site_writing" || it.type === "site_speaking") { const k = it.type === "site_writing" ? "writing" : "speaking";
      const e = (prof.h || []).filter(x => x.k === k && x.at >= hp.at).sort((a, b) => b.at - a.at); if (e[0]) info = e[0].q ? "⏳ kechasi tekshiriladi" : `${fmtN(e[0].tot)}/${e[0].max}`;
      // bitta topshiriqda bir nechta Task/Part bo'lishi mumkin — har xil Task/Part soni hisoblanadi
      const asc = e.slice().sort((a, b) => a.at - b.at); const seen = new Set(); doneAt = null;
      for (const x of asc) { const u = String((k === "writing" ? x.tasks : x.parts) || "").split(",").map(z => z.trim()).filter(Boolean);
        if (u.length) u.forEach(z => seen.add(z)); else seen.add("#" + x.at); if (!doneAt && seen.size >= it.count) doneAt = x.at; }
      n = Math.min(it.count, seen.size); }
    else { const x = sub.it[it.id]; n = x ? x.n : 0; if (x && x.best != null) info = x.best + "%"; doneAt = x && x.doneAt || (x && n >= it.count ? x.at : null); }
    const ok = n >= it.count; res[it.id] = {n, need: it.count, ok, info, doneAt, late: !!(ok && it.due && doneAt && doneAt > it.due)};
  }
  return res;
}
async function hpSummary(env, g, hp, final){
  const studs = (await getStudents(env)).filter(s => s.gid === g.id); const items = hp.items.filter(i => SUBMIT(i.type));
  let t = `📊 <b>${final ? "YAKUNIY NATIJA" : "HOLAT"} — ${H(g.title)}</b>\n📋 Homework ${ddmm(hp.at)}\n` + items.map((it, i) => `${i + 1}. ${HP_ICON[it.type]} ${H(it.title)}`).join("\n") + "\n\n";
  let full = 0;
  for (const [i, s] of studs.entries()) {
    const pr = await hpProgress(env, g, hp, s); const done = items.filter(it => pr[it.id].ok).length; if (done === items.length) full++;
    const cell = it => { const x = pr[it.id]; return `${HP_ICON[it.type]}${x.ok ? (x.late ? "⏰" : "✅") : x.n ? `🟡${x.n}/${x.need}` : "❌"}${x.ok && x.info ? ` ${x.info}` : ""}`; };
    t += `${i + 1}. ${H(s.name)} — ${items.map(cell).join(" · ")} · <b>${done}/${items.length}</b>\n`;
  }
  return t + `\n📌 To'liq bajardi: <b>${full}/${studs.length}</b>\n✅ vaqtida · ⏰ kech, ammo topshirdi · 🟡 chala · ❌ topshirmadi`;
}

/* ---------------- Shadowing tekshiruvi ---------------- */
const SH_SYS = `You check a SHADOWING homework of an English learner (Uzbekistan). The learner listened to an ORIGINAL recording and recorded himself repeating it.
You get the ORIGINAL recording(s) (numbered) and the STUDENT recording${"(s)"}. Optionally an EARLIER recording of the same student for voice comparison.
Return:
"ref": number of the original that the student shadowed (1-based; 0 if none matches);
"coverage": 0–100 — how much of that original's text the student really said;
"pron": 0–100 pronunciation accuracy (sounds, word stress) of the student;
"fluency": 0–100 (rhythm, speed, intonation compared with the original);
"wrong": up to 8 mispronounced words: {"word", "tip" (very short UZBEK tip on HOW TO PRONOUNCE it — sound/stress, e.g. "th — tilni tishlar orasiga qo'ying"; NEVER a translation of the word)};
"student_voice": true if a non-native learner's own voice (the student) is clearly heard repeating the text; false if the recording is only the original/native audio;
"voices": how many different human voices are clearly audible in the STUDENT recording;
"playback": true if the original audio is audible in the STUDENT recording (playing in the background, or the whole file is the original itself) (studio-quality native voice, the original playing from a speaker/phone, identical to the original) instead of the student's own voice;
"other_person": true if the student's voice clearly differs from the EARLIER recording (only when an earlier recording is given; else false);
"suspect_uz": one short UZBEK sentence explaining any suspicion (empty if none);
"note_uz": 1–2 short UZBEK sentences of feedback for the student (what was good, what to fix).
Be fair: background noise, accent and quiet voice are NOT cheating. Answer ONLY with JSON.`;
const SH_SCHEMA = {type:"OBJECT",properties:{student_voice:{type:"BOOLEAN"},ref:{type:"INTEGER"},coverage:NUM,pron:NUM,fluency:NUM,wrong:{type:"ARRAY",items:{type:"OBJECT",properties:{word:STR,tip:STR},required:["word","tip"]}},voices:{type:"INTEGER"},playback:{type:"BOOLEAN"},other_person:{type:"BOOLEAN"},suspect_uz:STR,note_uz:STR},required:["ref","coverage","pron","fluency","wrong","voices","playback","other_person","suspect_uz","note_uz"]};
async function tgFileB64(env, file_id, max = 15e6){
  const f = await tg(env, "getFile", {file_id}); if (!f.ok || !f.result.file_path || (f.result.file_size || 0) > max) return null;
  const r = await fetch(`https://api.telegram.org/file/bot${env.TG_TOKEN}/${f.result.file_path}`); if (!r.ok) return null;
  const u8 = new Uint8Array(await r.arrayBuffer()); let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return {data: btoa(s), path: f.result.file_path};
}
const audioMime = (m, path) => (m && m.mime_type) || (/\.mp3$/i.test(path) ? "audio/mpeg" : /\.m4a$/i.test(path) ? "audio/mp4" : /\.wav$/i.test(path) ? "audio/wav" : "audio/ogg");
async function checkShadowing(env, g, hp, s, msg, studs){
  const it = hp.items.find(i => i.type === "shadowing"); const media = msg.voice || msg.audio || msg.document;
  const reply = async (text) => { if (msg._am) { const e = await tg(env, "editMessageText", {chat_id: g.id, message_id: msg._am, text, parse_mode: "HTML", disable_web_page_preview: true}); if (e.ok) return e; } // kechasi: "Qabul qildim" xabarining o'rniga
    return toTopic(env, g.id, msg.message_thread_id || s.thread, text, {reply_to_message_id: msg.message_id, allow_sending_without_reply: true}); };
  const T0 = (msg._am || msg._rg) && msg.date ? msg.date * 1000 : Date.now(); // topshirilgan vaqt hisoblanadi
  // forward ruxsat: ikkinchi telefondan yozib yuborish mumkin. Kanal/guruhdan olingan tayyor audio — shubhali.
  const fo = msg.forward_origin; const fromChannel = !!(fo && (fo.type === "channel" || fo.type === "chat")) || !!msg.forward_from_chat;
  { const sub0 = await J(env, hsubKey(hp, s.id), null); const x0 = sub0 && sub0.it[it.id]; if (media.file_unique_id && x0 && (x0.list || []).some(e => e.fu === media.file_unique_id)) return; } // shu audio allaqachon tekshirilgan — qayta javob yo'q
  const mine = await tgFileB64(env, media.file_id); if (!mine) return reply("⚠️ Audio juda katta yoki yuklab bo'lmadi. Iltimos, qisqaroq ovozli xabar yuboring.");
  hp.refs = await hpRefs(env, g.id, hp); const parts = []; const refs = (hp.refs || []).slice(0, 4);
  for (const [i, r] of refs.entries()) { const a = await tgFileB64(env, r.file_id); if (a) { parts.push({text: `ORIGINAL ${i + 1} — "${r.name}":`}); parts.push({inline_data: {mime_type: r.mime || audioMime(null, a.path), data: a.data}}); } }
  if (parts.length && it && refs.length < (it.count || 1)) parts.push({text: `NOTE: the teacher assigned ${it.count} audios but only ${refs.length} original(s) are given above. If the STUDENT clearly repeats an English text that is NOT one of these originals, it is one of the MISSING assigned audios: set ref=0, rate pron and fluency honestly, and set coverage = how complete and natural the reading sounds (NOT 0 just because the original is missing). Say nothing about using the wrong audio.`});
  if (!parts.length) parts.push({text: "(No original audio is available — judge only pronunciation and fluency; ref=0, coverage = estimate of how complete and natural the passage sounds.)"});
  if (s.vf && s.vf !== media.file_id) { const old = await tgFileB64(env, s.vf, 4e6); if (old) { parts.push({text: "EARLIER recording of the same student (voice comparison only):"}); parts.push({inline_data: {mime_type: "audio/ogg", data: old.data}}); } }
  parts.push({text: `STUDENT recording${msg.caption ? ` (caption: "${clean(msg.caption, 80)}")` : ""}:`}); parts.push({inline_data: {mime_type: audioMime(media, mine.path), data: mine.data}});
  let r; try { r = await gemini(env, SH_SYS, parts, SH_SCHEMA, 0.1); } catch (e) { if (!msg._notified) await reply("⏳ AI hozir band — shadowing'ingiz navbatga qo'yildi. AI bo'shashi bilan o'zim tekshirib, javobini shu yerga yozaman 📡"); const x = new Error("busy"); x.busy = true; throw x; }
  const cov = Math.round(Math.max(0, Math.min(100, +r.coverage || 0))), pron = Math.round(Math.max(0, Math.min(100, +r.pron || 0))), flu = Math.round(Math.max(0, Math.min(100, +r.fluency || 0)));
  let refName = r.ref > 0 && refs[r.ref - 1] ? refs[r.ref - 1].name : (msg.caption || "");
  const sus = !!(r.other_person || fromChannel);
  const onlyOrig = r.student_voice === false || (r.playback && (r.voices || 1) <= 1 && r.student_voice !== true);
  if (onlyOrig) return reply("🎧 Bu asl audio ekan — o'quvchi ovozi eshitilmadi. Endi uni tinglab, <b>o'zingiz takrorlab</b> ovozli xabar yuboring 🎙");
  const counted = cov >= 40;
  const k = hsubKey(hp, s.id); const sub = await J(env, k, {it: {}}); const x = sub.it[it.id] = sub.it[it.id] || {n: 0, refs: [], best: null, list: []};
  if (media.file_unique_id && (x.list || []).some(e => e.fu === media.file_unique_id)) return; // parallel takror
  if (counted && refName && x.refs.includes(refName) && refs.length > 1) { // AI allaqachon hisoblangan mashqni tanladi — davomiyligi eng yaqin, hali hisoblanmagan mashqqa o'tkazamiz
    const d = +media.duration || 0; const free = refs.filter(z => !x.refs.includes(z.name));
    if (free.length) refName = free.sort((a, b) => Math.abs((+a.dur || 0) - d) - Math.abs((+b.dur || 0) - d))[0].name; }
  const key = refName || ("#" + (media.file_unique_id || (x.list.length + 1))); // har audio uchun o'z kaliti
  if (counted && !x.refs.includes(key)) { x.refs.push(key); x.n = x.refs.length; if (x.n >= it.count && !x.doneAt) x.doneAt = T0; }
  x.best = Math.max(x.best || 0, Math.round((cov + pron) / 2)); x.list.push({at: T0, ref: key, cov, pron, flu, sus, fu: media.file_unique_id || ""}); x.list = x.list.slice(-10);
  await PUT(env, k, sub, {expirationTtl: 30 * 86400});
  if (msg.voice) { const studsAll = studs || await getStudents(env); const ss = studsAll.find(y => y.id === s.id); if (ss && !ss.vf) { ss.vf = msg.voice.file_id; await PUT(env, "students", studsAll); } }
  const bar = v => v >= 85 ? "🟢" : v >= 65 ? "🟡" : v >= 40 ? "🟠" : "🔴";
  let t = `📡 <b>Shadowing${refName ? " — " + H(refName) : ""}</b> ${counted ? "✅" : "🔁"}\n${bar(cov)} To'liqlik: <b>${cov}%</b>\n${bar(pron)} Talaffuz: <b>${pron}%</b>\n${bar(flu)} Ravonlik: <b>${flu}%</b>`;
  if ((r.wrong || []).length) t += `\n\n❗ <b>Xato so'zlar:</b>\n` + r.wrong.slice(0, 8).map(w => `• <b>${H(w.word)}</b> — ${H(w.tip)}`).join("\n");
  if (r.note_uz) t += `\n\n💬 ${H(r.note_uz)}`;
  t += counted ? `\n\n📋 Shadowing: <b>${x.n}/${it.count}</b>${x.n >= it.count ? " — bajarildi! 🎉" : ""}` : `\n\n🔁 Hisobga olinmadi: matnning ko'p qismi aytilmagan. Qaytadan, to'liq yozib yuboring.`;
  await reply(t);
  if (sus) for (const id of await staffIds(env, g)) await pm(env, id, `⚠️ <b>Shubhali shadowing</b> — ${H(s.name)} (${H(g.title)})\n${r.playback ? "🔊 Asl audio o'ynatilgan bo'lishi mumkin\n" : ""}${(r.voices || 1) > 1 ? `👥 ${r.voices} xil ovoz eshitildi\n` : ""}${r.other_person ? "🧑‍🤝‍🧑 Ovoz oldingi yozuvlariga o'xshamaydi\n" : ""}${fromChannel ? "📢 Audio kanal yoki boshqa guruhdan forward qilingan\n" : ""}${msg.audio && !msg.voice ? "📁 Ovozli xabar emas, audio fayl yuklangan\n" : ""}${r.suspect_uz ? "💬 " + H(r.suspect_uz) : ""}\n<i>AI taxmini — tekshirib ko'ring.</i>`);
}

/* ---------------- Natijalar / davomat matnlari ---------------- */
async function hwOf(env, kind, gid){ const h = await J(env, `hw:${kind}:${gid}`, null); if (h && h.ids && h.ids.length) return h; const l = await J(env, "hw:" + kind, null); return hwFor(l, gid) ? l : null; }
async function latestHw(env, gid){ const o = {}; for (const k of KINDS) o[k] = gid ? await hwOf(env, k, gid) : await J(env, "hw:" + k, null); return o; }
const hwFor = (hw, gid) => hw && hw.ids && hw.ids.length && (!hw.groups || !hw.groups.length || hw.groups.includes(gid));
function hwFrom(g, hw){ if (hw.from) return hw.from; const days = (g && g.days) || []; let dk = dayKey(hw.at); for (let i = 0; i < 7 && days.length && !days.includes(wdOf(dk)); i++) dk = addDays(dk, -1); return Math.min(hw.at, g && days.length ? atLocal(dk, lessonStart(g)) : hw.at - 864e5); }
function subOf(prof, kind, hw, g){ const from = hwFrom(g, hw) - 5 * 60e3; // vazifa qayta saqlansa ham: shu vazifa davrida "Uyga vazifa" rejimida topshirilgan har qanday natija hisob
  const e = (prof.h || []).filter(e => e.k === kind && (e.hw === hw.at || (e.at >= from && (!e.hw || e.hw >= from)))).sort((a, b) => b.at - a.at)[0] || null;
  return e && hw.due ? {...e, late: e.at > hw.due} : e; }
const fmtLeft = ms => { ms = Math.max(0, ms); let h = Math.floor(ms / 3600e3), m = Math.round(ms % 3600e3 / 60e3); if (m === 60) { h++; m = 0; } return h ? `${h} soat${m ? " " + m + " daqiqa" : ""}` : `${Math.max(1, m)} daqiqa`; };
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
    const cells = act.map(k => { const e = subOf(p, k, hws[k], g); if (!e) { full = false; return `${k === "writing" ? "✍️" : "🎤"}❌`; }
      return `${k === "writing" ? "✍️" : "🎤"}${e.late ? "⏰" : "✅"} ${fmtN(e.tot)}/${e.max}`; });
    if (full) done++;
    t += `${i + 1}. ${H(s.name)} — ${cells.join(" · ")}\n`;
  }
  return t + `\n📌 To'liq topshirdi: <b>${done}/${studs.length}</b>\n✅ vaqtida · ⏰ kech, ammo topshirdi · ❌ topshirmadi`;
}
const fmtN = x => String(Math.round((+x || 0) * 2) / 2);
async function davomatText(env, g, why){
  const studs = (await getStudents(env)).filter(s => s.gid === g.id);
  const day = await J(env, `gr:${g.id}:${dayKey()}`, {});
  let present = 0;
  const now = Date.now(), hpC = await J(env, "hp:" + g.id, null), hwsC = await latestHw(env, g.id); const lines = [];
  for (const [i, s] of studs.entries()) { const rec = day[s.id]; const hw = rec && rec.st ? null : await hwStatus(env, g, s, hpC, hwsC, now);
    const m = dayMark(rec, hw ? hw.sc : null); if (m.startsWith("✅")) present++; lines.push(`${i + 1}. ${H(s.name)} ${m}`);
    if (why) { const parts = []; if (rec && !rec.st) { for (const [k, v] of Object.entries(rec.it || {})) if (v.l != null) parts.push(`${ITEM_UZ[k] || k}: ${LV_NAME(v.l)}`);
        for (const x of Object.values(rec.res || {})) parts.push(`${String(x.f || "test").split(":")[0].slice(0, 30)}: ${x.ty === "praise" ? "a'lo" : x.ty === "scold" ? "past" : "o'rtacha"}`); }
      if (hw) parts.push("vazifa: " + hw.line.replace(/<[^>]+>/g, "").replace(/^📋 Uyga vazifa:\s*/, "").split("\n").filter(Boolean).map(z => z.split(" ")[0]).join("")); 
      why.push(`${m.split(" ").pop()} <b>${H(first(s.name))}</b> — ${rec && rec.st ? "kelmagan" : parts.length ? H(parts.join(" · ")) : "baho yo'q"}`); } }
  const pct = studs.length ? Math.round(present / studs.length * 100) : 0;
  return `#attendance\n👨‍🏫 Teacher: ${H(g.teacher || "A. Ozodbek")}\n🕘 Time: ${H(g.time || "16:00-18:00")}\n📅 Date: ${ddmmyyyy(Date.now())}${g.days && g.days.length ? "\n" + g.days.map(d => DAY_EN[d]).join("-") : ""}\n\n${lines.join("\n")}\n\n${pct}%`;
}
async function holatText(env, g){
  const hp = await recentHp(env, g); if (hp) return hpSummary(env, g, hp, false);
  const studs = (await getStudents(env)).filter(s => s.gid === g.id); const hws = await latestHw(env, g.id);
  const act = KINDS.filter(k => hws[k]); if (!act.length) return "Hozir faol vazifa yo'q.";
  let t = `🔎 <b>${H(g.title)} — vazifa holati</b>\n`;
  for (const s of studs) { const p = await getProfile(env, s.id); t += `${H(s.name)} — ${act.map(k => { const e = subOf(p, k, hws[k], g); return `${k === "writing" ? "✍️" : "🎤"}${e ? (e.late ? "⏰" : "✅") : "❌"}`; }).join(" · ")}${s.thread ? "" : " ⚠️ topic ulanmagan"}\n`; }
  return t + `\n(${act.map(k => KIND_UZ[k]).join(" · ")})`;
}
async function pinText(env, g){
  const studs = (await getStudents(env)).filter(s => s.gid === g.id);
  return `🔑 <b>${H(g.title)} — PIN kodlar</b>\n\n` + studs.map((s, i) => `${i + 1}. ${H(s.name)} — <code>${s.pin}</code>${s.thread ? "" : " ⚠️"}`).join("\n") +
    `\n\nSayt: Checker → Writing/Speaking → PIN kodni kiritadi.\n⚠️ = topic hali ulanmagan`;
}

/* ---------------- Haftalik hisobot ---------------- */
const WEEK = 7 * 864e5;
const BAD_SP = e => e.k === "speaking" && e.at >= Date.UTC(2026, 10, 11, 19) && e.at < Date.UTC(2026, 10, 12, 7, 20); // 12.11.2026 12:20 gacha xato baholangan speakinglar — statistikaga kirmaydi
function weekStats(prof, grades, from, to){
  const h = (prof.h || []).filter(e => e.at >= from && e.at < to && !BAD_SP(e) && !e.q);
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
  const rows = [[{text:"📝 Darsdan keyin feedback", callback_data:"fb:" + g.id}], [{text:"🎙 Speaking kuni", callback_data:"spd:" + g.id}],
    [{text:"📊 Natijalar", callback_data:"res:" + g.id}, {text:"📋 Davomat", callback_data:"dav:" + g.id}],
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
  await wizDel(env, w.uid); const g = (await getGroups(env)).find(x => x.id === w.gid); if (!g) return;
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
  await wizDel(env, w.uid); const r = await roleOf(env, w.uid); return groupMenu(env, r, g);
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
  const w = await wizGet(env, me);
  if (/^#vazifa\b/i.test(text)) { if (w) await wizDel(env, me); return vazifaText(env, r, text); } // tayyor matn — darhol vazifa
  if (/^\/(start|guruhlar|menu)/.test(text)) { if (w) await wizDel(env, me); return mainMenu(env, r); }
  const one = await myGroups(env, r);
  const pickG = async (cmd) => one.length === 1 ? one[0] : (await pm(env, me, "Guruhni tanlang:", kb(one.map(g => [{text: g.title, callback_data: cmd + ":" + g.id}]))), null);
  if (/^\/limit/.test(text)) { const m = await pm(env, me, await limText(env)); if (m && m.ok) { try { await tg(env, "pinChatMessage", {chat_id: me, message_id: m.result.message_id, disable_notification: true}); } catch (e) {}
      const L0 = (await J(env, "limpin", [])).filter(x => x.chat !== me); L0.push({chat: me, mid: m.result.message_id}); await PUT(env, "limpin", L0.slice(-10)); } return; }
  if (/^\/natijalar/.test(text)) { const g = await pickG("res"); return g && cbAction(env, r, "res", g); }
  if (/^\/davomat/.test(text)) { const g = await pickG("dav"); return g && cbAction(env, r, "dav", g); }
  if (/^\/holat/.test(text)) { const g = await pickG("hol"); return g && cbAction(env, r, "hol", g); }
  if (/^\/pinlar/.test(text)) { for (const g of one) await pm(env, me, await pinText(env, g)); return; }
  if (/^\/hisobot/.test(text)) { const g = await pickG("wk"); return g && cbAction(env, r, "wk", g); }
  if (/^\/debug/.test(text) && r.admin) { // diagnostika: holat + cron'ni hozir ishga tushirish
    let t = "🛠 <b>Diagnostika</b>\n";
    for (const g of await getGroups(env)) { const hp = await J(env, "hp:" + g.id, null);
      t += `\n<b>${H(g.title)}</b> (${g.id}) hwt=${g.hwt || "-"} dav=${g.dav || "-"} days=${(g.days || []).join(",") || "-"}\n hp: ${hp ? `st=${hp.st} items=${hp.items.length} retry=${hp.retry || 0} refs=${(hp.refs || []).length} at=${ddmm(hp.at)} ${hhmm(hp.at)}${hp.err ? "\n err: " + H(hp.err) : ""}` : "yo'q"}\n`; }
    { const ae = await J(env, "aierr", null); t += `\n\n🤖 AI kalitlari: ${gKeys(env).length} ta${ae ? `\n ⚠️ oxirgi AI muammo (${hhmm(ae.t)}, bugun ${ae.n} marta): ${H(ae.m.slice(0, 200))}` : " · muammo yo'q"}`; }
    { const le = await J(env, "lasterr", null); t += le ? `\n\n🧯 Oxirgi ichki xato (${ddmm(le.t)} ${hhmm(le.t)}):\n<code>${H(le.m.slice(0, 300))}</code>` : "\n\n🧯 Ichki xato yo'q"; }
    { const wi = await tg(env, "getWebhookInfo", {}); if (wi.ok) { const w0 = wi.result; t += `\n\n📡 Webhook: navbatda ${w0.pending_update_count || 0} ta xabar${w0.last_error_message ? `\n ⚠️ oxirgi xato (${hhmm(w0.last_error_date * 1000)}): ${H(w0.last_error_message)}` : " · xato yo'q"}`; } }
    { const studs = await getStudents(env); const me2 = await tg(env, "getMe", {});
      for (const g of await getGroups(env)) { const ss = studs.filter(x => x.gid === g.id); const un = ss.filter(x => !x.thread);
        let adm = "?"; try { const cm = await tg(env, "getChatMember", {chat_id: g.id, user_id: me2.result.id}); adm = cm.ok ? cm.result.status : "❌ " + (cm.description || ""); } catch (e) {}
        const al = await allowedRx(env, g.id); t += `\n\n👥 <b>${H(g.title)}</b>: reaksiyalar=${al ? al.join("") : "hammasi"}, bot=${H(adm)}, o'quvchi ${ss.length}, topic ulangan ${ss.length - un.length}${un.length ? "\n ulanmagan: " + un.map(x => H(x.name)).join(", ") : ""}`;
        { const q = await J(env, "shq", []); if (q.length) t += `\n ⏳ Shadowing navbatida: ${q.filter(k => k.includes(g.id)).length} ta`; }
        { const hws = await latestHw(env, g.id); const hp0 = await J(env, "hp:" + g.id, null); const hpA = hp0 && hp0.st !== "done" ? hp0 : null;
          for (const k of KINDS) { const hw = hws[k]; if (!hw) continue; const due = siteDue(g, hws, k); const done = [];
            for (const s0 of ss) { const e = subOf(await getProfile(env, s0.id), k, hw, g); if (e) done.push(first(s0.name) + (e.at > due ? "⏰" : "")); }
            t += `\n ${k === "writing" ? "✍️" : "🎤"} ${H(hw.title || "")} · muddat ${ddmm(due)} ${hhmm(due)}${hw.due ? "" : " (taxminiy)"}${hpA && hpA.items.some(i => i.type === "site_" + k) ? " · Homework postida" : ""} · topshirdi ${done.length}/${ss.length}${done.length ? ": " + H(done.join(", ")) : ""}`; } }
        for (const e of (await J(env, "tr:" + g.id, [])).slice(0, 5)) t += `\n • ${hhmm(e.t)} th=${e.th}${e.tn ? " (" + H(e.tn) + ")" : ""}${e.s ? " " + H(e.s) : ""}: ${H(e.why)}${e.txt ? " — «" + H(e.txt) + "»" : ""}${e.from ? " — " + H(e.from) : ""}`; }
      const uk = await J(env, "tr:unknown", []); if (uk.length) t += "\n\n❓ Ro'yxatda yo'q chatlardan xabar:\n" + uk.slice(0, 4).map(e => ` • ${hhmm(e.t)} ${H(e.title)} (${e.chat})`).join("\n"); }
    { let i = 0; for (const key of gKeys(env)) { i++; const x = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=1", {headers: {"x-goog-api-key": key}}); t += `\n${x.ok ? "✅" : "❌"} AI kaliti ${i}${x.ok ? "" : " — " + x.status}`; } } // limit sarflamaydi
    await aiCount(env, null, null, true);
    { const v = aiUsageView(await J(env, "aiu:" + qDay(), {}));
      t += `\n\n📊 <b>Bugun AI: ${v.total} ta so'rov</b>\n` + (v.feat.map(([k, n]) => ` • ${H(k)}: ${n}`).join("\n") || " • hali yo'q");
      const ks = Object.entries(v.keys).sort(); if (ks.length) t += "\n🔑 Kalitlar bo'yicha:\n" + ks.map(([ki, o]) => ` • Kalit ${ki}: ✅ ${o.ok}${o.limit ? ` · ⛔ limit ${o.limit}` : ""}${o.err ? ` · ⚠️ ${o.err}` : ""}${Object.keys(o.m).length ? " (" + Object.entries(o.m).map(([m, n]) => m.replace("gemini-", "") + " " + n).join(", ") + ")" : ""}`).join("\n");
      t += "\n" + aiCapText(aiCapacity(env, v)) + "\n<i>Limit har kuni ~13:00 (Toshkent) da yangilanadi.</i>"; }
    try { await cron(env); t += "\n✅ cron xatosiz ishladi"; } catch (e) { t += "\n❌ cron xatosi: " + H(String(e.stack || e.message).slice(0, 600)); }
    return pm(env, me, t);
  }
  if (/^\/(jim|yoq)/.test(text)) { const q = /^\/jim/.test(text); const gs = await getGroups(env); for (const g of gs) if (canG(r, g)) g.quiet = q; await PUT(env, "groups", gs); return pm(env, me, q ? "🔕 Eslatmalar o'chirildi. Qayta yoqish: /yoq" : "🔔 Eslatmalar yoqildi."); }
  if (/^\/(ochir|yangipin)\s+/.test(text)) {
    const studs = await getStudents(env); const gids = one.map(g => g.id); const mineS = studs.filter(x => gids.includes(x.gid));
    const q = nn(text.replace(/^\/\S+\s+/, "")); const s = mineS.find(x => nn(x.name) === q) || mineS.find(x => nn(x.name).includes(q));
    if (!s) return pm(env, me, "❓ Bunday o'quvchi topilmadi.");
    if (/^\/ochir/.test(text)) { await PUT(env, "students", studs.filter(x => x.id !== s.id)); return pm(env, me, `🗑 ${H(s.name)} ro'yxatdan o'chirildi.`); }
    s.pin = newPin(studs); await PUT(env, "students", studs); return pm(env, me, `🔑 ${H(s.name)} — yangi PIN: <code>${s.pin}</code>`);
  }
  if (msg.document || msg.photo) { if (w) await wizDel(env, me); return impAdd(env, r, msg); } // fayl/rasm — har doim vazifa importi (ochiq qolgan matn so'rovi bo'lsa ham)
  if (!w && text.length >= 60 && !text.startsWith("/")) return impAdd(env, r, msg); // worksheet matni → vazifa
  if (!w) return pm(env, me, "📡 Menyu uchun /start bosing.");
  if (w.step === "tname" && r.admin) {
    const ts = await getTeachers(env); const t = {id: uid(), name: text.slice(0, 60), code: newCode(ts, env), tg: null, groups: [], at: Date.now()};
    ts.push(t); await PUT(env, "teachers", ts); await wizDel(env, me); return teacherCard(env, me, t);
  }
  const gs = await getGroups(env); const g = gs.find(x => x.id === w.gid); if (!g || !canG(r, g)) { await wizDel(env, me); return; }
  if (w.step === "hpfix") {
    const hp = await J(env, "hp:" + g.id, null); if (!hp) { await wizDel(env, me); return; }
    try { hp.items = await hpParse(env, g, hp.text, hp.at, [hp.fix, text].filter(Boolean).join("\n")); hp.fix = [hp.fix, text].filter(Boolean).join("\n"); }
    catch (e) { if (!text) return; hp.fixq = text; await PUT(env, "hp:" + g.id, hp); await wizDel(env, me); return pm(env, me, "⏳ AI hozir band — tuzatishingizni saqladim, 5 daqiqa ichida o'zim qayta o'qib, yangi ro'yxatni yuboraman."); }
    hp.st = "draft"; hp.at2 = Date.now(); await PUT(env, "hp:" + g.id, hp); await wizDel(env, me); return hpConfirm(env, g, hp);
  }
  if (["kun", "res", "dav", "hwt"].includes(w.step)) {
    const l = parseLink(text); if (!l) return pm(env, me, "❗ Link topilmadi. <code>https://t.me/c/…/…</code> ko'rinishidagi linkni yuboring.");
    if (l.chat !== g.id) return pm(env, me, "❗ Bu link boshqa guruhniki. Shu guruhdagi topic linkini yuboring.");
    g[w.step] = l.thread; await PUT(env, "groups", gs); await pm(env, me, "✅ Saqlandi.");
    if (w.flow !== "setup") { await wizDel(env, me); return groupMenu(env, r, g); }
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
  if (a === "dav") { const why = []; const t = await davomatText(env, g, why); if (g.dav) await toTopic(env, g.id, g.dav, t); await pm(env, uid, (g.dav ? "✅ Davomat topic'ga yuborildi:\n\n" : "⚠️ Davomat topic ulanmagan (⚙️ Sozlamalar).\n\n") + t);
    return pm(env, uid, `🔎 <b>Ranglar nimaga qarab qo'yildi</b> (faqat sizga):\n\n${why.join("\n")}\n\n<i>Rang = darsdagi baholar + test natijalari + uyga vazifa (✅ o'z vaqtida = A'lo · ⏰ kech = yaxshi · 🟡 qisman = sal chala · ❌ qilinmagan = yomon) o'rtachasi.</i>`); }
  if (a === "hol") return pm(env, uid, await holatText(env, g));
  if (a === "pin") return pm(env, uid, await pinText(env, g));
  if (a === "wk") { if (!g.res) return pm(env, uid, "⚠️ Results topic ulanmagan."); await weeklyReport(env, g); return pm(env, uid, "✅ Haftalik hisobot Results topic'ga yuborildi."); }
}
async function onCallback(env, cq){
  const r = await roleOf(env, cq.from.id);
  if ((cq.data || "").startsWith("spk:")) { // o'quvchi "Boshlaymiz" tugmasini bosdi
    const studs = await getStudents(env); const s = studs.find(x => x.id === cq.data.slice(4)); const fid = String(cq.from.id);
    if (!s) return tg(env, "answerCallbackQuery", {callback_query_id: cq.id, text: "O'quvchi topilmadi.", show_alert: true});
    const ids = s.tgs || (s.tg ? [s.tg] : []); if (ids.length && !ids.includes(fid) && !r) return tg(env, "answerCallbackQuery", {callback_query_id: cq.id, text: `Bu tugma ${first(s.name)} uchun 🙂`, show_alert: true});
    if (!ids.length && !r) { s.tgs = [fid]; s.tg = fid; await PUT(env, "students", studs); }
    const ses = await J(env, spsK(s.id), null); if (ses && ses.st !== "done" && ses.day === dayKey()) return tg(env, "answerCallbackQuery", {callback_query_id: cq.id, text: "Suhbat allaqachon boshlangan — savolga ovozli javob bering 🎙", show_alert: true});
    if (ses && ses.st === "done" && ses.day === dayKey() && !r) return tg(env, "answerCallbackQuery", {callback_query_id: cq.id, text: "Bugungi suhbatni tugatdingiz ✅", show_alert: true});
    await tg(env, "answerCallbackQuery", {callback_query_id: cq.id, text: "Boshladik! 🎙"});
    const g = (await getGroups(env)).find(x => x.id === s.gid); if (!g) return;
    await tg(env, "editMessageReplyMarkup", {chat_id: cq.message.chat.id, message_id: cq.message.message_id, reply_markup: {inline_keyboard: []}});
    const sk = `spd:${g.id}:${dayKey()}`; const st = await J(env, sk, {}); st[s.id] = 1; await PUT(env, sk, st, {expirationTtl: 60 * 86400});
    await spkStart(env, g, s, cq.message.message_thread_id || s.thread); await spkTable(env, g, dayKey()); return;
  }
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
  if (a === "fb") { const g = gs.find(x => x.id === b); if (!g || !canG(r, g)) return;
    await tg(env, "editMessageText", {chat_id: chat, message_id: mid, parse_mode: "HTML", text: `⏳ <b>${H(g.title)}</b> — feedbacklar yozilmoqda…`});
    const x = await dayFeedback(env, g, null, Date.now() + 18e3);
    if (x.left.length) { const q = await J(env, "fbq", []); q.push({gid: g.id, d: dayKey(), by: r.uid, t: Date.now()}); await PUT(env, "fbq", q.slice(-20)); }
    let t = x.done.length ? `✅ <b>${H(g.title)}</b> — ${x.done.length} ta o'quvchiga dars bo'yicha bitta umumiy feedback yuborildi:\n${x.done.map(n => "• " + H(n)).join("\n")}` : `ℹ️ <b>${H(g.title)}</b> — yangi feedback yo'q.`;
    if (x.again.length) t += `\n\n↩️ Avval yuborilgan, yangi baho yo'q: ${x.again.map(H).join(", ")}`;
    if (x.skip.length) t += `\n\n⚠️ Topic ulanmagan: ${x.skip.map(H).join(", ")}`;
    if (x.left.length) t += `\n\n⏳ Qolgan ${x.left.length} tasi (${x.left.map(H).join(", ")}) 5 daqiqa ichida yuboriladi — o'zim xabar beraman.`;
    t += "\n\n<i>Baho qo'shsangiz yoki o'zgartirsangiz, tugmani yana bosing — faqat o'zgarganlarga yuboriladi.</i>";
    return tg(env, "editMessageText", {chat_id: chat, message_id: mid, parse_mode: "HTML", text: t, ...fbKb(g)}); }
  if (a === "imp" || a === "impg") { const id = c || ((await J(env, impK(r.uid), null)) || {}).id; const d = id ? await J(env, impD(id), null) : null;
    if (!d) return tg(env, "answerCallbackQuery", {callback_query_id: cq.id, text: Date.now() < KVFULL_UNTIL || env.__kvfull ? "⏳ Bugun botning kunlik xotira limiti tugadi. Faylni ertalab 05:00 dan keyin qayta yuboring." : "⏳ Fayl hali saqlanmoqda — 10–20 soniyadan keyin qayta bosing.", show_alert: true}); // xabar o'chmaydi, tugmalar qoladi
    if (d._del) return tg(env, "editMessageText", {chat_id: chat, message_id: mid, text: "ℹ️ Bu qoralama yopilgan — faylni qayta yuboring."});
    if (a === "imp" && b === "del") { await PUT(env, impD(d.id), {_del: 1}, {expirationTtl: 2 * 86400}); return tg(env, "editMessageText", {chat_id: chat, message_id: mid, text: "🗑 Bekor qilindi."}); }
    if (a === "imp" && b === "go") { if (d.q && (d.q.next || 0) > Date.now()) return tg(env, "answerCallbackQuery", {callback_query_id: cq.id, text: "⏳ Ajratilmoqda — kuting, xabar o'zi yangilanadi.", show_alert: true});
      d.q = {mid, n: (d.q && d.q.n) || 0, next: Date.now() + 120e3}; delete d.items; await PUT(env, impD(d.id), d, {expirationTtl: 2 * 86400});
      const q = (await J(env, "impq", [])).filter(x => typeof x === "object" && x.id !== d.id); q.push({id: d.id, uid: r.uid, t: Date.now()}); await PUT(env, "impq", q.slice(-20));
      await tg(env, "editMessageText", {chat_id: chat, message_id: mid, parse_mode: "HTML", text: "⏳ Savollar ajratilmoqda — odatda 10–40 soniya. Tayyor bo'lganda shu xabar o'zi yangilanadi."});
      try { await impRun(env, r, d, mid); } catch (e) { d.q.next = 0; await impFail(env, r, d, mid, e); } // darhol urinib ko'ramiz; ulgurmasa — cron davom ettiradi
      return; }
    if (a === "impg") { d.sel = d.sel || []; d.sel = d.sel.includes(b) ? d.sel.filter(x => x !== b) : [...d.sel, b]; await PUT(env, impD(d.id), d, {expirationTtl: 2 * 86400}); return impPreview(env, r, d, mid); }
    if (a === "imp" && (b === "ok" || b === "bank")) { if (!d.items) return;
      if (b === "ok" && !(d.sel || []).length) return tg(env, "answerCallbackQuery", {callback_query_id: cq.id, text: "Avval guruhni belgilang ✅", show_alert: true});
      const x = await impSave(env, r, d, b === "ok"); await PUT(env, impD(d.id), {_del: 1}, {expirationTtl: 2 * 86400});
      return tg(env, "editMessageText", {chat_id: chat, message_id: mid, parse_mode: "HTML", text: `✅ <b>${H(d.title)}</b>
📚 Bazaga qo'shildi: ${x.added} ta${x.dup ? ` (${x.dup} tasi bazada bor edi)` : ""}${x.done.length ? `
📌 Vazifa qilindi:
${x.done.map(z => "• " + H(z)).join("\n")}

O'quvchilar saytda «📌 Vazifa» bo'limida ko'radi.` : ""}`}); }
    return; }
  if (a === "spd") { const g = gs.find(x => x.id === b); if (!g || !canG(r, g)) return;
    if (c !== "go") return tg(env, "editMessageText", {chat_id: chat, message_id: mid, parse_mode: "HTML", text: `🎙 <b>${H(g.title)}</b> — Speaking kunini boshlaymizmi?
Har o'quvchining topic'iga «▶️ Boshlaymiz» tugmasi boradi. O'quvchi bosgach, bot u bilan ${SPK_TURNS} ta savollik ovozli suhbat qiladi (A0 → C1), oxirida darajasi va tavsiyalarini yozadi. Results'da umumiy jadval yuritiladi.`, ...kb([[{text: "✅ Ha, boshlash", callback_data: `spd:${g.id}:go`}], [{text: "⬅️ Orqaga", callback_data: "g:" + g.id}]])});
    const n = await spkLaunch(env, g); await spkTable(env, g, dayKey());
    return tg(env, "editMessageText", {chat_id: chat, message_id: mid, parse_mode: "HTML", text: `✅ <b>${H(g.title)}</b> — ${n} ta o'quvchi topic'iga «▶️ Boshlaymiz» tugmasi yuborildi.
Natijalar Results topic'idagi jadvalda yangilanib boradi.`}); }
  if (a === "rpok" || a === "rpno") { const g = gs.find(x => x.id === b); if (!g || !canG(r, g)) return; const rp = await J(env, rpKey(g.id, c), null);
    if (!rp || rp.st !== "pending") return tg(env, "editMessageText", {chat_id: chat, message_id: mid, parse_mode: "HTML", text: "ℹ️ Bu natijalar allaqachon ko'rib chiqilgan."});
    if (a === "rpno") { rp.st = "cancel"; await PUT(env, rpKey(g.id, c), rp, {expirationTtl: 30 * 86400}); await PUT(env, "rpl", (await J(env, "rpl", [])).filter(k => k !== rpKey(g.id, c)));
      return tg(env, "editMessageText", {chat_id: chat, message_id: mid, parse_mode: "HTML", text: `🗑 <b>${H(rp.title)}</b> — o'quvchilarga yuborilmaydi.`}); }
    const x = await rpSend(env, g, rp, Date.now() + 18e3); return tg(env, "editMessageText", {chat_id: chat, message_id: mid, parse_mode: "HTML", text: x.left ? `⏳ <b>${H(rp.title)}</b> — ${x.n} tasi yuborildi, qolgan ${x.left} tasi 5 daqiqa ichida yuboriladi (o'zim xabar beraman).` : `✅ <b>${H(rp.title)}</b> — ${x.n} ta o'quvchi topic'iga maqtov/tanbeh yuborildi.`}); }
  if (a === "hpdel" && g) { await env.KV.delete("hp:" + g.id); return tg(env, "editMessageText", {chat_id: chat, message_id: mid, parse_mode: "HTML", text: `🗑 <b>${H(g.title)}</b> — bu Homework nazorat qilinmaydi. Keyingi #Homework postini bot yana o'qiydi.`}); }
  if (a === "hped" && g) { await PUT(env, wizK(r.uid), {uid: r.uid, gid: g.id, step: "hpfix"}); return pm(env, r.uid, ASK.hpfix); }
  if (a === "skip") { const w = await wizGet(env, r.uid); if (!w) return; const studs = await getStudents(env); const s = studs.find(x => x.id === w.sid); if (s) { s.thread = 0; await PUT(env, "students", studs); } return askNextLink(env, w); }
  if (a === "wdone") { const w = await wizGet(env, r.uid); if (!w) return; return finishWizard(env, w); }
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
// Reaksiya: guruhda ruxsat etilgan reaksiyalar cheklangan bo'lishi mumkin — ishlamasa zaxira emojilar
async function allowedRx(env, chat){ // guruhda ruxsat etilgan reaksiyalar (null = hammasi)
  const k = "rx:" + chat; const c = await J(env, k, null); if (c) return c.list;
  const r = await tg(env, "getChat", {chat_id: chat}); const ar = r.ok ? r.result.available_reactions : undefined;
  const list = Array.isArray(ar) ? ar.filter(x => x.type === "emoji").map(x => x.emoji) : null;
  await PUT(env, k, {list}, {expirationTtl: 6 * 3600}); return list;
}
async function react(env, chat, mid, emoji){ let last = null; const al = await allowedRx(env, chat);
  const strip = x => x.replace(/\uFE0F/g, "");
  for (const e of [emoji, "👌", "👍", "🔥", "❤"].filter((x, i, a) => a.indexOf(x) === i).filter(x => !al || al.some(y => strip(y) === strip(x)))) {
    const r = await tg(env, "setMessageReaction", {chat_id: chat, message_id: mid, reaction: [{type: "emoji", emoji: e}]});
    if (r && r.ok) return r;
    last = r; if (r && !/REACTION_INVALID|REACTION_EMPTY|reaction/i.test(r.description || "")) break;
  }
  return last;
}
const TRT = {};
async function trace(env, gid, o){ if (Date.now() - (TRT[gid] || 0) < 60e3) return; TRT[gid] = Date.now(); try { const k = "tr:" + gid; const a = await J(env, k, []); a.unshift({t: Date.now(), ...o}); await PUT(env, k, a.slice(0, 8), {expirationTtl: 7 * 86400}); } catch (e) {} }
async function onGroupMessage(env, msg){
  const gid = String(msg.chat.id); const gs = await getGroups(env); let g = gs.find(x => x.id === gid);
  if (msg.migrate_to_chat_id) { if (g) { g.id = String(msg.migrate_to_chat_id); await PUT(env, "groups", gs); } return; }
  if (!g && msg.chat.title) { // guruh ID o'zgargan bo'lsa (supergroup'ga aylangan) — nomi bo'yicha qayta ulash
    const same = gs.filter(x => x.title === msg.chat.title);
    if (same.length === 1) { const old = same[0].id; same[0].id = gid; g = same[0]; await PUT(env, "groups", gs);
      const studs = await getStudents(env); studs.forEach(x => { if (x.gid === old) x.gid = gid; }); await PUT(env, "students", studs);
      const ts = await getTeachers(env); ts.forEach(t => t.groups = (t.groups || []).map(x => x === old ? gid : x)); await PUT(env, "teachers", ts);
      await owner(env, `🔄 <b>${H(g.title)}</b> guruhining ID si o'zgargan ekan — avtomatik qayta ulandi.`); }
  }
  if (!g) { await trace(env, "unknown", {chat: gid, title: msg.chat.title || "", why: "guruh ro'yxatda yo'q"}); return; }
  if (g.title !== msg.chat.title && msg.chat.title) { g.title = msg.chat.title; await PUT(env, "groups", gs); }
  if (msg.message_thread_id > 1 && !(msg.from && msg.from.is_bot)) await rmMark(env, gid, msg.message_thread_id, msg.message_id);
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
  if (!staff && th && !(await getStudents(env)).some(x => x.gid === gid && (x.thread === th || x.tg === String(msg.from?.id) || (x.tgs || []).map(String).includes(String(msg.from?.id))))) await trace(env, gid, {th, why: "yozgan odam o'qituvchi deb tanilmadi", from: msg.from ? msg.from.id + " " + (msg.from.first_name || "") : "?"});
  if (staff) {
    const pid = r ? r.uid : String(env.OWNER_ID);
    // dars vaqti / kunlari va o'qituvchi (davomat topic'ida yoki #attendance postida)
    if (th === g.dav || /#attendance/i.test(text)) {
      const te = text.match(/teacher\s*:\s*(.+)/i), ti = text.match(/time\s*:\s*([0-9:.\s–—-]+)/i), dy = parseDays(text);
      if (te || ti || dy) { if (te) g.teacher = te[1].trim().slice(0, 60); if (ti) g.time = ti[1].trim().slice(0, 40); if (dy) g.days = dy; await PUT(env, "groups", gs);
        await react(env, gid, msg.message_id, "👌"); }
      if (th === g.dav) return;
    }
    // #Homework posti
    if (/#\s*home\s*work/i.test(text)) {
      if (th && !g.hwt) { g.hwt = th; await PUT(env, "groups", gs); }
      // Tartib muhim (vaqt chegarasi 30s): avval 👀 + postni saqlash, keyin AI; eski postni yakunlash — oxirida yoki cron'da
      await react(env, gid, msg.message_id, "👀");
      const old = await J(env, "hp:" + gid, null); if (old && old.st !== "done" && old.mid !== msg.message_id) await PUT(env, "hpf:" + gid, old, {expirationTtl: 7 * 86400});
      const hp = {id: old && old.mid === msg.message_id ? old.id : uid(), at: old && old.mid === msg.message_id ? old.at : Date.now(), by: pid, text: clean(text, 3000), items: [], refs: old && old.mid === msg.message_id ? old.refs || [] : [], st: "draft", mid: msg.message_id, retry: 1};
      await PUT(env, "hp:" + gid, hp, {expirationTtl: 30 * 86400}); // AI to'xtab qolsa ham cron 5 daqiqada o'qiydi
      try { hp.items = await hpParse(env, g, text, hp.at); hp.retry = 0; delete hp.err; } catch (e) { hp.items = []; hp.err = String(e.message || e).slice(0, 200);
        await pm(env, pid, `⏳ Homework hali o'qilmadi — 5 daqiqada qayta urinaman.\n<i>Sabab: ${H(hp.err)}</i>`); }
      await PUT(env, "hp:" + gid, hp, {expirationTtl: 30 * 86400}); if (hp.items.length) { await hpConfirm(env, g, hp); await react(env, gid, msg.message_id, "✍"); }
      return;
    }
    // Results topic: darsdagi test natijalari → har o'quvchiga maqtov / tanbeh
    if (th && th === g.res && text) { await onResultsPost(env, g, msg, pid, text); return; }
    // Homework ostidan tashlangan shadowing audiolari
    const au = msg.audio || msg.voice || (msg.document && /^audio\//.test(msg.document.mime_type || "") && msg.document);
    if (au && th && (th === g.hwt)) {
      const hp = await J(env, "hp:" + gid, null);
      if (hp && hp.st !== "done" && Date.now() - hp.at < 6 * 3600e3) { hp.refs = [...(hp.refs || []), {file_id: au.file_id, name: (msg.caption || au.title || au.file_name || `Audio ${hp.refs.length + 1}`).replace(/\.(mp3|m4a|ogg|wav)$/i, "").slice(0, 60), mime: au.mime_type || "", fu: au.file_unique_id || "", dur: au.duration || 0}].slice(0, 6);
        await PUT(env, "hp:" + gid, hp, {expirationTtl: 30 * 86400}); await PUT(env, `hpr:${gid}:${hp.id}:${String(msg.message_id).padStart(9, "0")}`, {file_id: au.file_id, name: (msg.caption || au.title || au.file_name || "").replace(/\.(mp3|m4a|ogg|wav)$/i, "").slice(0, 60), mime: au.mime_type || "", fu: au.file_unique_id || "", dur: au.duration || 0}, {expirationTtl: 30 * 86400}); await react(env, gid, msg.message_id, "👌"); } // bir vaqtda bir nechta audio tashlansa ham hech biri yo'qolmaydi
      return;
    }
    if (!th) { await trace(env, gid, {th: 0, why: "topic'siz xabar"}); return; }
    const s = (await getStudents(env)).find(x => x.gid === gid && x.thread === th);
    if (!s) { const tn = (await J(env, "topics:" + gid, {}))[th]; await trace(env, gid, {th, tn: tn || "", why: "bu topic hech bir o'quvchiga ulanmagan", txt: text.slice(0, 40)}); return; }
    if (!text) return;
    const pg = parseGrades(text); if (!pg.st && !Object.keys(pg.it).length) { await trace(env, gid, {th, why: "baho so'zi topilmadi", txt: text.slice(0, 40), s: s.name}); return; }
    const k = `gr:${gid}:${dayKey()}`; const day = await J(env, k, {});
    const rec = day[s.id] || {it: {}}; rec.prev = rec.prev || {};
    for (const [name, v] of Object.entries(pg.it)) { const old = rec.it[name]; if (old && old.l != null && v.l != null && v.l > old.l) rec.prev[name] = old.l; rec.it[name] = v; }
    if (pg.st) rec.st = pg.st; else if (Object.keys(pg.it).length) rec.st = null;
    rec.due = Date.now() + 10 * 60e3; rec.v = (rec.v || 0) + 1; day[s.id] = rec; await PUT(env, k, day, {expirationTtl: 120 * 86400});
    await react(env, gid, msg.message_id, "👀");
    if (!g.fbAuto) { const pk = `fbp:${gid}:${dayKey()}`; if (!(await env.KV.get(pk))) { await PUT(env, pk, "1", {expirationTtl: 2 * 86400});
      await pm(env, pid, `📝 <b>${H(g.title)}</b> — baholash boshlandi.\nHammani so'rab bo'lgach, shu tugmani bosing: har o'quvchiga barcha qismlar bo'yicha <b>bitta qisqa feedback</b> boradi.`, fbKb(g)); } }
    return;
  }
  // ---- o'quvchi xabari: uy vazifasini topshirish ----
  if (!msg.from || msg.from.is_bot) return;
  const studs = await getStudents(env); const fid = String(msg.from.id);
  let s = th ? studs.find(x => x.gid === gid && x.thread === th) : null;
  if (s) { s.tgs = s.tgs || (s.tg ? [s.tg] : []); if (!s.tgs.includes(fid)) { s.tgs = [...s.tgs, fid].slice(-3); s.tg = s.tg || fid; await PUT(env, "students", studs); } } // o'z topic'i: ikkinchi telefon ham shu o'quvchi
  else s = studs.find(x => x.gid === gid && (x.tg === fid || (x.tgs || []).includes(fid))); // Results yoki boshqa topic'da — Telegram ID orqali
  if (!s) return;
  { const ses = await J(env, spsK(s.id), null); // Speaking kuni suhbati davom etmoqda
    if (ses && ses.st !== "done" && ses.gid === gid && (!th || th === ses.th)) { const md = msg.voice || msg.audio || (msg.document && /^audio\//.test(msg.document.mime_type || "") && msg.document) || msg.video_note;
      if (md) { if (msg.video_note) msg = {...msg, document: {...msg.video_note, mime_type: "video/mp4"}}; return spkTurn(env, g, s, ses, msg); }
      if (msg.text) return toTopic(env, gid, ses.th, `🎤 ${H(first(s.name))}, suhbatda <b>ovozli xabar</b> bilan javob bering 🙂`); } }
  const hp = await J(env, "hp:" + gid, null); if (!hp || hp.st === "done" || !hp.items.length) return;
  const media = msg.voice || msg.audio || (msg.document && /^audio\//.test(msg.document.mime_type || "") && msg.document);
  if (media && hp.items.some(i => i.type === "shadowing")) {
    const fo = msg.forward_origin; const fwdUid = fo && fo.type === "user" && fo.sender_user ? fo.sender_user.id : msg.forward_from ? msg.forward_from.id : null;
    const staffSet = await staffIds(env, g); hp.refs = await hpRefs(env, gid, hp);
    const isRef = (hp.refs || []).some(r => (r.fu && r.fu === media.file_unique_id) || (msg.audio && !msg.voice && ((r.dur && media.duration && Math.abs(r.dur - media.duration) <= 1) || (r.name && nn(media.title || media.file_name || "").includes(nn(r.name)) && nn(r.name).length > 3))))
      || (fwdUid && staffSet.map(String).includes(String(fwdUid)));
    if (isRef) return trace(env, gid, {th, s: s.name, why: "o'quvchi asl audioni o'z topic'iga tashladi — tekshirilmadi"});
    return shadowJob(env, g, hp, s, msg);
  }
  const kindOf = msg.voice || msg.audio ? "voice" : (msg.photo || (msg.document && /^image\//.test(msg.document.mime_type || ""))) ? "photo" : msg.video || msg.video_note ? "video" : (msg.text && msg.text.length >= 40) ? "text" : null;
  if (!kindOf) return;
  const it = hp.items.find(i => i.type === kindOf) || (kindOf === "photo" ? hp.items.find(i => i.type === "text") : kindOf === "text" ? hp.items.find(i => i.type === "photo") : null);
  if (!it) return;
  const k = hsubKey(hp, s.id); const sub = await J(env, k, {it: {}}); const x = sub.it[it.id] = sub.it[it.id] || {n: 0};
  if (msg.media_group_id && x.mg === msg.media_group_id) return; // bitta albom — bitta topshirish
  x.mg = msg.media_group_id || null; x.n++; x.at = Date.now(); if (x.n >= it.count && !x.doneAt) x.doneAt = x.at; await PUT(env, k, sub, {expirationTtl: 30 * 86400});
  await react(env, gid, msg.message_id, "👍");
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
    const L0 = []; for (const s of studs) { const pr = await hpProgress(env, g, hp, s); L0.push({name: s.name, p: Math.round(items.reduce((a, it) => a + (pr[it.id].ok ? 1 : Math.min(1, pr[it.id].n / (pr[it.id].need || 1))), 0) / items.length * 100)}); }
    if (g.res) await toTopic(env, g.id, g.res, `📊 <b>UYGA VAZIFA — ${ddmmyyyy(hp.at)}</b>\n` + pctLines(L0)); // sodda: % va rangli kvadrat
    for (const s of studs) { const pr = await hpProgress(env, g, hp, s); const p = await getProfile(env, s.id);
      p.hwc = [...(p.hwc || []).filter(e => e.id !== hp.id), {id: hp.id, at: hp.at, done: items.filter(it => pr[it.id].ok).length, total: items.length}].slice(-60); await PUT(env, "p:" + s.id, p); }
  }
  hp.st = "done"; const cur = await J(env, "hp:" + g.id, null); if (!cur || cur.id === hp.id) await PUT(env, "hp:" + g.id, hp, {expirationTtl: 30 * 86400}); // yangi post ustiga yozilmaydi
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
      if (!g.fbAuto) continue; // feedback endi tugma orqali (📝 Darsdan keyin feedback)
      if (rec.st || !rec.due || rec.due > now || sent[sid] === rec.v) continue;
      const s = studs.find(x => x.id === sid); sent[sid] = rec.v; ch = true; if (!s || !s.thread || g.quiet) continue;
      const items = Object.entries(rec.it || {}); const ls = items.filter(([, v]) => v.l != null).map(([, v]) => Math.min(v.l, 5));
      const facts = items.map(([k, v]) => `${ITEM_UZ[k] || k}: ${v.l != null ? LV_NAME(v.l) : "topshirildi"}${rec.prev && rec.prev[k] != null ? ` (avval ${LV_NAME(rec.prev[k])} edi — qayta ishlab yaxshiladi)` : ""}${v.n ? ` [izoh: ${v.n}]` : ""}`).join("; ");
      const a = avg(ls); const type = a === null ? "praise" : a >= 4 ? "praise" : a <= 2 ? "scold" : "encourage";
      await toTopic(env, g.id, s.thread, await radarText(env, type, s.name, facts, true));
    }
    if (ch) await PUT(env, sk, sent, {expirationTtl: 7 * 86400});
  }
  // 1b) Results natijalari: 15 daqiqada tasdiqlanmasa — avtomatik yuborish
  if (!quiet) for (const k of await J(env, "rpl", [])) { const rp = await J(env, k, null); if (!rp || !["pending", "sending"].includes(rp.st)) { await PUT(env, "rpl", (await J(env, "rpl", [])).filter(x => x !== k)); continue; }
    if (rp.st === "pending" && rp.due > now) continue; const g = gs.find(x => x.id === rp.gid); if (!g) continue; const was = rp.st;
    const x = await rpSend(env, g, rp); await pm(env, rp.by, `✅ <b>${H(rp.title)}</b> — ${was === "sending" ? "qolganlari ham yuborildi" : "avtomatik yuborildi"} (${x.n} ta o'quvchi).`); }
  // 1c) "Hammaga feedback" — vaqt yetmay qolganlari
  if (!quiet) { const q = await J(env, "fbq", []); if (q.length) { await PUT(env, "fbq", []);
    for (const j of q) { const g = gs.find(x => x.id === j.gid); if (!g) continue; const x = await dayFeedback(env, g, j.d);
      if (x.done.length && j.by) await pm(env, j.by, `✅ <b>${H(g.title)}</b> — qolgan feedbacklar ham yuborildi:\n${x.done.map(n => "• " + H(n)).join("\n")}`); } } }
  // 2) #Homework posti: tasdiq, eslatma, maqtov, kechikish, yakun
  const hpAct = {};
  for (const g of gs) {
    if (!quiet) { const of = await J(env, "hpf:" + g.id, null); if (of) { await env.KV.delete("hpf:" + g.id); try { await hpFinalize(env, g, of); } catch (e) { console.log("hpf", e.message); } } } // oldingi Homework posti yakuni
    const hp = await J(env, "hp:" + g.id, null); if (!hp || hp.st === "done") continue;
    if (hp.fixq) { try { const fx = [hp.fix, hp.fixq].filter(Boolean).join("\n"); hp.items = await hpParse(env, g, hp.text, hp.at, fx); hp.fix = fx; delete hp.fixq; hp.st = "draft"; hp.at2 = now; await PUT(env, "hp:" + g.id, hp); await hpConfirm(env, g, hp); } catch (e) { console.log("hpfix", e.message); } continue; }
    if (hp.retry && !hp.items.length) {
      if (now - hp.at < 60e3) continue; // hozirgina tashlangan — webhook o'zi o'qiyapti
      if (hp.retry > 6) continue;
      try { hp.items = await hpParse(env, g, hp.text, hp.at); hp.retry = 0; await PUT(env, "hp:" + g.id, hp); if (hp.items.length) await hpConfirm(env, g, hp); }
      catch (e) { const er = String(e.message || e).slice(0, 300); const first = hp.err !== er; hp.retry++; hp.err = er; await PUT(env, "hp:" + g.id, hp);
        if (first || hp.retry > 6) await pm(env, hp.by, `❌ Homework postini o'qib bo'lmadi (urinish ${hp.retry - 1}).\n<i>Sabab: ${H(er)}</i>`, kb([[{text: "🗑 Bekor qilish", callback_data: "hpdel:" + g.id}]])); }
      continue; }
    if (!hp.items.length) continue;
    if (hp.st === "draft" && now - (hp.at2 || hp.at) > 15 * 60e3) { hp.st = "active"; await PUT(env, "hp:" + g.id, hp); await pm(env, hp.by, `✅ <b>${H(g.title)}</b> — Homework avtomatik nazoratga olindi.`); }
    if (now >= hpEnd(g, hp)) { if (!quiet) await hpFinalize(env, g, hp); continue; }
    hpAct[g.id] = hp;
  }
  // 3) eslatmalar va talaffuz: har o'quvchiga bitta xabar
  try { await digestAll(env, gs, studs, hpAct, now, quiet); } catch (e) { console.log("digest", e.message); }
  // 5) yakshanba 11:00 — haftalik hisobot
  const lt = L(now);
  if (lt.getUTCDay() === 0 && lt.getUTCHours() === 11) {
    const last = await env.KV.get("wk:last"); const today = dayKey(now);
    if (last !== today) { await env.KV.put("wk:last", today); for (const g of gs) if (g.res) await weeklyReport(env, g); }
  }
}


/* ---------------- Eslatmalar: har o'quvchiga BITTA xabar (Homework posti + saytdagi vazifa + talaffuz) ---------------- */
const pick = a => a[Math.floor(Math.random() * a.length)];
const DG = {
  r1: ["📡 {n}, vazifalar holati — muddatgacha {t} bor:", "📋 {n}, eslatib qo'yaman: muddatgacha {t} qoldi.", "🗓 {n}, bugungi vazifalaringiz — {t} vaqtingiz bor:", "☀️ {n}, vazifalarni rejalashtirib oling — {t} qoldi:"],
  r2: ["⏳ {n}, muddatga {t} qoldi!", "⚡️ {n}, {t} qoldi — ulgurib qoling!", "📡 {n}, radar kutyapti: {t} qoldi.", "💪 {n}, oz qoldi — {t} ichida tugatib qo'ying!"],
  r3: ["🚨 {n}, oxirgi {t}!", "⏰ {n}, muddat tugashiga {t} qoldi!", "🔔 {n}, so'nggi eslatma — {t} qoldi!", "🏁 {n}, marraga {t} qoldi!"],
  late: ["⌛ {n}, muddat o'tdi.", "📡 {n}, radar vazifani muddatida ko'rmadi.", "⚠️ {n}, muddat tugadi."],
  lrem: ["📡 {n}, darsgacha {t} qoldi — muddati o'tgan vazifani hali topshirsa bo'ladi.", "⏳ {n}, dars boshlanishiga {t} qoldi — kech bo'lsa ham topshiring."],
  pron: ["🗣 {n}, talaffuz mashqini qilmadingiz.", "🎯 {n}, talaffuz mashqi qolib ketdi."]
};
function lessonAfter(g, t){ const days = g.days || []; if (!days.length) return null; const d0 = dayKey(t);
  for (let i = 0; i <= 8; i++) { const dk = addDays(d0, i); if (days.includes(wdOf(dk))) { const x = atLocal(dk, lessonStart(g)); if (x > t) return x; } } return null; }
function siteDue(g, hws, k){ const hw = hws[k]; if (hw.due) return hw.due; const o = hws[k === "writing" ? "speaking" : "writing"];
  if (o && o.due && Math.abs(o.at - hw.at) < 864e5) return o.due; return nextLesson(g, dayKey(hw.at)); }
async function digestTasks(env, g, s, hp, hws, now, pend){
  const T = []; const prof = await getProfile(env, s.id);
  if (hp) { const pr = await hpProgress(env, g, hp, s, prof);
    for (const it of hp.items.filter(i => SUBMIT(i.type) && i.due)) { const x = pr[it.id];
      const P = it.type === "shadowing" ? (pend || []).filter(t => t >= hp.at).sort((a, b) => a - b) : []; // kunduzi qabul qilingan, kechasi tekshiriladigan audiolar
      if (P.length && !x.ok) { const need = it.count - x.n; x.n = Math.min(it.count, x.n + P.length); x.ok = x.n >= it.count; if (x.ok) { const dAt = P[Math.min(need, P.length) - 1]; x.late = !!(it.due && dAt > it.due); } x.info = "⏳ kechasi tekshiriladi"; }
      T.push({key: "h" + hp.id + ":" + it.id, icon: HP_ICON[it.type], title: it.title, due: it.due, ok: x.ok, late: x.late, n: x.n, need: x.need, info: x.info, created: hp.at, ls: hpLessonStart(g, hp)}); } }
  for (const k of KINDS) { const hw = hws[k]; if (!hw || now - hw.at > 8 * 864e5) continue;
    if (hp && hp.items.some(i => i.type === "site_" + k)) continue; // Homework postida bor — o'sha hisoblaydi
    const due = siteDue(g, hws, k); if (now - due > 864e5) continue;
    const e = subOf(prof, k, hw, g);
    T.push({key: "w" + k + ":" + hwFrom(g, hw), icon: k === "writing" ? "✍️" : "🎤", title: (k === "writing" ? "Writing" : "Speaking") + (hw.title ? " — " + hw.title : ""), due, ok: !!e, late: !!(e && e.at > due), n: e ? 1 : 0, need: 1, info: e ? (e.q ? "⏳ kechasi tekshiriladi" : `${fmtN(e.tot)}/${e.max}`) : "", created: hw.at, ls: lessonAfter(g, due), site: k}); }
  return T;
}
function digestLine(x, now){
  const cnt = x.need > 1 ? ` — ${x.n}/${x.need}` : "";
  if (x.ok) return `${x.late ? "⏰" : "✅"} ${x.icon} ${H(x.title)}${cnt}${x.info ? ` (${H(x.info)})` : ""}`;
  return `${x.n ? "🟡" : "❌"} ${x.icon} ${H(x.title)}${cnt} · ${x.due > now ? "⏳ <b>" + fmtLeft(Math.round((x.due - now) / 300e3) * 300e3 || 60e3) + "</b> (" + DAY_UZ[wdOf(dayKey(x.due))] + " " + hhmm(x.due) + ")" : "⌛ muddati o'tdi"}`;
}
// Eslatma xabari: o'zi yangilanadi (edit). Topic'da undan keyin yangi xabar bo'lsa — eskisi o'chiriladi va pastga qayta tashlanadi (≤ har 30 daqiqada)
const pctOf = T => Math.round(T.reduce((a, x) => a + (x.ok ? 1 : Math.min(1, (x.n || 0) / (x.need || 1))), 0) / (T.length || 1) * 100);
const sqOf = p => p >= 100 ? "🟩" : p >= 50 ? "🟨" : p > 0 ? "🟧" : "🟥";
const pctLines = L0 => L0.slice().sort((a, b) => b.p - a.p).map(x => `${sqOf(x.p)} ${H(x.name)} — <b>${x.p}%</b>${x.late ? " ⏰" : ""}`).join("\n");
const kunTxt = (D, L0) => `📌 <b>KUN E'TIROZI — ${ddmmyyyy(D)} ${hhmm(D)}</b>\n` + pctLines(L0) + (L0.some(x => x.late) ? `\n<i>⏰ — kech topshirgan</i>` : "");
const hsh = t => { let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return h; };
function remStart(g, created){ const dk = dayKey(created); const end = atLocal(dk, lessonEnd(g)) + 3600e3; return (g.days || []).includes(wdOf(dk)) && created < end ? end : created; } // dars tugaganidan 1 soat keyin
// Har o'quvchida BITTA eslatma: joyida yangilanadi; topic'da undan keyin xabar bo'lsa — o'chib pastga qayta tushadi; umuman boshlamaganlarga har soatda yangidan (o'qilmagan bo'lib turadi)
async function remindSend(env, g, s, text, opt, now, hour){
  if (env.__kvfull) return "kvfull"; const k = `rmr:${g.id}:${s.thread}`; const o = await J(env, k, null); const day = hour >= 7 && hour < 23;
  const del = async ids => { const left = []; for (const m of ids) { const d = await tg(env, "deleteMessage", {chat_id: g.id, message_id: m}); if (!d.ok && !/not found|can't be deleted|MESSAGE_ID_INVALID/i.test(d.description || "")) left.push(m); await sleep(250); } return left; };
  let pend = o && o.del || []; if (pend.length) { const left = await del(pend); if (left.length !== pend.length) { await PUT(env, k, {...o, del: left}, {expirationTtl: 3 * 86400}); o.del = left; } pend = left; }
  if (o && o.pend && !o.mid2 && now - o.pend < 4 * 60e3) return "busy"; // boshqa jarayon hozir shu eslatmani tashlayapti
  const hourly = opt.zero && o && o.mid && now - (o.at || 0) >= 60 * 60e3 && day;
  if (o && o.mid && !o.moved && !hourly) { const e = await tg(env, "editMessageText", {chat_id: g.id, message_id: o.mid, text, parse_mode: "HTML", disable_web_page_preview: true});
    if (e.ok || /not modified/i.test(e.description || "")) return "edit";
    if (!/not found|can't be edited|MESSAGE_ID_INVALID/i.test(e.description || "")) return "wait"; } // vaqtinchalik xato (limit) — yangi xabar tashlamaymiz, keyingi safar tahrirlaymiz
  if (!day) return "wait"; // tunda yangi xabar tashlanmaydi (faqat tahrir)
  const olds = [...pend, ...(o && o.mid ? [o.mid] : [])];
  await PUT(env, k, {...(o || {}), pend: now, mid2: 0}, {expirationTtl: 3 * 86400}); if (env.__kvfull) return "kvfull";
  const left = await del(olds);
  const r = await toTopic(env, g.id, s.thread, text, {_rm: 1});
  if (r && r.ok) await PUT(env, k, {mid: r.result.message_id, mid2: 1, at: now, live: true, moved: false, done: !!opt.done, del: left}, {expirationTtl: 3 * 86400});
  return "post";
}
async function rmMark(env, gid, th, mid){ try { const k = `rmr:${gid}:${th}`; const o = await J(env, k, null); if (o && o.mid && !o.moved && mid > o.mid) await PUT(env, k, {...o, moved: true}, {expirationTtl: 3 * 86400}); } catch (e) {} }
async function digestAll(env, gs, studs, hpAct, now, quiet){
  if (quiet || env.__kvfull) return;
  const hour = L(now).getUTCHours();
  // talaffuz mashqi qilinmaganlar (pq:<at>) — o'quvchi bo'yicha
  const pqL = await env.KV.list({prefix: "pq:"}); const pq = {};
  for (const k of pqL.keys) { const at = +k.name.slice(3); if (now - at < 30 * 60e3) continue; const q = await J(env, k.name, null); if (!q) { await env.KV.delete(k.name); continue; }
    (pq[q.sid] = pq[q.sid] || []).push({k: k.name, at, words: q.words || []}); }
  const usedPq = new Set();
  for (const g of gs) {
    const hp = hpAct[g.id] || null; const hws = await latestHw(env, g.id);
    const sk = "rst:" + g.id; const st0 = await J(env, sk, null); const fresh = !st0; const st = st0 || {s: {}, posted: {}}; let ch = false; // fresh: birinchi ishga tushish — eski tizim yuborganlarini jim belgilab qo'yamiz
    const kun = [], lateK = [];
    const ic = hp ? hp.items.filter(i => i.type === "in_class") : []; // darsda so'raladigan (yodlash) vazifalar
    const pendSh = {}; for (const jk of await J(env, "shq", [])) { if (!jk.startsWith("shj:" + g.id + ":")) continue; const j = await J(env, jk, null); if (j && j.st === "night") (pendSh[j.sid] = pendSh[j.sid] || []).push((j.msg && j.msg.date || 0) * 1000); }
    { const dk0 = dayKey(now); if ((g.days || []).includes(wdOf(dk0)) && now >= atLocal(dk0, lessonStart(g)) - 10 * 60e3 && now <= atLocal(dk0, lessonEnd(g))) continue; } // dars paytida eslatma yo'q
    st.kun = st.kun || {}; const rows = []; // KUN E'TIROZI uchun: har o'quvchining bajarilganlik %
    for (const s of studs.filter(x => x.gid === g.id)) {
      const T = await digestTasks(env, g, s, hp, hws, now, pendSh[s.id]);
      if (!T.length) continue;
      rows.push({s, T});
      const start = Math.min(...T.map(x => remStart(g, x.created))), endAt = Math.max(...T.map(x => x.ls || x.due + 6 * 3600e3));
      if (now < start || now > endAt) continue; // eslatma: dars tugaganidan 1 soat keyin → keyingi dars boshlanguncha
      const pend = T.filter(x => !x.ok), zero = T.every(x => !x.ok && !x.n), nm = "<b>" + H(first(s.name)) + "</b>";
      let t;
      if (!pend.length) t = (T.some(x => x.late) ? `🏁 ${nm}, kech bo'lsa ham uy vazifasini yakunladingiz! 👍` : `🏁 ${nm}, siz uy vazifasini yakunladingiz! 👏`) + "\n\n" + T.map(x => digestLine(x, now)).join("\n")
        + (ic.length ? `\n\n📚 Endi yodlaydigan vazifalaringizga e'tiborli bo'ling — darsda so'raladi:\n${ic.map(i => "• " + H(i.title)).join("\n")}` : `\n\n📚 Yodlaydigan vazifalaringizga ham e'tiborli bo'ling!`);
      else t = `📋 ${nm}, uyga vazifalaringiz — ${pctOf(T)}% bajarildi\n\n` + T.map(x => digestLine(x, now)).join("\n") + `\n\n<i>✅ o'z vaqtida · ⏰ kech · ⏳ qolgan vaqt — xabar o'zi yangilanadi (${hhmm(now)})</i>`;
      if (fresh) { ch = true; continue; }
      if (s.thread && !g.quiet) { await remindSend(env, g, s, t, {zero, done: !pend.length}, now, hour); await sleep(400); }
    }
    // KUN E'TIROZI: muddat o'tishi bilan (3 soat ichida) BITTA ro'yxat; keyin kech topshirganlar bo'lsa — o'sha xabar joyida yangilanadi (o'quvchi topic'i bilan parallel)
    st.lv = st.lv || {};
    const kunL = D => rows.filter(r => r.T.some(x => x.due <= D)).map(r => { const due = r.T.filter(x => x.due <= D); return {name: r.s.name, p: pctOf(due), late: due.some(x => x.ok && x.late)}; });
    const dues = [...new Set(rows.flatMap(r => r.T.map(x => x.due)))].filter(d => d <= now && now - d < 864e5 && !st.kun[d]);
    if (dues.length && rows.length) { const D = Math.max(...dues); dues.forEach(d => st.kun[d] = now); ch = true;
      if (g.kun && !fresh && !env.__kvfull && now - D < 3 * 3600e3) { const t = kunTxt(D, kunL(D)); const r = await toTopic(env, g.id, g.kun, t);
        if (r && r.ok) st.lv["k" + D] = {mid: r.result.message_id, h: hsh(t), d: D, th: g.kun}; } } // muddatidan 3 soat o'tib ketgan bo'lsa — kechikib tashlanmaydi
    for (const [lk, v] of Object.entries(st.lv)) { if (now - v.d > 2 * 864e5) { delete st.lv[lk]; ch = true; continue; }
      if (lk[0] !== "k" || now - v.d > 864e5) continue; const t = kunTxt(v.d, kunL(v.d)); if (hsh(t) === v.h) continue;
      const e = await tg(env, "editMessageText", {chat_id: g.id, message_id: v.mid, text: t, parse_mode: "HTML"}); if (e.ok || /not modified/i.test(e.description || "")) { v.h = hsh(t); ch = true; } }
    // natijalar jadvali (saytdagi vazifa muddati o'tganda, Homework posti yo'q guruhlarda)
    if (!hp) for (const k of KINDS) { const hw = hws[k]; if (!hw || now - hw.at > 8 * 864e5) continue; const due = siteDue(g, hws, k), pk = k + ":" + hwFrom(g, hw);
      if (now >= due && now - due < 864e5 && !st.posted[pk]) { ch = true;
        for (const k2 of KINDS) if (hws[k2] && now >= siteDue(g, hws, k2)) st.posted[k2 + ":" + hwFrom(g, hws[k2])] = now; // bitta jadval — ikkala tur uchun
        if (g.res && !fresh && rows.length) await toTopic(env, g.id, g.res, `📊 <b>UYGA VAZIFA — ${ddmmyyyy(due)}</b>\n` + pctLines(rows.map(r => ({name: r.s.name, p: pctOf(r.T)})))); break; } }
    for (const [k, v] of Object.entries(st.kun)) if (v < now - 14 * 864e5) delete st.kun[k];
    // eski yozuvlarni tozalash (14 kun)
    const old = now - 14 * 864e5;
    for (const S of Object.values(st.s)) for (const m of ["rs", "late", "lr", "ok", "all"]) for (const [k, v] of Object.entries(S[m] || {})) if ((m === "rs" ? +k : v) < old) { delete S[m][k]; ch = true; }
    for (const [k, v] of Object.entries(st.posted)) if (v < old) { delete st.posted[k]; ch = true; }
    if (ch) await PUT(env, sk, st, {expirationTtl: 30 * 864e2});
  }
  for (const k of usedPq) await env.KV.delete(k);
  // guruhida eslatma bo'lmagan talaffuz yozuvlari — 6 soatdan keyin alohida (bitta) xabar
  for (const [sid, P] of Object.entries(pq)) { const rest = P.filter(p => !usedPq.has(p.k)); if (!rest.length || !rest.some(p => now - p.at > 6 * 3600e3)) continue;
    const s = studs.find(x => x.id === sid); const g = s && gs.find(x => x.id === s.gid); rest.forEach(p => env.KV.delete(p.k));
    if (!s || !s.thread || !g || g.quiet) continue; const w = [...new Set(rest.flatMap(p => p.words))].slice(0, 10);
    await toTopic(env, g.id, s.thread, pick(DG.pron).replace("{n}", "<b>" + H(first(s.name)) + "</b>") + `\nFeedbackdagi so'zlar: ${w.map(x => "<b>" + H(x) + "</b>").join(", ")}\n<i>🔊 To'g'ri → 🎤 Ayting tugmalari bilan mashq qilib, «📤 Talaffuz natijasini yuborish» ni bosing.</i>`);
    await addLog(env, sid, [{t: "pron_missed", n: w.length}]); }
}


/* ---------------- Takroriy topshirishdan himoya (bir xil ish ikki marta tekshirilmaydi) ---------------- */
async function idemStart(env, kind, stu, chunks){
  if (!stu) return {};
  let src = kind + "|" + stu.id; for (const c of chunks) { const x = String(c || ""); src += "|" + x.length + ":" + x.slice(0, 4000) + x.slice(-4000); }
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(src)); const k = "idm:" + [...new Uint8Array(d)].slice(0, 12).map(b => b.toString(16).padStart(2, "0")).join("");
  const v = await J(env, k, null);
  if (v && v.key) { const raw = await env.KV.get(v.key); if (raw) { const r = JSON.parse(raw); r.saved = true; r.can_send = !!stu.thread; r.dup = true; return {k, hit: r}; } }
  return {k}; // (yozuvlarni tejash: "ishlayapti" belgisi yozilmaydi — faqat tayyor natija)
}
const idemDone = (env, idem, key) => idem.k ? PUT(env, idem.k, {key, t: Date.now()}, {expirationTtl: 6 * 3600}) : null;


async function nightFailNote(env, job){ // o'qituvchiga tushunarli xabar + (writing bo'lsa) o'quvchi yuborgan rasm
  const s = (await getStudents(env)).find(x => x.id === job.sid); const g = s && (await getGroups(env)).find(x => x.id === s.gid);
  await pm(env, env.OWNER_ID, `⚠️ <b>Kechki tekshiruv o'tmadi</b>\n👤 ${H(s ? s.name : job.sid)}${g ? ` (${H(g.title)})` : ""}\n${job.kind === "writing" ? "✍️ Writing" : "🎤 Speaking"} · topshirgan vaqti: ${ddmm(job.at)} ${hhmm(job.at)}\n❗ ${H(job.err || "")}\n\n<i>O'quvchiga bot hech narsa yozmadi — kerak bo'lsa o'zingiz ayting.</i>`);
  for (const im of ((job.b && job.b.images) || []).slice(0, 3)) { const raw = String(im.data || im || ""); const m = raw.match(/^data:([^;]+);base64,(.*)$/); const b64 = m ? m[2] : raw; if (!b64) continue;
    const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0)); const fd = new FormData(); fd.append("chat_id", String(env.OWNER_ID)); fd.append("photo", new Blob([bin], {type: (m && m[1]) || im.mime || "image/jpeg"}), "page.jpg");
    await tgForm(env, "sendPhoto", fd); } }
/* ---------------- Kechki tekshiruv navbati (sayt: Uyga vazifa + Baza; Telegram: shadowing) ---------------- */
let NIGHT_KEY0 = null; const NIGHT_KEY_ = () => NIGHT_KEY0 || (NIGHT_KEY0 = crypto.randomUUID()); // shu jarayon ichidagi kechki so'rovlar uchun (global scope'da yaratib bo'lmaydi)
const QMSG = k => `✅ Javoblaringiz qabul qilindi! ${k === "speaking" ? "Speaking" : "Writing"} kechasi (00:00–05:00) tekshiriladi — natija va feedback Telegram topic'ingizga tushadi. Hech narsani qayta yuborish shart emas.`;
async function fpKey(kind, stu, chunks){ let src = kind + "|" + stu.id; for (const c of chunks) { const x = String(c || ""); src += "|" + x.length + ":" + x.slice(0, 4000) + x.slice(-4000); }
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(src)); return "gjf:" + [...new Uint8Array(d)].slice(0, 12).map(b => b.toString(16).padStart(2, "0")).join(""); }
const nightOK = now => { const h = L(now).getUTCHours(); return h < 8; }; // 00:00–05:00 asosiy oyna; qolganlari 08:00 gacha tugatiladi
async function nightPosted(env, id){ const job = await J(env, "gj:" + id, null); if (job) { job.st = "posted"; job.pt = Date.now(); await PUT(env, "gj:" + id, job, {expirationTtl: 5 * 86400}); }
  await PUT(env, "rnd", (await J(env, "rnd", [])).filter(x => x !== id)); }
function capOf(r){ // zaxira matn (render bo'lmasa): har Task/Part bitta qatorda
  const L0 = [`${r.kind === "speaking" ? "🎤 Speaking" : "✍️ Writing"} · ${r.mode === "hw" ? "Uyga vazifa" : "Baza"}${r.title ? " — " + H(r.title) : ""}`, `👤 ${H(r.student_name || "")}`];
  if (r.kind === "speaking") { L0.push(`📊 Umumiy: <b>${fmtN(r.overall)}</b> / 5`); (r.parts || []).forEach(p => L0.push(`• Part ${p.part} — <b>${fmtN(p.overall)}</b> / 5`)); }
  else { L0.push(`📊 Umumiy: <b>${fmtN(r.total)}</b> / ${r.max}`); (r.tasks || []).forEach(t => L0.push(`• Task ${t.task} — ${t.missing ? "❌ yozilmagan (0)" : `<b>${fmtN(t.overall)}</b> / 5`}`)); }
  if (r.late) L0.push("⏰ Muddatdan kech topshirildi"); L0.push("<i>To'liq feedback — saytda «Natijalarim» bo'limida.</i>"); return L0.join("\n"); }
async function nightFallback(env){ // 08:00 gacha render bo'lmagan natijalar — matn ko'rinishida
  if (L(Date.now()).getUTCHours() < 7 || env.__kvfull) return; const q = await J(env, "rnd", []); if (!q.length) return;
  const studs = await getStudents(env); const gs = await getGroups(env);
  for (const id of q.slice(0, 15)) { const job = await J(env, "gj:" + id, null); if (!job || job.st !== "graded") { await nightPosted(env, id); continue; }
    const r = JSON.parse(await env.KV.get(job.rkey) || "null"); const s0 = studs.find(x => x.id === job.sid); const g = s0 && gs.find(x => x.id === s0.gid);
    if (r && s0 && s0.thread && g) await say(env, g.id, capOf(r), {message_thread_id: s0.thread, ...(job.vmid ? {reply_to_message_id: job.vmid, allow_sending_without_reply: true} : {})});
    await nightPosted(env, id); } }
async function nightRun(env, W){ // har daqiqa (kechasi): navbatdagi ishlarni bittadan tekshiradi
  const now = Date.now(); if (!nightOK(now) || env.__kvfull) return; const lk = await J(env, "gjrun", null); if (lk && now - lk.t < 100e3) return;
  const q = await J(env, "gjl", []); if (!q.length) return; await PUT(env, "gjrun", {t: now}, {expirationTtl: 300});
  const mid0 = atLocal(dayKey(now), 0); const t0 = Date.now(); const drop = [];
  for (const id of q) { if (Date.now() - t0 > 50e3) break;
    const job = await J(env, "gj:" + id, null); if (!job) { drop.push(id); continue; }
    if (job.st !== "q" || (job.next || 0) > Date.now()) { if (job.st !== "q") drop.push(id); continue; }
    if (L(now).getUTCHours() >= 5 && job.at >= mid0) continue; // 05:00 dan keyin topshirilganlar — keyingi kechada
    job.st = "run"; await PUT(env, "gj:" + id, job, {expirationTtl: 10 * 86400}); if (env.__kvfull) return;
    let d = null, err = "";
    try { const rs = await W.fetch(new Request("https://night/" + job.kind, {method: "POST", headers: {"content-type": "application/json", "x-night": NIGHT_KEY_()}, body: JSON.stringify(job.b)}), env, {waitUntil: () => {}}); d = await rs.json(); if (!rs.ok || d.error) err = d.error || ("HTTP " + rs.status); }
    catch (e) { err = String(e.message || e); }
    if (d && d.key && !err) { job.st = "graded"; job.rkey = d.key; job.gt = Date.now(); delete job.b; await PUT(env, "gj:" + id, job, {expirationTtl: 10 * 86400}); drop.push(id);
      const rq = await J(env, "rnd", []); rq.push(id); await PUT(env, "rnd", rq.slice(-300)); }
    else { job.n = (job.n || 0) + 1; job.err = err.slice(0, 200);
      if (job.n >= 6 || /422|topilmadi|Rasm yuklang|Audio yo'q/i.test(err)) { job.st = "fail"; drop.push(id); await nightFailNote(env, job).catch(e => console.log("nfn", e.message)); }
      else { job.st = "q"; job.next = Date.now() + 5 * 60e3; }
      await PUT(env, "gj:" + id, job, {expirationTtl: 10 * 86400}); }
  }
  if (drop.length) await PUT(env, "gjl", (await J(env, "gjl", [])).filter(x => !drop.includes(x)));
  await PUT(env, "gjrun", {t: 0}, {expirationTtl: 300});
}

/* ---------------- Faoliyat jurnali (o'qituvchi uchun) ---------------- */
async function addLog(env, sid, evs){
  if (!sid || !evs || !evs.length) return; const k = `log:${sid}:${dayKey()}`;
  const L0 = await J(env, k, []); const L1 = [...L0, ...evs.map(e => ({...e, at: +e.at || Date.now()}))].slice(-400);
  await PUT(env, k, L1, {expirationTtl: 120 * 86400});
}
const cleanEv = e => { const o = {t: clean(e.t, 24), at: +e.at || Date.now()};
  for (const [k, v] of Object.entries(e || {})) if (!["t", "at"].includes(k) && Object.keys(o).length < 10) o[k] = typeof v === "number" ? v : clean(String(v), 160);
  return o; };
async function pronMissed(env, now, quiet){
  if (quiet) return; const l = await env.KV.list({prefix: "pq:"});
  for (const k of l.keys) {
    const at = +k.name.slice(3); if (now - at < 30 * 60e3) continue;
    const q = await J(env, k.name, null); await env.KV.delete(k.name); if (!q) continue;
    const stu = (await getStudents(env)).find(s => s.id === q.sid); const g = (await getGroups(env)).find(x => x.id === q.gid);
    if (!stu || !stu.thread || !g || g.quiet) continue;
    await toTopic(env, g.id, stu.thread, `🗣 <b>${H(first(stu.name))}, talaffuz mashqini qilmadingiz.</b>\nFeedbackdagi so'zlar: ${(q.words || []).slice(0, 10).map(w => "<b>" + H(w) + "</b>").join(", ")}\nKeyingi safar 🔊 To'g'ri → 🎤 Ayting tugmalari bilan mashq qilib, «📤 Talaffuz natijasini jo'natish»ni bosing 💪`);
    await addLog(env, q.sid, [{t: "pron_missed", n: (q.words || []).length}]);
  }
}

/* ---------------- Profil (natijalar tarixi) ---------------- */
function critAvg(list){ const m = {}; for (const t of list) for (const c of (t.criteria || [])) (m[c.name] = m[c.name] || []).push(+c.score || 0); const o = {}; for (const k in m) o[k] = r1(avg(m[k])); return o; }
function ruleCounts(prof){ const c = {}; for (const e of (prof.h || [])) for (const r of (e.rules || [])) c[r] = (c[r] || 0) + 1; return c; }
function markRepeats(errLists, counts){
  let n = 0; for (const errs of errLists) for (const e of (errs || [])) { const r = String(e.rule || "").toLowerCase().trim(); if (r && counts[r]) { e.repeat = counts[r] + 1; n++; } } return n;
}
async function saveProfile(env, stu, entry){
  const p = await getProfile(env, stu.id); p.name = stu.name; p.h = [...(p.h || []).filter(e => !(e.q && e.k === entry.k && e.at === entry.at)), entry].slice(-200); await PUT(env, "p:" + stu.id, p); return p; // kechasi tekshirilgan natija vaqtinchalik "qabul qilindi" yozuvining o'rniga
}
const prevTags = prof => { const c = ruleCounts(prof); return Object.keys(c).sort((a, b) => c[b] - c[a]).slice(0, 30); };

/* =====================================================================
   ASOSIY
   ===================================================================== */
// KV yozish limiti tugasa ham tizim yiqilmasin: yozuv xatosi yutiladi, env.__kvfull belgilanadi (yuborishlar shunga qarab to'xtaydi)
let KVFULL_UNTIL = 0;
function safeEnv(env){ if (env.__safe) return env; const kv = env.KV; const e = Object.create(env);
  e.__safe = true; e.__kvfull = Date.now() < KVFULL_UNTIL;
  e.KV = new Proxy(kv, {get(t, p){ const f = t[p]; if (typeof f !== "function") return f;
    if (p === "put" || p === "delete") return async (...a) => { if (e.__kvfull) return; try { return await f.apply(t, a); } catch (x) { if (/limit exceeded|429|Too Many/i.test(String(x && x.message))) { e.__kvfull = true; const d = new Date(); KVFULL_UNTIL = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1); console.log("KV FULL"); return; } throw x; } };
    return f.bind(t); }});
  return e; }
const WORKER = {
  async scheduled(ev, env, ctx){ env = safeEnv(env); ctx.waitUntil((ev.cron === "* * * * *" ? Promise.all([nightFailOnce(env).catch(() => {}), fbFixOnce(env).catch(() => {}), pronSkipOnce(env).catch(() => {}), shRegrade(env).catch(e => console.log("shrg", e.message)), shadowQueue(env), spkSweep(env), impSweep(env), nightRun(env, WORKER).catch(e => console.log("night", e.message)), hwSeedOnce(env, "tourism", /16\s*-\s*18/, Date.UTC(2026, 10, 13, 18, 59)).then(() => dialogFixOnce(env)).then(() => fixC1Once(env)).then(() => picC2(env)).then(() => hwP3Once(env, "Tourism", "Tourism brings more benefits than problems to a country.", /16\s*-\s*18/)).catch(e => console.log("seed", e.message))]) : Promise.all([nightFallback(env).catch(e => console.log("nfb", e.message)), cron(env), aiCount(env, null, null, true).then(() => limRefresh(env))])).catch(e => console.log("cron", e.stack || e.message))); },
  async fetch(req, env, ctx){ env = safeEnv(env);
    const url = new URL(req.url); const path = url.pathname;
    if (path === "/diag") { // diagnostika (faqat GitHub Actions token bilan; natija shifrlanib chiqariladi)
      if (!env.RENDER_TOKEN || url.searchParams.get("rt") !== env.RENDER_TOKEN) return new Response("no", {status: 403});
      const out0 = {now: Date.now(), kvfullUntil: KVFULL_UNTIL}; const keys = String(url.searchParams.get("k") || "").split(",").map(x => x.trim()).filter(Boolean).slice(0, 40);
      try { await env.KV.put("diag:w", String(Date.now()), {expirationTtl: 600}); out0.write = env.__kvfull ? "KV FULL" : "ok"; } catch (e) { out0.write = String(e.message || e); }
      for (const k of keys) { if (k.startsWith("meta:")) { const rv = await env.KV.getWithMetadata(k.slice(5)); out0[k] = {meta: rv.metadata, len: (rv.value || "").length}; continue; }
        if (k.endsWith("*")) { const L0 = await env.KV.list({prefix: k.slice(0, -1), limit: 60}); out0[k] = {}; for (const x of L0.keys) out0[k][x.name] = String(await env.KV.get(x.name) || "").slice(0, 4000); } else out0[k] = String(await env.KV.get(k) || "").slice(0, 20000); }
      return new Response(JSON.stringify(out0), {headers: {"content-type": "application/json"}}); }
    if (path === "/night/next") { // GitHub render: navbatdagi tekshirilgan natija
      if (!env.RENDER_TOKEN || url.searchParams.get("rt") !== env.RENDER_TOKEN) return new Response("no", {status: 403});
      for (const id of await J(env, "rnd", [])) { const job = await J(env, "gj:" + id, null); if (!job || job.st !== "graded") { await nightPosted(env, id); continue; }
        const r = await env.KV.get(job.rkey); if (!r) { await nightPosted(env, id); continue; }
        return new Response(JSON.stringify({id, sid: job.sid, r: JSON.parse(r)}), {headers: {"content-type": "application/json"}}); }
      return new Response("{}", {headers: {"content-type": "application/json"}}); }
    /* ---------- Telegram webhook ---------- */
    if (path === "/tg" && req.method === "POST") {
      if (!env.TG_TOKEN || req.headers.get("x-telegram-bot-api-secret-token") !== await secretOf(env)) return new Response("no", {status: 403});
      const upd = await req.json();
      const job = onUpdate(env, upd).catch(async e => { console.log("upd", e.stack || e.message);
        try { await env.KV.put("lasterr", JSON.stringify({t: Date.now(), m: String(e.stack || e.message).slice(0, 500)}), {expirationTtl: 3 * 86400}); } catch (x) {} });
      if (ctx && ctx.waitUntil) ctx.waitUntil(job); else await job; // Telegram'ga darhol javob — uzoq AI tekshiruvi timeout bermasin
      return new Response("ok");
    }
    if (path === "/bot/setup" && req.method === "GET") {
      if (!env.TG_TOKEN) return new Response("TG_TOKEN qo'yilmagan.", {status: 500});
      const me = await tg(env, "getMe", {});
      const wh = await tg(env, "setWebhook", {url: url.origin + "/tg", secret_token: await secretOf(env), allowed_updates: ["message", "edited_message", "callback_query", "my_chat_member"], drop_pending_updates: false});
      const cmds = [["start","📡 Bosh menyu"],["guruhlar","📚 Guruhlarim"],["natijalar","📊 Oxirgi vazifa natijalari"],["limit","🤖 AI limit (tepaga pin)"],["davomat","📋 Bugungi davomat"],["holat","🔎 Kim topshirdi / kim topshirmadi"],["pinlar","🔑 O'quvchilar PIN kodlari"],["hisobot","📈 Haftalik hisobotni hozir yuborish"],["jim","🔕 Eslatmalarni vaqtincha o'chirish"],["yoq","🔔 Eslatmalarni yoqish"]];
      await tg(env, "setMyCommands", {commands: cmds.map(([command, description]) => ({command, description})), scope: {type: "chat", chat_id: +env.OWNER_ID}});
      if (wh.ok && env.OWNER_ID) await owner(env, "📡 <b>AOK Radar ishga tushdi!</b>\n\nEndi botni guruhlaringizga qo'shing va <b>admin</b> qiling. Menyu: /start");
      return new Response(`<meta charset=utf-8><body style="font:18px system-ui;padding:30px"><h2>${wh.ok ? "✅ Bot ulandi" : "❌ Xato"}</h2><p>Bot: @${H(me.result && me.result.username)}</p><p>${H(wh.description || "")}</p><p>${wh.ok ? "Telegram'da botga qarang — xabar yubordi." : ""}</p>`, {headers: {"content-type": "text/html; charset=utf-8"}});
    }

    const origin = req.headers.get("Origin") || "";
    const allow = (env.ALLOWED_ORIGIN || "https://aok-ai97.github.io").split(",").map(s => s.trim());
    const cors = {"Access-Control-Allow-Origin": allow.includes(origin) ? origin : allow[0],
      "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "content-type", "Vary": "Origin"};
    const out = (o, s = 200) => { if (env.__kvfull && s < 300 && o && o.ok && /^\/teacher\//.test(path)) { o = {error: "⏳ Bugun xotiraning kunlik yozuv limiti tugadi — o'zgarish SAQLANMADI. Ertalab 05:00 dan keyin qayta saqlang."}; s = 507; } // jim "saqlandi" demasin
      return new Response(JSON.stringify(o), {status: s, headers: {...cors, "content-type": "application/json; charset=utf-8"}}); };
    if (req.method === "OPTIONS") return new Response(null, {headers: cors});
    if (req.method !== "POST") return out({ok: true, service: "AOK checker + Radar", version: 8, kv: !!env.KV, bot: !!env.TG_TOKEN});
    if (!allow.includes(origin) && (!NIGHT_KEY0 || req.headers.get("x-night") !== NIGHT_KEY0) && !(env.RENDER_TOKEN && url.searchParams.get("rt") === env.RENDER_TOKEN)) return out({error: "Ruxsat yo'q (origin)."}, 403); // kechki ichki tekshiruv / render
    if (!env.KV) return out({error: "KV ulanmagan (Cloudflare → Bindings → KV namespace, nomi: KV)."}, 500);

    /* ---------- 📤 Jo'nat (multipart: video + A4 sahifalar) ---------- */
    if (path === "/send") {
      try {
        const fd = await req.formData(); let stu = await studentByPin(env, fd.get("code"));
        if (!stu && env.RENDER_TOKEN && fd.get("rt") === env.RENDER_TOKEN) stu = (await getStudents(env)).find(x => x.id === fd.get("sid")); // kechki render (GitHub) — o'quvchi nomidan
        if (!stu) return out({error: "PIN noto'g'ri."}, 401);
        const g = (await getGroups(env)).find(x => x.id === stu.gid);
        if (!g || !stu.thread) return out({error: "Sizning topic'ingiz hali ulanmagan — o'qituvchiga ayting."}, 400);
        const key = String(fd.get("key") || "");
        if (key.startsWith("gj:")) { // navbatdagi Speaking — video darhol topic'ga, natija kechasi
          const job = await J(env, key, null); if (!job || job.sid !== stu.id) return out({error: "Topilmadi."}, 404); if (job.vsent) return out({ok: true, dup: true});
          let vmid = null;
          for (const video of fd.getAll("video").slice(0, 4)) if (video && video.size > 1000 && video.size <= 49e6) { const vf = new FormData(); vf.append("chat_id", g.id); vf.append("message_thread_id", String(stu.thread)); vf.append("supports_streaming", "true");
            const ext = /mp4/.test(video.type) ? "mp4" : "webm"; vf.append("video", video, `speaking.${ext}`); vf.append("caption", String(fd.get("caption") || "").slice(0, 1000));
            let rv2 = await tgForm(env, "sendVideo", vf); if (!rv2.ok) { const df = new FormData(); df.append("chat_id", g.id); df.append("message_thread_id", String(stu.thread)); df.append("document", video, `speaking.${ext}`); df.append("caption", String(fd.get("caption") || "").slice(0, 1000)); rv2 = await tgForm(env, "sendDocument", df); }
            if (rv2.ok && !vmid) vmid = rv2.result.message_id; }
          job.vsent = Date.now(); if (vmid) job.vmid = vmid; await PUT(env, key, job, {expirationTtl: 10 * 86400}); return out({ok: true}); }
        const rv = await env.KV.getWithMetadata(key);
        if (key.startsWith("r:") && !rv.value && fd.get("title")) { rv.value = "{}"; rv.metadata = {sid: stu.id, title: String(fd.get("title")).slice(0, 100), total: +fd.get("total") || 0, max: +fd.get("max") || 0, nokv: 1}; } // kunlik KV limiti tugagan kunda saqlanmagan natija — o'quvchining o'zidagi nusxa yuboriladi
        if (!key.startsWith("r:") || !rv.metadata || rv.metadata.sid !== stu.id) return out({error: "Natija topilmadi."}, 404);
        if (fd.get("extra") === "pron") { // talaffuz mashqi natijasi — qo'shimcha xabar (bir xili qayta yuborilmaydi)
          const cap = String(fd.get("caption") || "").slice(0, 3500); const hsh = String(cap.length) + ":" + [...cap].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
          if (rv.metadata.pronHash === hsh) return out({ok: true, dup: true});
          const rr = await toTopic(env, g.id, stu.thread, cap); if (!rr.ok) return out({error: "Telegram: " + rr.description}, 502);
          await env.KV.put(key, rv.value, {metadata: {...rv.metadata, pronHash: hsh}}); await env.KV.delete("pq:" + key.split(":").pop());
          await addLog(env, stu.id, [{t: "pron_sent", n: +(fd.get("n") || 0), avg: +(fd.get("avg") || 0)}]);
          return out({ok: true}); }
        if (rv.metadata.sent) return out({ok: true, dup: true}); // allaqachon yuborilgan — qayta tashlanmaydi
        // (takroriy yuborish: bir xil ish idempotent kalit bilan bitta natijaga tushadi — alohida yozuv kerak emas)
        const base = {chat_id: g.id, message_thread_id: stu.thread};
        const nj = fd.get("nid") ? await J(env, "gj:" + fd.get("nid"), null) : null; // kechki natija — qabul qilingan videoga javob sifatida
        const r0 = await say(env, g.id, String(fd.get("caption") || "").slice(0, 3500), {message_thread_id: stu.thread, ...(nj && nj.vmid ? {reply_to_message_id: nj.vmid, allow_sending_without_reply: true} : {})});
        if (!r0.ok) return out({error: "Telegram: " + r0.description}, 502); await rmMark(env, g.id, stu.thread, r0.result.message_id);
        for (const video of fd.getAll("video").slice(0, 4)) if (video && video.size > 1000) {
          if (video.size > 49e6) await say(env, g.id, "⚠️ Video juda katta bo'lgani uchun yuborilmadi (50 MB dan ortiq).", {message_thread_id: stu.thread});
          else { const vf = new FormData(); vf.append("chat_id", g.id); vf.append("message_thread_id", String(stu.thread)); vf.append("supports_streaming", "true");
            const ext = /mp4/.test(video.type) ? "mp4" : "webm"; vf.append("video", video, `speaking.${ext}`); vf.append("caption", `🎥 ${stu.name} — ${rv.metadata.title || "Speaking"}`);
            const rv2 = await tgForm(env, "sendVideo", vf);
            if (!rv2.ok) { const df = new FormData(); df.append("chat_id", g.id); df.append("message_thread_id", String(stu.thread)); df.append("document", video, `speaking.${ext}`); const rv3 = await tgForm(env, "sendDocument", df);
              if (!rv3.ok) { await say(env, g.id, `⚠️ Video yuborilmadi (${H(String(rv3.description || rv2.description || "Telegram xatosi").slice(0, 120))}).`, {message_thread_id: stu.thread}); await addLog(env, stu.id, [{t: "video_fail", msg: String(rv3.description || "").slice(0, 120), mb: Math.round(video.size / 1e5) / 10}]); } } }
        }
        const pages = fd.getAll("page").filter(f => f && f.size).slice(0, 20);
        for (let i = 0; i < pages.length; i += 10) {
          const ch = pages.slice(i, i + 10); const pf = new FormData(); pf.append("chat_id", g.id); pf.append("message_thread_id", String(stu.thread));
          if (ch.length === 1) { pf.append("photo", ch[0], "page.png"); await tgForm(env, "sendPhoto", pf); }
          else { pf.append("media", JSON.stringify(ch.map((_, j) => ({type: "photo", media: `attach://p${j}`})))); ch.forEach((f, j) => pf.append(`p${j}`, f, `p${j}.png`)); await tgForm(env, "sendMediaGroup", pf); }
        }
        await env.KV.put(key, rv.value, {metadata: {...rv.metadata, sent: Date.now()}});
        if (fd.get("nid")) await nightPosted(env, String(fd.get("nid")));
        await addLog(env, stu.id, [{t: "sent", kind: key.split(":")[1], videos: fd.getAll("video").length, pages: pages.length, auto: fd.get("auto") ? 1 : 0}]);
        return out({ok: true});
      } catch (e) { return out({error: "Yuborilmadi: " + e.message}, 500); }
    }

    let b; try { b = await req.json(); } catch { return out({error: "Noto'g'ri so'rov."}, 400); }
    const kind = b.kind === "writing" ? "writing" : "speaking"; let IDK = null; env.__aiTO = 110e3; // uzun Speaking (Part 2/3) 30–120 s oladi
    try {
      /* ---------- O'QITUVCHI ---------- */
      if (path.startsWith("/teacher/")) {
        const tc = (b.tcode || "").trim(); const TR = env.TEACHER_CODE && tc === env.TEACHER_CODE ? {admin: true, name: "Bosh admin"} : (() => null)();
        const TT = TR || await (async () => { const t = /^\d{6}$/.test(tc) && (await getTeachers(env)).find(x => x.code === tc); return t ? {admin: false, t, name: t.name} : null; })();
        if (!TT) return out({error: "O'qituvchi kodi noto'g'ri."}, 401);
        const myG = (await getGroups(env)).filter(g => g.active !== false && (TT.admin || (TT.t.groups || []).includes(g.id))).map(g => ({id: g.id, title: g.title}));
        const myGid = myG.map(g => g.id);
        const writeHw = async (k, mk) => { const tgt = (b.groups || []).map(String).filter(x => myGid.includes(x)); const list = tgt.length ? tgt : (myGid.length ? myGid : ["*"]); let n = 0;
          for (const gid of list) { const key = gid === "*" ? "hw:" + k : `hw:${k}:${gid}`; const old = await J(env, key, null); const v = mk(old, gid); if (v && !v.due && gid !== "*") { const g0 = (await getGroups(env)).find(x => String(x.id) === gid); if (g0) v.due = nextLesson(g0, dayKey()); } /* muddat yozilmasa — keyingi dars boshlanishi */ if (v) { await PUT(env, key, v); n = v.ids ? v.ids.length : n; } } return n; };
        if (path === "/teacher/login") { const sv = await env.KV.get("seed:v1"); return out({ok: true, seeded: !!sv, seedv: +(sv || 0), name: TT.name, admin: TT.admin}); }
        if (path === "/teacher/groups") return out({groups: myG, students: (await getStudents(env)).filter(s => myGid.includes(s.gid))});
        if (path === "/teacher/ai") { await aiCount(env, null, null, true); const days = [];
          for (let i = 0; i < 7; i++) { const d = qDay(Date.now() - i * 864e5); days.push({d, ...aiUsageView(await J(env, "aiu:" + d, {}))}); }
          return out({keys: gKeys(env).length, days, cap: aiCapacity(env, days[0])}); }
        if (path === "/teacher/log") {
          const day = /^\d{4}-\d{2}-\d{2}$/.test(b.date || "") ? b.date : dayKey(); const q = nn(b.q || "");
          const studs = (await getStudents(env)).filter(s => myGid.includes(s.gid) && (!q || nn(s.name).includes(q)) && (!b.gid || s.gid === b.gid));
          const res = []; for (const st of studs) { const L0 = await J(env, `log:${st.id}:${day}`, []); if (L0.length || q) res.push({sid: st.id, name: st.name, grp: (myG.find(g => g.id === st.gid) || {}).title || "", events: L0}); }
          return out({date: day, students: res});
        }
        if (path === "/teacher/bank") {
          const bank = await allBank(env, kind);
          if (kind === "speaking") for (const p of ["1.2", "2"]) bank[p] = await withImages(env, bank[p] || []);
          const homeworks = {}; for (const g of myG) { const h = await hwOf(env, kind, g.id); if (h) homeworks[g.id] = h; }
          const legacy = myG.length ? null : await J(env, "hw:" + kind, null);
          const exams = JSON.parse(await env.KV.get("exams") || "[]").filter(e => e.kind === kind);
          return out({bank, homeworks, homework: legacy, exams, groups: myG, me: {name: TT.name, admin: TT.admin}});
        }
        if (path === "/teacher/import") {
          const items = b.items || []; let added = 0, skipped = 0, updated = 0;
          for (const k of ["writing", "speaking"]) for (const p of (k === "writing" ? WPARTS : SPARTS)) {
            const arr = await getBank(env, k, p); const have = new Map(arr.map(x => [norm(keyText(x)), x])); let ch = false;
            for (const it of items.filter(x => x.kind === k && (x.part || x.wtype) === p)) {
              const key = norm(keyText(it)); const ex = have.get(key);
              if (ex) { skipped++; if (it.qtype && !ex.qtype) { ex.qtype = it.qtype; ch = true; updated++; } if (it.pics && !ex.pics) { ex.pics = it.pics; ch = true; }
                if ((it.images || []).length && !(ex.images || []).length) { ex.images = it.images; ch = true; updated++; } continue; }
              have.set(key, it); arr.push(it); added++; ch = true;
            }
            if (ch) await putBank(env, k, p, arr);
          }
          await env.KV.put("seed:v1", String(b.version || 1));
          return out({ok: true, added, skipped, updated});
        }
        if (path === "/teacher/item/save") {
          const it = b.item || {}; const k = it.kind === "writing" ? "writing" : "speaking";
          const part = k === "writing" ? (it.wtype === "T2" ? "T2" : "T1") : (SPARTS.includes(it.part) ? it.part : "1.1");
          const clean_it = {id: it.id || uid(), kind: k, topic: clean(it.topic, 60) || "Boshqa", created: it.created || Date.now()};
          if (it.qtype) clean_it.qtype = clean(it.qtype, 20); if (it.struct) clean_it.struct = +it.struct || undefined; if (Array.isArray(it.pics)) clean_it.pics = it.pics.map(x => clean(x, 120)).slice(0, 2);
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

      if (path === "/log") { if (stu) await addLog(env, stu.id, (b.events || []).slice(0, 80).map(cleanEv)); return out({ok: true}); }
      if (path === "/home") {
        const bank = await allBank(env, kind);
        const hw = stu ? await hwOf(env, kind, stu.gid) : JSON.parse(await env.KV.get("hw:" + kind) || "null");
        const exams = JSON.parse(await env.KV.get("exams") || "[]").filter(e => e.kind === kind && e.active).map(e => ({id: e.id, name: e.name, at: e.at}));
        const counts = {}, topics = {};
        for (const p in bank) { counts[p] = bank[p].length; for (const it of bank[p]) topics[it.topic] = (topics[it.topic] || 0) + 1; }
        let homework = null;
        if (hw && hw.ids && hw.ids.length) {
          homework = {title: hw.title, at: hw.at, due: hw.due || null, items: await withImages(env, await findItems(env, kind, hw.ids))};
          if (stu) { const e = subOf(await getProfile(env, stu.id), kind, hw, (await getGroups(env)).find(x => x.id === stu.gid)); if (e) homework.done = {at: e.at, tot: e.tot, max: e.max, q: !!e.q}; }
        }
        // Talaffuz darvozasi: oxirgi tekshirilgan Speaking'dagi talaffuz mashqi bajarilmagan bo'lsa — avval o'sha
        let pron = null;
        if (stu) { const P = await getProfile(env, stu.id); const last = (P.h || []).filter(e => e.k === "speaking" && !e.q && ["hw", "baza"].includes(e.m) && Date.now() - e.at < 7 * 864e5).slice(-1)[0];
          if (last) { const rv = await env.KV.getWithMetadata("r:speaking:" + last.at); if (rv.value && !(rv.metadata && rv.metadata.pronHash)) { const r = JSON.parse(rv.value); if ((r.pron || []).length) pron = {key: r.key, at: r.at, title: r.title, student_name: r.student_name, pron: r.pron, kind: "speaking"};
            const pct = {}, left = {}; for (const p of r.pron.slice(0, 30)) { const v = String(await env.KV.get(`pa:${clean(r.key || "", 80)}:${norm(p.word).slice(0, 40)}`) || "0").split("|"); left[p.word] = Math.max(0, 3 - (+v[0] || 0)); if (v[1] !== undefined && v[1] !== "") pct[p.word] = +v[1]; } pron.pct = pct; pron.left = left; } } }
        return out({homework, exams, counts, topics, pron, me: stu ? {name: stu.name, group: await gName(), linked: !!stu.thread} : null});
      }
      if (path === "/me") {
        if (!stu) return out({error: "Natijalaringizni ko'rish uchun shaxsiy PIN kod bilan kiring."}, 401);
        const p = await getProfile(env, stu.id); const days = [];
        for (let i = 0; i < 28; i++) { const t = Date.now() - i * 864e5; const d = await env.KV.get(`gr:${stu.gid}:${dayKey(t)}`); if (d) { const r = JSON.parse(d)[stu.id]; if (r) days.push({d: dayKey(t), m: dayMark(r), it: Object.fromEntries(Object.entries(r.it || {}).map(([k, v]) => [ITEM_UZ[k] || k, v.l != null ? LV_NAME(v.l) : "bor"]))}); } }
        return out({name: stu.name, group: await gName(), h: (p.h || []).filter(e => !BAD_SP(e) && !e.q), days, rules: ruleCounts(p)});
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
        return {at: hw.at, late: !!(hw.due && (b.__night || Date.now()) > hw.due)}; }; // kechasi tekshirilsa — topshirilgan vaqti
      const away = b.away && typeof b.away === "object" ? {n: Math.min(99, +b.away.n || 0), s: Math.min(99999, Math.round(+b.away.s || 0))} : null;
      const prof = stu ? await getProfile(env, stu.id) : {h: []};
      const tagLine = () => { const t = prevTags(prof); return t.length ? `\nTags already used for this student's earlier mistakes (reuse EXACTLY the same tag text when a mistake is of the same kind): ${t.join(" | ")}` : ""; };

      // Uyga vazifa va Baza — kechasi (00:00–05:00) tekshiriladi: hozir faqat qabul qilinadi
      if ((path === "/writing" || path === "/speaking") && ["hw", "baza"].includes(b.mode) && !b.__night) {
        if (!stu) return out({error: "Avval kodingiz bilan kiring."}, 401); const kind = path === "/writing" ? "writing" : "speaking";
        if (L(Date.now()).getUTCHours() < 5) return out({error: "⏰ Ertaroq topshirish kerak edi — endi 05:00 dan keyin topshirasiz.", pause: true}, 423);
        if (path === "/writing" && !(b.images || []).length && !b.text) return out({error: "Rasm yuklang."}, 400);
        const clips = path === "/speaking" ? (b.clips || []).filter(c => c.audio) : []; if (path === "/speaking" && !clips.length) return out({error: "Audio yo'q."}, 400);
        const fp = await fpKey(kind, stu, path === "/writing" ? [...(b.images || []).map(i => i.data), b.text || "", (b.ids || []).join(",")] : clips.map(c => c.audio));
        const old = await J(env, fp, null); if (old && old.id) return out({queued: true, id: old.id, dup: true, msg: QMSG(kind)});
        const at = Date.now(), id = `${kind}:${stu.id}:${at}`; const hi = await hwInfo();
        let exp = ""; if (kind === "writing") { const its = await findItems(env, "writing", b.ids || []); exp = [...new Set(its.flatMap(it => it.wtype === "T1" ? ["1.1", "1.2"] : ["2"]))].join(","); } else exp = [...new Set(clips.map(c => c.part))].join(",");
        await env.KV.put("gj:" + id, JSON.stringify({id, kind, sid: stu.id, gid: stu.gid, at, late: !!(hi && hi.late), st: "q", n: 0, b: {...b, __night: at}}), {expirationTtl: 10 * 86400});
        if (env.__kvfull) return out({error: "Hozir qabul qilib bo'lmadi — bir daqiqadan keyin qayta yuboring."}, 503);
        const q = await J(env, "gjl", []); q.push(id); await PUT(env, "gjl", q.slice(-300)); await PUT(env, fp, {id}, {expirationTtl: 3 * 86400});
        await saveProfile(env, stu, {at, k: kind, m: b.mode, t: clean(b.title, 120), tot: 0, max: kind === "writing" ? 0 : 5, q: 1, hw: hi ? hi.at : undefined, [kind === "writing" ? "tasks" : "parts"]: exp});
        await addLog(env, stu.id, [{t: "queued", kind, mode: b.mode, title: clean(b.title, 80)}]);
        return out({queued: true, id, kind, at, msg: QMSG(kind), can_send: !!stu.thread});
      }
      if (path === "/writing") {
        const items = await findItems(env, "writing", b.ids || []);
        const ctx = items.map(it => it.wtype === "T1"
          ? `TASK 1 — ${it.sender}\nEmail:\n${it.email}\nTask 1.1: ${it.t11}\nTask 1.2: ${it.t12}`
          : `TASK 2 — Essay question: ${it.essay}`).join("\n\n") || "(no question given)";
        const imgs = (b.images || []).slice(0, 8);
        if (!imgs.length && !b.text) return out({error: "Rasm yuklang."}, 400);
        const idem = await idemStart(env, "writing", stu, [...imgs.map(i => i.data), b.text || "", (b.ids || []).join(",")]); if (idem.hit) return out(idem.hit); IDK = idem.k;
        const parts = [{text: ctx}];
        imgs.forEach((im, i) => { parts.push({text: `Photo ${i + 1}:`}); parts.push({inline_data: {mime_type: im.mime || "image/jpeg", data: im.data}}); });
        if (b.text) parts.push({text: "Typed answer:\n" + clean(b.text, 6000)});
        const r = await gemini(env, WRITING_SYS + tagLine(), parts, W_SCHEMA);
        if (!r.tasks || !r.tasks.length) return out({error: "Rasmda javob topilmadi. Yorug' joyda, tekis qilib qayta rasmga oling."}, 422);
        r.tasks.forEach(fixTask);
        { const seen = {}; r.tasks = r.tasks.filter(t => { if (seen[t.task]) { if (t.overall > seen[t.task].overall) Object.assign(seen[t.task], t); return false; } seen[t.task] = t; return true; }); } // bir Task ikki marta kelsa — bittasi
        const expected = items.flatMap(it => it.wtype === "T1" ? ["1.1", "1.2"] : ["2"]);
        for (const t of [...new Set(expected)]) if (!r.tasks.some(x => x.task === t))
          r.tasks.push({task: t, missing: true, on_topic: true, topic_check: "", transcript: "", word_count: 0, errors: [], overall: 0, ideal: "", max_tips: ["Bu Task'ni ham yozing — yozilmagan Task 0 ball oladi."],
            criteria: ["Task Response", "Coherence & Cohesion", "Lexical Resource", "Grammatical Range & Accuracy", "Imlo xato"].map(n => ({name: n, score: 0, comment: "Javob berilmagan."}))});
        r.tasks.sort((a, b) => ["1.1", "1.2", "2"].indexOf(a.task) - ["1.1", "1.2", "2"].indexOf(b.task));
        const v = await verifyIdeals(env, r.tasks.map((t, i) => ({id: String(i), label: "Task " + t.task, context: ctx, text: t.missing ? "" : t.ideal})), W_CRIT);
        v.forEach((x, i) => { r.tasks[i].ideal = x.text; r.tasks[i].ideal_verified = !!x.verified; });
        r.total = r.tasks.reduce((a, t) => a + t.overall, 0); r.max = r.tasks.length * 5;
        if (stu) { r.student_name = stu.name; r.repeats = markRepeats(r.tasks.map(t => t.errors), ruleCounts(prof)); }
        r.kind = "writing"; r.mode = clean(b.mode, 10); r.title = clean(b.title, 120); r.at = +b.__night || Date.now(); r.away = away;
        const hi = await hwInfo(); if (hi) r.late = hi.late;
        const prevW = (prof.h || []).filter(e => e.k === "writing" && !e.q && e.at < r.at).slice(-1)[0]; if (prevW) r.prev = {tot: prevW.tot, max: prevW.max, at: prevW.at};
        const sc = {}; r.tasks.forEach(t => sc["t" + t.task.replace(".", "")] = t.overall);
        r.key = `r:writing:${r.at}`;
        await env.KV.put(r.key, JSON.stringify(r), {metadata: {name: r.student_name, sid: stu ? stu.id : null, gid: stu ? stu.gid : null, grp: await gName(), mode: r.mode, title: r.title, total: r.total, max: r.max, off: r.tasks.some(t => t.on_topic === false), miss: r.tasks.some(t => t.missing), late: !!r.late, away, at: r.at, ...sc}});
        if (stu) await saveProfile(env, stu, {at: r.at, k: "writing", m: r.mode, t: r.title, tot: r.total, max: r.max, tasks: r.tasks.filter(t => !t.missing).map(t => t.task).join(","), cr: critAvg(r.tasks.filter(t => !t.missing)), rules: [...new Set(r.tasks.flatMap(t => (t.errors || []).map(e => String(e.rule || "").toLowerCase().trim()).filter(Boolean)))].slice(0, 20), ...(hi ? {hw: hi.at, late: hi.late} : {})});
        r.saved = true; r.can_send = !!(stu && stu.thread);
        if (stu) await addLog(env, stu.id, [{t: "graded", kind: "writing", mode: r.mode, title: r.title, score: r.total, max: r.max}]);
        await idemDone(env, idem, r.key); IDK = null;
        return out(r);
      }

      if (path === "/speaking") {
        const clips = (b.clips || []).slice(0, 12).filter(c => c.audio);
        if (!clips.length) return out({error: "Audio yo'q."}, 400);
        const idem = await idemStart(env, "speaking", stu, clips.map(c => c.audio)); if (idem.hit) return out(idem.hit); IDK = idem.k;
        const parts = [];
        clips.forEach((c, i) => { parts.push({text: `Clip ${i + 1} — Part ${c.part} — Question: ${clean(c.question, 800)}${c.empty ? " (the recording is almost empty)" : ""}`}); parts.push({inline_data: {mime_type: (c.mime || "audio/webm").split(";")[0], data: c.audio}}); });
        const r = await gemini(env, SPEAKING_SYS + tagLine(), parts, S_SCHEMA);
        r.parts = r.parts || [];
        r.parts.forEach(p => { const m = String(p.part || "").match(/1\s*[.,]\s*([12])|\b([23])\b/); p.part = m ? (m[1] ? "1." + m[1] : m[2]) : String(p.part || "").replace(/part/ig, "").trim(); }); // "Part 1.1" → "1.1"
        { const seen = {}; r.parts = r.parts.filter(p => { if (seen[p.part]) { const a = seen[p.part]; a.transcript = [a.transcript, p.transcript].filter(Boolean).join(" / "); a.errors = [...(a.errors || []), ...(p.errors || [])]; a.unanswered = [...(a.unanswered || []), ...(p.unanswered || [])]; return false; } seen[p.part] = p; return true; }); } // bir Part ikki marta kelsa — birlashtiriladi
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
        r.kind = "speaking"; r.student_name = stu ? stu.name : (clean(b.name, 80) || "Noma'lum"); r.mode = clean(b.mode, 10); r.title = clean(b.title, 120); r.at = +b.__night || Date.now(); r.away = away;
        if (stu) r.repeats = markRepeats(r.parts.map(p => p.errors), ruleCounts(prof));
        const hi = await hwInfo(); if (hi) r.late = hi.late;
        const prevS = (prof.h || []).filter(e => e.k === "speaking" && !BAD_SP(e) && !e.q && e.at < r.at).slice(-1)[0]; if (prevS) r.prev = {tot: prevS.tot, max: prevS.max, at: prevS.at};
        r.audio_key = `aud:${r.at}`; r.audio_until = r.at + 86400000; r.key = `r:speaking:${r.at}`;
        await env.KV.put(r.audio_key, JSON.stringify(clips.map(c => ({mime: c.mime, audio: c.audio}))), {expirationTtl: 86400});
        await env.KV.put(r.key, JSON.stringify(r), {metadata: {name: r.student_name, sid: stu ? stu.id : null, gid: stu ? stu.gid : null, grp: await gName(), mode: r.mode, title: r.title, total: r.overall, max: 5, parts: (r.parts || []).map(p => p.part).join(","), miss: (r.parts || []).some(p => (p.unanswered || []).length), late: !!r.late, away, at: r.at}});
        if (stu) await saveProfile(env, stu, {at: r.at, k: "speaking", m: r.mode, t: r.title, tot: r.overall, max: 5, parts: (r.parts || []).map(p => p.part).join(","), cr: critAvg(r.parts), rules: [...new Set(r.parts.flatMap(p => (p.errors || []).map(e => String(e.rule || "").toLowerCase().trim()).filter(Boolean)))].slice(0, 20), ...(hi ? {hw: hi.at, late: hi.late} : {})});
        r.saved = true; r.can_send = !!(stu && stu.thread); await idemDone(env, idem, r.key); IDK = null;
        if (stu) { await addLog(env, stu.id, [{t: "graded", kind: "speaking", mode: r.mode, title: r.title, score: r.overall, max: 5, pron: (r.pron || []).length}]);
          if (stu.thread && r.mode === "exam" && (r.pron || []).length) await PUT(env, "pq:" + r.at, {sid: stu.id, gid: stu.gid, words: r.pron.map(p => p.word)}, {expirationTtl: 2 * 86400}); }
        return out(r);
      }

      if (path === "/pron") {
        if (!b.audio || !b.word) return out({error: "So'z yoki audio yo'q."}, 400);
        const pk = `pa:${clean(b.rk || ((stu ? stu.id : "x") + ":" + dayKey()), 80)}:${norm(b.word).slice(0, 40)}`; const pv = String(await env.KV.get(pk) || "0").split("|"); const used = +pv[0] || 0, best = pv[1] !== undefined && pv[1] !== "" ? +pv[1] : null;
        if (used >= 3) return out({error: "Bu so'z uchun 3 ta urinish tugadi.", left: 0, limit: true, best}, 403);
        const r = await gemini(env, PRON_SYS, [{text: `Target word: "${clean(b.word, 60)}"`}, {inline_data: {mime_type: (b.mime || "audio/webm").split(";")[0], data: b.audio}}], P_SCHEMA, 0.1, true); // AI xato bersa — urinish sarflanmaydi
        r.score = Math.max(0, Math.min(100, Math.round(+r.score || 0))); r.left = 2 - used; const nb = best == null ? r.score : Math.max(best, r.score);
        await env.KV.put(pk, (used + 1) + "|" + nb, {expirationTtl: 7 * 86400}); r.best = nb;
        return out(r);
      }
      return out({error: "Noma'lum manzil."}, 404);
    } catch (e) { if (IDK) try { await env.KV.delete(IDK); } catch (_) {}
      return out({error: (e.busy ? "BUSY: " : "AI xatosi: ") + e.message.replace(/^BUSY: /, ""), busy: !!e.busy}, e.busy ? 503 : 502); }
  }
};
export default WORKER;
