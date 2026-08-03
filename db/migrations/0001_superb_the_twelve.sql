CREATE TABLE IF NOT EXISTS "favorite_recipients" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"target_area_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"alias" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "document_history" ADD COLUMN "from_user_id" text;--> statement-breakpoint
ALTER TABLE "document_history" ADD COLUMN "to_user_id" text;--> statement-breakpoint
ALTER TABLE "document_history" ADD COLUMN "action" text;--> statement-breakpoint
ALTER TABLE "document_history" ADD COLUMN "reception_status" text;--> statement-breakpoint
ALTER TABLE "document_history" ADD COLUMN "received_at" timestamp;--> statement-breakpoint
ALTER TABLE "document_history" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "document_history" ADD COLUMN "justification_reason" text;--> statement-breakpoint
ALTER TABLE "document_history" ADD COLUMN "derivation_type" text;--> statement-breakpoint
ALTER TABLE "document_history" ADD COLUMN "instruction_code" text;--> statement-breakpoint
ALTER TABLE "document_history" ADD COLUMN "is_urgent" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "current_user_id" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "grouped_into_document_id" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "folder_category" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "archive_observations" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "favorite_recipients" ADD CONSTRAINT "favorite_recipients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "favorite_recipients" ADD CONSTRAINT "favorite_recipients_target_area_id_area_hierarchy_id_fk" FOREIGN KEY ("target_area_id") REFERENCES "public"."area_hierarchy"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "favorite_recipients" ADD CONSTRAINT "favorite_recipients_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
