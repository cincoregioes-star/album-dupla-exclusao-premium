(function(){
  function aplicar(){
    try{
      if(typeof SIMULADOS_TEMA==='undefined'||!Array.isArray(SIMULADOS_TEMA)) return;
      if(window.__DX_SIMULADOS_V13__) return;
      SIMULADOS_TEMA.forEach((sim,s)=>{
        sim.perguntas.forEach((q,i)=>{
          const op=[...q[1]], correta=op[q[2]], rot=(s+i)%4;
          const nova=op.slice(rot).concat(op.slice(0,rot));
          q[1]=nova;q[2]=nova.indexOf(correta);
        });
      });
      window.__DX_SIMULADOS_V13__=true;
    }catch(e){console.warn('Não foi possível redistribuir alternativas',e)}
  }
  if(document.readyState==='complete') aplicar(); else window.addEventListener('load',aplicar);
})();