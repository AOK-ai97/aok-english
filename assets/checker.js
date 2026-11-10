/* AOK English — AI Checker v4 (writing · speaking · teacher · PIN · profil · Jo'nat) */
(()=>{
const API=(window.AOK_API||"").replace(/\/$/,"");
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const ls={get:k=>{try{return localStorage.getItem(k)||""}catch(e){return""}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}},del:k=>{try{localStorage.removeItem(k)}catch(e){}}};
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt=x=>(Math.round((+x||0)*2)/2).toString();
const initials=n=>(n||"?").trim().split(/\s+/).map(w=>w[0]).join("").slice(0,2).toUpperCase();
const p2=n=>String(n).padStart(2,"0");
const dt=t=>{const d=new Date(t);return isNaN(d)?"":`${p2(d.getDate())}.${p2(d.getMonth()+1)} ${p2(d.getHours())}:${p2(d.getMinutes())}`};
const PAGE=document.body.dataset.ck;
const MODES={hw:"📌 Vazifa",baza:"📚 Baza",exam:"📝 Exam"};
const PNAME={"1.1":"Part 1.1","1.2":"Part 1.2","2":"Part 2","3":"Part 3",T1:"Task 1 (1.1 + 1.2)",T2:"Task 2 (Essay)"};
const QTYPES={"1.1":{s1:"S1 · Describe/Favourite",s2:"S2 · Habit/Routine",s3:"S3 · Opinion/Preference"},
 "1.2":{joy:"🏙 Joy",usul:"🔧 Usul",davr:"⏳ Davr (eski↔yangi)",kishi:"👥 Kishilar/o'lcham"},
 "2":{voqea:"📅 Voqea/tajriba",inson:"🧑 Inson",joy:"📍 Joy",narsa:"🎁 Narsa",odat:"🔁 Odat/faoliyat"},
 "3":{taqiq:"🚫 Taqiq/majburiyat",taqqos:"⚖️ Taqqoslash",tasir:"💥 Ta'sir",masuliyat:"🏛 Mas'uliyat"},
 T1:{ozgarish:"📢 O'zgarish/qoida",tadbir:"🎉 Tadbir/reja",sorovnoma:"📝 So'rovnoma",imkoniyat:"🎓 Imkoniyat",muammo:"⚠️ Muammo"},
 T2:{agree:"✅ Agree/Disagree",discuss:"⚖️ Discuss both views",advdis:"➕➖ Advantages/Disadvantages",problem:"🛠 Problem–Solution",causes:"🔍 Causes–Effects",twopart:"❓ Two-part question"}};
const qtName=x=>((QTYPES[x.part||x.wtype]||{})[x.qtype])||"";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function msg(t,err){const m=$("#ckMsg");if(!m)return;m.hidden=!t;m.className="ck-msg"+(err?" err":"");m.textContent=t||"";if(t)m.scrollIntoView({block:"nearest"})}
function loading(on,btn,t){if(btn)btn.disabled=on;const L=$("#ckLoad");if(!L)return;L.hidden=!on;if(t)L.querySelector("span").textContent=t}
async function post(path,body){
  if(!API) throw new Error("Checker hali ulanmagan.");
  let r;try{r=await fetch(API+path,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)})}catch(e){const er=new Error("Internet aloqasi yo'q yoki uzildi.");er.net=true;throw er}
  let j={};try{j=await r.json()}catch(e){}
  if(!r.ok||j.error){const er=new Error(String(j.error||("Server xatosi "+r.status)).replace(/^BUSY: /,""));er.busy=!!j.busy||r.status===503||r.status===429;er.status=r.status;throw er}
  return j;
}
/* AI band bo'lsa — navbatda kutib, o'zi qayta yuboradi */
async function postRetry(path,body,label){
  for(let i=1;;i++){
    try{return await post(path,body)}
    catch(e){if(!(e.busy||e.net)||i>=10) throw e;
      for(let s=20;s>0;s--){loading(true,null,`⏳ Navbatda turibsiz — AI hozir boshqa o'quvchilarni tekshiryapti. ${s} soniyadan keyin avtomatik qayta yuboriladi (urinish ${i+1}/10). Sahifani yopmang — javoblaringiz saqlangan.`);await sleep(1000)}
      loading(true,null,label)}
  }
}
const step=n=>{$$("[data-step]").forEach(e=>e.hidden=e.dataset.step!==String(n));window.scrollTo({top:0,behavior:"smooth"})};
const imgSrc=im=>typeof im==="string"?im:im&&im.url?im.url:(im&&im.data?("data:image/jpeg;base64,"+im.data):(im&&im.thumb)||"");
const b64=blob=>new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result.split(",")[1]);fr.onerror=rej;fr.readAsDataURL(blob)});
function compress(file,max=1800,q=.85){return new Promise((res,rej)=>{const img=new Image();const u=URL.createObjectURL(file);
  img.onload=()=>{const k=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement("canvas");c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);
    c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);const d=c.toDataURL("image/jpeg",q);res({mime:"image/jpeg",data:d.split(",")[1],thumb:d})};
  img.onerror=()=>rej(new Error("Rasm ochilmadi"));img.src=u})}
function beep(f=880,ms=220){try{const A=window._ac||(window._ac=new (window.AudioContext||window.webkitAudioContext)());const o=A.createOscillator(),g=A.createGain();o.frequency.value=f;o.connect(g);g.connect(A.destination);g.gain.setValueAtTime(.18,A.currentTime);o.start();o.stop(A.currentTime+ms/1000)}catch(e){}}
function sayWord(w){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(w);u.lang="en-GB";u.rate=.8;
  const vs=speechSynthesis.getVoices();const v=vs.find(v=>/en-GB/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang));if(v)u.voice=v;speechSynthesis.speak(u)}catch(e){}}
/* IndexedDB — tugallanmagan speakingni saqlash (sahifa yopilsa ham yo'qolmaydi) */
const idb=(()=>{let db;const open=()=>db||(db=new Promise((res,rej)=>{const r=indexedDB.open("aok-ck",1);r.onupgradeneeded=()=>r.result.createObjectStore("s");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}));
  const tx=async(m,f)=>{const d=await open();return new Promise((res,rej)=>{const t=d.transaction("s",m);const q=f(t.objectStore("s"));t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error)})};
  return{get:k=>tx("readonly",s=>s.get(k)).catch(()=>null),set:(k,v)=>tx("readwrite",s=>s.put(v,k)).catch(()=>{}),del:k=>tx("readwrite",s=>s.delete(k)).catch(()=>{})}})();

/* Faoliyat jurnali — o'qituvchi har bir harakatni sana/soat bilan ko'radi */
const LOG={buf:[],add(t,d){if(!ME)return;this.buf.push({t,at:Date.now(),...(d||{})});if(this.buf.length>=25)this.flush()},
  flush(beacon){if(!this.buf.length||!API||!ME)return;const body=JSON.stringify({code:ls.get("aok_code"),events:this.buf.splice(0)});
    if(beacon&&navigator.sendBeacon){try{navigator.sendBeacon(API+"/log",new Blob([body],{type:"text/plain"}));return}catch(e){}}
    fetch(API+"/log",{method:"POST",headers:{"content-type":"text/plain"},body,keepalive:true}).catch(()=>{})}};
setInterval(()=>LOG.flush(),60000);
window.addEventListener("pagehide",()=>{LOG.add("leave");LOG.flush(true)});
document.addEventListener("visibilitychange",()=>{if(document.hidden)LOG.flush(true)});
/* Jo'natish navbati: internet uzilsa ham saqlanadi va o'zi qayta yuboriladi */
const OUTK="outbox";
async function outboxAll(){return (await idb.get(OUTK))||[]}
async function outboxPut(job){const L=(await outboxAll()).filter(j=>j.key!==job.key);L.push(job);await idb.set(OUTK,L)}
async function outboxDel(key){await idb.set(OUTK,(await outboxAll()).filter(j=>j.key!==key))}
async function sendJob(job){const fd=new FormData();fd.append("code",job.code);fd.append("key",job.key);fd.append("caption",job.caption);if(job.auto)fd.append("auto","1");
  (job.videos||[]).forEach((v,i)=>fd.append("video",v,`speaking${i}.${/mp4/.test(v.type)?"mp4":"webm"}`));(job.pages||[]).forEach((p,i)=>fd.append("page",p,`page${i+1}.png`));
  const r=await fetch(API+"/send",{method:"POST",body:fd});const j=await r.json().catch(()=>({}));
  if(!r.ok||j.error){const e=new Error(j.error||("Server xatosi "+r.status));e.fatal=r.status>=400&&r.status<500;throw e}return j}
let FLUSHING=false;
async function outboxFlush(){if(FLUSHING||!API)return;FLUSHING=true;try{for(const job of await outboxAll()){try{await sendJob(job);await outboxDel(job.key);LOG.add("outbox_sent",{key:job.key})}catch(e){if(e.fatal){await outboxDel(job.key);LOG.add("send_fail",{msg:e.message})}}}}finally{FLUSHING=false}}
setInterval(outboxFlush,20000);window.addEventListener("online",outboxFlush);

/* rasmni katta qilib ochish */
document.addEventListener("click",e=>{const im=e.target.closest(".ex-imgs img,.ck-thumbs img");if(!im)return;
  const o=document.createElement("div");o.className="lightbox";o.innerHTML=`<img src="${im.src}" alt=""><span>✕</span>`;o.onclick=()=>o.remove();document.body.appendChild(o)});
/* ================= SAVOL KARTASI ================= */
function itemHTML(it){
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
const errList=e=>(!e||!e.length)?`<p>✅ Xato topilmadi.</p>`:`<ol class="rep-err">`+e.map(x=>`<li><span class="w">${esc(x.wrong)}</span> → <span class="c">${esc(x.correct)}</span><span class="x">${esc(x.explain)}</span>${x.repeat?`<span class="rp">🔁 Qayta qilyapsiz — bu xato ${x.repeat}-marta (${esc(x.rule||"")})</span>`:""}</li>`).join("")+`</ol>`;
const idealBlock=t=>t.ideal?`<div class="rep-l">⭐ Ideal javob (5/5) ${t.ideal_verified?'<span class="vbadge">✓ qayta tekshirildi</span>':''}</div><div class="rep-better">${esc(t.ideal)}</div>
  ${(t.max_tips||[]).length?`<div class="rep-l">🎯 5 ball olish uchun nima qilish kerak</div><ol class="rep-tips">${t.max_tips.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>`:""}`:"";
const TASKS={"1.1":"Do'stga norasmiy xat · ~50 so'z","1.2":"Rasmiy xat · 120–150 so'z","2":"Essay · ~180 so'z"};
const cmpLine=d=>{if(!d.prev)return"";const cur=d.kind==="speaking"?d.overall:d.total,max=d.kind==="speaking"?5:d.max;const a=cur/max,b=d.prev.tot/(d.prev.max||max);
  const ar=a-b>.02?"↑ o'sdi":b-a>.02?"↓ tushdi":"→ o'zgarmadi";return `<div class="rep-cmp ${a-b>.02?"up":b-a>.02?"dn":""}">📈 Oldingi natija (${dt(d.prev.at)}): <b>${fmt(d.prev.tot)} / ${d.prev.max||max}</b> → hozir <b>${fmt(cur)} / ${max}</b> · ${ar}</div>`};
const banners=d=>(d.late?`<div class="rep-off">⏰ <b>Muddatdan kech topshirildi.</b></div>`:"")+((d.repeats||0)?`<div class="rep-rep">🔁 <b>${d.repeats} ta xatoni avval ham qilgansiz</b> — ular quyida belgilangan. Shularga alohida e'tibor bering!</div>`:"");
function reportHTML(d){
  const name=d.student_name||"O'quvchi";const mode=(MODES[d.mode]||"")+(d.title?" · "+d.title:"");
  if(d.kind==="speaking"){
    let h=`<div class="rep" id="rep"><div class="rep-h"><div class="rep-badge">${esc(initials(name))}</div><div><h2>${esc(name)}</h2>
     <div class="sub">Speaking · ${esc(mode)} · ${(d.parts||[]).map(p=>`Part ${esc(p.part)}: <b>${fmt(p.overall)}</b>`).join(" · ")} · Overall: <b>${fmt(d.overall)} / 5</b></div></div></div>
     ${cmpLine(d)}${banners(d)}${d.summary_uz?`<div class="rep-sum">${esc(d.summary_uz)}</div>`:""}`;
    (d.parts||[]).forEach(p=>{h+=`<div class="rep-blk"><div class="rep-t"><b>Part ${esc(p.part)}</b><span>${esc(p.question||"")}</span></div>
      ${(p.unanswered||[]).length?`<div class="rep-off">❌ <b>Javob bermadingiz${p.overall===0?" — 0 ball":""}:</b> ${p.unanswered.map(esc).join(" · ")}</div>`:""}
      <div class="rep-l">Aytgan gaplari (o'zgarishsiz)</div><div class="rep-txt">${esc(p.transcript)}</div>
      <div class="rep-l">Xatolar va to'g'ri varianti</div>${errList(p.errors)}${crTable(p,"Part "+p.part)}${idealBlock(p)}</div>`});
    return h+`</div>`;
  }
  const tasks=d.tasks||[];
  let h=`<div class="rep" id="rep"><div class="rep-h"><div class="rep-badge">${esc(initials(name))}</div><div><h2>${esc(name)}</h2>
   <div class="sub">Writing · ${esc(d.topic_uz||"")} · ${esc(mode)} · ${tasks.map(t=>`Task ${esc(t.task)}: <b>${fmt(t.overall)}</b>`).join(" · ")} · Jami: <b>${fmt(d.total)} / ${tasks.length*5}</b></div></div></div>${cmpLine(d)}${banners(d)}`;
  tasks.forEach(t=>{h+=`<div class="rep-blk"><div class="rep-t"><b>Task ${esc(t.task)}</b><span>${esc(TASKS[t.task]||"")}</span><em>${esc(t.word_count)} so'z</em></div>
    ${t.missing?`<div class="rep-off">❌ <b>Javob bermadingiz — Task ${esc(t.task)} yozilmagan, 0 ball.</b></div>`:""}${t.on_topic===false?`<div class="rep-off">⚠️ <b>Mavzuga mos emas — 0 ball.</b> ${esc(t.topic_check||"")}</div>`:""}
    <div class="rep-l">Yozgan matni (o'zgarishsiz)</div><div class="rep-txt">${esc(t.transcript)}</div>
    <div class="rep-l">Xatolar va to'g'ri varianti</div>${errList(t.errors)}${crTable(t,"Task "+t.task)}${idealBlock(t)}</div>`});
  return h+`</div>`;
}
/* ---- talaffuz oynasi ---- */
function pronHTML(d,clips){
  const P=d.pron||[];if(!P.length) return `<div class="pron"><div class="pron-h">🗣 Talaffuz</div><p>✅ Aniq xato talaffuz qilingan so'z topilmadi.</p></div>`;
  return `<div class="pron" id="pron"><div class="pron-h">🗣 Talaffuz xatolari <small>${P.length} ta so'z · eshiting, solishtiring va qaytadan ayting</small></div>
   <table class="pron-t"><tr><th>So'z</th><th class="pbh">Tinglash va mashq</th><th>Natija</th></tr>${P.map((p,i)=>`<tr data-i="${i}">
    <td><b>${esc(p.word)}</b><small>/${esc(p.ipa||"")}/</small>${p.heard?`<small class="hd">Siz: «${esc(p.heard)}»</small>`:""}<small class="tp">${esc(p.tip||"")}</small></td>
    <td class="pb"><button type="button" data-a="mine" ${clips&&clips[(p.clip||1)-1]?"":"disabled"} title="Sizning talaffuzingiz">▶<span>Siz</span></button>
     <button type="button" data-a="right" title="To'g'ri talaffuz">🔊<span>To'g'ri</span></button>
     <button type="button" data-a="rec" title="Yozib oling">🎤<span>Ayting</span></button></td>
    <td><div class="pct" data-p>—</div></td></tr>`).join("")}</table></div>`;
}
function wirePron(box,d,clips){
  const P=d.pron||[];const urls=(clips||[]).map(c=>c&&c.blob?URL.createObjectURL(c.blob):null);d._pct=d._pct||{};
  box.querySelectorAll("#pron tr[data-i]").forEach(tr=>{const p=P[+tr.dataset.i];const pc=tr.querySelector("[data-p]");
    tr.querySelector('[data-a="mine"]').onclick=async e=>{const c=(clips||[])[(p.clip||1)-1];if(!c||!c.blob)return;const btn=e.currentTarget;
      try{const A=window._ac||(window._ac=new (window.AudioContext||window.webkitAudioContext)());if(A.state==="suspended")await A.resume();
        if(!c.buf){c.buf=await A.decodeAudioData(await c.blob.arrayBuffer())}
        const s=Math.max(0,(+p.start||0)-.3),en=Math.min(c.buf.duration,Math.max((+p.end||0),s+.6)+.35);
        if(window._src)try{window._src.stop()}catch(_){}const src=A.createBufferSource();src.buffer=c.buf;src.connect(A.destination);
        src.start(0,Math.min(s,Math.max(0,c.buf.duration-.5)),Math.max(.6,en-s));window._src=src;btn.classList.add("play");src.onended=()=>btn.classList.remove("play")}
      catch(err){const u=urls[(p.clip||1)-1];if(u){const a=new Audio(u);a.play().catch(()=>{})}}};
    tr.querySelector('[data-a="right"]').onclick=()=>sayWord(p.word);
    const rb=tr.querySelector('[data-a="rec"]');let rec=null;
    rb.onclick=async()=>{if(rec&&rec.state==="recording"){rec.stop();return}
      try{const st=await navigator.mediaDevices.getUserMedia({audio:true});const mt=["audio/webm;codecs=opus","audio/mp4","audio/webm"].find(m=>window.MediaRecorder&&MediaRecorder.isTypeSupported(m))||"";
        rec=new MediaRecorder(st,mt?{mimeType:mt}:{});const ch=[];rec.ondataavailable=e=>e.data.size&&ch.push(e.data);
        rec.onstop=async()=>{st.getTracks().forEach(t=>t.stop());rb.classList.remove("on");const bl=new Blob(ch,{type:rec.mimeType||"audio/webm"});
          pc.textContent="⏳";pc.style.background="";
          try{const r=await post("/pron",{code:ls.get("aok_code"),word:p.word,audio:await b64(bl),mime:bl.type});
            LOG.add("pron_try",{word:p.word,score:r.score});pc.textContent=r.score+"%";pc.style.background=`hsl(${Math.round(r.score*1.2)},72%,${r.score>55?38:45}%)`;pc.title=r.tip||"";pc.style.color="#fff";d._pct[p.word]=r.score;
            let t=tr.querySelector(".ptip");if(!t){t=document.createElement("small");t.className="ptip";pc.after(t)}t.textContent=(r.heard?`«${r.heard}» · `:"")+(r.tip||"")}
          catch(err){pc.textContent="⚠";pc.title=err.message}};
        rec.start();rb.classList.add("on");setTimeout(()=>{if(rec.state==="recording")rec.stop()},3000)}catch(e){alert("Mikrofonga ruxsat bering")}};
  });
}
/* ---- A4 sahifalar (feedback + talaffuz % natijalari) ---- */
async function a4Pages(box,d){
  const W=794,H=1123,S=1.6;const holder=document.createElement("div");holder.className="a4";
  holder.innerHTML=`<div class="a4-top"><b>AOK English</b> · AI Checker · ${esc(d.kind==="speaking"?"Speaking":"Writing")} · ${dt(d.at||Date.now())}</div>`+[...box.querySelectorAll(".pron,#rep")].map(x=>x.outerHTML).join("");
  document.body.appendChild(holder);
  try{
    const cv=await html2canvas(holder,{scale:S,backgroundColor:"#ffffff",width:W,windowWidth:W});
    const pw=cv.width,ph=Math.round(H*S),foot=Math.round(34*S),usable=ph-foot;const ctx=cv.getContext("2d");
    const white=y=>{const row=ctx.getImageData(0,y,pw,1).data;for(let i=0;i<row.length;i+=16){if(row[i]<245||row[i+1]<245||row[i+2]<245)return false}return true};
    const cuts=[0];let y=0;
    while(y+usable<cv.height&&cuts.length<20){let c=y+usable;for(let k=0;k<Math.round(260*S);k+=2){if(white(y+usable-k)){c=y+usable-k;break}}cuts.push(c);y=c}
    cuts.push(cv.height);const pages=[];const n=cuts.length-1;
    for(let i=0;i<n;i++){const pg=document.createElement("canvas");pg.width=pw;pg.height=ph;const g=pg.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,pw,ph);
      g.drawImage(cv,0,cuts[i],pw,cuts[i+1]-cuts[i],0,0,pw,cuts[i+1]-cuts[i]);
      g.fillStyle="#5b6b86";g.font=`${Math.round(12*S)}px sans-serif`;g.textAlign="center";g.fillText(`AOK English · ${d.student_name||""} · ${i+1}/${n}`,pw/2,ph-Math.round(14*S));
      pages.push(await new Promise(r=>pg.toBlob(r,"image/png")))}
    return pages;
  }finally{holder.remove()}
}
function tgCaption(d){
  const e=s=>esc(s).replace(/&quot;/g,'"');const L=[];
  if(d.kind==="speaking"){L.push(`🎤 <b>Speaking</b> · ${e(MODES[d.mode]||"")}${d.title?" · "+e(d.title):""}`);L.push(`👤 ${e(d.student_name)}`);
    L.push(`⭐ Overall: <b>${fmt(d.overall)} / 5</b>${d.prev?` (oldingi: ${fmt(d.prev.tot)}${d.overall>d.prev.tot?" ↑":d.overall<d.prev.tot?" ↓":" →"})`:""}`);
    L.push((d.parts||[]).map(p=>`Part ${p.part}: ${fmt(p.overall)}`).join(" · "));
    const pc=Object.entries(d._pct||{});if(pc.length)L.push(`🗣 Talaffuz mashqi: ${pc.map(([w,s])=>`${e(w)} ${s}%`).join(" · ")}`);else if((d.pron||[]).length)L.push(`🗣 Talaffuz xatolari: ${d.pron.length} ta so'z`);
    if(d.away&&d.away.n)L.push(`🚪 Imtihondan ${d.away.n} marta chiqib ketgan (${Math.round(d.away.s)} s)`)}
  else{L.push(`✍️ <b>Writing</b> · ${e(MODES[d.mode]||"")}${d.title?" · "+e(d.title):""}`);L.push(`👤 ${e(d.student_name)}`);
    L.push(`⭐ Jami: <b>${fmt(d.total)} / ${d.max}</b>${d.prev?` (oldingi: ${fmt(d.prev.tot)}/${d.prev.max}${d.total/d.max>d.prev.tot/d.prev.max?" ↑":d.total/d.max<d.prev.tot/d.prev.max?" ↓":" →"})`:""}`);
    L.push((d.tasks||[]).map(t=>`Task ${t.task}: ${fmt(t.overall)}`).join(" · "))}
  if(d.repeats)L.push(`🔁 Takroriy xatolar: ${d.repeats} ta`);if(d.late)L.push("⏰ Muddatdan kech topshirildi");
  return L.join("\n");
}
async function sendTG(box,d,btn,auto){
  if(d._sent){msg("✅ Bu natija allaqachon guruhga yuborilgan — qayta tashlanmaydi.");return}
  btn.disabled=true;btn.textContent=auto?"⏳ Guruhga avtomatik yuborilmoqda…":"⏳ Tayyorlanmoqda…";
  let job=null;
  try{const pages=await a4Pages(box,d);
    job={key:d.key,code:ls.get("aok_code"),caption:tgCaption(d),pages,videos:d.kind==="speaking"?VSEG.slice():[],auto:!!auto,at:Date.now()};
    await outboxPut(job);VSEG=[];               // navbatga yozildi — sahifa yopilsa ham yo'qolmaydi
    btn.textContent="⏳ Yuborilmoqda…";
    let ok=false,last="";
    for(let i=0;i<6&&!ok;i++){try{const r=await sendJob(job);ok=true;if(r.dup)LOG.add("send_dup")}catch(e){last=e.message;if(e.fatal)break;btn.textContent=`⏳ Internet sekin — qayta urinilmoqda (${i+2}/6)…`;await sleep(5000*(i+1))}}
    if(!ok) throw new Error(last||"yuborilmadi");
    await outboxDel(job.key);d._sent=true;LOG.add("sent_ok",{auto:auto?1:0,videos:job.videos.length,pages:pages.length});
    const hadVideo=job.videos.length;msg(hadVideo?"✅ Video va feedback guruhdagi topic'ingizga yuborildi.":"✅ Feedback guruhdagi topic'ingizga yuborildi.");
    if(d.kind==="speaking"&&(d.pron||[]).length){btn.disabled=false;btn.textContent="📤 Talaffuz natijasini jo'natish";btn.onclick=e=>sendPron(d,e.currentTarget)}
    else btn.textContent="✅ Telegram'ga yuborildi";
    const h=box.querySelector(".send-hint");if(h)h.textContent=d.kind==="speaking"&&(d.pron||[]).length?"✅ Video va feedback topic'ingizga tushdi. Endi talaffuz mashqini bajaring (🎤 Ayting) va «📤 Talaffuz natijasini jo'natish»ni bosing. Mashq qilmasangiz, bot 30 daqiqadan keyin «talaffuz mashqini qilmadingiz» deb yozadi.":"✅ Feedback topic'ingizga tushdi."}
  catch(e){LOG.add("send_fail",{msg:e.message});
    if(job){btn.disabled=true;btn.textContent="⏳ Navbatda — internet tiklanishi bilan o'zi yuboriladi";msg("⚠️ Hozir yuborilmadi ("+e.message+"). Natija saqlangan — internet tiklanishi bilan o'zi yuboriladi, sahifani yopsangiz ham keyingi kirishda yuboriladi.",true);d._sent=true}
    else{btn.disabled=false;btn.textContent="📤 Jo'nat";msg("❌ "+e.message,true)}}
}
async function sendPron(d,btn){
  const pc=Object.entries(d._pct||{});if(!pc.length) return msg("Avval kamida bitta so'zni 🎤 Ayting tugmasi bilan mashq qiling.",true);
  const sig=JSON.stringify(pc);if(d._pronSig===sig){msg("✅ Bu talaffuz natijasi allaqachon yuborilgan. Yana mashq qilsangiz, yangi natijani yuborishingiz mumkin.");return}
  btn.disabled=true;const e=s=>esc(s).replace(/&quot;/g,'"');
  const cap=`🗣 <b>Talaffuz mashqi</b> — ${e(d.student_name)}\n`+pc.map(([w,v])=>`${v>=80?"🟢":v>=55?"🟡":"🔴"} ${e(w)} — <b>${v}%</b>`).join("\n")+`\n\nO'rtacha: <b>${Math.round(pc.reduce((a,[,v])=>a+v,0)/pc.length)}%</b> · ${pc.length}/${(d.pron||[]).length} so'z mashq qilindi`;
  try{const fd=new FormData();fd.append("code",ls.get("aok_code"));fd.append("key",d.key);fd.append("extra","pron");fd.append("caption",cap);fd.append("n",pc.length);fd.append("avg",Math.round(pc.reduce((a,[,v])=>a+v,0)/pc.length));
    const r=await fetch(API+"/send",{method:"POST",body:fd});const j=await r.json().catch(()=>({}));if(!r.ok||j.error) throw new Error(j.error||("Server xatosi "+r.status));
    d._pronSig=sig;msg("✅ Talaffuz natijalari topic'ingizga yuborildi.");btn.textContent="✅ Talaffuz yuborildi · yana mashq qilsangiz qayta bosing";btn.disabled=false}
  catch(err){btn.disabled=false;msg("❌ "+err.message,true)}
}
async function saveA4(box,d,btn){btn.disabled=true;try{const pages=await a4Pages(box,d);pages.forEach((p,i)=>{const a=document.createElement("a");a.download=`${(d.student_name||"oquvchi").replace(/\s+/g,"_")}_${d.kind}_${i+1}.png`;a.href=URL.createObjectURL(p);a.click()})}catch(e){alert("Saqlanmadi: "+e.message)}btn.disabled=false}
function showReport(box,d,clips,acts){
  const send=d.can_send&&PAGE!=="teacher"?`<button class="ck-go" data-act="send">📤 Jo'nat${d.kind==="speaking"&&VSEG.length?" (video + feedback)":""}</button>`:"";
  const autoSend=!!(send&&(d.mode==="hw"||d.mode==="exam"));
  box.innerHTML=`<div class="rep-wrap">${(d.kind==="speaking"?pronHTML(d,clips):"")+reportHTML(d)}</div><div class="rep-acts">${send}${acts||""}<button class="pri" data-act="a4">📄 A4 sahifalarni saqlash</button></div>
    ${send?`<p class="hint send-hint">${autoSend?"⏳ Vazifa/Exam natijasi guruhdagi topic'ingizga avtomatik yuborilmoqda…":`📤 Jo'nat — feedback A4 sahifalarda guruhdagi topic'ingizga tushadi. Avval talaffuz mashqini bajarsangiz, foizlar ham qo'shiladi.`}</p>`:""}`;
  box.hidden=false;box.scrollIntoView({behavior:"smooth"});
  if(d.kind==="speaking") wirePron(box,d,clips);
  box.querySelector('[data-act="a4"]').onclick=e=>saveA4(box,d,e.currentTarget);
  const sb=box.querySelector('[data-act="send"]');if(sb){sb.onclick=e=>sendTG(box,d,e.currentTarget);if(autoSend&&!d._sent)setTimeout(()=>sendTG(box,d,sb,true),600)}
}

/* ================= O'QUVCHI: kirish + oynalar ================= */
let HOME=null,ME=null;
async function studentLogin(btn){
  msg("");const code=$("#ck_code").value.trim();if(!code) return msg("PIN kodni kiriting.",true);
  loading(true,btn,"Kirilmoqda…");
  try{HOME=await post("/home",{code,kind:PAGE});ls.set("aok_code",code);ME=HOME.me;renderHome();step(2);checkResume();LOG.add("login",{page:PAGE});outboxFlush()}catch(e){msg("❌ "+e.message,true)}
  loading(false,btn);
}
const left=t=>{const s=Math.max(0,t-Date.now())/1000;const d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);return d?`${d} kun ${h} soat`:h?`${h} soat ${m} daqiqa`:`${m} daqiqa`};
function renderHome(){
  const H=HOME;const parts=PAGE==="writing"?["T1","T2"]:["1.1","1.2","2","3"];
  const mb=$("#meBox");if(mb){mb.hidden=!ME;if(ME)mb.innerHTML=`👋 <b>${esc(ME.name)}</b>${ME.group?` · ${esc(ME.group)}`:""}${ME.linked?"":` <small>(Telegram topic hali ulanmagan)</small>`}`}
  const nm=$("#ck_name");if(nm)nm.closest("label").hidden=!!ME;
  const hw=H.homework;
  $("#pHw").innerHTML=hw?`<div class="hw-t">${esc(hw.title)} <small>${dt(hw.at)}</small></div>
     ${hw.due?`<div class="hw-due ${hw.due<Date.now()?"late":""}">⏰ Muddat: <b>${dt(hw.due)}</b> · ${hw.due<Date.now()?"muddat o'tgan — baribir topshiring":left(hw.due)+" qoldi"}</div>`:""}
     ${hw.done?`<div class="hw-done">✅ Siz bu vazifani topshirgansiz (${dt(hw.done.at)}) · ${fmt(hw.done.tot)} / ${hw.done.max}. Qayta topshirishingiz mumkin.</div>`:""}
     ${hw.items.map(itemHTML).join("")}<button type="button" class="ck-go" data-start="hw">▶ Vazifani boshlash</button>`:`<div class="ck-msg">Hozircha uyga vazifa berilmagan.</div>`;
  $("#pBaza").innerHTML=`<p class="hint">Bir yoki bir nechta bo'limni tanlang — savollar bazadan tasodifiy olinadi va ketma-ket beriladi.</p>
    <div class="sec-pick">${parts.map(p=>`<label><input type="checkbox" value="${p}" ${H.counts[p]?"":"disabled"}><span>${PNAME[p]}<small>${H.counts[p]||0} ta savol</small></span></label>`).join("")}</div>
    <label class="tp-l">Mavzu<select id="bTopic"><option value="">Barcha mavzular</option>${Object.keys(H.topics).sort().map(t=>`<option>${esc(t)}</option>`).join("")}</select></label>
    <button type="button" class="ck-go" data-start="baza">▶ Boshlash</button>`;
  $("#pExam").innerHTML=H.exams.length?`<p class="hint">Imtihonni tanlang — savollar o'qituvchi tanlagan to'plamdan har kimga alohida tasodifiy tuziladi. ⚠️ Imtihon vaqti boshqa joyga chiqib ketsangiz ham to'xtamaydi.</p>
    ${H.exams.map((e,i)=>`<label class="ck-asg"><input type="radio" name="exam" value="${esc(e.id)}" ${i?"":"checked"}><div><b>${esc(e.name)}</b><small>${dt(e.at)}</small></div></label>`).join("")}
    <button type="button" class="ck-go" data-start="exam">▶ Imtihonni boshlash</button>`:`<div class="ck-msg">Hozircha faol imtihon yo'q.</div>`;
  const mt=$('.tabs button[data-t="me"]');if(mt)mt.hidden=!ME;
  tab(hw&&!hw.done?"hw":"baza");
}
function tab(t){$$(".tabs button").forEach(b=>b.classList.toggle("on",b.dataset.t===t));$$(".tabp").forEach(p=>p.hidden=p.dataset.t!==t);if(t==="me")loadMe()}
if(PAGE!=="teacher"&&$(".tabs")) $(".tabs").addEventListener("click",e=>{const b=e.target.closest("button");if(b)tab(b.dataset.t)});
const codeIn=$("#ck_code");if(codeIn){codeIn.value=ls.get("aok_code");codeIn.addEventListener("keydown",e=>{if(e.key==="Enter")$("#goLogin").click()})}
if(!API) msg("⚙️ Checker hali ulanmagan. O'qituvchiga murojaat qiling.",true);

/* ================= 📈 NATIJALARIM (profil, chartlar, tahlil) ================= */
const COLORS=["#2E7D32","#1565C0","#EF6C00","#8E24AA","#C62828"];
function lineSVG(series,labels,max,unit=""){
  const W=680,H=250,pl=34,pr=12,pt=12,pb=28,n=labels.length;if(n<1)return"";
  const X=i=>pl+(n===1?(W-pl-pr)/2:i*(W-pl-pr)/(n-1)),Y=v=>pt+(H-pt-pb)*(1-v/max);
  let g="";for(let k=0;k<=5;k++){const v=max*k/5,y=Y(v);g+=`<line x1="${pl}" x2="${W-pr}" y1="${y}" y2="${y}" class="gl"/><text x="${pl-6}" y="${y+4}" text-anchor="end" class="ax">${Math.round(v*10)/10}${unit}</text>`}
  const step=Math.max(1,Math.ceil(n/8));labels.forEach((l,i)=>{if(i%step===0||i===n-1)g+=`<text x="${X(i)}" y="${H-8}" text-anchor="middle" class="ax">${esc(l)}</text>`});
  series.forEach((s,si)=>{const pts=s.data.map((v,i)=>v==null?null:[X(i),Y(v)]);let d="",pen=false;pts.forEach(p=>{if(!p){pen=false;return}d+=(pen?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1);pen=true});
    g+=`<path d="${d}" fill="none" stroke="${s.color||COLORS[si%5]}" stroke-width="2.6" stroke-linejoin="round"/>`+pts.filter(Boolean).map(p=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.4" fill="${s.color||COLORS[si%5]}"/>`).join("")});
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img">${g}</svg><div class="lg">${series.map((s,si)=>`<span><i style="background:${s.color||COLORS[si%5]}"></i>${esc(s.name)}</span>`).join("")}</div></div>`;
}
function trend(vals){const v=vals.filter(x=>x!=null);if(v.length<2)return null;const k=Math.min(3,Math.floor(v.length/2))||1;const a=v.slice(-k),b=v.slice(-2*k,-k);if(!b.length)return null;
  const d=a.reduce((x,y)=>x+y,0)/a.length-b.reduce((x,y)=>x+y,0)/b.length;return d}
async function loadMe(){
  const box=$("#pMe");if(!box||!ME)return;box.innerHTML=`<div class="ck-load"><div class="ck-spin"></div><span>Natijalar yuklanmoqda…</span></div>`;
  let M;try{M=await post("/me",{code:ls.get("aok_code"),kind:PAGE})}catch(e){box.innerHTML=`<div class="ck-msg err">❌ ${esc(e.message)}</div>`;return}
  const H=(M.h||[]).filter(e=>e.k===PAGE);let h=`<div class="me-h">📈 <b>${esc(M.name)}</b> · ${esc(M.group||"")} — ${PAGE==="speaking"?"Speaking":"Writing"} natijalari</div>`;
  if(!H.length) h+=`<div class="ck-msg">Hali ${PAGE==="speaking"?"Speaking":"Writing"} topshirmagansiz. Birinchi natijadan keyin bu yerda chartlar paydo bo'ladi.</div>`;
  else{
    const labels=H.map(e=>dt(e.at).slice(0,5));
    const names=[...new Set(H.flatMap(e=>Object.keys(e.cr||{})))];
    const ov=H.map(e=>Math.round(e.tot/(e.max||5)*1000)/10);
    h+=`<div class="me-l">Umumiy natija (%)</div>`+lineSVG([{name:"Umumiy %",data:ov,color:"#1F3864"}],labels,100,"");
    h+=`<div class="me-l">Har bir kriteriya bo'yicha (0–5)</div>`+lineSVG(names.map((n,i)=>({name:n,data:H.map(e=>e.cr&&e.cr[n]!=null?e.cr[n]:null),color:COLORS[i%5]})),labels,5);
    const rows=names.map(n=>{const vals=H.map(e=>e.cr&&e.cr[n]!=null?e.cr[n]:null);const t=trend(vals);const last=vals.filter(x=>x!=null).slice(-1)[0];
      return `<tr><td>${esc(n)}</td><td><b>${last!=null?last:"—"}</b> / 5</td><td class="${t==null?"":t>0.15?"up":t<-0.15?"dn":""}">${t==null?"— (kam ma'lumot)":t>0.15?`↑ o'syapti (+${t.toFixed(1)})`:t<-0.15?`↓ tushyapti (${t.toFixed(1)})`:"→ bir xil"}</td></tr>`}).join("");
    const to=trend(ov);
    h+=`<div class="me-l">📊 Tahlil</div><div class="me-an ${to==null?"":to>2?"up":to<-2?"dn":""}">${to==null?"Tahlil uchun kamida 2 ta natija kerak.":to>2?`🚀 Natijangiz o'syapti: oxirgi urinishlarda o'rtacha +${to.toFixed(0)}%. Shu tempni ushlang!`:to<-2?`⚠️ Natijangiz pasaymoqda (${to.toFixed(0)}%). Quyidagi kriteriyalar va takroriy xatolarga e'tibor bering.`:"→ Natijangiz barqaror. Keyingi bosqichga chiqish uchun eng past kriteriyani kuchaytiring."}</div>
      <table class="rep-tb"><tr><th>Kriteriya</th><th>Oxirgi</th><th>Dinamika</th></tr>${rows}</table>`;
    const R=Object.entries(M.rules||{}).filter(([,c])=>c>=2).sort((a,b)=>b[1]-a[1]).slice(0,10);
    if(R.length) h+=`<div class="me-l">🔁 Ko'p takrorlanayotgan xatolar</div><ol class="rep-tips">${R.map(([r,c])=>`<li><b>${esc(r)}</b> — ${c} marta</li>`).join("")}</ol>`;
    h+=`<div class="me-l">🗂 Topshirishlar tarixi</div><table class="rep-tb"><tr><th>Sana</th><th>Rejim</th><th>Ball</th></tr>${H.slice().reverse().slice(0,30).map(e=>`<tr><td>${dt(e.at)}</td><td>${esc(MODES[e.m]||"")} <small>${esc(e.t||"")}</small>${e.late?" ⏰":""}</td><td><b>${fmt(e.tot)} / ${e.max}</b></td></tr>`).join("")}</table>`;
  }
  if((M.days||[]).length) h+=`<div class="me-l">📋 Darsdagi baholar (oxirgi 4 hafta)</div><table class="rep-tb"><tr><th>Sana</th><th>Belgi</th><th>Baholar</th></tr>${M.days.map(x=>`<tr><td>${esc(x.d.slice(8,10)+"."+x.d.slice(5,7))}</td><td>${esc(x.m)}</td><td>${Object.entries(x.it).map(([k,v])=>`${esc(k)}: ${esc(v)}`).join(" · ")}</td></tr>`).join("")}</table>`;
  box.innerHTML=h;
}

/* ================= BOSHLASH ================= */
let RUN=null;
async function startRun(mode,btn){
  msg("");
  if(PAGE==="speaking"&&!ME){const n=$("#ck_name").value.trim();if(!n) return msg("Ism familiyangizni yozing.",true);ls.set("aok_name",n)}
  let data;
  try{
    if(mode==="hw") data={title:HOME.homework.title,items:HOME.homework.items};
    else if(mode==="baza"){const secs=$$("#pBaza .sec-pick input:checked").map(x=>x.value);if(!secs.length) return msg("Kamida bitta bo'limni tanlang.",true);
      loading(true,btn,"Savollar tayyorlanmoqda…");data=await post("/start",{code:ls.get("aok_code"),kind:PAGE,mode:"baza",sections:secs,topic:$("#bTopic").value})}
    else {const r=$('input[name="exam"]:checked');if(!r) return msg("Imtihonni tanlang.",true);
      const saved=PAGE==="writing"?JSON.parse(ls.get("aok_wexam")||"null"):null;
      if(saved&&saved.exam===r.value&&saved.code===ls.get("aok_code")&&saved.deadline>Date.now()-3600e3) data=saved.data;  // sahifa yangilansa ham o'sha savollar va o'sha vaqt
      else{loading(true,btn,"Imtihon tuzilmoqda…");data=await post("/start",{code:ls.get("aok_code"),kind:PAGE,mode:"exam",exam:r.value});data.exam=r.value}}
  }catch(e){loading(false,btn);return msg("❌ "+e.message,true)}
  loading(false,btn);RUN={mode,title:data.title,items:data.items,exam:data.exam};LOG.add("start",{page:PAGE,mode,title:data.title||"",n:(data.items||[]).length});LOG.flush();
  PAGE==="writing"?writingRun():speakingRun();
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-start]");if(b)startRun(b.dataset.start,b)});

/* ================= WRITING ================= */
const IM=[];let wTimer=null;
function writingRun(){
  $("#wPaper").innerHTML=`<div class="hw-t">${esc(MODES[RUN.mode])} · ${esc(RUN.title||"")}</div>`+RUN.items.map(itemHTML).join("");
  IM.length=0;th();step(3);clearInterval(wTimer);const T=$("#wTimer");
  if(RUN.mode==="exam"){
    let sv=JSON.parse(ls.get("aok_wexam")||"null");
    if(!sv||sv.exam!==RUN.exam||sv.code!==ls.get("aok_code")){sv={exam:RUN.exam,code:ls.get("aok_code"),deadline:Date.now()+60*60e3,data:{title:RUN.title,items:RUN.items,exam:RUN.exam}};ls.set("aok_wexam",JSON.stringify(sv))}
    RUN.deadline=sv.deadline;T.hidden=false;let fired=false;
    const upd=()=>{const s=Math.max(0,Math.round((RUN.deadline-Date.now())/1000));T.innerHTML=s?`⏱ <b>${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}</b> qoldi`:"⏱ <b>Vaqt tugadi!</b>";T.classList.toggle("low",s<300);
      if(!s&&!fired){fired=true;beep(660,600);if(IM.length){msg("⏱ Vaqt tugadi — javobingiz avtomatik yuborilmoqda.");$("#goWriting").click()}else msg("⏱ Vaqt tugadi! Rasmlarni darhol yuklang va «Tekshirish»ni bosing.",true)}};
    upd();wTimer=setInterval(upd,1000)}
  else T.hidden=true;
}
const th=()=>{const b=$("#thumbs");if(!b)return;b.innerHTML="";IM.forEach((im,i)=>{const f=document.createElement("figure");
  f.innerHTML=`<img src="${im.thumb}" alt="rasm ${i+1}"><button type="button" aria-label="O'chirish">×</button>`;f.querySelector("button").onclick=()=>{IM.splice(i,1);th()};b.appendChild(f)});
  $("#goWriting").disabled=!IM.length};
if(PAGE==="writing"){
  $("#goLogin").onclick=e=>studentLogin(e.currentTarget);
  $("#files").addEventListener("change",async e=>{LOG.add("photo",{n:e.target.files.length});for(const f of [...e.target.files].slice(0,8-IM.length)){try{IM.push(await compress(f))}catch(err){msg(err.message,true)}}e.target.value="";th()});
  $("#wBack").onclick=()=>{clearInterval(wTimer);step(2)};
  $("#goWriting").onclick=async e=>{const btn=e.currentTarget;msg("");if(!IM.length) return msg("Rasm yuklang.",true);if(btn.disabled&&btn._busy)return;btn._busy=true;
    const lab="AI xatingizni o'qiyapti, ismingiz va Task'larni aniqlayapti, ideal javobni tekshiryapti… (30–90 soniya)";loading(true,btn,lab);LOG.add("submit",{page:"writing",photos:IM.length});LOG.flush();
    try{const d=await postRetry("/writing",{code:ls.get("aok_code"),mode:RUN.mode,title:RUN.title,ids:RUN.items.map(x=>x.id),images:IM.map(({mime,data})=>({mime,data}))},lab);
      clearInterval(wTimer);if(RUN.mode==="exam")ls.del("aok_wexam");step(4);showReport($("#ckResult"),d,null,`<button data-act="again">🏠 Bosh oyna</button>`);
      if(d.saved) msg("✅ Natija saqlandi"+(d.can_send?". «📤 Jo'nat» tugmasi bilan Telegram topic'ingizga yuboring.":"."));
      $('[data-act="again"]').onclick=()=>{$("#ckResult").hidden=true;msg("");refreshHome();step(2)}}
    catch(err){LOG.add("error",{msg:err.message});msg("❌ "+err.message,true)}
    btn._busy=false;loading(false,btn)};
}
async function refreshHome(){try{HOME=await post("/home",{code:ls.get("aok_code"),kind:PAGE});ME=HOME.me;renderHome()}catch(e){}}

/* ================= SPEAKING (imtihon kabi + video + davom ettirish) ================= */
function buildSteps(items){
  const S=[];const by=p=>items.filter(x=>x.part===p);
  const p11=by("1.1");p11.forEach((it,i)=>S.push({it,part:"1.1",q:it.q[0],prep:5,ans:30,lab:`Part 1.1 · Savol ${i+1}/${p11.length}`}));
  by("1.2").forEach(it=>it.q.forEach((q,i)=>S.push({it,part:"1.2",q,prep:i?5:10,ans:i?30:45,lab:`Part 1.2 · Savol ${i+1}/${it.q.length}`,img:true})));
  by("2").forEach(it=>S.push({it,part:"2",q:it.q.join(" "),qs:it.q,prep:60,ans:120,lab:"Part 2",img:true}));
  by("3").forEach(it=>S.push({it,part:"3",q:`${it.q[0]} FOR: ${(it.for||[]).join("; ")}. AGAINST: ${(it.against||[]).join("; ")}.`,p3:true,prep:60,ans:120,lab:"Part 3"}));
  return S;
}
let STREAM=null,CLIPS=[],VREC=null,VCH=[],VSEG=[],CUR=null,AWAY={n:0,s:0,t0:0},HIDDEN_DURING=false;
const R=2*Math.PI*54;
function ring(sec,total,phase){const el=$("#ring");el.querySelector(".fg").style.strokeDashoffset=String(R*(1-sec/total));
  el.querySelector(".t").textContent=sec>=60?`${Math.floor(sec/60)}:${String(sec%60).padStart(2,"0")}`:String(sec);el.className="ring "+phase}
/* vaqt soat bo'yicha hisoblanadi — boshqa joyga chiqib ketsa ham sanoq to'xtamaydi */
function countdown(total,phase){return new Promise(res=>{const end=Date.now()+total*1000;let done=false;
  const fin=r=>{if(done)return;done=true;clearInterval(id);CUR=null;res(r)};
  const tick=()=>{const l=Math.max(0,Math.ceil((end-Date.now())/1000));ring(l,total,phase);if(l<=0)fin("time")};
  const id=setInterval(tick,250);tick();CUR={fin,phase}})}
const vis=()=>new Promise(r=>{if(!document.hidden)return r();const f=()=>{if(!document.hidden){document.removeEventListener("visibilitychange",f);r()}};document.addEventListener("visibilitychange",f)});
document.addEventListener("visibilitychange",()=>{if(!RUN||PAGE!=="speaking"||!RUN.live)return;
  if(document.hidden){AWAY.n++;AWAY.t0=Date.now();if(RUN.mode!=="exam"&&CUR)CUR.fin("away")}
  else if(AWAY.t0){const sec=Math.round((Date.now()-AWAY.t0)/1000);AWAY.s+=sec;AWAY.t0=0;saveRun();LOG.add("away",{sec,mode:RUN.mode})}});
async function getStream(video){
  try{return await navigator.mediaDevices.getUserMedia(video?{audio:{echoCancellation:true,noiseSuppression:true},video:{facingMode:"user",width:{ideal:320},height:{ideal:240},frameRate:{ideal:15,max:20}}}:{audio:true})}
  catch(e){if(video){msg("⚠️ Kamera ochilmadi — faqat ovoz yoziladi.",true);return navigator.mediaDevices.getUserMedia({audio:true})}throw e}
}
function startVideo(){
  if(!STREAM.getVideoTracks().length)return;const cam=$("#rCam");if(cam){cam.srcObject=STREAM;cam.hidden=false;cam.play().catch(()=>{})}
  const mt=["video/mp4;codecs=avc1,mp4a","video/mp4","video/webm;codecs=vp8,opus","video/webm"].find(m=>window.MediaRecorder&&MediaRecorder.isTypeSupported(m))||"";
  try{VREC=new MediaRecorder(STREAM,{...(mt?{mimeType:mt}:{}),videoBitsPerSecond:160000,audioBitsPerSecond:32000});VCH=[];
    VREC.ondataavailable=e=>e.data.size&&VCH.push(e.data);VREC.onstop=()=>{if(VCH.length)VSEG.push(new Blob(VCH,{type:VREC.mimeType||"video/webm"}));VCH=[]};VREC.start(1000)}catch(e){VREC=null}
}
const stopVideo=()=>new Promise(r=>{if(!VREC||VREC.state==="inactive")return r();const o=VREC.onstop;VREC.onstop=()=>{o&&o();r()};VREC.stop()});
const runKey=()=>"sp:"+ls.get("aok_code");
function saveRun(){if(!RUN)return;idb.set(runKey(),{at:Date.now(),mode:RUN.mode,title:RUN.title,items:RUN.items,i:RUN.i||0,away:AWAY,
  clips:CLIPS.map(c=>({part:c.part,question:c.question,blob:c.blob,empty:!!c.empty}))})}
async function checkResume(){
  if(PAGE!=="speaking")return;const s=await idb.get(runKey());const box=$("#resumeBox");if(!box)return;
  if(!s||Date.now()-s.at>6*3600e3){box.hidden=true;if(s)idb.del(runKey());return}
  const total=buildSteps(s.items).length;
  box.hidden=false;box.innerHTML=`🔄 <b>Tugallanmagan topshiriq:</b> ${esc(MODES[s.mode]||"")} · ${esc(s.title||"")} — ${s.clips.length}/${total} savol bajarilgan.
    <div class="rep-acts"><button type="button" class="ck-go" id="rsGo">▶ Davom ettirish</button><button type="button" class="ck-go alt" id="rsDel">🗑 Bekor qilish</button></div>`;
  $("#rsGo").onclick=()=>{box.hidden=true;LOG.add("resume",{done:s.clips.length,of:total});RUN={mode:s.mode,title:s.title,items:s.items};CLIPS=s.clips;AWAY=s.away||{n:0,s:0};
    if(s.mode==="exam"&&s.clips.length<total){CLIPS.push({part:buildSteps(s.items)[s.clips.length].part,question:buildSteps(s.items)[s.clips.length].q,blob:new Blob([],{type:"audio/webm"}),empty:true});AWAY.n++}
    speakingRun(true)};
  $("#rsDel").onclick=()=>{idb.del(runKey());box.hidden=true}
}
async function speakingRun(resume){
  const steps=buildSteps(RUN.items);if(!steps.length) return msg("Savol topilmadi.",true);
  const withVideo=!!(ME&&ME.linked&&RUN.mode!=="baza");
  try{STREAM=await getStream(withVideo)}catch(e){return msg("Mikrofonga ruxsat bering: "+e.message,true)}
  if(!resume){CLIPS=[];AWAY={n:0,s:0,t0:0};VSEG=[]}
  RUN.live=true;step(3);if(withVideo)startVideo();
  $("#rNote").innerHTML=RUN.mode==="exam"?"📝 <b>Imtihon rejimi:</b> boshqa joyga chiqsangiz ham vaqt to'xtamaydi va bu o'qituvchiga ko'rinadi.":"⏸ Boshqa joyga chiqib ketsangiz, savol qaytadan boshlanadi.";
  for(let i=CLIPS.length;i<steps.length;i++){const s=steps[i];RUN.i=i;
    $("#rLab").textContent=s.lab;$("#rProg").textContent=`${i+1} / ${steps.length}`;
    const im=s.img?(s.it.images||[]).map(x=>`<img src="${esc(imgSrc(x))}" alt="">`).join(""):"";
    $("#rQ").innerHTML=(im?`<div class="ex-imgs n${(s.it.images||[]).length}">${im}</div>`:"")+
      (s.p3?`<p class="ex-big">${esc(s.it.q[0])}</p>${p3table(s.it)}`:s.qs?`<ol>${s.qs.map(q=>`<li>${esc(q)}</li>`).join("")}</ol>`:`<p class="ex-big">${esc(s.q)}</p>`);
    $("#rPhase").textContent="Tayyorlaning";$("#rSkip").textContent="⏭ Tayyorman";
    let r=await countdown(s.prep,"prep");
    if(r==="away"){await vis();msg("⏸ Siz chiqib ketdingiz — bu savol qaytadan boshlanadi.",true);i--;continue}
    if(STREAM.getAudioTracks().every(t=>t.readyState==="ended")){try{STREAM=await getStream(withVideo);if(withVideo)startVideo()}catch(e){}}
    const AUD=new MediaStream(STREAM.getAudioTracks());
    const mt=["audio/webm;codecs=opus","audio/mp4","audio/webm"].find(m=>window.MediaRecorder&&MediaRecorder.isTypeSupported(m))||"";
    const rec=new MediaRecorder(AUD,mt?{mimeType:mt}:{});const ch=[];rec.ondataavailable=e=>e.data.size&&ch.push(e.data);
    const done=new Promise(rr=>rec.onstop=rr);beep(880);rec.start();
    $("#rPhase").textContent="🔴 Gapiring";$("#rSkip").textContent="⏹ Tugatdim";
    r=await countdown(s.ans,"ans");try{rec.stop()}catch(e){}await done;
    if(r==="away"){await vis();msg("⏸ Siz chiqib ketdingiz — bu savolga qaytadan javob bering.",true);i--;continue}
    beep(520,160);msg("");
    {const bl=new Blob(ch,{type:rec.mimeType||"audio/webm"});CLIPS.push({part:s.part,question:s.q,blob:bl,empty:bl.size<2500});LOG.add("answer",{q:i+1,of:steps.length,part:s.part,empty:bl.size<2500?1:0,how:r})}
    RUN.i=i+1;saveRun();
  }
  RUN.live=false;await stopVideo();STREAM.getTracks().forEach(t=>t.stop());const cam=$("#rCam");if(cam){cam.srcObject=null;cam.hidden=true}
  step(4);await submitSpeaking();
}
async function submitSpeaking(){
  const lab="AI javoblaringizni tinglab baholayapti va ideal javoblarni tekshiryapti… (30–120 soniya)";loading(true,null,lab);LOG.add("submit",{page:"speaking",n:CLIPS.length});LOG.flush();
  try{const clips=[];for(const c of CLIPS) clips.push({part:c.part,question:c.question,audio:await b64(c.blob),mime:c.blob.type||"audio/webm",empty:!!c.empty||c.blob.size<2500});
    const d=await postRetry("/speaking",{code:ls.get("aok_code"),name:ls.get("aok_name"),mode:RUN.mode,title:RUN.title,clips,away:RUN.mode==="exam"?{n:AWAY.n,s:AWAY.s}:null},lab);
    idb.del(runKey());
    showReport($("#ckResult"),d,CLIPS,`<button data-act="again">🏠 Bosh oyna</button>`);
    if(d.saved) msg("✅ Natija saqlandi"+(d.can_send?". «📤 Jo'nat» bilan video va feedbackni Telegram topic'ingizga yuboring.":"."));
    $('[data-act="again"]').onclick=()=>{if(VSEG.length&&d.can_send&&!d._sent&&!confirm("Video hali yuborilmadi. Chiqsangiz video o'chadi. Chiqasizmi?"))return;VSEG=[];$("#ckResult").hidden=true;msg("");refreshHome();step(2)}}
  catch(err){LOG.add("error",{msg:err.message});msg("❌ "+err.message+" — javoblaringiz saqlangan, qayta yuborish uchun tugmani bosing.",true);$("#ckResult").innerHTML=`<button class="ck-go" id="retry">🔁 Qayta yuborish</button>`;$("#ckResult").hidden=false;
    $("#retry").onclick=()=>{$("#ckResult").hidden=true;msg("");submitSpeaking()}}
  loading(false);
}
if(PAGE==="speaking"){
  $("#goLogin").onclick=e=>studentLogin(e.currentTarget);$("#ck_name").value=ls.get("aok_name");
  $("#rSkip").onclick=()=>CUR&&CUR.fin("skip");
  window.addEventListener("beforeunload",e=>{if(RUN&&RUN.live){e.preventDefault();e.returnValue=""}});
}

/* ================= O'QITUVCHI ================= */
if(PAGE==="teacher"){
  const T=()=>ls.get("aok_tcode");const tIn=$("#t_code");tIn.value=T();
  let KIND="writing",BANK={},HW=null,HWS={},EXAMS=[],GROUPS=[],SEL=new Set(),EDIT=null;
  const partsOf=k=>k==="writing"?["T1","T2"]:["1.1","1.2","2","3"];
  const keyOf=it=>it.kind==="writing"?(it.wtype==="T1"?it.email:it.essay):(it.q||[]).join(" ");
  async function load(){const j=await post("/teacher/bank",{tcode:T(),kind:KIND});BANK=j.bank;HWS=j.homeworks||{};EXAMS=j.exams;GROUPS=j.groups||[];
    const v=$("#hwView");const cur=v.value;v.innerHTML=GROUPS.map(g=>`<option value="${esc(g.id)}">${esc(g.title)}</option>`).join("")||`<option value="">Barcha o'quvchilar</option>`;if(GROUPS.some(g=>g.id===cur))v.value=cur;
    HW=GROUPS.length?(HWS[v.value]||null):(j.homework||null);if(j.me)$("#tWho").textContent=`👋 ${j.me.admin?"Bosh admin":j.me.name} · Baza umumiy · Guruhlar: ${GROUPS.map(g=>g.title).join(", ")||"—"}`;render()}
  $("#goLogin").onclick=async e=>{const btn=e.currentTarget;msg("");const c=tIn.value.trim();if(!c) return msg("O'qituvchi kodini kiriting.",true);
    loading(true,btn,"Kirilmoqda…");try{const j=await post("/teacher/login",{tcode:c});ls.set("aok_tcode",c);await seedCheck(j);await load();step(2)}catch(err){msg("❌ "+err.message,true)}loading(false,btn)};
  let SEED=null;
  async function seedCheck(j){try{SEED=await (await fetch("seed.json",{cache:"no-store"})).json()}catch(e){SEED=null}
    const box=$("#seedBox");if(!SEED||(j.seedv||0)>=(SEED.version||1)){box.hidden=true;return}
    box.hidden=false;box.innerHTML=j.seeded?`🆕 <b>Bazaning yangi versiyasi tayyor</b> (v${SEED.version}): yangi savollar mavzu va turlar bo'yicha. Bazada bor savollar takror qo'shilmaydi, faqat turi belgilanadi.<br><button type="button" class="ck-go" id="seedBtn" style="margin-top:10px">📥 Yangi savollarni yuklash</button>`
      :`📦 Baza hali bo'sh. Barcha savollarni (${SEED.items.length} ta, mavzu va turlarga ajratilgan) yuklang:<br><button type="button" class="ck-go" id="seedBtn" style="margin-top:10px">📥 Bazani yuklash</button>`;
    $("#seedBtn").onclick=async e=>{const btn=e.currentTarget;loading(true,btn,"Baza yuklanmoqda…");
      try{const r=await post("/teacher/import",{tcode:T(),items:SEED.items,version:SEED.version});msg(`✅ Bazaga ${r.added} ta yangi savol qo'shildi${r.updated?`, ${r.updated} tasiga tur belgilandi`:""} (${r.skipped} tasi bor edi).`);box.hidden=true;await load()}catch(err){msg("❌ "+err.message,true)}loading(false,btn)}}
  tIn.addEventListener("keydown",e=>{if(e.key==="Enter")$("#goLogin").click()});
  $$(".ktabs button").forEach(b=>b.onclick=async()=>{KIND=b.dataset.k;$$(".ktabs button").forEach(x=>x.classList.toggle("on",x===b));SEL.clear();EDIT=null;await load()});
  $$(".ttabs button").forEach(b=>b.onclick=()=>{$$(".ttabs button").forEach(x=>x.classList.toggle("on",x===b));$$(".ttp").forEach(p=>p.hidden=p.dataset.t!==b.dataset.t);if(b.dataset.t==="res")loadResults();if(b.dataset.t==="stu")loadStudents();if(b.dataset.t==="log")loadLog()});
  const allItems=()=>partsOf(KIND).flatMap(p=>BANK[p]||[]);
  const topics=()=>[...new Set(allItems().map(x=>x.topic))].sort();
  function render(){
    const fp=$("#fPart"),ft=$("#fTopic");const pv=fp.value,tv=ft.value;
    fp.innerHTML=`<option value="">Barcha bo'limlar</option>`+partsOf(KIND).map(p=>`<option value="${p}">${PNAME[p]} (${(BANK[p]||[]).length})</option>`).join("");fp.value=partsOf(KIND).includes(pv)?pv:"";
    ft.innerHTML=`<option value="">Barcha mavzular</option>`+topics().map(t=>`<option>${esc(t)}</option>`).join("");ft.value=topics().includes(tv)?tv:"";
    $("#topicList").innerHTML=topics().map(t=>`<option value="${esc(t)}">`).join("");
    typeOpts();list();form();hwView();examView();
  }
  function typeOpts(){const p=$("#fPart").value,ft=$("#fType"),v=ft.value;const T=p?QTYPES[p]||{}:{};
    ft.innerHTML=`<option value="">${p?"Barcha turlar":"Avval bo'lim tanlang"}</option>`+Object.entries(T).map(([k,n])=>`<option value="${k}">${esc(n)} (${allItems().filter(x=>(x.part||x.wtype)===p&&x.qtype===k).length})</option>`).join("");ft.disabled=!p;ft.value=T[v]?v:""}
  function list(){const p=$("#fPart").value,t=$("#fTopic").value,ty=$("#fType").value,q=$("#fSearch").value.toLowerCase().trim();
    let L=allItems().filter(x=>(!p||(x.part||x.wtype)===p)&&(!t||x.topic===t)&&(!ty||x.qtype===ty)&&(!q||keyOf(x).toLowerCase().includes(q)));
    $("#bankCount").textContent=`${L.length} ta savol · ${SEL.size} ta belgilangan`;
    const row=x=>`<div class="bi">
      <input type="checkbox" data-sel="${x.id}" ${SEL.has(x.id)?"checked":""}><span class="pp">${(x.part||x.wtype).replace("T","Task ")}</span>
      ${qtName(x)?`<span class="qt">${esc(qtName(x))}</span>`:""}<span class="bt">${esc(keyOf(x).slice(0,140))}${(x.part==="1.2"||x.part==="2")?((x.images||[]).length?" 🖼":` <em class='noimg'>rasm yo'q${x.pics?": "+esc(x.pics.join(" ↔ ")):""}</em>`):""}</span>
      ${Object.values(HWS).some(h=>h&&h.ids.includes(x.id))||(HW&&HW.ids.includes(x.id))?'<span class="tag">📌</span>':""}${EXAMS.some(e=>e.ids.includes(x.id))?'<span class="tag">📝</span>':""}
      <button type="button" data-ed="${x.id}">✏️</button><button type="button" data-del="${x.id}">🗑</button></div>`;
    // 1-daraja: bo'lim (Part / Task) → 2-daraja: mavzu → savollar. Hammasi yig'ilgan turadi.
    const auto=!!(q||t);
    $("#bankList").innerHTML=partsOf(KIND).filter(pp=>L.some(x=>(x.part||x.wtype)===pp)).map(pp=>{
      const LP=L.filter(x=>(x.part||x.wtype)===pp);const groups={};LP.forEach(x=>(groups[x.topic]=groups[x.topic]||[]).push(x));
      const pk="p:"+pp,pOpen=auto||!!p||OPEN.has(pk);
      return `<details class="pg" data-g="${esc(pk)}" ${pOpen?"open":""}><summary>${esc(PNAME[pp])} <small>${LP.length} ta savol · ${Object.keys(groups).length} mavzu</small></summary>`+
        Object.keys(groups).sort().map(g=>{const tk="t:"+pp+"|"+g;return `<details class="tg" data-g="${esc(tk)}" ${auto||OPEN.has(tk)?"open":""}><summary>${esc(g)} <small>${groups[g].length}</small></summary>${groups[g].map(row).join("")}</details>`}).join("")+`</details>`;
    }).join("")||`<div class="ck-msg">Savol topilmadi.</div>`;
  }
  const OPEN=new Set(); // mavzular yopiq turadi — faqat siz ochganlari ochiq qoladi
  $("#bankList").addEventListener("toggle",e=>{const d=e.target;if(!d.matches||!d.matches("details.tg,details.pg")||$("#fSearch").value.trim()||$("#fTopic").value)return;d.open?OPEN.add(d.dataset.g):OPEN.delete(d.dataset.g)},true);
  $("#fPart").onchange=()=>{typeOpts();list()};["#fTopic","#fType"].forEach(s=>$(s).onchange=list);$("#fSearch").oninput=list;
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
    $("#iType").innerHTML=`<option value="">— tur —</option>`+Object.entries(QTYPES[$("#iPart").value]||{}).map(([k,n])=>`<option value="${k}">${esc(n)}</option>`).join("");$("#iType").value=it.qtype||"";
    $("#iTopic").value=it.topic||"";FIMG=(it.images||[]).map(x=>typeof x==="string"?{url:x,thumb:x}:({...x,thumb:imgSrc(x)}));fields(it);$("#iSave").textContent=EDIT?"💾 O'zgarishni saqlash":"➕ Bazaga qo'shish";$("#iCancel").hidden=!EDIT}
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
  $("#iPart").onchange=()=>{FIMG=[];fields({});$("#iType").innerHTML=`<option value="">— tur —</option>`+Object.entries(QTYPES[$("#iPart").value]||{}).map(([k,n])=>`<option value="${k}">${esc(n)}</option>`).join("")};
  $("#iCancel").onclick=()=>{EDIT=null;form()};
  function collect(){const p=$("#iPart").value,v=id=>($("#"+id)||{}).value?.trim()||"";
    const it={id:EDIT?EDIT.id:undefined,created:EDIT?EDIT.created:undefined,kind:KIND,topic:$("#iTopic").value.trim(),qtype:$("#iType").value,struct:EDIT&&EDIT.struct,pics:EDIT&&EDIT.pics};
    if(KIND==="writing"){it.wtype=p;if(p==="T1")Object.assign(it,{sender:v("fSender"),email:v("fEmail"),t11:v("fT11"),t12:v("fT12")});else it.essay=v("fEssay")}
    else{it.part=p;it.q=[v("fQ1"),v("fQ2"),v("fQ3")].filter(Boolean);if(p==="3"){it.for=[0,1,2].map(i=>v("fF"+i)).filter(Boolean);it.against=[0,1,2].map(i=>v("fA"+i)).filter(Boolean)}
      if(p==="1.2"||p==="2") it.images=FIMG.map(x=>x.url?{url:x.url}:x.k?{k:x.k}:{data:x.data})}
    return it}
  const dueVal=()=>{const v=$("#hwDue").value;return v?new Date(v).getTime():null};
  const grpVal=()=>$$("#hwGroups input:checked").map(x=>x.value);
  async function saveItem(btn,homework){msg("");const it=collect();if(!it.topic) return msg("Mavzuni yozing yoki tanlang.",true);
    loading(true,btn,"Saqlanmoqda…");try{await post("/teacher/item/save",{tcode:T(),item:it,homework:homework||"",due:dueVal(),groups:grpVal()});msg(homework?"✅ Yangi savol bazaga qo'shildi va UYGA VAZIFA qilib berildi.":"✅ Saqlandi.");EDIT=null;await load()}
    catch(err){msg("❌ "+err.message,true)}loading(false,btn)}
  $("#iSave").onclick=e=>saveItem(e.currentTarget,"");
  $("#iHw").onclick=e=>{const t=$("#hwTitle").value.trim()||$("#iTopic").value.trim();if(EDIT) return msg("Vazifa uchun yangi savol kiriting (tahrirlash rejimidan chiqing).",true);saveItem(e.currentTarget,t)};
  /* --- vazifa: muddat va guruh --- */
  const toLocalInput=t=>{const d=new Date(t);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16)};
  function hwView(){const it=HW?HW.ids.map(id=>allItems().find(x=>x.id===id)).filter(Boolean):[];
    $("#hwGroups").innerHTML=GROUPS.length?GROUPS.map(g=>`<label class="chk"><input type="checkbox" value="${esc(g.id)}" ${g.id===$("#hwView").value?"checked":""}> ${esc(g.title)}</label>`).join("")+`<small class="hint">Belgilangan guruhlarga beriladi. Hech biri belgilanmasa — sizning hamma guruhlaringizga.</small>`:`<small class="hint">Bot guruhga ulangach, guruhlar shu yerda chiqadi.</small>`;
    $("#hwDue").value=HW&&HW.due?toLocalInput(HW.due):"";
    $("#hwNow").innerHTML=HW?`<div class="hw-t">📌 ${esc(HW.title)} <small>${dt(HW.at)}</small></div>
      <div class="hw-due">${HW.due?`⏰ Muddat: <b>${dt(HW.due)}</b>`:"⏰ Muddat qo'yilmagan — #Homework postidagi muddat ishlatiladi"} · 👥 ${HW.groups&&HW.groups.length?HW.groups.map(id=>esc((GROUPS.find(g=>g.id===id)||{}).title||id)).join(", "):"hamma guruh"}</div>${it.map(itemHTML).join("")}`:`<div class="ck-msg">Bu guruhda hozircha vazifa yo'q.</div>`}
  $("#hwView").onchange=()=>{HW=HWS[$("#hwView").value]||null;hwView();list()};
  $("#hwDueSave").onclick=async e=>{if(!HW) return msg("Avval vazifa bering.",true);const btn=e.currentTarget;loading(true,btn,"…");
    try{await post("/teacher/homework",{tcode:T(),kind:KIND,onlyDue:true,due:dueVal(),groups:grpVal()});msg("✅ Muddat va guruh saqlandi. Bot muddatga 12 soat qolganda har 3 soatda eslatadi.");await load()}catch(err){msg("❌ "+err.message,true)}loading(false,btn)};
  $("#hwAppend").onclick=async e=>{if(!SEL.size) return msg("Avval Baza bo'limida savollarni belgilang.",true);const btn=e.currentTarget;loading(true,btn,"…");
    try{const j=await post("/teacher/homework",{tcode:T(),kind:KIND,ids:[...SEL],title:$("#hwTitle").value.trim(),append:true,due:dueVal(),groups:grpVal()});msg(`✅ Joriy vazifaga qo'shildi (jami ${j.count} ta savol).`);await load()}catch(err){msg("❌ "+err.message,true)}loading(false,btn)};
  $("#hwFromSel").onclick=async e=>{if(!SEL.size) return msg("Avval Baza bo'limida savollarni belgilang.",true);const btn=e.currentTarget;loading(true,btn,"…");
    try{await post("/teacher/homework",{tcode:T(),kind:KIND,ids:[...SEL],title:$("#hwTitle").value.trim()||"Uyga vazifa",due:dueVal(),groups:grpVal()});msg("✅ Belgilangan savollar uyga vazifa qilindi.");await load()}catch(err){msg("❌ "+err.message,true)}loading(false,btn)};
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
  /* --- o'quvchilar --- */
  async function loadStudents(){const j=await post("/teacher/groups",{tcode:T()});const S=j.students||[];
    $("#stuList").innerHTML=(j.groups||[]).length?j.groups.map(g=>{const L=S.filter(s=>s.gid===g.id);return `<details class="tg" open><summary>📚 ${esc(g.title)} <small>${L.length}</small></summary>
      <table class="rep-tb"><tr><th>#</th><th>O'quvchi</th><th>PIN</th><th>Topic</th></tr>${L.map((s,i)=>`<tr><td>${i+1}</td><td>${esc(s.name)}</td><td><b>${esc(s.pin)}</b></td><td>${s.thread?"✅":"⚠️ ulanmagan"}</td></tr>`).join("")}</table></details>`}).join("")
      :`<div class="ck-msg">Hali guruh yo'q. Telegram'da <b>AOK Radar</b> botni guruhga qo'shib admin qiling — o'quvchilar va PIN'lar shu yerda chiqadi.</div>`}
  /* --- 🕓 faoliyat --- */
  const EV={login:["🔑","Saytga kirdi"],start:["▶️","Boshladi"],answer:["🎙","Savolga javob"],away:["🚪","Sahifadan chiqib ketdi"],resume:["🔄","Davom ettirdi"],photo:["📷","Rasm yukladi"],
    submit:["📨","Topshirdi"],graded:["🤖","AI baholadi"],sent:["📤","Telegram'ga tushdi"],sent_ok:["✅","Jo'natish tasdiqlandi"],send_dup:["♻️","Qayta jo'natishga urindi (takrorlanmadi)"],send_fail:["⚠️","Jo'natish xatosi"],
    outbox_sent:["📤","Navbatdagi natija keyinroq yuborildi"],pron_try:["🎤","Talaffuz mashqi"],pron_sent:["🗣","Talaffuz natijasini yubordi"],pron_missed:["⏰","Talaffuz mashqini qilmadi (bot eslatdi)"],error:["❌","Xato"],leave:["👋","Sahifani yopdi"]};
  const tm=t=>{const d=new Date(t);return `${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`};
  const evText=e=>{const x=[];if(e.mode)x.push(MODES[e.mode]||e.mode);if(e.title)x.push(e.title);if(e.page)x.push(e.page==="speaking"?"Speaking":"Writing");if(e.kind)x.push(e.kind==="speaking"?"Speaking":"Writing");
    if(e.q)x.push(`${e.q}/${e.of} savol${e.part?" (Part "+e.part+")":""}${e.empty?" — ❌ jim":""}${e.how==="skip"?" · erta tugatdi":""}`);if(e.n&&!e.q)x.push(e.n+" ta");if(e.score!=null)x.push(`ball: ${fmt(e.score)}/${e.max}`);
    if(e.word)x.push(`${e.word} — ${e.score}%`);if(e.sec)x.push(e.sec+" s");if(e.videos!=null)x.push(`🎥${e.videos} · 📄${e.pages}${e.auto?" · avtomatik":""}`);if(e.avg)x.push("o'rtacha "+e.avg+"%");if(e.msg)x.push(e.msg);if(e.done!=null)x.push(`${e.done}/${e.of} bajarilgan`);
    return x.map(esc).join(" · ")};
  async function loadLog(){const day=$("#lgDate").value,q=$("#lgQ").value.trim();$("#lgList").innerHTML=`<div class="ck-load"><div class="ck-spin"></div><span>Yuklanmoqda…</span></div>`;
    try{const j=await post("/teacher/log",{tcode:T(),date:day,q});
      $("#lgList").innerHTML=j.students.length?j.students.map(st=>{const evs=st.events.slice().sort((a,b)=>a.at-b.at).filter(e=>e.t!=="pron_try"||$("#lgPron").checked);
        return `<details class="tg" ${q||j.students.length<4?"open":""}><summary>${esc(st.name)} <small>${esc(st.grp)} · ${st.events.length} ta harakat${st.events.length?` · ${tm(st.events[0].at)}–${tm(st.events[st.events.length-1].at)}`:""}</small></summary>
        ${evs.length?`<table class="rep-tb lg"><tr><th>Vaqt</th><th>Harakat</th><th>Tafsilot</th></tr>${evs.map(e=>`<tr class="ev-${esc(e.t)}"><td>${tm(e.at)}</td><td>${(EV[e.t]||["•",e.t]).join(" ")}</td><td>${evText(e)}</td></tr>`).join("")}</table>`:`<p class="hint">Bu sanada harakat yo'q.</p>`}</details>`}).join("")
        :`<div class="ck-msg">Bu sanada hech kim saytda ishlamagan${q?" (qidiruv: "+esc(q)+")":""}.</div>`}
    catch(err){$("#lgList").innerHTML=`<div class="ck-msg err">❌ ${esc(err.message)}</div>`}}
  {const d=new Date();$("#lgDate").value=`${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}`}
  $("#lgDate").onchange=loadLog;$("#lgPron").onchange=loadLog;let lgT;$("#lgQ").oninput=()=>{clearTimeout(lgT);lgT=setTimeout(loadLog,400)};
  $("#lgPrev").onclick=()=>{const d=new Date($("#lgDate").value);d.setDate(d.getDate()-1);$("#lgDate").value=d.toISOString().slice(0,10);loadLog()};
  $("#lgNext").onclick=()=>{const d=new Date($("#lgDate").value);d.setDate(d.getDate()+1);$("#lgDate").value=d.toISOString().slice(0,10);loadLog()};
  /* --- natijalar --- */
  async function loadResults(){const j=await post("/teacher/results",{tcode:T(),kind:KIND});const R=j.results||[];
    $("#rTable").innerHTML=R.length?`<table class="rep-tb"><tr><th>O'quvchi</th><th>Rejim</th><th>Ball</th><th>Vaqt</th><th></th></tr>`+R.map(r=>`<tr><td>${esc(r.name)}${r.grp?`<small style="display:block;opacity:.7">${esc(r.grp)}</small>`:""}</td>
      <td>${esc(MODES[r.mode]||"")}<small style="display:block;opacity:.7">${esc(r.title||"")}</small></td>
      <td><b>${fmt(r.total)} / ${r.max||5}</b>${r.off?' ⚠️':""}${r.miss?' <span title="Javob berilmagan savol bor">❌</span>':""}${r.late?' <span title="Kech topshirilgan">⏰</span>':""}${r.away&&r.away.n?` <span title="Imtihondan chiqib ketgan">🚪${r.away.n}× (${Math.round(r.away.s)} s)</span>`:""}${r.sent?' <span title="Telegramga yuborilgan">📤</span>':""}${r.parts?`<small style="display:block;opacity:.7">Part ${esc(r.parts)}</small>`:""}</td><td>${dt(r.at)}</td>
      <td><button data-k="${esc(r.key)}">👁</button> <button data-x="${esc(r.key)}">🗑</button></td></tr>`).join("")+`</table>`:`<div class="ck-msg">Hali natija yo'q.</div>`;$("#ckResult").hidden=true}
  $("#rTable").addEventListener("click",async e=>{const b=e.target.closest("button");if(!b)return;
    if(b.dataset.k){const d=await post("/teacher/result",{tcode:T(),key:b.dataset.k});let clips=null;
      if(d.audio_key&&Date.now()<(d.audio_until||0)){try{const a=await post("/teacher/audio",{tcode:T(),key:d.audio_key});
        clips=a.clips.map(c=>{const bin=atob(c.audio);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return {blob:new Blob([u],{type:(c.mime||"audio/webm").split(";")[0]})}})}catch(_){}}
      d.can_send=false;showReport($("#ckResult"),d,clips)}
    if(b.dataset.x){if(!confirm("Natija o'chirilsinmi?"))return;await post("/teacher/delresult",{tcode:T(),key:b.dataset.x});b.closest("tr").remove()}});
}
})();
