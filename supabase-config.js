// ============================================================
// DUPLA EXCLUSÃO — SUPABASE / BOOTSTRAP V13
// ============================================================
window.SUPABASE_CONFIG = {
  enabled: true,
  url: "https://byajgsbilwiojdowqnlp.supabase.co",
  publishableKey: "sb_publishable_MxqtFZap1Oxbo3L-vYicaA_Fj899LEO",
  anonKey: "sb_publishable_MxqtFZap1Oxbo3L-vYicaA_Fj899LEO",
  table: "album_concluintes",
  premiosDisponiveis: 10,
  totalFigurinhas: 36,
  projeto: "Álbum Dupla Exclusão — Edição Municipal",
  versao: 13
};

(function(){
  const CFG=window.SUPABASE_CONFIG;
  const DEVICE_KEY='dupla_device_id_v12';
  const PROFILE_KEY='dupla_aluno_perfil_v12';
  const QUEUE_KEY='dupla_sync_queue_v13';
  let flushing=false;

  function deviceId(){
    let id=localStorage.getItem(DEVICE_KEY);
    if(!id){id=(window.crypto&&crypto.randomUUID?crypto.randomUUID():'00000000-0000-4000-8000-'+String(Date.now()).padStart(12,'0').slice(-12));localStorage.setItem(DEVICE_KEY,id)}
    return id;
  }
  function perfil(){try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}')}catch(e){return {}}}
  function salvarPerfil(p){const a=perfil();const n={nome:String(p.nome||a.nome||'').trim().slice(0,120),escola_bairro:String(p.escola_bairro||a.escola_bairro||'').trim().slice(0,160),turma:String(p.turma||a.turma||'').trim().slice(0,80)};localStorage.setItem(PROFILE_KEY,JSON.stringify(n));return n}
  function fila(){try{return JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]')}catch(e){return []}}
  function setFila(v){localStorage.setItem(QUEUE_KEY,JSON.stringify(v.slice(-400)))}
  function enfileirar(table,payload){const q=fila();q.push({table,payload});setFila(q);flush()}
  async function post(table,payload){const r=await fetch(`${CFG.url}/rest/v1/${table}`,{method:'POST',headers:{apikey:CFG.publishableKey,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(payload)});if(!r.ok)throw new Error(await r.text())}
  async function flush(){if(flushing||!navigator.onLine)return;flushing=true;try{let q=fila();while(q.length){try{await post(q[0].table,q[0].payload);q.shift();setFila(q)}catch(e){break}}}finally{flushing=false}}

  function abrirIdentificacao(){
    const p=perfil();
    if(typeof modal!=='function')return;
    modal(`<div class="ficha-detalhada"><button class="ficha-fechar-x" onclick="fecharModal()">×</button><h2>Identificação do aluno</h2><p>Preencha uma vez. Esses dados servem ao acompanhamento pedagógico; as pesquisas sensíveis da v13 são registradas separadamente sem o nome.</p><div class="form-final"><input id="dxNome" placeholder="Nome do aluno" value="${String(p.nome||'').replace(/"/g,'&quot;')}"><input id="dxEscola" placeholder="Escola" value="${String(p.escola_bairro||'').replace(/"/g,'&quot;')}"><input id="dxTurma" placeholder="Turma / série" value="${String(p.turma||'').replace(/"/g,'&quot;')}"></div><button class="btn" onclick="window.dxSalvarIdentificacao()">Salvar identificação</button></div>`);
  }
  window.dxSalvarIdentificacao=function(){const nome=document.getElementById('dxNome')?.value.trim()||'';if(nome.length<2)return alert('Digite o nome do aluno.');salvarPerfil({nome,escola_bairro:document.getElementById('dxEscola')?.value||'',turma:document.getElementById('dxTurma')?.value||''});if(typeof fecharModal==='function')fecharModal()};

  function protegerPainelAluno(){
    window.carregarConcluintes=async function(){const area=document.getElementById('listaConcluintes');if(area)area.innerHTML='<div class="quiz-card quiz-card-unico"><h3>Acesso restrito</h3><p>Resultados individuais e concluintes são visualizados apenas pela equipe pedagógica autenticada.</p><button class="btn" onclick="window.location.href=\'professor.html\'">Abrir painel dos professores</button></div>'};
    window.exportarConcluintes=function(){window.location.href='professor.html'};
    window.marcarPremio=function(){alert('Esta ação está disponível somente no painel autenticado.')};
  }

  function substituirConclusao(){
    window.telaConclusao=function(){
      const codigo=estado.codigoConfirmacao||('DX-'+Date.now().toString().slice(-6));estado.codigoConfirmacao=codigo;if(typeof salvar==='function')salvar();const p=perfil();
      modal(`<div class="conclusao"><h2>Parabéns!</h2><p>Você completou o Álbum Digital Dupla Exclusão.</p><p><b>Código de confirmação:</b> ${codigo}</p><p>A ordem de conclusão é conferida exclusivamente pela equipe pedagógica.</p></div><div class="form-final"><input id="nomeFinal" placeholder="Nome do participante" value="${String(p.nome||'').replace(/"/g,'&quot;')}"><input id="escolaFinal" placeholder="Escola" value="${String(p.escola_bairro||'').replace(/"/g,'&quot;')}"><input id="turmaFinal" placeholder="Turma / série" value="${String(p.turma||'').replace(/"/g,'&quot;')}"></div><button class="btn" onclick="registrarConclusao()">Registrar conclusão</button>`);
    };
    window.registrarConclusao=function(){
      const nome=document.getElementById('nomeFinal')?.value.trim()||'',escola=document.getElementById('escolaFinal')?.value.trim()||'',turma=document.getElementById('turmaFinal')?.value.trim()||'';if(nome.length<2)return alert('Digite o nome.');salvarPerfil({nome,escola_bairro:escola,turma});
      let ciclo=null;try{ciclo=JSON.parse(localStorage.getItem('dupla_ciclo_v13')||'null')}catch(e){}
      const item={ciclo_id:ciclo?.id||null,nome,escola_bairro:[escola,turma].filter(Boolean).join(' • '),codigo_confirmacao:estado.codigoConfirmacao,total_figurinhas:36,album_completo:true,premio_entregue:false,device_id:deviceId(),origem:'album-digital-dupla-exclusao-v13'};
      enfileirar('album_concluintes',item);estado.conclusaoRegistrada=true;if(typeof salvar==='function')salvar();modal(`<div class="conclusao"><h2>Conclusão registrada</h2><p><b>Código:</b> ${item.codigo_confirmacao}</p><p>${navigator.onLine?'Sincronização iniciada.':'Registro salvo offline e será sincronizado quando a internet voltar.'}</p></div><button class="btn" onclick="fecharModal()">Fechar</button>`);
    };
  }

  function instalarBase(){
    deviceId();
    const nav=document.querySelector('.topo nav');
    if(nav&&!document.getElementById('dxBtnPerfil')){const b=document.createElement('button');b.id='dxBtnPerfil';b.textContent='Identificar aluno';b.onclick=abrirIdentificacao;nav.appendChild(b);const p=document.createElement('button');p.textContent='Painel dos professores';p.onclick=()=>location.href='professor.html';nav.appendChild(p)}
    protegerPainelAluno();substituirConclusao();flush();
  }

  function carregarScript(src,id){if(document.getElementById(id))return;const s=document.createElement('script');s.src=src;s.id=id;s.defer=true;document.body.appendChild(s)}
  window.addEventListener('online',flush);
  window.addEventListener('load',function(){
    const path=location.pathname.toLowerCase();
    if(path.endsWith('/professor.html')||path.endsWith('professor.html')){carregarScript('professor-v13.js','dxProfessorV13');return}
    instalarBase();
    carregarScript('simulados-v13.js','dxSimuladosV13');
    carregarScript('dupla-v13.js','dxAlunoV13');
  });
})();