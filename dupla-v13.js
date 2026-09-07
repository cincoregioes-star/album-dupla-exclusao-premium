(function(){
  const CFG = window.SUPABASE_CONFIG || {};
  const CYCLE_KEY = 'dupla_ciclo_v13';
  const SURVEY_ID_KEY = 'dupla_pesquisa_respondente_v13';
  const QUEUE_KEY = 'dupla_v13_queue';
  const PROFILE_KEY = 'dupla_aluno_perfil_v12';
  const APP_STATE_KEY = 'album_dupla_exclusao_municipal_36_v1';
  let cicloAtual = null;
  let installPrompt = null;
  let ultimoFingerprint = '';

  const ESCALA = ['Discordo totalmente','Discordo','Concordo','Concordo totalmente'];
  const FREQUENCIA = ['Nunca','Raramente','Algumas vezes','Muitas vezes'];

  const PESQUISA_INICIAL = [
    {id:'capacitismo', texto:'Eu sei explicar o que significa capacitismo.', opcoes:ESCALA, indicador:'capacitismo'},
    {id:'racismo', texto:'Eu consigo identificar racismo em apelidos, piadas ou formas de exclusão.', opcoes:ESCALA, indicador:'racismo'},
    {id:'agir', texto:'Eu sei como agir quando presencio discriminação na escola.', opcoes:ESCALA, indicador:'agir'},
    {id:'acessibilidade', texto:'Eu compreendo que acessibilidade é um direito e não um favor.', opcoes:ESCALA, indicador:'acessibilidade'},
    {id:'direitos', texto:'Eu conheço alguns direitos das pessoas com deficiência e de quem sofre discriminação racial.', opcoes:ESCALA, indicador:'direitos'},
    {id:'viu_racismo', texto:'Na escola, você já presenciou alguém ser tratado de forma injusta por causa da cor da pele, raça ou origem?', opcoes:FREQUENCIA, cotidiano:true},
    {id:'viu_capacitismo', texto:'Na escola, você já presenciou alguém com deficiência ser excluído, ridicularizado ou tratado como incapaz?', opcoes:FREQUENCIA, cotidiano:true},
    {id:'participou', texto:'Você já participou de apelido, comentário, brincadeira ou atitude que depois percebeu que poderia ter machucado outra pessoa?', opcoes:FREQUENCIA, cotidiano:true},
    {id:'casa', texto:'Você presencia comentários preconceituosos sobre raça, deficiência ou aparência em casa, na rua ou em grupos de convivência?', opcoes:FREQUENCIA, cotidiano:true},
    {id:'adulto', texto:'Se uma situação grave de bullying ou discriminação acontecesse, eu procuraria um adulto ou profissional da escola.', opcoes:ESCALA, indicador:'apoio'}
  ];

  const PESQUISA_FINAL = [
    {id:'capacitismo', texto:'Depois do projeto, consigo reconhecer e explicar situações de capacitismo.', opcoes:ESCALA, indicador:'capacitismo'},
    {id:'racismo', texto:'Depois do projeto, consigo identificar melhor situações de racismo no cotidiano escolar.', opcoes:ESCALA, indicador:'racismo'},
    {id:'agir', texto:'Depois do projeto, sei melhor o que fazer ao presenciar discriminação ou bullying.', opcoes:ESCALA, indicador:'agir'},
    {id:'acessibilidade', texto:'Depois do projeto, compreendo melhor por que acessibilidade e inclusão são direitos.', opcoes:ESCALA, indicador:'acessibilidade'},
    {id:'direitos', texto:'Depois do projeto, conheço melhor leis, direitos e formas de proteção relacionadas ao tema.', opcoes:ESCALA, indicador:'direitos'},
    {id:'album', texto:'As figurinhas e as reflexões do álbum me ajudaram a compreender o tema.', opcoes:ESCALA, metodologia:true},
    {id:'simulados', texto:'Os simulados ajudaram a fixar os conteúdos trabalhados.', opcoes:ESCALA, metodologia:true},
    {id:'games', texto:'Os games contribuíram para minha aprendizagem e não foram apenas entretenimento.', opcoes:ESCALA, metodologia:true},
    {id:'videos', texto:'As pílulas visuais/vídeos curtos ajudaram a relacionar o conteúdo com situações reais.', opcoes:ESCALA, metodologia:true},
    {id:'mudanca', texto:'O projeto mudou ou ampliou a forma como percebo racismo, capacitismo, bullying e inclusão.', opcoes:ESCALA, metodologia:true}
  ];

  const MICROAULAS = [
    {
      titulo:'Racismo: quando a “brincadeira” exclui',
      duracao:'45–60 s',
      slides:[
        ['Cena 1','Um apelido pode parecer pequeno para quem fala, mas pode reforçar humilhação e exclusão.'],
        ['Cena 2','Racismo também aparece em piadas, baixa expectativa, silêncio e oportunidades negadas.'],
        ['Cena 3','Atitude: não rir, acolher quem sofreu, interromper a situação e procurar apoio da escola.']
      ]
    },
    {
      titulo:'Capacitismo: capacidade não se presume',
      duracao:'45–60 s',
      slides:[
        ['Cena 1','Fazer tudo pela pessoa sem perguntar pode retirar autonomia.'],
        ['Cena 2','Capacitismo ocorre quando alguém é tratado como incapaz por ter deficiência.'],
        ['Cena 3','Atitude: perguntar como ajudar, remover barreiras e respeitar escolhas.']
      ]
    },
    {
      titulo:'Bullying e discriminação: o que fazer',
      duracao:'45–60 s',
      slides:[
        ['Cena 1','Bullying envolve repetição, intimidação, humilhação ou exclusão.'],
        ['Cena 2','Quando envolve raça ou deficiência, a gravidade aumenta e exige atenção imediata.'],
        ['Cena 3','Atitude: registrar, acolher, comunicar um adulto responsável e buscar solução educativa.']
      ]
    },
    {
      titulo:'Inclusão: direito de participar',
      duracao:'45–60 s',
      slides:[
        ['Cena 1','Inclusão não significa apenas estar matriculado ou presente na sala.'],
        ['Cena 2','É preciso acesso, participação, aprendizagem, comunicação e pertencimento.'],
        ['Cena 3','A escola inclusiva identifica barreiras e muda práticas para que todos participem.']
      ]
    }
  ];

  function uuid(){
    if(window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return '00000000-0000-4000-8000-' + String(Date.now()).padStart(12,'0').slice(-12);
  }

  function perfil(){
    try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}')}catch(e){return {}}
  }

  function headers(){
    return {apikey:CFG.publishableKey || CFG.anonKey,'Content-Type':'application/json'};
  }

  function fila(){try{return JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]')}catch(e){return []}}
  function setFila(v){localStorage.setItem(QUEUE_KEY,JSON.stringify(v.slice(-400)))}
  function enfileirar(table,payload){const q=fila();q.push({table,payload});setFila(q);flush()}

  async function post(table,payload){
    const r=await fetch(`${CFG.url}/rest/v1/${table}`,{method:'POST',headers:{...headers(),Prefer:'return=minimal'},body:JSON.stringify(payload)});
    if(!r.ok) throw new Error(await r.text());
  }

  async function flush(){
    if(!navigator.onLine || !CFG.enabled) return;
    let q=fila();
    while(q.length){
      try{await post(q[0].table,q[0].payload);q.shift();setFila(q)}catch(e){break}
    }
  }

  async function buscarCiclo(){
    if(!CFG.enabled || !CFG.url) return null;
    try{
      const r=await fetch(`${CFG.url}/rest/v1/dupla_ciclos?select=id,nome,ativo,pesquisa_final_liberada,versao,created_at&ativo=eq.true&limit=1`,{headers:headers()});
      if(!r.ok) throw new Error(await r.text());
      const rows=await r.json();
      if(rows[0]){
        cicloAtual=rows[0];
        const anterior=JSON.parse(localStorage.getItem(CYCLE_KEY)||'null');
        if(anterior?.id && anterior.id!==cicloAtual.id) reiniciarPorNovoCiclo(anterior,cicloAtual);
        localStorage.setItem(CYCLE_KEY,JSON.stringify(cicloAtual));
        return cicloAtual;
      }
    }catch(e){
      try{cicloAtual=JSON.parse(localStorage.getItem(CYCLE_KEY)||'null')}catch(_){}
    }
    return cicloAtual;
  }

  function reiniciarPorNovoCiclo(anterior,novo){
    localStorage.removeItem(APP_STATE_KEY);
    localStorage.removeItem('pagina_municipal_36');
    localStorage.removeItem('concluintes_local');
    Object.keys(localStorage).forEach(k=>{
      if(k.startsWith('dupla_pesquisa_')||k.startsWith('dupla_v13_atividade_')||k.startsWith('dupla_resgate_')) localStorage.removeItem(k);
    });
    try{
      if(typeof estadoInicial==='function') estado=estadoInicial();
      if(typeof salvar==='function') salvar();
    }catch(e){}
    setTimeout(()=>{
      if(typeof modal==='function') modal(`<div class="dx13-card"><h2>Novo ciclo iniciado</h2><p>O ciclo anterior foi encerrado pela equipe pedagógica. Seu álbum, simulados, missões e pesquisas foram reiniciados para <b>${novo.nome}</b>.</p><button class="btn" onclick="fecharModal()">Começar novo ciclo</button></div>`);
    },400);
  }

  function surveyId(){
    let id=localStorage.getItem(SURVEY_ID_KEY);
    if(!id){id=uuid();localStorage.setItem(SURVEY_ID_KEY,id)}
    return id;
  }

  function keyPesquisa(tipo){return `dupla_pesquisa_${cicloAtual?.id||'sem-ciclo'}_${tipo}`}
  function respostaSalva(tipo){return localStorage.getItem(keyPesquisa(tipo))==='ok'}

  function abrirPesquisa(tipo){
    if(!cicloAtual){alert('Conecte-se à internet ao menos uma vez para carregar o ciclo atual.');return}
    if(tipo==='final'&&!cicloAtual.pesquisa_final_liberada){
      modal(`<div class="dx13-card"><h2>Pesquisa 2 ainda bloqueada</h2><p>A pesquisa final será liberada pela equipe pedagógica após o desenvolvimento do projeto.</p><button class="btn" onclick="fecharModal()">Fechar</button></div>`);return;
    }
    if(respostaSalva(tipo)){
      modal(`<div class="dx13-card"><h2>Pesquisa já respondida</h2><p>Sua ${tipo==='inicial'?'Pesquisa Inicial':'Pesquisa Final'} já foi registrada neste ciclo.</p><button class="btn" onclick="fecharModal()">Fechar</button></div>`);return;
    }
    const perguntas=tipo==='inicial'?PESQUISA_INICIAL:PESQUISA_FINAL;
    const p=perfil();
    const html=`<div class="dx13-survey"><h2>${tipo==='inicial'?'Pesquisa 1 — Diagnóstico Inicial':'Pesquisa 2 — Avaliação Final'}</h2>
      <p>${tipo==='inicial'?'Queremos conhecer sua percepção antes da experiência.':'Queremos medir aprendizagem, mudança de percepção e avaliar a metodologia.'}</p>
      <div class="dx13-priv">As perguntas sobre cotidiano são analisadas de forma agregada. Seu nome não é enviado nesta pesquisa.</div>
      <div class="dx13-grid2"><input id="dx13Escola" placeholder="Escola" value="${escAttr(p.escola_bairro||'')}"><input id="dx13Turma" placeholder="Turma / série" value="${escAttr(p.turma||'')}"></div>
      ${perguntas.map((q,i)=>`<div class="dx13-q"><b>${i+1}. ${q.texto}</b><div>${q.opcoes.map((op,j)=>`<label><input type="radio" name="dxq${i}" value="${j+1}"> ${op}</label>`).join('')}</div></div>`).join('')}
      <button class="btn" onclick="window.dx13EnviarPesquisa('${tipo}')">Enviar pesquisa</button></div>`;
    modal(html);
  }

  function escAttr(v){return String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}

  window.dx13EnviarPesquisa=function(tipo){
    const perguntas=tipo==='inicial'?PESQUISA_INICIAL:PESQUISA_FINAL;
    const respostas={}; const indicadores={}; const metodologia={};
    for(let i=0;i<perguntas.length;i++){
      const el=document.querySelector(`input[name="dxq${i}"]:checked`);
      if(!el){alert(`Responda a questão ${i+1}.`);return}
      const valor=Number(el.value); const q=perguntas[i];
      respostas[q.id]=valor;
      if(q.indicador) indicadores[q.indicador]=valor;
      if(q.metodologia) metodologia[q.id]=valor;
    }
    const payload={
      ciclo_id:cicloAtual.id,
      respondente_id:surveyId(),
      tipo,
      escola:document.getElementById('dx13Escola')?.value.trim()||null,
      turma:document.getElementById('dx13Turma')?.value.trim()||null,
      respostas,
      indicadores,
      metodologia,
      anonima:true
    };
    enfileirar('dupla_pesquisas_respostas',payload);
    localStorage.setItem(keyPesquisa(tipo),'ok');
    const premio=ganharFigurinhaUnica(`pesquisa-${tipo}`);
    modal(`<div class="dx13-card"><h2>Pesquisa enviada</h2><p>Obrigado por participar. ${premio?`Você ganhou a figurinha <b>${String(premio).padStart(2,'0')}</b> por concluir esta etapa.`:'Sua resposta foi registrada.'}</p><button class="btn" onclick="fecharModal();abrirTela('album')">Ir para o álbum</button></div>`);
  };

  function atividadeKey(id){return `dupla_v13_atividade_${cicloAtual?.id||'x'}_${id}`}
  function ganharFigurinhaUnica(id){
    if(localStorage.getItem(atividadeKey(id))==='ok') return null;
    if(typeof liberarFigurinha!=='function'||typeof salvar!=='function') return null;
    const n=liberarFigurinha(id);
    localStorage.setItem(atividadeKey(id),'ok');
    salvar();
    return n;
  }

  function registrarAtividade(atividade,categoria,resultado,pontos,recompensa){
    if(!cicloAtual) return;
    const p=perfil();
    enfileirar('dupla_atividades_resultados',{
      ciclo_id:cicloAtual.id,
      device_id:localStorage.getItem('dupla_device_id_v12')||uuid(),
      atividade,
      categoria,
      resultado:resultado||null,
      pontos:Number(pontos||0),
      recompensa:recompensa||null
    });
  }

  function abrirMicroaulas(){
    modal(`<div class="dx13-card"><h2>Vídeos e pílulas visuais</h2><p>Conteúdos curtos, pensados para uso com ou sem internet. Arquivos MP4 poderão ser acrescentados depois sem alterar a estrutura.</p><div class="dx13-list">${MICROAULAS.map((m,i)=>`<button class="dx13-item" onclick="window.dx13RodarMicro(${i},0)"><b>${m.titulo}</b><span>${m.duracao} • conclusão rende figurinha</span></button>`).join('')}</div></div>`);
  }

  window.dx13RodarMicro=function(i,pos){
    const m=MICROAULAS[i], s=m.slides[pos];
    modal(`<div class="dx13-micro"><div class="dx13-video"><div class="dx13-orb"></div><small>${m.titulo}</small><h2>${s[0]}</h2><p>${s[1]}</p><div class="dx13-progress"><i style="width:${((pos+1)/m.slides.length)*100}%"></i></div></div>${pos<m.slides.length-1?`<button class="btn" onclick="window.dx13RodarMicro(${i},${pos+1})">Continuar</button>`:`<button class="btn" onclick="window.dx13ConcluirMicro(${i})">Concluir pílula</button>`}</div>`);
  };

  window.dx13ConcluirMicro=function(i){
    const m=MICROAULAS[i];
    const n=ganharFigurinhaUnica(`micro-${i}`);
    registrarAtividade(m.titulo,'video','concluída',100,n?`figurinha ${n}`:'já recompensada');
    modal(`<div class="dx13-card"><h2>Pílula concluída</h2><p>${n?`Você ganhou a figurinha <b>${String(n).padStart(2,'0')}</b>.`:'Você já havia recebido a recompensa desta pílula.'}</p><p><b>Reflexão:</b> qual atitude concreta você adotaria se presenciasse uma situação parecida?</p><button class="btn" onclick="fecharModal();abrirTela('album')">Ir para o álbum</button></div>`);
  };

  function simuladosDistintos(){
    try{return new Set((estado.historico||[]).filter(x=>x.tipo==='simulado').map(x=>x.titulo)).size}catch(e){return 0}
  }
  function coladas(){try{return FIGURINHAS.filter(f=>reg(f.numero).colada).length}catch(e){return 0}}

  function abrirMissoes(){
    const sims=simuladosDistintos(), faltam=36-coladas();
    const resgate=sims>=5&&faltam>0;
    modal(`<div class="dx13-card"><h2>Missões complementares</h2><p>As missões evitam que um aluno conclua todos os simulados e fique sem possibilidade de completar o álbum.</p>
      <div class="dx13-stat"><b>${sims}/5</b><span>simulados diferentes concluídos</span></div><div class="dx13-stat"><b>${Math.max(0,faltam)}</b><span>figurinhas ainda não coladas</span></div>
      ${resgate?'<button class="btn" onclick="window.dx13MissaoResgate()">Iniciar Missão Resgate</button>':'<p class="dx13-priv">A Missão Resgate é liberada após os 5 simulados, caso o álbum ainda esteja incompleto.</p>'}
      <button class="btn" onclick="fecharModal();iniciarDesafio()">Desafio Final</button></div>`);
  }

  window.dx13MissaoResgate=function(){
    const qs=[
      ['Ao presenciar uma piada racista, qual atitude é mais adequada?',['Ignorar','Rir para evitar conflito','Interromper, acolher e buscar apoio','Compartilhar'],2],
      ['Acessibilidade é principalmente:',['Favor','Direito','Prêmio','Vantagem'],1],
      ['Tratar uma pessoa com deficiência como incapaz sem conhecê-la é:',['Cuidado','Capacitismo','Inclusão','Mediação'],1],
      ['Um game pedagógico deve:',['Só entreter','Ter objetivo de aprendizagem','Substituir todas as aulas','Evitar reflexão'],1],
      ['A escola inclusiva deve:',['Separar','Remover barreiras e garantir participação','Evitar adaptações','Silenciar conflitos'],1]
    ];
    let pos=0,ac=0;
    function tela(){const q=qs[pos];modal(`<div class="dx13-card"><h2>Missão Resgate</h2><p><b>${pos+1}/5.</b> ${q[0]}</p>${q[1].map((o,j)=>`<button class="opcao" onclick="window.dx13RespResgate(${j})">${'ABCD'[j]}) ${o}</button>`).join('')}</div>`)}
    window.dx13RespResgate=function(j){if(j===qs[pos][2])ac++;pos++;if(pos<qs.length)tela();else finalizar()};
    function finalizar(){
      if(ac<4){modal(`<div class="dx13-card"><h2>Tente novamente</h2><p>Você acertou ${ac}/5. Para receber o resgate, acerte pelo menos 4.</p><button class="btn" onclick="fecharModal()">Fechar</button></div>`);return}
      const qtd=Math.min(5,36-coladas()); const nums=[];
      for(let i=0;i<qtd;i++){const n=liberarFigurinha('missao-resgate');if(n)nums.push(n)}
      salvar(); registrarAtividade('Missão Resgate','missao',`${ac}/5`,ac*20,`${nums.length} figurinha(s)`);
      modal(`<div class="dx13-card"><h2>Missão cumprida</h2><p>Você acertou ${ac}/5 e recebeu <b>${nums.length} figurinha(s)</b> que ajudam a completar as lacunas restantes.</p><button class="btn" onclick="fecharModal();abrirTela('album')">Ir para o álbum</button></div>`);
    }
    tela();
  };

  function leiPara(f){
    const t=((f?.titulo||'')+' '+(f?.tema||'')).toLowerCase();
    if(/racis|racial|antirrac/.test(t)) return 'Lei 7.716/1989 — proteção contra discriminação e preconceito racial.';
    if(/defici|capacit|acess|libras|mobilidade|assistiva/.test(t)) return 'Lei 13.146/2015 — Lei Brasileira de Inclusão da Pessoa com Deficiência.';
    if(/bullying|intimida/.test(t)) return 'Lei 13.185/2015 — Programa de Combate à Intimidação Sistemática (Bullying).';
    return 'Constituição Federal — dignidade, igualdade e proteção contra discriminação.';
  }

  function perguntaReflexao(f){
    const t=(f?.tema||f?.titulo||'').toLowerCase();
    if(/racis/.test(t)) return 'Se isso acontecesse perto de você, como poderia interromper a situação sem expor ainda mais a vítima?';
    if(/capacit|defici|acess/.test(t)) return 'Que barreira poderia ser removida para garantir mais autonomia e participação?';
    if(/bullying/.test(t)) return 'Quem poderia ser procurado para interromper a repetição da violência e proteger quem sofreu?';
    return 'Que atitude concreta transforma esta mensagem em prática no cotidiano escolar?';
  }

  function reforcarFicha(){
    if(typeof abrirFicha!=='function') return;
    const original=abrirFicha;
    window.abrirFicha=function(num){
      const f=FIGURINHAS.find(x=>x.numero===num), r=reg(num);
      if(!r.colada) return original.apply(this,arguments);
      const img=typeof caminhoFigurinha==='function'?caminhoFigurinha(f):`figurinhas/${String(num).padStart(2,'0')}.webp`;
      const textos=typeof textoImpactoFicha==='function'?textoImpactoFicha(f):['','',''];
      modal(`<div class="ficha-detalhada"><button class="ficha-fechar-x" onclick="fecharModal()">×</button><div class="ficha-layout"><div class="ficha-texto"><h2>${String(num).padStart(2,'0')} — ${f.titulo}</h2><div class="ficha-tags"><span class="ficha-tag">Tema: ${f.tema||f.titulo}</span><span class="ficha-tag">Reflexão mantida</span></div><p><strong>Mensagem central:</strong> ${textos[0]}</p><p><strong>Por que isso importa?</strong> ${textos[1]}</p><p><strong>Reflexão:</strong> ${textos[2]}</p><div class="dx13-law"><b>Direito relacionado</b><span>${leiPara(f)}</span></div><div class="dx13-reflex"><b>Pense e converse</b><span>${perguntaReflexao(f)}</span></div><button class="ficha-fechar-btn" onclick="fecharModal()">Fechar</button></div><div class="ficha-midia"><img class="ficha-img-grande" src="${img}" alt="Figurinha ${num}"></div></div></div>`);
      registrarAtividade(`Reflexão figurinha ${num}`,'reflexao','visualizada',10,null);
    };
  }

  function snapshotV13(){
    if(!cicloAtual||typeof estado==='undefined'||typeof FIGURINHAS==='undefined'||typeof reg!=='function') return null;
    const p=perfil(), hist=Array.isArray(estado.historico)?estado.historico:[], sims=hist.filter(x=>x.tipo==='simulado');
    const ult=sims.length?sims[sims.length-1]:null;
    return {ciclo_id:cicloAtual.id,device_id:localStorage.getItem('dupla_device_id_v12')||uuid(),nome:p.nome||null,escola_bairro:p.escola_bairro||null,turma:p.turma||null,figurinhas_coladas:coladas(),pacotes:Number(estado.pacotes||0),repetidas:Number(estado.repetidas||0),simulados_concluidos:new Set(sims.map(x=>x.titulo)).size,ultimo_simulado:ult?.titulo||null,ultimo_acertos:ult?.acertos??null,game_concluido:Boolean(estado.gameConcluido||estado.game_concluido),album_completo:coladas()===36};
  }

  function syncProgresso(){
    const s=snapshotV13();if(!s)return;
    const fp=JSON.stringify(s);if(fp===ultimoFingerprint)return;ultimoFingerprint=fp;
    enfileirar('dupla_progresso',s);
  }

  function monitorarProgresso(){
    if(typeof salvar==='function'){
      const old=salvar;
      window.salvar=function(){const ret=old.apply(this,arguments);setTimeout(syncProgresso,0);return ret};
    }
    if(typeof finalizarSimuladoTema==='function'){
      const old=finalizarSimuladoTema;
      window.finalizarSimuladoTema=function(){
        let row=null;
        try{
          if(cicloAtual&&simuladoAtual&&Object.keys(respostasSimuladoAtual||{}).length===simuladoAtual.perguntas.length){
            let ac=0;simuladoAtual.perguntas.forEach((q,i)=>{if(respostasSimuladoAtual[i]===q[2])ac++});const p=perfil();
            row={ciclo_id:cicloAtual.id,device_id:localStorage.getItem('dupla_device_id_v12')||uuid(),nome:p.nome||null,escola_bairro:p.escola_bairro||null,turma:p.turma||null,simulado:String(simuladoAtual.titulo).slice(0,160),acertos:ac,total:simuladoAtual.perguntas.length,premio:ac===10?'1 pacote':'1 figurinha'};
          }
        }catch(e){}
        const ret=old.apply(this,arguments);if(row)enfileirar('dupla_simulados_resultados',row);setTimeout(syncProgresso,0);return ret;
      };
    }
  }

  function instalarUI(){
    const nav=document.querySelector('.topo nav');
    if(nav&&!document.getElementById('dx13Pesquisa1')){
      const mk=(id,txt,fn)=>{const b=document.createElement('button');b.id=id;b.textContent=txt;b.onclick=fn;return b};
      nav.appendChild(mk('dx13Pesquisa1','Pesquisa 1',()=>abrirPesquisa('inicial')));
      nav.appendChild(mk('dx13Pesquisa2','Pesquisa 2',()=>abrirPesquisa('final')));
      nav.appendChild(mk('dx13Videos','Vídeos',abrirMicroaulas));
      nav.appendChild(mk('dx13Missoes','Missões',abrirMissoes));
      nav.appendChild(mk('dx13Instalar','Instalar app',instalarApp));
    }
    const hero=document.querySelector('#tela-projeto .hero');
    if(hero&&!document.getElementById('dx13Journey')){
      const c=document.createElement('div');c.id='dx13Journey';c.className='dx13-journey';c.innerHTML=`<b>Jornada pedagógica v13</b><div>1. Diagnóstico inicial → 2. Aprendizagem → 3. Gamificação/Álbum → 4. Diagnóstico final</div><small id="dx13Cycle">Carregando ciclo...</small>`;hero.appendChild(c);
    }
    atualizarUI();
  }

  function atualizarUI(){
    const c=document.getElementById('dx13Cycle');if(c)c.textContent=cicloAtual?`${cicloAtual.nome} • Pesquisa 2: ${cicloAtual.pesquisa_final_liberada?'liberada':'bloqueada'}`:'Ciclo não carregado';
    const b=document.getElementById('dx13Pesquisa2');if(b)b.textContent=`Pesquisa 2${cicloAtual?.pesquisa_final_liberada?'':' 🔒'}`;
  }

  function instalarEstilos(){
    if(document.getElementById('dx13Style'))return;const s=document.createElement('style');s.id='dx13Style';s.textContent=`
      .dx13-journey{grid-column:1/-1;margin-top:14px;padding:14px 16px;border-radius:14px;background:linear-gradient(135deg,rgba(22,101,52,.92),rgba(15,23,42,.92));border:1px solid rgba(255,255,255,.18)}.dx13-journey b,.dx13-journey div,.dx13-journey small{display:block;margin:4px 0}.dx13-card,.dx13-survey,.dx13-micro{max-width:850px;margin:auto}.dx13-priv,.dx13-law,.dx13-reflex{padding:12px 14px;border-radius:12px;background:#eef6ff;color:#16324a;margin:12px 0}.dx13-grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}.dx13-grid2 input{padding:12px;border-radius:10px;border:1px solid #bbb}.dx13-q{padding:14px;border:1px solid #dbe4ed;border-radius:12px;margin:12px 0;background:#fff;color:#172033}.dx13-q label{display:block;padding:7px 4px}.dx13-list{display:grid;gap:10px}.dx13-item{display:flex;justify-content:space-between;gap:15px;text-align:left;padding:14px;border-radius:12px;border:1px solid #dbe4ed}.dx13-item span{opacity:.7}.dx13-video{min-height:310px;padding:28px;border-radius:18px;background:radial-gradient(circle at top right,#2563eb,#0f172a 60%);color:#fff;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden}.dx13-orb{width:150px;height:150px;border-radius:50%;background:rgba(255,255,255,.13);position:absolute;right:-25px;top:-20px;animation:dxpulse 2.4s infinite alternate}.dx13-progress{height:8px;background:rgba(255,255,255,.2);border-radius:99px;overflow:hidden}.dx13-progress i{display:block;height:100%;background:#fff}.dx13-stat{display:inline-flex;flex-direction:column;padding:12px 18px;margin:8px;border-radius:12px;background:#0f172a;color:#fff}.dx13-stat b{font-size:1.6rem}.dx13-law,.dx13-reflex{display:flex;flex-direction:column;gap:5px}.dx13-law{background:#fff7cc}.dx13-reflex{background:#dcfce7}@keyframes dxpulse{to{transform:scale(1.2) translate(-15px,12px)}}@media(max-width:700px){.dx13-grid2{grid-template-columns:1fr}.dx13-item{flex-direction:column}}
    `;document.head.appendChild(s);
  }

  function configurarPWA(){
    if(!document.querySelector('link[rel="manifest"]')){const l=document.createElement('link');l.rel='manifest';l.href='manifest.webmanifest';document.head.appendChild(l)}
    if('serviceWorker'in navigator) navigator.serviceWorker.register('service-worker.js').catch(()=>{});
    window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e});
  }

  function instalarApp(){
    if(installPrompt){installPrompt.prompt();installPrompt.userChoice.finally(()=>installPrompt=null);return}
    const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
    modal(`<div class="dx13-card"><h2>Instalar Dupla Exclusão</h2><p>${ios?'No iPhone/iPad: toque em Compartilhar e depois em “Adicionar à Tela de Início”.':'No Android/Chrome/Edge: abra o menu do navegador e escolha “Instalar app” ou “Adicionar à tela inicial”.'}</p><p>Depois de carregado, o PWA mantém os principais arquivos disponíveis offline.</p><button class="btn" onclick="fecharModal()">Fechar</button></div>`);
  }

  async function boot(){
    instalarEstilos();configurarPWA();await buscarCiclo();instalarUI();reforcarFicha();monitorarProgresso();syncProgresso();flush();atualizarUI();
  }

  window.addEventListener('online',async()=>{await buscarCiclo();atualizarUI();flush();syncProgresso()});
  window.DUPLA_V13={abrirPesquisa,abrirMicroaulas,abrirMissoes,buscarCiclo,get ciclo(){return cicloAtual}};
  if(document.readyState==='complete') boot(); else window.addEventListener('load',boot);
})();