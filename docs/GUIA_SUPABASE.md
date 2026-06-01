# GUIA RÁPIDO — SUPABASE DO ÁLBUM DUPLA EXCLUSÃO

## 1. Criar projeto
Entre no Supabase e crie um projeto novo.

## 2. Rodar SQL
No Supabase:
SQL Editor → New Query

Cole o conteúdo do arquivo:

supabase/SUPABASE_COMPLETO.sql

Clique em Run.

## 3. Copiar dados da API
No Supabase:
Project Settings → API

Copie:
- Project URL
- anon public key

## 4. Configurar no álbum
Abra o arquivo:

supabase-config.js

Troque:

enabled: false

por:

enabled: true

Depois cole:
- url
- anonKey

## 5. Testar
Abra o álbum, complete as 36 figurinhas e registre a conclusão.

Depois veja no Supabase:
Table Editor → album_concluintes

## 6. Painel de conferência
No álbum, clique em:

Concluintes

Ele lista:
- ordem de chegada
- nome
- escola/bairro
- WhatsApp
- código
- se está entre os 10 primeiros
- botão para marcar prêmio entregue

## Observação
Nesta versão, o painel é simples para feira/evento. Para uso público maior, depois podemos proteger o painel com senha.
