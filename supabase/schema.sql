-- La Viennoise à Bulle — Schéma Supabase
-- À exécuter dans le SQL Editor de votre projet Supabase

-- Clients (identifiés par numéro de téléphone)
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  boissons_total integer not null default 0,
  boissons_depuis_derniere_roue integer not null default 0,
  tours_disponibles integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Configuration de la roue (une seule ligne, id = 'default')
create table if not exists roue_config (
  id text primary key default 'default',
  seuil_boissons integer not null default 5,
  lots jsonb not null default '[
    {"id":"1","label":"Rien cette fois","valeur":"","probabilite":40,"couleur":"#7C2D3E"},
    {"id":"2","label":"10% de réduction","valeur":"10%","probabilite":25,"couleur":"#D4A847"},
    {"id":"3","label":"15% de réduction","valeur":"15%","probabilite":15,"couleur":"#A87C2A"},
    {"id":"4","label":"Shot offert","valeur":"shot","probabilite":12,"couleur":"#E8671C"},
    {"id":"5","label":"Boisson offerte","valeur":"boisson","probabilite":6,"couleur":"#9E3D52"},
    {"id":"6","label":"Jackpot !","valeur":"jackpot","probabilite":2,"couleur":"#E8C876"}
  ]'::jsonb,
  updated_at timestamptz not null default now()
);

insert into roue_config (id) values ('default') on conflict do nothing;

-- Gains (résultats de la roue)
create table if not exists gains (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  lot_label text not null,
  lot_valeur text not null,
  statut text not null default 'en_attente' check (statut in ('en_attente','valide','refuse')),
  created_at timestamptz not null default now(),
  valide_at timestamptz
);

-- Événements
create table if not exists evenements (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  type text not null default 'scene_ouverte' check (type in ('karaoke','scene_ouverte','autre')),
  date date not null,
  heure time not null default '20:00',
  description text,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

-- Inscriptions scène ouverte
create table if not exists inscriptions (
  id uuid primary key default gen_random_uuid(),
  evenement_id uuid not null references evenements(id) on delete cascade,
  nom text not null,
  instrument text,
  commentaire text,
  phone text,
  created_at timestamptz not null default now()
);

-- Votes (applaudissements)
create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  evenement_id uuid not null references evenements(id) on delete cascade,
  inscription_id uuid not null references inscriptions(id) on delete cascade,
  session_id text not null,
  created_at timestamptz not null default now(),
  unique (inscription_id, session_id)
);

-- RLS (Row Level Security) — tout public en lecture, écriture via service role
alter table clients enable row level security;
alter table roue_config enable row level security;
alter table gains enable row level security;
alter table evenements enable row level security;
alter table inscriptions enable row level security;
alter table votes enable row level security;

-- Policies permissives (API route côté serveur gère la sécurité)
create policy "public_read_clients" on clients for select using (true);
create policy "public_insert_clients" on clients for insert with check (true);
create policy "public_update_clients" on clients for update using (true);

create policy "public_read_roue_config" on roue_config for select using (true);
create policy "public_update_roue_config" on roue_config for update using (true);

create policy "public_read_gains" on gains for select using (true);
create policy "public_insert_gains" on gains for insert with check (true);
create policy "public_update_gains" on gains for update using (true);

create policy "public_read_evenements" on evenements for select using (true);
create policy "public_all_evenements" on evenements for all using (true);

create policy "public_read_inscriptions" on inscriptions for select using (true);
create policy "public_insert_inscriptions" on inscriptions for insert with check (true);

create policy "public_read_votes" on votes for select using (true);
create policy "public_insert_votes" on votes for insert with check (true);
create policy "public_delete_votes" on votes for delete using (true);
