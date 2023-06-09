create table "public"."channel_shared_with" (
    "channel" text not null,
    "shared_with" text[] not null,
    "owner_id" uuid not null default auth.uid()
);


create table "public"."related_link" (
    "channel" text not null,
    "link_url" text[] not null,
    "created_at" timestamp with time zone default now()
);


CREATE UNIQUE INDEX channel_shared_with_channel_key ON public.channel_shared_with USING btree (channel);

CREATE UNIQUE INDEX channel_shared_with_pkey ON public.channel_shared_with USING btree (channel);

CREATE UNIQUE INDEX related_link_pkey ON public.related_link USING btree (channel);

CREATE UNIQUE INDEX related_link_rss_url_key ON public.related_link USING btree (channel);

alter table "public"."channel_shared_with" add constraint "channel_shared_with_pkey" PRIMARY KEY using index "channel_shared_with_pkey";

alter table "public"."related_link" add constraint "related_link_pkey" PRIMARY KEY using index "related_link_pkey";

alter table "public"."channel_shared_with" add constraint "channel_shared_with_channel_key" UNIQUE using index "channel_shared_with_channel_key";

alter table "public"."channel_shared_with" add constraint "channel_shared_with_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) not valid;

alter table "public"."channel_shared_with" validate constraint "channel_shared_with_owner_id_fkey";

alter table "public"."related_link" add constraint "related_link_rss_url_key" UNIQUE using index "related_link_rss_url_key";

create policy "Enable read access for all users"
on "public"."related_link"
as permissive
for select
to public
using (true);



