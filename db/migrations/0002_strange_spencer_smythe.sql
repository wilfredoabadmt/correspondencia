CREATE TABLE IF NOT EXISTS "expedientes" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"subject" text NOT NULL,
	"status" text DEFAULT 'Abierto' NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "expediente_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "expedientes" ADD CONSTRAINT "expedientes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_expedientes_organization_id" ON "expedientes" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_expedientes_code_org_id" ON "expedientes" USING btree ("code","organization_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_expediente_id_expedientes_id_fk" FOREIGN KEY ("expediente_id") REFERENCES "public"."expedientes"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_documents_expediente_id" ON "documents" USING btree ("expediente_id");