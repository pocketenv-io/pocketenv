CREATE OR REPLACE FUNCTION file_id()
RETURNS text AS $$
SELECT 'file_' || xata_private.xid();
$$ LANGUAGE sql IMMUTABLE;

DROP INDEX "unique_sandbox_file";--> statement-breakpoint
DROP INDEX "unique_sandbox_secret";--> statement-breakpoint
DROP INDEX "unique_sandbox_variables";--> statement-breakpoint
ALTER TABLE "sandbox_files" ALTER COLUMN "id" SET DEFAULT file_id();--> statement-breakpoint
ALTER TABLE "sandbox_volumes" ALTER COLUMN "id" SET DEFAULT volume_id();
