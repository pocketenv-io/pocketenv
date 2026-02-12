ALTER TABLE "sandboxes" ADD COLUMN "keep_alive" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "sandboxes" ADD COLUMN "sleep_after" text;