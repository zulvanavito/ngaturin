-- Create the explicitly public 'avatars' bucket if it doesn't already exist
insert into storage.buckets (id, name, public)
select 'avatars', 'avatars', true
where not exists (
  select 1 from storage.buckets where id = 'avatars'
);

-- Policy to allow anyone to read avatars (publicly viewable)
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Policy to allow authenticated users to upload an avatar
create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

-- Policy to allow users to update their own avatar
create policy "Users can update their own avatar."
  on storage.objects for update
  using ( auth.uid() = owner )
  with check ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

-- Policy to allow users to delete their own avatar
create policy "Users can delete their own avatar."
  on storage.objects for delete
  using ( bucket_id = 'avatars' AND auth.uid() = owner );
