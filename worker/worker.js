// AOK English — Writing & Speaking Checker v3 (Cloudflare Worker)
// Sozlamalar (Settings → Variables): GEMINI_KEY (Secret), CLASS_CODE (Secret), TEACHER_CODE (Secret),
// ALLOWED_ORIGIN = https://aok-ai97.github.io, MODEL (ixtiyoriy). Bindings: KV namespace → nomi "KV".

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
- "errors": EVERY mistake in order: "wrong" (exact fragment), "correct", "explain" (very short, UZBEK Latin).
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
- "errors": grammar / vocabulary mistakes: "wrong", "correct", "explain" (very short UZBEK).
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
const ERR = {type:"ARRAY",items:{type:"OBJECT",properties:{wrong:STR,correct:STR,explain:STR},required:["wrong","correct","explain"]}};
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

async function gemini(env, sys, parts, schema, temp=0.2){
  const model = env.MODEL || "gemini-2.5-flash";
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method:"POST", headers:{"content-type":"application/json","x-goog-api-key":env.GEMINI_KEY},
    body: JSON.stringify({ systemInstruction:{parts:[{text:sys}]}, contents:[{role:"user",parts}],
      generationConfig:{ temperature:temp, responseMimeType:"application/json", responseSchema:schema } }) });
  const j = await r.json();
  if (!r.ok) throw new Error((j.error && j.error.message) || ("Gemini " + r.status));
  return JSON.parse(j.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("") || "{}");
}

// Ideal javobni tekshirish: 5/5 bo'lmasa tuzatiladi (2 martagacha)
async function verifyIdeals(env, list, crit){
  for (let round=0; round<2; round++){
    const todo = list.filter(x => !x.verified && x.text);
    if (!todo.length) break;
    const v = await gemini(env, VERIFY_SYS + "\n" + crit,
      [{text: todo.map(x => `=== ID ${x.id} — ${x.label} ===\nTask/question: ${x.context}\nModel answer:\n${x.text}`).join("\n\n")}], V_SCHEMA, 0.1);
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
    const imgs = await Promise.all(it.images.map(async im => im.k ? ({data: await env.KV.get(im.k)}) : im));
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

/* ================= ASOSIY ================= */
export default {
  async fetch(req, env){
    const origin = req.headers.get("Origin") || "";
    const allow = (env.ALLOWED_ORIGIN || "https://aok-ai97.github.io").split(",").map(s=>s.trim());
    const cors = {"Access-Control-Allow-Origin": allow.includes(origin) ? origin : allow[0],
      "Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"content-type","Vary":"Origin"};
    const out = (o, s=200) => new Response(JSON.stringify(o), {status:s, headers:{...cors,"content-type":"application/json; charset=utf-8"}});
    if (req.method === "OPTIONS") return new Response(null, {headers:cors});
    if (req.method !== "POST") return out({ok:true, service:"AOK checker", version:4, kv: !!env.KV});
    if (!allow.includes(origin)) return out({error:"Ruxsat yo'q (origin)."}, 403);
    if (!env.KV) return out({error:"KV ulanmagan (Cloudflare → Bindings → KV namespace, nomi: KV)."}, 500);
    let b; try { b = await req.json(); } catch { return out({error:"Noto'g'ri so'rov."}, 400); }
    const path = new URL(req.url).pathname;
    const kind = b.kind === "writing" ? "writing" : "speaking";
    try {
      /* ---------- O'QITUVCHI ---------- */
      if (path.startsWith("/teacher/")) {
        if (!env.TEACHER_CODE || (b.tcode||"").trim() !== env.TEACHER_CODE) return out({error:"O'qituvchi kodi noto'g'ri."}, 401);
        if (path === "/teacher/login") return out({ok:true, seeded: !!(await env.KV.get("seed:v1"))});
        if (path === "/teacher/bank") {
          const bank = await allBank(env, kind);
          const hw = JSON.parse(await env.KV.get("hw:"+kind) || "null");
          const exams = JSON.parse(await env.KV.get("exams") || "[]").filter(e => e.kind === kind);
          return out({bank, homework: hw, exams});
        }
        if (path === "/teacher/import") { // boshlang'ich baza
          const items = b.items || []; let added = 0, skipped = 0;
          for (const k of ["writing","speaking"]) for (const p of (k==="writing"?WPARTS:SPARTS)) {
            const arr = await getBank(env, k, p); const have = new Set(arr.map(x => norm(keyText(x))));
            for (const it of items.filter(x => x.kind===k && (x.part||x.wtype)===p)) {
              const key = norm(keyText(it)); if (have.has(key)) { skipped++; continue; }
              have.add(key); arr.push(it); added++;
            }
            await putBank(env, k, p, arr);
          }
          await env.KV.put("seed:v1", "1");
          return out({ok:true, added, skipped});
        }
        if (path === "/teacher/item/save") {
          const it = b.item || {}; const k = it.kind==="writing" ? "writing" : "speaking";
          const part = k==="writing" ? (it.wtype==="T2"?"T2":"T1") : (SPARTS.includes(it.part) ? it.part : "1.1");
          const clean_it = {id: it.id || uid(), kind:k, topic: clean(it.topic,60) || "Boshqa", created: it.created || Date.now()};
          if (k==="writing") { clean_it.wtype = part;
            if (part==="T1") Object.assign(clean_it, {sender:clean(it.sender,150)||"The manager sent you an email.", email:clean(it.email), t11:clean(it.t11,600), t12:clean(it.t12,600)});
            else clean_it.essay = clean(it.essay,1200);
          } else { clean_it.part = part; clean_it.q = (it.q||[]).map(x=>clean(x,600)).filter(Boolean).slice(0,3);
            if (part==="3") { clean_it.for = (it.for||[]).map(x=>clean(x,150)).filter(Boolean).slice(0,3); clean_it.against = (it.against||[]).map(x=>clean(x,150)).filter(Boolean).slice(0,3); }
          }
          if (!norm(keyText(clean_it))) return out({error:"Savol matni bo'sh."}, 400);
          const arr = await getBank(env, k, part);
          const key = norm(keyText(clean_it));
          const dup = arr.find(x => x.id !== clean_it.id && norm(keyText(x)) === key);
          if (dup) return out({error:`Bu savol bazada BOR (mavzu: ${dup.topic}). Takrorlanmagan savol kiriting.`, duplicate:dup.id}, 409);
          // rasmlar: yangi yuklanganlari alohida kalitda
          const old = arr.find(x => x.id === clean_it.id);
          const imgs = [];
          for (const im of (it.images||[]).slice(0, part==="1.2"?2:1)) {
            if (im.url || im.k) imgs.push(im.url ? {url:im.url} : {k:im.k});
            else if (im.data) { const ik = "img:"+uid(); await env.KV.put(ik, im.data); imgs.push({k:ik}); }
          }
          if (k==="speaking" && (part==="1.2"||part==="2")) clean_it.images = imgs;
          if (old) for (const im of (old.images||[])) if (im.k && !imgs.some(x=>x.k===im.k)) await env.KV.delete(im.k);
          const i = arr.findIndex(x => x.id === clean_it.id);
          if (i >= 0) arr[i] = clean_it; else arr.push(clean_it);
          await putBank(env, k, part, arr);
          if (b.homework) await env.KV.put("hw:"+k, JSON.stringify({title: clean(b.homework,120) || clean_it.topic, ids:[clean_it.id], at: Date.now()}));
          return out({ok:true, item: clean_it});
        }
        if (path === "/teacher/item/delete") {
          for (const p of (kind==="writing"?WPARTS:SPARTS)) { const arr = await getBank(env, kind, p); const it = arr.find(x=>x.id===b.id);
            if (it) { for (const im of (it.images||[])) if (im.k) await env.KV.delete(im.k); await putBank(env, kind, p, arr.filter(x=>x.id!==b.id)); } }
          return out({ok:true});
        }
        if (path === "/teacher/homework") {
          let ids = (b.ids||[]);
          const old = JSON.parse(await env.KV.get("hw:"+kind) || "null");
          if (b.append && old) ids = [...new Set([...old.ids, ...ids])];
          await env.KV.put("hw:"+kind, JSON.stringify({title: clean(b.title,120) || (old&&b.append?old.title:"") || "Uyga vazifa", ids: ids.slice(0,20), at: Date.now()})); return out({ok:true, count: ids.length}); }
        if (path === "/teacher/audio") { const v = await env.KV.get(clean(b.key,60)); return v ? out({clips: JSON.parse(v)}) : out({error:"Ovoz o'chirilgan (1 kundan keyin avtomatik o'chadi)."}, 404); }
        if (path === "/teacher/exam/save") {
          const exams = JSON.parse(await env.KV.get("exams") || "[]");
          const e = {id: b.id || uid(), kind, name: clean(b.name,80) || "Exam", ids:(b.ids||[]).slice(0,500), active: b.active !== false, at: Date.now()};
          const i = exams.findIndex(x=>x.id===e.id); if (i>=0) exams[i] = {...exams[i], ...e}; else exams.push(e);
          await env.KV.put("exams", JSON.stringify(exams)); return out({ok:true, exam:e});
        }
        if (path === "/teacher/exam/delete") { const exams = JSON.parse(await env.KV.get("exams") || "[]"); await env.KV.put("exams", JSON.stringify(exams.filter(x=>x.id!==b.id))); return out({ok:true}); }
        if (path === "/teacher/results") {
          const res = []; let cursor;
          do { const l = await env.KV.list({prefix:"r:"+kind+":", cursor}); res.push(...l.keys.map(k=>({key:k.name, ...(k.metadata||{})}))); cursor = l.list_complete ? null : l.cursor; } while (cursor);
          return out({results: res.sort((x,y)=>(y.at||0)-(x.at||0))});
        }
        if (path === "/teacher/result") { const v = await env.KV.get(b.key); return v ? out(JSON.parse(v)) : out({error:"Topilmadi."},404); }
        if (path === "/teacher/delresult") { await env.KV.delete(b.key); return out({ok:true}); }
        return out({error:"Noma'lum manzil."}, 404);
      }

      /* ---------- O'QUVCHI ---------- */
      if (!env.CLASS_CODE || (b.code||"").trim() !== env.CLASS_CODE) return out({error:"Sinf kodi noto'g'ri."}, 401);

      if (path === "/home") {
        const bank = await allBank(env, kind);
        const hw = JSON.parse(await env.KV.get("hw:"+kind) || "null");
        const exams = JSON.parse(await env.KV.get("exams") || "[]").filter(e => e.kind===kind && e.active).map(e => ({id:e.id, name:e.name, at:e.at}));
        const counts = {}, topics = {};
        for (const p in bank) { counts[p] = bank[p].length; for (const it of bank[p]) topics[it.topic] = (topics[it.topic]||0) + 1; }
        let homework = null;
        if (hw && hw.ids && hw.ids.length) homework = {title: hw.title, at: hw.at, items: await withImages(env, await findItems(env, kind, hw.ids))};
        return out({homework, exams, counts, topics});
      }
      if (path === "/start") {
        const bank = await allBank(env, kind);
        const order = kind==="writing" ? WPARTS : SPARTS;
        let items;
        if (b.mode === "exam") {
          const e = JSON.parse(await env.KV.get("exams") || "[]").find(x => x.id === b.exam && x.kind === kind);
          if (!e) return out({error:"Imtihon topilmadi."}, 404);
          items = compose(kind, bank, order, e.ids);
          if (!items.length) return out({error:"Bu imtihonda savol yo'q."}, 400);
          return out({title: e.name, items: await withImages(env, items)});
        }
        const secs = (b.sections||[]).filter(s => order.includes(s)); if (!secs.length) return out({error:"Bo'lim tanlang."}, 400);
        items = compose(kind, bank, order.filter(s => secs.includes(s)), null, b.topic || "");
        if (!items.length) return out({error:"Bu bo'limda hali savol yo'q."}, 400);
        return out({title: "Baza" + (b.topic ? " · " + b.topic : ""), items: await withImages(env, items)});
      }

      if (path === "/writing") {
        const items = await findItems(env, "writing", b.ids || []);
        const ctx = items.map(it => it.wtype==="T1"
          ? `TASK 1 — ${it.sender}\nEmail:\n${it.email}\nTask 1.1: ${it.t11}\nTask 1.2: ${it.t12}`
          : `TASK 2 — Essay question: ${it.essay}`).join("\n\n") || "(no question given)";
        const imgs = (b.images||[]).slice(0,8);
        if (!imgs.length && !b.text) return out({error:"Rasm yuklang."}, 400);
        const parts = [{text: ctx}];
        imgs.forEach((im,i) => { parts.push({text:`Photo ${i+1}:`}); parts.push({inline_data:{mime_type:im.mime||"image/jpeg", data:im.data}}); });
        if (b.text) parts.push({text:"Typed answer:\n" + clean(b.text, 6000)});
        const r = await gemini(env, WRITING_SYS, parts, W_SCHEMA);
        if (!r.tasks || !r.tasks.length) return out({error:"Rasmda javob topilmadi. Yorug' joyda, tekis qilib qayta rasmga oling."}, 422);
        r.tasks.forEach(fixTask);
        const expected = items.flatMap(it => it.wtype==="T1" ? ["1.1","1.2"] : ["2"]);
        for (const t of [...new Set(expected)]) if (!r.tasks.some(x => x.task === t))
          r.tasks.push({task:t, missing:true, on_topic:true, topic_check:"", transcript:"", word_count:0, errors:[], overall:0, ideal:"", max_tips:["Bu Task'ni ham yozing — yozilmagan Task 0 ball oladi."],
            criteria:["Task Response","Coherence & Cohesion","Lexical Resource","Grammatical Range & Accuracy","Imlo xato"].map(n=>({name:n,score:0,comment:"Javob berilmagan."}))});
        r.tasks.sort((a,b) => ["1.1","1.2","2"].indexOf(a.task) - ["1.1","1.2","2"].indexOf(b.task));
        // ideal javoblarni tekshirish
        const v = await verifyIdeals(env, r.tasks.map((t,i) => ({id:String(i), label:"Task "+t.task, context: ctx, text:t.missing?"":t.ideal})), W_CRIT);
        v.forEach((x,i) => { r.tasks[i].ideal = x.text; r.tasks[i].ideal_verified = !!x.verified; });
        r.total = r.tasks.reduce((a,t)=>a+t.overall,0); r.max = r.tasks.length*5;
        r.kind = "writing"; r.mode = clean(b.mode,10); r.title = clean(b.title,120); r.at = Date.now();
        const sc = {}; r.tasks.forEach(t => sc["t"+t.task.replace(".","")] = t.overall);
        await env.KV.put(`r:writing:${r.at}`, JSON.stringify(r), {metadata:{name:r.student_name, mode:r.mode, title:r.title, total:r.total, max:r.max, off:r.tasks.some(t=>t.on_topic===false), miss:r.tasks.some(t=>t.missing), at:r.at, ...sc}});
        r.saved = true;
        return out(r);
      }

      if (path === "/speaking") {
        const clips = (b.clips||[]).slice(0,12).filter(c => c.audio);
        if (!clips.length) return out({error:"Audio yo'q."}, 400);
        const parts = [];
        clips.forEach((c,i) => { parts.push({text:`Clip ${i+1} — Part ${c.part} — Question: ${clean(c.question,800)}${c.empty?" (the recording is almost empty)":""}`}); parts.push({inline_data:{mime_type:(c.mime||"audio/webm").split(";")[0], data:c.audio}}); });
        const r = await gemini(env, SPEAKING_SYS, parts, S_SCHEMA);
        r.parts = r.parts || [];
        const nq = {}; clips.forEach(c => nq[c.part] = (nq[c.part]||0) + 1);
        const emptyQ = {}; clips.forEach(c => { if (c.empty) (emptyQ[c.part] = emptyQ[c.part]||[]).push(c.question); });
        for (const pt of Object.keys(nq)) if (!r.parts.some(x => x.part === pt)) // AI umuman qaytarmagan qism
          r.parts.push({part:pt, question:clips.filter(c=>c.part===pt).map(c=>c.question).join(" / "), transcript:"[javob yo'q]", unanswered:clips.filter(c=>c.part===pt).map(c=>c.question), errors:[], criteria:["Fluency & Coherence","Lexical Resource","Grammatical Range & Accuracy","Pronunciation","Task Response"].map(n=>({name:n,score:0,comment:"Javob berilmagan."})), overall:0, ideal:"", max_tips:["Har bir savolga javob bering — jim qolgan savol 0 ball oladi."]});
        r.parts.sort((a,b) => SPARTS.indexOf(a.part) - SPARTS.indexOf(b.part));
        for (const p of r.parts) {
          fixTask(p);
          const un = [...new Set([...(p.unanswered||[]), ...(emptyQ[p.part]||[])])]; p.unanswered = un;
          const tot = nq[p.part] || 1, frac = Math.max(0, 1 - un.length / tot);
          if (un.length) {
            const tr = p.criteria.find(c => /task/i.test(c.name));
            if (frac <= 0) { p.criteria.forEach(c => { c.score = 0; c.comment = "Javob berilmagan. " + c.comment; }); p.overall = 0; }
            else { if (tr) { tr.score = Math.min(tr.score, half(5*frac)); tr.comment = `${un.length} ta savolga javob bermadingiz — har bir savolga javob bering. ` + tr.comment; }
                   p.overall = half(p.criteria.reduce((a,c)=>a+c.score,0) / p.criteria.length * frac); }
          }
        }
        const v = await verifyIdeals(env, (r.parts||[]).map((p,i) => ({id:String(i), label:"Part "+p.part, context:p.question, text:p.overall>0?p.ideal:""})), S_CRIT.replace(/"Pronunciation"[^,]*,/, ""));
        v.forEach((x,i) => { r.parts[i].ideal = x.text; r.parts[i].ideal_verified = !!x.verified; });
        r.overall = half((r.parts||[]).reduce((a,p)=>a+p.overall,0) / ((r.parts||[]).length||1));
        r.kind = "speaking"; r.student_name = clean(b.name,80) || "Noma'lum"; r.mode = clean(b.mode,10); r.title = clean(b.title,120); r.at = Date.now();
        r.audio_key = `aud:${r.at}`; r.audio_until = r.at + 86400000;
        await env.KV.put(r.audio_key, JSON.stringify(clips.map(c => ({mime:c.mime, audio:c.audio}))), {expirationTtl: 86400}); // 1 kundan keyin o'chadi
        await env.KV.put(`r:speaking:${r.at}`, JSON.stringify(r), {metadata:{name:r.student_name, mode:r.mode, title:r.title, total:r.overall, max:5, parts:(r.parts||[]).map(p=>p.part).join(","), miss:(r.parts||[]).some(p=>(p.unanswered||[]).length), at:r.at}});
        r.saved = true;
        return out(r);
      }

      if (path === "/pron") {
        if (!b.audio || !b.word) return out({error:"So'z yoki audio yo'q."}, 400);
        const r = await gemini(env, PRON_SYS, [{text:`Target word: "${clean(b.word,60)}"`}, {inline_data:{mime_type:(b.mime||"audio/webm").split(";")[0], data:b.audio}}], P_SCHEMA, 0.1);
        r.score = Math.max(0, Math.min(100, Math.round(+r.score || 0)));
        return out(r);
      }
      return out({error:"Noma'lum manzil."}, 404);
    } catch (e) { return out({error: "AI xatosi: " + e.message}, 502); }
  }
};
