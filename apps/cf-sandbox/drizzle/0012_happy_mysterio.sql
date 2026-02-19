ALTER TABLE "sandboxes" ADD COLUMN "cid" text;--> statement-breakpoint
ALTER TABLE "sandboxes" ADD CONSTRAINT "sandboxes_cid_unique" UNIQUE("cid");