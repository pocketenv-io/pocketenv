ALTER TABLE "sandboxes" ALTER COLUMN "id" SET DEFAULT sandbox_id();--> statement-breakpoint
ALTER TABLE "sandboxes" ADD COLUMN "repo" text;