ALTER TABLE "sandboxes" ALTER COLUMN "base" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sandboxes" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sandboxes" ALTER COLUMN "instance_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sandboxes" ADD COLUMN "uri" text;--> statement-breakpoint
ALTER TABLE "sandboxes" ADD COLUMN "logo" text;--> statement-breakpoint
ALTER TABLE "sandboxes" ADD COLUMN "vcpus" integer;--> statement-breakpoint
ALTER TABLE "sandboxes" ADD COLUMN "memory" integer;--> statement-breakpoint
ALTER TABLE "sandboxes" ADD COLUMN "disk" integer;