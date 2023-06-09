drop policy "No one can delete" on "public"."channel_shared_with";

drop policy "no_delete" on "public"."related_link";

alter table "public"."playlist" add column "channel" text;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.delete_related_rows()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  DELETE FROM channel_shared_with WHERE channel = OLD.channel;
  DELETE FROM related_link WHERE channel = OLD.channel;
  RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.insert_shared_with_row()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "public"."channel_shared_with" WHERE "channel" = NEW."channel") THEN
        INSERT INTO "public"."channel_shared_with" ("channel", "owner_id", "shared_with")
        VALUES (NEW."channel", auth.uid(), ARRAY[]);
    END IF;
    RETURN NEW;
END;
$function$
;

create policy "anyone delete"
on "public"."channel_shared_with"
as permissive
for delete
to public
using (true);


create policy "anyone delete"
on "public"."related_link"
as permissive
for delete
to public
using (true);


CREATE TRIGGER delete_related_rows_trigger AFTER DELETE ON public.playlist FOR EACH ROW EXECUTE FUNCTION delete_related_rows();

CREATE TRIGGER insert_new_channel_shared_with_row AFTER INSERT ON public.playlist FOR EACH ROW EXECUTE FUNCTION insert_shared_with_row();


drop policy "authenticated users can upload to public folder  v2znwy_0" on "storage"."objects";

drop policy "authenticated users can upload to public folder " on "storage"."objects";

drop policy "Give anon users access to images in public folder" on "storage"."objects";

create policy "authenticated users can upsert v2znwy_0"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'playlist'::text) AND (lower((storage.foldername(name))[1]) = 'thumbnail'::text)));


create policy "authenticated users can upsert v2znwy_1"
on "storage"."objects"
as permissive
for update
to authenticated
using (((bucket_id = 'playlist'::text) AND (lower((storage.foldername(name))[1]) = 'thumbnail'::text)));


create policy "detetion v2znwy_0"
on "storage"."objects"
as permissive
for select
to authenticated
using (((bucket_id = 'playlist'::text) AND (lower((storage.foldername(name))[1]) = 'thumbnail'::text)));


create policy "detetion v2znwy_1"
on "storage"."objects"
as permissive
for delete
to authenticated
using (((bucket_id = 'playlist'::text) AND (lower((storage.foldername(name))[1]) = 'thumbnail'::text)));


create policy "Give anon users access to images in public folder"
on "storage"."objects"
as permissive
for select
to public
using (((bucket_id = 'playlist'::text) AND (lower((storage.foldername(name))[1]) = 'thumbnail'::text) AND (auth.role() = 'anon'::text)));



