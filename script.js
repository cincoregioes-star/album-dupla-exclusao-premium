const STORAGE_KEY = "album_dupla_exclusao_municipal_36_v1";
let paginaAtual = Number(localStorage.getItem("pagina_municipal_36") || 1);

function estadoInicial(){
  return {
    album:{},
    pacotes:2,
    repetidas:0,
    historico:[],
    simuladosFeitos:[],
    desafioFeito:false,
    conclusaoRegistrada:false,
    codigoConfirmacao:null
  };
}
let estado = carregar();

const albumAudio = {
  fundo: new Audio("audio/fundo.mp3"),
  click: new Audio("audio/click.mp3"),
  page: new Audio("audio/swipe.mp3"),
  pack: new Audio("audio/sparkle.mp3"),
  sticker: new Audio("audio/click.mp3"),
  erro: new Audio("audio/erro.mp3"),
  vitoria: new Audio("audio/vitoria.mp3")
};
albumAudio.fundo.loop = true;
let somAtivo = localStorage.getItem("som_album_municipal") === "on";

function playAudio(nome, volume=.65){
  try{
    if(!somAtivo) return;
    const a = albumAudio[nome];
    if(!a) return;
    a.currentTime = 0;
    a.volume = volume;
    a.play().catch(()=>{});
  }catch(e){}
}
function atualizarBotaoSom(){
  const btn = document.getElementById("btnSomAlbum");
  if(btn) btn.textContent = somAtivo ? "Som: ON" : "Som: OFF";
}
function alternarSom(){
  somAtivo = !somAtivo;
  localStorage.setItem("som_album_municipal", somAtivo ? "on" : "off");
  atualizarBotaoSom();
  try{
    if(somAtivo){ albumAudio.fundo.volume = .28; albumAudio.fundo.play().catch(()=>{}); }
    else albumAudio.fundo.pause();
  }catch(e){}
}


function supabaseConfig(){
  return window.SUPABASE_CONFIG || {
    enabled:false,
    url: SUPABASE_URL || "",
    anonKey: SUPABASE_ANON_KEY || "",
    table:"album_concluintes",
    premiosDisponiveis:10,
    totalFigurinhas:36
  };
}
function supabaseAtivo(){
  const cfg = supabaseConfig();
  return Boolean(cfg.enabled && cfg.url && cfg.anonKey && !cfg.url.includes("COLE_AQUI") && !cfg.anonKey.includes("COLE_AQUI"));
}
function supabaseHeaders(){
  const cfg = supabaseConfig();
  return {
    apikey: cfg.anonKey,
    Authorization: `Bearer ${cfg.anonKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation"
  };
}
async function supabaseInsertConcluinte(item){
  const cfg = supabaseConfig();
  if(!supabaseAtivo()) return {ok:false, offline:true};
  const resp = await fetch(`${cfg.url}/rest/v1/${cfg.table}`, {
    method:"POST",
    headers:supabaseHeaders(),
    body:JSON.stringify(item)
  });
  if(!resp.ok){
    const txt = await resp.text();
    throw new Error(txt || "Erro ao registrar no Supabase");
  }
  return {ok:true, data: await resp.json()};
}
async function supabaseListConcluintes(){
  const cfg = supabaseConfig();
  if(!supabaseAtivo()) return null;
  const resp = await fetch(`${cfg.url}/rest/v1/${cfg.table}?select=*&order=created_at.asc`, {
    headers:supabaseHeaders()
  });
  if(!resp.ok) throw new Error(await resp.text());
  return await resp.json();
}
async function supabaseAtualizarPremio(codigo, entregue=true){
  const cfg = supabaseConfig();
  if(!supabaseAtivo()) return false;
  const resp = await fetch(`${cfg.url}/rest/v1/${cfg.table}?codigo_confirmacao=eq.${encodeURIComponent(codigo)}`, {
    method:"PATCH",
    headers:supabaseHeaders(),
    body:JSON.stringify({premio_entregue:entregue})
  });
  if(!resp.ok) throw new Error(await resp.text());
  return true;
}


function carregar(){
  try{
    return {...estadoInicial(), ...(JSON.parse(localStorage.getItem(STORAGE_KEY))||{})};
  }catch(e){return estadoInicial()}
}
function salvar(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  atualizarStatus();
}
function reg(num){
  const id = "fig-"+String(num).padStart(2,"0");
  if(!estado.album[id]) estado.album[id]={quantidade:0,colada:false};
  return estado.album[id];
}
function irInicioAlbum(){
  playAudio("click");
  paginaAtual = 1;
  localStorage.setItem("pagina_municipal_36", "1");
  abrirTela("projeto");
}

function abrirTela(nome){
  document.querySelectorAll(".tela").forEach(t=>t.classList.remove("ativa"));
  document.getElementById("tela-"+nome).classList.add("ativa");
  if(nome==="album") renderAlbum();
  if(nome==="simulados") renderSimulados();
  if(nome==="admin") carregarConcluintes();
}
function atualizarStatus(){
  const coladas = FIGURINHAS.filter(f=>reg(f.numero).colada).length;
  const repetidas = estado.repetidas || 0;
  const pacotes = estado.pacotes || 0;

  const pac = document.getElementById("pacotesQtd");
  const rep = document.getElementById("repetidasQtd");
  const col = document.getElementById("coladasQtd");
  if(pac) pac.textContent = pacotes;
  if(rep) rep.textContent = repetidas;
  if(col) col.textContent = coladas;

  const np = document.getElementById("navStatusPacotes");
  const nc = document.getElementById("navStatusColadas");
  const nr = document.getElementById("navStatusRepetidas");
  if(np) np.textContent = pacotes;
  if(nc) nc.textContent = coladas;
  if(nr) nr.textContent = repetidas;
}
function imgSrc(num){return `figurinhas/${String(num).padStart(2,"0")}.webp`}

function totalPaginasAlbum(){
  return Math.ceil(FIGURINHAS.length / 3);
}

function dadosPaginaAtual(){
  const total = totalPaginasAlbum();
  if(paginaAtual < 1) paginaAtual = 1;
  if(paginaAtual > total) paginaAtual = total;

  const inicio = (paginaAtual - 1) * 3;
  const figs = FIGURINHAS.slice(inicio, inicio + 3);

  const grupo = Math.ceil(paginaAtual / 2);
  const p = PAGINAS[grupo - 1] || PAGINAS[PAGINAS.length - 1];

  return {p, figs, total};
}

function renderAlbum(){
  localStorage.setItem("pagina_municipal_36", paginaAtual);
  const {p, figs, total} = dadosPaginaAtual();

  document.getElementById("tituloPagina").textContent = `Página ${paginaAtual} de ${total} — ${p.titulo}`;

  const textoBarra = document.getElementById("textoPagina");
  if(textoBarra) textoBarra.textContent = "";

  const html = `<article class="pagina pagina-tres">
<h2>${p.titulo}</h2>
    <div class="texto-pagina texto-duas-linhas">${p.texto}</div>
    <div class="grid-fig grid-fig-tres">${figs.map(cardFig).join("")}</div>
  </article>`;

  document.getElementById("albumPages").innerHTML = html;
  verificarConclusao();
  atualizarStatus();
}


function caminhoFigurinha(f){
  if(typeof f === "number") return `figurinhas/${String(f).padStart(2,'0')}.webp`;
  if(!f) return "";
  return f.arquivo || f.imagem || f.img || f.src || `figurinhas/${String(f.numero).padStart(2,'0')}.webp`;
}
function textoImpactoFicha(f){
  const base = f.descricao || f.texto || f.mensagem || "Esta figurinha reforça a importância do respeito, da inclusão e do enfrentamento ao racismo e ao capacitismo no ambiente escolar.";
  const t1 = `Esta figurinha representa "${f.titulo}" e chama atenção para situações reais que exigem escuta, acolhimento e ação coletiva na escola.`;
  const t2 = `Quando esse tema é debatido, a comunidade escolar fortalece a participação, a acessibilidade, o pertencimento e o direito de aprender com dignidade.`;
  const t3 = base;
  return [t1, t2, t3];
}

function cardFig(f){
  const r = reg(f.numero);
  const tem = r.quantidade > 0 || r.colada;
  const img = caminhoFigurinha(f);
  const num = String(f.numero).padStart(2,"0");
  const rar = (f.raridade || "COMUM").toUpperCase();

  if(!tem){
    return `<div class="fig-card bloqueada">
      <span class="badge">${rar}</span>
      <div class="fig-img fig-img-bloq">
        <div class="numero-bloqueado">${num}</div>
        <div class="titulo-bloqueado">${f.titulo || ""}</div>
      </div>
      <button onclick="abrirFicha(${f.numero})">Bloqueada</button>
    </div>`;
  }

  return `<div class="fig-card ${r.colada ? "colada" : "disponivel"}">
    <span class="badge">${rar}</span>
    <div class="fig-img">
      <img class="figura-card-img" src="${img}" alt="Figurinha ${num}" loading="lazy" onerror="this.style.display='none'">
    </div>
    <button onclick="${r.colada ? `abrirFicha(${f.numero})` : `colarFig(${f.numero})`}">${r.colada ? "Ver ficha" : "Colar figurinha"}</button>
  </div>`;
}
function paginaAnterior(){ playAudio("page"); if(paginaAtual>1){paginaAtual--; renderAlbum();} }
function proximaPagina(){ playAudio("page"); if(paginaAtual<totalPaginasAlbum()){paginaAtual++; renderAlbum();} }

function abrirPacote(){
  playAudio('click');
  if(estado.pacotes<=0){
    modal(`<div class="pacote-modal">
      <button class="ficha-fechar-x" onclick="fecharModal()">×</button>
      <div class="pacote-cabecalho">
        <h2>Sem pacotes</h2>
        <p>Ganhe pacotes nos simulados, no game e no desafio final para continuar completando o álbum.</p>
      </div>
      <div class="pacote-acoes">
        <button class="pacote-btn secundario" onclick="fecharModal()">Fechar</button>
        <button class="pacote-btn" onclick="fecharModal();abrirTela('simulados')">Ir para simulados</button>
      </div>
    </div>`);
    return;
  }

  estado.pacotes--;
  const ganhas = [];
  for(let i=0;i<5;i++) ganhas.push(liberarFigurinha("pacote"));
  salvar();
  atualizarStatus();
  playAudio("pack");

  modal(`<div class="pacote-modal">
    <button class="ficha-fechar-x" onclick="fecharModal()">×</button>
    <div class="pacote-cabecalho">
      <h2>Pacote aberto</h2>
      <p>Você ganhou estas figurinhas:</p>
    </div>
    <div class="pacote-grid">
      ${ganhas.map(num=>{
        const f = FIGURINHAS.find(x => x.numero === num) || {numero:num,titulo:"Dupla Exclusão"};
        return `
        <div class="pacote-card">
          <div class="pacote-card-img">
            <img src="${caminhoFigurinha(f)}" alt="Figurinha ${String(f.numero).padStart(2,'0')}" loading="lazy">
          </div>
          <div class="pacote-card-info">
            <strong>Figurinha ${String(f.numero).padStart(2,'0')}</strong>
            <span>${f.titulo || f.tema || "Dupla Exclusão"}</span>
          </div>
        </div>`;
      }).join("")}
    </div>
    <div class="pacote-acoes">
      <button class="pacote-btn secundario" onclick="fecharModal()">Fechar</button>
      <button class="pacote-btn" onclick="fecharModal();abrirTela('album')">Ir para o álbum</button>
    </div>
  </div>`);
}
function liberarFigurinha(motivo){
  let disponiveis = FIGURINHAS.filter(f=>!reg(f.numero).colada && reg(f.numero).quantidade===0);
  let f = disponiveis.length ? disponiveis[Math.floor(Math.random()*disponiveis.length)] : FIGURINHAS[Math.floor(Math.random()*FIGURINHAS.length)];
  const r=reg(f.numero);
  if(r.quantidade>0 || r.colada) estado.repetidas = Number(estado.repetidas||0)+1;
  r.quantidade++;
  estado.historico.push({tipo:"figurinha",motivo,numero:f.numero,data:new Date().toISOString()});
  return f.numero;
}
function colarFig(num){
  playAudio('click');
  const r=reg(num);
  if(r.quantidade<=0 || r.colada) return;
  r.quantidade--;
  r.colada=true;
  estado.historico.push({tipo:"colada",numero:num,data:new Date().toISOString()});
  salvar();
  renderAlbum();
  abrirFicha(num);
}
function abrirFicha(num){
  playAudio("click");
  const f = FIGURINHAS.find(x => x.numero === num);
  const r = reg(num);
  if(!r.colada){
    modal(`<div class="ficha-detalhada">
      <button class="ficha-fechar-x" onclick="fecharModal()">×</button>
      <div class="ficha-bloqueada-wrap">
        <h2>Ficha bloqueada</h2>
        <p>Primeiro ganhe a figurinha, cole no álbum e depois volte aqui para visualizar a ficha técnica completa.</p>
        <div class="ficha-acoes">
          <button class="ficha-fechar-btn" onclick="fecharModal()">Fechar</button>
        </div>
      </div>
    </div>`);
    return;
  }

  const img = caminhoFigurinha(f);
  const rar = (f.raridade || "COMUM").toUpperCase();
  const tema = f.tema || f.titulo || "Inclusão escolar";
  const textos = textoImpactoFicha(f);

  modal(`<div class="ficha-detalhada">
    <button class="ficha-fechar-x" onclick="fecharModal()">×</button>
    <div class="ficha-layout">
      <div class="ficha-texto">
        <h2>${String(num).padStart(2,"0")} — ${f.titulo}</h2>
        <div class="ficha-tags">
          <span class="ficha-tag">Tema: ${tema}</span>
          <span class="ficha-tag">Raridade: ${rar}</span>
        </div>
        <p><strong>Mensagem central:</strong> ${textos[0]}</p>
        <p><strong>Por que isso importa?</strong> ${textos[1]}</p>
        <p><strong>Reflexão:</strong> ${textos[2]}</p>
        <div class="ficha-destaque">Inclusão não é favor: é direito. Respeito, acessibilidade e participação transformam a escola em um espaço de pertencimento para todos.</div>
        <div class="ficha-acoes">
          <button class="ficha-fechar-btn" onclick="fecharModal()">Fechar</button>
        </div>
      </div>
      <div class="ficha-midia">
        <div class="ficha-figure-wrap">
          <img class="ficha-img-grande" src="${img}" alt="Figurinha ${String(num).padStart(2,"0")}" loading="lazy">
        </div>
      </div>
    </div>
  </div>`);
}

const QUESTOES_ANTERIOR = [
["O que é capacitismo?",["Tratar pessoas com deficiência como incapazes ou inferiores","Apenas construir rampas","Uma disciplina escolar","Um tipo de esporte"],0],
["O que é racismo estrutural?",["Desigualdade presente nas estruturas sociais","Uma opinião individual sem efeitos","Uma brincadeira sem consequência","Um conteúdo de matemática"],0],
["A ficha técnica deve ser liberada quando?",["Depois que a figurinha for colada","Assim que abrir o site","Antes de ganhar a figurinha","Nunca"],0],
["Qual atitude ajuda a inclusão escolar?",["Adaptar materiais e respeitar diferentes formas de aprender","Isolar o estudante","Ignorar Libras","Impedir participação"],0],
["Quando um aluno surdo não tem acessibilidade comunicacional, falta:",["Direito à comunicação","Uniforme escolar","Prova difícil","Recreio"],0],
["Bullying contra deficiência e raça deve ser tratado como:",["Problema sério de discriminação","Brincadeira normal","Assunto sem importância","Competição"],0],
["A escola inclusiva deve garantir:",["Acessibilidade, respeito e pertencimento","Apenas notas altas","Silêncio absoluto","Separação dos alunos"],0],
["Representatividade significa:",["Ver diferentes pessoas valorizadas nos espaços","Excluir histórias diversas","Mostrar apenas um grupo","Evitar debates"],0],
["A família e a escola devem:",["Dialogar em parceria pelo direito do estudante","Culpar o aluno","Evitar adaptações","Esconder dificuldades"],0],
["Combater racismo e capacitismo é responsabilidade:",["De toda a comunidade escolar","Somente do aluno","Somente da família","De ninguém"],0]
];
let respostasQuizAnterior = {};
function renderSimulados(){
  const area = document.getElementById("simuladosArea");
  respostasQuizAnterior = {};
  area.innerHTML = `<div class="quiz-card quiz-card-unico">
    <h3>Simulado do Tema</h3>
    <p>10 questões. Gabaritou: 3 pacotes. Até 9 acertos: 1 pacote.</p>
    <button class="btn" onclick="iniciarSimuladoAnterior()">Iniciar simulado</button>
  </div>`;
}
function iniciarSimuladoAnterior(){
  respostasQuizAnterior = {};
  renderPerguntasSimuladoAnterior();
}
function renderPerguntasSimuladoAnterior(){
  const area = document.getElementById("simuladosArea");
  area.innerHTML = QUESTOES_ANTERIOR.map((q,i)=>`
    <div class="pergunta-box">
      <p><b>${i+1}. ${q[0]}</b></p>
      ${q[1].map((op,j)=>`<button class="opcao ${respostasQuizAnterior[i]===j?'selecionada':''}" onclick="marcarRespostaAnterior(${i},${j})">${"ABCD"[j]}) ${op}</button>`).join("")}
    </div>
  `).join("") + `<button class="btn btn-finalizar-quiz" onclick="finalizarQuizAnterior()">Finalizar simulado</button>`;
}
function marcarRespostaAnterior(i,j){
  respostasQuizAnterior[i]=j;
  renderPerguntasSimuladoAnterior();
}
function finalizarQuizAnterior(){
  if(Object.keys(respostasQuizAnterior).length < QUESTOES_ANTERIOR.length){
    alert("Responda todas as 10 questões.");
    return;
  }
  let acertos = 0;
  QUESTOES_ANTERIOR.forEach((q,i)=>{ if(respostasQuizAnterior[i] === q[2]) acertos++; });
  const ganho = acertos === 10 ? 3 : 1;
  estado.pacotes = Number(estado.pacotes || 0) + ganho;
  estado.historico = estado.historico || [];
  estado.historico.push({tipo:"simulado", acertos, pacotes:ganho, data:new Date().toISOString()});
  salvar();
  atualizarStatus();
  const area = document.getElementById("simuladosArea");
  area.innerHTML = `<div class="quiz-card quiz-card-unico">
    <h3>Resultado: ${acertos}/10</h3>
    <p>Você ganhou <b>${ganho} pacote(s)</b>. Agora abra pacotes e cole as figurinhas manualmente no álbum.</p>
    <button class="btn" onclick="abrirPacote()">Abrir pacote</button>
    <button class="btn" onclick="renderSimulados()">Responder novamente</button>
  </div>`;
}

function iniciarDesafio(){
  const perguntas = [
    ["A dupla exclusão exige olhar para:",["Barreiras combinadas","Apenas notas","Só uniforme","Só recreio"],0],
    ["Uma escola antirracista precisa:",["Agir de forma permanente","Fazer ação isolada","Evitar debate","Culpar aluno"],0],
    ["Capacitismo pode estar em:",["Falas que diminuem a capacidade","Acessibilidade","Respeito","Autonomia"],0],
    ["Representatividade contribui para:",["Pertencimento","Silenciamento","Exclusão","Separação"],0],
    ["Acessibilidade comunicacional inclui:",["Libras e recursos visuais","Só rampa","Só prova","Só recreio"],0],
    ["Gestão comprometida deve:",["Planejar inclusão","Ignorar barreiras","Separar alunos","Evitar famílias"],0],
    ["Colegas aliados combatem:",["Bullying e discriminação","Aprendizagem","Acessibilidade","Participação"],0],
    ["Tecnologia assistiva promove:",["Autonomia","Dependência forçada","Exclusão","Silêncio"],0],
    ["Denunciar discriminação é:",["Proteção de direitos","Fofoca","Brincadeira","Competição"],0],
    ["Escola que inclui ajuda a construir:",["Cidade que respeita","Cidade que exclui","Prova mais difícil","Menos participação"],0],
  ];
  let pos=0, acertos=0;
  function tela(){
    const q=perguntas[pos];
    modal(`<h2>Desafio Final</h2><p><b>${pos+1}/10.</b> ${q[0]}</p>${q[1].map((op,idx)=>`<button class="opcao" onclick="responderDesafio(${idx})">${"ABCD"[idx]}) ${op}</button>`).join("")}`);
  }
  window.responderDesafio=(idx)=>{
    if(idx===perguntas[pos][2]) acertos++;
    pos++;
    if(pos<perguntas.length) tela();
    else{
      if(acertos===10){
        for(let i=0;i<10;i++) liberarFigurinha("desafio-final");
        estado.desafioFeito=true;
        salvar();
        modal(`<h2>Desafio vencido</h2><p>Você acertou 10/10 e ganhou 10 figurinhas.</p><button class="btn" onclick="fecharModal();abrirTela('album')">Ir para o álbum</button>`);
      }else{
        modal(`<h2>Tente novamente</h2><p>Você acertou ${acertos}/10. Para ganhar as 10 figurinhas, precisa acertar todas.</p><button class="btn" onclick="fecharModal()">Fechar</button>`);
      }
    }
  }
  tela();
}

function verificarConclusao(){
  const total=FIGURINHAS.filter(f=>reg(f.numero).colada).length;
  if(total===36 && !estado.conclusaoRegistrada){
    telaConclusao();
  }
}
function telaConclusao(){
  const codigo = estado.codigoConfirmacao || ("DX-"+Date.now().toString().slice(-6));
  estado.codigoConfirmacao = codigo;
  salvar();
  modal(`<div class="conclusao"><h2>Parabéns!</h2><p>Você completou o Álbum Digital Dupla Exclusão.</p><p><b>Código de confirmação:</b> ${codigo}</p><p>Mostre esta tela aos alunos apresentadores para concorrer ao álbum impresso.</p></div>
  <div class="form-final"><input id="nomeFinal" placeholder="Nome do participante"><input id="escolaFinal" placeholder="Escola, bairro ou cidade"><input id="whatsFinal" placeholder="WhatsApp opcional"></div>
  <button class="btn" onclick="registrarConclusao()">Registrar conclusão</button>`);
}
async function registrarConclusao(){
  const nome=document.getElementById("nomeFinal").value.trim();
  const escola=document.getElementById("escolaFinal").value.trim();
  const whats=document.getElementById("whatsFinal").value.trim();

  if(!nome){
    alert("Digite o nome.");
    return;
  }

  const item={
    nome,
    escola_bairro:escola,
    whatsapp:whats,
    codigo_confirmacao:estado.codigoConfirmacao,
    total_figurinhas:36,
    album_completo:true,
    premio_entregue:false,
    user_agent:navigator.userAgent,
    origem:"album-digital-feira-municipal",
    created_at:new Date().toISOString()
  };

  let lista=JSON.parse(localStorage.getItem("concluintes_local")||"[]");
  if(!lista.some(x=>x.codigo_confirmacao===item.codigo_confirmacao)) lista.push(item);
  localStorage.setItem("concluintes_local", JSON.stringify(lista));

  let onlineOk=false;
  let erroOnline="";

  try{
    if(supabaseAtivo()){
      await supabaseInsertConcluinte(item);
      onlineOk=true;
    }
  }catch(e){
    erroOnline = e.message || String(e);
    console.warn("Erro Supabase:", e);
  }

  estado.conclusaoRegistrada=true;
  salvar();

  const ranking = await obterRankingConcluintes();
  const pos = ranking.findIndex(x=>x.codigo_confirmacao===item.codigo_confirmacao) + 1;
  const cfg = supabaseConfig();
  const ganhou = pos > 0 && pos <= Number(cfg.premiosDisponiveis || 10);

  modal(`
    <h2>Conclusão registrada</h2>
    <div class="conclusao">
      <p><b>Código:</b> ${item.codigo_confirmacao}</p>
      <p><b>Participante:</b> ${item.nome}</p>
      ${pos ? `<p><b>Ordem de chegada:</b> ${pos}º</p>` : ""}
      ${ganhou ? `<p style="color:#166534"><b>Você está entre os 10 primeiros. Procure a mesa para receber o álbum impresso.</b></p>` : `<p><b>Álbum completo.</b> Os prêmios impressos podem já ter sido encerrados.</p>`}
      <p>${onlineOk ? "Registro enviado ao Supabase com sucesso." : "Registro salvo neste navegador."}</p>
      ${erroOnline ? `<p style="color:#b91c1c"><small>Supabase não confirmou agora: ${erroOnline}</small></p>` : ""}
    </div>
    <button class="btn" onclick="fecharModal()">Fechar</button>
  `);
}

async function obterRankingConcluintes(){
  let listaLocal=JSON.parse(localStorage.getItem("concluintes_local")||"[]");
  try{
    const online = await supabaseListConcluintes();
    if(Array.isArray(online)) return online;
  }catch(e){
    console.warn("Ranking Supabase indisponível:", e);
  }
  return listaLocal.sort((a,b)=>String(a.created_at).localeCompare(String(b.created_at)));
}

async function carregarConcluintes(){
  const area = document.getElementById("listaConcluintes");
  area.innerHTML = "<p>Carregando concluintes...</p>";

  let lista = [];
  let origem = "local";

  try{
    const online = await supabaseListConcluintes();
    if(Array.isArray(online)){
      lista = online;
      origem = "Supabase";
    }
  }catch(e){
    console.warn("Erro ao buscar Supabase:", e);
  }

  if(!lista.length){
    lista = JSON.parse(localStorage.getItem("concluintes_local")||"[]");
  }

  lista.sort((a,b)=>String(a.created_at).localeCompare(String(b.created_at)));

  if(!lista.length){
    area.innerHTML = "<p>Nenhum concluinte registrado ainda.</p>";
    return;
  }

  const cfg = supabaseConfig();
  const limite = Number(cfg.premiosDisponiveis || 10);

  area.innerHTML = `
    <p><b>Fonte:</b> ${origem} • <b>Total:</b> ${lista.length} • <b>Premiados:</b> primeiros ${limite}</p>
    ${lista.map((x,i)=>{
      const pos=i+1;
      const premiado=pos<=limite;
      return `<div class="linha-concluinte ${premiado?'premiado':''}">
        <b>${pos}</b>
        <span>
          <b>${x.nome}</b><br>
          <small>${x.escola_bairro||""} ${x.whatsapp? " • "+x.whatsapp : ""}</small><br>
          <small>Código: ${x.codigo_confirmacao} • ${new Date(x.created_at).toLocaleString("pt-BR")}</small>
          ${premiado? '<br><small style="color:#22c55e"><b>Entre os 10 primeiros</b></small>' : ''}
        </span>
        <button onclick="marcarPremio('${x.codigo_confirmacao}')">${x.premio_entregue?"Entregue":"Marcar prêmio"}</button>
      </div>`;
    }).join("")}
  `;
}

async function marcarPremio(cod){
  let lista=JSON.parse(localStorage.getItem("concluintes_local")||"[]");
  lista=lista.map(x=>x.codigo_confirmacao===cod?{...x,premio_entregue:true}:x);
  localStorage.setItem("concluintes_local", JSON.stringify(lista));

  try{
    await supabaseAtualizarPremio(cod, true);
  }catch(e){
    console.warn("Não foi possível atualizar no Supabase agora:", e);
  }

  carregarConcluintes();
}

function exportarConcluintes(){
  const lista=JSON.parse(localStorage.getItem("concluintes_local")||"[]");
  const csv=["nome,escola_bairro,whatsapp,codigo_confirmacao,created_at,premio_entregue"].concat(lista.map(x=>`"${x.nome}","${x.escola_bairro||""}","${x.whatsapp||""}","${x.codigo_confirmacao}","${x.created_at}","${x.premio_entregue}"`)).join("\n");
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
  a.download="concluintes_album.csv"; a.click();
}
function confirmarReinicio(){
  if(confirm("Tem certeza que deseja reiniciar todo o álbum neste navegador?")){
    localStorage.removeItem(STORAGE_KEY);
    estado=estadoInicial();
    paginaAtual=1;
    salvar();
    renderAlbum();
  }
}
function modal(html){document.getElementById("modalConteudo").innerHTML=html;document.getElementById("modal").classList.remove("oculto")}
function fecharModal(){document.getElementById("modal").classList.add("oculto")}
function init(){
  atualizarStatus();
  atualizarBotaoSom();
  abrirTela("projeto");
}
init();

/* Exposição defensiva para botões HTML */
window.abrirTela = abrirTela;
window.abrirPacote = abrirPacote;
window.paginaAnterior = paginaAnterior;
window.proximaPagina = proximaPagina;
window.confirmarReinicio = confirmarReinicio;
window.alternarSom = alternarSom;

window.irInicioAlbum = irInicioAlbum;
