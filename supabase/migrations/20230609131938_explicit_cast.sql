set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.insert_shared_with_row()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "public"."channel_shared_with" WHERE "channel" = NEW."channel") THEN
        INSERT INTO "public"."channel_shared_with" ("channel", "owner_id", "shared_with")
        VALUES (NEW."channel", auth.uid(), ARRAY[]::text[]);
    END IF;
    RETURN NEW;
END;
$function$
;


