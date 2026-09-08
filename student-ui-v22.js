(function(){
  'use strict';

  function texto(el){return (el?.textContent||'').trim().toLowerCase()}

  function corrigirCreditos(){
    const atual=document.querySelector('#tela-projeto .creditos');
    if(!atual||document.getElementById('dxCreditosV23')) return;
    const box=document.createElement('section');
    box.id='dxCreditosV23';
    box.className='creditos dx-creditos-v23';
    box.setAttribute('aria-label','Créditos do projeto');
    box.innerHTML=`
      <div class="dx-credito-item">
        <span class="dx-credito-titulo">Idealização e coordenação pedagógica</span>
        <strong>Prof. Cleilson Paiva</strong>
        <small>Professor de História • Gestão Escolar</small>
      </div>
      <div class="dx-credito-item dx-credito-digital">
        <span class="dx-credito-titulo">Projeto digital, desenvolvimento do aplicativo e arquitetura da plataforma</span>
        <strong>Prof. Carlos André Tavares de Lima</strong>
        <small>Professor de Geografia • Administração Escolar • Criador de Projetos Digitais Educativos</small>
        <small class="dx-credito-contato">Contato profissional: cincoregioes@gmail.com</small>
      </div>`;
    atual.replaceWith(box);
  }

  function removerAcessosProfessor(){
    document.querySelectorAll('button,a').forEach(el=>{
      const t=texto(el);
      const href=(el.getAttribute('href')||'').toLowerCase();
      const onclick=(el.getAttribute('onclick')||'').toLowerCase();
      if(t.includes('painel dos professores')||t.includes('concluintes')||href.includes('professor.html')||onclick.includes("abrirtela('admin')")||onclick.includes('professor.html')) el.remove();
    });
    const admin=document.getElementById('tela-admin');
    if(admin) admin.remove();
    const instalar=document.getElementById('dx13Instalar');
    if(instalar) instalar.remove();
  }

  function bloquearRotasAdministrativas(){
    document.addEventListener('click',ev=>{
      const alvo=ev.target.closest('a,button');
      if(!alvo) return;
      const href=(alvo.getAttribute('href')||'').toLowerCase();
      const onclick=(alvo.getAttribute('onclick')||'').toLowerCase();
      if(href.includes('professor.html')||onclick.includes('professor.html')||onclick.includes("abrirtela('admin')")){
        ev.preventDefault(); ev.stopImmediatePropagation();
      }
    },true);
    const oldAbrir=window.abrirTela;
    if(typeof oldAbrir==='function'){
      window.abrirTela=function(nome){
        if(nome==='admin') return;
        return oldAbrir.apply(this,arguments);
      };
    }
  }

  function classificarModal(){
    const modal=document.getElementById('modal');
    const conteudo=document.getElementById('modalConteudo');
    if(!modal||!conteudo) return;
    modal.classList.remove('dx-v22-pesquisa','dx-v22-videos');
    const h=conteudo.querySelector('h2');
    const titulo=texto(h);
    const pesquisa=!!conteudo.querySelector('.dx13-survey') || titulo.includes('pesquisa 1') || titulo.includes('pesquisa 2');
    const videos=!!conteudo.querySelector('.dx13-micro') || titulo.includes('vídeos e pílulas') || titulo.includes('pílula concluída');
    if(pesquisa) modal.classList.add('dx-v22-pesquisa');
    if(videos) modal.classList.add('dx-v22-videos');
    if(pesquisa||videos){
      modal.querySelectorAll('.fechar,.ficha-fechar-x,.dx20-modalbar').forEach(el=>el.remove());
      if(!conteudo.querySelector('.dx-v22-retornar')){
        const b=document.createElement('button');
        b.type='button';
        b.className='dx-v22-retornar';
        b.textContent='← Retornar';
        b.addEventListener('click',()=>{
          if(typeof window.fecharModal==='function') window.fecharModal();
          else modal.classList.add('oculto');
        });
        conteudo.prepend(b);
      }
    }
  }

  function observarModal(){
    const modal=document.getElementById('modal');
    if(!modal) return;
    const obs=new MutationObserver(()=>setTimeout(classificarModal,0));
    obs.observe(modal,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    classificarModal();
  }

  function limparUI(){
    corrigirCreditos();
    removerAcessosProfessor();
    const obs=new MutationObserver(()=>{removerAcessosProfessor();corrigirCreditos()});
    obs.observe(document.body,{subtree:true,childList:true});
    bloquearRotasAdministrativas();
    observarModal();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',limparUI);
  else limparUI();
})();
