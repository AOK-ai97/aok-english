// AOK English — Writing & Speaking Checker (Cloudflare Worker)
// Sozlamalar (Cloudflare → Worker → Settings → Variables):
//   GEMINI_KEY  (Secret)  — Google AI Studio kaliti
//   CLASS_CODE  (Secret)  — o'quvchilarga beriladigan sinf kodi
//   ALLOWED_ORIGIN        — https://aok-ai97.github.io
//   MODEL (ixtiyoriy)     — gemini-2.5-flash
const SCORE_RULES = `Score every category from 0 to 5 in steps of 0.5. Be strict and realistic for CEFR Multilevel (Uzbekistan) exam level:
5 = C1-like, almost no errors; 4 = strong B2; 3 = B1 (clear, some errors); 2 = A2 (many errors, meaning still clear); 1 = very weak / meaning often lost; 0 = no answer.
OVERALL for a task = average of its five category scores, rounded DOWN to the nearest 0.5.`;

const WRITING_SYS = `You are an experienced, strict but supportive CEFR Multilevel (Uzbekistan) WRITING examiner at AOK English / OFEDU.
Students upload photos of HANDWRITTEN letters. The photos may contain Task 1.1 and/or Task 1.2, in any order, a letter may continue on several photos.
Task 1.1 = informal letter to a friend, about 50 words. Task 1.2 = formal letter to a manager/director, 120-150 words.
First decide which letters are present: informal (Hi/Hey ..., Take care) = "1.1", formal (Dear Sir or Madam / Dear Manager ..., Yours faithfully) = "1.2". Return only the tasks that are really written, in order 1.1 then 1.2.
"student_name": the student's name taken from the signatures (prefer the FULL name from the Task 1.2 signature, else the name under Task 1.1). Write it in normal Latin spelling with capital letters (e.g. "Aziza Shovqiyeva"). If no name is written, return "Noma'lum".
For EACH task found:
1. "transcript": copy the student's text EXACTLY as written — keep every spelling, grammar and punctuation mistake, keep line breaks (use \\n). Ignore words that the student crossed out. Do NOT correct anything here.
2. "word_count": number of words in the transcript.
3. "errors": list EVERY mistake in order. "wrong" = the exact fragment from the transcript (a word, phrase or whole sentence), "correct" = the corrected fragment (fit the task and the email topic), "explain" = very short reason in UZBEK (Latin script), e.g. "'quite' — imlo; 'because' dan keyin sabab yo'q."
4. "criteria": exactly these 5, in this order, with names exactly: "Task Response", "Coherence & Cohesion", "Lexical Resource", "Grammatical Range & Accuracy", "Imlo xato". "comment" in UZBEK: what is wrong + one concrete tip how to get a higher score (1-2 sentences). Task Response also checks: answered both questions from the email, correct register, word count.
5. "overall": per the rules.
${SCORE_RULES}
"topic_uz": a 2-4 word Uzbek name of the email topic (e.g. "Yangi park mavzusi").
Answer ONLY with JSON matching the schema.`;

const SPEAKING_SYS = `You are an experienced, strict but supportive CEFR Multilevel (Uzbekistan) SPEAKING examiner at AOK English / OFEDU.
You receive the exam part, the question(s) and an AUDIO recording of the student's answer.
1. "transcript": write exactly what the student said (keep grammar mistakes; write [unclear] for unclear words; include fillers like "eee").
2. "errors": every grammar / vocabulary / pronunciation mistake: "wrong" (exact words said), "correct", "explain" (very short, UZBEK Latin).
3. "criteria": exactly these 5, in this order: "Fluency & Coherence", "Lexical Resource", "Grammatical Range & Accuracy", "Pronunciation", "Task Response". "comment" in UZBEK with one concrete tip.
4. "overall": per the rules. Consider the expected length: Part 1.1 ~30 s, Part 1.2 ~45 s, Part 2 ~2 min, Part 3 ~2 min (both sides + own opinion).
5. "better_answer": a model answer in English (B2 level, same ideas as the student) — 3-6 sentences.
6. "spoken_feedback": 3-4 short, warm sentences in simple ENGLISH that a teacher would say aloud: main strength, two main problems, one tip.
${SCORE_RULES}
Answer ONLY with JSON matching the schema.`;

const ERR = {type:"ARRAY",items:{type:"OBJECT",properties:{wrong:{type:"STRING"},correct:{type:"STRING"},explain:{type:"STRING"}},required:["wrong","correct","explain"]}};
const CRIT = {type:"ARRAY",items:{type:"OBJECT",properties:{name:{type:"STRING"},score:{type:"NUMBER"},comment:{type:"STRING"}},required:["name","score","comment"]}};
const W_SCHEMA = {type:"OBJECT",properties:{student_name:{type:"STRING"},topic_uz:{type:"STRING"},tasks:{type:"ARRAY",items:{type:"OBJECT",properties:{
  task:{type:"STRING"},transcript:{type:"STRING"},word_count:{type:"INTEGER"},errors:ERR,criteria:CRIT,overall:{type:"NUMBER"}},
  required:["task","transcript","word_count","errors","criteria","overall"]}}},required:["student_name","topic_uz","tasks"]};
const S_SCHEMA = {type:"OBJECT",properties:{transcript:{type:"STRING"},errors:ERR,criteria:CRIT,overall:{type:"NUMBER"},
  better_answer:{type:"STRING"},spoken_feedback:{type:"STRING"}},required:["transcript","errors","criteria","overall","better_answer","spoken_feedback"]};

const half = x => Math.floor(Math.max(0, Math.min(5, +x || 0)) * 2) / 2;
function fixScores(o){ // ballarni qoidaga keltirish
  const fix = t => { t.criteria.forEach(c => c.score = half(c.score));
    t.overall = half(t.criteria.reduce((a,c)=>a+c.score,0) / (t.criteria.length||1)); return t; };
  if (o.tasks) { o.tasks.forEach(fix); o.total = o.tasks.reduce((a,t)=>a+t.overall,0); } else fix(o);
  return o;
}

async function gemini(env, sys, parts, schema){
  const model = env.MODEL || "gemini-2.5-flash";
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method:"POST", headers:{"content-type":"application/json","x-goog-api-key":env.GEMINI_KEY},
    body: JSON.stringify({ systemInstruction:{parts:[{text:sys}]}, contents:[{role:"user",parts}],
      generationConfig:{ temperature:0.2, responseMimeType:"application/json", responseSchema:schema } }) });
  const j = await r.json();
  if (!r.ok) throw new Error((j.error && j.error.message) || ("Gemini " + r.status));
  const txt = j.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("") || "";
  return JSON.parse(txt);
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);
const clean = (x, n=4000) => String(x||"").slice(0,n);
async function listAssign(env){
  const l = await env.KV.list({prefix:"a:"});
  const items = await Promise.all(l.keys.map(async k => { try { return JSON.parse(await env.KV.get(k.name)); } catch { return null; } }));
  return items.filter(Boolean).sort((a,b)=>b.created-a.created).slice(0,20);
}
async function getAssign(env,id){ if(!id) return null; const v = await env.KV.get("a:"+id); return v ? JSON.parse(v) : null; }
function promptOf(a){
  if(!a) return "(not given)";
  return `Topic: ${a.title}\nEmail the students received:\n${a.email}\n\nTask 1.1 instruction: ${a.t11||"-"}\nTask 1.2 instruction: ${a.t12||"-"}`;
}

export default {
  async fetch(req, env){
    const origin = req.headers.get("Origin") || "";
    const allow = (env.ALLOWED_ORIGIN || "https://aok-ai97.github.io").split(",").map(s=>s.trim());
    const cors = {"Access-Control-Allow-Origin": allow.includes(origin) ? origin : allow[0],
      "Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"content-type","Vary":"Origin"};
    const out = (o, s=200) => new Response(JSON.stringify(o), {status:s, headers:{...cors,"content-type":"application/json; charset=utf-8"}});
    if (req.method === "OPTIONS") return new Response(null, {headers:cors});
    if (req.method !== "POST") return out({ok:true, service:"AOK checker", kv: !!env.KV});
    if (!allow.includes(origin)) return out({error:"Ruxsat yo'q (origin)."}, 403);
    let b; try { b = await req.json(); } catch { return out({error:"Noto'g'ri so'rov."}, 400); }
    const path = new URL(req.url).pathname;
    const needKV = () => { if (!env.KV) throw new Error("KV ulanmagan (Cloudflare → Bindings → KV, nomi: KV)."); };
    try {
      // ---------- O'QITUVCHI ----------
      if (path.startsWith("/teacher/")) {
        if (!env.TEACHER_CODE || (b.tcode||"").trim() !== env.TEACHER_CODE) return out({error:"O'qituvchi kodi noto'g'ri."}, 401);
        needKV();
        if (path === "/teacher/login") return out({ok:true});
        if (path === "/teacher/save") {
          const id = b.id || uid();
          const old = await getAssign(env, b.id);
          const a = {id, title:clean(b.title,120)||"Topshiriq", email:clean(b.email), t11:clean(b.t11,600), t12:clean(b.t12,600),
            speaking:(b.speaking||[]).slice(0,10).map(x=>({part:clean(x.part,4), q:clean(x.q,600)})).filter(x=>x.q),
            created: old ? old.created : Date.now()};
          await env.KV.put("a:"+id, JSON.stringify(a));
          return out({ok:true, assignment:a});
        }
        if (path === "/teacher/list") return out({assignments: await listAssign(env)});
        if (path === "/teacher/delete") { await env.KV.delete("a:"+b.id); return out({ok:true}); }
        if (path === "/teacher/results") {
          const l = await env.KV.list({prefix:"r:"+b.id+":"});
          return out({results: l.keys.map(k=>({key:k.name, ...(k.metadata||{})})).sort((x,y)=>(y.at||0)-(x.at||0))});
        }
        if (path === "/teacher/result") { const v = await env.KV.get(b.key); return v ? out(JSON.parse(v)) : out({error:"Topilmadi."},404); }
        if (path === "/teacher/delresult") { await env.KV.delete(b.key); return out({ok:true}); }
        return out({error:"Noma'lum manzil."}, 404);
      }
      // ---------- O'QUVCHI ----------
      if (!env.CLASS_CODE || (b.code||"").trim() !== env.CLASS_CODE) return out({error:"Sinf kodi noto'g'ri."}, 401);
      if (path === "/assignments") { needKV(); return out({assignments: await listAssign(env)}); }
      if (path === "/writing") {
        const a = env.KV ? await getAssign(env, b.aid) : null;
        const imgs = (b.images||[]).slice(0,6);
        const parts = [{text: promptOf(a) + (b.prompt ? `\n${b.prompt}` : "")}];
        imgs.forEach((im,i) => { parts.push({text:`Photo ${i+1}:`}); parts.push({inline_data:{mime_type:im.mime||"image/jpeg", data:im.data}}); });
        for (const t of (b.tasks||[])) if (t && t.text) parts.push({text:`Typed Task ${t.task} answer:\n${t.text}`});
        if (parts.length < 2) return out({error:"Rasm yuklang."}, 400);
        const r = fixScores(await gemini(env, WRITING_SYS, parts, W_SCHEMA));
        if (!r.tasks || !r.tasks.length) return out({error:"Rasmda xat topilmadi. Aniqroq, yorug' joyda qayta rasmga oling."}, 422);
        r.kind = "writing"; r.aid = b.aid || ""; r.title = a ? a.title : ""; r.at = Date.now();
        if (env.KV && b.aid) {
          const sc = {}; r.tasks.forEach(t => sc["t"+t.task.replace(".","")] = t.overall);
          await env.KV.put(`r:${b.aid}:${r.at}`, JSON.stringify(r), {metadata:{kind:"writing", name:r.student_name, at:r.at, total:r.total, max:r.tasks.length*5, ...sc}});
          r.saved = true;
        }
        return out(r);
      }
      if (path === "/speaking") {
        if (!b.audio) return out({error:"Audio yo'q."}, 400);
        const parts = [{text:`Exam part: ${b.part}\nQuestion(s): ${b.question||"(not given)"}`},
                       {inline_data:{mime_type:(b.mime||"audio/webm").split(";")[0], data:b.audio}}];
        const r = fixScores(await gemini(env, SPEAKING_SYS, parts, S_SCHEMA));
        r.kind = "speaking"; r.student_name = clean(b.name,80) || "Noma'lum"; r.part = b.part; r.question = clean(b.question,600); r.aid = b.aid || ""; r.at = Date.now();
        if (env.KV && b.aid) { await env.KV.put(`r:${b.aid}:${r.at}`, JSON.stringify(r), {metadata:{kind:"speaking", name:r.student_name, at:r.at, part:b.part, total:r.overall, max:5}}); r.saved = true; }
        return out(r);
      }
      return out({error:"Noma'lum manzil."}, 404);
    } catch (e) { return out({error:(e.message||"").startsWith("KV") ? e.message : "AI xatosi: " + e.message}, 502); }
  }
};
