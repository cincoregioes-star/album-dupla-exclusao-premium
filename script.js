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
  if(nome==="album"){ renderAlbum(); setTimeout(ativarSwipeMobileAlbum, 50); }
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


const SIMULADOS_TEMA = [
  {
    titulo:"Simulado 1 — Conceitos Básicos",
    perguntas:[
      ["O que é capacitismo?",["Tratar pessoas com deficiência como incapazes ou inferiores","Apenas construir rampas","Uma disciplina escolar","Um tipo de esporte"],0],
      ["O que é racismo estrutural?",["Desigualdade presente nas estruturas sociais","Uma opinião individual sem efeitos","Uma brincadeira sem consequência","Um conteúdo de matemática"],0],
      ["Dupla exclusão acontece quando:",["A pessoa sofre mais de uma forma de discriminação ao mesmo tempo","A escola realiza uma festa","O aluno ganha material escolar","A turma muda de sala"],0],
      ["A inclusão escolar deve garantir:",["Acessibilidade, respeito e pertencimento","Separação dos alunos","Silêncio absoluto","Apenas notas altas"],0],
      ["Acessibilidade é:",["Direito","Favor","Prêmio","Castigo"],0],
      ["Racismo pode aparecer na escola por meio de:",["Apelidos, exclusões e baixa expectativa","Somente provas difíceis","Apenas uniforme","Somente horário de recreio"],0],
      ["Capacitismo acontece quando:",["A pessoa com deficiência é tratada como incapaz","A escola adapta material","Há respeito à autonomia","Todos participam"],0],
      ["Representatividade significa:",["Ver diferentes pessoas valorizadas nos espaços","Apagar histórias diversas","Mostrar apenas um grupo","Evitar debates"],0],
      ["O projeto do álbum busca:",["Ensinar inclusão de forma interativa","Substituir todos os professores","Evitar o tema","Apenas colecionar imagens"],0],
      ["Combater discriminação é responsabilidade:",["De toda a comunidade escolar","Somente do aluno","Somente da família","De ninguém"],0]
    ]
  },
  {
    titulo:"Simulado 2 — Racismo no Ambiente Escolar",
    perguntas:[
      ["Uma escola antirracista deve:",["Reconhecer e combater práticas racistas","Ignorar apelidos","Evitar representatividade","Culpar a vítima"],0],
      ["Baixa expectativa sobre alunos negros pode causar:",["Limitação de oportunidades e desvalorização","Mais inclusão","Mais autonomia","Acesso garantido"],0],
      ["Silenciar um estudante significa:",["Impedir sua voz e participação","Valorizar sua opinião","Garantir escuta","Promover respeito"],0],
      ["Representatividade contribui para:",["Pertencimento e autoestima","Exclusão","Silenciamento","Separação"],0],
      ["Preconceito racial pode aparecer em:",["Piadas, olhares, falas e oportunidades negadas","Somente livros","Apenas fora da escola","Nunca aparece"],0],
      ["A Lei e a educação devem defender:",["Igualdade, respeito e dignidade","Exclusão","Discriminação","Separação"],0],
      ["Uma atitude correta diante de racismo é:",["Denunciar, acolher e orientar","Rir da situação","Ignorar","Culpar quem sofreu"],0],
      ["A escola deve trabalhar a história negra para:",["Valorizar identidades e combater preconceitos","Reforçar estereótipos","Evitar debate","Diminuir participação"],0],
      ["O racismo estrutural é grave porque:",["Está presente em práticas, instituições e oportunidades","É apenas brincadeira","Não causa efeitos","Só existe no passado"],0],
      ["Combater o racismo na escola exige:",["Ações permanentes e compromisso coletivo","Apenas uma palestra isolada","Silêncio","Separar estudantes"],0]
    ]
  },
  {
    titulo:"Simulado 3 — Capacitismo e Acessibilidade",
    perguntas:[
      ["Acessibilidade comunicacional inclui:",["Libras, recursos visuais e formas adequadas de comunicação","Somente rampas","Somente uniforme","Apenas provas"],0],
      ["Tecnologia assistiva serve para:",["Ampliar autonomia e participação","Substituir o professor","Separar estudantes","Dar vantagem injusta"],0],
      ["Material adaptado deve:",["Apoiar a aprendizagem","Diminuir o estudante","Facilitar sem objetivo","Isolar o aluno"],0],
      ["Mobilidade na escola envolve:",["Rampas, caminhos acessíveis e segurança","Somente recreio","Somente pintura","Somente uniforme"],0],
      ["Autonomia significa:",["Apoiar sem controlar a pessoa","Fazer tudo pelo aluno","Ignorar necessidades","Impedir escolhas"],0],
      ["Inclusão verdadeira ocorre quando:",["Todos participam com dignidade","O aluno fica separado","Só alguns aprendem","Não há adaptação"],0],
      ["Tratar pessoa com deficiência como incapaz é:",["Capacitismo","Acessibilidade","Representatividade","Cuidado correto"],0],
      ["Barreiras podem ser:",["Físicas, comunicacionais, pedagógicas e atitudinais","Apenas paredes","Somente tarefas","Apenas recreio"],0],
      ["A escola inclusiva precisa:",["Remover barreiras e garantir pertencimento","Evitar adaptações","Isolar estudantes","Ignorar famílias"],0],
      ["Libras é importante porque:",["Garante comunicação e participação de pessoas surdas","Serve para separar estudantes","Impede aprendizagem","Substitui todo conteúdo"],0]
    ]
  },
  {
    titulo:"Simulado 4 — Família, Escola e Comunidade",
    perguntas:[
      ["Família e escola devem:",["Dialogar em parceria pelo direito do estudante","Culpar o aluno","Evitar adaptações","Esconder dificuldades"],0],
      ["O conselho escolar pode ajudar:",["Debatendo direitos, inclusão e participação","Cancelando aulas","Separando alunos","Evitando família"],0],
      ["Professor mediador deve:",["Escutar, orientar e transformar conflitos em aprendizagem","Expor o aluno","Ignorar conflitos","Reforçar preconceitos"],0],
      ["Gestão comprometida deve:",["Planejar inclusão e acompanhar barreiras","Evitar diálogo","Separar estudantes","Ignorar acessibilidade"],0],
      ["Colegas aliados são importantes porque:",["Acolhem e combatem exclusões","Riem do colega","Reforçam apelidos","Isolam estudantes"],0],
      ["Comunidade escolar inclui:",["Alunos, famílias, professores, gestão e comunidade","Somente direção","Apenas visitantes","Só professores"],0],
      ["Rede de apoio serve para:",["Garantir pertencimento e participação","Transferir culpa","Evitar adaptação","Impedir participação"],0],
      ["A gestão deve acompanhar:",["Resultados, barreiras e ações inclusivas","Apenas decoração","Somente uniforme","Nada"],0],
      ["A família presente ajuda quando:",["Participa do diálogo e acompanha a aprendizagem","Culpa a escola sem conversar","Evita reuniões","Impede adaptações"],0],
      ["A inclusão depende de:",["Compromisso coletivo","Apenas sorte","Isolamento","Silêncio"],0]
    ]
  },
  {
    titulo:"Simulado 5 — Compromisso Coletivo",
    perguntas:[
      ["Bullying contra raça ou deficiência deve ser tratado como:",["Discriminação séria","Brincadeira normal","Competição","Assunto sem importância"],0],
      ["Denunciar discriminação ajuda a:",["Proteger direitos","Criar fofoca","Evitar diálogo","Punir sem ouvir"],0],
      ["Respeito às diferenças fortalece:",["Convivência e pertencimento","Exclusão","Silêncio","Preconceito"],0],
      ["Protagonismo estudantil significa:",["Alunos participando e transformando a realidade","Alunos calados","Só professor fala","Evitar projetos"],0],
      ["Uma escola que inclui remove:",["Barreiras","Direitos","Acessibilidade","Participação"],0],
      ["Uma cidade que respeita valoriza:",["As diferenças e a dignidade humana","A exclusão","O preconceito","A desigualdade"],0],
      ["Completar o álbum representa:",["Concluir uma jornada de aprendizagem sobre inclusão","Ganhar sem aprender","Evitar o tema","Apagar o projeto"],0],
      ["O game no álbum deve servir para:",["Estimular participação e aprendizagem","Substituir o tema","Evitar reflexão","Impedir acesso"],0],
      ["Os 10 primeiros concluintes podem receber:",["Álbum impresso A4 e figurinhas pequenas","Advertência","Prova extra","Nada"],0],
      ["O compromisso final do projeto é combater:",["Racismo, capacitismo e exclusões","Acessibilidade","Respeito","Inclusão"],0]
    ]
  }
];

let simuladoAtual = null;
let respostasSimuladoAtual = {};

function renderSimulados(){
  respostasSimuladoAtual = {};
  simuladoAtual = null;
  const area = document.getElementById("simuladosArea");
  area.innerHTML = SIMULADOS_TEMA.map((s,i)=>`
    <div class="quiz-card quiz-card-unico">
      <h3>${s.titulo}</h3>
      <p>10 questões. Acertou as 10: ganha <b>1 pacote</b>. Errou qualquer uma: ganha <b>1 figurinha</b>.</p>
      <button class="btn" onclick="iniciarSimuladoTema(${i})">Responder</button>
    </div>
  `).join("");
}

function iniciarSimuladoTema(indice){
  simuladoAtual = SIMULADOS_TEMA[indice];
  respostasSimuladoAtual = {};
  renderPerguntasSimuladoTema();
}

function renderPerguntasSimuladoTema(){
  const area = document.getElementById("simuladosArea");
  area.innerHTML = `
    <div class="quiz-card quiz-card-unico">
      <h3>${simuladoAtual.titulo}</h3>
      <p>Marque uma alternativa em cada questão.</p>
    </div>
    ${simuladoAtual.perguntas.map((q,i)=>`
      <div class="pergunta-box">
        <p><b>${i+1}. ${q[0]}</b></p>
        ${q[1].map((op,j)=>`<button class="opcao ${respostasSimuladoAtual[i]===j?'selecionada':''}" onclick="marcarRespostaSimuladoTema(${i},${j})">${"ABCD"[j]}) ${op}</button>`).join("")}
      </div>
    `).join("")}
    <button class="btn btn-finalizar-quiz" onclick="finalizarSimuladoTema()">Finalizar simulado</button>
  `;
}

function marcarRespostaSimuladoTema(i,j){
  respostasSimuladoAtual[i]=j;
  renderPerguntasSimuladoTema();
}

function finalizarSimuladoTema(){
  if(!simuladoAtual) return;
  if(Object.keys(respostasSimuladoAtual).length < simuladoAtual.perguntas.length){
    alert("Responda todas as 10 questões.");
    return;
  }

  let acertos = 0;
  simuladoAtual.perguntas.forEach((q,i)=>{ if(respostasSimuladoAtual[i] === q[2]) acertos++; });

  estado.historico = estado.historico || [];

  if(acertos === 10){
    estado.pacotes = Number(estado.pacotes || 0) + 1;
    estado.historico.push({tipo:"simulado", titulo:simuladoAtual.titulo, acertos, premio:"1 pacote", data:new Date().toISOString()});
    salvar();
    atualizarStatus();
    document.getElementById("simuladosArea").innerHTML = `<div class="quiz-card quiz-card-unico">
      <h3>Resultado: ${acertos}/10</h3>
      <p>Parabéns! Você acertou tudo e ganhou <b>1 pacote</b>.</p>
      <button class="btn" onclick="abrirPacote()">Abrir pacote</button>
      <button class="btn" onclick="renderSimulados()">Voltar aos simulados</button>
    </div>`;
  }else{
    const n = liberarFigurinha("simulado");
    const f = FIGURINHAS.find(x => x.numero === n);
    estado.historico.push({tipo:"simulado", titulo:simuladoAtual.titulo, acertos, premio:"1 figurinha", numero:n, data:new Date().toISOString()});
    salvar();
    atualizarStatus();
    document.getElementById("simuladosArea").innerHTML = `<div class="quiz-card quiz-card-unico">
      <h3>Resultado: ${acertos}/10</h3>
      <p>Você não acertou as 10, mas ganhou <b>1 figurinha</b> para continuar participando.</p>
      <div class="premio-simulado-figurinha">
        <img src="${caminhoFigurinha(f)}" alt="Figurinha ${String(n).padStart(2,'0')}">
        <div>
          <strong>Figurinha ${String(n).padStart(2,'0')}</strong>
          <span>${f ? f.titulo : "Dupla Exclusão"}</span>
          <small>Ela foi enviada para o álbum. Vá ao álbum e clique em colar.</small>
        </div>
      </div>
      <button class="btn" onclick="abrirTela('album')">Ir para o álbum</button>
      <button class="btn" onclick="renderSimulados()">Responder outro simulado</button>
    </div>`;
  }
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

/* ===== MOBILE: ARRASTAR PARA VIRAR PÁGINA ===== */
let touchAlbumInicioX = 0;
let touchAlbumInicioY = 0;
let touchAlbumFimX = 0;
let touchAlbumFimY = 0;
let touchAlbumAtivo = false;

function iniciarSwipeAlbum(e){
  if(!window.matchMedia("(max-width: 760px)").matches) return;
  const telaAlbum = document.getElementById("tela-album");
  if(!telaAlbum || !telaAlbum.classList.contains("ativa")) return;

  const toque = e.changedTouches ? e.changedTouches[0] : e;
  touchAlbumInicioX = toque.clientX;
  touchAlbumInicioY = toque.clientY;
  touchAlbumFimX = toque.clientX;
  touchAlbumFimY = toque.clientY;
  touchAlbumAtivo = true;
}

function moverSwipeAlbum(e){
  if(!touchAlbumAtivo) return;
  const toque = e.changedTouches ? e.changedTouches[0] : e;
  touchAlbumFimX = toque.clientX;
  touchAlbumFimY = toque.clientY;
}

function finalizarSwipeAlbum(e){
  if(!touchAlbumAtivo) return;
  touchAlbumAtivo = false;

  const deltaX = touchAlbumFimX - touchAlbumInicioX;
  const deltaY = touchAlbumFimY - touchAlbumInicioY;

  // Evita trocar página quando o usuário estiver rolando para cima/baixo
  if(Math.abs(deltaY) > Math.abs(deltaX)) return;

  // distância mínima do gesto
  if(Math.abs(deltaX) < 55) return;

  if(deltaX < 0){
    proximaPagina();
  }else{
    paginaAnterior();
  }
}

function ativarSwipeMobileAlbum(){
  const area = document.getElementById("albumPages");
  if(!area || area.dataset.swipeAtivo === "1") return;

  area.dataset.swipeAtivo = "1";
  area.addEventListener("touchstart", iniciarSwipeAlbum, {passive:true});
  area.addEventListener("touchmove", moverSwipeAlbum, {passive:true});
  area.addEventListener("touchend", finalizarSwipeAlbum, {passive:true});
}

function init(){
  atualizarStatus();
  ativarSwipeMobileAlbum();
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
