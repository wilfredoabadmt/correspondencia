CREATE TYPE "document_status" AS ENUM ('Recibido');
--> statement-breakpoint
CREATE TYPE "document_type" AS ENUM ('INF', 'NE', 'NI', 'MEM', 'INS');
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "area_hierarchies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"code" varchar(256) NOT NULL,
	"name" varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "document_sequences" (
	"organization_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"last_sequence" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "document_sequences_organization_id_year_pk" PRIMARY KEY("organization_id","year")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"tracking_code" varchar(256) NOT NULL,
	"document_type" "document_type" NOT NULL,
	"area_hierarchy_id" uuid NOT NULL,
	"subject" text NOT NULL,
	"sender" varchar(256) NOT NULL,
	"reception_date" timestamp with time zone NOT NULL,
	"document_number" varchar(128),
	"status" "document_status" DEFAULT 'Recibido' NOT NULL,
	"attachment_url" varchar(2048),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "area_hierarchies" ADD CONSTRAINT "area_hierarchies_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "document_sequences" ADD CONSTRAINT "document_sequences_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_area_hierarchy_id_area_hierarchies_id_fk" FOREIGN KEY ("area_hierarchy_id") REFERENCES "public"."area_hierarchies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "tracking_code_idx" ON "documents" USING btree ("organization_id","tracking_code");