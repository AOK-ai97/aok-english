/* AOK English — Writing & Speaking Checker */
(()=>{
const API=(window.AOK_API||"").replace(/\/$/,"");
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const ls={get:k=>{try{return localStorage.getItem(k)||""}catch(e){return""}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt=x=>(Math.round(x*2)/2).toString();
const msg=(t,err)=>{const m=$("#ckMsg");m.hidden=!t;m.className="ck-msg"+(err?" err":"");m.textContent=t||""};
const initials=n=>(n||"?").trim().split(/\s+/).map(w=>w[0]).join("").slice(0,2).toUpperCase();
// sinf kodi + ism eslab qolinadi
["code","name"].forEach(k=>{const el=$("#ck_"+k);if(el){el.value=ls.get("aok_"+k);el.addEventListener("change",()=>ls.set("aok_"+k,el.value.trim()))}});
if(!API) msg("⚙️ Checker hali ulanmagan (server manzili sozlanmagan). O'qituvchiga murojaat qiling.",true);

async function post(path,body){
  if(!API) throw new Error("Checker hali ulanmagan.");
  const r=await fetch(API+path,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
  let j={};try{j=await r.json()}catch(e){}
  if(!r.ok||j.error) throw new Error(j.error||("Server xatosi "+r.status));
  return j;
}
function loading(on,btn,t){btn.disabled=on;const L=$("#ckLoad");L.hidden=!on;if(t)L.querySelector("span").textContent=t}

/* ---------- report ---------- */
function crTable(t){
  return `<table class="rep-tb"><tr><th>Kategoriya</th><th>Ball</th><th>Xatolar va yuqori ball olish uchun tavsiya</th></tr>`+
   t.criteria.map(c=>`<tr><td>${esc(c.name)}</td><td>${fmt(c.score)} / 5</td><td>${esc(c.comment)}</td></tr>`).join("")+
   `<tr class="ov"><td>OVERALL</td><td>${fmt(t.overall)} / 5</td><td>${esc(t.label)} bo'yicha umumiy baho</td></tr></table>`;
}
function errList(e){ if(!e.length) return `<p>✅ Xato topilmadi.</p>`;
  return `<ol class="rep-err">`+e.map(x=>`<li><span class="w">${esc(x.wrong)}</span> → <span class="c">${esc(x.correct)}</span><span class="x">${esc(x.explain)}</span></li>`).join("")+`</ol>`}
const TASKS={"1.1":"Do'stga norasmiy xat · ~50 so'z","1.2":"Rasmiy xat · 120–150 so'z"};
function renderWriting(d,name){
  const tasks=d.tasks||[];const sc=tasks.map(t=>`Task ${esc(t.task)}: <b>${fmt(t.overall)}</b>`).join(" · ");
  const max=tasks.length*5;
  let h=`<div class="rep" id="rep"><div class="rep-h"><div class="rep-badge">${esc(initials(name))}</div><div><h2>${esc(name||"O'quvchi")}</h2>
   <div class="sub">Writing · ${esc(d.topic_uz||"")} · ${sc} · Jami: <b>${fmt(d.total||0)} / ${max}</b></div></div></div>`;
  tasks.forEach(t=>{t.label="Task "+t.task;
    h+=`<div class="rep-t"><b>Task ${esc(t.task)}</b><span>${esc(TASKS[t.task]||"")}</span><em>${t.word_count} so'z</em></div>
    <div class="rep-l">Yozgan matni (o'zgarishsiz)</div><div class="rep-txt">${esc(t.transcript)}</div>
    <div class="rep-l">Xatolar va to'g'ri varianti</div>${errList(t.errors||[])}${crTable(t)}`});
  h+=`<div class="rep-acts" data-html2canvas-ignore><button class="pri" id="saveImg">📷 Rasm sifatida saqlash</button><button id="again">🔁 Yana tekshirish</button></div></div>`;
  show(h,(name||"oquvchi")+"_Writing");
}
function renderSpeaking(d,name,part,q){
  d.label="Part "+part;
  let h=`<div class="rep" id="rep"><div class="rep-h"><div class="rep-badge">${esc(initials(name))}</div><div><h2>${esc(name||"O'quvchi")}</h2>
   <div class="sub">Speaking · Part ${esc(part)} · Overall: <b>${fmt(d.overall)} / 5</b></div></div></div>
   <div class="rep-t"><b>Part ${esc(part)}</b><span>${esc(q||"")}</span></div>
   <div class="rep-l">Aytgan gaplari (o'zgarishsiz)</div><div class="rep-txt">${esc(d.transcript)}</div>
   <div class="rep-l">Xatolar va to'g'ri varianti</div>${errList(d.errors||[])}${crTable(d)}
   <div class="rep-l">Yaxshiroq javob namunasi</div><div class="rep-better">${esc(d.better_answer)}</div>
   <div class="rep-acts" data-html2canvas-ignore><button class="pri" id="say">🔊 Feedbackni tinglash</button><button id="saveImg">📷 Rasm sifatida saqlash</button><button id="again">🔁 Yana tekshirish</button></div></div>`;
  show(h,(name||"oquvchi")+"_Speaking");
  $("#say").onclick=()=>{try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(d.spoken_feedback);u.lang="en-GB";u.rate=.95;
    const v=speechSynthesis.getVoices().find(v=>/en-GB/i.test(v.lang))||speechSynthesis.getVoices().find(v=>/^en/i.test(v.lang));if(v)u.voice=v;speechSynthesis.speak(u)}catch(e){alert(d.spoken_feedback)}};
}
function show(h,fname){const R=$("#ckResult");R.innerHTML=h;R.hidden=false;$("#ckForm").hidden=true;R.scrollIntoView({behavior:"smooth"});
  $("#again").onclick=()=>{R.hidden=true;$("#ckForm").hidden=false;window.scrollTo({top:0,behavior:"smooth"})};
  $("#saveImg").onclick=async()=>{const b=$("#saveImg");b.disabled=true;try{const c=await html2canvas($("#rep"),{scale:2,backgroundColor:"#ffffff"});
    const a=document.createElement("a");a.download=fname.replace(/\s+/g,"_")+".png";a.href=c.toDataURL("image/png");a.click()}catch(e){alert("Rasm saqlanmadi: "+e.message)}b.disabled=false};
}

/* ---------- WRITING ---------- */
function compress(file){return new Promise((res,rej)=>{const img=new Image();const u=URL.createObjectURL(file);
  img.onload=()=>{const m=1700,k=Math.min(1,m/Math.max(img.width,img.height));const c=document.createElement("canvas");c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);
    c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);const d=c.toDataURL("image/jpeg",.85);res({mime:"image/jpeg",data:d.split(",")[1],thumb:d})};
  img.onerror=()=>rej(new Error("Rasm ochilmadi"));img.src=u})}
const IMGS={"1.1":[],"1.2":[]};
$$("[data-files]").forEach(inp=>inp.addEventListener("change",async()=>{const k=inp.dataset.files;
  for(const f of [...inp.files].slice(0,4-IMGS[k].length)){try{IMGS[k].push(await compress(f))}catch(e){msg(e.message,true)}}inp.value="";thumbs(k)}));
function thumbs(k){const box=$(`#th${k.replace(".","")}`);box.innerHTML="";IMGS[k].forEach((im,i)=>{const f=document.createElement("figure");
  f.innerHTML=`<img src="${im.thumb}" alt="rasm ${i+1}"><button type="button" aria-label="O'chirish">×</button>`;f.querySelector("button").onclick=()=>{IMGS[k].splice(i,1);thumbs(k)};box.appendChild(f)})}
const wBtn=$("#goWriting");
if(wBtn) wBtn.onclick=async()=>{
  msg("");const code=$("#ck_code").value.trim(),name=$("#ck_name").value.trim();
  if(!code) return msg("Sinf kodini kiriting.",true); if(!name) return msg("Ism familiyangizni yozing.",true);
  const tasks=["1.1","1.2"].map(k=>({task:k,text:$(`#tx${k.replace(".","")}`).value.trim(),images:IMGS[k].map(({mime,data})=>({mime,data}))})).filter(t=>t.text||t.images.length);
  if(!tasks.length) return msg("Kamida bitta Task uchun rasm yuklang yoki matn yozing.",true);
  ls.set("aok_code",code);ls.set("aok_name",name);
  loading(true,wBtn,"AI yozuvni o'qib, baholayapti… (20–60 soniya)");
  try{const d=await post("/writing",{code,name,prompt:$("#ck_prompt").value.trim(),tasks});renderWriting(d,name)}catch(e){msg("❌ "+e.message,true)}
  loading(false,wBtn);
};

/* ---------- SPEAKING ---------- */
const QS={"1.1":["Do you often go shopping? Why?","What is your favourite place in your town?","Do you prefer studying alone or with friends?"],
 "1.2":["Tell me what you can see in these pictures.","What are the advantages of studying in a classroom over studying online?"],
 "2":["Tell me about a teacher who helped you a lot. How did this teacher influence your life? Do you agree that a good teacher is more important than a good textbook?"],
 "3":["Homework should be banned at school. FOR: students feel tired; more free time; less stress. AGAINST: helps remember lessons; teaches responsibility; parents see what children learn."]};
const LIM={"1.1":30,"1.2":45,"2":120,"3":120};
const pSel=$("#ck_part"),qIn=$("#ck_q"),qList=$("#ck_qlist");
function fillQ(){const p=pSel.value;qList.innerHTML=QS[p].map(q=>`<option value="${esc(q)}">`).join("");qIn.value=QS[p][0];$("#recLim").textContent=LIM[p]+" soniya"}
if(pSel){pSel.onchange=fillQ;fillQ();}
let rec=null,chunks=[],blob=null,t0=0,tick=null;
const rb=$("#recBtn"),rt=$("#recTime"),ra=$("#recAudio");
function stopRec(){if(rec&&rec.state!=="inactive")rec.stop()}
if(rb) rb.onclick=async()=>{
  if(rec&&rec.state==="recording") return stopRec();
  try{const st=await navigator.mediaDevices.getUserMedia({audio:true});
    const mt=["audio/webm;codecs=opus","audio/mp4","audio/webm"].find(m=>window.MediaRecorder&&MediaRecorder.isTypeSupported(m))||"";
    rec=new MediaRecorder(st,mt?{mimeType:mt}:{});chunks=[];blob=null;
    rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);
    rec.onstop=()=>{st.getTracks().forEach(t=>t.stop());clearInterval(tick);rb.classList.remove("on");rb.textContent="🎤";
      blob=new Blob(chunks,{type:rec.mimeType||"audio/webm"});ra.src=URL.createObjectURL(blob);ra.hidden=false;$("#goSpeaking").disabled=false};
    rec.start();t0=Date.now();rb.classList.add("on");rb.textContent="⏹";ra.hidden=true;$("#goSpeaking").disabled=true;
    const lim=LIM[pSel.value];tick=setInterval(()=>{const s=Math.floor((Date.now()-t0)/1000);rt.textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;if(s>=lim)stopRec()},250);
  }catch(e){msg("Mikrofonga ruxsat bering: "+e.message,true)}
};
const sBtn=$("#goSpeaking");
if(sBtn) sBtn.onclick=async()=>{
  msg("");const code=$("#ck_code").value.trim(),name=$("#ck_name").value.trim();
  if(!code) return msg("Sinf kodini kiriting.",true); if(!name) return msg("Ism familiyangizni yozing.",true);
  if(!blob) return msg("Avval javobingizni yozib oling.",true);
  ls.set("aok_code",code);ls.set("aok_name",name);
  loading(true,sBtn,"AI javobingizni tinglab, baholayapti… (20–60 soniya)");
  try{const b64=await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result.split(",")[1]);fr.onerror=rej;fr.readAsDataURL(blob)});
    const d=await post("/speaking",{code,name,part:pSel.value,question:qIn.value.trim(),audio:b64,mime:blob.type});renderSpeaking(d,name,pSel.value,qIn.value.trim())}
  catch(e){msg("❌ "+e.message,true)}
  loading(false,sBtn);
};
})();
