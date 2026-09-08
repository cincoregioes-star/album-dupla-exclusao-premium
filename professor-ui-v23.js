(function(){
  'use strict';

  function aplicarIdentidade(){
    document.title='Dupla Exclusão — Painel dos Professores v23';

    const topo=document.querySelector('.prof-top');
    if(topo){
      const badge=topo.querySelector('.pill');
      if(badge) badge.textContent='Dupla Exclusão • v23';
      const subtitulo=topo.querySelector('.muted');
      if(subtitulo && subtitulo.textContent.includes('Acompanhamento')) subtitulo.textContent='Acompanhamento pedagógico alinhado ao APK estudantil v23.';
    }

    document.querySelectorAll('#dxpV13 .pill').forEach(el=>el.textContent='Dupla Exclusão • Painel v23');

    const wrap=document.querySelector('.prof-wrap');
    if(wrap && !document.getElementById('dxPainelStatusV23')){
      const status=document.createElement('section');
      status.id='dxPainelStatusV23';
      status.className='prof-card dxp23-status';
      status.innerHTML='<div><b>Painel docente v23</b><span>Mesma base de dados do APK estudantil v23 • acesso restrito à equipe pedagógica</span></div>';
      const primeira=wrap.querySelector('.prof-top');
      if(primeira) primeira.insertAdjacentElement('afterend',status);
      else wrap.prepend(status);
    }

    if(wrap && !document.getElementById('dxCreditosProfessorV23')){
      const creditos=document.createElement('section');
      creditos.id='dxCreditosProfessorV23';
      creditos.className='prof-card dxp23-creditos';
      creditos.innerHTML=`
        <h2>Créditos do projeto</h2>
        <div class="dxp23-creditos-grid">
          <article>
            <span>Idealização e coordenação pedagógica</span>
            <strong>Prof. Cleilson Paiva</strong>
            <small>Professor de História • Gestão Escolar</small>
          </article>
          <article class="dxp23-digital">
            <span>Projeto digital, desenvolvimento do aplicativo e arquitetura da plataforma</span>
            <strong>Prof. Carlos André Tavares de Lima</strong>
            <small>Professor de Geografia • Administração Escolar • Criador de Projetos Digitais Educativos</small>
            <a href="mailto:cincoregioes@gmail.com">cincoregioes@gmail.com</a>
          </article>
        </div>`;
      wrap.appendChild(creditos);
    }
  }

  function css(){
    if(document.getElementById('dxProfessorUiV23Css')) return;
    const s=document.createElement('style');
    s.id='dxProfessorUiV23Css';
    s.textContent=`
      .dxp23-status{display:flex;align-items:center;justify-content:space-between;gap:12px;border-color:#2f6f52;background:linear-gradient(135deg,#0d2433,#123a31)}
      .dxp23-status div{display:flex;flex-direction:column;gap:4px}.dxp23-status b{font-size:1.05rem}.dxp23-status span{opacity:.78;font-size:.88rem}
      .dxp23-creditos h2{margin-top:0}.dxp23-creditos-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
      .dxp23-creditos-grid article{display:flex;flex-direction:column;gap:6px;padding:16px;border-radius:14px;background:#0a1726;border:1px solid #29455e}
      .dxp23-creditos-grid article>span{font-size:.78rem;text-transform:uppercase;letter-spacing:.04em;opacity:.72}
      .dxp23-creditos-grid strong{font-size:1.05rem}.dxp23-creditos-grid small{line-height:1.45;opacity:.88}
      .dxp23-creditos-grid a{color:#86efac;font-weight:700;text-decoration:none}.dxp23-creditos-grid a:hover{text-decoration:underline}
      .dxp23-digital{border-color:#2f6f52!important;background:linear-gradient(145deg,#0a1726,#0d2b25)!important}
      @media(max-width:800px){.dxp23-creditos-grid{grid-template-columns:1fr}.dxp23-status{align-items:flex-start}}
    `;
    document.head.appendChild(s);
  }

  function boot(){
    css();
    aplicarIdentidade();
    const obs=new MutationObserver(()=>aplicarIdentidade());
    obs.observe(document.documentElement,{subtree:true,childList:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
