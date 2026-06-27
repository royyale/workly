-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query)
-- Creates the 3 tables the app needs for Day 1-4 of the sprint.

create table if not exists businesses (
  id text primary key,              -- short slug, e.g. 'luxe-studio'
  name text not null,
  type text,                        -- salon, restaurant, gym, retail, realestate, service
  services jsonb default '[]',      -- [{ "name": "Haircut", "price": "$45", "duration": "45 min" }]
  hours jsonb default '[]',         -- [{ "day": "Mon-Fri", "time": "9am-7pm" }]
  booking_url text,                 -- Calendly link, added Day 3
  created_at timestamp with time zone default now()
);

create table if not exists conversations (
  id bigint generated always as identity primary key,
  business_id text references businesses(id) on delete cascade,
  visitor_name text,
  visitor_contact text,
  user_message text,
  bot_reply text,
  created_at timestamp with time zone default now()
);

create table if not exists leads (
  id bigint generated always as identity primary key,
  business_id text references businesses(id) on delete cascade,
  name text,
  contact text,            -- phone or email
  note text,
  status text default 'new',  -- new, booked, contacted
  created_at timestamp with time zone default now()
);

-- Seed one demo business so Day 1's test page (businessId "demo") works immediately.
insert into businesses (id, name, type, services, hours, booking_url)
values (
  'demo',
  'Luxe Studio',
  'salon',
  '[{"name":"Haircut & style","price":"$45-$65","duration":"45 min"},
    {"name":"Color & balayage","price":"$120-$220","duration":"2-3 hrs"}]',
  '[{"day":"Mon-Fri","time":"9am-7pm"},{"day":"Sat","time":"9am-5pm"},{"day":"Sun","time":"Closed"}]',
  'https://calendly.com/your-link'
)
on conflict (id) do nothing;
