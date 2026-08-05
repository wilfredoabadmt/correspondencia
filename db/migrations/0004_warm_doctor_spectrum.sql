CREATE TABLE IF NOT EXISTS "cite_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"area_id" text,
	"document_type" text,
	"format_pattern" text NOT NULL,
	"current_sequence" integer DEFAULT 0 NOT NULL,
	"year" integer NOT NULL,
	"reset_yearly" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cite_configs" ADD CONSTRAINT "cite_configs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cite_configs" ADD CONSTRAINT "cite_configs_area_id_area_hierarchy_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."area_hierarchy"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cite_configs_organization_id" ON "cite_configs" USING btree ("organization_id");