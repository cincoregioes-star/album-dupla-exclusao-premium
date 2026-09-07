# Dupla Exclusão v13 — Checklist de evolução pedagógica

## Solicitações do Prof. Cleilson

1. **Vídeos curtos — IMPLEMENTADO**
   - Área “Vídeos” com quatro pílulas visuais curtas e offline.
   - Temas: racismo, capacitismo, bullying/discriminação e inclusão.
   - Conclusão de cada pílula pode liberar uma figurinha uma única vez.
   - Estrutura preparada para receber arquivos MP4 curtos posteriormente.

2. **Reiniciar todo o projeto — IMPLEMENTADO POR CICLOS**
   - Painel do professor: “Encerrar ciclo / Novo ciclo”.
   - O histórico anterior é preservado para relatórios.
   - Quando o aparelho do aluno volta a sincronizar e detecta um novo ciclo, reinicia álbum, simulados, pesquisas e missões localmente.
   - Um aparelho que permaneça totalmente offline só recebe a ordem de reinício quando voltar a ter conexão.

3. **Pesquisa 2 diferente da Pesquisa 1 — IMPLEMENTADO**
   - Pesquisa 1 = diagnóstico inicial.
   - Pesquisa 2 = avaliação final de aprendizagem, mudança de percepção e metodologia.

4. **Perguntas sobre cotidiano escolar — IMPLEMENTADO**
   - Presenciou racismo.
   - Presenciou capacitismo.
   - Participou de apelido/comentário/atitude ofensiva.
   - Presencia comentários preconceituosos em casa, rua ou grupos de convivência.
   - Dados são enviados sem nome e exibidos agregadamente no dashboard.

5. **Imagem final dos games relacionada ao tema — IMPLEMENTADO**
   - Tela final “Painel de Direitos — Escola que inclui”.
   - Referências pedagógicas a LBI (Lei 13.146/2015), Lei 7.716/1989 e Lei 13.185/2015.
   - Reflexão final com compromisso de atitude.

6. **Android e iOS — IMPLEMENTADO COMO PWA**
   - Manifest + Service Worker.
   - Android/Chrome/Edge: opção de instalar/adicionar à tela inicial.
   - iPhone/iPad: Compartilhar → Adicionar à Tela de Início.
   - Arquivos principais, figurinhas e game são mantidos em cache para uso offline após carregamento inicial.

7. **Liberar Pesquisa 2 — IMPLEMENTADO**
   - Professor autenticado possui botão Liberar/Bloquear Pesquisa 2 no painel.
   - Aluno vê a Pesquisa 2 bloqueada até autorização.

8. **Mais formas de ganhar figurinhas — IMPLEMENTADO**
   - Simulados.
   - Game.
   - Pesquisa inicial/final.
   - Pílulas visuais/vídeos.
   - Missões complementares.
   - Desafio final.

9. **Aluno terminou simulados mas não completou o álbum — IMPLEMENTADO**
   - Após 5 simulados diferentes, se ainda houver lacunas, libera a “Missão Resgate”.
   - Desempenho suficiente libera até 5 figurinhas faltantes por tentativa, priorizando o fechamento do álbum.

10. **Função pedagógica dos jogos — IMPLEMENTADO**
   - Cada fase recebe um objetivo pedagógico explícito: reconhecer exclusão, remover barreiras, agir com respeito, construir escola inclusiva e consolidar direitos/compromisso.

11. **Ganhar figurinhas/gamificação pelos games — IMPLEMENTADO**
   - Mantidas as recompensas já existentes do game e acrescentado registro da atividade no Supabase.

12. **Manter reflexão ao clicar na figurinha — IMPLEMENTADO E AMPLIADO**
   - Mantém mensagem central, importância e reflexão.
   - Acrescenta direito/lei relacionada e pergunta prática de reflexão.

## Melhorias adicionais da v13

### Dashboard “Impacto do Projeto — Antes x Depois”
Compara Pesquisa 1 x Pesquisa 2 nos indicadores:
- reconhecimento do capacitismo;
- identificação do racismo;
- capacidade de agir diante da discriminação;
- compreensão da acessibilidade;
- conhecimento de direitos.

### Avaliação da metodologia
A Pesquisa 2 mede separadamente a percepção sobre:
- álbum e reflexões;
- simulados;
- games;
- vídeos/pílulas;
- mudança de percepção.

### Diagnóstico agregado do cotidiano
O painel mostra médias agregadas das questões sensíveis, sem exibir o nome do aluno na pesquisa.

### Ciclos pedagógicos
Permite repetir o projeto com outra turma ou em outro período sem apagar a evidência histórica do ciclo anterior.

### Correção do padrão de gabarito
As alternativas corretas dos simulados deixam de ficar concentradas na letra A; a v13 redistribui automaticamente as respostas corretas entre A, B, C e D sem alterar o conteúdo.

### Segurança
- Pesquisa/atividade: aluno anônimo pode apenas enviar dados.
- Leitura das pesquisas e atividades: somente professor autorizado e autenticado.
- Aluno anônimo visualiza apenas o ciclo ativo e se a Pesquisa 2 está liberada.
- Não há armazenamento de WhatsApp no fluxo v13.
