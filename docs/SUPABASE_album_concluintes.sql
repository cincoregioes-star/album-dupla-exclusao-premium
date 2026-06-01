create table if not exists public.album_concluintes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  escola_bairro text,
  whatsapp text,
  codigo_confirmacao text not null unique,
  total_figurinhas integer default 36,
  album_completo boolean default true,
  premio_entregue boolean default false,
  created_at timestamptz default now()
);

alter table public.album_concluintes enable row level security;

create policy "Permitir inserir concluintes"
on public.album_concluintes
for insert
to anon
with check (true);

create policy "Permitir leitura dos concluintes"
on public.album_concluintes
for select
to anon
using (true);

create policy "Permitir atualizar premio_entregue"
on public.album_concluintes
for update
to anon
using (true)
with check (true);
