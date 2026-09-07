const CACHE='dupla-exclusao-v13-1';
const CORE=[
  './','./index.html','./style.css','./script.js','./supabase-config.js','./dupla-v13.js','./manifest.webmanifest','./logo-pedro-queiroz.jpg',
  './game/index.html','./game/style.css','./game/script.js'
];
const STICKERS=Array.from({length:36},(_,i)=>`./figurinhas/${String(i+1).padStart(2,'0')}.webp`);
const AUDIO=['./audio/click.mp3','./audio/erro.mp3','./audio/sparkle.mp3','./audio/swipe.mp3','./audio/vitoria.mp3'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll([...CORE,...STICKERS,...AUDIO])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  if(url.origin!==location.origin) return;
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match('./index.html'))));
});