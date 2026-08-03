DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('OPERADOR', 'ADMINISTRADOR');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "area_hierarchy" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"organization_id" text NOT NULL,
	"parent_id" text,
	"level" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "document_history" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"from_area_id" text,
	"to_area_id" text NOT NULL,
	"user_id" text NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "document_sequences" (
	"id" text PRIMARY KEY NOT NULL,
	"sequence" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "document_types" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"tracking_id" text,
	"tracking_code" text,
	"subject" text,
	"sender" text,
	"status" text,
	"organization_id" text,
	"reception_date" timestamp,
	"document_type" text,
	"destination_area_id" text,
	"area_hierarchy_id" text,
	"file_key" text,
	"download_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"code" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role_permissions" (
	"role_id" text NOT NULL,
	"permission_id" text NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"organization_id" text NOT NULL,
	"is_system_role" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"organization_id" text,
	"role" text DEFAULT 'OPERADOR',
	"role_id" text,
	"hashed_password" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "area_hierarchy" ADD CONSTRAINT "area_hierarchy_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "area_hierarchy" ADD CONSTRAINT "area_hierarchy_parent_id_area_hierarchy_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."area_hierarchy"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "document_history" ADD CONSTRAINT "document_history_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "document_history" ADD CONSTRAINT "document_history_from_area_id_area_hierarchy_id_fk" FOREIGN KEY ("from_area_id") REFERENCES "public"."area_hierarchy"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "document_history" ADD CONSTRAINT "document_history_to_area_id_area_hierarchy_id_fk" FOREIGN KEY ("to_area_id") REFERENCES "public"."area_hierarchy"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "document_history" ADD CONSTRAINT "document_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_destination_area_id_area_hierarchy_id_fk" FOREIGN KEY ("destination_area_id") REFERENCES "public"."area_hierarchy"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_area_hierarchy_id_area_hierarchy_id_fk" FOREIGN KEY ("area_hierarchy_id") REFERENCES "public"."area_hierarchy"("id") ON DELETE restrict ON UPDATE no action;
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
 ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roles" ADD CONSTRAINT "roles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_area_hierarchy_organization_id" ON "area_hierarchy" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_area_hierarchy_parent_id" ON "area_hierarchy" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_document_history_document_id" ON "document_history" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_document_history_user_id" ON "document_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_documents_organization_id" ON "documents" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_documents_tracking_id" ON "documents" USING btree ("tracking_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_roles_organization_id" ON "roles" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_roles_organization_id_name" ON "roles" USING btree ("organization_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_users_organization_id_email" ON "users" USING btree ("organization_id","email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_organization_id" ON "users" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_role_id" ON "users" USING btree ("role_id");