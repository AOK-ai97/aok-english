const V='aok-202611121455';
const CORE=['./','./index.html','./assets/site.css','./assets/site.js','./manifest.json','./assets/icons/icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).catch(()=>{}));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting();});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET')return;
  const u=new URL(r.url); if(u.origin!==location.origin)return;
  if(/\.(mp3|zip|pdf|bin)$/i.test(u.pathname))return;           // audio/PDF to'g'ridan-to'g'ri tarmoqdan
  if(r.mode==='navigate'||r.destination==='document'){       // sahifalar: avval tarmoq (yangilik darhol)
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(r,c));return res;}).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));return;}
  e.respondWith(caches.match(r).then(m=>{const net=fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(r,c));return res;}).catch(()=>m);return m||net;}));
});
