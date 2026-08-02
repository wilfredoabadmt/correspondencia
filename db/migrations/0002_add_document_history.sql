CREATE TABLE IF NOT EXISTS "document_history" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"from_area_id" text,
	"to_area_id" text NOT NULL,
	"user_id" text NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "document_history" ADD CONSTRAINT "document_history_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "document_history" ADD CONSTRAINT "document_history_from_area_id_area_hierarchy_id_fk" FOREIGN KEY ("from_area_id") REFERENCES "public"."area_hierarchy"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "document_history" ADD CONSTRAINT "document_history_to_area_id_area_hierarchy_id_fk" FOREIGN KEY ("to_area_id") REFERENCES "public"."area_hierarchy"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "document_history" ADD CONSTRAINT "document_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;