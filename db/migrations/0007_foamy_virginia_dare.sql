ALTER TABLE "documents" ADD COLUMN "signed_certificate_subject" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "signed_certificate_issuer" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "timestamp_authority" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "timestamped_at" timestamp;