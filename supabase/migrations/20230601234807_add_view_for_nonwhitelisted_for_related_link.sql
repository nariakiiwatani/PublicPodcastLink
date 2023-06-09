create sequence "public"."whitelist_id_seq";

create table "public"."whitelist" (
    "pattern" text,
    "id" integer not null default nextval('whitelist_id_seq'::regclass)
);


alter table "public"."whitelist" enable row level security;

alter sequence "public"."whitelist_id_seq" owned by "public"."whitelist"."id";

CREATE UNIQUE INDEX whitelist_pkey ON public.whitelist USING btree (id);

alter table "public"."whitelist" add constraint "whitelist_pkey" PRIMARY KEY using index "whitelist_pkey";

create or replace view "public"."non_whitelisted_urls" as  SELECT rl.channel,
    unnested_url.unnested_url
   FROM related_link rl,
    LATERAL unnest(rl.link_url) unnested_url(unnested_url)
  WHERE (NOT (EXISTS ( SELECT 1
           FROM whitelist w
          WHERE (unnested_url.unnested_url ~ w.pattern))));



