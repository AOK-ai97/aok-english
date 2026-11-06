(()=>{
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const norm=s=>s.toLowerCase().replace(/[’‘`]/g,"'").replace(/[“”]/g,'"').replace(/\s+/g," ").replace(/[.!?,;:]+$/,"").trim();
const syn={t:["t","true"],true:["t","true"],f:["f","false"],false:["f","false"],ng:["ng","not given","ni","no information"],"not given":["ng","not given","ni","no information"],"no information":["ng","not given","ni","no information"]};
function alts(k){let a=[k];const m=k.match(/^(.*?)\s*\((.*?)\)\s*$/);if(m)a=[m[1],m[2],k];return [...new Set(a.flatMap(x=>x.split(/\s+\/\s+/)).map(norm).flatMap(x=>syn[x]||[x]))];}
const B=document.body.dataset.book,U=document.body.dataset.unit;
document.querySelectorAll('.blk.q').forEach((b,bi)=>{
 const panel=b.closest('.panel');const pid=panel?panel.id:'x';
 const groups=b.querySelectorAll('.lrow[data-k],.mcq[data-k]');
 groups.forEach(r=>r.querySelectorAll('.opt').forEach(o=>{o.setAttribute('aria-pressed','false');o.addEventListener('click',()=>{r.querySelectorAll('.opt').forEach(x=>{x.setAttribute('aria-pressed','false');x.classList.remove('ok','bad')});o.setAttribute('aria-pressed','true')})}));
 const sc=b.querySelector('.score');
 b.querySelector('.btn-check').addEventListener('click',()=>{let ok=0,tot=0;
  b.querySelectorAll('input.ans').forEach(i=>{tot++;i.classList.remove('ok','bad');const f=i.nextElementSibling;if(f&&f.classList.contains('fix'))f.remove();
   if(alts(i.dataset.k).includes(norm(i.value))){ok++;i.classList.add('ok')}else{i.classList.add('bad');const s=document.createElement('span');s.className='fix';s.textContent='→ '+i.dataset.k;i.after(s)}});
  groups.forEach(r=>{tot++;const sel=r.querySelector('.opt[aria-pressed="true"]');r.querySelectorAll('.opt').forEach(x=>x.classList.remove('ok','bad'));
   const right=r.querySelector('.opt[data-l="'+r.dataset.k+'"]');if(sel&&sel===right){ok++;sel.classList.add('ok')}else{if(sel)sel.classList.add('bad');if(right)right.classList.add('ok')}});
  sc.textContent=ok+' / '+tot;sc.classList.toggle('full',ok===tot);
  if(B&&U)store.set(`aok:${B}:${U}:${pid}:${bi}`,ok+'/'+tot);});
 b.querySelector('.btn-reset').addEventListener('click',()=>{b.querySelectorAll('input.ans').forEach(i=>{i.value='';i.classList.remove('ok','bad')});b.querySelectorAll('.fix').forEach(x=>x.remove());b.querySelectorAll('.opt').forEach(o=>{o.classList.remove('ok','bad');o.setAttribute('aria-pressed','false')});sc.textContent=''});
});
// tabs
const views=[...document.querySelectorAll('.panel')].map(p=>p.id.slice(2));
if(views.length){const show=()=>{let h=location.hash.slice(1);if(!views.includes(h))h=views[0];views.forEach(v=>{document.getElementById('p-'+v).hidden=v!==h;const a=document.querySelector('.seg a[href="#'+v+'"]');if(a)a.setAttribute('aria-current',v===h?'page':'false')})};window.addEventListener('hashchange',show);show();}
// teacher gate — AES-GCM shifrlangan kontent, parol bilan ochiladi
const g=document.getElementById('gate');
if(g){const box=document.getElementById('tcontent');const IT=+g.dataset.it||310000;
 const dec=async(pw)=>{const raw=Uint8Array.from(atob(box.dataset.enc),c=>c.charCodeAt(0));const salt=raw.slice(0,16),iv=raw.slice(16,28),ct=raw.slice(28);
  const km=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']);
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:IT,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['decrypt']);
  return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv},key,ct));};
 const open_=async(pw,silent)=>{try{const html=await dec(pw);const t=document.createElement('template');t.innerHTML=html;box.replaceChildren(t.content);box.hidden=false;g.hidden=true;try{sessionStorage.setItem('aokT',pw)}catch(e){}return true}catch(e){if(!silent)document.getElementById('terr').textContent="Parol noto'g'ri. Qaytadan kiriting.";return false}};
 try{const s=sessionStorage.getItem('aokT');if(s)open_(s,true)}catch(e){}
 g.addEventListener('submit',async ev=>{ev.preventDefault();const b=g.querySelector('button');b.disabled=true;await open_(document.getElementById('tpass').value,false);b.disabled=false;});}
// book progress
const cards=document.querySelectorAll('.ucard[data-u]');
if(cards.length){let done=0;cards.forEach(c=>{let ok=0,tot=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith(`aok:${c.dataset.b}:${c.dataset.u}:p-wb:`)){const [a,t]=localStorage.getItem(k).split('/').map(Number);ok+=a;tot+=t}}}catch(e){}
 const st=c.querySelector('.st');if(tot){st.textContent='Workbook: '+ok+' / '+tot+' ✓';st.classList.add('done');done++}});
 const f=document.querySelector('.prog .fill'),l=document.querySelector('.prog .lbl');if(f){f.style.width=(100*done/cards.length)+'%';l.textContent=done+' / '+cards.length+' unit bajarildi'}}
})();
(()=>{
const me=document.currentScript||document.querySelector('script[data-root]');const ROOT=(me&&me.dataset.root)||'./';
// ---------- PWA: service worker + avtomatik yangilanish ----------
if('serviceWorker' in navigator){
 window.addEventListener('load',()=>{
  navigator.serviceWorker.register(ROOT+'sw.js',{scope:ROOT,updateViaCache:'none'}).then(reg=>{
   const ask=()=>{try{reg.update()}catch(e){}};
   setInterval(ask,30*60*1000); document.addEventListener('visibilitychange',()=>{if(!document.hidden)ask()});
   reg.addEventListener('updatefound',()=>{const w=reg.installing;if(w)w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)w.postMessage('skip')})});
  }).catch(()=>{});
  let reloaded=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloaded)return;reloaded=true;location.reload()});
 });
}
// ---------- O'rnatish tugmasi ----------
const btn=document.getElementById('instBtn'),modal=document.getElementById('instModal'),txt=document.getElementById('instText');
const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const ua=navigator.userAgent;const isIOS=/iphone|ipad|ipod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
let deferred=null;
const show=(html)=>{if(!modal)return;txt.innerHTML=html;modal.hidden=false};
if(modal)document.getElementById('instClose').addEventListener('click',()=>modal.hidden=true);
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;if(btn&&!standalone)btn.hidden=false});
if(btn&&!standalone&&isIOS)btn.hidden=false;
if(btn)btn.addEventListener('click',async()=>{
 if(deferred){deferred.prompt();try{await deferred.userChoice}catch(e){}deferred=null;btn.hidden=true;return}
 if(isIOS)show("1) Saytni <b>Safari</b>da oching.<br>2) Pastdagi <b>Ulashish ⬆️</b> tugmasini bosing.<br>3) <b>“Add to Home Screen”</b> (Bosh ekranga qo'shish) ni tanlang.<br>4) <b>Add</b> ni bosing.");
 else show("Brauzer menyusini oching (⋮) va <b>“Ilovani o'rnatish”</b> yoki <b>“Add to Home screen”</b> ni tanlang. Kompyuterda manzil qatoridagi ⊕ belgisini bosing.");
});
window.addEventListener('appinstalled',()=>{if(btn)btn.hidden=true});
// ---------- Himoya: nusxa olish, chop etish, skrinshotni qiyinlashtirish ----------
const editable=t=>t&&(t.closest('input,textarea'));
const toast=(m)=>{const d=document.createElement('div');d.className='toast';d.textContent=m;document.body.appendChild(d);setTimeout(()=>d.remove(),2200)};
['copy','cut'].forEach(ev=>document.addEventListener(ev,e=>{if(!editable(e.target)){e.preventDefault();toast("Nusxa olish taqiqlangan · © AOK English")}}));
document.addEventListener('contextmenu',e=>{if(!editable(e.target))e.preventDefault()});
document.addEventListener('dragstart',e=>e.preventDefault());
document.addEventListener('selectstart',e=>{if(!editable(e.target))e.preventDefault()});
document.addEventListener('keydown',e=>{
 const k=(e.key||'').toLowerCase(),m=e.ctrlKey||e.metaKey;
 if(k==='printscreen'||e.keyCode===44){try{navigator.clipboard.writeText('© AOK English')}catch(_){}document.body.classList.add('guarded');setTimeout(()=>document.body.classList.remove('guarded'),1500);toast("Skrinshot taqiqlangan");}
 if(m&&['c','x','s','p','u'].includes(k)&&!editable(e.target)){e.preventDefault();toast("Bu amal taqiqlangan · © AOK English")}
 if(m&&k==='a'&&!editable(e.target))e.preventDefault();
 if(m&&e.shiftKey&&['s','4','5','3'].includes(k)){document.body.classList.add('guarded')}
});
document.addEventListener('keyup',e=>{if((e.key||'').toLowerCase()==='printscreen'){try{navigator.clipboard.writeText('© AOK English')}catch(_){}}});
// oyna fokusni yo'qotsa (skrinshot vositasi, ilovalar ro'yxati) — kontent yashiriladi
const hide=()=>document.body.classList.add('guarded'),unhide=()=>document.body.classList.remove('guarded');
window.addEventListener('blur',hide);window.addEventListener('focus',unhide);
document.addEventListener('visibilitychange',()=>{document.hidden?hide():unhide()});
window.addEventListener('beforeprint',hide);window.addEventListener('afterprint',unhide);
})();

/* ---- AOK himoyalangan audio ---- */
(()=>{const _m=[155,176,219,99,100,117,160,68,146,143,30,117,75,193,223,252,47,188,236,41,219,67,137,24,233,129,81,189,12,203,14,182];let _k;const C=new Map();
const key=()=>_k||(_k=crypto.subtle.importKey('raw',new Uint8Array(_m.map((v,i)=>(((v-i*13)%256+256)*183)%256)),'AES-GCM',false,['decrypt']));
const load=h=>{if(!C.has(h))C.set(h,(async()=>{const r=await fetch(h,{credentials:'same-origin'});if(!r.ok)throw 0;const b=new Uint8Array(await r.arrayBuffer());const d=await crypto.subtle.decrypt({name:'AES-GCM',iv:b.subarray(0,12)},await key(),b.subarray(12));return URL.createObjectURL(new Blob([d],{type:'audio/mpeg'}))})());return C.get(h)};
Object.defineProperty(window,'AOKA',{value:load,writable:false});
addEventListener('pagehide',()=>{C.forEach(p=>p.then(u=>URL.revokeObjectURL(u)).catch(()=>{}))});
const fmt=t=>isFinite(t)?Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0'):'0:00';
let playing=null;
document.querySelectorAll('.aplayer').forEach(el=>{
 el.innerHTML='<button type="button" class="ap-play" aria-label="Ijro etish">▶</button><input class="ap-seek" type="range" min="0" max="1000" value="0" aria-label="Joy"><span class="ap-time">0:00 / 0:00</span><span class="ap-rates"><button type="button" data-r="0.75">0.75×</button><button type="button" data-r="1" class="on">1×</button><button type="button" data-r="1.25">1.25×</button></span>';
 const btn=el.querySelector('.ap-play'),seek=el.querySelector('.ap-seek'),tm=el.querySelector('.ap-time');let a=null,rate=1,drag=false;
 const ui=()=>{if(!a)return;tm.textContent=fmt(a.currentTime)+' / '+fmt(a.duration);if(!drag&&a.duration)seek.value=Math.round(a.currentTime/a.duration*1000);btn.textContent=a.paused?'▶':'⏸'};
 async function get(){if(a)return a;btn.textContent='⏳';try{a=new Audio(await load(el.dataset.audio))}catch(e){btn.textContent='⚠';tm.textContent='Audio yuklanmadi';throw e}
  a.preservesPitch=true;a.playbackRate=rate;['timeupdate','loadedmetadata','play','pause','ended'].forEach(ev=>a.addEventListener(ev,ui));return a}
 btn.addEventListener('click',async()=>{const x=await get();if(x.paused){if(playing&&playing!==x)playing.pause();playing=x;x.play().catch(()=>{})}else x.pause()});
 seek.addEventListener('input',()=>{drag=true});seek.addEventListener('change',async()=>{const x=await get();if(x.duration)x.currentTime=seek.value/1000*x.duration;drag=false});
 el.querySelectorAll('[data-r]').forEach(b=>b.addEventListener('click',()=>{rate=+b.dataset.r;el.querySelectorAll('[data-r]').forEach(z=>z.classList.toggle('on',z===b));if(a)a.playbackRate=rate}));
});
document.addEventListener('contextmenu',e=>{if(e.target.closest('audio,.aplayer'))e.preventDefault()},true);
})();
