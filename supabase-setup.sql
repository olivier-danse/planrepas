-- ═══════════════════════════════════════════════════════
-- PlanRepas — Setup Supabase
-- Colle ce script dans Supabase > SQL Editor > Run
-- ═══════════════════════════════════════════════════════

-- Table des entrées de repas
create table if not exists meal_entries (
  id uuid default gen_random_uuid() primary key,
  date text not null,
  slot text not null check (slot in ('midi', 'soir')),
  person_id text not null,
  status text not null check (status in ('absent', 'present', 'gamelle')),
  updated_at timestamptz default now(),
  constraint meal_entries_unique unique (date, slot, person_id)
);

-- Table des marqueurs "courses faites"
create table if not exists grocery_done_marks (
  id uuid default gen_random_uuid() primary key,
  date text not null unique,
  marked_at timestamptz default now()
);

-- Table de configuration (singleton)
create table if not exists app_config (
  id integer primary key default 1,
  persons jsonb not null default '[{"id":"amande","name":"Amande","color":"#e07a5f","order":0},{"id":"isma","name":"Isma","color":"#3d5a80","order":1}]',
  lock_hours_before integer not null default 24,
  constraint single_row check (id = 1)
);

-- Config par défaut
insert into app_config (id, persons, lock_hours_before)
values (1, '[{"id":"amande","name":"Amande","color":"#e07a5f","order":0},{"id":"isma","name":"Isma","color":"#3d5a80","order":1}]', 24)
on conflict (id) do nothing;

-- Désactiver RLS (app domestique, pas de multi-utilisateur)
alter table meal_entries disable row level security;
alter table grocery_done_marks disable row level security;
alter table app_config disable row level security;

-- Activer la réplication temps réel
alter publication supabase_realtime add table meal_entries;
alter publication supabase_realtime add table grocery_done_marks;
alter publication supabase_realtime add table app_config;
