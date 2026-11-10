/* AOK English — AI Checker v3 (writing · speaking · teacher) */
(()=>{
const API=(window.AOK_API||"").replace(/\/$/,"");
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const ls={get:k=>{try{return localStorage.getItem(k)||""}catch(e){return""}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt=x=>(Math.round((+x||0)*2)/2).toString();
const initials=n=>(n||"?").trim().split(/\s+/).map(w=>w[0]).join("").slice(0,2).toUpperCase();
const dt=t=>{try{return new Date(t).toLocaleString("uz-UZ",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}catch(e){return""}};
const PAGE=document.body.dataset.ck;
const MODES={hw:"📌 Vazifa",baza:"📚 Baza",exam:"📝 Exam"};
const PNAME={"1.1":"Part 1.1","1.2":"Part 1.2","2":"Part 2","3":"Part 3",T1:"Task 1 (1.1 + 1.2)",T2:"Task 2 (Essay)"};
function msg(t,err){const m=$("#ckMsg");if(!m)return;m.hidden=!t;m.className="ck-msg"+(err?" err":"");m.textContent=t||"";if(t)m.scrollIntoView({block:"nearest"})}
function loading(on,btn,t){if(btn)btn.disabled=on;const L=$("#ckLoad");if(!L)return;L.hidden=!on;if(t)L.querySelector("span").textContent=t}
async function post(path,body){
  if(!API) throw new Error("Checker hali ulanmagan.");
  const r=await fetch(API+path,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
  let j={};try{j=await r.json()}catch(e){}
  if(!r.ok||j.error) throw new Error(j.error||("Server xatosi "+r.status));
  return j;
}
const step=n=>{$$("[data-step]").forEach(e=>e.hidden=e.dataset.step!==String(n));window.scrollTo({top:0,behavior:"smooth"})};
const imgSrc=im=>im.url?im.url:(im.data?("data:image/jpeg;base64,"+im.data):"");
const b64=blob=>new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result.split(",")[1]);fr.onerror=rej;fr.readAsDataURL(blob)});
function compress(file,max=1800,q=.85){return new Promise((res,rej)=>{const img=new Image();const u=URL.createObjectURL(file);
  img.onload=()=>{const k=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement("canvas");c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);
    c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);const d=c.toDataURL("image/jpeg",q);res({mime:"image/jpeg",data:d.split(",")[1],thumb:d})};
  img.onerror=()=>rej(new Error("Rasm ochilmadi"));img.src=u})}
function beep(f=880,ms=220){try{const A=window._ac||(window._ac=new (window.AudioContext||window.webkitAudioContext)());const o=A.createOscillator(),g=A.createGain();o.frequency.value=f;o.connect(g);g.connect(A.destination);g.gain.setValueAtTime(.18,A.currentTime);o.start();o.stop(A.currentTime+ms/1000)}catch(e){}}
function sayWord(w){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(w);u.lang="en-GB";u.rate=.8;
  const vs=speechSynthesis.getVoices();const v=vs.find(v=>/en-GB/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang));if(v)u.voice=v;speechSynthesis.speak(u)}catch(e){}}

/* ================= SAVOL KARTASI (imtihon ko'rinishi) ================= */
function itemHTML(it,i){
  if(it.kind==="writing"){
    if(it.wtype==="T1") return `<div class="ex-card"><div class="ex-h">Task 1 · Email</div><p class="ex-s">${esc(it.sender)}</p><div class="ck-mail">${esc(it.email)}</div>
      <p><b>Task 1.1</b> ${esc(it.t11)}</p><p><b>Task 1.2</b> ${esc(it.t12)}</p></div>`;
    return `<div class="ex-card"><div class="ex-h">Task 2 · Essay</div><p>${esc(it.essay)}</p></div>`;
  }
  const im=(it.images||[]).map(x=>`<img src="${esc(imgSrc(x))}" alt="">`).join("");
  if(it.part==="3") return `<div class="ex-card"><div class="ex-h">Part 3</div><p class="ex-big">${esc(it.q[0])}</p>${p3table(it)}</div>`;
  return `<div class="ex-card"><div class="ex-h">${PNAME[it.part]}</div>${im?`<div class="ex-imgs n${(it.images||[]).length}">${im}</div>`:""}<ol>${(it.q||[]).map(q=>`<li>${esc(q)}</li>`).join("")}</ol></div>`;
}
const p3table=it=>`<table class="p3t"><tr><th>✅ FOR</th><th>❌ AGAINST</th></tr>${[0,1,2].map(i=>`<tr><td>${esc((it.for||[])[i]||"")}</td><td>${esc((it.against||[])[i]||"")}</td></tr>`).join("")}</table>`;

/* ================= HISOBOT (feedback) ================= */
const crTable=(t,label)=>`<table class="rep-tb"><tr><th>Kategoriya</th><th>Ball</th><th>Xatolar va 5 ball olish uchun tavsiya</th></tr>`+
  (t.criteria||[]).map(c=>`<tr><td>${esc(c.name)}</td><td>${fmt(c.score)} / 5</td><td>${esc(c.comment)}</td></tr>`).join("")+
  `<tr class="ov"><td>OVERALL</td><td>${fmt(t.overall)} / 5</td><td>${esc(label)} bo'yicha umumiy baho</td></tr></table>`;
const errList=e=>(!e||!e.length)?`<p>✅ Xato topilmadi.</p>`:`<ol class="rep-err">`+e.map(x=>`<li><span class="w">${esc(x.wrong)}</span> → <span class="c">${esc(x.correct)}</span><span class="x">${esc(x.explain)}</span></li>`).join("")+`</ol>`;
const idealBlock=t=>t.ideal?`<div class="rep-l">⭐ Ideal javob (5/5) ${t.ideal_verified?'<span class="vbadge">✓ qayta tekshirildi</span>':''}</div><div class="rep-better">${esc(t.ideal)}</div>
  ${(t.max_tips||[]).length?`<div class="rep-l">🎯 5 ball olish uchun nima qilish kerak</div><ol class="rep-tips">${t.max_tips.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>`:""}`:"";
const TASKS={"1.1":"Do'stga norasmiy xat · ~50 so'z","1.2":"Rasmiy xat · 120–150 so'z","2":"Essay · ~180 so'z"};
function reportHTML(d){
  const name=d.student_name||"O'quvchi";const mode=(MODES[d.mode]||"")+(d.title?" · "+d.title:"");
  if(d.kind==="speaking"){
    let h=`<div class="rep" id="rep"><div class="rep-h"><div class="rep-badge">${esc(initials(name))}</div><div><h2>${esc(name)}</h2>
     <div class="sub">Speaking · ${esc(mode)} · ${(d.parts||[]).map(p=>`Part ${esc(p.part)}: <b>${fmt(p.overall)}</b>`).join(" · ")} · Overall: <b>${fmt(d.overall)} / 5</b></div></div></div>
     ${d.summary_uz?`<div class="rep-sum">${esc(d.summary_uz)}</div>`:""}`;
    (d.parts||[]).forEach(p=>{h+=`<div class="rep-t"><b>Part ${esc(p.part)}</b><span>${esc(p.question||"")}</span></div>
      <div class="rep-l">Aytgan gaplari (o'zgarishsiz)</div><div class="rep-txt">${esc(p.transcript)}</div>
      <div class="rep-l">Xatolar va to'g'ri varianti</div>${errList(p.errors)}${crTable(p,"Part "+p.part)}${idealBlock(p)}`});
    return h+`</div>`;
  }
  const tasks=d.tasks||[];
  let h=`<div class="rep" id="rep"><div class="rep-h"><div class="rep-badge">${esc(initials(name))}</div><div><h2>${esc(name)}</h2>
   <div class="sub">Writing · ${esc(d.topic_uz||"")} · ${esc(mode)} · ${tasks.map(t=>`Task ${esc(t.task)}: <b>${fmt(t.overall)}</b>`).join(" · ")} · Jami: <b>${fmt(d.total)} / ${tasks.length*5}</b></div></div></div>`;
  tasks.forEach(t=>{h+=`<div class="rep-t"><b>Task ${esc(t.task)}</b><span>${esc(TASKS[t.task]||"")}</span><em>${esc(t.word_count)} so'z</em></div>
    ${t.on_topic===false?`<div class="rep-off">⚠️ <b>Mavzuga mos emas — 0 ball.</b> ${esc(t.topic_check||"")}</div>`:""}
    <div class="rep-l">Yozgan matni (o'zgarishsiz)</div><div class="rep-txt">${esc(t.transcript)}</div>
    <div class="rep-l">Xatolar va to'g'ri varianti</div>${errList(t.errors)}${crTable(t,"Task "+t.task)}${idealBlock(t)}`});
  return h+`</div>`;
}
/* ---- talaffuz oynasi ---- */
function pronHTML(d,clips){
  const P=d.pron||[];if(!P.length) return `<div class="pron"><div class="pron-h">🗣 Talaffuz</div><p>✅ Aniq xato talaffuz qilingan so'z topilmadi.</p></div>`;
  return `<div class="pron" id="pron"><div class="pron-h">🗣 Talaffuz xatolari <small>${P.length} ta so'z · eshiting, solishtiring va qaytadan ayting</small></div>
   <table class="pron-t"><tr><th>So'z</th><th>Tinglash va mashq</th><th>Natija</th></tr>${P.map((p,i)=>`<tr data-i="${i}">
    <td><b>${esc(p.word)}</b><small>/${esc(p.ipa||"")}/</small>${p.heard?`<small class="hd">Siz: «${esc(p.heard)}»</small>`:""}<small class="tp">${esc(p.tip||"")}</small></td>
    <td class="pb"><button type="button" data-a="mine" ${clips&&clips[(p.clip||1)-1]?"":"disabled"} title="Sizning talaffuzingiz">▶<span>Siz</span></button>
     <button type="button" data-a="right" title="To'g'ri talaffuz">🔊<span>To'g'ri</span></button>
     <button type="button" data-a="rec" title="Yozib oling">🎤<span>Ayting</span></button></td>
    <td><div class="pct" data-p>—</div></td></tr>`).join("")}</table></div>`;
}
function wirePron(box,d,clips){
  const P=d.pron||[];const urls=(clips||[]).map(c=>c&&c.blob?URL.createObjectURL(c.blob):null);
  box.querySelectorAll("#pron tr[data-i]").forEach(tr=>{const p=P[+tr.dataset.i];const pc=tr.querySelector("[data-p]");
    tr.querySelector('[data-a="mine"]').onclick=()=>{const u=urls[(p.clip||1)-1];if(!u)return;const a=new Audio(u);const s=Math.max(0,(+p.start||0)-.25),e=(+p.end||s+1)+.3;
      a.addEventListener("loadedmetadata",()=>{a.currentTime=s;a.play().catch(()=>{})},{once:true});a.addEventListener("timeupdate",()=>{if(a.currentTime>=e)a.pause()});a.load()};
    tr.querySelector('[data-a="right"]').onclick=()=>sayWord(p.word);
    const rb=tr.querySelector('[data-a="rec"]');let rec=null;
    rb.onclick=async()=>{if(rec&&rec.state==="recording"){rec.stop();return}
      try{const st=await navigator.mediaDevices.getUserMedia({audio:true});const mt=["audio/webm;codecs=opus","audio/mp4","audio/webm"].find(m=>window.MediaRecorder&&MediaRecorder.isTypeSupported(m))||"";
        rec=new MediaRecorder(st,mt?{mimeType:mt}:{});const ch=[];rec.ondataavailable=e=>e.data.size&&ch.push(e.data);
        rec.onstop=async()=>{st.getTracks().forEach(t=>t.stop());rb.classList.remove("on");const bl=new Blob(ch,{type:rec.mimeType||"audio/webm"});
          pc.textContent="⏳";pc.style.background="";
          try{const r=await post("/pron",{code:ls.get("aok_code"),word:p.word,audio:await b64(bl),mime:bl.type});
            pc.textContent=r.score+"%";pc.style.background=`hsl(${Math.round(r.score*1.2)},72%,${r.score>55?38:45}%)`;pc.title=r.tip||"";pc.style.color="#fff";
            let t=tr.querySelector(".ptip");if(!t){t=document.createElement("small");t.className="ptip";pc.after(t)}t.textContent=(r.heard?`«${r.heard}» · `:"")+(r.tip||"")}
          catch(err){pc.textContent="⚠";pc.title=err.message}};
        rec.start();rb.classList.add("on");setTimeout(()=>{if(rec.state==="recording")rec.stop()},3000)}catch(e){alert("Mikrofonga ruxsat bering")}};
  });
}
function showReport(box,d,clips,acts){
  box.innerHTML=(d.kind==="speaking"?pronHTML(d,clips):"")+reportHTML(d)+`<div class="rep-acts">${acts||""}<button class="pri" data-act="img">📷 Rasm sifatida saqlash</button></div>`;
  box.hidden=false;box.scrollIntoView({behavior:"smooth"});
  if(d.kind==="speaking") wirePron(box,d,clips);
  box.querySelector('[data-act="img"]').onclick=async e=>{const b=e.currentTarget;b.disabled=true;
    try{const c=await html2canvas(box.querySelector("#rep"),{scale:2,backgroundColor:"#ffffff"});const a=document.createElement("a");
      a.download=((d.student_name||"oquvchi")+"_"+(d.kind==="speaking"?"Speaking":"Writing")).replace(/\s+/g,"_")+".png";a.href=c.toDataURL("image/png");a.click()}
    catch(err){alert("Rasm saqlanmadi: "+err.message)}b.disabled=false};
}

/* ================= O'QUVCHI: kirish + 3 oyna ================= */
let HOME=null;
async function studentLogin(btn){
  msg("");const code=$("#ck_code").value.trim();if(!code) return msg("Sinf kodini kiriting.",true);
  loading(true,btn,"Kirilmoqda…");
  try{HOME=await post("/home",{code,kind:PAGE});ls.set("aok_code",code);renderHome();step(2)}catch(e){msg("❌ "+e.message,true)}
  loading(false,btn);
}
function renderHome(){
  const H=HOME;const parts=PAGE==="writing"?["T1","T2"]:["1.1","1.2","2","3"];
  $("#pHw").innerHTML=H.homework?`<div class="hw-t">${esc(H.homework.title)} <small>${dt(H.homework.at)}</small></div>${H.homework.items.map(itemHTML).join("")}
     <button type="button" class="ck-go" data-start="hw">▶ Vazifani boshlash</button>`:`<div class="ck-msg">Hozircha uyga vazifa berilmagan.</div>`;
  $("#pBaza").innerHTML=`<p class="hint">Bir yoki bir nechta bo'limni tanlang — savollar bazadan tasodifiy olinadi va ketma-ket beriladi.</p>
    <div class="sec-pick">${parts.map(p=>`<label><input type="checkbox" value="${p}" ${H.counts[p]?"":"disabled"}><span>${PNAME[p]}<small>${H.counts[p]||0} ta savol</small></span></label>`).join("")}</div>
    <label class="tp-l">Mavzu<select id="bTopic"><option value="">Barcha mavzular</option>${Object.keys(H.topics).sort().map(t=>`<option>${esc(t)}</option>`).join("")}</select></label>
    <button type="button" class="ck-go" data-start="baza">▶ Boshlash</button>`;
  $("#pExam").innerHTML=H.exams.length?`<p class="hint">Imtihonni tanlang — savollar o'qituvchi tanlagan to'plamdan har kimga alohida tasodifiy tuziladi.</p>
    ${H.exams.map((e,i)=>`<label class="ck-asg"><input type="radio" name="exam" value="${esc(e.id)}" ${i?"":"checked"}><div><b>${esc(e.name)}</b><small>${dt(e.at)}</small></div></label>`).join("")}
    <button type="button" class="ck-go" data-start="exam">▶ Imtihonni boshlash</button>`:`<div class="ck-msg">Hozircha faol imtihon yo'q.</div>`;
  tab(H.homework?"hw":"baza");
}
function tab(t){$$(".tabs button").forEach(b=>b.classList.toggle("on",b.dataset.t===t));$$(".tabp").forEach(p=>p.hidden=p.dataset.t!==t)}
if(PAGE!=="teacher"&&$(".tabs")) $(".tabs").addEventListener("click",e=>{const b=e.target.closest("button");if(b)tab(b.dataset.t)});
const codeIn=$("#ck_code");if(codeIn){codeIn.value=ls.get("aok_code");codeIn.addEventListener("keydown",e=>{if(e.key==="Enter")$("#goLogin").click()})}
if(!API) msg("⚙️ Checker hali ulanmagan. O'qituvchiga murojaat qiling.",true);
let RUN=null;
async function startRun(mode,btn){
  msg("");
  if(PAGE==="speaking"){const n=$("#ck_name").value.trim();if(!n) return msg("Ism familiyangizni yozing.",true);ls.set("aok_name",n)}
  let data;
  try{
    if(mode==="hw") data={title:HOME.homework.title,items:HOME.homework.items};
    else if(mode==="baza"){const secs=$$("#pBaza .sec-pick input:checked").map(x=>x.value);if(!secs.length) return msg("Kamida bitta bo'limni tanlang.",true);
      loading(true,btn,"Savollar tayyorlanmoqda…");data=await post("/start",{code:ls.get("aok_code"),kind:PAGE,mode:"baza",sections:secs,topic:$("#bTopic").value})}
    else {const r=$('input[name="exam"]:checked');if(!r) return msg("Imtihonni tanlang.",true);loading(true,btn,"Imtihon tuzilmoqda…");data=await post("/start",{code:ls.get("aok_code"),kind:PAGE,mode:"exam",exam:r.value})}
  }catch(e){loading(false,btn);return msg("❌ "+e.message,true)}
  loading(false,btn);RUN={mode,title:data.title,items:data.items};
  PAGE==="writing"?writingRun():speakingRun();
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-start]");if(b)startRun(b.dataset.start,b)});

/* ================= WRITING ================= */
const IM=[];let wTimer=null;
function writingRun(){
  $("#wPaper").innerHTML=`<div class="hw-t">${esc(MODES[RUN.mode])} · ${esc(RUN.title||"")}</div>`+RUN.items.map(itemHTML).join("");
  IM.length=0;th();step(3);clearInterval(wTimer);const T=$("#wTimer");
  if(RUN.mode==="exam"){let left=60*60;T.hidden=false;const upd=()=>{T.innerHTML=`⏱ <b>${Math.floor(left/60)}:${String(left%60).padStart(2,"0")}</b> qoldi`;T.classList.toggle("low",left<300)};upd();
    wTimer=setInterval(()=>{left--;upd();if(left<=0){clearInterval(wTimer);beep(660,600);T.innerHTML="⏱ <b>Vaqt tugadi!</b> Rasmlarni yuklang."}},1000)}
  else T.hidden=true;
}
const th=()=>{const b=$("#thumbs");if(!b)return;b.innerHTML="";IM.forEach((im,i)=>{const f=document.createElement("figure");
  f.innerHTML=`<img src="${im.thumb}" alt="rasm ${i+1}"><button type="button" aria-label="O'chirish">×</button>`;f.querySelector("button").onclick=()=>{IM.splice(i,1);th()};b.appendChild(f)});
  $("#goWriting").disabled=!IM.length};
if(PAGE==="writing"){
  $("#goLogin").onclick=e=>studentLogin(e.currentTarget);
  $("#files").addEventListener("change",async e=>{for(const f of [...e.target.files].slice(0,8-IM.length)){try{IM.push(await compress(f))}catch(err){msg(err.message,true)}}e.target.value="";th()});
  $("#wBack").onclick=()=>{clearInterval(wTimer);step(2)};
  $("#goWriting").onclick=async e=>{const btn=e.currentTarget;msg("");if(!IM.length) return msg("Rasm yuklang.",true);
    loading(true,btn,"AI xatingizni o'qiyapti, ismingiz va Task'larni aniqlayapti, ideal javobni tekshiryapti… (30–90 soniya)");
    try{const d=await post("/writing",{code:ls.get("aok_code"),mode:RUN.mode,title:RUN.title,ids:RUN.items.map(x=>x.id),images:IM.map(({mime,data})=>({mime,data}))});
      clearInterval(wTimer);step(4);showReport($("#ckResult"),d,null,`<button data-act="again">🏠 Bosh oyna</button>`);
      if(d.saved) msg("✅ Natija o'qituvchiga yuborildi.");
      $('[data-act="again"]').onclick=()=>{$("#ckResult").hidden=true;msg("");step(2)}}
    catch(err){msg("❌ "+err.message,true)}
    loading(false,btn)};
}

/* ================= SPEAKING (imtihon kabi) ================= */
const ORDER=["1.1","1.2","2","3"];
function buildSteps(items){
  const S=[];const by=p=>items.filter(x=>x.part===p);
  const p11=by("1.1");p11.forEach((it,i)=>S.push({it,part:"1.1",q:it.q[0],prep:5,ans:30,lab:`Part 1.1 · Savol ${i+1}/${p11.length}`}));
  by("1.2").forEach(it=>it.q.forEach((q,i)=>S.push({it,part:"1.2",q,prep:i?5:10,ans:i?30:45,lab:`Part 1.2 · Savol ${i+1}/${it.q.length}`,img:true})));
  by("2").forEach(it=>S.push({it,part:"2",q:it.q.join(" "),qs:it.q,prep:60,ans:120,lab:"Part 2",img:true}));
  by("3").forEach(it=>S.push({it,part:"3",q:`${it.q[0]} FOR: ${(it.for||[]).join("; ")}. AGAINST: ${(it.against||[]).join("; ")}.`,p3:true,prep:60,ans:120,lab:"Part 3"}));
  return S;
}
let STREAM=null,CLIPS=[];
const R=2*Math.PI*54;
function ring(sec,total,phase){const el=$("#ring");el.querySelector(".fg").style.strokeDashoffset=String(R*(1-sec/total));
  el.querySelector(".t").textContent=sec>=60?`${Math.floor(sec/60)}:${String(sec%60).padStart(2,"0")}`:String(sec);el.className="ring "+phase}
function countdown(total,phase,onTick){return new Promise(res=>{let left=total;ring(left,total,phase);const id=setInterval(()=>{left--;ring(Math.max(left,0),total,phase);onTick&&onTick(left);if(left<=0){clearInterval(id);res()}},1000);
  RUN.skip=()=>{clearInterval(id);res()}})}
async function speakingRun(){
  const steps=buildSteps(RUN.items);if(!steps.length) return msg("Savol topilmadi.",true);
  try{STREAM=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){return msg("Mikrofonga ruxsat bering: "+e.message,true)}
  CLIPS=[];step(3);
  for(let i=0;i<steps.length;i++){const s=steps[i];
    $("#rLab").textContent=s.lab;$("#rProg").textContent=`${i+1} / ${steps.length}`;
    const im=s.img?(s.it.images||[]).map(x=>`<img src="${esc(imgSrc(x))}" alt="">`).join(""):"";
    $("#rQ").innerHTML=(im?`<div class="ex-imgs n${(s.it.images||[]).length}">${im}</div>`:"")+
      (s.p3?`<p class="ex-big">${esc(s.it.q[0])}</p>${p3table(s.it)}`:s.qs?`<ol>${s.qs.map(q=>`<li>${esc(q)}</li>`).join("")}</ol>`:`<p class="ex-big">${esc(s.q)}</p>`);
    $("#rPhase").textContent="Tayyorlaning";$("#rSkip").textContent="⏭ Tayyorman";
    await countdown(s.prep,"prep");
    const mt=["audio/webm;codecs=opus","audio/mp4","audio/webm"].find(m=>window.MediaRecorder&&MediaRecorder.isTypeSupported(m))||"";
    const rec=new MediaRecorder(STREAM,mt?{mimeType:mt}:{});const ch=[];rec.ondataavailable=e=>e.data.size&&ch.push(e.data);
    const done=new Promise(r=>rec.onstop=r);beep(880);rec.start();
    $("#rPhase").textContent="🔴 Gapiring";$("#rSkip").textContent="⏹ Tugatdim";
    await countdown(s.ans,"ans");rec.stop();await done;beep(520,160);
    CLIPS.push({part:s.part,question:s.q,blob:new Blob(ch,{type:rec.mimeType||"audio/webm"})});
  }
  STREAM.getTracks().forEach(t=>t.stop());
  step(4);loading(true,null,"AI javoblaringizni tinglab baholayapti va ideal javoblarni tekshiryapti… (30–120 soniya)");
  try{const clips=[];for(const c of CLIPS) clips.push({part:c.part,question:c.question,audio:await b64(c.blob),mime:c.blob.type});
    const d=await post("/speaking",{code:ls.get("aok_code"),name:ls.get("aok_name"),mode:RUN.mode,title:RUN.title,clips});
    showReport($("#ckResult"),d,CLIPS,`<button data-act="again">🏠 Bosh oyna</button>`);if(d.saved) msg("✅ Natija o'qituvchiga yuborildi.");
    $('[data-act="again"]').onclick=()=>{$("#ckResult").hidden=true;msg("");step(2)}}
  catch(err){msg("❌ "+err.message+" — qayta yuborish uchun tugmani bosing.",true);$("#ckResult").innerHTML=`<button class="ck-go" id="retry">🔁 Qayta yuborish</button>`;$("#ckResult").hidden=false;
    $("#retry").onclick=async()=>{$("#ckResult").hidden=true;step(4);loading(true,null,"Qayta yuborilmoqda…");try{const clips=[];for(const c of CLIPS) clips.push({part:c.part,question:c.question,audio:await b64(c.blob),mime:c.blob.type});
      const d=await post("/speaking",{code:ls.get("aok_code"),name:ls.get("aok_name"),mode:RUN.mode,title:RUN.title,clips});msg("");showReport($("#ckResult"),d,CLIPS)}catch(e2){msg("❌ "+e2.message,true)}loading(false)}}
  loading(false);
}
if(PAGE==="speaking"){
  $("#goLogin").onclick=e=>studentLogin(e.currentTarget);$("#ck_name").value=ls.get("aok_name");
  $("#rSkip").onclick=()=>RUN&&RUN.skip&&RUN.skip();
}

/* ================= O'QITUVCHI ================= */
if(PAGE==="teacher"){
  const T=()=>ls.get("aok_tcode");const tIn=$("#t_code");tIn.value=T();
  let KIND="writing",BANK={},HW=null,EXAMS=[],SEL=new Set(),EDIT=null;
  const partsOf=k=>k==="writing"?["T1","T2"]:["1.1","1.2","2","3"];
  const keyOf=it=>it.kind==="writing"?(it.wtype==="T1"?it.email:it.essay):(it.q||[]).join(" ");
  async function load(){const j=await post("/teacher/bank",{tcode:T(),kind:KIND});BANK=j.bank;HW=j.homework;EXAMS=j.exams;render()}
  $("#goLogin").onclick=async e=>{const btn=e.currentTarget;msg("");const c=tIn.value.trim();if(!c) return msg("O'qituvchi kodini kiriting.",true);
    loading(true,btn,"Kirilmoqda…");try{const j=await post("/teacher/login",{tcode:c});ls.set("aok_tcode",c);$("#seedBox").hidden=j.seeded;await load();step(2)}catch(err){msg("❌ "+err.message,true)}loading(false,btn)};
  tIn.addEventListener("keydown",e=>{if(e.key==="Enter")$("#goLogin").click()});
  $("#seedBtn").onclick=async e=>{const btn=e.currentTarget;loading(true,btn,"Boshlang'ich baza yuklanmoqda…");
    try{const s=await (await fetch("seed.json",{cache:"no-store"})).json();const j=await post("/teacher/import",{tcode:T(),items:s.items});msg(`✅ Bazaga ${j.added} ta savol qo'shildi (${j.skipped} tasi bor edi).`);$("#seedBox").hidden=true;await load()}catch(err){msg("❌ "+err.message,true)}loading(false,btn)};
  $$(".ktabs button").forEach(b=>b.onclick=async()=>{KIND=b.dataset.k;$$(".ktabs button").forEach(x=>x.classList.toggle("on",x===b));SEL.clear();EDIT=null;await load()});
  $$(".ttabs button").forEach(b=>b.onclick=()=>{$$(".ttabs button").forEach(x=>x.classList.toggle("on",x===b));$$(".ttp").forEach(p=>p.hidden=p.dataset.t!==b.dataset.t);if(b.dataset.t==="res")loadResults()});
  const allItems=()=>partsOf(KIND).flatMap(p=>BANK[p]||[]);
  const topics=()=>[...new Set(allItems().map(x=>x.topic))].sort();
  function render(){
    // filter
    const fp=$("#fPart"),ft=$("#fTopic");const pv=fp.value,tv=ft.value;
    fp.innerHTML=`<option value="">Barcha bo'limlar</option>`+partsOf(KIND).map(p=>`<option value="${p}">${PNAME[p]} (${(BANK[p]||[]).length})</option>`).join("");fp.value=partsOf(KIND).includes(pv)?pv:"";
    ft.innerHTML=`<option value="">Barcha mavzular</option>`+topics().map(t=>`<option>${esc(t)}</option>`).join("");ft.value=topics().includes(tv)?tv:"";
    $("#topicList").innerHTML=topics().map(t=>`<option value="${esc(t)}">`).join("");
    list();form();hwView();examView();
  }
  function list(){const p=$("#fPart").value,t=$("#fTopic").value,q=$("#fSearch").value.toLowerCase().trim();
    let L=allItems().filter(x=>(!p||(x.part||x.wtype)===p)&&(!t||x.topic===t)&&(!q||keyOf(x).toLowerCase().includes(q)));
    const groups={};L.forEach(x=>(groups[x.topic]=groups[x.topic]||[]).push(x));
    $("#bankCount").textContent=`${L.length} ta savol · ${SEL.size} ta belgilangan`;
    $("#bankList").innerHTML=Object.keys(groups).sort().map(g=>`<details class="tg" open><summary>${esc(g)} <small>${groups[g].length}</small></summary>${groups[g].map(x=>`<div class="bi">
      <input type="checkbox" data-sel="${x.id}" ${SEL.has(x.id)?"checked":""}><span class="pp">${(x.part||x.wtype).replace("T","Task ")}</span>
      <span class="bt">${esc(keyOf(x).slice(0,140))}${(x.part==="1.2"||x.part==="2")?((x.images||[]).length?" 🖼":" <em class='noimg'>rasm yo'q</em>"):""}</span>
      ${HW&&HW.ids.includes(x.id)?'<span class="tag">📌</span>':""}${EXAMS.some(e=>e.ids.includes(x.id))?'<span class="tag">📝</span>':""}
      <button type="button" data-ed="${x.id}">✏️</button><button type="button" data-del="${x.id}">🗑</button></div>`).join("")}</details>`).join("")||`<div class="ck-msg">Savol topilmadi.</div>`;
  }
  ["#fPart","#fTopic"].forEach(s=>$(s).onchange=list);$("#fSearch").oninput=list;
  $("#bankList").addEventListener("change",e=>{const c=e.target.closest("[data-sel]");if(!c)return;c.checked?SEL.add(c.dataset.sel):SEL.delete(c.dataset.sel);$("#bankCount").textContent=$("#bankCount").textContent.replace(/· \d+ ta/,`· ${SEL.size} ta`)});
  $("#bankList").addEventListener("click",async e=>{const b=e.target.closest("button");if(!b)return;
    if(b.dataset.ed){EDIT=allItems().find(x=>x.id===b.dataset.ed);$("#ttBank").click();form();$("#itemForm").scrollIntoView({behavior:"smooth"})}
    if(b.dataset.del){if(!confirm("Savol bazadan o'chirilsinmi?"))return;await post("/teacher/item/delete",{tcode:T(),kind:KIND,id:b.dataset.del});SEL.delete(b.dataset.del);await load()}});
  $("#selAll").onclick=()=>{$$("#bankList [data-sel]").forEach(c=>{c.checked=true;SEL.add(c.dataset.sel)});list()};
  $("#selNone").onclick=()=>{SEL.clear();list()};
  /* --- savol formasi --- */
  let FIMG=[];
  function form(){const it=EDIT||{};const part=it.part||it.wtype||$("#iPart").value||partsOf(KIND)[0];
    $("#iPart").innerHTML=partsOf(KIND).map(p=>`<option value="${p}">${PNAME[p]}</option>`).join("");$("#iPart").value=partsOf(KIND).includes(part)?part:partsOf(KIND)[0];$("#iPart").disabled=!!EDIT;
    $("#iTopic").value=it.topic||"";FIMG=(it.images||[]).map(x=>({...x,thumb:imgSrc(x)}));fields(it);$("#iSave").textContent=EDIT?"💾 O'zgarishni saqlash":"➕ Bazaga qo'shish";$("#iCancel").hidden=!EDIT}
  function fields(it){const p=$("#iPart").value;const q=it.q||[];let h="";
    const ta=(id,lab,v,ph,r=3)=>`<label>${lab}<textarea id="${id}" rows="${r}" placeholder="${esc(ph||"")}">${esc(v||"")}</textarea></label>`;
    const tx=(id,lab,v,ph)=>`<label>${lab}<input type="text" id="${id}" value="${esc(v||"")}" placeholder="${esc(ph||"")}"></label>`;
    if(p==="T1") h=tx("fSender","Kimdan",it.sender,"The City Council sent you an email.")+ta("fEmail","Email matni",it.email,"Dear Resident, …",6)+ta("fT11","Task 1.1",it.t11,"Write a letter to your friend… Write about 50 words.",2)+ta("fT12","Task 1.2",it.t12,"Write a letter to the manager… Write 120–150 words.",2);
    else if(p==="T2") h=ta("fEssay","Essay savoli",it.essay,"Some people believe that … Discuss both views and give your own opinion. Write about 180 words.",4);
    else if(p==="1.1") h=tx("fQ1","Savol",q[0],"Do you often …?");
    else if(p==="3") h=tx("fQ1","Bayonot",q[0],"Homework should be banned at school.")+`<div class="ck-row"><div>${[0,1,2].map(i=>tx("fF"+i,"FOR "+(i+1),(it.for||[])[i])).join("")}</div><div>${[0,1,2].map(i=>tx("fA"+i,"AGAINST "+(i+1),(it.against||[])[i])).join("")}</div></div>`;
    else { h=tx("fQ1","1-savol",q[0]||(p==="1.2"?"Tell me what you can see in these pictures.":""),p==="2"?"Tell me about a time when …":"")+tx("fQ2","2-savol",q[1],p==="1.2"?"What are the advantages of … over …?":"How did …?")+tx("fQ3","3-savol",q[2],p==="1.2"?"Do you prefer … or …?":"Do you agree that …?");
      h+=`<div class="ck-task"><b>🖼 Rasm${p==="1.2"?"lar (2 ta)":" (1 ta)"}</b><label class="ck-file" style="margin-top:8px">📷 Yuklash<input type="file" id="fImg" accept="image/*" ${p==="1.2"?"multiple":""}></label><div class="ck-thumbs" id="fThumbs"></div></div>`}
    $("#iFields").innerHTML=h;const fi=$("#fImg");if(fi){fi.onchange=async e=>{const max=p==="1.2"?2:1;for(const f of [...e.target.files]){if(FIMG.length>=max)FIMG.shift();FIMG.push(await compress(f,900,.8))}e.target.value="";thumbs()};thumbs()}}
  function thumbs(){const b=$("#fThumbs");if(!b)return;b.innerHTML="";FIMG.forEach((im,i)=>{const f=document.createElement("figure");f.innerHTML=`<img src="${esc(im.thumb)}" alt=""><button type="button">×</button>`;f.querySelector("button").onclick=()=>{FIMG.splice(i,1);thumbs()};b.appendChild(f)})}
  $("#iPart").onchange=()=>{FIMG=[];fields({})};
  $("#iCancel").onclick=()=>{EDIT=null;form()};
  function collect(){const p=$("#iPart").value,v=id=>($("#"+id)||{}).value?.trim()||"";
    const it={id:EDIT?EDIT.id:undefined,created:EDIT?EDIT.created:undefined,kind:KIND,topic:$("#iTopic").value.trim()};
    if(KIND==="writing"){it.wtype=p;if(p==="T1")Object.assign(it,{sender:v("fSender"),email:v("fEmail"),t11:v("fT11"),t12:v("fT12")});else it.essay=v("fEssay")}
    else{it.part=p;it.q=[v("fQ1"),v("fQ2"),v("fQ3")].filter(Boolean);if(p==="3"){it.for=[0,1,2].map(i=>v("fF"+i)).filter(Boolean);it.against=[0,1,2].map(i=>v("fA"+i)).filter(Boolean)}
      if(p==="1.2"||p==="2") it.images=FIMG.map(x=>x.url?{url:x.url}:x.k?{k:x.k}:{data:x.data})}
    return it}
  async function saveItem(btn,homework){msg("");const it=collect();if(!it.topic) return msg("Mavzuni yozing yoki tanlang.",true);
    loading(true,btn,"Saqlanmoqda…");try{await post("/teacher/item/save",{tcode:T(),item:it,homework:homework||""});msg(homework?"✅ Yangi savol bazaga qo'shildi va UYGA VAZIFA qilib berildi.":"✅ Saqlandi.");EDIT=null;await load()}
    catch(err){msg("❌ "+err.message,true)}loading(false,btn)}
  $("#iSave").onclick=e=>saveItem(e.currentTarget,"");
  $("#iHw").onclick=e=>{const t=$("#hwTitle").value.trim()||$("#iTopic").value.trim();if(EDIT) return msg("Vazifa uchun yangi savol kiriting (tahrirlash rejimidan chiqing).",true);saveItem(e.currentTarget,t)};
  /* --- vazifa --- */
  function hwView(){const it=HW?HW.ids.map(id=>allItems().find(x=>x.id===id)).filter(Boolean):[];
    $("#hwNow").innerHTML=HW?`<div class="hw-t">📌 ${esc(HW.title)} <small>${dt(HW.at)}</small></div>${it.map(itemHTML).join("")}`:`<div class="ck-msg">Hozircha vazifa yo'q.</div>`}
  $("#hwFromSel").onclick=async e=>{if(!SEL.size) return msg("Avval Baza bo'limida savollarni belgilang.",true);const btn=e.currentTarget;loading(true,btn,"…");
    try{await post("/teacher/homework",{tcode:T(),kind:KIND,ids:[...SEL],title:$("#hwTitle").value.trim()||"Uyga vazifa"});msg("✅ Belgilangan savollar uyga vazifa qilindi.");await load()}catch(err){msg("❌ "+err.message,true)}loading(false,btn)};
  /* --- exam --- */
  function examView(){$("#exList").innerHTML=EXAMS.length?EXAMS.map(e=>`<div class="ck-asg t"><div><b>${esc(e.name)}</b><small>${dt(e.at)} · ${e.ids.length} ta savol · ${e.active?"🟢 faol":"⚪ yopiq"}</small></div>
     <div class="t-acts"><button data-xadd="${e.id}">➕ Belgilanganlarni qo'shish</button><button data-xtog="${e.id}">${e.active?"Yopish":"Ochish"}</button><button data-xdel="${e.id}">🗑</button></div></div>`).join(""):`<div class="ck-msg">Hali imtihon yo'q.</div>`}
  $("#exCreate").onclick=async e=>{const name=$("#exName").value.trim();if(!name) return msg("Imtihon nomini yozing (masalan: Noyabr mock).",true);if(!SEL.size) return msg("Avval Baza bo'limida savollarni belgilang.",true);
    const btn=e.currentTarget;loading(true,btn,"…");try{await post("/teacher/exam/save",{tcode:T(),kind:KIND,name,ids:[...SEL]});$("#exName").value="";msg(`✅ "${name}" imtihoni yaratildi.`);await load()}catch(err){msg("❌ "+err.message,true)}loading(false,btn)};
  $("#exList").addEventListener("click",async e=>{const b=e.target.closest("button");if(!b)return;
    const ex=EXAMS.find(x=>x.id===(b.dataset.xadd||b.dataset.xtog||b.dataset.xdel));
    if(b.dataset.xadd){if(!SEL.size) return msg("Avval savollarni belgilang.",true);await post("/teacher/exam/save",{tcode:T(),kind:KIND,id:ex.id,name:ex.name,active:ex.active,ids:[...new Set([...ex.ids,...SEL])]});msg("✅ Qo'shildi.")}
    if(b.dataset.xtog) await post("/teacher/exam/save",{tcode:T(),kind:KIND,id:ex.id,name:ex.name,ids:ex.ids,active:!ex.active});
    if(b.dataset.xdel){if(!confirm("Imtihon o'chirilsinmi?"))return;await post("/teacher/exam/delete",{tcode:T(),id:ex.id})}
    await load()});
  /* --- natijalar --- */
  async function loadResults(){const j=await post("/teacher/results",{tcode:T(),kind:KIND});const R=j.results||[];
    $("#rTable").innerHTML=R.length?`<table class="rep-tb"><tr><th>O'quvchi</th><th>Rejim</th><th>Ball</th><th>Vaqt</th><th></th></tr>`+R.map(r=>`<tr><td>${esc(r.name)}</td>
      <td>${esc(MODES[r.mode]||"")}<small style="display:block;opacity:.7">${esc(r.title||"")}</small></td>
      <td><b>${fmt(r.total)} / ${r.max||5}</b>${r.off?' ⚠️':""}${r.parts?`<small style="display:block;opacity:.7">Part ${esc(r.parts)}</small>`:""}</td><td>${dt(r.at)}</td>
      <td><button data-k="${esc(r.key)}">👁</button> <button data-x="${esc(r.key)}">🗑</button></td></tr>`).join("")+`</table>`:`<div class="ck-msg">Hali natija yo'q.</div>`;$("#ckResult").hidden=true}
  $("#rTable").addEventListener("click",async e=>{const b=e.target.closest("button");if(!b)return;
    if(b.dataset.k){const d=await post("/teacher/result",{tcode:T(),key:b.dataset.k});showReport($("#ckResult"),d,null)}
    if(b.dataset.x){if(!confirm("Natija o'chirilsinmi?"))return;await post("/teacher/delresult",{tcode:T(),key:b.dataset.x});b.closest("tr").remove()}});
}
})();
