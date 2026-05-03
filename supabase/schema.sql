-- Execute este SQL no Supabase > SQL Editor

-- Tabela de grupos de promoção
create table if not exists grupos_promocao (
  id       uuid default gen_random_uuid() primary key,
  nome     text not null,
  link     text not null,
  ordem    int  not null default 0,
  ativo    boolean default true,
  created_at timestamptz default now()
);

-- Habilitar RLS
alter table grupos_promocao enable row level security;

-- Política: usuários autenticados podem ler e escrever
create policy "usuarios autenticados podem tudo"
  on grupos_promocao
  for all
  to authenticated
  using (true)
  with check (true);

-- Dados iniciais de exemplo (edite depois em Configurações)
insert into grupos_promocao (nome, link, ordem) values
  ('Grupo 01', 'https://seulink.com/01', 1),
  ('Grupo 02', 'https://seulink.com/02', 2),
  ('Grupo 03', 'https://seulink.com/03', 3),
  ('Grupo 04', 'https://seulink.com/04', 4),
  ('Grupo 05', 'https://seulink.com/05', 5),
  ('Grupo 06', 'https://seulink.com/06', 6),
  ('Grupo 07', 'https://seulink.com/07', 7);
