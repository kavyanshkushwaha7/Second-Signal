-- Prevent a profile from making somebody else's private upload visible.
begin;
alter table public.profiles
  add constraint profiles_avatar_owner check (
    avatar_path is null or split_part(avatar_path, '/', 1) = id::text
  ),
  add constraint profiles_cover_owner check (
    cover_path is null or split_part(cover_path, '/', 1) = id::text
  );
commit;
