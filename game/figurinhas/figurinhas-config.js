window.FIGURINHAS_CONFIG = {
  total: 72,
  arquivos: []
};
window.addEventListener('load',()=>{
  if(document.getElementById('dxGameV13')) return;
  const s=document.createElement('script');
  s.id='dxGameV13';
  s.src='game-v13.js';
  document.body.appendChild(s);
});
