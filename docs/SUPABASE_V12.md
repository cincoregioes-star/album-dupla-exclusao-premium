# Dupla Exclusão — Supabase V12

Integração criada para o projeto `album-dupla-exclusao-premium` usando o projeto Supabase `sistema-matriz-educacional`.

## Estrutura criada

- `dupla_professores`: autorização do painel pedagógico.
- `dupla_progresso`: snapshots do progresso do aluno.
- `dupla_simulados_resultados`: resultados individuais dos simulados.
- `album_concluintes`: registro dos alunos que concluíram as 36 figurinhas.

## Segurança

- RLS ativado nas quatro tabelas.
- Alunos anônimos podem apenas inserir progresso/resultados/conclusão.
- Leitura dos dados é restrita a usuários autenticados presentes em `dupla_professores`.
- Entrega de prêmio só pode ser alterada por professor autorizado.
- Não é armazenado WhatsApp no novo fluxo V12.
- A chave usada no front-end é somente a chave publicável do Supabase.

## Offline

O álbum continua funcionando por `localStorage`.
Eventos destinados ao Supabase entram em uma fila local (`dupla_sync_queue_v12`).
Quando a internet volta, o navegador tenta sincronizar automaticamente.

## Painel

Página: `professor.html`

Exibe:
- alunos monitorados;
- quantidade de simulados;
- álbuns concluídos;
- média geral;
- progresso individual;
- resultados dos simulados;
- ranking de concluintes;
- marcação de prêmio entregue;
- exportação CSV.

## Estado desta branch

Branch de implementação: `supabase-v12`.
A branch `main` foi mantida intacta durante a preparação e validação.
