create table "public"."playlist" (
    "id" uuid not null default uuid_generate_v4(),
    "alias" text not null,
    "created_by" uuid default auth.uid(),
    "rss" text not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."playlist" enable row level security;

CREATE UNIQUE INDEX playlist_alias_key ON public.playlist USING btree (alias);

CREATE UNIQUE INDEX playlist_pkey ON public.playlist USING btree (id);

alter table "public"."playlist" add constraint "playlist_pkey" PRIMARY KEY using index "playlist_pkey";

alter table "public"."playlist" add constraint "playlist_alias_key" UNIQUE using index "playlist_alias_key";

alter table "public"."playlist" add constraint "playlist_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."playlist" validate constraint "playlist_created_by_fkey";

create policy "Enable delete for users based on user_id"
on "public"."playlist"
as permissive
for delete
to public
using ((auth.uid() = created_by));


create policy "Enable insert for authenticated users only"
on "public"."playlist"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."playlist"
as permissive
for select
to public
using (true);


create policy "Enable update for users based on email"
on "public"."playlist"
as permissive
for update
to public
using ((auth.uid() = created_by))
with check ((auth.uid() = created_by));



