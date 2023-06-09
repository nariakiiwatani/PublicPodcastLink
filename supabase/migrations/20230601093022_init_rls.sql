drop policy "Enable read access for all users" on "public"."related_link";

alter table "public"."channel_shared_with" enable row level security;

alter table "public"."related_link" enable row level security;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.insert_related_link_row()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "public"."related_link" WHERE "channel" = NEW."channel") THEN
        INSERT INTO "public"."related_link" ("channel", "link_url")
        VALUES (NEW."channel",'{}');
    END IF;
    RETURN NEW;
END;
$function$
;

create policy "Authenticated users can insert"
on "public"."channel_shared_with"
as permissive
for insert
to authenticated
with check (true);


create policy "Authenticated users can read"
on "public"."channel_shared_with"
as permissive
for select
to authenticated
using (true);


create policy "No one can delete"
on "public"."channel_shared_with"
as permissive
for delete
to public
using (true);


create policy "Owners or collaborators can update"
on "public"."channel_shared_with"
as permissive
for update
to authenticated
using (((auth.uid() = owner_id) OR ((auth.jwt() ->> 'email'::text) = ANY (shared_with))))
with check (true);


create policy "Enable insert for authenticated users only"
on "public"."related_link"
as permissive
for insert
to authenticated
with check (true);


create policy "Owners and collaborators can update related links"
on "public"."related_link"
as permissive
for update
to public
using (((( SELECT channel_shared_with.owner_id
   FROM channel_shared_with
  WHERE (channel_shared_with.channel = related_link.channel)) = auth.uid()) OR (auth.email() IN ( SELECT unnest(channel_shared_with.shared_with) AS unnest
   FROM channel_shared_with
  WHERE (channel_shared_with.channel = related_link.channel)))));


create policy "all_read"
on "public"."related_link"
as permissive
for select
to public
using (true);


create policy "no_delete"
on "public"."related_link"
as permissive
for delete
to public
using (false);


CREATE TRIGGER trigger_insert_related_link_row AFTER INSERT ON public.channel_shared_with FOR EACH ROW EXECUTE FUNCTION insert_related_link_row();


