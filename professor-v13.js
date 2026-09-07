(function(){
  const CFG=window.SUPABASE_CONFIG||{};
  let ciclo=null,pesquisas=[],atividades=[];
  function authH(){return {apikey:CFG.publishableKey,'Content-Type':'application/json',Authorization:`Bearer ${sessao.access_token}`}}
  async function req(path,opts={}){
    if(sessao?.expires_at&&sessao.expires_at-Date.now()/1000<90) await renovar();
    const r=await fetch(`${CFG.url}/rest/v1/${path}`,{...opts,headers:{...authH(),...(opts.headers||{})}});
    if(r.status===401&&await renovar()) return req(path,opts);
    if(!r.ok) throw new Error(await r.text());
    if(opts.method&&opts.method!=='GET'&&!opts.headers?.Prefer) return null;
    try{return await r.json()}catch(e){return null}
  }
  function autorizado(){return !!sessao?.access_token}
  function esc13(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

  async function carregarV13(){
    if(!autorizado()) return;
    try{
      const ciclos=await req('dupla_ciclos?select=*&order=created_at.desc&limit=20');
      ciclo=(ciclos||[]).find(x=>x.ativo)||(ciclos||[])[0]||null;
      if(ciclo){
        [pesquisas,atividades]=await Promise.all([
          req(`dupla_pesquisas_respostas?select=*&ciclo_id=eq.${encodeURIComponent(ciclo.id)}&order=created_at.desc&limit=10000`),
          req(`dupla_atividades_resultados?select=*&ciclo_id=eq.${encodeURIComponent(ciclo.id)}&order=created_at.desc&limit=10000`)
        ]);
      }else{pesquisas=[];atividades=[]}
      renderV13();
    }catch(e){console.warn('V13 painel',e)}
  }

  function medias(tipo){
    const rows=pesquisas.filter(r=>r.tipo===tipo);const keys=['capacitismo','racismo','agir','acessibilidade','direitos'];
    const out={};keys.forEach(k=>{const vals=rows.map(r=>Number(r.indicadores?.[k])).filter(n=>n>0);out[k]=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0});return out;
  }
  function pct(v){return v?Math.round((v/4)*100):0}
  function mediaMetodologia(){
    const rows=pesquisas.filter(r=>r.tipo==='final'), keys=['album','simulados','games','videos','mudanca'];const o={};
    keys.forEach(k=>{const vals=rows.map(r=>Number(r.metodologia?.[k])).filter(n=>n>0);o[k]=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0});return o;
  }
  function cotidiano(){
    const rows=pesquisas.filter(r=>r.tipo==='inicial'), keys=['viu_racismo','viu_capacitismo','participou','casa'];const o={};
    keys.forEach(k=>{const vals=rows.map(r=>Number(r.respostas?.[k])).filter(n=>n>0);o[k]=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0});return o;
  }
  function barra(label,a,b){return `<div class="dxp-row"><b>${label}</b><div><span>Antes ${pct(a)}%</span><i><em style="width:${pct(a)}%"></em></i></div><div><span>Depois ${pct(b)}%</span><i><em style="width:${pct(b)}%"></em></i></div><strong>${b&&a?`${pct(b)-pct(a)>=0?'+':''}${pct(b)-pct(a)} p.p.`:'—'}</strong></div>`}

  function renderV13(){
    let root=document.getElementById('dxpV13');
    if(!root){
      root=document.createElement('section');root.id='dxpV13';root.className='prof-card';
      document.getElementById('painel')?.prepend(root);
    }
    const ini=medias('inicial'),fim=medias('final'),met=mediaMetodologia(),cot=cotidiano();
    const categorias={};atividades.forEach(a=>categorias[a.categoria]=(categorias[a.categoria]||0)+1);
    root.innerHTML=`
      <div class="dxp-head"><div><span class="pill">Dupla Exclusão v13</span><h2>Gestão do ciclo e Impacto do Projeto</h2><p class="muted">Diagnóstico inicial → aprendizagem → gamificação/álbum → diagnóstico final</p></div><button class="btn-ghost" onclick="window.dxpNovoCiclo()">Encerrar ciclo / Novo ciclo</button></div>
      ${ciclo?`<div class="dxp-cycle"><div><b>${esc13(ciclo.nome)}</b><span>Pesquisa 2: ${ciclo.pesquisa_final_liberada?'LIBERADA':'BLOQUEADA'}</span></div><button class="${ciclo.pesquisa_final_liberada?'btn-danger':'btn-primary'}" onclick="window.dxpTogglePesquisa()">${ciclo.pesquisa_final_liberada?'Bloquear Pesquisa 2':'Liberar Pesquisa 2'}</button></div>`:'<p>Nenhum ciclo ativo.</p>'}
      <div class="dxp-metrics"><div><b>${pesquisas.filter(x=>x.tipo==='inicial').length}</b><span>Pesquisas iniciais</span></div><div><b>${pesquisas.filter(x=>x.tipo==='final').length}</b><span>Pesquisas finais</span></div><div><b>${atividades.length}</b><span>Atividades registradas</span></div><div><b>${Object.keys(categorias).length}</b><span>Tipos de atividade</span></div></div>
      <h3>Impacto — Antes x Depois</h3><div class="dxp-impact">${barra('Reconhece capacitismo',ini.capacitismo,fim.capacitismo)}${barra('Identifica racismo',ini.racismo,fim.racismo)}${barra('Sabe como agir',ini.agir,fim.agir)}${barra('Compreende acessibilidade',ini.acessibilidade,fim.acessibilidade)}${barra('Conhece direitos',ini.direitos,fim.direitos)}</div>
      <div class="dxp-two"><div><h3>Avaliação da metodologia</h3>${[['Álbum/reflexões',met.album],['Simulados',met.simulados],['Games',met.games],['Vídeos/pílulas',met.videos],['Mudança de percepção',met.mudanca]].map(x=>`<div class="dxp-line"><span>${x[0]}</span><b>${pct(x[1])}%</b></div>`).join('')}</div><div><h3>Cotidiano escolar — diagnóstico</h3>${[['Presenciou racismo',cot.viu_racismo],['Presenciou capacitismo',cot.viu_capacitismo],['Já participou de atitude ofensiva',cot.participou],['Ouve comentários preconceituosos fora da escola',cot.casa]].map(x=>`<div class="dxp-line"><span>${x[0]}</span><b>${x[1]?x[1].toFixed(1).replace('.',',')+'/4':'—'}</b></div>`).join('')}<small class="muted">Exibição agregada, sem nome do aluno.</small></div></div>
      <div class="dxp-two"><div><h3>Atividades</h3>${Object.entries(categorias).map(([k,v])=>`<div class="dxp-line"><span>${esc13(k)}</span><b>${v}</b></div>`).join('')||'<p class="muted">Sem atividades ainda.</p>'}</div><div><h3>Controles</h3><button class="btn-ghost" onclick="window.dxpExportarPesquisas()">Exportar pesquisas CSV</button><button class="btn-ghost" onclick="window.dxpExportarAtividades()">Exportar atividades CSV</button></div></div>`;
  }

  window.dxpTogglePesquisa=async function(){
    if(!ciclo)return;const novo=!ciclo.pesquisa_final_liberada;
    if(!confirm(`${novo?'Liberar':'Bloquear'} a Pesquisa 2 para os alunos deste ciclo?`))return;
    await req(`dupla_ciclos?id=eq.${encodeURIComponent(ciclo.id)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({pesquisa_final_liberada:novo})});
    ciclo.pesquisa_final_liberada=novo;renderV13();
  };

  window.dxpNovoCiclo=async function(){
    if(!confirm('Encerrar o ciclo atual e iniciar um novo? Nos aparelhos dos alunos, o álbum será reiniciado automaticamente quando sincronizar. O histórico anterior será preservado para relatórios.'))return;
    const nome=prompt('Nome do novo ciclo:',`Novo ciclo — ${new Date().toLocaleDateString('pt-BR')}`);if(!nome)return;
    if(ciclo?.ativo) await req(`dupla_ciclos?id=eq.${encodeURIComponent(ciclo.id)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({ativo:false,encerrado_em:new Date().toISOString()})});
    const r=await fetch(`${CFG.url}/rest/v1/dupla_ciclos`,{method:'POST',headers:{...authH(),Prefer:'return=representation'},body:JSON.stringify({nome,ativo:true,pesquisa_final_liberada:false,versao:13,observacao:'Novo ciclo criado pelo painel v13',criado_por:sessao.user.id})});
    if(!r.ok){alert('Não foi possível criar o novo ciclo.');return}await carregarV13();
  };

  function csvDownload(nome,rows){if(!rows.length)return alert('Sem dados para exportar.');const cols=[...new Set(rows.flatMap(r=>Object.keys(r)))];const csv=[cols.join(','),...rows.map(r=>cols.map(c=>`"${String(typeof r[c]==='object'?JSON.stringify(r[c]):r[c]??'').replace(/"/g,'""')}"`).join(','))].join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));a.download=nome;a.click();URL.revokeObjectURL(a.href)}
  window.dxpExportarPesquisas=()=>csvDownload('dupla-exclusao-pesquisas-v13.csv',pesquisas);
  window.dxpExportarAtividades=()=>csvDownload('dupla-exclusao-atividades-v13.csv',atividades);

  function css(){if(document.getElementById('dxpCss'))return;const s=document.createElement('style');s.id='dxpCss';s.textContent=`.dxp-head,.dxp-cycle{display:flex;justify-content:space-between;gap:15px;align-items:center;flex-wrap:wrap}.dxp-cycle{padding:15px;border:1px solid #31506d;border-radius:14px;background:#0a1726}.dxp-cycle div{display:flex;flex-direction:column;gap:4px}.dxp-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:16px 0}.dxp-metrics div{padding:14px;border-radius:12px;background:#112941}.dxp-metrics b{font-size:1.6rem;display:block}.dxp-metrics span{font-size:.8rem;opacity:.75}.dxp-row{display:grid;grid-template-columns:1.2fr 1fr 1fr 70px;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid #29455e}.dxp-row div span{font-size:.75rem}.dxp-row i{height:8px;background:#07111f;border-radius:99px;overflow:hidden;display:block}.dxp-row em{display:block;height:100%;background:#22c55e}.dxp-two{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:18px}.dxp-two>div{background:#0a1726;border-radius:14px;padding:14px}.dxp-line{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #29455e}.dxp-two button{margin:5px}@media(max-width:800px){.dxp-metrics{grid-template-columns:1fr 1fr}.dxp-row{grid-template-columns:1fr}.dxp-two{grid-template-columns:1fr}}`;document.head.appendChild(s)}

  const oldCarregar=window.carregarTudo;
  if(typeof oldCarregar==='function') window.carregarTudo=async function(){await oldCarregar.apply(this,arguments);await carregarV13()};
  const obs=new MutationObserver(()=>{if(document.getElementById('painel')&&!document.getElementById('dxpV13')&&autorizado()){css();carregarV13()}});obs.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  css();if(document.readyState==='complete')setTimeout(carregarV13,200);else window.addEventListener('load',()=>setTimeout(carregarV13,200));
})();