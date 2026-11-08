-- Execute in the Supabase SQL editor in your own project.
create table if not exists public.role_model_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.role_model_states enable row level security;
drop policy if exists "Users own their role model state" on public.role_model_states;
create policy "Users own their role model state" on public.role_model_states
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
-- Photo attachments for the Inbox (same UI as Focus Flow).
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('focus-inbox-images','focus-inbox-images',false,20971520,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
drop policy if exists "Role model user upload" on storage.objects;
create policy "Role model user upload" on storage.objects for insert to authenticated
with check (bucket_id='focus-inbox-images' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists "Role model user read" on storage.objects;
create policy "Role model user read" on storage.objects for select to authenticated
using (bucket_id='focus-inbox-images' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists "Role model user delete" on storage.objects;
create policy "Role model user delete" on storage.objects for delete to authenticated
using (bucket_id='focus-inbox-images' and (storage.foldername(name))[1]=(select auth.uid())::text);
