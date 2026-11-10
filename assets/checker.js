/* AOK English — AI Checker (writing · speaking · teacher) */
(()=>{
const API=(window.AOK_API||"").replace(/\/$/,"");
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const ls={get:k=>{try{return localStorage.getItem(k)||""}catch(e){return""}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt=x=>(Math.round((+x||0)*2)/2).toString();
const initials=n=>(n||"?").trim().split(/\s+/).map(w=>w[0]).join("").slice(0,2).toUpperCase();
const dt=t=>{try{return new Date(t).toLocaleString("uz-UZ",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}catch(e){return""}};
function msg(t,err){const m=$("#ckMsg");if(!m)return;m.hidden=!t;m.className="ck-msg"+(err?" err":"");m.textContent=t||""}
function loading(on,btn,t){if(btn)btn.disabled=on;const L=$("#ckLoad");if(!L)return;L.hidden=!on;if(t)L.querySelector("span").textContent=t}
async function post(path,body){
  if(!API) throw new Error("Checker hali ulanmagan.");
  const r=await fetch(API+path,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
  let j={};try{j=await r.json()}catch(e){}
  if(!r.ok||j.error) throw new Error(j.error||("Server xatosi "+r.status));
  return j;
}
const step=n=>$$("[data-step]").forEach(e=>e.hidden=e.dataset.step!==String(n));

/* ---------- report (namuna uslubida) ---------- */
function crTable(t,label){
  return `<table class="rep-tb"><tr><th>Kategoriya</th><th>Ball</th><th>Xatolar va yuqori ball olish uchun tavsiya</th></tr>`+
   (t.criteria||[]).map(c=>`<tr><td>${esc(c.name)}</td><td>${fmt(c.score)} / 5</td><td>${esc(c.comment)}</td></tr>`).join("")+
   `<tr class="ov"><td>OVERALL</td><td>${fmt(t.overall)} / 5</td><td>${esc(label)} bo'yicha umumiy baho</td></tr></table>`;
}
function errList(e){ if(!e||!e.length) return `<p>✅ Xato topilmadi.</p>`;
  return `<ol class="rep-err">`+e.map(x=>`<li><span class="w">${esc(x.wrong)}</span> → <span class="c">${esc(x.correct)}</span><span class="x">${esc(x.explain)}</span></li>`).join("")+`</ol>`}
const TASKS={"1.1":"Do'stga norasmiy xat · ~50 so'z","1.2":"Rasmiy xat · 120–150 so'z"};
function reportHTML(d){
  const name=d.student_name||"O'quvchi";
  if(d.kind==="speaking"){
    return `<div class="rep" id="rep"><div class="rep-h"><div class="rep-badge">${esc(initials(name))}</div><div><h2>${esc(name)}</h2>
     <div class="sub">Speaking · Part ${esc(d.part)}${d.title?" · "+esc(d.title):""} · Overall: <b>${fmt(d.overall)} / 5</b></div></div></div>
     <div class="rep-t"><b>Part ${esc(d.part)}</b><span>${esc(d.question||"")}</span></div>
     <div class="rep-l">Aytgan gaplari (o'zgarishsiz)</div><div class="rep-txt">${esc(d.transcript)}</div>
     <div class="rep-l">Xatolar va to'g'ri varianti</div>${errList(d.errors)}${crTable(d,"Part "+d.part)}
     <div class="rep-l">Yaxshiroq javob namunasi</div><div class="rep-better">${esc(d.better_answer)}</div></div>`;
  }
  const tasks=d.tasks||[];const sc=tasks.map(t=>`Task ${esc(t.task)}: <b>${fmt(t.overall)}</b>`).join(" · ");
  let h=`<div class="rep" id="rep"><div class="rep-h"><div class="rep-badge">${esc(initials(name))}</div><div><h2>${esc(name)}</h2>
   <div class="sub">Writing · ${esc(d.topic_uz||d.title||"")} · ${sc} · Jami: <b>${fmt(d.total)} / ${tasks.length*5}</b></div></div></div>`;
  tasks.forEach(t=>{h+=`<div class="rep-t"><b>Task ${esc(t.task)}</b><span>${esc(TASKS[t.task]||"")}</span><em>${esc(t.word_count)} so'z</em></div>
    <div class="rep-l">Yozgan matni (o'zgarishsiz)</div><div class="rep-txt">${esc(t.transcript)}</div>
    <div class="rep-l">Xatolar va to'g'ri varianti</div>${errList(t.errors)}${crTable(t,"Task "+t.task)}`});
  return h+`</div>`;
}
function showReport(box,d,acts){
  box.innerHTML=reportHTML(d)+`<div class="rep-acts">${acts||""}<button class="pri" data-act="img">📷 Rasm sifatida saqlash</button></div>`;
  box.hidden=false;box.scrollIntoView({behavior:"smooth"});
  box.querySelector('[data-act="img"]').onclick=async e=>{const b=e.currentTarget;b.disabled=true;
    try{const c=await html2canvas(box.querySelector("#rep"),{scale:2,backgroundColor:"#ffffff"});const a=document.createElement("a");
      a.download=((d.student_name||"oquvchi")+"_"+(d.kind==="speaking"?"Speaking":"Writing")).replace(/\s+/g,"_")+".png";a.href=c.toDataURL("image/png");a.click()}
    catch(err){alert("Rasm saqlanmadi: "+err.message)}b.disabled=false};
  const say=box.querySelector('[data-act="say"]');
  if(say) say.onclick=()=>{try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(d.spoken_feedback);u.lang="en-GB";u.rate=.95;
    const v=speechSynthesis.getVoices().find(v=>/en-GB/i.test(v.lang))||speechSynthesis.getVoices().find(v=>/^en/i.test(v.lang));if(v)u.voice=v;speechSynthesis.speak(u)}catch(e){alert(d.spoken_feedback)}};
}

/* ---------- topshiriq kartasi ---------- */
function assignCard(a,i){
  return `<label class="ck-asg"><input type="radio" name="asg" value="${esc(a.id)}"${i===0?" checked":""}><div>
   <b>${esc(a.title)}</b><small>${dt(a.created)}</small>
   ${a.email?`<div class="ck-mail">${esc(a.email)}</div>`:""}
   ${a.t11?`<p><b>Task 1.1</b> ${esc(a.t11)}</p>`:""}${a.t12?`<p><b>Task 1.2</b> ${esc(a.t12)}</p>`:""}
   ${(a.speaking||[]).length?`<p><b>Speaking:</b> ${a.speaking.map(s=>"Part "+esc(s.part)+" — "+esc(s.q)).join(" · ")}</p>`:""}</div></label>`;
}
let ASG=[];
const curAsg=()=>{const r=$('input[name="asg"]:checked');return r?ASG.find(a=>a.id===r.value):null};
async function studentLogin(btn,after){
  msg("");const code=$("#ck_code").value.trim();if(!code) return msg("Sinf kodini kiriting.",true);
  loading(true,btn,"Kirilmoqda…");
  try{const j=await post("/assignments",{code});ls.set("aok_code",code);ASG=j.assignments||[];
    const L=$("#asgList");L.innerHTML=ASG.length?ASG.map(assignCard).join(""):`<div class="ck-msg">Hozircha topshiriq yo'q. O'qituvchi topshiriq e'lon qilishini kuting.</div>`;
    after&&after();step(2)}catch(e){msg("❌ "+e.message,true)}
  loading(false,btn);
}
const codeIn=$("#ck_code");if(codeIn){codeIn.value=ls.get("aok_code");codeIn.addEventListener("keydown",e=>{if(e.key==="Enter")$("#goLogin").click()})}
if(!API) msg("⚙️ Checker hali ulanmagan. O'qituvchiga murojaat qiling.",true);

/* ---------- WRITING ---------- */
function compress(file){return new Promise((res,rej)=>{const img=new Image();const u=URL.createObjectURL(file);
  img.onload=()=>{const m=1800,k=Math.min(1,m/Math.max(img.width,img.height));const c=document.createElement("canvas");c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);
    c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);const d=c.toDataURL("image/jpeg",.85);res({mime:"image/jpeg",data:d.split(",")[1],thumb:d})};
  img.onerror=()=>rej(new Error("Rasm ochilmadi"));img.src=u})}
const PAGE=document.body.dataset.ck;
if(PAGE==="writing"){
  const IM=[];
  const th=()=>{const b=$("#thumbs");b.innerHTML="";IM.forEach((im,i)=>{const f=document.createElement("figure");
    f.innerHTML=`<img src="${im.thumb}" alt="rasm ${i+1}"><button type="button" aria-label="O'chirish">×</button>`;f.querySelector("button").onclick=()=>{IM.splice(i,1);th()};b.appendChild(f)});
    $("#goWriting").disabled=!IM.length};
  $("#goLogin").onclick=e=>studentLogin(e.currentTarget);
  $("#files").addEventListener("change",async e=>{for(const f of [...e.target.files].slice(0,6-IM.length)){try{IM.push(await compress(f))}catch(err){msg(err.message,true)}}e.target.value="";th()});
  $("#goWriting").onclick=async e=>{const btn=e.currentTarget;msg("");
    const a=curAsg();if(!IM.length) return msg("Rasm yuklang.",true);
    loading(true,btn,"AI xatingizni o'qib, ismingiz va Task'larni aniqlab baholayapti… (20–60 soniya)");
    try{const d=await post("/writing",{code:ls.get("aok_code"),aid:a?a.id:"",images:IM.map(({mime,data})=>({mime,data}))});
      step(3);showReport($("#ckResult"),d,`<button data-act="again">🔁 Boshqa rasm</button>`);
      if(d.saved) msg("✅ Natija o'qituvchiga yuborildi.");
      $('[data-act="again"]').onclick=()=>{IM.length=0;th();$("#ckResult").hidden=true;msg("");step(2)}}
    catch(err){msg("❌ "+err.message,true)}
    loading(false,btn)};
}

/* ---------- SPEAKING ---------- */
if(PAGE==="speaking"){
  const QS={"1.1":["Do you often go shopping? Why?","What is your favourite place in your town?","Do you prefer studying alone or with friends?"],
   "1.2":["Tell me what you can see in these pictures.","What are the advantages of studying in a classroom over studying online?"],
   "2":["Tell me about a teacher who helped you a lot. How did this teacher influence your life? Do you agree that a good teacher is more important than a good textbook?"],
   "3":["Homework should be banned at school. FOR: students feel tired; more free time; less stress. AGAINST: helps remember lessons; teaches responsibility; parents see what children learn."]};
  const LIM={"1.1":30,"1.2":45,"2":120,"3":120};
  const pSel=$("#ck_part"),qIn=$("#ck_q"),qList=$("#ck_qlist");$("#ck_name").value=ls.get("aok_name");
  const fillQ=()=>{const p=pSel.value;const a=curAsg();const own=(a&&a.speaking||[]).filter(s=>s.part===p).map(s=>s.q);
    const all=[...own,...QS[p]];qList.innerHTML=all.map(q=>`<option value="${esc(q)}">`).join("");qIn.value=all[0];$("#recLim").textContent=LIM[p]+" soniya"};
  pSel.onchange=fillQ;
  $("#goLogin").onclick=e=>studentLogin(e.currentTarget,()=>setTimeout(fillQ,0));
  $("#asgList").addEventListener("change",fillQ);
  let rec=null,chunks=[],blob=null,t0=0,tick=null;const rb=$("#recBtn"),rt=$("#recTime"),ra=$("#recAudio");
  const stopRec=()=>{if(rec&&rec.state!=="inactive")rec.stop()};
  rb.onclick=async()=>{if(rec&&rec.state==="recording") return stopRec();
    try{const st=await navigator.mediaDevices.getUserMedia({audio:true});
      const mt=["audio/webm;codecs=opus","audio/mp4","audio/webm"].find(m=>window.MediaRecorder&&MediaRecorder.isTypeSupported(m))||"";
      rec=new MediaRecorder(st,mt?{mimeType:mt}:{});chunks=[];blob=null;rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);
      rec.onstop=()=>{st.getTracks().forEach(t=>t.stop());clearInterval(tick);rb.classList.remove("on");rb.textContent="🎤";
        blob=new Blob(chunks,{type:rec.mimeType||"audio/webm"});ra.src=URL.createObjectURL(blob);ra.hidden=false;$("#goSpeaking").disabled=false};
      rec.start();t0=Date.now();rb.classList.add("on");rb.textContent="⏹";ra.hidden=true;$("#goSpeaking").disabled=true;
      const lim=LIM[pSel.value];tick=setInterval(()=>{const s=Math.floor((Date.now()-t0)/1000);rt.textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;if(s>=lim)stopRec()},250);
    }catch(e){msg("Mikrofonga ruxsat bering: "+e.message,true)}};
  $("#goSpeaking").onclick=async e=>{const btn=e.currentTarget;msg("");const name=$("#ck_name").value.trim();
    if(!name) return msg("Ism familiyangizni yozing.",true);if(!blob) return msg("Avval javobingizni yozib oling.",true);ls.set("aok_name",name);
    loading(true,btn,"AI javobingizni tinglab, baholayapti… (20–60 soniya)");
    try{const b64=await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result.split(",")[1]);fr.onerror=rej;fr.readAsDataURL(blob)});
      const a=curAsg();const d=await post("/speaking",{code:ls.get("aok_code"),name,aid:a?a.id:"",part:pSel.value,question:qIn.value.trim(),audio:b64,mime:blob.type});
      d.title=a?a.title:"";step(3);showReport($("#ckResult"),d,`<button data-act="say">🔊 Feedbackni tinglash</button><button data-act="again">🔁 Yana gapirish</button>`);
      if(d.saved) msg("✅ Natija o'qituvchiga yuborildi.");
      $('[data-act="again"]').onclick=()=>{$("#ckResult").hidden=true;msg("");step(2)}}
    catch(err){msg("❌ "+err.message,true)}
    loading(false,btn)};
}

/* ---------- O'QITUVCHI ---------- */
if(PAGE==="teacher"){
  const tIn=$("#t_code");tIn.value=ls.get("aok_tcode");
  const T=()=>ls.get("aok_tcode");
  let LIST=[];
  async function refresh(){const j=await post("/teacher/list",{tcode:T()});LIST=j.assignments||[];
    $("#tList").innerHTML=LIST.length?LIST.map(a=>`<div class="ck-asg t"><div><b>${esc(a.title)}</b><small>${dt(a.created)}</small>
      ${a.email?`<div class="ck-mail">${esc(a.email)}</div>`:""}</div><div class="t-acts"><button data-r="${a.id}">📊 Natijalar</button><button data-e="${a.id}">✏️</button><button data-d="${a.id}">🗑</button></div></div>`).join("")
      :`<div class="ck-msg">Hali topshiriq yo'q — yuqorida yangisini yarating.</div>`}
  $("#goLogin").onclick=async e=>{const btn=e.currentTarget;msg("");const c=tIn.value.trim();if(!c) return msg("O'qituvchi kodini kiriting.",true);
    loading(true,btn,"Kirilmoqda…");try{await post("/teacher/login",{tcode:c});ls.set("aok_tcode",c);await refresh();step(2)}catch(err){msg("❌ "+err.message,true)}loading(false,btn)};
  tIn.addEventListener("keydown",e=>{if(e.key==="Enter")$("#goLogin").click()});
  let editId="";
  const spRows=()=>$$("#spList .sp-row").map(r=>({part:r.querySelector("select").value,q:r.querySelector("input").value.trim()})).filter(x=>x.q);
  const addSp=(p="1.1",q="")=>{const d=document.createElement("div");d.className="sp-row";
    d.innerHTML=`<select><option>1.1</option><option>1.2</option><option>2</option><option>3</option></select><input type="text" placeholder="Savol matni"><button type="button" aria-label="O'chirish">×</button>`;
    d.querySelector("select").value=p;d.querySelector("input").value=q;d.querySelector("button").onclick=()=>d.remove();$("#spList").appendChild(d)};
  $("#addSp").onclick=()=>addSp();
  const resetForm=()=>{editId="";["#a_title","#a_email","#a_t11","#a_t12"].forEach(s=>$(s).value="");$("#spList").innerHTML="";$("#saveA").textContent="📢 E'lon qilish"};
  $("#a_t11").placeholder="Write a letter to your friend. Write about your feelings and what you would like to see in the new park. Write about 50 words.";
  $("#a_t12").placeholder="Write a letter to the City Council. Write about your feelings and your suggestions. Write 120–150 words.";
  $("#saveA").onclick=async e=>{const btn=e.currentTarget;msg("");const title=$("#a_title").value.trim();if(!title) return msg("Mavzu nomini yozing.",true);
    loading(true,btn,"Saqlanmoqda…");
    try{await post("/teacher/save",{tcode:T(),id:editId,title,email:$("#a_email").value.trim(),t11:$("#a_t11").value.trim(),t12:$("#a_t12").value.trim(),speaking:spRows()});
      resetForm();await refresh();msg("✅ Topshiriq e'lon qilindi. O'quvchilar uni sinf kodi bilan ko'radi.")}catch(err){msg("❌ "+err.message,true)}loading(false,btn)};
  $("#tList").addEventListener("click",async e=>{const b=e.target.closest("button");if(!b)return;
    if(b.dataset.e){const a=LIST.find(x=>x.id===b.dataset.e);editId=a.id;$("#a_title").value=a.title;$("#a_email").value=a.email;$("#a_t11").value=a.t11;$("#a_t12").value=a.t12;
      $("#spList").innerHTML="";(a.speaking||[]).forEach(s=>addSp(s.part,s.q));$("#saveA").textContent="💾 O'zgarishni saqlash";window.scrollTo({top:0,behavior:"smooth"})}
    if(b.dataset.d){if(!confirm("Topshiriq o'chirilsinmi? (Natijalar saqlanib qoladi)"))return;await post("/teacher/delete",{tcode:T(),id:b.dataset.d});refresh()}
    if(b.dataset.r) openResults(b.dataset.r)});
  async function openResults(id){const a=LIST.find(x=>x.id===id);msg("");
    const j=await post("/teacher/results",{tcode:T(),id});const R=j.results||[];
    $("#rTitle").textContent=a?a.title:"";step(3);
    $("#rTable").innerHTML=R.length?`<table class="rep-tb"><tr><th>O'quvchi</th><th>Turi</th><th>Ball</th><th>Vaqt</th><th></th></tr>`+R.map(r=>`<tr><td>${esc(r.name)}</td>
      <td>${r.kind==="speaking"?"🎤 Part "+esc(r.part):"✍️ "+[r.t11!=null?"1.1: "+fmt(r.t11):"",r.t12!=null?"1.2: "+fmt(r.t12):""].filter(Boolean).join(" · ")}</td>
      <td><b>${fmt(r.total)} / ${r.max||5}</b></td><td>${dt(r.at)}</td><td><button data-k="${esc(r.key)}">👁 Ko'rish</button> <button data-x="${esc(r.key)}">🗑</button></td></tr>`).join("")+`</table>`
      :`<div class="ck-msg">Hali natija yo'q.</div>`;
    $("#ckResult").hidden=true}
  $("#rTable").addEventListener("click",async e=>{const b=e.target.closest("button");if(!b)return;
    if(b.dataset.k){const d=await post("/teacher/result",{tcode:T(),key:b.dataset.k});showReport($("#ckResult"),d)}
    if(b.dataset.x){if(!confirm("Natija o'chirilsinmi?"))return;await post("/teacher/delresult",{tcode:T(),key:b.dataset.x});b.closest("tr").remove()}});
  $("#backList").onclick=()=>{$("#ckResult").hidden=true;step(2)};
}
})();
