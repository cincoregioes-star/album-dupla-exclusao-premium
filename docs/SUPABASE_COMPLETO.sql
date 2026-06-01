-- ============================================================
-- SUPABASE — ÁLBUM DUPLA EXCLUSÃO MUNICIPAL 36 FIGURINHAS
-- Tabela principal: album_concluintes
-- ============================================================

-- Ative a extensão pgcrypto se necessário para gen_random_uuid()
create extension if not exists pgcrypto;

create table if not exists public.album_concluintes (
  id uuid primary key default gen_random_uuid(),

  nome text not null,
  escola_bairro text,
  whatsapp text,

  codigo_confirmacao text not null unique,
  total_figurinhas integer not null default 36,
  album_completo boolean not null default true,

  premio_entregue boolean not null default false,
  posicao_premio integer,
  observacao text,

  user_agent text,
  origem text default 'album-digital',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices úteis
create index if not exists idx_album_concluintes_created_at
on public.album_concluintes(created_at asc);

create index if not exists idx_album_concluintes_premio_entregue
on public.album_concluintes(premio_entregue);

create index if not exists idx_album_concluintes_codigo
on public.album_concluintes(codigo_confirmacao);

-- Atualizar updated_at automaticamente
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_album_concluintes_updated_at on public.album_concluintes;

create trigger trg_album_concluintes_updated_at
before update on public.album_concluintes
for each row
execute function public.set_updated_at();

-- ============================================================
-- RLS
-- ============================================================

alter table public.album_concluintes enable row level security;

-- Permite o álbum inserir concluintes.
drop policy if exists "album_concluintes_insert_public" on public.album_concluintes;
create policy "album_concluintes_insert_public"
on public.album_concluintes
for insert
to anon
with check (
  nome is not null
  and codigo_confirmacao is not null
  and total_figurinhas = 36
  and album_completo = true
);

-- Permite leitura pública para painel de conferência simples.
-- Para evento escolar/local, isso facilita conferir os 10 primeiros.
-- Se quiser proteger depois, remova esta política e crie painel com login.
drop policy if exists "album_concluintes_select_public" on public.album_concluintes;
create policy "album_concluintes_select_public"
on public.album_concluintes
for select
to anon
using (true);

-- Permite marcar prêmio entregue no painel simples do evento.
-- Em produção, ideal proteger com senha/admin.
drop policy if exists "album_concluintes_update_public" on public.album_concluintes;
create policy "album_concluintes_update_public"
on public.album_concluintes
for update
to anon
using (true)
with check (true);

-- ============================================================
-- VIEW: ranking dos concluintes
-- ============================================================

create or replace view public.v_album_ranking as
select
  row_number() over (order by created_at asc) as posicao,
  id,
  nome,
  escola_bairro,
  whatsapp,
  codigo_confirmacao,
  total_figurinhas,
  album_completo,
  premio_entregue,
  case
    when row_number() over (order by created_at asc) <= 10 then true
    else false
  end as entre_10_primeiros,
  created_at
from public.album_concluintes
order by created_at asc;

-- ============================================================
-- FUNÇÃO RPC opcional: listar ranking
-- ============================================================

create or replace function public.listar_album_ranking()
returns table (
  posicao bigint,
  nome text,
  escola_bairro text,
  whatsapp text,
  codigo_confirmacao text,
  premio_entregue boolean,
  entre_10_primeiros boolean,
  created_at timestamptz
)
language sql
security definer
as $$
  select
    posicao,
    nome,
    escola_bairro,
    whatsapp,
    codigo_confirmacao,
    premio_entregue,
    entre_10_primeiros,
    created_at
  from public.v_album_ranking
  order by posicao asc;
$$;
