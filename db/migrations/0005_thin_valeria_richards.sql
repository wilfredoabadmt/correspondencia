ALTER TABLE "documents" ADD COLUMN "is_external" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "applicant_identity_document" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "applicant_name" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "applicant_institution" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "applicant_phone" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "applicant_email" text;