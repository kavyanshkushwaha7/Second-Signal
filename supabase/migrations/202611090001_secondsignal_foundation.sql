-- SecondSignal foundation. Run ONCE in the connected Supabase project's SQL Editor.
-- Transactional: an error rolls back the whole migration. No demo data is inserted.
begin;

create schema if not exists secondsignal_private;
revoke all on schema secondsignal_private from public;
grant usage on schema secondsignal_private to authenticated;

-- Check the provider's record, not editable user_metadata.
create function secondsignal_private.verified()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists(select 1 from auth.users
    where id = auth.uid() and email_confirmed_at is not null);
$$;
revoke all on function secondsignal_private.verified() from public;
grant execute on function secondsignal_private.verified() to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,30}$'),
  full_name text not null check (char_length(trim(full_name)) between 1 and 100),
  college text not null check (char_length(trim(college)) between 1 and 150),
  campus text not null check (char_length(trim(campus)) between 1 and 150),
  department text not null check (char_length(trim(department)) between 1 and 100),
  year_of_study integer not null check (year_of_study between 1 and 8),
  bio text not null default '' check (char_length(bio) <= 2000),
  avatar_path text,
  cover_path text,
  connect_links jsonb not null default '{}'::jsonb check (jsonb_typeof(connect_links) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Email and password stay in auth.users, never in the public profile.
create table public.profile_private (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  contact_details jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  type text not null check (type in ('normal','sell','giveaway','borrow_request','lend','exchange','want')),
  body text not null default '' check (char_length(body) <= 20000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  storage_path text not null unique,
  media_type text not null check (media_type in ('image','video')),
  mime_type text not null,
  size_bytes bigint not null check (size_bytes between 1 and 52428800),
  position integer not null default 0 check (position between 0 and 9),
  created_at timestamptz not null default now(),
  unique(post_id,position)
);
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null unique references public.posts(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  description text not null default '' check (char_length(description) <= 10000),
  category text not null,
  condition text check (condition in ('New','Like New','Good','Fair','Well Used')),
  price numeric(12,2) check (price >= 0),
  quantity integer not null default 1 check (quantity between 0 and 10000),
  campus text not null,
  pickup_location text not null default '',
  availability text not null default 'available' check (availability in ('available','reserved','unavailable')),
  borrowing_duration text not null default '',
  return_conditions text not null default '',
  desired_exchange text not null default '',
  required_date date,
  available_from date,
  available_to date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (available_to is null or available_from is null or available_to >= available_from)
);
create table public.likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(post_id,user_id)
);
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  parent_id uuid,
  body text not null check (char_length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now(),
  unique(id,post_id),
  foreign key(parent_id,post_id) references public.comments(id,post_id) on delete cascade
);
create table public.follows (
  follower_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(follower_id,following_id),
  check (follower_id <> following_id)
);
create table public.saved_posts (
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id,post_id)
);
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_a uuid not null references public.profiles(id) on delete cascade,
  participant_b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(participant_a,participant_b),
  check (participant_a < participant_b)
);
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  body text not null default '' check (char_length(body) <= 10000),
  listing_id uuid references public.listings(id) on delete set null,
  created_at timestamptz not null default now()
);
create table public.conversation_reads (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key(conversation_id,user_id)
);
create table public.requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  requester_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  message text not null default '' check (char_length(message) <= 4000),
  status text not null default 'pending' check (status in ('pending','accepted','rejected','cancelled','completed')),
  requester_confirmed boolean not null default false,
  owner_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> owner_id),
  check (status <> 'completed' or (requester_confirmed and owner_confirmed))
);
create unique index requests_one_active on public.requests(listing_id,requester_id)
  where status in ('pending','accepted');
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  author_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  subject_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  body text not null default '' check (char_length(body) <= 4000),
  created_at timestamptz not null default now(),
  unique(request_id,author_id),
  check (author_id <> subject_id)
);
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  reason text not null check (char_length(trim(reason)) between 1 and 2000),
  created_at timestamptz not null default now(),
  unique(reporter_id,post_id)
);

create index posts_feed_idx on public.posts(created_at desc);
create index posts_author_idx on public.posts(author_id,created_at desc);
create index listings_campus_idx on public.listings(campus,category,created_at desc);
create index comments_post_idx on public.comments(post_id,created_at);
create index follows_target_idx on public.follows(following_id);
create index conversations_b_idx on public.conversations(participant_b);
create index messages_history_idx on public.messages(conversation_id,created_at);
create index requests_owner_idx on public.requests(owner_id,created_at desc);
create index requests_requester_idx on public.requests(requester_id,created_at desc);
create index notifications_inbox_idx on public.notifications(recipient_id,created_at desc);
create index reviews_subject_idx on public.reviews(subject_id);

-- Explicit grants: API defaults must not accidentally expose a table.
do $$ declare t text; begin
  foreach t in array array['profiles','profile_private','posts','post_media','listings','likes','comments',
    'follows','saved_posts','conversations','messages','conversation_reads','requests','notifications','reviews','reports']
  loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from anon, authenticated',t);
    execute format('grant select on public.%I to authenticated',t);
    -- Restrictive guard applies in addition to every row-level policy.
    execute format('create policy verified_only on public.%I as restrictive for all to authenticated using (secondsignal_private.verified()) with check (secondsignal_private.verified())',t);
  end loop;
end $$;

grant insert(id,username,full_name,college,campus,department,year_of_study,bio,avatar_path,cover_path,connect_links),
  update(username,full_name,college,campus,department,year_of_study,bio,avatar_path,cover_path,connect_links)
  on public.profiles to authenticated;
create policy profiles_read on public.profiles for select to authenticated using (true);
create policy profiles_create on public.profiles for insert to authenticated with check (id = auth.uid());
create policy profiles_edit on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
grant insert(user_id,contact_details,settings),update(contact_details,settings) on public.profile_private to authenticated;
create policy private_own on public.profile_private for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

grant insert(author_id,type,body),update(type,body),delete on public.posts to authenticated;
create policy posts_read on public.posts for select to authenticated using (true);
create policy posts_write on public.posts for all to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
grant insert(post_id,storage_path,media_type,mime_type,size_bytes,position),delete on public.post_media to authenticated;
create policy media_read on public.post_media for select to authenticated using (true);
create policy media_write on public.post_media for all to authenticated
  using (exists(select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid()))
  with check (split_part(storage_path,'/',1) = auth.uid()::text
    and exists(select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid()));
grant insert(post_id,title,description,category,condition,price,quantity,campus,pickup_location,availability,
  borrowing_duration,return_conditions,desired_exchange,required_date,available_from,available_to),
  update(title,description,category,condition,price,quantity,campus,pickup_location,availability,
  borrowing_duration,return_conditions,desired_exchange,required_date,available_from,available_to),
  delete on public.listings to authenticated;
create policy listings_read on public.listings for select to authenticated using (true);
create policy listings_write on public.listings for all to authenticated
  using (exists(select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid()))
  with check (exists(select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid() and p.type <> 'normal'));

grant insert(post_id,user_id),delete on public.likes to authenticated;
create policy likes_read on public.likes for select to authenticated using (true);
create policy likes_own on public.likes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
grant insert(post_id,author_id,parent_id,body),delete on public.comments to authenticated;
create policy comments_read on public.comments for select to authenticated using (true);
create policy comments_own on public.comments for all to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
grant insert(follower_id,following_id),delete on public.follows to authenticated;
create policy follows_read on public.follows for select to authenticated using (true);
create policy follows_own on public.follows for all to authenticated using (follower_id = auth.uid()) with check (follower_id = auth.uid());
grant insert(user_id,post_id),delete on public.saved_posts to authenticated;
create policy saved_own on public.saved_posts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

grant insert(participant_a,participant_b) on public.conversations to authenticated;
create policy conversations_member on public.conversations for all to authenticated
  using (auth.uid() in (participant_a,participant_b))
  with check (auth.uid() in (participant_a,participant_b));
grant insert(conversation_id,sender_id,body,listing_id) on public.messages to authenticated;
create policy messages_read on public.messages for select to authenticated
  using (exists(select 1 from public.conversations c where c.id = conversation_id and auth.uid() in (c.participant_a,c.participant_b)));
create policy messages_send on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and (length(trim(body)) > 0 or listing_id is not null)
    and exists(select 1 from public.conversations c where c.id = conversation_id and auth.uid() in (c.participant_a,c.participant_b)));
grant insert(conversation_id,user_id),update(read_at) on public.conversation_reads to authenticated;
create policy reads_own on public.conversation_reads for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and exists(select 1 from public.conversations c
    where c.id = conversation_id and auth.uid() in (c.participant_a,c.participant_b)));

-- Requests and notifications are written ONLY by trusted database functions.
-- Phase 5 will add atomic request transitions and event triggers; until then
-- these tables are deliberately read-only, not simulated working workflows.
create policy requests_participant on public.requests for select to authenticated
  using (auth.uid() in (requester_id,owner_id));
grant update(read_at) on public.notifications to authenticated;
create policy notifications_own on public.notifications for all to authenticated
  using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());
grant insert(request_id,author_id,subject_id,rating,body) on public.reviews to authenticated;
create policy reviews_read on public.reviews for select to authenticated using (true);
create policy reviews_completed on public.reviews for insert to authenticated
  with check (author_id = auth.uid() and exists(select 1 from public.requests r where r.id = request_id
    and r.status = 'completed' and r.requester_confirmed and r.owner_confirmed
    and ((r.requester_id = auth.uid() and r.owner_id = subject_id)
      or (r.owner_id = auth.uid() and r.requester_id = subject_id))));
grant insert(reporter_id,post_id,reason) on public.reports to authenticated;
create policy reports_own on public.reports for all to authenticated using (reporter_id = auth.uid()) with check (reporter_id = auth.uid());

create function secondsignal_private.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
revoke all on function secondsignal_private.touch_updated_at() from public;
create trigger profiles_updated before update on public.profiles for each row execute function secondsignal_private.touch_updated_at();
create trigger posts_updated before update on public.posts for each row execute function secondsignal_private.touch_updated_at();
create trigger listings_updated before update on public.listings for each row execute function secondsignal_private.touch_updated_at();
create trigger requests_updated before update on public.requests for each row execute function secondsignal_private.touch_updated_at();

-- Private buckets: clients must request short-lived signed URLs under RLS.
-- Never store file bytes or base64 blobs in database rows.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
  ('secondsignal-avatars','secondsignal-avatars',false,5242880,array['image/jpeg','image/png','image/webp']),
  ('secondsignal-media','secondsignal-media',false,52428800,array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']);
create policy secondsignal_storage_upload on storage.objects for insert to authenticated
  with check (bucket_id in ('secondsignal-avatars','secondsignal-media')
    and secondsignal_private.verified() and (storage.foldername(name))[1] = auth.uid()::text);
create policy secondsignal_storage_delete on storage.objects for delete to authenticated
  using (bucket_id in ('secondsignal-avatars','secondsignal-media')
    and secondsignal_private.verified() and (storage.foldername(name))[1] = auth.uid()::text);
create policy secondsignal_storage_read on storage.objects for select to authenticated
  using (secondsignal_private.verified() and (
    (bucket_id in ('secondsignal-avatars','secondsignal-media') and (storage.foldername(name))[1] = auth.uid()::text)
    or (bucket_id = 'secondsignal-avatars' and exists(select 1 from public.profiles p where p.avatar_path = name or p.cover_path = name))
    or (bucket_id = 'secondsignal-media' and exists(select 1 from public.post_media m where m.storage_path = name))
  ));

-- Supabase Realtime checks SELECT policies for each subscriber.
do $$ declare t text; begin
  foreach t in array array['posts','messages','requests','notifications','likes','comments','follows']
  loop
    if not exists(select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I',t);
    end if;
  end loop;
end $$;

commit;
