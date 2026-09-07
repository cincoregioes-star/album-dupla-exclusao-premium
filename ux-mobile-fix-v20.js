(function(){
  'use strict';

  function fecharModalSeguro(){
    try{
      const modalEl=document.getElementById('modal');
      if(modalEl && !modalEl.classList.contains('oculto')){
        if(typeof window.fecharModal==='function') window.fecharModal();
        else modalEl.classList.add('oculto');
        return true;
      }
    }catch(e){}
    return false;
  }

  function telaAtiva(){
    const el=document.querySelector('.tela.ativa');
    return el ? el.id.replace(/^tela-/,'') : 'projeto';
  }

  function voltarGlobal(){
    if(fecharModalSeguro()) return;
    const atual=telaAtiva();
    if(atual && atual!=='projeto'){
      try{
        if(typeof window.abrirTela==='function') window.abrirTela('projeto');
        window.scrollTo({top:0,behavior:'smooth'});
        return;
      }catch(e){}
    }
    if(history.length>1) history.back();
  }

  function criarVoltar(){
    if(document.getElementById('dx20GlobalBack')) return;
    const b=document.createElement('button');
    b.id='dx20GlobalBack';
    b.type='button';
    b.setAttribute('aria-label','Voltar');
    b.innerHTML='← Voltar';
    b.addEventListener('click',voltarGlobal);
    document.body.appendChild(b);
  }

  function reforcarModal(){
    const box=document.querySelector('#modal .modal-box');
    if(!box) return;
    if(!box.querySelector('.dx20-modalbar')){
      const bar=document.createElement('div');
      bar.className='dx20-modalbar';
      const voltar=document.createElement('button');
      voltar.type='button';
      voltar.textContent='← Voltar';
      voltar.addEventListener('click',()=>fecharModalSeguro());
      bar.appendChild(voltar);
      const conteudo=document.getElementById('modalConteudo');
      if(conteudo) box.insertBefore(bar,conteudo);
    }
  }

  function observarModal(){
    const alvo=document.getElementById('modal');
    if(!alvo) return;
    const obs=new MutationObserver(()=>{
      if(!alvo.classList.contains('oculto')){
        reforcarModal();
        const box=alvo.querySelector('.modal-box');
        if(box) box.scrollTop=0;
      }
    });
    obs.observe(alvo,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});
  }

  function impedirDuploToque(){
    document.addEventListener('click',function(ev){
      const b=ev.target.closest('button,.btn,.opcao');
      if(!b || b.disabled) return;
      const agora=Date.now();
      const ultimo=Number(b.dataset.dx20Click||0);
      if(agora-ultimo<280){ev.preventDefault();ev.stopImmediatePropagation();return;}
      b.dataset.dx20Click=String(agora);
    },true);
  }

  function tornarTecladoSeguro(){
    document.addEventListener('focusin',ev=>{
      if(!ev.target.matches('input,textarea,select')) return;
      setTimeout(()=>{
        try{ev.target.scrollIntoView({block:'center',behavior:'smooth'});}catch(e){}
      },280);
    });
  }

  function corrigirBotoesForm(){
    document.querySelectorAll('button:not([type])').forEach(b=>b.type='button');
  }

  function boot(){
    criarVoltar();
    reforcarModal();
    observarModal();
    impedirDuploToque();
    tornarTecladoSeguro();
    corrigirBotoesForm();

    const obs=new MutationObserver(corrigirBotoesForm);
    obs.observe(document.body,{subtree:true,childList:true});
  }

  window.dx20Voltar=voltarGlobal;
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
