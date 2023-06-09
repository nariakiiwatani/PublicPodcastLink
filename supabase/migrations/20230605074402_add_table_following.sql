create table "public"."following" (
    "user_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "channels" text[] not null default '{}'::text[]
);


alter table "public"."following" enable row level security;

CREATE UNIQUE INDEX following_pkey ON public.following USING btree (user_id);

alter table "public"."following" add constraint "following_pkey" PRIMARY KEY using index "following_pkey";

alter table "public"."following" add constraint "following_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."following" validate constraint "following_user_id_fkey";

create policy "Enable insert for authenticated users only"
on "public"."following"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access for owner"
on "public"."following"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Enable update for users based on user_id"
on "public"."following"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



