(()=>{
const S={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
// ---- XP & streak ----
const xpEl=document.getElementById('xp');
const today=new Date().toISOString().slice(0,10);
function streak(){const st=S.get('aok:streak',{d:'',n:0});if(st.d===today)return st.n;const y=new Date(Date.now()-864e5).toISOString().slice(0,10);return st.d===y?st.n:0}
function paintXP(){if(xpEl)xpEl.textContent=`⭐ ${S.get('aok:xp',0)} XP · 🔥 ${streak()}`}
function award(key,n){const got=S.get('aok:got',{});if(got[key])return;got[key]=1;S.set('aok:got',got);S.set('aok:xp',S.get('aok:xp',0)+n);
 const st=S.get('aok:streak',{d:'',n:0});if(st.d!==today){const y=new Date(Date.now()-864e5).toISOString().slice(0,10);S.set('aok:streak',{d:today,n:st.d===y?st.n+1:1})}
 paintXP();const t=document.createElement('div');t.className='toast';t.textContent=`+${n} XP ⭐`;document.body.appendChild(t);setTimeout(()=>t.remove(),1800)}
paintXP();
document.querySelectorAll('[data-done]').forEach(b=>{const k=b.dataset.done;if(S.get('aok:got',{})[k])b.classList.add('show')});
// ---- audio buttons ----
let cur=null;
document.querySelectorAll('[data-audio]').forEach(b=>b.addEventListener('click',()=>{if(cur){cur.pause()}const my=b.dataset.audio;b.dataset.want=my;window.AOKA(my).then(u=>{if(cur)cur.pause();cur=new Audio(u);const r=document.querySelector('[data-rate].on');cur.playbackRate=r?+r.dataset.rate:1;cur.play().catch(()=>{})}).catch(()=>{})}));
document.querySelectorAll('[data-rate]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-rate]').forEach(x=>x.classList.remove('on'));b.classList.add('on');document.querySelectorAll('audio').forEach(a=>a.playbackRate=+b.dataset.rate);if(cur)cur.playbackRate=+b.dataset.rate}));
document.querySelectorAll('[data-toggle]').forEach(b=>b.addEventListener('click',()=>{const t=document.getElementById(b.dataset.toggle);t.classList.toggle('show');b.textContent=t.classList.contains('show')?b.dataset.hide:b.dataset.show}));
// ---- recorder ----
function recorder(root){const btn=root.querySelector('.rec-btn'),out=root.querySelector('.rec-out'),msg=root.querySelector('.rec-msg');let mr=null,chunks=[],stream=null;
 async function start(){try{stream=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){msg.textContent="Mikrofonga ruxsat berilmadi. Brauzer sozlamalarida ruxsat bering.";return false}
  chunks=[];mr=new MediaRecorder(stream);mr.ondataavailable=e=>chunks.push(e.data);mr.onstop=()=>{const b=new Blob(chunks,{type:mr.mimeType||'audio/webm'});out.src=URL.createObjectURL(b);out.hidden=false;stream.getTracks().forEach(t=>t.stop());msg.textContent="✅ Yozildi! Tinglab, namuna bilan solishtiring.";root.dispatchEvent(new Event('recorded'))};
  mr.start();btn.classList.add('rec');btn.textContent='⏹ To\'xtatish';msg.textContent="🔴 Yozilmoqda…";return true}
 function stop(){if(mr&&mr.state==='recording')mr.stop();btn.classList.remove('rec');btn.textContent='🎙️ Yozib olish'}
 btn&&btn.addEventListener('click',()=>{mr&&mr.state==='recording'?stop():start()});
 return {start,stop}}
document.querySelectorAll('.recorder').forEach(r=>{const R=recorder(r);r._R=R;if(r.dataset.xp)r.addEventListener('recorded',()=>award(r.dataset.xp,10))});
// ---- timed speaking ----
document.querySelectorAll('.timed').forEach(box=>{const t=box.querySelector('.timer'),go=box.querySelector('.go-btn'),lab=box.querySelector('.phase'),rec=box.querySelector('.recorder');let iv=null;
 go.addEventListener('click',()=>{if(iv)return;let prep=+box.dataset.prep,spk=+box.dataset.speak,ph='prep',n=prep;lab.textContent="⏳ Tayyorlaning";t.classList.remove('go');t.textContent=n;
  iv=setInterval(async()=>{n--;t.textContent=Math.max(n,0);if(n>0)return;
   if(ph==='prep'){ph='speak';n=spk;t.textContent=n;t.classList.add('go');lab.textContent="🎤 Gapiring!";if(rec&&rec._R)await rec._R.start()}
   else{clearInterval(iv);iv=null;lab.textContent="✅ Vaqt tugadi";t.classList.remove('go');if(rec&&rec._R)rec._R.stop();award(box.dataset.xp,20)}},1000)})});
// ---- checklists ----
document.querySelectorAll('.chkl').forEach(c=>{const boxes=[...c.querySelectorAll('input')],badge=c.parentElement.querySelector('.done-badge');
 boxes.forEach(b=>b.addEventListener('change',()=>{if(boxes.every(x=>x.checked)){award(c.dataset.xp,15);badge&&badge.classList.add('show')}}))});
// ---- makeover reveal ----
document.querySelectorAll('.mk-reveal').forEach(b=>b.addEventListener('click',()=>{const t=document.getElementById(b.dataset.t);t.hidden=!t.hidden;if(!t.hidden)award(b.dataset.xp,5)}));
// ---- writing builder & editor ----
const ed=document.getElementById('editor');
if(ed){const target=+ed.dataset.target,cnt=document.getElementById('wcount'),bar=document.getElementById('wbar'),checks=[...document.querySelectorAll('.autochk li')];
 const upd=()=>{const n=(ed.value.trim().match(/[A-Za-z'’]+/g)||[]).length;cnt.textContent=`${n} / ~${target} so'z`;bar.style.width=Math.min(100,n/target*100)+'%';
  let all=true;checks.forEach(li=>{const ok=new RegExp(li.dataset.re,'i').test(ed.value);li.classList.toggle('ok',ok);li.firstChild.textContent=ok?'✅ ':'⬜ ';if(!ok)all=false});
  if(all&&n>=target*0.8)award(ed.dataset.xp,25)};
 ed.addEventListener('input',upd);upd();
 const sels=[...document.querySelectorAll('select.bsel')],prev=document.getElementById('bprev');
 const draw=()=>{prev.innerHTML=sels.map(s=>s.value).filter(Boolean).map(v=>v.replace(/</g,'&lt;')).join('<br>')};sels.forEach(s=>s.addEventListener('change',draw));draw();
 document.getElementById('btoed').addEventListener('click',()=>{ed.value=sels.map(s=>s.value).filter(Boolean).join('\n')+'\n';upd();ed.focus()});}
// ---- dictation ----
const norm=s=>s.toLowerCase().replace(/[’']/g,"'").replace(/[^a-z0-9' ]/g,' ').split(/\s+/).filter(Boolean);
document.querySelectorAll('.dline').forEach(l=>{const inp=l.querySelector('input'),out=l.querySelector('.diff'),key=l.dataset.k;
 l.querySelector('.dchk').addEventListener('click',()=>{const a=norm(inp.value),b=norm(key);
  // LCS alignment
  const n=a.length,m=b.length,D=Array.from({length:n+1},()=>Array(m+1).fill(0));
  for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)D[i][j]=a[i]===b[j]?D[i+1][j+1]+1:Math.max(D[i+1][j],D[i][j+1]);
  let i=0,j=0,h='';while(i<n&&j<m){if(a[i]===b[j]){h+=`<span class="w g">${b[j]}</span>`;i++;j++}else if(D[i+1][j]>=D[i][j+1]){h+=`<span class="w r">${a[i]}</span>`;i++}else{h+=`<span class="w m">${b[j]}</span>`;j++}}
  while(i<n)h+=`<span class="w r">${a[i++]}</span>`;while(j<m)h+=`<span class="w m">${b[j++]}</span>`;
  const ok=D[0][0]===m&&n===m;out.innerHTML=h+(ok?' ✅':'');if(ok)award(l.dataset.xp,5)})});
// ---- spelling ----
document.querySelectorAll('.sitem').forEach(s=>{const inp=s.querySelector('input'),hint=s.querySelector('small');
 inp.addEventListener('keydown',e=>{if(e.key==='Enter')check()});inp.addEventListener('blur',()=>{if(inp.value)check()});
 function check(){const ok=inp.value.trim().toLowerCase()===s.dataset.k;inp.classList.toggle('ok',ok);inp.classList.toggle('bad',!ok);hint.textContent=ok?'✅':s.dataset.uz;if(ok)award(s.dataset.xp,3)}});
})();
