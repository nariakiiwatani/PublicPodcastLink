create policy "Give anon users access to images in public folder"
on "storage"."objects"
as permissive
for select
to public
using (((bucket_id = 'playlist-thumbnails'::text) AND (lower((storage.foldername(name))[1]) = 'public'::text) AND (auth.role() = 'anon'::text)));


create policy "authenticated users can upload to public folder  v2znwy_0"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'playlist'::text) AND (lower((storage.foldername(name))[1]) = 'thumbnail'::text)));


create policy "authenticated users can upload to public folder "
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'playlist-thumbnails'::text) AND (lower((storage.foldername(name))[1]) = 'public'::text)));



