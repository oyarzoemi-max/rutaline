-- Ejecutar este SQL en Supabase: Project > SQL Editor > New query > pegar y correr.

create extension if not exists "pgcrypto";

-- Listados confirmados y pagados (lo que se ve en el ranking público)
create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  category text not null,           -- hoteles | cruceros | agencias | tours
  destino text not null,            -- cancun | bali | roma | santorini | ...
  name text not null,
  url text not null,
  blurb text default '',
  bid_cents integer not null default 0,   -- oferta acumulada, en centavos
  clicks integer not null default 0,
  founder boolean not null default false,
  paid_until timestamptz,           -- vence 30 días después del pago
  created_at timestamptz not null default now()
);

create index if not exists idx_listings_cat_dest on listings (category, destino);

-- Ofertas creadas al iniciar el checkout, antes de confirmarse el pago
create table if not exists pending_bids (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  destino text not null,
  name text not null,
  url text not null,
  blurb text default '',
  bid_cents integer not null,
  provider text not null,           -- stripe | mercadopago
  status text not null default 'pending',  -- pending | paid | expired
  listing_id uuid references listings(id),
  created_at timestamptz not null default now()
);

-- Cuenta cuántos negocios "fundadores" hay por categoría+destino (máximo 10)
create or replace function founder_count(p_category text, p_destino text)
returns integer language sql as $$
  select count(*)::int from listings
  where category = p_category and destino = p_destino and founder = true;
$$;
