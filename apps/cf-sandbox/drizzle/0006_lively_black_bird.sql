ALTER TABLE "sandboxes" ADD COLUMN "display_name" text;--> statement-breakpoint
ALTER TABLE "sandboxes" ADD CONSTRAINT "sandboxes_uri_unique" UNIQUE("uri");