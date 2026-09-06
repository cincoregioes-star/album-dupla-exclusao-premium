// ============================================================
// DUPLA EXCLUSÃO — CONFIGURAÇÃO SUPABASE + SINCRONIZAÇÃO V12
// ============================================================
window.SUPABASE_CONFIG = {
  enabled: true,
  url: "https://byajgsbilwiojdowqnlp.supabase.co",
  publishableKey: "sb_publishable_MxqtFZap1Oxbo3L-vYicaA_Fj899LEO",
  anonKey: "sb_publishable_MxqtFZap1Oxbo3L-vYicaA_Fj899LEO",
  table: "album_concluintes",
  premiosDisponiveis: 10,
  totalFigurinhas: 36,
  projeto: "Álbum Dupla Exclusão — Edição Municipal"
};

(function(){
  const CFG = window.SUPABASE_CONFIG;
  const DEVICE_KEY = "dupla_device_id_v12";
  const PROFILE_KEY = "dupla_aluno_perfil_v12";
  const QUEUE_KEY = "dupla_sync_queue_v12";
  let flushRunning = false;
  let lastFingerprint = "";

  function deviceId(){
    let id = localStorage.getItem(DEVICE_KEY);
    if(!id){
      id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : "00000000-0000-4000-8000-" + String(Date.now()).padStart(12,"0").slice(-12);
      localStorage.setItem(DEVICE_KEY,id);
    }
    return id;
  }

  function perfil(){
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"); }
    catch(e){ return {}; }
  }

  function salvarPerfil(p){
    const atual = perfil();
    const novo = {
      nome: String(p.nome || atual.nome || "").trim().slice(0,120),
      escola_bairro: String(p.escola_bairro || atual.escola_bairro || "").trim().slice(0,160),
      turma: String(p.turma || atual.turma || "").trim().slice(0,80)
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(novo));
    atualizarCartaoPerfil();
    queueProgress("perfil");
    return novo;
  }

  function queue(){
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]"); }
    catch(e){ return []; }
  }

  function setQueue(q){
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-300)));
    atualizarStatusSync();
  }

  function enqueue(table,payload){
    const q = queue();
    q.push({id:Date.now()+"-"+Math.random().toString(16).slice(2), table, payload, queued_at:new Date().toISOString()});
    setQueue(q);
    flush();
  }

  async function postRow(table,payload){
    const r = await fetch(`${CFG.url}/rest/v1/${table}`,{
      method:"POST",
      headers:{
        apikey:CFG.publishableKey,
        "Content-Type":"application/json",
        Prefer:"return=minimal"
      },
      body:JSON.stringify(payload)
    });
    if(!r.ok) throw new Error(await r.text());
  }

  async function flush(){
    if(flushRunning || !navigator.onLine || !CFG.enabled) return;
    flushRunning = true;
    try{
      let q = queue();
      while(q.length){
        const item = q[0];
        try{
          await postRow(item.table,item.payload);
          q.shift();
          setQueue(q);
        }catch(e){
          console.warn("Dupla Exclusão: sincronização pendente",e);
          break;
        }
      }
    }finally{
      flushRunning = false;
      atualizarStatusSync();
    }
  }

  function snapshot(){
    if(typeof estado === "undefined" || typeof FIGURINHAS === "undefined" || typeof reg !== "function") return null;
    const p = perfil();
    const coladas = FIGURINHAS.filter(f=>reg(f.numero).colada).length;
    const hist = Array.isArray(estado.historico) ? estado.historico : [];
    const sims = hist.filter(x=>x.tipo === "simulado");
    const ultimo = sims.length ? sims[sims.length-1] : null;
    return {
      device_id:deviceId(),
      nome:p.nome || null,
      escola_bairro:p.escola_bairro || null,
      turma:p.turma || null,
      figurinhas_coladas:coladas,
      pacotes:Number(estado.pacotes || 0),
      repetidas:Number(estado.repetidas || 0),
      simulados_concluidos:sims.length,
      ultimo_simulado:ultimo ? String(ultimo.titulo || "").slice(0,160) : null,
      ultimo_acertos:ultimo && Number.isFinite(Number(ultimo.acertos)) ? Number(ultimo.acertos) : null,
      game_concluido:Boolean(estado.gameConcluido || estado.game_concluido),
      album_completo:coladas === 36
    };
  }

  function queueProgress(reason){
    const s = snapshot();
    if(!s) return;
    const fp = [s.nome,s.escola_bairro,s.turma,s.figurinhas_coladas,s.pacotes,s.repetidas,s.simulados_concluidos,s.ultimo_simulado,s.ultimo_acertos,s.game_concluido,s.album_completo].join("|");
    if(fp === lastFingerprint && reason !== "perfil") return;
    lastFingerprint = fp;
    enqueue("dupla_progresso",s);
  }

  function atualizarStatusSync(){
    const el = document.getElementById("dxSyncStatus");
    if(!el) return;
    const n = queue().length;
    el.textContent = navigator.onLine ? (n ? `Sincronização: ${n} pendente(s)` : "Sincronização: em dia") : `Offline: ${n} pendente(s)`;
  }

  function atualizarCartaoPerfil(){
    const p = perfil();
    const el = document.getElementById("dxPerfilResumo");
    if(el) el.textContent = p.nome ? `${p.nome}${p.turma ? " • "+p.turma : ""}` : "Aluno ainda não identificado";
  }

  function abrirIdentificacao(){
    const p = perfil();
    const html = `
      <div class="ficha-detalhada">
        <button class="ficha-fechar-x" onclick="fecharModal()">×</button>
        <h2>Identificação do aluno</h2>
        <p>Preencha uma vez para permitir que os professores acompanhem a evolução no álbum e nos simulados.</p>
        <div class="form-final">
          <input id="dxNome" placeholder="Nome do aluno" value="${(p.nome||"").replace(/"/g,"&quot;")}">
          <input id="dxEscola" placeholder="Escola" value="${(p.escola_bairro||"").replace(/"/g,"&quot;")}">
          <input id="dxTurma" placeholder="Turma / série" value="${(p.turma||"").replace(/"/g,"&quot;")}">
        </div>
        <button class="btn" onclick="window.dxSalvarIdentificacao()">Salvar identificação</button>
      </div>`;
    if(typeof modal === "function") modal(html);
  }

  window.dxSalvarIdentificacao = function(){
    const nome = document.getElementById("dxNome")?.value.trim() || "";
    if(nome.length < 2){ alert("Digite o nome do aluno."); return; }
    salvarPerfil({
      nome,
      escola_bairro:document.getElementById("dxEscola")?.value || "",
      turma:document.getElementById("dxTurma")?.value || ""
    });
    if(typeof fecharModal === "function") fecharModal();
    flush();
  };

  function instalarInterface(){
    const nav = document.querySelector(".topo nav");
    if(nav && !document.getElementById("dxBtnPerfil")){
      const b = document.createElement("button");
      b.id="dxBtnPerfil";
      b.textContent="Identificar aluno";
      b.onclick=abrirIdentificacao;
      nav.appendChild(b);

      const p = document.createElement("button");
      p.textContent="Painel dos professores";
      p.onclick=()=>window.location.href="professor.html";
      nav.appendChild(p);
    }

    const hero = document.querySelector("#tela-projeto .hero");
    if(hero && !document.getElementById("dxMonitorCard")){
      const box=document.createElement("div");
      box.id="dxMonitorCard";
      box.style.cssText="margin-top:16px;padding:14px 16px;border:1px solid rgba(34,197,94,.35);border-radius:14px;background:rgba(15,23,42,.72);grid-column:1/-1";
      box.innerHTML=`<b>Acompanhamento pedagógico</b><div id="dxPerfilResumo" style="margin-top:5px">Aluno ainda não identificado</div><small id="dxSyncStatus" style="opacity:.8">Sincronização</small>`;
      hero.appendChild(box);
    }
    atualizarCartaoPerfil();
    atualizarStatusSync();
  }

  function protegerPainelLocal(){
    window.carregarConcluintes = async function(){
      const area=document.getElementById("listaConcluintes");
      if(area) area.innerHTML='<div class="quiz-card quiz-card-unico"><h3>Acesso restrito</h3><p>Os dados dos alunos agora são protegidos. Use o painel autenticado dos professores.</p><button class="btn" onclick="window.location.href=\'professor.html\'">Abrir painel dos professores</button></div>';
    };
    window.exportarConcluintes = function(){ window.location.href="professor.html"; };
    window.marcarPremio = function(){ alert("Esta ação está disponível apenas no painel autenticado dos professores."); };
  }

  function substituirConclusao(){
    window.telaConclusao = function(){
      const codigo = estado.codigoConfirmacao || ("DX-"+Date.now().toString().slice(-6));
      estado.codigoConfirmacao=codigo;
      if(typeof salvar === "function") salvar();
      const p=perfil();
      modal(`<div class="conclusao"><h2>Parabéns!</h2><p>Você completou o Álbum Digital Dupla Exclusão.</p><p><b>Código de confirmação:</b> ${codigo}</p><p>A equipe da escola fará a conferência da ordem de conclusão no painel dos professores.</p></div>
      <div class="form-final"><input id="nomeFinal" placeholder="Nome do participante" value="${(p.nome||"").replace(/"/g,"&quot;")}"><input id="escolaFinal" placeholder="Escola" value="${(p.escola_bairro||"").replace(/"/g,"&quot;")}"><input id="turmaFinal" placeholder="Turma / série" value="${(p.turma||"").replace(/"/g,"&quot;")}"></div>
      <button class="btn" onclick="registrarConclusao()">Registrar conclusão</button>`);
    };

    window.registrarConclusao = async function(){
      const nome=document.getElementById("nomeFinal")?.value.trim() || "";
      const escola=document.getElementById("escolaFinal")?.value.trim() || "";
      const turma=document.getElementById("turmaFinal")?.value.trim() || "";
      if(nome.length < 2){ alert("Digite o nome."); return; }
      salvarPerfil({nome,escola_bairro:escola,turma});
      const item={
        nome,
        escola_bairro:[escola,turma].filter(Boolean).join(" • "),
        codigo_confirmacao:estado.codigoConfirmacao,
        total_figurinhas:36,
        album_completo:true,
        premio_entregue:false,
        device_id:deviceId(),
        origem:"album-digital-dupla-exclusao-v12"
      };
      let lista=[];
      try{ lista=JSON.parse(localStorage.getItem("concluintes_local")||"[]"); }catch(e){}
      if(!lista.some(x=>x.codigo_confirmacao===item.codigo_confirmacao)) lista.push({...item,created_at:new Date().toISOString()});
      localStorage.setItem("concluintes_local",JSON.stringify(lista));
      enqueue("album_concluintes",item);
      estado.conclusaoRegistrada=true;
      salvar();
      queueProgress("conclusao");
      modal(`<h2>Conclusão registrada</h2><div class="conclusao"><p><b>Código:</b> ${item.codigo_confirmacao}</p><p><b>Participante:</b> ${nome}</p><p>${navigator.onLine ? "Registro enviado ou em processo de sincronização." : "Registro salvo offline e será enviado automaticamente quando houver internet."}</p><p>A classificação dos 10 primeiros é conferida apenas pela equipe da escola.</p></div><button class="btn" onclick="fecharModal()">Fechar</button>`);
      flush();
    };
  }

  function monitorarSimulados(){
    if(typeof finalizarSimuladoTema !== "function") return;
    const original = finalizarSimuladoTema;
    window.finalizarSimuladoTema = function(){
      let row=null;
      try{
        if(simuladoAtual && Object.keys(respostasSimuladoAtual||{}).length === simuladoAtual.perguntas.length){
          let acertos=0;
          simuladoAtual.perguntas.forEach((q,i)=>{ if(respostasSimuladoAtual[i]===q[2]) acertos++; });
          const p=perfil();
          row={device_id:deviceId(),nome:p.nome||null,escola_bairro:p.escola_bairro||null,turma:p.turma||null,simulado:String(simuladoAtual.titulo).slice(0,160),acertos,total:simuladoAtual.perguntas.length,premio:acertos===10?"1 pacote":"1 figurinha"};
        }
      }catch(e){}
      const ret=original.apply(this,arguments);
      if(row){ enqueue("dupla_simulados_resultados",row); setTimeout(()=>queueProgress("simulado"),0); }
      return ret;
    };
  }

  function monitorarSalvamento(){
    if(typeof salvar !== "function") return;
    const original=salvar;
    window.salvar=function(){
      const ret=original.apply(this,arguments);
      setTimeout(()=>queueProgress("save"),0);
      return ret;
    };
  }

  window.addEventListener("online",flush);
  window.addEventListener("offline",atualizarStatusSync);
  window.addEventListener("load",function(){
    instalarInterface();
    protegerPainelLocal();
    substituirConclusao();
    monitorarSimulados();
    monitorarSalvamento();
    queueProgress("inicio");
    flush();
  });
})();
