CREATE INDEX IF NOT EXISTS "reception_date_idx" ON "documents" ("organization_id","reception_date");
CREATE INDEX IF NOT EXISTS "status_idx" ON "documents" ("organization_id","status");