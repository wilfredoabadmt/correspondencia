ALTER TYPE "role" ADD VALUE 'SUPERADMIN';--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "is_signed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "signed_at" timestamp;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "signed_by_user_id" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "signature_hash" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "verification_code" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_signed_by_user_id_users_id_fk" FOREIGN KEY ("signed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_documents_verification_code" ON "documents" USING btree ("verification_code");